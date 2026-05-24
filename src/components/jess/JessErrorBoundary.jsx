// JessErrorBoundary — Sprint 1 S1-1 (+ reused by S3-3)
//
// Single React error boundary for every Jess surface. Catches render-
// time errors so a single bad message / null deref / TDZ glitch in one
// card can't take down the page that hosts it. Two presentation modes:
//
//   variant="panel"  — full chat-shell fallback. Friendly tap-to-retry
//                      copy in the cream/espresso brand. Used to wrap
//                      JessDemoPanel.
//   variant="quiet"  — small, low-noise placeholder. Used to wrap the
//                      passive Jess cards (Pattern Nudge, Phase Prep,
//                      Weekly Summary, Patient Summary, Journal
//                      Prompt) so a crash in one card never breaks
//                      the page around it.
//   variant="hidden" — renders nothing on crash. Optional graceful
//                      degrade for surfaces that shouldn't even
//                      occupy a slot if they fail.
//
// Resetting: each click of "Try again" bumps an internal `resetKey`
// and re-mounts children. If the same error happens twice in a row
// we surface a "Jess will be back shortly" message instead of looping
// the user through the same broken state.

import React from "react";
import { RotateCcw } from "lucide-react";

const C = {
  cream:    "#F4EDDB",
  paperHi:  "#EDE6D5",
  espresso: "#3A2C1A",
  muted:    "#9B8B7A",
  gold:     "#D4AF37",
  border:   "#D4C9B4",
};

export default class JessErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: "",
      retryCount: 0,
      resetKey: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: String(error?.message || error || "unknown"),
    };
  }

  componentDidCatch(error, info) {
    const record = {
      label: this.props.label || "Jess surface",
      message: String(error?.message || error),
      stack: String(error?.stack || "").slice(0, 2000),
      componentStack: String(info?.componentStack || "").slice(0, 1200),
      ts: new Date().toISOString(),
      href: typeof window !== "undefined" ? String(window.location?.href || "") : "",
    };
    try {
      // eslint-disable-next-line no-console
      console.error("[jess-error-boundary]", record);
    } catch { /* swallow logger failure */ }
    // P0 hardening — persist the most recent crash so we can fish it
    // out of localStorage on the next page load even if the user
    // closes devtools. Single slot (latest only) to avoid bloat.
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("jess_last_crash", JSON.stringify(record));
      }
    } catch { /* swallow quota / private mode */ }
  }

  retry = () => {
    this.setState((s) => ({
      hasError: false,
      errorMessage: "",
      retryCount: s.retryCount + 1,
      resetKey: s.resetKey + 1,
    }));
  };

  render() {
    const variant = this.props.variant || "quiet";
    if (!this.state.hasError) {
      // Re-mount children on resetKey bump so any stuck state is
      // cleared. children are rendered via React.cloneElement to add a
      // key change is NOT needed — wrapping in a Fragment with a key
      // suffices.
      return (
        <React.Fragment key={this.state.resetKey}>
          {this.props.children}
        </React.Fragment>
      );
    }

    // Loop guard — if retry brought us straight back into the same
    // error, stop offering retry and show a calm placeholder.
    const looped = this.state.retryCount >= 2;

    if (variant === "hidden") return null;

    if (variant === "quiet") {
      return (
        <div role="status" aria-live="polite" style={{
          margin: "0 16px 12px",
          padding: "12px 14px",
          background: C.paperHi,
          border: `1px dashed ${C.border}`,
          borderRadius: 14,
          color: C.muted,
          fontFamily: "'Inter', sans-serif",
          fontSize: 12.5,
          textAlign: "center",
        }}>
          {looped
            ? "Jess will be back shortly."
            : (
              <span>
                Jess is taking a moment.{" "}
                <button
                  type="button"
                  onClick={this.retry}
                  style={{
                    background: "transparent", border: "none",
                    color: C.espresso, cursor: "pointer", padding: 0,
                    fontWeight: 700, textDecoration: "underline",
                    fontFamily: "'Inter', sans-serif", fontSize: 12.5,
                  }}
                >Try again</button>
              </span>
            )}
        </div>
      );
    }

    // panel variant — used to wrap JessDemoPanel itself.
    return (
      <div role="status" aria-live="polite" style={{
        minHeight: 280,
        background: C.cream,
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        padding: "28px 24px",
        margin: 16,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 14,
        fontFamily: "'Inter', sans-serif",
      }}>
        <p style={{
          margin: 0,
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: 22, fontWeight: 600, color: C.espresso,
          textAlign: "center", letterSpacing: "-0.01em",
        }}>{looped ? "Jess will be back shortly." : "Jess is taking a moment."}</p>
        {!looped && (
          <button
            type="button"
            onClick={this.retry}
            style={{
              padding: "10px 18px", minHeight: 44,
              background: C.gold, color: C.espresso, border: "none",
              borderRadius: 9999, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 6,
              fontFamily: "'Inter', sans-serif", fontSize: 13.5, fontWeight: 700,
            }}
          ><RotateCcw size={14} /> Tap to retry</button>
        )}
      </div>
    );
  }
}
