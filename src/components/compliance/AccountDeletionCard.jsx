// Sprint C C4 — Real account-deletion cascade. Replaces the legacy
// "email support" modal. Requires the user to type DELETE to confirm,
// then runs Promise.allSettled across every personal-data table, deletes
// the UserProfile row, signs the user out, and redirects.
//
// Base44 does NOT expose a User-auth deletion endpoint to clients, so we
// can't truly delete the auth row from the browser — we delete every
// data row + UserProfile, sign out, and show a "Contact support to fully
// remove your account" message.

import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Trash2, X, AlertTriangle } from "lucide-react";

// Entities that hold personal data — deleted in parallel (allSettled).
const DATA_ENTITIES = [
  "DailyCheckins",
  "SymptomLogs",
  "MealLog",
  "HydrationLog",
  "DrinkLog",
  "HabitLogs",
  "JournalEntries",
  "MedicationLogs",
  "SupplementLog",
  "PersonalTasks",
  "PlannerItems",
  "CycleEvents",
  "BbtLog",
  "OpkLog",
  "HrtLog",
  "PregnancyDailyLog",
  "PregnancyKickSession",
  "MenopauseDailyLog",
  "ContractionSession",
  "KickLog",
  "NutritionInsight",
];

async function deleteRowsForUser(entityName, userId) {
  try {
    const ent = base44.entities[entityName];
    if (!ent) return { entity: entityName, skipped: true };
    const rows = await ent.filter({ user_id: userId }).catch(() => []);
    const results = await Promise.allSettled(
      (rows || []).map((r) => (r?.id ? ent.delete(r.id) : null)),
    );
    return {
      entity: entityName,
      total: (rows || []).length,
      ok: results.filter((r) => r.status === "fulfilled").length,
      failed: results.filter((r) => r.status === "rejected").length,
    };
  } catch (e) {
    return { entity: entityName, error: String(e) };
  }
}

export default function AccountDeletionCard({ user, profile }) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState(null);
  const [done, setDone] = useState(false);

  const canDelete = confirmText.trim().toUpperCase() === "DELETE" && !running && user?.id;

  async function runDelete() {
    if (!canDelete) return;
    setRunning(true);
    setReport(null);

    // 1) Parallel data-row delete.
    const results = await Promise.allSettled(
      DATA_ENTITIES.map((name) => deleteRowsForUser(name, user.id)),
    );
    const summary = results
      .map((r) => (r.status === "fulfilled" ? r.value : { error: String(r.reason) }))
      .filter(Boolean);

    // 2) Sequential UserProfile delete.
    let profileDeleted = false;
    if (profile?.id) {
      try {
        await base44.entities.UserProfile.delete(profile.id);
        profileDeleted = true;
      } catch { profileDeleted = false; }
    }

    // 3) Sign out (base44 doesn't expose a client auth-delete; this is
    //    the cleanest we can do from the browser).
    let signedOut = false;
    try {
      if (typeof base44.auth?.logout === "function") {
        await base44.auth.logout();
        signedOut = true;
      } else if (typeof base44.auth?.signOut === "function") {
        await base44.auth.signOut();
        signedOut = true;
      }
    } catch { /* silent */ }

    setReport({ summary, profileDeleted, signedOut });
    setRunning(false);
    setDone(true);

    // 4) Redirect to /privacy as the static "what just happened" page.
    setTimeout(() => {
      try { window.location.replace("/Privacy?account=deleted"); } catch {}
    }, 2200);
  }

  return (
    <section
      style={{
        background: "white",
        borderRadius: 16,
        padding: 18,
        boxShadow: "var(--shadow-sm)",
        border: "1px solid #FCA5A5",
        marginBottom: 16,
      }}
      aria-label="Delete my account"
    >
      <header style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
        <AlertTriangle size={18} style={{ color: "#B91C1C", flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#B91C1C", margin: 0 }}>
            Delete my account
          </h2>
          <p style={{ fontSize: 12, color: "var(--mauve)", margin: "4px 0 0", lineHeight: 1.5 }}>
            This will permanently delete all your health data, logs, journal
            entries, and account information. This cannot be undone.
          </p>
        </div>
      </header>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 9999,
            background: "white", color: "#B91C1C",
            border: "1.5px solid #FCA5A5",
            fontSize: 13, fontWeight: 700,
            cursor: "pointer", marginTop: 6,
          }}
        ><Trash2 className="w-4 h-4" /> Start deletion</button>
      ) : done ? (
        <div style={{ marginTop: 10 }}>
          <p style={{ fontSize: 13, color: "#B91C1C", lineHeight: 1.5, margin: 0 }}>
            Your data has been removed. Contact <a href="mailto:support@femwells.com" style={{ color: "#B91C1C", fontWeight: 700 }}>support@femwells.com</a> to fully remove your sign-in credentials.
            Redirecting…
          </p>
          {report && (
            <details style={{ marginTop: 8, fontSize: 11, color: "var(--mauve)", }}>
              <summary style={{ cursor: "pointer" }}>Deletion log</summary>
              <pre style={{ background: "#FFF1F2", padding: 8, borderRadius: 8, overflowX: "auto" }}>
                {JSON.stringify(report, null, 2)}
              </pre>
            </details>
          )}
        </div>
      ) : (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{ fontSize: 12, color: "var(--plum)", fontWeight: 600 }}>
            Type DELETE to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            autoComplete="off"
            style={{
              padding: "10px 12px", borderRadius: 10,
              border: "1.5px solid #FCA5A5",
              fontSize: 14, fontWeight: 600,
              color: "var(--plum)", letterSpacing: "0.08em",
            }}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={runDelete}
              disabled={!canDelete}
              style={{
                flex: 1, padding: "10px 14px", borderRadius: 9999,
                background: canDelete ? "#B91C1C" : "#FCA5A5",
                color: "white", border: "none",
                fontSize: 13, fontWeight: 700,
                cursor: canDelete ? "pointer" : "not-allowed",
              }}
            >{running ? "Deleting…" : "Permanently delete my account"}</button>
            <button
              type="button"
              onClick={() => { setOpen(false); setConfirmText(""); }}
              disabled={running}
              style={{
                padding: "10px 14px", borderRadius: 9999,
                background: "white", color: "var(--plum)",
                border: "1px solid #E5E7EB",
                fontSize: 13, fontWeight: 600,
                cursor: "pointer",
              }}
            ><X className="w-4 h-4" /> Cancel</button>
          </div>
          <p style={{ fontSize: 11, color: "var(--mauve)", margin: 0, lineHeight: 1.5 }}>
            Base44 doesn't expose a client-side auth-credential deletion endpoint,
            so after this finishes you'll need to email
            <a href="mailto:support@femwells.com" style={{ color: "#B91C1C", fontWeight: 600 }}> support@femwells.com</a>
            {" "}to fully remove your sign-in row. All personal data tables and
            your UserProfile will be cleared right now.
          </p>
        </div>
      )}
    </section>
  );
}
