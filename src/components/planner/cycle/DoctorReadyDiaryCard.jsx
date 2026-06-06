import jsPDF from "jspdf";
import { createPageUrl } from "@/utils";
import { Stethoscope, ArrowRight } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// DoctorReadyDiaryCard — Planner Cycle tab CTA into the canonical export.
//
// The parallel in-card "Doctor-Ready Diary" generator was RETIRED: there is now
// ONE implementation of the doctor's export — the 3-step builder at
// /DoctorExport. This card repoints to it with ?preset=diary (a 6-week,
// NICE NG23-leaning selection), so the Planner keeps its entry point without a
// second, divergent generator.
//
// `buildDiaryPdf` is preserved and still exported — MergedExportSheet uses it to
// append diary pages to a combined PDF. Only the card's own UI was repointed.
//
// Brand-voice: no diagnostic language, no emoji, plum-on-cream.
// ─────────────────────────────────────────────────────────────────────────────

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

// Deterministic A4 diary PDF — preserved for MergedExportSheet (combined export).
// Sprint 6B Feature 2 — exported so MergedExportSheet can append diary pages to
// a combined PDF, or download as a stand-alone file.
export function buildDiaryPdf(diary, displayName) {
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

  const ps = diary?.profile_summary || {};
  if (ps?.confidence_pct != null) {
    pdf.text(`Cycle-prediction confidence: ${Math.round(ps.confidence_pct)}%  ·  Cycles observed: ${ps.cycles_observed ?? 0}`, margin, y);
    y += 18;
  } else { y += 4; }

  setHeading(12); pdf.text("Summary", margin, y); y += 16;
  setBody(11);
  const bullets = diary?.three_bullet_summary || [];
  for (const b of bullets) {
    const lines = pdf.splitTextToSize(`•  ${b}`, page.w - margin * 2);
    pdf.text(lines, margin, y);
    y += lines.length * 14 + 4;
  }
  y += 6;

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

  if (y > page.h - margin - 60) { pdf.addPage(); y = margin; }
  y = page.h - margin - 24;
  setBody(8);
  pdf.text("This export is self-reported tracking only. It is not a diagnostic record and does not replace clinical assessment.", margin, y); y += 10;
  pdf.text("FemWell  ·  femwells.com  ·  Aligned to NICE NG23 menopause guidance for ease of reading by GPs.", margin, y);
  return pdf;
}

// The Planner card — now a CTA into the single canonical builder (/DoctorExport).
export default function DoctorReadyDiaryCard() {
  const href = `${createPageUrl("DoctorExport")}?preset=diary`;
  return (
    <a
      href={href}
      aria-label="Open the doctor's export builder"
      style={{
        display: "flex", alignItems: "center", gap: 14, textDecoration: "none",
        background: "linear-gradient(180deg, var(--cream, #FFFAF5) 0%, rgba(74,42,58,0.04) 100%)",
        borderRadius: 18, padding: "18px 18px", marginBottom: 16,
        border: "1px solid rgba(74,42,58,0.10)", borderLeft: "4px solid var(--plum, #4A2A3A)",
        boxShadow: "0 1px 3px rgba(74,42,58,0.05)",
      }}
    >
      <span style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "rgba(166,134,43,0.14)", border: "1px solid #A6862B" }}>
        <Stethoscope size={20} style={{ color: "#A6862B" }} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#8A7584", marginBottom: 4 }}>Doctor-Ready Diary</span>
        <span style={{ display: "block", fontSize: 18, fontWeight: 600, color: "var(--plum, #4A2A3A)", letterSpacing: "-0.01em", lineHeight: 1.25 }}>Build a GP-ready summary</span>
        <span style={{ display: "block", fontSize: 12.5, color: "var(--plum-2, #6B4559)", lineHeight: 1.45, marginTop: 3 }}>
          Choose your window and what to include, add your questions, and export a printable PDF — built on your device.
        </span>
      </span>
      <ArrowRight size={18} style={{ color: "#8A7584", flexShrink: 0 }} />
    </a>
  );
}
