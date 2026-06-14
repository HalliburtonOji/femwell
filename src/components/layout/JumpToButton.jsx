// JumpToButton — the ONE shared "jump-to" area-switcher trigger, used on every
// multi-layer page (Journal, Community, Nutrition, Health). The CHROME is identical
// everywhere; only the destinations behind it differ per page.
//
// Standard look: a cream pill with a gold Grid2x2 icon + visible "Jump to" text,
// Editorial UI font. No emoji; Lucide only. Phone-first.
//
// Props: { onClick, style? } — style merges over the base for placement nudges only.
import { Grid2x2 } from "lucide-react";
import { T, UI } from "@/components/journal/Editorial";

export default function JumpToButton({ onClick, style = {} }) {
  return (
    <button
      onClick={onClick}
      aria-label="Jump to"
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0, cursor: "pointer",
        padding: "7px 13px", borderRadius: 999,
        border: `1px solid ${T.paperDeep}`, background: T.paperHi,
        fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.3, color: T.inkSoft,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      <Grid2x2 size={13} style={{ color: T.gold }} /> Jump to
    </button>
  );
}
