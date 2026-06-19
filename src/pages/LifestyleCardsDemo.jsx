// ─────────────────────────────────────────────────────────────────────────────
// LifestyleCardsDemo.jsx — STANDALONE PREVIEW (not the live page).
//
// Applies the APPROVED card system to Lifestyle so Halli can review + approve
// BEFORE the live page is rebuilt. Self-contained: SEED sample content (+ a live
// Gutenberg fetch) with REAL playable media, so every spec item is actually
// VISIBLE here — not hidden behind the headless data-gating of the live page:
//   • FwFloraHero + ONE SummaryCard signature (§6.8)
//   • per-TYPE sliding rows: Articles · Books · Watch · Listen · Stories · Your sky
//   • INLINE video + INLINE audio that PLAY in the card (§6.7)
//   • BOOK card = paragraph hook → opens THAT book in the reader
//   • DAILY STORY first in the Books row; MORE than two books
//   • HOROSCOPE card with a real "what the moon is saying" snippet + its own row
//   • cards = the Today "across your day" card; PAPER_BG; §1 fonts; exact-item deep-links
// Reuses brand/Card.jsx + brand/PageTop.jsx verbatim (zero hand-rolled cards).
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Headphones, Feather, Moon, Play, Book } from "lucide-react";
import { createPageUrl } from "@/utils";
import { T, PAPER_BG, UI } from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import {
  FwCardRow, SummaryCard, ArticleCard, StoryCard, VideoCard, AudioCard,
  BookCard, DailyStoryCard, HoroscopeCard,
} from "@/components/brand/Card";

// ── SEED CONTENT — sample so the demo shows the FULL populated experience ──────
const ARTICLES = [
  { id: "demo-art-1", title: "The quiet power of a slow morning", summary: "Why the first twenty minutes of your day shape the other twenty-three hours — and a gentle way to reclaim them.", source_name: "FemWell Edit" },
  { id: "demo-art-2", title: "Friendship in your thirties, honestly", summary: "Fewer people, deeper roots. On the small rituals that keep grown-up friendships alive when everyone's busy.", source_name: "The Edit" },
  { id: "demo-art-3", title: "Money talks you can actually have", summary: "Five low-stakes scripts for the conversations we avoid — with partners, friends, and ourselves.", source_name: "FemWell Money" },
];
const VIDEOS = [
  { id: "demo-vid-1", title: "A 6-minute reset for tense shoulders", channel_name: "Move with Mara", video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", image_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg", summary: "Roll it out at your desk — no kit, no floor needed." },
  { id: "demo-vid-2", title: "How to actually read an ingredients label", channel_name: "FemWell Kitchen", video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", image_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg", summary: "The three words worth knowing on any packet." },
];
const AUDIOS = [
  { id: "demo-aud-1", title: "On rest without guilt", channel_name: "The Soft Life · Ep 12", audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", summary: "A 4-minute listen for the end of a long day." },
  { id: "demo-aud-2", title: "Cycle-syncing your week, lightly", channel_name: "Inner Seasons · Ep 7", audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", summary: "Plan with your energy, not against it." },
];
const STORIES = [
  { id: "demo-sto-1", title: "The text she never sent", summary: "A short, true-feeling story about the brave, ordinary act of changing your mind." },
  { id: "demo-sto-2", title: "Saturday, unplanned", summary: "What happened when she left one day completely open for the first time in years." },
];
const DAILY_STORY = {
  id: "demo-daily", title: "Chapter 9 — The Garden at Dusk",
  opening_line: "She had not meant to stay so long, but the light kept changing her mind.",
  excerpt: "The roses had gone the colour of embers, and somewhere past the wall a blackbird was rehearsing the same three notes, as if it too were trying to get the evening exactly right.",
};
const HOROSCOPE = {
  // moon_phase drives the card TITLE ("The moon is …"); narrative is the real
  // reading shown as the line. (No `headline` — it would just restate the title.)
  moon_phase: "waxing in Libra", reading_date: "today",
  narrative: "A good day to balance the books — emotional and otherwise. Say the kind thing first; the honest thing lands softer after it. One small act of fairness to yourself sets the tone.",
};

export default function LifestyleCardsDemo() {
  const navigate = useNavigate();
  const [gutenberg, setGutenberg] = useState([]);

  // Live public-domain books so the Books row has MORE than two — each opens THAT book.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("https://gutendex.com/books?topic=women&languages=en&page_size=12", { signal: AbortSignal.timeout(8000) });
        if (!r.ok) return;
        const d = await r.json();
        if (cancelled) return;
        setGutenberg((Array.isArray(d?.results) ? d.results : []).map((b) => ({
          id: `gut-${b.id}`, _gutenbergId: b.id, _book: "gutenberg",
          title: b.title || "", author_name: (b.authors?.[0]?.name) || "Public domain",
          summary: `A free, public-domain read${b.authors?.[0]?.name ? ` by ${b.authors[0].name}` : ""}.`,
          image_url: `https://www.gutenberg.org/cache/epub/${b.id}/pg${b.id}.cover.medium.jpg`,
        })));
      } catch { /* timeboxed; row still has the daily story */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const detail = (id) => navigate(createPageUrl(`LifestyleDetail?id=${id}`));
  const openBook = (it) => navigate(createPageUrl(`BookReader?gutenberg_id=${it._gutenbergId}`));
  const openDaily = () => navigate(createPageUrl("Lifestyle?tab=daily_story"));

  const recs = [
    { Icon: BookOpen, label: "Read", text: ARTICLES[0].title, onClick: () => detail(ARTICLES[0].id) },
    { Icon: Headphones, label: "Listen", text: AUDIOS[0].title, onClick: () => detail(AUDIOS[0].id) },
    { Icon: Feather, label: "Daily story", text: DAILY_STORY.title, onClick: openDaily },
  ];

  // Books row — DAILY STORY first, then the live public-domain books (more than two).
  const booksRow = [{ __kind: "daily" }, ...gutenberg].slice(0, 14);

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", paddingBottom: 96, position: "relative", overflowX: "clip" }}>
      {/* demo ribbon — makes clear this is a preview, with a way back to Ideas */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: T.paperHi, borderBottom: `1px solid ${T.paperDeep}` }}>
        <button onClick={() => navigate(createPageUrl("Ideas"))} aria-label="Back to Ideas"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "5px 11px", cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted }}>
          <ArrowLeft size={13} /> Ideas
        </button>
        <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.gold }}>
          Demo · Lifestyle · card system
        </span>
      </div>

      <FwFloraHero
        title="Lifestyle"
        bloom="hibiscus"
        colorway="coral"
        flankL="anemone"
        flankR="cosmos"
        creature="butterfly"
        line="A few good things to read, hear and feel today — whenever you have a moment."
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 600, margin: "18px auto 0", padding: "0 16px" }}>
          <SummaryCard rows={recs} />
        </div>

        <FwCardRow label="Articles" Icon={BookOpen} accent="#8E6E8E" items={ARTICLES}
          render={(it) => <ArticleCard key={it.id} item={it} onOpen={() => detail(it.id)} />} />

        <FwCardRow label="Books" Icon={Book} accent="#5F7E8E" items={booksRow}
          render={(it) => it.__kind === "daily"
            ? <DailyStoryCard key="daily" item={DAILY_STORY} onOpen={openDaily} />
            : <BookCard key={it.id} item={it} onOpen={() => openBook(it)} />} />

        <FwCardRow label="Watch" Icon={Play} accent={T.gold} items={VIDEOS}
          render={(it) => <VideoCard key={it.id} item={it} onOpen={() => detail(it.id)} />} />

        <FwCardRow label="Listen" Icon={Headphones} accent={T.sage} items={AUDIOS}
          render={(it) => <AudioCard key={it.id} item={it} onOpen={() => detail(it.id)} />} />

        <FwCardRow label="Stories" Icon={Feather} accent={T.crimson} items={STORIES}
          render={(it) => <StoryCard key={it.id} item={it} onOpen={() => detail(it.id)} />} />

        {/* Horoscope — a REAL snippet, as its own row */}
        <FwCardRow label="Your sky" Icon={Moon} accent="#5F7E8E" items={[{ __kind: "horo" }]}
          render={() => <HoroscopeCard key="horo" reading={HOROSCOPE} onOpen={() => navigate(createPageUrl("Lifestyle?tab=horoscope"))} />} />
      </div>
    </div>
  );
}
