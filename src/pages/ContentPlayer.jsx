import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Play, Lock, BookmarkCheck, Bookmark, Flower2, Sparkles } from "lucide-react";

const PHASE_ACCENTS = {
  menstrual: "var(--rose-dust)",
  follicular: "var(--mauve)",
  ovulatory: "var(--gold)",
  luteal: "var(--sage)",
};
import { createPageUrl } from "@/utils";
import { saveItem, removeSavedItem } from "@/lib/savedItems";
import GuidedPlayer from "../components/content/GuidedPlayer";
import AudioPlayer from "../components/content/AudioPlayer";
import BreathworkLoopPlayer from "../components/content/BreathworkLoopPlayer";
import WorkoutPlayer from "../components/content/WorkoutPlayer";
import GuideReadingPlayer from "../components/content/GuideReadingPlayer";
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
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden cursor-pointer group"
        style={{ backgroundColor: "#111" }} onClick={() => setClicked(true)}>
        {thumbUrl
          ? <img src={thumbUrl} alt="Video thumbnail" className="w-full h-full object-cover" />
          : <div className="w-full h-full" style={{ backgroundColor: "#0B0805" }} />
        }
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.25)" }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.92)", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
            <Play className="w-7 h-7 ml-1" style={{ color: "var(--rose-dust)" }} />
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
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [itemId, setItemId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const [ents, bookmarks, saved, profiles] = await Promise.all([
          base44.entities.Entitlements.filter({ user_id: u.id }).catch(() => []),
          contentKey ? base44.entities.ContentBookmarks.filter({ user_id: u.id }).catch(() => []) : Promise.resolve([]),
          base44.entities.SavedItems.filter({ user_id: u.id, item_type: "CONTENT" }, "-created_at", 50).catch(() => []),
          base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []),
        ]);
        setUserProfile(profiles[0] || null);
        if (ents[0]) setUserPlan(ents[0].plan || "free");

        let ci = null;
        if (contentKey) {
          const items = await base44.entities.ContentItems.filter({ content_key: contentKey }).catch(() => []);
          ci = items[0] || null;
        } else if (contentId) {
          const items = await base44.entities.ContentItems.filter({ id: contentId }).catch(() => []);
          ci = items[0] || null;
        }

        setItem(ci);
        if (ci) setItemId(ci.id);
        if (ci) {
          const bm = bookmarks.find((b) => b.content_id === ci.id);
          const savedItem = saved.find((entry) => entry.item_id === ci.id);
          if (bm) { setBookmarked(true); setBookmarkId(bm.id); }
          if (savedItem) setBookmarked(true);
        }
      } catch (err) {
        console.error("ContentPlayer init failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [contentKey, contentId]);

  const MEDITATION_SCRIPTS = {
    "anxiety-reset": "Close your eyes and take a deep breath in... and out. You are safe. Whatever is weighing on you right now doesn't need to be solved in this moment. Breathe in for four counts... hold... and release. Let your shoulders drop. Let your jaw soften. You are here, and that is enough. Take another breath...",
    "grounding-calm": "Begin by feeling your feet on the floor. Press down gently and notice the ground beneath you. This earth supports you completely. Take a breath in... and let it go. Look around and name five things you can see. Four things you can touch. Three things you can hear. Two things you can smell. One thing you can taste. You are here. You are present. You are grounded.",
    "self-compassion": "Place one hand on your heart. Feel it beating — steady, constant, working for you every single moment. Breathe in kindness toward yourself. Whatever you're going through right now, you are not alone. Millions of people feel this too. May you be kind to yourself. May you give yourself the grace you would give a dear friend.",
    "pms-kindness": "Your body is working so hard right now. The changes you feel are your hormones doing what they're meant to do. Breathe in and acknowledge how much your body does for you. Breathe out any frustration or impatience with yourself. You are allowed to feel tender this week. You are allowed to rest. Be gentle with yourself.",
    "sleep-wind-down": "It's time to let the day go. You've done enough. You've been enough. As you breathe out, release any thoughts about tomorrow. They can wait. Right now, there is only this moment, this breath, this softening. Let your body feel heavy and warm. You are safe to rest now.",
  };

  const getOrGenerateMeditationAudio = useCallback(async (contentItem) => {
    if (contentItem.audio_file_url) return;
    setGeneratingAudio(true);
    const script = MEDITATION_SCRIPTS[contentItem.content_key] ||
      `Take a comfortable seat and close your eyes. Welcome to ${contentItem.title}. Take a deep breath in... and slowly release. Allow yourself to arrive fully in this moment. ${contentItem.summary || "Breathe gently, noticing the rise and fall of your chest."} Take your time here. There is nowhere else to be.`;
    const response = await base44.functions.invoke("generateAudio", {
      text: script,
      voice: "nova",
      speed: 0.9,
      cacheKey: `meditation_${contentItem.content_key}`,
    });
    const audioUrl = response.data?.audio_url;
    if (audioUrl) {
      await base44.entities.ContentItems.update(contentItem.id, { audio_file_url: audioUrl });
      setItem(prev => ({ ...prev, audio_file_url: audioUrl }));
    }
    setGeneratingAudio(false);
  }, []);

  // Auto-generate audio for meditation on first load (must be before early returns)
  useEffect(() => {
    if (item && item.content_type === "MEDITATION" && !item.audio_file_url && !generatingAudio) {
      getOrGenerateMeditationAudio(item);
    }
  }, [itemId, item?.audio_file_url]);

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
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
    </div>
  );

  if (!item) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
      <p style={{ color: "var(--mauve)" }}>Content not found.</p>
    </div>
  );

  const locked = (TIER_ORDER[item.access_tier || 'free'] || 0) > (TIER_ORDER[userPlan] || 0);
  const isBreathwork = item.content_type === "BREATHWORK";
  const isMeditation = item.content_type === "MEDITATION";
  const isWorkout = item.content_type === "WORKOUT" || item.content_type === "MOBILITY";
  const isGuideType = item.content_type === "GUIDE";
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
    <div className="min-h-screen pb-10" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="max-w-md mx-auto px-4">
        <div className="pt-12 pb-4 flex items-center justify-between">
          <button onClick={() => window.history.back()} className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
            <ArrowLeft className="w-4 h-4" style={{ color: "var(--plum)" }} />
          </button>
          <button onClick={toggleBookmark} className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
            {bookmarked
              ? <BookmarkCheck className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />
              : <Bookmark className="w-4 h-4" style={{ color: "var(--mauve)" }} />
            }
          </button>
        </div>

        <div style={{ textAlign: "center", padding: "8px 0" }}>
          <h1 className="fw-display" style={{ fontSize: 32, margin: 0 }}>Session</h1>
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
                }}
            >
              Recommended for your {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} phase
            </span>
          </div>
        )}

        {/* Manual complete card — shown for video/audio content */}
        {!locked && !isBreathwork && (
          <div className="mt-3 rounded-2xl p-4 flex items-center justify-between"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--plum)" }}>Mark as complete</p>
              <p className="text-xs" style={{ color: "var(--mauve)" }}>Log this session manually</p>
            </div>
            {user && item && (
              <ManualCompleteButton item={item} user={user} source="CONTENT_PLAYER" />
            )}
          </div>
        )}

        {locked ? (
          <div className="aspect-video rounded-2xl flex flex-col items-center justify-center gap-3"
            style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)" }}>
            <Lock className="w-10 h-10" style={{ color: "var(--rose-dust-light)" }} />
            <p className="font-semibold text-sm" style={{ color: "var(--mauve)" }}>Requires {item.access_tier} plan</p>
            <a href={createPageUrl("Upgrade")} className="btn-primary text-sm px-5 py-2">Upgrade to unlock</a>
          </div>
        ) : isBreathwork ? (
          <BreathworkLoopPlayer item={item} user={user} />
        ) : isMeditation && !item.audio_file_url ? (
          <div className="aspect-video rounded-2xl flex flex-col items-center justify-center gap-3"
            style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)" }}>
            {generatingAudio ? (
              <>
                <div className="w-8 h-8 rounded-full animate-spin" style={{ border: "3px solid var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
                <p className="text-sm font-medium" style={{ color: "var(--mauve)" }}>Preparing your guided audio…</p>
                <p className="text-xs" style={{ color: "var(--mauve)", opacity: 0.7 }}>This only happens once</p>
              </>
            ) : (
              <Flower2 className="w-12 h-12" style={{ color: "var(--rose-dust-light)" }} />
            )}
          </div>
        ) : isWorkout ? (
          <WorkoutPlayer item={item} user={user} />
        ) : isGuideType ? (
          <GuideReadingPlayer item={item} user={user} />
        ) : isGuided ? (
          <GuidedPlayer item={item} />
        ) : item.audio_file_url ? (
          <AudioPlayer item={item} />
        ) : embedUrl ? (
          <VideoPlayer embedUrl={embedUrl} />
        ) : (
          <div className="aspect-video rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: "var(--rose-dust-subtle)" }}>
            {item.content_type === "MEDITATION"
              ? <Flower2 className="w-12 h-12" style={{ color: "var(--rose-dust-light)" }} />
              : <Sparkles className="w-12 h-12" style={{ color: "var(--rose-dust-light)" }} />}
          </div>
        )}

        <div className="mt-5 space-y-3">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h2 className="fw-heading leading-tight">{item.title}</h2>
              {item.access_tier && item.access_tier !== "free" && (
                <span className="flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full uppercase"
                  style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }}>{item.access_tier}</span>
              )}
            </div>
            <div className="flex gap-3 mt-1 text-xs" style={{ color: "var(--mauve)" }}>
              {item.duration_minutes && <span>{item.duration_minutes} min</span>}
              {item.content_type && <span className="capitalize">{item.content_type.toLowerCase()}</span>}
              {item.level && <span>{item.level}</span>}
            </div>
          </div>

          {item.summary && <p className="text-sm leading-relaxed" style={{ color: "var(--mauve)" }}>{item.summary}</p>}

          {item.safety_notes && (
            <div className="rounded-xl p-3" style={{ backgroundColor: "#FBF6E6", border: "1px solid #E6D49A" }}>
              <p className="text-xs font-semibold mb-1" style={{ color: "#8A6D1F" }}>Safety notes</p>
              <p className="text-xs" style={{ color: "#8A6D1F" }}>{item.safety_notes}</p>
            </div>
          )}

          {item.modifications && (
            <div className="rounded-xl p-3" style={{ backgroundColor: "#EDF2ED", border: "1px solid #C7D8C7" }}>
              <p className="text-xs font-semibold mb-1" style={{ color: "#4A634A" }}>Modifications</p>
              <p className="text-xs" style={{ color: "#4A634A" }}>{item.modifications}</p>
            </div>
          )}

          {item.tags && (
            <div className="flex flex-wrap gap-1.5">
              {(Array.isArray(item.tags) ? item.tags : []).map((tag) => (
                <span key={tag} className="text-xs px-2 py-1 rounded-full capitalize"
                  style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }}>{String(tag).trim()}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}