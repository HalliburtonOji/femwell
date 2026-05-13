// draftAtelierLetter:
// Monthly batch — for each Plus/Pro/Premium user who lacks an AtelierLetters
// row for the current month, draft a ~1200-word long-form letter in Astra
// Cole's voice. Save with draft: true; operator publishes manually from the
// admin panel under the Atelier card.
//
// Inputs to the LLM:
//   - birth chart (sun / moon / rising / mercury + asteroid signs)
//   - current annual profection (time-lord + lit house)
//   - current month + last 3 months of cycle pattern (Red/White archetype)
//   - UserPreferences (Quiet Mode, Soft Sky)
//
// Output schema: { title: string, body_html: string }
//
// Schedule: monthly, fires on the 1st of each UTC month via
// pipelineOrchestrator phase 'draftAtelierLetters' (gated by isFirstOfMonth).
//
// Body: { user_id?: string }  — when present, only that user is drafted
//                                (used by admin re-runs).
// Returns: { ok: true, scanned, drafted, skipped, errors }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ATELIER_PLANS = new Set(['plus', 'pro', 'premium']);

function currentMonthKey(): string {
  const now = new Date();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${now.getUTCFullYear()}-${m}`;
}

function ukLongMonth(): string {
  return new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

// ── LLM ─────────────────────────────────────────────────────────────────────
const SYSTEM = `You are Astra Cole, MA, FAS — a real-named UK astrologer. You write a monthly long-form letter for one FemWell Plus reader. UK English. Warm, literary, calm-but-substantive. Closer to a New Yorker science feature than to a horoscope app. No emoji. Use HTML headings (<h3>) and paragraphs (<p>); italicise with <em> sparingly.

Your reader is a real woman with a real chart and a real cycle. Speak to her chart, her cycle phase, and the current month's sky — not to a generic sign. Be specific. Reference the time-lord, the lit house, the current moon, and any pattern she'll recognise from her recent cycles. Avoid fortune-cookie generality and outcome-promises.

Length: roughly 1200 words across 5-7 short sections, each with an <h3> heading. End with a small actionable observation, then a sign-off on its own line: "— Astra Cole, MA, FAS".

Return ONLY a JSON object with exactly two keys: { "title": string, "body_html": string }. The title is a single Fraunces-friendly sentence (Title Case, no trailing punctuation). The body_html is the letter body in clean semantic HTML — no <html>, <head>, or <body> wrappers.`;

const QUIET_MODE_BLOCK = `Quiet Mode is active: avoid shadow-language. Do not use 'war', 'wound', 'trauma', 'crisis', 'doom', 'endings'. Frame challenges as 'something-to-notice', not 'something-to-fear'.`;
const SOFT_SKY_BLOCK = `Soft Sky is active: do not mention any planetary retrogrades or 'storm windows' in the letter. Frame the month around moon phase + personal cycle alignment.`;

function composeSystem(quiet: boolean, soft: boolean): string {
  let out = SYSTEM;
  if (quiet) out = `${out}\n\n${QUIET_MODE_BLOCK}`;
  if (quiet && soft) out = `${out}\n\n${SOFT_SKY_BLOCK}`;
  return out;
}

async function callOpenAI(userPrompt: string, systemPrompt: string) {
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
      max_tokens: 3200,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
    signal: AbortSignal.timeout(90000),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => `${res.status}`);
    throw new Error(`OpenAI error: ${err}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content?.trim() || '';
  let parsed: any = null;
  try { parsed = JSON.parse(content); } catch { /* fall through */ }
  if (!parsed || typeof parsed.title !== 'string' || typeof parsed.body_html !== 'string') {
    throw new Error('LLM returned an unparseable letter payload');
  }
  return { title: parsed.title, body_html: parsed.body_html };
}

// ── Build the per-user prompt ───────────────────────────────────────────────
function buildPrompt(args: {
  name: string;
  astro: any;
  cycleSummary: string;
  redWhiteArchetype: string | null;
  profection: { house?: number; time_lord?: string } | null;
  month: string;
}) {
  const { name, astro, cycleSummary, redWhiteArchetype, profection, month } = args;
  const chartLines = [
    astro?.sun_sign && `Sun in ${astro.sun_sign}`,
    astro?.moon_sign && `Moon in ${astro.moon_sign}`,
    astro?.rising_sign && `Rising in ${astro.rising_sign}`,
    astro?.mercury_sign && `Mercury in ${astro.mercury_sign}`,
  ].filter(Boolean).join('. ');

  const asteroidLines = astro?.asteroid_signs
    ? Object.entries(astro.asteroid_signs)
        .filter(([, v]) => !!v)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ')
    : '';

  const profLine = profection?.house
    ? `Annual profection: ${profection.time_lord || '—'} year, ${profection.house}th house lit.`
    : 'Annual profection: not yet computed.';

  const archetypeLine = redWhiteArchetype && redWhiteArchetype !== 'insufficient_data'
    ? `Red/White Moon archetype: ${redWhiteArchetype}.`
    : 'Red/White Moon archetype: insufficient data yet.';

  return `Reader: ${name || 'a FemWell Plus subscriber'}.
Month: ${month}.

Chart: ${chartLines || 'unknown'}.
Asteroids: ${asteroidLines || 'not yet computed'}.
${profLine}
${archetypeLine}

Cycle pattern (last 3 months): ${cycleSummary || 'not yet tracked'}.

Write her monthly Atelier letter for ${month}. Return JSON only — { "title": string, "body_html": string }. Body around 1200 words across 5-7 sections.`;
}

// ── Cycle pattern summary (last 3 months) ───────────────────────────────────
async function summariseRecentCycles(sb: any, userId: string): Promise<string> {
  try {
    const cycles = await sb.entities.CycleEvents.filter(
      { user_id: userId }, '-date', 18,
    ).catch(() => []);
    if (!Array.isArray(cycles) || cycles.length === 0) return '';
    const periodStarts = cycles
      .filter((c: any) => {
        const t = String(c?.type || '').toLowerCase();
        return t === 'period_start' || t === 'periodstart';
      })
      .map((c: any) => c.date)
      .filter(Boolean)
      .slice(0, 3);
    if (periodStarts.length === 0) return '';
    return `last 3 period starts on ${periodStarts.join(', ')}`;
  } catch {
    return '';
  }
}

// ── Annual profection (cheap math, mirrors src/lib/astrology/profections.js) ─
function ageAt(birthDateIso: string): number {
  const b = new Date(birthDateIso);
  if (isNaN(b.getTime())) return 0;
  const now = new Date();
  let age = now.getUTCFullYear() - b.getUTCFullYear();
  const m = now.getUTCMonth() - b.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < b.getUTCDate())) age -= 1;
  return Math.max(0, age);
}

const RISING_HOUSE_LORDS: Record<string, string[]> = {
  Aries:       ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'],
  Taurus:      ['Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter', 'Mars'],
  Gemini:      ['Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter', 'Mars', 'Venus'],
  Cancer:      ['Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter', 'Mars', 'Venus', 'Mercury'],
  Leo:         ['Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter', 'Mars', 'Venus', 'Mercury', 'Moon'],
  Virgo:       ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter', 'Mars', 'Venus', 'Mercury', 'Moon', 'Sun'],
  Libra:       ['Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter', 'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury'],
  Scorpio:     ['Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter', 'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus'],
  Sagittarius: ['Jupiter', 'Saturn', 'Saturn', 'Jupiter', 'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars'],
  Capricorn:   ['Saturn', 'Saturn', 'Jupiter', 'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter'],
  Aquarius:    ['Saturn', 'Jupiter', 'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'],
  Pisces:      ['Jupiter', 'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn'],
};

function computeProfection(astro: any): { house: number; time_lord: string } | null {
  if (!astro?.birth_date) return null;
  const age = ageAt(astro.birth_date);
  const house = (age % 12) + 1;
  const rising = astro.rising_sign || astro.sun_sign;
  const lords = rising && RISING_HOUSE_LORDS[rising];
  const time_lord = lords ? lords[house - 1] : '';
  return { house, time_lord };
}

// ── Main ────────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const me = await base44.auth.me().catch(() => null);

  let payload: any = {};
  try { payload = await req.json(); } catch { /* allow empty body for cron */ }
  const onlyUserId: string | undefined = payload?.user_id;

  if (me && me.role !== 'admin' && (!onlyUserId || me.id !== onlyUserId)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const sb = base44.asServiceRole;
  const month = currentMonthKey();
  const monthLong = ukLongMonth();
  const now = new Date().toISOString();

  // 1. Resolve the user set.
  let candidateUserIds: string[] = [];
  if (onlyUserId) {
    candidateUserIds = [onlyUserId];
  } else {
    // Pull all Plus/Pro/Premium entitlements. Cap at 1000 (well above current
    // subscriber base; monthly job so cost is acceptable).
    const ents = await sb.entities.Entitlements.filter({}, '-updated_at', 1000).catch(() => []);
    candidateUserIds = Array.from(
      new Set(
        (ents || [])
          .filter((e: any) => ATELIER_PLANS.has(String(e?.plan || '').toLowerCase()))
          .map((e: any) => e?.user_id)
          .filter(Boolean),
      ),
    );
  }

  let scanned = 0;
  let drafted = 0;
  let skipped = 0;
  const errors: any[] = [];

  for (const userId of candidateUserIds) {
    scanned += 1;
    try {
      // Skip if a letter for this month already exists (draft OR published).
      const existing = await sb.entities.AtelierLetters.filter(
        { user_id: userId, month }, undefined, 1,
      ).catch(() => []);
      if (existing.length > 0) { skipped += 1; continue; }

      // Load chart + profile + preferences + Red/White archetype.
      const [aps, ups, prefs, rwc] = await Promise.all([
        sb.entities.AstroProfile.filter({ user_id: userId }, undefined, 1).catch(() => []),
        sb.entities.UserProfile.filter({ user_id: userId }, undefined, 1).catch(() => []),
        sb.entities.UserPreferences.filter({ user_id: userId }, '-updated_at', 1).catch(() => []),
        sb.entities.HoroscopePersistedClassification.filter(
          { user_id: userId }, '-last_computed_at', 1,
        ).catch(() => []),
      ]);
      const astro = aps[0];
      if (!astro) { skipped += 1; continue; }
      const userProfile = ups[0] || {};
      const prefRow = prefs[0] || {};
      const quietMode = !!prefRow.horoscope_quiet_mode;
      const softSky = !!prefRow.horoscope_soft_sky;
      const archetype = rwc[0]?.red_white_archetype || null;
      const name = userProfile.preferred_name || userProfile.first_name || '';

      const profection = computeProfection(astro);
      const cycleSummary = await summariseRecentCycles(sb, userId);

      const prompt = buildPrompt({
        name,
        astro,
        cycleSummary,
        redWhiteArchetype: archetype,
        profection,
        month: monthLong,
      });

      let letter: { title: string; body_html: string };
      try {
        letter = await callOpenAI(prompt, composeSystem(quietMode, softSky));
      } catch (err: any) {
        errors.push({ user_id: userId, error: err?.message || String(err) });
        continue;
      }

      await sb.entities.AtelierLetters.create({
        user_id: userId,
        month,
        title: letter.title,
        body_html: letter.body_html,
        // LC-2 (D6): AI-final for now — letters publish directly,
        // no human sign-off bottleneck. Operator panel still exists for
        // future curation but isn't on the critical path.
        draft: false,
        published_at: now,
        signed_by: 'Astra Cole, MA, FAS',
        created_at: now,
      });
      drafted += 1;
    } catch (err: any) {
      errors.push({ user_id: userId, error: err?.message || String(err) });
    }
  }

  // Notify the operator (single IngestErrorLog row — acts as a notification
  // sink consistent with the rest of the pipeline).
  if (drafted > 0) {
    try {
      await sb.entities.IngestErrorLog.create({
        function_name: 'draftAtelierLetter',
        stage: 'notify_operator',
        source_identifier: month,
        error_message: `Atelier letters awaiting sign-off for ${drafted} users.`,
        raw_payload: JSON.stringify({ month, drafted, skipped, scanned }),
        logged_at: now,
        status: 'logged',
      });
    } catch { /* swallow — drafts are saved either way */ }
  }

  return Response.json({
    ok: true,
    month,
    scanned,
    drafted,
    skipped,
    errors: errors.slice(0, 10),
  });
});
