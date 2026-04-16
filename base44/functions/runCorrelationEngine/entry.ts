/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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
    }

    // ── WearableSync correlations ─────────────────────────────────────────────
    for (const profile of profiles) {
      if (!profile.user_id) continue;
      const wearable = await base44.asServiceRole.entities.WearableSync.filter({ user_id: profile.user_id });
      if (wearable.length < 7) continue;

      const checkins = await base44.asServiceRole.entities.DailyCheckins.filter({ user_id: profile.user_id });
      const checkinByDate = Object.fromEntries(checkins.map(c => [c.date, c]));
      const wearableByDate = Object.fromEntries(wearable.map(w => [w.date, w]));

      const sortedDates = [...new Set([...Object.keys(wearableByDate)].sort())];
      const insightDate = new Date().toISOString().split('T')[0];

      // hrv_ms vs next-day mood and energy
      const hrvMoodPairsHigh = [], hrvMoodPairsLow = [];
      const hrvEnergyPairsHigh = [], hrvEnergyPairsLow = [];
      const hrRestPairs = [], hrSleepPairs = [];
      const readinessHighEx = [], readinessLowEx = [];

      for (let i = 0; i < sortedDates.length - 1; i++) {
        const today = wearableByDate[sortedDates[i]];
        const nextDate = sortedDates[i + 1];
        const nextCheckin = checkinByDate[nextDate];
        const todayCheckin = checkinByDate[sortedDates[i]];

        if (today.hrv_ms != null && nextCheckin?.mood != null) {
          if (today.hrv_ms >= 50) hrvMoodPairsHigh.push(nextCheckin.mood);
          else hrvMoodPairsLow.push(nextCheckin.mood);
        }
        if (today.hrv_ms != null && nextCheckin?.energy != null) {
          if (today.hrv_ms >= 50) hrvEnergyPairsHigh.push(nextCheckin.energy);
          else hrvEnergyPairsLow.push(nextCheckin.energy);
        }
        if (today.resting_heart_rate != null && todayCheckin?.sleep_hours != null) {
          hrSleepPairs.push({ hr: today.resting_heart_rate, sleep: todayCheckin.sleep_hours });
        }
        if (today.readiness_score != null && todayCheckin?.exercise_intensity != null) {
          const intensityScore = { light: 1, moderate: 2, intense: 3 }[todayCheckin.exercise_intensity] || 0;
          if (today.readiness_score >= 70) readinessHighEx.push(intensityScore);
          else readinessLowEx.push(intensityScore);
        }
      }

      const weekStart = getMonday(new Date()).toISOString().split('T')[0];

      const hrvMoodHigh = avg(hrvMoodPairsHigh), hrvMoodLow = avg(hrvMoodPairsLow);
      if (hrvMoodHigh != null && hrvMoodLow != null && hrvMoodHigh - hrvMoodLow >= 0.4) {
        const text = `When your HRV is 50ms or higher, your next-day mood averages ${formatNum(hrvMoodHigh)} — compared to ${formatNum(hrvMoodLow)} on lower-HRV days. HRV reflects nervous system recovery.`;
        await base44.asServiceRole.entities.InsightCards.create({ user_id: profile.user_id, source: 'correlation_engine', cycle_phase: 'any', insight_date: insightDate, title: 'HRV predicts your mood', insight_text: text, confidence: 0.76, is_read: false, recommended_action_route: null }).catch(() => {});
        await base44.asServiceRole.entities.Correlations.create({ user_id: profile.user_id, metric_a: 'hrv_ms', metric_b: 'next_day_mood', correlation_type: 'W1', result_summary: text, data_points_used: hrvMoodPairsHigh.length + hrvMoodPairsLow.length, generated_at: new Date().toISOString(), week_start: weekStart }).catch(() => {});
      }

      const hrvEnergyHigh = avg(hrvEnergyPairsHigh), hrvEnergyLow = avg(hrvEnergyPairsLow);
      if (hrvEnergyHigh != null && hrvEnergyLow != null && hrvEnergyHigh - hrvEnergyLow >= 0.4) {
        const text = `Higher HRV days correlate with better next-day energy (avg ${formatNum(hrvEnergyHigh)} vs ${formatNum(hrvEnergyLow)}). Consider prioritising recovery when HRV drops.`;
        await base44.asServiceRole.entities.InsightCards.create({ user_id: profile.user_id, source: 'correlation_engine', cycle_phase: 'any', insight_date: insightDate, title: 'HRV and your energy', insight_text: text, confidence: 0.74, is_read: false, recommended_action_route: null }).catch(() => {});
      }

      if (hrSleepPairs.length >= 5) {
        const longSleepHR = avg(hrSleepPairs.filter(p => p.sleep >= 7).map(p => p.hr));
        const shortSleepHR = avg(hrSleepPairs.filter(p => p.sleep < 7).map(p => p.hr));
        if (longSleepHR != null && shortSleepHR != null && shortSleepHR - longSleepHR >= 2) {
          const text = `Your resting heart rate is ${formatNum(shortSleepHR - longSleepHR)} bpm higher on nights with under 7 hours of sleep — a classic sign of incomplete cardiovascular recovery.`;
          await base44.asServiceRole.entities.InsightCards.create({ user_id: profile.user_id, source: 'correlation_engine', cycle_phase: 'any', insight_date: insightDate, title: 'Sleep drives your resting HR', insight_text: text, confidence: 0.77, is_read: false, recommended_action_route: null }).catch(() => {});
        }
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});