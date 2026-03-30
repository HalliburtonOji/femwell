import { useState, useRef, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Mic, MicOff, X, Loader2, Volume2, VolumeX, AlignLeft } from "lucide-react";

// ── Voice states ────────────────────────────────────────────────────────────
const STATES = {
  idle:          { label: "Tap the orb to speak",        pulse: false, ring: false  },
  listening:     { label: "Listening…",                  pulse: true,  ring: true   },
  thinking:      { label: "Thinking…",                   pulse: false, ring: true   },
  speaking:      { label: "Speaking…",                   pulse: true,  ring: true   },
  paused:        { label: "Paused",                      pulse: false, ring: false  },
  unavailable:   { label: "Microphone unavailable",      pulse: false, ring: false  },
};

function Orb({ state, onTap, muted }) {
  const info = STATES[state] || STATES.idle;
  const isListening = state === "listening";
  const isThinking = state === "thinking";

  return (
    <button
      onClick={onTap}
      className="relative flex items-center justify-center w-36 h-36 rounded-full transition-all duration-300 active:scale-95"
      style={{ outline: "none" }}>
      {/* Outermost ambient ring */}
      {info.ring && (
        <div className="absolute inset-0 rounded-full animate-ping opacity-10"
          style={{ backgroundColor: "var(--rose-dust)", animationDuration: "2.2s" }} />
      )}
      {/* Middle ring */}
      {info.ring && (
        <div className="absolute rounded-full animate-pulse opacity-20"
          style={{ inset: "-12px", backgroundColor: "var(--rose-dust)", animationDuration: "1.6s", animationDelay: "0.2s" }} />
      )}
      {/* Orb surface */}
      <div className="absolute inset-0 rounded-full"
        style={{
          background: info.pulse
            ? "radial-gradient(circle at 40% 35%, rgba(232,196,208,0.55) 0%, var(--rose-dust) 55%, #904060 100%)"
            : "radial-gradient(circle at 40% 35%, rgba(196,132,154,0.35) 0%, rgba(140,80,110,0.3) 60%, rgba(80,40,60,0.25) 100%)",
          boxShadow: info.ring ? "0 0 50px rgba(196,132,154,0.35), 0 0 100px rgba(196,132,154,0.12)" : "none",
          border: "1px solid rgba(196,132,154,0.25)",
          transition: "all 0.4s ease",
        }} />
      {/* Inner icon */}
      <div className="relative z-10">
        {isThinking ? (
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "rgba(255,255,255,0.75)" }} />
        ) : muted ? (
          <MicOff className="w-8 h-8" style={{ color: "rgba(255,255,255,0.4)" }} />
        ) : isListening ? (
          <MicOff className="w-8 h-8" style={{ color: "white" }} />
        ) : (
          <Mic className="w-8 h-8" style={{ color: "rgba(255,255,255,0.75)" }} />
        )}
      </div>
    </button>
  );
}

export default function GuideVoiceMode({ guideName, onClose, onSendText, lastAssistantText, loading }) {
  const [orbState, setOrbState] = useState("idle");
  const [muted, setMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);
  const audioRef = useRef(null);

  // Update orb when parent loading state changes
  useEffect(() => {
    if (loading) setOrbState("thinking");
    else if (orbState === "thinking") setOrbState("idle");
  }, [loading]);

  // Speak assistant text via ElevenLabs when it arrives
  useEffect(() => {
    if (!lastAssistantText || loading || muted) return;
    speakText(lastAssistantText);
  }, [lastAssistantText]);

  const speakText = async (text) => {
    const stripped = text.replace(/[#*_`]/g, "").slice(0, 400);
    setOrbState("speaking");
    setIsSpeaking(true);
    try {
      const res = await base44.functions.invoke("guideActions", { action: "tts", payload: { text: stripped } });
      if (res.data?.audio_base64) {
        const binary = atob(res.data.audio_base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = url;
          audioRef.current.onended = () => { setOrbState("idle"); setIsSpeaking(false); URL.revokeObjectURL(url); };
          audioRef.current.play();
        }
        return;
      }
    } catch {}
    // Fallback to browser TTS
    if ("speechSynthesis" in window) {
      const utt = new SpeechSynthesisUtterance(stripped);
      utt.rate = 0.92;
      utt.pitch = 1.0;
      utt.onend = () => { setOrbState("idle"); setIsSpeaking(false); };
      window.speechSynthesis.speak(utt);
    } else {
      setTimeout(() => { setOrbState("idle"); setIsSpeaking(false); }, 1500);
    }
  };

  const startListening = useCallback(() => {
    if (muted) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setOrbState("unavailable"); return; }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-GB";
    let finalText = "";
    rec.onstart = () => { setOrbState("listening"); listeningRef.current = true; setTranscript(""); };
    rec.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join("");
      setTranscript(t);
      if (e.results[0]?.isFinal) { finalText = t; }
    };
    rec.onend = () => {
      listeningRef.current = false;
      if (finalText.trim()) {
        setOrbState("thinking");
        onSendText(finalText.trim());
        setTranscript("");
      } else {
        setOrbState("idle");
      }
    };
    rec.onerror = () => { setOrbState("paused"); listeningRef.current = false; };
    recognitionRef.current = rec;
    rec.start();
  }, [muted, onSendText]);

  const stopListening = () => {
    recognitionRef.current?.stop();
    listeningRef.current = false;
    setOrbState("idle");
  };

  const handleOrbTap = () => {
    if (orbState === "listening") stopListening();
    else if (orbState === "speaking") {
      audioRef.current?.pause();
      window.speechSynthesis?.cancel();
      setOrbState("idle");
      setIsSpeaking(false);
    } else if (orbState === "idle" || orbState === "paused") {
      startListening();
    }
  };

  const handleMute = () => {
    if (!muted && orbState === "speaking") {
      audioRef.current?.pause();
      window.speechSynthesis?.cancel();
      setOrbState("idle");
      setIsSpeaking(false);
    }
    setMuted(v => !v);
  };

  const stateInfo = STATES[orbState] || STATES.idle;

  return (
    <div className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "linear-gradient(160deg, #1E1528 0%, #16101E 55%, #0D0B12 100%)" }}>
      <audio ref={audioRef} />

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-12 pb-4">
        <button onClick={onClose}
          className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80"
          style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif" }}>
          <ArrowLeft className="w-4 h-4" />
          Back to chat
        </button>
        <div className="flex flex-col items-center">
          <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>
            {guideName}
          </p>
        </div>
        <button onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
          style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Central orb area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-10 px-6">
        <Orb state={orbState} onTap={handleOrbTap} muted={muted} />

        {/* State label */}
        <p className="text-sm font-medium text-center transition-all duration-300"
          style={{ color: orbState === "unavailable" ? "rgba(255,180,160,0.8)" : "rgba(255,255,255,0.55)", fontFamily: "'Inter', sans-serif", letterSpacing: "0.01em" }}>
          {stateInfo.label}
        </p>

        {/* Transcript / last text */}
        {showTranscript && (transcript || lastAssistantText) && (
          <div className="w-full max-w-sm rounded-2xl px-5 py-4 transition-all"
            style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {transcript && (
              <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif" }}>You said</p>
            )}
            {transcript && (
              <p className="text-sm leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "'Inter', sans-serif" }}>
                {transcript}
              </p>
            )}
            {lastAssistantText && !transcript && (
              <>
                <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif" }}>{guideName} said</p>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.72)", fontFamily: "'Inter', sans-serif" }}>
                  {lastAssistantText.replace(/[#*_`]/g, "").slice(0, 200)}{lastAssistantText.length > 200 ? "…" : ""}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-center gap-5 px-6 pb-14">
        {/* Mute */}
        <button onClick={handleMute}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
          style={{
            backgroundColor: muted ? "rgba(196,132,154,0.2)" : "rgba(255,255,255,0.07)",
            border: `1px solid ${muted ? "rgba(196,132,154,0.4)" : "rgba(255,255,255,0.1)"}`,
            color: muted ? "var(--rose-dust)" : "rgba(255,255,255,0.5)",
          }}>
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        {/* End */}
        <button onClick={onClose}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
          style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>
          <X className="w-5 h-5" />
        </button>

        {/* Transcript toggle */}
        <button onClick={() => setShowTranscript(v => !v)}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
          style={{
            backgroundColor: showTranscript ? "rgba(196,132,154,0.2)" : "rgba(255,255,255,0.07)",
            border: `1px solid ${showTranscript ? "rgba(196,132,154,0.4)" : "rgba(255,255,255,0.1)"}`,
            color: showTranscript ? "var(--rose-dust)" : "rgba(255,255,255,0.5)",
          }}>
          <AlignLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}