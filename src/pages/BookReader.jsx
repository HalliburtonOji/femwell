import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { ArrowLeft, ExternalLink, Users, Bookmark, CalendarDays, RefreshCw } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { dailyReadClubKey } from "@/components/community/clubsConfig";
import { SEED_PICK } from "@/components/community/bookClubConfig";
import { base44 } from "@/api/base44Client";
import DailyStoryReader from "@/components/lifestyle/DailyStoryReader";
import ChapterEndCard from "@/components/community/ChapterEndCard";
import ChapterHeadsUp from "@/components/community/ChapterHeadsUp";
import CrisisSheetLite from "@/components/community/CrisisSheetLite";
import { recordProgress } from "@/components/community/readingActivity";
import { promptFor } from "@/components/community/chapterPrompts";
import { warningFor, hasSeenWarning } from "@/components/community/chapterWarnings";

// ─────────────────────────────────────────────────────────────────────────────
// BookReader — renders a Project Gutenberg book in the FemWell Kindle UI.
// Route: /BookReader?gutenberg_id=N
// Flow: call fetchGutenbergBook → strip boilerplate → split into REAL chapters →
// feed into DailyStoryReader via ReaderSource(kind='book').
//
// Chapter model (fix): a chapter-end reflection only fires at a TRUE chapter
// boundary. splitChapters reports whether it found real chapter headings; when
// it can't (and falls back to ~500-word pages), `real` is false and we NEVER
// fire the projective reflection — a page is not a chapter.
// ─────────────────────────────────────────────────────────────────────────────

// Detect chapter breaks. Gutenberg books are inconsistent — match the common
// heading forms: a whole "CHAPTER …" line (number, Roman, OR spelled-out, e.g.
// "CHAPTER ONE — Playing Pilgrims"), "Chapter 1" mixed-case, standalone Roman
// numerals, and standalone spelled-out number words. Fall back to a paginated
// single body only when none match (≥2 needed to count as a real structure).
const NUMBER_WORD = "(ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|ELEVEN|TWELVE|THIRTEEN|FOURTEEN|FIFTEEN|SIXTEEN|SEVENTEEN|EIGHTEEN|NINETEEN|TWENTY|THIRTY|FORTY|FIFTY)([- ](ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE))?";
const CHAPTER_RES = [
  /^\s*CHAPTER\b[^\n]*$/im,                            // any "CHAPTER …" heading line (num/roman/spelled)
  /^\s*Chapter\s+[IVXLCDM\d]+[\.:;\s]/im,              // "Chapter 1" / "Chapter IV" mixed-case
  new RegExp(`^\\s*${NUMBER_WORD}\\.?\\s*$`, "im"),    // standalone spelled-out number word line
  /^\s*[IVXLCDM]{1,7}\.\s*$/im,                        // standalone Roman numeral line ("XII.")
];

function splitChapters(text) {
  if (!text) return { chapters: [], real: false };

  // Find the most common pattern by trying each regex globally.
  for (const re of CHAPTER_RES) {
    const globalRe = new RegExp(re.source, "img");
    const matches = [];
    let m;
    while ((m = globalRe.exec(text)) !== null) {
      matches.push({ index: m.index, label: m[0].trim() });
      if (matches.length > 120) break; // sanity cap
    }
    if (matches.length >= 2) {
      // Collapse a table of contents: most PG books list every "CHAPTER …" heading in a
      // contents block AND again at the real chapter. Keep the LAST occurrence of each heading
      // label (the body follows the listing) so 47 chapters don't read as 94. Harmless when
      // labels are unique (no TOC) — every match is kept.
      const seen = new Map();
      for (const mt of matches) seen.set(mt.label.toUpperCase().replace(/[^A-Z0-9]/g, ""), mt);
      const uniq = [...seen.values()].sort((a, b) => a.index - b.index);
      const build = (list) => list.map((mt, i) => {
        const start = mt.index;
        const end = i + 1 < list.length ? list[i + 1].index : text.length;
        const label = mt.label.replace(/[\.:;]+$/, "").trim();
        // Strip the leading heading line so it isn't duplicated when the reader renders it.
        const body = text.slice(start, end).trim().replace(re, "").trim();
        return { label, body };
      });
      // Safety net: drop residual tiny slices (a real chapter has substantial body), so any
      // leftover contents/stray matches can't become empty "chapters".
      const built = build(uniq);
      const big = built.filter((c) => c.body.length >= 600);
      const finalList = big.length >= 2 ? big : built;
      if (finalList.length >= 2) {
        const chunks = finalList.map((c, i) => ({
          id: `ch-${i + 1}`,
          day_number: i + 1,
          heading: /^chapter\b/i.test(c.label) ? c.label : `Chapter ${i + 1}`,
          body: c.body,
        }));
        return { chapters: chunks, real: true };
      }
    }
  }

  // Fallback: no real chapter structure found. Chunk into ~500-word pages so the
  // reader stays usable — but mark real=false so NO chapter-end reflection fires
  // (a page is not a chapter).
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
  return { chapters: chunks, real: false };
}

function todayISO() { try { return new Date().toISOString().slice(0, 10); } catch { return ""; } }
function daysSince(iso) {
  try {
    const s = new Date(iso + "T00:00:00");
    const n = new Date(); n.setHours(0, 0, 0, 0);
    return Math.max(0, Math.round((n - s) / 86400000));
  } catch { return 0; }
}

const CATCHUP_RAPID_MS = 25000;   // two chapter-reaches closer than this = a catch-up binge

// fetchGutenbergBook cold-starts slowly and can 502/timeout on the first hit. Retry transient
// failures a couple of times with a short backoff so a cold start self-heals.
const FETCH_BACKOFF_MS = [700, 1400, 2200];   // → 4 attempts total
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function errStatus(err) {
  const m = String(err?.message || "");
  return Number(err?.response?.status ?? err?.status ?? (m.match(/status code (\d{3})/) || [])[1] ?? 0);
}
// Worth a retry: 5xx, 429, network/timeout, or an opaque error (cold start). A genuine 4xx
// (other than 429) is a real client error — don't hammer it.
function isTransient(err) {
  const s = errStatus(err);
  if (s >= 400 && s < 500 && s !== 429) return false;
  return true;
}

export default function BookReader() {
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [chaptersReal, setChaptersReal] = useState(false);   // true only when real chapter headings were found
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState("Loading the book…");
  const [error, setError] = useState("");
  const [retryTick, setRetryTick] = useState(0);   // bump → re-run the fetch (manual retry)
  const [me, setMe] = useState(null);
  // Phase-1 Books — the chapter-end card (projective prompt + guess + cohort) and a crisis sheet.
  const [cardChapter, setCardChapter] = useState(null);   // 0-based index, or null = closed
  const [crisisOpen, setCrisisOpen] = useState(false);
  // Phase-2 Books — a calm, non-blocking content heads-up shown BEFORE a heavy chapter.
  const [headsUpChapter, setHeadsUpChapter] = useState(null);   // 0-based index, or null = none
  // catch-up — when the reader is bingeing past chapters, we hold reflections.
  const [catchingUp, setCatchingUp] = useState(false);
  // two marks — live current chapter + bookmarks, reported up from the reader.
  const [liveCurrent, setLiveCurrent] = useState(0);
  const [liveBookmarks, setLiveBookmarks] = useState([]);
  const [jump, setJump] = useState(null);   // { index, nonce } → reader jumps
  const jumpNonceRef = useRef(0);

  const gutenbergId = useMemo(() => {
    const p = new URLSearchParams(window.location.search).get("gutenberg_id");
    const n = Number(p);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, []);

  // bookId for reading-activity + prompts is the Gutenberg id as a string. A read is "in the
  // club" when it's the active Book Club pick — its discussion lives in the Book Club, not a
  // generic readers' corner.
  const bookId = gutenbergId != null ? String(gutenbergId) : null;
  const inClub = bookId != null && String(SEED_PICK.gutenberg_id) === bookId;

  // The book's OWN community thread: the Book Club for the club pick, else this book's
  // readers' corner (a per-book club keyed by the Gutenberg id). Never the generic page.
  const communityHref = useMemo(() => {
    if (inClub) return createPageUrl("Community?view=bookclub");
    if (gutenbergId == null) return null;
    return createPageUrl(`Community?club=${dailyReadClubKey(gutenbergId)}&title=${encodeURIComponent(book?.title || "")}`);
  }, [inClub, gutenbergId, book?.title]);

  // smart (schedule) mark — the daily read advances ~1 chapter/day from the day she first
  // opened this book (device-local; no backend). "Where the daily read expects you today."
  const startKey = bookId ? `fw_dailyread_start_${bookId}` : null;
  const expectedChapter = useMemo(() => {
    if (!startKey || !chapters.length) return 0;
    let start;
    try {
      start = localStorage.getItem(startKey);
      if (!start) { start = todayISO(); localStorage.setItem(startKey, start); }
    } catch { start = todayISO(); }
    return Math.min(chapters.length - 1, daysSince(start));
  }, [startKey, chapters.length]);

  // physical bookmark — the place she set by hand (most recent bookmark).
  const physicalMark = useMemo(() => {
    if (!liveBookmarks.length) return null;
    return liveBookmarks.reduce((a, b) => ((b.ts || 0) > (a.ts || 0) ? b : a));
  }, [liveBookmarks]);

  useEffect(() => {
    let cancelled = false;
    base44.auth.me().then((u) => { if (!cancelled) setMe(u || null); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // refs read inside the (stable) chapter-reached callback
  const firstReachRef = useRef(true);
  const shownCardRef = useRef(new Set());
  const shownHeadsUpRef = useRef(new Set());
  const lastReachTsRef = useRef(0);
  const chaptersRealRef = useRef(false);
  const expectedRef = useRef(0);
  useEffect(() => { chaptersRealRef.current = chaptersReal; }, [chaptersReal]);
  useEffect(() => { expectedRef.current = expectedChapter; }, [expectedChapter]);

  // Chapter-boundary hook from the reader. Always records progress (garden + cohort). Opens the
  // chapter-end reflection ONLY when: chapters are real, a prompt exists, it's not the open-the-
  // book mount, once per chapter per session — AND she is NOT catching up (a rapid binge or a
  // chapter behind today's daily-read schedule defers the prompt; it returns when she's current).
  const onChapterReached = useCallback((chapterIndex) => {
    if (bookId == null || typeof chapterIndex !== "number") return;
    recordProgress(bookId, chapterIndex, me?.id);   // always: garden + cohort signal

    // Phase-2 content heads-up — shown the moment a WARNED chapter is REACHED (before its heavy
    // content). Non-blocking; once per chapter per session + once-per-device.
    if (warningFor(bookId, chapterIndex)
        && !shownHeadsUpRef.current.has(chapterIndex)
        && !hasSeenWarning(bookId, chapterIndex)) {
      shownHeadsUpRef.current.add(chapterIndex);
      setHeadsUpChapter(chapterIndex);
    }

    const now = Date.now();
    const sincePrev = now - (lastReachTsRef.current || 0);
    lastReachTsRef.current = now;

    if (firstReachRef.current) { firstReachRef.current = false; return; }   // skip open-the-book mount
    if (!chaptersRealRef.current) return;                                   // page-fallback: a page is not a chapter
    if (!promptFor(bookId, chapterIndex)) return;                           // only where a prompt exists
    if (shownCardRef.current.has(chapterIndex)) return;                     // once per chapter per session

    // Catch-up: a rapid succession of reaches OR landing on a chapter behind today's schedule
    // means she's catching up — hold the reflection (never a wall of prompts mid-binge).
    const rapid = sincePrev < CATCHUP_RAPID_MS;
    const behindSchedule = chapterIndex < expectedRef.current;
    if (rapid || behindSchedule) { setCatchingUp(true); return; }

    setCatchingUp(false);
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
    setLoading(true);
    setError("");
    setLoadingMsg("Loading the book…");
    (async () => {
      const attempts = FETCH_BACKOFF_MS.length + 1;   // 4
      for (let attempt = 0; attempt < attempts; attempt++) {
        try {
          const res = await base44.functions.invoke("fetchGutenbergBook", { gutenberg_id: gutenbergId });
          if (cancelled) return;
          const data = res?.data || res || {};
          if (data.error) { setError(data.error); setLoading(false); return; }   // structured error — real, no retry
          const { chapters: ch, real } = splitChapters(data.text || "");
          const sourceUrl = data.source_url || `https://www.gutenberg.org/ebooks/${gutenbergId}`;
          const attribution = `From Project Gutenberg · ${sourceUrl}`;
          const withAttr = ch.map((c) => ({ ...c, attribution, series_title: data.title || "Public-domain book", cliffhanger: "" }));
          setBook({ title: data.title || "", author: data.author || "", source_url: sourceUrl });
          setChapters(withAttr);
          setChaptersReal(real);
          setLoading(false);
          return;   // success
        } catch (err) {
          if (cancelled) return;
          const lastTry = attempt === attempts - 1;
          if (lastTry || !isTransient(err)) {
            setError(err?.message || "Failed to load the book.");
            setLoading(false);
            return;
          }
          // transient (cold-start 502 / timeout / network) — calm escalating note, then back off + retry
          setLoadingMsg(attempt === 0
            ? "The library's waking up — fetching the book…"
            : "Still fetching — almost there…");
          await sleep(FETCH_BACKOFF_MS[attempt]);
          if (cancelled) return;
        }
      }
    })();
    return () => { cancelled = true; };
  }, [gutenbergId, retryTick]);

  const onMarks = useCallback(({ currentIndex, bookmarks }) => {
    if (typeof currentIndex === "number") setLiveCurrent(currentIndex);
    if (Array.isArray(bookmarks)) setLiveBookmarks(bookmarks);
  }, []);
  const jumpTo = useCallback((index) => {
    jumpNonceRef.current += 1;
    setJump({ index, nonce: jumpNonceRef.current });
  }, []);

  if (loading) {
    return (
      <Frame onBack={() => navigate(-1)}>
        <div style={emptyStyle}>
          <p style={{ marginBottom: 10 }}>{loadingMsg}</p>
        </div>
      </Frame>
    );
  }
  if (error) {
    return (
      <Frame onBack={() => navigate(-1)}>
        <div style={emptyStyle}>
          <p style={{ fontWeight: 600, marginBottom: 10 }}>We couldn't open this book just now.</p>
          <p style={{ marginBottom: 16 }}>Sometimes the library's slow to wake. Give it another moment.</p>
          <button
            type="button"
            onClick={() => { setError(""); setLoading(true); setLoadingMsg("Loading the book…"); setRetryTick((t) => t + 1); }}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--plum, #0B0805)", color: "var(--surface, #F4EFE3)", border: "none", borderRadius: 12, padding: "11px 18px", fontFamily: 'ui-sans-serif,system-ui,sans-serif', fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            <RefreshCw className="w-4 h-4" /> Tap to try again
          </button>
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
      onBack={() => navigate(-1)}
      title={book?.title}
      author={book?.author}
      sourceUrl={book?.source_url}
      cornerHref={communityHref}
      cornerLabel={inClub
        ? "Discuss this book in the Book Club"
        : "Others reading this — join the readers' corner (spoiler-safe)"}
    >
      {/* Two marks — your physical bookmark + the smart (daily-read schedule) mark. */}
      {chaptersReal && (
        <MarksBar
          current={liveCurrent}
          expected={expectedChapter}
          physical={physicalMark}
          total={chapters.length}
          onJump={jumpTo}
        />
      )}

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
        goToChapter={jump}
        onMarks={onMarks}
      />

      {/* Catch-up note — reflections are held until she's current (no wall of prompts). */}
      {catchingUp && chaptersReal && (
        <div style={catchupNote} role="status">
          You're catching up — I'll hold the chapter reflections until you're current. No rush.
        </div>
      )}

      {headsUpChapter !== null && bookId != null && (
        <ChapterHeadsUp
          bookId={bookId}
          chapterIndex={headsUpChapter}
          onContinue={() => setHeadsUpChapter(null)}
          onDefer={() => setHeadsUpChapter(null)}
        />
      )}
      {cardChapter !== null && bookId != null && (
        <ChapterEndCard
          bookId={bookId}
          chapterIndex={cardChapter}
          userId={me?.id}
          inClub={inClub}
          communityHref={communityHref}
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
const catchupNote = {
  maxWidth: 880,
  margin: "16px auto 0",
  padding: "12px 16px",
  borderRadius: 12,
  border: "1px solid var(--border, #D8CFBC)",
  background: "var(--surface, #F4EFE3)",
  fontFamily: '"Cormorant Garamond","Fraunces",Georgia,serif',
  fontStyle: "italic",
  fontSize: 16,
  lineHeight: 1.5,
  color: "var(--plum, #0B0805)",
};

// ── Two marks bar — physical bookmark + smart (daily-read schedule) mark ───────
function MarksBar({ current, expected, physical, total, onJump }) {
  const UI = 'ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif';
  const GOLD = "#A8893F", PLUM = "#0B0805", MUTED = "#2E261B", SAGE = "#8FAF8F";
  const bmIndex = physical ? physical.chapterIndex : null;
  const behind = current < expected;
  const status = behind
    ? `${expected - current} ${expected - current === 1 ? "chapter" : "chapters"} behind today's daily read — no rush.`
    : current > expected
      ? "You're ahead of the daily read — lovely."
      : "You're right on today's daily read.";
  const row = { display: "flex", alignItems: "center", gap: 9, padding: "8px 0" };
  const label = { flex: 1, fontFamily: UI, fontSize: 13, fontWeight: 600, color: MUTED, lineHeight: 1.4 };
  const jumpBtn = {
    fontFamily: UI, fontSize: 12, fontWeight: 700, color: "#fff", background: GOLD,
    border: "none", borderRadius: 999, padding: "5px 12px", cursor: "pointer", flexShrink: 0,
  };
  return (
    <div style={{
      maxWidth: 880, margin: "0 auto 18px", padding: "12px 16px", borderRadius: 14,
      border: "1px solid var(--border, #D8CFBC)", background: "var(--surface, #F4EFE3)",
    }}>
      <p style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: GOLD, margin: "0 0 4px" }}>Your two marks</p>
      <div style={{ ...row, borderBottom: "1px solid rgba(43,30,22,0.12)" }}>
        <CalendarDays size={16} style={{ color: SAGE, flexShrink: 0 }} />
        <span style={label}>
          <span style={{ color: PLUM, fontWeight: 700 }}>Today's daily read · Chapter {expected + 1}</span>
          <span style={{ display: "block", fontWeight: 500 }}>{status}</span>
        </span>
        {current !== expected && (
          <button type="button" style={jumpBtn} onClick={() => onJump(expected)}>Go to chapter {expected + 1}</button>
        )}
      </div>
      <div style={row}>
        <Bookmark size={16} style={{ color: "#BC2E27", flexShrink: 0 }} fill={bmIndex != null ? "#BC2E27" : "none"} />
        <span style={label}>
          {bmIndex != null
            ? <span style={{ color: PLUM, fontWeight: 700 }}>Your bookmark · Chapter {bmIndex + 1}</span>
            : <span>No bookmark yet — tap the ribbon in the reader to mark your place.</span>}
        </span>
        {bmIndex != null && current !== bmIndex && (
          <button type="button" style={jumpBtn} onClick={() => onJump(bmIndex)}>Go to your mark</button>
        )}
      </div>
    </div>
  );
}

function Frame({ children, onBack, title, author, sourceUrl, cornerHref, cornerLabel }) {
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
            {cornerLabel || "Others reading this — join the readers' corner (spoiler-safe)"}
          </Link>
        )}
      </div>
      <div className="max-w-2xl mx-auto px-4">
        {children}
      </div>
    </div>
  );
}
