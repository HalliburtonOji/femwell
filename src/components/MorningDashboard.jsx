// ─────────────────────────────────────────────────────────────────────────────
// MorningDashboard — Demo B of the "Combined Today+Cycle" exploration.
//
// Hypothesis: instead of a fixed-order scroll, paint the day as a dashboard
// of cards grouped by TIME OF DAY. Each time block (Morning · Midday · Late
// afternoon · Evening) has its own row of cards. A "NOW" marker travels
// down the dashboard so the user always sees which section is "live."
//
// The card masonry varies the SIZE of each tile by importance for that time
// of day — e.g. Morning stack is large at 7am, shrinks to a check-the-tick
// summary at 5pm. This means the page changes shape over the day.
//
// Mock: Sat 16 May 2026, luteal day 22, current time = 9:15 (so "Morning"
// is the NOW band). All other time bands render their cards in a calmer,
// smaller treatment.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import {
  Sun, Cloud, Sunset, Moon, Sparkles, TrendingUp, Calendar, Heart,
  Pill, BedDouble, Repeat, Zap, BookOpen, ChevronRight, Footprints,
  Droplets, CircleDot,
} from "lucide-react";

const T = {
  cream:    "#F4EDDB",
  paper:    "#FFFFFF",
  paperWarm:"#FBF6E6",
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

// ── Mock dataset (mirrors Accordion's so the user can compare 1:1) ──────────
const MOCK = {
  now: { hour: 9, min: 15, label: "9:15 AM" },     // demo "now"
  cycle: { day: 22, len: 28, phase: "luteal", daysToPeriod: 6, confidence: 84 },
  body: [
    { id: "sleep",     Icon: Moon,       label: "Sleep",     value: "7.2h",  tone: "#4A2A3A" },
    { id: "energy",    Icon: Zap,        label: "Energy",    value: "68%",   tone: "#A6862B" },
    { id: "mood",      Icon: Heart,      label: "Mood",      value: "60%",   tone: "#D45E52" },
    { id: "hydration", Icon: Droplets,   label: "Hydration", value: "6/8",   tone: "#60B4FA" },
    { id: "movement",  Icon: Footprints, label: "Movement",  value: "20m",   tone: "#6B8F5A" },
    { id: "cycle",     Icon: CircleDot,  label: "Cycle",     value: "Day 22",tone: "#9A2845" },
  ],
  hero: {
    eyebrow: "TODAY · LUTEAL DAY 22 · 6 days to period",
    title: "A softer landing this week",
    body: "Luteal days often invite a different pace — depth over breadth, careful over many.",
  },
  morning: [
    { name: "Drink water",      done: true },
    { name: "Morning walk",     done: true },
    { name: "5-minute reading", done: false },
  ],
  smartView: {
    state: "STUCK",
    title: "Inner reflection and release",
    body: "Even one ritual logged shifts the day. Anchor first, the rest follows.",
    chips: ["finishing edits", "reflection", "warming meals"],
  },
  bundleForToday: {
    title: "Settle",
    sub: "Soft edges, honest hours",
    accent: "#7B5E9A",
    rituals: ["Journal · 5m", "Magnesium at dinner", "Wind-down walk"],
  },
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
  meds: [{ name: "Estradiol patch · 50mcg", time: "21:00 · tonight" }],
  shutdown: [
    "Close every open tab.",
    "Write tomorrow's one anchor on paper.",
    "Stand up and stretch for thirty seconds.",
  ],
  rhythms: [
    { name: "Luteal Softness", pct: 67, active: true },
    { name: "Warm Cycle",      pct: 86 },
    { name: "Quiet Practice",  pct: 42 },
  ],
  weeklyInsight: "Three weeks of luteal logs suggest your slowest day usually lands Day 23. Plan softer.",
};

const TIME_BANDS = [
  { id: "morning",   label: "Morning",   range: "until noon",        Icon: Sun,    accent: T.gold,    startHour: 5,  endHour: 12 },
  { id: "midday",    label: "Midday",    range: "noon — 3 pm",       Icon: Cloud,  accent: T.sage,    startHour: 12, endHour: 15 },
  { id: "afternoon", label: "Late afternoon", range: "3 — 6 pm",     Icon: Cloud,  accent: T.follicular, startHour: 15, endHour: 18 },
  { id: "evening",   label: "Evening",   range: "after 6 pm",        Icon: Sunset, accent: T.luteal,  startHour: 18, endHour: 24 },
];

function currentBandId(hour) {
  const b = TIME_BANDS.find((t) => hour >= t.startHour && hour < t.endHour);
  return b ? b.id : "morning";
}

// ── Component ──────────────────────────────────────────────────────────────
export default function MorningDashboard() {
  // Letting the user scrub the "now" hour helps demo how the dashboard
  // changes shape across the day. Defaults to mock 9:15.
  const [now, setNow] = useState(MOCK.now);
  const liveBand = useMemo(() => currentBandId(now.hour), [now.hour]);

  function scrub(hour) {
    setNow({ hour, min: 0, label: `${((hour + 11) % 12) + 1}:00 ${hour < 12 ? "AM" : "PM"}` });
  }

  return (
    <div style={shellStyle}>
      <header style={headStyle}>
        <p style={eyebrowStyle}>SATURDAY 16 MAY · {MOCK.hero.eyebrow}</p>
        <h1 style={pageTitleStyle}>Good morning.</h1>
        <p style={subStyle}>
          A dashboard that changes shape over the day. The <b>NOW</b> band gets
          the biggest cards; the others sit quietly until their hour.
        </p>
        <div style={nowScrubRow}>
          <span style={miniKickerStyle}>SCRUB · {now.label}</span>
          <div style={scrubBarOuter}>
            {Array.from({ length: 24 }).map((_, h) => (
              <button
                key={h}
                onClick={() => scrub(h)}
                style={{
                  ...scrubTick,
                  background: h === now.hour ? T.espresso : (h >= 5 && h < 24 ? "rgba(58,44,26,0.12)" : "rgba(58,44,26,0.05)"),
                  height: h === now.hour ? 18 : 8,
                }}
                aria-label={`Set time to ${h}:00`}
              />
            ))}
          </div>
        </div>
      </header>

      <main style={dashStyle}>
        {TIME_BANDS.map((band) => (
          <Band
            key={band.id}
            band={band}
            isLive={band.id === liveBand}
            mock={MOCK}
          />
        ))}

        {/* Always-on footer: rhythms + insight */}
        <section style={alwaysOnStyle}>
          <div style={alwaysOnHeadStyle}>
            <BookOpen size={14} style={{ color: T.sage }} />
            <span style={miniKickerStyle}>ALWAYS ON · PATTERNS</span>
          </div>
          <div style={alwaysOnGridStyle}>
            <div style={rhythmListStyle}>
              {MOCK.rhythms.map((r) => (
                <div key={r.name} style={rhythmRowStyle}>
                  <div style={{ flex: 1 }}>
                    <div style={rhythmNameStyle}>
                      {r.name}
                      {r.active && <span style={activeChipStyle}>ACTIVE</span>}
                    </div>
                  </div>
                  <div style={rhythmBarOuter}>
                    <span style={{
                      ...rhythmBarInner,
                      width: `${r.pct}%`,
                      background: r.active ? T.sage : T.plumMute,
                    }} />
                  </div>
                  <span style={rhythmPctTextStyle}>{r.pct}%</span>
                </div>
              ))}
            </div>
            <div style={insightTileStyle}>
              <span style={insightKickerStyle}>WEEKLY INSIGHT</span>
              <p style={insightTextStyle}>{MOCK.weeklyInsight}</p>
            </div>
          </div>
        </section>
      </main>

      <footer style={footStyle}>
        <span style={footEyebrowStyle}>DEMO B · THE MORNING DASHBOARD</span>
        <p style={footBodyStyle}>
          Cards grouped by time of day. The live band promotes its cards;
          the others recede. Drag the scrub to see the dashboard re-shape.
        </p>
      </footer>
    </div>
  );
}

// ── Band component ─────────────────────────────────────────────────────────
function Band({ band, isLive, mock }) {
  return (
    <section style={{
      ...bandStyle,
      borderColor: isLive ? band.accent : "rgba(58,44,26,0.08)",
      background: isLive ? T.paper : "transparent",
      boxShadow: isLive ? `0 4px 18px ${band.accent}1F` : "none",
    }}>
      <div style={bandHeadStyle}>
        <span style={{
          ...bandIconStyle,
          background: `${band.accent}1F`,
          color: band.accent,
        }}>
          <band.Icon size={14} />
        </span>
        <span style={bandLabelStyle}>{band.label}</span>
        <span style={bandRangeStyle}>· {band.range}</span>
        {isLive && <span style={nowPipStyle}>NOW</span>}
      </div>

      <div style={{
        ...bandBodyStyle,
        // When live, give the band a 2-column "feature" grid; otherwise a compact row.
        gridTemplateColumns: isLive ? "1.4fr 1fr" : "1fr 1fr 1fr",
        opacity: isLive ? 1 : 0.78,
      }}>
        {renderBandCards(band.id, isLive, mock)}
      </div>
    </section>
  );
}

function renderBandCards(bandId, isLive, mock) {
  switch (bandId) {
    case "morning":
      return (
        <>
          <Card kind={isLive ? "feature" : "small"} accent={T.gold} title="Today's mood" eyebrow="FROM JESS" Icon={Sparkles}>
            <h3 style={cardTitleStyle}>{mock.hero.title}</h3>
            <p style={cardBodyStyle}>{mock.hero.body}</p>
          </Card>
          <Card kind={isLive ? "feature" : "small"} accent={T.plum} title="Morning stack" eyebrow="RITUALS" Icon={Sun}>
            <ul style={stackListStyle}>
              {mock.morning.map((r) => (
                <li key={r.name} style={stackLine}>
                  <span style={{
                    ...stackTick,
                    background: r.done ? T.sage : "transparent",
                    borderColor: r.done ? T.sage : "rgba(58,44,26,0.22)",
                  }}>
                    {r.done && <Sparkles size={8} style={{ color: T.cream }} />}
                  </span>
                  <span style={{
                    ...stackText,
                    color: r.done ? T.plumMute : T.plum,
                    textDecoration: r.done ? "line-through" : "none",
                  }}>{r.name}</span>
                </li>
              ))}
            </ul>
            <p style={stackFootStyle}>
              {mock.morning.filter((r) => r.done).length}/{mock.morning.length} kept · 1 left
            </p>
          </Card>
          <Card kind="small" accent={T.plum} title="Your body" eyebrow="PILLARS" Icon={Heart}>
            <div style={bodyGridStyle}>
              {mock.body.map((b) => (
                <div key={b.id} style={bodyTileStyle}>
                  <span style={{
                    ...bodyIconStyle,
                    background: `${b.tone}1F`,
                    color: b.tone,
                  }}>
                    <b.Icon size={10} />
                  </span>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: T.plum, lineHeight: 1.05 }}>{b.value}</div>
                </div>
              ))}
            </div>
          </Card>
        </>
      );

    case "midday":
      return (
        <>
          <Card kind={isLive ? "feature" : "small"} accent={T.luteal} title="Right now" eyebrow="SMART VIEW" Icon={TrendingUp}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
              <span style={{ ...statePill, background: T.plum, color: T.cream, borderColor: T.plum }}>{mock.smartView.state}</span>
              <span style={statePill}>IDLE</span><span style={statePill}>STREAKY</span><span style={statePill}>DRIFTING</span>
            </div>
            <h4 style={cardTitleSmStyle}>{mock.smartView.title}</h4>
            <p style={cardBodyStyle}>{mock.smartView.body}</p>
          </Card>
          <Card kind={isLive ? "medium" : "small"} accent={mock.bundleForToday.accent} title="For today" eyebrow="RITUAL BUNDLE" Icon={Repeat}>
            <h4 style={{ ...cardTitleSmStyle, color: mock.bundleForToday.accent }}>{mock.bundleForToday.title}</h4>
            <p style={{ ...cardBodyStyle, fontStyle: "italic" }}>{mock.bundleForToday.sub}</p>
            <ul style={{ ...stackListStyle, marginTop: 6 }}>
              {mock.bundleForToday.rituals.map((r) => (
                <li key={r} style={{ ...stackLine, gap: 5 }}>
                  <Sparkles size={9} style={{ color: mock.bundleForToday.accent, flexShrink: 0 }} />
                  <span style={{ ...stackText, fontSize: 11.5 }}>{r}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card kind="small" accent={T.sage} title="Today is good for" eyebrow="CHIPS" Icon={Sparkles}>
            <div style={chipBowlStyle}>
              {mock.smartView.chips.map((c) => (
                <span key={c} style={softChipStyle}>
                  <span style={{ width: 4, height: 4, borderRadius: 9999, background: T.sage, marginRight: 4 }} />
                  {c}
                </span>
              ))}
            </div>
          </Card>
        </>
      );

    case "afternoon":
      return (
        <>
          <Card kind={isLive ? "feature" : "small"} accent={T.follicular} title="Week ahead" eyebrow="PREDICTED" Icon={TrendingUp}>
            <div style={weekStripStyle}>
              {mock.weekAhead.map((d) => {
                const tint = PHASE_TINT[d.phase] || T.muted;
                return (
                  <div key={d.date} style={weekTileStyle}>
                    <span style={weekDayStyle}>{d.day}</span>
                    <span style={weekDateStyle}>{d.date}</span>
                    <span style={{ ...weekBarStyle, background: `${tint}22` }}>
                      <span style={{ width: `${d.cap * 100}%`, height: "100%", background: tint, borderRadius: 4, display: "block" }} />
                    </span>
                  </div>
                );
              })}
            </div>
            <p style={{ ...cardBodyStyle, marginTop: 6, fontSize: 11.5 }}>
              Luteal slope → Friday period · plan softer.
            </p>
          </Card>
          <Card kind={isLive ? "medium" : "small"} accent={T.luteal} title="Cycle ribbon" eyebrow="MAY 2026" Icon={Calendar}>
            <p style={cardBodyStyle}>
              Day <b>{mock.cycle.day}</b> of {mock.cycle.len} · period in <b>{mock.cycle.daysToPeriod} days</b>
            </p>
            <div style={ribbonMiniStyle}>
              {Array.from({ length: 28 }).map((_, i) => {
                const dayNum = i + 1;
                const isToday = dayNum === mock.cycle.day;
                let p = "luteal";
                if (dayNum <= 5) p = "menstrual";
                else if (dayNum <= 13) p = "follicular";
                else if (dayNum <= 16) p = "ovulatory";
                return (
                  <span key={i} style={{
                    ...ribbonDotStyle,
                    background: PHASE_TINT[p],
                    transform: isToday ? "scale(1.4)" : "scale(1)",
                    border: isToday ? `1.5px solid ${T.espresso}` : "none",
                  }} title={`Day ${dayNum}`} />
                );
              })}
            </div>
          </Card>
        </>
      );

    case "evening":
      return (
        <>
          <Card kind={isLive ? "feature" : "small"} accent={T.luteal} title="Tonight" eyebrow="WIND-DOWN · 30 MIN" Icon={BedDouble}>
            <h4 style={cardTitleSmStyle}>{mock.tonight.title}</h4>
            <p style={cardBodyStyle}>{mock.tonight.body}</p>
          </Card>
          <Card kind={isLive ? "medium" : "small"} accent={T.blush} title="Medications" eyebrow="TONIGHT" Icon={Pill}>
            {mock.meds.map((m) => (
              <div key={m.name} style={medRow}>
                <div style={{ flex: 1 }}>
                  <div style={medName}>{m.name}</div>
                  <div style={medTime}>{m.time}</div>
                </div>
                <ChevronRight size={14} style={{ color: T.plumMute }} />
              </div>
            ))}
          </Card>
          <Card kind="small" accent={T.rose} title="Shutdown ritual" eyebrow="5 MIN" Icon={Heart}>
            <ul style={{ ...stackListStyle, gap: 5 }}>
              {mock.shutdown.map((s, i) => (
                <li key={s} style={{ ...stackLine, alignItems: "flex-start" }}>
                  <span style={shutdownDot}>{i + 1}</span>
                  <span style={{ ...stackText, fontSize: 11, lineHeight: 1.35 }}>{s}</span>
                </li>
              ))}
            </ul>
          </Card>
        </>
      );

    default:
      return null;
  }
}

const PHASE_TINT = {
  menstrual: T.menstrual,
  follicular: T.follicular,
  ovulatory: T.ovulatory,
  luteal: T.luteal,
};

// ── Card primitive ─────────────────────────────────────────────────────────
function Card({ kind, accent, eyebrow, title, Icon, children }) {
  // kind: "feature" | "medium" | "small"
  const spanCol = kind === "feature" ? "span 1" : (kind === "medium" ? "span 1" : "span 1");
  const minH = kind === "feature" ? 170 : (kind === "medium" ? 140 : 110);
  return (
    <article style={{
      ...cardStyle,
      gridColumn: spanCol,
      minHeight: minH,
      borderColor: kind === "feature" ? accent : "rgba(58,44,26,0.10)",
    }}>
      <div style={cardHeadStyle}>
        <span style={{
          ...cardIconStyle,
          background: `${accent}1F`,
          color: accent,
        }}>
          <Icon size={11} />
        </span>
        <span style={cardEyebrowStyle}>{eyebrow}</span>
      </div>
      <h5 style={cardKickerTitleStyle}>{title}</h5>
      <div style={cardChildrenStyle}>{children}</div>
    </article>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────
const shellStyle = {
  background: T.cream, minHeight: "100vh",
  padding: "26px 14px 40px",
  fontFamily: "'Inter', system-ui, sans-serif",
};
const headStyle = {
  maxWidth: 880, margin: "0 auto 18px",
  display: "flex", flexDirection: "column", gap: 6,
};
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

const nowScrubRow = {
  display: "flex", flexDirection: "column", gap: 6,
  marginTop: 10,
};
const scrubBarOuter = {
  display: "flex", gap: 3, alignItems: "flex-end",
  padding: "6px 8px", borderRadius: 9999,
  background: T.paperWarm, border: "1px solid rgba(58,44,26,0.08)",
};
const scrubTick = {
  flex: 1, minWidth: 4,
  border: "none", borderRadius: 9999,
  cursor: "pointer", padding: 0,
  transition: "height 180ms ease, background 180ms ease",
};

const dashStyle = {
  maxWidth: 880, margin: "0 auto",
  display: "flex", flexDirection: "column", gap: 14,
};

// ── Band ────────────────────────────────────────────────────────────────
const bandStyle = {
  borderRadius: 18,
  border: "1.5px solid",
  padding: "14px 14px 14px",
  transition: "all 250ms ease",
};
const bandHeadStyle = {
  display: "flex", alignItems: "center", gap: 8,
  marginBottom: 10,
};
const bandIconStyle = {
  width: 26, height: 26, borderRadius: 9,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const bandLabelStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 16, fontWeight: 500, color: T.espresso,
  letterSpacing: "-0.005em",
};
const bandRangeStyle = {
  fontSize: 11, color: T.muted, fontStyle: "italic",
};
const nowPipStyle = {
  marginLeft: "auto",
  fontSize: 9, fontWeight: 700, letterSpacing: "0.18em",
  background: T.espresso, color: T.cream,
  padding: "3px 8px", borderRadius: 9999,
};
const bandBodyStyle = {
  display: "grid",
  gap: 8,
  transition: "opacity 250ms ease",
};

// ── Card ────────────────────────────────────────────────────────────────
const cardStyle = {
  background: T.paper,
  borderRadius: 14,
  border: "1.5px solid",
  padding: "10px 12px",
  boxShadow: "0 1px 4px rgba(58,44,26,0.04)",
  display: "flex", flexDirection: "column",
  gap: 4,
  overflow: "hidden",
};
const cardHeadStyle = {
  display: "flex", alignItems: "center", gap: 6,
};
const cardIconStyle = {
  width: 20, height: 20, borderRadius: 7,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const cardEyebrowStyle = {
  fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
  color: T.muted, fontWeight: 700,
};
const cardKickerTitleStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 15, fontWeight: 500, color: T.espresso,
  letterSpacing: "-0.005em",
  margin: 0, lineHeight: 1.2,
};
const cardChildrenStyle = {
  display: "flex", flexDirection: "column", gap: 4, marginTop: 2,
};

const cardTitleStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 16, fontWeight: 500, color: T.plum,
  margin: 0, lineHeight: 1.25,
};
const cardTitleSmStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 14, fontWeight: 500, color: T.plum,
  margin: 0, lineHeight: 1.2,
};
const cardBodyStyle = {
  fontSize: 12, color: T.plumSoft, margin: 0, lineHeight: 1.5,
};
const miniKickerStyle = {
  fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
  color: T.muted, fontWeight: 700,
};

// ── Morning specifics ───────────────────────────────────────────────────
const stackListStyle = {
  listStyle: "none", padding: 0, margin: "4px 0 0",
  display: "flex", flexDirection: "column", gap: 4,
};
const stackLine = {
  display: "flex", alignItems: "center", gap: 6,
};
const stackTick = {
  width: 14, height: 14, borderRadius: 9999,
  border: "1.5px solid",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const stackText = {
  fontSize: 12, fontFamily: "'Inter', sans-serif",
};
const stackFootStyle = {
  fontSize: 10, color: T.muted, margin: "6px 0 0",
  fontStyle: "italic",
};

const bodyGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 4,
  marginTop: 4,
};
const bodyTileStyle = {
  display: "flex", alignItems: "center", gap: 4,
  padding: "4px 6px", borderRadius: 8,
  background: T.cream,
};
const bodyIconStyle = {
  width: 16, height: 16, borderRadius: 5,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};

// ── Midday specifics ─────────────────────────────────────────────────────
const statePill = {
  fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
  padding: "2px 7px", borderRadius: 9999,
  background: "transparent", color: T.plumSoft,
  border: "1px solid rgba(58,44,26,0.18)",
};
const chipBowlStyle = {
  display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4,
};
const softChipStyle = {
  display: "inline-flex", alignItems: "center",
  fontSize: 10.5, color: T.plum,
  padding: "3px 7px", borderRadius: 9999,
  background: T.cream, border: "1px solid rgba(58,44,26,0.10)",
};

// ── Afternoon specifics ──────────────────────────────────────────────────
const weekStripStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: 4, marginTop: 4,
};
const weekTileStyle = {
  display: "flex", flexDirection: "column", alignItems: "center",
  gap: 2, padding: "5px 2px", borderRadius: 8,
  background: T.cream, border: "1px solid rgba(58,44,26,0.06)",
};
const weekDayStyle = {
  fontSize: 8, letterSpacing: "0.12em", color: T.muted, fontWeight: 700,
};
const weekDateStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 13, fontWeight: 500, color: T.plum,
};
const weekBarStyle = {
  width: "100%", height: 3, borderRadius: 4, overflow: "hidden",
};
const ribbonMiniStyle = {
  display: "flex", gap: 3, marginTop: 6, flexWrap: "wrap",
};
const ribbonDotStyle = {
  width: 9, height: 9, borderRadius: 9999,
  display: "inline-block",
};

// ── Evening specifics ────────────────────────────────────────────────────
const medRow = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "6px 8px", borderRadius: 8,
  background: T.cream, marginTop: 2,
};
const medName = {
  fontSize: 12, fontWeight: 700, color: T.plum, lineHeight: 1.15,
};
const medTime = {
  fontSize: 10, color: T.plumMute, marginTop: 1,
};
const shutdownDot = {
  width: 14, height: 14, borderRadius: 9999,
  background: T.cream, border: "1px solid rgba(58,44,26,0.18)",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  fontSize: 9, fontWeight: 700, color: T.plum,
  flexShrink: 0,
};

// ── Always-on footer ─────────────────────────────────────────────────────
const alwaysOnStyle = {
  marginTop: 6,
  padding: "12px 14px",
  borderRadius: 16,
  background: T.paperWarm,
  border: "1px dashed rgba(58,44,26,0.18)",
};
const alwaysOnHeadStyle = {
  display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
};
const alwaysOnGridStyle = {
  display: "grid",
  gridTemplateColumns: "1.4fr 1fr",
  gap: 10,
};
const rhythmListStyle = {
  display: "flex", flexDirection: "column", gap: 6,
};
const rhythmRowStyle = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "6px 10px", borderRadius: 10,
  background: T.paper,
};
const rhythmNameStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 13, fontWeight: 500, color: T.plum,
  display: "flex", alignItems: "center", gap: 5,
};
const activeChipStyle = {
  fontSize: 8, fontWeight: 700, letterSpacing: "0.14em",
  color: T.sage, background: T.sageSoft,
  padding: "2px 5px", borderRadius: 9999,
};
const rhythmBarOuter = {
  flex: 1, height: 4, borderRadius: 9999,
  background: "rgba(58,44,26,0.08)", overflow: "hidden",
  maxWidth: 110,
};
const rhythmBarInner = {
  display: "block", height: "100%", borderRadius: 9999,
};
const rhythmPctTextStyle = {
  fontSize: 10, fontWeight: 700, color: T.plumMute, minWidth: 28, textAlign: "right",
};

const insightTileStyle = {
  padding: "10px 12px", borderRadius: 12,
  background: T.paper, border: `1px solid rgba(58,44,26,0.08)`,
};
const insightKickerStyle = {
  fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
  color: T.goldDeep, fontWeight: 700,
};
const insightTextStyle = {
  fontFamily: "Georgia, serif", fontStyle: "italic",
  fontSize: 12, color: T.plum, lineHeight: 1.5, margin: "4px 0 0",
};

// ── Foot ─────────────────────────────────────────────────────────────────
const footStyle = {
  maxWidth: 880, margin: "20px auto 0",
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
