import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Search, Bookmark, SlidersHorizontal, Lock, X } from "lucide-react";
import ContentCard from "../components/explore/ContentCard";
import FilterDrawer from "../components/explore/FilterDrawer";

const COLLECTIONS = [
  { id: "sleep", label: "Sleep Switch" },
  { id: "pms", label: "PMS Toolkit" },
  { id: "quick_calm", label: "Quick Calm" },
  { id: "low_energy", label: "Low Energy Days" },
  { id: "mobility", label: "Mobility & Pain Relief" },
  { id: "menopause", label: "Menopause Calm" },
  { id: "postpartum", label: "Postpartum Return" },
  { id: "desk_reset", label: "Desk Reset" },
];

const TYPE_TABS = ["All", "Meditation", "Breathwork", "Fitness", "Mobility", "Guides"];

const SORT_OPTIONS = [
  { id: "recommended", label: "Recommended" },
  { id: "newest", label: "Newest" },
  { id: "trending", label: "Trending" },
  { id: "shortest", label: "Shortest" },
  { id: "longest", label: "Longest" },
];

const TIER_ORDER = { free: 0, plus: 1, pro: 2 };

export default function Explore() {
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState("free");
  const [content, setContent] = useState([]);
  const [bookmarkIds, setBookmarkIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [search, setSearch] = useState("");
  const [activeCollection, setActiveCollection] = useState(null);
  const [activeType, setActiveType] = useState("All");
  const [sort, setSort] = useState("recommended");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ showFreeOnly: false, level: "all", durationBucket: "all" });

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [ents, bookmarks] = await Promise.all([
        base44.entities.Entitlements.filter({ user_id: u.id }),
        base44.entities.ContentBookmarks.filter({ user_id: u.id }),
      ]);
      if (ents[0]) setUserPlan(ents[0].plan || "free");
      setBookmarkIds(new Set(bookmarks.map((b) => b.content_id)));
      await loadContent(0, u.id);
    })();
  }, []);

  const loadContent = async (pageNum, userId) => {
    if (pageNum === 0) setLoading(true); else setLoadingMore(true);
    const sortField = sort === "newest" ? "-created_date" : sort === "shortest" ? "duration_minutes" : sort === "longest" ? "-duration_minutes" : "-created_date";
    const items = await base44.entities.ContentItems.list(sortField, 24, pageNum * 24);
    if (pageNum === 0) setContent(items); else setContent((c) => [...c, ...items]);
    setHasMore(items.length === 24);
    setPage(pageNum);
    setLoading(false);
    setLoadingMore(false);
  };

  const toggleBookmark = async (contentId) => {
    if (!user) return;
    if (bookmarkIds.has(contentId)) {
      const bms = await base44.entities.ContentBookmarks.filter({ user_id: user.id, content_id: contentId });
      if (bms[0]) await base44.entities.ContentBookmarks.delete(bms[0].id);
      setBookmarkIds((s) => { const n = new Set(s); n.delete(contentId); return n; });
    } else {
      await base44.entities.ContentBookmarks.create({ user_id: user.id, content_id: contentId });
      setBookmarkIds((s) => new Set([...s, contentId]));
    }
  };

  const filtered = content.filter((item) => {
    const tagList = item.tags ? item.tags.split(",").map(t => t.trim()) : [];
    if (search && !item.title?.toLowerCase().includes(search.toLowerCase()) && !tagList.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
    if (activeType !== "All" && item.content_type?.toLowerCase() !== activeType.toLowerCase()) return false;
    if (activeCollection) {
      const colMap = { sleep: ["sleep"], pms: ["pms", "cramps"], quick_calm: ["calm"], low_energy: ["energy"], mobility: ["mobility", "pain"], menopause: ["menopause"], postpartum: ["postpartum"], desk_reset: ["desk", "office"] };
      const keywords = colMap[activeCollection] || [];
      if (!keywords.some(k => item.title?.toLowerCase().includes(k) || tagList.some(t => t.toLowerCase().includes(k)))) return false;
    }
    if (filters.showFreeOnly && item.access_tier !== "free") return false;
    if (filters.level !== "all" && item.level !== filters.level) return false;
    if (filters.durationBucket !== "all") {
      const d = item.duration_minutes || 0;
      if (filters.durationBucket === "short" && d > 10) return false;
      if (filters.durationBucket === "medium" && (d < 10 || d > 30)) return false;
      if (filters.durationBucket === "long" && d < 30) return false;
    }
    return true;
  });

  const isLocked = (item) => (TIER_ORDER[item.access_tier] || 0) > (TIER_ORDER[userPlan] || 0);

  return (
    <div className="min-h-screen femwell-gradient pb-28">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-rose-50 px-4 pt-12 pb-3 space-y-3">
        {/* Search row */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-rose-50/80 rounded-2xl px-3 py-2.5">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
              placeholder="Search sleep, cramps, breathwork…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && <button onClick={() => setSearch("")}><X className="w-4 h-4 text-gray-400" /></button>}
          </div>
          <a href={createPageUrl("Bookmarks")} className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
            <Bookmark className="w-4 h-4 text-rose-400" />
          </a>
          <button onClick={() => setShowFilters(true)} className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center relative">
            <SlidersHorizontal className="w-4 h-4 text-rose-400" />
            {(filters.showFreeOnly || filters.level !== "all" || filters.durationBucket !== "all") && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Collections chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {COLLECTIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCollection(activeCollection === c.id ? null : c.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeCollection === c.id ? "bg-rose-500 text-white shadow-md" : "bg-white/80 text-gray-600 border border-rose-100"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Type tabs + Sort */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1 overflow-x-auto no-scrollbar flex-1">
            {TYPE_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  activeType === t ? "bg-rose-100 text-rose-700 font-bold" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-xs text-gray-500 bg-transparent border-none outline-none flex-shrink-0 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto px-4 pt-4">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-video bg-rose-50/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm">No content found. Try a different search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((item) => (
              <ContentCard
                key={item.id}
                item={item}
                locked={isLocked(item)}
                bookmarked={bookmarkIds.has(item.id)}
                onToggleBookmark={() => toggleBookmark(item.id)}
              />
            ))}
          </div>
        )}

        {hasMore && !loading && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => loadContent(page + 1, user?.id)}
              disabled={loadingMore}
              className="btn-secondary text-sm px-6 py-2"
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </div>

      {showFilters && (
        <FilterDrawer
          filters={filters}
          onApply={(f) => { setFilters(f); setShowFilters(false); }}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}