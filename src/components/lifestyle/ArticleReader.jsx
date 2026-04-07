import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Bookmark, BookmarkCheck, Loader2 } from "lucide-react";

function stripHtml(str) {
  if (!str) return "";
  return str.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default function ArticleReader({ item, onClose }) {
  const [fullBody, setFullBody] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [relatedItems, setRelatedItems] = useState([]);

  useEffect(() => {
    if (!item) return;
    setSaved(false);
    setFullBody(null);

    const loadContent = async () => {
      setLoading(true);
      const lede = item.lede || "";
      if (lede.length >= 300) {
        setFullBody(stripHtml(lede));
      } else if (item.provider === "FEMWELL_AI" || item.provider === "FEMWELL_AI_USER_REQUEST") {
        try {
          const res = await base44.functions.invoke("expandContent", {
            item_id: item.id, title: item.title,
            summary: item.summary || lede, content_type: item.content_type,
          });
          setFullBody(res?.data?.body || item.summary || lede);
        } catch {
          setFullBody(item.summary || lede);
        }
      } else {
        setFullBody(item.summary || lede);
      }

      // Load related items by category
      try {
        const all = await base44.entities.LifestyleItems.filter({ category: item.category });
        setRelatedItems(all.filter(i => i.id !== item.id && i.status === "PUBLISHED").slice(0, 3));
      } catch {}

      setLoading(false);
    };

    loadContent();
  }, [item?.id]);

  const handleSave = async () => {
    setSaved(v => !v);
    await base44.functions.invoke("recordLifestyleAction", {
      item_id: item.id, action: saved ? "unsave" : "save", category: item.category,
    }).catch(() => {});
  };

  if (!item) return null;
  const takeaways = [item.takeaway_1, item.takeaway_2, item.takeaway_3].filter(Boolean);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 60, backgroundColor: "rgba(42,32,53,0.55)", backdropFilter: "blur(8px)" }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 61, backgroundColor: "var(--surface)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        {/* Top bar */}
        <div style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {item.category && <span style={{ fontSize: 11, fontWeight: 600, color: "var(--rose-dust)", backgroundColor: "var(--rose-dust-subtle)", borderRadius: 9999, padding: "3px 10px" }}>{item.category}</span>}
            {item.emotional_tag && <span style={{ fontSize: 11, fontWeight: 600, color: "#7c3aed", backgroundColor: "#ede9fe", borderRadius: 9999, padding: "3px 10px" }}>{item.emotional_tag}</span>}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={handleSave} style={{ border: "none", background: "none", cursor: "pointer", padding: 4 }}>
              {saved ? <BookmarkCheck style={{ width: 18, height: 18, color: "var(--rose-dust)" }} /> : <Bookmark style={{ width: 18, height: 18, color: "var(--mauve)" }} />}
            </button>
            <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 9999, backgroundColor: "var(--ivory-dark)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X style={{ width: 16, height: 16, color: "var(--mauve)" }} />
            </button>
          </div>
        </div>

        {/* Article content */}
        <div style={{ maxWidth: 680, margin: "0 auto", width: "100%", padding: "28px 20px 60px" }}>
          {/* Phase tags */}
          {item.phase_tags?.length > 0 && (
            <div style={{ display: "flex", gap: 5, marginBottom: 14 }}>
              {item.phase_tags.map(pt => (
                <span key={pt} style={{ fontSize: 10, fontWeight: 600, color: "var(--mauve)", backgroundColor: "var(--ivory-dark)", borderRadius: 9999, padding: "2px 8px", textTransform: "capitalize" }}>{pt} phase</span>
              ))}
            </div>
          )}

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "var(--plum)", lineHeight: 1.25, marginBottom: 12 }}>{item.title}</h1>

          {(item.author_name || item.source_name) && (
            <p style={{ fontSize: 12, color: "var(--mauve)", marginBottom: 20 }}>
              {item.author_name}{item.source_name && item.author_name ? ` · ${item.source_name}` : item.source_name}
            </p>
          )}

          {item.why_it_matters && (
            <div style={{ borderLeft: "3px solid var(--rose-dust)", paddingLeft: 14, marginBottom: 24 }}>
              <p style={{ fontSize: 14, color: "var(--plum)", fontStyle: "italic", lineHeight: 1.65, margin: 0 }}>{item.why_it_matters}</p>
            </div>
          )}

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "24px 0" }}>
              <Loader2 style={{ width: 18, height: 18, color: "var(--rose-dust)", animation: "spin 0.7s linear infinite" }} />
              <span style={{ fontSize: 13, color: "var(--mauve)" }}>Loading full article…</span>
            </div>
          ) : (
            <p style={{ fontSize: 15, color: "var(--plum)", lineHeight: 1.8, fontFamily: "'Inter', sans-serif", whiteSpace: "pre-line", marginBottom: 28 }}>
              {stripHtml(fullBody || item.summary || "")}
            </p>
          )}

          {takeaways.length > 0 && (
            <div style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", borderRadius: 16, padding: "16px 18px", marginBottom: 24 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--rose-dust)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Key takeaways</p>
              {takeaways.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", backgroundColor: "var(--rose-dust)", color: "white", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                  <p style={{ fontSize: 13, color: "var(--plum)", lineHeight: 1.55, margin: 0 }}>{t}</p>
                </div>
              ))}
            </div>
          )}

          {/* Related */}
          {relatedItems.length > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", marginBottom: 12 }}>More from {item.category}</p>
              {relatedItems.map(r => (
                <div key={r.id} style={{ backgroundColor: "var(--ivory)", borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", lineHeight: 1.4, margin: "0 0 4px" }}>{r.title}</p>
                  <p style={{ fontSize: 11, color: "var(--mauve)", margin: 0 }}>{r.author_name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}