// FourLivesChooser — "one entry, four lives."
//
// After writing or opening an entry, the four fates are offered TOGETHER, in one
// coherent editorial chooser: keep it private (locked — the default), share one
// line to the Echo Wall, seal it for later, or ask for a witness. Nothing leaves
// the journal without an explicit choice; the entry stays locked to you unless
// you pick a door.
//
// This is the unified production bridge — it ports the demo communityShared
// FOUR_LIVES concept into the real Journal. Each path routes to its REAL service:
//   echo    -> ShareAsEchoSheet (seeded with this entry)
//   seal    -> SealedLetterCompose (seeded with this entry's words)
//   witness -> AskForWitnessSheet (this entry, encrypted on-device)
// The chooser itself moves nothing; it only hands the entry to the chosen service.

import { Lock, Waves, Mail, HeartHandshake, X } from "lucide-react";
import { T, UI, HAND, Script, Eyebrow, Rule, InkFilter, useEscape } from "./Editorial";
import { useScrollLock } from "@/utils/useScrollLock";

export default function FourLivesChooser({ entry, onClose, onEcho, onSeal, onWitness }) {
  useEscape(onClose);
  useScrollLock(!!entry);   // lock the background page while the chooser is open
  if (!entry) return null;
  const hasText = (entry?.text || "").trim().length > 0;

  const LIVES = [
    {
      key: "lock", Icon: Lock, label: "Keep it private",
      sub: "Locked to you, always. Nothing leaves the journal.",
      onClick: onClose, enabled: true, isDefault: true,
    },
    {
      key: "echo", Icon: Waves, label: "Share one line",
      sub: "A single line, anonymous, to the Echo Wall.",
      onClick: onEcho, enabled: hasText,
    },
    {
      key: "seal", Icon: Mail, label: "Seal it for later",
      sub: "Encrypt it and let it return on a day you choose.",
      onClick: onSeal, enabled: hasText,
    },
    {
      key: "witness", Icon: HeartHandshake, label: "Ask for a witness",
      sub: "One sister holds it. No advice — just held. (You hold space for three others first.)",
      onClick: onWitness, enabled: hasText,
    },
  ];

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(51,41,28,0.46)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 22px" }}>
      <InkFilter />
      <div role="dialog" aria-modal="true" aria-label="What happens to this entry" onClick={(e) => e.stopPropagation()} style={{ background: T.paperHi, width: "100%", maxWidth: 480, maxHeight: "88vh", overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", padding: "30px 26px 24px", borderRadius: 3, boxShadow: "0 8px 40px rgba(51,41,28,0.22)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
          <Eyebrow color={T.muted}>What happens to this</Eyebrow>
          <button onClick={onClose} aria-label="Close" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, padding: 0, display: "inline-flex" }}><X size={18} /></button>
        </div>
        <Script size={40} style={{ marginBottom: 2 }}>One entry, four lives</Script>
        <Rule w={28} c={T.gold} mt={6} mb={14} />
        <p style={{ fontFamily: HAND, fontStyle: "italic", fontWeight: 600, fontSize: 18, color: T.inkSoft, lineHeight: 1.4, margin: "0 0 18px" }}>
          It stays locked to you unless you choose otherwise.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {LIVES.map(({ key, Icon, label, sub, onClick, enabled, isDefault }) => (
            <button
              key={key}
              onClick={enabled ? onClick : undefined}
              disabled={!enabled}
              style={{
                display: "flex", alignItems: "flex-start", gap: 13, textAlign: "left", width: "100%",
                background: isDefault ? T.paper : "transparent",
                border: `1px solid ${isDefault ? T.gold : T.paperDeep}`, borderRadius: 4,
                padding: "13px 15px", cursor: enabled ? "pointer" : "not-allowed",
                opacity: enabled ? 1 : 0.45,
              }}
            >
              <span style={{ flexShrink: 0, marginTop: 1, color: key === "witness" ? T.crimson : T.inkSoft }}>
                <Icon size={19} strokeWidth={1.6} />
              </span>
              <span style={{ flex: 1 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: HAND, fontStyle: "italic", fontWeight: 700, fontSize: 19, color: T.ink, lineHeight: 1.2 }}>{label}</span>
                  {isDefault && (
                    <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", color: T.gold, border: `1px solid ${T.gold}`, borderRadius: 999, padding: "1px 7px" }}>Default</span>
                  )}
                </span>
                <span style={{ display: "block", fontFamily: UI, fontSize: 12.5, color: T.muted, lineHeight: 1.45, marginTop: 3 }}>{sub}</span>
              </span>
            </button>
          ))}
        </div>
        {!hasText && (
          <p style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, lineHeight: 1.5, marginTop: 14, marginBottom: 0 }}>
            Write a few words first to share, seal, or pass this to a witness.
          </p>
        )}
      </div>
    </div>
  );
}
