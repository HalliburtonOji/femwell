import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, SlidersHorizontal, X, Headphones, Play } from "lucide-react";
import FilterDrawer from "../components/explore/FilterDrawer";
import ExploreContentCard from "../components/explore/ExploreContentCard";
import YouTubeVideoCard from "../components/explore/YouTubeVideoCard";

const YOUTUBE_VIDEOS = [
  {
    video_id: "v4uk1cD8ar8",
    url: "https://www.youtube.com/watch?v=v4uk1cD8ar8",
    title: "Sleep Reset (10 Days)",
    thumbnail_url: "https://i.ytimg.com/vi/v4uk1cD8ar8/hqdefault.jpg",
    content_type: "GUIDE",
    tags: ["sleep", "stress", "wind down"],
  },
  {
    video_id: "n6RbW2LtdFs",
    url: "https://www.youtube.com/watch?v=n6RbW2LtdFs",
    title: "Calm & Anxiety Toolkit (7 Days)",
    thumbnail_url: "https://i.ytimg.com/vi/n6RbW2LtdFs/hqdefault.jpg",
    content_type: "GUIDE",
    tags: ["anxiety", "calm", "stress", "breathing"],
  },
  {
    video_id: "4JaCcp39iVI",
    url: "https://www.youtube.com/watch?v=4JaCcp39iVI",
    title: "PMS Relief (7 Days)",
    thumbnail_url: "https://i.ytimg.com/vi/4JaCcp39iVI/hqdefault.jpg",
    content_type: "GUIDE",
    tags: ["pms", "cramps", "periods"],
  },
  {
    video_id: "vYZyXCKGFC8",
    url: "https://www.youtube.com/watch?v=vYZyXCKGFC8",
    title: "Beginner Fitness Kickstart (14 Days)",
    thumbnail_url: "https://i.ytimg.com/vi/vYZyXCKGFC8/hqdefault.jpg",
    content_type: "FITNESS",
    tags: ["fitness", "energy", "strength"],
  },
  {
    video_id: "2aEceax_be4",
    url: "https://www.youtube.com/watch?v=2aEceax_be4",
    title: "Postpartum Gentle Return (14 Days)",
    thumbnail_url: "https://i.ytimg.com/vi/2aEceax_be4/hqdefault.jpg",
    content_type: "MOBILITY",
    tags: ["postpartum", "pelvic floor", "recovery"],
  },
  {
    video_id: "dVYKJ6OwQF8",
    url: "https://www.youtube.com/watch?v=dVYKJ6OwQF8",
    title: "Menopause Strength & Calm (14 Days)",
    thumbnail_url: "https://i.ytimg.com/vi/dVYKJ6OwQF8/hqdefault.jpg",
    content_type: "FITNESS",
    tags: ["menopause", "sleep", "strength", "energy"],
  },
  {
    video_id: "8oWmGJc8NWI",
    url: "https://www.youtube.com/watch?v=8oWmGJc8NWI",
    title: "Stress Reset (7 Days)",
    thumbnail_url: "https://i.ytimg.com/vi/8oWmGJc8NWI/hqdefault.jpg",
    content_type: "GUIDE",
    tags: ["stress", "focus", "calm"],
  },
  {
    video_id: "dHNT2DgCD3s",
    url: "https://www.youtube.com/watch?v=dHNT2DgCD3s",
    title: "Guided Sleep Affirmations | Relaxation for Fresh Starts",
    thumbnail_url: "https://i.ytimg.com/vi/dHNT2DgCD3s/hqdefault.jpg",
    content_type: "GUIDE",
    tags: ["sleep", "relaxation", "calm"],
  },
  {
    video_id: "NOaeKRft-gc",
    url: "https://www.youtube.com/watch?v=NOaeKRft-gc",
    title: "3 things that can cause painful periods - Chen X. Chen",
    thumbnail_url: "https://i.ytimg.com/vi/NOaeKRft-gc/hqdefault.jpg",
    content_type: "GUIDE",
    tags: ["pms", "periods", "cramps", "women's health"],
  },
  {
    video_id: "tEmt1Znux58",
    url: "https://www.youtube.com/watch?v=tEmt1Znux58",
    title: "Box breathing relaxation technique: how to calm feelings of stress or anxiety",
    thumbnail_url: "https://i.ytimg.com/vi/tEmt1Znux58/hqdefault.jpg",
    content_type: "GUIDE",
    tags: ["stress", "anxiety", "calm", "breathing"],
  },
  {
    video_id: "QNZfEtZ53RY",
    url: "https://www.youtube.com/watch?v=QNZfEtZ53RY",
    title: "Managing Menopause | Women's Health",
    thumbnail_url: "https://i.ytimg.com/vi/QNZfEtZ53RY/hqdefault.jpg",
    content_type: "GUIDE",
    tags: ["menopause", "women's health"],
  },
  {
    video_id: "cYWGzXLZFAk",
    url: "https://www.youtube.com/watch?v=cYWGzXLZFAk",
    title: "Here Comes Baby - Postpartum Recovery",
    thumbnail_url: "https://i.ytimg.com/vi/cYWGzXLZFAk/hqdefault.jpg",
    content_type: "GUIDE",
    tags: ["postpartum", "recovery", "women's health"],
  },
  {
    video_id: "ByEh91tyj60",
    url: "https://www.youtube.com/watch?v=ByEh91tyj60",
    title: "10-Minute Pelvic Floor Release & Mobility Flow | Pregnancy-Safe | Pelvic Floor PT",
    thumbnail_url: "https://i.ytimg.com/vi/ByEh91tyj60/hqdefault.jpg",
    content_type: "MOBILITY",
    tags: ["mobility", "pelvic floor", "pregnancy", "postpartum"],
  },
  {
    video_id: "jhY8TIDz-6I",
    url: "https://www.youtube.com/watch?v=jhY8TIDz-6I",
    title: "Breathing Meditation & Full-Body Relaxation for Restoring Sleep",
    thumbnail_url: "https://i.ytimg.com/vi/jhY8TIDz-6I/hqdefault.jpg",
    content_type: "GUIDE",
    tags: ["sleep", "relaxation", "breathing"],
  },
  {
    video_id: "GbYuJPxcaB8",
    url: "https://www.youtube.com/watch?v=GbYuJPxcaB8",
    title: "Menopause Sleep Support: Guided Breathing for Restful Nights",
    thumbnail_url: "https://i.ytimg.com/vi/GbYuJPxcaB8/hqdefault.jpg",
    content_type: "GUIDE",
    tags: ["sleep", "menopause", "breathing"],
  },
  {
    video_id: "VGLIM6mx2DM",
    url: "https://www.youtube.com/watch?v=VGLIM6mx2DM",
    title: "Detach from Thoughts and Worries Deep Sleep Meditation",
    thumbnail_url: "https://i.ytimg.com/vi/VGLIM6mx2DM/hqdefault.jpg",
    content_type: "GUIDE",
    tags: ["sleep", "stress", "calm"],
  },
  {
    video_id: "mnRMQI8awMs",
    url: "https://www.youtube.com/watch?v=mnRMQI8awMs",
    title: "Postpartum Pelvic Floor Workout - Beginner",
    thumbnail_url: "https://i.ytimg.com/vi/mnRMQI8awMs/hqdefault.jpg",
    content_type: "MOBILITY",
    tags: ["postpartum", "pelvic floor", "recovery"],
  },
  {
    video_id: "lSGn-zKxJzw",
    url: "https://www.youtube.com/watch?v=lSGn-zKxJzw",
    title: "12-Minute Postpartum Pelvic Floor Exercises To Do Daily",
    thumbnail_url: "https://i.ytimg.com/vi/lSGn-zKxJzw/hqdefault.jpg",
    content_type: "MOBILITY",
    tags: ["postpartum", "pelvic floor", "healing"],
  },
  {
    video_id: "NGkggtFGURk",
    url: "https://www.youtube.com/watch?v=NGkggtFGURk",
    title: "OB/GYN's Top 5 Tips for Healing Your Pelvic Floor After Birth",
    thumbnail_url: "https://i.ytimg.com/vi/NGkggtFGURk/hqdefault.jpg",
    content_type: "GUIDE",
    tags: ["postpartum", "pelvic floor", "education"],
  },
  {
    video_id: "eOSS2n8HgV8",
    url: "https://www.youtube.com/watch?v=eOSS2n8HgV8",
    title: "Menopause Strength Workout | Build Muscle & Fitness",
    thumbnail_url: "https://i.ytimg.com/vi/eOSS2n8HgV8/hqdefault.jpg",
    content_type: "FITNESS",
    tags: ["menopause", "strength", "fitness"],
  },
  {
    video_id: "kut4Yh1IIM8",
    url: "https://www.youtube.com/watch?v=kut4Yh1IIM8",
    title: "Free Your Joints in Menopause With This Simple Sequence",
    thumbnail_url: "https://i.ytimg.com/vi/kut4Yh1IIM8/hqdefault.jpg",
    content_type: "MOBILITY",
    tags: ["menopause", "mobility", "joints"],
  },
  {
    video_id: "DU4V5OpLp3s",
    url: "https://www.youtube.com/watch?v=DU4V5OpLp3s",
    title: "The Best Fitness Routines for Each Stage of Menopause",
    thumbnail_url: "https://i.ytimg.com/vi/DU4V5OpLp3s/hqdefault.jpg",
    content_type: "GUIDE",
    tags: ["menopause", "fitness", "education"],
  },
  {
    video_id: "gaP64KJGq9M",
    url: "https://www.youtube.com/watch?v=gaP64KJGq9M",
    title: "Quiet Your Busy Mind | Mindful Moments for Menopause",
    thumbnail_url: "https://i.ytimg.com/vi/gaP64KJGq9M/hqdefault.jpg",
    content_type: "GUIDE",
    tags: ["menopause", "calm", "mindfulness"],
  },
];

const TYPE_TABS = [
  { id: "All",      label: "All"      },
  { id: "Saved",    label: "Saved"    },
  { id: "Videos",   label: "Videos"   },
  { id: "Audio",    label: "Audio"    },
  { id: "FITNESS",  label: "Fitness"  },
  { id: "MOBILITY", label: "Mobility" },
  { id: "GUIDE",    label: "Guides"   },
];

const COLLECTIONS = [
  { id: "sleep",      label: "Sleep"      },
  { id: "pms",        label: "PMS"        },
  { id: "anxiety",    label: "Calm"       },
  { id: "energy",     label: "Energy"     },
  { id: "mobility",   label: "Mobility"   },
  { id: "menopause",  label: "Menopause"  },
  { id: "postpartum", label: "Postpartum" },
  { id: "stress",     label: "Stress"     },
];

const COLLECTION_KEYWORDS = {
  sleep: ["sleep", "wind down", "rest"],
  pms: ["pms", "period", "cramps"],
  anxiety: ["anxiety", "calm", "breathing"],
  energy: ["energy", "fitness", "strength"],
  mobility: ["mobility", "posture", "pelvic floor"],
  menopause: ["menopause"],
  postpartum: ["postpartum", "pregnancy", "recovery", "pelvic floor"],
  stress: ["stress", "focus", "calm", "breathing"],
};

const TIER_ORDER = { free: 0, plus: 1, pro: 2 };
const AUDIO_TYPES = ["BREATHWORK", "MEDITATION"];

function getTextHaystack(title, tags) {
  return `${title || ""} ${Array.isArray(tags) ? tags.join(" ") : tags || ""}`.toLowerCase();
}

function matchesCollection(haystack, activeCollection) {
  if (!activeCollection) return true;
  return (COLLECTION_KEYWORDS[activeCollection] || []).some((keyword) => haystack.includes(keyword));
}

function getYoutubeBookmarkId(video) {
  return `youtube:${video.video_id}`;
}

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
      setBookmarkIds((s) => {
        const n = new Set(s);
        n.delete(contentId);
        return n;
      });
    } else {
      await base44.entities.ContentBookmarks.create({ user_id: user.id, content_id: contentId });
      setBookmarkIds((s) => new Set([...s, contentId]));
    }
  };

  const isLocked = (item) => (TIER_ORDER[item.access_tier] || 0) > (TIER_ORDER[userPlan] || 0);

  const filteredContent = content.filter((item) => {
    const haystack = getTextHaystack(item.title, item.tags);
    const duration = item.duration_minutes || 0;

    if (activeType === "Saved" && !bookmarkIds.has(item.id)) return false;
    if (search && !haystack.includes(search.toLowerCase())) return false;
    if (!matchesCollection(haystack, activeCollection)) return false;

    if (activeType === "Audio" && !AUDIO_TYPES.includes(item.content_type)) return false;
    if (activeType === "Videos" && AUDIO_TYPES.includes(item.content_type)) return false;
    if (!["All", "Saved", "Videos", "Audio"].includes(activeType) && item.content_type !== activeType) return false;

    if (filters.showFreeOnly && item.access_tier !== "free") return false;
    if (filters.level !== "all" && item.level !== filters.level) return false;
    if (filters.durationBucket === "short" && duration > 10) return false;
    if (filters.durationBucket === "medium" && (duration < 10 || duration > 30)) return false;
    if (filters.durationBucket === "long" && duration < 30) return false;

    return true;
  });

  const youtubeVideos = YOUTUBE_VIDEOS.filter((video) => {
    const haystack = getTextHaystack(video.title, video.tags);

    if (activeType === "Saved" && !bookmarkIds.has(getYoutubeBookmarkId(video))) return false;
    if (search && !haystack.includes(search.toLowerCase())) return false;
    if (!matchesCollection(haystack, activeCollection)) return false;
    if (activeType === "Audio") return false;
    if (!["All", "Saved", "Videos"].includes(activeType) && video.content_type !== activeType) return false;

    return true;
  });

  const audioItems = filteredContent.filter((item) => AUDIO_TYPES.includes(item.content_type));
  const libraryVideoItems = filteredContent.filter((item) => !AUDIO_TYPES.includes(item.content_type));
  const hasAnyResults = audioItems.length > 0 || libraryVideoItems.length > 0 || youtubeVideos.length > 0;

  return (
    <div className="min-h-screen femwell-gradient pb-28">
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-rose-50 px-4 pt-12 pb-3 space-y-3">
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
              {t.label}
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
        ) : !hasAnyResults ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "var(--ivory-dark)" }}>
              <Search className="w-5 h-5" style={{ color: "var(--mauve)" }} />
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--plum)" }}>No content found</p>
            <p className="text-xs" style={{ color: "var(--mauve)" }}>Try a different search or filter.</p>
          </div>
        ) : (
          <>
            {youtubeVideos.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-xl bg-red-100 flex items-center justify-center">
                    <Play className="w-4 h-4 text-red-500" fill="currentColor" />
                  </div>
                  <h2 className="text-base font-bold text-gray-800">YouTube Videos</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {youtubeVideos.map((video) => (
                    <YouTubeVideoCard
                      key={video.video_id}
                      video={video}
                      bookmarked={bookmarkIds.has(getYoutubeBookmarkId(video))}
                      onToggleBookmark={() => toggleBookmark(getYoutubeBookmarkId(video))}
                    />
                  ))}
                </div>
              </section>
            )}

            {audioItems.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Headphones className="w-4 h-4 text-purple-500" />
                  </div>
                  <h2 className="text-base font-bold text-gray-800">Audio Sessions</h2>
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

            {libraryVideoItems.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-xl bg-rose-100 flex items-center justify-center">
                    <Play className="w-4 h-4 text-rose-500" />
                  </div>
                  <h2 className="text-base font-bold text-gray-800">App Videos</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {libraryVideoItems.map((item) => (
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
          onApply={(f) => {
            setFilters(f);
            setShowFilters(false);
          }}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}