# FemWell Team

FemWell is a UK women's wellness app being prepared for a £1M sale. This file defines the team — agents in `.claude/agents/` and reusable workflows in `.claude/skills/`. Every contributor (Claude in Cowork, Claude Code, Lucha) should treat the agent specs as binding: who does what, with which tools, producing what output shape.

## Agents — the roster

| Agent | Mandate | When to call |
|---|---|---|
| **Mr Lead Manager** | MP scoping, spec writing, scope/cut decisions, diff-format change briefs | Before any meaningful code change. Owns the "what, why, and not-what" document. |
| **Ms Atelier** | UI/UX craft review, brand-voice enforcement, design critique against Fraunces + Inter + rose-primary system | Before AND after any visual change. Reviews specs for brand fit and code for craft. |
| **Ms Deep Search** | External research — GitHub repos, design articles, Twitter/HN, competitive patterns, open-source library audit | At the start of any new product area. Returns citation-heavy research doc. |
| **Mr Fix-it** | Pre-MP code audit, regression diagnosis, dead-code identification, root-cause analysis | When something is broken, when planning a refactor, or when extracting hero copy / patterns from existing code. |
| **Ms Verify** | Live verification via Chrome MCP. Walks the deployed page, asserts state, returns structured JSON | After every publish. Output is parseable, not prose. |
| **Mx Storyteller** | Long-form content writing, editorial copy, brand-voice in product copy, fiction generation | When the product needs human-written content (book chapters, editorial letters, push copy). |
| **Ms Accessibility** | WCAG 2.1 AA audit, keyboard nav, screen-reader paths, contrast, touch-target sizing | Before any feature touches user input/forms. Runs against live URL. |
| **Mr Performance** | Bundle size, Lighthouse scores, Web Vitals, lazy-loading, query reduction | Quarterly health check + after any "feels slow" report. |
| **Ms Data** | Entity schema changes, migrations, backfills, integrity checks via base44 MCP | Any base44 entity work. Owns dedup, schema sweeps, orphan cleanup. |
| **Mr Tester** | vitest + playwright authoring. Regression-gate setup. Reader/Planner/Today pagination tests | Before merging anything in a known-risky area (Reader, cycle math, ingest). |
| **Ms Strategy** | Sale-readiness, due-diligence prep, roadmap, success metrics, competitive landscape | Monthly cadence + on demand for buyer materials. |

## Skills — the reusable workflows

Skills are saved in `.claude/skills/<name>/SKILL.md`. Each one is a short playbook the assistant can invoke without re-prompting.

| Skill | What it does | Triggers |
|---|---|---|
| **verify-femwell-page** | Walks a femwells.com path via Chrome MCP, queries the DOM for known assertions, returns JSON of pass/fail. | Post-publish; "verify reader" / "check Lifestyle"; nightly cron. |
| **brand-sweep** | Greps the repo for brand-prohibited tokens (Playfair, emoji codepoints, purple #C084FC, Naija strings). | Pre-MP audit; post-merge gate. |
| **publish-femwell** | Navigates Chrome to the base44 builder, clicks Publish App → Publish App in dialog, waits for "published and live". | After any git push to main. |
| **entity-backfill** | Given a query + a derivation function, walks empty rows via MCP and patches them. | Post-schema-migration; "image_url backfill" type jobs. |
| **lighthouse-audit** | Runs Lighthouse against a live FemWell URL, reports the 4 scores + the 3 biggest regressions. | Monthly; pre-release. |

## Operating rules

1. **Lucha vs me — clear lanes.** I (Claude in Cowork/Code) own Lifestyle, Planner, Reader, Horoscope, Profile. Lucha owns ingestion, backend functions, data jobs. Cross-lane edits require a hand-off note in the commit.
2. **Brainstorm before code in risky areas.** Reader, cycle math, onboarding, paywall: a brainstorm doc in `workspace/` must exist before code changes.
3. **Pull before push.** Always `git fetch origin main && git pull --rebase` before pushing — Lucha may have committed in parallel.
4. **Publish via Chrome.** No "ask the user to publish." After every push: navigate base44 builder → click Publish.
5. **Verify is structured.** Ms Verify returns JSON. If the JSON shows a failure, the MP isn't done.
6. **Tasks ≤ 30 active.** Archive completed weekly.

## Reading order for a new contributor

1. `/sessions/relaxed-loving-brahmagupta/mnt/.auto-memory/MEMORY.md` — durable cross-session memory.
2. `TEAM.md` (this file) — who/what.
3. `.claude/agents/*.md` — agent specs.
4. `.claude/skills/*/SKILL.md` — skill playbooks.
5. Most recent `workspace/femwell_*` design demos.
