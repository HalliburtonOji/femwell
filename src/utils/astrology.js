// astrology.js
// Lightweight chart utilities for FemWell's Horoscope tab.
//
// What's here (purely deterministic, no network):
//   - getSunSign(date)            → "Gemini"
//   - getSunDegree(date)          → 23 (whole degree)
//   - getElement(sign)            → "Air"
//   - getModality(sign)           → "Mutable"
//   - getRulingPlanet(sign)       → "Mercury"
//   - getMoonPhase(date)          → { name, pct, illumination, glyph }
//   - sunSignCompatBase(a, b)     → base score 50-90 from element/modality
//   - prettyDateBritish(date)     → "Wednesday · 12 May · 2026"
//
// Moon phase uses a simple synodic formula anchored to 2000-01-06 18:14 UTC
// (a known new moon). Accurate to ~±1% illumination, which is plenty for a
// horoscope reading. For Sun/Mercury sign at any historical date we ignore
// retrograde refinement — those are tied to *day of year*, not hour.
//
// Birth time + birth place are used downstream (LLM prompt → Moon/Rising)
// because computing rising sign needs ecliptic coordinates + ascendant
// math we'd rather offload to GPT than ship an ephemeris.

// ── Sun sign table ──────────────────────────────────────────────────────────
const ZODIAC = [
  { name: "Capricorn",  glyph: "♑", element: "Earth", modality: "Cardinal", ruler: "Saturn",  start: [12, 22], end: [ 1, 19] },
  { name: "Aquarius",   glyph: "♒", element: "Air",   modality: "Fixed",    ruler: "Uranus",  start: [ 1, 20], end: [ 2, 18] },
  { name: "Pisces",     glyph: "♓", element: "Water", modality: "Mutable",  ruler: "Neptune", start: [ 2, 19], end: [ 3, 20] },
  { name: "Aries",      glyph: "♈", element: "Fire",  modality: "Cardinal", ruler: "Mars",    start: [ 3, 21], end: [ 4, 19] },
  { name: "Taurus",     glyph: "♉", element: "Earth", modality: "Fixed",    ruler: "Venus",   start: [ 4, 20], end: [ 5, 20] },
  { name: "Gemini",     glyph: "♊", element: "Air",   modality: "Mutable",  ruler: "Mercury", start: [ 5, 21], end: [ 6, 20] },
  { name: "Cancer",     glyph: "♋", element: "Water", modality: "Cardinal", ruler: "Moon",    start: [ 6, 21], end: [ 7, 22] },
  { name: "Leo",        glyph: "♌", element: "Fire",  modality: "Fixed",    ruler: "Sun",     start: [ 7, 23], end: [ 8, 22] },
  { name: "Virgo",      glyph: "♍", element: "Earth", modality: "Mutable",  ruler: "Mercury", start: [ 8, 23], end: [ 9, 22] },
  { name: "Libra",      glyph: "♎", element: "Air",   modality: "Cardinal", ruler: "Venus",   start: [ 9, 23], end: [10, 22] },
  { name: "Scorpio",    glyph: "♏", element: "Water", modality: "Fixed",    ruler: "Pluto",   start: [10, 23], end: [11, 21] },
  { name: "Sagittarius", glyph: "♐", element: "Fire",  modality: "Mutable",  ruler: "Jupiter", start: [11, 22], end: [12, 21] },
];

function toDate(input) {
  if (!input) return null;
  if (input instanceof Date) return input;
  return new Date(input);
}

/** Returns the zodiac record for a given birth date, or null if invalid. */
export function getZodiac(date) {
  const d = toDate(date);
  if (!d || isNaN(d.getTime())) return null;
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  // Iterate in order — find the sign whose window contains this MM-DD.
  for (const z of ZODIAC) {
    const [sm, sd] = z.start;
    const [em, ed] = z.end;
    if (sm === em) {
      if (m === sm && day >= sd && day <= ed) return z;
    } else if (sm > em) {
      // Wraps year (Capricorn)
      if ((m === sm && day >= sd) || (m === em && day <= ed)) return z;
    } else {
      // Two-month spans (e.g., Mar 21 → Apr 19)
      if ((m === sm && day >= sd) || (m === em && day <= ed)) return z;
    }
  }
  return null;
}

export function getSunSign(date) {
  const z = getZodiac(date);
  return z ? z.name : null;
}

/** Degrees the Sun has travelled through the current sign, 0-29 (whole). */
export function getSunDegree(date) {
  const z = getZodiac(date);
  if (!z) return null;
  const d = toDate(date);
  const year = d.getUTCFullYear();
  // Start-date of the user's sign; handle Capricorn wrap.
  let start;
  if (z.name === "Capricorn" && (d.getUTCMonth() + 1) <= z.end[0]) {
    start = new Date(Date.UTC(year - 1, z.start[0] - 1, z.start[1]));
  } else {
    start = new Date(Date.UTC(year, z.start[0] - 1, z.start[1]));
  }
  const days = Math.floor((d - start) / 86400000);
  // Each sign spans ~30 degrees over ~30 days.
  return Math.max(0, Math.min(29, days));
}

export function getElement(signName) {
  const z = ZODIAC.find((s) => s.name === signName);
  return z?.element || null;
}

export function getModality(signName) {
  const z = ZODIAC.find((s) => s.name === signName);
  return z?.modality || null;
}

export function getRulingPlanet(signName) {
  const z = ZODIAC.find((s) => s.name === signName);
  return z?.ruler || null;
}

export function getZodiacGlyph(signName) {
  const z = ZODIAC.find((s) => s.name === signName);
  return z?.glyph || "✦";
}

// ── Moon phase ──────────────────────────────────────────────────────────────
const SYNODIC_MONTH = 29.530588; // days
const REF_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14, 0); // known new moon

const PHASE_BUCKETS = [
  { name: "New",            short: "New",            glyph: "🌑", min: 0.00, max: 0.03 },
  { name: "Waxing crescent", short: "Waxing crescent", glyph: "🌒", min: 0.03, max: 0.22 },
  { name: "First quarter",  short: "First quarter",  glyph: "🌓", min: 0.22, max: 0.28 },
  { name: "Waxing gibbous", short: "Waxing gibbous", glyph: "🌔", min: 0.28, max: 0.47 },
  { name: "Full",           short: "Full",           glyph: "🌕", min: 0.47, max: 0.53 },
  { name: "Waning gibbous", short: "Waning gibbous", glyph: "🌖", min: 0.53, max: 0.72 },
  { name: "Last quarter",   short: "Last quarter",   glyph: "🌗", min: 0.72, max: 0.78 },
  { name: "Waning crescent", short: "Waning crescent", glyph: "🌘", min: 0.78, max: 0.97 },
  { name: "New",            short: "New",            glyph: "🌑", min: 0.97, max: 1.01 },
];

/** Returns the moon phase for a given date.
 *  - position: 0..1 through the synodic month (0 = new, 0.5 = full)
 *  - illumination: 0..100 percent illuminated
 */
export function getMoonPhase(date) {
  const d = toDate(date) || new Date();
  const days = (d.getTime() - REF_NEW_MOON) / 86400000;
  const cycles = days / SYNODIC_MONTH;
  let position = cycles - Math.floor(cycles);
  if (position < 0) position += 1;

  const illumination = Math.round(50 * (1 - Math.cos(2 * Math.PI * position)));
  const bucket = PHASE_BUCKETS.find((b) => position >= b.min && position < b.max) || PHASE_BUCKETS[0];

  return {
    name: bucket.name,
    short: bucket.short,
    glyph: bucket.glyph,
    position,
    illumination, // 0..100
    waxing: position < 0.5,
  };
}

// ── Compatibility base score ────────────────────────────────────────────────
// Returns a rough 0..100 score from sun-sign element + modality interplay
// only. The LLM will refine with personality narrative + dimension scores.
const ELEMENT_AFFINITY = {
  Fire:  { Fire: 80, Air:   85, Earth: 60, Water: 55 },
  Air:   { Air:  80, Fire:  85, Water: 65, Earth: 60 },
  Earth: { Earth: 80, Water: 85, Fire:  60, Air:   60 },
  Water: { Water: 78, Earth: 85, Fire:  55, Air:   65 },
};
const MODALITY_BUMP = {
  Cardinal: { Cardinal: -5, Fixed: +3, Mutable: +5 },
  Fixed:    { Cardinal: +3, Fixed: -8, Mutable: +4 },
  Mutable:  { Cardinal: +5, Fixed: +4, Mutable: -3 },
};

export function sunSignCompatBase(signA, signB) {
  if (!signA || !signB) return null;
  const ea = getElement(signA);
  const eb = getElement(signB);
  const ma = getModality(signA);
  const mb = getModality(signB);
  if (!ea || !eb || !ma || !mb) return null;
  const base = (ELEMENT_AFFINITY[ea] && ELEMENT_AFFINITY[ea][eb]) || 65;
  const bump = (MODALITY_BUMP[ma] && MODALITY_BUMP[ma][mb]) || 0;
  return Math.max(40, Math.min(95, base + bump));
}

// ── Display helpers ─────────────────────────────────────────────────────────
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Wednesday · 12 May · 2026" — British order, full month. */
export function prettyDateBritish(date) {
  const d = toDate(date) || new Date();
  return `${WEEKDAYS[d.getDay()]} · ${d.getDate()} ${MONTHS[d.getMonth()]} · ${d.getFullYear()}`;
}

/** "12 Jun" — short, no year. Used for transit cards. */
export function prettyDateShortBritish(date) {
  const d = toDate(date);
  if (!d || isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

/** "Jun 14, 1999" — kicker text (matches demo). */
export function prettyBirthday(date) {
  const d = toDate(date);
  if (!d || isNaN(d.getTime())) return "";
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// ── Cycle × Moon weave helpers ──────────────────────────────────────────────
// Friendly intersection label given the user's cycle phase + today's moon
// phase. The narrative itself is LLM-generated; this just gives the headline
// when the LLM hasn't run yet.
const CYCLE_LABEL = {
  menstrual:  "Bleeding",
  follicular: "Rising",
  ovulatory:  "Peaking",
  luteal:     "Settling",
};

export function cycleMoonHeadline(cyclePhase, moonPhase) {
  const c = CYCLE_LABEL[cyclePhase] || "Quiet";
  const m = moonPhase?.short || "Moon";
  return `${c} body under a ${m.toLowerCase()}`;
}

// Re-export zodiac list for any UI that needs to iterate all 12 signs.
export const ALL_ZODIAC = ZODIAC.map(({ name, glyph, element, modality, ruler }) => ({
  name, glyph, element, modality, ruler,
}));
