# Selected Lifestyle — existing return-path atoms

Owned implementation: Saved.jsx and PlannerEliteShell.jsx only, under aaca3a4. Other surfaces remain with root. No migration, schema, function, main design promotion or automatic write.

| Atom | Existing object → repair | Verification |
|---|---|---|
| Saved load | Owner SavedItems plus the canonical pickProfile.saved_item_ids → resolve real LifestyleItems by ID, merge duplicate identities without deleting either store | Known/deleted/read-error distinctions; owner-scoped queries; exact item route |
| Saved return | Fiction content → FictionReader?id; other real Lifestyle content → LifestyleDetail?id; existing versioned Sky lesson → its recorded allowlisted preview and exact lesson/version | No filtered-shelf substitute, unsafe href, fake fallback or silently discarded keep |
| Saved remove | User action → delete corresponding owner SavedItems and remove the same ID from freshly read canonical profile | Busy guard, failure message, read-back after partial failure; no automatic migration |
| Planner load | PlannerItems row → preserve source/ref/notes/category/repeat and precise time while deriving presentation | Metadata survives load/edit and untouched time survives an edit |
| Planner return | Existing books:gutenberg/club reference or valid versioned public Sky lesson reference → exact existing reader/club/lesson | Unsupported references have no pretend destination; public lesson key remains versioned |
| Planner edit | Type/duration tokens change while all unrelated notes survive | Persisted success before acknowledgement; retained draft on failure |

Primary technical evidence is the installed Base44 SDK entities.types.d.ts (filter/get/update/delete) and actual routed BookReader, FictionReader, LifestyleDetail, DailySkyLesson + skyLessons sources. Brand conformance: §§17.3/19.9 no-strip; §19.8 reconcile existing stores; §19 exact item wiring and honest errors. Root owns mobile pixels, user-tap verification, canonical HTML review and ship record. Entity writes are not exercised by this agent.

## Implemented / source audit

SavedItemCard's small accessibility/date adjustment was separately delegated under c90c060. Undated profile keeps do not acquire an invented timestamp; removal is labelled and can be disabled. SavedItems reads walk the existing owner-filtered skip pages, with a non-advancing-page guard. No saved record is automatically moved or deleted. Legacy removal rereads the same owner profile before changing only saved_item_ids; a partial failure triggers a read-back rather than restoring fictional local success.

P1 repaired: canonical Lifestyle keeps were missing from Saved; duplicate physical keep records had no reconciled removal; missing URL could lead to '#'; Planner discarded source/ref/notes, erased unrelated notes on edit, and overwrote minute precision. Planner edit/delete now acknowledge successful persistence and preserve a failed draft. Loading another day no longer leaves the previous day's blocks interactive. Existing move/meal/rest categories used 'wellness', outside PlannerItems' actual enum; corrected to the existing 'wellbeing', without schema changes.

27 isolated helper assertions passed: duplicate identities and original owner records; real source title/text; deleted versus read-error states; no source mutation; article/fiction exact routes; safe external source; unsafe URL rejection; exact Sky lesson version and recorded allowlisted preview; unrelated note preservation; exact Gutenberg/club/public-lesson routes and rejected unsupported keys. Focused ESLint and diff whitespace checks passed for all three files. No live writes, account removals, age-gate taps, purchases or native screenshots performed by this agent.

Root still must verify rendered Saved and Planner at 360/390/430, exact return taps, preserved metadata after a user-authorised edit, and the failure/retry state. Unsupported Planner refs remain unsupported rather than acquiring a generic route. Books notifications, main-page design promotion, remote keep migration and cross-account Community/DM proof remain held.
