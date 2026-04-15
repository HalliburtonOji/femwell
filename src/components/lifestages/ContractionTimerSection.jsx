import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const todayStr = new Date().toISOString().split("T")[0];

function fmtSecs(s) {
  if (!s && s !== 0) return "—";
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

export default function ContractionTimerSection({ user }) {
  const [contractions, setContractions] = useState([]);
  const [currentStart, setCurrentStart] = useState(null);
  const [timing, setTiming] = useState(false);
  const [saving, setSaving] = useState(false);

  const startContraction = () => {
    setCurrentStart(Date.now());
    setTiming(true);
  };

  const endContraction = () => {
    if (!currentStart) return;
    const end = Date.now();
    const duration = Math.round((end - currentStart) / 1000);
    const prev = contractions[contractions.length - 1];
    const interval = prev ? Math.round((currentStart - new Date(prev.end).getTime()) / 1000) : null;
    setContractions(c => [...c, {
      start: new Date(currentStart).toISOString(),
      end: new Date(end).toISOString(),
      duration_seconds: duration,
      interval_seconds: interval,
    }]);
    setCurrentStart(null);
    setTiming(false);
  };

  const saveSession = async () => {
    if (!contractions.length || !user?.id) return;
    setSaving(true);
    await base44.entities.ContractionSession.create({
      user_id: user.id, day_key: todayStr,
      started_at: contractions[0].start,
      ended_at: contractions[contractions.length - 1].end,
      contractions: contractions.map(c => ({
        started_at: c.start,
        ended_at: c.end,
        duration_seconds: c.duration_seconds,
        intensity: 0,
      })),
    }).catch(() => {});
    toast.success("Contraction session saved");
    setContractions([]);
    setSaving(false);
  };

  const last5 = contractions.slice(-5);
  const intervals = contractions.map(c => c.interval_seconds).filter(Boolean);
  const avgInterval = intervals.length ? intervals.reduce((a, b) => a + b, 0) / intervals.length : null;
  const isRegular = intervals.length >= 3 && avgInterval && avgInterval < 360 &&
    intervals.every(i => Math.abs(i - avgInterval) < 90);

  const card = { backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 16, boxShadow: "var(--shadow-sm)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={card}>
        <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--rose-dust)", marginBottom: 12, fontFamily: "'Inter', sans-serif" }}>Contraction timer</p>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <button onClick={startContraction} disabled={timing}
            style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: timing ? "var(--border)" : "var(--rose-dust)", color: timing ? "var(--mauve)" : "white", border: "none", cursor: timing ? "default" : "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
            {timing ? "Timing..." : "Start contraction"}
          </button>
          <button onClick={endContraction} disabled={!timing}
            style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: !timing ? "var(--border)" : "var(--plum)", color: !timing ? "var(--mauve)" : "white", border: "none", cursor: !timing ? "default" : "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
            End contraction
          </button>
        </div>

        {isRegular && (
          <div style={{ backgroundColor: "#FFF8EE", borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#7A5A20", fontFamily: "'Inter', sans-serif" }}>Pattern: Regular — approx every {Math.round(avgInterval / 60)} mins</p>
            <p style={{ fontSize: 11, color: "#7A5A20", marginTop: 2, fontFamily: "'Inter', sans-serif" }}>Contractions are becoming regular. Consider contacting your maternity unit.</p>
          </div>
        )}

        {last5.length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Inter', sans-serif" }}>Last {last5.length} contraction{last5.length !== 1 ? "s" : ""}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {last5.map((c, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", backgroundColor: "var(--ivory)", borderRadius: 10, padding: "8px 12px" }}>
                  <span style={{ fontSize: 12, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>Duration: {fmtSecs(c.duration_seconds)}</span>
                  <span style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Gap: {c.interval_seconds ? fmtSecs(c.interval_seconds) : "first"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {contractions.length > 0 && (
          <button onClick={saveSession} disabled={saving}
            style={{ width: "100%", marginTop: 12, padding: 11, borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
            {saving ? "Saving..." : "Save session"}
          </button>
        )}
      </div>

      <div style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", borderRadius: 16, padding: 14 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--rose-dust)", marginBottom: 8, fontFamily: "'Inter', sans-serif" }}>When to contact your maternity unit</p>
        {[
          "Contractions every 5 minutes, lasting 45-60 seconds, for at least 1 hour",
          "Your waters break",
          "You have heavy bleeding",
          "Baby's movements significantly reduce or stop",
          "You have a severe headache, visual changes, or sudden swelling",
        ].map((item, i) => (
          <p key={i} style={{ fontSize: 12, color: "var(--plum)", lineHeight: 1.65, fontFamily: "'Inter', sans-serif" }}>• {item}</p>
        ))}
        <p style={{ fontSize: 11, color: "var(--mauve)", marginTop: 8, fontStyle: "italic", fontFamily: "'Inter', sans-serif" }}>Based on NHS guidance. When in doubt, always call.</p>
      </div>
    </div>
  );
}