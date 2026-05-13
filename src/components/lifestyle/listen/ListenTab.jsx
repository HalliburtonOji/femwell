import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { getCurrentCyclePhase } from '@/utils/cyclePhase';
import ListenFilterChips from './ListenFilterChips';
import TikTokRail from './TikTokRail';
import PodcastRail from './PodcastRail';
import ListenGrid from './ListenGrid';
import Toast from '@/components/lifestyle/foryou/Toast';

async function fetchGridItems(chip, lifestyleProfile) {
  if (chip === 'sessions') {
    return await base44.entities.ContentItems.filter({}, '-created_date', 24).catch(() => []);
  }

  const baseFilter = { status: 'PUBLISHED' };
  let mediaFilter;
  if (chip === 'all') {
    mediaFilter = { media_type: { $in: ['VIDEO', 'PODCAST'] } };
  } else if (chip === 'videos') {
    mediaFilter = { media_type: 'VIDEO' };
  } else if (chip === 'podcasts') {
    mediaFilter = { media_type: 'PODCAST' };
  } else {
    return [];
  }

  const items = await base44.entities.LifestyleItems.filter(
    { ...baseFilter, ...mediaFilter },
    '-published_at',
    24
  ).catch(() => []);

  const hidden = new Set((lifestyleProfile?.hidden_item_ids) || []);
  const blocked = new Set((lifestyleProfile?.blocked_categories) || []);
  return (items || []).filter(it => !hidden.has(it.id) && !blocked.has(it.category));
}

async function fetchAllChip(lifestyleProfile) {
  const [media, sessions] = await Promise.all([
    fetchGridItems('all', lifestyleProfile),
    base44.entities.ContentItems.filter({}, '-created_date', 8).catch(() => []),
  ]);
  const merged = [
    ...(media || []),
    ...(sessions || []).map(s => ({ ...s, _isSession: true })),
  ];
  merged.sort((a, b) => {
    const aDate = a.published_at || a.created_date || '';
    const bDate = b.published_at || b.created_date || '';
    return bDate.localeCompare(aDate);
  });
  return merged.slice(0, 24);
}

export default function ListenTab({ categoryFilter }) {
  const initChip = () => {
    const p = new URLSearchParams(window.location.search).get('filter');
    const valid = ['all', 'videos', 'podcasts', 'sessions'];
    return valid.includes(p) ? p : 'all';
  };

  const [activeChip, setActiveChip] = useState(initChip);
  const [gridItems, setGridItems] = useState([]);
  const [tikTokItems, setTikTokItems] = useState([]);
  const [podcastItems, setPodcastItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [lifestyleProfile, setLifestyleProfile] = useState(null);
  const [savedSet, setSavedSet] = useState(new Set());
  const [savedPhases, setSavedPhases] = useState({});
  const [toast, setToast] = useState(null);

  // Load user + profiles once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      if (cancelled || !u) return;
      setUser(u);

      const [profiles, lpRows] = await Promise.all([
        base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []),
        base44.entities.LifestyleProfile.filter({ user_id: u.id }).catch(() => []),
      ]);
      if (cancelled) return;
      const prof = profiles[0] || null;
      const lp = lpRows[0] || null;
      setProfile(prof);
      setLifestyleProfile(lp);
      setSavedSet(new Set(Array.isArray(prof?.saved_item_ids) ? prof.saved_item_ids : []));
      setSavedPhases(prof?.saved_item_phases || {});
    })();
    return () => { cancelled = true; };
  }, []);

  // On mount: fetch TikTok rail + podcast rail in parallel
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [tiktoks, podcasts] = await Promise.all([
        base44.entities.LifestyleItems.filter(
          { media_type: 'TIKTOK', is_embeddable: true, status: 'PUBLISHED' },
          '-published_at',
          12
        ).catch(() => []),
        base44.entities.LifestyleItems.filter(
          { media_type: 'PODCAST', status: 'PUBLISHED' },
          '-published_at',
          12
        ).catch(() => []),
      ]);
      if (!cancelled) {
        setTikTokItems(tiktoks || []);
        setPodcastItems(podcasts || []);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Fetch grid when chip changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('filter', activeChip);
    window.history.replaceState({}, '', url.toString());

    (async () => {
      try {
        const data = activeChip === 'all'
          ? await fetchAllChip(lifestyleProfile)
          : await fetchGridItems(activeChip, lifestyleProfile);
        if (!cancelled) setGridItems(data || []);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // lifestyleProfile is intentionally included — when it loads after the
    // initial mount, we want to re-fetch so hidden_item_ids + blocked_categories
    // apply on the first paint instead of one render too late.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChip, lifestyleProfile]);

  const persist = useCallback(async (nextIds, nextPhases) => {
    if (!user?.id) { setToast('Sign in to save items.'); return false; }
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
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
        ]);
        setProfile({ ...row, saved_item_ids: nextIds, saved_item_phases: nextPhases });
      }
      return true;
    } catch {
      return false;
    }
  }, [profile, user]);

  const handleSave = useCallback(async ({ id, phase, isSession }) => {
    if (!id) return;
    const wasSaved = savedSet.has(id);
    const nextIds = wasSaved ? Array.from(savedSet) : [...Array.from(savedSet), id];
    const nextPhases = { ...savedPhases };
    if (phase) nextPhases[id] = phase;
    else delete nextPhases[id];

    setSavedSet(new Set(nextIds));
    setSavedPhases(nextPhases);

    const ok = await persist(nextIds, nextPhases);
    if (!ok) {
      setSavedSet(new Set(Array.from(savedSet)));
      setSavedPhases(savedPhases);
      setToast("Couldn't save. Try again.");
      return;
    }

    if (!wasSaved && user?.id && !isSession) {
      base44.entities.LifestyleInteractions.create({
        user_id: user.id,
        item_id: id,
        action: 'save',
      }).catch(() => {});
    }
  }, [savedSet, savedPhases, persist, user]);

  const handleUntag = useCallback(async (id) => {
    const nextPhases = { ...savedPhases };
    delete nextPhases[id];
    const nextIds = Array.from(savedSet);
    setSavedPhases(nextPhases);
    const ok = await persist(nextIds, nextPhases);
    if (!ok) { setSavedPhases(savedPhases); setToast("Couldn't update. Try again."); }
  }, [savedPhases, savedSet, persist]);

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    (async () => {
      try {
        const data = activeChip === 'all'
          ? await fetchAllChip(lifestyleProfile)
          : await fetchGridItems(activeChip, lifestyleProfile);
        setGridItems(data || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <div style={{ paddingBottom: 32 }}>
      <ListenFilterChips activeChip={activeChip} onChange={setActiveChip} />

      <div style={{ marginTop: 16 }}>
        <PodcastRail
          items={podcastItems}
          savedSet={savedSet}
          savedPhases={savedPhases}
          onSave={handleSave}
          onUntag={handleUntag}
        />

        <TikTokRail
          items={tikTokItems}
          savedSet={savedSet}
          savedPhases={savedPhases}
          onSave={handleSave}
          onUntag={handleUntag}
        />

        <ListenGrid
          items={gridItems}
          activeChip={activeChip}
          onSave={handleSave}
          onUntag={handleUntag}
          savedSet={savedSet}
          savedPhases={savedPhases}
          loading={loading}
          error={error}
          onRetry={handleRetry}
        />
      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}