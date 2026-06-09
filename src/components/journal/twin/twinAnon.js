// twinAnon — anonymity helpers for Phase Twin.
//
// The twin token derives from a SEPARATE device secret (its own localStorage key),
// so a twin hash can never be correlated with an Echo author_hash or a Witness
// token. Nothing here reaches a server except the resulting hash + the current
// pair id (so a refresh re-finds the pairing).

const SECRET_KEY = "fw_twin_anon_v1";
const PAIR_KEY = "fw_twin_pair_v1";   // the pair id I'm currently in

function available() {
  try { return typeof window !== "undefined" && !!window.localStorage && !!window.crypto?.subtle; }
  catch { return false; }
}
export const twinAvailable = available;

function bytesToHex(buf) {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function bytesToB64(bytes) { let s = ""; for (const b of bytes) s += String.fromCharCode(b); return window.btoa(s); }

function deviceSecret() {
  if (!available()) throw new Error("twin-unavailable");
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

// The person's anonymous, device-derived twin token. Distinct namespace from
// Echo (author_hash) and Witness (witness token).
export async function twinHash(userId) {
  if (!available() || !userId) return null;
  return sha256Hex(`twin::${userId}::${deviceSecret()}`);
}

// ── the pairing I'm currently in (so a refresh re-shows it) ──────────────────
export function rememberPair(pairId) {
  try { window.localStorage.setItem(PAIR_KEY, pairId || ""); } catch { /* ignore */ }
}
export function currentPair() {
  try { return window.localStorage.getItem(PAIR_KEY) || null; } catch { return null; }
}
export function forgetPair() {
  try { window.localStorage.removeItem(PAIR_KEY); } catch { /* ignore */ }
}
