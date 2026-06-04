// echoAnon — anonymity + local-only bookkeeping for the Echo Wall.
//
// THE ANONYMITY MODEL (v1):
//   An echo row carries NO user id, email or display name. The only link back
//   to a person is `author_hash` = SHA-256( userId :: deviceSecret ), where the
//   device secret lives only in this browser's localStorage and never leaves it.
//   • Genuinely anonymous: the stored row has no reversible link to the user.
//   • Retract-able: the author's own device can recompute the same hash and so
//     find and pull back its own echoes — WITHOUT de-anonymising anyone.
//   • No other client can compute this hash (it lacks this device's secret).
//
// HONEST LIMITATION (documented in STATUS): retract works from the same browser
// that posted (same device secret); clearing site data loses the ability to
// retract by hash — but echoes auto-fade in 48h regardless, so the blast radius
// is tiny. Platform-level created_by still records the creator at the base44
// layer; the app never writes user_id, never queries by it, and never surfaces
// it. Writing echoes under a service identity (true server-side anonymity) is
// the Q3 hardening.
//
// Reaction / report / rate-limit dedup is also local-only (one Echo entity, no
// backend function in v1), so it is best-effort on the device. This is called
// out honestly rather than pretended to be server-enforced.

const DEVICE_SALT_KEY = "fw_echo_anon_v1";       // separate from the sealed-letters key
const REACTED_KEY = "fw_echo_reacted_v1";        // { [echoId]: ["held","metoo"] }
const REPORTED_KEY = "fw_echo_reported_v1";      // [echoId]
const MINE_KEY = "fw_echo_mine_v1";              // [echoId] (for the pending/retract strip)
const RATE_KEY = "fw_echo_rate_v1";              // { day: "yyyy-mm-dd", n: <count> }

function available() {
  try {
    return (
      typeof window !== "undefined" &&
      !!window.crypto && !!window.crypto.subtle &&
      typeof window.crypto.getRandomValues === "function" &&
      typeof window.localStorage !== "undefined" &&
      typeof TextEncoder !== "undefined"
    );
  } catch { return false; }
}
export const anonAvailable = available;

function readJSON(key, fallback) {
  try { const v = window.localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function writeJSON(key, val) {
  try { window.localStorage.setItem(key, JSON.stringify(val)); } catch { /* ignore */ }
}

function bytesToHex(bytes) {
  return Array.from(new Uint8Array(bytes)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function bytesToB64(bytes) {
  let bin = ""; const a = new Uint8Array(bytes);
  for (let i = 0; i < a.length; i++) bin += String.fromCharCode(a[i]);
  return btoa(bin);
}

// The per-device secret (created once, never sent anywhere).
function deviceSecret() {
  if (!available()) throw new Error("anon-unavailable");
  let s = window.localStorage.getItem(DEVICE_SALT_KEY);
  if (!s) {
    const rnd = new Uint8Array(32);
    window.crypto.getRandomValues(rnd);
    s = bytesToB64(rnd);
    window.localStorage.setItem(DEVICE_SALT_KEY, s);
  }
  return s;
}

async function sha256Hex(str) {
  const buf = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return bytesToHex(buf);
}

// The author's anonymous, device-derived token. Stable on this device for this
// user; opaque and unlinkable to anyone else.
export async function authorHash(userId) {
  if (!available() || !userId) return null;
  return sha256Hex(`${userId}::${deviceSecret()}`);
}

// A one-way hash of the source entry id (for the author's own reference only).
export async function sourceEntryHash(entryId) {
  if (!available() || !entryId) return null;
  return sha256Hex(`entry::${entryId}::${deviceSecret()}`);
}

// ── reactions (local dedup; one-way — you can hold, you can't un-hold) ───────
export function hasReacted(echoId, kind) {
  const map = readJSON(REACTED_KEY, {});
  return Array.isArray(map[echoId]) && map[echoId].includes(kind);
}
export function markReacted(echoId, kind) {
  const map = readJSON(REACTED_KEY, {});
  const list = Array.isArray(map[echoId]) ? map[echoId] : [];
  if (!list.includes(kind)) list.push(kind);
  map[echoId] = list;
  writeJSON(REACTED_KEY, map);
}

// ── reports (local dedup) ────────────────────────────────────────────────────
export function hasReported(echoId) {
  return readJSON(REPORTED_KEY, []).includes(echoId);
}
export function markReported(echoId) {
  const list = readJSON(REPORTED_KEY, []);
  if (!list.includes(echoId)) { list.push(echoId); writeJSON(REPORTED_KEY, list); }
}

// ── my own echoes (for the pending / retract strip) ──────────────────────────
export function rememberMine(echoId) {
  const list = readJSON(MINE_KEY, []);
  if (!list.includes(echoId)) { list.push(echoId); writeJSON(MINE_KEY, list); }
}
export function forgetMine(echoId) {
  writeJSON(MINE_KEY, readJSON(MINE_KEY, []).filter((x) => x !== echoId));
}
export function myEchoIds() {
  return readJSON(MINE_KEY, []);
}

// ── rate limit (best-effort, on-device) ──────────────────────────────────────
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function echoesToday() {
  const r = readJSON(RATE_KEY, { day: "", n: 0 });
  return r.day === todayKey() ? r.n : 0;
}
export function atDailyLimit(limit) {
  return echoesToday() >= limit;
}
export function bumpEchoesToday() {
  const day = todayKey();
  const r = readJSON(RATE_KEY, { day: "", n: 0 });
  writeJSON(RATE_KEY, r.day === day ? { day, n: r.n + 1 } : { day, n: 1 });
}
