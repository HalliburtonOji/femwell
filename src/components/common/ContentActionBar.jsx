// ContentActionBar — the connectivity keystone. A reusable "Reflect · Discuss ·
// Ask Jess" row dropped onto any content surface (a read, a horoscope, an
// insight, a program day). It threads passive content into the three doing-
// surfaces via the connectivity mechanisms:
//   P1 Reflect  -> /Journal?compose=1&seed=…&type=…   (opens the seeded composer)
//   P2 Discuss  -> /Community?room=…&seed=…           (opens the room, composer pre-filled)
//   P3 Ask Jess -> fw_open_assistant event            (opens the assistant)
//
// It never posts or shares anything automatically — every action only OPENS a
// composer or the assistant, on the user's terms. No counts, no scoreboards,
// no emoji; Lucide only. Uses the app design tokens so it fits content surfaces.

import { Link } from "react-router-dom";
import { Feather, Users, Sparkles } from "lucide-react";
import { createPageUrl } from "@/utils";

const pill = {
  display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
  padding: "8px 13px", borderRadius: 9999, border: "1px solid var(--border)",
  background: "var(--surface)", color: "var(--plum)", fontSize: 12.5, fontWeight: 600,
  fontFamily: "var(--font-sans, ui-sans-serif, system-ui, sans-serif)", textDecoration: "none",
  whiteSpace: "nowrap",
};

export default function ContentActionBar({ reflect, discuss, jess, label = "Take it further" }) {
  const reflectHref = reflect
    ? createPageUrl(`Journal?compose=1&seed=${encodeURIComponent(reflect.seed || "")}${reflect.type ? `&type=${reflect.type}` : ""}`)
    : null;
  const discussHref = discuss
    ? createPageUrl(`Community?room=${discuss.room || "lounge"}&seed=${encodeURIComponent(discuss.seed || "")}`)
    : null;

  if (!reflect && !discuss && !jess) return null;

  return (
    <div style={{ margin: "16px 0" }}>
      {label && (
        <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", marginBottom: 8, fontFamily: "var(--font-sans, ui-sans-serif, system-ui, sans-serif)" }}>{label}</p>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {reflect && (
          <Link to={reflectHref} style={pill}>
            <Feather className="w-3.5 h-3.5" style={{ color: "var(--rose-dust)" }} /> Reflect in Journal
          </Link>
        )}
        {discuss && (
          <Link to={discussHref} style={pill}>
            <Users className="w-3.5 h-3.5" style={{ color: "var(--sage)" }} /> Discuss in Community
          </Link>
        )}
        {jess && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("fw_open_assistant", { detail: { context: typeof jess === "string" ? jess : undefined } }))}
            style={{ ...pill, border: "1px solid var(--border)" }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--gold, #A6862B)" }} /> Ask Jess
          </button>
        )}
      </div>
    </div>
  );
}
