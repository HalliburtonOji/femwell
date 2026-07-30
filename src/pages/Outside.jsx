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
import { T, SERIF, UI, PAPER_BG } from "@/components/journal/Editorial";
import { OXBLOOD } from "@/components/brand/SliderKit";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { CoverCard, ExpandDetailCard, decodeEntities } from "@/components/brand/expandCards";
import { cwOf } from "@/components/brand/flora";
import { pickProfile } from "@/utils/userProfile";
import { createPageUrl } from "@/utils";

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
  const sage = cwOf("sage").petal;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await base44.entities.LifestyleItems.filter({ status: "PUBLISHED" }, "-engagement_score", 500).catch(() => []);
        if (alive) setItems(Array.isArray(rows) ? rows : []);
      } catch { /* graceful */ }
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
  }, []);

  const toCard = useCallback((r, cw) => {
    const mt = String(r.media_type || "").toUpperCase();
    const isVid = mt === "VIDEO" && r.video_id && r.is_embeddable !== false;
    const isAudio = mt === "PODCAST" && r.audio_url;
    return {
      id: r.id, title: decodeEntities(r.title || ""), subtitle: r.source_name || r.channel_name || r.subtitle || "",
      summary: (r.summary || r.excerpt || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      category: r.category || "Lifestyle", cw, Icon: isVid ? "Film" : isAudio ? "Headphones" : "Leaf",
      kind: isVid ? "Watch · Outside" : isAudio ? "Listen · Outside" : "Read · Outside",
      meta: [["Clock", r.duration_label || "a breath of fresh air"]],
      ...(isVid ? { youtubeId: r.video_id } : {}), ...(isAudio ? { audioSrc: r.audio_url, playerLabel: decodeEntities(r.title || "") } : {}),
    };
  }, []);

  const prompts = useMemo(() => rotateDaily(PROMPTS, 4), []);
  const greenCards = useMemo(() => rotateDaily(items.filter((r) => !isFiction(r) && !hasAny(r, NOT) && hasAny(r, NATURE)), 8).map((r) => toCard(r, "sage")), [items, toCard]);

  const summaryRows = useMemo(() => [
    { Icon: Trees, label: "Today", text: firstName ? `${firstName}, get a bit of outside in — a window, a tree, five minutes of air. It all counts, and none of it needs a garden or a car.` : "Get a bit of outside in — a window, a tree, five minutes of air. It all counts, and none of it needs a garden or a car." },
    { Icon: Leaf, label: "Why it helps", text: "Time in green space genuinely lifts mood and eases stress — and the research found several short visits count as much as one long one. So a five-minute go is not second best. It's the whole point." },
    { Icon: Bird, label: "Nature is yours too", text: "No garden, no car, a city flat? A street tree, a window box, a patch of sky — that IS nature, and it's as much yours as anyone's. No gear, no gatekeeping, no mountain required." },
  ], [firstName]);

  const Section = ({ Icon, title, sub, accent, children }) => (
    <section style={{ marginTop: 26 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 2px 4px" }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: `${accent}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={16} color={accent} /></span>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, fontWeight: 600, color: OXBLOOD }}>{title}</div>
      </div>
      {sub && <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 2px 12px" }}>{sub}</p>}
      {children}
    </section>
  );

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(124px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 16px 0" }}>
        <button onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/Lifestyle")} aria-label="Back" className="fw-elite-press"
          style={{ width: 40, height: 40, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi, color: OXBLOOD, display: "grid", placeItems: "center", cursor: "pointer" }}><ArrowLeft size={19} /></button>

        <FwFloraHero title="Outside" line="A bit of green, a breath of air — nature as it actually is for you. A window, a street tree, a park bench all count."
          colorway="sage" bloom="cosmos" flankL="daisy" flankR="cornflower" titleColor={OXBLOOD} creature="bee" />

        <div style={{ marginTop: 6 }}><SummaryCard eyebrow="Fresh air today" accent={sage} rows={summaryRows} /></div>

        {/* A · GET OUTSIDE TODAY — the access-first prompt spine (the lean hook) */}
        <Section Icon={Leaf} title="Get outside today" accent={sage}
          sub="Tiny, doable, no kit required. Pick one if it suits — a window and a minute is a completely valid amount of nature.">
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {prompts.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${sage}`, borderRadius: 13, padding: "12px 14px" }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: `${sage}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><Sprout size={15} color={sage} /></span>
                <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.5 }}>{p}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* B · INTO THE GREEN — the real nature/garden content */}
        <Section Icon={Trees} title="Into the green" accent={cwOf("gold").petal}
          sub="Reads on being outside, growing things, and the small wildness of gardens, balconies and city parks.">
          {greenCards.length ? (
            <div className="fw-out-shelf" style={{ display: "flex", gap: 12, overflowX: "auto", padding: "2px 2px 8px", scrollbarWidth: "none", WebkitMaskImage: "linear-gradient(90deg, #000 0, #000 calc(100% - 26px), transparent 100%)", maskImage: "linear-gradient(90deg, #000 0, #000 calc(100% - 26px), transparent 100%)" }}>
              <style>{`.fw-out-shelf::-webkit-scrollbar{display:none}`}</style>
              {greenCards.map((it) => <div key={it.id} style={{ flex: "0 0 250px", height: 366 }}><CoverCard item={it} compact onOpen={() => setExpanded(it)} /></div>)}
            </div>
          ) : <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "0 2px" }}>Nature reads land here as the library fills out.</p>}
        </Section>

        {/* C · NO GARDEN CORNER — the anti-gatekeeping promise made concrete */}
        <Section Icon={Sprout} title="No garden? Nature's still yours" accent={cwOf("sage").petal}
          sub="For flats, rentals and windowsills — the whole point is that you don't need land to grow something or feel the season turn.">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${cwOf("sage").petal}`, borderRadius: 14, padding: "14px 16px" }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: `${cwOf("sage").petal}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><Leaf size={17} color={cwOf("sage").petal} /></span>
            <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.5 }}>One pot of herbs on the sill. A supermarket basil plant, kept alive out of spite. A window box, a hanging spider plant, a jam jar of cuttings on the draining board. That's a garden. Ask Jess "I've no outdoor space — what can I actually grow?" and start with one green thing.</span>
          </div>
        </Section>

        {/* D · OUTSIDE, WITH OTHERS — the one live lever (Events deep-link) */}
        <Section Icon={CalendarHeart} title="Outside, with others" accent={cwOf("crimson").petal}
          sub="Walks, gardens, a bit of fresh air with company — real ones happen over in Events when they're on.">
          <a href={createPageUrl("Events")} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 12, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${cwOf("crimson").petal}`, borderRadius: 14, padding: "14px 16px", cursor: "pointer", textDecoration: "none" }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, background: `${cwOf("crimson").petal}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><CalendarHeart size={20} color={cwOf("crimson").petal} /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: T.ink, display: "block", lineHeight: 1.2 }}>See what's on in Events</span>
              <span style={{ fontFamily: UI, fontSize: 12.5, color: T.muted }}>Outdoor meetups and walks, if any are running near you — no pressure to go.</span>
            </span>
          </a>
        </Section>

        {/* E · CARRY IT ON */}
        <Section Icon={Sparkles} title="Carry it on" accent={cwOf("gold").petal} sub="Outside doesn't end here.">
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {[
              { Icon: CalendarHeart, cw: "gold", label: "Book a walk into your day", sub: "Ten minutes, no agenda — put it in the Planner so it actually happens.", href: createPageUrl("Planner") },
              { Icon: Sparkles, cw: "sage", label: "\"Talk me into a five-minute walk\"", sub: "Tell Jess you can't be bothered. She's good at the gentle nudge out the door.", href: createPageUrl("Jess") },
              { Icon: MessageCircle, cw: "plum", label: "\"What did you see?\" in Community", sub: "Share the fox, the sunset, the first snowdrop — small wonders, noticed together.", href: createPageUrl("Community") },
              { Icon: Feather, cw: "crimson", label: "Note it in your Journal", sub: "The walk that shifted your mood, the tree you always pass — worth keeping.", href: createPageUrl("Journal") },
            ].map((r) => {
              const c = cwOf(r.cw).petal;
              return (
                <a key={r.label} href={r.href} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${c}`, borderRadius: 13, padding: "11px 13px", cursor: "pointer", textDecoration: "none" }}>
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
            You don't have to earn the outside, or do it properly, or go far. A minute of sky, a single leaf, a breath of cold air — it was always yours.
          </p>
        </div>
      </div>

      {expanded && <ExpandDetailCard item={expanded} onClose={() => setExpanded(null)} />}
    </div>
  );
}
