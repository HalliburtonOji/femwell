// ─────────────────────────────────────────────────────────────────────────────
// PlannerV2Shell — production planner.
//
// SKELETON COMMIT (this commit). Layout + hero + 12-row order + DEV pill
// in place. Card contents are minimal placeholders. Real entity data
// wiring lands in subsequent commits, one row at a time, after Halli
// verifies the layout matches the approved UnifiedPlannerDemo.
//
// Locked row order:
//   1.  Jess Hero band
//   2.  My Lists
//   3.  Schedule & Cycle (compact, expand on tap)
//   4.  Your Day (Morning · Afternoon · Evening)
//   5.  Your Body Today (mood · energy · sleep · symptoms)
//   6.  Stage Row (StageRow component — life-stage-specific cards)
//   7.  Condition Row (ConditionRow component — condition-specific cards)
//   8.  Rituals
//   9.  Nourishment
//  10.  Mind & Insight
//  11.  Care
//  12.  Tonight & Tomorrow
//
// Brand rule: NO emoji codepoints. Lucide icons + custom SVG only.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Sun, Moon, Sparkles, Layers, X, Check, Plus, ChevronLeft, ChevronRight,
  ChevronDown, ChevronUp, Activity, Calendar, Heart, Droplets, Pill,
  BookOpen, FileText, ListChecks, Coffee, MoonStar, Battery, Smile,
  Frown, Meh, MessageCircle, CalendarPlus,
} from "lucide-react";
import StageRow from "@/components/planner-v2/StageRows";
import ConditionRow from "@/components/planner-v2/ConditionRows";

// ─── Tokens (match UnifiedPlannerDemo) ──────────────────────────────────────

const C = {
  cream:       "#F4EDDB",
  paper:       "#FBF6E6",
  paperHi:     "#FFFFFF",
  espresso:    "#3A2C1A",
  espressoMid: "#6B5840",
  plum:        "#4A2A3A",
  plumMid:     "#7B5E6B",
  blush:       "#E8B4B8",
  sage:        "#8FAF8F",
  muted:       "#9B8B7A",
  gold:        "#D4AF37",
  goldDeep:    "#A6862B",
  rose:        "#D45E52",
  pMenstrual:  "#8B2635",
  pFollicular: "#C17B4E",
  pOvulatory:  "#C4933F",
  pLuteal:     "#5B4A8A",
};

const PHASE_COLOR = {
  menstrual:  C.pMenstrual,
  follicular: C.pFollicular,
  ovulatory:  C.pOvulatory,
  luteal:     C.pLuteal,
};

const shell = {
  minHeight: "100vh",
  background: C.cream,
  paddingBottom: 100,
  fontFamily: "'Inter', system-ui, sans-serif",
  color: C.espresso,
};

const cardStyle = {
  background: C.paperHi,
  borderRadius: 14,
  padding: 16,
  boxShadow: "0 2px 8px rgba(58,44,26,0.08)",
  display: "flex",
  flexDirection: "column",
  gap: 8,
  height: "100%",
  boxSizing: "border-box",
};

const kicker = {
  fontSize: 10,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: C.muted,
  fontWeight: 700,
  fontFamily: "'Inter', system-ui, sans-serif",
};

const cardTitle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 17,
  fontWeight: 500,
  color: C.espresso,
  margin: "2px 0",
  lineHeight: 1.25,
  letterSpacing: "-0.005em",
};

const cardSub = {
  fontSize: 12,
  color: C.muted,
  margin: "4px 0 0",
  lineHeight: 1.5,
};

// ─── DEV pill (gated on ?dev=1 or Vite dev) ─────────────────────────────────

function shouldShowDev() {
  try {
    if (import.meta.env && import.meta.env.DEV) return true;
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return params.get("dev") === "1";
  } catch { return false; }
}
function readDevStage() {
  try { return localStorage.getItem("femwell_dev_stage") || ""; } catch { return ""; }
}
function writeDevStage(v) {
  try {
    if (v) localStorage.setItem("femwell_dev_stage", v);
    else   localStorage.removeItem("femwell_dev_stage");
  } catch {}
}
function readDevConditions() {
  try {
    const raw = localStorage.getItem("femwell_dev_conditions");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
function writeDevConditions(arr) {
  try {
    if (arr && arr.length > 0) localStorage.setItem("femwell_dev_conditions", JSON.stringify(arr));
    else                       localStorage.removeItem("femwell_dev_conditions");
  } catch {}
}

const DEV_STAGES = [
  { id: "",                label: "Use real" },
  { id: "reproductive",    label: "Reproductive" },
  { id: "teen",            label: "Teen" },
  { id: "pre-ttc",         label: "Pre-TTC" },
  { id: "ttc",             label: "TTC" },
  { id: "pregnant-t1",     label: "Pregnant · T1" },
  { id: "pregnant-t2",     label: "Pregnant · T2" },
  { id: "pregnant-t3",     label: "Pregnant · T3" },
  { id: "postpartum",      label: "Postpartum" },
  { id: "perimenopause",   label: "Perimenopause" },
  { id: "menopause",       label: "Menopause" },
  { id: "post-menopause",  label: "Post-menopause" },
];
const DEV_CONDITIONS = [
  { key: "pmdd",                label: "PMDD" },
  { key: "pcos",                label: "PCOS" },
  { key: "endo",                label: "Endometriosis" },
  { key: "fibroids",            label: "Fibroids" },
  { key: "thyroid",             label: "Thyroid" },
  { key: "adenomyosis",         label: "Adenomyosis" },
  { key: "anxiety-depression",  label: "Anxiety / Depression" },
  { key: "me-cfs",              label: "ME / CFS" },
];

function DevDrawer({ devStage, devConditions, onChangeStage, onChangeConditions }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);
  function pickStage(id) { writeDevStage(id); onChangeStage(id); }
  function toggleCondition(key) {
    const next = devConditions.includes(key)
      ? devConditions.filter((c) => c !== key)
      : [...devConditions, key];
    writeDevConditions(next);
    onChangeConditions(next);
  }
  const overrideActive = !!devStage;
  const condCount = devConditions.length;
  const shortStage = overrideActive
    ? (DEV_STAGES.find((s) => s.id === devStage)?.label || devStage)
    : "Real";
  return (
    <div ref={wrapRef} style={{ position: "fixed", top: 12, right: 12, zIndex: 1000 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Open dev controls"
        style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "5px 11px", borderRadius: 9999,
          border: "1px solid rgba(58,44,26,0.18)",
          background: overrideActive || condCount > 0 ? C.espresso : "rgba(251,246,230,0.95)",
          color: overrideActive || condCount > 0 ? C.cream : C.espresso,
          cursor: "pointer", minHeight: 28,
          fontFamily: "'Inter', system-ui, sans-serif",
          boxShadow: "0 2px 8px rgba(58,44,26,0.16)",
        }}
      >
        <Layers size={11} strokeWidth={2.2} />
        <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.16em", opacity: 0.7 }}>DEV</span>
        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em" }}>
          {shortStage}{condCount > 0 ? ` · ${condCount}c` : ""}
        </span>
      </button>
      {open && (
        <div role="dialog" aria-label="Dev controls" style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          background: C.paper, border: `1px solid rgba(58,44,26,0.12)`,
          borderRadius: 14, boxShadow: "0 8px 24px rgba(58,44,26,0.16)",
          padding: 14, minWidth: 280, maxWidth: "calc(100vw - 32px)",
        }}>
          <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.20em", textTransform: "uppercase", color: C.goldDeep, fontWeight: 700 }}>DEV ONLY</div>
              <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, fontWeight: 500, color: C.espresso }}>Preview stage + conditions</div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" style={{
              width: 26, height: 26, borderRadius: 9999, background: "rgba(58,44,26,0.08)", border: "none",
              color: C.espresso, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0,
            }}>
              <X size={13} strokeWidth={2.2} />
            </button>
          </header>
          <div style={{ ...kicker, marginBottom: 6 }}>STAGE</div>
          <div role="list" style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14 }}>
            {DEV_STAGES.map((s) => {
              const active = s.id === devStage || (!devStage && s.id === "");
              return (
                <button key={s.id || "__real__"} role="listitem" type="button" onClick={() => pickStage(s.id)} style={{
                  padding: "5px 11px", borderRadius: 9999,
                  fontFamily: "'Inter', system-ui, sans-serif", fontSize: 11, fontWeight: 600, cursor: "pointer",
                  border: active ? `1px solid ${C.espresso}` : `1px solid rgba(58,44,26,0.16)`,
                  background: active ? C.espresso : "transparent",
                  color: active ? C.cream : C.espresso,
                }}>{s.label}</button>
              );
            })}
          </div>
          <div style={{ ...kicker, marginBottom: 6, paddingTop: 6, borderTop: "1px dashed rgba(58,44,26,0.10)" }}>CONDITIONS</div>
          <div role="list" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {DEV_CONDITIONS.map((c) => {
              const on = devConditions.includes(c.key);
              return (
                <button key={c.key} role="listitem" type="button" aria-pressed={on} onClick={() => toggleCondition(c.key)} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "7px 10px", borderRadius: 10,
                  border: `1px solid ${on ? C.goldDeep : "rgba(58,44,26,0.10)"}`,
                  background: on ? "rgba(166,134,43,0.16)" : "transparent",
                  color: C.espresso, fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", textAlign: "left",
                }}>
                  <span style={{
                    width: 16, height: 16, borderRadius: 4,
                    background: on ? C.goldDeep : "transparent",
                    border: `1.5px solid ${on ? C.goldDeep : "rgba(58,44,26,0.22)"}`,
                    display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>{on && <Check size={11} style={{ color: "#fff" }} />}</span>
                  <span style={{ flex: 1 }}>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SliderRow primitive ────────────────────────────────────────────────────
// Horizontal scroll-snap row used by every section that holds multiple cards.

function SliderRow({ label, children, slotWidth = "calc(100% - 32px)", maxSlotWidth = 520 }) {
  const trackRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const count = React.Children.count(children);

  function jumpTo(i) {
    const clamped = Math.max(0, Math.min(count - 1, i));
    setIdx(clamped);
    const track = trackRef.current; if (!track) return;
    const child = track.children[clamped];
    if (child) track.scrollTo({ left: child.offsetLeft - track.offsetLeft, behavior: "smooth" });
  }
  function onScroll() {
    const track = trackRef.current; if (!track) return;
    let best = 0, bestDist = Infinity;
    Array.from(track.children).forEach((el, i) => {
      const left = el.offsetLeft - track.offsetLeft;
      const dist = Math.abs(left - track.scrollLeft);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    setIdx(best);
  }
  return (
    <section style={{ marginBottom: 18 }} aria-label={label || "row"}>
      {(label || count > 1) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", marginBottom: 8 }}>
          <span style={kicker}>{label ? label.toUpperCase() : ""}</span>
          {count > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <button onClick={() => jumpTo(idx - 1)} style={arrowBtn} aria-label="Previous"><ChevronLeft size={14} /></button>
              {Array.from({ length: count }).map((_, i) => (
                <span key={i} style={{
                  width: 6, height: 6, borderRadius: 9999,
                  background: i === idx ? C.espresso : "rgba(58,44,26,0.20)",
                }} />
              ))}
              <button onClick={() => jumpTo(idx + 1)} style={arrowBtn} aria-label="Next"><ChevronRight size={14} /></button>
            </div>
          )}
        </div>
      )}
      <div ref={trackRef} onScroll={onScroll} style={{
        display: "flex", overflowX: "auto",
        scrollSnapType: "x mandatory", gap: 12,
        padding: "4px 16px", scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
      }}>
        {React.Children.map(children, (child, i) => (
          <div key={i} style={{
            flex: `0 0 ${slotWidth}`,
            maxWidth: maxSlotWidth,
            scrollSnapAlign: "start",
          }}>{child}</div>
        ))}
      </div>
    </section>
  );
}

const arrowBtn = {
  width: 22, height: 22, borderRadius: 9999,
  background: "transparent", border: "none", color: C.muted, cursor: "pointer",
  display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0,
};

const placeholderHint = {
  fontSize: 11, color: C.muted, fontStyle: "italic",
  margin: "8px 0 0", lineHeight: 1.5,
};

// ─── 1. Jess Hero band ──────────────────────────────────────────────────────

// Phase-aware Jess greeting line (static copy per phase). Pure text — no
// CSS / structural change to the hero band.
const PHASE_LINE = {
  menstrual:  "Energy turns inward this week. Rest is the work.",
  follicular: "Something new wants to begin. Lean into momentum.",
  ovulatory:  "Your voice carries today. Visibility lands well.",
  luteal:     "Boundaries feel natural now. Protect your evenings.",
};

function greetingFor(hour) {
  if (hour < 5)  return "Resting well";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Resting well";
}

// Mirrors src/pages/Today.jsx → extractDisplayName.
// Priority: profile.display_name (use as-is, e.g. "Test Halli") →
// user.full_name first token → sanitised email prefix → null.
function firstNameFrom(user, profile) {
  if (profile && profile.display_name) return profile.display_name;
  if (user && user.full_name) return user.full_name.split(" ")[0];
  if (user && user.email) {
    const prefix = user.email.split("@")[0];
    const words = prefix.split(/[0-9_.\-]+/).filter(Boolean);
    if (words[0]) return words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
  }
  return "";
}

function JessHero({ phase, cycleDay, profile, user }) {
  const phaseLabel = phase ? phase[0].toUpperCase() + phase.slice(1) : null;
  const stageLabel = profile?.life_stage || null;
  const tone = PHASE_COLOR[phase] || C.gold;
  const hour = (typeof window !== "undefined") ? new Date().getHours() : 9;
  const greet = greetingFor(hour);
  const firstName = firstNameFrom(user, profile);
  const greetingText = firstName ? `${greet}, ${firstName}.` : `${greet}.`;
  const phaseLine = (phase && PHASE_LINE[phase]) || "One day, in your shape.";
  return (
    <div style={{
      padding: "24px 16px 22px",
      background: `linear-gradient(180deg, ${C.cream} 0%, ${C.paper} 100%)`,
      borderBottom: `1px solid rgba(58,44,26,0.08)`,
      position: "relative",
    }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, ...kicker }}>
          <Sparkles size={11} style={{ color: tone }} />
          {phaseLabel ? `${phaseLabel}${cycleDay ? ` · DAY ${cycleDay}` : ""}` : "Today"}
          {stageLabel ? ` · ${stageLabel.toUpperCase()}` : ""}
        </div>
        <h1 style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: 28, fontWeight: 500, color: C.espresso,
          letterSpacing: "-0.02em", margin: "6px 0 4px", lineHeight: 1.15,
        }}>{greetingText}</h1>
        <p style={{
          fontFamily: "Georgia, serif", fontStyle: "italic",
          fontSize: 13.5, color: C.plumMid, margin: 0, lineHeight: 1.5,
        }}>
          {phaseLine}
        </p>
      </div>
    </div>
  );
}

// ─── 2. My Lists ────────────────────────────────────────────────────────────

function MyListsRow() {
  return (
    <SliderRow label="My lists">
      <article style={cardStyle}>
        <span style={kicker}>TASKS · TODAY</span>
        <h3 style={cardTitle}>Your list</h3>
        <p style={placeholderHint}>[skeleton] Reads Task entity where due_date = today. Tap to complete; Add to create.</p>
        <button style={ctaPill}><Plus size={11} /> Add a task</button>
      </article>
    </SliderRow>
  );
}

// ─── 3. Schedule & Cycle (compact, expand on tap) ───────────────────────────

function ScheduleCard() {
  const [expanded, setExpanded] = useState(false);
  return (
    <article style={{ ...cardStyle, minHeight: expanded ? undefined : 96 }}>
      <button onClick={() => setExpanded((v) => !v)} aria-expanded={expanded} style={cardToggleBtn}>
        <span style={{ width: 28, height: 28, borderRadius: 9, background: `${C.gold}1F`, color: C.gold, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Activity size={13} />
        </span>
        <div style={{ flex: 1, textAlign: "left" }}>
          <span style={kicker}>SCHEDULE</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Today, hour by hour</h3>
        </div>
        <span style={chevronPill}>{expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
      </button>
      {!expanded && (
        <p style={cardSub}>[skeleton] Next event line will render here when wired.</p>
      )}
      {expanded && (
        <>
          <p style={placeholderHint}>[skeleton] Will read Event entity for today + render timeline of hour-blocks.</p>
          <button style={ctaPill}><CalendarPlus size={11} /> Add event</button>
        </>
      )}
    </article>
  );
}

function CycleCard({ phase, cycleDay, profile }) {
  const [expanded, setExpanded] = useState(false);
  const tone = PHASE_COLOR[phase] || C.gold;
  const phaseLabel = phase ? `${phase[0].toUpperCase()}${phase.slice(1)} week` : "This cycle";
  return (
    <article style={{ ...cardStyle, minHeight: expanded ? undefined : 96 }}>
      <button onClick={() => setExpanded((v) => !v)} aria-expanded={expanded} style={cardToggleBtn}>
        <span style={{ width: 28, height: 28, borderRadius: 9, background: `${tone}1F`, color: tone, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Calendar size={13} />
        </span>
        <div style={{ flex: 1, textAlign: "left" }}>
          <span style={kicker}>CYCLE</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>{phaseLabel}</h3>
        </div>
        <span style={chevronPill}>{expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
      </button>
      {!expanded && (
        <p style={cardSub}>
          {cycleDay ? <>Day <strong style={{ color: C.espresso, fontWeight: 700 }}>{cycleDay}</strong> of {profile?.cycle_avg_length || 28}</> : "Tap to open the calendar."}
        </p>
      )}
      {expanded && (
        <p style={placeholderHint}>[skeleton] Mini calendar (4 weekly rows) with phase-coloured cells will render here when wired to CycleLog.</p>
      )}
    </article>
  );
}

function ScheduleCycleSection({ phase, cycleDay, profile }) {
  return (
    <SliderRow label="Schedule & cycle">
      <ScheduleCard />
      <CycleCard phase={phase} cycleDay={cycleDay} profile={profile} />
    </SliderRow>
  );
}

// ─── 4. Your Day (Morning · Afternoon · Evening) ────────────────────────────

const TIME_OF_DAY = [
  { id: "morning",   label: "MORNING",   Icon: Sun,      accent: C.gold  },
  { id: "afternoon", label: "AFTERNOON", Icon: Activity, accent: C.sage  },
  { id: "evening",   label: "EVENING",   Icon: Moon,     accent: C.blush },
];

function TimeOfDayCard({ variant }) {
  return (
    <article style={{ ...cardStyle, borderLeft: `4px solid ${variant.accent}`, minHeight: 380 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9999,
          background: `${variant.accent}1F`, color: variant.accent,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><variant.Icon size={14} /></span>
        <span style={{ ...kicker, color: variant.accent }}>{variant.label}</span>
      </div>
      <p style={placeholderHint}>
        [skeleton] Each time-of-day card will list Journey · Nourishment · Tasks sections wired
        to HabitLog / MealLog / Task entities scoped to {variant.id}.
      </p>
      <button style={{ ...ctaPill, borderColor: `${variant.accent}55`, color: variant.accent }}>
        <Plus size={11} /> Add to {variant.id}
      </button>
    </article>
  );
}

function YourDaySection() {
  return (
    <SliderRow label="Your day">
      <TimeOfDayCard variant={TIME_OF_DAY[0]} />
      <TimeOfDayCard variant={TIME_OF_DAY[1]} />
      <TimeOfDayCard variant={TIME_OF_DAY[2]} />
    </SliderRow>
  );
}

// ─── 5. Your Body Today ─────────────────────────────────────────────────────

function BodyTodayCard() {
  return (
    <article style={cardStyle}>
      <span style={kicker}>YOUR BODY TODAY</span>
      <h3 style={cardTitle}>Mood · energy · sleep · symptoms</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginTop: 4 }}>
        {[
          { label: "Mood",     Icon: Smile,    note: "Tap to log" },
          { label: "Energy",   Icon: Battery,  note: "Tap to log" },
          { label: "Sleep",    Icon: MoonStar, note: "Tap to log" },
          { label: "Symptoms", Icon: Heart,    note: "Tap to log" },
        ].map((t) => (
          <div key={t.label} style={{
            background: C.cream, borderRadius: 10,
            border: "1px solid rgba(58,44,26,0.06)",
            padding: "10px 12px",
            display: "flex", flexDirection: "column", gap: 4,
          }}>
            <t.Icon size={14} style={{ color: C.muted }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: C.espresso }}>{t.label}</span>
            <span style={{ fontSize: 10.5, color: C.muted, fontStyle: "italic" }}>{t.note}</span>
          </div>
        ))}
      </div>
      <p style={placeholderHint}>[skeleton] Each tile reads / writes today's CheckIn entity.</p>
    </article>
  );
}

function YourBodyTodaySection() {
  return (
    <SliderRow label="Your body today">
      <BodyTodayCard />
    </SliderRow>
  );
}

// ─── 6 + 7. Stage row + Condition row (real components from earlier work) ──

// StageRow and ConditionRow already exist and ship the per-stage /
// per-condition card content. They're imported at the top of this file
// and mounted directly below — no wrapper needed.

// ─── 8. Rituals ─────────────────────────────────────────────────────────────

function RitualsSection() {
  return (
    <SliderRow label="Rituals">
      <article style={cardStyle}>
        <span style={kicker}>RITUALS</span>
        <h3 style={cardTitle}>Create your own</h3>
        <p style={placeholderHint}>[skeleton] RitualBundles entity → cards with "FOR TODAY" badge when ritual is in today's stack.</p>
        <button style={ctaPill}><Plus size={11} /> Create ritual</button>
      </article>
      <article style={cardStyle}>
        <span style={kicker}>BUNDLE</span>
        <h3 style={cardTitle}>Morning anchor</h3>
        <p style={cardSub}>[skeleton] Sample bundle preview card.</p>
        <button style={ctaPill}>Add to today</button>
      </article>
      <article style={cardStyle}>
        <span style={kicker}>BUNDLE</span>
        <h3 style={cardTitle}>Evening close</h3>
        <p style={cardSub}>[skeleton] Sample bundle preview card.</p>
        <button style={ctaPill}>Add to today</button>
      </article>
    </SliderRow>
  );
}

// ─── 9. Nourishment ─────────────────────────────────────────────────────────

function NourishmentSection() {
  return (
    <SliderRow label="Nourishment">
      <article style={cardStyle}>
        <span style={kicker}>MEALS</span>
        <h3 style={cardTitle}>Today</h3>
        <p style={placeholderHint}>[skeleton] MealLog rows for today + add buttons.</p>
        <button style={ctaPill}><Plus size={11} /> Log meal</button>
      </article>
      <article style={cardStyle}>
        <span style={kicker}>HYDRATION</span>
        <h3 style={cardTitle}>0 of 8 glasses</h3>
        <p style={placeholderHint}>[skeleton] HydrationLog counter + 8-glass strip.</p>
      </article>
      <article style={cardStyle}>
        <span style={kicker}>EAT FOR PHASE</span>
        <h3 style={cardTitle}>Suggestions</h3>
        <p style={placeholderHint}>[skeleton] Static phase-aware food guidance.</p>
      </article>
    </SliderRow>
  );
}

// ─── 10. Mind & Insight ─────────────────────────────────────────────────────

function MindInsightSection() {
  return (
    <SliderRow label="Mind & insight">
      <article style={cardStyle}>
        <span style={kicker}>JOURNAL</span>
        <h3 style={cardTitle}>Last entry</h3>
        <p style={placeholderHint}>[skeleton] Latest JournalEntry preview + Write CTA.</p>
        <button style={ctaPill}><BookOpen size={11} /> Write</button>
      </article>
      <article style={cardStyle}>
        <span style={kicker}>MOOD TREND</span>
        <h3 style={cardTitle}>7 days</h3>
        <p style={placeholderHint}>[skeleton] CheckIn.mood over last 7 days as dots.</p>
      </article>
      <article style={cardStyle}>
        <span style={kicker}>AFFIRMATION</span>
        <h3 style={cardTitle}>Today's note</h3>
        <p style={placeholderHint}>[skeleton] Phase-specific affirmation copy.</p>
      </article>
    </SliderRow>
  );
}

// ─── 11. Care ───────────────────────────────────────────────────────────────

function CareSection() {
  return (
    <SliderRow label="Care">
      <article style={cardStyle}>
        <span style={kicker}>MEDICATIONS</span>
        <h3 style={cardTitle}>Today's stack</h3>
        <p style={placeholderHint}>[skeleton] MedicationLog rows + Log button.</p>
        <button style={ctaPill}><Pill size={11} /> Log a dose</button>
      </article>
      <article style={cardStyle}>
        <span style={kicker}>SUPPLEMENTS</span>
        <h3 style={cardTitle}>Today's supplements</h3>
        <p style={placeholderHint}>[skeleton] Daily supplements list with tap-to-take.</p>
      </article>
      <article style={cardStyle}>
        <span style={kicker}>GP REPORT</span>
        <h3 style={cardTitle}>Doctor-Ready Diary</h3>
        <p style={placeholderHint}>[skeleton] Navigates to /DoctorExport.</p>
        <button style={ctaPill}><FileText size={11} /> Open export</button>
      </article>
    </SliderRow>
  );
}

// ─── 12. Tonight & Tomorrow ─────────────────────────────────────────────────

function TonightSection() {
  return (
    <SliderRow label="Tonight & tomorrow">
      <article style={cardStyle}>
        <span style={kicker}>TONIGHT</span>
        <h3 style={cardTitle}>Wind down</h3>
        <p style={placeholderHint}>[skeleton] Sleep intention textarea → CheckIn.sleep_intention.</p>
      </article>
      <article style={cardStyle}>
        <span style={kicker}>TOMORROW</span>
        <h3 style={cardTitle}>What's on</h3>
        <p style={placeholderHint}>[skeleton] Tomorrow's Events + Tasks count summary.</p>
      </article>
    </SliderRow>
  );
}

// ─── Shared button styles ───────────────────────────────────────────────────

const ctaPill = {
  alignSelf: "flex-start", marginTop: 8,
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "6px 12px", borderRadius: 9999,
  background: "transparent", border: "1px solid rgba(58,44,26,0.18)",
  color: C.espresso, fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: 11, fontWeight: 700, cursor: "pointer",
};

const cardToggleBtn = {
  background: "transparent", border: "none", padding: 0,
  width: "100%", cursor: "pointer",
  display: "flex", alignItems: "center", gap: 8,
};

const chevronPill = {
  width: 26, height: 26, borderRadius: 9999,
  background: C.cream, border: "1px solid rgba(58,44,26,0.10)",
  color: C.espresso,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  padding: 0, flexShrink: 0,
};

// ─── Main shell ─────────────────────────────────────────────────────────────

export default function PlannerV2Shell({
  user,
  profile,
  effectiveLifeStage: effectiveLifeStageProp,
  effectiveConditions: effectiveConditionsProp,
  selectedPhase,
  selectedCycleDay,
} = {}) {

  // DEV state — writes to localStorage; reads merge with real props.
  const [devStage, setDevStage]           = useState(() => readDevStage());
  const [devConditions, setDevConditions] = useState(() => readDevConditions());

  // Effective stage + conditions — DEV override wins, then real props,
  // then profile fields, then defaults.
  const effectiveLifeStage = useMemo(
    () => devStage || effectiveLifeStageProp || profile?.life_stage || "reproductive",
    [devStage, effectiveLifeStageProp, profile?.life_stage],
  );
  const effectiveConditions = useMemo(
    () => devConditions.length > 0
      ? devConditions
      : (Array.isArray(effectiveConditionsProp) && effectiveConditionsProp.length > 0
          ? effectiveConditionsProp
          : (Array.isArray(profile?.conditions) ? profile.conditions : [])),
    [devConditions, effectiveConditionsProp, profile?.conditions],
  );

  const phase    = selectedPhase  || profile?.current_phase || "luteal";
  const cycleDay = selectedCycleDay || profile?.cycle_day  || null;

  return (
    <div style={shell}>
      {shouldShowDev() && (
        <DevDrawer
          devStage={devStage}
          devConditions={devConditions}
          onChangeStage={setDevStage}
          onChangeConditions={setDevConditions}
        />
      )}

      {/* 1 — Jess Hero band */}
      <JessHero phase={phase} cycleDay={cycleDay} profile={profile} user={user} />

      <div style={{ maxWidth: 640, margin: "0 auto", paddingTop: 18 }}>

        {/* 2 — My Lists */}
        <MyListsRow />

        {/* 3 — Schedule & Cycle (compact, expand on tap) */}
        <ScheduleCycleSection phase={phase} cycleDay={cycleDay} profile={profile} />

        {/* 4 — Your Day (Morning · Afternoon · Evening) */}
        <YourDaySection />

        {/* 5 — Your Body Today */}
        <YourBodyTodaySection />

        {/* 6 — Stage Row (life-stage-specific cards from StageRows.jsx) */}
        <StageRow
          stage={effectiveLifeStage}
          profile={profile}
          phase={phase}
          cycleDay={cycleDay}
        />

        {/* 7 — Condition Row (from ConditionRows.jsx) */}
        <ConditionRow
          conditions={effectiveConditions}
          profile={profile}
          phase={phase}
          cycleDay={cycleDay}
        />

        {/* 8 — Rituals */}
        <RitualsSection />

        {/* 9 — Nourishment */}
        <NourishmentSection />

        {/* 10 — Mind & Insight */}
        <MindInsightSection />

        {/* 11 — Care */}
        <CareSection />

        {/* 12 — Tonight & Tomorrow */}
        <TonightSection />

      </div>
    </div>
  );
}
