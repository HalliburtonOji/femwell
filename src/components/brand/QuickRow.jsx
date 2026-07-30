// QuickRow — the "Handy right now" band: a horizontal scroll of COMPACT one-line jump
// chips. Every chip is a REAL action/jump (never a dead label). Lifted verbatim from the
// Nutrition shell's internal V2QuickRow so Nutrition and Lifestyle share ONE source instead
// of each keeping a copy that can drift.
//
// items: [{ Icon, cw, label, onClick }]  — Icon = a Lucide component, cw = a colourway key.
import { ChevronRight } from "lucide-react";
import { T, UI } from "@/components/journal/Editorial";
import { cwOf } from "@/components/brand/flora";

export function QuickRow({ items }) {
  return (
    <div className="fw-quick-row" style={{ display: "flex", gap: 9, overflowX: "auto", padding: "2px 2px 8px", WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain", WebkitMaskImage: "linear-gradient(90deg, #000 0, #000 calc(100% - 24px), transparent 100%)", maskImage: "linear-gradient(90deg, #000 0, #000 calc(100% - 24px), transparent 100%)" }}>
      <style>{`.fw-quick-row{scrollbar-width:none}.fw-quick-row::-webkit-scrollbar{display:none}`}</style>
      {items.map((it) => {
        const c = cwOf(it.cw).petal;
        return (
          <button key={it.label} onClick={it.onClick} className="fw-elite-press" style={{ flex: "0 0 auto", display: "inline-flex", alignItems: "center", gap: 9, background: `linear-gradient(160deg, ${T.paperHi} 0%, ${c}12 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${c}`, borderRadius: 13, padding: "10px 13px", cursor: "pointer", whiteSpace: "nowrap" }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, background: `${c}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><it.Icon size={13} color={c} /></span>
            <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.ink }}>{it.label}</span>
            <ChevronRight size={15} color={T.muted} />
          </button>
        );
      })}
      <span style={{ flex: "0 0 2px" }} aria-hidden />
    </div>
  );
}

export default QuickRow;
