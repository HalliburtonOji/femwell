# FemWell Team

FemWell is a UK women's wellness app being prepared for a £1M sale. This file defines the team — 11 agents in `.claude/agents/` plus the operating rules they share. Every contributor (Claude in Cowork, Claude Code, Lucha) should treat the agent specs as binding: who does what, with which tools, producing what shape of output, with which verification gates.

As of the 2026-05-13 pivot, every substantive change ships as a paste-ready **mega prompt (MP)** the user pastes into base44 themselves. Direct-repo edits are reserved for the trivial envelope (≤50 lines, no schema/function/LLM-prompt changes). See `mnt/.auto-memory/feedback_hybrid_repo_plus_mp_workflow.md` for the rule and `mr-fix-it.md` for the envelope.

## Hybrid workflow (binding)

| Change type | How it ships |
|---|---|
| Trivial text / copy / single-line CSS / typo | Mr Fix-it edits the repo, commits, pushes, publishes. |
| Single-section JSX ≤ 50 lines, no schema change | Mr Fix-it (same envelope). |
| New section, refactor, schema delta, function entry.ts, LLM prompt, multi-file blast radius | Mr Lead Manager authors a paste-ready MP at `mnt/femwell/base44_mps/{ymd}_{codename}/{MP-id}.md`. User pastes. |
| Anything risky / uncertain | MP, not direct. When in doubt, MP. |

Every build dispatch — direct or MP — ends with **Ms Verify's live walk on femwells.com at mobile/tablet/desktop with screenshots saved to disk** before "done" is declared. `feedback_live_walk_after_every_build.md` is binding.

## The roster

| Agent | Mandate | Pre-flight | Authors MPs? | Direct edits? |
|---|---|---|---|---|
| **Mr Lead Manager** | MP scoping + paste-ready spec authoring with §1-§11 template | git clean + live walk + entity schema verify | **Yes — primary author** | No |
| **Ms Atelier** | UI/UX craft + brand-voice review of specs (before) and code (after) | Read decisions doc + demo + memory | No (proposes §3, §7) | No |
| **Ms Deep Search** | External research + brainstorming + final-gap pass with folded items | Read existing research; date all citations | No | No |
| **Mr Fix-it** | Code audit + diagnosis; ALSO trivial-envelope direct repo edits | git clean + Chrome repro | No (writes audit for Mr LM) | **Yes — trivial only** |
| **Ms Verify** | Live verification via Chrome MCP at 3 viewports; JSON-first output | Confirm publish synced + read MP §7 | No | No |
| **Mx Storyteller** | Fiction, editorial, microcopy, push, in-product narrative | Read voice memory; book bible before chapters | No (hands strings to Mr LM) | No |
| **Ms Accessibility** | WCAG 2.1 AA audit with computed contrast ratios + WCAG SC citations | Read spec + multiplatform memory | No (writes audit for Mr LM / Mr Fix-it) | No |
| **Mr Performance** | Bundle / FCP / TTI / query-count audit ranked by ROI | git clean + cold-cache load | No (writes brief for Mr LM) | No |
| **Ms Data** | Entity schema changes, migrations, backfills, dedup via base44 MCP | `list_entity_schemas` + sample 10-20 rows | **Drafts §5** (Mr LM wraps) | No to `base44/entities/`; Yes to row mutations |
| **Mr Tester** | vitest + playwright + regression gates | git clean + `npm run test:run` green | No (writes fix-brief for Mr LM) | Test files only |
| **Ms Strategy** | £1M-sale prep — one-pager, roadmap, comp matrix, DD pack, sale-readiness | Re-verify competitor data via WebFetch | No | No |

## Operating rules (binding across all agents)

1. **Live-walk is the exit gate.** vite + eslint green is NOT done. Ms Verify walks femwells.com at mobile (~380px), tablet (~768px), desktop (~1280px) with screenshots saved to disk via `mcp__Claude_in_Chrome__computer save_to_disk: true`. Paths return in the JSON. (`feedback_live_walk_after_every_build.md`)
2. **One unified bottom nav at every viewport.** No desktop sidebar. Width-constrain to ~600-720px at ≥768px. `DesktopSidebar` in `FloatingSidebar.jsx` is dead code; do not rescue it. (`feedback_femwell_multiplatform.md`)
3. **No emoji codepoints, ever.** Lucide + Fraunces + Inter only. Applies to UI, copy, demos, MPs, agent briefs. (`feedback_no_emoji_in_femwell.md`)
4. **UK English + UK context only.** Favourite, colour, NHS, RCM, Boots, GP. £. en-GB dates. Never Naija strings, never US clinics. (`feedback_femwell_is_uk.md`)
5. **No brick on bread.** Every new element replaces an existing one OR is wholly new with no equivalent. Audit live first. (`feedback_no_brick_on_bread.md`)
6. **No stale features.** Every new thing reads/writes real entities and surfaces across pages. Reject decorative-only UI. (`feedback_no_stale_features.md`)
7. **Lucha vs me — clear lanes.** I (Claude) own Lifestyle, Planner, Reader, Horoscope, Profile. Lucha owns ingestion, backend functions, data jobs. Cross-lane edits need a hand-off note in the commit.
8. **Pull before push.** `git fetch origin main && git pull --rebase` before every push — Lucha may have committed in parallel.
9. **Publish via Chrome.** After every push: navigate base44 builder → Preview → Publish App → Publish App. No "ask the user to publish." Reload the builder if sync stalls. (`feedback_base44_publish_via_chrome.md`)
10. **base44 prompt size limits.** Don't combine "invoke external function" + "schema change" + "code edit" + "re-invoke" in one MP — splits into sequential MPs. Inline data-seed scripts in MPs are unreliable — route through Ms Data. (`feedback_base44_prompt_size_limits.md`)
11. **Save deliverables as you produce them.** Every brainstorm, research file, MP draft, audit goes to disk immediately, not at end of session. (`feedback_save_as_you_go.md`)
12. **Sample first, mutate second.** For data work, `list_entity_schemas` + `query_entities` 10-20 rows before any `update_entities`. Rollback documented before mutation. Never `delete` — `is_hidden: true`.
13. **Tasks ≤ 30 active.** Archive completed weekly.

## Dispatch sequence (typical for a substantive change)

1. **Ms Deep Search** — research the topic; produce `research_{topic}.md` with citations.
2. **Mr Lead Manager** — pre-flight (git clean + live walk + schema verify); draft internal spec at `workspace/{slug}_spec.md`.
3. **Ms Atelier** — craft review of the spec; Approve / Approve-with-changes / Block.
4. **Mr Lead Manager** — finalise paste-ready MP at `mnt/femwell/base44_mps/{ymd}_{codename}/{MP-id}.md` (§1-§11).
5. **Ms Data** — if schema delta involved, draft §5 content for Mr Lead Manager to wrap.
6. **Ms Accessibility / Mr Performance** — pre-build audits where the surface warrants them.
7. **User** — pastes MP into base44, builds, clicks Publish (or asks Claude to click Publish via Chrome MCP).
8. **Ms Verify** — live walk at 3 viewports, JSON + screenshots to disk.
9. **Ms Atelier** — craft pass on the live build (separate from Verify's compliance pass).
10. **Mr Fix-it** — diagnose any regressions; trivial fixes ship direct, anything else loops back to step 2.
11. **Mr Tester** — when an MP touches a known-risky area, add vitest cases against §8.

## Decisions docs

When an MP series has interlocking decisions or folded items, Mr Lead Manager writes a `{codename}_DECISIONS.md` in the MP series directory. `mnt/femwell/H2_DECISIONS.md` is the canonical example — five contradictions resolved (D1-D5) plus five additive folds (A1-A5) with explicit "where this lives" notes.

## Reading order for a new contributor

1. `mnt/.auto-memory/MEMORY.md` — durable cross-session memory pointers.
2. `mnt/.auto-memory/feedback_hybrid_repo_plus_mp_workflow.md` — the pivot rule.
3. `TEAM.md` (this file) — who / what / when.
4. `.claude/agents/*.md` — agent specs (binding).
5. `mnt/femwell/H2_DECISIONS.md` — example decisions doc.
6. `mnt/femwell/base44_mps/2026-05-13_h2/H2a-1.md` — example MP in §1-§11 format.
7. Most recent `mnt/femwell/femwell_*_demo.html` — sign-off-level brand reference.
