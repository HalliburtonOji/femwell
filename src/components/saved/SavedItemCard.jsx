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
    <div className="rounded-[24px] p-4" style={{ border: "1px solid var(--border)", backgroundColor: "var(--surface)", boxShadow: "var(--shadow-sm)" }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }}>
            <BookmarkCheck className="h-3.5 w-3.5" /> {item.item_type.toLowerCase()}
          </div>
          <h3 className="mt-3 text-base font-semibold" style={{ color: "var(--plum)" }}>{item.title}</h3>
          {item.preview_text && <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--mauve)" }}>{item.preview_text}</p>}
          <p className="mt-3 text-xs" style={{ color: "var(--mauve)", opacity: 0.6 }}>Saved {new Date(item.created_at || item.created_date).toLocaleDateString()}</p>
        </div>
        <button
          onClick={() => onRemove(item)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-2xl transition-colors"
          style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noreferrer" : undefined}
          className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold"
          style={{ backgroundColor: "var(--plum)", color: "white" }}
        >
          {actionLabel}
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}