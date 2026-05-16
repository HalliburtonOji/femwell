// ─────────────────────────────────────────────────────────────────────────────
// PlannerTabs — segmented control for Planner Phase 2 two-tab split.
// Spec ref: claude-state/base44_mps/2026-05-14_planner_phase2/spec_v2.md §C0.
//
// Tabs: Today (default) · Cycle.
// URL state: ?view=today|cycle (omitted when value is default).
// Persistence: writes last view to localStorage.fw_planner_view so a return
// visit lands on the same tab even with no URL param.
// Cross-tab deep links: callers can pass ?view=cycle&scrollTo=<id> to open the
// Cycle tab and scroll to a named anchor (handled in Planner.jsx).
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "fw_planner_view";
const VIEWS = ["today", "cycle"];
const DEFAULT_VIEW = "today";

export function resolveViewId(raw) {
  if (raw && VIEWS.includes(raw)) return raw;
  return DEFAULT_VIEW;
}

export function readStoredView() {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return resolveViewId(v);
  } catch {
    return DEFAULT_VIEW;
  }
}

export function writeStoredView(view) {
  try {
    window.localStorage.setItem(STORAGE_KEY, view);
  } catch {
    /* silent — non-critical */
  }
}

// Reads `?view=` from URL, falling back to localStorage, falling back to today.
// Used by Planner.jsx on first mount.
export function readInitialView() {
  try {
    const p = new URLSearchParams(window.location.search).get("view");
    if (p) return resolveViewId(p);
  } catch { /* silent */ }
  return readStoredView();
}

export default function PlannerTabs({ view, onChange, plannerConfig }) {
  // Life Stage adapter — the Cycle tab is renamed per stage:
  //   Patterns  (peri / meno), Journey (pregnancy), Clinical (TTC),
  //   Hormones  (PCOS modifier), Recovery (postpartum), Health (post-meno).
  // Default "Cycle" is used for reproductive years + when no config.
  const cycleLabel = plannerConfig?.cycleTabName || "Cycle";
  return (
    <div role="tablist" aria-label="Planner view" style={wrapStyle}>
      {VIEWS.map((id) => {
        const active = id === view;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={active}
            aria-controls={`planner-panel-${id}`}
            id={`planner-tab-${id}`}
            onClick={() => onChange(id)}
            style={{
              ...tabBtnStyle,
              // Le Menu × Phase Sun — espresso pill, italic Fraunces when active.
              backgroundColor: active ? "#3A2C1A" : "transparent",
              color: active ? "#F4EDDB" : "#6B5840",
              fontWeight: active ? 700 : 600,
              fontStyle: active ? "italic" : "normal",
              fontFamily: active ? "'Fraunces', Georgia, serif" : tabBtnStyle.fontFamily,
            }}
          >
            {id === "today" ? "Today" : cycleLabel}
          </button>
        );
      })}
    </div>
  );
}

const wrapStyle = {
  display: "inline-flex",
  gap: 4,
  padding: 4,
  borderRadius: 9999,
  border: "1px solid var(--border, rgba(74,42,58,0.10))",
  background: "var(--surface, #FFFFFF)",
  marginTop: 10,
};

const tabBtnStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  letterSpacing: "0.04em",
  padding: "7px 18px",
  borderRadius: 9999,
  border: "none",
  cursor: "pointer",
  // Le Menu polish — smoother tab switch (0.2s vs 140ms)
  transition: "all 0.2s ease",
  minWidth: 84,
  textAlign: "center",
};
