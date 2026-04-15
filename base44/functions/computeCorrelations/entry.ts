/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Metric pairs: [metricA, metricB, dayOffset (0 = same day, 1 = next day)]
const METRIC_PAIRS = [
  ['sleep_hours', 'mood', 1],
  ['sleep_hours', 'energy', 1],
  ['stress', 'sleep_quality', 0],
  ['exercise_done', 'mood', 1],
  ['exercise_done', 'energy', 1],
  ['hydration_glasses', 'focus', 0],
  ['pain', 'mood', 0],
  ['bloating', 'cramps', 0],
];

const EXPLANATION_TEMPLATES = {
  'sleep_hours|mood|positive': 'On days after sleeping well, your mood tends to be higher',
  'sleep_hours|mood|negative': 'Lower sleep hours are linked to lower mood the next day for you',
  'sleep_hours|energy|positive': 'Better sleep is associated with higher energy the next day for you',
  'sleep_hours|energy|negative': 'You tend to have lower energy after nights with less sleep',
  'stress|sleep_quality|positive': 'Higher stress days surprisingly coincide with better sleep quality for you',
  'stress|sleep_quality|negative': 'Higher stress days are associated with poorer sleep quality for you',
  'exercise_done|mood|positive': 'You tend to have a better mood the day after exercising',
  'exercise_done|energy|positive': 'You tend to have more energy the day after exercising',
  'hydration_glasses|focus|positive': 'Drinking more water is linked to better focus for you',
  'hydration_glasses|focus|negative': 'Interestingly, higher hydration days are linked to lower reported focus for you',
  'pain|mood|negative': 'Higher pain days are associated with lower mood for you',
  'pain|mood|positive': 'Your mood tends to stay resilient even on higher-pain days',
  'bloating|cramps|positive': 'Bloating and cramps tend to occur together in your cycle',
  'bloating|cramps|negative': 'When bloating is high, your cramps tend to be lower — an interesting pattern',
};

function pearsonCorrelation(pairs) {
  const n = pairs.length;
  if (n < 2) return 0;
  const sumX = pairs.reduce((s, p) => s + p[0], 0);
  const sumY = pairs.reduce((s, p) => s + p[1], 0);
  const sumXY = pairs.reduce((s, p) => s + p[0] * p[1], 0);
  const sumX2 = pairs.reduce((s, p) => s + p[0] * p[0], 0);
  const sumY2 = pairs.reduce((s, p) => s + p[1] * p[1], 0);
  const num = n * sumXY - sumX * sumY;
  const den = Math.sqrt((n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2));
  return den === 0 ? 0 : num / den;
}

function buildPairs(checkins, metricA, metricB, dayOffset) {
  const sorted = [...checkins].sort((a, b) => a.date.localeCompare(b.date));
  const byDate = Object.fromEntries(sorted.map(c => [c.date, c]));
  const pairs = [];
  for (const checkin of sorted) {
    let valA = checkin[metricA];
    if (metricA === 'exercise_done') valA = checkin.exercise_done ? 1 : 0;
    if (valA == null) continue;

    let valB;
    if (dayOffset === 0) {
      valB = checkin[metricB];
    } else {
      const nextDate = new Date(checkin.date);
      nextDate.setDate(nextDate.getDate() + dayOffset);
      const nextKey = nextDate.toISOString().split('T')[0];
      valB = byDate[nextKey]?.[metricB];
    }
    if (valB == null) continue;
    pairs.push([Number(valA), Number(valB)]);
  }
  return pairs;
}

function buildExplanation(metricA, metricB, direction, dayOffset) {
  const key = `${metricA}|${metricB}|${direction}`;
  if (EXPLANATION_TEMPLATES[key]) return EXPLANATION_TEMPLATES[key];
  const offsetNote = dayOffset > 0 ? ' the next day' : '';
  return `${direction === 'positive' ? 'Higher' : 'Lower'} ${metricA} is linked to ${direction === 'positive' ? 'higher' : 'lower'} ${metricB}${offsetNote} for you`;
}

async function computeUserCorrelations(base44, userId) {
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const sixtyDaysAgoStr = sixtyDaysAgo.toISOString().split('T')[0];
  const today = new Date().toISOString().split('T')[0];

  const allCheckins = await base44.asServiceRole.entities.DailyCheckins.filter({ user_id: userId });
  const checkins = allCheckins.filter(c => c.date >= sixtyDaysAgoStr);
  if (checkins.length < 7) return 0;

  let written = 0;
  for (const [metricA, metricB, dayOffset] of METRIC_PAIRS) {
    const pairs = buildPairs(checkins, metricA, metricB, dayOffset);
    if (pairs.length < 5) continue;

    const r = pearsonCorrelation(pairs);
    if (Math.abs(r) < 0.25) continue;

    const direction = r > 0 ? 'positive' : 'negative';
    const strength = Math.abs(r);
    const confidence = pairs.length >= 14 ? 'high' : pairs.length >= 7 ? 'medium' : 'low';
    const explanation = buildExplanation(metricA, metricB, direction, dayOffset);

    // Upsert: delete existing then create
    const existing = await base44.asServiceRole.entities.Correlations.filter({ user_id: userId, metric_a: metricA, metric_b: metricB });
    for (const e of existing) await base44.asServiceRole.entities.Correlations.delete(e.id).catch(() => {});

    await base44.asServiceRole.entities.Correlations.create({
      user_id: userId,
      metric_a: metricA,
      metric_b: metricB,
      direction,
      strength: parseFloat(strength.toFixed(3)),
      confidence,
      sample_size: pairs.length,
      explanation_text: explanation,
      computed_at: new Date().toISOString(),
      date_range: `${sixtyDaysAgoStr} to ${today}`,
    });
    written++;
  }
  return written;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json().catch(() => ({}));
    // Support on-demand single user or full sweep
    if (body.user_id) {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const written = await computeUserCorrelations(base44, body.user_id);
      return Response.json({ success: true, correlations_written: written });
    }

    // Scheduled sweep — admin only
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const profiles = await base44.asServiceRole.entities.UserProfile.list();
    let total = 0;
    for (const profile of profiles) {
      if (!profile.user_id) continue;
      const written = await computeUserCorrelations(base44, profile.user_id);
      total += written;
    }
    return Response.json({ success: true, users_processed: profiles.length, correlations_written: total });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});