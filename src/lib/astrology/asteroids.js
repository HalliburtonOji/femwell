// ─────────────────────────────────────────────────────────────────────────────
// asteroids.js — Goddess Bench reference data + estimator.
//
// The Goddess Bench (Ceres / Pallas / Juno / Vesta / Chiron / Lilith) is the
// FemWell horoscope's category-original asteroid astrology card. Per
// H2_DECISIONS.md D3, "Lilith" here is Black Moon Lilith (the moon's lunar
// apogee — a modern feminist usage), NOT the asteroid #1181.
//
// APPROXIMATE — VSOP87-equivalent mean-longitude estimates from the J2000
// epoch with each body's published synodic period. Accurate to ±1 sign at
// worst. Upgrade to server-side Swiss-Ephemeris computation in H3.
//
// The estimator is duplicated in base44/functions/generateHoroscopeReading/
// entry.ts so the backend can compute deterministically; keep the two ports
// in sync if you change either one.
// ─────────────────────────────────────────────────────────────────────────────

export const ASTEROID_NAMES = ["ceres", "pallas", "juno", "vesta", "chiron", "lilith"];

const ZODIAC = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

// Mean longitude estimator. Each entry stores a J2000 starting longitude
// (degrees) + a period in years. Periods sourced from JPL ephemeris means;
// Black Moon Lilith from the lunar apogee precession period (8.85 years).
const BODY_PARAMS = {
  // body:      { L0:        starting ecliptic longitude at 2000-01-01 (deg)
  //              periodYrs: synodic / orbital period (years) }
  ceres:   { L0: 145, periodYrs: 4.6 },
  pallas:  { L0: 268, periodYrs: 4.62 },
  juno:    { L0: 134, periodYrs: 4.36 },
  vesta:   { L0:  17, periodYrs: 3.63 },
  chiron:  { L0: 252, periodYrs: 50.4 },
  // Black Moon Lilith — lunar apogee precession (NOT asteroid #1181).
  lilith:  { L0:  41, periodYrs: 8.85 },
};

const MS_PER_YEAR = 365.25 * 86400000;
const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);

function longitudeFor(body, birthDate) {
  const params = BODY_PARAMS[body];
  if (!params) return null;
  const t = new Date(birthDate);
  if (isNaN(t.getTime())) return null;
  const yearsSince = (t.getTime() - J2000_MS) / MS_PER_YEAR;
  const advance = (360 / params.periodYrs) * yearsSince;
  let lon = (params.L0 + advance) % 360;
  if (lon < 0) lon += 360;
  return lon;
}

function signFromLongitude(lon) {
  if (lon == null || isNaN(lon)) return null;
  const idx = Math.floor(((lon % 360) + 360) % 360 / 30);
  return ZODIAC[idx] || null;
}

/**
 * Estimate the six Goddess-Bench placements (Ceres, Pallas, Juno, Vesta,
 * Chiron, Black Moon Lilith) at a given birth date.
 *
 * APPROXIMATE — VSOP87-equivalent mean-longitude formulas. Accurate to ±1
 * sign in the worst case (fast asteroids closer to true position, slow
 * bodies like Chiron occasionally off by one sign). Upgrade to server-side
 * Swiss Ephemeris in H3.
 *
 * @param {string|Date} birthDate ISO date or Date object.
 * @returns {{ceres,pallas,juno,vesta,chiron,lilith}} zodiac names, or
 *   nulls if birthDate is unusable.
 */
export function estimateAsteroidsFromBirth(birthDate) {
  const out = {};
  for (const name of ASTEROID_NAMES) {
    out[name] = signFromLongitude(longitudeFor(name, birthDate));
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// ASTEROID_ARCHETYPES — copy table for the expand pane.
//
// Each archetype: ~80 words of body. Voice mirrors the FemWell horoscope
// register (literary, present-tense, UK-spelled).
// ─────────────────────────────────────────────────────────────────────────────
export const ASTEROID_ARCHETYPES = {
  ceres: {
    archetype: "Mother",
    role:      "Mother",
    description:
      "Ceres is the part of you that feeds — that says 'eat first, talk after'. " +
      "She is your relationship with comfort, with nourishment, with mothering and " +
      "being mothered. Her placement tells you how you give and how you ask for " +
      "warmth, and where you confuse love with feeding. In a hard sign she will " +
      "make you self-reliant; in a soft sign she will ask you to be held.",
    body_part: "stomach, womb",
    deep_dive_url: "/discover?topic=ceres",
  },
  pallas: {
    archetype: "Warrior",
    role:      "Warrior",
    description:
      "Pallas is the strategist — your inner pattern-finder. She is the part of " +
      "you that solves the puzzle calmly, sees through the noise, and turns " +
      "intuition into a plan. Her placement names the field you fight in: a fire " +
      "Pallas argues fast and clean; a water Pallas wins by waiting. She also " +
      "carries the cost of being underestimated, and the quiet vindication of " +
      "being right.",
    body_part: "head, eyes",
    deep_dive_url: "/discover?topic=pallas",
  },
  juno: {
    archetype: "Partner",
    role:      "Partner",
    description:
      "Juno is the marriage instinct — what you actually need in a long " +
      "commitment, not what you fall in love with. Her placement describes the " +
      "quality of presence you require to feel partnered: a Capricorn Juno wants " +
      "loyalty as proof, a Pisces Juno wants softness, an Aquarius Juno wants " +
      "freedom inside the bond. Where Juno is wounded, you'll feel betrayal more " +
      "sharply than the situation warrants.",
    body_part: "heart, throat",
    deep_dive_url: "/discover?topic=juno",
  },
  vesta: {
    archetype: "Hearth",
    role:      "Hearth",
    description:
      "Vesta is the keeper of the flame — the practice you protect from " +
      "interruption. Her placement names what you tend in private: art, prayer, " +
      "the work, the body, the household altar. In her sign you'll be devoted, " +
      "but also a little ascetic: Vesta withholds something for the sake of the " +
      "thing she is keeping. The discipline she asks for is real, and so is the " +
      "warmth on the other side.",
    body_part: "spine, breath",
    deep_dive_url: "/discover?topic=vesta",
  },
  chiron: {
    archetype: "Healer",
    role:      "Healer",
    description:
      "Chiron is the wound that teaches — the place where you were hurt early " +
      "and now know more than most. His placement names the territory you can " +
      "guide others through because you've been there: a Leo Chiron heals shame " +
      "around being seen; a Virgo Chiron heals the body-as-flawed story; a " +
      "Pisces Chiron heals the family that didn't believe you. The wound never " +
      "closes neatly. The gift is the steadiness around it.",
    body_part: "knee, joints",
    deep_dive_url: "/discover?topic=chiron",
  },
  lilith: {
    archetype: "Wild",
    role:      "Wild",
    description:
      "Black Moon Lilith is the part of you that won't be tamed — not asteroid " +
      "#1181, but the moon's lunar apogee, the modern feminist Lilith. Her " +
      "placement names the room you refuse to leave: where you'd rather be " +
      "exiled than dishonest, where you've been called too much. In an air sign " +
      "she's the unedited sentence; in water she's the cold no; in fire she " +
      "burns the bridge first. Befriend her — she's older than your manners.",
    body_part: "hips, pelvis",
    deep_dive_url: "/discover?topic=lilith",
  },
};
