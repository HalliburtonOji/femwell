import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, RefreshCw, PenLine } from "lucide-react";
import FeedSkeleton from "./FeedSkeleton";

const CATEGORIES = [
  "All", "Hormones & Cycle", "Mental Health", "Nutrition", "Sleep",
  "Fitness", "Skin & Hair", "Relationships", "Supplements", "Self Care",
  "Women's Health", "Stress", "Gut Health", "Fertility", "Mindfulness",
];

const CONTENT_TYPE_OPTIONS = [
  { value: "article", label: "Article" },
  { value: "story", label: "Essay" },
  { value: "book", label: "Book summary" },
  { value: "fiction_short", label: "Short story" },
  { value: "fiction_long", label: "One-hour read" },
];

const FICTION_GENRES_REQ = ["Contemporary", "Romance", "Drama", "Literary", "Thriller", "Mystery", "Fantasy", "Historical", "Romantic Suspense"];
const MATURE_GENRES_REQ = ["Romance", "Romantic Suspense"];

function timeAgo(d) {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "today";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function contentTypeLabel(item) {
  if (item.content_type === "STORY") return { label: "Essay", bg: "var(--mauve-subtle)", color: "var(--mauve)" };
  if (item.content_type === "GUIDE") return { label: "Book summary", bg: "#FFF0E8", color: "#C4804A" };
  if (item.content_type === "FICTION") {
    const isLong = Array.isArray(item.tags) && item.tags.includes("length:long");
    return isLong
      ? { label: "One-hour read", bg: "#E8F4FF", color: "#5B7FC4" }
      : { label: "Short story", bg: "var(--mauve-subtle)", color: "var(--mauve)" };
  }
  return { label: "Article", bg: "var(--rose-dust-subtle)", color: "var(--rose-dust)" };
}

export default function SmartFemwellTab({ onRead }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [requestTopic, setRequestTopic] = useState("");
  const [requestCategory, setRequestCategory] = useState("Women's Health");
  const [requestContentType, setRequestContentType] = useState("article");
  const [requestGenre, setRequestGenre] = useState("Contemporary");
  const [requestMature, setRequestMature] = useState(false);
  const [matureAllowed, setMatureAllowed] = useState(false);
  const [showMatureConfirm, setShowMatureConfirm] = useState(false);
  const [userProfileId, setUserProfileId] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [weeklyRequestCount, setWeeklyRequestCount] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  const loadContent = async (autoGenerate = false) => {
    setLoading(true);
    const allItems = await base44.entities.LifestyleItems.list("-published_at", 500);
    const femwellItems = allItems.filter(
      i => (i.provider === "FEMWELL_AI" || i.provider === "FEMWELL_AI_USER_REQUEST") && i.status === "PUBLISHED"
    );
    setItems(femwellItems);

    try {
      const u = await base44.auth.me();
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const ws = weekStart.toISOString().split("T")[0];
      const userRequested = femwellItems.filter(i =>
        i.provider === "FEMWELL_AI_USER_REQUEST" && i.created_by === u.email && (i.created_date || "") >= ws
      );
      setWeeklyRequestCount(userRequested.length);
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles[0]) {
        setUserProfileId(profiles[0].id);
        setMatureAllowed(!!profiles[0].allow_mature_content);
      }
    } catch {}

    setLoading(false);
    if (autoGenerate && femwellItems.length === 0) {
      setGenerating(true);
      try {
        await base44.functions.invoke("generateFemwellContent", { force_run: false });
        const fresh = await base44.entities.LifestyleItems.list("-published_at", 500);
        setItems(fresh.filter(i => (i.provider === "FEMWELL_AI" || i.provider === "FEMWELL_AI_USER_REQUEST") && i.status === "PUBLISHED"));
      } catch {}
      setGenerating(false);
    }
  };

  useEffect(() => { loadContent(true); }, []);

  const triggerBackgroundGeneration = async () => {
    setGenerating(true);
    try {
      await base44.functions.invoke("generateFemwellContent", { force_run: false });
      await loadContent();
    } catch {}
    setGenerating(false);
  };

  const handleMatureToggle = (checked) => {
    if (checked && !matureAllowed) {
      setShowMatureConfirm(true);
      setRequestMature(true);
    } else {
      setRequestMature(checked);
      if (!checked) setShowMatureConfirm(false);
    }
  };

  const handleMatureConfirm = async () => {
    setMatureAllowed(true);
    setShowMatureConfirm(false);
    if (userProfileId) {
      await base44.entities.UserProfile.update(userProfileId, {
        allow_mature_content: true,
        mature_confirmed_at: new Date().toISOString(),
      });
    }
  };

  const submitRequest = async () => {
    if (!requestTopic.trim()) return;
    if (weeklyRequestCount >= 2) {
      setSubmitMsg("You have used your 2 weekly requests. New requests available Monday.");
      return;
    }
    setSubmitting(true);
    setSubmitMsg("");
    const isFiction = requestContentType === "fiction_short" || requestContentType === "fiction_long";
    const useMature = requestMature && matureAllowed && MATURE_GENRES_REQ.includes(requestGenre);
    try {
      const res = await base44.functions.invoke("generateFemwellContent", {
        custom_topic: requestTopic.trim(),
        custom_category: requestCategory,
        content_type: requestContentType,
        ...(isFiction ? { genre: requestGenre, mature: useMature } : {}),
      });
      if (res?.data?.error) {
        setSubmitMsg(res.data.error);
      } else {
        setSubmitMsg("Generated and added to the feed.");
        setRequestTopic("");
        setShowRequestForm(false);
        await loadContent();
      }
    } catch {
      setSubmitMsg("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  const isFictionType = requestContentType === "fiction_short" || requestContentType === "fiction_long";
  const generateButtonLabel = submitting ? "Generating..."
    : requestContentType === "story" ? "Generate essay"
    : requestContentType === "book" ? "Generate book summary"
    : requestContentType === "fiction_short" ? "Generate short story"
    : requestContentType === "fiction_long" ? "Generate one-hour read"
    : "Generate article";

  const filtered = activeCategory === "All" ? items : items.filter(i => i.category === activeCategory);

  return (
    <div>
      {/* Header card */}
      <div style={{ background: "linear-gradient(135deg, var(--rose-dust-subtle) 0%, var(--mauve-subtle) 100%)", border: "1px solid var(--rose-dust-light)", borderRadius: 20, padding: "16px 18px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <PenLine style={{ width: 13, height: 13, color: "var(--rose-dust)" }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>FemWell Originals</span>
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--plum)", fontFamily: "'Playfair Display', serif", margin: "0 0 4px" }}>Written for women, by FemWell</p>
            <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", margin: 0 }}>Evidence-based articles on hormones, nutrition, skin, mental health and more.</p>
          </div>
          <button onClick={triggerBackgroundGeneration} disabled={generating}
            style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 10, backgroundColor: "white", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            {generating
              ? <Loader2 style={{ width: 14, height: 14, color: "var(--rose-dust)", animation: "spin 0.7s linear infinite" }} />
              : <RefreshCw style={{ width: 14, height: 14, color: "var(--rose-dust)" }} />}
          </button>
        </div>

        {/* Request content CTA */}
        <div style={{ marginTop: 12, borderTop: "1px solid rgba(196,132,154,0.2)", paddingTop: 12 }}>
          {!showRequestForm ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", margin: 0 }}>
                {weeklyRequestCount < 2
                  ? `${2 - weeklyRequestCount} custom request${weeklyRequestCount === 1 ? "" : "s"} left this week`
                  : "No requests left this week"}
              </p>
              <button onClick={() => setShowRequestForm(true)} disabled={weeklyRequestCount >= 2}
                style={{ fontSize: 11, fontWeight: 700, color: "var(--rose-dust)", background: "white", border: "1px solid var(--rose-dust-light)", borderRadius: 9999, padding: "5px 12px", cursor: weeklyRequestCount >= 2 ? "not-allowed" : "pointer", opacity: weeklyRequestCount >= 2 ? 0.4 : 1, fontFamily: "'Inter', sans-serif" }}>
                + Request a topic
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--plum)", margin: 0 }}>What would you like us to write?</p>

              {/* Content type selector */}
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {CONTENT_TYPE_OPTIONS.map(opt => (
                  <button key={opt.value}
                    onClick={() => { setRequestContentType(opt.value); setRequestMature(false); setShowMatureConfirm(false); }}
                    style={{ padding: "6px 10px", borderRadius: 9999, border: requestContentType === opt.value ? "1.5px solid var(--plum)" : "1px solid var(--border)", backgroundColor: requestContentType === opt.value ? "var(--plum)" : "white", color: requestContentType === opt.value ? "white" : "var(--plum)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Topic input */}
              <input value={requestTopic} onChange={e => setRequestTopic(e.target.value)}
                placeholder={
                  requestContentType === "book" ? "e.g. Why We Sleep by Matthew Walker"
                  : requestContentType === "story" ? "e.g. My experience with PCOS and finding balance"
                  : isFictionType ? "e.g. A woman starting over in a coastal town"
                  : "e.g. How iron deficiency affects my cycle and energy"
                }
                style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "var(--plum)", backgroundColor: "white", outline: "none", boxSizing: "border-box" }} />

              {/* Fiction-specific controls */}
              {isFictionType && (
                <>
                  <select value={requestGenre}
                    onChange={e => { setRequestGenre(e.target.value); setRequestMature(false); setShowMatureConfirm(false); }}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 12, border: "1px solid var(--border)", fontSize: 12, fontFamily: "'Inter', sans-serif", color: "var(--plum)", backgroundColor: "white", outline: "none" }}>
                    {FICTION_GENRES_REQ.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  {MATURE_GENRES_REQ.includes(requestGenre) && (
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
                      <input type="checkbox" checked={requestMature} onChange={e => handleMatureToggle(e.target.checked)} style={{ width: 14, height: 14 }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Adult content (18+)</span>
                    </label>
                  )}
                  {showMatureConfirm && !matureAllowed && (
                    <div style={{ backgroundColor: "#FFF8F0", borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(232,192,128,0.4)" }}>
                      <p style={{ fontSize: 11, color: "var(--plum)", margin: "0 0 6px", fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>Mature content uses tasteful, non-explicit language. All characters are adults aged 18 or older.</p>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", userSelect: "none" }}>
                        <input type="checkbox" onChange={e => e.target.checked && handleMatureConfirm()} style={{ width: 13, height: 13 }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#C4804A", fontFamily: "'Inter', sans-serif" }}>I confirm I am 18 or older</span>
                      </label>
                    </div>
                  )}
                </>
              )}

              {/* Category selector for non-fiction */}
              {!isFictionType && (
                <select value={requestCategory} onChange={e => setRequestCategory(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 12, border: "1px solid var(--border)", fontSize: 12, fontFamily: "'Inter', sans-serif", color: "var(--plum)", backgroundColor: "white", outline: "none" }}>
                  {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}

              {submitMsg && <p style={{ fontSize: 12, color: "var(--rose-dust)", margin: 0, fontFamily: "'Inter', sans-serif" }}>{submitMsg}</p>}

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setShowRequestForm(false); setSubmitMsg(""); }}
                  style={{ flex: 1, padding: "9px", borderRadius: 10, border: "1px solid var(--border)", backgroundColor: "transparent", color: "var(--mauve)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={submitRequest} disabled={!requestTopic.trim() || submitting}
                  style={{ flex: 2, padding: "9px", borderRadius: 10, border: "none", backgroundColor: "var(--plum)", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: (!requestTopic.trim() || submitting) ? 0.5 : 1 }}>
                  {submitting && <Loader2 style={{ width: 12, height: 12, animation: "spin 0.7s linear infinite" }} />}
                  {generateButtonLabel}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 12, scrollbarWidth: "none" }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setActiveCategory(c)}
            style={{ flexShrink: 0, padding: "5px 14px", borderRadius: 9999, fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif",
              backgroundColor: activeCategory === c ? "var(--plum)" : "var(--ivory-dark)",
              color: activeCategory === c ? "white" : "var(--mauve)" }}>
            {c}
          </button>
        ))}
      </div>

      {loading || generating ? <FeedSkeleton /> : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 24px" }}>
          <PenLine style={{ width: 28, height: 28, color: "var(--rose-dust-light)", margin: "0 auto 12px", display: "block" }} />
          <p style={{ fontSize: 14, color: "var(--plum)", fontWeight: 600, marginBottom: 6 }}>No articles yet</p>
          <p style={{ fontSize: 12, color: "var(--mauve)", marginBottom: 16 }}>Tap below to generate your first batch of FemWell originals.</p>
          <button onClick={triggerBackgroundGeneration}
            style={{ padding: "10px 22px", borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            Generate content
          </button>
        </div>
      ) : (
        <div>
          {filtered.map(item => {
            const t = contentTypeLabel(item);
            return (
              <div key={item.id} style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px", marginBottom: 12, boxShadow: "var(--shadow-sm)" }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: t.color, backgroundColor: t.bg, borderRadius: 9999, padding: "2px 9px" }}>{t.label}</span>
                  {item.category && (
                    <span style={{ fontSize: 10, fontWeight: 500, color: "var(--mauve)", backgroundColor: "var(--ivory-dark)", borderRadius: 9999, padding: "2px 9px" }}>{item.category}</span>
                  )}
                  {item.phase_tags?.map(pt => (
                    <span key={pt} style={{ fontSize: 10, fontWeight: 500, color: "var(--mauve)", backgroundColor: "var(--ivory-dark)", borderRadius: 9999, padding: "2px 8px", textTransform: "capitalize" }}>{pt}</span>
                  ))}
                  {item.provider === "FEMWELL_AI_USER_REQUEST" && (
                    <span style={{ fontSize: 10, fontWeight: 600, color: "var(--sage)", backgroundColor: "var(--sage-subtle)", borderRadius: 9999, padding: "2px 8px" }}>Requested</span>
                  )}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--plum)", fontFamily: "'Playfair Display', serif", lineHeight: 1.35, margin: "0 0 6px" }}>{item.title}</h3>
                {item.summary && <p style={{ fontSize: 13, color: "var(--mauve)", lineHeight: 1.55, margin: "0 0 10px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.summary}</p>}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: "var(--mauve)", opacity: 0.6, fontFamily: "'Inter', sans-serif" }}>{item.author_name} · {timeAgo(item.published_at || item.ingested_at)}</span>
                  <button onClick={() => onRead?.(item)}
                    style={{ fontSize: 12, fontWeight: 700, color: "white", backgroundColor: "var(--rose-dust)", border: "none", borderRadius: 9999, padding: "6px 16px", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                    Read
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}