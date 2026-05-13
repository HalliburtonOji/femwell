---
name: Build-verify-publish loop for FemWell
description: User's preferred workflow when making changes to the FemWell base44 app
type: feedback
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
For every change to the FemWell app: code directly when possible (or send a mega-prompt to the base44 builder), then **always** inspect the result in detail after each build, then publish to live and verify on the live URL too.

**Why:** User stated explicitly: "try to code directly if you can or do mega prompts but always check in detail after every build, if its fine publish to live site and check that too." They expect verification at both the preview and live layers, not just a builder-complete message.

**How to apply:**
- After a build/edit completes, query entities or read the page in the preview to confirm the change actually landed (schema + UI + data).
- Publish via the builder UI, then navigate to `femwells.com` (not just the base44 preview) and click through the feature end-to-end.
- Use `mcp__Claude_in_Chrome__find` / `computer` / `read_page` against `femwells.com` tabs for live verification — the base44 editor preview runs in a cross-origin iframe that blocks `javascript_tool`.
- Sequence multi-feature work: do one build at a time, verify, then move to the next.
