import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

function getMondayWeekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

export default function MenopauseReportCard({ user }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const weekStart = getMondayWeekStart();

  useEffect(() => {
    if (user?.id) loadReport();
  }, [user]);

  const loadReport = async () => {
    const reports = await base44.entities.MenopauseWeeklyReport.filter({ user_id: user.id }).catch(() => []);
    const thisWeek = reports.find(r => r.week_start === weekStart);
    setReport(thisWeek || null);
    setLoading(false);
  };

  const generate = async () => {
    setGenerating(true);
    await base44.functions.invoke("generateMenopauseWeeklySummary", { user_id: user.id, week_start: weekStart, force: !!report }).catch(() => {});
    await loadReport();
    setGenerating(false);
  };

  const copyForAppointment = () => {
    if (!parsedReport) return;
    const text = [
      `Week of ${weekStart} — Menopause Symptom Summary`,
      `\nTop symptoms: ${parsedReport.top_symptoms?.join(", ") || "—"}`,
      `Severity trend: ${parsedReport.severity_trend || "—"}`,
      `Suspected triggers: ${parsedReport.suspected_triggers?.join(", ") || "—"}`,
      `\nQuestions for my clinician:\n${parsedReport.questions_for_clinician?.map((q, i) => `${i + 1}. ${q}`).join("\n") || "—"}`,
      `\nSelf-care plan:\n${parsedReport.self_care_plan?.map((a, i) => `${i + 1}. ${a}`).join("\n") || "—"}`,
    ].join("\n");
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Support new report_data field and legacy report_json
  const parsedReport = report?.report_data
    ? report.report_data
    : report?.report_json
    ? (typeof report.report_json === "string" ? JSON.parse(report.report_json) : report.report_json)
    : null;

  const card = { backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 16, boxShadow: "var(--shadow-sm)" };

  if (loading) return (
    <div style={{ ...card, textAlign: "center", padding: 32 }}>
      <div style={{ width: 20, height: 20, border: "2px solid var(--rose-dust-light)", borderTopColor: "var(--rose-dust)", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto" }} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--plum)" }}>Weekly report</p>
            <p style={{ fontSize: 11, color: "var(--mauve)" }}>Week of {weekStart}</p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {parsedReport && (
              <button onClick={copyForAppointment}
                style={{ padding: "6px 12px", borderRadius: 9999, border: "1px solid var(--border)", backgroundColor: "var(--ivory)", color: "var(--mauve)", fontSize: 11, fontWeight: 600, cursor: "pointer", }}>
                {copied ? "Copied" : "Copy for appointment"}
              </button>
            )}
            <button onClick={generate} disabled={generating}
              style={{ padding: "6px 14px", borderRadius: 9999, backgroundColor: "var(--rose-dust)", color: "white", border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer", opacity: generating ? 0.6 : 1, }}>
              {generating ? "Generating..." : parsedReport ? "Refresh" : "Generate"}
            </button>
          </div>
        </div>

        {!parsedReport ? (
          <p style={{ fontSize: 12, color: "var(--mauve)", }}>
            Generate your weekly symptom summary and prep notes for your next clinician appointment.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {parsedReport.top_symptoms?.length > 0 && (
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7, }}>Top symptoms this week</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {parsedReport.top_symptoms.map((s, i) => (
                    <span key={i} style={{ padding: "3px 10px", borderRadius: 9999, backgroundColor: "var(--rose-dust-subtle)", fontSize: 11, color: "var(--rose-dust)", fontWeight: 600, }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
            {parsedReport.severity_trend && (
              <p style={{ fontSize: 12, color: "var(--plum)", fontStyle: "italic", borderLeft: "3px solid var(--rose-dust-light)", paddingLeft: 10, }}>{parsedReport.severity_trend}</p>
            )}
            {parsedReport.questions_for_clinician?.length > 0 && (
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7, }}>Questions for your clinician</p>
                {parsedReport.questions_for_clinician.map((q, i) => (
                  <p key={i} style={{ fontSize: 12, color: "var(--plum)", lineHeight: 1.65, }}>{i + 1}. {q}</p>
                ))}
              </div>
            )}
            {parsedReport.self_care_plan?.length > 0 && (
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7, }}>Self-care plan this week</p>
                {parsedReport.self_care_plan.map((a, i) => (
                  <p key={i} style={{ fontSize: 12, color: "var(--plum)", lineHeight: 1.65, }}>{i + 1}. {a}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}