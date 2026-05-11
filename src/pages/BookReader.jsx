import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import DailyStoryReader from "@/components/lifestyle/DailyStoryReader";

// ─────────────────────────────────────────────────────────────────────────────
// BookReader — renders a Project Gutenberg book in the FemWell Kindle UI.
// Route:  /BookReader?gutenberg_id=N
// Flow:   call fetchGutenbergBook → strip boilerplate → split into chapters →
//         feed into DailyStoryReader via ReaderSource(kind='book').
// ─────────────────────────────────────────────────────────────────────────────

// Detect chapter breaks. Gutenberg books are inconsistent — match the most
// common patterns: "CHAPTER X.", "Chapter X", standalone Roman numerals on
// their own line ("I.", "II."). Fall back to a single-chapter book if none.
const CHAPTER_RES = [
  /^\s*CHAPTER\s+[IVXLCDM\d]+[\.\:\s]/im,
  /^\s*Chapter\s+[IVXLCDM\d]+[\.\:\s]/im,
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
        const label = matches[i].label.replace(/[\.\s:]+$/, "").trim();
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
      id: `page-${i / pageSize + 1}`,
      day_number: i / pageSize + 1,
      heading: `Page ${i / pageSize + 1}`,
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
        const sourceUrl = data.source_url ||
          `https://www.gutenberg.org/ebooks/${gutenbergId}`;
        const attribution =
          `From Project Gutenberg · ${sourceUrl}`;
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
    return () => { cancelled = true; };
  }, [gutenbergId]);

  if (loading) {
    return (
      <Frame onBack={() => navigate(-1)}>
        <div style={emptyStyle}>Loading the book…</div>
      </Frame>
    );
  }
  if (error) {
    return (
      <Frame onBack={() => navigate(-1)}>
        <div style={emptyStyle}>
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: "var(--plum-deep)", margin: 0 }}>
            We couldn’t open this book.
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "var(--plum-mute)", marginTop: 8 }}>
            {error}
          </p>
        </div>
      </Frame>
    );
  }
  if (!chapters.length) {
    return (
      <Frame onBack={() => navigate(-1)}>
        <div style={emptyStyle}>This book has no readable text.</div>
      </Frame>
    );
  }

  return (
    <Frame
      onBack={() => navigate(createPageUrl("Lifestyle?tab=browse"))}
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
        totalCount={chapters.length}
      />
    </Frame>
  );
}

const emptyStyle = {
  padding: "60px 24px",
  textAlign: "center",
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  color: "var(--plum-mute, #6b4a56)",
};

function Frame({ children, onBack, title, author, sourceUrl }) {
  return (
    <div style={{ minHeight: "100vh", paddingBottom: 80, background: "var(--ivory, #FAF4EA)" }}>
      <div style={{
        position: "sticky", top: 0, zIndex: 30,
        background: "rgba(250,248,245,0.97)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            style={{
              width: 36, height: 36, borderRadius: 9999,
              border: "1px solid var(--border)",
              background: "var(--cream)",
              color: "var(--plum-deep)",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            {title && (
              <p style={{ font: "500 16px/1.2 'Fraunces', serif", color: "var(--plum-deep)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {title}
              </p>
            )}
            {author && (
              <p style={{ font: "400 12px/1.2 'Inter', sans-serif", color: "var(--plum-mute)", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {author} · Public domain
              </p>
            )}
          </div>
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View on Project Gutenberg"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                font: "500 12px/1 'Inter', sans-serif",
                color: "var(--plum-mute)",
                textDecoration: "none",
                padding: "8px 12px", borderRadius: 9999,
                border: "1px solid var(--border)",
                background: "var(--cream)",
              }}
            >
              Source
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "20px" }}>
        {children}
      </div>
    </div>
  );
}
