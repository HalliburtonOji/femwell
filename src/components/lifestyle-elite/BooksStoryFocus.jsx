// BooksStoryFocus — Books + Story MERGED into one bespoke §19 surface (Halli 2026-09-21: the Story
// is a chapter a day inside a monthly series that closes at month-end — it belongs with Books).
// Deliberately ordered: today's chapter (the serial hero, with the run's honest framing) →
// continue the serial → the whole run with her read/unread state → the book she's mid-chapter on
// → her shelf (BOOKS ONLY — the daily-story pseudo-card no longer leaks in and breaks the book
// reader) → free classics. Reads real state (read-marks, day-of-month, run completion, reader
// positions). Serial taps open the immersive DailyStoryReader at that chapter; book taps open the
// book reader at her place. Cream design (its siblings' language; the clean roll-out is gated).
import React from "react";
import { Feather, BookOpen, Check, ChevronRight, PlayCircle, Library } from "lucide-react";
import { CoverCard } from "@/components/brand/expandCards";
import { isChapterRead, chapterLabel, framingLine, readCount } from "@/components/lifestyle/dailyStory";
import { T, SERIF, UI, PAPER_TEX } from "@/components/journal/Editorial";
import { cwOf, CardFrame } from "@/components/brand/flora";

const OX = "#7A1A12";
const clean = (s) => String(s || "").replace(/<[^>]+>/g, "").replace(/\*(.+?)\*/g, "$1").replace(/\s+/g, " ").trim();
const paras = (s) => String(s || "").replace(/<[^>]+>/g, "").split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
const isBook = (c) => /book/i.test(c?.type || "") || !!c?._book || /book/i.test(c?._continue?.type || "") || !!c?._continue?._book;
const isSerial = (c) => /daily_story|story/i.test(c?.type || "") || c?.id === "daily-chapter";

function Card({ eyebrow, title, accent = "crimson", children, style }) {
  const petal = cwOf(accent).petal;
  return (
    <section style={{ position: "relative", overflow: "hidden", background: T.paperHi || "#F4EFE3", border: `1px solid ${T.line || "#d8cfbc"}`, borderLeft: `4px solid ${petal}`, borderRadius: 18, padding: "16px 17px", boxShadow: "0 6px 22px rgba(58,44,26,.08), 0 1px 3px rgba(58,44,26,.05)", ...style }}>
      <span aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: `url(${PAPER_TEX})`, backgroundSize: "180px", mixBlendMode: "multiply", opacity: 0.4, pointerEvents: "none" }} />
      <CardFrame color={petal} opacity={0.4} size={40} />
      <div style={{ position: "relative" }}>
        {eyebrow ? <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#A8893F", marginBottom: 6 }}>{eyebrow}</div> : null}
        {title ? <h3 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 600, color: T.ink, lineHeight: 1.18, margin: "0 0 8px" }}>{title}</h3> : null}
        {children}
      </div>
    </section>
  );
}
const Summary = ({ Icon, cw, children }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "2px 2px" }}>
    <span style={{ width: 34, height: 34, borderRadius: 10, background: `${cwOf(cw).petal}1f`, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2 }}><Icon size={18} color={cwOf(cw).petal} /></span>
    <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, color: OX, lineHeight: 1.5, margin: 0 }}>{children}</p>
  </div>
);

// `onRead(index)` opens the immersive serial reader at chapter `index`; `onOpenBook(card)` opens a book.
export default function BooksStoryFocus({ chapters = [], story, pick, nextPick, onRead, continueCards = [], shelfBookCards = [], classicCards = [], onOpenBook }) {
  const total = chapters.length;
  const hasSerial = !!(story && total);
  const contBooks = (continueCards || []).filter(isBook);
  const shelf = (shelfBookCards || []).filter((c) => !isSerial(c));   // BOOKS only — the serial lives above, as a serial
  const hasBooks = contBooks.length || shelf.length || classicCards.length;

  // ── serial state ──
  const todayIdx = pick?.index ?? 0;
  const readSoFar = hasSerial ? readCount(chapters, pick) : 0;
  const readToday = hasSerial ? isChapterRead(story.id) : false;
  const series = story?.series_title || "Today's story";
  const label = hasSerial ? (chapterLabel(pick) || (story.day_number ? `Chapter ${story.day_number}` : "Today's chapter")) : "";
  const taster = hasSerial ? paras(story.segment_text).slice(0, 2) : [];
  const framing = clean(framingLine(pick));
  const firstUnread = chapters.findIndex((c) => c?.id && !isChapterRead(c.id));
  const continueIdx = nextPick?.index != null && !nextPick?.complete ? nextPick.index : (firstUnread >= 0 ? firstUnread : null);
  const continueCh = continueIdx != null && continueIdx !== todayIdx ? chapters[continueIdx] : null;
  const runLine = pick?.complete
    ? `This month's run of “${series}” has closed — read it straight through; a new run begins on the 1st.`
    : pick?.daysLeft != null ? `${label} of this month's run · ${pick.daysLeft === 1 ? "closes tonight" : `${pick.daysLeft} days left in the run`}.` : "";

  const summary = !hasSerial && !hasBooks
    ? "Today's chapter lands each morning, and your shelf fills as you add books — a chapter a day, spoiler-safe, at your pace."
    : hasSerial
      ? (pick?.complete
        ? `“${series}” closed for the month — ${readSoFar} of ${total} read. ${contBooks.length ? `Pick up ${contBooks[0].title} meanwhile.` : `${classicCards.length} free classic${classicCards.length === 1 ? "" : "s"} waiting.`}`
        : readToday
          ? `You've read ${label.toLowerCase()} — ${readSoFar} of ${total} in this month's run.${contBooks.length ? ` And ${contBooks[0].title} is waiting where you left it.` : ""}`
          : `${label} landed this morning${story.cliffhanger ? ` — it picks up on “${clean(story.cliffhanger)}”` : ""}. You're ${readSoFar} of ${total} in.`)
      : contBooks.length
        ? `Pick up ${contBooks[0].title} — you're part-way through. ${classicCards.length} free classic${classicCards.length === 1 ? "" : "s"} waiting.`
        : `${shelf.length} on your shelf · ${classicCards.length} free classic${classicCards.length === 1 ? "" : "s"} to fall into.`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 0 · section-specific, stateful summary */}
      <Summary Icon={Feather} cw="crimson">{summary}</Summary>

      {/* 1 · TODAY'S CHAPTER — the serial hero, framed honestly by the month's run */}
      {hasSerial ? (
        <Card eyebrow={`${series} · ${label}`} title={story.title && story.title !== series ? story.title : (pick?.complete ? "The finale" : "New this morning")} accent="crimson">
          {runLine ? <p style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: cwOf("crimson").petal, margin: "0 0 4px" }}>{runLine}</p> : null}
          {framing ? <p style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, margin: "0 0 8px" }}>{framing}</p> : null}
          {taster.map((p, i) => <p key={i} style={{ fontFamily: SERIF, fontSize: 16.5, color: T.inkSoft, lineHeight: 1.62, margin: "0 0 10px" }}>{p}</p>)}
          <button onClick={() => onRead && onRead(todayIdx)} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", minHeight: 48, background: cwOf("crimson").petal, color: "#fff", border: "none", borderRadius: 12, fontFamily: UI, fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 2 }}>
            <BookOpen size={16} /> {pick?.complete ? "Read the finale again" : readToday ? "Read it again" : "Read today's chapter"}
          </button>
        </Card>
      ) : (
        <Card eyebrow="Today's chapter" title="On its way" accent="crimson">
          <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.6, margin: 0 }}>Today's instalment lands each morning — a chapter a day through the month, and you can always read the story straight through.</p>
        </Card>
      )}

      {/* 2 · CONTINUE THE SERIAL — where she left off (only if there's an earlier unread) */}
      {hasSerial && continueCh ? (
        <button onClick={() => onRead && onRead(continueIdx)} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", cursor: "pointer", background: T.paperHi, border: `1px solid ${T.line}`, borderLeft: `4px solid ${cwOf("plum").petal}`, borderRadius: 14, padding: "13px 15px" }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: `${cwOf("plum").petal}1f`, display: "grid", placeItems: "center", flexShrink: 0 }}><PlayCircle size={18} color={cwOf("plum").petal} /></span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "#A8893F" }}>Pick up the story where you left off</span>
            <span style={{ display: "block", fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink }}>{chapterLabel({ chapter: continueCh, index: continueIdx, total }) || `Chapter ${continueCh.day_number || continueIdx + 1}`}</span>
          </span>
          <ChevronRight size={16} color={T.paperDeep} />
        </button>
      ) : null}

      {/* 3 · THE WHOLE RUN — every chapter, her read/unread state, read straight through */}
      {hasSerial ? (
        <Card eyebrow={pick?.monthName ? `${pick.monthName}'s run` : "The whole story"} title={`${series} · ${total} chapters`} accent="plum">
          <div style={{ display: "flex", flexDirection: "column" }}>
            {chapters.map((c, i) => {
              const read = c?.id ? isChapterRead(c.id) : false;
              const isToday = i === todayIdx;
              const ahead = !pick?.complete && i > todayIdx;   // not yet reached in this month's run
              return (
                <button key={c.id || i} onClick={() => onRead && onRead(i)} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left", cursor: "pointer", background: "transparent", border: "none", borderTop: i === 0 ? "none" : `1px solid ${T.paperDeep || "#D8CFBC"}`, padding: "11px 2px", opacity: ahead ? 0.72 : 1 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 8, background: read ? `${cwOf("sage").petal}22` : `${T.paper}`, border: `1px solid ${read ? cwOf("sage").petal : T.line}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                    {read ? <Check size={14} color={cwOf("sage").petal} /> : <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, color: T.muted }}>{c.day_number || i + 1}</span>}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontFamily: SERIF, fontSize: 15.5, fontWeight: isToday ? 700 : 600, color: T.ink, lineHeight: 1.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title || chapterLabel({ chapter: c, index: i, total }) || `Chapter ${c.day_number || i + 1}`}</span>
                    {isToday ? <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: cwOf("crimson").petal }}>{pick?.complete ? "The finale" : "New today"}</span>
                      : read ? <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>Read</span>
                      : ahead ? <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>Lands on the {c.day_number || i + 1}{ordinal(c.day_number || i + 1)} — or read ahead</span> : null}
                  </span>
                  <ChevronRight size={15} color={T.paperDeep} />
                </button>
              );
            })}
          </div>
          <button onClick={() => onRead && onRead(0)} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", minHeight: 44, marginTop: 12, background: "transparent", border: `1px dashed ${cwOf("plum").petal}`, borderRadius: 12, cursor: "pointer", fontFamily: UI, fontSize: 13.5, fontWeight: 700, color: cwOf("plum").petal }}>
            Read straight through from Chapter 1
          </button>
        </Card>
      ) : null}

      {/* 4 · READING NOW — the book she's mid-chapter on, resumes in place */}
      {contBooks.length ? (
        <Card eyebrow="Pick up where you left off" title="Reading now" accent="sky">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {contBooks.map((it) => <CoverCard key={it.id} item={it} onOpen={() => onOpenBook && onOpenBook(it)} />)}
          </div>
        </Card>
      ) : null}

      {/* 5 · YOUR SHELF — books only */}
      {shelf.length ? (
        <Card eyebrow="Yours to read" title="On your shelf" accent="sky">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {shelf.map((it) => <CoverCard key={it.id} item={it} compact onOpen={() => onOpenBook && onOpenBook(it)} />)}
          </div>
        </Card>
      ) : null}

      {/* 6 · FREE CLASSICS */}
      {classicCards.length ? (
        <Card eyebrow="Free, whenever you fancy" title="Free classics" accent="gold">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {classicCards.map((it) => <CoverCard key={it.id} item={it} compact onOpen={() => onOpenBook && onOpenBook(it)} />)}
          </div>
        </Card>
      ) : (!hasBooks ? (
        <Card eyebrow="Your shelf" title="A library to fall into" accent="sky">
          <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.6, margin: 0 }}>Add a book to your shelf, or open a free classic — spoiler-safe, at your pace. Your place is always saved.</p>
        </Card>
      ) : null)}

      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, textAlign: "center", margin: "2px 14px 0", lineHeight: 1.55 }}>A chapter a day through the month, and a shelf that keeps your place — no streaks, no “you're behind.” Lurk, skip, re-read.</p>
    </div>
  );
}
const ordinal = (n) => (n % 10 === 1 && n !== 11) ? "st" : (n % 10 === 2 && n !== 12) ? "nd" : (n % 10 === 3 && n !== 13) ? "rd" : "th";
