# Cowork → Code, 2026-05-15: BUILD PLANNER-B AUTONOMOUSLY

## TL;DR

Halli wants the last two parity-gap items closed: **B1 Fresh-Start banner** (signed-off demo surface that Code flagged as its own MP in the A2 tombstone) and **B2 podcast secondary external-link affordance** (the `↗` icon is inconsistent across cards now that the in-app player is primary).

**Your mandate:** autonomous build, B1 → B2 in order, push the chain, drop one tombstone at the end. Same protocol as A1/A2.

---

## Read first

1. **`claude-state/base44_mps/2026-05-15_planner_phase2_B/spec.md`** — full spec with B1 + B2 acceptance, trigger conditions, copy bank, defaults
2. **`claude-state/demos/femwell_planner_phase2_demo.html`** — visual reference for B1 (the `.fresh-start` block)
3. **`claude-state/feedback_planner_two_tab_signed_off.md`** — Today/Cycle split rule
4. **`claude-handoff/from-code-to-cowork-2026-05-15-planner-A2-complete.md`** — your own A2 tombstone for context

---

## Build path

| # | Scope | One-liner |
|---|---|---|
| **B1** | `FreshStartBanner.jsx` (Today tab) + Reset sheet | 5 prioritised triggers · 4-line deterministic copy bank · permissive voice · skip-for-today localStorage persistence |
| **B2** | `PodcastCard.jsx` modification | Always render `↗` icon top-right · always opens listen sheet · ≥40×40px tap target |

Optional polish (B1.5 — tag in tombstone if shipped or skipped): subtle gold dot under today's day-chip when Fresh-Start trigger fires.

---

## Defaults — use without checking back

From `spec.md`:

1. Reset sheet primitive = existing UI lib (`Sheet`/`Dialog`); fallback to a bottom slide-up like `PodcastListenSheet`
2. Anchor-task creation = open standard task add modal until `is_anchor` schema lands (leave TODO comment)
3. Plan-with-Jess target = match Cycle tab's "Plan my next cycle" target (probably `/Planner?_smartView=streaky`)
4. Copy bank rotation = `stringToHash(dateISO + triggerKey) % 4`
5. Fresh-Monday trigger threshold = "<2 days with any HabitLog in last 7 days"

---

## Process rules

- STATUS.md per commit · build clean · push the chain · tombstone at end
- No emoji codepoints · UK English · Fraunces + Inter · permissive voice · no paywall surfaces
- File the tombstone at `claude-handoff/from-code-to-cowork-2026-05-15-planner-B-complete.md`

---

## When Cowork picks up

Publish + 3-viewport walk. B1 needs a trigger to fire — easiest is wire a dev `?_freshStart=<triggerKey>` URL param so Cowork can force each state for screenshots. B2 walks `/Lifestyle?tab=listen&filter=podcasts` and confirms every card has `↗`.

Start with B1. `spec.md` + the signed-off demo are your sources of truth.

— Cowork (Ms Lead Manager + Ms Atelier hats), 2026-05-15
