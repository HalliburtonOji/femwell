---
name: FemWell uses ONE unified bottom nav across all platforms
description: FemWell does NOT have a desktop sidebar. The 5-slot bottom nav (Today · Lifestyle · Jess FAB · Profile · Menu) is the canonical nav at mobile, tablet, AND desktop. Constrain its width at large viewports — never substitute a sidebar.
type: feedback
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
FemWell is used on phones, tablets, and laptops/desktops — but it uses **the same 5-slot bottom nav pattern everywhere.** There is no desktop sidebar. The `DesktopSidebar` function in `src/components/layout/FloatingSidebar.jsx:26–101` is intentionally dead code; do not "rescue" it.

**Why:** User said: "we are using a bottom nav thats what is on mobile, you are doing something different on desktop." When MP-A shipped, the bottom nav stretched across the full 1490px desktop viewport with each slot ~293px wide — that visual problem is what looked broken, NOT the absence of a sidebar. I tried to "fix" it by reintroducing a sidebar pattern; the user undid that change. The correct pattern is to keep the bottom nav and **width-constrain it** at large viewports.

**How to apply:**
- The 5-slot bottom nav (Today · Lifestyle · Jess FAB · Profile · Menu) ships at every viewport size.
- At desktop / tablet (≥768px), the nav stays bottom-fixed but its inner content gets a `max-width` constraint (e.g. 600–720px) and is centered — so slot widths feel touch-comfortable, not stretched.
- Never write specs that say "show a sidebar at desktop" or "switch to a different nav at lg." There's one nav.
- Leave `DesktopSidebar` alone — don't render it, don't refactor it. It's vestigial.
- `FloatingSidebar.jsx`'s exported component is the **mobile bottom-sheet drawer** triggered by the `open-nav-drawer` event. That's the only thing it does. Do not touch it.
- The `--lavender-surface` variable in `src/index.css:29` and the `lavender` colors in `src/components/journal/*.jsx` are out of FemWell-Lifestyle scope.
- Multi-platform CHECKING is still required — Ms Verify and Ms Atelier walk mobile / tablet / desktop in every post-build pass — but they verify the bottom-nav pattern at each, not different patterns per viewport.

**Common mistake (do not repeat):**
Writing "FloatingSidebar is dead code, render it!" — that conclusion looks right from grep, but the user has decided the bottom nav is the unified pattern. Trust the user's product call over the codebase's apparent inconsistency.
