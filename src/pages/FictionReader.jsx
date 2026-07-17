import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import DailyStoryReader, { TEXT_SIZES } from "@/components/lifestyle/DailyStoryReader";
import { buildBookChapters } from "@/components/lifestyle/bookChapters";
import { getBookCover } from "@/utils/bookCover";

// ─────────────────────────────────────────────────────────────────────────────
// FictionReader — Kindle-style reader for FemWell-generated fiction
// (LifestyleItems where provider === FEMWELL_FICTION_*).
//
// These records hold one chapter's worth of text in `lede`. We paginate that
// text into ~450-word "pages" so the user gets a real Kindle-style flip
// experience instead of a single endless article. A cover page is prepended.
// Route: /FictionReader?id=<LifestyleItems.id>
// ─────────────────────────────────────────────────────────────────────────────

// Words-per-page is the lever that keeps chapters from overflowing the
// visible page after a font-size change. Larger text → fewer words can fit
// in one screen, so we re-paginate with a smaller cap. The numbers below
// were tuned against a 880-px stage on a 13" laptop and a 390-pt iPhone;
// in both cases each "page" comfortably fits without scroll.
//
// IMPORTANT: New chapter ALWAYS starts on a fresh page because each chapter
// is paginated independently in the chapters_json loop below.
const WORDS_PER_PAGE_BY_SIZE = {
  xs: 1000,
  s:   850,
  m:   700, // default
  l:   500,
  xl:  380,
};
function wordsPerPageFor(size) {
  return WORDS_PER_PAGE_BY_SIZE[size] || WORDS_PER_PAGE_BY_SIZE.m;
}

// Split a body of text into ~N-word pages, but break only at paragraph
// boundaries so we never split a sentence across pages.
function paginate(text, targetWords) {
  if (!targetWords) targetWords = WORDS_PER_PAGE_BY_SIZE.m;
  if (!text) return [];
  // Normalize line endings, drop a leading "Chapter 1" / "Chapter N" line if
  // present (we'll attach the title separately so the heading isn't repeated).
  const normalized = String(text).replace(/\r\n?/g, "\n").trim();
  const stripped = normalized.replace(
    /^\s*(?:#{1,3}\s+)?Chapter\s+[0-9IVXLC\d]+[^\n]*\n+/i,
    "",
  );

  const paragraphs = stripped.split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return [];

  const pages = [];
  let buffer = [];
  let wordCount = 0;

  for (const p of paragraphs) {
    const pWords = p.split(/\s+/).length;
    // If a single paragraph is bigger than the budget AND the buffer is empty,
    // it gets its own page rather than being split awkwardly.
    if (pWords >= targetWords * 1.4 && buffer.length === 0) {
      pages.push(p);
      continue;
    }
    if (wordCount + pWords > targetWords && buffer.length > 0) {
      pages.push(buffer.join("\n\n"));
      buffer = [p];
      wordCount = pWords;
    } else {
      buffer.push(p);
      wordCount += pWords;
    }
  }
  if (buffer.length > 0) pages.push(buffer.join("\n\n"));
  return pages;
}

// Convert paginated text into the ChapterLike shape DailyStoryReader expects.
function pagesToChapters(pages, item) {
  if (!pages || pages.length === 0) return [];
  const title = item?.title || "";
  return pages.map((body, i) => ({
    id: `${item?.id || "fiction"}-page-${i + 1}`,
    day_number: i + 1,
    title: i === 0 ? title : "",
    heading: i === 0 ? title : "",
    body,
    // Empty cliffhanger so locked screen text (if reached) doesn't say "next
    // page hasn't been written yet" — DailyStoryReader handles a falsy
    // cliffhanger gracefully because we cap totalCount.
    cliffhanger: "",
    series_title: title,
  }));
}

export default function FictionReader() {
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReader, setShowReader] = useState(false);

  // textSize is owned HERE so we can re-paginate chapters whenever the user
  // changes size. The DailyStoryReader receives it as a controlled prop.
  const [textSize, setTextSize] = useState(() => {
    try {
      const stored = localStorage.getItem("fw_reader_text_size") || "m";
      return TEXT_SIZES.includes(stored) ? stored : "m";
    } catch { return "m"; }
  });
  const handleTextSizeChange = useCallback((next) => {
    if (TEXT_SIZES.includes(next)) setTextSize(next);
  }, []);

  const itemId = useMemo(() => {
    return new URLSearchParams(window.location.search).get("id") || null;
  }, []);

  useEffect(() => {
    if (!itemId) {
      setError("Missing story id.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const records = await base44.entities.LifestyleItems.filter({ id: itemId }, undefined, 1);
        const rec = Array.isArray(records) ? records[0] : null;
        if (cancelled) return;
        if (!rec) {
          setError("Story not found.");
          setLoading(false);
          return;
        }
        setItem(rec);
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || "Couldn't load this story.");
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [itemId]);

  // Reader v3: ONE entry per chapter; the reader measures + paginates each body to the
  // viewport. Shared with the in-place Lifestyle reader via buildBookChapters (one source).
  const chapters = useMemo(() => buildBookChapters(item), [item]);

  if (loading) {
    return (
      <Frame onBack={() => navigate(-1)}>
        <p style={emptyStyle}>Loading the story…</p>
      </Frame>
    );
  }
  if (error) {
    return (
      <Frame onBack={() => navigate(-1)}>
        <h2 style={errorTitleStyle}>We couldn't open this story.</h2>
        <p style={emptyStyle}>{error}</p>
      </Frame>
    );
  }
  if (!chapters.length) {
    return (
      <Frame onBack={() => navigate(-1)}>
        <h2 style={errorTitleStyle}>This story has no readable text yet.</h2>
        <p style={emptyStyle}>It may still be being written. Check back soon.</p>
      </Frame>
    );
  }

  // Cover page first, then the paginated pages.
  if (!showReader) {
    const chapterCount = Array.isArray(item.chapters_json) && item.chapters_json.length > 0
      ? item.chapters_json.length
      : 1;
    return (
      <Frame onBack={() => navigate(-1)}>
        <CoverPage
          item={item}
          pageCount={chapters.length}
          chapterCount={chapterCount}
          onOpen={() => setShowReader(true)}
        />
      </Frame>
    );
  }

  // Reader v4: when the book is open, the reader IS the page. No Frame
  // wrapper — Frame's chrome (header, padding) would push the page taller
  // than the viewport and re-introduce scroll. The reader's own ← button
  // calls onExit to return to the cover.
  return (
    <DailyStoryReader
      source={{ kind: "book", items: chapters, currentIndex: 0 }}
      totalCount={chapters.length}
      textSize={textSize}
      onTextSizeChange={handleTextSizeChange}
      defaultImmersive
      onExit={() => setShowReader(false)}
      bookId={item?.id}
    />
  );
}

// ─── Cover page ──────────────────────────────────────────────────────────────
function CoverPage({ item, pageCount, chapterCount, onOpen }) {
  const { gradient, accent, initial } = getBookCover(item.title);
  const subtitle = item.summary || item.why_it_matters || "";
  const tags = Array.isArray(item.tags) ? item.tags.slice(0, 3) : [];
  const cta = chapterCount > 1
    ? `Open book · ${chapterCount} chapters`
    : `Open story · ${pageCount} page${pageCount === 1 ? "" : "s"}`;
  return (
    <div style={coverShellStyle}>
      <div style={{ ...coverArtStyle, background: gradient }}>
        <span style={{ ...coverInitialStyle, color: accent }}>{initial}</span>
        <div style={coverTextStyle}>
          <p style={coverEyebrowStyle}>FemWell Fiction</p>
          <h2 className="fw-heading" style={coverTitleStyle}>{item.title}</h2>
          {subtitle && (
            <p style={coverSubtitleStyle}>{subtitle}</p>
          )}
          <p style={coverByStyle}>By FemWell Fiction</p>
        </div>
      </div>
      {tags.length > 0 && (
        <div style={tagsRowStyle}>
          {tags.map((t) => (
            <span key={t} style={tagPillStyle}>{t}</span>
          ))}
        </div>
      )}
      <button type="button" onClick={onOpen} style={openButtonStyle}>
        {cta}
      </button>
    </div>
  );
}

// ─── Frame ───────────────────────────────────────────────────────────────────
function Frame({ children, onBack }) {
  return (
    <div style={{ minHeight: "100vh", paddingBottom: 80, background: "#ECE7DA" }}>
      <div style={frameHeaderStyle}>
        <div style={frameHeaderInnerStyle}>
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            style={backButtonStyle}
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="fw-display" style={{ fontSize: 32, margin: 0 }}>Library</h1>
        </div>
      </div>
      <div style={frameBodyStyle}>{children}</div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const emptyStyle = {
  padding: "40px 24px",
  textAlign: "center",
  fontSize: 14,
  color: "#2E261B",
};
const errorTitleStyle = {
  fontWeight: 400,
  fontSize: 22,
  color: "#7A1A12",
  margin: "40px 0 6px",
  textAlign: "center",
};

const frameHeaderStyle = {
  position: "sticky", top: 0, zIndex: 30,
  background: "rgba(250,248,245,0.97)",
  backdropFilter: "blur(20px)",
  borderBottom: "1px solid #D8CFBC",
};
const frameHeaderInnerStyle = {
  maxWidth: 760, margin: "0 auto",
  padding: "16px 20px",
  display: "flex", alignItems: "center", gap: 12,
};
const backButtonStyle = {
  width: 36, height: 36, borderRadius: 9999,
  border: "1px solid #D8CFBC",
  background: "#ECE7DA",
  color: "#7A1A12",
  cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
};
const frameBodyStyle = { maxWidth: 760, margin: "0 auto", padding: "20px" };

const coverShellStyle = {
  display: "flex", flexDirection: "column", alignItems: "stretch", gap: 18,
  maxWidth: 460, margin: "0 auto",
};
const coverArtStyle = {
  position: "relative",
  aspectRatio: "3/4",
  borderRadius: 22,
  overflow: "hidden",
  boxShadow:
    "0 2px 4px rgba(43,30,22,0.08), 0 12px 28px rgba(43,30,22,0.16), 0 28px 64px rgba(43,30,22,0.10)",
};
const coverInitialStyle = {
  position: "absolute",
  top: "20%", left: "50%",
  transform: "translate(-50%, -50%)",
  fontWeight: 300,
  fontSize: "clamp(160px, 38vw, 240px)",
  lineHeight: 1,
  letterSpacing: "-0.05em",
  userSelect: "none",
};
const coverTextStyle = {
  position: "absolute", left: 24, right: 24, bottom: 28,
  textAlign: "center",
  color: "rgba(255,250,242,0.96)",
};
const coverEyebrowStyle = {
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "rgba(255,250,242,0.78)",
  margin: "0 0 10px",
};
const coverTitleStyle = {
  lineHeight: 1.1,
  margin: "0 0 10px",
  textShadow: "0 1px 3px rgba(0,0,0,0.20)",
};
const coverSubtitleStyle = {
  fontStyle: "italic",
  fontWeight: 400,
  fontSize: 14,
  lineHeight: 1.4,
  margin: "0 0 12px",
  color: "rgba(255,250,242,0.86)",
  textShadow: "0 1px 2px rgba(0,0,0,0.20)",
};
const coverByStyle = {
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: "0.06em",
  color: "rgba(255,250,242,0.74)",
  margin: 0,
};
const tagsRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  justifyContent: "center",
};
const tagPillStyle = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.04em",
  color: "#2E261B",
  background: "rgba(58,44,26,0.05)",
  padding: "5px 11px",
  borderRadius: 9999,
  border: "1px solid var(--ink-line, rgba(43,30,22,0.08))",
};
const openButtonStyle = {
  fontWeight: 600,
  fontSize: 14,
  letterSpacing: "0.02em",
  color: "#ECE7DA",
  background: "#BC2E27",
  border: "none",
  borderRadius: 9999,
  padding: "14px 22px",
  cursor: "pointer",
  alignSelf: "center",
  minHeight: 44,
  boxShadow: "0 2px 8px rgba(212,94,82,0.30)",
};