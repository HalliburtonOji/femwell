import { useState } from "react";
import { Lock, MailOpen } from "lucide-react";
import { formatCountdown, formatLetterDate } from "@/utils/sealedLetters";
import { isEncryptedEnvelope } from "@/utils/journalCrypto";

export default function SealedLetterRow({ letter, kind, onOpen }) {
  const [hovered, setHovered] = useState(false);
  const [showDate, setShowDate] = useState(false);

  const preview = isEncryptedEnvelope(letter.body)
    ? (letter.title?.trim() || 'A sealed letter')
    : (letter.body || '').slice(0, 40) + ((letter.body || '').length > 40 ? '…' : '');

  const handleHoverEnter = () => {
    if (kind !== 'sealed') return;
    setHovered(true);
    setShowDate(true);
    setTimeout(() => setShowDate(false), 1200);
  };

  const handleHoverLeave = () => {
    setHovered(false);
    setShowDate(false);
  };

  const handleClick = () => {
    if (kind === 'sealed') {
      navigator.vibrate?.(10);
      return;
    }
    onOpen?.(letter);
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={handleHoverEnter}
      onMouseLeave={handleHoverLeave}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderBottom: "1px solid var(--ink-line)",
        minHeight: 64,
        cursor: kind === 'unsealed' ? "pointer" : "default",
        backgroundColor: hovered ? "var(--cream-2)" : "transparent",
        transition: "background-color 0.15s",
      }}
    >
      {kind === 'sealed' ? (
        <Lock size={16} color="var(--mauve)" style={{ flexShrink: 0 }} />
      ) : (
        <MailOpen size={16} color="var(--rose-primary)" style={{ flexShrink: 0 }} />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 13,
          color: kind === 'unsealed' ? "var(--plum-deep)" : "var(--plum-mute)",
          opacity: kind === 'sealed' ? 0.7 : 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {preview}
        </p>
      </div>

      {kind === 'sealed' && (
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--mauve)", flexShrink: 0 }}>
          {showDate ? formatLetterDate(letter.seal_date) : formatCountdown(letter.seal_date)}
        </span>
      )}

      {kind === 'unsealed' && !letter.unseal_seen_at && (
        <div style={{ width: 6, height: 6, borderRadius: 9999, backgroundColor: "var(--rose-primary)", flexShrink: 0 }} />
      )}
    </div>
  );
}