// DealsDemo — a redesign DEMO of the Deals page (member perks). PREVIEW route only (/DealsDemo). LIVE
// /Deals UNTOUCHED. Conforms to BRAND_IDENTITY.md.
//
// DISTINCT FORM (a VOUCHER WALLET — not a slider/dashboard/timeline/masonry/library/scene/chat): deals
// rendered as ticket/voucher cards (perforated edge, brand, discount badge), a featured voucher banner,
// and category filter chips. Real Deals; "View deal" is a user-initiated link to the curated partner.
// Graceful curated fallback links back into /Deals (never a fabricated external URL).

import { useState, useEffect, useMemo } from "react";
import {
  T, SERIF, UI, PAPER_BG, Heart, Eyebrow, Script, Hand, InkFilter, useEditorialFonts,
} from "@/components/journal/Editorial";
import { base44 } from "@/api/base44Client";
import { floraKeyframes, FlowerGlyph } from "@/components/brand/flora";
import { Loader, PageVines, DEMO_CSS, CLAMP, clip, withTimeout } from "@/components/demos/demoKit";
import { Ticket, BadgeCheck, ChevronRight, Sparkles } from "lucide-react";

const COL = 480;

const FALLBACK = [
  { id: "f1", brand: "Bloom Botanicals", title: "Magnesium & evening primrose", description: "The wind-down supplement the community keeps coming back to.", discount_text: "20% off", category: "Supplements", external_url: null },
  { id: "f2", brand: "Willow & Wool", title: "Weighted comfort throw", description: "For luteal evenings and duvet days — gentle, grounding weight.", discount_text: "15% off", category: "Home", external_url: null },
  { id: "f3", brand: "Ember Studio", title: "First month of classes", description: "Cycle-aware movement, online and on your schedule.", discount_text: "Free trial", category: "Movement", external_url: null },
  { id: "f4", brand: "Saffron Kitchen", title: "Iron-rich recipe box", description: "Five quick dinners that quietly do your body a favour.", discount_text: "£10 off", category: "Food", external_url: null },
];

const PALETTE = ["#A8893F", "#E08A6A", "#8FAF8F", "#E8B4B8", "#8E6E8E"];
const FLW = ["sunflower", "rose", "primrose", "lavender", "iris"];

export default function DealsDemo() {
  useEditorialFonts();
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");

  useEffect(() => {
    let alive = true;
    (async () => {
      const d = await withTimeout(base44.entities.Deals.filter({ is_active: true }, "-created_date", 60));
      const list = (d || []).filter((x) => x && (x.title || x.brand));
      if (alive) { setItems(list.length ? list : FALLBACK); setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  const real = items || FALLBACK;
  const cats = useMemo(() => ["All", ...[...new Set(real.map((d) => d.category).filter(Boolean))].slice(0, 6)], [real]);
  const shown = useMemo(() => category === "All" ? real : real.filter((d) => d.category === category), [real, category]);
  const featured = real.find((d) => d.is_verified) || real[0];
  const rest = shown.filter((d) => d.id !== featured?.id);

  if (loading) return <Loader />;

  return (
    <div className="fwc-anim" style={{ ...PAPER_BG, minHeight: "100vh", color: T.ink, paddingBottom: 130, position: "relative", overflowX: "clip" }}>
      <InkFilter />
      <style>{DEMO_CSS}{floraKeyframes}</style>
      <PageVines a={T.gold} b="#E08A6A" />

      <div style={{ maxWidth: COL, margin: "0 auto", position: "relative", zIndex: 1, padding: "0 18px" }}>
        <header style={{ display: "flex", alignItems: "center", gap: 11, padding: "26px 0 8px" }}>
          <span style={{ width: 48, height: 48, borderRadius: 13, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}><Ticket size={23} color={T.gold} strokeWidth={1.7} /></span>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Heart size={15} /><Eyebrow color={T.muted}>Member perks</Eyebrow></div>
            <Script size={42} color={T.ink}>Deals</Script>
          </div>
        </header>
        <Hand size={16} color={T.muted} style={{ display: "block", margin: "2px 2px 14px", lineHeight: 1.5 }}>
          A small wallet of treats — wellbeing picks the community loves, with a little something off. A kindness to yourself.
        </Hand>

        {/* FEATURED voucher */}
        {featured && <Voucher deal={featured} accent={PALETTE[0]} flower={FLW[0]} featured idx="feat" />}

        {/* CATEGORY CHIPS */}
        {cats.length > 1 && (
          <div className="demo-noscroll" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "16px 0 6px", WebkitOverflowScrolling: "touch" }}>
            {cats.map((c) => { const on = category === c; return (
              <button key={c} onClick={() => setCategory(c)} style={{ flex: "none", background: on ? T.gold : "transparent", color: on ? "#fff" : T.muted, border: `1px solid ${on ? T.gold : T.paperDeep}`, borderRadius: 999, padding: "7px 15px", fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{c}</button>
            ); })}
          </div>
        )}

        {/* WALLET */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: cats.length > 1 ? 6 : 16 }}>
          {rest.map((d, i) => <Voucher key={d.id || i} deal={d} accent={PALETTE[(i + 1) % PALETTE.length]} flower={FLW[(i + 1) % FLW.length]} idx={`v${i}`} />)}
          {rest.length === 0 && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: T.muted, textAlign: "center", padding: "10px 0" }}>No perks in {category.toLowerCase()} right now — try another.</p>}
        </div>
      </div>
    </div>
  );
}

function Voucher({ deal, accent, flower, featured, idx }) {
  const href = deal.external_url || "/Deals";
  const isExternal = !!deal.external_url;
  const linkProps = isExternal ? { href, target: "_blank", rel: "noopener noreferrer" } : { href };
  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 18, border: `1px solid ${T.paperDeep}`, background: `linear-gradient(135deg, ${T.paperHi} 0%, ${accent}1A 100%)`, boxShadow: featured ? "0 8px 28px rgba(58,44,26,0.16)" : "0 3px 14px rgba(58,44,26,0.10)" }}>
      {/* perforation notches */}
      <span aria-hidden style={{ position: "absolute", left: -9, top: "50%", width: 18, height: 18, borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`, transform: "translateY(-50%)" }} />
      <span aria-hidden style={{ position: "absolute", right: -9, top: "50%", width: 18, height: 18, borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`, transform: "translateY(-50%)" }} />
      <div style={{ padding: featured ? "18px 18px 14px" : "15px 16px 13px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
            {deal.image_url ? <img src={deal.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} /> : <FlowerGlyph variant={flower} size={22} color={accent} idx={`dl-${idx}`} />}
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: accent, ...CLAMP(1) }}>{deal.brand || "Partner"}</span>
              {deal.is_verified && <BadgeCheck size={14} color={T.sage} />}
            </div>
            {featured && <span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>Featured perk</span>}
          </div>
          {deal.discount_text && <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: "#fff", background: T.crimson, borderRadius: 999, padding: "4px 11px", flexShrink: 0 }}>{clip(deal.discount_text, 16)}</span>}
        </div>
        <h3 style={{ fontFamily: SERIF, fontSize: featured ? 22 : 19, fontWeight: 600, color: T.ink, lineHeight: 1.22, margin: "0 0 5px", ...CLAMP(2) }}>{clip(deal.title || deal.brand, 64)}</h3>
        {deal.description && <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.45, margin: "0 0 12px", ...CLAMP(featured ? 3 : 2) }}>{clip(deal.description, 140)}</p>}
        {/* tear line */}
        <div aria-hidden style={{ borderTop: `1.5px dashed ${T.paperDeep}`, margin: "0 -16px 12px" }} />
        <a {...linkProps} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", boxSizing: "border-box", background: accent, color: "#fff", border: "none", borderRadius: 12, padding: "12px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
          <Sparkles size={15} /> {isExternal ? "View this deal" : "See it in Deals"} <ChevronRight size={14} />
        </a>
      </div>
    </div>
  );
}
