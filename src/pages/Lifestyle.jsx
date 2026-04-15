import { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, BookOpen, Play, BookMarked, FileText, Bookmark, BookmarkCheck, ExternalLink, ChevronDown, ChevronUp, X } from "lucide-react";
import FeedSkeleton from "../components/lifestyle/FeedSkeleton";
import SmartFemwellTab from "../components/lifestyle/SmartFemwellTab";
import ArticleReader from "../components/lifestyle/ArticleReader";
import FictionFeedSection from "../components/lifestyle/FictionFeedSection";
import WeeklyBookPick from "../components/lifestyle/WeeklyBookPick";

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
  const [embedError, setEmbedError] = useState(false);
  const [checkingEmbed, setCheckingEmbed] = useState(false);
  const [localSaved, setLocalSaved] = useState(saved);
  const handleSave = async () => {
    const next = !localSaved;
    setLocalSaved(next);
    onSave?.(item.id, next);
    await base44.functions.invoke("recordLifestyleAction", { item_id: item.id, action: next ? "save" : "unsave", category: item.category }).catch(() => {});
  };
  const videoId = item.video_id || (item.content_url?.match(/[?&]v=([^&]+)/)?.[1]) || (item.embed_url?.match(/embed\/([A-Za-z0-9_-]{11})/)?.[1]);
  const thumb = item.image_url || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "");
  const embedSrc = videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&autoplay=1` : null;
  const showFallback = playing && (!embedSrc || embedError);

  const handlePlay = async () => {
    if (!videoId) { setEmbedError(true); setPlaying(true); return; }
    setCheckingEmbed(true);
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (!res.ok) setEmbedError(true);
    } catch { /* network error — try iframe anyway */ }
    setCheckingEmbed(false);
    setPlaying(true);
  };

  return (
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", borderRadius: 16, overflow: "hidden", marginBottom: 14 }}>
      <div style={{ position: "relative", paddingBottom: "56.25%", backgroundColor: "#111" }}>
        {playing && !showFallback ? (
          <iframe src={embedSrc} title={item.title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
            onError={() => setEmbedError(true)} />
        ) : showFallback ? (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#111" }}>
            {thumb && <img src={thumb} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.2 }} />}
            <a href={item.content_url} target="_blank" rel="noopener noreferrer"
              style={{ position: "relative", zIndex: 1, backgroundColor: "rgba(255,255,255,0.93)", color: "var(--plum)", borderRadius: 9999, padding: "10px 20px", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif", textDecoration: "none" }}>
              Watch on YouTube
            </a>
          </div>
        ) : (
          <button onClick={handlePlay}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", padding: 0, cursor: "pointer", background: "none" }}>
            {thumb && <img src={thumb} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
            <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.18)" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: 9999, backgroundColor: "rgba(255,255,255,0.93)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.22)" }}>
                {checkingEmbed
                  ? <div style={{ width: 18, height: 18, border: "2.5px solid var(--rose-dust-light)", borderTopColor: "var(--rose-dust)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  : <Play style={{ width: 20, height: 20, color: "var(--plum)", marginLeft: 3 }} fill="currentColor" />
                }
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
  const [readerOpen, setReaderOpen] = useState(false);
  const [localSaved, setLocalSaved] = useState(saved);
  const [fullBody, setFullBody] = useState(null);
  const [generatingBody, setGeneratingBody] = useState(false);
  const hasExternalUrl = !!(item.content_url && item.content_url.startsWith("http"));
  const isInternal = isStory || !hasExternalUrl;
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

  const handleReaderOpen = async () => {
    setReaderOpen(true);
    const stored = item.lede || '';
    if (stored.length >= 400) { setFullBody(stored); return; }
    if (item.provider === 'FEMWELL_AI') {
      setGeneratingBody(true);
      try {
        const res = await base44.functions.invoke('expandContent', {
          item_id: item.id, title: item.title,
          summary: item.summary || stored || '',
          content_type: item.content_type,
        });
        setFullBody(res?.data?.body || item.summary || stored);
      } catch { setFullBody(item.summary || stored); }
      setGeneratingBody(false);
    } else {
      setFullBody(item.summary || stored);
    }
  };
  const takeaways = [item.takeaway_1, item.takeaway_2, item.takeaway_3].filter(Boolean);
  const displayText = stripHtml(item.summary || item.lede || "");
  return (
    <>
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", borderRadius: 16, overflow: "hidden", marginBottom: 14 }}>
      {item.image_url && (
        <div style={{ width: "100%", height: 180, overflow: "hidden" }}>
          <img src={item.image_url} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={(e) => { e.target.style.display = "none"; }} />
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
            <button onClick={isInternal ? handleReaderOpen : handleOpen} className="btn-primary" style={{ fontSize: 12, padding: "5px 14px" }}>{item.provider === 'FEMWELL_AI' ? 'Read full' : 'Read'}</button>
          </div>
        </div>
      </div>
    </div>
    {readerOpen && (
      <>
        <div onClick={() => setReaderOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 60, backgroundColor: "rgba(42,32,53,0.5)", backdropFilter: "blur(6px)" }} />
        <div style={{ position: "fixed", inset: 0, zIndex: 61, backgroundColor: "var(--surface)", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 16px 0", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {item.category && <span style={{ fontSize: 11, fontWeight: 600, color: "var(--rose-dust)", backgroundColor: "var(--rose-dust-subtle)", borderRadius: 9999, padding: "3px 10px" }}>{item.category}</span>}
              {item.emotional_tag && <span style={{ fontSize: 11, fontWeight: 600, color: "#7c3aed", backgroundColor: "#ede9fe", borderRadius: 9999, padding: "3px 10px" }}>{item.emotional_tag}</span>}
            </div>
            <button onClick={() => setReaderOpen(false)} style={{ width: 32, height: 32, borderRadius: 9999, backgroundColor: "var(--ivory-dark)", color: "var(--mauve)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px 60px", maxWidth: 680, margin: "0 auto", width: "100%" }}>
            {item.image_url && (
              <div style={{ height: 200, borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
                <img src={item.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => e.target.parentElement.style.display = "none"} />
              </div>
            )}
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "var(--plum)", lineHeight: 1.3, marginBottom: 10 }}>{item.title}</h1>
            {(item.author_name || item.source_name) && (
              <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 16 }}>
                {item.author_name}{item.source_name ? (item.author_name ? ` \u00b7 ${item.source_name}` : item.source_name) : ""}
              </p>
            )}
            {generatingBody ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 0' }}>
                <div style={{ width: 18, height: 18, border: '2px solid var(--rose-dust-light)', borderTopColor: 'var(--rose-dust)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--mauve)', fontFamily: "'Inter', sans-serif" }}>Generating full content...</span>
              </div>
            ) : (fullBody || item.summary || item.lede) ? (
              <p style={{ fontSize: 15, color: "var(--plum)", lineHeight: 1.75, fontFamily: "'Inter', sans-serif", marginBottom: 20, whiteSpace: 'pre-line' }}>{stripHtml(fullBody || item.summary || item.lede)}</p>
            ) : null}
            {(()=>{ const tks = item.takeaways?.length ? item.takeaways : [item.takeaway_1, item.takeaway_2, item.takeaway_3].filter(Boolean); return tks.length > 0 && (
              <div style={{ backgroundColor: "var(--ivory)", borderRadius: 16, padding: "14px 16px", marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontFamily: "'Inter', sans-serif" }}>Key takeaways</p>
                <ul style={{ paddingLeft: 16, margin: 0 }}>{tks.map((t,i)=><li key={i} style={{ fontSize: 13, color: "var(--plum)", lineHeight: 1.6, marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>{t}</li>)}</ul>
              </div>
            ); })()}
            {item.why_it_matters && (
              <p style={{ fontSize: 14, color: "var(--mauve)", lineHeight: 1.65, fontStyle: "italic", borderLeft: "3px solid var(--rose-dust-light)", paddingLeft: 12, marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>{item.why_it_matters}</p>
            )}
            {item.phase_tags?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
                {item.phase_tags.map(pt => <span key={pt} style={{ fontSize: 10, fontWeight: 500, color: "var(--mauve)", backgroundColor: "var(--ivory-dark)", borderRadius: 9999, padding: "2px 8px" }}>{pt}</span>)}
              </div>
            )}
            {hasExternalUrl && (
              <a href={item.content_url} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif", textDecoration: "none" }}>
                Read full article
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            )}
          </div>
        </div>
      </>
    )}
  </>
  );
}

const FULL_BOOKS = [
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    category: "Relationships",
    year: "1813",
    description: "The beloved story of Elizabeth Bennet and Mr Darcy — a masterpiece of wit, class, and the politics of women's choices.",
    read_url: "https://www.gutenberg.org/files/1342/1342-h/1342-h.htm",
    pages: "432",
  },
  {
    title: "Jane Eyre",
    author: "Charlotte Brontë",
    category: "Identity",
    year: "1847",
    description: "A fiercely independent woman navigates love, morality and self-determination in Victorian England.",
    read_url: "https://www.gutenberg.org/files/1260/1260-h/1260-h.htm",
    pages: "507",
  },
  {
    title: "Little Women",
    author: "Louisa May Alcott",
    category: "Self Care",
    year: "1868",
    description: "Four sisters come of age during the Civil War — ambition, love, loss and the cost of being a woman who wants more.",
    read_url: "https://www.gutenberg.org/files/514/514-h/514-h.htm",
    pages: "449",
  },
  {
    title: "The Awakening",
    author: "Kate Chopin",
    category: "Body Image",
    year: "1899",
    description: "A landmark of feminist literature — a woman's radical awakening to desire, independence and selfhood.",
    read_url: "https://www.gutenberg.org/files/160/160-h/160-h.htm",
    pages: "195",
  },
  {
    title: "A Room with a View",
    author: "E.M. Forster",
    category: "Relationships",
    year: "1908",
    description: "Lucy Honeychurch is torn between convention and passion. A warm, witty novel about breaking free from expectation.",
    read_url: "https://www.gutenberg.org/files/2641/2641-h/2641-h.htm",
    pages: "224",
  },
  {
    title: "Middlemarch",
    author: "George Eliot",
    category: "Career & Money",
    year: "1871",
    description: "Often called the greatest novel in English — a study of idealism, marriage, ambition and the limits placed on women.",
    read_url: "https://www.gutenberg.org/files/145/145-h/145-h.htm",
    pages: "800",
  },
  {
    title: "Cranford",
    author: "Elizabeth Gaskell",
    category: "Lifestyle",
    year: "1853",
    description: "A quiet, funny and moving portrait of a community of women navigating life, loss and friendship on their own terms.",
    read_url: "https://www.gutenberg.org/files/394/394-h/394-h.htm",
    pages: "210",
  },
  {
    title: "The Yellow Wallpaper",
    author: "Charlotte Perkins Gilman",
    category: "Mental Health",
    year: "1892",
    description: "A short story about a woman's descent into madness — a devastating critique of how medicine treated women's minds.",
    read_url: "https://www.gutenberg.org/files/1952/1952-h/1952-h.htm",
    pages: "30",
  },
];

function FullBookCard({ book }) {
  const [saved, setSaved] = useState(false);
  const categoryColors = {
    "Relationships": { bg: "var(--rose-dust-subtle)", color: "var(--rose-dust)" },
    "Identity": { bg: "var(--mauve-subtle)", color: "var(--mauve)" },
    "Mental Health": { bg: "#E8F4FF", color: "#5B9BD5" },
    "Self Care": { bg: "var(--sage-subtle)", color: "var(--sage)" },
    "Body Image": { bg: "var(--rose-dust-subtle)", color: "var(--rose-dust)" },
    "Career & Money": { bg: "#FFF8E6", color: "#C4954A" },
    "Lifestyle": { bg: "var(--ivory-dark)", color: "var(--mauve)" },
  };
  const catStyle = categoryColors[book.category] || { bg: "var(--ivory-dark)", color: "var(--mauve)" };
  return (
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", borderRadius: 18, padding: "18px 18px 16px", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: catStyle.color, backgroundColor: catStyle.bg, borderRadius: 9999, padding: "2px 9px" }}>{book.category}</span>
            <span style={{ fontSize: 10, fontWeight: 500, color: "var(--mauve)", backgroundColor: "var(--ivory-dark)", borderRadius: 9999, padding: "2px 9px" }}>{book.year}</span>
            {book.pages && <span style={{ fontSize: 10, color: "var(--mauve)", backgroundColor: "var(--ivory-dark)", borderRadius: 9999, padding: "2px 9px" }}>{book.pages} pages</span>}
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--plum)", fontFamily: "'Playfair Display', serif", margin: "0 0 2px", lineHeight: 1.3 }}>{book.title}</h3>
          <p style={{ fontSize: 12, color: "var(--mauve)", margin: "0 0 8px", fontStyle: "italic" }}>{book.author}</p>
          <p style={{ fontSize: 13, color: "var(--plum)", lineHeight: 1.6, margin: 0 }}>{book.description}</p>
        </div>
        <button onClick={() => setSaved(v => !v)} style={{ border: "none", background: "none", cursor: "pointer", padding: 2, flexShrink: 0 }}>
          {saved ? <BookmarkCheck style={{ width: 17, height: 17, color: "var(--rose-dust)" }} /> : <Bookmark style={{ width: 17, height: 17, color: "var(--mauve)" }} />}
        </button>
      </div>
      <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: "1px solid var(--border-subtle)" }}>
        <a href={book.read_url} target="_blank" rel="noopener noreferrer"
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "var(--plum)", color: "white", borderRadius: 12, padding: "10px", fontSize: 12, fontWeight: 700, textDecoration: "none", fontFamily: "'Inter', sans-serif" }}>
          <BookOpen style={{ width: 13, height: 13 }} /> Read full book
        </a>
        <a href={book.read_url} target="_blank" rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, border: "1.5px solid var(--border)", color: "var(--mauve)", borderRadius: 12, padding: "10px 14px", fontSize: 11, fontWeight: 600, textDecoration: "none", fontFamily: "'Inter', sans-serif", backgroundColor: "transparent" }}>
          Free <ExternalLink style={{ width: 10, height: 10 }} />
        </a>
      </div>
    </div>
  );
}

function BooksTab({ onRead }) {
  const [booksSubTab, setBooksSubTab] = useState("femwell");
  return (
    <div>
      {/* Sub-tab switcher */}
      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {[{ id: "femwell", label: "FemWell Stories" }, { id: "classics", label: "Classics" }].map(t => (
          <button key={t.id} onClick={() => setBooksSubTab(t.id)}
            style={{ padding: "7px 18px", borderRadius: 9999, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", fontFamily: "'Inter', sans-serif",
              background: booksSubTab === t.id ? "var(--plum)" : "var(--surface)",
              color: booksSubTab === t.id ? "#fff" : "var(--mauve)",
              border: booksSubTab === t.id ? "none" : "1px solid var(--border)" }}>
            {t.label}
          </button>
        ))}
      </div>

      {booksSubTab === "femwell" && <FictionFeedSection onRead={onRead} />}

      {booksSubTab === "classics" && (
        <>
          <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", borderRadius: 16, padding: "16px 18px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <BookMarked style={{ width: 15, height: 15, color: "var(--rose-dust)" }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--rose-dust)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Full Books</span>
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--plum)", margin: "0 0 4px", fontFamily: "'Playfair Display', serif" }}>Read in full, free</h2>
            <p style={{ fontSize: 13, color: "var(--mauve)", margin: 0 }}>Classic literature by and about women — available to read in full via Project Gutenberg.</p>
          </div>
          {FULL_BOOKS.map((book, i) => <FullBookCard key={i} book={book} />)}
        </>
      )}
    </div>
  );
}

const PHASE_CATEGORIES = {
  menstrual: ["Hormones", "Cycle", "Mental Wellness", "Body Image", "Self Care"],
  follicular: ["Fitness", "Nutrition", "Career & Money", "Energy"],
  ovulatory: ["Relationships", "Sex Education", "Confidence", "Beauty"],
  luteal: ["Mental Wellness", "Body Image", "Hormones", "PMS", "Self Care"],
};

const CATEGORY_COLORS = {
  "Hormones": { bg: "var(--rose-dust-subtle)", color: "var(--rose-dust)" },
  "Cycle": { bg: "var(--rose-dust-subtle)", color: "var(--rose-dust)" },
  "Mental Wellness": { bg: "var(--mauve-subtle)", color: "var(--mauve)" },
  "Body Image": { bg: "var(--mauve-subtle)", color: "var(--mauve)" },
  "Self Care": { bg: "var(--sage-subtle)", color: "var(--sage)" },
  "Fitness": { bg: "var(--sage-subtle)", color: "var(--sage)" },
  "Nutrition": { bg: "#FFF8E6", color: "#C4954A" },
  "Beauty": { bg: "var(--rose-dust-subtle)", color: "var(--rose-dust)" },
  "Relationships": { bg: "#FFF0F8", color: "#C472A0" },
  "Sex Education": { bg: "#FFF0F8", color: "#C472A0" },
  "Career & Money": { bg: "#FFF8E6", color: "#C4954A" },
  "PMS": { bg: "var(--rose-dust-subtle)", color: "var(--rose-dust)" },
};

function getCurrentPhase(profile) {
  if (!profile?.last_period_start_date) return null;
  const cycleLen = profile.cycle_avg_length || 28;
  const periodLen = profile.period_length || 5;
  const daysSince = Math.floor((Date.now() - new Date(profile.last_period_start_date).getTime()) / 86400000);
  const dayOfCycle = (daysSince % cycleLen) + 1;
  if (dayOfCycle <= periodLen) return "menstrual";
  if (dayOfCycle <= Math.round(cycleLen * 0.4)) return "follicular";
  if (dayOfCycle <= Math.round(cycleLen * 0.55)) return "ovulatory";
  return "luteal";
}

export default function Lifestyle() {
  const [readerItem, setReaderItem] = useState(null);
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
  const [userProfile, setUserProfile] = useState(null);
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
          const profile = profiles[0] || null;
          if (!userProfile && profile) setUserProfile(profile);
          const phase = getCurrentPhase(profile);
          const phaseCategories = phase ? PHASE_CATEGORIES[phase] : [];
          const forYouIds = profile?.for_you_item_ids;
          if (forYouIds?.length > 0) {
            const forYouSet = new Set(forYouIds.slice(0, 30));
            allItems = allItems.filter(it => forYouSet.has(it.id));
          } else {
            allItems = allItems.filter(it => it.status === "PUBLISHED").slice(0, 30);
          }
          // Sort: phase-matching items first
          if (phaseCategories.length > 0) {
            allItems.sort((a, b) => {
              const aMatch = phaseCategories.some(c => (a.category || "").includes(c) || (a.phase_tags || []).includes(c));
              const bMatch = phaseCategories.some(c => (b.category || "").includes(c) || (b.phase_tags || []).includes(c));
              if (aMatch && !bMatch) return -1;
              if (!aMatch && bMatch) return 1;
              return 0;
            });
          }
        } catch {
          allItems = allItems.filter(it => it.status === "PUBLISHED").slice(0, 10);
        }
      } else if (activeTab === "femwell") {
        allItems = allItems.filter(it => it.provider === "FEMWELL_AI" && it.status === "PUBLISHED");
      } else if (activeTab === "watch") {
        allItems = allItems.filter(it =>
          it.media_type === "VIDEO" || it.content_type === "VIDEO" || !!it.video_id ||
          it.provider === "YOUTUBE"
        ).filter(it => it.status === "PUBLISHED");
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
    <>
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
        {tab === "books" && <BooksTab onRead={setReaderItem} />}
        {tab === "femwell" && <SmartFemwellTab onRead={setReaderItem} />}
        {tab !== "books" && tab !== "femwell" && (
          <>
            {/* Weekly Book Pick */}
            {tab === "for_you" && <WeeklyBookPick profile={userProfile} />}

            {/* For Your Phase strip */}
            {tab === "for_you" && userProfile && !loading && items.length > 0 && (() => {
              const phase = getCurrentPhase(userProfile);
              const phaseCategories = phase ? PHASE_CATEGORIES[phase] : [];
              const phaseItems = items.filter(it => phaseCategories.some(c => (it.category || "").includes(c) || (it.phase_tags || []).includes(c))).slice(0, 4);
              if (phaseItems.length === 0) return null;
              return (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--rose-dust)", textTransform: "uppercase", letterSpacing: "0.12em" }}>For your {phase} phase</span>
                  </div>
                  <div className="lf-scroll" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
                    {phaseItems.map(item => {
                      const catStyle = CATEGORY_COLORS[item.category] || { bg: "var(--ivory-dark)", color: "var(--mauve)" };
                      return (
                        <div key={item.id} onClick={() => setReaderItem(item)} style={{ flexShrink: 0, width: 200, backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", cursor: "pointer" }}>
                          <div style={{ height: 100, background: item.image_url ? "none" : `linear-gradient(135deg, ${catStyle.bg}, var(--ivory))`, overflow: "hidden" }}>
                            {item.image_url && <img src={item.image_url} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { e.target.parentElement.style.background = `linear-gradient(135deg, ${catStyle.bg}, var(--ivory))`; e.target.style.display = "none"; }} />}
                          </div>
                          <div style={{ padding: 10 }}>
                            {item.category && <span style={{ fontSize: 10, fontWeight: 600, color: catStyle.color, backgroundColor: catStyle.bg, borderRadius: 9999, padding: "2px 8px", marginBottom: 4, display: "inline-block" }}>{item.category}</span>}
                            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--plum)", lineHeight: 1.35, margin: "4px 0 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.title}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </>
        )}
        {tab !== "books" && tab !== "femwell" && (
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


            {loading ? <FeedSkeleton /> : items.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 24px" }}>
                {tab === "for_you" ? (
                  <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 24, padding: "36px 20px", boxShadow: "var(--shadow-sm)" }}>
                    <div style={{ fontSize: 48, marginBottom: 14 }}>📖</div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "var(--plum)", marginBottom: 8 }}>Your personalised feed is warming up</h3>
                    <p style={{ fontSize: 14, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", lineHeight: 1.6, marginBottom: 20 }}>Articles, videos and stories matched to your cycle phase and interests</p>
                    <button onClick={() => setTab("articles")} style={{ backgroundColor: "var(--plum)", color: "white", borderRadius: 9999, padding: "12px 28px", fontSize: 14, fontWeight: 600, fontFamily: "'Inter', sans-serif", border: "none", cursor: "pointer" }}>
                      Browse all content
                    </button>
                  </div>
                ) : (
                  <p style={{ color: "var(--mauve)", fontSize: 14, margin: 0 }}>
                    {tab === "watch" ? "No videos yet — run the ingestYouTubeChannels function to populate." : tab === "stories" ? "Stories are being curated. Check back soon." : "No content yet. Refresh to check for new items."}
                  </p>
                )}
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
    {readerItem && <ArticleReader item={readerItem} onClose={() => setReaderItem(null)} onSelectItem={setReaderItem} />}
    </>
  );
}