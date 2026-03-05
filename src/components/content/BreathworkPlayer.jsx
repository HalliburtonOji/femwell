import { useState, useEffect, useRef } from "react";

const PATTERNS = {
  "4-7-8": { inhale: 4, hold: 7, exhale: 8, label: "4-7-8 Calm" },
  "box": { inhale: 4, hold: 4, exhale: 4, hold2: 4, label: "Box Breathing" },
  "physiological_sigh": { inhale: 2, hold: 0, exhale: 6, label: "Physiological Sigh" },
};

const PHASE_TEXT = { inhale: "Breathe in", hold: "Hold", exhale: "Breathe out", hold2: "Hold" };
const PHASE_COLOR = { inhale: "#e8a4b0", hold: "#c97b8a", exhale: "#8fada0", hold2: "#c97b8a" };

function buildPhases(p) {
  const list = [];
  list.push({ name: "inhale", duration: p.inhale });
  if (p.hold) list.push({ name: "hold", duration: p.hold });
  list.push({ name: "exhale", duration: p.exhale });
  if (p.hold2) list.push({ name: "hold2", duration: p.hold2 });
  return list;
}

export default function BreathworkPlayer({ item }) {
  const pattern = PATTERNS[item?.breathwork_pattern] || PATTERNS["4-7-8"];
  const phases = buildPhases(pattern);

  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(phases[0].duration);
  const [cycles, setCycles] = useState(0);
  const timerRef = useRef(null);
  const speakRef = useRef(null);

  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.85;
    utt.pitch = 1;
    window.speechSynthesis.speak(utt);
  };

  useEffect(() => {
    if (!running) { if (timerRef.current) clearInterval(timerRef.current); return; }

    speak(PHASE_TEXT[phases[phaseIdx].name]);

    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          const next = (phaseIdx + 1) % phases.length;
          setPhaseIdx(next);
          if (next === 0) setCycles((c) => c + 1);
          setSecondsLeft(phases[next].duration);
          speak(PHASE_TEXT[phases[next].name]);
          return phases[next].duration;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [running, phaseIdx]);

  const currentPhase = phases[phaseIdx];
  const progress = 1 - secondsLeft / currentPhase.duration;
  const circleSize = 180;
  const r = 76;
  const circumference = 2 * Math.PI * r;
  const strokeDash = circumference * (1 - progress);

  const handleToggle = () => {
    if (running) {
      window.speechSynthesis?.cancel();
      setRunning(false);
      setPhaseIdx(0);
      setSecondsLeft(phases[0].duration);
    } else {
      setRunning(true);
    }
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 p-6 flex flex-col items-center space-y-5">
      <p className="text-sm font-medium text-gray-500">{pattern.label}</p>

      {/* Animated circle */}
      <div className="relative" style={{ width: circleSize, height: circleSize }}>
        <svg width={circleSize} height={circleSize} className="rotate-[-90deg]">
          <circle cx={circleSize / 2} cy={circleSize / 2} r={r} fill="none" stroke="#f5d6dc" strokeWidth={8} />
          <circle
            cx={circleSize / 2} cy={circleSize / 2} r={r}
            fill="none"
            stroke={PHASE_COLOR[currentPhase.name]}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDash}
            style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-base font-semibold text-gray-700">{running ? PHASE_TEXT[currentPhase.name] : "Ready"}</p>
          {running && <p className="text-3xl font-bold text-rose-600 mt-1">{secondsLeft}</p>}
        </div>
      </div>

      {cycles > 0 && <p className="text-xs text-gray-400">{cycles} cycle{cycles !== 1 ? "s" : ""} completed</p>}

      <button
        onClick={handleToggle}
        className={`px-8 py-3 rounded-full font-semibold text-sm transition-all shadow-md ${
          running
            ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
            : "bg-gradient-to-r from-rose-400 to-pink-500 text-white hover:shadow-lg"
        }`}
      >
        {running ? "Stop" : "Begin Breathwork"}
      </button>

      <p className="text-xs text-gray-400 text-center max-w-xs">
        Your device will guide you with voice cues. Find a comfortable position and close your eyes when ready.
      </p>
    </div>
  );
}