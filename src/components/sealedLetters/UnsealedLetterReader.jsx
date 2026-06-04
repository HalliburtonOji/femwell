import { useEffect, useRef, useState } from "react";
import { X, MailOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { formatLetterDate } from "@/utils/sealedLetters";
import { decryptText, isEncryptedEnvelope } from "@/utils/journalCrypto";

export default function UnsealedLetterReader({ letter, onClose, onMarkSeen }) {
  const timerRef = useRef(null);
  const [bodyText, setBodyText] = useState(isEncryptedEnvelope(letter?.body) ? "" : (letter?.body || ""));
  const [decryptErr, setDecryptErr] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (isEncryptedEnvelope(letter?.body)) {
      decryptText(letter.body)
        .then((t) => { if (!cancelled) setBodyText(t); })
        .catch(() => { if (!cancelled) setDecryptErr(true); });
    } else {
      setBodyText(letter?.body || "");
      setDecryptErr(false);
    }
    return () => { cancelled = true; };
  }, [letter?.id]);

  useEffect(() => {
    if (!letter?.unseal_seen_at) {
      timerRef.current = setTimeout(async () => {
        const updated = await base44.entities.SealedLetters.update(letter.id, {
          unseal_seen_at: new Date().toISOString(),
        });
        onMarkSeen?.(updated);
      }, 500);
    }
    return () => clearTimeout(timerRef.current);
  }, [letter?.id]);

  const handleClose = async () => {
    if (!letter?.unseal_seen_at) {
      clearTimeout(timerRef.current);
      const updated = await base44.entities.SealedLetters.update(letter.id, {
        unseal_seen_at: new Date().toISOString(),
      });
      onMarkSeen?.(updated);
    }
    onClose?.();
  };

  return (
    <>
      <style>{`
        @keyframes fwLetterReveal {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .fw-letter-reader { animation: none !important; }
        }
      `}</style>
      <div
        className="fw-letter-reader"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 720,
          borderRadius: 18,
          padding: "28px 26px",
          border: "1px solid var(--ink-line)",
          boxShadow: "var(--shadow-card)",
          backgroundColor: "var(--cream-2)",
          animation: "fwLetterReveal 280ms ease-out both",
          boxSizing: "border-box",
        }}
      >
        <button
          onClick={handleClose}
          style={{ position: "absolute", top: 14, right: 14, padding: 4, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          aria-label="Close letter"
        >
          <X size={16} color="var(--mauve)" />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
          <MailOpen size={14} color="var(--mauve)" />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)" }}>
            FROM YOU · {formatLetterDate(letter.created_at)}
          </span>
        </div>

        <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontStyle: "italic", lineHeight: 1.7, color: "var(--plum-deep)", whiteSpace: "pre-wrap", padding: "16px 0" }}>
          {decryptErr ? "This letter was sealed on another device, so it can\u2019t be opened here." : bodyText}
        </p>

        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "var(--mauve)", marginTop: 20 }}>
          Sealed {formatLetterDate(letter.created_at)} · Opened {formatLetterDate(letter.unsealed_at || new Date().toISOString())}
        </p>
      </div>
    </>
  );
}