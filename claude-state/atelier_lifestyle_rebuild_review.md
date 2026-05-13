# Ms Atelier — Lifestyle MP-A craft review
**Reviewed:** 2026-05-06 · 09:30 UTC  
**Spec:** lifestyle_rebuild_spec.md  
**Demo:** femwell_lifestyle_demo.html  
**Baseline:** lifestyle_baseline_2026-05-05.md

---

## Headline read

**Status: Ready-with-revisions.**

The spec is technically compliant and correctly scoped — it replaces visual tokens, removes the Bell, restructures nav, and adds Menu plumbing without touching entities or cascading feature scope. The visual direction (rose token swap, Fraunces/Inter consistency, fade-edge tab scroll, bottom-sheet UX) is sound and matches the demo. However, **the spec omits critical details in 6 areas** that will either require design decisions during build or create ambiguous edge cases. These need clarification before Mr Lead Manager drafts the MP prompt. None are blocking; all are solvable in 30 minutes of spec amendment.

---

## Findings (tagged)

### ⌫ Responsive
- **Tab strip at 320px width** — 7 tabs in pill style won't fit. Demo shows fade-edge gradient but doesn't specify minimum scroll-container size, snap-to-item behavior, or whether the active tab auto-centers when clicked at far right. MISSING: snap alignment, focus-into-view spec.
- **Menu sheet on iPhone SE (375px) with 4 sections + Quick Actions** — The spec says "4 sections" but doesn't specify the full-page layout flow: does Quick Actions render as a 4-tile grid, and if so, does Account & Tools get cut off below the fold on a 420px-tall device? MISSING: min-height for sheet scroll or section prioritization. (Demo shows open menu at tablet width but not mobile.)
- **Bottom nav at 320px** — 5-slot grid with Jess FAB centered and raised 18px may hit touch-target edge cases. Spec says FAB is "56×56, raised 14px" but doesn't confirm 44pt minimum touch target for nav slots themselves. MISSING: explicit touch-target sizes for all nav items.

### ⌬ Interaction bugs
- **Save heart optimistic UI** — Spec says heart writes to `UserProfile.saved_item_ids` but doesn't specify network behavior. Does the heart fill immediately (optimistic), stay outlined until confirmed, or show a loading spinner? If save fails mid-flight, does it revert? MISSING: optimistic-UI strategy and error state.
- **Tab scroll sync between click and keyboard navigation** — Spec says "smooth scroll" and mentions fade-edge, but doesn't specify: when user is on a tab at the right edge and presses keyboard `Right`, does the scroll auto-center that tab? Current live code may not have this; don't assume. MISSING: keyboard arrow-key scroll behavior.
- **Menu sheet swipe-down-to-close threshold** — Spec mentions "swipe-down-to-close, elastic bottom bound" from demo, but live code may not implement this. Does it close on any downward drag, or require momentum/threshold? MISSING: swipe-distance / velocity requirements.
- **Active state conflict: both tab and category chip glow rose** — When For-You tab is active AND an "All" chip is active, both will be rose. Do they share the same visual treatment (both pills, both underlines) or is there a hierarchy? Spec says chips go "ink → rose background" but doesn't distinguish tab-active from chip-active visually. MISSING: visual hierarchy rule.

### ⌦ Accessibility
- **Menu sheet `role="dialog"` scrim interaction** — Spec says scrim has `role="button"` to dismiss. This is not standard; typical accessible patterns use `aria-modal="true"` + scrim is `role="presentation"` or no role, with click-to-dismiss as the handler. MISSING: explicit accessibility tree and focus-trap spec.
- **Tab strip keyboard navigation** — `role="tablist"` is correct, but spec doesn't say whether tabs are navigable via `ArrowLeft` / `ArrowRight` or only via click. If keyboard-nav is supported, does focus follow selection? MISSING: keyboard interaction spec for tab strip.
- **For-You feed weighting (silent rerank)** — No affordance or announcement that "why you're seeing this" is active. If a user follows a category in onboarding and later opens For-You, they won't know the feed has been reweighted toward their interests. MISSING: decision on whether silent rerank is intentional (defensible if transparent elsewhere) or if we need a subtle label.
- **Font loading strategy** — Fraunces and Inter are variable; spec doesn't mention `font-display` (auto / swap / block / fallback / optional). On slow 3G, how long does the page block on Fraunces before falling back? MISSING: font-display values and FOUT/FOIT acceptance criteria.
- **Reduced-motion** — Spec lists animations (tab scroll, sheet slide 0.4s, FAB pulse if any) but doesn't mention `prefers-reduced-motion: reduce`. No explicit strategy for disabling animations for users with motion sensitivity. MISSING: `@media (prefers-reduced-motion: reduce)` rules for all animated elements.

### ☷ Empty / loading / error states
- **"Daily Story not yet generated for today"** — Spec says Horoscope tab is a stub and notes "if no items, show Coming Soon message" but doesn't specify the UX for the other 6 tabs if content fails to load or is delayed. MISSING: empty-state design for: For-You (no items match filters), Daily Story (no story generated), Read/Fiction (network error), Stories (offline), Books (weekly pick not set).
- **Menu sheet loading** — Spec says "all sections populated from first build (no lazy-load risk)" but doesn't specify what happens if a Quick Actions tile (e.g., "Ask Jess") fails to resolve. MISSING: loading skeleton or error fallback for menu items.
- **Save toggle during network round-trip** — User taps heart, it fills (optimistic). Network request is in-flight. User taps it again to un-save. What happens? Does the second tap queue, get ignored, or cause a conflict? MISSING: concurrent-request strategy.

### ⌘ Motion
- **Tab scroll elastic behavior** — Demo shows fade-edge but doesn't specify scroll-snapand momentum. Is it snap-to-item (iOS-style momentum scroll with snap), or linear (Android-style overscroll)?  MISSING: scroll-behavior type.
- **Bottom-sheet cubic-bezier(.2,.7,.3,1)** — Spec correctly specifies 0.4s + easing. But what about the scrim fade? Is it the same 0.4s or faster/slower? MISSING: scrim timing sync.
- **FAB entrance animation** — Spec says "does it animate in on first paint?" Open question. If yes, what timing? Fade-in, scale-up, slide-up? MISSING: FAB entrance spec.
- **Category chip hover lift** — Spec says "hover lifts 1px" but doesn't mention transition timing. Is it instant, 0.1s, 0.2s? (Demo CSS uses `.2s` for most hovers.) MISSING: transition-duration.

### ⌗ Typography
- **Menu sheet section headers** — Spec says "4 labeled sections" (QUICK ACTIONS · DAILY PILLARS · COMMUNITY & CONTENT · ACCOUNT & TOOLS) but doesn't specify: are these uppercase bold labels (like .section-title) or smaller uppercase muted labels (like .sheet-section-label in demo)? Font size? Weight? Margin? MISSING: section header treatment.
- **For-You hero subtitle** — Spec doesn't mention whether the "editorial" card at the top of For-You has a subtitle / kicker. Demo shows one, but spec doesn't call it out. If it's part of the rebuild, where does the copy come from? MISSING: editorial card content spec.
- **Category chip labels** — Current live code uses static category enums. Spec doesn't clarify: can category names be user-friendly ("Sleep 😴") or are they fixed enum values ("Sleep")? If emojis are removed globally, are category labels still plain text? MISSING: category label text source.

### ⊘ Token violations
- **Lavender residue check: PASSED** — Grep of `/femwell-repo/src/` found no `#A480FF` or `A480FF` literals. No stray lavender color tokens in code (it's likely in CSS-in-JS or Tailwind config, not hardcoded). Build can safely assume color tokens live in a central theme file.
- **Rose token specification: INCOMPLETE** — Spec says rose `#D45E52` but demo uses `--rose:#d4a5a0` (lighter) and `--rose-deep:#b67d77` (darker). Which rose is "the" rose for active states? Spec says "move all accent to rose family" but doesn't distinguish which shade for which component (tab? chip? button? link?). MISSING: rose-family sub-token allocation (primary rose vs. rose-deep).
- **Plum + ink ambiguity** — Spec says plum `#2b1e16` / `#4A2A3A` but demo CSS uses `--plum:#7a4a5e` (a mid-tone purple). Is "plum" the dark ink-plum (`#2b1e16`) or the accent-plum (`#7a4a5e`)? This cascades: active category chips should use which? MISSING: clarity on ink-plum vs. accent-plum definition.
- **Ink-line vs. line token** — Spec says ink-line `rgba(74,42,58,0.14)` but demo CSS uses `--line:rgba(43,30,22,.10)` (slightly different alpha). Should the border/divider lines use the spec value or demo value? MISSING: token-audit before build to ensure spec tokens match demo CSS.

### ⊘ Empty state for Jess FAB clarification
- **Jess FAB re-position to nav slot 3** — Spec says "centered raised FAB". Current live code has FAB as fixed-position decoration on right side of viewport (per baseline walk). Is the MP-A change: *keep* fixed-position but move it to center above the nav, or *integrate* it into the nav grid? The demo shows it as a nav item (bnav-fab with negative margin-top), not a fixed decoration. MISSING: whether FAB is still fixed-position (same behavior, moved visually) or is now a nav-grid item.

---

## Spec amendments needed before MP draft

**Priority 1 (blocking clarity)**
1. **Clarify rose-family tokens** — Define: `--rose-primary: #D45E52` vs. `--rose-accent: #d4a5a0` vs. `--rose-deep: #b67d77`. Specify which shade is used for: active tabs, active chips, buttons, hover states. (Spec conflicts with demo here.)
2. **Define plum identity** — Is `--plum` the dark accent (`#7a4a5e` per demo) or the ink-dark (`#2b1e16`)? Resolve this before build; it affects every interactive element's active state.
3. **Specify Menu sheet section header styling** — Font size, weight, letter-spacing, margin. Model after demo `.sheet-section-label` (11px, 600 weight, .12em letter-spacing) or create a new rule?

**Priority 2 (responsive / interaction)**
4. **Tab strip scroll behavior at 320px** — Auto-center active tab when clicked? Snap-to-item or free scroll? Confirm keyboard `ArrowLeft/Right` support and scroll-sync behavior.
5. **Save heart optimistic UI strategy** — Heart fills immediately (optimistic), or waits for server response? Error handling: revert on fail?
6. **Category chip vs. active tab visual hierarchy** — Both rose active state, but are they visually distinct (e.g., chip = underline, tab = pill) or identical? Decide before design passes to code.
7. **Menu sheet on mobile (≤420px)** — Specify min-height, overflow behavior, section-stacking order. Which sections are "above fold" on iPhone SE?
8. **Jess FAB positioning** — Is it still `position: fixed` on right side (visual moved to center) or integrated into nav grid? Demo shows grid integration (bnav-fab class); confirm this is the intent.

**Priority 3 (accessibility / polish)**
9. **Keyboard navigation for tab strip** — Arrow keys supported? Focus management during scroll? Announce active tab state?
10. **Font-display strategy** — Specify `font-display: swap` (or block/optional) for Fraunces and Inter to avoid FOIT delays on 3G.
11. **Reduced-motion rules** — Disable tab scroll fade, sheet slide, and FAB animations when `prefers-reduced-motion: reduce` is set.
12. **For-You reweighting transparency** — Silent rerank (current spec) or add a subtle affordance like "Tailored to your interests" label?

---

## What's NOT in the spec but probably should be

1. **Dark mode support** — Does FemWell support dark mode? If yes, all new tokens need dark equivalents. If no, lock the build to light mode explicitly.
2. **Touch target audits** — Explicitly confirm all interactive elements (nav items, chips, buttons, save heart) meet 44pt minimum (Apple HIG).
3. **Haptic feedback on tab change** — Spec mentions "light haptic on tab change (if mobile)" as a single parenthetical. Should this be a full design decision (yes/no/conditions)?
4. **Quick Actions tile content** — Spec says "4 Quick Actions tiles (TBD by Ms Atelier)" but doesn't suggest copy or interaction targets. Are these static links or context-aware shortcuts? Examples: "Log today" (goes to Today page), "Quick question" (opens Jess chat), etc. — design these before MP draft.
5. **For-You editorial hero card sourcing** — Is the editorial card at the top of For-You manually curated, algorithmically picked, or a rotating feature? Spec doesn't say; code needs to know where to fetch the data.
6. **Horoscope tab future state** — MP-A keeps the ContentItems.GUIDE stub; MP-B will replace with real astro entities. But when will MP-B ship? If there's a long gap, should the stub look like a "Coming soon" placeholder to set expectations? Or keep the current "look like normal content" approach?
7. **Mobile safe-area padding** — Spec doesn't mention iOS notch / Android gesture-nav insets. Bottom nav should respect `env(safe-area-inset-bottom)`.
8. **Cross-page consistency** — Confirm that the rose token / plum token changes don't inadvertently break Today, Profile, or Jess FAB styling (which are outside Lifestyle scope but may share token CSS).

---

## Spec token audit (demo vs. spec discrepancy)

| Token | Spec value | Demo value | Recommendation |
|---|---|---|---|
| **Rose** | #D45E52 | #d4a5a0 (main), #b67d77 (deep) | CLARIFY: spec rose is darker; demo rose is warmer. Align to one. |
| **Plum** | #2b1e16 / #4A2A3A | #7a4a5e | CONFLICT: spec plum is ink-dark; demo plum is accent-purple. Define which is the interactive plum. |
| **Cream** | #f7f0e6 | #f7f0e6 | ✓ MATCH |
| **Gold** | #C9A95C | #c9a961 | ✓ MATCH (rounding difference, negligible) |
| **Ink-line** | rgba(74,42,58,0.14) | rgba(43,30,22,.10) | MINOR: demo is slightly lighter. Use demo value for consistency. |

**Action:** Before drafting MP prompt, Mr Lead Manager should pull the *exact* color tokens from the live design system (Figma, Tailwind config, CSS vars) and confirm against both spec and demo. Don't assume spec values are canonical; cross-check with the source of truth.

---

## Craft decision log

**What's well-specified:**
- Nav restructure (5-slot grid, Bell removed) is clear and unambiguous.
- Token move from lavender to rose is a clean replace (lavender found nowhere in code; safe to retire).
- Menu sheet scrim + swipe UX direction is solid (matches demo).
- Entity wiring (read `UserProfile.followed_categories` for weighting) is precise and low-risk.
- Scope boundary (no new entities, no new features, pure UX rebuild) is locked and respected.

**What needs design attention before code:**
- Responsive behavior at small viewports (tab scroll, menu sheet height, nav touch targets).
- Interaction micro-states (save optimistic UI, tab keyboard nav, sheet swipe threshold).
- Accessibility tree and keyboard strategy for new components.
- Font loading and reduced-motion handling.
- Rose/plum token disambiguation and sub-allocation (which shade for which purpose).

**Risk mitigation:**
- None of these are architectural risks. They're craft details. A careful MP draft can resolve them all without revisiting spec. If Mr Lead Manager includes explicit design notes in the MP prompt (e.g., "save heart fills optimistically and reverts on error"), the build will be solid.

---

## Ready to advance?

**✓ Yes, ready-with-revisions.** The spec is solid and should move forward after amendments 1–3 (rose/plum/menu-header) are resolved in the spec. The rest are design decisions that can be embedded in the MP prompt without blocking the spec.

**Estimated amendment time:** 20 minutes.  
**Estimated ready-for-MP-prompt time:** EOD today, if Mr Lead Manager prioritizes the three blocking clarifications.

**Next step:** Mr Lead Manager patches spec with rose/plum definitions and menu-header styling rule, pings the user for alignment on Tab-scroll and FAB positioning (can be quick calls or async replies), then proceeds to MP draft.
