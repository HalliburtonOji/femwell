import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Leaf, Star, Flame, Trophy, Sparkles, Link as LinkIcon } from "lucide-react";

const MILESTONES = {
  "3_days":   { Icon: Leaf,     headline: "3 days strong", sub: "You're building something real." },
  "7_days":   { Icon: Star,     headline: "One week!", sub: "Your consistency is paying off." },
  "14_days":  { Icon: Flame,    headline: "Two weeks!", sub: "You're in a real rhythm now." },
  "30_days":  { Icon: Trophy,   headline: "30 days", sub: "A full month. You're incredible." },
  "complete": { Icon: Sparkles, headline: "Program complete!", sub: null }, // dynamic
};

const CONFETTI_COLORS = ["#C4849A", "#7A9E8E", "#8A7E88", "#E8C4D0", "#B5CEC5", "#fff", "#f0abfc", "#c4b5fd"];

export function getMilestoneKey(userProgram) {
  if (!userProgram) return null;
  const streak = userProgram.streak_count || 0;
  const reached = userProgram.milestones_reached || [];
  const shown = userProgram.last_milestone_shown;

  if (userProgram.status === "completed" && !reached.includes("complete") && shown !== "complete") return "complete";
  if (streak >= 30 && !reached.includes("30_days") && shown !== "30_days") return "30_days";
  if (streak >= 14 && !reached.includes("14_days") && shown !== "14_days") return "14_days";
  if (streak >= 7  && !reached.includes("7_days")  && shown !== "7_days")  return "7_days";
  if (streak >= 3  && !reached.includes("3_days")  && shown !== "3_days")  return "3_days";
  return null;
}

function ConfettiRain({ accent }) {
  const pieces = Array.from({ length: 30 }, (_, i) => i);
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 201 }}>
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-20px) rotate(0deg) translateX(0px); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(110vh) rotate(540deg) translateX(40px); opacity: 0; }
        }
      `}</style>
      {pieces.map(i => (
        <div
          key={i}
          className="absolute rounded-sm"
          style={{
            left: `${(i * 3.3) % 100}%`,
            top: -10,
            width: i % 3 === 0 ? 8 : 6,
            height: i % 3 === 0 ? 8 : 10,
            borderRadius: i % 4 === 0 ? "50%" : "2px",
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animation: `confetti-fall ${2 + (i % 5) * 0.4}s ease-in ${(i * 0.12) % 2}s both`,
          }}
        />
      ))}
    </div>
  );
}

export default function MilestoneCelebrationModal({ userProgram, programTitle, onClose }) {
  const [dismissing, setDismissing] = useState(false);
  const [copied, setCopied] = useState(false);
  const key = getMilestoneKey(userProgram);
  if (!key) return null;

  const m = MILESTONES[key];
  const sub = key === "complete"
    ? `${programTitle || "Your program"} is done. How do you feel?`
    : m.sub;

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

  const handleShare = () => {
    const label = key === "complete" ? `completed` : `completed ${key.replace("_", " ")} of`;
    const text = `I just ${label} ${programTitle || "my program"} on FemWell`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <>
      <ConfettiRain />
      <style>{`
        @keyframes ms-pop { 0%{transform:scale(0.7);opacity:0} 70%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
        .ms-card { animation: ms-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      `}</style>
      <div style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: "rgba(42,32,53,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div className="ms-card" style={{ backgroundColor: "var(--surface)", borderRadius: 28, padding: "32px 28px", maxWidth: 360, width: "100%", textAlign: "center", boxShadow: "var(--shadow-lg)", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 72, height: 72, borderRadius: 9999, backgroundColor: "var(--rose-dust-subtle)" }}>
              <m.Icon style={{ width: 36, height: 36, color: "var(--rose-dust)" }} />
            </div>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--plum)", margin: "0 0 8px" }}>{m.headline}</h2>
          <p style={{ fontSize: 15, color: "var(--mauve)", lineHeight: 1.6, marginBottom: 24 }}>{sub}</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleClose} disabled={dismissing}
              style={{ flex: 2, padding: "13px", borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: dismissing ? 0.6 : 1 }}>
              Keep going →
            </button>
            <button onClick={handleShare}
              style={{ flex: 1, padding: "13px", borderRadius: 9999, backgroundColor: "var(--ivory-dark)", color: "var(--plum)", border: "1px solid var(--border)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              {copied ? "Copied!" : <span className="inline-flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5" /> Share</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Global event listener component — mount once in Layout or App
export function MilestoneEventListener() {
  const [milestoneData, setMilestoneData] = useState(null);
  const [userProgram, setUserProgram] = useState(null);
  const [programTitle, setProgramTitle] = useState("");

  useEffect(() => {
    const handler = async (e) => {
      const { key, streak, isComplete, programId } = e.detail || {};
      setMilestoneData({ key, streak, isComplete });
      // Fetch userProgram for modal if we have programId
      if (programId) {
        const ups = await base44.entities.UserPrograms.filter({ id: programId }).catch(() => []);
        if (ups[0]) setUserProgram(ups[0]);
      }
    };
    window.addEventListener("fw_milestone", handler);
    return () => window.removeEventListener("fw_milestone", handler);
  }, []);

  if (!milestoneData || !userProgram) return null;

  return (
    <MilestoneCelebrationModal
      userProgram={userProgram}
      programTitle={programTitle}
      onClose={() => { setMilestoneData(null); setUserProgram(null); }}
    />
  );
}