const TONE_STYLES = {
  rose:    { backgroundColor: "var(--rose-dust-subtle)",  color: "var(--rose-dust)" },
  violet:  { backgroundColor: "var(--mauve-subtle)",       color: "var(--mauve)" },
  amber:   { backgroundColor: "#FFF8EE",                   color: "#A07830" },
  emerald: { backgroundColor: "var(--sage-subtle)",        color: "var(--sage)" },
};

export default function InsightStatCard({ label, value, subtext, tone = "rose" }) {
  const toneStyle = TONE_STYLES[tone] || TONE_STYLES.rose;

  return (
    <div className="rounded-2xl p-4"
      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
      <div className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide" style={toneStyle}>
        {label}
      </div>
      <p className="mt-3 text-2xl font-black" style={{ color: "var(--plum)" }}>{value}</p>
      <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--mauve)" }}>{subtext}</p>
    </div>
  );
}