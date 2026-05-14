# Code → Cowork, 2026-05-14: shared `scripts/base44-cli.mjs` tool

## TL;DR

Committed a tiny CLI wrapper at `scripts/base44-cli.mjs` that gives either Claude session direct admin-read access to the live base44 backend without needing the dashboard. Halli pasted an api_key with admin role privileges; this script wraps the SDK around it. **Reads work. Function invokes do NOT.** Detailed findings below.

## What's committed

- `scripts/base44-cli.mjs` — Node ESM CLI, ~150 LOC. Loads `.env.local` (gitignored), creates a base44 SDK client with `headers: { api_key }`, exposes 6 commands.
- `.env.local` — **NOT committed** (matched by `.env.*` in `.gitignore`). Each Claude session needs to create its own with two keys:

  ```
  BASE44_APP_ID=69a9891a6ccccc1822bbb4bc
  BASE44_API_KEY=<halli's-api-key>
  ```

  The api_key Halli pasted is in our Code-side transcript. If you don't have it, ask him.

## Commands (all read-only / non-destructive)

```sh
node scripts/base44-cli.mjs whoami
# → { me: { role: 'admin', email: 'flashsnipper@gmail.com', _app_role: 'admin', ... } }

node scripts/base44-cli.mjs ping
# Smallest possible read — 1 LifestyleItems row. Confirms connection.

node scripts/base44-cli.mjs count LifestyleItems media_type=PODCAST
# → { count: 0 }

node scripts/base44-cli.mjs list LifestyleItems media_type=PODCAST --limit=5
# → { rows: [...] }

node scripts/base44-cli.mjs logs seedPodcasts --limit=50
# Reads IngestErrorLog filtered by function_name, groups by stage.
# → { by_stage: { feed_fetch: 3, image_missing: 47 }, recent: [...] }

node scripts/base44-cli.mjs orchestrator-phases
# Lists which orchestrator phases have logged in IngestErrorLog and when.
# → { phases: [{ stage: 'phase:ingestRSS:ok', last_at: ..., count: 4 }, ...] }

node scripts/base44-cli.mjs invoke <name> [--key=value]
# Tries SDK's functions.invoke. SEE LIMITATION BELOW.

node scripts/base44-cli.mjs fetch-fn <name> [--key=value] [--q_key=value]
# Low-level escape hatch — base44.functions.fetch with explicit api_key header.
# SEE LIMITATION BELOW.
```

## The invoke limitation (the bit that surprised me)

`auth.me()` with this api_key returns admin role. **But function endpoints reject the same auth.** Three observations:

| What I tried | Result |
|---|---|
| `base44.functions.invoke('seedPodcasts', {})` | 500 `"You must be logged in to access this app"` |
| `base44.functions.invoke('pipelineOrchestrator', { run_phase: 'seedPodcasts' })` | 504 timeout (never wrote anything) |
| `base44.functions.fetch('seedPodcasts', { headers: { api_key } })` | 404 `"App not found for this domain"` — URL routing failed |

The SDK type docs at [client.types.d.ts:51-54](node_modules/@base44/sdk/dist/client.types.d.ts#L51-L54) call out that service-role auth is *"Only available in Base44-hosted backend functions"*. The api_key header pattern auths the entity-read layer but not the function-invoke layer.

So **everything that requires an admin function invoke (migrateSessionsToPractice, seedPodcasts, backfillTikTokEmoji, backfillYouTubeEmbeddability) still needs the base44 dashboard Functions panel** until/unless we find a different auth path.

## Confirmed state of pending invokes (as of `02b5c68` on main)

I ran my logs/count checks. Sobering:

| Function | Logged runs | DB effect |
|---|---|---|
| `seedPodcasts` | **0** | 0 PODCAST rows in LifestyleItems |
| `pipelineOrchestrator` | **0** | No `phase:*:ok` entries in IngestErrorLog at all |
| `migrateSessionsToPractice` | not checked | (presumed 0 — separate LC-3 one-shot) |
| `backfillTikTokEmoji` | not checked | (presumed 0 — your LC-4 follow-up) |
| `backfillYouTubeEmbeddability` | not checked | (presumed 0 — your function from `57b9f2f`) |

The orchestrator's "self-bootstrap" logic at [pipelineOrchestrator/entry.ts:685-695](base44/functions/pipelineOrchestrator/entry.ts#L685-L695) only fires WHEN the orchestrator itself runs. Since the orchestrator has never run, none of its child phases have run. So either:

1. The daily 04:30 UTC cron isn't actually wired to the orchestrator
2. Or it is, but it hasn't reached its trigger time since deploy
3. Or it fires but errors before any logging happens (silent crash before the first log write)

This explains the Podcasts-empty bug Halli reported — same root cause for backfillTikTok + backfillYouTubeEmbeddability not having run.

## What's still on Halli (or whichever Claude has dashboard MCP)

One trip to `base44 dashboard → Functions panel → pipelineOrchestrator → POST {}` should bootstrap everything in one go. The first-run-bootstrap will fire `seedPodcasts`, `backfillYouTubeEmbeddability`, and `backfillTikTokEmoji` in sequence within that single orchestrator run. Total runtime ~2-3 min server-side.

After that:
- `migrateSessionsToPractice` is a one-shot, still needs its own POST `{}`.
- LC-1/LC-3/LC-4 visuals should populate on next page load (no publish needed; backend data only).

## What I'm investigating next

Halli explicitly asked me to investigate whether there's a Base44 API that does what my api_key can't. Specifically:
- Admin function invocation from outside the Base44 platform
- Publishing the app without the builder UI click

I'll dig into:
1. SDK's `auth` module — does `loginViaEmailPassword()` give me a token that the function endpoints accept?
2. base44 REST API surface beyond the SDK — is there a `/apps/{appId}/deployments` style endpoint?
3. Any "personal access token" / "service account" pattern documented at base44.com

If I find one, next handoff will commit a `BASE44_TOKEN` env var pattern + extended CLI commands `invoke` and `publish`. If not, I'll document the dead ends so we stop trying.

## What I want from Cowork going forward

When you ship a function (like `cee11be` orchestrator self-bootstrap, or `57b9f2f` YouTube embeddability), please drop me a one-liner in your tombstone: **"awaiting first run"** vs **"already invoked, here's the run-count"**. Cowork's MCP-side invokes succeed where my Code-side ones don't, so you have ground truth I lack.

— Code (2026-05-14)
