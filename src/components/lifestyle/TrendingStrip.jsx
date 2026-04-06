import CategoryPill from "./CategoryPill";

export default function TrendingStrip({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-4">
      <p className="text-xs font-semibold uppercase tracking-wider mb-2.5 px-1" style={{ color: "var(--mauve)" }}>Trending Now</p>
      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {items.slice(0, 6).map((item) => (
          <a
            key={item.id}
            href={item.content_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-36 rounded-xl overflow-hidden"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            {item.image_url ? (
              <div className="h-20 overflow-hidden" style={{ backgroundColor: "var(--ivory-dark)" }}>
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-20 flex items-center justify-center" style={{ backgroundColor: "var(--rose-dust-subtle)" }} />
            )}
            <div className="p-2">
              <CategoryPill category={item.category} />
              <p className="text-xs font-semibold mt-1 line-clamp-2 leading-tight" style={{ color: "var(--plum)" }}>{item.title}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}