// witnessConfig — constants, the fixed response lexicon, and the Witness Charter
// for Witness Mode (Q3). One entry is handed to one matched sister; she sends one
// of four fixed lines or passes silently. No threads, no handles, no free text.
// UK market, no emoji (Lucide only in the UI). Mirrors echoConfig's shape.

// ── gate + pacing ────────────────────────────────────────────────────────────
export const GATE_HOLDS = 3;          // hold (respond/pass to) 3 before you can send
export const CANCEL_HOURS = 2;        // writer can cancel within 2h of sending
export const OPEN_HOURS = 6;          // receiver must open within 6h or it reroutes once
export const EXPIRE_HOURS = 48;       // after this the handoff archives to the writer's library
export const REROUTE_CAP = 1;         // reroute at most once on no-response

// ── limits (master plan rate limits) ─────────────────────────────────────────
export const SEND_PER_DAY = 1;        // 1 witness send/day
export const RECEIVE_PER_DAY = 3;     // 3 receives/day
export const STRIKE_LIMIT = 3;        // 3 active strikes removes a receiver from the pool
export const MAX_ENTRY_CHARS = 1200;  // soft cap on the handed entry length

// ── ZERO-KNOWLEDGE E2E (FWWT2) — ON, as an OPT-IN "maximum privacy" choice ────
// When true, the FWWT2 zero-knowledge path becomes AVAILABLE on the send screen as
// an optional toggle — it is NOT the default. With the toggle OFF (the default), a
// send uses the FWWT1 envelope exactly as before: at-rest + access-gated, the
// receiver reads instantly on claim. With the toggle ON, the entry's data-key never
// reaches the server; the writer's device wraps it to the receiver's public key
// AFTER she claims (per-device ECDH keypairs in witnessKeys.js) — so she reads it
// once the writer's device delivers the key, not instantly. Old FWWT1 rows always
// remain readable either way (env_version detected per row). The receiver side
// handles either envelope automatically.
//
// SERVER REQUIREMENTS (deploy + probe-verify before relying on a real ZK send):
//   1. WitnessRequest entity has env_version / writer_pub / receiver_pub / wrapped_key
//   2. functions deployed: deliverWitnessKey (new) + the additive edits to
//      postWitnessRequest / claimWitness / getWitnessStatus
//   3. one real round-trip live (send ZK -> claim -> writer delivers key -> read)
export const WITNESS_ZK_ENABLED = true;

// ── the 4 fixed responses (decided: "Holding with you / Me too / Not alone / I hear you") ──
// Stable codes match the WitnessRequest.response enum; labels are display-only and
// can change without an entity migration.
export const RESPONSES = [
  { code: "holding_with_you", label: "Holding with you" },
  { code: "me_too",           label: "Me too" },
  { code: "not_alone",        label: "Not alone" },
  { code: "i_hear_you",       label: "I hear you" },
];
export const RESPONSE_LABEL = RESPONSES.reduce((m, r) => { m[r.code] = r.label; return m; }, {});

// ── phase cohort copy (reused tone from the Echo Wall) ───────────────────────
export const PHASE_COHORT = {
  menstrual:  "a sister in her inner winter",
  follicular: "a sister in her inner spring",
  ovulatory:  "a sister in her inner summer",
  luteal:     "a sister in her inner autumn",
  unknown:    "a sister across the cycle",
};

// ── the Witness Charter (shown once, before the first hold or send) ──────────
export const CHARTER = {
  title: "The Witness Charter",
  lines: [
    "One woman writes. One woman holds it. No names, no handles, no threads.",
    "You answer with one of four lines, or you pass in silence. There is no other reply.",
    "What you read stays here — no screenshots, no copying, no carrying it out.",
    "Hold three before you send one. We move at the speed of care, not demand.",
    "If something reads as crisis, we route to help instead of to a stranger.",
  ],
  cta: "I understand",
};
