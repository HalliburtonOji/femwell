---
name: Visually audit live pages before designing
description: Before (re)designing any FemWell page, pull the live DOM/visual structure and enumerate every section — don't guess or work from memory
type: feedback
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
Before designing or rebuilding any FemWell page, always visually audit the live app (femwells.com) first and enumerate every section that currently exists. Don't guess from memory, don't work from partial mental models, and don't skip sections just because they're not obvious (e.g. audio content, specific shelves, eyebrow labels).

**Why:** Halliburton has corrected me twice on the same demo for missing content he could see on live — first "what happened to the videos, visually look at these pages please" (Explore was missing real videos), then "audio content still not there, i dont think youre visually looking at what i currently have, youre missing stuff" (audio section also missing). The root cause was me designing from entity schemas + assumptions instead of auditing the live DOM.

**How to apply:**
- For any FemWell page rebuild, first open femwells.com/{Page} in Chrome MCP.
- If `read_page`/`get_page_text` times out, fall back to `javascript_tool` with DOM extraction (e.g., `document.body.innerText.split('\n')`, `Array.from(document.querySelectorAll('img')).map(i=>i.src)`, section headings, etc.).
- Enumerate every visible shelf/section top-to-bottom and match each one explicitly in the demo — including eyebrows, pill rows, and minor shelves.
- Only then design. Guessing section structure from schemas is a repeat-correction trap.
