---
name: Careful planning workflow for FemWell base44 MPs
description: Mandatory pre-prompt sequence — live walk + entity walk + lead manager + UI/UX review + user alignment, BEFORE any MP gets drafted.
type: feedback
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
User is obsessed with perfection and tired of half-shipped MPs. From now on, every FemWell base44 MP follows this slow-down sequence. No exceptions, no "this one's small enough to skip." Skipping any step caused the rocky session on 2026-05-05.

**Why:** User said: "be careful with prompts, read things properly, use memory, use your agents, we map out the plan in conjunction with our agents (don't forget our UI/UX team), live walk app and all, dont rush, i am someone obsessed with perfection, lets build it well." Multiple MPs landed broken because we drafted from spec/memory without confirming live state, schema, or craft. The rules of engagement existed; they got skipped.

**How to apply — the 10-step loop, in order:**

1. **Claude live-walks the affected page(s) myself** via Chrome MCP — desktop AND mobile breakpoints. Screenshots saved to /mnt/femwell/walk_<page>_<date>/. Note exact bottom-nav slot count, every interactive element, every empty/loading state, every responsive variant.

2. **base44 MCP entity walk.** Pull `list_entity_schemas` for every entity the spec might touch. Save verified schema to /mnt/femwell/base44_schema_<domain>.md. Never invent field names.

3. **Mr Lead Manager** scopes the spec using ONLY data from steps 1 & 2 + signed-off demo HTML. Saves spec to /mnt/femwell/<page>_mp<n>_spec.md.

4. **Ms Atelier (UI/UX team)** reviews the spec for craft — token uniformity, interaction quality, empty/loading/error states, accessibility, responsive behavior. Files /mnt/femwell/atelier_<page>_mp<n>_review.md. Spec gets revised based on her findings.

5. **Ms Deep Search** if the work involves a feature with precedent worth checking — surface what's been tried, what failed, what to avoid. Optional but cheap.

6. **Plan presented to user** in a tight summary. User confirms scope before any MP draft is written.

7. **Claude drafts the MP** — explicit, no inventions, REPLACE-mode framing, every clause traceable to spec. Saved to /mnt/femwell/<page>_mp<n>_base44_prompt.md.

8. **User pastes into base44** when they're ready, lets base44 build, clicks Publish.

9. **Ms Verify** does a compliance walk on the live build — does it match the spec? Files /mnt/femwell/<page>_mp<n>_punchlist.md with screenshots actually saved to disk in /mnt/femwell/verify_screenshots/.

10. **Ms Atelier** does a craft walk on the live build — separate from Ms Verify's compliance check. Files /mnt/femwell/atelier_<page>_mp<n>_live.md.

**Triggers for an MP1.5 patch:** Issues caught at step 9 OR 10. Patch goes back through steps 1-8 abbreviated.

**What to never do again:**
- Draft an MP without doing the live walk first.
- Use field names from the demo without verifying via base44 MCP.
- Skip Ms Atelier and ship a spec straight to MP draft.
- Tell the user "should be fine" without a verified screenshot.
- Save screenshot IDs without writing the files to disk.
