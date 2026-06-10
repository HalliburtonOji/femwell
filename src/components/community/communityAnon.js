// communityAnon — anonymity helpers for the Community (M1).
//
// A device-derived author token from a SEPARATE secret (its own localStorage key),
// so a community author_hash can't be correlated with Echo / Witness / Twin tokens.
// Per-device dedup for reactions, reports and one-a-day actions lives here too —
// nothing reaches a server but the resulting hash.

const SECRET_KEY = "fw_comm_anon_v1";
const REACTED_KEY = "fw_comm_reacted_v1";   // "{targetId}:{kind}" I've reacted to
const REPORTED_KEY = "fw_comm_reported_v1";  // target ids I've reported
const QOTD_KEY = "fw_comm_qotd_v1";          // "{day}" I've answered

function available() {
  try { return typeof window !== "undefined" && !!window.localStorage && !!window.crypto?.subtle; }
  catch { return false; }
}
export const communityAvailable = available;

function bytesToHex(buf) { return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join(""); }
function bytesToB64(bytes) { let s = ""; for (const b of bytes) s += String.fromCharCode(b); return window.btoa(s); }
function deviceSecret() {
  if (!available()) throw new Error("community-unavailable");
  let s = window.localStorage.getItem(SECRET_KEY);
  if (!s) { const r = new Uint8Array(32); window.crypto.getRandomValues(r); s = bytesToB64(r); window.localStorage.setItem(SECRET_KEY, s); }
  return s;
}
async function sha256Hex(str) {
  const buf = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return bytesToHex(buf);
}

// The person's anonymous, device-derived community token. Distinct namespace from
// echo:: / witness:: / twin::.
export async function communityHash(userId) {
  if (!available() || !userId) return null;
  return sha256Hex(`community::${userId}::${deviceSecret()}`);
}

// ── dedup sets ───────────────────────────────────────────────────────────────
function readSet(key) { try { return new Set(JSON.parse(window.localStorage.getItem(key) || "[]")); } catch { return new Set(); } }
function writeSet(key, set) { try { window.localStorage.setItem(key, JSON.stringify([...set])); } catch { /* ignore */ } }

export function hasReacted(targetId, kind) { return readSet(REACTED_KEY).has(`${targetId}:${kind}`); }
export function markReacted(targetId, kind) { const s = readSet(REACTED_KEY); s.add(`${targetId}:${kind}`); writeSet(REACTED_KEY, s); }
export function unmarkReacted(targetId, kind) { const s = readSet(REACTED_KEY); s.delete(`${targetId}:${kind}`); writeSet(REACTED_KEY, s); }

export function hasReported(targetId) { return readSet(REPORTED_KEY).has(targetId); }
export function markReported(targetId) { const s = readSet(REPORTED_KEY); s.add(targetId); writeSet(REPORTED_KEY, s); }

export function answeredQotd(day) { return readSet(QOTD_KEY).has(day); }
export function markQotd(day) { const s = readSet(QOTD_KEY); s.add(day); writeSet(QOTD_KEY, s); }
