// LifestyleEliteShell — the ELEVATED, FULLY-WIRED Lifestyle page. The exact Lifestyle analogue of
// PlannerEliteShell / NutritionEliteShell: self-loading against the SAME real base44 entities the live
// (build nonce 2026-06-28a — force base44 rebuild)
// Lifestyle page uses (LifestyleItems · DailyStory · HoroscopeReading · UserProfile.saved_item_ids +
// public-domain gutendex books); the Save/bookmark control PERSISTS (optimistic write + try/catch
// rollback + a flash() toast). Rendered by /LifestyleElite (parallel test route) while the live
// "Lifestyle" mapping stays untouched.
//
// Craft elevated ~3 levels over the demo: lush flora hero (phase bloom + bouquet + resting creature),
// dimensional Clipboard cards, oxblood script headings, the full card language (two stacked horizontal
// sub-sliders per board + gold hairline divider + board ‹ › arrows + colour pills + accent-rim
// sub-cards + INLINE media players), tasteful reduced-motion-safe motion. ALL surfaces, STRIP NOTHING.
//
// SURFACES carried forward from live Lifestyle (Lifestyle.jsx) + the approved LifestyleNewDemo:
//   For you (editorial pick + more) · Saved · Try this · For-your-phase · Articles · Stories · Books
//   (FemWell fiction + gutendex public-domain) · Guides · Podcasts (inline player) · Videos (inline
//   player) · Trending on TikTok · Listen externally · Daily Story (today's chapter) · A day for you
//   · Horoscope (sun/moon/rising triad + weather + cycle↔moon) · Sky diary.
//
// REAL DATA (no new base44 function — same entities + the same save mechanism the live page uses):
//   • LifestyleItems.filter({ status: "PUBLISHED" }, "-engagement_score", 60) → grouped per type.
//   • DailyStory.filter({}, "-created_date", 1) → today's chapter.
//   • HoroscopeReading.filter({}, "-reading_date", 1) → your sky today.
//   • UserProfile → cycle phase (getCurrentCyclePhase) AND saved_item_ids (the SAVE persistence field).
//   • gutendex (women/en) → free public-domain books for the Books lane (guarded, timeboxed).
//   • SAVE/BOOKMARK toggle → persists to UserProfile.saved_item_ids (exact live mechanism; see
//     Lifestyle.jsx ArticleSheet.handleSave) — optimistic + rollback + flash, like Nutrition's toggleShop.
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  BookOpen, Feather, Book, Film, Headphones, Moon, Heart, Sparkles, Sun, Bookmark,
  Wind, ChevronRight, ChevronLeft, Music2, Compass, Loader, ExternalLink, Clock, Coffee, Sunset, Check, Star,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import LifestyleMedia from "@/components/lifestyle-elite/LifestyleMedia";
// the clipboard's card language (§6.7.7) — consumed, never duplicated
import { CoverCard, ExpandDetailCard } from "@/components/brand/expandCards";
import FaceOverlay from "@/components/brand/FaceOverlay";
// the Daily Story — ONE gating contract + the real immersive reader (component #5)
import { DAILY_STORY_SERIES, loadStoryChapters, chapterForDay, nextChapterOf, chapterLabel, framingLine, markChapterRead, isChapterRead, readCount } from "@/components/lifestyle/dailyStory";
import DailyStoryReader from "@/components/lifestyle/DailyStoryReader";
import { buildBookChapters } from "@/components/lifestyle/bookChapters";
// the sky (component #6) — the REAL horoscope reader (15 sections + birth-chart onboarding),
// dark since ~2026-06-20. Moon phase is computed client-side (synodic, no backend).
import HoroscopeTab from "@/components/horoscope/HoroscopeTab";
import { getMoonPhase } from "@/utils/astrology";
import ReadingColumn from "@/components/brand/ReadingColumn";
import { LIFESTYLE_VIDEOS } from "@/data/lifestyleVideos";
// the REAL curated shows (12, with Apple/Spotify deep-links) — the rail already owned them;
// this page had been carrying a 2-item stub instead. Correcting that.
import { EXTERNAL_PODCASTS } from "@/components/lifestyle/listen/ExternalPodcastsRail";
import { T, SERIF, UI, PAPER_BG, Eyebrow } from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { ClipboardSlider, Clipboard } from "@/components/brand/ClipboardSlider";
import { cwOf, floraKeyframes, Bouquet, Pollinator } from "@/components/brand/flora";
import MonthlyCalendarCard from "@/components/planner/MonthlyCalendarCard";
import DayDetailSheet from "@/components/planner/DayDetailSheet";
import { getCurrentCyclePhase, phaseLabel } from "@/utils/cyclePhase";
import { withTimeout } from "@/utils/safeEntity";
import { createPageUrl } from "@/utils";
// "Mark as read" must actually MARK IT READ — this is the same recorder the Garden reads
// (readingDaySet), so a chapter she finishes really does feed her garden.
import { recordProgress } from "@/components/community/readingActivity";
import {
  OXBLOOD, lbl, subCard, focusPill, inputBase, Pill, Panel, StackedCard, BoardBody, TopChrome, SheetShell,
  JumpSheet, SliderArrows, makeCalendarOverlay,
} from "@/components/brand/SliderKit";

const CalendarOverlay = makeCalendarOverlay(MonthlyCalendarCard, DayDetailSheet);

// ── tasteful, reduced-motion-safe motion ─────────────────────────────────────
const ELITE_MOTION = `
@keyframes fwEliteIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform:none; } }
.fw-elite-in { animation: fwEliteIn .5s cubic-bezier(.4,0,.2,1) both; }
.fw-elite-press { transition: transform .12s ease; }
.fw-elite-press:active { transform: scale(.97); }
@media (prefers-reduced-motion: reduce){ .fw-elite-in{ animation:none } .fw-elite-press{ transition:none } }
`;

// phase → bloom/colourway + a gentle "kind of day" line for the hero (same semantic phase set as Nutrition)
const PHASE_BLOOM = {
  menstrual: { bloom: "poppy", cw: "crimson", hue: "#BC2E27", day: "a slow, inward kind of day" },
  follicular: { bloom: "snowdrop", cw: "sage", hue: "#8FAF8F", day: "a fresh-start, bright kind of day" },
  ovulatory: { bloom: "sunflower", cw: "gold", hue: "#D4AF37", day: "an open, sociable kind of day" },
  luteal: { bloom: "dahlia", cw: "plum", hue: "#8E6E8E", day: "an evening-in kind of day" },
};
const phaseMeta = (key) => PHASE_BLOOM[key] || PHASE_BLOOM.follicular;

let _lifeHeroCard = 0; // which controller chip drives the hero (module-scoped: survives remounts)

// ── seeded fallbacks (only used when an entity surface returns nothing — keeps every lens warm) ──
// Track A "de-hardcode + rotate" — WHOLE-LIFE pools (Mx Storyteller, content_good_life_pools.md),
// rotated daily via rotateDaily() so the good-life room is fresh, not the same three forever.
const TRY_THIS = [
  { title: "Write one line you're proud of", cw: "crimson" },
  { title: "Ten minutes outside, no phone", cw: "sage" },
  { title: "Text the friend you've been meaning to", cw: "gold" },
  { title: "Wear the good earrings on a nothing day", cw: "blush" },
  { title: "Play the song you loved at fifteen", cw: "plum" },
  { title: "Buy the flowers, not for an occasion", cw: "crimson" },
  { title: "Learn the name of a tree on your street", cw: "sage" },
  { title: "Send a voice note instead of a text", cw: "gold" },
  { title: "Take the long way home for no reason", cw: "sky" },
  { title: "Start the book you keep circling", cw: "plum" },
  { title: "Tuck a little something away for future-you", cw: "sage" },
  { title: "Dance to one song in the kitchen", cw: "crimson" },
  { title: "Move one thing back to where it makes you happy", cw: "blush" },
  { title: "Say the idea out loud in the meeting", cw: "gold" },
  { title: "Read one poem, out loud, to no one", cw: "plum" },
  { title: "Watch the sky change for five whole minutes", cw: "sky" },
];
const PERMISSION_SLIPS = [
  "You're allowed a slow Sunday.",
  "Rest isn't the reward for the work — it's part of it.",
  "You're allowed to want more — and to say so out loud.",
  "You're allowed to change your mind. Yesterday's plan isn't a promise.",
  "You're allowed to take up room — the whole of it.",
  "You're allowed a joy that hasn't earned its keep.",
  "You're allowed to say no without a paragraph after it.",
  "You're allowed to be a beginner. That's the price of the fun.",
  "You're allowed to want the quiet life and the big one, both.",
  "You're allowed to leave the party early.",
  "You're allowed to outgrow the version of you people got used to.",
  "You're allowed a day where good enough is the whole goal.",
];
const GUIDES_FALLBACK = [
  { title: "How to start cycle-syncing", source: "Guide · 4 min", why: "the gentle version" },
  { title: "A 5-minute evening reset", source: "Guide · 3 min", why: "wind down without a whole routine" },
  { title: "Reading your luteal week", source: "Guide · 6 min", why: "what to expect, kindly" },
  { title: "Starting a hobby you'll actually keep", source: "Guide · 5 min", why: "low stakes, high joy" },
  { title: "A calmer hour with your money", source: "Guide · 7 min", why: "no dread, no spreadsheet spiral" },
  { title: "Making a friend as a grown-up", source: "Guide · 6 min", why: "it's meant to feel a bit awkward" },
  { title: "Finding your own style, not a trend's", source: "Guide · 5 min", why: "dress a little more like yourself" },
  { title: "Making a room feel like you", source: "Guide · 4 min", why: "small changes, real warmth" },
  { title: "Learning something just for the joy of it", source: "Guide · 5 min", why: "no exam at the end" },
];
const TIKTOKS_FALLBACK = [
  { title: "The 5-minute tidy reset", channel: "@tidyhome", cw: "crimson" },
  { title: "Luteal-week snack ideas", channel: "@cyclefood", cw: "gold" },
  { title: "One-line journaling", channel: "@quietpages", cw: "plum" },
];
const A_DAY = {
  title: "A slow Sunday, just for you", line: "A bath, a book, and nowhere to be.",
  alts: ["A long walk somewhere new", "Cook something that takes all afternoon", "Visit a gallery alone", "A film and an early night",
    "A pottering day — small jobs you actually like, in no order", "A making day — paint, write, bake, nobody watching",
    "A whole day with a friend and no plan", "A wander through town with nowhere to be",
    "A duvet, a stack of books, and the door shut", "A morning market, a long lunch, an afternoon nap"],
};
// seeded sky-diary lines — shown only until the user writes real SkyNotes (which then replace them)
const SKY_DIARY_SEED = ["Last new moon — 'started the side project'", "Full moon felt heavy; rested instead", "A note for tonight's waning moon…"];

// Track A "de-hardcode + rotate": pick `n` items from a pool, offset BY THE DAY, so the
// good-life room's small joys / permission slips / guides are fresh each day rather than the
// same three forever. Deterministic per calendar day (no persistence, cycles through the pool).
const dayOffset = () => Math.floor(Date.now() / 86400000);
const rotateDaily = (pool, n = 3) => {
  const arr = Array.isArray(pool) ? pool.filter(Boolean) : [];
  if (arr.length <= n) return arr;
  const start = dayOffset() % arr.length;
  return Array.from({ length: n }, (_, i) => arr[(start + i) % arr.length]);
};

// Track A "personalise For-you" — real phase-tuning. Measured (measure_phase_tags_coverage.md):
// `phase_tags` is only ~5.6% populated (mostly STORY) AND polluted with non-phase junk
// ("Empowerment", "Communication"…), so we ALLOW-LIST the four canonical phases and only ever
// treat those as a phase. Anything else is not a phase → the shelf stays honestly empty.
const CANON_PHASES = ["menstrual", "follicular", "ovulatory", "luteal"];
const phaseTagsOf = (i) => (Array.isArray(i?.phase_tags) ? i.phase_tags : [])
  .map((t) => String(t).toLowerCase()).filter((t) => CANON_PHASES.includes(t));

// ── helpers for the new persistence (PlannerItems · SkyNote) ──
const nowISO = () => new Date().toISOString();
const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

// the dopamine-menu picker — "what do you have time for?" → a bounded set by time band.
// Each band offers a read · a listen · a make/awe prompt (the read/listen come from loaded content;
// the make/awe is a gentle seeded prompt). NOT an infinite feed.
const TIME_BANDS = [
  { key: "few", label: "A few minutes", sub: "a quick read · one track · a small wonder", Icon: Clock, cw: "sage",
    make: { title: "Notice one beautiful thing right now", line: "A daily awe drop — look up, or out the window." } },
  { key: "fifteen", label: "Fifteen minutes", sub: "an essay · a podcast chapter · a tiny make", Icon: Coffee, cw: "gold",
    make: { title: "Make a proper cup of tea, fully", line: "Romance the mundane — no multitasking." } },
  { key: "evening", label: "A whole evening", sub: "a story · a long listen · a quiet hour", Icon: Sunset, cw: "plum",
    make: { title: "A quiet hour, permission granted", line: "You're allowed an evening that's just yours." } },
];

// ── "Why this is good for you" (piece E) ─────────────────────────────────────
// The honest split, from mnt/femwell/research_piece_e_permission_evidence.md
// (every citation web-checked 2026-07-17): where there's REAL evidence we cite it
// (author + finding), mirroring the sky reader's Helfrich-Förster/Cajochen pattern;
// where there ISN'T we say so plainly as a KINDNESS — never a slogan dressed as
// science. The cycle-phase line is deliberately kindness: no study says pace to your
// cycle, but real documented symptoms make gentleness reasonable (that's the exact
// trap a prior pass nearly shipped as fake science).
const WHY = {
  rest: { cite: { finding: "Properly switching off from work — real mental detachment — predicts better mood, more next-day energy and higher life satisfaction. The rest isn't wasted; it's what lets the rest of you work.", source: "Sonnentag & Fritz, J. Organizational Behavior (2015)" } },
  nature: { cite: { finding: "Time outdoors is tied to better wellbeing — the effect tends to show around two hours across a week, so a short go outside genuinely counts toward it.", source: "White et al., Scientific Reports (2019)" } },
  walk: { cite: { finding: "A single walk reliably lifts mood and eases low feelings, and regular walking is linked to less depression and anxiety.", source: "Meta-analysis, JMIR Public Health (2024)" } },
  savouring: { cite: { finding: "Giving your full attention to one small pleasure — savouring it rather than rushing past — is linked to more positive emotion and wellbeing.", source: "Bryant & Veroff, Savoring (2007)" } },
  connection: { cite: { finding: "Reaching out is valued far more than we expect it to be — and close ties are among the strongest predictors of a long, well life.", source: "Liu et al. (2022); Holt-Lunstad et al. (2010)" } },
  cycle: { kindness: "There's no study that says slow down for your cycle — but real, documented symptoms can make a gentler pace the sensible, kind choice. This is permission, not a prescription." },
  plain: { kindness: "No study here — just a kindness. Leisure is the point; it doesn't have to earn its keep to be allowed." },
};
// title → evidence key (substring match; anything unmapped falls to KINDNESS, never
// to fake science). Awe has its own strong citation but lives on the top-shelf grid.
function whyFor(title = "") {
  const t = title.toLowerCase();
  if (/\bten minutes outside\b|no phone|outside/.test(t)) return WHY.nature;
  if (/long walk|\bwalk\b/.test(t)) return WHY.walk;
  if (/text the friend|friend/.test(t)) return WHY.connection;
  if (/cook something|make a proper cup|tea/.test(t)) return WHY.savouring;
  if (/gentler pace|your .* week|luteal|menstrual|follicular|ovulatory/.test(t)) return WHY.cycle;
  if (/slow sunday|rest|quiet hour|early night|reward for the work/.test(t)) return WHY.rest;
  return WHY.plain;
}

// ── small helpers (mirror Lifestyle.jsx) ─────────────────────────────────────
function stripHtml(str) { return str ? str.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : ""; }
const lfTypeOf = (i) => {
  const m = String(i?.media_type || "").toUpperCase();
  const c = String(i?.content_type || "").toUpperCase();
  if (/PODCAST|AUDIO/.test(m)) return "audio";
  if (/VIDEO|CLIP|TIKTOK|INSTAGRAM|REEL/.test(m)) return "video";
  if (c === "FICTION") return "book";
  if (c === "STORY") return "story";
  if (c === "GUIDE") return "guide";
  return "article";
};
const isTikTok = (i) => /TIKTOK|INSTAGRAM|REEL/.test(String(i?.media_type || "").toUpperCase());
// our per-type lane → the card language's `type` (§6.7.7 variation set)
const CARD_TYPE_OF = (i) => {
  const t = lfTypeOf(i);
  return t === "video" ? "video" : t === "audio" ? "audio" : t === "book" ? "book" : t === "story" ? "daily_story" : "article";
};
const metaOf = (i) => [i?.source_name || i?.author_name, i?.category].filter(Boolean).join(" · ") || "FemWell Editorial";

// piece G — the OPEN state's fuller body, from the item's OWN real fields. Measured
// (mnt/femwell/measure_piece_g_body_fields.md): `lede` is the ONLY long field (~4,300ch
// articles) and is never equal to `summary`; ~85% of articles have no lede but 91% carry
// real `takeaways`. So: full body = the chapter bodies OR a substantial lede; anything
// shorter is NOT a body (it would just echo the teaser) → returns [] and the expand leans
// on the teaser + takeaways + an honest reader note. Never invents.
const G_BODY_MIN = 800;   // below this, it's a teaser not a body → no prose, lean on takeaways
const G_BODY_MAX = 4800;  // a generous magazine taster; the whole piece lives in the reader
// Clean an HTML/markdown body into PLAIN PARAGRAPHS — crucially preserving paragraph breaks
// (stripHtml collapses ALL whitespace, which would flatten a 4,300-char lede into one wall of
// text) and stripping markdown chrome (## headings, **bold**, list bullets) so the expand reads
// as magazine prose, not raw source.
const toParas = (s) => String(s || "")
  .replace(/\r/g, "")
  .replace(/<\s*br\s*\/?>/gi, "\n")
  .replace(/<\/\s*(p|div|h[1-6]|li|blockquote)\s*>/gi, "\n\n")
  .replace(/<[^>]+>/g, "")
  .replace(/^\s{0,3}#{1,6}\s+/gm, "")       // markdown ATX headings
  .replace(/\*\*(.+?)\*\*/g, "$1")          // bold
  .replace(/`([^`]+)`/g, "$1")              // inline code
  .replace(/^\s*[-*+]\s+/gm, "• ")          // list bullets → a real bullet
  .replace(/[ \t]+/g, " ")
  .split(/\n\s*\n+/).map((p) => p.replace(/\n/g, " ").trim()).filter(Boolean);
const contentBodyOf = (r) => {
  const paras = (Array.isArray(r?.chapters_json) && r.chapters_json.length)
    ? r.chapters_json.flatMap((c) => toParas(c?.body || ""))
    : toParas(r?.lede || "");
  if (paras.join(" ").length < G_BODY_MIN) return [];   // content gap → the expand says so honestly
  const out = []; let n = 0;                             // cap to a taster, whole paragraphs only
  for (const p of paras) { if (n && n + p.length > G_BODY_MAX) break; out.push(p); n += p.length; }
  return out;
};
const takeawaysOf = (r) => {
  const arr = Array.isArray(r?.takeaways) ? r.takeaways : [];
  return arr.map((t) => stripHtml(typeof t === "string" ? t : (t?.text || t?.point || t?.title || ""))).filter(Boolean).slice(0, 6);
};
// a SHORT summary (piece #3, audio cards) — the PLAYER is the content, not a wall of
// podcast description. First ~2 sentences, cut cleanly at a sentence/word boundary.
const shortSummary = (text, max = 260) => {
  const s = stripHtml(text || "");
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  return stop > max * 0.5 ? cut.slice(0, stop + 1) : cut.replace(/\s+\S*$/, "") + "…";
};
// daily-story card taster (piece G) — clean markdown + real paragraphs (not a stripHtml wall),
// lift a short opening line as the excerpt pull-quote, keep the rest (capped) as the body so the
// two never duplicate. The full chapter still lives in the reader.
const storyTaster = (segmentText) => {
  const p = toParas(segmentText || "");
  if (!p.length) return { excerpt: undefined, body: [] };
  const useLead = p[0].length <= 300;
  const excerpt = (useLead ? p[0] : p[0].slice(0, 240)) || undefined;
  const rest = useLead ? p.slice(1) : p;
  const body = []; let n = 0;
  for (const x of rest) { if (n && n + x.length > G_BODY_MAX) break; body.push(x); n += x.length; }
  return { excerpt, body };
};

// ════════════════════════════════════════════════════════════════════════════
// ── PEEK SHELF — one half of a StackedCard: a horizontal peek sub-slider of tap-to-expand
// cover-cards (edge-peek + dots + subtle ‹ ›). Mirrors the approved /StackedExpandDemo geometry.
// Children may be CoverCards or (where a lens is genuinely interactive) a Panel.
function PeekShelf({ label, accent, children }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const arr = (Array.isArray(children) ? children : [children]).flat().filter(Boolean);
  const last = Math.max(0, arr.length - 1);
  const kids = () => (trackRef.current ? [...trackRef.current.children].filter((c) => c.offsetWidth > 40) : []);
  const onScroll = () => {
    const el = trackRef.current; if (!el) return;
    let best = 0, bd = Infinity;
    kids().forEach((c, i) => { const d = Math.abs(c.offsetLeft - el.offsetLeft - el.scrollLeft); if (d < bd) { bd = d; best = i; } });
    if (best !== active) setActive(best);
  };
  const goTo = (i) => { const idx = Math.max(0, Math.min(last, i)); setActive(idx); const el = trackRef.current; const c = kids()[idx]; if (el && c) el.scrollLeft = c.offsetLeft - el.offsetLeft; };
  return (
    <div style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
      {label && <div style={{ ...lbl, marginBottom: 7, flexShrink: 0 }}>{label}</div>}
      <div ref={trackRef} onScroll={onScroll} className="fw-peek-track"
        style={{ flex: 1, minHeight: 0, display: "flex", gap: 12, overflowX: "auto", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain", scrollbarWidth: "none", padding: "2px 0" }}>
        <style>{`.fw-peek-track::-webkit-scrollbar{display:none}`}</style>
        {arr.map((c, i) => (
          <div key={i} style={{ flex: "0 0 88%", maxWidth: 360, scrollSnapAlign: "start", display: "flex", flexDirection: "column", minWidth: 0 }}>{c}</div>
        ))}
        <div aria-hidden style={{ flex: "0 0 4px" }} />
      </div>
      {arr.length > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "6px 0 0", flexShrink: 0 }}>
          <button onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous" style={navBtnSm(active === 0)}><ChevronLeft size={14} /></button>
          <div style={{ display: "flex", gap: 5 }}>
            {arr.map((_, i) => <button key={i} onClick={() => goTo(i)} aria-label={`Card ${i + 1}`} style={{ width: i === active ? 15 : 6, height: 6, borderRadius: 999, border: "none", padding: 0, background: i === active ? accent : T.paperDeep, cursor: "pointer", transition: "width .2s" }} />)}
          </div>
          <button onClick={() => goTo(active + 1)} disabled={active === last} aria-label="Next" style={navBtnSm(active === last)}><ChevronRight size={14} /></button>
        </div>
      )}
    </div>
  );
}
const navBtnSm = (disabled) => ({ width: 28, height: 28, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: disabled ? "transparent" : "rgba(244,239,227,0.9)", color: disabled ? T.paperDeep : T.muted, display: "grid", placeItems: "center", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1, flexShrink: 0 });

// piece H — the doorway from the Listen & watch board to the full "Everything to watch &
// listen" contents page (flora covers, our language, filters). A peek-shelf tail card.
function MoreTile({ label, sub, accent }) {
  return (
    <button onClick={() => window.location.assign("/WatchListen")} className="fw-elite-press" aria-label={label}
      style={{ width: "100%", height: "100%", minHeight: 150, textAlign: "left", border: `1px dashed ${accent}`, borderRadius: 18, cursor: "pointer",
        background: `linear-gradient(165deg, ${T.paperHi} 0%, ${accent}12 100%)`, display: "flex", flexDirection: "column", justifyContent: "center", padding: "16px" }}>
      <span style={{ width: 42, height: 42, borderRadius: 13, background: `${accent}1F`, display: "grid", placeItems: "center", marginBottom: 12 }}><Compass size={22} color={accent} /></span>
      <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 19, lineHeight: 1.15, color: OXBLOOD }}>{label}</div>
      <div style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, lineHeight: 1.45, marginTop: 4 }}>{sub}</div>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 13, fontWeight: 800, color: accent, marginTop: 10 }}>See everything <ChevronRight size={16} /></span>
    </button>
  );
}
// ── the StackedCard structure: TOP shelf + the quiet gold hairline + BOTTOM shelf ──
function StackedShelves({ top, bottom }) {
  return (
    <div style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, minHeight: 0 }}>{top}</div>
      <div aria-hidden style={{ flexShrink: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`, opacity: 0.5, margin: "9px 0" }} />
      <div style={{ flex: 1, minHeight: 0 }}>{bottom}</div>
    </div>
  );
}

export default function LifestyleEliteShell() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // real content (grouped per type, mirrors LifestyleForYou)
  const [items, setItems] = useState([]);          // all PUBLISHED LifestyleItems
  const [gutenberg, setGutenberg] = useState([]);  // public-domain books
  const [chapters, setChapters] = useState([]);    // the whole active series (one gating contract)
  const [horoscope, setHoroscope] = useState(null);// today's HoroscopeReading
  const [savedIds, setSavedIds] = useState([]);    // UserProfile.saved_item_ids (the SAVE field)
  const [skyNotes, setSkyNotes] = useState([]);    // recent SkyNote rows (real, persisted)
  const [feed, setFeed] = useState(null);          // personalised reads from getLifestyleFeed (or null)

  // overlays
  const [calOpen, setCalOpen] = useState(false);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [chapterOpen, setChapterOpen] = useState(false);
  const [readingOpen, setReadingOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);   // the tap-to-expand card item (§6.7.7)
  // good-life bottom shelf (piece E) — a tapped permission/joy slip opens IN-BOARD via the
  // FaceOverlay. gLFace holds the tapped slip ({slip}); gLDone tracks which slips' "one doable
  // thing" has been ticked in place this session.
  const [gLFace, setGLFace] = useState(null);
  const [gLDone, setGLDone] = useState({});
  const [readerOpen, setReaderOpen] = useState(false); // the REAL immersive Daily Story reader
  const [bookReader, setBookReader] = useState(null);  // #4 — a FemWell fiction book, read IN PLACE (no route)
  const [skyOpen, setSkyOpen] = useState(false);       // the REAL horoscope reader + birth-chart onboarding
  const [heroCard, setHeroCard] = useState(() => _lifeHeroCard); // the controller-hero’s active chip
  const [toast, setToast] = useState(null);
  const sliderRef = useRef(null);

  const flash = (m) => { setToast(m); window.clearTimeout(flash._t); flash._t = window.setTimeout(() => setToast(null), 2300); };

  // ── cycle phase (graceful if absent) ──────────────────────────────────────
  const phaseKey = useMemo(() => getCurrentCyclePhase(profile), [profile]);
  const ph = phaseMeta(phaseKey || "follicular");
  const cycleDay = useMemo(() => {
    if (!profile?.last_period_start_date) return null;
    const len = profile.cycle_avg_length || 28;
    const diff = Math.floor((Date.now() - new Date(profile.last_period_start_date).getTime()) / 86400000);
    if (!Number.isFinite(diff) || diff < 0) return null;
    return (diff % len) + 1;
  }, [profile]);

  // ── grouped content (per-type rows, like LifestyleForYou) ─────────────────
  const grouped = useMemo(() => {
    const by = { article: [], story: [], book: [], video: [], audio: [], guide: [], tiktok: [] };
    (items || []).forEach((i) => {
      const t = lfTypeOf(i);
      if (t === "video" && isTikTok(i)) by.tiktok.push(i); else (by[t] = by[t] || []).push(i);
    });
    return by;
  }, [items]);

  // THE gate — the same chapter every surface shows today (evergreen unless a fresh one exists)
  const storyPick = useMemo(() => chapterForDay(chapters), [chapters]);
  const story = storyPick?.chapter || null;
  const storyNext = useMemo(() => nextChapterOf(chapters), [chapters]);
  const storyRead = story ? isChapterRead(story.id) : false;
  const storyReadCount = useMemo(() => readCount(chapters, storyPick), [chapters, storyPick, expanded, readerOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track A — the editor pick is now the feed's TOP personalised read (not just the first story).
  const editorialPick = (feed && feed[0]) || grouped.story[0] || grouped.article[0] || items[0] || null;
  const morePicks = useMemo(() => [grouped.article[0], grouped.video[0], grouped.audio[0]].filter(Boolean).slice(0, 2), [grouped]);
  const savedItems = useMemo(() => (items || []).filter((i) => savedIds.includes(i.id)), [items, savedIds]);
  const isSaved = useCallback((id) => savedIds.includes(id), [savedIds]);

  // ── loaders (real, guarded — same calls as Lifestyle.jsx) ─────────────────
  // Essential content (real entities) — this gates the initial render. Kept off the external
  // gutendex fetch so a slow public-domain API can never hold the whole page on the loader.
  const loadContent = useCallback(async () => {
    const [rows, chs, ho, pods, fic] = await Promise.all([
      base44.entities.LifestyleItems.filter({ status: "PUBLISHED" }, "-engagement_score", 60).catch(() => []),
      // ONE gating contract (dailyStory.js) — never the newest-ever row, never a stale
      // chapter dressed up as "today's". The whole series; the gate picks the day's chapter.
      loadStoryChapters(),
      base44.entities.HoroscopeReading.filter({}, "-reading_date", 1).catch(() => []),
      // piece #3 — the real podcast episodes have engagement_score 0, so the engagement cap
      // above misses them; fetch them by media_type so the Listen board + the For-you "A listen"
      // pick have real audio to play + rotate through (measured: 87 PODCAST/PUBLISHED episodes).
      base44.entities.LifestyleItems.filter({ media_type: "PODCAST", status: "PUBLISHED" }, "-created_date", 60).catch(() => []),
      // #4 — FemWell fiction (content_type FICTION) is likewise missed by the engagement cap;
      // fetch it so the Books "Your shelf" has real fiction to open IN PLACE (measured: 102).
      base44.entities.LifestyleItems.filter({ content_type: "FICTION", status: "PUBLISHED" }, "-created_date", 24).catch(() => []),
    ]);
    const seen = new Set();
    const merged = [...(Array.isArray(rows) ? rows : []), ...(Array.isArray(pods) ? pods : []), ...(Array.isArray(fic) ? fic : [])]
      .filter((i) => i && i.title && !seen.has(i.id) && seen.add(i.id));
    setItems(merged);
    setChapters(Array.isArray(chs) ? chs : []);
    setHoroscope((Array.isArray(ho) ? ho[0] : null) || null);
  }, []);

  // PERSONALISED reads — the existing getLifestyleFeed engine (interests + interaction history +
  // freshness + diversity; privacy-safe — no symptom/journal/cycle-day data). `phase` is only the
  // derived cycle-phase LABEL, a soft boost for content already tagged for that phase. Background,
  // guarded; on any failure `feed` stays null and the deck uses the page's loaded reads.
  const loadFeed = useCallback(async (phase) => {
    try {
      const res = await withTimeout(base44.functions.invoke("getLifestyleFeed", { mode: "for_you", page: 0, page_size: 12, phase: phase || "" }), 6000, "feed");
      const rows = res?.data?.items || res?.items || [];
      const reads = (Array.isArray(rows) ? rows : []).filter((r) => r && r.title && /ARTICLE|STORY|GUIDE|FICTION/.test(String(r.content_type || "").toUpperCase()));
      if (reads.length) setFeed(reads);
    } catch { /* leave feed null → deck falls back to loaded reads */ }
  }, []);

  // record a real action (open / save) so the feed LEARNS — fire-and-forget, never blocks UX,
  // never records the seeded fallback (no raw id). Reuses recordLifestyleAction (existing fn).
  const recordAction = useCallback((rawOrItem, action) => {
    const raw = rawOrItem?.raw || rawOrItem;
    if (!raw?.id || String(raw.id).startsWith("seed-") || String(raw.id).startsWith("gut-")) return;
    try { base44.functions.invoke("recordLifestyleAction", { item_id: raw.id, action, category: raw.category || "", source_id: raw.source_id || raw.source_name || "" }).catch(() => {}); } catch { /* ignore */ }
  }, []);

  // recent sky notes for the signed-in user (real SkyNote rows — guarded, never blocks render)
  const loadSkyNotes = useCallback(async (uid) => {
    if (!uid) return;
    try {
      const rows = await base44.entities.SkyNote.filter({ user_id: uid }, "-created_date", 8);
      setSkyNotes((Array.isArray(rows) ? rows : []).filter((r) => r && r.text));
    } catch { /* leave the seeded lines */ }
  }, []);

  // Public-domain books — fetched in the BACKGROUND (never blocks the loader); the Books lane fills
  // in when it arrives, and quietly stays empty (FemWell fiction still shows) if gutendex is slow/down.
  const loadGutenberg = useCallback(async () => {
    try {
      const r = await fetch("https://gutendex.com/books?topic=women&languages=en&page_size=12", { signal: AbortSignal.timeout(8000) });
      if (!r.ok) return;
      const d = await r.json();
      setGutenberg((Array.isArray(d?.results) ? d.results : []).map((b) => ({
        id: `gut-${b.id}`, _gutenbergId: b.id, _book: "gutenberg",
        title: b.title || "", author: (b.authors?.[0]?.name) || "Public domain", tag: "Public domain", stars: 4,
        // gutendex ships a real précis per book — we were fetching it and throwing it away, which
        // is why the book cards had a placeholder line and a void. This is the book's own summary.
        summary: (Array.isArray(b.summaries) && b.summaries[0]) ? String(b.summaries[0]).replace(/\s+/g, " ").trim() : "",
        subjects: Array.isArray(b.subjects) ? b.subjects.slice(0, 3) : [],
      })));
    } catch { /* leave books to FemWell fiction */ }
  }, []);

  // ── init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true; let unsubItems;
    (async () => {
      try {
        const u = await base44.auth.me().catch(() => null); if (!alive) return; setUser(u);
        let p = null;
        if (u?.id) {
          const profiles = await base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []);
          if (!alive) return;
          p = (profiles || []).filter(Boolean)[0] || null;
          setProfile(p);
          setSavedIds(Array.isArray(p?.saved_item_ids) ? p.saved_item_ids : []);
        }
        await loadContent();
        loadGutenberg();          // background — never blocks the loader
        loadSkyNotes(u?.id);      // background — real sky-diary rows
        if (u?.id) loadFeed(getCurrentCyclePhase(p));  // background — personalised "Reads for you"
        try { unsubItems = base44.entities.LifestyleItems.subscribe(() => loadContent()); } catch { /* no-op */ }
      } catch { /* unauth / offline — render gracefully */ }
      if (alive) setLoading(false);
    })();
    return () => { alive = false; unsubItems?.(); };
  }, [loadContent, loadGutenberg, loadSkyNotes, loadFeed]);

  // ── SAVE toggle (persists to UserProfile.saved_item_ids — optimistic + rollback) ──
  const toggleSave = useCallback(async (item) => {
    if (!item?.id) return;
    const id = item.id;
    const was = savedIds.includes(id);
    const next = was ? savedIds.filter((x) => x !== id) : Array.from(new Set([...savedIds, id]));
    setSavedIds(next);                                  // optimistic
    flash(was ? "Removed from saved" : "Saved");
    if (!was) recordAction(item, "save");               // teach the feed she liked this (on save only)
    if (!user?.id) { return; }                          // signed-out: optimistic only (no persistence path)
    try {
      // Use the profile already loaded at init — re-filtering here would be a redundant read that
      // can hang behind the page's live subscriptions (saturated connection pool), so the write
      // never fires. Go straight to update() with the known row id.
      if (profile?.id) {
        await withTimeout(base44.entities.UserProfile.update(profile.id, { saved_item_ids: next }), 6000, "save");
      } else {
        const created = await withTimeout(base44.entities.UserProfile.create({ user_id: user.id, user_email: user.email, saved_item_ids: next }), 6000, "save");
        if (created?.id) setProfile(created);
      }
    } catch {
      setSavedIds(savedIds);                            // rollback to prior set
      flash("Couldn't update — try again");
    }
  }, [savedIds, user, profile, recordAction]);

  // ── Sky diary → SkyNote.create (real persistence; optimistic + rollback) ──
  const addSkyNote = useCallback(async (text) => {
    const t = (text || "").trim(); if (!t) return;
    if (!user?.id) { flash("Sign in to keep your sky notes"); return; }
    const moon = horoscope?.moon_phase || "";
    const temp = { id: "tmp" + Date.now(), user_id: user.id, text: t, moon_phase: moon, date: todayKey() };
    setSkyNotes((xs) => [temp, ...xs]);                       // optimistic
    flash("Added to your sky diary");
    try {
      const created = await withTimeout(base44.entities.SkyNote.create({ user_id: user.id, text: t, moon_phase: moon, date: todayKey(), created_at: nowISO(), updated_at: nowISO() }), 6000, "skynote");
      if (created?.id) setSkyNotes((xs) => xs.map((x) => x.id === temp.id ? { ...x, id: created.id } : x));
    } catch { setSkyNotes((xs) => xs.filter((x) => x.id !== temp.id)); flash("Couldn't save — try again"); }
  }, [user, horoscope]);

  // ── A day for you → PlannerItems.create (a gentle planned day-off block) ──
  const savePlannerDay = useCallback(async (title) => {
    if (!user?.id) { flash("Sign in to save it to your planner"); return; }
    flash("Saved to your planner");                          // optimistic UX (no list shown here)
    try {
      await withTimeout(base44.entities.PlannerItems.create({ user_id: user.id, title: title || A_DAY.title, date: todayKey(), category: "wellbeing", notes: "A day for you — guilt-free, from Lifestyle.", is_completed: false, created_at: nowISO(), updated_at: nowISO() }), 6000, "planner-day");
    } catch { flash("Couldn't save — try again"); }
  }, [user]);

  // ── Try this → PlannerItems.create (a soft intention) ──
  const saveTryThis = useCallback(async (title) => {
    if (!user?.id) { flash(`Nice — "${title}"`); return; }    // signed-out: gentle ack only
    flash(`Saved — "${title}"`);                              // optimistic
    try {
      await withTimeout(base44.entities.PlannerItems.create({ user_id: user.id, title: title, date: todayKey(), category: "wellbeing", notes: "A soft intention from Lifestyle — try it when you fancy it.", is_completed: false, created_at: nowISO(), updated_at: nowISO() }), 6000, "planner-try");
    } catch { flash("Couldn't save — try again"); }
  }, [user]);

  // good-life do-it small cards (piece D): tick in place (optimistic) + the REAL write.
  // awe/tea are soft intentions (saveTryThis); quiet hour is a wellbeing day (savePlannerDay).
  const glTick = useCallback((key, title, kind = "try") => {
    setGLDone((d) => (d[key] ? d : { ...d, [key]: true }));
    if (kind === "day") savePlannerDay(title); else saveTryThis(title);
  }, [savePlannerDay, saveTryThis]);

  // #4 — open a book at OUR reader standard, IN PLACE (no navigation to a slow route).
  // FemWell fiction is already loaded (its chapters live on the row), so we mount the
  // immersive DailyStoryReader right here — instant, no re-fetch. Gutenberg classics still
  // need their external text fetch, so they keep the /BookReader route (its own taster).
  const openBook = useCallback((it) => {
    if (!it) return;
    recordAction(it, "open");
    const raw = it._raw || it;
    if (it._book === "gutenberg" || it.gutenbergId) { window.location.assign(`/BookReader?gutenberg_id=${it._gutenbergId || raw._gutenbergId}`); return; }
    setBookReader(raw);
  }, [recordAction]);

  // open the exact item full-screen (deep-link parity with live Lifestyle: LifestyleDetail / readers)
  const openItem = useCallback((it) => {
    if (!it) return;
    recordAction(it, "open");   // teach the feed she opened this (fire-and-forget)
    if (it._book === "gutenberg") { window.location.assign(`/BookReader?gutenberg_id=${it._gutenbergId}`); return; }
    if (lfTypeOf(it) === "book") { window.location.assign(`/FictionReader?id=${it.id}`); return; }
    window.location.assign(`/LifestyleDetail?id=${it.id}`);
  }, [recordAction]);

  const jumpTo = (idx) => {
    setJumpOpen(false);
    sliderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const track = sliderRef.current?.querySelector(".fw-clipboard-track"); if (!track) return;
    const boards = [...track.children].filter((c) => c.offsetWidth > 40);
    const child = boards[idx]; if (child) track.scrollLeft = child.offsetLeft - track.offsetLeft;
  };

  const gold = cwOf("gold").petal, sky = cwOf("sky").petal, crimson = cwOf("crimson").petal, plum = cwOf("plum").petal, sage = cwOf("sage").petal;
  // the SIX reorganised boards (one board = one room = one job) — also drives the Jump sheet
  const BOARDS = [
    { t: "The good life", sub: "What do you have time for · permission & small joys" },
    { t: "Read", sub: "Articles & guides · stories & fiction" },
    { t: "Listen & watch", sub: "Podcasts & shows · watch & trending" },
    { t: "Books", sub: "Your shelf · free classics" },
    { t: "Story & sky", sub: "Today's chapter · your sky" },
    { t: "Yours", sub: "Saved · for your phase" },
  ];

  // First name for the hero — fall back to "Lifestyle" if it looks like a handle/username.
  const rawFirst = (user?.full_name || "").split(" ")[0] || "";
  const firstName = (/\d/.test(rawFirst) || rawFirst.length > 16) ? "" : (rawFirst ? rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1) : "");

  // books lane: today's daily story chip → FemWell fiction → gutendex
  const booksRow = useMemo(() => [
    ...(story ? [{ __kind: "daily" }] : []),
    ...grouped.book,
    ...gutenberg,
  ].slice(0, 12), [story, grouped.book, gutenberg]);

  // dopamine-menu source — a BOUNDED set per time band from already-loaded content (no fetch, no feed).
  // "few" → shortest read + a clip/short listen; "fifteen" → an article + a podcast; "evening" → a story + a long listen.
  const pickFor = useCallback((bandKey) => {
    const byDur = (arr) => [...(arr || [])].sort((a, b) => (a.duration_seconds || 9e9) - (b.duration_seconds || 9e9));
    const longest = (arr) => [...(arr || [])].sort((a, b) => (b.duration_seconds || 0) - (a.duration_seconds || 0));
    if (bandKey === "few") return { read: byDur(grouped.article)[0] || grouped.guide?.[0] || null, listen: grouped.audio?.[0] || grouped.video?.[0] || null };
    if (bandKey === "fifteen") return { read: grouped.article?.[1] || grouped.article?.[0] || null, listen: grouped.audio?.[0] || null };
    return { read: grouped.story?.[0] || longest(grouped.article)[0] || null, listen: longest(grouped.audio)[0] || grouped.video?.[0] || null };
  }, [grouped]);

  // ── CARD ADAPTERS (§6.7.7) — turn each live source into the shared card item.
  // We pass CONTENT only; `type` supplies the chrome (kind/Icon/colourway/scene/primary).
  // Every action is REAL: reads/books/video → the real reader; rituals → Planner, no navigation.
  const openExternal = useCallback((url) => { if (url) window.open(url, "_blank", "noopener,noreferrer"); }, []);

  // §1/§2 — only a REAL media file plays in-card. Platform pages (YouTube/TikTok/a show's
  // site) are never fake-embedded: they keep their honest link-out action.
  const playableMedia = (url) => /^https?:\/\/\S+\.(mp4|webm|mov|m4v|mp3|m4a|aac|ogg|wav)(\?|#|$)/i.test(String(url || ""));

  const rowCard = useCallback((r, type) => {
    // piece G — collapsed teaser vs open body are now DISTINCT sources so the open says more:
    //   subtitle / summary = the SHORT teasers (why_it_matters · summary), never the lede;
    //   body = the item's OWN full text (chapters / substantial lede), or [] on a content gap.
    const g_body = contentBodyOf(r);
    const g_takes = takeawaysOf(r);
    return {
    id: r.id, type,
    title: r.title,
    subtitle: stripHtml(r.why_it_matters || r.summary || "") || metaOf(r),
    // §5 a real hook so a card is never empty — the substance, distinct from the short subtitle.
    // Audio (piece #3): a SHORT summary — the flora player IS the content, not a wall of text.
    summary: (type === "audio" ? shortSummary(r.summary || r.lede) : stripHtml(r.summary || r.why_it_matters || "")) || undefined,
    category: r.category || undefined,
    meta: [["Clock", r.duration_label || ((type === "audio" || type === "video") ? "A short listen" : "A few minutes")], ["BookOpen", r.source_name || r.author_name || "FemWell Editorial"]],
    chips: [r.category, r.emotional_tag].filter(Boolean).slice(0, 3),
    // audio: no prose body (the player carries it); everything else gets its real body (piece G)
    body: type === "audio" ? [] : g_body,
    ...(g_takes.length ? { takeaways: g_takes } : {}),
    // §1/§2 play INLINE when the source is a real media file; off-platform stays an honest link-out
    // A real media FILE plays as <video>; a YOUTUBE row (all 284 live ones) plays via the
    // inline facade — it is embeddable, so it must NOT link out. `is_embeddable` is undefined
    // on every live row (the embed-gate never ran), so we treat unknown as playable and honour
    // only an explicit false. TikTok/Instagram genuinely cannot be embedded → real link-out.
    ...(type === "video" ? (
      playableMedia(r.content_url) ? { videoSrc: r.content_url }
      : (r.video_id && r.is_embeddable !== false && !isTikTok(r)) ? { youtubeId: r.video_id }
      : { external: true }
    ) : {}),
    // audio (piece #3): a podcast audio_url IS a real media file (mp3 from RSS) — play it in the
    // flora player (FloraAudio errors gracefully if a URL won't play), don't gate it out to a wall.
    ...(type === "audio" && r.audio_url ? { audioSrc: r.audio_url } : {}),
    // captions (video · WCAG SC 1.2.2 Level A) + transcript (audio-only · SC 1.2.1) when we have them
    ...(r.captions_url ? { captionsSrc: r.captions_url } : {}),
    ...(r.transcript ? { transcript: stripHtml(r.transcript) } : {}),
    // identity for the global player's lock-screen metadata
    sourceName: r.source_name || r.author_name || "FemWell",
    imageUrl: r.image_url || undefined,
    duration: Number(r.duration_seconds) || undefined,
    _raw: r,
    actions: [{
      label: type === "video" ? ((r.video_id && r.is_embeddable !== false && !isTikTok(r)) ? "Open full-screen" : "Watch")
        : type === "audio" ? "Open episode" : type === "book" ? "Open reader" : "Read this",
      Icon: type === "video" ? "Film" : type === "audio" ? "Headphones" : type === "book" ? "Book" : "BookOpen",
      primary: true,
      onClick: () => type === "book" ? openBook(r) : (type === "audio" && r.episode_url) ? openExternal(r.episode_url) : openItem(r),
    }],
    };
  }, [openItem, openExternal, openBook]);

  const articleCards = useMemo(() => [...(grouped.article || []), ...(grouped.guide || [])].slice(0, 6).map((r) => rowCard(r, "article")), [grouped, rowCard]);
  const storyCards = useMemo(() => (grouped.story || []).slice(0, 6).map((r) => rowCard(r, "daily_story")), [grouped, rowCard]);
  // ── LISTEN — the REAL podcast feature, wired at last ─────────────────────────────────────
  // Correction (2026-07-17): my earlier "0 audio" measured LifestyleItems media_type only. The
  // podcast subsystem was always real — 12 curated, ACTIVE sources with live RSS feeds
  // (How To Fail · Slow Burn · Esther Perel · On Being …), a global player with background +
  // lock-screen, PodcastListens, PodcastCard/Rail/ExpandedPlayer. What was missing was the
  // EPISODES: seedPodcasts (pure RSS, no LLM, no cost, idempotent) had simply never been run.
  // Ran it → 29 real episodes, every one PUBLISHED, with an audio_url AND a 600-char summary.
  //
  // So: IN-APP episodes first (they play through the real global player), then the curated
  // SHOWS as honest Spotify/Apple link-outs — the 12-show list the rail already owned, not the
  // 2-item stub this page had been carrying.
  const audioCards = useMemo(() => {
    const real = (grouped.audio || []).slice(0, 6).map((r) => rowCard(r, "audio"));
    const ext = EXTERNAL_PODCASTS.slice(0, 6).map((pd) => ({
      id: pd.id, type: "audio", title: pd.title,
      subtitle: pd.show, category: "listen podcast rest",
      // the show's own blurb — real words, so the card is never thin (6a)
      summary: pd.summary || "",
      meta: [["Headphones", pd.show], ["Clock", pd.duration || "A long listen"]],
      chips: ["podcast", "show"],
      body: pd.summary ? [pd.summary] : [],
      // honest: this one lives on Spotify/Apple, so we say so and send her there properly
      external: true,
      actions: [
        pd.platforms?.spotify && { label: "Spotify", Icon: "Headphones", primary: true, onClick: () => openExternal(pd.platforms.spotify) },
        pd.platforms?.apple && { label: "Apple", Icon: "Play", primary: false, onClick: () => openExternal(pd.platforms.apple) },
      ].filter(Boolean),
    }));
    return [...real, ...ext];
  }, [grouped, rowCard, openExternal]);
  const videoCards = useMemo(() => {
    const real = (grouped.video || []).slice(0, 4).map((r) => rowCard(r, "video"));
    // off-platform watches (YouTube/TikTok) are `external` — never fake-embedded, always an honest link-out
    const curated = real.length ? [] : LIFESTYLE_VIDEOS.slice(0, 4).map((v) => ({
      // hand-picked and verified embeddable → it plays HERE, like everything else
      id: v.id, type: "video", title: v.title, subtitle: v.channel_name, youtubeId: v.video_id,
      summary: v.summary || "A hand-picked watch from a channel we trust — it opens on YouTube, where it lives.",
      meta: [["Film", v.duration_label || "A short watch"], ["Play", v.channel_name]], chips: ["watch"],
      body: [],
      actions: [{ label: "Open on YouTube", Icon: "Film", primary: false, onClick: () => openExternal(v.content_url) }],
    }));
    const tik = (grouped.tiktok || []).slice(0, 3).map((t) => ({
      id: t.id, type: "video", title: t.title, subtitle: t.source_name || "Trending", external: true,
      summary: "Short and trending — it opens in the app it lives in.",
      meta: [["Film", "Short · trending"]], chips: ["trending"],
      body: [],
      actions: [{ label: "Open", Icon: "ChevronRight", primary: true, onClick: () => openExternal(t.content_url) }],
    }));
    return [...curated, ...real, ...tik];
  }, [grouped, rowCard, openExternal]);
  const shelfBookCards = useMemo(() => {
    const daily = story ? [{
      id: "daily-chapter", type: "daily_story", title: story.series_title || story.title || "Today's chapter",
      subtitle: story.cliffhanger ? `"${story.cliffhanger}"` : "Today's chapter is ready.",
      meta: [["Feather", story.day_number ? `Day ${story.day_number}` : "Today"], ["Clock", "A few minutes"]],
      chips: ["daily story"], excerpt: stripHtml(story.segment_text || "").slice(0, 220) || undefined,
      body: [stripHtml(story.segment_text || "") || "Today's chapter is being written."],
      actions: [{ label: "Read today's chapter", Icon: "Feather", primary: true, onClick: () => { setExpanded(null); setChapterOpen(true); } }],
    }] : [];
    return [...daily, ...(grouped.book || []).slice(0, 5).map((r) => rowCard(r, "book"))];
  }, [story, grouped, rowCard]);
  // §3 BOOKS — 2 taps, not 3: tap the card and you're READING (the pane paginates the
  // opening pages via the existing fetchGutenbergBook fn); the FULL reader is one clear option.
  const classicCards = useMemo(() => (gutenberg || []).slice(0, 6).map((b) => ({
    id: b.id, type: "book", title: b.title, subtitle: b.author || "Public domain",
    summary: b.summary || "A free, public-domain classic — start reading here, or open the full reader for chapters, reflections and the club.",
    meta: [["Book", b.tag || "Public domain"], ["Star", b.stars ? "★".repeat(b.stars) : "A classic"]],
    chips: ["free", "classic", ...(b.subjects || []).map((x) => String(x).split("--")[0].trim().toLowerCase()).filter(Boolean)].slice(0, 4),
    body: [],
    gutenbergId: b._gutenbergId,
    onOpenFullReader: () => openItem(b),
    actions: [{ label: "Open reader", Icon: "Book", primary: true, onClick: () => openItem(b) }],
  })), [gutenberg, openItem]);
  const dailyStoryCards = useMemo(() => (story ? (() => { const t = storyTaster(story.segment_text); return [{
    id: "story-today", type: "daily_story", title: story.series_title || story.title || "Today's chapter",
    subtitle: story.cliffhanger ? `"${story.cliffhanger}"` : "Today's chapter is ready to read.",
    meta: [["Feather", story.day_number ? `Day ${story.day_number}` : "Today"], ["Clock", "A few minutes"]],
    chips: ["daily story", "fiction"], excerpt: t.excerpt,
    body: t.body.length ? t.body : ["Today's chapter is being written — check back soon."],
    actions: [{ label: "Read today's chapter", Icon: "Feather", primary: true, onClick: () => { setExpanded(null); setChapterOpen(true); } }],
  }]; })() : [{
    id: "story-soon", type: "daily_story", title: "Today's chapter is on its way",
    subtitle: "A new chapter lands each morning.", meta: [["Clock", "Back tomorrow"]], chips: ["daily story"],
    body: ["Your serialised story is being written — it'll be here shortly."], actions: [],
  }]), [story]);
  // ── YOUR SKY (component #6) ──────────────────────────────────────────────
  // The moon is REAL and free: getMoonPhase() is a synodic formula (±1% illumination,
  // client-side, no backend). So the card is honest and never blank even when today's
  // generated reading hasn't been written yet — the sky doesn't depend on an LLM.
  const moonToday = useMemo(() => { try { return getMoonPhase(new Date()); } catch { return null; } }, []);
  const horoscopeCards = useMemo(() => {
    const moonLine = moonToday ? `${moonToday.name} · ${moonToday.illumination}% lit` : (horoscope?.moon_phase || "The sky");
    const hasReading = !!(horoscope && (horoscope.narrative || horoscope.headline));
    return [{
      id: "sky-today", type: "horoscope",
      title: horoscope?.headline || (moonToday ? `The moon is ${moonToday.name.toLowerCase()}` : "Your sky today"),
      subtitle: hasReading
        ? moonLine
        : "Your moon is here. Add your birth date and a reading joins it each day.",
      meta: [["Moon", moonLine], ["Sparkles", phaseKey ? phaseLabel(phaseKey) : "Your phase"]],
      chips: ["sky", "moon"].concat(phaseKey ? [phaseLabel(phaseKey).toLowerCase()] : []),
      reading: hasReading
        ? { headline: horoscope.headline || "Your sky today", lines: [stripHtml(horoscope.narrative || ""), stripHtml(horoscope.cycle_moon_body || "")].filter(Boolean) }
        : undefined,
      body: [
        stripHtml(horoscope?.narrative || "")
          || `Tonight the moon is ${moonToday ? `${moonToday.name.toLowerCase()}, ${moonToday.illumination}% lit` : "turning as it always does"}. Add your birth date — just the date is enough — and a warm reading joins it here each day.`,
      ],
      // opens the REAL reader (triad · cycle-moon dial · sky diary · ask the sky …),
      // which also carries the birth-chart onboarding. Was a shallow headline sheet.
      actions: [{ label: hasReading ? "Open your sky" : "Set up your sky", Icon: "Moon", primary: true, onClick: () => { setExpanded(null); setSkyOpen(true); } }],
    }];
  }, [horoscope, phaseKey, moonToday]);
  const ritualCards = useMemo(() => {
    // rotate a fresh handful of "a day for you" ideas + "try this" joys each day (Track A)
    const dayPool = [{ title: A_DAY.title, line: A_DAY.line }, ...A_DAY.alts.map((a) => ({ title: a, line: "A day that's just yours — guilt-free." }))];
    const aday = rotateDaily(dayPool, 3)
      .map((d, i) => ({
        id: `aday-${i}`, type: "ritual", title: d.title, subtitle: d.line,
        meta: [["Sun", "A day for you"], ["Heart", "No streaks, no pressure"]], chips: ["a day for you"],
        body: ["Leisure is the point — this lands softly in your planner, and nothing nags you if the day goes another way."],
        why: whyFor(d.title), doable: { label: "Save it for the day", title: d.title, kind: "day" },
        actions: [{ label: "Save it for the day", Icon: "Star", primary: true, onClick: () => { savePlannerDay(d.title); setExpanded(null); } }],
      }));
    const trys = rotateDaily(TRY_THIS, 3).map((t, i) => ({
      id: `try-${i}`, type: "ritual", title: t.title, subtitle: "Small, doable, just for today.", cw: t.cw,
      meta: [["Wind", "A small thing"], ["Heart", "No streaks"]], chips: ["try this"],
      body: ["Tap to keep it — it lands softly in your planner. Try it when you fancy it; leave it if you don't."],
      why: whyFor(t.title), doable: { label: "Keep it for today", title: t.title, kind: "try" },
      actions: [{ label: "Keep it for today", Icon: "Star", primary: true, onClick: () => { saveTryThis(t.title); setExpanded(null); } }],
    }));
    return [...aday, ...trys];
  }, [savePlannerDay, saveTryThis]);
  const permissionCards = useMemo(() => {
    // two rotating whole-life slips + the gentle phase-tinted line (kept dynamic, a gentle few)
    const slips = [
      ...rotateDaily(PERMISSION_SLIPS, 2),
      phaseKey ? `Your ${phaseLabel(phaseKey).toLowerCase()} week asks for a gentler pace. That's not falling behind.` : "A gentler pace today isn't falling behind.",
    ];
    return slips.map((sl, i) => ({
      id: `slip-${i}`, type: "quote", title: sl, subtitle: "A permission slip, not a to-do.",
      meta: [["Heart", "Permission"]], chips: ["permission"], quote: { text: sl, attrib: "FemWell" },
      body: ["No streaks here — leisure is the point, and guilt isn't invited."],
      why: whyFor(sl), doable: { label: "Book a quiet hour", title: "A quiet hour, just for you", kind: "day" },
      actions: [{ label: "Book a quiet hour", Icon: "Moon", primary: true, onClick: () => { savePlannerDay("A quiet hour, just for you"); setExpanded(null); } }],
    }));
  }, [phaseKey, savePlannerDay]);
  // ── THE "FOR YOU" DECK (pass d) — a taste of EVERYTHING, not a reads list ────────────────
  // One personalised pick from a DIFFERENT section each: Story · Read · Listen & watch · Sky ·
  // Books · The good life. Ranked by getLifestyleFeed (her interests + what she's opened/saved
  // + freshness + a gentle phase fit) — the same engine piece 4 wired; opening or saving any of
  // these records back through openItem/toggleSave, so tomorrow's deck is chosen better.
  //
  // HONEST ABOUT THE GAPS (measured, not assumed): there are ZERO published podcasts, guides or
  // FemWell fiction. So a section with nothing real is SKIPPED, never faked and never an empty
  // card — Listen & watch resolves to a real video, Books to a real classic. Story, Sky and the
  // good life always have something, so a brand-new woman with an empty library still gets a
  // warm cross-section deck rather than a hollow one.
  const forYouItems = useMemo(() => {
    // her ranked library if the feed answered; otherwise whatever the page already loaded
    const ranked = (feed && feed.length) ? feed : [...(grouped.article || []), ...(grouped.story || []), ...(grouped.video || []), ...(grouped.audio || [])];
    const firstOf = (t) => ranked.find((r) => CARD_TYPE_OF(r) === t);
    const out = [];
    const seen = new Set();
    const push = (card, section) => {
      if (!card || seen.has(card.id)) return;
      seen.add(card.id);
      out.push({ ...card, forYouSection: section });
    };
    // 1 · Story — today's chapter, the daily ritual
    push(dailyStoryCards[0], "Today's chapter");
    // 2 · Read — her top personalised article
    const a = firstOf("article"); push(a ? rowCard(a, "article") : articleCards[0], "A read for you");
    // 3 · Listen & watch — a real episode, ROTATING BY THE DAY (piece #3): a different one each
    // day from the loaded episodes, so "A listen" is fresh rather than always the same top pick.
    const auList = grouped.audio || [];
    const au = auList.length ? auList[Math.floor(Date.now() / 86400000) % auList.length] : firstOf("audio");
    const vi = firstOf("video");
    push(au ? rowCard(au, "audio") : (vi ? rowCard(vi, "video") : videoCards[0]), au ? "A listen" : "Something to watch");
    // 4 · Sky — the glimpse (always real: the moon is computed)
    push(horoscopeCards[0], "Your sky");
    // 5 · Books — the shelf, then the free classics
    push(shelfBookCards.find((c) => c.type === "book") || classicCards[0], "From the shelf");
    // 6 · The good life — one small joy
    push(ritualCards[0], "A small joy");
    return out.filter(Boolean).slice(0, 6);
  }, [feed, grouped, rowCard, dailyStoryCards, articleCards, videoCards, horoscopeCards, shelfBookCards, classicCards, ritualCards]);

  // ── THE CONTROLLER-HERO's destinations (§6.8.2 band 1) ──────────────────────────────────
  // ORDER MATTERS: this useMemo's deps are evaluated AT THIS LINE, so every value it reads
  // (firstName, story, moonToday) must already be declared ABOVE. Getting that wrong shipped a
  // temporal-dead-zone crash that took every route down on 2026-07-17. Do not move this up.
  const HERO_CARDS = useMemo(() => [
    { id: "read", Icon: BookOpen, label: "Read", title: firstName ? `${firstName}'s reading` : "Something to read",
      line: "Essays, guides and stories for a spare ten minutes.", openness: 0.72, cw: "plum", creature: "bee",
      action: { label: "Open your reads", on: () => jumpTo(1) } },
    { id: "listen", Icon: Headphones, label: "Listen", title: "Something to hear",
      line: "Real episodes that play right here — and keep playing while you browse.", openness: 0.86, cw: "sage", creature: "dragonfly",
      action: { label: "Open Listen & watch", on: () => jumpTo(2) } },
    { id: "books", Icon: Book, label: "Books", title: "Your shelf",
      line: "Something longer — and a shelf of free classics to fall into.", openness: 0.6, cw: "sky", creature: "ladybird",
      action: { label: "Open your shelf", on: () => jumpTo(3) } },
    { id: "story", Icon: Feather, label: "Story", title: "Today's chapter",
      line: story?.cliffhanger ? `"${story.cliffhanger}"` : "A chapter a day — a finished story you can also read straight through.",
      openness: 1, cw: "crimson", creature: "butterfly",
      action: { label: "Read today's chapter", on: () => setChapterOpen(true) } },
    { id: "sky", Icon: Moon, label: "Sky", title: moonToday ? (moonToday.name.charAt(0).toUpperCase() + moonToday.name.slice(1)) : "Your sky today",
      line: moonToday ? `The moon is ${moonToday.name.toLowerCase()} — ${moonToday.illumination}% lit tonight, and how it meets your week.` : "Your sky, and how it meets your week.",
      openness: 0.5, cw: "lavender", creature: "moth",
      action: { label: "Open your sky", on: () => setSkyOpen(true) } },
    { id: "good", Icon: Clock, label: "Good life", title: "The good life",
      line: "What do you have time for? A small joy, and permission to enjoy it.", openness: 0.92, cw: "gold", creature: "butterfly",
      action: { label: "Open the good life", on: () => jumpTo(0) } },
  ], [firstName, story, moonToday]);

  // Track A — Saved is now COLLECTIONS-READY: grouped by kind (Reads · Listens · Watches · Books)
  // so it clusters into auto-shelves instead of a flat dump. `savedCollections` also drives the
  // count in the summary; `savedCards` keeps the same card list, just ordered by collection.
  const SAVED_ORDER = ["article", "story", "book", "audio", "video"];
  const savedCollections = useMemo(() => {
    const g = {};
    (savedItems || []).forEach((i) => { const t = CARD_TYPE_OF(i); (g[t] = g[t] || []).push(i); });
    return g;
  }, [savedItems]);
  const savedCards = useMemo(() =>
    SAVED_ORDER.flatMap((t) => savedCollections[t] || []).concat(
      (savedItems || []).filter((i) => !SAVED_ORDER.includes(CARD_TYPE_OF(i)))
    ).slice(0, 10).map((r) => rowCard(r, CARD_TYPE_OF(r))),
  [savedCollections, savedItems, rowCard]);
  const savedSummary = useMemo(() => {
    const c = { read: 0, listen: 0, watch: 0, book: 0 };
    (savedItems || []).forEach((i) => { const t = CARD_TYPE_OF(i); if (t === "audio") c.listen++; else if (t === "video") c.watch++; else if (t === "book") c.book++; else c.read++; });
    const p = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
    return [c.read && p(c.read, "read"), c.listen && p(c.listen, "listen"), c.watch && p(c.watch, "watch"), c.book && p(c.book, "book")].filter(Boolean).join(" · ");
  }, [savedItems]);
  // Track A — REAL phase-tuned picks: genuinely phase-tagged content for HER cycle phase only
  // (allow-listed). If nothing's tagged for her phase, the shelf shows its honest empty state —
  // no faking a phase tint out of unrelated content.
  const phaseCards = useMemo(() => {
    const ph = phaseKey && CANON_PHASES.includes(phaseKey) ? phaseKey : null;
    if (!ph) return [];
    // genuinely phase-tagged content from the loaded library (incl. today's story). phase_tags is
    // only ~5.6% populated (a measured content gap), so this stays honestly empty until tagged.
    const pool = [...(story ? [story] : []), ...(items || [])];
    const real = pool.filter((i) => i && i.title && phaseTagsOf(i).includes(ph));
    const seen = new Set();
    return real.filter((i) => !seen.has(i.id) && seen.add(i.id)).slice(0, 6).map((r) => rowCard(r, CARD_TYPE_OF(r)));
  }, [items, story, phaseKey, rowCard]);

  // save from inside an expanded card → the REAL persistence + the feed's learning loop
  const isCardSaved = useCallback((it) => !!(it?._raw?.id && savedIds.includes(it._raw.id)), [savedIds]);
  const onCardSave = useCallback((_next, it) => { if (it?._raw) toggleSave(it._raw); }, [toggleSave]);

  if (loading) {
    return (
      <div style={{ ...PAPER_BG, minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div style={{ display: "grid", placeItems: "center", gap: 12, color: T.muted }}>
          <Loader size={26} color={cwOf("gold").petal} style={{ animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16 }}>Tending your day…</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }}>
      <style>{floraKeyframes}{ELITE_MOTION}</style>
      <TopChrome onJump={() => setJumpOpen(true)} onCalendar={() => setCalOpen(true)} />

      <div style={{ maxWidth: 430, margin: "0 auto", padding: "16px 16px 0" }} className="fw-elite-in">
        {/* ══ THE CONTROLLER-HERO (§6.8.2 band 1 · the Nutrition "Your plate" pattern) ══════
            The chips ARE the controller: tap one and the SAME flower re-blooms (openness = how
            MANY blooms open along the bough, one→many — never size), the hero re-titles, the
            colourway re-tints. Each chip's CTA is that section's real action, which doubles as
            the jump-to-section. The crowding Bouquet is gone (the controller sits where it was,
            per §6.8.2) and the two focus pills are folded in — their actions are now the Story
            and Good-life chips. */}
        {(() => {
          const active = HERO_CARDS[heroCard] || HERO_CARDS[0];
          const aCol = cwOf(active.cw).petal;
          return (
            <>
              <FwFloraHero title={active.title} colorway={active.cw} bloom={ph.bloom} openness={active.openness}
                creature={active.creature} flankL="iris" flankR="sunflower" titleColor={OXBLOOD} line={active.line} titleMinHeight={92} />
              <div className="fw-hero-ctl" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "12px 2px 2px" }}>
                <style>{`.fw-hero-ctl{scrollbar-width:none}.fw-hero-ctl::-webkit-scrollbar{display:none}`}</style>
                {HERO_CARDS.map((c, i) => {
                  const on = i === heroCard; const col = cwOf(c.cw).petal;
                  return (
                    <button key={c.id} onClick={() => { _lifeHeroCard = i; setHeroCard(i); }} aria-pressed={on} className="fw-elite-press"
                      style={{ flex: "0 0 72px", height: 64, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, borderRadius: 14, cursor: "pointer", background: on ? `linear-gradient(160deg, ${T.paperHi} 0%, ${col}20 100%)` : T.paperHi, border: `1px solid ${on ? col : T.paperDeep}`, boxShadow: on ? `0 0 0 1px ${col}, 0 2px 8px ${col}30` : "0 1px 3px rgba(58,44,26,0.08)", transform: on ? "translateY(-1px)" : "none", transition: "border-color .15s, box-shadow .15s, transform .15s" }}>
                      <span style={{ width: 27, height: 27, borderRadius: 8, background: `${col}1F`, display: "grid", placeItems: "center" }}><c.Icon size={15} color={col} /></span>
                      <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, color: on ? col : T.muted }}>{c.label}</span>
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "11px 0 10px" }}>
                <span style={{ width: 9, height: 9, borderRadius: 99, background: ph.hue }} />
                <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.inkSoft }}>
                  {phaseKey ? `${phaseLabel(phaseKey)}${cycleDay ? ` · Day ${cycleDay}` : ""} · ${ph.day}` : "A few good things today"}
                </span>
              </div>
              <button onClick={active.action.on} className="fw-elite-press"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", boxSizing: "border-box", background: aCol, color: "#fff", border: "none", borderRadius: 14, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "background .35s ease", marginBottom: 16 }}>
                <active.Icon size={16} /> {active.action.label}
              </button>
            </>
          );
        })()}

        <SummaryCard eyebrow="A few good things today" accent={gold} rows={[
          { Icon: Feather, label: "Today's chapter", text: story ? `${story.series_title || story.title || "Today's chapter"}${story.cliffhanger ? ` — "${story.cliffhanger}"` : ""}` : "Today's chapter is on its way — tap to open the Daily Story.", onClick: () => setChapterOpen(true) },
          { Icon: BookOpen, label: "Your reading", text: savedItems.length ? `${savedItems.length} saved to come back to · ${grouped.article.length} fresh reads` : (editorialPick ? editorialPick.title : "Fresh reads land here as they're published."), onClick: () => jumpTo(1) },
          { Icon: Moon, label: "Your sky", text: horoscope ? (horoscope.headline || horoscope.narrative || "Today's reading is ready.") : "Add your birth details to read today's sky.", onClick: () => setReadingOpen(true) },
        ]} />

        {/* two focus pills (out of cards) — Lifestyle's two daily rituals */}
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={() => setChapterOpen(true)} className="fw-elite-press" style={focusPill(crimson)}><Feather size={16} /> Today's chapter</button>
          <button onClick={() => jumpTo(0)} className="fw-elite-press" style={focusPill(plum)}><Clock size={16} /> What do you have time for?</button>
        </div>

        {/* ── "FOR YOU" (pass d) — a taste of EVERYTHING, one pick per SECTION ──────────────
            Was "Reads for you" (articles only). Now a cross-section digest: today's chapter ·
            a read · something to watch/listen · your sky · a book · a small joy — each chosen
            for her by getLifestyleFeed, each on the same tap-to-expand card language as the
            boards below. Sections with no real content are skipped, never faked (there are 0
            published podcasts/guides/fiction). The boards below stay intact. */}
        <div style={{ marginTop: 22 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "0 2px 8px" }}>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600, fontSize: 19, color: OXBLOOD }}>For you</span>
            <span style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 700, color: T.muted }}>A little of everything &rarr;</span>
          </div>
          <div style={{ height: 384 }}>
            <PeekShelf accent={gold}>
              {forYouItems.map((it) => (
                <div key={it.id} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <div style={{ ...lbl, marginBottom: 6, color: cwOf(it.cw || "gold").petal, flexShrink: 0 }}>{it.forYouSection}</div>
                  <div style={{ flex: 1, minHeight: 0 }}>
                    <CoverCard item={it} compact onOpen={() => setExpanded(it)} />
                  </div>
                </div>
              ))}
            </PeekShelf>
          </div>
        </div>

        <div ref={sliderRef} style={{ marginTop: 20, position: "relative" }}>
          <SliderArrows sliderRef={sliderRef} />
          <ClipboardSlider hint="Slide your shelf →" accent={gold}>

            {/* ══ THE SIX BOARDS — each a StackedCard of two peek shelves of tap-to-expand
                 cover-cards (§6.7.7). One board = one room = one job. Nothing stripped. ══ */}

            {/* ── BOARD 0 — THE GOOD LIFE (the doing room) ──────────────────── */}
            <Clipboard title="The good life" sub="WHAT DO YOU HAVE TIME FOR · PERMISSION & SMALL JOYS" accent={gold} flower="marigold" idx="cb-goodlife" titleColor={OXBLOOD}>
              <BoardBody h={900}>
                {/* position:relative → the FaceOverlay (piece C) covers exactly this card face */}
                <div style={{ position: "relative", height: "100%", minHeight: 0 }}>
                  <StackedShelves
                    top={
                      // TRUE REVERT (Halli, 2026-07-18) to the genuine pre-restructure state
                      // (commit 4f409b5, before the piece-D grid AND the piece-C prompt-card):
                      // the picker renders INLINE — three time-of-day chips + a real filtered
                      // list of content — filling the shelf, no empty placeholder card.
                      <PeekShelf label="What do you have time for?" accent={gold}>
                        {/* an interactive picker — kept as a real lens (a cover-card can't pick) */}
                        <Panel key="picker" label="Pick by the time you have" Icon={Clock} accent={gold}><TimePickerLens pickFor={pickFor} isSaved={isSaved} onSave={toggleSave} onOpen={openItem} onTry={saveTryThis} /></Panel>
                      </PeekShelf>
                    }
                    bottom={
                      // piece E — a permission/joy card opens IN-BOARD (FaceOverlay) into the
                      // fuller slip (slip big · why-it's-good · one doable thing), not the
                      // full-screen consume view. The CHOOSE surface, per §6.7.7.
                      <PeekShelf label="Permission & small joys" accent={plum}>
                        {[...ritualCards, ...permissionCards].map((it) => <CoverCard key={it.id} item={it} compact onOpen={() => setGLFace({ slip: it })} />)}
                      </PeekShelf>
                    } />
                  {/* piece E — a tapped permission/joy slip opens IN-BOARD in this FaceOverlay. */}
                  {(() => {
                    const slip = gLFace && typeof gLFace === "object" ? gLFace.slip : null;
                    return (
                      <FaceOverlay open={!!slip} onClose={() => setGLFace(null)}
                        accent={slip && slip.type === "quote" ? plum : gold}
                        title={slip && slip.type === "quote" ? "Permission" : "A small joy"}
                        sub="The slip · why it's good · one doable thing">
                        {slip && <PermissionSlipLens item={slip} done={!!gLDone[slip.id]} onDo={glTick} />}
                      </FaceOverlay>
                    );
                  })()}
                </div>
              </BoardBody>
            </Clipboard>

            {/* ── BOARD 1 — READ ────────────────────────────────────────────── */}
            <Clipboard title="Read" sub="ARTICLES & GUIDES · STORIES & FICTION" accent={plum} flower="iris" idx="cb-read" titleColor={OXBLOOD}>
              <BoardBody h={900}>
                <StackedShelves
                  top={<PeekShelf label="Articles & guides" accent={plum}>{articleCards.map((it) => <CoverCard key={it.id} item={it} compact onOpen={() => setExpanded(it)} />)}</PeekShelf>}
                  bottom={<PeekShelf label="Stories & fiction" accent={crimson}>{storyCards.map((it) => <CoverCard key={it.id} item={it} compact onOpen={() => setExpanded(it)} />)}</PeekShelf>} />
              </BoardBody>
            </Clipboard>

            {/* ── BOARD 2 — LISTEN & WATCH ──────────────────────────────────── */}
            <Clipboard title="Listen & watch" sub="PODCASTS & SHOWS · WATCH & TRENDING" accent={sage} flower="bluebell" idx="cb-listen" titleColor={OXBLOOD}>
              <BoardBody h={900}>
                <StackedShelves
                  top={<PeekShelf label="Podcasts & shows" accent={sage}>{audioCards.map((it) => <CoverCard key={it.id} item={it} compact onOpen={() => setExpanded(it)} />)}<MoreTile key="more-listen" label="Everything to listen" sub="Every episode + shows to follow, by length." accent={sage} /></PeekShelf>}
                  bottom={<PeekShelf label="Watch & trending" accent={gold}>{videoCards.map((it) => <CoverCard key={it.id} item={it} compact onOpen={() => setExpanded(it)} />)}<MoreTile key="more-watch" label="Everything to watch" sub="Our own contents page — flora covers, filters, no clutter." accent={gold} /></PeekShelf>}
                />
              </BoardBody>
            </Clipboard>

            {/* ── BOARD 3 — BOOKS ───────────────────────────────────────────── */}
            <Clipboard title="Books" sub="YOUR SHELF · FREE CLASSICS" accent={sky} flower="camellia" idx="cb-books" titleColor={OXBLOOD}>
              <BoardBody h={900}>
                <StackedShelves
                  top={<PeekShelf label="Your shelf" accent={sky}>{shelfBookCards.map((it) => <CoverCard key={it.id} item={it} compact onOpen={() => setExpanded(it)} />)}</PeekShelf>}
                  bottom={<PeekShelf label="Free classics" accent={sky}>{classicCards.map((it) => <CoverCard key={it.id} item={it} compact onOpen={() => setExpanded(it)} />)}</PeekShelf>} />
              </BoardBody>
            </Clipboard>

            {/* ── BOARD 4 — STORY & SKY (the two daily rituals) ─────────────── */}
            <Clipboard title="Story & sky" sub="TODAY'S CHAPTER · YOUR SKY" accent={crimson} flower="poppy" idx="cb-story" titleColor={OXBLOOD}>
              <BoardBody h={900}>
                <StackedShelves
                  top={<PeekShelf label="Today's chapter" accent={crimson}>{dailyStoryCards.map((it) => <CoverCard key={it.id} item={it} compact onOpen={() => setExpanded(it)} />)}</PeekShelf>}
                  bottom={
                    <PeekShelf label="Your sky" accent={sky}>
                      {horoscopeCards.map((it) => <CoverCard key={it.id} item={it} compact onOpen={() => setExpanded(it)} />)}
                      {/* the sky diary stays a real WRITE surface — a cover-card can't hold a composer */}
                      <Panel key="diary" label="Sky diary" Icon={Feather} accent={sky}><SkyDiaryLens notes={skyNotes} onNote={addSkyNote} /></Panel>
                    </PeekShelf>
                  } />
              </BoardBody>
            </Clipboard>

            {/* ── BOARD 5 — YOURS ───────────────────────────────────────────── */}
            <Clipboard title="Yours" sub="SAVED · FOR YOUR PHASE" accent={gold} flower="daisy" idx="cb-yours" titleColor={OXBLOOD}>
              <BoardBody h={900}>
                <StackedShelves
                  top={
                    // collections-ready: the label breaks the saves into their auto-shelves
                    <PeekShelf label={savedCards.length ? `Saved · ${savedSummary}` : "Saved"} accent={gold}>
                      {savedCards.length ? savedCards.map((it) => <CoverCard key={it.id} item={it} compact onOpen={() => setExpanded(it)} />)
                        : <Panel key="nosaved" label="Saved" Icon={Bookmark} accent={gold}><EmptyLine>Nothing saved yet — tap the heart on any read and it waits for you here.</EmptyLine></Panel>}
                    </PeekShelf>
                  }
                  bottom={
                    // real phase name when we have genuinely phase-tagged picks for her
                    <PeekShelf label={phaseCards.length && phaseKey ? `For your ${phaseLabel(phaseKey).toLowerCase()} week` : "For your phase"} accent={sage}>
                      {phaseCards.length ? phaseCards.map((it) => <CoverCard key={it.id} item={it} compact onOpen={() => setExpanded(it)} />)
                        : <Panel key="nophase" label="For your phase" Icon={Heart} accent={sage}><EmptyLine>Phase-tuned reads land here as they're tagged — for now, your For-you deck already leans into your week.</EmptyLine></Panel>}
                    </PeekShelf>
                  } />
              </BoardBody>
            </Clipboard>

          </ClipboardSlider>
        </div>

        <div style={{ display: "grid", placeItems: "center", margin: "18px 0 0" }}><Pollinator kind="butterfly" size={36} color={cwOf(ph.cw).petal} color2={cwOf(ph.cw).tip} pattern="bands" animate idx="elite-close" /></div>
        <p style={{ textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "6px auto 0", maxWidth: 300, lineHeight: 1.55 }}>A little to read, a little to feel — whenever the moment's yours.</p>
      </div>

      {jumpOpen && <JumpSheet boards={BOARDS} onClose={() => setJumpOpen(false)} onJump={jumpTo} />}
      {calOpen && <CalendarOverlay user={user} profile={profile} onClose={() => setCalOpen(false)} />}
      {/* tap-to-expand — the shared card language's full-screen detail (§6.7.7).
          Save is CONTROLLED → real persistence + the feed's learning loop. */}
      {expanded && <ExpandDetailCard item={expanded} onClose={() => setExpanded(null)} saved={isCardSaved(expanded)} onSave={onCardSave} />}
      {/* These sheets' buttons used to be no-ops that just closed — a button that lies is worse
          than no button. Each now does the real thing. */}
      {chapterOpen && (
        <ChapterSheet
          story={story}
          pick={storyPick}
          nextPick={storyNext}
          readSoFar={storyReadCount}
          onImmersive={() => { setChapterOpen(false); setReaderOpen(true); }}
          onClose={() => setChapterOpen(false)}
          onMarkRead={() => {
            markChapterRead(story?.id);
            recordProgress(story?.id || story?.series_title || "daily-story", story?.day_number ?? 0, user?.id);
            flash("Marked as read — it counts in your garden");
            setChapterOpen(false);
          }}
          onReflect={() => { setChapterOpen(false); window.location.assign(createPageUrl("Journal")); }}
        />
      )}
      {/* THE SKY (component #6) — the REAL horoscope reader, mounted at last. It carries the
          triad, today's weather, the cycle-moon dial, the sky diary, ask-the-sky, quiet mode,
          the science footer AND the birth-chart onboarding (BirthDataSheet) — which was
          unreachable while this was dark, so no new user could set up a chart at all.
          It self-loads (useBirthChart) and fires generateHoroscopeReading on open, which is
          why readings stopped on 2026-06-20: nothing had mounted this since. */}
      {skyOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1200, ...PAPER_BG, overflowY: "auto" }}>
          <div style={{ position: "sticky", top: 0, zIndex: 3, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: `linear-gradient(180deg, ${T.paperHi}, ${T.paperHi}00)` }}>
            <button onClick={() => setSkyOpen(false)} aria-label="Back" className="fw-elite-press"
              style={{ width: 40, height: 40, borderRadius: 999, background: "rgba(244,239,227,0.9)", border: `1px solid ${T.paperDeep}`, color: T.ink, display: "grid", placeItems: "center", cursor: "pointer" }}>
              <ChevronLeft size={19} />
            </button>
            <button onClick={() => { recordProgress("your-sky", 0, user?.id); flash("Marked as read — it counts in your garden"); }}
              className="fw-elite-press" style={{ ...focusPill(cwOf("sky").petal), flex: "0 0 auto", padding: "10px 14px" }}>
              <Check size={15} /> Mark as read
            </button>
          </div>
          <HoroscopeTab userProfile={profile} />
        </div>
      )}
      {/* the REAL immersive reader (component #5) — the finished series, straight through.
          Opens AT today's gated chapter; position/bookmarks persist; reaching a chapter marks
          it read AND records progress (the same Garden signal as "Mark as read"). */}
      {readerOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1200, ...PAPER_BG }}>
          <DailyStoryReader
            seriesKey={storyPick?.seriesKey || DAILY_STORY_SERIES}
            bookId={`daily_${storyPick?.seriesKey || DAILY_STORY_SERIES}`}
            goToChapter={storyPick?.index ?? 0}
            defaultImmersive
            onExit={() => setReaderOpen(false)}
            onChapterReached={(i) => {
              const c = chapters[i]; if (!c?.id) return;
              markChapterRead(c.id);
              recordProgress(c.id, c.day_number ?? i, user?.id);
            }}
          />
        </div>
      )}
      {/* #4 — a FemWell fiction book opens IN PLACE at our reader standard (ReadingColumn:
          cream paper, oxblood, flora, proper measure) — no navigation to a slow route. Same
          immersive DailyStoryReader as the daily story, fed the book's own chapters. */}
      {bookReader && (() => {
        const chs = buildBookChapters(bookReader);
        return (
          <div style={{ position: "fixed", inset: 0, zIndex: 1200, ...PAPER_BG }}>
            <DailyStoryReader source={{ kind: "book", items: chs, currentIndex: 0 }} totalCount={chs.length}
              defaultImmersive onExit={() => setBookReader(null)} bookId={bookReader.id} />
          </div>
        );
      })()}
      {readingOpen && (
        <ReadingSheet
          reading={horoscope} phaseKey={phaseKey}
          onClose={() => setReadingOpen(false)}
          onSaveReading={() => { savePlannerDay(horoscope?.headline || "Tonight's reading"); setReadingOpen(false); }}
          onSkyDiary={() => { setReadingOpen(false); jumpTo(4); }}
        />
      )}
      {toast && <div className="fw-elite-in" style={{ position: "fixed", left: "50%", bottom: "calc(110px + env(safe-area-inset-bottom))", transform: "translateX(-50%)", zIndex: 9999, background: T.ink, color: T.paperHi, fontFamily: UI, fontSize: 13, fontWeight: 600, padding: "10px 16px", borderRadius: 999, boxShadow: "0 4px 16px rgba(11,8,5,0.3)" }}>{toast}</div>}
    </div>
  );
}

// ── shared lens primitives ───────────────────────────────────────────────────
const ICON_OF = { article: BookOpen, story: Feather, book: Book, video: Film, audio: Headphones, guide: Compass };

// a per-type content row — accent-rim sub-card, deep-links the exact item; optional save heart
function ContentRow({ Icon, accent, title, meta, cta = "Open", saved, onSave, onOpen }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, ...subCard(accent), padding: "9px 11px" }}>
      <Icon size={16} color={accent} style={{ flexShrink: 0 }} />
      <button onClick={onOpen} className="fw-elite-press" style={{ flex: 1, minWidth: 0, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
        <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, display: "block", lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</span>
        {meta && <span style={{ fontFamily: UI, fontSize: 12, color: T.muted, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{meta}</span>}
      </button>
      {onSave ? (
        <button onClick={onSave} aria-label={saved ? "Remove from saved" : "Save"} className="fw-elite-press" style={{ background: "transparent", border: "none", cursor: "pointer", color: saved ? cwOf("crimson").petal : T.muted, flexShrink: 0 }}><Heart size={16} fill={saved ? cwOf("crimson").petal : "none"} /></button>
      ) : (
        <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: accent, flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 2 }}>{cta} <ChevronRight size={13} /></span>
      )}
    </div>
  );
}
function EmptyLine({ children }) {
  return <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: T.muted, margin: "2px 0 10px", lineHeight: 1.45 }}>{children}</p>;
}

// ── For you ──────────────────────────────────────────────────────────────────
function ForYouLens({ pick, more, isSaved, onSave, onOpen }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Eyebrow color={cwOf("crimson").petal}>Editor's pick</Eyebrow>
      {pick ? (
        <button onClick={() => onOpen(pick)} className="fw-elite-press" style={{ width: "100%", textAlign: "left", margin: "8px 0 14px", padding: 0, background: "transparent", border: "none", cursor: "pointer" }}>
          <div style={{ ...subCard(cwOf("crimson").petal), background: `${cwOf("crimson").petal}0D` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}><Feather size={13} color={cwOf("crimson").petal} /><span style={{ ...lbl, fontSize: 12, color: cwOf("crimson").petal }}>{lfTypeOf(pick)}</span></div>
            <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink, lineHeight: 1.25 }}>{pick.title}</div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, marginTop: 3 }}>{stripHtml(pick.why_it_matters || pick.summary || "") || metaOf(pick)}</div>
          </div>
        </button>
      ) : <EmptyLine>Fresh picks land here as they're published — open Read to browse the library.</EmptyLine>}
      <div style={{ ...lbl, marginBottom: 7 }}>More for you today</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(more || []).map((p) => { const t = lfTypeOf(p); return (
          <ContentRow key={p.id} Icon={ICON_OF[t] || BookOpen} accent={cwOf(t === "video" ? "gold" : t === "audio" ? "sage" : "plum").petal} title={p.title} meta={metaOf(p)} saved={isSaved(p.id)} onSave={() => onSave(p)} onOpen={() => onOpen(p)} />
        ); })}
        {(more || []).length === 0 && <EmptyLine>More reads will appear here through the day.</EmptyLine>}
      </div>
    </div>
  );
}
function SavedLens({ items, onOpen, onUnsave }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>The things you tucked away to come back to.</p>
      {items.length === 0 && <EmptyLine>Nothing saved yet — tap the heart on any read to keep it here.</EmptyLine>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{items.map((s) => { const t = lfTypeOf(s); return (
        <ContentRow key={s.id} Icon={ICON_OF[t] || BookOpen} accent={cwOf(t === "video" ? "gold" : t === "audio" ? "sage" : t === "book" ? "sky" : "plum").petal} title={s.title} meta={metaOf(s)} saved onSave={() => onUnsave(s)} onOpen={() => onOpen(s)} />
      ); })}</div>
    </div>
  );
}
function TryThisLens({ onDo }) {
  const [done, setDone] = useState({});   // local "saved" ticks (the write persists to PlannerItems)
  const trys = rotateDaily(TRY_THIS, 5);  // a fresh handful each day (Track A)
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>Small, doable, just-for-today. Tap one to keep it — it lands softly in your planner. No streaks, no pressure.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>{trys.map((t, i) => { const c = cwOf(t.cw).petal; const saved = done[i]; return (
        <button key={i} onClick={() => { setDone((d) => ({ ...d, [i]: true })); onDo(t.title); }} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", ...subCard(c), padding: "10px 12px", cursor: "pointer" }}>
          <span style={{ width: 28, height: 28, borderRadius: 9, background: saved ? c : `${c}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}>{saved ? <Check size={14} color="#fff" /> : <Wind size={14} color={c} />}</span>
          <span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, flex: 1 }}>{t.title}</span>
          {saved && <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: c, flexShrink: 0 }}>Saved</span>}
        </button>
      ); })}</div>
    </div>
  );
}
function PhasePicksLens({ items, phaseKey, isSaved, onSave, onOpen }) {
  // pull a gentle mix tuned to the phase — one of each type when available
  const picks = [items.article?.[1] || items.article?.[0], items.audio?.[0], items.video?.[0]].filter(Boolean).slice(0, 3);
  const label = phaseKey ? `Tuned to your ${phaseLabel(phaseKey).toLowerCase()} week — warmth, rest, and a softer pace.` : "A gentle mix for wherever you are today.";
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>{label}</p>
      {picks.length === 0 && <EmptyLine>Phase-tuned picks appear here as the library fills out.</EmptyLine>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{picks.map((p) => { const t = lfTypeOf(p); return (
        <ContentRow key={p.id} Icon={ICON_OF[t] || BookOpen} accent={cwOf(t === "video" ? "gold" : t === "audio" ? "sage" : "crimson").petal} title={p.title} meta={metaOf(p)} saved={isSaved(p.id)} onSave={() => onSave(p)} onOpen={() => onOpen(p)} />
      ); })}</div>
    </div>
  );
}

// ── The good life — dopamine-menu picker (bounded, by time; not a feed) ──
// The good-life TOP shelf renders TimePickerLens INLINE (three time-of-day chips + a real
// filtered list). The piece-D grid + the "Choose ›" prompt card were reverted 2026-07-18.

// Permission & small-joy slip — the fuller in-board view (piece E). Opens via the
// FaceOverlay into: the slip BIG (Cormorant, roomy) · "why this is good for you"
// (a real citation where evidence exists, an honest kindness where it doesn't —
// the two are visibly different so no slogan is laundered as science) · ONE doable
// thing that writes to the Planner and ticks + blooms in place, no navigation.
function PermissionSlipLens({ item, done, onDo }) {
  const isQuote = item.type === "quote";
  const accent = cwOf(isQuote ? "plum" : (item.cw || "gold")).petal;
  const why = item.why || WHY.plain;
  const cited = !!why.cite;
  const evAccent = cwOf(cited ? "sage" : (isQuote ? "plum" : "gold")).petal;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {/* the slip, big — the whole point */}
      <p style={{ fontFamily: SERIF, fontSize: 25, lineHeight: 1.3, color: OXBLOOD, fontWeight: 600, margin: "2px 0 6px" }}>{item.title}</p>
      {item.body?.[0] && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 16px" }}>{item.body[0]}</p>}

      {/* why this is good for you — cited (real evidence) OR an honest kindness */}
      <div style={{ ...subCard(evAccent), background: `${evAccent}0D`, padding: "12px 13px", marginBottom: 16 }}>
        <div style={{ ...lbl, marginBottom: 6, color: evAccent }}>{cited ? "Why this is good for you" : "A kindness, not a claim"}</div>
        <p style={{ fontFamily: SERIF, fontSize: 15.5, color: T.ink, lineHeight: 1.5, margin: 0 }}>{cited ? why.cite.finding : why.kindness}</p>
        {cited && <p style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, margin: "7px 0 0", fontStyle: "italic" }}>{why.cite.source}</p>}
      </div>

      {/* one doable thing — writes for real, ticks + blooms, no navigation */}
      {item.doable && (
        <button onClick={() => { if (!done) onDo(item.id, item.doable.title, item.doable.kind); }} disabled={done} className="fw-elite-press"
          style={{ width: "100%", padding: "12px", borderRadius: 13, border: "none", cursor: done ? "default" : "pointer",
            background: done ? `${accent}1A` : accent, color: done ? accent : "#fff", fontFamily: UI, fontSize: 14, fontWeight: 700,
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {done ? <><Check size={16} /> In your planner</> : <><Star size={15} /> {item.doable.label}</>}
        </button>
      )}
      {done && <div style={{ display: "grid", placeItems: "center", marginTop: 10 }}><Pollinator kind="butterfly" size={28} color={accent} color2={cwOf("gold").petal} pattern="bands" animate idx={`slipbloom-${item.id}`} /></div>}
    </div>
  );
}
function TimePickerLens({ pickFor, isSaved, onSave, onOpen, onTry }) {
  const [band, setBand] = useState(TIME_BANDS[0]);
  const picks = pickFor(band.key);
  const read = picks.read, listen = picks.listen;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 10px" }}>Pick by the time you have — a small, chosen handful, never an endless scroll.</p>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>{TIME_BANDS.map((b) => { const c = cwOf(b.cw).petal; const on = b.key === band.key; return (
        <button key={b.key} onClick={() => setBand(b)} className="fw-elite-press" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "9px 4px", borderRadius: 12, cursor: "pointer", background: on ? c : `${c}12`, border: `1px solid ${on ? c : c + "55"}` }}>
          <b.Icon size={16} color={on ? "#fff" : c} />
          <span style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 700, color: on ? "#fff" : T.inkSoft, textAlign: "center", lineHeight: 1.2 }}>{b.label}</span>
        </button>
      ); })}</div>
      <div style={{ ...lbl, marginBottom: 6 }}>For {band.label.toLowerCase()}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {read ? <ContentRow Icon={lfTypeOf(read) === "story" ? Feather : BookOpen} accent={cwOf("plum").petal} title={read.title} meta={`Read · ${metaOf(read)}`} saved={isSaved(read.id)} onSave={() => onSave(read)} onOpen={() => onOpen(read)} /> : <EmptyLine>A read lands here as the library fills out.</EmptyLine>}
        {listen ? <ContentRow Icon={lfTypeOf(listen) === "video" ? Film : Headphones} accent={cwOf("sage").petal} title={listen.title} meta={`Listen · ${metaOf(listen)}${listen.duration_label ? ` · ${listen.duration_label}` : ""}`} saved={isSaved(listen.id)} onSave={() => onSave(listen)} onOpen={() => onOpen(listen)} /> : <EmptyLine>A listen lands here as podcasts are added.</EmptyLine>}
        {/* the make / awe prompt — saves as a soft intention */}
        <button onClick={() => onTry(band.make.title)} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", ...subCard(cwOf("gold").petal), padding: "10px 12px", cursor: "pointer" }}>
          <span style={{ width: 28, height: 28, borderRadius: 9, background: `${cwOf("gold").petal}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><Sparkles size={14} color={cwOf("gold").petal} /></span>
          <span style={{ flex: 1, minWidth: 0 }}><span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, display: "block", lineHeight: 1.2 }}>{band.make.title}</span><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>{band.make.line}</span></span>
        </button>
      </div>
    </div>
  );
}
function PermissionLens({ phaseKey, onQuietHour }) {
  const slips = [
    ...rotateDaily(PERMISSION_SLIPS, 2),
    phaseKey ? `Your ${phaseLabel(phaseKey).toLowerCase()} week asks for a gentler pace. That's not falling behind.` : "A gentler pace today isn't falling behind.",
  ];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>Permission slips, not to-do lists. No streaks here — leisure is the point, guilt isn't invited.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{slips.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, ...subCard(cwOf("plum").petal), background: `${cwOf("plum").petal}0D`, padding: "10px 12px" }}>
          <Heart size={14} color={cwOf("plum").petal} style={{ flexShrink: 0, marginTop: 3 }} fill={cwOf("plum").petal} />
          <span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.45 }}>{s}</span>
        </div>
      ))}</div>
      <div style={{ marginTop: "auto", paddingTop: 12 }}>
        <button onClick={onQuietHour} className="fw-elite-press" style={{ width: "100%", padding: "11px", borderRadius: 12, background: cwOf("plum").petal, color: "#fff", border: "none", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Moon size={15} /> Book a quiet hour</button>
      </div>
    </div>
  );
}

// ── Read ──────────────────────────────────────────────────────────────────────
function ContentListLens({ items, type, cw, intro, isSaved, onSave, onOpen }) {
  const Icon = ICON_OF[type], accent = cwOf(cw).petal;
  const list = (items || []).slice(0, 5);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>{intro}</p>
      {list.length === 0 && <EmptyLine>New {type === "article" ? "essays" : "stories"} land here as they're published.</EmptyLine>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{list.map((it) => (
        <ContentRow key={it.id} Icon={Icon} accent={accent} title={it.title} meta={metaOf(it)} saved={isSaved(it.id)} onSave={() => onSave(it)} onOpen={() => onOpen(it)} />
      ))}</div>
    </div>
  );
}
function BooksLens({ books, onOpen, onDaily }) {
  const accent = cwOf("sky").petal;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>Today's chapter, FemWell fiction + free classics — open one into the reader.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{(books || []).map((b, i) => b.__kind === "daily" ? (
        <button key="daily" onClick={onDaily} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", ...subCard(cwOf("crimson").petal), background: `${cwOf("crimson").petal}0D`, padding: "9px 11px", cursor: "pointer" }}>
          <Feather size={16} color={cwOf("crimson").petal} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, minWidth: 0 }}><span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, display: "block", lineHeight: 1.2 }}>Today's chapter</span><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>Daily Story · read now</span></span>
          <ChevronRight size={14} color={cwOf("crimson").petal} style={{ flexShrink: 0 }} />
        </button>
      ) : (
        <div key={b.id || i} style={{ display: "flex", alignItems: "center", gap: 10, ...subCard(accent), padding: "9px 11px" }}>
          <Book size={16} color={accent} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, minWidth: 0 }}><span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, display: "block", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.title}</span><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>{[b.author || b.author_name, b.tag, b.stars ? "★".repeat(b.stars) : null].filter(Boolean).join(" · ")}</span></span>
          <button onClick={() => onOpen(b)} className="fw-elite-press" style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: "#fff", background: accent, border: "none", borderRadius: 999, padding: "5px 12px", cursor: "pointer", flexShrink: 0 }}>Open</button>
        </div>
      ))}</div>
      {(books || []).length === 0 && <EmptyLine>A shelf of good books appears here — today's chapter and free, public-domain reads.</EmptyLine>}
    </div>
  );
}
function GuidesLens({ items, onOpen }) {
  const accent = cwOf("gold").petal;
  const real = (items || []).slice(0, 4);
  const list = real.length ? real : null;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>Short how-tos — practical, never preachy.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {list
          ? list.map((g) => <ContentRow key={g.id} Icon={Compass} accent={accent} title={g.title} meta={metaOf(g)} cta="Read" onOpen={() => onOpen(g)} />)
          : rotateDaily(GUIDES_FALLBACK, 4).map((g, i) => <ContentRow key={i} Icon={Compass} accent={accent} title={g.title} meta={`${g.source} · ${g.why}`} cta="Read" onOpen={() => {}} />)}
      </div>
    </div>
  );
}

// ── Listen ──────────────────────────────────────────────────────────────────
function MediaLens({ items, kind, onOpen }) {
  const Icon = kind === "audio" ? Headphones : Film, accent = cwOf(kind === "audio" ? "sage" : "gold").petal;
  const real = (items || []).slice(0, 4);
  // Videos: many real LifestyleItems videos are link-out only (is_embeddable false / no video_id).
  // When NONE of the real ones actually play in-card, prepend a small hand-picked, verified-embeddable
  // set so inline video is visibly REAL (they play via youtube-nocookie through the same <LifestyleMedia>).
  // Real items are kept too — nothing is stripped.
  const realPlayableVideos = real.filter((r) => String(r.media_type || "").toUpperCase() === "VIDEO" && r.is_embeddable && (r.video_id || r.embed_url));
  const usingCurated = kind === "video" && realPlayableVideos.length === 0;
  const isCurated = (it) => String(it?.id || "").startsWith("lv-");
  const list = kind !== "video" ? real : (usingCurated ? [...LIFESTYLE_VIDEOS.slice(0, 4), ...real] : real);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>{kind === "audio" ? "Podcasts that play right here — no app-hopping." : "Short watches that play in the card."}</p>
      {usingCurated && <div style={{ ...lbl, marginBottom: 9 }}>Hand-picked to watch</div>}
      {list.length === 0 && <EmptyLine>{kind === "audio" ? "Podcasts" : "Videos"} play in the card as they're added.</EmptyLine>}
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>{list.map((it) => (
        <div key={it.id} style={{ ...subCard(accent), padding: "10px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Icon size={15} color={accent} style={{ flexShrink: 0 }} />
            <button onClick={() => isCurated(it) ? window.open(it.content_url, "_blank", "noopener,noreferrer") : onOpen(it)} className="fw-elite-press" style={{ flex: 1, minWidth: 0, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
              <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, display: "block", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.title}</span>
              <span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>{isCurated(it) ? it.channel_name : metaOf(it)}{it.duration_label ? ` · ${it.duration_label}` : ""}</span>
            </button>
          </div>
          {/* REAL inline player (audio <audio> / youtube-nocookie / link-out) by media_type */}
          <LifestyleMedia item={it} accent={accent} />
        </div>
      ))}</div>
    </div>
  );
}
function TikTokLens({ items }) {
  const real = (items || []).slice(0, 4);
  const accent = cwOf("crimson").petal;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>Short and trending — these open in the app they live in.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {real.length
          ? real.map((t) => (
              <div key={t.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                  <Music2 size={14} color={accent} style={{ flexShrink: 0 }} />
                  <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                </div>
                {/* link-out card (TIKTOK/INSTAGRAM never fake inline — per the plan) */}
                <LifestyleMedia item={t} accent={accent} />
              </div>
            ))
          : TIKTOKS_FALLBACK.map((t, i) => <ContentRow key={i} Icon={Music2} accent={cwOf(t.cw).petal} title={t.title} meta={t.channel} cta="Watch" onOpen={() => {}} />)}
      </div>
    </div>
  );
}
function ExternalLens() {
  // the REAL curated shows (12), rotated daily — retires the 2 hardcoded pods.
  const shows = rotateDaily(EXTERNAL_PODCASTS, 4);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>Shows worth following — open in your podcast app of choice.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{shows.map((p) => {
        const plat = p.platforms || {};
        const href = plat.spotify || plat.apple || plat.youtube || plat.pocketcasts;
        const note = [plat.apple && "Apple", plat.spotify && "Spotify"].filter(Boolean).join(" · ") || "Listen";
        return (
          <a key={p.id} href={href} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", ...subCard(cwOf("sage").petal), padding: "9px 11px" }}>
            <Compass size={16} color={cwOf("sage").petal} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, minWidth: 0 }}><span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, display: "block", lineHeight: 1.2 }}>{p.show}</span><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>{note}</span></span>
            <ExternalLink size={13} color={T.muted} style={{ flexShrink: 0 }} />
          </a>
        );
      })}</div>
    </div>
  );
}

// ── Story & sky ──────────────────────────────────────────────────────────────
function DailyStoryLens({ story, onRead }) {
  const accent = cwOf("crimson").petal;
  const title = story?.series_title || story?.title || "Today's chapter";
  const hook = story?.cliffhanger || "";
  const excerpt = stripHtml(story?.segment_text || "") || "Today's chapter is being written — tap below to open the Daily Story when it's ready.";
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Eyebrow color={accent}>Daily Story · today's chapter</Eyebrow>
      <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink, margin: "8px 0 4px" }}>{title}</div>
      {hook && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: accent, marginBottom: 12 }}>"{hook}"</div>}
      <div style={{ ...subCard(accent), background: `${accent}0D`, flex: 1, minHeight: 0, overflow: "hidden" }}><p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, margin: 0, lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 6, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{excerpt}</p></div>
      <button onClick={onRead} className="fw-elite-press" style={{ marginTop: 12, width: "100%", padding: "12px", borderRadius: 12, background: accent, color: "#fff", border: "none", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Read today's chapter</button>
    </div>
  );
}
function ADayLens({ onSave }) {
  const [chosen, setChosen] = useState(A_DAY.title);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Eyebrow color={cwOf("gold").petal}>A day for you</Eyebrow>
      <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink, margin: "8px 0 3px" }}>{chosen}</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, marginBottom: 12 }}>{A_DAY.line}</div>
      <button onClick={() => onSave(chosen)} className="fw-elite-press" style={{ width: "100%", padding: "11px", borderRadius: 12, background: cwOf("gold").petal, color: "#fff", border: "none", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 14 }}>Save it for the day</button>
      <div style={{ ...lbl, marginBottom: 7 }}>Or one of these</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{A_DAY.alts.map((a) => <Pill key={a} cw="sage" active={chosen === a} onClick={() => setChosen(a)}>{a}</Pill>)}</div>
    </div>
  );
}
function HoroscopeLens({ reading, phaseKey, onRead }) {
  const headline = reading?.headline || "Your sky today";
  const weather = reading?.narrative || "Add your birth details to read today's sky.";
  const moonPhase = reading?.moon_phase || "";
  const moonPct = Number.isFinite(reading?.moon_pct) ? `${Math.round(reading.moon_pct)}%` : "";
  // prefer the entity's own cycle↔moon pair; fall back to a gentle phase line
  const cmTitle = reading?.cycle_moon_headline || "Cycle ↔ moon";
  const cycleMoon = reading?.cycle_moon_body || (phaseKey ? `Your ${phaseLabel(phaseKey).toLowerCase()} week is meeting the moon — a gentle invitation to match your pace to the sky.` : "");
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {(moonPhase || phaseKey) && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {moonPhase && <div style={{ flex: 1, textAlign: "center", ...subCard(cwOf("plum").petal), padding: "10px 6px" }}><div style={{ ...lbl, fontSize: 12, color: cwOf("plum").petal }}>Moon</div><div style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, color: T.ink, marginTop: 2 }}>{moonPhase}{moonPct ? ` · ${moonPct}` : ""}</div></div>}
          {phaseKey && <div style={{ flex: 1, textAlign: "center", ...subCard(cwOf("crimson").petal), padding: "10px 6px" }}><div style={{ ...lbl, fontSize: 12, color: cwOf("crimson").petal }}>Your phase</div><div style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, color: T.ink, marginTop: 2 }}>{phaseLabel(phaseKey)}</div></div>}
        </div>
      )}
      <div style={{ ...subCard(cwOf("sky").petal), marginBottom: 10 }}><div style={{ ...lbl, fontSize: 12, color: cwOf("sky").petal, marginBottom: 3 }}>{headline}</div><p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, margin: 0, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{stripHtml(weather)}</p></div>
      {cycleMoon && <div style={{ ...subCard(cwOf("crimson").petal), background: `${cwOf("crimson").petal}0D` }}><div style={{ ...lbl, fontSize: 12, color: cwOf("crimson").petal, marginBottom: 3 }}>{cmTitle}</div><p style={{ fontFamily: SERIF, fontSize: 14, color: T.inkSoft, margin: 0, lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{stripHtml(cycleMoon)}</p></div>}
      <button onClick={onRead} className="fw-elite-press" style={{ marginTop: "auto", width: "100%", padding: "12px", borderRadius: 12, background: cwOf("sky").petal, color: "#fff", border: "none", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Read your full reading</button>
    </div>
  );
}
function SkyDiaryLens({ notes, onNote }) {
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const accent = cwOf("plum").petal;
  const real = (notes || []).filter((n) => n && n.text);
  // real rows replace the seeded lines once the user has written any
  const rows = real.length
    ? real.map((n) => ({ key: n.id, text: n.text, moon: n.moon_phase }))
    : SKY_DIARY_SEED.map((l, i) => ({ key: `seed-${i}`, text: l, moon: "" }));
  const submit = () => { const t = draft.trim(); if (!t) return; onNote(t); setDraft(""); setOpen(false); };
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>A quiet log against the sky — what each moon stirred.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{rows.map((r) => (
        <div key={r.key} style={{ display: "flex", alignItems: "flex-start", gap: 8, ...subCard(accent), padding: "9px 11px" }}>
          <Moon size={14} color={accent} style={{ flexShrink: 0, marginTop: 2 }} />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.4, display: "block" }}>{r.text}</span>
            {r.moon && <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>{r.moon}</span>}
          </span>
        </div>
      ))}</div>
      <div style={{ marginTop: "auto", paddingTop: 12 }}>
        {open ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={2} placeholder="What did tonight's sky stir?" autoFocus
              style={{ ...inputBase, resize: "none", lineHeight: 1.45 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <Pill Icon={Feather} cw="plum" filled onClick={submit}>Save note</Pill>
              <Pill cw="sage" onClick={() => { setOpen(false); setDraft(""); }}>Cancel</Pill>
            </div>
          </div>
        ) : (
          <Pill Icon={Feather} cw="plum" filled onClick={() => setOpen(true)}>New sky note</Pill>
        )}
      </div>
    </div>
  );
}

// ── sheets ──
function ChapterSheet({ story, pick, nextPick, readSoFar = 0, onImmersive, onClose, onMarkRead, onReflect }) {
  const title = story?.series_title || story?.title || "Today's chapter";
  const cliff = story?.cliffhanger || "";
  const body = stripHtml(story?.segment_text || "") || "Today's chapter is being written — check back soon. In the meantime, the Daily Story library is one tap away on the Lifestyle page.";
  const crimsonC = cwOf("crimson").petal;
  // HONEST framing — "Chapter 7 of 30", and we say plainly it's a finished story served a
  // chapter a day. Never "fresh today" unless it genuinely is.
  const label = pick ? chapterLabel(pick) : "today";
  return (
    <SheetShell title={title} eyebrowText={`Daily Story · ${label}`} accent={crimsonC} onClose={onClose}>
      <p style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, margin: "0 0 12px", lineHeight: 1.45 }}>{framingLine(pick)}</p>
      {/* §6.7.8 — today's chapter is FICTION: it reads through the shared column with the
          indent variant (indent, no paragraph gaps). The sheet already owns the gutter. */}
      <ReadingColumn variant="dailyStory" size={17} style={{ paddingInline: 0, marginBottom: 16 }}>
        {String(body || "").split(/\n\s*\n+/).filter(Boolean).map((para, i) => <p key={i}>{para}</p>)}
      </ReadingColumn>
      {cliff && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: crimsonC, margin: "0 0 16px" }}>"{cliff}"</p>}
      {/* the kind return model: where she's up to + a gentle tease. No streak, no scold. */}
      {(readSoFar > 0 || nextPick) && (
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: T.muted, margin: "0 0 14px", lineHeight: 1.5 }}>
          {readSoFar > 0 ? `You've read ${readSoFar} of ${pick?.total ?? 30} so far. ` : ""}
          {nextPick ? `Tomorrow: ${chapterLabel(nextPick).toLowerCase()}.` : ""}
        </p>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Pill cw="crimson" filled onClick={onMarkRead || onClose}>Mark as read</Pill>
        {onImmersive && <Pill Icon={BookOpen} cw="plum" onClick={onImmersive}>Read straight through</Pill>}
        <Pill cw="sage" onClick={onReflect || onClose}>Reflect on it</Pill>
      </div>
    </SheetShell>
  );
}
function ReadingSheet({ reading, phaseKey, onClose, onSaveReading, onSkyDiary }) {
  const headline = reading?.headline || "Your sky today";
  const narrative = reading?.narrative || "Add your birth details on the Horoscope tab to read today's full sky.";
  const moonPhase = reading?.moon_phase || "";
  // the verified section pairs — render each only when present
  const sections = [
    { title: reading?.power_title, body: reading?.power_body, cw: "gold" },
    { title: reading?.pressure_title, body: reading?.pressure_body, cw: "plum" },
    { title: reading?.trouble_title, body: reading?.trouble_body, cw: "crimson" },
    { title: reading?.cycle_moon_headline, body: reading?.cycle_moon_body, cw: "sky" },
  ].filter((s) => s.title || s.body);
  const fallbackCycle = !reading?.cycle_moon_body && phaseKey
    ? `Your ${phaseLabel(phaseKey).toLowerCase()} week is meeting the moon — a night to match your pace to the sky.` : "";
  return (
    <SheetShell title={headline} eyebrowText={phaseKey ? `${phaseLabel(phaseKey)} · the sky${moonPhase ? ` · ${moonPhase}` : ""}` : (moonPhase || "The sky")} accent={cwOf("sky").petal} onClose={onClose}>
      {/* §6.7.8 — the reading is prose: spaced paragraphs, no indent (horoscope variant). */}
      <ReadingColumn variant="horoscope" size={16.5} style={{ paddingInline: 0, marginBottom: 14 }}>
        {String(stripHtml(narrative) || "").split(/\n\s*\n+/).filter(Boolean).map((para, i) => <p key={i}>{para}</p>)}
      </ReadingColumn>
      {sections.map((s, i) => (
        <div key={i} style={{ ...subCard(cwOf(s.cw).petal), marginBottom: 12 }}>
          {s.title && <div style={{ ...lbl, fontSize: 12, color: cwOf(s.cw).petal, marginBottom: 4 }}>{s.title}</div>}
          {s.body && <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, margin: 0, lineHeight: 1.55 }}>{stripHtml(s.body)}</p>}
        </div>
      ))}
      {!sections.length && fallbackCycle && <div style={{ ...subCard(cwOf("crimson").petal), background: `${cwOf("crimson").petal}0D`, marginBottom: 12 }}><p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, margin: 0, lineHeight: 1.5 }}>{fallbackCycle}</p></div>}
      <div style={{ display: "flex", gap: 8 }}><Pill cw="sky" filled onClick={onSaveReading || onClose}>Save tonight's reading</Pill><Pill cw="sage" onClick={onSkyDiary || onClose}>Sky diary</Pill></div>
    </SheetShell>
  );
}
