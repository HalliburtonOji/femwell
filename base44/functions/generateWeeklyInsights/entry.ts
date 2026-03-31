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

      const avg = (items, field) => items.length ? (items.reduce((sum, item) => sum + Number(item[field] || 0), 0) / items.length).toFixed(1) : 'n/a';
      const symptomCounts = weekSymptoms.reduce((acc, item) => {
        const key = item.symptom_type || 'unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      const topSymptoms = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([key]) => key).join(', ') || 'none logged';

      const ai = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Write one concise weekly wellness summary for a women's health app user. Include: phase summary, mood/energy vs previous week, top symptoms, sleep pattern, one specific personal pattern, and one suggestion for the upcoming phase. Current phase: ${phase}. Current week mood avg: ${avg(currentWeek, 'mood')}. Current week energy avg: ${avg(currentWeek, 'energy')}. Current week sleep avg: ${avg(currentWeek, 'sleep_hours')}. Previous week mood avg: ${avg(previousWeek, 'mood')}. Previous week energy avg: ${avg(previousWeek, 'energy')}. Previous week sleep avg: ${avg(previousWeek, 'sleep_hours')}. Top symptoms: ${topSymptoms}. Keep it supportive, specific, and non-diagnostic in one short paragraph.`,
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