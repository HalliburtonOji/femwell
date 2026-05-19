// ─────────────────────────────────────────────────────────────────────────────
// SmartLoggerDemo v2 — redesigned with founder feedback
//
// What changed from v1:
//   • 4 grouped sections (Body · Nourish · Health · Mind & Life) instead of a
//     flat 14-tile grid
//   • Added Period (Body), Drinks (Nourish), Caffeine (Nourish), Weight,
//     Sleep, Appointment, Activity → 17 log types total
//   • Suggestions are a horizontal scroll of compact ~120px pill cards
//   • New "From across your app" engagement rail — 4 dark gradient cards
//     (Podcast · Reading · Journal Prompt · Jess Tip), all stage-aware
//   • Lighter overall layout — one-line sheet header, smaller chips
//
// Same interactions: FAB tap, mood log (5-face + tags + save), Jess insight
// card, stage switching, walkthrough buttons.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  Plus, X, ChevronRight, Sparkles, Check,
  Smile, Frown, Meh, Heart, Zap, Moon, Sun, Droplets,
  Footprints, ListChecks, Pill, Utensils, CalendarClock,
  StickyNote, Stethoscope, BookOpen, Activity, FileText,
  Thermometer, Camera, Mic, Coffee, Wine, Scale, Bed,
  Headphones, MessageCircle, Pen,
} from "lucide-react";

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
    suggestions: [
      { id: "mood", label: "Mood",          sub: "Not logged today",   Icon: Smile,  tone: C.rose, urgent: true },
      { id: "supp", label: "Iron supp",     sub: "Missed 4 days",      Icon: Pill,   tone: C.blush, urgent: true },
      { id: "meal", label: "Log dinner",    sub: "Most meals missing", Icon: Utensils, tone: C.gold },
      { id: "note", label: "Wind-down",     sub: "Tonight's note",     Icon: StickyNote, tone: C.muted },
    ],
    insight: {
      kicker: "JESS PATTERN INSIGHT",
      body: "You've logged low mood 4 days in a row — all in your luteal phase. This could be linked to the iron supplement you've been missing.",
      cta: "Yes, add reminder",
      confirmation: "Iron reminder added to evenings",
      confirmationSub: "Daily nudge at 8pm during your luteal week",
    },
    rail: [
      { type: "podcast", emoji: "🎧", typeLabel: "PODCAST",      title: "PCOS & Perimenopause with Dr Sara", meta: "42 min · Saved",         cta: "Play" },
      { type: "reading", emoji: "📖", typeLabel: "READING",      title: "Iron & the luteal phase",            meta: "6 min · The Atlas",      cta: "Read" },
      { type: "prompt",  emoji: "✍️", typeLabel: "JOURNAL PROMPT", title: "What does your body need tonight?", meta: "Phase prompt · Luteal", cta: "Write" },
      { type: "jess",    emoji: "✨", typeLabel: "JESS TIP",      title: "Magnesium before bed can ease luteal cramps", meta: "30 sec read", cta: "Tell me more" },
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
    suggestions: [
      { id: "kicks",  label: "Kick counter", sub: "Start 1-hr window", Icon: Heart,         tone: C.rose,  urgent: true },
      { id: "nausea", label: "Nausea",       sub: "Track the change",  Icon: Stethoscope,   tone: C.blush },
      { id: "appt",   label: "Antenatal",    sub: "Add 24w check",     Icon: CalendarClock, tone: C.sage },
      { id: "vits",   label: "Prenatal",     sub: "Folate · D",        Icon: Pill,          tone: C.gold },
    ],
    insight: {
      kicker: "JESS PATTERN INSIGHT",
      body: "You've logged movements 5 days straight — great consistency! Kicks are most noticeable after meals in T2.",
      cta: "Yes, set reminders",
      confirmation: "Kick logging reminders set for after meals",
      confirmationSub: "Three gentle nudges a day — breakfast, lunch, dinner",
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
    suggestions: [
      { id: "flash", label: "Hot flash",  sub: "3 already today",       Icon: Thermometer, tone: C.rose,  urgent: true },
      { id: "sleep", label: "Sleep",      sub: "Last night rough",      Icon: Moon,        tone: C.plum },
      { id: "hrt",   label: "HRT",        sub: "8pm dose due",          Icon: Pill,        tone: C.blush },
      { id: "mood",  label: "Mood",       sub: "Stress + mood link",    Icon: Smile,       tone: C.gold },
    ],
    insight: {
      kicker: "JESS PATTERN INSIGHT",
      body: "You've logged 3+ hot flashes daily for 12 days. This is building a strong picture for your GP — your Doctor Export is ready to review.",
      cta: "View GP export",
      confirmation: "Opening Doctor Export…",
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
    suggestions: [
      { id: "bbt",  label: "BBT",          sub: "Morning reading",      Icon: Thermometer, tone: C.rose, urgent: true },
      { id: "cm",   label: "Mucus",        sub: "Texture + clarity",    Icon: Droplets,    tone: "#60B4FA" },
      { id: "mood", label: "Mood",         sub: "Daily check-in",       Icon: Zap,         tone: C.goldDeep },
      { id: "vits", label: "Prenatal",     sub: "Folate + iron",        Icon: Pill,        tone: C.gold },
    ],
    insight: {
      kicker: "JESS PATTERN INSIGHT",
      body: "Your BBT pattern over 3 cycles shows a clear thermal shift around D14. Today and tomorrow are your highest-probability days.",
      cta: "See my fertility summary",
      confirmation: "Fertility summary ready in Jess",
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

// ── Grouped log types ────────────────────────────────────────────────────────
const LOG_GROUPS = [
  {
    id: "body",
    label: "Body",
    items: [
      { id: "mood",    label: "Mood",     Icon: Smile,       tone: C.rose },
      { id: "energy",  label: "Energy",   Icon: Zap,         tone: C.goldDeep },
      { id: "symptom", label: "Symptoms", Icon: Stethoscope, tone: C.plum },
      { id: "period",  label: "Period",   Icon: Droplets,    tone: C.rose },
      { id: "weight",  label: "Weight",   Icon: Scale,       tone: C.muted },
    ],
  },
  {
    id: "nourish",
    label: "Nourish",
    items: [
      { id: "meal",     label: "Meal",     Icon: Utensils, tone: C.gold },
      { id: "water",    label: "Water",    Icon: Droplets, tone: "#60B4FA" },
      { id: "drinks",   label: "Drinks",   Icon: Wine,     tone: C.plum },
      { id: "caffeine", label: "Caffeine", Icon: Coffee,   tone: C.espresso },
    ],
  },
  {
    id: "health",
    label: "Health",
    items: [
      { id: "med",   label: "Medication",  Icon: Pill,          tone: C.blush },
      { id: "supp",  label: "Supplement",  Icon: Pill,          tone: C.sage },
      { id: "sleep", label: "Sleep",       Icon: Bed,           tone: C.plum },
      { id: "appt",  label: "Appointment", Icon: CalendarClock, tone: C.goldDeep },
    ],
  },
  {
    id: "mindlife",
    label: "Mind & Life",
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

// ── Rail card colors (dark gradients, consistent across stages) ──────────────
const RAIL_COLOURS = {
  podcast: { bg: "linear-gradient(160deg, #3D2E5C 0%, #1F1733 100%)", glyph: Headphones,    accent: "#B79EE8" },
  reading: { bg: "linear-gradient(160deg, #1F3A5C 0%, #0E1A33 100%)", glyph: BookOpen,      accent: "#88B0E8" },
  prompt:  { bg: "linear-gradient(160deg, #1F3D2E 0%, #0E1F17 100%)", glyph: Pen,           accent: "#A2D8B5" },
  jess:    { bg: "linear-gradient(160deg, #4A3520 0%, #1A1410 100%)", glyph: Sparkles,      accent: C.gold },
};

// ─────────────────────────────────────────────────────────────────────────────
// Top-level component
// ─────────────────────────────────────────────────────────────────────────────
export default function SmartLoggerDemo() {
  const [stage, setStage] = useState("luteal");
  const [step, setStep]   = useState("home"); // home | logger | mood | insight | accepted
  const [mood, setMood]   = useState(null);
  const [influences, setInfluences] = useState([]);
  const [note, setNote]   = useState("");

  const S = STAGES[stage];

  function changeStage(nextId) {
    setStage(nextId);
    setStep("home");
    setMood(null);
    setInfluences([]);
    setNote("");
  }
  function resetTo(s) {
    setStep(s);
    if (s === "home" || s === "logger") {
      setMood(null);
      setInfluences([]);
      setNote("");
    }
  }
  function toggleInfluence(t) {
    setInfluences((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  }

  return (
    <div style={{
      background: C.ink, minHeight: "100vh",
      padding: "32px 16px 80px",
      fontFamily: "'Inter', system-ui, sans-serif",
      color: "#F4EDDB",
    }}>
      {/* Headline */}
      <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <div style={{
          fontSize: 11, letterSpacing: "0.22em", fontWeight: 700,
          color: "rgba(244,237,219,0.55)", textTransform: "uppercase",
        }}>Design Lab · Concept Demo · v2</div>
        <h1 style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: 32, fontWeight: 500, color: C.cream,
          letterSpacing: "-0.02em", margin: "10px 0 8px", lineHeight: 1.1,
        }}>Smart Logger</h1>
        <p style={{
          fontSize: 14, color: "rgba(244,237,219,0.7)", lineHeight: 1.55,
          maxWidth: 540, margin: "0 auto",
        }}>
          Compact suggestions, grouped log types, and an engagement rail that pulls in
          what's relevant to your stage — podcast, reading, prompt, Jess tip.
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
                transition: "all .2s ease",
              }}
            >{st.tabLabel}</button>
          );
        })}
      </div>

      {/* Phone */}
      <div style={{ marginTop: 32, display: "flex", justifyContent: "center" }}>
        <Phone S={S} step={step} mood={mood} influences={influences} note={note}
          onOpenLogger={() => setStep("logger")}
          onCloseLogger={() => setStep("home")}
          onPickMood={() => setStep("mood")}
          onSaveMood={() => setStep("insight")}
          onAcceptInsight={() => setStep("accepted")}
          onDismissInsight={() => setStep("home")}
          setMood={setMood}
          toggleInfluence={toggleInfluence}
          setNote={setNote}
        />
      </div>

      {/* Walkthrough */}
      <Walkthrough step={step} onStep={resetTo} />

      {/* Footnote */}
      <p style={{
        textAlign: "center", maxWidth: 540, margin: "32px auto 0",
        fontSize: 11.5, color: "rgba(244,237,219,0.45)", lineHeight: 1.6,
        fontStyle: "italic",
      }}>
        Concept prototype — interactions are visual only. Swipe the engagement rail at
        the bottom of the sheet, and switch stages to see how every section rebuilds.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Phone — 390px mockup with all step layers
// ─────────────────────────────────────────────────────────────────────────────
function Phone({
  S, step, mood, influences, note,
  onOpenLogger, onCloseLogger, onPickMood, onSaveMood,
  onAcceptInsight, onDismissInsight,
  setMood, toggleInfluence, setNote,
}) {
  return (
    <div style={{
      width: 390, minHeight: 780, position: "relative",
      borderRadius: 40, padding: "0",
      background: C.cream,
      boxShadow: "0 30px 80px rgba(0,0,0,0.55), 0 0 0 8px #1A1410, 0 0 0 9px rgba(212,175,55,0.18)",
      overflow: "hidden",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Notch */}
      <div style={{
        position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)",
        width: 110, height: 26, borderRadius: 14, background: "#1A1410", zIndex: 3,
      }} />

      {/* Status bar */}
      <div style={{
        padding: "16px 22px 6px", display: "flex", justifyContent: "space-between",
        fontSize: 12, fontWeight: 600, color: C.espresso, position: "relative", zIndex: 4,
      }}>
        <span>{S.timeBlock.split(" · ")[1]}</span>
        <span style={{ opacity: 0.5 }}>· · ·</span>
      </div>

      <PlannerBg S={S} />

      {/* Gold FAB */}
      {step === "home" && (
        <button onClick={onOpenLogger} aria-label="Smart logger" style={{
          position: "absolute", bottom: 22, right: 22, zIndex: 4,
          width: 60, height: 60, borderRadius: "50%",
          background: `linear-gradient(145deg, ${C.gold}, ${C.goldDeep})`,
          border: "none", cursor: "pointer",
          boxShadow: "0 12px 28px rgba(212,175,55,0.55), 0 0 0 4px rgba(244,237,219,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Plus size={28} style={{ color: C.cream }} strokeWidth={2.6} />
        </button>
      )}

      {step === "logger" && (
        <LoggerSheet S={S} onClose={onCloseLogger} onPickMood={onPickMood} />
      )}
      {step === "mood" && (
        <MoodSheet
          S={S}
          mood={mood} setMood={setMood}
          influences={influences} toggleInfluence={toggleInfluence}
          note={note} setNote={setNote}
          onClose={onCloseLogger}
          onSave={onSaveMood}
        />
      )}
      {step === "insight" && (
        <InsightCard S={S} onAccept={onAcceptInsight} onDismiss={onDismissInsight} />
      )}
      {step === "accepted" && (
        <AcceptedCard S={S} onClose={onDismissInsight} />
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
// PlannerBg — visible content behind the FAB
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
              transition: "all .2s ease",
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
// LoggerSheet — redesigned: one-line header, scroll suggestions, grouped chips,
// engagement rail at the bottom
// ─────────────────────────────────────────────────────────────────────────────
function LoggerSheet({ S, onClose, onPickMood }) {
  return (
    <SheetShell onClose={onClose} maxHeight="90%">
      {/* Compact one-line header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: 8,
        padding: "0 2px",
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

      {/* Phase context line */}
      <div style={{
        fontSize: 11.5, color: C.muted, fontStyle: "italic",
        padding: "0 2px 12px",
      }}>
        <span style={{ marginRight: 6 }}>{S.headerEmoji}</span>
        {S.phaseContext}
      </div>

      {/* Suggestions — horizontal scroll */}
      <SectionHead kicker="SUGGESTED FOR YOU" />
      <div style={{
        display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4,
        marginTop: 6, marginLeft: -2, marginRight: -2,
        scrollSnapType: "x mandatory",
      }}>
        {S.suggestions.map((s) => (
          <button
            key={s.id}
            onClick={s.id === "mood" ? onPickMood : undefined}
            style={{
              flexShrink: 0, width: 118, padding: "10px 11px",
              borderRadius: 14,
              background: C.paperHi,
              border: s.urgent ? `1.5px solid ${s.tone}77` : "1px solid rgba(58,44,26,0.10)",
              cursor: "pointer", textAlign: "left",
              display: "flex", flexDirection: "column", gap: 8,
              scrollSnapAlign: "start",
              boxShadow: s.urgent ? `0 0 0 3px ${s.tone}11` : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                width: 26, height: 26, borderRadius: 8,
                background: `${s.tone}22`, color: s.tone,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}><s.Icon size={13} /></span>
              {s.urgent && <span style={{
                fontSize: 8.5, letterSpacing: "0.1em", fontWeight: 700,
                color: s.tone, background: `${s.tone}22`, borderRadius: 9999,
                padding: "2px 7px",
              }}>NUDGE</span>}
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: C.espresso, lineHeight: 1.2 }}>{s.label}</div>
              <div style={{ fontSize: 10.5, color: C.muted, marginTop: 2, lineHeight: 1.3 }}>{s.sub}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Grouped log types */}
      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        {LOG_GROUPS.map((g) => (
          <div key={g.id}>
            <div style={{
              fontSize: 9.5, letterSpacing: "0.18em", fontWeight: 700,
              color: C.muted, textTransform: "uppercase", marginBottom: 6,
            }}>{g.label}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {g.items.map((it) => (
                <button
                  key={it.id}
                  onClick={it.id === "mood" ? onPickMood : undefined}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 11px 6px 8px", borderRadius: 9999,
                    background: C.paperHi, border: "1px solid rgba(58,44,26,0.10)",
                    cursor: "pointer",
                  }}
                >
                  <span style={{
                    width: 20, height: 20, borderRadius: 6,
                    background: `${it.tone}22`, color: it.tone,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                  }}><it.Icon size={11} /></span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: C.espresso }}>{it.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Engagement rail — From across your app */}
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

      {/* Voice & camera hint */}
      <div style={{
        marginTop: 14, padding: "10px 14px", borderRadius: 12,
        border: "1px dashed rgba(58,44,26,0.18)",
        fontSize: 11.5, color: C.muted, fontStyle: "italic",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <Sparkles size={13} style={{ color: C.gold, flexShrink: 0 }} />
        Hold the + for voice. Long-press any chip to scan with the camera.
      </div>
    </SheetShell>
  );
}

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
      {/* Glyph backdrop */}
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

// ─────────────────────────────────────────────────────────────────────────────
// MoodSheet — unchanged from v1 (founder kept this flow)
// ─────────────────────────────────────────────────────────────────────────────
function MoodSheet({
  S, mood, setMood, influences, toggleInfluence, note, setNote,
  onClose, onSave,
}) {
  const valid = mood != null;
  return (
    <SheetShell onClose={onClose} maxHeight="86%">
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: 8,
      }}>
        <span style={{
          fontFamily: "'Fraunces', Georgia, serif", fontSize: 17, fontWeight: 500, color: C.espresso,
        }}>Log your mood</span>
        <span style={{ fontSize: 11, color: C.muted }}>· {S.timeBlock.split(" · ")[1]}</span>
        <span style={{ flex: 1 }} />
        <button onClick={onClose} aria-label="Close" style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "rgba(58,44,26,0.06)", border: "none",
          color: C.espresso, cursor: "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><X size={14} /></button>
      </div>

      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "4px 10px", borderRadius: 9999,
        background: S.accentLight, border: `1px solid ${S.accentLine}55`,
        color: C.espresso, fontSize: 11, fontWeight: 600, marginBottom: 12,
      }}>
        <span>{S.headerEmoji}</span> {S.headerSub}
      </div>

      <div style={{ marginTop: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.espresso }}>How are you feeling?</div>
        <div style={{
          display: "flex", justifyContent: "space-between",
          marginTop: 14, padding: "0 4px",
        }}>
          {MOOD_FACES.map((f) => {
            const active = mood === f.v;
            return (
              <button key={f.v} onClick={() => setMood(f.v)} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                background: "transparent", border: "none", cursor: "pointer",
              }}>
                <span style={{
                  width: active ? 48 : 38, height: active ? 48 : 38,
                  borderRadius: "50%",
                  background: active ? f.color : `${f.color}30`,
                  color: active ? C.cream : f.color,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  border: active ? `2px solid ${f.color}` : `1px solid ${f.color}55`,
                  boxShadow: active ? `0 8px 18px ${f.color}55` : "none",
                  transition: "all .15s ease",
                }}>
                  <f.Icon size={active ? 22 : 18} />
                </span>
                <span style={{
                  fontSize: 10.5, fontWeight: active ? 700 : 600,
                  color: active ? f.color : C.muted,
                }}>{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.espresso }}>What influenced this?</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {INFLUENCES.map((t) => {
            const on = influences.includes(t);
            return (
              <button key={t} onClick={() => toggleInfluence(t)} style={{
                padding: "6px 11px", borderRadius: 9999,
                background: on ? C.espresso : "transparent",
                color: on ? C.cream : C.espresso,
                border: on ? `1px solid ${C.espresso}` : "1px solid rgba(58,44,26,0.18)",
                cursor: "pointer", fontSize: 11.5, fontWeight: 600,
              }}>{t}</button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.espresso }}>Anything else? <span style={{ fontWeight: 500, color: C.muted }}>· optional</span></div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="A line about today…"
          rows={2}
          style={{
            display: "block", width: "100%", boxSizing: "border-box",
            marginTop: 8, padding: "10px 12px",
            borderRadius: 12, background: C.paperHi,
            border: "1px solid rgba(58,44,26,0.16)",
            fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: C.espresso,
            outline: "none", resize: "vertical", minHeight: 50,
          }}
        />
      </div>

      <div style={{ marginTop: 22, display: "flex", gap: 10 }}>
        <button onClick={onClose} style={{
          flex: 1, padding: "12px 16px", borderRadius: 9999,
          background: "transparent", color: C.espresso,
          border: "1px solid rgba(58,44,26,0.18)", fontWeight: 700,
          fontSize: 13, cursor: "pointer",
        }}>Cancel</button>
        <button
          onClick={valid ? onSave : undefined}
          disabled={!valid}
          style={{
            flex: 2, padding: "12px 16px", borderRadius: 9999,
            background: valid ? C.espresso : "rgba(58,44,26,0.3)",
            color: C.cream, border: "none", fontWeight: 700, fontSize: 13,
            cursor: valid ? "pointer" : "not-allowed",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          <Check size={14} /> Save mood
        </button>
      </div>
    </SheetShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// InsightCard — Jess pattern message after a save
// ─────────────────────────────────────────────────────────────────────────────
function InsightCard({ S, onAccept, onDismiss }) {
  return (
    <SheetShell onClose={onDismiss} maxHeight="62%">
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: 8,
      }}>
        <span style={{
          fontFamily: "'Fraunces', Georgia, serif", fontSize: 17, fontWeight: 500, color: C.espresso,
        }}>A note from Jess</span>
        <span style={{ flex: 1 }} />
        <button onClick={onDismiss} aria-label="Close" style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "rgba(58,44,26,0.06)", border: "none",
          color: C.espresso, cursor: "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><X size={14} /></button>
      </div>

      <div style={{
        padding: "14px 16px", borderRadius: 16,
        background: `${C.gold}1A`, border: `1px solid ${C.gold}55`,
        display: "flex", gap: 12,
      }}>
        <span style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: `linear-gradient(145deg, ${C.gold}, ${C.goldDeep})`,
          color: C.cream,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Sparkles size={18} /></span>
        <div>
          <div style={{
            fontSize: 9.5, letterSpacing: "0.18em", fontWeight: 700,
            color: C.goldDeep, textTransform: "uppercase",
          }}>{S.insight.kicker}</div>
          <div style={{
            fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, fontWeight: 500,
            color: C.espresso, margin: "4px 0 6px", lineHeight: 1.35,
          }}>{S.insight.body}</div>
        </div>
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
        <button onClick={onDismiss} style={{
          flex: 1, padding: "11px 14px", borderRadius: 9999,
          background: "transparent", color: C.espresso,
          border: "1px solid rgba(58,44,26,0.20)", fontWeight: 700,
          fontSize: 12.5, cursor: "pointer",
        }}>Not now</button>
        <button onClick={onAccept} style={{
          flex: 2, padding: "11px 14px", borderRadius: 9999,
          background: C.espresso, color: C.cream,
          border: "none", fontWeight: 700, fontSize: 12.5, cursor: "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <Check size={13} /> {S.insight.cta}
        </button>
      </div>

      <p style={{
        marginTop: 14, fontSize: 11.5, fontStyle: "italic",
        color: C.muted, textAlign: "center", lineHeight: 1.5,
      }}>
        Jess only surfaces a pattern after 3+ data points. You can mute insights anytime in Settings.
      </p>
    </SheetShell>
  );
}

function AcceptedCard({ S, onClose }) {
  return (
    <SheetShell onClose={onClose} maxHeight="52%">
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: 8,
      }}>
        <span style={{
          fontFamily: "'Fraunces', Georgia, serif", fontSize: 17, fontWeight: 500, color: C.espresso,
        }}>Done</span>
        <span style={{ flex: 1 }} />
        <button onClick={onClose} aria-label="Close" style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "rgba(58,44,26,0.06)", border: "none",
          color: C.espresso, cursor: "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><X size={14} /></button>
      </div>

      <div style={{
        padding: "22px 18px", borderRadius: 16,
        background: `${C.sage}1A`, border: `1px solid ${C.sage}55`,
        textAlign: "center",
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: C.sage, color: C.cream,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 12px",
        }}><Check size={28} strokeWidth={3} /></div>
        <div style={{
          fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, fontWeight: 500,
          color: C.espresso, lineHeight: 1.3, margin: "0 0 4px",
        }}>{S.insight.confirmation}</div>
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
          {S.insight.confirmationSub}
        </div>
      </div>

      <button onClick={onClose} style={{
        marginTop: 18, width: "100%", padding: "12px 16px", borderRadius: 9999,
        background: C.espresso, color: C.cream,
        border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer",
      }}>Back to home</button>
    </SheetShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SheetShell — bottom sheet wrapper (slimmer than v1)
// ─────────────────────────────────────────────────────────────────────────────
function SheetShell({ children, onClose, maxHeight = "80%" }) {
  return (
    <>
      <div style={{
        position: "absolute", inset: 0, background: "rgba(26,20,16,0.45)",
        zIndex: 5,
      }} onClick={onClose} />

      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0,
        background: C.cream, borderRadius: "26px 26px 0 0",
        padding: "10px 16px 22px",
        maxHeight, overflowY: "auto",
        zIndex: 6,
        boxShadow: "0 -12px 30px rgba(0,0,0,0.18)",
        animation: "fwSheetUp .25s ease",
      }}>
        <style>{`@keyframes fwSheetUp { from { transform: translateY(20%); opacity: 0.7; } to { transform: translateY(0); opacity: 1; } }`}</style>
        <div style={{
          width: 44, height: 4, background: "rgba(58,44,26,0.18)",
          borderRadius: 9999, margin: "4px auto 12px",
        }} />
        {children}
      </div>
    </>
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
// Walkthrough — 5 step buttons below the phone
// ─────────────────────────────────────────────────────────────────────────────
function Walkthrough({ step, onStep }) {
  const STEPS = [
    { id: "home",     label: "Home" },
    { id: "logger",   label: "Open logger" },
    { id: "mood",     label: "Log mood" },
    { id: "insight",  label: "Jess insight" },
    { id: "accepted", label: "Accepted" },
  ];
  return (
    <div style={{
      maxWidth: 640, margin: "32px auto 0",
      padding: "0 12px",
    }}>
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
              transition: "all .15s ease",
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
        Tap a step to jump, or use the FAB + sheet inside the phone to walk through naturally.
      </p>
    </div>
  );
}
