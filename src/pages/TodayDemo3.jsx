// TodayDemo3 — "Companion / garden-led home" (Today redesign, Direction 3)
// ────────────────────────────────────────────────────────────────────────────
// The strongest FemWell-native direction: you open your GARDEN and she greets
// you. The living companion bloom is the hero, large and centred, with a warm
// personality VOICE line. The day's focus is framed as gentle "tending" — care,
// never duty ("if you have a moment…"). A quiet month is celebrated as a RESTING
// SEASON, not a failure: the bloom never dies. Score-free, count-free,
// streak-free by design.
//
// Self-contained PREVIEW: useState + computeCycleDay ONLY. No base44, no
// entities, no network, no required props. A small "season" toggle shows the
// resting-season state. Brand-pure: Editorial T tokens, crimson the single pop,
// NO emoji, Lucide + inline SVG only.
import { useState } from "react";
import { ChevronRight, Sun, Moon } from "lucide-react";
import {
  T, SERIF, UI, Eyebrow, Script, Hand, InkFilter, useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";
import { computeCycleDay } from "@/hooks/useCycleDay";

const COL = 430;
const ME = { name: "Hannah" };

function isoDaysAgo(n) {
  const d = new Date(); d.setDate(d.getDate() - n); d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
function timeOfDay() {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
}

// Phase -> how the companion "feels" today (her voice mirrors the season).
const COMPANION_LINE = {
  menstrual:  "I've gone quiet too. Let's keep today soft.",
  follicular: "I can feel us waking up. Something's beginning.",
  ovulatory:  "I'm wide open today — bright and easy. So are you.",
  luteal:     "I'm turning inward, drawing the petals close. We can rest.",
};

// The companion bloom — petals, leaves, a gentle sway. In RESTING season she
// folds inward (a bud) but is unmistakably alive: the no-guilt promise.
function Companion({ resting, color = T.blush, size = 220 }) {
  const cx = size / 2;
  return (
    <svg width={size} height={size} viewBox="0 0 220 220" role="img"
      aria-label={resting ? "Your companion, resting" : "Your companion, in bloom"} style={{ flex: "none" }}>
      {/* soft halo */}
      <circle cx={cx} cy={92} r={70} fill={T.wax} opacity={0.5} />
      {/* stem + leaves */}
      <path d="M110 210 C 110 170 110 150 110 118" fill="none" stroke={T.sage} strokeWidth={4} strokeLinecap="round" />
      <path d="M110 172 C 90 168 78 152 74 138 C 92 138 106 150 110 168 Z" fill={T.sage} opacity={0.85} />
      <path d="M110 156 C 130 152 144 138 150 124 C 132 124 116 134 110 152 Z" fill={T.sage} opacity={0.7} />

      {resting ? (
        // a closed bud — alive, just gathered in
        <g transform="translate(110 92)">
          <path d="M0 -34 C 16 -30 18 -2 0 14 C -18 -2 -16 -30 0 -34 Z" fill={color} opacity={0.95} />
          <path d="M0 -30 C 8 -22 8 0 0 10 C -8 0 -8 -22 0 -30 Z" fill={T.crimson} opacity={0.55} />
        </g>
      ) : (
        // full bloom
        <g transform="translate(110 92)">
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse key={a} cx={0} cy={-30} rx={15} ry={32} fill={color} opacity={0.92} transform={`rotate(${a})`} />
          ))}
          <circle cx={0} cy={0} r={15} fill={T.gold} />
          <circle cx={0} cy={0} r={7} fill={T.crimson} opacity={0.7} />
        </g>
      )}
    </svg>
  );
}

export default function TodayDemo3() {
  useEditorialFonts();
  const [resting, setResting] = useState(false);
  const cd = computeCycleDay({ last_period_start_date: isoDaysAgo(21), cycle_avg_length: 28, period_length: 5 });
  const tod = timeOfDay();

  // "tending" — a single act of care, phrased as invitation, never duty.
  const tending = resting
    ? { title: "Nothing today.", blurb: "You've had a quiet stretch, and that's allowed. I'll keep the garden for you. Come back whenever you'd like.", cta: null, href: null }
    : { title: "If you have a moment", blurb: "A five-minute breath would do us both good in this autumn week. No need — only if it would feel kind.", cta: "Tend to us · 5 min", href: "/Lifestyle" };

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink }}>
      <InkFilter />
      <DemoRibbon n={3} name="Companion / garden-led home" />

      <div style={{ maxWidth: COL, margin: "0 auto", padding: "58px 22px 120px", textAlign: "center" }}>
        <Eyebrow color={T.muted}>Your garden · this {tod}</Eyebrow>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
          <Companion resting={resting} />
        </div>

        {/* she greets you, in her own voice */}
        <Script size={34} style={{ marginTop: -6 }}>Hello again, {ME.name}.</Script>
        <Hand size={19} color={T.inkSoft} style={{ marginTop: 10, maxWidth: 330, marginLeft: "auto", marginRight: "auto" }}>
          {resting
            ? "I've been resting while you were away. I'm still here — gardens like ours don't fade."
            : COMPANION_LINE[cd.phase]}
        </Hand>

        {/* tending — care, not a task */}
        <article style={{
          marginTop: 30, background: T.paperHi, border: `1px solid ${T.paperDeep}`,
          borderRadius: 18, padding: "20px 22px", textAlign: "left",
          boxShadow: "0 12px 30px rgba(58,48,32,0.09)", maxWidth: 360, marginLeft: "auto", marginRight: "auto",
        }}>
          <Eyebrow color={T.sage}>Tending</Eyebrow>
          <h1 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 25, lineHeight: 1.16, margin: "10px 0 0" }}>{tending.title}</h1>
          <p style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.5, color: T.inkSoft, margin: "10px 0 0" }}>{tending.blurb}</p>
          {tending.cta && (
            <a href={tending.href} style={{
              marginTop: 18, display: "inline-flex", alignItems: "center", gap: 8,
              background: T.ink, color: T.paper, textDecoration: "none",
              borderRadius: 999, padding: "10px 19px", fontFamily: UI, fontSize: 13, fontWeight: 700,
            }}>{tending.cta} <ChevronRight size={16} /></a>
          )}
        </article>

        {/* season toggle (demo) + quiet doorways */}
        <button onClick={() => setResting((v) => !v)} style={{
          marginTop: 22, display: "inline-flex", alignItems: "center", gap: 7,
          background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "7px 15px",
          fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: T.muted, cursor: "pointer",
        }}>
          {resting ? <Sun size={14} /> : <Moon size={14} />}
          {resting ? "Show a tending day" : "Show a resting season"}
        </button>

        <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 18 }}>
          {[{ label: "Wander the garden", to: "Garden" }, { label: "Write a line", to: "Journal" }].map((m) => (
            <a key={m.to} href={`/${m.to}`} style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, color: T.muted, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
              {m.label} <ChevronRight size={13} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function DemoRibbon({ n, name }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 9000,
      background: T.ink, color: T.paper, textAlign: "center",
      fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8,
      padding: "5px 10px", textTransform: "uppercase",
    }}>DEMO · Today direction {n} — {name}</div>
  );
}
