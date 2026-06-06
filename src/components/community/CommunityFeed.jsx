import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { differenceInDays, differenceInHours, differenceInMinutes, parseISO } from "date-fns";
import { MoreHorizontal, X, Loader2, Plus, CheckCircle2, PenLine } from "lucide-react";

const CATEGORY_TABS = [
  { key: "all",           label: "All" },
  { key: "cycle",         label: "Cycle" },
  { key: "pcos",          label: "PCOS" },
  { key: "endometriosis", label: "Endo" },
  { key: "pmdd",          label: "PMDD" },
  { key: "pregnancy",     label: "Pregnancy" },
  { key: "menopause",     label: "Menopause" },
  { key: "general",       label: "General" },
];

const CATEGORY_LABELS = {
  cycle: "Cycle", pcos: "PCOS", endometriosis: "Endo",
  pmdd: "PMDD", pregnancy: "Pregnancy", menopause: "Menopause",
  general: "General", gratitude: "Gratitude", real_talk: "Real Talk",
  question: "Question", milestone: "Milestone",
};

const REACTION_KEYS = [
  { key: "reactions_helpful",   label: "Helpful" },
  { key: "reactions_relatable", label: "Relatable" },
  { key: "reactions_thankyou",  label: "Thank you" },
];

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const date = parseISO(dateStr);
  const mins = differenceInMinutes(new Date(), date);
  if (mins < 60) return `${mins}m ago`;
  const hrs = differenceInHours(new Date(), date);
  if (hrs < 24) return `${hrs}h ago`;
  return `${differenceInDays(new Date(), date)}d ago`;
}

function getReacted(postId, key) {
  return localStorage.getItem(`fw_react_${postId}_${key}`) === "1";
}
function setReacted(postId, key) {
  localStorage.setItem(`fw_react_${postId}_${key}`, "1");
}

function PostCard({ post, onHide }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reactions, setReactions] = useState({
    reactions_helpful: post.reactions_helpful || 0,
    reactions_relatable: post.reactions_relatable || 0,
    reactions_thankyou: post.reactions_thankyou || 0,
  });
  const [reacted, setReactedState] = useState(() => ({
    reactions_helpful:   getReacted(post.id, "reactions_helpful"),
    reactions_relatable: getReacted(post.id, "reactions_relatable"),
    reactions_thankyou:  getReacted(post.id, "reactions_thankyou"),
  }));
  const [expanded, setExpanded] = useState(false);

  const handleReact = async (key) => {
    if (reacted[key]) return;
    const next = { ...reactions, [key]: (reactions[key] || 0) + 1 };
    setReactions(next);
    setReactedState(r => ({ ...r, [key]: true }));
    setReacted(post.id, key);
    await base44.entities.Posts.update(post.id, { [key]: next[key] }).catch(() => {});
  };

  const displayName = post.anonymous ? "FemWell member" : (post.display_name || "Member");
  const initials = displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const isLong = post.content?.length > 220;
  const displayContent = isLong && !expanded ? post.content.slice(0, 220) + "…" : post.content;

  return (
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 18, boxShadow: "var(--shadow-sm)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", backgroundColor: "var(--rose-dust-subtle)", border: "1.5px solid var(--rose-dust-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>{initials}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{displayName}</span>
            {post.category && post.category !== "general" && (
              <span style={{ fontSize: 10, fontWeight: 600, backgroundColor: "var(--ivory-dark)", color: "var(--mauve)", borderRadius: 9999, padding: "2px 8px", fontFamily: "'Inter', sans-serif" }}>
                {CATEGORY_LABELS[post.category] || post.category}
              </span>
            )}
          </div>
          <span style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{timeAgo(post.created_at || post.created_date)}</span>
        </div>
        <div style={{ position: "relative" }}>
          <button onClick={() => setMenuOpen(m => !m)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--mauve)" }}>
            <MoreHorizontal style={{ width: 18, height: 18 }} />
          </button>
          {menuOpen && (
            <div style={{ position: "absolute", right: 0, top: 28, backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "var(--shadow-md)", zIndex: 10, minWidth: 130 }}>
              <button onClick={() => { setMenuOpen(false); onHide(post.id); }} style={{ display: "block", width: "100%", padding: "10px 14px", textAlign: "left", fontSize: 13, color: "var(--plum)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>Hide post</button>
              <button onClick={() => setMenuOpen(false)} style={{ display: "block", width: "100%", padding: "10px 14px", textAlign: "left", fontSize: 13, color: "var(--rose-dust)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>Report</button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <p style={{ fontSize: 14, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.65, marginBottom: isLong ? 6 : 14 }}>{displayContent}</p>
      {isLong && (
        <button onClick={() => setExpanded(v => !v)} style={{ fontSize: 12, color: "var(--rose-dust)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 12, fontFamily: "'Inter', sans-serif" }}>
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      {/* Reactions */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {REACTION_KEYS.map(({ key, label }) => (
          <button key={key} onClick={() => handleReact(key)}
            style={{ padding: "5px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", border: "1px solid", transition: "all 0.15s",
              backgroundColor: reacted[key] ? "var(--plum)" : "var(--ivory)",
              color: reacted[key] ? "white" : "var(--mauve)",
              borderColor: reacted[key] ? "var(--plum)" : "var(--border)" }}>
            {label}{reactions[key] > 0 ? ` · ${reactions[key]}` : ""}
          </button>
        ))}
      </div>
    </div>
  );
}

function ComposeModal({ onClose, onSubmit, currentPhase }) {
  const [text, setText] = useState("");
  const [anon, setAnon] = useState(false);
  const [category, setCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (text.trim().length < 10 || submitting) return;
    setSubmitting(true);
    await onSubmit({ text: text.trim(), anonymous: anon, category });
    setDone(true);
    setSubmitting(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(42,32,53,0.45)", backdropFilter: "blur(6px)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "var(--surface)", borderRadius: "28px 28px 0 0", padding: 24, maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <div style={{ width: 32, height: 4, borderRadius: 9999, backgroundColor: "var(--border)" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: "var(--plum)", fontWeight: 600 }}>New post</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--mauve)" }}><X style={{ width: 20, height: 20 }} /></button>
        </div>

        {done ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <CheckCircle2 size={38} style={{ color: "var(--rose-dust)", marginBottom: 12 }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>Your post is under review</p>
            <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 6 }}>It will appear shortly.</p>
            <button onClick={onClose} style={{ marginTop: 20, padding: "10px 28px", borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>Done</button>
          </div>
        ) : (
          <>
            {/* Category */}
            <div className="flex gap-2 flex-wrap mb-4">
              {CATEGORY_TABS.filter(t => t.key !== "all").map(t => (
                <button key={t.key} onClick={() => setCategory(t.key)}
                  style={{ padding: "5px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid", fontFamily: "'Inter', sans-serif",
                    backgroundColor: category === t.key ? "var(--plum)" : "var(--ivory)",
                    color: category === t.key ? "white" : "var(--mauve)",
                    borderColor: category === t.key ? "transparent" : "var(--border)" }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Text */}
            <textarea value={text} onChange={e => setText(e.target.value.slice(0, 500))} placeholder="What's on your mind?" rows={5}
              style={{ width: "100%", padding: 14, borderRadius: 16, border: "1.5px solid var(--border)", backgroundColor: "var(--ivory)", fontSize: 14, fontFamily: "'Inter', sans-serif", color: "var(--plum)", resize: "none", outline: "none", boxSizing: "border-box", lineHeight: 1.6 }}
              autoFocus />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, marginBottom: 16 }}>
              <span style={{ fontSize: 11, color: text.length < 10 ? "var(--rose-dust)" : "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                {text.length < 10 ? `${10 - text.length} more chars required` : ""}
              </span>
              <span style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{text.length}/500</span>
            </div>

            {/* Anon toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <div onClick={() => setAnon(a => !a)} style={{ width: 36, height: 20, borderRadius: 9999, position: "relative", backgroundColor: anon ? "var(--plum)" : "var(--border)", transition: "background 0.2s", cursor: "pointer" }}>
                  <div style={{ position: "absolute", top: 2, left: anon ? 18 : 2, width: 16, height: 16, borderRadius: "50%", backgroundColor: "white", transition: "left 0.2s" }} />
                </div>
                <span style={{ fontSize: 13, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>Post anonymously</span>
              </label>
              <button onClick={handleSubmit} disabled={text.trim().length < 10 || submitting}
                style={{ padding: "9px 22px", borderRadius: 9999, fontSize: 13, fontWeight: 600, backgroundColor: "var(--plum)", color: "white", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", opacity: text.trim().length < 10 || submitting ? 0.5 : 1, display: "flex", alignItems: "center", gap: 6 }}>
                {submitting ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : null}
                Share
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CommunityFeed({ user, profile }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [hiddenIds, setHiddenIds] = useState(new Set());
  const [showCompose, setShowCompose] = useState(false);

  const currentPhase = (() => {
    if (!profile?.last_period_start_date) return null;
    const cycleLen = profile.cycle_avg_length || 28;
    const days = differenceInDays(new Date(), parseISO(profile.last_period_start_date));
    const day = (days % cycleLen) + 1;
    if (day <= (profile.period_length || 5)) return "menstrual";
    if (day <= Math.round(cycleLen * 0.4)) return "follicular";
    if (day <= Math.round(cycleLen * 0.55)) return "ovulatory";
    return "luteal";
  })();

  useEffect(() => {
    (async () => {
      try {
        const approved = await base44.entities.Posts.filter({ moderation_status: "approved" }, "-created_date", 60);
        setPosts(approved);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const handleSubmit = async ({ text, anonymous, category }) => {
    const created = await base44.entities.Posts.create({
      user_id: user.id,
      user_email: user.email,
      display_name: anonymous ? null : (user.full_name || "FemWell member"),
      anonymous,
      phase_tag: currentPhase || undefined,
      category,
      content: text,
      moderation_status: "pending",
      reactions_helpful: 0,
      reactions_relatable: 0,
      reactions_thankyou: 0,
      reply_count: 0,
      created_at: new Date().toISOString(),
    });
    // Don't add to feed since it's pending review
  };

  const filtered = posts.filter(p => {
    if (hiddenIds.has(p.id)) return false;
    if (activeCategory !== "all" && p.category !== activeCategory) return false;
    return true;
  });

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      {/* Header */}
      <div className="sticky top-0 z-20 px-4 pt-10 pb-3"
        style={{ backgroundColor: "rgba(250,248,245,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div>
            <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Community</p>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: "var(--plum)", letterSpacing: "-0.02em", marginTop: 2 }}>Feed</h1>
          </div>
          <button onClick={() => setShowCompose(true)} style={{ width: 38, height: 38, borderRadius: "50%", backgroundColor: "var(--plum)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plus style={{ width: 18, height: 18, color: "white" }} />
          </button>
        </div>
        <style>{`.comm-scroll::-webkit-scrollbar{display:none}`}</style>
        <div className="comm-scroll flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {CATEGORY_TABS.map(t => (
            <button key={t.key} onClick={() => setActiveCategory(t.key)}
              style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 9999, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid", fontFamily: "'Inter', sans-serif",
                backgroundColor: activeCategory === t.key ? "var(--plum)" : "var(--surface)",
                color: activeCategory === t.key ? "white" : "var(--mauve)",
                borderColor: activeCategory === t.key ? "transparent" : "var(--border)" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-3">
        {/* Phase solidarity */}
        {currentPhase && (
          <div style={{ background: "linear-gradient(135deg, var(--rose-dust-subtle), var(--mauve-subtle))", border: "1px solid var(--rose-dust-light)", borderRadius: 18, padding: "12px 16px" }}>
            <p style={{ fontSize: 13, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
              You're not alone this <strong>{currentPhase}</strong> phase.
            </p>
          </div>
        )}

        {/* Compose prompt */}
        <button onClick={() => setShowCompose(true)}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, backgroundColor: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 20, padding: "14px 18px", cursor: "pointer", textAlign: "left", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "var(--rose-dust-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <PenLine size={16} style={{ color: "var(--rose-dust)" }} />
          </div>
          <p style={{ fontSize: 14, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Share something with the community…</p>
        </button>

        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--mauve)" }} />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", backgroundColor: "var(--surface)", borderRadius: 20, border: "1px solid var(--border)" }}>
            <p style={{ fontSize: 14, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>No posts here yet. Be the first to share!</p>
          </div>
        )}

        {filtered.map(post => (
          <PostCard key={post.id} post={post} onHide={id => setHiddenIds(s => new Set([...s, id]))} />
        ))}
      </div>

      {showCompose && (
        <ComposeModal
          onClose={() => setShowCompose(false)}
          onSubmit={handleSubmit}
          currentPhase={currentPhase}
        />
      )}
    </div>
  );
}