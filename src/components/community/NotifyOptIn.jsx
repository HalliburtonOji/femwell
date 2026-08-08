// Community · NOTIFY OPT-IN (F3, 2026-08-06). A gentle, opt-in toggle for background nudges (someone
// replied / your turn / a new message). In-app markers stay the primary path — this is best-effort.
// On iOS-not-installed, web push can't work, so we show a soft, DISMISSIBLE "add to home screen" nudge
// instead of a permission prompt that would do nothing. Never nags: dismissal is remembered.
import React, { useEffect, useState } from "react";
import { Bell, BellOff, Share, X } from "lucide-react";
import { T, UI } from "@/components/journal/Editorial";
import { pushSupported, iosNeedsInstall, isPushOn, enablePush, disablePush, notifyPermission } from "./push";

const SAGE = "#5F7A56";
const OXBLOOD = "#7A1A12";
const NUDGE_KEY = "fw_ios_install_nudge_dismissed";

export default function NotifyOptIn({ user }) {
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [nudgeDismissed, setNudgeDismissed] = useState(() => { try { return localStorage.getItem(NUDGE_KEY) === "1"; } catch { return false; } });

  useEffect(() => { isPushOn().then(setOn).catch(() => {}); }, []);

  // iOS, not installed → the gentle install nudge (not a dead toggle)
  if (iosNeedsInstall()) {
    if (nudgeDismissed) return null;
    return (
      <div style={{ position: "relative", background: `${SAGE}12`, border: `1px solid ${SAGE}44`, borderRadius: 12, padding: "13px 14px" }}>
        <button onClick={() => { try { localStorage.setItem(NUDGE_KEY, "1"); } catch { /* ignore */ } setNudgeDismissed(true); }}
          aria-label="Dismiss" style={{ position: "absolute", top: 8, right: 8, background: "transparent", border: "none", cursor: "pointer", color: T.muted }}><X size={16} /></button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Bell size={15} color={SAGE} />
          <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.ink }}>Want a gentle nudge when someone replies?</div>
        </div>
        <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5 }}>
          On iPhone, add FemWell to your home screen first: tap <Share size={12} style={{ verticalAlign: "-1px" }} /> <b>Share</b>, then <b>Add to Home Screen</b>. Then you can turn nudges on here. No pressure — the in-app markers always show your turn.
        </div>
      </div>
    );
  }

  if (!pushSupported()) return null; // silently absent where the browser can't do it

  const toggle = async () => {
    setBusy(true); setMsg("");
    try {
      if (on) { await disablePush(user); setOn(false); }
      else {
        const r = await enablePush(user);
        if (r.ok) setOn(true);
        else setMsg(r.reason === "denied" ? "Notifications are blocked in your browser settings." : "Couldn't turn nudges on just now.");
      }
    } finally { setBusy(false); }
  };

  return (
    <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <span style={{ width: 32, height: 32, borderRadius: 999, background: `${SAGE}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}>
          {on ? <Bell size={16} color={SAGE} /> : <BellOff size={16} color={T.muted} />}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: UI, fontSize: 13.5, fontWeight: 700, color: T.ink }}>Gentle nudges</div>
          <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, lineHeight: 1.4 }}>A quiet ping when someone replies or it's your turn. Off by default; in-app markers always show too.</div>
        </div>
        <button disabled={busy || notifyPermission() === "denied"} onClick={toggle} role="switch" aria-checked={on}
          style={{ flexShrink: 0, width: 46, height: 27, borderRadius: 999, border: "none", cursor: busy ? "default" : "pointer", background: on ? SAGE : T.paperDeep, position: "relative", transition: "background .2s" }}>
          <span style={{ position: "absolute", top: 3, left: on ? 22 : 3, width: 21, height: 21, borderRadius: 999, background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,0.25)" }} />
        </button>
      </div>
      {msg && <p style={{ fontFamily: UI, fontSize: 11.5, color: OXBLOOD, margin: "8px 0 0" }}>{msg}</p>}
    </div>
  );
}
