import { useState } from "react";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function GuideReadingPlayer({ item, user }) {
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  const readTime = item.duration_minutes || Math.max(1, Math.round((item.summary || "").split(" ").length / 200));
  const content = item.summary || item.description || "No content available.";

  const handleComplete = async () => {
    setSaving(true);
    if (user) {
      await base44.entities.ContentHistory.create({
        user_id: user.id,
        content_id: item.id,
        completed_at: new Date().toISOString(),
        completion_source: "CONTENT_PLAYER",
        completion_method: "MANUAL",
        duration_done: readTime,
      }).catch(() => {});
    }
    setCompleted(true);
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)" }}>
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--rose-dust)" }}>Guide</span>
        </div>
        <p className="text-xs" style={{ color: "var(--mauve)" }}>~{readTime} min read</p>
      </div>

      {/* Content */}
      <div className="rounded-2xl p-5 space-y-4" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        <p className="text-sm leading-relaxed" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.8 }}>
          {content}
        </p>

        {item.safety_notes && (
          <div className="rounded-xl p-3" style={{ backgroundColor: "#FFF8EE", border: "1px solid #F5DFA8" }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "#7A5A20" }}>Safety notes</p>
            <p className="text-xs" style={{ color: "#7A5A20" }}>{item.safety_notes}</p>
          </div>
        )}
      </div>

      {/* Complete button */}
      <button
        onClick={handleComplete}
        disabled={completed || saving}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all"
        style={{
          backgroundColor: completed ? "var(--sage-subtle)" : "var(--plum)",
          color: completed ? "var(--sage)" : "white",
          border: completed ? "1px solid var(--sage-light)" : "none",
          opacity: saving ? 0.7 : 1,
        }}
      >
        {completed ? (
          <><CheckCircle2 className="w-4 h-4" /> Guide complete</>
        ) : saving ? "Saving..." : (
          <>I&apos;ve read this</>
        )}
      </button>
    </div>
  );
}