import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { getMoonPhase } from "@/utils/astrology";
import { classifyRedWhite } from "@/lib/astrology/redWhite";

// ─────────────────────────────────────────────────────────────────────────────
// useRedWhiteMoon — returns the user's persisted archetype if available,
// otherwise falls back to live client-side classification from CycleEvents.
//
// Shape: { loading, archetype, confidence, bleeds_at_phases, source }
//   source: 'persisted' | 'live' | 'empty'
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY = {
  loading: false,
  archetype: "insufficient_data",
  confidence: 0,
  bleeds_at_phases: [],
  source: "empty",
};

export default function useRedWhiteMoon(userId) {
  const [persisted, setPersisted] = useState(null);
  const [cycleEvents, setCycleEvents] = useState([]);
  const [loading, setLoading] = useState(!!userId);

  useEffect(() => {
    if (!userId) { setLoading(false); return undefined; }
    let cancelled = false;
    (async () => {
      try {
        const [rows, cycles] = await Promise.all([
          base44.entities.HoroscopePersistedClassification.filter(
            { user_id: userId }, "-last_computed_at", 1,
          ).catch(() => []),
          base44.entities.CycleEvents.filter(
            { user_id: userId }, "-date", 36,
          ).catch(() => []),
        ]);
        if (cancelled) return;
        setPersisted(Array.isArray(rows) && rows[0] ? rows[0] : null);
        setCycleEvents(Array.isArray(cycles) ? cycles : []);
      } catch {
        if (!cancelled) { setPersisted(null); setCycleEvents([]); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const result = useMemo(() => {
    if (!userId) return EMPTY;
    if (persisted?.red_white_archetype && persisted.red_white_archetype !== "insufficient_data") {
      return {
        loading: false,
        archetype: persisted.red_white_archetype,
        confidence: Number(persisted.confidence) || 0,
        bleeds_at_phases: Array.isArray(persisted.bleeds_at_phases) ? persisted.bleeds_at_phases : [],
        source: "persisted",
      };
    }
    // Live fallback (or persisted said insufficient_data but cycles may have grown)
    const live = classifyRedWhite(cycleEvents, getMoonPhase);
    return {
      loading: false,
      archetype: live.archetype,
      confidence: live.confidence,
      bleeds_at_phases: live.bleeds_at_phases,
      source: live.archetype === "insufficient_data" ? "empty" : "live",
    };
  }, [userId, persisted, cycleEvents]);

  return { ...result, loading };
}
