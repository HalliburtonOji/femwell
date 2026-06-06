// ─────────────────────────────────────────────────────────────────────────────
// TimeOfDayFlow — Demo C of the "Combined Today+Cycle" exploration.
//
// Hypothesis: instead of a tab switcher or a card masonry, render the day as
// a FLOW — three full-width time-of-day "scenes" stacked top to bottom:
//
//   1. MORNING       cream → blush warmth, hero + body + morning stack
//   2. AFTERNOON     paper → sage tint, Smart View + ritual bundles + meds
//   3. EVENING       cream → plum dusk, Tonight + shutdown ritual
//
// Each scene has its own ambient backdrop and feels like walking through
// your day chronologically — not jumping between domains. A thin "you are
// here" indicator on the left rail tracks the user's scroll position.
//
// Cycle / insights — the bigger arc that transcends time of day — sits
// pinned below the three time scenes as a quieter "the week behind, the
// week ahead" section. Cycle ribbon + week strip + saved rhythms.
//
// Mock = Sat 16 May 2026 · Luteal Day 22 (same dataset as Accordion +
// Dashboard so the founder can compare A/B/C directly).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import {
  Sunrise, Sun, Moon, Sparkles, Heart, Zap, Droplets, Footprints, CircleDot,
  Repeat, TrendingUp, BedDouble, Pill, Calendar, BookOpen,
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
    body: "Luteal days often invite a different pace — depth over breadth, careful over many.",
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
    chips: ["finishing edits", "reflection", "warming meals", "saying no"],
  },
  bundle: {
    title: "Settle",
    sub: "Soft edges, honest hours",
    accent: T.luteal,
    rituals: ["Journal · 5m", "Magnesium at dinner", "Wind-down walk", "Bath + book before bed"],
  },
  meds: [{ name: "Estradiol patch · 50mcg", time: "21:00 · tonight" }],
  tonight: {
    title: "A soft landing",
    body: "Lights down, screens away, water by the bed.",
  },
  shutdown: [
    "Close every open tab.",
    "Write tomorrow's one anchor on paper.",
    "Stand up and stretch for thirty seconds.",
  ],
  // Cycle data
  cycle: { day: 22, len: 28, phase: "luteal", daysToPeriod: 6 },
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
  rhythms: [
    { name: "Luteal Softness", pct: 67, active: true },
    { name: "Warm Cycle",      pct: 86 },
    { name: "Quiet Practice",  pct: 42 },
  ],
  weeklyInsight: "Three weeks of luteal logs suggest your slowest day usually lands Day 23. Plan softer.",
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

const SCENES = [
  { id: "morning",   label: "Morning",   Icon: Sunrise, ambient: "linear-gradient(180deg, #F4EDDB 0%, #FAE3DC 100%)" },
  { id: "afternoon", label: "Afternoon", Icon: Sun,     ambient: "linear-gradient(180deg, #FBF6E6 0%, #E8EFE0 100%)" },
  { id: "evening",   label: "Evening",   Icon: Moon,    ambient: "linear-gradient(180deg, #F4EDDB 0%, #E2D8E5 100%)" },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function TimeOfDayFlow() {
  const refs = useRef({});
  const [active, setActive] = useState("morning");

  // Track which scene is on screen for the left-rail indicator.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.dataset.scene);
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );
    Object.values(refs.current).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  function jumpTo(id) {
    const el = refs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div style={shellStyle}>
      <RailIndicator scenes={SCENES} active={active} onJump={jumpTo} />

      <header style={headStyle}>
        <p style={eyebrowStyle}>SATURDAY 16 MAY · LUTEAL DAY 22</p>
        <h1 style={pageTitleStyle}>Your day, top to bottom.</h1>
        <p style={subStyle}>
          Three scenes. Each one is your day at that hour — its own light, its own
          weight. Walk through them in order or jump using the rail.
        </p>
      </header>

      {/* Three time scenes */}
      {SCENES.map((s) => (
        <section
          key={s.id}
          ref={(el) => (refs.current[s.id] = el)}
          data-scene={s.id}
          style={{ ...sceneStyle, background: s.ambient }}
          aria-label={`${s.label} scene`}
        >
          <SceneHeader scene={s} />
          {s.id === "morning" && <MorningScene />}
          {s.id === "afternoon" && <AfternoonScene />}
          {s.id === "evening" && <EveningScene />}
        </section>
      ))}

      {/* The bigger arc — cycle and patterns */}
      <section style={cycleArcStyle} aria-label="The bigger arc — cycle">
        <div style={cycleArcInnerStyle}>
          <div style={cycleHeadStyle}>
            <span style={cycleEyebrowStyle}>THE BIGGER ARC</span>
            <h2 style={cycleTitleStyle}>The week, the cycle, the pattern.</h2>
            <p style={cycleSubStyle}>
              Time of day is the rhythm of one day. This is the rhythm of the
              month.
            </p>
          </div>

          <CycleRibbon />
          <WeekAheadStrip />
          <SavedRhythms />
        </div>
      </section>

      <footer style={footStyle}>
        <span style={footEyebrowStyle}>DEMO C · TIME OF DAY FLOW</span>
        <p style={footBodyStyle}>
          A chronological flow, not a dashboard. The day reads top-to-bottom;
          the cycle anchors it from below.
        </p>
      </footer>
    </div>
  );
}

// ── Rail indicator (left side) ────────────────────────────────────────────
function RailIndicator({ scenes, active, onJump }) {
  return (
    <div style={railWrapStyle} aria-hidden="false">
      {scenes.map((s) => {
        const isActive = s.id === active;
        return (
          <button
            key={s.id}
            onClick={() => onJump(s.id)}
            style={{
              ...railDotStyle,
              background: isActive ? T.espresso : "rgba(58,44,26,0.20)",
              transform: isActive ? "scale(1.4)" : "scale(1)",
            }}
            aria-label={`Jump to ${s.label}`}
            title={s.label}
          />
        );
      })}
    </div>
  );
}

// ── Scene header ──────────────────────────────────────────────────────────
function SceneHeader({ scene }) {
  return (
    <div style={sceneHeadStyle}>
      <span style={{ ...sceneIconStyle, background: T.paperHi }}>
        <scene.Icon size={18} style={{ color: T.espresso }} />
      </span>
      <div>
        <p style={miniKickerStyle}>SCENE · {scene.label.toUpperCase()}</p>
        <h2 style={sceneTitleStyle}>{scene.label}</h2>
      </div>
    </div>
  );
}

// ── Morning scene ─────────────────────────────────────────────────────────
function MorningScene() {
  return (
    <div style={sceneInnerStyle}>
      <article style={heroCardStyle}>
        <div style={heroPillRow}>
          <span style={{ ...heroChipStyle, background: T.goldSoft || T.cream }}>
            <Sparkles size={11} style={{ color: T.goldDeep }} />
            <span style={{ marginLeft: 4 }}>FROM JESS</span>
          </span>
        </div>
        <h3 style={heroTitleStyle}>{MOCK.hero.title}</h3>
        <p style={heroBodyStyle}>{MOCK.hero.body}</p>
      </article>

      <article style={paperCardStyle}>
        <p style={miniKickerStyle}>PILLARS</p>
        <h3 style={cardTitleStyle}>Your body, this morning</h3>
        <div style={bodyGridStyle}>
          {MOCK.body.map((b) => (
            <div key={b.label} style={bodyTileStyle}>
              <span style={{ ...bodyIconStyle, background: `${b.tone}1F`, color: b.tone }}>
                <b.Icon size={13} />
              </span>
              <div>
                <div style={bodyValueStyle}>{b.value}</div>
                <div style={bodyLabelStyle}>{b.label}</div>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article style={paperCardStyle}>
        <div style={cardHeadRowStyle}>
          <p style={miniKickerStyle}>MORNING STACK · RITUALS</p>
          <span style={progressPillStyle}>
            {MOCK.morningStack.filter((r) => r.done).length}/{MOCK.morningStack.length} kept
          </span>
        </div>
        <ul style={stackListStyle}>
          {MOCK.morningStack.map((r) => (
            <li key={r.name} style={stackLineStyle}>
              <span style={{
                ...stackTickStyle,
                background: r.done ? T.sage : "transparent",
                borderColor: r.done ? T.sage : "rgba(58,44,26,0.22)",
              }}>
                {r.done && <Sparkles size={9} style={{ color: T.cream }} />}
              </span>
              <span style={{
                ...stackTextStyle,
                color: r.done ? T.plumMute : T.plum,
                textDecoration: r.done ? "line-through" : "none",
              }}>{r.name}</span>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}

// ── Afternoon scene ───────────────────────────────────────────────────────
function AfternoonScene() {
  return (
    <div style={sceneInnerStyle}>
      <article style={paperCardStyle}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
          <span style={{ ...statePillStyle, background: T.plum, color: T.cream, borderColor: T.plum }}>{MOCK.smartView.state}</span>
          <span style={statePillStyle}>IDLE</span>
          <span style={statePillStyle}>STREAKY</span>
          <span style={statePillStyle}>DRIFTING</span>
          <span style={statePillStyle}>QUIET</span>
        </div>
        <p style={miniKickerStyle}>SMART VIEW · RIGHT NOW</p>
        <h3 style={cardTitleStyle}>{MOCK.smartView.title}</h3>
        <p style={heroBodyStyle}>{MOCK.smartView.body}</p>
        <p style={{ ...miniKickerStyle, marginTop: 10 }}>TODAY IS GOOD FOR</p>
        <div style={chipBowlStyle}>
          {MOCK.smartView.chips.map((c) => (
            <span key={c} style={softChipStyle}>
              <span style={{ width: 5, height: 5, borderRadius: 9999, background: T.sage, marginRight: 5 }} />
              {c}
            </span>
          ))}
        </div>
      </article>

      <article style={{ ...paperCardStyle, borderTop: `3px solid ${MOCK.bundle.accent}` }}>
        <div style={cardHeadRowStyle}>
          <p style={miniKickerStyle}>RITUAL BUNDLE FOR TODAY</p>
          <span style={{ ...progressPillStyle, color: MOCK.bundle.accent, background: `${MOCK.bundle.accent}1F`, border: `1px solid ${MOCK.bundle.accent}55` }}>
            LUTEAL
          </span>
        </div>
        <h3 style={{ ...cardTitleStyle, color: MOCK.bundle.accent }}>{MOCK.bundle.title}</h3>
        <p style={{ ...heroBodyStyle, fontStyle: "italic" }}>{MOCK.bundle.sub}</p>
        <ul style={{ ...stackListStyle, marginTop: 8 }}>
          {MOCK.bundle.rituals.map((r) => (
            <li key={r} style={{ ...stackLineStyle, gap: 6 }}>
              <Sparkles size={10} style={{ color: MOCK.bundle.accent, flexShrink: 0 }} />
              <span style={{ ...stackTextStyle, fontSize: 13 }}>{r}</span>
            </li>
          ))}
        </ul>
      </article>

      <article style={paperCardStyle}>
        <p style={miniKickerStyle}>MEDICATIONS · TODAY</p>
        {MOCK.meds.map((m) => (
          <div key={m.name} style={medRowStyle}>
            <span style={{ ...iconChipStyle, background: T.blushSoft, color: T.blush }}>
              <Pill size={13} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={medNameStyle}>{m.name}</div>
              <div style={medTimeStyle}>{m.time}</div>
            </div>
            <button style={medActionStyle}>Share with my GP →</button>
          </div>
        ))}
      </article>
    </div>
  );
}

// ── Evening scene ─────────────────────────────────────────────────────────
function EveningScene() {
  return (
    <div style={sceneInnerStyle}>
      <article style={{ ...heroCardStyle, background: "rgba(74,42,58,0.06)", border: `1px solid ${T.luteal}33` }}>
        <div style={heroPillRow}>
          <span style={{ ...heroChipStyle, background: "rgba(123,94,154,0.12)" }}>
            <BedDouble size={11} style={{ color: T.luteal }} />
            <span style={{ marginLeft: 4 }}>TONIGHT · WIND-DOWN · 30 MIN</span>
          </span>
        </div>
        <h3 style={heroTitleStyle}>{MOCK.tonight.title}</h3>
        <p style={heroBodyStyle}>{MOCK.tonight.body}</p>
      </article>

      <article style={paperCardStyle}>
        <p style={miniKickerStyle}>SHUTDOWN RITUAL · 5 MIN</p>
        <ul style={{ ...stackListStyle, gap: 8 }}>
          {MOCK.shutdown.map((s, i) => (
            <li key={s} style={shutdownRowStyle}>
              <span style={shutdownDotStyle}>{i + 1}</span>
              <span style={{ ...stackTextStyle, fontSize: 13, lineHeight: 1.45 }}>{s}</span>
            </li>
          ))}
        </ul>
      </article>

      <div style={dustyStarsStyle} aria-hidden="true">
        <span style={{ ...starStyle, top: 6, left: "12%" }} />
        <span style={{ ...starStyle, top: 28, left: "78%" }} />
        <span style={{ ...starStyle, top: 60, left: "44%", width: 3, height: 3 }} />
        <span style={{ ...starStyle, top: 14, left: "62%", width: 2, height: 2 }} />
      </div>
    </div>
  );
}

// ── Cycle ribbon (mini month) ─────────────────────────────────────────────
function CycleRibbon() {
  return (
    <article style={paperCardStyle}>
      <div style={cardHeadRowStyle}>
        <p style={miniKickerStyle}>CYCLE RIBBON · MAY 2026</p>
        <span style={progressPillStyle}>
          Day {MOCK.cycle.day} · Period in {MOCK.cycle.daysToPeriod} days
        </span>
      </div>
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
    </article>
  );
}

function WeekAheadStrip() {
  return (
    <article style={paperCardStyle}>
      <p style={miniKickerStyle}>THE WEEK AHEAD</p>
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
      <p style={{ ...heroBodyStyle, marginTop: 10, fontSize: 12.5 }}>
        Luteal slope → Friday period · plan softer.
      </p>
    </article>
  );
}

function SavedRhythms() {
  return (
    <article style={paperCardStyle}>
      <p style={miniKickerStyle}>SAVED RHYTHMS · WEEKLY INSIGHT</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
        {MOCK.rhythms.map((r) => (
          <div key={r.name} style={rhythmRowStyle}>
            <span style={rhythmNameStyle}>
              {r.name}
              {r.active && <span style={activeChipStyle}>ACTIVE</span>}
            </span>
            <div style={rhythmBarOuterStyle}>
              <span style={{ ...rhythmBarInnerStyle, width: `${r.pct}%`, background: r.active ? T.sage : T.plumMute }} />
            </div>
            <span style={rhythmPctStyle}>{r.pct}%</span>
          </div>
        ))}
      </div>
      <div style={insightCardStyle}>
        <span style={insightKickerStyle}>WEEKLY INSIGHT</span>
        <p style={insightTextStyle}>{MOCK.weeklyInsight}</p>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const shellStyle = {
  position: "relative",
  background: T.cream, minHeight: "100vh",
  padding: "26px 14px 40px",
  };

const railWrapStyle = {
  position: "sticky", top: 12,
  marginLeft: 4, marginBottom: -32,
  width: 14,
  display: "flex", flexDirection: "column", gap: 12,
  zIndex: 5,
};
const railDotStyle = {
  width: 9, height: 9, borderRadius: 9999,
  border: "none", padding: 0, cursor: "pointer",
  transition: "all 200ms ease",
};

const headStyle = {
  maxWidth: 640, margin: "0 auto 20px",
  display: "flex", flexDirection: "column", gap: 4,
};
const eyebrowStyle = {
  fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
  color: T.muted, fontWeight: 700, margin: 0,
};
const pageTitleStyle = {
  fontSize: 36, fontWeight: 500, color: T.espresso,
  letterSpacing: "-0.02em", margin: "4px 0", lineHeight: 1.05,
};
const subStyle = {
  fontSize: 13, color: T.plumSoft, margin: 0, lineHeight: 1.5,
};

const sceneStyle = {
  position: "relative",
  maxWidth: 640, margin: "0 auto 14px",
  borderRadius: 22,
  padding: "20px 18px 22px",
  overflow: "hidden",
};
const sceneHeadStyle = {
  display: "flex", alignItems: "center", gap: 10,
  marginBottom: 12,
};
const sceneIconStyle = {
  width: 36, height: 36, borderRadius: 12,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
  boxShadow: "0 1px 4px rgba(58,44,26,0.06)",
};
const miniKickerStyle = {
  fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
  color: T.muted, fontWeight: 700, margin: 0,
};
const sceneTitleStyle = {
  fontSize: 22, fontWeight: 500, color: T.espresso,
  letterSpacing: "-0.01em", margin: "2px 0 0", lineHeight: 1.1,
};

const sceneInnerStyle = {
  display: "flex", flexDirection: "column", gap: 10,
};

// Hero card (used in Morning + Evening)
const heroCardStyle = {
  background: T.paperHi,
  borderRadius: 16,
  padding: "14px 16px",
  border: "1px solid rgba(58,44,26,0.08)",
  display: "flex", flexDirection: "column", gap: 4,
};
const heroPillRow = {
  display: "flex", alignItems: "center", gap: 6,
  marginBottom: 4,
};
const heroChipStyle = {
  display: "inline-flex", alignItems: "center",
  padding: "3px 10px", borderRadius: 9999,
  fontSize: 9, fontWeight: 700, letterSpacing: "0.14em",
  color: T.goldDeep, background: T.cream,
};
const heroTitleStyle = {
  fontSize: 22, fontWeight: 500, color: T.plum,
  margin: 0, lineHeight: 1.25, letterSpacing: "-0.01em",
};
const heroBodyStyle = {
  fontSize: 13, color: T.plumSoft, lineHeight: 1.55, margin: 0,
};

const paperCardStyle = {
  background: T.paperHi,
  borderRadius: 16,
  padding: "14px 16px",
  border: "1px solid rgba(58,44,26,0.08)",
  display: "flex", flexDirection: "column", gap: 6,
};
const cardHeadRowStyle = {
  display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8,
};
const cardTitleStyle = {
  fontSize: 17, fontWeight: 500, color: T.plum,
  margin: "2px 0 0", lineHeight: 1.25, letterSpacing: "-0.005em",
};
const progressPillStyle = {
  fontSize: 9, fontWeight: 700, letterSpacing: "0.10em",
  padding: "3px 9px", borderRadius: 9999,
  background: T.cream, color: T.plumSoft,
  border: "1px solid rgba(58,44,26,0.10)",
};

const bodyGridStyle = {
  display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
  gap: 6, marginTop: 6,
};
const bodyTileStyle = {
  display: "flex", alignItems: "center", gap: 7,
  padding: "8px 10px", borderRadius: 10,
  background: T.cream, border: "1px solid rgba(58,44,26,0.05)",
};
const bodyIconStyle = {
  width: 24, height: 24, borderRadius: 8,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const bodyValueStyle = {
  fontSize: 13, fontWeight: 700, color: T.plum, lineHeight: 1.05,
};
const bodyLabelStyle = {
  fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
  color: T.muted, fontWeight: 600, marginTop: 2,
};

const stackListStyle = {
  listStyle: "none", padding: 0, margin: 0,
  display: "flex", flexDirection: "column", gap: 6,
};
const stackLineStyle = {
  display: "flex", alignItems: "center", gap: 8,
};
const stackTickStyle = {
  width: 18, height: 18, borderRadius: 9999,
  border: "1.5px solid",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const stackTextStyle = {
  fontSize: 13, };

const statePillStyle = {
  fontSize: 9, fontWeight: 700, letterSpacing: "0.10em",
  padding: "3px 8px", borderRadius: 9999,
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

const iconChipStyle = {
  width: 28, height: 28, borderRadius: 10,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const medRowStyle = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "8px 0",
};
const medNameStyle = {
  fontSize: 13, fontWeight: 700, color: T.plum, lineHeight: 1.15,
};
const medTimeStyle = {
  fontSize: 11, color: T.plumMute, marginTop: 2,
};
const medActionStyle = {
  fontSize: 11, fontWeight: 700, color: T.plum,
  background: "transparent", border: "1px solid rgba(58,44,26,0.18)",
  borderRadius: 9999, padding: "5px 10px", cursor: "pointer",
};

const shutdownRowStyle = {
  display: "flex", alignItems: "center", gap: 10,
};
const shutdownDotStyle = {
  width: 20, height: 20, borderRadius: 9999,
  background: "rgba(74,42,58,0.10)", color: T.plum,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  fontSize: 10, fontWeight: 700, flexShrink: 0,
};

const dustyStarsStyle = {
  position: "absolute", inset: 0, pointerEvents: "none",
  zIndex: 0, opacity: 0.5,
};
const starStyle = {
  position: "absolute",
  width: 4, height: 4,
  borderRadius: 9999,
  background: T.gold,
  boxShadow: "0 0 6px rgba(212,175,55,0.6)",
};

// Cycle arc
const cycleArcStyle = {
  marginTop: 8,
  background: "linear-gradient(180deg, #FBF6E6 0%, #F4EDDB 100%)",
  borderRadius: 22,
  padding: "20px 14px 22px",
  border: "1px dashed rgba(58,44,26,0.18)",
};
const cycleArcInnerStyle = {
  maxWidth: 640, margin: "0 auto",
  display: "flex", flexDirection: "column", gap: 10,
};
const cycleHeadStyle = {
  marginBottom: 4,
};
const cycleEyebrowStyle = {
  fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
  color: T.muted, fontWeight: 700,
};
const cycleTitleStyle = {
  fontSize: 24, fontWeight: 500, color: T.espresso,
  letterSpacing: "-0.01em", margin: "4px 0 6px", lineHeight: 1.15,
};
const cycleSubStyle = {
  fontSize: 12.5, color: T.plumSoft, margin: 0, lineHeight: 1.5,
};

const ribbonHeadStyle = {
  fontSize: 9, letterSpacing: "0.12em",
  textAlign: "center", color: T.muted, fontWeight: 700,
};
const ribbonCellStyle = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  borderRadius: 8, padding: "6px 0",
  fontSize: 11, border: "1px solid",
};

const weekStripGridStyle = {
  display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5, marginTop: 6,
};
const weekTileStyle = {
  display: "flex", flexDirection: "column", alignItems: "center",
  gap: 3, padding: "7px 3px", borderRadius: 10,
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

const rhythmRowStyle = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "8px 10px", borderRadius: 10,
  background: T.cream,
};
const rhythmNameStyle = {
  flex: 1,
  fontSize: 13, fontWeight: 500, color: T.plum,
  display: "flex", alignItems: "center", gap: 6,
};
const activeChipStyle = {
  fontSize: 8, fontWeight: 700, letterSpacing: "0.14em",
  color: T.sage, background: T.sageSoft,
  padding: "2px 5px", borderRadius: 9999,
};
const rhythmBarOuterStyle = {
  width: 110, height: 5, borderRadius: 9999,
  background: "rgba(58,44,26,0.08)", overflow: "hidden",
};
const rhythmBarInnerStyle = {
  display: "block", height: "100%", borderRadius: 9999,
};
const rhythmPctStyle = {
  fontSize: 11, fontWeight: 700, color: T.plumMute, minWidth: 32, textAlign: "right",
};

const insightCardStyle = {
  marginTop: 8, padding: "12px 14px",
  background: T.cream, borderRadius: 12,
  border: `1px dashed rgba(58,44,26,0.20)`,
};
const insightKickerStyle = {
  fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
  color: T.goldDeep, fontWeight: 700,
};
const insightTextStyle = {
  fontStyle: "italic",
  fontSize: 13, color: T.plum, lineHeight: 1.55, margin: "4px 0 0",
};

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
