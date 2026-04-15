/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function getCyclePhaseForDate(profile, dateStr) {
  if (!profile.last_period_start_date) return null;
  const cycleLength = profile.cycle_avg_length || 28;
  const periodLength = profile.period_length || 5;
  const last = new Date(profile.last_period_start_date);
  const date = new Date(dateStr);
  const daysSince = Math.floor((date.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  const cycleDay = ((daysSince % cycleLength) + cycleLength) % cycleLength + 1;
  if (cycleDay <= periodLength) return 'menstrual';
  if (cycleDay <= 13) return 'follicular';
  if (cycleDay <= 16) return 'ovulatory';
  return 'luteal';
}

async function generateSkinCycleInsightForUser(base44, userId, profile) {
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const sixtyDaysAgoStr = sixtyDaysAgo.toISOString().split('T')[0];

  const allCheckins = await base44.asServiceRole.entities.DailyCheckins.filter({ user_id: userId });
  const skinCheckins = allCheckins
    .filter(c => c.date >= sixtyDaysAgoStr && c.skin != null)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 60);

  if (skinCheckins.length < 10) return false;

  const byPhase = { menstrual: [], follicular: [], ovulatory: [], luteal: [] };
  for (const checkin of skinCheckins) {
    const phase = getCyclePhaseForDate(profile, checkin.date);
    if (phase && byPhase[phase]) byPhase[phase].push(Number(checkin.skin));
  }

  const phaseAvgs = Object.entries(byPhase)
    .filter(([, vals]) => vals.length >= 3)
    .map(([phase, vals]) => ({ phase, avg: vals.reduce((a, b) => a + b, 0) / vals.length }))
    .sort((a, b) => b.avg - a.avg);

  if (phaseAvgs.length < 2) return false;

  const best = phaseAvgs[0];
  const worst = phaseAvgs[phaseAvgs.length - 1];
  const today = new Date().toISOString().split('T')[0];
  const expires = new Date(Date.now() + 7 * 86400000).toISOString();

  await base44.asServiceRole.entities.InsightCards.create({
    user_id: userId,
    type: 'SKIN_TIP',
    source: 'skin_cycle_engine',
    title: `Your skin is ${worst.avg < 3 ? 'most challenged' : 'most reactive'} in your ${worst.phase} phase`,
    insight_text: `Based on your check-ins, your skin tends to score highest in your ${best.phase} phase (avg ${best.avg.toFixed(1)}/5) and lowest in your ${worst.phase} phase (avg ${worst.avg.toFixed(1)}/5). Consider adjusting your skincare routine around this pattern.`,
    cycle_phase: worst.phase,
    recommended_action_route: '/SkinHair',
    insight_date: today,
    expires_at: expires,
    is_read: false,
  });
  return true;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const profiles = await base44.asServiceRole.entities.UserProfile.list();
    let generated = 0;
    for (const profile of profiles) {
      if (!profile.user_id || !profile.last_period_start_date) continue;
      const created = await generateSkinCycleInsightForUser(base44, profile.user_id, profile);
      if (created) generated++;
    }
    return Response.json({ success: true, generated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});