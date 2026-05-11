import { useEffect, useMemo, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { getCurrentCyclePhase } from "@/utils/cyclePhase";
import EditorialHero from "./EditorialHero";
import SavedRail from "./SavedRail";
import TryThisRail from "./TryThisRail";
import BentoGrid from "./BentoGrid";
import Toast from "./Toast";
import PhaseInboxRail from "./PhaseInboxRail";

// Accepts legacy string ("all" / single slug) OR array of slugs (Option B).
// Empty array or "all" means no filter.
function matchCategoryFilter(item, filter) {
  if (!filter) return true;
  if (Array.isArray(filter)) {
    if (filter.length === 0) return true;
    const raw = String(item.category || "").toLowerCase();
    return filter.some((f) => {
      const fl = String(f).toLowerCase();
      return raw === fl || raw.includes(fl.replace(/_/g, " "));
    });
  }
  if (filter === "all") return true;
  const raw = String(item.category || "").toLowerCase();
  return raw === filter || raw.includes(String(filter).replace(/_/g, " "));
}

async function fetchHeroItem() {
  // Cascade: editor pick → trending → most engaged
  const tryEditor = await base44.entities.LifestyleItems.filter(
    { is_editor_pick: true, status: "PUBLISHED" }, "-engagement_score", 1
  ).catch(() => []);
  if (tryEditor[0]) return tryEditor[0];
  const tryTrending = await base44.entities.LifestyleItems.filter(
    { is_trending: true, status: "PUBLISHED" }, "-engagement_score", 1
  ).catch(() => []);
  if (tryTrending[0]) return tryTrending[0];
  const fallback = await base44.entities.LifestyleItems.filter(
    { status: "PUBLISHED" }, "-engagement_score", 1
  ).catch(() => []);
  return fallback[0] || null;
}

export default function ForYouTab({ categoryFilter }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [hero, setHero] = useState(null);
  const [allItems, setAllItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]); // hydrated last-3
  const [tryThisItems, setTryThisItems] = useState([]);
  const [contentByKey, setContentByKey] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [savedSet, setSavedSet] = useState(new Set());
  const [savedPhases, setSavedPhases] = useState({});
  const [pageSize, setPageSize] = useState(12);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      if (cancelled) return;
      setUser(u);

      let prof = null;
      if (u?.id) {
        const profiles = await base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []);
        prof = profiles[0] || null;
      }
      if (cancelled) return;
      setProfile(prof);
      setSavedSet(new Set(Array.isArray(prof?.saved_item_ids) ? prof.saved_item_ids : []));
      setSavedPhases(prof?.saved_item_phases || {});

      const heroItem = await fetchHeroItem();
      if (cancelled) return;
      setHero(heroItem);

      // Main feed — retry up to 3x if empty/failed. Intermittent fetch failures were
      // leaving allItems as [] and surfacing the "Nothing more to explore" empty state
      // on first load, which then resolved on reload.
      let all = [];
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const res = await base44.entities.LifestyleItems
            .filter({ status: "PUBLISHED" }, "-engagement_score", 200);
          if (Array.isArray(res) && res.length > 0) {
            all = res;
            break;
          }
          all = res || [];
        } catch {
          all = [];
        }
        if (all.length > 0) break;
        if (cancelled) return;
        // Short backoff before retry (250ms, 500ms)
        await new Promise(r => setTimeout(r, 250 * (attempt + 1)));
      }
      if (cancelled) return;
      setAllItems(all);

      // Saved rail — last 3 from profile.saved_item_ids, ordered by save timestamp via interactions
      const savedIds = Array.isArray(prof?.saved_item_ids) ? prof.saved_item_ids : [];
      if (savedIds.length && u?.id) {
        const interactions = await base44.entities.LifestyleInteractions
          .filter({ user_id: u.id, action: "save" }, "-created_date", 200)
          .catch(() => []);
        const orderedIds = [];
        const seen = new Set();
        for (const ix of interactions) {
          if (savedIds.includes(ix.item_id) && !seen.has(ix.item_id)) {
            seen.add(ix.item_id);
            orderedIds.push(ix.item_id);
            if (orderedIds.length >= 3) break;
          }
        }
        // Fill from saved_item_ids tail if interactions don't cover all
        for (let i = savedIds.length - 1; i >= 0 && orderedIds.length < 3; i--) {
          if (!seen.has(savedIds[i])) {
            seen.add(savedIds[i]);
            orderedIds.push(savedIds[i]);
          }
        }
        const hydrated = all.filter((it) => orderedIds.includes(it.id));
        // Re-order to match orderedIds
        const byId = Object.fromEntries(hydrated.map((it) => [it.id, it]));
        const sorted = orderedIds.map((id) => byId[id]).filter(Boolean);
        if (!cancelled) setSavedItems(sorted);
      }

      // Try-this rail
      const tryItems = await base44.entities.LifestyleItems
        .filter({ status: "PUBLISHED" }, "-engagement_score", 40)
        .catch(() => []);
      const withKey = tryItems.filter((it) => it.try_this_content_key);
      let alreadyTried = new Set();
      if (u?.id && withKey.length) {
        const triedRows = await base44.entities.LifestyleInteractions
          .filter({ user_id: u.id, action: "try_this" })
          .catch(() => []);
        alreadyTried = new Set(triedRows.map((r) => r.item_id));
      }
      const remaining = withKey.filter((it) => !alreadyTried.has(it.id)).slice(0, 4);
      if (!cancelled) setTryThisItems(remaining);

      // Hydrate ContentItems for try-this
      if (remaining.length) {
        const keys = remaining.map((it) => it.try_this_content_key).filter(Boolean);
        const ci = await base44.entities.ContentItems
          .filter({ content_key: { $in: keys } })
          .catch(() => []);
        if (!cancelled) {
          const map = {};
          ci.forEach((c) => { if (c.content_key) map[c.content_key] = c; });
          setContentByKey(map);
        }
      }

      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const currentPhase = useMemo(() => getCurrentCyclePhase(profile), [profile]);

  // Bento ranking
  const rankedBento = useMemo(() => {
    const followedSet = new Set(
      (Array.isArray(profile?.followed_categories) ? profile.followed_categories : [])
        .map((c) => String(c).toLowerCase())
    );
    const heroId = hero?.id;
    const scored = allItems
      .filter((it) => it.id !== heroId)
      .filter((it) => matchCategoryFilter(it, categoryFilter))
      .map((it, idx) => {
        let score = (it.engagement_score || 0) + (allItems.length - idx) * 0.001;
        if (currentPhase && Array.isArray(it.phase_tags) && it.phase_tags.includes(currentPhase)) {
          score *= 1.2;
        }
        const cat = String(it.category || "").toLowerCase();
        if (followedSet.size && followedSet.has(cat)) score *= 1.2;
        return { it, score, idx };
      });
    scored.sort((a, b) => (b.score - a.score) || (a.idx - b.idx));
    return scored.map((s) => s.it);
  }, [allItems, hero, profile, currentPhase, categoryFilter]);

  // Infinite scroll
  useEffect(() => {
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 600) {
        setPageSize((s) => (s < rankedBento.length ? s + 12 : s));
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [rankedBento.length]);

  // Persist save changes
  const persist = useCallback(async (nextIds, nextPhases) => {
    if (!user?.id) {
      setToast("Sign in to save articles.");
      return false;
    }
    let row = profile;
    try {
      if (!row?.id) {
        row = await base44.entities.UserProfile.create({
          user_id: user.id,
          user_email: user.email,
          saved_item_ids: nextIds,
          saved_item_phases: nextPhases,
        });
        setProfile(row);
      } else {
        await Promise.race([
          base44.entities.UserProfile.update(row.id, {
            saved_item_ids: nextIds,
            saved_item_phases: nextPhases,
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000)),
        ]);
        setProfile({ ...row, saved_item_ids: nextIds, saved_item_phases: nextPhases });
      }
      return true;
    } catch {
      return false;
    }
  }, [profile, user]);

  const handleSave = useCallback(async ({ id, phase }) => {
    if (!id) return;
    const wasSaved = savedSet.has(id);
    const nextIds = wasSaved ? Array.from(savedSet) : [...Array.from(savedSet), id];
    const nextPhases = { ...savedPhases };
    if (phase) nextPhases[id] = phase;
    else delete nextPhases[id];

    // Optimistic
    setSavedSet(new Set(nextIds));
    setSavedPhases(nextPhases);

    const ok = await persist(nextIds, nextPhases);
    if (!ok) {
      // Revert
      setSavedSet(new Set(Array.from(savedSet)));
      setSavedPhases(savedPhases);
      setToast("Couldn't save. Try again.");
      return;
    }

    // Log interaction only for newly-saved
    if (!wasSaved && user?.id) {
      base44.entities.LifestyleInteractions.create({
        user_id: user.id,
        item_id: id,
        action: "save",
      }).catch(() => {});
    }
  }, [savedSet, savedPhases, persist, user]);

  const handleUntag = useCallback(async (id) => {
    if (!id) return;
    const nextPhases = { ...savedPhases };
    delete nextPhases[id];
    const nextIds = Array.from(savedSet);
    setSavedPhases(nextPhases);
    const ok = await persist(nextIds, nextPhases);
    if (!ok) {
      setSavedPhases(savedPhases);
      setToast("Couldn't update. Try again.");
    }
  }, [savedPhases, savedSet, persist]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
        <div
          style={{
            width: 24, height: 24,
            border: "2px solid var(--rose-soft-bg)",
            borderTopColor: "var(--rose-primary)",
            borderRadius: "50%",
            animation: "lf-spin 0.7s linear infinite",
          }}
        />
      </div>
    );
  }

  const visibleBento = rankedBento.slice(0, pageSize);

  return (
    <div className="fy-root">
      <style>{`
        .fy-root { padding-top: 4px; }
        .fy-scroll::-webkit-scrollbar { display: none; }
        .fy-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fy-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fy-pop { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        .fy-bento {
          display: grid;
          grid-template-columns: 1fr;
          grid-auto-flow: dense;
          gap: 12px;
        }
        .fy-bento-card {
          opacity: 0;
          animation: fy-fade 280ms ease-out forwards;
        }
        .fy-hero { width: 100%; height: 360px; }
        .fy-hero-text { padding: 16px; }
        .fy-hero-text h2 { font-size: 26px !important; }
        @media (min-width: 768px) {
          .fy-bento { grid-template-columns: 1fr 1fr; gap: 16px; }
          .fy-hero { max-width: 760px; height: 380px; margin: 0 auto 20px; }
          .fy-hero-text { padding: 24px; }
          .fy-hero-text h2 { font-size: 28px !important; }
        }
        @media (min-width: 1024px) {
          .fy-bento { grid-template-columns: repeat(3, 1fr); gap: 20px; }
          .fy-hero { max-width: 920px; height: 420px; }
          .fy-hero-text h2 { font-size: 32px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .fy-bento-card, .fy-hero { animation: none !important; opacity: 1 !important; }
        }
        /* Subtle 3D depth on hover (desktop only) */
        @media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
          .fy-bento-card:hover {
            transform: perspective(1000px) translateY(-3px) rotateX(0.5deg);
            box-shadow:
              0 2px 4px rgba(43,30,22,0.06),
              0 10px 24px rgba(43,30,22,0.10),
              0 24px 56px rgba(43,30,22,0.08) !important;
          }
          .fy-hero:hover {
            transform: perspective(1200px) translateY(-2px);
            box-shadow:
              0 4px 8px rgba(43,30,22,0.08),
              0 16px 36px rgba(43,30,22,0.12),
              0 32px 64px rgba(43,30,22,0.10) !important;
          }
        }
      `}</style>

      <EditorialHero
        item={hero}
        savedSet={savedSet}
        savedPhases={savedPhases}
        onSave={handleSave}
        onUntag={handleUntag}
      />

      <PhaseInboxRail items={allItems} currentPhase={currentPhase} />

      <SavedRail
        items={savedItems}
        currentPhase={currentPhase}
        savedPhases={savedPhases}
        onUntagOrUnsave={handleUntag}
      />

      <TryThisRail
        items={tryThisItems}
        contentByKey={contentByKey}
        userId={user?.id}
      />

      <BentoGrid
        items={visibleBento}
        currentPhase={currentPhase}
        savedSet={savedSet}
        savedPhases={savedPhases}
        onSave={handleSave}
        onUntag={handleUntag}
      />

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}