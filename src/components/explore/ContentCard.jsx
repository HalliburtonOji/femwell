import { Bookmark, BookmarkCheck, Clock, Lock, Flower2, Wind, Dumbbell, Activity, BookOpen, Sparkles } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const TYPE_ICON = {
  meditation: Flower2,
  breathwork: Wind,
  fitness: Dumbbell,
  mobility: Activity,
  guides: BookOpen,
  guide: BookOpen,
};

// Brand tier badges (cream/plum palette — no generic Tailwind purple/rose)
const TIER_BADGE = {
  plus: { backgroundColor: "var(--rose-dust)", color: "#fff" },
  pro: { backgroundColor: "var(--mauve)", color: "#fff" },
};

export default function ContentCard({ item, locked, bookmarked, onToggleBookmark }) {
  const TypeIcon = TYPE_ICON[item.content_type?.toLowerCase()] || Sparkles;

  return (
    <div className="relative group rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
      {/* Thumbnail */}
      <Link to={createPageUrl(`ContentPlayer?key=${item.content_key || item.id}`)} className="block">
        <div className="relative aspect-video overflow-hidden" style={{ background: "linear-gradient(135deg, var(--rose-dust-subtle), var(--blush-surface))" }}>
          {item.thumbnail_url ? (
            <img
              src={item.thumbnail_url}
              alt={item.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <TypeIcon className="w-9 h-9" style={{ color: "var(--rose-dust)" }} />
            </div>
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
                <Lock className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />
              </div>
            </div>
          )}

          {/* Tier badge */}
          {item.access_tier && item.access_tier !== "free" && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
              style={TIER_BADGE[item.access_tier] || { backgroundColor: "var(--ivory-dark)", color: "var(--mauve)" }}>
              {item.access_tier}
            </div>
          )}
        </div>
      </Link>

      {/* Card body */}
      <div className="p-2.5">
        <Link to={createPageUrl(`ContentPlayer?key=${item.content_key || item.id}`)}>
          <p className="text-xs font-semibold leading-tight line-clamp-2 mb-1" style={{ color: "var(--plum)" }}>{item.title}</p>
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {item.level && (
              <span className="text-[10px] capitalize" style={{ color: "var(--mauve)" }}>{item.level}</span>
            )}
            {item.tags && (() => {
              const first = Array.isArray(item.tags)
                ? String(item.tags[0] ?? "").trim()
                : (typeof item.tags === "string" ? (item.tags.split(",")[0] || "").trim() : "");
              return first ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full capitalize" style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }}>{first}</span>
              ) : null;
            })()}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
            className="ml-1 flex-shrink-0 transition-colors"
            style={{ color: bookmarked ? "var(--rose-dust)" : "var(--mauve)" }}
          >
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