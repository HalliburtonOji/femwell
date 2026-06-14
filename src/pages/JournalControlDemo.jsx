// JournalControlDemo — "Control Center" concept reinterpreted for the JOURNAL page.
//
// Apple's iOS Control Center music/AirPlay card gives us the SHAPE, not the skin:
//   · a slim summary HEADER at the very top (the page's "now playing" state)
//   · beneath it, a BIG full-screen-covering rounded CARD that floats over a softly
//     DIMMED backdrop — the panel
//   · inside the panel, the page's surfaces live as a 2-COLUMN GRID of large rounded
//     cards that scroll-snap horizontally, with a PEEK of the next column at the right
//   · a vertical QUICK-ACTION / jump RAIL pinned on the RIGHT edge of the panel
//
// We translate Apple's dark translucent glass into FemWell EDITORIAL: cream/plum paper,
// Ephesis (script) + Cormorant, Lucide/SVG icons, soft shadows + generous rounding.
// NO Apple dark glass, NO emoji.
//
// Self-contained DEMO: useState/useEffect ONLY. No base44, no entities, no network,
// no props. Mock data inline. Brand-pure: T tokens + Editorial primitives.
import { useState } from "react";
import {
  PenLine, Megaphone, HeartHandshake, Users, Sparkles, CalendarHeart,
  Mail, Flame, MessagesSquare, Feather, Eye, ArrowUpRight,
} from "lucide-react";
import {
  T, SERIF, UI, Eyebrow, Rule, Script, Hand, InkFilter,
  useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";

const COL = 430; // phone column

// ── mock "today" state ───────────────────────────────────────────────────────
const ME = { phase: "Luteal", day: 22, entriesWeek: 4 };
const JESS_PROMPT =
  "The luteal pull turns you inward — let the page hold what you'd rather not say aloud.";
const BLOSSOM = "What's been quietly growing in you this week?";

// ── the grid surfaces (large rounded cards, 2-col, peek) ─────────────────────
const SURFACES = [
  {
    id: "write", title: "Write", script: true, icon: PenLine, accent: T.crimson,
    essence: "Compose today's entry — unhurried, unjudged.",
    stat: "Last entry · 2 days ago",
  },
  {
    id: "echo", title: "Echo Wall", icon: Megaphone, accent: T.gold,
    essence: "Share one line into the quiet of others.",
    stat: "37 echoes resonating now",
  },
  {
    id: "witness", title: "Witness", icon: HeartHandshake, accent: T.sage,
    essence: "Hold space for a stranger's single line.",
    stat: "3 lines waiting to be held",
  },
  {
    id: "twin", title: "Phase Twin", icon: Users, accent: T.gold,
    essence: "A woman in luteal, day 22 — same tide as you.",
    stat: "Paired · wrote an hour ago",
  },
  {
    id: "insights", title: "Insights", icon: Sparkles, accent: T.crimson,
    essence: "Gentle patterns Jess noticed in your pages.",
    stat: "Tenderness peaks pre-bleed",
  },
  {
    id: "onthisday", title: "On This Day", icon: CalendarHeart, accent: T.sage,
    essence: "What you wrote a year ago today.",
    stat: "June 14, 2025 · one entry",
  },
  {
    id: "sealed", title: "Sealed Letters", icon: Mail, accent: T.gold,
    essence: "Notes to a future you, not yet opened.",
    stat: "2 sealed · 1 opens in autumn",
  },
  {
    id: "burn", title: "Burn Mode", icon: Flame, accent: T.crimson,
    essence: "Write it, release it — nothing is kept.",
    stat: "Ash, never archive",
  },
  {
    id: "threads", title: "Threads", icon: MessagesSquare, accent: T.sage,
    essence: "Follow a feeling across many entries.",
    stat: "5 threads woven",
  },
];

// ── right jump rail items (quick jumps) ──────────────────────────────────────
const RAIL = [
  { id: "write", label: "Write", icon: PenLine },
  { id: "echo", label: "Echo", icon: Megaphone },
  { id: "witness", label: "Witness", icon: HeartHandshake },
  { id: "insights", label: "Insights", icon: Sparkles },
  { id: "today", label: "Today", icon: CalendarHeart },
];

// ── one large rounded grid card ──────────────────────────────────────────────
function GridCard({ surface, active, onJump }) {
  const Icon = surface.icon;
  return (
    <button
      onClick={() => onJump(surface.id)}
      style={{
        scrollSnapAlign: "start", flex: "0 0 auto", width: "100%",
        textAlign: "left", cursor: "pointer",
        background: T.paperHi,
        border: `1px solid ${active ? surface.accent : T.paperDeep}`,
        borderRadius: 22, padding: "16px 15px 15px",
        minHeight: 188, display: "flex", flexDirection: "column",
        boxShadow: active
          ? `0 14px 30px -20px rgba(11,8,5,0.6), inset 0 0 0 1px ${surface.accent}22`
          : "0 10px 24px -20px rgba(11,8,5,0.5)",
        transition: "border-color .2s, box-shadow .2s",
      }}
    >
      {/* icon disc */}
      <span style={{
        width: 38, height: 38, borderRadius: 999, display: "inline-flex",
        alignItems: "center", justifyContent: "center", background: T.wax,
        border: `1px solid ${T.paperDeep}`, marginBottom: 11,
      }}>
        <Icon size={18} color={surface.accent} strokeWidth={1.8} />
      </span>

      {/* title — script for Write, serif elsewhere */}
      {surface.script ? (
        <Script size={28} style={{ marginBottom: 5 }}>{surface.title}</Script>
      ) : (
        <div style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 600, color: T.ink, lineHeight: 1.1, marginBottom: 6 }}>
          {surface.title}
        </div>
      )}

      {/* one-line essence */}
      <div style={{ fontFamily: SERIF, fontSize: 14, fontStyle: "italic", color: T.muted, lineHeight: 1.32, flex: 1 }}>
        {surface.essence}
      </div>

      {/* mock stat / preview line */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${T.paperDeep}` }}>
        <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: surface.accent }}>
          {surface.stat}
        </span>
        <ArrowUpRight size={14} color={T.muted} />
      </div>
    </button>
  );
}

// ── the right-pinned vertical jump rail ──────────────────────────────────────
function JumpRail({ active, onJump }) {
  return (
    <div style={{
      flex: "none", width: 52, display: "flex", flexDirection: "column",
      alignItems: "center", gap: 12, paddingTop: 4,
    }}>
      {RAIL.map((r) => {
        const Icon = r.icon;
        const on = active === r.id;
        return (
          <button
            key={r.id}
            onClick={() => onJump(r.id)}
            aria-label={r.label}
            title={r.label}
            style={{
              display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4,
              background: "transparent", border: "none", padding: 0, cursor: "pointer",
            }}
          >
            <span style={{
              width: 40, height: 40, borderRadius: 999, display: "inline-flex",
              alignItems: "center", justifyContent: "center",
              background: on ? T.ink : T.paperHi,
              border: `1px solid ${on ? T.ink : T.paperDeep}`,
              boxShadow: on ? "0 8px 18px -12px rgba(11,8,5,0.7)" : "none",
              transition: "background .2s, border-color .2s",
            }}>
              <Icon size={17} color={on ? T.paper : T.inkSoft} strokeWidth={1.8} />
            </span>
            <span style={{
              fontFamily: UI, fontSize: 8, fontWeight: 700, letterSpacing: 0.4,
              textTransform: "uppercase", color: on ? T.ink : T.muted,
            }}>
              {r.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────
export default function JournalControlDemo() {
  useEditorialFonts();
  const [active, setActive] = useState("write");

  // a rail/grid tap just spotlights the surface (demo — no navigation)
  const onJump = (id) => setActive(RAIL.some((r) => r.id === id) || SURFACES.some((s) => s.id === id) ? id : active);

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 48 }}>
      <InkFilter />

      {/* mock-data banner (exact spec) */}
      <div style={{ background: T.ink, color: T.paper, fontFamily: UI, fontSize: 10.5, letterSpacing: 0.4, textAlign: "center", padding: "6px 10px" }}>
        Journal · Control-Center concept — mock data
      </div>

      <div style={{ maxWidth: COL, margin: "0 auto", padding: "0 16px" }}>

        {/* ── HEADER · the "now playing" summary — A publication of one ── */}
        <header style={{ padding: "20px 4px 16px" }}>
          <Eyebrow mb={6}>A publication of one</Eyebrow>
          <Script size={42} style={{ marginBottom: 4 }}>The Daily Page</Script>

          {/* phase / day + entries-this-week */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: T.crimson }}>
              {ME.phase} · Day {ME.day}
            </span>
            <span style={{ width: 3, height: 3, borderRadius: 999, background: T.paperDeep }} />
            <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: T.muted }}>
              {ME.entriesWeek} entries this week
            </span>
          </div>

          {/* Jess phase-prompt line */}
          <div style={{ display: "flex", gap: 9 }}>
            <Feather size={15} color={T.sage} strokeWidth={1.8} style={{ flex: "none", marginTop: 3 }} />
            <Hand size={16} color={T.inkSoft}>{JESS_PROMPT}</Hand>
          </div>

          {/* gentle "what's blossoming" prompt */}
          <Rule mt={14} mb={10} c={T.paperDeep} />
          <div style={{ fontFamily: SERIF, fontSize: 14, fontStyle: "italic", color: T.muted }}>
            {BLOSSOM}
          </div>
        </header>

        {/* ── THE COVERING CARD over a DIMMED backdrop ──
            The dim is a scrim layer behind the panel; the panel itself is a big
            soft-shadowed rounded card that "covers" the page from here down. */}
        <div style={{ position: "relative", paddingTop: 6 }}>
          {/* dimmed backdrop scrim — softly darkens the paper behind the floating panel */}
          <div
            aria-hidden
            style={{
              position: "absolute", left: -16, right: -16, top: -8, bottom: -40,
              background: "rgba(11,8,5,0.16)",
              backdropFilter: "blur(1px)", WebkitBackdropFilter: "blur(1px)",
              borderRadius: 0, pointerEvents: "none",
            }}
          />

          {/* the floating panel — full-width covering rounded card */}
          <section
            style={{
              position: "relative",
              background: T.paper,
              borderRadius: 28,
              border: `1px solid ${T.paperDeep}`,
              boxShadow: "0 26px 60px -28px rgba(11,8,5,0.7), 0 2px 0 rgba(255,253,247,0.5) inset",
              padding: "18px 14px 20px",
              minHeight: 560,
            }}
          >
            {/* grab handle — the Control-Center pill */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <span style={{ width: 42, height: 5, borderRadius: 999, background: T.paperDeep }} />
            </div>

            {/* panel title row */}
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "0 4px", marginBottom: 4 }}>
              <Eyebrow color={T.gold}>Your surfaces</Eyebrow>
              <span style={{ fontFamily: UI, fontSize: 9.5, color: T.muted, letterSpacing: 0.4 }}>
                swipe across · tap to enter
              </span>
            </div>
            <Rule mb={14} c={T.paperDeep} />

            {/* the body: 2-col scroll-snap GRID + right pinned RAIL */}
            <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>

              {/* GRID — horizontal scroll-snap, columns of 2, next column PEEKS */}
              <div
                className="jcc-grid"
                style={{
                  flex: 1, minWidth: 0,
                  overflowX: "auto", scrollSnapType: "x mandatory",
                  WebkitOverflowScrolling: "touch", scrollbarWidth: "none",
                  paddingBottom: 4,
                }}
              >
                <style>{`.jcc-grid::-webkit-scrollbar{display:none}`}</style>
                <div
                  style={{
                    display: "grid",
                    gridAutoFlow: "column",
                    gridTemplateRows: "repeat(2, auto)",
                    // each column is ~88% of the track so the NEXT column peeks at the right edge
                    gridAutoColumns: "88%",
                    gap: 12,
                  }}
                >
                  {SURFACES.map((s) => (
                    <div key={s.id} style={{ scrollSnapAlign: "start" }}>
                      <GridCard surface={s} active={active === s.id} onJump={onJump} />
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT JUMP RAIL — pinned vertical icon buttons */}
              <JumpRail active={active} onJump={onJump} />
            </div>

            {/* gentle footer voice inside the panel */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 18, padding: "0 4px" }}>
              <Eye size={14} color={T.muted} strokeWidth={1.8} />
              <span style={{ fontFamily: SERIF, fontSize: 13, fontStyle: "italic", color: T.muted }}>
                Held privately. Nothing leaves this page unless you send it.
              </span>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
