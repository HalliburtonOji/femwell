// CompanionVisionDoc — Founders Corner: the flagship vision for the Nurture Companion as
// the APP'S HEARTBEAT (unique per user · nurture · change · share), research-grounded.
// Companion handoff: nurture-companion-vision_20260615.html. Self-contained, no emoji.

import React from "react";

const C = {
  cream: "#F4EDDB", paperHi: "#FBF6E6", ink: "#3A2C1A", muted: "#9B8B7A",
  blush: "#E8B4B8", sage: "#8FAF8F", gold: "#D4AF37", goldDeep: "#A8893F", crimson: "#BC2E27", rule: "rgba(58,44,26,0.14)",
};
const SCRIPT = '"Ephesis","Pinyon Script",cursive';
const SERIF = '"Cormorant Garamond","Fraunces",Georgia,serif';
const SANS = 'ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif';

const PHASES = { mvp: { bg: "rgba(143,175,143,.18)", fg: "#4c6b4c", t: "MVP" }, p2: { bg: "rgba(212,175,55,.18)", fg: C.goldDeep, t: "Phase 2" }, p3: { bg: "rgba(188,46,39,.10)", fg: C.crimson, t: "Phase 3" } };
function Tag({ k }) { const t = PHASES[k] || PHASES.p2; return <span style={{ fontFamily: SANS, fontSize: 9.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: t.fg, background: t.bg, borderRadius: 999, padding: "2px 8px", marginRight: 7 }}>{t.t}</span>; }
function H2({ n, children }) { return <h2 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: C.ink, margin: "38px 0 4px", paddingBottom: 8, borderBottom: `2px solid ${C.rule}` }}><span style={{ fontFamily: SCRIPT, fontSize: 33, color: C.goldDeep, marginRight: 10 }}>{n}</span>{children}</h2>; }
function P({ children, lede }) { return <p style={{ fontFamily: SERIF, fontSize: lede ? 18 : 16, color: C.ink, lineHeight: 1.55, margin: "8px 0" }}>{children}</p>; }
function Card({ children, accent = C.gold }) { return <div style={{ background: C.paperHi, border: `1px solid ${C.rule}`, borderLeft: `3px solid ${accent}`, borderRadius: 13, padding: "14px 16px", margin: "13px 0" }}>{children}</div>; }
function Li({ k, children }) { return <li style={{ display: "flex", alignItems: "flex-start", flexWrap: "wrap", margin: "8px 0", fontFamily: SERIF, fontSize: 16, color: C.ink, lineHeight: 1.5 }}>{k ? <Tag k={k} /> : <span style={{ color: C.gold, fontWeight: 800, marginRight: 8 }}>·</span>}<span style={{ flex: 1, minWidth: 220 }}>{children}</span></li>; }

const OWNERSHIP = [
  ["Finch", "Name it, dress it, choose its species; it reflects YOUR self-care."],
  ["Tamagotchi", "How you care shapes which adult it becomes — care-determines-form."],
  ["Neko Atsume", "What you put out decides who visits — curation + surprise + variety."],
  ["Webkinz", "Adopt + name + a room you decorate — identity + a place that's yours."],
  ["Sky / Animal Crossing", "Cosmetics + expression + a world that says 'this is mine.'"],
];
const SIGNALS = [
  ["Journal", "pages, threads, a sealed letter set"],
  ["Nutrition", "meals, water, a plan followed"],
  ["Check-ins / Today", "a daily check-in, mood + energy"],
  ["Community", "an echo, a question answered, a witness held"],
  ["Planner / cycle", "tending the cycle, a symptom logged"],
  ["Programs", "a session done, a practice kept"],
];

export default function CompanionVisionDoc() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "8px 2px 60px" }}>
      <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", fontWeight: 700, color: C.goldDeep, marginBottom: 10 }}>Flagship vision · the Companion</div>
      <h1 style={{ fontFamily: SCRIPT, fontSize: 44, color: C.ink, margin: "0 0 6px", lineHeight: 1 }}>Her living thing</h1>
      <P lede>A single living companion — her heartbeat, her seedling, her quiet pet — grown from how she shows up across the WHOLE app, unmistakably hers, and tended, reshaped &amp; (carefully) shared. Not a Journal feature; the app's beating centre. The MVP is shipping alongside this doc.</P>

      <H2 n="i">The app's heartbeat</H2>
      <P>It draws life from every corner — so the app stops feeling like six separate tools and every part feeds one thing she loves.</P>
      <Card>
        {SIGNALS.map(([a, s]) => (
          <div key={a} style={{ display: "flex", gap: 10, padding: "4px 0", borderBottom: `1px solid ${C.rule}` }}>
            <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: C.goldDeep, width: 130, flexShrink: 0 }}>{a}</span>
            <span style={{ fontFamily: SERIF, fontSize: 14.5, color: C.ink }}>{s}</span>
          </div>
        ))}
      </Card>

      <H2 n="ii">Unique to her</H2>
      <P>What makes a companion feel like yours, from the best:</P>
      <Card>
        {OWNERSHIP.map(([a, s]) => (
          <div key={a} style={{ padding: "5px 0", borderBottom: `1px solid ${C.rule}` }}>
            <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 15, color: C.ink }}>{a}: </span>
            <span style={{ fontFamily: SERIF, fontSize: 14.5, color: C.muted, fontStyle: "italic" }}>{s}</span>
          </div>
        ))}
      </Card>
      <P><strong>FemWell's model:</strong> procedural + earned + chosen.</P>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <Li><strong>Seeded per user</strong> — a deterministic seed gives a distinct form (bloom species), palette &amp; personality; two women never open the same companion.</Li>
        <Li><strong>Shaped by behaviour</strong> — the life-area she tends most tilts the form (journal-heavy = inward/leafy; community-heavy = open/social).</Li>
        <Li><strong>Chosen</strong> — rename, reshape, accessorise: ownership through choice, not just luck.</Li>
        <Li><strong>Breathes with her body</strong> — colour + mood follow cycle phase + life stage.</Li>
      </ul>

      <H2 n="iii">Nurture — never guilt</H2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <Li k="mvp"><strong>Tend</strong> — a gentle, always-available "water / sit with it"; a soft glow, never a counter.</Li>
        <Li k="p2"><strong>Feed from life-areas</strong> — a meal drops a seed, a check-in waters, an echo adds light. Care as a by-product of living well.</Li>
        <Li k="p2"><strong>Talk to it</strong> — a one-line note; Jess voices a warm reply.</Li>
        <Li k="p3"><strong>Decorate its spot</strong> — a small scene she arranges.</Li>
        <Li><strong>Resting season (always)</strong> — a gap is a season, met with a welcome-back, never a guilt-trip.</Li>
      </ul>

      <H2 n="iv">Change — make it hers</H2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <Li k="mvp"><strong>Name it.</strong></Li>
        <Li k="mvp"><strong>Reshape it</strong> — pick from the seeded forms so the body is one she loves.</Li>
        <Li k="p2"><strong>Grow through stages</strong> — seed → bloom, earned by tending (already modelled).</Li>
        <Li k="p2"><strong>Accessorise</strong> — a ribbon, a moon; unlocked by milestones.</Li>
        <Li k="p3"><strong>Seasonal + life-stage skins</strong> — a visible record of a year of her.</Li>
      </ul>

      <H2 n="v">Share — beautiful &amp; safe</H2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <Li k="mvp"><strong>Companion card</strong> — a tasteful, screenshot-ready card (companion + name + stage + a line). A non-personal artifact.</Li>
        <Li k="p2"><strong>Gift / visit</strong> — send a sunbeam to an anonymous companion, or visit a sister's garden.</Li>
        <Li k="p3"><strong>Garden of gardens</strong> — a calm anonymous meadow of companions; presence, never a ranking.</Li>
      </ul>
      <Card accent={C.crimson}>
        <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 800, color: C.crimson, marginBottom: 6 }}>Privacy design</div>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <Li>The companion is a <strong>NON-personal artifact</strong> — only form, colour, chosen name, stage, phase tint. NEVER journal text, health data, meals or mood values.</Li>
          <Li>Sharing is <strong>opt-in, per share</strong>; nothing leaves unless she taps share.</Li>
          <Li><strong>Anonymity preserved</strong> — visiting/gifting use the same author-hash model; no handles, no linking a companion to a journal author.</Li>
          <Li><strong>Wall-guard reused</strong> — any text on a shared card runs the Echo scrub + crisis screen.</Li>
          <Li><strong>Private by default</strong> — social layers are an explicit choice, never on by default.</Li>
        </ul>
      </Card>

      <H2 n="vi">Hook · retention · money</H2>
      <P><strong>Hook:</strong> it externalises self-kindness into something that thrives because she showed up — and forgives her when she couldn't. A companion that rests <em>with</em> her, not one that shames her.</P>
      <P><strong>Retention:</strong> a daily "how is she today?" that isn't a number; cross-feature pull; bring-back without streak-shame.</P>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <Li k="p3"><strong>Money (later):</strong> cosmetic packs / a garden room — money buys beauty, NEVER care or progress.</Li>
      </ul>

      <H2 n="vii">Risks &amp; guardrails</H2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <Li>No "wilting / you missed it" copy — audit every state for kindness.</Li>
        <Li>Never a fingerprint that links to her journal (strictly non-personal).</Li>
        <Li>Garden-of-gardens never ranks or counts — presence only.</Li>
        <Li>Stays calm + editorial, never a loud game; no manipulative notifications.</Li>
      </ul>

      <H2 n="viii">Phased roadmap</H2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <Li k="mvp">All-app signals; per-user uniqueness (seeded form/colour/personality); Tend; rename + reshape; a shareable card; app-wide presence (Today + /Garden + Journal hub). <em>(shipping now)</em></Li>
        <Li k="p2">Life-area feeding, talk-to-it w/ Jess reply, milestone accessories, a cross-device companion entity, gift-a-sunbeam.</Li>
        <Li k="p3">Seasonal/life-stage skins, decorate-the-spot, the garden-of-gardens, cosmetic monetisation.</Li>
      </ul>

      <p style={{ fontFamily: SANS, fontSize: 12, color: C.muted, textAlign: "center", marginTop: 28, lineHeight: 1.6 }}>
        Referenced: Finch, Tamagotchi, Neko Atsume, Webkinz, Sky, Animal Crossing. Within the FemWell rails — anonymous, 18+, no streaks/scores/guilt, cream &amp; plum, Ephesis/Cormorant, no emoji. Full doc: femwell-handoff/nurture-companion-vision_20260615.html.
      </p>
    </div>
  );
}
