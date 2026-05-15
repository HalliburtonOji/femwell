# FemWell Plus — pricing + paywall strategy

**Authored 2026-05-14 by Cowork (Ms Strategy hat).** Brainstorm + design direction for the Plus tier paywall now that Doctor-Ready Diary (Planner-A C4) is the headline new paywall surface. Demo at `claude-state/demos/femwell_plus_tier_paywall_demo.html`.

---

## TL;DR

FemWell Plus is the £1M sale story's most under-developed rail. Stripe is wired, `Entitlements.plan` exists, but the actual upgrade UX is a quiet text link in Settings. After Planner-A C4 ships the Doctor-Ready Diary, Plus has its first **conversion-pull surface** — a moment where a user *needs* something gated. This doc proposes the pricing structure, the upgrade page, the watermark-preview UX, and the lock placement across the app.

**Three decisions to make:**
1. **One tier (£8.99/mo) or two tiers (£4.99 Diary-only + £8.99 full Plus)?** Recommend **single tier at £4.99/mo, £39/yr** with all features in it. Simpler story, wider funnel, the £8.99 reader will pay £4.99 happily.
2. **Watermark preview or hard lock?** Recommend **watermark preview** for Doctor-Ready Diary (renders 1 of 4 pages, faint diagonal "Preview — upgrade to share with your GP" mark, unblurred so the value is legible). Hard lock for Atelier Reading letter (it's content, not data — locking the content not its preview is honest).
3. **Capacitor wrap before iOS or web-first?** Recommend **web-first, Capacitor pre-sale.** Stripe via web works for the next 3-6 months; Capacitor + RevenueCat wrap lands in the Phase D pre-sale push when iOS submission matters for buyer demo.

---

## 1. Why now

Plus has been theoretical because the unlocked features have been *nice* not *needed*. Atelier Reading is a long-form letter — readers consume it monthly, not as a transactional pull. Programs are Pro-locked but most users never start a programme. Cycle Settings advanced is for the irregular-cycle minority.

**Doctor-Ready Diary changes the curve.** It's a transactional artefact a user grabs before a specific GP appointment. The "moment of need" is sharp. NICE-NG23 alignment makes it credible. The persona is the perimenopause woman who just realised her appointment is in 8 days and wants to bring something more credible than a handwritten symptom list. She does not need to be sold on the monthly letter — she needs the PDF in 30 seconds.

**This is also the easiest acquisition story to tell a buyer.** "We have N users who paid £4.99 because they couldn't share their data with their GP otherwise. Here's the conversion funnel." That sentence sells the company.

---

## 2. Pricing recommendation (decision needed)

### Option A — Single tier (recommended)

| Tier | Price | What's in it |
|---|---|---|
| **Free** | £0 | Everything in the app except the Plus surfaces below. Includes all Phase-1 + Phase-2 mechanics: Capacity Tax bar, Quiet Mode auto, Cycle Mirror, Astra sidecar, Pacing Bank, Shutdown ritual, etc. Free tier of Doctor-Ready Diary = 1-page watermarked preview. |
| **Plus** | **£4.99/mo or £39/yr** (save ~35%) | Doctor-Ready Diary full export (4 pages, NICE-NG23) · Atelier Reading monthly letter (Astra Cole long-form) · Programs Pro (PCOS / PMDD / Peri / Meno-Pro) · Cycle Settings advanced · Skin & Hair encrypted timeline · future TTC Mode · future Sessions Garden tab. |

**Why £4.99 not £8.99:** the current £8.99 was set when Atelier letter was the only Plus pull. Doctor-Ready Diary widens the persona net (perimenopause user, GP-prep user) and these users are more price-sensitive than the Atelier-reader cohort. At £4.99/mo the perimenopause conversion is a near-trivial decision; at £8.99 it's a "hmm, let me think." We want the trivial decision. The Atelier-reader cohort will still convert at £4.99 — they're not price-shopping.

**Annual discount:** £39/yr is ~£3.25/mo, a 35% saving. Most subscription apps run a 20% annual; we run 35% because (a) churn is the largest risk on a low-priced sub, (b) a buyer values annual revenue 2-3x monthly at multiple.

### Option B — Two tiers

| Tier | Price | What's in it |
|---|---|---|
| **Free** | £0 | Everything except below. |
| **Plus Diary** | £4.99/mo or £39/yr | Doctor-Ready Diary only. Everything else free. |
| **Plus Full** | £8.99/mo or £79/yr | Doctor-Ready Diary + Atelier Reading + Programs Pro + advanced settings. |

**Why I'm against this:** every tier doubles the pricing-page complexity and halves the conversion. A single tier with one clear price is the textbook play for a £1M-acquisition consumer app. The user research is consistent: tier proliferation is acquirer-credibility-poison ("they don't know who they're selling to").

**Recommendation: ship Option A.** £4.99/mo or £39/yr single tier. Halli's call.

---

## 3. The watermark preview UX (Doctor-Ready Diary specifically)

When a free user taps "Generate" on the Doctor-Ready Diary card (Planner Cycle tab):

1. **Generate the actual PDF server-side** (Code's C4 already does this).
2. **Inject a faint diagonal watermark on every page** — colour `rgba(95,138,133,0.18)` (the teal at low opacity), 28pt Fraunces italic, text: "Preview · FemWell Plus required to share". The watermark is legible-overlay, not redaction. The data underneath is unblurred.
3. **Render only page 1 of 4** (the bleed-pattern + cycle summary page). Pages 2-4 (mood/sleep heatmap, HRT timeline, 3-bullet summary) are gated.
4. **At the bottom of the preview, render an inline upgrade card**: "Three more pages — including the symptom heatmap your GP is trained to read — unlock with FemWell Plus. £4.99/mo or £39/yr. [Unlock →]"
5. **Tap "Unlock →"** opens the upgrade sheet.

**Why watermark preview not hard lock:** the user is already inside the conversion moment (they tapped Generate). Showing them the artefact half-rendered creates the gap they want to close. A hard lock — "Upgrade to use this feature" with no preview — feels like a stickup. The watermark is honest ("you can have this if you pay"), the lock is hostile ("you can't even see what you're missing").

**Why only 1 of 4 pages:** the bleed pattern is the most familiar data to a non-Plus user (it's what every cycle app shows). Pages 2-4 are the new craft — heatmap, HRT timeline, summary — and that's the upgrade pull. Free user sees "I have this already, but the new stuff is locked."

---

## 4. The upgrade sheet (UI direction)

Bottom slide-up sheet (mobile) / centred modal (desktop ≥768px), same affordance shape as `PodcastListenSheet`. Three sections, vertical:

### Header
- Small "FEMWELL PLUS" eyebrow (teal, letterspacing, 10px)
- Fraunces title: "Bring your data to your GP."
- 13px subline: "Plus unlocks the four-page diary your GP is trained to read — plus the monthly letter from Astra Cole, Programs Pro, and more."

### Pricing toggle
- Two pill buttons side-by-side: **Monthly £4.99** | **Annual £39 (save 35%)** (annual is default-selected, badged "Best value" in gold)
- Below: a single line in plum-mute: "Cancel any time. UK billing, £ in your bank."

### What's included (5-row list, lucide check icon left)
- Doctor-Ready Diary — full 4-page export, NICE-NG23 aligned
- Atelier Reading — monthly long-form letter from Astra Cole
- Programs Pro — PCOS, PMDD, Peri-, Meno-Pro pathways
- Advanced cycle settings — custom length, irregular-cycle mode
- Future features — TTC Mode, Skin & Hair, Sessions Garden

### CTA
- Single button: "Start FemWell Plus · £39/yr" (gold background, plum text, full-width, 56px tall)
- Below: 11px plum-mute: "First month free. Charged £39 on Jun 14. Cancel any time in Settings."
- Below that: 10px lightest grey: "Payments processed by Stripe. UK-regulated. Your data stays in the EU."

### Footer
- "Already have Plus? [Sign in]" (text link)
- Privacy policy + Terms (one line, smaller)

**A11y:** focus-trap modal, Escape closes, label-of associations for the toggle, full keyboard nav.

---

## 5. Lock placement across the app

Where does a free user encounter Plus locks? Five surfaces:

| Surface | Where | Lock style |
|---|---|---|
| Doctor-Ready Diary | Planner / Cycle tab | **Watermark preview** (1 of 4 pages, inline upgrade card below) |
| Atelier Reading | Horoscope / Atelier hub | **Hard lock** with month-summary teaser (3 sentences from the letter visible, rest is "Plus to read on") |
| Programs Pro | Programs hub, per program card | **Soft lock** — "Plus" gold pill on PCOS/PMDD/Peri/Meno-Pro card; tap → upgrade sheet |
| Cycle Settings advanced | Profile / Cycle | **Soft lock** — "Custom cycle length (Plus)" greyed-out option |
| Future features | Where they ship | TBD |

**One rule:** Plus is never *required to use* the free tier well. The free user should land on Today / Cycle / Lifestyle / Horoscope and not feel restricted. The Plus pull is on the *one or two surfaces* where the upgrade is naturally surfaced by user intent. Avoid the trap of "Plus to track more than 30 days" or "Plus to log a 6th mood" — feature-padding paywalls signal cynicism to a buyer.

---

## 6. Activation funnel — how the buyer will see it

The £1M sale deck slide should look like this:

```
PLUS CONVERSION FUNNEL — 30-day cohort
├─ App install                                100% (n=10,000)
├─ Reached Planner Cycle tab                   78%
├─ Generated Doctor-Ready Diary preview        18%       ← acquisition moment
├─ Opened upgrade sheet                         9%
├─ Clicked "Start FemWell Plus"                 5%
└─ Paid (after free month)                      4.2%     ← £4.99 ARPU / £39 ARR
```

These are conservative numbers based on Headspace + Calm + Flo Premium funnel benchmarks. Actual numbers will come in once C4 ships and we instrument.

**To get the buyer story telling itself, instrument these events from day one of C4 going live:**
- `plus.diary_preview_generated` (when watermark preview renders)
- `plus.upgrade_sheet_opened` (which surface triggered it — diary / atelier / programs / settings)
- `plus.checkout_started` (Stripe session created)
- `plus.subscription_started` (webhook fires `paid`)
- `plus.subscription_renewed` (annual or monthly)
- `plus.subscription_cancelled` (with reason if user provides)

PostHog or Amplitude. Track from C4 onwards; pre-C4 data is bait-and-switch noise.

---

## 7. Apple IAP path — when?

Per `project_capacitor_stripe_paywall.md` memory: base44 Stripe doesn't satisfy App Store IAP rules. The web app via PWA install works fine with Stripe; the moment FemWell submits to App Store, IAP becomes mandatory.

**Recommendation:** stay web-first until **2026-09-13** (4 months out, midway through 6-month sale window). At that point, do the Capacitor wrap + RevenueCat integration in a 2-week sprint. Submit iOS app to App Store with full IAP. This makes the buyer demo "we ship native on iOS + Android" which is the credibility bar.

**Why not earlier:** Capacitor wrap is a 2-week tax. We have higher-leverage work (Planner-A C0-C9, Care surface, Profile redesign) that ships value faster. The web app installable via PWA is the right MVP path.

**Why not later:** at 4 months out the buyer demo is starting to come together. iOS submission has a 1-2 week review SLA. Submitting at 6 months leaves no buffer.

---

## 8. Build path — when does Plus actually ship?

| Phase | What | Tab/Surface |
|---|---|---|
| **Planner-A C4** (Code now) | Doctor-Ready Diary backend + UI. Free + Plus state. | Planner / Cycle tab |
| **Plus-A** (new, captured today) | The upgrade sheet (`UpgradeSheet.jsx`), pricing toggle, watermark preview wiring, Stripe checkout for £4.99/£39 prices. | New global component, mounts from any Plus-locked card. |
| **Plus-B** | Lock placement sweep — Atelier hard lock + Programs Pro pills + Cycle Settings advanced soft lock. | Multiple existing surfaces. |
| **Plus-C** | Activation instrumentation (PostHog or Amplitude events). | Cross-cutting. |
| **Plus-D** (Sept 2026) | Capacitor wrap + RevenueCat + iOS App Store submission. | Native shell. |

**Plus-A is the next Cowork-spec-able MP after Planner-A C9.** Code can pick it up once the Planner sequence is shipped.

---

## 9. Open questions for Halli (decide whenever you're ready)

1. **One tier or two?** Recommend Option A (single £4.99/£39). Locked unless you say otherwise.
2. **First month free or 7-day trial or no trial?** First-month-free is the friction-lowest play, matches Headspace/Calm. Recommend first-month-free.
3. **Apple IAP timing — Sept '26 or earlier?** Recommend Sept (4 months out). Earlier is a tax.
4. **Watermark preview text — "Preview · FemWell Plus required to share" or something warmer?** Open to your wording.
5. **Plus or Plus+ naming?** Stay with "FemWell Plus" (no plus-plus, no tier names).
6. **What lives at the £8.99 tier if you want to keep it?** If you reject Option A and keep two tiers, the £8.99 is the Atelier + everything else; the £4.99 is Diary + everything else. Both still beat the current £8.99 because Diary alone justifies £4.99.

---

— Cowork (Ms Strategy + Atelier hats), 2026-05-14
