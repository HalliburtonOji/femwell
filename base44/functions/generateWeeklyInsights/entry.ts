/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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
    const isFirstOfMonth = now.getDate() === 1;

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

      // Skin condition mode this week
      const skinConditions = currentWeek.map(item => item.skin_condition).filter(Boolean);
      const skinModeEntry = skinConditions.length
        ? Object.entries(skinConditions.reduce((acc, v) => { acc[v] = (acc[v] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1])[0]
        : null;
      const skinMode = skinModeEntry ? skinModeEntry[0] : null;

      // Breakout locations this week
      const breakoutLocs = currentWeek.flatMap(item => Array.isArray(item.breakout_location) ? item.breakout_location : []);
      const breakoutSummary = breakoutLocs.length ? [...new Set(breakoutLocs)].join(', ') : null;

      // Hair shedding mode this week
      const sheddingValues = currentWeek.map(item => item.hair_shedding).filter(Boolean);
      const sheddingMode = sheddingValues.length
        ? Object.entries(sheddingValues.reduce((acc, v) => { acc[v] = (acc[v] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1])[0][0]
        : null;

      // Scalp condition mode this week
      const scalpValues = currentWeek.map(item => item.scalp_condition).filter(Boolean);
      const scalpMode = scalpValues.length
        ? Object.entries(scalpValues.reduce((acc, v) => { acc[v] = (acc[v] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1])[0][0]
        : null;

      const weekMealLogs = await base44.asServiceRole.entities.MealLog.filter({ user_id: userId });
      const weekMealsFiltered = weekMealLogs.filter(m => { const d = m.logged_at || m.created_date || ''; return d >= weekStart + 'T00:00:00' && d <= weekEnd + 'T23:59:59'; });
      let totalWkCals = 0, totalWkProt = 0, macroN = 0;
      weekMealsFiltered.forEach(m => {
        try {
          if (!m.ai_analysis) return;
          const a = JSON.parse(m.ai_analysis);
          const mult = m.portion_size === 'small' ? 0.7 : m.portion_size === 'large' ? 1.4 : 1.0;
          if (a.nutritional_summary?.calories) { totalWkCals += Math.round(a.nutritional_summary.calories * mult); totalWkProt += Math.round((a.nutritional_summary.protein_g || 0) * mult); macroN++; }
        } catch (_) {}
      });
      const mealCountSummary = weekMealsFiltered.length > 0 ? `${weekMealsFiltered.length} meals logged` : 'not logged';
      const calorieSummary = macroN > 0 ? `avg ${Math.round(totalWkCals / 7)} kcal/day (${macroN} meals analysed)` : 'not logged';
      const proteinSummary = macroN > 0 ? `avg ${Math.round(totalWkProt / macroN)}g protein per meal` : 'not logged';

      const userCorrelations = await base44.asServiceRole.entities.Correlations.filter({ user_id: userId });
      const topCorrelationTexts = userCorrelations.slice(0, 2).map(c => `- ${c.explanation_text}`).join('\n') || '- Not enough historical data yet';

      const aiResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are FemWell's wellness intelligence engine. Generate a personal weekly insight for a woman. Use ONLY the data below — do not invent or assume numbers.

WEEK: ${weekStart} to ${weekEnd}
CHECK-INS LOGGED: ${currentWeek.length}/7 days
CYCLE PHASE: ${phase} (day range ${startDay}–${endDay})

REAL AVERAGES THIS WEEK:
- Mood: ${avgText(currentWeek, 'mood', '/5')} (previous week: ${avgText(previousWeek, 'mood', '/5')})
- Energy: ${avgText(currentWeek, 'energy', '/5')} (previous week: ${avgText(previousWeek, 'energy', '/5')})
- Sleep: ${avgText(currentWeek, 'sleep_hours', ' hours')} (previous week: ${avgText(previousWeek, 'sleep_hours', ' hours')})
- Top symptoms: ${topSymptoms}
- Skin: ${skinMode || 'not logged'} | Breakouts: ${breakoutSummary || 'none'} | Hair shedding: ${sheddingMode || 'not logged'} | Scalp: ${scalpMode || 'not logged'}
- Meals: ${mealCountSummary} | Avg calories: ${calorieSummary} | Avg protein: ${proteinSummary}
- Goals: ${goals} | Tone: ${tonePreference}

PERSONAL PATTERNS (from historical data):
${topCorrelationTexts}

Write 4 sections (2–3 sentences each). Reference ACTUAL numbers. Do not use bullet points. Do not use the word "journey". Do not use exclamation marks. Next phase entering: ${nextPhase}.

Return JSON with exactly these keys: how_your_week_looked, body_signals, your_pattern, week_ahead.
- how_your_week_looked: reference actual mood/energy/sleep numbers and compare to last week
- body_signals: connect symptoms to this specific phase's hormone science
- your_pattern: reference personal correlation patterns if available, otherwise note a pattern from this week's numbers
- week_ahead: actionable phase-appropriate suggestion for ${nextPhase} phase`,
        response_json_schema: {
          type: 'object',
          properties: {
            how_your_week_looked: { type: 'string' },
            body_signals: { type: 'string' },
            your_pattern: { type: 'string' },
            week_ahead: { type: 'string' },
          },
          required: ['how_your_week_looked', 'body_signals', 'your_pattern', 'week_ahead'],
        },
      });
      const structured = typeof aiResult === 'string' ? JSON.parse(aiResult) : aiResult;
      const ai = [structured.how_your_week_looked, structured.body_signals, structured.your_pattern, structured.week_ahead].join('\n\n');

      const avgMoodNum = avgValue(currentWeek, 'mood');
      const avgEnergyNum = avgValue(currentWeek, 'energy');
      const avgSleepNum = avgValue(currentWeek, 'sleep_hours');
      const avgStressNum = avgValue(currentWeek, 'stress');
      const topSymptomsArr = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k);

      await base44.asServiceRole.entities.WeeklyInsights.create({
        user_id: userId,
        week_start: weekStart,
        week_end: weekEnd,
        insight_text: ai,
        generated_at: new Date().toISOString(),
        avg_mood: avgMoodNum != null ? Number(avgMoodNum) : null,
        avg_energy: avgEnergyNum != null ? Number(avgEnergyNum) : null,
        avg_sleep: avgSleepNum != null ? Number(avgSleepNum) : null,
        avg_stress: avgStressNum != null ? Number(avgStressNum) : null,
        top_symptoms: topSymptomsArr,
        cycle_phase_this_week: phase,
        check_in_count: currentWeek.length,
        structured_summary: structured,
      });

      // Monthly summary on first of month
      if (isFirstOfMonth) {
        try {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
          const existingMonthly = await base44.asServiceRole.entities.WeeklyInsights.filter({ user_id: userId, week_start: monthStart });
          if (!existingMonthly.some(r => r.summary_type === 'monthly')) {
            const monthCheckins = checkins.filter(item => item.date >= monthStart && item.date < weekStart);
            const avgMood = avgText(monthCheckins, 'mood', '/5');
            const avgEnergy = avgText(monthCheckins, 'energy', '/5');
            const avgSleep = avgText(monthCheckins, 'sleep_hours', ' hours');
            const daysLogged = monthCheckins.length;
            const allMonthSymptoms = symptoms.filter(s => s.date >= monthStart && s.date < weekStart);
            const symCounts = allMonthSymptoms.reduce((acc, s) => { acc[s.symptom_type || 'unknown'] = (acc[s.symptom_type || 'unknown'] || 0) + 1; return acc; }, {});
            const topSyms = Object.entries(symCounts).sort((a,b) => b[1]-a[1]).slice(0,3).map(([k]) => k).join(', ') || 'none';

            const monthlyAi = await base44.asServiceRole.integrations.Core.InvokeLLM({
              prompt: `You are a women's wellness analyst. Generate a warm, insightful monthly health summary. Data: average mood ${avgMood}, average energy ${avgEnergy}, average sleep ${avgSleep}, days logged ${daysLogged}, top symptoms: ${topSyms}, goals: ${goals}. Write 3 paragraphs: one on patterns you notice, one on what went well, one on a gentle suggestion for next month. Tone: warm, personal, not clinical. Max 350 words. Do not use bullet points. Do not use the word journey.`,
            });

            await base44.asServiceRole.entities.WeeklyInsights.create({
              user_id: userId,
              week_start: monthStart,
              insight_text: monthlyAi,
              summary_type: 'monthly',
              generated_at: new Date().toISOString(),
            });
          }
        } catch (e) {
          console.error('Monthly summary error:', e.message);
        }
      }

      processed += 1;
    }

    return Response.json({ success: true, processed, week_start: weekStart, week_end: weekEnd });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});