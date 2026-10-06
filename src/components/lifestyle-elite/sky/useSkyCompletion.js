import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { classifyRedWhite } from "@/lib/astrology/redWhite";
import { getMoonPhase } from "@/utils/astrology";
import { plusUnlocked } from "@/config/plusTier";
import { validSkyBirthday } from "./skyCompletion";

const EMPTY = { letter: null, unlocked: false, rw: null, loading: false, letterError: "", cycleError: "" };
export default function useSkyCompletion(user, enabled) {
  const userId = enabled ? user?.id : null;
  const [state, setState] = useState({ ...EMPTY, owner: null });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let cancelled = false;
    if (!userId) { setState({ ...EMPTY, owner: null }); return; }
    setState({ ...EMPTY, owner: userId, loading: true });
    (async () => {
      const [cycles, entitlements, letters] = await Promise.allSettled([
        base44.entities.CycleEvents.filter({ user_id: userId }, "-date", 100),
        base44.entities.Entitlements.filter({ user_id: userId }, "-updated_at", 1),
        base44.entities.AtelierLetters.filter({ user_id: userId, draft: false }, "-month", 24),
      ]);
      if (cancelled) return;
      const events = cycles.status === "fulfilled" && Array.isArray(cycles.value)
        ? cycles.value.filter(row => row.user_id === userId) : [];
      const starts = events.filter(row => ["period_start", "periodstart"].includes(String(row.type).toLowerCase()) && validSkyBirthday(row.date));
      const unique = [...new Map(starts.map(row => [row.date, row])).values()].sort((a,b) => b.date.localeCompare(a.date)).slice(0,6);
      const rw = classifyRedWhite(unique.map(row=>({...row,date:`${row.date}T12:00:00`})), getMoonPhase);
      // Even one or two starts are useful observations, not an invented pattern.
      rw.bleeds_at_phases = unique.map(row => getMoonPhase(new Date(`${row.date}T12:00:00`))?.key || "unknown");
      const plans = entitlements.status === "fulfilled" && Array.isArray(entitlements.value) ? entitlements.value.filter(row => row.user_id === userId) : [];
      const hasPlan = ["plus", "pro", "premium"].includes(String(plans[0]?.plan || "").toLowerCase());
      const published = letters.status === "fulfilled" && Array.isArray(letters.value) ? letters.value.filter(row => row.user_id === userId && row.draft === false) : [];
      setState({ owner: userId, loading: false, rw, unlocked: plusUnlocked(hasPlan, !!user?.is_operator), letter: published[0] || null,
        cycleError: cycles.status === "rejected" ? "Your cycle dates didn't load. Try again?" : "",
        letterError: letters.status === "rejected" || entitlements.status === "rejected" ? "Your monthly letter didn't load. Try again?" : "" });
    })();
    return () => { cancelled = true; };
  }, [userId, user?.is_operator, revision]);
  return { ...(state.owner === userId ? state : { ...EMPTY, loading: !!userId }), retry: () => setRevision(value => value + 1) };
}
