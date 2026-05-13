// ─────────────────────────────────────────────────────────────────────────────
// profections.js — Annual Profections (Hellenistic).
//
// One house is "activated" per year of life, advancing one each birthday
// starting at house 1 in the first year (age 0). The traditional ruler of
// that house's sign is the year's "time-lord", the planet whose themes
// thread the next 12 months.
//
// computeProfection(birthDate, today) → {
//   age, house, time_lord,
//   lit_house_copy, time_lord_copy,
//   unlocks_on  // ISO YYYY-MM-DD of next birthday
// }
//
// Per H2_DECISIONS.md D4: house = (age % 12) + 1 — mathematically correct.
// The demo's age-27 example (5th house Venus) was illustrative; trust the math.
//
// Traditional rulers — ports the seven-planet system (no outer planets):
//   Aries→Mars,  Taurus→Venus,    Gemini→Mercury,
//   Cancer→Moon, Leo→Sun,         Virgo→Mercury,
//   Libra→Venus, Scorpio→Mars,    Sagittarius→Jupiter,
//   Capricorn→Saturn, Aquarius→Saturn, Pisces→Jupiter.
// ─────────────────────────────────────────────────────────────────────────────

const SIGNS_IN_ORDER = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

export const TRADITIONAL_RULER = {
  Aries: "Mars",
  Taurus: "Venus",
  Gemini: "Mercury",
  Cancer: "Moon",
  Leo: "Sun",
  Virgo: "Mercury",
  Libra: "Venus",
  Scorpio: "Mars",
  Sagittarius: "Jupiter",
  Capricorn: "Saturn",
  Aquarius: "Saturn",
  Pisces: "Jupiter",
};

const HOUSE_COPY = {
  1: "This year is about your own face — how you walk into a room, how you take up space, what you call yourself. The work is to recognise the shape of the self that's emerging and let the people closest to you adjust their pictures.",
  2: "This year is about what you own — money, body, voice, the things that are yours to spend. Notice what you actually value when no one's watching. The year rewards quiet stewardship more than acquisition.",
  3: "This year is about close-quarters — siblings, neighbourhood, the chat thread, the everyday journey. Small repeated conversations matter more than big set-pieces. Learning a useful, ordinary thing will pay back disproportionately.",
  4: "This year is about home and roots — where you live, who you came from, the inside of the front door. Tend the foundation. A small adjustment to your domestic life now ripples out for years.",
  5: "This year is about play, romance, creativity, the heart that wants to be seen. Make the thing. Date the person. Show the work. The 5th house punishes private hoarding of your gifts.",
  6: "This year is about work, routine, body. The texture of your days matters more than the headline. Health habits, the discipline of small daily acts, and the people you serve directly are where the year lives.",
  7: "This year is about the other — partnerships, marriages, contracts, the person across the table. Pay attention to who keeps showing up. A relationship will be named this year, for better or for clearer.",
  8: "This year is about shared resources, intimacy, inheritance, the things you don't manage alone. Money tangled with another's. Bodies tangled with another's. The work is honesty about what you're actually carrying.",
  9: "This year is about belief, distance, study, the long view. A trip, a course, a faith adjustment — something widens you. You may meet someone from far away who reshapes how you see your own street.",
  10: "This year is about visibility — career, reputation, what people call you when you leave the room. The work you've been doing privately starts to show. Don't dress for the job you have; dress for the season you're in.",
  11: "This year is about networks, friendships, the long-game group. Causes, communities, the slow accumulation of people who'll vouch for you. A friendship will deepen into the kind that lasts.",
  12: "This year is about retreat, dream-life, the unseen. Rest is the work. Therapy, art, sleep, the slow inner edit. You're ending a cycle; don't rush a beginning. The 12th rewards patience and ruins haste.",
};

const PLANET_COPY = {
  Sun: "The Sun is your time-lord. The year asks for visibility — a clearer signal of who you are. Step into the version of yourself that doesn't need to apologise for taking up the room. Sun years reward authorship.",
  Moon: "The Moon is your time-lord. The year moves with feeling, cycle, and a softer kind of intelligence. Trust the body's read. Public-facing work goes well when you let the rhythm of your day shape the schedule, not the other way around.",
  Mercury: "Mercury is your time-lord. The year is about language — how you write, how you negotiate, how you keep a thread. Take the conversation that loops back. Learn the thing you've been meaning to. A small published piece will travel.",
  Venus: "Venus is your time-lord. The year is about pleasure, beauty, and the soft skill of being chosen. Tend the relationships that nourish; close the ones that drain. A creative project finds its audience.",
  Mars: "Mars is your time-lord. The year asks for action, courage, and the willingness to break a stalemate. Pick the fight you've been avoiding. Mars years move things that have been stuck for ages — but only if you swing the hammer.",
  Jupiter: "Jupiter is your time-lord. The year widens you — travel, study, the meeting of people who carry you somewhere new. Say yes more than feels comfortable. Jupiter rewards reach.",
  Saturn: "Saturn is your time-lord. The year is about structure, patience, the slow build. What you commit to now will hold for a decade. Saturn years feel heavy in the middle and pay handsomely at the end. Don't quit at month nine.",
};

const ORDINAL = ["", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
export function houseOrdinal(n) { return ORDINAL[n] || ""; }

function ageOn(birthDate, today) {
  const b = new Date(birthDate);
  const t = today instanceof Date ? today : new Date(today);
  if (isNaN(b.getTime()) || isNaN(t.getTime())) return null;
  let age = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) age -= 1;
  return age < 0 ? null : age;
}

function nextBirthday(birthDate, today) {
  const b = new Date(birthDate);
  const t = today instanceof Date ? today : new Date(today);
  if (isNaN(b.getTime()) || isNaN(t.getTime())) return null;
  let year = t.getFullYear();
  let next = new Date(year, b.getMonth(), b.getDate());
  if (next.getTime() <= t.getTime()) {
    year += 1;
    next = new Date(year, b.getMonth(), b.getDate());
  }
  return next.toISOString().slice(0, 10);
}

function signIndexFromName(sign) {
  if (!sign) return -1;
  return SIGNS_IN_ORDER.indexOf(sign);
}

/**
 * computeProfection(birthDate, today, opts).
 *
 * @param {string|Date} birthDate ISO date or Date.
 * @param {Date} [today] Defaults to new Date().
 * @param {{ rising_sign?: string, sun_sign?: string }} [opts] When rising_sign
 *   is provided, houses are counted as whole-sign from the rising. Otherwise
 *   we fall back to whole-sign from the sun sign (so users without a birth
 *   time still get something coherent).
 * @returns {{
 *   age:number,
 *   house:number,
 *   time_lord:string|null,
 *   lit_house_copy:string,
 *   time_lord_copy:string,
 *   unlocks_on:string
 * } | null}
 */
export function computeProfection(birthDate, today = new Date(), opts = {}) {
  if (!birthDate) return null;
  const age = ageOn(birthDate, today);
  if (age == null) return null;

  const house = (age % 12) + 1; // 1..12

  const ascSign = opts.rising_sign || opts.sun_sign || null;
  const ascIdx = signIndexFromName(ascSign);
  let houseSign = null;
  if (ascIdx >= 0) {
    houseSign = SIGNS_IN_ORDER[(ascIdx + (house - 1)) % 12];
  }
  const time_lord = houseSign ? TRADITIONAL_RULER[houseSign] : null;

  return {
    age,
    house,
    time_lord,
    house_sign: houseSign,
    lit_house_copy: HOUSE_COPY[house] || "",
    time_lord_copy: time_lord ? PLANET_COPY[time_lord] : "",
    unlocks_on: nextBirthday(birthDate, today),
  };
}

// ── Saturn Return (A1) — deterministic windowing ────────────────────────────
// Saturn's sidereal period is ~29.5 years. We approximate "first Saturn
// return" as starting ~12 months before the 29.5-year anniversary and
// ending ~12 months after, with the exact return at the midpoint. The
// 27-30 age window covered by the Saturn Return Letter pane in
// AnnualProfections.jsx maps to (started, exact, ends) at roughly:
//   started = age 28 (~29.5y - 1.5y)
//   exact   = age 29.5 (the sidereal return)
//   ends    = age 31 (~29.5y + 1.5y)
//
// Returns ISO YYYY-MM-DD strings for each waypoint, in en-GB rendering.

const SATURN_PERIOD_YRS = 29.5;
const SATURN_WINDOW_YRS = 1.5;

export function computeSaturnReturnWindow(birthDate) {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  if (isNaN(b.getTime())) return null;
  const ms = 365.25 * 86400000;
  const exact = new Date(b.getTime() + SATURN_PERIOD_YRS * ms);
  const started = new Date(exact.getTime() - SATURN_WINDOW_YRS * ms);
  const ends = new Date(exact.getTime() + SATURN_WINDOW_YRS * ms);
  return {
    started: started.toISOString().slice(0, 10),
    exact: exact.toISOString().slice(0, 10),
    ends: ends.toISOString().slice(0, 10),
  };
}
