import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function getCycleInfo(profile, referenceDate) {
  const cycleLength = profile.cycle_avg_length || 28;
  const periodLength = profile.period_length || 5;
  if (!profile.last_period_start_date) {
    return { phase: 'any' };
  }
  const last = new Date(profile.last_period_start_date);
  const daysSince = Math.floor((referenceDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  const cycleDay = ((daysSince % cycleLength) + cycleLength) % cycleLength + 1;
  if (cycleDay <= periodLength) return { phase: 'menstrual' };
  if (cycleDay <= 13) return { phase: 'follicular' };
  if (cycleDay <= 16) return { phase: 'ovulatory' };
  return { phase: 'luteal' };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const now = new Date();
    const day = now.getDay();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - day);
    const previousSunday = new Date(sunday);
    previousSunday.setDate(sunday.getDate() - 7);
    const weekStart = sunday.toISOString().split('T')[0];
    const previousWeekStart = previousSunday.toISOString().split('T')[0];
    const weekEndDate = new Date(sunday);
    weekEndDate.setDate(sunday.getDate() + 6);
    const weekEnd = weekEndDate.toISOString().split('T')[0];

    const profiles = await base44.asServiceRole.entities.UserProfile.list();
    let processed = 0;

    for (const profile of profiles) {
      const userId = profile.user_id;
      if (!userId) continue;
      const existing = await base44.asServiceRole.entities.WeeklyInsights.filter({ user_id: userId, week_start: weekStart });
      if (existing.length > 0) continue;

      const [checkins, symptoms] = await Promise.all([
        base44.asServiceRole.entities.DailyCheckins.filter({ user_id: userId }),
        base44.asServiceRole.entities.SymptomLogs.filter({ user_id: userId }),
      ]);

      const currentWeek = checkins.filter(item => item.date >= weekStart && item.date <= weekEnd);
      const previousWeek = checkins.filter(item => item.date >= previousWeekStart && item.date < weekStart);
      const weekSymptoms = symptoms.filter(item => item.date >= weekStart && item.date <= weekEnd);
      const phase = getCycleInfo(profile, sunday).phase;

      const avgValue = (items, field) => {
        const valid = items.map((item) => item[field]).filter((value) => value != null);
        if (!valid.length) return null;
        return (valid.reduce((sum, value) => sum + Number(value), 0) / valid.length).toFixed(1);
      };
      const avgText = (items, field, suffix = '') => avgValue(items, field) != null ? `${avgValue(items, field)}${suffix}` : 'not logged';
      const symptomCounts = weekSymptoms.reduce((acc, item) => {
        const key = item.symptom_type || 'unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      const topSymptoms = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([key]) => key).join(', ') || 'none logged';
      const goals = Array.isArray(profile.goals) && profile.goals.length ? profile.goals.join(', ') : 'not logged';
      const tonePreference = profile.tone_preference || 'not logged';
      const startDay = profile.last_period_start_date ? String(Math.max(1, Math.floor((new Date(weekStart).getTime() - new Date(profile.last_period_start_date).getTime()) / (1000 * 60 * 60 * 24)) % (profile.cycle_avg_length || 28) + 1)) : 'not logged';
      const endDay = profile.last_period_start_date ? String(Math.max(1, Math.floor((new Date(weekEnd).getTime() - new Date(profile.last_period_start_date).getTime()) / (1000 * 60 * 60 * 24)) % (profile.cycle_avg_length || 28) + 1)) : 'not logged';
      const nextPhase = phase === 'menstrual' ? 'follicular' : phase === 'follicular' ? 'ovulatory' : phase === 'ovulatory' ? 'luteal' : 'menstrual';

      const ai = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are FemWell's wellness intelligence engine. Generate a personal weekly insight for a woman based on the data below. Be warm, specific, and grounded in her actual numbers — never generic.

User data for this week:
- Cycle phase this week: ${phase}
- Cycle day range: ${startDay} to ${endDay}
- Mood average this week: ${avgText(currentWeek, 'mood', '/5')} (previous week: ${avgText(previousWeek, 'mood', '/5')})
- Energy average this week: ${avgText(currentWeek, 'energy', '/5')} (previous week: ${avgText(previousWeek, 'energy', '/5')})
- Sleep average this week: ${avgText(currentWeek, 'sleep_hours', ' hours')} (previous week: ${avgText(previousWeek, 'sleep_hours', ' hours')})
- Top logged symptoms: ${topSymptoms}
- Number of check-ins logged: ${currentWeek.length}
- Goals: ${goals}
- Tone preference: ${tonePreference}

Write a weekly summary with exactly these sections. Use markdown bold for section titles.

**How your week looked** — 3–4 sentences. Reference the actual mood, energy, and sleep numbers. Compare to last week with specific deltas where available. Acknowledge if data is sparse without making the user feel bad about it.

**What your body was telling you** — 2–3 sentences. Reference logged symptoms by name. Explain WHY they happen in this specific phase using hormone science — not generic advice. If no symptoms were logged, note what is typical for this phase and what to watch for.

**Your pattern this week** — 1–2 sentences. Identify one specific personal pattern from the data. This must reference actual numbers, not generalities.

**For the week ahead** — 2 sentences. Name the phase they are moving into next (${nextPhase}). Give one specific, actionable suggestion tailored to that phase — not generic wellness advice.

Keep the total response under 280 words. Do not use bullet points. Do not use the word "journey". Do not use exclamation marks.`,
      });

      await base44.asServiceRole.entities.WeeklyInsights.create({
        user_id: userId,
        week_start: weekStart,
        week_end: weekEnd,
        insight_text: ai,
        generated_at: new Date().toISOString(),
      });
      processed += 1;
    }

    return Response.json({ success: true, processed, week_start: weekStart, week_end: weekEnd });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});