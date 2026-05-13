---
name: Chrome MCP javascript_tool binds to active frame — use computer.left_click for toolbar elements
description: When automating base44's preview-pane toolbar (device toggle, fullscreen, refresh), javascript_tool runs in the inner preview iframe, not the base44 chrome. Click via screen coordinates instead.
type: feedback
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
The Ms Deep Search base44 research pass surfaced this: `mcp__Claude_in_Chrome__javascript_tool` executes against the currently active frame, which for `app.base44.com/.../editor/preview` is usually the **inner preview iframe** that hosts the user's app — not the parent base44 chrome where the device toggle, Publish button, refresh, and path dropdown live.

**How this manifested during H2:** I tried `document.querySelector('button[aria-label="mobile/tablet/desktop"]')` to flip the viewport toggle programmatically and got `[]` because the script ran inside the FemWell preview, where no such button exists. The toggle is in the base44 chrome surrounding the iframe.

**How to apply:**
- For **base44 chrome elements** (Publish, device toggle, refresh, path dropdown, version history, Edit/Discuss switcher, sidebar chat input, sidebar Send button) → use `mcp__Claude_in_Chrome__computer` with screen coordinates from a screenshot. Take a screenshot, eyeball the coordinates, `left_click`. The `find` tool sometimes works for chrome elements too — try `find` first, fall back to coordinate-click.
- For **the rendered FemWell app inside the preview iframe** (any DOM under femwells.com or the preview render) → `javascript_tool` works fine. `getComputedStyle`, `querySelector`, `getBoundingClientRect` all return preview-app data.
- If unsure, do `javascript_tool` with `(() => ({ url: location.href, host: location.host }))()` first to confirm which frame you're in.

**Known coordinates for base44 chrome (1512×803 viewport, approximate — re-screenshot if window resizes):**
- Publish button: top-right toolbar, around (1471, 31)
- Device toggle dropdown chevron: right side of preview-pane toolbar, around (920, 88) area — between the path field "/" and the fullscreen brackets icon
- Path field: middle of preview-pane toolbar, around (945, 88)
- Refresh icon: left of path field, around (780, 88)
- Sidebar Send button (when input has content): bottom-right of left chat panel, around (325, 728)
- Sidebar input: bottom of left chat panel, around (200, 680)

Re-verify these with a fresh screenshot every session — base44's UI shifts.
