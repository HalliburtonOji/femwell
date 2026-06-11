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
import { Feather, Users, Sparkles, HeartHandshake } from "lucide-react";
import { createPageUrl } from "@/utils";

const pill = {
  display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
  padding: "8px 13px", borderRadius: 9999, border: "1px solid var(--border)",
  background: "var(--surface)", color: "var(--plum)", fontSize: 12.5, fontWeight: 600,
  fontFamily: "var(--font-sans, ui-sans-serif, system-ui, sans-serif)", textDecoration: "none",
  whiteSpace: "nowrap",
};

// `belong` is the PRIVACY-SAFE Community link for analytics/insight surfaces: a
// plain, count-free "you're not the only one" door to /Community — it carries NO
// seed and NO user data (never the user's symptom/mood numbers). Pass a string to
// override the copy, or `true` for the default.
export default function ContentActionBar({ reflect, discuss, belong, jess, label = "Take it further" }) {
  const reflectHref = reflect
    ? createPageUrl(`Journal?compose=1&seed=${encodeURIComponent(reflect.seed || "")}${reflect.type ? `&type=${reflect.type}` : ""}`)
    : null;
  const discussHref = discuss
    ? createPageUrl(`Community?room=${discuss.room || "lounge"}&seed=${encodeURIComponent(discuss.seed || "")}`)
    : null;

  if (!reflect && !discuss && !belong && !jess) return null;

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
        {belong && (
          <Link to={createPageUrl("Community")} style={pill}>
            <HeartHandshake className="w-3.5 h-3.5" style={{ color: "var(--sage)" }} /> {typeof belong === "string" ? belong : "You're not the only one"}
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
