import { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Bookmark, RefreshCw } from "lucide-react";
import LifestyleCard from "../components/lifestyle/LifestyleCard";
import FeedSkeleton from "../components/lifestyle/FeedSkeleton";
import TrendingStrip from "../components/lifestyle/TrendingStrip";
import DailyPulseStrip from "../components/lifestyle/DailyPulseStrip";

const MODES = [
  { id: "for_you", label: "For You" },
  { id: "following", label: "Following" },
  { id: "trending", label: "Trending" },
  { id: "clips", label: "Clips" },
];

const CATEGORIES = ["All", "Womens Health", "Relationships", "Career & Money", "Mental Wellness", "Food", "Lifestyle", "Beauty", "Fitness", "Culture", "Parenting", "Sex Education", "Menopause", "PCOS", "PMS"];

export default function Lifestyle() {
  const [mode, setMode] = useState("for_you");
  const [items, setItems] = useState([]);
  const [editorPick, setEditorPick] = useState(null);
  const [trendingItems, setTrendingItems] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [savedIds, setSavedIds] = useState(new Set());
  const [likedIds, setLikedIds] = useState(new Set());
  const [filterCategory, setFilterCategory] = useState("All");
  const loaderRef = useRef(null);

  useEffect(() => {
    (async () => {
      const currentUser = await base44.auth.me();
      const [profiles, preferences, saved] = await Promise.all([
        base44.entities.LifestyleProfile.filter({ user_id: currentUser.id }),
        base44.entities.UserPreferences.filter({ user_id: currentUser.id }),
        base44.entities.SavedItems.filter({ user_id: currentUser.id, item_type: "LIFESTYLE" }, "-created_at", 200),
      ]);

      if (!profiles[0]) {
        await base44.entities.LifestyleProfile.create({ user_id: currentUser.id });
      }

      setInterests(preferences[0]?.lifestyle_interests || []);
      setSavedIds(new Set(saved.map((item) => item.item_id)));
    })();
  }, []);

  const loadFeed = useCallback(async (newMode, newPage = 0, refresh = false) => {
    if (newPage === 0) {
      refresh ? setRefreshing(true) : setLoading(true);
      setItems([]);
    } else {
      setLoadingMore(true);
    }

    try {
      const allItems = await base44.entities.LifestyleItems.list("-pub_date", 200);
      const filteredItems = allItems.filter((item) => item.status === "PUBLISHED" || item.status === "NEEDS_REVIEW");

      if (newPage === 0) {
        setItems(filteredItems.slice(0, 15));
        setEditorPick(filteredItems.find((item) => item.is_editor_pick) || null);
      } else {
        const start = newPage * 15;
        setItems((prev) => [...prev, ...filteredItems.slice(start, start + 15)]);
      }

      setHasMore(filteredItems.length > (newPage + 1) * 15);
      setPage(newPage);

      if (newPage === 0 && newMode === "for_you") {
        setTrendingItems(filteredItems.filter((item) => item.is_trending).slice(0, 6));
      }
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
    setRefreshing(false);
    setLoadingMore(false);
  }, []);

  useEffect(() => {
    loadFeed(mode, 0);
  }, [mode, loadFeed]);

  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        loadFeed(mode, page + 1);
      }
    }, { threshold: 0.1 });
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page, mode, loadFeed]);

  const displayedItems = filterCategory === "All" ? items : items.filter((item) => item.category === filterCategory);

  const handleHide = (id) => setItems((prev) => prev.filter((item) => item.id !== id));
  const handleSave = (id, nextSaved) => setSavedIds((prev) => {
    const next = new Set(prev);
    if (nextSaved) next.add(id);
    else next.delete(id);
    return next;
  });
  const handleLike = (id) => setLikedIds((prev) => new Set(prev).add(id));

  return (
    <div className="min-h-screen femwell-gradient pb-28">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="max-w-3xl mx-auto px-4">
        <div className="pt-12 pb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-rose-900">Lifestyle</h1>
            <p className="text-xs text-gray-400 mt-0.5">Your personalised wellness feed</p>
          </div>
          <div className="flex items-center gap-2">
            <a href={createPageUrl("Saved")} className="w-9 h-9 rounded-xl bg-white/80 flex items-center justify-center shadow-sm hover:bg-rose-50 transition-colors">
              <Bookmark className="w-4 h-4 text-rose-500" />
            </a>
            <button
              onClick={() => loadFeed(mode, 0, true)}
              disabled={refreshing}
              className="w-9 h-9 rounded-xl bg-white/80 flex items-center justify-center shadow-sm hover:bg-rose-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-rose-400 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {MODES.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setMode(tab.id); setFilterCategory("All"); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${mode === tab.id ? "bg-rose-500 text-white shadow-sm" : "bg-white/70 text-gray-500 hover:bg-white"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {interests.length > 0 && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {interests.map((interest) => (
              <button key={interest} onClick={() => setFilterCategory(interest)} className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600">
                {interest}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filterCategory === cat ? "bg-rose-100 text-rose-600 font-semibold" : "bg-white/60 text-gray-400 hover:bg-white hover:text-gray-600"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="card-glass rounded-2xl p-4 mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Automated feed</p>
          <h2 className="mt-2 text-lg font-bold text-gray-900">Fresh stories, clips, and social finds</h2>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">New items roll in automatically from trusted sources, then the feed learns from your saves, likes, hides, interests, and activity.</p>
        </div>

        {!loading && mode === "for_you" && items.length > 0 && <DailyPulseStrip items={items} />}

        {loading ? (
          <FeedSkeleton />
        ) : (
          <>
            {mode === "for_you" && trendingItems.length > 0 && <TrendingStrip items={trendingItems} />}

            {editorPick && mode === "for_you" && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">✦ Editor's Pick Today</p>
                <LifestyleCard
                  item={{ ...editorPick, is_editor_pick: true }}
                  onHide={handleHide}
                  onSave={handleSave}
                  onLike={handleLike}
                  saved={savedIds.has(editorPick.id)}
                  liked={likedIds.has(editorPick.id)}
                />
              </div>
            )}

            {displayedItems.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🌸</p>
                <p className="font-semibold text-gray-700">No content yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  {mode === "following"
                    ? "Follow more topics to build this stream."
                    : mode === "clips"
                      ? "Clips will appear here as new video finds are ranked."
                      : "Your feed is waking up — fresh stories publish automatically as they’re processed."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayedItems.map((item) => (
                  <LifestyleCard
                    key={item.id}
                    item={item}
                    onHide={handleHide}
                    onSave={handleSave}
                    onLike={handleLike}
                    saved={savedIds.has(item.id)}
                    liked={likedIds.has(item.id)}
                  />
                ))}
              </div>
            )}

            <div ref={loaderRef} className="py-6 text-center">
              {loadingMore && (
                <div className="flex justify-center">
                  <div className="w-6 h-6 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin" />
                </div>
              )}
              {!hasMore && items.length > 0 && <p className="text-xs text-gray-300">You're all caught up ✨</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}