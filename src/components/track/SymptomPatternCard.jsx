import { useMemo } from "react";
import { Link } from "react-router-dom";
import { symptomLabel } from "@/utils/symptomLabels";
import { createPageUrl } from "@/utils";
import { TrendingUp } from "lucide-react";

// Summary: "You've logged X in Y of last 14 days" for the top-1 symptom.
// Only shows if >= 3 logs. Otherwise CTA.

const sLabel = {
  fontSize: "0.6rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--mauve)",
  fontFamily: "'Inter', sans-serif",
};

export default function SymptomPatternCard({ checkins }) {
  const { logCount, topSymptom, topCount } = useMemo(() => {
    const today = new Date();
    const cutoff = new Date(today);
    cutoff.setDate(today.getDate() - 14);
    const inWindow = (checkins || []).filter(c => {
      if (!c.date) return false;
      const d = new Date(c.date);
      return d >= cutoff && d <= today;
    });

    const counts = {};
    inWindow.forEach(c => (c.symptoms || []).forEach(s => { counts[s] = (counts[s] || 0) + 1; }));
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

    return {
      logCount: inWindow.length,
      topSymptom: top?.[0] || null,
      topCount: top?.[1] || 0,
    };
  }, [checkins]);

  if (logCount < 3) {
    return (
      <Link
        to={createPageUrl("Today")}
        style={{
          display: "flex", alignItems: "center", gap: 12, textDecoration: "none",
          backgroundColor: "var(--surface)", border: "1px dashed var(--border)",
          borderRadius: 16, padding: "14px 16px",
        }}
      >
        <div style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "var(--rose-dust-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <TrendingUp className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={sLabel}>Pattern insight</p>
          <p style={{ fontSize: 13, color: "var(--plum)", fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
            Log 3+ days to unlock patterns.
          </p>
        </div>
      </Link>
    );
  }

  if (!topSymptom) {
    return (
      <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 16px" }}>
        <p style={sLabel}>Pattern insight</p>
        <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 6 }}>
          No symptoms logged in the last 14 days.
        </p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 16px", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <TrendingUp className="w-3.5 h-3.5" style={{ color: "var(--rose-dust)" }} />
        <p style={{ ...sLabel, color: "var(--rose-dust)" }}>Pattern insight</p>
      </div>
      <p style={{ fontSize: 14, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.55 }}>
        You've logged <strong>{symptomLabel(topSymptom).toLowerCase()}</strong> in <strong>{topCount} of your last {logCount}</strong> check-ins.
      </p>
    </div>
  );
}