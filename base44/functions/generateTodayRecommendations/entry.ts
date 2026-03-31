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

      processed += 1;
    }

    return Response.json({ success: true, processed, date: today });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});