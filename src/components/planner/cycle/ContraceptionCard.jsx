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
import { Shield, Plus, Pencil, X, Check, ChevronLeft, Star, Clock } from "lucide-react";

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
  const [showHistory, setShowHistory] = useState(false);
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
      <button
        type="button"
        onClick={() => setShowHistory(true)}
        style={historyBtn}
        aria-label="View contraception history"
      >
        <Clock size={11} strokeWidth={2.0} />
        <span>
          View history{logs.length > 1 ? ` · ${logs.length} method${logs.length > 1 ? "s" : ""}` : ""}
        </span>
      </button>
      {showHistory && (
        <ContraceptionHistoryView
          logs={logs}
          activeId={active.id}
          onClose={() => setShowHistory(false)}
        />
      )}
    </section>
  );
}

// ─── ContraceptionHistoryView ───────────────────────────────────────────────
// Full-screen-ish modal overlay that lists every logged method in reverse
// chrono order. Each row: type pill + date range + rating stars + side-effect
// chips. Empty state covers the schema-pending case (no rows yet) so we never
// crash before the base44 ContraceptionLog entity lands.
function ContraceptionHistoryView({ logs, activeId, onClose }) {
  const rows = Array.isArray(logs) ? logs : [];
  return (
    <div role="dialog" aria-modal="true" aria-label="Contraception history" style={historyOverlay}>
      <div style={historyPanel}>
        <header style={historyHead}>
          <button type="button" onClick={onClose} style={backBtn} aria-label="Back to summary">
            <ChevronLeft size={14} strokeWidth={2.2} />
            <span>Back</span>
          </button>
          <div>
            <p style={eyebrowStyle}>CONTRACEPTION · HISTORY</p>
            <p style={titleStyle}>Every method, every effect</p>
          </div>
          <span style={{ width: 60 }} aria-hidden="true" />
        </header>

        {rows.length === 0 ? (
          <div style={historyEmpty}>
            <p style={historyEmptyTitle}>Your history will appear here once you start logging</p>
            <p style={bodyMute}>
              One row per method — Femwell remembers the side-effects, brand, and switch reasons so
              you don't have to re-tell the same story to each GP.
            </p>
          </div>
        ) : (
          <ul style={historyList}>
            {rows.map((row) => {
              const isActive = row?.id && row.id === activeId;
              const rating = typeof row?.rating === "number" ? row.rating : null;
              return (
                <li key={row.id || row.startDate + (row.brand || row.type)} style={historyRow}>
                  <div style={historyRowHead}>
                    <span style={methodPill}>{typeLabelOf(row.type)}{row.brand ? ` · ${row.brand}` : ""}</span>
                    {isActive && <span style={activeTag}>Active</span>}
                  </div>
                  <p style={historyDates}>
                    {row.startDate ? formatStart(row.startDate) : "Start unknown"}
                    {" — "}
                    {row.endDate ? formatStart(row.endDate) : "now"}
                  </p>
                  {rating !== null && (
                    <div style={ratingRow} aria-label={`Rating ${rating} of 5`}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={12}
                          strokeWidth={1.6}
                          fill={n <= rating ? "#A6862B" : "none"}
                          stroke={n <= rating ? "#A6862B" : "#8A7458"}
                        />
                      ))}
                      <span style={ratingNum}>{rating}/5</span>
                    </div>
                  )}
                  {Array.isArray(row.sideEffects) && row.sideEffects.length > 0 && (
                    <div style={historyChips}>
                      {row.sideEffects.map((se) => (
                        <span key={se} style={historyChip}>{se}</span>
                      ))}
                    </div>
                  )}
                  {row.notes && <p style={historyNotes}>{row.notes}</p>}
                </li>
              );
            })}
          </ul>
        )}

        <footer style={historyFoot}>
          <button type="button" onClick={onClose} style={ghostBtnLarge}>Close</button>
        </footer>
      </div>
    </div>
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
const historyBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  marginTop: 6,
  padding: "5px 10px",
  borderRadius: 9999,
  background: "rgba(166,134,43,0.10)",
  border: "1px solid rgba(166,134,43,0.30)",
  color: "#6B5840",
  fontFamily: "'Inter', sans-serif",
  fontSize: 11.5,
  fontWeight: 600,
  cursor: "pointer",
};
const historyOverlay = {
  position: "fixed",
  inset: 0,
  zIndex: 950,
  background: "rgba(58,44,26,0.50)",
  backdropFilter: "blur(2.5px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
};
const historyPanel = {
  background: "#FBF6E6",
  border: "1px solid rgba(58,44,26,0.16)",
  borderRadius: 18,
  padding: 18,
  width: "100%",
  maxWidth: 480,
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 14px 50px rgba(58,44,26,0.30)",
};
const historyHead = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 8,
  marginBottom: 12,
};
const backBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "5px 8px 5px 6px",
  borderRadius: 9999,
  background: "transparent",
  border: "1px solid rgba(58,44,26,0.18)",
  color: "#6B5840",
  fontFamily: "'Inter', sans-serif",
  fontSize: 11.5,
  fontWeight: 600,
  cursor: "pointer",
  height: 26,
};
const historyEmpty = {
  padding: "24px 12px",
  textAlign: "center",
};
const historyEmptyTitle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 16,
  fontStyle: "italic",
  color: "#3A2C1A",
  margin: "0 0 8px",
  lineHeight: 1.3,
};
const historyList = {
  listStyle: "none",
  padding: 0,
  margin: "0 0 12px",
  display: "flex",
  flexDirection: "column",
  gap: 10,
};
const historyRow = {
  background: "rgba(255,255,255,0.55)",
  border: "1px solid rgba(58,44,26,0.10)",
  borderRadius: 10,
  padding: "10px 12px",
};
const historyRowHead = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  marginBottom: 2,
};
const methodPill = {
  display: "inline-flex",
  padding: "3px 8px",
  borderRadius: 9999,
  background: "rgba(166,134,43,0.18)",
  color: "#3A2C1A",
  fontFamily: "'Inter', sans-serif",
  fontSize: 11.5,
  fontWeight: 700,
};
const activeTag = {
  display: "inline-flex",
  padding: "2px 7px",
  borderRadius: 9999,
  background: "#3A2C1A",
  color: "#F4EDDB",
  fontFamily: "'Inter', sans-serif",
  fontSize: 9.5,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};
const historyDates = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  color: "#6B5840",
  fontStyle: "italic",
  margin: "2px 0 4px",
};
const ratingRow = {
  display: "inline-flex",
  alignItems: "center",
  gap: 3,
  margin: "0 0 4px",
};
const ratingNum = {
  marginLeft: 4,
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  fontWeight: 600,
  color: "#6B5840",
};
const historyChips = {
  display: "flex",
  flexWrap: "wrap",
  gap: 4,
  marginTop: 4,
};
const historyChip = {
  display: "inline-flex",
  padding: "2px 8px",
  borderRadius: 9999,
  background: "rgba(212,116,90,0.16)",
  color: "#7A3422",
  fontFamily: "'Inter', sans-serif",
  fontSize: 10.5,
  fontWeight: 600,
  textTransform: "capitalize",
};
const historyNotes = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  color: "#3A2C1A",
  lineHeight: 1.5,
  margin: "6px 0 0",
};
const historyFoot = {
  display: "flex",
  justifyContent: "flex-end",
  paddingTop: 10,
  borderTop: "1px dashed rgba(58,44,26,0.16)",
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
