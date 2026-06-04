// echoSafety — the timing rails for the Echo Wall: the cooling pause, the
// late-night / late-luteal throttle, the 48h fade, and the phase-sister feed
// weighting. All pure functions so they are testable and SSR-safe.

import {
  FADE_HOURS, COOL_MINUTES_BASE, COOL_MINUTES_LATE_LUTEAL,
  NIGHT_START_HOUR, NIGHT_END_HOUR, LATE_LUTEAL_DAY,
  PHASE_MATCH_BOOST, LIFE_STAGE_BOOST, RECENCY_HALFLIFE_MIN,
} from "./echoConfig";

const MIN = 60 * 1000;
const HOUR = 60 * MIN;

export function isLateLuteal(phase, cycleDay) {
  return phase === "luteal" && typeof cycleDay === "number" && cycleDay >= LATE_LUTEAL_DAY;
}

export function isNightHour(date) {
  const h = date.getHours();
  // window wraps midnight: 22:00 -> 06:00
  return h >= NIGHT_START_HOUR || h < NIGHT_END_HOUR;
}

// Next local 06:00 at-or-after `from`.
function nextMorning(from) {
  const m = new Date(from);
  if (m.getHours() >= NIGHT_END_HOUR) m.setDate(m.getDate() + 1);
  m.setHours(NIGHT_END_HOUR, 0, 0, 0);
  return m;
}

// Compute the cooling pause + (optional) night throttle for a post made now.
// Returns { coolMinutes, liveAt, expiresAt, lateLuteal, nightThrottle, note }.
export function computeCooling({ phase, cycleDay, now = new Date() } = {}) {
  const lateLuteal = isLateLuteal(phase, cycleDay);
  const night = isNightHour(now);
  const coolMinutes = lateLuteal ? COOL_MINUTES_LATE_LUTEAL : COOL_MINUTES_BASE;

  let liveAt = new Date(now.getTime() + coolMinutes * MIN);
  let nightThrottle = false;
  let note;

  if (night && lateLuteal) {
    // The most protective combination: hold it until the morning, past the
    // vulnerable late-night/late-luteal window, so it reads in daylight first.
    const morning = nextMorning(now);
    if (morning > liveAt) { liveAt = morning; nightThrottle = true; }
    note = "It is late, and late in your cycle. This will wait until the morning before it goes up — you can pull it back any time before then.";
  } else if (lateLuteal) {
    note = "Late in your cycle, things can feel heavier. This will sit for a little longer before it goes up — you can change your mind.";
  } else {
    note = "This will sit quietly for a few minutes before it goes up. You can pull it back in that time.";
  }

  const expiresAt = new Date(liveAt.getTime() + FADE_HOURS * HOUR);
  return { coolMinutes, liveAt, expiresAt, lateLuteal, nightThrottle, note };
}

// ── live / cooling / expired predicates ──────────────────────────────────────
function ts(v) { try { return v ? new Date(v).getTime() : 0; } catch { return 0; } }

export function isHidden(echo) { return !!echo?.hidden; }
export function isExpired(echo, now = Date.now()) { return ts(echo?.expires_at) <= now; }
export function isCooling(echo, now = Date.now()) {
  return ts(echo?.live_at) > now && !isExpired(echo, now) && !isHidden(echo);
}
export function isLive(echo, now = Date.now()) {
  return !isHidden(echo) && ts(echo?.live_at) <= now && ts(echo?.expires_at) > now;
}

// Hours of life left (for the fade indicator).
export function hoursLeft(echo, now = Date.now()) {
  return Math.max(0, (ts(echo?.expires_at) - now) / HOUR);
}

// ── phase-sister feed weighting (a soft boost, never a hard filter) ──────────
// Everyone's live echoes are eligible; same-phase (and, smaller, same-life-stage)
// echoes are scored higher so they surface more often — but cross-phase echoes
// still interleave, so the wall is the whole room, leaning toward your sisters.
export function scoreEcho(echo, { viewerPhase, viewerLifeStage, now = Date.now() } = {}) {
  let score = 0;
  const ageMin = Math.max(0, (now - ts(echo?.live_at)) / MIN);
  score += RECENCY_HALFLIFE_MIN * Math.pow(0.5, ageMin / RECENCY_HALFLIFE_MIN); // recency, decaying
  if (viewerPhase && echo?.phase && echo.phase === viewerPhase) score += PHASE_MATCH_BOOST;
  if (viewerLifeStage && echo?.life_stage && echo.life_stage === viewerLifeStage) score += LIFE_STAGE_BOOST;
  return score;
}

export function rankFeed(echoes, opts = {}) {
  const now = opts.now || Date.now();
  return (echoes || [])
    .filter((e) => isLive(e, now))
    .map((e) => ({ e, s: scoreEcho(e, { ...opts, now }) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.e);
}
