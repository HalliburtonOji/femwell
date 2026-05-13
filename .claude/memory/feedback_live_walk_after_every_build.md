---
name: Every FemWell build dispatch MUST end with a live walk on femwells.com
description: vite + eslint green is not "done". Done is a Chrome MCP screenshot of the page showing the change works visually. Applies to me AND to every agent I dispatch.
type: feedback
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
For any FemWell build (mine or an agent's), the exit gate is **a Chrome MCP screenshot of the live page on femwells.com after publish that proves the change works visually**. Not vite passing. Not eslint passing. Not the agent's self-report.

**Why:** I shipped H2a→H2d as 8 commits across 4 agent dispatches. Every agent reported "vite + eslint green, smoke tests pass." None of them opened the live page. The user took the first live screenshot and found the page was rendering cream-on-cream because SectionWrap was missing. I dispatched a fix that added SectionWrap. That agent also self-reported "vite + eslint green." The user took the second live screenshot and found AnnualProfections + Sky Diary are now dark-on-dark because the inner text colours weren't audited. Two rounds of user-reported regressions. The user said: "live walk whatever you build ffs, why do we have agents when they dont work, wasting my limits on fixes everytime." That frustration is correct and the fix is process, not motivation.

**How to apply (mandatory for every dispatch from now on):**
1. **Bake live-walk into every agent prompt.** Required steps in this order: read inputs → edit → commit → push → publish via Chrome MCP → **navigate Chrome MCP to femwells.com and screenshot every changed surface at MOBILE (~380px), TABLET (~768px), AND DESKTOP (~1280px) widths** via `resize_window` → only mark done if all three viewports show the change rendering correctly. base44 itself has all three preview modes; femwells.com is the production target across all three. See `feedback_femwell_multiplatform.md` for the width-constrain rule.
2. **Screenshots must be saved to disk** so I can read them: `mcp__Claude_in_Chrome__computer save_to_disk: true` and pass the path back in the report. Don't trust agent self-description of what they see — read the file myself.
3. **Don't accept "vite + eslint clean" as the success criterion.** State the visual acceptance test explicitly: e.g. "Profections card must show a cream Fraunces title 'A Venus year — the 3rd house is lit.' clearly readable on the Plum Night background; if the text is dark-on-dark, that's a failure even if the build is green."
4. **If the live walk fails, the agent fixes it before returning.** Don't return half-done with a "needs another pass" note.
5. **After the agent returns, I personally walk the page** via Chrome MCP myself and screenshot before saying "done" to the user. The agent is one verification layer; I am the second.
6. This applies even to "obvious" changes. The H2-fix1 SectionWrap looked obvious and shipped without a live walk; result was a second regression.

**Exception:** if the user is mid-conversation and asks me to ship and verify themselves, I can defer the walk. But that has to be explicit from the user, not assumed.
