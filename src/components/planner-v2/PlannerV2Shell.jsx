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
import { base44 } from "@/api/base44Client";
import { openLogger } from "@/components/UniversalLogger";

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
// Reads ALL PersonalTasks for today (completed + incomplete) so finished tasks
// stay visible with a strikethrough. Tap the circle → optimistic toggle of the
// `completed` boolean (either direction). Three "Add to morning/afternoon/
// evening" buttons open an inline text input that creates a new PersonalTasks
// row tagged with the chosen time_of_day.

function MyListsRow({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addMode, setAddMode] = useState(null); // 'morning' | 'afternoon' | 'evening' | null
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) { setLoading(false); return; }
    (async () => {
      try {
        const rows = await base44.entities.PersonalTasks.filter(
          { user_id: user.id, date: todayStr },
          "created_date",
          50,
        );
        if (!cancelled) setItems(Array.isArray(rows) ? rows : []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, todayStr]);

  useEffect(() => {
    if (addMode && inputRef.current) {
      try { inputRef.current.focus(); } catch {}
    }
  }, [addMode]);

  async function toggleDone(id) {
    let nextCompleted = false;
    setItems((prev) => prev.map((t) => {
      if (t.id !== id) return t;
      nextCompleted = !t.completed;
      return { ...t, completed: nextCompleted };
    }));
    try {
      await base44.entities.PersonalTasks.update(id, { completed: nextCompleted });
    } catch {
      // revert on failure
      setItems((prev) => prev.map((t) =>
        t.id === id ? { ...t, completed: !nextCompleted } : t
      ));
    }
  }

  async function confirmAdd() {
    const title = draft.trim();
    if (!title || !addMode || !user?.id || saving) return;
    setSaving(true);
    try {
      const created = await base44.entities.PersonalTasks.create({
        user_id: user.id,
        date: todayStr,
        title,
        time_of_day: addMode,
        completed: false,
      });
      if (created && created.id) {
        setItems((prev) => [...prev, created]);
      }
      setDraft("");
      setAddMode(null);
    } catch {
      // silent — user can retry
    } finally {
      setSaving(false);
    }
  }

  const slotOrder = { morning: 0, afternoon: 1, evening: 2 };
  const ordered = useMemo(() => {
    return [...items].sort((a, b) => {
      // 1) incomplete first, completed last
      const ca = a?.completed ? 1 : 0;
      const cb = b?.completed ? 1 : 0;
      if (ca !== cb) return ca - cb;
      // 2) then morning → afternoon → evening
      const sa = slotOrder[(a?.time_of_day || "").toLowerCase()] ?? 3;
      const sb = slotOrder[(b?.time_of_day || "").toLowerCase()] ?? 3;
      if (sa !== sb) return sa - sb;
      // 3) then creation order
      const ta = a?.created_date || a?.created_at || "";
      const tb = b?.created_date || b?.created_at || "";
      return String(ta).localeCompare(String(tb));
    });
  }, [items]);

  return (
    <SliderRow label="My lists">
      <article style={cardStyle}>
        <span style={kicker}>TASKS · TODAY</span>
        <h3 style={cardTitle}>Your list</h3>

        {!loading && ordered.length === 0 && (
          <p style={placeholderHint}>Nothing on your list yet.</p>
        )}

        {ordered.length > 0 && (
          <ul style={{
            listStyle: "none", padding: 0, margin: "4px 0 0",
            display: "flex", flexDirection: "column", gap: 4,
          }}>
            {ordered.map((t) => (
              <li key={t.id} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "7px 10px", borderRadius: 10,
                background: C.cream,
                border: "1px solid rgba(58,44,26,0.06)",
              }}>
                <button
                  type="button"
                  onClick={() => toggleDone(t.id)}
                  aria-label={t.completed ? `Mark ${t.title || "task"} not done` : `Complete ${t.title || "task"}`}
                  aria-pressed={!!t.completed}
                  style={{
                    width: 20, height: 20, borderRadius: 9999,
                    background: t.completed ? C.espresso : "transparent",
                    border: `1.5px solid ${t.completed ? C.espresso : "rgba(58,44,26,0.22)"}`,
                    cursor: "pointer", padding: 0, flexShrink: 0,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {t.completed && <Check size={11} style={{ color: C.cream }} />}
                </button>
                <span style={{
                  flex: 1, fontSize: 12.5, color: C.espresso, fontWeight: 600,
                  minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  textDecoration: t.completed ? "line-through" : "none",
                  opacity: t.completed ? 0.5 : 1,
                }}>
                  {t.title || "Untitled"}
                </span>
                {t.time_of_day && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: "0.10em",
                    color: C.muted, textTransform: "uppercase",
                    opacity: t.completed ? 0.5 : 1,
                  }}>{t.time_of_day}</span>
                )}
                {t.is_anchor && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: "0.10em",
                    color: C.goldDeep, padding: "2px 6px", borderRadius: 9999,
                    background: `${C.gold}22`,
                    opacity: t.completed ? 0.5 : 1,
                  }}>ANCHOR</span>
                )}
              </li>
            ))}
          </ul>
        )}

        {addMode && (
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmAdd();
                if (e.key === "Escape") { setAddMode(null); setDraft(""); }
              }}
              placeholder={`Add to ${addMode}…`}
              style={{
                flex: 1, padding: "6px 10px", borderRadius: 9999,
                border: "1px solid rgba(58,44,26,0.18)",
                background: C.cream, color: C.espresso,
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 12, outline: "none", minWidth: 0,
              }}
            />
            <button
              type="button"
              onClick={confirmAdd}
              disabled={saving || !draft.trim()}
              style={{
                padding: "6px 12px", borderRadius: 9999,
                background: C.espresso, color: C.cream, border: "none",
                fontSize: 11, fontWeight: 700,
                cursor: saving || !draft.trim() ? "default" : "pointer",
                opacity: saving || !draft.trim() ? 0.5 : 1, flexShrink: 0,
              }}
            >Add</button>
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {["morning", "afternoon", "evening"].map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => {
                setAddMode((cur) => (cur === slot ? null : slot));
                setDraft("");
              }}
              style={{
                ...ctaPill,
                marginTop: 0,
                background: addMode === slot ? "rgba(58,44,26,0.08)" : "transparent",
              }}
            >
              <Plus size={11} /> Add to {slot}
            </button>
          ))}
        </div>
      </article>
    </SliderRow>
  );
}

// ─── 3. Schedule & Cycle (compact, expand on tap) ───────────────────────────
// Schedule reads PlannerItems for today; Cycle renders the current month with
// phase-coloured cells derived from profile.last_period_start_date +
// cycle_avg_length + period_length. Both cards retain the existing chevron
// toggle and 96px collapsed height.

function fmtTime(t) {
  if (!t) return "";
  // PlannerItems.time arrives as "HH:MM" 24h. Render as e.g. "9am" / "2:30pm".
  const m = /^(\d{1,2})(?::(\d{2}))?/.exec(String(t));
  if (!m) return String(t);
  const h = Number(m[1]);
  const mm = m[2] || "00";
  const ampm = h < 12 ? "am" : "pm";
  const h12 = h === 0 ? 12 : (h > 12 ? h - 12 : h);
  return mm === "00" ? `${h12}${ampm}` : `${h12}:${mm}${ampm}`;
}

function phaseForCycleDay(dayInCycle, cycleLen, periodLen) {
  if (dayInCycle <= periodLen) return "menstrual";
  if (dayInCycle <= Math.round(cycleLen * 0.4)) return "follicular";
  if (dayInCycle <= Math.round(cycleLen * 0.55)) return "ovulatory";
  return "luteal";
}

function ScheduleCard({ user }) {
  const [expanded, setExpanded] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [timeDraft, setTimeDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) { setLoading(false); return; }
    (async () => {
      try {
        const rows = await base44.entities.PlannerItems.filter(
          { user_id: user.id, date: todayStr },
          "-created_date",
          100,
        );
        if (!cancelled) setItems(Array.isArray(rows) ? rows : []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, todayStr]);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      // Items with no time sink to the bottom; otherwise ascending by HH:MM.
      const ta = a?.time || "99:99";
      const tb = b?.time || "99:99";
      return String(ta).localeCompare(String(tb));
    });
  }, [items]);

  const nextUp = sorted.find((e) => !e.is_completed) || sorted[0] || null;

  async function confirmAddEvent() {
    const title = titleDraft.trim();
    if (!title || !user?.id || saving) return;
    setSaving(true);
    try {
      const created = await base44.entities.PlannerItems.create({
        user_id: user.id,
        title,
        category: "reminder",
        date: todayStr,
        time: timeDraft || null,
        repeat: "once",
        is_completed: false,
        created_at: new Date().toISOString(),
      });
      if (created && created.id) {
        setItems((prev) => [...prev, created]);
      }
      setTitleDraft("");
      setTimeDraft("");
      setAdding(false);
    } catch {
      // silent — user can retry
    } finally {
      setSaving(false);
    }
  }

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
        !loading && !nextUp ? (
          <p style={{ ...cardSub, fontStyle: "italic" }}>No events today.</p>
        ) : nextUp ? (
          <p style={cardSub}>
            Next · <strong style={{ color: C.espresso, fontWeight: 700 }}>
              {nextUp.time ? fmtTime(nextUp.time) : "Today"}
            </strong> {nextUp.title || "Event"}
          </p>
        ) : null
      )}

      {expanded && (
        <>
          {sorted.length === 0 && !loading && (
            <p style={{ ...cardSub, fontStyle: "italic", margin: "6px 0 0" }}>Nothing scheduled today.</p>
          )}
          {sorted.length > 0 && (
            <ul style={{
              listStyle: "none", padding: 0, margin: "6px 0 0",
              display: "flex", flexDirection: "column", gap: 4,
            }}>
              {sorted.map((e) => (
                <li key={e.id} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 10px", borderRadius: 10,
                  background: C.cream, border: "1px solid rgba(58,44,26,0.06)",
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, minWidth: 44 }}>
                    {e.time ? fmtTime(e.time) : "—"}
                  </span>
                  <span style={{
                    flex: 1, fontSize: 12.5, color: C.espresso, fontWeight: 600,
                    minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    opacity: e.is_completed ? 0.5 : 1,
                    textDecoration: e.is_completed ? "line-through" : "none",
                  }}>{e.title || "Event"}</span>
                </li>
              ))}
            </ul>
          )}

          {adding ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              <input
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                placeholder="Event title"
                autoFocus
                style={{
                  padding: "6px 10px", borderRadius: 9999,
                  border: "1px solid rgba(58,44,26,0.18)",
                  background: C.cream, color: C.espresso,
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 12, outline: "none",
                }}
              />
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  type="time"
                  value={timeDraft}
                  onChange={(e) => setTimeDraft(e.target.value)}
                  style={{
                    flex: 1, padding: "6px 10px", borderRadius: 9999,
                    border: "1px solid rgba(58,44,26,0.18)",
                    background: C.cream, color: C.espresso,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: 12, outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={confirmAddEvent}
                  disabled={saving || !titleDraft.trim()}
                  style={{
                    padding: "6px 12px", borderRadius: 9999,
                    background: C.espresso, color: C.cream, border: "none",
                    fontSize: 11, fontWeight: 700,
                    cursor: saving || !titleDraft.trim() ? "default" : "pointer",
                    opacity: saving || !titleDraft.trim() ? 0.5 : 1,
                  }}
                >Save</button>
                <button
                  type="button"
                  onClick={() => { setAdding(false); setTitleDraft(""); setTimeDraft(""); }}
                  style={{
                    padding: "6px 10px", borderRadius: 9999,
                    background: "transparent", color: C.muted,
                    border: "1px solid rgba(58,44,26,0.10)",
                    fontSize: 11, fontWeight: 700, cursor: "pointer",
                  }}
                >Cancel</button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setAdding(true)} style={ctaPill}>
              <CalendarPlus size={11} /> Add event
            </button>
          )}
        </>
      )}
    </article>
  );
}

function CycleCard({ phase, cycleDay, profile }) {
  const [expanded, setExpanded] = useState(false);
  const tone = PHASE_COLOR[phase] || C.gold;
  const phaseLabel = phase ? `${phase[0].toUpperCase()}${phase.slice(1)} week` : "This cycle";

  const cycleLen  = profile?.cycle_avg_length || 28;
  const periodLen = profile?.period_length || 5;

  // Build the current month grid (Mon → Sun). Each cell carries its
  // phase classification (if cycle anchor exists) so we can colour-code.
  const monthGrid = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Sunday=0 → shift so week starts Monday (offset 0..6 from Mon).
    const dow = firstOfMonth.getDay(); // 0=Sun
    const leadingBlanks = (dow + 6) % 7;

    const anchor = profile?.last_period_start_date
      ? new Date(profile.last_period_start_date)
      : null;
    const anchorOk = anchor && !isNaN(anchor.getTime());

    const cells = [];
    for (let i = 0; i < leadingBlanks; i++) cells.push(null);

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      let phaseKey = null;
      if (anchorOk) {
        const daysSince = Math.floor((d - anchor) / 86400000);
        if (daysSince >= 0) {
          const dayInCycle = (daysSince % cycleLen) + 1;
          phaseKey = phaseForCycleDay(dayInCycle, cycleLen, periodLen);
        }
      }
      const isToday = d.toDateString() === today.toDateString();
      cells.push({ day, phaseKey, isToday });
    }
    return cells;
  }, [profile?.last_period_start_date, cycleLen, periodLen]);

  // Calendar tone palette (per spec):
  //   menstrual = blush, follicular = sage, ovulatory = gold, luteal = muted.
  const CAL_TONE = {
    menstrual:  C.blush,
    follicular: C.sage,
    ovulatory:  C.gold,
    luteal:     C.muted,
  };
  const DOW_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
  const monthLabel = useMemo(() => {
    return new Date().toLocaleString(undefined, { month: "long", year: "numeric" });
  }, []);

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
          {cycleDay ? (
            <>Day <strong style={{ color: C.espresso, fontWeight: 700 }}>{cycleDay}</strong> of {cycleLen}</>
          ) : "Tap to open the calendar."}
        </p>
      )}

      {expanded && (
        <div style={{ marginTop: 6 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
            color: C.muted, textTransform: "uppercase", marginBottom: 6,
          }}>{monthLabel}</div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
            {DOW_LABELS.map((d, i) => (
              <div key={i} style={{
                fontSize: 9, fontWeight: 700, color: C.muted,
                textAlign: "center", letterSpacing: "0.04em",
              }}>{d}</div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {monthGrid.map((c, i) => {
              if (!c) return <div key={`b${i}`} style={{ height: 26 }} />;
              const dot = c.phaseKey ? CAL_TONE[c.phaseKey] : null;
              return (
                <div key={c.day} style={{
                  height: 26, position: "relative",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 9999,
                  background: c.isToday ? C.espresso : "transparent",
                  color: c.isToday ? C.cream : C.espresso,
                  fontSize: 11, fontWeight: c.isToday ? 700 : 500,
                }}>
                  <span>{c.day}</span>
                  {dot && !c.isToday && (
                    <span style={{
                      position: "absolute", bottom: 2, left: "50%",
                      transform: "translateX(-50%)",
                      width: 4, height: 4, borderRadius: 9999,
                      background: dot,
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          <div style={{
            display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8,
            fontSize: 9.5, color: C.muted, fontWeight: 600, letterSpacing: "0.04em",
          }}>
            {[
              ["Period",     C.blush],
              ["Follicular", C.sage],
              ["Ovulatory",  C.gold],
              ["Luteal",     C.muted],
            ].map(([label, colour]) => (
              <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: 9999, background: colour }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function ScheduleCycleSection({ phase, cycleDay, profile, user }) {
  return (
    <SliderRow label="Schedule & cycle">
      <ScheduleCard user={user} />
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

// Bucket MealLog rows by time-of-day slot:
//   morning   ← meal_type = "breakfast"
//   afternoon ← meal_type ∈ {"lunch", "snack"}
//   evening   ← meal_type = "dinner"
function bucketMealByType(mealType) {
  const m = String(mealType || "").toLowerCase();
  if (m === "breakfast") return "morning";
  if (m === "lunch" || m === "snack") return "afternoon";
  if (m === "dinner") return "evening";
  return null;
}

function TimeOfDayCard({ variant, user, meals }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) { setLoading(false); return; }
    (async () => {
      try {
        const rows = await base44.entities.PersonalTasks.filter(
          { user_id: user.id, date: todayStr, time_of_day: variant.id, completed: false },
          "created_date",
          30,
        );
        if (!cancelled) setTasks(Array.isArray(rows) ? rows : []);
      } catch {
        if (!cancelled) setTasks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, todayStr, variant.id]);

  useEffect(() => {
    if (adding && inputRef.current) {
      try { inputRef.current.focus(); } catch {}
    }
  }, [adding]);

  async function toggleDone(id) {
    let nextCompleted = false;
    setTasks((prev) => prev.map((t) => {
      if (t.id !== id) return t;
      nextCompleted = !t.completed;
      return { ...t, completed: nextCompleted };
    }));
    try {
      await base44.entities.PersonalTasks.update(id, { completed: nextCompleted });
    } catch {
      setTasks((prev) => prev.map((t) =>
        t.id === id ? { ...t, completed: !nextCompleted } : t
      ));
    }
  }

  async function confirmAddTask() {
    const title = draft.trim();
    if (!title || !user?.id || saving) return;
    setSaving(true);
    try {
      const created = await base44.entities.PersonalTasks.create({
        user_id: user.id,
        date: todayStr,
        title,
        time_of_day: variant.id,
        completed: false,
      });
      if (created && created.id) {
        setTasks((prev) => [...prev, created]);
      }
      setDraft("");
      setAdding(false);
    } catch {
      // silent — user can retry
    } finally {
      setSaving(false);
    }
  }

  const mealList = Array.isArray(meals) ? meals : [];

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

      {/* ── Journey: PersonalTasks for this time_of_day ───────────────────── */}
      <div style={{ marginTop: 4 }}>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.14em",
          color: C.muted, textTransform: "uppercase", marginBottom: 4,
        }}>Journey</div>

        {!loading && tasks.length === 0 && (
          <p style={{ ...placeholderHint, margin: "0 0 4px" }}>Nothing planned.</p>
        )}

        {tasks.length > 0 && (
          <ul style={{
            listStyle: "none", padding: 0, margin: "0 0 4px",
            display: "flex", flexDirection: "column", gap: 4,
          }}>
            {tasks.map((t) => (
              <li key={t.id} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 10px", borderRadius: 10,
                background: C.cream, border: "1px solid rgba(58,44,26,0.06)",
              }}>
                <button
                  type="button"
                  onClick={() => toggleDone(t.id)}
                  aria-label={t.completed ? `Mark ${t.title || "task"} not done` : `Complete ${t.title || "task"}`}
                  aria-pressed={!!t.completed}
                  style={{
                    width: 18, height: 18, borderRadius: 9999,
                    background: t.completed ? variant.accent : "transparent",
                    border: `1.5px solid ${t.completed ? variant.accent : "rgba(58,44,26,0.22)"}`,
                    cursor: "pointer", padding: 0, flexShrink: 0,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {t.completed && <Check size={10} style={{ color: C.cream }} />}
                </button>
                <span style={{
                  flex: 1, fontSize: 12, color: C.espresso, fontWeight: 600,
                  minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  textDecoration: t.completed ? "line-through" : "none",
                  opacity: t.completed ? 0.5 : 1,
                }}>
                  {t.title || "Untitled"}
                </span>
              </li>
            ))}
          </ul>
        )}

        {adding ? (
          <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmAddTask();
                if (e.key === "Escape") { setAdding(false); setDraft(""); }
              }}
              placeholder={`Add to ${variant.id}…`}
              style={{
                flex: 1, padding: "5px 10px", borderRadius: 9999,
                border: "1px solid rgba(58,44,26,0.18)",
                background: C.cream, color: C.espresso,
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 11.5, outline: "none", minWidth: 0,
              }}
            />
            <button
              type="button"
              onClick={confirmAddTask}
              disabled={saving || !draft.trim()}
              style={{
                padding: "5px 10px", borderRadius: 9999,
                background: C.espresso, color: C.cream, border: "none",
                fontSize: 10, fontWeight: 700,
                cursor: saving || !draft.trim() ? "default" : "pointer",
                opacity: saving || !draft.trim() ? 0.5 : 1, flexShrink: 0,
              }}
            >Add</button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            style={{ ...ctaPill, marginTop: 2, borderColor: `${variant.accent}55`, color: variant.accent }}
          >
            <Plus size={11} /> Add task
          </button>
        )}
      </div>

      <div style={{ height: 1, background: "rgba(58,44,26,0.08)", margin: "10px 0 6px" }} />

      {/* ── Nourishment: MealLog snapshot for this slot ───────────────────── */}
      <div>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.14em",
          color: C.muted, textTransform: "uppercase", marginBottom: 4,
        }}>Nourishment</div>

        {mealList.length === 0 && (
          <p style={{ ...placeholderHint, margin: "0 0 4px" }}>Nothing logged yet.</p>
        )}

        {mealList.length > 0 && (
          <ul style={{
            listStyle: "none", padding: 0, margin: "0 0 4px",
            display: "flex", flexDirection: "column", gap: 3,
          }}>
            {mealList.slice(0, 3).map((m) => (
              <li key={m.id} style={{
                fontSize: 11.5, color: C.espresso, lineHeight: 1.35,
                padding: "4px 8px", borderRadius: 8,
                background: C.cream, border: "1px solid rgba(58,44,26,0.05)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {m.raw_text || m.meal_type || "Logged meal"}
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={() => openLogger("meal")}
          style={{ ...ctaPill, marginTop: 2, borderColor: `${variant.accent}55`, color: variant.accent }}
        >
          <Plus size={11} /> Log meal
        </button>
      </div>
    </article>
  );
}

function YourDaySection({ user }) {
  // Fetch MealLog for today once and bucket by slot.
  // MealLog stores the date as `day_key` (not `date`); `meal_type` is one of
  // breakfast/lunch/dinner/snack.
  const [mealsByBucket, setMealsByBucket] = useState({ morning: [], afternoon: [], evening: [] });
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) return;
    (async () => {
      try {
        const rows = await base44.entities.MealLog.filter(
          { user_id: user.id, day_key: todayStr },
          "-logged_at",
          40,
        );
        if (cancelled) return;
        const buckets = { morning: [], afternoon: [], evening: [] };
        for (const m of rows || []) {
          const slot = bucketMealByType(m?.meal_type);
          if (slot) buckets[slot].push(m);
        }
        setMealsByBucket(buckets);
      } catch {
        if (!cancelled) setMealsByBucket({ morning: [], afternoon: [], evening: [] });
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, todayStr]);

  return (
    <SliderRow label="Your day">
      <TimeOfDayCard variant={TIME_OF_DAY[0]} user={user} meals={mealsByBucket.morning} />
      <TimeOfDayCard variant={TIME_OF_DAY[1]} user={user} meals={mealsByBucket.afternoon} />
      <TimeOfDayCard variant={TIME_OF_DAY[2]} user={user} meals={mealsByBucket.evening} />
    </SliderRow>
  );
}

// ─── 5. Your Body Today ─────────────────────────────────────────────────────
// Four slider cards (Mood · Energy · Sleep · Symptoms) wired to the
// DailyCheckins + SymptomLogs entities. The section component fetches both
// once for today and threads the values down to each card; per-field updates
// flow back through callbacks that upsert DailyCheckins (mirroring the legacy
// mood_score / energy_level fields used elsewhere).

const SLEEP_OPTIONS = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

function bodyIconChip(tone) {
  return {
    width: 28, height: 28, borderRadius: 9,
    background: `${tone}1F`, color: tone,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  };
}

function levelButton(active, accent) {
  return {
    flex: 1, height: 30, borderRadius: 9,
    background: active ? accent : C.cream,
    color: active ? C.cream : C.espresso,
    border: `1px solid ${active ? accent : "rgba(58,44,26,0.10)"}`,
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 13, fontWeight: 700, cursor: "pointer",
  };
}

function MoodCard({ value, onChange }) {
  const has = value != null && !Number.isNaN(value);
  return (
    <article style={{ ...cardStyle, minHeight: 160 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={bodyIconChip(C.rose)}><Smile size={13} /></span>
        <span style={kicker}>MOOD</span>
      </div>
      {has ? (
        <p style={{ ...cardSub, margin: "2px 0 0" }}>
          <strong style={{ color: C.espresso, fontWeight: 700 }}>{value}</strong> / 5
        </p>
      ) : (
        <p style={{ ...cardSub, margin: "2px 0 0", fontStyle: "italic" }}>Tap to log</p>
      )}
      <div style={{ display: "flex", gap: 4, marginTop: "auto" }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)} aria-pressed={value === n} style={levelButton(value === n, C.rose)}>
            {n}
          </button>
        ))}
      </div>
    </article>
  );
}

function EnergyCard({ value, onChange }) {
  const has = value != null && !Number.isNaN(value);
  return (
    <article style={{ ...cardStyle, minHeight: 160 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={bodyIconChip(C.gold)}><Battery size={13} /></span>
        <span style={kicker}>ENERGY</span>
      </div>
      {has ? (
        <p style={{ ...cardSub, margin: "2px 0 0" }}>
          <strong style={{ color: C.espresso, fontWeight: 700 }}>{value}</strong> / 5
        </p>
      ) : (
        <p style={{ ...cardSub, margin: "2px 0 0", fontStyle: "italic" }}>Tap to log</p>
      )}
      <div style={{ display: "flex", gap: 4, marginTop: "auto" }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)} aria-pressed={value === n} style={levelButton(value === n, C.gold)}>
            {n}
          </button>
        ))}
      </div>
    </article>
  );
}

function SleepCard({ value, onChange }) {
  const has = value != null && !Number.isNaN(Number(value));
  return (
    <article style={{ ...cardStyle, minHeight: 160 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={bodyIconChip(C.plum)}><MoonStar size={13} /></span>
        <span style={kicker}>SLEEP</span>
      </div>
      {has ? (
        <p style={{ ...cardSub, margin: "2px 0 0" }}>
          <strong style={{ color: C.espresso, fontWeight: 700 }}>{Number(value)}</strong> hrs
        </p>
      ) : (
        <p style={{ ...cardSub, margin: "2px 0 0", fontStyle: "italic" }}>Tap to log</p>
      )}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 4, marginTop: "auto",
      }}>
        {SLEEP_OPTIONS.map((h) => {
          const active = Number(value) === h;
          return (
            <button key={h} type="button" onClick={() => onChange(h)} aria-pressed={active} style={{
              padding: "4px 9px", borderRadius: 9999,
              background: active ? C.plum : C.cream,
              color: active ? C.cream : C.espresso,
              border: `1px solid ${active ? C.plum : "rgba(58,44,26,0.10)"}`,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 11.5, fontWeight: 700, cursor: "pointer",
            }}>{h}</button>
          );
        })}
      </div>
    </article>
  );
}

function SymptomsCard({ symptoms, onAdd }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => { if (adding && inputRef.current) { try { inputRef.current.focus(); } catch {} } }, [adding]);

  async function confirmAdd() {
    const name = draft.trim();
    if (!name || saving) return;
    setSaving(true);
    try {
      await onAdd(name);
      setDraft("");
      setAdding(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <article style={{ ...cardStyle, minHeight: 160 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={bodyIconChip(C.sage)}><Heart size={13} /></span>
        <span style={kicker}>SYMPTOMS</span>
      </div>

      {(!symptoms || symptoms.length === 0) ? (
        <p style={{ ...cardSub, margin: "2px 0 0", fontStyle: "italic" }}>No symptoms logged</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
          {symptoms.map((s) => (
            <span key={s.id} style={{
              fontSize: 11, fontWeight: 600, color: C.espresso,
              padding: "4px 10px", borderRadius: 9999,
              background: `${C.sage}22`,
              border: `1px solid ${C.sage}55`,
            }}>{s.symptom_type || "Symptom"}</span>
          ))}
        </div>
      )}

      <div style={{ marginTop: "auto" }}>
        {adding ? (
          <div style={{ display: "flex", gap: 4 }}>
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmAdd();
                if (e.key === "Escape") { setAdding(false); setDraft(""); }
              }}
              placeholder="Symptom name…"
              style={{
                flex: 1, padding: "5px 10px", borderRadius: 9999,
                border: "1px solid rgba(58,44,26,0.18)",
                background: C.cream, color: C.espresso,
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 11.5, outline: "none", minWidth: 0,
              }}
            />
            <button
              type="button"
              onClick={confirmAdd}
              disabled={saving || !draft.trim()}
              style={{
                padding: "5px 10px", borderRadius: 9999,
                background: C.espresso, color: C.cream, border: "none",
                fontSize: 10.5, fontWeight: 700,
                cursor: saving || !draft.trim() ? "default" : "pointer",
                opacity: saving || !draft.trim() ? 0.5 : 1, flexShrink: 0,
              }}
            >Add</button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            style={{ ...ctaPill, marginTop: 0, borderColor: `${C.sage}55`, color: C.espresso }}
          >
            <Plus size={11} /> Add symptom
          </button>
        )}
      </div>
    </article>
  );
}

function YourBodyTodaySection({ user }) {
  const [checkin, setCheckin] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) return;
    (async () => {
      try {
        const [checkins, syms] = await Promise.all([
          base44.entities.DailyCheckins.filter({ user_id: user.id, date: todayStr }, "-updated_at", 1).catch(() => []),
          base44.entities.SymptomLogs.filter({ user_id: user.id, date: todayStr }, "-created_date", 50).catch(() => []),
        ]);
        if (cancelled) return;
        setCheckin(Array.isArray(checkins) && checkins[0] ? checkins[0] : null);
        setSymptoms(Array.isArray(syms) ? syms : []);
      } catch {
        if (!cancelled) { setCheckin(null); setSymptoms([]); }
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, todayStr]);

  async function updateField(field, value) {
    if (!user?.id) return;
    const prev = checkin;
    const optimistic = { ...(checkin || {}), [field]: value };
    if (field === "mood") optimistic.mood_score = value;
    if (field === "energy") optimistic.energy_level = value;
    setCheckin(optimistic);
    try {
      const mirror = {};
      if (field === "mood") mirror.mood_score = value;
      if (field === "energy") mirror.energy_level = value;
      if (checkin?.id) {
        await base44.entities.DailyCheckins.update(checkin.id, {
          [field]: value, ...mirror, updated_at: new Date().toISOString(),
        });
      } else {
        const created = await base44.entities.DailyCheckins.create({
          user_id: user.id, date: todayStr,
          [field]: value, ...mirror, updated_at: new Date().toISOString(),
        });
        if (created?.id) setCheckin(created);
      }
    } catch {
      setCheckin(prev);
    }
  }

  async function addSymptom(name) {
    if (!user?.id) return;
    try {
      const created = await base44.entities.SymptomLogs.create({
        user_id: user.id,
        date: todayStr,
        symptom_type: name,
        severity: 2,
      });
      if (created?.id) setSymptoms((prev) => [...prev, created]);
    } catch {
      // silent
    }
  }

  const moodValue   = checkin?.mood ?? checkin?.mood_score ?? null;
  const energyValue = checkin?.energy ?? checkin?.energy_level ?? null;
  const sleepValue  = checkin?.sleep_hours ?? null;

  return (
    <SliderRow label="Your body today">
      <MoodCard   value={moodValue}   onChange={(v) => updateField("mood", v)} />
      <EnergyCard value={energyValue} onChange={(v) => updateField("energy", v)} />
      <SleepCard  value={sleepValue}  onChange={(v) => updateField("sleep_hours", v)} />
      <SymptomsCard symptoms={symptoms} onAdd={addSymptom} />
    </SliderRow>
  );
}

// ─── 6 + 7. Stage row + Condition row (real components from earlier work) ──

// StageRow and ConditionRow already exist and ship the per-stage /
// per-condition card content. They're imported at the top of this file
// and mounted directly below — no wrapper needed.

// ─── 8. Rituals ─────────────────────────────────────────────────────────────
// FemWell ships rituals as phase-keyed bundles (see RitualBundlesCarousel).
// We mirror those four bundles here so the slider stays self-contained inside
// the v2 shell. "Add to today" writes one HabitLogs row per ritual in the
// bundle, stamped with the ritual's time_of_day — same write pattern as the
// production carousel. The bundle matching the user's current phase gets a
// "FOR TODAY" pip.

const RITUAL_BUNDLES = [
  {
    key: "menstrual",
    title: "Restore",
    subtitle: "Soften, slow, rest",
    accent: "#9A2845",
    rituals: [
      { name: "Heat on belly",          timeOfDay: "evening" },
      { name: "Yin yoga · 10m",         timeOfDay: "evening" },
      { name: "Warm cooked breakfast",  timeOfDay: "morning" },
      { name: "Lights out by 10pm",     timeOfDay: "evening" },
    ],
  },
  {
    key: "follicular",
    title: "Build",
    subtitle: "New energy, fresh starts",
    accent: "#D4745A",
    rituals: [
      { name: "Morning walk · 20m",     timeOfDay: "morning" },
      { name: "Strength · 25m",         timeOfDay: "morning" },
      { name: "Plan one small thing",   timeOfDay: "morning" },
      { name: "Cold water on face",     timeOfDay: "morning" },
    ],
  },
  {
    key: "ovulatory",
    title: "Expand",
    subtitle: "Connect, speak, move",
    accent: "#C8A040",
    rituals: [
      { name: "Reach out to someone",   timeOfDay: "morning" },
      { name: "HIIT or dance · 20m",    timeOfDay: "morning" },
      { name: "Sunlight before screens", timeOfDay: "morning" },
      { name: "Hydration: 2L",          timeOfDay: "morning" },
    ],
  },
  {
    key: "luteal",
    title: "Settle",
    subtitle: "Soft edges, honest hours",
    accent: "#7B5E9A",
    rituals: [
      { name: "Journal · 5m",           timeOfDay: "evening" },
      { name: "Magnesium at dinner",    timeOfDay: "evening" },
      { name: "Wind-down walk",         timeOfDay: "evening" },
      { name: "Bath + book before bed", timeOfDay: "evening" },
    ],
  },
];

function RitualBundleCard({ bundle, isForToday, alreadyAdded, onAdd }) {
  const [adding, setAdding] = useState(false);
  const done = alreadyAdded || adding === "done";

  async function handleAdd() {
    if (adding || done) return;
    setAdding("pending");
    try {
      await onAdd(bundle);
      setAdding("done");
    } catch {
      setAdding(false);
    }
  }

  return (
    <article style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
        <span style={kicker}>BUNDLE</span>
        {isForToday && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
            color: C.goldDeep,
            background: `${C.gold}22`, border: `1px solid ${C.gold}55`,
            padding: "2px 8px", borderRadius: 9999,
          }}>
            <Sparkles size={9} /> FOR TODAY
          </span>
        )}
      </div>
      <h3 style={cardTitle}>{bundle.title}</h3>
      <p style={{ ...cardSub, margin: "2px 0 0", fontStyle: "italic" }}>{bundle.subtitle}</p>
      <p style={{ fontSize: 11, color: C.muted, fontWeight: 600, margin: "6px 0 0" }}>
        {bundle.rituals.length} rituals
      </p>
      <button
        type="button"
        onClick={handleAdd}
        disabled={done || adding === "pending"}
        style={{
          alignSelf: "flex-start", marginTop: "auto",
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "6px 12px", borderRadius: 9999,
          background: done ? `${bundle.accent}22` : bundle.accent,
          color: done ? bundle.accent : C.cream,
          border: `1px solid ${bundle.accent}`,
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 11, fontWeight: 700,
          cursor: done || adding === "pending" ? "default" : "pointer",
          opacity: adding === "pending" ? 0.6 : 1,
        }}
      >
        {done ? (<><Check size={11} /> Added</>) : (<><Plus size={11} /> Add to today</>)}
      </button>
    </article>
  );
}

function RitualsSection({ user, phase }) {
  // Fetch today's HabitLogs once so each bundle can decide whether it's
  // already on the user's stack.
  const [todayHabitNames, setTodayHabitNames] = useState(() => new Set());
  const [locallyAddedKeys, setLocallyAddedKeys] = useState(() => new Set());
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) return;
    (async () => {
      try {
        const rows = await base44.entities.HabitLogs.filter(
          { user_id: user.id, date: todayStr },
          null,
          80,
        );
        if (cancelled) return;
        const names = new Set(
          (rows || [])
            .map((r) => (r?.habit_name || r?.habit_type || "").toLowerCase())
            .filter(Boolean),
        );
        setTodayHabitNames(names);
      } catch {
        if (!cancelled) setTodayHabitNames(new Set());
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, todayStr]);

  async function addBundle(bundle) {
    if (!user?.id) return;
    // Skip rituals already present today; create the rest.
    const toCreate = bundle.rituals.filter(
      (r) => !todayHabitNames.has((r.name || "").toLowerCase()),
    );
    for (const r of toCreate) {
      try {
        await base44.entities.HabitLogs.create({
          user_id: user.id,
          habit_name: r.name,
          date: todayStr,
          is_completed: false,
          time_of_day: r.timeOfDay || "morning",
          created_at: new Date().toISOString(),
        });
      } catch { /* silent — duplicate or transient */ }
    }
    // Mirror into local state so the button stays in "Added" without a refetch.
    setTodayHabitNames((prev) => {
      const next = new Set(prev);
      for (const r of bundle.rituals) next.add((r.name || "").toLowerCase());
      return next;
    });
    setLocallyAddedKeys((prev) => new Set(prev).add(bundle.key));
  }

  function isBundleAlreadyAdded(bundle) {
    if (locallyAddedKeys.has(bundle.key)) return true;
    return bundle.rituals.every((r) =>
      todayHabitNames.has((r.name || "").toLowerCase()),
    );
  }

  return (
    <SliderRow label="Rituals">
      {/* Card 1 — Create ritual via UniversalLogger */}
      <article style={cardStyle}>
        <span style={kicker}>RITUALS</span>
        <h3 style={cardTitle}>Create your own</h3>
        <p style={{ ...cardSub, margin: "2px 0 0" }}>
          A bundle is a few rituals you bring back regularly.
        </p>
        <button
          type="button"
          onClick={() => openLogger("ritual")}
          style={{
            alignSelf: "flex-start", marginTop: "auto",
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "6px 12px", borderRadius: 9999,
            background: C.espresso, color: C.cream, border: "none",
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 11, fontWeight: 700, cursor: "pointer",
          }}
        >
          <Plus size={11} /> Create ritual
        </button>
      </article>

      {/* Cards 2-5 — phase bundles */}
      {RITUAL_BUNDLES.map((b) => (
        <RitualBundleCard
          key={b.key}
          bundle={b}
          isForToday={phase === b.key}
          alreadyAdded={isBundleAlreadyAdded(b)}
          onAdd={addBundle}
        />
      ))}
    </SliderRow>
  );
}

// ─── 9. Nourishment ─────────────────────────────────────────────────────────
// Three cards inside the existing slider:
//   1) Meals today  — MealLog read; "Log meal" opens UniversalLogger.
//   2) Hydration    — HydrationLog read; "+" creates a 250ml row.
//   3) Eat for phase — static phase-aware suggestions, read-only.

const HYDRATION_TICK_ML = 250;
const HYDRATION_GOAL_ML = 2000;

const PHASE_FOOD = {
  menstrual:  {
    tagline: "Replenish iron and warmth.",
    foods: ["Iron-rich foods", "Warming soups", "Dark chocolate"],
  },
  follicular: {
    tagline: "Light, fresh, building energy.",
    foods: ["Fresh greens", "Fermented foods", "Light proteins"],
  },
  ovulatory: {
    tagline: "Bright, raw, mineral-rich.",
    foods: ["Raw salads", "Berries", "Zinc-rich seeds"],
  },
  luteal: {
    tagline: "Steady carbs and grounding minerals.",
    foods: ["Complex carbs", "Magnesium", "Root vegetables"],
  },
};

function MealsTodayCard({ user }) {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) { setLoading(false); return; }
    (async () => {
      try {
        const rows = await base44.entities.MealLog.filter(
          { user_id: user.id, day_key: todayStr },
          "-logged_at",
          30,
        );
        if (!cancelled) setMeals(Array.isArray(rows) ? rows : []);
      } catch {
        if (!cancelled) setMeals([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, todayStr]);

  function fmtLogged(iso) {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      let h = d.getHours();
      const m = d.getMinutes();
      const ap = h < 12 ? "am" : "pm";
      h = h === 0 ? 12 : (h > 12 ? h - 12 : h);
      const mm = String(m).padStart(2, "0");
      return mm === "00" ? `${h}${ap}` : `${h}:${mm}${ap}`;
    } catch { return ""; }
  }

  return (
    <article style={cardStyle}>
      <span style={kicker}>MEALS</span>
      <h3 style={cardTitle}>Today</h3>

      {!loading && meals.length === 0 && (
        <p style={{ ...cardSub, margin: "2px 0 0", fontStyle: "italic" }}>Nothing logged yet</p>
      )}

      {meals.length > 0 && (
        <ul style={{
          listStyle: "none", padding: 0, margin: "4px 0 0",
          display: "flex", flexDirection: "column", gap: 4,
        }}>
          {meals.slice(0, 4).map((m) => (
            <li key={m.id} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "6px 10px", borderRadius: 10,
              background: C.cream, border: "1px solid rgba(58,44,26,0.06)",
            }}>
              <span style={{
                flex: 1, fontSize: 12, color: C.espresso, fontWeight: 600,
                minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {m.raw_text || m.meal_type || "Logged meal"}
              </span>
              {m.logged_at && (
                <span style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>
                  {fmtLogged(m.logged_at)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <button type="button" onClick={() => openLogger("meal")} style={ctaPill}>
        <Plus size={11} /> Log meal
      </button>
    </article>
  );
}

function HydrationCard({ user, profile }) {
  const [totalMl, setTotalMl] = useState(0);
  const [logging, setLogging] = useState(false);
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const goalMl = profile?.hydration_goal_ml || profile?.hydration_goal || HYDRATION_GOAL_ML;

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) return;
    (async () => {
      try {
        const rows = await base44.entities.HydrationLog.filter(
          { user_id: user.id, day_key: todayStr },
          "-logged_at",
          80,
        );
        if (cancelled) return;
        const sum = (rows || []).reduce((acc, r) => {
          if (typeof r?.amount_ml === "number") return acc + r.amount_ml;
          if (typeof r?.glasses_count === "number") return acc + r.glasses_count * HYDRATION_TICK_ML;
          return acc;
        }, 0);
        setTotalMl(sum);
      } catch {
        if (!cancelled) setTotalMl(0);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, todayStr]);

  async function addTick() {
    if (logging || !user?.id) return;
    setLogging(true);
    const next = totalMl + HYDRATION_TICK_ML;
    setTotalMl(next); // optimistic
    try {
      await base44.entities.HydrationLog.create({
        user_id: user.id,
        day_key: todayStr,
        amount_ml: HYDRATION_TICK_ML,
        logged_at: new Date().toISOString(),
      });
    } catch {
      setTotalMl((prev) => Math.max(0, prev - HYDRATION_TICK_ML));
    } finally {
      setLogging(false);
    }
  }

  const pct = goalMl > 0 ? Math.min(100, Math.round((totalMl / goalMl) * 100)) : 0;
  const litres = (totalMl / 1000).toFixed(totalMl < 1000 ? 2 : 1).replace(/\.?0+$/, "");
  const goalL  = (goalMl / 1000).toFixed(goalMl < 1000 ? 2 : 1).replace(/\.?0+$/, "");

  return (
    <article style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
        <span style={kicker}>HYDRATION</span>
        <button
          type="button"
          onClick={addTick}
          disabled={logging}
          aria-label="Add 250ml"
          style={{
            width: 32, height: 32, borderRadius: 9999,
            background: C.espresso, color: C.cream,
            border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center",
            cursor: logging ? "default" : "pointer",
            opacity: logging ? 0.6 : 1, padding: 0,
          }}
        >
          <Plus size={14} />
        </button>
      </div>

      <h3 style={cardTitle}>
        {litres}L
        <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}> / {goalL}L</span>
      </h3>

      <div style={{
        position: "relative", height: 8, borderRadius: 9999,
        background: "rgba(58,44,26,0.08)", overflow: "hidden", marginTop: 6,
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, bottom: 0,
          width: `${pct}%`, background: C.sage,
          borderRadius: 9999, transition: "width 0.25s ease",
        }} />
      </div>
      <p style={{ ...cardSub, margin: "6px 0 0" }}>
        {Math.round(totalMl / HYDRATION_TICK_ML)} of {Math.round(goalMl / HYDRATION_TICK_ML)} glasses
      </p>
    </article>
  );
}

function EatForPhaseCard({ phase }) {
  const data = PHASE_FOOD[phase] || PHASE_FOOD.luteal;
  const phaseLabel = phase ? `${phase[0].toUpperCase()}${phase.slice(1)}` : "Your phase";
  return (
    <article style={cardStyle}>
      <span style={kicker}>EAT FOR PHASE</span>
      <h3 style={cardTitle}>{phaseLabel}</h3>
      <p style={{
        fontFamily: "Georgia, serif", fontStyle: "italic",
        fontSize: 13, color: C.plumMid, margin: "2px 0 0", lineHeight: 1.45,
      }}>{data.tagline}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
        {data.foods.map((f) => (
          <span key={f} style={{
            fontSize: 11, fontWeight: 600, color: C.espresso,
            padding: "4px 10px", borderRadius: 9999,
            background: `${C.gold}22`,
            border: `1px solid ${C.gold}55`,
          }}>{f}</span>
        ))}
      </div>
    </article>
  );
}

function NourishmentSection({ user, profile, phase }) {
  return (
    <SliderRow label="Nourishment">
      <MealsTodayCard user={user} />
      <HydrationCard user={user} profile={profile} />
      <EatForPhaseCard phase={phase} />
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
        <MyListsRow user={user} />

        {/* 3 — Schedule & Cycle (compact, expand on tap) */}
        <ScheduleCycleSection phase={phase} cycleDay={cycleDay} profile={profile} user={user} />

        {/* 4 — Your Day (Morning · Afternoon · Evening) */}
        <YourDaySection user={user} />

        {/* 5 — Your Body Today */}
        <YourBodyTodaySection user={user} />

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
        <RitualsSection user={user} phase={phase} />

        {/* 9 — Nourishment */}
        <NourishmentSection user={user} profile={profile} phase={phase} />

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
