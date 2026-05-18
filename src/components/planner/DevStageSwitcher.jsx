// ─────────────────────────────────────────────────────────────────────────────
// DevStageSwitcher — Planner dev / testing pill.
//
// Floats inside the Planner page (not a fixed overlay) and lets the user pick
// a life_stage without touching the base44 schema. The choice persists in
// localStorage under `femwell_dev_life_stage`. Planner.jsx reads from this
// override first, then profile.life_stage, then defaults to "reproductive".
//
// Why this exists: Halli only has base44 Publish access right now — no AI
// builder. The UserProfile.life_stage enum expansion hasn't shipped on the
// live schema yet, so the production "My Stage" picker on Profile.jsx may
// silently fail. This pill lets us flip between all 11 stages in-app and
// verify every Planner surface reshape without any schema migration.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { Layers, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
// Phase 2 QA-fix-bundle-8 — module-level singleton store. All reads/writes
// for the DEV stage + conditions override now go through this store; the
// previous CustomEvent bus is kept as a legacy fallback inside the store
// but components no longer subscribe to it.
import {
  DEV_STAGE_KEY,
  DEV_STAGE_EVENT,
  DEV_CONDITIONS_KEY,
  DEV_CONDITIONS_EVENT,
  readDevStage,
  writeDevStage,
  readDevConditions,
  writeDevConditions,
} from "@/utils/devStageStore";
export {
  DEV_STAGE_KEY,
  DEV_STAGE_EVENT,
  DEV_CONDITIONS_KEY,
  DEV_CONDITIONS_EVENT,
};

const CONDITIONS = [
  { key: "pcos",                label: "PCOS",                hint: "Cycle prediction paused; metabolic pillars" },
  { key: "endo",                label: "Endometriosis",       hint: "Pain pillar; pacing voice" },
  { key: "fibroids",            label: "Fibroids",            hint: "Bleeding tracking; iron status nudge" },
  { key: "thyroid",             label: "Thyroid",             hint: "Energy + temp signal; med-timing nudge" },
  { key: "pmdd",                label: "PMDD",                hint: "Luteal mood support; safety signposts" },
  { key: "diabetes",            label: "Diabetes",            hint: "Glucose-aware nudges; HbA1c reminders" },
  { key: "hypertension",        label: "Hypertension",        hint: "BP-aware pillar; salt + movement nudge" },
  { key: "anxiety-depression",  label: "Anxiety / Depression", hint: "Gentle voice; crisis signposts" },
  { key: "hrt",                 label: "On HRT",              hint: "HRT log; dosage notes; review cadence" },
  { key: "cancer-survivor",     label: "Cancer survivor",     hint: "Induced-menopause aware; opt-in fertility" },
  { key: "ha",                  label: "HA (recovery)",       hint: "Recovery mode; no calories/intensity" },
];

const STAGES = [
  { key: "",                label: "Use my real stage" },
  { key: "teen",            label: "Teen" },
  { key: "reproductive",    label: "Reproductive years" },
  { key: "pre-ttc",         label: "Pre-TTC" },
  { key: "ttc",             label: "Trying to conceive" },
  { key: "pregnant-t1",     label: "Pregnant (T1)" },
  { key: "pregnant-t2",     label: "Pregnant (T2)" },
  { key: "pregnant-t3",     label: "Pregnant (T3)" },
  { key: "postpartum",      label: "Postpartum" },
  { key: "perimenopause",   label: "Perimenopause" },
  { key: "menopause",       label: "Menopause" },
  { key: "post-menopause",  label: "Post-menopause" },
];

const SHORT_LABEL = {
  teen:             "Teen",
  reproductive:     "Repro",
  "pre-ttc":        "Pre-TTC",
  ttc:              "TTC",
  "pregnant-t1":    "Preg T1",
  "pregnant-t2":    "Preg T2",
  "pregnant-t3":    "Preg T3",
  postpartum:       "Postpartum",
  perimenopause:    "Peri",
  menopause:        "Meno",
  "post-menopause": "Post-meno",
};

// Phase 2 QA-fix-bundle-8 — readDevStageOverride / writeDevStageOverride
// and the conditions equivalents now live in `@/utils/devStageStore`.
// Re-export them here under the old names so older imports keep working.
export function readDevStageOverride() {
  const v = readDevStage();
  // Honour the legacy validation behaviour — if the stored value isn't
  // in the STAGES whitelist, return null. This is still safe because
  // writeDevStage doesn't filter; only the read path does.
  return v && STAGES.some((s) => s.key && s.key === v) ? v : null;
}

export function writeDevStageOverride(stage) {
  writeDevStage(stage);
}

export function readDevConditionsOverride() {
  const parsed = readDevConditions();
  if (!Array.isArray(parsed)) return null;
  return parsed.filter((c) => CONDITIONS.some((opt) => opt.key === c));
}

export function writeDevConditionsOverride(conditions) {
  if (conditions === null || conditions === undefined) {
    writeDevConditions(null);
  } else {
    const safe = Array.isArray(conditions)
      ? conditions.filter((c) => CONDITIONS.some((opt) => opt.key === c))
      : [];
    writeDevConditions(safe);
  }
}

export default function DevStageSwitcher({
  effectiveStage,
  realStage,
  effectiveConditions = [],
  realConditions = [],
  onChange,
  onConditionsChange,
  // Phase 2 QA-fix-bundle-5 — DB-write upgrade. profileId comes from
  // Planner.jsx so we can persist the chosen stage to UserProfile, not
  // just localStorage. onProfileUpdated lets Planner refresh its profile
  // state immediately so realLifeStage matches the picked stage on the
  // very next render.
  profileId,
  onProfileUpdated,
}) {
  const [open, setOpen] = useState(false);
  // savingStage holds the stage-key currently being written. Used to show
  // a per-row "Saving…" state and disable other rows during the in-flight
  // write so we don't race two updates.
  const [savingStage, setSavingStage] = useState(null);
  // statusMessage is a transient toast shown inside the panel. The colour
  // varies by status — green-ish for success, blush for error.
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusKind, setStatusKind] = useState("info");
  const statusTimerRef = useRef(null);
  const panelRef = useRef(null);

  // Close panel on outside click.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    window.document.addEventListener("mousedown", onDocClick);
    window.document.addEventListener("touchstart", onDocClick);
    return () => {
      window.document.removeEventListener("mousedown", onDocClick);
      window.document.removeEventListener("touchstart", onDocClick);
    };
  }, [open]);

  useEffect(() => () => {
    if (statusTimerRef.current) window.clearTimeout(statusTimerRef.current);
  }, []);

  const flashStatus = (msg, kind = "info") => {
    setStatusMessage(msg);
    setStatusKind(kind);
    if (statusTimerRef.current) window.clearTimeout(statusTimerRef.current);
    statusTimerRef.current = window.setTimeout(() => setStatusMessage(null), 4200);
  };

  const overrideActive = !!readDevStageOverride();
  const conditionsOverride = readDevConditionsOverride();
  const conditionsOverrideActive = conditionsOverride !== null;
  const activeConditions = conditionsOverrideActive ? conditionsOverride : effectiveConditions;
  const shortLabel = SHORT_LABEL[effectiveStage] || "Stage";
  const conditionsBadge = activeConditions && activeConditions.length > 0
    ? ` +${activeConditions.length}`
    : "";

  // Phase 2 QA-fix-bundle-6 — DB write is now best-effort, local override
  // is canonical. The previous version (bundle-5) reverted localStorage on
  // any DB error. QA pass found that the live UserProfile schema's
  // life_stage enum doesn't include "pregnant-t1/t2/t3" yet (only the legacy
  // "pregnancy" value), so update() rejects on those — and the revert
  // wiped out the local override that would have made Planner render
  // correctly anyway. Result: pregnant-T2 picker silently restored TTC.
  //
  // New order:
  //   1. Snapshot previous override (no longer used for revert, but kept
  //      for visibility in the warn message).
  //   2. Optimistic localStorage write — this is now THE source of truth
  //      for the preview. Planner picks it up immediately.
  //   3. Best-effort DB write. On success: also update Planner's profile
  //      state so realLifeStage matches. On failure: KEEP the local
  //      override active and flash a warn-tone "saved locally, DB sync
  //      failed (schema enum?)" message. Cards still render.
  const handlePick = async (stage) => {
    if (savingStage) return; // ignore double-clicks while in-flight
    const previousOverride = readDevStageOverride() || "";

    // Empty key = "Use my real stage" — clear local override, no DB write.
    if (!stage) {
      writeDevStageOverride("");
      onChange(null);
      flashStatus("Override cleared — using your real stage on file.", "info");
      setOpen(false);
      return;
    }

    // 1+2. Optimistic local-cache write. This is the canonical preview state.
    writeDevStageOverride(stage);
    onChange(stage);

    // No profileId → local-only preview, no DB attempt.
    if (!profileId) {
      flashStatus(`Previewing ${SHORT_LABEL[stage] || stage} locally — no profile id for DB sync.`, "warn");
      setOpen(false);
      return;
    }

    setSavingStage(stage);
    try {
      await base44.entities.UserProfile.update(profileId, { life_stage: stage });
      // DB confirmed. Re-dispatch + sync Planner profile state.
      try { window.dispatchEvent(new CustomEvent(DEV_STAGE_EVENT, { detail: stage })); } catch { /* silent */ }
      if (typeof onProfileUpdated === "function") {
        try { onProfileUpdated({ life_stage: stage }); } catch { /* silent */ }
      }
      try { window.dispatchEvent(new Event("femwell:profile-updated")); } catch { /* silent */ }
      // eslint-disable-next-line no-console
      console.log("[DevStageSwitcher] Stage updated to:", stage, "(DB synced)");
      flashStatus(`Stage updated to ${SHORT_LABEL[stage] || stage}.`, "success");
      setOpen(false);
    } catch (err) {
      // Phase 2 QA-fix-bundle-6 — DO NOT revert. Keep the local override
      // active so Planner still renders the preview. The user can still
      // verify all stage-aware behaviour; the only thing missing is
      // cross-device sync. Most likely cause is a schema-enum mismatch
      // (the live UserProfile.life_stage may not include all 11 values yet).
      // eslint-disable-next-line no-console
      console.warn("[DevStageSwitcher] DB sync failed, keeping local override active:", err);
      const reason = (err && (err.message || err.statusText)) || "schema enum may not include this stage";
      flashStatus(`Previewing ${SHORT_LABEL[stage] || stage} locally. DB sync failed (${reason}) — preview still works.`, "warn");
      // Suppress unused-var linter warning for previousOverride (it's part
      // of the diagnostic flow even when we don't actively use it).
      void previousOverride;
    } finally {
      setSavingStage(null);
    }
  };

  const handleToggleCondition = (key) => {
    const current = conditionsOverrideActive
      ? conditionsOverride
      : (Array.isArray(effectiveConditions) ? effectiveConditions : []);
    const next = current.includes(key)
      ? current.filter((c) => c !== key)
      : [...current, key];
    writeDevConditionsOverride(next);
    if (onConditionsChange) onConditionsChange(next);
  };

  const handleClearConditions = () => {
    writeDevConditionsOverride(null);
    if (onConditionsChange) onConditionsChange(null);
  };

  return (
    <div ref={panelRef} style={wrap}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Dev — switch life stage"
        style={{
          ...pill,
          background: overrideActive ? "#3A2C1A" : "rgba(58,44,26,0.10)",
          color: overrideActive ? "#F4EDDB" : "#3A2C1A",
        }}
      >
        <Layers size={11} strokeWidth={2.2} />
        <span style={pillEyebrow}>DEV</span>
        <span style={pillStage}>{shortLabel}{conditionsBadge}</span>
      </button>

      {open && (
        <div role="dialog" aria-label="Stage switcher" style={panel}>
          <header style={panelHead}>
            <div>
              <div style={panelEyebrow}>DEV ONLY · STAGE SWITCHER</div>
              <div style={panelTitle}>Preview a stage</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close switcher"
              style={closeBtn}
            >
              <X size={13} strokeWidth={2.2} />
            </button>
          </header>

          <p style={panelHint}>
            Saves to your UserProfile so the Planner reshapes everywhere. Your real stage on file: <strong style={{ color: "#3A2C1A" }}>{realStage || "not set"}</strong>.
          </p>

          {/* Phase 2 QA-fix-bundle-5 — inline status banner (success / error /
              warn). Auto-dismisses after ~4s via flashStatus. */}
          {statusMessage && (
            <div role={statusKind === "error" ? "alert" : "status"} style={{
              ...statusBanner,
              background:
                statusKind === "success" ? "rgba(107,143,90,0.16)"
              : statusKind === "error"   ? "rgba(212,94,82,0.14)"
              : statusKind === "warn"    ? "rgba(168,134,75,0.16)"
              :                            "rgba(58,44,26,0.06)",
              color:
                statusKind === "success" ? "#3F6228"
              : statusKind === "error"   ? "#9A2845"
              : statusKind === "warn"    ? "#A6862B"
              :                            "#3A2C1A",
              borderColor:
                statusKind === "success" ? "rgba(107,143,90,0.40)"
              : statusKind === "error"   ? "rgba(212,94,82,0.34)"
              : statusKind === "warn"    ? "rgba(168,134,75,0.40)"
              :                            "rgba(58,44,26,0.10)",
            }}>
              {statusMessage}
            </div>
          )}

          <div role="list" style={list}>
            {STAGES.map((s) => {
              const isUseReal = s.key === "";
              const isActive = isUseReal
                ? !overrideActive
                : effectiveStage === s.key && overrideActive;
              const isSavingThisRow = savingStage === s.key;
              const otherRowSaving = savingStage && savingStage !== s.key;
              return (
                <button
                  key={s.key || "__real__"}
                  role="listitem"
                  type="button"
                  onClick={() => handlePick(s.key)}
                  disabled={!!savingStage}
                  aria-busy={isSavingThisRow}
                  style={{
                    ...stageRow,
                    background: isActive ? "#3A2C1A" : "transparent",
                    color: isActive ? "#F4EDDB" : "#3A2C1A",
                    borderColor: isActive ? "#3A2C1A" : "rgba(58,44,26,0.10)",
                    fontStyle: isUseReal ? "italic" : "normal",
                    fontFamily: isUseReal
                      ? "'Fraunces', Georgia, serif"
                      : "'Inter', system-ui, sans-serif",
                    opacity: otherRowSaving ? 0.5 : 1,
                    cursor: savingStage ? "wait" : "pointer",
                  }}
                >
                  {s.label}
                  {isSavingThisRow && (
                    <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, opacity: 0.85 }}>
                      Saving…
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Conditions (cross-cutting modifiers) ──────────────────────
              Conditions stack on top of the chosen life_stage — e.g. peri +
              HRT, reproductive + PCOS, postpartum + thyroid. Stored in
              localStorage as a JSON array so the existing UserProfile shape
              is preserved when this lifts to real users. ───────────────── */}
          <div style={conditionsBlock}>
            <div style={conditionsHeadRow}>
              <div style={panelEyebrow}>CONDITIONS (DEV)</div>
              {conditionsOverrideActive && (
                <button
                  type="button"
                  onClick={handleClearConditions}
                  style={clearBtn}
                  aria-label="Clear condition override"
                >
                  Use real
                </button>
              )}
            </div>
            <p style={conditionsHint}>
              Stack on top of stage. Real conditions on file: <strong style={{ color: "#3A2C1A" }}>
                {(realConditions && realConditions.length > 0) ? realConditions.join(" · ") : "none"}
              </strong>.
            </p>
            <div role="list" style={conditionsList}>
              {CONDITIONS.map((c) => {
                const isOn = activeConditions.includes(c.key);
                return (
                  <button
                    key={c.key}
                    role="listitem"
                    type="button"
                    aria-pressed={isOn}
                    onClick={() => handleToggleCondition(c.key)}
                    style={{
                      ...conditionRow,
                      background: isOn ? "rgba(166,134,43,0.18)" : "transparent",
                      color: isOn ? "#3A2C1A" : "#3A2C1A",
                      borderColor: isOn ? "#A6862B" : "rgba(58,44,26,0.10)",
                    }}
                  >
                    <span style={conditionDot} aria-hidden="true">
                      <span style={{
                        ...conditionDotInner,
                        background: isOn ? "#A6862B" : "transparent",
                      }}/>
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={conditionLabel}>{c.label}</span>
                      <span style={conditionHintInline}>{c.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ───── v2 layout flag ─────────────────────────────────────────────
              Phase 2 (2026-05-18) — flips the production Planner between the
              existing layout and the new PlannerV2Shell that uses the
              planner-v2 row components. Persists to localStorage; refreshes
              the page so the new shell mounts cleanly. */}
          <div style={{
            marginTop: 14, paddingTop: 12,
            borderTop: "1px dashed rgba(58,44,26,0.10)",
          }}>
            <div style={panelEyebrow}>LAYOUT (DEV)</div>
            <p style={{
              ...conditionsHint, marginTop: 4, marginBottom: 8,
            }}>
              v2 layout is the default. Flip OFF to fall back to the legacy
              layout. Reloads the page.
            </p>
            <button
              type="button"
              onClick={() => {
                try {
                  const isOn = localStorage.getItem("femwell_planner_v2") !== "false";
                  localStorage.setItem("femwell_planner_v2", isOn ? "false" : "true");
                } catch { /* silent */ }
                try { window.location.reload(); } catch { /* silent */ }
              }}
              style={(() => {
                let on = true;
                try { on = localStorage.getItem("femwell_planner_v2") !== "false"; } catch { /* silent */ }
                return {
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 12px", borderRadius: 9999,
                  background: on ? "#3A2C1A" : "transparent",
                  color: on ? "#F4EDDB" : "#3A2C1A",
                  border: `1px solid ${on ? "#3A2C1A" : "rgba(58,44,26,0.20)"}`,
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                  width: "100%", justifyContent: "space-between",
                };
              })()}
              aria-label="Toggle Planner v2 layout"
            >
              <span>New Planner (v2)</span>
              <span style={(() => {
                let on = true;
                try { on = localStorage.getItem("femwell_planner_v2") !== "false"; } catch { /* silent */ }
                return {
                  fontSize: 10, letterSpacing: "0.10em",
                  padding: "2px 8px", borderRadius: 9999,
                  background: on ? "rgba(244,237,219,0.18)" : "rgba(58,44,26,0.08)",
                };
              })()}>{(() => {
                let on = true;
                try { on = localStorage.getItem("femwell_planner_v2") !== "false"; } catch { /* silent */ }
                return on ? "ON" : "OFF";
              })()}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const wrap = {
  position: "relative",
  display: "inline-block",
};
const pill = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "5px 11px",
  borderRadius: 9999,
  border: "1px solid rgba(58,44,26,0.18)",
  cursor: "pointer",
  fontFamily: "'Inter', system-ui, sans-serif",
  transition: "all 0.2s ease",
  minHeight: 28,
};
const pillEyebrow = {
  fontSize: 8.5,
  fontWeight: 700,
  letterSpacing: "0.16em",
  opacity: 0.7,
};
const pillStage = {
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: "0.04em",
};
const panel = {
  position: "absolute",
  top: "calc(100% + 8px)",
  right: 0,
  zIndex: 50,
  background: "#FBF6E6",
  border: "1px solid rgba(58,44,26,0.12)",
  borderRadius: 14,
  boxShadow: "0 8px 24px rgba(58,44,26,0.16)",
  padding: 14,
  minWidth: 260,
  maxWidth: "calc(100vw - 32px)",
};
const panelHead = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 8,
  marginBottom: 8,
};
const panelEyebrow = {
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: 8.5,
  fontWeight: 700,
  letterSpacing: "0.20em",
  color: "#A6862B",
  textTransform: "uppercase",
};
const panelTitle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 16,
  fontWeight: 500,
  color: "#3A2C1A",
  fontStyle: "italic",
  marginTop: 2,
};
const closeBtn = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 26,
  height: 26,
  borderRadius: 9999,
  background: "transparent",
  border: "1px solid rgba(58,44,26,0.12)",
  cursor: "pointer",
  color: "#6B5840",
};
const panelHint = {
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: 11,
  color: "#6B5840",
  lineHeight: 1.5,
  margin: "0 0 10px",
};
const statusBanner = {
  border: "1px solid",
  borderRadius: 8,
  padding: "6px 10px",
  fontSize: 11,
  fontWeight: 600,
  fontFamily: "'Inter', system-ui, sans-serif",
  lineHeight: 1.4,
  marginBottom: 8,
};
const list = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};
const stageRow = {
  textAlign: "left",
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  minHeight: 32,
};
const conditionsBlock = {
  marginTop: 14,
  paddingTop: 12,
  borderTop: "1px dashed rgba(58,44,26,0.16)",
};
const conditionsHeadRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 8,
  marginBottom: 6,
};
const conditionsHint = {
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: 10.5,
  color: "#6B5840",
  lineHeight: 1.5,
  margin: "0 0 8px",
};
const conditionsList = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};
const conditionRow = {
  display: "flex",
  alignItems: "flex-start",
  gap: 8,
  textAlign: "left",
  padding: "7px 10px",
  borderRadius: 8,
  border: "1px solid",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "'Inter', system-ui, sans-serif",
  minHeight: 32,
};
const conditionDot = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 14,
  height: 14,
  borderRadius: 4,
  border: "1.5px solid rgba(58,44,26,0.35)",
  marginTop: 1,
  flexShrink: 0,
};
const conditionDotInner = {
  width: 7,
  height: 7,
  borderRadius: 2,
};
const conditionLabel = {
  display: "block",
  fontSize: 12.5,
  fontWeight: 700,
  lineHeight: 1.25,
};
const conditionHintInline = {
  display: "block",
  marginTop: 1,
  fontSize: 10.5,
  fontWeight: 400,
  color: "#6B5840",
  lineHeight: 1.35,
};
const clearBtn = {
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  padding: "3px 8px",
  borderRadius: 9999,
  border: "1px solid rgba(58,44,26,0.18)",
  background: "transparent",
  color: "#6B5840",
  cursor: "pointer",
};
