import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Loader2 } from "lucide-react";

const REGIONS = [
  { id: "lower_abdomen", label: "Lower abdomen", cx: 100, cy: 145 },
  { id: "pelvis",        label: "Pelvis",         cx: 100, cy: 175 },
  { id: "lower_back",    label: "Lower back",     cx: 100, cy: 195, back: true },
  { id: "right_ovary",   label: "Right ovary",    cx: 68,  cy: 158 },
  { id: "left_ovary",    label: "Left ovary",     cx: 132, cy: 158 },
  { id: "bladder",       label: "Bladder",        cx: 100, cy: 162 },
  { id: "bowel",         label: "Bowel",          cx: 100, cy: 120 },
  { id: "legs",          label: "Legs",           cx: 100, cy: 230 },
];

const PAIN_TYPES = ["cramping", "stabbing", "aching", "burning", "pressure", "throbbing"];

const card = {
  backgroundColor: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: 20, boxShadow: "var(--shadow-sm)", padding: 20,
};
const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", };

export default function PainMapSubTab({ user, selectedDate }) {
  const [logs, setLogs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [severity, setSeverity] = useState(3);
  const [painType, setPainType] = useState("cramping");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () =>
    base44.entities.PainMap.filter({ user_id: user.id, date: selectedDate })
      .then(setLogs).catch(() => {});

  useEffect(() => { load(); }, [user, selectedDate]);

  const logPain = async () => {
    if (!selected) return;
    setSaving(true);
    await base44.entities.PainMap.create({
      user_id: user.id,
      date: selectedDate,
      region: selected,
      severity,
      pain_type: painType,
      notes: notes.trim() || undefined,
    });
    await load();
    setSelected(null);
    setNotes("");
    setSeverity(3);
    setSaving(false);
  };

  const remove = async (id) => {
    await base44.entities.PainMap.delete(id);
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  const loggedRegionIds = new Set(logs.map(l => l.region));

  return (
    <div className="pt-4 space-y-4">
      <div style={card}>
        <p style={{ ...sLabel, marginBottom: 12 }}>Tap a region to log pain</p>
        <p style={{ fontSize: 11, color: "var(--mauve)", marginBottom: 14 }}>
          Select a body area, then fill in the details below.
        </p>

        {/* SVG body diagram */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <svg viewBox="0 0 200 280" width="180" height="252" style={{ overflow: "visible" }}>
            {/* Simple torso outline */}
            <ellipse cx="100" cy="60" rx="28" ry="32" fill="var(--ivory-dark)" stroke="var(--border)" strokeWidth="1.5" />
            <path d="M72 88 Q60 100 62 140 Q64 190 72 240 L100 245 L128 240 Q136 190 138 140 Q140 100 128 88 Z" fill="var(--ivory-dark)" stroke="var(--border)" strokeWidth="1.5" />
            {/* Tappable regions */}
            {REGIONS.filter(r => !r.back).map(r => {
              const logged = loggedRegionIds.has(r.id);
              const isSelected = selected === r.id;
              return (
                <g key={r.id} onClick={() => setSelected(isSelected ? null : r.id)} style={{ cursor: "pointer" }}>
                  <circle
                    cx={r.cx} cy={r.cy} r="14"
                    fill={isSelected ? "var(--rose-dust)" : logged ? "var(--rose-dust-subtle)" : "rgba(196,132,154,0.12)"}
                    stroke={isSelected ? "var(--rose-dust)" : logged ? "var(--rose-dust-light)" : "var(--border)"}
                    strokeWidth="1.5"
                  />
                  <text x={r.cx} y={r.cy + 4} textAnchor="middle" fontSize="7" fill={isSelected ? "white" : "var(--plum)"} fontWeight="600">
                    {r.label.split(" ")[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Region buttons */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {REGIONS.map(r => {
            const logged = loggedRegionIds.has(r.id);
            const isSelected = selected === r.id;
            return (
              <button key={r.id} onClick={() => setSelected(isSelected ? null : r.id)}
                style={{ borderRadius: 9999, padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", border: "1.5px solid",
                  backgroundColor: isSelected ? "var(--plum)" : logged ? "var(--rose-dust-subtle)" : "var(--ivory-dark)",
                  borderColor: isSelected ? "var(--plum)" : logged ? "var(--rose-dust-light)" : "var(--border)",
                  color: isSelected ? "white" : logged ? "var(--rose-dust)" : "var(--mauve)" }}>
                {r.label}
                {logged && !isSelected && " •"}
              </button>
            );
          })}
        </div>

        {selected && (
          <div style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border)", borderRadius: 14, padding: 14 }} className="space-y-3">
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", }}>
              {REGIONS.find(r => r.id === selected)?.label}
            </p>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <p style={{ fontSize: 11, color: "var(--mauve)", }}>Severity</p>
                <strong style={{ fontSize: 11, color: "var(--plum)", }}>{severity}/5</strong>
              </div>
              <input type="range" min={1} max={5} value={severity} onChange={e => setSeverity(+e.target.value)} style={{ width: "100%" }} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: "var(--mauve)", marginBottom: 6 }}>Pain type</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {PAIN_TYPES.map(t => (
                  <button key={t} onClick={() => setPainType(t)}
                    style={{ borderRadius: 9999, padding: "4px 10px", fontSize: 11, fontWeight: 500, cursor: "pointer", border: "1px solid", textTransform: "capitalize",
                      backgroundColor: painType === t ? "var(--plum)" : "transparent",
                      borderColor: painType === t ? "var(--plum)" : "var(--border)",
                      color: painType === t ? "white" : "var(--mauve)" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)"
              style={{ width: "100%", padding: "7px 12px", borderRadius: 10, border: "1px solid var(--border)", backgroundColor: "var(--surface)", fontSize: 12, color: "var(--plum)", outline: "none", boxSizing: "border-box" }}
            />
            <button onClick={logPain} disabled={saving}
              style={{ width: "100%", padding: 10, borderRadius: 10, fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer", backgroundColor: "var(--plum)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? "Saving..." : "Log pain"}
            </button>
          </div>
        )}
      </div>

      {logs.length > 0 && (
        <div style={card}>
          <p style={{ ...sLabel, marginBottom: 10 }}>Logged on {selectedDate}</p>
          <div className="space-y-2">
            {logs.map(l => (
              <div key={l.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 10, backgroundColor: "var(--ivory)", border: "1px solid var(--border-subtle)" }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--plum)", textTransform: "capitalize" }}>
                    {REGIONS.find(r => r.id === l.region)?.label || l.region}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--mauve)", textTransform: "capitalize" }}>
                    {l.pain_type} · {l.severity}/5
                  </p>
                </div>
                <button onClick={() => remove(l.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                  <Trash2 style={{ width: 13, height: 13, color: "var(--mauve)" }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}