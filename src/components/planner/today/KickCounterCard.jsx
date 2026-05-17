// ─────────────────────────────────────────────────────────────────────────────
// KickCounterCard — Trimester 3 kick counter.
// Build 3 of the pregnancy feature set.
//
// Props:
//   userId  (string) — current user's id
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";

const TODAY = format(new Date(), "yyyy-MM-dd");

function fmtTime(isoStr) {
  try {
    return new Date(isoStr).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return isoStr;
  }
}

function calcDurationMinutes(startIso) {
  const diff = Date.now() - new Date(startIso).getTime();
  return Math.max(1, Math.round(diff / 60000));
}

export default function KickCounterCard({ userId }) {
  const [sessions, setSessions]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [inSession, setInSession]   = useState(false);
  const [sessionStart, setSessionStart] = useState(null); // ISO string
  const [kickCount, setKickCount]   = useState(0);
  const [saving, setSaving]         = useState(false);
  // Live timer display
  const [elapsed, setElapsed]       = useState(0); // seconds
  const timerRef                    = useRef(null);

  const loadSessions = useCallback(async () => {
    if (!userId) return;
    try {
      const rows = await base44.entities.KickLog.filter(
        { user_id: userId, date: TODAY },
        "-session_start",
        20,
      );
      setSessions(rows);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  // Tick timer while session active
  useEffect(() => {
    if (inSession && sessionStart) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - new Date(sessionStart).getTime()) / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [inSession, sessionStart]);

  const handleStart = () => {
    const now = new Date().toISOString();
    setSessionStart(now);
    setKickCount(0);
    setElapsed(0);
    setInSession(true);
  };

  const handleKick = () => {
    if (!inSession) return;
    setKickCount((n) => n + 1);
  };

  const handleDone = async () => {
    if (!userId || !sessionStart || saving) return;
    setSaving(true);
    try {
      await base44.entities.KickLog.create({
        user_id: userId,
        date: TODAY,
        session_start: sessionStart,
        kick_count: kickCount,
        duration_minutes: calcDurationMinutes(sessionStart),
      });
      setInSession(false);
      setSessionStart(null);
      setKickCount(0);
      setElapsed(0);
      await loadSessions();
    } finally {
      setSaving(false);
    }
  };

  const elapsedLabel = () => {
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <section style={card} aria-label="Kick counter">
      {/* Header */}
      <p style={eyebrow}>KICK COUNTER · TRIMESTER 3</p>
      <p style={title}>Count your baby's movements</p>

      {/* Main counter area */}
      <div style={counterArea}>
        {inSession ? (
          <>
            {/* Big tap button */}
            <button
              onClick={handleKick}
              style={kickBtn}
              aria-label={`Count kick — currently ${kickCount}`}
            >
              <span style={kickEmoji}>👣</span>
              <span style={kickNum}>{kickCount}</span>
              <span style={kickLabel}>kicks</span>
            </button>
            <p style={timerText}>{elapsedLabel()} elapsed</p>
            {/* Done button */}
            <button
              onClick={handleDone}
              disabled={saving}
              style={{ ...doneBtn, opacity: saving ? 0.6 : 1 }}
            >
              {saving ? "Saving..." : "Done — end session"}
            </button>
          </>
        ) : (
          <button onClick={handleStart} style={startBtn}>
            Start session
          </button>
        )}
      </div>

      {/* Today's sessions */}
      {!loading && sessions.length > 0 && (
        <div style={sessionsList}>
          <p style={sessionsLabel}>Today's sessions</p>
          {sessions.map((s) => (
            <div key={s.id} style={sessionRow}>
              <span style={sessionTime}>{fmtTime(s.session_start)}</span>
              <span style={sessionKicks}>{s.kick_count} kicks</span>
              {s.duration_minutes && (
                <span style={sessionDur}>{s.duration_minutes} min</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* NHS signpost */}
      <p style={nhsNote}>
        If you notice fewer than 10 movements in 2 hours, contact your midwife.
      </p>
    </section>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const card = {
  background: "#F4EDDB",
  border: "1px solid rgba(58,44,26,0.12)",
  borderLeft: "3px solid #E8B4B8",
  borderRadius: 14,
  padding: "16px 16px 14px",
  marginBottom: 12,
};
const eyebrow = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.18em",
  color: "#C48A8C",
  textTransform: "uppercase",
  margin: 0,
};
const title = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 18,
  fontWeight: 500,
  color: "#3A2C1A",
  margin: "4px 0 16px",
};
const counterArea = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  padding: "8px 0 16px",
};
const kickBtn = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 2,
  width: 130,
  height: 130,
  borderRadius: "50%",
  background: "linear-gradient(145deg, #E8B4B8, #daa0a4)",
  border: "none",
  cursor: "pointer",
  boxShadow: "0 6px 20px rgba(232,180,184,0.45)",
  transition: "transform 80ms",
  WebkitTapHighlightColor: "transparent",
  userSelect: "none",
};
const kickEmoji = {
  fontSize: 24,
  lineHeight: 1,
};
const kickNum = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 38,
  fontWeight: 600,
  color: "#3A2C1A",
  lineHeight: 1,
};
const kickLabel = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  fontWeight: 700,
  color: "#3A2C1A",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
};
const timerText = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  color: "#6B5840",
  margin: 0,
};
const startBtn = {
  padding: "14px 36px",
  borderRadius: 9999,
  background: "#E8B4B8",
  border: "none",
  cursor: "pointer",
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  fontWeight: 700,
  color: "#3A2C1A",
  boxShadow: "0 4px 14px rgba(232,180,184,0.40)",
};
const doneBtn = {
  padding: "12px 28px",
  borderRadius: 9999,
  background: "#8FAF8F",
  border: "none",
  cursor: "pointer",
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  fontWeight: 700,
  color: "#FFFFFF",
  boxShadow: "0 4px 12px rgba(143,175,143,0.40)",
  transition: "opacity 120ms",
};
const sessionsList = {
  borderTop: "1px solid rgba(58,44,26,0.10)",
  paddingTop: 12,
  display: "flex",
  flexDirection: "column",
  gap: 6,
  marginBottom: 12,
};
const sessionsLabel = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.14em",
  color: "#6B5840",
  textTransform: "uppercase",
  margin: "0 0 4px",
};
const sessionRow = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  background: "rgba(255,255,255,0.55)",
  border: "1px solid rgba(58,44,26,0.08)",
  borderRadius: 8,
  padding: "8px 12px",
};
const sessionTime = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  fontWeight: 600,
  color: "#3A2C1A",
  minWidth: 40,
};
const sessionKicks = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  fontWeight: 700,
  color: "#C48A8C",
  flex: 1,
};
const sessionDur = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  color: "#6B5840",
};
const nhsNote = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11.5,
  color: "#6B5840",
  fontStyle: "italic",
  lineHeight: 1.5,
  margin: "8px 0 0",
  padding: "8px 10px",
  background: "rgba(58,44,26,0.05)",
  borderRadius: 8,
};