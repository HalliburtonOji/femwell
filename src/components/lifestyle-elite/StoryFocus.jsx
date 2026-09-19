// StoryFocus — the bespoke §19 surface for the Story chip. The daily serial, complete and inline:
// a section-specific summary of where she is, today's chapter (taster + cliffhanger + read it),
// continue-where-she-left-off, then the whole serial with her read/unread state — deliberately
// ordered now → continue → the serial → about. Reads real progress (localStorage read-marks +
// which chapter today lands on). Reading itself opens the immersive DailyStoryReader (the reading
// experience, like Books → BookReader) — everything ABOUT the story is inline, nothing shelf-hidden.
import React from "react";
import { Feather, BookOpen, Check, ChevronRight, PlayCircle } from "lucide-react";
import { isChapterRead, chapterLabel, framingLine, readCount } from "@/components/lifestyle/dailyStory";
import { T, SERIF, UI, PAPER_TEX } from "@/components/journal/Editorial";
import { cwOf, CardFrame } from "@/components/brand/flora";

const OX = "#7A1A12";
const clean = (s) => String(s || "").replace(/<[^>]+>/g, "").replace(/\*(.+?)\*/g, "$1").replace(/\s+/g, " ").trim();
const paras = (s) => String(s || "").replace(/<[^>]+>/g, "").split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

function StoryCard({ eyebrow, title, accent = "crimson", children, style }) {
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

// `onRead(index)` opens the immersive reader at chapter `index` (defaults to today).
export default function StoryFocus({ chapters = [], story, pick, nextPick, onRead }) {
  const total = chapters.length;
  if (!story || !total) {
    return (
      <StoryCard eyebrow="Today's chapter" title="On its way" accent="crimson">
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.6, margin: 0 }}>Today's instalment lands each morning — check back shortly, and you can always read the story straight through.</p>
      </StoryCard>
    );
  }

  const todayIdx = pick?.index ?? 0;
  const readSoFar = readCount(chapters, pick);
  const readToday = isChapterRead(story.id);
  const series = story.series_title || "Today's story";
  const label = chapterLabel(pick) || (story.day_number ? `Chapter ${story.day_number}` : "Today's chapter");
  const taster = paras(story.segment_text).slice(0, 2);
  const framing = clean(framingLine(pick));
  // first unread chapter (continue) — else next
  const firstUnread = chapters.findIndex((c) => c?.id && !isChapterRead(c.id));
  const continueIdx = nextPick?.index != null ? nextPick.index : (firstUnread >= 0 ? firstUnread : null);
  const continueCh = continueIdx != null && continueIdx !== todayIdx ? chapters[continueIdx] : null;

  const summary = readToday
    ? `You've read ${label.toLowerCase()} — ${readSoFar} of ${total} chapters in. Read on, or begin it again.`
    : `${label} landed this morning${story.cliffhanger ? ` — it picks up on “${clean(story.cliffhanger)}”` : ""}. You're ${readSoFar} of ${total} in.`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 0 · section-specific, stateful summary */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "2px 2px" }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: `${cwOf("crimson").petal}1f`, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2 }}><Feather size={18} color={cwOf("crimson").petal} /></span>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, color: OX, lineHeight: 1.5, margin: 0 }}>{summary}</p>
      </div>

      {/* 1 · TODAY'S CHAPTER — the hero, with a real taster */}
      <StoryCard eyebrow={`${series} · ${label}`} title={story.title && story.title !== series ? story.title : "New this morning"} accent="crimson">
        {framing ? <p style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, margin: "0 0 8px" }}>{framing}</p> : null}
        {taster.map((p, i) => <p key={i} style={{ fontFamily: SERIF, fontSize: 16.5, color: T.inkSoft, lineHeight: 1.62, margin: "0 0 10px" }}>{p}</p>)}
        <button onClick={() => onRead && onRead(todayIdx)} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", minHeight: 48, background: cwOf("crimson").petal, color: "#fff", border: "none", borderRadius: 12, fontFamily: UI, fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 2 }}>
          <BookOpen size={16} /> {readToday ? "Read it again" : "Read today's chapter"}
        </button>
      </StoryCard>

      {/* 2 · CONTINUE — where she left off (only if there's an earlier unread) */}
      {continueCh ? (
        <button onClick={() => onRead && onRead(continueIdx)} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", cursor: "pointer", background: T.paperHi, border: `1px solid ${T.line}`, borderLeft: `4px solid ${cwOf("plum").petal}`, borderRadius: 14, padding: "13px 15px" }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: `${cwOf("plum").petal}1f`, display: "grid", placeItems: "center", flexShrink: 0 }}><PlayCircle size={18} color={cwOf("plum").petal} /></span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "#A8893F" }}>Pick up where you left off</span>
            <span style={{ display: "block", fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink }}>{chapterLabel({ chapter: continueCh, index: continueIdx }) || `Chapter ${continueCh.day_number || continueIdx + 1}`}</span>
          </span>
          <ChevronRight size={16} color={T.paperDeep} />
        </button>
      ) : null}

      {/* 3 · THE SERIAL — every chapter, her read/unread state, read straight through */}
      <StoryCard eyebrow="The whole story" title={`${series} · ${total} chapters`} accent="plum">
        <div style={{ display: "flex", flexDirection: "column" }}>
          {chapters.map((c, i) => {
            const read = c?.id ? isChapterRead(c.id) : false;
            const isToday = i === todayIdx;
            return (
              <button key={c.id || i} onClick={() => onRead && onRead(i)} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left", cursor: "pointer", background: "transparent", border: "none", borderTop: i === 0 ? "none" : `1px solid ${T.paperDeep || "#D8CFBC"}`, padding: "11px 2px" }}>
                <span style={{ width: 26, height: 26, borderRadius: 8, background: read ? `${cwOf("sage").petal}22` : `${T.paper}`, border: `1px solid ${read ? cwOf("sage").petal : T.line}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  {read ? <Check size={14} color={cwOf("sage").petal} /> : <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, color: T.muted }}>{c.day_number || i + 1}</span>}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: SERIF, fontSize: 15.5, fontWeight: isToday ? 700 : 600, color: T.ink, lineHeight: 1.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title || chapterLabel({ chapter: c, index: i }) || `Chapter ${c.day_number || i + 1}`}</span>
                  {isToday ? <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: cwOf("crimson").petal }}>New today</span> : (read ? <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>Read</span> : null)}
                </span>
                <ChevronRight size={15} color={T.paperDeep} />
              </button>
            );
          })}
        </div>
        <button onClick={() => onRead && onRead(0)} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", minHeight: 44, marginTop: 12, background: "transparent", border: `1px dashed ${cwOf("plum").petal}`, borderRadius: 12, cursor: "pointer", fontFamily: UI, fontSize: 13.5, fontWeight: 700, color: cwOf("plum").petal }}>
          Read straight through from Chapter 1
        </button>
      </StoryCard>

      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, textAlign: "center", margin: "2px 14px 0", lineHeight: 1.55 }}>A finished story, a chapter a day — no streaks, no “you're behind.” Lurk, skip, re-read; it keeps.</p>
    </div>
  );
}
