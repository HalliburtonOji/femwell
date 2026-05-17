# Handoff: Create `ContraceptionLog` entity in base44

**To:** base44 AI builder
**From:** Cowork (Halli's Planner sprint, 2026-05-17)
**Why:** Powers the new `ContraceptionCard` on the Planner Cycle tab for reproductive + pre-TTC stages. UI ships in this commit with a graceful fallback when the entity doesn't yet exist, so this handoff is non-blocking — but the card stays in "Log contraception" empty state until the entity lands.

---

## Paste this into the base44 AI builder

> Create a new entity called `ContraceptionLog` with these fields:
>
> - `type` — short text enum, required. Allowed values: `pill`, `coil`, `implant`, `patch`, `ring`, `injection`, `condom`, `none`, `other`.
> - `brand` — short text, optional. Free-form (e.g. "Microgynon 30", "Mirena IUD", "Nexplanon").
> - `startDate` — date, required.
> - `endDate` — date, optional. Null/empty when the method is currently active.
> - `sideEffects` — array of short text. Suggested values (multi-select): `mood`, `weight`, `libido`, `skin`, `headaches`, `nausea`, `bleeding`, `other`. User can write in others too.
> - `notes` — long text, optional. Free-form private notes ("worse the first three months", "GP reviewed at 6 weeks", etc).
> - `rating` — integer 1-5, optional. Overall how-is-this-working rating.
>
> Standard `created_by` (user email) + `created_date` + `updated_date` system fields. One user can have many logs over time (history view). The currently-active method is the most-recent row with `endDate` empty.
>
> No automations. No webhooks. No god agent. Just a clean CRUD entity.

---

## After it lands

1. Republish on base44 (Preview → Publish → Publish App).
2. The `ContraceptionCard` will start showing real data on `/Planner?view=cycle` for users in reproductive / pre-TTC stage.
3. Empty state: `+ Log contraception` button (opens a modal — that's a follow-up build, the card itself is read-only for v1).
4. With one row: shows method + brand + "since {startDate}" + "View history".
5. Hidden everywhere else (teen / pregnant / postpartum / peri / meno / post-meno) via the existing `hiddenFeatures: ["contraception"]` declarations in `src/utils/plannerAdapter.js`.

---

## Why this entity belongs in Femwell

Most period-tracking apps treat contraception as a one-line dropdown in Settings. That ignores three things:

1. **Side-effect pattern over time** — many people try 2–4 methods before settling. Without history, the symptom dashboard reads contraception side-effects as cycle changes.
2. **Switch-cause memory** — six months later "why did I stop the pill?" is real data, not just nostalgia. Notes + rating capture this.
3. **GP conversations** — UK GPs ask "what have you tried, what worked, what didn't." A printable history is more useful than a recall game.

Mirena coil, implant, depot — these have multi-year durations and surfacing-pattern needs that a stateless dropdown can't serve.
