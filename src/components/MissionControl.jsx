// ─────────────────────────────────────────────────────────────────────────────
// MissionControl — Concept 2 demo for /Ideas.
//
// A dark-warm command deck. Capacity is a real semicircular gauge that
// dominates the top of the screen; tasks auto-sort into three rails by
// capacity cost (LIGHT / BALANCED / INTENSIVE); a single command bar
// at the bottom captures everything; a 7-day energy strip lets the
// founder plan ahead biologically.
//
// Different aesthetic from the rest of the app: espresso #3A2C1A cockpit
// background, gold #D4AF37 accents, cream #F4EDDB text. Intentionally
// distinct from FemWell's usual cream day-mode — this is a demo showing
// an alternative direction.
//
// Cross-page rules:
//   · Planner is untouched. This is a self-contained /Ideas tab.
//   · Mock data only. Rail items reference the same entities the live
//     Planner uses (HabitLogs / MedicationReminders / PlannerItems /
//     RitualBundles) but don't duplicate them.
//   · Body dock writes go to the SAME daily check-in store as Today.
//   · NO emoji codepoints — Lucide icons only.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Zap, Scale, Flame, Briefcase, Pill, Sparkles, Activity,
  Pin, Plus, ChevronRight, ChevronLeft, Check, Mic,
  TrendingDown, TrendingUp, Clock, Mountain, Calendar,
  X, Moon, Heart, Droplets, AlertTriangle, Forward, Anchor,
} from "lucide-react";

// ── Tokens ──────────────────────────────────────────────────────────────────
const T = {
  cream:    "#F4EDDB",
  paper:    "#FBF6E6",
  espresso: "#3A2C1A",
  esprPlus: "#4A3C2A",
  esprDeep: "#2A1E10",
  esprLine: "#5A4A3A",
  blush:    "#E8B4B8",
  sage:     "#8FAF8F",
  muted:    "#9B8B7A",
  mutedDeep:"#7A6A55",
  gold:     "#D4AF37",
  goldDeep: "#A6862B",
  rose:     "#D45E52",
};

// ── Mock data ───────────────────────────────────────────────────────────────
const TODAY_INDEX = 2;            // Wed

const INITIAL_TASKS = [
  // LIGHT (0–34)
  { id: 1, rail: "LIGHT",      type: "habit",      title: "Drink water",           dur: 1,  meta: "habit"  },
  { id: 2, rail: "LIGHT",      type: "habit",      title: "Evening walk",          dur: 20, meta: "habit"  },
  { id: 3, rail: "LIGHT",      type: "medication", title: "Magnesium glycinate",   dur: 1,  meta: "med"    },
  // BALANCED (35–64) — today's recommended rail
  { id: 4, rail: "BALANCED",   type: "habit",      title: "Morning stretch",       dur: 15, meta: "habit", anchor: true },
  { id: 5, rail: "BALANCED",   type: "medication", title: "Folic acid 400 mcg",    dur: 1,  meta: "med"    },
  { id: 6, rail: "BALANCED",   type: "habit",      title: "Lunch + walk",          dur: 30, meta: "habit"  },
  { id: 7, rail: "BALANCED",   type: "ritual",     title: "Shutdown ritual",       dur: 15, meta: "ritual" },
  // INTENSIVE (65–100)
  { id: 8, rail: "INTENSIVE",  type: "task",       title: "Deep work block",       dur: 90, meta: "task",  anchor: true },
  { id: 9, rail: "INTENSIVE",  type: "task",       title: "Q3 planning review",    dur: 45, meta: "task"   },
  { id: 10, rail: "INTENSIVE", type: "task",       title: "Reply to Sarah",        dur: 10, meta: "task"   },
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
  sleep: { value: 7.5, unit: "h",  label: "Sleep",     icon: Moon,     tone: T.blush  },
  mood:  { value: 4,   unit: "/5", label: "Mood",      icon: Heart,    tone: T.rose   },
  energy:{ value: 3,   unit: "/5", label: "Energy",    icon: Zap,      tone: T.gold   },
  water: { value: 4,   unit: "/8", label: "Hydration", icon: Droplets, tone: "#60B4FA" },
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function railFromCapacity(c) {
  if (c >= 65) return "INTENSIVE";
  if (c >= 35) return "BALANCED";
  return "LIGHT";
}
const RAIL_META = {
  LIGHT:     { label: "LIGHT",     range: "0–34 % capacity cost",   Icon: Zap,    tone: T.sage,  bg: "rgba(143,175,143,0.20)",  border: "rgba(143,175,143,0.32)", line: "Phase-matched — lighter tasks support your luteal recovery." },
  BALANCED:  { label: "BALANCED",  range: "35–64 % capacity cost",  Icon: Scale,  tone: T.gold,  bg: "rgba(212,175,55,0.16)",   border: "rgba(212,175,55,0.40)",  line: "Today's recommended rail — capacity sits right in this band." },
  INTENSIVE: { label: "INTENSIVE", range: "65–100 % capacity cost", Icon: Flame,  tone: T.blush, bg: "rgba(232,180,184,0.16)",  border: "rgba(232,180,184,0.32)", line: "Follicular (day 28) · 3 days — your next high-capacity window." },
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
  if (/(deep|focus|draft|plan|review|strategy)/.test(s)) return "INTENSIVE";
  if (/(stretch|walk|meal|lunch|prep|tidy|fold)/.test(s))  return "BALANCED";
  return "LIGHT";
}

// ── Capacity Gauge (SVG) ────────────────────────────────────────────────────
function CapacityGauge({ value, animTarget }) {
  // Geometry: arc from (cx-r, cy) over the top to (cx+r, cy)
  const cx = 200, cy = 178, r = 144, w = 22;
  const arcPath = (t1, t2) => {
    const a1 = Math.PI - t1 * Math.PI;
    const a2 = Math.PI - t2 * Math.PI;
    const x1 = cx + r * Math.cos(a1), y1 = cy - r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy - r * Math.sin(a2);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  };
  // Concentric instrument lines
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const t = i / 10;
    const a = Math.PI - t * Math.PI;
    const inner = r - 8, outer = r + 6;
    const x1 = cx + inner * Math.cos(a), y1 = cy - inner * Math.sin(a);
    const x2 = cx + outer * Math.cos(a), y2 = cy - outer * Math.sin(a);
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={T.esprLine} strokeWidth="1.5" strokeLinecap="round" />;
  });
  // Needle rotation: capacity 0 → -90deg (pointing left), 100 → +90deg
  const angle = -90 + (animTarget / 100) * 180;
  return (
    <svg viewBox="0 0 400 220" style={{ width: "100%", height: "auto", maxWidth: 460 }} aria-label={`Capacity gauge: ${value} of 100`}>
      {/* Outer track */}
      <path d={arcPath(0, 1)} stroke={T.esprDeep} strokeWidth={w + 4} fill="none" strokeLinecap="butt" />
      {/* Zone arcs */}
      <path d={arcPath(0,    0.34)} stroke={T.blush} strokeWidth={w} fill="none" strokeLinecap="butt" />
      <path d={arcPath(0.34, 0.65)} stroke={T.gold}  strokeWidth={w} fill="none" strokeLinecap="butt" />
      <path d={arcPath(0.65, 1)}    stroke={T.sage}  strokeWidth={w} fill="none" strokeLinecap="butt" />
      {/* Instrument tick marks */}
      <g>{ticks}</g>
      {/* Centre rivet */}
      <circle cx={cx} cy={cy} r="9" fill={T.esprDeep} stroke={T.gold} strokeWidth="2" />
      {/* Needle group */}
      <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: "transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
        <line x1={cx} y1={cy} x2={cx} y2={cy - r + 18} stroke={T.gold} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy - r + 18} r="5" fill={T.cream} stroke={T.gold} strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r="4" fill={T.gold} />
      </g>
      {/* End labels */}
      <text x={cx - r - 6} y={cy + 18} fill={T.mutedDeep} fontSize="11" fontFamily="'Inter', sans-serif" fontWeight="700" letterSpacing="2" textAnchor="end">0</text>
      <text x={cx + r + 6} y={cy + 18} fill={T.mutedDeep} fontSize="11" fontFamily="'Inter', sans-serif" fontWeight="700" letterSpacing="2" textAnchor="start">100</text>
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
  const [body, setBody]                   = useState(BODY_INIT);
  const [needleAnim, setNeedleAnim]       = useState(0);
  const [recentId, setRecentId]           = useState(null);

  const activeDay = WEEK[activeDayIdx];
  const baseCapacity = activeDay.capacity;
  const effective = Math.max(0, baseCapacity - completed.size * 3);

  // Spring needle in on mount + animate on changes
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

  const toggleAnchor = (id) => {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, anchor: !t.anchor } : t));
  };

  const deferAll = () => {
    setDeferred(true);
  };

  const restoreDeferred = () => setDeferred(false);

  const handleCompose = () => {
    const text = composeText.trim();
    if (!text) return;
    const type = composeType || classifyText(text);
    let rail;
    if (composePhase === "high") rail = "BALANCED";
    else rail = durGuessByCapacity(text);
    const newId = Date.now();
    setTasks(ts => [...ts, { id: newId, rail, type, title: text, dur: 15, meta: type, anchor: anchorFlag }]);
    setRecentId(newId);
    setTimeout(() => setRecentId(null), 900);
    setComposeText("");
    setComposeType(null);
    setComposePhase("now");
    setAnchorFlag(false);
    setComposeOpen(false);
    // Ensure the rail it was added to is open
    setRailsOpen(r => ({ ...r, [rail]: true }));
  };

  const bumpBody = (key) => {
    setBody(b => {
      const c = b[key];
      if (key === "water") return { ...b, water: { ...c, value: Math.min(8, c.value + 1) } };
      if (key === "mood" || key === "energy") return { ...b, [key]: { ...c, value: Math.min(5, c.value + 1) } };
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
          <Calendar size={11} style={{ color: T.gold }} />
          <span>{activeDayIdx === TODAY_INDEX ? "TODAY" : (activeDayIdx < TODAY_INDEX ? "PAST" : "AHEAD")}</span>
        </div>
      </div>

      {/* Gauge + side strip */}
      <div style={gaugeRow}>
        <div style={gaugePanel}>
          <CapacityGauge value={baseCapacity} animTarget={needleAnim} />
          <div style={gaugeNumWrap}>
            <div style={gaugeNum}>{effective}<span style={gaugeNumOf}> / 100 capacity</span></div>
            <div style={gaugeSub}>Luteal &middot; Day 25{completed.size > 0 ? ` · -${completed.size * 3} spent` : ""}</div>
          </div>
          <div style={chipRowGauge}>
            <div style={{ ...insightChip, background: "rgba(232,180,184,0.18)", borderColor: "rgba(232,180,184,0.45)", color: T.blush }}>
              <TrendingDown size={12} />
              <span><b>{insights.highLoad}</b> high-load days ahead</span>
            </div>
            <div style={{ ...insightChip, background: "rgba(143,175,143,0.18)", borderColor: "rgba(143,175,143,0.40)", color: T.sage }}>
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
              <div key={d.day} style={{ ...sideRow, opacity: isToday ? 1 : 0.7 }}>
                <div style={sideRowLabel}>
                  <div style={{ ...sideDot, background: isToday ? T.gold : T.esprLine }} />
                  <span>{label}</span>
                </div>
                <div style={sideBarWrap}>
                  <div style={{ ...sideBarFill, width: `${d.capacity}%`, background: tone }} />
                </div>
                <div style={{ ...sideVal, color: isToday ? T.cream : T.mutedDeep }}>{d.capacity}</div>
              </div>
            );
          })}
          <div style={sidePanelFootnote}>Predicted capacity from cycle phase &amp; sleep history.</div>
        </div>
      </div>

      {/* Today's recommended badge */}
      <div style={recommendBar}>
        <Pin size={13} style={{ color: T.gold }} />
        <span>Today's rail is <b style={{ color: T.gold }}>{RAIL_META[todayRail].label}</b>.</span>
        <span style={recommendDivider}>·</span>
        <span style={{ color: T.muted }}>Capacity {effective} sits {effective >= 65 ? "in" : effective >= 35 ? "in" : "in"} the {todayRail.toLowerCase()} band.</span>
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
              borderColor: isToday ? meta.tone : meta.border,
              boxShadow: isToday ? `inset 0 0 0 1px ${meta.tone}` : "none",
            }}>
              <button onClick={() => toggleRail(key)} style={railHeader}>
                <div style={{ ...railHeaderIcon, background: `${meta.tone}33`, border: `1px solid ${meta.tone}55` }}>
                  <RailIcon size={15} style={{ color: meta.tone }} />
                </div>
                <div style={{ textAlign: "left", flex: 1 }}>
                  <div style={railHeaderTitle}>
                    {meta.label}
                    {isToday && <span style={{ ...railTodayPill, background: meta.tone, color: T.espresso }}>RECOMMENDED</span>}
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
                  <AlertTriangle size={14} style={{ color: T.blush, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={warningTitle}>Today's capacity ({effective}) may not support intensive tasks.</div>
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
                  <span>3 tasks deferred to <b>{WEEK[nextHighIdx]?.day} {WEEK[nextHighIdx]?.date}</b>. Mock — no entity touched.</span>
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
                                style={{ ...checkBox, background: done ? T.gold : "transparent", borderColor: done ? T.gold : meta.tone }}>
                          {done && <Check size={12} style={{ color: T.espresso }} strokeWidth={3} />}
                        </button>
                        <div style={{ ...taskIcon, background: `${meta.tone}22`, border: `1px solid ${meta.tone}44` }}>
                          <Icon size={12} style={{ color: meta.tone }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0, opacity: done ? 0.55 : 1, textDecoration: done ? "line-through" : "none" }}>
                          <div style={taskTitle}>{t.title}</div>
                          <div style={taskMeta}>
                            <Clock size={9} /> {t.dur} min
                            <span style={{ opacity: 0.5 }}>·</span>
                            <span style={{ textTransform: "capitalize" }}>{t.meta}</span>
                            {t.anchor && <span style={anchorPill}><Anchor size={9} /> ANCHOR</span>}
                          </div>
                        </div>
                        <button onClick={() => toggleAnchor(t.id)} aria-label="Toggle anchor" style={{ ...anchorBtn, color: t.anchor ? T.gold : T.muted, borderColor: t.anchor ? T.gold : "rgba(244,237,219,0.10)" }}>
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
            const hasItems = INITIAL_TASKS.length > 0;
            return (
              <button key={d.day} onClick={() => { setActiveDayIdx(idx); setCompleted(new Set()); setDeferred(false); }}
                      style={{ ...weekCol, borderColor: isToday ? T.gold : "rgba(244,237,219,0.06)", boxShadow: isActive ? `0 0 0 1px ${T.gold}` : "none", animation: isToday ? "fwTodayPulse 2.4s ease-in-out infinite" : undefined }}>
                <div style={weekDay}>{d.day}</div>
                <div style={weekDate}>{d.date}</div>
                <div style={weekBarTrack}>
                  <div style={{ ...weekBarFill, height: `${d.capacity}%`, background: tone }} />
                </div>
                <div style={{ ...weekVal, color: tone }}>{d.capacity}</div>
                {hasItems && <div style={weekItemsDot} />}
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
            <span style={cmdHint}>Try &ldquo;Deep work block&rdquo; or &ldquo;Magnesium tonight&rdquo;</span>
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
                          style={{ ...cmdChip, color: active ? tone : T.muted, borderColor: active ? tone : "rgba(244,237,219,0.10)", background: active ? `${tone}22` : "transparent" }}>
                    <Icon size={11} />
                    {label}
                  </button>
                );
              })}
              <button onClick={() => setAnchorFlag(v => !v)}
                      style={{ ...cmdChip, color: anchorFlag ? T.gold : T.muted, borderColor: anchorFlag ? T.gold : "rgba(244,237,219,0.10)", background: anchorFlag ? `${T.gold}22` : "transparent" }}>
                <Pin size={11} /> Anchor
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
                          style={{ ...cmdChip, color: active ? T.espresso : T.cream, borderColor: active ? T.gold : "rgba(244,237,219,0.10)", background: active ? T.gold : "transparent", fontWeight: active ? 700 : 600 }}>
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
                Will land on <b>{WEEK[nextHighIdx].day} {WEEK[nextHighIdx].date}</b> &middot; capacity <b>{WEEK[nextHighIdx].capacity}</b> — the next ≥ 65 window.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right body dock */}
      <div style={{ ...dockShell, transform: dockOpen ? "translateX(0)" : "translateX(calc(100% - 36px))" }}>
        <button onClick={() => setDockOpen(v => !v)} style={dockTab} aria-label={dockOpen ? "Hide body" : "Show body"}>
          {dockOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
        <div style={dockBody}>
          <div style={dockEyebrow}>YOUR BODY</div>
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
          <p style={dockNote}>Same entity as Today check-in &mdash; nothing is duplicated here.</p>
        </div>
      </div>
    </div>
  );
}

// ── CSS animations ──────────────────────────────────────────────────────────
const css = `
@keyframes fwTaskDrop { 0% { transform: translateY(-8px); opacity: 0 } 100% { transform: translateY(0); opacity: 1 } }
@keyframes fwTodayPulse { 0%, 100% { box-shadow: 0 0 0 1px ${T.gold} } 50% { box-shadow: 0 0 0 3px rgba(212,175,55,0.35) } }
@keyframes fwEyebrowDot { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
.fw-mission-scroll::-webkit-scrollbar { display: none }
.fw-mission-scroll { -ms-overflow-style: none; scrollbar-width: none }
`;

// ── Styles ──────────────────────────────────────────────────────────────────
const shell = {
  position: "relative",
  background: T.espresso,
  color: T.cream,
  borderRadius: 24,
  padding: "20px 18px 24px",
  border: `1px solid ${T.esprLine}`,
  boxShadow: "0 24px 64px rgba(58,44,26,0.36)",
  maxWidth: 760,
  margin: "0 auto",
  fontFamily: "'Inter', system-ui, sans-serif",
};

const topRow = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 };
const eyebrowGroup = { display: "inline-flex", alignItems: "center", gap: 8 };
const eyebrowDot = { width: 7, height: 7, borderRadius: 9999, background: T.gold, boxShadow: `0 0 0 3px rgba(212,175,55,0.25)`, animation: "fwEyebrowDot 2.4s ease-in-out infinite" };
const eyebrowText = { fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: T.muted };
const pillSmall = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "4px 10px", borderRadius: 9999,
  border: `1px solid ${T.esprLine}`,
  background: T.esprDeep, color: T.cream,
  fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
};

const gaugeRow = {
  display: "grid",
  gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)",
  gap: 14, alignItems: "stretch", marginBottom: 14,
};
const gaugePanel = {
  background: T.esprDeep,
  borderRadius: 18,
  padding: "16px 16px 18px",
  border: `1px solid ${T.esprLine}`,
  position: "relative",
};
const gaugeNumWrap = { marginTop: -42, textAlign: "center" };
const gaugeNum = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 56, fontWeight: 400, color: T.cream,
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
  background: T.esprDeep,
  borderRadius: 18, padding: 14,
  border: `1px solid ${T.esprLine}`,
  display: "flex", flexDirection: "column", gap: 8,
};
const sidePanelEyebrow = { fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: T.muted, marginBottom: 4 };
const sideRow = { display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 10 };
const sideRowLabel = { display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T.cream, fontWeight: 600 };
const sideDot = { width: 6, height: 6, borderRadius: 9999 };
const sideBarWrap = { height: 6, borderRadius: 9999, background: "rgba(244,237,219,0.06)", overflow: "hidden" };
const sideBarFill = { height: "100%", borderRadius: 9999, transition: "width 0.5s ease" };
const sideVal = { fontSize: 11, fontWeight: 700, minWidth: 22, textAlign: "right" };
const sidePanelFootnote = { fontSize: 10, color: T.mutedDeep, fontStyle: "italic", lineHeight: 1.5, marginTop: 4 };

const recommendBar = {
  display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap",
  padding: "10px 14px", marginBottom: 14,
  background: T.esprDeep,
  border: `1px solid ${T.esprLine}`,
  borderRadius: 14,
  fontSize: 12, color: T.cream, fontWeight: 500,
};
const recommendDivider = { color: T.mutedDeep };

const railsWrap = { display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 };
const railShell = {
  borderRadius: 16,
  border: "1.5px solid",
  overflow: "hidden",
};
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
  fontSize: 14, fontWeight: 700, color: T.cream,
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
  background: "rgba(0,0,0,0.18)",
  border: `1px solid ${T.esprLine}`,
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
const taskTitle = { fontSize: 13, fontWeight: 600, color: T.cream, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
const taskMeta = {
  fontSize: 10, color: T.muted, marginTop: 2,
  display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap",
  letterSpacing: "0.06em",
};
const anchorPill = {
  display: "inline-flex", alignItems: "center", gap: 3,
  padding: "1px 6px", borderRadius: 9999,
  background: `${T.gold}22`, color: T.gold,
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
  background: "rgba(232,180,184,0.10)",
  border: `1px solid rgba(232,180,184,0.32)`,
};
const warningTitle = { fontSize: 12, fontWeight: 600, color: T.cream, lineHeight: 1.35 };
const warningSub = { fontSize: 11, color: T.muted, marginTop: 2 };
const deferBtn = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "6px 11px", borderRadius: 9999,
  background: T.blush, color: T.espresso,
  border: "none", cursor: "pointer",
  fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
  flexShrink: 0,
};
const deferredNote = {
  margin: "0 14px 12px",
  display: "flex", alignItems: "center", gap: 8,
  padding: "9px 12px", borderRadius: 12,
  background: "rgba(143,175,143,0.10)",
  border: `1px solid rgba(143,175,143,0.32)`,
  fontSize: 12, color: T.cream,
};
const undoBtn = {
  marginLeft: "auto",
  padding: "4px 10px", borderRadius: 9999,
  background: "transparent", color: T.sage,
  border: `1px solid ${T.sage}`,
  fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
  cursor: "pointer", textTransform: "uppercase",
};

// Week strip
const weekWrap = {
  marginBottom: 14,
  padding: 14,
  background: T.esprDeep,
  border: `1px solid ${T.esprLine}`,
  borderRadius: 16,
};
const weekHead = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 8 };
const weekEyebrow = { fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: T.muted };
const weekHint = { fontSize: 10, color: T.mutedDeep, fontStyle: "italic" };
const weekRow = { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 };
const weekCol = {
  background: "rgba(0,0,0,0.14)",
  border: "1px solid",
  borderRadius: 12, padding: "8px 4px",
  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
  cursor: "pointer", position: "relative",
  minHeight: 96,
};
const weekDay = { fontSize: 9, fontWeight: 700, color: T.muted, letterSpacing: "0.1em" };
const weekDate = { fontFamily: "'Fraunces', Georgia, serif", fontSize: 14, color: T.cream, fontWeight: 500 };
const weekBarTrack = {
  width: 8, height: 36, marginTop: 4,
  borderRadius: 9999, background: "rgba(244,237,219,0.06)",
  display: "flex", flexDirection: "column-reverse", overflow: "hidden",
};
const weekBarFill = { width: "100%", borderRadius: 9999, transition: "height 0.5s ease" };
const weekVal = { fontSize: 11, fontWeight: 700, marginTop: 2 };
const weekItemsDot = {
  position: "absolute", top: 6, right: 6,
  width: 4, height: 4, borderRadius: 9999, background: T.gold,
};

// Command bar
const cmdWrap = { marginBottom: 4 };
const cmdClosed = {
  width: "100%",
  display: "flex", alignItems: "center", gap: 10,
  padding: "13px 14px",
  background: T.esprPlus, color: T.cream,
  border: `1px solid ${T.esprLine}`, borderRadius: 16,
  cursor: "pointer", textAlign: "left",
};
const cmdPlaceholder = { fontSize: 14, color: T.cream, fontWeight: 500 };
const cmdHint = { marginLeft: "auto", fontSize: 10, color: T.muted, fontStyle: "italic" };

const cmdOpen = {
  padding: 12, borderRadius: 16,
  background: T.esprPlus, color: T.cream,
  border: `1px solid ${T.gold}66`,
  boxShadow: `0 4px 16px rgba(0,0,0,0.30)`,
};
const cmdInputRow = { display: "flex", gap: 8, alignItems: "center", marginBottom: 10 };
const cmdInput = {
  flex: 1, border: "none", outline: "none",
  background: "transparent", color: T.cream,
  fontSize: 15, padding: "6px 4px", fontFamily: "inherit",
  borderBottom: `1px solid ${T.esprLine}`,
};
const cmdVoice = {
  width: 34, height: 34, borderRadius: 9999,
  background: "rgba(232,180,184,0.15)",
  border: `1px solid ${T.blush}44`,
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
const cmdPhaseLabel = { fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: T.muted, marginBottom: 6, marginTop: 4 };
const cmdCancel = {
  padding: "6px 13px", borderRadius: 9999,
  background: "transparent", color: T.muted,
  border: `1px solid ${T.esprLine}`,
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
  background: "rgba(143,175,143,0.10)",
  border: `1px solid rgba(143,175,143,0.32)`,
  fontSize: 11, color: T.cream,
};

// Right dock
const dockShell = {
  position: "absolute",
  top: 16, right: -8,
  display: "flex",
  transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
  zIndex: 5,
};
const dockTab = {
  width: 36, height: 56,
  borderRadius: "12px 0 0 12px",
  background: T.gold, color: T.espresso,
  border: "none", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
};
const dockBody = {
  width: 200,
  background: T.esprDeep,
  border: `1px solid ${T.esprLine}`,
  borderRight: "none",
  borderRadius: "16px 0 0 16px",
  padding: "14px 14px 16px",
};
const dockEyebrow = { fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: T.muted, marginBottom: 10 };
const dockGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 };
const dockTile = {
  border: "1px solid",
  borderRadius: 12, padding: "10px 8px",
  background: T.espresso,
  display: "flex", flexDirection: "column", gap: 4,
  cursor: "pointer", textAlign: "left", color: T.cream,
};
const dockTileIcon = { width: 22, height: 22, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" };
const dockTileValue = { fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, fontWeight: 600, color: T.cream, lineHeight: 1 };
const dockTileUnit = { fontSize: 10, color: T.muted, marginLeft: 2 };
const dockTileLabel = { fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: T.muted };
const dockNote = { marginTop: 10, marginBottom: 0, fontSize: 10, color: T.muted, lineHeight: 1.4, fontStyle: "italic" };
