---
name: FemWell market is UK, not Nigeria — verify locale before designing
description: Correction after Claude drifted into Naija-local framing across multiple demos without evidence. Lock in UK context and sanity-check before adding any regional content.
type: feedback
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
FemWell is a **UK-based app**. Any Nigerian/Naija framing in older design work (Care Bridge's MDCN-verified Lagos endo cohort, Explore v2's Lagos/Abuja/Enugu Voices-from-home, NDPR compliance language, Naija-local demo with Yoruba/Igbo/Hausa voices, Owambe planner) is **drift from an earlier session that was never grounded in a user claim**. User corrected this on 2026-04-21: *"this is a UK based app were did you get the 9ja stuff from?"*

**Why:** The Naija framing seeped in via the 2026-04-20 10-feature roadmap brainstorm ("Naija-local layer" at slot #6) and compounded across 4-5 subsequent demos. The user never authored a Nigerian framing — Claude invented it, probably from an overgeneralised association with women's wellness in emerging markets, and then built on it without checking.

**How to apply:**
- Default market for FemWell work = UK. NHS care pathways. GMC / NMC / HCPC / BDA / BACP licence bodies for practitioners. UK GDPR + DPA 2018 for compliance, NOT NDPR.
- Prices in £. Distances/units metric but English conventions.
- English-first. Accent/voice work for Jess should lean British (RP + regional variants like Scouse/Glasgow/Northern/Welsh) if anything — confirm with user before shipping multilingual.
- **Before designing any culturally-specific content, ask.** Never assume a region from a product name or market intuition.
- When reviewing existing demos, flag any Nigerian references to the user for localisation decisions — don't silently rip them out without check-in.

**Affected demos to sweep (2026-04-21):**
1. `femwell_naija_local_demo.html` — full demo built on false premise. Ask user: delete, archive, or localise to UK regions?
2. `femwell_care_bridge_v2_demo.html` — Dr Chidi Okonkwo MDCN 45812, Lagos endo cohort ≤30. Needs UK clinician names + GMC numbers + hospital trust names.
3. `femwell_explore_v2_demo.html` — Dr Chidi Lagos talk, Voices-from-home Lagos/Abuja/Enugu shelves, "On the discipline of rest" by Ijeoma Osuji. Needs UK voices + locations.
4. `femwell_partner_sync_demo.html` — "Tayo" as partner name, "O ku ise" Yoruba reference. Partner name is neutral enough; Yoruba line needs replacing.
5. `femwell_jess_v2_demo.html` — "Naija Warm" voice variant in P4 appendix. Should be UK voice variants.
6. `femwell_2026_2028_ship_sequence.md` — explicit Q1/27 Naija-local layer entry + Q2/27 Naija voice ship. Needs rewrite.
7. `project_femwell_design_status.md` memory — heavy Nigerian references across Care Bridge, Partner Sync, Naija-local, and Explore entries. Needs full pass.
