import { useState, useRef, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Mic, MicOff, X, Loader2, Volume2, VolumeX, AlignLeft, WifiOff, RefreshCw } from "lucide-react";

// ── Pre-generated greetings (10) — no voice tokens spent on generation ──────
const GREETINGS = [
  "Hi, it's lovely to see you. How are you feeling today?",
  "Hello! I'm here whenever you're ready. What's on your mind?",
  "Hey there — so glad you dropped in. How can I support you today?",
  "Hi! Take a breath. I'm here. What would you like to talk about?",
  "Hello! It's good to connect with you. How's your day going so far?",
  "Hey, welcome back. What's on your heart today?",
  "Hi there. I'm here and listening — how are you doing?",
  "Hello! I've been looking forward to our chat. What's coming up for you?",
  "Hey! No rush at all — take your time. How are you feeling right now?",
  "Hi, I'm here for you. What would you like to explore together today?",
];

// ── Voice state machine ─────────────────────────────────────────────────────
const VS = {
  connecting:    { label: "Connecting…",           pulse: false, ring: false, color: "rgba(255,255,255,0.35)" },
  idle:          { label: "Tap to speak",           pulse: false, ring: false, color: "rgba(255,255,255,0.5)"  },
  listening:     { label: "Listening…",             pulse: true,  ring: true,  color: "white"                  },
  thinking:      { label: "Thinking…",              pulse: false, ring: true,  color: "rgba(255,255,255,0.6)"  },
  speaking:      { label: "Speaking…",              pulse: true,  ring: true,  color: "rgba(232,196,208,0.9)"  },
  paused:        { label: "Paused — tap to resume", pulse: false, ring: false, color: "rgba(255,255,255,0.4)"  },
  reconnecting:  { label: "Reconnecting…",          pulse: false, ring: false, color: "rgba(255,200,160,0.7)"  },
  unavailable:   { label: "Microphone unavailable", pulse: false, ring: false, color: "rgba(255,160,140,0.7)"  },
  ended:         { label: "Conversation ended",     pulse: false, ring: false, color: "rgba(255,255,255,0.3)"  },
};

// ── Orb ─────────────────────────────────────────────────────────────────────
function Orb({ voiceState, muted, onTap }) {
  const info = VS[voiceState] || VS.idle;
  const isActive = voiceState === "listening" || voiceState === "speaking";
  return (
    <button onClick={onTap} className="relative flex items-center justify-center w-36 h-36 rounded-full transition-all duration-300 active:scale-95" style={{ outline: "none" }}>
      {info.ring && (
        <>
          <div className="absolute inset-0 rounded-full animate-ping opacity-10"
            style={{ backgroundColor: "var(--rose-dust)", animationDuration: "2.4s" }} />
          <div className="absolute rounded-full animate-pulse opacity-15"
            style={{ inset: "-14px", backgroundColor: "var(--rose-dust)", animationDuration: "1.8s", animationDelay: "0.25s" }} />
        </>
      )}
      <div className="absolute inset-0 rounded-full transition-all duration-500"
        style={{
          background: isActive
            ? "radial-gradient(circle at 38% 32%, rgba(232,196,208,0.6) 0%, var(--rose-dust) 55%, #8A3858 100%)"
            : "radial-gradient(circle at 38% 32%, rgba(196,132,154,0.28) 0%, rgba(130,70,100,0.22) 60%, rgba(70,35,55,0.18) 100%)",
          boxShadow: info.ring ? "0 0 56px rgba(196,132,154,0.38), 0 0 112px rgba(196,132,154,0.1)" : "none",
          border: "1px solid rgba(196,132,154,0.22)",
        }} />
      <div className="relative z-10">
        {voiceState === "connecting" || voiceState === "reconnecting"
          ? <Loader2 className="w-8 h-8 animate-spin" style={{ color: "rgba(255,255,255,0.6)" }} />
          : muted
          ? <MicOff className="w-8 h-8" style={{ color: "rgba(255,255,255,0.35)" }} />
          : voiceState === "listening"
          ? <MicOff className="w-8 h-8" style={{ color: "white" }} />
          : <Mic className="w-8 h-8" style={{ color: info.color }} />
        }
      </div>
    </button>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function GuideVoiceMode({
  guideName,
  voiceId = "shimmer",
  instructions,
  onClose,
  onUserTranscript,
  onAssistantTranscript,
}) {
  const [voiceState, setVoiceState] = useState("connecting");
  const [muted, setMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [userTranscript, setUserTranscript] = useState("");
  const [assistantTranscript, setAssistantTranscript] = useState("");
  const [error, setError] = useState(null);

  const pcRef = useRef(null);
  const dcRef = useRef(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);
  const micSenderRef = useRef(null);
  const assistantBufRef = useRef("");
  const mutedRef = useRef(false);

  mutedRef.current = muted;

  // ── CONNECT ───────────────────────────────────────────────────────────────
  const connect = useCallback(async () => {
    setVoiceState("connecting");
    setError(null);
    assistantBufRef.current = "";

    try {
      // 1. Mint ephemeral session token
      const tokenRes = await base44.functions.invoke("guideVoiceSession", {
        instructions,
        voice: voiceId,
        turn_detection_mode: "server_vad",
      });
      const { client_secret, error: tokenErr } = tokenRes.data || {};
      if (tokenErr || !client_secret?.value) {
        setError(tokenErr || "Could not start voice session.");
        setVoiceState("unavailable");
        return;
      }
      const ephemeralKey = client_secret.value;

      // 2. Get microphone
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
      } catch {
        setError("Microphone access denied. Please allow microphone and try again.");
        setVoiceState("unavailable");
        return;
      }

      // 3. Create peer connection + audio output
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      if (audioRef.current) {
        audioRef.current.autoplay = true;
        pc.ontrack = (e) => {
          if (audioRef.current) audioRef.current.srcObject = e.streams[0];
        };
      }

      // 4. Add mic track
      const micTrack = stream.getTracks()[0];
      const sender = pc.addTrack(micTrack, stream);
      micSenderRef.current = sender;

      // 5. Data channel for events
      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;

      dc.onopen = () => {
        setVoiceState("idle");
        sendEvent({
          type: "session.update",
          session: { input_audio_transcription: { model: "whisper-1" } },
        });
        // Greet with a pre-generated greeting to save tokens
        const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
        sendEvent({
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "assistant",
            content: [{ type: "text", text: greeting }],
          },
        });
        sendEvent({ type: "response.create" });
      };

      dc.onmessage = handleEvent;

      dc.onclose = () => {
        if (voiceState !== "ended") setVoiceState("ended");
      };

      // 6. Create offer, exchange with OpenAI
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpRes = await fetch(
        "https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ephemeralKey}`,
            "Content-Type": "application/sdp",
          },
          body: offer.sdp,
        }
      );

      if (!sdpRes.ok) {
        setError("Could not connect to voice service. Please try again.");
        setVoiceState("unavailable");
        cleanup();
        return;
      }

      const answerSdp = await sdpRes.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

    } catch (err) {
      setError("Failed to start voice. Please try again.");
      setVoiceState("unavailable");
      cleanup();
    }
  }, [instructions, voiceId]);

  // ── EVENT HANDLER ─────────────────────────────────────────────────────────
  const handleEvent = useCallback((ev) => {
    let msg;
    try { msg = JSON.parse(ev.data); } catch { return; }

    const { type } = msg;

    if (type === "input_audio_buffer.speech_started") {
      setVoiceState("listening");
      setUserTranscript("");
    }

    if (type === "input_audio_buffer.speech_stopped") {
      setVoiceState("thinking");
    }

    if (type === "conversation.item.input_audio_transcription.completed") {
      const text = msg.transcript?.trim();
      if (text) {
        setUserTranscript(text);
        onUserTranscript?.(text);
      }
    }

    if (type === "response.created") {
      setVoiceState("speaking");
      assistantBufRef.current = "";
      setAssistantTranscript("");
    }

    if (type === "response.audio_transcript.delta") {
      assistantBufRef.current += msg.delta || "";
      setAssistantTranscript(assistantBufRef.current);
      onAssistantTranscript?.(assistantBufRef.current, false);
    }

    if (type === "response.audio_transcript.done") {
      const finalText = msg.transcript || assistantBufRef.current;
      setAssistantTranscript(finalText);
      onAssistantTranscript?.(finalText, true);
      setVoiceState("idle");
    }

    if (type === "response.done") {
      setVoiceState("idle");
    }

    if (type === "error") {
      console.error("Realtime error:", msg.error);
      if (msg.error?.code === "session_expired") {
        setVoiceState("reconnecting");
        setTimeout(connect, 1500);
      } else {
        setVoiceState("paused");
      }
    }
  }, [onUserTranscript, onAssistantTranscript, connect]);

  // ── SEND EVENT ────────────────────────────────────────────────────────────
  const sendEvent = (obj) => {
    try {
      if (dcRef.current?.readyState === "open") {
        dcRef.current.send(JSON.stringify(obj));
      }
    } catch {}
  };

  // ── CLEANUP ───────────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    dcRef.current?.close();
    pcRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    pcRef.current = null;
    dcRef.current = null;
    streamRef.current = null;
  }, []);

  // ── LIFECYCLE ─────────────────────────────────────────────────────────────
  useEffect(() => {
    connect();
    return cleanup;
  }, []);

  // ── CONTROLS ──────────────────────────────────────────────────────────────
  const handleOrbTap = () => {
    if (voiceState === "paused" || voiceState === "unavailable") {
      connect();
    } else if (voiceState === "listening") {
      // commit audio early
      sendEvent({ type: "input_audio_buffer.commit" });
      setVoiceState("thinking");
    }
    // Otherwise orb tap is informational — server VAD handles the rest
  };

  const handleMute = () => {
    const next = !muted;
    setMuted(next);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => { t.enabled = !next; });
    }
    if (audioRef.current) {
      audioRef.current.muted = next;
    }
  };

  const handleEnd = () => {
    setVoiceState("ended");
    cleanup();
    onClose();
  };

  const stateInfo = VS[voiceState] || VS.idle;

  return (
    <div className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "linear-gradient(160deg, #1E1528 0%, #14101C 55%, #0C0A12 100%)" }}>
      <audio ref={audioRef} />

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-12 pb-4">
        <button onClick={handleEnd}
          className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-75"
          style={{ color: "rgba(255,255,255,0.45)", }}>
          <ArrowLeft className="w-4 h-4" />
          Back to chat
        </button>
        <div className="text-center">
          <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", }}>
            {guideName}
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Live Voice
          </p>
        </div>
        <button onClick={handleEnd}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-75"
          style={{ backgroundColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.45)" }}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Central area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
        <Orb voiceState={voiceState} muted={muted} onTap={handleOrbTap} />

        {/* State label */}
        <p className="text-sm font-medium text-center transition-all duration-300"
          style={{ color: stateInfo.color, letterSpacing: "0.01em" }}>
          {stateInfo.label}
        </p>

        {/* Error notice */}
        {error && (
          <div className="w-full max-w-xs rounded-2xl px-4 py-3 text-center"
            style={{ backgroundColor: "rgba(255,140,120,0.1)", border: "1px solid rgba(255,140,120,0.2)" }}>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(255,180,160,0.85)", }}>
              {error}
            </p>
            <button onClick={connect}
              className="mt-2 flex items-center gap-1.5 mx-auto text-xs font-medium"
              style={{ color: "rgba(255,180,160,0.7)" }}>
              <RefreshCw className="w-3 h-3" /> Try again
            </button>
          </div>
        )}

        {/* Transcript */}
        {showTranscript && (userTranscript || assistantTranscript) && (
          <div className="w-full max-w-sm rounded-2xl px-5 py-4 space-y-3"
            style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {userTranscript && (
              <div>
                <p className="text-[10px] mb-1 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)", }}>You</p>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)", }}>{userTranscript}</p>
              </div>
            )}
            {assistantTranscript && (
              <div>
                <p className="text-[10px] mb-1 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)", }}>{guideName}</p>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)", }}>
                  {assistantTranscript.slice(0, 280)}{assistantTranscript.length > 280 ? "…" : ""}
                </p>
              </div>
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
            backgroundColor: muted ? "rgba(196,132,154,0.18)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${muted ? "rgba(196,132,154,0.35)" : "rgba(255,255,255,0.08)"}`,
            color: muted ? "var(--rose-dust)" : "rgba(255,255,255,0.45)",
          }}>
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        {/* End */}
        <button onClick={handleEnd}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
          style={{ backgroundColor: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.65)" }}>
          <X className="w-5 h-5" />
        </button>

        {/* Transcript toggle */}
        <button onClick={() => setShowTranscript(v => !v)}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
          style={{
            backgroundColor: showTranscript ? "rgba(196,132,154,0.18)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${showTranscript ? "rgba(196,132,154,0.35)" : "rgba(255,255,255,0.08)"}`,
            color: showTranscript ? "var(--rose-dust)" : "rgba(255,255,255,0.45)",
          }}>
          <AlignLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}