import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, X, Flag, MessageCircle } from "lucide-react";
import EchoWall from "../components/journal/echo/EchoWall";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "real_talk", label: "Real Talk" },
  { id: "gratitude", label: "Gratitude" },
  { id: "question", label: "Question" },
  { id: "cycle", label: "Cycle" },
  { id: "pcos", label: "PCOS" },
  { id: "endometriosis", label: "Endo" },
  { id: "pmdd", label: "PMDD" },
  { id: "menopause", label: "Menopause" },
  { id: "milestone", label: "Milestone" },
];

const CAT_COLORS = {
  real_talk:      { bg: "#FEE2E2", color: "#DC2626" },
  gratitude:      { bg: "#D1FAE5", color: "#059669" },
  question:       { bg: "#DBEAFE", color: "#2563EB" },
  cycle:          { bg: "#FEF3C7", color: "#D97706" },
  pcos:           { bg: "#EDE9FE", color: "#7C3AED" },
  endometriosis:  { bg: "#FCE7F3", color: "#DB2777" },
  pmdd:           { bg: "#F3F4F6", color: "#6B7280" },
  menopause:      { bg: "#FFF7ED", color: "#EA580C" },
  milestone:      { bg: "#ECFDF5", color: "#10B981" },
  general:        { bg: "#F3F4F6", color: "#6B7280" },
};

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

function getInitials(name) {
  if (!name || name === "Anonymous") return "?";
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

const PAGE_SIZE = 15;

export default function Community() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [newPost, setNewPost] = useState({ content: "", category: "general", anonymous: false });
  const [posting, setPosting] = useState(false);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [view, setView] = useState("echo"); // "echo" (Echo Wall) | "posts" (legacy feed)

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me().catch(() => null);
        setUser(u);
        if (u) {
          const profiles = await base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []);
          setProfile(profiles[0] || null);
        }
        await loadPosts(0, "all", true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadPosts = useCallback(async (pageNum, cat, initial = false) => {
    if (pageNum > 0) setLoadingMore(true);
    const query = { moderation_status: "approved" };
    if (cat !== "all") query.category = cat;
    const fetched = await base44.entities.Posts.filter(query, "-created_at", PAGE_SIZE * (pageNum + 1)).catch(() => []);
    const slice = fetched.slice(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE);
    if (initial || pageNum === 0) {
      setPosts(slice);
    } else {
      setPosts(prev => [...prev, ...slice]);
    }
    setHasMore(fetched.length > (pageNum + 1) * PAGE_SIZE);
    setPage(pageNum);
    setLoadingMore(false);
  }, []);

  const handleFilterChange = (cat) => {
    setFilter(cat);
    setPage(0);
    setPosts([]);
    setLoading(true);
    loadPosts(0, cat, true).finally(() => setLoading(false));
  };

  const handleLoadMore = () => loadPosts(page + 1, filter);

  const handleReact = async (post, reaction) => {
    const current = post.reactions?.[reaction] || 0;
    const updatedReactions = { ...(post.reactions || {}), [reaction]: current + 1 };
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, reactions: updatedReactions } : p));
    await base44.entities.Posts.update(post.id, { reactions: updatedReactions });
  };

  const handleReport = async (post) => {
    if (!user) return;
    await base44.entities.Reports.create({ post_id: post.id, reported_by: user.email, reason: "user_report", created_at: new Date().toISOString() }).catch(() => {});
    alert("Thank you — this post has been reported.");
  };

  const handlePost = async () => {
    if (!newPost.content.trim() || !user) return;
    setPosting(true);
    const displayName = newPost.anonymous ? "Anonymous" : (profile?.display_name || user.full_name || user.email.split("@")[0]);
    const created = await base44.entities.Posts.create({
      user_id: user.id,
      user_email: user.email,
      display_name: displayName,
      content: newPost.content.trim(),
      category: newPost.category,
      anonymous: newPost.anonymous,
      moderation_status: "approved",
      reactions: { feel_this: 0, same: 0, sending_love: 0 },
      reply_count: 0,
      created_at: new Date().toISOString(),
    });
    setPosts(prev => [created, ...prev]);
    setNewPost({ content: "", category: "general", anonymous: false });
    setShowNew(false);
    setPosting(false);
  };

  const toggleExpand = (id) => setExpandedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 pt-10 pb-3" style={{ backgroundColor: "rgba(250,248,245,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-xl mx-auto">
          <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Safe space</p>
          <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Fraunces', serif", color: "var(--plum)", letterSpacing: "-0.02em", marginBottom: 12 }}>Community</h1>
          {/* View toggle — Echo Wall (editorial, anonymous one-liners) vs the Posts feed */}
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {[{ id: "echo", label: "Echo Wall" }, { id: "posts", label: "Posts" }].map((v) => (
              <button key={v.id} onClick={() => setView(v.id)}
                style={{ padding: "7px 16px", borderRadius: 9999, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif", border: "none",
                  backgroundColor: view === v.id ? "var(--plum)" : "var(--ivory-dark)",
                  color: view === v.id ? "white" : "var(--mauve)" }}>
                {v.label}
              </button>
            ))}
          </div>
          {/* Category filter pills (Posts feed only) */}
          {view === "posts" && (
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }} className="lf-scroll">
            <style>{`.lf-scroll::-webkit-scrollbar{display:none}`}</style>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => handleFilterChange(cat.id)}
                style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 9999, fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", fontFamily: "'Inter', sans-serif", border: "none",
                  backgroundColor: filter === cat.id ? "var(--plum)" : "var(--ivory-dark)",
                  color: filter === cat.id ? "white" : "var(--mauve)" }}>
                {cat.label}
              </button>
            ))}
          </div>
          )}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-5">
        {view === "echo" ? (
          <EchoWall user={user} profile={profile} phase={null} lifeStage={profile?.life_stage || null} />
        ) : (
        <>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <MessageCircle className="w-10 h-10 mx-auto mb-4" style={{ color: "var(--rose-dust)", opacity: 0.4 }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--plum)", fontFamily: "'Fraunces', serif", marginBottom: 6 }}>No posts yet</p>
            <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Be the first to share something.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => {
              const cat = CAT_COLORS[post.category] || CAT_COLORS.general;
              const isExpanded = expandedIds.has(post.id);
              const content = post.content || "";
              const truncated = content.length > 220 && !isExpanded;
              return (
                <div key={post.id} style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "16px", boxShadow: "var(--shadow-sm)" }}>
                  {/* Header row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9999, backgroundColor: "var(--rose-dust-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>{getInitials(post.display_name)}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{post.display_name || "Anonymous"}</p>
                      <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{timeAgo(post.created_at)}</p>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, backgroundColor: cat.bg, color: cat.color, borderRadius: 9999, padding: "2px 9px", fontFamily: "'Inter', sans-serif", textTransform: "capitalize", flexShrink: 0 }}>
                      {(post.category || "general").replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* Content */}
                  <p style={{ fontSize: 14, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.65, marginBottom: 12 }}>
                    {truncated ? content.slice(0, 220) + "…" : content}
                    {content.length > 220 && (
                      <button onClick={() => toggleExpand(post.id)} style={{ color: "var(--rose-dust)", fontSize: 12, fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", marginLeft: 4 }}>
                        {isExpanded ? "show less" : "read more"}
                      </button>
                    )}
                  </p>

                  {/* Reactions + actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {[["feel_this", "💜"], ["same", "🙌"], ["sending_love", "💗"]].map(([key, emoji]) => (
                      <button key={key} onClick={() => handleReact(post, key)}
                        style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 9999, border: "1px solid var(--border)", backgroundColor: "var(--ivory)", cursor: "pointer", fontSize: 12, fontFamily: "'Inter', sans-serif", color: "var(--plum)", fontWeight: 500 }}>
                        {emoji} {post.reactions?.[key] || 0}
                      </button>
                    ))}
                    {post.reply_count > 0 && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                        <MessageCircle className="w-3.5 h-3.5" /> {post.reply_count}
                      </span>
                    )}
                    <button onClick={() => handleReport(post)} style={{ marginLeft: "auto", color: "var(--mauve)", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {hasMore && (
              <div className="flex justify-center py-4">
                <button onClick={handleLoadMore} disabled={loadingMore}
                  style={{ padding: "10px 28px", borderRadius: 9999, border: "1.5px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--plum)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", opacity: loadingMore ? 0.5 : 1 }}>
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </div>
        )}
        </>
        )}
      </div>

      {/* FAB — Posts feed only */}
      {view === "posts" && (
      <button onClick={() => setShowNew(true)}
        style={{ position: "fixed", bottom: 96, right: 20, width: 52, height: 52, borderRadius: 9999, backgroundColor: "var(--rose-dust)", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(196,132,154,0.4)", zIndex: 30 }}>
        <Plus className="w-6 h-6" />
      </button>
      )}

      {/* New post bottom sheet */}
      {showNew && (
        <>
          <div onClick={() => setShowNew(false)} style={{ position: "fixed", inset: 0, zIndex: 40, backgroundColor: "rgba(42,32,53,0.4)", backdropFilter: "blur(4px)" }} />
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, backgroundColor: "var(--surface)", borderRadius: "24px 24px 0 0", padding: "20px 20px 40px", maxHeight: "82vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "var(--plum)", margin: 0 }}>Share with the community</h2>
              <button onClick={() => setShowNew(false)} style={{ width: 30, height: 30, borderRadius: 9999, backgroundColor: "var(--ivory-dark)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X className="w-4 h-4" style={{ color: "var(--mauve)" }} />
              </button>
            </div>

            {/* Safe space notice */}
            <div style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", borderRadius: 12, padding: "10px 14px", marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>💜 This is a safe, supportive space. Be kind, be real, be you. Posts are reviewed before going live.</p>
            </div>

            <textarea
              autoFocus
              placeholder="What's on your mind?"
              value={newPost.content}
              onChange={e => e.target.value.length <= 500 && setNewPost(p => ({ ...p, content: e.target.value }))}
              rows={5}
              style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 14, padding: "12px 14px", fontSize: 14, fontFamily: "'Inter', sans-serif", color: "var(--plum)", backgroundColor: "var(--ivory)", outline: "none", resize: "none", boxSizing: "border-box", marginBottom: 6 }}
            />
            <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", textAlign: "right", marginBottom: 14 }}>{newPost.content.length}/500</p>

            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>Category</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {CATEGORIES.filter(c => c.id !== "all").map(cat => {
                  const c = CAT_COLORS[cat.id] || CAT_COLORS.general;
                  const active = newPost.category === cat.id;
                  return (
                    <button key={cat.id} onClick={() => setNewPost(p => ({ ...p, category: cat.id }))}
                      style={{ borderRadius: 9999, padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", border: "1.5px solid", backgroundColor: active ? c.bg : "transparent", borderColor: active ? c.color : "var(--border)", color: active ? c.color : "var(--mauve)" }}>
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 18 }}>
              <div onClick={() => setNewPost(p => ({ ...p, anonymous: !p.anonymous }))}
                style={{ width: 40, height: 22, borderRadius: 9999, backgroundColor: newPost.anonymous ? "var(--plum)" : "var(--border)", position: "relative", transition: "background 0.2s", cursor: "pointer", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: 2, left: newPost.anonymous ? 20 : 2, width: 18, height: 18, borderRadius: "50%", backgroundColor: "white", transition: "left 0.2s" }} />
              </div>
              <span style={{ fontSize: 13, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>Post anonymously</span>
            </label>

            <button onClick={handlePost} disabled={!newPost.content.trim() || posting}
              style={{ width: "100%", height: 48, borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", opacity: (!newPost.content.trim() || posting) ? 0.5 : 1 }}>
              {posting ? "Posting…" : "Share post"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}