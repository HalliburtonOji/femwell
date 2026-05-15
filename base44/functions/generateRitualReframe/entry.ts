// generateRitualReframe — Planner Phase 2 C7 (MP-A2).
//
// Short LLM call that turns a stuck/queued ritual into a gentler reframe line
// shown as the italic gold shimmer below the ritual card body. Aligned to the
// brand voice — permissive, never minimising, never body-negative.
//
// Body (signed-in user):
//   POST { ritualName: "5-minute reading", phase: "luteal", state: "stuck" }
//
// Returns: { ok, reframe }                  — 6–14 words, no quotes, no emoji
//          { ok: false, error: "..." }      — on validation / LLM failure
//
// Spec ref: claude-state/base44_mps/2026-05-14_planner_phase2/spec_v2.md §C7.
// Costs ~$0.0005/call on gpt-5-mini. FE caches by (ritualName × phase × state)
// for 24h so we don't burn credits on every render.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ALLOWED_STATES = new Set(['stuck', 'streaky', 'idle', 'drifting']);
const ALLOWED_PHASES = new Set(['menstrual', 'follicular', 'ovulatory', 'luteal', '']);

function clamp(str, max) {
  if (!str) return '';
  const s = String(str).trim();
  return s.length > max ? s.slice(0, max) : s;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (!me?.id) return Response.json({ error: 'Unauthenticated' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const ritualName = clamp(body?.ritualName, 80);
    const phase = clamp(body?.phase, 16);
    const state = clamp(body?.state, 16) || 'stuck';

    if (!ritualName) return Response.json({ ok: false, error: 'ritualName is required' }, { status: 400 });
    if (!ALLOWED_STATES.has(state)) return Response.json({ ok: false, error: 'invalid state' }, { status: 400 });
    if (!ALLOWED_PHASES.has(phase)) return Response.json({ ok: false, error: 'invalid phase' }, { status: 400 });

    const phaseClause = phase
      ? `It's currently the ${phase} phase of her cycle.`
      : '';

    const prompt = `You write one-line reframes for ritual tasks that a user hasn't started yet. Brand voice: permissive, warm, never minimising, never body-negative, no medical language, no emoji, never use the words "just" or "only" in a dismissive way. ${phaseClause}

The ritual is: "${ritualName}"
The state is: "${state}"

Return ONE short reframe — 6 to 14 words, no quotes, no full stop, no markdown — that softens the ask without minimising. Examples of tone:
- "Two minutes if five feels long today"
- "Even half the walk still counts"
- "A sip of water counts here"

Reply with just the reframe text.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'gpt_5_mini',
      prompt,
      max_tokens: 60,
    }).catch((err) => ({ error: String(err?.message || err) }));

    if (!result || result.error) {
      return Response.json({ ok: false, error: result?.error || 'LLM unavailable' }, { status: 502 });
    }

    // Different InvokeLLM call sites in this repo unwrap slightly differently.
    const raw = typeof result === 'string' ? result : (result?.text || result?.completion || result?.response || '');
    const reframe = clamp(raw, 140)
      .replace(/^[\s"'`]+|[\s"'`]+$/g, '')
      .replace(/\.$/g, '')
      .trim();

    if (!reframe) return Response.json({ ok: false, error: 'empty reframe' }, { status: 502 });
    return Response.json({ ok: true, reframe });
  } catch (err) {
    return Response.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
});
