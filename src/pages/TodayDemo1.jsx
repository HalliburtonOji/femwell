// TodayDemo1 — "Calm single-focus hub" (Today redesign, Direction 1)
// ────────────────────────────────────────────────────────────────────────────
// The antidote to the current ~25-card Today. A STILL editorial page:
//   greeting + ONE qualitative phase line -> a SINGLE large focus card
//   (today's one thing) -> garden as a quiet footer -> EVERYTHING ELSE behind a
//   subtle "more" disclosure. The page enforces one-main-thing: at rest you see
//   exactly one decision. No scores, no streaks, no counts, no "you missed".
//
// Self-contained PREVIEW: useState/useEffect + computeCycleDay ONLY. No base44,
// no entities, no network, no required props. Mock profile -> real phase math so
// the phase line reads true. Brand-pure: Editorial T tokens, crimson the single
// pop, NO emoji, Lucide + inline SVG only.
import { useState } from "react";
import { ChevronRight, ChevronDown, Wind, BookOpen, Salad, Heart as HeartIcon } from "lucide-react";
import {
  T, SERIF, UI, Eyebrow, Rule, Script, Hand, InkFilter, useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";
import { computeCycleDay } from "@/hooks/useCycleDay";

const COL = 430;

// ── mock "me" + a real cycle position (day ~22 -> luteal / inner autumn) ───────
const ME = { name: "Hannah" };
const MOCK_PROFILE = {
  last_period_start_date: isoDaysAgo(21),
  cycle_avg_length: 28,
  period_length: 5,
  life_stage: "reproductive",
};
function isoDaysAgo(n) {
  const d = new Date(); d.setDate(d.getDate() - n); d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

// One warm qualitative line per phase — NEVER a number-first read.
const PHASE_LINE = {
  menstrual:  "A resting week. Less is exactly enough.",
  follicular: "Energy is gathering. Begin gently.",
  ovulatory:  "You're at your most open today. Say the thing.",
  luteal:     "Inner autumn — boundaries feel natural now.",
};
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
function todayLabel() {
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
}

// ── the quiet garden footer — a single living bloom that never dies ──────────
function GardenBloom({ size = 70 }) {
  const cx = size / 2;
  return (
    <svg width={size} height={size} viewBox="0 0 70 70" role="img" aria-label="Your garden companion, in bloom" style={{ flex: "none" }}>
      <line x1={cx} y1={68} x2={cx} y2={38} stroke={T.sage} strokeWidth={2.4} strokeLinecap="round" />
      <path d={`M ${cx} 50 q -10 -4 -15 -12`} fill="none" stroke={T.sage} strokeWidth={2} strokeLinecap="round" />
      <path d={`M ${cx} 46 q 11 -3 16 -11`} fill="none" stroke={T.sage} strokeWidth={2} strokeLinecap="round" />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={cx} cy={20} rx={6.5} ry={12} fill={T.blush} opacity={0.92}
          transform={`rotate(${a} ${cx} 30)`} />
      ))}
      <circle cx={cx} cy={30} r={6} fill={T.gold} />
    </svg>
  );
}

function FocusIcon({ kind }) {
  const props = { size: 22, strokeWidth: 1.6, color: T.crimson };
  if (kind === "breath") return <Wind {...props} />;
  if (kind === "read") return <BookOpen {...props} />;
  return <Salad {...props} />;
}

export default function TodayDemo1() {
  useEditorialFonts();
  const [open, setOpen] = useState(false);
  const cd = computeCycleDay(MOCK_PROFILE);

  // The ONE thing chosen for today (phase-aware; here: luteal -> a winding-down ritual).
  const focus = {
    kind: "breath",
    eyebrow: "Your one thing today",
    title: "A five-minute settle",
    blurb: "In luteal your nervous system asks for less input. Before the day picks up, one short breath practice to take the edge off.",
    cta: "Begin · 5 min",
    href: "/Lifestyle",
  };

  // Everything else — present but DEMOTED behind disclosure. No duplication of
  // owning pages: each is a doorway, not a copy.
  const more = [
    { icon: BookOpen, label: "Today's reflection prompt", to: "Journal" },
    { icon: Salad, label: "What suits you to eat this week", to: "Nutrition" },
    { icon: HeartIcon, label: "A note from the community", to: "Community" },
  ];

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink }}>
      <InkFilter />
      <DemoRibbon n={1} name="Calm single-focus hub" />

      <div style={{ maxWidth: COL, margin: "0 auto", padding: "62px 22px 120px" }}>
        {/* greeting + orient */}
        <Eyebrow color={T.muted}>{todayLabel()}</Eyebrow>
        <Script size={42} style={{ marginTop: 6 }}>{greeting()}, {ME.name}.</Script>
        <Hand size={19} color={T.inkSoft} style={{ marginTop: 8 }}>
          {PHASE_LINE[cd.phase]}
        </Hand>

        <Rule mt={26} mb={0} c={T.paperDeep} />

        {/* THE single focus card — the one decision on the page */}
        <article style={{
          marginTop: 26, background: T.paperHi, border: `1px solid ${T.paperDeep}`,
          borderRadius: 18, padding: "22px 22px 20px",
          boxShadow: "0 14px 34px rgba(58,48,32,0.10)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              width: 40, height: 40, borderRadius: 999, display: "grid", placeItems: "center",
              background: T.wax, border: `1px solid ${T.paperDeep}`,
            }}>
              <FocusIcon kind={focus.kind} />
            </span>
            <Eyebrow color={T.crimson}>{focus.eyebrow}</Eyebrow>
          </div>

          <h1 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 30, lineHeight: 1.12, margin: "16px 0 0", color: T.ink }}>
            {focus.title}
          </h1>
          <p style={{ fontFamily: SERIF, fontSize: 16.5, lineHeight: 1.5, color: T.inkSoft, margin: "12px 0 0" }}>
            {focus.blurb}
          </p>

          <a href={focus.href} style={{
            marginTop: 20, display: "inline-flex", alignItems: "center", gap: 8,
            background: T.ink, color: T.paper, textDecoration: "none",
            borderRadius: 999, padding: "11px 20px", fontFamily: UI, fontSize: 13.5, fontWeight: 700, letterSpacing: 0.3,
          }}>
            {focus.cta} <ChevronRight size={16} />
          </a>
        </article>

        {/* subtle "more" disclosure — closed by default; the page stays one-thing at rest */}
        <button onClick={() => setOpen((v) => !v)} style={{
          marginTop: 22, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          background: "transparent", border: "none", cursor: "pointer",
          fontFamily: UI, fontSize: 11.5, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: T.muted,
        }}>
          {open ? "Less" : "A little more, if you'd like"}
          <ChevronDown size={15} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
        </button>

        {open && (
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 1, borderRadius: 14, overflow: "hidden", border: `1px solid ${T.paperDeep}` }}>
            {more.map((m) => {
              const Icon = m.icon;
              return (
                <a key={m.label} href={`/${m.to}`} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "15px 16px",
                  background: T.paperHi, textDecoration: "none", color: T.ink,
                }}>
                  <Icon size={18} strokeWidth={1.6} color={T.muted} />
                  <span style={{ flex: 1, fontFamily: SERIF, fontSize: 16, color: T.inkSoft }}>{m.label}</span>
                  <ChevronRight size={16} color={T.muted} />
                </a>
              );
            })}
          </div>
        )}

        {/* quiet garden footer — the no-guilt emotional hero, present but never demanding */}
        <div style={{ marginTop: 46, display: "flex", alignItems: "center", gap: 16, opacity: 0.96 }}>
          <GardenBloom />
          <div>
            <Eyebrow color={T.sage} mb={3}>Your garden</Eyebrow>
            <Hand size={17} color={T.inkSoft}>In bloom. She's been keeping you company.</Hand>
            <a href="/Garden" style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.4, color: T.muted, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6 }}>
              Visit the garden <ChevronRight size={13} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── shared dev ribbon ─────────────────────────────────────────────────────────
function DemoRibbon({ n, name }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 9000,
      background: T.ink, color: T.paper, textAlign: "center",
      fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8,
      padding: "5px 10px", textTransform: "uppercase",
    }}>
      DEMO · Today direction {n} — {name}
    </div>
  );
}
