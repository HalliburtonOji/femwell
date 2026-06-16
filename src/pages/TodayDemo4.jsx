// TodayDemo4 — "Card-slider / deck home" (Today redesign, Direction 4)
// ────────────────────────────────────────────────────────────────────────────
// A small SWIPEABLE DECK of today's cards — not a long scroll. The TOP card is
// always the focus (today's one thing); the next card PEEKs at the right edge so
// the lateral gesture is obvious. Reuses the existing Hero-Card-Slider visual
// language (≈85vw cards, peek + dot rail, one clear action per card) so Today
// reads as ONE system with the Nutrition / hub pages. Depth is lateral, not
// vertical. Deck is intentionally short (4 cards): a focus + 2–3 chosen things,
// each a doorway to its owning page — never a duplicate. No scores / streaks /
// counts.
//
// Self-contained PREVIEW: useState/useRef + computeCycleDay ONLY. No base44, no
// entities, no network, no required props. Brand-pure: Editorial T tokens,
// crimson the single pop, NO emoji, Lucide + inline SVG only.
import { useState, useRef } from "react";
import { ChevronRight, ChevronLeft, Wind, BookOpen, Salad, Heart as HeartIcon } from "lucide-react";
import {
  T, SERIF, UI, Eyebrow, Script, Hand, InkFilter, useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";
import { computeCycleDay } from "@/hooks/useCycleDay";

const COL = 430;
const CARD_W = 326;   // ~85vw at 390px — next card peeks
const GAP = 14;
const ME = { name: "Hannah" };

function isoDaysAgo(n) {
  const d = new Date(); d.setDate(d.getDate() - n); d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}
const PHASE_LINE = {
  menstrual: "A resting week — less is enough.",
  follicular: "Energy is gathering. Begin gently.",
  ovulatory: "You're at your most open today.",
  luteal: "Inner autumn — boundaries feel natural.",
};

// tiny garden bloom for the footer card
function GardenBloom({ size = 56 }) {
  const cx = size / 2;
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" role="img" aria-label="Your garden, in bloom" style={{ flex: "none" }}>
      <line x1={cx} y1={54} x2={cx} y2={30} stroke={T.sage} strokeWidth={2} strokeLinecap="round" />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={cx} cy={16} rx={5} ry={9.5} fill={T.blush} opacity={0.92} transform={`rotate(${a} ${cx} 24)`} />
      ))}
      <circle cx={cx} cy={24} r={5} fill={T.gold} />
    </svg>
  );
}

export default function TodayDemo4() {
  useEditorialFonts();
  const cd = computeCycleDay({ last_period_start_date: isoDaysAgo(21), cycle_avg_length: 28, period_length: 5 });
  const trackRef = useRef(null);
  const [idx, setIdx] = useState(0);

  // The deck: index 0 is ALWAYS the focus. The rest are chosen doorways.
  const cards = [
    {
      kind: "focus", accent: T.crimson, icon: Wind, eyebrow: "Today's focus",
      title: "A five-minute settle",
      blurb: "In luteal your nervous system asks for less input. One short breath practice before the day picks up.",
      cta: "Begin · 5 min", href: "/Lifestyle",
    },
    {
      kind: "card", accent: T.blush, icon: BookOpen, eyebrow: "Journal",
      title: "Today's prompt", blurb: "\"What would feel like enough today?\" One line is plenty.",
      cta: "Open the prompt", href: "/Journal",
    },
    {
      kind: "card", accent: T.sage, icon: Salad, eyebrow: "Nutrition",
      title: "What suits this week", blurb: "Magnesium-friendly plates ease the luteal edge. A simple idea for tonight.",
      cta: "See what suits you", href: "/Nutrition",
    },
    {
      kind: "garden", accent: T.gold, icon: HeartIcon, eyebrow: "Your garden",
      title: "In bloom", blurb: "She's been keeping you company. A quiet visit, whenever you'd like.",
      cta: "Visit the garden", href: "/Garden",
    },
  ];

  const go = (next) => {
    const n = Math.max(0, Math.min(cards.length - 1, next));
    setIdx(n);
    const el = trackRef.current;
    if (el) el.scrollTo({ left: n * (CARD_W + GAP), behavior: "smooth" });
  };
  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setIdx(Math.round(el.scrollLeft / (CARD_W + GAP)));
  };

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink }}>
      <InkFilter />
      <DemoRibbon n={4} name="Card-slider / deck home" />

      <div style={{ maxWidth: COL, margin: "0 auto", padding: "60px 0 120px" }}>
        <div style={{ padding: "0 22px" }}>
          <Eyebrow color={T.muted}>{greeting()}, {ME.name}</Eyebrow>
          <Hand size={18.5} color={T.inkSoft} style={{ marginTop: 6 }}>{PHASE_LINE[cd.phase]}</Hand>
        </div>

        {/* the deck — horizontal, snap, peeking next card */}
        <div
          ref={trackRef}
          onScroll={onScroll}
          style={{
            marginTop: 22, display: "flex", gap: GAP, overflowX: "auto",
            scrollSnapType: "x mandatory", padding: "4px 22px 8px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {cards.map((c, i) => {
            const Icon = c.icon;
            const isFocus = c.kind === "focus";
            return (
              <article key={i} style={{
                flex: "none", width: CARD_W, scrollSnapAlign: "start",
                background: isFocus ? T.dusk : T.paperHi,
                color: isFocus ? T.paper : T.ink,
                border: `1px solid ${isFocus ? "transparent" : T.paperDeep}`,
                borderTop: `4px solid ${c.accent}`,
                borderRadius: 18, padding: "20px 20px 18px",
                minHeight: 286, display: "flex", flexDirection: "column",
                boxShadow: "0 14px 32px rgba(58,48,32,0.11)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{
                    width: 36, height: 36, borderRadius: 999, display: "grid", placeItems: "center",
                    background: isFocus ? "rgba(255,255,255,0.08)" : T.wax,
                    border: `1px solid ${isFocus ? "rgba(255,255,255,0.14)" : T.paperDeep}`,
                  }}>
                    {c.kind === "garden"
                      ? <GardenBloom size={28} />
                      : <Icon size={19} strokeWidth={1.6} color={isFocus ? c.accent : c.accent} />}
                  </span>
                  <span style={{ fontFamily: UI, fontSize: 10, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: isFocus ? c.accent : T.muted }}>
                    {c.eyebrow}
                  </span>
                </div>

                <h2 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 25, lineHeight: 1.14, margin: "16px 0 0", color: isFocus ? T.paper : T.ink }}>
                  {c.title}
                </h2>
                <p style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.5, margin: "10px 0 0", color: isFocus ? "rgba(244,237,219,0.84)" : T.inkSoft, flex: 1 }}>
                  {c.blurb}
                </p>

                <a href={c.href} style={{
                  marginTop: 16, display: "inline-flex", alignItems: "center", gap: 7, alignSelf: "flex-start",
                  background: isFocus ? T.paper : T.ink, color: isFocus ? T.ink : T.paper, textDecoration: "none",
                  borderRadius: 999, padding: "9px 17px", fontFamily: UI, fontSize: 12.5, fontWeight: 700,
                }}>{c.cta} <ChevronRight size={15} /></a>
              </article>
            );
          })}
          {/* trailing spacer so the last card can snap fully into view */}
          <div style={{ flex: "none", width: COL - CARD_W - 22 - GAP }} aria-hidden="true" />
        </div>

        {/* dot rail + arrows — the slider chrome shared with the hubs */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 10 }}>
          <button onClick={() => go(idx - 1)} disabled={idx === 0} aria-label="Previous card" style={{
            background: "transparent", border: "none", cursor: idx === 0 ? "default" : "pointer", opacity: idx === 0 ? 0.3 : 1, padding: 4,
          }}><ChevronLeft size={18} color={T.muted} /></button>
          <div style={{ display: "flex", gap: 7 }}>
            {cards.map((_, i) => (
              <span key={i} style={{
                width: i === idx ? 18 : 7, height: 7, borderRadius: 999,
                background: i === idx ? T.ink : T.paperDeep, transition: "width .2s",
              }} />
            ))}
          </div>
          <button onClick={() => go(idx + 1)} disabled={idx === cards.length - 1} aria-label="Next card" style={{
            background: "transparent", border: "none", cursor: idx === cards.length - 1 ? "default" : "pointer", opacity: idx === cards.length - 1 ? 0.3 : 1, padding: 4,
          }}><ChevronRight size={18} color={T.muted} /></button>
        </div>

        <div style={{ textAlign: "center", marginTop: 6 }}>
          <Script size={20} color={T.muted}>swipe through your day</Script>
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
