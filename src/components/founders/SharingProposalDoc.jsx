// SharingProposalDoc — FoundersOS mirror of claude-state/SHARING_PROPOSAL.html.
// Two sharing tracks split by privacy (internal vs external). PROPOSAL, not built.
// Cream/ink editorial, no emoji.

import React from "react";
import { DocShell, Eyebrow, Title, H2, P, Card, Bullets, Pull, Badge, Table, Foot } from "@/components/founders/DocKit";

const M = <Badge tone="amber">M</Badge>;
const HI = <Badge tone="red">High</Badge>;
const DO = <Badge tone="green">DO</Badge>;

export default function SharingProposalDoc() {
  return (
    <DocShell>
      <Eyebrow>FemWell · Sharing · PROPOSAL — research + brainstorm, approval only, NOT built</Eyebrow>
      <Title sub="People like to share — how can it tie to the app so people share their personal lives ON the app, or share things OUTSIDE? Two tracks, split by one hard wall: privacy. Cited research. 2026-06-11.">
        How sharing ties to the app
      </Title>

      <Card accent="#4A2A3A">
        <P><b>The architecture is the safety model.</b> Two separate systems with a non-negotiable wall: <b>(1) INTERNAL</b> — sharing your personal life INTO safe in-app spaces (Circles, Clubs, the wall, a 1:1 witness), anonymous-first + consented; <b>(2) EXTERNAL</b> — sharing NON-personal artifacts (a wisdom line, horoscope, affirmation, book pick, invite) OUT to Instagram/WhatsApp/links as a polished on-brand card. <b>Personal or anonymous content never leaves the app. The only thing external is the user's OWN non-personal words, by explicit opt-in, as a card.</b></P>
        <Pull>THE WALL — anyone's anonymous echo · any journal entry · any witnessed disclosure · any other member's post → can NEVER leave the app by any share path.</Pull>
      </Card>

      <H2>Why the wall is regulation, not just taste</H2>
      <Bullets items={[
        "Anonymous health posts are re-identifiable — authorship attribution re-identified anonymous IVF-forum posters at 97.9% accuracy; reused usernames enable linkage (PMC3806358 / PMC7457524). Sharing another member's anonymous post out = re-publishing special-category-by-inference data.",
        "UK GDPR: health data is special-category, triggered BY INFERENCE; needs Art 6 + Art 9 (ICO). OSA + ICO cross-over: UGC is personal data; DPIA required before processing (Pinsent Masons/ICO).",
        "Cautionary, women's-health-shaped: Flo Health (FTC 2021) shared fertility data with Facebook/Google despite promises — outbound flows are a regulator magnet. Strava's default-public leaked base locations — default-public is the anti-pattern.",
      ]} />

      <H2>Track 1 — INTERNAL (personal life, into safe spaces)</H2>
      <P><b>Exists:</b> four-lives chooser (lock/echo/seal/witness) · Echo Wall (now on Community) · circle/club scoped posts · 1:1 Witness · "Discuss in Community" seeded composer (just built).</P>
      <Table rows={[
        ["Proposal", "Mechanism", "E×I", "Rec"],
        ["Unified 'Share to…' sheet from any entry/moment", "one sheet → Circle · Club · the wall (Echo) · a 1:1 witness", "M·High", "DO"],
        ["Richer 'this is me' — taste/life-stage into chosen spaces", "opt-in facets shown only inside joined circles; never a public profile", "M·Med", "OPT"],
        ["Share a content artifact internally (read/recipe/horoscope) to a room", "the 'Discuss in Community' path carrying an anonymised card", "M·Med", "OPT"],
        ["'My shares' — see what you've shared, retract", "a private device-keyed archive", "M·Med", "OPT"],
      ]} />
      <Card accent="#C4849A"><P><b>Track-1 guardrails:</b> anonymous-first (device hash, never a name); explicit consent on sensitive circles; crisis routing; 18+; no scoreboards; everything stays INSIDE the app — no Track-1 surface ever shows an external-share button.</P></Card>

      <H2>Track 2 — EXTERNAL (non-personal artifacts, out to the world)</H2>
      <P>The growth track — only ever the curated non-personal set: a Living Wisdom line, today's horoscope, an affirmation, a book pick, "this resonated," the invite. Rendered as a branded share-card.</P>
      <H2>The share-card system</H2>
      <Bullets items={[
        "Render server-side from a templated SVG → PNG (placeholder substitution; embed brand fonts) — the Spotify-Wrapped/Strava pipeline. On Base44: a self-contained function.",
        "1080×1920, 9:16, Story-shaped, high contrast, one hero line. Brand tokens, Fraunces+Inter, NO emoji, small wordmark + invite (short link / QR).",
        "Identity-signalling, never data-dumping — a line she's proud to be seen with; never her logged health data.",
        "No PII on the card — no username, handle, or avatar (reuse enables linkage).",
      ]} />
      <H2>The mechanisms</H2>
      <Bullets items={[
        "Primary: render card → navigator.share({files:[png]}) after a canShare check (surfaces IG/WhatsApp/Messages). Tap-triggered + HTTPS (MDN).",
        "Fallbacks (Web Share isn't universal): download-image, copy-link, WhatsApp/Telegram text links.",
        "Instagram Stories caveat: the instagram-stories:// background-image handoff is NATIVE-ONLY (no web path) — so on mobile web the card + navigator.share route is the realistic one (Meta).",
        "Deep links back in: every card carries a link to the surface it came from — the inbound loop.",
      ]} />
      <Table rows={[
        ["Artifact → external card", "Source surface", "E×I", "Rec"],
        ["A Living Wisdom line", "Community → Living Wisdom", "M·High", "DO"],
        ["Today's horoscope / 'today's sky'", "Lifestyle → Horoscope", "M·High", "DO"],
        ["An affirmation", "Journal affirmations / daily", "S·Med", "DO"],
        ["A book-club pick / 'currently reading'", "Library / Book Club", "M·Med", "OPT"],
        ["'This resonated' — the user's OWN one line (opt-in)", "Journal (her words only, never an echo)", "M·Med", "OPT"],
        ["Invite / referral card (organic growth)", "rides a wisdom/horoscope card", "M·High", "DO"],
      ]} />

      <H2>Invite / referral growth (done right)</H2>
      <Bullets items={[
        "Content-led, not a naked link — the invite rides a beautiful card, not a 'refer 5 friends' blast (broadcasting links is the spam/fraud anti-pattern — Alloy).",
        "Double-sided, non-cash — both sides get something gentle; wellness users respond to alignment over discounts (ReferralCandy/Yotpo).",
        "Never scrape contacts; never auto-broadcast. Instrument which cards spread (Duolingo) — reports ~80% organic acquisition from these loops.",
      ]} />

      <H2>Hard privacy rules (ALL of Track 2)</H2>
      <Card accent="#BC2E27">
        <Bullets items={[
          "Two tracks, hard wall — Track-1 personal/anonymous content has ZERO external-share affordance.",
          "NEVER let one user share another user's content externally — the single hardest 'never'.",
          "No health/logged data on a card; treat any user-authored text as special-category-by-inference.",
          "Default to private; never opt a user into outbound sharing (Strava lesson).",
          "No PII/handle/avatar on cards; no third-party analytics or marketing SDK in the share path (Flo lesson).",
          "Only the user's OWN non-personal artifact leaves, by explicit per-share opt-in.",
          "DPIA before launch of the outbound feature; the OSA/ICO floor covers it.",
        ]} />
      </Card>

      <H2>Growth upside + top recommendations</H2>
      <P>The external card is the organic-growth engine (Duolingo: ~5–10x sharing lift, ~80% organic acquisition) — growth WITHOUT compromising the thesis: the safe container stays sealed; only beautiful, non-personal lines go out. The brand is the marketing.</P>
      <Card accent="#6B8F5A">
        <Bullets items={[
          <span><b>1. Build the share-card engine</b> (templated SVG→PNG Base44 fn + a ShareCard client + Web Share with fallbacks). {M}×{HI} {DO}</span>,
          <span><b>2. First cards: Living Wisdom + Horoscope + invite</b> — safest, most shareable, highest-growth. {M}×{HI} {DO}</span>,
          <span><b>3. The unified internal "Share to…" sheet</b> (Track 1). {M}×{HI} {DO}</span>,
          <span><b>4. DPIA + legal sign-off</b> on the outbound path before it ships. {M}×{HI} {DO} (legal-gated)</span>,
        ]} />
      </Card>

      <H2>Open questions for Halli</H2>
      <Bullets items={[
        "Invite reward — double-sided non-cash (feature unlock/credit)? Confirm no cash incentive.",
        "Card rendering — server-side Base44 function (recommended) vs on-device canvas?",
        "'This resonated' (the user's own line, opt-in) — in v1, or wisdom/horoscope/invite only first?",
        "Instrument share events (privacy-safe, no content) to learn what spreads — or zero analytics in the share path?",
        "Confirm the legal floor (DPIA + OSA/ICO) gates the outbound launch, like member-created Clubs.",
      ]} />

      <Foot>FemWell — Sharing Proposal · 2026-06-11. PROPOSAL for approval — nothing built. Cited research: claude-state/product-research/sharing_patterns_2026-06-11.md. Two tracks; one hard wall. (ICO facts cross-checked via Pinsent Masons; verify live ICO pages before legal sign-off.)</Foot>
    </DocShell>
  );
}
