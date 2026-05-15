import { useState } from "react";
import { base44 } from "@/api/base44Client";
import jsPDF from "jspdf";

// ─────────────────────────────────────────────────────────────────────────────
// DoctorReadyDiaryCard — Planner Phase 2 C4 (MP-A1).
//
// 4-page-feel one-tap PDF that a GP can read at-a-glance. Aligned to NICE
// NG23 field naming so the headings are recognisable:
//   - Menstrual pattern     (period starts + intervals + range)
//   - Bleeding pattern      (start→end pairs + length + flow)
//   - Vasomotor symptoms    (hot-flash day count, cold-day count)
//   - Sleep disturbance     (mean hours + mean quality)
//   - Mood + cognitive      (mean mood + mean focus)
//   - Treatment in use      (HRT regimen if set)
//   - Three-bullet summary  (deterministic — LLM version is a follow-up)
//
// Spec ref: claude-state/base44_mps/2026-05-14_planner_phase2/spec_v2.md §C4.
// Mounts on the Cycle tab at the `doctor` anchor (set by C0 routing).
//
// Brand-voice rules (binding):
//   - No diagnostic language — "you might want to ask your GP" not "you have"
//   - Permissive copy on the empty state ("haven't logged enough yet, that's
//     fine, log a couple of cycles and come back")
//   - No emoji
//   - A4 portrait, Inter for body, Fraunces for headings, plum-on-cream
// ─────────────────────────────────────────────────────────────────────────────

const PHASE_LABEL = "Doctor-Ready Diary";
const PHASE_SUB = "A printable, NICE NG23-aligned snapshot of the past 6 weeks.";

const WEEK_OPTIONS = [4, 6, 8, 12];

function safeAvg(nums) {
  const xs = (nums || []).filter((n) => typeof n === "number" && !Number.isNaN(n));
  if (xs.length === 0) return null;
  return Math.round((xs.reduce((s, x) => s + x, 0) / xs.length) * 10) / 10;
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function ensureNumber(n, fallback = 0) {
  const x = Number(n);
  return Number.isFinite(x) ? x : fallback;
}

// Lay out the PDF deterministically — no fancy autotable, just text + lines,
// because jsPDF text is the most reliable cross-browser path (esp. iOS).
function buildPdf(diary, displayName) {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const page = { w: 595.28, h: 841.89 };
  const margin = 48;
  let y = margin;

  const setHeading = (size) => { pdf.setFont("helvetica", "bold"); pdf.setFontSize(size); };
  const setBody = (size) => { pdf.setFont("helvetica", "normal"); pdf.setFontSize(size); };

  setHeading(18);
  pdf.text("FemWell — Doctor-Ready Diary", margin, y);
  y += 22;

  setBody(10);
  const rangeLine = `Reporting window: ${fmtDate(diary?.range?.from)} → ${fmtDate(diary?.range?.to)}  ·  ${ensureNumber(diary?.range?.weeks, 6)} weeks`;
  pdf.text(rangeLine, margin, y); y += 14;
  pdf.text(`Generated: ${fmtDate(diary?.generated_at)}  ·  Patient: ${displayName || "—"}`, margin, y); y += 14;

  // Confidence band.
  const ps = diary?.profile_summary || {};
  if (ps?.confidence_pct != null) {
    pdf.text(`Cycle-prediction confidence: ${Math.round(ps.confidence_pct)}%  ·  Cycles observed: ${ps.cycles_observed ?? 0}`, margin, y);
    y += 18;
  } else { y += 4; }

  // Three-bullet summary box.
  setHeading(12); pdf.text("Summary", margin, y); y += 16;
  setBody(11);
  const bullets = diary?.three_bullet_summary || [];
  for (const b of bullets) {
    const lines = pdf.splitTextToSize(`•  ${b}`, page.w - margin * 2);
    pdf.text(lines, margin, y);
    y += lines.length * 14 + 4;
  }
  y += 6;

  // Menstrual + bleeding pattern.
  setHeading(12); pdf.text("Menstrual + bleeding pattern", margin, y); y += 16;
  setBody(11);
  const bleeding = diary?.bleeding_pattern || [];
  if (bleeding.length === 0) {
    pdf.text("No bleeding episodes logged in window.", margin, y); y += 14;
  } else {
    for (const b of bleeding) {
      const txt = `${fmtDate(b.start)} → ${b.end ? fmtDate(b.end) : "ongoing"}  ·  ${b.length_days != null ? `${b.length_days} day${b.length_days === 1 ? "" : "s"}` : ""}  ·  flow: ${b.flow_level || "not logged"}`;
      pdf.text(txt, margin, y); y += 14;
    }
  }
  if (ps?.cycle_avg_length != null) { y += 4; pdf.text(`Profile cycle length (mean): ${ps.cycle_avg_length} days`, margin, y); y += 14; }
  y += 6;

  // Vasomotor + autonomic.
  setHeading(12); pdf.text("Vasomotor + autonomic symptoms", margin, y); y += 16;
  setBody(11);
  const ss = diary?.symptom_summary || {};
  const sympLines = [
    `Hot-flash days: ${ss.hot_flashes_days || 0}`,
    `Cold-days (autonomic): ${ss.cold_days || 0}`,
    `Severe cramp days (≥4/5): ${ss.cramps_severe_days || 0}`,
    `Headache days (≥3/5): ${ss.headache_days || 0}`,
    `Bloating days (≥3/5): ${ss.bloating_days || 0}`,
    `Breast tenderness days (≥3/5): ${ss.breast_tenderness_days || 0}`,
    `Cravings days: ${ss.cravings_days || 0}`,
  ];
  for (const ln of sympLines) { pdf.text(ln, margin, y); y += 14; }
  y += 6;

  // Sleep + mood.
  setHeading(12); pdf.text("Sleep + mood + cognitive", margin, y); y += 16;
  setBody(11);
  const checkins = diary?.daily_checkins || [];
  const sleepHoursAvg = safeAvg(checkins.map((c) => c.sleep_hours));
  const sleepQualAvg = safeAvg(checkins.map((c) => c.sleep_quality));
  const moodAvg = safeAvg(checkins.map((c) => c.mood ?? c.mood_score));
  const energyAvg = safeAvg(checkins.map((c) => c.energy ?? c.energy_level));
  const focusAvg = safeAvg(checkins.map((c) => c.focus));
  const sleepLines = [
    `Mean sleep hours: ${sleepHoursAvg ?? "—"} h/night`,
    `Mean sleep quality: ${sleepQualAvg ?? "—"} / 5`,
    `Mean mood: ${moodAvg ?? "—"} / 5`,
    `Mean energy: ${energyAvg ?? "—"} / 5`,
    `Mean focus: ${focusAvg ?? "—"} / 5`,
  ];
  for (const ln of sleepLines) { pdf.text(ln, margin, y); y += 14; }
  y += 6;

  // HRT.
  setHeading(12); pdf.text("Treatment in use (HRT)", margin, y); y += 16;
  setBody(11);
  const hrt = diary?.hrt;
  if (hrt) {
    pdf.text(`Active: yes  ·  Method: ${hrt.method}`, margin, y); y += 14;
    if (hrt.evening_dose) { pdf.text(`Evening dose: ${hrt.evening_dose}`, margin, y); y += 14; }
    if (hrt.reminder_time) { pdf.text(`Reminder time: ${hrt.reminder_time}`, margin, y); y += 14; }
  } else {
    pdf.text("No active HRT regimen logged.", margin, y); y += 14;
  }
  y += 6;

  // Notable notes.
  const notes = ss?.notable_notes || [];
  if (notes.length) {
    setHeading(12); pdf.text("Notable free-text notes", margin, y); y += 16;
    setBody(10);
    for (const n of notes) {
      const lines = pdf.splitTextToSize(`${fmtDate(n.date)} — ${n.note}`, page.w - margin * 2);
      pdf.text(lines, margin, y);
      y += lines.length * 12 + 2;
      if (y > page.h - margin - 40) { pdf.addPage(); y = margin; }
    }
  }

  // Footer — disclaimer + brand mark.
  if (y > page.h - margin - 60) { pdf.addPage(); y = margin; }
  y = page.h - margin - 24;
  setBody(8);
  pdf.text("This export is self-reported tracking only. It is not a diagnostic record and does not replace clinical assessment.", margin, y); y += 10;
  pdf.text("FemWell  ·  femwells.com  ·  Aligned to NICE NG23 menopause guidance for ease of reading by GPs.", margin, y);
  return pdf;
}

export default function DoctorReadyDiaryCard({ user }) {
  const [weeks, setWeeks] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [diary, setDiary] = useState(null);

  const handleGenerate = async () => {
    setLoading(true); setError(null); setDiary(null);
    try {
      const raw = await base44.functions.invoke("generateDoctorReadyDiary", { weeks });
      // The SDK wraps function responses as { data: <payload>, error? } in
      // some versions, and returns the payload directly in others. Defensive
      // unwrap so both shapes work.
      const res = raw?.data && (raw.data.ok !== undefined || raw.data.error !== undefined)
        ? raw.data
        : raw;
      if (!res || res.ok === false) {
        setError(res?.error || "Couldn't build the diary. Try again in a moment.");
      } else if (res?.ok === true || res?.profile_summary || res?.bleeding_pattern) {
        setDiary(res);
      } else {
        setError("Couldn't build the diary. Try again in a moment.");
      }
    } catch (err) {
      setError(err?.message || "Couldn't build the diary. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!diary) return;
    const displayName = user?.full_name || user?.email || "";
    const pdf = buildPdf(diary, displayName);
    const fname = `femwell-doctor-diary-${diary?.range?.to || "export"}.pdf`;
    pdf.save(fname);
  };

  const ps = diary?.profile_summary || null;

  return (
    <section
      aria-label="Doctor-Ready Diary"
      style={{
        background: "linear-gradient(180deg, var(--cream, #FFFAF5) 0%, rgba(74,42,58,0.04) 100%)",
        borderRadius: 18,
        padding: "18px 18px 16px",
        border: "1px solid rgba(74,42,58,0.10)",
        borderLeft: "4px solid var(--plum, #4A2A3A)",
        boxShadow: "0 1px 3px rgba(74,42,58,0.05)",
        marginBottom: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <p style={kickerStyle}>{PHASE_LABEL}</p>
          <p style={titleStyle}>One-tap diary for your next appointment.</p>
          <p style={subStyle}>{PHASE_SUB}</p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        <label style={{ fontSize: 12, color: "var(--plum-2, #6B4559)", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
          Window
        </label>
        <select
          aria-label="Diary window in weeks"
          value={weeks}
          onChange={(e) => setWeeks(Number(e.target.value))}
          disabled={loading}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid var(--border, rgba(74,42,58,0.16))",
            background: "var(--surface, #FFFFFF)",
            color: "var(--plum-2, #6B4559)",
          }}
        >
          {WEEK_OPTIONS.map((w) => (
            <option key={w} value={w}>{w} weeks</option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          style={primaryBtnStyle(loading)}
        >
          {loading ? "Pulling…" : diary ? "Refresh" : "Build diary"}
        </button>
        {diary && (
          <button
            type="button"
            onClick={handleDownload}
            style={secondaryBtnStyle}
          >
            Download PDF
          </button>
        )}
      </div>

      {error && (
        <p role="alert" style={{ fontSize: 12.5, color: "var(--rose-primary, #D45E52)", fontFamily: "'Inter', sans-serif", margin: "6px 0 0" }}>
          {error}
        </p>
      )}

      {!diary && !loading && !error && (
        <p style={emptyStyle}>
          Tap <em>Build diary</em> to assemble a printable snapshot of your last {weeks} weeks — period pattern, bleeding episodes, vasomotor symptoms, sleep, mood, and any HRT regimen you've logged. Aligned to NICE NG23 so your GP can scan it in 30 seconds.
        </p>
      )}

      {diary && (
        <div style={{ marginTop: 12, display: "grid", gap: 14 }}>
          {/* Confidence row */}
          {ps?.confidence_pct != null && (
            <p style={metaLineStyle}>
              Cycle-prediction confidence <strong>{Math.round(ps.confidence_pct)}%</strong> · {ps.cycles_observed ?? 0} cycles observed.
            </p>
          )}

          {/* Three-bullet summary */}
          <div style={blockStyle}>
            <h3 style={blockTitleStyle}>Summary</h3>
            <ul style={bulletListStyle}>
              {(diary.three_bullet_summary || []).map((b, i) => (
                <li key={i} style={bulletItemStyle}>{b}</li>
              ))}
            </ul>
          </div>

          {/* Bleeding pattern */}
          <div style={blockStyle}>
            <h3 style={blockTitleStyle}>Bleeding pattern</h3>
            {(diary.bleeding_pattern || []).length === 0 ? (
              <p style={mutedStyle}>No bleeding episodes logged in this window.</p>
            ) : (
              <ul style={tightListStyle}>
                {diary.bleeding_pattern.map((b, i) => (
                  <li key={i} style={tightItemStyle}>
                    <span style={{ fontWeight: 600 }}>{fmtDate(b.start)}</span> → {b.end ? fmtDate(b.end) : <em>ongoing</em>}
                    {b.length_days != null && <> · {b.length_days} day{b.length_days === 1 ? "" : "s"}</>}
                    {b.flow_level && <> · flow {b.flow_level}</>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Symptoms quick-grid */}
          <div style={blockStyle}>
            <h3 style={blockTitleStyle}>Vasomotor + autonomic symptoms</h3>
            <div style={chipGridStyle}>
              <SymptomChip label="Hot flashes" value={diary.symptom_summary?.hot_flashes_days || 0} />
              <SymptomChip label="Cold days" value={diary.symptom_summary?.cold_days || 0} />
              <SymptomChip label="Severe cramps" value={diary.symptom_summary?.cramps_severe_days || 0} />
              <SymptomChip label="Headache" value={diary.symptom_summary?.headache_days || 0} />
              <SymptomChip label="Bloating" value={diary.symptom_summary?.bloating_days || 0} />
              <SymptomChip label="Breast tenderness" value={diary.symptom_summary?.breast_tenderness_days || 0} />
            </div>
          </div>

          {/* HRT */}
          <div style={blockStyle}>
            <h3 style={blockTitleStyle}>Treatment in use</h3>
            {diary.hrt ? (
              <p style={bodyStyle}>
                Active HRT. Method <strong>{diary.hrt.method}</strong>
                {diary.hrt.evening_dose ? <> · evening dose {diary.hrt.evening_dose}</> : null}
                {diary.hrt.reminder_time ? <> · reminder {diary.hrt.reminder_time}</> : null}.
              </p>
            ) : (
              <p style={mutedStyle}>No active HRT regimen logged.</p>
            )}
          </div>

          <p style={disclaimerStyle}>
            This is self-reported tracking only — not a diagnostic record. The PDF is a conversation-starter, not a clinical document.
          </p>
        </div>
      )}
    </section>
  );
}

function SymptomChip({ label, value }) {
  return (
    <div style={chipStyle}>
      <p style={chipLabelStyle}>{label}</p>
      <p style={chipValueStyle}>{value} <span style={chipUnitStyle}>day{value === 1 ? "" : "s"}</span></p>
    </div>
  );
}

// ── Styles ──
const kickerStyle = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  color: "var(--plum-mute, #8A7584)",
  fontFamily: "'Inter', sans-serif",
  margin: "0 0 6px",
};
const titleStyle = {
  fontSize: 19,
  fontWeight: 600,
  color: "var(--plum, #4A2A3A)",
  fontFamily: "'Fraunces', serif",
  letterSpacing: "-0.01em",
  margin: "0 0 4px",
};
const subStyle = {
  fontSize: 13,
  color: "var(--plum-2, #6B4559)",
  fontFamily: "'Inter', sans-serif",
  lineHeight: 1.5,
  margin: 0,
};
const emptyStyle = {
  fontSize: 13,
  color: "var(--plum-2, #6B4559)",
  fontFamily: "'Inter', sans-serif",
  lineHeight: 1.55,
  margin: "10px 0 0",
};
const metaLineStyle = {
  fontSize: 12.5,
  color: "var(--plum-2, #6B4559)",
  fontFamily: "'Inter', sans-serif",
  margin: 0,
};
const blockStyle = {
  background: "var(--cream-deep, #FAF4ED)",
  borderRadius: 12,
  padding: "12px 14px",
  border: "1px solid var(--border-subtle, rgba(74,42,58,0.08))",
};
const blockTitleStyle = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  color: "var(--plum-mute, #8A7584)",
  fontFamily: "'Inter', sans-serif",
  margin: "0 0 8px",
};
const bulletListStyle = { margin: 0, paddingLeft: 18 };
const bulletItemStyle = {
  fontSize: 13,
  color: "var(--plum-2, #6B4559)",
  fontFamily: "'Inter', sans-serif",
  lineHeight: 1.5,
  marginBottom: 4,
};
const tightListStyle = { margin: 0, paddingLeft: 18 };
const tightItemStyle = {
  fontSize: 12.5,
  color: "var(--plum-2, #6B4559)",
  fontFamily: "'Inter', sans-serif",
  lineHeight: 1.5,
  marginBottom: 2,
};
const mutedStyle = {
  fontSize: 12.5,
  color: "var(--plum-mute, #8A7584)",
  fontFamily: "'Inter', sans-serif",
  fontStyle: "italic",
  margin: 0,
};
const bodyStyle = {
  fontSize: 13,
  color: "var(--plum-2, #6B4559)",
  fontFamily: "'Inter', sans-serif",
  lineHeight: 1.5,
  margin: 0,
};
const disclaimerStyle = {
  fontSize: 11.5,
  color: "var(--plum-mute, #8A7584)",
  fontFamily: "'Inter', sans-serif",
  lineHeight: 1.5,
  margin: "4px 0 0",
};
const chipGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: 8,
};
const chipStyle = {
  background: "var(--surface, #FFFFFF)",
  borderRadius: 10,
  padding: "8px 10px",
  border: "1px solid var(--border-subtle, rgba(74,42,58,0.08))",
};
const chipLabelStyle = {
  fontSize: 10.5,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.10em",
  color: "var(--plum-mute, #8A7584)",
  fontFamily: "'Inter', sans-serif",
  margin: "0 0 4px",
};
const chipValueStyle = {
  fontSize: 16,
  fontWeight: 700,
  color: "var(--plum, #4A2A3A)",
  fontFamily: "'Fraunces', serif",
  margin: 0,
  letterSpacing: "-0.01em",
};
const chipUnitStyle = {
  fontSize: 11,
  fontWeight: 500,
  color: "var(--plum-mute, #8A7584)",
  fontFamily: "'Inter', sans-serif",
};

function primaryBtnStyle(disabled) {
  return {
    padding: "8px 16px",
    borderRadius: 9999,
    border: "none",
    background: disabled ? "var(--plum-soft, #D8C7CF)" : "var(--plum, #4A2A3A)",
    color: "var(--cream, #FFFAF5)",
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    cursor: disabled ? "wait" : "pointer",
    minHeight: 36,
  };
}
const secondaryBtnStyle = {
  padding: "8px 14px",
  borderRadius: 9999,
  border: "1px solid var(--plum, #4A2A3A)",
  background: "transparent",
  color: "var(--plum, #4A2A3A)",
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  minHeight: 36,
};
