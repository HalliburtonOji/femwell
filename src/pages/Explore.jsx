import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, SlidersHorizontal, X, Headphones, Play } from "lucide-react";
import FilterDrawer from "../components/explore/FilterDrawer";
import ExploreContentCard from "../components/explore/ExploreContentCard";

const TYPE_TABS = [
  { id: "All", label: "All", emoji: "✨" },
  { id: "Saved", label: "Saved", emoji: "🔖" },
  { id: "FITNESS", label: "Fitness", emoji: "💪" },
  { id: "MOBILITY", label: "Mobility", emoji: "🤸" },
  { id: "GUIDE", label: "Guides", emoji: "📖" },
];

const COLLECTIONS = [
  { id: "sleep", label: "💤 Sleep" },
  { id: "pms", label: "🌸 PMS" },
  { id: "calm", label: "🌿 Calm" },
  { id: "energy", label: "⚡ Energy" },
  { id: "pain", label: "🩹 Pain Relief" },
  { id: "menopause", label: "🌙 Menopause" },
  { id: "postpartum", label: "💝 Postpartum" },
];

const TIER_ORDER = { free: 0, plus: 1, pro: 2 };
const AUDIO_TYPES = ["BREATHWORK", "MEDITATION"];

export default function Explore() {
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState("free");
  const [content, setContent] = useState([]);
  const [bookmarkIds, setBookmarkIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCollection, setActiveCollection] = useState(null);
  const [activeType, setActiveType] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ showFreeOnly: false, level: "all", durationBucket: "all" });

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [ents, bookmarks, items] = await Promise.all([
        base44.entities.Entitlements.filter({ user_id: u.id }),
        base44.entities.ContentBookmarks.filter({ user_id: u.id }),
        base44.entities.ContentItems.list("-created_date", 60),
      ]);
      if (ents[0]) setUserPlan(ents[0].plan || "free");
      setBookmarkIds(new Set(bookmarks.map((b) => b.content_id)));
      setContent(items);
      setLoading(false);
    })();
  }, []);

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

  const isLocked = (item) => (TIER_ORDER[item.access_tier] || 0) > (TIER_ORDER[userPlan] || 0);

  const filtered = content.filter((item) => {
    const tagList = item.tags ? item.tags.split(",").map((t) => t.trim().toLowerCase()) : [];
    if (activeType === "Saved") return bookmarkIds.has(item.id);
    if (search) {
      const q = search.toLowerCase();
      if (!item.title?.toLowerCase().includes(q) && !tagList.some((t) => t.includes(q))) return false;
    }
    if (activeType !== "All") {
      if (item.content_type !== activeType) return false;
    }
    if (activeCollection) {
      const colMap = { sleep: ["sleep"], pms: ["pms", "cramps"], calm: ["calm", "anxiety", "stress"], energy: ["energy"], pain: ["pain", "mobility"], menopause: ["menopause"], postpartum: ["postpartum"] };
      const keywords = colMap[activeCollection] || [];
      if (!keywords.some((k) => item.title?.toLowerCase().includes(k) || tagList.some((t) => t.includes(k)))) return false;
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

  // Split audio vs video
  const audioItems = filtered.filter((i) => AUDIO_TYPES.includes(i.content_type));
  const videoItems = filtered.filter((i) => !AUDIO_TYPES.includes(i.content_type));
  const showAudioSection = activeType === "All" && audioItems.length > 0;

  return (
    <div className="min-h-screen femwell-gradient pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-rose-50 px-4 pt-12 pb-3 space-y-3">
        {/* Search row */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-rose-50/80 rounded-2xl px-3 py-2.5">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
              placeholder="Search sessions, topics…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(true)}
            className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center relative flex-shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4 text-rose-400" />
            {(filters.showFreeOnly || filters.level !== "all" || filters.durationBucket !== "all") && (
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Collections */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {COLLECTIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCollection(activeCollection === c.id ? null : c.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeCollection === c.id
                  ? "bg-rose-500 text-white shadow-sm"
                  : "bg-white border border-rose-100 text-gray-600"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Type tabs */}
        <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {TYPE_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveType(t.id)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeType === t.id
                  ? "bg-rose-100 text-rose-700 font-bold"
                  : "text-gray-500 hover:text-gray-700 hover:bg-rose-50"
              }`}
            >
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto px-4 pt-5 space-y-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-video bg-rose-50/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm">No content found. Try a different search or filter.</p>
          </div>
        ) : (
          <>
            {/* Audio Section */}
            {showAudioSection && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Headphones className="w-4 h-4 text-purple-500" />
                  </div>
                  <h2 className="text-base font-bold text-gray-800">Breathwork & Meditation</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {audioItems.map((item) => (
                    <ExploreContentCard
                      key={item.id}
                      item={item}
                      locked={isLocked(item)}
                      bookmarked={bookmarkIds.has(item.id)}
                      onToggleBookmark={() => toggleBookmark(item.id)}
                      isAudio
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Video Section */}
            {videoItems.length > 0 && (
              <section>
                {showAudioSection && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-xl bg-rose-100 flex items-center justify-center">
                      <Play className="w-4 h-4 text-rose-500" />
                    </div>
                    <h2 className="text-base font-bold text-gray-800">Fitness, Mobility & Guides</h2>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {videoItems.map((item) => (
                    <ExploreContentCard
                      key={item.id}
                      item={item}
                      locked={isLocked(item)}
                      bookmarked={bookmarkIds.has(item.id)}
                      onToggleBookmark={() => toggleBookmark(item.id)}
                      isAudio={false}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
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