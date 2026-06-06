import { X } from "lucide-react";
import { useState } from "react";

const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", };

export default function FilterDrawer({ filters, onApply, onClose }) {
  const [local, setLocal] = useState({ ...filters });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: "rgba(42,32,53,0.35)" }} onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-[28px] p-6 space-y-5"
        style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow-lg)" }}>

        {/* Handle */}
        <div className="w-8 h-1 rounded-full mx-auto -mt-1 mb-2" style={{ backgroundColor: "var(--border)" }} />

        <div className="flex items-center justify-between">
          <p className="font-semibold" style={{ color: "var(--plum)", }}>Filter sessions</p>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: "var(--ivory-dark)", color: "var(--mauve)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free only */}
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--plum)", }}>Free content only</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--mauve)", }}>Hide plus and pro sessions</p>
          </div>
          <button onClick={() => setLocal((l) => ({ ...l, showFreeOnly: !l.showFreeOnly }))}
            className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
            style={{ backgroundColor: local.showFreeOnly ? "var(--plum)" : "var(--border)" }}>
            <div className={`absolute top-1 w-4 h-4 rounded-full shadow transition-transform ${local.showFreeOnly ? "translate-x-6" : "translate-x-1"}`}
              style={{ backgroundColor: "var(--surface)" }} />
          </button>
        </div>

        {/* Level */}
        <div>
          <p style={sLabel} className="mb-2.5">Level</p>
          <div className="flex gap-1.5 flex-wrap">
            {["all", "beginner", "intermediate", "advanced"].map((l) => (
              <button key={l} onClick={() => setLocal((f) => ({ ...f, level: l }))}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
                style={{
                  backgroundColor: local.level === l ? "var(--plum)" : "var(--ivory)",
                  color: local.level === l ? "white" : "var(--mauve)",
                  border: `1px solid ${local.level === l ? "var(--plum)" : "var(--border)"}`,
                  }}>
                {l === "all" ? "Any level" : l}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <p style={sLabel} className="mb-2.5">Duration</p>
          <div className="flex gap-1.5 flex-wrap">
            {[
              { id: "all",    label: "Any"      },
              { id: "short",  label: "≤ 10 min" },
              { id: "medium", label: "10–30 min"},
              { id: "long",   label: "30+ min"  },
            ].map((d) => (
              <button key={d.id} onClick={() => setLocal((f) => ({ ...f, durationBucket: d.id }))}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  backgroundColor: local.durationBucket === d.id ? "var(--plum)" : "var(--ivory)",
                  color: local.durationBucket === d.id ? "white" : "var(--mauve)",
                  border: `1px solid ${local.durationBucket === d.id ? "var(--plum)" : "var(--border)"}`,
                  }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <button onClick={() => onApply(local)}
            className="w-full py-3 rounded-2xl text-sm font-semibold transition-all"
            style={{ backgroundColor: "var(--plum)", color: "white", }}>
            Apply
          </button>
          <button onClick={() => onApply({ showFreeOnly: false, level: "all", durationBucket: "all" })}
            className="w-full text-center text-xs py-2"
            style={{ color: "var(--mauve)", }}>
            Reset filters
          </button>
        </div>
      </div>
    </div>
  );
}