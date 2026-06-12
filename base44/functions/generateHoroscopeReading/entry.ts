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

function getMoonPhase(date: Date): { name: string; pct: number; waxing: boolean; key: string } {
  const days = (date.getTime() - REF_NEW_MOON_MS) / 86400000;
  const cycles = days / SYNODIC;
  let position = cycles - Math.floor(cycles);
  if (position < 0) position += 1;
  const illumination = Math.round(50 * (1 - Math.cos(2 * Math.PI * position)));
  const buckets = [
    { name: 'New',             key: 'new',              min: 0.00, max: 0.03 },
    { name: 'Waxing crescent', key: 'waxing_crescent',  min: 0.03, max: 0.22 },
    { name: 'First quarter',   key: 'first_quarter',    min: 0.22, max: 0.28 },
    { name: 'Waxing gibbous',  key: 'waxing_gibbous',   min: 0.28, max: 0.47 },
    { name: 'Full',            key: 'full',             min: 0.47, max: 0.53 },
    { name: 'Waning gibbous',  key: 'waning_gibbous',   min: 0.53, max: 0.72 },
    { name: 'Last quarter',    key: 'last_quarter',     min: 0.72, max: 0.78 },
    { name: 'Waning crescent', key: 'waning_crescent',  min: 0.78, max: 0.97 },
    { name: 'New',             key: 'new',              min: 0.97, max: 1.01 },
  ];
  const b = buckets.find((x) => position >= x.min && position < x.max) || buckets[0];
  return { name: b.name, pct: illumination, waxing: position < 0.5, key: b.key };
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

// ── Goddess Bench — deterministic asteroid placements ──────────────────────
// Port of src/lib/astrology/asteroids.js → estimateAsteroidsFromBirth.
// APPROXIMATE — VSOP87-equivalent mean-longitude estimates. Lilith here is
// Black Moon Lilith (lunar apogee, 8.85y precession), NOT asteroid #1181 —
// see H2_DECISIONS.md D3. Upgrade to Swiss Ephemeris in H3.
//
// IMPORTANT: keep this in sync with the frontend asteroids.js port.
const ZODIAC_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];
const ASTEROID_PARAMS: Record<string, { L0: number; periodYrs: number }> = {
  ceres:   { L0: 145, periodYrs: 4.6 },
  pallas:  { L0: 268, periodYrs: 4.62 },
  juno:    { L0: 134, periodYrs: 4.36 },
  vesta:   { L0:  17, periodYrs: 3.63 },
  chiron:  { L0: 252, periodYrs: 50.4 },
  lilith:  { L0:  41, periodYrs: 8.85 },
};
const MS_PER_YEAR = 365.25 * 86400000;
const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);

function signFromLongitude(lon: number): string | null {
  if (lon == null || isNaN(lon)) return null;
  const idx = Math.floor((((lon % 360) + 360) % 360) / 30);
  return ZODIAC_NAMES[idx] || null;
}

function estimateAsteroidsFromBirth(birthDate: string): Record<string, string | null> {
  const out: Record<string, string | null> = {
    ceres: null, pallas: null, juno: null,
    vesta: null, chiron: null, lilith: null,
  };
  const t = new Date(birthDate);
  if (isNaN(t.getTime())) return out;
  const yearsSince = (t.getTime() - J2000_MS) / MS_PER_YEAR;
  for (const name of Object.keys(ASTEROID_PARAMS)) {
    const p = ASTEROID_PARAMS[name];
    const advance = (360 / p.periodYrs) * yearsSince;
    let lon = (p.L0 + advance) % 360;
    if (lon < 0) lon += 360;
    out[name] = signFromLongitude(lon);
  }
  return out;
}

function ukSignoff(): string {
  const d = new Date();
  const day = d.toLocaleDateString('en-GB', { day: 'numeric' });
  const month = d.toLocaleDateString('en-GB', { month: 'short' });
  return `Astra · ${day} ${month}`;
}

function inDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

// ── LLM helpers ─────────────────────────────────────────────────────────────
const NARRATIVE_SYSTEM = `You are FemWell's astrology voice — warm, literary, present-tense, UK English. Year-9 reading level for the action; literary cadence in description. No emoji, no Markdown headings. Use *word* sparingly to italicise. Never invent statistics. No melodrama. Each card a small, true observation. Never include unicode astrology glyphs (sun, moon, mercury, venus, mars, jupiter, saturn glyphs) or moon-phase emoji in any output.`;

// Quiet Mode + Soft Sky additions — appended to the system prompt when the
// user has the respective UserPreferences flags on. See H2c-2 / A3.
const QUIET_MODE_BLOCK = `Quiet Mode is active: avoid shadow-language. Do not use words like 'war', 'wound', 'trauma', 'crisis', 'doom', 'endings'. Frame challenges as 'something-to-notice', not 'something-to-fear'.`;
const SOFT_SKY_BLOCK = `Soft Sky is active: do not mention any planetary retrogrades or 'storm windows' in the daily reading. Stick to the moon-phase and personal-cycle alignment for daily framing.`;

function composeSystemPrompt(base: string, quiet: boolean, soft: boolean): string {
  let out = base;
  if (quiet) out = `${out}\n\n${QUIET_MODE_BLOCK}`;
  if (quiet && soft) out = `${out}\n\n${SOFT_SKY_BLOCK}`;
  return out;
}

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

// Timeout guard — an awaited platform/AI call that HANGS would wedge the function.
function withTimeout(p: Promise<any>, ms: number, label: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label}-timeout-${ms}ms`)), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

async function estimateChart(astro: any) {
  const prompt = `Birth date: ${astro.birth_date}\nBirth time: ${astro.birth_time || 'unknown'}\nBirth place: ${astro.birth_place || 'unknown'}\n\nReturn JSON: { "moon_sign": <zodiac sign or null>, "rising_sign": <zodiac sign or null>, "mercury_sign": <zodiac sign>, "sun_degree": <whole 0-29> }. Use the 12 sign names exactly as: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces.`;
  try {
    return await withTimeout(callOpenAI(CHART_SYSTEM, prompt), 20000, 'llm');
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
  const aps = await withTimeout(sb.entities.AstroProfile.filter({ user_id: requestedUserId }, undefined, 1), 2500, 'read').catch(() => []);
  const astro = aps[0];
  if (!astro) return Response.json({ error: 'No AstroProfile — user has not onboarded.' }, { status: 422 });

  // Idempotency: existing reading — but only short-circuit when the chart is
  // already complete enough that re-running wouldn't add anything new.
  //
  // RACE-CONDITION FIX: if the user has a reading row from earlier today but
  // has since added their birth_time (so moon_sign / rising_sign should now
  // populate), fall through to estimateChart and PATCH today's row with the
  // new triad descriptions. Otherwise the user has to wait until tomorrow.
  let existingToday: any = null;
  if (!force) {
    const existing = await withTimeout(sb.entities.HoroscopeReading.filter(
      { user_id: requestedUserId, reading_date: today },
      '-created_date',
      1,
    ), 2500, 'read').catch(() => []);
    existingToday = existing[0] || null;
    if (existingToday) {
      const chartComplete = !astro.birth_time ||
        (astro.moon_sign && astro.rising_sign);
      if (chartComplete) {
        return Response.json({ ok: true, reading: existingToday, cached: true });
      }
      // else: fall through and re-generate.
    }
  }

  // Load UserProfile for cycle phase + display name
  const ups = await withTimeout(sb.entities.UserProfile.filter({ user_id: requestedUserId }, undefined, 1), 2500, 'read').catch(() => []);
  const userProfile = ups[0] || {};
  const cyclePhase = getCyclePhase(userProfile);
  const name = userProfile.preferred_name || userProfile.first_name || userProfile.display_name || '';

  // Load UserPreferences for Quiet Mode + Soft Sky (A3) tone flags.
  // Soft Sky is only honoured when Quiet Mode is also on (see composeSystemPrompt).
  const prefsRows = await withTimeout(sb.entities.UserPreferences.filter({ user_id: requestedUserId }, '-updated_at', 1), 2500, 'read').catch(() => []);
  const prefs = prefsRows[0] || {};
  const quietMode = !!prefs.horoscope_quiet_mode;
  const softSky = !!prefs.horoscope_soft_sky;

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
          astroUpdated = await withTimeout(sb.entities.AstroProfile.update(astro.id, patch), 6000, 'write');
        } catch {
          astroUpdated = { ...astro, ...patch };
        }
      }
    }
  }

  // Goddess Bench — compute + persist asteroid_signs once per profile.
  // Deterministic; does not require the LLM. See H2_DECISIONS.md D3:
  // Lilith = Black Moon Lilith (lunar apogee), not asteroid #1181.
  if (!astroUpdated.asteroid_signs && astroUpdated.birth_date) {
    const asteroidSigns = estimateAsteroidsFromBirth(astroUpdated.birth_date);
    const hasAny = Object.values(asteroidSigns).some((v) => !!v);
    if (hasAny) {
      try {
        astroUpdated = await withTimeout(sb.entities.AstroProfile.update(astroUpdated.id, {
          asteroid_signs: asteroidSigns,
          asteroids_computed_at: new Date().toISOString(),
        }), 6000, 'write');
      } catch {
        astroUpdated = { ...astroUpdated, asteroid_signs: asteroidSigns };
      }
    }
  }

  // Build narrative prompt
  const datePretty = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const moonLine = `${moon.name} at ${moon.pct}% illumination, ${moon.waxing ? 'waxing' : 'waning'}`;
  const chartLineParts = [
    sunSign && `Sun in ${sunSign}`,
    astroUpdated.moon_sign && `Moon in ${astroUpdated.moon_sign}`,
    astroUpdated.rising_sign && `Rising in ${astroUpdated.rising_sign}`,
    astroUpdated.mercury_sign && `Mercury in ${astroUpdated.mercury_sign}`,
  ].filter(Boolean);
  const chartLine = chartLineParts.join(', ');

  // Asteroid line for the prompt — only include if we have placements.
  const a = astroUpdated.asteroid_signs || {};
  const asteroidParts = ['ceres', 'pallas', 'juno', 'vesta', 'chiron', 'lilith']
    .filter((k) => a[k])
    .map((k) => `${k.charAt(0).toUpperCase() + k.slice(1)} in ${a[k]}`);
  const asteroidLine = asteroidParts.length
    ? `\nGoddess Bench (asteroid placements — Lilith here is Black Moon Lilith, the lunar apogee): ${asteroidParts.join(', ')}.`
    : '';

  const narrPrompt = `The reader is ${name || 'a FemWell user'}. ${chartLine}. Today is ${datePretty}. Their cycle phase is ${cyclePhase || 'unknown'}. The moon is ${moonLine}.${asteroidLine}

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
- "transits_json" (array of 4 objects: {"when":"YYYY-MM-DD","planet":"sun|moon|mercury|venus|mars|jupiter|saturn","title":"max 6 words","desc":"25-35 words"}; pick 4 plausible transits over the next 7 days; if you don't know exact astronomy, write literary transits with valid future dates; never include unicode astrology glyphs)
- "goddess_read" (${asteroidParts.length ? '1-2 italic sentences naming TWO of the Goddess Bench placements above (asteroid + sign) and the tension between them; UK English; no emoji; you may use **word** for the asteroid+sign phrase, and *word* for italicised emphasis' : 'empty string — no asteroid placements available'})
- "weather_energy" (integer 0-10 — today's overall energy, calibrated to the cycle phase and moon phase you described)
- "weather_mood" (two short adjectives, comma-separated, e.g. "Open, decisive" — matches the body of the day)

Return only valid JSON.`;

  let narrative: any;
  try {
    const systemPrompt = composeSystemPrompt(NARRATIVE_SYSTEM, quietMode, softSky);
    narrative = await withTimeout(callOpenAI(systemPrompt, narrPrompt), 20000, 'llm');
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
    goddess_read: typeof narrative.goddess_read === 'string' ? narrative.goddess_read : '',
    astra_signoff: ukSignoff(),
    weather_energy: (typeof narrative.weather_energy === 'number')
      ? Math.max(0, Math.min(10, Math.round(narrative.weather_energy)))
      : 7,
    weather_mood: typeof narrative.weather_mood === 'string' && narrative.weather_mood
      ? narrative.weather_mood
      : 'Open, decisive',
    created_at: new Date().toISOString(),
  };

  // If LLM returned empty transits, scaffold something so the section isn't empty
  if (reading.transits_json.length === 0) {
    reading.transits_json = [
      { when: inDays(2), planet: 'moon',    title: 'Moon shifts phase',    desc: 'The sky changes tone mid-week. Notice your sleep around then.' },
      { when: inDays(4), planet: 'venus',   title: 'Venus moves',          desc: 'Relational weather lifts. A small kindness lands better than a big gesture.' },
      { when: inDays(6), planet: 'mercury', title: 'Mercury reports in',   desc: 'Your messaging clears. Reply to the thing you have been avoiding.' },
      { when: inDays(7), planet: 'sun',     title: 'Sun at the seam',      desc: 'A month ending. Close one open loop before opening another.' },
    ];
  }

  // If a row already exists for today (race-fix path), PATCH it with the
  // fresh moon/rising-aware narrative instead of creating a duplicate.
  let saved;
  try {
    if (existingToday) {
      saved = await withTimeout(sb.entities.HoroscopeReading.update(existingToday.id, reading), 6000, 'write');
    } else {
      saved = await withTimeout(sb.entities.HoroscopeReading.create(reading), 6000, 'write');
    }
  } catch (err: any) {
    return Response.json({ error: err?.message || 'Save failed' }, { status: 500 });
  }

  return Response.json({ ok: true, reading: saved });
});
