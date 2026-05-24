// VoiceScheduler — Sprint 7 (Voice to Schedule)
//
// One-tap voice capture for adding PlannerItems. Tap the mic in the
// Planner header, speak something like "remind me to take my medication
// at 8pm every day" or "add yoga tomorrow morning". The Web Speech API
// streams a transcript; on stop, a rule-based parser pulls out title /
// date / time / recurring / category. If the rule parser produces an
// empty or "Untitled" result, the transcript is sent to Jess as a
// VOICE-TO-SCHEDULE-MODE prompt and her JSON envelope is parsed back
// into the same { title, date, time, recurring, category } shape.
//
// Five states:
//   • listening    — pulsing mic + live transcript on dark espresso
//   • processing   — spinner + "Working out what you said…"
//   • confirm      — structured preview card + Save / Try again / Edit
//   • saved        — success sage toast slides up, sheet closes
//   • unsupported  — polite browser-not-supported note
//
// Persistence path: executeJessActions([{ type: CREATE_PLANNER_ITEM,
// confidence: 1, data: {...}}]) → jessActions writes PlannerItems
// (single row, or N rows when recurring is set).
//
// Sprint-7 changes vs original cream sheet:
//   - Dark espresso theme per spec (#1C1410 bg, #2A1F17 surface)
//   - Recurring detection ("every day", "every morning", "daily",
//     "weekly", "each week")
//   - LLM fallback via Jess agent when rule parser fails
//   - Editable confirm card (title / date / time / recurring inputs)
//   - Goes through jessActions (CREATE_PLANNER_ITEM) instead of
//     calling base44 directly — so memory + chip system stay coherent.

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Mic, X, Check, RotateCcw, Loader2,
  Heart, Activity, Utensils, ListChecks, MoreHorizontal,
  Calendar, Clock, Repeat, Pencil,
} from "lucide-react";
import {
  callJessAgent,
  withJessActionEnvelope,
} from "@/services/jessAgentService";
import {
  parseJessResponse,
  executeJessActions,
} from "@/services/jessActions";

// ─── Tokens — dark espresso per Sprint 7 spec ─────────────────────────
const C = {
  bg:         "#1C1410", // sheet background
  surface:    "#2A1F17", // preview / input surface
  surfaceHi:  "#332519", // elevated cards / chips
  border:     "#3D2D1F",
  cream:      "#F4EDDB", // primary text
  textMid:    "#C4B69E",
  muted:      "#9B8B7A",
  gold:       "#D4AF37",
  goldSoft:   "rgba(212,175,55,0.18)",
  sage:       "#8FAF8F",
  sageSoft:   "rgba(143,175,143,0.22)",
  blush:      "#E8B4B8",
  blushSoft:  "rgba(232,180,184,0.20)",
  red:        "#E85D5D",
};

// ─── Category detection ────────────────────────────────────────────────
const CATEGORY_KEYWORDS = {
  health:    ["medication", "med ", "meds", "pill", "supplement", "vitamin", "tablet", "dose", "prescription", "doctor", "gp", "appointment", "smear", "blood test"],
  movement:  ["yoga", "walk", "run", "jog", "exercise", "gym", "workout", "pilates", "stretch", "cycle", "swim", "dance", "training", "session"],
  nutrition: ["meal", "eat", "lunch", "breakfast", "dinner", "snack", "drink", "water", "cook", "recipe", "food", "smoothie"],
};
const CATEGORY_META = {
  health:    { label: "Health",    Icon: Heart,            tint: C.blush },
  movement:  { label: "Movement",  Icon: Activity,         tint: C.sage  },
  nutrition: { label: "Nutrition", Icon: Utensils,         tint: C.gold  },
  task:      { label: "Task",      Icon: ListChecks,       tint: C.cream },
  other:     { label: "Other",     Icon: MoreHorizontal,   tint: C.muted },
};

function detectCategory(text) {
  const lower = text.toLowerCase();
  for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) return cat;
  }
  return "task";
}

// ─── Date + time parsing ───────────────────────────────────────────────
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
  if (/\bnext week\b/.test(lower)) {
    const d = new Date(today); d.setDate(d.getDate() + 7);
    consumed.push("next week");
    return { date: toLocalISO(d), dateLabel: "Next week", consumed };
  }

  const dayMatch = lower.match(/\b(?:next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday|sun|mon|tue|tues|wed|weds|thu|thur|thurs|fri|sat)\b/);
  if (dayMatch) {
    const targetDow = DAY_MAP[dayMatch[1]];
    const next = new Date(today);
    const todayDow = next.getDay();
    let delta = (targetDow - todayDow + 7) % 7;
    if (delta === 0) delta = 7;
    next.setDate(next.getDate() + delta);
    consumed.push(dayMatch[0]);
    const label = next.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    return { date: toLocalISO(next), dateLabel: label, consumed };
  }

  return { date: toLocalISO(today), dateLabel: "Today", consumed: [] };
}

function parseTime(text) {
  const lower = text.toLowerCase();
  const consumed = [];

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

  if (/\btonight\b/.test(lower))          { consumed.push("tonight");          return { time: "21:00", timeLabel: "9:00 PM",  consumed }; }
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

// Sprint 7 — recurring detection. "every day" / "every morning" /
// "daily" → daily. "every week" / "weekly" / "every monday" → weekly.
function parseRecurring(text) {
  const lower = text.toLowerCase();
  const consumed = [];
  if (/\b(every\s+day|each\s+day|daily|every\s+morning|every\s+evening|every\s+night)\b/.test(lower)) {
    consumed.push("every day", "each day", "daily", "every morning", "every evening", "every night");
    return { recurring: "daily", recurringLabel: "Daily", consumed };
  }
  if (/\b(every\s+week|each\s+week|weekly|every\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/.test(lower)) {
    consumed.push("every week", "each week", "weekly");
    return { recurring: "weekly", recurringLabel: "Weekly", consumed };
  }
  return { recurring: null, recurringLabel: null, consumed: [] };
}

function extractTitle(text, consumed) {
  let working = " " + text.toLowerCase() + " ";
  const sorted = [...consumed].filter(Boolean).sort((a, b) => b.length - a.length);
  for (const c of sorted) {
    const re = new RegExp("\\b" + c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "gi");
    working = working.replace(re, " ");
  }
  const fillers = [
    "remind me to", "remind me", "can you", "please", "i need to",
    "i want to", "add", "schedule", "book", "create a reminder to",
    "reminder to", "log", "at", "on", "in the", "for the", "every",
  ];
  for (const f of fillers) {
    const re = new RegExp("\\b" + f + "\\b", "gi");
    working = working.replace(re, " ");
  }
  working = working.replace(/\s+/g, " ").trim();
  if (!working) return "";
  return working.charAt(0).toUpperCase() + working.slice(1);
}

export function parseTranscript(raw) {
  const text = String(raw || "").trim();
  if (!text) return null;
  const { date, dateLabel, consumed: dateC } = parseDate(text);
  const { time, timeLabel, consumed: timeC } = parseTime(text);
  const { recurring, recurringLabel, consumed: recC } = parseRecurring(text);
  const title = extractTitle(text, [...dateC, ...timeC, ...recC]);
  const category = detectCategory(text);
  return { title, date, dateLabel, time, timeLabel, recurring, recurringLabel, category };
}

// ─── LLM fallback ─────────────────────────────────────────────────────
// When the rule parser produces an empty title, hand the transcript to
// Jess with the VOICE-TO-SCHEDULE-MODE prompt. Returns the same shape
// as parseTranscript, plus llmConfirm with Jess's confirmation copy.
async function parseWithJessFallback(transcript) {
  const surface =
    "[VOICE TO SCHEDULE MODE]\n" +
    "The user has spoken a scheduling request. Parse it into structured data " +
    "and emit a CREATE_PLANNER_ITEM action.\n\n" +
    "Resolve relative dates (today, tomorrow, friday, next week) into YYYY-MM-DD.\n" +
    "Resolve named times (morning=08:00, afternoon=14:00, evening=19:00, night=21:00).\n" +
    "Detect recurring patterns: \"every day\" → \"daily\". \"every week\" / \"every monday\" → \"weekly\".\n\n" +
    "Confidence ≥ 0.85 if you have a clear title + date. If unclear, " +
    "return CLARIFICATION_NEEDED with a short clarifying question in `message`.\n\n" +
    `USER TRANSCRIPT: """${transcript.trim()}"""`;
  const system = withJessActionEnvelope(surface, "");
  let raw = "";
  try {
    const r = await callJessAgent({ system, user: transcript });
    raw = String(r?.text || "");
  } catch { /* swallow */ }
  if (!raw) return null;
  const parsed = parseJessResponse(raw);
  const actions = Array.isArray(parsed?.actions) ? parsed.actions : [];
  const item = actions.find((a) => a?.type === "CREATE_PLANNER_ITEM");
  if (!item || !item?.data?.title) {
    // Surface a clarification message if Jess punted.
    return { _clarification: parsed?.message || "Could you say that again with a clearer date or task?" };
  }
  const data = item.data || {};
  const date = data.date || toLocalISO(new Date());
  const dateLabel = formatDateLabel(date);
  const time = data.time || null;
  const timeLabel = time ? formatTimeLabel(parseInt(time.slice(0,2),10), parseInt(time.slice(3,5),10)) : null;
  const recurring = data.recurring && data.recurring !== "false" ? data.recurring : null;
  const recurringLabel = recurring ? (recurring[0].toUpperCase() + recurring.slice(1)) : null;
  const category = data.category || detectCategory(transcript);
  return {
    title: String(data.title || "Untitled").trim(),
    date, dateLabel, time, timeLabel, recurring, recurringLabel, category,
    _llmConfirm: parsed?.message || "",
  };
}

function formatDateLabel(iso) {
  if (!iso) return "Today";
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(iso); d.setHours(0,0,0,0);
  const diff = Math.round((d - today) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

// ─── Mic button (the thing in the Planner header) ─────────────────────
export function VoiceMicButton({ onTap }) {
  return (
    <button
      type="button"
      onClick={onTap}
      aria-label="Add by voice"
      title="Voice to Planner"
      style={{
        width: 36, height: 36, borderRadius: 9999,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: "rgba(212,175,55,0.16)", color: "#3A2C1A",
        border: "none", cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <Mic size={16} />
    </button>
  );
}

// ─── Main bottom sheet ────────────────────────────────────────────────
export default function VoiceScheduler({ open, onClose, userId, onSaved }) {
  const [state, setState] = useState("listening");
  const [transcript, setTranscript] = useState("");
  const [parsed, setParsed] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clarification, setClarification] = useState("");
  const recRef = useRef(null);

  const supported = useMemo(() => {
    if (typeof window === "undefined") return false;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    return !!SR;
  }, []);

  const startRecognition = useCallback(() => {
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
      setState((s) => {
        if (s !== "listening") return s;
        const text = (finalText || "").trim();
        if (!text) return "listening";
        processNow(text);
        return "processing";
      });
    };
    recRef.current = rec;
    try { rec.start(); } catch { /* re-entrant start is harmless */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset every time the sheet opens.
  useEffect(() => {
    if (!open) return;
    if (!supported) { setState("unsupported"); return; }
    setTranscript("");
    setParsed(null);
    setEditing(false);
    setSaving(false);
    setClarification("");
    setState("listening");
    startRecognition();
    return () => {
      try { recRef.current && recRef.current.abort(); } catch { /* swallow */ }
      recRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleStop() {
    try { recRef.current && recRef.current.stop(); } catch { /* swallow */ }
  }

  // Rule-first parser, Jess fallback when title comes back empty.
  async function processNow(text) {
    let result = parseTranscript(text);
    if (!result || !String(result.title || "").trim()) {
      // Hand to Jess.
      try {
        const llm = await parseWithJessFallback(text);
        if (llm?._clarification) {
          setClarification(llm._clarification);
          setState("listening");
          setTranscript("");
          setTimeout(startRecognition, 100);
          return;
        }
        if (llm) result = llm;
      } catch { /* swallow */ }
    }
    if (!result || !String(result.title || "").trim()) {
      // Couldn't parse — try again.
      setClarification("I missed that — try again with a verb and a time?");
      setState("listening");
      setTranscript("");
      setTimeout(startRecognition, 100);
      return;
    }
    setParsed(result);
    setState("confirm");
  }

  function handleTryAgain() {
    setParsed(null);
    setTranscript("");
    setClarification("");
    setState("listening");
    setTimeout(startRecognition, 100);
  }

  async function handleSave() {
    if (!parsed || saving) return;
    setSaving(true);
    try {
      const results = await executeJessActions([{
        type: "CREATE_PLANNER_ITEM",
        confidence: 1,
        data: {
          title: parsed.title,
          date: parsed.date,
          time: parsed.time,
          item_type: parsed.category === "task" ? "task" : "event",
          category: parsed.category,
          recurring: parsed.recurring || null,
          source: "voice",
        },
      }], userId);
      // executeJessActions returns per-action results — at least one
      // success is enough to call it shipped. Errors are swallowed in
      // the executor so the UX never deadlocks.
      const ok = (results || []).some((r) => r && r.success);
      if (!ok) {
        setSaving(false);
        setClarification("Couldn't save that — try again?");
        return;
      }
      setState("saved");
      try { onSaved && onSaved(parsed); } catch { /* swallow */ }
      setTimeout(() => { onClose && onClose(); }, 1300);
    } catch {
      setSaving(false);
      setClarification("Couldn't save that — try again?");
    }
  }

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(8,4,2,0.65)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        zIndex: 120,
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 520,
          background: C.bg,
          color: C.cream,
          borderRadius: "20px 20px 0 0",
          boxShadow: "0 -12px 36px rgba(0,0,0,0.55)",
          border: `1px solid ${C.border}`,
          borderBottom: "none",
          display: "flex", flexDirection: "column",
          maxHeight: "84vh",
          fontFamily: '"Inter", system-ui, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{
          padding: "14px 16px 12px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div>
            <p style={{
              margin: 0, fontSize: 10, fontWeight: 700,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: C.gold,
            }}>Voice to planner</p>
            <h2 style={{
              margin: "3px 0 0", fontSize: 17, fontWeight: 600,
              fontFamily: '"Fraunces", Georgia, serif',
              color: C.cream, letterSpacing: -0.1,
            }}>{state === "saved" ? "Saved" : "What should I add?"}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32, height: 32, borderRadius: 9999,
              background: C.surfaceHi, border: "none",
              color: C.cream, cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}
          ><X size={14} /></button>
        </div>

        {/* Body */}
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "22px 16px max(22px, env(safe-area-inset-bottom))",
          display: "flex", flexDirection: "column", gap: 16,
          alignItems: "center", justifyContent: "center",
          minHeight: 260,
        }}>
          {state === "unsupported" && <UnsupportedState />}
          {state === "listening"   && <ListeningState transcript={transcript} clarification={clarification} onStop={handleStop} />}
          {state === "processing"  && <ProcessingState />}
          {state === "confirm" && (
            editing ? (
              <EditState
                parsed={parsed}
                onChange={setParsed}
                onDone={() => setEditing(false)}
              />
            ) : (
              <ConfirmState
                parsed={parsed}
                saving={saving}
                onSave={handleSave}
                onTryAgain={handleTryAgain}
                onEdit={() => setEditing(true)}
              />
            )
          )}
          {state === "saved" && <SavedToast parsed={parsed} />}
        </div>
      </div>

      <style>{`
        @keyframes voice-mic-pulse {
          0%   { transform: scale(1);   box-shadow: 0 0 0 0   rgba(232,180,184,0.55); }
          70%  { transform: scale(1.06); box-shadow: 0 0 0 24px rgba(232,180,184,0.00); }
          100% { transform: scale(1);   box-shadow: 0 0 0 0   rgba(232,180,184,0.00); }
        }
        @keyframes voice-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes voice-toast-rise {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── State views ──────────────────────────────────────────────────────
function UnsupportedState() {
  return (
    <div style={{ textAlign: "center", padding: "20px 12px", maxWidth: 320 }}>
      <div style={{
        width: 56, height: 56, borderRadius: 9999,
        background: C.surfaceHi, color: C.muted,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        marginBottom: 14,
      }}><Mic size={22} /></div>
      <h3 style={{
        margin: "0 0 6px", fontFamily: "'Fraunces', Georgia, serif",
        fontSize: 17, fontWeight: 600, color: C.cream,
      }}>Voice entry isn't supported on this browser</h3>
      <p style={{
        margin: 0, fontSize: 13, color: C.muted, lineHeight: 1.55,
      }}>Try Chrome on Android or Safari on iOS. The global + button still works for typing entries.</p>
    </div>
  );
}

function ListeningState({ transcript, clarification, onStop }) {
  return (
    <>
      <button
        type="button"
        onClick={onStop}
        aria-label="Stop listening"
        style={{
          width: 96, height: 96, borderRadius: 9999,
          background: C.blush, color: C.bg,
          border: "none", cursor: "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          animation: "voice-mic-pulse 1.5s ease-in-out infinite",
        }}
      ><Mic size={36} /></button>
      <p style={{
        margin: "6px 0 0", fontSize: 11, fontWeight: 700,
        letterSpacing: "0.18em", textTransform: "uppercase",
        color: C.gold,
      }}>Listening · tap to stop</p>
      {clarification ? (
        <p style={{
          margin: 0, fontSize: 13, color: C.blush, lineHeight: 1.5,
          textAlign: "center", maxWidth: 360, fontStyle: "italic",
        }}>{clarification}</p>
      ) : null}
      <p style={{
        margin: 0, fontFamily: "'Fraunces', Georgia, serif", fontSize: 16,
        color: transcript ? C.cream : C.muted, lineHeight: 1.5,
        textAlign: "center", maxWidth: 380, minHeight: 28,
        fontStyle: transcript ? "normal" : "italic",
      }}>
        {transcript || "e.g. “Take medication at 8pm every day” or “Yoga tomorrow morning”"}
      </p>
    </>
  );
}

function ProcessingState() {
  return (
    <>
      <div style={{
        width: 64, height: 64, borderRadius: 9999,
        background: C.goldSoft, color: C.gold,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}>
        <Loader2 size={28} style={{ animation: "voice-spin 900ms linear infinite" }} />
      </div>
      <p style={{
        margin: 0, fontFamily: "'Fraunces', Georgia, serif",
        fontSize: 16, color: C.cream, fontStyle: "italic",
      }}>Working out what you said…</p>
    </>
  );
}

function ConfirmState({ parsed, saving, onSave, onTryAgain, onEdit }) {
  const meta = CATEGORY_META[parsed.category] || CATEGORY_META.task;
  const CatIcon = meta.Icon;
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
      <article style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderLeft: `3px solid ${meta.tint}`,
        borderRadius: 12,
        padding: "16px 16px 14px",
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{
            width: 36, height: 36, borderRadius: 10,
            background: `${meta.tint}33`, color: meta.tint,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}><CatIcon size={17} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              margin: 0, fontSize: 10, fontWeight: 700,
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: C.muted,
            }}>{meta.label}</p>
            <h3 style={{
              margin: "3px 0 0", fontSize: 18, fontWeight: 600,
              fontFamily: "'Fraunces', Georgia, serif", color: C.cream,
              lineHeight: 1.3, wordBreak: "break-word",
            }}>{parsed.title}</h3>
          </div>
          <button
            type="button" onClick={onEdit}
            aria-label="Edit details"
            style={{
              width: 30, height: 30, borderRadius: 8,
              background: C.surfaceHi, color: C.cream, border: "none",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}
          ><Pencil size={13} /></button>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Chip Icon={Calendar} label={parsed.dateLabel} />
          {parsed.timeLabel && <Chip Icon={Clock} label={parsed.timeLabel} />}
          {parsed.recurringLabel && <Chip Icon={Repeat} label={parsed.recurringLabel} tone="gold" />}
        </div>
      </article>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="button"
          onClick={onTryAgain}
          disabled={saving}
          style={{
            flex: "0 0 auto",
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "11px 16px", borderRadius: 9999,
            background: C.surface, border: `1px solid ${C.border}`,
            color: C.muted, cursor: saving ? "default" : "pointer",
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
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "12px 16px", borderRadius: 9999,
            background: C.gold, color: C.bg, border: "none",
            cursor: saving ? "default" : "pointer",
            fontSize: 13.5, fontWeight: 700, letterSpacing: 0.2,
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? (
            <><Loader2 size={13} style={{ animation: "voice-spin 900ms linear infinite" }} /> Saving…</>
          ) : (
            <><Check size={13} /> Save to Planner</>
          )}
        </button>
      </div>
    </div>
  );
}

function EditState({ parsed, onChange, onDone }) {
  const upd = (patch) => onChange({ ...parsed, ...patch });
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
      <Field label="Title">
        <input
          value={parsed.title}
          onChange={(e) => upd({ title: e.target.value })}
          style={editInputStyle}
        />
      </Field>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Date">
          <input
            type="date"
            value={parsed.date}
            onChange={(e) => upd({ date: e.target.value, dateLabel: formatDateLabel(e.target.value) })}
            style={editInputStyle}
          />
        </Field>
        <Field label="Time">
          <input
            type="time"
            value={parsed.time || ""}
            onChange={(e) => {
              const t = e.target.value || null;
              const label = t ? formatTimeLabel(parseInt(t.slice(0,2),10), parseInt(t.slice(3,5),10)) : null;
              upd({ time: t, timeLabel: label });
            }}
            style={editInputStyle}
          />
        </Field>
      </div>
      <Field label="Recurring">
        <select
          value={parsed.recurring || ""}
          onChange={(e) => {
            const v = e.target.value || null;
            const label = v === "daily" ? "Daily" : v === "weekly" ? "Weekly" : null;
            upd({ recurring: v, recurringLabel: label });
          }}
          style={editInputStyle}
        >
          <option value="">One-off</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </Field>
      <button
        type="button"
        onClick={onDone}
        style={{
          marginTop: 4,
          padding: "11px 16px", borderRadius: 9999,
          background: C.gold, color: C.bg, border: "none",
          cursor: "pointer", fontSize: 13.5, fontWeight: 700,
        }}
      >Done</button>
    </div>
  );
}

const editInputStyle = {
  width: "100%",
  padding: "10px 12px",
  background: C.surface,
  color: C.cream,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

function Field({ label, children }) {
  return (
    <label style={{ display: "block", flex: 1 }}>
      <span style={{
        display: "block",
        fontSize: 10, fontWeight: 700,
        letterSpacing: "0.16em", textTransform: "uppercase",
        color: C.muted, marginBottom: 6,
      }}>{label}</span>
      {children}
    </label>
  );
}

function SavedToast({ parsed }) {
  return (
    <div style={{
      width: "100%", maxWidth: 420,
      background: C.sageSoft,
      border: `1px solid ${C.sage}66`,
      borderRadius: 12,
      padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 12,
      animation: "voice-toast-rise 200ms ease-out",
    }}>
      <span style={{
        width: 36, height: 36, borderRadius: 9999,
        background: C.sage, color: C.bg,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}><Check size={18} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontSize: 11, fontWeight: 700,
          letterSpacing: "0.16em", textTransform: "uppercase",
          color: C.sage,
        }}>Added to your planner</p>
        <p style={{
          margin: "2px 0 0", fontSize: 14, color: C.cream,
          fontFamily: "'Fraunces', Georgia, serif",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{parsed?.title}{parsed?.recurringLabel ? ` · ${parsed.recurringLabel}` : ""}</p>
      </div>
    </div>
  );
}

function Chip({ Icon, label, tone }) {
  const isGold = tone === "gold";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "5px 10px", borderRadius: 9999,
      background: isGold ? C.goldSoft : C.surfaceHi,
      border: `1px solid ${isGold ? `${C.gold}44` : C.border}`,
      fontSize: 11.5, fontWeight: 600,
      color: isGold ? C.gold : C.textMid,
    }}>
      <Icon size={11} style={{ color: isGold ? C.gold : C.muted }} /> {label}
    </span>
  );
}
