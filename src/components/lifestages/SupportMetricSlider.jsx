export default function SupportMetricSlider({ label, value, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium" style={{ color: "var(--plum)" }}>{label}</span>
        <span className="text-xs font-semibold" style={{ color: "var(--rose-dust)" }}>{value}/5</span>
      </div>
      <input type="range" min="1" max="5" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}