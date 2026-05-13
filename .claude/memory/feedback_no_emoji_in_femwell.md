---
name: No emoji in FemWell — ever
description: FemWell never uses emoji in UI, copy, demos, prompts, or sub-agent briefs. Use Lucide icons / SVG glyphs / Fraunces typography instead.
type: feedback
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
FemWell does not use emoji anywhere. Not in UI labels, not in headings, not in microcopy, not in card content, not in nav, not in demo HTML, not in base44 prompts, not in agent briefs, not in deliverables. Never.

**Why:** User stated the rule explicitly while approving the demo visual language: "we are going with the demo designs but very important rule (no emoji ever)." The brand language is Fraunces serif + Inter sans + restrained Lucide-style icons + symbolic glyphs (e.g. ✦, ·, ⌖, ◇) drawn as SVG/text. Emoji break the typography, look generic, and are not on-brand.

**How to apply:**
- Strip emoji from all FemWell base44 prompts before pasting (search for emoji codepoints, replace with text or SVG glyph references).
- Strip emoji from agent briefs that mention FemWell context.
- Demos, copy decks, MP specs, punch-lists: zero emoji.
- Where the demo uses a visual flourish (e.g. a sparkle, a moon, a heart), the build must use a Lucide icon or inline SVG, NOT an emoji codepoint.
- This rule overrides any other formatting habit. If a memory or template is auto-suggesting emoji, fix it.
- Symbolic typography characters that aren't emoji (•, ·, ✦, ⌖, →, ↗, ◇, ☷) are FINE — they're typeset glyphs, not emoji.
