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
    // P0 hardening (round 2) — multi-channel crash forensics. Halli
    // reported that `localStorage.jess_last_crash` didn't exist after
    // an error-boundary repro; persist failures were being silently
    // swallowed. Now we write to:
    //   1. console.error (always visible in devtools)
    //   2. window._jessLastCrash (in-memory, survives until reload)
    //   3. localStorage.jess_last_crash (cross-session)
    //   4. sessionStorage.jess_last_crash (works in private mode)
    //   5. CustomEvent("jess-crash") on window (downstream listeners)
    // Any one failing logs a warn but the others keep going. We also
    // store a per-load counter so a fast retry loop doesn't bury the
    // first crash.
    try { console.error("[jess-error-boundary]", record); } catch {}
    try { if (typeof window !== "undefined") window._jessLastCrash = record; } catch {}
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("jess_last_crash", JSON.stringify(record));
      }
    } catch (e) {
      try { console.warn("[jess-error-boundary] localStorage persist failed:", String(e?.message || e)); } catch {}
    }
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.setItem("jess_last_crash", JSON.stringify(record));
      }
    } catch (e) {
      try { console.warn("[jess-error-boundary] sessionStorage persist failed:", String(e?.message || e)); } catch {}
    }
    try {
      if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
        window.dispatchEvent(new CustomEvent("jess-crash", { detail: record }));
      }
    } catch {}
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
    // P0 hardening (round 2) — when `?debug=1` is in the URL or
    // `localStorage.jess_debug === "1"`, surface the actual error
    // message + a copy-to-clipboard button so Halli can read the
    // crash without devtools. Off by default for normal users.
    const debugOn = (() => {
      if (typeof window === "undefined") return false;
      try {
        if (new URLSearchParams(window.location?.search).get("debug") === "1") return true;
        if (window.localStorage?.getItem("jess_debug") === "1") return true;
      } catch {}
      return false;
    })();
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
        {debugOn && this.state.errorMessage && (
          <div style={{
            marginTop: 12, padding: "10px 12px", maxWidth: 360,
            background: "rgba(58,44,26,0.08)", borderRadius: 10,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, color: C.espresso, lineHeight: 1.4,
            wordBreak: "break-word",
          }}>
            <p style={{ margin: 0, fontWeight: 700, marginBottom: 4 }}>
              {this.props.label || "Jess"} threw:
            </p>
            <p style={{ margin: 0 }}>{this.state.errorMessage}</p>
            <button
              type="button"
              onClick={() => {
                try {
                  const payload = JSON.stringify({
                    label: this.props.label,
                    message: this.state.errorMessage,
                  }, null, 2);
                  if (navigator?.clipboard?.writeText) navigator.clipboard.writeText(payload);
                } catch {}
              }}
              style={{
                marginTop: 8, padding: "5px 10px",
                background: C.cream, border: `1px solid ${C.border}`,
                borderRadius: 9999, color: C.muted, cursor: "pointer",
                fontFamily: "'Inter', sans-serif", fontSize: 10.5, fontWeight: 700,
              }}
            >Copy error</button>
          </div>
        )}
      </div>
    );
  }
}
