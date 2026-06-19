// EventsDemo — a redesign DEMO of the Events page. PREVIEW route only (/EventsDemo). LIVE /Events
// UNTOUCHED. Conforms to BRAND_IDENTITY.md.
//
// DISTINCT FORM (a DATE-GROUPED AGENDA / POSTER FEED — not a slider/dashboard/intraday-timeline/masonry/
// library/wallet/scene/chat): a featured upcoming event, filter chips (online / in person / free), then
// events grouped under DATE headers as poster cards. "Get tickets" is a user-initiated link to the
// curated source. Graceful curated fallback links into /Events (no fabricated external URLs).

import { useState, useEffect, useMemo } from "react";
import {
  T, SERIF, UI, PAPER_BG, Heart, Eyebrow, Script, Hand, InkFilter, useEditorialFonts,
} from "@/components/journal/Editorial";
import { base44 } from "@/api/base44Client";
import { floraKeyframes, FlowerGlyph } from "@/components/brand/flora";
import { Loader, PageVines, DEMO_CSS, CLAMP, clip, withTimeout } from "@/components/demos/demoKit";
import { CalendarHeart, MapPin, Globe, Ticket, ChevronRight, Users } from "lucide-react";

const COL = 480;
const PALETTE = ["#8FAF8F", "#A8893F", "#E8B4B8", "#8E6E8E", "#BC2E27"];
const FLW = ["cornflower", "sunflower", "rose", "iris", "poppy"];
const dayMs = 86400000;

function plusDays(n) { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
const FALLBACK = [
  { id: "e1", title: "Cycle-syncing yoga — morning flow", date: plusDays(1), is_online: true, is_free: true, source_name: "FemWell Live", tags: ["movement"] },
  { id: "e2", title: "Perimenopause Q&A with a GP", date: plusDays(3), is_online: true, is_free: false, price: "£8", source_name: "FemWell Live", tags: ["health"] },
  { id: "e3", title: "Women's supper club", date: plusDays(5), is_online: false, location: "The Garden Rooms", city: "Bristol", is_free: false, price: "£22", source_name: "Community", tags: ["friendship"] },
  { id: "e4", title: "Creative journaling circle", date: plusDays(8), is_online: true, is_free: true, source_name: "Community", tags: ["creativity"] },
];

const longDate = (s) => { try { return new Date(s + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long" }); } catch { return s; } };

export default function EventsDemo() {
  useEditorialFonts();
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await withTimeout(base44.entities.EventsItems.list("-date", 80));
      const list = (r || []).filter((x) => x && x.title);
      if (alive) { setItems(list.length ? list : FALLBACK); setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  const real = items || FALLBACK;
  const upcoming = useMemo(() => {
    const cut = Date.now() - dayMs;
    const withDates = real.map((e) => ({ ...e, _t: e.date ? new Date(String(e.date).slice(0, 10) + "T00:00:00").getTime() : 0 }));
    const future = withDates.filter((e) => e._t >= cut);
    const base = (future.length ? future : withDates).sort((a, b) => a._t - b._t);
    return base.filter((e) => filter === "all" || (filter === "online" && e.is_online) || (filter === "person" && !e.is_online) || (filter === "free" && e.is_free));
  }, [real, filter]);

  const featured = upcoming[0];
  const rest = upcoming.slice(1);
  const grouped = useMemo(() => {
    const g = {}; rest.forEach((e) => { const k = e.date ? String(e.date).slice(0, 10) : "soon"; (g[k] = g[k] || []).push(e); });
    return Object.entries(g).sort((a, b) => (a[0] < b[0] ? -1 : 1));
  }, [rest]);

  if (loading) return <Loader />;

  return (
    <div className="fwc-anim" style={{ ...PAPER_BG, minHeight: "100vh", color: T.ink, paddingBottom: 130, position: "relative", overflowX: "clip" }}>
      <InkFilter />
      <style>{DEMO_CSS}{floraKeyframes}</style>
      <PageVines a={T.sage} b={T.gold} />

      <div style={{ maxWidth: COL, margin: "0 auto", position: "relative", zIndex: 1, padding: "0 18px" }}>
        <header style={{ display: "flex", alignItems: "center", gap: 11, padding: "26px 0 8px" }}>
          <span style={{ width: 48, height: 48, borderRadius: 13, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}><CalendarHeart size={23} color={T.sage} strokeWidth={1.7} /></span>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Heart size={15} /><Eyebrow color={T.muted}>What's on</Eyebrow></div>
            <Script size={42} color={T.ink}>Events</Script>
          </div>
        </header>
        <Hand size={16} color={T.muted} style={{ display: "block", margin: "2px 2px 14px", lineHeight: 1.5 }}>
          Circles, classes and suppers — turn up, log on, or just have a nosy. The social side of feeling well.
        </Hand>

        {/* FILTER CHIPS */}
        <div className="demo-noscroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, WebkitOverflowScrolling: "touch" }}>
          {[["all", "All"], ["online", "Online"], ["person", "In person"], ["free", "Free"]].map(([k, l]) => { const on = filter === k; return (
            <button key={k} onClick={() => setFilter(k)} style={{ flex: "none", background: on ? T.sage : "transparent", color: on ? "#fff" : T.muted, border: `1px solid ${on ? T.sage : T.paperDeep}`, borderRadius: 999, padding: "7px 15px", fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{l}</button>
          ); })}
        </div>

        {featured ? <FeaturedEvent e={featured} accent={PALETTE[0]} flower={FLW[0]} /> : <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: T.muted, textAlign: "center", padding: "20px 0" }}>Nothing matches that filter right now.</p>}

        {/* DATE-GROUPED AGENDA */}
        {grouped.map(([date, evs], gi) => (
          <section key={date} style={{ marginTop: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.sage, background: `${T.sage}1A`, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "5px 12px" }}>{date === "soon" ? "Soon" : longDate(date)}</span>
              <span style={{ flex: 1, height: 1, background: T.paperDeep, opacity: 0.6 }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {evs.map((e, i) => <EventCard key={e.id || e.item_id || i} e={e} accent={PALETTE[(gi + i + 1) % PALETTE.length]} flower={FLW[(gi + i + 1) % FLW.length]} idx={`ev-${gi}-${i}`} />)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function meta(e) {
  if (e.is_online) return { Icon: Globe, label: e.source_name ? `Online · ${e.source_name}` : "Online" };
  const place = [e.location, e.city].filter(Boolean).join(", ");
  return { Icon: MapPin, label: place || e.source_name || "In person" };
}
function priceBadge(e) { return e.is_free ? "Free" : (e.price ? String(e.price) : null); }
function linkProps(e) { const url = e.link || e.external_url; return url ? { href: url, target: "_blank", rel: "noopener noreferrer", external: true } : { href: "/Events", external: false }; }

function FeaturedEvent({ e, accent, flower }) {
  const m = meta(e); const pb = priceBadge(e); const lp = linkProps(e);
  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 20, border: `1px solid ${T.paperDeep}`, background: `linear-gradient(150deg, ${T.paperHi} 0%, ${accent}22 100%)`, boxShadow: "0 8px 28px rgba(58,44,26,0.16)", padding: "18px 18px 16px" }}>
      <div style={{ position: "absolute", top: -8, right: -6, opacity: 0.9 }}><FlowerGlyph variant={flower} size={84} color={accent} idx="ev-feat" /></div>
      <div style={{ position: "relative", zIndex: 1, maxWidth: "78%" }}>
        <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: accent }}>Next up{e.date ? ` · ${longDate(String(e.date).slice(0, 10))}` : ""}</span>
        <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, color: T.ink, lineHeight: 1.2, margin: "6px 0 8px", ...CLAMP(3) }}>{clip(e.title, 70)}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 13, color: T.muted }}><m.Icon size={14} color={accent} /> {clip(m.label, 40)}</span>
          {pb && <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: "#fff", background: pb === "Free" ? T.sage : accent, borderRadius: 999, padding: "3px 11px" }}>{pb}</span>}
        </div>
      </div>
      <a {...(lp.external ? { href: lp.href, target: "_blank", rel: "noopener noreferrer" } : { href: lp.href })} style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", gap: 8, background: accent, color: "#fff", border: "none", borderRadius: 12, padding: "12px 18px", fontFamily: UI, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
        <Ticket size={15} /> {lp.external ? "Get tickets" : "See details"}
      </a>
    </div>
  );
}

function EventCard({ e, accent, flower, idx }) {
  const m = meta(e); const pb = priceBadge(e); const lp = linkProps(e);
  return (
    <a {...(lp.external ? { href: lp.href, target: "_blank", rel: "noopener noreferrer" } : { href: lp.href })} style={{ display: "flex", alignItems: "center", gap: 12, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${accent}`, borderRadius: 14, padding: "13px 14px", textDecoration: "none" }}>
      <span style={{ width: 38, height: 38, borderRadius: 11, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}>{e.is_online ? <Users size={18} color={accent} /> : <FlowerGlyph variant={flower} size={24} color={accent} idx={idx} />}</span>
      <span style={{ minWidth: 0, flex: 1 }}>
        <span style={{ display: "block", fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: T.ink, lineHeight: 1.25, ...CLAMP(2) }}>{clip(e.title, 64)}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 13, color: T.muted, marginTop: 2 }}><m.Icon size={13} color={accent} /> {clip(m.label, 36)}</span>
      </span>
      {pb && <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: pb === "Free" ? T.sage : accent, flexShrink: 0 }}>{pb}</span>}
      <ChevronRight size={16} color={T.muted} style={{ flexShrink: 0 }} />
    </a>
  );
}
