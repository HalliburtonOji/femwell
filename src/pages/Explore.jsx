import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Search, Bookmark, BookmarkCheck, Play, Clock, Lock, ChevronRight } from "lucide-react";

const TABS = ["Library", "Programs", "Community"];

const CONTENT_TYPES = [
  { id: "all", label: "All", emoji: "✨" },
  { id: "MEDITATION", label: "Meditation", emoji: "🧘" },
  { id: "BREATHWORK", label: "Breathwork", emoji: "🌬️" },
  { id: "WORKOUT", label: "Fitness", emoji: "💪" },
  { id: "MOBILITY", label: "Mobility", emoji: "🤸" },
  { id: "GUIDE", label: "Guides", emoji: "📖" },
];

const COLLECTIONS = [
  "Sleep Switch", "PMS Toolkit", "Desk Reset", "Calm Reset", "Menopause Calm", "Postpartum Gentle"
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
  MEDITATION: "🧘", BREATHWORK: "🌬️", WORKOUT: "💪", MOBILITY: "🤸", GUIDE: "📖",
};

function ContentCard({ item, bookmarked, onBookmark, userPlan }) {
  const gradient = TYPE_GRADIENTS[item.content_type] || "from-rose-200 to-pink-200";
  const tierOrder = { free: 0, plus: 1, pro: 2 };
  const planOrder = { free: 0, plus: 1, pro: 2 };
  const locked = (tierOrder[item.access_tier] || 0) > (planOrder[userPlan] || 0);

  return (
    <a
      href={createPageUrl(`ContentPlayer?id=${item.id}`)}
      className="block card-glass rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className={`h-36 bg-gradient-to-br ${gradient} relative flex items-center justify-center`}>
        {item.thumbnail_url ? (
          <img src={item.thumbnail_url} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">{TYPE_EMOJIS[item.content_type]}</span>
        )}
        <div className="absolute inset-0 bg-black/10" />
        {locked && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Lock className="w-7 h-7 text-white" />
          </div>
        )}
        {!locked && (
          <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md">
            <Play className="w-3.5 h-3.5 text-rose-600 ml-0.5" />
          </div>
        )}
        <button
          onClick={(e) => { e.preventDefault(); onBookmark(item.id); }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md"
        >
          {bookmarked ? <BookmarkCheck className="w-4 h-4 text-rose-600" /> : <Bookmark className="w-4 h-4 text-gray-400" />}
        </button>
        {item.access_tier && item.access_tier !== "free" && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold uppercase">
            {item.access_tier}
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-gray-800 text-sm leading-tight mb-1 line-clamp-2">{item.title}</p>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {item.duration_minutes && (
            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{item.duration_minutes}m</span>
          )}
          {item.level && (
            <span className={`px-2 py-0.5 rounded-full ${LEVEL_COLORS[item.level]}`}>{item.level}</span>
          )}
        </div>
      </div>
    </a>
  );
}

function LibraryTab({ user, userPlan }) {
  const [content, setContent] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  useEffect(() => {
    (async () => {
      const [items, bks] = await Promise.all([
        base44.entities.ContentItems.list("-created_date", PAGE_SIZE),
        base44.entities.ContentBookmarks.filter({ user_id: user.id }),
      ]);
      setContent(items);
      setBookmarks(bks.map((b) => b.content_id));
      setLoading(false);
    })();
  }, []);

  const loadMore = async () => {
    const more = await base44.entities.ContentItems.list("-created_date", PAGE_SIZE, page * PAGE_SIZE);
    setContent((c) => [...c, ...more]);
    setPage((p) => p + 1);
  };

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
    const searchMatch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    const collectionMatch = !collection || c.collections?.includes(collection);
    return typeMatch && searchMatch && collectionMatch;
  });

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" /></div>;

  return (
    <div>
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
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
        {CONTENT_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${filter === t.id ? "bg-rose-500 text-white shadow-md" : "bg-white/70 text-gray-500 hover:bg-white"}`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Collections */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 no-scrollbar">
        {COLLECTIONS.map((col) => (
          <button
            key={col}
            onClick={() => setCollection(collection === col ? null : col)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${collection === col ? "border-rose-400 bg-rose-50 text-rose-600" : "border-gray-200 bg-white/60 text-gray-500"}`}
          >
            {col}
          </button>
        ))}
      </div>

      {/* Grid */}
      <p className="text-xs text-gray-400 mb-3">{filtered.length} practices</p>
      {filtered.length === 0 ? (
        <div className="card-glass rounded-2xl p-8 text-center text-gray-400">
          <p className="text-sm">No content found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((item) => (
              <ContentCard key={item.id} item={item} bookmarked={bookmarks.includes(item.id)} onBookmark={toggleBookmark} userPlan={userPlan} />
            ))}
          </div>
          {content.length % PAGE_SIZE === 0 && (
            <button onClick={loadMore} className="w-full mt-4 py-3 rounded-2xl bg-white/70 text-sm text-gray-500 font-medium hover:bg-white transition-all">
              Load more
            </button>
          )}
        </>
      )}
    </div>
  );
}

function ProgramsTab() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Programs.list("-created_date", 20).then(p => {
      setPrograms(p);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" /></div>;

  if (programs.length === 0) return (
    <div className="card-glass rounded-2xl p-8 text-center text-gray-400 mt-4">
      <p className="text-2xl mb-2">🌱</p>
      <p className="font-medium text-gray-500">Programs coming soon</p>
      <p className="text-sm mt-1">Structured wellness journeys will appear here.</p>
    </div>
  );

  return (
    <div className="space-y-3 mt-2">
      {programs.map((p) => (
        <a key={p.id} href={createPageUrl(`ProgramDetail?id=${p.id}`)} className="card-glass rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow block">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-200 to-pink-300 flex items-center justify-center text-2xl flex-shrink-0">
            🌸
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 text-sm">{p.title}</p>
            {p.duration_days && <p className="text-xs text-gray-400">{p.duration_days} days · {p.level || "all levels"}</p>}
            {p.description && <p className="text-xs text-gray-400 truncate mt-0.5">{p.description}</p>}
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
        </a>
      ))}
    </div>
  );
}

function CommunityTab() {
  return (
    <div className="card-glass rounded-2xl p-8 text-center text-gray-400 mt-4">
      <p className="text-3xl mb-3">💬</p>
      <p className="font-medium text-gray-500">Community coming soon</p>
      <p className="text-sm mt-1">A safe space to connect with others on their wellness journey.</p>
    </div>
  );
}

export default function Explore() {
  const [activeTab, setActiveTab] = useState("Library");
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState("free");

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const ents = await base44.entities.Entitlements.filter({ user_id: u.id });
      if (ents[0]) setUserPlan(ents[0].plan || "free");
    })();
  }, []);

  if (!user) return <div className="min-h-screen femwell-gradient flex items-center justify-center"><div className="w-10 h-10 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen femwell-gradient pb-28">
      <div className="max-w-md mx-auto px-4">
        <div className="pt-12 pb-4">
          <h1 className="text-2xl font-bold text-rose-900">Explore</h1>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTab === t ? "bg-rose-500 text-white shadow-md" : "bg-white/70 text-gray-500 hover:bg-white"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {activeTab === "Library" && <LibraryTab user={user} userPlan={userPlan} />}
        {activeTab === "Programs" && <ProgramsTab />}
        {activeTab === "Community" && <CommunityTab />}
      </div>
    </div>
  );
}