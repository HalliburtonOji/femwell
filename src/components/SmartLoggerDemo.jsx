// ─────────────────────────────────────────────────────────────────────────────
// SmartLoggerDemo v3 — speed & inline-everything
//
// Big v3 changes from v2:
//   • FAB hold-to-radial: press-and-hold the gold + for 400ms → 5 icons fan
//     out around it (Mood · Water · Meds · Meal · Period). Tap = instant
//     action. Regular tap (under 400ms) = opens the full sheet. FAB rotates
//     45° when the dial is open.
//   • Inside the sheet there is a top "Quick log" rail of one-tap pills
//     (Water · Meds · Period · Caffeine · Drinks). Each pill logs in place
//     and turns sage green with a "✓" confirmation. No screens.
//   • The smart suggestion is ALREADY expanded inline — 5 face buttons live
//     directly in the card. Tap a face → influence tags appear → Save in
//     place. After save the card transforms to a "Logged ✓" state.
//   • Jess insight is an inline panel that slides in below the mood card in
//     the SAME sheet — no overlay, no push navigation.
//   • Log types live in 4 collapsed accordion groups at the bottom of the
//     sheet (Body · Nourish · Health · Mind & Life). Tap a group → chips
//     expand inline.
//   • Engagement rail (Podcast / Reading / Prompt / Jess Tip) is unchanged
//     from v2 — stage-aware, dark gradient cards.
//
// Tap counts:
//   • Old v2:  FAB → sheet → tile → sub-screen → pick → save  = 5 taps
//   • New v3:  FAB → tap face inline → save                    = 2 taps
//     Speed-dial water: hold FAB → tap 💧                       = 1 hold
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import {
  Plus, X, ChevronRight, ChevronDown, ChevronUp, Sparkles, Check,
  Smile, Frown, Meh, Heart, Zap, Moon, Sun, Droplets,
  Footprints, ListChecks, Pill, Utensils, CalendarClock,
  StickyNote, Stethoscope, BookOpen, Activity, FileText,
  Thermometer, Coffee, Wine, Scale, Bed,
  Headphones, Pen,
} from "lucide-react";

const C = {
  cream:    "#F4EDDB",
  paper:    "#FBF6E6",
  paperHi:  "#FFFFFF",
  espresso: "#3A2C1A",
  blush:    "#E8B4B8",
  sage:     "#8FAF8F",
  sageDeep: "#6F8B6F",
  muted:    "#9B8B7A",
  gold:     "#D4AF37",
  goldDeep: "#A6862B",
  rose:     "#D45E52",
  plum:     "#4A2A3A",
  ink:      "#0E0E0E",
};

// ── Stage configuration ──────────────────────────────────────────────────────
const STAGES = {
  luteal: {
    id: "luteal",
    tabLabel: "🌙 Luteal D25",
    headerKicker: "FEMWELL · TUESDAY 19 MAY",
    headerSub: "Luteal · Day 25",
    headerEmoji: "🌙",
    greeting: "Good evening, Halli",
    timeBlock: "Evening · 8:42pm",
    phaseContext: "Late luteal — energy easing, mood may be tender.",
    accentLight: "#7B5E9A22",
    accentLine:  "#7B5E9A",
    moodRow: { value: 2, label: "Tender", color: C.blush },
    bodyRow: { items: ["Cramps · mild", "Bloating", "Tired"] },
    stageRow: { title: "Luteal · D25", sub: "Period predicted in 3 days · 84%" },
    smartCard: {
      kicker: "NOT LOGGED TODAY",
      question: "How's your mood right now?",
      sub: "Late luteal · mood can amplify here. Capture it in one tap.",
    },
    savedMessage: {
      headline: "Mood logged — Low 😔",
      sub: "Synced to Planner · Pulse · Jess",
    },
    insight: {
      kicker: "JESS PATTERN INSIGHT",
      body: "You've logged low mood 4 days in a row — all in your luteal phase. This could be linked to the iron supplement you've been missing.",
      cta: "Add iron reminder",
      confirmation: "Iron reminder added ✓",
      confirmationSub: "Daily nudge at 8pm during your luteal week",
    },
    rail: [
      { type: "podcast", emoji: "🎧", typeLabel: "PODCAST",       title: "PCOS & Perimenopause with Dr Sara", meta: "42 min · Saved",        cta: "Play" },
      { type: "reading", emoji: "📖", typeLabel: "READING",       title: "Iron & the luteal phase",            meta: "6 min · The Atlas",     cta: "Read" },
      { type: "prompt",  emoji: "✍️", typeLabel: "JOURNAL PROMPT", title: "What does your body need tonight?", meta: "Phase prompt · Luteal", cta: "Write" },
      { type: "jess",    emoji: "✨", typeLabel: "JESS TIP",       title: "Magnesium before bed can ease luteal cramps", meta: "30 sec read", cta: "Tell me more" },
    ],
  },
  pregnant: {
    id: "pregnant",
    tabLabel: "🤰 Pregnant T2",
    headerKicker: "FEMWELL · TUESDAY 19 MAY",
    headerSub: "Pregnant · Trimester 2 · Week 22",
    headerEmoji: "🤰",
    greeting: "Good morning, Halli",
    timeBlock: "Morning · 9:15am",
    phaseContext: "T2 — energy returning, baby's movements stronger now.",
    accentLight: "#D4AF3722",
    accentLine:  C.gold,
    moodRow: { value: 4, label: "Bright", color: C.sage },
    bodyRow: { items: ["No nausea today", "Back twinges", "Movements ↑"] },
    stageRow: { title: "Week 22 · T2", sub: "Anomaly scan was at 20w · all clear" },
    smartCard: {
      kicker: "MORNING CHECK-IN",
      question: "How's your mood right now?",
      sub: "T2 mood often steadies — track the shift in one tap.",
    },
    savedMessage: {
      headline: "Mood logged — Bright 🙂",
      sub: "Synced to Pregnancy Diary · Jess",
    },
    insight: {
      kicker: "JESS PATTERN INSIGHT",
      body: "You've logged movements 5 days straight — great consistency! Kicks are most noticeable after meals in T2.",
      cta: "Set kick reminders",
      confirmation: "Kick reminders set ✓",
      confirmationSub: "Three gentle nudges after meals",
    },
    rail: [
      { type: "podcast", emoji: "🎧", typeLabel: "PODCAST",        title: "Second trimester energy slumps explained", meta: "38 min · Mother & Baby", cta: "Play" },
      { type: "reading", emoji: "📖", typeLabel: "READING",        title: "What to expect at your 20-week scan",       meta: "8 min · NHS guide",       cta: "Read" },
      { type: "prompt",  emoji: "✍️", typeLabel: "JOURNAL PROMPT", title: "Write a letter to your baby this week",     meta: "Pregnancy diary",         cta: "Write" },
      { type: "jess",    emoji: "✨", typeLabel: "JESS TIP",       title: "Left-side sleeping from T2 improves circulation", meta: "40 sec read",       cta: "Tell me more" },
    ],
  },
  peri: {
    id: "peri",
    tabLabel: "🌸 Perimenopause",
    headerKicker: "FEMWELL · TUESDAY 19 MAY",
    headerSub: "Perimenopause · Variable",
    headerEmoji: "🌸",
    greeting: "Good afternoon, Halli",
    timeBlock: "Afternoon · 3:20pm",
    phaseContext: "Perimenopause — capacity is variable. Track patterns, not norms.",
    accentLight: "#E8B4B822",
    accentLine:  C.blush,
    moodRow: { value: 3, label: "Steady", color: C.gold },
    bodyRow: { items: ["3 hot flashes today", "Sleep 5h 40m", "Joint ache"] },
    stageRow: { title: "Peri · since 2024", sub: "GP export ready · 12 days of data" },
    smartCard: {
      kicker: "AFTERNOON CHECK-IN",
      question: "How's your mood right now?",
      sub: "Stress + heat can lift mood swings — log the moment.",
    },
    savedMessage: {
      headline: "Mood logged — Steady 😐",
      sub: "Synced to Care Bridge · GP export",
    },
    insight: {
      kicker: "JESS PATTERN INSIGHT",
      body: "You've logged 3+ hot flashes daily for 12 days. This is building a strong picture for your GP — your Doctor Export is ready to review.",
      cta: "View GP export",
      confirmation: "Opening Doctor Export ✓",
      confirmationSub: "12-day flash log + sleep + HRT timeline · PDF ready",
    },
    rail: [
      { type: "podcast", emoji: "🎧", typeLabel: "PODCAST",        title: "HRT myths busted with Dr Louise Newson", meta: "55 min · Balance",         cta: "Play" },
      { type: "reading", emoji: "📖", typeLabel: "READING",        title: "Hot flashes: why they happen & what helps", meta: "5 min · The Atlas",     cta: "Read" },
      { type: "prompt",  emoji: "✍️", typeLabel: "JOURNAL PROMPT", title: "What has surprised you most about this stage?", meta: "Peri reflection",   cta: "Write" },
      { type: "jess",    emoji: "✨", typeLabel: "JESS TIP",       title: "Cooling the room by 2°C can halve hot flash frequency", meta: "25 sec read", cta: "Tell me more" },
    ],
  },
  ttc: {
    id: "ttc",
    tabLabel: "🌱 TTC",
    headerKicker: "FEMWELL · TUESDAY 19 MAY",
    headerSub: "Trying to conceive · Cycle Day 14",
    headerEmoji: "🌱",
    greeting: "Good morning, Halli",
    timeBlock: "Morning · 7:05am",
    phaseContext: "Fertile window · Day 14 · highest-probability today + tomorrow.",
    accentLight: "#8FAF8F22",
    accentLine:  C.sage,
    moodRow: { value: 4, label: "Hopeful", color: C.sage },
    bodyRow: { items: ["BBT 36.7°C", "Egg-white mucus", "Energy ↑"] },
    stageRow: { title: "TTC · Cycle 3", sub: "Ovulation predicted today · LH+" },
    smartCard: {
      kicker: "FERTILE WINDOW · D14",
      question: "How's your mood right now?",
      sub: "Stress lifts ovulation. A quick read keeps your cycle picture clean.",
    },
    savedMessage: {
      headline: "Mood logged — Hopeful 🙂",
      sub: "Synced to Cycle · Fertility map · Jess",
    },
    insight: {
      kicker: "JESS PATTERN INSIGHT",
      body: "Your BBT pattern over 3 cycles shows a clear thermal shift around D14. Today and tomorrow are your highest-probability days.",
      cta: "See fertility summary",
      confirmation: "Fertility summary ready ✓",
      confirmationSub: "3-cycle BBT + LH chart + window prediction",
    },
    rail: [
      { type: "podcast", emoji: "🎧", typeLabel: "PODCAST",        title: "Optimising your fertile window naturally", meta: "47 min · Modern Fertility", cta: "Play" },
      { type: "reading", emoji: "📖", typeLabel: "READING",        title: "BBT charting: a beginner's guide",          meta: "7 min · The Atlas",          cta: "Read" },
      { type: "prompt",  emoji: "✍️", typeLabel: "JOURNAL PROMPT", title: "How are you feeling about this cycle?",     meta: "TTC reflection",             cta: "Write" },
      { type: "jess",    emoji: "✨", typeLabel: "JESS TIP",       title: "Stress hormones can delay ovulation by up to 3 days", meta: "35 sec read",      cta: "Tell me more" },
    ],
  },
};

// ── Speed-dial radial icons (around the FAB) ─────────────────────────────────
// Five icons fan out across a 90° arc from straight-up (90°) to straight-left (180°).
const RADIAL = [
  { id: "mood",   emoji: "😊", label: "Mood",   Icon: Smile,    angle: 90  },
  { id: "water",  emoji: "💧", label: "Water",  Icon: Droplets, angle: 112.5 },
  { id: "meds",   emoji: "💊", label: "Meds",   Icon: Pill,     angle: 135 },
  { id: "meal",   emoji: "🍽️", label: "Meal",   Icon: Utensils, angle: 157.5 },
  { id: "period", emoji: "🔴", label: "Period", Icon: Heart,    angle: 180 },
];
const RADIAL_RADIUS = 100;

// ── One-tap rail inside the sheet ────────────────────────────────────────────
// Each item shows a fresh state (untapped) and a logged state (tapped).
const QUICK_DEFS = [
  {
    id: "water", emoji: "💧", baseLabel: "+Water", Icon: Droplets, accent: "#60B4FA", startCount: 4,
    loggedText: (count) => `${count} glasses ✓`,
  },
  {
    id: "meds", emoji: "💊", baseLabel: "Meds", Icon: Pill, accent: C.blush,
    loggedText: () => "Taken ✓",
  },
  {
    id: "period", emoji: "🔴", baseLabel: "Period", Icon: Heart, accent: C.rose,
    loggedText: () => "Logged ✓",
  },
  {
    id: "caffeine", emoji: "☕", baseLabel: "+Caffeine", Icon: Coffee, accent: C.espresso, startCount: 1,
    loggedText: (count) => `${count} cups ✓`,
  },
  {
    id: "drinks", emoji: "🍷", baseLabel: "Drinks", Icon: Wine, accent: C.plum,
    loggedText: () => "Logged ✓",
  },
];

// ── Grouped log types (accordions at bottom of sheet) ────────────────────────
const LOG_GROUPS = [
  {
    id: "body", label: "Body",
    items: [
      { id: "mood",    label: "Mood",     Icon: Smile,       tone: C.rose },
      { id: "energy",  label: "Energy",   Icon: Zap,         tone: C.goldDeep },
      { id: "symptom", label: "Symptoms", Icon: Stethoscope, tone: C.plum },
      { id: "period",  label: "Period",   Icon: Droplets,    tone: C.rose },
      { id: "weight",  label: "Weight",   Icon: Scale,       tone: C.muted },
    ],
  },
  {
    id: "nourish", label: "Nourish",
    items: [
      { id: "meal",     label: "Meal",     Icon: Utensils, tone: C.gold },
      { id: "water",    label: "Water",    Icon: Droplets, tone: "#60B4FA" },
      { id: "drinks",   label: "Drinks",   Icon: Wine,     tone: C.plum },
      { id: "caffeine", label: "Caffeine", Icon: Coffee,   tone: C.espresso },
    ],
  },
  {
    id: "health", label: "Health",
    items: [
      { id: "med",   label: "Medication",  Icon: Pill,          tone: C.blush },
      { id: "supp",  label: "Supplement",  Icon: Pill,          tone: C.sage },
      { id: "sleep", label: "Sleep",       Icon: Bed,           tone: C.plum },
      { id: "appt",  label: "Appointment", Icon: CalendarClock, tone: C.goldDeep },
    ],
  },
  {
    id: "mindlife", label: "Mind & Life",
    items: [
      { id: "journal",  label: "Journal",  Icon: StickyNote, tone: C.muted },
      { id: "ritual",   label: "Ritual",   Icon: Sparkles,   tone: C.gold },
      { id: "task",     label: "Task",     Icon: ListChecks, tone: C.espresso },
      { id: "activity", label: "Activity", Icon: Footprints, tone: C.sage },
    ],
  },
];

const MOOD_FACES = [
  { v: 0, Icon: Frown, label: "Low",    color: C.rose },
  { v: 1, Icon: Frown, label: "Down",   color: "#C97A7E" },
  { v: 2, Icon: Meh,   label: "Tender", color: C.blush },
  { v: 3, Icon: Smile, label: "Steady", color: C.gold },
  { v: 4, Icon: Smile, label: "Bright", color: C.sage },
];

const INFLUENCES = ["Sleep", "Hormones", "Iron", "Stress", "Connection", "Movement", "Sun", "Caffeine"];

const RAIL_COLOURS = {
  podcast: { bg: "linear-gradient(160deg, #3D2E5C 0%, #1F1733 100%)", glyph: Headphones, accent: "#B79EE8" },
  reading: { bg: "linear-gradient(160deg, #1F3A5C 0%, #0E1A33 100%)", glyph: BookOpen,   accent: "#88B0E8" },
  prompt:  { bg: "linear-gradient(160deg, #1F3D2E 0%, #0E1F17 100%)", glyph: Pen,        accent: "#A2D8B5" },
  jess:    { bg: "linear-gradient(160deg, #4A3520 0%, #1A1410 100%)", glyph: Sparkles,   accent: C.gold },
};

// ─────────────────────────────────────────────────────────────────────────────
// Top-level component
// ─────────────────────────────────────────────────────────────────────────────
export default function SmartLoggerDemo() {
  const [stage, setStage] = useState("luteal");
  const [sheetOpen, setSheetOpen] = useState(false);

  // Walkthrough only — drives the demo through a canonical path.
  const [walkStep, setWalkStep] = useState("home");

  function changeStage(nextId) {
    setStage(nextId);
    setSheetOpen(false);
    setWalkStep("home");
  }

  function applyWalkStep(s) {
    setWalkStep(s);
    if (s === "home") setSheetOpen(false);
    else setSheetOpen(true);
  }

  return (
    <div style={{
      background: C.ink, minHeight: "100vh",
      padding: "32px 16px 80px",
      fontFamily: "'Inter', system-ui, sans-serif",
      color: C.cream,
    }}>
      {/* Headline */}
      <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <div style={{
          fontSize: 11, letterSpacing: "0.22em", fontWeight: 700,
          color: "rgba(244,237,219,0.55)", textTransform: "uppercase",
        }}>Design Lab · Concept Demo · v3</div>
        <h1 style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: 32, fontWeight: 500, color: C.cream,
          letterSpacing: "-0.02em", margin: "10px 0 8px", lineHeight: 1.1,
        }}>Smart Logger</h1>
        <p style={{
          fontSize: 14, color: "rgba(244,237,219,0.7)", lineHeight: 1.55,
          maxWidth: 560, margin: "0 auto",
        }}>
          Speed-first. Hold the FAB for a radial speed-dial · one-tap quick logs ·
          mood saves inline · Jess insight appears below — never a sub-screen.
        </p>
      </div>

      {/* Stage tabs */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 6, marginTop: 22,
        flexWrap: "wrap", padding: "0 8px",
      }}>
        {Object.values(STAGES).map((st) => {
          const active = st.id === stage;
          return (
            <button
              key={st.id}
              onClick={() => changeStage(st.id)}
              style={{
                padding: "9px 16px", borderRadius: 9999,
                border: active ? "1px solid rgba(244,237,219,0.5)" : "1px solid rgba(244,237,219,0.16)",
                background: active ? "rgba(244,237,219,0.10)" : "transparent",
                color: active ? C.cream : "rgba(244,237,219,0.7)",
                fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                letterSpacing: "0.02em",
              }}
            >{st.tabLabel}</button>
          );
        })}
      </div>

      {/* Phone */}
      <div style={{ marginTop: 32, display: "flex", justifyContent: "center" }}>
        <Phone
          stageId={stage}
          sheetOpen={sheetOpen}
          setSheetOpen={setSheetOpen}
          walkStep={walkStep}
          setWalkStep={setWalkStep}
        />
      </div>

      {/* Walkthrough */}
      <Walkthrough step={walkStep} onStep={applyWalkStep} />

      <p style={{
        textAlign: "center", maxWidth: 560, margin: "32px auto 0",
        fontSize: 11.5, color: "rgba(244,237,219,0.45)", lineHeight: 1.6,
        fontStyle: "italic",
      }}>
        Concept prototype — interactions are visual only. Hold the FAB on the phone
        for ~400ms to see the radial speed dial. Switch stages to rebuild every
        stage-aware section.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Phone — the 390px mockup
// ─────────────────────────────────────────────────────────────────────────────
function Phone({ stageId, sheetOpen, setSheetOpen, walkStep, setWalkStep }) {
  const S = STAGES[stageId];

  // FAB hold-to-radial state
  const [radialOpen, setRadialOpen] = useState(false);
  const holdTimer = useRef(null);
  const triggeredHoldRef = useRef(false);

  function startHold(e) {
    if (e && e.preventDefault) e.preventDefault();
    triggeredHoldRef.current = false;
    holdTimer.current = setTimeout(() => {
      triggeredHoldRef.current = true;
      setRadialOpen(true);
      holdTimer.current = null;
    }, 400);
  }
  function endHold() {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
      if (!radialOpen && !triggeredHoldRef.current) {
        setSheetOpen(true);
        setWalkStep("sheet");
      }
    }
  }
  function cancelHold() {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }
  useEffect(() => () => { if (holdTimer.current) clearTimeout(holdTimer.current); }, []);

  // Reset quick-log state whenever the sheet closes so the demo is replayable
  // from any starting walk step.
  const [sheetKey, setSheetKey] = useState(0);
  useEffect(() => { if (!sheetOpen) setSheetKey((k) => k + 1); }, [sheetOpen]);

  // Walkthrough → quick-log states are driven from inside LoggerSheet, but
  // we tell the sheet which walk step we're on via prop.

  // Radial icon tap handler
  function onRadialPick(id) {
    setRadialOpen(false);
    if (id === "mood" || id === "meal") {
      setSheetOpen(true);
      setWalkStep("sheet");
    }
    // water / meds / period → silent instant log (animation flashes in the
    // FAB to acknowledge — see the highlight below).
    flashFab(id);
  }

  // Brief FAB highlight after an instant radial action
  const [fabFlash, setFabFlash] = useState(null);
  function flashFab(id) {
    setFabFlash(id);
    setTimeout(() => setFabFlash(null), 1100);
  }

  return (
    <div style={{
      width: 390, minHeight: 780, position: "relative",
      borderRadius: 40,
      background: C.cream,
      boxShadow: "0 30px 80px rgba(0,0,0,0.55), 0 0 0 8px #1A1410, 0 0 0 9px rgba(212,175,55,0.18)",
      overflow: "hidden",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{
        position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)",
        width: 110, height: 26, borderRadius: 14, background: "#1A1410", zIndex: 3,
      }} />

      <div style={{
        padding: "16px 22px 6px", display: "flex", justifyContent: "space-between",
        fontSize: 12, fontWeight: 600, color: C.espresso, position: "relative", zIndex: 4,
      }}>
        <span>{S.timeBlock.split(" · ")[1]}</span>
        <span style={{ opacity: 0.5 }}>· · ·</span>
      </div>

      <PlannerBg S={S} />

      {/* Radial backdrop (closes the dial on tap) */}
      {radialOpen && (
        <div onClick={() => setRadialOpen(false)} style={{
          position: "absolute", inset: 0, zIndex: 5,
          background: "rgba(26,20,16,0.25)",
        }} />
      )}

      {/* Radial speed-dial icons */}
      {RADIAL.map((r) => {
        const rad = (r.angle * Math.PI) / 180;
        const dx = -Math.cos(rad) * RADIAL_RADIUS;
        const dy = -Math.sin(rad) * RADIAL_RADIUS;
        const finalRight = 52 - dx;      // 52 = FAB right (22) + half (30) approx
        const finalBottom = 52 - dy;
        return (
          <div key={r.id} style={{
            position: "absolute",
            right: radialOpen ? finalRight - 22 : 22,
            bottom: radialOpen ? finalBottom - 22 : 22,
            width: 44, height: 44, zIndex: 6,
            transform: radialOpen ? "scale(1)" : "scale(0.4)",
            opacity: radialOpen ? 1 : 0,
            transition: "all .26s cubic-bezier(.2,.7,.3,1.2)",
            pointerEvents: radialOpen ? "auto" : "none",
          }}>
            <button
              onClick={() => onRadialPick(r.id)}
              aria-label={r.label}
              style={{
                width: 44, height: 44, borderRadius: "50%",
                background: C.paperHi, color: C.espresso,
                border: "none", cursor: "pointer",
                boxShadow: "0 8px 18px rgba(0,0,0,0.25)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                fontSize: 18,
              }}
            >
              <span style={{ lineHeight: 1 }}>{r.emoji}</span>
            </button>
            <div style={{
              position: "absolute", top: 46, left: "50%", transform: "translateX(-50%)",
              fontSize: 9.5, fontWeight: 700, color: C.cream, letterSpacing: "0.02em",
              textShadow: "0 1px 2px rgba(0,0,0,0.6)", whiteSpace: "nowrap",
            }}>{r.label}</div>
          </div>
        );
      })}

      {/* Gold FAB */}
      <button
        aria-label="Smart logger"
        onMouseDown={startHold}
        onMouseUp={endHold}
        onMouseLeave={cancelHold}
        onTouchStart={startHold}
        onTouchEnd={endHold}
        onTouchCancel={cancelHold}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          position: "absolute", bottom: 22, right: 22, zIndex: 7,
          width: 60, height: 60, borderRadius: "50%",
          background: fabFlash ? `linear-gradient(145deg, ${C.sage}, ${C.sageDeep})` : `linear-gradient(145deg, ${C.gold}, ${C.goldDeep})`,
          border: "none", cursor: "pointer",
          boxShadow: "0 12px 28px rgba(212,175,55,0.55), 0 0 0 4px rgba(244,237,219,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: radialOpen ? "rotate(45deg)" : "rotate(0deg)",
          transition: "all .25s ease",
          touchAction: "none", userSelect: "none",
        }}
      >
        {fabFlash ? <Check size={26} style={{ color: C.cream }} strokeWidth={3} />
                  : <Plus size={28} style={{ color: C.cream }} strokeWidth={2.6} />}
      </button>

      {/* Instant-log toast */}
      {fabFlash && (
        <div style={{
          position: "absolute", bottom: 100, right: 22, zIndex: 7,
          padding: "8px 14px", borderRadius: 9999,
          background: C.espresso, color: C.cream,
          fontSize: 11.5, fontWeight: 700, letterSpacing: "0.02em",
          boxShadow: "0 8px 18px rgba(0,0,0,0.35)",
          animation: "fwToastIn .2s ease",
        }}>
          <style>{`@keyframes fwToastIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          {fabFlash === "water"  && "+1 glass ✓"}
          {fabFlash === "meds"   && "Meds taken ✓"}
          {fabFlash === "period" && "Period logged ✓"}
          {fabFlash === "mood"   && "Opening mood…"}
          {fabFlash === "meal"   && "Opening meal…"}
        </div>
      )}

      {sheetOpen && (
        <LoggerSheet
          key={sheetKey}
          S={S}
          walkStep={walkStep}
          setWalkStep={setWalkStep}
          onClose={() => { setSheetOpen(false); setWalkStep("home"); }}
        />
      )}

      {/* Bottom nav */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: 76, background: "rgba(58,44,26,0.92)",
        display: "flex", justifyContent: "space-around", alignItems: "center",
        padding: "8px 24px 18px", zIndex: 2,
      }}>
        {[
          { Icon: Sun, label: "Today" },
          { Icon: CalendarClock, label: "Planner", active: true },
          { Icon: BookOpen, label: "Lifestyle" },
          { Icon: Activity, label: "Track" },
          { Icon: FileText, label: "Care" },
        ].map((n) => (
          <div key={n.label} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            color: n.active ? C.gold : "rgba(244,237,219,0.55)",
            fontSize: 9.5, fontWeight: 600, letterSpacing: "0.04em",
          }}>
            <n.Icon size={17} />
            {n.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PlannerBg — same visible content behind the FAB
// ─────────────────────────────────────────────────────────────────────────────
function PlannerBg({ S }) {
  return (
    <div style={{ padding: "8px 18px 100px", overflow: "hidden" }}>
      <div style={{
        fontSize: 9.5, letterSpacing: "0.18em", fontWeight: 700,
        color: C.muted, textTransform: "uppercase", marginTop: 6,
      }}>{S.headerKicker}</div>
      <h2 style={{
        fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 500,
        color: C.espresso, margin: "4px 0 2px", lineHeight: 1.15, letterSpacing: "-0.01em",
      }}>{S.greeting}</h2>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "4px 10px", borderRadius: 9999,
        background: S.accentLight, border: `1px solid ${S.accentLine}55`,
        color: C.espresso, fontSize: 11, fontWeight: 600, marginTop: 2,
      }}>
        <span>{S.headerEmoji}</span> {S.headerSub}
      </div>

      <PlannerRow kicker="MOOD" title={S.moodRow.label}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {[0,1,2,3,4].map((i) => (
            <span key={i} style={{
              width: i === S.moodRow.value ? 22 : 10, height: 10, borderRadius: 9999,
              background: i === S.moodRow.value ? S.moodRow.color : "rgba(58,44,26,0.14)",
            }} />
          ))}
          <span style={{ fontSize: 11, color: C.muted, marginLeft: 8 }}>Today</span>
        </div>
      </PlannerRow>

      <PlannerRow kicker="BODY" title="Today's signals">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {S.bodyRow.items.map((b, i) => (
            <span key={i} style={{
              padding: "4px 10px", borderRadius: 9999,
              background: "rgba(58,44,26,0.06)", border: "1px solid rgba(58,44,26,0.10)",
              fontSize: 11, color: C.espresso, fontWeight: 600,
            }}>{b}</span>
          ))}
        </div>
      </PlannerRow>

      <PlannerRow kicker="STAGE" title={S.stageRow.title} sub={S.stageRow.sub} accent={S.accentLine}>
        <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 4 }}>
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} style={{
              flex: 1, height: 14, borderRadius: 4,
              background: i < 4 ? S.accentLine : `${S.accentLine}33`,
              opacity: i < 4 ? (0.55 + i * 0.1) : 0.4,
            }} />
          ))}
        </div>
      </PlannerRow>
    </div>
  );
}

function PlannerRow({ kicker, title, sub, accent, children }) {
  return (
    <div style={{
      marginTop: 14, padding: "12px 14px",
      background: C.paperHi, borderRadius: 14,
      border: "1px solid rgba(58,44,26,0.08)",
      borderLeft: accent ? `3px solid ${accent}` : "1px solid rgba(58,44,26,0.08)",
    }}>
      <div style={{
        fontSize: 9.5, letterSpacing: "0.18em", fontWeight: 700,
        color: C.muted, textTransform: "uppercase",
      }}>{kicker}</div>
      <div style={{
        fontFamily: "'Fraunces', Georgia, serif", fontSize: 15, fontWeight: 500,
        color: C.espresso, margin: "2px 0 6px",
      }}>{title}</div>
      {sub && (
        <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 6 }}>{sub}</div>
      )}
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LoggerSheet — v3, everything inline
// ─────────────────────────────────────────────────────────────────────────────
function LoggerSheet({ S, walkStep, setWalkStep, onClose }) {
  // One-tap rail state — each item tracks logged status + (for counters)
  // its current count. Initial counts come from QUICK_DEFS.startCount.
  const [quick, setQuick] = useState(() => {
    const o = {};
    for (const q of QUICK_DEFS) o[q.id] = { logged: false, count: q.startCount || 0 };
    return o;
  });
  function tapQuick(id) {
    setQuick((prev) => {
      const cur = prev[id];
      const def = QUICK_DEFS.find((q) => q.id === id);
      if (def.startCount != null) {
        // Counter — increment, mark logged
        const next = cur.count + 1;
        return { ...prev, [id]: { logged: true, count: next } };
      }
      return { ...prev, [id]: { logged: true, count: 0 } };
    });
  }

  // Smart card state — 'open' | 'saved'
  const [smartState, setSmartState] = useState("open");
  const [mood, setMood] = useState(null);
  const [influences, setInfluences] = useState([]);
  function toggleInfluence(t) {
    setInfluences((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  }
  function saveMood() {
    if (mood == null) return;
    setSmartState("saved");
    setWalkStep("saved");
  }

  // Jess inline panel state — 'hidden' | 'shown' | 'accepted'
  const [jess, setJess] = useState("hidden");
  // Show Jess automatically a short tick after the mood saves, so it has
  // a slide-in feel.
  useEffect(() => {
    if (smartState === "saved" && jess === "hidden") {
      const t = setTimeout(() => { setJess("shown"); setWalkStep("jess"); }, 350);
      return () => clearTimeout(t);
    }
  }, [smartState, jess, setWalkStep]);

  function acceptJess()  { setJess("accepted"); setWalkStep("accepted"); }
  function dismissJess() { onClose(); }

  // Walk-step driven shortcuts so the walkthrough pills can fast-forward.
  useEffect(() => {
    if (walkStep === "sheet" && smartState !== "open") { setSmartState("open"); setMood(null); setInfluences([]); setJess("hidden"); }
    if (walkStep === "quick") { /* no-op, just sheet open */ }
    if (walkStep === "saved" && smartState !== "saved") { setMood(0); setSmartState("saved"); }
    if (walkStep === "jess" && jess === "hidden") { setJess("shown"); }
    if (walkStep === "accepted" && jess !== "accepted") { if (smartState !== "saved") { setMood(0); setSmartState("saved"); } setJess("accepted"); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walkStep]);

  // Group accordions
  const [openGroups, setOpenGroups] = useState({ body: true }); // default Body open
  function toggleGroup(id) {
    setOpenGroups((p) => ({ ...p, [id]: !p[id] }));
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: "absolute", inset: 0, background: "rgba(26,20,16,0.45)", zIndex: 5,
      }} />

      {/* Sheet */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0,
        background: C.cream, borderRadius: "26px 26px 0 0",
        padding: "10px 16px 24px",
        maxHeight: "92%", overflowY: "auto", zIndex: 6,
        boxShadow: "0 -12px 30px rgba(0,0,0,0.18)",
        animation: "fwSheetUp .25s ease",
      }}>
        <style>{`@keyframes fwSheetUp { from { transform: translateY(20%); opacity: 0.7; } to { transform: translateY(0); opacity: 1; } } @keyframes fwSlideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }`}</style>

        {/* Grab handle */}
        <div style={{
          width: 44, height: 4, background: "rgba(58,44,26,0.18)",
          borderRadius: 9999, margin: "4px auto 10px",
        }} />

        {/* Compact header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10, marginBottom: 12,
        }}>
          <span style={{
            fontFamily: "'Fraunces', Georgia, serif", fontSize: 17, fontWeight: 500, color: C.espresso,
          }}>Log anything</span>
          <span style={{ fontSize: 11, color: C.muted }}>· {S.timeBlock}</span>
          <span style={{ flex: 1 }} />
          <button onClick={onClose} aria-label="Close" style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "rgba(58,44,26,0.06)", border: "none",
            color: C.espresso, cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}><X size={14} /></button>
        </div>

        {/* QUICK LOG RAIL */}
        <SectionHead kicker="QUICK LOG" sub="One tap · saves instantly" />
        <div style={{
          display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6,
          marginTop: 6, marginLeft: -2, marginRight: -2,
          scrollSnapType: "x mandatory",
        }}>
          {QUICK_DEFS.map((q) => {
            const st = quick[q.id];
            const isLogged = st.logged;
            return (
              <button
                key={q.id}
                onClick={() => tapQuick(q.id)}
                style={{
                  flexShrink: 0, padding: "9px 14px",
                  borderRadius: 9999,
                  background: isLogged ? C.sage : C.paperHi,
                  color: isLogged ? C.cream : C.espresso,
                  border: isLogged ? `1px solid ${C.sageDeep}` : "1px solid rgba(58,44,26,0.12)",
                  cursor: "pointer",
                  fontSize: 12, fontWeight: 700, letterSpacing: "0.01em",
                  display: "inline-flex", alignItems: "center", gap: 7,
                  scrollSnapAlign: "start",
                  boxShadow: isLogged ? `0 0 0 3px ${C.sage}33` : "none",
                  transition: "all .18s ease",
                }}
              >
                <span style={{ fontSize: 14, lineHeight: 1 }}>{q.emoji}</span>
                {isLogged ? q.loggedText(st.count) : q.baseLabel}
              </button>
            );
          })}
        </div>

        {/* SMART SUGGESTION — inline expanded form */}
        <div style={{ marginTop: 16 }}>
          <SmartCard
            S={S}
            state={smartState}
            mood={mood} setMood={setMood}
            influences={influences} toggleInfluence={toggleInfluence}
            onSave={saveMood}
            onPickFace={() => setWalkStep("face")}
          />
        </div>

        {/* Jess inline panel — appears AFTER save, in the same sheet */}
        {smartState === "saved" && jess !== "hidden" && (
          <div style={{ marginTop: 12, animation: "fwSlideDown .25s ease" }}>
            <JessInline
              S={S}
              state={jess}
              onAccept={acceptJess}
              onDismiss={dismissJess}
            />
          </div>
        )}

        {/* GROUPED LOG TYPES — accordions */}
        <div style={{ marginTop: 18 }}>
          <SectionHead kicker="MORE LOG TYPES" />
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            {LOG_GROUPS.map((g) => {
              const open = !!openGroups[g.id];
              return (
                <div key={g.id} style={{
                  background: C.paperHi, borderRadius: 14,
                  border: "1px solid rgba(58,44,26,0.10)",
                  padding: "0",
                }}>
                  <button
                    onClick={() => toggleGroup(g.id)}
                    style={{
                      width: "100%", padding: "10px 14px",
                      display: "flex", alignItems: "center", gap: 10,
                      background: "transparent", border: "none",
                      cursor: "pointer", textAlign: "left",
                    }}
                  >
                    <span style={{
                      fontFamily: "'Fraunces', Georgia, serif", fontSize: 14, fontWeight: 500,
                      color: C.espresso, flex: 1,
                    }}>{g.label}</span>
                    <span style={{
                      fontSize: 10, color: C.muted, fontWeight: 600,
                    }}>{g.items.length}</span>
                    {open ? <ChevronUp size={14} style={{ color: C.muted }} />
                          : <ChevronDown size={14} style={{ color: C.muted }} />}
                  </button>
                  {open && (
                    <div style={{
                      padding: "2px 14px 12px",
                      display: "flex", flexWrap: "wrap", gap: 6,
                      animation: "fwSlideDown .2s ease",
                    }}>
                      {g.items.map((it) => (
                        <button key={it.id} style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "6px 11px 6px 8px", borderRadius: 9999,
                          background: C.cream, border: "1px solid rgba(58,44,26,0.10)",
                          cursor: "pointer",
                        }}>
                          <span style={{
                            width: 20, height: 20, borderRadius: 6,
                            background: `${it.tone}22`, color: it.tone,
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                          }}><it.Icon size={11} /></span>
                          <span style={{ fontSize: 11.5, fontWeight: 700, color: C.espresso }}>{it.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ENGAGEMENT RAIL */}
        <div style={{ marginTop: 22 }}>
          <SectionHead kicker="FROM ACROSS YOUR APP" sub="Picked for where you are right now" />
          <div style={{
            display: "flex", gap: 10, overflowX: "auto",
            marginTop: 8, paddingBottom: 6, marginLeft: -2, marginRight: -2,
            scrollSnapType: "x mandatory",
          }}>
            {S.rail.map((card, i) => (
              <RailCard key={i} card={card} />
            ))}
          </div>
        </div>

        {/* Footer hint */}
        <div style={{
          marginTop: 14, padding: "10px 14px", borderRadius: 12,
          border: "1px dashed rgba(58,44,26,0.18)",
          fontSize: 11.5, color: C.muted, fontStyle: "italic",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <Sparkles size={13} style={{ color: C.gold, flexShrink: 0 }} />
          Hold the + for the speed dial. Voice + camera live on a long-press.
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SmartCard — inline expanded mood log
// ─────────────────────────────────────────────────────────────────────────────
function SmartCard({ S, state, mood, setMood, influences, toggleInfluence, onSave, onPickFace }) {
  if (state === "saved") {
    return (
      <div style={{
        padding: "14px 16px", borderRadius: 16,
        background: `${C.sage}1A`, border: `1px solid ${C.sage}55`,
        display: "flex", alignItems: "center", gap: 12,
        animation: "fwSlideDown .2s ease",
      }}>
        <span style={{
          width: 36, height: 36, borderRadius: 12,
          background: C.sage, color: C.cream,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}><Check size={18} strokeWidth={3} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'Fraunces', Georgia, serif", fontSize: 15, fontWeight: 500,
            color: C.espresso, lineHeight: 1.25,
          }}>{S.savedMessage.headline}</div>
          <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>
            {S.savedMessage.sub}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: "14px 16px", borderRadius: 16,
      background: C.paperHi, border: `1.5px solid ${C.gold}66`,
      boxShadow: `0 0 0 3px ${C.gold}11`,
    }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "3px 9px", borderRadius: 9999,
        background: `${C.gold}22`, color: C.goldDeep,
        fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
      }}>
        <Sparkles size={10} /> {S.smartCard.kicker}
      </div>
      <div style={{
        fontFamily: "'Fraunces', Georgia, serif", fontSize: 17, fontWeight: 500,
        color: C.espresso, margin: "8px 0 2px", lineHeight: 1.25,
      }}>{S.smartCard.question}</div>
      <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.5, marginBottom: 12 }}>
        {S.smartCard.sub}
      </div>

      {/* Faces */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 4px" }}>
        {MOOD_FACES.map((f) => {
          const active = mood === f.v;
          return (
            <button key={f.v} onClick={() => { setMood(f.v); onPickFace && onPickFace(); }} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
              background: "transparent", border: "none", cursor: "pointer",
            }}>
              <span style={{
                width: active ? 46 : 36, height: active ? 46 : 36,
                borderRadius: "50%",
                background: active ? f.color : `${f.color}30`,
                color: active ? C.cream : f.color,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                border: active ? `2px solid ${f.color}` : `1px solid ${f.color}55`,
                boxShadow: active ? `0 8px 18px ${f.color}55` : "none",
                transition: "all .15s ease",
              }}>
                <f.Icon size={active ? 20 : 17} />
              </span>
              <span style={{
                fontSize: 10, fontWeight: active ? 700 : 600,
                color: active ? f.color : C.muted,
              }}>{f.label}</span>
            </button>
          );
        })}
      </div>

      {/* Influences — appear AFTER a face is picked */}
      {mood != null && (
        <div style={{ marginTop: 14, animation: "fwSlideDown .2s ease" }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: C.muted,
            letterSpacing: "0.05em", textTransform: "uppercase",
          }}>What influenced this?</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {INFLUENCES.map((t) => {
              const on = influences.includes(t);
              return (
                <button key={t} onClick={() => toggleInfluence(t)} style={{
                  padding: "5px 11px", borderRadius: 9999,
                  background: on ? C.espresso : "transparent",
                  color: on ? C.cream : C.espresso,
                  border: on ? `1px solid ${C.espresso}` : "1px solid rgba(58,44,26,0.18)",
                  cursor: "pointer", fontSize: 11, fontWeight: 600,
                }}>{t}</button>
              );
            })}
          </div>
        </div>
      )}

      {/* Save — appears after face is picked */}
      {mood != null && (
        <button onClick={onSave} style={{
          marginTop: 14, padding: "10px 16px", borderRadius: 9999,
          background: C.espresso, color: C.cream,
          border: "none", fontWeight: 700, fontSize: 12.5, cursor: "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
          animation: "fwSlideDown .2s ease",
        }}>
          <Check size={14} /> Save mood
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// JessInline — appears below the saved smart card, in the same sheet
// ─────────────────────────────────────────────────────────────────────────────
function JessInline({ S, state, onAccept, onDismiss }) {
  if (state === "accepted") {
    return (
      <div style={{
        padding: "14px 16px", borderRadius: 16,
        background: `${C.gold}1A`, border: `1px solid ${C.gold}55`,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <span style={{
          width: 36, height: 36, borderRadius: 12,
          background: `linear-gradient(145deg, ${C.gold}, ${C.goldDeep})`,
          color: C.cream,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}><Check size={18} strokeWidth={3} /></span>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: "'Fraunces', Georgia, serif", fontSize: 15, fontWeight: 500,
            color: C.espresso,
          }}>{S.insight.confirmation}</div>
          <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>
            {S.insight.confirmationSub}
          </div>
        </div>
        <button onClick={onDismiss} style={{
          padding: "8px 12px", borderRadius: 9999,
          background: C.espresso, color: C.cream,
          border: "none", fontWeight: 700, fontSize: 11.5, cursor: "pointer",
          flexShrink: 0,
        }}>Done · close</button>
      </div>
    );
  }

  return (
    <div style={{
      padding: "14px 16px", borderRadius: 16,
      background: `${C.gold}1A`, border: `1px solid ${C.gold}55`,
    }}>
      <div style={{ display: "flex", gap: 11 }}>
        <span style={{
          width: 36, height: 36, borderRadius: 12, flexShrink: 0,
          background: `linear-gradient(145deg, ${C.gold}, ${C.goldDeep})`,
          color: C.cream,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Sparkles size={17} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 9, letterSpacing: "0.16em", fontWeight: 800,
            color: C.goldDeep, textTransform: "uppercase",
          }}>{S.insight.kicker}</div>
          <div style={{
            fontFamily: "'Fraunces', Georgia, serif", fontSize: 14.5, fontWeight: 500,
            color: C.espresso, margin: "3px 0 0", lineHeight: 1.35,
          }}>{S.insight.body}</div>
        </div>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button onClick={onDismiss} style={{
          flex: 1, padding: "9px 12px", borderRadius: 9999,
          background: "transparent", color: C.espresso,
          border: "1px solid rgba(58,44,26,0.20)", fontWeight: 700,
          fontSize: 11.5, cursor: "pointer",
        }}>Not now</button>
        <button onClick={onAccept} style={{
          flex: 2, padding: "9px 12px", borderRadius: 9999,
          background: C.espresso, color: C.cream,
          border: "none", fontWeight: 700, fontSize: 11.5, cursor: "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <Check size={12} /> {S.insight.cta}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RailCard — same as v2
// ─────────────────────────────────────────────────────────────────────────────
function RailCard({ card }) {
  const t = RAIL_COLOURS[card.type] || RAIL_COLOURS.jess;
  const Glyph = t.glyph;
  return (
    <div style={{
      flexShrink: 0, width: 142, minHeight: 158, borderRadius: 16,
      background: t.bg, color: C.cream,
      padding: "12px 12px 11px",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      boxShadow: "0 6px 14px rgba(0,0,0,0.25)",
      scrollSnapAlign: "start",
      position: "relative", overflow: "hidden",
    }}>
      <Glyph size={72} style={{
        position: "absolute", right: -16, bottom: -10,
        color: t.accent, opacity: 0.12,
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 16, marginBottom: 4 }}>{card.emoji}</div>
        <div style={{
          fontSize: 8.5, letterSpacing: "0.16em", fontWeight: 700,
          color: t.accent, textTransform: "uppercase", marginBottom: 4,
        }}>{card.typeLabel}</div>
        <div style={{
          fontFamily: "'Fraunces', Georgia, serif", fontSize: 12.5, fontWeight: 500,
          color: C.cream, lineHeight: 1.25,
        }}>{card.title}</div>
      </div>
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginTop: 8,
      }}>
        <div style={{ fontSize: 9.5, color: "rgba(244,237,219,0.7)", lineHeight: 1.2 }}>{card.meta}</div>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 3,
          fontSize: 9.5, fontWeight: 700, color: t.accent,
          letterSpacing: "0.04em",
        }}>{card.cta} <ChevronRight size={10} /></span>
      </div>
    </div>
  );
}

function SectionHead({ kicker, sub }) {
  return (
    <div>
      <div style={{
        fontSize: 9.5, letterSpacing: "0.18em", fontWeight: 700,
        color: C.muted, textTransform: "uppercase",
      }}>{kicker}</div>
      {sub && (
        <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic", marginTop: 2 }}>{sub}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Walkthrough — updated for v3 flow
// ─────────────────────────────────────────────────────────────────────────────
function Walkthrough({ step, onStep }) {
  const STEPS = [
    { id: "home",     label: "Home" },
    { id: "sheet",    label: "Open sheet" },
    { id: "saved",    label: "Mood saved" },
    { id: "jess",     label: "Jess panel" },
    { id: "accepted", label: "Accepted" },
  ];
  return (
    <div style={{ maxWidth: 640, margin: "32px auto 0", padding: "0 12px" }}>
      <div style={{
        display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap",
      }}>
        {STEPS.map((s, i) => {
          const active = step === s.id;
          return (
            <button key={s.id} onClick={() => onStep(s.id)} style={{
              padding: "9px 14px", borderRadius: 12,
              background: active ? C.gold : "rgba(244,237,219,0.06)",
              color: active ? C.ink : "rgba(244,237,219,0.78)",
              border: active ? `1px solid ${C.gold}` : "1px solid rgba(244,237,219,0.12)",
              cursor: "pointer",
              fontSize: 11.5, fontWeight: 700, letterSpacing: "0.02em",
              display: "inline-flex", alignItems: "center", gap: 7,
            }}>
              <span style={{
                width: 18, height: 18, borderRadius: "50%",
                background: active ? C.ink : "rgba(244,237,219,0.16)",
                color: active ? C.gold : "rgba(244,237,219,0.7)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 800,
              }}>{i + 1}</span>
              {s.label}
            </button>
          );
        })}
      </div>
      <p style={{
        textAlign: "center", marginTop: 14, fontSize: 11, fontStyle: "italic",
        color: "rgba(244,237,219,0.5)", lineHeight: 1.5,
      }}>
        Hold the FAB on the phone (~400ms) for the speed dial · tap pills in Quick Log ·
        tap a face directly to save mood inline.
      </p>
    </div>
  );
}
