import { useState } from "react";
import { Bookmark, BookmarkCheck, Heart, MoreHorizontal, ExternalLink, Volume2, X, ChevronRight } from "lucide-react";
import CategoryPill from "./CategoryPill";
import { createPageUrl } from "@/utils";
import { toggleSavedItem } from "@/lib/savedItems";
import { base44 } from "@/api/base44Client";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}

export default function LifestyleCard({ item, onHide, onSave, onLike, onDislike, onMuteSource, saved, liked }) {
  const [localSaved, setLocalSaved] = useState(saved);
  const [localLiked, setLocalLiked] = useState(liked);
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  const handleAction = async (action) => {
    await base44.functions.invoke('recordLifestyleAction', {
      item_id: item.id, action, category: item.category, source_id: item.source_id,
    });
  };

  const handleLike = () => {
    const nextLiked = !localLiked;
    setLocalLiked(nextLiked);
    handleAction(nextLiked ? 'like' : 'dislike');
    onLike?.(item.id, nextLiked);
  };

  const handleSave = async () => {
    const result = await toggleSavedItem({
      itemType: 'LIFESTYLE', itemId: item.id, title: item.title,
      previewText: item.summary || '',
      meta: { url: item.content_url, content_url: item.content_url, provider: item.provider, category: item.category },
    });
    setLocalSaved(result.saved);
    handleAction('save');
    onSave?.(item.id, result.saved);
  };

  const handleHide = () => {
    setHidden(true);
    handleAction('hide');
    onHide?.(item.id);
  };

  const handleOpen = () => {
    handleAction('open');
    window.location.href = createPageUrl(`LifestyleDetail?id=${item.id}`);
  };

  const handleListen = () => {
    handleAction('listen');
    const spokenTakeaways = (Array.isArray(item.takeaways) && item.takeaways.length > 0 ? item.takeaways : [item.takeaway_1, item.takeaway_2, item.takeaway_3].filter(Boolean)).join('. ');
    const text = `${item.title}. ${item.summary || ''}. Key takeaways: ${spokenTakeaways}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    speechSynthesis.speak(utterance);
  };

  const takeaways = Array.isArray(item.takeaways) && item.takeaways.length > 0
    ? item.takeaways
    : [item.takeaway_1, item.takeaway_2, item.takeaway_3].filter(Boolean);
  const isVideo = item.media_type === 'TIKTOK' || item.media_type === 'VIDEO' || item.media_type === 'INSTAGRAM' || item.media_type === 'CLIP';

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", animation: "fadeUp 0.3s ease-out" }}>
      {/* Media */}
      {item.image_url && (
        <div className="relative h-44 overflow-hidden" style={{ backgroundColor: "var(--ivory-dark)" }}>
          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
              <button onClick={handleOpen} className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: "rgba(255,255,255,0.9)" }}>
                <span style={{ color: "var(--rose-dust)", fontSize: 20, marginLeft: 3 }}>&#9654;</span>
              </button>
            </div>
          )}
          {item.is_editor_pick && (
            <div className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold rounded-full tracking-wide" style={{ backgroundColor: "var(--rose-dust)", color: "white" }}>
              EDITOR'S PICK
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          {item.source_logo_url ? (
            <img src={item.source_logo_url} alt={item.source_name} className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold" style={{ backgroundColor: "var(--rose-dust-light)", color: "var(--rose-dust)" }}>
              {(item.source_name || 'S')[0]}
            </div>
          )}
          <span className="text-xs font-medium" style={{ color: "var(--mauve)" }}>{item.source_name}</span>
          <span style={{ color: "var(--border)" }}>·</span>
          <span className="text-xs" style={{ color: "var(--mauve)" }}>{timeAgo(item.pub_date)}</span>
          <div className="ml-auto flex items-center gap-2">
            <CategoryPill category={item.category} />
            <div className="flex items-center gap-2">
              <button onClick={() => onMuteSource?.(item.source_id, item.source_name)} style={{ color: "var(--border)", background: "none", border: "none", cursor: "pointer" }}>
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleHide} style={{ color: "var(--border)", background: "none", border: "none", cursor: "pointer" }}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-sm leading-snug mb-2" style={{ color: "var(--plum)" }}>{item.title}</h3>

        {/* Summary */}
        {item.summary && (
          <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--mauve)" }}>{item.summary}</p>
        )}

        {/* Takeaways */}
        {takeaways.length > 0 && (
          <div className="rounded-xl p-3 mb-3 space-y-1.5" style={{ backgroundColor: "var(--rose-dust-subtle)" }}>
            {takeaways.map((t, i) => (
              <p key={i} className="text-xs flex gap-2" style={{ color: "var(--plum)" }}>
                <span className="font-bold flex-shrink-0" style={{ color: "var(--rose-dust)" }}>•</span>
                {t}
              </p>
            ))}
          </div>
        )}

        {/* Why it matters */}
        {item.why_it_matters && (
          <p className="text-[11px] font-medium mb-3 flex gap-1.5 items-center" style={{ color: "var(--sage)" }}>
            {item.why_it_matters}
          </p>
        )}

        {/* Try this */}
        {item.try_this_content_key && (
          <a href={createPageUrl(`ContentPlayer?key=${item.try_this_content_key}`)} onClick={() => handleAction('try_this')}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold mb-3"
            style={{ backgroundColor: "var(--plum)", color: "white" }}>
            <span>{item.try_this_label || "Try a session"}</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-1 pt-1" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <button onClick={handleLike}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{ backgroundColor: localLiked ? "var(--rose-dust-subtle)" : "transparent", color: localLiked ? "var(--rose-dust)" : "var(--mauve)", border: "none", cursor: "pointer" }}>
            <Heart className="w-3.5 h-3.5" style={{ fill: localLiked ? "var(--rose-dust)" : "none" }} />
          </button>
          <button onClick={handleSave}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{ backgroundColor: localSaved ? "#FFF8EE" : "transparent", color: localSaved ? "#A07830" : "var(--mauve)", border: "none", cursor: "pointer" }}>
            {localSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>
          <button onClick={handleListen}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs transition-colors"
            style={{ color: "var(--mauve)", background: "none", border: "none", cursor: "pointer" }}>
            <Volume2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleOpen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs ml-auto"
            style={{ color: "var(--mauve)", background: "none", border: "none", cursor: "pointer" }}>
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{isVideo ? "Watch" : "Read"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}