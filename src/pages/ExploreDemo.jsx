// ExploreDemo — a redesign DEMO of the Explore page (discovery). PREVIEW route only (/ExploreDemo).
// LIVE /Explore UNTOUCHED. Conforms to BRAND_IDENTITY.md.
//
// DISTINCT FORM (a SEARCH-FIRST DISCOVERY MASONRY — not a slider/dashboard/timeline/scene/chat): a big
// search bar, life-domain filter chips, then a Pinterest-style MASONRY of varied-height discovery cards
// that span the WHOLE of life (read · listen · move · cook · connect · joy · treats) — every card a
// SPECIFIC deep-link to the real surface. Whole-life rule baked in. Brand held constant.

import { useState, useEffect, useMemo } from "react";
import {
  T, SERIF, UI, PAPER_BG, Heart, Eyebrow, Script, Hand, InkFilter, useEditorialFonts,
} from "@/components/journal/Editorial";
import { base44 } from "@/api/base44Client";
import { floraKeyframes, FlowerGlyph } from "@/components/brand/flora";
import { Loader, PageVines, DEMO_CSS, CLAMP, withTimeout } from "@/components/demos/demoKit";
import {
  Search, BookOpen, Headphones, Activity, Salad, Users, Sparkles, Star, Ticket, CalendarHeart, PenLine, ChevronRight,
} from "lucide-react";

const COL = 480;

const DOMAINS = [
  { key: "all", label: "All" }, { key: "read", label: "Read" }, { key: "listen", label: "Listen" },
  { key: "move", label: "Move" }, { key: "cook", label: "Cook" }, { key: "connect", label: "Connect" },
  { key: "joy", label: "Joy" }, { key: "treats", label: "Treats" },
];

const CARDS = [
  { key: "read1", domain: "read", kind: "Read", title: "Tonight's long read", line: "An essay chosen for your week — saved-for-later, ready when you are.", href: "/Lifestyle?tab=read", Icon: BookOpen, accent: "#A8893F", flower: "camellia", tall: true },
  { key: "listen1", domain: "listen", kind: "Listen", title: "A podcast for the walk", line: "Press play and go — a fresh episode tuned to how you're feeling.", href: "/Lifestyle?tab=listen", Icon: Headphones, accent: "#8E6E8E", flower: "bluebell" },
  { key: "move1", domain: "move", kind: "Move", title: "Move with your phase", line: "Workouts that flex to where you are in your cycle, not against it.", href: "/ProgramsHub", Icon: Activity, accent: "#8FAF8F", flower: "primrose" },
  { key: "cook1", domain: "cook", kind: "Cook", title: "10-minute, iron-friendly", line: "Quick dinners that quietly do your body a favour this week.", href: "/Nutrition", Icon: Salad, accent: "#8FAF8F", flower: "sunflower", tall: true },
  { key: "connect1", domain: "connect", kind: "The room", title: "The room's talking", line: "Today's question, and a hundred anonymous answers. Add yours.", href: "/Community", Icon: Users, accent: "#BC2E27", flower: "cornflower" },
  { key: "joy1", domain: "joy", kind: "Daily story", title: "Today's chapter", line: "A short instalment of the serial, released a little each day.", href: "/Lifestyle?tab=daily_story", Icon: Sparkles, accent: "#A8893F", flower: "poppy" },
  { key: "joy2", domain: "joy", kind: "Horoscope", title: "Your sky, today", line: "Astra's reading — for fun, for a little wonder, for you.", href: "/Lifestyle?tab=horoscope", Icon: Star, accent: "#8E6E8E", flower: "violet", tall: true },
  { key: "connect2", domain: "connect", kind: "Events", title: "What's on near you", line: "Meetups, classes and circles — turn up, or just have a nosy.", href: "/Events", Icon: CalendarHeart, accent: "#E8B4B8", flower: "rose" },
  { key: "treats1", domain: "treats", kind: "Deals", title: "A little something", line: "Member treats and offers — a small kindness to yourself.", href: "/Deals", Icon: Ticket, accent: "#A8893F", flower: "lavender" },
  { key: "joy3", domain: "joy", kind: "Journal", title: "Write it out", line: "A prompt for the day — a line is plenty, and it's only ever yours.", href: "/Journal", Icon: PenLine, accent: "#8E6E8E", flower: "iris" },
];

export default function ExploreDemo() {
  useEditorialFonts();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [fresh, setFresh] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const me = await withTimeout(base44.auth.me()); const id = me?.id || null;
      if (id) withTimeout(base44.entities.ContentItems.list("-created_date", 30)).then((r) => { if (alive) setFresh((r || []).filter((x) => x && x.title).length || 0); }).catch(() => {});
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const shown = useMemo(() => CARDS.filter((c) => filter === "all" || c.domain === filter), [filter]);
  const go = () => { const s = q.trim(); try { window.location.href = s ? `/Search?q=${encodeURIComponent(s.slice(0, 80))}` : "/Search"; } catch { window.location.href = "/Search"; } };

  if (loading) return <Loader />;

  return (
    <div className="fwc-anim" style={{ ...PAPER_BG, minHeight: "100vh", color: T.ink, paddingBottom: 130, position: "relative", overflowX: "clip" }}>
      <InkFilter />
      <style>{DEMO_CSS}{floraKeyframes}</style>
      <PageVines a={T.gold} b={T.sage} />

      <div style={{ maxWidth: COL, margin: "0 auto", position: "relative", zIndex: 1, padding: "0 18px" }}>
        <header style={{ textAlign: "center", padding: "26px 0 6px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 2 }}><Heart size={15} /><Eyebrow color={T.muted}>Discover</Eyebrow></div>
          <Script size={46} color={T.ink}>Explore</Script>
          <Hand size={16} color={T.muted} style={{ display: "block", margin: "8px 0 0", lineHeight: 1.5 }}>
            Not just your health — the whole of your life. Read, listen, move, cook, connect, treat yourself.
          </Hand>
        </header>

        {/* SEARCH */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 16, padding: "12px 15px", marginTop: 14, boxShadow: "0 4px 18px rgba(58,44,26,0.10)" }}>
          <Search size={18} color={T.muted} />
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") go(); }} placeholder="Search anything — sleep, dating, dinners, calm…"
            style={{ flex: 1, minWidth: 0, border: "none", background: "transparent", fontFamily: SERIF, fontSize: 16, color: T.ink, outline: "none" }} />
          <button onClick={go} aria-label="Search" style={{ background: T.gold, color: "#fff", border: "none", borderRadius: 10, padding: "8px 12px", cursor: "pointer", fontFamily: UI, fontSize: 13, fontWeight: 700 }}>Go</button>
        </div>
        {fresh != null && fresh > 0 && <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "8px 2px 0" }}>{fresh} fresh pieces added recently</div>}

        {/* DOMAIN CHIPS */}
        <div className="demo-noscroll" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "14px 0 4px", WebkitOverflowScrolling: "touch" }}>
          {DOMAINS.map((d) => { const on = filter === d.key; return (
            <button key={d.key} onClick={() => setFilter(d.key)} style={{ flex: "none", background: on ? T.gold : "transparent", color: on ? "#fff" : T.muted, border: `1px solid ${on ? T.gold : T.paperDeep}`, borderRadius: 999, padding: "7px 15px", fontFamily: UI, fontSize: 13, fontWeight: 700, letterSpacing: 0.4, cursor: "pointer", whiteSpace: "nowrap" }}>{d.label}</button>
          ); })}
        </div>

        {/* MASONRY */}
        <div style={{ columnCount: 2, columnGap: 12, marginTop: 12 }}>
          {shown.map((c) => (
            <a key={c.key} href={c.href} style={{ display: "inline-block", width: "100%", breakInside: "avoid", marginBottom: 12, position: "relative", overflow: "hidden", background: `linear-gradient(165deg, ${T.paperHi} 0%, ${c.accent}14 100%)`, border: `1px solid ${T.paperDeep}`, borderTop: `3px solid ${c.accent}`, borderRadius: 16, padding: "14px 14px", textDecoration: "none", boxShadow: "0 3px 14px rgba(58,44,26,0.10)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: c.tall ? 10 : 8 }}>
                <span style={{ width: 32, height: 32, borderRadius: 9, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center" }}><c.Icon size={16} color={c.accent} /></span>
                <FlowerGlyph variant={c.flower} size={c.tall ? 34 : 26} color={c.accent} idx={`ex-${c.key}`} />
              </div>
              <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: c.accent, marginBottom: 4 }}>{c.kind}</div>
              <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink, lineHeight: 1.25, marginBottom: 5, ...CLAMP(2) }}>{c.title}</div>
              <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.45, margin: "0 0 8px", ...CLAMP(c.tall ? 4 : 3) }}>{c.line}</p>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted }}>Open <ChevronRight size={13} /></span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
