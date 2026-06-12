// generateCompatibility:
// Synastry reading between the signed-in user and another person identified
// only by name + birthday. Sun-sign-only (we don't ask for their birth time).
//
// Body: { user_id, their_name, their_birthday, force? }
// Returns: { ok: true, reading: <row>, cached?: boolean }
//
// Flow:
//   1. Load the user's AstroProfile (need their sun sign)
//   2. Compute their_sun_sign from their_birthday
//   3. Cache check: if (user_id, their_birthday, normalised their_name)
//      already has a row and !force, return it. People are stable enough
//      that re-running every time is wasteful.
//   4. Compute deterministic base score from element + modality interplay
//   5. Call GPT-4o-mini for label + narrative + 4 dimension scores
//      (dimensions stay within ±15 of the base so the math is internally
//      consistent — talk dominates for Air/Mercury, touch dominates for
//      Earth/Water, etc.)
//   6. Save CompatibilityReading row

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ── Sun-sign math (mirrored from src/utils/astrology.js) ────────────────────
const ZODIAC = [
  { name: 'Capricorn',  element: 'Earth', modality: 'Cardinal', start: [12, 22], end: [ 1, 19] },
  { name: 'Aquarius',   element: 'Air',   modality: 'Fixed',    start: [ 1, 20], end: [ 2, 18] },
  { name: 'Pisces',     element: 'Water', modality: 'Mutable',  start: [ 2, 19], end: [ 3, 20] },
  { name: 'Aries',      element: 'Fire',  modality: 'Cardinal', start: [ 3, 21], end: [ 4, 19] },
  { name: 'Taurus',     element: 'Earth', modality: 'Fixed',    start: [ 4, 20], end: [ 5, 20] },
  { name: 'Gemini',     element: 'Air',   modality: 'Mutable',  start: [ 5, 21], end: [ 6, 20] },
  { name: 'Cancer',     element: 'Water', modality: 'Cardinal', start: [ 6, 21], end: [ 7, 22] },
  { name: 'Leo',        element: 'Fire',  modality: 'Fixed',    start: [ 7, 23], end: [ 8, 22] },
  { name: 'Virgo',      element: 'Earth', modality: 'Mutable',  start: [ 8, 23], end: [ 9, 22] },
  { name: 'Libra',      element: 'Air',   modality: 'Cardinal', start: [ 9, 23], end: [10, 22] },
  { name: 'Scorpio',    element: 'Water', modality: 'Fixed',    start: [10, 23], end: [11, 21] },
  { name: 'Sagittarius', element: 'Fire',  modality: 'Mutable',  start: [11, 22], end: [12, 21] },
];

function getSunSign(dateStr: string): { name: string; element: string; modality: string } | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  for (const z of ZODIAC) {
    const [sm, sd] = z.start;
    const [em, ed] = z.end;
    if (sm > em) {
      if ((m === sm && day >= sd) || (m === em && day <= ed)) return { name: z.name, element: z.element, modality: z.modality };
    } else {
      if ((m === sm && day >= sd) || (m === em && day <= ed)) return { name: z.name, element: z.element, modality: z.modality };
    }
  }
  return null;
}

const ELEMENT_AFFINITY: Record<string, Record<string, number>> = {
  Fire:  { Fire: 80, Air:   85, Earth: 60, Water: 55 },
  Air:   { Air:  80, Fire:  85, Water: 65, Earth: 60 },
  Earth: { Earth: 80, Water: 85, Fire:  60, Air:   60 },
  Water: { Water: 78, Earth: 85, Fire:  55, Air:   65 },
};
const MODALITY_BUMP: Record<string, Record<string, number>> = {
  Cardinal: { Cardinal: -5, Fixed: +3, Mutable: +5 },
  Fixed:    { Cardinal: +3, Fixed: -8, Mutable: +4 },
  Mutable:  { Cardinal: +5, Fixed: +4, Mutable: -3 },
};

function elementPair(a: string, b: string): string {
  if (a === b) return `${a} meets ${a}`;
  return `${a} meets ${b}`;
}

function baseScore(a: { element: string; modality: string }, b: { element: string; modality: string }): number {
  const base = (ELEMENT_AFFINITY[a.element] && ELEMENT_AFFINITY[a.element][b.element]) || 65;
  const bump = (MODALITY_BUMP[a.modality] && MODALITY_BUMP[a.modality][b.modality]) || 0;
  return Math.max(40, Math.min(95, base + bump));
}

function normaliseName(s: string): string {
  return (s || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

// ── LLM ─────────────────────────────────────────────────────────────────────
const COMPAT_SYSTEM = `You are FemWell's astrology voice — warm, literary, UK English. Year-9 reading level. No emoji, no Markdown. Use *word* sparingly to italicise. Never invent statistics. Synastry should feel observed, not prophetic.

You are scoring how two charts MEET, not whether they are 'good' or 'bad'. Honest about friction, generous about possibility. Avoid romance assumptions — the pair may be friends, family, partners, or strangers.`;

// Quiet Mode + Soft Sky additions — appended when UserPreferences flags are on.
const QUIET_MODE_BLOCK = `Quiet Mode is active: avoid shadow-language. Do not use words like 'war', 'wound', 'trauma', 'crisis', 'doom', 'endings'. Frame challenges as 'something-to-notice', not 'something-to-fear'.`;
const SOFT_SKY_BLOCK = `Soft Sky is active: do not mention any planetary retrogrades or 'storm windows' in the daily reading. Stick to the moon-phase and personal-cycle alignment for daily framing.`;

function composeSystem(quiet: boolean, soft: boolean): string {
  let out = COMPAT_SYSTEM;
  if (quiet) out = `${out}\n\n${QUIET_MODE_BLOCK}`;
  if (quiet && soft) out = `${out}\n\n${SOFT_SKY_BLOCK}`;
  return out;
}

async function callOpenAI(userPrompt: string, systemPrompt: string = COMPAT_SYSTEM) {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) throw new Error('OPENAI_API_KEY not set');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => `${res.status}`);
    throw new Error(`OpenAI error: ${err}`);
  }
  const data = await res.json();
  return JSON.parse(data?.choices?.[0]?.message?.content || '{}');
}

// Timeout guard — an awaited platform/AI call that HANGS would wedge the function.
function withTimeout(p: Promise<any>, ms: number, label: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label}-timeout-${ms}ms`)), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

// ── Main ────────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const me = await base44.auth.me().catch(() => null);

  let payload: any;
  try { payload = await req.json(); }
  catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }

  const { user_id, their_name, their_birthday, force } = payload || {};
  if (!user_id) return Response.json({ error: 'user_id required' }, { status: 400 });
  if (!their_birthday) return Response.json({ error: 'their_birthday required' }, { status: 400 });
  if (me && me.role !== 'admin' && me.id !== user_id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const sb = base44.asServiceRole;
  const nameKey = normaliseName(their_name || '');

  // Cache check
  if (!force) {
    const existing = await withTimeout(sb.entities.CompatibilityReading.filter(
      { user_id, their_birthday },
      '-created_date',
      10,
    ), 2500, 'read').catch(() => []);
    const cached = existing.find((r: any) => normaliseName(r.their_name) === nameKey);
    if (cached) return Response.json({ ok: true, reading: cached, cached: true });
  }

  // Load the user's astro profile + tone preferences in parallel
  const [aps, prefs] = await Promise.all([
    withTimeout(sb.entities.AstroProfile.filter({ user_id }, undefined, 1), 2500, 'read').catch(() => []),
    withTimeout(sb.entities.UserPreferences.filter({ user_id }, '-updated_at', 1), 2500, 'read').catch(() => []),
  ]);
  const astro = aps[0];
  if (!astro) return Response.json({ error: 'No AstroProfile — onboard first.' }, { status: 422 });
  const prefRow = prefs[0] || {};
  const quietMode = !!prefRow.horoscope_quiet_mode;
  const softSky = !!prefRow.horoscope_soft_sky;

  const userSignRec = getSunSign(astro.birth_date) || (astro.sun_sign ? ZODIAC.find(z => z.name === astro.sun_sign) || null : null);
  const theirSignRec = getSunSign(their_birthday);
  if (!userSignRec || !theirSignRec) return Response.json({ error: 'Invalid birth date.' }, { status: 422 });

  const base = baseScore(userSignRec, theirSignRec);
  const pair = elementPair(userSignRec.element, theirSignRec.element);

  // LLM
  const prompt = `User's sun sign: ${userSignRec.name} (${userSignRec.element}, ${userSignRec.modality}).
Other person: ${their_name || 'Their friend'}, born ${their_birthday}, sun in ${theirSignRec.name} (${theirSignRec.element}, ${theirSignRec.modality}).
Element pair: ${pair}.
Base synastry score (from element + modality): ${base}/100.

Return JSON with exactly these keys:
- "label": one-line element-meets-element phrase, e.g. "${pair} · easy but grounding". Use exactly one " · " separator. Lowercase the descriptor.
- "narrative": 70-110 words describing how the two charts actually meet. Be honest about friction. Use "you" for the user, "${their_name || 'they'}" for the other person. No clichés about destiny.
- "score": integer 0-100. Should be within ±8 of ${base} unless the narrative justifies further drift.
- "talk_score": integer 0-100 — how their conversation flows. Air/Mercury signs lift this.
- "touch_score": integer 0-100 — physical and affectionate ease. Earth and Water lift this; Fire next; Air can dip here.
- "trust_score": integer 0-100 — emotional reliability. Fixed-modality pairs lift this; Mutable can dip.
- "grow_score": integer 0-100 — whether this pairing changes them. Cardinal + Mutable mixes lift this.

All four dimension scores should sit roughly within ±15 of "score". Return only valid JSON.`;

  let parsed: any;
  try { parsed = await withTimeout(callOpenAI(prompt, composeSystem(quietMode, softSky)), 20000, 'llm'); }
  catch (err: any) { return Response.json({ error: err?.message || 'LLM failed' }, { status: 502 }); }

  const clamp = (n: any) => {
    const v = Number(n);
    if (!Number.isFinite(v)) return base;
    return Math.max(0, Math.min(100, Math.round(v)));
  };

  const row = {
    user_id,
    user_sun_sign: userSignRec.name,
    their_name: their_name || '',
    their_birthday,
    their_sun_sign: theirSignRec.name,
    score: clamp(parsed.score ?? base),
    label: String(parsed.label || pair),
    narrative: String(parsed.narrative || ''),
    talk_score: clamp(parsed.talk_score ?? base),
    touch_score: clamp(parsed.touch_score ?? base),
    trust_score: clamp(parsed.trust_score ?? base),
    grow_score: clamp(parsed.grow_score ?? base),
    created_at: new Date().toISOString(),
  };

  let saved;
  try { saved = await withTimeout(sb.entities.CompatibilityReading.create(row), 6000, 'write'); }
  catch (err: any) { return Response.json({ error: err?.message || 'Save failed' }, { status: 500 }); }

  return Response.json({ ok: true, reading: saved });
});
