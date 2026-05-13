# LC-2 — Atelier AI-final auto-publish (D6 follow-up)

> Paste everything below the rule into the base44 builder. Do NOT include this header.

---

## §1 Pre-flight (read first)

Read these files before editing:
- `base44/functions/draftAtelierLetter/entry.ts`
- `base44/functions/pipelineOrchestrator/entry.ts` (only to confirm the `draftAtelierLetters` phase exists and fires monthly — do NOT edit it)
- `src/components/horoscope/sections/AtelierReading.jsx`
- `base44/entities/AtelierLetters.jsonc`
- `mnt/femwell/H2_DECISIONS.md` — D6 is the decision this MP implements

Confirm schema state:
- `AtelierLetters` entity has `draft` (boolean, default true), `published_at` (string, format date-time), `signed_by` (string, default "Astra Cole, MA, FAS"), `title`, `body_html`, `user_id`, `month`, `created_at`. Verify by reading `base44/entities/AtelierLetters.jsonc`.
- `draftAtelierLetter/entry.ts` currently creates rows with `draft: true, signed_by: 'Astra Cole, MA, FAS', created_at: now`. Verify the create call near line 281.
- Verify `pipelineOrchestrator` has a phase keyed `draftAtelierLetters` that runs on the 1st of each UTC month. Do not change its scheduling.

HEAD SHA expected: `dd5eec9` (heart codepoint swap). If repo HEAD differs by more than 3 commits, stop and ask.

Live state (per Ms Verify 2026-05-13): the H2d-1 build is on `main`. No live walk done yet — but per the master plan §10 the H2 Horoscope tab is shipped. The "Awaiting Astra's sign-off" banner is currently the locked-state copy whenever a draft row exists for the current month and no published row exists.

## §2 Goal (one sentence)

Per H2_DECISIONS.md D6: ship Atelier letters as AI-final by default — the cron writes `draft: false` and `published_at: now()` directly, the user-facing "Awaiting Astra's sign-off" banner is removed, and the operator panel survives as an optional curation tool but is no longer on the critical path.

## §3 Constraints (binding)

- UK English. £. en-GB dates ("14 Jun 1999"). No emoji codepoints anywhere.
- Lucide icons + SVG only. Fraunces + Inter only. No Playfair, no `#C084FC`.
- Same 5-slot unified bottom nav across viewports — no desktop sidebar substitution.
- Plum Night palette is preserved for the Atelier card (it is the Horoscope's paid surface; stays on Plum Night).
- DO NOT modify `src/Layout.jsx`, `src/pages.config.js`, `src/components/ui/**`.
- DO NOT change the cron schedule or the LLM prompt — letters keep being drafted on the 1st of each UTC month, content unchanged.
- DO NOT delete the operator panel — only its critical-path role goes away. The panel remains visible to `user.is_operator === true` users for future curation.
- DO NOT swap the "Backed by Astra Cole, MA, FAS" attribution — D2 still binds (no Skyfield).
- Idempotence: re-running this MP should be a no-op. The schema delta is additive (`draft` default flips) and the write-line change is convergent.

## §4 Diff plan (file-by-file)

| Path | Action | One-line description |
|---|---|---|
| `base44/functions/draftAtelierLetter/entry.ts` | EDIT | Change the create call so new rows ship with `draft: false, published_at: <iso now>`. |
| `src/components/horoscope/sections/AtelierReading.jsx` | EDIT | Drop the "Awaiting Astra's sign-off" banner branch + render condition. |
| `base44/entities/AtelierLetters.jsonc` | EDIT | Flip the `draft` field default from `true` to `false`; widen the description to reflect AI-final semantics. |

### §4a Edit: `base44/functions/draftAtelierLetter/entry.ts`

Locate the `await sb.entities.AtelierLetters.create({...})` call around lines 281-289:

```ts
await sb.entities.AtelierLetters.create({
  user_id: userId,
  month,
  title: letter.title,
  body_html: letter.body_html,
  draft: true,
  signed_by: 'Astra Cole, MA, FAS',
  created_at: now,
});
```

Replace with:

```ts
// LC-2 (H2_DECISIONS.md D6): Atelier letters are AI-final for now.
// Ship published-by-default; operator panel keeps optional curation post-publish.
await sb.entities.AtelierLetters.create({
  user_id: userId,
  month,
  title: letter.title,
  body_html: letter.body_html,
  draft: false,
  published_at: now,
  signed_by: 'Astra Cole, MA, FAS',
  created_at: now,
});
```

The post-loop notification block writes an `IngestErrorLog` row that says "Atelier letters awaiting sign-off for N users." Update the message to reflect the new flow. Replace lines 298-310 with:

```ts
// Notify the operator (single IngestErrorLog row — acts as a notification
// sink consistent with the rest of the pipeline). Under D6, letters publish
// themselves; the row is informational only.
if (drafted > 0) {
  try {
    await sb.entities.IngestErrorLog.create({
      function_name: 'draftAtelierLetter',
      stage: 'notify_operator',
      source_identifier: month,
      error_message: `Atelier letters auto-published for ${drafted} users (${month}).`,
      raw_payload: JSON.stringify({ month, drafted, skipped, scanned }),
      logged_at: now,
      status: 'logged',
    });
  } catch { /* swallow — letters are saved either way */ }
}
```

### §4b Edit: `src/components/horoscope/sections/AtelierReading.jsx`

This file has two pieces to remove: the `draftRow` state + fetch, and the `awaitingSignoff` render branch.

**Step 1.** Remove the per-user current-month draft fetch from the first `useEffect` (lines 90-110). The effect should keep fetching the latest published letter only. Replace the effect block with:

```jsx
// LC-2 (D6): letters publish on creation. No draft-state polling needed for the
// reader's own card. The operator panel below still fetches global drafts when
// user.is_operator === true.
useEffect(() => {
  if (!userId) return undefined;
  if (!hasAtelier && !isOperator) return undefined;
  let cancelled = false;
  (async () => {
    try {
      const all = await base44.entities.AtelierLetters.filter(
        { user_id: userId, draft: false }, '-created_at', 6,
      ).catch(() => []);
      if (cancelled) return;
      setLetter(Array.isArray(all) && all.length > 0 ? all[0] : null);
    } catch { /* silent */ }
  })();
  return () => { cancelled = true; };
}, [userId, hasAtelier, isOperator]);
```

**Step 2.** Remove the `draftRow` state declaration (line 84). Replace:
```jsx
const [letter, setLetter] = useState(null);     // published row (draft: false)
const [draftRow, setDraftRow] = useState(null); // current-month draft row
```
with:
```jsx
const [letter, setLetter] = useState(null); // most-recent published row
```

**Step 3.** In `handlePublish` (~line 158), remove the `draftRow` write-back at the bottom. Replace the function with:

```jsx
const handlePublish = async (rowId) => {
  try {
    await base44.entities.AtelierLetters.update(rowId, {
      draft: false,
      published_at: new Date().toISOString(),
    });
    setOperatorDrafts((prev) => prev.filter((r) => r.id !== rowId));
  } catch (err) {
    console.warn('[AtelierReading] publish failed:', err?.message || err);
  }
};
```

**Step 4.** In the UNLOCKED variant render (lines 175-212), remove the `awaitingSignoff` variable and its banner. Replace the entire `if (hasAtelier)` block with:

```jsx
// ── UNLOCKED variant ────────────────────────────────────────────────────
if (hasAtelier) {
  return (
    <SectionWrap>
      <div style={shellStyle}>
        <p style={eyebrowStyle}>ATELIER &middot; BACKED BY ASTRA COLE, MA, FAS</p>

        {letter ? (
          <>
            <h2 style={titleStyle}>{letter.title}</h2>
            <div
              style={bodyHtmlStyle}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: sanitiseLetterHtml(letter.body_html) }}
            />
            <p style={signoffStyle}>&mdash; {letter.signed_by || 'Astra Cole, MA, FAS'}</p>
          </>
        ) : (
          <p style={italicBodyStyle}>
            Your letter for {ukLongMonth()} is on its way. Astra writes one for you every month, signed by hand.
          </p>
        )}

        {isOperator && (
          <OperatorPanel drafts={operatorDrafts} onPublish={handlePublish} />
        )}
      </div>
    </SectionWrap>
  );
}
```

**Step 5.** Add a `ukLongMonth()` helper near the existing `currentMonthKey` helper (top of file, around line 35):

```jsx
function ukLongMonth() {
  return new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}
```

**Step 6.** Delete the now-unused `awaitingBannerStyle` constant (lines 366-376) — it has no remaining caller. Or leave it as dead code if removing it conflicts with another diff; preference is to delete.

The LOCKED variant (non-Plus user) at the bottom of the file is unchanged.

### §4c Edit: `base44/entities/AtelierLetters.jsonc`

Update the `draft` field default + description:

```jsonc
"draft": {
  "type": "boolean",
  "default": false,
  "description": "True only if the operator chose to roll a row back to draft for re-editing. Under H2_DECISIONS.md D6 the cron writes new rows with draft: false directly — there is no awaiting-sign-off state in the UI."
},
```

Update the entity-level description (top of file) to reflect AI-final:

```jsonc
"description": "Monthly long-form letter from Astra Cole, MA, FAS for FemWell Plus subscribers. One row per (user, month). Drafted AND auto-published by the LLM via draftAtelierLetter under H2_DECISIONS.md D6 (AI-final). Operator panel survives for optional post-hoc curation. See H2_DECISIONS.md D2 — attribution is Astra Cole, never Skyfield.",
```

No required-array changes. No RLS changes.

## §5 Schema changes

See §4c. Field: `draft` default flips `true → false`. Description widens. No new fields, no removed fields, no enum changes, no RLS changes.

**Migration implication:** existing draft rows (if any) keep `draft: true` until manually flipped by the operator. There may be ~0-12 such rows from the H2d-1 test run on 2026-05-13. The operator can either (a) leave them — the user-facing card will never render an old draft because the new effect filters `{ user_id, draft: false }`, OR (b) bulk-update them via the operator panel. Pre-flight check before paste: open Dashboard → Data → AtelierLetters and count rows where `draft = true`. If 0, no migration needed.

## §6 LLM prompt changes

None. The system + user prompts inside `draftAtelierLetter/entry.ts` are unchanged. Only the persistence call is affected.

## §7 Visual acceptance test (per viewport)

Operator must walk femwells.com/Lifestyle?tab=horoscope on a signed-in FemWell Plus account (`entitlements.plan in ['plus','pro','premium']`) at each viewport preset.

- **Mobile (toggle → Mobile, ~380px):** Atelier Reading section renders. If the current month has a published letter, the title (Fraunces 22px) + body_html (Fraunces 14px, 1.65 line-height) + sign-off "— Astra Cole, MA, FAS" render on the Plum Night card. If the current month has no row yet, the italic placeholder "Your letter for May 2026 is on its way. Astra writes one for you every month, signed by hand." renders instead. **The phrase "Awaiting Astra's sign-off" MUST NOT appear anywhere on the page** — grep the DOM, expect 0 matches.
- **Tablet (toggle → Tablet, ~768px):** Same content, card width-constrained to ~600-720px wrapper centred on the cream page background. No horizontal scroll.
- **Desktop (toggle → Desktop, ~1280px):** Same card, width-constrained. NO sidebar substitution. Plum Night card sits inside the cream page; the page bottom nav remains the 5-slot mobile pattern.

Brand checks:
- No emoji codepoints anywhere on the rendered Atelier card.
- Attribution chip reads "ATELIER · BACKED BY ASTRA COLE, MA, FAS" (no Skyfield).
- Fraunces for title + body + sign-off; Inter for the eyebrow chip. No Playfair.

## §8 Success criteria (falsifiable)

- After this MP is published, manually invoke `base44.functions.invoke('draftAtelierLetter', { user_id: '<test-Plus-user-id>' })`. Result row in `AtelierLetters`: `draft === false`, `published_at` set to an ISO string within the last 30 seconds.
- The `IngestErrorLog` row written by the function reads "Atelier letters auto-published for N users (YYYY-MM)." — not "awaiting sign-off".
- On the Horoscope tab, the Atelier Reading section never renders the string "Awaiting Astra's sign-off" or "usually published by the 3rd". `document.body.innerText.includes("Awaiting Astra")` returns `false`.
- Operator-mode user (`is_operator === true`) still sees the OperatorPanel with any leftover draft rows; the Publish-letter button flips a row from `draft: true → false` with `published_at` set.
- For users without any published row this month and no AtelierLetters at all: the placeholder "Your letter for <Month YYYY> is on its way." renders.

## §9 Risks + mitigations

1. **Pre-existing draft rows might still render under stale code paths.** Mitigation: the new effect filters `draft: false` at the entity query, so legacy `draft: true` rows are not surfaced to the reader. They are only visible to operators in the OperatorPanel.
2. **Legal exposure (R3 in master plan §11):** "Astra Cole, MA, FAS" credentials at DD time. Mitigation: D6 explicitly notes this — re-ask 4-6 weeks before the sale window opens; swap attribution to "Backed by FemWell's editorial astrology team" if no contracted astrologer is in place. Not a build-time fix, a DD-readiness one.
3. **Cron may run on the same day as this MP publishes.** Mitigation: the cron is `pipelineOrchestrator` phase gated by `isFirstOfMonth`. Today (13 May 2026) is mid-month, so the next monthly fire is 1 Jun 2026 UTC — plenty of time. No race condition.
4. **The `ukLongMonth()` helper exists in `draftAtelierLetter/entry.ts` already** (lines 32-34) but in a different file. Mitigation: we add it locally in `AtelierReading.jsx` — JS uses module-scoped helpers, no naming clash. Confirmed by reading both files.
5. **The `awaitingBannerStyle` constant deletion may collide if another file imports it.** Mitigation: grep the repo (`rg "awaitingBannerStyle"`) before deletion — it's currently only referenced inside `AtelierReading.jsx`. Safe to delete.

## §10 Rollback

If readers report a missing letter or the operator panel breaks: click `Revert` on the assistant message in the chat panel — this rolls back both the function and the section file plus the schema delta in one snapshot. If revert isn't available, manually:
- In `base44/entities/AtelierLetters.jsonc`, set `draft.default` back to `true` and restore the prior `description`.
- In `base44/functions/draftAtelierLetter/entry.ts`, revert the create call to `draft: true` (no `published_at`).
- In `src/components/horoscope/sections/AtelierReading.jsx`, restore the `draftRow` state + the `awaitingSignoff` branch.

To roll back data: in Dashboard → Data → AtelierLetters, bulk-update all rows where `published_at` was set within the LC-2 window to `draft: true, published_at: null`. The cron will resume drafting fresh next month.

## §11 Sequence

LC-2 is independent from LC-1 (separate files, no shared edits). Run order options:
- **Recommended:** ship LC-2 second (after LC-1), before LC-3, so the Horoscope tab and the Listen tab are both clean before the Sessions removal. But LC-2 can also run in parallel with LC-1 in a separate base44 prompt window if the operator wants to interleave.
- LC-3, LC-4, LC-5 do not depend on LC-2.

Done signal for LC-2: open `femwells.com/Lifestyle?tab=horoscope` on a FemWell Plus account at all three viewports. Atelier card renders either a published letter or the "on its way" placeholder. The string "Awaiting Astra's sign-off" returns 0 hits in DOM. Screenshot per viewport to `workspace/walk_lc2_20260513/`.
