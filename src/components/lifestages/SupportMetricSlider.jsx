export default function SupportMetricSlider({ emoji, label, value, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-700">{emoji} {label}</span>
        <span className="text-xs font-semibold text-rose-500">{value}/5</span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}