import { useMemo } from "react";
import { computeProfection, computeSaturnReturnWindow } from "@/lib/astrology/profections";

// ─────────────────────────────────────────────────────────────────────────────
// useProfections — wraps computeProfection with the user's birthday + chart.
//
// Resolves the birthday from astro.birth_date → userProfile.birthday →
// userProfile.date_of_birth. Resolves the rising sign from astro.rising_sign;
// falls back to astro.sun_sign when no rising is known (so users without a
// birth time still get a coherent house copy).
//
// Returns:
//   { ready, profection, saturn }
//     profection: result of computeProfection() or null
//     saturn: { started, exact, ends } or null (always computed when birthday
//             present — caller decides whether to render based on age)
// ─────────────────────────────────────────────────────────────────────────────

export default function useProfections(astro, userProfile) {
  return useMemo(() => {
    const birthday =
      astro?.birth_date ||
      userProfile?.birthday ||
      userProfile?.date_of_birth ||
      null;
    if (!birthday) return { ready: false, profection: null, saturn: null };
    const profection = computeProfection(birthday, new Date(), {
      rising_sign: astro?.rising_sign,
      sun_sign: astro?.sun_sign,
    });
    const saturn = computeSaturnReturnWindow(birthday);
    return { ready: !!profection, profection, saturn };
  }, [astro, userProfile]);
}
