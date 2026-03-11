export default function ProgramProgressBar({ value = 0, className = "" }) {
  const safeValue = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-rose-100 ${className}`.trim()}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-300"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}