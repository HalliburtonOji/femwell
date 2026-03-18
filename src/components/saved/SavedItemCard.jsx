import { BookmarkCheck, ExternalLink, Trash2 } from "lucide-react";
import { createPageUrl } from "@/utils";
import { parseSavedMeta } from "@/lib/savedItems";

const FALLBACK_ROUTES = {
  ADVICE: createPageUrl("Assistant"),
  CONTENT: null,
  PROGRAM: null,
  JOURNAL: createPageUrl("Journal"),
  EVENT: null,
  LIFESTYLE: null,
};

export default function SavedItemCard({ item, onRemove }) {
  const meta = parseSavedMeta(item);
  const href = meta.route || meta.url || meta.content_url || FALLBACK_ROUTES[item.item_type] || "#";
  const actionLabel = item.item_type === "ADVICE" ? "Open Assistant" : item.item_type === "EVENT" ? "Open event" : "Open";

  return (
    <div className="rounded-[24px] border border-rose-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-600">
            <BookmarkCheck className="h-3.5 w-3.5" /> {item.item_type.toLowerCase()}
          </div>
          <h3 className="mt-3 text-base font-semibold text-gray-900">{item.title}</h3>
          {item.preview_text && <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.preview_text}</p>}
          <p className="mt-3 text-xs text-gray-400">Saved {new Date(item.created_at || item.created_date).toLocaleDateString()}</p>
        </div>
        <button
          onClick={() => onRemove(item)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 transition-colors hover:bg-rose-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noreferrer" : undefined}
          className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white"
        >
          {actionLabel}
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}