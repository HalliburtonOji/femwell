// JessAstraBanner — Feature 4 (Astra handoff)
//
// Mounts at the top of HoroscopeTab. When the URL carries ?from=jess
// AND sessionStorage has a fresh `jess_astra_handoff` blob (<2h old),
// we render a small banner that tells Astra what Jess was talking
// about — phase, mood, and the last few user turns — so the handoff
// feels intentional, not jarring.
//
// Dismissable in-session (no persistence needed): once closed, the
// banner doesn't pop back until the user re-arrives from Jess.

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";

const HANDOFF_KEY = "jess_astra_handoff";
const TWO_HOURS = 2 * 60 * 60 * 1000;

function readHandoff() {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search || "");
    if (params.get("from") !== "jess") return null;
    const raw = window.sessionStorage.getItem(HANDOFF_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== "object") return null;
    if (obj.ts && Date.now() - obj.ts > TWO_HOURS) return null;
    return obj;
  } catch { return null; }
}

export default function JessAstraBanner() {
  const [handoff, setHandoff] = useState(null);

  useEffect(() => {
    setHandoff(readHandoff());
  }, []);

  if (!handoff) return null;

  const dismiss = () => {
    setHandoff(null);
    try { window.sessionStorage.removeItem(HANDOFF_KEY); } catch { /* swallow */ }
    // Also clean the URL so refresh doesn't re-render the banner.
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("from");
      window.history.replaceState({}, "", url.toString());
    } catch { /* swallow */ }
  };

  const recent = Array.isArray(handoff.recentTopics) ? handoff.recentTopics.filter(Boolean) : [];
  const phaseLabel = handoff.phase
    ? handoff.phase.charAt(0).toUpperCase() + handoff.phase.slice(1)
    : null;

  return (
    <article style={{
      background: "linear-gradient(135deg, #2A1E0E 0%, #3A2C1A 100%)",
      color: "#F4EDDB",
      borderRadius: 14,
      padding: "14px 14px 12px",
      margin: "12px 16px 16px",
      border: "1px solid rgba(212,175,55,0.40)",
      boxShadow: "0 8px 24px rgba(58,44,26,0.20)",
      display: "flex", gap: 12, alignItems: "flex-start",
      animation: "jess-astra-rise 320ms ease-out",
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        background: "rgba(212,175,55,0.18)",
        border: "1px solid rgba(212,175,55,0.40)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }} aria-hidden>
        <Sparkles size={15} style={{ color: "#D4AF37" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: "0 0 4px", fontSize: 10, fontWeight: 700,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: "#D4AF37", }}>{handoff.sentBy || "Jess"} sent you here</p>
        <p style={{
          margin: "0 0 8px", fontSize: 14,
          lineHeight: 1.5,
        }}>
          Astra knows what you were chatting about.{phaseLabel ? ` You're in your ${phaseLabel} phase.` : ""}
        </p>
        {recent.length > 0 && (
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 6,
          }}>
            {recent.slice(0, 3).map((t, i) => (
              <span key={i} style={{
                fontSize: 11, padding: "4px 10px", borderRadius: 9999,
                background: "rgba(244,237,219,0.10)",
                border: "1px solid rgba(244,237,219,0.20)",
                color: "#F4EDDB",
                maxWidth: "100%", whiteSpace: "nowrap",
                overflow: "hidden", textOverflow: "ellipsis",
              }}>{t}</span>
            ))}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss banner"
        style={{
          width: 28, height: 28, borderRadius: 9999,
          background: "rgba(244,237,219,0.10)",
          border: "1px solid rgba(244,237,219,0.20)",
          color: "#F4EDDB", cursor: "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          padding: 0, flexShrink: 0,
        }}
      >
        <X size={13} />
      </button>
      <style>{`
        @keyframes jess-astra-rise {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </article>
  );
}
