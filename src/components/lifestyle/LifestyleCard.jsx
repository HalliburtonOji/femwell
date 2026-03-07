import { useState } from "react";
import { Bookmark, ThumbsUp, ThumbsDown, ExternalLink, Volume2, X, ChevronRight } from "lucide-react";
import CategoryPill from "./CategoryPill";
import { createPageUrl } from "@/utils";
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

export default function LifestyleCard({ item, onHide, onSave, onLike, onDislike, saved, liked }) {
  const [expanded, setExpanded] = useState(false);
  const [localSaved, setLocalSaved] = useState(saved);
  const [localLiked, setLocalLiked] = useState(liked);
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  const handleAction = async (action) => {
    await base44.functions.invoke('recordLifestyleAction', {
      item_id: item.id,
      action,
      category: item.category,
      source_id: item.source_id,
    });
  };

  const handleLike = () => {
    setLocalLiked(true);
    handleAction('like');
    onLike?.(item.id);
  };

  const handleDislike = () => {
    handleAction('dislike');
    onDislike?.(item.id);
  };

  const handleSave = () => {
    setLocalSaved(!localSaved);
    handleAction('save');
    onSave?.(item.id);
  };

  const handleHide = () => {
    setHidden(true);
    handleAction('hide');
    onHide?.(item.id);
  };

  const handleOpen = () => {
    handleAction('open');
    window.open(item.content_url, '_blank');
  };

  const handleListen = () => {
    handleAction('listen');
    const text = `${item.title}. ${item.summary || ''}. Key takeaways: ${[item.takeaway_1, item.takeaway_2, item.takeaway_3].filter(Boolean).join('. ')}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    speechSynthesis.speak(utterance);
  };

  const isVideo = item.media_type === 'TIKTOK' || item.media_type === 'VIDEO' || item.media_type === 'INSTAGRAM' || item.media_type === 'CLIP';

  return (
    <div className="card-glass rounded-2xl overflow-hidden" style={{ animation: "fadeUp 0.3s ease-out" }}>
      {/* Media */}
      {item.image_url && (
        <div className="relative h-44 overflow-hidden bg-gray-100">
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <button
                onClick={handleOpen}
                className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
              >
                <span className="text-rose-500 text-xl ml-1">▶</span>
              </button>
            </div>
          )}
          {item.is_editor_pick && (
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-rose-500 text-white text-[10px] font-bold rounded-full tracking-wide">
              ✦ EDITOR'S PICK
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
            <div className="w-5 h-5 rounded-full bg-rose-200 flex items-center justify-center text-[8px] font-bold text-rose-600">
              {(item.source_name || 'S')[0]}
            </div>
          )}
          <span className="text-xs text-gray-400 font-medium">{item.source_name}</span>
          <span className="text-gray-200">·</span>
          <span className="text-xs text-gray-400">{timeAgo(item.pub_date)}</span>
          <div className="ml-auto flex items-center gap-2">
            <CategoryPill category={item.category} />
            <button onClick={handleHide} className="text-gray-300 hover:text-gray-500 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-800 text-sm leading-snug mb-2">{item.title}</h3>

        {/* Summary */}
        {item.summary && (
          <p className="text-sm text-gray-500 leading-relaxed mb-3">{item.summary}</p>
        )}

        {/* Takeaways */}
        {(item.takeaway_1 || item.takeaway_2) && (
          <div className="bg-rose-50/60 rounded-xl p-3 mb-3 space-y-1.5">
            {[item.takeaway_1, item.takeaway_2, item.takeaway_3].filter(Boolean).map((t, i) => (
              <p key={i} className="text-xs text-gray-700 flex gap-2">
                <span className="text-rose-400 font-bold flex-shrink-0">•</span>
                {t}
              </p>
            ))}
          </div>
        )}

        {/* Why it matters */}
        {item.why_it_matters && (
          <p className="text-[11px] text-teal-600 font-medium mb-3 flex gap-1.5 items-center">
            <span>💡</span> {item.why_it_matters}
          </p>
        )}

        {/* Try this */}
        {item.try_this_content_key && (
          <a
            href={createPageUrl(`ContentPlayer?key=${item.try_this_content_key}`)}
            onClick={() => handleAction('try_this')}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-semibold mb-3 hover:opacity-90 transition-opacity"
          >
            <span>✨ {item.try_this_label || "Try a session"}</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-1 pt-1 border-t border-rose-50">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${localLiked ? "bg-rose-100 text-rose-600" : "text-gray-400 hover:bg-rose-50 hover:text-rose-400"}`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDislike}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs text-gray-300 hover:text-gray-500 transition-colors"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${localSaved ? "bg-amber-100 text-amber-600" : "text-gray-400 hover:bg-amber-50 hover:text-amber-400"}`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${localSaved ? "fill-amber-500" : ""}`} />
          </button>
          <button
            onClick={handleListen}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs text-gray-400 hover:bg-teal-50 hover:text-teal-500 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleOpen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors ml-auto"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Read</span>
          </button>
        </div>
      </div>
    </div>
  );
}