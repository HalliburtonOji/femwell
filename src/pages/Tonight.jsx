// Tonight — Track C board #7 (whole-life domain: the evening wind-down, a gentle end to the
// day). A soft landing — rest and sleep for their OWN sake, gently. NEVER another thing to
// optimise, track, score or fail at. Permission to switch off, permission for an unfinished day.
//
// RESEARCHED brainstorm: claude-state/TRACKC_TONIGHT_BRAINSTORM.html (cited). Content MEASURED:
// raw wind-down content is THIN (~5 genuine "wind down" items; the broad calm pool is polluted
// with cycle-health + philosophy). So — LEAN like Nest — an EDITORIAL wind-down-ritual spine +
// a small calm shelf. BUT Tonight ASSEMBLES THE EVENING: the DailyStory ("tonight's chapter")
// and HoroscopeReading ("the night sky") are live + refresh nightly for free. No new entity/fn.
//
// RESEARCH FIREWALL: a small lab bedtime-writing trial and orthosomnia case report do not predict
// an individual's sleep. No score, debt, tracker, or guarantee belongs here. Rest counts even when sleep
// doesn't come. SENSITIVITY: many readers are NOT sleeping (babies, menopause, anxiety, shifts)
// — good sleep is NEVER framed as a personal achievement or failing.
import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Moon, Feather, Sparkles, Wind, BookOpen, MessageCircle, CalendarCheck, Stars } from "lucide-react";
import { ExpandDetailCard, decodeEntities } from "@/components/brand/expandCards";
import { GoodLifeSection as Section, GoodLifeShelf as Shelf } from "./GoodLifeRoomParts";
import { useGoodLifeKeep } from "@/components/lifestyle-elite/useGoodLifeKeep";
import { chapterForDay, chapterForHer, isoDay } from "@/components/lifestyle/dailyStory";
import "./GoodLifeRoomsClean.css";
import { cwOf } from "@/components/brand/flora";
import { pickProfile } from "@/utils/userProfile";
import { createPageUrl } from "@/utils";
import { fmtDuration } from "@/utils/duration";
import { isClickbait } from "@/utils/clickbait";
import { cleanTitle } from "@/utils/cleanTitle";

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

// keep cycle-health + philosophy + optimisation pollution out of the calm shelf
const NOT = ["cycle", "estrogen", "oestrogen", "menstrual", "follicular", "luteal", "ovulation", "hormone", "menopause", "perimenopause", "productive", "productivity", "workout", "fitness", "calorie", "weight loss", "space and time", "attracted to a person", "vinted", "being lived", "democracy"];
const DENY = ["optimi", "sleep score", "sleep debt", "biohack", "5am club", "5 am club", "perfect night's sleep", "perfect sleep", "sleep hack", "hack your sleep", "wrecking your", "ruining your sleep", "you're sleeping wrong", "revenge bedtime", "grind", "hustle", "track your sleep", "sleep tracker"];
const CALM = ["meditation", "mindful", "breath", "body scan", "yoga nidra", "restorative", "soothing", "yoga", "calm", "relax", "sleep meditation", "gentle", "unwind", "lullab"];

// THE SPINE — evening-specific wind-down rituals. Gentle, low-demand, permission-based. Includes
// explicit lines for the not-sleeping (a baby, a hot flush, a racing mind) — never smug.
const RITUALS = [
  "Big light off, lamps on — tell your body the day is closing.",
  "Phone on charge across the room, out of arm's reach.",
  "A warm shower about an hour before bed; it's the cool-down after that makes you sleepy.",
  "Write tomorrow's worries on paper and shut them in a drawer till morning.",
  "Ten slow breaths, the out-breath longer than the in. That's the whole practice.",
  "Socks and the good blanket, if that sounds lovely tonight.",
  "One chapter, on paper if you have it, screen dimmed if you don't.",
  "Let the house stay a bit messy tonight. It'll keep.",
  "Dim everything for the last hour — your eyes tell your brain it's night.",
  "The to-do list is closed. Nothing productive past this point, by order.",
  "Say one kind thing about how you got through today.",
  "A body scan from your toes up — you rarely make it as far as your head.",
  "Whatever you didn't finish today is allowed to be unfinished.",
  "Some quiet music or a soft voice, low, on a timer.",
  "Tomorrow-you will handle tomorrow. Tonight-you only has to rest.",
  "Crack the window if you want a little cool air.",
  "If sleep won't come, rest still counts. Lying warm and quiet is not nothing.",
  "Not sleeping tonight — a baby, a hot flush, a racing mind? You're not failing at this. Be as gentle with yourself as you'd be with a friend.",
  "Unclench your jaw, drop your shoulders. You've been holding the whole day in your body.",
  "Put tomorrow's clothes out, then stop planning and let the evening be yours.",
];

export default function Tonight() {
  const [items, setItems] = useState([]);
  const [story, setStory] = useState(null);
  const [sky, setSky] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const [itemsStatus, setItemsStatus] = useState("loading");
  const [storyStatus, setStoryStatus] = useState("loading");
  const [skyStatus, setSkyStatus] = useState("loading");
  const [retryKey, setRetryKey] = useState(0);
  const { saved, saveError, onSave } = useGoodLifeKeep(ownerId, expanded?.saveable === false ? null : expanded);
  const lav = cwOf("lavender").petal;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await base44.entities.LifestyleItems.filter({ status: "PUBLISHED" }, "-engagement_score", 500);
        if (alive) { setItems((Array.isArray(rows) ? rows : []).filter((r) => !isClickbait(r && r.title)).map((r) => (r ? { ...r, title: cleanTitle(r.title) } : r))); setItemsStatus("ready"); }
      } catch { if (alive) setItemsStatus("error"); }
      // the nightly assembly — a chapter + the sky, both refresh on their own
      try {
        const ds = await base44.entities.DailyStory.filter({ is_active: true }, "day_number", 400);
        const chapters = (Array.isArray(ds) ? ds : []).filter(row => row?.segment_text);
        const pick = chapterForDay(chapters);
        if (alive) { setStory(chapterForHer(chapters, pick) || null); setStoryStatus("ready"); }
      } catch { if (alive) setStoryStatus("error"); }
      try {
        const skyOwner = await base44.auth.me();
        if (skyOwner?.id) {
          if (alive) setOwnerId(skyOwner.id);
          const ho = await base44.entities.HoroscopeReading.filter({ user_id: skyOwner.id }, "-reading_date", 1);
          const ownReading = Array.isArray(ho) ? ho.find(row => row?.user_id === skyOwner.id && row?.reading_date === isoDay()) : null;
          if (alive) { setSky(ownReading || null); setSkyStatus("ready"); }
        } else if (alive) setSkyStatus("ready");
      } catch { if (alive) setSkyStatus("error"); }
      try {
        const u = await base44.auth.me().catch(() => null);
        if (u?.id) {
          const profs = await base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []);
          const p = pickProfile(profs);
          const nm = String(p?.display_name || u.full_name || "").trim().split(/\s+/)[0] || "";
          if (alive && nm && !/\d/.test(nm) && nm.length <= 16) setFirstName(nm[0].toUpperCase() + nm.slice(1));
        }
      } catch { /* anon */ }
    })();
    return () => { alive = false; };
  }, [retryKey]);

  const rituals = useMemo(() => rotateDaily(RITUALS, 4), []);
  const calmCards = useMemo(() => rotateDaily(
    items.filter((r) => !isFiction(r) && !hasAny(r, NOT) && !hasAny(r, DENY) && hasAny(r, CALM) && (["VIDEO", "PODCAST", "PRACTICE"].includes(String(r.media_type || "").toUpperCase()) || hasAny(r, ["meditation", "breath", "sleep", "unwind", "restorative"]))), 8)
      .map((r) => {
        const mt = String(r.media_type || "").toUpperCase();
        const isVid = mt === "VIDEO" && r.video_id && r.is_embeddable !== false;
        const isAudio = mt === "PODCAST" && r.audio_url;
        return {
          id: r.id, type: isVid ? "video" : isAudio ? "audio" : "article", _raw: { ...r, source_url: r.source_url || r.episode_url }, sourceName: r.source_name || r.channel_name || "FemWell", actions: [],
          title: decodeEntities(r.title || ""), subtitle: r.source_name || r.channel_name || r.subtitle || "",
          summary: (r.summary || r.excerpt || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
          category: r.category || "Mindfulness", cw: "lavender", Icon: isVid ? "Film" : isAudio ? "Headphones" : "Wind",
          kind: isVid ? "Watch · Tonight" : isAudio ? "Listen · Tonight" : "Read · Tonight",
          meta: [["Clock", fmtDuration(r) || "a calm few minutes"]],
          ...(isVid ? { youtubeId: r.video_id } : {}), ...(isAudio ? { audioSrc: r.audio_url, playerLabel: decodeEntities(r.title || "") } : {}),
        };
      }), [items]);

  const chapterCard = useMemo(() => story?.segment_text ? {
    id: story.id, title: decodeEntities(story.series_title || "Tonight's chapter"),
    subtitle: story.day_number ? `Chapter ${story.day_number}` : "A chapter before bed",
    summary: story.cliffhanger ? `“${decodeEntities(story.cliffhanger)}”` : "A few pages to end the day on.",
    type: "daily_story", _raw: { ...story, lede: story.segment_text }, actions: [], saveable: false,
    readingText: story.segment_text, category: "Story", cw: "crimson", Icon: "Feather", kind: "Read · Tonight's chapter",
    overline: "before bed", meta: [["Clock", "a chapter"]],
  } : null, [story]);

  const skyCard = useMemo(() => {
    if (!sky) return null;
    const moon = sky.moon_phase ? `The moon is ${String(sky.moon_phase).toLowerCase()}${sky.moon_pct ? `, ${sky.moon_pct}% lit tonight` : ""}.` : "";
    const [title, body] = [
      [sky.cycle_moon_headline || "Your two tides", sky.cycle_moon_body],
      [sky.power_title || "Your sky tonight", sky.power_body],
      ["A Moon note", sky.triad_moon_desc],
    ].find(([, text]) => text) || ["Your sky tonight", "A little sky for the evening, held lightly."];
    return { id: sky.id || "sky", type: "article", _raw: { lede: `${moon}\n\n${decodeEntities(body)}` }, actions: [], saveable: false,
      title: decodeEntities(title), subtitle: sky.moon_phase ? decodeEntities(String(sky.moon_phase)) : "",
      summary: `${moon} ${decodeEntities(body)}`.trim(), category: "Culture", cw: "lavender", Icon: "Moon", kind: "Read · The night sky", overline: "the night sky", meta: [["Moon", sky.moon_phase || "tonight"]] };
  }, [sky]);

  return (
    <div className="fw-good-clean fw-tonight-clean" style={{ minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(124px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 16px 0" }}>
        <button onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/Lifestyle?section=good")} aria-label="Back to Good life" className="fw-elite-press fw-good-back"><ArrowLeft size={19} /></button>
        <header className="fw-good-hero fw-tonight-hero"><span className="fw-good-path">GOOD LIFE / TONIGHT</span><span className="fw-tonight-iris" aria-hidden="true"/><span className="fw-tonight-moon" aria-hidden="true"/><span className="fw-tonight-orbit" aria-hidden="true"/><h1>Tonight</h1><p>The day can end here. The rest can wait.</p></header>
        <details className="fw-good-context"><summary>A note for tonight <span aria-hidden="true">+</span></summary><div className="fw-good-context-body">
          <div className="fw-good-context-row"><Moon size={16}/><div><strong>No score</strong><p>{firstName ? `${firstName}, ` : ""}rest doesn't need a perfect night's sleep to count.</p></div></div>
          <div className="fw-good-context-row"><Wind size={16}/><div><strong>Still awake?</strong><p>Babies, shifts, hot flushes, a noisy mind. You're allowed an unfinished day and a gentler night.</p></div></div>
          <div className="fw-good-context-row"><Feather size={16}/><div><strong>The evidence, lightly</strong><p>A small bedtime-writing study and an orthosomnia case report inform this room; neither predicts your sleep tonight.</p></div></div>
        </div></details>

        <Section Icon={Wind} title="One small landing" accent={lav}><div className="fw-tonight-one"><Moon size={22} aria-hidden="true"/><p>{rituals[0]}</p></div></Section>

        <Section Icon={BookOpen} title="Keep you company" accent={lav} sub="A chapter or a little sky. Both open here.">
          <div className="fw-tonight-choices">
            {chapterCard ? <button type="button" onClick={() => setExpanded(chapterCard)}><BookOpen size={20}/><span><strong>Tonight's chapter</strong><small>{chapterCard.title} · {chapterCard.subtitle}</small></span><span aria-hidden="true">→</span></button> : <p>{storyStatus === "loading" ? "Finding tonight's chapter…" : storyStatus === "error" ? "The chapter didn't arrive." : "No chapter is published tonight."}</p>}
            {skyCard ? <button type="button" onClick={() => setExpanded(skyCard)}><Stars size={20}/><span><strong>Your sky tonight</strong><small>{skyCard.subtitle || "A little night sky"}</small></span><span aria-hidden="true">→</span></button> : <a href="/Lifestyle?section=sky"><Stars size={20}/><span><strong>Open Sky</strong><small>{skyStatus === "error" ? "Your reading didn't arrive here" : "Moon, stars and your reading"}</small></span><span aria-hidden="true">→</span></a>}
          </div>
          {storyStatus === "error" && <div role="alert" className="fw-good-load-error">The chapter didn't arrive. <button type="button" onClick={() => { setStoryStatus("loading"); setRetryKey(x => x + 1); }}>Try again</button></div>}
          {skyStatus === "error" && <div role="alert" className="fw-good-load-error">Your sky didn't arrive. <button type="button" onClick={() => { setSkyStatus("loading"); setRetryKey(x => x + 1); }}>Try again</button></div>}
        </Section>

        <details className="fw-good-library"><summary>More ways to wind down · calm listens and reads <span aria-hidden="true">+</span></summary>
          <Section Icon={Moon} title="A few more small things" accent={lav}><div className="fw-tonight-rituals">{rituals.slice(1).map((r, i) => <p key={i}>{r}</p>)}</div></Section>
          <Section Icon={Wind} title="Something calm to end on" accent={cwOf("sage").petal}>
            <Shelf room="tonight" cards={calmCards} onOpen={setExpanded} empty={itemsStatus === "loading" ? "Finding calm reads…" : itemsStatus === "error" ? "" : "No calm piece just now."}/>
          </Section>
          {itemsStatus === "error" && <div role="alert" className="fw-good-load-error">The calm reads didn't arrive. <button type="button" onClick={() => { setItemsStatus("loading"); setRetryKey(x => x + 1); }}>Try again</button></div>}
        </details>

        <details className="fw-good-library"><summary>Elsewhere tonight · Jess, Journal, Planner <span aria-hidden="true">+</span></summary>
          <Section Icon={Sparkles} title="Elsewhere tonight" accent={lav}><div className="fw-good-door-list">
            <a href={createPageUrl("Jess")}><MessageCircle size={18}/><span>Talk with Jess<small>Company for a wide-awake hour</small></span><span aria-hidden="true">→</span></a>
            <a href={createPageUrl("Journal")}><Feather size={18}/><span>Put the day down<small>Write whatever is still on your mind</small></span><span aria-hidden="true">→</span></a>
            <a href={createPageUrl("Planner")}><CalendarCheck size={18}/><span>Plan a quiet evening<small>Leave tomorrow a little room</small></span><span aria-hidden="true">→</span></a>
          </div></Section>
        </details>
      </div>
      {expanded && <ExpandDetailCard item={expanded} onClose={() => setExpanded(null)} presentation="focused" room="good" saved={saved} onSave={onSave} error={saveError}/>}
    </div>
  );
}
