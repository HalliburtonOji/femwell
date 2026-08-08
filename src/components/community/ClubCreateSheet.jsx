// Community · START A CLUB — the member-created-club composer (F2, 2026-08-06).
// SHIPPED BEHIND clubsConfig.CLUBS_USER_CREATE_ENABLED — only mounted when the flag is on. The OSA/ICO
// floor is set HERE in the copy (you become the NAMED, accountable host; the space + every message is
// screened + 18+; anything unsafe is removed) and enforced SERVER-side (club.create screens name+line+
// intro, records host_user_id, and the report/auto-hide/remove path). Anonymous alias only — no location.
import React, { useState } from "react";
import { X, ShieldCheck, UserCheck, EyeOff } from "lucide-react";
import { T, UI, Hand } from "@/components/journal/Editorial";
import { clubApi } from "./club";

const OXBLOOD = "#7A1A12";
const SAGE = "#5F7A56";
const CATS = [["Together", "meet-ups & shared activities"], ["Reading", "a book or shared read"], ["Games", "play together"]];
const field = { width: "100%", boxSizing: "border-box", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "11px 12px", fontFamily: UI, fontSize: 14, color: T.ink, marginBottom: 12 };
const primaryBtn = (bg = SAGE) => ({ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", boxSizing: "border-box", background: bg, color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" });

export default function ClubCreateSheet({ user, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [line, setLine] = useState("");
  const [intro, setIntro] = useState("");
  const [category, setCategory] = useState("Together");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const submit = async () => {
    if (name.trim().length < 2) { setMsg("Give your space a name first."); return; }
    setBusy(true); setMsg("");
    try {
      const r = await clubApi.create(user, { name, line, intro, category });
      if (r?.club) { onCreated?.(r.club); onClose?.(); return; }
      if (r?.disabled) { setMsg(r.message || "Starting your own space is coming soon."); return; }
      if (r?.held) { setMsg(r.message || "That didn't pass our community care rules — try describing it more gently."); return; }
      setMsg(r?.message || "That didn't go through — try again in a moment.");
    } catch { setMsg("That didn't go through — try again in a moment."); }
    finally { setBusy(false); }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(36,26,38,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Start a space" style={{ width: "100%", maxWidth: 460, background: T.paper, borderRadius: "14px 14px 0 0", padding: "20px 18px", paddingBottom: "var(--fw-sheet-safe)", maxHeight: "90vh", overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <h2 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: OXBLOOD }}>Start a space</h2>
          <button onClick={onClose} aria-label="Close" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted }}><X size={20} /></button>
        </div>

        {/* the floor, said plainly — you're the accountable host; it's screened + 18+ */}
        <div style={{ background: `${SAGE}12`, border: `1px solid ${SAGE}44`, borderRadius: 12, padding: "12px 13px", marginBottom: 16 }}>
          {[[UserCheck, "You'll be the host", "You're the named, responsible person for this space. Keep it kind — a host who lets it turn unsafe can be asked to step down."],
            [ShieldCheck, "Screened + 18+", "The name and every message are checked; anything unsafe or unkind is removed. Members are anonymous and 18+."],
            [EyeOff, "Anonymous, no location", "You're a botanical alias here — never a name, never a place."]].map(([Ic, h, b]) => (
            <div key={h} style={{ display: "flex", gap: 9, marginBottom: 8 }}>
              <Ic size={15} color={SAGE} style={{ flexShrink: 0, marginTop: 1 }} />
              <div><div style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.ink }}>{h}</div><div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, lineHeight: 1.4 }}>{b}</div></div>
            </div>
          ))}
        </div>

        <input value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder="Name your space" style={field} />
        <input value={line} maxLength={160} onChange={(e) => setLine(e.target.value)} placeholder="One line — what's it for?" style={field} />
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {CATS.map(([c, sub]) => { const on = category === c; return (
            <button key={c} onClick={() => setCategory(c)} title={sub} style={{ flex: 1, background: on ? `${SAGE}1F` : T.paperHi, border: `1px solid ${on ? SAGE : T.paperDeep}`, borderRadius: 10, padding: "9px 6px", fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: on ? SAGE : T.muted, cursor: "pointer" }}>{c}</button>
          ); })}
        </div>
        <textarea value={intro} maxLength={600} onChange={(e) => setIntro(e.target.value)} placeholder="A warm welcome for whoever wanders in (optional)" rows={3} style={{ ...field, resize: "vertical", fontFamily: UI }} />

        {msg && <p style={{ fontFamily: UI, fontSize: 12.5, color: OXBLOOD, margin: "0 0 12px", lineHeight: 1.4 }}>{msg}</p>}
        <button disabled={busy} onClick={submit} style={primaryBtn()}>{busy ? "Starting…" : "Start this space"}</button>
        <p style={{ fontFamily: UI, fontSize: 11, color: T.muted, textAlign: "center", margin: "10px 0 0" }}>By starting a space you agree to keep it safe and kind for the women in it.</p>
      </div>
    </div>
  );
}
