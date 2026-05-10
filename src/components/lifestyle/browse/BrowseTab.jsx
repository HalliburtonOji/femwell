import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { getCurrentCyclePhase } from '@/utils/cyclePhase';
import BrowseFilterChips from './BrowseFilterChips';
import BrowseSearch from './BrowseSearch';
import BrowseGrid from './BrowseGrid';
import BooksGrid from './BooksGrid';
import Toast from '@/components/lifestyle/foryou/Toast';
import SavePopover from '@/components/lifestyle/foryou/SavePopover';

async function fetchItems(chip, lifestyleProfile) {
  if (chip === 'books') return [];

  const baseFilter = { status: 'PUBLISHED' };
  let typeFilter = {};

  if (chip === 'all') {
    typeFilter = { content_type: { $in: ['ARTICLE', 'FICTION', 'STORY', 'GUIDE'] } };
  } else if (chip === 'articles') {
    typeFilter = { content_type: 'ARTICLE' };
  } else if (chip === 'fiction') {
    typeFilter = { content_type: 'FICTION' };
  } else if (chip === 'stories') {
    typeFilter = { content_type: 'STORY' };
  } else if (chip === 'guides') {
    typeFilter = { content_type: 'GUIDE' };
  } else {
    return [];
  }

  const items = await base44.entities.LifestyleItems.filter(
    { ...baseFilter, ...typeFilter },
    '-published_at',
    24
  ).catch(() => []);

  const hidden = new Set((lifestyleProfile?.hidden_item_ids) || []);
  const blocked = new Set((lifestyleProfile?.blocked_categories) || []);
  return (items || []).filter(it => !hidden.has(it.id) && !blocked.has(it.category));
}

async function fetchBooks() {
  const picks = await base44.entities.WeeklyBookPick.filter(
    { status: 'PUBLISHED' },
    '-week_start',
    12
  ).catch(() => []);

  const out = [];
  for (const pick of (picks || [])) {
    const arr = Array.isArray(pick.books) ? pick.books : [];
    for (const b of arr) {
      out.push({ ...b, _pickId: pick.id, _weekStart: pick.week_start });
    }
  }
  return out;
}

export default function BrowseTab() {
  // Read initial chip from URL
  const initChip = () => {
    const p = new URLSearchParams(window.location.search).get('filter');
    const valid = ['all', 'articles', 'fiction', 'stories', 'books', 'guides'];
    return valid.includes(p) ? p : 'all';
  };

  const [activeChip, setActiveChip] = useState(initChip);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [lifestyleProfile, setLifestyleProfile] = useState(null);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [savedSet, setSavedSet] = useState(new Set());
  const [savedPhases, setSavedPhases] = useState({});

  const [toast, setToast] = useState(null);
  // popover state
  const [pendingSave, setPendingSave] = useState(null); // { id, anchorRect }

  // Load user + profile once
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
      setCurrentPhase(getCurrentCyclePhase(prof));
    })();
    return () => { cancelled = true; };
  }, []);

  // Fetch when chip changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setSearchQuery('');

    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('filter', activeChip);
    window.history.replaceState({}, '', url.toString());

    (async () => {
      try {
        if (activeChip === 'books') {
          const b = await fetchBooks();
          if (!cancelled) setBooks(b);
        } else {
          const data = await fetchItems(activeChip, lifestyleProfile);
          if (!cancelled) setItems(data);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChip]);

  // Persist save to UserProfile
  const persist = useCallback(async (nextIds, nextPhases) => {
    if (!user?.id) { setToast('Sign in to save articles.'); return false; }
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

  const handleSave = useCallback(async ({ id, phase, isBook }) => {
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

    // Log interaction for newly-saved non-book items
    if (!wasSaved && user?.id && !isBook) {
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

  // Heart click — books skip popover, articles open it
  const handleHeartClick = useCallback(({ id, phase, isBook }) => {
    if (isBook) {
      handleSave({ id, phase: null, isBook: true });
      return;
    }
    // Save immediately with phase null (SaveHeartButton's popover handles phase selection via onSave)
    handleSave({ id, phase: phase || null });
  }, [handleSave]);

  const handleRetry = (action) => {
    if (action === 'clearSearch') { setSearchQuery(''); return; }
    setError(false);
    setLoading(true);
    (async () => {
      try {
        if (activeChip === 'books') {
          setBooks(await fetchBooks());
        } else {
          setItems(await fetchItems(activeChip, lifestyleProfile));
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <div style={{ paddingBottom: 32 }}>
      <BrowseFilterChips activeChip={activeChip} onChange={setActiveChip} />
      <BrowseSearch value={searchQuery} onChange={setSearchQuery} />

      <div style={{ marginTop: 16 }}>
        {activeChip === 'books' ? (
          <BooksGrid
            books={books}
            savedSet={savedSet}
            onHeartClick={handleHeartClick}
          />
        ) : (
          <BrowseGrid
            items={items}
            loading={loading}
            error={error}
            onRetry={handleRetry}
            activeChip={activeChip}
            searchQuery={searchQuery}
            savedSet={savedSet}
            savedPhases={savedPhases}
            onHeartClick={handleSave}
            onUntag={handleUntag}
            currentPhase={currentPhase}
          />
        )}
      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}