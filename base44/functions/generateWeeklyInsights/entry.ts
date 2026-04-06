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

      const ai = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are FemWell's wellness intelligence engine. Generate a personal weekly insight for a woman based on the data below. Be warm, specific, and grounded in her actual numbers — never generic.

User data for this week:
- Cycle phase this week: ${phase}
- Cycle day range: ${startDay} to ${endDay}
- Mood average this week: ${avgText(currentWeek, 'mood', '/5')} (previous week: ${avgText(previousWeek, 'mood', '/5')})
- Energy average this week: ${avgText(currentWeek, 'energy', '/5')} (previous week: ${avgText(previousWeek, 'energy', '/5')})
- Sleep average this week: ${avgText(currentWeek, 'sleep_hours', ' hours')} (previous week: ${avgText(previousWeek, 'sleep_hours', ' hours')})
- Top logged symptoms: ${topSymptoms}
- Skin condition most logged this week: ${skinMode || 'not logged'}
- Breakout locations logged: ${breakoutSummary || 'none'}
- Hair shedding most logged this week: ${sheddingMode || 'not logged'}
- Scalp condition most logged: ${scalpMode || 'not logged'}
- Meals logged this week: ${mealCountSummary}
- Average daily calories: ${calorieSummary}
- Average protein per meal: ${proteinSummary}
- Number of check-ins logged: ${currentWeek.length}
- Goals: ${goals}
- Tone preference: ${tonePreference}

Write a weekly summary with exactly these sections. Use markdown bold for section titles.

**How your week looked** — 3–4 sentences. Reference the actual mood, energy, and sleep numbers. Compare to last week with specific deltas where available. Acknowledge if data is sparse without making the user feel bad about it.

**What your body was telling you** — 2–3 sentences. Reference logged symptoms by name. Explain WHY they happen in this specific phase using hormone science — not generic advice. If no symptoms were logged, note what is typical for this phase and what to watch for.

**Your pattern this week** — 1–2 sentences. Identify one specific personal pattern from the data. This must reference actual numbers, not generalities.

**For the week ahead** — 2 sentences. Name the phase they are moving into next (${nextPhase}). Give one specific, actionable suggestion tailored to that phase — not generic wellness advice.

**Skin & hair note** — 1–2 sentences only. If skin or hair data was logged, reference it specifically by name (e.g. "Moderate breakout", "A lot" shedding) and explain the likely hormonal driver for this phase. If nothing was logged, omit this section entirely — do not write a placeholder.

Keep the total response under 280 words. Do not include the "Skin & hair note" section if skin_condition and hair_shedding are both "not logged". Do not use bullet points. Do not use the word "journey". Do not use exclamation marks.`,
      });

      await base44.asServiceRole.entities.WeeklyInsights.create({
        user_id: userId,
        week_start: weekStart,
        week_end: weekEnd,
        insight_text: ai,
        generated_at: new Date().toISOString(),
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