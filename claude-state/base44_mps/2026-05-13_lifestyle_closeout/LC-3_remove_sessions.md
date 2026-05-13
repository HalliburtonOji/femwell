# LC-3 — Remove Sessions: delete route + Listen chip + migrate audio rows to Practice shelf

> Paste everything below the rule into the base44 builder. Do NOT include this header.

---

## §1 Pre-flight (read first)

Read these files before editing:
- `src/pages/Sessions.jsx`
- `src/components/sessions/SessionDetailDialog.jsx` (just to confirm it exists; if so, it will be deleted alongside `Sessions.jsx`)
- `src/App.jsx` (Sessions route registration)
- `src/components/layout/MenuSheet.jsx` (Sessions entry in the bottom-sheet overflow nav)
- `src/components/layout/FloatingSidebar.jsx` (Sessions entry — dead code per master plan §3.5, but verify)
- `src/components/lifestyle/listen/ListenTab.jsx`
- `src/components/lifestyle/listen/ListenFilterChips.jsx`
- `src/components/lifestyle/listen/ListenGrid.jsx`
- `src/components/lifestyle/listen/SessionCard.jsx`
- `base44/entities/LifestyleItems.jsonc` (verify `media_type` enum and `content_type`)
- `base44/entities/ContentItems.jsonc` (the kitchen-sink entity the old Sessions chip pulled from)
- `base44/entities/WellnessSessions.jsonc` (the actual audio-session entity)

Pre-flight investigation steps the base44 agent runs before editing (DO these and report counts back in the assistant message before any code edit fires):

1. **Grep Sessions references:**
   ```sh
   rg -n "Sessions" src/App.jsx src/pages.config.js src/components/layout/ src/components/lifestyle/
   ```
   Expected hits to enumerate:
   - `src/App.jsx` line ~26 (import) + ~135 (Route element) — both to be removed.
   - `src/components/layout/FloatingSidebar.jsx` line 14 — to be removed.
   - `src/components/layout/MenuSheet.jsx` lines 15 + 45 — both to be removed.
   - `src/components/lifestyle/listen/ListenFilterChips.jsx` line 7 — Sessions chip to be removed.
   - `src/components/lifestyle/listen/ListenTab.jsx` — `fetchGridItems('sessions', ...)` branch + `fetchAllChip` + `_isSession` flag — all to be removed.
   - `src/components/lifestyle/listen/SessionCard.jsx` — file to be deleted.
   - `src/components/lifestyle/listen/ListenGrid.jsx` — any Session-card render branch to be removed.

2. **Inventory the data:**
   - `ContentItems` (the entity the old Sessions chip pulled from via `ContentItems.filter({}, '-created_date', 24)`). Per Ms Verify's 2026-05-13 walk: 28 rows leaked under the Sessions label — 12 zodiac horoscopes, 5 news articles, 4 fiction episodes, 3 actual audio sessions. Run `base44.entities.ContentItems.list().then(r => console.table(r.map(x => ({ id: x.id, type: x.content_type, title: (x.title||'').slice(0,40) }))))` in dashboard devtools, OR query via `mcp__9d…__query_entities` if available, to confirm counts.
   - `WellnessSessions` — the actual yoga/meditation/pilates/cardio entity that powers `src/pages/Sessions.jsx`. Likely 5-30 rows. List them via the dashboard Data view.

3. **Check no other surface consumes `ContentItems` or `WellnessSessions`:**
   ```sh
   rg -n "ContentItems\.|WellnessSessions\." src/
   ```
   Report the full hit list. If any surface OTHER than Sessions.jsx + ListenTab.jsx consumes them (e.g. Today.jsx, ForYouTab.jsx, ProgramsHub.jsx, Programs.jsx), STOP and surface to the user before deleting — those consumers need their own clean-up MP and LC-3's scope must shrink.

Confirm schema state:
- `LifestyleItems.media_type` enum currently includes `ARTICLE, VIDEO, TIKTOK, INSTAGRAM, CLIP, PODCAST`. **Does NOT include `PRACTICE`. Must be widened** (see §5).
- `LifestyleItems` has fields `audio_url`, `duration_seconds`, `image_url`, `summary` already (`audio_url` added in LC-1; if LC-1 has not shipped yet, this MP also adds it — but the agent should NOT add it twice).
- `LifestyleSources.source_type` enum: confirm `MANUAL` is a valid value (it is). Used for migrated audio rows.

HEAD SHA expected: after LC-1 + LC-2 ship, otherwise `dd5eec9`. **LC-3 should ship after LC-1 because LC-1 introduces `audio_url`. If LC-1 has not yet shipped, this MP also adds `audio_url` — but a defensive read of the schema first means the agent can detect and skip.**

Live state (per Ms Verify 2026-05-13): `/Sessions` route renders. Menu sheet shows "Sessions" with Headphones icon. Listen tab Sessions chip shows 28 mixed-content rows from `ContentItems`. The 3 real audio sessions visible were "Grounding Calm 6 MIN", "Sleep Deep 20 MIN", "Anxiety Reset 3 MIN".

## §2 Goal (one sentence)

Delete the Sessions route + Menu link + Listen Sessions chip, migrate any genuinely-audio rows (meditation / breath / body scan) from `WellnessSessions` and `ContentItems` into `LifestyleItems` with `media_type='PRACTICE'`, and render a new "Practice" shelf below the LC-1 Podcasts shelf on the Listen tab.

## §3 Constraints (binding)

- UK English. £. en-GB dates. No emoji codepoints anywhere.
- Lucide icons + SVG only. Fraunces + Inter only. No Playfair, no `#C084FC`.
- Same 5-slot unified bottom nav across viewports — no desktop sidebar substitution.
- DO NOT modify `src/Layout.jsx`, `src/pages.config.js`, `src/components/ui/**`.
- DO NOT delete `WellnessSessions` entity or `ContentItems` entity — just stop reading from them on Listen, and migrate the rows we keep into `LifestyleItems`. The entities may have other consumers we will sweep later.
- DO NOT touch the bottom nav 5-slot pattern. Sessions wasn't in the bottom nav anyway.
- Practice cards reuse the LC-1 PodcastCard look-and-feel: artwork + duration chip + save heart + tap-to-open sheet with in-app audio player. No fresh visual language.
- Discoverability: keep `WellnessSessions` data accessible via Programs or the Profile → Practice surface elsewhere — but that is OUT OF SCOPE for LC-3. This MP only handles the Listen-tab and route deletion.

## §4 Diff plan (file-by-file)

| Path | Action | One-line description |
|---|---|---|
| `src/App.jsx` | EDIT | Remove the `import Sessions from './pages/Sessions'` and the `<Route path="/Sessions" ...>` element. |
| `src/pages/Sessions.jsx` | DELETE | Page no longer exists. |
| `src/components/sessions/SessionDetailDialog.jsx` | DELETE | Its only consumer is Sessions.jsx. |
| `src/components/layout/MenuSheet.jsx` | EDIT | Remove the Sessions entry at line 15 (route list) and line 45 (label list). |
| `src/components/layout/FloatingSidebar.jsx` | EDIT | Remove the Sessions entry at line 14. |
| `src/components/lifestyle/listen/ListenFilterChips.jsx` | EDIT | Remove the `{ id: 'sessions', label: 'Sessions' }` entry. Replace with `{ id: 'practice', label: 'Practice' }`. |
| `src/components/lifestyle/listen/ListenTab.jsx` | EDIT | Drop the Sessions branch in `fetchGridItems`, drop `fetchAllChip` ContentItems leg, drop `_isSession`, add a `practiceItems` state + fetch + render `<PracticeRail/>`. |
| `src/components/lifestyle/listen/SessionCard.jsx` | DELETE | Replaced by `PracticeCard` inside the new `PracticeRail.jsx`. |
| `src/components/lifestyle/listen/PracticeRail.jsx` | NEW | Mirrors `PodcastRail.jsx` (from LC-1). Renders Practice cards. |
| `src/components/lifestyle/listen/ListenGrid.jsx` | EDIT | Remove any Session-card branch (search for `_isSession` and `<SessionCard`). Keep Video + Podcast cards intact. |
| `base44/entities/LifestyleItems.jsonc` | EDIT | Add `PRACTICE` to the `media_type` enum. |
| `base44/functions/migrateSessionsToPractice/entry.ts` | NEW | One-shot operator-invoked migration: read WellnessSessions + qualifying ContentItems → write LifestyleItems with `media_type='PRACTICE'`; archive originals via `is_deleted=true` on ContentItems audio rows, and leave WellnessSessions untouched (still consumed elsewhere). |

### §4a Edit: `src/App.jsx`

Remove the import line near line 26:
```js
import Sessions from './pages/Sessions';
```
Remove the route element near line 135:
```jsx
<Route path="/Sessions" element={<LayoutWrapper currentPageName="Sessions"><Sessions /></LayoutWrapper>} />
```

If the file uses lazy imports or registered-pages config, only remove the Sessions entry — leave every other route intact.

### §4b Delete files

```
src/pages/Sessions.jsx
src/components/sessions/SessionDetailDialog.jsx
src/components/lifestyle/listen/SessionCard.jsx
```

If `src/components/sessions/` directory becomes empty after deletion, delete the directory as well.

### §4c Edit: `src/components/layout/MenuSheet.jsx`

Line 15 — remove `/Sessions` from the route list:
```js
"/Pulse", "/Planner", "/ProgramsHub", "/Sessions", "/SkinHair",
```
becomes:
```js
"/Pulse", "/Planner", "/ProgramsHub", "/SkinHair",
```

Line 45 — remove the menu entry:
```js
{ label: "Sessions",    icon: Headphones, route: "/Sessions" },
```
Delete the entire line. Keep every other menu entry intact. If `Headphones` is no longer used after the deletion, remove the `Headphones` import too.

### §4d Edit: `src/components/layout/FloatingSidebar.jsx`

Line 14 — remove:
```js
{ label: "Sessions",  icon: Play,         page: "Sessions" },
```
Delete the entire line. If `Play` is no longer imported anywhere else in the file, remove the import too. (Per `feedback_femwell_multiplatform.md`, this file is dead code at desktop — but it still mounts on mobile in some flows. The line removal is required.)

### §4e Edit: `src/components/lifestyle/listen/ListenFilterChips.jsx`

Replace the `CHIPS` array (lines 3-8) with:
```js
const CHIPS = [
  { id: 'all',      label: 'All' },
  { id: 'videos',   label: 'Videos' },
  { id: 'podcasts', label: 'Podcasts' },
  { id: 'practice', label: 'Practice' },
];
```

### §4f Edit: `src/components/lifestyle/listen/ListenTab.jsx`

Multiple changes. Step-by-step:

1. **Imports.** Add:
   ```js
   import PracticeRail from './PracticeRail';
   ```

2. **`fetchGridItems`** (lines 9-35). Replace entirely with:
   ```js
   async function fetchGridItems(chip, lifestyleProfile) {
     const baseFilter = { status: 'PUBLISHED' };
     let mediaFilter;
     if (chip === 'all') {
       mediaFilter = { media_type: { $in: ['VIDEO', 'PODCAST', 'PRACTICE'] } };
     } else if (chip === 'videos') {
       mediaFilter = { media_type: 'VIDEO' };
     } else if (chip === 'podcasts') {
       mediaFilter = { media_type: 'PODCAST' };
     } else if (chip === 'practice') {
       mediaFilter = { media_type: 'PRACTICE' };
     } else {
       return [];
     }
     const items = await base44.entities.LifestyleItems.filter(
       { ...baseFilter, ...mediaFilter },
       '-published_at',
       24,
     ).catch(() => []);
     const hidden = new Set((lifestyleProfile?.hidden_item_ids) || []);
     const blocked = new Set((lifestyleProfile?.blocked_categories) || []);
     return (items || []).filter(it => !hidden.has(it.id) && !blocked.has(it.category));
   }
   ```

3. **`fetchAllChip`** (lines 37-52). Delete entirely. The `all` branch now lives inside `fetchGridItems` with `$in: [VIDEO, PODCAST, PRACTICE]`.

4. **`initChip`** (lines 55-59). Update the valid array:
   ```js
   const valid = ['all', 'videos', 'podcasts', 'practice'];
   ```

5. **State.** Add near the `podcastItems` state from LC-1:
   ```js
   const [practiceItems, setPracticeItems] = useState([]);
   ```

6. **Rail fetch effect.** Extend the LC-1 effect to also fetch practice:
   ```js
   useEffect(() => {
     let cancelled = false;
     (async () => {
       const [tiktoks, podcasts, practice] = await Promise.all([
         base44.entities.LifestyleItems.filter(
           { media_type: 'TIKTOK', is_embeddable: true, status: 'PUBLISHED' },
           '-published_at', 12,
         ).catch(() => []),
         base44.entities.LifestyleItems.filter(
           { media_type: 'PODCAST', status: 'PUBLISHED' },
           '-published_at', 12,
         ).catch(() => []),
         base44.entities.LifestyleItems.filter(
           { media_type: 'PRACTICE', status: 'PUBLISHED' },
           '-published_at', 12,
         ).catch(() => []),
       ]);
       if (!cancelled) {
         setTikTokItems(tiktoks || []);
         setPodcastItems(podcasts || []);
         setPracticeItems(practice || []);
       }
     })();
     return () => { cancelled = true; };
   }, []);
   ```

7. **`fetchAllChip` callsite.** Inside the `useEffect` that fetches the grid when chip changes (lines 114-141), remove the `fetchAllChip` branch:
   ```js
   const data = await fetchGridItems(activeChip, lifestyleProfile);
   ```

8. **Render.** Add `<PracticeRail/>` between Podcasts and TikTok (or below TikTok — pick: per the master plan, audio-focused content cascades together, so order should be Podcasts → Practice → TikTok). Replace the JSX from LC-1 with:
   ```jsx
   <div style={{ marginTop: 16 }}>
     <PodcastRail
       items={podcastItems}
       savedSet={savedSet}
       savedPhases={savedPhases}
       onSave={handleSave}
       onUntag={handleUntag}
     />
     <PracticeRail
       items={practiceItems}
       savedSet={savedSet}
       savedPhases={savedPhases}
       onSave={handleSave}
       onUntag={handleUntag}
     />
     <TikTokRail
       items={tikTokItems}
       savedSet={savedSet}
       savedPhases={savedPhases}
       onSave={handleSave}
       onUntag={handleUntag}
     />
     <ListenGrid
       items={gridItems}
       activeChip={activeChip}
       onSave={handleSave}
       onUntag={handleUntag}
       savedSet={savedSet}
       savedPhases={savedPhases}
       loading={loading}
       error={error}
       onRetry={handleRetry}
     />
   </div>
   ```

9. **`handleRetry`.** Drop the `fetchAllChip` reference:
   ```js
   const handleRetry = () => {
     setError(false);
     setLoading(true);
     (async () => {
       try {
         const data = await fetchGridItems(activeChip, lifestyleProfile);
         setGridItems(data || []);
       } catch {
         setError(true);
       } finally {
         setLoading(false);
       }
     })();
   };
   ```

### §4g New file: `src/components/lifestyle/listen/PracticeRail.jsx`

This file mirrors LC-1's `PodcastRail.jsx` 1:1. Copy the file from LC-1 verbatim, then:
- Rename the default export from `PodcastRail` to `PracticeRail`.
- Change the eyebrow text from `PODCASTS WE'RE LISTENING TO` to `PRACTICE FOR TODAY`.
- Change the card-corner pill from `PODCAST` to `PRACTICE`.
- In the sheet's source-line, render `item.duration_label || formatDuration(item.duration_seconds)` next to `item.source_name`. Practice rows typically come from `WellnessSessions` migrations and may not have a podcast `source_name`; fall back to "FemWell Practice".
- The `audio_url` / `episode_url` fallback logic is unchanged from LC-1 (practice rows have `audio_url` from migration; if missing, sheet shows summary + duration only).

### §4h Edit: `src/components/lifestyle/listen/ListenGrid.jsx`

Search the file for `_isSession` or `SessionCard`. Remove any branch that renders `<SessionCard/>`. Keep the video/podcast/practice card render path. Since all three media types share a similar card shape, a single `LifestyleItemCard` likely suffices. Verify with a focused grep before editing.

### §4i New file: `base44/functions/migrateSessionsToPractice/entry.ts`

```ts
// migrateSessionsToPractice — one-shot operator-invoked migration.
// Sweeps two source entities into LifestyleItems with media_type='PRACTICE':
//   1. WellnessSessions: every row with category in [Meditation, Yoga, Pilates]
//      AND duration_minutes > 0 AND audio_url set → write a LifestyleItems row.
//   2. ContentItems: every row with content_type in ['audio_session','breath','body_scan']
//      AND audio_url set → write a LifestyleItems row + soft-archive original
//      (set is_deleted=true on the source ContentItems row).
// Idempotent — re-running upserts on a content_url_hash derived from origin id.
//
// Body (admin-only):
//   POST {} — full migration.
//   POST { dry_run: true } — counts only, no writes.
// Returns: { ok, wellness_migrated, content_migrated, content_archived, skipped, errors }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function simpleHash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

function stripEmoji(s: string): string {
  if (!s) return '';
  return String(s).replace(
    /[\u{2600}-\u{27BF}\u{1F300}-\u{1FAFF}\u{1F900}-\u{1F9FF}\u{2700}-\u{27BF}\u{1FA70}-\u{1FAFF}\u{1F680}-\u{1F6FF}\u{1F300}-\u{1F5FF}]/gu,
    '',
  ).replace(/\s+/g, ' ').trim();
}

const PRACTICE_CONTENT_TYPES = new Set([
  'audio_session', 'breath', 'body_scan', 'meditation', 'breathwork',
]);
const PRACTICE_WELLNESS_CATEGORIES = new Set([
  'Meditation', 'Yoga', 'Pilates',
]);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (me?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = !!body?.dry_run;

    const sb = base44.asServiceRole;
    const now = new Date().toISOString();
    let wellnessMigrated = 0;
    let contentMigrated = 0;
    let contentArchived = 0;
    let skipped = 0;
    const errors: any[] = [];

    // 1. WellnessSessions — bring forward as PRACTICE rows.
    const wellness = await sb.entities.WellnessSessions.list('-created_date', 200).catch(() => []);
    for (const ws of wellness || []) {
      try {
        const cat = ws?.category || '';
        if (!PRACTICE_WELLNESS_CATEGORIES.has(cat)) { skipped += 1; continue; }
        const audio = ws?.audio_url || '';
        const minutes = Number(ws?.duration_minutes) || 0;
        if (!audio && minutes <= 0) { skipped += 1; continue; }

        const hash = simpleHash(`wellness:${ws.id}`);
        const dupe = await sb.entities.LifestyleItems.filter(
          { content_url_hash: hash }, undefined, 1,
        ).catch(() => []);
        if (dupe.length > 0) { skipped += 1; continue; }

        if (dryRun) { wellnessMigrated += 1; continue; }

        await sb.entities.LifestyleItems.create({
          source_id: '',
          source_name: 'FemWell Practice',
          title: stripEmoji(ws.title || ws.name || 'Practice').slice(0, 220),
          content_url: audio || `femwell://practice/${ws.id}`,
          content_url_hash: hash,
          summary: stripEmoji(ws.description || ''),
          image_url: ws.image_url || '',
          audio_url: audio,
          duration_seconds: minutes * 60,
          duration_label: minutes ? `${minutes} MIN` : '',
          category: cat === 'Meditation' ? 'Mindfulness' : 'Lifestyle',
          media_type: 'PRACTICE',
          provider: 'BLOG',
          status: 'PUBLISHED',
          tags: ['practice', String(cat).toLowerCase()],
          published_at: ws.created_date || now,
          ingested_at: now,
          created_at: now,
        });
        wellnessMigrated += 1;
      } catch (err: any) {
        errors.push({ source: 'wellness', id: ws?.id, error: err?.message || String(err) });
      }
    }

    // 2. ContentItems — bring forward genuinely-audio rows; soft-archive the rest stays.
    //    We only sweep audio-typed rows. Zodiac horoscopes, news, fiction stay in ContentItems.
    const content = await sb.entities.ContentItems.list('-created_date', 500).catch(() => []);
    for (const ci of content || []) {
      try {
        const ct = String(ci?.content_type || '').toLowerCase();
        if (!PRACTICE_CONTENT_TYPES.has(ct)) { skipped += 1; continue; }
        const audio = ci?.audio_url || ci?.url || '';
        if (!audio) { skipped += 1; continue; }

        const hash = simpleHash(`content:${ci.id}`);
        const dupe = await sb.entities.LifestyleItems.filter(
          { content_url_hash: hash }, undefined, 1,
        ).catch(() => []);
        if (dupe.length > 0) { skipped += 1; continue; }

        if (dryRun) { contentMigrated += 1; continue; }

        const seconds = Number(ci?.duration_seconds) || (Number(ci?.duration_minutes) || 0) * 60;
        await sb.entities.LifestyleItems.create({
          source_id: '',
          source_name: 'FemWell Practice',
          title: stripEmoji(ci.title || 'Practice').slice(0, 220),
          content_url: audio,
          content_url_hash: hash,
          summary: stripEmoji(ci.summary || ci.description || ''),
          image_url: ci.image_url || '',
          audio_url: audio,
          duration_seconds: seconds,
          duration_label: seconds ? `${Math.round(seconds / 60)} MIN` : '',
          category: 'Mindfulness',
          media_type: 'PRACTICE',
          provider: 'BLOG',
          status: 'PUBLISHED',
          tags: ['practice', ct],
          published_at: ci.created_date || now,
          ingested_at: now,
          created_at: now,
        });
        contentMigrated += 1;

        // Soft-archive the source row.
        try {
          await sb.entities.ContentItems.update(ci.id, { is_deleted: true });
          contentArchived += 1;
        } catch { /* non-fatal — migration row exists either way */ }
      } catch (err: any) {
        errors.push({ source: 'content', id: ci?.id, error: err?.message || String(err) });
      }
    }

    return Response.json({
      ok: true,
      dry_run: dryRun,
      wellness_migrated: wellnessMigrated,
      content_migrated: contentMigrated,
      content_archived: contentArchived,
      skipped,
      errors: errors.slice(0, 20),
    });
  } catch (err: any) {
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
});
```

## §5 Schema changes

### `base44/entities/LifestyleItems.jsonc`

Widen the `media_type` enum to add `PRACTICE`:

```jsonc
"media_type": {
  "type": "string",
  "enum": [
    "ARTICLE",
    "VIDEO",
    "TIKTOK",
    "INSTAGRAM",
    "CLIP",
    "PODCAST",
    "PRACTICE"
  ],
  "default": "ARTICLE"
},
```

If LC-1 has not yet shipped, also add `audio_url` and `episode_url` per LC-1 §5. Pre-flight check: read the current file. If `audio_url` is already present, skip; otherwise add per LC-1.

No required-array changes. No RLS changes.

## §6 LLM prompt changes

None. No LLM-using function changes.

## §7 Visual acceptance test (per viewport)

Walk femwells.com on each viewport preset.

- **Mobile (toggle → Mobile, ~380px):**
  - `https://femwells.com/Sessions` → 404 OR redirects to the app root. The route MUST NOT render a Sessions page.
  - `/Menu` (drag the bottom sheet) → the overflow nav contains Nutrition, Programs, Planner, SkinHair, Community, Journal, Pulse, Life Stage, Settings, Panic Mode, Onboarding. NO "Sessions" entry.
  - `/Lifestyle?tab=listen` → filter chips read: All · Videos · Podcasts · Practice. NO "Sessions" chip. Practice chip selects → grid shows Practice items (≥3 if migration ran, empty state otherwise).
  - Above the grid, three rails stack: PODCASTS WE'RE LISTENING TO → PRACTICE FOR TODAY → TRENDING ON TIKTOK. Each non-empty after LC-1 + LC-3 ship.
- **Tablet (toggle → Tablet, ~768px):** Same content, rails width-constrained to ~600-720px wrapper centred. No horizontal page scroll.
- **Desktop (toggle → Desktop, ~1280px):** Same — width-constrained centred column, NO sidebar substitution. The legacy `FloatingSidebar` `Sessions` entry is removed (dead code on desktop anyway, but the line is gone).

Brand checks:
- No emoji codepoints anywhere on the Listen tab DOM.
- Practice card pill says `PRACTICE`, not `SESSION`.
- The string "Sessions" returns 0 matches across the Listen tab + Menu sheet DOM.
- `document.querySelectorAll('[data-chip="sessions"]')` returns length 0.

## §8 Success criteria (falsifiable)

- `git ls-files | grep -E 'src/pages/Sessions.jsx|src/components/sessions/'` returns nothing. The Sessions page and its detail dialog no longer exist in the tree.
- `rg "/Sessions" src/` returns 0 hits (no remaining links).
- `rg "label: 'Sessions'" src/` returns 0 hits.
- `rg "_isSession|SessionCard" src/` returns 0 hits.
- `base44.entities.LifestyleItems.filter({ media_type: 'PRACTICE' }).then(r => r.length)` returns ≥ 3 after a non-dry-run of `migrateSessionsToPractice`.
- `base44.entities.ContentItems.list().then(r => r.filter(x => ['audio_session','breath','body_scan'].includes((x.content_type||'').toLowerCase())).length)` returns 0 active rows (all migrated + soft-archived).
- Navigating to `https://femwells.com/Sessions` returns a 404 or redirects to the app root.

## §9 Risks + mitigations

1. **`WellnessSessions` might be consumed elsewhere** (Programs, Profile, Today's QuickActions). Mitigation: the migration COPIES rows into LifestyleItems; it does NOT delete the WellnessSessions originals. Existing consumers keep working. Only `ContentItems` audio rows are soft-archived, and the pre-flight grep in §1 step 3 catches any non-Listen consumer.
2. **`ContentItems` is the kitchen-sink entity that also held zodiac horoscopes + news + fiction.** Mitigation: the migration only sweeps rows whose `content_type` is in the strict whitelist `[audio_session, breath, body_scan, meditation, breathwork]`. The other 25 rows from Ms Verify's walk stay in `ContentItems` — they were already not the right shape for Listen, but they were never meant to live in Listen. Their non-Listen surfaces (if any) are unaffected.
3. **Stale URL state.** A user with `?filter=sessions` in their URL would have selected an invalid chip. Mitigation: the `initChip` valid list no longer includes `sessions`, so the URL falls through to `all`. No crash.
4. **The `Headphones` lucide icon import in `MenuSheet.jsx` becomes unused.** Mitigation: explicit instruction to remove it in §4c step 2. Otherwise vite will warn, build still passes.
5. **The migration function double-runs.** Mitigation: idempotent — each call upserts on `content_url_hash` derived from origin id. Second run skips everything.
6. **`is_deleted: true` on `ContentItems` may not exist on the schema.** Mitigation: `is_deleted` is a base44-platform-managed soft-delete field on every entity (per `research_base44_platform.md` §4.2 — "Built-in fields you must NOT redefine: ... and `is_deleted`"). It works on any entity. Confirmed.

## §10 Rollback

If the migration produces malformed rows: in Dashboard → Data → `LifestyleItems`, filter `media_type=PRACTICE AND created_at >= <migration timestamp>`, select all, Delete. Then in `ContentItems` filter `is_deleted=true AND updated_date >= <migration timestamp>` and set `is_deleted=false` to restore the originals. To rollback the code: click `Revert` on the assistant message — this restores Sessions.jsx + the Menu/Sidebar entries + the Sessions chip in one snapshot.

If the rollback restores Sessions.jsx but the migration already deleted rows from `ContentItems`: this MP only **soft-archives** ContentItems (sets `is_deleted=true`), so a single dashboard-side bulk-update of `is_deleted=false` restores them. WellnessSessions rows are never touched.

To roll back the schema: in `base44/entities/LifestyleItems.jsonc` remove `PRACTICE` from the `media_type` enum. Existing rows with `media_type='PRACTICE'` will start failing validation on update — bulk-delete them or first patch them to a valid value (`ARTICLE`) before removing the enum value.

## §11 Sequence

LC-3 ships after LC-1 (because LC-1 introduces `audio_url` on `LifestyleItems` and the new PodcastRail; LC-3's PracticeRail mirrors that file). LC-2 is independent and can run before or after LC-3.

Run order: LC-1 → LC-2 → **LC-3** → LC-4 → LC-5.

Done signal for LC-3: open `femwells.com/Lifestyle?tab=listen` on mobile + tablet + desktop. Chips read All / Videos / Podcasts / Practice. Three rails above the grid (Podcasts, Practice, TikTok) — at least 3 cards in Practice. Navigate to `/Sessions` → 404 or redirect. Take three screenshots to `workspace/walk_lc3_20260513/`.
