// JessVoiceLogger — Feature 3 of the Jess major build sprint.
//
// Full-screen overlay. User talks naturally, Web Speech API streams the
// transcript, an LLM extractor parses the final transcript into health-
// data items, the user reviews + edits the extracted chips, then Save
// fans out to the correct base44 entities.
//
// Three stages:
//   1. Listening — orb pulses, transcript fills, mic / pause / Done.
//   2. Processing — orb dims, "Processing…" label, awaiting LLM.
//   3. Confirm   — slide-up card with extracted chips + Save / Try
//                  again.
//
// Browser support: SpeechRecognition (Chrome / Safari / Edge). Fallback
// for Firefox + Samsung Internet is a text input — same extraction +
// confirmation flow downstream.

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { X, Mic, Pause, Play, Check, Edit3, RotateCw, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useScrollLock } from "@/utils/useScrollLock";

// FemWell tokens — locked.
const C = {
  cream:        "#F4EDDB",
  creamDark:    "#EDE6D5",
  paper:        "#FBF6E6",
  espresso:     "#3A2C1A",
  espressoDeep: "#2A1E0E",
  blush:        "#E8B4B8",
  sage:         "#8FAF8F",
  muted:        "#9B8B7A",
  gold:         "#D4AF37",
  border:       "#D4C9B4",
};

// Category metadata — chip colour + icon glyph + display label.
// Used by the confirmation card to render each extracted item.
const CATEGORY = {
  mood:       { label: "Mood",        bg: "#F5D8DA", fg: "#7A2935", glyph: "✦" },
  energy:     { label: "Energy",      bg: "#F5E8B0", fg: "#7A6320", glyph: "✦" },
  symptom:    { label: "Symptom",     bg: "#EDE6D5", fg: "#5B4A3A", glyph: "✦" },
  meal:       { label: "Meal",        bg: "#D4E6D4", fg: "#3A5A3A", glyph: "✦" },
  water:      { label: "Water",       bg: "#D4E6D4", fg: "#3A5A3A", glyph: "✦" },
  medication: { label: "Medication",  bg: "#EDE4F8", fg: "#4A3B7A", glyph: "✦" },
  supplement: { label: "Supplement",  bg: "#EDE4F8", fg: "#4A3B7A", glyph: "✦" },
  task:       { label: "Task",        bg: "#F4EDDB", fg: "#3A2C1A", glyph: "✦" },
  journal:    { label: "Journal",     bg: "#F4EDDB", fg: "#9B8B7A", glyph: "✦" },
};

// ─── Public component ───────────────────────────────────────────────────
export default function JessVoiceLogger({ open, onClose, user }) {
  useScrollLock(open);   // lock the background page while the voice logger is open
  const [stage, setStage] = useState("idle"); // idle | listening | processing | confirm | saving | done | error
  const [interimText, setInterimText] = useState("");
  const [finalText, setFinalText] = useState("");
  const [extractedItems, setExtractedItems] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [fallbackText, setFallbackText] = useState("");
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const isPausedRef = useRef(false);

  // Detect SpeechRecognition once.
  const speechSupported = useMemo(() => {
    if (typeof window === "undefined") return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }, []);

  // Reset everything when the modal opens.
  useEffect(() => {
    if (!open) return;
    setStage("idle");
    setInterimText("");
    setFinalText("");
    setExtractedItems([]);
    setErrorMsg("");
    setFallbackText("");
    isPausedRef.current = false;
  }, [open]);

  // Clean up the recognition + silence timer when the modal closes or
  // the component unmounts.
  useEffect(() => () => {
    try { recognitionRef.current?.stop(); } catch {}
    if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current);
  }, []);

  // ── Recognition lifecycle ───────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!speechSupported) { setStage("idle"); return; }
    setStage("listening");
    setInterimText("");
    isPausedRef.current = false;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SpeechRecognition();
    r.continuous = true;
    r.interimResults = true;
    r.lang = "en-GB";
    r.onresult = (e) => {
      // 8 s silence timer resets every time we get speech back.
      if (silenceTimerRef.current) {
        window.clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const seg = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += seg;
        else interim += seg;
      }
      setInterimText(interim);
      if (final) setFinalText((prev) => (prev ? prev + " " : "") + final.trim());
    };
    r.onspeechend = () => {
      // After speech ends, give the user 8 s before we auto-stop.
      // Pause doesn't trigger this path because we manually .stop().
      if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = window.setTimeout(() => {
        try { r.stop(); } catch {}
      }, 8000);
    };
    r.onerror = (e) => {
      // Common errors: no-speech (user silent), audio-capture (no mic),
      // not-allowed (mic permission denied). Show a friendly fallback.
      if (e?.error === "not-allowed" || e?.error === "audio-capture") {
        setErrorMsg("Mic access blocked. You can type instead.");
        setStage("idle");
      }
    };
    r.onend = () => {
      // If the user paused, leave us idle. If we auto-stopped after
      // silence, advance to processing iff we have any final text.
      if (isPausedRef.current) return;
      // Let the user tap Done — don't auto-advance. Stay in listening.
    };
    recognitionRef.current = r;
    try { r.start(); }
    catch (err) { setErrorMsg(String(err?.message || err)); setStage("idle"); }
  }, [speechSupported]);

  const pauseListening = useCallback(() => {
    isPausedRef.current = true;
    try { recognitionRef.current?.stop(); } catch {}
    if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current);
  }, []);

  const resumeListening = useCallback(() => {
    isPausedRef.current = false;
    startListening();
  }, [startListening]);

  // ── Done: stop, extract, show confirmation ─────────────────────────
  const finishAndExtract = useCallback(async () => {
    // Take the final text plus any uncommitted interim segment.
    const transcript = ((finalText || "") + " " + (interimText || "")).trim();
    isPausedRef.current = true;
    try { recognitionRef.current?.stop(); } catch {}
    if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current);
    if (!transcript) { setStage("idle"); return; }
    setStage("processing");
    setInterimText("");
    try {
      const items = await runExtractor(transcript);
      if (!items.length) {
        setErrorMsg("I didn't catch anything I could log. Try again?");
        setStage("idle");
        setFinalText(transcript);
        return;
      }
      setExtractedItems(items);
      setStage("confirm");
    } catch (e) {
      setErrorMsg(String(e?.message || "Extractor failed"));
      setStage("idle");
    }
  }, [finalText, interimText]);

  // ── Fallback text path (no SpeechRecognition) ───────────────────────
  const submitFallback = useCallback(async () => {
    const text = fallbackText.trim();
    if (!text) return;
    setFinalText(text);
    setStage("processing");
    try {
      const items = await runExtractor(text);
      if (!items.length) {
        setErrorMsg("I didn't catch anything I could log. Try again?");
        setStage("idle");
        return;
      }
      setExtractedItems(items);
      setStage("confirm");
    } catch (e) {
      setErrorMsg(String(e?.message || "Extractor failed"));
      setStage("idle");
    }
  }, [fallbackText]);

  // ── Save extracted items to base44 entities ─────────────────────────
  const handleSave = useCallback(async () => {
    setStage("saving");
    try {
      await saveExtractedItems(extractedItems, user?.id);
      setStage("done");
      window.setTimeout(() => { onClose?.(); }, 1500);
    } catch (e) {
      setErrorMsg(String(e?.message || "Save failed"));
      setStage("confirm");
    }
  }, [extractedItems, user?.id, onClose]);

  const tryAgain = useCallback(() => {
    setStage("idle");
    setInterimText("");
    setFinalText("");
    setExtractedItems([]);
    setErrorMsg("");
    setFallbackText("");
  }, []);

  const removeItem = useCallback((idx) => {
    setExtractedItems((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Voice logger"
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "linear-gradient(168deg, #2A1014 0%, #2A1410 40%, #2A1E0E 80%, #1A0E08 100%)",
        display: "flex", flexDirection: "column",
        animation: "vl-fade-in 240ms ease-out",
        padding: "max(env(safe-area-inset-top), 16px) 16px max(env(safe-area-inset-bottom), 16px)",
        boxSizing: "border-box",
        color: C.cream,
        }}
    >
      <KeyframesBlock />

      {/* Top bar */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 24,
      }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
          textTransform: "uppercase", color: C.gold,
        }}>Voice Logger</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close voice logger"
          style={{
            width: 36, height: 36, borderRadius: 9999, border: "none",
            background: "rgba(244,237,219,0.08)", color: C.cream, cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}
        ><X size={16} aria-hidden /></button>
      </header>

      {/* Central area — orb + transcript */}
      <div style={{
        flex: 1, minHeight: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 32,
        overflow: "hidden",
      }}>
        <OrbWithRings stage={stage} />
        <TranscriptPanel
          stage={stage}
          interim={interimText}
          final={finalText}
          errorMsg={errorMsg}
          extractedItemsCount={extractedItems.length}
        />
      </div>

      {/* Bottom controls — depend on stage */}
      <BottomControls
        stage={stage}
        speechSupported={speechSupported}
        fallbackText={fallbackText}
        onFallbackChange={setFallbackText}
        onFallbackSubmit={submitFallback}
        onStart={startListening}
        onPause={pauseListening}
        onResume={resumeListening}
        onDone={finishAndExtract}
      />

      {/* Confirmation sheet — slides up from bottom */}
      {stage === "confirm" && (
        <ConfirmationSheet
          items={extractedItems}
          onRemove={removeItem}
          onSave={handleSave}
          onTryAgain={tryAgain}
        />
      )}
    </div>
  );
}

// ─── Orb + concentric rings ──────────────────────────────────────────────
function OrbWithRings({ stage }) {
  const tone = stage === "done" ? C.gold : stage === "processing" || stage === "saving" ? C.sage : C.gold;
  const dimmed = stage === "processing" || stage === "saving";
  return (
    <div style={{
      position: "relative", width: 240, height: 240,
      display: "flex", alignItems: "center", justifyContent: "center",
    }} aria-hidden>
      {[240, 200, 160].map((size, i) => (
        <div
          key={size}
          style={{
            position: "absolute",
            width: size, height: size, borderRadius: "50%",
            border: `1px solid rgba(212,175,55,${dimmed ? 0.1 : 0.2})`,
            animation: dimmed
              ? "none"
              : `vl-ring 2.5s ease-in-out ${i * 0.8}s infinite`,
          }}
        />
      ))}
      <div style={{
        width: 120, height: 120, borderRadius: "50%",
        background: `radial-gradient(circle, ${tone}55, ${C.sage}30, transparent)`,
        animation: dimmed ? "none" : "vl-orb-pulse 2.5s ease-in-out infinite",
        opacity: dimmed ? 0.4 : 1,
        transition: "opacity 320ms ease, background 320ms ease",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {stage === "done" && (
          <Check size={36} style={{ color: C.gold }} aria-hidden />
        )}
      </div>
    </div>
  );
}

// ─── Transcript panel — interim + final text + status line ───────────────
function TranscriptPanel({ stage, interim, final, errorMsg, extractedItemsCount }) {
  const status = stage === "listening" ? "Listening…"
    : stage === "processing" ? "Processing…"
    : stage === "saving" ? "Saving…"
    : stage === "done" ? `Saved ${extractedItemsCount} item${extractedItemsCount === 1 ? "" : "s"} ✓`
    : stage === "confirm" ? "Review what Jess heard"
    : stage === "idle" ? (errorMsg || "Tap the mic to start") : "";

  return (
    <div style={{
      width: "100%", maxWidth: 480,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
      minHeight: 100,
    }}>
      <div style={{
        textAlign: "center",
        maxHeight: 160, overflowY: "auto",
        padding: "0 8px",
        fontSize: 18, lineHeight: 1.5, fontStyle: "italic",
        color: C.cream,
        animation: "vl-bubble-in 320ms ease-out",
        scrollbarWidth: "none",
        overscrollBehavior: "contain",
        WebkitOverflowScrolling: "touch",
      }}>
        {final && <span>{final}</span>}
        {interim && (
          <span style={{ opacity: 0.55 }}>{final ? " " : ""}{interim}</span>
        )}
        {!final && !interim && stage === "listening" && (
          <span style={{ opacity: 0.5 }}>Speak naturally — Jess is listening</span>
        )}
      </div>
      <p style={{
        margin: 0, fontSize: 12, letterSpacing: "0.08em",
        color: stage === "done" ? C.gold : C.muted,
        textTransform: stage === "done" ? "uppercase" : "none",
        textAlign: "center",
      }}>{status}</p>
    </div>
  );
}

// ─── Bottom controls — three stages of UI ──────────────────────────────────
function BottomControls({
  stage, speechSupported, fallbackText, onFallbackChange, onFallbackSubmit,
  onStart, onPause, onResume, onDone,
}) {
  // Confirmation / saving / done: hide bottom controls, sheet/done state owns the UI.
  if (stage === "confirm" || stage === "done" || stage === "saving") return null;

  // No SpeechRecognition: show text fallback.
  if (!speechSupported && stage !== "processing") {
    return (
      <div style={{
        width: "100%", maxWidth: 480, alignSelf: "center",
        display: "flex", gap: 8, alignItems: "center",
        background: "rgba(244,237,219,0.08)",
        border: "1px solid rgba(212,175,55,0.18)",
        borderRadius: 16, padding: "10px 12px",
        marginTop: 12,
      }}>
        <input
          value={fallbackText}
          onChange={(e) => onFallbackChange(e.target.value)}
          placeholder="Type what you'd like to log…"
          style={{
            flex: 1, minWidth: 0,
            background: "transparent", border: "none", outline: "none",
            color: C.cream, fontSize: 14,
            }}
          onKeyDown={(e) => { if (e.key === "Enter") onFallbackSubmit(); }}
        />
        <button
          type="button"
          onClick={onFallbackSubmit}
          aria-label="Submit"
          disabled={!fallbackText.trim()}
          style={{
            width: 40, height: 40, borderRadius: 9999, border: "none",
            background: C.blush, color: C.espresso,
            cursor: fallbackText.trim() ? "pointer" : "not-allowed",
            opacity: fallbackText.trim() ? 1 : 0.5,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        ><Send size={16} aria-hidden /></button>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 18,
      marginTop: 24,
    }}>
      {stage !== "listening" && (
        <button
          type="button"
          onClick={onStart}
          aria-label="Start listening"
          style={{
            width: 64, height: 64, borderRadius: 9999, border: "none",
            background: C.blush, color: C.espresso, cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 24px rgba(232,180,184,0.35)",
          }}
        ><Mic size={26} aria-hidden /></button>
      )}
      {stage === "listening" && (
        <>
          <button
            type="button"
            onClick={onPause}
            aria-label="Pause listening"
            style={{
              width: 48, height: 48, borderRadius: 9999,
              background: "transparent", color: C.muted,
              border: `1px solid rgba(155,139,122,0.4)`, cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}
          ><Pause size={18} aria-hidden /></button>
          <button
            type="button"
            onClick={onDone}
            aria-label="Done"
            style={{
              minWidth: 96, padding: "0 22px", height: 48,
              borderRadius: 9999, border: "none",
              background: C.espresso, color: C.cream, cursor: "pointer",
              fontSize: 13.5, fontWeight: 700, letterSpacing: "0.04em",
            }}
          >Done</button>
        </>
      )}
      {stage === "idle" && (
        <button
          type="button"
          onClick={onResume}
          aria-label="Resume listening"
          style={{
            background: "transparent", color: C.muted, border: "none",
            fontSize: 12,
            cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 4,
            opacity: 0,
            pointerEvents: "none",
          }}
        ><Play size={14} aria-hidden /> Resume</button>
      )}
    </div>
  );
}

// ─── Confirmation sheet ──────────────────────────────────────────────────
function ConfirmationSheet({ items, onRemove, onSave, onTryAgain }) {
  return (
    <div
      role="dialog"
      aria-label="Review extracted items"
      className="fw-sheet-safe"
      style={{
        position: "absolute", left: 0, right: 0, bottom: 0,
        background: C.cream,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: "20px 20px max(env(safe-area-inset-bottom), 20px)",
        boxShadow: "0 -20px 60px rgba(0,0,0,0.4)",
        animation: "vl-sheet-up 320ms cubic-bezier(0.16,1,0.3,1)",
        maxHeight: "70vh", overflowY: "auto",
        overscrollBehavior: "contain", WebkitOverflowScrolling: "touch",
        color: C.espresso,
      }}
    >
      <p style={{
        margin: "0 0 4px",
        fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
        textTransform: "uppercase", color: C.gold,
      }}>Jess heard this</p>
      <h2 style={{
        margin: "0 0 14px",
        fontSize: 19, fontWeight: 600, color: C.espresso,
        letterSpacing: "-0.01em",
      }}>{items.length} thing{items.length === 1 ? "" : "s"} to log</h2>

      <ul style={{
        listStyle: "none", margin: "0 0 16px", padding: 0,
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        {items.map((item, i) => {
          const cat = CATEGORY[item.type] || { label: item.type, bg: C.creamDark, fg: C.muted, glyph: "✦" };
          const lowConfidence = (item.confidence ?? 1) < 0.8;
          return (
            <li key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 12,
              background: cat.bg, color: cat.fg,
              border: lowConfidence ? `1px dashed ${cat.fg}` : "1px solid transparent",
            }}>
              <span aria-hidden style={{ fontSize: 14, lineHeight: 1, color: cat.fg }}>{cat.glyph}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{
                  display: "inline-block", marginRight: 8,
                  padding: "1px 6px", borderRadius: 9999,
                  background: "rgba(255,255,255,0.5)",
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  verticalAlign: "middle",
                }}>{cat.label}</span>
                <span style={{
                  fontSize: 13, lineHeight: 1.4,
                }}>{item.display || JSON.stringify(item.data)}</span>
              </div>
              <button
                type="button"
                aria-label={`Remove: ${item.display}`}
                onClick={() => onRemove(i)}
                style={{
                  width: 28, height: 28, borderRadius: 9999, border: "none",
                  background: "rgba(255,255,255,0.4)", color: cat.fg, cursor: "pointer",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              ><X size={12} aria-hidden /></button>
            </li>
          );
        })}
      </ul>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button
          type="button"
          onClick={onSave}
          disabled={items.length === 0}
          style={{
            flex: 1, minHeight: 48, borderRadius: 9999, border: "none",
            background: C.espresso, color: C.cream,
            cursor: items.length === 0 ? "not-allowed" : "pointer",
            opacity: items.length === 0 ? 0.5 : 1,
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontSize: 13.5, fontWeight: 700, letterSpacing: "0.04em",
          }}
        ><Check size={14} aria-hidden /> Save {items.length} item{items.length === 1 ? "" : "s"}</button>
        <button
          type="button"
          onClick={onTryAgain}
          style={{
            background: "transparent", color: C.muted, border: "none",
            fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
            cursor: "pointer", padding: "8px 4px",
            display: "inline-flex", alignItems: "center", gap: 4,
          }}
        ><RotateCw size={12} aria-hidden /> Try again</button>
      </div>
    </div>
  );
}

// ─── LLM extraction ─────────────────────────────────────────────────────
// Spawn an ephemeral base44.agents conversation, ask for a strict JSON
// {items: [...]} shape, parse, filter by confidence. 9 s budget.
async function runExtractor(transcript) {
  const prompt =
    `You are a health data extractor for a women's health app.\n` +
    `Extract any health data mentioned in this transcript and return ONLY valid JSON (no other text):\n\n` +
    `{\n  "items": [\n    {\n      "type": "mood|energy|symptom|meal|water|medication|supplement|task|journal",\n      "data": { /* field-specific */ },\n      "confidence": 0.0-1.0,\n      "display": "human-readable summary"\n    }\n  ]\n}\n\n` +
    `Field schemas by type:\n` +
    `- mood: { mood_level: 1-5 }\n` +
    `- energy: { energy_level: 1-5 }\n` +
    `- symptom: { symptom_name: string, severity: 1-5 }\n` +
    `- meal: { meal_type: "breakfast|lunch|dinner|snack", description: string, calories: number|null }\n` +
    `- water: { amount_ml: number }\n` +
    `- medication: { medication_name: string, dosage: string|null, taken: true }\n` +
    `- supplement: { supplement_name: string, dosage: string|null, taken: true }\n` +
    `- task: { title: string, time_of_day: "morning|afternoon|evening"|null }\n` +
    `- journal: { content: string }\n\n` +
    `Only extract items you're confident about (confidence >= 0.6). Return {"items":[]} if nothing clear.\n\n` +
    `Transcript: "${transcript}"`;

  let convo = null;
  try {
    convo = await base44.agents.createConversation({ agent_name: "personal_assistant" }).catch(() => null);
  } catch { /* swallow */ }
  if (!convo?.id) return [];

  let latestText = "";
  let unsub = null;
  try {
    const c = await base44.agents.getConversation(convo.id);
    await base44.agents.addMessage(c, { role: "user", content: prompt });
    latestText = await new Promise((resolve) => {
      let settled = false;
      unsub = base44.agents.subscribeToConversation(convo.id, (data) => {
        const list = data?.messages || [];
        for (const m of list) {
          if (m?.role !== "assistant") continue;
          const t = String(m.content || "").trim();
          if (t) latestText = t;
        }
      });
      window.setTimeout(() => {
        if (settled) return;
        settled = true;
        resolve(latestText);
      }, 9000);
    });
  } catch { /* swallow */ }
  finally { try { unsub?.(); } catch {} }

  if (!latestText) return [];
  // Extract first {...} block in case the LLM wraps the JSON in prose.
  let parsed = null;
  try {
    const m = latestText.match(/\{[\s\S]*\}/);
    if (!m) return [];
    parsed = JSON.parse(m[0]);
  } catch { return []; }
  const items = Array.isArray(parsed?.items) ? parsed.items : [];
  return items
    .filter((it) => it && typeof it === "object" && it.type && it.data)
    .filter((it) => (it.confidence ?? 1) >= 0.6);
}

// ─── Entity fan-out ─────────────────────────────────────────────────────
// One per extracted item. Each write is wrapped in try/catch so a single
// entity-missing failure (e.g. MedicationLogs not in this schema) doesn't
// abort the whole batch.
async function saveExtractedItems(items, userId) {
  if (!Array.isArray(items) || !userId) return;
  const today = new Date().toISOString().split("T")[0];
  // Most FemWell entity backends key off `day_key` (YYYY-MM-DD) for
  // their daily-grain aggregation. The Pydantic models on the server
  // side reject writes missing `day_key` with 422 Field required. We
  // also keep `date` and `logged_at` to stay compatible with surfaces
  // that read those legacy field names (Track tab + Today checkin
  // modal both write all three). Voice logger is a write-only path,
  // so the cost of a few duplicated date fields is zero.
  const loggedAt = new Date().toISOString();
  for (const item of items) {
    if (!item?.type || !item?.data) continue;
    try {
      switch (item.type) {
        case "mood":
          await safeCreate("DailyCheckins", {
            user_id: userId, date: today, day_key: today,
            mood: Number(item.data.mood_level) || null,
            mood_level: Number(item.data.mood_level) || null,
          });
          break;
        case "energy":
          await safeCreate("DailyCheckins", {
            user_id: userId, date: today, day_key: today,
            energy: Number(item.data.energy_level) || null,
            energy_level: Number(item.data.energy_level) || null,
          });
          break;
        case "symptom":
          await safeCreate("SymptomLogs", {
            user_id: userId, date: today, day_key: today,
            symptom_name: String(item.data.symptom_name || ""),
            symptom_type: String(item.data.symptom_name || ""),
            severity: Number(item.data.severity) || null,
          });
          break;
        case "meal":
          await safeCreate("MealLog", {
            user_id: userId, date: today, day_key: today,
            meal_type: String(item.data.meal_type || "snack"),
            description: String(item.data.description || ""),
            calories: item.data.calories != null ? Number(item.data.calories) : null,
            logged_at: loggedAt,
          });
          break;
        case "water":
          await safeCreate("HydrationLog", {
            user_id: userId, date: today, day_key: today,
            amount_ml: Number(item.data.amount_ml) || 0,
            logged_at: loggedAt,
            source: "voice",
          });
          break;
        case "medication":
          await safeCreate("MedicationLogs", {
            user_id: userId, date: today, day_key: today,
            medication_name: String(item.data.medication_name || ""),
            dosage: item.data.dosage ? String(item.data.dosage) : null,
            taken: true,
            logged_at: loggedAt,
          });
          break;
        case "supplement":
          await safeCreate("SupplementLog", {
            user_id: userId, date: today, day_key: today,
            supplement_name: String(item.data.supplement_name || ""),
            dosage: item.data.dosage ? String(item.data.dosage) : null,
            taken: true,
          });
          break;
        case "task":
          await safeCreate("PersonalTasks", {
            user_id: userId,
            title: String(item.data.title || ""),
            time_of_day: item.data.time_of_day || null,
            date: today,
            day_key: today,
          });
          break;
        case "journal":
          await safeCreate("JournalEntries", {
            user_id: userId,
            content: String(item.data.content || ""),
            text: String(item.data.content || ""),
            date: today,
            day_key: today,
          });
          break;
        default:
          // Unknown type — skip.
          break;
      }
    } catch (e) {
      console.warn("Voice save error:", item.type, e?.message || e);
    }
  }
}

// Per-entity guard: if the entity isn't on the schema, fail silently
// rather than blowing the whole batch.
async function safeCreate(entityName, payload) {
  const Entity = base44?.entities?.[entityName];
  if (!Entity) return null;
  try { return await Entity.create(payload); }
  catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`${entityName}.create failed`, e?.message || e);
    return null;
  }
}

// Unused symbol — eslint quirk under jsx scope rules. Keeping the no-op
// import side-effect ensures the chip-edit glyph is bundled if the
// confirmation card ever gains in-place edit. Removed inline disable.

// ─── Keyframes ──────────────────────────────────────────────────────────
function KeyframesBlock() {
  return (
    <style>{`
      @keyframes vl-fade-in {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes vl-sheet-up {
        from { transform: translateY(100%); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
      }
      @keyframes vl-bubble-in {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes vl-orb-pulse {
        0%, 100% { transform: scale(1);    opacity: 0.6; }
        50%      { transform: scale(1.08); opacity: 1; }
      }
      @keyframes vl-ring {
        0%, 100% { transform: scale(1);    opacity: 0.35; }
        50%      { transform: scale(1.04); opacity: 0.55; }
      }
    `}</style>
  );
}

// _editButtonGlyph kept for the future chip-in-place-edit flow but not
// rendered yet. Wrapped in _ prefix to satisfy the unused-vars rule.
function _editButtonGlyph() { return <Edit3 size={12} aria-hidden />; }
