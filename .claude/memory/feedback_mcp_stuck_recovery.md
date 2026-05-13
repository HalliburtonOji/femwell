---
name: When base44 builder MCP gets stuck, close tab and reopen — don't wait
description: After ~60s of unresponsive base44 builder dialog / publish stall / 83-char body, close the tab and reopen the URL. Don't wait 13 minutes.
type: feedback
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
When the base44 builder tab in MCP returns:
- bodyLen < 200 chars (page shell only, content not rendering)
- "Publishing" stuck for >60 seconds without progress
- screenshot timeouts (CDP "frozen or unresponsive")
- "publishing: true" with no `lastPublished` change

**Recovery (in order):**
1. `tabs_close_mcp` the base44 tab → `tabs_create_mcp` → navigate to `https://app.base44.com/apps/<APP_ID>/editor/preview`. Fresh tab beats stale state every time.
2. Wait 15-20s for the page to fully load (chat panel, sync indicator, toolbar).
3. Re-attempt the action (Publish click, prompt paste, etc.).
4. If second attempt also stalls, surface that to the user — don't loop a third time.

**Why:** I burned ~30 min waiting through two stuck publish dialogs because I kept polling instead of recovering. The user called it out: "if you get stuck you can close tab and open again, not wait 13 minutes." Recovery is cheap; waiting is expensive.

**Also: MCP calls it "Chrome MCP" but the user is on Microsoft Edge.** It's browser-agnostic. Don't say "Chrome" — say "browser" or "MCP browser tab" so the language matches reality.
