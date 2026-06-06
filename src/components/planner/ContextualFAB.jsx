// ContextualFAB — Phase 3 P3-1
//
// Floating "+" pill at bottom-right of the Planner. The label changes
// based on which row is currently most visible in the viewport. We
// observe each row's `data-tour="..."` wrapper via IntersectionObserver
// and pick the highest-intersectingRatio match each tick.
//
// Mapping (tour-name → logger action + label):
//   lists       → "Add Task"  → openLogger("task")
//   nourishment → "Log Meal"  → openLogger("meal")
//   rituals     → "Log Habit" → openLogger("ritual")
//   body        → "Check In"  → openLogger("checkin")
//   care        → "Log Med"   → openLogger("med")
//   default     → "Log"       → openLogger()
//
// We don't run on rows that already have their own header + Add (My
// Lists). The label still updates so the FAB feels alive while
// scrolling past them.

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { openLogger } from "@/components/UniversalLogger";

const TOUR_TO_ACTION = {
  lists:       { label: "Add Task",  type: "task" },
  nourishment: { label: "Log Meal",  type: "meal" },
  rituals:     { label: "Log Habit", type: "ritual" },
  body:        { label: "Check In",  type: "checkin" },
  care:        { label: "Log Med",   type: "med" },
};
const DEFAULT_ACTION = { label: "Log", type: undefined };

export default function ContextualFAB({ scrollRoot = null } = {}) {
  const [active, setActive] = useState(DEFAULT_ACTION);
  const ratiosRef = useRef(new Map());

  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return;
    // Scan known tour wrappers — Phase 1 added `data-tour="stage"` /
    // `data-tour="conditions"`; the original demo already had `body`,
    // `rituals`, `yourday`, `hero`. We add new wrappers here for any
    // row we care about and the observer just attaches to whichever
    // ones it finds on the page at mount.
    const TOUR_KEYS = ["lists", "nourishment", "rituals", "body", "care"];
    const nodes = TOUR_KEYS
      .map((key) => ({
        key,
        el: document.querySelector(`[data-tour="${key}"]`),
      }))
      .filter((x) => !!x.el);
    if (nodes.length === 0) return;
    ratiosRef.current = new Map(nodes.map(({ key }) => [key, 0]));

    const obs = new IntersectionObserver((entries) => {
      for (const ent of entries) {
        const key = ent.target.getAttribute("data-tour");
        if (!key) continue;
        ratiosRef.current.set(key, ent.intersectionRatio);
      }
      // Pick the tour key with the highest current ratio.
      let bestKey = null;
      let bestRatio = 0.05; // small floor so 0% doesn't flip-flop the label
      for (const [k, r] of ratiosRef.current.entries()) {
        if (r > bestRatio) { bestKey = k; bestRatio = r; }
      }
      setActive(bestKey ? TOUR_TO_ACTION[bestKey] || DEFAULT_ACTION : DEFAULT_ACTION);
    }, {
      root: scrollRoot || null,
      threshold: [0, 0.15, 0.35, 0.55, 0.75, 1],
    });
    nodes.forEach(({ el }) => obs.observe(el));
    return () => { try { obs.disconnect(); } catch { /* swallow */ } };
  }, [scrollRoot]);

  function handleTap() {
    try { openLogger(active.type); } catch { /* swallow */ }
  }

  return (
    <button
      type="button"
      onClick={handleTap}
      aria-label={active.label}
      style={{
        position: "fixed",
        bottom: "max(20px, calc(env(safe-area-inset-bottom) + 90px))",
        right: 20,
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "12px 18px 12px 14px",
        borderRadius: 9999,
        background: "linear-gradient(135deg, #2A1E0E 0%, #3A2C1A 100%)",
        color: "#F4EDDB",
        border: "1px solid rgba(212,175,55,0.45)",
        boxShadow: "0 10px 28px rgba(58,44,26,0.32), 0 2px 6px rgba(58,44,26,0.20)",
        cursor: "pointer",
        fontSize: 13.5, fontWeight: 700,
        letterSpacing: "0.02em",
        zIndex: 80,
        transition: "transform 200ms ease, box-shadow 200ms ease",
      }}
    >
      <span aria-hidden style={{
        width: 26, height: 26, borderRadius: 9999,
        background: "#D4AF37", color: "#3A2C1A",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}>
        <Plus size={16} />
      </span>
      {active.label}
    </button>
  );
}
