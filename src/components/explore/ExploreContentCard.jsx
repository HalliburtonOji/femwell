import { Bookmark, BookmarkCheck, Clock, Lock, Headphones, Play } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const AUDIO_BG = {
  BREATHWORK: { from: "#E8DFF7", to: "#D6C9F0", icon: "#8A6FC4" },
  MEDITATION: { from: "#D4EDE8", to: "#C2E0DA", icon: "#4A8A7E" },
};

const TYPE_LABEL = {
  BREATHWORK: "Breathwork",
  MEDITATION: "Meditation",
  FITNESS:    "Fitness",
  MOBILITY:   "Mobility",
  GUIDE:      "Guide",
};

const TIER_STYLE = {
  plus: { backgroundColor: "var(--rose-dust)", color: "white" },
  pro:  { backgroundColor: "var(--mauve)",     color: "white" },
};

export default function ExploreContentCard({ item, locked, bookmarked, onToggleBookmark, isAudio }) {
  const typeLabel  = TYPE_LABEL[item.content_type] || item.content_type;
  const playerUrl  = createPageUrl(`ContentPlayer?key=${item.content_key || item.id}`);
  const audioBg    = AUDIO_BG[item.content_type];

  const placeholderStyle = audioBg
    ? { background: `linear-gradient(135deg, ${audioBg.from} 0%, ${audioBg.to} 100%)` }
    : { background: "linear-gradient(135deg, var(--ivory-dark) 0%, var(--rose-dust-subtle) 100%)" };

  const typeTagStyle = audioBg
    ? { backgroundColor: "rgba(244,239,227,0.85)", color: audioBg.icon }
    : { backgroundColor: "rgba(244,239,227,0.85)", color: "var(--rose-dust)" };

  return (
    <div className="relative group rounded-[20px] overflow-hidden transition-all hover:-translate-y-0.5"
      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
      <Link to={playerUrl} className="block">
        <div className={`relative overflow-hidden ${isAudio ? "aspect-square" : "aspect-video"}`}>
          {item.thumbnail_url ? (
            <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={placeholderStyle}>
              {isAudio ? (
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(244,239,227,0.7)" }}>
                  <Headphones className="w-5 h-5" style={{ color: audioBg?.icon || "var(--mauve)" }} />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(244,239,227,0.7)" }}>
                  <Play className="w-5 h-5" style={{ color: "var(--rose-dust)" }} />
                </div>
              )}
              {/* Type label centered for audio no-thumb */}
              <p className="absolute bottom-4 left-0 right-0 text-center text-xs font-semibold"
                style={{ color: audioBg?.icon || "var(--mauve)", }}>
                {typeLabel}
              </p>
            </div>
          )}

          {/* Duration */}
          {item.duration_minutes > 0 && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full px-2 py-0.5"
              style={{ backgroundColor: "rgba(0,0,0,0.52)" }}>
              <Clock className="w-2.5 h-2.5 text-white" />
              <span className="text-white text-[10px] font-medium">{item.duration_minutes}m</span>
            </div>
          )}

          {/* Audio badge on thumbnail */}
          {isAudio && item.thumbnail_url && (
            <div className="absolute bottom-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(244,239,227,0.88)" }}>
              <Headphones className="w-3.5 h-3.5" style={{ color: audioBg?.icon || "var(--mauve)" }} />
            </div>
          )}

          {/* Lock */}
          {locked && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: "rgba(42,32,53,0.45)" }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(244,239,227,0.9)" }}>
                <Lock className="w-4 h-4" style={{ color: "var(--plum)" }} />
              </div>
            </div>
          )}

          {/* Tier badge */}
          {item.access_tier && item.access_tier !== "free" && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
              style={TIER_STYLE[item.access_tier] || { backgroundColor: "var(--plum)", color: "white" }}>
              {item.access_tier}
            </div>
          )}
        </div>
      </Link>

      <div className="p-3">
        <Link to={playerUrl}>
          <p className="text-xs font-semibold leading-tight line-clamp-2 mb-1.5"
            style={{ color: "var(--plum)", }}>
            {item.title}
          </p>
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={isAudio && audioBg
                ? { backgroundColor: audioBg.from, color: audioBg.icon }
                : { backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", }}>
              {typeLabel}
            </span>
            {item.level && (
              <span className="text-[10px] capitalize" style={{ color: "var(--mauve)", }}>{item.level}</span>
            )}
          </div>
          <button onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
            className="ml-1 flex-shrink-0 transition-colors"
            style={{ color: bookmarked ? "var(--rose-dust)" : "var(--border)" }}>
            {bookmarked
              ? <BookmarkCheck className="w-3.5 h-3.5" style={{ color: "var(--rose-dust)" }} />
              : <Bookmark className="w-3.5 h-3.5" />
            }
          </button>
        </div>
      </div>
    </div>
  );
}