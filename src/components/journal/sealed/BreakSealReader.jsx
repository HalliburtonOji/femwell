// BreakSealReader — the break-seal ritual + on-device decryption (Phase 2).
//
// A ready letter arrives as a closed wax seal. Breaking it is a deliberate,
// one-way gesture: tap, the seal gives, and the words are decrypted on THIS
// device and revealed. If the device no longer holds the key (cleared storage,
// different browser), we say so honestly rather than show nothing.

import { useState } from "react";
import { X, Lock, Feather } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { T, UI, SERIF, HAND, PRESS, Eyebrow, Rule, Heart, Script, Hand } from "../Editorial";
import { decryptText, isEncryptedEnvelope } from "@/utils/journalCrypto";
import { formatLetterDate } from "@/utils/sealedLetters";
import { isAnniversaryLetter } from "./sealedThreads";

export default function BreakSealReader({ letter, onClose, onSeen, onWriteBack }) {
  const [stage, setStage] = useState("sealed"); // sealed | opening | revealed | error
  const [text, setText] = useState("");

  if (!letter) return null;

  const reveal = async () => {
    setStage("opening");
    try {
      // Older plaintext letters (pre-Phase-2) decrypt to themselves.
      const plain = isEncryptedEnvelope(letter.body)
        ? await decryptText(letter.body)
        : (letter.body || "");
      setText(plain);
      setStage("revealed");
      if (!letter.unseal_seen_at) {
        try {
          const updated = await base44.entities.SealedLetters.update(letter.id, { unseal_seen_at: new Date().toISOString() });
          onSeen?.(updated);
        } catch (err) { console.error("Mark letter seen failed:", err); onSeen?.({ ...letter, unseal_seen_at: new Date().toISOString() }); }
      }
    } catch (err) {
      console.error("Decrypt letter failed:", err);
      setStage("error");
    }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(51,41,28,0.46)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 22px" }}>
      <style>{`
        @keyframes fwSealReveal { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fwSealGive { 0% { transform: scale(1); } 40% { transform: scale(1.08); } 100% { transform: scale(0.6); opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { .fw-seal-anim { animation: none !important; } }
      `}</style>
      <div onClick={(e) => e.stopPropagation()} style={{ background: T.paperHi, width: "100%", maxWidth: 560, maxHeight: "86vh", overflowY: "auto", padding: "32px 30px 28px", borderRadius: 3, boxShadow: "0 8px 40px rgba(51,41,28,0.22)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <Eyebrow color={T.gold}>A letter from you</Eyebrow>
          <button onClick={onClose} aria-label="Close" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, padding: 0, display: "inline-flex" }}><X size={18} /></button>
        </div>
        <Rule w={28} c={T.gold} mb={18} />

        {(stage === "sealed" || stage === "opening") && (
          <div style={{ textAlign: "center", padding: "12px 0 8px" }}>
            <div className="fw-seal-anim" style={{
              width: 76, height: 76, borderRadius: "50%", margin: "0 auto 18px",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "#EFE3C9", border: `1.5px solid ${T.gold}`,
              animation: stage === "opening" ? "fwSealGive 620ms ease-in forwards" : "none",
            }}>
              <Heart size={26} />
            </div>
            {letter.title ? <Script size={34} style={{ marginBottom: 6 }}>{letter.title}</Script> : null}
            <Hand size={20} color={T.inkSoft} style={{ marginBottom: 4 }}>
              {stage === "opening" ? "Breaking the seal…" : "The date arrived. This was sealed until now."}
            </Hand>
            <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, fontWeight: 600, letterSpacing: 0.4, marginBottom: 22 }}>
              Sealed {formatLetterDate(letter.created_at || letter.created_date)}
            </div>
            {stage === "sealed" && (
              <button onClick={reveal} style={{
                background: "transparent", border: `1px solid ${T.gold}`, padding: "11px 26px", cursor: "pointer",
                fontFamily: HAND, fontWeight: 600, fontSize: 19, color: T.ink, textShadow: PRESS, borderRadius: 3,
              }}>Break the seal</button>
            )}
          </div>
        )}

        {stage === "revealed" && (
          <div className="fw-seal-anim" style={{ animation: "fwSealReveal 360ms ease-out both" }}>
            {letter.title ? <Script size={30} style={{ marginBottom: 12 }}>{letter.title}</Script> : null}
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 22, color: T.ink, lineHeight: 1.64, whiteSpace: "pre-wrap", margin: "0 0 18px" }}>
              {text || "(she left you no words)"}
            </p>
            <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, fontWeight: 600, letterSpacing: 0.4 }}>
              Sealed {formatLetterDate(letter.created_at || letter.created_date)} · Opened {formatLetterDate(letter.unsealed_at || new Date().toISOString())}
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14, fontFamily: UI, fontSize: 10.5, color: T.muted, letterSpacing: 0.5, fontWeight: 600 }}>
              <Lock size={11} /> Decrypted on this device. The server only ever held the cipher.
            </div>

            {/* v2: write back into the same thread (continue the correspondence / annual ritual) */}
            {onWriteBack && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.paperDeep}` }}>
                <button onClick={() => onWriteBack(letter)} style={{
                  display: "inline-flex", alignItems: "center", gap: 7, background: "transparent",
                  border: `1px solid ${T.gold}`, padding: "10px 22px", cursor: "pointer",
                  fontFamily: HAND, fontWeight: 600, fontSize: 18, color: T.ink, textShadow: PRESS, borderRadius: 3,
                }}>
                  <Feather size={14} /> {isAnniversaryLetter(letter) ? "Seal one for next year" : "Write back to her"}
                </button>
              </div>
            )}
          </div>
        )}

        {stage === "error" && (
          <div style={{ textAlign: "center", padding: "8px 0 6px" }}>
            <Hand size={20} color={T.inkSoft} style={{ marginBottom: 10 }}>
              This letter was sealed on another device. The key never left that device, so it can{"’"}t be opened here.
            </Hand>
            <button onClick={onClose} style={{
              marginTop: 6, background: "transparent", border: `1px solid ${T.gold}`, padding: "9px 22px", cursor: "pointer",
              fontFamily: HAND, fontWeight: 600, fontSize: 18, color: T.ink, textShadow: PRESS, borderRadius: 3,
            }}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}