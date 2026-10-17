// Outside — Track C board #10 (whole-life domain: nature, the outdoors, fresh air). Nature as
// accessible comfort, awe and belonging — for EVERYONE regardless of access. A city park, a
// street tree, a window box, five minutes of fresh air all count. NEVER optimisation, never
// gatekeeping, never "you must hike a mountain".
//
// RESEARCHED brainstorm: claude-state/TRACKC_OUTSIDE_BRAINSTORM.html (cited). Content MEASURED
// LEAN (~39 genuine nature/garden items; raw counts are polluted with "nature of X" philosophy
// + fitness + fashion). So — LEAN like Nest — an EDITORIAL "get outside" prompt spine + a modest
// "into the green" shelf + the one live lever: an Events deep-link (real EventsItems). No new
// entity/function.
//
// SCIENCE (cited, graded): green space <-> mental health is STRONG (observational); White 2019
// (~20k adults) found the ~120 min/week "dose" AND that several SHORT visits count as much as
// one long one — the licence for a 5-minute nudge. REJECTED honestly: "grounding/earthing" and
// "forest bathing boosts NK cells for 30 days" (pseudoscience / over-claimed). FIREWALL: comfort
// and awe NOW, never a biohack or productivity tool. ACCESS-FIRST: nature is a window and a
// minute, never a Munro; no gear, no car, no garden required. EQUITY is a design stance (lowest
// bar, urban-and-flat-first), kept OUT of the copy — never guilt-tripping.
import { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Trees, Leaf, Sprout, CalendarHeart, MessageCircle, Feather, Sparkles, Bird } from "lucide-react";
import { ExpandDetailCard, decodeEntities } from "@/components/brand/expandCards";
import { cwOf } from "@/components/brand/flora";
import { GoodLifeSection as Section, GoodLifeShelf as Shelf } from "./GoodLifeRoomParts";
import { useGoodLifeKeep } from "@/components/lifestyle-elite/useGoodLifeKeep";
import "./GoodLifeRoomsClean.css";
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

// exclude "nature of X" philosophy + fitness + fashion + health-clinical pollution
const NOT = ["nature of", "true nature", "human nature", "second nature", "our nature", "workout", "kettlebell", "6-6-6", "romper", "cycle", "estrogen", "oestrogen", "menstrual", "hormone", "menopause", "calorie", "glp-1", "wardrobe", "outfit"];
const NATURE = ["outdoors", "the outdoors", "outside", "forest", "woodland", "hike", "hiking", "garden", "gardening", "allotment", "wild swim", "coast", "coastal", "fresh air", "birdsong", "green space", "national park", "being in nature", "time in nature", "walk outside", "the woods", "balcony garden", "houseplant", "grow your own", "wildflower", "getting outdoors", "the natural world"];

// THE SPINE — access-first "get outside" prompts. No gear, no car, no garden required.
// A window and a minute count. (Written to hold for a city flat with ten spare minutes.)
const PROMPTS = [
  "Open a window and just listen for a minute. That's a start.",
  "Find the nearest tree and actually look at it — really look.",
  "A park bench counts as being in nature. So does a doorstep.",
  "Five minutes of fresh air, no destination. That's the whole thing.",
  "Notice the sky once today — its colour, its weather, whatever it's up to.",
  "Walk the long way round the block, just because.",
  "A single pot on a windowsill is a garden. Start there.",
  "Watch the birds for as long as they'll let you.",
  "Take your morning drink out to the step instead of the sink.",
  "Pick up a leaf, a stone, a conker — bring a bit of the outside in.",
  "Stand in the rain for thirty seconds on purpose. It washes something off.",
  "Look for the first green thing pushing up through a crack in the pavement.",
  "Find the moon tonight — it's out there whether you look or not.",
  "A windowsill herb: mint, basil, something you'll brush past and smell.",
  "Sit with your back against a tree. Old trick, still works.",
  "Notice what season it actually is by the trees, not the calendar.",
  "There's weather happening right now. Go and be in it for a minute.",
  "A balcony, a step, a shared yard, a scrap of verge — all of it counts.",
  "Eat one thing today by an open window, or outside if you can.",
  "No garden, no time, no green in sight? A patch of sky is still yours.",
];

export default function Outside() {
  const [items, setItems] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const [itemsStatus, setItemsStatus] = useState("loading");
  const [retryKey, setRetryKey] = useState(0);
  const { saved, saveError, onSave } = useGoodLifeKeep(ownerId, expanded);
  const sage = cwOf("sage").petal;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await base44.entities.LifestyleItems.filter({ status: "PUBLISHED" }, "-engagement_score", 500);
        if (alive) { setItems((Array.isArray(rows) ? rows : []).filter((r) => !isClickbait(r && r.title)).map((r) => (r ? { ...r, title: cleanTitle(r.title) } : r))); setItemsStatus("ready"); }
      } catch { if (alive) setItemsStatus("error"); }
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

  const toCard = useCallback((r, cw) => {
    const mt = String(r.media_type || "").toUpperCase();
    const isVid = mt === "VIDEO" && r.video_id && r.is_embeddable !== false;
    const isAudio = mt === "PODCAST" && r.audio_url;
    return {
      id: r.id, type: isVid ? "video" : isAudio ? "audio" : "article", _raw: { ...r, source_url: r.source_url || r.episode_url }, sourceName: r.source_name || r.channel_name || "FemWell", actions: [],
      title: decodeEntities(r.title || ""), subtitle: r.source_name || r.channel_name || r.subtitle || "",
      summary: (r.summary || r.excerpt || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      category: r.category || "Lifestyle", cw, Icon: isVid ? "Film" : isAudio ? "Headphones" : "Leaf",
      kind: isVid ? "Watch · Outside" : isAudio ? "Listen · Outside" : "Read · Outside",
      meta: [["Clock", fmtDuration(r) || "a breath of fresh air"]],
      ...(isVid ? { youtubeId: r.video_id } : {}), ...(isAudio ? { audioSrc: r.audio_url, playerLabel: decodeEntities(r.title || "") } : {}),
    };
  }, []);

  const prompts = useMemo(() => rotateDaily(PROMPTS, 4), []);
  const greenCards = useMemo(() => rotateDaily(items.filter((r) => !isFiction(r) && !hasAny(r, NOT) && hasAny(r, NATURE)), 8).map((r) => toCard(r, "sage")), [items, toCard]);

  return (
    <div className="fw-good-clean fw-outside-clean" style={{ minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(124px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 16px 0" }}>
        <button onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/Lifestyle?section=good")} aria-label="Back to Good life" className="fw-elite-press fw-good-back"><ArrowLeft size={19}/></button>
        <header className="fw-good-hero fw-outside-hero"><span className="fw-good-path">GOOD LIFE / OUTSIDE</span><span className="fw-outside-window" aria-hidden="true"/><span className="fw-outside-tree" aria-hidden="true"/><h1>Outside</h1><p>A little air. No grand expedition required.</p></header>
        <details className="fw-good-context"><summary>A note from outside <span aria-hidden="true">+</span></summary><div className="fw-good-context-body">
          <div className="fw-good-context-row"><Leaf size={16}/><div><strong>Start nearby</strong><p>{firstName ? `${firstName}, ` : ""}a window, street tree or patch of sky is enough to begin.</p></div></div>
          <div className="fw-good-context-row"><Bird size={16}/><div><strong>Evidence, lightly</strong><p>A large study linked time in nature with wellbeing. It did not test what a five-minute visit does for you.</p></div></div>
        </div></details>

        <Section Icon={Leaf} title="One little outside thing" accent={sage}><div className="fw-outside-one"><Sprout size={22} aria-hidden="true"/><p>{prompts[0]}</p></div></Section>
        <a href={createPageUrl("Events")} className="fw-outside-event"><CalendarHeart size={20}/><span><strong>See what's on in Events</strong><small>Walks and outdoor gatherings, when listed</small></span><span aria-hidden="true">→</span></a>

        <details className="fw-good-library"><summary>More outside · small ideas and real reads <span aria-hidden="true">+</span></summary>
          <Section Icon={Trees} title="Three more little invitations" accent={sage}><div className="fw-outside-prompts">{prompts.slice(1).map((p,i)=><p key={i}>{p}</p>)}</div></Section>
          <Section Icon={Sprout} title="No garden?" accent={sage}><p className="fw-outside-no-garden">One pot of herbs on a sill, a jam jar of cuttings, a sky through the window. The season is still yours.</p></Section>
          <Section Icon={Trees} title="Into the green" accent={cwOf("gold").petal}><Shelf room="outside" cards={greenCards} onOpen={setExpanded} empty={itemsStatus === "loading" ? "Finding outside reads…" : itemsStatus === "error" ? "" : "No outside read just now."}/></Section>
          {itemsStatus === "error" && <div role="alert" className="fw-good-load-error">The reads didn't arrive. <button type="button" onClick={() => { setItemsStatus("loading"); setRetryKey(x => x + 1); }}>Try again</button></div>}
        </details>
        <details className="fw-good-library"><summary>Carry it on · Planner, Jess, Community, Journal <span aria-hidden="true">+</span></summary><div className="fw-good-door-list">
          <a href={createPageUrl("Planner")}><CalendarHeart size={18}/><span>Make room for a walk<small>No target, just some air</small></span><span aria-hidden="true">→</span></a>
          <a href={createPageUrl("Jess")}><Sparkles size={18}/><span>Ask Jess for an idea<small>Even if all you have is a window</small></span><span aria-hidden="true">→</span></a>
          <a href={createPageUrl("Community")}><MessageCircle size={18}/><span>Notice it together<small>Share what caught your eye, if you want</small></span><span aria-hidden="true">→</span></a>
          <a href={createPageUrl("Journal")}><Feather size={18}/><span>Keep a little sighting<small>The first leaf, the fox, the sky</small></span><span aria-hidden="true">→</span></a>
        </div></details>
      </div>
      {expanded && <ExpandDetailCard item={expanded} onClose={() => setExpanded(null)} presentation="focused" room="good" saved={saved} onSave={onSave} error={saveError}/>}
    </div>
  );
}
