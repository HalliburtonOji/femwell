import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Search, Bookmark, BookmarkCheck, Play, Clock, ChevronRight } from "lucide-react";

const CONTENT_TYPES = [
  { id: "all", label: "All", emoji: "✨" },
  { id: "MEDITATION", label: "Meditation", emoji: "🧘" },
  { id: "BREATHWORK", label: "Breathwork", emoji: "🌬️" },
  { id: "WORKOUT", label: "Fitness", emoji: "💪" },
  { id: "MOBILITY", label: "Mobility", emoji: "🤸" },
  { id: "GUIDE", label: "Guides", emoji: "📖" },
];

const LEVEL_COLORS = {
  beginner: "bg-emerald-100 text-emerald-600",
  intermediate: "bg-amber-100 text-amber-600",
  advanced: "bg-rose-100 text-rose-600",
};

const TYPE_GRADIENTS = {
  MEDITATION: "from-purple-200 to-indigo-200",
  BREATHWORK: "from-sky-200 to-cyan-200",
  WORKOUT: "from-orange-200 to-rose-200",
  MOBILITY: "from-emerald-200 to-teal-200",
  GUIDE: "from-amber-200 to-yellow-200",
};

const TYPE_EMOJIS = {
  MEDITATION: "🧘",
  BREATHWORK: "🌬️",
  WORKOUT: "💪",
  MOBILITY: "🤸",
  GUIDE: "📖",
};

function ContentCard({ item, bookmarked, onBookmark }) {
  const gradient = TYPE_GRADIENTS[item.content_type] || "from-rose-200 to-pink-200";

  return (
    <a href={createPageUrl(`ContentPlayer?id=${item.id}`)} className="block card-glass rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      <div className={`h-36 bg-gradient-to-br ${gradient} relative flex items-center justify-center`}>
        {item.thumbnail_url ? (
          <img src={item.thumbnail_url} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">{TYPE_EMOJIS[item.content_type]}</span>
        )}
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md">
          <Play className="w-3.5 h-3.5 text-rose-600 ml-0.5" />
        </div>
        <button
          onClick={(e) => { e.preventDefault(); onBookmark(item.id); }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md"
        >
          {bookmarked ? (
            <BookmarkCheck className="w-4 h-4 text-rose-600" />
          ) : (
            <Bookmark className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>
      <div className="p-3">
        <p className="font-semibold text-gray-800 text-sm leading-tight mb-1">{item.title}</p>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {item.duration_minutes && (
            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{item.duration_minutes}m</span>
          )}
          {item.level && (
            <span className={`px-2 py-0.5 rounded-full ${LEVEL_COLORS[item.level]}`}>{item.level}</span>
          )}
        </div>
        {item.summary && <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{item.summary}</p>}
      </div>
    </a>
  );
}

export default function Explore() {
  const [user, setUser] = useState(null);
  const [content, setContent] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [items, bks] = await Promise.all([
        base44.entities.ContentItems.list("-created_date", 50),
        base44.entities.ContentBookmarks.filter({ user_id: u.id }),
      ]);
      setContent(items);
      setBookmarks(bks.map((b) => b.content_id));
      setLoading(false);
    })();
  }, []);

  const toggleBookmark = async (contentId) => {
    if (bookmarks.includes(contentId)) {
      const bks = await base44.entities.ContentBookmarks.filter({ user_id: user.id, content_id: contentId });
      if (bks[0]) await base44.entities.ContentBookmarks.delete(bks[0].id);
      setBookmarks((b) => b.filter((x) => x !== contentId));
    } else {
      await base44.entities.ContentBookmarks.create({ user_id: user.id, content_id: contentId, created_at: new Date().toISOString() });
      setBookmarks((b) => [...b, contentId]);
    }
  };

  const filtered = content.filter((c) => {
    const typeMatch = filter === "all" || c.content_type === filter;
    const searchMatch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.summary?.toLowerCase().includes(search.toLowerCase());
    return typeMatch && searchMatch;
  });

  const featured = content.filter((c) => c.is_featured).slice(0, 3);

  if (loading) return (
    <div className="min-h-screen femwell-gradient flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen femwell-gradient pb-28">
      <div className="max-w-md mx-auto px-4">
        <div className="pt-12 pb-4">
          <h1 className="text-2xl font-bold text-rose-900">Explore</h1>
          <p className="text-sm text-gray-400">Your wellness library</p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search practices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-3 rounded-2xl bg-white/80 border border-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 shadow-sm"
          />
        </div>

        {/* Type filters */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {CONTENT_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === t.id ? "bg-rose-500 text-white shadow-md" : "bg-white/70 text-gray-500 hover:bg-white"
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* Featured */}
        {filter === "all" && !search && featured.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-700 text-sm">Featured</h2>
            </div>
            <div className="space-y-3">
              {featured.map((item) => (
                <ContentCard key={item.id} item={item} bookmarked={bookmarks.includes(item.id)} onBookmark={toggleBookmark} />
              ))}
            </div>
          </div>
        )}

        {/* Bookmarks shortcut */}
        {bookmarks.length > 0 && filter === "all" && !search && (
          <div className="card-glass rounded-2xl p-4 mb-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-700 text-sm">Saved Practices</p>
              <p className="text-xs text-gray-400">{bookmarks.length} bookmarked</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        )}

        {/* All content */}
        <div>
          <h2 className="font-semibold text-gray-700 text-sm mb-3">
            {filter === "all" ? "All Practices" : CONTENT_TYPES.find((t) => t.id === filter)?.label}
            <span className="text-gray-400 font-normal ml-1">({filtered.length})</span>
          </h2>
          {filtered.length === 0 ? (
            <div className="card-glass rounded-2xl p-8 text-center text-gray-400">
              <p className="text-sm">No content found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((item) => (
                <ContentCard key={item.id} item={item} bookmarked={bookmarks.includes(item.id)} onBookmark={toggleBookmark} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}