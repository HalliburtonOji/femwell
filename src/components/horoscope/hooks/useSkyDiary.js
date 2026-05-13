import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// ─────────────────────────────────────────────────────────────────────────────
// useSkyDiary — pulls last 12 CycleEvents (period_start) and last 12
// HoroscopeReading rows for a user, so the Sky Diary can render a
// 12-cycle timeline overlaid with transit dots from recent readings.
//
// Returns:
//   { loading, periodStarts, readings }
//
// periodStarts: array of { date: Date, raw } sorted newest-first.
// readings: array of HoroscopeReading rows sorted newest-first.
// ─────────────────────────────────────────────────────────────────────────────

export default function useSkyDiary(userId) {
  const [state, setState] = useState({
    loading: !!userId,
    periodStarts: [],
    readings: [],
  });

  useEffect(() => {
    if (!userId) {
      setState({ loading: false, periodStarts: [], readings: [] });
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const [cycleRows, readingRows] = await Promise.all([
          base44.entities.CycleEvents.filter(
            { user_id: userId },
            "-date",
            36, // over-fetch — we filter to period_start client-side
          ).catch(() => []),
          base44.entities.HoroscopeReading.filter(
            { user_id: userId },
            "-reading_date",
            12,
          ).catch(() => []),
        ]);
        if (cancelled) return;

        const periodStarts = (Array.isArray(cycleRows) ? cycleRows : [])
          .filter((r) => {
            const t = String(r?.type || "").toLowerCase();
            return t === "period_start" || t === "periodstart";
          })
          .map((r) => ({ date: new Date(r.date), raw: r }))
          .filter((r) => !isNaN(r.date.getTime()))
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 12);

        setState({
          loading: false,
          periodStarts,
          readings: Array.isArray(readingRows) ? readingRows : [],
        });
      } catch {
        if (!cancelled) setState({ loading: false, periodStarts: [], readings: [] });
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  return state;
}
