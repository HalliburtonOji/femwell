// ─────────────────────────────────────────────────────────────────────────────
// MissionControl — Concept 2 demo for /Ideas.
//
// LIGHT-CREAM rewrite (2026-05-17): switched from dark-cockpit theme to the
// FemWell day-mode palette so it sits alongside the rest of the app. Real
// Planner sections are woven into the deck — every visible task references
// an existing PlannerItems / HabitLogs / MedicationReminders entity, never
// a generic mock.
//
// Layout (top → bottom):
//   · Life-stage banner (collapsible) — pregnancy trimester / peri / etc
//   · Capacity gauge (SVG semicircle on cream) + 3-day arc side panel
//   · Recommended-rail badge (today's capacity → which rail)
//   · Three rails (LIGHT / BALANCED / INTENSIVE) populated from real
//     Planner sections (Morning Stack, ritual bundles, meds, body tiles,
//     anchor tasks)
//   · Week energy strip (cream cells with capacity micro-bars)
//   · Command bar (espresso input area, gold primary CTA, "Care" chip
//     opens GP Export / Doctor-Ready Diary modal)
//   · Right-edge dock with two tabs: Body (6 tiles → DailyCheckins) and
//     Journey (Capacity Tax + 28-day Consistency + Doctor Diary + Astra
//     Cole sidecar + GP export button)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import {
  Zap, Scale, Flame, Briefcase, Pill, Sparkles, Activity,
  Pin, Plus, ChevronRight, ChevronLeft, Check, Mic,
  TrendingDown, TrendingUp, Clock, Mountain, Calendar,
  X, Moon, Heart, Droplets, AlertTriangle, Forward, Anchor,
  Stethoscope, Footprints, Baby, FileText, Star,
  HeartPulse, ClipboardList,
} from "lucide-react";

// ── Tokens (FemWell day-mode) ───────────────────────────────────────────────
const T = {
  cream:    "#F4EDDB",
  paper:    "#FBF6E6",
  paperUp:  "#FFFFFF",
  espresso: "#3A2C1A",
  espressoSoft: "rgba(58,44,26,0.10)",
  espressoMute: "rgba(58,44,26,0.18)",
  espressoDeep: "rgba(58,44,26,0.55)",
  plum:     "#4A2A3A",
  blush:    "#E8B4B8",
  sage:     "#8FAF8F",
  muted:    "#9B8B7A",
  mutedDeep:"#7A6A55",
  gold:     "#D4AF37",
  goldDeep: "#A6862B",
  rose:     "#D45E52",
};

// ── Mock data — every item maps to a real Planner section ──────────────────
const TODAY_INDEX = 2;

// Anchored to the real Planner: Morning Stack / RitualBundles / Tonight
// card / Shutdown ritual / Medications / anchor tasks.
const INITIAL_TASKS = [
  // LIGHT (0–34) — Morning Stack habits + ritual bundle items + tonight ritual
  { id: 1,  rail: "LIGHT",      type: "habit",      title: "Drink water",                   dur: 1,  source: "Morning Stack",    meta: "habit"  },
  { id: 2,  rail: "LIGHT",      type: "habit",      title: "Evening walk",                  dur: 20, source: "Morning Stack",    meta: "habit"  },
  { id: 3,  rail: "LIGHT",      type: "ritual",     title: "Tonight: shower + sleep tea",   dur: 15, source: "Tonight card",     meta: "ritual" },
  { id: 4,  rail: "LIGHT",      type: "ritual",     title: "Ritual bundle — Warmth set",    dur: 12, source: "RitualBundles",    meta: "ritual" },

  // BALANCED (35–64) — medications + body-tile log + appointments + shutdown ritual
  { id: 5,  rail: "BALANCED",   type: "medication", title: "Folic acid 400 mcg",            dur: 1,  source: "MedicationReminders", time: "08:00", meta: "med" },
  { id: 6,  rail: "BALANCED",   type: "habit",      title: "Morning stretch (T2 safe)",     dur: 15, source: "Morning Stack",    meta: "habit", anchor: true },
  { id: 7,  rail: "BALANCED",   type: "task",       title: "Log mood + energy",              dur: 2,  source: "Body tiles",       meta: "log"    },
  { id: 8,  rail: "BALANCED",   type: "task",       title: "Antenatal class — 14:00",        dur: 60, source: "PlannerItems",    time: "14:00", meta: "appt"  },
  { id: 9,  rail: "BALANCED",   type: "medication", title: "Magnesium glycinate",            dur: 1,  source: "MedicationReminders", time: "18:30", meta: "med" },
  { id: 10, rail: "BALANCED",   type: "ritual",     title: "Shutdown ritual — 3 steps",       dur: 8,  source: "Shutdown card",    meta: "ritual" },

  // INTENSIVE (65–100) — high-load tasks + anchor tasks
  { id: 11, rail: "INTENSIVE",  type: "task",       title: "Deep work — Q3 strategy draft",  dur: 90, source: "PlannerItems",    meta: "task",  anchor: true },
  { id: 12, rail: "INTENSIVE",  type: "task",       title: "Q3 planning review w/ team",      dur: 45, source: "PlannerItems",    meta: "task"   },
  { id: 13, rail: "INTENSIVE",  type: "task",       title: "Reply to Sarah re: scope",        dur: 10, source: "PlannerItems",    meta: "task"   },
];

const WEEK = [
  { day: "Mon", date: 12, capacity: 71, phase: "follicular" },
  { day: "Tue", date: 13, capacity: 58, phase: "luteal"     },
  { day: "Wed", date: 14, capacity: 42, phase: "luteal", today: true },
  { day: "Thu", date: 15, capacity: 75, phase: "follicular" },
  { day: "Fri", date: 16, capacity: 65, phase: "follicular" },
  { day: "Sat", date: 17, capacity: 55, phase: "luteal"     },
  { day: "Sun", date: 18, capacity: 40, phase: "luteal"     },
];

const BODY_INIT = {
  sleep:    { value: 7.5, unit: "h",     label: "Sleep",     icon: Moon,         tone: T.plum },
  mood:     { value: 4,   unit: "/5",    label: "Mood",      icon: Heart,        tone: T.rose },
  energy:   { value: 3,   unit: "/5",    label: "Energy",    icon: Zap,          tone: T.gold },
  water:    { value: 4,   unit: "/8",    label: "Hydration", icon: Droplets,     tone: "#60B4FA" },
  movement: { value: 32,  unit: "min",   label: "Movement",  icon: Footprints,   tone: T.sage },
  baby:     { value: "✓", unit: "kicks", label: "Baby",      icon: Baby,         tone: T.blush },
};

// 28-day consistency dots (week-stack pattern). 1 = kept, 0 = missed,
// -1 = future/unknown. Today is index 14 (just over halfway through 28d).
const CONSISTENCY_28 = [
  1,1,1,0,1,1,1, 1,0,1,1,1,1,0, 1,1,1,1,0,1,1, 1,1,1,1,1,1,1,
];

// ── Helpers ─────────────────────────────────────────────────────────────────
function railFromCapacity(c) {
  if (c >= 65) return "INTENSIVE";
  if (c >= 35) return "BALANCED";
  return "LIGHT";
}
const RAIL_META = {
  LIGHT:     { label: "LIGHT",     range: "0–34 % capacity cost",   Icon: Zap,    tone: T.sage,  bg: "rgba(143,175,143,0.14)",  border: "rgba(143,175,143,0.42)", line: "Phase-matched — Morning Stack + ritual bundles support your luteal recovery." },
  BALANCED:  { label: "BALANCED",  range: "35–64 % capacity cost",  Icon: Scale,  tone: T.gold,  bg: "rgba(212,175,55,0.12)",   border: "rgba(212,175,55,0.50)",  line: "Today's recommended rail — your capacity sits right in this band." },
  INTENSIVE: { label: "INTENSIVE", range: "65–100 % capacity cost", Icon: Flame,  tone: T.blush, bg: "rgba(232,180,184,0.14)",  border: "rgba(232,180,184,0.45)", line: "Follicular (Thu, cap 75) — your next high-capacity window." },
};
const TYPE_ICON = { habit: Activity, medication: Pill, task: Briefcase, ritual: Sparkles };

function classifyText(t) {
  const s = t.toLowerCase();
  if (/(med|pill|vitamin|magnesium|folic|hrt|tablet|capsule|dose)/.test(s))      return "medication";
  if (/(walk|stretch|run|water|hydrat|sleep|step|workout|exercise|habit)/.test(s)) return "habit";
  if (/(tea|bath|ritual|breath|meditat|gratitude|journal|wind\s?down)/.test(s))  return "ritual";
  return "task";
}
function durGuessByCapacity(text) {
  const s = text.toLowerCase();
  if (/(deep|focus|draft|plan|review|strategy)/.test(s))  return "INTENSIVE";
  if (/(stretch|walk|meal|lunch|prep|tidy|fold)/.test(s)) return "BALANCED";
  return "LIGHT";
}

// ── Capacity Gauge — paper face, espresso needle, muted ticks ──────────────
function CapacityGauge({ value, animTarget }) {
  const cx = 200, cy = 178, r = 144, w = 22;
  const arcPath = (t1, t2) => {
    const a1 = Math.PI - t1 * Math.PI;
    const a2 = Math.PI - t2 * Math.PI;
    const x1 = cx + r * Math.cos(a1), y1 = cy - r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy - r * Math.sin(a2);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  };
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const t = i / 10;
    const a = Math.PI - t * Math.PI;
    const inner = r - 8, outer = r + 6;
    const x1 = cx + inner * Math.cos(a), y1 = cy - inner * Math.sin(a);
    const x2 = cx + outer * Math.cos(a), y2 = cy - outer * Math.sin(a);
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={T.muted} strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />;
  });
  const angle = -90 + (animTarget / 100) * 180;
  return (
    <svg viewBox="0 0 400 220" style={{ width: "100%", height: "auto", maxWidth: 480 }} aria-label={`Capacity gauge: ${value} of 100`}>
      <path d={arcPath(0, 1)} stroke="rgba(58,44,26,0.06)" strokeWidth={w + 4} fill="none" strokeLinecap="butt" />
      <path d={arcPath(0,    0.34)} stroke={T.blush} strokeWidth={w} fill="none" strokeLinecap="butt" />
      <path d={arcPath(0.34, 0.65)} stroke={T.gold}  strokeWidth={w} fill="none" strokeLinecap="butt" />
      <path d={arcPath(0.65, 1)}    stroke={T.sage}  strokeWidth={w} fill="none" strokeLinecap="butt" />
      <g>{ticks}</g>
      <circle cx={cx} cy={cy} r="9" fill={T.paperUp} stroke={T.espresso} strokeWidth="2" />
      <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: "transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
        <line x1={cx} y1={cy} x2={cx} y2={cy - r + 18} stroke={T.espresso} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy - r + 18} r="5" fill={T.paperUp} stroke={T.espresso} strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r="4" fill={T.espresso} />
      </g>
      <text x={cx - r - 6} y={cy + 18} fill={T.muted} fontSize="11" fontFamily="'Inter', sans-serif" fontWeight="700" letterSpacing="2" textAnchor="end">0</text>
      <text x={cx + r + 6} y={cy + 18} fill={T.muted} fontSize="11" fontFamily="'Inter', sans-serif" fontWeight="700" letterSpacing="2" textAnchor="start">100</text>
    </svg>
  );
}

// ── Component ───────────────────────────────────────────────────────────────
export default function MissionControl() {
  const [activeDayIdx, setActiveDayIdx]   = useState(TODAY_INDEX);
  const [tasks, setTasks]                 = useState(INITIAL_TASKS);
  const [completed, setCompleted]         = useState(new Set());
  const [deferred, setDeferred]           = useState(false);
  const [railsOpen, setRailsOpen]         = useState({ LIGHT: false, BALANCED: true, INTENSIVE: false });
  const [composeOpen, setComposeOpen]     = useState(false);
  const [composeText, setComposeText]     = useState("");
  const [composeType, setComposeType]     = useState(null);
  const [composePhase, setComposePhase]   = useState("now");
  const [anchorFlag, setAnchorFlag]       = useState(false);
  const [dockOpen, setDockOpen]           = useState(false);
  const [dockTab, setDockTab]             = useState("body"); // body | journey
  const [body, setBody]                   = useState(BODY_INIT);
  const [needleAnim, setNeedleAnim]       = useState(0);
  const [recentId, setRecentId]           = useState(null);
  const [stageBannerOpen, setStageBannerOpen] = useState(true);
  const [careOpen, setCareOpen]           = useState(false);

  const activeDay = WEEK[activeDayIdx];
  const baseCapacity = activeDay.capacity;
  const effective = Math.max(0, baseCapacity - completed.size * 3);

  useEffect(() => {
    const id = requestAnimationFrame(() => setNeedleAnim(effective));
    return () => cancelAnimationFrame(id);
  }, [effective]);

  const railTasks = useMemo(() => {
    const grouped = { LIGHT: [], BALANCED: [], INTENSIVE: [] };
    tasks.forEach(t => {
      if (t.rail === "INTENSIVE" && deferred) return;
      grouped[t.rail].push(t);
    });
    return grouped;
  }, [tasks, deferred]);

  const insights = useMemo(() => {
    const highLoad = WEEK.filter(d => d.capacity < 50).length;
    const nextRise = (() => {
      for (let i = TODAY_INDEX + 1; i < WEEK.length; i++) {
        if (WEEK[i].capacity >= 65) return i - TODAY_INDEX;
      }
      return null;
    })();
    return { highLoad, nextRise };
  }, []);

  const toggleRail = (rail) => setRailsOpen(r => ({ ...r, [rail]: !r[rail] }));
  const toggleComplete = (id) => {
    setCompleted(s => {
      const ns = new Set(s);
      if (ns.has(id)) ns.delete(id); else ns.add(id);
      return ns;
    });
  };
  const toggleAnchor = (id) => setTasks(ts => ts.map(t => t.id === id ? { ...t, anchor: !t.anchor } : t));
  const deferAll = () => setDeferred(true);
  const restoreDeferred = () => setDeferred(false);

  const handleCompose = () => {
    const text = composeText.trim();
    if (!text) return;
    const type = composeType || classifyText(text);
    let rail;
    if (composePhase === "high") rail = "BALANCED";
    else rail = durGuessByCapacity(text);
    const newId = Date.now();
    setTasks(ts => [...ts, { id: newId, rail, type, title: text, dur: 15, source: "Quick compose", meta: type, anchor: anchorFlag }]);
    setRecentId(newId);
    setTimeout(() => setRecentId(null), 900);
    setComposeText("");
    setComposeType(null);
    setComposePhase("now");
    setAnchorFlag(false);
    setComposeOpen(false);
    setRailsOpen(r => ({ ...r, [rail]: true }));
  };

  const bumpBody = (key) => {
    setBody(b => {
      const c = b[key];
      if (key === "water") return { ...b, water: { ...c, value: Math.min(8, c.value + 1) } };
      if (key === "mood" || key === "energy") return { ...b, [key]: { ...c, value: Math.min(5, c.value + 1) } };
      if (key === "movement") return { ...b, movement: { ...c, value: c.value + 5 } };
      return b;
    });
  };

  const todayRail = railFromCapacity(effective);
  const nextHighIdx = (() => {
    for (let i = TODAY_INDEX + 1; i < WEEK.length; i++) {
      if (WEEK[i].capacity >= 65) return i;
    }
    return null;
  })();

  const consistencyKept = CONSISTENCY_28.filter(d => d === 1).length;
  const consistencyTotal = CONSISTENCY_28.length;
  const consistencyPct = Math.round((consistencyKept / consistencyTotal) * 100);

  return (
    <div style={shell}>
      <style>{css}</style>

      {/* Header eyebrow */}
      <div style={topRow}>
        <div style={eyebrowGroup}>
          <span style={eyebrowDot} />
          <span style={eyebrowText}>MISSION CONTROL · {activeDay.day.toUpperCase()} {activeDay.date} MAY</span>
        </div>
        <div style={pillSmall}>
          <Calendar size={11} style={{ color: T.goldDeep }} />
          <span>{activeDayIdx === TODAY_INDEX ? "TODAY" : (activeDayIdx < TODAY_INDEX ? "PAST" : "AHEAD")}</span>
        </div>
      </div>

      {/* Life-stage banner — collapsible */}
      <button onClick={() => setStageBannerOpen(v => !v)} style={stageBanner} aria-expanded={stageBannerOpen}>
        <div style={{ ...stageBannerIcon, background: "rgba(232,180,184,0.30)", color: T.rose }}>
          <Baby size={14} />
        </div>
        <div style={{ flex: 1, textAlign: "left" }}>
          <div style={stageBannerTitle}>Pregnancy · Trimester II · Week 22</div>
          {stageBannerOpen && (
            <div style={stageBannerSub}>
              Kick counter logged 11:14 · Next antenatal: <b>Thu 14:00</b> · 20-week scan complete · HRT card hidden (stage protected)
            </div>
          )}
        </div>
        <ChevronRight size={14} style={{ color: T.muted, transform: stageBannerOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
      </button>

      {/* Gauge + side strip */}
      <div style={gaugeRow}>
        <div style={gaugePanel}>
          <CapacityGauge value={baseCapacity} animTarget={needleAnim} />
          <div style={gaugeNumWrap}>
            <div style={gaugeNum}>{effective}<span style={gaugeNumOf}> / 100 capacity</span></div>
            <div style={gaugeSub}>Luteal &middot; Day 25{completed.size > 0 ? ` · -${completed.size * 3} spent` : ""}</div>
          </div>
          <div style={chipRowGauge}>
            <div style={{ ...insightChip, background: "rgba(232,180,184,0.22)", borderColor: "rgba(232,180,184,0.55)", color: "#8E4B50" }}>
              <TrendingDown size={12} />
              <span><b>{insights.highLoad}</b> high-load days ahead</span>
            </div>
            <div style={{ ...insightChip, background: "rgba(143,175,143,0.22)", borderColor: "rgba(143,175,143,0.50)", color: "#3F6B3F" }}>
              <TrendingUp size={12} />
              <span>Follicular in <b>{insights.nextRise ?? "—"}</b> days</span>
            </div>
          </div>
        </div>

        <div style={sidePanel}>
          <div style={sidePanelEyebrow}>3-DAY ARC</div>
          {WEEK.slice(TODAY_INDEX - 1, TODAY_INDEX + 2).map((d, i) => {
            const label = i === 0 ? "Yesterday" : i === 1 ? "Today" : "Tomorrow";
            const isToday = i === 1;
            const tone = d.capacity >= 65 ? T.sage : d.capacity >= 35 ? T.gold : T.blush;
            return (
              <div key={d.day} style={{ ...sideRow, opacity: isToday ? 1 : 0.85 }}>
                <div style={sideRowLabel}>
                  <div style={{ ...sideDot, background: isToday ? T.goldDeep : "rgba(58,44,26,0.20)" }} />
                  <span>{label}</span>
                </div>
                <div style={sideBarWrap}>
                  <div style={{ ...sideBarFill, width: `${d.capacity}%`, background: tone }} />
                </div>
                <div style={{ ...sideVal, color: isToday ? T.espresso : T.muted }}>{d.capacity}</div>
              </div>
            );
          })}
          <div style={sidePanelFootnote}>Capacity Tax — predicted from cycle phase + 7-day sleep history.</div>
        </div>
      </div>

      {/* Today's recommended badge */}
      <div style={recommendBar}>
        <Pin size={13} style={{ color: T.goldDeep }} />
        <span>Today&apos;s rail is <b style={{ color: T.goldDeep }}>{RAIL_META[todayRail].label}</b>.</span>
        <span style={recommendDivider}>·</span>
        <span style={{ color: T.muted }}>Capacity {effective} sits in the {todayRail.toLowerCase()} band.</span>
      </div>

      {/* Three rails */}
      <div style={railsWrap}>
        {(["LIGHT", "BALANCED", "INTENSIVE"]).map((key) => {
          const meta = RAIL_META[key];
          const isOpen = railsOpen[key];
          const isToday = key === todayRail;
          const items = railTasks[key];
          const RailIcon = meta.Icon;
          const showWarning = key === "INTENSIVE" && effective < 65 && !deferred && items.length > 0;
          return (
            <section key={key} style={{
              ...railShell,
              background: meta.bg,
              borderLeft: `4px solid ${meta.tone}`,
              borderTop: `1px solid ${meta.border}`,
              borderRight: `1px solid ${meta.border}`,
              borderBottom: `1px solid ${meta.border}`,
            }}>
              <button onClick={() => toggleRail(key)} style={railHeader}>
                <div style={{ ...railHeaderIcon, background: `${meta.tone}33`, border: `1px solid ${meta.tone}88` }}>
                  <RailIcon size={15} style={{ color: meta.tone }} />
                </div>
                <div style={{ textAlign: "left", flex: 1 }}>
                  <div style={railHeaderTitle}>
                    {meta.label}
                    {isToday && <span style={{ ...railTodayPill, background: meta.tone, color: T.cream }}>RECOMMENDED</span>}
                  </div>
                  <div style={railHeaderSub}>{meta.range}</div>
                </div>
                <div style={{ ...railCount, color: meta.tone }}>{items.length}</div>
                <div style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
                  <ChevronRight size={16} style={{ color: T.muted }} />
                </div>
              </button>

              {showWarning && (
                <div style={warningBox}>
                  <AlertTriangle size={14} style={{ color: T.rose, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={warningTitle}>Today&apos;s capacity ({effective}) may not support intensive tasks.</div>
                    <div style={warningSub}>Defer them to a higher-capacity day to protect the recovery.</div>
                  </div>
                  {nextHighIdx != null && (
                    <button onClick={deferAll} style={deferBtn}>
                      <Forward size={12} />
                      Defer all to {WEEK[nextHighIdx].day} (cap {WEEK[nextHighIdx].capacity})
                    </button>
                  )}
                </div>
              )}

              {key === "INTENSIVE" && deferred && (
                <div style={deferredNote}>
                  <Check size={13} style={{ color: T.sage }} />
                  <span>3 tasks deferred to <b>{WEEK[nextHighIdx]?.day} {WEEK[nextHighIdx]?.date}</b>. Updates PlannerItems.date.</span>
                  <button onClick={restoreDeferred} style={undoBtn}>Undo</button>
                </div>
              )}

              {isOpen && (
                <div style={railBody}>
                  {items.length === 0 ? (
                    <div style={emptyNote}>Nothing here right now.</div>
                  ) : items.map((t) => {
                    const Icon = TYPE_ICON[t.type];
                    const done = completed.has(t.id);
                    const recent = t.id === recentId;
                    return (
                      <div key={t.id} style={{ ...taskRow, animation: recent ? "fwTaskDrop 0.7s ease-out" : undefined }}>
                        <button onClick={() => toggleComplete(t.id)} aria-label={done ? "Mark incomplete" : "Mark complete"}
                                style={{ ...checkBox, background: done ? meta.tone : "transparent", borderColor: meta.tone }}>
                          {done && <Check size={12} style={{ color: T.paperUp }} strokeWidth={3} />}
                        </button>
                        <div style={{ ...taskIcon, background: `${meta.tone}22`, border: `1px solid ${meta.tone}55` }}>
                          <Icon size={12} style={{ color: meta.tone }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0, opacity: done ? 0.55 : 1, textDecoration: done ? "line-through" : "none" }}>
                          <div style={taskTitle}>{t.title}</div>
                          <div style={taskMeta}>
                            <Clock size={9} /> {t.dur} min
                            {t.time && <><span style={{ opacity: 0.5 }}>·</span><span>{t.time}</span></>}
                            <span style={{ opacity: 0.5 }}>·</span>
                            <span style={{ fontStyle: "italic", color: T.mutedDeep }}>{t.source}</span>
                            {t.anchor && <span style={anchorPill}><Anchor size={9} /> ANCHOR</span>}
                          </div>
                        </div>
                        <button onClick={() => toggleAnchor(t.id)} aria-label="Toggle anchor" style={{ ...anchorBtn, color: t.anchor ? T.goldDeep : T.muted, borderColor: t.anchor ? T.gold : T.espressoSoft }}>
                          <Pin size={11} />
                        </button>
                      </div>
                    );
                  })}
                  <div style={railFootnote}>{meta.line}</div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Week energy strip */}
      <div style={weekWrap}>
        <div style={weekHead}>
          <span style={weekEyebrow}>WEEK ENERGY · 12–18 MAY</span>
          <span style={weekHint}>Tap a day to load its rails</span>
        </div>
        <div style={weekRow}>
          {WEEK.map((d, idx) => {
            const tone = d.capacity >= 65 ? T.sage : d.capacity >= 35 ? T.gold : T.blush;
            const isActive = idx === activeDayIdx;
            const isToday = idx === TODAY_INDEX;
            return (
              <button key={d.day} onClick={() => { setActiveDayIdx(idx); setCompleted(new Set()); setDeferred(false); }}
                      style={{ ...weekCol, borderColor: isToday ? T.goldDeep : T.espressoSoft, boxShadow: isActive ? `0 0 0 1px ${T.goldDeep}` : "none", animation: isToday ? "fwTodayPulse 2.4s ease-in-out infinite" : undefined }}>
                <div style={weekDay}>{d.day}</div>
                <div style={weekDate}>{d.date}</div>
                <div style={weekBarTrack}>
                  <div style={{ ...weekBarFill, height: `${d.capacity}%`, background: tone }} />
                </div>
                <div style={{ ...weekVal, color: tone }}>{d.capacity}</div>
                <div style={weekItemsDot} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Command bar */}
      <div style={cmdWrap}>
        {!composeOpen ? (
          <button onClick={() => setComposeOpen(true)} style={cmdClosed}>
            <Plus size={16} style={{ color: T.gold }} />
            <span style={cmdPlaceholder}>What needs doing?</span>
            <span style={cmdHint}>Voice or type</span>
          </button>
        ) : (
          <div style={cmdOpen}>
            <div style={cmdInputRow}>
              <input autoFocus
                     value={composeText}
                     onChange={(e) => setComposeText(e.target.value)}
                     onKeyDown={(e) => { if (e.key === "Enter") handleCompose(); if (e.key === "Escape") setComposeOpen(false); }}
                     placeholder="Capture anything — voice or type"
                     style={cmdInput} />
              <button aria-label="Voice input" style={cmdVoice}>
                <Mic size={14} style={{ color: T.blush }} />
              </button>
            </div>
            <div style={cmdChipsRow}>
              {[
                { id: "medication", label: "Med",    Icon: Pill,      tone: T.blush },
                { id: "task",       label: "Task",   Icon: Briefcase, tone: T.cream },
                { id: "ritual",     label: "Ritual", Icon: Sparkles,  tone: T.gold  },
              ].map(({ id, label, Icon, tone }) => {
                const active = composeType === id;
                return (
                  <button key={id} onClick={() => setComposeType(active ? null : id)}
                          style={{ ...cmdChip, color: active ? T.espresso : T.cream, borderColor: active ? tone : "rgba(244,237,219,0.20)", background: active ? `${tone}66` : "transparent" }}>
                    <Icon size={11} />
                    {label}
                  </button>
                );
              })}
              <button onClick={() => setAnchorFlag(v => !v)}
                      style={{ ...cmdChip, color: anchorFlag ? T.espresso : T.cream, borderColor: anchorFlag ? T.gold : "rgba(244,237,219,0.20)", background: anchorFlag ? `${T.gold}AA` : "transparent" }}>
                <Pin size={11} /> Anchor
              </button>
              <button onClick={() => setCareOpen(true)}
                      style={{ ...cmdChip, color: T.blush, borderColor: T.blush, background: "rgba(232,180,184,0.18)" }}>
                <Stethoscope size={11} /> Care
              </button>
            </div>
            <div style={cmdPhaseLabel}>Assign to phase</div>
            <div style={cmdChipsRow}>
              {[
                { id: "now",  label: "Now",                Icon: Clock     },
                { id: "high", label: "High-cap window",     Icon: Mountain  },
                { id: "week", label: "This week",           Icon: Calendar  },
              ].map(({ id, label, Icon }) => {
                const active = composePhase === id;
                return (
                  <button key={id} onClick={() => setComposePhase(id)}
                          style={{ ...cmdChip, color: active ? T.espresso : T.cream, borderColor: active ? T.gold : "rgba(244,237,219,0.20)", background: active ? T.gold : "transparent", fontWeight: active ? 700 : 600 }}>
                    <Icon size={11} />
                    {label}
                  </button>
                );
              })}
              <div style={{ flex: 1 }} />
              <button onClick={() => setComposeOpen(false)} style={cmdCancel}>Cancel</button>
              <button onClick={handleCompose} style={cmdSave}>Add</button>
            </div>
            {composePhase === "high" && nextHighIdx != null && (
              <div style={cmdHighHint}>
                <Mountain size={12} style={{ color: T.sage }} />
                Will land on <b>{WEEK[nextHighIdx].day} {WEEK[nextHighIdx].date}</b> &middot; capacity <b>{WEEK[nextHighIdx].capacity}</b>.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Care modal — Doctor-Ready Diary + GP export */}
      {careOpen && (
        <>
          <div onClick={() => setCareOpen(false)} style={careBackdrop} aria-hidden="true" />
          <div style={careSheet} role="dialog" aria-label="Care: doctor diary and GP export">
            <div style={careHandle} />
            <div style={careHead}>
              <div style={{ ...stageBannerIcon, background: "rgba(232,180,184,0.30)", color: T.rose }}>
                <Stethoscope size={14} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={careEyebrow}>CARE</div>
                <div style={careTitle}>Doctor-Ready Diary &amp; GP export</div>
              </div>
              <button onClick={() => setCareOpen(false)} style={careClose} aria-label="Close care"><X size={14} /></button>
            </div>
            <div style={careRow}><FileText size={14} style={{ color: T.muted }} /><span><b>NICE NG23</b> appointment diary — 8 weeks. <span style={careRowMeta}>4 entries this week</span></span></div>
            <div style={careRow}><HeartPulse size={14} style={{ color: T.muted }} /><span>Stage-aware <b>GP export</b> — pregnancy variant ready. Includes meds + check-in summary.</span></div>
            <div style={careRow}><Star size={14} style={{ color: T.gold }} /><span><b>Astra Cole sidecar</b> — &ldquo;Backed by Astra Cole, MA, FAS&rdquo; reading available for cycle context.</span></div>
            <div style={careActions}>
              <button style={careCta}>
                <FileText size={13} /> Build PDF
              </button>
              <button style={careCtaAlt}>
                <ClipboardList size={13} /> Open diary
              </button>
            </div>
            <p style={careWire}>Routes through the existing DoctorReadyDiaryCard / GpExportButton / MergedExportSheet — no new entity created.</p>
          </div>
        </>
      )}

      {/* Right body / journey dock */}
      <div style={{ ...dockShell, transform: dockOpen ? "translateX(0)" : "translateX(calc(100% - 36px))" }}>
        <button onClick={() => setDockOpen(v => !v)} style={dockTabBtn} aria-label={dockOpen ? "Hide" : "Show body and journey"}>
          {dockOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
        <div style={dockBody}>
          {/* Dock tabs */}
          <div style={dockTabsRow} role="tablist">
            {[
              { id: "body",    label: "Body",    Icon: Heart },
              { id: "journey", label: "Journey", Icon: TrendingUp },
            ].map(({ id, label, Icon }) => {
              const active = dockTab === id;
              return (
                <button key={id} onClick={() => setDockTab(id)} role="tab" aria-selected={active}
                        style={{ ...dockTabPill, background: active ? T.espresso : "transparent", color: active ? T.cream : T.muted, borderColor: active ? T.espresso : T.espressoSoft }}>
                  <Icon size={11} /> {label}
                </button>
              );
            })}
          </div>

          {dockTab === "body" && (
            <>
              <div style={dockGrid}>
                {Object.entries(body).map(([k, m]) => {
                  const Icon = m.icon;
                  return (
                    <button key={k} onClick={() => bumpBody(k)} style={{ ...dockTile, borderColor: `${m.tone}55` }}>
                      <div style={{ ...dockTileIcon, background: `${m.tone}22`, color: m.tone }}>
                        <Icon size={14} />
                      </div>
                      <div style={dockTileValue}>{m.value}<span style={dockTileUnit}>{m.unit}</span></div>
                      <div style={dockTileLabel}>{m.label}</div>
                    </button>
                  );
                })}
              </div>
              <p style={dockNote}>Same DailyCheckins entity as Today — six tiles, including Movement and Baby (stage-aware).</p>
            </>
          )}

          {dockTab === "journey" && (
            <>
              <div style={journeyBlock}>
                <div style={journeyEyebrow}>CAPACITY TAX · 28 D</div>
                <div style={journeyBarTrack}>
                  <div style={{ ...journeyBarFill, width: `${consistencyPct}%`, background: T.gold }} />
                </div>
                <div style={journeyMeta}>Predicted load <b>{effective}</b> · today is in the <b>{todayRail.toLowerCase()}</b> band.</div>
              </div>
              <div style={journeyBlock}>
                <div style={journeyEyebrow}>28-DAY CONSISTENCY · {consistencyKept}/{consistencyTotal}</div>
                <div style={dotsRow}>
                  {CONSISTENCY_28.map((v, i) => (
                    <span key={i} style={{
                      ...dot,
                      background: v === 1 ? T.sage : v === 0 ? "rgba(58,44,26,0.10)" : T.gold,
                      transform: i === 14 ? "scale(1.4)" : "scale(1)",
                    }} />
                  ))}
                </div>
              </div>
              <button onClick={() => setCareOpen(true)} style={journeyDoctorBtn}>
                <FileText size={12} /> Doctor-Ready Diary
              </button>
              <div style={astraSidecar}>
                <div style={{ ...stageBannerIcon, background: "rgba(212,175,55,0.20)", color: T.goldDeep, width: 20, height: 20, borderRadius: 6 }}>
                  <Star size={11} />
                </div>
                <div>
                  <div style={astraTitle}>Astra Cole · MA, FAS</div>
                  <div style={astraSub}>&ldquo;A protective day. Don&apos;t spend the morning.&rdquo;</div>
                </div>
              </div>
              <button onClick={() => setCareOpen(true)} style={journeyGpBtn}>
                <Stethoscope size={12} /> GP export
              </button>
              <p style={dockNote}>Capacity Tax + Consistency mirror the live Cycle/Today tab cards — read-only here.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── CSS animations ──────────────────────────────────────────────────────────
const css = `
@keyframes fwTaskDrop { 0% { transform: translateY(-8px); opacity: 0 } 100% { transform: translateY(0); opacity: 1 } }
@keyframes fwTodayPulse { 0%, 100% { box-shadow: 0 0 0 1px ${T.goldDeep} } 50% { box-shadow: 0 0 0 3px rgba(212,175,55,0.30) } }
@keyframes fwEyebrowDot { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
`;

// ── Styles (cream day-mode) ─────────────────────────────────────────────────
const shell = {
  position: "relative",
  background: T.cream,
  color: T.espresso,
  borderRadius: 24,
  padding: "20px 18px 24px",
  border: "1px solid rgba(58,44,26,0.10)",
  boxShadow: "0 1px 0 rgba(58,44,26,0.04), 0 24px 64px rgba(58,44,26,0.08)",
  maxWidth: 760,
  margin: "0 auto",
  fontFamily: "'Inter', system-ui, sans-serif",
};

const topRow = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 };
const eyebrowGroup = { display: "inline-flex", alignItems: "center", gap: 8 };
const eyebrowDot = { width: 7, height: 7, borderRadius: 9999, background: T.goldDeep, boxShadow: `0 0 0 3px rgba(212,175,55,0.25)`, animation: "fwEyebrowDot 2.4s ease-in-out infinite" };
const eyebrowText = { fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: T.muted };
const pillSmall = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "4px 10px", borderRadius: 9999,
  border: `1px solid ${T.espressoSoft}`,
  background: T.paper, color: T.espresso,
  fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
};

// Life-stage banner
const stageBanner = {
  width: "100%",
  display: "flex", alignItems: "center", gap: 10,
  padding: "11px 14px", marginBottom: 12,
  background: T.paper,
  border: "1px solid rgba(232,180,184,0.42)",
  borderLeft: `4px solid ${T.blush}`,
  borderRadius: 14,
  cursor: "pointer", textAlign: "left",
};
const stageBannerIcon = {
  width: 28, height: 28, borderRadius: 9,
  display: "flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const stageBannerTitle = { fontSize: 12, fontWeight: 700, color: T.espresso, letterSpacing: "0.04em" };
const stageBannerSub = { fontSize: 11, color: T.muted, marginTop: 3, lineHeight: 1.4 };

const gaugeRow = {
  display: "grid",
  gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)",
  gap: 14, alignItems: "stretch", marginBottom: 14,
};
const gaugePanel = {
  background: T.paper,
  borderRadius: 18,
  padding: "16px 16px 18px",
  border: "1px solid rgba(58,44,26,0.08)",
  position: "relative",
};
const gaugeNumWrap = { marginTop: -42, textAlign: "center" };
const gaugeNum = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 56, fontWeight: 400, color: T.espresso,
  lineHeight: 1, letterSpacing: "-0.02em",
};
const gaugeNumOf = { fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.muted, fontWeight: 600, marginLeft: 4, letterSpacing: 0 };
const gaugeSub = { fontSize: 11, color: T.muted, marginTop: 6, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700 };
const chipRowGauge = { display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap", justifyContent: "center" };
const insightChip = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "5px 10px", borderRadius: 9999,
  fontSize: 11, fontWeight: 600,
  border: "1px solid", letterSpacing: "0.02em",
};

const sidePanel = {
  background: T.paper,
  borderRadius: 18, padding: 14,
  border: "1px solid rgba(58,44,26,0.08)",
  display: "flex", flexDirection: "column", gap: 8,
};
const sidePanelEyebrow = { fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: T.muted, marginBottom: 4 };
const sideRow = { display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 10 };
const sideRowLabel = { display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T.espresso, fontWeight: 600 };
const sideDot = { width: 6, height: 6, borderRadius: 9999 };
const sideBarWrap = { height: 6, borderRadius: 9999, background: "rgba(58,44,26,0.06)", overflow: "hidden" };
const sideBarFill = { height: "100%", borderRadius: 9999, transition: "width 0.5s ease" };
const sideVal = { fontSize: 11, fontWeight: 700, minWidth: 22, textAlign: "right" };
const sidePanelFootnote = { fontSize: 10, color: T.muted, fontStyle: "italic", lineHeight: 1.5, marginTop: 4 };

const recommendBar = {
  display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap",
  padding: "10px 14px", marginBottom: 14,
  background: T.paper,
  border: "1px solid rgba(58,44,26,0.08)",
  borderRadius: 14,
  fontSize: 12, color: T.espresso, fontWeight: 500,
};
const recommendDivider = { color: T.muted };

const railsWrap = { display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 };
const railShell = { borderRadius: 16, overflow: "hidden" };
const railHeader = {
  width: "100%",
  display: "flex", alignItems: "center", gap: 12,
  padding: "12px 14px",
  background: "transparent", border: "none", cursor: "pointer",
  textAlign: "left",
};
const railHeaderIcon = {
  width: 32, height: 32, borderRadius: 10,
  display: "flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const railHeaderTitle = {
  fontSize: 14, fontWeight: 700, color: T.espresso,
  letterSpacing: "0.12em",
  display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
};
const railHeaderSub = { fontSize: 10, color: T.muted, marginTop: 2, letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600 };
const railTodayPill = {
  fontSize: 9, fontWeight: 800, letterSpacing: "0.16em",
  padding: "2px 8px", borderRadius: 9999,
};
const railCount = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 22, fontWeight: 400,
  marginRight: 4,
};
const railBody = {
  padding: "0 14px 14px",
  display: "flex", flexDirection: "column", gap: 6,
};
const taskRow = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "10px 12px",
  background: T.paperUp,
  border: "1px solid rgba(58,44,26,0.08)",
  borderRadius: 12,
};
const checkBox = {
  width: 22, height: 22, borderRadius: 6,
  border: "1.5px solid", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const taskIcon = {
  width: 22, height: 22, borderRadius: 7,
  display: "flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const taskTitle = { fontSize: 13, fontWeight: 600, color: T.espresso, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
const taskMeta = {
  fontSize: 10, color: T.muted, marginTop: 2,
  display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap",
  letterSpacing: "0.04em",
};
const anchorPill = {
  display: "inline-flex", alignItems: "center", gap: 3,
  padding: "1px 6px", borderRadius: 9999,
  background: `${T.gold}33`, color: T.goldDeep,
  fontSize: 9, fontWeight: 700, letterSpacing: "0.14em",
};
const anchorBtn = {
  width: 26, height: 26, borderRadius: 7,
  background: "transparent", border: "1px solid",
  cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const railFootnote = { fontSize: 10, color: T.muted, fontStyle: "italic", marginTop: 4, lineHeight: 1.5, padding: "4px 6px" };
const emptyNote = { fontSize: 11, color: T.muted, fontStyle: "italic", padding: "14px 0", textAlign: "center" };

const warningBox = {
  margin: "0 14px 12px",
  display: "flex", alignItems: "flex-start", gap: 10,
  padding: "10px 12px", borderRadius: 12,
  background: "rgba(212,94,82,0.08)",
  border: `1px solid rgba(212,94,82,0.30)`,
};
const warningTitle = { fontSize: 12, fontWeight: 600, color: T.espresso, lineHeight: 1.35 };
const warningSub = { fontSize: 11, color: T.muted, marginTop: 2 };
const deferBtn = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "6px 11px", borderRadius: 9999,
  background: T.rose, color: T.cream,
  border: "none", cursor: "pointer",
  fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
  flexShrink: 0,
};
const deferredNote = {
  margin: "0 14px 12px",
  display: "flex", alignItems: "center", gap: 8,
  padding: "9px 12px", borderRadius: 12,
  background: "rgba(143,175,143,0.18)",
  border: `1px solid rgba(143,175,143,0.40)`,
  fontSize: 12, color: T.espresso,
};
const undoBtn = {
  marginLeft: "auto",
  padding: "4px 10px", borderRadius: 9999,
  background: "transparent", color: "#3F6B3F",
  border: `1px solid ${T.sage}`,
  fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
  cursor: "pointer", textTransform: "uppercase",
};

// Week strip — cream variant
const weekWrap = {
  marginBottom: 14,
  padding: 14,
  background: T.paper,
  border: "1px solid rgba(58,44,26,0.08)",
  borderRadius: 16,
};
const weekHead = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 8 };
const weekEyebrow = { fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: T.muted };
const weekHint = { fontSize: 10, color: T.muted, fontStyle: "italic" };
const weekRow = { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 };
const weekCol = {
  background: T.paperUp,
  border: "1px solid",
  borderRadius: 12, padding: "8px 4px",
  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
  cursor: "pointer", position: "relative",
  minHeight: 96,
};
const weekDay = { fontSize: 9, fontWeight: 700, color: T.muted, letterSpacing: "0.1em" };
const weekDate = { fontFamily: "'Fraunces', Georgia, serif", fontSize: 14, color: T.espresso, fontWeight: 500 };
const weekBarTrack = {
  width: 8, height: 36, marginTop: 4,
  borderRadius: 9999, background: "rgba(58,44,26,0.06)",
  display: "flex", flexDirection: "column-reverse", overflow: "hidden",
};
const weekBarFill = { width: "100%", borderRadius: 9999, transition: "height 0.5s ease" };
const weekVal = { fontSize: 11, fontWeight: 700, marginTop: 2 };
const weekItemsDot = {
  position: "absolute", top: 6, right: 6,
  width: 4, height: 4, borderRadius: 9999, background: T.gold,
};

// Command bar — espresso focused input retained for visual distinction
const cmdWrap = { marginBottom: 4 };
const cmdClosed = {
  width: "100%",
  display: "flex", alignItems: "center", gap: 10,
  padding: "13px 14px",
  background: T.espresso, color: T.cream,
  border: `1px solid ${T.espresso}`,
  borderRadius: 16,
  cursor: "pointer", textAlign: "left",
};
const cmdPlaceholder = { fontSize: 14, color: T.cream, fontWeight: 500 };
const cmdHint = { marginLeft: "auto", fontSize: 10, color: "rgba(244,237,219,0.6)", fontStyle: "italic" };

const cmdOpen = {
  padding: 12, borderRadius: 16,
  background: T.espresso, color: T.cream,
  border: `1px solid ${T.gold}AA`,
  boxShadow: `0 4px 16px rgba(0,0,0,0.30)`,
};
const cmdInputRow = { display: "flex", gap: 8, alignItems: "center", marginBottom: 10 };
const cmdInput = {
  flex: 1, border: "none", outline: "none",
  background: "transparent", color: T.cream,
  fontSize: 15, padding: "6px 4px", fontFamily: "inherit",
  borderBottom: "1px solid rgba(244,237,219,0.20)",
};
const cmdVoice = {
  width: 34, height: 34, borderRadius: 9999,
  background: "rgba(232,180,184,0.20)",
  border: `1px solid ${T.blush}66`,
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", flexShrink: 0,
};
const cmdChipsRow = { display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", marginBottom: 8 };
const cmdChip = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "5px 11px", borderRadius: 9999,
  fontSize: 11, fontWeight: 600,
  border: "1px solid", cursor: "pointer",
};
const cmdPhaseLabel = { fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(244,237,219,0.6)", marginBottom: 6, marginTop: 4 };
const cmdCancel = {
  padding: "6px 13px", borderRadius: 9999,
  background: "transparent", color: "rgba(244,237,219,0.7)",
  border: "1px solid rgba(244,237,219,0.20)",
  fontSize: 11, fontWeight: 600, cursor: "pointer",
};
const cmdSave = {
  padding: "6px 16px", borderRadius: 9999,
  background: T.gold, color: T.espresso,
  border: "none", fontSize: 12, fontWeight: 800, letterSpacing: "0.04em", cursor: "pointer",
};
const cmdHighHint = {
  marginTop: 8,
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "6px 11px", borderRadius: 9999,
  background: "rgba(143,175,143,0.18)",
  border: `1px solid rgba(143,175,143,0.42)`,
  fontSize: 11, color: T.cream,
};

// Care sheet
const careBackdrop = {
  position: "fixed", inset: 0, zIndex: 80,
  background: "rgba(58,44,26,0.40)", backdropFilter: "blur(6px)",
};
const careSheet = {
  position: "fixed", left: "50%", bottom: 24,
  transform: "translateX(-50%)",
  width: "min(540px, calc(100vw - 32px))",
  background: T.cream, color: T.espresso,
  borderRadius: 24, padding: "18px 20px 22px", zIndex: 81,
  boxShadow: "0 24px 64px rgba(58,44,26,0.30)",
};
const careHandle = { width: 38, height: 4, borderRadius: 9999, background: "rgba(58,44,26,0.15)", margin: "0 auto 12px" };
const careHead = { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 };
const careEyebrow = { fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: T.muted };
const careTitle = { fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, fontWeight: 500, color: T.espresso, marginTop: 2 };
const careClose = {
  width: 30, height: 30, borderRadius: 9999,
  background: T.paper, border: "1px solid rgba(58,44,26,0.10)",
  cursor: "pointer", color: T.muted,
  display: "flex", alignItems: "center", justifyContent: "center",
};
const careRow = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "10px 12px", borderRadius: 12,
  background: T.paper, border: "1px solid rgba(58,44,26,0.08)",
  fontSize: 12, color: T.espresso, lineHeight: 1.5, marginBottom: 6,
};
const careRowMeta = { fontSize: 10, color: T.muted, marginLeft: 6, fontStyle: "italic" };
const careActions = { display: "flex", gap: 8, marginTop: 10 };
const careCta = {
  flex: 1, padding: "11px 14px", borderRadius: 9999,
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
  background: T.espresso, color: T.cream, border: "none", cursor: "pointer",
  fontSize: 13, fontWeight: 700, letterSpacing: "0.04em",
};
const careCtaAlt = {
  flex: 1, padding: "11px 14px", borderRadius: 9999,
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
  background: "transparent", color: T.espresso, border: `1px solid ${T.espressoSoft}`, cursor: "pointer",
  fontSize: 13, fontWeight: 700, letterSpacing: "0.04em",
};
const careWire = {
  fontSize: 10, color: T.muted, fontStyle: "italic", marginTop: 12,
  padding: "8px 10px", borderRadius: 8,
  background: T.paper, border: "1px dashed rgba(58,44,26,0.10)",
};

// Right dock — cream
const dockShell = {
  position: "absolute",
  top: 16, right: -8,
  display: "flex",
  transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
  zIndex: 5,
};
const dockTabBtn = {
  width: 36, height: 56,
  borderRadius: "12px 0 0 12px",
  background: T.espresso, color: T.cream,
  border: "none", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
};
const dockBody = {
  width: 220,
  background: T.paper,
  border: "1px solid rgba(58,44,26,0.10)",
  borderRight: "none",
  borderRadius: "16px 0 0 16px",
  padding: "12px 12px 16px",
};
const dockTabsRow = { display: "flex", gap: 6, marginBottom: 10 };
const dockTabPill = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "5px 10px", borderRadius: 9999,
  fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
  border: "1px solid", cursor: "pointer",
};
const dockGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 };
const dockTile = {
  border: "1px solid",
  borderRadius: 12, padding: "8px 8px",
  background: T.cream,
  display: "flex", flexDirection: "column", gap: 4,
  cursor: "pointer", textAlign: "left", color: T.espresso,
};
const dockTileIcon = { width: 22, height: 22, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" };
const dockTileValue = { fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, fontWeight: 600, color: T.espresso, lineHeight: 1 };
const dockTileUnit = { fontSize: 10, color: T.muted, marginLeft: 2 };
const dockTileLabel = { fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: T.muted };
const dockNote = { marginTop: 10, marginBottom: 0, fontSize: 10, color: T.muted, lineHeight: 1.4, fontStyle: "italic" };

// Journey dock tab
const journeyBlock = {
  padding: "8px 0", marginBottom: 8,
  borderBottom: "1px solid rgba(58,44,26,0.06)",
};
const journeyEyebrow = { fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", color: T.muted, marginBottom: 6 };
const journeyBarTrack = { height: 8, borderRadius: 9999, background: "rgba(58,44,26,0.08)", overflow: "hidden" };
const journeyBarFill = { height: "100%", borderRadius: 9999, transition: "width 0.5s ease" };
const journeyMeta = { fontSize: 11, color: T.espresso, marginTop: 6, lineHeight: 1.4 };

const dotsRow = { display: "grid", gridTemplateColumns: "repeat(14, 1fr)", gap: 3 };
const dot = { width: 6, height: 6, borderRadius: 9999, transition: "transform 0.2s ease" };

const journeyDoctorBtn = {
  width: "100%",
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
  padding: "8px 11px", borderRadius: 9999,
  background: T.cream, color: T.espresso,
  border: `1px solid ${T.espressoSoft}`, cursor: "pointer",
  fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
  marginBottom: 8,
};
const astraSidecar = {
  display: "flex", gap: 8, alignItems: "flex-start",
  padding: "8px 10px", borderRadius: 10,
  background: "rgba(212,175,55,0.12)",
  border: `1px solid ${T.gold}55`,
  marginBottom: 8,
};
const astraTitle = { fontSize: 10, fontWeight: 700, letterSpacing: "0.10em", color: T.goldDeep, textTransform: "uppercase" };
const astraSub = { fontSize: 11, color: T.espresso, fontStyle: "italic", lineHeight: 1.4, marginTop: 2 };
const journeyGpBtn = {
  width: "100%",
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
  padding: "8px 11px", borderRadius: 9999,
  background: T.espresso, color: T.cream,
  border: "none", cursor: "pointer",
  fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
};
