// ─────────────────────────────────────────────────────────────────────────────
// StackedExpandDemo.jsx — StackedCard × tap-to-expand. ONE big clipboard card in our
// StackedCard structure: split into TOP (Articles) and BOTTOM (Books) halves by the
// subtle gold hairline. EACH half is its own HORIZONTAL peek sub-slider (edge-peek +
// dots + subtle ‹ › arrows) of FloraCover cover cards → TAP any card → the shared
// full-screen ExpandDetailCard opens (identical expand in both halves). Reuses
// brand/expandCards + FloraCover so it's cohesive with /ClipboardExpandDemo.
// Content only — people/connection must run through the DM safety rails.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef } from "react";
import { T, SERIF, UI, PAPER_BG, Heart } from "@/components/journal/Editorial";
import { OXBLOOD } from "@/components/brand/SliderKit";
import { CoverCard, ExpandDetailCard, SCRIPT } from "@/components/brand/expandCards";
import { cwOf, floraKeyframes, FlowerGlyph } from "@/components/brand/flora";
import { ChevronLeft, ChevronRight, BookOpen, Book } from "lucide-react";

// ── ARTICLES (top half) ──────────────────────────────────────────────────────
const ARTICLES = [
  { id: "art-leave-early", kind: "Read · Essay", Icon: "BookOpen", category: "essay slow read", cw: "cream",
    title: "The quiet power of leaving early", subtitle: "On protecting your evenings without apology.",
    meta: [["BookOpen", "8 min read"], ["Feather", "The FemWell desk"]], chips: ["boundaries", "slow living"],
    body: ["There's a freedom in being first to leave — coat on while the room is still warm, the night still yours.",
      "It isn't rudeness; it's self-trust. You know what tomorrow-you needs, and you give it to her tonight."],
    actions: [{ label: "Read this", Icon: "BookOpen", primary: true }] },
  { id: "art-rest", kind: "Read · Listen", Icon: "Headphones", category: "rest calm wellbeing", cw: "sky",
    title: "How to rest without earning it", subtitle: "Rest isn't a reward for a productive day. Read it, or press play.",
    meta: [["Headphones", "6 min · narrated"], ["Feather", "The FemWell desk"]], chips: ["rest", "burnout", "self-worth"], player: true, duration: 360, playerLabel: "How to rest without earning it",
    body: ["We're taught to spend the day earning the evening — as if collapse is the only permitted stop.",
      "But rest is maintenance, not a medal. You're allowed to stop before you're empty."],
    actions: [{ label: "Read this", Icon: "BookOpen", primary: true }] },
  { id: "art-friendship", kind: "Read · Essay", Icon: "Users", category: "friend belong connection", cw: "coral",
    title: "The friendship recession is real — and fixable", subtitle: "Why adult friendship feels harder, and the small moves that help.",
    meta: [["BookOpen", "9 min read"], ["Users", "1,020 saved"]], chips: ["friendship", "connection"],
    body: ["Adult friendship loses its scaffolding — no shared timetable, no accidental proximity. It has to be chosen, repeatedly.",
      "The fix isn't grand. It's the low-stakes 'thinking of you', the standing Tuesday walk, the text you almost didn't send."],
    actions: [{ label: "Read this", Icon: "BookOpen", primary: true }] },
  { id: "art-money", kind: "Read · Money", Icon: "Sparkles", category: "money career finance", cw: "gold",
    title: "The money talks women aren't taught", subtitle: "Salary, pensions, and asking for more — plainly.",
    meta: [["BookOpen", "11 min read"], ["Feather", "with a UK adviser"]], chips: ["money", "career", "pensions"],
    body: ["The gap isn't only pay — it's information. The questions no one hands us: what's the band, what's the match, what's the number.",
      "You don't need to love spreadsheets. You need three sentences and the nerve to leave a silence after them."],
    actions: [{ label: "Read this", Icon: "BookOpen", primary: true }] },
  { id: "art-identity", kind: "Read · Essay", Icon: "Feather", category: "identity creative self", cw: "plum",
    title: "On growing out of who you were", subtitle: "When the life that fit you stops fitting — and that's allowed.",
    meta: [["BookOpen", "7 min read"], ["Feather", "The FemWell desk"]], chips: ["identity", "change", "seasons"],
    body: ["Outgrowing a version of yourself can feel like a small grief — you liked her, she got you here.",
      "But keeping a shape you've outgrown isn't loyalty; it's a costume. You're allowed to be someone new to yourself."],
    actions: [{ label: "Read this", Icon: "BookOpen", primary: true }] },
];

// ── BOOKS (bottom half) — tied to the Library / book-club language ────────────
const bookMeta = [["Book", "Chapter 1 open"], ["Users", "A room reading along"]];
const bookActions = [{ label: "Talk about it", Icon: "MessageCircle" }, { label: "Open reader", Icon: "Book", primary: true }];
const BOOKS = [
  { id: "bk-hamnet", kind: "Book · Book club", overline: "Book club", Icon: "Book", category: "book fiction", cw: "gold",
    title: "Hamnet", author: "by Maggie O'Farrell", subtitle: "Grief, motherhood, and a marriage, in Warwickshire.",
    meta: bookMeta, chips: ["fiction", "grief", "motherhood"],
    body: ["A boy falls ill, and a mother reads the plague in his skin before anyone will say the word.",
      "We read a chapter a week and talk about it anonymously — no spoilers past where the room is."], actions: bookActions },
  { id: "bk-body", kind: "Book · Non-fiction", overline: "Book club", Icon: "Book", category: "rest mind body wellbeing", cw: "sky",
    title: "The Body Keeps the Score", author: "by Bessel van der Kolk", subtitle: "How the body holds what the mind can't say.",
    meta: bookMeta, chips: ["trauma", "healing", "body"],
    body: ["A landmark on how stress and trauma live in the body — and the routes back toward safety.",
      "Heavy in places; we read it gently, together, and pause when we need to."], actions: bookActions },
  { id: "bk-bigmagic", kind: "Book · Creativity", overline: "Book club", Icon: "Book", category: "creative art make", cw: "plum",
    title: "Big Magic", author: "by Elizabeth Gilbert", subtitle: "Creative living beyond fear — a permission slip.",
    meta: bookMeta, chips: ["creativity", "courage"],
    body: ["Gilbert's case that curiosity, not fearlessness, is the engine — and that making things is its own reward.",
      "A light, warm read for anyone who's been meaning to start the thing."], actions: bookActions },
  { id: "bk-wintering", kind: "Book · Memoir", overline: "Book club", Icon: "Book", category: "rest season nature", cw: "sage",
    title: "Wintering", author: "by Katherine May", subtitle: "On the power of rest and retreat in the fallow times.",
    meta: bookMeta, chips: ["rest", "seasons", "recovery"],
    body: ["May reframes the hard, quiet seasons as wintering — not failure, but a doing of necessary underground work.",
      "It pairs beautifully with the garden's 'a resting season is still a season'."], actions: bookActions },
  { id: "bk-detrans", kind: "Book · Fiction", overline: "Book club", Icon: "Book", category: "book fiction identity", cw: "coral",
    title: "Detransition, Baby", author: "by Torrey Peters", subtitle: "Motherhood, womanhood, and a very modern family.",
    meta: bookMeta, chips: ["fiction", "family", "identity"],
    body: ["Three lives tangle around an unexpected pregnancy in a sharp, funny, tender novel about who gets to be a mother.",
      "A room favourite for the honest, messy conversations it opens."], actions: bookActions },
];

// ── PEEK sub-slider — edge-peek + dots + subtle ‹ › arrows (one per StackedCard half) ──
function PeekRow({ items, accent, onOpen, label }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const last = items.length - 1;
  const kids = () => (trackRef.current ? [...trackRef.current.children].filter((c) => c.offsetWidth > 40) : []);
  const onScroll = () => { const el = trackRef.current; if (!el) return; let best = 0, bd = Infinity; kids().forEach((c, i) => { const d = Math.abs(c.offsetLeft - el.offsetLeft - el.scrollLeft); if (d < bd) { bd = d; best = i; } }); if (best !== active) setActive(best); };
  const goTo = (i) => { const idx = Math.max(0, Math.min(last, i)); setActive(idx); const el = trackRef.current; const c = kids()[idx]; if (el && c) el.scrollLeft = c.offsetLeft - el.offsetLeft; };
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2px 6px" }}>
        <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: accent }}>{label}</span>
        <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.muted }}>{active + 1} / {items.length}</span>
      </div>
      <div ref={trackRef} onScroll={onScroll} className="fw-peek-track" style={{ display: "flex", gap: 12, overflowX: "auto", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain", scrollbarWidth: "none", padding: "2px 0" }}>
        <style>{`.fw-peek-track::-webkit-scrollbar{display:none}`}</style>
        {items.map((it) => (
          <div key={it.id} style={{ flex: "0 0 82%", maxWidth: 300, scrollSnapAlign: "start", display: "flex" }}>
            <CoverCard item={it} compact onOpen={() => onOpen(it)} />
          </div>
        ))}
        <div aria-hidden style={{ flex: "0 0 4px" }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "8px 0 0" }}>
        <button onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous" style={arrow(active === 0)}><ChevronLeft size={15} /></button>
        <div style={{ display: "flex", gap: 6 }}>
          {items.map((_, i) => <button key={i} onClick={() => goTo(i)} aria-label={`Card ${i + 1}`} style={{ width: i === active ? 16 : 6, height: 6, borderRadius: 999, border: "none", padding: 0, background: i === active ? accent : T.paperDeep, cursor: "pointer", transition: "width .2s" }} />)}
        </div>
        <button onClick={() => goTo(active + 1)} disabled={active === last} aria-label="Next" style={arrow(active === last)}><ChevronRight size={15} /></button>
      </div>
    </div>
  );
}
const arrow = (disabled) => ({ width: 28, height: 28, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: disabled ? "transparent" : "rgba(244,239,227,0.9)", color: disabled ? T.paperDeep : T.gold, display: "grid", placeItems: "center", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1 });

export default function StackedExpandDemo() {
  const [open, setOpen] = useState(null);   // the item being expanded
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  const gold = cwOf("gold").petal, book = cwOf("plum").petal;

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", paddingBottom: 60 }}>
      <style>{floraKeyframes}{`.fw-ce-press{transition:transform .12s ease}.fw-ce-press:active{transform:scale(0.98)}`}</style>

      <div style={{ maxWidth: 440, margin: "0 auto", padding: "16px 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/Ideas" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.muted, textDecoration: "none" }}><ChevronLeft size={15} /> Ideas</a>
        <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: T.gold }}>Founder demo · Stacked × expand</span>
      </div>

      <div style={{ maxWidth: 440, margin: "0 auto", padding: "8px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <Heart size={15} />
          <span style={{ fontFamily: SCRIPT, fontSize: 40, color: OXBLOOD, lineHeight: 1 }}>Reads &amp; Books</span>
        </div>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, color: T.muted, lineHeight: 1.5, margin: "6px 0 4px", maxWidth: 340 }}>
          One card, two shelves. Swipe each row sideways to browse; tap any cover — it opens into the whole thing. Articles up top, the book club below.
        </p>
      </div>

      {/* ONE big clipboard card — StackedCard structure (two halves + gold hairline) */}
      <div style={{ maxWidth: 440, margin: "0 auto", padding: "10px 16px 0" }}>
        <div style={{ position: "relative", background: `linear-gradient(165deg, ${T.paperHi} 0%, ${gold}12 100%)`, border: `1px solid ${T.paperDeep}`, borderRadius: 22, padding: "16px 15px 18px", boxShadow: "0 10px 30px rgba(58,44,26,.12), 0 2px 6px rgba(58,44,26,.06)", overflow: "hidden" }}>
          <span aria-hidden style={{ position: "absolute", top: -6, right: -6, opacity: 0.5, lineHeight: 0 }}><FlowerGlyph variant="camellia" size={30} color={gold} idx="stk-corner" /></span>
          {/* board header — the "clip" */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span aria-hidden style={{ width: 34, height: 9, borderRadius: 4, background: gold, boxShadow: "inset 0 -2px 0 rgba(0,0,0,.15)" }} />
            <div>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600, fontSize: 19, color: OXBLOOD, lineHeight: 1 }}>Your reading table</div>
              <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: T.muted, textTransform: "uppercase" }}>Articles · Books</div>
            </div>
          </div>

          {/* TOP half — Articles */}
          <PeekRow items={ARTICLES} accent={gold} label="Articles" onOpen={setOpen} />

          {/* the quiet gold hairline between the halves */}
          <div aria-hidden style={{ height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`, opacity: 0.5, margin: "14px 0" }} />

          {/* BOTTOM half — Books */}
          <PeekRow items={BOOKS} accent={book} label="Book club" onOpen={setOpen} />
        </div>
      </div>

      <p style={{ textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "18px auto 0", maxWidth: 320, lineHeight: 1.5 }}>
        Same swipe, same tap-to-open in both shelves. Content only — people &amp; connection run through the DM safety rails.
      </p>

      {open && <ExpandDetailCard item={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
