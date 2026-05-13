import { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const TODAY_ISO = () => new Date().toISOString().split("T")[0];

// ─────────────────────────────────────────────────────────────────────────────
// useBirthChart — extracts the initial-load effect from HoroscopeTab.
//
// Loads user, AstroProfile, today's HoroscopeReading, UserProfile, and
// LifestyleProfile in parallel. Fires generateHoroscopeReading optimistically
// when a chart exists but today's reading hasn't been produced yet.
//
// Props forwarded from parent let callers skip re-fetching profiles already
// loaded by an ancestor (UserProfile / LifestyleProfile).
// ─────────────────────────────────────────────────────────────────────────────
export function useBirthChart(propsUserProfile, propsLifestyleProfile) {
  const [user, setUser] = useState(null);
  const [astro, setAstro] = useState(null);
  const [reading, setReading] = useState(null);
  const [userProfileLocal, setUserProfileLocal] = useState(propsUserProfile || null);
  const [lifestyleProfileLocal, setLifestyleProfileLocal] = useState(propsLifestyleProfile || null);
  const [loading, setLoading] = useState(true);
  // Per-section loading granularity — lets each section skeleton independently
  const [sectionsReady, setSectionsReady] = useState(false);
  const [generatingReading, setGeneratingReading] = useState(false);

  const userProfile = propsUserProfile || userProfileLocal;
  const lifestyleProfile = propsLifestyleProfile || lifestyleProfileLocal;

  const refresh = useCallback(() => {
    setLoading(true);
    setSectionsReady(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setSectionsReady(false);
      try {
        const u = await base44.auth.me().catch(() => null);
        if (cancelled) return;
        setUser(u);

        if (!u?.id) { setLoading(false); return; }

        const [aps, readings, profiles, lpRows] = await Promise.all([
          base44.entities.AstroProfile.filter({ user_id: u.id }, undefined, 1).catch(() => []),
          base44.entities.HoroscopeReading.filter(
            { user_id: u.id, reading_date: TODAY_ISO() },
            "-created_date",
            1,
          ).catch(() => []),
          propsUserProfile
            ? Promise.resolve([propsUserProfile])
            : base44.entities.UserProfile.filter({ user_id: u.id }, undefined, 1).catch(() => []),
          propsLifestyleProfile
            ? Promise.resolve([propsLifestyleProfile])
            : base44.entities.LifestyleProfile.filter({ user_id: u.id }, undefined, 1).catch(() => []),
        ]);
        if (cancelled) return;

        const ap = (aps && aps[0]) || null;
        const todayReading = (readings && readings[0]) || null;
        setAstro(ap);
        setReading(todayReading);
        if (!propsUserProfile) setUserProfileLocal((profiles && profiles[0]) || null);
        if (!propsLifestyleProfile) setLifestyleProfileLocal((lpRows && lpRows[0]) || null);

        // Sections can render with what we have — reading may still be generating
        setSectionsReady(true);

        if (ap && !todayReading) {
          setGeneratingReading(true);
          base44.functions
            .invoke("generateHoroscopeReading", { user_id: u.id })
            .then((res) => {
              if (cancelled) return;
              const next = res?.data?.reading || res?.reading || null;
              if (next) setReading(next);
            })
            .catch(() => {})
            .finally(() => { if (!cancelled) setGeneratingReading(false); });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Real-time subscription — when generateHoroscopeReading writes a new row
  // (either from above fire-and-forget or from any other trigger), we pick it
  // up immediately without requiring a page reload.
  useEffect(() => {
    if (!user?.id) return;
    const todayISO = TODAY_ISO();
    const unsubscribe = base44.entities.HoroscopeReading.subscribe((event) => {
      if (event.type === "create" || event.type === "update") {
        const row = event.data;
        if (row?.user_id === user.id && row?.reading_date === todayISO) {
          setReading(row);
          setGeneratingReading(false);
        }
      }
    });
    return unsubscribe;
  }, [user?.id]);

  return {
    user, astro, reading, userProfile, lifestyleProfile,
    loading, sectionsReady, generatingReading,
    refresh, setAstro, setReading,
  };
}