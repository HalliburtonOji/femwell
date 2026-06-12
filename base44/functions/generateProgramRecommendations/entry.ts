/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Timeout guard — an awaited platform/AI call that HANGS would wedge the function.
function withTimeout(p: Promise<any>, ms: number, label: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label}-timeout-${ms}ms`)), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const userId = body.user_id || user.id;

    const [profiles, checkins, phases, userPrograms, allPrograms] = await Promise.all([
      withTimeout(base44.asServiceRole.entities.UserProfile.filter({ user_id: userId }), 2500, 'read').catch(() => []),
      withTimeout(base44.asServiceRole.entities.DailyCheckins.filter({ user_id: userId }), 2500, 'read').catch(() => []),
      withTimeout(base44.asServiceRole.entities.PhaseHistory.filter({ user_id: userId }), 2500, 'read').catch(() => []),
      withTimeout(base44.asServiceRole.entities.UserPrograms.filter({ user_id: userId }), 2500, 'read').catch(() => []),
      withTimeout(base44.asServiceRole.entities.Programs.list('-is_featured', 100), 2500, 'read').catch(() => []),
    ]);

    const profile = profiles[0] || {};
    const latestCheckin = checkins.sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0];
    const latestPhase = phases.sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0];

    const activeIds = new Set(userPrograms.map(p => p.program_id));
    const completedIds = new Set(userPrograms.filter(p => p.status === 'completed').map(p => p.program_id));
    const currentPhase = latestPhase?.phase || 'any';
    const currentMood = latestCheckin?.mood || 3;
    const currentStress = latestCheckin?.stress || 3;

    const scored = allPrograms
      .filter(p => !activeIds.has(p.id))
      .map(prog => {
        let score = 0;
        let reason = '';

        if (prog.trigger_phase === currentPhase || prog.trigger_phase === 'any' || !prog.trigger_phase) {
          score += 30;
          reason = `Matched to your ${currentPhase} phase`;
        }

        const goalMatch = (profile.goals || []).some(g => (prog.goal_tags || []).includes(g));
        if (goalMatch) { score += 25; reason = reason || 'Aligned with your goals'; }

        if (currentStress >= 4 && (prog.category === 'stress' || (prog.goal_tags || []).includes('stress'))) {
          score += 20; reason = reason || 'Good for high stress days';
        }
        if (currentMood <= 2 && (prog.category === 'mood' || (prog.goal_tags || []).includes('mood'))) {
          score += 20; reason = reason || 'May help lift your mood';
        }

        const condMatch = (profile.condition_flags || []).some(c => (prog.trigger_condition || '').includes(c));
        if (condMatch) { score += 20; reason = reason || 'Suited to your health profile'; }

        if (!completedIds.has(prog.id)) score += 10;
        if (prog.is_featured) score += 5;

        return { program_id: prog.id, score, reason: reason || 'Recommended for you' };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    // Delete old recs for user and write fresh ones
    const oldRecs = await withTimeout(base44.asServiceRole.entities.ProgramRecommendations.filter({ user_id: userId }), 2500, 'read').catch(() => []);
    await Promise.all(oldRecs.map(r => withTimeout(base44.asServiceRole.entities.ProgramRecommendations.delete(r.id), 6000, 'write').catch(() => {})));

    const created = await Promise.all(scored.map(rec =>
      withTimeout(base44.asServiceRole.entities.ProgramRecommendations.create({
        user_id: userId,
        program_id: rec.program_id,
        reason: rec.reason,
        priority: rec.score,
        created_at: new Date().toISOString(),
      }), 6000, 'write')
    ));

    return Response.json({ success: true, count: created.length, recommendations: scored });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});