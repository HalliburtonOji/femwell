// LifestyleNewDemo — Lifestyle rebuilt to the dense single-horizontal-slider pattern (like the Planner).
// Demo-first. Live /Lifestyle is NOT touched.
//
// WHY (Halli): live Lifestyle stacks 7 tabs of mostly-HALF-EMPTY rails down the page (For You's 3 short
// rails + bento, Listen's 3 rails + grid, A-Day-For-You, etc.) — endless downward scroll. This is ONE
// big horizontal slider; the many short per-type rows are folded into vertical up↕down segment cards.
// NOTHING stripped — every content type stays (articles · stories · books · videos · podcasts · tiktok ·
// daily story · horoscope · a-day-for-you · saved · try-this), with media still playing IN the card.
//
// BOARDS (one horizontal slider; cards slide horizontally, short ones slide vertically up↕down):
//   1) "For you"     — editorial picks · [Saved ↕ Try this]
//   2) "Read"        — [Articles ↕ Stories] · Books
//   3) "Listen"      — [Podcasts ↕ Videos] · Watch & trending (TikTok + external)
//   4) "Story & sky" — [Daily story ↕ A day for you] · Horoscope
// TOP-AREA CHROME (out of cards): Jump-to (left) + the two focus pills — Today's chapter · Your reading
// (Lifestyle's two daily rituals). Oxblood headings; varied card language (decks, vertical segments,
// accent-rim per-type sub-cards, colour pills, inline players). Seeded; reads LifestyleItems/DailyStory/
// HoroscopeReading/UserProfile.saved_item_ids live; no new base44 function.
import { useState, useRef } from "react";
import {
  BookOpen, Feather, Book, Film, Headphones, Moon, Play, Pause, Heart, Sparkles, Sun, Bookmark,
  Wind, ChevronRight, Music2, Video, Compass,
} from "lucide-react";
import { T, SERIF, UI, PAPER_BG, Eyebrow } from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { ClipboardSlider, Clipboard } from "@/components/brand/ClipboardSlider";
import { cwOf, floraKeyframes } from "@/components/brand/flora";
import { OXBLOOD, lbl, subCard, focusPill, Pill, Panel, Deck, VSeg, TopChrome, SheetShell, JumpSheet } from "@/components/brand/SliderKit";

// ── seeded content (maps to LifestyleItems / DailyStory / HoroscopeReading live) ──
const HERO = { type: "story", title: "The quiet power of a slow morning", source: "FemWell Editorial", why: "Editor's pick — on protecting the first hour of your day." };
const PICKS = [
  { type: "article", title: "Why your luteal week wants warmth", source: "The Edit", cw: "plum", Icon: BookOpen },
  { type: "video", title: "A 6-minute wind-down flow", source: "Move", cw: "gold", Icon: Film },
];
const SAVED = [
  { type: "article", title: "Boundaries that don't burn bridges", source: "Relationships", cw: "plum", Icon: BookOpen },
  { type: "audio", title: "On rest without guilt", source: "The Pause · podcast", cw: "sage", Icon: Headphones },
  { type: "book", title: "Wintering — Katherine May", source: "Book", cw: "sky", Icon: Book },
];
const TRY_THIS = [
  { title: "Write one line you're proud of", cw: "crimson" },
  { title: "Ten minutes outside, no phone", cw: "sage" },
  { title: "Text the friend you've been meaning to", cw: "gold" },
];
const ARTICLES = [
  { title: "Why your luteal week wants warmth", source: "The Edit · 5 min", why: "comfort food, cooked slow" },
  { title: "The myth of the morning person", source: "Mind · 7 min", why: "chronotypes, kindly explained" },
  { title: "Boundaries that don't burn bridges", source: "Relationships · 6 min", why: "scripts you can actually use" },
  { title: "Money talks you can have at home", source: "Money · 8 min", why: "gentle, not preachy" },
];
const STORIES = [
  { title: "The quiet power of a slow morning", source: "FemWell Editorial", why: "on protecting the first hour" },
  { title: "What the garden taught her", source: "Story · 9 min", why: "fiction, for a luteal evening" },
  { title: "A letter to my thirty-year-old self", source: "Voices · 6 min", why: "tender, true" },
];
const BOOKS = [
  { title: "Wintering", author: "Katherine May", tag: "FemWell pick", stars: 5 },
  { title: "Burnout", author: "Emily & Amelia Nagoski", tag: "On rest", stars: 5 },
  { title: "Persuasion", author: "Jane Austen", tag: "Public domain", stars: 4 },
  { title: "A Room of One's Own", author: "Virginia Woolf", tag: "Public domain", stars: 5 },
];
const PODCASTS = [
  { title: "On rest without guilt", channel: "The Pause", dur: "28 min" },
  { title: "Cycle-syncing your week", channel: "Hormone Hour", dur: "41 min" },
  { title: "The mental load, out loud", channel: "Fair Share", dur: "33 min" },
];
const VIDEOS = [
  { title: "A 6-minute wind-down flow", channel: "Move", dur: "6 min" },
  { title: "Iron-rich one-pan dinner", channel: "Kitchen", dur: "9 min" },
  { title: "Desk stretches for a long day", channel: "Move", dur: "4 min" },
];
const TIKTOKS = [
  { title: "The 5-minute tidy reset", channel: "@tidyhome", cw: "crimson" },
  { title: "Luteal-week snack ideas", channel: "@cyclefood", cw: "gold" },
  { title: "One-line journaling", channel: "@quietpages", cw: "plum" },
];
const EXTERNAL_PODS = [
  { title: "Huberman Lab", note: "Apple · Spotify · YouTube" },
  { title: "We Can Do Hard Things", note: "Apple · Spotify" },
];
const DAILY_STORY = {
  title: "The Greenhouse, Chapter 12", line: "She had not meant to keep the key.",
  excerpt: "The greenhouse smelled of warm earth and something older — the particular green hush of things that grow in the dark and don't mind it. She set down the watering can and, for the first time in weeks, did not reach for her phone.",
};
const A_DAY = {
  title: "A slow Sunday, just for you", line: "A bath, a book, and nowhere to be.",
  alts: ["A long walk somewhere new", "Cook something that takes all afternoon", "Visit a gallery alone", "A film and an early night"],
};
const SKY = {
  sun: "Scorpio", moon: "Cancer", rising: "Libra",
  weather: "The moon meets Venus tonight — a soft night for tenderness and putting something down you've been carrying.",
  cycleMoon: "Your luteal week is meeting a waning moon — both are asking you to draw inward and finish, not start.",
};

const ICON_OF = { article: BookOpen, story: Feather, book: Book, video: Film, audio: Headphones, daily_story: Feather, horoscope: Moon };
const CW_OF = { article: "plum", story: "crimson", book: "sky", video: "gold", audio: "sage", daily_story: "crimson", horoscope: "sky" };

// ════════════════════════════════════════════════════════════════════════════
export default function LifestyleNewDemo() {
  const [saved, setSaved] = useState(() => new Set());
  const [jumpOpen, setJumpOpen] = useState(false);
  const [chapterOpen, setChapterOpen] = useState(false);
  const [readingOpen, setReadingOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const sliderRef = useRef(null);

  const flash = (m) => { setToast(m); window.clearTimeout(flash._t); flash._t = window.setTimeout(() => setToast(null), 2000); };
  const toggleSave = (id) => { setSaved((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); flash(saved.has(id) ? "Removed" : "Saved"); }; // UserProfile.saved_item_ids
  const open = (t) => flash(`Opening "${t}"`); // live: deep-link the exact item full-screen
  const jumpTo = (idx) => { setJumpOpen(false); sliderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); const track = sliderRef.current?.querySelector(".fw-clipboard-track"); const child = track?.children?.[idx]; if (track && child) track.scrollLeft = child.offsetLeft - track.offsetLeft; };

  const gold = cwOf("gold").petal, sky = cwOf("sky").petal, crimson = cwOf("crimson").petal, plum = cwOf("plum").petal;
  const BOARDS = [{ t: "For you", sub: "Editorial · saved · try this" }, { t: "Read", sub: "Articles · stories · books" }, { t: "Listen", sub: "Podcasts · videos · trending" }, { t: "Story & sky", sub: "Daily story · a day for you · horoscope" }];

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }}>
      <style>{floraKeyframes}</style>
      <TopChrome onJump={() => setJumpOpen(true)} />

      <div style={{ maxWidth: 430, margin: "0 auto", padding: "16px 16px 0" }}>
        <FwFloraHero title="Lifestyle" colorway="gold" bloom="daisy" flankL="iris" flankR="sunflower" titleColor={OXBLOOD}
          line="A few good things to read, hear and feel today — whenever you have a moment." />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "8px 0 16px" }}>
          <span style={{ width: 9, height: 9, borderRadius: 99, background: cwOf("plum").petal }} />
          <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.inkSoft }}>Luteal · Day 23 · an evening-in kind of day</span>
        </div>

        <SummaryCard eyebrow="A few good things today" rows={[
          { Icon: Feather, label: "Today's chapter", text: `${DAILY_STORY.title} — "${DAILY_STORY.line}"`, onClick: () => setChapterOpen(true) },
          { Icon: Moon, label: "Your reading", text: SKY.weather, onClick: () => setReadingOpen(true) },
          { Icon: Sparkles, label: "For you", text: HERO.title, onClick: () => jumpTo(0) },
        ]} />

        {/* TOP-AREA focus pills (out of cards) — Lifestyle's two daily rituals */}
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={() => setChapterOpen(true)} style={focusPill(crimson)}><Feather size={16} /> Today's chapter</button>
          <button onClick={() => setReadingOpen(true)} style={focusPill(plum)}><Moon size={16} /> Your reading</button>
        </div>

        {/* ONE horizontal slider of 4 dense boards */}
        <div ref={sliderRef} style={{ marginTop: 16 }}>
          <ClipboardSlider hint="Slide your shelf →" accent={gold}>

            <Clipboard title="For you" sub="EDITORIAL · SAVED · TRY THIS" accent={gold} flower="daisy" idx="cb-foryou" titleColor={OXBLOOD}>
              <Deck accent={gold}>
                <Panel label="Picked for you" Icon={Sparkles} accent={gold}><ForYouPanel saved={saved} onSave={toggleSave} onOpen={open} /></Panel>
                <VSeg accent={gold}>
                  <Panel label="Saved" Icon={Bookmark} accent={cwOf("plum").petal}><SavedPanel saved={saved} onOpen={open} /></Panel>
                  <Panel label="Try this" Icon={Wind} accent={cwOf("sage").petal}><TryThisPanel onDo={(t) => flash(`Nice — "${t}"`)} /></Panel>
                </VSeg>
              </Deck>
            </Clipboard>

            <Clipboard title="Read" sub="ARTICLES · STORIES · BOOKS" accent={cwOf("plum").petal} flower="iris" idx="cb-read" titleColor={OXBLOOD}>
              <Deck accent={cwOf("plum").petal}>
                <VSeg accent={cwOf("plum").petal}>
                  <Panel label="Articles" Icon={BookOpen} accent={cwOf("plum").petal}><ListLens items={ARTICLES} type="article" onOpen={open} cta="Read" /></Panel>
                  <Panel label="Stories" Icon={Feather} accent={cwOf("crimson").petal}><ListLens items={STORIES} type="story" onOpen={open} cta="Read" /></Panel>
                </VSeg>
                <Panel label="Books" Icon={Book} accent={sky}><BooksPanel onOpen={open} /></Panel>
              </Deck>
            </Clipboard>

            <Clipboard title="Listen" sub="PODCASTS · VIDEOS · TRENDING" accent={cwOf("sage").petal} flower="bluebell" idx="cb-listen" titleColor={OXBLOOD}>
              <Deck accent={cwOf("sage").petal}>
                <VSeg accent={cwOf("sage").petal}>
                  <Panel label="Podcasts" Icon={Headphones} accent={cwOf("sage").petal}><MediaLens items={PODCASTS} kind="audio" onOpen={open} /></Panel>
                  <Panel label="Videos" Icon={Film} accent={gold}><MediaLens items={VIDEOS} kind="video" onOpen={open} /></Panel>
                </VSeg>
                <Panel label="Watch & trending" Icon={Video} accent={cwOf("crimson").petal}><WatchPanel onOpen={open} /></Panel>
              </Deck>
            </Clipboard>

            <Clipboard title="Story & sky" sub="DAILY STORY · A DAY FOR YOU · HOROSCOPE" accent={cwOf("crimson").petal} flower="poppy" idx="cb-story" titleColor={OXBLOOD}>
              <Deck accent={cwOf("crimson").petal}>
                <VSeg accent={cwOf("crimson").petal}>
                  <Panel label="Daily story" Icon={Feather} accent={cwOf("crimson").petal}><DailyStoryPanel onRead={() => setChapterOpen(true)} /></Panel>
                  <Panel label="A day for you" Icon={Sun} accent={gold}><ADayPanel onSave={() => flash("Saved to your planner")} /></Panel>
                </VSeg>
                <Panel label="Your sky today" Icon={Moon} accent={sky}><HoroscopePanel onRead={() => setReadingOpen(true)} /></Panel>
              </Deck>
            </Clipboard>

          </ClipboardSlider>
        </div>

        <p style={{ textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "20px auto 0", maxWidth: 300, lineHeight: 1.55 }}>A little to read, a little to feel — whenever the moment's yours.</p>
      </div>

      {jumpOpen && <JumpSheet boards={BOARDS} onClose={() => setJumpOpen(false)} onJump={jumpTo} />}
      {chapterOpen && <ChapterSheet onClose={() => setChapterOpen(false)} />}
      {readingOpen && <ReadingSheet onClose={() => setReadingOpen(false)} />}
      {toast && <div style={{ position: "fixed", left: "50%", bottom: "calc(110px + env(safe-area-inset-bottom))", transform: "translateX(-50%)", zIndex: 9999, background: T.ink, color: T.paperHi, fontFamily: UI, fontSize: 13, fontWeight: 600, padding: "10px 16px", borderRadius: 999, boxShadow: "0 4px 16px rgba(11,8,5,0.3)" }}>{toast}</div>}
    </div>
  );
}

// ── a per-type content row (accent-rim sub-card) ─────────────────────────────
function ContentRow({ Icon, accent, title, meta, cta = "Open", saved, onSave, onOpen }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, ...subCard(accent) }}>
      <Icon size={16} color={accent} style={{ flexShrink: 0 }} />
      <button onClick={onOpen} style={{ flex: 1, minWidth: 0, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
        <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, display: "block", lineHeight: 1.2 }}>{title}</span>
        {meta && <span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>{meta}</span>}
      </button>
      {onSave && <button onClick={onSave} aria-label="Save" style={{ background: "transparent", border: "none", cursor: "pointer", color: saved ? cwOf("crimson").petal : T.muted, flexShrink: 0 }}><Heart size={16} fill={saved ? cwOf("crimson").petal : "none"} /></button>}
      {!onSave && <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: accent, flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 2 }}>{cta} <ChevronRight size={13} /></span>}
    </div>
  );
}
function InlinePlayer({ accent, label }) {
  const [playing, setPlaying] = useState(false);
  return (
    <button onClick={(e) => { e.stopPropagation(); setPlaying((p) => !p); }} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 999, background: `${accent}14`, border: `1px solid ${accent}55`, cursor: "pointer", flexShrink: 0 }}>
      <span style={{ width: 26, height: 26, borderRadius: 999, background: accent, display: "grid", placeItems: "center" }}>{playing ? <Pause size={13} color="#fff" /> : <Play size={13} color="#fff" />}</span>
      <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.inkSoft }}>{playing ? "Playing…" : label}</span>
    </button>
  );
}

// ── For you ──────────────────────────────────────────────────────────────────
function ForYouPanel({ saved, onSave, onOpen }) {
  return (
    <div style={{ flex: 1 }}>
      <Eyebrow color={cwOf("crimson").petal}>Editor's pick</Eyebrow>
      <button onClick={() => onOpen(HERO.title)} style={{ width: "100%", textAlign: "left", margin: "8px 0 14px", padding: 0, background: "transparent", border: "none", cursor: "pointer" }}>
        <div style={{ ...subCard(cwOf("crimson").petal), background: `${cwOf("crimson").petal}0D` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}><Feather size={13} color={cwOf("crimson").petal} /><span style={{ ...lbl, fontSize: 12, color: cwOf("crimson").petal }}>Story</span></div>
          <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink, lineHeight: 1.25 }}>{HERO.title}</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, marginTop: 3 }}>{HERO.why}</div>
        </div>
      </button>
      <div style={{ ...lbl, marginBottom: 7 }}>More for you today</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {PICKS.map((p, i) => <ContentRow key={i} Icon={p.Icon} accent={cwOf(p.cw).petal} title={p.title} meta={p.source} saveId={"pick" + i} saved={saved.has("pick" + i)} onSave={() => onSave("pick" + i)} onOpen={() => onOpen(p.title)} />)}
      </div>
      <p style={{ marginTop: "auto", paddingTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>Slide → for the next card, ↓ for your saved.</p>
    </div>
  );
}
function SavedPanel({ saved, onOpen }) {
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>The things you tucked away to come back to.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{SAVED.map((s, i) => <ContentRow key={i} Icon={s.Icon} accent={cwOf(s.cw).petal} title={s.title} meta={s.source} cta="Open" onOpen={() => onOpen(s.title)} />)}</div>
      {saved.size > 0 && <div style={{ ...subCard(cwOf("crimson").petal), marginTop: 12, background: `${cwOf("crimson").petal}0D` }}><p style={{ fontFamily: SERIF, fontSize: 14, color: T.ink, margin: 0 }}>+ {saved.size} more saved just now. They'll be here whenever you are.</p></div>}
      <p style={{ marginTop: "auto", paddingTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>Slide ↓ for a tiny something to try.</p>
    </div>
  );
}
function TryThisPanel({ onDo }) {
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>Small, doable, just-for-today. Tap one when you fancy it.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>{TRY_THIS.map((t, i) => (
        <button key={i} onClick={() => onDo(t.title)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", ...subCard(cwOf(t.cw).petal), cursor: "pointer" }}>
          <span style={{ width: 28, height: 28, borderRadius: 9, background: `${cwOf(t.cw).petal}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><Wind size={14} color={cwOf(t.cw).petal} /></span>
          <span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink }}>{t.title}</span>
        </button>
      ))}</div>
      <p style={{ marginTop: "auto", paddingTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>No pressure — these are invitations, not tasks.</p>
    </div>
  );
}

// ── Read: article/story list lens ────────────────────────────────────────────
function ListLens({ items, type, onOpen, cta }) {
  const Icon = ICON_OF[type], accent = cwOf(CW_OF[type]).petal;
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>{type === "article" ? "Reads for a spare ten minutes — saved, filtered to your phase." : "Stories to disappear into for an evening."}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{items.map((it, i) => <ContentRow key={i} Icon={Icon} accent={accent} title={it.title} meta={`${it.source} · ${it.why}`} cta={cta} onOpen={() => onOpen(it.title)} />)}</div>
      <p style={{ marginTop: "auto", paddingTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>{type === "article" ? "Slide ↓ for stories." : "Each opens full-screen, just the one you chose."}</p>
    </div>
  );
}
function BooksPanel({ onOpen }) {
  const accent = cwOf("sky").petal;
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>FemWell fiction + free classics — open one into the reader.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{BOOKS.map((b, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, ...subCard(accent) }}>
          <Book size={16} color={accent} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, minWidth: 0 }}><span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, display: "block", lineHeight: 1.2 }}>{b.title}</span><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>{b.author} · {b.tag} · {"★".repeat(b.stars)}</span></span>
          <button onClick={() => onOpen(b.title)} style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: "#fff", background: accent, border: "none", borderRadius: 999, padding: "5px 12px", cursor: "pointer", flexShrink: 0 }}>Open</button>
        </div>
      ))}</div>
      <p style={{ marginTop: "auto", paddingTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>Your place is kept across every device.</p>
    </div>
  );
}

// ── Listen: media lens (inline player) + watch panel ─────────────────────────
function MediaLens({ items, kind, onOpen }) {
  const Icon = kind === "audio" ? Headphones : Film, accent = cwOf(kind === "audio" ? "sage" : "gold").petal;
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>{kind === "audio" ? "Podcasts that play right here — no app-hopping." : "Short watches that play in the card."}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>{items.map((it, i) => (
        <div key={i} style={{ ...subCard(accent) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Icon size={15} color={accent} style={{ flexShrink: 0 }} />
            <button onClick={() => onOpen(it.title)} style={{ flex: 1, minWidth: 0, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
              <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, display: "block", lineHeight: 1.2 }}>{it.title}</span>
              <span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>{it.channel} · {it.dur}</span>
            </button>
          </div>
          <InlinePlayer accent={accent} label={kind === "audio" ? "Tap to play" : "Tap to watch"} />
        </div>
      ))}</div>
      <p style={{ marginTop: "auto", paddingTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>{kind === "audio" ? "Slide ↓ for short videos." : "It plays here; the full screen is one tap away."}</p>
    </div>
  );
}
function WatchPanel({ onOpen }) {
  return (
    <div style={{ flex: 1 }}>
      <Eyebrow color={cwOf("crimson").petal}>Trending on TikTok</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "8px 0 14px" }}>{TIKTOKS.map((t, i) => <ContentRow key={i} Icon={Music2} accent={cwOf(t.cw).petal} title={t.title} meta={t.channel} cta="Watch" onOpen={() => onOpen(t.title)} />)}</div>
      <Eyebrow color={cwOf("sage").petal}>Listen externally</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>{EXTERNAL_PODS.map((p, i) => <ContentRow key={i} Icon={Compass} accent={cwOf("sage").petal} title={p.title} meta={p.note} cta="Open" onOpen={() => onOpen(p.title)} />)}</div>
      <p style={{ marginTop: "auto", paddingTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>The wider world, gathered in one calm place.</p>
    </div>
  );
}

// ── Story & sky ──────────────────────────────────────────────────────────────
function DailyStoryPanel({ onRead }) {
  return (
    <div style={{ flex: 1 }}>
      <Eyebrow color={cwOf("crimson").petal}>Daily Story · today's chapter</Eyebrow>
      <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink, margin: "8px 0 4px" }}>{DAILY_STORY.title}</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: cwOf("crimson").petal, marginBottom: 12 }}>"{DAILY_STORY.line}"</div>
      <div style={{ ...subCard(cwOf("crimson").petal), background: `${cwOf("crimson").petal}0D`, flex: 1 }}><p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, margin: 0, lineHeight: 1.6 }}>{DAILY_STORY.excerpt}</p></div>
      <button onClick={onRead} style={{ marginTop: 12, width: "100%", padding: "12px", borderRadius: 12, background: cwOf("crimson").petal, color: "#fff", border: "none", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Read today's chapter</button>
    </div>
  );
}
function ADayPanel({ onSave }) {
  return (
    <div style={{ flex: 1 }}>
      <Eyebrow color={cwOf("gold").petal}>A day for you</Eyebrow>
      <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink, margin: "8px 0 3px" }}>{A_DAY.title}</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, marginBottom: 12 }}>{A_DAY.line}</div>
      <button onClick={onSave} style={{ width: "100%", padding: "11px", borderRadius: 12, background: cwOf("gold").petal, color: "#fff", border: "none", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 14 }}>Save it for the day</button>
      <div style={{ ...lbl, marginBottom: 7 }}>Or one of these</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{A_DAY.alts.map((a) => <Pill key={a} cw="sage">{a}</Pill>)}</div>
      <p style={{ marginTop: "auto", paddingTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>Found for you — because rest is a plan, not a leftover.</p>
    </div>
  );
}
function HoroscopePanel({ onRead }) {
  const triad = [{ k: "Sun", v: SKY.sun, cw: "gold" }, { k: "Moon", v: SKY.moon, cw: "plum" }, { k: "Rising", v: SKY.rising, cw: "sky" }];
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>{triad.map((t) => (
        <div key={t.k} style={{ flex: 1, textAlign: "center", ...subCard(cwOf(t.cw).petal), padding: "10px 6px" }}>
          <div style={{ ...lbl, fontSize: 12, color: cwOf(t.cw).petal }}>{t.k}</div>
          <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, marginTop: 2 }}>{t.v}</div>
        </div>
      ))}</div>
      <div style={{ ...subCard(cwOf("sky").petal), marginBottom: 10 }}><div style={{ ...lbl, fontSize: 12, color: cwOf("sky").petal, marginBottom: 3 }}>Today's weather</div><p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, margin: 0, lineHeight: 1.5 }}>{SKY.weather}</p></div>
      <div style={{ ...subCard(cwOf("crimson").petal), background: `${cwOf("crimson").petal}0D` }}><div style={{ ...lbl, fontSize: 12, color: cwOf("crimson").petal, marginBottom: 3 }}>Cycle ↔ moon</div><p style={{ fontFamily: SERIF, fontSize: 14, color: T.inkSoft, margin: 0, lineHeight: 1.45 }}>{SKY.cycleMoon}</p></div>
      <button onClick={onRead} style={{ marginTop: "auto", width: "100%", padding: "12px", borderRadius: 12, background: cwOf("sky").petal, color: "#fff", border: "none", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Read your full reading</button>
    </div>
  );
}

// ── sheets ──
function ChapterSheet({ onClose }) {
  return (
    <SheetShell title={DAILY_STORY.title} eyebrowText="Daily Story · today" accent={cwOf("crimson").petal} onClose={onClose}>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: cwOf("crimson").petal, margin: "0 0 12px" }}>"{DAILY_STORY.line}"</p>
      <p style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.65, margin: "0 0 12px" }}>{DAILY_STORY.excerpt}</p>
      <p style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.65, margin: "0 0 16px" }}>She turned the key over once in her palm, warm now from holding, and decided — just for tonight — that some doors are kinder left unlocked.</p>
      <div style={{ display: "flex", gap: 8 }}><Pill cw="crimson" filled onClick={onClose}>Mark as read</Pill><Pill cw="sage" onClick={onClose}>Reflect on it</Pill></div>
    </SheetShell>
  );
}
function ReadingSheet({ onClose }) {
  return (
    <SheetShell title="Your sky today" eyebrowText="Luteal · waning moon" accent={cwOf("sky").petal} onClose={onClose}>
      <p style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.6, margin: "0 0 12px" }}>{SKY.weather}</p>
      <div style={{ ...subCard(cwOf("crimson").petal), background: `${cwOf("crimson").petal}0D`, marginBottom: 12 }}><p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, margin: 0, lineHeight: 1.5 }}>{SKY.cycleMoon}</p></div>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "0 0 16px", lineHeight: 1.5 }}>Sun in {SKY.sun}, Moon in {SKY.moon}, {SKY.rising} rising — a night to finish gently and forgive yourself the rest.</p>
      <div style={{ display: "flex", gap: 8 }}><Pill cw="sky" filled onClick={onClose}>Save tonight's reading</Pill><Pill cw="sage" onClick={onClose}>Sky diary</Pill></div>
    </SheetShell>
  );
}
