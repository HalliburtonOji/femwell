// AgeGate — the 18+ boundary that wraps a peer surface (scaffolding).
//
// Renders its children only once the person has confirmed they're 18 or over;
// otherwise it shows the gate. Wrap any adults-only surface:
//   <AgeGate surfaceName="the Community" onDecline={() => navigate(-1)}>
//     <Community />
//   </AgeGate>
//
// AGE ASSURANCE (Halli's decision, 2026-07-08): a LIGHT, self-declared 18+ affirmation
// only — NO facial age estimation, NO ID checks ("it's not a porn site, accept what we
// need to"). The minimum reasonable 18+ confirmation, recorded locally. A real legal
// check is still worth doing before public launch, but this is the direction.

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { PAPER_BG, T, UI, Script, Hand, Eyebrow, Rule, Z } from "../journal/Editorial";
import { useScrollLock } from "@/utils/useScrollLock";
import { isAdultConfirmed, confirmAdult } from "./ageAssurance";

export default function AgeGate({ children, surfaceName = "this space", onDecline }) {
  const [ok, setOk] = useState(() => isAdultConfirmed());
  useScrollLock(!ok);   // lock background scroll while the gate is shown
  if (ok) return children;

  return (
    <div role="dialog" aria-modal="true" aria-label="Adults only — age check" className="fw-sheet-safe" style={{ position: "fixed", inset: 0, zIndex: Z.gate, overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", ...PAPER_BG }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "56px 24px 60px" }}>
        <Eyebrow mb={12}>Before you go in</Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <ShieldCheck size={20} style={{ color: T.gold }} />
          <Script size={40} style={{ width: "auto" }}>Adults only</Script>
        </div>
        <Rule mb={18} />
        <Hand size={20} color={T.inkSoft} style={{ marginBottom: 10 }}>
          {surfaceName === "this space" ? "This space" : `${surfaceName.charAt(0).toUpperCase()}${surfaceName.slice(1)}`} is for women — and everyone living a woman{"’"}s health journey. It{"’"}s a candid, grown-up space, so you just need to be 18 or over to come in.
        </Hand>
        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.55, marginBottom: 24 }}>
          Tapping below confirms you{"’"}re 18 or over. That{"’"}s all we ask — no ID, no photo.
        </p>

        <button onClick={() => { confirmAdult(); setOk(true); }} style={{
          width: "100%", background: T.ink, color: T.paperHi, border: "none", borderRadius: 12,
          padding: "14px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, letterSpacing: 0.3, cursor: "pointer", marginBottom: 12,
        }}>I{"’"}m 18 or over — come in</button>
        <button onClick={() => onDecline?.()} style={{
          width: "100%", background: "transparent", color: T.ink, border: `1px solid ${T.paperDeep}`, borderRadius: 12,
          padding: "12px 16px", fontFamily: UI, fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>Not now</button>
      </div>
    </div>
  );
}
