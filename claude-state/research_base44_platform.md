# Base44 Platform Knowledge — FemWell Operator Playbook

> Compiled 2026-05-13 by Ms Deep Search. Sources at the bottom. Anything tagged
> **[walked]** was verified by a Chrome MCP / computer-use screenshot of the live
> builder. Anything tagged **[docs]** comes from `docs.base44.com`. Anything
> tagged **[discovered — verify]** is inferred from the live UI but not in the
> public docs; treat as a working hypothesis until re-confirmed.

---

## 0. How to use this file

1. Before drafting a mega-prompt, scan §3 (prompt format), §4 (file layout), and
   §9 (MP vs direct-edit decision tree).
2. Before *running* an MP, copy the template in §10, fill it in, and paste into
   the chat input documented in §2.5.
3. After running, follow §5 (sync + publish) to verify the change reached
   `femwells.com`.
4. If something hangs, jump to §8 (gotchas).

---

## 1. Platform overview

### 1.1 What Base44 is
Base44 is an AI-powered full-stack app builder. You describe what you want in a
chat panel, an agent edits a real React/Vite codebase, and Base44 hosts the
result on `<slug>.base44.app` (with optional custom domain). The platform was
**acquired by Wix in June 2025 for $80M** [docs/web]; it now sits inside the
Wix ecosystem but is run as a standalone product — the editor is still
`app.base44.com`, not Wix Studio.

Three editor surfaces matter for operators:

- **AI chat panel** (left rail in the editor) — natural language prompts.
- **Preview iframe** (right of the chat) — live render of the current code.
- **Dashboard tab** (toggle at the top) — Data, Automations, Users, Security,
  API, GitHub, Logs, Email, Settings.

### 1.2 Runtime stack
From FemWell's `package.json` and `vite.config.js`:

- **Frontend**: React 18.2 + Vite 6.1 + Tailwind 3.4 + shadcn/ui (Radix
  primitives) + framer-motion 11 + react-router-dom 6.26 + zustand-style
  hooks-only state. TypeScript optional (FemWell uses `.jsx` with
  `checkJs: true` in `jsconfig.json`).
- **Vite plugin**: `@base44/vite-plugin` ^1.0.16 — injects HMR notifier,
  navigation notifier, analytics tracker, and a *visual edit agent* into the
  preview iframe so the builder can `Ctrl+click`-edit elements directly.
- **SDK**: `@base44/sdk` ^0.8.27 (FemWell pins backend functions to
  `0.8.25` via `npm:@base44/sdk@0.8.25` imports — keep the pin consistent
  across functions or you'll burn time debugging SDK drift).
- **Backend functions**: **Deno** runtime [docs]. Each function is
  `base44/functions/<name>/entry.ts` and uses `Deno.serve()`. NPM imports use
  the `npm:` prefix. `console.log` lands in the Logs surface.
- **Database / entities**: Base44 managed Postgres-ish store. JSON-schema
  defines tables. CRUD via `base44.entities.X.{list,filter,get,create,
  update,delete,bulkCreate,bulkUpdate,updateMany,deleteMany,subscribe,
  importEntities}` [docs].
- **MCP**: Base44 exposes an MCP server at `app.base44.com/mcp` so external AI
  assistants (Claude Desktop, Cursor) can manage apps [docs/changelog
  2026-02-23]. There is *also* a docs MCP server.

### 1.3 Hosting / domain
- Each app has a `<slug>.base44.app` URL. For FemWell the slug surfaces as
  `fem-well.base44.app` (legacy) / the current deployed asset — both serve the
  published bundle.
- Custom domain (FemWell uses **`femwells.com`**) is configured under
  **Dashboard → Settings → Domains**. DNS is pointed at Base44; Base44 issues
  a TLS cert and proxies. The custom-domain alias and the `.base44.app`
  hostname *coexist* — both serve the same bundle.
- Publishing is an explicit step (see §5.3). A `git push` to `main` does
  **not** publish to femwells.com on its own; it syncs into the builder and
  the user must click **Publish App**.

---

## 2. The builder UI — surface by surface [walked]

URL on entry: `https://app.base44.com/apps/<app-id>/editor/preview`

For FemWell: `https://app.base44.com/apps/69a9891a6ccccc1822bbb4bc/editor/preview`

> **Caveat on screenshots**: the Chrome MCP execution context inside the
> builder is bound to the preview iframe's frame (which reports a 325×48
> viewport because it's sized as a mobile preview by default). Coordinates
> below come from full-display computer-use screenshots at 1389×868. Reference
> screenshot: a computer-use screenshot taken while the editor was on
> `/Lifestyle` showed the layout described below; the assistant could read it
> but the sandbox isn't able to write image files for the user.

### 2.1 Top header (row 1, y ≈ 110-160)

Left to right:
1. **Workspace logo** (orange dot, x≈65) — clicking opens **workspace
   switcher / account menu**.
2. **App name + workspace** (`FemWell` / `Flashsnipper's Workspace`,
   x≈115-330) — clicking opens the app-picker.
3. **History clock icon** (x≈365) — opens **Version History** dropdown. Each
   row is a snapshot (auto-versioned per AI message). Hovering shows a
   preview; clicking **Revert** restores. Versions from before the GitHub
   connection were created are *not* recoverable [docs/github-integration].
4. **Collapse-chat arrow** (x≈413) — hides the chat rail, expands the preview.
5. **Preview / Dashboard tabs** (x≈465-595) — switches the right pane between
   the live preview iframe and the dashboard surface.
6. **F+ chip** (avatar + plus, x≈1035) — invite collaborators.
7. **... More options** (x≈1090) — opens a kebab menu (Files used in this
   page, Project settings, Connect GitHub link, etc.) [docs/code-tab].
8. **Lightning bolt** (x≈1130, green dot when active) — opens **Suggestions**
   pop-up (auto-generated improvement ideas like "Add Data Exporting").
9. **Upgrade plan** orange button (x≈1175) — pricing modal.
10. **Publish App** black button (x≈1320) — opens the publish dialog (§2.6).

### 2.2 Left chat rail (y > 160, x: 50-395, ~340 px wide)

- **Conversation transcript** — assistant + user messages, with per-message
  affordances:
  - `... More options` on each user message → "Credits Used" (copy that
    exact number per prompt to size future prompts).
  - `Revert` button next to each agent message → rolls the codebase back to
    *before* that agent run. Includes a diff preview.
  - `Show more` reveals full agent reasoning + the list of files edited.
  - `Thought for Ns` collapses agent reasoning trace.
  - `Preview screenshot ready` — agent's automated screenshot after the
    edit, used to verify outcome.
- **Suggestions strip** (bottom of transcript when present) — clickable
  pills like "Add Natal Chart Visualization", "Enable Personalized…". Click =
  pre-fill the chat input with the suggestion's prompt.
- **Chat input** (`textarea`, y≈800-900):
  - Placeholder rotates between `What would you like to discuss?` (Discuss
    mode) and `What would you like to change?` (Edit mode).
  - Mode toggle = the two pills below the textarea: `✨ Edit` (default) and
    `💬 Discuss`. **Discuss does NOT burn credits**; use it for planning
    [docs/credits].
  - `⚙` gear (bottom-left of input) — chat settings.
  - `+` upload icon — attach files (CSV/JSON/Excel/.json for entity import;
    images for visual ref). Same affordance as `Upload files` in docs.
  - `🎤` voice input.
  - Big `→` purple send button (or `Processing…` button when busy).
  - When a long agent run is in progress, a **"Continue in background"**
    button appears at the top of the textarea so you can navigate away.

### 2.3 Left far-rail icons (column at x≈18, vertical)

Small icon column. Top to bottom (FemWell-instance, [walked]):

- Workspace logo
- Conversation history
- Files (multi-conversation)
- Recent builds / orange dots indicating builds in progress
- Globe icon (appears after switching to Edit mode) → live site / published
  state
- `+ New conversation` at the bottom

### 2.4 Preview-pane toolbar (row 2, y ≈ 175-205)

This is the row of toolbar buttons immediately *above* the preview iframe.
**Left to right**:

1. **`✨ Edit` toggle** (x≈430) — turns on the **visual edit agent**. Hovering
   any DOM node in the preview highlights it; clicking selects it and routes
   the next prompt to "edit *this element*". A small palette icon (🎨) next
   to it opens the **Theme** popover (Tailwind tokens, font family swatches).
2. **Refresh icon + path field** (centred, x≈710-1030, the rounded chip
   showing `/Lifestyle`):
   - The chevron expands a **page picker** (every route registered in
     `pages.config.js`).
   - Clicking the refresh icon forces a full reload of the preview iframe.
   - Typing in the field navigates the iframe to that route + query string
     (e.g. `/Lifestyle?tab=horoscope`).
3. **📱 Device toggle + ▼ chevron** (x≈1265-1290, **the toggle the user
   wanted documented**) [walked]:
   - **Icon shape**: rounded-rectangle phone glyph, lucide-style.
   - **Behaviour**: clicking the *icon* cycles through device sizes; clicking
     the *chevron* opens a dropdown menu with preset viewport widths. The
     dropdown values aren't labelled in the static UI — they are the
     standard `Mobile / Tablet / Desktop` options [discovered — verify by
     opening the dropdown; click coords roughly (1283, 188) on a 1389-wide
     viewport].
   - **What it controls**: it resizes the iframe element (width/height),
     not the surrounding chrome. CSS media queries inside the app re-render
     responsively, which is exactly what FemWell needs for the
     mobile+tablet+desktop unified-nav test [project_femwell_multiplatform].
   - **Important**: the default preview opens at **mobile**. This is why
     every screenshot in the chat panel and every "preview screenshot" the
     agent takes is mobile-sized unless you click this toggle first. If
     you're working on a desktop-only fix, switch the toggle first so the
     agent's screenshots are tablet/desktop.
4. **⛶ Fullscreen** brackets icon (x≈1335) — expands the preview iframe to
   fill the editor (hides the chat rail).

### 2.5 Chat input limits + behaviour [walked + docs/credits]

- The input is a plain `<textarea>` so paste-anything works (no Markdown
  preview).
- **No documented hard size cap.** FemWell empirical: ~12-15 KB single-prompt
  inputs run reliably. >25 KB starts hanging. This matches the
  `feedback_base44_prompt_size_limits.md` note. The hang condition isn't
  size alone — see §3.5 for the actual recipe.
- **Attachments**: drag-drop or click `+`. Supported via AI chat for entity
  import: `.csv`, `.xlsx`, `.xls`, `.json` [docs/Managing-app-data]. Images
  use a separate Upload icon; supported for reference / visual context.
- **What burns credits** when you press Send:
  - **Edit mode** prompts: each one burns ~0.5-2 message credits depending
    on scope [docs/credits].
  - **Discuss mode** prompts: **0 credits**. Use Discuss to plan, refine the
    prompt, and have the agent self-critique before flipping to Edit.
  - Manual drag/visual edits in the preview: **0 credits**.
  - Automatic AI fixes (when the builder retries a failing build): consume
    credits unless the user has the "no auto-fix" preference set [docs].
- **Stream-control**: each agent run can be paused via the orange `Cancel`
  button at the top of the editor ("Claude started debugging this
  browser" / "Processing…").
- **Per-message credit cost**: visible by clicking `... More options →
  Credits Used` on any user message.

### 2.6 Publish dialog [walked + docs/github-integration]

Click `Publish App` (top right). The dialog has:

- **Tabs**: `Web` and `Mobile app`.
- **App Visibility**: `Public` / `Private`.
- **Last published**: timestamp + author of the last publish.
- **Custom domain** field (current value e.g. `femwells.com`).
- Big black `Publish` button.

Flow (FemWell-specific):
1. After a `git push origin main`, the builder shows
   *"Synced N commits from GitHub"*.
2. Open Publish dialog → click `Publish` → it shows a build log → "Published
   successfully" toast.
3. Hit Refresh on `femwells.com` ~30-60s later. CDN propagation is fast for
   route-level changes; aggressive Cloudflare cache can hold images longer.

### 2.7 Dashboard tab

Clicking `Dashboard` (top header) shows a left-rail of subsections [walked
shape, confirmed against docs]:

- **Data** — every entity as a table. Add/edit/delete rows, search,
  filter, import CSV, export CSV, recently-deleted recovery (30-day window)
  [docs/Managing-app-data].
- **Automations** — list of scheduled / data-event / connector / in-app
  agent automations. Toggle on/off, Run now, View logs, Duplicate, Archive
  [docs/Creating-automations]. **3 min run cap, 5 min minimum interval, 1
  integration credit per run.**
- **Users** — registered app users. Promote to admin, remove, view sessions.
- **Security** — RLS/FLS rules per entity (UI mirror of `rls` in the JSON
  schema).
- **API** — code snippets (JS/Python/cURL) to call your entities from
  outside.
- **Connectors / Integrations** — OAuth connections (Stripe, Gmail, Google
  Calendar, etc.).
- **Logs** — backend-function log stream. Filter by function name and time
  range [docs/cli/logs]. **FemWell's logs land here** — also into the
  `IngestErrorLog` entity for ingest-pipeline structured logs.
- **Email** — outbound email log + templates.
- **GitHub** — connect / disconnect, invite collaborators, "Go to
  Repository" button. **For FemWell, this is connected to
  github.com/HalliburtonOji/femwell.**
- **Settings / Project settings** — domains, env vars (a.k.a. "Secrets" in
  the CLI), brand, auth providers, password-login toggle, social login,
  SSO.

### 2.8 Version history [docs + walked]

- Click the **clock icon** in the top header.
- Each AI message produces one auto-snapshot. Manual snapshots are not yet
  exposed in the UI [docs feedback].
- Each row: timestamp + 1-line description + Revert button.
- Versions older than the GitHub-connection date are **inaccessible**; only
  versions backed by a git ref can be restored once connected. This is the
  permanent trade-off of enabling 2-way sync.
- Reverting from chat: each AI message in the conversation has a `Revert`
  button — fastest path back from a broken edit.
- **Use this aggressively** when an agent run gets stuck or produces broken
  code; it's cheaper than another credit-burning prompt to fix the breakage.

---

## 3. The base44 prompt format

### 3.1 Anatomy of a working MP

What the agent actually parses well (empirical, FemWell MP corpus
`mnt/femwell/lifestyle_*_base44_prompt.md`):

```markdown
# <Concise title — what the MP does>

## Context (1-3 sentences)
Why this matters, the user-visible outcome, the page/route involved.

## Files to touch (explicit list)
- `src/pages/Lifestyle.jsx`
- `src/components/lifestyle/Horoscope.jsx`
- `base44/entities/AstroProfile.jsonc` (schema change — see below)
- `base44/functions/generateHoroscopeReading/entry.ts`

## Constraints
- DO NOT modify `src/Layout.jsx` or `src/pages.config.js`.
- DO NOT introduce emoji codepoints. Use lucide-react icons.
- Brand fonts: Fraunces (display), Inter (body).
- Mobile + tablet + desktop must use the *same* 5-slot bottom nav.

## Diff plan (numbered, file-by-file)
1. `src/components/lifestyle/Horoscope.jsx`
   - Replace the `<h1>` block at the top of `HoroscopeTab` with a new
     `<DailyHeader />` import.
   - Wire `useDailyPhase()` and pass `phase` to the existing chart.
2. ...

## Schema diff (only if entity changes)
Add to `base44/entities/AstroProfile.jsonc → properties`:
{
  "saturn_return_unlocked": { "type": "boolean", "default": false }
}

## Acceptance test (must include per viewport)
- Mobile (375px): the header is single-column, "Today is …" reads on one line.
- Tablet (768px): two-column layout, no horizontal scroll.
- Desktop (1280px): bottom nav remains visible, no sidebar.
- Discuss-mode follow-ups: "show me the new file tree" should print the
  five touched files.
```

### 3.2 File-path conventions
Always use **repo-relative paths**, starting at `src/` or `base44/`.
The agent resolves `@/` to `src/` (alias in `jsconfig.json`) but prefer the
unaliased form in MPs so the diff is unambiguous.

- **Pages**: `src/pages/<PageName>.jsx`
- **Components**: `src/components/<area>/<Name>.jsx`
- **shadcn UI primitives** (read-only — don't ask the agent to edit these):
  `src/components/ui/<name>.jsx`
- **Entities**: `base44/entities/<Name>.jsonc` (one file per entity, JSONC
  comments allowed [docs] — FemWell uses comments for `description` fields).
- **Functions**: `base44/functions/<funcName>/entry.ts` (single file per
  function — FemWell does **not** use `function.jsonc`, see §4.3).
- **Agents**: `base44/agents/<agent>.jsonc` (FemWell has
  `personal_assistant.jsonc` and `womens_health_coach.jsonc`).

### 3.3 What the agent reads before editing
On every prompt the agent re-reads:
- Every file mentioned by path in the prompt.
- Every file the page-router resolves to for the *current preview URL* (the
  `📁 Files used in this page` set [docs/code-tab]).
- The conversation transcript (truncated past a certain depth — keep
  multi-step context inside a single prompt for safety).

It does **not** scan the whole repo by default. If you need cross-file
context ("use the existing useDailyPhase hook"), name the file.

### 3.4 What makes the agent fastest (and cheapest)
1. **Be specific.** "Add a section" → 1-2 credits. "Add a 3-card section
   showing morning/afternoon/evening recommendations with a 12px gap between
   cards, hooked to `useTodayRecommendations()`" → ~0.5 credits because the
   agent makes one decisive change.
2. **List the files**. Even if the agent could discover them, listing avoids
   the "Files used in this page" round-trip.
3. **Negative constraints.** "Do not touch X" is critical. Without it the
   agent will sometimes "improve" adjacent code.
4. **Stay in one mode.** Don't mix "and also write the spec doc" — that
   chains tools and inflates the run.
5. **Use Discuss mode** to draft the prompt, then switch to Edit.

### 3.5 The hang recipe (memory: `feedback_base44_prompt_size_limits.md`)

A single prompt that **(a) invokes an external LLM function**, **(b) modifies
an entity schema**, **(c) edits React code**, and **(d) re-invokes the same
function afterwards** will reliably hang. The agent enters a loop because the
schema change can't apply until the function deploys, but the function won't
deploy until the prompt finishes. **Split into sequential prompts**:

1. Prompt A: schema change only.
2. Prompt B: function `entry.ts` change. Wait for "Synced from GitHub".
3. Prompt C: re-invoke + UI changes.

### 3.6 Anti-patterns to avoid
- Vague verbs without a target (`"improve the horoscope tab"` — no.)
- Pasting the entire current file and asking for a "modified version".
  The agent works in diffs; pasting a 1000-line file balloons context.
- Asking for cosmetic + functional changes in one prompt. Cosmetic should
  often be a direct edit (see §9).
- Telling the agent to "use the latest pattern from the repo" when the repo
  has multiple patterns. It will pick the wrong one.

---

## 4. File layout conventions

### 4.1 `src/` (frontend)

```
src/
├── App.jsx                  # Router root. Adds Routes for pages.
├── Layout.jsx               # Wraps every page in the registered routes;
│                            # hosts MobileBottomNav, FloatingSidebar,
│                            # AssistantOverlay, CheckinModal.
├── pages.config.js          # AUTO-GENERATED. Do NOT hand-edit unless
│                            # changing `mainPage`.
├── pages/                   # File-based routes. Home.jsx → "/Home",
│                            # Lifestyle.jsx → "/Lifestyle", etc.
├── components/              # Domain-grouped:
│   ├── ui/                  # shadcn primitives — read-only.
│   ├── layout/              # FloatingSidebar, MobileBottomNav.
│   ├── lifestyle/           # Lifestyle tab and friends.
│   ├── horoscope/           # H2 surface.
│   ├── today/, programs/, nutrition/, journal/...
│   └── common/              # ErrorBoundary, LoadingSpinner, ...
├── api/
│   └── base44Client.js      # Creates the `base44` client. FemWell wraps
│                            # the entities proxy to auto-stamp
│                            # created_at / updated_at on every create/update.
├── hooks/                   # Custom React hooks (useDailyPhase, ...).
├── lib/                     # AuthContext, query-client, app-params, etc.
├── utils/                   # Pure helpers.
└── globals.css, index.css   # Tailwind + brand tokens.
```

### 4.2 `base44/entities/<Name>.jsonc` [docs]

```jsonc
{
  "name": "AstroProfile",
  "type": "object",
  "title": "AstroProfile",
  "properties": {
    "birth_date":   { "type": "string", "format": "date" },
    "birth_time":   { "type": "string" },
    "birth_place":  { "type": "string" },
    "sun_sign":     { "type": "string", "enum": ["aries","taurus", ...] },
    "saturn_return_unlocked": { "type": "boolean", "default": false }
  },
  "required": ["birth_date"],
  "rls": {
    "create": true,
    "read":   { "created_by": "{{user.email}}" },
    "update": { "created_by": "{{user.email}}" },
    "delete": { "created_by": "{{user.email}}" }
  }
}
```

Built-in fields you must NOT redefine: `id`, `created_date`, `updated_date`,
`created_by`, `created_by_id`, and `is_deleted`, `deleted_date`, `is_sample`,
`entity_name`, `app_id`, `environment` (internal). FemWell additionally auto-
stamps `created_at` and `updated_at` (see `src/api/base44Client.js`) — this is
**FemWell-specific**, not core.

Supported field types: `string` (+ `format`, `enum`, `pattern`,
`minLength`/`maxLength`), `integer`, `number`, `boolean`, `array` (with
`items`), `object` (with `properties` + `required`). Defaults via `default`.

### 4.3 `base44/functions/<name>/entry.ts` [docs]

FemWell convention (no `function.jsonc`):

```ts
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    // ...do work...
    return Response.json({ ok: true });
  } catch (err) {
    console.error('[fnName]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});
```

**FemWell pattern** — every function inlines a `logIngestError` helper that
writes to the `IngestErrorLog` entity for observability. `pipelineOrchestrator`
uses `runPhase()` to fan out to other functions via
`base44.asServiceRole.functions.invoke()`. Cron scheduling is **not** in
`function.jsonc` (there are none); see §4.4.

If you ever need automations on a function, the modern way [docs] is to add a
`function.jsonc` next to `entry.ts`:

```jsonc
{
  "name": "ingestRSS",
  "entry": "entry.ts",
  "automations": [
    {
      "type": "scheduled",
      "name": "hourly_rss_pull",
      "is_active": true,
      "schedule_mode": "recurring",
      "schedule_type": "simple",
      "repeat_unit": "hours",
      "repeat_interval": 1
    }
  ]
}
```

**Caution**: docs explicitly say *"any changes made in the dashboard will be
overwritten the next time you run `functions deploy`"* — meaning if you add a
`function.jsonc` later, it becomes source of truth and dashboard-defined
automations disappear. FemWell's current automations live entirely in the
dashboard; converting them to `function.jsonc` is a one-way move.

### 4.4 Automations (FemWell-specific)
Because FemWell uses no `function.jsonc`, every cron / data-event is
defined under **Dashboard → Automations**. Constraints from the support docs:

- **Plan**: Builder plan or higher.
- **Cost**: 1 integration credit per run.
- **Max runtime**: 3 minutes (hard kill). FemWell's `pipelineOrchestrator`
  needs to finish each phase under this cap.
- **Min interval**: 5 minutes.
- 4 trigger types: `Scheduled`, `Data event`, `In-app agent`, `Connector`.

### 4.5 Agents (`base44/agents/*.jsonc`) [docs/agents-config]

FemWell has two: `personal_assistant.jsonc` and
`womens_health_coach.jsonc`. Required fields: `name`, `description`,
`instructions`, `model`. Supported models from docs: `anthropic/
claude-sonnet-4-20250514`, `anthropic/claude-3-5-sonnet-20241022`, `openai/
gpt-4o`, `openai/gpt-4o-mini`. (Note: the InvokeLLM model list — `gpt_5`,
`gpt_5_mini`, `claude_opus_4_6`, `claude_opus_4_7`, `gemini_3_pro` — is
*different* from the agents model list. Don't confuse them.)

`tool_configs` is an array of entity-tool or function-tool entries. FemWell's
`personal_assistant` exposes ~30 entities (read + write where appropriate)
plus voice + journaling. Keep tool_configs tight: each tool inflates the
agent's reasoning surface.

### 4.6 Env vars / Secrets
- Frontend env (Vite): `.env.local` → `VITE_BASE44_APP_ID`,
  `VITE_BASE44_APP_BASE_URL`, `VITE_BASE44_FUNCTIONS_VERSION`. Surfaced via
  `src/lib/app-params.js`.
- Backend env (Deno functions): `Deno.env.get('STRIPE_SECRET_KEY')` etc.
  Managed via **Dashboard → Settings → Secrets** in the UI, or via
  `base44 secrets set` from the CLI [docs].
- **Never** commit `.env.local` or include secret keys in MPs.

### 4.7 Logs
- Console output from any function lands in the **Dashboard → Logs** panel,
  filterable by function name and time range [docs].
- FemWell additionally writes structured rows to the `IngestErrorLog` entity
  for ingest-pipeline failures — that table is the canonical "what's broken
  in ingest" view (see `feedback_pipeline_hidden_bugs.md`).

---

## 5. Sync + publish flow

### 5.1 Git → builder
- Base44 watches the connected GitHub repo's `main` branch.
- A successful push triggers the builder to fetch and re-mount. The chat
  surface shows **"Synced N commits from GitHub"** + the commit messages.
- Sync latency: ~5-20 seconds in practice [walked + docs/github-integration].
- Sync triggers a re-render of the preview iframe.
- The branch **must** be named `main`. `master` is not supported [docs].

### 5.2 Builder → git
- Every agent edit auto-commits to the connected repo with a generated
  commit message ("Added natal-chart visualization …").
- There's no manual "push" button — the builder pushes after each edit
  completes.
- **No 2-way sync conflicts**: if you push locally while the agent is
  editing, you'll see merge issues. Lock to one editor at a time.

### 5.3 Publish → live
- The Publish dialog runs `npm run build` (configured in
  `base44/config.jsonc` → `site.buildCommand`) which is `vite build` →
  `./dist` output (also configured there).
- The CDN swap-over takes ~30-60 seconds.
- Custom domain (`femwells.com`) and `<slug>.base44.app` both update.
- **Verify** by opening `femwells.com/<route>` and (in DevTools) confirming
  the JS bundle filename changed (Vite appends a content hash).

### 5.4 What you cannot publish
- Schema changes are **automatic** — entity JSON in `main` deploys on sync,
  no Publish step needed. Caveat: dashboard `Data` views may cache the old
  schema for a minute.
- Function changes are likewise deployed on sync (no Publish click). Test by
  visiting `https://<slug>.base44.app/functions/<funcName>` directly.

---

## 6. Credit / pricing model

### 6.1 Plans (May 2026)
[Web research; verify in `Workspace → Settings → Plan and billing`]

| Plan    | Monthly | Annual eq. | Message credits / mo | Integration credits / mo |
|---------|---------|------------|----------------------|--------------------------|
| Free    | $0      | $0         | 25 (max 5/day)       | bundled, small           |
| Starter | $20     | ~$16       | 100                  | 2,000                    |
| Builder | $40     | ~$32       | 250                  | 10,000                   |
| Pro     | $100    | $80        | 500                  | 20,000                   |
| Elite   | $200    | $160       | larger               | larger                   |

FemWell is on **Pro** ($80/mo annual = 500 message + 20,000 integration
credits) per `memory/project_femwell_app.md`.

### 6.2 What burns what
- **Message credits** (drained by the *builder*, not the running app):
  every Edit-mode prompt. Typical cost — see §3.4. Manual visual edits, file
  uploads, and Discuss-mode prompts: 0.
- **Integration credits** (drained by the *running app*): each LLM call from
  user-facing code (`integrations.Core.InvokeLLM`), each email sent, each
  generated image, each automation run (1 credit). Backend functions
  themselves don't cost integration credits when they only do DB CRUD;
  they cost when they call out to LLMs / external APIs through the
  managed integration layer.
- **Publish + Git sync + Dashboard views**: 0.

### 6.3 Where to see usage
- Builder header → click the workspace logo → **Credit usage**.
- Per-message: `... More options → Credits Used` on any user message.

### 6.4 At exhaustion
- Message credits: builder prompts pause; manual edits and code-tab edits
  still work. Discuss mode still works (it's free).
- Integration credits: backend functions that need LLM/email/etc. fail
  with a quota error; the rest of the app continues.

---

## 7. Multiplatform / responsive — the device toggle

[walked + discovered]

Location: **preview-pane toolbar, right side**, between the path field
chevron and the fullscreen brackets icon. Approx. screen coordinates at a
1389×868 viewport: `(1268, 188)` for the phone icon, `(1283, 188)` for the
dropdown chevron.

Behaviour (based on the rendered preview-iframe sizes observed):
- **Mobile** (default): preview iframe rendered ~375px wide × full height.
  CSS media queries fire at `< 640px` (Tailwind `sm`).
- **Tablet**: ~768-820px wide. Tailwind `md` queries fire (`>= 768px`).
- **Desktop**: ~1280-1440px wide. Tailwind `lg` (`>= 1024px`) and `xl`
  (`>= 1280px`) queries fire.

What it actually does: **it width-constrains the iframe element** (not the
chrome around it). The fullscreen button expands the iframe to fill the
editor; the device toggle constrains it to the chosen size. CSS media
queries inside the app respond *as if* it were a real device of that
width — which is exactly what FemWell needs to verify the
unified-bottom-nav layout at all three breakpoints
(`feedback_femwell_multiplatform.md`).

**Operator habit to bake into every MP**:

```markdown
## Acceptance test (per viewport)
- Mobile (toggle → Mobile, ~375px): ...
- Tablet (toggle → Tablet, ~768px): ...
- Desktop (toggle → Desktop, ~1280px): ...
```

Then *after the build* walk all three viewports before declaring done.
This is the missing step that produced today's H2 regressions: the agent
shipped to "mobile-only-OK" state because the previewer never opened the
desktop view to catch the bottom-nav width clash.

---

## 8. Known gotchas — FemWell-specific + general

### 8.1 Prompt size cap [memory + walked]
~25 KB single-prompt inputs hang. Split into sequential prompts when:
- a schema change + LLM-invoke + code edit + re-invoke is involved, or
- the prompt mentions 10+ files, or
- the agent is asked to "also write the spec doc afterwards".

### 8.2 Field naming drift (`rss_url` vs `feed_url`)
[memory: project_femwell_pipeline_hidden_bugs.md] The `ingestRSS` function
reads `source.rss_url` in some code paths and `source.feed_url` in others.
Always cross-grep before editing the ingest function.

### 8.3 Schema sync timing
After `git push` with a schema change:
1. ~10-20s: builder shows "Synced N commits".
2. **Schema is live immediately for new writes**, but…
3. **Existing data is NOT migrated.** New optional fields read as `undefined`
   for old rows. Default values apply only on subsequent updates.
4. Dashboard → Data view may cache for ~60s. Hard-refresh if you don't see
   the new column.

### 8.4 Operator vs end-user account
Each app user has a `role` of `admin` or `user` [docs/user-schema]. FemWell
also has an `is_operator` flag on `UserProfile` for in-app moderator
features — that's a custom field, not the same as the role. Don't conflate.

### 8.5 Long-running agent runs that hang
- "Cancel" button at the top of the editor stops the current agent run.
- If Cancel doesn't fire, **Revert** from the History panel to the snapshot
  before the prompt.
- After a hang, the next prompt may inherit a broken local state. Best
  practice: refresh the browser tab before retrying.

### 8.6 GitHub disconnect is one-way (docs)
Once you disconnect, you cannot reconnect to the **same** repo. You'd need
a new repo name. So don't disconnect FemWell's repo unless you mean it.

### 8.7 Version history pre-GitHub-connection is gone
Snapshots from before `HalliburtonOji/femwell.git` was attached are no
longer restorable. Only commits in that repo are recoverable.

### 8.8 `created_at` vs `created_date`
FemWell's `base44Client.js` auto-stamps `created_at` / `updated_at`. The
*platform* uses `created_date` / `updated_date`. **Both exist** on FemWell
rows. Code that filters by date should check whichever was set most recently
or normalize. (Source: `project_femwell_pipeline_hidden_bugs.md` notes
`created_at null on all rows` — that's a real bug; the stamping proxy isn't
running where expected.)

### 8.9 The chat input mode is sticky
Once you pick Edit or Discuss, it stays until you click the other pill. If
your last action was a brainstorm, your next prompt may not edit anything
even though you typed an instruction. Always glance at the placeholder
("What would you like to change?" = Edit; "What would you like to discuss?"
= Discuss) before sending.

### 8.10 `legacySDKImports` flag
`vite.config.js` reads `process.env.BASE44_LEGACY_SDK_IMPORTS === 'true'`.
If you ever see `@/integrations` / `@/entities` style imports failing,
that flag may need to be `true`. FemWell's working code uses the
`@base44/sdk` package imports, so the flag is off.

### 8.11 The Chrome MCP cannot reliably click the device toggle
Documented for completeness: the Chrome MCP execution context inside the
builder bound to the preview iframe (325×48). Clicks via coordinates land
in the iframe rather than the parent toolbar. **For the user's automation
flow**: the device toggle is human-only. Plan for the operator to switch it
manually before the post-build verification walk.

---

## 9. MP vs direct-edit decision tree

Now that substantive changes flow through MPs the operator pastes, vs.
trivial changes the operator makes directly in the repo, use this tree:

### Direct edit (no MP, push to `main`)
- Pure text changes inside a single .jsx (copy fix, label change, brand
  string).
- Single-className Tailwind tweaks (`px-4` → `px-6`).
- Bumping a constant (timeout, page size).
- Adding a new import + using it in 1 spot.
- Markdown/documentation file changes (`mnt/femwell/*.md`).
- New utility helpers in `src/utils/` that aren't wired anywhere yet.

### MP (paste into base44 builder)
- Any change touching **>1 file** that share routing/state contracts.
- Any **entity schema** change (`base44/entities/*.jsonc`) — let the agent
  validate the JSON and sync.
- Any **function** change (`base44/functions/*/entry.ts`) — Deno deploy +
  log surface needs the builder loop.
- Any **routing** change (new page, removed page, page-rename) — the
  `pages.config.js` is auto-generated; let the agent regenerate it.
- Any new **section component** > ~100 lines or that wires to a new entity.
- Any **automation** create/edit/delete (do this in
  Dashboard → Automations; that's effectively an MP-class action).
- Any **brand-pattern enforcement** that depends on the agent walking
  multiple components (e.g. "replace all emoji codepoints with lucide
  icons across the Lifestyle tree").

### Boundary cases
- "Add a new chart to an existing page" → MP if it needs a new entity or
  function; direct edit if it's wiring an existing hook.
- "Rename a Tailwind colour everywhere" → grep-and-replace direct (faster
  than an MP) IF the colour is only in raw class strings; MP if it touches
  the tokens in `tailwind.config.js`.
- "Refactor a hook" → MP. Hooks have invisible contract debt.

---

## 10. MP authoring template

Copy this scaffold into the chat input. Fill placeholders, then send.

```markdown
# <One-line title — what changes when this lands>

## Context
<2-3 sentences on the user-visible outcome and the route involved.>

## Pre-flight
- Discuss-mode confirmation done? (yes/no)
- Files re-grepped for current state? (paste the grep output that matters)
- Verified against live page state? (URL of last walk + what was on screen)

## Files to touch (explicit)
- `src/pages/<X>.jsx`
- `src/components/<area>/<Y>.jsx`
- `base44/entities/<Z>.jsonc`   ← if schema change, fill §Schema diff below
- `base44/functions/<W>/entry.ts`   ← if function change

## Constraints (negative + positive)
- DO NOT modify: `src/Layout.jsx`, `src/pages.config.js`, `src/components/ui/**`.
- DO NOT use emoji codepoints — lucide-react icons only.
- Fonts: Fraunces (display), Inter (body). No new font imports.
- Bottom nav: same 5-slot pattern at mobile + tablet + desktop. No
  desktop-sidebar substitution.
- Brand colours: stick to existing tokens in `tailwind.config.js`.

## Diff plan (numbered, per file)
1. `src/components/<area>/<Y>.jsx`
   - Replace lines/section described as <X>
   - Add prop <P> wired to hook <H>
   - Remove deprecated <D>
2. `src/pages/<X>.jsx`
   - Pass <P> through to <Y>
3. ...

## Schema diff (only if needed)
Append to `base44/entities/<Z>.jsonc → properties`:
```jsonc
{
  "new_field": { "type": "string", "default": "" }
}
```
Required additions / removals: <list>.
RLS changes: <list, or "none">.

## LLM-prompt diff (only if a function changes its LLM prompt)
- File: `base44/functions/<W>/entry.ts`
- Before: <paste exact existing prompt block>
- After: <paste new prompt block>

## Visual acceptance test (PER VIEWPORT)
- **Mobile (toggle → Mobile, ~375px)**: <expected screenshot description>
- **Tablet (toggle → Tablet, ~768px)**: <expected>
- **Desktop (toggle → Desktop, ~1280px)**: <expected>

## Functional acceptance test
- Click <X>. The toast should say "<Y>".
- Refresh — state persists (read from entity <Z>).
- Network tab: only one POST to `/functions/<W>` per submit.

## Rollback plan
- If broken in builder preview: click `Revert` on this assistant message in
  chat panel.
- If broken after publish: `git revert <commit-sha>` locally, push to main,
  re-Publish.

## Out of scope (do NOT do)
- <list anything tempting but separate, e.g. "refactor unrelated hook">
```

---

## Sources

### Base44 official docs (fetched 2026-05-13)
- Docs index: <https://docs.base44.com/llms.txt>
- Entity schemas: <https://docs.base44.com/developers/backend/resources/entities/entity-schemas.md>
- Entity security (RLS/FLS): <https://docs.base44.com/developers/backend/resources/entities/security.md>
- User schema: <https://docs.base44.com/developers/backend/resources/entities/user-schema.md>
- Backend functions: <https://docs.base44.com/developers/backend/resources/backend-functions/overview.md>
- Automations: <https://docs.base44.com/developers/backend/resources/backend-functions/automations.md>
- Agents config: <https://docs.base44.com/developers/backend/resources/agents-config.md>
- App-code Code Tab: <https://docs.base44.com/developers/app-code/editor/code-tab.md>
- Project structure: <https://docs.base44.com/developers/app-code/overview/project-structure.md>
- GitHub integration: <https://docs.base44.com/developers/app-code/local-development/github.md>
- Changelog (Dec 2025 → Apr 30 2026): <https://docs.base44.com/developers/changelog.md>
- Credits: <https://docs.base44.com/Account-and-billing/Credits>
- Billing and plans: <https://docs.base44.com/Account-and-billing/Billing-and-plans>
- Managing app data: <https://docs.base44.com/Building-your-app/Managing-your-app-data>
- Creating automations (app-editor view): <https://docs.base44.com/Building-your-app/Creating-automations>
- SDK Work with data: <https://docs.base44.com/developers/references/sdk/getting-started/work-with-data.md>

### Web research (May 2026)
- Pricing tiers + Wix $80M acquisition (Jun 2025): Vitara / Banani / NoCode.MBA pricing breakdowns; Maor Shlomo LinkedIn updates on GitHub + Fast Code Edits.
- Version history rollback feature notes: base44.com/changelog/feature/improved-versioning-&-project-history.

### FemWell repo (snapshots inspected)
- `/sessions/relaxed-loving-brahmagupta/femwell-repo/package.json`
- `/sessions/relaxed-loving-brahmagupta/femwell-repo/vite.config.js`
- `/sessions/relaxed-loving-brahmagupta/femwell-repo/jsconfig.json`
- `/sessions/relaxed-loving-brahmagupta/femwell-repo/base44/config.jsonc`
- `/sessions/relaxed-loving-brahmagupta/femwell-repo/base44/entities/LifestyleItems.jsonc`
- `/sessions/relaxed-loving-brahmagupta/femwell-repo/base44/agents/personal_assistant.jsonc`
- `/sessions/relaxed-loving-brahmagupta/femwell-repo/base44/functions/ingestRSS/entry.ts`
- `/sessions/relaxed-loving-brahmagupta/femwell-repo/base44/functions/pipelineOrchestrator/entry.ts`
- `/sessions/relaxed-loving-brahmagupta/femwell-repo/src/Layout.jsx`
- `/sessions/relaxed-loving-brahmagupta/femwell-repo/src/api/base44Client.js`
- `/sessions/relaxed-loving-brahmagupta/femwell-repo/src/lib/app-params.js`
- Directory listings of `src/pages/`, `src/components/`, `base44/functions/`.

### Memory (cross-referenced, not regurgitated)
- `feedback_base44_prompt_size_limits.md` (prompt-hang recipe).
- `feedback_lead_manager_agent.md`, `feedback_femwell_agent_team.md` (agent
  team naming).
- `feedback_femwell_multiplatform.md` (unified bottom nav at all viewports).
- `project_femwell_pipeline_hidden_bugs.md` (`rss_url` vs `feed_url`,
  `created_at null`).
- `feedback_no_emoji_in_femwell.md` (brand constraint).
- `feedback_base44_publish_via_chrome.md` (publish via builder UI).
- `feedback_live_walk_after_every_build.md` (verify on live, not green CI).

### Live UI [walked via computer-use screenshots]
- Editor page at `https://app.base44.com/apps/69a9891a6ccccc1822bbb4bc/editor/preview` was screenshotted on 2026-05-13. Sandbox couldn't persist image files to disk for the user; coordinates and shapes referenced in §2 come from the rendered screenshots (1389×868) and the page accessibility tree (Dashboard/Preview tabs, "More options", "Upgrade plan", "Publish App" buttons confirmed; toolbar Edit/path/device/fullscreen confirmed visually).
