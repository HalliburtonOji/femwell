import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const KICK_GOAL = 10;
const todayStr = new Date().toISOString().split("T")[0];

function getWeekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

export default function KickTrackerSection({ user }) {
  const [kicks, setKicks] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [saving, setSaving] = useState(false);
  const [weeklySessions, setWeeklySessions] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (user?.id) loadWeeklySessions();
  }, [user]);

  useEffect(() => {
    if (sessionActive && startTime) {
      timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [sessionActive, startTime]);

  const loadWeeklySessions = async () => {
    const ws = getWeekStart();
    const sessions = await base44.entities.PregnancyKickSession.filter({ user_id: user.id }).catch(() => []);
    setWeeklySessions(sessions.filter(s => s.day_key >= ws));
  };

  const startSession = () => {
    setKicks(0);
    setStartTime(Date.now());
    setElapsed(0);
    setSessionActive(true);
  };

  const addKick = () => {
    if (!sessionActive) return;
    const newKicks = kicks + 1;
    setKicks(newKicks);
    if (newKicks >= KICK_GOAL) toast.success(`${KICK_GOAL} kicks reached in ${Math.floor(elapsed / 60)}m ${elapsed % 60}s`);
  };

  const endAndSave = async () => {
    if (!sessionActive) return;
    setSaving(true);
    setSessionActive(false);
    clearInterval(timerRef.current);
    await base44.entities.PregnancyKickSession.create({
      user_id: user.id, day_key: todayStr,
      started_at: new Date(startTime).toISOString(),
      ended_at: new Date().toISOString(),
      kicks, duration_seconds: elapsed,
    }).catch(() => {});
    toast.success("Kick session saved");
    await loadWeeklySessions();
    setSaving(false);
    setKicks(0); setStartTime(null); setElapsed(0);
  };

  const mins = Math.floor(elapsed / 60), secs = elapsed % 60;
  const avgKicks = weeklySessions.length ? Math.round(weeklySessions.reduce((a, s) => a + (s.kicks || 0), 0) / weeklySessions.length) : 0;
  const card = { backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 16, boxShadow: "var(--shadow-sm)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ ...card, textAlign: "center" }}>
        <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--rose-dust)", marginBottom: 8, }}>Kick counter</p>
        <p style={{ fontSize: 12, color: "var(--mauve)", marginBottom: 14, }}>Goal: {KICK_GOAL} kicks. Tap for each movement you feel.</p>

        {sessionActive ? (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 52, fontWeight: 700, color: "var(--plum)", lineHeight: 1 }}>{kicks}</p>
                <p style={{ fontSize: 10, color: "var(--mauve)" }}>kicks</p>
              </div>
              <div>
                <p style={{ fontSize: 28, fontWeight: 600, color: "var(--mauve)", }}>{mins}:{secs.toString().padStart(2, "0")}</p>
                <p style={{ fontSize: 10, color: "var(--mauve)" }}>elapsed</p>
              </div>
            </div>
            <button onClick={addKick}
              style={{ width: 72, height: 72, borderRadius: "50%", backgroundColor: kicks >= KICK_GOAL ? "var(--sage)" : "var(--rose-dust)", color: "white", border: "none", cursor: "pointer", fontSize: 30, marginBottom: 14 }}>
              +
            </button>
            <br />
            <button onClick={endAndSave} disabled={saving}
              style={{ padding: "10px 24px", borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, }}>
              {saving ? "Saving..." : "End + Save session"}
            </button>
          </>
        ) : (
          <button onClick={startSession}
            style={{ padding: "12px 28px", borderRadius: 9999, backgroundColor: "var(--rose-dust)", color: "white", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, }}>
            Start session
          </button>
        )}
      </div>

      <div style={{ backgroundColor: "#FFF8EE", border: "1px solid #F5DFA8", borderRadius: 16, padding: 14 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#7A5A20", marginBottom: 6, }}>Movement check</p>
        <p style={{ fontSize: 12, color: "#7A5A20", lineHeight: 1.7, }}>
          If your baby is moving less than usual, or the pattern changes, contact your midwife or maternity unit immediately. Do not wait until the next day. There is no required number of kicks — knowing your baby's usual pattern is what matters.
        </p>
      </div>

      {weeklySessions.length > 0 && (
        <div style={card}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--plum)", marginBottom: 12 }}>This week</p>
          <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <div style={{ textAlign: "center", flex: 1, backgroundColor: "var(--rose-dust-subtle)", borderRadius: 10, padding: 10 }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: "var(--rose-dust)", }}>{weeklySessions.length}</p>
              <p style={{ fontSize: 10, color: "var(--mauve)" }}>sessions</p>
            </div>
            <div style={{ textAlign: "center", flex: 1, backgroundColor: "var(--sage-subtle)", borderRadius: 10, padding: 10 }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: "var(--sage)", }}>{avgKicks}</p>
              <p style={{ fontSize: 10, color: "var(--mauve)" }}>avg kicks</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 36 }}>
            {weeklySessions.slice(-7).map((s, i) => (
              <div key={i} title={`${s.kicks} kicks`}
                style={{ flex: 1, backgroundColor: "var(--rose-dust)", borderRadius: 3, opacity: 0.5 + Math.min((s.kicks / 20), 0.5), height: `${Math.min((s.kicks / 20) * 100, 100)}%`, minHeight: 4 }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}