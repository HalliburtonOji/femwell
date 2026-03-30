export default function ProgramProgressBar({ value = 0, className = "" }) {
  const safe = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  return (
    <div className={`h-1.5 overflow-hidden rounded-full ${className}`.trim()}
      style={{ backgroundColor: "var(--border)" }}>
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${safe}%`, backgroundColor: "var(--plum)" }}
      />
    </div>
  );
}