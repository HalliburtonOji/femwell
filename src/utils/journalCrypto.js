// journalCrypto — REAL client-side encryption for the Journal's Sealed Letters.
//
// Phase 2. Uses the Web Crypto API (window.crypto.subtle): AES-GCM-256 for the
// cipher, with a 256-bit key DERIVED via PBKDF2-SHA256 from a per-device secret
// that lives only in this browser's localStorage and is NEVER sent to a server.
//
// The letter body is encrypted ON THE DEVICE before it is written to base44, so
// the stored `body` is ciphertext — the server (and Jess) cannot read a sealed
// letter. Decryption happens on the device, only when the seal date arrives and
// the writer breaks the seal. This is the "Locked to you. Always." principle and
// the master plan's Risk-02 bar (Day One's AES-GCM-256), delivered for real —
// not a plaintext gate.
//
// Envelope format (this whole string is stored in the entity `body` field):
//   FWSL1::<base64url(JSON{ v, kdf, iter, salt, iv, ct, trg })>
// Only `ct` (the ciphertext) is secret. `salt`/`iv` are public crypto inputs and
// `trg` is the non-sensitive unlock-trigger label (so the sealed list can show
// "opens at your next follicular" without decrypting anything).
//
// HONEST LIMITATION (documented for Halli in STATUS): the key is device-held,
// with no passphrase. A letter is therefore readable only on a browser that
// still holds the device secret; clearing site data loses the key and the letter
// stays permanently unreadable (which is also why even the server can't help).
// This is the standard trade-off for passphrase-less client-only E2E. A future
// SecureStore can layer a passphrase or cross-device key escrow on top.

export const ENVELOPE_PREFIX = "FWSL1::";
const DEVICE_SECRET_KEY = "fw_journal_securestore_v1";
const PBKDF2_ITER = 100000;

// ── availability ─────────────────────────────────────────────────────────────
// True only in a browser with SubtleCrypto + localStorage (i.e. not during SSR
// and not on legacy/insecure contexts where crypto.subtle is undefined).
export function cryptoAvailable() {
  try {
    return (
      typeof window !== "undefined" &&
      typeof window.crypto !== "undefined" &&
      !!window.crypto.subtle &&
      typeof window.crypto.getRandomValues === "function" &&
      typeof window.localStorage !== "undefined" &&
      typeof TextEncoder !== "undefined"
    );
  } catch {
    return false;
  }
}

// ── base64 <-> bytes (binary-safe) ───────────────────────────────────────────
function bytesToB64(bytes) {
  let bin = "";
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin);
}
function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// ── device secret (the only long-lived key material; never leaves the device) ─
function getDeviceSecret() {
  if (!cryptoAvailable()) throw new Error("crypto-unavailable");
  let stored = window.localStorage.getItem(DEVICE_SECRET_KEY);
  if (!stored) {
    const rnd = new Uint8Array(32);
    window.crypto.getRandomValues(rnd);
    stored = bytesToB64(rnd);
    window.localStorage.setItem(DEVICE_SECRET_KEY, stored);
  }
  return b64ToBytes(stored);
}

// True once a device secret exists — i.e. at least one letter has been sealed on
// this device, so decryption of this device's letters is possible.
export function hasDeviceKey() {
  try {
    return cryptoAvailable() && !!window.localStorage.getItem(DEVICE_SECRET_KEY);
  } catch {
    return false;
  }
}

async function deriveKey(secretBytes, saltBytes, iterations) {
  const baseKey = await window.crypto.subtle.importKey(
    "raw", secretBytes, { name: "PBKDF2" }, false, ["deriveKey"],
  );
  return window.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: saltBytes, iterations, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

// ── public API ───────────────────────────────────────────────────────────────

export function isEncryptedEnvelope(str) {
  return typeof str === "string" && str.startsWith(ENVELOPE_PREFIX);
}

// Encrypt a letter body. `trigger` is a small, non-sensitive label object stored
// in the clear inside the envelope so the sealed list can describe the unlock.
// `extraMeta` carries small NON-SECRET facts stored in the clear envelope header
// (e.g. Sealed Letters v2 threading: { thread: { rootId, replyTo, seq } }) so the
// vault can group letters into threads without decrypting any of them. Never put
// anything private here — only the ciphertext (ct) is secret.
export async function encryptText(plaintext, trigger = null, extraMeta = null) {
  if (!cryptoAvailable()) throw new Error("crypto-unavailable");
  const secret = getDeviceSecret();
  const salt = new Uint8Array(16);
  const iv = new Uint8Array(12);
  window.crypto.getRandomValues(salt);
  window.crypto.getRandomValues(iv);
  const key = await deriveKey(secret, salt, PBKDF2_ITER);
  const ctBuf = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(String(plaintext)),
  );
  const envelope = {
    v: 1,
    kdf: "PBKDF2-SHA256",
    iter: PBKDF2_ITER,
    salt: bytesToB64(salt),
    iv: bytesToB64(iv),
    ct: bytesToB64(new Uint8Array(ctBuf)),
    trg: trigger || undefined,
    meta: extraMeta || undefined,
  };
  return ENVELOPE_PREFIX + btoa(unescape(encodeURIComponent(JSON.stringify(envelope))));
}

// Parse the non-secret header of an envelope WITHOUT decrypting (for the list:
// trigger label, version, thread meta). Returns null if not a valid envelope.
export function readEnvelopeMeta(envelope) {
  if (!isEncryptedEnvelope(envelope)) return null;
  try {
    const json = decodeURIComponent(escape(atob(envelope.slice(ENVELOPE_PREFIX.length))));
    const obj = JSON.parse(json);
    return { v: obj.v, trigger: obj.trg || null, meta: obj.meta || null };
  } catch {
    return null;
  }
}

// Decrypt a letter body. Throws on a bad/foreign envelope or a missing/rotated
// device key (so callers can show an honest "couldn't open on this device" note).
export async function decryptText(envelope) {
  if (!cryptoAvailable()) throw new Error("crypto-unavailable");
  if (!isEncryptedEnvelope(envelope)) throw new Error("not-an-envelope");
  const json = decodeURIComponent(escape(atob(envelope.slice(ENVELOPE_PREFIX.length))));
  const obj = JSON.parse(json);
  const secret = getDeviceSecret();
  const key = await deriveKey(secret, b64ToBytes(obj.salt), obj.iter || PBKDF2_ITER);
  const ptBuf = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64ToBytes(obj.iv) },
    key,
    b64ToBytes(obj.ct),
  );
  return new TextDecoder().decode(ptBuf);
}
