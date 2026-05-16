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

export const DEV_STAGE_KEY = "femwell_dev_life_stage";
// Custom event for same-tab reactivity. The native "storage" event only fires
// in OTHER tabs of the same origin — to update *this* tab's React tree when
// localStorage changes (from a click here, from devtools, from any future
// surface that wants to switch stages), surfaces dispatch this event and the
// Planner listens for it. See Planner.jsx useEffect.
export const DEV_STAGE_EVENT = "femwell_dev_stage_change";

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

export function readDevStageOverride() {
  try {
    if (typeof window === "undefined") return null;
    const v = window.localStorage.getItem(DEV_STAGE_KEY);
    if (!v) return null;
    return STAGES.some((s) => s.key && s.key === v) ? v : null;
  } catch {
    return null;
  }
}

export function writeDevStageOverride(stage) {
  try {
    if (typeof window === "undefined") return;
    if (stage) window.localStorage.setItem(DEV_STAGE_KEY, stage);
    else window.localStorage.removeItem(DEV_STAGE_KEY);
    // Same-tab reactivity — Planner listens for this custom event and
    // re-renders the entire tree. We dispatch INSIDE writeDevStageOverride
    // so any caller (click handler, devtools console, future surface) gets
    // the re-render for free without having to remember to fire the event.
    window.dispatchEvent(new CustomEvent(DEV_STAGE_EVENT, { detail: stage || null }));
  } catch {
    /* silent */
  }
}

export default function DevStageSwitcher({ effectiveStage, realStage, onChange }) {
  const [open, setOpen] = useState(false);
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

  const overrideActive = !!readDevStageOverride();
  const shortLabel = SHORT_LABEL[effectiveStage] || "Stage";

  const handlePick = (stage) => {
    writeDevStageOverride(stage);
    onChange(stage || null);
    setOpen(false);
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
        <span style={pillStage}>{shortLabel}</span>
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
            Override your real life_stage for testing. Stored in your browser only — no schema change needed. Your real stage on file: <strong style={{ color: "#3A2C1A" }}>{realStage || "not set"}</strong>.
          </p>

          <div role="list" style={list}>
            {STAGES.map((s) => {
              const isUseReal = s.key === "";
              const isActive = isUseReal
                ? !overrideActive
                : effectiveStage === s.key && overrideActive;
              return (
                <button
                  key={s.key || "__real__"}
                  role="listitem"
                  type="button"
                  onClick={() => handlePick(s.key)}
                  style={{
                    ...stageRow,
                    background: isActive ? "#3A2C1A" : "transparent",
                    color: isActive ? "#F4EDDB" : "#3A2C1A",
                    borderColor: isActive ? "#3A2C1A" : "rgba(58,44,26,0.10)",
                    fontStyle: isUseReal ? "italic" : "normal",
                    fontFamily: isUseReal
                      ? "'Fraunces', Georgia, serif"
                      : "'Inter', system-ui, sans-serif",
                  }}
                >
                  {s.label}
                </button>
              );
            })}
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
