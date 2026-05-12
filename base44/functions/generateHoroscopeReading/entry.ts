// generateHoroscopeReading:
// Generate today's HoroscopeReading row for a single user. Idempotent on
// (user_id, today_iso) — re-running returns the existing row.
//
// Body: { user_id: string, force?: boolean }
// Returns: { ok: true, reading: <row> } | { error: string }
//
// Flow:
//   1. Load AstroProfile (abort if none — user hasn't onboarded)
//   2. If reading already exists for today and !force, return it
//   3. Load UserProfile for cycle phase
//   4. Compute moon phase (synodic formula, deterministic — not LLM)
//   5. If birth_time present but moon_sign null, infer moon/rising/mercury
//      via LLM and save back to AstroProfile
//   6. Call GPT-4o-mini for the narrative sections
//   7. Save HoroscopeReading row
//
// Voice mirrors the rest of FemWell: warm, literary, UK English, present
// tense, no Markdown headings, no emoji.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ── Deterministic chart math ────────────────────────────────────────────────
const ZODIAC = [
  { name: 'Capricorn',  ruler: 'Saturn',  element: 'Earth', start: [12, 22], end: [ 1, 19] },
  { name: 'Aquarius',   ruler: 'Uranus',  element: 'Air',   start: [ 1, 20], end: [ 2, 18] },
  { name: 'Pisces',     ruler: 'Neptune', element: 'Water', start: [ 2, 19], end: [ 3, 20] },
  { name: 'Aries',      ruler: 'Mars',    element: 'Fire',  start: [ 3, 21], end: [ 4, 19] },
  { name: 'Taurus',     ruler: 'Venus',   element: 'Earth', start: [ 4, 20], end: [ 5, 20] },
  { name: 'Gemini',     ruler: 'Mercury', element: 'Air',   start: [ 5, 21], end: [ 6, 20] },
  { name: 'Cancer',     ruler: 'Moon',    element: 'Water', start: [ 6, 21], end: [ 7, 22] },
  { name: 'Leo',        ruler: 'Sun',     element: 'Fire',  start: [ 7, 23], end: [ 8, 22] },
  { name: 'Virgo',      ruler: 'Mercury', element: 'Earth', start: [ 8, 23], end: [ 9, 22] },
  { name: 'Libra',      ruler: 'Venus',   element: 'Air',   start: [ 9, 23], end: [10, 22] },
  { name: 'Scorpio',    ruler: 'Pluto',   element: 'Water', start: [10, 23], end: [11, 21] },
  { name: 'Sagittarius', ruler: 'Jupiter', element: 'Fire',  start: [11, 22], end: [12, 21] },
];

function getSunSign(dateStr: string): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  for (const z of ZODIAC) {
    const [sm, sd] = z.start;
    const [em, ed] = z.end;
    if (sm > em) {
      if ((m === sm && day >= sd) || (m === em && day <= ed)) return z.name;
    } else {
      if ((m === sm && day >= sd) || (m === em && day <= ed)) return z.name;
    }
  }
  return null;
}

const SYNODIC = 29.530588;
const REF_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14, 0);

function getMoonPhase(date: Date): { name: string; pct: number; waxing: boolean; glyph: string } {
  const days = (date.getTime() - REF_NEW_MOON_MS) / 86400000;
  const cycles = days / SYNODIC;
  let position = cycles - Math.floor(cycles);
  if (position < 0) position += 1;
  const illumination = Math.round(50 * (1 - Math.cos(2 * Math.PI * position)));
  const buckets = [
    { name: 'New',             glyph: '🌑', min: 0.00, max: 0.03 },
    { name: 'Waxing crescent', glyph: '🌒', min: 0.03, max: 0.22 },
    { name: 'First quarter',   glyph: '🌓', min: 0.22, max: 0.28 },
    { name: 'Waxing gibbous',  glyph: '🌔', min: 0.28, max: 0.47 },
    { name: 'Full',            glyph: '🌕', min: 0.47, max: 0.53 },
    { name: 'Waning gibbous',  glyph: '🌖', min: 0.53, max: 0.72 },
    { name: 'Last quarter',    glyph: '🌗', min: 0.72, max: 0.78 },
    { name: 'Waning crescent', glyph: '🌘', min: 0.78, max: 0.97 },
    { name: 'New',             glyph: '🌑', min: 0.97, max: 1.01 },
  ];
  const b = buckets.find((x) => position >= x.min && position < x.max) || buckets[0];
  return { name: b.name, pct: illumination, waxing: position < 0.5, glyph: b.glyph };
}

function getCyclePhase(profile: any): string | null {
  if (!profile?.last_period_start_date) return null;
  const last = new Date(profile.last_period_start_date);
  if (isNaN(last.getTime())) return null;
  const cycleLen = profile.cycle_avg_length || 28;
  const periodLen = profile.period_length || 5;
  const diff = Math.floor((Date.now() - last.getTime()) / 86400000);
  const day = ((diff % cycleLen) + cycleLen) % cycleLen + 1;
  if (day <= periodLen) return 'menstrual';
  if (day <= 13) return 'follicular';
  if (day <= 16) return 'ovulatory';
  return 'luteal';
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function inDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

// ── LLM helpers ─────────────────────────────────────────────────────────────
const NARRATIVE_SYSTEM = `You are FemWell's astrology voice — warm, literary, present-tense, UK English. Year-9 reading level for the action; literary cadence in description. No emoji, no Markdown headings. Use *word* sparingly to italicise. Never invent statistics. No melodrama. Each card a small, true observation.`;

const CHART_SYSTEM = `You estimate the moon sign, rising sign, and Mercury sign at a person's birth from their date, time and place. Return only JSON. If birth_time is missing, return null for moon_sign and rising_sign. Mercury can be estimated from date alone.`;

async function callOpenAI(systemPrompt: string, userPrompt: string, model = 'gpt-4o-mini') {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) throw new Error('OPENAI_API_KEY not set');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
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
  const content = data?.choices?.[0]?.message?.content || '{}';
  return JSON.parse(content);
}

async function estimateChart(astro: any) {
  const prompt = `Birth date: ${astro.birth_date}\nBirth time: ${astro.birth_time || 'unknown'}\nBirth place: ${astro.birth_place || 'unknown'}\n\nReturn JSON: { "moon_sign": <zodiac sign or null>, "rising_sign": <zodiac sign or null>, "mercury_sign": <zodiac sign>, "sun_degree": <whole 0-29> }. Use the 12 sign names exactly as: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces.`;
  try {
    return await callOpenAI(CHART_SYSTEM, prompt);
  } catch {
    return null;
  }
}

// ── Main handler ────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const me = await base44.auth.me().catch(() => null);
  // Allow service-role (orchestrator) and any signed-in user requesting their
  // own reading. Admin can request any user_id.
  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: 'Bad JSON' }, { status: 400 });
  }
  const { user_id: requestedUserId, force } = payload || {};
  if (!requestedUserId) return Response.json({ error: 'user_id required' }, { status: 400 });
  if (me && me.role !== 'admin' && me.id !== requestedUserId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const sb = base44.asServiceRole;
  const today = todayISO();

  // Load AstroProfile
  const aps = await sb.entities.AstroProfile.filter({ user_id: requestedUserId }, undefined, 1).catch(() => []);
  const astro = aps[0];
  if (!astro) return Response.json({ error: 'No AstroProfile — user has not onboarded.' }, { status: 422 });

  // Idempotency: existing reading
  if (!force) {
    const existing = await sb.entities.HoroscopeReading.filter(
      { user_id: requestedUserId, reading_date: today },
      '-created_date',
      1,
    ).catch(() => []);
    if (existing.length > 0) {
      return Response.json({ ok: true, reading: existing[0], cached: true });
    }
  }

  // Load UserProfile for cycle phase + display name
  const ups = await sb.entities.UserProfile.filter({ user_id: requestedUserId }, undefined, 1).catch(() => []);
  const userProfile = ups[0] || {};
  const cyclePhase = getCyclePhase(userProfile);
  const name = userProfile.preferred_name || userProfile.first_name || userProfile.display_name || '';

  // Deterministic facts
  const sunSign = astro.sun_sign || getSunSign(astro.birth_date);
  const moon = getMoonPhase(new Date());

  // Estimate moon / rising / mercury if missing (only once per profile)
  let astroUpdated = astro;
  if ((!astro.moon_sign || !astro.mercury_sign) && astro.birth_date) {
    const estimated = await estimateChart(astro);
    if (estimated) {
      const patch: any = {};
      if (!astro.sun_sign && sunSign) patch.sun_sign = sunSign;
      if (!astro.moon_sign && estimated.moon_sign && astro.birth_time) patch.moon_sign = estimated.moon_sign;
      if (!astro.rising_sign && estimated.rising_sign && astro.birth_time) patch.rising_sign = estimated.rising_sign;
      if (!astro.mercury_sign && estimated.mercury_sign) patch.mercury_sign = estimated.mercury_sign;
      if (!astro.sun_degree && typeof estimated.sun_degree === 'number') patch.sun_degree = estimated.sun_degree;
      if (Object.keys(patch).length > 0) {
        try {
          astroUpdated = await sb.entities.AstroProfile.update(astro.id, patch);
        } catch {
          astroUpdated = { ...astro, ...patch };
        }
      }
    }
  }

  // Build narrative prompt
  const datePretty = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const moonLine = `${moon.name} at ${moon.pct}% illumination, ${moon.waxing ? 'waxing' : 'waning'}`;
  const chartLine = [
    sunSign && `Sun in ${sunSign}`,
    astroUpdated.moon_sign && `Moon in ${astroUpdated.moon_sign}`,
    astroUpdated.rising_sign && `Rising in ${astroUpdated.rising_sign}`,
    astroUpdated.mercury_sign && `Mercury in ${astroUpdated.mercury_sign}`,
  ].filter(Boolean).join(', ');

  const narrPrompt = `The reader is ${name || 'a FemWell user'}. ${chartLine}. Today is ${datePretty}. Their cycle phase is ${cyclePhase || 'unknown'}. The moon is ${moonLine}.

Write a daily reading in JSON with exactly these keys:
- "headline" (max 9 words, use *word* italics for 1-2 words, e.g. "Mercury *steadies*, the moon *listens*")
- "narrative" (60-90 words, present tense, addresses the reader directly, one specific observation about today)
- "mercury_pill" (e.g. "Mercury in Taurus" — short, no period)
- "triad_sun_desc" (35-45 words: how their sun sign meets *today* specifically, not generic personality)
- "triad_moon_desc" (35-45 words about the moon sign's emotional weather today; null if no moon sign)
- "triad_rising_desc" (35-45 words about how their rising shapes today's first impressions; null if no rising sign)
- "power_title" (4-7 words, sentence case, no period)
- "power_body" (35-50 words — one thing to lean into today)
- "pressure_title" (4-7 words)
- "pressure_body" (35-50 words — the tension to notice, not avoid)
- "trouble_title" (4-7 words)
- "trouble_body" (35-50 words — the small misread to watch for)
- "cycle_moon_headline" (8-12 words, names both cycle phase and moon phase, use *word* italics; e.g. "Luteal body under a *waxing gibbous*")
- "cycle_moon_body" (50-70 words tying cycle phase to moon phase as one instruction)
- "transits_json" (array of 4 objects: {"when":"YYYY-MM-DD","glyph":"☉|☽|☿|♀|♂|♃|♄","title":"max 6 words","desc":"25-35 words"}; pick 4 plausible transits over the next 7 days; if you don't know exact astronomy, write literary transits with valid future dates)

Return only valid JSON.`;

  let narrative: any;
  try {
    narrative = await callOpenAI(NARRATIVE_SYSTEM, narrPrompt);
  } catch (err: any) {
    return Response.json({ error: err?.message || 'LLM failed' }, { status: 502 });
  }

  // Compose reading row (deterministic moon/cycle + LLM narrative)
  const reading = {
    user_id: requestedUserId,
    astro_profile_id: astroUpdated.id,
    reading_date: today,
    headline: narrative.headline || '',
    narrative: narrative.narrative || '',
    moon_phase: moon.name,
    moon_pct: moon.pct,
    mercury_pill: narrative.mercury_pill || (astroUpdated.mercury_sign ? `Mercury in ${astroUpdated.mercury_sign}` : ''),
    triad_sun_desc: narrative.triad_sun_desc || '',
    triad_moon_desc: narrative.triad_moon_desc || '',
    triad_rising_desc: narrative.triad_rising_desc || '',
    power_title: narrative.power_title || '',
    power_body: narrative.power_body || '',
    pressure_title: narrative.pressure_title || '',
    pressure_body: narrative.pressure_body || '',
    trouble_title: narrative.trouble_title || '',
    trouble_body: narrative.trouble_body || '',
    cycle_moon_headline: narrative.cycle_moon_headline || '',
    cycle_moon_body: narrative.cycle_moon_body || '',
    cycle_phase: cyclePhase || '',
    transits_json: Array.isArray(narrative.transits_json) ? narrative.transits_json.slice(0, 4) : [],
    created_at: new Date().toISOString(),
  };

  // If LLM returned empty transits, scaffold something so the section isn't empty
  if (reading.transits_json.length === 0) {
    reading.transits_json = [
      { when: inDays(2), glyph: '☽', title: 'Moon shifts phase', desc: 'The sky changes tone mid-week. Notice your sleep around then.' },
      { when: inDays(4), glyph: '♀', title: 'Venus moves', desc: 'Relational weather lifts. A small kindness lands better than a big gesture.' },
      { when: inDays(6), glyph: '☿', title: 'Mercury reports in', desc: 'Your messaging clears. Reply to the thing you have been avoiding.' },
      { when: inDays(7), glyph: '☉', title: 'Sun at the seam', desc: 'A month ending. Close one open loop before opening another.' },
    ];
  }

  let saved;
  try {
    saved = await sb.entities.HoroscopeReading.create(reading);
  } catch (err: any) {
    return Response.json({ error: err?.message || 'Save failed' }, { status: 500 });
  }

  return Response.json({ ok: true, reading: saved });
});
