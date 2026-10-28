import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function getCycleInfo(profile) {
  const cycleLength = profile.cycle_avg_length || 28;
  const periodLength = profile.period_length || 5;
  if (!profile.last_period_start_date) {
    return { phase: 'any' };
  }
  const today = new Date();
  const last = new Date(profile.last_period_start_date);
  const daysSince = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  const cycleDay = ((daysSince % cycleLength) + cycleLength) % cycleLength + 1;
  if (cycleDay <= periodLength) return { phase: 'menstrual' };
  if (cycleDay <= 13) return { phase: 'follicular' };
  if (cycleDay <= 16) return { phase: 'ovulatory' };
  return { phase: 'luteal' };
}

function routeForContent(record) {
  return `/ContentPlayer?id=${record.id}`;
}

function routeForProgram(program) {
  return `/ProgramDetail?key=${program.program_key}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const today = new Date().toISOString().split('T')[0];
    const profiles = await base44.asServiceRole.entities.UserProfile.list();
    const allContent = await base44.asServiceRole.entities.ContentItems.list();
    const allPrograms = await base44.asServiceRole.entities.Programs.list();
    // This published source pool is shared by every profile in the daily run.
    // Read it once, so a growing audience does not multiply identical queries.
    let lifestyleItem = null;
    try {
      const lifestyleItems = await base44.asServiceRole.entities.LifestyleItems.list('-published_at', 5);
      lifestyleItem = lifestyleItems.find(i => i.provider === 'FEMWELL_AI' && i.status === 'PUBLISHED') || null;
    } catch { /* Keep the other recommendation types available when this source fails. */ }
    let processed = 0;

    for (const profile of profiles) {
      const userId = profile.user_id;
      if (!userId) continue;
      const existing = await base44.asServiceRole.entities.TodayRecommendations.filter({ user_id: userId, date: today });
      for (const item of existing) {
        await base44.asServiceRole.entities.TodayRecommendations.delete(item.id);
      }

      const phase = getCycleInfo(profile).phase;
      const phaseContent = allContent.filter(item => {
        if (item.content_key === 'energising-breath') return false;
        const phases = item.cycle_phases || [];
        return phases.includes(phase) || phases.includes('all');
      }).slice(0, 2);
      const phasePrograms = allPrograms.filter(item => {
        return item.trigger_phase === 'any' || (item.trigger_phase || '').includes(phase);
      }).slice(0, 1);

      for (const item of phaseContent) {
        await base44.asServiceRole.entities.TodayRecommendations.create({
          user_id: userId,
          date: today,
          type: 'content',
          title: item.title,
          reason: `Matched to your ${phase} phase today.`,
          action_route: routeForContent(item),
        });
      }

      for (const item of phasePrograms) {
        await base44.asServiceRole.entities.TodayRecommendations.create({
          user_id: userId,
          date: today,
          type: 'program',
          title: item.title,
          reason: `Relevant for your ${phase} phase and current support needs.`,
          action_route: routeForProgram(item),
        });
      }

      // Book recommendation
      try {
        const bookPicks = await base44.asServiceRole.entities.WeeklyBookPick.filter({ status: 'PUBLISHED' }, '-created_date', 1);
        const bookPick = bookPicks[0];
        const book = bookPick?.books?.[0];
        if (book) {
          await base44.asServiceRole.entities.TodayRecommendations.create({
            user_id: userId, date: today, type: 'BOOK',
            title: book.title,
            reason: ('This week\'s book pick \u2014 ' + (book.tagline || '')).slice(0, 80),
            action_route: '/Lifestyle?tab=books',
          });
        }
      } catch {}

      // Lifestyle recommendation
      if (lifestyleItem) {
        try {
          await base44.asServiceRole.entities.TodayRecommendations.create({
            user_id: userId, date: today, type: 'LIFESTYLE',
            title: lifestyleItem.title,
            reason: 'From the FemWell AI archive',
          action_route: `/LifestyleDetail?id=${encodeURIComponent(lifestyleItem.id)}`,
          });
        } catch { /* Preserve the other recommendation types if this row fails. */ }
      }

      // Event recommendation
      try {
        const events = await base44.asServiceRole.entities.EventsItems.list('date', 20);
        const upcomingVerified = events.find(e => e.verified === true && e.date >= today);
        if (upcomingVerified) {
          await base44.asServiceRole.entities.TodayRecommendations.create({
            user_id: userId, date: today, type: 'EVENT',
            title: upcomingVerified.title,
            reason: upcomingVerified.location || 'Upcoming event near you',
            action_route: '/Events',
          });
        }
      } catch {}

      processed += 1;
    }

    return Response.json({ success: true, processed, date: today });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
