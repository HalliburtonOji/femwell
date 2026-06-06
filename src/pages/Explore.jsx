import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, SlidersHorizontal, X, Lock } from "lucide-react";
import { PageLoader } from "../components/common/LoadingSpinner";
import { differenceInDays, parseISO } from "date-fns";
import { createPageUrl } from "@/utils";
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

function getCurrentPhase(lastPeriodDate, cycleLength = 28, periodLength = 5) {
  if (!lastPeriodDate) return null;
  const today = new Date();
  const last = parseISO(lastPeriodDate);
  const dayOfCycle = (differenceInDays(today, last) % cycleLength) + 1;
  if (dayOfCycle <= periodLength) return "menstrual";
  if (dayOfCycle <= Math.round(cycleLength * 0.4)) return "follicular";
  if (dayOfCycle <= Math.round(cycleLength * 0.55)) return "ovulatory";
  return "luteal";
}

const PHASE_META = {
  menstrual:  { label: "Menstrual",  accent: "#C4849A", subtle: "#F5ECF0" },
  follicular: { label: "Follicular", accent: "#7A9E8E", subtle: "#EBF2EF" },
  ovulatory:  { label: "Ovulatory",  accent: "#B89E6A", subtle: "#F5F0E6" },
  luteal:     { label: "Luteal",     accent: "#8A7E88", subtle: "#F0EBF0" },
};

export default function Explore() {
  const urlParams = new URLSearchParams(window.location.search);
  const typeFromUrl = urlParams.get("type");
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState("free");
  const [content, setContent] = useState([]);
  const [bookmarkIds, setBookmarkIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCollection, setActiveCollection] = useState(null);
  const [activeType, setActiveType] = useState(typeFromUrl || "All");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ showFreeOnly: false, level: "all", durationBucket: "all" });
  const [userProfile, setUserProfile] = useState(null);
  const [newThisWeek, setNewThisWeek] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const [ents, bookmarks, items, profileResult, recs] = await Promise.all([
          base44.entities.Entitlements.filter({ user_id: u.id }).catch(() => []),
          base44.entities.ContentBookmarks.filter({ user_id: u.id }).catch(() => []),
          base44.entities.ContentItems.list("-created_date", 60).catch(() => []),
          base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []),
          base44.entities.ProgramRecommendations.filter({ user_id: u.id }, "-created_date", 4).catch(() => []),
        ]);
        if (ents[0]) setUserPlan(ents[0].plan || "free");
        setBookmarkIds(new Set(bookmarks.map((b) => b.content_id)));
        setContent(items);
        if (profileResult?.[0]) setUserProfile(profileResult[0]);
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        setNewThisWeek(items.filter(i => (i.created_date || i.created_at || "") >= oneWeekAgo).slice(0, 6));
        setRecommendations(recs);
      } catch (err) {
        console.error("Explore page init failed:", err);
      } finally {
        setLoading(false);
      }
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
  const currentPhase = userProfile
    ? getCurrentPhase(
        userProfile.last_period_start_date,
        userProfile.cycle_avg_length,
        userProfile.period_length
      )
    : null;
  const phaseMeta = currentPhase ? PHASE_META[currentPhase] : null;
  const phaseContent = currentPhase
    ? content
        .filter(item => Array.isArray(item.cycle_phases) && item.cycle_phases.includes(currentPhase))
        .slice(0, 8)
    : [];

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>

      {/* ── Sticky header ───────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 backdrop-blur-xl px-4 pb-3 space-y-3"
        style={{ backgroundColor: "rgba(250,248,245,0.97)", borderBottom: "1px solid var(--border)", paddingTop: "calc(env(safe-area-inset-top) + 2.5rem)" }}>

        <div className="flex items-center justify-between">
          <div>
            <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", }}>Discovery</p>
            <h1 className="fw-display leading-tight">Explore</h1>
          </div>
          <p className="text-xs" style={{ color: "var(--mauve)", }}>Sessions, videos &amp; guides</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-2xl px-3 py-2.5"
            style={{ backgroundColor: "var(--surface)", border: "1.5px solid var(--border)" }}>
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: "var(--mauve)" }} />
            <input
              className="flex-1 bg-transparent text-sm outline-none"
              placeholder="Search sessions, topics…"
              style={{ color: "var(--plum)", }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X className="w-4 h-4" style={{ color: "var(--mauve)" }} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(true)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center relative flex-shrink-0"
            style={{ backgroundColor: "var(--surface)", border: "1.5px solid var(--border)", color: "var(--mauve)" }}>
            <SlidersHorizontal className="w-4 h-4" />
            {(filters.showFreeOnly || filters.level !== "all" || filters.durationBucket !== "all") && (
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: "var(--rose-dust)" }} />
            )}
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
          {COLLECTIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCollection(activeCollection === c.id ? null : c.id)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                backgroundColor: activeCollection === c.id ? "var(--plum)" : "var(--surface)",
                color: activeCollection === c.id ? "white" : "var(--mauve)",
                border: `1px solid ${activeCollection === c.id ? "var(--plum)" : "var(--border)"}`,
                }}>
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
          {TYPE_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveType(t.id)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                backgroundColor: activeType === t.id ? "var(--rose-dust-subtle)" : "transparent",
                color: activeType === t.id ? "var(--rose-dust)" : "var(--mauve)",
                }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto px-4 pt-5 space-y-10">
        {!loading && !search && !activeCollection && activeType === "All" && phaseContent.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--plum)", }}>
                  For your phase
                </p>
                <p style={{ fontSize: "12px", color: "var(--mauve)", marginTop: "2px" }}>
                  {phaseMeta.label} · matched to where you are
                </p>
              </div>
              <div style={{
                fontSize: "11px", fontWeight: 600,
                color: phaseMeta.accent,
                backgroundColor: phaseMeta.subtle,
                padding: "4px 10px", borderRadius: "9999px",
                }}>
                {phaseMeta.label}
              </div>
            </div>

            <div
              className="flex gap-3 overflow-x-auto pb-2"
              style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch", scrollSnapType: "x mandatory" }}
            >
              {phaseContent.map((item) => {
                const locked = isLocked(item);
                return (
                  <div
                    key={item.id}
                    onClick={() => { if (!locked) window.location.href = createPageUrl("ContentPlayer") + "?id=" + item.id; }}
                    style={{
                      minWidth: "160px", maxWidth: "160px", flexShrink: 0,
                      scrollSnapAlign: "start", borderRadius: "16px", overflow: "hidden",
                      cursor: locked ? "default" : "pointer", position: "relative",
                    }}
                  >
                    <div style={{ backgroundColor: phaseMeta.subtle, padding: "14px" }}>
                      <div style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        backgroundColor: "rgba(255,255,255,0.7)",
                        borderRadius: "8px", padding: "3px 8px", marginBottom: "10px",
                      }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: phaseMeta.accent, }}>
                          {item.content_type}
                        </span>
                      </div>
                      <p style={{
                        fontSize: "13px", fontWeight: 700, color: "var(--plum)",
                        lineHeight: 1.35,
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: "6px",
                      }}>
                        {item.title}
                      </p>
                      {item.duration_minutes && (
                        <p style={{ fontSize: "11px", color: "var(--mauve)", }}>
                          {item.duration_minutes} min
                        </p>
                      )}
                    </div>
                    {locked && (
                      <div style={{
                        position: "absolute", top: "10px", right: "10px",
                        width: "22px", height: "22px", borderRadius: "50%",
                        backgroundColor: "var(--surface)", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                      }}>
                        <Lock style={{ width: "11px", height: "11px", color: "var(--plum)" }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
        {/* New this week */}
        {!loading && !search && !activeCollection && activeType === "All" && newThisWeek.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--plum)", }}>New this week</p>
              <span style={{ fontSize: "11px", color: "var(--mauve)", }}>{newThisWeek.length} new</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none", scrollSnapType: "x mandatory" }}>
              {newThisWeek.map(item => {
                const locked = isLocked(item);
                return (
                  <div key={item.id} onClick={() => { if (!locked) window.location.href = createPageUrl("ContentPlayer") + "?id=" + item.id; }}
                    style={{ minWidth: 150, maxWidth: 150, flexShrink: 0, scrollSnapAlign: "start", borderRadius: 16, backgroundColor: "var(--surface)", border: "1px solid var(--border)", padding: 14, cursor: locked ? "default" : "pointer", boxShadow: "var(--shadow-sm)" }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "var(--sage)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{item.content_type}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--plum)", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: 4 }}>{item.title}</p>
                    {item.duration_minutes && <p style={{ fontSize: 11, color: "var(--mauve)", }}>{item.duration_minutes} min</p>}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Quick sessions (≤5 min) */}
        {!loading && !search && !activeCollection && activeType === "All" && (() => {
          const quickItems = content.filter(i => (i.duration_minutes || 99) <= 5).slice(0, 8);
          if (!quickItems.length) return null;
          return (
            <section>
              <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--plum)", marginBottom: 10 }}>Quick sessions ≤ 5 min</p>
              <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none", scrollSnapType: "x mandatory" }}>
                {quickItems.map(item => {
                  const locked = isLocked(item);
                  return (
                    <div key={item.id} onClick={() => { if (!locked) window.location.href = createPageUrl("ContentPlayer") + "?id=" + item.id; }}
                      style={{ minWidth: 140, maxWidth: 140, flexShrink: 0, scrollSnapAlign: "start", borderRadius: 16, backgroundColor: "var(--sage-subtle)", border: "1px solid var(--sage-light)", padding: 14, cursor: locked ? "default" : "pointer" }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: "var(--sage)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{item.duration_minutes}m</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--plum)", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.title}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })()}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-video rounded-[20px] animate-pulse" style={{ backgroundColor: "var(--ivory-dark)" }} />
            ))}
          </div>
        ) : !hasAnyResults ? (
          <div className="rounded-[24px] p-14 text-center"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: "var(--ivory-dark)", color: "var(--mauve)" }}>
              <Search className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--plum)", }}>Nothing found</p>
            <p className="text-xs mb-4" style={{ color: "var(--mauve)", }}>Try adjusting your search or filters.</p>
            <button onClick={() => { setSearch(""); setActiveCollection(null); setActiveType("All"); }}
              className="text-xs font-semibold px-4 py-2 rounded-full"
              style={{ backgroundColor: "var(--plum)", color: "white", }}>
              Clear all
            </button>
          </div>
        ) : (
          <>
            {youtubeVideos.length > 0 && (
              <section>
                <p className="mb-3" style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", }}>YouTube Videos</p>
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
                <p className="mb-3" style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", }}>Audio Sessions</p>
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
                <p className="mb-3" style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", }}>App Sessions</p>
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

            {/* Programs bridge — shown on unfiltered browse */}
            {!search && !activeCollection && activeType === "All" && (
              <section>
                <div className="rounded-[24px] p-5 md:p-6"
                  style={{ backgroundColor: "var(--plum)" }}>
                  <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.55)", marginBottom: "6px" }}>Go deeper</p>
                  <h3 className="text-lg font-bold leading-snug mb-1.5" style={{ color: "white", }}>Ready for a guided journey?</h3>
                  <p className="text-sm mb-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.72)", }}>
                    Single sessions are great. Programs go further — day-by-day structure, built-in progress, and real consistency.
                  </p>
                  <a href="/ProgramsHub"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
                    style={{ backgroundColor: "var(--surface)", color: "var(--plum)", }}>
                    Browse programs
                  </a>
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