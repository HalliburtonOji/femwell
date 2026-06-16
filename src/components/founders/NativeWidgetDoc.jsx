// NativeWidgetDoc — Founders Corner: an honest assessment of what a TRUE iOS/Android home-screen
// widget for the companion/garden would take, what's buildable now (PWA), and the go/no-go.
// Companion handoff: native-widget-options_20260616.html. No emoji.

import React from "react";
import { DocShell, Eyebrow, Title, H2, H3, P, Card, Bullets, Pull, Badge, Table, Foot } from "./DocKit";

export default function NativeWidgetDoc() {
  return (
    <DocShell>
      <Eyebrow>Companion · home-screen presence · options + go/no-go</Eyebrow>
      <Title sub="What a true OS home-screen widget for the day's bloom would actually require, what ships now on the web/PWA stack, and the realistic options — so this is a decision, not a guess.">
        The home-screen widget — honest options
      </Title>

      <Pull>FemWell is a Base44 React web app. A web app / PWA <strong>cannot render a true OS home-screen widget</strong> — that needs native platform code. So the choice isn't "build the widget" vs "don't"; it's "do we open a native track." This lays out both.</Pull>

      <H2>What ships NOW (web/PWA — built this pass)</H2>
      <Bullets items={[
        "Installable PWA — “Add to Home Screen” gives a standalone, full-screen FemWell with its own icon (Android/Chrome/desktop fully; iOS Safari supported).",
        "A real brand icon — replaced the broken external Base44 logo (it was failing to load / off-brand) with a self-contained FemWell bloom icon; standalone display, brand theme colour, correct app title.",
        "Home-screen shortcuts — long-press the installed icon → “Your garden” jumps straight to /Garden (and “Today”).",
        "The today's-bloom GLANCE — /Garden opens with today's plant + “what fed it” as the first thing, so the installed app is a one-tap glance. This is the closest web-stack equivalent of a widget.",
      ]} />
      <Card accent="#A6862B"><P><Badge tone="amber">Small follow-up</Badge> &nbsp;iOS home-screen icons prefer a PNG <code>apple-touch-icon</code>; we ship the brand SVG (works broadly, and on iOS falls back gracefully). Generating 180/192/512 PNGs from the SVG is a ~30-min polish, not a blocker.</P></Card>

      <H2>What a TRUE native widget requires (and why the web can't)</H2>
      <P>A real iOS/Android home-screen widget is native code that runs <em>outside</em> the web view — it can't reuse our React components, and a PWA has no API to draw one.</P>
      <Table rows={[
        ["Layer", "What's needed"],
        ["Native app shell", "Wrap the web app in Capacitor (or a native WebView app) — required even to reach the App Store / Play Store at all."],
        ["iOS widget", "A WidgetKit extension in Swift/SwiftUI, a TimelineProvider for refresh, and an App Group to share the day's bloom state from the app to the widget."],
        ["Android widget", "An App Widget (AppWidgetProvider + RemoteViews, or Glance/Compose), updated on a schedule/broadcast, backed by shared storage."],
        ["Pipeline", "Native build + code signing + store review + ongoing native maintenance for both platforms."],
      ]} />

      <H2>Effort &amp; the options</H2>
      <H3>Option 1 — Stay PWA (now) <Badge tone="green">Done</Badge></H3>
      <P>Installable + Garden shortcut + the today's-bloom glance. Zero native cost, ships today. No true widget, but a one-tap glance.</P>
      <H3>Option 2 — Capacitor shell + native widget <Badge tone="amber">Platform track</Badge></H3>
      <P>Wrap the existing web app in Capacitor (the app itself keeps working as-is inside), then add the iOS WidgetKit + Android App Widget extensions sharing the bloom state. Realistically a multi-week platform project (shell + store submission first, then the widgets), with ongoing native upkeep. It should ride a broader native-app decision (push notifications, store presence) — not be a standalone widget effort.</P>
      <H3>Option 3 — Notification glance (interim) <Badge tone="plum">Lighter</Badge></H3>
      <P>A gentle daily "your garden today" — lighter than a widget. Needs push setup; web-push has real iOS limitations, so this also leans toward a native shell to be reliable.</P>

      <H2>Recommendation</H2>
      <Bullets items={[
        "Ship the PWA strengthening now (done) — it's the honest, zero-cost “home-screen presence”.",
        "DON'T build a fake widget — no native widget chrome inside the web app.",
        "Defer the true native widget to WHEN a native/Capacitor track is greenlit — fold it into that decision (alongside push + store presence), where the shell cost is shared. As a standalone effort the widget isn't worth a multi-week native project yet.",
        "If/when you want it: the smallest first step is a Capacitor shell (proves store viability), then the iOS widget (largest reach for this audience), then Android.",
      ]} />

      <Foot>
        <P>Built this pass: brand PWA icon (fixed the broken external logo), manifest shortcuts (Garden/Today), standalone display + brand theme + correct title, and the /Garden today's-bloom glance. Honest verdict: a true OS widget is a native platform track, not a web change — deliberately NOT faked. Handoff one-pager: <code>femwell-handoff/native-widget-options_20260616.html</code>.</P>
      </Foot>
    </DocShell>
  );
}
