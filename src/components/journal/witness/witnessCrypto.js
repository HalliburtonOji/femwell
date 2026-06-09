// witnessCrypto — encryption for the handed entry.
//
// IMPORTANT (honest crypto note): Witness is a handoff between two ANONYMOUS
// strangers with no shared key, yet the receiver must read the entry. True
// zero-knowledge E2E would need per-device keypairs + a server key-relay (a
// SecureStore v2 item, deferred). So here the entry is sealed with a FRESH random
// per-request key that travels INSIDE the envelope. This means:
//   • the entry is never stored or listed as plaintext (the pending-pool query
//     never returns the blob), and
//   • the blob is only ever released to the assigned receiver by claimWitness
//     (service-role, access-gated).
// It is at-rest + access-gated encryption, NOT zero-knowledge E2E. Treated as the
// #1 open item for a future SecureStore key-exchange upgrade.

const PREFIX = "FWWT1::";     // legacy: self-contained envelope (DEK rides inside)
const PREFIX2 = "FWWT2::";    // zero-knowledge: envelope carries NO key (DEK wrapped out-of-band)

export function witnessCryptoAvailable() {
  try { return typeof window !== "undefined" && !!window.crypto?.subtle && !!window.TextEncoder; }
  catch { return false; }
}

function b64(bytes) { let s = ""; for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b); return window.btoa(s); }
function unb64(str) { const bin = window.atob(str); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }

// Seal plaintext → self-contained envelope (carries its own one-time key).
export async function sealForWitness(plaintext) {
  if (!witnessCryptoAvailable()) throw new Error("crypto-unavailable");
  const key = await window.crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const iv = new Uint8Array(12); window.crypto.getRandomValues(iv);
  const ct = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(String(plaintext)));
  const raw = await window.crypto.subtle.exportKey("raw", key);
  const env = { v: 1, iv: b64(iv), ct: b64(ct), k: b64(raw) };
  return PREFIX + window.btoa(unescape(encodeURIComponent(JSON.stringify(env))));
}

// Open an envelope → plaintext (assigned receiver, having received the blob).
export async function openWitness(envelope) {
  if (!witnessCryptoAvailable()) throw new Error("crypto-unavailable");
  if (typeof envelope !== "string" || !envelope.startsWith(PREFIX)) throw new Error("bad-envelope");
  const env = JSON.parse(decodeURIComponent(escape(window.atob(envelope.slice(PREFIX.length)))));
  const key = await window.crypto.subtle.importKey("raw", unb64(env.k), { name: "AES-GCM" }, false, ["decrypt"]);
  const pt = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(env.iv) }, key, unb64(env.ct));
  return new TextDecoder().decode(pt);
}

// ── FWWT2 — zero-knowledge envelope (the DEK is NOT stored with the ciphertext) ──
// The entry is sealed with a fresh DEK; the envelope carries ONLY iv + ciphertext.
// The DEK (returned here, base64) stays on the WRITER's device until a receiver
// claims, then is wrapped to that receiver's public key (witnessKeys.wrapDek) and
// relayed by the server — which never sees it. The server-stored envelope alone is
// undecryptable. This is the true E2E path.
export async function sealForWitnessZK(plaintext) {
  if (!witnessCryptoAvailable()) throw new Error("crypto-unavailable");
  const key = await window.crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const iv = new Uint8Array(12); window.crypto.getRandomValues(iv);
  const ct = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(String(plaintext)));
  const raw = await window.crypto.subtle.exportKey("raw", key);
  const env = { v: 2, iv: b64(iv), ct: b64(ct) };   // NOTE: no `k` — the key is never embedded
  return {
    envelope: PREFIX2 + window.btoa(unescape(encodeURIComponent(JSON.stringify(env)))),
    dekB64: b64(raw),
  };
}

// Decrypt a FWWT2 envelope once the receiver has unwrapped the DEK (base64).
export async function decryptWithDek(envelope, dekB64) {
  if (!witnessCryptoAvailable()) throw new Error("crypto-unavailable");
  if (typeof envelope !== "string" || !envelope.startsWith(PREFIX2)) throw new Error("bad-envelope");
  const env = JSON.parse(decodeURIComponent(escape(window.atob(envelope.slice(PREFIX2.length)))));
  const key = await window.crypto.subtle.importKey("raw", unb64(dekB64), { name: "AES-GCM" }, false, ["decrypt"]);
  const pt = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(env.iv) }, key, unb64(env.ct));
  return new TextDecoder().decode(pt);
}

// 1 (legacy, key-in-envelope) | 2 (zero-knowledge) | 0 (unrecognised).
export function witnessEnvelopeVersion(envelope) {
  if (typeof envelope !== "string") return 0;
  if (envelope.startsWith(PREFIX2)) return 2;
  if (envelope.startsWith(PREFIX)) return 1;
  return 0;
}
