/* global Deno */
// deno-lint-ignore-file no-undef
/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function getMonday(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function avg(values) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatNum(value) {
  return Number(value).toFixed(1);
}

function getPhaseForDate(profile, dateString) {
  const date = new Date(dateString);
  const lastPeriod = new Date(profile.last_period_start_date);
  const daysSince = Math.floor((date - lastPeriod) / (1000 * 60 * 60 * 24));
  const cycleDay = (daysSince % profile.cycle_avg_length) + 1;
  const periodLength = profile.period_length || 5;
  return cycleDay <= periodLength ? 'menstrual'
    : cycleDay <= 13 ? 'follicular'
    : cycleDay <= 17 ? 'ovulatory'
    : 'luteal';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const today = new Date();
    const monday = getMonday(today);
    const weekStart = monday.toISOString().split('T')[0];
    const profiles = await base44.asServiceRole.entities.UserProfile.list();

    for (const profile of profiles) {
      if (!profile.last_period_start_date || !profile.user_id) continue;
      const checkins = (await base44.asServiceRole.entities.DailyCheckins.filter({ user_id: profile.user_id }))
        .sort((a, b) => a.date.localeCompare(b.date));
      if (checkins.length < 14) continue;

      const insightDate = today.toISOString().split('T')[0];

      const sleepPairsHigh = [];
      const sleepPairsLow = [];
      for (let i = 0; i < checkins.length - 1; i += 1) {
        const current = checkins[i];
        const next = checkins[i + 1];
        if (current.sleep_hours == null || next.mood == null) continue;
        if (current.sleep_hours >= 7) sleepPairsHigh.push(next.mood);
        else sleepPairsLow.push(next.mood);
      }
      const highAvg = avg(sleepPairsHigh);
      const lowAvg = avg(sleepPairsLow);
      if (highAvg != null && lowAvg != null && highAvg - lowAvg >= 0.5) {
        const text = `When you sleep 7 or more hours, your next-day mood averages ${formatNum(highAvg)} — compared to ${formatNum(lowAvg)} on lower-sleep nights. That's a ${formatNum(highAvg - lowAvg)}-point difference.`;
        await base44.asServiceRole.entities.InsightCards.create({
          user_id: profile.user_id,
          user_email: profile.user_email,
          source: 'correlation_engine',
          cycle_phase: 'any',
          insight_date: insightDate,
          title: 'Sleep shapes your mood',
          insight_text: text,
          confidence: 0.78,
          is_read: false,
          recommended_action_route: null,
        });
        await base44.asServiceRole.entities.Correlations.create({
          user_id: profile.user_id,
          user_email: profile.user_email,
          metric_a: 'sleep_hours',
          metric_b: 'next_day_mood',
          correlation_type: 'A',
          result_summary: text,
          data_points_used: sleepPairsHigh.length + sleepPairsLow.length,
          generated_at: new Date().toISOString(),
          week_start: weekStart,
        });
      }

      const exerciseDays = checkins.filter((item) => item.pain != null && (item.exercise_done === true || (item.exercise_minutes || 0) > 0)).map((item) => item.pain);
      const restDays = checkins.filter((item) => item.pain != null && !(item.exercise_done === true || (item.exercise_minutes || 0) > 0)).map((item) => item.pain);
      const exerciseAvg = avg(exerciseDays);
      const restAvg = avg(restDays);
      if (exerciseAvg != null && restAvg != null && restAvg - exerciseAvg >= 0.5) {
        const text = `On days you exercise, your pain levels average ${formatNum(exerciseAvg)} — ${formatNum(restAvg - exerciseAvg)} points lower than on rest days.`;
        await base44.asServiceRole.entities.InsightCards.create({
          user_id: profile.user_id,
          user_email: profile.user_email,
          source: 'correlation_engine',
          cycle_phase: 'any',
          insight_date: insightDate,
          title: 'Movement lowers pain',
          insight_text: text,
          confidence: 0.78,
          is_read: false,
          recommended_action_route: null,
        });
        await base44.asServiceRole.entities.Correlations.create({
          user_id: profile.user_id,
          user_email: profile.user_email,
          metric_a: 'exercise',
          metric_b: 'pain',
          correlation_type: 'B',
          result_summary: text,
          data_points_used: exerciseDays.length + restDays.length,
          generated_at: new Date().toISOString(),
          week_start: weekStart,
        });
      }

      const phases = { menstrual: [], follicular: [], ovulatory: [], luteal: [] };
      for (const checkin of checkins) {
        if (checkin.energy == null) continue;
        const phase = getPhaseForDate(profile, checkin.date);
        phases[phase].push(checkin.energy);
      }
      const phaseAverages = Object.entries(phases)
        .map(([phase, values]) => ({ phase, avg: avg(values), count: values.length }))
        .filter((entry) => entry.avg != null);
      if (phaseAverages.length >= 2) {
        phaseAverages.sort((a, b) => b.avg - a.avg);
        const highest = phaseAverages[0];
        const lowest = phaseAverages[phaseAverages.length - 1];
        const text = `Your energy is naturally highest in your ${highest.phase} phase (avg ${formatNum(highest.avg)}/5) and lowest in ${lowest.phase} (avg ${formatNum(lowest.avg)}/5). This is normal — your cycle drives it.`;
        await base44.asServiceRole.entities.InsightCards.create({
          user_id: profile.user_id,
          user_email: profile.user_email,
          source: 'correlation_engine',
          cycle_phase: highest.phase,
          insight_date: insightDate,
          title: 'Your cycle energy map',
          insight_text: text,
          confidence: 0.78,
          is_read: false,
          recommended_action_route: null,
        });
        await base44.asServiceRole.entities.Correlations.create({
          user_id: profile.user_id,
          user_email: profile.user_email,
          metric_a: 'phase',
          metric_b: 'energy',
          correlation_type: 'C',
          result_summary: text,
          data_points_used: phaseAverages.reduce((sum, entry) => sum + entry.count, 0),
          generated_at: new Date().toISOString(),
          week_start: weekStart,
        });
      }

      // Correlation D: skin condition by phase
      const skinByPhase = { menstrual: [], follicular: [], ovulatory: [], luteal: [] };
      for (const checkin of checkins) {
        if (!checkin.skin_condition) continue;
        const phase = getPhaseForDate(profile, checkin.date);
        const score = checkin.skin_condition.toLowerCase().includes('clear') || checkin.skin_condition.toLowerCase().includes('glow') ? 5
          : checkin.skin_condition === 'Normal' ? 4
          : checkin.skin_condition.toLowerCase().includes('mild') || checkin.skin_condition === 'Very oily' ? 3
          : checkin.skin_condition.toLowerCase().includes('moderate') || checkin.skin_condition === 'Very dry' ? 2
          : null;
        if (score) skinByPhase[phase].push(score);
      }
      const skinPhaseAvgs = Object.entries(skinByPhase)
        .map(([phase, values]) => ({ phase, avg: avg(values), count: values.length }))
        .filter(entry => entry.avg != null && entry.count >= 3);
      if (skinPhaseAvgs.length >= 2) {
        skinPhaseAvgs.sort((a, b) => b.avg - a.avg);
        const bestSkin = skinPhaseAvgs[0];
        const worstSkin = skinPhaseAvgs[skinPhaseAvgs.length - 1];
        const skinText = `Your skin tends to be clearest in your ${bestSkin.phase} phase (avg score ${formatNum(bestSkin.avg)}/5) and most reactive in your ${worstSkin.phase} phase (avg ${formatNum(worstSkin.avg)}/5).`;
        await base44.asServiceRole.entities.InsightCards.create({
          user_id: profile.user_id,
          user_email: profile.user_email,
          source: 'correlation_engine',
          cycle_phase: bestSkin.phase,
          insight_date: insightDate,
          title: 'Your skin phase pattern',
          insight_text: skinText,
          confidence: 0.75,
          is_read: false,
          recommended_action_route: null,
        });
        await base44.asServiceRole.entities.Correlations.create({
          user_id: profile.user_id,
          user_email: profile.user_email,
          metric_a: 'phase',
          metric_b: 'skin_condition',
          correlation_type: 'D',
          result_summary: skinText,
          data_points_used: skinPhaseAvgs.reduce((sum, e) => sum + e.count, 0),
          generated_at: new Date().toISOString(),
          week_start: weekStart,
        });
      }

      // Correlation E: hair shedding by phase
      const hairByPhase = { menstrual: [], follicular: [], ovulatory: [], luteal: [] };
      for (const checkin of checkins) {
        if (!checkin.hair_shedding) continue;
        const phase = getPhaseForDate(profile, checkin.date);
        const score = checkin.hair_shedding === 'Normal' ? 1
          : checkin.hair_shedding === 'More than usual' ? 2
          : checkin.hair_shedding === 'A lot' ? 3
          : null;
        if (score) hairByPhase[phase].push(score);
      }
      const hairPhaseAvgs = Object.entries(hairByPhase)
        .map(([phase, values]) => ({ phase, avg: avg(values), count: values.length }))
        .filter(entry => entry.avg != null && entry.count >= 3);
      if (hairPhaseAvgs.length >= 2) {
        hairPhaseAvgs.sort((a, b) => b.avg - a.avg);
        const worstHair = hairPhaseAvgs[0];
        const bestHair = hairPhaseAvgs[hairPhaseAvgs.length - 1];
        const hairText = `Your hair shedding is consistently highest in your ${worstHair.phase} phase and lowest in your ${bestHair.phase} phase — a pattern driven by oestrogen fluctuation across your cycle.`;
        await base44.asServiceRole.entities.InsightCards.create({
          user_id: profile.user_id,
          user_email: profile.user_email,
          source: 'correlation_engine',
          cycle_phase: worstHair.phase,
          insight_date: insightDate,
          title: 'Your hair shedding pattern',
          insight_text: hairText,
          confidence: 0.75,
          is_read: false,
          recommended_action_route: null,
        });
        await base44.asServiceRole.entities.Correlations.create({
          user_id: profile.user_id,
          user_email: profile.user_email,
          metric_a: 'phase',
          metric_b: 'hair_shedding',
          correlation_type: 'E',
          result_summary: hairText,
          data_points_used: hairPhaseAvgs.reduce((sum, e) => sum + e.count, 0),
          generated_at: new Date().toISOString(),
          week_start: weekStart,
        });
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});