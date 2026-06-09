// witnessAnon — anonymity helpers for Witness Mode.
//
// The witness token is derived from a SEPARATE device secret (its own localStorage
// key), so a witness hash can never be correlated with an Echo author_hash — the
// "double-hashed, never joined" rule from the spec. The same hash is the person's
// writer_hash when they send and their receiver_hash when they hold; it is opaque
// and unlinkable to anyone else. Nothing here is ever sent to a server except the
// resulting hash.

const SECRET_KEY = "fw_witness_anon_v1";
const CHARTER_KEY = "fw_witness_charter_v1";
const HELD_KEY = "fw_witness_held_v1";     // request ids I've responded/passed to (gate progress)
const CLAIM_KEY = "fw_witness_claim_v1";   // request id I currently hold (in flight)
const SENT_KEY = "fw_witness_sent_v1";     // my own pending sent request id

function available() {
  try { return typeof window !== "undefined" && !!window.localStorage && !!window.crypto?.subtle; }
  catch { return false; }
}
export const witnessAvailable = available;

function bytesToHex(buf) {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function bytesToB64(bytes) {
  let s = ""; for (const b of bytes) s += String.fromCharCode(b);
  return window.btoa(s);
}
function deviceSecret() {
  if (!available()) throw new Error("witness-unavailable");
  let s = window.localStorage.getItem(SECRET_KEY);
  if (!s) {
    const rnd = new Uint8Array(32);
    window.crypto.getRandomValues(rnd);
    s = bytesToB64(rnd);
    window.localStorage.setItem(SECRET_KEY, s);
  }
  return s;
}
async function sha256Hex(str) {
  const buf = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return bytesToHex(buf);
}

// The person's anonymous, device-derived witness token (writer when sending,
// receiver when holding). Distinct namespace from the Echo author_hash.
export async function witnessHash(userId) {
  if (!available() || !userId) return null;
  return sha256Hex(`witness::${userId}::${deviceSecret()}`);
}

// ── Witness Charter (shown once per device) ──────────────────────────────────
export function charterAccepted() {
  try { return window.localStorage.getItem(CHARTER_KEY) === "1"; } catch { return false; }
}
export function acceptCharter() {
  try { window.localStorage.setItem(CHARTER_KEY, "1"); } catch { /* ignore */ }
}

// ── gate progress (optimistic local mirror; server is authoritative) ─────────
function readSet(key) {
  try { return new Set(JSON.parse(window.localStorage.getItem(key) || "[]")); } catch { return new Set(); }
}
function writeSet(key, set) {
  try { window.localStorage.setItem(key, JSON.stringify([...set])); } catch { /* ignore */ }
}
export function rememberHeld(requestId) {
  if (!requestId) return;
  const s = readSet(HELD_KEY); s.add(requestId); writeSet(HELD_KEY, s);
}
export function heldCountLocal() { return readSet(HELD_KEY).size; }
export function hasHeldLocal(requestId) { return readSet(HELD_KEY).has(requestId); }

// ── the request I'm currently holding (so a refresh re-shows it) ─────────────
export function rememberClaim(requestId) {
  try { window.localStorage.setItem(CLAIM_KEY, requestId || ""); } catch { /* ignore */ }
}
export function currentClaim() {
  try { return window.localStorage.getItem(CLAIM_KEY) || null; } catch { return null; }
}
export function forgetClaim() {
  try { window.localStorage.removeItem(CLAIM_KEY); } catch { /* ignore */ }
}

// ── writer-held data-keys for zero-knowledge handoffs (FWWT2) ────────────────
// Under ZK the DEK is NOT sent with the entry; the writer's device keeps it here,
// keyed by request id, until a receiver claims and the writer wraps + delivers it.
// Dropped after delivery. (Only ever on this device; never sent as plaintext.)
const DEK_KEY = "fw_witness_dek_v1";
function readMap(key) {
  try { return JSON.parse(window.localStorage.getItem(key) || "{}") || {}; } catch { return {}; }
}
function writeMap(key, map) {
  try { window.localStorage.setItem(key, JSON.stringify(map)); } catch { /* ignore */ }
}
export function rememberDek(requestId, dekB64) {
  if (!requestId || !dekB64) return;
  const m = readMap(DEK_KEY); m[requestId] = dekB64; writeMap(DEK_KEY, m);
}
export function getDek(requestId) {
  if (!requestId) return null;
  return readMap(DEK_KEY)[requestId] || null;
}
export function forgetDek(requestId) {
  if (!requestId) return;
  const m = readMap(DEK_KEY); delete m[requestId]; writeMap(DEK_KEY, m);
}

// ── my own sent request (writer side) ────────────────────────────────────────
export function rememberSent(requestId) {
  try { window.localStorage.setItem(SENT_KEY, requestId || ""); } catch { /* ignore */ }
}
export function mySentId() {
  try { return window.localStorage.getItem(SENT_KEY) || null; } catch { return null; }
}
export function forgetSent() {
  try { window.localStorage.removeItem(SENT_KEY); } catch { /* ignore */ }
}
