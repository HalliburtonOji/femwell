// AgeGate — the 18+ boundary that wraps a peer surface (scaffolding).
//
// Renders its children only once the person has confirmed they're 18 or over;
// otherwise it shows the gate. Wrap any adults-only surface:
//   <AgeGate surfaceName="the Community" onDecline={() => navigate(-1)}>
//     <Community />
//   </AgeGate>
//
// FLAGGED — Halli's sign-off (named accountable person), NOT decided in code:
//   • the assurance METHOD (self-declaration here vs. a stronger age check)
//   • the exact legal copy (ToS line, special-category consent wording)
//   • what record of the declaration must be kept (DPIA/APD)
// The hook + UI are ready; the wording below is placeholder until that sign-off.

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { PAPER_BG, T, UI, Script, Hand, Eyebrow, Rule, Z } from "../journal/Editorial";
import { isAdultConfirmed, confirmAdult } from "./ageAssurance";

export default function AgeGate({ children, surfaceName = "this space", onDecline }) {
  const [ok, setOk] = useState(() => isAdultConfirmed());
  if (ok) return children;

  return (
    <div role="dialog" aria-modal="true" aria-label="Adults only — age check" style={{ position: "fixed", inset: 0, zIndex: Z.gate, overflowY: "auto", ...PAPER_BG }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "56px 24px 60px" }}>
        <Eyebrow mb={12}>Before you go in</Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <ShieldCheck size={20} style={{ color: T.gold }} />
          <Script size={40} style={{ width: "auto" }}>Adults only</Script>
        </div>
        <Rule mb={18} />
        <Hand size={20} color={T.inkSoft} style={{ marginBottom: 10 }}>
          {surfaceName === "this space" ? "This space" : `${surfaceName.charAt(0).toUpperCase()}${surfaceName.slice(1)}`} is for women 18 and over. It{"’"}s a place to be honest with other adults — so we keep it adults-only.
        </Hand>
        {/* PLACEHOLDER legal line — replace with Halli's signed-off ToS/consent copy. */}
        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.55, marginBottom: 24 }}>
          By continuing you confirm you are 18 or over. (Final wording + consent pending sign-off.)
        </p>

        <button onClick={() => { confirmAdult(); setOk(true); }} style={{
          width: "100%", background: T.ink, color: T.paperHi, border: "none", borderRadius: 12,
          padding: "14px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, letterSpacing: 0.3, cursor: "pointer", marginBottom: 12,
        }}>I am 18 or over — continue</button>
        <button onClick={() => onDecline?.()} style={{
          width: "100%", background: "transparent", color: T.ink, border: `1px solid ${T.paperDeep}`, borderRadius: 12,
          padding: "12px 16px", fontFamily: UI, fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>Not now</button>
      </div>
    </div>
  );
}
