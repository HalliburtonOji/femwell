// BooksStoryFocus — Books + Story as ONE composed surface in the clean language (§2.7 · §19),
// rebuilt from the cited research pass (mnt/femwell/research_books_section.md, 2026-09-25).
//
// THE JOB (the research's reframe): the barrier to reading is CAPACITY, not motivation — 7.3m UK
// adults say mental-health issues prevent them reading; 4.96m stopped after life events, ill health
// or bereavement (new parenthood named); women are likelier to read to reduce stress. That spikes at
// exactly FemWell's life stages. So this is a reading corner that costs nothing on a bad week: it
// holds her place without comment and always has a way in for ten minutes at bedtime.
//
// THE ARRANGEMENT (deliberate, §19.2):
//   0 summary · 1 her next chapter (+ an authored "Previously", + read-time as permission)
//   2 the run (navigation, never a score) · 3 "Not much in the tank?" — the differentiator
//   4 this month's book, SINGULAR + life-stage aware + "Not for me"
//   5 read it with others — the ALREADY-BUILT Book Club, position-gated
//   6 also this month (quiet alternates + the mature reveal) · 7 what you wrote · 8 the doorway
//
// RULES HELD: no integers except Halli's "N waiting" (no books-read, no %, no streak, no "Day N");
// NO generative AI writing about her reading (Fable, Jan 2025 — the "Previously" is the author's own
// last line); never fake a shelf (0 published FemWell fiction → curated public-domain classics);
// no new entity or function (device-local storage + an authored module, like the club seed).
import React, { useEffect, useMemo, useState } from "react";
import { Feather, BookOpen, ChevronLeft, ChevronRight, Check, Users, Coffee, RotateCcw, Sparkles, MessageCircle, BookMarked, CalendarPlus } from "lucide-react";
import { readingPosition, isChapterRead } from "@/components/lifestyle/dailyStory";
import { readingDaySet } from "@/components/community/readingActivity";
import { monthlySet, DOORWAYS, DOORWAY_KEYS, getDoorway, setDoorway, passBook } from "@/components/lifestyle/booksMonthly";
import { SEED_PICK, clubReached } from "@/components/community/bookClubConfig";
import { loadShelf, addBook } from "@/components/community/bookshelf";
import { readTimeLabel, countWords } from "@/components/brand/ReadingColumn";
import { createPageUrl } from "@/utils";
import { SERIF, UI } from "@/components/journal/Editorial";
import { C } from "@/components/brand/cleanTokens";
import { Eyebrow, Title, Body, Card, Summary, Cta, Quiet, Foot, Leaf, Fleuron } from "@/components/brand/cleanKit";
import { RestingBook } from "./ReadingRoomHeader";

const clean = (s) => String(s || "").replace(/<[^>]+>/g, "").replace(/\*(.+?)\*/g, "$1").replace(/\s+/g, " ").trim();
const paras = (s) => String(s || "").replace(/<[^>]+>/g, "").split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
const isBook = (c) => /book/i.test(c?.type || "") || !!c?._book || /book/i.test(c?._continue?.type || "") || !!c?._continue?._book;
const isSerial = (c) => /daily_story|story/i.test(c?.type || "") || c?.id === "daily-chapter";
const doorBtnStyle = () => ({ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 40, background: "transparent", border: `1px solid ${C.hair}`, borderRadius: 11, fontFamily: UI, fontSize: 11.5, fontWeight: 700, color: C.ink, cursor: "pointer", padding: "0 6px", whiteSpace: "nowrap" });
const ord = (n) => (n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th");

// ── a flora book cover (never a photo — §6.7.7 hard rule 1) ────────────────────────────────────
function Cover({ title, w = 84, h = 118, room = false }) {
  const t = [["#F3EADF", "#DCC7B0"], ["#E9EFE8", "#BACCBA"], ["#EEE7EF", "#CAB8CC"], ["#F5EEE0", "#E3C692"]][String(title || "").length % 4];
  return (
    <div className={room ? "fw-room-volume" : undefined} style={{ width: w, height: h, borderRadius: 10, flexShrink: 0, position: "relative", overflow: "hidden", background: `linear-gradient(160deg, ${t[0]}, ${t[1]})` }}>
      <svg viewBox="0 0 84 118" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden>
        <path d="M42 118 C42 98 40 86 42 72" stroke="#6F9A78" strokeWidth="1.6" fill="none" />
        {room ? <g transform="translate(42 55)" fill="#fff" stroke="#8FAF8F" strokeWidth=".5"><path d="M0-17 4-5 16-6 7 2 10 15 0 8-10 15-7 2-16-6-4-5Z"/><circle r="2" fill="#A8893F"/></g> : <g transform="translate(42 66)" fill="#C97A84" opacity=".92">
          <path d="M0 0 C-10 -6 -16 -20 -8 -30 C-1 -22 0 -10 0 0Z" /><path d="M0 0 C10 -6 16 -20 8 -30 C1 -22 0 -10 0 0Z" /><path d="M0 -3 C-6 -14 -3 -26 0 -29 C3 -26 6 -14 0 -3Z" />
        </g>}
        <circle cx="42" cy="63" r="3.5" fill="#B8912E" />
      </svg>
      {room && w > 60 && <span className="fw-room-volume-title">{title}</span>}
    </div>
  );
}

// ── the run strip — this run's series only; navigation, never a score ──────────────────────────
function RunStrip({ pool, unlockedCount, nextIndex, onOpen }) {
  return (
    <div className="fw-books-run" style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "7px 5px", margin: "4px 0 12px" }}>
      {pool.map((c, i) => {
        const read = c?.id ? isChapterRead(c.id) : false;
        const locked = i >= unlockedCount;
        const isNext = i === nextIndex;
        const base = { aspectRatio: "1", borderRadius: 999, display: "grid", placeItems: "center", fontFamily: UI, fontSize: 10, fontWeight: 700, cursor: locked ? "default" : "pointer", border: "none", padding: 0 };
        const style = isNext ? { ...base, background: C.ink, color: "#fff", boxShadow: `0 0 0 2px ${C.ground}, 0 0 0 3.5px ${C.ink}` }
          : read ? { ...base, background: "#DCE8DC", color: "#3E6B4A" }
          : locked ? { ...base, background: "transparent", border: `1px dashed ${C.hair}`, color: C.faint }
          : { ...base, background: "transparent", border: `1px solid ${C.ink}`, color: C.ink };
        return (
          <button key={c.id || i} disabled={locked} onClick={() => !locked && onOpen && onOpen(i)} className="fw-elite-press"
            aria-label={`Chapter ${c.day_number || i + 1}${read ? " — read" : locked ? " — opens later" : ""}`} style={style}>
            {read && !isNext ? <Check size={11} /> : (c.day_number || i + 1)}
          </button>
        );
      })}
    </div>
  );
}
const Legend = () => (
  <div style={{ display: "flex", gap: 12, justifyContent: "center", fontFamily: UI, fontSize: 11, color: C.slate, margin: "0 0 12px", flexWrap: "wrap" }}>
    {[["#DCE8DC", "read", null], [C.ink, "next", null], ["transparent", "open", "solid"], ["transparent", "opens daily", "dashed"]].map(([bg, label, border]) => (
      <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
        <i style={{ width: 9, height: 9, borderRadius: 99, background: bg, border: border ? `1px ${border} ${border === "dashed" ? C.hair : C.ink}` : "none", display: "inline-block" }} />{label}
      </span>
    ))}
  </div>
);

// ── a quiet one-line way in (the capacity row) ─────────────────────────────────────────────────
function WayIn({ Icon, title, line, onClick, first }) {
  return (
    <button onClick={onClick} className="fw-elite-press"
      style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", background: "transparent", border: "none", borderTop: first ? "none" : `1px solid ${C.hair}`, padding: "12px 2px", cursor: "pointer" }}>
      <span style={{ width: 30, height: 30, borderRadius: 9, background: C.sunk, border: `1px solid ${C.hair}`, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={15} color={C.ink} strokeWidth={1.7} /></span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: C.ink, lineHeight: 1.25 }}>{title}</span>
        <span style={{ display: "block", fontFamily: SERIF, fontSize: 14.5, color: C.slate, lineHeight: 1.4, marginTop: 1 }}>{line}</span>
      </span>
      <ChevronRight size={15} color={C.faint} />
    </button>
  );
}

export default function BooksStoryFocus({ chapters = [], story, pick, onRead, continueCards = [], shelfBookCards = [], classicCards = [], onOpenBook, lifeStage, userId, onSchedule, onCorner, artDirection }) {
  const room = artDirection === "reading-room";
  const pos = useMemo(() => readingPosition(chapters, pick), [chapters, pick, story]);
  const [doorway, setDoor] = useState(() => getDoorway());
  const [passTick, setPassTick] = useState(0);
  // THE ONE SHELF (2026-09-27): Books and Community's Library now read/write the SAME UserBook
  // rows via the existing bookshelf API — adding here shows up there, and her status (reading /
  // want / finished / set aside) is one cross-device truth instead of two device-local copies.
  const [shelf, setShelf] = useState([]);
  useEffect(() => { let dead = false; (async () => { try { const s = await loadShelf(userId); if (!dead) setShelf(s); } catch { /* the shelf is a nicety */ } })(); return () => { dead = true; }; }, [userId, passTick]);
  const onShelf = (gid) => shelf.find((b) => b.gutenberg_id === String(gid)) || null;
  const shelve = async (bk, status) => { try { await addBook(userId, { title: bk.title, author: bk.author, gutenberg_id: bk.gutenberg_id, status, source: "curated" }); setPassTick((t) => t + 1); } catch { /* ignore */ } };
  const set = useMemo(() => monthlySet(new Date(), lifeStage, doorway), [lifeStage, doorway, passTick]);

  const contBooks = (continueCards || []).filter(isBook);
  const her = pos?.chapter || story || null;
  const roomChapterMatch = room ? String(her?.segment_text || "").trim().match(/^#{1,6}\s+([^\n]+)(?:\n([\s\S]*))?$/) : null;
  const roomChapterTitle = roomChapterMatch ? clean(roomChapterMatch[1]) : null;
  const roomChapterBody = roomChapterMatch ? roomChapterMatch[2] || "" : her?.segment_text;
  const herN = her?.day_number ?? (pos ? pos.index + 1 : 1);
  const total = pos?.total ?? chapters.length;
  const waiting = pos?.waiting || 0;
  const caughtUp = !!pos?.caughtUp;
  const series = story?.series_title || her?.series_title || "the serial";
  const openBook = (b, extra) => onOpenBook && onOpenBook({ _gutenbergId: b.gutenberg_id, _book: "gutenberg", title: b.title, ...extra });

  // read-time as PERMISSION when small; hidden past the threshold (the reader standard, §6.7.8)
  const chapterTime = her?.segment_text ? readTimeLabel(countWords(her.segment_text)) : null;

  // "Previously…" — the last line of the chapter she actually read, in the AUTHOR'S words. Never a
  // model writing about her reading (Fable, Jan 2025). Only when she's behind: a hand back in.
  const previously = useMemo(() => {
    if (!pos || pos.index <= 0 || caughtUp) return null;
    const prev = pos.pool[pos.index - 1];
    if (!prev?.id || !isChapterRead(prev.id)) return null;
    const last = paras(prev.segment_text).slice(-1)[0] || "";
    if (!last) return null;
    const t = clean(last);
    return t.length > 180 ? `${t.slice(0, 180)}…` : t;
  }, [pos, caughtUp]);

  // the shortest unread chapter open to her — the capacity row's first way in
  const shortest = useMemo(() => {
    if (!pos) return null;
    const open = pos.pool.slice(0, pos.unlockedCount).map((c, i) => ({ c, i })).filter(({ c }) => c?.id && !isChapterRead(c.id));
    if (!open.length) return null;
    return open.reduce((a, b) => (countWords(b.c.segment_text) < countWords(a.c.segment_text) ? b : a));
  }, [pos]);

  // the club — ALREADY BUILT, finally surfaced. Her checkpoint is self-attested + device-local
  // (clubReached), so the conversation is gated by her own position: it structurally cannot spoil.
  const reached = clubReached(SEED_PICK.pick_key);
  const nextCp = SEED_PICK.checkpoints[Math.min(SEED_PICK.checkpoints.length - 1, Math.max(0, reached + 1))];

  // her own words — the ONLY progress artefact in this section. No counts anywhere.
  const herWords = useMemo(() => {
    try {
      const out = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("fw_read_reflect_")) { const v = localStorage.getItem(k); if (v && v.trim()) out.push(v.trim()); }
      }
      return out.slice(-1)[0] || null;
    } catch { return null; }
  }, [passTick]);

  const summary = pos
    ? (pick?.complete
      ? `“${series}” has closed for ${pick.monthName || "the month"} — read it straight through whenever you like; a new one begins on the 1st.`
      : caughtUp
        ? `You're up to date with “${series}”. Chapter ${Math.min(herN + 1, total)} opens tomorrow${set.featured ? `, and ${set.featured.title} is waiting whenever you want it` : ""}.`
        : waiting > 1
          ? `You're at chapter ${herN} of “${series}” — ${waiting} have opened while you were busy. They'll wait. One at a time.`
          : `Chapter ${herN} of “${series}” is waiting for you.`)
    : `${set.featured ? `This month it's ${set.featured.title}.` : "This month's book is being chosen."} Read a little, or not at all — it keeps.`;

  return (
    <div className="fw-books-focus" data-room={room || undefined} style={{ display: "flex", flexDirection: "column" }}>
      <Summary Icon={Feather} cw="crimson">{summary}</Summary>

      {/* 1 · YOUR NEXT CHAPTER — hers, never the calendar's */}
      {pos && her ? (
        <Card wash="crimson" className={room ? "fw-room-chapter-leaf" : undefined}>
          <Eyebrow cw="crimson" align="left">Your next chapter</Eyebrow>
          <Title align="left" size={25} style={{ margin: "0 0 4px" }}>{roomChapterTitle || clean(her.title) || `Chapter ${herN}`}</Title>
          <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: C.slate, letterSpacing: ".03em", margin: "0 0 10px" }}>
            {series} · chapter {herN} of {total}{chapterTime ? ` · ${chapterTime}` : ""}
          </div>
          {waiting > 1 ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 12, fontWeight: 700, color: C.crimson, background: "#FBEDEB", borderRadius: 999, padding: "4px 10px", marginBottom: 12 }}>{waiting} waiting for you</span>
          ) : caughtUp ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 12, fontWeight: 700, color: C.slate, background: C.sunk, border: `1px solid ${C.hair}`, borderRadius: 999, padding: "4px 10px", marginBottom: 12 }}>Up to date</span>
          ) : null}
          {previously ? (
            <div style={{ margin: "0 0 12px", paddingLeft: 12, borderLeft: `2px solid ${C.goldHair}` }}>
              <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", color: C.gold, marginBottom: 3 }}>Previously</div>
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, fontWeight: 500, color: C.slate, lineHeight: 1.5, margin: 0 }}>{previously}</p>
            </div>
          ) : null}
          {paras(room ? roomChapterBody : her.segment_text).slice(0, 1).map((p, i) => <Body key={i} size={16.5} style={{ margin: "0 0 14px" }}>{p}</Body>)}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => onRead && onRead(Math.max(0, pos.index - 1))} disabled={pos.index === 0} aria-label="Previous chapter" className="fw-elite-press"
              style={{ width: 44, height: 44, borderRadius: 12, border: `1px solid ${C.hair}`, background: C.surface, color: C.ink, display: "grid", placeItems: "center", cursor: pos.index === 0 ? "default" : "pointer", opacity: pos.index === 0 ? 0.35 : 1, flexShrink: 0 }}><ChevronLeft size={18} /></button>
            <Cta filled Icon={BookOpen} onClick={() => onRead && onRead(pos.index)} style={{ flex: 1 }} {...(room ? {className:"fw-elite-press fw-room-resume"} : {})}>{isChapterRead(her.id) ? "Read it again" : `Read chapter ${herN}`}</Cta>
            <button onClick={() => onRead && onRead(Math.min(pos.unlockedCount - 1, pos.index + 1))} disabled={!isChapterRead(her.id) || pos.index >= pos.unlockedCount - 1} aria-label="Next chapter" className="fw-elite-press"
              style={{ width: 44, height: 44, borderRadius: 12, border: `1px solid ${C.hair}`, background: C.surface, color: C.ink, display: "grid", placeItems: "center", cursor: "pointer", opacity: (!isChapterRead(her.id) || pos.index >= pos.unlockedCount - 1) ? 0.35 : 1, flexShrink: 0 }}><ChevronRight size={18} /></button>
          </div>
          <div style={{ fontFamily: UI, fontSize: 11, color: C.faint, textAlign: "center", margin: "10px 0 0" }}>‹ re-read · › moves on once this one's read</div>
        </Card>
      ) : (
        <Card className={room ? "fw-room-chapter-leaf" : undefined}>
          <Eyebrow cw="crimson" align="left">The serial</Eyebrow>
          <Title align="left">A chapter a day, when you want it</Title>
          <Body style={{ margin: 0 }}>Today's instalment lands each morning through the month. Miss a week and nothing is lost — it waits at the one you haven't read.</Body>
        </Card>
      )}

      {pos && !room ? <Leaf my={22} /> : null}

      {/* 2 · THE RUN — navigation, not a score */}
      {pos ? (
        <section className={room ? "fw-room-chapter-index" : undefined}>
          <Eyebrow cw="plum">{pick?.monthName ? `${pick.monthName}'s run` : "The run"} · {total} chapters</Eyebrow>
          <RunStrip pool={pos.pool} unlockedCount={pos.unlockedCount} nextIndex={pos.index} onOpen={(i) => onRead && onRead(i)} />
          <Legend />
          <div style={{ display: "flex", flexDirection: "column" }}>
            {pos.pool.slice(pos.index + 1, pos.index + 3).map((c, i) => {
              const n = c.day_number || pos.index + 2 + i;
              const locked = pos.index + 1 + i >= pos.unlockedCount;
              return (
                <button key={c.id || n} onClick={() => !locked && onRead && onRead(pos.index + 1 + i)} className="fw-elite-press"
                  style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left", background: "transparent", border: "none", borderTop: `1px solid ${C.hair}`, padding: "11px 2px", cursor: locked ? "default" : "pointer", opacity: locked ? 0.72 : 1 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 8, border: `1px solid ${C.hair}`, display: "grid", placeItems: "center", fontFamily: UI, fontSize: 11, fontWeight: 800, color: C.slate, flexShrink: 0 }}>{n}</span>
                  <span style={{ flex: 1, minWidth: 0, fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{clean(c.title) || `Chapter ${n}`}</span>
                  <span style={{ fontFamily: UI, fontSize: 11, color: C.faint, flexShrink: 0 }}>{locked ? `opens the ${n}${ord(n)}` : i === 0 ? "up next" : "after that"}</span>
                </button>
              );
            })}
          </div>
          <Quiet onClick={() => onRead && onRead(0)}>Read straight through from chapter 1 ›</Quiet>
        </section>
      ) : null}

      {!room && <Fleuron my={24} />}

      {/* 3 · NOT MUCH IN THE TANK? — capacity, not motivation. The section's differentiator. */}
      <section className={room ? "fw-room-capacity" : undefined}>
        {room && <RestingBook/>}
        <Eyebrow cw="sage">Not much in the tank?</Eyebrow>
        <Title>A way in that costs nothing</Title>
        <Card className={room ? "fw-room-tissue" : undefined}>
          {shortest ? (
            <WayIn first Icon={Coffee} title="The shortest one waiting"
              line={`Chapter ${shortest.c.day_number || shortest.i + 1} · ${readTimeLabel(countWords(shortest.c.segment_text)) || "a few minutes"}`}
              onClick={() => onRead && onRead(shortest.i)} />
          ) : null}
          <WayIn first={!shortest} Icon={RotateCcw} title="Something you already know"
            line={contBooks.length ? `Pick up ${clean(contBooks[0].title)} where you left it — re-reading counts.` : "Re-reading a favourite is reading. It asks nothing new of you."}
            onClick={() => (contBooks.length ? onOpenBook && onOpenBook(contBooks[0]) : onOpenBook && onOpenBook({ _library: true }))} />
          <WayIn Icon={BookOpen} title="Just a page" line="Open it, read one page, close it. That counts."
            onClick={() => (pos ? onRead && onRead(pos.index) : set.featured ? openBook(set.featured) : onOpenBook && onOpenBook({ _library: true }))} />
        </Card>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: C.faint, textAlign: "center", lineHeight: 1.5, margin: "10px 14px 0" }}>Some weeks there's no room for a book. This is here for those weeks.</p>
      </section>

      {!room && <Fleuron my={24} />}

      {/* 4 · THIS MONTH'S BOOK — singular; the featured one is the product */}
      <section className={room ? "fw-room-feature" : undefined}>
        <Eyebrow cw="gold">{set.monthName}'s book</Eyebrow>
        {set.featured ? (
          <Card className={room ? "fw-room-feature-leaf" : undefined}>
            <div style={{ display: "flex", gap: 14 }}>
              <Cover title={set.featured.title} room={room}/>
              <div style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
                <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 21, lineHeight: 1.12, color: C.ink }}>{set.featured.title}</div>
                <div style={{ fontFamily: UI, fontSize: 11.5, color: C.slate, margin: "3px 0 7px" }}>{set.featured.author} · free to read</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: C.gold, marginBottom: 6 }}>
                  <Sparkles size={11} /> {DOORWAYS[set.featured.doorway]?.label}
                </div>
                <p style={{ fontFamily: SERIF, fontSize: 15.5, fontWeight: 500, lineHeight: 1.5, color: C.ink, margin: 0 }}>{set.featured.why}</p>
              </div>
            </div>
            {set.featured.notes ? (
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.hair}`, fontFamily: UI, fontSize: 11.5, color: C.slate, lineHeight: 1.5 }}>
                <b style={{ color: C.ink, fontWeight: 700 }}>Worth knowing:</b> {set.featured.notes}.
              </div>
            ) : null}
            <div style={{ marginTop: 14 }}><Cta filled Icon={BookOpen} onClick={() => openBook(set.featured)}>Start reading</Cta></div>
            {/* the three doors out — shelf (UserBook, shared with Community) · plan a time
                (PlannerItems) · talk about it (this book's readers' corner in Community). */}
            <div className={room ? "fw-room-connections" : undefined} style={{ display: "flex", gap: 8, marginTop: 10 }}>
              {(() => { const on = onShelf(set.featured.gutenberg_id); return (
                <button onClick={() => shelve(set.featured, on ? "reading" : "want")} className={room ? "fw-elite-press fw-room-shelf-marker" : "fw-elite-press"} style={doorBtnStyle()}>
                  <BookMarked size={14} color={on ? "#5F8A6B" : C.ink} strokeWidth={1.7} />{on ? (on.status === "reading" ? "Reading" : "On your shelf") : "Add to shelf"}
                </button>); })()}
              <button onClick={() => onSchedule && onSchedule({ title: `Read ${set.featured.title}`, ref: `gutenberg:${set.featured.gutenberg_id}` })} className="fw-elite-press" style={doorBtnStyle()}>
                <CalendarPlus size={14} color={C.ink} strokeWidth={1.7} />Plan a time
              </button>
              <button onClick={() => onCorner && onCorner(set.featured)} className="fw-elite-press" style={doorBtnStyle()}>
                <MessageCircle size={14} color={C.ink} strokeWidth={1.7} />Talk about it
              </button>
            </div>
            <Quiet onClick={() => { passBook(set.featured.gutenberg_id); setPassTick((t) => t + 1); }}>Not for me — show me another ›</Quiet>
          </Card>
        ) : (
          <Card><Body style={{ textAlign: "center", color: C.slate, margin: 0 }}>You've passed on this month's picks — nothing owed. The whole library is a tap away, and a new set arrives on the 1st.</Body></Card>
        )}
      </section>

      {/* 5 · READ IT WITH OTHERS — the Book Club we already built */}
      <section className={room ? "fw-room-club" : undefined} style={{ marginTop: 24 }}>
        <Eyebrow cw="blush">Read it with others</Eyebrow>
        <Title>The book club</Title>
        <Card className={room ? "fw-room-correspondence" : undefined}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <span style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 600, color: C.ink }}>{SEED_PICK.title}</span>
            <span style={{ fontFamily: UI, fontSize: 11.5, color: C.slate }}>{SEED_PICK.author} · {SEED_PICK.cadence}</span>
          </div>
          <Body size={16} style={{ margin: "0 0 12px", color: C.slate }}>{clean(SEED_PICK.host_intro).slice(0, 160)}…</Body>
          <div className={room ? "fw-room-checkpoint" : undefined} style={{ background: C.sunk, border: `1px solid ${C.hair}`, borderRadius: 13, padding: "12px 14px" }}>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", color: C.gold, marginBottom: 4 }}>{reached < 0 ? "It starts at" : "Your next checkpoint"}</div>
            <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>{nextCp?.label}</div>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, fontWeight: 500, color: C.slate, lineHeight: 1.5, margin: "6px 0 0" }}>{clean(nextCp?.jess_prompt)}</p>
          </div>
          <div style={{ fontFamily: UI, fontSize: 11, color: C.faint, textAlign: "center", margin: "10px 0 0", lineHeight: 1.5 }}>Each checkpoint's conversation opens when <em>you</em> say you've reached it — so nothing can spoil it.</div>
          <div style={{ marginTop: 12 }}><Cta Icon={Users} onClick={() => window.location.assign(createPageUrl("Community?view=bookclub"))}>Open the book club</Cta></div>
          <Quiet onClick={() => onSchedule && onSchedule({ club: SEED_PICK })}>Put the six weeks in my planner ›</Quiet>
        </Card>
      </section>

      {/* 6 · ALSO THIS MONTH — quiet alternates + the mature reveal (synopsis now, book on the day) */}
      {(set.alternates.length || set.reveal) ? (
        <section className={room ? "fw-room-catalogue" : undefined} style={{ marginTop: 24 }}>
          <Eyebrow cw="sky">Also this month</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {set.alternates.map((b, i) => (
              <button key={b.gutenberg_id} onClick={() => openBook(b)} className="fw-elite-press"
                style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", background: "transparent", border: "none", borderTop: i === 0 ? "none" : `1px solid ${C.hair}`, padding: "12px 2px", cursor: "pointer" }}>
                <Cover title={b.title} w={44} h={62} room={room}/>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: C.ink, lineHeight: 1.2 }}>{b.title}</span>
                  <span style={{ display: "block", fontFamily: UI, fontSize: 11, color: C.slate, margin: "2px 0 3px" }}>{b.author} · {DOORWAYS[b.doorway]?.label}</span>
                  <span style={{ display: "block", fontFamily: SERIF, fontSize: 14.5, color: C.slate, lineHeight: 1.4 }}>{b.why}</span>
                </span>
                <ChevronRight size={15} color={C.faint} style={{ flexShrink: 0 }} />
              </button>
            ))}
            {set.reveal ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 2px", borderTop: set.alternates.length ? `1px solid ${C.hair}` : "none" }}>
                {set.reveal.revealed ? <Cover title={set.reveal.title} w={44} h={62} room={room}/> : (
                  <span style={{ width: 44, height: 62, borderRadius: 8, border: `1px dashed ${C.goldHair}`, display: "grid", placeItems: "center", flexShrink: 0, fontFamily: UI, fontSize: 10, fontWeight: 700, color: C.faint }}>{set.reveal.day}{ord(set.reveal.day)}</span>
                )}
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: set.reveal.revealed ? C.ink : C.slate, lineHeight: 1.2 }}>{set.reveal.revealed ? set.reveal.title : "The last one of the month"}</span>
                  <span style={{ display: "block", fontFamily: UI, fontSize: 11, color: C.slate, margin: "2px 0 3px" }}>{set.reveal.revealed ? `${set.reveal.author} · ${DOORWAYS[set.reveal.doorway]?.label}` : `${DOORWAYS[set.reveal.doorway]?.label} · arrives on the ${set.reveal.day}${ord(set.reveal.day)}`}</span>
                  <span style={{ display: "block", fontFamily: SERIF, fontSize: 14.5, color: C.slate, lineHeight: 1.4 }}>{set.reveal.why}</span>
                </span>
                {set.reveal.revealed ? (
                  <button onClick={() => openBook(set.reveal)} className="fw-elite-press" aria-label={`Open ${set.reveal.title}`} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}><ChevronRight size={15} color={C.faint} /></button>
                ) : null}
              </div>
            ) : null}
          </div>
          <Quiet onClick={() => onOpenBook && onOpenBook({ _library: true })}>Yours &amp; the whole library ›</Quiet>
        </section>
      ) : null}

      {/* 6b · WHAT READING GREW — the garden already counts her reading days (forget-me-not);
              this just shows it back, in her own garden's language. Read-only. */}
      {(() => {
        const days = readingDaySet();
        if (!days || days.size < 2) return null;
        const month = new Date().toISOString().slice(0, 7);
        const thisMonth = [...days].filter((d) => d.startsWith(month)).length;
        if (thisMonth < 2) return null;
        return (
          <section className={room ? "fw-room-grown" : undefined} style={{ marginTop: 24 }}>
            <Eyebrow cw="sage">In your garden</Eyebrow>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, fontWeight: 500, color: C.ink, lineHeight: 1.55, textAlign: "center", margin: "0 auto", maxWidth: "26em" }}>
              Time with a book has grown forget-me-nots in your garden this month — they cluster, because reading is something you do in company.
            </p>
            <Quiet onClick={() => window.location.assign(createPageUrl("Garden"))}>See your garden ›</Quiet>
          </section>
        );
      })()}

      {/* 7 · WHAT YOU WROTE — the ONLY progress artefact here. No counts anywhere. */}
      {herWords ? (
        <section className={room ? "fw-room-private-slip" : undefined} style={{ marginTop: 24 }}>
          <Eyebrow cw="plum">What you wrote</Eyebrow>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, fontWeight: 500, color: C.ink, lineHeight: 1.55, textAlign: "center", margin: "0 auto", maxWidth: "28em" }}>“{clean(herWords).slice(0, 220)}”</p>
          <div style={{ fontFamily: UI, fontSize: 11, color: C.faint, textAlign: "center", marginTop: 8 }}>the last thing you left at the end of a chapter</div>
        </section>
      ) : null}

      {/* 8 · THE DOORWAY — asked once; it orders, it never filters, it profiles nothing */}
      {!doorway ? (
        <section className={room ? "fw-room-doorway" : undefined} style={{ marginTop: 24 }}>
          <Eyebrow cw="gold">One question, once</Eyebrow>
          <Title size={21}>What draws you into a book?</Title>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
            {DOORWAY_KEYS.map((k) => (
              <button key={k} onClick={() => { setDoorway(k); setDoor(k); }} className="fw-elite-press"
                style={{ textAlign: "left", background: C.surface, border: `1px solid ${C.hair}`, borderRadius: 14, padding: "13px 14px", cursor: "pointer" }}>
                <span style={{ display: "block", fontFamily: SERIF, fontSize: 16.5, fontWeight: 600, color: C.ink }}>{DOORWAYS[k].label}</span>
                <span style={{ display: "block", fontFamily: SERIF, fontSize: 13.5, color: C.slate, lineHeight: 1.35, marginTop: 2 }}>{DOORWAYS[k].line}</span>
              </button>
            ))}
          </div>
          <div style={{ fontFamily: UI, fontSize: 11, color: C.faint, textAlign: "center", marginTop: 9 }}>It only sorts what's shown here. Nothing about you is saved.</div>
        </section>
      ) : null}

      <Foot>A chapter a day while the run's open — but your place is yours. No streaks, no “you're behind.”</Foot>
    </div>
  );
}
