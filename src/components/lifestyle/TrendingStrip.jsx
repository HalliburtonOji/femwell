import CategoryPill from "./CategoryPill";

export default function TrendingStrip({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5 px-1">🔥 Trending Now</p>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {items.slice(0, 6).map((item) => (
          <a
            key={item.id}
            href={item.content_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-36 card-glass rounded-xl overflow-hidden hover:shadow-md transition-shadow"
          >
            {item.image_url ? (
              <div className="h-20 overflow-hidden bg-gray-100">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-20 bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center text-2xl">
                {item.category === "Relationships" ? "💛" : item.category === "Mental Health" ? "🌊" : item.category === "Nutrition" ? "🥦" : "🌸"}
              </div>
            )}
            <div className="p-2">
              <CategoryPill category={item.category} />
              <p className="text-xs font-semibold text-gray-700 mt-1 line-clamp-2 leading-tight">{item.title}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}