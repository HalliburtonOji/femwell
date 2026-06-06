// V3 sprint Task 5 — full GDPR data export. Queries 21 entities in
// parallel, assembles a single JSON object grouped by category, also
// emits an HTML summary. Both files trigger browser downloads via
// Blob URLs (Capacitor Filesystem path included as a feature-check).

import { useState } from "react";
import { Download, Check, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const DATA_ENTITIES = [
  "DailyCheckins", "SymptomLogs", "MealLog", "DrinkLog", "HydrationLog",
  "HabitLogs", "JournalEntries", "MedicationLogs", "SupplementLog",
  "PersonalTasks", "PlannerItems", "CycleEvents", "BbtLog", "OpkLog",
  "HrtLog", "PregnancyDailyLog", "PregnancyKickSession", "MenopauseDailyLog",
  "ContractionSession", "NutritionInsight", "UserProfile",
];

const C = {
  espresso: "#3A2C1A",
  muted:    "#6B5B4E",
  sage:     "#3D6B3D",
  border:   "#E5DCC9",
  paperHi:  "#F4EFE3",
};

function fmtDateStamp() {
  return new Date().toISOString().slice(0, 10);
}

async function fetchAllForUser(userId) {
  const out = {};
  await Promise.all(DATA_ENTITIES.map(async (name) => {
    try {
      const ent = base44.entities[name];
      if (!ent) { out[name] = []; return; }
      const rows = await ent.filter({ user_id: userId }).catch(() => []);
      out[name] = Array.isArray(rows) ? rows : [];
    } catch { out[name] = []; }
  }));
  return out;
}

function buildHtml(userInfo, data) {
  const sections = Object.entries(data).map(([name, rows]) => `
    <section>
      <h2 style="font-family: 'Fraunces', serif; font-size: 18px; color: #3A2C1A; margin: 16px 0 4px;">
        ${name} <span style="color:#6B5B4E;font-size:13px;font-weight:400">(${rows.length} ${rows.length === 1 ? "row" : "rows"})</span>
      </h2>
    </section>
  `).join("");
  const total = Object.values(data).reduce((a, r) => a + r.length, 0);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>FemWell data export</title></head>
<body style="background:#F4EDDB;color:#3A2C1A;font-family:'Inter',system-ui,sans-serif;padding:32px;max-width:720px;margin:0 auto;">
  <h1 style="font-family:'Fraunces',serif;font-size:28px;margin:0 0 4px;">Your FemWell data</h1>
  <p style="color:#6B5B4E;margin:0 0 24px;">Exported ${new Date().toLocaleString("en-GB")} · ${total} total rows across ${Object.keys(data).length} categories.</p>
  <p style="color:#6B5B4E;font-size:13px;margin:0 0 16px;">Account: ${userInfo?.email || "(no email)"}</p>
  ${sections}
  <p style="color:#6B5B4E;font-size:12px;margin-top:32px;">Full structured data is in the companion JSON file.</p>
</body></html>`;
}

function triggerDownload(blob, filename) {
  // Capacitor Filesystem path — opt-in feature check, no static import.
  if (typeof window !== "undefined" && window.Capacitor?.isNativePlatform?.()) {
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const pkg = "@capacitor/filesystem";
          const { Filesystem, Directory } = await import(/* @vite-ignore */ pkg);
          await Filesystem.writeFile({
            path: filename,
            data: reader.result.split(",").pop(),
            directory: Directory.Documents,
            recursive: true,
          });
        } catch { /* fall through to web download */ }
      };
      reader.readAsDataURL(blob);
    } catch { /* fall through */ }
  }
  // Always also trigger a browser download as a fallback.
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export default function DataExportCard({ user }) {
  const [status, setStatus] = useState("idle"); // idle | preparing | done | error

  async function prepare() {
    if (!user?.id || status === "preparing") return;
    setStatus("preparing");
    try {
      const data = await fetchAllForUser(user.id);
      const stamp = fmtDateStamp();
      const exportPayload = {
        exported_at: new Date().toISOString(),
        account: { id: user.id, email: user.email },
        data,
      };
      const jsonBlob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
      triggerDownload(jsonBlob, `femwell-export-${stamp}.json`);
      const htmlBlob = new Blob([buildHtml({ email: user.email }, data)], { type: "text/html" });
      triggerDownload(htmlBlob, `femwell-export-${stamp}.html`);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  const preparing = status === "preparing";
  const done = status === "done";

  return (
    <section
      aria-label="Download my data"
      style={{
        background: C.paperHi, borderRadius: 16, padding: 18,
        boxShadow: "var(--shadow-sm)", border: `1px solid ${C.border}`,
        marginBottom: 16,
      }}
    >
      <header style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Download size={16} style={{ color: C.espresso }} aria-hidden />
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: C.espresso, margin: 0 }}>
          Your data
        </h2>
      </header>
      <p style={{ fontSize: 13, color: C.muted, margin: "0 0 12px", lineHeight: 1.5 }}>
        Export everything — your journal, logs, symptoms, habits, and more — as a portable file.
      </p>
      <button
        type="button"
        onClick={prepare}
        disabled={preparing}
        aria-label="Prepare data export"
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "10px 18px", borderRadius: 9999, minHeight: 44,
          background: done ? "#E6F4EA" : "#3A2C1A",
          color: done ? C.sage : "#FFFFFF",
          border: done ? "1px solid #8FAF8F" : "none",
          cursor: preparing ? "not-allowed" : "pointer",
          fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700,
          opacity: preparing ? 0.7 : 1,
        }}
      >
        {preparing ? <Loader2 size={16} className="animate-spin" /> : done ? <Check size={16} /> : <Download size={16} />}
        {preparing ? "Preparing your data…" : done ? "Your export is ready — check your downloads" : "Prepare export"}
      </button>
      {status === "error" && (
        <p style={{ fontSize: 12, color: "#B91C1C", marginTop: 8 }}>
          Something went wrong. Try again, or email support@femwells.com.
        </p>
      )}
    </section>
  );
}
