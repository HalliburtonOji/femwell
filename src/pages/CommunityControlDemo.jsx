// CommunityControlDemo — "Control Center" reinterpretation for the COMMUNITY page.
//
// THE CONCEPT (reinterpreted, NOT Apple's dark glass):
//   • A HEADER at the very top = the page summary — a warm Jess welcome: who's
//     here in your season, the Question of the Day, a gentle invite to share.
//   • Beneath it, a big FULL-SCREEN-COVERING rounded CARD floats over a softly
//     DIMMED backdrop (the dim is a cream/plum scrim, never dark translucency).
//   • Inside the panel: a 2-COLUMN GRID of large rounded room-cards laid out as a
//     horizontal scroll-snap track, so the NEXT COLUMN PEEKS at the right edge.
//   • A vertical QUICK-ACTION JUMP RAIL is pinned on the RIGHT side of the panel.
//
// Translated to FemWell EDITORIAL: cream/plum palette, Ephesis (Script) + Cormorant
// (Hand/Serif), Lucide/SVG icons, NO EMOJI, soft shadows + generous rounding instead
// of dark blur. Anonymous-first / 18+ / no scoreboards preserved in the framing.
//
// Self-contained DEMO: useState/useEffect ONLY. No base44, no entities, no network,
// no props. All data is mock, defined in-file.
import { useState, useEffect } from "react";
import {
  MessageCircleHeart, Radio, Sparkles, BookOpen, Users, Heart,
  Wallet, Shirt, Stethoscope, Mic, Home, ShieldCheck, ChevronRight,
} from "lucide-react";
import {
  T, SERIF, UI, Eyebrow, Rule, Script, Hand, InkFilter, useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";

const COL = 430; // phone column

// ── mock data ────────────────────────────────────────────────────────────────
const JESS = {
  greeting: "Evening",
  presence: "Women in your season are here tonight",
  season: "Perimenopause circle",
  qotd: "What did you let yourself off the hook for this week?",
  invite: "You can share as little or as much as you like — anonymous always.",
};

// each room-card: title, one-line essence, Lucide icon, a gently-framed "ambient"
// line (warmth, NOT a score — never counts as ranking), and an accent.
const ROOMS = [
  { id: "lounge",   title: "The Lounge",        icon: MessageCircleHeart, essence: "Anonymous vent — say the unsayable.",        ambient: "A few quiet conversations open",      accent: T.crimson },
  { id: "echo",     title: "Echo Wall",         icon: Radio,              essence: "One line. It fades by morning.",            ambient: "Someone left a line a moment ago",    accent: T.gold },
  { id: "lighter",  title: "The Lighter Side",  icon: Sparkles,           essence: "Games, horoscope, a softer hour.",          ambient: "Tonight's horoscope is up",           accent: T.sage },
  { id: "library",  title: "Library · Book Club", icon: BookOpen,         essence: "Reading together, slowly.",                 ambient: "This month's chapter is open",        accent: T.gold },
  { id: "circles",  title: "Circles & Clubs",   icon: Users,              essence: "Smaller rooms by what you love.",           ambient: "A new circle is gathering",           accent: T.sage },
  { id: "love",     title: "Love & Relationships", icon: Heart,           essence: "Partners, parents, the heart of it.",       ambient: "A gentle thread is unfolding",        accent: T.crimson },
  { id: "money",    title: "Money & Work",      icon: Wallet,             essence: "Pay, bills, work — no judgement.",          ambient: "Someone's asking the brave question", accent: T.gold },
  { id: "style",    title: "Style",             icon: Shirt,              essence: "Dressing the body you have today.",         ambient: "A few fits shared this evening",      accent: T.sage },
  { id: "health",   title: "The Health Room",   icon: Stethoscope,        essence: "Peer support — shared, not prescribed.",    ambient: "Women comparing notes kindly",        accent: T.crimson },
  { id: "talk",     title: "Talk It Out",       icon: Mic,                essence: "Voices, not typing. Press to speak.",       ambient: "A warm voice room is open",           accent: T.gold },
];

// right jump rail — quick anchors into the most-used rooms + home
const RAIL = [
  { id: "lounge",  icon: MessageCircleHeart, label: "Lounge" },
  { id: "echo",    icon: Radio,              label: "Echo" },
  { id: "lighter", icon: Sparkles,           label: "Lighter" },
  { id: "talk",    icon: Mic,                label: "Talk" },
  { id: "home",    icon: Home,               label: "Home" },
];

const SAFE_LINE   = "Peer support, not medical advice. If something feels urgent, we'll always point you to NHS 111 or 999.";
const FOOTER_LINE = "Anonymous-first · 18+ · no scoreboards, no leaderboards — just women, here.";

// ── one large room-card (a grid cell, scroll-snapped, peeking) ───────────────
function RoomCard({ room, active, onClick }) {
  const Icon = room.icon;
  return (
    <button
      onClick={onClick}
      style={{
        scrollSnapAlign: "start",
        textAlign: "left", cursor: "pointer",
        background: active ? T.paperHi : T.paper,
        border: `1px solid ${active ? room.accent : T.paperDeep}`,
        borderRadius: 20, padding: 16,
        display: "flex", flexDirection: "column", gap: 8, minHeight: 150,
        boxShadow: active
          ? `0 12px 26px -16px rgba(33,26,18,0.42)`
          : `0 8px 20px -18px rgba(33,26,18,0.4)`,
        transition: "border-color .18s, box-shadow .18s, background .18s",
      }}
    >
      {/* soft tinted icon disc — the "control" glyph, brand-warm not dark glass */}
      <span style={{
        width: 38, height: 38, borderRadius: 12, display: "inline-flex",
        alignItems: "center", justifyContent: "center", flex: "none",
        background: T.wax, border: `1px solid ${T.paperDeep}`,
      }}>
        <Icon size={19} color={room.accent} />
      </span>

      <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink, lineHeight: 1.15 }}>
        {room.title}
      </div>
      <div style={{ fontFamily: SERIF, fontSize: 13.5, fontStyle: "italic", color: T.muted, lineHeight: 1.3 }}>
        {room.essence}
      </div>

      {/* ambient line — framed as warmth, never a count/score */}
      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 7, paddingTop: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: room.accent, flex: "none" }} />
        <span style={{ fontFamily: UI, fontSize: 10, color: T.muted, letterSpacing: 0.3 }}>
          {room.ambient}
        </span>
      </div>
    </button>
  );
}

// ── the right-pinned quick-jump rail ─────────────────────────────────────────
function JumpRail({ active, onJump }) {
  return (
    <div style={{
      position: "sticky", top: 0, alignSelf: "flex-start", flex: "none",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
      paddingTop: 4,
    }}>
      {RAIL.map((r) => {
        const Icon = r.icon;
        const on = active === r.id;
        return (
          <button key={r.id} onClick={() => onJump(r.id)} aria-label={r.label} title={r.label}
            style={{
              width: 42, height: 42, borderRadius: 14, cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: on ? T.ink : T.paperHi,
              color: on ? T.paper : T.inkSoft,
              border: `1px solid ${on ? T.ink : T.paperDeep}`,
              boxShadow: on ? "0 8px 18px -12px rgba(33,26,18,0.5)" : "none",
              transition: "background .16s, color .16s",
            }}>
            <Icon size={18} />
          </button>
        );
      })}
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────
export default function CommunityControlDemo() {
  useEditorialFonts();

  const [active, setActive] = useState("lounge");
  const [shared, setShared] = useState(false);

  // tiny mount-in fade for the floating panel (purely cosmetic)
  const [up, setUp] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setUp(true), 40);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 48 }}>
      <InkFilter />

      {/* mock-data banner — exact spec */}
      <div style={{ background: T.ink, color: T.paper, fontFamily: UI, fontSize: 10.5, letterSpacing: 0.4, textAlign: "center", padding: "6px 10px" }}>
        Community · Control-Center concept — mock data
      </div>

      <div style={{ maxWidth: COL, margin: "0 auto" }}>
        {/* ───────── HEADER (the page summary — warm Jess welcome) ───────── */}
        <header style={{ padding: "22px 20px 16px" }}>
          <Eyebrow mb={6}>{JESS.greeting} · {JESS.season}</Eyebrow>
          <Script size={34} style={{ marginBottom: 6 }}>Community</Script>
          <Hand size={16} color={T.inkSoft} style={{ marginBottom: 12 }}>
            {JESS.presence}.
          </Hand>

          {/* Question of the Day — the gentle anchor */}
          <div style={{
            background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 16,
            padding: "13px 15px", boxShadow: "0 8px 20px -18px rgba(33,26,18,0.4)",
          }}>
            <Eyebrow mb={5} color={T.gold}>Question of the day</Eyebrow>
            <div style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.3 }}>
              {JESS.qotd}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 11 }}>
              <span style={{ fontFamily: UI, fontSize: 10, color: T.muted, letterSpacing: 0.3, flex: 1, lineHeight: 1.4 }}>
                {JESS.invite}
              </span>
              <button onClick={() => setShared((s) => !s)} style={{
                flex: "none", background: shared ? T.sage : T.ink, color: T.paper, border: "none",
                borderRadius: 11, padding: "9px 14px", cursor: "pointer",
                fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
              }}>
                {shared ? "Shared — thank you" : "Share a line"}
              </button>
            </div>
          </div>
        </header>

        {/* ───────── DIMMED BACKDROP + FLOATING COVERING PANEL ─────────
            The dim is a soft cream→plum scrim (never dark glass). The panel
            floats above it with a heavy soft shadow + big top rounding, as if
            lifted off the page like the Control-Center sheet. */}
        <div style={{ position: "relative", padding: "4px 0 0" }}>
          {/* the soft dim — a warm wash, lighter at top, deepening down */}
          <div aria-hidden style={{
            position: "absolute", inset: 0,
            background:
              `linear-gradient(180deg, rgba(58,44,26,0) 0%, rgba(58,44,26,0.10) 40%, rgba(120,40,46,0.10) 100%)`,
            pointerEvents: "none",
          }} />

          {/* the covering, full-width rounded floating card */}
          <section style={{
            position: "relative",
            background: T.paper,
            borderTopLeftRadius: 30, borderTopRightRadius: 30,
            borderBottomLeftRadius: 22, borderBottomRightRadius: 22,
            border: `1px solid ${T.paperDeep}`,
            boxShadow: "0 -2px 0 rgba(255,253,247,0.7) inset, 0 22px 50px -26px rgba(33,26,18,0.55)",
            padding: "16px 14px 20px",
            transform: up ? "translateY(0)" : "translateY(18px)",
            opacity: up ? 1 : 0,
            transition: "transform .5s cubic-bezier(.2,.8,.2,1), opacity .5s ease",
          }}>
            {/* grab-handle — the lifted-sheet cue */}
            <div aria-hidden style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <span style={{ width: 40, height: 4, borderRadius: 999, background: T.paperDeep }} />
            </div>

            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "0 4px", marginBottom: 10 }}>
              <Eyebrow>Your rooms</Eyebrow>
              <span style={{ fontFamily: UI, fontSize: 9.5, color: T.muted, letterSpacing: 0.4 }}>
                swipe across · tap to enter
              </span>
            </div>

            {/* panel body: grid track (flex) + pinned right rail */}
            <div style={{ display: "flex", gap: 10 }}>
              {/* 2-COLUMN GRID as a horizontal scroll-snap track.
                  Each "column" is a flex item holding 2 stacked cards; the column
                  width is set so the NEXT column PEEKS (~22px) at the right edge. */}
              <div className="cc-track" style={{
                flex: 1, minWidth: 0,
                display: "grid", gridAutoFlow: "column",
                gridTemplateRows: "1fr 1fr",
                gridAutoColumns: "calc((100% - 12px) / 2 - 11px)", // 2 cols visible + peek of the 3rd
                gap: 12,
                overflowX: "auto", scrollSnapType: "x mandatory",
                paddingBottom: 6,
                scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
              }}>
                <style>{`.cc-track::-webkit-scrollbar{display:none}`}</style>
                {ROOMS.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    active={active === room.id}
                    onClick={() => setActive(room.id)}
                  />
                ))}
              </div>

              {/* RIGHT JUMP RAIL — pinned vertical quick-actions */}
              <JumpRail
                active={active}
                onJump={(id) => { if (id !== "home") setActive(id); }}
              />
            </div>

            {/* selected-room confirmation strip + crisis-safe framing */}
            <div style={{ marginTop: 14, padding: "0 4px" }}>
              <Rule mb={12} />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  width: 34, height: 34, borderRadius: 11, flex: "none",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: T.wax, border: `1px solid ${T.paperDeep}`,
                }}>
                  {(() => {
                    const R = ROOMS.find((r) => r.id === active);
                    const I = R ? R.icon : MessageCircleHeart;
                    return <I size={16} color={R ? R.accent : T.crimson} />;
                  })()}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, color: T.ink }}>
                    {ROOMS.find((r) => r.id === active)?.title}
                  </div>
                  <div style={{ fontFamily: UI, fontSize: 10, color: T.muted, letterSpacing: 0.3 }}>
                    Enter quietly — you're never on a clock here.
                  </div>
                </div>
                <ChevronRight size={18} color={T.muted} />
              </div>
            </div>

            {/* crisis-safe / peer-support-not-medical-advice line */}
            <div style={{
              margin: "16px 4px 0", display: "flex", gap: 9, alignItems: "flex-start",
              background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "11px 13px",
            }}>
              <ShieldCheck size={16} color={T.sage} style={{ flex: "none", marginTop: 1 }} />
              <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, lineHeight: 1.5 }}>
                {SAFE_LINE}
              </span>
            </div>
          </section>
        </div>

        {/* footer voice */}
        <footer style={{ textAlign: "center", padding: "24px 24px 0" }}>
          <Rule w={40} c={T.paperDeep} mb={12} />
          <div style={{ fontFamily: SERIF, fontSize: 13, color: T.muted, fontStyle: "italic" }}>
            {FOOTER_LINE}
          </div>
        </footer>
      </div>
    </div>
  );
}
