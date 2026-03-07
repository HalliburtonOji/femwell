import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

const MILESTONES = {
  7: { title: "7-Day Streak! 🔥", message: "You've built a real habit. Keep it going!" },
  14: { title: "2 Weeks Strong! 🌟", message: "Two whole weeks of consistency. Amazing!" },
  30: { title: "30-Day Champion! 🏆", message: "A full month! You're unstoppable." },
  60: { title: "60 Days! 💎", message: "Diamond-level dedication. Incredible!" },
  100: { title: "100-Day Legend! 🚀", message: "You've mastered this habit!" },
};

export default function StreakMilestoneToast({ streak, habitName, onDismiss }) {
  const milestone = MILESTONES[streak];
  const firedRef = useRef(false);

  useEffect(() => {
    if (!milestone || firedRef.current) return;
    firedRef.current = true;

    // Fire confetti
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#f43f5e", "#fb7185", "#fda4af", "#fbbf24", "#a3e635"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#f43f5e", "#fb7185", "#fda4af", "#fbbf24", "#a3e635"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [streak]);

  if (!milestone) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-sm animate-bounce">
      <div className="card-glass rounded-2xl p-4 shadow-2xl border border-rose-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-2xl flex-shrink-0">
            🏆
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">{milestone.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{habitName} — {milestone.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}