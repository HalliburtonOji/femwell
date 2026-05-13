---
name: Build FemWell changes directly in repo, never via base44 builder prompts
description: Direct-repo edits + git push are the workflow. base44 builder prompts cost credits and are slower.
type: feedback
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
**Updated 2026-05-13 to align with `feedback_hybrid_repo_plus_mp_workflow.md`.** Original rule below is preserved for context; the hybrid rule supersedes it for substantive work.

**Original framing (still correct for the cost-avoidance principle):** Don't paste MP prompts into the base44 builder myself. Builder prompts cost credits; my paste-and-pray loop burns them.

**New hybrid framing (2026-05-13):** For FemWell work, the writer-vs-paster split now matters:
- **I write directly to the repo** for trivial changes only (≤2 files, ≤50 lines, no schema, no function entry.ts, no LLM prompt) — then `git push origin main` and Chrome MCP **Publish only**.
- **For everything substantive**, I author a paste-ready mega prompt in `mnt/femwell/base44_mps/<date>_<codename>/` and **the user pastes it into base44 themselves**. I do not paste. They control credit spend, they verify in preview before publishing.

Chrome MCP is still used only for: (a) **Publish** after `git push`, (b) **Verify** on femwells.com after the user has pasted or after my own direct edit landed.

**Why:** base44 builder prompts cost credits (real £). Direct-repo edits are free, faster, and let me grep + verify before commit. The pattern was established with Reader v4a/b/c/d and "MP-Eng-1" — every recent commit since then has been direct-repo. I drifted back to builder-paste habit on H2a-1 and burned credits on a 25-minute build for a split I could have done in ten Edits.

**How to apply:**
- New feature / fix → read files in repo, write edits, commit, push.
- Stage MP files in `mnt/femwell/base44_mps/` only as the spec / changelog source — NOT as something to paste.
- Use the Chrome MCP for two things only: (a) **Publish** after `git push`, (b) **Verify** on femwells.com.
- If a change genuinely needs base44's runtime (new entity schema, new function with secrets, integration that's only in builder UI), call it out and ask first. Most things do not.
- Reserve agent dispatches (Mr Fix-it etc) for refactors that need to read a large file — give them the MP staged file as the spec, but ask them to deliver via repo edits and commits, not paste-prompts.
