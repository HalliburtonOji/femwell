---
name: No "brick on bread" — replace, don't pile
description: When base44 already has UI for X, replace or build with what's there. Never stack new components on top of old ones.
type: feedback
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
When shipping designs into the live FemWell app, never add new UI on top of existing UI for the same purpose. If something is already there, REPLACE it with the new design or extend the existing component — never duplicate or layer. Maintain uniformity with patterns already in the app.

**Why:** User explicitly called out "brick on bread" as a failure mode — duplicate cards, two versions of the same hub, redundant tabs, etc. The live app has shape; new designs must respect that shape and swap in cleanly, not pile alongside.

**How to apply:**
- Before drafting any base44 mega-prompt, audit the live page first (visual + DOM) to enumerate what already exists.
- Map every new design element to either (a) "replaces existing X" or (b) "wholly new section with no equivalent."
- Phrase MPs as "Replace the current Lifestyle page with…" not "Add a new Lifestyle page that…"
- Match existing visual tokens, spacing, typography, and component naming conventions where they already work — only override where the new design explicitly diverges.
- If two components do similar jobs after the build, that's a smell — collapse them.
