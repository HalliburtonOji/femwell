import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { differenceInDays, differenceInHours, differenceInMinutes, parseISO } from "date-fns";
import { MoreHorizontal, X, Loader2, ChevronDown, ChevronUp } from "lucide-react";

const PHASE_EMOJIS = { menstrual: "🌸", follicular: "🌱", ovulatory: "✨", luteal: "🍂" };
const CATEGORY_TABS = [
  { key: "all",       label: "All" },
  { key: "general",   label: "General" },
  { key: "gratitude", label: "Gratitude" },
  { key: "real_talk", label: "Real Talk" },
  { key: "question",  label: "Ask" },
  { key: "milestone", label: "Milestones" },
];

const CATEGORY_LABELS = {
  general: "General", gratitude: "Gratitude 🙏", real_talk: "Real Talk 💬",
  question: "Question ❓", milestone: "Milestone 🎉",
};

function timeAgo(dateStr) {
  const date = parseISO(dateStr);
  const mins = differenceInMinutes(new Date(), date);
  if (mins < 60) return `${mins}m ago`;
  const hrs = differenceInHours(new Date(), date);
  if (hrs < 24) return `${hrs}h ago`;
  return `${differenceInDays(new Date(), date)}d ago`;
}

function getCurrentPhase(profile) {
  if (!profile?.last_period_start_date) return null;
  const cycleLen = profile.cycle_avg_length || 28;
  const periodLen = profile.period_length || 5;
  const days = differenceInDays(new Date(), parseISO(profile.last_period_start_date));
  const day = (days % cycleLen) + 1;
  if (day <= periodLen) return "menstrual";
  if (day <= Math.round(cycleLen * 0.4)) return "follicular";
  if (day <= Math.round(cycleLen * 0.55)) return "ovulatory";
  return "luteal";
}

const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif",
};

function PostCard({ post, currentUserId, onReact, onHide }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [localReactions, setLocalReactions] = useState(post.reactions || {});
  const [userReacted, setUserReacted] = useState(null);

  const handleReact = async (type) => {
    if (userReacted === type) return;
    const updated = { ...localReactions, [type]: (localReactions[type] || 0) + 1 };
    if (userReacted) updated[userReacted] = Math.max(0, (updated[userReacted] || 1) - 1);
    setLocalReactions(updated);
    setUserReacted(type);
    onReact(post.id, updated);
  };

  const displayName = post.anonymous ? "FemWell member" : (post.display_name || "Member");
  const initials = displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 18, boxShadow: "var(--shadow-sm)", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", backgroundColor: "var(--rose-dust-subtle)", border: "1.5px solid var(--rose-dust-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>{initials}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{displayName}</span>
            {post.phase_tag && (
              <span style={{ fontSize: 11, fontWeight: 600, backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", borderRadius: 9999, padding: "2px 8px", fontFamily: "'Inter', sans-serif" }}>
                {PHASE_EMOJIS[post.phase_tag] || "🌸"} {post.phase_tag}
              </span>
            )}
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

      <p style={{ fontSize: 14, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.65, marginBottom: 14 }}>{post.content}</p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { key: "feel_this", label: "💙 I feel this", emoji: "💙" },
          { key: "same", label: "✨ Same", emoji: "✨" },
          { key: "sending_love", label: "🤍 Sending love", emoji: "🤍" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleReact(key)}
            style={{
              padding: "5px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: "'Inter', sans-serif", border: "1px solid",
              backgroundColor: userReacted === key ? "var(--plum)" : "var(--ivory)",
              color: userReacted === key ? "white" : "var(--mauve)",
              borderColor: userReacted === key ? "var(--plum)" : "var(--border)",
              transition: "all 0.15s",
            }}
          >
            {label} {(localReactions[key] || 0) > 0 ? `· ${localReactions[key]}` : ""}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Community() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [hiddenIds, setHiddenIds] = useState(new Set());
  const [showCompose, setShowCompose] = useState(false);
  const [composing, setComposing] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [composeAnon, setComposeAnon] = useState(false);
  const [composeCategory, setComposeCategory] = useState("general");
  const [weekCheckins, setWeekCheckins] = useState(0);
  const [phaseCount, setPhaseCount] = useState(0);
  const [challengeJoined, setChallengeJoined] = useState(false);

  const currentPhase = profile ? getCurrentPhase(profile) : null;
  const phaseLabel = currentPhase ? (currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)) : null;

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [profiles, approvedPosts] = await Promise.all([
        base44.entities.UserProfile.filter({ user_id: u.id }),
        base44.entities.Posts.filter({ moderation_status: "approved" }, "-created_date", 50),
      ]);
      setProfile(profiles[0] || null);
      setPosts(approvedPosts);

      // Count check-ins this week
      const monday = new Date();
      monday.setDate(monday.getDate() - monday.getDay() + 1);
      const mondayStr = monday.toISOString().split("T")[0];
      const weekLogs = await base44.entities.DailyCheckins.filter({ user_id: u.id }, "-date", 10);
      setWeekCheckins(weekLogs.filter(c => c.date >= mondayStr).length);

      // Phase solidarity count
      setPhaseCount(Math.floor(Math.random() * 800) + 400); // simulated
      setLoading(false);
    })();
  }, []);

  const submitPost = async () => {
    if (!composeText.trim() || composing) return;
    setComposing(true);
    const created = await base44.entities.Posts.create({
      user_id: user.id,
      user_email: user.email,
      display_name: composeAnon ? null : (user.full_name || "FemWell member"),
      anonymous: composeAnon,
      phase_tag: currentPhase || undefined,
      category: composeCategory,
      content: composeText.trim(),
      moderation_status: "approved", // auto-approve for now
      reactions: { feel_this: 0, same: 0, sending_love: 0 },
      reply_count: 0,
      created_at: new Date().toISOString(),
    });
    setPosts(prev => [created, ...prev]);
    setComposeText("");
    setShowCompose(false);
    setComposing(false);
  };

  const handleReact = async (postId, updatedReactions) => {
    await base44.entities.Posts.update(postId, { reactions: updatedReactions });
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, reactions: updatedReactions } : p));
  };

  const joinChallenge = async () => {
    if (challengeJoined) return;
    await base44.entities.HabitLogs.create({
      user_id: user.id,
      date: new Date().toISOString().split("T")[0],
      habit_type: "community_challenge",
      habit_category: "other",
      completed: true,
    });
    setChallengeJoined(true);
  };

  const filtered = posts.filter(p => {
    if (hiddenIds.has(p.id)) return false;
    if (activeCategory !== "all" && p.category !== activeCategory) return false;
    return true;
  });

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="sticky top-0 z-20 px-4 pt-10 pb-3"
        style={{ backgroundColor: "rgba(250,248,245,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
        <p style={sLabel}>Community</p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "var(--plum)", letterSpacing: "-0.02em", marginTop: 2, marginBottom: 10 }}>Feed</h1>
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          <style>{`.comm-tabs::-webkit-scrollbar{display:none}`}</style>
          <div className="comm-tabs flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {CATEGORY_TABS.map(t => (
              <button key={t.key} onClick={() => setActiveCategory(t.key)}
                style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 9999, fontSize: 12, fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: "pointer", border: "1px solid", backgroundColor: activeCategory === t.key ? "var(--plum)" : "var(--surface)", color: activeCategory === t.key ? "white" : "var(--mauve)", borderColor: activeCategory === t.key ? "transparent" : "var(--border)" }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Phase solidarity banner */}
        {currentPhase && (
          <div style={{ background: "linear-gradient(135deg, var(--rose-dust-subtle), var(--mauve-subtle))", border: "1px solid var(--rose-dust-light)", borderRadius: 20, padding: "14px 18px" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
              You're not alone — <strong style={{ color: "var(--rose-dust)" }}>{phaseCount.toLocaleString()} women</strong> are in their {phaseLabel} phase this week 🌸
            </p>
          </div>
        )}

        {/* This week's challenge */}
        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 18, boxShadow: "var(--shadow-sm)" }}>
          <p style={sLabel}>This week's challenge</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--plum)", fontFamily: "'Inter', sans-serif", marginTop: 6, marginBottom: 4 }}>Log your mood every day this week</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>You've logged {weekCheckins}/7 days · 1,240 women joined</p>
          </div>
          <div style={{ height: 6, backgroundColor: "var(--ivory-dark)", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ height: "100%", width: `${Math.min(100, (weekCheckins / 7) * 100)}%`, backgroundColor: "var(--rose-dust)", borderRadius: 3, transition: "width 0.4s" }} />
          </div>
          <button onClick={joinChallenge} disabled={challengeJoined}
            style={{ padding: "7px 18px", borderRadius: 9999, fontSize: 12, fontWeight: 600, border: "none", cursor: challengeJoined ? "default" : "pointer", fontFamily: "'Inter', sans-serif", backgroundColor: challengeJoined ? "var(--sage)" : "var(--plum)", color: "white" }}>
            {challengeJoined ? "✓ Joined!" : "Join challenge"}
          </button>
        </div>

        {/* Compose prompt */}
        <button onClick={() => setShowCompose(true)}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, backgroundColor: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 20, padding: "14px 18px", cursor: "pointer", textAlign: "left", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "var(--rose-dust-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 14, color: "var(--rose-dust)" }}>✏️</span>
          </div>
          <p style={{ fontSize: 14, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Share something with the community…</p>
        </button>

        {/* Compose sheet */}
        {showCompose && (
          <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
            <div onClick={() => setShowCompose(false)} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(42,32,53,0.4)", backdropFilter: "blur(4px)" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "var(--surface)", borderRadius: "28px 28px 0 0", padding: 24, maxHeight: "85vh", overflowY: "auto" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "var(--plum)", fontWeight: 600 }}>New post</h3>
                <button onClick={() => setShowCompose(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--mauve)" }}>
                  <X style={{ width: 20, height: 20 }} />
                </button>
              </div>

              <div className="flex gap-2 flex-wrap mb-3">
                {CATEGORY_TABS.filter(t => t.key !== "all").map(t => (
                  <button key={t.key} onClick={() => setComposeCategory(t.key)}
                    style={{ padding: "5px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600, fontFamily: "'Inter', sans-serif", border: "1px solid", cursor: "pointer", backgroundColor: composeCategory === t.key ? "var(--plum)" : "var(--ivory)", color: composeCategory === t.key ? "white" : "var(--mauve)", borderColor: composeCategory === t.key ? "transparent" : "var(--border)" }}>
                    {t.label}
                  </button>
                ))}
              </div>

              <textarea
                value={composeText}
                onChange={e => setComposeText(e.target.value.slice(0, 280))}
                placeholder="What's on your mind?"
                rows={5}
                style={{ width: "100%", padding: 14, borderRadius: 16, border: "1.5px solid var(--border)", backgroundColor: "var(--ivory)", fontSize: 14, fontFamily: "'Inter', sans-serif", color: "var(--plum)", resize: "none", outline: "none", boxSizing: "border-box", lineHeight: 1.6 }}
                autoFocus
              />
              <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", textAlign: "right", marginTop: 4 }}>{composeText.length}/280</p>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <div onClick={() => setComposeAnon(a => !a)}
                    style={{ width: 36, height: 20, borderRadius: 9999, position: "relative", backgroundColor: composeAnon ? "var(--plum)" : "var(--border)", transition: "background 0.2s", cursor: "pointer" }}>
                    <div style={{ position: "absolute", top: 2, left: composeAnon ? 18 : 2, width: 16, height: 16, borderRadius: "50%", backgroundColor: "white", transition: "left 0.2s" }} />
                  </div>
                  <span style={{ fontSize: 13, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>👤 Post anonymously</span>
                </label>
                <button onClick={submitPost} disabled={!composeText.trim() || composing}
                  style={{ padding: "9px 22px", borderRadius: 9999, fontSize: 13, fontWeight: 600, backgroundColor: "var(--plum)", color: "white", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", opacity: (!composeText.trim() || composing) ? 0.5 : 1, display: "flex", alignItems: "center", gap: 6 }}>
                  {composing ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : null}
                  Share
                </button>
              </div>
            </div>
          </div>
        )}

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
          <PostCard
            key={post.id}
            post={post}
            currentUserId={user?.id}
            onReact={handleReact}
            onHide={id => setHiddenIds(s => new Set([...s, id]))}
          />
        ))}
      </div>
    </div>
  );
}