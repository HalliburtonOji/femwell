// ─────────────────────────────────────────────────────────────────────────────
// AccordionPlanner — Demo A of the "Combined Today+Cycle" exploration.
//
// Hypothesis: instead of two tabs (Today / Cycle) each with their own scroll,
// render the WHOLE Planner as a stack of named collapsible strips. Each strip
// is a one-line summary that opens to its real content. The user scans the
// whole landscape in one screen, expands only what they need, and the page
// stops being a long-scroll.
//
// 11 strips, in priority order (Today-leaning, with Cycle baked in):
//   1.  Today's mood (hero · Jess insight)
//   2.  Right now (Smart View — IDLE/STREAKY/STUCK/DRIFTING/QUIET)
//   3.  Body summary (6-pillar strip)
//   4.  Morning stack (checklist)
//   5.  Ritual bundles (phase-keyed carousel)
//   6.  Medications & HRT
//   7.  Tonight (wind-down)
//   8.  Shutdown ritual
//   9.  Cycle ribbon (month)
//  10.  Week ahead (predicted capacity)
//  11.  Saved rhythms + weekly insight
//
// Mock data lives in this file — this is a demo, not wired. Each strip's
// open state lives in a single `openSet` Set so multiple can be open at once.
// Mass-action chips at top: "Close all" / "Open Today" / "Open Cycle".
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import {
  ChevronDown, ChevronUp, Moon, Zap, Heart, Droplets, Footprints, CircleDot,
  Sparkles, Sun, Pill, BedDouble, Calendar, TrendingUp, BookOpen, Repeat,
} from "lucide-react";

const T = {
  cream:    "#F4EDDB",
  paper:    "#FFFFFF",
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
  // Phase tints
  menstrual: "#9A2845",
  follicular:"#D4745A",
  ovulatory: "#C8A040",
  luteal:    "#7B5E9A",
};

// ── Mocked Saturday-16-May luteal day 22 data ───────────────────────────────
const MOCK = {
  cycle: { day: 22, len: 28, phase: "luteal", daysToPeriod: 6, confidence: 84 },
  body: {
    sleep: "7.2h", energy: "68%", mood: "60%",
    hydration: "6/8", movement: "20m", cycle: "Day 22",
  },
  hero: {
    eyebrow: "TODAY · LUTEAL DAY 22",
    title: "A softer landing this week",
    body: "Luteal days often invite a different pace — depth over breadth, careful over many.",
  },
  smartView: {
    state: "STUCK",
    phase: "Luteal · Day 22",
    title: "Inner reflection and release",
    body: "Even one ritual logged shifts the day. Anchor first, the rest follows.",
    chips: ["finishing edits", "reflection", "warming meals", "journaling", "saying no"],
  },
  morning: [
    { name: "Drink water",      done: true },
    { name: "Morning walk",     done: true },
    { name: "5-minute reading", done: false },
  ],
  ritualBundles: [
    { key: "menstrual",  title: "Restore", sub: "Soften, slow, rest",         accent: T.menstrual,  rituals: ["Heat on belly", "Yin yoga · 10m", "Warm cooked breakfast", "Lights out by 10pm"] },
    { key: "follicular", title: "Build",   sub: "New energy, fresh starts",   accent: T.follicular, rituals: ["Morning walk · 20m", "Strength · 25m", "Plan one small thing", "Cold water on face"] },
    { key: "ovulatory",  title: "Expand",  sub: "Connect, speak, move",       accent: T.ovulatory,  rituals: ["Reach out to someone", "HIIT or dance · 20m", "Sunlight before screens", "Hydration: 2L"] },
    { key: "luteal",     title: "Settle",  sub: "Soft edges, honest hours",   accent: T.luteal,     rituals: ["Journal · 5m", "Magnesium at dinner", "Wind-down walk", "Bath + book before bed"], forToday: true },
  ],
  medications: [
    { name: "Estradiol patch · 50mcg", time: "21:00 · tonight", tone: T.blush },
  ],
  tonight: {
    eyebrow: "TONIGHT · WIND-DOWN · 30 MIN",
    title: "A soft landing — lights down, screens away, water by the bed.",
    body: "One small ritual you'll thank yourself for tomorrow morning.",
  },
  shutdown: [
    "Close every open tab on your screen.",
    "Write tomorrow's one anchor on paper.",
    "Stand up and stretch for thirty seconds.",
  ],
  monthWeeks: buildMonthWeeks(),
  weekAhead: [
    { day: "MON", date: 18, phase: "luteal", capacity: 0.55, hint: "Slower tasks" },
    { day: "TUE", date: 19, phase: "luteal", capacity: 0.5,  hint: "Anchor early" },
    { day: "WED", date: 20, phase: "luteal", capacity: 0.45, hint: "Edit, don't write" },
    { day: "THU", date: 21, phase: "luteal", capacity: 0.4,  hint: "Soft tasks" },
    { day: "FRI", date: 22, phase: "menstrual", capacity: 0.3, hint: "Period predicted" },
    { day: "SAT", date: 23, phase: "menstrual", capacity: 0.3, hint: "Rest weekend" },
    { day: "SUN", date: 24, phase: "menstrual", capacity: 0.35, hint: "Slow start" },
  ],
  rhythms: [
    { name: "Luteal Softness", sub: "6 rituals · 6 of 9 kept", pct: 67, active: true },
    { name: "Warm Cycle",      sub: "Slow walks · daily",       pct: 86 },
    { name: "Quiet Practice",  sub: "Meditation · 10 min",      pct: 42 },
  ],
  weeklyInsight: "Three weeks of luteal logs suggest your slowest day usually lands Day 23. Plan softer.",
};

function buildMonthWeeks() {
  // May 2026, Mon-start. Today = May 16 (Sat).
  return [
    [{ d:27,off:1,p:"menstrual"},{d:28,off:1,p:"menstrual"},{d:29,off:1,p:"menstrual"},{d:30,off:1,p:"follicular"},{d:1,p:"follicular"},{d:2,p:"follicular"},{d:3,p:"follicular"}],
    [{d:4,p:"follicular"},{d:5,p:"follicular"},{d:6,p:"follicular"},{d:7,p:"ovulatory"},{d:8,p:"ovulatory"},{d:9,p:"ovulatory"},{d:10,p:"luteal"}],
    [{d:11,p:"luteal"},{d:12,p:"luteal"},{d:13,p:"luteal"},{d:14,p:"luteal"},{d:15,p:"luteal"},{d:16,p:"luteal",today:1},{d:17,p:"luteal"}],
    [{d:18,p:"luteal"},{d:19,p:"luteal"},{d:20,p:"luteal"},{d:21,p:"luteal"},{d:22,p:"menstrual",pred:1},{d:23,p:"menstrual",pred:1},{d:24,p:"menstrual",pred:1}],
    [{d:25,p:"menstrual",pred:1},{d:26,p:"menstrual",pred:1},{d:27,p:"follicular",pred:1},{d:28,p:"follicular",pred:1},{d:29,p:"follicular",pred:1},{d:30,p:"follicular",pred:1},{d:31,p:"follicular",pred:1}],
  ];
}

const PHASE_TINT = {
  menstrual: T.menstrual,
  follicular: T.follicular,
  ovulatory: T.ovulatory,
  luteal: T.luteal,
};

// ── Strip definitions ──────────────────────────────────────────────────────
// Each strip declares: id, label, kicker, summary, accent, Icon, group, body
// `group`: "today" or "cycle" — used for the mass-action chips.
const STRIPS = [
  {
    id: "hero", group: "today", Icon: Sparkles, accent: T.gold,
    label: "Today's mood",
    kicker: "FROM JESS",
    summary: () => MOCK.hero.title,
  },
  {
    id: "smart", group: "today", Icon: TrendingUp, accent: T.luteal,
    label: "Right now",
    kicker: "SMART VIEW",
    summary: () => `${MOCK.smartView.state} · ${MOCK.smartView.title}`,
  },
  {
    id: "body", group: "today", Icon: Moon, accent: T.plum,
    label: "Your body today",
    kicker: "6 PILLARS",
    summary: () => `Sleep ${MOCK.body.sleep} · Energy ${MOCK.body.energy} · Mood ${MOCK.body.mood} · Day ${MOCK.cycle.day}`,
  },
  {
    id: "morning", group: "today", Icon: Sun, accent: T.gold,
    label: "Morning stack",
    kicker: "RITUALS",
    summary: () => {
      const done = MOCK.morning.filter((r) => r.done).length;
      return `${done}/${MOCK.morning.length} kept · ${MOCK.morning.map((r) => r.name).join(" · ")}`;
    },
  },
  {
    id: "bundles", group: "today", Icon: Repeat, accent: T.luteal,
    label: "Ritual bundles",
    kicker: "PHASE-KEYED",
    summary: () => {
      const t = MOCK.ritualBundles.find((b) => b.forToday);
      return `For today: ${t?.title || "—"} — ${t?.sub || ""}`;
    },
  },
  {
    id: "meds", group: "today", Icon: Pill, accent: T.blush,
    label: "Medications & HRT",
    kicker: "TODAY",
    summary: () => MOCK.medications.length
      ? `${MOCK.medications[0].name} · ${MOCK.medications[0].time}`
      : "No medications logged",
  },
  {
    id: "tonight", group: "today", Icon: BedDouble, accent: T.plumSoft,
    label: "Tonight",
    kicker: "WIND-DOWN",
    summary: () => MOCK.tonight.title.split(" — ")[0],
  },
  {
    id: "shutdown", group: "today", Icon: Heart, accent: T.rose,
    label: "Shutdown ritual",
    kicker: "5 MIN · AFTER WORK",
    summary: () => `${MOCK.shutdown.length} small acts before the day closes.`,
  },
  // ── Cycle strips ───────────────────────────────────────────────────────
  {
    id: "ribbon", group: "cycle", Icon: Calendar, accent: T.luteal,
    label: "Cycle ribbon",
    kicker: "MAY 2026",
    summary: () => `Day ${MOCK.cycle.day} of ${MOCK.cycle.len} · Period in ${MOCK.cycle.daysToPeriod} days`,
  },
  {
    id: "weekahead", group: "cycle", Icon: TrendingUp, accent: T.follicular,
    label: "Week ahead",
    kicker: "PREDICTED CAPACITY",
    summary: () => "Luteal slope → Friday period · plan softer.",
  },
  {
    id: "rhythms", group: "cycle", Icon: BookOpen, accent: T.sage,
    label: "Saved rhythms · Weekly insight",
    kicker: "PATTERNS",
    summary: () => `${MOCK.rhythms.filter((r) => r.active).length} active · ${MOCK.rhythms.length - 1} dormant`,
  },
];

const TODAY_IDS = STRIPS.filter((s) => s.group === "today").map((s) => s.id);
const CYCLE_IDS = STRIPS.filter((s) => s.group === "cycle").map((s) => s.id);

export default function AccordionPlanner() {
  // Start with just the hero + Right now open — sets a calm tone.
  const [openSet, setOpenSet] = useState(() => new Set(["hero", "smart"]));

  const openCount = openSet.size;
  const openIds = useMemo(() => Array.from(openSet), [openSet]);

  function toggle(id) {
    setOpenSet((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }
  function openOnly(ids) { setOpenSet(new Set(ids)); }
  function closeAll() { setOpenSet(new Set()); }

  return (
    <div style={shellStyle}>
      <div style={headStyle}>
        <div style={titleBlockStyle}>
          <p style={eyebrowStyle}>SATURDAY 16 MAY · LUTEAL DAY 22</p>
          <h1 style={pageTitleStyle}>Today</h1>
          <p style={subStyle}>
            Eleven strips. Open what you need, leave the rest closed.
          </p>
        </div>
        <div style={massActionsStyle}>
          <button onClick={closeAll}             style={chipBtn(openCount === 0)}>Close all</button>
          <button onClick={() => openOnly(TODAY_IDS)} style={chipBtn(false)}>Open Today</button>
          <button onClick={() => openOnly(CYCLE_IDS)} style={chipBtn(false)}>Open Cycle</button>
        </div>
      </div>

      <div style={listStyle}>
        {STRIPS.map((s, idx) => {
          const open = openSet.has(s.id);
          const isCycle = s.group === "cycle";
          // Cycle group gets a subtle separator label above the first cycle strip.
          const showCycleHead = idx > 0 && isCycle && STRIPS[idx - 1].group !== "cycle";
          return (
            <div key={s.id}>
              {showCycleHead && (
                <div style={cycleSeparatorStyle}>
                  <span style={cycleSepLineStyle} />
                  <span style={cycleSepLabelStyle}>The bigger arc · Cycle</span>
                  <span style={cycleSepLineStyle} />
                </div>
              )}
              <Strip
                strip={s}
                open={open}
                onToggle={() => toggle(s.id)}
              />
            </div>
          );
        })}
      </div>

      <div style={footStyle}>
        <span style={footEyebrowStyle}>DEMO A · THE ACCORDION</span>
        <p style={footBodyStyle}>
          Same data as live Planner. Mass actions sit at the top so a one-tap
          tour is possible. Multiple strips can be open at once — the page is
          made of choices, not a fixed scroll.
        </p>
      </div>
    </div>
  );
}

// ─── Strip component ─────────────────────────────────────────────────────────
function Strip({ strip, open, onToggle }) {
  const { Icon, accent } = strip;
  return (
    <section style={{ ...stripStyle, borderColor: open ? accent : "rgba(58,44,26,0.10)" }}>
      <button onClick={onToggle} style={stripHeadStyle} aria-expanded={open}>
        <span style={{ ...iconChipStyle, background: `${accent}1F`, color: accent }}>
          <Icon size={14} />
        </span>
        <span style={stripLabelColStyle}>
          <span style={stripKickerStyle}>{strip.kicker}</span>
          <span style={stripLabelStyle}>{strip.label}</span>
        </span>
        <span style={stripSummaryStyle}>{strip.summary()}</span>
        {open
          ? <ChevronUp size={16} style={{ color: T.muted, flexShrink: 0 }} />
          : <ChevronDown size={16} style={{ color: T.muted, flexShrink: 0 }} />}
      </button>
      {open && (
        <div style={stripBodyStyle}>
          {renderBody(strip.id)}
        </div>
      )}
    </section>
  );
}

// ─── Per-strip body renderers ────────────────────────────────────────────────
function renderBody(id) {
  switch (id) {
    case "hero":      return <HeroBody />;
    case "smart":     return <SmartBody />;
    case "body":      return <BodyBody />;
    case "morning":   return <MorningBody />;
    case "bundles":   return <BundlesBody />;
    case "meds":      return <MedsBody />;
    case "tonight":   return <TonightBody />;
    case "shutdown":  return <ShutdownBody />;
    case "ribbon":    return <RibbonBody />;
    case "weekahead": return <WeekAheadBody />;
    case "rhythms":   return <RhythmsBody />;
    default: return null;
  }
}

function HeroBody() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <h3 style={bodyTitleStyle}>{MOCK.hero.title}</h3>
      <p style={bodyParaStyle}>{MOCK.hero.body}</p>
      <p style={{ ...bodyParaStyle, fontStyle: "italic", color: T.plumMute, marginTop: 2 }}>
        — Jess, your daily plan
      </p>
    </div>
  );
}

function SmartBody() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {["IDLE", "STREAKY", "STUCK", "DRIFTING", "QUIET"].map((s) => (
          <span key={s} style={{
            ...pillStyle,
            background: s === MOCK.smartView.state ? T.plum : "transparent",
            color: s === MOCK.smartView.state ? T.cream : T.plumSoft,
            borderColor: s === MOCK.smartView.state ? T.plum : "rgba(58,44,26,0.18)",
          }}>{s}</span>
        ))}
      </div>
      <div style={{ borderTop: "1px dashed rgba(58,44,26,0.16)", paddingTop: 10 }}>
        <p style={miniKickerStyle}>{MOCK.smartView.phase.toUpperCase()}</p>
        <h4 style={bodyTitleSmStyle}>{MOCK.smartView.title}</h4>
        <p style={bodyParaStyle}>{MOCK.smartView.body}</p>
        <p style={{ ...miniKickerStyle, marginTop: 8 }}>TODAY IS GOOD FOR</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
          {MOCK.smartView.chips.map((c) => (
            <span key={c} style={{ ...softChipStyle }}>
              <span style={{ width: 5, height: 5, borderRadius: 9999, background: T.sage, marginRight: 5 }} />
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function BodyBody() {
  const items = [
    { Icon: Moon,       label: "Sleep",     value: MOCK.body.sleep,     tone: "#4A2A3A" },
    { Icon: Zap,        label: "Energy",    value: MOCK.body.energy,    tone: "#A6862B" },
    { Icon: Heart,      label: "Mood",      value: MOCK.body.mood,      tone: "#D45E52" },
    { Icon: Droplets,   label: "Hydration", value: MOCK.body.hydration, tone: "#60B4FA" },
    { Icon: Footprints, label: "Movement",  value: MOCK.body.movement,  tone: "#6B8F5A" },
    { Icon: CircleDot,  label: "Cycle",     value: MOCK.body.cycle,     tone: "#9A2845" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
      {items.map((it) => (
        <div key={it.label} style={pillarTileStyle}>
          <span style={{ ...iconChipStyle, background: `${it.tone}1F`, color: it.tone, width: 22, height: 22 }}>
            <it.Icon size={12} />
          </span>
          <div>
            <div style={pillarValueStyle}>{it.value}</div>
            <div style={pillarLabelStyle}>{it.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MorningBody() {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
      {MOCK.morning.map((r) => (
        <li key={r.name} style={morningRowStyle}>
          <span style={{
            ...checkCircleStyle,
            background: r.done ? T.sage : "transparent",
            borderColor: r.done ? T.sage : "rgba(58,44,26,0.22)",
          }}>
            {r.done && <Sparkles size={9} style={{ color: T.cream }} />}
          </span>
          <span style={{
            fontFamily: "'Inter', sans-serif", fontSize: 13,
            color: r.done ? T.plumMute : T.plum,
            textDecoration: r.done ? "line-through" : "none",
          }}>
            {r.name}
          </span>
        </li>
      ))}
    </ul>
  );
}

function BundlesBody() {
  return (
    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
      {MOCK.ritualBundles.map((b) => (
        <div key={b.key} style={{
          ...bundleCardStyle,
          borderColor: b.forToday ? b.accent : "rgba(58,44,26,0.10)",
          boxShadow: b.forToday ? `0 4px 12px ${b.accent}22` : "0 1px 4px rgba(58,44,26,0.04)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 9999, background: b.accent }} />
            <span style={bundleTitleStyle}>{b.title}</span>
            {b.forToday && <span style={forTodayPillStyle}>FOR TODAY</span>}
          </div>
          <p style={bundleSubStyle}>{b.sub}</p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 3 }}>
            {b.rituals.map((r) => (
              <li key={r} style={bundleRitualStyle}>
                <Sparkles size={9} style={{ color: b.accent }} /> {r}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function MedsBody() {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
      {MOCK.medications.map((m) => (
        <li key={m.name} style={medRowStyle}>
          <span style={{ ...iconChipStyle, background: `${m.tone}24`, color: m.tone }}>
            <Pill size={12} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={medNameStyle}>{m.name}</div>
            <div style={medTimeStyle}>{m.time}</div>
          </div>
          <button style={medActionStyle}>Share with my GP →</button>
        </li>
      ))}
    </ul>
  );
}

function TonightBody() {
  return (
    <div>
      <p style={miniKickerStyle}>{MOCK.tonight.eyebrow}</p>
      <h4 style={bodyTitleSmStyle}>{MOCK.tonight.title}</h4>
      <p style={bodyParaStyle}>{MOCK.tonight.body}</p>
    </div>
  );
}

function ShutdownBody() {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 7 }}>
      {MOCK.shutdown.map((s, i) => (
        <li key={s} style={shutdownRowStyle}>
          <span style={shutdownDotStyle}>{i + 1}</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.plum }}>{s}</span>
        </li>
      ))}
    </ul>
  );
}

function RibbonBody() {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} style={ribbonHeadStyle}>{d}</span>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
        {Object.entries(PHASE_TINT).map(([k, v]) => (
          <span key={k} style={ribbonLegendChip}>
            <span style={{ width: 8, height: 8, borderRadius: 9999, background: v }} />
            {k}
          </span>
        ))}
        <span style={ribbonLegendChip}>
          <span style={{ width: 8, height: 8, borderRadius: 9999, background: "transparent", border: `1px dashed ${T.plumMute}` }} />
          predicted
        </span>
      </div>
    </div>
  );
}

function WeekAheadBody() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
      {MOCK.weekAhead.map((d) => {
        const tint = PHASE_TINT[d.phase] || T.muted;
        return (
          <div key={d.date} style={weekTileStyle}>
            <span style={weekDayStyle}>{d.day}</span>
            <span style={weekDateStyle}>{d.date}</span>
            <span style={{ ...weekBarStyle, background: `${tint}22` }}>
              <span style={{ width: `${d.capacity * 100}%`, height: "100%", background: tint, borderRadius: 4 }} />
            </span>
            <span style={weekHintStyle}>{d.hint}</span>
          </div>
        );
      })}
    </div>
  );
}

function RhythmsBody() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {MOCK.rhythms.map((r) => (
        <div key={r.name} style={rhythmRowStyle}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={rhythmNameStyle}>{r.name}</span>
              {r.active && <span style={activeChipStyle}>ACTIVE</span>}
            </div>
            <div style={rhythmSubStyle}>{r.sub}</div>
          </div>
          <div style={rhythmPctStyle}>
            <span style={{ ...rhythmBarStyle, width: `${r.pct}%`, background: r.active ? T.sage : T.plumMute }} />
            <span style={rhythmPctTextStyle}>{r.pct}%</span>
          </div>
        </div>
      ))}
      <div style={insightCardStyle}>
        <span style={insightKickerStyle}>WEEKLY INSIGHT</span>
        <p style={insightTextStyle}>{MOCK.weeklyInsight}</p>
      </div>
    </div>
  );
}

// ── chipBtn helper ─────────────────────────────────────────────────────────
function chipBtn(active) {
  return {
    fontFamily: "'Inter', sans-serif",
    fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
    padding: "7px 12px", borderRadius: 9999,
    background: active ? T.plum : "transparent",
    color: active ? T.cream : T.plumSoft,
    border: `1px solid ${active ? T.plum : "rgba(58,44,26,0.18)"}`,
    cursor: "pointer",
  };
}

// ── Styles ────────────────────────────────────────────────────────────────
const shellStyle = {
  background: T.cream, minHeight: "100vh",
  padding: "26px 14px 40px",
  fontFamily: "'Inter', system-ui, sans-serif",
};
const headStyle = {
  maxWidth: 560, margin: "0 auto 16px",
  display: "flex", flexDirection: "column", gap: 10,
};
const titleBlockStyle = { display: "flex", flexDirection: "column", gap: 4 };
const eyebrowStyle = {
  fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
  color: T.muted, fontWeight: 700, margin: 0,
};
const pageTitleStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 36, fontWeight: 500, color: T.espresso,
  letterSpacing: "-0.02em", margin: "4px 0 4px", lineHeight: 1.05,
};
const subStyle = {
  fontSize: 13, color: T.plumSoft, margin: 0, lineHeight: 1.5,
};
const massActionsStyle = {
  display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4,
};

const listStyle = {
  maxWidth: 560, margin: "0 auto",
  display: "flex", flexDirection: "column", gap: 8,
};
const stripStyle = {
  background: T.paper, borderRadius: 14,
  border: "1.5px solid",
  boxShadow: "0 1px 4px rgba(58,44,26,0.04)",
  overflow: "hidden",
};
const stripHeadStyle = {
  width: "100%",
  display: "flex", alignItems: "center", gap: 10,
  padding: "12px 14px",
  background: "transparent",
  border: "none", cursor: "pointer",
  textAlign: "left", fontFamily: "inherit",
};
const iconChipStyle = {
  width: 28, height: 28, borderRadius: 9,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const stripLabelColStyle = {
  display: "flex", flexDirection: "column", flexShrink: 0, minWidth: 110,
};
const stripKickerStyle = {
  fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
  color: T.muted, fontWeight: 700,
};
const stripLabelStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 15, fontWeight: 500, color: T.espresso,
  letterSpacing: "-0.005em", lineHeight: 1.2,
};
const stripSummaryStyle = {
  flex: 1, minWidth: 0,
  fontSize: 12, color: T.plumSoft, lineHeight: 1.4,
  textAlign: "right",
  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
};
const stripBodyStyle = {
  padding: "10px 16px 16px",
  borderTop: "1px solid rgba(58,44,26,0.08)",
};

const cycleSeparatorStyle = {
  display: "flex", alignItems: "center", gap: 10,
  margin: "12px 6px 4px",
};
const cycleSepLineStyle = {
  flex: 1, height: 1, background: "rgba(58,44,26,0.12)",
};
const cycleSepLabelStyle = {
  fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
  color: T.muted, fontWeight: 700,
};

// Body styles
const bodyTitleStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 19, fontWeight: 500, color: T.espresso,
  margin: 0, lineHeight: 1.25, letterSpacing: "-0.01em",
};
const bodyTitleSmStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 16, fontWeight: 500, color: T.espresso,
  margin: "2px 0 6px", lineHeight: 1.25,
};
const bodyParaStyle = {
  fontSize: 13, color: T.plum, lineHeight: 1.55, margin: 0,
};
const miniKickerStyle = {
  fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
  color: T.muted, fontWeight: 700, margin: 0,
};
const pillStyle = {
  fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
  padding: "3px 8px", borderRadius: 9999,
  border: "1px solid",
};
const softChipStyle = {
  display: "inline-flex", alignItems: "center",
  fontSize: 11, color: T.plum,
  padding: "4px 8px", borderRadius: 9999,
  background: T.cream, border: "1px solid rgba(58,44,26,0.10)",
};

const pillarTileStyle = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "8px 10px", borderRadius: 10,
  background: T.cream,
  border: "1px solid rgba(58,44,26,0.08)",
};
const pillarValueStyle = {
  fontSize: 13, fontWeight: 700, color: T.plum, lineHeight: 1.1,
};
const pillarLabelStyle = {
  fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
  color: T.muted, fontWeight: 600, marginTop: 1,
};

const morningRowStyle = {
  display: "flex", alignItems: "center", gap: 10,
};
const checkCircleStyle = {
  width: 20, height: 20, borderRadius: 9999,
  border: "1.5px solid",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};

const bundleCardStyle = {
  flex: "0 0 200px", scrollSnapAlign: "start",
  background: T.paper,
  border: "1px solid",
  borderRadius: 14, padding: "10px 12px",
  display: "flex", flexDirection: "column", gap: 4,
};
const bundleTitleStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 15, fontWeight: 500, color: T.plum,
};
const forTodayPillStyle = {
  marginLeft: "auto",
  fontSize: 8, fontWeight: 700, letterSpacing: "0.14em",
  background: "rgba(168,134,75,0.16)", color: T.goldDeep,
  padding: "2px 6px", borderRadius: 9999,
};
const bundleSubStyle = {
  fontFamily: "Cormorant Garamond, Georgia, serif", fontStyle: "italic",
  fontSize: 11, color: T.plumSoft, margin: 0, lineHeight: 1.3,
};
const bundleRitualStyle = {
  display: "flex", alignItems: "center", gap: 4,
  fontSize: 11, color: T.plum, lineHeight: 1.3,
};

const medRowStyle = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "8px 10px", borderRadius: 10,
  background: T.cream,
};
const medNameStyle = {
  fontSize: 13, fontWeight: 700, color: T.plum, lineHeight: 1.2,
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
  background: T.cream, border: "1px solid rgba(58,44,26,0.16)",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  fontSize: 10, fontWeight: 700, color: T.plum,
};

const ribbonHeadStyle = {
  fontSize: 9, letterSpacing: "0.12em",
  textAlign: "center", color: T.muted, fontWeight: 700,
};
const ribbonCellStyle = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  borderRadius: 8, padding: "6px 0",
  fontSize: 11, fontFamily: "'Inter', sans-serif",
  border: "1px solid",
};
const ribbonLegendChip = {
  display: "inline-flex", alignItems: "center", gap: 5,
  fontSize: 10, color: T.plumSoft, fontWeight: 600,
  letterSpacing: "0.06em",
};

const weekTileStyle = {
  display: "flex", flexDirection: "column", alignItems: "center",
  gap: 4, padding: "8px 4px", borderRadius: 10,
  background: T.cream, border: "1px solid rgba(58,44,26,0.08)",
};
const weekDayStyle = {
  fontSize: 9, letterSpacing: "0.14em", color: T.muted, fontWeight: 700,
};
const weekDateStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 14, fontWeight: 500, color: T.plum,
};
const weekBarStyle = {
  width: "100%", height: 4, borderRadius: 4, overflow: "hidden",
};
const weekHintStyle = {
  fontSize: 8.5, color: T.plumMute, textAlign: "center",
  lineHeight: 1.2,
};

const rhythmRowStyle = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "8px 10px", borderRadius: 10,
  background: T.cream,
};
const rhythmNameStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 14, fontWeight: 500, color: T.plum,
};
const activeChipStyle = {
  fontSize: 8, fontWeight: 700, letterSpacing: "0.14em",
  color: T.sage, background: T.sageSoft,
  padding: "2px 5px", borderRadius: 9999,
};
const rhythmSubStyle = {
  fontSize: 10.5, color: T.plumMute, marginTop: 1,
};
const rhythmPctStyle = {
  position: "relative", width: 70, height: 16,
  background: "rgba(58,44,26,0.08)", borderRadius: 9999, overflow: "hidden",
};
const rhythmBarStyle = {
  position: "absolute", inset: 0, borderRadius: 9999,
};
const rhythmPctTextStyle = {
  position: "absolute", inset: 0,
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: 9, fontWeight: 700, color: T.cream, letterSpacing: "0.04em",
};
const insightCardStyle = {
  marginTop: 6, padding: "12px 14px",
  background: T.cream, borderRadius: 12,
  border: `1px dashed rgba(58,44,26,0.20)`,
};
const insightKickerStyle = {
  fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
  color: T.goldDeep, fontWeight: 700,
};
const insightTextStyle = {
  fontFamily: "Cormorant Garamond, Georgia, serif", fontStyle: "italic",
  fontSize: 13, color: T.plum, lineHeight: 1.55, margin: "4px 0 0",
};

const footStyle = {
  maxWidth: 560, margin: "20px auto 0",
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
