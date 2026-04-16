import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { subDays, format } from "date-fns";
import { Activity } from "lucide-react";

const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif",
};

function avgOf(records, key) {
  const vals = records.map(r => r[key]).filter(v => v != null && !isNaN(v));
  if (!vals.length) return null;
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
}

export default function WearableWeekCard({ userId }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const weekStart = format(subDays(new Date(), 6), "yyyy-MM-dd");
    base44.entities.WearableSync.filter({ user_id: userId }, "-date", 7)
      .then(recs => setRecords(recs.filter(r => r.date >= weekStart)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading || records.length === 0) return null;

  const metrics = [
    { label: "Avg resting HR", value: avgOf(records, "resting_heart_rate"), unit: "bpm" },
    { label: "Avg HRV", value: avgOf(records, "hrv_ms"), unit: "ms" },
    { label: "Avg readiness", value: avgOf(records, "readiness_score"), unit: "/100" },
    { label: "Avg sleep", value: avgOf(records, "sleep_rem_hours") != null || avgOf(records, "sleep_deep_hours") != null ? null : null, unit: "hrs" },
  ].filter(m => m.value != null);

  // calculate avg total sleep from components
  const avgSleep = (() => {
    const vals = records.map(r => (r.sleep_rem_hours || 0) + (r.sleep_deep_hours || 0) + (r.sleep_light_hours || 0)).filter(v => v > 0);
    if (!vals.length) return null;
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  })();

  const displayMetrics = [
    { label: "Avg resting HR", value: avgOf(records, "resting_heart_rate"), unit: "bpm" },
    { label: "Avg HRV", value: avgOf(records, "hrv_ms"), unit: "ms" },
    { label: "Avg readiness", value: avgOf(records, "readiness_score"), unit: "/100" },
    { label: "Avg sleep", value: avgSleep, unit: "hrs" },
  ].filter(m => m.value != null);

  if (displayMetrics.length === 0) return null;

  return (
    <div style={{
      backgroundColor: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 20, padding: 16, marginBottom: 16,
      boxShadow: "var(--shadow-sm)",
    }}>
      <div className="flex items-center gap-2 mb-3">
        <div style={{ width: 28, height: 28, borderRadius: 10, backgroundColor: "var(--sage-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Activity style={{ width: 14, height: 14, color: "var(--sage)" }} />
        </div>
        <div>
          <p style={sLabel}>Wearable data</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>Health metrics this week</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {displayMetrics.map(m => (
          <div key={m.label} style={{ backgroundColor: "var(--ivory)", borderRadius: 12, padding: "10px 12px" }}>
            <p style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 2 }}>{m.label}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: "var(--plum)", fontFamily: "'Playfair Display', serif" }}>
              {m.value}<span style={{ fontSize: 11, color: "var(--mauve)", fontWeight: 400, marginLeft: 2 }}>{m.unit}</span>
            </p>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 10 }}>
        Based on {records.length} day{records.length !== 1 ? "s" : ""} of data this week
      </p>
    </div>
  );
}