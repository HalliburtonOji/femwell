# LC-4 — TikTok ingest emoji strip + backfill

> Paste everything below the rule into the base44 builder. Do NOT include this header.

---

## §1 Pre-flight (read first)

Read these files before editing:
- `base44/functions/ingestSocial/entry.ts` (the TikTok write path — modified in LC-1 to take the TikTok branch out of the hard-skip; verify LC-1 has shipped before touching this).
- `base44/functions/ingestLifestyleBatch/entry.ts` (uses the `TIKTOK` source_type but only for media_type mapping; verify no other write site exists).
- `base44/functions/ingestRSS/entry.ts` (writes RSS rows; if any RSS feed taps a TikTok-via-RSS gateway, the emoji strip should apply here too — but per the grep this is RSS-only, not TikTok).
- `base44/functions/backfillTikTokEmoji/entry.ts` (NEW — will be created in this MP).
- `mnt/.auto-memory/feedback_no_emoji_in_femwell.md` (canonical regex).
- Live TikTok DOM evidence from Ms Verify 2026-05-13: "many video titles contain emoji (`\u{1F4AA} \u{1FAF6} \u{1F634}`) imported from source captions". These came in via the legacy ingest path before LC-1.

Pre-flight investigation steps the agent runs BEFORE editing (report counts back to the operator):

1. **Grep the codebase** for any other ingest write site that takes user-facing text from a third-party source:
   ```sh
   rg -n "LifestyleItems.create" base44/functions/
   ```
   Expected hits: `ingestRSS`, `ingestSocial`, `ingestYouTubeChannels`, `ingestLifestyleBatch`, `seedPodcasts` (from LC-1), `migrateSessionsToPractice` (from LC-3). LC-1 + LC-3 already use the emoji strip. This MP adds it to `ingestRSS`, `ingestSocial` (TikTok branch, redundant but defensive), `ingestYouTubeChannels`, and `ingestLifestyleBatch`.

2. **Test the regex.** Inside the base44 chat, run a Discuss-mode prompt that mentally evaluates (here `\u{1F4AA}` is the flex-bicep codepoint, `\u{1F634}` the sleeping-face codepoint, `\u{1FAF6}` the heart-hands codepoint):
   ```js
   "Lift heavy \u{1F4AA} sleep deep \u{1F634} trust your gut \u{1FAF6}".replace(
     /[\u{2600}-\u{27BF}\u{1F300}-\u{1FAFF}\u{1F900}-\u{1F9FF}\u{2700}-\u{27BF}\u{1FA70}-\u{1FAFF}\u{1F680}-\u{1F6FF}\u{1F300}-\u{1F5FF}]/gu,
     '',
   ).replace(/\s+/g, ' ').trim()
   ```
   Expected result: `"Lift heavy  sleep deep  trust your gut"` → after `\s+` collapse: `"Lift heavy sleep deep trust your gut"`. **If the agent cannot mentally verify, write a vitest spec instead** (see §4c).

3. **Count rows currently containing emoji.** Run a Dashboard → Data filter on `LifestyleItems` where `media_type=TIKTOK`. Visually scan for emoji glyphs in the `title` or `author_name` column. Expect ~24+ rows (matches Ms Verify's count) — note the count and surface it in the assistant message.

Confirm schema state:
- `LifestyleItems` has `title`, `author_name`, `summary`, `lede` — all string fields. No schema change needed for this MP.

HEAD SHA expected: after LC-1 + LC-3 ship, ideally `dd5eec9 + LC-1 + LC-3`. If LC-1 has not shipped, LC-4 still adds the emoji strip to the existing functions — but the TikTok backfill is most useful AFTER LC-1 has actually started writing TikTok rows. Cleanest sequencing: LC-1 → LC-3 → **LC-4**.

## §2 Goal (one sentence)

Run an emoji-codepoint scrub through every ingest write site (`ingestRSS`, `ingestSocial`, `ingestYouTubeChannels`, `ingestLifestyleBatch`) on the `title`, `author_name`, `summary`, and `lede` fields, and add a one-shot `backfillTikTokEmoji` function that cleans existing rows in the database.

## §3 Constraints (binding)

- UK English. £. en-GB dates. No emoji codepoints anywhere — and now ingested third-party text is enforced to follow this rule at write time AND backfilled in the database.
- The canonical regex (from `feedback_no_emoji_in_femwell.md`) is the ONLY regex used. Do NOT invent a "simpler" version.
- Lucide icons + SVG only. Fraunces + Inter. No Playfair, no `#C084FC`.
- DO NOT touch user-authored fields (`JournalEntries.body`, `Posts.body`, `SealedLetters.body`) — those are user expression and not subject to the no-emoji ingest rule. Users can write what they want; only ingested third-party content is scrubbed.
- DO NOT touch `DailyStory` or `FictionWork` chapter bodies — those are operator-authored FemWell content and already clean.
- Performance: the strip is a single regex per field per row at write time — negligible cost. The backfill iterates ~24-50 rows once.
- Same 5-slot unified bottom nav across viewports.

## §4 Diff plan (file-by-file)

| Path | Action | One-line description |
|---|---|---|
| `src/utils/stripEmoji.js` | NEW | Single source of truth for the emoji-strip regex, exported from one place. |
| `base44/functions/_shared/stripEmoji.ts` | NEW | Deno mirror of the same helper for backend functions (Deno cannot import from `src/`). |
| `base44/functions/ingestRSS/entry.ts` | EDIT | Apply `stripEmoji` to `title`, `summary` at write time. |
| `base44/functions/ingestSocial/entry.ts` | EDIT | Apply `stripEmoji` to `title` at write time. (LC-1 already added a local helper — replace with the shared import.) |
| `base44/functions/ingestYouTubeChannels/entry.ts` | EDIT | Apply `stripEmoji` to `title`, `channel_name`, `summary` at write time. |
| `base44/functions/ingestLifestyleBatch/entry.ts` | EDIT | Apply `stripEmoji` to every text-field write. |
| `base44/functions/backfillTikTokEmoji/entry.ts` | NEW | One-shot admin job: scan existing `LifestyleItems` where `media_type IN [TIKTOK, VIDEO, ARTICLE, PODCAST]` AND any string field contains an emoji codepoint, update with cleaned strings. |

### §4a New file: `src/utils/stripEmoji.js`

```js
// Single source of truth for the emoji-codepoint strip.
// Canonical regex from feedback_no_emoji_in_femwell.md.
// Frontend-side helper — used to scrub display strings defensively before render.
// The backend mirror lives at base44/functions/_shared/stripEmoji.ts.

const EMOJI_RE = /[\u{2600}-\u{27BF}\u{1F300}-\u{1FAFF}\u{1F900}-\u{1F9FF}\u{2700}-\u{27BF}\u{1FA70}-\u{1FAFF}\u{1F680}-\u{1F6FF}\u{1F300}-\u{1F5FF}]/gu;

export function stripEmoji(s) {
  if (!s) return '';
  return String(s).replace(EMOJI_RE, '').replace(/\s+/g, ' ').trim();
}

export function hasEmoji(s) {
  if (!s) return false;
  EMOJI_RE.lastIndex = 0;
  return EMOJI_RE.test(String(s));
}
```

### §4b New file: `base44/functions/_shared/stripEmoji.ts`

```ts
// Backend mirror of src/utils/stripEmoji.js.
// Deno-runtime helper; importable by every ingest function.
// Keep this file's regex in lockstep with the frontend.

export const EMOJI_RE = /[\u{2600}-\u{27BF}\u{1F300}-\u{1FAFF}\u{1F900}-\u{1F9FF}\u{2700}-\u{27BF}\u{1FA70}-\u{1FAFF}\u{1F680}-\u{1F6FF}\u{1F300}-\u{1F5FF}]/gu;

export function stripEmoji(s: unknown): string {
  if (!s) return '';
  return String(s).replace(EMOJI_RE, '').replace(/\s+/g, ' ').trim();
}

export function hasEmoji(s: unknown): boolean {
  if (!s) return false;
  EMOJI_RE.lastIndex = 0;
  return EMOJI_RE.test(String(s));
}
```

### §4c Edit: `base44/functions/ingestRSS/entry.ts`

Add at the top, alongside the existing imports:
```ts
import { stripEmoji } from '../_shared/stripEmoji.ts';
```

Locate the `LifestyleItems.create({...})` call around lines 300-315. Wrap text fields with `stripEmoji`:

```ts
await base44.asServiceRole.entities.LifestyleItems.create({
  source_id: source.id,
  source_name: source.name,
  title: stripEmoji(item.title).slice(0, 220),
  content_url: item.link,
  summary: stripEmoji(stripHtml(item.description)),
  image_url: resolvedImageUrl,
  published_at: (() => { try { return new Date(item.pubDate).toISOString(); } catch { return new Date().toISOString(); } })(),
  category: source.category,
  media_type: (Array.isArray(source.tags) && source.tags.includes('podcast')) ? 'PODCAST' : 'ARTICLE',
  status: 'PUBLISHED',
  tags: Array.isArray(source.tags) ? source.tags : [],
  created_at: new Date().toISOString(),
  ingested_at: new Date().toISOString(),
  provider: 'RSS',
});
```

### §4d Edit: `base44/functions/ingestSocial/entry.ts`

Replace the local `stripEmoji` helper introduced in LC-1 with the shared import. At the top:
```ts
import { stripEmoji } from '../_shared/stripEmoji.ts';
```
Delete the local `function stripEmoji(s) { ... }` block. The `LifestyleItems.create` call (LC-1 §4d) already wraps `title` with `stripEmoji` — verify by re-reading the file and patch any field that still ships raw third-party text. Specifically also wrap `summary` and `author_name` if those columns are populated by the social ingest.

### §4e Edit: `base44/functions/ingestYouTubeChannels/entry.ts`

Add the import:
```ts
import { stripEmoji } from '../_shared/stripEmoji.ts';
```

Locate every `LifestyleItems.create({...})` call. Wrap `title`, `channel_name`, `summary`, `author_name`, `lede` with `stripEmoji(...)`. The YouTube Shorts pipeline imports captions that frequently contain emoji and these have been displaying in the Videos shelf — Ms Verify saw them at `/Lifestyle?tab=listen&filter=videos` on 2026-05-13.

### §4f Edit: `base44/functions/ingestLifestyleBatch/entry.ts`

Add the import:
```ts
import { stripEmoji } from '../_shared/stripEmoji.ts';
```

This function maps source types to media types (line 13 hits `TIKTOK`). Find every write to `LifestyleItems` and wrap text fields with `stripEmoji`. The pattern is the same as §4c.

### §4g New file: `base44/functions/backfillTikTokEmoji/entry.ts`

```ts
// backfillTikTokEmoji — one-shot operator-invoked backfill.
// Sweeps existing LifestyleItems rows for emoji codepoints in title /
// author_name / summary / lede / channel_name. Updates each row with the
// scrubbed text in-place. Idempotent — re-runs are no-ops because the strip
// has nothing left to remove.
//
// Body (admin-only):
//   POST {}              — full sweep across all media_types.
//   POST { media_type }  — limit to one media_type (e.g. 'TIKTOK').
//   POST { dry_run: true } — counts only, no writes.
// Returns: { ok, scanned, updated, fields_cleaned, errors }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { stripEmoji, hasEmoji } from '../_shared/stripEmoji.ts';

const TEXT_FIELDS = ['title', 'author_name', 'summary', 'lede', 'channel_name'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (me?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = !!body?.dry_run;
    const onlyMedia: string | undefined = body?.media_type;

    const sb = base44.asServiceRole;
    let scanned = 0;
    let updated = 0;
    const fieldsCleaned: Record<string, number> = {};
    const errors: any[] = [];

    // Pull in pages of 200 to avoid 3-minute function cap.
    const pageSize = 200;
    let offset = 0;
    // Cap total scan at 5000 — well above current corpus, prevents runaway.
    while (offset < 5000) {
      const rows = await sb.entities.LifestyleItems.list(
        '-created_date', pageSize, offset,
      ).catch(() => []);
      if (!rows || rows.length === 0) break;

      for (const row of rows) {
        if (onlyMedia && row.media_type !== onlyMedia) continue;
        scanned += 1;

        const patch: Record<string, string> = {};
        let dirty = false;
        for (const field of TEXT_FIELDS) {
          const orig = row[field];
          if (typeof orig === 'string' && hasEmoji(orig)) {
            const clean = stripEmoji(orig);
            patch[field] = clean;
            fieldsCleaned[field] = (fieldsCleaned[field] || 0) + 1;
            dirty = true;
          }
        }
        if (!dirty) continue;

        if (dryRun) { updated += 1; continue; }

        try {
          await sb.entities.LifestyleItems.update(row.id, patch);
          updated += 1;
        } catch (err: any) {
          errors.push({ id: row.id, error: err?.message || String(err) });
        }
      }

      if (rows.length < pageSize) break;
      offset += pageSize;
    }

    return Response.json({
      ok: true,
      dry_run: dryRun,
      scanned,
      updated,
      fields_cleaned: fieldsCleaned,
      errors: errors.slice(0, 20),
    });
  } catch (err: any) {
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
});
```

## §5 Schema changes

None. No entity field is added, removed, or re-typed.

## §6 LLM prompt changes

None. No LLM-using function is touched.

## §7 Visual acceptance test (per viewport)

Walk femwells.com on each viewport.

- **Mobile (toggle → Mobile, ~380px):**
  - `/Lifestyle?tab=listen&filter=videos` — every video card title is emoji-free. DOM-grep for the canonical regex returns 0 hits across `[data-testid^="video-card"]` (or the equivalent selector for video cards).
  - Same chip filter, TikTok rail (if LC-1 has populated it): every card title + author handle is emoji-free.
  - `/Lifestyle?tab=for_you` — every Editorial Hero + Bento card title is emoji-free.
- **Tablet (toggle → Tablet, ~768px):** Same expectations, width-constrained container, no horizontal scroll.
- **Desktop (toggle → Desktop, ~1280px):** Same expectations, no sidebar substitution. Listen + For You both grep clean.

Programmatic check (run in dashboard devtools):
```js
const all = await base44.entities.LifestyleItems.list('-created_date', 1000);
const re = /[\u{2600}-\u{27BF}\u{1F300}-\u{1FAFF}\u{1F900}-\u{1F9FF}\u{2700}-\u{27BF}\u{1FA70}-\u{1FAFF}\u{1F680}-\u{1F6FF}\u{1F300}-\u{1F5FF}]/gu;
const dirty = all.filter(r => ['title','author_name','summary','lede','channel_name'].some(f => typeof r[f]==='string' && re.test(r[f])));
console.log({ total: all.length, still_dirty: dirty.length, sample: dirty.slice(0, 5).map(d => d.title) });
```
After running `backfillTikTokEmoji`, `still_dirty` must be 0.

## §8 Success criteria (falsifiable)

- After invoking `backfillTikTokEmoji` once (non-dry-run), the response shape is `{ ok: true, scanned: <N>, updated: <M>, fields_cleaned: { title: <a>, author_name: <b>, summary: <c>, ... }, errors: [] }` with M > 0 (because the existing TikTok rows from Ms Verify's walk had emoji).
- Re-running `backfillTikTokEmoji` returns `{ ok: true, scanned: <N>, updated: 0, fields_cleaned: {}, errors: [] }` — confirming idempotence.
- The dashboard devtools check above returns `still_dirty: 0`.
- A subsequent ingest run that imports a feed item with an emoji-laden title writes a clean row: query `LifestyleItems.filter({...}, '-created_date', 1)` returns a row whose `title` is the original minus emoji.
- The `feedback_no_emoji_in_femwell.md` regex test — input `"Lift heavy \u{1F4AA} sleep deep \u{1F634} trust your gut \u{1FAF6}"` — returns `"Lift heavy sleep deep trust your gut"` after running through `stripEmoji`.

## §9 Risks + mitigations

1. **The regex range may not cover every Unicode emoji block** (e.g. flag emoji using regional indicator codepoints `U+1F1E6-U+1F1FF` fall inside `U+1F300-U+1F5FF` — covered. Skin-tone modifiers `U+1F3FB-U+1F3FF` — covered. ZWJ sequences glued by `U+200D` — the ZWJ itself is NOT stripped). Mitigation: the ZWJ joiner remains as an invisible character. Acceptable; the visible emoji parts are stripped. If the operator needs ZWJ removal too, add `\u{200D}` to the regex in a follow-up.
2. **Functions outside `base44/functions/` import path** — Deno is strict about relative imports. The `_shared/stripEmoji.ts` path must work from sibling function dirs (`../_shared/stripEmoji.ts`). Mitigation: verify by reading existing patterns in `base44/functions/`. If another function already does shared imports via a different convention, follow it.
3. **`backfillTikTokEmoji` may exceed the 3-minute base44 function cap** if `LifestyleItems` grows past ~5000 rows. Mitigation: hard cap at 5000 rows + page size 200 inside the function. Re-run with the same body if it stops short — idempotent.
4. **A scrub may inadvertently strip non-emoji glyphs that fall in those ranges.** Mitigation: the canonical regex from `feedback_no_emoji_in_femwell.md` has been used for ~6 weeks across the codebase. Any false positive would have surfaced already. Document the exact ranges in `src/utils/stripEmoji.js` so the next maintainer can audit.
5. **Local `stripEmoji` helpers from LC-1 + LC-3 may drift.** Mitigation: §4d removes the LC-1 local helper from `ingestSocial`. The LC-3 migration function defines its own — leave it for now; it uses the same regex, so functional outcome is identical. A future refactor MP can converge all callers on the shared import.

## §10 Rollback

If the scrub breaks rows (deletes legitimate non-emoji content): the backfill stores no diff before the write. Mitigation: before running the non-dry-run, the operator should export `LifestyleItems` from Dashboard → Data → Export CSV. To restore: re-import the CSV. To rollback the code: click `Revert` on the assistant message — this restores the local emoji helpers and removes the shared import.

If the new `backfillTikTokEmoji` function itself misbehaves: delete `base44/functions/backfillTikTokEmoji/entry.ts` in a follow-up commit. It is a one-shot operator-invoked function; no cron consumes it.

## §11 Sequence

LC-4 ships AFTER LC-1 because LC-1 is the function that starts writing fresh TikTok rows. The backfill is most useful when there are recent TikTok rows to clean. LC-4 is INDEPENDENT of LC-2 and LC-3, but the natural order remains:

LC-1 → LC-2 → LC-3 → **LC-4** → LC-5.

Done signal for LC-4: open `femwells.com/Lifestyle?tab=listen&filter=videos` on mobile + tablet + desktop. Every visible video card title is free of emoji glyphs. Run the dashboard-devtools programmatic check — `still_dirty` returns 0. Take three screenshots to `workspace/walk_lc4_20260513/`.
