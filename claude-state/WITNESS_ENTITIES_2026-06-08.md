# Witness Mode (Q3) — Base44 entity schemas (paste-ready) — 2026-06-08

Minimal entity set per JOURNAL_BUILD_SPEC §2.4 / §1.6 / §1.8. Two entities:
- **WitnessRequest** — the one-to-one handoff (writer → one matched receiver) + the receiver's single coded response inline (spec: `response_code 1–4|null`; no free-text, so no separate response entity).
- **WitnessStrike** — the 3-strike moderation ledger (receiver-side).

Conventions mirror Echo.jsonc: hashes not raw user ids (anonymity), date-time expiry/lifecycle timestamps, counts, `hidden` + `report_count` flags. `visibility` enum omitted — Witness is always 1:1 (no audience scope). Base44 auto-adds `id`/`created_date`/`created_by`/`updated_date`; like Echo, writes must later route through a service-role function so `created_by` doesn't leak the author.

## WitnessRequest
```json
{
  "name": "WitnessRequest",
  "type": "object",
  "properties": {
    "writer_hash": { "type": "string", "description": "Salted device-derived hash of the writer — lets them cancel/retract without being de-anonymised" },
    "receiver_hash": { "type": "string", "description": "Double-hashed token of the matched receiver; empty until the pairing engine matches — never joined to a user" },
    "entry_ciphertext": { "type": "string", "description": "The handed entry, encrypted client-side (Tier 3 SecureStore) — server never sees plaintext" },
    "match_phase": { "type": "string", "enum": ["menstrual","follicular","ovulatory","luteal","unknown"], "default": "unknown", "description": "Cycle phase the receiver must match (pairing criterion)" },
    "match_life_stage": { "type": "string", "description": "Life stage the receiver must match, e.g. ttc, pregnant, menopause (pairing criterion)" },
    "match_language": { "type": "string", "default": "en-GB", "description": "Language the receiver must match (pairing criterion)" },
    "status": { "type": "string", "enum": ["pending","matched","opened","responded","passed","cancelled","rerouted","archived","expired"], "default": "pending", "description": "Lifecycle state of the handoff" },
    "response": { "type": "string", "enum": ["holding_with_you","me_too","not_alone","i_hear_you","passed"], "description": "Receiver's single fixed response (one of the 4 charter lines) or passed; empty until answered" },
    "gate_passed": { "type": "boolean", "default": false, "description": "Writer cleared the 'hold 3 before you send' witness gate at send time" },
    "sent_at": { "type": "string", "format": "date-time", "description": "When the writer sent — starts the 2h cancellation window" },
    "cancel_until": { "type": "string", "format": "date-time", "description": "2h deadline before which the writer can still cancel the handoff" },
    "matched_at": { "type": "string", "format": "date-time", "description": "When the pairing engine assigned a receiver" },
    "open_deadline": { "type": "string", "format": "date-time", "description": "6h deadline for the receiver to open; missing it triggers a single reroute" },
    "read_at": { "type": "string", "format": "date-time", "description": "When the receiver first opened the entry" },
    "responded_at": { "type": "string", "format": "date-time", "description": "When the receiver sent a fixed response or passed" },
    "reroute_count": { "type": "number", "default": 0, "description": "Times rerouted on no-response (capped at 1 per spec)" },
    "rerouted_from_hash": { "type": "string", "description": "Previous receiver_hash this was routed away from — drives the 'sent on after waiting' note" },
    "expires_at": { "type": "string", "format": "date-time", "description": "Hard expiry; after this the handoff is purged / archived to the writer's library" },
    "hidden": { "type": "boolean", "default": false, "description": "Suppressed from the receiver view (moderation/report)" },
    "report_count": { "type": "number", "default": 0, "description": "Reports the receiver has filed against this entry" }
  },
  "required": ["writer_hash","entry_ciphertext","sent_at","cancel_until","open_deadline","expires_at"],
  "indexes": [
    { "fields": ["receiver_hash"] },
    { "fields": ["writer_hash"] },
    { "fields": ["status"] },
    { "fields": ["expires_at"] }
  ]
}
```

## WitnessStrike
```json
{
  "name": "WitnessStrike",
  "type": "object",
  "properties": {
    "receiver_hash": { "type": "string", "description": "Double-hashed receiver token the strike counts against — never joined to a user" },
    "request_ref": { "type": "string", "description": "Id/hash of the WitnessRequest that triggered the strike (audit only; no identity join)" },
    "reason": { "type": "string", "enum": ["reported","charter_breach","capture_attempt","ignored_repeat","other"], "default": "other", "description": "Why the strike was issued" },
    "struck_at": { "type": "string", "format": "date-time", "description": "When the strike was recorded" },
    "active": { "type": "boolean", "default": true, "description": "Whether this strike still counts toward the 3-strike removal" },
    "expires_at": { "type": "string", "format": "date-time", "description": "Optional decay point after which the strike stops counting" }
  },
  "required": ["receiver_hash","struck_at"],
  "indexes": [
    { "fields": ["receiver_hash"] },
    { "fields": ["active"] }
  ]
}
```

## Not entities (handled elsewhere — keep the set minimal)
- **Witness Charter "shown once" ack** → a boolean on existing `UserPreferences`, not a new entity.
- **"held 3" pay-it-forward count** → derived (count of WitnessRequests where receiver_hash = me and status in responded/passed); `gate_passed` records the gate was met at send.
- **FLAG_SECURE / capture prevention, crisis intercept, Jess scrub, cooling/night throttle** → client/app-code rails, not data.
- **Reroute** updates the SAME WitnessRequest row (receiver_hash→new, rerouted_from_hash→old, reroute_count+1, status→matched, fresh open_deadline) — no new row.

## PENDING DECISIONS (with Halli — confirm before/at build; affect copy + the `response` enum)
- **Gesture name — "Witness" vs "Hold"** (spec open question #8: deep file says Witness Mode, the gesture is *hold*). Decide once and sweep all UI copy + feature naming.
- **The 4 fixed response lines — wording.** Asked Halli: **"Holding with you / Me too / Not alone / I hear you."** The entity `response` enum is stored as stable codes (`holding_with_you`/`me_too`/`not_alone`/`i_hear_you`/`passed`), so the *display wording* can change later WITHOUT an entity migration — only the UI label map changes. (Codes chosen to survive a wording tweak.)

## Build-time note (next session, after entities exist)
Route WitnessRequest create + response + cancel + reroute through service-role functions (like postEcho/retractEcho) so `created_by` stays the service, not the author. Rate limits (1 send/day, 3 receives/day) + 3-strike check enforced server-side.
