// BrandIdentityDoc — in-app Founders Corner mirror of the brand-identity &
// decoration exploration (handoff: brand-identity-exploration_20260614.html).
// Editorial cream/ink dev surface, mirroring DocKit's component language.
// Self-contained, no props, plain JSX, Lucide/SVG only, no emoji.

import React from "react";

// Local palette — brand tokens, verbatim (cream / espresso / one crimson pop).
const C = {
  cream:   "#F4EDDB",
  paper:   "#ECE7DA",
  paperHi: "#FBF6E6",
  ink:     "#3A2C1A",
  deepink: "#0B0805",
  muted:   "#9B8B7A",
  blush:   "#E8B4B8",
  sage:    "#8FAF8F",
  gold:    "#D4AF37",
  goldDeep:"#A8893F",
  crimson: "#BC2E27",
  rule:    "rgba(58,44,26,0.14)",
};
const SCRIPT = '"Ephesis","Pinyon Script",cursive';
const SERIF  = '"Cormorant Garamond","Fraunces",Georgia,serif';
const SANS   = 'ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif';

// ── primitives ─────────────────────────────────────────────────────────
function Eyebrow({ children }) {
  return <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700, color: C.goldDeep, margin: "0 0 12px" }}>{children}</div>;
}
function H2({ n, children }) {
  return (
    <h2 style={{ fontFamily: SERIF, fontSize: 25, fontWeight: 600, color: C.ink, margin: "40px 0 4px", lineHeight: 1.18, paddingBottom: 7, borderBottom: `2px solid ${C.rule}` }}>
      {n != null && <span style={{ fontFamily: SCRIPT, fontSize: 34, color: C.goldDeep, marginRight: 8 }}>{n}</span>}
      {children}
    </h2>
  );
}
function H3({ children }) {
  return <h3 style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: C.ink, margin: "22px 0 4px" }}>{children}</h3>;
}
function P({ children, lede }) {
  return <p style={{ fontFamily: SERIF, fontSize: lede ? 18 : 16.5, color: C.ink, lineHeight: 1.55, margin: "9px 0" }}>{children}</p>;
}
function Label({ children }) {
  return <div style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, color: C.muted, margin: "20px 0 6px" }}>{children}</div>;
}
function Pull({ children }) {
  return <blockquote style={{ margin: "16px 0", padding: "15px 17px", background: C.cream, borderRadius: 11, borderLeft: `3px solid ${C.blush}`, fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: C.ink, lineHeight: 1.5 }}>{children}</blockquote>;
}
function Card({ children, accent = C.gold }) {
  return <div style={{ background: C.paperHi, border: `1px solid ${C.rule}`, borderLeft: `3px solid ${accent}`, borderRadius: 13, padding: "14px 16px", margin: "14px 0" }}>{children}</div>;
}
function Bullets({ items, dot = C.gold }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "10px 0" }}>
      {items.map((it, i) => (
        <li key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", margin: "8px 0", fontFamily: SERIF, fontSize: 16, color: C.ink, lineHeight: 1.5 }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: dot, marginTop: 9, flexShrink: 0 }} />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
function Code({ children }) {
  return <code style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: 12.5, background: C.cream, padding: "1px 5px", borderRadius: 5, color: C.crimson }}>{children}</code>;
}
function Mock({ children, cap }) {
  return (
    <div style={{ background: C.cream, border: `1px solid ${C.rule}`, borderRadius: 14, padding: "18px 16px", margin: "14px 0", textAlign: "center" }}>
      {children}
      <div style={{ fontFamily: SANS, fontSize: 11, color: C.muted, marginTop: 10, letterSpacing: "0.02em" }}>{cap}</div>
    </div>
  );
}

// ── the heart (filled / outline) — the single crimson pop ───────────────
function Heart({ size = 24, outline = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path
        d="M12 20.3C7 16.6 3.6 13.8 3.6 9.7 3.6 7.2 5.5 5.4 7.9 5.4c1.6 0 3.1.9 3.9 2.3.2.3.6.3.8 0 .8-1.4 2.3-2.3 3.9-2.3 2.4 0 4.3 1.8 4.3 4.3 0 4.1-3.4 6.9-8.4 10.6-.2.1-.4.1-.6 0Z"
        fill={outline ? "none" : C.crimson} stroke={outline ? C.crimson : "none"} strokeWidth={outline ? 1.4 : 0}
        transform="rotate(-6 12 12)" />
      {!outline && <circle cx="9.2" cy="9.4" r="1.5" fill="#fff" opacity="0.85" />}
    </svg>
  );
}

// ── decorative motifs (drop-in line botanicals) ─────────────────────────
function Motif({ kind }) {
  if (kind === "sprig") {
    return (
      <svg width="56" height="56" viewBox="0 0 60 60" aria-hidden="true">
        <g fill="none" stroke={C.ink} strokeWidth="1.3" strokeLinecap="round">
          <path d="M30 54 C30 40 30 22 30 8" />
          <path d="M30 40 C20 38 14 30 13 22 C23 23 29 30 30 40Z" fill="rgba(143,175,143,0.18)" />
          <path d="M30 32 C40 30 46 22 47 14 C37 15 31 22 30 32Z" fill="rgba(143,175,143,0.18)" />
          <path d="M30 22 C22 21 17 15 16 9 C24 10 29 15 30 22Z" fill="rgba(143,175,143,0.18)" />
        </g>
      </svg>
    );
  }
  if (kind === "bloom") {
    return (
      <svg width="56" height="56" viewBox="0 0 60 60" aria-hidden="true">
        <g fill="none" stroke={C.goldDeep} strokeWidth="1.3" strokeLinecap="round">
          <circle cx="30" cy="22" r="6" fill="rgba(232,180,184,0.4)" />
          <path d="M30 16 C26 10 22 9 18 11 M30 16 C34 10 38 9 42 11" />
          <path d="M30 28 C30 40 30 46 30 54" />
          <path d="M30 40 C24 38 20 33 19 28 M30 44 C36 42 40 37 41 32" />
        </g>
      </svg>
    );
  }
  if (kind === "corner") {
    return (
      <svg width="56" height="56" viewBox="0 0 60 60" aria-hidden="true">
        <g fill="none" stroke={C.ink} strokeWidth="1.2" strokeLinecap="round">
          <path d="M8 8 C8 26 8 26 26 8" />
          <path d="M8 8 C26 8 26 8 8 26" />
          <path d="M14 14 C18 16 18 18 16 22" />
          <circle cx="11" cy="11" r="1.4" fill={C.goldDeep} stroke="none" />
        </g>
      </svg>
    );
  }
  if (kind === "divider") {
    return (
      <svg width="56" height="32" viewBox="0 0 120 32" aria-hidden="true">
        <g fill="none" stroke={C.goldDeep} strokeWidth="1.2" strokeLinecap="round">
          <path d="M4 16 H46" />
          <path d="M74 16 H116" />
          <path d="M52 16 C56 10 64 10 68 16 C64 22 56 22 52 16Z" fill="rgba(212,175,55,0.18)" />
          <circle cx="60" cy="16" r="1.6" fill={C.goldDeep} stroke="none" />
        </g>
      </svg>
    );
  }
  // fern
  return (
    <svg width="56" height="56" viewBox="0 0 60 60" aria-hidden="true">
      <g fill="none" stroke={C.ink} strokeWidth="1.1" strokeLinecap="round" opacity="0.9">
        <path d="M30 50 C30 40 30 30 30 18" />
        <path d="M30 34 C22 33 17 28 16 22" />
        <path d="M30 30 C38 29 43 24 44 18" />
        <path d="M30 26 C24 25 20 21 19 16" />
        <path d="M30 22 C36 21 40 17 41 12" />
        <path d="M30 18 C28 14 28 11 30 8 C32 11 32 14 30 18Z" fill="rgba(232,180,184,0.4)" />
      </g>
    </svg>
  );
}

function MotifRow({ kind, title, desc }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "center", background: C.paperHi, border: `1px solid ${C.rule}`, borderRadius: 13, padding: "14px 16px", margin: "12px 0" }}>
      <div style={{ flexShrink: 0 }}><Motif kind={kind} /></div>
      <div style={{ fontFamily: SANS, fontSize: 13, color: C.ink, lineHeight: 1.5 }}>
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, display: "block", marginBottom: 2 }}>{title}</span>
        {desc}
      </div>
    </div>
  );
}

function Swatch({ name, hex, dark }) {
  return (
    <div style={{ flex: "1 1 60px", minWidth: 60, borderRadius: 9, overflow: "hidden", border: `1px solid ${C.rule}` }}>
      <div style={{ height: 38, background: hex }} />
      <div style={{ fontFamily: SANS, fontSize: 9, textAlign: "center", padding: "4px 2px", color: dark ? "#fff" : C.ink, background: C.paperHi }}>
        {name}<br />{hex.replace("#", "")}
      </div>
    </div>
  );
}

// ── document ────────────────────────────────────────────────────────────
export default function BrandIdentityDoc() {
  React.useEffect(() => {
    const id = "brand-identity-doc-fonts";
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.id = id; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Ephesis&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap";
    document.head.appendChild(l);
  }, []);

  return (
    <div style={{ background: C.paper, padding: "8px 0 60px", fontFamily: SERIF, color: C.ink }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 18px" }}>

        {/* Cover */}
        <header style={{ textAlign: "center", padding: "20px 0 18px", borderBottom: `1px solid ${C.rule}`, marginBottom: 18 }}>
          <Eyebrow>FemWell · Brand Atelier · 14 Jun 2026</Eyebrow>
          <div style={{ fontFamily: SCRIPT, fontSize: 58, lineHeight: 0.9, color: C.ink }}>FemWell</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 19, color: C.muted, marginTop: 6 }}>a whole life, held gently</div>
          <div style={{ fontFamily: SANS, fontSize: 12, color: C.muted, marginTop: 14, lineHeight: 1.5 }}>
            Brand identity, decorative motifs &amp; the heart mark — an exploration. UK market.
          </div>
        </header>

        {/* 1 — Identity */}
        <H2 n="1">Who FemWell is</H2>
        <P lede>FemWell is a <strong>whole-life wellness app for women</strong> — not a clinical tracker. Health is one room, not the house. Women return for belonging, voice, identity and lightness, not for logging symptoms.</P>
        <Pull>It should feel like a beautifully printed private journal a thoughtful friend left open for you — warm, literary, unhurried. Never a dashboard. Never a scoreboard.</Pull>

        <H3>The feeling in five words</H3>
        <Bullets items={[
          <span><strong>Calm.</strong> Generous space, no notification anxiety, nothing flashing for attention.</span>,
          <span><strong>Editorial.</strong> Cream stationery, letterpress ink, a single restrained colour pop — a printed page, not a UI.</span>,
          <span><strong>Gentle.</strong> Counts are never ranked, streaks never shame; a reaction is a <em>hold</em>, not a <em>like</em>.</span>,
          <span><strong>Wholesome.</strong> Relationships, career, friendship, fashion, joy and venting sit beside health — life-stage gently <em>tints</em>, never dominates.</span>,
          <span><strong>Trustworthy.</strong> Anonymous-safe, private-by-default, UK-grounded (NHS, £, UK GDPR). Visible privacy beats invisible privacy.</span>,
        ]} />

        <H3>The brand kit (verbatim)</H3>
        <Label>Palette</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "8px 0" }}>
          <Swatch name="cream" hex="#F4EDDB" />
          <Swatch name="paper" hex="#ECE7DA" />
          <Swatch name="ink" hex="#3A2C1A" dark />
          <Swatch name="deep ink" hex="#0B0805" dark />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "8px 0" }}>
          <Swatch name="blush" hex="#E8B4B8" />
          <Swatch name="sage" hex="#8FAF8F" />
          <Swatch name="muted" hex="#9B8B7A" />
          <Swatch name="gold" hex="#D4AF37" />
          <Swatch name="crimson" hex="#BC2E27" dark />
        </div>
        <Label>Type roles</Label>
        <Bullets items={[
          <span><span style={{ fontFamily: SCRIPT, fontSize: 24 }}>Ephesis</span> — display voice. Wordmark, mastheads, big numerals. Used sparingly.</span>,
          <span><em style={{ fontSize: 18 }}>Cormorant Garamond italic</em> — reading &amp; secondary voice. Prompts, pull-quotes, body.</span>,
          <span><span style={{ fontFamily: SANS }}>System sans (Inter-like)</span> — chrome only: eyebrows, dates, labels, buttons.</span>,
        ]} />
        <P><span style={{ fontFamily: SANS, fontSize: 13, color: C.muted }}>No emoji anywhere — Lucide line icons + bespoke SVG only. Crimson <Code>#BC2E27</Code> is reserved as <em>the single colour pop</em>; its only job is the heart.</span></P>

        {/* 2 — Decoration */}
        <H2 n="2">Decorating the pages</H2>
        <P>A small, disciplined library of <strong>hand-drawn line botanicals</strong> and <strong>flourishes</strong> warms the editorial pages without clutter. The rule is restraint: one motif per surface, in ink/gold/sage at low weight, framing — never filling.</P>

        <Label>A starter motif set (drop-in SVG)</Label>
        <MotifRow kind="sprig"   title="The Sprig"           desc="A rising stem with three leaves. Section openers, empty-state centres, the foot of a long entry. Sage-tinted, ink stroke." />
        <MotifRow kind="bloom"   title="The Bloom"           desc="A small open flower, gold stroke, blush centre. Moments of warmth — a saved entry, a gentle milestone." />
        <MotifRow kind="corner"  title="The Corner Flourish" desc="A roundhand corner bracket. Top-left of a card or masthead. Place at one or two corners, never all four." />
        <MotifRow kind="divider" title="The Leaf Divider"    desc="A hairline rule broken by a single leaf-eye. Between sections in a long read — calmer than a hard line." />
        <MotifRow kind="fern"    title="The Fern"            desc="A fine arching frond for tall negative space — the side of a hero, the edge of a header. Texture, not subject." />

        <H3>Plus: paper &amp; deckle texture</H3>
        <P>The journal already carves ink into paper (<Code>InkFilter</Code> / <Code>PAPER_BG</Code>). Extend it gently: a faint deckle edge (<Code>#D8CFBC</Code> wash) on hero cards, a barely-there fibre grain on cream. Texture should be <em>felt, not seen</em>.</P>

        <Label>Do</Label>
        <Bullets dot={C.sage} items={[
          "One motif per surface, calm size, in ink/gold/sage at low weight.",
          "Use motifs to frame and breathe — corners, section heads, empty states.",
          "Keep the hand-drawn line quality (round caps, slightly irregular curves).",
        ]} />
        <Label>Don't</Label>
        <Bullets dot={C.crimson} items={[
          "No full borders, wreaths, or four-corner frames — reads wedding-stationery, not editorial.",
          "Never tint a motif crimson — crimson belongs only to the heart.",
          "No drop shadows, gradients, or clip-art realism.",
          "Never on dense/data surfaces (Pulse, Doctor Export) — those stay clean and clinical.",
        ]} />

        {/* 3 — Heart */}
        <H2 n="3">The heart mark</H2>
        <P>FemWell already has a signature: the small red heart in the page footer (<em>"Made with [heart] love"</em>). It is the brand's warmest atom — and it is being under-used.</P>

        <Card accent={C.crimson}>
          <Label>Where it lives today</Label>
          <P><Code>src/Layout.jsx</Code> line&nbsp;90 — the footer heart, a Lucide <Code>{"<Heart>"}</Code> at <Code>className="w-3 h-3"</Code> (<strong>12&nbsp;px</strong>), filled <Code>#E11D48</Code>.</P>
          <P><span style={{ fontFamily: SANS, fontSize: 13 }}>Two issues: it is <strong>tiny</strong> (12&nbsp;px) and uses <strong>off-brand red</strong> <Code>#E11D48</Code> instead of brand crimson <Code>#BC2E27</Code>. A richer carved heart already exists at <Code>Editorial.jsx</Code> line&nbsp;50 (default 18&nbsp;px crimson) but isn't used here.</span></P>
        </Card>

        <H3>Proposal — make the heart a true brand element</H3>
        <P>Editorial &amp; wellness brands earn recognition through <strong>one consistent signature mark</strong> used with discipline (Headspace's dot, Calm's mark, a magazine's repeated end-mark). FemWell's equivalent is the heart. Two moves:</P>
        <Bullets dot={C.crimson} items={[
          <span><strong>Double its size.</strong> Footer heart 12&nbsp;px → <strong>24&nbsp;px</strong>, swapped to brand crimson <Code>#BC2E27</Code> via the carved <Code>Editorial.jsx</Code> heart. Big enough to read as a mark.</span>,
          <span><strong>Use it consistently</strong> as the app's signature of care — the same heart, the same crimson, recurring in a small set of meaningful places. It becomes the visual rhyme tying every page together.</span>,
        ]} />

        <Label>Where the heart should recur</Label>
        <Bullets dot={C.crimson} items={[
          <span><strong>The "held" affordance.</strong> The Journal/Community reaction is already a <em>hold</em> (never a like, never ranked). The heart <em>is</em> that gesture — held = filled crimson, un-held = ink outline.</span>,
          <span><strong>Section dividers.</strong> A centred heart between major sections instead of a plain rule.</span>,
          <span><strong>The Jess / affection accent.</strong> Jess's warmest moments carry a small heart — the one place crimson is allowed in chat.</span>,
          <span><strong>Loading state.</strong> A single softly-pulsing heart instead of a spinner — calm, never a clinical loader.</span>,
          <span><strong>Empty-state warmth.</strong> The centre of an empty Journal/Saved screen — a heart above one gentle line of Cormorant invitation.</span>,
        ]} />

        <Label>In context — sample mockups</Label>

        <Mock cap="Footer mark, doubled to 24px in brand crimson">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: SANS, fontSize: 13, color: C.muted, letterSpacing: "0.02em" }}>
            Made with <Heart size={24} /> love · UK · 2026
          </span>
        </Mock>

        <Mock cap="Section divider — the heart as a magazine end-mark">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ flex: 1, height: 1, background: C.rule }} />
            <Heart size={22} />
            <span style={{ flex: 1, height: 1, background: C.rule }} />
          </div>
        </Mock>

        <Mock cap="The 'held' reaction — the heart as FemWell's signature affordance">
          <div style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left", background: C.paperHi, border: `1px solid ${C.rule}`, borderRadius: 12, padding: "13px 15px" }}>
            <Heart size={30} />
            <div>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: C.ink }}>Held by 4 women</div>
              <div style={{ fontFamily: SANS, fontSize: 11.5, color: C.muted }}>tap to hold this · never a count, never a rank</div>
            </div>
          </div>
        </Mock>

        <Mock cap="Empty state — outline heart + one gentle Cormorant line">
          <Heart size={34} outline />
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: C.ink, marginTop: 8 }}>Nothing here yet — and that's alright.</div>
        </Mock>

        <P><span style={{ fontFamily: SANS, fontSize: 12, color: C.muted, lineHeight: 1.6 }}><strong>Why this works (lightly cited).</strong> Recognisable brands lean on a single, consistently-deployed mark rather than scattering many — repetition builds memory (the distinctiveness logic in Byron Sharp's <em>How Brands Grow</em>). Calm-first wellness apps (Calm, Headspace) keep their signature small, warm and unhurried rather than gamified — which fits FemWell's no-scoreboard promise. Kept to one crimson, one shape, a handful of jobs, the heart becomes that asset. Honest caveat: illustrative design reasoning, not measured FemWell results.</span></P>

        <div style={{ marginTop: 40, borderTop: `2px solid ${C.rule}`, paddingTop: 14, fontFamily: SANS, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
          Sources: <Code>Editorial.jsx</Code> (palette, type roles, <Code>Heart</Code> ln 50, <Code>InkFilter</Code>, <Code>PAPER_BG</Code>) · <Code>CLAUDE.md</Code> tokens · <Code>Layout.jsx</Code> ln 90 (footer heart) · <Code>JOURNAL_BUILD_SPEC.md</Code> (hold / never-ranked) · <Code>WholeLifeDoc.jsx</Code>. Exploration only — no app file modified.
        </div>

      </div>
    </div>
  );
}
