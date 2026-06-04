# Echo entity — one-time base44 creation (Phase 3, Echo Wall)

The Echo Wall code references `base44.entities.Echo`. The schema is committed as
code at `base44/entities/Echo.jsonc`. base44 does **not** instantiate an entity
from the `.jsonc` file on deploy, and there is **no reachable programmatic
schema-create API** (the data API returns `403 auth_required` with the builder
token, and `/api/apps/<id>/entities` 404s). So the entity must be created once in
base44. Two ways — both create exactly the same entity. **Do this once, then stop.**

## Option A — Data tab (no AI build points; preferred)
Builder → **Data** → **Create entity** / **+ New entity** → name it **Echo** →
paste the JSON schema from `base44/entities/Echo.jsonc` (or add the fields below).
Save. (This does not consume AI build credits.)

## Option B — one-time AI builder prompt (the authorized one-time exception)
Paste this **single** prompt into the base44 chat builder, then stop:

> Create a new data entity named **Echo**. Do NOT change any other entity, page,
> component or function — only add this one entity. Fields:
> - `body` (string) — the scrubbed single line.
> - `author_hash` (string) — anonymous, device-derived author token.
> - `phase` (string, enum: menstrual, follicular, ovulatory, luteal, unknown; default "unknown").
> - `life_stage` (string).
> - `cycle_day` (number).
> - `source_entry_hash` (string).
> - `live_at` (string, date-time) — when the cooling pause ends and it goes live.
> - `expires_at` (string, date-time) — 48h fade.
> - `held_count` (number, default 0).
> - `metoo_count` (number, default 0).
> - `report_count` (number, default 0).
> - `hidden` (boolean, default false).
> - `visibility` (string, enum: same_phase, circles, all; default "all").
> Required: body, author_hash, live_at, expires_at. Add indexes on phase,
> expires_at and hidden. Make records readable by all signed-in users (the wall
> is cross-user); only the creator may delete their own. Do not add a user_id or
> email field and do not change any code.

## Read/write visibility
- **Read:** all signed-in users (cross-user wall).
- **Create:** any signed-in user.
- **Update:** any signed-in user (reaction counters + report_count/hidden are
  community-moderation counters by design).
- **Delete:** creator only (author retract + auto-unpost).

## Verify it exists (after creating)
In the running app (femwells.com) console, or via the SDK:
`await base44.entities.Echo.filter({}, "-created_date", 1)` → returns `[]` (empty
array, not a 404). A 404 / "entity not found" means it wasn't created.

## Anonymity note (why no user_id field)
Rows carry only `author_hash` (salted SHA-256 of userId + a per-device secret),
so there is no reversible link to a user in the app's own fields. base44's
platform-level `created_by` still records the creator; the app never writes
`user_id`, never queries by it, and never surfaces it. Writing echoes under a
service identity (true server-side anonymity) is the Q3 hardening.
