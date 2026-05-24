// VoiceScheduler — Sprint 7
//
// One-tap voice capture for adding PlannerItems. Tap the mic in the
// Planner header, speak something like "remind me to take my medication
// at 8pm" or "add yoga tomorrow morning". The Web Speech API streams
// a transcript; on stop, a rule-based parser pulls out title / date /
// time / category and the user confirms before we write a PlannerItem.
//
// Four states:
//   • listening   — pulsing red mic + live transcript
//   • processing  — spinner + "Working out what you said…"
//   • confirm     — structured preview card + Save / Try again
//   • saved       — brief success toast, sheet closes, parent refreshes
//
// No external API calls. The parser is pure JS + a few regexes.
// Fallback: if the browser has no SpeechRecognition, show a polite note.

import { useEffect, useMemo, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Mic, X, Check, RotateCcw, Loader2,
  Heart, Activity, Utensils, ListChecks, MoreHorizontal,
  Calendar, Clock,
} from "lucide-react";

const C = {
  cream:    "#F4EDDB",
  paperHi:  "#EDE6D5",
  espresso: "#3A2C1A",
  muted:    "#9B8B7A",
  gold:     "#D4AF37",
  sage:     "#8FAF8F",
  blush:    "#E8B4B8",
  border:   "#D4C9B4",
  red:      "#D45E52",
};

// ─── Category detection ────────────────────────────────────────────────────
const CATEGORY_KEYWORDS = {
  health:    ["medication", "med ", "meds", "pill", "supplement", "vitamin", "tablet", "dose", "prescription", "doctor", "gp", "appointment", "smear", "blood test"],
  movement:  ["yoga", "walk", "run", "jog", "exercise", "gym", "workout", "pilates", "stretch", "cycle", "swim", "dance", "training", "session"],
  nutrition: ["meal", "eat", "lunch", "breakfast", "dinner", "snack", "drink", "water", "cook", "recipe", "food", "smoothie"],
};
const CATEGORY_META = {
  health:    { label: "Health",    Icon: Heart,            tint: "#E8B4B8" },
  movement:  { label: "Movement",  Icon: Activity,         tint: "#8FAF8F" },
  nutrition: { label: "Nutrition", Icon: Utensils,         tint: "#D4AF37" },
  task:      { label: "Task",      Icon: ListChecks,       tint: "#3A2C1A" },
  other:     { label: "Other",     Icon: MoreHorizontal,   tint: "#9B8B7A" },
};

function detectCategory(text) {
  const lower = text.toLowerCase();
  for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) return cat;
  }
  return "task";
}

// ─── Date + time parsing ───────────────────────────────────────────────────
const DAY_MAP = {
  sun: 0, sunday: 0,
  mon: 1, monday: 1,
  tue: 2, tues: 2, tuesday: 2,
  wed: 3, weds: 3, wednesday: 3,
  thu: 4, thur: 4, thurs: 4, thursday: 4,
  fri: 5, friday: 5,
  sat: 6, saturday: 6,
};

function toLocalISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Returns { date: ISO string, dateLabel: "Today" | "Tomorrow" | "Mon 26 May",
//           consumed: [strings to strip from the title] }
function parseDate(text) {
  const lower = text.toLowerCase();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const consumed = [];

  if (/\btomorrow\b/.test(lower)) {
    const d = new Date(today); d.setDate(d.getDate() + 1);
    consumed.push("tomorrow");
    return { date: toLocalISO(d), dateLabel: "Tomorrow", consumed };
  }
  if (/\btoday\b/.test(lower)) {
    consumed.push("today");
    return { date: toLocalISO(today), dateLabel: "Today", consumed };
  }
  if (/\btonight\b/.test(lower)) {
    consumed.push("tonight");
    return { date: toLocalISO(today), dateLabel: "Tonight", consumed };
  }
  if (/\bthis (morning|afternoon|evening)\b/.test(lower)) {
    consumed.push("this morning", "this afternoon", "this evening");
    return { date: toLocalISO(today), dateLabel: "Today", consumed };
  }

  // Day-name resolution: "monday" / "next friday" → next occurrence.
  const dayMatch = lower.match(/\b(?:next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday|sun|mon|tue|tues|wed|weds|thu|thur|thurs|fri|sat)\b/);
  if (dayMatch) {
    const targetDow = DAY_MAP[dayMatch[1]];
    const next = new Date(today);
    const todayDow = next.getDay();
    let delta = (targetDow - todayDow + 7) % 7;
    if (delta === 0) delta = 7; // "monday" said on a monday → next monday
    next.setDate(next.getDate() + delta);
    consumed.push(dayMatch[0]);
    const label = next.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    return { date: toLocalISO(next), dateLabel: label, consumed };
  }

  return { date: toLocalISO(today), dateLabel: "Today", consumed: [] };
}

// Returns { time: "HH:MM" | null, timeLabel: "8:00 PM" | null, consumed: [...] }
function parseTime(text) {
  const lower = text.toLowerCase();
  const consumed = [];

  // Numeric "at 8pm", "at 8:30", "at 14:30", "8.30am", "at 8 pm".
  const num = lower.match(/\b(?:at\s+)?(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?\b/);
  if (num) {
    let hour = parseInt(num[1], 10);
    const minute = num[2] ? parseInt(num[2], 10) : 0;
    const ampm = num[3];
    const hasMinutes = !!num[2];
    const hasAmPm = !!ampm;
    const looksLikeATime = hasAmPm || hasMinutes || (hour >= 0 && hour <= 23 && /\bat\s+\d/.test(lower));
    if (looksLikeATime && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      if (ampm === "pm" && hour < 12) hour += 12;
      if (ampm === "am" && hour === 12) hour = 0;
      consumed.push(num[0]);
      const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      return { time, timeLabel: formatTimeLabel(hour, minute), consumed };
    }
  }

  // Named time-of-day. Combined with tomorrow: e.g. "tomorrow morning" → 08:00.
  if (/\btonight\b/.test(lower))          { consumed.push("tonight");          return { time: "20:00", timeLabel: "8:00 PM",  consumed }; }
  if (/\bevening\b/.test(lower))          { consumed.push("evening");          return { time: "19:00", timeLabel: "7:00 PM",  consumed }; }
  if (/\bafternoon\b/.test(lower))        { consumed.push("afternoon");        return { time: "14:00", timeLabel: "2:00 PM",  consumed }; }
  if (/\bmorning\b/.test(lower))          { consumed.push("morning");          return { time: "08:00", timeLabel: "8:00 AM",  consumed }; }
  if (/\bnoon\b|\bmidday\b/.test(lower))  { consumed.push("noon", "midday");   return { time: "12:00", timeLabel: "12:00 PM", consumed }; }
  if (/\bmidnight\b/.test(lower))         { consumed.push("midnight");         return { time: "00:00", timeLabel: "12:00 AM", consumed }; }

  return { time: null, timeLabel: null, consumed: [] };
}

function formatTimeLabel(hour, minute) {
  const ampm = hour >= 12 ? "PM" : "AM";
  let h = hour % 12; if (h === 0) h = 12;
  return `${h}:${String(minute).padStart(2, "0")} ${ampm}`;
}

// Strip date / time / filler words from the transcript and clean up.
function extractTitle(text, consumed) {
  let working = " " + text.toLowerCase() + " ";
  // Remove all consumed substrings (sort longest first so "this morning"
  // is removed before "morning").
  const sorted = [...consumed].filter(Boolean).sort((a, b) => b.length - a.length);
  for (const c of sorted) {
    const re = new RegExp("\\b" + c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "gi");
    working = working.replace(re, " ");
  }
  // Strip common intent prefixes / fillers.
  const fillers = [
    "remind me to", "remind me", "can you", "please", "i need to",
    "i want to", "add", "schedule", "book", "create a reminder to",
    "reminder to", "log", "at", "on", "in the", "for the",
  ];
  for (const f of fillers) {
    const re = new RegExp("\\b" + f + "\\b", "gi");
    working = working.replace(re, " ");
  }
  // Collapse whitespace + trim.
  working = working.replace(/\s+/g, " ").trim();
  if (!working) return "Untitled";
  // Capitalise first letter.
  return working.charAt(0).toUpperCase() + working.slice(1);
}

export function parseTranscript(raw) {
  const text = String(raw || "").trim();
  if (!text) return null;
  const { date, dateLabel, consumed: dateConsumed } = parseDate(text);
  const { time, timeLabel, consumed: timeConsumed } = parseTime(text);
  const title = extractTitle(text, [...dateConsumed, ...timeConsumed]);
  const category = detectCategory(text);
  return { title, date, dateLabel, time, timeLabel, category };
}

// ─── Mic button (the thing in the Planner header) ─────────────────────────
export function VoiceMicButton({ onTap }) {
  return (
    <button
      type="button"
      onClick={onTap}
      aria-label="Add by voice"
      style={{
        width: 36, height: 36, borderRadius: 9999,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: "rgba(58,44,26,0.06)", color: C.espresso,
        border: "none", cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <Mic size={16} />
    </button>
  );
}

// ─── Main bottom sheet ────────────────────────────────────────────────────
export default function VoiceScheduler({ open, onClose, userId, onSaved }) {
  const [state, setState] = useState("listening"); // listening | processing | confirm | saved | unsupported
  const [transcript, setTranscript] = useState("");
  const [parsed, setParsed] = useState(null);
  const [saving, setSaving] = useState(false);
  const recRef = useRef(null);

  const supported = useMemo(() => {
    if (typeof window === "undefined") return false;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    return !!SR;
  }, []);

  // Reset + start listening every time the sheet opens.
  useEffect(() => {
    if (!open) return;
    if (!supported) { setState("unsupported"); return; }
    setTranscript("");
    setParsed(null);
    setSaving(false);
    setState("listening");
    startRecognition();
    return () => {
      try { recRef.current && recRef.current.abort(); } catch { /* swallow */ }
      recRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function startRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setState("unsupported"); return; }
    const rec = new SR();
    rec.lang = "en-GB";
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    let finalText = "";
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const piece = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += piece;
        else interim += piece;
      }
      setTranscript((finalText + " " + interim).trim());
    };
    rec.onerror = () => { /* swallow — onend handles transition */ };
    rec.onend = () => {
      // If we already moved past listening, ignore.
      setState((s) => {
        if (s !== "listening") return s;
        const text = (finalText || transcript || "").trim();
        if (!text) return "listening"; // nothing said — keep mic alive
        processNow(text);
        return "processing";
      });
    };
    recRef.current = rec;
    try { rec.start(); } catch { /* sometimes throws when already running */ }
  }

  function handleStop() {
    try { recRef.current && recRef.current.stop(); } catch { /* swallow */ }
  }

  function processNow(text) {
    // Tiny artificial delay so the user sees the spinner — feels intentional.
    setTimeout(() => {
      const result = parseTranscript(text);
      if (!result) {
        setState("listening");
        setTranscript("");
        try { recRef.current && recRef.current.start(); } catch { /* swallow */ }
        return;
      }
      setParsed(result);
      setState("confirm");
    }, 350);
  }

  function handleTryAgain() {
    setParsed(null);
    setTranscript("");
    setState("listening");
    setTimeout(startRecognition, 100);
  }

  async function handleSave() {
    if (!parsed || saving) return;
    setSaving(true);
    const nowISO = new Date().toISOString();
    try {
      await base44.entities.PlannerItems.create({
        user_id: userId,
        date_str: parsed.date,
        title: parsed.title,
        time: parsed.time || null,
        item_type: parsed.category === "task" ? "task" : "event",
        category: parsed.category,
        source: "voice",
        created_at: nowISO,
        updated_at: nowISO,
      }).catch(async () => {
        // Fallback for schemas that don't carry `category` / `source`.
        await base44.entities.PlannerItems.create({
          user_id: userId,
          date_str: parsed.date,
          title: parsed.title,
          time: parsed.time || null,
          item_type: "event",
          created_at: nowISO,
          updated_at: nowISO,
        });
      });
      setState("saved");
      try { onSaved && onSaved(parsed); } catch { /* swallow */ }
      setTimeout(() => {
        onClose && onClose();
      }, 1100);
    } catch {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(58,44,26,0.50)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        zIndex: 120,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 520,
          background: C.cream,
          borderRadius: "20px 20px 0 0",
          boxShadow: "0 -12px 36px rgba(58,44,26,0.30)",
          display: "flex", flexDirection: "column",
          maxHeight: "84vh",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "14px 16px 10px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div>
            <p style={{
              margin: 0, fontSize: 10, fontWeight: 700,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: C.muted, fontFamily: "'Inter', sans-serif",
            }}>Voice to planner</p>
            <h2 style={{
              margin: "2px 0 0", fontSize: 17, fontWeight: 500,
              fontFamily: "'Fraunces', Georgia, serif", color: C.espresso,
            }}>{state === "saved" ? "Saved" : "What should I add?"}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32, height: 32, borderRadius: 9999,
              background: "rgba(58,44,26,0.06)", border: "none",
              color: C.espresso, cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}
          ><X size={14} /></button>
        </div>

        {/* Body */}
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "20px 16px max(20px, env(safe-area-inset-bottom))",
          display: "flex", flexDirection: "column", gap: 16,
          alignItems: "center", justifyContent: "center",
          minHeight: 240,
        }}>
          {state === "unsupported" && <UnsupportedState />}
          {state === "listening"   && <ListeningState transcript={transcript} onStop={handleStop} />}
          {state === "processing"  && <ProcessingState />}
          {state === "confirm"     && (
            <ConfirmState
              parsed={parsed}
              saving={saving}
              onSave={handleSave}
              onTryAgain={handleTryAgain}
            />
          )}
          {state === "saved"       && <SavedState />}
        </div>
      </div>

      <style>{`
        @keyframes voice-mic-pulse {
          0%   { transform: scale(1);   box-shadow: 0 0 0 0   rgba(212,94,82,0.55); }
          70%  { transform: scale(1.05); box-shadow: 0 0 0 22px rgba(212,94,82,0.00); }
          100% { transform: scale(1);   box-shadow: 0 0 0 0   rgba(212,94,82,0.00); }
        }
        @keyframes voice-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ─── State views ──────────────────────────────────────────────────────────
function UnsupportedState() {
  return (
    <div style={{ textAlign: "center", padding: "20px 12px", maxWidth: 320 }}>
      <div style={{
        width: 56, height: 56, borderRadius: 9999,
        background: "rgba(58,44,26,0.06)", color: C.muted,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        marginBottom: 14,
      }}><Mic size={22} /></div>
      <h3 style={{
        margin: "0 0 6px", fontFamily: "'Fraunces', Georgia, serif",
        fontSize: 17, fontWeight: 500, color: C.espresso,
      }}>Voice entry isn't supported on this browser</h3>
      <p style={{
        margin: 0, fontSize: 13, color: C.muted,
        fontFamily: "'Inter', system-ui, sans-serif", lineHeight: 1.5,
      }}>Try Chrome on Android or Safari on iOS. The global + button still works for typing in entries.</p>
    </div>
  );
}

function ListeningState({ transcript, onStop }) {
  return (
    <>
      <button
        type="button"
        onClick={onStop}
        aria-label="Stop listening"
        style={{
          width: 96, height: 96, borderRadius: 9999,
          background: C.red, color: C.cream,
          border: "none", cursor: "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          animation: "voice-mic-pulse 1.4s ease-in-out infinite",
        }}
      ><Mic size={36} /></button>
      <p style={{
        margin: "4px 0 0", fontSize: 11, fontWeight: 700,
        letterSpacing: "0.16em", textTransform: "uppercase",
        color: C.muted, fontFamily: "'Inter', sans-serif",
      }}>Listening · tap to stop</p>
      <p style={{
        margin: 0, fontFamily: "Georgia, serif", fontSize: 17,
        color: transcript ? C.espresso : C.muted, lineHeight: 1.5,
        textAlign: "center", maxWidth: 360, minHeight: 28,
        fontStyle: transcript ? "normal" : "italic",
      }}>
        {transcript || "e.g. 'Take medication at 8pm' or 'Yoga tomorrow morning'"}
      </p>
    </>
  );
}

function ProcessingState() {
  return (
    <>
      <div style={{
        width: 64, height: 64, borderRadius: 9999,
        background: "rgba(212,175,55,0.16)", color: C.gold,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}>
        <Loader2 size={28} style={{ animation: "voice-spin 900ms linear infinite" }} />
      </div>
      <p style={{
        margin: 0, fontFamily: "'Fraunces', Georgia, serif",
        fontSize: 16, color: C.espresso, fontStyle: "italic",
      }}>Working out what you said…</p>
    </>
  );
}

function ConfirmState({ parsed, saving, onSave, onTryAgain }) {
  const meta = CATEGORY_META[parsed.category] || CATEGORY_META.task;
  const CatIcon = meta.Icon;
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Preview card */}
      <article style={{
        background: C.paperHi,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: "14px 14px 12px",
        display: "flex", flexDirection: "column", gap: 10,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <span style={{
            width: 32, height: 32, borderRadius: 9,
            background: `${meta.tint}22`, color: meta.tint,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}><CatIcon size={15} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              margin: 0, fontSize: 10, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: C.muted, fontFamily: "'Inter', sans-serif",
            }}>{meta.label}</p>
            <h3 style={{
              margin: "2px 0 0", fontSize: 17, fontWeight: 500,
              fontFamily: "'Fraunces', Georgia, serif", color: C.espresso,
              lineHeight: 1.3, wordBreak: "break-word",
            }}>{parsed.title}</h3>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Chip Icon={Calendar} label={parsed.dateLabel} />
          {parsed.timeLabel && <Chip Icon={Clock} label={parsed.timeLabel} />}
          <CategoryChip meta={meta} />
        </div>
      </article>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="button"
          onClick={onTryAgain}
          disabled={saving}
          style={{
            flex: "0 0 auto",
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "10px 14px", borderRadius: 9999,
            background: "transparent", border: `1px solid ${C.muted}55`,
            color: C.espresso, cursor: saving ? "default" : "pointer",
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 13, fontWeight: 600,
            opacity: saving ? 0.55 : 1,
          }}
        ><RotateCcw size={13} /> Try again</button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          style={{
            flex: 1,
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "11px 16px", borderRadius: 9999,
            background: C.espresso, color: C.cream, border: "none",
            cursor: saving ? "default" : "pointer",
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 13.5, fontWeight: 700,
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? (
            <>
              <Loader2 size={13} style={{ animation: "voice-spin 900ms linear infinite" }} /> Saving…
            </>
          ) : (
            <>
              <Check size={13} /> Save to Planner
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function SavedState() {
  return (
    <>
      <div style={{
        width: 64, height: 64, borderRadius: 9999,
        background: "rgba(143,175,143,0.22)", color: C.sage,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}><Check size={28} /></div>
      <p style={{
        margin: 0, fontFamily: "'Fraunces', Georgia, serif",
        fontSize: 17, color: C.espresso,
      }}>Added to your planner</p>
    </>
  );
}

function Chip({ Icon, label }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "5px 10px", borderRadius: 9999,
      background: C.cream, border: `1px solid ${C.border}`,
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 11.5, fontWeight: 600, color: C.espresso,
    }}>
      <Icon size={11} style={{ color: C.muted }} /> {label}
    </span>
  );
}

function CategoryChip({ meta }) {
  const Icon = meta.Icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "5px 10px", borderRadius: 9999,
      background: "rgba(143,175,143,0.18)", // sage tint regardless of category
      border: "1px solid rgba(143,175,143,0.40)",
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 11.5, fontWeight: 600, color: "#3A4E3A",
    }}>
      <Icon size={11} /> {meta.label}
    </span>
  );
}
