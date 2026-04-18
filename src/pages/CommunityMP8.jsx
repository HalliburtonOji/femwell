import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Heart, X } from "lucide-react";

const CATEGORIES = [
  { id: "all",         label: "All",         color: "#E11D48", bg: "#FFF1F2" },
  { id: "question",    label: "Question",    color: "#2563EB", bg: "#DBEAFE" },
  { id: "support",     label: "Support",     color: "#DC2626", bg: "#FEE2E2" },
  { id: "celebration", label: "Celebration", color: "#D97706", bg: "#FEF3C7" },
  { id: "tip",         label: "Tip",         color: "#059669", bg: "#D1FAE5" },
];

const TOPIC_TAGS = ["cycle", "nutrition", "fitness", "mental-health", "relationships", "other"];

const CAT_META = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

function timeAgo(iso) {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.floor(ms / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}

function emailPrefix(email) {
  if (!email) return "member";
  return email.split("@")[0];
}

export default function CommunityMP8() {
  const [user, setUser]       = useState(null);
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");
  const [likedIds, setLikedIds] = useState(() => new Set());
  const [showNew, setShowNew] = useState(false);
  const [posting, setPosting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    body: "",
    category: "question",
    topic_tag: "other",
    is_anonymous: false,
  });

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      setUser(u);
      const all = await base44.entities.CommunityPosts.list("-created_at", 200).catch(() => []);
      setPosts(all);
      setLoading(false);
    })();
  }, []);

  const filtered = filter === "all" ? posts : posts.filter(p => p.category === filter);

  const handleLike = async (post) => {
    if (likedIds.has(post.id)) return;
    const next = (post.likes_count || 0) + 1;
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes_count: next } : p));
    setLikedIds(prev => { const n = new Set(prev); n.add(post.id); return n; });
    await base44.entities.CommunityPosts.update(post.id, { likes_count: next }).catch(() => {});
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.body.trim() || !user) return;
    setPosting(true);
    const created = await base44.entities.CommunityPosts.create({
      title: form.title.trim(),
      body: form.body.trim(),
      author_email: user.email,
      author_display: form.is_anonymous ? "Anonymous member" : emailPrefix(user.email),
      category: form.category,
      topic_tag: form.topic_tag,
      is_anonymous: form.is_anonymous,
      likes_count: 0,
      created_at: new Date().toISOString(),
    });
    setPosts(prev => [created, ...prev]);
    setForm({ title: "", body: "", category: "question", topic_tag: "other", is_anonymous: false });
    setShowNew(false);
    setPosting(false);
  };

  const authorLabel = (post) =>
    post.is_anonymous
      ? "Anonymous member"
      : (post.author_display || emailPrefix(post.author_email));

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      <style>{`.cp-scroll::-webkit-scrollbar{display:none}.cp-scroll{-ms-overflow-style:none;scrollbar-width:none}`}</style>

      {/* Header */}
      <div className="sticky top-0 z-30 px-4 pt-10 pb-3"
        style={{ backgroundColor: "rgba(250,248,245,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-xl mx-auto">
          <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#E11D48", fontFamily: "'Inter', sans-serif" }}>
            FemWell Community
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: "var(--plum)", letterSpacing: "-0.02em", marginTop: 2, marginBottom: 2 }}>
            your circle of support
          </h1>
          <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 12 }}>
            Real people, real talk — be kind, be you.
          </p>

          {/* Category filter pills */}
          <div className="cp-scroll" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
            {CATEGORIES.map(cat => {
              const active = filter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  style={{
                    flexShrink: 0, padding: "6px 14px", borderRadius: 9999,
                    fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none",
                    fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap",
                    backgroundColor: active ? "#E11D48" : "#FFF1F2",
                    color: active ? "white" : "#9F1239",
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Posts list */}
      <div className="max-w-xl mx-auto px-4 pt-5">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "#FECACA", borderTopColor: "#E11D48" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <p style={{ fontSize: 14, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
              No posts yet — be the first to share.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(post => {
              const meta = CAT_META[post.category] || CAT_META.question;
              const liked = likedIds.has(post.id);
              return (
                <div
                  key={post.id}
                  style={{
                    backgroundColor: "#FFF1F2",
                    border: "1px solid #FECACA",
                    borderRadius: 20,
                    padding: 16,
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  {/* Top row: category + topic */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: meta.color, backgroundColor: meta.bg,
                      borderRadius: 9999, padding: "3px 10px", fontFamily: "'Inter', sans-serif",
                      textTransform: "capitalize",
                    }}>
                      {meta.label}
                    </span>
                    {post.topic_tag && (
                      <span style={{
                        fontSize: 10, fontWeight: 600, color: "#B45309", backgroundColor: "#FEF3C7",
                        borderRadius: 9999, padding: "3px 10px", fontFamily: "'Inter', sans-serif",
                      }}>
                        #{post.topic_tag}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 16, fontWeight: 700, color: "var(--plum)",
                    lineHeight: 1.35, marginBottom: 6,
                  }}>
                    {post.title}
                  </h3>

                  {/* Body */}
                  <p style={{
                    fontSize: 13, color: "var(--plum)",
                    fontFamily: "'Inter', sans-serif",
                    lineHeight: 1.65, marginBottom: 12, whiteSpace: "pre-wrap",
                  }}>
                    {post.body}
                  </p>

                  {/* Footer */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                      <span style={{ fontWeight: 600, color: "var(--plum)" }}>{authorLabel(post)}</span>
                      <span> · {timeAgo(post.created_at)}</span>
                    </div>
                    <button
                      onClick={() => handleLike(post)}
                      disabled={liked}
                      aria-label="Like this post"
                      style={{
                        display: "flex", alignItems: "center", gap: 5,
                        padding: "5px 12px", borderRadius: 9999,
                        border: "1px solid " + (liked ? "#E11D48" : "#FECACA"),
                        backgroundColor: liked ? "#E11D48" : "white",
                        color: liked ? "white" : "#E11D48",
                        cursor: liked ? "default" : "pointer",
                        fontSize: 12, fontWeight: 600, fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      <Heart className="w-3.5 h-3.5" style={{ fill: liked ? "white" : "none" }} />
                      {post.likes_count || 0}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB — New Post */}
      <button
        onClick={() => setShowNew(true)}
        aria-label="Create new post"
        style={{
          position: "fixed", bottom: 96, right: 20, zIndex: 30,
          display: "flex", alignItems: "center", gap: 6,
          height: 48, padding: "0 18px", borderRadius: 9999,
          backgroundColor: "#E11D48", color: "white", border: "none",
          cursor: "pointer", fontSize: 13, fontWeight: 700,
          fontFamily: "'Inter', sans-serif",
          boxShadow: "0 6px 20px rgba(225,29,72,0.35)",
        }}
      >
        <Plus className="w-4 h-4" /> New Post
      </button>

      {/* New post dialog */}
      {showNew && (
        <>
          <div
            onClick={() => setShowNew(false)}
            style={{ position: "fixed", inset: 0, zIndex: 40, backgroundColor: "rgba(42,32,53,0.45)", backdropFilter: "blur(5px)" }}
          />
          <div
            role="dialog"
            aria-label="Create new community post"
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
              backgroundColor: "white", borderRadius: "24px 24px 0 0",
              padding: "18px 20px 36px", maxHeight: "90vh", overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "var(--plum)", margin: 0 }}>
                New post
              </h2>
              <button
                onClick={() => setShowNew(false)}
                aria-label="Close"
                style={{ width: 32, height: 32, borderRadius: 9999, backgroundColor: "#FFF1F2", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <X className="w-4 h-4" style={{ color: "#E11D48" }} />
              </button>
            </div>

            {/* Title */}
            <label style={{ display: "block", marginBottom: 12 }}>
              <span style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif", marginBottom: 6 }}>
                Title
              </span>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                maxLength={120}
                placeholder="What's this about?"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1.5px solid #FECACA", fontSize: 14, fontFamily: "'Inter', sans-serif", color: "var(--plum)", outline: "none", boxSizing: "border-box" }}
              />
            </label>

            {/* Body */}
            <label style={{ display: "block", marginBottom: 14 }}>
              <span style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif", marginBottom: 6 }}>
                Body
              </span>
              <textarea
                value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                maxLength={2000}
                rows={5}
                placeholder="Share with the community…"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1.5px solid #FECACA", fontSize: 14, fontFamily: "'Inter', sans-serif", color: "var(--plum)", outline: "none", resize: "vertical", boxSizing: "border-box" }}
              />
            </label>

            {/* Category */}
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif", marginBottom: 6 }}>
                Category
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {CATEGORIES.filter(c => c.id !== "all").map(cat => {
                  const active = form.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                      style={{
                        borderRadius: 9999, padding: "5px 12px",
                        fontSize: 11, fontWeight: 600, cursor: "pointer",
                        fontFamily: "'Inter', sans-serif",
                        border: "1.5px solid " + (active ? cat.color : "#FECACA"),
                        backgroundColor: active ? cat.bg : "transparent",
                        color: active ? cat.color : "var(--mauve)",
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Topic tag */}
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif", marginBottom: 6 }}>
                Topic
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {TOPIC_TAGS.map(tag => {
                  const active = form.topic_tag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setForm(f => ({ ...f, topic_tag: tag }))}
                      style={{
                        borderRadius: 9999, padding: "5px 12px",
                        fontSize: 11, fontWeight: 600, cursor: "pointer",
                        fontFamily: "'Inter', sans-serif",
                        border: "1.5px solid " + (active ? "#B45309" : "#FEF3C7"),
                        backgroundColor: active ? "#FEF3C7" : "transparent",
                        color: active ? "#B45309" : "var(--mauve)",
                      }}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Anonymous toggle */}
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 18 }}>
              <input
                type="checkbox"
                checked={form.is_anonymous}
                onChange={e => setForm(f => ({ ...f, is_anonymous: e.target.checked }))}
                style={{ width: 18, height: 18, accentColor: "#E11D48", cursor: "pointer" }}
              />
              <span style={{ fontSize: 13, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                Post anonymously
              </span>
            </label>

            <button
              onClick={handleCreate}
              disabled={!form.title.trim() || !form.body.trim() || posting}
              style={{
                width: "100%", height: 48, borderRadius: 9999,
                backgroundColor: "#E11D48", color: "white",
                fontSize: 14, fontWeight: 700, border: "none",
                cursor: "pointer", fontFamily: "'Inter', sans-serif",
                opacity: (!form.title.trim() || !form.body.trim() || posting) ? 0.5 : 1,
              }}
            >
              {posting ? "Posting…" : "Share post"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}