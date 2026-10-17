// Curious — Track C board #4 (whole-life domain: learning, ideas, interests — intellectual
// delight). Curiosity for DELIGHT and ALIVENESS, never obligation: no test, no deadline, no
// CV, no streak. "Useless" knowledge is a joy. You are not behind.
//
// RESEARCHED brainstorm: claude-state/TRACKC_CURIOUS_BRAINSTORM.html (cited). Content MEASURED
// first (health content EXCLUDED — that lives in Health): SAFE pool 711 (586 article · 67
// podcast · 58 video). Sub-themes: arts & culture 529 · science & nature 115 · the mind 88 ·
// history 55. No new entity/function — self-loads real LifestyleItems + UserProfile phase.
//
// TONE DENIES (this domain's diet-culture): productivity-guilt / monetise-your-hobby / hustle,
// self-improvement-as-inadequacy, credentialism / "you're behind", curiosity-must-be-useful.
// FRAMING FIREWALL: never "keep your brain young / stave off decline" — that reframes wonder
// as fear. Curiosity for aliveness NOW. The science is real (curiosity lights up the reward
// circuit — Gruber/Ranganath, Neuron 2014) but it's the WHY-it-feels-good, never a promise.
import { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Telescope, Landmark, Brain, Palette, Shuffle, Sparkles, Headphones, MessageCircle, Feather, CalendarHeart, Users } from "lucide-react";
import { T, SERIF, UI } from "@/components/journal/Editorial";
import { OXBLOOD } from "@/components/brand/SliderKit";
import { CoverCard, ExpandDetailCard, decodeEntities } from "@/components/brand/expandCards";
import { GoodLifeSection as Section, GoodLifeShelf as Shelf } from "./GoodLifeRoomParts";
import { cwOf } from "@/components/brand/flora";
import { pickProfile } from "@/utils/userProfile";
import { createPageUrl } from "@/utils";
import { fmtDuration } from "@/utils/duration";
import { isClickbait } from "@/utils/clickbait";
import { cleanTitle } from "@/utils/cleanTitle";
import { useGoodLifeKeep } from "@/components/lifestyle-elite/useGoodLifeKeep";
import "./GoodLifeRoomsClean.css";

const dayOffset = () => Math.floor(Date.now() / 86400000);
const rotateDaily = (pool, n = 6) => {
  const a = (pool || []).filter(Boolean);
  if (a.length <= n) return a;
  const start = dayOffset() % a.length;
  return Array.from({ length: n }, (_, i) => a[(start + i) % a.length]);
};
const txtOf = (r) => {
  const tags = Array.isArray(r.tags) ? r.tags.join(" ") : (typeof r.tags === "string" ? r.tags : "");
  return `${r.title || ""} ${r.subtitle || ""} ${r.summary || ""} ${r.excerpt || ""} ${tags} ${r.category || ""}`.toLowerCase();
};
const hasAny = (r, kws) => kws.some((k) => txtOf(r).includes(k));
const isFiction = (r) => /STORY|DAILY/.test(String(r.media_type || "")) || /FICTION/.test(String(r.provider || "")) || /between us|tide|orchard|salt|shape of (staying|bloom)|shadow|wild green/i.test(r.title || "");
// health content lives in Health, not Curious
const HEALTH = ["cycle", "hormone", "period", "menstrual", "estrogen", "oestrogen", "ovulation", "luteal", "follicular", " pms ", "menopause", "perimenopause", "libido", "your body", "body image", "fertility", "pregnan", "postpartum", "symptom"];
// productivity-guilt / hustle / credentialism / must-be-useful
const DENY = ["side hustle", "side-hustle", "monetize", "monetise", "passive income", "side income", "make money from", "turn your hobby", "turn your passion into", "10x", "optimize your", "optimise your", "productivity hack", "girlboss", "level up your career", "upskill", "up-skill", "falling behind", "fix yourself", "best version of yourself", "upgrade yourself", "self-optimi", "skills that pay", "in-demand skills", "future-proof", "get ahead", "hustle culture", "keep your brain young", "stave off", "cognitive decline"];
const IDEAS = ["science", "history", "psychology", "philosophy", "the story of", "how it", "explained", "deep dive", "decoder", "fascinating", "the truth about", "documentary", "language", "space", "the brain", "culture", "art history", "big idea", "curious", "the history of", "why we"];

const LENS = [
  { key: "science", label: "Science & nature", Icon: Telescope, cw: "sky", kws: ["science", "nature", "space", "the brain", "climate", "physics", "biology", "animal", "ocean", "universe"], line: "The world is stranger and more wonderful than it lets on. Go and be amazed." },
  { key: "history", label: "History & people", Icon: Landmark, cw: "gold", kws: ["history", "the story of", "biography", "the history of", "century", "ancient", "war", "empire"], line: "Everyone who ever lived thought their time was the normal one. Go and meet them." },
  { key: "mind", label: "The mind", Icon: Brain, cw: "plum", kws: ["psychology", "the psychology of", "why we", "behaviour", "behavior", "the mind", "emotion", "memory"], line: "Why you do the things you do — half the fun is recognising yourself in it." },
  { key: "arts", label: "Arts & culture", Icon: Palette, cw: "crimson", kws: ["art", "music", "film", "book", "language", "culture", "design", "architecture", "poetry", "theatre"], line: "The things people make, and why they matter. No degree required — just taste and time." },
  { key: "surprise", label: "Surprise me", Icon: Shuffle, cw: "sage", kws: [], line: "The anti-algorithm. Something you'd never have gone looking for — that's the whole joy of it." },
];

export default function Curious() {
  const [items, setItems] = useState([]);
  // Podcasts are lower-engagement than articles, so the top-500 engagement fetch below misses
  // most of them — the "learn while your hands are busy" shelf starved. A dedicated PODCAST
  // read (not a new function) guarantees that shelf fills.
  const [podcasts, setPodcasts] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [lens, setLens] = useState(LENS[0]);
  const [expanded, setExpanded] = useState(null);
  const [itemsStatus, setItemsStatus] = useState("loading");
  const [podcastsStatus, setPodcastsStatus] = useState("loading");
  const [retryKey, setRetryKey] = useState(0);
  const [ownerId, setOwnerId] = useState(null);
  const { saved, saveError, onSave } = useGoodLifeKeep(ownerId, expanded);
  const sky = cwOf("sky").petal;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await base44.entities.LifestyleItems.filter({ status: "PUBLISHED" }, "-engagement_score", 500);
        if (alive) { setItems((Array.isArray(rows) ? rows : []).filter((r) => !isClickbait(r && r.title)).map((r) => (r ? { ...r, title: cleanTitle(r.title) } : r))); setItemsStatus("ready"); }
      } catch { if (alive) setItemsStatus("error"); }
      try {
        const pods = await base44.entities.LifestyleItems.filter({ status: "PUBLISHED", media_type: "PODCAST" }, "-created_date", 60);
        if (alive) { setPodcasts(Array.isArray(pods) ? pods : []); setPodcastsStatus("ready"); }
      } catch { if (alive) setPodcastsStatus("error"); }
      try {
        const u = await base44.auth.me().catch(() => null);
        if (u?.id) {
          if (alive) setOwnerId(u.id);
          const profs = await base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []);
          const p = pickProfile(profs);
          const nm = String(p?.display_name || u.full_name || "").trim().split(/\s+/)[0] || "";
          if (alive && nm && !/\d/.test(nm) && nm.length <= 16) setFirstName(nm[0].toUpperCase() + nm.slice(1));
        }
      } catch { /* anon */ }
    })();
    return () => { alive = false; };
  }, [retryKey]);

  const pool = useMemo(() => items.filter((r) => !isFiction(r) && !hasAny(r, HEALTH) && !hasAny(r, DENY) && (r.category === "Culture" || hasAny(r, IDEAS))), [items]);

  // adapter → CoverCard item. PODCAST with audio_url plays on the face (FloraAudio); VIDEO plays
  // inline (FloraYouTube) — the Phase-2 card-face players.
  const toCard = useCallback((r, cw) => {
    const mt = String(r.media_type || "").toUpperCase();
    const isVid = mt === "VIDEO" && r.video_id && r.is_embeddable !== false;
    const isAudio = (mt === "PODCAST" || mt === "CLIP") && r.audio_url;
    return {
      id: r.id,
      type: mt === "VIDEO" ? "video" : isAudio ? "audio" : "article",
      _raw: { ...r, source_url: r.source_url || r.episode_url }, sourceName: r.source_name || r.channel_name || "FemWell", actions: [],
      title: decodeEntities(r.title || ""),
      subtitle: r.source_name || r.channel_name || r.subtitle || "",
      summary: (r.summary || r.excerpt || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      category: r.category || "Culture", cw,
      Icon: isVid ? "Film" : isAudio ? "Headphones" : "Sparkles",
      kind: isVid ? "Watch · Curious" : isAudio ? "Listen · Curious" : "Read · Curious",
      meta: [["Clock", fmtDuration(r) || "a curious few minutes"]],
      ...(isVid ? { youtubeId: r.video_id } : {}),
      ...(isAudio ? { audioSrc: r.audio_url, playerLabel: decodeEntities(r.title || "") } : {}),
    };
  }, []);

  const rabbitHole = useMemo(() => { const r = rotateDaily(pool, 1)[0]; return r ? toCard(r, "gold") : null; }, [pool, toCard]);
  const lensPicks = useMemo(() => {
    if (lens.key === "surprise") { const shuffled = [...pool].sort((a, b) => ((a.id || "") + dayOffset()).localeCompare((b.id || "") + dayOffset())); return rotateDaily(shuffled, 4).map((r) => toCard(r, lens.cw)); }
    const matches = pool.filter((r) => hasAny(r, lens.kws));
    return rotateDaily(matches.length >= 2 ? matches : pool, 4).map((r) => toCard(r, lens.cw));
  }, [pool, lens, toCard]);

  const scienceCards = useMemo(() => rotateDaily(pool.filter((r) => hasAny(r, ["science", "nature", "space", "the brain", "climate", "physics", "biology", "animal"])), 6).map((r) => toCard(r, "sky")), [pool, toCard]);
  const mindCards = useMemo(() => rotateDaily(pool.filter((r) => hasAny(r, ["psychology", "the psychology of", "why we", "behaviour", "behavior", "the mind", "emotion"])), 6).map((r) => toCard(r, "plum")), [pool, toCard]);
  const artsCards = useMemo(() => rotateDaily(pool.filter((r) => hasAny(r, ["art", "music", "film", "book", "language", "culture", "design", "poetry"])), 6).map((r) => toCard(r, "crimson")), [pool, toCard]);
  // listen shelf draws from the dedicated podcast fetch (health/deny/fiction excluded), so it
  // fills even though podcasts sit below the top-500 engagement cut.
  const listenCards = useMemo(() => {
    const eligible = podcasts.filter((r) => r.audio_url && !isFiction(r) && !hasAny(r, HEALTH) && !hasAny(r, DENY));
    return rotateDaily(eligible, 6).map((r) => toCard(r, "sage"));
  }, [podcasts, toCard]);

  const summaryRows = useMemo(() => [
    { Icon: Sparkles, label: "Today", text: firstName ? `${firstName}, follow your curiosity — no test, no deadline, no reason it has to be useful. Just the pleasure of finding out.` : "Follow your curiosity — no test, no deadline, no reason it has to be useful. Just the pleasure of finding out." },
    { Icon: Shuffle, label: "The whole point", text: "A rabbit hole is a perfectly good way to spend an evening. \"Useless\" knowledge is one of life's real joys — you're allowed to learn things just because they're wonderful." },
    { Icon: Brain, label: "Why it sticks", text: "When something makes you curious, you're more likely to remember the answer. No homework required." },
  ], [firstName]);

  return (
    <div className="fw-good-clean fw-curious-clean" style={{ minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(124px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 16px 0" }}>
        <button onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/Lifestyle?section=good")} aria-label="Back to Good life" className="fw-elite-press"
          style={{ width: 44, height: 44, borderRadius: 999, border: "1px solid #EAE7E0", background: "#fff", color: OXBLOOD, display: "grid", placeItems: "center", cursor: "pointer" }}><ArrowLeft size={19} /></button>

        <header className="fw-good-hero fw-curious-hero"><span className="fw-good-path">GOOD LIFE / CURIOUS</span><span className="fw-curious-orbit" aria-hidden="true"/><span className="fw-curious-bluebell" aria-hidden="true"/><h1>Curious</h1><p>One good question can take you anywhere. Which way today?</p></header>
        <details className="fw-good-context"><summary>A note for today <span aria-hidden="true">+</span></summary><div className="fw-good-context-body">{summaryRows.map(({Icon,label,text}) => <div key={label} className="fw-good-context-row"><Icon size={16} aria-hidden="true"/><div><strong>{label}</strong><p>{text}</p></div></div>)}</div></details>

        {/* A · FOLLOW YOUR CURIOSITY — picker (incl. "surprise me" = the anti-algorithm) + the daily rabbit hole */}
        <Section Icon={Sparkles} title="Follow your curiosity" accent={cwOf(lens.cw).petal}
          sub="Pick a trail. Surprise me is a real one.">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {LENS.map((l) => { const on = l.key === lens.key; const c = cwOf(l.cw).petal; return (
              <button key={l.key} onClick={() => setLens(l)} className="fw-elite-press" aria-pressed={on}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 44, padding: "8px 13px", borderRadius: 999, cursor: "pointer", background: on ? "#51444e" : `${c}14`, border: `1px solid ${on ? "#51444e" : c + "55"}`, color: on ? "#fff" : "#51444e", fontFamily: UI, fontSize: 13, fontWeight: 700 }}>
                <l.Icon size={14} /> {l.label}
              </button>
            ); })}
          </div>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: T.muted, lineHeight: 1.5, margin: "0 2px 12px" }}>{lens.line}</p>
          <Shelf room="cur" onOpen={setExpanded} cards={lensPicks} empty={itemsStatus === "error" ? "" : itemsStatus === "loading" ? "Finding a read…" : "No read on this trail just now. Try another."} />
          {itemsStatus === "error" && <div className="fw-good-load-error" role="alert">The reads didn't arrive. <button type="button" onClick={() => { setItemsStatus("loading"); setPodcastsStatus("loading"); setRetryKey(value => value + 1); }}>Try again</button></div>}
        </Section>

        {/* the daily rabbit hole — one genuinely interesting thing, no task attached */}
        {rabbitHole && (
          <Section Icon={Shuffle} title="Down a rabbit hole" accent={cwOf("gold").petal}
            sub="Today's one fascinating thing. No reason. That's the reason.">
            <div className="fw-good-shelf fw-cur-rabbit" style={{ maxWidth: "min(90vw, 404px)" }}><CoverCard item={rabbitHole} presentation="folio" onOpen={() => setExpanded(rabbitHole)} /></div>
          </Section>
        )}

        <details className="fw-good-library"><summary>More trails · science, mind, culture &amp; listen <span aria-hidden="true">+</span></summary>
        {/* B · SCIENCE & NATURE — awe */}
        <Section Icon={Telescope} title="Science & the natural world" accent={sky}
          sub="The universe is under no obligation to make sense to us — and yet, sometimes, wonderfully, it does.">
          <Shelf room="cur" onOpen={setExpanded} cards={scienceCards} empty={itemsStatus === "error" ? "" : "No science read just now."} />
        </Section>

        {/* C · THE MIND — "that explains me" */}
        <Section Icon={Brain} title="The mind" accent={cwOf("plum").petal}
          sub="Why we feel, decide and misremember the way we do. The most fascinating subject is often yourself.">
          <Shelf room="cur" onOpen={setExpanded} cards={mindCards} empty={itemsStatus === "error" ? "" : "No mind read just now."} />
        </Section>

        {/* D · ARTS & CULTURE — the big browsable pool; no degree required */}
        <Section Icon={Palette} title="Arts & culture" accent={cwOf("crimson").petal}
          sub="Books, music, film, the made world — and why any of it moves us. Elitism not invited; taste is enough.">
          <Shelf room="cur" onOpen={setExpanded} cards={artsCards} empty={itemsStatus === "error" ? "" : "No culture read just now."} />
        </Section>

        {/* E · LISTEN WHILE YOUR HANDS ARE BUSY — the 67 podcasts, playing on the card face */}
        <Section Icon={Headphones} title="Learn while your hands are busy" accent={cwOf("sage").petal}
          sub="Wonder for the washing-up, the walk, the commute — press play right on the card.">
          <Shelf room="cur" onOpen={setExpanded} cards={listenCards} empty={podcastsStatus === "error" ? "" : podcastsStatus === "loading" ? "Finding a listen…" : "No listen here just now."} />
          {podcastsStatus === "error" && <div className="fw-good-load-error" role="alert">The listens didn't arrive. <button type="button" onClick={() => { setItemsStatus("loading"); setPodcastsStatus("loading"); setRetryKey(value => value + 1); }}>Try again</button></div>}
        </Section>
        </details>

        {/* F · CARRY IT ON */}
        <Section Icon={MessageCircle} title="Carry it on" accent={cwOf("gold").petal} sub="Curiosity doesn't end here.">
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {[
              { Icon: Sparkles, cw: "sky", label: "Ask Jess to explain something", sub: "\"Explain black holes / the French Revolution / why we dream — make it fascinating.\"", href: createPageUrl("Jess") },
              { Icon: Users, cw: "plum", label: "\"Currently obsessed with…\" in Community", sub: "Swap rabbit holes with people who love finding things out too.", href: createPageUrl("Community") },
              { Icon: Feather, cw: "sage", label: "Catch a thought in your Journal", sub: "The idea that struck you at 2pm — keep it before it floats off.", href: createPageUrl("Journal") },
              { Icon: CalendarHeart, cw: "crimson", label: "Curiosity out in the world", sub: "Talks, a museum late, a class you'd take just for the joy of it — in Events.", href: createPageUrl("Events") },
            ].map((r) => {
              const c = cwOf(r.cw).petal;
              return (
                <a key={r.label} href={r.href} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left", background: "#fff", border: "1px solid #EAE7E0", borderLeft: `3px solid ${c}`, borderRadius: 16, padding: "11px 13px", cursor: "pointer", textDecoration: "none" }}>
                  <span style={{ width: 34, height: 34, borderRadius: 10, background: `${c}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><r.Icon size={16} color={c} /></span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink, display: "block", lineHeight: 1.2 }}>{r.label}</span>
                    <span style={{ fontFamily: UI, fontSize: 12.5, color: T.muted }}>{r.sub}</span>
                  </span>
                </a>
              );
            })}
          </div>
        </Section>

        <div style={{ textAlign: "center", margin: "28px 0 0" }}>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, maxWidth: 340, lineHeight: 1.55, margin: "0 auto" }}>
            You're not behind, and none of this has to add up to anything. Wonder is its own reward — follow the ooh.
          </p>
        </div>
      </div>

      {expanded && <ExpandDetailCard item={expanded} onClose={() => setExpanded(null)} presentation="focused" room="good" saved={saved} onSave={onSave} error={saveError} />}
    </div>
  );
}
