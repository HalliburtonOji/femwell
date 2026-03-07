import { Bookmark, BookmarkCheck, Clock, Lock, Headphones, Play } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const TIER_COLOR = {
  plus: "bg-rose-400 text-white",
  pro: "bg-purple-500 text-white",
};

const AUDIO_GRADIENT = {
  BREATHWORK: "from-indigo-200 via-purple-200 to-pink-200",
  MEDITATION: "from-teal-100 via-emerald-100 to-cyan-200",
};

const AUDIO_ICON_BG = {
  BREATHWORK: "bg-purple-100",
  MEDITATION: "bg-teal-100",
};

const AUDIO_ICON_COLOR = {
  BREATHWORK: "text-purple-500",
  MEDITATION: "text-teal-500",
};

const TYPE_LABEL = {
  BREATHWORK: "Breathwork",
  MEDITATION: "Meditation",
  FITNESS: "Fitness",
  MOBILITY: "Mobility",
  GUIDE: "Guide",
};

export default function ExploreContentCard({ item, locked, bookmarked, onToggleBookmark, isAudio }) {
  const gradient = AUDIO_GRADIENT[item.content_type] || "from-rose-100 to-pink-100";
  const iconBg = AUDIO_ICON_BG[item.content_type] || "bg-rose-100";
  const iconColor = AUDIO_ICON_COLOR[item.content_type] || "text-rose-400";
  const typeLabel = TYPE_LABEL[item.content_type] || item.content_type;
  const playerUrl = createPageUrl(`ContentPlayer?key=${item.content_key || item.id}`);

  return (
    <div className="relative group rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all border border-gray-100">
      <Link to={playerUrl} className="block">
        <div className={`relative overflow-hidden ${isAudio ? "aspect-square" : "aspect-video"}`}>
          {item.thumbnail_url ? (
            <img
              src={item.thumbnail_url}
              alt={item.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              {isAudio ? (
                <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center`}>
                  <Headphones className={`w-6 h-6 ${iconColor}`} />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center">
                  <Play className="w-6 h-6 text-rose-400" />
                </div>
              )}
            </div>
          )}

          {/* Thumbnail overlay for audio: show headphones icon */}
          {isAudio && item.thumbnail_url && (
            <div className="absolute bottom-2 right-2">
              <div className={`w-6 h-6 rounded-lg ${iconBg} flex items-center justify-center shadow-sm`}>
                <Headphones className={`w-3.5 h-3.5 ${iconColor}`} />
              </div>
            </div>
          )}

          {/* Duration */}
          {item.duration_minutes && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 rounded-full px-2 py-0.5">
              <Clock className="w-2.5 h-2.5 text-white" />
              <span className="text-white text-[10px] font-medium">{item.duration_minutes}m</span>
            </div>
          )}

          {/* Lock overlay */}
          {locked && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="bg-white/90 rounded-full p-2">
                <Lock className="w-4 h-4 text-rose-500" />
              </div>
            </div>
          )}

          {/* Tier badge */}
          {item.access_tier && item.access_tier !== "free" && (
            <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${TIER_COLOR[item.access_tier] || "bg-gray-700 text-white"}`}>
              {item.access_tier}
            </div>
          )}
        </div>
      </Link>

      {/* Card body */}
      <div className="p-3">
        <Link to={playerUrl}>
          <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2 mb-1.5">{item.title}</p>
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              isAudio ? `${iconBg} ${iconColor}` : "bg-rose-50 text-rose-400"
            }`}>
              {typeLabel}
            </span>
            {item.level && (
              <span className="text-[10px] text-gray-400 capitalize">{item.level}</span>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
            className="ml-1 flex-shrink-0 text-gray-300 hover:text-rose-400 transition-colors"
          >
            {bookmarked
              ? <BookmarkCheck className="w-3.5 h-3.5 text-rose-400" />
              : <Bookmark className="w-3.5 h-3.5" />
            }
          </button>
        </div>
      </div>
    </div>
  );
}