export default function DailyPulseStrip({ items }) {
  if (!items?.length) return null;

  return (
    <div className="mb-5">
      <div className="mb-3 flex items-end justify-between gap-3 px-1">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Daily Pulse</p>
          <h2 className="text-lg font-bold text-gray-900">5 quick reads for today</h2>
        </div>
        <p className="text-[11px] text-gray-400">Refreshes daily</p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {items.slice(0, 5).map((item, index) => (
          <a
            key={item.id}
            href={item.content_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-[230px] flex-shrink-0 rounded-3xl border border-rose-100 bg-white p-4 shadow-sm"
          >
            <div className="mb-3 inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-rose-600">
              Pulse {index + 1}
            </div>
            <h3 className="text-sm font-semibold leading-snug text-gray-900">{item.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">{item.summary || "Open for the quick breakdown and key takeaways."}</p>
          </a>
        ))}
      </div>
    </div>
  );
}