import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Play, Lock, BookmarkCheck, Bookmark, ExternalLink } from "lucide-react";
import { createPageUrl } from "@/utils";
import BreathworkPlayer from "../components/content/BreathworkPlayer";

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
  const vimeoId = getVimeoId(embedUrl);

  const thumbUrl = ytId
    ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
    : null;

  let iframeSrc = embedUrl;
  if (ytId) {
    iframeSrc = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&playsinline=1&cc_load_policy=1&cc_lang_pref=en&rel=0`;
  } else if (vimeoId) {
    iframeSrc = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&playsinline=1`;
  }

  if (!clicked) {
    return (
      <div
        className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden cursor-pointer group"
        onClick={() => setClicked(true)}
      >
        {thumbUrl ? (
          <img src={thumbUrl} alt="Video thumbnail" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rose-900 to-pink-900" />
        )}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
            <Play className="w-7 h-7 text-rose-600 ml-1" />
          </div>
        </div>
        <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          Tap to play
        </div>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black">
      <iframe
        src={iframeSrc}
        className="w-full h-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="Content Player"
      />
    </div>
  );
}

export default function ContentPlayer() {
  const urlParams = new URLSearchParams(window.location.search);
  const contentId = urlParams.get("id");

  const [user, setUser] = useState(null);
  const [item, setItem] = useState(null);
  const [mediaAsset, setMediaAsset] = useState(null);
  const [userPlan, setUserPlan] = useState("free");
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contentId) return;
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [items, ents, bookmarks] = await Promise.all([
        base44.entities.ContentItems.filter({ id: contentId }),
        base44.entities.Entitlements.filter({ user_id: u.id }),
        base44.entities.ContentBookmarks.filter({ user_id: u.id, content_id: contentId }),
      ]);
      const ci = items[0] || null;
      setItem(ci);
      if (ents[0]) setUserPlan(ents[0].plan || "free");
      if (bookmarks[0]) { setBookmarked(true); setBookmarkId(bookmarks[0].id); }

      const assetId = ci?.primary_media_asset_id || ci?.media_asset_id;
      if (assetId) {
        const assets = await base44.entities.MediaAssets.filter({ id: assetId });
        if (assets[0]) setMediaAsset(assets[0]);
      }
      setLoading(false);
    })();
  }, [contentId]);

  const toggleBookmark = async () => {
    if (!user || !item) return;
    if (bookmarked) {
      if (bookmarkId) await base44.entities.ContentBookmarks.delete(bookmarkId);
      setBookmarked(false); setBookmarkId(null);
    } else {
      const bm = await base44.entities.ContentBookmarks.create({ user_id: user.id, content_id: item.id });
      setBookmarked(true); setBookmarkId(bm.id);
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
  const isBreathwork = item.content_type?.toLowerCase() === "breathwork";
  const embedUrl = mediaAsset?.embed_url || null;

  return (
    <div className="min-h-screen femwell-gradient pb-10">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
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

        {/* Player area */}
        {locked ? (
          <div className="aspect-video rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 flex flex-col items-center justify-center gap-3">
            <Lock className="w-10 h-10 text-rose-300" />
            <p className="font-semibold text-gray-600 text-sm">Requires {item.access_tier} plan</p>
            <a href={createPageUrl("Upgrade")} className="btn-primary text-sm px-5 py-2">Upgrade to unlock</a>
          </div>
        ) : isBreathwork ? (
          <BreathworkPlayer item={item} />
        ) : embedUrl ? (
          <VideoPlayer embedUrl={embedUrl} />
        ) : (
          <div className="aspect-video rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center text-5xl">
            {item.content_type === "MEDITATION" ? "🧘" : "✨"}
          </div>
        )}

        {/* Meta */}
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
              {item.level && <span className="capitalize">{item.level}</span>}
            </div>
          </div>

          {item.description && (
            <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
          )}

          {item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span key={tag} className="text-xs bg-rose-50 text-rose-400 px-2 py-1 rounded-full capitalize">{tag}</span>
              ))}
            </div>
          )}

          {item.instructor && (
            <p className="text-xs text-gray-400">With {item.instructor}</p>
          )}
        </div>
      </div>
    </div>
  );
}