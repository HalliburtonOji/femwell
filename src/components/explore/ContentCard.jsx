import { Bookmark, BookmarkCheck, Clock, Lock } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const TYPE_EMOJI = {
  meditation: "🧘",
  breathwork: "🌬️",
  fitness: "💪",
  mobility: "🤸",
  guides: "📖",
  guide: "📖",
};

const TIER_COLOR = {
  plus: "bg-rose-400 text-white",
  pro: "bg-purple-500 text-white",
};

export default function ContentCard({ item, locked, bookmarked, onToggleBookmark }) {
  const emoji = TYPE_EMOJI[item.content_type?.toLowerCase()] || "✨";

  return (
    <div className="relative group rounded-2xl overflow-hidden bg-white/80 border border-rose-50 shadow-sm hover:shadow-md transition-all">
      {/* Thumbnail */}
      <Link to={createPageUrl(`ContentPlayer?key=${item.content_key || item.id}`)} className="block">
        <div className="relative aspect-video bg-gradient-to-br from-rose-100 to-pink-100 overflow-hidden">
          {item.thumbnail_url ? (
            <img
              src={item.thumbnail_url}
              alt={item.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">{emoji}</div>
          )}

          {/* Duration pill */}
          {item.duration_minutes && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 rounded-full px-2 py-0.5">
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
            <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${TIER_COLOR[item.access_tier] || "bg-gray-100 text-gray-600"}`}>
              {item.access_tier}
            </div>
          )}
        </div>
      </Link>

      {/* Card body */}
      <div className="p-2.5">
        <Link to={createPageUrl(`ContentPlayer?key=${item.content_key || item.id}`)}>
          <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2 mb-1">{item.title}</p>
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {item.level && (
              <span className="text-[10px] text-gray-400 capitalize">{item.level}</span>
            )}
            {item.tags?.slice(0, 1).map((tag) => (
              <span key={tag} className="text-[10px] bg-rose-50 text-rose-400 px-1.5 py-0.5 rounded-full capitalize">{tag}</span>
            ))}
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