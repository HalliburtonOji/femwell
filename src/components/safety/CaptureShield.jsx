// CaptureShield — best-effort screenshot / capture RESISTANCE for peer surfaces
// (a stranger's words: the Witness reader, future Community DMs, Phase Twin).
//
// HONEST LIMITS (flagged): the web platform CANNOT truly block screenshots. True
// OS-level blocking is Android FLAG_SECURE / iOS screen-capture detection, which
// require a NATIVE wrapper (a Capacitor/native shell plugin) — that's the native
// build's job, not something a web page can do. What we CAN do on the web, and do
// here, is DISCOURAGE + OBSCURE:
//   • disable text selection + the context menu (no easy copy/share)
//   • intercept copy and report it (callers can record a strike)
//   • blur the content the moment the tab/app is backgrounded, so the OS
//     app-switcher thumbnail (the easiest "screenshot") shows nothing legible
//   • flash a quiet "held in confidence" reminder on a PrintScreen keypress
//
// Use the <CaptureShield> wrapper for new surfaces, or useCaptureGuard() to add
// the same behaviour to an existing one (as the Witness reader does).

import { useEffect, useState } from "react";
import { T, UI } from "../journal/Editorial";

export function useCaptureGuard({ onCapture, enabled = true } = {}) {
  const [obscured, setObscured] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;
    const onVis = () => setObscured(document.visibilityState === "hidden");
    const onCopy = (e) => { e.preventDefault(); onCapture?.("copy"); };
    const onCtx = (e) => { e.preventDefault(); };
    const onKey = (e) => {
      // PrintScreen never reaches keydown reliably; keyup is the best web signal.
      if (e.key === "PrintScreen" || (e.shiftKey && e.metaKey)) {
        onCapture?.("screenshot");
        setFlash(true);
        setTimeout(() => setFlash(false), 1600);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    document.addEventListener("copy", onCopy);
    document.addEventListener("contextmenu", onCtx);
    window.addEventListener("keyup", onKey);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("contextmenu", onCtx);
      window.removeEventListener("keyup", onKey);
    };
  }, [enabled, onCapture]);

  return { obscured, flash };
}

// Style props a protected surface should spread onto its scrollable content.
export const noSelectStyle = { userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none" };

export default function CaptureShield({ children, onCapture, enabled = true, note }) {
  const { obscured, flash } = useCaptureGuard({ onCapture, enabled });
  return (
    <div style={{ position: "relative", ...noSelectStyle }}>
      <div style={{ filter: obscured ? "blur(18px)" : "none", transition: "filter 80ms" }}>
        {children}
      </div>
      {(obscured || flash) && (
        <div aria-hidden style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(244,239,227,0.86)", borderRadius: 3, textAlign: "center", padding: 24,
        }}>
          <span style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, letterSpacing: 0.4, color: T.muted }}>
            {note || "Held in confidence — please don’t screenshot or copy."}
          </span>
        </div>
      )}
    </div>
  );
}
