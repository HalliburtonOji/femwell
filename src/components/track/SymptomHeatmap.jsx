import { useMemo } from "react";
import { symptomLabel } from "@/utils/symptomLabels";

// 14-day heatmap: columns = days, rows = top symptoms logged in window.
// Empty cells are transparent (NOT zero). Intensity color-scaled 1-5 via severity.

const sLabel = {
  fontSize: "0.6rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--mauve)",
  fontFamily: "'Inter', sans-serif",
};

function dateKey(d) {
  return new Date(d).toISOString().split("T")[0];
}

function severityColor(sev) {
  if (sev == null) return "transparent";
  const map = {
    1: "rgba(196,132,154,0.22)",
    2: "rgba(196,132,154,0.42)",
    3: "rgba(196,132,154,0.62)",
    4: "rgba(196,132,154,0.82)",
    5: "rgba(196,132,154,1)",
  };
  return map[Math.max(1, Math.min(5, Math.round(sev)))] || "transparent";
}

export default function SymptomHeatmap({ checkins }) {
  const { days, topSymptoms, grid } = useMemo(() => {
    // Build 14-day window ending today.
    const today = new Date();
    const days14 = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days14.push(dateKey(d));
    }

    const byDate = {};
    const counts = {};
    (checkins || []).forEach(ci => {
      const key = ci.date;
      if (!key || !days14.includes(key)) return;
      byDate[key] = ci;
      (ci.symptoms || []).forEach(s => {
        counts[s] = (counts[s] || 0) + 1;
      });
    });

    const top = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([slug]) => slug);

    // Grid: { [symptom]: { [date]: severity or null } }
    const g = {};
    top.forEach(sym => {
      g[sym] = {};
      days14.forEach(date => {
        const ci = byDate[date];
        if (ci && (ci.symptoms || []).includes(sym)) {
          g[sym][date] = ci.symptom_severity || 3; // default mid if symptom present but no severity
        } else {
          g[sym][date] = null;
        }
      });
    });

    return { days: days14, topSymptoms: top, grid: g };
  }, [checkins]);

  if (topSymptoms.length === 0) {
    return (
      <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px 18px" }}>
        <p style={sLabel}>14-day trend</p>
        <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 8 }}>
          Not enough data yet — log a few days to see your patterns.
        </p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px 18px", boxShadow: "var(--shadow-sm)" }}>
      <p style={sLabel}>14-day trend</p>
      <div style={{ marginTop: 12, overflowX: "auto" }}>
        <table style={{ borderCollapse: "separate", borderSpacing: 2, minWidth: "100%" }}>
          <tbody>
            {topSymptoms.map(sym => (
              <tr key={sym}>
                <td style={{ fontSize: 11, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", paddingRight: 8, whiteSpace: "nowrap" }}>
                  {symptomLabel(sym)}
                </td>
                {days.map(d => (
                  <td
                    key={d}
                    title={`${symptomLabel(sym)} on ${d}${grid[sym][d] != null ? ` · severity ${grid[sym][d]}` : " · not logged"}`}
                    style={{
                      width: 16, height: 16,
                      backgroundColor: severityColor(grid[sym][d]),
                      border: grid[sym][d] == null ? "1px dashed var(--border)" : "none",
                      borderRadius: 3,
                    }}
                  />
                ))}
              </tr>
            ))}
            <tr>
              <td></td>
              {days.map(d => {
                const day = new Date(d).getDate();
                return (
                  <td key={d} style={{ fontSize: 8, color: "var(--mauve)", textAlign: "center", fontFamily: "'Inter', sans-serif", paddingTop: 4 }}>
                    {day}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Less</span>
        {[1, 2, 3, 4, 5].map(n => (
          <div key={n} style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: severityColor(n) }} />
        ))}
        <span style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>More</span>
        <span style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginLeft: "auto" }}>Dashed = no log</span>
      </div>
    </div>
  );
}