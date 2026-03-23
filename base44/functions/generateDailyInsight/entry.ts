import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const PHASE_LABELS = {
  menstrual: 'Menstrual',
  follicular: 'Follicular',
  ovulation: 'Ovulation',
  luteal: 'Luteal',
};

function getCyclePhase(lastPeriodDate, cycleLength = 28) {
  const today = new Date();
  const last = new Date(lastPeriodDate);
  const daysSince = Math.floor((today - last) / (1000 * 60 * 60 * 24));
  const dayOfCycle = (daysSince % cycleLength) + 1;

  if (dayOfCycle <= 5) return 'menstrual';
  if (dayOfCycle <= 13) return 'follicular';
  if (dayOfCycle <= 16) return 'ovulation';
  return 'luteal';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This function is called as a scheduled job - use service role
    const allUsers = await base44.asServiceRole.entities.UserProfile.list();

    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let processed = 0;

    for (const profile of allUsers) {
      try {
        const userId = profile.user_id;
        if (!userId) continue;

        // Skip if insight already generated today
        const existing = await base44.asServiceRole.entities.InsightCards.filter({
          user_id: userId,
          insight_date: today,
          source: 'daily_worker'
        });
        if (existing.length > 0) continue;

        // Gather user data in parallel
        const [checkins, symptoms, habitLogs, cycleEvents] = await Promise.all([
          base44.asServiceRole.entities.DailyCheckins.filter({ user_id: userId }),
          base44.asServiceRole.entities.SymptomLogs.filter({ user_id: userId }),
          base44.asServiceRole.entities.HabitLogs.filter({ user_id: userId }),
          base44.asServiceRole.entities.CycleEvents.filter({ user_id: userId }),
        ]);

        // Get recent data (last 7 days)
        const recentCheckins = checkins
          .filter(c => c.date >= sevenDaysAgo)
          .sort((a, b) => b.date.localeCompare(a.date));

        const recentSymptoms = symptoms
          .filter(s => s.date >= sevenDaysAgo)
          .sort((a, b) => b.date.localeCompare(a.date));

        const recentHabits = habitLogs
          .filter(h => h.date >= sevenDaysAgo);

        if (recentCheckins.length === 0 && recentSymptoms.length === 0) continue;

        // Determine cycle phase
        const lastPeriod = cycleEvents
          .filter(e => e.event_type === 'period_start')
          .sort((a, b) => b.date.localeCompare(a.date))[0];

        const cyclePhase = lastPeriod
          ? getCyclePhase(lastPeriod.date, profile.cycle_length || 28)
          : null;

        // Build summary for LLM
        const checkinSummary = recentCheckins.slice(0, 3).map(c =>
          `${c.date}: mood=${c.mood ?? '?'}/10, energy=${c.energy ?? '?'}/10, stress=${c.stress ?? '?'}/10, sleep=${c.sleep_hours ?? '?'}h, cramps=${c.cramps ?? '?'}/10`
        ).join('\n');

        const symptomSummary = recentSymptoms.slice(0, 5).map(s =>
          `${s.date}: ${s.symptom_type} severity=${s.severity ?? '?'}`
        ).join('\n');

        const habitSummary = recentHabits
          .reduce((acc, h) => {
            if (!acc[h.habit_type]) acc[h.habit_type] = { done: 0, total: 0 };
            acc[h.habit_type].total++;
            if (h.completed) acc[h.habit_type].done++;
            return acc;
          }, {});

        const habitText = Object.entries(habitSummary)
          .map(([type, { done, total }]) => `${type}: ${done}/${total} days completed`)
          .join(', ');

        const prompt = `You are a women's health wellness analyst. Based on the following data from the past 7 days, generate a short, warm, personalised Daily Insight for the user. 

Cycle phase: ${cyclePhase ? PHASE_LABELS[cyclePhase] : 'unknown'}

Recent check-ins:
${checkinSummary || 'No check-in data'}

Recent symptoms:
${symptomSummary || 'No symptom data'}

Habit completion:
${habitText || 'No habit data'}

Instructions:
- Write 2-3 sentences max. Be warm and supportive.
- Highlight any notable pattern or correlation (e.g. low energy during luteal phase, high stress correlating with poor sleep).
- If everything looks good, celebrate their consistency.
- End with one simple, actionable tip for today.
- Do NOT use markdown. Plain text only.
- Do NOT mention specific numbers/scores unless they're clearly good or concerning.`;

        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });

        if (result && result.trim()) {
          await base44.asServiceRole.entities.InsightCards.create({
            user_id: userId,
            insight_date: today,
            insight_text: result.trim(),
            cycle_phase: cyclePhase,
            source: 'daily_worker',
            is_read: false,
          });
          processed++;
        }
      } catch (userErr) {
        console.error(`Failed for user ${profile.user_id}:`, userErr.message);
      }
    }

    return Response.json({ success: true, processed, date: today });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});