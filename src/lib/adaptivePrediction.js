import { base44 } from "@/api/base44Client";
import { addDays, differenceInDays, parseISO, format } from "date-fns";

/**
 * Compute an adaptive cycle prediction for a user.
 * Fetches last 6 PeriodStart events, applies weighted average,
 * adjusts for recent stress/sleep, writes to CyclePredictions.
 * Returns the prediction object.
 */
export async function computeAdaptivePrediction(userId, profileCycleLength = 28) {
  const allEvents = await base44.entities.CycleEvents.filter({ user_id: userId });
  const periodStarts = allEvents
    .filter(e => e.type === "PeriodStart")
    .map(e => e.date)
    .sort()
    .slice(-6);

  let predictedLength = profileCycleLength;
  let confidence = "low";

  if (periodStarts.length >= 2) {
    const lengths = [];
    for (let i = 1; i < periodStarts.length; i++) {
      const len = differenceInDays(parseISO(periodStarts[i]), parseISO(periodStarts[i - 1]));
      if (len >= 15 && len <= 60) lengths.push(len);
    }
    if (lengths.length > 0) {
      const weights = [0.1, 0.15, 0.2, 0.25, 0.3].slice(-lengths.length);
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      const weightedSum = lengths.reduce((sum, len, i) => sum + len * weights[i], 0);
      predictedLength = Math.round(weightedSum / totalWeight);
      confidence = lengths.length >= 5 ? "high" : lengths.length >= 3 ? "medium" : "low";
    }
  }

  // Stress/sleep adjustment
  const sevenDaysAgo = format(addDays(new Date(), -7), "yyyy-MM-dd");
  const recentCheckins = await base44.entities.DailyCheckins.filter({ user_id: userId }).catch(() => []);
  const lastWeek = recentCheckins.filter(c => c.date >= sevenDaysAgo);
  if (lastWeek.length > 0) {
    const avgStress = lastWeek.filter(c => c.stress != null).reduce((s, c) => s + c.stress, 0) / (lastWeek.filter(c => c.stress != null).length || 1);
    const avgSleep = lastWeek.filter(c => c.sleep_hours != null).reduce((s, c) => s + c.sleep_hours, 0) / (lastWeek.filter(c => c.sleep_hours != null).length || 1);
    if (avgStress >= 4 || avgSleep <= 5.5) {
      predictedLength += avgStress >= 4 && avgSleep <= 5.5 ? 2 : 1;
    }
  }

  const lastStart = periodStarts.length > 0 ? periodStarts[periodStarts.length - 1] : null;
  if (!lastStart) return null;

  const lastStartDate = parseISO(lastStart);
  const nextPeriod = addDays(lastStartDate, predictedLength);
  const ovulationDay = addDays(nextPeriod, -14);
  const fertileStart = addDays(ovulationDay, -5);
  const fertileEnd = addDays(ovulationDay, 1);

  const prediction = {
    user_id: userId,
    period_start_predicted: format(nextPeriod, "yyyy-MM-dd"),
    window_start: format(nextPeriod, "yyyy-MM-dd"),
    window_end: format(addDays(nextPeriod, 5), "yyyy-MM-dd"),
    fertile_window_start: format(fertileStart, "yyyy-MM-dd"),
    fertile_window_end: format(fertileEnd, "yyyy-MM-dd"),
    ovulation_predicted_date: format(ovulationDay, "yyyy-MM-dd"),
    predicted_cycle_length: predictedLength,
    confidence,
    method: "adaptive",
    created_at: new Date().toISOString(),
  };

  // Upsert: delete old, create new
  const existing = await base44.entities.CyclePredictions.filter({ user_id: userId }).catch(() => []);
  for (const e of existing) {
    await base44.entities.CyclePredictions.delete(e.id).catch(() => {});
  }
  const saved = await base44.entities.CyclePredictions.create(prediction);
  return saved;
}

/**
 * Get latest prediction for a user (from DB), or null.
 */
export async function getLatestPrediction(userId) {
  const preds = await base44.entities.CyclePredictions.filter({ user_id: userId }, "-created_at", 1).catch(() => []);
  return preds[0] || null;
}

/**
 * Compute fertility status based on today vs predicted fertile window.
 * Returns { status: 'low'|'medium'|'high'|'peak', daysToFertile, daysToOvulation }
 */
export function computeFertilityStatus(prediction) {
  if (!prediction) return { status: "low", daysToFertile: null, daysToOvulation: null };
  const today = format(new Date(), "yyyy-MM-dd");
  const { fertile_window_start, fertile_window_end, ovulation_predicted_date } = prediction;
  const daysToFertile = differenceInDays(parseISO(fertile_window_start), parseISO(today));
  const daysToOvulation = differenceInDays(parseISO(ovulation_predicted_date), parseISO(today));

  let status = "low";
  if (today >= fertile_window_start && today <= fertile_window_end) {
    status = today === ovulation_predicted_date ? "peak" : daysToOvulation <= 1 ? "peak" : "high";
  } else if (daysToFertile <= 3 && daysToFertile >= 0) {
    status = "medium";
  }

  return { status, daysToFertile, daysToOvulation };
}