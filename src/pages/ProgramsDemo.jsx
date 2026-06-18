// ProgramsDemo — a redesign DEMO of the Programs page. PREVIEW route only (/ProgramsDemo). LIVE
// /ProgramsHub UNTOUCHED. Conforms to BRAND_IDENTITY.md (gold/sunflower — radiance & achievement).
//
// DISTINCT FORM (a STREAMING-STYLE GALLERY — not a single slider): a big FEATURED programme card, then
// MULTIPLE horizontal SHELVES (Continue · one per category / curated rows) of compact programme tiles.
// Every tile deep-links to the EXACT programme. Brand held constant.

import { useState, useEffect, useMemo, useRef } from "react";
import {
  T, SERIF, UI, PAPER_BG, Heart, Eyebrow, Script, Hand, InkFilter, useEditorialFonts,
} from "@/components/journal/Editorial";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { floraKeyframes, FlowerGlyph, RichBloomV2 } from "@/components/brand/flora";
import { Loader, PageVines, JumpPill, JumpSheet, DEMO_CSS, CLAMP, clip, withTimeout } from "@/components/demos/demoKit";
import { Activity, Play, Clock, ChevronRight, Sparkles } from "lucide-react";

const COL = 480;
const PALETTE = [
  { accent: T.gold, flower: "sunflower" }, { accent: T.sage, flower: "primrose" }, { accent: "#8E6E8E", flower: "iris" },
  { accent: T.blush, flower: "rose" }, { accent: T.crimson, flower: "poppy" }, { accent: T.gold, flower: "lavender" },
];
const FALLBACK = [
  { program_key: null, title: "Sleep, restored", summary: "Two weeks of small evening shifts toward deeper rest.", duration_days: 14, category: "Sleep" },
  { program_key: null, title: "Steadier moods", summary: "Daily practices for the luteal dip — breath, light, food.", duration_days: 21, category: "Mind" },
  { program_key: null, title: "Move with your cycle", summary: "Workouts that flex to your phase, not against it.", duration_days: 28, category: "Movement" },
  { program_key: null, title: "Quiet confidence", summary: "Ten days of small brave things — work, dating, your corner.", duration_days: 10, category: "Confidence" },
  { program_key: null, title: "Through perimenopause", summary: "What's changing, why, and what helps — week by week.", duration_days: 30, category: "Life stage" },
  { program_key: null, title: "Gentle mornings", summary: "A softer start to the day, in five small steps.", duration_days: 7, category: "Mind" },
];

const hrefFor = (p) => (p?.program_key ? createPageUrl(`ProgramsHub?program_key=${p.program_key}`) : "/ProgramsHub");

export default function ProgramsDemo() {
  useEditorialFonts();
  const [programs, setPrograms] = useState(null);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jumpOpen, setJumpOpen] = useState(false);
  const shelfRefs = useRef({});

  useEffect(() => {
    let alive = true;
    (async () => {
      const me = await withTimeout(base44.auth.me()); const id = me?.id || null;
      const rows = await withTimeout(base44.entities.Programs.list("-created_date", 60));
      const list = (rows || []).filter((p) => p && p.title); if (!alive) return;
      setPrograms(list); setLoading(false);
      if (id) withTimeout(base44.entities.UserPrograms.filter({ user_id: id }, "-last_activity_date", 8)).then((ups) => {
        const arr = (ups || []).filter(Boolean); const up = arr.find((r) => r.status && r.status !== "completed") || arr[0];
        if (!alive || !up) return; const prog = list.find((p) => p.program_key === up.program_key) || null; setActive({ up, prog });
      }).catch(() => {});
    })();
    return () => { alive = false; };
  }, []);

  const real = (programs && programs.length ? programs : FALLBACK);
  const featured = active?.prog || real[0];

  // build shelves: Continue (if active) + by category (or curated split)
  const shelves = useMemo(() => {
    const out = [];
    if (active?.prog) out.push({ key: "continue", label: "Continue", progs: [active.prog], continue: true });
    const cats = [...new Set(real.map((p) => p.category).filter(Boolean))];
    if (cats.length >= 2) {
      cats.slice(0, 5).forEach((cat) => out.push({ key: `cat-${cat}`, label: cat, progs: real.filter((p) => p.category === cat) }));
      const uncatd = real.filter((p) => !p.category);
      if (uncatd.length) out.push({ key: "more", label: "More to explore", progs: uncatd });
    } else {
      out.push({ key: "rec", label: "Picked for your week", progs: real.slice(0, 6) });
      if (real.length > 6) out.push({ key: "all", label: "Explore all", progs: real.slice(6) });
    }
    return out.filter((s) => s.progs.length);
  }, [real, active]);

  const SECTIONS = useMemo(() => ([
    { key: "featured", label: "Featured", Icon: Sparkles, accent: "#A8893F" },
    ...shelves.map((s, i) => ({ key: s.key, label: s.label, Icon: Activity, accent: PALETTE[i % PALETTE.length].accent })),
  ]), [shelves]);

  const jumpTo = (k) => { setJumpOpen(false); const el = k === "featured" ? document.getElementById("pg-featured") : shelfRefs.current[k]; el?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  if (loading) return <Loader />;

  return (
    <div className="fwc-anim" style={{ ...PAPER_BG, minHeight: "100vh", color: T.ink, paddingBottom: 130, position: "relative", overflowX: "clip" }}>
      <InkFilter />
      <style>{DEMO_CSS}{floraKeyframes}</style>
      <PageVines a={T.gold} b={T.sage} />
      <JumpPill onClick={() => setJumpOpen(true)} />

      <div style={{ maxWidth: COL, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <header style={{ display: "flex", alignItems: "center", gap: 11, padding: "26px 18px 8px" }}>
          <span style={{ width: 48, height: 48, borderRadius: 13, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}><Activity size={24} color={T.gold} strokeWidth={1.7} /></span>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Heart size={15} /><Eyebrow color={T.muted}>Programmes</Eyebrow></div>
            <Script size={42} color={T.ink}>Programs</Script>
          </div>
        </header>
        <Hand size={16} color={T.muted} style={{ display: "block", margin: "2px 18px 14px", lineHeight: 1.5 }}>
          Something to grow into — short, guided arcs for the part of life that's asking for attention right now.
        </Hand>

        {/* FEATURED */}
        {featured && (
          <div id="pg-featured" style={{ padding: "0 18px", scrollMarginTop: 70 }}>
            <FeaturedCard p={featured} continueData={active?.prog === featured ? active : null} />
          </div>
        )}

        {/* SHELVES */}
        {shelves.map((s, si) => {
          const pal = PALETTE[si % PALETTE.length];
          return (
            <section key={s.key} ref={(el) => { shelfRefs.current[s.key] = el; }} style={{ marginTop: 24, scrollMarginTop: 70 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 18px 10px" }}>
                <FlowerGlyph variant={pal.flower} size={26} color={pal.accent} idx={`pg-sh-${s.key}`} />
                <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 21, fontWeight: 600, color: T.ink }}>{s.label}</span>
                <span style={{ flex: 1, height: 1, background: T.paperDeep, opacity: 0.6, marginLeft: 4 }} />
              </div>
              <div className="demo-noscroll" style={{ display: "flex", gap: 12, overflowX: "auto", padding: "2px 18px 6px", scrollSnapType: "x proximity", WebkitOverflowScrolling: "touch" }}>
                {s.progs.map((p, i) => <ProgramTile key={(p.program_key || p.title) + i} p={p} pal={PALETTE[(si + i) % PALETTE.length]} continueShelf={s.continue} continueData={s.continue ? active : null} />)}
              </div>
            </section>
          );
        })}

        <a href="/ProgramsHub" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4, width: "calc(100% - 36px)", margin: "24px 18px 0", fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, textDecoration: "none" }}>Browse the full programme library <ChevronRight size={14} /></a>
      </div>

      {jumpOpen && <JumpSheet sections={SECTIONS} onClose={() => setJumpOpen(false)} onPick={(k) => jumpTo(k)} />}
    </div>
  );
}

function FeaturedCard({ p, continueData }) {
  const day = continueData?.up?.current_day || 1;
  const href = continueData ? createPageUrl(`ProgramDay?key=${p.program_key}&day=${day}`) : hrefFor(p);
  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 22, border: `1px solid ${T.paperDeep}`, background: `linear-gradient(150deg, #F4EAD0 0%, ${T.gold}26 60%, ${T.sage}1F 100%)`, boxShadow: "0 8px 30px rgba(58,44,26,0.16)", padding: "20px 20px 18px" }}>
      <div style={{ position: "absolute", top: -6, right: -4, opacity: 0.92 }}><RichBloomV2 form="daisy" color="#D4AF37" color2="#E8CE78" accent="#6B5840" size={116} animate soft idx="pg-feat" /></div>
      <div style={{ position: "relative", zIndex: 1, maxWidth: "76%" }}>
        <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.gold }}>{continueData ? "Continue" : "Featured"}{p.category ? ` · ${p.category}` : ""}</span>
        <h2 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: T.ink, lineHeight: 1.18, margin: "6px 0 6px", ...CLAMP(3) }}>{clip(p.title, 56)}</h2>
        {continueData && p.duration_days ? (
          <div style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, marginBottom: 10 }}>Day {day} of {p.duration_days} — keep the rhythm.</div>
        ) : (
          <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px", ...CLAMP(3) }}>{clip(p.summary || "A gentle, guided programme you move through at your own pace.", 120)}</p>
        )}
        {p.duration_days && !continueData && <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 12, fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.gold }}><Clock size={13} /> {p.duration_days} days</div>}
      </div>
      <a href={href} style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", gap: 8, background: T.gold, color: "#fff", border: "none", borderRadius: 12, padding: "12px 18px", fontFamily: UI, fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(168,137,63,0.4)" }}>
        {continueData ? <><Play size={15} /> Continue today's session</> : <><Activity size={15} /> Explore this programme</>}
      </a>
    </div>
  );
}

function ProgramTile({ p, pal, continueShelf, continueData }) {
  const day = continueData?.up?.current_day || 1;
  const href = continueShelf && p.program_key ? createPageUrl(`ProgramDay?key=${p.program_key}&day=${day}`) : hrefFor(p);
  return (
    <a href={href} style={{ flex: "0 0 168px", width: 168, scrollSnapAlign: "start", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 16, textDecoration: "none", boxShadow: "0 3px 14px rgba(58,44,26,0.10)" }}>
      <div style={{ position: "relative", height: 96, background: `linear-gradient(150deg, ${pal.accent}2E 0%, ${pal.accent}14 100%)`, display: "grid", placeItems: "center", borderBottom: `1px solid ${T.paperDeep}` }}>
        <FlowerGlyph variant={pal.flower} size={50} color={pal.accent} idx={`pg-tile-${p.program_key || p.title}`} />
        {continueShelf && <span style={{ position: "absolute", top: 8, left: 8, fontFamily: UI, fontSize: 12, fontWeight: 700, color: "#fff", background: pal.accent, borderRadius: 999, padding: "2px 9px" }}>Day {day}</span>}
      </div>
      <div style={{ padding: "11px 12px 13px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink, lineHeight: 1.25, ...CLAMP(2) }}>{clip(p.title, 48)}</div>
        <div style={{ marginTop: "auto", paddingTop: 8, display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 12, fontWeight: 700, color: pal.accent }}>
          {continueShelf ? <><Play size={12} /> Continue</> : p.duration_days ? <><Clock size={12} /> {p.duration_days} days</> : <><ChevronRight size={12} /> Explore</>}
        </div>
      </div>
    </a>
  );
}
