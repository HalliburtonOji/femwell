// JessVoiceMode — Jess Sprint 5 (Voice Companion)
//
// Full-screen voice conversation with Jess. Replaces the previous
// "Voice Logger" sheet for the mic button in JessDemoPanel.
//
// Flow:
//   1. User taps mic on JessDemoPanel → this overlay opens.
//   2. Web Speech API (`SpeechRecognition`) starts listening.
//   3. On end-of-utterance the transcript is sent to the same
//      base44 personal_assistant agent (with a [VOICE MODE] system
//      prefix) wrapped in the Sprint 5 JSON action envelope.
//   4. The agent reply is parsed (parseJessResponse) — actions
//      execute, message renders, and on supported browsers the
//      reply is spoken via window.speechSynthesis.
//   5. Mic auto-resumes after each reply for a continuous
//      conversation. "Done" closes the overlay and saves a
//      JessConversation row tagged as a voice session.
//
// Browser support:
//   • Web Speech (recognition) — Chrome / Edge / Safari 14+
//   • Speech synthesis — basically everywhere
//   If recognition isn't available we render a friendly fallback.
//
// Spec includes: dark espresso bg, central pulse circle, phase
// header, mic + Done buttons, transcript bubbles.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Mic, MicOff, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  callJessAgent,
} from "@/services/jessAgentService";
import {
  parseJessResponse,
  executeJessActions,
  updateJessMemory,
  loadJessMemory,
  saveJessMemory,
  buildMemoryContextLine,
  chipLabelForAction,
} from "@/services/jessActions";
import { useScrollLock } from "@/utils/useScrollLock";

const C = {
  espresso:    "#3A2C1A",
  espressoDeep:"#2A1E0E",
  cream:       "#F4EDDB",
  paperHi:     "#EDE6D5",
  muted:       "#9B8B7A",
  gold:        "#D4AF37",
  sage:        "#8FAF8F",
  blush:       "#E8B4B8",
  redDim:      "#7A2935",
};

const PHASE_LABEL = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulatory: "Ovulatory",
  luteal: "Luteal",
};

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

// Pick the most natural-sounding female voice available. iOS Safari
// returns voices async (the `voiceschanged` event fires later), so we
// retry once on demand.
function pickPreferredVoice() {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  // Preferences (in order): UK English female, then any English female,
  // then default.
  const ukFemale = voices.find((v) =>
    /en[-_]GB/i.test(v.lang) && /female|samantha|martha|kate/i.test(v.name)
  );
  if (ukFemale) return ukFemale;
  const enFemale = voices.find((v) =>
    /^en/i.test(v.lang) && /female|samantha|martha|kate|allison/i.test(v.name)
  );
  if (enFemale) return enFemale;
  const ukAny = voices.find((v) => /en[-_]GB/i.test(v.lang));
  if (ukAny) return ukAny;
  return voices.find((v) => /^en/i.test(v.lang)) || null;
}

export default function JessVoiceMode({ open, onClose, user, profile, phase, cycleDay }) {
  const [supported, setSupported] = useState(true);
  const [status, setStatus]   = useState("idle"); // idle | listening | thinking | speaking | error
  const [partial, setPartial] = useState("");     // live partial transcript
  const [turns, setTurns]     = useState([]);     // { role, text }
  const [jessMemory, setJessMemory] = useState([]);
  const recognitionRef = useRef(null);
  const stopRequestedRef = useRef(false);
  const turnsRef = useRef([]);
  const SpeechRecognition = useMemo(() => getSpeechRecognition(), []);

  // Sync the ref so async callbacks always read the latest list.
  useEffect(() => { turnsRef.current = turns; }, [turns]);

  // Hydrate memory ring on open.
  useEffect(() => {
    if (!open) return;
    try { setJessMemory(loadJessMemory(user?.id)); } catch {}
  }, [open, user?.id]);

  // Lock body scroll while overlay is open (shared, ref-counted hook —
  // replaces the old ad-hoc document.body.style.overflow lock).
  useScrollLock(open);

  // ── Speak a string using window.speechSynthesis ──
  // Returns a Promise that resolves when speech ends.
  const speak = useCallback((text) => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis || !text) {
        return resolve();
      }
      try {
        const utter = new SpeechSynthesisUtterance(String(text));
        utter.pitch = 1.1;
        utter.rate  = 0.95;
        utter.volume = 1.0;
        const v = pickPreferredVoice();
        if (v) utter.voice = v;
        utter.onend = () => resolve();
        utter.onerror = () => resolve();
        // Cancel any in-flight speech first so we never overlap.
        try { window.speechSynthesis.cancel(); } catch {}
        window.speechSynthesis.speak(utter);
      } catch { resolve(); }
    });
  }, []);

  // ── Stop / cancel speech and recognition ──
  const stopListening = useCallback(() => {
    stopRequestedRef.current = true;
    try { recognitionRef.current?.stop(); } catch {}
  }, []);
  const startListening = useCallback(() => {
    if (!SpeechRecognition) { setSupported(false); return; }
    stopRequestedRef.current = false;
    try {
      const rec = new SpeechRecognition();
      rec.lang = "en-GB";
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.continuous = false;
      recognitionRef.current = rec;

      let acc = "";
      rec.onresult = (e) => {
        let finalChunk = "";
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) finalChunk += r[0].transcript;
          else interim += r[0].transcript;
        }
        if (finalChunk) acc += finalChunk;
        setPartial((acc + " " + interim).trim());
      };
      rec.onerror = () => {
        // Common transient errors: 'no-speech', 'aborted'. Just stop.
        setStatus("idle");
      };
      rec.onend = async () => {
        const utterance = acc.trim();
        recognitionRef.current = null;
        if (!utterance) {
          if (!stopRequestedRef.current) {
            // Brief idle, then auto-resume if user didn't close.
            setStatus("idle");
            setTimeout(() => { if (!stopRequestedRef.current) startListening(); }, 250);
          }
          return;
        }
        // Push the user's bubble + clear partial.
        setPartial("");
        setTurns((prev) => [...prev, { role: "user", text: utterance }]);
        // Hand off to the agent.
        await respondTo(utterance);
        if (!stopRequestedRef.current) {
          setStatus("idle");
          setTimeout(() => { if (!stopRequestedRef.current) startListening(); }, 200);
        }
      };
      rec.onstart = () => setStatus("listening");
      rec.start();
    } catch {
      setStatus("idle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SpeechRecognition]);

  // ── Ask Jess; parse envelope; execute actions; speak the reply. ──
  const respondTo = useCallback(async (userText) => {
    if (!user?.id) return;
    setStatus("thinking");
    const memoryLine = (() => {
      try { return buildMemoryContextLine(jessMemory) || ""; }
      catch { return ""; }
    })();
    const system =
      "[VOICE MODE] " +
      "You are Jess, the FemWell women's health companion. The user is speaking out loud — keep replies " +
      "warm, concise (1-2 sentences), conversational. Avoid lists, headings, or markdown — your reply " +
      "will be spoken aloud. You MUST respond as the action JSON envelope: " +
      "{ \"message\": \"…\", \"actions\": [{ type, confidence, data }] }. " +
      "When the user mentions logging mood, energy, sleep, symptoms, meals, hydration, medication, " +
      "supplements, habits, tasks, or journal entries, include the matching action. Confidence ≥ 0.75 " +
      "for actions you're sure of; CLARIFICATION_NEEDED otherwise. " +
      "After successfully logging, say something brief and natural like 'Got it.' or 'Done, I've " +
      "noted that.' Don't read out every field.\n\n" +
      `Cycle phase: ${phase || "follicular"}. Day ${cycleDay || 1}. ` +
      `Life stage: ${profile?.life_stage || "reproductive"}.\n\n` +
      `[MEMORY CONTEXT]\n${memoryLine || "(no prior turns)"}`;

    let raw = "";
    try {
      const r = await callJessAgent({ system, user: userText });
      raw = r?.text || "";
    } catch (e) {
      raw = "";
    }

    const parsed = parseJessResponse(raw);
    const replyText = parsed.message || "Sorry, I didn't catch that. Could you say it again?";
    // Push Jess's bubble.
    setTurns((prev) => [...prev, { role: "jess", text: replyText }]);
    // Execute actions.
    let results = [];
    try {
      results = await executeJessActions(parsed.actions, user.id);
    } catch (e) {
      try { console.warn("[jess-voice] action execute threw:", String(e?.message || e)); } catch {}
    }
    // Update memory + persist.
    setJessMemory((prev) => {
      const next = updateJessMemory(prev, results, userText, replyText);
      try { saveJessMemory(user.id, next); } catch {}
      return next;
    });
    // Confirmation chips inline.
    const successful = (results || []).filter((r) => r && r.success);
    if (successful.length > 0) {
      setTurns((prev) => [
        ...prev,
        ...successful.map((r) => ({
          role: "chip",
          text: chipLabelForAction(r.action?.type, r.action?.data) || "✓ Done",
        })),
      ]);
    }
    // Speak the reply.
    setStatus("speaking");
    await speak(replyText);
  }, [user?.id, jessMemory, phase, cycleDay, profile?.life_stage, speak]);

  // ── On open: kick off recognition + load voices ──
  useEffect(() => {
    if (!open) return;
    if (!SpeechRecognition) { setSupported(false); return; }
    // Warm up the voice list on browsers that need an event.
    try { window.speechSynthesis?.getVoices?.(); } catch {}
    if (window.speechSynthesis && "onvoiceschanged" in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => { /* lazily refreshes pickPreferredVoice */ };
    }
    startListening();
    return () => {
      stopRequestedRef.current = true;
      try { recognitionRef.current?.stop(); } catch {}
      try { window.speechSynthesis?.cancel(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, SpeechRecognition]);

  // ── Done — save a voice session JessConversation row, close. ──
  const handleDone = useCallback(async () => {
    stopListening();
    try { window.speechSynthesis?.cancel(); } catch {}
    // Save the voice conversation if there's anything to remember.
    if (user?.id && turnsRef.current.length > 0) {
      try {
        const transcript = turnsRef.current
          .filter((t) => t.role === "user" || t.role === "jess")
          .map((t) => `${t.role === "user" ? "User" : "Jess"}: ${t.text}`)
          .join("\n\n");
        await base44.entities.JessConversation.create({
          user_id: user.id,
          conversation_type: "voice_session",
          name: `Voice session · ${new Date().toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
          message_count: turnsRef.current.filter((t) => t.role === "user" || t.role === "jess").length,
          preview_text: transcript.slice(0, 200),
          // Some schemas use `transcript` / `last_message` — be tolerant.
          transcript: transcript.slice(0, 4000),
        });
      } catch { /* swallow */ }
    }
    onClose?.();
  }, [onClose, stopListening, user?.id]);

  if (!open) return null;

  // ── Unsupported-browser fallback ──
  if (!supported) {
    return (
      <div role="dialog" aria-modal="true" aria-label="Jess voice mode"
        style={shellStyle}>
        <button type="button" onClick={onClose} aria-label="Close voice mode"
          style={closeBtn}><X size={18} /></button>
        <div style={{
          maxWidth: 360, padding: 24, textAlign: "center",
          color: C.cream, }}>
          <p style={{
            fontSize: 22, fontWeight: 500, margin: 0, lineHeight: 1.3,
          }}>Voice isn't available on this browser.</p>
          <p style={{ marginTop: 12, fontSize: 14, color: "rgba(244,237,219,0.7)", lineHeight: 1.55 }}>
            Try updating Safari or use text chat — Jess works either way.
          </p>
        </div>
      </div>
    );
  }

  const phaseLabel = PHASE_LABEL[phase] || PHASE_LABEL.follicular;
  const statusCopy =
    status === "listening" ? "Listening…" :
    status === "thinking"  ? "Jess is thinking…" :
    status === "speaking"  ? "Speaking…" :
                             "Tap mic to speak";

  return (
    <div role="dialog" aria-modal="true" aria-label="Jess voice mode" style={shellStyle}>
      {/* Header: phase line + Done */}
      <div style={{
        position: "absolute", top: "max(env(safe-area-inset-top), 14px)",
        left: 0, right: 0, padding: "0 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        color: C.cream, }}>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
          textTransform: "uppercase", color: "rgba(244,237,219,0.75)",
        }}>
          Jess · Day {cycleDay || 1} · {phaseLabel}
        </span>
        <button
          type="button"
          onClick={handleDone}
          style={{
            background: "rgba(244,237,219,0.10)", color: C.cream,
            border: "1px solid rgba(244,237,219,0.25)",
            borderRadius: 9999, padding: "6px 14px",
            fontSize: 12.5, fontWeight: 700,
            letterSpacing: "0.04em", cursor: "pointer",
          }}
        >Done</button>
      </div>

      {/* Transcript area (scrollable) */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 230, top: 60,
        overflowY: "auto", padding: "12px 18px 20px",
        overscrollBehavior: "contain",
        WebkitOverflowScrolling: "touch",
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        {turns.map((t, i) => (
          <VoiceBubble key={i} role={t.role} text={t.text} />
        ))}
        {partial && status === "listening" && (
          <VoiceBubble role="user-partial" text={partial} />
        )}
      </div>

      {/* Pulse circle centred above mic button */}
      <PulseCircle status={status} />

      {/* Status copy under pulse */}
      <p style={{
        position: "absolute", left: 0, right: 0, bottom: 150,
        textAlign: "center", color: C.cream,
        fontSize: 13, fontWeight: 600,
        letterSpacing: "0.04em",
      }}>{statusCopy}</p>

      {/* Mic toggle button */}
      <div style={{
        position: "absolute", left: 0, right: 0,
        bottom: "max(env(safe-area-inset-bottom), 30px)",
        display: "flex", justifyContent: "center", alignItems: "center",
        gap: 16,
      }}>
        <button
          type="button"
          aria-label={status === "listening" ? "Stop listening" : "Start listening"}
          onClick={() => {
            if (status === "listening") {
              stopListening();
              setStatus("idle");
            } else {
              startListening();
            }
          }}
          style={{
            width: 72, height: 72, borderRadius: 9999,
            background: status === "listening" ? C.blush : C.gold,
            color: C.espresso, border: "none", cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            boxShadow: status === "listening"
              ? "0 0 0 6px rgba(232,180,184,0.30), 0 8px 24px rgba(232,180,184,0.35)"
              : "0 0 0 6px rgba(212,175,55,0.18), 0 8px 24px rgba(212,175,55,0.28)",
            transition: "all 240ms ease",
          }}
        >{status === "listening" ? <MicOff size={28} /> : <Mic size={28} />}</button>
      </div>
    </div>
  );
}

// ── Sub: animated pulse circle ──
function PulseCircle({ status }) {
  const colour =
    status === "listening" ? C.blush :
    status === "thinking"  ? C.gold :
    status === "speaking"  ? C.sage :
                             "rgba(244,237,219,0.45)";
  const speed =
    status === "listening" ? "1.4s" :
    status === "thinking"  ? "2.8s" :
    status === "speaking"  ? "1.8s" :
                             "3.2s";
  return (
    <>
      <style>{`
        @keyframes jess-voice-pulse {
          0%   { transform: scale(0.92); opacity: 0.55; }
          50%  { transform: scale(1.04); opacity: 1.0;  }
          100% { transform: scale(0.92); opacity: 0.55; }
        }
        @keyframes jess-voice-pulse-outer {
          0%   { transform: scale(0.85); opacity: 0.0;  }
          50%  { transform: scale(1.20); opacity: 0.45; }
          100% { transform: scale(1.40); opacity: 0.0;  }
        }
      `}</style>
      <div style={{
        position: "absolute", left: "50%", bottom: 250,
        transform: "translateX(-50%)",
        width: 160, height: 160,
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }} aria-hidden>
        {/* Outer ring */}
        <span style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: `radial-gradient(circle, ${colour}33 0%, ${colour}00 70%)`,
          animation: `jess-voice-pulse-outer ${speed} ease-in-out infinite`,
        }} />
        {/* Inner solid */}
        <span style={{
          width: 90, height: 90, borderRadius: "50%",
          background: `radial-gradient(circle, ${colour} 0%, ${colour}88 100%)`,
          boxShadow: `0 0 30px ${colour}88, 0 0 60px ${colour}44`,
          animation: `jess-voice-pulse ${speed} ease-in-out infinite`,
        }} />
      </div>
    </>
  );
}

function VoiceBubble({ role, text }) {
  if (role === "chip") {
    return (
      <span style={{
        alignSelf: "flex-start",
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "5px 12px", borderRadius: 9999,
        background: "rgba(143,175,143,0.25)",
        color: "rgba(244,237,219,0.92)",
        border: "1px solid rgba(143,175,143,0.50)",
        fontSize: 12, fontWeight: 700,
        letterSpacing: "0.02em",
        maxWidth: "86%",
      }}>{text}</span>
    );
  }
  const isUser = role === "user" || role === "user-partial";
  return (
    <div style={{
      alignSelf: isUser ? "flex-end" : "flex-start",
      maxWidth: "86%",
      padding: "10px 14px",
      borderRadius: isUser ? "17px 17px 4px 17px" : "17px 17px 17px 4px",
      background: isUser
        ? "rgba(232,180,184,0.20)"
        : "rgba(244,237,219,0.10)",
      color: C.cream,
      fontSize: 14, lineHeight: 1.5,
      border: isUser
        ? "1px solid rgba(232,180,184,0.35)"
        : "1px solid rgba(244,237,219,0.18)",
      opacity: role === "user-partial" ? 0.7 : 1,
      fontStyle: role === "user-partial" ? "italic" : "normal",
    }}>{text}</div>
  );
}

// ── Styles ──
const shellStyle = {
  position: "fixed", inset: 0, zIndex: 300,
  background: C.espressoDeep,
  display: "flex", alignItems: "center", justifyContent: "center",
  };
const closeBtn = {
  position: "absolute", top: 14, right: 14,
  width: 36, height: 36, borderRadius: 9999,
  background: "rgba(244,237,219,0.12)", border: "1px solid rgba(244,237,219,0.22)",
  color: C.cream, cursor: "pointer",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  zIndex: 4,
};
