// ─────────────────────────────────────────────────────────────────────────────
// UnifiedPlannerDemo — single-page Today + Cycle prototype for /Ideas.
//
// DEMO ONLY: this is a preview component. It does NOT touch Planner.jsx,
// Today.jsx, or any production file. Halli reviews it on /Ideas → "Unified"
// tab before we migrate the real page.
//
// Structure (top to bottom):
//   · Header (greeting + Cycle + Biorhythm icons)
//   · Cycle Calendar slide-out (28-day grid, phase-coloured)
//   · Biorhythm Timeline slide-out (6am-11pm, energy bands + task blocks)
//   · Flow hero card (time-of-day aware ambient gradient)
//   · My Lists (chips → inline expansion; new-list modal)
//   · Row 1 — Body today / Smart View / Cycle zone
//   · Row 2 — Morning stack / Consistency
//   · Row 3 — Rituals (Create-your-own FIRST + 3 prebuilt)
//   · Row 4 — Plan a day (Today + Pick a date) / Week strip
//   · Row 5 — Daily intention / Astra reading
//   · Row 6 — Meals + hydration / Eat for your phase
//   · Row 7 — Medications / Supplements
//   · Row 8 — Tonight's intentions / Sleep target
//   · Row 9 — GP Report & Diary (single entry)
//
// Brand rule: NO emoji codepoints — all glyphs are Lucide icons.
// localStorage keys used:
//   femwell_body_strip_expanded
//   femwell_intention_<YYYY-MM-DD>
//   femwell_tonight_<YYYY-MM-DD>
//   femwell_unified_lists
//   femwell_unified_stack
//   femwell_custom_bundles_demo
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useRef, useState, Children } from "react";
import {
  Sun, Moon, Zap, Calendar, Activity, X, Plus, ChevronLeft, ChevronRight,
  ChevronDown, ChevronUp, Sparkles, CalendarCheck, Check, Edit3, Trash2,
  Heart, Droplets, Footprints, CircleDot, Pill, BedDouble, FileText,
  GripVertical, ArrowUpRight, Smile,
} from "lucide-react";

// ── Tokens ─────────────────────────────────────────────────────────────────
const C = {
  cream:    "#F4EDDB",
  paper:    "#FBF6E6",
  paperHi:  "#FFFFFF",
  espresso: "#3A2C1A",
  blush:    "#E8B4B8",
  sage:     "#8FAF8F",
  muted:    "#9B8B7A",
  gold:     "#D4AF37",
  goldDeep: "#A6862B",
  rose:     "#D45E52",
  ink:      "rgba(58,44,26,0.92)",
  faint:    "rgba(58,44,26,0.10)",
};
const PHASE = {
  menstrual:  C.blush,
  follicular: C.sage,
  ovulatory:  C.gold,
  luteal:     C.muted,
};

// ── Mock ──────────────────────────────────────────────────────────────────
const profile = { name: "Halli", phase: "ovulatory", cycleDay: 14, cycleLen: 28 };

const today = new Date();
const todayISO = today.toISOString().split("T")[0];

const initialLists = [
  {
    id: "work",
    name: "Work",
    colour: "#3A2C1A",
    tasks: [
      { id: "t1", text: "Team standup",        done: false, due: todayISO },
      { id: "t2", text: "Draft investor update", done: false, due: todayISO },
      { id: "t3", text: "Review press list",     done: false, due: null },
    ],
  },
  {
    id: "personal",
    name: "Personal",
    colour: "#D4AF37",
    tasks: [
      { id: "p1", text: "Call pharmacy",        done: true, due: todayISO },
      { id: "p2", text: "Pick up dry cleaning", done: false, due: null },
    ],
  },
  {
    id: "health",
    name: "Health",
    colour: "#8FAF8F",
    tasks: [
      { id: "h1", text: "Book GP follow-up",    done: false, due: null },
    ],
  },
];

const initialStack = {
  habits: [
    { id: "h1", text: "Morning movement",    done: true,  streak: 28 },
    { id: "h2", text: "Hydration check",     done: false, streak: 6 },
    { id: "h3", text: "Supplements",         done: false, streak: 12 },
    { id: "h4", text: "Evening wind-down",   done: false, streak: 4 },
    { id: "h5", text: "Gratitude journal",   done: true,  streak: 35 },
  ],
  meals: [
    { id: "m1", text: "Breakfast — Avocado toast + eggs", done: true,  note: "380 cal · P:18g C:32g F:22g" },
    { id: "m2", text: "Lunch — Salmon + greens",          done: false, note: "planned" },
    { id: "m3", text: "Dinner — Not planned",             done: false, note: null },
  ],
  meds: [
    { id: "rx1", text: "Progesterone 200mg", time: "9:00am", done: true  },
    { id: "rx2", text: "Vitamin D 2000IU",   time: "9:00am", done: false },
  ],
};

const ritualBundles = [
  { id: "ovu",  title: "Ovulatory Power Hour", count: 5, time: "Morning",  duration: "20 min", phase: "ovulatory", accent: C.gold,  rituals: ["Sunlight + walk", "Strength · 25m", "Cold water", "High-protein breakfast", "Speak one bold thing"] },
  { id: "rest", title: "Rest & Restore",       count: 4, time: "Evening",  duration: "15 min", phase: "luteal",    accent: C.muted, rituals: ["Yin yoga · 10m", "Magnesium", "Warm bath", "Read 10 pages"] },
  { id: "sync", title: "Cycle Sync Stretch",   count: 3, time: "Any",      duration: "10 min", phase: "any",       accent: C.sage,  rituals: ["Hip openers", "Spinal twist", "Legs up the wall"] },
];

const weekStrip = [
  { d: "M", date: 12, phase: "follicular", energy: "high"   },
  { d: "T", date: 13, phase: "follicular", energy: "high"   },
  { d: "W", date: 14, phase: "ovulatory",  energy: "high",  today: true },
  { d: "T", date: 15, phase: "ovulatory",  energy: "high"   },
  { d: "F", date: 16, phase: "ovulatory",  energy: "medium" },
  { d: "S", date: 17, phase: "luteal",     energy: "medium" },
  { d: "S", date: 18, phase: "luteal",     energy: "low"    },
];
const ENERGY_TONE = { high: C.gold, medium: C.sage, low: C.blush };

const consistencyData = Array.from({ length: 28 }, (_, i) => ({
  day: i + 1,
  hit: i < 14 ? (i + 1) % 4 !== 0 : (i < 21),
}));

const intentionPrompts = {
  ovulatory:  "What does your body need you to honour today?",
  follicular: "What's calling you to start?",
  luteal:     "What can you let go of this week?",
  menstrual:  "How can you slow down today?",
};

const astraReading = {
  title: "Your Ovulatory Reading",
  short: "Your energy peaks now — use it. This is your window for visibility, bold asks, and creative output.",
  full:
    "Day 14. Oestrogen is at its highest, testosterone is rising. Your verbal and persuasive abilities are at their peak. Studies show women in ovulatory phase speak more clearly, take more risks, and are perceived as more confident — your nervous system isn't lying to you. This is the day to ask for the raise, send the bold email, host the dinner. The window narrows in two to three days as you slip into early luteal, so spend the energy you have instead of saving it.",
};

const nourishmentFocus = ["Leafy greens", "Zinc", "Antioxidants"];
const nourishmentTip = "Your liver is working hard — cruciferous veg support oestrogen clearance.";

const supplements = [
  { id: "om3", text: "Omega-3",          done: false, when: "morning" },
  { id: "mg",  text: "Magnesium glycinate", done: false, when: "evening" },
];

const tonightPrompts = ["One win today:", "Energy rating (1–10):", "Intention for tomorrow:"];

const sleepTarget = { time: "10:30pm", lastNight: "7h 20min · Good quality", tip: "Ovulatory phase — you may need slightly less sleep than usual." };

// 28-day mock cycle calendar (with current day = 14)
const cycleCalendarDays = Array.from({ length: 28 }, (_, i) => {
  const d = i + 1;
  let p = "luteal";
  if (d <= 5) p = "menstrual";
  else if (d <= 13) p = "follicular";
  else if (d <= 16) p = "ovulatory";
  return { day: d, phase: p, isToday: d === profile.cycleDay };
});

const biorhythmHours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
function bandFor(h) {
  if (h >= 9 && h <= 11) return C.gold;
  if (h >= 12 && h <= 15) return C.sage;
  if (h >= 16 && h <= 18) return C.blush;
  return C.muted;
}
const bioTaskBlocks = [
  { hour: 9,  label: "Investor update — deep work",    tone: C.gold  },
  { hour: 11, label: "Strength · 25m",                 tone: C.gold  },
  { hour: 13, label: "Team standup",                   tone: C.sage  },
  { hour: 15, label: "Pharmacy call",                  tone: C.sage  },
  { hour: 19, label: "Wind-down · journal",            tone: C.muted },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function UnifiedPlannerDemo() {
  const [cycleOpen, setCycleOpen] = useState(false);
  const [bioOpen, setBioOpen] = useState(false);
  const [newListOpen, setNewListOpen] = useState(false);
  const [ritualBuilderOpen, setRitualBuilderOpen] = useState(false);
  const [futureBlueprintDate, setFutureBlueprintDate] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [astraOpen, setAstraOpen] = useState(false);

  const greeting = useMemo(() => {
    const h = today.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    if (h < 21) return "Good evening";
    return "Resting well";
  }, []);

  const scene = useMemo(() => {
    const h = today.getHours();
    if (h < 11) return "morning";
    if (h < 16) return "afternoon";
    if (h < 21) return "evening";
    return "night";
  }, []);

  return (
    <div style={shell}>
      <Header
        greeting={greeting}
        onCycle={() => setCycleOpen(true)}
        onBio={() => setBioOpen(true)}
      />

      <HeroCard scene={scene} />

      <ListsSection onNewList={() => setNewListOpen(true)} />

      <Row1 onOpenCycle={() => setCycleOpen(true)} />
      <Row2 />
      <Row3 onCreate={() => setRitualBuilderOpen(true)} />
      <Row4
        onPickFuture={(date) => setFutureBlueprintDate(date)}
      />
      <Row5 onAstra={() => setAstraOpen(true)} />
      <Row6 />
      <Row7 />
      <Row8 />
      <Row9 onReport={() => setReportOpen(true)} />

      <DemoFooter />

      {/* Slide-outs and modals */}
      <CycleSlideOut open={cycleOpen} onClose={() => setCycleOpen(false)} />
      <BioSlideOut    open={bioOpen}    onClose={() => setBioOpen(false)} />
      <NewListModal   open={newListOpen} onClose={() => setNewListOpen(false)} />
      <RitualBuilderSheet open={ritualBuilderOpen} onClose={() => setRitualBuilderOpen(false)} />
      <FutureBlueprintSheet date={futureBlueprintDate} onClose={() => setFutureBlueprintDate(null)} />
      <ReportSheet    open={reportOpen} onClose={() => setReportOpen(false)} />
      <AstraSheet     open={astraOpen}  onClose={() => setAstraOpen(false)} />
    </div>
  );
}

// ── Header ─────────────────────────────────────────────────────────────────
function Header({ greeting, onCycle, onBio }) {
  return (
    <div style={headerStyle}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={greetingRow}>
          <h1 style={greetingText}>{greeting}, {profile.name}</h1>
          <Sun size={18} style={{ color: C.gold, flexShrink: 0 }} />
        </div>
        <div style={greetingSub}>
          Monday · Cycle Day {profile.cycleDay} · {profile.phase[0].toUpperCase() + profile.phase.slice(1)}
        </div>
      </div>
      <div style={iconRow}>
        <button onClick={onCycle} style={iconBtn} aria-label="Open cycle calendar">
          <Calendar size={20} style={{ color: C.espresso }} />
        </button>
        <button onClick={onBio} style={iconBtn} aria-label="Open biorhythm timeline">
          <Activity size={20} style={{ color: C.espresso }} />
        </button>
      </div>
    </div>
  );
}

// ── Hero card ──────────────────────────────────────────────────────────────
function HeroCard({ scene }) {
  const scenes = {
    morning:   { label: "Your morning window", gradient: "linear-gradient(135deg, #F4EDDB 0%, #D4AF37 100%)", Icon: Sun,  text: "Ovulatory phase — your peak energy window. Tackle your most important work now." },
    afternoon: { label: "Midday momentum",     gradient: "linear-gradient(135deg, #F4EDDB 0%, #8FAF8F 100%)", Icon: Zap,  text: "Energy holding steady. Good time for collaborative work and calls." },
    evening:   { label: "Wind down",           gradient: "linear-gradient(135deg, #F4EDDB 0%, #E8B4B8 100%)", Icon: Moon, text: "Late luteal approaching. Protect your energy — light tasks only." },
    night:     { label: "Rest and restore",    gradient: "linear-gradient(135deg, #F4EDDB 0%, #9B8B7A 100%)", Icon: Moon, text: "Time to rest. Your body does its repair work now." },
  };
  const s = scenes[scene];
  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ ...heroCardStyle, background: s.gradient }}>
        <div style={heroRow}>
          <span style={{ ...heroIcon, background: "rgba(255,255,255,0.65)" }}>
            <s.Icon size={18} style={{ color: C.espresso }} />
          </span>
          <span style={heroLabel}>{s.label}</span>
        </div>
        <p style={heroText}>{s.text}</p>
      </div>
    </div>
  );
}

// ── My Lists section ───────────────────────────────────────────────────────
function ListsSection({ onNewList }) {
  const [lists, setLists] = useState(() => {
    try {
      const raw = localStorage.getItem("femwell_unified_lists");
      if (raw) return JSON.parse(raw);
    } catch {}
    return initialLists;
  });
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    try { localStorage.setItem("femwell_unified_lists", JSON.stringify(lists)); } catch {}
  }, [lists]);

  function toggleTask(listId, taskId) {
    setLists((ls) => ls.map((l) =>
      l.id === listId
        ? { ...l, tasks: l.tasks.map((t) => t.id === taskId ? { ...t, done: !t.done } : t) }
        : l
    ));
  }

  return (
    <section style={listsShell} aria-label="My lists">
      <div style={listsHead}>
        <span style={kicker}>MY LISTS</span>
        <button onClick={onNewList} style={listsAddBtn}>
          <Plus size={11} /> New list
        </button>
      </div>
      <div style={listsChipRow}>
        {lists.map((l) => {
          const open = expanded === l.id;
          return (
            <button
              key={l.id}
              onClick={() => setExpanded(open ? null : l.id)}
              style={{
                ...listsChip,
                borderColor: open ? l.colour : "rgba(58,44,26,0.18)",
                background: open ? `${l.colour}1A` : C.paperHi,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: 9999, background: l.colour }} />
              {l.name}
              {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          );
        })}
      </div>
      {expanded && (
        <div style={listsAccordion}>
          {lists.find((l) => l.id === expanded).tasks.map((t) => (
            <label key={t.id} style={listsTaskRow}>
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => toggleTask(expanded, t.id)}
                style={listsCheckbox}
              />
              <span style={{
                fontSize: 13, color: C.espresso,
                textDecoration: t.done ? "line-through" : "none",
                opacity: t.done ? 0.5 : 1,
              }}>{t.text}</span>
              {t.due && <span style={listsDueChip}>today</span>}
            </label>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Row 1 ──────────────────────────────────────────────────────────────────
function Row1({ onOpenCycle }) {
  return (
    <SliderRow label="Your body today">
      <BodyTodayCard />
      <SmartViewCard />
      <CycleZoneCard onOpen={onOpenCycle} />
    </SliderRow>
  );
}

function BodyTodayCard() {
  const [expanded, setExpanded] = useState(() => {
    try { return localStorage.getItem("femwell_body_strip_expanded") === "1"; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem("femwell_body_strip_expanded", expanded ? "1" : "0"); } catch {}
  }, [expanded]);

  const pct = 80;
  // Ring math
  const R = 30, CIRC = 2 * Math.PI * R;
  const offset = CIRC * (1 - pct / 100);

  return (
    <article style={cardStyle}>
      <div style={cardHeadRow}>
        <span style={{ ...phaseChip, background: `${C.gold}1F`, color: C.goldDeep, border: `1px solid ${C.gold}55` }}>
          <span style={{ width: 6, height: 6, borderRadius: 9999, background: C.gold, marginRight: 5 }} />
          Ovulatory Day {profile.cycleDay}
        </span>
        <button onClick={() => setExpanded((v) => !v)} style={expandBtn} aria-label={expanded ? "Collapse body" : "Expand body"}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      <div style={ringRow}>
        <svg width={76} height={76} viewBox="0 0 76 76">
          <circle cx={38} cy={38} r={R} fill="none" stroke={C.faint} strokeWidth={6} />
          <circle
            cx={38} cy={38} r={R}
            fill="none" stroke={C.gold} strokeWidth={6} strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            transform="rotate(-90 38 38)"
          />
          <text x={38} y={42} textAnchor="middle" fontFamily="'Fraunces', Georgia, serif" fontSize={22} fontWeight="500" fill={C.espresso}>{pct}</text>
        </svg>
        <div style={{ flex: 1, marginLeft: 12 }}>
          <div style={ringTitle}>Capacity</div>
          <div style={ringSub}>Peak energy window</div>
        </div>
      </div>

      <div style={miniChipRow}>
        <button style={miniChip}><Smile size={12} style={{ color: C.rose }} /> Mood</button>
        <button style={miniChip}><Zap size={12} style={{ color: C.goldDeep }} /> Energy</button>
        <button style={miniChip}><Moon size={12} style={{ color: C.muted }} /> Sleep 7h</button>
      </div>

      {expanded && (
        <div style={bodyGridStyle}>
          {[
            { label: "Mood",         value: "Buoyant",  Icon: Smile,      tone: C.rose },
            { label: "Energy",       value: "High",     Icon: Zap,        tone: C.goldDeep },
            { label: "Sleep",        value: "7h 20m",   Icon: Moon,       tone: C.muted },
            { label: "Symptom",      value: "Clear CM", Icon: Droplets,   tone: "#60B4FA" },
            { label: "Cycle day",    value: `${profile.cycleDay}/${profile.cycleLen}`, Icon: CircleDot, tone: C.gold },
            { label: "Next event",   value: "Luteal · 4d", Icon: Calendar, tone: C.sage },
          ].map((it) => (
            <div key={it.label} style={bodyTile}>
              <span style={{ ...bodyIcon, background: `${it.tone}1F`, color: it.tone }}>
                <it.Icon size={11} />
              </span>
              <div>
                <div style={bodyValue}>{it.value}</div>
                <div style={bodyLabel}>{it.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function SmartViewCard() {
  const bullets = [
    "High-intensity exercise window",
    "Speak up in meetings — confidence peaks now",
    "Prioritise iron-rich foods",
  ];
  return (
    <article style={cardStyle}>
      <div style={cardHeadRow}>
        <span style={kicker}>SMART VIEW</span>
        <span style={astraTag}>Powered by Astra</span>
      </div>
      <h3 style={cardTitle}>What your body needs today</h3>
      <ul style={bulletList}>
        {bullets.map((b) => (
          <li key={b} style={bulletLine}>
            <span style={bulletDot} />
            {b}
          </li>
        ))}
      </ul>
    </article>
  );
}

function CycleZoneCard({ onOpen }) {
  return (
    <article style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
      <div style={cycleBanner}>
        <span style={cycleBannerLabel}>OVULATORY</span>
        <p style={cycleBannerSub}>Day {profile.cycleDay} of {profile.cycleLen} · next phase in 4 days</p>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <span style={kicker}>PREDICTED TODAY</span>
        <div style={chipBowl}>
          <span style={softChip}><span style={{ ...softChipDot, background: C.gold }} /> Energy up</span>
          <span style={softChip}><span style={{ ...softChipDot, background: C.sage }} /> Confidence up</span>
          <span style={softChip}><span style={{ ...softChipDot, background: "#60B4FA" }} /> CM fertile</span>
        </div>
        <button onClick={onOpen} style={openCycleBtn}>
          Open cycle calendar <ChevronRight size={12} />
        </button>
      </div>
    </article>
  );
}

// ── Row 2 ──────────────────────────────────────────────────────────────────
function Row2() {
  return (
    <SliderRow label="Your day">
      <MorningStackCard />
      <ConsistencyCard />
    </SliderRow>
  );
}

function MorningStackCard() {
  const [stack, setStack] = useState(() => {
    try {
      const raw = localStorage.getItem("femwell_unified_stack");
      if (raw) return JSON.parse(raw);
    } catch {}
    return initialStack;
  });
  const [tasks, setTasks] = useState([
    { id: "tk1", text: "Team standup",        done: false, source: "Work" },
    { id: "tk2", text: "Draft investor update", done: false, source: "Work" },
    { id: "tk3", text: "Call pharmacy",       done: true,  source: "Personal" },
  ]);
  const [collapsed, setCollapsed] = useState({});
  const [newTask, setNewTask] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem("femwell_unified_stack", JSON.stringify(stack)); } catch {}
  }, [stack]);

  function toggle(section, id) {
    setStack((s) => ({
      ...s,
      [section]: s[section].map((it) => it.id === id ? { ...it, done: !it.done } : it),
    }));
  }
  function toggleTask(id) {
    setTasks((ts) => ts.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  }
  function addTask() {
    const v = newTask.trim();
    if (!v) return;
    setTasks((ts) => [...ts, { id: `tk_${Date.now()}`, text: v, done: false, source: "Today" }]);
    setNewTask("");
  }
  function toggleSection(name) {
    setCollapsed((p) => ({ ...p, [name]: !p[name] }));
  }

  return (
    <article style={cardStyle}>
      <h3 style={cardTitle}>Morning stack</h3>

      <StackSection name="HABITS" collapsed={collapsed.habits} onToggle={() => toggleSection("habits")}>
        {stack.habits.map((h) => (
          <CheckboxRow key={h.id} checked={h.done} onChange={() => toggle("habits", h.id)} text={h.text}>
            <span style={streakRow} title={`${h.streak}-day streak`}>
              {Array.from({ length: Math.min(4, Math.floor(h.streak / 7)) }).map((_, i) => (
                <span key={i} style={streakDot} />
              ))}
              <span style={streakLabel}>{h.streak}d streak</span>
            </span>
          </CheckboxRow>
        ))}
      </StackSection>

      <StackSection name="TASKS" collapsed={collapsed.tasks} onToggle={() => toggleSection("tasks")}>
        {tasks.map((t) => (
          <CheckboxRow key={t.id} checked={t.done} onChange={() => toggleTask(t.id)} text={t.text}>
            {t.source && <span style={sourceChip}>{t.source}</span>}
          </CheckboxRow>
        ))}
        <div style={addTaskRow}>
          <input
            ref={inputRef}
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="+ Add task"
            style={addTaskInput}
          />
        </div>
      </StackSection>

      <StackSection name="MEALS" collapsed={collapsed.meals} onToggle={() => toggleSection("meals")}>
        {stack.meals.map((m) => (
          <CheckboxRow key={m.id} checked={m.done} onChange={() => toggle("meals", m.id)} text={m.text}>
            {m.note && <span style={sourceChip}>{m.note}</span>}
          </CheckboxRow>
        ))}
      </StackSection>

      <StackSection name="MEDICATIONS" collapsed={collapsed.meds} onToggle={() => toggleSection("meds")}>
        {stack.meds.map((m) => (
          <CheckboxRow key={m.id} checked={m.done} onChange={() => toggle("meds", m.id)} text={m.text}>
            <span style={medTimeChip}>{m.time}</span>
          </CheckboxRow>
        ))}
      </StackSection>
    </article>
  );
}

function StackSection({ name, collapsed, onToggle, children }) {
  return (
    <div style={stackSectionStyle}>
      <button onClick={onToggle} style={stackSectionHeadStyle} aria-expanded={!collapsed}>
        <span style={stackSectionLine} />
        <span style={stackSectionName}>{name}</span>
        <span style={stackSectionLine} />
        {collapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
      </button>
      {!collapsed && <div>{children}</div>}
    </div>
  );
}

function CheckboxRow({ checked, onChange, text, children }) {
  return (
    <label style={checkboxRow}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ accentColor: C.sage }} />
      <span style={{
        flex: 1, fontSize: 13, fontFamily: "'Inter', sans-serif",
        color: C.espresso,
        textDecoration: checked ? "line-through" : "none",
        opacity: checked ? 0.5 : 1,
      }}>{text}</span>
      {children}
    </label>
  );
}

function ConsistencyCard() {
  // 28 segments around a ring
  const W = 140, R = 56;
  const segments = consistencyData.map((d, i) => {
    const startA = (i / 28) * Math.PI * 2 - Math.PI / 2;
    const endA = ((i + 1) / 28) * Math.PI * 2 - Math.PI / 2 - 0.04;
    const x1 = W/2 + R * Math.cos(startA);
    const y1 = W/2 + R * Math.sin(startA);
    const x2 = W/2 + R * Math.cos(endA);
    const y2 = W/2 + R * Math.sin(endA);
    const largeArc = (endA - startA) > Math.PI ? 1 : 0;
    return {
      path: `M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`,
      hit: d.hit,
    };
  });
  const hits = consistencyData.filter((d) => d.hit).length;

  return (
    <article style={cardStyle}>
      <h3 style={cardTitle}>Consistency</h3>
      <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
        <svg width={W} height={W} viewBox={`0 0 ${W} ${W}`}>
          {segments.map((s, i) => (
            <path
              key={i}
              d={s.path}
              fill="none"
              stroke={s.hit ? C.sage : "rgba(58,44,26,0.10)"}
              strokeWidth={8}
              strokeLinecap="round"
            />
          ))}
          <text x={W/2} y={W/2 - 4} textAnchor="middle" fontFamily="'Fraunces', Georgia, serif" fontSize={26} fontWeight={500} fill={C.espresso}>{hits}</text>
          <text x={W/2} y={W/2 + 16} textAnchor="middle" fontFamily="'Inter', sans-serif" fontSize={10} fill={C.muted} letterSpacing={1.2}>/ 28 DAYS</text>
        </svg>
      </div>
      <div style={consistencyLabel}>{hits} of 28 days this cycle</div>
      <div style={streakLeadersRow}>
        <span style={leaderChip}>Morning movement <b>28d</b></span>
        <span style={leaderChip}>Gratitude <b>35d</b></span>
      </div>
    </article>
  );
}

// ── Row 3 — Rituals (Create-your-own FIRST) ──────────────────────────────
function Row3({ onCreate }) {
  return (
    <SliderRow label="Rituals">
      <CreateRitualCard onCreate={onCreate} />
      {ritualBundles.map((b) => (
        <RitualBundleCard key={b.id} bundle={b} />
      ))}
    </SliderRow>
  );
}

function CreateRitualCard({ onCreate }) {
  return (
    <button onClick={onCreate} style={createRitualCard} aria-label="Build your own ritual bundle">
      <span style={createRitualIcon}>
        <Sparkles size={24} style={{ color: C.gold }} />
      </span>
      <span style={createRitualTitle}>Build a ritual</span>
      <span style={createRitualSub}>Your own bundle, your phase, your time</span>
    </button>
  );
}

function RitualBundleCard({ bundle }) {
  const [added, setAdded] = useState(false);
  const [toast, setToast] = useState(false);
  function handleAdd() {
    setAdded(true);
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  }
  return (
    <article style={{ ...cardStyle, borderTop: `3px solid ${bundle.accent}` }}>
      <div style={cardHeadRow}>
        <h3 style={{ ...cardTitle, margin: 0 }}>{bundle.title}</h3>
        <span style={{ ...countChip, color: bundle.accent, border: `1px solid ${bundle.accent}55`, background: `${bundle.accent}1F` }}>
          {bundle.count} items
        </span>
      </div>
      <div style={metaRow}>
        <span style={timeChip}><Sun size={10} /> {bundle.time}</span>
        <span style={timeChip}><Activity size={10} /> {bundle.duration}</span>
      </div>
      <ul style={ritualList}>
        {bundle.rituals.slice(0, 3).map((r) => (
          <li key={r} style={ritualLine}><Sparkles size={9} style={{ color: bundle.accent, flexShrink: 0 }} /> {r}</li>
        ))}
        {bundle.rituals.length > 3 && (
          <li style={{ ...ritualLine, color: C.muted, fontStyle: "italic" }}>+{bundle.rituals.length - 3} more</li>
        )}
      </ul>
      <button onClick={handleAdd} disabled={added} style={{
        ...addToStackBtn,
        background: added ? "transparent" : C.espresso,
        color: added ? C.espresso : C.cream,
        borderColor: added ? C.espresso : "transparent",
      }}>
        {added ? (<><Check size={12} /> Added</>) : "Add to stack"}
      </button>
      {toast && (
        <div style={miniToast}>
          <Check size={11} style={{ color: C.sage }} /> {bundle.title} added · {bundle.count} rituals
        </div>
      )}
    </article>
  );
}

// ── Row 4 — Plan a day + Week strip ──────────────────────────────────────
function Row4({ onPickFuture }) {
  return (
    <SliderRow label="Planning">
      <PlanADayCard onPickFuture={onPickFuture} />
      <WeekStripCard />
    </SliderRow>
  );
}

function PlanADayCard({ onPickFuture }) {
  const [mode, setMode] = useState("none"); // "none" | "today"
  const dateRef = useRef(null);
  const [todayPlan, setTodayPlan] = useState([
    "Deep work · investor update",
    "Lunch with Sam",
    "Strength · 25m",
    "Wind-down by 9pm",
  ]);
  const [editingPlan, setEditingPlan] = useState(false);

  function openDatePicker() {
    const el = dateRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") {
      el.showPicker();
    } else {
      el.focus();
      el.click();
    }
  }

  function handleDateChange(e) {
    const v = e.target.value;
    if (v) onPickFuture(v);
    e.target.value = "";
  }

  return (
    <article style={cardStyle}>
      <h3 style={cardTitle}>Plan a day</h3>

      {mode === "none" && (
        <div style={planBtnRow}>
          <button onClick={() => setMode("today")} style={planBtn}>
            <CalendarCheck size={20} style={{ color: C.espresso }} />
            <span style={planBtnLabel}>Today</span>
          </button>
          <button onClick={openDatePicker} style={planBtn}>
            <Calendar size={20} style={{ color: C.espresso }} />
            <span style={planBtnLabel}>Pick a date</span>
          </button>
          <input
            ref={dateRef}
            type="date"
            min={todayISO}
            onChange={handleDateChange}
            style={hiddenDateInput}
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
      )}

      {mode === "today" && (
        <div style={todayPlanShell}>
          <div style={todayPlanHead}>
            <span style={kicker}>TODAY'S PLAN</span>
            <button onClick={() => setEditingPlan((v) => !v)} style={editPlanBtn} aria-label="Edit plan">
              <Edit3 size={12} /> {editingPlan ? "Done" : "Edit"}
            </button>
          </div>
          <ul style={todayPlanList}>
            {todayPlan.map((p, i) => (
              <li key={i} style={todayPlanLine}>
                <span style={todayPlanDot} />
                {editingPlan ? (
                  <input
                    type="text"
                    value={p}
                    onChange={(e) => setTodayPlan((arr) => arr.map((x, j) => j === i ? e.target.value : x))}
                    style={editPlanInput}
                  />
                ) : (
                  <span style={todayPlanText}>{p}</span>
                )}
                {editingPlan && (
                  <button onClick={() => setTodayPlan((arr) => arr.filter((_, j) => j !== i))} style={removeLineBtn}><X size={11} /></button>
                )}
              </li>
            ))}
          </ul>
          {editingPlan && (
            <button onClick={() => setTodayPlan((arr) => [...arr, "New plan item"])} style={addPlanLineBtn}>
              <Plus size={11} /> Add item
            </button>
          )}
          <button onClick={() => setMode("none")} style={planBackBtn}>Back</button>
        </div>
      )}
    </article>
  );
}

function WeekStripCard() {
  const [popoverIdx, setPopoverIdx] = useState(null);
  return (
    <article style={cardStyle}>
      <h3 style={cardTitle}>This week</h3>
      <div style={weekStripGrid}>
        {weekStrip.map((d, i) => {
          const tone = ENERGY_TONE[d.energy];
          return (
            <button
              key={i}
              onClick={() => setPopoverIdx(popoverIdx === i ? null : i)}
              style={{
                ...weekChip,
                background: d.today ? C.espresso : C.paperHi,
                color: d.today ? C.cream : C.espresso,
                borderColor: d.today ? C.espresso : "rgba(58,44,26,0.10)",
              }}
            >
              <span style={weekChipLetter}>{d.d}</span>
              <span style={weekChipDate}>{d.date}</span>
              <span style={{ ...weekChipDot, background: tone }} />
            </button>
          );
        })}
      </div>
      {popoverIdx != null && (
        <div style={weekPopover}>
          {(() => {
            const d = weekStrip[popoverIdx];
            const dayName = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][popoverIdx];
            return (
              <>
                <span style={kicker}>{dayName.toUpperCase()}</span>
                <p style={weekPopText}>
                  {d.phase[0].toUpperCase() + d.phase.slice(1)} · {d.energy[0].toUpperCase() + d.energy.slice(1)} energy
                </p>
                <p style={weekPopSub}>2 tasks planned</p>
              </>
            );
          })()}
        </div>
      )}
      <div style={{ display: "flex", gap: 6, marginTop: 8, fontSize: 10, color: C.muted, flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><span style={{ width: 7, height: 7, borderRadius: 9999, background: C.gold }} /> High</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><span style={{ width: 7, height: 7, borderRadius: 9999, background: C.sage }} /> Medium</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><span style={{ width: 7, height: 7, borderRadius: 9999, background: C.blush }} /> Low</span>
      </div>
    </article>
  );
}

// ── Row 5 — Intentions + Astra ────────────────────────────────────────────
function Row5({ onAstra }) {
  return (
    <SliderRow label="Mind & insight">
      <IntentionCard />
      <AstraCard onOpen={onAstra} />
    </SliderRow>
  );
}

function IntentionCard() {
  const key = `femwell_intention_${todayISO}`;
  const [val, setVal] = useState(() => {
    try { return localStorage.getItem(key) || ""; } catch { return ""; }
  });
  const [saved, setSaved] = useState(false);
  function handleBlur() {
    try { localStorage.setItem(key, val); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }
  return (
    <article style={cardStyle}>
      <h3 style={cardTitle}>Daily intention</h3>
      <p style={intentionPromptStyle}>{intentionPrompts[profile.phase]}</p>
      <textarea
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={handleBlur}
        placeholder="Write here…"
        style={intentionTextarea}
        rows={4}
      />
      {saved && <span style={savedChip}><Check size={11} style={{ color: C.sage }} /> Saved</span>}
    </article>
  );
}

function AstraCard({ onOpen }) {
  return (
    <article style={{ ...cardStyle, position: "relative" }}>
      <div style={astraAvatar}>
        <Sparkles size={14} style={{ color: C.gold }} />
      </div>
      <span style={kicker}>ASTRA · READING</span>
      <h3 style={cardTitle}>{astraReading.title}</h3>
      <p style={astraShort}>{astraReading.short}</p>
      <button onClick={onOpen} style={astraOpenBtn}>
        Full reading <ChevronRight size={12} />
      </button>
    </article>
  );
}

// ── Row 6 — Meals + Nourishment ───────────────────────────────────────────
function Row6() {
  return (
    <SliderRow label="Nourishment">
      <MealPlannerCard />
      <EatForPhaseCard />
    </SliderRow>
  );
}

function MealPlannerCard() {
  const [meals, setMeals] = useState([
    { id: "b", label: "Breakfast", value: "Avocado toast + eggs · 380 cal · P:18g C:32g F:22g", done: true },
    { id: "l", label: "Lunch",     value: "Salmon + greens · planned",                          done: false },
    { id: "d", label: "Dinner",    value: "Not planned",                                        done: false, empty: true },
  ]);
  const [water, setWater] = useState(5);

  function toggle(id) {
    setMeals((ms) => ms.map((m) => m.id === id ? { ...m, done: !m.done } : m));
  }

  return (
    <article style={cardStyle}>
      <h3 style={cardTitle}>Meals today</h3>
      <ul style={{ ...bulletList, gap: 8, marginTop: 6 }}>
        {meals.map((m) => (
          <li key={m.id} style={mealRow}>
            <input
              type="checkbox"
              checked={m.done}
              onChange={() => toggle(m.id)}
              style={{ accentColor: C.sage, marginTop: 3, flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={mealLabel}>{m.label}</div>
              <div style={mealValue}>{m.value}</div>
            </div>
            {m.empty && (
              <button style={addMealBtn}><Plus size={10} /> Add</button>
            )}
          </li>
        ))}
      </ul>
      <div style={hydrationRow}>
        <Droplets size={14} style={{ color: "#60B4FA", flexShrink: 0 }} />
        <span style={hydrationLabel}>Hydration · {water} / 8</span>
        <button onClick={() => setWater((w) => Math.max(0, w - 1))} style={hydroBtn} aria-label="Decrease"><X size={12} /></button>
        <button onClick={() => setWater((w) => Math.min(8, w + 1))} style={hydroBtn} aria-label="Increase"><Plus size={12} /></button>
      </div>
      <a href="#" style={smallLink}>View in Nutrition <ArrowUpRight size={11} /></a>
    </article>
  );
}

function EatForPhaseCard() {
  return (
    <article style={cardStyle}>
      <h3 style={cardTitle}>Eat for your phase</h3>
      <span style={kicker}>OVULATORY · FOCUS ON</span>
      <div style={chipBowl}>
        {nourishmentFocus.map((n) => (
          <span key={n} style={softChip}>
            <span style={{ ...softChipDot, background: C.gold }} />
            {n}
          </span>
        ))}
      </div>
      <p style={tipText}>{nourishmentTip}</p>
    </article>
  );
}

// ── Row 7 — Medications + Supplements ─────────────────────────────────────
function Row7() {
  return (
    <SliderRow label="Care">
      <MedicationsCard />
      <SupplementsCard />
    </SliderRow>
  );
}

function MedicationsCard() {
  const [meds, setMeds] = useState(initialStack.meds);
  const allDone = meds.every((m) => m.done);
  function toggle(id) {
    setMeds((ms) => ms.map((m) => m.id === id ? { ...m, done: !m.done } : m));
  }
  return (
    <article style={cardStyle}>
      <div style={cardHeadRow}>
        <h3 style={{ ...cardTitle, margin: 0 }}>Medications today</h3>
        {allDone && <span style={allDoneChip}><Check size={11} /> All taken</span>}
      </div>
      <ul style={{ ...bulletList, gap: 6, marginTop: 6 }}>
        {meds.map((m) => (
          <CheckboxRow key={m.id} checked={m.done} onChange={() => toggle(m.id)} text={m.text}>
            <span style={medTimeChip}>{m.time}</span>
          </CheckboxRow>
        ))}
      </ul>
      <button style={addMedBtn}><Plus size={11} /> Add medication</button>
    </article>
  );
}

function SupplementsCard() {
  const [supps, setSupps] = useState(supplements);
  function toggle(id) {
    setSupps((ss) => ss.map((s) => s.id === id ? { ...s, done: !s.done } : s));
  }
  return (
    <article style={cardStyle}>
      <h3 style={cardTitle}>Supplements</h3>
      <ul style={{ ...bulletList, gap: 6, marginTop: 6 }}>
        {supps.map((s) => (
          <CheckboxRow key={s.id} checked={s.done} onChange={() => toggle(s.id)} text={s.text}>
            <span style={medTimeChip}>{s.when}</span>
          </CheckboxRow>
        ))}
      </ul>
      <p style={tipText}>Magnesium supports progesterone in luteal phase — you're ovulatory now, still beneficial.</p>
    </article>
  );
}

// ── Row 8 — Tonight ───────────────────────────────────────────────────────
function Row8() {
  return (
    <SliderRow label="Tonight">
      <TonightReflectionCard />
      <SleepTargetCard />
    </SliderRow>
  );
}

function TonightReflectionCard() {
  const key = `femwell_tonight_${todayISO}`;
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { win: "", energy: "", tomorrow: "" };
  });
  function save(field, v) {
    const next = { ...data, [field]: v };
    setData(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
  }
  const isEvening = today.getHours() >= 19;
  return (
    <article style={{ ...cardStyle, opacity: isEvening ? 1 : 0.75 }}>
      <div style={cardHeadRow}>
        <h3 style={{ ...cardTitle, margin: 0 }}>Tonight's reflections</h3>
        {!isEvening && <span style={kicker}>OPENS 7PM</span>}
      </div>
      {tonightPrompts.map((p) => {
        const field = p === tonightPrompts[0] ? "win" : (p === tonightPrompts[1] ? "energy" : "tomorrow");
        return (
          <label key={p} style={reflectionRow}>
            <span style={reflectionLabel}>{p}</span>
            <input
              type="text"
              value={data[field]}
              onChange={(e) => save(field, e.target.value)}
              style={reflectionInput}
              placeholder="…"
            />
          </label>
        );
      })}
    </article>
  );
}

function SleepTargetCard() {
  return (
    <article style={cardStyle}>
      <div style={cardHeadRow}>
        <h3 style={{ ...cardTitle, margin: 0 }}>Sleep target</h3>
        <BedDouble size={14} style={{ color: C.muted }} />
      </div>
      <p style={sleepTargetTime}>Aim for bed by <b>{sleepTarget.time}</b></p>
      <div style={sleepLastNight}>
        <span style={kicker}>LAST NIGHT</span>
        <p style={sleepLastNightText}>{sleepTarget.lastNight}</p>
      </div>
      <p style={tipText}>{sleepTarget.tip}</p>
    </article>
  );
}

// ── Row 9 — GP Report ─────────────────────────────────────────────────────
function Row9({ onReport }) {
  return (
    <SliderRow label="Records">
      <GPReportCard onOpen={onReport} />
    </SliderRow>
  );
}

function GPReportCard({ onOpen }) {
  return (
    <article style={cardStyle}>
      <div style={cardHeadRow}>
        <span style={{ ...iconCircle, background: C.cream }}>
          <FileText size={16} style={{ color: C.espresso }} />
        </span>
        <div style={{ flex: 1 }}>
          <h3 style={{ ...cardTitle, margin: 0 }}>GP Report & Diary</h3>
          <p style={cardSub}>Export your cycle data, symptoms, and diary entries for your doctor.</p>
        </div>
      </div>
      <button onClick={onOpen} style={reportBtn}>
        Build report <ChevronRight size={13} />
      </button>
      <p style={reportLastExport}>Last exported: Never</p>
    </article>
  );
}

// ── Slider Row primitive ──────────────────────────────────────────────────
function SliderRow({ label, children }) {
  const trackRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const count = Children.count(children);

  function jumpTo(i) {
    const clamped = Math.max(0, Math.min(count - 1, i));
    setIdx(clamped);
    const track = trackRef.current;
    if (!track) return;
    const child = track.children[clamped];
    if (child) {
      track.scrollTo({ left: child.offsetLeft - track.offsetLeft, behavior: "smooth" });
    }
  }

  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    const items = Array.from(track.children);
    let best = 0, bestDist = Infinity;
    items.forEach((el, i) => {
      const left = el.offsetLeft - track.offsetLeft;
      const dist = Math.abs(left - track.scrollLeft);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    setIdx(best);
  }

  return (
    <section style={sliderShell} aria-label={label}>
      <div style={sliderHead}>
        <span style={kicker}>{label.toUpperCase()}</span>
        <div style={sliderNav}>
          <button onClick={() => jumpTo(idx - 1)} style={sliderArrow} aria-label="Previous"><ChevronLeft size={14} /></button>
          {Array.from({ length: count }).map((_, i) => (
            <span key={i} style={{
              ...sliderDot,
              background: i === idx ? C.espresso : "rgba(58,44,26,0.20)",
            }} />
          ))}
          <button onClick={() => jumpTo(idx + 1)} style={sliderArrow} aria-label="Next"><ChevronRight size={14} /></button>
        </div>
      </div>
      <div ref={trackRef} onScroll={onScroll} style={sliderTrack}>
        {Children.map(children, (child, i) => (
          <div key={i} style={sliderSlot}>{child}</div>
        ))}
      </div>
    </section>
  );
}

// ── Cycle slide-out ───────────────────────────────────────────────────────
function CycleSlideOut({ open, onClose }) {
  return (
    <>
      <div style={{ ...backdropStyle, opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }} onClick={onClose} />
      <div style={{ ...drawerStyle, transform: open ? "translateX(0)" : "translateX(100%)" }} role="dialog" aria-modal="true" aria-label="Cycle calendar">
        <div style={drawerHead}>
          <div>
            <span style={kicker}>CYCLE · MAY 2026</span>
            <h2 style={drawerTitle}>Your 28 days</h2>
          </div>
          <button onClick={onClose} style={drawerCloseBtn} aria-label="Close"><X size={16} /></button>
        </div>
        <div style={cycleGridStyle}>
          {cycleCalendarDays.map((d) => (
            <div key={d.day} style={{
              ...cycleCell,
              background: PHASE[d.phase],
              borderColor: d.isToday ? C.espresso : "transparent",
              boxShadow: d.isToday ? `0 0 0 2px ${C.espresso}, 0 0 0 4px ${C.cream}` : "none",
            }}>
              <span style={cycleCellNum}>{d.day}</span>
            </div>
          ))}
        </div>
        <div style={cycleLegendRow}>
          {Object.entries(PHASE).map(([k, v]) => (
            <span key={k} style={cycleLegendChip}>
              <span style={{ width: 10, height: 10, borderRadius: 9999, background: v }} />
              {k}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Biorhythm slide-out ───────────────────────────────────────────────────
function BioSlideOut({ open, onClose }) {
  return (
    <>
      <div style={{ ...backdropStyle, opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }} onClick={onClose} />
      <div style={{ ...drawerStyle, transform: open ? "translateX(0)" : "translateX(100%)" }} role="dialog" aria-modal="true" aria-label="Biorhythm timeline">
        <div style={drawerHead}>
          <div>
            <span style={kicker}>BIORHYTHM · TODAY</span>
            <h2 style={drawerTitle}>Capacity through the day</h2>
          </div>
          <button onClick={onClose} style={drawerCloseBtn} aria-label="Close"><X size={16} /></button>
        </div>
        <div style={bioGrid}>
          {biorhythmHours.map((h) => {
            const block = bioTaskBlocks.find((b) => b.hour === h);
            return (
              <div key={h} style={bioHourRow}>
                <span style={bioHourLabel}>{h <= 12 ? h : h - 12}{h < 12 ? "am" : "pm"}</span>
                <span style={{ ...bioRail, background: bandFor(h) }} />
                <div style={bioTaskCol}>
                  {block && (
                    <span style={{ ...bioTaskBlock, background: `${block.tone}1F`, borderColor: `${block.tone}55`, color: C.espresso }}>
                      {block.label}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ── New List modal ────────────────────────────────────────────────────────
function NewListModal({ open, onClose }) {
  const [name, setName] = useState("");
  const [colour, setColour] = useState(C.gold);
  const palette = [C.espresso, C.gold, C.sage, C.blush, C.muted];
  if (!open) return null;
  return (
    <div style={modalBackdrop} onClick={onClose}>
      <div style={modalCard} onClick={(e) => e.stopPropagation()}>
        <div style={modalHead}>
          <span style={kicker}>NEW LIST</span>
          <button onClick={onClose} style={drawerCloseBtn} aria-label="Close"><X size={14} /></button>
        </div>
        <h3 style={modalTitle}>Create a list</h3>
        <label style={{ display: "block", marginBottom: 14 }}>
          <span style={miniLabel}>NAME</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Reading"
            style={modalInput}
            autoFocus
          />
        </label>
        <span style={miniLabel}>COLOUR</span>
        <div style={paletteRow}>
          {palette.map((c) => (
            <button
              key={c}
              onClick={() => setColour(c)}
              style={{
                ...paletteDot,
                background: c,
                outline: c === colour ? `2px solid ${C.espresso}` : "none",
                outlineOffset: 2,
              }}
              aria-label={`Pick colour ${c}`}
            />
          ))}
        </div>
        <div style={modalFoot}>
          <button onClick={onClose} style={modalCancelBtn}>Cancel</button>
          <button onClick={onClose} disabled={!name.trim()} style={{
            ...modalSaveBtn, opacity: name.trim() ? 1 : 0.4, cursor: name.trim() ? "pointer" : "not-allowed",
          }}>Save list</button>
        </div>
      </div>
    </div>
  );
}

// ── Ritual builder ────────────────────────────────────────────────────────
function RitualBuilderSheet({ open, onClose }) {
  const [name, setName] = useState("");
  const [phases, setPhases] = useState(new Set(["ovulatory"]));
  const [time, setTime] = useState("morning");
  const [items, setItems] = useState([""]);

  function togglePhase(p) {
    setPhases((s) => {
      const n = new Set(s);
      if (n.has(p)) n.delete(p); else n.add(p);
      return n;
    });
  }
  function setItem(i, v) {
    setItems((arr) => arr.map((x, j) => j === i ? v : x));
  }
  function addItem() {
    if (items.length >= 6) return;
    setItems((arr) => [...arr, ""]);
  }
  function removeItem(i) {
    if (items.length <= 1) return;
    setItems((arr) => arr.filter((_, j) => j !== i));
  }

  if (!open) return null;
  const phasesList = ["menstrual", "follicular", "ovulatory", "luteal"];
  const times = ["morning", "afternoon", "evening", "any"];
  const valid = name.trim().length > 0 && items.some((i) => i.trim());

  return (
    <div style={modalBackdrop} onClick={onClose}>
      <div style={{ ...modalCard, maxWidth: 600, maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={modalHead}>
          <span style={kicker}>NEW RITUAL</span>
          <button onClick={onClose} style={drawerCloseBtn} aria-label="Close"><X size={14} /></button>
        </div>
        <h3 style={modalTitle}>Build your own bundle</h3>

        <label style={{ display: "block", marginBottom: 14 }}>
          <span style={miniLabel}>NAME</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sunday slow-down" style={modalInput} autoFocus />
        </label>

        <span style={miniLabel}>PHASES (multi-select)</span>
        <div style={chipRowSpacing}>
          {phasesList.map((p) => (
            <button
              key={p}
              onClick={() => togglePhase(p)}
              style={{
                ...modalChip,
                background: phases.has(p) ? `${PHASE[p]}28` : C.paperHi,
                borderColor: phases.has(p) ? PHASE[p] : "rgba(58,44,26,0.18)",
                color: phases.has(p) ? C.espresso : C.muted,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: 9999, background: PHASE[p] }} />
              {p[0].toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        <span style={miniLabel}>TIME OF DAY</span>
        <div style={chipRowSpacing}>
          {times.map((t) => (
            <button
              key={t}
              onClick={() => setTime(t)}
              style={{
                ...modalChip,
                background: time === t ? C.espresso : C.paperHi,
                color: time === t ? C.cream : C.muted,
                borderColor: time === t ? C.espresso : "rgba(58,44,26,0.18)",
              }}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <span style={miniLabel}>ITEMS (up to 6)</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
          {items.map((it, i) => (
            <div key={i} style={ritualItemRow}>
              <GripVertical size={14} style={{ color: "rgba(58,44,26,0.25)", flexShrink: 0 }} />
              <input
                type="text"
                value={it}
                onChange={(e) => setItem(i, e.target.value)}
                placeholder={`Ritual ${i + 1}`}
                style={ritualItemInput}
              />
              {items.length > 1 && (
                <button onClick={() => removeItem(i)} style={removeLineBtn} aria-label="Remove item"><X size={11} /></button>
              )}
            </div>
          ))}
        </div>
        {items.length < 6 && (
          <button onClick={addItem} style={addItemBtn}><Plus size={11} /> Add item</button>
        )}

        <div style={modalFoot}>
          <button onClick={onClose} style={modalCancelBtn}>Cancel</button>
          <button onClick={onClose} disabled={!valid} style={{
            ...modalSaveBtn, opacity: valid ? 1 : 0.4, cursor: valid ? "pointer" : "not-allowed",
          }}>Save bundle</button>
        </div>
      </div>
    </div>
  );
}

// ── Future blueprint (DayBlueprint flavor) ────────────────────────────────
function FutureBlueprintSheet({ date, onClose }) {
  const [step, setStep] = useState(0);
  const [intention, setIntention] = useState("");
  const [capacity, setCapacity] = useState("moderate");

  useEffect(() => { if (date) setStep(0); }, [date]);

  if (!date) return null;
  const phase = predictPhase(date);
  return (
    <div style={modalBackdrop} onClick={onClose}>
      <div style={{ ...modalCard, maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={modalHead}>
          <span style={kicker}>BLUEPRINT · {prettyDate(date)}</span>
          <button onClick={onClose} style={drawerCloseBtn} aria-label="Close"><X size={14} /></button>
        </div>

        <div style={blueprintDotsRow}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} style={{
              ...blueprintDot, background: i === step ? C.espresso : "rgba(58,44,26,0.20)",
              transform: i === step ? "scale(1.4)" : "scale(1)",
            }} />
          ))}
        </div>

        {step === 0 && (
          <>
            <h3 style={modalTitle}>Predicted phase</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, background: `${PHASE[phase]}1F`, border: `1px solid ${PHASE[phase]}55` }}>
              <span style={{ width: 14, height: 14, borderRadius: 9999, background: PHASE[phase] }} />
              <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, fontWeight: 500, color: C.espresso }}>
                {phase[0].toUpperCase() + phase.slice(1)}
              </span>
            </div>
            <p style={{ ...tipText, marginTop: 10 }}>
              Your body will likely be {capacityHint(phase)} that day. Plan softly or boldly accordingly.
            </p>
          </>
        )}

        {step === 1 && (
          <>
            <h3 style={modalTitle}>Set an intention</h3>
            <textarea
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder={intentionPrompts[phase] || "What do you want from this day?"}
              style={intentionTextarea}
              rows={4}
              autoFocus
            />
          </>
        )}

        {step === 2 && (
          <>
            <h3 style={modalTitle}>Protect your energy</h3>
            <div style={chipRowSpacing}>
              {["light", "moderate", "full capacity"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCapacity(c)}
                  style={{
                    ...modalChip,
                    background: capacity === c ? C.espresso : C.paperHi,
                    color: capacity === c ? C.cream : C.muted,
                    borderColor: capacity === c ? C.espresso : "rgba(58,44,26,0.18)",
                  }}
                >
                  {c[0].toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
            <p style={{ ...tipText, marginTop: 10 }}>
              We'll seed your day with this capacity in mind — fewer hard tasks, more soft anchors.
            </p>
          </>
        )}

        {step === 3 && (
          <>
            <h3 style={modalTitle}>Ready</h3>
            <div style={confirmRow}>
              <ConfirmLine label="Date"      value={prettyDate(date)} />
              <ConfirmLine label="Phase"     value={phase[0].toUpperCase() + phase.slice(1)} />
              <ConfirmLine label="Intention" value={intention || "(none)"} />
              <ConfirmLine label="Capacity"  value={capacity[0].toUpperCase() + capacity.slice(1)} />
            </div>
          </>
        )}

        <div style={modalFoot}>
          {step > 0 && <button onClick={() => setStep(step - 1)} style={modalCancelBtn}>Back</button>}
          {step < 3 && <button onClick={() => setStep(step + 1)} style={modalSaveBtn}>Next</button>}
          {step === 3 && <button onClick={onClose} style={modalSaveBtn}>Save blueprint</button>}
        </div>
      </div>
    </div>
  );
}

function ConfirmLine({ label, value }) {
  return (
    <div style={confirmLineStyle}>
      <span style={miniLabel}>{label.toUpperCase()}</span>
      <span style={confirmValueStyle}>{value}</span>
    </div>
  );
}

function predictPhase(dateStr) {
  // simple: today is day 14. Compute offset.
  const date = new Date(dateStr);
  const diff = Math.round((date - today) / 86400000);
  const cd = ((profile.cycleDay - 1 + diff) % profile.cycleLen + profile.cycleLen) % profile.cycleLen + 1;
  if (cd <= 5) return "menstrual";
  if (cd <= 13) return "follicular";
  if (cd <= 16) return "ovulatory";
  return "luteal";
}
function capacityHint(p) {
  return {
    menstrual: "softer and slower",
    follicular: "rising and curious",
    ovulatory: "peak energy",
    luteal: "narrowing and reflective",
  }[p];
}
function prettyDate(s) {
  try {
    const d = new Date(s);
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  } catch { return s; }
}

// ── Report sheet ──────────────────────────────────────────────────────────
function ReportSheet({ open, onClose }) {
  if (!open) return null;
  const sections = [
    { label: "Cycle data",     desc: "Last 3 cycles · day-by-day phase log", on: true },
    { label: "Symptoms",       desc: "All logged symptoms with phase tags", on: true },
    { label: "Diary entries",  desc: "Your journal entries (private by default — review before exporting)", on: false },
    { label: "Medications",    desc: "Prescriptions + adherence",          on: true },
    { label: "Sleep + mood",   desc: "Daily aggregates across the cycle",  on: true },
  ];
  return (
    <div style={modalBackdrop} onClick={onClose}>
      <div style={{ ...modalCard, maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={modalHead}>
          <span style={kicker}>GP REPORT & DIARY</span>
          <button onClick={onClose} style={drawerCloseBtn} aria-label="Close"><X size={14} /></button>
        </div>
        <h3 style={modalTitle}>Build your report</h3>
        <p style={cardSub}>Choose what to include. Diary entries are off by default — flip on only if you want to share.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
          {sections.map((s) => (
            <label key={s.label} style={reportSectionRow}>
              <input type="checkbox" defaultChecked={s.on} style={{ accentColor: C.sage }} />
              <div style={{ flex: 1 }}>
                <div style={reportSectionLabel}>{s.label}</div>
                <div style={reportSectionDesc}>{s.desc}</div>
              </div>
            </label>
          ))}
        </div>
        <div style={modalFoot}>
          <button onClick={onClose} style={modalCancelBtn}>Cancel</button>
          <button onClick={onClose} style={modalSaveBtn}>Export PDF</button>
        </div>
      </div>
    </div>
  );
}

// ── Astra sheet ───────────────────────────────────────────────────────────
function AstraSheet({ open, onClose }) {
  if (!open) return null;
  return (
    <div style={modalBackdrop} onClick={onClose}>
      <div style={modalCard} onClick={(e) => e.stopPropagation()}>
        <div style={modalHead}>
          <span style={kicker}>ASTRA · FULL READING</span>
          <button onClick={onClose} style={drawerCloseBtn} aria-label="Close"><X size={14} /></button>
        </div>
        <div style={astraSheetIcon}>
          <Sparkles size={18} style={{ color: C.gold }} />
        </div>
        <h3 style={modalTitle}>{astraReading.title}</h3>
        <p style={astraSheetText}>{astraReading.full}</p>
      </div>
    </div>
  );
}

// ── Demo footer ───────────────────────────────────────────────────────────
function DemoFooter() {
  return (
    <div style={demoFooter}>
      <span style={kicker}>DEMO · UNIFIED PLANNER</span>
      <p style={demoFooterText}>
        Single-page Today + Cycle. Header → Hero → Lists → 9 rows → footer.
        Cycle and Biorhythm slide-outs from the right. This is a preview — the
        real Planner ships only after you sign off.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const shell = {
  background: C.cream,
  minHeight: "100vh",
  paddingBottom: 40,
  fontFamily: "'Inter', system-ui, sans-serif",
};

// Header
const headerStyle = {
  padding: "20px 16px 12px",
  background: C.cream,
  display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
};
const greetingRow = { display: "flex", alignItems: "center", gap: 8 };
const greetingText = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 22, fontWeight: 700, color: C.espresso, margin: 0, letterSpacing: "-0.01em",
};
const greetingSub = { fontSize: 13, color: C.muted, marginTop: 4 };
const iconRow = { display: "flex", gap: 8, flexShrink: 0 };
const iconBtn = {
  width: 38, height: 38, borderRadius: 9999,
  background: C.paperHi, border: "1px solid rgba(58,44,26,0.10)",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", boxShadow: "0 1px 4px rgba(58,44,26,0.04)",
};

// Hero
const heroCardStyle = {
  borderRadius: 16, padding: 20,
  border: "1px solid rgba(58,44,26,0.08)",
};
const heroRow = { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 };
const heroIcon = {
  width: 30, height: 30, borderRadius: 9999,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
};
const heroLabel = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 18, fontWeight: 500, color: C.espresso, letterSpacing: "-0.005em",
};
const heroText = {
  fontSize: 13, color: C.espresso, margin: 0, lineHeight: 1.55,
};

// Lists section
const listsShell = {
  padding: "0 16px 14px",
};
const listsHead = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  marginBottom: 8,
};
const kicker = {
  fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
  color: C.muted, fontWeight: 700,
};
const listsAddBtn = {
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "5px 10px", borderRadius: 9999,
  background: C.paperHi, border: "1px solid rgba(58,44,26,0.15)",
  color: C.espresso, fontFamily: "'Inter', sans-serif",
  fontSize: 11, fontWeight: 700, cursor: "pointer",
};
const listsChipRow = { display: "flex", gap: 6, flexWrap: "wrap" };
const listsChip = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "5px 11px", borderRadius: 9999,
  border: "1px solid",
  fontFamily: "'Inter', sans-serif",
  fontSize: 12, fontWeight: 600, color: C.espresso,
  cursor: "pointer",
};
const listsAccordion = {
  marginTop: 8, padding: "8px 12px",
  background: C.paperHi, borderRadius: 12,
  border: "1px solid rgba(58,44,26,0.08)",
  display: "flex", flexDirection: "column", gap: 6,
};
const listsTaskRow = {
  display: "flex", alignItems: "center", gap: 8,
};
const listsCheckbox = { accentColor: C.sage };
const listsDueChip = {
  marginLeft: "auto",
  fontSize: 9, fontWeight: 700, letterSpacing: "0.10em",
  padding: "2px 6px", borderRadius: 9999,
  background: `${C.gold}1F`, color: C.goldDeep,
};

// Slider
const sliderShell = { marginBottom: 18 };
const sliderHead = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "0 16px", marginBottom: 8,
};
const sliderNav = { display: "flex", alignItems: "center", gap: 5 };
const sliderArrow = {
  width: 22, height: 22, borderRadius: 9999,
  background: "transparent", border: "none",
  color: C.muted, cursor: "pointer",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  padding: 0,
};
const sliderDot = {
  width: 6, height: 6, borderRadius: 9999,
};
const sliderTrack = {
  display: "flex", overflowX: "auto",
  scrollSnapType: "x mandatory",
  gap: 12, padding: "4px 16px",
  scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
};
const sliderSlot = {
  flex: "0 0 calc(100% - 32px)",
  scrollSnapAlign: "start",
};

// Card primitive
const cardStyle = {
  background: C.paperHi,
  borderRadius: 16, padding: 16,
  boxShadow: "0 2px 8px rgba(58,44,26,0.08)",
  display: "flex", flexDirection: "column", gap: 8,
  height: "100%",
  minHeight: 200,
  boxSizing: "border-box",
};
const cardHeadRow = { display: "flex", alignItems: "center", gap: 8 };
const cardTitle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 17, fontWeight: 500, color: C.espresso,
  margin: "2px 0", lineHeight: 1.25, letterSpacing: "-0.005em",
  flex: 1,
};
const cardSub = {
  fontSize: 12, color: C.muted, margin: "4px 0 0", lineHeight: 1.5,
};

// Body card
const phaseChip = {
  display: "inline-flex", alignItems: "center",
  padding: "3px 9px", borderRadius: 9999,
  fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
};
const expandBtn = {
  marginLeft: "auto", width: 24, height: 24, borderRadius: 9999,
  background: "transparent", border: "none", color: C.muted,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", padding: 0,
};
const ringRow = { display: "flex", alignItems: "center", marginTop: 4 };
const ringTitle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 16, fontWeight: 500, color: C.espresso,
};
const ringSub = {
  fontSize: 11, color: C.muted, marginTop: 2, fontStyle: "italic",
};
const miniChipRow = {
  display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6,
};
const miniChip = {
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "4px 10px", borderRadius: 9999,
  background: C.cream, border: "1px solid rgba(58,44,26,0.10)",
  color: C.espresso, fontSize: 11, fontWeight: 600, cursor: "pointer",
};
const bodyGridStyle = {
  display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5,
  marginTop: 8,
};
const bodyTile = {
  display: "flex", alignItems: "center", gap: 5,
  padding: "6px 8px", borderRadius: 8,
  background: C.cream, border: "1px solid rgba(58,44,26,0.05)",
};
const bodyIcon = {
  width: 20, height: 20, borderRadius: 6,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const bodyValue = { fontSize: 11, fontWeight: 700, color: C.espresso, lineHeight: 1.1 };
const bodyLabel = {
  fontSize: 8.5, letterSpacing: "0.12em", textTransform: "uppercase",
  color: C.muted, fontWeight: 600, marginTop: 1,
};

// Smart view + Astra
const astraTag = {
  marginLeft: "auto",
  fontSize: 9, color: C.muted, fontStyle: "italic",
};
const bulletList = {
  listStyle: "none", padding: 0, margin: "4px 0 0",
  display: "flex", flexDirection: "column", gap: 6,
};
const bulletLine = {
  display: "flex", alignItems: "flex-start", gap: 8,
  fontSize: 13, color: C.espresso, lineHeight: 1.45,
};
const bulletDot = {
  width: 5, height: 5, borderRadius: 9999,
  background: C.gold, marginTop: 7, flexShrink: 0,
};

// Cycle zone banner
const cycleBanner = {
  background: `linear-gradient(135deg, ${C.gold}33 0%, ${C.gold}11 100%)`,
  padding: "16px 14px 12px",
  borderBottom: `1px solid ${C.gold}33`,
};
const cycleBannerLabel = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 24, fontWeight: 500, color: C.espresso,
  letterSpacing: "-0.01em", lineHeight: 1.1,
};
const cycleBannerSub = {
  fontSize: 12, color: C.espresso, opacity: 0.7, margin: "4px 0 0",
};
const chipBowl = { display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 };
const softChip = {
  display: "inline-flex", alignItems: "center",
  padding: "3px 9px", borderRadius: 9999,
  background: C.cream, border: "1px solid rgba(58,44,26,0.10)",
  fontSize: 11, color: C.espresso, fontWeight: 600,
};
const softChipDot = { width: 6, height: 6, borderRadius: 9999, marginRight: 5 };
const openCycleBtn = {
  marginTop: 10,
  display: "inline-flex", alignItems: "center", gap: 4,
  background: "transparent", color: C.espresso,
  border: "1px solid rgba(58,44,26,0.18)", borderRadius: 9999,
  padding: "6px 12px", fontFamily: "'Inter', sans-serif",
  fontSize: 11, fontWeight: 700, cursor: "pointer",
};

// Morning stack
const stackSectionStyle = { marginTop: 6 };
const stackSectionHeadStyle = {
  width: "100%",
  display: "flex", alignItems: "center", gap: 6,
  padding: "6px 0",
  background: "transparent", border: "none",
  cursor: "pointer", color: C.muted,
};
const stackSectionLine = {
  flex: 1, height: 1, background: "rgba(58,44,26,0.10)",
};
const stackSectionName = {
  fontSize: 9, fontWeight: 700, letterSpacing: "0.18em",
  color: C.muted,
};
const checkboxRow = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "5px 0",
};
const streakRow = {
  display: "inline-flex", alignItems: "center", gap: 3, marginLeft: "auto",
};
const streakDot = {
  width: 4, height: 4, borderRadius: 9999, background: C.gold,
};
const streakLabel = {
  fontSize: 9.5, color: C.muted, fontWeight: 600, marginLeft: 4,
};
const sourceChip = {
  marginLeft: "auto",
  fontSize: 9, fontWeight: 700, letterSpacing: "0.10em",
  padding: "2px 6px", borderRadius: 9999,
  background: C.cream, color: C.muted,
};
const medTimeChip = {
  marginLeft: "auto",
  fontSize: 10, color: C.muted, fontWeight: 600,
};
const addTaskRow = { paddingTop: 4 };
const addTaskInput = {
  width: "100%", padding: "7px 10px",
  borderRadius: 9999, background: C.cream,
  border: "1px dashed rgba(58,44,26,0.20)",
  fontFamily: "'Inter', sans-serif", fontSize: 12,
  color: C.espresso, outline: "none",
  boxSizing: "border-box",
};

// Consistency
const consistencyLabel = {
  textAlign: "center",
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 14, color: C.espresso, marginTop: 4,
};
const streakLeadersRow = {
  display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginTop: 8,
};
const leaderChip = {
  display: "inline-flex", alignItems: "center",
  padding: "4px 10px", borderRadius: 9999,
  background: C.cream, border: "1px solid rgba(58,44,26,0.08)",
  fontSize: 10.5, color: C.espresso,
};

// Ritual cards
const createRitualCard = {
  background: C.paper,
  border: `2px dashed ${C.gold}`,
  borderRadius: 16, padding: 16,
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  gap: 6, cursor: "pointer", fontFamily: "inherit",
  height: "100%", minHeight: 200,
  boxSizing: "border-box",
};
const createRitualIcon = {
  width: 48, height: 48, borderRadius: 9999,
  background: `${C.gold}1F`, display: "inline-flex", alignItems: "center", justifyContent: "center",
};
const createRitualTitle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 17, fontWeight: 500, color: C.espresso,
};
const createRitualSub = {
  fontSize: 11, color: C.muted, fontStyle: "italic", textAlign: "center",
};
const countChip = {
  marginLeft: "auto",
  fontSize: 9, fontWeight: 700, letterSpacing: "0.10em",
  padding: "3px 8px", borderRadius: 9999,
};
const metaRow = { display: "flex", gap: 5, flexWrap: "wrap" };
const timeChip = {
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "3px 8px", borderRadius: 9999,
  background: C.cream, fontSize: 10, color: C.espresso, fontWeight: 600,
};
const ritualList = {
  listStyle: "none", padding: 0, margin: "4px 0 0",
  display: "flex", flexDirection: "column", gap: 4,
};
const ritualLine = {
  display: "flex", alignItems: "center", gap: 5,
  fontSize: 12, color: C.espresso,
};
const addToStackBtn = {
  marginTop: "auto",
  padding: "8px 14px", borderRadius: 9999,
  border: "1px solid",
  fontFamily: "'Inter', sans-serif",
  fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
  cursor: "pointer",
};
const miniToast = {
  position: "absolute",
  bottom: -28, left: 0, right: 0,
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
  padding: "5px 10px", borderRadius: 9999,
  background: C.sage, color: C.cream,
  fontSize: 11, fontWeight: 700,
};

// Plan a day
const planBtnRow = {
  display: "flex", gap: 12, marginTop: 6,
};
const planBtn = {
  flex: 1, display: "flex", flexDirection: "column",
  alignItems: "center", gap: 6,
  padding: "16px 8px", borderRadius: 14,
  background: C.cream, border: "1px solid rgba(58,44,26,0.10)",
  cursor: "pointer", fontFamily: "inherit", color: C.espresso,
};
const planBtnLabel = {
  fontSize: 13, fontWeight: 700, color: C.espresso,
};
const hiddenDateInput = {
  position: "absolute", opacity: 0, pointerEvents: "none",
  width: 1, height: 1,
};
const todayPlanShell = { marginTop: 6 };
const todayPlanHead = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  marginBottom: 8,
};
const editPlanBtn = {
  display: "inline-flex", alignItems: "center", gap: 4,
  background: "transparent", border: "1px solid rgba(58,44,26,0.18)",
  borderRadius: 9999, padding: "4px 10px",
  fontSize: 11, fontWeight: 700, color: C.espresso, cursor: "pointer",
};
const todayPlanList = {
  listStyle: "none", padding: 0, margin: 0,
  display: "flex", flexDirection: "column", gap: 6,
};
const todayPlanLine = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "6px 8px", borderRadius: 8,
  background: C.cream,
};
const todayPlanDot = {
  width: 5, height: 5, borderRadius: 9999, background: C.espresso,
};
const todayPlanText = {
  flex: 1, fontSize: 13, color: C.espresso,
};
const editPlanInput = {
  flex: 1, padding: "5px 8px",
  background: C.paperHi, border: "1px solid rgba(58,44,26,0.12)",
  borderRadius: 6, fontSize: 12, color: C.espresso, outline: "none",
};
const removeLineBtn = {
  width: 22, height: 22, borderRadius: 9999,
  background: "transparent", border: "1px solid rgba(58,44,26,0.15)",
  color: C.muted, display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", flexShrink: 0,
};
const addPlanLineBtn = {
  marginTop: 8,
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "6px 12px", borderRadius: 9999,
  background: C.cream, border: "1px dashed rgba(58,44,26,0.25)",
  color: C.espresso, fontSize: 11, fontWeight: 700, cursor: "pointer",
};
const planBackBtn = {
  marginTop: 10,
  background: "transparent", border: "none",
  color: C.muted, fontSize: 11, fontWeight: 700,
  letterSpacing: "0.04em", cursor: "pointer", padding: 0,
  alignSelf: "flex-start",
};

// Week strip
const weekStripGrid = {
  display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5, marginTop: 6,
};
const weekChip = {
  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
  padding: "8px 0", borderRadius: 10,
  border: "1px solid",
  cursor: "pointer", fontFamily: "inherit",
};
const weekChipLetter = {
  fontSize: 9, letterSpacing: "0.10em", fontWeight: 700,
};
const weekChipDate = {
  fontFamily: "'Fraunces', Georgia, serif", fontSize: 14, fontWeight: 500,
};
const weekChipDot = { width: 6, height: 6, borderRadius: 9999 };
const weekPopover = {
  marginTop: 8, padding: "8px 12px", borderRadius: 10,
  background: C.cream, border: "1px solid rgba(58,44,26,0.08)",
};
const weekPopText = {
  fontFamily: "'Fraunces', Georgia, serif", fontSize: 13, color: C.espresso,
  margin: "4px 0 0",
};
const weekPopSub = { fontSize: 11, color: C.muted, margin: "2px 0 0" };

// Intentions
const intentionPromptStyle = {
  fontFamily: "Georgia, serif", fontStyle: "italic",
  fontSize: 13, color: C.muted, margin: "4px 0",
};
const intentionTextarea = {
  width: "100%", padding: "10px 12px",
  borderRadius: 10, background: C.cream,
  border: "1px solid rgba(58,44,26,0.10)",
  fontFamily: "Georgia, serif", fontSize: 13, color: C.espresso,
  lineHeight: 1.55, outline: "none", resize: "vertical",
  boxSizing: "border-box",
};
const savedChip = {
  marginTop: 4,
  display: "inline-flex", alignItems: "center", gap: 4,
  fontSize: 10, color: C.sage, fontWeight: 700,
  alignSelf: "flex-start",
};

// Astra
const astraAvatar = {
  position: "absolute", top: 12, right: 12,
  width: 30, height: 30, borderRadius: 9999,
  background: `${C.gold}22`, border: `1px solid ${C.gold}55`,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
};
const astraShort = {
  fontFamily: "Georgia, serif",
  fontSize: 13, color: C.espresso, lineHeight: 1.55, margin: 0,
};
const astraOpenBtn = {
  alignSelf: "flex-start", marginTop: 4,
  display: "inline-flex", alignItems: "center", gap: 4,
  background: "transparent", border: "none",
  color: C.espresso, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0,
};
const astraSheetIcon = {
  width: 40, height: 40, borderRadius: 9999,
  background: `${C.gold}22`, border: `1px solid ${C.gold}55`,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  marginBottom: 8,
};
const astraSheetText = {
  fontFamily: "Georgia, serif", fontSize: 14, color: C.espresso,
  lineHeight: 1.65, margin: 0,
};

// Meals
const mealRow = {
  display: "flex", alignItems: "flex-start", gap: 8,
  padding: "6px 0",
};
const mealLabel = {
  fontSize: 12, fontWeight: 700, color: C.espresso, letterSpacing: "0.04em",
};
const mealValue = {
  fontSize: 11.5, color: C.muted, marginTop: 1, lineHeight: 1.4,
};
const addMealBtn = {
  display: "inline-flex", alignItems: "center", gap: 3,
  padding: "3px 8px", borderRadius: 9999,
  background: C.cream, border: "1px dashed rgba(58,44,26,0.20)",
  fontSize: 10, fontWeight: 700, color: C.espresso, cursor: "pointer",
};
const hydrationRow = {
  marginTop: 10,
  display: "flex", alignItems: "center", gap: 8,
  padding: "8px 10px", borderRadius: 9999,
  background: C.cream,
};
const hydrationLabel = { flex: 1, fontSize: 12, color: C.espresso, fontWeight: 600 };
const hydroBtn = {
  width: 22, height: 22, borderRadius: 9999,
  background: C.paperHi, border: "1px solid rgba(58,44,26,0.15)",
  color: C.espresso,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", padding: 0,
};
const smallLink = {
  alignSelf: "flex-start", marginTop: 6,
  display: "inline-flex", alignItems: "center", gap: 4,
  color: C.espresso, fontSize: 11, fontWeight: 700, textDecoration: "none",
};
const tipText = {
  fontFamily: "Georgia, serif", fontStyle: "italic",
  fontSize: 12, color: C.muted, margin: "8px 0 0", lineHeight: 1.55,
};

// Medications
const allDoneChip = {
  marginLeft: "auto",
  display: "inline-flex", alignItems: "center", gap: 3,
  padding: "3px 9px", borderRadius: 9999,
  background: `${C.sage}22`, color: C.sage,
  fontSize: 10, fontWeight: 700,
};
const addMedBtn = {
  alignSelf: "flex-start", marginTop: 8,
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "5px 10px", borderRadius: 9999,
  background: C.cream, border: "1px dashed rgba(58,44,26,0.20)",
  fontSize: 11, fontWeight: 700, color: C.espresso, cursor: "pointer",
};

// Tonight + sleep
const reflectionRow = {
  display: "flex", flexDirection: "column", gap: 3,
  margin: "8px 0",
};
const reflectionLabel = {
  fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: "0.04em",
};
const reflectionInput = {
  padding: "7px 10px", borderRadius: 8,
  background: C.cream, border: "1px solid rgba(58,44,26,0.10)",
  fontSize: 12, color: C.espresso, outline: "none",
  fontFamily: "'Inter', sans-serif",
};
const sleepTargetTime = {
  fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, fontWeight: 500,
  color: C.espresso, margin: "4px 0",
};
const sleepLastNight = {
  padding: "8px 10px", borderRadius: 10,
  background: C.cream, marginTop: 4,
};
const sleepLastNightText = {
  fontSize: 12, color: C.espresso, margin: "2px 0 0",
};

// GP report card
const iconCircle = {
  width: 38, height: 38, borderRadius: 12,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const reportBtn = {
  alignSelf: "flex-start", marginTop: 8,
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "9px 16px", borderRadius: 9999,
  background: C.espresso, color: C.cream, border: "none",
  fontFamily: "'Inter', sans-serif",
  fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
  cursor: "pointer",
};
const reportLastExport = {
  fontSize: 10, color: C.muted, fontStyle: "italic", marginTop: 8,
};

// Slide-outs
const backdropStyle = {
  position: "fixed", inset: 0,
  background: "rgba(58,44,26,0.40)",
  zIndex: 70, transition: "opacity 250ms ease",
};
const drawerStyle = {
  position: "fixed", top: 0, right: 0, bottom: 0,
  width: "100%", maxWidth: 420,
  background: C.cream,
  boxShadow: "-8px 0 32px rgba(58,44,26,0.18)",
  zIndex: 75,
  transition: "transform 300ms ease",
  display: "flex", flexDirection: "column",
  padding: "20px 16px 24px",
  fontFamily: "'Inter', system-ui, sans-serif",
  overflowY: "auto",
};
const drawerHead = {
  display: "flex", alignItems: "flex-start", justifyContent: "space-between",
  gap: 8, marginBottom: 14,
};
const drawerTitle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 22, fontWeight: 500, color: C.espresso,
  letterSpacing: "-0.01em", margin: "4px 0 0", lineHeight: 1.2,
};
const drawerCloseBtn = {
  width: 30, height: 30, borderRadius: 9999,
  background: C.paperHi, border: "1px solid rgba(58,44,26,0.15)",
  color: C.muted,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", flexShrink: 0,
};

// Cycle slide-out grid
const cycleGridStyle = {
  display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6,
  marginTop: 6,
};
const cycleCell = {
  aspectRatio: "1 / 1",
  borderRadius: 10,
  display: "flex", alignItems: "center", justifyContent: "center",
  border: "2px solid",
};
const cycleCellNum = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 14, fontWeight: 500, color: C.espresso,
};
const cycleLegendRow = {
  marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap",
};
const cycleLegendChip = {
  display: "inline-flex", alignItems: "center", gap: 6,
  fontSize: 11, color: C.espresso, fontWeight: 600, textTransform: "capitalize",
};

// Bio slide-out
const bioGrid = {
  display: "flex", flexDirection: "column", gap: 2,
};
const bioHourRow = {
  display: "grid", gridTemplateColumns: "44px 8px 1fr",
  gap: 8, alignItems: "center",
  minHeight: 32,
};
const bioHourLabel = {
  fontSize: 11, color: C.muted, fontFamily: "'Inter', sans-serif", fontWeight: 600,
  textAlign: "right",
};
const bioRail = {
  width: 6, height: "100%", borderRadius: 9999,
  minHeight: 28,
};
const bioTaskCol = {};
const bioTaskBlock = {
  display: "inline-block", padding: "5px 10px",
  borderRadius: 9999, border: "1px solid",
  fontSize: 11, fontWeight: 600,
};

// Modal
const modalBackdrop = {
  position: "fixed", inset: 0,
  background: "rgba(58,44,26,0.40)", zIndex: 80,
  display: "flex", alignItems: "flex-end", justifyContent: "center",
  padding: "0 0 max(16px, env(safe-area-inset-bottom))",
};
const modalCard = {
  width: "100%", maxWidth: 520,
  background: C.cream,
  borderRadius: "22px 22px 0 0",
  padding: "16px 18px 22px",
  boxShadow: "0 -8px 32px rgba(58,44,26,0.18)",
  fontFamily: "'Inter', system-ui, sans-serif",
};
const modalHead = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  marginBottom: 4,
};
const modalTitle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 22, fontWeight: 500, color: C.espresso,
  letterSpacing: "-0.01em", margin: "4px 0 14px", lineHeight: 1.25,
};
const miniLabel = {
  fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
  color: C.muted, fontWeight: 700,
  display: "block", marginBottom: 6,
};
const modalInput = {
  width: "100%", padding: "10px 12px",
  borderRadius: 10, background: C.paperHi,
  border: "1px solid rgba(58,44,26,0.15)",
  fontSize: 14, color: C.espresso, outline: "none",
  fontFamily: "'Inter', sans-serif",
  boxSizing: "border-box",
};
const paletteRow = {
  display: "flex", gap: 10, marginTop: 4, marginBottom: 14,
};
const paletteDot = {
  width: 28, height: 28, borderRadius: 9999,
  border: "none", cursor: "pointer", padding: 0,
};
const chipRowSpacing = {
  display: "flex", flexWrap: "wrap", gap: 5,
  marginBottom: 14,
};
const modalChip = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "6px 12px", borderRadius: 9999,
  border: "1px solid",
  fontSize: 11.5, fontWeight: 600, cursor: "pointer",
  fontFamily: "'Inter', sans-serif",
};
const ritualItemRow = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "6px 8px", borderRadius: 10,
  background: C.paperHi, border: "1px solid rgba(58,44,26,0.08)",
};
const ritualItemInput = {
  flex: 1, padding: "6px 8px", borderRadius: 6,
  background: C.cream, border: "1px solid rgba(58,44,26,0.10)",
  fontSize: 12, color: C.espresso, outline: "none",
};
const addItemBtn = {
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "6px 12px", borderRadius: 9999,
  background: C.paperHi, border: "1px dashed rgba(58,44,26,0.25)",
  color: C.espresso, fontSize: 11, fontWeight: 700, cursor: "pointer",
};
const modalFoot = {
  display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12,
};
const modalCancelBtn = {
  padding: "9px 14px", borderRadius: 9999,
  background: "transparent", color: C.muted,
  border: "1px solid rgba(58,44,26,0.18)",
  fontSize: 12, fontWeight: 700, cursor: "pointer",
};
const modalSaveBtn = {
  padding: "9px 18px", borderRadius: 9999,
  background: C.espresso, color: C.cream, border: "1px solid " + C.espresso,
  fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", cursor: "pointer",
};

// Blueprint
const blueprintDotsRow = {
  display: "flex", justifyContent: "center", gap: 5, marginBottom: 12,
};
const blueprintDot = {
  width: 7, height: 7, borderRadius: 9999,
  transition: "all 200ms ease",
};
const confirmRow = {
  display: "flex", flexDirection: "column", gap: 8,
};
const confirmLineStyle = {
  padding: "8px 12px", borderRadius: 10,
  background: C.paperHi, border: "1px solid rgba(58,44,26,0.08)",
  display: "flex", flexDirection: "column", gap: 2,
};
const confirmValueStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 14, fontWeight: 500, color: C.espresso,
};

// Report sheet
const reportSectionRow = {
  display: "flex", alignItems: "flex-start", gap: 10,
  padding: "10px 12px", borderRadius: 10,
  background: C.paperHi, border: "1px solid rgba(58,44,26,0.08)",
};
const reportSectionLabel = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 14, fontWeight: 500, color: C.espresso,
};
const reportSectionDesc = {
  fontSize: 11, color: C.muted, marginTop: 2, lineHeight: 1.4,
};

// Footer
const demoFooter = {
  margin: "20px 16px 0",
  padding: "12px 14px", borderRadius: 12,
  background: "rgba(58,44,26,0.06)",
  textAlign: "center",
};
const demoFooterText = {
  fontSize: 11, color: C.muted, margin: "6px 0 0", lineHeight: 1.55,
};
