// BottomNavPlanDoc — in-app phone-readable mirror of
// femwell-handoff/BOTTOM-NAV-PLAN_2026-06-18.html. Renders the bottom-nav
// research & recommendation (floating cream capsule + shrink-on-scroll, reject
// horizontal-scroll nav) with the honest drawbacks intact, using the shared
// DocKit editorial primitives so it reads as a finished plan, not raw markdown.
// Source of truth: claude-state / the handoff HTML. No code is changed by this
// doc — it is a proposal awaiting Halli's approval.

import React from "react";
import { DocShell, Eyebrow, Title, H2, H3, P, Card, Bullets, Pull, Badge, D } from "./DocKit";

const SANS = 'ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif';

// A two-column "why it's nice / what to watch" block, stacks on phone.
function ProsCons({ pros, cons }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, margin: "12px 0" }}>
      <div>
        <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: D.sage, margin: "0 0 4px" }}>Why it's nice</div>
        <Bullets items={pros} dot={D.sage} />
      </div>
      <div>
        <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#BC2E27", margin: "0 0 4px" }}>What to watch</div>
        <Bullets items={cons} dot="#BC2E27" />
      </div>
    </div>
  );
}

// The "honest drawback" callout — crimson-tinted, so the trade-offs never hide.
function Drawback({ children }) {
  return (
    <div style={{ background: "rgba(188,46,39,0.06)", border: "1px solid rgba(188,46,39,0.25)", borderRadius: 12, padding: "12px 15px", margin: "14px 0" }}>
      <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#BC2E27", marginBottom: 4 }}>Honest drawback</div>
      <p style={{ fontSize: 15.5, color: D.ink, lineHeight: 1.55, margin: 0 }}>{children}</p>
    </div>
  );
}

// One phase of the rollout plan.
function Phase({ tag, children }) {
  return (
    <div style={{ border: `1px solid ${D.rule}`, borderRadius: 14, padding: "13px 16px", margin: "12px 0", background: D.paperHi }}>
      <span style={{ display: "inline-block", fontFamily: SANS, fontSize: 11.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#fff", background: D.plum, borderRadius: 999, padding: "2px 11px", marginBottom: 7 }}>{tag}</span>
      <p style={{ fontSize: 15.5, color: D.ink, lineHeight: 1.55, margin: 0 }}>{children}</p>
    </div>
  );
}

export default function BottomNavPlanDoc() {
  return (
    <DocShell>
      <Eyebrow>FemWell · Design proposal · for approval</Eyebrow>
      <Title sub="Research & plan · 18 June 2026 · NO code changed yet · your call before anything ships">
        The bottom nav <span style={{ color: "#BC2E27" }}>♥</span>
      </Title>

      {/* In one breath */}
      <div style={{ background: `linear-gradient(165deg, ${D.paperHi} 0%, rgba(168,137,63,.10) 100%)`, border: `1px solid ${D.rule}`, borderLeft: `4px solid ${D.gold}`, borderRadius: 16, padding: "16px 18px", margin: "16px 0" }}>
        <h2 style={{ fontSize: 22, fontStyle: "italic", fontWeight: 600, color: D.plum, margin: "0 0 6px" }}>In one breath</h2>
        <p style={{ fontSize: 17, color: D.inkSoft, lineHeight: 1.55, margin: "6px 0" }}>
          You want an Instagram-style bottom bar. I think that's right for FemWell — <strong>but done the calm-editorial way, not the literal Instagram way.</strong>
        </p>
        <p style={{ fontSize: 16, color: D.ink, lineHeight: 1.55, margin: "6px 0" }}>
          My recommendation, honestly: <strong>a floating cream capsule with 4 calm destinations + the Jess heart + a "More" door</strong>, that <strong>gently shrinks on scroll-down and returns on scroll-up</strong>. <em>Keep</em> the 4–5 visible slots. <strong>Do not</strong> put the primary nav behind a horizontal scroll — that hides destinations and is a known usability trap. Reach the rest of the app through the per-page "Jump to" switcher you already have.
        </p>
        <p style={{ fontFamily: SANS, fontSize: 13, color: D.inkSoft, margin: "8px 0 0" }}>
          Each idea below has its honest drawbacks spelled out, then a phased plan you can take one piece at a time.
        </p>
      </div>

      {/* Where it is today */}
      <H2>Where the nav is today</H2>
      <Card accent={D.gold}>
        <P>
          Right now FemWell has a <strong>full-width fixed cream bar</strong> pinned to the bottom (<span style={{ fontFamily: SANS, fontSize: 13, color: D.inkSoft }}>MobileBottomNav.jsx</span>): five equal slots — <strong>Today · Lifestyle · Jess (the rose heart FAB) · Profile · Menu</strong> — with Lucide icons, 11–12px labels, a 1px top hairline, and proper safe-area padding for the iPhone home bar.
        </P>
        <P>It's solid and on-brand. What it <em>isn't</em> yet: floating, scroll-aware, or playful. That's the gap this plan closes — without throwing away what works.</P>
      </Card>

      {/* Idea 1 */}
      <H2>Idea 1 — The floating pill / capsule <Badge tone="amber">recommended, on-brand</Badge></H2>
      <P>
        A rounded capsule that <strong>floats above the content</strong> with a margin all around it, rather than a full-width slab welded to the screen edge. Instagram, Arc and a wave of 2025–26 apps use this; it reads modern and light.
      </P>
      <H3>How it should look for FemWell (calm-editorial, not literal IG)</H3>
      <Card accent={D.gold}>
        <Bullets items={[
          "A warm cream capsule (paperHi #F4EFE3), not a black bar — floating ~14px off the bottom and ~14px in from each side, fully rounded (radius 999).",
          "A soft, layered shadow + a 1px gold hairline — the same editorial depth as our cards, so it belongs to the garden, not to a generic app shell.",
          "A faint paper-grain / vine watermark behind it at very low opacity — presence, not noise.",
          "The Jess heart stays the centre — the single rose/crimson disc, lifted slightly proud of the capsule (the one colour pop, per the brand heart rule).",
          "Active item = a soft wax pill behind the icon + the plum label, exactly as now — we keep the calm signifier.",
        ]} />
      </Card>
      <H3>How it interacts with the content underneath</H3>
      <P>A floating capsule does <strong>not</strong> span the full width, so a sliver of page shows down either side of it. Two honest consequences:</P>
      <ProsCons
        pros={[
          "Feels lighter; the page \"breathes\" past it.",
          "Content scrolling behind a translucent capsule looks premium.",
          "Pairs naturally with the scroll-shrink in Idea 2.",
        ]}
        cons={[
          "The page must add bottom padding so the last card/button is never hidden under the floating capsule (this is exactly the popup bug — see Idea 4).",
          "A translucent/blurred capsule over busy imagery can hurt label contrast — we'd keep it mostly opaque cream for legibility (WCAG).",
          "A floating bar with a transparent gutter can let stray taps \"fall through\" to content behind the gutter — easy to handle, but must be deliberate.",
        ]}
      />
      <Drawback>
        A capsule has <strong>less horizontal room</strong> than a full-width bar. It comfortably holds <strong>4 destinations + the centre heart + a "More" door</strong> — about the same as today. It does <em>not</em> let us add "more icons" (that's Idea 3, and the answer there is no). The capsule is a <strong>look-and-feel</strong> upgrade, not a way to fit more sections.
      </Drawback>

      {/* Idea 2 */}
      <H2>Idea 2 — Shrink on scroll-down, restore on scroll-up <Badge tone="amber">recommended, phase 2</Badge></H2>
      <P>
        As the user scrolls <strong>down</strong> into content, the nav shrinks ~20–30% (or tucks toward the edge); as they scroll <strong>up</strong>, it returns to full size. This is a well-trodden pattern (Material Design documents the slide-away/slide-back behaviour) and it gives reading and the slider more room.
      </P>
      <H3>Feasibility & performance</H3>
      <Card accent={D.sage}>
        <Bullets items={[
          "Feasible and cheap. Listen to scroll, compare to the last position, toggle a \"compact\" class. Animate only transform: scale() / translateY() + opacity — GPU-composited, no layout thrash.",
          "Throttle with requestAnimationFrame and read scroll position passively, so it never janks the scroll itself.",
          "Shrinking (scale ~0.8) is gentler than fully hiding — the destinations stay on screen, which sidesteps the \"where did my nav go\" disorientation.",
        ]} dot={D.sage} />
      </Card>
      <H3>The honest risks — and how we de-risk them</H3>
      <Bullets items={[
        "Jitter / flapping: if the threshold is tiny, the bar shrinks-and-grows on every micro-scroll. Fix: require a deliberate delta (>12–16px in one direction) before toggling, and always snap to full at the very top.",
        "Reduced motion: some users get motion-sick from moving chrome. Fix: respect prefers-reduced-motion (stay full-size and still); Material also says don't auto-hide while a screen reader is active.",
        "Reachability: a shrunk bar can drift smaller than a 44×44px tap target. Fix: floor the shrink so every tap target stays ≥44px (WCAG 2.5.5 / Apple HIG).",
        "Short pages: on pages that barely scroll, the shrink never triggers or feels random. Fix: only arm the behaviour past a minimum scroll height.",
      ]} dot="#BC2E27" />
      <Drawback>
        Scroll-aware chrome is the kind of thing that's <strong>delightful when perfectly tuned and irritating when slightly off</strong>. It needs real on-device tuning (the thresholds above) and a round of testing on a couple of phones. Budget for that, or it'll feel cheap. The safe version: shrink only (never fully hide), reduced-motion honoured.
      </Drawback>

      {/* Idea 3 */}
      <H2>Idea 3 — A horizontally-scrolling nav to fit more icons <Badge tone="red">do not do this</Badge></H2>
      <P>
        The temptation: FemWell has many sections (Today, Lifestyle, Journal, Community, Nutrition, Health, Planner, Pulse, Programs, Garden, Deals, Events…), so why not let the bottom bar scroll sideways to hold them all?
      </P>
      <Drawback>
        <strong>The honest answer: this is a known usability trap.</strong> Anything off the right edge is <strong>effectively invisible</strong>. Users don't reliably discover that primary navigation scrolls sideways — if a destination isn't on screen, most people never find it. NN/g's research is blunt: <em>hiding global navigation degrades the experience on mobile</em>, and the best designs keep navigation <strong>visible and salient</strong>. Material Design is equally explicit: a bottom bar should expose <strong>3–5 destinations with fixed positions</strong> — more than five and the targets crowd; the bar <strong>should not be scrolled</strong>.
      </Drawback>
      <Pull>"If the menu isn't visible, people don't really think to interact with it at all." — NN/g, on hidden mobile navigation.</Pull>
      <H3>Better ways to reach everything (we already have most of these)</H3>
      <Card accent={D.sage}>
        <Bullets items={[
          "4–5 fixed primary destinations + a \"More\" door. Pick the few journeys people do daily; everything else lives one tap away behind \"More\"/Menu. This is what the current nav already does — keep it.",
          "Lean on the per-page \"Jump to\" switcher. You already mandate a central Jump-to sheet on every multi-layer page (Journal, Community, Nutrition, Lifestyle…). That — not the bottom bar — is the right place to reach a page's many rooms. The new Today — Option 2 demo's section rail is the same idea.",
          "Jess as a universal \"take me to…\". The heart in the centre can answer \"open my journal / show this week's pattern\" — a search-like shortcut to anywhere, without crowding the bar.",
        ]} dot={D.sage} />
      </Card>

      {/* Idea 4 */}
      <H2>Idea 4 — The popup-hidden-behind-the-nav bug <Badge tone="green">already fixed</Badge></H2>
      <Card accent={D.plum}>
        <P>
          <strong>Root cause.</strong> The bottom-sheets actually sat <em>above</em> the nav in stacking order (z-index 60–80 vs the nav's 40) — so it wasn't a z-index war. The real problem was <strong>space</strong>: the fixed nav is ~72px tall <em>plus</em> the iPhone safe-area, but the sheets only padded ~28–36px at the bottom. So a sheet's last button was physically painted underneath the fixed nav and couldn't be tapped.
        </P>
        <P>
          <strong>The fix (shipped, separate work-stream).</strong> The sheets' bottom padding was bumped to <code>calc(96px + safe-area-inset-bottom)</code> — clearing the nav — on the shared HubSheet body and all four "Jump to" sheets (Journal / Community / Nutrition / Lifestyle). Full-screen overlays (e.g. the journal composer at z-90) already cover the nav, so they were fine.
        </P>
        <P>
          <strong>What this plan must preserve.</strong> Whichever nav we build, the rule is the same: <strong>every scrollable surface and the page itself must reserve bottom clearance for the nav</strong> (including the floating capsule's margin + the safe-area). A floating capsule sits a little higher than a slab, so bake that clearance into one shared token, set in one place.
        </P>
      </Card>

      {/* Recommendation */}
      <H2>My recommendation</H2>
      <div style={{ background: `linear-gradient(165deg, ${D.paperHi} 0%, rgba(168,137,63,.10) 100%)`, border: `1px solid ${D.rule}`, borderLeft: `4px solid ${D.gold}`, borderRadius: 16, padding: "16px 18px", margin: "14px 0" }}>
        <p style={{ fontSize: 17, color: D.inkSoft, lineHeight: 1.55, margin: "0 0 10px" }}>
          <strong>Build a floating cream capsule (Idea 1) with 4 destinations + the Jess heart + "More", that shrinks-on-scroll (Idea 2). Keep destinations visible — reject the horizontal-scroll nav (Idea 3). Reach the rest through the per-page Jump-to switcher and Jess.</strong>
        </p>
        <pre style={{ fontFamily: SANS, fontSize: 12.5, lineHeight: 1.5, background: D.page, border: `1px dashed ${D.rule}`, borderRadius: 12, padding: 14, color: D.inkSoft, whiteSpace: "pre", overflowX: "auto", margin: "8px 0" }}>{`  ↓ floating, ~14px off every edge, shrinks on scroll-down
 ┌────────────────────────────────┐
 │  Today  Lifestyle  ( ♥ )  Journal  More  │
 └────────────────────────────────┘
   warm cream · gold hairline · soft shadow · heart proud of the capsule`}</pre>
        <p style={{ fontFamily: SANS, fontSize: 13, color: D.inkSoft, margin: "8px 0 0" }}>
          (Slot choice is yours — Today / Lifestyle / Jess / Journal / More is one calm default; Profile can move into "More". The point is <strong>four visible + heart + a door</strong>, not which four.)
        </p>
      </div>
      <H3>The trade-offs of choosing this</H3>
      <Bullets items={[
        "It's a look + feel win, not extra capacity — we are deliberately not surfacing more sections in the bar.",
        "The scroll-shrink needs on-device tuning to feel good (the jitter/threshold work in Idea 2).",
        "A floating bar means every page must respect the shared bottom-clearance token — one-time plumbing, then it's automatic.",
      ]} dot="#BC2E27" />

      {/* Phased plan */}
      <H2>A phased plan (take it one step at a time)</H2>
      <Phase tag="Phase 0 · foundation (no visible change)">
        Introduce a single <code>--fw-nav-clearance</code> token (nav height + float margin + safe-area) and make every page + sheet reserve it. Locks in the popup fix app-wide and unblocks a floating bar. <strong>Low risk.</strong>
      </Phase>
      <Phase tag="Phase 1 · the capsule look">
        Restyle the existing 5-slot bar into the floating cream capsule (Idea 1): float, radius, gold hairline, soft shadow, heart proud of the bar. <strong>Same destinations, same behaviour</strong> — purely visual. Ship behind a quick on/off so you can compare against today.
      </Phase>
      <Phase tag="Phase 2 · scroll-shrink">
        Add shrink-on-scroll-down / restore-on-scroll-up (Idea 2) with the threshold, reduced-motion and 44px-floor safeguards. Tune on a real phone. <strong>Safe default: shrink only, never fully hide.</strong>
      </Phase>
      <Phase tag="Phase 3 · reach-everything polish (optional)">
        Make "More" a calm grid sheet of every section (it largely is — the Menu), and let the Jess heart answer "take me to…". This is how we serve the <em>many</em> sections without ever scrolling the bar. <strong>No horizontal nav.</strong>
      </Phase>

      {/* Sources */}
      <H2>Sources</H2>
      <Bullets items={[
        "Nielsen Norman Group — Beyond the Hamburger: What Makes Navigation Discoverable on Mobile (hidden nav degrades UX; best designs keep nav visible & salient).",
        "Nielsen Norman Group — Mobile navigation research hub.",
        "Material Design 3 — Navigation bar guidelines (3–5 fixed destinations; avoid >5; positions should not be scrolled).",
        "Material Design — Bottom navigation (auto-hide on scroll + accessibility carve-out for screen readers).",
        "W3C WCAG 2.1 — Target Size (2.5.5) / Apple HIG 44pt minimum tap target.",
        "MDN — prefers-reduced-motion (motion-safe chrome).",
      ]} />
      <p style={{ fontFamily: SANS, fontSize: 13, color: D.inkSoft, textAlign: "center", margin: "26px 0 0" }}>
        FemWell · bottom-nav research &amp; plan · nothing shipped — awaiting your approval · 18 June 2026
      </p>
    </DocShell>
  );
}
