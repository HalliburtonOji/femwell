// generateJessHero — Today-A T-A2 (MP-Today-A).
//
// Weekly LLM call that produces the warm, phase-aware narrative hero at the
// top of the /Today page. Brand voice: permissive, lead with the user's own
// pattern not population norms, confidence-honest, no imperatives, no emoji.
//
// Body (signed-in user):
//   POST {
//     phase: "luteal",                  // optional, blank for first-period users
//     week_of_year: 20,                 // ISO week
//     recent_mood_trend: "steady",      // up | steady | down | unknown
//     habit_hit_rate_pct: 67,           // 0-100, unknown allowed
//     cycle_observed_count: 4,          // 0-4+; affects "still learning" framing
//   }
//
// Returns:
//   { ok: true, headline: "...", body: "..." }   // each clamped to 70/200 chars
//   { ok: false, error: "..." }                  // on validation / LLM failure
//
// Caching: the FE caches per (user × week × phase) for 7 days via
// localStorage so we only call this on the first Today render of each ISO
// week. Cost target ≤£20/mo @ 5k MAU per spec default #3 → gpt_5_mini at
// ~$0.0008 per call × ~5k MAU × 4 weeks/mo ≈ $16/mo.
//
// Spec ref: claude-state/base44_mps/2026-05-15_today_redesign_A/spec.md §T-A2.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ALLOWED_PHASES = new Set(['menstrual', 'follicular', 'ovulatory', 'luteal', '']);
const ALLOWED_TRENDS = new Set(['up', 'steady', 'down', 'unknown']);

function clamp(str: unknown, max: number) {
  if (!str) return '';
  const s = String(str).trim();
  return s.length > max ? s.slice(0, max) : s;
}

// Timeout guard — an awaited platform/AI call that HANGS would wedge the function.
function withTimeout(p: Promise<any>, ms: number, label: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label}-timeout-${ms}ms`)), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

Deno.serve(async (req: Request) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (!me?.id) return Response.json({ error: 'Unauthenticated' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const phase = clamp(body?.phase, 16);
    const weekOfYear = Number(body?.week_of_year) || 1;
    const moodTrend = clamp(body?.recent_mood_trend, 16) || 'unknown';
    const habitPct = Number.isFinite(Number(body?.habit_hit_rate_pct)) ? Number(body.habit_hit_rate_pct) : null;
    const cyclesObserved = Number(body?.cycle_observed_count);
    const cyclesObservedSafe = Number.isFinite(cyclesObserved) ? Math.max(0, Math.min(99, cyclesObserved)) : 0;
    // Life Stage context — injected from FE plannerAdapter (Step 4). The
    // jess_context string is the per-stage / per-condition voice + safety
    // brief; we trust it because it is computed client-side from the user's
    // own life_stage and conditions arrays (no free-text). Clamped at 1200
    // chars to keep the prompt budget under control.
    const lifeStage = clamp(body?.life_stage, 32);
    const jessContext = clamp(body?.jess_context, 1200);
    const bannerText = clamp(body?.banner_text, 200);

    if (!ALLOWED_PHASES.has(phase)) return Response.json({ ok: false, error: 'invalid phase' }, { status: 400 });
    if (!ALLOWED_TRENDS.has(moodTrend)) return Response.json({ ok: false, error: 'invalid recent_mood_trend' }, { status: 400 });

    const phaseClause = phase ? `She's currently in the ${phase} phase of her cycle.` : 'Her current phase is not yet known (still learning her pattern).';
    const trendClause =
      moodTrend === 'up'    ? "Her mood has been trending upward over the last week."
    : moodTrend === 'down'  ? "Her mood has been trending lower over the last week — be gentle and don't pile on."
    : moodTrend === 'steady'? "Her mood has been steady over the last week."
    :                         "There isn't enough mood history yet to read a trend.";
    const habitClause = habitPct !== null
      ? `Her habit-completion rate this past week is around ${habitPct}%.`
      : "Habit-completion history is thin so far.";
    const confidenceClause = cyclesObservedSafe < 2
      ? "Honesty rule: you're still learning her cycle — say so plainly if helpful."
      : "";

    // Life Stage block — prepended to the prompt so the LLM picks up the
    // per-stage voice + safety rules from src/utils/plannerAdapter.js.
    const stageBlock = jessContext
      ? `LIFE STAGE CONTEXT (treat as ground truth — outrank generic cycle phrasing):\n${jessContext}\n${bannerText ? `Operative banner she sees today: "${bannerText}".\n` : ''}\n`
      : '';

    const prompt = `${stageBlock}You write a once-per-week warm hero block at the top of a women's wellness app called FemWell. Brand voice: permissive, warm, never minimising, never body-negative, no medical language, no emoji, never use the words "just" or "only" in a dismissive way, no imperatives ("must" / "should"). Use permissive language: "might find", "tends to", "could feel like".

${phaseClause}
${trendClause}
${habitClause}
${confidenceClause}

Write TWO short lines:
1. headline — Fraunces serif, 4 to 9 words, no full stop, no quotes. Lead with HER pattern this week, not population norms. Examples of tone: "This week your evenings settled in" / "A softer rhythm finding you" / "Steadier than last week, in small ways".
2. body — Inter sans-serif, 18 to 36 words, one or two sentences. Reflect on what the week might invite or honour, in her language. Never prescriptive — offer, don't direct. End with a fragment of agency she keeps.

Combined word count ≤ 60.

Reply EXACTLY in this JSON shape, no markdown, no code fence:
{"headline":"...","body":"..."}`;

    const result: any = await withTimeout(base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'gpt_5_mini',
      prompt,
      max_tokens: 200,
    }), 20000, 'llm').catch((err: any) => ({ error: String(err?.message || err) }));

    if (!result || result.error) {
      return Response.json({ ok: false, error: result?.error || 'LLM unavailable' }, { status: 502 });
    }

    const raw = typeof result === 'string' ? result : (result?.text || result?.completion || result?.response || '');
    let parsed: any = null;
    try { parsed = JSON.parse(raw); } catch { /* fall through */ }
    // Some models wrap JSON in stray quotes/whitespace — strip and retry once.
    if (!parsed && typeof raw === 'string') {
      const cleaned = raw.replace(/^[\s`'"]+|[\s`'"]+$/g, '').replace(/^json\s*/i, '');
      try { parsed = JSON.parse(cleaned); } catch { /* fall through */ }
    }
    if (!parsed || !parsed.headline || !parsed.body) {
      return Response.json({ ok: false, error: 'malformed LLM response' }, { status: 502 });
    }

    const headline = clamp(parsed.headline, 70).replace(/^[\s"'`]+|[\s"'`]+$/g, '');
    const heroBody = clamp(parsed.body, 240).replace(/^[\s"'`]+|[\s"'`]+$/g, '');
    if (!headline || !heroBody) {
      return Response.json({ ok: false, error: 'empty fields' }, { status: 502 });
    }

    return Response.json({
      ok: true,
      headline,
      body: heroBody,
      generated_at: new Date().toISOString(),
      life_stage: lifeStage || null,
    });
  } catch (err: any) {
    return Response.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
});
