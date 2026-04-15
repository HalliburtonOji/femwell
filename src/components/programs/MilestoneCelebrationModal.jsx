import { useState } from "react";
import { base44 } from "@/api/base44Client";

const MILESTONES = {
  "3_days":  { emoji: "🌿", headline: "3 days strong", sub: "You're building a habit. Keep it going!" },
  "7_days":  { emoji: "🌟", headline: "One week done", sub: "Your consistency is paying off." },
  "14_days": { emoji: "💪", headline: "Two weeks!", sub: "You're in the top 10% of FemWell users." },
  "30_days": { emoji: "🏆", headline: "30 days", sub: "You've completed a full month. You're incredible." },
  "complete":{ emoji: "🎉", headline: "Program complete!", sub: null }, // sub is dynamic (program title)
};

export function getMilestoneKey(userProgram) {
  if (!userProgram) return null;
  const streak = userProgram.streak_count || 0;
  const reached = userProgram.milestones_reached || [];
  const shown = userProgram.last_milestone_shown;

  if (userProgram.status === "completed" && !reached.includes("complete") && shown !== "complete") return "complete";
  if (streak >= 30 && !reached.includes("30_days") && shown !== "30_days") return "30_days";
  if (streak >= 14 && !reached.includes("14_days") && shown !== "14_days") return "14_days";
  if (streak >= 7 && !reached.includes("7_days") && shown !== "7_days") return "7_days";
  if (streak >= 3 && !reached.includes("3_days") && shown !== "3_days") return "3_days";
  return null;
}

export default function MilestoneCelebrationModal({ userProgram, programTitle, onClose }) {
  const [dismissing, setDismissing] = useState(false);
  const key = getMilestoneKey(userProgram);
  if (!key) return null;

  const m = MILESTONES[key];
  const sub = key === "complete" ? `${programTitle || "Your program"} is done. How do you feel?` : m.sub;

  const handleClose = async () => {
    setDismissing(true);
    const reached = [...(userProgram.milestones_reached || [])];
    if (!reached.includes(key)) reached.push(key);
    await base44.entities.UserPrograms.update(userProgram.id, {
      last_milestone_shown: key,
      milestones_reached: reached,
    }).catch(() => {});
    onClose();
  };

  return (
    <>
      <style>{`
        @keyframes ms-pop { 0%{transform:scale(0.7);opacity:0} 70%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
        .ms-card { animation: ms-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      `}</style>
      <div style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: "rgba(42,32,53,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div className="ms-card" style={{ backgroundColor: "var(--surface)", borderRadius: 28, padding: "32px 28px", maxWidth: 360, width: "100%", textAlign: "center", boxShadow: "var(--shadow-lg)", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{m.emoji}</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "var(--plum)", margin: "0 0 8px" }}>{m.headline}</h2>
          <p style={{ fontSize: 15, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", lineHeight: 1.6, marginBottom: 24 }}>{sub}</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleClose} disabled={dismissing}
              style={{ flex: 1, padding: "13px", borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", border: "none", fontSize: 14, fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: "pointer", opacity: dismissing ? 0.6 : 1 }}>
              Keep going
            </button>
          </div>
        </div>
      </div>
    </>
  );
}