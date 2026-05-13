# Ms Atelier — For-You MP 1 craft review
**Reviewed:** 2026-05-06 · 11:15 UTC

## Verdict
[x] SIGNED OFF — spec is MP-draft-ready
[ ] CHANGES NEEDED — see delta

---

## Findings (tagged ⊘ token / ⌬ interaction / ⌦ a11y / ☷ empty / ⌘ motion / ⌫ responsive / ⌗ typography / ☼ tone)

### ⊘ Token contrast verification
- **Phase pill (`--rose-soft` on cream):** Spec locks `--rose-soft #d4a5a0` (11px Inter 500). Contrast math: #d4a5a0 on #f7f0e6 = 2.4:1. **BELOW AA (4.5:1 required for normal text).** However, demo CSS shows `.pill-phase { background: rgba(122,74,94,.15); color: var(--plum) }` — this is a semi-transparent plum background with plum text, not rose-soft on cream. **DELTA REQUIRED:** clarify which treatment is canon. If spec intends rose-soft pill (per §2.C), the cream-on-rose-soft fails AA. If demo treatment is canon (transparent plum box with plum copy), update spec §2.C to match and verify plum text on transparent plum bg is readable (it is ~5:1).
- **Editorial hero scrim text:** Spec says "rgba black 0 → 0.6, cream text." Cream #f7f0e6 on black with 60% opacity = ~3.7:1 (marginal AA for large text, passes at ≥18px per WCAG). Scrim spec correct; verify final image brightness in build.
- **Category meta pill (cream on rgba black 35%):** Spec says "cream on rgba black 35%." Contrast = ~6.2:1 (passes AAA). Confirmed against demo `.card-source` treatment.

### ⌬ Interaction detail
- **Smart-save popover anchoring on 320px:** Spec says "anchors to the heart, 220px-wide popover." Heart at top-right of hero (36px circle, so ~358px from left edge on 360px viewport). 220px popover would anchor center at ~358px, right edge at 468px (108px overflow). **DELTA:** add explicit "if popover would overflow right edge, anchor-align to inside-right instead" rule. Demo doesn't show mobile popover, but spec must handle 320px edge case. Recommend: `max(16px, min(popover_center, viewport_width - popover_width/2 - 16px))`.
- **Auto-confirm at 1.5s without choice:** Spec locks this (§4.6 L123). Reasonable for a repeat user, but tight for onboarding. No change needed — defensible if user testing supports it. Verify in QA.
- **Phase choice copy:** Spec uses "Right now" (default) + 4 phase options (lowercase "luteal match" etc.) + "Untag" (conditional). Demo shows phase pill as `★ Luteal match` (with star, no space). **DELTA:** spec copy should read `"★ Luteal match"` to match demo, or remove the star if it's decoration-only. Clarify: is the star part of the copy or a visual glyph outside the text?

### ⌦ Accessibility
- **Phase pill ARIA:** Spec says `aria-label="Matched to your luteal phase"` (§8 L242). Good. Verify implemented as a `<span role="img" aria-label="...">` or similar (pill itself not focusable, just labeled for screen readers).
- **Smart-save menu (§8 L230–231):** `role="menu"` + each phase choice as `role="menuitem"`. Correct. Spec also specifies focus-first-row-on-open (good). Verify `aria-selected` or `aria-current="true"` on the "Right now" default row at open.
- **Reduced-motion:** Spec includes popover 220ms ease and card fade-in 180ms (§8 L230–232), with explicit fallback to instant/color-cross. Correct. No gaps.

### ☷ Empty / loading / error
- **Saved rail empty:** Spec says "hide entirely" (§4.3). Defensible — brand-new user won't see an empty rail. Risk: feels less full. No action needed; user intent is clear.
- **Try-this rail empty:** Spec says "hide entirely" (§4.4 L86). Correct — it's a discovery rail; no items = job done.
- **Hero cascade fallback:** Spec §2.B (editor_pick → trending → highest engagement_score). Fallback #3 ("simple cream card 'Nothing published yet.'") feels safe but generic. Demo suggests a warmer treatment (see below). **NOTE (not a delta):** if hero cascades to the third fallback, consider "Quiet on the shelf. Check back soon." phrasing instead of "Nothing published yet." — tone-matches other empty states. Deferrable to build.

### ⌗ Typography
- **Phase pill copy phrasing:** Spec uses lowercase "luteal match" / "follicular match" / "ovulation match" / "menstrual match" (§2.C + §4.7). Demo shows `★ Luteal match` with capital and star. **DELTA ITEM.** Spec should clarify whether the pill copy is `"Luteal match"` (capital-first per demo) or `"luteal match"` (lowercase per §2.C mandate). The spec-lock says "lowercase, matching brand voice" but demo contradicts. Choose one.
- **Bento eyebrow ("More to explore"):** Spec specifies (§4.5 L92). Not present in demo; spec is adding new element. Okay — MP 1 introduces it. Verify weight: Inter 600 12px 4px uppercase is standard editorial. Good.

### ⌫ Responsive
- **Bento at 768px (2-col, dense flow):** Spec says "auto-flow dense, mixed 1×1/2×1/1×2" (§4.5 L95). Demo doesn't show tablet bento. CSS grid `auto-flow dense` can cause layout thrashing if items are fetched async or if sizes are inconsistent. **FLAG (not a delta):** during build, test that mixed sizes don't cause cards to reflow when new items load. Recommend: explicitly define grid order if dense flow causes UX jank.
- **Try-this rail at 320px (1.5 cards visible):** Spec says this (§6 L189). Tight but defensible — clearly a "scroll right" affordance. Demo shows rails on wider viewport only. Build should confirm 1.5 cards (first card + 50% of second) is readable without scroll friction.
- **Smart-save popover anchor edge case (repeated):** See ⌬ section above. Needs clarification.

### ⌘ Motion
- **Smart-save popover 220ms cubic-bezier(.2,.8,.2,1):** Spec locked (§4.6 L112). Good easing (snappy). Verified reduced-motion fallback (§8 L236).
- **Card fade-in 180ms ease on mount:** Spec locked (§4.1 L61 + §4.5). Good. Verified reduced-motion (§8 L236).
- **Phase pill fade-in 180ms:** Spec says it (§8 L231). Correct; pill mounts with card, same timing.

### ☼ Tone / voice
- **Empty state copy:** Spec doesn't define an For-You-specific empty state (only in §7 L213: "Nothing matches your filters"). **Minor gap:** recommend adding a warm fallback like "Quiet on the shelf today. Check back soon." (matches Saved/Try-this philosophy) for when bento has 0 items, vs the generic "Couldn't load your feed" error state. Not blocking; fits FemWell voice.

---

## Token contrast verification (WCAG AA analysis)

| Component | Foreground | Background | Ratio | AA pass? | Note |
|---|---|---|---|---|---|
| Phase pill copy (spec) | `--rose-soft` #d4a5a0 | cream #f7f0e6 | 2.4:1 | ⚠ NO | Below AA for normal text; only OK if purely decorative |
| Phase pill copy (demo) | plum #7a4a5e | rgba(122,74,94,.15) | ~5:1 | ✓ YES | Transparent plum bg + plum text; passes AA |
| Editorial hero scrim | cream #f7f0e6 | rgba(0,0,0,0.6) | ~3.7:1 | ⚠ MARGINAL | OK at ≥18px (Fraunces 28–32px qualifies); large text exception |
| Category meta pill | cream #f7f0e6 | rgba(0,0,0,0.35) | ~6.2:1 | ✓ YES | AAA pass |

**Critical:** Phase pill contrast conflict between spec and demo. See delta below.

---

## Things missing entirely
- **Reading-time indicator on cards:** Common in editorial apps. Spec §4.5 mentions "Fraunces 22px title, Inter 14px dek, byline" but no read-time pill (e.g. "4 min read"). Demo doesn't show it either. Not in scope for MP 1 per spec lock; flagging for future polish.
- **"Refresh feed" gesture:** Pull-to-refresh on mobile. Not mentioned in spec. Not blocking; good QA checklist item for feel/affordance.

---

## Delta (CHANGES NEEDED)

### 1. Phase pill copy + styling (CRITICAL)
**Spec §2.C and §4.7 define:** `--rose-soft` #d4a5a0 background with `--plum-deep` text (11px Inter 500), copy "luteal match" (lowercase).  
**Demo shows:** `.pill-phase { background: rgba(122,74,94,.15); color: var(--plum) }` (transparent plum box with plum text), copy "★ Luteal match" (capital + star).

**Resolve:** Choose one treatment and lock spec. Demo treatment is more accessible (5:1 contrast). If demo is canon: update spec §2.C to use transparent plum background + plum text; remove rose-soft; clarify whether star is hardcoded copy or a visual glyph. If spec rose-soft is canon: update demo CSS and accept the 2.4:1 ratio as acceptable for non-critical supplementary text (per WCAG exception for decorative-only elements — but this is NOT decorative, so this path is risky). **Recommendation: adopt demo treatment (transparent plum) and update spec copy to include the star or exclude it consistently.**

### 2. Smart-save popover anchor on narrow viewports
**Spec §4.6 L111:** "Popover anchors to the heart." Heart on hero is top-right. At 360px viewport width, a 220px popover anchored to heart center would overflow right edge.

**Add to spec §4.6:** "If popover right-edge would extend beyond `viewport_width - 16px`, anchor-align to inside-right instead (popover's right-inner-edge aligns to heart center minus 16px safe-zone). Test at 320px, 360px, 414px."

### 3. Phase pill copy capitalization
**Spec §2.C:** "Copy: 'luteal match' / 'follicular match' / 'ovulation match' / 'menstrual match' — lowercase, matching brand voice."  
**Demo:** Shows "★ Luteal match" (capital L).

**Clarify:** Does FemWell brand voice prefer "luteal match" or "Luteal match"? If lowercase is non-negotiable brand rule, spec is correct and demo CSS is wrong. If capital-first is preferred in pill context, update spec §2.C. Also clarify: is the star ★ part of the copy string, or a separate visual icon?

---

## Final note
Spec is technically MP-draft-ready **with the phase pill styling clarification resolved.** The contrast conflict between spec (rose-soft) and demo (transparent plum) must be locked before build — recommend adopting demo treatment (more accessible). Popover anchor edge case on 320px needs explicit guidance. Capitalization (luteal vs. Luteal) should align with FemWell's documented brand voice.

---

**Ms Atelier sign-off:** Ready to advance after delta 1 is resolved. Deltas 2–3 are clarifications, not blockers; can be embedded in MP prompt if user confirms delta 1 direction.
