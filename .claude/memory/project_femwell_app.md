---
name: FemWell app on base44
description: User's primary project — a women's wellness app built on base44, with app id and live URLs
type: project
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
FemWell is a **UK-based** women's wellness app the user builds and iterates on through the base44 platform.

**Why:** This is the product the user keeps asking Claude to modify — understanding this is the default working context for most of their requests. Market = UK, so NHS/GMC context applies, UK GDPR + DPA 2018 for compliance, English-first, £ for pricing. **Do NOT assume Nigerian market** — an earlier session drifted into Naija-local framing (practitioners directory with MDCN licences, Yoruba/Igbo/Hausa voices, Lagos/Abuja/Enugu references, NDPR) that the user corrected on 2026-04-21. Any remaining Nigerian references in older demos are drift, not signal.

**How to apply:**
- App id on base44: `69a9891a6ccccc1822bbb4bc`
- Live URLs: `femwells.com` (custom domain) and `fem-well.base44.app`
- Market: UK. Practitioners should use GMC / NMC / HCPC / BDA licence bodies, NOT MDCN/MRTB-NG. Compliance = UK GDPR + DPA 2018, NOT NDPR.
- Editor/preview URL pattern: `https://app.base44.com/apps/69a9891a6ccccc1822bbb4bc/editor/preview`
- Data model is entity-based (~97 entities). Key entities used by recent work: `WeeklyBookPick` (books array with category, cover_url, isbn, phase_tags, etc.), `PanicSessions` (logs feeling/intensity + now `cards_completed`, `resolved_rating`, `duration_seconds`, `deck_type`), `PanicLog`, `ContentItems`, `FictionWork`.
- Key pages: `pages/Today` (QuickActionsRow holds Calm Cards + Panic tiles), `pages/Lifestyle` (BooksTab), `today/Panic Mode Modal`, `today/Calm Cards`.
