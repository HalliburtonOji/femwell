import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Clock, Heart } from "lucide-react";

function fmtDuration(seconds) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function PreviousPanicSessions({ userId }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    base44.entities.PanicSessions
      .filter({ user_id: userId }, "-logged_at", 5)
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return null;

  if (sessions.length === 0) {
    return (
      <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: 14, border: "1px dashed var(--border)" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>
          Previous sessions
        </p>
        <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
          Your calm sessions appear here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif", marginBottom: 10 }}>
        Previous sessions
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sessions.map(s => (
          <div
            key={s.id}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 14px", borderRadius: 12,
              backgroundColor: "var(--ivory)", border: "1px solid var(--border)",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", textTransform: "capitalize" }}>
                  {s.feeling_type || "session"}
                </span>
                <span style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                  {fmtDate(s.logged_at || s.started_at)}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                  <Clock className="w-3 h-3" /> {fmtDuration(s.duration_seconds)}
                </span>
                {Array.isArray(s.techniques_used) && s.techniques_used.length > 0 && (
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    · {s.techniques_used.slice(0, 2).join(", ")}
                  </span>
                )}
              </div>
            </div>
            {(s.post_session_rating || s.resolved_rating) && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "4px 8px", borderRadius: 9999, backgroundColor: "var(--rose-dust-subtle)" }}>
                <Heart className="w-3 h-3" style={{ color: "var(--rose-dust)" }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>
                  {s.post_session_rating || s.resolved_rating}/5
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}