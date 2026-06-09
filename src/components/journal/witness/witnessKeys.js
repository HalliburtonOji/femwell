// witnessKeys — per-device keypair + ECDH key-agreement for Witness ZERO-KNOWLEDGE
// E2E (the FWWT2 envelope). This is the piece that closes the #1 open item: in
// FWWT1 the entry's data-key (DEK) rode INSIDE the stored envelope, so a curious
// or compromised server could read it. Here the DEK never touches the server —
// it is wrapped to the RECEIVER's device public key via an ECDH shared secret that
// only the two devices can derive.
//
// Threat model (honest): this defeats a passive / at-rest / honest-but-curious
// server and any DB-at-rest compromise — the server holds ciphertext + two public
// keys + a wrapped key it cannot unwrap. It does NOT by itself defeat an ACTIVE
// man-in-the-middle that substitutes public keys (no key authentication / pinning
// yet — a documented residual, see WITNESS_ZK in witnessConfig).
//
// Key storage: the device ECDH keypair is persisted as JWK in localStorage, the
// SAME trust boundary the anonymity secret (fw_witness_anon_v1) already lives in —
// the private key never leaves the device. Consistent with the existing model and
// far simpler than IndexedDB CryptoKey storage.

const KEYPAIR_KEY = "fw_witness_dkp_v1";   // { pub: <jwk>, priv: <jwk> } for this device
const EC = { name: "ECDH", namedCurve: "P-256" };

export function witnessKeysAvailable() {
  try {
    return typeof window !== "undefined" && !!window.crypto?.subtle && !!window.localStorage
      && !!window.TextEncoder;
  } catch { return false; }
}

function b64(bytes) { let s = ""; for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b); return window.btoa(s); }
function unb64(str) { const bin = window.atob(str); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }

// Generate + persist (once) this device's ECDH keypair; return { pubJwk, privJwk }.
async function loadOrCreateJwks() {
  if (!witnessKeysAvailable()) throw new Error("witness-keys-unavailable");
  let raw = null;
  try { raw = JSON.parse(window.localStorage.getItem(KEYPAIR_KEY) || "null"); } catch { raw = null; }
  if (raw?.pub && raw?.priv) return raw;

  const kp = await window.crypto.subtle.generateKey(EC, true, ["deriveKey", "deriveBits"]);
  const pub = await window.crypto.subtle.exportKey("jwk", kp.publicKey);
  const priv = await window.crypto.subtle.exportKey("jwk", kp.privateKey);
  const rec = { pub, priv };
  try { window.localStorage.setItem(KEYPAIR_KEY, JSON.stringify(rec)); } catch { /* ignore */ }
  return rec;
}

// This device's PUBLIC key as a plain JWK object (safe to publish to the server).
export async function getDevicePublicJwk() {
  const { pub } = await loadOrCreateJwks();
  return pub;
}

// This device's PRIVATE key as a CryptoKey usable for ECDH deriveKey. Never leaves here.
export async function getDevicePrivateKey() {
  const { priv } = await loadOrCreateJwks();
  return window.crypto.subtle.importKey("jwk", priv, EC, false, ["deriveKey", "deriveBits"]);
}

// ECDH(myPrivate, peerPublic) -> a 256-bit AES-GCM wrapping key. Both devices derive
// the IDENTICAL key from their own private + the other's public; the server, holding
// only the two publics, cannot.
export async function deriveSharedWrapKey(myPrivateKey, peerPubJwk) {
  const peerPub = await window.crypto.subtle.importKey("jwk", peerPubJwk, EC, false, []);
  return window.crypto.subtle.deriveKey(
    { name: "ECDH", public: peerPub },
    myPrivateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

// Wrap the raw DEK (base64) under the ECDH wrap key -> portable blob the server relays.
export async function wrapDek(dekB64, wrapKey) {
  const iv = new Uint8Array(12); window.crypto.getRandomValues(iv);
  const ct = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, wrapKey, unb64(dekB64));
  return window.btoa(unescape(encodeURIComponent(JSON.stringify({ v: 1, iv: b64(iv), ct: b64(ct) }))));
}

// Unwrap the relayed blob back to the raw DEK (base64).
export async function unwrapDek(wrappedB64, wrapKey) {
  const o = JSON.parse(decodeURIComponent(escape(window.atob(wrappedB64))));
  const dek = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(o.iv) }, wrapKey, unb64(o.ct));
  return b64(dek);
}
