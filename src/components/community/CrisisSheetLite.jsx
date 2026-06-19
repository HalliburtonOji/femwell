// CrisisSheetLite — a small, self-contained UK crisis-support sheet for surfaces outside the
// Community page (e.g. the Library reader's chapter-end card). Mirrors Community's CrisisSheet
// tone + the same UK_RESOURCES, but with no Community-page dependencies so it can be dropped in
// anywhere a crisisCheck intercepts free text. No emoji — Lucide icons + Fraunces/Inter only.

import { ShieldAlert, Phone } from "lucide-react";
import { UK_RESOURCES } from "@/pages/communityShared";

const PLUM = "#241a26";
const CREAM = "#FBF7EC";
const CREAM_DEEP = "rgba(58,44,26,0.16)";
const INK = "#3A2C1A";
const MUTED = "#9B8B7A";
const BLUSH = "#E8B4B8";
const GOLD = "#D4AF37";
const SERIF = '"Cormorant Garamond","Fraunces",Georgia,serif';
const UI = '"Inter",system-ui,sans-serif';

export default function CrisisSheetLite({ onClose }) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 10100, background: "rgba(36,26,38,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Support resources"
        onClick={(e) => e.stopPropagation()}
        className="fw-sheet-safe"
        style={{ background: CREAM, width: "100%", maxWidth: 480, borderRadius: "16px 16px 0 0", padding: "24px 22px 30px", maxHeight: "88vh", overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}
      >
        <div style={{ background: PLUM, borderRadius: 12, padding: "18px 18px 20px", marginBottom: 16 }}>
          <ShieldAlert size={22} style={{ color: BLUSH, marginBottom: 8 }} />
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 19, lineHeight: 1.45, color: "#F5E6D3", margin: 0 }}>
            This reads as heavy — and a quiet page isn{"’"}t the right shape for it. These people are there now, any time.
          </p>
        </div>
        {UK_RESOURCES.map((r) => (
          <div key={r.name} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: CREAM, border: `1px solid ${CREAM_DEEP}`, borderRadius: 10, padding: "11px 13px", marginBottom: 9 }}>
            <Phone size={15} style={{ color: GOLD, marginTop: 2 }} />
            <div>
              <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: INK }}>{r.name}</div>
              <div style={{ fontFamily: UI, fontSize: 12.5, color: MUTED }}>{r.detail}</div>
            </div>
          </div>
        ))}
        <button
          onClick={onClose}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "100%", background: INK, color: CREAM, border: "none", borderRadius: 10, padding: "11px 18px", fontFamily: UI, fontSize: 13.5, fontWeight: 700, letterSpacing: 0.3, cursor: "pointer", marginTop: 8 }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
