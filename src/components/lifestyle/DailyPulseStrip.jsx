export default function DailyPulseStrip({ items }) {
  if (!items?.length) return null;

  return (
    <div className="mb-5">
      <div className="mb-3 flex items-end justify-between gap-3 px-1">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--mauve)" }}>Daily Pulse</p>
          <h2 className="text-lg font-bold" style={{ color: "var(--plum)" }}>5 quick reads for today</h2>
        </div>
        <p className="text-[11px]" style={{ color: "var(--mauve)" }}>Refreshes daily</p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {items.slice(0, 5).map((item, index) => (
          <a
            key={item.id}
            href={`/LifestyleDetail?id=${item.id}`}
            className="w-[230px] flex-shrink-0 rounded-3xl p-4"
            style={{ border: "1px solid var(--rose-dust-light)", backgroundColor: "var(--surface)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="mb-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em]"
              style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }}>
              Pulse {index + 1}
            </div>
            <h3 className="text-sm font-semibold leading-snug" style={{ color: "var(--plum)" }}>{item.title}</h3>
            <p className="mt-2 text-[12px] leading-relaxed overflow-hidden" style={{ color: "var(--mauve)", display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {item.summary || "Open for the quick breakdown and key takeaways."}
            </p>
            <p className="mt-2 text-[11px]" style={{ color: "var(--mauve)", opacity: 0.7 }}>{item.source_name}</p>
          </a>
        ))}
      </div>
    </div>
  );
}