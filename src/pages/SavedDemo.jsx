// SavedDemo — a redesign DEMO of the Saved page. PREVIEW route only (/SavedDemo). LIVE /Saved UNTOUCHED.
// Conforms to BRAND_IDENTITY.md.
//
// DISTINCT FORM (a COLLECTIONS LIBRARY — not a slider/dashboard/timeline/masonry/scene/chat): a grid of
// COLLECTION cards (one per saved-item type, each with a "spine stack" of its items + count + a recent
// teaser), and below it the SELECTED collection's items as a list with Open + Remove. Reads like a
// personal library. Brand held constant; every Open is a SPECIFIC deep-link.

import { useState, useEffect, useMemo } from "react";
import {
  T, SERIF, UI, PAPER_BG, Heart, Eyebrow, Script, Hand, InkFilter, useEditorialFonts,
} from "@/components/journal/Editorial";
import { base44 } from "@/api/base44Client";
import { floraKeyframes, FlowerGlyph } from "@/components/brand/flora";
import { Loader, PageVines, DEMO_CSS, CLAMP, clip, withTimeout } from "@/components/demos/demoKit";
import { Bookmark, ChevronRight, X, BookOpen, Headphones, Activity, PenLine, CalendarHeart, Sparkles } from "lucide-react";

const COL = 480;

const TYPES = {
  ADVICE: { label: "Advice", route: "/Lifestyle?tab=read", Icon: BookOpen, accent: "#A8893F", flower: "camellia" },
  LIFESTYLE: { label: "Lifestyle", route: "/Lifestyle", Icon: Sparkles, accent: "#E8B4B8", flower: "rose" },
  CONTENT: { label: "Sessions", route: "/Lifestyle?tab=listen", Icon: Headphones, accent: "#8E6E8E", flower: "bluebell" },
  PROGRAM: { label: "Programs", route: "/ProgramsHub", Icon: Activity, accent: "#8FAF8F", flower: "sunflower" },
  JOURNAL: { label: "Journal", route: "/Journal", Icon: PenLine, accent: "#8E6E8E", flower: "iris" },
  EVENT: { label: "Events", route: "/Events", Icon: CalendarHeart, accent: "#8FAF8F", flower: "cornflower" },
};
const ORDER = ["ADVICE", "LIFESTYLE", "CONTENT", "PROGRAM", "JOURNAL", "EVENT"];
const titleOf = (it) => it.title || it.label || it.name || it.heading || (it.body ? clip(it.body, 48) : "Saved item");

export default function SavedDemo() {
  useEditorialFonts();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [removed, setRemoved] = useState({});

  useEffect(() => {
    let alive = true;
    (async () => {
      const me = await withTimeout(base44.auth.me()); const id = me?.id || null;
      if (id) { const s = await withTimeout(base44.entities.SavedItems.filter({ user_id: id }, "-created_at", 150)); if (alive) setItems((s || []).filter(Boolean)); }
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const live = useMemo(() => items.filter((it) => !removed[it.id]), [items, removed]);
  const groups = useMemo(() => {
    const g = {}; ORDER.forEach((k) => { g[k] = []; });
    live.forEach((it) => { const k = TYPES[it.item_type] ? it.item_type : "LIFESTYLE"; g[k].push(it); });
    return g;
  }, [live]);
  const total = live.length;
  const activeKey = selected || ORDER.filter((k) => groups[k].length).sort((a, b) => groups[b].length - groups[a].length)[0] || "ADVICE";
  const activeItems = groups[activeKey] || [];

  const remove = (it) => { setRemoved((m) => ({ ...m, [it.id]: true })); try { base44.entities.SavedItems.delete(it.id).catch(() => {}); } catch { /* ignore */ } };
  if (loading) return <Loader />;

  return (
    <div className="fwc-anim" style={{ ...PAPER_BG, minHeight: "100vh", color: T.ink, paddingBottom: 130, position: "relative", overflowX: "clip" }}>
      <InkFilter />
      <style>{DEMO_CSS}{floraKeyframes}</style>
      <PageVines a={T.gold} b={T.sage} />

      <div style={{ maxWidth: COL, margin: "0 auto", position: "relative", zIndex: 1, padding: "0 18px" }}>
        <header style={{ display: "flex", alignItems: "center", gap: 11, padding: "26px 0 8px" }}>
          <span style={{ width: 48, height: 48, borderRadius: 13, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}><Bookmark size={23} color={T.gold} strokeWidth={1.7} /></span>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Heart size={15} /><Eyebrow color={T.muted}>Your library</Eyebrow></div>
            <Script size={42} color={T.ink}>Saved</Script>
          </div>
          <span style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, color: T.ink, lineHeight: 1 }}>{total}</div>
            <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.muted }}>kept</div>
          </span>
        </header>
        <Hand size={16} color={T.muted} style={{ display: "block", margin: "2px 2px 14px", lineHeight: 1.5 }}>
          Everything you wanted to come back to, gathered into collections — articles, sessions, programmes, your own lines.
        </Hand>

        {/* COLLECTIONS GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
          {ORDER.map((k) => {
            const t = TYPES[k]; const n = groups[k].length; const on = k === activeKey;
            const recent = groups[k][0];
            return (
              <button key={k} onClick={() => setSelected(k)} style={{ position: "relative", overflow: "hidden", textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 8, minHeight: 120, background: on ? `linear-gradient(165deg, ${T.paperHi}, ${t.accent}1F)` : `linear-gradient(165deg, ${T.paperHi}, ${t.accent}10)`, border: `1px solid ${on ? t.accent : T.paperDeep}`, borderTop: `3px solid ${t.accent}`, borderRadius: 16, padding: "13px 14px", boxShadow: on ? "0 4px 18px rgba(58,44,26,0.14)" : "0 2px 10px rgba(58,44,26,0.07)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ width: 32, height: 32, borderRadius: 9, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center" }}><t.Icon size={16} color={t.accent} /></span>
                  <FlowerGlyph variant={t.flower} size={26} color={t.accent} idx={`sv-${k}`} />
                </div>
                {/* spine stack */}
                <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 16 }}>
                  {Array.from({ length: Math.min(8, Math.max(1, n)) }).map((_, i) => <span key={i} style={{ width: 5, height: 8 + ((i * 5) % 9), borderRadius: 2, background: n ? t.accent : T.paperDeep, opacity: n ? 0.5 + (i % 3) * 0.18 : 0.3 }} />)}
                </div>
                <div style={{ marginTop: "auto" }}>
                  <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: T.ink, lineHeight: 1.15 }}>{t.label}</div>
                  <div style={{ fontFamily: UI, fontSize: 13, color: t.accent, fontWeight: 700, marginTop: 1 }}>{n} saved</div>
                  {recent && <div style={{ fontFamily: SERIF, fontSize: 14, color: T.muted, marginTop: 3, ...CLAMP(1) }}>{titleOf(recent)}</div>}
                </div>
              </button>
            );
          })}
        </div>

        {/* SELECTED COLLECTION LIST */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "24px 0 12px" }}>
          <FlowerGlyph variant={TYPES[activeKey].flower} size={28} color={TYPES[activeKey].accent} idx="sv-head" />
          <div style={{ minWidth: 0 }}>
            <Eyebrow color={TYPES[activeKey].accent}>Collection</Eyebrow>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 21, fontWeight: 600, color: T.ink, lineHeight: 1.15, display: "block" }}>{TYPES[activeKey].label}</span>
          </div>
          <span style={{ flex: 1, height: 1, background: T.paperDeep, opacity: 0.7, marginLeft: 6 }} />
        </div>

        {activeItems.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activeItems.map((it) => {
              const t = TYPES[activeKey]; const href = it.url || it.link || t.route;
              return (
                <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 12, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${t.accent}`, borderRadius: 14, padding: "12px 14px" }}>
                  <a href={href} style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", flex: 1, minWidth: 0 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 9, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}><t.Icon size={16} color={t.accent} /></span>
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ display: "block", fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: T.ink, ...CLAMP(2) }}>{titleOf(it)}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, marginTop: 2 }}>Open <ChevronRight size={13} /></span>
                    </span>
                  </a>
                  <button onClick={() => remove(it)} aria-label="Remove from saved" style={{ width: 30, height: 30, borderRadius: 99, flexShrink: 0, background: "transparent", border: `1px solid ${T.paperDeep}`, color: T.muted, display: "grid", placeItems: "center", cursor: "pointer" }}><X size={15} /></button>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ background: T.paperHi, border: `1px dashed ${T.paperDeep}`, borderRadius: 16, padding: "22px 16px", textAlign: "center" }}>
            <FlowerGlyph variant={TYPES[activeKey].flower} size={40} color={TYPES[activeKey].accent} idx="sv-empty" />
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: T.muted, margin: "6px 0 12px", lineHeight: 1.4 }}>Nothing in {TYPES[activeKey].label.toLowerCase()} yet — the bookmark icon saves things here.</p>
            <a href="/Explore" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 13, fontWeight: 700, color: TYPES[activeKey].accent, textDecoration: "none", border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "8px 15px" }}>Explore something to save <ChevronRight size={14} /></a>
          </div>
        )}
      </div>
    </div>
  );
}
