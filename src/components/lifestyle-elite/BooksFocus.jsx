// BooksFocus — the bespoke §19 surface for the Books chip. Her library: continue the book she's
// mid-chapter on (resumes in place), then her shelf (FemWell fiction + saved), then a wall of free
// classics to fall into. Deliberately ordered continue → shelf → classics. Reads real state (what's
// in progress, what's on her shelf). Tap → opens the immersive reader at her place. Cream design,
// the real CoverCard covers.
import React from "react";
import { Library, BookMarked } from "lucide-react";
import { CoverCard } from "@/components/brand/expandCards";
import { T, SERIF, UI, PAPER_TEX } from "@/components/journal/Editorial";
import { cwOf, CardFrame } from "@/components/brand/flora";

const OX = "#7A1A12";
const isBook = (c) => /book/i.test(c?.type || "") || !!c?._book || /book/i.test(c?._continue?.type || "") || !!c?._continue?._book;

function BooksCard({ eyebrow, title, accent = "sky", children }) {
  const petal = cwOf(accent).petal;
  return (
    <section style={{ position: "relative", overflow: "hidden", background: T.paperHi || "#F4EFE3", border: `1px solid ${T.line || "#d8cfbc"}`, borderLeft: `4px solid ${petal}`, borderRadius: 18, padding: "16px 17px", boxShadow: "0 6px 22px rgba(58,44,26,.08), 0 1px 3px rgba(58,44,26,.05)" }}>
      <span aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: `url(${PAPER_TEX})`, backgroundSize: "180px", mixBlendMode: "multiply", opacity: 0.4, pointerEvents: "none" }} />
      <CardFrame color={petal} opacity={0.4} size={40} />
      <div style={{ position: "relative" }}>
        {eyebrow ? <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#A8893F", marginBottom: 6 }}>{eyebrow}</div> : null}
        {title ? <h3 style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 600, color: T.ink, lineHeight: 1.2, margin: "0 0 12px" }}>{title}</h3> : null}
        {children}
      </div>
    </section>
  );
}

export default function BooksFocus({ continueCards = [], shelfBookCards = [], classicCards = [], onOpen }) {
  const contBooks = (continueCards || []).filter(isBook);
  const hasAny = contBooks.length || shelfBookCards.length || classicCards.length;
  if (!hasAny) {
    return (
      <BooksCard eyebrow="Your shelf" title="A library to fall into">
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.6, margin: 0 }}>Add a book to your shelf, or open a free classic — a chapter a day, spoiler-safe, at your pace. Your place is always saved.</p>
      </BooksCard>
    );
  }
  const summary = contBooks.length
    ? `Pick up ${contBooks[0].title} — you're part-way through. ${classicCards.length} free classic${classicCards.length === 1 ? "" : "s"} waiting.`
    : `${shelfBookCards.length} on your shelf · ${classicCards.length} free classic${classicCards.length === 1 ? "" : "s"} to fall into.`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 0 · section-specific, stateful summary */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "2px 2px" }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: `${cwOf("sky").petal}1f`, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2 }}><Library size={18} color={cwOf("sky").petal} /></span>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, color: OX, lineHeight: 1.5, margin: 0 }}>{summary}</p>
      </div>

      {/* 1 · CONTINUE — the book she's mid-chapter on, resumes in place */}
      {contBooks.length ? (
        <BooksCard eyebrow="Pick up where you left off" title="Reading now" accent="sky">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {contBooks.map((it) => <CoverCard key={it.id} item={it} onOpen={() => onOpen && onOpen(it)} />)}
          </div>
        </BooksCard>
      ) : null}

      {/* 2 · YOUR SHELF */}
      {shelfBookCards.length ? (
        <BooksCard eyebrow="Yours to read" title="On your shelf" accent="sky">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {shelfBookCards.map((it) => <CoverCard key={it.id} item={it} compact onOpen={() => onOpen && onOpen(it)} />)}
          </div>
        </BooksCard>
      ) : null}

      {/* 3 · FREE CLASSICS */}
      {classicCards.length ? (
        <BooksCard eyebrow="Free, whenever you fancy" title="Free classics" accent="gold">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {classicCards.map((it) => <CoverCard key={it.id} item={it} compact onOpen={() => onOpen && onOpen(it)} />)}
          </div>
        </BooksCard>
      ) : null}

      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, textAlign: "center", margin: "2px 14px 0", lineHeight: 1.55 }}>A chapter a day, spoiler-safe, no streaks — lurk, skip, re-read. Your place is saved in every one.</p>
    </div>
  );
}
