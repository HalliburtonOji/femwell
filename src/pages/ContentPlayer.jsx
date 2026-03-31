import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Play, Lock, BookmarkCheck, Bookmark } from "lucide-react";

const PHASE_ACCENTS = {
  menstrual: "#C96B9E",
  follicular: "#9B7FCC",
  ovulatory: "#E8B84B",
  luteal: "#4ABFA3",
};
import { createPageUrl } from "@/utils";
import { saveItem, removeSavedItem } from "@/lib/savedItems";
import GuidedPlayer from "../components/content/GuidedPlayer";
import AudioPlayer from "../components/content/AudioPlayer";
import BreathworkLoopPlayer from "../components/content/BreathworkLoopPlayer";
import ManualCompleteButton from "../components/sessions/ManualCompleteButton";

const TIER_ORDER = { free: 0, plus: 1, pro: 2 };

function getYoutubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function getVimeoId(url) {
  if (!url) return null;
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

function VideoPlayer({ embedUrl }) {
  const [clicked, setClicked] = useState(false);
  const ytId = getYoutubeId(embedUrl);
  const thumbUrl = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null;

  let iframeSrc = embedUrl;
  if (ytId) {
    iframeSrc = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&playsinline=1&rel=0`;
  } else {
    const vimeoId = getVimeoId(embedUrl);
    if (vimeoId) iframeSrc = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&playsinline=1`;
  }

  if (!clicked) {
    return (
      <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden cursor-pointer group" onClick={() => setClicked(true)}>
        {thumbUrl
          ? <img src={thumbUrl} alt="Video thumbnail" className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-gradient-to-br from-rose-900 to-pink-900" />
        }
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
            <Play className="w-7 h-7 text-rose-600 ml-1" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black">
      <iframe src={iframeSrc} className="w-full h-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title="Content Player" />
    </div>
  );
}

export default function ContentPlayer() {
  const urlParams = new URLSearchParams(window.location.search);
  const contentKey = urlParams.get("key");
  const contentId = urlParams.get("id"); // fallback for old links

  const [user, setUser] = useState(null);
  const [item, setItem] = useState(null);
  const [userPlan, setUserPlan] = useState("free");
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [ents, bookmarks, saved, profiles] = await Promise.all([
        base44.entities.Entitlements.filter({ user_id: u.id }),
        contentKey ? base44.entities.ContentBookmarks.filter({ user_id: u.id }) : Promise.resolve([]),
        base44.entities.SavedItems.filter({ user_id: u.id, item_type: "CONTENT" }, "-created_at", 200),
        base44.entities.UserProfile.filter({ user_id: u.id }),
      ]);
      setUserProfile(profiles[0] || null);
      if (ents[0]) setUserPlan(ents[0].plan || "free");

      let ci = null;
      if (contentKey) {
        const items = await base44.entities.ContentItems.filter({ content_key: contentKey });
        ci = items[0] || null;
      } else if (contentId) {
        const items = await base44.entities.ContentItems.filter({ id: contentId });
        ci = items[0] || null;
      }

      setItem(ci);
      if (ci) {
        const bm = bookmarks.find((b) => b.content_id === ci.id);
        const savedItem = saved.find((entry) => entry.item_id === ci.id);
        if (bm) { setBookmarked(true); setBookmarkId(bm.id); }
        if (savedItem) setBookmarked(true);
      }
      setLoading(false);
    })();
  }, [contentKey, contentId]);

  const toggleBookmark = async () => {
    if (!user || !item) return;
    if (bookmarked) {
      if (bookmarkId) await base44.entities.ContentBookmarks.delete(bookmarkId);
      await removeSavedItem("CONTENT", item.id);
      setBookmarked(false);
      setBookmarkId(null);
    } else {
      const bm = await base44.entities.ContentBookmarks.create({ user_id: user.id, content_id: item.id });
      await saveItem({
        itemType: "CONTENT",
        itemId: item.id,
        title: item.title,
        previewText: item.summary || "",
        meta: { route: createPageUrl(`ContentPlayer?id=${item.id}`) },
      });
      setBookmarked(true);
      setBookmarkId(bm.id);
    }
  };

  if (loading) return (
    <div className="min-h-screen femwell-gradient flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
    </div>
  );

  if (!item) return (
    <div className="min-h-screen femwell-gradient flex items-center justify-center">
      <p className="text-gray-400">Content not found.</p>
    </div>
  );

  const locked = (TIER_ORDER[item.access_tier] || 0) > (TIER_ORDER[userPlan] || 0);
  const isBreathwork = item.content_type === "BREATHWORK" || item.content_type === "MEDITATION";
  const isGuided = item.play_mode === "GUIDED";
  const embedUrl = item.embed_url || null;

  const shouldShowPhaseTag = Array.isArray(item.cycle_phases)
    && item.cycle_phases.length > 0
    && !(item.cycle_phases.length === 1 && String(item.cycle_phases[0]).toLowerCase() === "all")
    && userProfile?.last_period_start_date;

  const currentPhase = (() => {
    if (!shouldShowPhaseTag) return null;
    const today = new Date();
    const lastPeriod = new Date(userProfile.last_period_start_date);
    const daysSince = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24));
    const cycleDay = (daysSince % userProfile.cycle_avg_length) + 1;
    const periodLength = userProfile.period_length || 5;
    return cycleDay <= periodLength ? 'menstrual'
      : cycleDay <= 13 ? 'follicular'
      : cycleDay <= 17 ? 'ovulatory'
      : 'luteal';
  })();

  return (
    <div className="min-h-screen femwell-gradient pb-10">
      <div className="max-w-md mx-auto px-4">
        <div className="pt-12 pb-4 flex items-center justify-between">
          <button onClick={() => window.history.back()} className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>
          <button onClick={toggleBookmark} className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center">
            {bookmarked
              ? <BookmarkCheck className="w-4 h-4 text-rose-500" />
              : <Bookmark className="w-4 h-4 text-gray-500" />
            }
          </button>
        </div>

        {currentPhase && (
          <div className="mb-3">
            <span
              className="inline-flex rounded-full"
              style={{
                fontSize: "12px",
                padding: "4px 12px",
                borderRadius: "20px",
                color: PHASE_ACCENTS[currentPhase],
                backgroundColor: `${PHASE_ACCENTS[currentPhase]}1F`,
                border: `1px solid ${PHASE_ACCENTS[currentPhase]}40`,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Recommended for your {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} phase
            </span>
          </div>
        )}

        {/* Manual complete card — shown for video/audio content */}
        {!locked && !isBreathwork && (
          <div className="mt-3 card-glass rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">Mark as complete</p>
              <p className="text-xs text-gray-400">Log this session manually</p>
            </div>
            {user && item && (
              <ManualCompleteButton item={item} user={user} source="CONTENT_PLAYER" />
            )}
          </div>
        )}

        {locked ? (
          <div className="aspect-video rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 flex flex-col items-center justify-center gap-3">
            <Lock className="w-10 h-10 text-rose-300" />
            <p className="font-semibold text-gray-600 text-sm">Requires {item.access_tier} plan</p>
            <a href={createPageUrl("Upgrade")} className="btn-primary text-sm px-5 py-2">Upgrade to unlock</a>
          </div>
        ) : isBreathwork ? (
          <BreathworkLoopPlayer item={item} user={user} />
        ) : isGuided ? (
          <GuidedPlayer item={item} />
        ) : item.audio_file_url ? (
          <AudioPlayer item={item} />
        ) : embedUrl ? (
          <VideoPlayer embedUrl={embedUrl} />
        ) : (
          <div className="aspect-video rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center text-5xl">
            {item.content_type === "MEDITATION" ? "🧘" : "✨"}
          </div>
        )}

        <div className="mt-5 space-y-3">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-xl font-bold text-gray-800 leading-tight">{item.title}</h1>
              {item.access_tier && item.access_tier !== "free" && (
                <span className="flex-shrink-0 bg-rose-100 text-rose-500 text-xs font-bold px-2 py-1 rounded-full uppercase">{item.access_tier}</span>
              )}
            </div>
            <div className="flex gap-3 mt-1 text-xs text-gray-400">
              {item.duration_minutes && <span>{item.duration_minutes} min</span>}
              {item.content_type && <span className="capitalize">{item.content_type.toLowerCase()}</span>}
              {item.level && <span>{item.level}</span>}
            </div>
          </div>

          {item.summary && <p className="text-sm text-gray-500 leading-relaxed">{item.summary}</p>}

          {item.safety_notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-amber-700 mb-1">Safety notes</p>
              <p className="text-xs text-amber-600">{item.safety_notes}</p>
            </div>
          )}

          {item.modifications && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-xs font-semibold text-blue-600 mb-1">Modifications</p>
              <p className="text-xs text-blue-500">{item.modifications}</p>
            </div>
          )}

          {item.tags && (
            <div className="flex flex-wrap gap-1.5">
              {(Array.isArray(item.tags) ? item.tags : item.tags.split(",")).map((tag) => (
                <span key={tag} className="text-xs bg-rose-50 text-rose-400 px-2 py-1 rounded-full capitalize">{String(tag).trim()}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}