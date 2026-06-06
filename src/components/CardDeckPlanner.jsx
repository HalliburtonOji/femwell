// ─────────────────────────────────────────────────────────────────────────────
// CardDeckPlanner — Demo D of the "Combined Today+Cycle" exploration.
//
// Hypothesis: instead of a vertical scroll, render the whole Planner as a
// swipeable horizontal deck of 8 full-width cards. Each card is one topic —
// the page is breath-paced, one thing at a time.
//
// Eight cards in order:
//   1. Today's mood (Jess insight)
//   2. Body summary (6 pillars)
//   3. Morning stack (3 rituals)
//   4. Smart View (right now state)
//   5. Ritual bundle for today
//   6. Cycle ribbon (May 2026)
//   7. Week ahead capacity strip
//   8. Tonight + shutdown
//
// Navigation: scroll-snap horizontal track, dot pagination at the bottom,
// arrow buttons left/right, and a thin progress bar across the top of the
// deck. Tab labels appear above the deck so the user can jump.
//
// Mock = Sat 16 May 2026 · Luteal Day 22 (same dataset as the other demos).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import {
  Sparkles, Heart, Zap, Droplets, Footprints, CircleDot, Moon, Sun,
  Repeat, TrendingUp, Calendar, BedDouble, ChevronLeft, ChevronRight,
  Pill,
} from "lucide-react";

const T = {
  cream:    "#F4EDDB",
  paper:    "#FBF6E6",
  paperHi:  "#F4EFE3",
  espresso: "#3A2C1A",
  plum:     "#4A2A3A",
  plumSoft: "#6B4559",
  plumMute: "#8A7584",
  blush:    "#E8B4B8",
  blushSoft:"rgba(232,180,184,0.18)",
  sage:     "#8FAF8F",
  sageSoft: "rgba(143,175,143,0.18)",
  gold:     "#D4AF37",
  goldDeep: "#A6862B",
  goldSoft: "rgba(212,175,55,0.18)",
  rose:     "#D45E52",
  muted:    "#9B8B7A",
  menstrual: "#9A2845",
  follicular:"#D4745A",
  ovulatory: "#C8A040",
  luteal:    "#7B5E9A",
};
const PHASE_TINT = {
  menstrual: T.menstrual,
  follicular: T.follicular,
  ovulatory: T.ovulatory,
  luteal: T.luteal,
};

const MOCK = {
  hero: {
    title: "A softer landing this week",
    body: "Luteal days often invite a different pace — depth over breadth, careful over many. The body's narrowing for a reason.",
  },
  body: [
    { Icon: Moon,       label: "Sleep",     value: "7.2h",  tone: T.plum },
    { Icon: Zap,        label: "Energy",    value: "68%",   tone: T.goldDeep },
    { Icon: Heart,      label: "Mood",      value: "60%",   tone: T.rose },
    { Icon: Droplets,   label: "Hydration", value: "6/8",   tone: "#60B4FA" },
    { Icon: Footprints, label: "Movement",  value: "20m",   tone: T.sage },
    { Icon: CircleDot,  label: "Cycle",     value: "Day 22",tone: T.menstrual },
  ],
  morningStack: [
    { name: "Drink water",      done: true },
    { name: "Morning walk",     done: true },
    { name: "5-minute reading", done: false },
  ],
  smartView: {
    state: "STUCK",
    title: "Inner reflection and release",
    body: "Even one ritual logged shifts the day. Anchor first, the rest follows.",
    chips: ["finishing edits", "reflection", "warming meals", "journaling", "saying no"],
  },
  bundle: {
    title: "Settle",
    sub: "Soft edges, honest hours",
    accent: T.luteal,
    rituals: ["Journal · 5m", "Magnesium at dinner", "Wind-down walk", "Bath + book before bed"],
  },
  cycle: { day: 22, len: 28, daysToPeriod: 6, confidence: 84 },
  monthWeeks: buildMonthWeeks(),
  weekAhead: [
    { day: "MON", date: 18, phase: "luteal",    cap: 0.55, hint: "Slower tasks" },
    { day: "TUE", date: 19, phase: "luteal",    cap: 0.5,  hint: "Anchor early" },
    { day: "WED", date: 20, phase: "luteal",    cap: 0.45, hint: "Edit, don't write" },
    { day: "THU", date: 21, phase: "luteal",    cap: 0.4,  hint: "Soft tasks" },
    { day: "FRI", date: 22, phase: "menstrual", cap: 0.3,  hint: "Period predicted" },
    { day: "SAT", date: 23, phase: "menstrual", cap: 0.3,  hint: "Rest weekend" },
    { day: "SUN", date: 24, phase: "menstrual", cap: 0.35, hint: "Slow start" },
  ],
  tonight: {
    title: "A soft landing",
    body: "Lights down, screens away, water by the bed.",
  },
  shutdown: [
    "Close every open tab.",
    "Write tomorrow's one anchor on paper.",
    "Stand up and stretch for thirty seconds.",
  ],
  meds: [{ name: "Estradiol patch · 50mcg", time: "21:00 · tonight" }],
};

function buildMonthWeeks() {
  return [
    [{d:27,off:1,p:"menstrual"},{d:28,off:1,p:"menstrual"},{d:29,off:1,p:"menstrual"},{d:30,off:1,p:"follicular"},{d:1,p:"follicular"},{d:2,p:"follicular"},{d:3,p:"follicular"}],
    [{d:4,p:"follicular"},{d:5,p:"follicular"},{d:6,p:"follicular"},{d:7,p:"ovulatory"},{d:8,p:"ovulatory"},{d:9,p:"ovulatory"},{d:10,p:"luteal"}],
    [{d:11,p:"luteal"},{d:12,p:"luteal"},{d:13,p:"luteal"},{d:14,p:"luteal"},{d:15,p:"luteal"},{d:16,p:"luteal",today:1},{d:17,p:"luteal"}],
    [{d:18,p:"luteal"},{d:19,p:"luteal"},{d:20,p:"luteal"},{d:21,p:"luteal"},{d:22,p:"menstrual",pred:1},{d:23,p:"menstrual",pred:1},{d:24,p:"menstrual",pred:1}],
    [{d:25,p:"menstrual",pred:1},{d:26,p:"menstrual",pred:1},{d:27,p:"follicular",pred:1},{d:28,p:"follicular",pred:1},{d:29,p:"follicular",pred:1},{d:30,p:"follicular",pred:1},{d:31,p:"follicular",pred:1}],
  ];
}

const CARDS = [
  { id: "mood",     label: "Today",    short: "Today",    Icon: Sparkles,  accent: T.gold,    eyebrow: "TODAY · FROM JESS" },
  { id: "body",     label: "Body",     short: "Body",     Icon: Heart,     accent: T.plum,    eyebrow: "6 PILLARS · NOW" },
  { id: "morning",  label: "Morning",  short: "Morning",  Icon: Sun,       accent: T.gold,    eyebrow: "MORNING STACK" },
  { id: "smart",    label: "Right now",short: "Right now",Icon: TrendingUp,accent: T.luteal,  eyebrow: "SMART VIEW" },
  { id: "bundle",   label: "Bundle",   short: "Bundle",   Icon: Repeat,    accent: T.luteal,  eyebrow: "RITUAL BUNDLE · LUTEAL" },
  { id: "ribbon",   label: "Cycle",    short: "Cycle",    Icon: Calendar,  accent: T.luteal,  eyebrow: "CYCLE RIBBON · MAY 2026" },
  { id: "week",     label: "Week",     short: "Week",     Icon: TrendingUp,accent: T.follicular, eyebrow: "WEEK AHEAD · CAPACITY" },
  { id: "evening",  label: "Evening",  short: "Evening",  Icon: BedDouble, accent: T.plumSoft,eyebrow: "TONIGHT · WIND-DOWN" },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function CardDeckPlanner() {
  const trackRef = useRef(null);
  const cardRefs = useRef({});
  const [activeIdx, setActiveIdx] = useState(0);

  // Track which card is centered using IntersectionObserver against the track.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const track = trackRef.current;
    if (!track) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.55) {
            const idx = Number(e.target.dataset.idx);
            setActiveIdx(idx);
          }
        });
      },
      { root: track, threshold: [0.55, 0.7, 0.9] }
    );
    Object.values(cardRefs.current).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  function go(delta) {
    const next = Math.max(0, Math.min(CARDS.length - 1, activeIdx + delta));
    jumpTo(next);
  }
  function jumpTo(idx) {
    const el = cardRefs.current[idx];
    if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  const progress = ((activeIdx + 1) / CARDS.length) * 100;

  return (
    <div style={shellStyle}>
      <header style={headStyle}>
        <p style={eyebrowStyle}>SATURDAY 16 MAY · LUTEAL DAY 22</p>
        <h1 style={pageTitleStyle}>Eight cards, one thing at a time.</h1>
        <p style={subStyle}>
          Swipe horizontally or use the arrows. The deck breathes — only one
          card has your attention at a time.
        </p>
      </header>

      {/* Tab strip — small, lets jumps */}
      <div style={tabStripWrap}>
        <div style={tabStripStyle} role="tablist" aria-label="Card deck tabs">
          {CARDS.map((c, i) => {
            const isActive = i === activeIdx;
            return (
              <button
                key={c.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => jumpTo(i)}
                style={{
                  ...tabBtn,
                  background: isActive ? T.espresso : "transparent",
                  color: isActive ? T.cream : T.plumSoft,
                  borderColor: isActive ? T.espresso : "rgba(58,44,26,0.15)",
                }}
              >
                <c.Icon size={11} style={{ marginRight: 4, verticalAlign: -1 }} />
                {c.short}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div style={progressTrackStyle} role="progressbar" aria-valuenow={progress}>
        <span style={{ ...progressBarStyle, width: `${progress}%` }} />
      </div>

      {/* Deck */}
      <div style={deckWrapStyle}>
        <button
          onClick={() => go(-1)}
          disabled={activeIdx === 0}
          style={{
            ...arrowBtn,
            left: 4,
            opacity: activeIdx === 0 ? 0.35 : 1,
            cursor: activeIdx === 0 ? "not-allowed" : "pointer",
          }}
          aria-label="Previous card"
        >
          <ChevronLeft size={18} />
        </button>

        <div ref={trackRef} style={trackStyle}>
          {CARDS.map((c, i) => (
            <div
              key={c.id}
              ref={(el) => (cardRefs.current[i] = el)}
              data-idx={i}
              style={{
                ...cardSlotStyle,
                transform: i === activeIdx ? "scale(1)" : "scale(0.97)",
                opacity: i === activeIdx ? 1 : 0.85,
              }}
              aria-label={`Card ${i + 1} of ${CARDS.length}: ${c.label}`}
            >
              <CardShell card={c} idx={i}>
                {renderCardBody(c.id)}
              </CardShell>
            </div>
          ))}
        </div>

        <button
          onClick={() => go(1)}
          disabled={activeIdx === CARDS.length - 1}
          style={{
            ...arrowBtn,
            right: 4,
            opacity: activeIdx === CARDS.length - 1 ? 0.35 : 1,
            cursor: activeIdx === CARDS.length - 1 ? "not-allowed" : "pointer",
          }}
          aria-label="Next card"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Dot pagination */}
      <div style={dotRowStyle}>
        {CARDS.map((_, i) => (
          <button
            key={i}
            onClick={() => jumpTo(i)}
            style={{
              ...dotStyle,
              background: i === activeIdx ? T.espresso : "rgba(58,44,26,0.20)",
              transform: i === activeIdx ? "scale(1.3)" : "scale(1)",
            }}
            aria-label={`Go to card ${i + 1}`}
          />
        ))}
      </div>

      <p style={countLineStyle}>
        Card <b>{activeIdx + 1}</b> of {CARDS.length} · <span style={{ color: CARDS[activeIdx].accent }}>{CARDS[activeIdx].label}</span>
      </p>

      <footer style={footStyle}>
        <span style={footEyebrowStyle}>DEMO D · THE CARD DECK</span>
        <p style={footBodyStyle}>
          One topic at a time. No competing tiles. The page is paced by you —
          tap forward when you're ready, not before.
        </p>
      </footer>
    </div>
  );
}

// ── Card shell ────────────────────────────────────────────────────────────
function CardShell({ card, children }) {
  return (
    <article style={cardShellStyle}>
      <div style={{ ...cardTopAccentStyle, background: card.accent }} />
      <div style={cardHeadRowStyle}>
        <span style={{ ...iconChipStyle, background: `${card.accent}1F`, color: card.accent }}>
          <card.Icon size={14} />
        </span>
        <span style={cardEyebrowStyle}>{card.eyebrow}</span>
      </div>
      <h2 style={cardTitleStyle}>{card.label}</h2>
      <div style={cardBodyStyle}>{children}</div>
    </article>
  );
}

function renderCardBody(id) {
  switch (id) {
    case "mood":    return <MoodBody />;
    case "body":    return <BodyBody />;
    case "morning": return <MorningBody />;
    case "smart":   return <SmartBody />;
    case "bundle":  return <BundleBody />;
    case "ribbon":  return <RibbonBody />;
    case "week":    return <WeekBody />;
    case "evening": return <EveningBody />;
    default: return null;
  }
}

function MoodBody() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <h3 style={innerTitleStyle}>{MOCK.hero.title}</h3>
      <p style={innerBodyStyle}>{MOCK.hero.body}</p>
      <p style={{ ...innerBodyStyle, fontStyle: "italic", color: T.plumMute }}>
        — Jess, from your daily plan
      </p>
    </div>
  );
}

function BodyBody() {
  return (
    <div style={bodyGridStyle}>
      {MOCK.body.map((b) => (
        <div key={b.label} style={bodyTileStyle}>
          <span style={{ ...bodyIconStyle, background: `${b.tone}1F`, color: b.tone }}>
            <b.Icon size={14} />
          </span>
          <div>
            <div style={bodyValueStyle}>{b.value}</div>
            <div style={bodyLabelStyle}>{b.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MorningBody() {
  const done = MOCK.morningStack.filter((r) => r.done).length;
  return (
    <div>
      <span style={progressPillStyle}>{done}/{MOCK.morningStack.length} kept · {MOCK.morningStack.length - done} left</span>
      <ul style={{ ...stackListStyle, marginTop: 10 }}>
        {MOCK.morningStack.map((r) => (
          <li key={r.name} style={stackLineStyle}>
            <span style={{
              ...stackTickStyle,
              background: r.done ? T.sage : "transparent",
              borderColor: r.done ? T.sage : "rgba(58,44,26,0.22)",
            }}>
              {r.done && <Sparkles size={10} style={{ color: T.cream }} />}
            </span>
            <span style={{
              ...stackTextStyle,
              color: r.done ? T.plumMute : T.plum,
              textDecoration: r.done ? "line-through" : "none",
            }}>{r.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SmartBody() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {["IDLE", "STREAKY", "STUCK", "DRIFTING", "QUIET"].map((s) => (
          <span key={s} style={{
            ...statePillStyle,
            background: s === MOCK.smartView.state ? T.plum : "transparent",
            color: s === MOCK.smartView.state ? T.cream : T.plumSoft,
            borderColor: s === MOCK.smartView.state ? T.plum : "rgba(58,44,26,0.18)",
          }}>{s}</span>
        ))}
      </div>
      <h3 style={innerTitleStyle}>{MOCK.smartView.title}</h3>
      <p style={innerBodyStyle}>{MOCK.smartView.body}</p>
      <div>
        <p style={miniKickerStyle}>TODAY IS GOOD FOR</p>
        <div style={chipBowlStyle}>
          {MOCK.smartView.chips.map((c) => (
            <span key={c} style={softChipStyle}>
              <span style={{ width: 5, height: 5, borderRadius: 9999, background: T.sage, marginRight: 5 }} />
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function BundleBody() {
  const b = MOCK.bundle;
  return (
    <div>
      <h3 style={{ ...innerTitleStyle, color: b.accent }}>{b.title}</h3>
      <p style={{ ...innerBodyStyle, fontStyle: "italic" }}>{b.sub}</p>
      <ul style={{ ...stackListStyle, marginTop: 10 }}>
        {b.rituals.map((r) => (
          <li key={r} style={{ ...stackLineStyle, gap: 7 }}>
            <Sparkles size={11} style={{ color: b.accent, flexShrink: 0 }} />
            <span style={{ ...stackTextStyle, fontSize: 13 }}>{r}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RibbonBody() {
  return (
    <div>
      <p style={progressLineStyle}>
        Day <b>{MOCK.cycle.day}</b> of {MOCK.cycle.len} · Period in <b>{MOCK.cycle.daysToPeriod} days</b> · {MOCK.cycle.confidence}% confidence
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginTop: 8 }}>
        {["M","T","W","T","F","S","S"].map((d, i) => (
          <span key={i} style={ribbonHeadStyle}>{d}</span>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
        {MOCK.monthWeeks.map((week, wi) => (
          <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {week.map((cell, ci) => {
              const tint = PHASE_TINT[cell.p] || T.muted;
              return (
                <span key={ci} style={{
                  ...ribbonCellStyle,
                  background: cell.today ? tint : (cell.pred ? `${tint}30` : `${tint}1A`),
                  borderColor: cell.today ? tint : "transparent",
                  color: cell.today ? T.cream : (cell.off ? "rgba(58,44,26,0.25)" : T.plum),
                  fontWeight: cell.today ? 700 : 500,
                  borderStyle: cell.pred ? "dashed" : "solid",
                }}>
                  {cell.d}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <div style={legendRowStyle}>
        {Object.entries(PHASE_TINT).map(([k, v]) => (
          <span key={k} style={legendChipStyle}>
            <span style={{ width: 7, height: 7, borderRadius: 9999, background: v }} />
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}

function WeekBody() {
  return (
    <div>
      <div style={weekStripGridStyle}>
        {MOCK.weekAhead.map((d) => {
          const tint = PHASE_TINT[d.phase] || T.muted;
          return (
            <div key={d.date} style={weekTileStyle}>
              <span style={weekDayStyle}>{d.day}</span>
              <span style={weekDateStyle}>{d.date}</span>
              <span style={{ ...weekBarStyle, background: `${tint}22` }}>
                <span style={{ width: `${d.cap * 100}%`, height: "100%", background: tint, borderRadius: 4, display: "block" }} />
              </span>
              <span style={weekHintStyle}>{d.hint}</span>
            </div>
          );
        })}
      </div>
      <p style={{ ...innerBodyStyle, marginTop: 10, fontSize: 12.5 }}>
        Luteal slope → Friday period · plan softer.
      </p>
    </div>
  );
}

function EveningBody() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <h3 style={innerTitleStyle}>{MOCK.tonight.title}</h3>
      <p style={innerBodyStyle}>{MOCK.tonight.body}</p>
      <div style={medMiniRow}>
        <span style={{ ...iconChipStyle, background: T.blushSoft, color: T.blush }}>
          <Pill size={12} />
        </span>
        <div style={{ flex: 1 }}>
          <div style={medNameStyle}>{MOCK.meds[0].name}</div>
          <div style={medTimeStyle}>{MOCK.meds[0].time}</div>
        </div>
      </div>
      <div>
        <p style={miniKickerStyle}>SHUTDOWN · 5 MIN</p>
        <ul style={{ ...stackListStyle, gap: 7, marginTop: 4 }}>
          {MOCK.shutdown.map((s, i) => (
            <li key={s} style={shutdownRowStyle}>
              <span style={shutdownDotStyle}>{i + 1}</span>
              <span style={{ ...stackTextStyle, fontSize: 13 }}>{s}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const shellStyle = {
  background: T.cream, minHeight: "100vh",
  padding: "26px 14px 40px",
  };
const headStyle = {
  maxWidth: 640, margin: "0 auto 16px",
  display: "flex", flexDirection: "column", gap: 4,
};
const eyebrowStyle = {
  fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
  color: T.muted, fontWeight: 700, margin: 0,
};
const pageTitleStyle = {
  fontSize: 32, fontWeight: 500, color: T.espresso,
  letterSpacing: "-0.02em", margin: "4px 0", lineHeight: 1.05,
};
const subStyle = {
  fontSize: 13, color: T.plumSoft, margin: 0, lineHeight: 1.5,
};

// Tab strip
const tabStripWrap = {
  maxWidth: 640, margin: "0 auto 8px",
  overflow: "hidden",
};
const tabStripStyle = {
  display: "flex", gap: 5,
  overflowX: "auto",
  paddingBottom: 4,
  scrollbarWidth: "none",
};
const tabBtn = {
  flex: "0 0 auto",
  padding: "5px 11px",
  borderRadius: 9999,
  border: "1px solid",
  fontSize: 11, fontWeight: 700, letterSpacing: "0.02em",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const progressTrackStyle = {
  maxWidth: 640, margin: "0 auto 10px",
  height: 3, borderRadius: 9999,
  background: "rgba(58,44,26,0.08)",
  overflow: "hidden",
};
const progressBarStyle = {
  display: "block", height: "100%",
  background: T.espresso, borderRadius: 9999,
  transition: "width 280ms ease",
};

// Deck container
const deckWrapStyle = {
  position: "relative",
  maxWidth: 720, margin: "0 auto",
};
const trackStyle = {
  display: "flex", gap: 0,
  overflowX: "auto",
  scrollSnapType: "x mandatory",
  WebkitOverflowScrolling: "touch",
  scrollbarWidth: "none",
  padding: "6px 32px",
  scrollPaddingLeft: 32,
  scrollPaddingRight: 32,
};
const cardSlotStyle = {
  flex: "0 0 100%",
  scrollSnapAlign: "center",
  padding: "0 6px",
  transition: "transform 280ms ease, opacity 280ms ease",
};
const cardShellStyle = {
  position: "relative",
  background: T.paperHi,
  borderRadius: 22,
  border: "1px solid rgba(58,44,26,0.08)",
  padding: "18px 18px 20px",
  boxShadow: "0 4px 18px rgba(58,44,26,0.06)",
  display: "flex", flexDirection: "column", gap: 8,
  minHeight: 380,
  overflow: "hidden",
};
const cardTopAccentStyle = {
  position: "absolute", top: 0, left: 0, right: 0,
  height: 4, borderRadius: "22px 22px 0 0",
};
const cardHeadRowStyle = {
  display: "flex", alignItems: "center", gap: 8,
  marginTop: 6,
};
const iconChipStyle = {
  width: 30, height: 30, borderRadius: 10,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const cardEyebrowStyle = {
  fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase",
  color: T.muted, fontWeight: 700,
};
const cardTitleStyle = {
  fontSize: 26, fontWeight: 500, color: T.espresso,
  margin: "2px 0 4px", lineHeight: 1.1, letterSpacing: "-0.015em",
};
const cardBodyStyle = {
  display: "flex", flexDirection: "column", gap: 8,
  flex: 1,
};

// Arrow buttons
const arrowBtn = {
  position: "absolute", top: "50%", transform: "translateY(-50%)",
  width: 32, height: 32, borderRadius: 9999,
  background: T.paperHi, color: T.plum,
  border: "1px solid rgba(58,44,26,0.15)",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  zIndex: 4,
  boxShadow: "0 2px 8px rgba(58,44,26,0.10)",
};

// Dots
const dotRowStyle = {
  display: "flex", justifyContent: "center", gap: 6,
  marginTop: 14,
};
const dotStyle = {
  width: 7, height: 7, borderRadius: 9999,
  border: "none", padding: 0, cursor: "pointer",
  transition: "all 200ms ease",
};
const countLineStyle = {
  textAlign: "center", marginTop: 8,
  fontSize: 11, color: T.plumMute, fontStyle: "italic",
};

// Inner card body shared
const innerTitleStyle = {
  fontSize: 19, fontWeight: 500, color: T.plum,
  margin: 0, lineHeight: 1.25, letterSpacing: "-0.005em",
};
const innerBodyStyle = {
  fontSize: 13, color: T.plumSoft, lineHeight: 1.55, margin: 0,
};
const miniKickerStyle = {
  fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
  color: T.muted, fontWeight: 700, margin: "6px 0 4px",
};
const progressPillStyle = {
  display: "inline-block",
  fontSize: 9, fontWeight: 700, letterSpacing: "0.10em",
  padding: "3px 10px", borderRadius: 9999,
  background: T.cream, color: T.plumSoft,
  border: "1px solid rgba(58,44,26,0.10)",
};
const progressLineStyle = {
  fontSize: 13, color: T.plum, margin: 0,
};

// Body grid
const bodyGridStyle = {
  display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8,
};
const bodyTileStyle = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "10px 12px", borderRadius: 12,
  background: T.cream, border: "1px solid rgba(58,44,26,0.05)",
};
const bodyIconStyle = {
  width: 28, height: 28, borderRadius: 9,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const bodyValueStyle = {
  fontSize: 15, fontWeight: 700, color: T.plum, lineHeight: 1.05,
};
const bodyLabelStyle = {
  fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
  color: T.muted, fontWeight: 600, marginTop: 3,
};

// Stack
const stackListStyle = {
  listStyle: "none", padding: 0, margin: 0,
  display: "flex", flexDirection: "column", gap: 7,
};
const stackLineStyle = {
  display: "flex", alignItems: "center", gap: 9,
};
const stackTickStyle = {
  width: 20, height: 20, borderRadius: 9999,
  border: "1.5px solid",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const stackTextStyle = {
  fontSize: 13.5, };

// Smart view
const statePillStyle = {
  fontSize: 9, fontWeight: 700, letterSpacing: "0.10em",
  padding: "3px 9px", borderRadius: 9999,
  background: "transparent", color: T.plumSoft,
  border: "1px solid rgba(58,44,26,0.18)",
};
const chipBowlStyle = {
  display: "flex", flexWrap: "wrap", gap: 5, marginTop: 4,
};
const softChipStyle = {
  display: "inline-flex", alignItems: "center",
  fontSize: 11, color: T.plum,
  padding: "3px 9px", borderRadius: 9999,
  background: T.cream, border: "1px solid rgba(58,44,26,0.10)",
};

// Ribbon
const ribbonHeadStyle = {
  fontSize: 9, letterSpacing: "0.12em",
  textAlign: "center", color: T.muted, fontWeight: 700,
};
const ribbonCellStyle = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  borderRadius: 8, padding: "6px 0",
  fontSize: 11, border: "1px solid",
};
const legendRowStyle = {
  display: "flex", flexWrap: "wrap", gap: 9, marginTop: 10,
};
const legendChipStyle = {
  display: "inline-flex", alignItems: "center", gap: 5,
  fontSize: 10, color: T.plumSoft, fontWeight: 600,
};

// Week strip
const weekStripGridStyle = {
  display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5,
};
const weekTileStyle = {
  display: "flex", flexDirection: "column", alignItems: "center",
  gap: 3, padding: "8px 3px", borderRadius: 10,
  background: T.cream, border: "1px solid rgba(58,44,26,0.06)",
};
const weekDayStyle = {
  fontSize: 8, letterSpacing: "0.12em", color: T.muted, fontWeight: 700,
};
const weekDateStyle = {
  fontSize: 13, fontWeight: 500, color: T.plum,
};
const weekBarStyle = {
  width: "100%", height: 3, borderRadius: 4, overflow: "hidden",
};
const weekHintStyle = {
  fontSize: 8, color: T.plumMute, textAlign: "center", lineHeight: 1.2,
};

// Meds + shutdown
const medMiniRow = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "8px 10px", borderRadius: 12,
  background: T.cream, border: "1px solid rgba(58,44,26,0.06)",
};
const medNameStyle = {
  fontSize: 13, fontWeight: 700, color: T.plum, lineHeight: 1.15,
};
const medTimeStyle = {
  fontSize: 11, color: T.plumMute, marginTop: 2,
};
const shutdownRowStyle = {
  display: "flex", alignItems: "center", gap: 10,
};
const shutdownDotStyle = {
  width: 22, height: 22, borderRadius: 9999,
  background: "rgba(74,42,58,0.10)", color: T.plum,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  fontSize: 10, fontWeight: 700, flexShrink: 0,
};

// Foot
const footStyle = {
  maxWidth: 640, margin: "20px auto 0",
  padding: "12px 14px", borderRadius: 12,
  background: "rgba(58,44,26,0.06)",
  textAlign: "center",
};
const footEyebrowStyle = {
  fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
  color: T.muted, fontWeight: 700,
};
const footBodyStyle = {
  fontSize: 11, color: T.plumSoft, margin: "6px 0 0", lineHeight: 1.55,
};
