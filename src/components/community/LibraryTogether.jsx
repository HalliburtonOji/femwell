// LibraryTogether — Community FEATURE #3 (the "Library / Book Club" surface, under Together).
//
// Robust, calm-on-the-surface reading community. REUSES the existing infra (nothing
// duplicated): the curated Book Club pick (BookClubPick / SEED_PICK) + spoiler-safe
// checkpoints (BookClubView, opened via onNav) · per-book DISCUSSION = the moderated
// readers'-corner (CommunityPost scoped by dailyread-<id>, opened via onOpenCorner —
// full publish-then-screen moderation + report/block + botanical aliases) · anonymous
// "reading along" COHORT + progress via ReadingActivity (createCommunityPost dispatcher,
// k-floored, fire-and-forget) · the in-app BookReader for public-domain reads.
//
// NEW here: a personal SHELF (add a book · currently reading / want to read / finished).
// v1 is DEVICE-LOCAL (localStorage, private, no backend) — same pattern as "I'm going" /
// clubReached. A persistent cross-device shelf needs a new Bookshelf entity (or a
// SavedItems "BOOK" type) → FLAGGED for sign-off, NOT built here.
//
// Safety = calm on the surface: discussion rides the moderated CommunityPost path
// (report/block in the "…" menu, background screening); every text input is crisis-checked.

import { useEffect, useRef, useState, useCallback } from "react";
import {
  ChevronLeft, BookOpen, Plus, MessageCircle, X, BookMarked, Heart, Search, Loader, Users, ShieldCheck, EyeOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { T, SERIF, UI, Eyebrow, Script, Hand, PAPER_BG, useEditorialFonts } from "@/components/journal/Editorial";
import { CornerSprig, FlowerGlyph, cwOf } from "@/components/brand/flora";
import { SEED_PICK, clubReached } from "@/components/community/bookClubConfig";
import { dailyReadClubKey } from "@/components/community/clubsConfig";
import { cohortReachedCount, recordProgress } from "@/components/community/readingActivity";
import { loadShelf, addBook, setStatus as setShelfStatusRemote, removeBook } from "@/components/community/bookshelf";
import { communityHash, botanicalAlias } from "@/components/community/communityAnon";
import { MOOD_SHELVES, readProgress, setReadProgress, progressLabel, joinBuddyRead, buddiesFor, parseBuddyNote } from "@/components/community/libraryExtras";
import { useScrollLock } from "@/utils/useScrollLock";

const HANDFAM = '"Cormorant Garamond","Fraunces",Georgia,serif';
// Warm states — "Set aside" instead of "DNF" (research: DNF-shame is why women defect from Goodreads).
const STATUSES = [
  { key: "reading", label: "Reading now" },
  { key: "want", label: "Want to read" },
  { key: "finished", label: "Finished" },
  { key: "set_aside", label: "Set aside" },
];

// Shelf persistence lives in bookshelf.js (UserBook sync + device-local fallback). A local slug
// is kept only for deriving a readers'-corner key / cover id for a title.
const slug = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

// A warm, on-brand book "cover" — no external image (CSP-safe): colourway by title + a flora glyph.
const COVER_CW = ["crimson", "sage", "plum", "gold", "blush"];
function coverCw(title) { const s = String(title || ""); let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return COVER_CW[h % COVER_CW.length]; }
function BookCover({ title, size = 58 }) {
  const cw = cwOf(coverCw(title)); const flower = ["camellia", "rose", "iris", "cosmos", "peony"][(title || "").length % 5];
  return (
    <div style={{ width: size, height: size * 1.4, borderRadius: "3px 6px 6px 3px", background: `linear-gradient(150deg, ${cw.petal} 0%, ${cw.tip} 100%)`, position: "relative", overflow: "hidden", flexShrink: 0, boxShadow: "0 2px 8px rgba(58,44,26,0.22)", borderLeft: `3px solid ${cw.accent || "rgba(0,0,0,0.2)"}` }}>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", opacity: 0.9 }}><FlowerGlyph variant={flower} size={size * 0.5} color="#F4EFE3" color2={cw.tip} idx={`cv-${slug(title)}`} /></div>
    </div>
  );
}

// A small curated starter set (whole-life, not clinical) for quick-add + discovery.
const STARTERS = [
  { title: "Little Women", author: "Louisa May Alcott", gutenberg_id: "514", tag: "the season's read" },
  { title: "Pride and Prejudice", author: "Jane Austen", gutenberg_id: "1342", tag: "comfort classic" },
  { title: "Jane Eyre", author: "Charlotte Brontë", gutenberg_id: "1260", tag: "a woman's own voice" },
  { title: "The Awakening", author: "Kate Chopin", gutenberg_id: "160", tag: "freedom & self" },
  { title: "Persuasion", author: "Jane Austen", gutenberg_id: "105", tag: "second chances" },
  { title: "The Yellow Wallpaper", author: "Charlotte Perkins Gilman", gutenberg_id: "1952", tag: "short & fierce" },
];

function AddBookSheet({ onClose, onAdded }) {
  useScrollLock(true);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState("reading");
  // Open Library search (no key/creds; CORS-friendly per research). Guarded: any failure
  // (incl. a CSP block on this host) degrades silently to the manual fields below.
  const [q, setQ] = useState("");
  const [results, setResults] = useState(null);   // null=idle · []=none · [...]=hits
  const [searching, setSearching] = useState(false);
  const timer = useRef(null);
  const doSearch = (query) => {
    setQ(query);
    if (timer.current) clearTimeout(timer.current);
    if (!query.trim() || query.trim().length < 3) { setResults(null); setSearching(false); return; }
    setSearching(true);
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query.trim())}&limit=6&fields=title,author_name`);
        const d = await r.json();
        const hits = (d?.docs || []).filter((x) => x?.title).map((x) => ({ title: x.title, author: (x.author_name || [])[0] || "" }));
        setResults(hits);
      } catch { setResults(null); }   // fail-open → manual
      finally { setSearching(false); }
    }, 450);
  };
  const add = () => { const t = title.trim(); if (!t) return; onAdded({ title: t, author: author.trim(), status }); onClose(); };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(36,26,38,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Add a book" style={{ width: "100%", maxWidth: 460, background: T.paper, borderRadius: "14px 14px 0 0", padding: "20px 18px 28px", paddingBottom: "var(--fw-sheet-safe)", maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <Eyebrow color={T.gold}>Add a book</Eyebrow>
          <button onClick={onClose} aria-label="Close" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted }}><X size={18} /></button>
        </div>
        <Script size={26} style={{ marginBottom: 10 }}>What are you reading?</Script>
        {/* search */}
        <div style={{ position: "relative", marginBottom: 9 }}>
          <Search size={15} color={T.muted} style={{ position: "absolute", left: 12, top: 13 }} />
          <input value={q} onChange={(e) => doSearch(e.target.value)} placeholder="Search by title or author…" style={{ width: "100%", boxSizing: "border-box", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 13px 11px 34px", fontFamily: SERIF, fontSize: 16, color: T.ink, outline: "none" }} />
          {searching && <Loader size={15} color={T.gold} style={{ position: "absolute", right: 12, top: 13, animation: "spin 1s linear infinite" }} />}
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
        {Array.isArray(results) && results.length > 0 && (
          <div style={{ border: `1px solid ${T.paperDeep}`, borderRadius: 11, overflow: "hidden", marginBottom: 12 }}>
            {results.map((b, i) => (
              <button key={i} onClick={() => { onAdded({ title: b.title, author: b.author, status: "reading" }); onClose(); }} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", background: T.paperHi, border: "none", borderTop: i ? `1px solid ${T.paperDeep}` : "none", padding: "9px 11px", cursor: "pointer" }}>
                <BookCover title={b.title} size={26} />
                <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, lineHeight: 1.15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.title}</span>{b.author && <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>{b.author}</span>}</span>
                <Plus size={15} color={T.gold} />
              </button>
            ))}
          </div>
        )}
        {Array.isArray(results) && results.length === 0 && !searching && <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, marginBottom: 12 }}>No matches — add it by hand below.</div>}
        <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: T.muted, margin: "2px 0 8px" }}>Or add it by hand</div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" style={{ width: "100%", boxSizing: "border-box", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 13px", fontFamily: SERIF, fontSize: 16, color: T.ink, marginBottom: 9, outline: "none" }} />
        <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author (optional)" style={{ width: "100%", boxSizing: "border-box", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 13px", fontFamily: SERIF, fontSize: 16, color: T.ink, marginBottom: 12, outline: "none" }} />
        <div style={{ display: "flex", gap: 7, marginBottom: 14 }}>
          {STATUSES.map((s) => (
            <button key={s.key} onClick={() => setStatus(s.key)} style={{ flex: 1, borderRadius: 999, padding: "8px 6px", border: `1px solid ${status === s.key ? cwOf("gold").petal : T.paperDeep}`, background: status === s.key ? `${cwOf("gold").petal}1C` : T.paperHi, color: status === s.key ? cwOf("gold").petal : T.muted, fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{s.label}</button>
          ))}
        </div>
        <button onClick={add} disabled={!title.trim()} style={{ width: "100%", background: title.trim() ? T.ink : T.paperDeep, color: T.paperHi, border: "none", borderRadius: 12, padding: "13px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: title.trim() ? "pointer" : "default", marginBottom: 12 }}>Add to my shelf</button>
        <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: T.muted, marginBottom: 8 }}>Or add a loved one</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {STARTERS.slice(0, 5).map((b) => (
            <button key={b.title} onClick={() => { onAdded({ ...b, status: "want" }); onClose(); }} style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "8px 10px", cursor: "pointer" }}>
              <BookCover title={b.title} size={30} />
              <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, lineHeight: 1.15 }}>{b.title}</span><span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>{b.author} · {b.tag}</span></span>
              <Plus size={15} color={T.gold} />
            </button>
          ))}
        </div>
        <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, lineHeight: 1.5, marginTop: 12 }}>Your shelf is private and kept on your phone. (A synced, searchable library is on the way.)</div>
      </div>
    </div>
  );
}

function ShelfBook({ book, onStatus, onTalk, onRead, onRemove, onBuddy }) {
  const pct = book.status === "reading" ? readProgress(book.key) : 0;
  return (
    <div style={{ display: "flex", gap: 12, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "12px 13px", marginBottom: 10 }}>
      <BookCover title={book.title} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: SERIF, fontSize: 16.5, fontWeight: 600, color: T.ink, lineHeight: 1.2 }}>{book.title}</div>
        {book.author && <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, marginBottom: 7 }}>{book.author}</div>}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
          {STATUSES.map((s) => (
            <button key={s.key} onClick={() => onStatus(book.key, s.key)} style={{ borderRadius: 999, padding: "4px 10px", border: `1px solid ${book.status === s.key ? cwOf("sage").petal : T.paperDeep}`, background: book.status === s.key ? `${cwOf("sage").petal}1C` : "transparent", color: book.status === s.key ? cwOf("sage").petal : T.muted, fontFamily: UI, fontSize: 10.5, fontWeight: 700, cursor: "pointer" }}>{s.label}</button>
          ))}
        </div>
        {/* currently-reading progress chip (device-local) */}
        {book.status === "reading" && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 11, fontWeight: 700, color: cwOf("sage").petal, background: `${cwOf("sage").petal}14`, borderRadius: 999, padding: "3px 10px", marginBottom: 8 }}>
            <BookOpen size={11} /> {progressLabel(pct)}{pct > 0 && pct < 100 ? ` · ${pct}%` : ""}
          </div>
        )}
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={() => onBuddy(book)} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", border: "none", cursor: "pointer", color: cwOf("sage").petal, fontFamily: UI, fontSize: 12, fontWeight: 700 }}><Users size={13} /> Buddy read</button>
          <button onClick={() => onTalk(book)} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", border: "none", cursor: "pointer", color: T.crimson, fontFamily: UI, fontSize: 12, fontWeight: 700 }}><MessageCircle size={13} /> Talk</button>
          {book.gutenberg_id && <button onClick={() => onRead(book)} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", border: "none", cursor: "pointer", color: T.gold, fontFamily: UI, fontSize: 12, fontWeight: 700 }}><BookOpen size={13} /> Read</button>}
          <button onClick={() => onRemove(book.key)} aria-label="Remove" style={{ marginLeft: "auto", background: "transparent", border: "none", cursor: "pointer", color: T.muted, fontFamily: UI, fontSize: 11 }}>Remove</button>
        </div>
      </div>
    </div>
  );
}

// stable book_key across shelf + discovery (matches bookshelf.js: g:<id> · s:<slug>)
const bookKeyOf = (b) => b.key || (b.gutenberg_id ? `g:${b.gutenberg_id}` : `s:${slug(b.title)}`);

// ── BUDDY READS (substance #4) — pair, async + spoiler-safe, on the BuddyRead entity. Shows the
// k-anon "who's reading this too", lets you join the pool + leave a short (crisis-checked) note tagged
// with your progress; notes from readers further ahead are veiled until you reach them (spoiler-safe).
// Deeper talk routes to the fully-moderated readers' corner. ──
function BuddyReadSheet({ book, user, myHash, onClose, onTalk }) {
  useScrollLock();
  const bk = bookKeyOf(book);
  const [buddies, setBuddies] = useState(null);
  const [joined, setJoined] = useState(false);
  const [note, setNote] = useState("");
  const [pct, setPct] = useState(() => readProgress(bk));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [reveal, setReveal] = useState({});   // note id -> revealed despite spoiler gate

  const load = useCallback(async () => { setBuddies(await buddiesFor(bk)); }, [bk]);
  useEffect(() => { load(); }, [load]);

  const activeN = Array.isArray(buddies)
    ? new Set(buddies.filter((b) => Date.now() - new Date(b.created_date || b.created_at || 0).getTime() <= 30 * 864e5).map((b) => b.author_hash)).size
    : 0;

  const join = async () => {
    if (busy) return;
    setBusy(true); setErr("");
    setReadProgress(bk, pct);
    const r = await joinBuddyRead(user, bk, book.title, { hash: myHash, name: myHash ? botanicalAlias(myHash) : "A reader" }, note, pct);
    setBusy(false);
    if (r?.intercept) { onClose?.(); return; }
    if (r?.error) { setErr("Couldn't join just now — try again in a moment."); return; }
    setJoined(true); setNote(""); load();
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(20,14,8,0.42)" }} />
      <div role="dialog" aria-label="Reading buddies" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 61, background: T.paperHi, borderTop: `1px solid ${T.paperDeep}`, borderRadius: "18px 18px 0 0", boxShadow: "0 -8px 30px rgba(58,44,26,0.22)", padding: "18px 18px calc(20px + env(safe-area-inset-bottom))", maxWidth: 460, margin: "0 auto", maxHeight: "84vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 10 }}>
          <BookCover title={book.title} size={44} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontWeight: 700, fontSize: 18, color: T.ink, lineHeight: 1.15 }}>{book.title}</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted, marginTop: 2 }}>
              <Users size={12} color={cwOf("sage").petal} /> {activeN <= 0 ? "Be the first buddy here" : activeN < 4 ? "a few women are reading this too" : "several women are reading this too"}
            </div>
          </div>
        </div>

        {/* my progress — spoiler-safe checkpoint (device-local) */}
        <div style={{ background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "11px 13px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
            <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.ink }}>Where you are</span>
            <span style={{ fontFamily: UI, fontSize: 11.5, color: cwOf("sage").petal, fontWeight: 700 }}>{progressLabel(pct)}{pct > 0 && pct < 100 ? ` · ${pct}%` : ""}</span>
          </div>
          <input type="range" min={0} max={100} step={5} value={pct} onChange={(e) => { const v = Number(e.target.value); setPct(v); setReadProgress(bk, v); }} style={{ width: "100%", accentColor: cwOf("sage").petal }} />
          <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, marginTop: 4 }}>Just for you, on this phone — it keeps others' notes spoiler-safe.</div>
        </div>

        {/* buddy notes — veiled if from someone further in than you (spoiler-safe) */}
        {buddies === null && <Hand size={14} color={T.muted}>Finding your buddies…</Hand>}
        {buddies && buddies.filter((b) => (b.note || "").trim()).length === 0 && (
          <Hand size={14} color={T.muted}>No buddy notes yet. Leave the first — a line about where you are or what you're feeling.</Hand>
        )}
        {buddies && buddies.filter((b) => (b.note || "").trim()).map((b) => {
          const { pct: notePct, text } = parseBuddyNote(b.note);
          const spoiler = notePct > pct + 5 && !reveal[b.id];
          return (
            <div key={b.id} style={{ background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "10px 12px", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.muted }}>{b.author_hash === myHash ? "You" : (b.alias || "A reader")}</span>
                {notePct > 0 && <span style={{ fontFamily: UI, fontSize: 10, color: T.muted, marginLeft: "auto" }}>{progressLabel(notePct)}</span>}
              </div>
              {spoiler ? (
                <button onClick={() => setReveal((r) => ({ ...r, [b.id]: true }))} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", background: `${cwOf("plum").petal}10`, border: `1px dashed ${T.paperDeep}`, borderRadius: 9, padding: "9px 11px", cursor: "pointer" }}>
                  <EyeOff size={14} color={cwOf("plum").petal} style={{ flexShrink: 0 }} />
                  <span style={{ fontFamily: UI, fontSize: 12, color: T.inkSoft }}>A reader further in left a note — may contain spoilers. Tap to read.</span>
                </button>
              ) : (
                <Hand size={15} color={T.inkSoft}>{text}</Hand>
              )}
            </div>
          );
        })}

        {/* join / leave a note */}
        {!joined ? (
          <>
            <textarea value={note} onChange={(e) => { setNote(e.target.value); if (err) setErr(""); }} maxLength={240} placeholder="Optional — a line about where you are, no spoilers past your point…" style={{ width: "100%", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "10px 12px", fontFamily: SERIF, fontSize: 16, minHeight: 60, resize: "none", boxSizing: "border-box", marginTop: 6 }} />
            {err && <div style={{ fontFamily: UI, fontSize: 12, color: T.crimson, marginTop: 6 }}>{err}</div>}
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: `${cwOf("sage").petal}12`, border: `1px solid ${T.paperDeep}`, borderRadius: 9, padding: "8px 10px", margin: "10px 0" }}>
              <ShieldCheck size={14} color={cwOf("sage").petal} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontFamily: UI, fontSize: 11.5, color: T.inkSoft, lineHeight: 1.4 }}>You're anonymous here too. Your note is tagged with your progress so no one's spoiled. Deeper chat lives in the moderated readers' corner.</span>
            </div>
            <button disabled={busy} onClick={join} style={{ width: "100%", background: cwOf("sage").petal, color: "#fff", border: "none", borderRadius: 12, padding: "13px", fontFamily: UI, fontSize: 14, fontWeight: 800, cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1 }}>{busy ? "Joining…" : "I'm reading this too"}</button>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "6px 0 2px" }}>
            <div style={{ fontFamily: UI, fontSize: 14, fontWeight: 800, color: cwOf("sage").petal, marginBottom: 8 }}>You're a buddy on this book</div>
            <Hand size={14} color={T.muted}>Come back to see notes from the others reading along.</Hand>
          </div>
        )}
        <button onClick={() => { onClose?.(); onTalk?.(book); }} style={{ width: "100%", marginTop: 10, background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "12px", fontFamily: UI, fontSize: 13.5, fontWeight: 700, color: T.ink, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 }}><MessageCircle size={14} /> Open the readers' corner</button>
        <button onClick={onClose} style={{ width: "100%", marginTop: 8, background: "transparent", border: "none", fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.muted, cursor: "pointer", padding: 6 }}>Close</button>
      </div>
    </>
  );
}

export default function LibraryTogether({ user, onBack, onNav, onOpenCorner }) {
  useEditorialFonts();
  const navigate = useNavigate();
  const [shelf, setShelf] = useState([]);            // {key,title,author,gutenberg_id,status,cover_hint,_row}
  const [addOpen, setAddOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [cohort, setCohort] = useState(undefined);   // season's-read cohort (k-floored)
  const [myHash, setMyHash] = useState(null);
  const [buddyBook, setBuddyBook] = useState(null);  // book whose buddy-read sheet is open
  const [mood, setMood] = useState(MOOD_SHELVES[0].key);
  const pick = SEED_PICK;   // the live BookClubPick would upgrade this; seed is always present
  const uid = user?.id;
  useEffect(() => { let a = true; communityHash(uid).then((h) => { if (a) setMyHash(h); }).catch(() => {}); return () => { a = false; }; }, [uid]);

  // load the shelf: UserBook (synced) + local fallback + migrate local-only up (bookshelf.js)
  useEffect(() => { let alive = true; loadShelf(uid).then((items) => { if (alive) setShelf(items); }).catch(() => {}); return () => { alive = false; }; }, [uid]);
  useEffect(() => {
    let alive = true;
    const at = Math.max(0, clubReached(pick.pick_key));
    cohortReachedCount(String(pick.gutenberg_id), at).then((n) => { if (alive) setCohort(typeof n === "number" ? n : null); }).catch(() => { if (alive) setCohort(null); });
    return () => { alive = false; };
  }, [pick.pick_key, pick.gutenberg_id]);

  const talk = useCallback((book) => {
    const id = book.gutenberg_id || slug(book.title);
    onOpenCorner?.(dailyReadClubKey(id), book.title);   // the moderated readers' corner
  }, [onOpenCorner]);
  const read = useCallback((book) => { if (book.gutenberg_id) navigate(createPageUrl(`BookReader?gutenberg_id=${book.gutenberg_id}`)); }, [navigate]);
  const onAdded = (book) => { setFilter("all"); addBook(uid, book).then(setShelf).catch(() => {}); };   // never let a new book hide behind a filter
  const onStatus = (key, s) => { setShelfStatusRemote(uid, key, s).then(setShelf).catch(() => {}); };
  const onRemove = (key) => { removeBook(uid, key).then(setShelf).catch(() => {}); };
  const readingPick = () => { recordProgress(pick.gutenberg_id, Math.max(0, clubReached(pick.pick_key)), uid); onAdded({ title: pick.title, author: pick.author, gutenberg_id: pick.gutenberg_id, status: "reading", source: "pick" }); };

  const shown = filter === "all" ? shelf : shelf.filter((b) => b.status === filter);

  return (
    <div style={{ minHeight: "100vh", ...PAPER_BG }}>
      <div style={{ maxWidth: 460, margin: "0 auto", padding: "24px 18px 60px" }}>
        {onBack && <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "7px 11px", fontFamily: UI, fontSize: 12.5, fontWeight: 600, color: T.ink, cursor: "pointer", marginBottom: 14 }}><ChevronLeft size={14} /> Together</button>}
        <Eyebrow color={T.gold} mb={6}>Together · The Library</Eyebrow>
        <Script size={38} style={{ marginBottom: 4 }}>Read together</Script>
        <Hand size={17} color={T.muted} style={{ marginBottom: 18 }}>Keep a shelf, talk about a book with the women reading it too, or join the season's read — spoiler-safe, no rush, no streak.</Hand>

        {/* THIS SEASON'S READ — the curated Book Club pick (real read-along) */}
        <div style={{ position: "relative", overflow: "hidden", background: `linear-gradient(160deg, ${T.paperHi} 0%, ${cwOf("crimson").petal}12 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${cwOf("crimson").petal}`, borderRadius: 18, padding: "16px 16px", marginBottom: 18 }}>
          <CornerSprig variant="sprig" color={cwOf("crimson").petal} corner="tr" size={50} opacity={0.4} />
          <Eyebrow color={T.gold} mb={8}>This season, together</Eyebrow>
          <div style={{ display: "flex", gap: 13 }}>
            <BookCover title={pick.title} size={66} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontWeight: 700, fontSize: 20, color: T.ink, lineHeight: 1.2 }}>{pick.title}</div>
              <div style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, marginBottom: 6 }}>{pick.author} · {pick.cadence}</div>
              <Hand size={14} color={T.inkSoft} style={{ marginBottom: 2 }}>
                {cohort === undefined ? "Finding who's reading along…" : typeof cohort === "number" ? `${cohort} of us are reading along.` : "A quiet few are reading along — no rush, the thread waits."}
              </Hand>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            <button onClick={() => onNav?.("bookclub")} style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, padding: "10px 15px", border: "none", background: T.ink, color: T.paperHi, fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer" }}><BookMarked size={14} /> The book club</button>
            <button onClick={readingPick} style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, padding: "10px 15px", border: `1px solid ${cwOf("sage").petal}`, background: `${cwOf("sage").petal}1C`, color: cwOf("sage").petal, fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer" }}><Heart size={14} /> I'm reading this too</button>
            <button onClick={() => talk(pick)} style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, padding: "10px 15px", border: `1px solid ${T.paperDeep}`, background: T.paperHi, color: T.ink, fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer" }}><MessageCircle size={14} /> Readers' corner</button>
            <button onClick={() => setBuddyBook({ title: pick.title, author: pick.author, gutenberg_id: pick.gutenberg_id })} style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, padding: "10px 15px", border: `1px solid ${cwOf("sage").petal}`, background: T.paperHi, color: cwOf("sage").petal, fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer" }}><Users size={14} /> Find a buddy</button>
          </div>
        </div>

        {/* MY SHELF */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <Eyebrow color={T.gold}>My shelf</Eyebrow>
          <button onClick={() => setAddOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: T.ink, color: T.paperHi, border: "none", borderRadius: 999, padding: "7px 13px", fontFamily: UI, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}><Plus size={14} /> Add a book</button>
        </div>
        {shelf.length > 0 && (
          <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
            {[["all", "All"], ...STATUSES.map((s) => [s.key, s.label])].map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} style={{ borderRadius: 999, padding: "6px 12px", border: `1px solid ${filter === k ? cwOf("gold").petal : T.paperDeep}`, background: filter === k ? `${cwOf("gold").petal}1C` : "transparent", color: filter === k ? cwOf("gold").petal : T.muted, fontFamily: UI, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>{l}</button>
            ))}
          </div>
        )}
        {shelf.length === 0 ? (
          <div style={{ background: T.paperHi, border: `1px dashed ${T.paperDeep}`, borderRadius: 16, padding: "24px 18px", textAlign: "center", marginBottom: 20 }}>
            <BookOpen size={26} color={T.gold} style={{ marginBottom: 10 }} />
            <Hand size={17} color={T.ink}>Your shelf is empty — for now.</Hand>
            <Hand size={14.5} color={T.muted}>Add what you're reading, and find the others reading it too.</Hand>
          </div>
        ) : (
          <div style={{ marginBottom: 20 }}>
            {shown.map((b) => <ShelfBook key={b.key} book={b} onStatus={onStatus} onTalk={talk} onRead={read} onRemove={onRemove} onBuddy={setBuddyBook} />)}
            {shown.length === 0 && <Hand size={15} color={T.muted}>Nothing under that shelf yet.</Hand>}
          </div>
        )}

        {/* MOOD / THEME DISCOVERY — read for how you want to feel (whole-life; midlife sits beside romance) */}
        <Eyebrow color={T.gold} mb={9}>What are you in the mood for?</Eyebrow>
        <div className="fw-lib-disc" style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 6, marginBottom: 10 }}>
          {MOOD_SHELVES.map((m) => (
            <button key={m.key} onClick={() => setMood(m.key)} style={{ flexShrink: 0, borderRadius: 999, padding: "7px 14px", border: `1px solid ${mood === m.key ? cwOf("gold").petal : T.paperDeep}`, background: mood === m.key ? `${cwOf("gold").petal}1C` : "transparent", color: mood === m.key ? cwOf("gold").petal : T.muted, fontFamily: UI, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>{m.label}</button>
          ))}
        </div>
        {(() => {
          const active = MOOD_SHELVES.find((m) => m.key === mood) || MOOD_SHELVES[0];
          return (
            <>
              <Hand size={14} color={T.muted} style={{ marginBottom: 10 }}>{active.sub}.</Hand>
              <div className="fw-lib-disc" style={{ display: "flex", gap: 11, overflowX: "auto", paddingBottom: 8, marginBottom: 18 }}>
                {active.books.map((b) => (
                  <div key={b.title} style={{ flex: "0 0 138px", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "12px 11px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    <BookCover title={b.title} size={54} />
                    <div style={{ fontFamily: SERIF, fontSize: 13.5, fontWeight: 600, color: T.ink, lineHeight: 1.15, margin: "9px 0 1px" }}>{b.title}</div>
                    <div style={{ fontFamily: UI, fontSize: 10, color: T.muted, marginBottom: 8 }}>{b.tag}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
                      <button onClick={() => onAdded({ ...b, status: "want" })} aria-label="Add to shelf" style={{ width: 30, height: 30, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paper, color: T.gold, cursor: "pointer", display: "grid", placeItems: "center" }}><Plus size={15} /></button>
                      <button onClick={() => setBuddyBook(b)} aria-label="Find a buddy" style={{ width: 30, height: 30, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paper, color: cwOf("sage").petal, cursor: "pointer", display: "grid", placeItems: "center" }}><Users size={14} /></button>
                      <button onClick={() => talk(b)} aria-label="Talk about it" style={{ width: 30, height: 30, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paper, color: T.crimson, cursor: "pointer", display: "grid", placeItems: "center" }}><MessageCircle size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          );
        })()}

        {/* DISCOVER — whole-life starters (quick-add + talk) */}
        <Eyebrow color={T.gold} mb={10}>Free to read in-app, right now</Eyebrow>
        <div className="fw-lib-disc" style={{ display: "flex", gap: 11, overflowX: "auto", paddingBottom: 8, marginBottom: 6 }}>
          <style>{`.fw-lib-disc{scrollbar-width:none}.fw-lib-disc::-webkit-scrollbar{display:none}`}</style>
          {STARTERS.map((b) => (
            <div key={b.title} style={{ flex: "0 0 130px", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "12px 11px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <BookCover title={b.title} size={56} />
              <div style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, color: T.ink, lineHeight: 1.15, margin: "9px 0 1px" }}>{b.title}</div>
              <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, marginBottom: 8 }}>{b.tag}</div>
              <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
                <button onClick={() => onAdded({ ...b, status: "want" })} aria-label="Add" style={{ width: 30, height: 30, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paper, color: T.gold, cursor: "pointer", display: "grid", placeItems: "center" }}><Plus size={15} /></button>
                <button onClick={() => talk(b)} aria-label="Talk about it" style={{ width: 30, height: 30, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paper, color: T.crimson, cursor: "pointer", display: "grid", placeItems: "center" }}><MessageCircle size={14} /></button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 22, gap: 8 }}>
          <FlowerGlyph variant="camellia" size={30} color={cwOf("crimson").petal} color2={cwOf("gold").petal} idx="lib-close" />
          <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontSize: 16, color: T.muted, textAlign: "center", maxWidth: 300, lineHeight: 1.5 }}>Lurking counts. No one's behind — the thread always waits.</div>
        </div>
      </div>

      {addOpen && <AddBookSheet onClose={() => setAddOpen(false)} onAdded={onAdded} />}
      {buddyBook && <BuddyReadSheet book={buddyBook} user={user} myHash={myHash} onClose={() => setBuddyBook(null)} onTalk={talk} />}
    </div>
  );
}
