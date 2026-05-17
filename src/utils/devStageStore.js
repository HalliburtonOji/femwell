// ─────────────────────────────────────────────────────────────────────────────
// devStageStore — module-level singleton for the DEV stage / conditions
// override. Phase 2 QA-fix-bundle-8.
//
// Why this exists:
//   Three prior attempts at making the Planner re-render when the
//   DevStageSwitcher writes a new stage all failed in production despite
//   reading correctly in static analysis. Symptoms:
//     - postpartum + perimenopause worked one walk, regressed the next
//     - pregnant-t2 never worked even on the same walks
//     - WeeklyInsightCard's stage-change banner fired (it does its own
//       UserProfile fetch) but Planner's card mounts did not re-render
//   Most plausible cause: stale closures over setDevStageOverride or
//   React.memo / route-transition timing missing the CustomEvent dispatch.
//
// This module bypasses the event bus entirely. Components subscribe via
// the export below; writes notify all live subscribers synchronously
// before the function returns. Survives component unmounts (subscribers
// are module-scoped). No CustomEvent / dispatchEvent / addEventListener.
// No useState in a stale closure can mask the new value because the
// subscribers are called with the literal new value.
//
// Backwards-compatible exports — older callsites that import
// readDevStageOverride / writeDevStageOverride / DEV_STAGE_EVENT etc
// from DevStageSwitcher.jsx still work; that file now re-exports from
// here so all paths converge on the same store.
// ─────────────────────────────────────────────────────────────────────────────

export const DEV_STAGE_KEY      = "femwell_dev_life_stage";
export const DEV_CONDITIONS_KEY = "femwell_dev_conditions";

// Custom event names kept as exported constants so old imports don't break.
// The store doesn't use them internally — it calls subscribers directly.
export const DEV_STAGE_EVENT      = "femwell_dev_stage_change";
export const DEV_CONDITIONS_EVENT = "femwell_dev_conditions_change";

const stageListeners      = new Set();
const conditionsListeners = new Set();

function safeGet(key) {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    if (typeof window === "undefined") return;
    if (value === null || value === undefined || value === "") {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, String(value));
    }
  } catch {
    /* silent */
  }
}

// ── Stage ────────────────────────────────────────────────────────────────────

export function readDevStage() {
  const v = safeGet(DEV_STAGE_KEY);
  return v && v.length > 0 ? v : "";
}

export function writeDevStage(stage) {
  const next = stage || "";
  safeSet(DEV_STAGE_KEY, next);
  // Notify subscribers synchronously with the literal new value.
  stageListeners.forEach((fn) => {
    try { fn(next || null); } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("[devStageStore] subscriber threw:", e);
    }
  });
  // Also fire the legacy CustomEvent for any third party / dev-tools
  // surface that's still listening to the old event-bus name.
  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(DEV_STAGE_EVENT, { detail: next || null }));
    }
  } catch {
    /* silent */
  }
}

export function subscribeDevStage(fn) {
  if (typeof fn !== "function") return () => {};
  stageListeners.add(fn);
  return () => { stageListeners.delete(fn); };
}

// ── Conditions ───────────────────────────────────────────────────────────────

export function readDevConditions() {
  const raw = safeGet(DEV_CONDITIONS_KEY);
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeDevConditions(conditions) {
  if (conditions === null || conditions === undefined) {
    safeSet(DEV_CONDITIONS_KEY, null);
  } else {
    const safe = Array.isArray(conditions) ? conditions : [];
    safeSet(DEV_CONDITIONS_KEY, JSON.stringify(safe));
  }
  const value = conditions === null || conditions === undefined ? null : (Array.isArray(conditions) ? conditions : []);
  conditionsListeners.forEach((fn) => {
    try { fn(value); } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("[devStageStore] conditions subscriber threw:", e);
    }
  });
  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(DEV_CONDITIONS_EVENT, { detail: value }));
    }
  } catch {
    /* silent */
  }
}

export function subscribeDevConditions(fn) {
  if (typeof fn !== "function") return () => {};
  conditionsListeners.add(fn);
  return () => { conditionsListeners.delete(fn); };
}

// ── Legacy aliases — keep older callsites compiling ──────────────────────────
// readDevStageOverride / writeDevStageOverride / readDevConditionsOverride /
// writeDevConditionsOverride. The "Override" suffix is the older naming.
// These are pure re-exports — same store, same listeners.

export function readDevStageOverride() {
  const v = readDevStage();
  return v || null;
}

export function writeDevStageOverride(stage) {
  writeDevStage(stage);
}

export function readDevConditionsOverride() {
  return readDevConditions();
}

export function writeDevConditionsOverride(conditions) {
  writeDevConditions(conditions);
}
