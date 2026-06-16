// companionShare.js — the COMMUNITY "Garden of Gardens" (Phase 3).
//
// A calm, anonymous meadow of OTHER users' companions: PRESENCE, not ranking. It is
// strictly OPT-IN (off by default) and strictly NON-personal. Only a small snapshot ever
// travels — form, life-stage, season colour, accent, and (optionally) the chosen companion
// NAME if she opts to include it. NEVER email / cycle / journal / mood / real name / user_id.
//
// Anonymity-first like Echo: every row is keyed ONLY by a device-derived `author_hash`
// (reusing the existing communityHash — distinct namespace from echo/witness/twin). The
// hash is the dedupe key (one share per device), so toggling on UPDATES her own row and
// toggling off HIDES it.
//
// Persistence mirrors companion.js / garden.js / readingActivity.js EXACTLY: an opt-in flag
// is written to localStorage FIRST (synchronous, optimistic), then a guarded, FIRE-AND-FORGET
// entity write — NEVER awaited on the interaction path, so a wedged backend can never block
// or break the toggle [[base44-fetch-no-timeout-hangs]]. Reads fail open (.catch(() => [])).

import { base44 } from "@/api/base44Client";
import { communityHash } from "@/components/community/communityAnon";

const OPTIN_KEY = "fw_companion_shared_v1";       // "1" when she's opted in (device-local)
const NAME_OPTIN_KEY = "fw_companion_share_name_v1"; // "1" when she chose to include the name

// ── opt-in flags (synchronous, device-local) ────────────────────────────────
export function isShared() { try { return localStorage.getItem(OPTIN_KEY) === "1"; } catch { return false; } }
export function isNameShared() { try { return localStorage.getItem(NAME_OPTIN_KEY) === "1"; } catch { return false; } }
function setSharedFlag(on) { try { on ? localStorage.setItem(OPTIN_KEY, "1") : localStorage.removeItem(OPTIN_KEY); } catch { /* ignore */ } }
function setNameFlag(on) { try { on ? localStorage.setItem(NAME_OPTIN_KEY, "1") : localStorage.removeItem(NAME_OPTIN_KEY); } catch { /* ignore */ } }

// remember our own row id so a re-share UPDATES instead of duplicating
let myRowId = null;

// Build the NON-personal snapshot. This is the ONLY data that ever leaves the device.
// Defensive: we whitelist exactly the harmless fields and nothing else can be passed in.
function snapshot(author_hash, { form_key, stage_key, accent, season, display_name }, includeName) {
  return {
    author_hash,
    form_key: String(form_key || "peony"),
    stage_key: String(stage_key || "seed"),
    accent: String(accent || "#A8893F"),
    season: String(season || "spring"),
    display_name: includeName ? String(display_name || "").slice(0, 40) : "",
    opted_in: true,
  };
}

// ── OPT IN — add (or refresh) my companion in the shared garden ──────────────
// Optimistic: flip the local flag FIRST, then a guarded fire-and-forget upsert. `withName`
// controls whether the chosen name travels (default off). Never awaited.
export function optIntoSharedGarden(userId, snap, withName) {
  setSharedFlag(true);
  setNameFlag(!!withName);
  if (!userId) return;
  (async () => {
    try {
      const ah = await communityHash(userId);
      if (!ah) return;
      const body = snapshot(ah, snap || {}, !!withName);
      // dedupe by author_hash: update my existing row, else create one
      const found = myRowId
        ? null
        : await base44.entities.CompanionShare.filter({ author_hash: ah }, "-created_date", 1).catch(() => []);
      const existing = myRowId || (Array.isArray(found) && found[0] && found[0].id);
      if (existing) { myRowId = existing; await base44.entities.CompanionShare.update(existing, body).catch(() => {}); }
      else { const created = await base44.entities.CompanionShare.create(body).catch(() => null); if (created?.id) myRowId = created.id; }
    } catch { /* fail-open — the local flag already reflects her choice */ }
  })();
}

// ── OPT OUT — remove my companion from the shared garden ─────────────────────
// Optimistic: flip the flag off FIRST, then a guarded fire-and-forget HIDE (opted_in:false)
// of my row. We mark opted_in false (and clear name) rather than relying on delete RLS, so a
// client can always retract its OWN presence even when delete is admin-locked.
export function optOutOfSharedGarden(userId) {
  setSharedFlag(false);
  setNameFlag(false);
  if (!userId) return;
  (async () => {
    try {
      const ah = await communityHash(userId);
      if (!ah) return;
      const found = myRowId
        ? [{ id: myRowId }]
        : await base44.entities.CompanionShare.filter({ author_hash: ah }, "-created_date", 1).catch(() => []);
      const row = Array.isArray(found) && found[0];
      if (row && row.id) { await base44.entities.CompanionShare.update(row.id, { opted_in: false, display_name: "" }).catch(() => {}); }
    } catch { /* fail-open — the local flag already reflects her choice */ }
  })();
}

// ── READ the meadow — other companions, growing alongside (fail-open) ────────
// Returns a calm list of NON-personal snapshots (presence). We exclude my own row (by
// author_hash) so she sees OTHERS, and only return opted_in rows. No counts-as-score, no
// likes, no ranking — the caller renders a wandering meadow of blooms. Capped read.
export async function loadSharedGarden(userId, limit = 60) {
  try {
    const myHash = userId ? await communityHash(userId).catch(() => null) : null;
    const rows = await base44.entities.CompanionShare
      .filter({ opted_in: true }, "-created_date", 200)
      .catch(() => []);
    const out = [];
    const seen = new Set();
    for (const r of (Array.isArray(rows) ? rows : [])) {
      if (!r || !r.author_hash) continue;
      if (r.opted_in === false) continue;
      if (myHash && r.author_hash === myHash) continue; // others, not me
      if (seen.has(r.author_hash)) continue;            // one bloom per anonymous gardener
      seen.add(r.author_hash);
      out.push({
        author_hash: r.author_hash,
        form_key: r.form_key || "peony",
        stage_key: r.stage_key || "blooming",
        accent: r.accent || "#A8893F",
        season: r.season || "spring",
        display_name: r.display_name || "",
      });
      if (out.length >= limit) break;
    }
    return out;
  } catch { return []; }
}
