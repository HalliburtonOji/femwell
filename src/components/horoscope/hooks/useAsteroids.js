import { useMemo } from "react";
import {
  ASTEROID_NAMES,
  estimateAsteroidsFromBirth,
} from "@/lib/astrology/asteroids";

// ─────────────────────────────────────────────────────────────────────────────
// useAsteroids — returns the user's six asteroid placements.
//
// Returns `astro.asteroid_signs` if persisted (backend computes + stores on
// first reading), else falls back to client-side estimation from the birth
// date. Falls back further to `userProfile.birthday` when the AstroProfile
// doesn't have its own birth_date set.
//
// Shape: { ceres, pallas, juno, vesta, chiron, lilith } — each a zodiac
// name string or null when no birth date is known.
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY = ASTEROID_NAMES.reduce((acc, k) => { acc[k] = null; return acc; }, {});

export default function useAsteroids(astro, userProfile) {
  return useMemo(() => {
    if (astro?.asteroid_signs && typeof astro.asteroid_signs === "object") {
      // Backend already computed — trust those values.
      return { ...EMPTY, ...astro.asteroid_signs };
    }
    const birthDate =
      astro?.birth_date ||
      userProfile?.birthday ||
      userProfile?.date_of_birth ||
      null;
    if (!birthDate) return EMPTY;
    return estimateAsteroidsFromBirth(birthDate);
  }, [astro, userProfile]);
}
