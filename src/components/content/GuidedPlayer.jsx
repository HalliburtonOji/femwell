import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Play, Volume2, Loader2, ChevronDown, RotateCcw } from "lucide-react";

const PHASE_TEXT = { inhale: "Inhale", hold: "Hold", exhale: "Exhale", hold2: "Hold" };
const PHASE_COLOR = { inhale: "#e8a4b0", hold: "#c97b8a", exhale: "#8fada0", hold2: "#c97b8a" };
const PHASE_BG = { inhale: "rgba(232,164,176,0.15)", hold: "rgba(201,123,138,0.15)", exhale: "rgba(143,173,160,0.15)", hold2: "rgba(201,123,138,0.15)" };

function buildPhases(cfg) {
  const phases = [];
  if (!cfg || !cfg.inhale) return [{ name: "inhale", duration: 4 }, { name: "exhale", duration: 6 }];
  phases.push({ name: "inhale", duration: cfg.inhale });
  if (cfg.hold || cfg.hold1) phases.push({ name: "hold", duration: cfg.hold || cfg.hold1 });
  phases.push({ name: "exhale", duration: cfg.exhale });
  if (cfg.hold2) phases.push({ name: "hold2", duration: cfg.hold2 });
  return phases;
}

function getScaleForPhase(phaseName, progress) {
  if (phaseName === "inhale") return 1 + progress * 0.22;
  if (phaseName === "exhale") return 1.22 - progress * 0.22;
  return 1.22; // hold phases stay expanded
}

function DemoVideo({ demoEmbedUrl }) {
  const [show, setShow] = useState(false);
  if (!demoEmbedUrl) return null;
  return (
    <div className="mt-4">
      <button
        onClick={() => setShow(!show)}
        className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        <ChevronDown className={`w-3 h-3 transition-transform ${show ? "rotate-180" : ""}`} />
        {show ? "Hide demo video" : "Watch demo video"}
      </button>
      {show && (
        <div className="mt-2 w-full aspect-video rounded-xl overflow-hidden bg-black">
          <iframe
            src={demoEmbedUrl}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Demo video"
          />
        </div>
      )}
    </div>
  );
}

export default function GuidedPlayer({ item }) {
  let cfg = {};
  try { cfg = item?.guided_config ? JSON.parse(item.guided_config) : {}; } catch {}
  const phases = buildPhases(cfg);
  const totalRounds = cfg.rounds || 6;

  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(phases[0].duration);
  const [cycles, setCycles] = useState(0);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [userName, setUserName] = useState(null);
  const [phaseTransition, setPhaseTransition] = useState(false);

  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const cueAudiosRef = useRef({});
  const phaseIdxRef = useRef(0);

  // Fetch user name on mount for personalized greeting
  useEffect(() => {
    base44.auth.me().then((u) => {
      if (u?.full_name) {
        const firstName = u.full_name.split(" ")[0];
        setUserName(firstName);
      }
    }).catch(() => {});
  }, []);

  const loadCueAudio = async (scriptKey) => {
    if (cueAudiosRef.current[scriptKey]) return cueAudiosRef.current[scriptKey];
    try {
      const res = await base44.functions.invoke("voiceTTS", {
        voice_script_key: scriptKey,
        content_key: item?.content_key || "",
      });
      const url = res.data?.audio_data_url;
      if (url) {
        cueAudiosRef.current[scriptKey] = url;
        return url;
      }
    } catch {}
    return null;
  };

  const loadDynamicAudio = async (text, profileKey) => {
    const cacheKey = `dynamic_${text.slice(0, 40)}`;
    if (cueAudiosRef.current[cacheKey]) return cueAudiosRef.current[cacheKey];
    try {
      const res = await base44.functions.invoke("voiceTTS", {
        dynamic_text: text,
        voice_profile_key: profileKey || "vp_calm_coach",
        content_key: item?.content_key || "",
      });
      const url = res.data?.audio_data_url;
      if (url) {
        cueAudiosRef.current[cacheKey] = url;
        return url;
      }
    } catch {}
    return null;
  };

  const playCue = async (scriptKey) => {
    const url = await loadCueAudio(scriptKey);
    if (!url) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch(() => {});
  };

  const playDynamic = async (text, profileKey) => {
    const url = await loadDynamicAudio(text, profileKey);
    if (!url) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch(() => {});
  };

  const getPhaseCueKey = (phaseName) => {
    if (phaseName === "inhale") return "cue_inhale";
    if (phaseName === "exhale") return "cue_exhale";
    if (phaseName === "hold" || phaseName === "hold2") return "cue_hold";
    return null;
  };

  // Build personalized greeting
  const buildGreeting = () => {
    const name = userName ? `, ${userName}` : "";
    const typeGreetings = {
      BREATHWORK: `Let's breathe together${name}. Find a comfortable position, close your eyes if you can, and follow my guidance.`,
      MEDITATION: `Welcome${name}. Take a moment to settle in. Let go of whatever you were just doing, and simply arrive here.`,
      WORKOUT: `Ready to move${name}? Let's warm up and get going. Follow along at your own pace.`,
      MOBILITY: `Time to open up${name}. Move slowly and gently — no rush, no force. Just ease in.`,
      GUIDE: `Hello${name}. Let's take this step by step. You can pause anytime you need.`,
    };
    return typeGreetings[item?.content_type] || `Let's begin${name}. Find a comfortable position and follow along.`;
  };

  const handleStart = async () => {
    if (running) {
      clearInterval(timerRef.current);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setRunning(false);
      setPhaseIdx(0);
      phaseIdxRef.current = 0;
      setSecondsLeft(phases[0].duration);
      setCycles(0);
      return;
    }

    setAudioLoading(true);
    setAudioError(null);

    const greetingText = buildGreeting();
    const profileKey = item?.voice_profile_key || "vp_calm_coach";

    // Pre-load all cues + greeting in parallel
    await Promise.all([
      loadDynamicAudio(greetingText, profileKey),
      loadCueAudio("cue_inhale"),
      loadCueAudio("cue_hold"),
      loadCueAudio("cue_exhale"),
      loadCueAudio("cue_finish"),
      item?.voice_script_key ? loadCueAudio(item.voice_script_key) : Promise.resolve(),
    ]);
    setAudioLoading(false);
    setRunning(true);

    // Play personalized greeting first, then the full script if available
    if (item?.voice_script_key) {
      playCue(item.voice_script_key);
    } else {
      playDynamic(greetingText, profileKey);
    }
  };

  useEffect(() => {
    if (!running) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          const nextIdx = (phaseIdxRef.current + 1) % phases.length;
          phaseIdxRef.current = nextIdx;
          setPhaseIdx(nextIdx);
          setPhaseTransition(true);
          setTimeout(() => setPhaseTransition(false), 400);
          if (nextIdx === 0) setCycles((c) => c + 1);
          const cueKey = getPhaseCueKey(phases[nextIdx].name);
          if (cueKey) playCue(cueKey);
          return phases[nextIdx].duration;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [running]);

  useEffect(() => {
    if (cycles >= totalRounds && running) {
      clearInterval(timerRef.current);
      setRunning(false);
      playCue("cue_finish");
    }
  }, [cycles]);

  const currentPhase = phases[phaseIdx];
  const progress = 1 - secondsLeft / currentPhase.duration;
  const circleSize = 220;
  const r = 88;
  const circumference = 2 * Math.PI * r;
  const strokeDash = circumference * (1 - progress);
  const done = cycles >= totalRounds;
  const scale = running ? getScaleForPhase(currentPhase.name, progress) : 1;
  const bgColor = running ? PHASE_BG[currentPhase.name] : "rgba(245,214,220,0.1)";
  const strokeColor = PHASE_COLOR[currentPhase.name] || "#e8a4b0";

  return (
    <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 p-6 flex flex-col items-center space-y-5 overflow-hidden relative">
      {/* Ambient background pulse */}
      {running && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${bgColor} 0%, transparent 70%)`,
            transition: "background 1.5s ease",
          }}
        />
      )}

      {/* Breathing orb + ring */}
      <div className="relative flex items-center justify-center" style={{ width: circleSize, height: circleSize }}>
        {/* Outer glow ring */}
        {running && (
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: circleSize * scale * 1.08,
              height: circleSize * scale * 1.08,
              background: `radial-gradient(ellipse, ${strokeColor}22 0%, transparent 70%)`,
              transition: "width 0.9s ease, height 0.9s ease",
            }}
          />
        )}

        {/* SVG progress ring */}
        <svg width={circleSize} height={circleSize} className="rotate-[-90deg] absolute inset-0">
          <circle cx={circleSize / 2} cy={circleSize / 2} r={r} fill="none" stroke="#f5d6dc" strokeWidth={6} />
          {running && (
            <circle
              cx={circleSize / 2} cy={circleSize / 2} r={r}
              fill="none"
              stroke={strokeColor}
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDash}
              style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.7s ease" }}
            />
          )}
        </svg>

        {/* Center orb — scales with breath */}
        <div
          className="absolute rounded-full"
          style={{
            width: 110,
            height: 110,
            background: running
              ? `radial-gradient(circle, ${strokeColor}55 0%, ${strokeColor}22 60%, transparent 100%)`
              : "radial-gradient(circle, rgba(232,164,176,0.3) 0%, transparent 70%)",
            transform: `scale(${scale})`,
            transition: "transform 0.9s ease, background 0.7s ease",
          }}
        />

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 z-10">
          {done ? (
            <p className="text-base font-semibold text-rose-500">Complete ✓</p>
          ) : running ? (
            <div
              key={currentPhase.name}
              style={{
                opacity: phaseTransition ? 0 : 1,
                transform: phaseTransition ? "scale(0.85)" : "scale(1)",
                transition: "opacity 0.35s ease, transform 0.35s ease",
              }}
              className="flex flex-col items-center gap-1"
            >
              <p className="text-sm font-semibold tracking-widest uppercase" style={{ color: strokeColor }}>
                {PHASE_TEXT[currentPhase.name]}
              </p>
              <p className="text-4xl font-bold text-gray-700">{secondsLeft}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center px-6 leading-relaxed">Tap below to begin</p>
          )}
        </div>
      </div>

      {/* Round counter */}
      {running && (
        <div className="flex gap-1.5 items-center">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-500"
              style={{
                width: i < cycles ? 8 : 6,
                height: i < cycles ? 8 : 6,
                background: i < cycles ? strokeColor : "#f5d6dc",
              }}
            />
          ))}
        </div>
      )}

      {audioError && <p className="text-xs text-amber-500">{audioError}</p>}

      <div className="flex gap-3 items-center">
        <button
          onClick={handleStart}
          disabled={audioLoading}
          className={`flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-sm transition-all shadow-md ${
            running
              ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
              : "bg-gradient-to-r from-rose-400 to-pink-500 text-white hover:shadow-lg hover:scale-105"
          } disabled:opacity-60`}
        >
          {audioLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Preparing...</>
          ) : running ? (
            "Stop"
          ) : done ? (
            <><RotateCcw className="w-4 h-4" /> Restart</>
          ) : (
            <><Volume2 className="w-4 h-4" /> Begin with Voice</>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center max-w-xs leading-relaxed">
        {userName
          ? `${userName}, find a comfortable position and close your eyes.`
          : "Find a comfortable position and close your eyes."}
      </p>

      <DemoVideo demoEmbedUrl={item?.demo_embed_url} />
    </div>
  );
}