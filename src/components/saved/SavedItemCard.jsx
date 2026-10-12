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

export function calmSavedDestination(href) {
  if (!href || href === "#") return href;
  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return href;
    if (url.pathname === "/LifestyleDetail") url.searchParams.set("appearance", "calm");
    if (["/LivingLifestyleDemo", "/SkyWorldsDemo", "/CalmLifestyleDemo"].includes(url.pathname) && url.searchParams.get("section") === "sky") {
      url.pathname = "/CalmLifestyleDemo";
      url.searchParams.set("direction", "petal-press");
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return href; }
}

function shortPreview(value) {
  const text = String(value || "").trim();
  if (text.length <= 112) return text;
  return `${text.slice(0, 105).replace(/\s+\S*$/, "").trim()}…`;
}

export default function SavedItemCard({ item, onRemove, disabled = false, calm = false }) {
  const meta = parseSavedMeta(item);
  const href = meta.route || meta.url || meta.content_url || FALLBACK_ROUTES[item.item_type] || "#";
  const openHref = calm ? calmSavedDestination(href) : href;
  const preview = calm ? shortPreview(item.preview_text) : item.preview_text;
  const actionLabel = item.item_type === "ADVICE" ? "Open Assistant" : item.item_type === "EVENT" ? "Open event" : "Open";
  const savedDate = item.created_at || item.created_date;
  const validSavedDate = savedDate && Number.isFinite(new Date(savedDate).getTime());

  return (
    <div className="rounded-[24px] p-4" style={{ border: calm ? "1px solid #e6e3dc" : "1px solid var(--border)", backgroundColor: calm ? "#fff" : "var(--surface)", boxShadow: calm ? "0 8px 28px rgba(58,46,57,.05)" : "var(--shadow-sm)" }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ backgroundColor: calm ? "#e9edf0" : "var(--rose-dust-subtle)", color: calm ? "#4e6973" : "var(--rose-dust)" }}>
            <BookmarkCheck className="h-3.5 w-3.5" /> {item.item_type.toLowerCase()}
          </div>
          <h3 className="mt-3 text-base font-semibold" style={calm ? {fontFamily:'"FemWell Editorial","Cormorant Garamond",Georgia,serif',fontSize:23,lineHeight:1.18,color:"#51444e"} : { color: "var(--plum)" }}>{item.title}</h3>
          {item.preview_text && <><p className="mt-2 text-sm leading-relaxed" style={calm ? {fontFamily:'system-ui',fontSize:14,lineHeight:1.48,color:"#51444e"} : { color: "var(--mauve)" }}>{preview}</p>{calm && preview !== item.preview_text.trim() && <details style={{marginTop:8,color:"#51444e",fontSize:14,fontFamily:"system-ui"}}><summary style={{cursor:"pointer",minHeight:44,alignContent:"center",fontWeight:700}}>Read the full note</summary><p style={{lineHeight:1.55}}>{item.preview_text}</p></details>}</>}
          {validSavedDate && <p className="mt-3 text-xs" style={{ color: "var(--mauve)", opacity: 0.6 }}>Saved {new Date(savedDate).toLocaleDateString("en-GB")}</p>}
        </div>
        <button
          onClick={() => onRemove(item)}
          aria-label={`Remove ${item.title || "this save"}`}
          disabled={disabled}
          className="inline-flex h-9 w-9 items-center justify-center rounded-2xl transition-colors"
          style={{ backgroundColor: calm ? "#f4f3f0" : "var(--rose-dust-subtle)", color: calm ? "#51444e" : "var(--rose-dust)",minHeight:calm?44:undefined,minWidth:calm?44:undefined,borderRadius:calm?999:undefined }}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        <a
          href={openHref}
          target={openHref.startsWith("http") ? "_blank" : undefined}
          rel={openHref.startsWith("http") ? "noreferrer" : undefined}
          aria-label={calm ? `${actionLabel} ${item.title}` : undefined}
          className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold"
          style={{ backgroundColor: calm ? "#51444e" : "var(--plum)", color: "white",borderRadius:calm?999:undefined,minHeight:calm?44:undefined }}
        >
          {actionLabel}
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
