import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import DailyStoryReader from "@/components/lifestyle/DailyStoryReader";

// ─────────────────────────────────────────────────────────────────────────────
// BookReader — renders a Project Gutenberg book in the FemWell Kindle UI.
// Route: /BookReader?gutendex_id=N
// Flow: call fetchGutenbergBook → strip boilerplate → split into chapters →
// feed into DailyStoryReader via ReaderSource(kind='book').
// ─────────────────────────────────────────────────────────────────────────────

// Detect chapter breaks. Gutenberg books are inconsistent — match the most
// common patterns: "CHAPTER X.", "Chapter X", standalone Roman numerals on
// their own line ("I.", "II."). Fall back to a single-chapter book if none.
const CHAPTER_RES = [
  /^\s*CHAPTER\s+[IVXLCDM\d]+[\.:;\s]/im,
  /^\s*Chapter\s+[IVXLCDM\d]+[\.:;\s]/im,
  /^\s*[IVXLCDM]+\.\s*$/im, // standalone Roman numeral
];

function splitChapters(text) {
  if (!text) return [];

  // Find the most common pattern by trying each regex globally.
  for (const re of CHAPTER_RES) {
    const globalRe = new RegExp(re.source, "img");
    const matches = [];
    let m;
    while ((m = globalRe.exec(text)) !== null) {
      matches.push({ index: m.index, label: m[0].trim() });
      if (matches.length > 80) break; // sanity cap
    }
    if (matches.length >= 2) {
      const chunks = [];
      for (let i = 0; i < matches.length; i++) {
        const start = matches[i].index;
        const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
        const label = matches[i].label.replace(/[\.:;]+$/, "").trim();
        const body = text.slice(start, end).trim();
        // Strip the leading "Chapter X" line from body so the heading isn't
        // duplicated when DailyStoryReader renders.
        const bodyNoLabel = body.replace(re, "").trim();
        chunks.push({
          id: `ch-${i + 1}`,
          day_number: i + 1,
          heading: label,
          body: bodyNoLabel,
        });
      }
      return chunks;
    }
  }

  // Fallback: treat the whole text as one long "chapter". Chunk into ~500-word
  // pages so the reader stays usable.
  const words = text.split(/\s+/);
  const pageSize = 500;
  const chunks = [];
  for (let i = 0; i < words.length; i += pageSize) {
    chunks.push({
      id: `page-${Math.floor(i / pageSize) + 1}`,
      day_number: Math.floor(i / pageSize) + 1,
      heading: `Page ${Math.floor(i / pageSize) + 1}`,
      body: words.slice(i, i + pageSize).join(" "),
    });
  }
  return chunks;
}

export default function BookReader() {
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const gutenbergId = useMemo(() => {
    const p = new URLSearchParams(window.location.search).get("gutenberg_id");
    const n = Number(p);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, []);

  useEffect(() => {
    if (!gutenbergId) {
      setError("Missing gutenberg_id");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await base44.functions.invoke("fetchGutenbergBook", {
          gutenberg_id: gutenbergId,
        });
        if (cancelled) return;
        // Some base44 SDKs wrap the response — accept both shapes.
        const data = res?.data || res || {};
        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }
        const ch = splitChapters(data.text || "");
        // Attach attribution to each chapter so it prints at the bottom of
        // every page.
        const sourceUrl = data.source_url || `https://www.gutenberg.org/ebooks/${gutenbergId}`;
        const attribution = `From Project Gutenberg · ${sourceUrl}`;
        const withAttr = ch.map((c) => ({
          ...c,
          attribution,
          series_title: data.title || "Public-domain book",
          cliffhanger: "",
        }));
        setBook({
          title: data.title || "",
          author: data.author || "",
          source_url: sourceUrl,
        });
        setChapters(withAttr);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(err?.message || "Failed to load the book.");
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [gutenbergId]);

  if (loading) {
    return (
      <Frame onBack={() => navigate(-1)}>
        <div style={emptyStyle}>
          <p style={{ marginBottom: 10 }}>Loading the book…</p>
        </div>
      </Frame>
    );
  }
  if (error) {
    return (
      <Frame onBack={() => navigate(-1)}>
        <div style={emptyStyle}>
          <p style={{ fontWeight: 600, marginBottom: 10 }}>We couldn't open this book.</p>
          <p>{error}</p>
        </div>
      </Frame>
    );
  }
  if (!chapters.length) {
    return (
      <Frame onBack={() => navigate(-1)}>
        <div style={emptyStyle}>
          <p>This book has no readable text.</p>
        </div>
      </Frame>
    );
  }

  return (
    <Frame
      // navigate(-1) preserves the back stack — returning to wherever the user
      // came from (typically Browse → Books) instead of a fresh forward push
      // that loses scroll position and filter state.
      onBack={() => navigate(-1)}
      title={book?.title}
      author={book?.author}
      sourceUrl={book?.source_url}
    >
      <DailyStoryReader
        source={{
          kind: "book",
          items: chapters,
          currentIndex: 0,
        }}
        seriesKey="gutenberg_book"
        totalCount={chapters.length}
      />
    </Frame>
  );
}

const emptyStyle = {
  padding: "60px 24px",
  textAlign: "center",
  fontSize: 14,
  color: "var(--plum-mute, #6b4a56)",
};

function Frame({ children, onBack, title, author, sourceUrl }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--ivory)" }}>
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-8">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm mb-6"
          style={{ backgroundColor: "rgba(255,255,255,0.85)" }}
        >
          <ArrowLeft className="w-4 h-4" style={{ color: "var(--plum)" }} />
        </button>
        <h1 className="fw-display" style={{ margin: "0 0 10px 0" }}>Library</h1>
        {title && (
          <h2 className="fw-heading" style={{ color: "var(--plum-deep)", margin: "0 0 8px 0" }}>
            {title}
          </h2>
        )}
        {author && (
          <p style={{ fontSize: 14, color: "var(--plum-mute)", marginBottom: 20 }}>
            {author} · Public domain
          </p>
        )}
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--rose-primary)", textDecoration: "none", marginBottom: 20 }}
          >
            <ExternalLink className="w-3 h-3" />
            Read at gutenberg.org
          </a>
        )}
      </div>
      <div className="max-w-2xl mx-auto px-4">
        {children}
      </div>
    </div>
  );
}