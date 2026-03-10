export default function InsightStatCard({ label, value, subtext, tone = "rose" }) {
  const tones = {
    rose: "from-rose-100 to-pink-100 text-rose-700",
    violet: "from-violet-100 to-fuchsia-100 text-violet-700",
    amber: "from-amber-100 to-orange-100 text-amber-700",
    emerald: "from-emerald-100 to-teal-100 text-emerald-700",
  };

  return (
    <div className="card-glass rounded-2xl p-4">
      <div className={`inline-flex rounded-full bg-gradient-to-r px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${tones[tone] || tones.rose}`}>
        {label}
      </div>
      <p className="mt-3 text-2xl font-black text-gray-800">{value}</p>
      <p className="mt-1 text-xs text-gray-400 leading-relaxed">{subtext}</p>
    </div>
  );
}