# UserProfile dedup — PROPOSAL — AWAITING HALLI SIGN-OFF (NOT EXECUTED)

> Status: **MEASUREMENT ONLY. Nothing was written, updated, deleted, or created in base44.**
> Prepared by Ms Data, 2026-07-20. Read-only via `base44 exec` from `base44/`.
> **Do not run any mutation until Halli explicitly signs off on the algorithm below.**

---

## 1. Measured scope (whole UserProfile table)

| Metric | Value |
|---|---|
| Total UserProfile rows | **13** |
| Distinct `user_id` | **9** |
| Rows with null/empty `user_id` | 0 |
| Multi-row users | **1** |

**Rows-per-user histogram (actual):**

| rows per user | # users |
|---|---|
| 1 row | 8 |
| 5 rows | 1 |
| (2,3,4) | 0 |

So the entire duplication problem is currently **one account** — the test user
`user_id = 69d9404d7fecc1f8ff194da1` (`ojihalliburton57@gmail.com`), which holds all 5 of its rows.
The other 8 users are single-row and out of scope.

### pickProfile outcome for the multi-row user
- Clean pick (strict richest, no tie at top score): **1** (the test user)
- Tie at top score (would need a rule beyond richest-wins): **0**

Scores for the 5 rows (using the app's exact `completeness()`): **[15, 2, 2, 1, 1]** — a clean, un-tied winner at 15.

### The 5 rows, characterised

| id | created | score | carries |
|---|---|---|---|
| `6a0716bdcbe7ea5d0e04e60f` | 2026-05-15 | **15 — WINNER** | `last_period_start_date 2026-04-23`, `cycle_avg_length 27`, `period_length 4`, `display_name "Halliburton"`, `birthday 1985-06-14`, `life_stage reproductive`, `followed_categories ["Mental Wellness"]`, `goals ["confidence"]`, `modules_enabled ["cycle"]`, `tone gentle`, `user_email` |
| `69d94075aa54b958a8a6eba5` | 2026-04-10 | 2 | `for_you_item_ids [10 ids]`, `location_city "Greater London"`, `followed_categories ["Parenting","Mental Wellness"]`, `goals ["confidence"]`, `modules_enabled ["cycle"]`, `life_stage reproductive`, `user_email` |
| `6a293cd6ffe7ab2dbc625e2a` | 2026-06-10 10:30:46 | 2 | `life_stage reproductive`, `life_season steady`, `onboarding_complete` only |
| `6a293cd05d8a6694d41aa0a6` | 2026-06-10 10:30:40 | 1 | `onboarding_complete` + defaults only |
| `6a293ccfb48344f480a6d212` | 2026-06-10 10:30:39 | 1 | `onboarding_complete` + defaults only |

### Completely-empty rows (safe-to-delete with zero merge)
- Under the strict definition (no cycle fields, no `display_name`, no non-empty `saved_item_ids`,
  `life_stage` none/absent, `onboarding_complete` falsey): **0 rows.** Every row has `onboarding_complete: true`.
- Under a practical definition (score ≤ 1, carries no field value that is absent from the winner):
  rows `6a293cd05d8a6694d41aa0a6` and `6a293ccfb48344f480a6d212` (the 10:30:39/40 pair) are
  redundant duplicates — **2 rows**. Row `6a293cd6ffe7ab2dbc625e2a` only adds `life_season: "steady"`,
  which is the schema default anyway, so it is also effectively redundant once merged.

---

## 2. THE KEY RISK — is data split across rows? YES.

**Split cases where a naive "keep richest, delete the rest" would LOSE data: 1 (the test user).**

The pickProfile winner (`6a0716bdcbe7ea5d0e04e60f`) does **not** carry two fields that live on a
lower-scored row (`69d94075aa54b958a8a6eba5`):

| field | value on non-winner row | on winner? |
|---|---|---|
| `for_you_item_ids` | 10 item ids | **absent** |
| `location_city` | `"Greater London"` | **absent** |

Also a soft split: the winner's `followed_categories` is `["Mental Wellness"]` while the non-winner
row has `["Parenting","Mental Wellness"]` — a naive delete would drop `"Parenting"`.

**Conclusion: merge-before-delete IS REQUIRED.** A plain "delete extras" would silently lose
`for_you_item_ids`, `location_city`, and the `Parenting` category. The dedup MUST merge non-null /
union fields onto the survivor first, then delete.

---

## 3. Proposed algorithm (idempotent) — merge-then-delete

Runs per `user_id` that has > 1 row. Uses the **same** `pickProfile()`/`completeness()` from
`src/utils/userProfile.js` so the survivor is exactly the row the live app already reads/writes.

```
for each user_id with rows.length > 1:
  survivor = pickProfile(rows)              // richest; tie -> newest (app-identical)
  donors   = rows where id !== survivor.id

  patch = {}
  # ARRAY / SET fields -> UNION (dedupe), survivor values first, then donor values
  for field in [ for_you_item_ids, saved_item_ids, liked_item_ids,
                 followed_categories, goals, modules_enabled,
                 life_stage_focus, condition_flags, blocked_source_ids,
                 completed_sessions, favorite_sessions ]:
     union = dedupe([ ...(survivor[field]||[]), ...donors.flatMap(d => d[field]||[]) ])
     if union.length !== (survivor[field]||[]).length: patch[field] = union

  # SCALAR fields -> fill ONLY if survivor is empty/absent; take from richest donor that has it
  for field in [ last_period_start_date, cycle_avg_length, period_length,
                 display_name, birthday, location_city, bio, life_stage,
                 pregnancy_start_date, pregnancy_due_date, user_email,
                 ai_assistant_name, tone_preference ]:
     if isEmpty(survivor[field]):
        donor = donors (richest first) .find(d => !isEmpty(d[field]))
        if donor: patch[field] = donor[field]

  # OBJECT fields (notification_preferences, consent_flags, hrt_regimen,
  #   partner_sharing_settings, saved_item_phases, cycle_prediction_meta) ->
  #   shallow-merge donor keys into survivor only where survivor key is absent.

  if Object.keys(patch).length: UserProfile.update(survivor.id, patch)   # WRITE #1
  for d in donors: UserProfile.delete(d.id)                              # WRITE #2..n
```

**Idempotency:** after a run every user has exactly one row, so a re-run finds `rows.length === 1`
and does nothing. The merge is also order-independent (union + fill-if-empty), so a partial run that
is re-run converges to the same state.

**Guards before each delete:**
- delete a donor ONLY after the survivor `update` for that user returned success (or produced an empty patch — nothing to merge).
- never delete `survivor.id`.
- assert `survivor.user_id === donor.user_id` (never cross-user).
- for THIS run, restrict to `user_id = 69d9404d7fecc1f8ff194da1` only (the sole affected account), so blast radius = 1 user, 4 deletes, 1 update.

**Batch limits (Ms Data policy):** ≤200 updates and ≤50 creates per call. Current job is 1 update
+ 4 deletes — trivially within limits. If re-run later at scale, chunk updates at 100.

---

## 4. Rollback-snapshot plan (must run BEFORE any mutation)

1. **Snapshot** — before touching anything, capture full JSON of every row for every affected
   `user_id` and write to a timestamped file outside base44:
   ```js
   const affected = ['69d9404d7fecc1f8ff194da1'];
   const snap = [];
   for (const uid of affected)
     snap.push(...await base44.entities.UserProfile.filter({ user_id: uid }));
   // write JSON.stringify(snap) to claude-state/rollback/userprofile_dedup_{ymd_hms}.json
   ```
   Snapshot captures original `id`, all fields, `created_date`, `updated_date` for each row.

2. **To undo (two-part):**
   - **Revert the survivor merge:** `UserProfile.update(survivor.id, <survivor's original field set from snapshot>)`
     — restores the winner to its pre-merge shape (e.g. remove the injected `for_you_item_ids`/`location_city` if desired).
   - **Restore deleted rows:** `UserProfile.bulkCreate(<the 4 deleted rows from snapshot, minus id/created_date/updated_date>)`.
     NOTE: `bulkCreate` mints **new ids** — content is restored but the old row ids do not return. This is
     acceptable **iff** no other entity references `UserProfile.id` as a foreign key (all app data keys off
     `user_id`, not the profile row id — see §6 caveat: verify before executing).

---

## 5. Exact base44 exec method for the future WRITE session

- Invoke from `base44/`: `cat script.mjs | npx base44 exec` (authenticated as the current platform user).
- Entity client methods confirmed available on `base44.entities.UserProfile`:
  `list, filter, get, create, update, delete, deleteMany, bulkCreate, updateMany, bulkUpdate, importEntities, subscribe`.
- Shapes:
  - Read/sample: `UserProfile.filter({ user_id })` or `UserProfile.list('-created_date', N)`.
  - Merge onto survivor: `UserProfile.update(id, patchObject)`.
  - Remove redundant row: `UserProfile.delete(id)` (or `deleteMany([...ids])`).
  - Restore for rollback: `UserProfile.bulkCreate([ {…row}, … ])`.
- `base44.auth.me()` is the correct current-user accessor (there is no `entities.User.me`).

---

## 6. What could go wrong (explicit risk list)

1. **Data loss from naive delete (the whole reason for merge-first).** Confirmed: `for_you_item_ids`,
   `location_city`, and the `Parenting` category live only on a non-winner row. Mitigation: §3 merge step; a
   dry-run must print the exact `patch` for review before any write.
2. **Concurrent write during dedup.** If the app writes to a soon-deleted donor mid-run, that write is lost.
   Low risk now because the app already writes to the pickProfile winner (survivor). Mitigation: run when the
   test account is idle; re-snapshot immediately before executing.
3. **bulkCreate restore mints new ids.** Rollback restores content but not original row ids. Safe only if no
   entity FKs on `UserProfile.id`. **Action for write session: grep the codebase / spot-check entities for any
   reference to a profile row id before executing.** (App convention is `user_id`-keyed, so expected-safe.)
4. **Array-union semantics.** Unioning `followed_categories` re-adds `Parenting` even if the user later
   unfollowed it on the winner. Impact low (a category re-appears). If undesirable, restrict union to
   `for_you_item_ids`/`saved_item_ids`/`liked_item_ids` and treat `followed_categories`/`goals` as survivor-wins.
   Decision needed from Halli.
5. **Object-field shallow merge** could resurrect a stale consent/notification toggle. Mitigation: survivor-wins
   for object fields; only fill keys absent on survivor.
6. **RLS / cross-user scope.** `base44 exec` here can *read* all 9 users' rows. For THIS job only the test
   user's own rows are mutated, so no cross-user delete is attempted. If the job is ever re-run at scale across
   other users, confirm delete permission and add a hard `user_id`-match guard (already in §3).
7. **Scale drift.** Onboarding was already fixed to stop creating split rows, so the population is not growing.
   But if this proposal is executed weeks later, re-measure first — new multi-row users may have appeared and
   the histogram in §1 must be regenerated before running.
8. **Idempotency depends on pickProfile determinism.** If `completeness()` weights change between now and
   execution, the survivor could differ. Mitigation: pin to the current `src/utils/userProfile.js` logic and
   re-verify §1 numbers immediately before the write.

---

## 7. Recommendation summary

- Scope is tiny and contained: **1 user, 5 rows → 1 survivor + 4 deletes + 1 merge update.**
- **Merge-before-delete is mandatory** (a genuine split exists), so a plain "delete extras" is rejected.
- Note vs Ms Data standing policy ("never delete; mark `is_hidden`"): `UserProfile` has **no** soft-delete
  field. Options for Halli:
  - **(A)** hard-delete the 4 redundant rows on explicit sign-off (rollback via snapshot + bulkCreate) — simplest;
  - **(B)** first add an `is_hidden` boolean to `UserProfile` via a schema MP, then mark instead of delete —
    safer, but requires a schema change + every read path to filter `is_hidden`. Heavier for a 4-row cleanup.
  Ms Data leans **(A)** given the snapshot rollback and the fact these are the user's own duplicate rows.

**AWAITING HALLI SIGN-OFF. No mutation will run until Halli approves the algorithm and picks option A or B.**
