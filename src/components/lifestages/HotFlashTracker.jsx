import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, parseISO } from "date-fns";
import { Flame, Plus, Loader2 } from "lucide-react";

const SEVERITIES = ["mild", "moderate", "severe"];
const TRIGGERS = [
  { key: "stress", label: "Stress" },
  { key: "caffeine", label: "Caffeine" },
  { key: "hot_room", label: "Hot room" },
  { key: "spicy_food", label: "Spicy food" },
  { key: "alcohol", label: "Alcohol" },
  { key: "exercise", label: "Exercise" },
  { key: "other", label: "Other" },
];

const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif",
};
const card = { backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 18, boxShadow: "var(--shadow-sm)", marginBottom: 14 };

export default function HotFlashTracker({ user }) {
  const [logs, setLogs] = useState([]);
  const [logging, setLogging] = useState(false);
  const [severity, setSeverity] = useState("moderate");
  const [trigger, setTrigger] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user) return;
    base44.entities.HotFlashLog.filter({ user_id: user.id }, "-logged_at", 20)
      .then(setLogs).catch(() => {});
  }, [user]);

  const logFlash = async () => {
    setSaving(true);
    const created = await base44.entities.HotFlashLog.create({
      user_id: user.id,
      logged_at: new Date().toISOString(),
      severity,
      trigger: trigger || undefined,
      notes: notes.trim() || undefined,
    });
    setLogs(prev => [created, ...prev]);
    setShowForm(false);
    setSeverity("moderate");
    setTrigger("");
    setNotes("");
    setSaving(false);
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const todayCount = logs.filter(l => l.logged_at?.startsWith(todayStr)).length;
  const thisWeekCount = logs.filter(l => {
    const d = new Date(l.logged_at);
    const now = new Date();
    return (now - d) < 7 * 24 * 60 * 60 * 1000;
  }).length;
  const topTrigger = (() => {
    const freq = {};
    logs.forEach(l => { if (l.trigger) freq[l.trigger] = (freq[l.trigger] || 0) + 1; });
    const entries = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    return entries[0]?.[0];
  })();

  return (
    <div>
      <div style={card}>
        <p style={sLabel}>Hot Flash Tracker</p>
        <div style={{ display: "flex", gap: 16, marginTop: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, textAlign: "center", backgroundColor: "var(--rose-dust-subtle)", borderRadius: 14, padding: "10px 6px" }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: "var(--rose-dust)", fontFamily: "'Fraunces', serif" }}>{todayCount}</p>
            <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Today</p>
          </div>
          <div style={{ flex: 1, textAlign: "center", backgroundColor: "var(--ivory-dark)", borderRadius: 14, padding: "10px 6px" }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: "var(--plum)", fontFamily: "'Fraunces', serif" }}>{thisWeekCount}</p>
            <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>This week</p>
          </div>
          {topTrigger && (
            <div style={{ flex: 1, textAlign: "center", backgroundColor: "var(--mauve-subtle)", borderRadius: 14, padding: "10px 6px" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", textTransform: "capitalize" }}>{topTrigger.replace("_", " ")}</p>
              <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Top trigger</p>
            </div>
          )}
        </div>

        <button onClick={() => setShowForm(true)}
          style={{ width: "100%", padding: "13px", borderRadius: 14, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", backgroundColor: "var(--rose-dust)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Flame style={{ width: 18, height: 18 }} /> Log hot flash now
        </button>
      </div>

      {showForm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <div onClick={() => setShowForm(false)} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(42,32,53,0.4)", backdropFilter: "blur(4px)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "var(--surface)", borderRadius: "28px 28px 0 0", padding: 24, maxHeight: "70vh", overflowY: "auto" }}>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: "var(--plum)", marginBottom: 16 }}>Log hot flash</h3>
            <p style={{ ...sLabel, marginBottom: 8 }}>Severity</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {SEVERITIES.map(s => (
                <button key={s} onClick={() => setSeverity(s)}
                  style={{ flex: 1, padding: "8px 6px", borderRadius: 12, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", textTransform: "capitalize", fontFamily: "'Inter', sans-serif", backgroundColor: severity === s ? "var(--rose-dust)" : "var(--ivory-dark)", color: severity === s ? "white" : "var(--mauve)" }}>
                  {s}
                </button>
              ))}
            </div>
            <p style={{ ...sLabel, marginBottom: 8 }}>Possible trigger</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {TRIGGERS.map(t => (
                <button key={t.key} onClick={() => setTrigger(trigger === t.key ? "" : t.key)}
                  style={{ padding: "5px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", backgroundColor: trigger === t.key ? "var(--plum)" : "var(--ivory-dark)", color: trigger === t.key ? "white" : "var(--mauve)" }}>
                  {t.label}
                </button>
              ))}
            </div>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--ivory)", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "var(--plum)", outline: "none", marginBottom: 14, boxSizing: "border-box" }} />
            <button onClick={logFlash} disabled={saving}
              style={{ width: "100%", padding: 13, borderRadius: 14, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", backgroundColor: "var(--rose-dust)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {saving ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : null}
              {saving ? "Saving…" : "Log"}
            </button>
          </div>
        </div>
      )}

      {logs.length > 0 && (
        <div style={card}>
          <p style={{ ...sLabel, marginBottom: 10 }}>Recent hot flashes</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {logs.slice(0, 6).map(l => (
              <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 12, backgroundColor: "var(--ivory)", border: "1px solid var(--border-subtle)" }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", textTransform: "capitalize" }}>{l.severity}</span>
                  {l.trigger && <span style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}> · {l.trigger.replace("_", " ")}</span>}
                </div>
                <span style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                  {l.logged_at ? format(parseISO(l.logged_at), "d MMM HH:mm") : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}