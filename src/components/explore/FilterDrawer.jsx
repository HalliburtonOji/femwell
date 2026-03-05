import { X } from "lucide-react";
import { useState } from "react";

export default function FilterDrawer({ filters, onApply, onClose }) {
  const [local, setLocal] = useState({ ...filters });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl w-full max-w-md p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-gray-800">Filters</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        {/* Free only toggle */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">Show free content only</p>
          <button
            onClick={() => setLocal((l) => ({ ...l, showFreeOnly: !l.showFreeOnly }))}
            className={`w-12 h-6 rounded-full transition-colors relative ${local.showFreeOnly ? "bg-rose-500" : "bg-gray-200"}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${local.showFreeOnly ? "translate-x-7" : "translate-x-1"}`} />
          </button>
        </div>

        {/* Level */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Level</p>
          <div className="flex gap-2 flex-wrap">
            {["all", "beginner", "intermediate", "advanced"].map((l) => (
              <button
                key={l}
                onClick={() => setLocal((f) => ({ ...f, level: l }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${local.level === l ? "bg-rose-500 text-white" : "bg-rose-50 text-gray-600"}`}
              >
                {l === "all" ? "Any level" : l}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Duration</p>
          <div className="flex gap-2 flex-wrap">
            {[
              { id: "all", label: "Any" },
              { id: "short", label: "≤ 10 min" },
              { id: "medium", label: "10–30 min" },
              { id: "long", label: "30+ min" },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setLocal((f) => ({ ...f, durationBucket: d.id }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${local.durationBucket === d.id ? "bg-rose-500 text-white" : "bg-rose-50 text-gray-600"}`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => onApply(local)} className="btn-primary w-full">Apply Filters</button>
        <button
          onClick={() => onApply({ showFreeOnly: false, level: "all", durationBucket: "all" })}
          className="w-full text-center text-xs text-gray-400 hover:text-rose-400"
        >
          Reset all filters
        </button>
      </div>
    </div>
  );
}