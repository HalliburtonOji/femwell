import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ExternalLink, ChevronDown, ChevronUp, X, BookOpen, Bookmark } from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────
function stripHtml(str) {
  if (!str) return "";
  return str.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function fmtDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

const PRIMARY = "#C084FC";
const PRIMARY_LIGHT = "#F3E8FF";

// ── Shared spinner ────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
      <div style={{ width: 24, height: 24, border: `2px solid ${PRIMARY_LIGHT}`, borderTopColor: PRIMARY, borderRadius: "50%", animation: "lf-spin 0.7s linear infinite" }} />
    </div>
  );
}

// ── Category pill ─────────────────────────────────────────────────────────────
function Pill({ label, color = PRIMARY, bg = PRIMARY_LIGHT }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 600, color, backgroundColor: bg, borderRadius: 9999, padding: "2px 9px", fontFamily: "'Inter', sans-serif", display: "inline-block", flexShrink: 0 }}>
      {label}
    </span>
  );
}

// ── Full-screen article reader sheet ─────────────────────────────────────────
function ArticleSheet({ item, onClose }) {
  const [saved, setSaved] = useState(false);
  const paragraphs = (item.lede || item.summary || "").split(/\n\n+/).filter(Boolean);
  const takeaways = Array.isArray(item.takeaways) ? item.takeaways : [];

  const handleSave = async () => {
    setSaved(true);
    // Mark as bookmarked via ContentBookmarks if user is logged in
    try {
      const u = await base44.auth.me().catch(() => null);
      if (u) {
        await base44.entities.ContentBookmarks.create({
          user_id: u.id,
          item_id: item.id,
          item_type: "lifestyle",
          created_at: new Date().toISOString(),
        }).catch(() => {});
      }
    } catch {}
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 60, backgroundColor: "rgba(42,32,53,0.55)", backdropFilter: "blur(6px)" }} />
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 61, backgroundColor: "var(--surface)", borderRadius: "24px 24px 0 0", maxHeight: "92vh", display: "flex", flexDirection: "column" }}>
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 6px", flexShrink: 0 }}>
          <div style={{ width: 32, height: 4, borderRadius: 9999, backgroundColor: "var(--border)" }} />
        </div>
        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px 10px", flexShrink: 0 }}>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9999, backgroundColor: "var(--ivory-dark)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X className="w-4 h-4" style={{ color: "var(--mauve)" }} />
          </button>
          <button onClick={handleSave} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 9999, border: "1px solid var(--border)", backgroundColor: saved ? PRIMARY_LIGHT : "transparent", cursor: "pointer", fontSize: 12, fontWeight: 600, color: saved ? PRIMARY : "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
            <Bookmark className="w-3.5 h-3.5" style={{ fill: saved ? PRIMARY : "none" }} />
            {saved ? "Saved" : "Save"}
          </button>
        </div>
        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 48px" }}>
          {/* Hero image */}
          {item.image_url && (
            <div style={{ height: 220, borderRadius: 18, overflow: "hidden", marginBottom: 20 }}>
              <img src={item.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.parentElement.style.display = "none"} />
            </div>
          )}
          {/* Pills */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {item.category && <Pill label={item.category} />}
            {item.emotional_tag && <Pill label={item.emotional_tag} color="#7C3AED" bg="#EDE9FE" />}
          </div>
          {/* Title */}
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "var(--plum)", lineHeight: 1.3, marginBottom: 10 }}>{item.title}</h2>
          {/* Meta */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {item.author_name && <span style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{item.author_name}</span>}
            {item.published_at && <span style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", opacity: 0.7 }}>· {fmtDate(item.published_at)}</span>}
            {item.source_name && <span style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", opacity: 0.7 }}>· {item.source_name}</span>}
          </div>
          {/* Body paragraphs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
            {paragraphs.map((para, i) => (
              <p key={i} style={{ fontSize: 15, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.75, margin: 0 }}>{stripHtml(para)}</p>
            ))}
          </div>
          {/* Why it matters */}
          {item.why_it_matters && (
            <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", fontStyle: "italic", lineHeight: 1.65, marginBottom: 20 }}>{item.why_it_matters}</p>
          )}
          {/* Takeaways */}
          {takeaways.length > 0 && (
            <div style={{ backgroundColor: PRIMARY_LIGHT, borderRadius: 16, padding: "14px 16px", marginBottom: 20 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: PRIMARY, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif", marginBottom: 10 }}>Key takeaways</p>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {takeaways.map((t, i) => (
                  <li key={i} style={{ fontSize: 13, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.65, marginBottom: 6 }}>{t}</li>
                ))}
              </ul>
            </div>
          )}
          {/* External link fallback */}
          {item.content_url && (
            <a href={item.content_url} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: PRIMARY, fontFamily: "'Inter', sans-serif", textDecoration: "none" }}>
              Read on {item.source_name || "source"} <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </>
  );
}

// ── Category gradient placeholders ───────────────────────────────────────────
const CAT_GRADIENTS = {
  "Health":        "linear-gradient(135deg, #EBF2EF 0%, #B5CEC5 100%)",
  "Nutrition":     "linear-gradient(135deg, #FFF8E6 0%, #FFE8A0 100%)",
  "Mental Health": "linear-gradient(135deg, #F0EBF5 0%, #DDD0FF 100%)",
  "Fitness":       "linear-gradient(135deg, #E8F4FF 0%, #C8DEFF 100%)",
  "Cycle":         "linear-gradient(135deg, #F5ECF0 0%, #E8C4D0 100%)",
  "Skin":          "linear-gradient(135deg, #FFF0F5 0%, #FFD6E7 100%)",
  "Sleep":         "linear-gradient(135deg, #EBE8F5 0%, #C8BEFF 100%)",
  "default":       "linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)",
};

function getCatGradient(category) {
  return CAT_GRADIENTS[category] || CAT_GRADIENTS["default"];
}

// ── Tappable item card (opens sheet or new tab) ───────────────────────────────
function ContentCard({ item, compact = false }) {
  const [open, setOpen] = useState(false);
  const hasInternalContent = item.lede || item.provider === "FEMWELL_AI";
  const sourceName = item.source_name || "FemWell Editorial";
  const hasExternalLink = !hasInternalContent && !!item.content_url;

  const handleClick = () => {
    if (hasInternalContent) {
      setOpen(true);
    } else if (item.content_url) {
      window.open(item.content_url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      {compact ? (
        <div onClick={handleClick} style={{ display: "flex", gap: 12, backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", cursor: "pointer", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ width: 90, flexShrink: 0, overflow: "hidden" }}>
            {item.image_url
              ? <img src={item.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; e.target.parentElement.style.background = getCatGradient(item.category); }} />
              : <div style={{ width: "100%", height: "100%", minHeight: 80, background: getCatGradient(item.category) }} />
            }
          </div>
          <div style={{ flex: 1, padding: "12px 14px", minWidth: 0 }}>
            {item.category && <Pill label={item.category} />}
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.35, margin: "6px 0 4px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.title}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", marginTop: 4 }}>
              <span style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{sourceName}</span>
              {item.published_at && <span style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", opacity: 0.6 }}>· {fmtDate(item.published_at)}</span>}
              {hasExternalLink && <ExternalLink style={{ width: 10, height: 10, color: "var(--mauve)", opacity: 0.5, flexShrink: 0 }} />}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "block", backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden", cursor: "pointer", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ height: 180, overflow: "hidden" }} onClick={handleClick}>
            {item.image_url
              ? <img src={item.image_url} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; e.target.parentElement.style.background = getCatGradient(item.category); }} />
              : <div style={{ width: "100%", height: "100%", background: getCatGradient(item.category) }} />
            }
          </div>
          <div style={{ padding: "14px 16px 16px" }} onClick={handleClick}>
            {item.category && <Pill label={item.category} />}
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.4, margin: "8px 0 4px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.title}</p>
            {item.summary && <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", margin: 0 }}>{stripHtml(item.summary)}</p>}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{sourceName}</span>
                {hasExternalLink && <ExternalLink style={{ width: 10, height: 10, color: "var(--mauve)", opacity: 0.5 }} />}
              </div>
              {hasExternalLink && (
                <a href={item.content_url} target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{ fontSize: 11, fontWeight: 600, color: PRIMARY, fontFamily: "'Inter', sans-serif", textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
                  Read more <ExternalLink style={{ width: 10, height: 10 }} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
      {open && <ArticleSheet item={item} onClose={() => setOpen(false)} />}
    </>
  );
}

// ── FOR YOU tab ───────────────────────────────────────────────────────────────
function ForYouTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const all = await base44.entities.LifestyleItems.filter({ status: "PUBLISHED" }, "-engagement_score", 20).catch(() => []);
      // Prioritize FEMWELL_AI or items with lede
      const sorted = [
        ...all.filter(i => i.provider === "FEMWELL_AI" || i.lede),
        ...all.filter(i => i.provider !== "FEMWELL_AI" && !i.lede),
      ].slice(0, 12);
      setItems(sorted);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Spinner />;
  if (!items.length) return <EmptyState text="Your feed is warming up. Check back soon." />;

  return (
    <div className="space-y-4">
      {items.map(item => <ContentCard key={item.id} item={item} />)}
    </div>
  );
}

// ── DAILY STORY tab ───────────────────────────────────────────────────────────
function DailyStoryTab() {
  const [current, setCurrent] = useState(null);
  const [archive, setArchive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState(new Set());

  useEffect(() => {
    (async () => {
      const today = todayStr();
      const all = await base44.entities.DailyStory.list("-day_number", 100).catch(() => []);
      const published = all.filter(s => s.published_date <= today);
      if (published.length) {
        setCurrent(published[0]);
        setArchive(published.slice(1));
      }
      setLoading(false);
    })();
  }, []);

  const toggleDay = (id) => setExpandedDays(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  if (loading) return <Spinner />;
  if (!current) return <EmptyState text="The daily story is being written. Check back soon." />;

  const bg = current.image_gradient || "linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)";

  return (
    <div>
      <div style={{ borderRadius: 20, overflow: "hidden", marginBottom: 20, boxShadow: "var(--shadow-md)" }}>
        <div style={{ background: bg, padding: "28px 24px 24px", minHeight: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: PRIMARY, backgroundColor: PRIMARY_LIGHT, borderRadius: 9999, padding: "3px 10px", fontFamily: "'Inter', sans-serif" }}>
              Day {current.day_number} of 30
            </span>
          </div>
          <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(42,32,53,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>
            {current.series_title}
          </p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "var(--plum)", lineHeight: 1.3, marginBottom: 20 }}>
            {current.title || `Day ${current.day_number}`}
          </h2>
          <p style={{ fontSize: 15, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.75, whiteSpace: "pre-line" }}>
            {current.segment_text}
          </p>
          {current.cliffhanger && (
            <>
              <div style={{ height: 1, backgroundColor: "rgba(42,32,53,0.12)", margin: "24px 0" }} />
              <p style={{ fontSize: 13, color: "rgba(42,32,53,0.55)", fontFamily: "'Inter', sans-serif", fontStyle: "italic", lineHeight: 1.6 }}>
                <strong style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", fontStyle: "normal", display: "block", marginBottom: 4 }}>Tomorrow…</strong>
                {current.cliffhanger}
              </p>
            </>
          )}
        </div>
      </div>

      {archive.length > 0 && (
        <div>
          <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 10 }}>Previous segments</p>
          <div className="space-y-2">
            {archive.map(s => {
              const expanded = expandedDays.has(s.id);
              return (
                <div key={s.id} style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14 }}>
                  <button onClick={() => toggleDay(s.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "12px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: PRIMARY, fontFamily: "'Inter', sans-serif" }}>Day {s.day_number}</span>
                      <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", margin: "2px 0 0" }}>{(s.segment_text || "").slice(0, 60)}{(s.segment_text || "").length > 60 ? "…" : ""}</p>
                    </div>
                    {expanded ? <ChevronUp className="w-4 h-4" style={{ color: "var(--mauve)", flexShrink: 0 }} /> : <ChevronDown className="w-4 h-4" style={{ color: "var(--mauve)", flexShrink: 0 }} />}
                  </button>
                  {expanded && (
                    <div style={{ padding: "0 14px 14px" }}>
                      <p style={{ fontSize: 13, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.65, whiteSpace: "pre-line" }}>{s.segment_text}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── READ tab ──────────────────────────────────────────────────────────────────
function ReadTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("All");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    (async () => {
      const all = await base44.entities.LifestyleItems.filter({ content_type: "ARTICLE", status: "PUBLISHED" }, "-published_at", 80).catch(() => []);
      // Prioritize FEMWELL_AI or items with lede — deprioritize filler
      const sorted = [
        ...all.filter(i => i.provider === "FEMWELL_AI" || i.lede),
        ...all.filter(i => i.provider !== "FEMWELL_AI" && !i.lede),
      ];
      setItems(sorted);
      const cats = ["All", ...new Set(sorted.map(i => i.category).filter(Boolean))];
      setCategories(cats);
      setLoading(false);
    })();
  }, []);

  const filtered = catFilter === "All" ? items : items.filter(i => i.category === catFilter);

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 16 }} className="lf-scroll">
        {categories.map(cat => (
          <button key={cat} onClick={() => setCatFilter(cat)}
            style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 9999, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none", fontFamily: "'Inter', sans-serif",
              backgroundColor: catFilter === cat ? PRIMARY : "var(--ivory-dark)",
              color: catFilter === cat ? "white" : "var(--mauve)" }}>
            {cat}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? <EmptyState text="No articles yet." /> : (
        <div className="space-y-3">
          {filtered.map(item => <ContentCard key={item.id} item={item} compact />)}
        </div>
      )}
    </div>
  );
}

// ── FICTION & STORIES tabs (use ContentCard in card mode) ─────────────────────
function FictionTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const all = await base44.entities.LifestyleItems.filter({ content_type: "FICTION", status: "PUBLISHED" }, "-published_at", 30).catch(() => []);
      setItems(all); setLoading(false);
    })();
  }, []);
  if (loading) return <Spinner />;
  if (!items.length) return <EmptyState text="Fiction stories coming soon." />;
  return <div className="space-y-4">{items.map(item => <ContentCard key={item.id} item={item} />)}</div>;
}

function StoriesTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const all = await base44.entities.LifestyleItems.filter({ content_type: "STORY", status: "PUBLISHED" }, "-published_at", 30).catch(() => []);
      setItems(all); setLoading(false);
    })();
  }, []);
  if (loading) return <Spinner />;
  if (!items.length) return <EmptyState text="Personal stories coming soon." />;
  return <div className="space-y-4">{items.map(item => <ContentCard key={item.id} item={item} />)}</div>;
}

// ── BOOKS tab ─────────────────────────────────────────────────────────────────
function BooksTab() {
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const all = await base44.entities.WeeklyBookPick.filter({ status: "PUBLISHED" }, "-week_start", 20).catch(() => []);
      setPicks(all); setLoading(false);
    })();
  }, []);

  if (loading) return <Spinner />;
  if (!picks.length) return <EmptyState text="Weekly book picks coming soon." />;

  const [featured, ...rest] = picks;

  const BookCard = ({ pick, featured: isFeatured }) => {
    const books = Array.isArray(pick.books) ? pick.books : [];
    const book = books[0];
    if (!book) return null;
    const lessons = Array.isArray(book.key_lessons) ? book.key_lessons : [];
    return (
      <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden", marginBottom: 16, boxShadow: "var(--shadow-sm)" }}>
        {book.cover_url && isFeatured && (
          <div style={{ height: 220, overflow: "hidden" }}>
            <img src={book.cover_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.parentElement.style.display = "none"} />
          </div>
        )}
        <div style={{ padding: isFeatured ? "20px 18px 18px" : "14px 16px 16px" }}>
          {pick.week_start && (
            <span style={{ fontSize: 10, fontWeight: 700, color: PRIMARY, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif", display: "block", marginBottom: 6 }}>
              Week of {fmtDate(pick.week_start)}
            </span>
          )}
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: isFeatured ? 20 : 16, fontWeight: 700, color: "var(--plum)", margin: "0 0 2px", lineHeight: 1.3 }}>{book.title}</h3>
          <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", fontStyle: "italic", margin: "0 0 10px" }}>{book.author}</p>
          {book.tagline && isFeatured && <p style={{ fontSize: 14, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.6, marginBottom: 14 }}>{book.tagline}</p>}
          {lessons.length > 0 && isFeatured && (
            <div style={{ backgroundColor: PRIMARY_LIGHT, borderRadius: 14, padding: "12px 14px", marginBottom: 14 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: PRIMARY, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>Key lessons</p>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {lessons.map((l, i) => <li key={i} style={{ fontSize: 13, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.6, marginBottom: 4 }}>{l}</li>)}
              </ul>
            </div>
          )}
          {book.femwell_connection && isFeatured && (
            <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", lineHeight: 1.6, fontStyle: "italic", marginBottom: 14 }}>{book.femwell_connection}</p>
          )}
          {book.goodreads_url && (
            <a href={book.goodreads_url} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, backgroundColor: PRIMARY, color: "white", borderRadius: 9999, padding: "8px 18px", fontSize: 12, fontWeight: 600, fontFamily: "'Inter', sans-serif", textDecoration: "none" }}>
              <BookOpen className="w-3.5 h-3.5" /> View on Goodreads
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <BookCard pick={featured} featured />
      {rest.length > 0 && (
        <>
          <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 12, marginTop: 4 }}>Previous picks</p>
          {rest.map(pick => <BookCard key={pick.id} pick={pick} featured={false} />)}
        </>
      )}
    </div>
  );
}

// ── HOROSCOPE tab ─────────────────────────────────────────────────────────────
const ZODIAC = [
  { name: "Aries", emoji: "♈" }, { name: "Taurus", emoji: "♉" }, { name: "Gemini", emoji: "♊" },
  { name: "Cancer", emoji: "♋" }, { name: "Leo", emoji: "♌" }, { name: "Virgo", emoji: "♍" },
  { name: "Libra", emoji: "♎" }, { name: "Scorpio", emoji: "♏" }, { name: "Sagittarius", emoji: "♐" },
  { name: "Capricorn", emoji: "♑" }, { name: "Aquarius", emoji: "♒" }, { name: "Pisces", emoji: "♓" },
];

function HoroscopeTab() {
  const [selected, setSelected] = useState(() => localStorage.getItem("femwell_zodiac") || "Aries");
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setContent(null);
      const all = await base44.entities.ContentItems.filter({ content_type: "GUIDE" }, "-created_date", 100).catch(() => []);
      const match = all.find(it => {
        const tags = Array.isArray(it.tags) ? it.tags : [];
        return tags.some(t => t.toLowerCase() === selected.toLowerCase()) ||
          (it.title || "").toLowerCase().includes(selected.toLowerCase());
      });
      setContent(match || null);
      setLoading(false);
    })();
  }, [selected]);

  const handleSelect = (name) => {
    localStorage.setItem("femwell_zodiac", name);
    setSelected(name);
  };

  const sign = ZODIAC.find(z => z.name === selected);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 }}>
        {ZODIAC.map(({ name, emoji }) => (
          <button key={name} onClick={() => handleSelect(name)}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "10px 6px", borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.15s",
              backgroundColor: selected === name ? PRIMARY : "var(--ivory-dark)",
              color: selected === name ? "white" : "var(--plum)" }}>
            <span style={{ fontSize: 18 }}>{emoji}</span>
            <span style={{ fontSize: 10, fontWeight: 600 }}>{name}</span>
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : content ? (
        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "22px 20px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 28 }}>{sign?.emoji}</span>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: PRIMARY, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif" }}>Horoscope</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "var(--plum)", margin: 0 }}>{selected}</h2>
            </div>
          </div>
          <p style={{ fontSize: 15, color: "var(--plum)", lineHeight: 1.75, fontFamily: "'Inter', sans-serif", whiteSpace: "pre-line" }}>
            {stripHtml(content.body || content.summary || "")}
          </p>
        </div>
      ) : (
        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "40px 24px", textAlign: "center", boxShadow: "var(--shadow-sm)" }}>
          <span style={{ fontSize: 40, display: "block", marginBottom: 12 }}>{sign?.emoji}</span>
          <p style={{ fontSize: 16, fontWeight: 600, color: "var(--plum)", fontFamily: "'Playfair Display', serif", marginBottom: 6 }}>{selected}</p>
          <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Check back soon — your reading is being written.</p>
        </div>
      )}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ text }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 24px" }}>
      <p style={{ fontSize: 14, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{text}</p>
    </div>
  );
}

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "for_you",     label: "For You" },
  { id: "daily_story", label: "Daily Story" },
  { id: "read",        label: "Read" },
  { id: "fiction",     label: "Fiction" },
  { id: "stories",     label: "Stories" },
  { id: "books",       label: "Books" },
  { id: "horoscope",   label: "Horoscope" },
];

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Lifestyle() {
  const [tab, setTab] = useState(() => {
    const p = new URLSearchParams(window.location.search).get("tab");
    return TABS.some(t => t.id === p) ? p : "for_you";
  });

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      <style>{`.lf-scroll::-webkit-scrollbar{display:none}.lf-scroll{-ms-overflow-style:none;scrollbar-width:none}@keyframes lf-spin{to{transform:rotate(360deg)}}.space-y-3>*+*{margin-top:12px}.space-y-4>*+*{margin-top:16px}.space-y-2>*+*{margin-top:8px}`}</style>

      {/* Sticky header */}
      <div className="sticky top-0 z-30" style={{ backgroundColor: "rgba(250,248,245,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-xl mx-auto px-4 pt-10 pb-3">
          <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Discover</p>
          <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: "var(--plum)", letterSpacing: "-0.02em", marginBottom: 12 }}>Lifestyle</h1>

          <div className="lf-scroll" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ flexShrink: 0, padding: "7px 16px", borderRadius: 9999, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", transition: "all 0.15s", fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap",
                  backgroundColor: tab === t.id ? PRIMARY : "var(--ivory-dark)",
                  color: tab === t.id ? "white" : "var(--mauve)" }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-xl mx-auto px-4 pt-5">
        {tab === "for_you"     && <ForYouTab />}
        {tab === "daily_story" && <DailyStoryTab />}
        {tab === "read"        && <ReadTab />}
        {tab === "fiction"     && <FictionTab />}
        {tab === "stories"     && <StoriesTab />}
        {tab === "books"       && <BooksTab />}
        {tab === "horoscope"   && <HoroscopeTab />}
      </div>
    </div>
  );
}