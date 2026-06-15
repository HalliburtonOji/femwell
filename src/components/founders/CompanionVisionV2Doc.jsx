// CompanionVisionV2Doc — Founders Corner: the v2 companion vision. Why the live single-flower
// reads lightweight, and the recommended direction (B — a GARDEN that ACCUMULATES: each
// life-chapter grows its own plant that persists, becoming a living record of her seasons).
// Halli approved Direction B. Companion handoff: companion-vision-v2 brainstorm. Self-contained, no emoji.

import React from "react";

const C = {
  cream: "#F4EDDB", paperHi: "#FBF6E6", ink: "#3A2C1A", muted: "#9B8B7A",
  blush: "#E8B4B8", sage: "#8FAF8F", sageDeep: "#4c6b4c", gold: "#D4AF37", goldDeep: "#A8893F",
  plum: "#5b2b4e", crimson: "#BC2E27", rule: "rgba(58,44,26,0.14)",
};
const SCRIPT = '"Ephesis","Pinyon Script",cursive';
const SERIF = '"Cormorant Garamond","Fraunces",Georgia,serif';
const SANS = 'ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif';

// direction + phase tags
const TAGS = {
  A: { bg: "rgba(58,44,26,.10)", fg: C.muted, t: "Direction A" },
  B: { bg: "rgba(143,175,143,.20)", fg: C.sageDeep, t: "Direction B" },
  Cd: { bg: "rgba(232,180,184,.22)", fg: "#9a4f5a", t: "Direction C" },
  now: { bg: "rgba(58,44,26,.10)", fg: C.ink, t: "Live now" },
  p1: { bg: "rgba(143,175,143,.18)", fg: C.sageDeep, t: "Phase 1" },
  p2: { bg: "rgba(212,175,55,.18)", fg: C.goldDeep, t: "Phase 2" },
  p3: { bg: "rgba(91,43,78,.14)", fg: C.plum, t: "Phase 3" },
  p4: { bg: "rgba(188,46,39,.10)", fg: C.crimson, t: "Phase 4" },
};
function Tag({ k }) { const t = TAGS[k] || TAGS.p2; return <span style={{ fontFamily: SANS, fontSize: 9.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: t.fg, background: t.bg, borderRadius: 999, padding: "2px 8px", marginRight: 7 }}>{t.t}</span>; }
function H2({ n, children, note }) { return <h2 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: C.ink, margin: "38px 0 4px", paddingBottom: 8, borderBottom: `2px solid ${C.rule}` }}><span style={{ fontFamily: SCRIPT, fontSize: 33, color: C.goldDeep, marginRight: 10 }}>{n}</span>{children}{note && <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 400, fontStyle: "italic", color: C.muted, marginLeft: 9 }}>{note}</span>}</h2>; }
function P({ children, lede }) { return <p style={{ fontFamily: SERIF, fontSize: lede ? 18 : 16, color: C.ink, lineHeight: 1.55, margin: "8px 0" }}>{children}</p>; }
function Card({ children, accent = C.gold }) { return <div style={{ background: C.paperHi, border: `1px solid ${C.rule}`, borderLeft: `3px solid ${accent}`, borderRadius: 13, padding: "14px 16px", margin: "13px 0" }}>{children}</div>; }
function Li({ k, children }) { return <li style={{ display: "flex", alignItems: "flex-start", flexWrap: "wrap", margin: "8px 0", fontFamily: SERIF, fontSize: 16, color: C.ink, lineHeight: 1.5 }}>{k ? <Tag k={k} /> : <span style={{ color: C.gold, fontWeight: 800, marginRight: 8 }}>·</span>}<span style={{ flex: 1, minWidth: 220 }}>{children}</span></li>; }
function Pro({ children }) { return <li style={{ margin: "7px 0", fontFamily: SERIF, fontSize: 15.5, color: C.sageDeep, lineHeight: 1.5 }}><strong>Pro:</strong> <span style={{ color: C.ink }}>{children}</span></li>; }
function Con({ children }) { return <li style={{ margin: "7px 0", fontFamily: SERIF, fontSize: 15.5, color: "#8c2f2f", lineHeight: 1.5 }}><strong>Con:</strong> <span style={{ color: C.ink }}>{children}</span></li>; }
function H3({ children, note }) { return <h3 style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: C.plum, margin: "20px 0 4px" }}>{children}{note && <span style={{ fontSize: 13.5, fontWeight: 400, fontStyle: "italic", color: C.muted, marginLeft: 8 }}>{note}</span>}</h3>; }

const STAGES = [
  ["Seed", "a chapter just begun"],
  ["Sprout", "the first acts of care"],
  ["Budding", "a rhythm forming"],
  ["Blooming", "a tended, full season"],
  ["Heirloom", "a chapter you completed — it joins the garden permanently as part of your history", true],
];
const BRANCHES = [
  ["A journalling-heavy season", "an ink-and-script bloom (forget-me-not, foxglove)."],
  ["A nourishment-heavy season", "a fruiting / herb plant."],
  ["A community-heavy season", "a flower that grows in a little cluster — you weren't alone."],
  ["A rest-heavy season", "a calm evergreen — rest is growth, not absence."],
];
const PLACES = [
  ["Today / home", "A warm hero — today's plant + one line of what fed it. The first thing she sees, the daily hello."],
  ["Persistent corner", "A small living bloom in a consistent spot app-wide; tap to open the garden. Ambient, never nagging."],
  ["The Garden (its own space)", "The full accumulated garden — wander past chapters, tap a plant to revisit that season (“April · perimenopause · you wrote 12 times”)."],
  ["Journal hub", "The current chapter's plant + “Leave a line,” tying reflection to growth."],
  ["Moments it appears", "A gentle grow-animation right after you journal / log / check in (visible cause→effect); a milestone bloom; a soft welcome-back after a gap."],
  ["Off-app (later)", "A home-screen widget / lock-screen glance, and the share-as-image keepsake → optionally a community “garden of gardens.”"],
];

export default function CompanionVisionV2Doc() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "8px 2px 60px" }}>
      <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", fontWeight: 700, color: C.goldDeep, marginBottom: 10 }}>Companion · Vision v2 · approved direction</div>
      <h1 style={{ fontFamily: SCRIPT, fontSize: 44, color: C.ink, margin: "0 0 6px", lineHeight: 1 }}>A garden, not a flower</h1>
      <P lede>What's live is a single flower that nudges up and shows a line about what fed it — a sound foundation, but <em>one plant, one screen, one short arc</em>, so it reads as a nice graphic, not something she's built a relationship with. The fix isn't more polish on the flower; it's <strong>scope and time</strong>: a thing that <em>accumulates over months</em>, lives <em>across the whole app</em>, and visibly becomes the story of how she's cared for herself.</P>

      <Card accent={C.sage}>
        <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 800, color: C.sageDeep, marginBottom: 6 }}>The decision (Halli approved)</div>
        <P><strong>Direction B — a living garden that accumulates.</strong> Each chapter (a month / a cycle / a season of life) grows its own plant, and they stay — so over time the screen becomes a whole garden that <em>is</em> a record of the seasons she's moved through. Guilt-free by design: it never dies, no streaks, accumulation and collection rather than loss-aversion. <strong>The current single flower becomes the first plant in the garden</strong> — nothing wasted.</P>
      </Card>

      <H2 n="i">Three directions — and why B</H2>
      <P>Pick the core metaphor first; everything else follows. All three keep the locked ethic (never dies, no streaks, no scores, no guilt).</P>

      <Card accent={C.muted}>
        <Tag k="A" /><strong style={{ fontFamily: SERIF, fontSize: 17, color: C.ink }}>The single evolving plant</strong> <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: C.muted }}>(what's live, extended)</span>
        <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0" }}>
          <Pro>simplest, already built, easy to read at a glance.</Pro>
          <Con>a single plant has a ceiling — once it's “in full bloom” there's nowhere left to go, so it plateaus in a week or two. Exactly why it feels lightweight (the finite-milestone fatigue).</Con>
        </ul>
      </Card>

      <Card accent={C.sage}>
        <Tag k="B" /><span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: C.sageDeep }}>★ Recommended · chosen</span>
        <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: C.ink, margin: "6px 0 2px" }}>A living garden that accumulates — your life, growing</div>
        <P>You don't tend one flower forever. Each chapter grows its own plant, and they stay — June's bloom sits next to May's; a hard month might be a hardy fern, a joyful one a wildflower burst. You wander it, and it never resets — it deepens.</P>
        <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 0" }}>
          <Pro><strong>No ceiling</strong> — it rewards months and years, not days. Cozy games retain through exactly this: slow organic progression, collection, seasons you wait for. And it's emotionally true to FemWell — a woman's life isn't one bloom, it's seasons.</Pro>
          <Pro><strong>Guilt-free by design</strong> — a new chapter is a natural clean slate; a gap doesn't wither anything, it just means that chapter's plant grew quieter, and the next begins fresh and warm.</Pro>
          <Con>more to build (a garden, chapters, history) — so it's phased (§vi).</Con>
        </ul>
      </Card>

      <Card accent={C.blush}>
        <Tag k="Cd" /><strong style={{ fontFamily: SERIF, fontSize: 17, color: C.ink }}>A living creature / inner-world companion</strong>
        <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0" }}>
          <Pro>highest emotional pull — a creature that “needs you” is the strongest attachment hook (the Finch / Tamagotchi effect).</Pro>
          <Con>that pull comes from <em>dependency and distress</em> — the pet gets visibly distressed when you skip. That's precisely the guilt mechanic our audience and our ethic rule out. A creature without need feels inert; one with need violates “no guilt.”</Con>
        </ul>
      </Card>

      <P><strong>The call:</strong> Direction B, with the warmth of a creature borrowed as a <em>voice</em> (Jess narrates the garden) rather than a needy pet. The current flower stays as the current chapter's plant — nothing wasted, it just becomes the newest bloom in a growing garden.</P>

      <H2 n="ii" note="the part that's missing">How it evolves</H2>
      <P>Today: five fixed stages, then done. The richer model gives it somewhere to go for months.</P>
      <H3>Growth stages (within a chapter)</H3>
      <Card>
        {STAGES.map(([s, d, isNew]) => (
          <div key={s} style={{ display: "flex", gap: 12, alignItems: "baseline", padding: "4px 0", borderBottom: `1px solid ${C.rule}` }}>
            <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: C.plum, minWidth: 96 }}>{s}{isNew && <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 800, color: C.sageDeep, marginLeft: 6, letterSpacing: ".06em" }}>NEW</span>}</span>
            <span style={{ fontFamily: SERIF, fontSize: 15, color: C.ink, lineHeight: 1.45 }}>{d}</span>
          </div>
        ))}
      </Card>

      <H3>Branching — it grows differently depending on your life</H3>
      <P>The plant's <em>form</em> is shaped by <strong>which life-areas she tends most that chapter</strong>, so two women's gardens never look alike and her own changes over time:</P>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {BRANCHES.map(([a, b]) => <Li key={a}><strong>{a}</strong> → {b}</Li>)}
      </ul>

      <H3>It breathes with her body and the calendar</H3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <Li><strong>Cycle phase</strong> tints + animates it (the colour system already exists): menstrual deep + still, follicular fresh green, ovulatory gold open, luteal plum inward.</Li>
        <Li><strong>Life stage</strong> shifts palette + plant vocabulary (TTC, pregnancy, postpartum, perimenopause, menopause) so it grows <em>with</em> her, not generically.</Li>
        <Li><strong>Real seasons</strong> (spring/summer/autumn/winter) change the garden's light and which blooms are in season — the anticipation cozy games get from seasonal collectibles.</Li>
      </ul>

      <H3>Rare blooms &amp; milestone moments</H3>
      <P>Occasional, earned-through-living surprises — a first-time bloom for a milestone (first sealed letter opened, 50th journal entry, a full cycle tracked, a year on FemWell). Collection without competition: “look what grew,” never “you're behind.”</P>

      <H2 n="iii" note="presence across the app">Where it lives</H2>
      <Card>
        {PLACES.map(([a, s]) => (
          <div key={a} style={{ display: "flex", gap: 12, padding: "7px 0", borderBottom: `1px solid ${C.rule}` }}>
            <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: ".03em", textTransform: "uppercase", color: C.goldDeep, width: 150, flexShrink: 0 }}>{a}</span>
            <span style={{ fontFamily: SERIF, fontSize: 14.5, color: C.ink, lineHeight: 1.45 }}>{s}</span>
          </div>
        ))}
      </Card>
      <P><strong>So, the placement answer:</strong> it gets <strong>its own dedicated /Garden page</strong> — the home she wanders — <em>and</em> an ambient presence everywhere else (Today hero, the persistent corner that taps through, the Journal-hub plant, grow-moments after real acts, the welcome-back). Later: an off-app widget and the community garden-of-gardens.</P>

      <H2 n="iv">Why no-guilt actually wins</H2>
      <P>The instinct is that guilt and dependency drive retention. The data says the opposite for the long term, and for our audience especially:</P>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <Li>Gamified / streak apps get <strong>+41% engagement in the first 2 weeks</strong> but <strong>67% abandonment by week 4</strong> (vs 38% for non-gamified). Loss-aversion triggers anxiety and shame, especially in perfectionists; one missed day can trigger complete abandonment.</Li>
        <Li>Streak / guilt mechanics <strong>actively harm habit formation for 41% of people.</strong></Li>
        <Li>The apps solving this — rolling windows, monthly clean-slate chapters, “missed days as signals not failures” — shift from loss aversion to <strong>creative collection</strong>. That is precisely our garden.</Li>
      </ul>
      <P>Retention comes from <strong>accumulation, collection, evolution, identity and beauty</strong> — “look what I've grown alongside my life” — not from a creature in distress. The more ethical design <em>and</em> the one that lasts: pride and tenderness toward her own history, renewed each chapter.</P>

      <H2 n="v">Risks &amp; how we hold them</H2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <Li><strong>Feeling like a chore</strong> → never required; the everyday acts <em>are</em> the tending. No task list, no penalty.</Li>
        <Li><strong>Over-gamifying a wellness space</strong> → no points / levels / leaderboards; the language is seasons and growth, not score.</Li>
        <Li><strong>Sensitive life stages</strong> (loss, infertility, postpartum) → plant / colour vocabulary reviewed for gentleness; rest and hard seasons honoured as real growth, never failure.</Li>
        <Li><strong>Privacy</strong> → the companion is a non-personal artifact; sharing carries only the bloom + a gentle line, never journal / cycle / health data (already the rule).</Li>
        <Li><strong>Scope creep</strong> → phased below; each phase is shippable and lovely on its own.</Li>
      </ul>

      <H2 n="vi">Phased path — from what's live to the vision</H2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <Li k="now"><strong>Live:</strong> one evolving flower, real engagement signals, “Leave a line,” cross-device, share image.</Li>
        <Li k="p1"><strong>Chapters &amp; the garden:</strong> the current flower becomes “this chapter's plant”; at each new chapter it's planted into a persisted garden she can wander. <em>(The single biggest lift in specialness — queued next.)</em></Li>
        <Li k="p2"><strong>Branching forms:</strong> plant form shaped by which life-areas she tended; cycle / life-stage / season colour + vocabulary.</Li>
        <Li k="p3"><strong>Moments &amp; presence:</strong> grow-animation after real acts, milestone / rare blooms, welcome-back, the Today hero + persistent corner.</Li>
        <Li k="p4"><strong>Off-app &amp; social:</strong> widget / lock-screen, and an opt-in community garden-of-gardens.</Li>
      </ul>

      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, color: C.plum, textAlign: "center", margin: "26px 0 8px", lineHeight: 1.5 }}>
        Stop asking her to keep one flower alive, and start letting her grow a garden that becomes the story of how she's cared for herself — season by season, for years.
      </p>
      <p style={{ fontFamily: SANS, fontSize: 12, color: C.muted, textAlign: "center", marginTop: 18, lineHeight: 1.6 }}>
        Research drawn on: Finch, Forest, Neko Atsume, Animal Crossing &amp; Stardew (seasonal, slow organic progression, finite-milestone fatigue), Yu-kai Chou on pet-companion core drives, habit-app research on streak / guilt harm vs guilt-free creative collection (rolling windows, monthly chapters). Within the FemWell rails — anonymous, 18+, no streaks / scores / guilt, cream &amp; plum, Ephesis/Cormorant, no emoji.
      </p>
    </div>
  );
}
