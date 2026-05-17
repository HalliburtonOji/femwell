// ─────────────────────────────────────────────────────────────────────────────
// BiorhythmTimeline — Concept 1 demo for /Ideas.
//
// A rich vertical day timeline (06:00–23:00) where capacity is painted
// directly onto the canvas:
//   · left-to-right hour gradients tinted by capacity bucket
//   · thin vertical energy bars on the left edge of each row
//   · existing planner items rendered as rounded type-coloured blocks
//   · unscheduled tray below the timeline, tap-to-pick-up → tap-to-slot
//   · NLP compose bar at top (parses "at 9am" / classifies med/task/ritual)
//   · right-edge body dock (sleep / mood / energy / hydration mini-tiles)
//   · bottom week strip with per-day capacity micro-bars
//
// Self-contained demo, mounted as the first tab inside /Ideas. Uses ONLY the
// design tokens listed in CLAUDE.md and Lucide icons (no emoji codepoints).
// Real planner data is left alone — this component owns its own mock state.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo } from "react";
import {
  Pill, Briefcase, Sparkles, Activity, Droplets, Moon,
  Heart, X, Plus, ChevronRight, Clock, Zap, ListPlus,
  Baby, Footprints, FileText, Stethoscope, Star, TrendingUp,
} from "lucide-react";

// ── Design tokens ───────────────────────────────────────────────────────────
const TOKENS = {
  cream:    "#F4EDDB",
  paper:    "#FBF6E6",
  espresso: "#3A2C1A",
  plum:     "#4A2A3A",
  blush:    "#E8B4B8",
  sage:     "#8FAF8F",
  muted:    "#9B8B7A",
  gold:     "#D4AF37",
  goldDeep: "#A6862B",
  rose:     "#D45E52",
};

// ── Mock data ────────────────────────────────────────────────────────────────
// Luteal day 25 · capacity 42 · sleep 7.5h · mood 4/5 — afternoon dip is
// the defining feature of this profile.
const PHASE = { name: "LUTEAL", day: 25, capacity: 42 };

const ENERGY_CURVE = {
  6: 30, 7: 45, 8: 62, 9: 72, 10: 76, 11: 70,
  12: 58, 13: 50, 14: 38, 15: 30, 16: 28, 17: 34,
  18: 48, 19: 56, 20: 50, 21: 40, 22: 28, 23: 18,
};
const HOURS = Object.keys(ENERGY_CURVE).map(Number).sort((a, b) => a - b);
const TIMELINE_START = 6;
const HOUR_PX = 72;

// Every item references a real Planner section — Morning Stack habits,
// MedicationReminders, RitualBundles, Tonight card, Shutdown ritual,
// PlannerItems (incl. anchor tasks + antenatal appointment).
const INITIAL_TASKS = [
  { id: 1, type: "habit",      hour: 7,  minute: 0,  dur: 15, title: "Morning stretch",       note: "Five sun salutations.",                source: "Morning Stack",       anchor: true },
  { id: 2, type: "medication", hour: 8,  minute: 0,  dur: 5,  title: "Folic acid 400 mcg",    note: "With breakfast.",                       source: "MedicationReminders" },
  { id: 3, type: "habit",      hour: 8,  minute: 30, dur: 5,  title: "Drink water",            note: "First glass.",                          source: "Morning Stack"      },
  { id: 4, type: "task",       hour: 10, minute: 0,  dur: 90, title: "Deep work block",       note: "Q3 strategy doc — first draft.",        source: "PlannerItems",       anchor: true },
  { id: 5, type: "habit",      hour: 12, minute: 30, dur: 30, title: "Lunch + walk",          note: "Outside if dry.",                       source: "Morning Stack"      },
  { id: 6, type: "task",       hour: 14, minute: 0,  dur: 60, title: "Antenatal class",       note: "Trimester II group session.",           source: "PlannerItems"       },
  { id: 7, type: "ritual",     hour: 15, minute: 30, dur: 10, title: "Tulsi tea ritual",      note: "Phone face down. From RitualBundles.",  source: "RitualBundles"      },
  { id: 8, type: "medication", hour: 18, minute: 30, dur: 5,  title: "Magnesium glycinate",   note: "200 mg before dinner.",                 source: "MedicationReminders" },
  { id: 9, type: "habit",      hour: 19, minute: 30, dur: 30, title: "Evening walk",          note: "20 min slow loop.",                     source: "Morning Stack"      },
  { id: 10,type: "ritual",     hour: 20, minute: 30, dur: 20, title: "Tonight — wind-down",   note: "Tonight card pre-placement.",           source: "Tonight card"       },
  { id: 11,type: "ritual",     hour: 22, minute: 0,  dur: 8,  title: "Shutdown ritual",       note: "3-step ritual: close tabs, anchor, breath.", source: "Shutdown card"   },
];

const INITIAL_UNSCHEDULED = [
  { id: 100, type: "task",   dur: 45, title: "Q3 planning review", note: "Read team draft and comment.", source: "PlannerItems", anchor: true },
  { id: 101, type: "ritual", dur: 20, title: "Epsom bath",         note: "From RitualBundles — Warmth set.", source: "RitualBundles" },
  { id: 102, type: "habit",  dur: 1,  title: "Vitamin D",          note: "1000 IU.",                       source: "Morning Stack" },
  { id: 103, type: "task",   dur: 10, title: "Reply to Sarah",      note: "Re: scope for next week.",       source: "PlannerItems" },
];

// Six body tiles — matches the live Planner: Sleep / Mood / Energy /
// Hydration / Movement / Baby (Baby surfaces only on pregnancy stages).
const BODY = {
  sleep:    { value: 7.5, unit: "h",   label: "Sleep",     icon: Moon,        tone: TOKENS.plum    },
  mood:     { value: 4,   unit: "/5",  label: "Mood",      icon: Heart,       tone: TOKENS.rose    },
  energy:   { value: 3,   unit: "/5",  label: "Energy",    icon: Zap,         tone: TOKENS.gold    },
  water:    { value: 4,   unit: "/8",  label: "Hydration", icon: Droplets,    tone: "#60B4FA"      },
  movement: { value: 32,  unit: "min", label: "Movement",  icon: Footprints,  tone: TOKENS.sage    },
  baby:     { value: "✓", unit: "kicks", label: "Baby",    icon: Baby,        tone: TOKENS.blush   },
};

// 28-day consistency dots for the Journey tab — kept / missed / today.
const CONSISTENCY_28 = [
  1,1,1,0,1,1,1, 1,0,1,1,1,1,0, 1,1,1,1,0,1,1, 1,1,1,1,1,1,1,
];

const WEEK = [
  { day: "Mon", value: 72, phase: "follicular" },
  { day: "Tue", value: 68, phase: "follicular" },
  { day: "Wed", value: 58, phase: "luteal"     },
  { day: "Thu", value: 50, phase: "luteal"     },
  { day: "Fri", value: 42, phase: "luteal", today: true },
  { day: "Sat", value: 38, phase: "luteal"     },
  { day: "Sun", value: 30, phase: "menstrual"  },
];

const MOCK_NOW = { hour: 14, minute: 25 };

// ── Helpers ─────────────────────────────────────────────────────────────────
function capacityBucket(v) {
  if (v >= 60) return "high";
  if (v >= 40) return "medium";
  if (v >= 20) return "low";
  return "rest";
}
const BUCKET_COLOR = { high: TOKENS.sage, medium: TOKENS.gold, low: TOKENS.blush, rest: TOKENS.espresso };
const BUCKET_BG = {
  high:   "linear-gradient(90deg, rgba(143,175,143,0.22) 0%, rgba(143,175,143,0.02) 100%)",
  medium: "linear-gradient(90deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.02) 100%)",
  low:    "linear-gradient(90deg, rgba(232,180,184,0.20) 0%, rgba(232,180,184,0.02) 100%)",
  rest:   "linear-gradient(90deg, rgba(58,44,26,0.10) 0%, rgba(58,44,26,0.01) 100%)",
};
const BUCKET_LABEL = { high: "High capacity", medium: "Medium capacity", low: "Low capacity", rest: "Rest window" };

const BLOCK = {
  habit:      { bg: "#E5EEE5",     border: TOKENS.sage,     fg: "#3F5F3F",       label: "habit"    },
  medication: { bg: "#F5DDE0",     border: TOKENS.blush,    fg: "#7E4548",       label: "med"      },
  task:       { bg: TOKENS.paper,  border: TOKENS.espresso, fg: TOKENS.espresso, label: "task"     },
  ritual:     { bg: "#F7EBC4",     border: TOKENS.gold,     fg: "#7A6314",       label: "ritual"   },
};
const ICON_BY_TYPE = { habit: Activity, medication: Pill, task: Briefcase, ritual: Sparkles };

function hourLabel(h) {
  if (h === 0)  return "12 am";
  if (h === 12) return "12 pm";
  if (h < 12)   return `${h} am`;
  return `${h - 12} pm`;
}

function classifyText(text) {
  const t = text.toLowerCase();
  if (/(med|pill|vitamin|magnesium|folic|hrt|tablet|capsule|dose)/.test(t))   return "medication";
  if (/(walk|stretch|run|water|hydrat|sleep|step|workout|exercise)/.test(t))   return "habit";
  if (/(tea|bath|ritual|breath|meditat|gratitude|journal|wash|wind\s?down)/.test(t)) return "ritual";
  return "task";
}

function parseTime(text) {
  const m = text.toLowerCase().match(/(?:^|\s)(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/);
  if (!m) return null;
  let hour = Number(m[1]);
  const minute = m[2] ? Number(m[2]) : 0;
  const period = m[3];
  if (period === "pm" && hour < 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;
  if (!period && hour >= 1 && hour <= 6) hour += 12; // "at 3" → 3pm
  if (hour < TIMELINE_START || hour > 23) return null;
  return { hour, minute };
}

function nowLineTop({ hour, minute }) {
  return (hour - TIMELINE_START + minute / 60) * HOUR_PX;
}

// ── Component ───────────────────────────────────────────────────────────────
export default function BiorhythmTimeline() {
  const [tasks, setTasks]                 = useState(INITIAL_TASKS);
  const [unscheduled, setUnscheduled]     = useState(INITIAL_UNSCHEDULED);
  const [composeOpen, setComposeOpen]     = useState(false);
  const [composeText, setComposeText]     = useState("");
  const [composeType, setComposeType]     = useState(null);
  const [expandedBlock, setExpandedBlock] = useState(null);
  const [pickedUp, setPickedUp]           = useState(null);
  const [dockOpen, setDockOpen]           = useState(false);
  const [dockTab, setDockTab]             = useState("body"); // body | journey
  const [recentId, setRecentId]           = useState(null);
  const [body, setBody]                   = useState(BODY);
  const [stageBannerOpen, setStageBannerOpen] = useState(true);
  const [careOpen, setCareOpen]           = useState(false);
  const [, setTick]                       = useState(0);

  // micro-pulse every minute
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 60000);
    return () => clearInterval(t);
  }, []);

  // best-capacity unoccupied hour — the nudge ring target
  const bestSlot = useMemo(() => {
    let best = { hour: TIMELINE_START, val: -1 };
    HOURS.forEach((h) => {
      const occupied = tasks.some(t => t.hour === h);
      if (!occupied && ENERGY_CURVE[h] > best.val) best = { hour: h, val: ENERGY_CURVE[h] };
    });
    return best.hour;
  }, [tasks]);

  const flashId = (id) => {
    setRecentId(id);
    setTimeout(() => setRecentId(null), 900);
  };

  const handleSlot = (hour) => {
    if (!pickedUp) return;
    const newTask = { ...pickedUp, hour, minute: 0, id: Date.now() };
    setTasks(t => [...t, newTask]);
    setUnscheduled(u => u.filter(x => x.id !== pickedUp.id));
    setPickedUp(null);
    flashId(newTask.id);
  };

  const handleCompose = () => {
    const text = composeText.trim();
    if (!text) return;
    const type = composeType || classifyText(text);
    const time = parseTime(text);
    const cleanTitle = text
      .replace(/(?:^|\s)at\s+\d{1,2}(?::\d{2})?\s*(am|pm)?/i, "")
      .replace(/every\s+\w+/i, "")
      .replace(/\btonight\b|\bmorning\b|\bafternoon\b|\bevening\b/gi, "")
      .replace(/\s+/g, " ")
      .trim() || "Untitled";
    if (time) {
      const newId = Date.now();
      setTasks(t => [...t, { id: newId, type, hour: time.hour, minute: time.minute, dur: 15, title: cleanTitle, note: "From quick compose." }]);
      flashId(newId);
    } else {
      setUnscheduled(u => [{ id: Date.now(), type, dur: 15, title: cleanTitle, note: "Tap a time to place." }, ...u]);
    }
    setComposeText("");
    setComposeType(null);
    setComposeOpen(false);
  };

  const completeBlock = (id) => {
    setTasks(t => t.map(x => x.id === id ? { ...x, completed: !x.completed } : x));
  };

  const removeBlock = (id) => {
    setTasks(t => t.filter(x => x.id !== id));
    setExpandedBlock(null);
  };

  const bumpBody = (key) => {
    setBody(b => {
      const cur = b[key];
      if (key === "water") return { ...b, water: { ...cur, value: Math.min(8, cur.value + 1) } };
      if (key === "mood" || key === "energy") return { ...b, [key]: { ...cur, value: Math.min(5, cur.value + 1) } };
      if (key === "movement") return { ...b, movement: { ...cur, value: cur.value + 5 } };
      return b;
    });
  };

  const consistencyKept = CONSISTENCY_28.filter(d => d === 1).length;

  const totalTimelinePx = HOURS.length * HOUR_PX;
  const nowTop = nowLineTop(MOCK_NOW);

  return (
    <div style={shell}>
      <style>{cssAnimations}</style>

      {/* Phase pill row — phase pill + GP export icon */}
      <div style={phasePillRow}>
        <div style={phasePill}>
          <span style={phaseDot} />
          <span style={phaseTextEyebrow}>{PHASE.name}</span>
          <span style={phaseDivider}>·</span>
          <span style={phaseTextBody}>Day {PHASE.day}</span>
          <span style={phaseDivider}>·</span>
          <span style={phaseTextBody}>Capacity {PHASE.capacity}%</span>
        </div>
        <button onClick={() => setCareOpen(true)} style={exportBtn} aria-label="Open GP export and Doctor-Ready Diary">
          <FileText size={11} />
          Export
        </button>
      </div>

      {/* Life-stage banner — collapsible, pinned below phase pill */}
      <button onClick={() => setStageBannerOpen(v => !v)} style={stageBanner} aria-expanded={stageBannerOpen}>
        <div style={{ ...stageBannerIcon, background: "rgba(232,180,184,0.30)", color: TOKENS.rose }}>
          <Baby size={14} />
        </div>
        <div style={{ flex: 1, textAlign: "left" }}>
          <div style={stageBannerTitle}>Pregnancy &middot; Trimester II &middot; Week 22</div>
          {stageBannerOpen && (
            <div style={stageBannerSub}>
              Kick counter logged 11:14 &middot; Next antenatal: <b>14:00</b> today &middot; 20-week scan complete &middot; HRT card hidden (stage-protected)
            </div>
          )}
        </div>
        <ChevronRight size={14} style={{ color: TOKENS.muted, transform: stageBannerOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
      </button>

      {/* Compose bar */}
      <div style={composeWrap}>
        {!composeOpen ? (
          <button onClick={() => setComposeOpen(true)} style={composeClosed}>
            <Plus size={16} style={{ color: TOKENS.muted }} />
            <span style={composePlaceholder}>Add to today&hellip;</span>
            <span style={composeHint}>Try &ldquo;Magnesium at 8pm&rdquo;</span>
          </button>
        ) : (
          <div style={composeOpenStyle}>
            <input
              autoFocus
              value={composeText}
              onChange={(e) => setComposeText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCompose(); if (e.key === "Escape") setComposeOpen(false); }}
              placeholder="e.g. Reply to Sarah at 3pm"
              style={composeInput}
            />
            <div style={chipRow}>
              {[
                { id: "medication", label: "Med",    Icon: Pill,       tone: TOKENS.blush  },
                { id: "task",       label: "Task",   Icon: Briefcase,  tone: TOKENS.espresso },
                { id: "ritual",     label: "Ritual", Icon: Sparkles,   tone: TOKENS.gold   },
                { id: "habit",      label: "Habit",  Icon: Activity,   tone: TOKENS.sage   },
              ].map(({ id, label, Icon, tone }) => {
                const active = composeType === id;
                return (
                  <button key={id}
                    onClick={() => setComposeType(active ? null : id)}
                    style={{ ...chip, borderColor: active ? tone : "rgba(58,44,26,0.12)", background: active ? `${tone}22` : "transparent", color: active ? TOKENS.espresso : TOKENS.muted }}>
                    <Icon size={12} style={{ color: tone }} />
                    {label}
                  </button>
                );
              })}
              <div style={{ flex: 1 }} />
              <button onClick={() => setComposeOpen(false)} style={composeCancel}>Cancel</button>
              <button onClick={handleCompose} style={composeSave}>Add</button>
            </div>
          </div>
        )}
        {pickedUp && (
          <div style={pickedBanner}>
            <Sparkles size={13} style={{ color: TOKENS.goldDeep }} />
            <span><b>{pickedUp.title}</b> &mdash; tap an hour to place it. Gold ring shows the highest-capacity slot.</span>
            <button onClick={() => setPickedUp(null)} style={pickedCancel}>Cancel</button>
          </div>
        )}
      </div>

      {/* Stage */}
      <div style={stage}>
        {/* Timeline column */}
        <div style={timelineCol}>
          <div style={{ ...timelineWrap, height: totalTimelinePx }}>
            {/* Hour rows */}
            {HOURS.map((h, idx) => {
              const energy = ENERGY_CURVE[h];
              const bucket = capacityBucket(energy);
              const isBest = h === bestSlot && !!pickedUp;
              const isNowHour = h === MOCK_NOW.hour;
              return (
                <div key={h}
                     onClick={() => pickedUp && handleSlot(h)}
                     style={{ ...hourRow, top: idx * HOUR_PX, background: BUCKET_BG[bucket], cursor: pickedUp ? "pointer" : "default" }}>
                  <div style={timeLabel}>{hourLabel(h)}</div>
                  <div style={energyBarTrack}>
                    <div style={{ ...energyBarFill, height: `${energy}%`, background: BUCKET_COLOR[bucket] }} />
                  </div>
                  <div style={hourDivider} />
                  {isBest && <div style={bestRing} aria-label="Best slot for this task" />}
                  {isNowHour && <div style={nowDot} aria-hidden="true" />}
                </div>
              );
            })}

            {/* Now line — animated micro-pulse */}
            <div style={{ ...nowLine, top: nowTop }}>
              <div style={nowLineDot} />
              <div style={nowLineLabel}>NOW · {String(MOCK_NOW.hour).padStart(2, "0")}:{String(MOCK_NOW.minute).padStart(2, "0")}</div>
              <div style={nowLineStroke} />
            </div>

            {/* Tasks rendered as absolutely-positioned blocks */}
            {tasks.map((t) => {
              const top = ((t.hour - TIMELINE_START) + (t.minute || 0) / 60) * HOUR_PX + 4;
              const height = Math.max(36, (t.dur / 60) * HOUR_PX - 8);
              const Icon = ICON_BY_TYPE[t.type];
              const palette = BLOCK[t.type];
              const isRecent = t.id === recentId;
              return (
                <button key={t.id}
                        onClick={() => setExpandedBlock(t)}
                        style={{
                          ...blockBase,
                          top, height,
                          background: palette.bg,
                          borderColor: palette.border,
                          color: palette.fg,
                          opacity: t.completed ? 0.55 : 1,
                          textDecoration: t.completed ? "line-through" : "none",
                          animation: isRecent ? "fwBlockDrop 0.7s ease-out" : undefined,
                        }}>
                  <div style={{ ...blockIcon, background: palette.border }}>
                    <Icon size={13} style={{ color: "white" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                    <div style={blockTitle}>{t.title}</div>
                    <div style={blockMeta}>
                      {t.dur} min · {palette.label}
                      {t.anchor && <span style={anchorTag}>anchor</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right-edge body / journey dock */}
        <div style={{ ...dockShell, transform: dockOpen ? "translateX(0)" : "translateX(calc(100% - 36px))" }}>
          <button onClick={() => setDockOpen(v => !v)} style={dockTab} aria-label={dockOpen ? "Hide body and journey" : "Show body and journey"}>
            {dockOpen ? <ChevronRight size={14} /> : <Heart size={14} />}
          </button>
          <div style={dockBody}>
            {/* Dock tabs — Body / Journey */}
            <div style={dockTabsRow} role="tablist">
              {[
                { id: "body",    label: "Body",    Icon: Heart },
                { id: "journey", label: "Journey", Icon: TrendingUp },
              ].map(({ id, label, Icon }) => {
                const active = dockTab === id;
                return (
                  <button key={id} onClick={() => setDockTab(id)} role="tab" aria-selected={active}
                          style={{ ...dockTabPill, background: active ? TOKENS.espresso : "transparent", color: active ? TOKENS.cream : TOKENS.muted, borderColor: active ? TOKENS.espresso : "rgba(58,44,26,0.10)" }}>
                    <Icon size={11} /> {label}
                  </button>
                );
              })}
            </div>

            {dockTab === "body" && (
              <>
                <div style={dockGrid}>
                  {Object.entries(body).map(([key, m]) => {
                    const Icon = m.icon;
                    return (
                      <button key={key} onClick={() => bumpBody(key)} style={{ ...dockTile, borderColor: `${m.tone}55` }}>
                        <div style={{ ...dockTileIcon, background: `${m.tone}22`, color: m.tone }}>
                          <Icon size={14} />
                        </div>
                        <div style={dockTileValue}>{m.value}<span style={dockTileUnit}>{m.unit}</span></div>
                        <div style={dockTileLabel}>{m.label}</div>
                      </button>
                    );
                  })}
                </div>
                <p style={dockNote}>Six tiles, same DailyCheckins entity as Today — Movement and Baby are stage-aware.</p>
              </>
            )}

            {dockTab === "journey" && (
              <>
                <div style={journeyBlock}>
                  <div style={journeyEyebrow}>CAPACITY TAX</div>
                  <div style={journeyBarTrack}>
                    <div style={{ ...journeyBarFill, width: `${PHASE.capacity}%`, background: TOKENS.gold }} />
                  </div>
                  <div style={journeyMeta}>Predicted load <b>{PHASE.capacity}</b> &middot; defer high-cost items to Thu.</div>
                </div>
                <div style={journeyBlock}>
                  <div style={journeyEyebrow}>28-DAY CONSISTENCY · {consistencyKept}/28</div>
                  <div style={dotsRow}>
                    {CONSISTENCY_28.map((v, i) => (
                      <span key={i} style={{
                        ...dotMini,
                        background: v === 1 ? TOKENS.sage : "rgba(58,44,26,0.10)",
                        transform: i === 14 ? "scale(1.4)" : "scale(1)",
                      }} />
                    ))}
                  </div>
                </div>
                <button onClick={() => setCareOpen(true)} style={journeyDoctorBtn}>
                  <FileText size={12} /> Doctor-Ready Diary
                </button>
                <div style={astraSidecar}>
                  <div style={{ ...stageBannerIcon, background: "rgba(212,175,55,0.20)", color: TOKENS.goldDeep, width: 20, height: 20, borderRadius: 6 }}>
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
                <p style={dockNote}>Capacity Tax + 28-day Consistency + Doctor-Ready Diary + Astra Cole + GP export — all sourced from existing Cycle/Today cards.</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Unscheduled tray */}
      <div style={trayWrap}>
        <div style={trayHeader}>
          <ListPlus size={13} style={{ color: TOKENS.muted }} />
          <span style={trayEyebrow}>UNSCHEDULED · {unscheduled.length}</span>
          <span style={trayHint}>{pickedUp ? "Tap a time slot to place it." : "Tap a card to pick it up."}</span>
        </div>
        <div style={trayScroll}>
          {unscheduled.length === 0 && (
            <div style={trayEmpty}>Tray is empty. Anything you compose without a time appears here.</div>
          )}
          {unscheduled.map((u) => {
            const Icon = ICON_BY_TYPE[u.type];
            const palette = BLOCK[u.type];
            const picked = pickedUp?.id === u.id;
            return (
              <button key={u.id}
                      onClick={() => setPickedUp(picked ? null : u)}
                      style={{
                        ...trayCard,
                        background: palette.bg,
                        borderColor: picked ? TOKENS.goldDeep : palette.border,
                        boxShadow: picked ? `0 0 0 3px ${TOKENS.gold}66` : "0 1px 2px rgba(58,44,26,0.06)",
                        animation: picked ? "fwPickedPulse 1.6s ease-in-out infinite" : "fwShimmer 4s ease-in-out infinite",
                      }}>
                <div style={{ ...trayCardIcon, background: palette.border }}>
                  <Icon size={13} style={{ color: "white" }} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ ...blockTitle, color: palette.fg }}>{u.title}</div>
                  <div style={{ ...blockMeta, color: palette.fg, opacity: 0.7 }}>
                    {u.dur} min · {palette.label}
                    {u.anchor && <span style={anchorTag}>anchor</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Week strip */}
      <div style={weekStrip}>
        <div style={weekEyebrow}>THIS WEEK · CAPACITY</div>
        <div style={weekRow}>
          {WEEK.map((d) => {
            const bucket = capacityBucket(d.value);
            return (
              <div key={d.day} style={{ ...weekCol, opacity: d.today ? 1 : 0.85 }}>
                <div style={weekBarTrack}>
                  <div style={{ ...weekBarFill, height: `${d.value}%`, background: BUCKET_COLOR[bucket] }} />
                </div>
                <div style={{ ...weekDay, color: d.today ? TOKENS.espresso : TOKENS.muted, fontWeight: d.today ? 700 : 500 }}>
                  {d.day}
                </div>
                {d.today && <div style={weekTodayDot} />}
              </div>
            );
          })}
        </div>
        <div style={legendRow}>
          {[
            { bucket: "high",   label: "High"   },
            { bucket: "medium", label: "Medium" },
            { bucket: "low",    label: "Low"    },
            { bucket: "rest",   label: "Rest"   },
          ].map((l) => (
            <div key={l.bucket} style={legendItem}>
              <span style={{ ...legendDot, background: BUCKET_COLOR[l.bucket] }} />
              <span>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Block detail sheet */}
      {expandedBlock && (
        <>
          <div onClick={() => setExpandedBlock(null)} style={sheetBackdrop} />
          <div style={sheetWrap}>
            <div style={sheetHandle} />
            <div style={sheetHead}>
              <div style={{ ...sheetIcon, background: BLOCK[expandedBlock.type].border }}>
                {(() => {
                  const Icon = ICON_BY_TYPE[expandedBlock.type];
                  return <Icon size={16} style={{ color: "white" }} />;
                })()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={sheetEyebrow}>{BLOCK[expandedBlock.type].label.toUpperCase()} · {String(expandedBlock.hour).padStart(2,"0")}:{String(expandedBlock.minute || 0).padStart(2,"0")}</div>
                <div style={sheetTitle}>{expandedBlock.title}</div>
              </div>
              <button onClick={() => setExpandedBlock(null)} style={sheetClose}><X size={14} /></button>
            </div>
            <p style={sheetNote}>{expandedBlock.note}</p>
            <div style={sheetMetaRow}>
              <span style={sheetMetaPill}><Clock size={11} /> {expandedBlock.dur} min</span>
              {expandedBlock.anchor && <span style={{ ...sheetMetaPill, background: `${TOKENS.gold}22`, color: TOKENS.goldDeep }}><Sparkles size={11} /> Anchor task</span>}
              <span style={sheetMetaPill}><Zap size={11} /> Capacity at start: {ENERGY_CURVE[expandedBlock.hour]}%</span>
            </div>
            <div style={sheetActions}>
              <button onClick={() => completeBlock(expandedBlock.id)} style={{ ...sheetBtn, background: expandedBlock.completed ? "transparent" : TOKENS.espresso, color: expandedBlock.completed ? TOKENS.espresso : TOKENS.cream, borderColor: TOKENS.espresso }}>
                {expandedBlock.completed ? "Mark incomplete" : "Mark complete"}
              </button>
              <button onClick={() => removeBlock(expandedBlock.id)} style={{ ...sheetBtn, background: "transparent", color: TOKENS.rose, borderColor: TOKENS.rose }}>
                Remove
              </button>
            </div>
            <p style={sheetWire}>Wired data: <b>{BLOCK[expandedBlock.type].label}</b> blocks come from your existing PlannerItems / MedicationReminders / HabitLogs — this demo doesn&apos;t duplicate the entities.</p>
          </div>
        </>
      )}

      {/* Care modal — Doctor-Ready Diary + GP export */}
      {careOpen && (
        <>
          <div onClick={() => setCareOpen(false)} style={careBackdrop} aria-hidden="true" />
          <div style={careSheet} role="dialog" aria-label="Care">
            <div style={careHandle} />
            <div style={careHead}>
              <div style={{ ...stageBannerIcon, background: "rgba(232,180,184,0.30)", color: TOKENS.rose }}>
                <Stethoscope size={14} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={careEyebrow}>CARE</div>
                <div style={careTitle}>Doctor-Ready Diary &amp; GP export</div>
              </div>
              <button onClick={() => setCareOpen(false)} style={careClose} aria-label="Close care"><X size={14} /></button>
            </div>
            <div style={careRow}><FileText size={14} style={{ color: TOKENS.muted }} /><span><b>NICE NG23</b> appointment diary — 8 weeks of entries.</span></div>
            <div style={careRow}><Star size={14} style={{ color: TOKENS.gold }} /><span><b>Astra Cole sidecar</b> — &ldquo;Backed by Astra Cole, MA, FAS&rdquo;.</span></div>
            <div style={careActions}>
              <button style={careCta}><FileText size={13} /> Build PDF</button>
              <button style={careCtaAlt}><Stethoscope size={13} /> Open diary</button>
            </div>
            <p style={careWire}>Routes through the existing DoctorReadyDiaryCard / GpExportButton / MergedExportSheet.</p>
          </div>
        </>
      )}
    </div>
  );
}

// ── CSS animations (single style tag) ───────────────────────────────────────
const cssAnimations = `
@keyframes fwBreath { 0%, 100% { opacity: 1 } 50% { opacity: 0.92 } }
@keyframes fwBlockDrop { 0% { transform: scale(0.92) translateY(-6px); opacity: 0 } 100% { transform: scale(1) translateY(0); opacity: 1 } }
@keyframes fwPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(212,175,55,0.5) } 50% { box-shadow: 0 0 0 10px rgba(212,175,55,0) } }
@keyframes fwShimmer { 0%, 100% { box-shadow: 0 1px 2px rgba(58,44,26,0.06) } 50% { box-shadow: 0 2px 12px rgba(212,175,55,0.18) } }
@keyframes fwPickedPulse { 0%, 100% { transform: scale(1) } 50% { transform: scale(1.025) } }
@keyframes fwNowPulse { 0%, 100% { transform: scale(1); opacity: 1 } 50% { transform: scale(1.4); opacity: 0.6 } }
.fw-biorhythm-scroll::-webkit-scrollbar { display: none }
.fw-biorhythm-scroll { -ms-overflow-style: none; scrollbar-width: none }
`;

// ── Styles ──────────────────────────────────────────────────────────────────
const shell = {
  background: TOKENS.cream,
  borderRadius: 24,
  padding: "20px 18px 28px",
  border: `1px solid rgba(58,44,26,0.10)`,
  boxShadow: "0 1px 0 rgba(58,44,26,0.04), 0 24px 64px rgba(58,44,26,0.08)",
  maxWidth: 760,
  margin: "0 auto",
  fontFamily: "'Inter', system-ui, sans-serif",
  position: "relative",
};

const phasePill = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "7px 14px",
  borderRadius: 9999,
  background: TOKENS.espresso,
  color: TOKENS.cream,
  fontSize: 11,
  letterSpacing: "0.14em",
  fontWeight: 700,
  marginBottom: 14,
};
const phaseDot = {
  width: 8, height: 8, borderRadius: 9999,
  background: TOKENS.blush,
  boxShadow: `0 0 0 3px rgba(232,180,184,0.30)`,
  animation: "fwBreath 4s ease-in-out infinite",
};
const phaseTextEyebrow = { textTransform: "uppercase", letterSpacing: "0.18em" };
const phaseDivider = { opacity: 0.5 };
const phaseTextBody = { textTransform: "none", letterSpacing: "0.04em", fontWeight: 600 };

const composeWrap = { marginBottom: 14 };
const composeClosed = {
  width: "100%",
  display: "flex", alignItems: "center", gap: 10,
  padding: "12px 14px", borderRadius: 16,
  background: TOKENS.paper, border: `1px solid rgba(58,44,26,0.10)`,
  cursor: "pointer", textAlign: "left",
};
const composePlaceholder = { fontSize: 14, color: TOKENS.espresso, fontWeight: 500 };
const composeHint = { marginLeft: "auto", fontSize: 11, color: TOKENS.muted, fontStyle: "italic" };

const composeOpenStyle = {
  padding: 12, borderRadius: 16,
  background: TOKENS.paper, border: `1px solid ${TOKENS.gold}66`,
  boxShadow: `0 4px 16px rgba(212,175,55,0.18)`,
};
const composeInput = {
  width: "100%", border: "none", outline: "none",
  background: "transparent", color: TOKENS.espresso,
  fontSize: 16, padding: "6px 4px", fontFamily: "inherit",
  borderBottom: `1px solid rgba(58,44,26,0.10)`, marginBottom: 10,
};
const chipRow = { display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" };
const chip = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "5px 10px", borderRadius: 9999,
  fontSize: 11, fontWeight: 600,
  border: "1px solid", cursor: "pointer",
};
const composeCancel = {
  padding: "6px 14px", borderRadius: 9999,
  background: "transparent", color: TOKENS.muted,
  border: `1px solid rgba(58,44,26,0.12)`,
  fontSize: 12, fontWeight: 600, cursor: "pointer",
};
const composeSave = {
  padding: "6px 16px", borderRadius: 9999,
  background: TOKENS.espresso, color: TOKENS.cream,
  border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer",
};

const pickedBanner = {
  marginTop: 10,
  display: "flex", alignItems: "center", gap: 8,
  padding: "8px 12px", borderRadius: 14,
  background: `${TOKENS.gold}22`, border: `1px solid ${TOKENS.gold}66`,
  color: TOKENS.espresso, fontSize: 12,
};
const pickedCancel = {
  marginLeft: "auto",
  padding: "4px 10px", borderRadius: 9999,
  background: "transparent", color: TOKENS.goldDeep,
  border: `1px solid ${TOKENS.gold}`,
  fontSize: 11, fontWeight: 700, cursor: "pointer",
};

const stage = { display: "flex", gap: 8, position: "relative" };
const timelineCol = { flex: 1, minWidth: 0 };
const timelineWrap = {
  position: "relative",
  borderRadius: 18,
  background: TOKENS.paper,
  border: `1px solid rgba(58,44,26,0.10)`,
  overflow: "hidden",
};

const hourRow = {
  position: "absolute",
  left: 0, right: 0, height: HOUR_PX,
  padding: "6px 16px 6px 78px",
  display: "flex", alignItems: "flex-start",
  borderBottom: "1px dashed rgba(58,44,26,0.06)",
};
const timeLabel = {
  position: "absolute",
  left: 12, top: 8,
  fontSize: 10, fontWeight: 700,
  letterSpacing: "0.12em", textTransform: "uppercase",
  color: TOKENS.muted, width: 44,
};
const energyBarTrack = {
  position: "absolute",
  left: 62, top: 4, bottom: 4,
  width: 6, borderRadius: 9999,
  background: "rgba(58,44,26,0.06)",
  display: "flex", flexDirection: "column-reverse",
  overflow: "hidden",
};
const energyBarFill = {
  width: "100%", borderRadius: 9999,
  transition: "height 0.6s ease",
};
const hourDivider = { display: "none" };
const bestRing = {
  position: "absolute",
  left: 56, right: 12, top: 4, bottom: 4,
  borderRadius: 14,
  border: `2px solid ${TOKENS.gold}`,
  animation: "fwPulse 1.8s ease-in-out infinite",
  pointerEvents: "none",
};
const nowDot = {
  position: "absolute",
  left: 62 + 3 - 4, // centre on the energy bar
  top: "50%", width: 8, height: 8, borderRadius: 9999,
  background: TOKENS.rose, transform: "translate(-50%, -50%)",
  boxShadow: `0 0 0 3px rgba(212,94,82,0.20)`,
  animation: "fwNowPulse 2s ease-in-out infinite",
  pointerEvents: "none",
};

const nowLine = {
  position: "absolute",
  left: 56, right: 12,
  height: 1,
  display: "flex", alignItems: "center", gap: 6,
  pointerEvents: "none",
};
const nowLineDot = {
  width: 10, height: 10, borderRadius: 9999,
  background: TOKENS.rose,
  boxShadow: `0 0 0 4px rgba(212,94,82,0.25)`,
  animation: "fwNowPulse 2s ease-in-out infinite",
  flexShrink: 0,
  transform: "translateX(-3px)",
};
const nowLineStroke = {
  flex: 1, height: 1,
  background: `linear-gradient(90deg, ${TOKENS.rose} 0%, rgba(212,94,82,0) 100%)`,
};
const nowLineLabel = {
  fontSize: 9, fontWeight: 700, letterSpacing: "0.16em",
  color: TOKENS.rose, padding: "2px 8px",
  borderRadius: 9999, background: TOKENS.cream,
  border: `1px solid ${TOKENS.rose}`,
};

const blockBase = {
  position: "absolute",
  left: 88, right: 16,
  borderRadius: 14,
  padding: "8px 12px",
  display: "flex", alignItems: "center", gap: 10,
  border: "1.5px solid",
  cursor: "pointer",
  textAlign: "left",
  transition: "transform 0.15s ease, box-shadow 0.15s ease",
  boxShadow: "0 1px 2px rgba(58,44,26,0.06)",
};
const blockIcon = {
  width: 26, height: 26, borderRadius: 9,
  display: "flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const blockTitle = {
  fontSize: 13, fontWeight: 700, lineHeight: 1.2,
  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
};
const blockMeta = {
  fontSize: 10, marginTop: 2, opacity: 0.75,
  letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600,
  display: "flex", alignItems: "center", gap: 6,
};
const anchorTag = {
  marginLeft: 4, padding: "1px 6px", borderRadius: 9999,
  background: `${TOKENS.gold}33`, color: TOKENS.goldDeep,
  fontSize: 9, fontWeight: 700, letterSpacing: "0.14em",
};

// ── Right dock ──────────────────────────────────────────────────────────────
const dockShell = {
  position: "absolute",
  top: 0, right: -10,
  height: "100%",
  display: "flex",
  transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
  zIndex: 5,
};
const dockTab = {
  width: 36, height: 56,
  marginTop: 16,
  borderRadius: "12px 0 0 12px",
  background: TOKENS.espresso, color: TOKENS.cream,
  border: "none", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
};
const dockBody = {
  width: 200,
  background: TOKENS.paper,
  border: `1px solid rgba(58,44,26,0.10)`,
  borderRight: "none",
  borderRadius: "16px 0 0 16px",
  padding: "14px 14px 16px",
};
const dockEyebrow = {
  fontSize: 10, fontWeight: 700, letterSpacing: "0.16em",
  color: TOKENS.muted, marginBottom: 10,
};
const dockGrid = {
  display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
};
const dockTile = {
  border: "1px solid",
  borderRadius: 12, padding: "10px 8px",
  background: TOKENS.cream,
  display: "flex", flexDirection: "column", gap: 4,
  cursor: "pointer", textAlign: "left",
};
const dockTileIcon = {
  width: 22, height: 22, borderRadius: 7,
  display: "flex", alignItems: "center", justifyContent: "center",
};
const dockTileValue = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 18, fontWeight: 600, color: TOKENS.espresso,
  lineHeight: 1,
};
const dockTileUnit = { fontSize: 10, color: TOKENS.muted, marginLeft: 2 };
const dockTileLabel = {
  fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
  textTransform: "uppercase", color: TOKENS.muted,
};
const dockNote = {
  marginTop: 10, marginBottom: 0,
  fontSize: 10, color: TOKENS.muted, lineHeight: 1.4, fontStyle: "italic",
};

// ── Tray ────────────────────────────────────────────────────────────────────
const trayWrap = {
  marginTop: 16,
  padding: "12px 14px 14px",
  borderRadius: 18,
  background: TOKENS.paper,
  border: `1px solid rgba(58,44,26,0.10)`,
};
const trayHeader = { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 };
const trayEyebrow = {
  fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: TOKENS.muted,
};
const trayHint = { marginLeft: "auto", fontSize: 11, color: TOKENS.muted, fontStyle: "italic" };
const trayScroll = {
  display: "flex", gap: 10, overflowX: "auto", paddingBottom: 2,
  scrollbarWidth: "none",
};
const trayEmpty = {
  flex: 1, padding: "16px 12px",
  fontSize: 12, color: TOKENS.muted, fontStyle: "italic",
  textAlign: "center",
};
const trayCard = {
  flexShrink: 0,
  minWidth: 200, maxWidth: 240,
  padding: "10px 12px", borderRadius: 14,
  border: "1.5px solid",
  display: "flex", alignItems: "center", gap: 10,
  cursor: "pointer", textAlign: "left",
  transition: "transform 0.15s ease",
};
const trayCardIcon = {
  width: 26, height: 26, borderRadius: 9,
  display: "flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};

// ── Week strip ──────────────────────────────────────────────────────────────
const weekStrip = {
  marginTop: 14,
  padding: "14px 16px",
  borderRadius: 18,
  background: TOKENS.espresso,
  color: TOKENS.cream,
};
const weekEyebrow = {
  fontSize: 10, fontWeight: 700, letterSpacing: "0.16em",
  color: "rgba(244,237,219,0.6)", marginBottom: 10,
};
const weekRow = { display: "flex", gap: 8, alignItems: "flex-end" };
const weekCol = {
  flex: 1, display: "flex", flexDirection: "column",
  alignItems: "center", gap: 6, position: "relative",
};
const weekBarTrack = {
  width: "100%", height: 56, borderRadius: 8,
  background: "rgba(244,237,219,0.06)",
  display: "flex", flexDirection: "column-reverse",
  overflow: "hidden",
};
const weekBarFill = { width: "100%", borderRadius: 8, transition: "height 0.5s ease" };
const weekDay = { fontSize: 11, letterSpacing: "0.04em" };
const weekTodayDot = {
  position: "absolute", bottom: -10, left: "50%",
  transform: "translateX(-50%)",
  width: 4, height: 4, borderRadius: 9999, background: TOKENS.gold,
};
const legendRow = {
  display: "flex", gap: 14, marginTop: 14,
  justifyContent: "center", flexWrap: "wrap",
};
const legendItem = {
  display: "inline-flex", alignItems: "center", gap: 6,
  fontSize: 10, color: "rgba(244,237,219,0.7)",
  letterSpacing: "0.04em",
};
const legendDot = {
  width: 10, height: 10, borderRadius: 9999, display: "inline-block",
};

// ── Detail sheet ────────────────────────────────────────────────────────────
const sheetBackdrop = {
  position: "fixed", inset: 0, zIndex: 80,
  background: "rgba(58,44,26,0.42)", backdropFilter: "blur(6px)",
};
const sheetWrap = {
  position: "fixed", left: "50%", bottom: 24,
  transform: "translateX(-50%)",
  width: "min(540px, calc(100vw - 32px))",
  background: TOKENS.cream, borderRadius: 24,
  padding: "18px 20px 22px", zIndex: 81,
  boxShadow: "0 24px 64px rgba(58,44,26,0.30)",
  fontFamily: "'Inter', system-ui, sans-serif",
};
const sheetHandle = {
  width: 38, height: 4, borderRadius: 9999,
  background: "rgba(58,44,26,0.15)",
  margin: "0 auto 12px",
};
const sheetHead = { display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 };
const sheetIcon = {
  width: 36, height: 36, borderRadius: 12,
  display: "flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const sheetEyebrow = {
  fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: TOKENS.muted,
};
const sheetTitle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 22, fontWeight: 500, color: TOKENS.espresso,
  letterSpacing: "-0.01em", lineHeight: 1.2, marginTop: 4,
};
const sheetClose = {
  width: 32, height: 32, borderRadius: 9999,
  background: TOKENS.paper, border: `1px solid rgba(58,44,26,0.10)`,
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", color: TOKENS.muted, flexShrink: 0,
};
const sheetNote = {
  fontSize: 13, lineHeight: 1.6, color: TOKENS.espresso,
  margin: "8px 0 12px",
};
const sheetMetaRow = { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 };
const sheetMetaPill = {
  display: "inline-flex", alignItems: "center", gap: 4,
  fontSize: 10, fontWeight: 700, letterSpacing: "0.10em",
  textTransform: "uppercase",
  padding: "4px 10px", borderRadius: 9999,
  background: TOKENS.paper, color: TOKENS.muted,
  border: `1px solid rgba(58,44,26,0.08)`,
};
const sheetActions = { display: "flex", gap: 8, marginBottom: 12 };
const sheetBtn = {
  flex: 1, padding: "10px 14px",
  borderRadius: 9999, border: "1.5px solid",
  fontSize: 12, fontWeight: 700, letterSpacing: "0.08em",
  textTransform: "uppercase",
  cursor: "pointer",
};
const sheetWire = {
  fontSize: 10, color: TOKENS.muted, fontStyle: "italic",
  lineHeight: 1.5, margin: 0,
  padding: "8px 10px", borderRadius: 8,
  background: TOKENS.paper, border: `1px dashed rgba(58,44,26,0.10)`,
};


// ── New styles added 2026-05-17 (Planner integration sweep) ─────────────────
const phasePillRow = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  gap: 10, marginBottom: 10,
};
const exportBtn = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "5px 11px", borderRadius: 9999,
  background: TOKENS.paper, color: TOKENS.espresso,
  border: "1px solid rgba(58,44,26,0.15)",
  cursor: "pointer",
  fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
};

const stageBanner = {
  width: "100%",
  display: "flex", alignItems: "center", gap: 10,
  padding: "10px 12px", marginBottom: 12,
  background: TOKENS.paper,
  border: "1px solid rgba(232,180,184,0.42)",
  borderLeft: `4px solid ${TOKENS.blush}`,
  borderRadius: 14,
  cursor: "pointer", textAlign: "left",
};
const stageBannerIcon = {
  width: 28, height: 28, borderRadius: 9,
  display: "flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const stageBannerTitle = { fontSize: 12, fontWeight: 700, color: TOKENS.espresso, letterSpacing: "0.04em" };
const stageBannerSub = { fontSize: 11, color: TOKENS.muted, marginTop: 3, lineHeight: 1.4 };

// Dock tabs
const dockTabsRow = { display: "flex", gap: 6, marginBottom: 10 };
const dockTabPill = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "5px 10px", borderRadius: 9999,
  fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
  border: "1px solid", cursor: "pointer",
};

// Journey tab
const journeyBlock = {
  padding: "8px 0", marginBottom: 8,
  borderBottom: "1px solid rgba(58,44,26,0.06)",
};
const journeyEyebrow = { fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", color: TOKENS.muted, marginBottom: 6 };
const journeyBarTrack = { height: 8, borderRadius: 9999, background: "rgba(58,44,26,0.08)", overflow: "hidden" };
const journeyBarFill = { height: "100%", borderRadius: 9999, transition: "width 0.5s ease" };
const journeyMeta = { fontSize: 11, color: TOKENS.espresso, marginTop: 6, lineHeight: 1.4 };
const dotsRow = { display: "grid", gridTemplateColumns: "repeat(14, 1fr)", gap: 3 };
const dotMini = { width: 6, height: 6, borderRadius: 9999, transition: "transform 0.2s ease" };
const journeyDoctorBtn = {
  width: "100%",
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
  padding: "8px 11px", borderRadius: 9999,
  background: TOKENS.cream, color: TOKENS.espresso,
  border: "1px solid rgba(58,44,26,0.15)", cursor: "pointer",
  fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
  marginBottom: 8,
};
const astraSidecar = {
  display: "flex", gap: 8, alignItems: "flex-start",
  padding: "8px 10px", borderRadius: 10,
  background: "rgba(212,175,55,0.14)",
  border: `1px solid ${TOKENS.gold}55`,
  marginBottom: 8,
};
const astraTitle = { fontSize: 10, fontWeight: 700, letterSpacing: "0.10em", color: TOKENS.goldDeep, textTransform: "uppercase" };
const astraSub = { fontSize: 11, color: TOKENS.espresso, fontStyle: "italic", lineHeight: 1.4, marginTop: 2 };
const journeyGpBtn = {
  width: "100%",
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
  padding: "8px 11px", borderRadius: 9999,
  background: TOKENS.espresso, color: TOKENS.cream,
  border: "none", cursor: "pointer",
  fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
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
  background: TOKENS.cream, color: TOKENS.espresso,
  borderRadius: 24, padding: "18px 20px 22px", zIndex: 81,
  boxShadow: "0 24px 64px rgba(58,44,26,0.30)",
};
const careHandle = { width: 38, height: 4, borderRadius: 9999, background: "rgba(58,44,26,0.15)", margin: "0 auto 12px" };
const careHead = { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 };
const careEyebrow = { fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: TOKENS.muted };
const careTitle = { fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, fontWeight: 500, color: TOKENS.espresso, marginTop: 2 };
const careClose = {
  width: 30, height: 30, borderRadius: 9999,
  background: TOKENS.paper, border: "1px solid rgba(58,44,26,0.10)",
  cursor: "pointer", color: TOKENS.muted,
  display: "flex", alignItems: "center", justifyContent: "center",
};
const careRow = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "10px 12px", borderRadius: 12,
  background: TOKENS.paper, border: "1px solid rgba(58,44,26,0.08)",
  fontSize: 12, color: TOKENS.espresso, lineHeight: 1.5, marginBottom: 6,
};
const careActions = { display: "flex", gap: 8, marginTop: 10 };
const careCta = {
  flex: 1, padding: "11px 14px", borderRadius: 9999,
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
  background: TOKENS.espresso, color: TOKENS.cream, border: "none", cursor: "pointer",
  fontSize: 13, fontWeight: 700, letterSpacing: "0.04em",
};
const careCtaAlt = {
  flex: 1, padding: "11px 14px", borderRadius: 9999,
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
  background: "transparent", color: TOKENS.espresso, border: "1px solid rgba(58,44,26,0.15)", cursor: "pointer",
  fontSize: 13, fontWeight: 700, letterSpacing: "0.04em",
};
const careWire = {
  fontSize: 10, color: TOKENS.muted, fontStyle: "italic", marginTop: 12,
  padding: "8px 10px", borderRadius: 8,
  background: TOKENS.paper, border: "1px dashed rgba(58,44,26,0.10)",
};

