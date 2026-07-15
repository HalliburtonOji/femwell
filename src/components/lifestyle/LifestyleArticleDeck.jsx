// LifestyleArticleDeck — PIECE 2 of the Lifestyle level-up: a showcase deck of BIG article
// cards, one per view with edge-peek and a horizontal slide (like ClipboardSlider). Each card
// uses the real FwCard chrome (gradient paper wash + accent rim + corner sprigs) with a
// FloraCover (piece 1) as its cover art, then eyebrow (type · read-time) + Fraunces title + a
// warm hook line + an inline Save + a "Read this" CTA. Curated ~5, never cramped, never empty.
//
// Data: wires to real PUBLISHED LifestyleItems where present; falls back to a seeded, curated,
// life-spanning set so it always looks considered. Covers are deterministic per item id.
//
// Reusable + presentational-first: pass `items` + handlers to drive it from the live shell
// (piece 3), or let it self-load. Additive; no backend writes here. Live Lifestyle untouched.
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { BookOpen, Feather, Compass, Heart, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { FwCard, FwCardCTA } from "@/components/brand/Card";
import FloraCover from "@/components/brand/FloraCover";
import { T, SERIF, UI } from "@/components/journal/Editorial";
import { withTimeout } from "@/utils/safeEntity";

const OXBLOOD = "#7A1A12";
const TYPE_ACCENT = { article: "#8E6E8E", story: "#BC2E27", guide: "#A8893F", book: "#5F7E8E", read: "#8E6E8E" };
const TYPE_ICON = { article: BookOpen, story: Feather, guide: Compass, book: BookOpen, read: BookOpen };

function stripHtml(s) { return s ? String(s).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : ""; }

// ── seeded, curated, life-spanning fallback (so the deck is never empty / never off-brand) ──
const FALLBACK = [
  { id: "seed-rest", type: "article", category: "rest & calm", title: "The quiet art of a slow Sunday", eyebrow: "Essay · 6 min", hook: "Permission to do gloriously little — and why the week goes better for it." },
  { id: "seed-friend", type: "article", category: "friendship", title: "Text the friend you keep meaning to", eyebrow: "Note · 2 min", hook: "A two-line message today beats the perfect catch-up you keep postponing." },
  { id: "seed-sky", type: "guide", category: "astrology & moon", title: "Reading tonight's waning moon", eyebrow: "Sky · 4 min", hook: "What the waning moon is quietly asking you to put down this week." },
  { id: "seed-career", type: "guide", category: "career & money", title: "How to ask for the raise, kindly", eyebrow: "Guide · 5 min", hook: "The gentle script for the conversation you've been rehearsing in the shower." },
  { id: "seed-story", type: "story", category: "fiction", title: "She left the party early, and", eyebrow: "Story · 8 min", hook: "A short fiction about the quiet freedom of being the first to say goodnight." },
  { id: "seed-move", type: "article", category: "movement & nature", title: "Ten minutes outside, no phone", eyebrow: "Body · 2 min", hook: "The smallest reset there is — and the one your nervous system keeps asking for." },
];

// normalise a real LifestyleItems row → the deck's item shape (exported so the live
// Lifestyle shell can feed the deck from the content it already loads)
export function toDeckItem(row) {
  const ct = String(row.content_type || "").toUpperCase();
  const type = ct === "FICTION" ? "story" : ct === "STORY" ? "story" : ct === "GUIDE" ? "guide" : "article";
  const mins = row.duration_label || (row.read_minutes ? `${row.read_minutes} min` : "");
  const typeLabel = type === "story" ? "Story" : type === "guide" ? "Guide" : "Essay";
  return {
    id: row.id, type, category: row.category || "",
    title: row.title,
    eyebrow: [typeLabel, mins].filter(Boolean).join(" · "),
    hook: stripHtml(row.why_it_matters || row.summary || row.lede || row.source_name || "") || "A good thing to read when you have a moment.",
    raw: row,
  };
}

export default function LifestyleArticleDeck({
  items: itemsProp,
  label = "Reads for you",
  onOpen: onOpenProp,
  onSave: onSaveProp,
  isSaved: isSavedProp,
  maxItems = 5,
}) {
  const [loaded, setLoaded] = useState(null);   // real items (or null until loaded)
  const [localSaved, setLocalSaved] = useState({}); // demo/optimistic save state when no parent handler
  const scroller = useRef(null);
  const [active, setActive] = useState(0);

  // self-load real LifestyleItems when no items passed — graceful fallback keeps it warm
  useEffect(() => {
    if (itemsProp) return; let alive = true;
    (async () => {
      try {
        const rows = await withTimeout(base44.entities.LifestyleItems.filter({ status: "PUBLISHED" }, "-engagement_score", 30), 6000, "deck");
        if (!alive) return;
        const arr = (Array.isArray(rows) ? rows : [])
          .filter((r) => r && r.title && /ARTICLE|STORY|GUIDE|FICTION/.test(String(r.content_type || "").toUpperCase()))
          .slice(0, maxItems)
          .map(toDeckItem);
        setLoaded(arr.length ? arr : FALLBACK.slice(0, maxItems));
      } catch { if (alive) setLoaded(FALLBACK.slice(0, maxItems)); }
    })();
    return () => { alive = false; };
  }, [itemsProp, maxItems]);

  // itemsProp with content → use it; itemsProp empty (shell has no reads yet) → seeded
  // fallback (never empty); no itemsProp → the self-loaded set (or its fallback).
  const items = useMemo(() => {
    const base = (itemsProp && itemsProp.length) ? itemsProp : (itemsProp ? FALLBACK : (loaded || FALLBACK));
    return base.slice(0, maxItems);
  }, [itemsProp, loaded, maxItems]);

  const isSaved = useCallback((it) => (isSavedProp ? isSavedProp(it) : !!localSaved[it.id]), [isSavedProp, localSaved]);
  const onSave = useCallback((it) => {
    if (onSaveProp) return onSaveProp(it);
    setLocalSaved((s) => ({ ...s, [it.id]: !s[it.id] }));
  }, [onSaveProp]);
  const onOpen = useCallback((it) => {
    if (onOpenProp) return onOpenProp(it);
    if (it.raw?.id) window.location.assign(`/LifestyleDetail?id=${it.raw.id}`);
  }, [onOpenProp]);

  const step = () => {
    const el = scroller.current; if (!el) return 0;
    const card = el.querySelector("[data-deck-card]");
    return card ? card.offsetWidth + 14 : el.clientWidth * 0.86;
  };
  const go = (dir) => { const el = scroller.current; if (el) el.scrollBy({ left: dir * step(), behavior: "smooth" }); };
  const onScroll = () => { const el = scroller.current; if (!el) return; setActive(Math.round(el.scrollLeft / step())); };

  if (!items.length) return null;
  const atStart = active <= 0, atEnd = active >= items.length - 1;

  return (
    <div style={{ width: "100%" }}>
      <style>{`.fw-adeck{scrollbar-width:none}.fw-adeck::-webkit-scrollbar{display:none}`}</style>

      {/* header: label + slide hint */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "0 2px 8px" }}>
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600, fontSize: 19, color: OXBLOOD }}>{label}</span>
        <span style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 700, color: T.muted, letterSpacing: "0.04em" }}>Slide for more &rarr;</span>
      </div>

      <div style={{ position: "relative" }}>
        {/* arrows */}
        {items.length > 1 && (
          <>
            <button onClick={() => go(-1)} aria-label="Previous" disabled={atStart}
              style={arrowStyle("left", atStart)}><ChevronLeft size={18} /></button>
            <button onClick={() => go(1)} aria-label="Next" disabled={atEnd}
              style={arrowStyle("right", atEnd)}><ChevronRight size={18} /></button>
          </>
        )}

        {/* the deck — one big card per view, edge-peek, scroll-snap */}
        <div ref={scroller} onScroll={onScroll} className="fw-adeck"
          style={{ display: "flex", gap: 14, overflowX: "auto", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain", padding: "2px 2px 6px" }}>
          {items.map((it) => {
            const accent = TYPE_ACCENT[it.type] || TYPE_ACCENT.read;
            const Icon = TYPE_ICON[it.type] || BookOpen;
            const saved = isSaved(it);
            return (
              <div key={it.id} data-deck-card style={{ flex: "0 0 86%", maxWidth: 360, scrollSnapAlign: "center" }}>
                <FwCard
                  snap={false} accent={accent} Icon={Icon} eyebrow={it.eyebrow} flower={null}
                  title={it.title} line={it.hook} idx={`adeck-${it.id}`}
                  media={<div style={{ marginBottom: 14 }}><FloraCover category={it.category} seed={it.id} showTitle={false} height={150} radius={12} /></div>}
                  corner={
                    <button onClick={(e) => { e.stopPropagation(); onSave(it); }} aria-label={saved ? "Remove from saved" : "Save"}
                      style={{ background: "rgba(244,239,227,0.9)", border: `1px solid ${T.paperDeep}`, borderRadius: 999, width: 34, height: 34, display: "grid", placeItems: "center", cursor: "pointer", boxShadow: "0 1px 4px rgba(46,38,27,0.16)" }}>
                      <Heart size={16} color={saved ? "#BC2E27" : T.muted} fill={saved ? "#BC2E27" : "none"} />
                    </button>
                  }
                  action={<FwCardCTA accent={accent} onClick={() => onOpen(it)}>Read this</FwCardCTA>}
                  onOpen={() => onOpen(it)} openLabel="Open full-screen"
                />
              </div>
            );
          })}
          <div style={{ flex: "0 0 2px" }} aria-hidden />
        </div>
      </div>

      {/* dots */}
      {items.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 6 }}>
          {items.map((_, i) => <span key={i} style={{ width: i === active ? 16 : 6, height: 6, borderRadius: 999, background: i === active ? OXBLOOD : T.paperDeep, transition: "width .2s" }} />)}
        </div>
      )}
    </div>
  );
}

function arrowStyle(side, disabled) {
  return {
    position: "absolute", top: "42%", [side]: -6, transform: "translateY(-50%)", zIndex: 5,
    width: 34, height: 34, borderRadius: 999, border: `1px solid ${T.paperDeep}`,
    background: disabled ? "transparent" : "#F4EFE3", color: disabled ? T.paperDeep : T.muted,
    display: "grid", placeItems: "center", cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.4 : 1, boxShadow: disabled ? "none" : "0 2px 8px rgba(46,38,27,0.16)",
  };
}
