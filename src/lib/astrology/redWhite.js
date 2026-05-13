// ─────────────────────────────────────────────────────────────────────────────
// redWhite.js — Red Moon / White Moon archetype classifier.
//
// Given a series of CycleEvents (period_starts) and a moon-phase function,
// determine whether the user's bleeds cluster around new-moon, full-moon,
// waxing or waning. Returns one of:
//   red_moon | white_moon | pink_moon | purple_moon | mixed | insufficient_data
//
// Algorithm — for last 6 period_start dates:
//   Red Moon   = ≥4 of 6 fall in {new, waxing_crescent}
//   White Moon = ≥4 of 6 fall in {full, waning_gibbous}
//   Pink Moon  = ≥4 of 6 fall in {first_quarter, waxing_gibbous}
//   Purple Moon = ≥4 of 6 fall in {last_quarter, waning_crescent}
//   otherwise = mixed
//
// Confidence = matchingCount / 6 (caps at 1.0).
//
// When fewer than 3 period_starts exist in the window, returns
// insufficient_data so the UI can show its empty state.
// ─────────────────────────────────────────────────────────────────────────────

const RED_PHASES = new Set(["new", "waxing_crescent"]);
const WHITE_PHASES = new Set(["full", "waning_gibbous"]);
const PINK_PHASES = new Set(["first_quarter", "waxing_gibbous"]);
const PURPLE_PHASES = new Set(["last_quarter", "waning_crescent"]);

function countMatches(phaseKeys, allowed) {
  let n = 0;
  for (const k of phaseKeys) if (allowed.has(k)) n += 1;
  return n;
}

/**
 * @param {Array<{date:string,type:string}>} cycleEvents — pulled from CycleEvents.
 * @param {(d:Date)=>{key:string}} getMoonPhaseFn — moon-phase resolver.
 * @returns {{archetype:string,confidence:number,bleeds_at_phases:string[]}}
 */
export function classifyRedWhite(cycleEvents, getMoonPhaseFn) {
  if (typeof getMoonPhaseFn !== "function") {
    return { archetype: "insufficient_data", confidence: 0, bleeds_at_phases: [] };
  }
  const periodStarts = (Array.isArray(cycleEvents) ? cycleEvents : [])
    .filter((e) => {
      const t = String(e?.type || "").toLowerCase();
      // accept both 'period_start' (legacy) and 'PeriodStart' (current enum)
      return t === "period_start" || t === "periodstart";
    })
    .map((e) => new Date(e.date))
    .filter((d) => !isNaN(d.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())
    .slice(0, 6);

  if (periodStarts.length < 3) {
    return { archetype: "insufficient_data", confidence: 0, bleeds_at_phases: [] };
  }

  const phaseKeys = periodStarts.map((d) => {
    const phase = getMoonPhaseFn(d);
    return phase?.key || "unknown";
  });
  const sample = phaseKeys.length; // 3..6

  const red = countMatches(phaseKeys, RED_PHASES);
  const white = countMatches(phaseKeys, WHITE_PHASES);
  const pink = countMatches(phaseKeys, PINK_PHASES);
  const purple = countMatches(phaseKeys, PURPLE_PHASES);

  // Threshold scales with sample: ≥4 of 6, ≥3 of 5, ≥3 of 4, ≥2 of 3.
  const threshold = sample >= 6 ? 4 : sample >= 5 ? 3 : sample >= 4 ? 3 : 2;

  let archetype = "mixed";
  let bestCount = 0;
  if (red >= threshold && red > bestCount) { archetype = "red_moon"; bestCount = red; }
  if (white >= threshold && white > bestCount) { archetype = "white_moon"; bestCount = white; }
  if (pink >= threshold && pink > bestCount) { archetype = "pink_moon"; bestCount = pink; }
  if (purple >= threshold && purple > bestCount) { archetype = "purple_moon"; bestCount = purple; }

  // For mixed, surface the best matching count (could be 1-2) so confidence
  // reflects how scattered the bleeds are.
  if (archetype === "mixed") bestCount = Math.max(red, white, pink, purple);

  const confidence = sample > 0 ? Math.min(1, bestCount / sample) : 0;

  return {
    archetype,
    confidence,
    bleeds_at_phases: phaseKeys,
  };
}
