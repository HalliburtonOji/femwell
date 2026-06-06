import { useState, useEffect, useRef, useCallback } from "react";
// eslint-disable-next-line no-unused-vars
import { base44 } from "@/api/base44Client";
import { Play, Pause, RotateCcw, Plus, ChevronDown, ChevronUp } from "lucide-react";
import SessionReviewModal from "./SessionReviewModal";

const COACH_PROMPTS = [
  "Soft jaw.", "Shoulders down.", "Gentle breath.",
  "Longer exhale.", "Let go.", "Relax your hands.",
  "Breathe slowly.", "Stay present.", "Eyes soft.",
];

function BreathRing({ accent, playing, phase, secondsLeft }) {
  // Scale: inhale = expand (1→1.4), hold = stay, exhale = contract (1.4→1)
  const getScale = () => {
    if (!playing) return 1;
    if (phase === 'Inhale') return 1.4;
    if (phase === 'Exhale') return 1;
    return 1.2; // Hold phases maintain mid-size
  };

  const scale = getScale();
  const transitionDuration = phase === 'Inhale' || phase === 'Exhale' ? `${secondsLeft || 4}s` : '0.3s';

  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Outer halo */}
      <div
        className="absolute inset-0 rounded-full transition-transform"
        style={{
          background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
          transform: `scale(${scale * 1.1})`,
          transition: `transform ${transitionDuration} ease-in-out`,
        }}
      />
      {/* Main ring */}
      <div
        className="w-52 h-52 rounded-full border-2 flex items-center justify-center transition-transform"
        style={{
          borderColor: `${accent}88`,
          boxShadow: `0 0 40px ${accent}44, inset 0 0 30px ${accent}22`,
          transform: `scale(${scale})`,
          transition: `transform ${transitionDuration} ease-in-out`,
        }}
      >
        {/* Inner glow */}
        <div
          className="w-36 h-36 rounded-full transition-transform"
          style={{
            background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)`,
            transform: `scale(${scale * 0.85})`,
            transition: `transform ${transitionDuration} ease-in-out`,
          }}
        />
      </div>
    </div>
  );
}

function BreathWaves({ accent, playing, phase, secondsLeft }) {
  return (
    <div className="w-64 h-64 flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 200 100" className="w-full" style={{ animation: playing ? "none" : "none" }}>
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d="M0,50 Q25,20 50,50 T100,50 T150,50 T200,50"
            fill="none"
            stroke={accent}
            strokeWidth={2 - i * 0.5}
            opacity={0.6 - i * 0.15}
            style={{
              animation: playing
                ? `wave ${6 + i * 1.5}s ease-in-out infinite ${i * 0.5}s`
                : "none",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

function BreathGlow({ accent, playing, phase, secondsLeft }) {
  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      <div
        className="w-40 h-40 rounded-full"
        style={{
          background: `radial-gradient(circle, ${accent}88 0%, ${accent}22 50%, transparent 70%)`,
          filter: "blur(8px)",
          animation: playing ? "breathPulse 6s ease-in-out infinite" : "none",
        }}
      />
      <div
        className="absolute w-20 h-20 rounded-full"
        style={{
          background: `radial-gradient(circle, ${accent}cc 0%, ${accent}55 70%)`,
          filter: "blur(4px)",
          animation: playing ? "breathPulse 6s ease-in-out infinite 0.5s" : "none",
        }}
      />
    </div>
  );
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function BreathworkLoopPlayer({ item, user }) {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [targetSeconds, setTargetSeconds] = useState(item.target_seconds || 300);
  const [done, setDone] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [coachText, setCoachText] = useState("");
  const [coachVisible, setCoachVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const audioRef = useRef(null);
  const elapsedRef = useRef(0);
  const loopIndexRef = useRef(0); // cycles through LOOP1/LOOP2/LOOP3
  const segmentsRef = useRef([]);
  const playingRef = useRef(false);
  const coachTimerRef = useRef(null);
  const coachPromptIndexRef = useRef(0);
  const elapsedIntervalRef = useRef(null);

  const accent = item.accent_color || "#EAD7FF";
  const playerStyle = item.player_style || "BREATH_RING";

  // Parse breath pattern from content_key
  const BREATH_PATTERNS = {
    '4-7-8-breathing':           { inhale: 4, hold: 7, exhale: 8 },
    'box-breathing':             { inhale: 4, hold: 4, exhale: 4, hold2: 4 },
    'coherent-breathing':        { inhale: 5, exhale: 5 },
    'downshift-breathing':       { inhale: 4, hold: 2, exhale: 6 },
    'alternate-nostril-breathing': { inhale: 4, exhale: 4 },
    '3-minute-breathing-space':  { inhale: 3, exhale: 3 },
    'energising-breath':         { inhale: 2, exhale: 2 },
  };
  const patternCfg = BREATH_PATTERNS[item.content_key] || { inhale: 4, hold: 4, exhale: 4 };
  const breathPhases = [
    { name: 'Inhale', duration: patternCfg.inhale },
    ...(patternCfg.hold ? [{ name: 'Hold', duration: patternCfg.hold }] : []),
    { name: 'Exhale', duration: patternCfg.exhale },
    ...(patternCfg.hold2 ? [{ name: 'Hold', duration: patternCfg.hold2 }] : []),
  ];
  const [breathPhaseIdx, setBreathPhaseIdx] = useState(0);
  const [breathSecondsLeft, setBreathSecondsLeft] = useState(breathPhases[0].duration);
  const [breathRound, setBreathRound] = useState(1);
  const breathPhaseIdxRef = useRef(0);
  const breathTimerRef = useRef(null);
  const breathRoundRef = useRef(1);

  const cycleDuration = breathPhases.reduce((sum, p) => sum + p.duration, 0);
  const totalRounds = Math.max(1, Math.ceil(targetSeconds / cycleDuration));

  useEffect(() => {
    base44.entities.AudioSegments.filter({ content_key: item.content_key, is_active: true })
      .then((segs) => {
        const sorted = segs.sort((a, b) => a.sort_order - b.sort_order);
        setSegments(sorted);
        segmentsRef.current = sorted;
      })
      .finally(() => setLoading(false));
  }, [item.content_key]);

  const stopCoachTimer = () => {
    if (coachTimerRef.current) clearInterval(coachTimerRef.current);
  };

  const startCoachTimer = () => {
    stopCoachTimer();
    const interval = 30000 + Math.random() * 15000;
    coachTimerRef.current = setInterval(() => {
      const prompts = COACH_PROMPTS;
      const idx = coachPromptIndexRef.current % prompts.length;
      setCoachText(prompts[idx]);
      setCoachVisible(true);
      coachPromptIndexRef.current += 1;
      setTimeout(() => setCoachVisible(false), 3000);
    }, interval);
  };

  const stopElapsedTimer = () => {
    if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
  };

  const startElapsedTimer = () => {
    stopElapsedTimer();
    elapsedIntervalRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
      if (elapsedRef.current >= targetSeconds) {
        handleDone();
      }
    }, 1000);
  };

  const handleDone = useCallback(() => {
    playingRef.current = false;
    setPlaying(false);
    setDone(true);
    setShowConfetti(true);
    stopElapsedTimer();
    stopCoachTimer();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    // Save to ContentHistory
    if (user) {
      base44.entities.ContentHistory.create({
        user_id: user.id,
        content_id: item.id,
        completed_at: new Date().toISOString(),
        duration_done: Math.round(elapsedRef.current / 60),
      }).catch(() => {});
    }
    setTimeout(() => setShowConfetti(false), 4000);
    setTimeout(() => setShowReview(true), 1500);
  }, [user, item]);

  const playNextSegment = useCallback(() => {
    if (!playingRef.current) return;
    const segs = segmentsRef.current;
    const main = segs.find((s) => s.segment_role === "MAIN");
    const loops = segs.filter((s) => s.segment_role !== "MAIN").sort((a, b) => a.sort_order - b.sort_order);

    let url;
    // If elapsed is 0 and main exists, play main first
    if (elapsedRef.current === 0 && main) {
      url = main.audio_url;
    } else if (loops.length > 0) {
      const idx = loopIndexRef.current % loops.length;
      url = loops[idx].audio_url;
      loopIndexRef.current += 1;
    } else if (main) {
      url = main.audio_url;
    } else {
      return;
    }

    const audio = audioRef.current;
    audio.src = url;
    audio.play().catch(() => {});
  }, []);

  // Breath phase timer — runs in sync with the audio player
  useEffect(() => {
    if (!playing) {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
      return;
    }
    breathTimerRef.current = setInterval(() => {
      setBreathSecondsLeft(s => {
        if (s <= 1) {
          const nextIdx = (breathPhaseIdxRef.current + 1) % breathPhases.length;
          breathPhaseIdxRef.current = nextIdx;
          setBreathPhaseIdx(nextIdx);
          // Advance round counter when wrapping
          if (nextIdx === 0) {
            breathRoundRef.current += 1;
            setBreathRound(breathRoundRef.current);
          }
          return breathPhases[nextIdx].duration;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(breathTimerRef.current);
  }, [playing]);

  const handleStart = () => {
    if (done) return;
    playingRef.current = true;
    setPlaying(true);
    // If we haven't started yet, play from main
    playNextSegment();
    startElapsedTimer();
    startCoachTimer();
    // Reset breath phases
    breathPhaseIdxRef.current = 0;
    setBreathPhaseIdx(0);
    setBreathSecondsLeft(breathPhases[0].duration);
  };

  const handlePause = () => {
    playingRef.current = false;
    setPlaying(false);
    if (audioRef.current) audioRef.current.pause();
    stopElapsedTimer();
    stopCoachTimer();
  };

  const handleResume = () => {
    playingRef.current = true;
    setPlaying(true);
    if (audioRef.current) audioRef.current.play().catch(() => {});
    startElapsedTimer();
    startCoachTimer();
  };

  const handleRestart = () => {
    playingRef.current = false;
    setPlaying(false);
    setDone(false);
    elapsedRef.current = 0;
    setElapsed(0);
    loopIndexRef.current = 0;
    breathRoundRef.current = 1;
    setBreathRound(1);
    breathPhaseIdxRef.current = 0;
    setBreathPhaseIdx(0);
    setBreathSecondsLeft(breathPhases[0].duration);
    setTargetSeconds(item.target_seconds || 300);
    stopElapsedTimer();
    stopCoachTimer();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
  };

  const handleExtend = () => {
    setTargetSeconds((t) => t + 120);
    if (done) {
      setDone(false);
      handleStart();
    }
  };

  const onAudioEnded = useCallback(() => {
    if (!playingRef.current) return;
    // Check if we've hit target
    if (elapsedRef.current >= targetSeconds) {
      handleDone();
      return;
    }
    // Play next loop
    const segs = segmentsRef.current;
    const loops = segs.filter((s) => s.segment_role !== "MAIN").sort((a, b) => a.sort_order - b.sort_order);
    if (loops.length === 0) return;
    const idx = loopIndexRef.current % loops.length;
    loopIndexRef.current += 1;
    const audio = audioRef.current;
    audio.src = loops[idx].audio_url;
    audio.play().catch(() => {});
  }, [targetSeconds, handleDone]);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.addEventListener("ended", onAudioEnded);
    return () => {
      audio.removeEventListener("ended", onAudioEnded);
      audio.pause();
      stopElapsedTimer();
      stopCoachTimer();
    };
  }, []);

  // Keep onAudioEnded up to date when targetSeconds changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.removeEventListener("ended", onAudioEnded);
    audio.addEventListener("ended", onAudioEnded);
  }, [onAudioEnded]);

  const remaining = Math.max(0, targetSeconds - elapsed);
  const progress = Math.min(1, elapsed / targetSeconds);

  const AnimComp = playerStyle === "BREATH_WAVES" ? BreathWaves
    : playerStyle === "BREATH_GLOW" ? BreathGlow
    : BreathRing;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full animate-spin" style={{ border: "4px solid var(--mauve-light)", borderTopColor: "var(--mauve)" }} />
    </div>
  );

  if (segments.length === 0) return (
    <div className="text-center py-12 text-sm" style={{ color: "var(--mauve)" }}>No audio segments configured for this session.</div>
  );

  return (
    <>
      {showReview && user && (
        <SessionReviewModal item={item} user={user} onClose={() => setShowReview(false)} />
      )}
      <style>{`
        @keyframes breathPulse {
          0%, 100% { transform: scale(0.92); opacity: 0.8; }
          50% { transform: scale(1.06); opacity: 1; }
        }
        @keyframes breathHalo {
          0%, 100% { transform: scale(0.85); opacity: 0.3; }
          50% { transform: scale(1.15); opacity: 0.7; }
        }
        @keyframes wave {
          0%, 100% { d: path("M0,50 Q25,20 50,50 T100,50 T150,50 T200,50"); }
          50% { d: path("M0,50 Q25,80 50,50 T100,50 T150,50 T200,50"); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(120px) rotate(360deg); opacity: 0; }
        }
        @keyframes coachFade {
          0% { opacity: 0; transform: translateY(4px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>

      <div
        className="relative rounded-3xl overflow-hidden p-6 flex flex-col items-center gap-5"
        style={{
          background: "linear-gradient(145deg, #1a0a2e 0%, #12001f 40%, #0d1a2e 100%)",
          boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)`,
          minHeight: 480,
        }}
      >
        {/* Confetti */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: "-8px",
                  background: [accent, "#fff", "#f0abfc", "#c4b5fd"][i % 4],
                  animation: `confettiFall ${1.5 + Math.random()}s ease-in ${Math.random() * 1}s forwards`,
                }}
              />
            ))}
          </div>
        )}

        {/* Pattern label */}
        {item.breath_pattern_label && (
          <p className="text-xs font-medium tracking-widest uppercase" style={{ color: `${accent}aa` }}>
            {item.breath_pattern_label}
          </p>
        )}

        {/* Animation */}
        <AnimComp accent={accent} playing={playing} phase={breathPhases[breathPhaseIdx]?.name} secondsLeft={breathSecondsLeft} />

        {/* Breath phase label — shown when playing */}
        {playing && !done && (
          <div className="flex flex-col items-center gap-1 -mt-2">
            <p className="text-sm font-semibold tracking-widest uppercase" style={{ color: `${accent}dd`, transition: "color 0.5s" }}>
              {breathPhases[breathPhaseIdx].name}
            </p>
            <p className="text-3xl font-bold tabular-nums" style={{ color: "white" }}>
              {breathSecondsLeft}
            </p>
            <div className="flex gap-1.5 mt-1">
              {breathPhases.map((ph, i) => (
                <div key={i} className="rounded-full transition-all" style={{
                  width: i === breathPhaseIdx ? 20 : 6,
                  height: 6,
                  backgroundColor: i === breathPhaseIdx ? accent : `${accent}44`,
                  transition: "all 0.3s ease",
                }} />
              ))}
            </div>
            <p className="text-xs mt-1" style={{ color: `${accent}88`, }}>
              Round {breathRound} of {totalRounds}
            </p>
          </div>
        )}

        {/* Coach prompt */}
        <div className="h-5 flex items-center">
          {coachVisible && (
            <p
              className="text-sm font-light tracking-wide"
              style={{ color: `${accent}cc`, animation: "coachFade 3s ease-in-out forwards" }}
            >
              {coachText}
            </p>
          )}
        </div>

        {/* Progress ring / bar */}
        <div className="w-full">
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${progress * 100}%`, background: accent }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs" style={{ color: `${accent}88` }}>
            <span>{formatTime(elapsed)}</span>
            <span>{done ? "Complete ✓" : `${formatTime(remaining)} left`}</span>
          </div>
        </div>

        {/* Controls */}
        {done ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-white font-semibold text-lg">Session Complete 🌸</p>
            <div className="flex gap-3">
              <button onClick={handleRestart} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "white" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}>
                <RotateCcw className="w-4 h-4" /> Restart
              </button>
              <button onClick={handleExtend} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity" style={{ background: accent, color: "#1a0a2e" }}>
                <Plus className="w-4 h-4" /> +2 min
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <button onClick={handleRestart} className="w-10 h-10 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}>
              <RotateCcw className="w-4 h-4" style={{ color: "rgba(255,255,255,0.6)" }} />
            </button>

            {!playing ? (
              <button
                onClick={elapsed === 0 ? handleStart : handleResume}
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                style={{ background: accent }}
              >
                <Play className="w-6 h-6 ml-1" style={{ color: "#1a0a2e" }} />
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                style={{ background: accent }}
              >
                <Pause className="w-6 h-6" style={{ color: "#1a0a2e" }} />
              </button>
            )}

            <button
              onClick={handleExtend}
              className="flex items-center gap-1 px-3 py-2 rounded-full text-xs transition-colors"
              style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
            >
              <Plus className="w-3 h-3" /> 2 min
            </button>
          </div>
        )}

        {/* Safety note accordion */}
        {item.breath_safety_note && (
          <div className="w-full mt-1">
            <button
              onClick={() => setSafetyOpen((o) => !o)}
              className="flex items-center justify-between w-full text-xs py-2 border-t border-white/10"
              style={{ color: `${accent}88` }}
            >
              <span>Safety note</span>
              {safetyOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {safetyOpen && (
              <p className="text-xs leading-relaxed mt-1 pb-1" style={{ color: `${accent}77` }}>
                {item.breath_safety_note}
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}