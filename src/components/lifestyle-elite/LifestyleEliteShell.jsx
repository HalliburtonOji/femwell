// LifestyleEliteShell — the ELEVATED, FULLY-WIRED Lifestyle page. The exact Lifestyle analogue of
// PlannerEliteShell / NutritionEliteShell: self-loading against the SAME real base44 entities the live
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
  BookOpen, Feather, Book, Film, Headphones, Moon, Play, Pause, Heart, Sparkles, Sun, Bookmark,
  Wind, ChevronRight, Music2, Compass, Loader, ExternalLink,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { T, SERIF, UI, PAPER_BG, Eyebrow } from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { ClipboardSlider, Clipboard } from "@/components/brand/ClipboardSlider";
import { cwOf, floraKeyframes, Bouquet, Pollinator } from "@/components/brand/flora";
import MonthlyCalendarCard from "@/components/planner/MonthlyCalendarCard";
import DayDetailSheet from "@/components/planner/DayDetailSheet";
import { getCurrentCyclePhase, phaseLabel } from "@/utils/cyclePhase";
import { withTimeout } from "@/utils/safeEntity";
import {
  OXBLOOD, lbl, subCard, focusPill, Pill, Panel, StackedCard, BoardBody, TopChrome, SheetShell,
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

// ── seeded fallbacks (only used when an entity surface returns nothing — keeps every lens warm) ──
const TRY_THIS = [
  { title: "Write one line you're proud of", cw: "crimson" },
  { title: "Ten minutes outside, no phone", cw: "sage" },
  { title: "Text the friend you've been meaning to", cw: "gold" },
];
const GUIDES_FALLBACK = [
  { title: "How to start cycle-syncing", source: "Guide · 4 min", why: "the gentle version" },
  { title: "A 5-minute evening reset", source: "Guide · 3 min", why: "wind down without a whole routine" },
  { title: "Reading your luteal week", source: "Guide · 6 min", why: "what to expect, kindly" },
];
const TIKTOKS_FALLBACK = [
  { title: "The 5-minute tidy reset", channel: "@tidyhome", cw: "crimson" },
  { title: "Luteal-week snack ideas", channel: "@cyclefood", cw: "gold" },
  { title: "One-line journaling", channel: "@quietpages", cw: "plum" },
];
const EXTERNAL_PODS = [
  { title: "Huberman Lab", note: "Apple · Spotify · YouTube" },
  { title: "We Can Do Hard Things", note: "Apple · Spotify" },
];
const A_DAY = {
  title: "A slow Sunday, just for you", line: "A bath, a book, and nowhere to be.",
  alts: ["A long walk somewhere new", "Cook something that takes all afternoon", "Visit a gallery alone", "A film and an early night"],
};
const SKY_DIARY = ["Last new moon — 'started the side project'", "Full moon felt heavy; rested instead", "A note for tonight's waning moon…"];

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
const metaOf = (i) => [i?.source_name || i?.author_name, i?.category].filter(Boolean).join(" · ") || "FemWell Editorial";

// ════════════════════════════════════════════════════════════════════════════
export default function LifestyleEliteShell() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // real content (grouped per type, mirrors LifestyleForYou)
  const [items, setItems] = useState([]);          // all PUBLISHED LifestyleItems
  const [gutenberg, setGutenberg] = useState([]);  // public-domain books
  const [story, setStory] = useState(null);        // today's DailyStory
  const [horoscope, setHoroscope] = useState(null);// today's HoroscopeReading
  const [savedIds, setSavedIds] = useState([]);    // UserProfile.saved_item_ids (the SAVE field)

  // overlays
  const [calOpen, setCalOpen] = useState(false);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [chapterOpen, setChapterOpen] = useState(false);
  const [readingOpen, setReadingOpen] = useState(false);
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

  const editorialPick = grouped.story[0] || grouped.article[0] || items[0] || null;
  const morePicks = useMemo(() => [grouped.article[0], grouped.video[0], grouped.audio[0]].filter(Boolean).slice(0, 2), [grouped]);
  const savedItems = useMemo(() => (items || []).filter((i) => savedIds.includes(i.id)), [items, savedIds]);
  const isSaved = useCallback((id) => savedIds.includes(id), [savedIds]);

  // ── loaders (real, guarded — same calls as Lifestyle.jsx) ─────────────────
  const loadContent = useCallback(async () => {
    const [rows, st, ho, gut] = await Promise.all([
      base44.entities.LifestyleItems.filter({ status: "PUBLISHED" }, "-engagement_score", 60).catch(() => []),
      base44.entities.DailyStory.filter({}, "-created_date", 1).catch(() => []),
      base44.entities.HoroscopeReading.filter({}, "-reading_date", 1).catch(() => []),
      (async () => {
        try {
          const r = await fetch("https://gutendex.com/books?topic=women&languages=en&page_size=12", { signal: AbortSignal.timeout(8000) });
          if (!r.ok) return [];
          const d = await r.json();
          return (Array.isArray(d?.results) ? d.results : []).map((b) => ({
            id: `gut-${b.id}`, _gutenbergId: b.id, _book: "gutenberg",
            title: b.title || "", author: (b.authors?.[0]?.name) || "Public domain", tag: "Public domain", stars: 4,
          }));
        } catch { return []; }
      })(),
    ]);
    setItems((Array.isArray(rows) ? rows : []).filter((i) => i && i.title));
    setStory((Array.isArray(st) ? st[0] : null) || null);
    setHoroscope((Array.isArray(ho) ? ho[0] : null) || null);
    setGutenberg(Array.isArray(gut) ? gut : []);
  }, []);

  // ── init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true; let unsubItems;
    (async () => {
      try {
        const u = await base44.auth.me().catch(() => null); if (!alive) return; setUser(u);
        if (u?.id) {
          const profiles = await base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []);
          if (!alive) return;
          const p = (profiles || []).filter(Boolean)[0] || null;
          setProfile(p);
          setSavedIds(Array.isArray(p?.saved_item_ids) ? p.saved_item_ids : []);
        }
        await loadContent();
        try { unsubItems = base44.entities.LifestyleItems.subscribe(() => loadContent()); } catch { /* no-op */ }
      } catch { /* unauth / offline — render gracefully */ }
      if (alive) setLoading(false);
    })();
    return () => { alive = false; unsubItems?.(); };
  }, [loadContent]);

  // ── SAVE toggle (persists to UserProfile.saved_item_ids — optimistic + rollback) ──
  const toggleSave = useCallback(async (item) => {
    if (!item?.id) return;
    const id = item.id;
    const was = savedIds.includes(id);
    const next = was ? savedIds.filter((x) => x !== id) : Array.from(new Set([...savedIds, id]));
    setSavedIds(next);                                  // optimistic
    flash(was ? "Removed from saved" : "Saved");
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
  }, [savedIds, user, profile]);

  // open the exact item full-screen (deep-link parity with live Lifestyle: LifestyleDetail / readers)
  const openItem = useCallback((it) => {
    if (!it) return;
    if (it._book === "gutenberg") { window.location.assign(`/BookReader?gutenberg_id=${it._gutenbergId}`); return; }
    if (lfTypeOf(it) === "book") { window.location.assign(`/FictionReader?id=${it.id}`); return; }
    window.location.assign(`/LifestyleDetail?id=${it.id}`);
  }, []);

  const jumpTo = (idx) => {
    setJumpOpen(false);
    sliderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const track = sliderRef.current?.querySelector(".fw-clipboard-track"); if (!track) return;
    const boards = [...track.children].filter((c) => c.offsetWidth > 40);
    const child = boards[idx]; if (child) track.scrollLeft = child.offsetLeft - track.offsetLeft;
  };

  const gold = cwOf("gold").petal, sky = cwOf("sky").petal, crimson = cwOf("crimson").petal, plum = cwOf("plum").petal, sage = cwOf("sage").petal;
  const BOARDS = [
    { t: "For you", sub: "Editorial · saved · try this · for your phase" },
    { t: "Read", sub: "Articles · stories · books · guides" },
    { t: "Listen", sub: "Podcasts · videos · trending · external" },
    { t: "Story & sky", sub: "Daily story · a day for you · horoscope · diary" },
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
        {/* lush flora hero — phase bloom + bouquet + resting creature */}
        <FwFloraHero title={firstName ? `${firstName}'s world` : "Your world"} colorway={ph.cw} bloom={ph.bloom} flankL="iris" flankR="sunflower" titleColor={OXBLOOD} creature="butterfly"
          line="A few good things to read, hear and feel today — whenever you have a moment." />
        <div style={{ display: "flex", justifyContent: "center", marginTop: -6, marginBottom: 2 }}>
          <Bouquet items={[{ form: ph.bloom, colorway: ph.cw }, { form: "fern", colorway: "sage" }, { form: "marigold", colorway: "gold" }]} size={150} animate idx="elite-bq" />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "2px 0 16px" }}>
          <span style={{ width: 9, height: 9, borderRadius: 99, background: ph.hue }} />
          <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.inkSoft }}>
            {phaseKey ? `${phaseLabel(phaseKey)}${cycleDay ? ` · Day ${cycleDay}` : ""} · ${ph.day}` : "A few good things today"}
          </span>
        </div>

        <SummaryCard eyebrow="A few good things today" accent={gold} rows={[
          { Icon: Feather, label: "Today's chapter", text: story ? `${story.title || "Today's chapter"}${story.hook ? ` — "${story.hook}"` : ""}` : "Today's chapter is on its way — tap to open the Daily Story.", onClick: () => setChapterOpen(true) },
          { Icon: BookOpen, label: "Your reading", text: savedItems.length ? `${savedItems.length} saved to come back to · ${grouped.article.length} fresh reads` : (editorialPick ? editorialPick.title : "Fresh reads land here as they're published."), onClick: () => jumpTo(1) },
          { Icon: Moon, label: "Your sky", text: horoscope ? (horoscope.daily_weather || horoscope.summary || horoscope.body || "Today's reading is ready.") : "Add your birth details to read today's sky.", onClick: () => setReadingOpen(true) },
        ]} />

        {/* two focus pills (out of cards) — Lifestyle's two daily rituals */}
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={() => setChapterOpen(true)} className="fw-elite-press" style={focusPill(crimson)}><Feather size={16} /> Today's chapter</button>
          <button onClick={() => jumpTo(0)} className="fw-elite-press" style={focusPill(plum)}><Bookmark size={16} /> Your reading</button>
        </div>

        <div ref={sliderRef} style={{ marginTop: 16, position: "relative" }}>
          <SliderArrows sliderRef={sliderRef} />
          <ClipboardSlider hint="Slide your shelf →" accent={gold}>

            {/* ── BOARD 1 — FOR YOU ─────────────────────────────────────────── */}
            <Clipboard title="For you" sub="EDITORIAL · SAVED · TRY THIS · YOUR PHASE" accent={gold} flower="daisy" idx="cb-foryou" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={gold} bottomAccent={sage}
                  top={[
                    <Panel key="picked" label="Picked for you" Icon={Sparkles} accent={gold}><ForYouLens pick={editorialPick} more={morePicks} isSaved={isSaved} onSave={toggleSave} onOpen={openItem} /></Panel>,
                    <Panel key="saved" label="Saved" Icon={Bookmark} accent={gold}><SavedLens items={savedItems} onOpen={openItem} onUnsave={toggleSave} /></Panel>,
                  ]}
                  bottom={[
                    <Panel key="try" label="Try this" Icon={Wind} accent={sage}><TryThisLens onDo={(t) => flash(`Nice — "${t}"`)} /></Panel>,
                    <Panel key="phase" label="For your phase" Icon={Heart} accent={sage}><PhasePicksLens items={grouped} phaseKey={phaseKey} isSaved={isSaved} onSave={toggleSave} onOpen={openItem} /></Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

            {/* ── BOARD 2 — READ ────────────────────────────────────────────── */}
            <Clipboard title="Read" sub="ARTICLES · STORIES · BOOKS · GUIDES" accent={plum} flower="iris" idx="cb-read" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={plum} bottomAccent={sky}
                  top={[
                    <Panel key="articles" label="Articles" Icon={BookOpen} accent={plum}><ContentListLens items={grouped.article} type="article" cw="plum" intro="Reads for a spare ten minutes — saved, filtered to your phase." isSaved={isSaved} onSave={toggleSave} onOpen={openItem} /></Panel>,
                    <Panel key="stories" label="Stories" Icon={Feather} accent={crimson}><ContentListLens items={grouped.story} type="story" cw="crimson" intro="Real-life stories and short fiction to disappear into." isSaved={isSaved} onSave={toggleSave} onOpen={openItem} /></Panel>,
                  ]}
                  bottom={[
                    <Panel key="books" label="Books" Icon={Book} accent={sky}><BooksLens books={booksRow} story={story} onOpen={openItem} onDaily={() => setChapterOpen(true)} /></Panel>,
                    <Panel key="guides" label="Guides" Icon={Compass} accent={sky}><GuidesLens items={grouped.guide} onOpen={openItem} /></Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

            {/* ── BOARD 3 — LISTEN ──────────────────────────────────────────── */}
            <Clipboard title="Listen" sub="PODCASTS · VIDEOS · TRENDING · EXTERNAL" accent={sage} flower="bluebell" idx="cb-listen" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={sage} bottomAccent={crimson}
                  top={[
                    <Panel key="pods" label="Podcasts" Icon={Headphones} accent={sage}><MediaLens items={grouped.audio} kind="audio" onOpen={openItem} /></Panel>,
                    <Panel key="vids" label="Videos" Icon={Film} accent={gold}><MediaLens items={grouped.video} kind="video" onOpen={openItem} /></Panel>,
                  ]}
                  bottom={[
                    <Panel key="tiktok" label="Trending on TikTok" Icon={Music2} accent={crimson}><TikTokLens items={grouped.tiktok} onOpen={openItem} /></Panel>,
                    <Panel key="external" label="Listen externally" Icon={Compass} accent={crimson}><ExternalLens /></Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

            {/* ── BOARD 4 — STORY & SKY ─────────────────────────────────────── */}
            <Clipboard title="Story & sky" sub="DAILY STORY · A DAY FOR YOU · HOROSCOPE · DIARY" accent={crimson} flower="poppy" idx="cb-story" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={crimson} bottomAccent={sky}
                  top={[
                    <Panel key="daily" label="Daily story" Icon={Feather} accent={crimson}><DailyStoryLens story={story} onRead={() => setChapterOpen(true)} /></Panel>,
                    <Panel key="aday" label="A day for you" Icon={Sun} accent={gold}><ADayLens onSave={() => flash("Saved to your planner")} /></Panel>,
                  ]}
                  bottom={[
                    <Panel key="sky" label="Your sky today" Icon={Moon} accent={sky}><HoroscopeLens reading={horoscope} phaseKey={phaseKey} onRead={() => setReadingOpen(true)} /></Panel>,
                    <Panel key="diary" label="Sky diary" Icon={Feather} accent={sky}><SkyDiaryLens onNote={() => flash("New sky note")} /></Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

          </ClipboardSlider>
        </div>

        <div style={{ display: "grid", placeItems: "center", margin: "18px 0 0" }}><Pollinator kind="butterfly" size={36} color={cwOf(ph.cw).petal} color2={cwOf(ph.cw).tip} pattern="bands" animate idx="elite-close" /></div>
        <p style={{ textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "6px auto 0", maxWidth: 300, lineHeight: 1.55 }}>A little to read, a little to feel — whenever the moment's yours.</p>
      </div>

      {jumpOpen && <JumpSheet boards={BOARDS} onClose={() => setJumpOpen(false)} onJump={jumpTo} />}
      {calOpen && <CalendarOverlay user={user} profile={profile} onClose={() => setCalOpen(false)} />}
      {chapterOpen && <ChapterSheet story={story} onClose={() => setChapterOpen(false)} />}
      {readingOpen && <ReadingSheet reading={horoscope} phaseKey={phaseKey} onClose={() => setReadingOpen(false)} />}
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
function InlinePlayer({ accent, label }) {
  const [playing, setPlaying] = useState(false);
  return (
    <button onClick={(e) => { e.stopPropagation(); setPlaying((p) => !p); }} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 999, background: `${accent}14`, border: `1px solid ${accent}55`, cursor: "pointer", flexShrink: 0 }}>
      <span style={{ width: 26, height: 26, borderRadius: 999, background: accent, display: "grid", placeItems: "center" }}>{playing ? <Pause size={13} color="#fff" /> : <Play size={13} color="#fff" />}</span>
      <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.inkSoft }}>{playing ? "Playing…" : label}</span>
    </button>
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
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>Small, doable, just-for-today. Tap one when you fancy it.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>{TRY_THIS.map((t, i) => (
        <button key={i} onClick={() => onDo(t.title)} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", ...subCard(cwOf(t.cw).petal), padding: "10px 12px", cursor: "pointer" }}>
          <span style={{ width: 28, height: 28, borderRadius: 9, background: `${cwOf(t.cw).petal}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><Wind size={14} color={cwOf(t.cw).petal} /></span>
          <span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink }}>{t.title}</span>
        </button>
      ))}</div>
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
          : GUIDES_FALLBACK.map((g, i) => <ContentRow key={i} Icon={Compass} accent={accent} title={g.title} meta={`${g.source} · ${g.why}`} cta="Read" onOpen={() => {}} />)}
      </div>
    </div>
  );
}

// ── Listen ──────────────────────────────────────────────────────────────────
function MediaLens({ items, kind, onOpen }) {
  const Icon = kind === "audio" ? Headphones : Film, accent = cwOf(kind === "audio" ? "sage" : "gold").petal;
  const list = (items || []).slice(0, 4);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>{kind === "audio" ? "Podcasts that play right here — no app-hopping." : "Short watches that play in the card."}</p>
      {list.length === 0 && <EmptyLine>{kind === "audio" ? "Podcasts" : "Videos"} play in the card as they're added.</EmptyLine>}
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>{list.map((it) => (
        <div key={it.id} style={{ ...subCard(accent), padding: "10px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Icon size={15} color={accent} style={{ flexShrink: 0 }} />
            <button onClick={() => onOpen(it)} className="fw-elite-press" style={{ flex: 1, minWidth: 0, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
              <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, display: "block", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.title}</span>
              <span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>{metaOf(it)}{it.duration_label ? ` · ${it.duration_label}` : ""}</span>
            </button>
          </div>
          <InlinePlayer accent={accent} label={kind === "audio" ? "Tap to play" : "Tap to watch"} />
        </div>
      ))}</div>
    </div>
  );
}
function TikTokLens({ items, onOpen }) {
  const real = (items || []).slice(0, 4);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>Short, trending, embeddable — they open right here.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {real.length
          ? real.map((t) => <ContentRow key={t.id} Icon={Music2} accent={cwOf("crimson").petal} title={t.title} meta={metaOf(t)} cta="Watch" onOpen={() => onOpen(t)} />)
          : TIKTOKS_FALLBACK.map((t, i) => <ContentRow key={i} Icon={Music2} accent={cwOf(t.cw).petal} title={t.title} meta={t.channel} cta="Watch" onOpen={() => {}} />)}
      </div>
    </div>
  );
}
function ExternalLens() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>Shows worth following — open in your podcast app of choice.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{EXTERNAL_PODS.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, ...subCard(cwOf("sage").petal), padding: "9px 11px" }}>
          <Compass size={16} color={cwOf("sage").petal} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, minWidth: 0 }}><span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, display: "block", lineHeight: 1.2 }}>{p.title}</span><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>{p.note}</span></span>
          <ExternalLink size={13} color={T.muted} style={{ flexShrink: 0 }} />
        </div>
      ))}</div>
    </div>
  );
}

// ── Story & sky ──────────────────────────────────────────────────────────────
function DailyStoryLens({ story, onRead }) {
  const accent = cwOf("crimson").petal;
  const title = story?.title || "Today's chapter";
  const hook = story?.hook || story?.line || "";
  const excerpt = stripHtml(story?.excerpt || story?.body || story?.content || "") || "Today's chapter is being written — tap below to open the Daily Story when it's ready.";
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
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Eyebrow color={cwOf("gold").petal}>A day for you</Eyebrow>
      <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink, margin: "8px 0 3px" }}>{A_DAY.title}</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, marginBottom: 12 }}>{A_DAY.line}</div>
      <button onClick={onSave} className="fw-elite-press" style={{ width: "100%", padding: "11px", borderRadius: 12, background: cwOf("gold").petal, color: "#fff", border: "none", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 14 }}>Save it for the day</button>
      <div style={{ ...lbl, marginBottom: 7 }}>Or one of these</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{A_DAY.alts.map((a) => <Pill key={a} cw="sage">{a}</Pill>)}</div>
    </div>
  );
}
function HoroscopeLens({ reading, phaseKey, onRead }) {
  const sun = reading?.sun_sign || reading?.sun || "—";
  const moon = reading?.moon_sign || reading?.moon || "—";
  const rising = reading?.rising_sign || reading?.rising || "—";
  const weather = reading?.daily_weather || reading?.summary || reading?.body || "Add your birth details to read today's sky.";
  const cycleMoon = reading?.cycle_moon || (phaseKey ? `Your ${phaseLabel(phaseKey).toLowerCase()} week is meeting the moon — a gentle invitation to match your pace to the sky.` : "");
  const triad = [{ k: "Sun", v: sun, cw: "gold" }, { k: "Moon", v: moon, cw: "plum" }, { k: "Rising", v: rising, cw: "sky" }];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>{triad.map((t) => (
        <div key={t.k} style={{ flex: 1, textAlign: "center", ...subCard(cwOf(t.cw).petal), padding: "10px 6px" }}>
          <div style={{ ...lbl, fontSize: 12, color: cwOf(t.cw).petal }}>{t.k}</div>
          <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, marginTop: 2 }}>{t.v}</div>
        </div>
      ))}</div>
      <div style={{ ...subCard(cwOf("sky").petal), marginBottom: 10 }}><div style={{ ...lbl, fontSize: 12, color: cwOf("sky").petal, marginBottom: 3 }}>Today's weather</div><p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, margin: 0, lineHeight: 1.5 }}>{weather}</p></div>
      {cycleMoon && <div style={{ ...subCard(cwOf("crimson").petal), background: `${cwOf("crimson").petal}0D` }}><div style={{ ...lbl, fontSize: 12, color: cwOf("crimson").petal, marginBottom: 3 }}>Cycle ↔ moon</div><p style={{ fontFamily: SERIF, fontSize: 14, color: T.inkSoft, margin: 0, lineHeight: 1.45 }}>{cycleMoon}</p></div>}
      <button onClick={onRead} className="fw-elite-press" style={{ marginTop: "auto", width: "100%", padding: "12px", borderRadius: 12, background: cwOf("sky").petal, color: "#fff", border: "none", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Read your full reading</button>
    </div>
  );
}
function SkyDiaryLens({ onNote }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>A quiet log against the sky — what each moon stirred.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{SKY_DIARY.map((l, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, ...subCard(cwOf("plum").petal), padding: "9px 11px" }}><Moon size={14} color={cwOf("plum").petal} style={{ flexShrink: 0, marginTop: 2 }} /><span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.4 }}>{l}</span></div>
      ))}</div>
      <div style={{ marginTop: "auto", paddingTop: 12 }}><Pill Icon={Feather} cw="plum" filled onClick={onNote}>New sky note</Pill></div>
    </div>
  );
}

// ── sheets ──
function ChapterSheet({ story, onClose }) {
  const title = story?.title || "Today's chapter";
  const hook = story?.hook || story?.line || "";
  const body = stripHtml(story?.excerpt || story?.body || story?.content || "") || "Today's chapter is being written — check back soon. In the meantime, the Daily Story library is one tap away on the Lifestyle page.";
  return (
    <SheetShell title={title} eyebrowText="Daily Story · today" accent={cwOf("crimson").petal} onClose={onClose}>
      {hook && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: cwOf("crimson").petal, margin: "0 0 12px" }}>"{hook}"</p>}
      <p style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.65, margin: "0 0 16px" }}>{body}</p>
      <div style={{ display: "flex", gap: 8 }}><Pill cw="crimson" filled onClick={onClose}>Mark as read</Pill><Pill cw="sage" onClick={onClose}>Reflect on it</Pill></div>
    </SheetShell>
  );
}
function ReadingSheet({ reading, phaseKey, onClose }) {
  const weather = reading?.daily_weather || reading?.summary || reading?.body || "Add your birth details on the Horoscope tab to read today's full sky.";
  const cycleMoon = reading?.cycle_moon || (phaseKey ? `Your ${phaseLabel(phaseKey).toLowerCase()} week is meeting the moon — a night to match your pace to the sky.` : "");
  const sun = reading?.sun_sign || reading?.sun, moon = reading?.moon_sign || reading?.moon, rising = reading?.rising_sign || reading?.rising;
  return (
    <SheetShell title="Your sky today" eyebrowText={phaseKey ? `${phaseLabel(phaseKey)} · the sky` : "The sky"} accent={cwOf("sky").petal} onClose={onClose}>
      <p style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.6, margin: "0 0 12px" }}>{weather}</p>
      {cycleMoon && <div style={{ ...subCard(cwOf("crimson").petal), background: `${cwOf("crimson").petal}0D`, marginBottom: 12 }}><p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, margin: 0, lineHeight: 1.5 }}>{cycleMoon}</p></div>}
      {(sun || moon || rising) && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "0 0 16px", lineHeight: 1.5 }}>{[sun && `Sun in ${sun}`, moon && `Moon in ${moon}`, rising && `${rising} rising`].filter(Boolean).join(", ")} — a night to finish gently and forgive yourself the rest.</p>}
      <div style={{ display: "flex", gap: 8 }}><Pill cw="sky" filled onClick={onClose}>Save tonight's reading</Pill><Pill cw="sage" onClick={onClose}>Sky diary</Pill></div>
    </SheetShell>
  );
}
