// ─────────────────────────────────────────────────────────────────────────────
// HrtLogCard — STEP 6 of the Life Stage build.
//
// Shows on the Cycle tab (renamed "Patterns" via plannerConfig.cycleTabName)
// when plannerConfig.cycleTabMode === 'heatmap' — i.e. perimenopause + menopause.
//
// Reads the user's most recent active HrtLog row and renders:
//   - Current type / dose / route + start date (or "Not logged yet").
//   - "+ Add HRT" / "Edit" CTA (minimal inline form for v1).
//   - Placeholder "3-month correlation coming soon" note.
//
// The full symptom-vs-HRT correlation is Step 7 / a later MP — this card just
// wires the entity to the UI so the user can start logging.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Pill, Plus, Pencil, X, Check } from "lucide-react";

const HRT_TYPES = [
  { key: "oestradiol-patch",  label: "Oestradiol patch" },
  { key: "oestradiol-gel",    label: "Oestradiol gel" },
  { key: "oestradiol-tablet", label: "Oestradiol tablet" },
  { key: "utrogestan",        label: "Utrogestan" },
  { key: "mirena-ius",        label: "Mirena IUS" },
  { key: "combined-pill",     label: "Combined HRT pill" },
  { key: "testosterone-gel",  label: "Testosterone gel" },
  { key: "vaginal-oestrogen", label: "Vaginal oestrogen" },
  { key: "other",             label: "Other" },
];

const ROUTES = [
  { key: "patch",     label: "Patch" },
  { key: "gel",       label: "Gel" },
  { key: "tablet",    label: "Tablet" },
  { key: "iud",       label: "IUD / IUS" },
  { key: "pessary",   label: "Pessary" },
  { key: "injection", label: "Injection" },
  { key: "other",     label: "Other" },
];

function labelOf(type) {
  return HRT_TYPES.find((t) => t.key === type)?.label || type;
}

function routeLabelOf(route) {
  return ROUTES.find((r) => r.key === route)?.label || route || "—";
}

export default function HrtLogCard({ profile }) {
  const [logs, setLogs] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  // entityMissing = true when base44 hasn't been told about the HrtLog
  // entity yet (Halli hasn't run the schema migration). Show a polite
  // "coming soon" placeholder instead of crashing.
  const [entityMissing, setEntityMissing] = useState(false);
  const [form, setForm] = useState({
    type: "oestradiol-patch",
    dose: "",
    route: "patch",
    start_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const userId = profile?.user_id;

  // Lazy-fetch HrtLog rows. Guarded against the entity not existing on
  // base44 yet — both the SDK throwing synchronously (no `HrtLog` key on
  // base44.entities) and rejecting asynchronously (HTTP 404 / 400 from
  // the server) collapse into a placeholder state.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const ent = base44?.entities?.HrtLog;
        if (!ent || typeof ent.filter !== "function") {
          if (!cancelled) {
            setEntityMissing(true);
            setLogs([]);
          }
          return;
        }
        const rows = await ent.filter({ user_id: userId }, "-start_date", 10);
        if (!cancelled) setLogs(Array.isArray(rows) ? rows : []);
      } catch (err) {
        if (cancelled) return;
        // If the server returns 404 / 400 for the unknown entity, treat
        // it the same as a synchronously-missing entity.
        const msg = String(err?.message || err || "");
        const looksMissing = /not\s*found|unknown|404|400|HrtLog/i.test(msg);
        setEntityMissing(looksMissing);
        setLogs([]);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const active = useMemo(() => {
    if (!logs || logs.length === 0) return null;
    return logs.find((r) => r?.is_active !== false) || logs[0];
  }, [logs]);

  // When editing an existing row, prefill the form.
  useEffect(() => {
    if (editing && active) {
      setForm({
        type: active.type || "oestradiol-patch",
        dose: active.dose || "",
        route: active.route || "patch",
        start_date: active.start_date || new Date().toISOString().split("T")[0],
        notes: active.notes || "",
      });
    }
  }, [editing, active]);

  const save = async () => {
    if (!userId || saving) return;
    const ent = base44?.entities?.HrtLog;
    if (!ent || typeof ent.create !== "function") {
      setEntityMissing(true);
      return;
    }
    setSaving(true);
    try {
      if (active?.id && typeof ent.update === "function") {
        await ent.update(active.id, { ...form, is_active: true });
      } else {
        await ent.create({ ...form, user_id: userId, is_active: true });
      }
      // Re-fetch to refresh display.
      const rows = await ent.filter({ user_id: userId }, "-start_date", 10).catch(() => []);
      setLogs(Array.isArray(rows) ? rows : []);
      setEditing(false);
    } catch (err) {
      const msg = String(err?.message || err || "");
      if (/not\s*found|unknown|404|400|HrtLog/i.test(msg)) {
        setEntityMissing(true);
      }
      // else: silent — the form stays open so user can retry
    } finally {
      setSaving(false);
    }
  };

  const loading = logs === null;

  // Schema-pending placeholder — friendly card while Halli waits for the
  // HrtLog migration. Keeps the layout shape so the Patterns tab doesn't jump.
  if (entityMissing) {
    return (
      <section style={wrap} aria-label="HRT log card — schema pending">
        <header style={headRow}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={iconWrap}>
              <Pill size={14} strokeWidth={1.8} />
            </span>
            <div>
              <div style={eyebrow}>HRT · COMING SOON</div>
              <div style={titleStyle}>HRT log</div>
            </div>
          </div>
        </header>
        <p style={hintStyle}>
          HRT logging arrives once the schema migration is published. We'll preserve everything you tap once it's live.
        </p>
      </section>
    );
  }

  return (
    <section style={wrap} aria-label="HRT log card">
      <header style={headRow}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={iconWrap}>
            <Pill size={14} strokeWidth={1.8} />
          </span>
          <div>
            <div style={eyebrow}>HRT</div>
            <div style={titleStyle}>
              {active ? labelOf(active.type) : "Not logged yet"}
            </div>
          </div>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label={active ? "Edit HRT log" : "Add HRT log"}
            style={editBtn}
          >
            {active ? <Pencil size={12} strokeWidth={2.2} /> : <Plus size={13} strokeWidth={2.2} />}
            <span>{active ? "Edit" : "Add HRT"}</span>
          </button>
        )}
      </header>

      {!editing && (
        loading ? (
          <p style={hintStyle}>Loading your HRT log…</p>
        ) : active ? (
          <>
            <ul style={detailList}>
              <li style={detailRow}>
                <span style={detailKey}>Dose</span>
                <span style={detailValue}>{active.dose || "—"}</span>
              </li>
              <li style={detailRow}>
                <span style={detailKey}>Route</span>
                <span style={detailValue}>{routeLabelOf(active.route)}</span>
              </li>
              <li style={detailRow}>
                <span style={detailKey}>Started</span>
                <span style={detailValue}>
                  {active.start_date
                    ? new Date(active.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                    : "—"}
                </span>
              </li>
            </ul>
            <p style={hintStyle}>
              3-month correlation between your HRT and symptom patterns is coming soon — keep logging.
            </p>
          </>
        ) : (
          <p style={hintStyle}>
            Tap <strong>Add HRT</strong> to log what you take, what dose, and when you started. The Planner will surface patterns alongside it.
          </p>
        )
      )}

      {editing && (
        <div style={formWrap}>
          <label style={labelStyle}>
            <span style={fieldLabel}>Type</span>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              style={inputStyle}
            >
              {HRT_TYPES.map((t) => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
          </label>
          <label style={labelStyle}>
            <span style={fieldLabel}>Dose</span>
            <input
              type="text"
              placeholder="e.g. 75 mcg / 24h"
              value={form.dose}
              onChange={(e) => setForm((f) => ({ ...f, dose: e.target.value }))}
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            <span style={fieldLabel}>Route</span>
            <select
              value={form.route}
              onChange={(e) => setForm((f) => ({ ...f, route: e.target.value }))}
              style={inputStyle}
            >
              {ROUTES.map((r) => (
                <option key={r.key} value={r.key}>{r.label}</option>
              ))}
            </select>
          </label>
          <label style={labelStyle}>
            <span style={fieldLabel}>Started</span>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            <span style={fieldLabel}>Notes (optional)</span>
            <input
              type="text"
              placeholder="e.g. switched from Evorel — better sleep"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              style={inputStyle}
            />
          </label>

          <div style={btnRow}>
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={saving}
              style={cancelBtn}
            >
              <X size={12} strokeWidth={2.2} />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              style={saveBtn}
            >
              <Check size={12} strokeWidth={2.2} />
              <span>{saving ? "Saving…" : "Save"}</span>
            </button>
          </div>

          <p style={{ ...hintStyle, marginTop: 8 }}>
            Femwell does not give HRT advice. We log what you take so a pattern can emerge — share the export with your GP for a review.
          </p>
        </div>
      )}
    </section>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const wrap = {
  background: "#FBF6E6",
  border: "1px solid rgba(58,44,26,0.10)",
  borderRadius: 16,
  padding: "16px 14px",
  marginBottom: 14,
};
const headRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 10,
};
const iconWrap = {
  width: 28,
  height: 28,
  borderRadius: 9999,
  background: "#F4EDDB",
  border: "1px solid rgba(58,44,26,0.10)",
  color: "#A86A52",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
const eyebrow = {
  fontSize: 9.5,
  fontWeight: 700,
  letterSpacing: "0.18em",
  color: "#A6862B",
  textTransform: "uppercase",
};
const titleStyle = {
  fontSize: 17,
  fontWeight: 500,
  color: "#3A2C1A",
  fontStyle: "italic",
  letterSpacing: "-0.01em",
  marginTop: 1,
  lineHeight: 1.2,
};
const editBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "7px 12px",
  background: "#3A2C1A",
  color: "#F4EDDB",
  border: "none",
  borderRadius: 9999,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.04em",
  cursor: "pointer",
  flexShrink: 0,
};
const detailList = {
  listStyle: "none",
  margin: "0 0 10px",
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: 6,
};
const detailRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: 12,
  padding: "6px 0",
  borderBottom: "1px dotted rgba(58,44,26,0.10)",
};
const detailKey = {
  fontSize: 11,
  color: "#6B5840",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};
const detailValue = {
  fontSize: 14,
  color: "#3A2C1A",
  fontWeight: 500,
};
const hintStyle = {
  fontStyle: "italic",
  fontSize: 12.5,
  color: "#4A2A3A",
  lineHeight: 1.5,
  margin: 0,
};
const formWrap = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};
const labelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};
const fieldLabel = {
  fontSize: 10.5,
  color: "#6B5840",
  fontWeight: 700,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
};
const inputStyle = {
  padding: "8px 10px",
  fontSize: 13,
  color: "#3A2C1A",
  background: "var(--surface)",
  border: "1px solid rgba(58,44,26,0.15)",
  borderRadius: 8,
  outline: "none",
  minHeight: 36,
};
const btnRow = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 8,
  marginTop: 4,
};
const cancelBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "8px 14px",
  background: "transparent",
  color: "#6B5840",
  border: "1px solid rgba(58,44,26,0.15)",
  borderRadius: 9999,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};
const saveBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "8px 14px",
  background: "#3A2C1A",
  color: "#F4EDDB",
  border: "none",
  borderRadius: 9999,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.04em",
  cursor: "pointer",
};
