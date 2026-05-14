import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { getCurrentCyclePhase } from '@/utils/cyclePhase';
import { mapLegacyCategory } from '@/utils/contentCategory';
import BrowseSearch from './BrowseSearch';
import BrowseGrid from './BrowseGrid';
import BooksGrid from './BooksGrid';
import Toast from '@/components/lifestyle/foryou/Toast';

// Canonical slug match for client-side filtering. Mirrors ForYouTab so the
// `mental_health` slug catches "Mental Wellness" / "psychology" rows that
// the server filter `{category: "mental_health"}` was silently missing.
function _matchesCategorySlug(item, list) {
  if (!list || list.length === 0) return true;
  const raw = String(item.category || '').toLowerCase();
  const itemSlug = mapLegacyCategory(item.category) || raw;
  return list.some((f) => {
    const fl = String(f).toLowerCase();
    return itemSlug === fl || raw === fl;
  });
}

// ── Gutendex (Project Gutenberg) free public-domain book search ────────────
// Maps category slug (CONTENT_CATEGORIES) → Gutenberg topic search keywords.
// "all" + unknown slugs fall back to a broad women-focused topic so we never
// return empty.
const GUTENBERG_TOPIC = {
  all:             'women',
  nutrition:       'food cookery',
  movement:        'physical culture',
  mindfulness:     'meditation philosophy',
  cycle_education: 'women health',
  mental_health:   'psychology',
  sleep:           'rest sleep',
  relationships:   'love marriage',
  hormones:        'physiology women',
  self_care:       'women essays',
  other:           'women',
};

// `categorySlug` may be a string (legacy) or an array of slugs (Option B).
// For Gutendex we pick the first slug as the topic search; "all"/empty falls
// back to the women-focused default.
function _firstSlug(input) {
  if (Array.isArray(input)) return input[0] || 'all';
  return input || 'all';
}

async function fetchGutenbergBooks(categorySlug) {
  const slug = _firstSlug(categorySlug);
  const topic = GUTENBERG_TOPIC[slug] || GUTENBERG_TOPIC.all;
  const url = `https://gutendex.com/books?topic=${encodeURIComponent(topic)}&languages=en&page_size=12`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const data = await res.json();
    const books = Array.isArray(data?.results) ? data.results : [];
    return books.map((b) => ({
      _kind: 'gutenberg',
      _gutenbergId: b.id,
      title: b.title || '',
      author: (b.authors && b.authors[0] && b.authors[0].name) || 'Unknown',
      cover_url: `https://www.gutenberg.org/cache/epub/${b.id}/pg${b.id}.cover.medium.jpg`,
      reader_url: `https://www.gutenberg.org/cache/epub/${b.id}/pg${b.id}-images.html`,
    }));
  } catch {
    return [];
  }
}

async function fetchFemwellFiction() {
  // Fetch FemWell-generated fiction from both providers. base44 filters don't
  // support $in on a single provider field cleanly, so query each and merge.
  const [weekly, personal] = await Promise.all([
    base44.entities.LifestyleItems.filter(
      { provider: 'FEMWELL_FICTION_WEEKLY', status: 'PUBLISHED' },
      '-published_at',
      12,
    ).catch(() => []),
    base44.entities.LifestyleItems.filter(
      { provider: 'FEMWELL_FICTION_PERSONAL', status: 'PUBLISHED' },
      '-published_at',
      12,
    ).catch(() => []),
  ]);
  const merged = [...(weekly || []), ...(personal || [])];
  return merged
    .sort((a, b) => String(b.published_at || '').localeCompare(String(a.published_at || '')))
    .slice(0, 18)
    .map((it) => {
      const ch = Array.isArray(it.chapters_json) ? it.chapters_json : null;
      const chapterCount = ch && ch.length > 0 ? ch.length : 1;
      return {
        _kind: 'femwell',
        _itemId: it.id,
        title: it.title || '',
        author: 'FemWell',
        // Card displays summary (one-line synopsis), NEVER the lede text —
        // showing chapter-1 prose on a card is bad book-browsing UX.
        summary: it.summary || it.why_it_matters || '',
        // Genre / theme tags — first 3 render as pills on the card.
        tags: Array.isArray(it.tags) ? it.tags.slice(0, 3) : [],
        chapterCount,
        cover_url: it.image_url || '',
        category: it.category || '',
      };
    });
}

async function fetchBooks(categorySlug) {
  const [fem, gut] = await Promise.all([
    fetchFemwellFiction(),
    fetchGutenbergBooks(categorySlug),
  ]);
  // Show FemWell originals first, then Project Gutenberg free public-domain.
  return [...fem, ...gut];
}

async function fetchItems(chip, categorySlug, lifestyleProfile) {
  if (chip === 'books') return [];

  const baseFilter = { status: 'PUBLISHED' };
  let typeFilter = {};

  if (chip === 'all') {
    // FICTION excluded from "all" — fiction lives in the Books surface only.
    typeFilter = { content_type: { $in: ['ARTICLE', 'STORY', 'GUIDE'] } };
  } else if (chip === 'articles') {
    typeFilter = { content_type: 'ARTICLE' };
  } else if (chip === 'stories') {
    typeFilter = { content_type: 'STORY' };
  } else if (chip === 'guides') {
    typeFilter = { content_type: 'GUIDE' };
  } else {
    return [];
  }

  // Category filter is applied CLIENT-SIDE via slug normalisation because
  // the entity stores free-form labels ("Mental Wellness") that don't match
  // our slugs ("mental_health"). Server-side {category: "mental_health"}
  // returned zero results. We overfetch (60 not 24) and filter in JS.
  const filterList = Array.isArray(categorySlug)
    ? categorySlug.filter((s) => s && s !== 'all')
    : (categorySlug && categorySlug !== 'all' ? [categorySlug] : []);

  const items = await base44.entities.LifestyleItems.filter(
    { ...baseFilter, ...typeFilter },
    '-published_at',
    60,
  ).catch(() => []);

  const hidden = new Set((lifestyleProfile?.hidden_item_ids) || []);
  const blocked = new Set((lifestyleProfile?.blocked_categories) || []);
  return (items || [])
    .filter(it => !hidden.has(it.id) && !blocked.has(it.category))
    .filter(it => _matchesCategorySlug(it, filterList))
    .slice(0, 24);
}

export default function BrowseTab({ categoryFilter = 'all', activeChip = 'all' }) {
  // activeChip now flows in from Lifestyle.jsx (sticky-header chip row). The
  // valid chips are still { all, articles, stories, books, guides }. We accept
  // a legacy 'fiction' value defensively in case any stored state lingers.
  const normalisedChip = activeChip === 'fiction' ? 'books' : activeChip;
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

  // Fetch when chip OR category filter changes — they compose.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setSearchQuery('');

    // URL sync now lives in Lifestyle.jsx (sets ?tab=read and ?filter=...
    // when the user picks a tab or chip in the sticky header).

    (async () => {
      try {
        if (normalisedChip === 'books') {
          const b = await fetchBooks(categoryFilter);
          if (!cancelled) setBooks(b);
        } else {
          const data = await fetchItems(normalisedChip, categoryFilter, lifestyleProfile);
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
  }, [normalisedChip, categoryFilter]);

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
    handleSave({ id, phase: phase || null });
  }, [handleSave]);

  const handleRetry = (action) => {
    if (action === 'clearSearch') { setSearchQuery(''); return; }
    setError(false);
    setLoading(true);
    (async () => {
      try {
        if (normalisedChip === 'books') {
          setBooks(await fetchBooks(categoryFilter));
        } else {
          setItems(await fetchItems(normalisedChip, categoryFilter, lifestyleProfile));
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
      <BrowseSearch value={searchQuery} onChange={setSearchQuery} />

      <div style={{ marginTop: 16 }}>
        {normalisedChip === 'books' ? (
          <BooksGrid
            books={books}
            loading={loading}
            savedSet={savedSet}
            onHeartClick={handleHeartClick}
          />
        ) : (
          <BrowseGrid
            items={items}
            loading={loading}
            error={error}
            onRetry={handleRetry}
            activeChip={normalisedChip}
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
