import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import FeedSkeleton from "./FeedSkeleton";

const CATEGORIES = [
  "All", "Hormones & Cycle", "Mental Health", "Nutrition", "Sleep",
  "Fitness", "Skin & Hair", "Relationships", "Supplements", "Self Care",
  "Women's Health", "Stress", "Gut Health", "Fertility", "Mindfulness",
];

function timeAgo(d) {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "today";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function SmartFemwellTab({ onRead }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [requestTopic, setRequestTopic] = useState("");
  const [requestCategory, setRequestCategory] = useState("Women's Health");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [weeklyRequestCount, setWeeklyRequestCount] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  const loadContent = async () => {
    setLoading(true);
    const allItems = await base44.entities.LifestyleItems.list("-pub_date", 200);
    const femwellItems = allItems.filter(
      i => (i.provider === "FEMWELL_AI" || i.provider === "FEMWELL_AI_USER_REQUEST") && i.status === "PUBLISHED"
    );
    setItems(femwellItems);

    // Check weekly request count
    try {
      const u = await base44.auth.me();
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const ws = weekStart.toISOString().split("T")[0];
      const userRequested = femwellItems.filter(i =>
        i.provider === "FEMWELL_AI_USER_REQUEST" && i.created_by === u.email && (i.created_date || "") >= ws
      );
      setWeeklyRequestCount(userRequested.length);
    } catch {}

    setLoading(false);
  };

  useEffect(() => { loadContent(); }, []);

  const triggerBackgroundGeneration = async () => {
    setGenerating(true);
    try {
      await base44.functions.invoke("generateFemwellContent", { force_run: false });
      await loadContent();
    } catch {}
    setGenerating(false);
  };

  const submitRequest = async () => {
    if (!requestTopic.trim()) return;
    if (weeklyRequestCount >= 2) {
      setSubmitMsg("You've used your 2 weekly requests. New requests available Monday.");
      return;
    }
    setSubmitting(true);
    setSubmitMsg("");
    try {
      const res = await base44.functions.invoke("generateFemwellContent", {
        custom_topic: requestTopic.trim(),
        custom_category: requestCategory,
      });
      if (res?.data?.error) {
        setSubmitMsg(res.data.error);
      } else {
        setSubmitMsg("✓ Your article has been generated and added to the feed.");
        setRequestTopic("");
        setShowRequestForm(false);
        await loadContent();
      }
    } catch (e) {
      setSubmitMsg("Something went wrong — please try again.");
    }
    setSubmitting(false);
  };

  const filtered = activeCategory === "All" ? items : items.filter(i => i.category === activeCategory);

  return (
    <div>
      {/* Header card */}
      <div style={{ background: "linear-gradient(135deg, var(--rose-dust-subtle) 0%, var(--mauve-subtle) 100%)", border: "1px solid var(--rose-dust-light)", borderRadius: 20, padding: "16px 18px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <Sparkles style={{ width: 13, height: 13, color: "var(--rose-dust)" }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>FemWell Originals</span>
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--plum)", fontFamily: "'Playfair Display', serif", margin: "0 0 4px" }}>Written for women, by FemWell</p>
            <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", margin: 0 }}>Evidence-based articles on hormones, nutrition, skin, mental health and more — generated fresh and saved here.</p>
          </div>
          <button onClick={triggerBackgroundGeneration} disabled={generating}
            style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 10, backgroundColor: "white", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            {generating ? <Loader2 style={{ width: 14, height: 14, color: "var(--rose-dust)", animation: "spin 0.7s linear infinite" }} /> : <RefreshCw style={{ width: 14, height: 14, color: "var(--rose-dust)" }} />}
          </button>
        </div>

        {/* Request content CTA */}
        <div style={{ marginTop: 12, borderTop: "1px solid rgba(196,132,154,0.2)", paddingTop: 12 }}>
          {!showRequestForm ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", margin: 0 }}>
                {weeklyRequestCount < 2 ? `${2 - weeklyRequestCount} custom request${weeklyRequestCount === 1 ? "" : "s"} left this week` : "No requests left this week"}
              </p>
              <button onClick={() => setShowRequestForm(true)} disabled={weeklyRequestCount >= 2}
                style={{ fontSize: 11, fontWeight: 700, color: "var(--rose-dust)", background: "white", border: "1px solid var(--rose-dust-light)", borderRadius: 9999, padding: "5px 12px", cursor: weeklyRequestCount >= 2 ? "not-allowed" : "pointer", opacity: weeklyRequestCount >= 2 ? 0.4 : 1, fontFamily: "'Inter', sans-serif" }}>
                + Request a topic
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--plum)", margin: 0 }}>What would you like us to write about?</p>
              <input value={requestTopic} onChange={e => setRequestTopic(e.target.value)}
                placeholder="e.g. How iron deficiency affects my cycle and energy"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "var(--plum)", backgroundColor: "white", outline: "none", boxSizing: "border-box" }} />
              <select value={requestCategory} onChange={e => setRequestCategory(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 12, border: "1px solid var(--border)", fontSize: 12, fontFamily: "'Inter', sans-serif", color: "var(--plum)", backgroundColor: "white", outline: "none" }}>
                {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {submitMsg && <p style={{ fontSize: 12, color: submitMsg.startsWith("✓") ? "var(--sage)" : "var(--rose-dust)", margin: 0 }}>{submitMsg}</p>}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setShowRequestForm(false); setSubmitMsg(""); }}
                  style={{ flex: 1, padding: "9px", borderRadius: 10, border: "1px solid var(--border)", backgroundColor: "transparent", color: "var(--mauve)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button onClick={submitRequest} disabled={!requestTopic.trim() || submitting}
                  style={{ flex: 2, padding: "9px", borderRadius: 10, border: "none", backgroundColor: "var(--plum)", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: (!requestTopic.trim() || submitting) ? 0.5 : 1 }}>
                  {submitting && <Loader2 style={{ width: 12, height: 12, animation: "spin 0.7s linear infinite" }} />}
                  {submitting ? "Generating…" : "Generate article"}
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

      {loading ? <FeedSkeleton /> : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 24px" }}>
          <Sparkles style={{ width: 28, height: 28, color: "var(--rose-dust-light)", margin: "0 auto 12px", display: "block" }} />
          <p style={{ fontSize: 14, color: "var(--plum)", fontWeight: 600, marginBottom: 6 }}>No articles yet</p>
          <p style={{ fontSize: 12, color: "var(--mauve)", marginBottom: 16 }}>Tap the refresh button to generate your first batch of FemWell originals.</p>
          <button onClick={triggerBackgroundGeneration} disabled={generating}
            style={{ padding: "10px 22px", borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            {generating ? "Generating…" : "Generate content"}
          </button>
        </div>
      ) : (
        <div>
          {filtered.map(item => (
            <div key={item.id} style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px", marginBottom: 12, boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                {item.category && (
                  <span style={{ fontSize: 10, fontWeight: 600, color: "var(--rose-dust)", backgroundColor: "var(--rose-dust-subtle)", borderRadius: 9999, padding: "2px 9px" }}>{item.category}</span>
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
                <span style={{ fontSize: 11, color: "var(--mauve)", opacity: 0.6 }}>{item.author_name} · {timeAgo(item.pub_date)}</span>
                <button onClick={() => onRead?.(item)}
                  style={{ fontSize: 12, fontWeight: 700, color: "white", backgroundColor: "var(--rose-dust)", border: "none", borderRadius: 9999, padding: "6px 16px", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                  Read
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}