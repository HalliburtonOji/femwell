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
// SCIENCE (cited): warm bath 1-2h before bed shortens sleep onset ~36% (Haghayegh); long-exhale
// breathing restores vagal tone in ~5 min; a bedtime worry-download beats controls by ~9 min
// (Scullin). FIREWALL: ORTHOSOMNIA — the documented anxiety from sleep-TRACKING — so ZERO
// scores/debt/trackers here; the goal is calm, not a better number. Rest counts even when sleep
// doesn't come. SENSITIVITY: many readers are NOT sleeping (babies, menopause, anxiety, shifts)
// — good sleep is NEVER framed as a personal achievement or failing.
import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Moon, Feather, Sparkles, Wind, BookOpen, MessageCircle, CalendarCheck, Stars } from "lucide-react";
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
  "Socks and the good blanket — being warm is half of falling asleep.",
  "One chapter, on paper if you have it, screen dimmed if you don't.",
  "Let the house stay a bit messy tonight. It'll keep.",
  "Dim everything for the last hour — your eyes tell your brain it's night.",
  "The to-do list is closed. Nothing productive past this point, by order.",
  "Say one kind thing about how you got through today.",
  "A body scan from your toes up — you rarely make it as far as your head.",
  "Whatever you didn't finish today is allowed to be unfinished.",
  "Some quiet music or a soft voice, low, on a timer.",
  "Tomorrow-you will handle tomorrow. Tonight-you only has to rest.",
  "Crack the window — a cool room sleeps better than a warm one.",
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
  const lav = cwOf("lavender").petal;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await base44.entities.LifestyleItems.filter({ status: "PUBLISHED" }, "-engagement_score", 500).catch(() => []);
        if (alive) setItems(Array.isArray(rows) ? rows : []);
      } catch { /* graceful */ }
      // the nightly assembly — a chapter + the sky, both refresh on their own
      try { const ds = await base44.entities.DailyStory.filter({ is_active: true }, "-day_number", 1).catch(() => []); if (alive && ds?.[0]) setStory(ds[0]); } catch { /* no story tonight */ }
      try { const ho = await base44.entities.HoroscopeReading.filter({}, "-reading_date", 1).catch(() => []); if (alive && ho?.[0]) setSky(ho[0]); } catch { /* no sky tonight */ }
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

  const rituals = useMemo(() => rotateDaily(RITUALS, 4), []);
  const calmCards = useMemo(() => rotateDaily(
    items.filter((r) => !isFiction(r) && !hasAny(r, NOT) && !hasAny(r, DENY) && hasAny(r, CALM) && (["VIDEO", "PODCAST", "PRACTICE"].includes(String(r.media_type || "").toUpperCase()) || hasAny(r, ["meditation", "breath", "sleep", "unwind", "restorative"]))), 8)
      .map((r) => {
        const mt = String(r.media_type || "").toUpperCase();
        const isVid = mt === "VIDEO" && r.video_id && r.is_embeddable !== false;
        const isAudio = mt === "PODCAST" && r.audio_url;
        return {
          id: r.id, title: decodeEntities(r.title || ""), subtitle: r.source_name || r.channel_name || r.subtitle || "",
          summary: (r.summary || r.excerpt || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
          category: r.category || "Mindfulness", cw: "lavender", Icon: isVid ? "Film" : isAudio ? "Headphones" : "Wind",
          kind: isVid ? "Watch · Tonight" : isAudio ? "Listen · Tonight" : "Read · Tonight",
          meta: [["Clock", r.duration_label || "a calm few minutes"]],
          ...(isVid ? { youtubeId: r.video_id } : {}), ...(isAudio ? { audioSrc: r.audio_url, playerLabel: decodeEntities(r.title || "") } : {}),
        };
      }), [items]);

  const chapterCard = useMemo(() => story ? {
    id: story.id, title: decodeEntities(story.series_title || "Tonight's chapter"),
    subtitle: story.day_number ? `Chapter ${story.day_number}` : "A chapter before bed",
    summary: story.cliffhanger ? `"${decodeEntities(story.cliffhanger)}"` : "A few pages to end the day on.",
    readingText: story.segment_text || "", category: "Story", cw: "crimson", Icon: "Feather", kind: "Read · Tonight's chapter",
    overline: "before bed", meta: [["Clock", "a chapter"]],
  } : null, [story]);

  const skyCard = useMemo(() => {
    if (!sky) return null;
    const moon = sky.moon_phase ? `The moon is ${String(sky.moon_phase).toLowerCase()}${sky.moon_pct ? `, ${sky.moon_pct}% lit tonight` : ""}.` : "";
    const body = [sky.cycle_moon_body, sky.power_body, sky.triad_moon_desc].filter(Boolean)[0] || "Folklore, held lightly — a soft way to close the day.";
    return { id: sky.id || "sky", title: sky.power_title || "Your sky tonight", subtitle: sky.moon_phase ? decodeEntities(String(sky.moon_phase)) : "",
      summary: `${moon} ${decodeEntities(body)}`.trim(), category: "Culture", cw: "lavender", Icon: "Moon", kind: "Read · The night sky", overline: "the night sky", meta: [["Moon", sky.moon_phase || "tonight"]] };
  }, [sky]);

  const summaryRows = useMemo(() => [
    { Icon: Moon, label: "Tonight", text: firstName ? `${firstName}, let the day be over. A soft landing — not a routine to nail, just a few gentle things if you fancy them.` : "Let the day be over. A soft landing — not a routine to nail, just a few gentle things if you fancy them." },
    { Icon: Wind, label: "No pressure here", text: "Nothing to measure, nothing to 'get right' — chasing perfect sleep is a real source of worry, and it only makes rest harder. The aim is calm, not a number." },
    { Icon: Feather, label: "If you're not sleeping", text: "A baby, a hot flush, a mind that won't stop — you are not failing at this, and you're far from the only one awake. Rest still counts, even when sleep won't come." },
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
    <div style={{ ...PAPER_BG, minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 16px 0" }}>
        <button onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/Lifestyle")} aria-label="Back" className="fw-elite-press"
          style={{ width: 40, height: 40, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi, color: OXBLOOD, display: "grid", placeItems: "center", cursor: "pointer" }}><ArrowLeft size={19} /></button>

        <FwFloraHero title="Tonight" line="A soft landing at the end of the day. Rest for its own sake — no routine to nail, no sleep to score, nothing to finish."
          colorway="lavender" bloom="cosmos" flankL="forget-me-not" flankR="iris" titleColor={OXBLOOD} creature="moth" />

        <div style={{ marginTop: 6 }}><SummaryCard eyebrow="Wind down" accent={lav} rows={summaryRows} /></div>

        {/* A · TONIGHT'S WIND-DOWN — the editorial spine (nightly hook) */}
        <Section Icon={Wind} title="Tonight's wind-down" accent={lav}
          sub="A few small, low-effort ways to soften into the evening. Pick one, or none — this is permission, not a checklist.">
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {rituals.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${lav}`, borderRadius: 13, padding: "12px 14px" }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: `${lav}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><Moon size={15} color={lav} /></span>
                <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.5 }}>{r}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* B · TONIGHT'S CHAPTER — the DailyStory, a chapter before bed */}
        {chapterCard && (
          <Section Icon={BookOpen} title="Tonight's chapter" accent={cwOf("crimson").petal}
            sub="A few pages of a story, a chapter a night. The oldest wind-down there is.">
            <div style={{ maxWidth: 300 }}><CoverCard item={chapterCard} onOpen={() => setExpanded(chapterCard)} /></div>
          </Section>
        )}

        {/* C · THE NIGHT SKY — the HoroscopeReading / moon, folklore held lightly */}
        {skyCard && (
          <Section Icon={Stars} title="The night sky" accent={lav}
            sub="Where the moon is tonight, and a little folklore to close on — held lightly, just for the comfort of it.">
            <div style={{ maxWidth: 300 }}><CoverCard item={skyCard} onOpen={() => setExpanded(skyCard)} /></div>
          </Section>
        )}

        {/* D · SOMETHING CALM TO END ON — the genuine calm/meditation/yoga content */}
        <Section Icon={Wind} title="Something calm to end on" accent={cwOf("sage").petal}
          sub="A short meditation, a slow stretch, a soft voice — press play right here and let your shoulders drop.">
          {calmCards.length ? (
            <div className="fw-ton-shelf" style={{ display: "flex", gap: 12, overflowX: "auto", padding: "2px 2px 8px", scrollbarWidth: "none" }}>
              <style>{`.fw-ton-shelf::-webkit-scrollbar{display:none}`}</style>
              {calmCards.map((it) => <div key={it.id} style={{ flex: "0 0 250px", height: 366 }}><CoverCard item={it} compact onOpen={() => setExpanded(it)} /></div>)}
            </div>
          ) : <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "0 2px" }}>A calm thing lands here as the library fills out.</p>}
        </Section>

        {/* E · EASE INTO THE NIGHT — cross-surface */}
        <Section Icon={Sparkles} title="Ease into the night" accent={cwOf("plum").petal} sub="Tonight doesn't end here.">
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {[
              { Icon: MessageCircle, cw: "lavender", label: "Can't sleep? Jess will keep you company", sub: "3am, wide awake, no one to text — she's there, no judgement, for as long as you like.", href: createPageUrl("Jess") },
              { Icon: Feather, cw: "sage", label: "Put the day down in your Journal", sub: "The worry-download: everything on your mind onto the page, so your head can be quiet.", href: createPageUrl("Journal") },
              { Icon: CalendarCheck, cw: "gold", label: "Plan an early night", sub: "Book it in like the kindness it is — an evening with nothing owed to anyone.", href: createPageUrl("Planner") },
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
            The day is allowed to be over, finished or not. You did enough. Goodnight — or, if sleep's not coming, a gentle few hours anyway.
          </p>
        </div>
      </div>

      {expanded && <ExpandDetailCard item={expanded} onClose={() => setExpanded(null)} />}
    </div>
  );
}
