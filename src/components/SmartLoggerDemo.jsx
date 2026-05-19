// ─────────────────────────────────────────────────────────────────────────────
// SmartLoggerDemo — interactive concept for /Ideas
//
// Shows the unified FAB + contextual logger sheet that would replace the
// separate per-page loggers (Today's CheckinModal + the global Universal
// FAB). Stage-aware suggestions, mood log flow, and Jess pattern insight.
//
// Self-contained: no real entity writes. Visual prototype only.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  Plus, X, ChevronRight, Sparkles, Check, ArrowLeft,
  Smile, Frown, Meh, Heart, Zap, Moon, Sun, Droplets,
  Footprints, ListChecks, Pill, Utensils, CalendarClock,
  StickyNote, Stethoscope, BookOpen, Activity, FileText,
  Thermometer, Pencil, Camera, Mic,
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
      { id: "mood", label: "Log your mood", sub: "Not logged today", Icon: Smile, tone: C.rose, urgent: true },
      { id: "supp", label: "Evening supplement", sub: "Iron · missed 4 days", Icon: Pill, tone: C.blush, urgent: true },
      { id: "meal", label: "Log dinner", sub: "Most meals haven't been captured", Icon: Utensils, tone: C.gold },
      { id: "note", label: "Wind-down note", sub: "Tonight's reflection", Icon: StickyNote, tone: C.muted },
    ],
    insight: {
      kicker: "JESS PATTERN INSIGHT",
      body: "You've logged low mood 4 days in a row — all in your luteal phase. This could be linked to the iron supplement you've been missing.",
      cta: "Yes, add reminder",
      confirmation: "Iron reminder added to evenings",
      confirmationSub: "Daily nudge at 8pm during your luteal week",
    },
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
    stageRow: { title: "Week 22 · T2", sub: "Anaomaly scan was at 20w · all clear" },
    suggestions: [
      { id: "kicks", label: "Kick counter", sub: "Start a 1-hour window", Icon: Heart, tone: C.rose, urgent: true },
      { id: "nausea", label: "Log nausea", sub: "Has eased — track the change", Icon: Stethoscope, tone: C.blush },
      { id: "appt", label: "Antenatal appointment", sub: "Add 24w midwife check", Icon: CalendarClock, tone: C.sage },
      { id: "vits", label: "Prenatal vitamins", sub: "Folate + D · taken today?", Icon: Pill, tone: C.gold },
    ],
    insight: {
      kicker: "JESS PATTERN INSIGHT",
      body: "You've logged movements 5 days straight — great consistency! Kicks are most noticeable after meals in T2.",
      cta: "Yes, set reminders",
      confirmation: "Kick logging reminders set for after meals",
      confirmationSub: "Three gentle nudges a day — breakfast, lunch, dinner",
    },
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
      { id: "flash", label: "Log hot flash", sub: "3 already today", Icon: Thermometer, tone: C.rose, urgent: true },
      { id: "sleep", label: "Sleep quality", sub: "Last night was rough — tag it", Icon: Moon, tone: C.plum },
      { id: "hrt", label: "HRT reminder", sub: "Evening dose due at 8pm", Icon: Pill, tone: C.blush },
      { id: "mood", label: "Stress & mood", sub: "Track the connection", Icon: Smile, tone: C.gold },
    ],
    insight: {
      kicker: "JESS PATTERN INSIGHT",
      body: "You've logged 3+ hot flashes daily for 12 days. This is building a strong picture for your GP — your Doctor Export is ready to review.",
      cta: "View GP export",
      confirmation: "Opening Doctor Export…",
      confirmationSub: "12-day flash log + sleep + HRT timeline · PDF ready",
    },
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
      { id: "bbt", label: "BBT temperature", sub: "Log this morning's reading", Icon: Thermometer, tone: C.rose, urgent: true },
      { id: "cm", label: "Cervical mucus", sub: "Texture + clarity", Icon: Droplets, tone: "#60B4FA" },
      { id: "mood", label: "Energy & mood", sub: "Daily check-in", Icon: Zap, tone: C.goldDeep },
      { id: "vits", label: "Prenatal vitamins", sub: "Folate + iron · taken?", Icon: Pill, tone: C.gold },
    ],
    insight: {
      kicker: "JESS PATTERN INSIGHT",
      body: "Your BBT pattern over 3 cycles shows a clear thermal shift around D14. Today and tomorrow are your highest-probability days.",
      cta: "See my fertility summary",
      confirmation: "Fertility summary ready in Jess",
      confirmationSub: "3-cycle BBT + LH chart + window prediction",
    },
  },
};

// ── Full grid of 14 log types — shown below suggestions ──────────────────────
const GRID = [
  { id: "mood",     label: "Mood",       Icon: Smile,         tone: C.rose },
  { id: "energy",   label: "Energy",     Icon: Zap,           tone: C.goldDeep },
  { id: "symptom",  label: "Symptom",    Icon: Stethoscope,   tone: C.plum },
  { id: "meal",     label: "Meal",       Icon: Utensils,      tone: C.gold },
  { id: "hydr",     label: "Hydration",  Icon: Droplets,      tone: "#60B4FA" },
  { id: "habit",    label: "Habit",      Icon: Footprints,    tone: C.sage },
  { id: "task",     label: "Task",       Icon: ListChecks,    tone: C.espresso },
  { id: "med",      label: "Medication", Icon: Pill,          tone: C.blush },
  { id: "event",    label: "Event",      Icon: CalendarClock, tone: C.goldDeep },
  { id: "sleep",    label: "Sleep",      Icon: Moon,          tone: C.plum },
  { id: "ritual",   label: "Ritual",     Icon: Sparkles,      tone: C.muted },
  { id: "note",     label: "Note",       Icon: StickyNote,    tone: C.muted },
  { id: "photo",    label: "Photo",      Icon: Camera,        tone: C.muted },
  { id: "voice",    label: "Voice",      Icon: Mic,           tone: C.muted },
];

const MOOD_FACES = [
  { v: 0, Icon: Frown, label: "Low",       color: C.rose },
  { v: 1, Icon: Frown, label: "Down",      color: "#C97A7E" },
  { v: 2, Icon: Meh,   label: "Tender",    color: C.blush },
  { v: 3, Icon: Smile, label: "Steady",    color: C.gold },
  { v: 4, Icon: Smile, label: "Bright",    color: C.sage },
];

const INFLUENCES = ["Sleep", "Hormones", "Iron", "Stress", "Connection", "Movement", "Sun", "Caffeine"];

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
        }}>Design Lab · Concept Demo</div>
        <h1 style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: 32, fontWeight: 500, color: C.cream,
          letterSpacing: "-0.02em", margin: "10px 0 8px", lineHeight: 1.1,
        }}>Smart Logger</h1>
        <p style={{
          fontSize: 14, color: "rgba(244,237,219,0.7)", lineHeight: 1.55,
          maxWidth: 520, margin: "0 auto",
        }}>
          One unified FAB. Context-aware suggestions per life stage and time of day.
          Replaces the separate Today modal + Universal FAB with a single, smart entry point.
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
      <div style={{
        marginTop: 32, display: "flex", justifyContent: "center",
      }}>
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
        Concept prototype — interactions are visual only. No real entity writes.
        Switch life stages to see how suggestions, the phase line, and Jess's insight all change.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Phone — the 390px mockup with all step layers
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

      {/* Planner background */}
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
          transition: "transform .15s ease",
        }}>
          <Plus size={28} style={{ color: C.cream }} strokeWidth={2.6} />
        </button>
      )}

      {/* Logger sheet */}
      {step === "logger" && (
        <LoggerSheet S={S} onClose={onCloseLogger} onPickMood={onPickMood} />
      )}

      {/* Mood log */}
      {step === "mood" && (
        <MoodSheet
          S={S}
          mood={mood} setMood={setMood}
          influences={influences} toggleInfluence={toggleInfluence}
          note={note} setNote={setNote}
          onBack={onPickMood /* re-opens mood — kept for the back button below */}
          onClose={onCloseLogger}
          onSave={onSaveMood}
          onBackToLogger={() => { /* go back to logger */ }}
        />
      )}

      {/* Insight card */}
      {step === "insight" && (
        <InsightCard S={S} onAccept={onAcceptInsight} onDismiss={onDismissInsight} />
      )}

      {/* Accepted confirmation */}
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
// PlannerBg — the home-state visible content behind the FAB
// ─────────────────────────────────────────────────────────────────────────────
function PlannerBg({ S }) {
  return (
    <div style={{ padding: "8px 18px 100px", overflow: "hidden" }}>
      {/* Header */}
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

      {/* Mood row */}
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

      {/* Body row */}
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

      {/* Cycle/stage row */}
      <PlannerRow kicker="STAGE" title={S.stageRow.title} sub={S.stageRow.sub} accent={S.accentLine}>
        <div style={{
          display: "flex", gap: 4, alignItems: "center", marginTop: 4,
        }}>
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
// LoggerSheet — slides up from bottom; suggestions + 14-type grid
// ─────────────────────────────────────────────────────────────────────────────
function LoggerSheet({ S, onClose, onPickMood }) {
  return (
    <SheetShell onClose={onClose} title="Smart Logger" kicker="LOG ANYTHING" maxHeight="86%">
      {/* Greeting + context */}
      <div style={{
        padding: "10px 14px", borderRadius: 14,
        background: S.accentLight, border: `1px solid ${S.accentLine}44`,
        marginBottom: 16,
      }}>
        <div style={{
          fontSize: 9.5, letterSpacing: "0.18em", fontWeight: 700,
          color: C.muted, textTransform: "uppercase",
        }}>{S.timeBlock}</div>
        <div style={{
          fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, fontWeight: 500,
          color: C.espresso, margin: "3px 0 2px",
        }}>{S.greeting}</div>
        <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic" }}>{S.phaseContext}</div>
      </div>

      {/* Suggestions */}
      <SectionHead title="Suggested for you" sub="Based on your stage, time, and what's not logged yet" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
        {S.suggestions.map((s) => (
          <button
            key={s.id}
            onClick={s.id === "mood" ? onPickMood : undefined}
            style={{
              display: "flex", alignItems: "center", gap: 11, padding: "12px 14px",
              borderRadius: 14, background: C.paperHi,
              border: s.urgent ? `1.5px solid ${s.tone}77` : "1px solid rgba(58,44,26,0.10)",
              cursor: "pointer", textAlign: "left", width: "100%",
              boxShadow: s.urgent ? `0 0 0 3px ${s.tone}11` : "none",
            }}
          >
            <span style={{
              width: 38, height: 38, borderRadius: 12,
              background: `${s.tone}22`, color: s.tone,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}><s.Icon size={18} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13.5, fontWeight: 700, color: C.espresso,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {s.label}
                {s.urgent && <span style={{
                  fontSize: 9, letterSpacing: "0.1em", fontWeight: 700,
                  color: s.tone, background: `${s.tone}22`, borderRadius: 9999,
                  padding: "2px 7px",
                }}>NUDGE</span>}
              </div>
              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>{s.sub}</div>
            </div>
            <ChevronRight size={15} style={{ color: C.muted, flexShrink: 0 }} />
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ marginTop: 18 }}>
        <SectionHead title="All log types" sub="14 categories · pick anything to log" />
        <div style={{
          marginTop: 8,
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8,
        }}>
          {GRID.map((g) => (
            <button
              key={g.id}
              onClick={g.id === "mood" ? onPickMood : undefined}
              style={{
                padding: "11px 6px", borderRadius: 12,
                background: C.paperHi, border: "1px solid rgba(58,44,26,0.10)",
                cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
              }}
            >
              <span style={{
                width: 30, height: 30, borderRadius: 9,
                background: `${g.tone}22`, color: g.tone,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}><g.Icon size={15} /></span>
              <span style={{
                fontSize: 10.5, fontWeight: 700, color: C.espresso,
                letterSpacing: "0.01em",
              }}>{g.label}</span>
            </button>
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
        Hold the + for voice. Tap the camera tile for a photo log (food, skin, scan).
      </div>
    </SheetShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MoodSheet — 5-face scale + influences + note
// ─────────────────────────────────────────────────────────────────────────────
function MoodSheet({
  S, mood, setMood, influences, toggleInfluence, note, setNote,
  onClose, onSave,
}) {
  const valid = mood != null;
  return (
    <SheetShell onClose={onClose} title="Log your mood" kicker="MOOD · 8:42PM" maxHeight="86%">
      {/* Phase chip */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "4px 10px", borderRadius: 9999,
        background: S.accentLight, border: `1px solid ${S.accentLine}55`,
        color: C.espresso, fontSize: 11, fontWeight: 600, marginBottom: 12,
      }}>
        <span>{S.headerEmoji}</span> {S.headerSub}
      </div>

      {/* Faces */}
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

      {/* Influences */}
      <div style={{ marginTop: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.espresso }}>What influenced this?</div>
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10,
        }}>
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

      {/* Note */}
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

      {/* Save */}
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
    <SheetShell onClose={onDismiss} title="A note from Jess" kicker="PATTERN SPOTTED" maxHeight="62%" gold>
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

// ─────────────────────────────────────────────────────────────────────────────
// AcceptedCard — confirmation after accepting Jess's insight
// ─────────────────────────────────────────────────────────────────────────────
function AcceptedCard({ S, onClose }) {
  return (
    <SheetShell onClose={onClose} title="Done" kicker="ACCEPTED" maxHeight="52%" gold>
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
// SheetShell — reusable bottom sheet container
// ─────────────────────────────────────────────────────────────────────────────
function SheetShell({ children, onClose, title, kicker, maxHeight = "80%", gold = false }) {
  return (
    <>
      {/* Backdrop */}
      <div style={{
        position: "absolute", inset: 0, background: "rgba(26,20,16,0.45)",
        zIndex: 5,
      }} onClick={onClose} />

      {/* Sheet */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0,
        background: C.cream, borderRadius: "26px 26px 0 0",
        padding: "10px 18px 24px",
        maxHeight, overflowY: "auto",
        zIndex: 6,
        boxShadow: "0 -12px 30px rgba(0,0,0,0.18)",
        animation: "fwSheetUp .25s ease",
      }}>
        <style>{`@keyframes fwSheetUp { from { transform: translateY(20%); opacity: 0.7; } to { transform: translateY(0); opacity: 1; } }`}</style>

        {/* Grab handle */}
        <div style={{
          width: 44, height: 4, background: "rgba(58,44,26,0.18)",
          borderRadius: 9999, margin: "4px auto 14px",
        }} />

        {/* Head */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 12,
        }}>
          <div>
            <div style={{
              fontSize: 9.5, letterSpacing: "0.18em", fontWeight: 700,
              color: gold ? C.goldDeep : C.muted, textTransform: "uppercase",
            }}>{kicker}</div>
            <div style={{
              fontFamily: "'Fraunces', Georgia, serif", fontSize: 19, fontWeight: 500,
              color: C.espresso,
            }}>{title}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "rgba(58,44,26,0.06)", border: "none",
            color: C.espresso, cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}>
            <X size={15} />
          </button>
        </div>

        {children}
      </div>
    </>
  );
}

function SectionHead({ title, sub }) {
  return (
    <div>
      <div style={{
        fontSize: 9.5, letterSpacing: "0.18em", fontWeight: 700,
        color: C.muted, textTransform: "uppercase",
      }}>{title}</div>
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
