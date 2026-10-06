# Exact return prerequisites — 7 October 2026

Mr Fix-it · claims 34c087d / d65183e / 751b498 · source work ready for root integration; no commit, deployment, schema or account writes by this agent.

## Reality corrected before building

The actual routed Planner uses `PlannerV2Shell`; the existing Elite helper alone did not repair its return path. `/Journal` maps to `JournalHub`, so changing `Journal.jsx` alone would not open linked notes. Both Journal implementations now support the same exact request, with the actual hub tested.

## Atoms carried through

1. **Planner provenance:** schedule, Plan-a-day and tomorrow adapters preserve `source/ref` and `_raw`. Separate 44px source links sit beside existing edit/completion controls, never nested inside their button. Book, canonical club, exact Sky lesson/version and stable joy references resolve through a lightweight allowlist without importing the central shell or an entire second Planner.
2. **Chosen duration and editing:** `d:<minutes>` is read from existing notes; previously a 5/15-minute Lifestyle action appeared as 30 minutes. The editor preserves original minutes unless the hour changes, unrelated notes, recurrence, provenance, type and anchor. A failed update/removal leaves the record and draft available; busy controls prevent accidental navigation/double submission. Existing title/hour/duration/type/anchor/delete/cancel controls stay.
3. **Exact journal note:** `?entry=<id>&content_key=<key>` queries the authenticated owner's actual `JournalEntries`, independently of the latest-200 ledger. Both request and response must match id/owner/key; a missing or mismatched row never opens the latest entry instead. Missing, authentication and network failures are distinct; a failed read offers Retry. Stale owner/URL/unmount responses are cancelled. Existing `EntryReader` opens the real note and links back to its exact supported lesson version above existing reader actions.

SDK source inspection found each `entities.JournalEntries` property access returns a new handler. The hook retains the current handler in a ref so handler identity cannot cause a repeated fetch/render loop.

## Regression proof

**29 tests passed across four dedicated suites**, including a complete real Planner V2 preview → expand → editor → persisted update flow, and actual routed JournalHub → old exact note → existing actions → composer. Tests also cover owner/id/key mismatch, failure/retry, late owner/URL responses, SDK fresh handlers, malformed refs, no invented lesson-version fallback, and minute/notes/provenance round-trip. Targeted ESLint passes for every changed implementation and test file.

## Adversarial catalogue and limits

- **P1 fixed:** wrong routed implementation; provenance lost at adapter boundaries; missing exact return targets; encoded duration ignored; original minute lost on editing; failed edits/deletes silently closed; exact Journal request ignored; SDK handler identity would repeat an effect.
- **P0/P1 unresolved in these atoms:** none found by the stated source/regression checks. This is not native proof.
- **P2 pre-existing:** duplicate `boxSizing` key in a later Planner style remains; identical values, outside this atom.
- **Pending:** root must prove deployed pixels and real taps at 360/390/430, authenticated read/write read-back and actual joy/club destination. Child browser has no enabled surfaces; no local tests are labelled iPhone, persistence or real-account proof. Community age/consent gates remain intact. Unknown source/version gets no invented link.

Conformance: AGENTS §§3.1–3.4, 4–6; BRAND_IDENTITY §§11, 17.3, 19.8–19.9. No feature removal or new function/schema. Main Lifestyle promotion still requires Halli's go-ahead; these shared returns are prerequisites for the selected Ideas preview.
