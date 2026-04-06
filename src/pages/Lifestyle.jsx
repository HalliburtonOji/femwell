import { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, BookOpen, Play, BookMarked, FileText, Bookmark, BookmarkCheck, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import FeedSkeleton from "../components/lifestyle/FeedSkeleton";

function stripHtml(str) {
  if (!str) return "";
  return str
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#\d+;/g, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}

function getMonday() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

const TABS = [
  { id: "for_you",  label: "For You"  },
  { id: "articles", label: "Read"     },
  { id: "watch",    label: "Watch"    },
  { id: "stories",  label: "Stories"  },
  { id: "femwell",  label: "FemWell"  },
  { id: "books",    label: "Books"    },
];

function VideoCard({ item, onSave, saved }) {
  const [playing, setPlaying] = useState(false);
  const [localSaved, setLocalSaved] = useState(saved);
  const handleSave = async () => {
    const next = !localSaved;
    setLocalSaved(next);
    onSave?.(item.id, next);
    await base44.functions.invoke("recordLifestyleAction", { item_id: item.id, action: next ? "save" : "unsave", category: item.category }).catch(() => {});
  };
  const videoId = item.video_id || (item.content_url?.match(/[?&]v=([^&]+)/)?.[1]) || (item.embed_url?.match(/embed\/([A-Za-z0-9_-]{11})/)?.[1]);
  const thumb = item.image_url || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "");
  const embedSrc = videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&autoplay=1` : "";
  return (
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", borderRadius: 16, overflow: "hidden", marginBottom: 14 }}>
      <div style={{ position: "relative", paddingBottom: "56.25%", backgroundColor: "#111" }}>
        {playing && embedSrc ? (
          <iframe src={embedSrc} title={item.title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        ) : (
          <button onClick={() => setPlaying(true)}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", padding: 0, cursor: "pointer", background: "none" }}>
            {thumb && <img src={thumb} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
            <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.18)" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: 9999, backgroundColor: "rgba(255,255,255,0.93)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.22)" }}>
                <Play style={{ width: 20, height: 20, color: "var(--plum)", marginLeft: 3 }} fill="currentColor" />
              </div>
            </div>
          </button>
        )}
      </div>
      <div style={{ padding: "12px 14px 14px" }}>
        {item.category && (
          <span style={{ fontSize: 10, fontWeight: 600, color: "var(--rose-dust)", backgroundColor: "var(--rose-dust-subtle)", borderRadius: 9999, padding: "2px 8px", marginBottom: 6, display: "inline-block", fontFamily: "'Inter', sans-serif" }}>
            {item.category}
          </span>
        )}
        {(item.channel_name || item.source_name) && (
          <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>{item.channel_name || item.source_name}</p>
        )}
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.4, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {item.title}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href={item.content_url} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 12, fontWeight: 600, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif", textDecoration: "none" }}>
            Watch on YouTube
          </a>
          <button onClick={handleSave} style={{ border: "none", background: "none", cursor: "pointer", padding: 2 }}>
            {localSaved ? <BookmarkCheck style={{ width: 17, height: 17, color: "var(--rose-dust)" }} /> : <Bookmark style={{ width: 17, height: 17, color: "var(--mauve)" }} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function ContentCard({ item, onSave, saved, isStory }) {
  const [expanded, setExpanded] = useState(false);
  const [localSaved, setLocalSaved] = useState(saved);
  const handleSave = async () => {
    const next = !localSaved;
    setLocalSaved(next);
    onSave?.(item.id, next);
    await base44.functions.invoke("recordLifestyleAction", { item_id: item.id, action: next ? "save" : "unsave", category: item.category }).catch(() => {});
  };
  const handleOpen = () => {
    window.open(item.content_url, "_blank", "noopener,noreferrer");
    base44.functions.invoke("recordLifestyleAction", { item_id: item.id, action: "open", category: item.category }).catch(() => {});
  };
  const takeaways = [item.takeaway_1, item.takeaway_2, item.takeaway_3].filter(Boolean);
  const displayText = stripHtml(item.summary || item.lede || "");
  return (
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", borderRadius: 16, overflow: "hidden", marginBottom: 14 }}>
      {item.image_url && (
        <div style={{ width: "100%", height: 180, overflow: "hidden" }}>
          <img src={item.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={(e) => { e.target.style.display = "none"; }} />
        </div>
      )}
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          {isStory && item.emotional_tag && (
            <span style={{ fontSize: 11, fontWeight: 600, color: "#7c3aed", background: "#ede9fe", borderRadius: 20, padding: "2px 9px" }}>{item.emotional_tag}</span>
          )}
          {item.category && (
            <span style={{ fontSize: 11, fontWeight: 500, color: "var(--rose-dust)", background: "var(--rose-dust-subtle)", borderRadius: 20, padding: "2px 9px" }}>{item.category}</span>
          )}
          {item.phase_tags?.length > 0 && item.phase_tags.slice(0, 2).map(pt => (
            <span key={pt} style={{ fontSize: 10, fontWeight: 500, color: "var(--mauve)", background: "var(--ivory-dark)", borderRadius: 20, padding: "2px 8px" }}>{pt}</span>
          ))}
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--plum)", lineHeight: 1.4, margin: "0 0 6px" }}>{item.title}</h3>
        {displayText ? (
          <p style={{ fontSize: 13, color: "var(--mauve)", lineHeight: 1.55, margin: "0 0 10px" }}>{displayText}</p>
        ) : null}
        {takeaways.length > 0 && (
          <div>
            <button onClick={() => setExpanded(v => !v)} style={{ fontSize: 12, color: "var(--rose-dust)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 3, marginBottom: expanded ? 8 : 0 }}>
              {expanded ? "Hide takeaways" : "Key takeaways"} {expanded ? <ChevronUp style={{ width: 13, height: 13 }} /> : <ChevronDown style={{ width: 13, height: 13 }} />}
            </button>
            {expanded && (
              <ul style={{ margin: "0 0 10px", paddingLeft: 16 }}>
                {takeaways.map((t, i) => <li key={i} style={{ fontSize: 13, color: "var(--plum)", lineHeight: 1.5, marginBottom: 4 }}>{t}</li>)}
              </ul>
            )}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
            {item.author_name && <span style={{ fontSize: 12, color: "var(--mauve)" }}>{item.author_name}</span>}
            {item.source_name && <span style={{ fontSize: 12, color: "var(--mauve)", opacity: 0.6 }}>{item.author_name ? "· " : ""}{item.source_name}</span>}
            {item.pub_date && <span style={{ fontSize: 11, color: "var(--mauve)", opacity: 0.4 }}>· {timeAgo(item.pub_date)}</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={handleSave} style={{ border: "none", background: "none", cursor: "pointer", padding: 2 }}>
              {localSaved ? <BookmarkCheck style={{ width: 16, height: 16, color: "var(--rose-dust)" }} /> : <Bookmark style={{ width: 16, height: 16, color: "var(--mauve)" }} />}
            </button>
            <button onClick={handleOpen} className="btn-primary" style={{ fontSize: 12, padding: "5px 14px" }}>Read</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookCard({ book }) {
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const cover = book.cover_url || (book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg` : null);
  return (
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", borderRadius: 18, overflow: "hidden", marginBottom: 14 }}>
      <div style={{ display: "flex", gap: 14, padding: "16px 16px 0" }}>
        {cover && (
          <div style={{ flexShrink: 0, width: 72, height: 108, borderRadius: 8, overflow: "hidden", boxShadow: "0 4px 12px rgba(42,32,53,0.15)" }}>
            <img src={cover} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={(e) => { e.target.style.display = "none"; }} />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--plum)", margin: "0 0 2px", lineHeight: 1.3 }}>{book.title}</h3>
              <p style={{ fontSize: 12, color: "var(--mauve)", margin: "0 0 8px", fontStyle: "italic" }}>{book.author}</p>
              {book.category && <span style={{ fontSize: 11, fontWeight: 600, color: "var(--rose-dust)", background: "var(--rose-dust-subtle)", borderRadius: 20, padding: "2px 9px" }}>{book.category}</span>}
            </div>
            <button onClick={() => setSaved(v => !v)} style={{ border: "none", background: "none", cursor: "pointer", padding: 2, flexShrink: 0 }}>
              {saved ? <BookmarkCheck style={{ width: 17, height: 17, color: "var(--rose-dust)" }} /> : <Bookmark style={{ width: 17, height: 17, color: "var(--mauve)" }} />}
            </button>
          </div>
          {book.tagline && <p style={{ fontSize: 13, color: "var(--plum)", lineHeight: 1.45, margin: "8px 0 0", fontWeight: 500 }}>{book.tagline}</p>}
        </div>
      </div>
      <div style={{ padding: "12px 16px 0" }}>
        {book.summary && <p style={{ fontSize: 13, color: "var(--mauve)", lineHeight: 1.6, margin: "0 0 10px" }}>{book.summary}</p>}
        {book.best_for && (
          <div style={{ background: "var(--ivory-dark)", borderRadius: 10, padding: "8px 12px", marginBottom: 12 }}>
            <p style={{ fontSize: 12, color: "var(--plum)", fontWeight: 600, margin: 0 }}>{book.best_for}</p>
          </div>
        )}
        <button onClick={() => setExpanded(v => !v)} style={{ fontSize: 12, color: "var(--rose-dust)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 3, marginBottom: expanded ? 10 : 16 }}>
          {expanded ? "Less" : "5 key lessons"} {expanded ? <ChevronUp style={{ width: 13, height: 13 }} /> : <ChevronDown style={{ width: 13, height: 13 }} />}
        </button>
        {expanded && (
          <div style={{ marginBottom: 14 }}>
            {book.key_lessons?.map((lesson, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: "50%", background: "var(--rose-dust-subtle)", color: "var(--rose-dust)", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                <p style={{ fontSize: 13, color: "var(--plum)", lineHeight: 1.5, margin: 0 }}>{lesson}</p>
              </div>
            ))}
            {book.quote && (
              <blockquote style={{ borderLeft: "3px solid var(--rose-dust-light)", paddingLeft: 12, margin: "12px 0 0", fontStyle: "italic", color: "var(--mauve)", fontSize: 13, lineHeight: 1.55 }}>"{book.quote}"</blockquote>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
              {book.read_time_mins && <span style={{ fontSize: 12, color: "var(--mauve)" }}>{Math.round(book.read_time_mins / 60)}h read</span>}
              {book.femwell_connection && <span style={{ fontSize: 12, color: "var(--mauve)" }}>· Try in {book.femwell_connection}</span>}
              {book.goodreads_url && <a href={book.goodreads_url} target="_blank" rel="noreferrer" style={{ marginLeft: "auto", fontSize: 12, color: "var(--rose-dust)", fontWeight: 600, textDecoration: "none" }}>Goodreads</a>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BooksTab() {
  const [weekPick, setWeekPick] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const weekStart = getMonday();
        const picks = await base44.entities.WeeklyBookPick.filter({ week_start: weekStart, status: "PUBLISHED" });
        if (picks.length > 0) { setWeekPick(picks[0]); }
        else {
          const allPicks = await base44.entities.WeeklyBookPick.list("-created_date", 1);
          if (allPicks.length > 0) setWeekPick(allPicks[0]);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);
  if (loading) return <FeedSkeleton />;
  if (!weekPick || !weekPick.books?.length) {
    return (
      <div style={{ textAlign: "center", padding: "48px 24px" }}>
        <BookOpen style={{ width: 36, height: 36, color: "var(--rose-dust-light)", margin: "0 auto 12px" }} />
        <p style={{ color: "var(--mauve)", fontSize: 14, margin: 0 }}>This week's picks are being curated.</p>
        <p style={{ color: "var(--mauve)", fontSize: 12, marginTop: 4, opacity: 0.6 }}>Check back Monday morning.</p>
      </div>
    );
  }
  const weekLabel = new Date(weekPick.week_start + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long" });
  return (
    <div>
      <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", borderRadius: 16, padding: "16px 18px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <BookMarked style={{ width: 15, height: 15, color: "var(--rose-dust)" }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--rose-dust)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Week of {weekLabel}</span>
        </div>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--plum)", margin: "0 0 4px", fontFamily: "'Playfair Display', serif" }}>5 Books This Week</h2>
        <p style={{ fontSize: 13, color: "var(--mauve)", margin: 0 }}>Each one summarised with key lessons — read more in minutes.</p>
      </div>
      {weekPick.books.map((book, i) => <BookCard key={i} book={book} />)}
    </div>
  );
}

export default function Lifestyle() {
  const [tab, setTab] = useState(() => {
    const p = new URLSearchParams(window.location.search).get("tab");
    return p && ["for_you","articles","watch","stories","femwell","books"].includes(p) ? p : "for_you";
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [savedIds, setSavedIds] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const loaderRef = useRef(null);

  const loadItems = useCallback(async (activeTab, pageNum = 0, isRefresh = false) => {
    if (activeTab === "books") return;
    if (pageNum === 0) { isRefresh ? setRefreshing(true) : setLoading(true); setItems([]); }
    else setLoadingMore(true);
    try {
      const PAGE_SIZE = 15;
      let allItems = await base44.entities.LifestyleItems.list("-pub_date", 500);
      if (activeTab === "for_you") {
        try {
          const u = await base44.auth.me();
          const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
          const forYouIds = profiles[0]?.for_you_item_ids;
          if (forYouIds?.length > 0) {
            const forYouSet = new Set(forYouIds.slice(0, 10));
            allItems = allItems.filter(it => forYouSet.has(it.id));
          } else {
            allItems = allItems.filter(it => it.status === "PUBLISHED").slice(0, 10);
          }
        } catch {
          allItems = allItems.filter(it => it.status === "PUBLISHED").slice(0, 10);
        }
      } else if (activeTab === "trends") {
        allItems = allItems.filter(it => it.content_type === "TREND" && it.status === "PUBLISHED");
      } else if (activeTab === "femwell") {
        allItems = allItems.filter(it => it.provider === "FEMWELL_AI" && it.status === "PUBLISHED");
      } else if (activeTab === "watch") {
        allItems = allItems.filter(it => it.media_type === "VIDEO" || it.content_type === "VIDEO");
      } else if (activeTab === "stories") {
        allItems = allItems.filter(it => it.content_type === "STORY");
      } else if (activeTab === "articles") {
        allItems = allItems.filter(it => (it.content_type === "ARTICLE" || !it.content_type) && it.media_type !== "VIDEO");
      } else {
        allItems = allItems.filter(it => it.status === "PUBLISHED" || it.status === "NEEDS_REVIEW");
      }
      const start = pageNum * PAGE_SIZE;
      setItems(prev => pageNum === 0 ? allItems.slice(start, start + PAGE_SIZE) : [...prev, ...allItems.slice(start, start + PAGE_SIZE)]);
      setHasMore(allItems.length > start + PAGE_SIZE);
      setPage(pageNum);
    } catch (e) { console.error(e); }
    setLoading(false); setRefreshing(false); setLoadingMore(false);
  }, []);

  useEffect(() => { loadItems(tab, 0); }, [tab]);

  useEffect(() => {
    if (!loaderRef.current || tab === "books") return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) loadItems(tab, page + 1);
    }, { threshold: 0.1 });
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page, tab, loadItems]);

  const handleSave = (id, isSaved) => setSavedIds(prev => { const next = new Set(prev); isSaved ? next.add(id) : next.delete(id); return next; });

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      <style>{`.lf-scroll::-webkit-scrollbar{display:none}.lf-scroll{-ms-overflow-style:none;scrollbar-width:none}@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.lf-fade{animation:fadeUp 0.3s ease forwards}`}</style>
      <div className="max-w-3xl mx-auto px-4">
        <div style={{ paddingTop: 48, paddingBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", marginBottom: 4 }}>Your feed</p>
            <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: "var(--plum)", letterSpacing: "-0.02em", margin: 0 }}>Lifestyle</h1>
          </div>
          <button onClick={() => loadItems(tab, 0, true)} disabled={refreshing} style={{ width: 36, height: 36, borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <RefreshCw style={{ width: 15, height: 15, color: "var(--rose-dust)" }} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
        <div className="lf-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 20 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flexShrink: 0, padding: "7px 16px", borderRadius: 9999, fontSize: 12, fontWeight: 600, border: tab === t.id ? "none" : "1px solid var(--border)", cursor: "pointer", transition: "all 0.15s", background: tab === t.id ? "var(--plum)" : "var(--surface)", color: tab === t.id ? "#fff" : "var(--mauve)", whiteSpace: "nowrap" }}>
              {t.label}
            </button>
          ))}
        </div>
        {tab === "books" && <BooksTab />}
        {tab !== "books" && (
          <>
            {tab === "watch" && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                  <Play style={{ width: 13, height: 13, color: "var(--rose-dust)" }} fill="currentColor" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--plum)" }}>Curated YouTube</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--mauve)", margin: 0 }}>Dr. Mindy Pelz · Yoga With Adriene · Blogilates · Dr. Stacy Sims · and more</p>
              </div>
            )}
            {tab === "stories" && (
              <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 16px", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                  <FileText style={{ width: 14, height: 14, color: "var(--mauve)" }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: "var(--mauve)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Personal Essays and Narrative</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--mauve)", margin: 0 }}>First-person stories about bodies, identity, relationships, and life — from Narratively, Longreads, Granta, and more.</p>
              </div>
            )}

            {tab === "femwell" && (
              <div style={{ background: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", borderRadius: 16, padding: "14px 16px", marginBottom: 16 }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: "var(--plum)", margin: "0 0 4px" }}>Written for you</h3>
                <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", margin: 0 }}>Stories and insights created by FemWell, tailored to your cycle and life.</p>
              </div>
            )}
            {loading ? <FeedSkeleton /> : items.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 24px" }}>
                <p style={{ color: "var(--mauve)", fontSize: 14, margin: 0 }}>
                  {tab === "watch" ? "No videos yet — run the ingestYouTubeChannels function to populate." : tab === "stories" ? "Stories are being curated. Check back soon." : "No content yet. Refresh to check for new items."}
                </p>
              </div>
            ) : (
              <div className="lf-fade">
                {items.map(item => {
                  const isVideo = item.media_type === "VIDEO" || item.content_type === "VIDEO" || !!item.video_id;
                  if (tab === "watch" || isVideo) {
                    return <VideoCard key={item.id} item={item} saved={savedIds.has(item.id)} onSave={handleSave} />;
                  }
                  return (
                    <ContentCard key={item.id} item={item} saved={savedIds.has(item.id)} onSave={handleSave}
                      isStory={tab === "stories" || (tab === "femwell" && item.content_type === "STORY")} />
                  );
                })}
              </div>
            )}
            {loadingMore && (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ width: 20, height: 20, border: "2px solid var(--rose-dust-light)", borderTopColor: "var(--rose-dust)", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto" }} />
              </div>
            )}
            <div ref={loaderRef} style={{ height: 40 }} />
          </>
        )}
      </div>
    </div>
  );
}