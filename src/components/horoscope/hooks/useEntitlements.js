import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// ─────────────────────────────────────────────────────────────────────────────
// useEntitlements — reads the user's Entitlements row.
//
// Returns: { plan, hasAtelier, loading }
//   plan        — 'free' | 'plus' | 'pro' | 'premium' (defaults to 'free')
//   hasAtelier  — true when plan in ['plus', 'pro', 'premium']
//
// Used by AtelierReading.jsx (H2d-1) to switch between locked + unlocked
// variants of the monthly letter card.
// ─────────────────────────────────────────────────────────────────────────────

const ATELIER_PLANS = new Set(["plus", "pro", "premium"]);

export default function useEntitlements(userId) {
  const [plan, setPlan] = useState("free");
  const [loading, setLoading] = useState(!!userId);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const rows = await base44.entities.Entitlements.filter(
          { user_id: userId },
          "-updated_at",
          1,
        ).catch(() => []);
        if (cancelled) return;
        const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
        if (row?.plan) setPlan(row.plan);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  return {
    plan,
    hasAtelier: ATELIER_PLANS.has(plan),
    loading,
  };
}
