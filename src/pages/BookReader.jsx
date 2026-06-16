import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { ArrowLeft, ExternalLink, Users } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { dailyReadClubKey } from "@/components/community/clubsConfig";
import { SEED_PICK } from "@/components/community/bookClubConfig";
import { base44 } from "@/api/base44Client";
import DailyStoryReader from "@/components/lifestyle/DailyStoryReader";
import ChapterEndCard from "@/components/community/ChapterEndCard";
import CrisisSheetLite from "@/components/community/CrisisSheetLite";
import { recordProgress } from "@/components/community/readingActivity";
import { promptFor } from "@/components/community/chapterPrompts";

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
  const [me, setMe] = useState(null);
  // Phase-1 Books — the chapter-end card (projective prompt + guess + cohort) and a crisis sheet.
  const [cardChapter, setCardChapter] = useState(null);   // 0-based index, or null = closed
  const [crisisOpen, setCrisisOpen] = useState(false);

  const gutenbergId = useMemo(() => {
    const p = new URLSearchParams(window.location.search).get("gutenberg_id");
    const n = Number(p);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, []);

  // bookId for reading-activity + prompts is the Gutenberg id as a string (matches BookReader's
  // existing per-book persistence). A read is "in the club" when it's the active Book Club pick.
  const bookId = gutenbergId != null ? String(gutenbergId) : null;
  const inClub = bookId != null && String(SEED_PICK.gutenberg_id) === bookId;

  useEffect(() => {
    let cancelled = false;
    base44.auth.me().then((u) => { if (!cancelled) setMe(u || null); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // The reader fires onChapterReached on its FIRST mount too (chapter 0). We don't want a modal
  // the instant a book opens, so the first reached chapter only records progress; the card opens
  // from the second boundary onward. Also one card per chapter per session (no nag on back-flips).
  const firstReachRef = useRef(true);
  const shownCardRef = useRef(new Set());

  // Chapter-boundary hook from the reader. Date-stamp the read locally (nourishes the garden)
  // + emit an anonymous progress row (fire-and-forget, inside recordProgress), then open the
  // calm chapter-end card. Never awaits — a slow backend can't block the page flip.
  const onChapterReached = useCallback((chapterIndex) => {
    if (bookId == null || typeof chapterIndex !== "number") return;
    recordProgress(bookId, chapterIndex, me?.id);   // always: garden + cohort signal
    if (firstReachRef.current) { firstReachRef.current = false; return; } // skip the open-the-book mount
    if (shownCardRef.current.has(chapterIndex)) return;                   // once per chapter per session
    if (!promptFor(bookId, chapterIndex)) return;                        // only where a prompt exists
    shownCardRef.current.add(chapterIndex);
    setCardChapter(chapterIndex);
  }, [bookId, me?.id]);

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
      cornerHref={gutenbergId ? createPageUrl(`Community?club=${dailyReadClubKey(gutenbergId)}&title=${encodeURIComponent(book?.title || "")}`) : null}
    >
      <DailyStoryReader
        source={{
          kind: "book",
          items: chapters,
          currentIndex: 0,
        }}
        seriesKey="gutenberg_book"
        totalCount={chapters.length}
        bookId={bookId}
        onChapterReached={onChapterReached}
      />
      {cardChapter !== null && bookId != null && (
        <ChapterEndCard
          bookId={bookId}
          chapterIndex={cardChapter}
          userId={me?.id}
          inClub={inClub}
          onClose={() => setCardChapter(null)}
          onCrisis={() => { setCardChapter(null); setCrisisOpen(true); }}
        />
      )}
      {crisisOpen && <CrisisSheetLite onClose={() => setCrisisOpen(false)} />}
    </Frame>
  );
}

const emptyStyle = {
  padding: "60px 24px",
  textAlign: "center",
  fontSize: 14,
  color: "var(--plum-mute, #6b4a56)",
};

function Frame({ children, onBack, title, author, sourceUrl, cornerHref }) {
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
        {cornerHref && (
          <Link
            to={cornerHref}
            style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--plum)", textDecoration: "none", marginBottom: 20, padding: "9px 13px", borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)" }}
          >
            <Users className="w-3.5 h-3.5" style={{ color: "var(--rose-dust)" }} />
            Others reading this — join the readers' corner (spoiler-safe)
          </Link>
        )}
      </div>
      <div className="max-w-2xl mx-auto px-4">
        {children}
      </div>
    </div>
  );
}