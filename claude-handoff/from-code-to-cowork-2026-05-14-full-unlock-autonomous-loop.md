# Code → Cowork, 2026-05-14: full unlock — autonomous invocation loop is live

## TL;DR

Halli ran `base44 login` once + I installed Deno locally. Now Code-side can:

- ✅ Read any entity from live femwell (was already true via api_key)
- ✅ **Invoke any DEPLOYED admin function** via `base44 exec` (NEW)
- ✅ Read function logs via `base44 logs` (NEW)
- ❌ Deploy functions / publish app — blocked by base44: "*This endpoint is only available for Backend Platform apps*". Builder apps like femwell still need the Builder UI for publish. Visual walks still need Halli's eyes.

Two things shipped this session:
1. **9 PRACTICE rows in `LifestyleItems`** — `migrateSessionsToPractice {}` invoked, succeeded, 0 errors. PracticeRail on Lifestyle/Listen will render on next page load.
2. **seedPodcasts code fix** in repo (commit pending) — browser User-Agent + relaxed image-skip. **Awaits Cowork/Halli's next publish to take effect.**

## What works now and how

### Read commands (Code-side, instant, no auth UI):

```sh
node scripts/base44-cli.mjs whoami
node scripts/base44-cli.mjs count <Entity> [key=value ...]
node scripts/base44-cli.mjs list <Entity> [key=value ...] [--limit=N]
node scripts/base44-cli.mjs logs <function_name> [--limit=N]
node scripts/base44-cli.mjs orchestrator-phases
```

### Invoke commands (requires `base44 login` + Deno installed):

```sh
# One-line invoke, body = {}:
echo 'await base44.functions.invoke("<fn-name>", {})' | npx base44 exec

# Invoke with body + structured logging:
@'
const res = await base44.functions.invoke("<fn-name>", { dry_run: true });
const d = res?.data || res;
console.log(JSON.stringify({ ok: d?.ok, ... }));
'@ | npx base44 exec
```

PowerShell example used this session:

```powershell
@'
const res = await base44.functions.invoke("migrateSessionsToPractice", {});
const d = res?.data || res;
console.log("wellness_migrated:", d?.wellness_migrated);
'@ | npx -y base44 exec
```

### Setup steps for Cowork-side mirror (if you want it too):

1. `npm i -g base44` (or use `npx base44` like I do — no install needed)
2. `npx base44 login` — opens device-code-flow URL. You authorize once in browser. Token stored at `~/.base44/auth/auth.json`.
3. Install Deno if not present. Windows: `winget install DenoLand.Deno`. macOS: `brew install deno`.
4. `npx base44 exec` works.

For the read-only `scripts/base44-cli.mjs`, also create a Cowork-side `.env.local`:
```
BASE44_APP_ID=69a9891a6ccccc1822bbb4bc
BASE44_API_KEY=<halli's api key — see Code-side transcript or ask>
```

## Confirmed live state (via my CLI)

```
LifestyleItems where media_type=PODCAST   → count: 0
LifestyleItems where media_type=PRACTICE  → count: 9   ← just migrated
LifestyleItems where media_type=TIKTOK    → not yet checked
IngestErrorLog for seedPodcasts (prior run): 8 feed_fetch errors + 5 image_missing skips
```

## What I tried and what each surfaced

| Attempt | Result | Meaning |
|---|---|---|
| `base44 functions deploy seedPodcasts` | "This endpoint is only available for Backend Platform apps" | Builder apps can't deploy via CLI. Code-fix pushes via GitHub + your next Builder Publish. |
| `base44 deploy --yes` | Same error from entity-sync step | Top-level deploy also blocked. |
| `base44 exec` invoking `seedPodcasts {}` | **ok:true, 8 feed_fetch + 5 image_missing, 0 ingested** | Function exists + runs. The function code has bugs (fixed in repo, awaits publish). |
| `base44 exec` invoking `migrateSessionsToPractice {}` | **ok:true, wellness_migrated:9, errors:0** | LC-3 data migration done. |
| `base44 exec` invoking `pipelineOrchestrator {}` | **504 Timeout** | Orchestrator runs 8+ phases sequentially, base44 edge gateway caps ~30s. Individual phase invocation works; full orchestrator does not. |
| `base44 exec` invoking `backfillTikTokEmoji {}` | **404 "Deployment does not exist"** | My LC-4 function is in repo but never published. Awaits Builder Publish. |

## Two bugs that need Cowork's next publish

### Bug A: seedPodcasts — RSS feeds rejected + episodes skipped on missing image

Diagnosed by invoking `seedPodcasts {}` directly via base44 exec:
- 8/12 RSS feeds returned `feed_fetch` errors (Acast/Simplecast/Megaphone reject the bare `FemWell/1.0` UA)
- 4/12 succeeded but every episode skipped on `image_missing` hard-skip

Fix in repo (pending commit on top of this handoff):
- Swapped UA to the browser-shaped Chrome UA already used by `ingestRSS`
- Added `Accept: application/rss+xml, application/atom+xml, application/xml, text/xml, */*`
- Changed `image_missing` from hard-skip to soft-warn (write row with `image_url: ''`; `PodcastCard.getCategoryGradient` already renders a tasteful fallback)

After your next Publish picks this up, invoking `seedPodcasts {}` should return `episodes_ingested > 0`.

### Bug B: backfillTikTokEmoji + backfillYouTubeEmbeddability not deployed

LC-4's `backfillTikTokEmoji` (mine) and `backfillYouTubeEmbeddability` (yours, `57b9f2f`) are in the repo but the platform 404s on invoke. Same fix: next Publish lands them, then I can invoke + verify count drops to zero.

## What's still on Cowork (you)

1. **Publish** at https://app.base44.com/apps/69a9891a6ccccc1822bbb4bc/editor/preview when convenient. Bundles:
   - LC-4 backfill function (lands the deployment)
   - LC-5's `backfillLongreadsImages` (when I build it)
   - seedPodcasts UA + image-skip fix
   - Profile font fix
2. **After publish, ping me** in this thread (or just push a tombstone handoff). I'll then invoke:
   - `seedPodcasts {}` → verify podcasts count > 0
   - `backfillTikTokEmoji {}` → verify still_dirty = 0
   - `backfillYouTubeEmbeddability {}` → verify embeddability flags populated
   And run the diagnostic queries. No need for Halli at the dashboard.

## What's still on Halli (you)

1. **3-viewport visual walk** on `/Lifestyle?tab=listen` after publish — confirm rails render, no overflow, no emoji.
2. **Reload VS Code window** (Ctrl+Shift+P → "Developer: Reload Window") so the PowerShell allowlist edit I made earlier takes effect.
3. **Decide on the wider Playfair sweep** — 167 occurrences across 73 files (flagged in earlier handoff). Recommend an Mr Fix-it MP.

## What's now on me (Code) for next session

1. **`backfillLongreadsImages`** for LC-5 part C (server-side, mirrors LC-4 pattern, wires into orchestrator as weekly phase).
2. **After your next publish**, invoke the three queued backfills + seedPodcasts and report numbers.
3. **Wait for real Spotify URLs** before touching TodaysWeather.jsx (LC-5 part B).

— Code (2026-05-14)
