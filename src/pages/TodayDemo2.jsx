// TodayDemo2 — "Cycle-led day" (Today redesign, Direction 2)
// ────────────────────────────────────────────────────────────────────────────
// The day IS the cycle. A phase ARC/RING hero anchors the page: cycle day +
// a qualitative SEASON ("Inner Autumn · Day 22 — boundaries feel natural"),
// and the focus card below is chosen BY phase. A small life-stage switcher
// shows how a NON-cycling stage (menopause / pregnancy) reskins the same spine:
// the ring becomes a gentle progress/era arc, the season becomes a stage line,
// the focus stays phase/stage-appropriate. No-guilt: the ring is orientation,
// never a score or a goal to "complete".
//
// Self-contained PREVIEW: useState + computeCycleDay ONLY. No base44, no
// entities, no network, no required props. Brand-pure: Editorial T tokens,
// crimson the single pop, NO emoji, Lucide + inline SVG only.
import { useState } from "react";
import { ChevronRight, Moon, Salad, Wind, BookOpen } from "lucide-react";
import {
  T, SERIF, UI, Eyebrow, Rule, Script, Hand, InkFilter, useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";
import { computeCycleDay } from "@/hooks/useCycleDay";

const COL = 430;
const ME = { name: "Hannah" };

function isoDaysAgo(n) {
  const d = new Date(); d.setDate(d.getDate() - n); d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

// Each cycling phase -> a season name, a one-line qualitative read, an arc colour,
// and the focus the day leads with.
const PHASE = {
  menstrual:  { season: "Inner Winter",  line: "Rest is the work. Less is enough.",            color: T.crimson,
                focus: { icon: Moon, eyebrow: "Winter suits", title: "Permission to do less", blurb: "Your body is doing quiet, heavy work. One warm, unhurried thing — then nothing else is owed.", cta: "A grounding practice", href: "/Lifestyle" } },
  follicular: { season: "Inner Spring",  line: "Energy is rising. A good day to begin.",        color: T.sage,
                focus: { icon: BookOpen, eyebrow: "Spring suits", title: "Pick up something new", blurb: "Follicular energy loves a fresh start. A short reflection on what you'd like to grow this cycle.", cta: "Open today's prompt", href: "/Journal" } },
  ovulatory:  { season: "Inner Summer",  line: "You're at your most open. Say the thing.",      color: T.gold,
                focus: { icon: Salad, eyebrow: "Summer suits", title: "Eat for the peak", blurb: "Appetite and energy are high. A bright, protein-forward plate keeps the afternoon steady.", cta: "What suits you today", href: "/Nutrition" } },
  luteal:     { season: "Inner Autumn",  line: "Boundaries feel natural now. Honour them.",     color: T.blush,
                focus: { icon: Wind, eyebrow: "Autumn suits", title: "A five-minute settle", blurb: "Luteal asks for less input. One short breath practice to take the edge off before the day picks up.", cta: "Begin · 5 min", href: "/Lifestyle" } },
};

// Life-stage spine variants — the SAME ring/season/focus structure, reskinned.
const STAGES = {
  reproductive: { label: "Cycling", build: () => {
    const cd = computeCycleDay({ last_period_start_date: isoDaysAgo(21), cycle_avg_length: 28, period_length: 5 });
    const p = PHASE[cd.phase];
    return { ringFrac: cd.cycleDay / cd.cycleLen, ringColor: p.color,
      season: p.season, dayLabel: `Day ${cd.cycleDay}`, line: p.line, focus: p.focus,
      ringCaption: `${cd.cycleDay} of ${cd.cycleLen}` };
  }},
  menopause: { label: "Menopause", build: () => ({
    ringFrac: 0.62, ringColor: T.gold, season: "A steadier season", dayLabel: "No two days alike",
    line: "Symptoms ebb and flow — today, meet yourself where you are.",
    ringCaption: "This season",
    focus: { icon: Wind, eyebrow: "What suits today", title: "Cooling and calm", blurb: "If sleep was broken, the day can feel frayed. A short downshift practice, and a lighter plan than yesterday.", cta: "A grounding practice", href: "/Lifestyle" },
  })},
  pregnant: { label: "Pregnancy", build: () => ({
    ringFrac: 0.55, ringColor: T.sage, season: "Second trimester", dayLabel: "Week 22",
    line: "The settling weeks — energy often returns. Use it gently.",
    ringCaption: "Week 22 of 40",
    focus: { icon: Salad, eyebrow: "What suits today", title: "Iron-friendly plate", blurb: "Around now, iron and steady energy matter most. A simple plate that's kind to digestion.", cta: "What suits you today", href: "/Nutrition" },
  })},
};

function PhaseRing({ frac, color, size = 188 }) {
  const cx = size / 2, r = size / 2 - 12, c = 2 * Math.PI * r;
  const f = Math.max(0.04, Math.min(0.99, frac));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Where you are in your cycle today" style={{ flex: "none" }}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={T.paperDeep} strokeWidth={9} />
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - f)} transform={`rotate(-90 ${cx} ${cx})`} />
      {/* the marker bead */}
      <circle
        cx={cx + r * Math.cos(2 * Math.PI * f - Math.PI / 2)}
        cy={cx + r * Math.sin(2 * Math.PI * f - Math.PI / 2)}
        r={6} fill={T.paper} stroke={color} strokeWidth={3} />
    </svg>
  );
}

export default function TodayDemo2() {
  useEditorialFonts();
  const [stageKey, setStageKey] = useState("reproductive");
  const s = STAGES[stageKey].build();
  const Icon = s.focus.icon;

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink }}>
      <InkFilter />
      <DemoRibbon n={2} name="Cycle-led day" />

      <div style={{ maxWidth: COL, margin: "0 auto", padding: "60px 22px 120px" }}>
        <Eyebrow color={T.muted}>{greeting()}, {ME.name}</Eyebrow>

        {/* spine switcher — shows non-cycling stages reskin the same hero */}
        <div style={{ display: "flex", gap: 7, marginTop: 12, flexWrap: "wrap" }}>
          {Object.entries(STAGES).map(([k, v]) => (
            <button key={k} onClick={() => setStageKey(k)} style={{
              background: k === stageKey ? T.ink : "transparent", color: k === stageKey ? T.paper : T.muted,
              border: `1px solid ${k === stageKey ? T.ink : T.paperDeep}`, borderRadius: 999, padding: "5px 13px",
              fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", cursor: "pointer",
            }}>{v.label}</button>
          ))}
        </div>

        {/* the ring hero */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 26, position: "relative" }}>
          <div style={{ position: "relative", width: 188, height: 188 }}>
            <PhaseRing frac={s.ringFrac} color={s.ringColor} />
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: T.muted }}>
                {s.dayLabel}
              </div>
              <Script size={26} style={{ marginTop: 4 }}>{s.season}</Script>
              <div style={{ fontFamily: UI, fontSize: 10, color: T.muted, marginTop: 4 }}>{s.ringCaption}</div>
            </div>
          </div>
          <Hand size={18.5} color={T.inkSoft} style={{ textAlign: "center", marginTop: 16, maxWidth: 320 }}>
            {s.line}
          </Hand>
        </div>

        <Rule mt={28} mb={0} c={T.paperDeep} />

        {/* the focus, chosen BY phase/stage */}
        <article style={{
          marginTop: 24, background: T.paperHi, border: `1px solid ${T.paperDeep}`,
          borderRadius: 18, padding: "20px 20px 18px", boxShadow: "0 12px 30px rgba(58,48,32,0.09)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 38, height: 38, borderRadius: 999, display: "grid", placeItems: "center", background: T.wax, border: `1px solid ${T.paperDeep}` }}>
              <Icon size={20} strokeWidth={1.6} color={s.ringColor === T.blush ? T.crimson : s.ringColor} />
            </span>
            <Eyebrow color={T.muted}>{s.focus.eyebrow}</Eyebrow>
          </div>
          <h1 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 27, lineHeight: 1.14, margin: "14px 0 0" }}>{s.focus.title}</h1>
          <p style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.5, color: T.inkSoft, margin: "10px 0 0" }}>{s.focus.blurb}</p>
          <a href={s.focus.href} style={{
            marginTop: 18, display: "inline-flex", alignItems: "center", gap: 8,
            background: T.ink, color: T.paper, textDecoration: "none",
            borderRadius: 999, padding: "10px 19px", fontFamily: UI, fontSize: 13, fontWeight: 700,
          }}>{s.focus.cta} <ChevronRight size={16} /></a>
        </article>

        {/* deep-links to the owning pages — doorways, no duplication */}
        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 1, borderRadius: 14, overflow: "hidden", border: `1px solid ${T.paperDeep}` }}>
          {[
            { label: "See the whole cycle", to: "Insights" },
            { label: "Your garden", to: "Garden" },
          ].map((m) => (
            <a key={m.to} href={`/${m.to}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: T.paperHi, textDecoration: "none", color: T.ink }}>
              <span style={{ flex: 1, fontFamily: SERIF, fontSize: 16, color: T.inkSoft }}>{m.label}</span>
              <ChevronRight size={16} color={T.muted} />
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
