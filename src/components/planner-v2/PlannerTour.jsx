// PlannerTour — first-run coach-marks for /Planner.
//
// Gate: localStorage.getItem('planner_tour_v1'). If null, the tour
// renders. Skip / completion / Done set 'planner_tour_v1' = 'done'.
//
// Five steps, each:
//   - dark overlay (rgba 58,44,26,0.55) covers the whole screen
//   - a transparent rect "spotlight" at the target element's bounding
//     box, with a soft drop-shadow to dim everything else
//   - a tooltip card (cream bg, espresso text, gold Next button)
//     positioned just below the spotlight
//
// Spotlight is implemented as a single absolute-positioned <div> with
// `box-shadow: 0 0 0 9999px rgba(...)` — the cheapest CSS-only cutout.
// No portal needed; mounted at the top of PlannerV2Shell.
//
// Targets resolved via `data-tour="<id>"` attribute on the rows:
//   hero    — the Insights hero card-stack
//   yourday — the Your Day card-stack
//   body    — the Body Today row
//   rituals — the Rituals row
//
// Step 5 has no target; it renders centered as a closing card.

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "planner_tour_v1";

const C = {
  cream:    "#F4EDDB",
  paperHi:  "#FFFFFF",
  espresso: "#3A2C1A",
  muted:    "#9B8B7A",
  gold:     "#D4AF37",
  goldDeep: "#A6862B",
  border:   "#D4C9B4",
};

function STEPS(name) {
  return [
    { tour: "hero",    title: `Good morning, ${name}.`, body: "This is your Jess greeting — she updates based on your day." },
    { tour: "yourday", title: "Your day in cards",     body: "Tap to move through. Each slot holds tasks, meals and logs for that part of the day." },
    { tour: "body",    title: "Log how you feel",     body: "Mood, energy, symptoms — it all syncs to your health timeline." },
    { tour: "rituals", title: "Your rituals live here", body: "Complete them as you go. Streaks track quietly in the background." },
    { tour: null,      title: "That's your Planner.",   body: "It's yours — it learns as you log. Tap anywhere to start." },
  ];
}

export default function PlannerTour({ name = "there" }) {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);

  // Open the tour on mount if the user hasn't seen it.
  useEffect(() => {
    let done = null;
    try { done = window.localStorage?.getItem(STORAGE_KEY); } catch {}
    if (!done) {
      // Tiny delay so the page has time to render its rows before we
      // measure them.
      const t = window.setTimeout(() => setActive(true), 800);
      return () => window.clearTimeout(t);
    }
  }, []);

  const steps = STEPS(name);

  // Measure the target element for the current step.
  useEffect(() => {
    if (!active) return;
    const s = steps[step];
    if (!s || !s.tour) { setRect(null); return; }
    function measure() {
      const el = document.querySelector(`[data-tour="${s.tour}"]`);
      if (!el) { setRect(null); return; }
      const b = el.getBoundingClientRect();
      setRect({
        top:    b.top + window.scrollY - 8,
        left:   b.left + window.scrollX - 8,
        width:  b.width + 16,
        height: b.height + 16,
      });
      // Scroll the target into view if it's offscreen.
      const visible = b.top > 0 && b.bottom < window.innerHeight;
      if (!visible) {
        window.scrollTo({
          top: b.top + window.scrollY - 80,
          behavior: "smooth",
        });
      }
    }
    measure();
    // Re-measure on resize / scroll (debounced via rAF).
    let raf;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [active, step, steps]);

  const finish = useCallback(() => {
    try { window.localStorage?.setItem(STORAGE_KEY, "done"); } catch {}
    setActive(false);
  }, []);

  if (!active) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;
  // For final centered step (no spotlight) we just show the tooltip
  // in the middle of the screen.
  const hasSpotlight = !!rect;

  // Tooltip placement: just below the spotlight by default; if the
  // spotlight is in the bottom half of the viewport, place it above.
  let tipTop = null;
  let tipBottom = null;
  if (hasSpotlight) {
    const viewportH = typeof window !== "undefined" ? window.innerHeight : 800;
    const spotBottomInViewport = (rect.top - window.scrollY) + rect.height;
    if (spotBottomInViewport + 220 < viewportH) {
      tipTop = rect.top + rect.height + 14;
    } else {
      tipTop = Math.max(rect.top - 220, window.scrollY + 24);
    }
  }

  return (
    <div
      role="dialog"
      aria-label="Planner walkthrough"
      aria-modal="true"
      // Tap outside the tooltip dismisses early.
      onClick={(e) => {
        // Tooltip swallows its own click; this is the overlay catch.
        if (e.target === e.currentTarget) finish();
      }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: hasSpotlight ? "transparent" : "rgba(58,44,26,0.55)",
        pointerEvents: "auto",
        animation: "plannerTourFadeIn 240ms ease-out",
      }}
    >
      {/* Spotlight cutout — a single positioned div with a huge
          inset-shadow that paints the dim everywhere outside it. */}
      {hasSpotlight && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top:    rect.top - window.scrollY,
            left:   rect.left - window.scrollX,
            width:  rect.width,
            height: rect.height,
            borderRadius: 24,
            boxShadow: "0 0 0 9999px rgba(58,44,26,0.55)",
            transition: "all 280ms cubic-bezier(0.16,1,0.3,1)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          maxWidth: 320,
          left: hasSpotlight
            ? Math.max(16, Math.min((typeof window !== "undefined" ? window.innerWidth : 400) - 16 - 320, (rect.left - window.scrollX) + (rect.width / 2) - 160))
            : "50%",
          top: hasSpotlight ? (tipTop - window.scrollY) : "50%",
          transform: hasSpotlight ? "none" : "translate(-50%, -50%)",
          background: C.cream,
          color: C.espresso,
          borderRadius: 16,
          padding: "18px 18px 16px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.32), 0 -1px 0 rgba(212,175,55,0.4) inset, 0 2px 6px rgba(58,44,26,0.16)",
          border: `1px solid ${C.border}`,
          animation: "plannerTourSlideIn 320ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <p style={{
          margin: "0 0 4px", fontSize: 10, fontWeight: 700,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: C.muted, fontFamily: "'Inter', sans-serif",
        }}>{`${step + 1} of ${steps.length}`}</p>
        <h2 style={{
          margin: "0 0 8px",
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: 19, fontWeight: 600, color: C.espresso,
          letterSpacing: "-0.01em", lineHeight: 1.3,
        }}>{current.title}</h2>
        <p style={{
          margin: "0 0 14px", fontSize: 13.5, lineHeight: 1.5,
          color: C.espresso, fontFamily: "'Inter', sans-serif",
        }}>{current.body}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {!isLast ? (
            <button
              type="button"
              onClick={finish}
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                color: C.muted, fontFamily: "'Inter', sans-serif",
                fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
                padding: 0,
              }}
            >Skip</button>
          ) : <span />}
          <button
            type="button"
            onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
            style={{
              padding: "9px 18px", borderRadius: 9999,
              background: C.gold, color: C.espresso,
              border: "none", cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              fontSize: 12.5, fontWeight: 700, letterSpacing: "0.04em",
            }}
          >{isLast ? "Got it" : "Next →"}</button>
        </div>
      </div>

      <style>{`
        @keyframes plannerTourFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes plannerTourSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
