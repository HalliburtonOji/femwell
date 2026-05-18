// ─────────────────────────────────────────────────────────────────────────────
// UnifiedPlannerDemo — v2 (major restructure per Halli's review).
//
// DEMO ONLY. Lives at /Ideas → "Unified" tab. Does NOT touch Planner.jsx,
// Today.jsx, or any production file.
//
// CHANGES IN v2
//   · The auto-switching hero card is gone. A pill tab strip (Morning ·
//     Afternoon · Evening) sits below the header. The user chooses scene.
//   · The two header icon buttons are gone. A second strip (Schedule ·
//     Cycle) replaces them. Selecting Schedule or Cycle swaps the body
//     for a full-panel view; the time-of-day stacks return when one of
//     the first three is picked.
//   · Schedule = vertical biorhythm timeline (6am–11pm) with an energy
//     rail and editable blocks. Tap a block to edit.
//   · Cycle = month view of week-pills with gradient fills per dominant
//     phase, today's date as a lifted white tile. Tap any day to open
//     the Day Detail sheet (past / today / future variants).
//   · Floating gold "+" FAB bottom-right opens a popup: voice scheduling
//     on the left (Web Speech API), 10 manual-add icon cards on the
//     right.
//
// Brand rule: NO emoji codepoints — all glyphs are Lucide icons.
// localStorage keys: same as v1 plus femwell_unified_blocks.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useRef, useState, Children } from "react";
import {
  Sun, Moon, Zap, Calendar, Activity, X, Plus, ChevronLeft, ChevronRight,
  ChevronDown, ChevronUp, Sparkles, CalendarCheck, Check, Edit3, Trash2,
  Heart, Droplets, Footprints, CircleDot, Pill, BedDouble, FileText,
  GripVertical, ArrowUpRight, Smile, Mic, Utensils, CalendarClock,
  StickyNote, Stethoscope, ListChecks, Star, ArrowLeft, ArrowRight,
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
  // Calendar-pill phase tones (richer than chip tones to read as gradient backgrounds)
  pMenstrual:  "#8B2842",
  pFollicular: "#C8694D",
  pOvulatory:  "#D4A23A",
  pLuteal:     "#6B5896",
  faint:    "rgba(58,44,26,0.10)",
};
// Chip-tone phase mapping (lighter, for inline chips)
const PHASE_LIGHT = {
  menstrual:  C.blush,
  follicular: C.sage,
  ovulatory:  C.gold,
  luteal:     C.muted,
};
const PHASE_DEEP = {
  menstrual:  C.pMenstrual,
  follicular: C.pFollicular,
  ovulatory:  C.pOvulatory,
  luteal:     C.pLuteal,
};

// ── Mock ──────────────────────────────────────────────────────────────────
const profile = { name: "Halli", phase: "ovulatory", cycleDay: 14, cycleLen: 28 };

const today = new Date();
const todayISO = today.toISOString().split("T")[0];

const initialLists = [
  { id: "work",     name: "Work",     colour: "#3A2C1A", tasks: [
    { id: "t1", text: "Team standup",          done: false, due: todayISO },
    { id: "t2", text: "Draft investor update", done: false, due: todayISO },
    { id: "t3", text: "Review press list",     done: false, due: null },
  ]},
  { id: "personal", name: "Personal", colour: "#D4AF37", tasks: [
    { id: "p1", text: "Call pharmacy",         done: true,  due: todayISO },
    { id: "p2", text: "Pick up dry cleaning",  done: false, due: null },
  ]},
  { id: "health",   name: "Health",   colour: "#8FAF8F", tasks: [
    { id: "h1", text: "Book GP follow-up",     done: false, due: null },
  ]},
];

const initialStack = {
  habits: [
    { id: "h1", text: "Morning movement",  done: true,  streak: 28 },
    { id: "h2", text: "Hydration check",   done: false, streak: 6  },
    { id: "h3", text: "Supplements",       done: false, streak: 12 },
    { id: "h4", text: "Evening wind-down", done: false, streak: 4  },
    { id: "h5", text: "Gratitude journal", done: true,  streak: 35 },
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
  { id: "ovu",  title: "Ovulatory Power Hour", count: 5, time: "Morning", duration: "20 min", phase: "ovulatory", accent: C.gold,  rituals: ["Sunlight + walk", "Strength · 25m", "Cold water", "High-protein breakfast", "Speak one bold thing"] },
  { id: "rest", title: "Rest & Restore",       count: 4, time: "Evening", duration: "15 min", phase: "luteal",    accent: C.muted, rituals: ["Yin yoga · 10m", "Magnesium", "Warm bath", "Read 10 pages"] },
  { id: "sync", title: "Cycle Sync Stretch",   count: 3, time: "Any",     duration: "10 min", phase: "any",       accent: C.sage,  rituals: ["Hip openers", "Spinal twist", "Legs up the wall"] },
];

const intentionPrompts = {
  ovulatory:  "What does your body need you to honour today?",
  follicular: "What's calling you to start?",
  luteal:     "What can you let go of this week?",
  menstrual:  "How can you slow down today?",
};

const astraMorning = {
  title: "Your Ovulatory Morning",
  short: "Your energy peaks now — use it. This is your window for visibility, bold asks, and creative output.",
};
const astraMidday = {
  title: "Midday Note",
  short: "Confidence is your tailwind right now. Send the bold email. Speak first in the meeting.",
};

const supplements = [
  { id: "om3", text: "Omega-3",          done: false, when: "morning" },
  { id: "mg",  text: "Magnesium glycinate", done: false, when: "evening" },
];

const tonightPrompts = ["One win today", "Energy rating (1–10)", "Intention for tomorrow"];

const sleepTarget = { time: "10:30pm", lastNight: "7h 20min · Good quality", tip: "Ovulatory phase — you may need slightly less sleep than usual." };

const initialBlocks = [
  { id: "b1", hour: 7,  duration: 15, title: "Morning stretch",    type: "habit", anchor: true,  done: true },
  { id: "b2", hour: 8,  duration: 5,  title: "Folic acid",         type: "med",   anchor: true,  done: true },
  { id: "b3", hour: 9,  duration: 90, title: "Investor update — deep work", type: "task", anchor: false, done: false },
  { id: "b4", hour: 11, duration: 25, title: "Strength · 25m",     type: "habit", anchor: false, done: false },
  { id: "b5", hour: 13, duration: 30, title: "Lunch + walk",       type: "habit", anchor: false, done: false },
  { id: "b6", hour: 14, duration: 60, title: "Antenatal class",    type: "event", anchor: true,  done: false },
  { id: "b7", hour: 16, duration: 30, title: "Pharmacy call",      type: "task",  anchor: false, done: false },
  { id: "b8", hour: 19, duration: 30, title: "Wind-down · journal", type: "habit", anchor: false, done: false },
];
const TYPE_TONES = {
  habit: { bg: `${C.sage}1F`,  icon: C.sage,  bar: C.sage  },
  task:  { bg: "rgba(58,44,26,0.07)", icon: C.espresso, bar: C.espresso },
  med:   { bg: `${C.blush}1F`, icon: C.blush, bar: C.blush },
  event: { bg: `${C.gold}1F`,  icon: C.gold,  bar: C.gold  },
};

function bandFor(h) {
  if (h >= 9 && h <= 11) return C.gold;
  if (h >= 12 && h <= 15) return C.sage;
  if (h >= 16 && h <= 18) return C.blush;
  return C.muted;
}

// Calendar — May 2026, Mon-start. Today = May 18 in the calendar reference visual.
// (Spec says reference shows Day 25 Luteal but day 18 lifted — we render today as
// the highlighted tile; for the demo we use profile.cycleDay = 14 → ovulatory.)
const CAL_TODAY_DAY = profile.cycleDay; // 1-indexed cycle day for highlight
function buildMonth(year, month) {
  // month: 0-indexed
  const first = new Date(year, month, 1);
  const startDow = (first.getDay() + 6) % 7; // Mon=0
  const lastDay = new Date(year, month + 1, 0).getDate();
  const weeks = [];
  let week = [];
  for (let i = 0; i < startDow; i++) week.push({ blank: true });
  for (let d = 1; d <= lastDay; d++) {
    week.push({ day: d, date: new Date(year, month, d), phase: phaseForCalDay(d) });
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length) {
    while (week.length < 7) week.push({ blank: true });
    weeks.push(week);
  }
  return weeks;
}
function phaseForCalDay(d) {
  // For demo: cycle started 13 days ago from "today" (so day 1 was 13 days back).
  // Today (calendar day = today.getDate()) maps to profile.cycleDay.
  const todayDom = today.getDate();
  const cycleDayForCal = ((d - todayDom + profile.cycleDay - 1 + profile.cycleLen * 3) % profile.cycleLen) + 1;
  if (cycleDayForCal <= 5) return "menstrual";
  if (cycleDayForCal <= 13) return "follicular";
  if (cycleDayForCal <= 16) return "ovulatory";
  return "luteal";
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
export default function UnifiedPlannerDemo() {
  const [tab, setTab] = useState("morning"); // morning | afternoon | evening | schedule | cycle
  const [addOpen, setAddOpen] = useState(false);
  const [dayDetail, setDayDetail] = useState(null); // ISO date or null
  const [blockEdit, setBlockEdit] = useState(null); // block id or null
  const [blocks, setBlocks] = useState(() => {
    try {
      const raw = localStorage.getItem("femwell_unified_blocks");
      if (raw) return JSON.parse(raw);
    } catch {}
    return initialBlocks;
  });
  useEffect(() => {
    try { localStorage.setItem("femwell_unified_blocks", JSON.stringify(blocks)); } catch {}
  }, [blocks]);

  const greeting = useMemo(() => {
    const h = today.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    if (h < 21) return "Good evening";
    return "Resting well";
  }, []);

  return (
    <div style={shell}>
      <Header greeting={greeting} />
      <TabStripPrimary value={tab} onChange={setTab} />
      <TabStripSecondary value={tab} onChange={setTab} />

      {tab === "morning"   && <MorningStack />}
      {tab === "afternoon" && <AfternoonStack />}
      {tab === "evening"   && <EveningStack />}
      {tab === "schedule"  && (
        <SchedulePanel
          blocks={blocks}
          onBlockTap={(id) => setBlockEdit(id)}
        />
      )}
      {tab === "cycle"     && (
        <CyclePanel onDayTap={(iso) => setDayDetail(iso)} />
      )}

      <DemoFooter />

      <AddFAB onClick={() => setAddOpen(true)} />

      <AddPopup open={addOpen} onClose={() => setAddOpen(false)} />
      <DayDetailSheet
        iso={dayDetail}
        onClose={() => setDayDetail(null)}
      />
      <BlockEditSheet
        block={blockEdit ? blocks.find((b) => b.id === blockEdit) : null}
        onClose={() => setBlockEdit(null)}
        onSave={(next) => {
          setBlocks((bs) => bs.map((b) => b.id === next.id ? next : b));
          setBlockEdit(null);
        }}
        onDelete={(id) => {
          setBlocks((bs) => bs.filter((b) => b.id !== id));
          setBlockEdit(null);
        }}
      />
    </div>
  );
}

// ── Header ─────────────────────────────────────────────────────────────────
function Header({ greeting }) {
  return (
    <div style={headerStyle}>
      <div style={greetingRow}>
        <h1 style={greetingText}>{greeting}, {profile.name}</h1>
        <Sun size={18} style={{ color: C.gold, flexShrink: 0 }} />
      </div>
      <div style={greetingSub}>
        Monday · Cycle Day {profile.cycleDay} · {profile.phase[0].toUpperCase() + profile.phase.slice(1)}
      </div>
    </div>
  );
}

// ── Tab strips ─────────────────────────────────────────────────────────────
function TabStripPrimary({ value, onChange }) {
  const tabs = [
    { id: "morning",   label: "Morning"   },
    { id: "afternoon", label: "Afternoon" },
    { id: "evening",   label: "Evening"   },
  ];
  const refs = useRef({});
  const trackRef = useRef(null);

  // Allow horizontal swipe between morning/afternoon/evening
  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    let best = "morning", bestDist = Infinity;
    tabs.forEach((t) => {
      const el = refs.current[t.id];
      if (!el) return;
      const left = el.offsetLeft - track.offsetLeft;
      const dist = Math.abs(left - track.scrollLeft);
      if (dist < bestDist) { bestDist = dist; best = t.id; }
    });
    if (best !== value && ["morning","afternoon","evening"].includes(value)) {
      // only react when in time-of-day mode
      onChange(best);
    }
  }

  return (
    <div style={primaryTabWrap}>
      <div style={primaryTabStrip}>
        {tabs.map((t) => {
          const active = t.id === value;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              ref={(el) => (refs.current[t.id] = el)}
              style={{
                ...primaryTabBtn,
                background: active ? C.espresso : "transparent",
                color: active ? C.cream : C.espresso,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TabStripSecondary({ value, onChange }) {
  const tabs = [
    { id: "schedule", label: "Schedule", Icon: Activity },
    { id: "cycle",    label: "Cycle",    Icon: Calendar },
  ];
  return (
    <div style={secondaryTabWrap}>
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            onClick={() => onChange(active ? "morning" : t.id)}
            style={{
              ...secondaryTabBtn,
              background: active ? C.espresso : C.paperHi,
              color: active ? C.cream : C.espresso,
              borderColor: active ? C.espresso : "rgba(58,44,26,0.12)",
            }}
          >
            <t.Icon size={13} style={{ color: active ? C.cream : C.muted }} />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MORNING stack
// ─────────────────────────────────────────────────────────────────────────────
function MorningStack() {
  return (
    <div style={contentWrap}>
      <BodyTodayCard />
      <MorningStackCard />
      <RitualsRow />
      <IntentionCard />
    </div>
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
  const R = 30, CIRC = 2 * Math.PI * R;
  const offset = CIRC * (1 - pct / 100);

  return (
    <article style={cardStyle}>
      <div style={cardHeadRow}>
        <span style={{ ...phaseChip, background: `${C.gold}1F`, color: C.goldDeep, border: `1px solid ${C.gold}55` }}>
          <span style={{ width: 6, height: 6, borderRadius: 9999, background: C.gold, marginRight: 5 }} />
          Ovulatory Day {profile.cycleDay}
        </span>
        <button onClick={() => setExpanded((v) => !v)} style={expandBtn} aria-label={expanded ? "Collapse" : "Expand"}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>
      <div style={ringRow}>
        <svg width={76} height={76} viewBox="0 0 76 76">
          <circle cx={38} cy={38} r={R} fill="none" stroke={C.faint} strokeWidth={6} />
          <circle cx={38} cy={38} r={R} fill="none" stroke={C.gold} strokeWidth={6} strokeLinecap="round"
            strokeDasharray={CIRC} strokeDashoffset={offset} transform="rotate(-90 38 38)" />
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
            { label: "Mood", value: "Buoyant", Icon: Smile, tone: C.rose },
            { label: "Energy", value: "High", Icon: Zap, tone: C.goldDeep },
            { label: "Sleep", value: "7h 20m", Icon: Moon, tone: C.muted },
            { label: "Symptom", value: "Clear CM", Icon: Droplets, tone: "#60B4FA" },
            { label: "Cycle day", value: `${profile.cycleDay}/${profile.cycleLen}`, Icon: CircleDot, tone: C.gold },
            { label: "Next event", value: "Luteal · 4d", Icon: Calendar, tone: C.sage },
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

function MorningStackCard() {
  const [stack, setStack] = useState(() => {
    try {
      const raw = localStorage.getItem("femwell_unified_stack");
      if (raw) return JSON.parse(raw);
    } catch {}
    return initialStack;
  });
  const [tasks, setTasks] = useState([
    { id: "tk1", text: "Team standup",         done: false, source: "Work" },
    { id: "tk2", text: "Draft investor update", done: false, source: "Work" },
    { id: "tk3", text: "Call pharmacy",        done: true,  source: "Personal" },
  ]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    try { localStorage.setItem("femwell_unified_stack", JSON.stringify(stack)); } catch {}
  }, [stack]);

  function toggle(section, id) {
    setStack((s) => ({ ...s, [section]: s[section].map((it) => it.id === id ? { ...it, done: !it.done } : it) }));
  }
  function toggleTask(id) { setTasks((ts) => ts.map((t) => t.id === id ? { ...t, done: !t.done } : t)); }
  function addTask() {
    const v = newTask.trim();
    if (!v) return;
    setTasks((ts) => [...ts, { id: `tk_${Date.now()}`, text: v, done: false, source: "Today" }]);
    setNewTask("");
  }

  return (
    <article style={cardStyle}>
      <h3 style={cardTitle}>Morning stack</h3>
      <Section name="HABITS">
        {stack.habits.map((h) => (
          <CheckboxRow key={h.id} checked={h.done} onChange={() => toggle("habits", h.id)} text={h.text}>
            <span style={streakRow} title={`${h.streak}-day streak`}>
              {Array.from({ length: Math.min(4, Math.floor(h.streak / 7)) }).map((_, i) => (
                <span key={i} style={streakDot} />
              ))}
              <span style={streakLabel}>{h.streak}d</span>
            </span>
          </CheckboxRow>
        ))}
      </Section>
      <Section name="TASKS">
        {tasks.map((t) => (
          <CheckboxRow key={t.id} checked={t.done} onChange={() => toggleTask(t.id)} text={t.text}>
            {t.source && <span style={sourceChip}>{t.source}</span>}
          </CheckboxRow>
        ))}
        <input
          type="text" value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="+ Add task" style={addTaskInput}
        />
      </Section>
      <Section name="MEALS">
        {stack.meals.slice(0, 1).map((m) => (
          <CheckboxRow key={m.id} checked={m.done} onChange={() => toggle("meals", m.id)} text={m.text}>
            {m.note && <span style={sourceChip}>{m.note}</span>}
          </CheckboxRow>
        ))}
      </Section>
      <Section name="MEDICATIONS">
        {stack.meds.map((m) => (
          <CheckboxRow key={m.id} checked={m.done} onChange={() => toggle("meds", m.id)} text={m.text}>
            <span style={medTimeChip}>{m.time}</span>
          </CheckboxRow>
        ))}
      </Section>
    </article>
  );
}

function RitualsRow() {
  return (
    <SliderRow label="Rituals">
      <CreateRitualCard />
      {ritualBundles.map((b) => <RitualBundleCard key={b.id} bundle={b} />)}
    </SliderRow>
  );
}

function CreateRitualCard() {
  return (
    <button style={createRitualCard} aria-label="Build your own ritual">
      <span style={createRitualIcon}><Sparkles size={24} style={{ color: C.gold }} /></span>
      <span style={createRitualTitle}>Build a ritual</span>
      <span style={createRitualSub}>Your own bundle, your phase, your time</span>
    </button>
  );
}

function RitualBundleCard({ bundle }) {
  const [added, setAdded] = useState(false);
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
      <button onClick={() => setAdded(true)} disabled={added} style={{
        ...addToStackBtn,
        background: added ? "transparent" : C.espresso,
        color: added ? C.espresso : C.cream,
        borderColor: added ? C.espresso : "transparent",
      }}>
        {added ? (<><Check size={12} /> Added</>) : "Add to stack"}
      </button>
    </article>
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
        value={val} onChange={(e) => setVal(e.target.value)} onBlur={handleBlur}
        placeholder="Write here…" style={intentionTextarea} rows={4}
      />
      {saved && <span style={savedChip}><Check size={11} style={{ color: C.sage }} /> Saved</span>}
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AFTERNOON stack
// ─────────────────────────────────────────────────────────────────────────────
function AfternoonStack() {
  return (
    <div style={contentWrap}>
      <SmartViewMiddayCard />
      <TasksRemainingCard />
      <LunchPlannerCard />
      <AstraMiddayCard />
    </div>
  );
}

function SmartViewMiddayCard() {
  const bullets = [
    "Send the bold email — confidence peaks now",
    "Take a 10-min daylight walk to consolidate energy",
    "Move iron-rich foods into lunch — body absorbs better mid-day",
  ];
  return (
    <article style={cardStyle}>
      <div style={cardHeadRow}>
        <span style={kicker}>SMART VIEW · MIDDAY</span>
        <span style={astraTag}>Powered by Astra</span>
      </div>
      <h3 style={cardTitle}>What your body needs now</h3>
      <ul style={bulletList}>
        {bullets.map((b) => (
          <li key={b} style={bulletLine}>
            <span style={bulletDot} />{b}
          </li>
        ))}
      </ul>
    </article>
  );
}

function TasksRemainingCard() {
  const [tasks, setTasks] = useState([
    { id: "rt1", text: "Team standup",          done: false, source: "Work" },
    { id: "rt2", text: "Draft investor update", done: false, source: "Work" },
    { id: "rt3", text: "Review press list",     done: false, source: "Work" },
    { id: "rt4", text: "Book GP follow-up",     done: false, source: "Health" },
  ]);
  function toggle(id) {
    setTasks((ts) => ts.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  }
  const remaining = tasks.filter((t) => !t.done);
  return (
    <article style={cardStyle}>
      <div style={cardHeadRow}>
        <h3 style={{ ...cardTitle, margin: 0 }}>Tasks remaining</h3>
        <span style={countChipSm}>{remaining.length} left</span>
      </div>
      <ul style={{ ...bulletList, gap: 6, marginTop: 6 }}>
        {tasks.map((t) => (
          <CheckboxRow key={t.id} checked={t.done} onChange={() => toggle(t.id)} text={t.text}>
            <span style={sourceChip}>{t.source}</span>
          </CheckboxRow>
        ))}
      </ul>
    </article>
  );
}

function LunchPlannerCard() {
  const [meals, setMeals] = useState([
    { id: "l", label: "Lunch", value: "Salmon + greens · 420 cal · P:32g", done: false },
    { id: "s", label: "Snack", value: "Almonds + dark chocolate · 180 cal", done: false },
  ]);
  function toggle(id) { setMeals((ms) => ms.map((m) => m.id === id ? { ...m, done: !m.done } : m)); }
  return (
    <article style={cardStyle}>
      <h3 style={cardTitle}>Midday plate</h3>
      <ul style={{ ...bulletList, gap: 8, marginTop: 6 }}>
        {meals.map((m) => (
          <li key={m.id} style={mealRow}>
            <input type="checkbox" checked={m.done} onChange={() => toggle(m.id)}
              style={{ accentColor: C.sage, marginTop: 3, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={mealLabel}>{m.label}</div>
              <div style={mealValue}>{m.value}</div>
            </div>
          </li>
        ))}
      </ul>
      <p style={tipText}>Ovulatory — your liver is working hard. Cruciferous veg help oestrogen clearance.</p>
    </article>
  );
}

function AstraMiddayCard() {
  return (
    <article style={{ ...cardStyle, position: "relative" }}>
      <div style={astraAvatar}><Sparkles size={14} style={{ color: C.gold }} /></div>
      <span style={kicker}>ASTRA · MIDDAY</span>
      <h3 style={cardTitle}>{astraMidday.title}</h3>
      <p style={astraShort}>{astraMidday.short}</p>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENING stack
// ─────────────────────────────────────────────────────────────────────────────
function EveningStack() {
  return (
    <div style={contentWrap}>
      <TonightReflectionCard />
      <EveningHabitsCard />
      <SleepTargetCard />
      <TomorrowPreviewCard />
    </div>
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
  return (
    <article style={cardStyle}>
      <h3 style={cardTitle}>Tonight's reflections</h3>
      {tonightPrompts.map((p) => {
        const field = p === tonightPrompts[0] ? "win" : (p === tonightPrompts[1] ? "energy" : "tomorrow");
        return (
          <label key={p} style={reflectionRow}>
            <span style={reflectionLabel}>{p}</span>
            <input type="text" value={data[field]} onChange={(e) => save(field, e.target.value)}
              style={reflectionInput} placeholder="…" />
          </label>
        );
      })}
    </article>
  );
}

function EveningHabitsCard() {
  const [habits, setHabits] = useState([
    { id: "eh1", text: "Magnesium glycinate", done: false, streak: 12 },
    { id: "eh2", text: "Screens off by 9pm", done: false, streak: 8 },
    { id: "eh3", text: "Gratitude journal",  done: true,  streak: 35 },
    { id: "eh4", text: "Read 10 pages",      done: false, streak: 4 },
  ]);
  function toggle(id) { setHabits((hs) => hs.map((h) => h.id === id ? { ...h, done: !h.done } : h)); }
  return (
    <article style={cardStyle}>
      <h3 style={cardTitle}>Evening wind-down</h3>
      <ul style={{ ...bulletList, gap: 6, marginTop: 6 }}>
        {habits.map((h) => (
          <CheckboxRow key={h.id} checked={h.done} onChange={() => toggle(h.id)} text={h.text}>
            <span style={{ ...streakLabel, marginLeft: "auto" }}>{h.streak}d streak</span>
          </CheckboxRow>
        ))}
      </ul>
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

function TomorrowPreviewCard() {
  const tomorrowDate = new Date(today); tomorrowDate.setDate(today.getDate() + 1);
  const tmIso = tomorrowDate.toISOString().split("T")[0];
  const tmCycleDay = profile.cycleDay + 1;
  const tmPhase = tmCycleDay <= 16 ? "ovulatory" : "luteal";
  return (
    <article style={cardStyle}>
      <span style={kicker}>TOMORROW</span>
      <h3 style={cardTitle}>{tomorrowDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</h3>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: `${PHASE_LIGHT[tmPhase]}22`, border: `1px solid ${PHASE_LIGHT[tmPhase]}55` }}>
        <span style={{ width: 10, height: 10, borderRadius: 9999, background: PHASE_LIGHT[tmPhase] }} />
        <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 15, fontWeight: 500, color: C.espresso }}>
          {tmPhase[0].toUpperCase() + tmPhase.slice(1)} · Day {tmCycleDay}
        </span>
      </div>
      <ul style={{ ...bulletList, gap: 5, marginTop: 8 }}>
        <li style={bulletLine}><span style={bulletDot} /> 9am — Antenatal class</li>
        <li style={bulletLine}><span style={bulletDot} /> 11am — Strength session</li>
        <li style={bulletLine}><span style={bulletDot} /> 4pm — Investor follow-up call</li>
      </ul>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULE panel (biorhythm timeline)
// ─────────────────────────────────────────────────────────────────────────────
function SchedulePanel({ blocks, onBlockTap }) {
  const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6am..11pm
  const currentHour = today.getHours();
  const currentMinute = today.getMinutes();

  return (
    <div style={contentWrap}>
      <div style={schedHead}>
        <span style={kicker}>SCHEDULE · {today.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }).toUpperCase()}</span>
        <h2 style={schedTitle}>Today, hour by hour</h2>
        <p style={schedSub}>Tap a block to edit. Long press to drag.</p>
      </div>
      <div style={schedGrid}>
        {hours.map((h) => {
          const isCurrent = h === currentHour;
          return (
            <ScheduleHour
              key={h}
              hour={h}
              blocks={blocks.filter((b) => b.hour === h)}
              isCurrent={isCurrent}
              currentMinute={isCurrent ? currentMinute : null}
              onBlockTap={onBlockTap}
            />
          );
        })}
      </div>
    </div>
  );
}

function ScheduleHour({ hour, blocks, isCurrent, currentMinute, onBlockTap }) {
  const label = (hour <= 12 ? hour : hour - 12) + (hour < 12 ? " AM" : " PM");
  const rail = bandFor(hour);
  return (
    <div style={schedHourRow}>
      <span style={schedHourLabel}>{label}</span>
      <div style={schedRailCol}>
        <span style={{ ...schedRail, background: rail }} />
        {isCurrent && (
          <>
            <span style={{ ...schedRailDot, top: `${(currentMinute / 60) * 100}%` }} />
            <span style={{ ...schedNowLine, top: `${(currentMinute / 60) * 100}%` }} />
          </>
        )}
      </div>
      <div style={schedBlockCol}>
        {blocks.length === 0 && <button style={schedEmptySlot} aria-label="Add at this hour"><Plus size={12} /> Add</button>}
        {blocks.map((b) => (
          <ScheduleBlock key={b.id} block={b} onTap={() => onBlockTap(b.id)} />
        ))}
      </div>
    </div>
  );
}

function ScheduleBlock({ block, onTap }) {
  const tones = TYPE_TONES[block.type] || TYPE_TONES.task;
  const IconForType = block.type === "habit" ? Footprints
    : block.type === "med" ? Pill
    : block.type === "event" ? CalendarClock
    : ListChecks;
  return (
    <button onClick={onTap} style={{
      ...schedBlock,
      background: tones.bg,
      borderLeft: `3px solid ${tones.bar}`,
      minHeight: 28 + Math.min(60, block.duration) * 0.5,
    }}>
      <span style={{ ...schedBlockIcon, background: tones.bar }}>
        <IconForType size={11} style={{ color: C.cream }} />
      </span>
      <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
        <div style={schedBlockTitle}>{block.title}{block.done && <Check size={11} style={{ color: C.sage, marginLeft: 6 }} />}</div>
        <div style={schedBlockMeta}>{block.duration} MIN · {block.type.toUpperCase()}</div>
      </div>
      {block.anchor && <span style={anchorPill}>ANCHOR</span>}
    </button>
  );
}

function BlockEditSheet({ block, onClose, onSave, onDelete }) {
  const [draft, setDraft] = useState(block);
  useEffect(() => { setDraft(block); }, [block]);
  if (!block || !draft) return null;
  function set(k, v) { setDraft((d) => ({ ...d, [k]: v })); }
  return (
    <div style={modalBackdrop} onClick={onClose}>
      <div style={modalCard} onClick={(e) => e.stopPropagation()}>
        <div style={modalHead}>
          <span style={kicker}>EDIT BLOCK</span>
          <button onClick={onClose} style={drawerCloseBtn} aria-label="Close"><X size={14} /></button>
        </div>
        <h3 style={modalTitle}>{draft.title}</h3>
        <label style={{ display: "block", marginBottom: 10 }}>
          <span style={miniLabel}>TITLE</span>
          <input type="text" value={draft.title} onChange={(e) => set("title", e.target.value)} style={modalInput} />
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          <label>
            <span style={miniLabel}>HOUR</span>
            <select value={draft.hour} onChange={(e) => set("hour", Number(e.target.value))} style={modalInput}>
              {Array.from({ length: 18 }, (_, i) => i + 6).map((h) => (
                <option key={h} value={h}>{h <= 12 ? h : h - 12}:00 {h < 12 ? "AM" : "PM"}</option>
              ))}
            </select>
          </label>
          <label>
            <span style={miniLabel}>DURATION (MIN)</span>
            <select value={draft.duration} onChange={(e) => set("duration", Number(e.target.value))} style={modalInput}>
              {[5, 15, 30, 45, 60, 90, 120].map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
        </div>
        <span style={miniLabel}>TYPE</span>
        <div style={chipRowSpacing}>
          {["habit","task","med","event"].map((t) => (
            <button key={t} onClick={() => set("type", t)} style={{
              ...modalChip,
              background: draft.type === t ? C.espresso : C.paperHi,
              color: draft.type === t ? C.cream : C.muted,
              borderColor: draft.type === t ? C.espresso : "rgba(58,44,26,0.18)",
            }}>{t[0].toUpperCase() + t.slice(1)}</button>
          ))}
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <input type="checkbox" checked={!!draft.anchor} onChange={(e) => set("anchor", e.target.checked)} style={{ accentColor: C.gold }} />
          <span style={{ fontSize: 12, color: C.espresso }}>Mark as anchor (non-moveable)</span>
        </label>
        <div style={modalFoot}>
          <button onClick={() => onDelete(draft.id)} style={{ ...modalCancelBtn, color: C.rose, borderColor: `${C.rose}55` }}>
            <Trash2 size={12} /> Delete
          </button>
          <button onClick={onClose} style={modalCancelBtn}>Cancel</button>
          <button onClick={() => onSave(draft)} style={modalSaveBtn}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CYCLE panel (month gradient calendar)
// ─────────────────────────────────────────────────────────────────────────────
function CyclePanel({ onDayTap }) {
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const weeks = useMemo(() => buildMonth(view.year, view.month), [view]);
  const monthName = new Date(view.year, view.month, 1).toLocaleString(undefined, { month: "long", year: "numeric" });

  function step(delta) {
    let m = view.month + delta;
    let y = view.year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setView({ year: y, month: m });
  }

  return (
    <div style={contentWrap}>
      <div style={calHeadRow}>
        <button onClick={() => step(-1)} style={calNavBtn} aria-label="Previous month"><ArrowLeft size={14} /></button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <h2 style={calTitle}>{monthName}</h2>
          <p style={calSub}>{profile.phase.toUpperCase()} WEEK · DAY {profile.cycleDay}</p>
        </div>
        <button onClick={() => step(1)} style={calNavBtn} aria-label="Next month"><ArrowRight size={14} /></button>
      </div>

      <div style={dowRow}>
        {["M","T","W","T","F","S","S"].map((d, i) => <span key={i} style={dowLabel}>{d}</span>)}
      </div>

      <div style={weekStack}>
        {weeks.map((week, wi) => (
          <WeekPill key={wi} week={week} viewYear={view.year} viewMonth={view.month} onDayTap={onDayTap} />
        ))}
      </div>

      <div style={cycleLegendRow}>
        <span style={cycleLegendChip}><span style={{ width: 10, height: 10, borderRadius: 9999, background: C.pMenstrual }} /> menstrual</span>
        <span style={cycleLegendChip}><span style={{ width: 10, height: 10, borderRadius: 9999, background: C.pFollicular }} /> follicular</span>
        <span style={cycleLegendChip}><span style={{ width: 10, height: 10, borderRadius: 9999, background: C.pOvulatory }} /> ovulatory</span>
        <span style={cycleLegendChip}><span style={{ width: 10, height: 10, borderRadius: 9999, background: C.pLuteal }} /> luteal</span>
      </div>
    </div>
  );
}

function WeekPill({ week, viewYear, viewMonth, onDayTap }) {
  // Determine gradient: blend across phases present in the week (skip blanks)
  const phases = week.filter((d) => !d.blank).map((d) => d.phase);
  let bg;
  if (phases.length === 0) bg = C.paper;
  else if (phases.every((p) => p === phases[0])) bg = PHASE_DEEP[phases[0]];
  else {
    const unique = [...new Set(phases)];
    const stops = unique.map((p, i) => `${PHASE_DEEP[p]} ${Math.round(100 * i / Math.max(1, unique.length - 1))}%`);
    bg = `linear-gradient(90deg, ${stops.join(", ")})`;
  }
  return (
    <div style={{ ...weekPillStyle, background: bg }}>
      {week.map((d, i) => {
        if (d.blank) return <span key={i} style={dayBlank} />;
        const iso = d.date.toISOString().split("T")[0];
        const isToday = (d.date.getDate() === today.getDate() && d.date.getMonth() === today.getMonth() && d.date.getFullYear() === today.getFullYear());
        return (
          <button key={i} onClick={() => onDayTap(iso)} style={isToday ? dayTileToday : dayTile} aria-label={`Day ${d.day}, ${d.phase}`}>
            <span style={{ ...dayNum, color: isToday ? C.espresso : "rgba(255,255,255,0.95)" }}>{d.day}</span>
            <span style={{ ...daySymptomDash, background: isToday ? "rgba(58,44,26,0.30)" : "rgba(255,255,255,0.45)" }} />
          </button>
        );
      })}
    </div>
  );
}

function DayDetailSheet({ iso, onClose }) {
  if (!iso) return null;
  const date = new Date(iso);
  const isToday = iso === todayISO;
  const isPast = date < new Date(todayISO);
  const isFuture = date > new Date(todayISO);
  const phase = phaseForCalDay(date.getDate());
  const cycleDay = (() => {
    const todayDom = today.getDate();
    return ((date.getDate() - todayDom + profile.cycleDay - 1 + profile.cycleLen * 3) % profile.cycleLen) + 1;
  })();
  const phaseHint = {
    menstrual: "Inner winter. Slow, soft, restorative.",
    follicular: "Inner spring. Curious, building, fresh.",
    ovulatory: "Peak energy window. Visibility, bold asks, creative output.",
    luteal: "Inner autumn. Reflective, narrowing, finishing.",
  }[phase];
  return (
    <div style={modalBackdrop} onClick={onClose}>
      <div style={{ ...modalCard, maxHeight: "85vh", overflowY: "auto", maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
        <div style={modalHead}>
          <button onClick={onClose} style={dayBackBtn} aria-label="Back"><ArrowLeft size={14} /></button>
          <span style={dayDateHead}>
            {date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
          </span>
          <button style={dayEditBtn}>Edit</button>
        </div>
        <h3 style={modalTitle}>{phase[0].toUpperCase() + phase.slice(1)} · Day {cycleDay}</h3>

        <Section name="PHASE SUMMARY">
          <div style={{ padding: "12px 14px", borderRadius: 12, background: `${PHASE_LIGHT[phase]}22`, border: `1px solid ${PHASE_LIGHT[phase]}55` }}>
            <span style={{ ...phaseChip, background: `${PHASE_LIGHT[phase]}33`, color: C.espresso }}>
              <span style={{ width: 6, height: 6, borderRadius: 9999, background: PHASE_LIGHT[phase], marginRight: 5 }} />
              {phase[0].toUpperCase() + phase.slice(1)}
            </span>
            <p style={{ ...astraShort, marginTop: 6 }}>{phaseHint}</p>
          </div>
        </Section>

        {!isFuture && (
          <Section name="WHAT HAPPENED">
            <div style={dayInfoRow}>
              <span style={dayInfoChip}><Smile size={11} style={{ color: C.rose }} /> Mood · Good</span>
              <span style={dayInfoChip}><Zap size={11} style={{ color: C.goldDeep }} /> Energy · High</span>
              <span style={dayInfoChip}><Moon size={11} style={{ color: C.muted }} /> Sleep · 7h</span>
            </div>
            <p style={daySoftLine}><b>Symptoms:</b> None logged</p>
            <p style={daySoftLine}><b>Intention:</b> "Show up fully today"</p>
          </Section>
        )}

        {!isFuture && (
          <Section name="SCHEDULE">
            <ul style={{ ...bulletList, gap: 4 }}>
              <li style={bulletLine}><Check size={11} style={{ color: C.sage }} /> 7am Morning stretch</li>
              <li style={bulletLine}><Check size={11} style={{ color: C.sage }} /> 8am Folic acid</li>
              <li style={bulletLine}><Check size={11} style={{ color: C.sage }} /> 10am Deep work block</li>
              <li style={bulletLine}><Check size={11} style={{ color: C.sage }} /> 12pm Lunch + walk</li>
              <li style={bulletLine}><CircleDot size={11} style={{ color: C.muted }} /> 2pm Antenatal class</li>
            </ul>
          </Section>
        )}

        {!isFuture && (
          <Section name="HABITS">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              <span style={dayInfoChip}><Check size={10} style={{ color: C.sage }} /> Morning movement</span>
              <span style={dayInfoChip}><Check size={10} style={{ color: C.sage }} /> Gratitude</span>
              <span style={dayInfoChip}><CircleDot size={10} style={{ color: C.muted }} /> Hydration</span>
            </div>
          </Section>
        )}

        {!isFuture && (
          <Section name="NOTES / JOURNAL">
            <p style={daySoftLine}>"Felt really energised at the standup..."</p>
            <button style={openEntryBtn}>View full entry <ChevronRight size={12} /></button>
          </Section>
        )}

        {isFuture && (
          <Section name="PREDICTED">
            <p style={daySoftLine}>Predicted phase: <b>{phase[0].toUpperCase() + phase.slice(1)}</b> · Day {cycleDay}</p>
            <p style={daySoftLine}>You'll likely feel {phaseHintCapacity(phase)} that day.</p>
          </Section>
        )}

        <div style={dayActionRow}>
          <button style={dayPrimaryBtn}>Plan this day</button>
          {!isFuture && <button style={daySecondaryBtn}>Log symptoms</button>}
        </div>
      </div>
    </div>
  );
}

function phaseHintCapacity(p) {
  return {
    menstrual: "softer and slower",
    follicular: "rising and curious",
    ovulatory: "energised and bold",
    luteal: "narrowing and reflective",
  }[p];
}

// ─────────────────────────────────────────────────────────────────────────────
// Floating add button + popup
// ─────────────────────────────────────────────────────────────────────────────
function AddFAB({ onClick }) {
  return (
    <button onClick={onClick} style={fabStyle} aria-label="Quick add">
      <Plus size={26} style={{ color: C.cream }} />
    </button>
  );
}

const ADD_TYPES = [
  { id: "habit",     label: "Habit",       sub: "Movement or recurring action", Icon: Footprints,    tone: C.sage },
  { id: "task",      label: "Task",        sub: "Work or personal to-do",        Icon: ListChecks,    tone: C.espresso },
  { id: "med",       label: "Medication",  sub: "Med or supplement",             Icon: Pill,          tone: C.blush },
  { id: "meal",      label: "Meal",        sub: "Plan or log a meal",            Icon: Utensils,      tone: C.gold },
  { id: "event",     label: "Event",       sub: "Appointment or calendar",       Icon: CalendarClock, tone: C.goldDeep },
  { id: "ritual",    label: "Ritual",      sub: "Bundle for this phase",         Icon: Sparkles,      tone: C.muted },
  { id: "hydration", label: "Hydration",   sub: "Log a glass of water",          Icon: Droplets,      tone: "#60B4FA" },
  { id: "note",      label: "Note",        sub: "Quick journal entry",           Icon: StickyNote,    tone: C.espresso },
  { id: "checkin",   label: "Check-in",    sub: "Mood, energy, sleep",           Icon: Smile,         tone: C.rose },
  { id: "symptom",   label: "Symptom",     sub: "Log a body signal",             Icon: Stethoscope,   tone: C.pMenstrual },
];

function AddPopup({ open, onClose }) {
  const [voiceState, setVoiceState] = useState("idle"); // idle | listening | parsed | error
  const [transcript, setTranscript] = useState("");
  const [parsed, setParsed] = useState(null);
  const [picked, setPicked] = useState(null); // ADD_TYPES item
  const recRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setVoiceState("idle");
      setTranscript("");
      setParsed(null);
      setPicked(null);
      try { recRef.current && recRef.current.abort(); } catch {}
    }
  }, [open]);

  function startListening() {
    if (typeof window === "undefined") return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setVoiceState("error");
      setTranscript("Speech recognition isn't available in this browser. Try Chrome on desktop or your phone.");
      return;
    }
    const rec = new SR();
    rec.lang = "en-GB";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setTranscript(t);
      setParsed(parseVoice(t));
      setVoiceState("parsed");
    };
    rec.onerror = (e) => {
      setVoiceState("error");
      setTranscript("Couldn't hear that — try again. (" + e.error + ")");
    };
    rec.onend = () => { if (voiceState === "listening") setVoiceState("idle"); };
    recRef.current = rec;
    setVoiceState("listening");
    setTranscript("");
    rec.start();
  }
  function confirm() {
    setVoiceState("idle");
    setTranscript("Added to your schedule.");
    setParsed(null);
    setTimeout(() => { onClose(); setTranscript(""); }, 900);
  }

  if (!open) return null;

  return (
    <div style={addBackdrop} onClick={onClose}>
      <div style={addPopup} onClick={(e) => e.stopPropagation()}>
        <div style={addHead}>
          <span style={kicker}>QUICK ADD</span>
          <button onClick={onClose} style={drawerCloseBtn} aria-label="Close"><X size={14} /></button>
        </div>

        <div style={addGrid}>
          {/* Left — Voice */}
          <div style={voicePane}>
            <button
              onClick={voiceState === "listening" ? () => { try { recRef.current && recRef.current.stop(); } catch {} } : startListening}
              style={{
                ...voiceMicWrap,
                background: voiceState === "listening" ? `${C.gold}33` : `${C.gold}1F`,
                border: `1.5px solid ${C.gold}`,
                animation: voiceState === "listening" ? "fwPulse 1.4s ease-in-out infinite" : "none",
              }}
            >
              <Mic size={32} style={{ color: C.goldDeep }} />
            </button>
            <style>{`@keyframes fwPulse { 0%,100% { box-shadow: 0 0 0 0 ${C.gold}66; } 50% { box-shadow: 0 0 0 14px ${C.gold}00; } }`}</style>
            <h3 style={voiceTitle}>Voice schedule</h3>
            <p style={voiceSub}>
              {voiceState === "idle"      && "Tap and tell me what to add"}
              {voiceState === "listening" && <Waveform />}
              {voiceState === "parsed"    && (transcript ? `"${transcript}"` : "")}
              {voiceState === "error"     && transcript}
            </p>
            {voiceState === "parsed" && parsed && (
              <div style={parsedCard}>
                <span style={kicker}>I HEARD</span>
                <div style={parsedLine}>
                  <span style={parsedChip}>{parsed.title}</span>
                  {parsed.duration && <span style={parsedChip}>{parsed.duration} min</span>}
                  {parsed.when && <span style={parsedChip}>{parsed.when}</span>}
                  {parsed.type && <span style={parsedChip}>{parsed.type}</span>}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <button onClick={() => { setVoiceState("idle"); setTranscript(""); }} style={modalCancelBtn}>Redo</button>
                  <button onClick={confirm} style={modalSaveBtn}>Add this</button>
                </div>
              </div>
            )}
          </div>

          {/* Right — manual add cards */}
          <div style={manualPane}>
            <span style={kicker}>OR PICK A TYPE</span>
            <div style={manualGrid}>
              {ADD_TYPES.map((t) => (
                <button key={t.id} onClick={() => setPicked(t)} style={manualCard}>
                  <span style={{ ...manualIcon, background: `${t.tone}1F`, color: t.tone }}>
                    <t.Icon size={14} />
                  </span>
                  <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                    <div style={manualLabel}>{t.label}</div>
                    <div style={manualSub}>{t.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {picked && (
          <GenericAddSheet
            type={picked}
            onClose={() => setPicked(null)}
            onSaved={() => { setPicked(null); onClose(); }}
          />
        )}
      </div>
    </div>
  );
}

function Waveform() {
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
      <style>{`@keyframes fwBar { 0%,100% { height: 4px; } 50% { height: 14px; } }`}</style>
      {[0, 80, 160, 240, 320].map((d) => (
        <span key={d} style={{
          width: 3, height: 4, background: C.goldDeep, borderRadius: 9999,
          animation: `fwBar 800ms ease-in-out ${d}ms infinite`,
        }} />
      ))}
      <span style={{ marginLeft: 8, fontSize: 12, color: C.goldDeep, fontWeight: 700 }}>Listening…</span>
    </span>
  );
}

function parseVoice(text) {
  const t = text.toLowerCase();
  let duration = null;
  const dm = t.match(/(\d+)\s*(min|mins|minute|minutes|m\b)/);
  if (dm) duration = parseInt(dm[1], 10);
  let when = null;
  if (t.includes("tomorrow")) when = "tomorrow";
  else if (t.includes("tonight")) when = "tonight";
  else if (t.includes("today")) when = "today";
  const tm = t.match(/at\s+(\d{1,2})(:\d{2})?\s*(am|pm)?/);
  if (tm) when = (when ? when + " " : "") + tm[0].trim();
  let type = "task";
  if (/walk|run|stretch|yoga|gym|workout|movement/.test(t)) type = "habit";
  else if (/take\s|pill|capsule|supplement|magnesium|vitamin/.test(t)) type = "med";
  else if (/lunch|dinner|breakfast|meal|snack/.test(t)) type = "meal";
  else if (/call|meeting|appointment|class/.test(t)) type = "event";
  // title = strip "add" prefix
  const title = text.replace(/^add\s+a?\s*/i, "").replace(/\s+at\s+\d.*$/i, "").trim();
  return { title: title || text, duration, when, type };
}

function GenericAddSheet({ type, onClose, onSaved }) {
  const [name, setName] = useState("");
  return (
    <div style={modalBackdrop} onClick={onClose}>
      <div style={modalCard} onClick={(e) => e.stopPropagation()}>
        <div style={modalHead}>
          <span style={kicker}>ADD · {type.label.toUpperCase()}</span>
          <button onClick={onClose} style={drawerCloseBtn} aria-label="Close"><X size={14} /></button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ ...manualIcon, background: `${type.tone}1F`, color: type.tone, width: 40, height: 40 }}>
            <type.Icon size={18} />
          </span>
          <div>
            <h3 style={{ ...modalTitle, margin: 0 }}>{type.label}</h3>
            <p style={{ fontSize: 12, color: C.muted, margin: "2px 0 0" }}>{type.sub}</p>
          </div>
        </div>
        <label style={{ display: "block", marginBottom: 10 }}>
          <span style={miniLabel}>NAME</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={`e.g. ${exampleFor(type.id)}`} style={modalInput} autoFocus />
        </label>
        <div style={modalFoot}>
          <button onClick={onClose} style={modalCancelBtn}>Cancel</button>
          <button onClick={onSaved} disabled={!name.trim()} style={{
            ...modalSaveBtn, opacity: name.trim() ? 1 : 0.4, cursor: name.trim() ? "pointer" : "not-allowed",
          }}>Save</button>
        </div>
      </div>
    </div>
  );
}
function exampleFor(id) {
  return {
    habit: "Evening stretch · 10 min",
    task: "Reply to investor email",
    med: "Vitamin D 2000IU · 9am",
    meal: "Sunday roast",
    event: "GP appointment · Tuesday 4pm",
    ritual: "Sunday slow-down",
    hydration: "1 glass",
    note: "Today's energy was…",
    checkin: "Buoyant · 8 / 10 energy",
    symptom: "Light headache",
  }[id];
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic primitives
// ─────────────────────────────────────────────────────────────────────────────
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
    if (child) track.scrollTo({ left: child.offsetLeft - track.offsetLeft, behavior: "smooth" });
  }
  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    let best = 0, bestDist = Infinity;
    Array.from(track.children).forEach((el, i) => {
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
          <button onClick={() => jumpTo(idx - 1)} style={sliderArrow}><ChevronLeft size={14} /></button>
          {Array.from({ length: count }).map((_, i) => (
            <span key={i} style={{ ...sliderDot, background: i === idx ? C.espresso : "rgba(58,44,26,0.20)" }} />
          ))}
          <button onClick={() => jumpTo(idx + 1)} style={sliderArrow}><ChevronRight size={14} /></button>
        </div>
      </div>
      <div ref={trackRef} onScroll={onScroll} style={sliderTrack}>
        {Children.map(children, (child, i) => <div key={i} style={sliderSlot}>{child}</div>)}
      </div>
    </section>
  );
}

function Section({ name, children }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={sectionLine}>
        <span style={sectionLineRule} />
        <span style={sectionLabel}>{name}</span>
        <span style={sectionLineRule} />
      </div>
      {children}
    </div>
  );
}

function CheckboxRow({ checked, onChange, text, children }) {
  return (
    <label style={checkboxRow}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ accentColor: C.sage }} />
      <span style={{
        flex: 1, fontSize: 13, color: C.espresso,
        textDecoration: checked ? "line-through" : "none",
        opacity: checked ? 0.5 : 1,
      }}>{text}</span>
      {children}
    </label>
  );
}

function DemoFooter() {
  return (
    <div style={demoFooter}>
      <span style={kicker}>DEMO · UNIFIED PLANNER v2</span>
      <p style={demoFooterText}>
        Pill tabs (Morning · Afternoon · Evening) for time-of-day stacks.
        Secondary tabs (Schedule · Cycle) for full-panel views. Floating
        + opens voice scheduling + quick-add. Not wired to production.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const shell = {
  background: C.cream, minHeight: "100vh", paddingBottom: 120,
  fontFamily: "'Inter', system-ui, sans-serif",
  position: "relative",
};
const headerStyle = {
  padding: "20px 16px 8px", background: C.cream,
};
const greetingRow = { display: "flex", alignItems: "center", gap: 8 };
const greetingText = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 22, fontWeight: 700, color: C.espresso, margin: 0, letterSpacing: "-0.01em",
};
const greetingSub = { fontSize: 13, color: C.muted, marginTop: 4 };

const primaryTabWrap = {
  padding: "10px 16px 4px",
  display: "flex", justifyContent: "center",
};
const primaryTabStrip = {
  display: "inline-flex", gap: 4, padding: 4,
  borderRadius: 9999, background: C.paperHi,
  border: "1px solid rgba(58,44,26,0.10)",
};
const primaryTabBtn = {
  padding: "8px 22px", borderRadius: 9999, border: "none",
  fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 700,
  letterSpacing: "0.04em", cursor: "pointer",
  transition: "all 200ms ease",
};
const secondaryTabWrap = {
  padding: "6px 16px 12px",
  display: "flex", justifyContent: "center", gap: 8,
};
const secondaryTabBtn = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "6px 14px", borderRadius: 9999,
  border: "1px solid",
  fontFamily: "'Inter', sans-serif", fontSize: 11.5, fontWeight: 700,
  letterSpacing: "0.04em", cursor: "pointer",
};

const contentWrap = {
  padding: "0 16px",
  display: "flex", flexDirection: "column", gap: 12,
  maxWidth: 720, margin: "0 auto",
};

// Card primitive
const cardStyle = {
  background: C.paperHi,
  borderRadius: 16, padding: 16,
  boxShadow: "0 2px 8px rgba(58,44,26,0.08)",
  display: "flex", flexDirection: "column", gap: 8,
  boxSizing: "border-box",
};
const cardHeadRow = { display: "flex", alignItems: "center", gap: 8 };
const cardTitle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 17, fontWeight: 500, color: C.espresso,
  margin: "2px 0", lineHeight: 1.25, letterSpacing: "-0.005em", flex: 1,
};
const kicker = {
  fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
  color: C.muted, fontWeight: 700,
};
const astraTag = { marginLeft: "auto", fontSize: 9, color: C.muted, fontStyle: "italic" };

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
const ringTitle = { fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, fontWeight: 500, color: C.espresso };
const ringSub = { fontSize: 11, color: C.muted, marginTop: 2, fontStyle: "italic" };
const miniChipRow = { display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 };
const miniChip = {
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "4px 10px", borderRadius: 9999,
  background: C.cream, border: "1px solid rgba(58,44,26,0.10)",
  color: C.espresso, fontSize: 11, fontWeight: 600, cursor: "pointer",
};
const bodyGridStyle = {
  display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5, marginTop: 8,
};
const bodyTile = {
  display: "flex", alignItems: "center", gap: 5,
  padding: "6px 8px", borderRadius: 8,
  background: C.cream, border: "1px solid rgba(58,44,26,0.05)",
};
const bodyIcon = {
  width: 20, height: 20, borderRadius: 6,
  display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};
const bodyValue = { fontSize: 11, fontWeight: 700, color: C.espresso, lineHeight: 1.1 };
const bodyLabel = {
  fontSize: 8.5, letterSpacing: "0.12em", textTransform: "uppercase",
  color: C.muted, fontWeight: 600, marginTop: 1,
};

// Sections
const sectionLine = { display: "flex", alignItems: "center", gap: 6, padding: "6px 0", color: C.muted };
const sectionLineRule = { flex: 1, height: 1, background: "rgba(58,44,26,0.10)" };
const sectionLabel = { fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: C.muted };

// Checkbox
const checkboxRow = { display: "flex", alignItems: "center", gap: 8, padding: "5px 0" };
const streakRow = { display: "inline-flex", alignItems: "center", gap: 3, marginLeft: "auto" };
const streakDot = { width: 4, height: 4, borderRadius: 9999, background: C.gold };
const streakLabel = { fontSize: 9.5, color: C.muted, fontWeight: 600, marginLeft: 4 };
const sourceChip = {
  marginLeft: "auto",
  fontSize: 9, fontWeight: 700, letterSpacing: "0.10em",
  padding: "2px 6px", borderRadius: 9999,
  background: C.cream, color: C.muted,
};
const medTimeChip = { marginLeft: "auto", fontSize: 10, color: C.muted, fontWeight: 600 };
const addTaskInput = {
  width: "100%", padding: "7px 10px", marginTop: 6,
  borderRadius: 9999, background: C.cream,
  border: "1px dashed rgba(58,44,26,0.20)",
  fontFamily: "'Inter', sans-serif", fontSize: 12,
  color: C.espresso, outline: "none",
  boxSizing: "border-box",
};

// Bullets
const bulletList = {
  listStyle: "none", padding: 0, margin: "4px 0 0",
  display: "flex", flexDirection: "column", gap: 6,
};
const bulletLine = {
  display: "flex", alignItems: "flex-start", gap: 8,
  fontSize: 13, color: C.espresso, lineHeight: 1.45,
};
const bulletDot = {
  width: 5, height: 5, borderRadius: 9999, background: C.gold,
  marginTop: 7, flexShrink: 0,
};

// Ritual / Slider
const sliderShell = { marginTop: 4 };
const sliderHead = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  marginBottom: 6,
};
const sliderNav = { display: "flex", alignItems: "center", gap: 5 };
const sliderArrow = {
  width: 22, height: 22, borderRadius: 9999,
  background: "transparent", border: "none", color: C.muted, cursor: "pointer",
  display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0,
};
const sliderDot = { width: 6, height: 6, borderRadius: 9999 };
const sliderTrack = {
  display: "flex", overflowX: "auto",
  scrollSnapType: "x mandatory", gap: 12,
  scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
};
const sliderSlot = { flex: "0 0 calc(100% - 24px)", scrollSnapAlign: "start" };

const createRitualCard = {
  background: C.paper,
  border: `2px dashed ${C.gold}`,
  borderRadius: 16, padding: 16,
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  gap: 6, cursor: "pointer", fontFamily: "inherit",
  minHeight: 200, boxSizing: "border-box",
};
const createRitualIcon = {
  width: 48, height: 48, borderRadius: 9999,
  background: `${C.gold}1F`, display: "inline-flex", alignItems: "center", justifyContent: "center",
};
const createRitualTitle = { fontFamily: "'Fraunces', Georgia, serif", fontSize: 17, fontWeight: 500, color: C.espresso };
const createRitualSub = { fontSize: 11, color: C.muted, fontStyle: "italic", textAlign: "center" };
const countChip = {
  marginLeft: "auto", fontSize: 9, fontWeight: 700, letterSpacing: "0.10em",
  padding: "3px 8px", borderRadius: 9999,
};
const countChipSm = {
  marginLeft: "auto", fontSize: 9, fontWeight: 700, letterSpacing: "0.10em",
  padding: "3px 8px", borderRadius: 9999,
  background: C.cream, color: C.muted, border: "1px solid rgba(58,44,26,0.10)",
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
  marginTop: 6, padding: "8px 14px", borderRadius: 9999,
  border: "1px solid",
  fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
  cursor: "pointer",
};

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
  fontSize: 10, color: C.sage, fontWeight: 700, alignSelf: "flex-start",
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

// Meals
const mealRow = { display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0" };
const mealLabel = { fontSize: 12, fontWeight: 700, color: C.espresso, letterSpacing: "0.04em" };
const mealValue = { fontSize: 11.5, color: C.muted, marginTop: 1, lineHeight: 1.4 };
const tipText = {
  fontFamily: "Georgia, serif", fontStyle: "italic",
  fontSize: 12, color: C.muted, margin: "8px 0 0", lineHeight: 1.55,
};

// Tonight
const reflectionRow = { display: "flex", flexDirection: "column", gap: 3, margin: "8px 0" };
const reflectionLabel = { fontSize: 11, color: C.muted, fontWeight: 600 };
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
const sleepLastNight = { padding: "8px 10px", borderRadius: 10, background: C.cream, marginTop: 4 };
const sleepLastNightText = { fontSize: 12, color: C.espresso, margin: "2px 0 0" };

// Schedule
const schedHead = { textAlign: "left", marginBottom: 4 };
const schedTitle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 22, fontWeight: 500, color: C.espresso,
  letterSpacing: "-0.01em", margin: "4px 0 0", lineHeight: 1.2,
};
const schedSub = { fontSize: 12, color: C.muted, margin: "4px 0 0", fontStyle: "italic" };
const schedGrid = {
  display: "flex", flexDirection: "column",
  marginTop: 8,
};
const schedHourRow = {
  display: "grid", gridTemplateColumns: "48px 14px 1fr",
  gap: 6, alignItems: "stretch",
  minHeight: 38, padding: "2px 0",
};
const schedHourLabel = {
  fontSize: 10, color: C.muted, fontWeight: 600, textAlign: "right", letterSpacing: "0.04em",
  alignSelf: "flex-start", paddingTop: 4,
};
const schedRailCol = { position: "relative", display: "flex", justifyContent: "center" };
const schedRail = {
  width: 4, height: "100%", borderRadius: 9999, minHeight: 36,
};
const schedRailDot = {
  position: "absolute", left: "50%", transform: "translate(-50%, -50%)",
  width: 10, height: 10, borderRadius: 9999, background: C.espresso,
  boxShadow: `0 0 0 2px ${C.cream}`,
};
const schedNowLine = {
  position: "absolute", left: 12, right: -200, height: 1,
  background: C.espresso, opacity: 0.30,
};
const schedBlockCol = { display: "flex", flexDirection: "column", gap: 4, justifyContent: "flex-start" };
const schedBlock = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "6px 10px 6px 8px", borderRadius: 10,
  background: "transparent", border: "none", cursor: "pointer",
  fontFamily: "inherit", textAlign: "left",
  width: "100%",
};
const schedBlockIcon = {
  width: 22, height: 22, borderRadius: 9999,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const schedBlockTitle = {
  fontSize: 12.5, fontWeight: 700, color: C.espresso,
  display: "flex", alignItems: "center", lineHeight: 1.2,
};
const schedBlockMeta = {
  fontSize: 9, letterSpacing: "0.10em", color: C.muted, fontWeight: 600, marginTop: 2,
};
const anchorPill = {
  fontSize: 8.5, fontWeight: 700, letterSpacing: "0.14em",
  padding: "2px 6px", borderRadius: 9999,
  background: `${C.gold}33`, color: C.goldDeep,
  marginLeft: 4,
};
const schedEmptySlot = {
  display: "inline-flex", alignItems: "center", gap: 4,
  background: "transparent",
  color: "rgba(58,44,26,0.30)",
  border: "1px dashed rgba(58,44,26,0.18)",
  borderRadius: 9999, padding: "4px 10px",
  fontSize: 10, fontWeight: 700, cursor: "pointer",
  alignSelf: "flex-start", margin: "2px 0",
};

// Cycle panel
const calHeadRow = {
  display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
};
const calTitle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 22, fontWeight: 500, color: C.espresso,
  margin: 0, lineHeight: 1.1, letterSpacing: "-0.01em",
};
const calSub = { fontSize: 11, color: C.muted, marginTop: 4, letterSpacing: "0.10em", fontWeight: 700 };
const calNavBtn = {
  width: 32, height: 32, borderRadius: 9999,
  background: C.paperHi, border: "1px solid rgba(58,44,26,0.10)",
  color: C.espresso, cursor: "pointer",
  display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0,
};
const dowRow = {
  display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4,
  padding: "4px 6px",
};
const dowLabel = {
  fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: "0.10em", textAlign: "center",
};
const weekStack = {
  display: "flex", flexDirection: "column", gap: 8, marginTop: 4,
};
const weekPillStyle = {
  display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4,
  padding: 8, borderRadius: 16,
  boxShadow: "0 2px 8px rgba(58,44,26,0.10)",
};
const dayBlank = { display: "block", height: 36 };
const dayTile = {
  background: "transparent", border: "none", padding: "8px 0",
  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
  cursor: "pointer", fontFamily: "inherit",
};
const dayTileToday = {
  ...{ background: "#FFFFFF", border: "none", padding: "8px 0",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
    cursor: "pointer", fontFamily: "inherit",
    borderRadius: 10,
    boxShadow: "0 2px 8px rgba(58,44,26,0.15)",
  },
};
const dayNum = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 16, fontWeight: 500,
};
const daySymptomDash = {
  width: 14, height: 2, borderRadius: 9999,
};
const cycleLegendRow = {
  display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14, padding: "0 4px",
};
const cycleLegendChip = {
  display: "inline-flex", alignItems: "center", gap: 6,
  fontSize: 11, color: C.espresso, fontWeight: 600, textTransform: "capitalize",
};

// Day detail sheet
const dayBackBtn = {
  width: 28, height: 28, borderRadius: 9999,
  background: C.paperHi, border: "1px solid rgba(58,44,26,0.12)",
  color: C.espresso, cursor: "pointer",
  display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0,
};
const dayDateHead = {
  flex: 1, textAlign: "center",
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 14, fontWeight: 500, color: C.espresso,
};
const dayEditBtn = {
  padding: "5px 12px", borderRadius: 9999,
  background: "transparent", border: "1px solid rgba(58,44,26,0.18)",
  color: C.espresso, fontSize: 11, fontWeight: 700, cursor: "pointer",
};
const dayInfoRow = { display: "flex", flexWrap: "wrap", gap: 5 };
const dayInfoChip = {
  display: "inline-flex", alignItems: "center", gap: 4,
  fontSize: 11, color: C.espresso, fontWeight: 600,
  padding: "3px 9px", borderRadius: 9999,
  background: C.cream, border: "1px solid rgba(58,44,26,0.08)",
};
const daySoftLine = { fontSize: 12, color: C.espresso, margin: "6px 0 0", lineHeight: 1.5 };
const openEntryBtn = {
  alignSelf: "flex-start", marginTop: 4,
  display: "inline-flex", alignItems: "center", gap: 4,
  background: "transparent", border: "none",
  color: C.espresso, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0,
};
const dayActionRow = { display: "flex", gap: 8, marginTop: 14 };
const dayPrimaryBtn = {
  flex: 1, padding: "11px 14px", borderRadius: 9999,
  background: C.espresso, color: C.cream, border: "1px solid " + C.espresso,
  fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", cursor: "pointer",
};
const daySecondaryBtn = {
  flex: 1, padding: "11px 14px", borderRadius: 9999,
  background: "transparent", color: C.espresso, border: "1px solid rgba(58,44,26,0.18)",
  fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", cursor: "pointer",
};

// FAB + popup
const fabStyle = {
  position: "fixed", right: 20,
  bottom: "calc(90px + env(safe-area-inset-bottom, 0px))",
  width: 56, height: 56, borderRadius: 9999,
  background: C.gold, color: C.cream,
  border: "none", cursor: "pointer",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  boxShadow: "0 4px 16px rgba(212,175,55,0.40)",
  zIndex: 60,
};
const addBackdrop = {
  position: "fixed", inset: 0,
  background: "rgba(58,44,26,0.45)", zIndex: 90,
  display: "flex", alignItems: "flex-end", justifyContent: "center",
  padding: "0 0 max(16px, env(safe-area-inset-bottom))",
};
const addPopup = {
  width: "100%", maxWidth: 760,
  background: C.cream,
  borderRadius: "22px 22px 0 0",
  padding: "16px 18px 22px",
  boxShadow: "0 -10px 32px rgba(58,44,26,0.20)",
  fontFamily: "'Inter', system-ui, sans-serif",
  maxHeight: "85vh", overflowY: "auto",
};
const addHead = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  marginBottom: 8,
};
const addGrid = {
  display: "grid", gridTemplateColumns: "1fr 1.2fr",
  gap: 14, alignItems: "start",
};
const voicePane = {
  display: "flex", flexDirection: "column", alignItems: "center",
  padding: 16, borderRadius: 14,
  background: C.paperHi, border: `1px solid ${C.gold}33`,
  textAlign: "center", gap: 6,
};
const voiceMicWrap = {
  width: 84, height: 84, borderRadius: 9999,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer",
};
const voiceTitle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 17, fontWeight: 500, color: C.espresso, margin: "8px 0 0",
};
const voiceSub = { fontSize: 12, color: C.muted, margin: "4px 0 0" };
const parsedCard = {
  marginTop: 10, padding: "10px 12px", borderRadius: 12,
  background: C.cream, border: `1px solid ${C.gold}55`,
  width: "100%", boxSizing: "border-box",
};
const parsedLine = { display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 };
const parsedChip = {
  display: "inline-flex", alignItems: "center",
  padding: "3px 9px", borderRadius: 9999,
  background: C.paperHi, fontSize: 11, color: C.espresso, fontWeight: 700,
  border: "1px solid rgba(58,44,26,0.10)",
};

const manualPane = { display: "flex", flexDirection: "column", gap: 8 };
const manualGrid = {
  display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
  gap: 6, marginTop: 4,
};
const manualCard = {
  display: "flex", alignItems: "center", gap: 8,
  padding: 10, borderRadius: 12,
  background: C.paperHi, border: "1px solid rgba(58,44,26,0.10)",
  cursor: "pointer", fontFamily: "inherit",
};
const manualIcon = {
  width: 28, height: 28, borderRadius: 9,
  display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};
const manualLabel = { fontSize: 12.5, fontWeight: 700, color: C.espresso, lineHeight: 1.1 };
const manualSub = { fontSize: 10, color: C.muted, marginTop: 2, lineHeight: 1.3 };

// Modal (shared)
const modalBackdrop = {
  position: "fixed", inset: 0,
  background: "rgba(58,44,26,0.40)", zIndex: 95,
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
  display: "flex", alignItems: "center", justifyContent: "space-between",
  gap: 8, marginBottom: 4,
};
const drawerCloseBtn = {
  width: 28, height: 28, borderRadius: 9999,
  background: C.paperHi, border: "1px solid rgba(58,44,26,0.12)",
  color: C.muted,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", flexShrink: 0,
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
const chipRowSpacing = { display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 };
const modalChip = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "6px 12px", borderRadius: 9999,
  border: "1px solid",
  fontSize: 11.5, fontWeight: 600, cursor: "pointer",
  fontFamily: "'Inter', sans-serif",
};
const modalFoot = { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 };
const modalCancelBtn = {
  display: "inline-flex", alignItems: "center", gap: 5,
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
