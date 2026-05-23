// PlannerSettingsSheet — Phase 3 P3-3
//
// Bottom sheet for personalising the Planner. Two controls per row:
//   • Visibility toggle  — pill switch (on / off)
//   • Reorder            — ▲ / ▼ buttons (drag-equivalent for touch
//                          without bringing in a drag-and-drop lib)
//
// Persistence is dual: writes to `UserProfile.plannerSettings`
// (best-effort — if the schema field doesn't exist yet base44 silently
// drops it, but the writes are idempotent) AND mirrors to
// localStorage `femwell_planner_settings_<userId>` so the UI works
// immediately on the next render even without the schema field.
//
// Shape:
//   {
//     hidden: [ "tonight", "care", ... ],   // row keys NOT to render
//     order:  [ "hero", "lists", ... ],     // full row order; rows not
//                                            // listed render at the end
//                                            // in default order.
//   }

import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, ChevronUp, ChevronDown, Check, RotateCcw } from "lucide-react";

const C = {
  cream:    "#F4EDDB",
  paperHi:  "#EDE6D5",
  espresso: "#3A2C1A",
  muted:    "#9B8B7A",
  gold:     "#D4AF37",
  sage:     "#8FAF8F",
  border:   "#D4C9B4",
};

// Canonical row keys + labels. Keep in sync with `data-tour` markers
// in PlannerV2Shell. `core: true` rows can't be hidden — the Hero and
// Schedule rows are too foundational.
//
// `morning` (Morning Check-in Card) was removed from the Planner on
// 2026-05-23. The Settings sheet's render loop has a defensive
// `if (!def) return null` so any saved order arrays from before that
// date silently drop the entry when it's not in this list.
export const PLANNER_ROW_DEFINITIONS = [
  { key: "hero",         label: "Insights hero",           core: true  },
  { key: "lists",        label: "My lists",                core: false },
  { key: "schedule",     label: "Schedule & cycle",        core: true  },
  { key: "yourday",      label: "Your day (time of day)",  core: false },
  { key: "body",         label: "Your body today",         core: false },
  { key: "stage",        label: "Life stage",              core: false },
  { key: "conditions",   label: "Conditions",              core: false },
  { key: "rituals",      label: "Rituals",                 core: false },
  { key: "nourishment",  label: "Nourishment",             core: false },
  { key: "mind",         label: "Mind & insight",          core: false },
  { key: "care",         label: "Care",                    core: false },
  { key: "tonight",      label: "Tonight",                 core: false },
];

export const DEFAULT_PLANNER_SETTINGS = {
  hidden: [],
  order: PLANNER_ROW_DEFINITIONS.map((r) => r.key),
};

export function lsKey(userId) {
  return `femwell_planner_settings_${userId || "anon"}`;
}

export function loadPlannerSettings(userId) {
  try {
    const raw = window.localStorage.getItem(lsKey(userId));
    if (!raw) return DEFAULT_PLANNER_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      hidden: Array.isArray(parsed.hidden) ? parsed.hidden : [],
      order:  Array.isArray(parsed.order)  ? parsed.order  : DEFAULT_PLANNER_SETTINGS.order,
    };
  } catch { return DEFAULT_PLANNER_SETTINGS; }
}

export function savePlannerSettings(userId, settings, profileId) {
  // Mirror to localStorage immediately so the next render sees it.
  try {
    window.localStorage.setItem(lsKey(userId), JSON.stringify(settings));
  } catch { /* swallow quota */ }
  // Best-effort UserProfile update. Field may not exist yet; base44
  // ignores unknown fields silently.
  if (profileId) {
    base44.entities.UserProfile.update(profileId, { plannerSettings: settings })
      .catch(() => { /* schema field may not exist — localStorage carries it */ });
  }
}

export default function PlannerSettingsSheet({ open, onClose, userId, profileId, settings, onChange }) {
  const [draft, setDraft] = useState(settings || DEFAULT_PLANNER_SETTINGS);

  useEffect(() => {
    if (open) setDraft(settings || DEFAULT_PLANNER_SETTINGS);
  }, [open, settings]);

  if (!open) return null;

  // Order: keys present in settings.order first, then any new rows that
  // haven't been included yet in their default position.
  const orderedKeys = (() => {
    const seen = new Set();
    const out = [];
    for (const k of draft.order || []) {
      if (!seen.has(k) && PLANNER_ROW_DEFINITIONS.find((r) => r.key === k)) {
        seen.add(k);
        out.push(k);
      }
    }
    for (const r of PLANNER_ROW_DEFINITIONS) {
      if (!seen.has(r.key)) out.push(r.key);
    }
    return out;
  })();

  function toggle(key) {
    const def = PLANNER_ROW_DEFINITIONS.find((r) => r.key === key);
    if (def?.core) return;
    const next = { ...draft, hidden: draft.hidden.includes(key)
      ? draft.hidden.filter((k) => k !== key)
      : [...draft.hidden, key] };
    setDraft(next);
  }

  function move(key, dir) {
    const idx = orderedKeys.indexOf(key);
    if (idx < 0) return;
    const swapWith = idx + dir;
    if (swapWith < 0 || swapWith >= orderedKeys.length) return;
    const nextOrder = [...orderedKeys];
    [nextOrder[idx], nextOrder[swapWith]] = [nextOrder[swapWith], nextOrder[idx]];
    setDraft({ ...draft, order: nextOrder });
  }

  function handleReset() {
    setDraft(DEFAULT_PLANNER_SETTINGS);
  }

  function handleSave() {
    savePlannerSettings(userId, draft, profileId);
    try { onChange && onChange(draft); } catch { /* swallow */ }
    onClose();
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(58,44,26,0.46)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        zIndex: 110,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 520,
          maxHeight: "84vh",
          background: C.cream,
          borderRadius: "20px 20px 0 0",
          boxShadow: "0 -12px 36px rgba(58,44,26,0.30)",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "16px 16px 10px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div>
            <p style={{
              margin: 0, fontSize: 10, fontWeight: 700,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: C.muted, fontFamily: "'Inter', sans-serif",
            }}>Personalise</p>
            <h2 style={{
              margin: "2px 0 0", fontSize: 18, fontWeight: 500,
              fontFamily: "'Fraunces', Georgia, serif", color: C.espresso,
            }}>Planner rows</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32, height: 32, borderRadius: 9999,
              background: "rgba(58,44,26,0.06)", border: "none",
              color: C.espresso, cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}
          ><X size={14} /></button>
        </div>

        {/* List */}
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "10px 12px 4px",
        }}>
          {orderedKeys.map((key) => {
            const def = PLANNER_ROW_DEFINITIONS.find((r) => r.key === key);
            if (!def) return null;
            const hidden = draft.hidden.includes(key);
            const idx = orderedKeys.indexOf(key);
            const canUp = idx > 0;
            const canDown = idx < orderedKeys.length - 1;
            return (
              <div key={key} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 10px",
                borderRadius: 12,
                background: hidden ? "rgba(58,44,26,0.04)" : C.paperHi,
                border: `1px solid ${C.border}`,
                marginBottom: 6,
                opacity: hidden ? 0.55 : 1,
              }}>
                {/* Reorder */}
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <button
                    type="button"
                    onClick={() => move(key, -1)}
                    disabled={!canUp}
                    aria-label="Move up"
                    style={reorderBtn(canUp)}
                  ><ChevronUp size={12} /></button>
                  <button
                    type="button"
                    onClick={() => move(key, 1)}
                    disabled={!canDown}
                    aria-label="Move down"
                    style={reorderBtn(canDown)}
                  ><ChevronDown size={12} /></button>
                </div>

                {/* Label */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    margin: 0, fontSize: 14, color: C.espresso,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: 600,
                    textDecoration: hidden ? "line-through" : "none",
                  }}>{def.label}</p>
                  {def.core && (
                    <p style={{
                      margin: "2px 0 0", fontSize: 10, color: C.muted,
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontStyle: "italic",
                    }}>Always shown</p>
                  )}
                </div>

                {/* Visibility */}
                <button
                  type="button"
                  onClick={() => toggle(key)}
                  disabled={def.core}
                  aria-pressed={!hidden}
                  aria-label={`Toggle ${def.label}`}
                  style={{
                    width: 44, height: 24, borderRadius: 9999,
                    background: hidden ? "rgba(58,44,26,0.18)" : C.sage,
                    border: "none",
                    cursor: def.core ? "not-allowed" : "pointer",
                    position: "relative",
                    opacity: def.core ? 0.4 : 1,
                    transition: "background 200ms ease",
                  }}
                >
                  <span style={{
                    position: "absolute", top: 2, left: hidden ? 2 : 22,
                    width: 20, height: 20, borderRadius: 9999,
                    background: C.cream,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.20)",
                    transition: "left 200ms ease",
                  }} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: "10px 16px max(16px, env(safe-area-inset-bottom))",
          borderTop: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <button
            type="button"
            onClick={handleReset}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 12px", borderRadius: 9999,
              background: "transparent", border: `1px solid ${C.muted}55`,
              color: C.muted, cursor: "pointer",
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 12, fontWeight: 600,
            }}
          ><RotateCcw size={12} /> Reset</button>
          <div style={{ flex: 1 }} />
          <button
            type="button"
            onClick={handleSave}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "10px 18px", borderRadius: 9999,
              background: C.espresso, color: C.cream, border: "none",
              cursor: "pointer",
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 13, fontWeight: 700,
            }}
          ><Check size={13} /> Save</button>
        </div>
      </div>
    </div>
  );
}

function reorderBtn(enabled) {
  return {
    width: 22, height: 22, borderRadius: 6,
    background: enabled ? "rgba(58,44,26,0.10)" : "rgba(58,44,26,0.03)",
    border: "none",
    color: enabled ? C.espresso : C.muted,
    cursor: enabled ? "pointer" : "default",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: 0,
  };
}
