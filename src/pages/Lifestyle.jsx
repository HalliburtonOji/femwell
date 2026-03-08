import { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw } from "lucide-react";
import LifestyleCard from "../components/lifestyle/LifestyleCard";
import FeedSkeleton from "../components/lifestyle/FeedSkeleton";
import TrendingStrip from "../components/lifestyle/TrendingStrip";

const MODES = [
  { id: "for_you", label: "For You" },
  { id: "following", label: "Following" },
  { id: "trending", label: "Trending" },
];

const CATEGORIES = ["All", "Womens Health", "Relationships", "Professional", "Mental Health", "Nutrition", "Lifestyle", "Beauty", "Fitness"];

export default function Lifestyle() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("for_you");
  const [items, setItems] = useState([]);
  const [editorPick, setEditorPick] = useState(null);
  const [trendingItems, setTrendingItems] = useState([]);
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
    base44.auth.me().then(setUser);
  }, []);

  const loadFeed = useCallback(async (newMode, newPage = 0, refresh = false) => {
    if (newPage === 0) {
      refresh ? setRefreshing(true) : setLoading(true);
      setItems([]);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await base44.functions.invoke('getLifestyleFeed', {
        mode: newMode,
        page: newPage,
        page_size: 15,
      });
      const data = res.data;
      if (newPage === 0) {
        setItems(data.items || []);
        setEditorPick(data.editor_pick || null);
      } else {
        setItems((prev) => [...prev, ...(data.items || [])]);
      }
      setHasMore(data.has_more || false);
      setPage(newPage);

      // Load trending separately on first load
      if (newPage === 0 && newMode !== 'trending') {
        const tRes = await base44.functions.invoke('getLifestyleFeed', { mode: 'trending', page: 0, page_size: 6 });
        setTrendingItems(tRes.data?.items || []);
      }
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
    setRefreshing(false);
    setLoadingMore(false);
  }, []);

  useEffect(() => {
    loadFeed(mode, 0);
  }, [mode]);

  // Infinite scroll
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

  const displayedItems = filterCategory === "All"
    ? items
    : items.filter((i) => i.category === filterCategory);

  const handleHide = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const handleSave = (id) => setSavedIds((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const handleLike = (id) => setLikedIds((prev) => { const s = new Set(prev); s.add(id); return s; });

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
        {/* Header */}
        <div className="pt-12 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-rose-900">Lifestyle</h1>
            <p className="text-xs text-gray-400 mt-0.5">Your personalised wellness feed</p>
          </div>
          <button
            onClick={() => loadFeed(mode, 0, true)}
            disabled={refreshing}
            className="w-9 h-9 rounded-xl bg-white/80 flex items-center justify-center shadow-sm hover:bg-rose-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-rose-400 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-2 mb-4">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id); setFilterCategory("All"); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                mode === m.id
                  ? "bg-rose-500 text-white shadow-sm"
                  : "bg-white/70 text-gray-500 hover:bg-white"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Category filter strip */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterCategory === cat
                  ? "bg-rose-100 text-rose-600 font-semibold"
                  : "bg-white/60 text-gray-400 hover:bg-white hover:text-gray-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <FeedSkeleton />
        ) : (
          <>
            {/* Trending strip (for_you only) */}
            {mode === "for_you" && trendingItems.length > 0 && (
              <TrendingStrip items={trendingItems} />
            )}

            {/* Editor pick pinned card */}
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

            {/* Main feed */}
            {displayedItems.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🌸</p>
                <p className="font-semibold text-gray-700">No content yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  {mode === "following"
                    ? "Follow topics to see content here"
                    : "Check back soon — we're curating fresh content"}
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

            {/* Infinite scroll loader */}
            <div ref={loaderRef} className="py-6 text-center">
              {loadingMore && (
                <div className="flex justify-center">
                  <div className="w-6 h-6 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin" />
                </div>
              )}
              {!hasMore && items.length > 0 && (
                <p className="text-xs text-gray-300">You're all caught up ✨</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}