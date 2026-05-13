// askStars:
// Single-shot horoscope-grounded answer to one question. Uses the existing
// AdviceThreads + AdviceMessages entities (topic: "horoscope") so questions
// + answers persist + are visible in the main Jess history.
//
// Body: { user_id, question }
// Returns: { ok: true, thread_id, answer, question_msg, answer_msg }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ── Chart facts (same table as elsewhere) ───────────────────────────────────
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
function signInfo(name: string) {
  return ZODIAC.find((z) => z.name === name) || null;
}

// ── Moon math (mirror of generateHoroscopeReading) ──────────────────────────
const SYNODIC = 29.530588;
const REF_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14, 0);
function getMoonPhase(date: Date) {
  const days = (date.getTime() - REF_NEW_MOON_MS) / 86400000;
  const cycles = days / SYNODIC;
  let position = cycles - Math.floor(cycles);
  if (position < 0) position += 1;
  const illumination = Math.round(50 * (1 - Math.cos(2 * Math.PI * position)));
  const buckets = [
    { name: 'New', min: 0, max: 0.03 },
    { name: 'Waxing crescent', min: 0.03, max: 0.22 },
    { name: 'First quarter', min: 0.22, max: 0.28 },
    { name: 'Waxing gibbous', min: 0.28, max: 0.47 },
    { name: 'Full', min: 0.47, max: 0.53 },
    { name: 'Waning gibbous', min: 0.53, max: 0.72 },
    { name: 'Last quarter', min: 0.72, max: 0.78 },
    { name: 'Waning crescent', min: 0.78, max: 0.97 },
    { name: 'New', min: 0.97, max: 1.01 },
  ];
  const b = buckets.find((x) => position >= x.min && position < x.max) || buckets[0];
  return { name: b.name, pct: illumination, waxing: position < 0.5 };
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

// ── LLM ─────────────────────────────────────────────────────────────────────
const SYSTEM = `You are Astra, FemWell's astrology voice. Warm, literary, UK English. Year-9 reading level for the action; literary cadence in description. No emoji. No Markdown headings. Use *word* sparingly to italicise.

You answer one question grounded in the reader's actual chart and today's astrology + cycle phase. Be specific. Refer to the chart facts. Avoid fortune-cookie generality. Be honest about friction; don't promise outcomes.

Length: 80-130 words. Address the reader as "you". One paragraph. End with a small actionable suggestion or observation, not a sweeping pronouncement.`;

// Quiet Mode + Soft Sky additions — appended when UserPreferences flags are on.
const QUIET_MODE_BLOCK = `Quiet Mode is active: avoid shadow-language. Do not use words like 'war', 'wound', 'trauma', 'crisis', 'doom', 'endings'. Frame challenges as 'something-to-notice', not 'something-to-fear'.`;
const SOFT_SKY_BLOCK = `Soft Sky is active: do not mention any planetary retrogrades or 'storm windows' in the daily reading. Stick to the moon-phase and personal-cycle alignment for daily framing.`;

function composeSystem(quiet: boolean, soft: boolean): string {
  let out = SYSTEM;
  if (quiet) out = `${out}\n\n${QUIET_MODE_BLOCK}`;
  if (quiet && soft) out = `${out}\n\n${SOFT_SKY_BLOCK}`;
  return out;
}

async function callOpenAI(userPrompt: string, systemPrompt: string = SYSTEM) {
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
      temperature: 0.75,
      max_tokens: 320,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => `${res.status}`);
    throw new Error(`OpenAI error: ${err}`);
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || '';
}

// ── Main ────────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const me = await base44.auth.me().catch(() => null);

  let payload: any;
  try { payload = await req.json(); }
  catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }

  const { user_id, question } = payload || {};
  if (!user_id) return Response.json({ error: 'user_id required' }, { status: 400 });
  if (!question || !String(question).trim()) {
    return Response.json({ error: 'question required' }, { status: 400 });
  }
  if (me && me.role !== 'admin' && me.id !== user_id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const sb = base44.asServiceRole;

  // Load chart + cycle context + tone preferences
  const [aps, ups, prefs] = await Promise.all([
    sb.entities.AstroProfile.filter({ user_id }, undefined, 1).catch(() => []),
    sb.entities.UserProfile.filter({ user_id }, undefined, 1).catch(() => []),
    sb.entities.UserPreferences.filter({ user_id }, '-updated_at', 1).catch(() => []),
  ]);
  const astro = aps[0];
  if (!astro) return Response.json({ error: 'No AstroProfile — onboard first.' }, { status: 422 });
  const userProfile = ups[0] || {};
  const prefRow = prefs[0] || {};
  const quietMode = !!prefRow.horoscope_quiet_mode;
  const softSky = !!prefRow.horoscope_soft_sky;

  const cyclePhase = getCyclePhase(userProfile);
  const moon = getMoonPhase(new Date());
  const sunSign = astro.sun_sign;
  const sunRec = sunSign ? signInfo(sunSign) : null;
  const name = userProfile.preferred_name || userProfile.first_name || '';

  // Compose the chart-grounded prompt
  const chartLines = [
    sunSign && `Sun in ${sunSign}${sunRec ? ` (${sunRec.element}, ruled by ${sunRec.ruler})` : ''}`,
    astro.moon_sign && `Moon in ${astro.moon_sign}`,
    astro.rising_sign && `Rising in ${astro.rising_sign}`,
    astro.mercury_sign && `Mercury in ${astro.mercury_sign}`,
  ].filter(Boolean).join('. ');

  const prompt = `Reader: ${name || 'a FemWell user'}.
Chart: ${chartLines}.
Cycle phase: ${cyclePhase || 'not tracked'}.
Sky today: ${moon.name} moon at ${moon.pct}% illumination, ${moon.waxing ? 'waxing' : 'waning'}.

Question: "${String(question).trim()}"

Answer in 80-130 words. Be specific to their chart + today's sky + cycle phase. One paragraph. End with a small concrete suggestion.`;

  let answer = '';
  try { answer = await callOpenAI(prompt, composeSystem(quietMode, softSky)); }
  catch (err: any) { return Response.json({ error: err?.message || 'LLM failed' }, { status: 502 }); }
  if (!answer) return Response.json({ error: 'Empty answer' }, { status: 502 });

  // Persist to AdviceThreads + AdviceMessages so it shows up in Jess history.
  // One thread per Ask-the-Stars session (we always create new — different
  // questions are different threads).
  let thread;
  try {
    thread = await sb.entities.AdviceThreads.create({
      user_id,
      topic: 'horoscope',
      title: String(question).slice(0, 80),
    });
  } catch {
    // Persist-on-fail: if the thread create blew up, the user still deserves
    // to see their answer AND the operator deserves to be able to recover
    // the exchange. Log to IngestErrorLog so a human can replay it later.
    await sb.entities.IngestErrorLog.create({
      function_name: 'askStars',
      source_identifier: 'askStars',
      stage: 'publish',
      error_message: 'AdviceThreads.create failed — answer returned to user with thread_id: null',
      raw_payload: JSON.stringify({ user_id, question: String(question).trim(), answer }),
      logged_at: new Date().toISOString(),
    }).catch(() => { /* swallow — answer is more important than the log */ });
    return Response.json({ ok: true, answer, thread_id: null });
  }

  const questionMsg = await sb.entities.AdviceMessages.create({
    thread_id: thread.id,
    user_id,
    role: 'user',
    content: String(question).trim(),
  }).catch(() => null);

  const answerMsg = await sb.entities.AdviceMessages.create({
    thread_id: thread.id,
    user_id,
    role: 'assistant',
    content: answer,
  }).catch(() => null);

  return Response.json({
    ok: true,
    answer,
    thread_id: thread.id,
    question_msg: questionMsg,
    answer_msg: answerMsg,
  });
});
