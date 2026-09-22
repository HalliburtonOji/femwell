// BooksStoryFocus — Books + Story as ONE composed surface in the clean language (§2.7 · §19).
//
// Halli 2026-09-22, three corrections that shape this file:
//  1. SMART TO HER, NOT THE CALENDAR. Chapters unlock daily, but her reading POSITION is her own
//     (`readingPosition`): if she misses days, reopening waits at her next unread chapter and she
//     catches up one at a time via a booklike ‹ › flip — never auto-advanced past unread. If she's
//     behind: a gentle "3 waiting for you". Caught up: "chapter 13 opens tomorrow."
//  2. NO WALL, NO DUPLICATES. The old list rendered every active series interleaved ("Chapter 9 of
//     60, Chapter 9 of 60") — a real bug. The run is now scoped to THIS run's series (pick.seriesKey
//     via readingPosition's pool) and drawn as a compact numbered strip: read / next / open /
//     unlocks-daily, + at most two "up next" rows + one quiet straight-through link.
//  3. BOOKS = FEW, CURATED. Four a month: one featured (a real hook, starts reading in place), two
//     compact, and the month's last book REVEALED on a set day ("tiny reveals"). Her own shelf and
//     the whole free library sit behind one quiet link, not on the page.
import React, { useMemo } from "react";
import { Feather, BookOpen, ChevronLeft, ChevronRight, Check, Library, Play } from "lucide-react";
import { readingPosition, isChapterRead, framingLine } from "@/components/lifestyle/dailyStory";
import { SERIF, UI } from "@/components/journal/Editorial";
import { C } from "@/components/brand/cleanTokens";
import { Eyebrow, Title, Body, Card, Block, Summary, Cta, Quiet, Foot, Leaf, Fleuron } from "@/components/brand/cleanKit";

const clean = (s) => String(s || "").replace(/<[^>]+>/g, "").replace(/\*(.+?)\*/g, "$1").replace(/\s+/g, " ").trim();
const paras = (s) => String(s || "").replace(/<[^>]+>/g, "").split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
const isBook = (c) => /book/i.test(c?.type || "") || !!c?._book || /book/i.test(c?._continue?.type || "") || !!c?._continue?._book;
const isSerial = (c) => /daily_story|story/i.test(c?.type || "") || c?.id === "daily-chapter";
const ord = (n) => (n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th");
// the month's last book is REVEALED on the 4th Sunday — a paced surfacing, not a shelf dump
function revealDay(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  let sundays = 0;
  for (let i = 1; i <= new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(); i++) {
    d.setDate(i); if (d.getDay() === 0) { sundays++; if (sundays === 4) return i; }
  }
  return 28;
}

// ── the run strip — this run's series only, compact, never a wall ──────────────────────────────
function RunStrip({ pool, unlockedCount, nextIndex, onOpen }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "7px 5px", margin: "4px 0 12px" }}>
      {pool.map((c, i) => {
        const read = c?.id ? isChapterRead(c.id) : false;
        const locked = i >= unlockedCount;
        const isNext = i === nextIndex;
        const s = { aspectRatio: "1", borderRadius: 999, display: "grid", placeItems: "center", fontFamily: UI, fontSize: 10, fontWeight: 700, cursor: locked ? "default" : "pointer", border: "none", padding: 0 };
        const style = isNext ? { ...s, background: C.ink, color: "#fff", boxShadow: `0 0 0 2px ${C.ground}, 0 0 0 3.5px ${C.ink}` }
          : read ? { ...s, background: "#DCE8DC", color: "#3E6B4A" }
          : locked ? { ...s, background: "transparent", border: `1px dashed ${C.hair}`, color: C.faint }
          : { ...s, background: "transparent", border: `1px solid ${C.ink}`, color: C.ink };
        return (
          <button key={c.id || i} disabled={locked} onClick={() => !locked && onOpen && onOpen(i)} className="fw-elite-press"
            aria-label={`Chapter ${c.day_number || i + 1}${read ? " — read" : locked ? " — unlocks later" : ""}`} style={style}>
            {read && !isNext ? <Check size={11} /> : (c.day_number || i + 1)}
          </button>
        );
      })}
    </div>
  );
}
const Legend = () => (
  <div style={{ display: "flex", gap: 12, justifyContent: "center", fontFamily: UI, fontSize: 11, color: C.slate, margin: "0 0 12px" }}>
    {[["#DCE8DC", "read", false], [C.ink, "next", false], ["transparent", "open", "solid"], ["transparent", "unlocks daily", "dashed"]].map(([bg, label, border]) => (
      <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
        <i style={{ width: 9, height: 9, borderRadius: 99, background: bg, border: border ? `1px ${border} ${border === "dashed" ? C.hair : C.ink}` : "none", display: "inline-block" }} />{label}
      </span>
    ))}
  </div>
);

// ── a book cover (flora, never a photo — §6.7.7 hard rule 1) ───────────────────────────────────
function Cover({ item, w = 84, h = 118 }) {
  const seed = String(item?.title || "").length % 4;
  const tints = [["#F3EADF", "#DCC7B0"], ["#E9EFE8", "#BACCBA"], ["#EEE7EF", "#CAB8CC"], ["#F5EEE0", "#E3C692"]];
  const [a, b] = tints[seed];
  return (
    <div style={{ width: w, height: h, borderRadius: 10, flexShrink: 0, position: "relative", overflow: "hidden", background: `linear-gradient(160deg, ${a}, ${b})` }}>
      <svg viewBox="0 0 84 118" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden>
        <path d={`M42 ${h} C42 ${h * 0.82} 40 ${h * 0.72} 42 ${h * 0.6}`} stroke="#6F9A78" strokeWidth="1.6" fill="none" />
        <g transform={`translate(42 ${h * 0.56})`} fill="#C97A84" opacity=".92">
          <path d="M0 0 C-10 -6 -16 -20 -8 -30 C-1 -22 0 -10 0 0Z" /><path d="M0 0 C10 -6 16 -20 8 -30 C1 -22 0 -10 0 0Z" /><path d="M0 -3 C-6 -14 -3 -26 0 -29 C3 -26 6 -14 0 -3Z" />
        </g>
        <circle cx="42" cy={h * 0.53} r="3.5" fill="#B8912E" />
      </svg>
    </div>
  );
}

export default function BooksStoryFocus({ chapters = [], story, pick, onRead, continueCards = [], shelfBookCards = [], classicCards = [], onOpenBook }) {
  const pos = useMemo(() => readingPosition(chapters, pick), [chapters, pick, story]);
  const contBooks = (continueCards || []).filter(isBook);
  const shelf = (shelfBookCards || []).filter((c) => !isSerial(c));   // BOOKS ONLY — the serial is a serial
  // FEW + CURATED: four a month. Continue-reading leads when it exists; the last is a paced reveal.
  const pool = [...contBooks, ...shelf, ...classicCards];
  const monthly = pool.slice(0, 4);
  const reveal = revealDay();
  const revealed = new Date().getDate() >= reveal;
  const shown = revealed ? monthly : monthly.slice(0, 3);
  const featured = shown[0] || null;
  const rest = shown.slice(1, 3);
  const hidden = !revealed && monthly.length >= 4;

  const series = story?.series_title || pos?.chapter?.series_title || "Today's story";
  const her = pos?.chapter || story || null;
  const herN = her?.day_number ?? (pos ? pos.index + 1 : 1);
  const total = pos?.total ?? chapters.length;
  const waiting = pos?.waiting || 0;
  const caughtUp = !!pos?.caughtUp;

  const summary = !pos && !pool.length
    ? "Today's chapter lands each morning, and your shelf fills as you add books — a chapter a day, at your pace."
    : pos
      ? (pick?.complete
        ? `“${series}” has closed for ${pick.monthName || "the month"} — read it straight through whenever; a new run begins on the 1st.`
        : caughtUp
          ? `You're up to date with “${series}” — chapter ${Math.min(herN + 1, total)} opens tomorrow.`
          : waiting > 1
            ? `You're at chapter ${herN} of ${series} — ${waiting} chapters have opened while you were busy. They'll wait. One at a time.`
            : `Chapter ${herN} of ${series} is waiting for you.`)
      : `${shown.length} on this month's shelf${classicCards.length ? ` · free classics inside` : ""}.`;

  const taster = paras(her?.segment_text).slice(0, 1);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Summary Icon={Feather} cw="crimson">{summary}</Summary>

      {/* I · YOUR NEXT CHAPTER — hers, never the calendar's */}
      {pos && her ? (
        <Card wash="crimson">
          <Eyebrow cw="crimson" align="left">Your next chapter</Eyebrow>
          <Title align="left" size={25} style={{ margin: "0 0 4px" }}>{clean(her.title) || `Chapter ${herN}`}</Title>
          <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: C.slate, letterSpacing: ".03em", margin: "0 0 10px" }}>{series} · chapter {herN} of {total}</div>
          {waiting > 1 ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 12, fontWeight: 700, color: C.crimson, background: "#FBEDEB", borderRadius: 999, padding: "4px 10px", marginBottom: 12 }}>{waiting} waiting for you</span>
          ) : caughtUp ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 12, fontWeight: 700, color: C.slate, background: C.sunk, border: `1px solid ${C.hair}`, borderRadius: 999, padding: "4px 10px", marginBottom: 12 }}>Up to date</span>
          ) : null}
          {taster.map((p, i) => <Body key={i} size={16.5} style={{ margin: "0 0 14px" }}>{p}</Body>)}
          {/* the booklike flip — one at a time, forward only once this one's read */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => onRead && onRead(Math.max(0, pos.index - 1))} disabled={pos.index === 0} aria-label="Previous chapter" className="fw-elite-press"
              style={{ width: 44, height: 44, borderRadius: 12, border: `1px solid ${C.hair}`, background: C.surface, color: C.ink, display: "grid", placeItems: "center", cursor: pos.index === 0 ? "default" : "pointer", opacity: pos.index === 0 ? 0.35 : 1, flexShrink: 0 }}><ChevronLeft size={18} /></button>
            <Cta filled Icon={BookOpen} onClick={() => onRead && onRead(pos.index)} style={{ flex: 1 }}>{isChapterRead(her.id) ? "Read it again" : `Read chapter ${herN}`}</Cta>
            <button onClick={() => onRead && onRead(Math.min(pos.unlockedCount - 1, pos.index + 1))} disabled={!isChapterRead(her.id) || pos.index >= pos.unlockedCount - 1} aria-label="Next chapter" className="fw-elite-press"
              style={{ width: 44, height: 44, borderRadius: 12, border: `1px solid ${C.hair}`, background: C.surface, color: C.ink, display: "grid", placeItems: "center", cursor: "pointer", opacity: (!isChapterRead(her.id) || pos.index >= pos.unlockedCount - 1) ? 0.35 : 1, flexShrink: 0 }}><ChevronRight size={18} /></button>
          </div>
          <div style={{ fontFamily: UI, fontSize: 11, color: C.faint, textAlign: "center", margin: "10px 0 0" }}>‹ re-read · › moves on once this one's read</div>
        </Card>
      ) : (
        <Card>
          <Eyebrow cw="crimson" align="left">Today's chapter</Eyebrow>
          <Title align="left">On its way</Title>
          <Body>Today's instalment lands each morning — a chapter a day through the month, and you can always read the story straight through.</Body>
        </Card>
      )}

      {pos ? <Leaf my={22} /> : null}

      {/* II · THE RUN — compact, this series only */}
      {pos ? (
        <Block>
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
          <div style={{ fontFamily: UI, fontSize: 11, color: C.faint, textAlign: "center", marginTop: 8 }}>{clean(framingLine(pick))}</div>
        </Block>
      ) : null}

      <Fleuron my={24} />

      {/* III · THIS MONTH'S SHELF — few, curated, one paced reveal */}
      <Block>
        <Eyebrow cw="gold">This month's shelf{shown.length ? ` · ${monthly.length} books` : ""}</Eyebrow>
        {featured ? (
          <>
            <div style={{ display: "flex", gap: 14 }}>
              <Cover item={featured} />
              <div style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
                <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 19, lineHeight: 1.15, color: C.ink }}>{clean(featured.title)}</div>
                <div style={{ fontFamily: UI, fontSize: 11.5, color: C.slate, margin: "2px 0 8px" }}>{clean(featured.subtitle) || "Free classic"}</div>
                <p style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 500, lineHeight: 1.5, color: C.ink, margin: "0 0 10px" }}>{clean(featured.summary || featured.excerpt || "").slice(0, 150) || "A long read to fall into — your place is saved in every one."}</p>
                <button onClick={() => onOpenBook && onOpenBook(featured)} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 700, color: C.ink, marginTop: "auto" }}><Play size={13} /> {featured._continue ? "Pick up where you left off" : "Start reading"}</button>
              </div>
            </div>
            {(rest.length || hidden) ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.hair}` }}>
                {rest.map((b) => (
                  <button key={b.id} onClick={() => onOpenBook && onOpenBook(b)} className="fw-elite-press" style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
                    <Cover item={b} w="100%" h={96} />
                    <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 13.5, lineHeight: 1.15, color: C.ink, margin: "7px 0 2px" }}>{clean(b.title)}</div>
                    <div style={{ fontFamily: UI, fontSize: 10.5, color: C.slate }}>{clean(b.subtitle) || "Free classic"}</div>
                  </button>
                ))}
                {hidden ? (
                  <div>
                    <div style={{ border: `1px dashed ${C.goldHair}`, borderRadius: 10, height: 96, display: "grid", placeItems: "center", textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: C.slate, padding: 8, lineHeight: 1.3 }}>A new book arrives on the {reveal}{ord(reveal)}</div>
                    <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 13.5, color: C.faint, margin: "7px 0 2px" }}>Not yet</div>
                    <div style={{ fontFamily: UI, fontSize: 10.5, color: C.faint }}>the month's last reveal</div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </>
        ) : (
          <Body style={{ textAlign: "center", color: C.slate }}>This month's shelf is being chosen — a few books, not a wall. Your saved reads are always in Yours.</Body>
        )}
        <Quiet onClick={() => onOpenBook && onOpenBook({ _library: true })}>Yours &amp; the whole library ›</Quiet>
      </Block>

      <Foot>A chapter a day while the run's open — but your place is yours. No streaks, no “you're behind.”</Foot>
    </div>
  );
}
