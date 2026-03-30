import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

const MILESTONES = {
  7:   { label: "7 days",  message: "A week of consistency. Well done."     },
  14:  { label: "2 weeks", message: "Two weeks of showing up for yourself."  },
  30:  { label: "30 days", message: "A full month. That's a real habit now." },
  60:  { label: "60 days", message: "Two months of daily care."              },
  100: { label: "100 days",message: "A hundred days. Quietly remarkable."   },
};

export default function StreakMilestoneToast({ streak, habitName, onDismiss }) {
  const milestone = MILESTONES[streak];
  const firedRef = useRef(false);

  useEffect(() => {
    if (!milestone || firedRef.current) return;
    firedRef.current = true;

    // Restrained single confetti burst
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.3 },
      colors: ["#C4849A", "#7A9E8E", "#C5BAC3", "#EAD7CC"],
      scalar: 0.85,
      gravity: 0.9,
    });

    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [streak]);

  if (!milestone) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[88vw] max-w-sm"
      style={{ animation: "fade-up 0.3s ease-out" }}>
      <div className="rounded-[20px] p-4 flex items-center gap-4"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--sage-light)",
          boxShadow: "var(--shadow-lg)",
        }}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "var(--sage-subtle)", color: "var(--sage)" }}>
          <span className="text-sm font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            {streak}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
            {milestone.label} — {habitName}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
            {milestone.message}
          </p>
        </div>
        <button onClick={onDismiss}
          className="text-xs flex-shrink-0"
          style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
          ✕
        </button>
      </div>
    </div>
  );
}