// ─────────────────────────────────────────────────────────────────────────────
// ContraceptionCard — Planner Cycle tab card for reproductive + pre-TTC stages.
//
// Reads the most recent ContraceptionLog row for this user. Three states:
//   - Loading              → skeleton row.
//   - Entity missing       → "Coming soon" friendly placeholder (graceful
//                            fallback while Halli runs the AI-builder
//                            schema migration documented in
//                            claude-handoff/from-cowork-to-base44-ai-
//                            2026-05-17-contraceptionlog-entity.md).
//   - No active log        → "+ Log contraception" inline form.
//   - Active log present   → method + brand + "since {date}" + edit affordance.
//
// Visibility is gated by the caller (Planner.jsx) on:
//   - plannerConfig.ribbonType === 'cycle'   (cycle-anchored stages only)
//   - !hiddenFeatures.includes('contraception')  (teen/pregnant/postpartum/
//                                                 peri/meno declare this).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, Plus, Pencil, X, Check } from "lucide-react";

const TYPES = [
  { key: "pill",      label: "Combined pill" },
  { key: "coil",      label: "IUD / coil" },
  { key: "implant",   label: "Implant" },
  { key: "patch",     label: "Patch" },
  { key: "ring",      label: "Vaginal ring" },
  { key: "injection", label: "Injection" },
  { key: "condom",    label: "Condom" },
  { key: "none",      label: "Not using anything" },
  { key: "other",     label: "Other" },
];

const SIDE_EFFECTS = [
  "mood", "weight", "libido", "skin", "headaches", "nausea", "bleeding", "other",
];

function typeLabelOf(type) {
  return TYPES.find((t) => t.key === type)?.label || type || "—";
}

function formatStart(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  } catch { return iso; }
}

export default function ContraceptionCard({ profile }) {
  const [logs, setLogs] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [entityMissing, setEntityMissing] = useState(false);
  const [form, setForm] = useState({
    type: "pill",
    brand: "",
    startDate: new Date().toISOString().split("T")[0],
    sideEffects: [],
    notes: "",
    rating: 3,
  });

  const userId = profile?.user_id;

  // Lazy-fetch ContraceptionLog rows. Same graceful-degradation pattern as
  // HrtLogCard — entity missing on base44 surfaces as a friendly placeholder
  // rather than a crash.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const ent = base44?.entities?.ContraceptionLog;
        if (!ent || typeof ent.filter !== "function") {
          if (!cancelled) {
            setEntityMissing(true);
            setLogs([]);
          }
          return;
        }
        const rows = await ent.filter({ user_id: userId }, "-startDate", 20);
        if (!cancelled) setLogs(Array.isArray(rows) ? rows : []);
      } catch (err) {
        if (cancelled) return;
        const msg = String(err?.message || err || "");
        const looksMissing = /not\s*found|unknown|404|400|ContraceptionLog/i.test(msg);
        setEntityMissing(looksMissing);
        setLogs([]);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const active = useMemo(() => {
    if (!logs || logs.length === 0) return null;
    // The "currently active" method is the most-recent log with no endDate.
    const open = logs.find((r) => !r?.endDate);
    return open || logs[0];
  }, [logs]);

  useEffect(() => {
    if (editing && active) {
      setForm({
        type: active.type || "pill",
        brand: active.brand || "",
        startDate: active.startDate || new Date().toISOString().split("T")[0],
        sideEffects: Array.isArray(active.sideEffects) ? active.sideEffects : [],
        notes: active.notes || "",
        rating: typeof active.rating === "number" ? active.rating : 3,
      });
    }
  }, [editing, active]);

  const toggleSE = (key) => {
    setForm((f) => ({
      ...f,
      sideEffects: f.sideEffects.includes(key)
        ? f.sideEffects.filter((s) => s !== key)
        : [...f.sideEffects, key],
    }));
  };

  const save = async () => {
    if (!userId || saving) return;
    const ent = base44?.entities?.ContraceptionLog;
    if (!ent || typeof ent.create !== "function") {
      setEntityMissing(true);
      return;
    }
    setSaving(true);
    try {
      if (active?.id && typeof ent.update === "function") {
        await ent.update(active.id, { ...form });
      } else {
        await ent.create({ ...form, user_id: userId });
      }
      const rows = await ent.filter({ user_id: userId }, "-startDate", 20).catch(() => []);
      setLogs(Array.isArray(rows) ? rows : []);
      setEditing(false);
    } catch (err) {
      const msg = String(err?.message || err || "");
      if (/not\s*found|unknown|404|400|ContraceptionLog/i.test(msg)) {
        setEntityMissing(true);
      }
    } finally {
      setSaving(false);
    }
  };

  const loading = logs === null;

  // ── Render branches ──────────────────────────────────────────────────────
  if (entityMissing) {
    return (
      <section style={wrap} aria-label="Contraception memory — coming soon">
        <header style={headRow}>
          <div style={iconRow}>
            <span style={iconWrap}><Shield size={14} strokeWidth={1.8} /></span>
            <div>
              <p style={eyebrowStyle}>CONTRACEPTION MEMORY</p>
              <p style={titleStyle}>Coming soon</p>
            </div>
          </div>
        </header>
        <p style={bodyMute}>
          Log every method you've tried so side-effects, switches, and notes accumulate over time —
          better than a stateless dropdown. Lands as soon as the schema migration ships.
        </p>
      </section>
    );
  }

  if (loading) {
    return (
      <section style={wrap} aria-label="Contraception card loading">
        <div style={skel} />
        <div style={{ ...skel, width: "60%" }} />
      </section>
    );
  }

  if (editing) {
    return (
      <section style={wrap} aria-label="Log contraception">
        <header style={headRow}>
          <div style={iconRow}>
            <span style={iconWrap}><Shield size={14} strokeWidth={1.8} /></span>
            <p style={titleStyle}>{active ? "Edit method" : "Log contraception"}</p>
          </div>
          <button type="button" onClick={() => setEditing(false)} style={ghostBtn} aria-label="Cancel">
            <X size={13} strokeWidth={2.2} />
          </button>
        </header>

        <label style={fieldLabel}>Method
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={input}>
            {TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </label>

        <label style={fieldLabel}>Brand (optional)
          <input
            type="text"
            value={form.brand}
            placeholder="e.g. Microgynon 30, Mirena, Nexplanon"
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            style={input}
          />
        </label>

        <label style={fieldLabel}>Started
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            style={input}
          />
        </label>

        <p style={{ ...fieldLabel, marginBottom: 4 }}>Side effects (tap to add)</p>
        <div style={chipsRow}>
          {SIDE_EFFECTS.map((se) => {
            const on = form.sideEffects.includes(se);
            return (
              <button
                key={se}
                type="button"
                onClick={() => toggleSE(se)}
                aria-pressed={on}
                style={{
                  ...chip,
                  background: on ? "#3A2C1A" : "transparent",
                  color: on ? "#F4EDDB" : "#3A2C1A",
                  borderColor: on ? "#3A2C1A" : "rgba(58,44,26,0.16)",
                }}
              >
                {se}
              </button>
            );
          })}
        </div>

        <label style={fieldLabel}>Notes
          <textarea
            rows={2}
            value={form.notes}
            placeholder="What's working, what isn't, GP feedback…"
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            style={{ ...input, resize: "vertical", minHeight: 52 }}
          />
        </label>

        <label style={fieldLabel}>How is it working (1–5)
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
            style={{ width: "100%" }}
          />
          <span style={ratingHint}>{form.rating} / 5</span>
        </label>

        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button type="button" onClick={save} disabled={saving} style={primaryBtn}>
            <Check size={13} strokeWidth={2.4} />
            <span>{saving ? "Saving…" : "Save"}</span>
          </button>
          <button type="button" onClick={() => setEditing(false)} style={ghostBtnLarge}>Cancel</button>
        </div>
      </section>
    );
  }

  if (!active) {
    return (
      <section style={wrap} aria-label="No contraception logged">
        <header style={headRow}>
          <div style={iconRow}>
            <span style={iconWrap}><Shield size={14} strokeWidth={1.8} /></span>
            <div>
              <p style={eyebrowStyle}>CONTRACEPTION MEMORY</p>
              <p style={titleStyle}>Nothing logged yet</p>
            </div>
          </div>
        </header>
        <p style={bodyMute}>
          One row per method you've tried — Femwell remembers the side-effects and the why-we-switched
          so you don't have to.
        </p>
        <button type="button" onClick={() => setEditing(true)} style={primaryBtn}>
          <Plus size={13} strokeWidth={2.4} />
          <span>Log contraception</span>
        </button>
      </section>
    );
  }

  return (
    <section style={wrap} aria-label="Current contraception">
      <header style={headRow}>
        <div style={iconRow}>
          <span style={iconWrap}><Shield size={14} strokeWidth={1.8} /></span>
          <div>
            <p style={eyebrowStyle}>CONTRACEPTION MEMORY</p>
            <p style={titleStyle}>{typeLabelOf(active.type)}{active.brand ? ` · ${active.brand}` : ""}</p>
          </div>
        </div>
        <button type="button" onClick={() => setEditing(true)} style={ghostBtn} aria-label="Edit method">
          <Pencil size={13} strokeWidth={2.0} />
        </button>
      </header>
      <p style={metaRow}>
        {active.startDate ? `Since ${formatStart(active.startDate)}` : "Currently active"}
        {Array.isArray(active.sideEffects) && active.sideEffects.length > 0 && (
          <> · {active.sideEffects.length} effect{active.sideEffects.length > 1 ? "s" : ""} noted</>
        )}
      </p>
      {active.notes && <p style={bodyMute}>{active.notes}</p>}
      {logs.length > 1 && (
        <p style={historyLine}>
          {logs.length} {logs.length === 1 ? "method" : "methods"} logged · history view coming
        </p>
      )}
    </section>
  );
}

// ─── Styles (mirrors HrtLogCard for visual coherence) ───────────────────────
const wrap = {
  background: "linear-gradient(180deg, rgba(212,116,90,0.08), rgba(244,237,219,0.6))",
  border: "1px solid rgba(58,44,26,0.12)",
  borderLeft: "3px solid #A6862B",
  borderRadius: 14,
  padding: "14px 14px 16px",
  marginBottom: 12,
};
const headRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 8,
  marginBottom: 8,
};
const iconRow = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};
const iconWrap = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 26,
  height: 26,
  borderRadius: 9999,
  background: "rgba(166,134,43,0.16)",
  color: "#A6862B",
};
const eyebrowStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.18em",
  color: "#A6862B",
  textTransform: "uppercase",
  margin: 0,
};
const titleStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 17,
  fontWeight: 500,
  lineHeight: 1.2,
  color: "#3A2C1A",
  margin: "2px 0 0",
};
const metaRow = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  color: "#6B5840",
  margin: "0 0 6px",
  lineHeight: 1.45,
};
const bodyMute = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12.5,
  color: "#6B5840",
  margin: "0 0 10px",
  lineHeight: 1.5,
};
const historyLine = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  color: "#8A7458",
  fontStyle: "italic",
  margin: 0,
};
const fieldLabel = {
  display: "block",
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  fontWeight: 600,
  color: "#6B5840",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  margin: "10px 0 4px",
};
const input = {
  width: "100%",
  display: "block",
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid rgba(58,44,26,0.18)",
  background: "#FBF6E6",
  color: "#3A2C1A",
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  marginTop: 4,
};
const chipsRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  marginBottom: 4,
};
const chip = {
  padding: "5px 10px",
  borderRadius: 9999,
  border: "1px solid",
  fontSize: 11.5,
  fontWeight: 600,
  fontFamily: "'Inter', sans-serif",
  cursor: "pointer",
  textTransform: "capitalize",
};
const ratingHint = {
  display: "inline-block",
  marginTop: 2,
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  color: "#6B5840",
};
const primaryBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 14px",
  borderRadius: 9999,
  background: "#3A2C1A",
  color: "#F4EDDB",
  border: "1px solid #3A2C1A",
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};
const ghostBtn = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 26,
  height: 26,
  borderRadius: 9999,
  background: "transparent",
  border: "1px solid rgba(58,44,26,0.16)",
  color: "#6B5840",
  cursor: "pointer",
};
const ghostBtnLarge = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 14px",
  borderRadius: 9999,
  background: "transparent",
  border: "1px solid rgba(58,44,26,0.18)",
  color: "#6B5840",
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};
const skel = {
  height: 14,
  background: "rgba(58,44,26,0.08)",
  borderRadius: 6,
  marginBottom: 8,
};
