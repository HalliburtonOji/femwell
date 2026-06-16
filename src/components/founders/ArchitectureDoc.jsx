// ArchitectureDoc — Founders Corner: the architecture + future-wraps companion.
// How FemWell goes mobile and monetises WITHOUT leaving Base44 — Capacitor as the
// native shell, RevenueCat as the in-app subscription layer, the store-cut vs
// Stripe-on-web trade-off, the native home-screen widget plan (deeper companion to
// the Widget & PWA doc), why the 50-function cap is an in-platform refactor (not a
// migration trigger), and a balanced stay-vs-migrate summary. No emoji.
// Companion handoff: femwell-handoff/architecture-future-wraps_20260616.html.
// Figures are well-known ranges as of mid-2026 — re-check before committing.

import React from "react";
import { DocShell, Eyebrow, Title, H2, H3, P, Card, Bullets, Pull, Badge, Table, Foot } from "./DocKit";

export default function ArchitectureDoc() {
  return (
    <DocShell>
      <Eyebrow>Architecture · future wraps · mobile + monetisation path</Eyebrow>
      <Title sub="A calm, concrete map of how FemWell reaches the app stores and takes paid subscriptions without leaving Base44 — the native shell, the in-app-purchase layer, the store cut, the widget plan, the function cap, and an honest stay-vs-migrate call. A decision aid to revisit, not a build order.">
        Architecture & the future wraps
      </Title>

      <Pull>The headline: going mobile and taking subscriptions does <strong>not</strong> mean leaving Base44 or rewriting FemWell. The same React app runs inside a thin native shell. Base44 stays the app and the backend; new layers sit <em>around</em> it.</Pull>

      <H2>1 · Base44 + Capacitor + RevenueCat — mobile subscriptions, still on Base44</H2>
      <P>Three pieces, three jobs. Nothing here replaces what already exists; each layer wraps the one below it.</P>
      <Table rows={[
        ["Layer", "Its one job"],
        ["Base44 (today)", "Stays the app + the backend. The React UI, entities, auth, functions, Jess — all unchanged. It is still where FemWell lives and where you build."],
        ["Capacitor", "The NATIVE SHELL. Wraps the existing web app in a real iOS/Android app whose main screen is a full-screen WebView running the same React build. Not a rewrite, not a migration — a container."],
        ["RevenueCat", "The IAP / ENTITLEMENT layer. A Capacitor plugin over Apple StoreKit + Google Play Billing + RevenueCat's backend; it sells native subscriptions and tells you who is entitled, across both stores and the web."],
      ]} />
      <H3>How they fit together</H3>
      <Bullets items={[
        <span><strong>Capacitor wraps, it does not rewrite.</strong> You add iOS/Android folders to the repo; the web app is loaded into a native WebView. The same code that serves femwells.com runs inside the app. Device features (push, widgets, billing) come via Capacitor plugins.</span>,
        <span><strong>RevenueCat handles the purchase + entitlement.</strong> Install <code>@revenuecat/purchases-capacitor</code>, <code>npx cap sync</code>, configure products in App Store Connect + Play Console, mirror them in RevenueCat. The plugin fetches products, runs the native purchase sheet, validates receipts, and exposes "is this user a subscriber" on every platform.</span>,
        <span><strong>A webhook keeps Base44 aware.</strong> RevenueCat fires a webhook (or you read its REST API) on purchase / renewal / cancel; a single Base44 function updates the user's entitlement field. Base44 stays the source of truth for what a user can see — it just learns the subscription state from RevenueCat rather than owning the billing.</span>,
        <span><strong>Net effect:</strong> the platform you build on does not change. You gain a store presence and native subscriptions by adding a shell + a billing SDK + one sync function — an in-place extension, not a move.</span>,
      ]} />
      <Card accent="#6B8F5A"><P><Badge tone="green">Honest framing</Badge> &nbsp;This is a real, well-trodden path (Capacitor + RevenueCat is documented and common). It is still a platform project — store accounts, native build/signing, review, ongoing native upkeep — but the FemWell app itself keeps running as-is inside the shell.</P></Card>

      <H2>2 · The store cut vs Stripe-on-web</H2>
      <P>The trade-off that decides where the money flows. Be clear-eyed: native apps generally <strong>must</strong> use store IAP for digital subscriptions — you can't simply take Stripe inside the app for digital goods.</P>
      <Table rows={[
        ["Route", "Cut (approx, re-check)", "Notes"],
        ["Apple / Google IAP — standard", "~30%", "Default commission on in-app digital purchases."],
        ["Apple — Small Business Program", "~15%", "Under ~$1M/yr the previous calendar year; opt-in. Most indie apps qualify."],
        ["Apple — subscriptions after year 1", "~15%", "Auto-renewing subs drop to 15% after a subscriber's first paid year."],
        ["Google Play", "~15% then ~30%", "15% on the first ~$1M/yr; auto-renewing subs are 15% from day one."],
        ["Stripe-on-web", "~1.5%–2.9% + ~£0.20", "UK domestic cards ~1.5%+20p; ~2.9%+ for intl. Billing adds ~0.7%. Far cheaper — but web checkout, outside the app."],
      ]} />
      <H3>The catch, stated plainly</H3>
      <Bullets items={[
        <span><strong>Digital goods in a native app = store IAP.</strong> Both Apple and Google require their in-app purchase system for digital subscriptions delivered in the app. You cannot route a FemWell subscription through Stripe <em>inside</em> the native app the way you can on the open web.</span>,
        <span><strong>The cut buys reach + trust + one-tap convenience.</strong> Store billing is what app users expect, manage in their device settings, and trust. That frictionlessness is part of what the percentage pays for.</span>,
        <span><strong>Web checkout, where allowed.</strong> Recent rulings have loosened things: in the US, apps may now include links steering users to the developer's own website to subscribe (lower fees), and the EU has an external-purchase-link entitlement — but the rules are storefront-specific, still evolving, and carry their own constraints (you generally can't freely mix IAP and external links for the same goods on the same storefront). "Reader"-style exceptions exist but are narrow.</span>,
        <span><strong>Practical pattern:</strong> keep Stripe-on-web for any web-only subscribers (cheapest), use store IAP for in-app subscribers (required), and let RevenueCat unify entitlement so a paid user is recognised wherever they signed up.</span>,
      ]} />
      <Card accent="#A6862B"><P><Badge tone="amber">Re-check before committing</Badge> &nbsp;All percentages and the steering/external-link rules above are the well-known mid-2026 ranges and shift with court rulings and store policy. Confirm current Apple / Google / Stripe terms at decision time — do not bank on a specific figure.</P></Card>

      <H2>3 · The native home-screen widget plan</H2>
      <P>This is the deeper architecture companion to the <strong>Widget &amp; PWA</strong> doc — same verdict, more detail. A true OS home-screen widget is native code that runs <em>outside</em> the web view; a PWA cannot draw one. So a real widget rides the same native track as everything above.</P>
      <Table rows={[
        ["Piece", "What a true widget needs"],
        ["Native shell", "The Capacitor shell from section 1 — required even to reach the stores at all. The widget cannot exist without it."],
        ["iOS widget", "A WidgetKit extension in Swift/SwiftUI with a TimelineProvider for refresh — separate native target, not a React component."],
        ["Android widget", "An App Widget (AppWidgetProvider + RemoteViews, or Glance/Compose), updated on a schedule/broadcast."],
        ["Shared storage", "An iOS App Group / Android shared storage so the app writes the day's state (e.g. today's bloom) where the widget can read it."],
        ["Store pipeline", "Native build, code signing, store review, and ongoing native maintenance for both platforms."],
      ]} />
      <H3>Effort &amp; go / no-go</H3>
      <Bullets items={[
        <span><strong>Effort:</strong> a multi-week native project — and only feasible once the Capacitor shell exists. The widget is meaningful incremental work <em>on top of</em> the shell, per platform.</span>,
        <span><strong>Go / no-go:</strong> <Badge tone="amber">Defer</Badge> as a standalone effort — not worth a multi-week native project on its own. <Badge tone="green">Greenlight</Badge> only when a native/Capacitor track is already happening (alongside store presence + push), where the shell cost is shared.</span>,
        <span><strong>Smallest first step</strong> (when greenlit): Capacitor shell first (proves store viability), then the iOS widget (largest reach for this audience), then Android.</span>,
        <span><strong>Stays consistent with the Widget &amp; PWA doc:</strong> ship the PWA strengthening now (installable, brand icon, Garden shortcut, the today's-bloom glance as the web-stack stand-in); do NOT fake widget chrome inside the web app.</span>,
      ]} />

      <H2>4 · Why the 50-function cap does NOT mean migrating</H2>
      <P>Base44 caps the number of backend functions (around 50). It is real, but it is a <strong>shape</strong> problem, not a ceiling on what FemWell can do — and the fix lives inside the platform.</P>
      <Bullets items={[
        <span><strong>The fix is consolidation.</strong> Collapse many small single-purpose functions into a few <em>dispatcher</em> functions: one function that routes many actions via an <code>action</code> parameter (e.g. one <code>community</code> function handling action <code>echo.create</code> / <code>witness.match</code> / <code>comment.moderate</code>). One deployed function, many behaviours.</span>,
        <span><strong>It is an in-platform refactor, not an exit.</strong> No new host, no rebuilt backend — you reorganise how the same logic is grouped. Capacity stops being a count of features and becomes a count of domains.</span>,
        <span><strong>It also tidies the codebase.</strong> Grouping related actions behind one entry point tends to centralise auth, validation, and crisis/moderation checks — a quality win, not just a cap workaround.</span>,
        <span><strong>Calm verdict:</strong> hitting the function cap is a signal to consolidate, never a reason to leave Base44.</span>,
      ]} />
      <Card accent="#4A2A3A"><P>Mind the known deploy gotchas when consolidating: nothing declared after <code>Deno.serve</code>; new <code>_shared</code> files may need inlining; failed registrations are sticky per name. Refactor carefully and exit-gate a real end-to-end call.</P></Card>

      <H2>5 · Migration vs stay — the balanced call</H2>
      <Table rows={[
        ["", "Stay on Base44 (+ wrap)", "Migrate to a custom stack"],
        ["Speed", "Fast — build in-repo, deploy in minutes", "Slow — large rebuild before parity"],
        ["Backend / auth / entities", "Integrated, free, already working", "You build and run all of it yourself"],
        ["Low-code leverage", "High — platform does the heavy lifting", "None — full ownership = full burden"],
        ["Caps / limits", "Function cap + platform limits (workable)", "No platform caps"],
        ["Control", "Bounded by the platform", "Total control of stack + infra"],
        ["Cost / risk", "Low ongoing cost + low risk", "High rebuild cost + lose the integrated platform"],
        ["Mobile", "Capacitor wrap — same app in a shell", "Native or wrap — but after rebuilding the backend"],
      ]} />
      <H3>Recommendation</H3>
      <Bullets dot="#6B8F5A" items={[
        <span><strong>Stay on Base44 and wrap with Capacitor</strong> for mobile + native subscriptions (RevenueCat). It keeps the speed and the integrated backend while opening the stores.</span>,
        <span><strong>Treat the function cap as a refactor</strong> (dispatchers), not a migration trigger.</span>,
        <span><strong>Revisit migration only if platform limits become genuinely blocking</strong> — a hard ceiling you cannot consolidate around, or a capability the platform structurally cannot provide. Until then, the rebuild cost and the loss of the integrated platform outweigh the control gained.</span>,
      ]} />

      <Foot>
        <P>Companion to the <strong>Widget &amp; PWA</strong> doc (this is the deeper architecture companion — same go/no-go). Figures and store rules are well-known mid-2026 ranges and must be re-checked at decision time. Handoff one-pager: <code>femwell-handoff/architecture-future-wraps_20260616.html</code>. A decision aid — not a commitment to build.</P>
      </Foot>
    </DocShell>
  );
}
