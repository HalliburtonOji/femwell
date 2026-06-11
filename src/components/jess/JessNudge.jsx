// JessNudge — the proactive connective-host layer. Jess gently surfaces ONE relevant
// cross-link on a surface ("want to reflect on this?" / "others are here too"), in her
// warm voice. Conservative by design: shows ONCE per nudge id, is always dismissible, and
// once dismissed (or acted on) never returns — no nagging, no red-dot bait, no counts.
// No emoji; Lucide only. Self-contained warm style that fits both editorial + token surfaces.

import { useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { createPageUrl } from "@/utils";

const GOLD = "#A6862B", INK = "#2E261B", MUTED = "#7B5E6B", CREAM = "#FBF6E6", RULE = "rgba(58,44,26,0.14)";
const SANS = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
const SERIF = '"Cormorant Garamond", Georgia, serif';

const seen = (id) => { try { return localStorage.getItem("fw_jessnudge_" + id) === "1"; } catch { return false; } };
const mark = (id) => { try { localStorage.setItem("fw_jessnudge_" + id, "1"); } catch { /* ignore */ } };

// props: id (dedup key), line (Jess's words), to (createPageUrl target) OR onAction, actionLabel
export default function JessNudge({ id, line, to, onAction, actionLabel = "Yes" }) {
  const [gone, setGone] = useState(() => seen(id));
  if (gone) return null;

  const dismiss = () => { mark(id); setGone(true); };
  const act = () => { mark(id); setGone(true); onAction && onAction(); };

  const ActionEl = to
    ? <Link to={createPageUrl(to)} onClick={() => { mark(id); setGone(true); }} style={btn}>{actionLabel}</Link>
    : <button onClick={act} style={btn}>{actionLabel}</button>;

  return (
    <div style={{ background: CREAM, border: `1px solid ${GOLD}`, borderRadius: 12, padding: "12px 14px", margin: "12px 0", position: "relative" }}>
      <div style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: GOLD, marginBottom: 5 }}>Jess · a gentle nudge</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, lineHeight: 1.45, color: INK, marginBottom: 10, paddingRight: 18 }}>{line}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {ActionEl}
        <button onClick={dismiss} style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 12, color: MUTED, fontWeight: 600 }}>Not now</button>
      </div>
      <button onClick={dismiss} aria-label="Dismiss" style={{ position: "absolute", top: 8, right: 8, background: "transparent", border: "none", cursor: "pointer", color: MUTED }}>
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

const btn = {
  display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer", textDecoration: "none",
  padding: "7px 14px", borderRadius: 9999, border: `1px solid ${RULE}`, background: "#fff",
  color: INK, fontSize: 12.5, fontWeight: 700, fontFamily: SANS, whiteSpace: "nowrap",
};
