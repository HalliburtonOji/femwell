---
name: Can auto-publish base44 via Chrome
description: I can publish FemWell to production myself by clicking Publish in the base44 builder via Chrome MCP. No need to wait for user.
type: feedback
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
I can publish FemWell's base44 app autonomously via Chrome MCP.

**Why:** The base44 builder at `https://app.base44.com/apps/<appId>` is logged in for the user. After pushing a commit to GitHub, base44 auto-syncs the code (visible as "Synced ..." entries in the left sidebar). To deploy that sync to production I just have to click the Publish button.

**How to apply:**
1. After `git push origin main`, navigate Chrome tab to `https://app.base44.com/apps/69a9891a6ccccc1822bbb4bc` (FemWell app id from `project_femwell_app.md`).
2. Click "Preview" tab (top-center).
3. `find` "publish button" → click it. A dialog "Publish Your App" opens.

**ALWAYS RELOAD when things stall.** User rule (2026-05-12): "Always reload the app builder website if something is taking long or hasn't synced, same for live app. Usually fixes." Concrete protocol:
- If `find` on the builder times out → `location.reload()` the builder tab → wait 10s → retry.
- If a publish click shows up but verify shows old code → the sync didn't catch up. `location.reload()` the builder tab, wait for "Synced …" entries for the latest commit to appear, then click Publish again.
- If the live site shows old DOM after a successful publish → `location.reload()` the live tab. CDN caching at the edge sometimes lags.
- Never wait > 30s on a stale page — reload first, then act.
4. Click the "Publish App" button inside the dialog (Web tab).
5. Wait ~5s. Success modal: "Your app is published and live online!"

Confirmed working 2026-05-12 with commit `d41549f` (Reader v2 + Horo-B/C + backfillImages). User asked "cant you also access my base44 builder page on chrome and just click publish" — yes I can, and should from now on rather than waiting for them.

**Safety:**
- Only Publish on commits I've already pushed. Don't publish other apps in their workspace.
- Confirm Synced commit list shows the changes I intended before clicking Publish.
- If a publish fails or shows a "review changes" step, screenshot and ask the user.
