// companion.js — per-user identity + device-local state for the Nurture Companion.
//
// UNIQUE PER USER: a deterministic seed from the account id gives each woman a distinct
// FORM (bloom species), an identity ACCENT colour, and a PERSONALITY — so two users never
// open the same companion. She can then CHANGE it (rename / reshape) — overrides stored
// device-local. Growth comes from real engagement (read elsewhere); this file is identity
// + her choices + the gentle "tend" timestamp. No scores, no streaks, never dies.

const FORMS = [
  { key: "peony",    name: "Peony",    petals: 8, round: true,  bell: false, fern: false },
  { key: "daisy",    name: "Daisy",    petals: 12, round: false, bell: false, fern: false },
  { key: "foxglove", name: "Foxglove", petals: 5, round: false, bell: true,  fern: false },
  { key: "fern",     name: "Fern",     petals: 0, round: false, bell: false, fern: true  },
  { key: "poppy",    name: "Poppy",    petals: 4, round: true,  bell: false, fern: false },
  { key: "forget",   name: "Forget-me-not", petals: 5, round: true, bell: false, fern: false },
];
export const FORM_LIST = FORMS;

// identity accent colours (the bit that stays HERS while the bloom tints with her phase)
const ACCENTS = ["#D4AF37", "#BC2E27", "#8FAF8F", "#8E6E8E", "#C17B4E", "#7FA0B0"];
const PERSONALITIES = [
  { key: "steady",  label: "Quiet & steady",  voice: "I'm here, in no hurry. We grow at our own pace." },
  { key: "curious", label: "Bright & curious", voice: "Ooh — what did we tend today? I love watching you go." },
  { key: "tender",  label: "Tender & deep",    voice: "I hold the soft things with you. Gently does it." },
  { key: "playful", label: "Playful & light",  voice: "Little and often, that's us. Come say hello." },
  { key: "wild",    label: "Wild & free",      voice: "Some days untamed, some days still — all of it allowed." },
];

// tiny deterministic string hash (FNV-ish) → unsigned int
function hash(str) {
  let h = 2166136261 >>> 0;
  const s = String(str || "anon");
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// the SEEDED (procedural) base companion for a user — stable for that account
export function baseCompanion(userId) {
  const h = hash(userId);
  // unsigned shifts (>>>): a signed >> on a hash with the high bit set yields a NEGATIVE
  // value, and negative % len → a negative index → undefined accent/personality.
  const form = FORMS[h % FORMS.length];
  const accent = ACCENTS[(h >>> 3) % ACCENTS.length];
  const personality = PERSONALITIES[(h >>> 6) % PERSONALITIES.length];
  const defaultName = `Little ${form.name}`;
  return { seed: h, form, accent, personality, defaultName };
}

// ── device-local overrides (her choices) + the tend timestamp ──
const keyFor = (userId) => "fw_companion_" + hash(userId);
function read(userId) { try { return JSON.parse(localStorage.getItem(keyFor(userId)) || "{}") || {}; } catch { return {}; } }
function write(userId, obj) { try { localStorage.setItem(keyFor(userId), JSON.stringify(obj)); } catch { /* ignore */ } }

// the resolved companion = seeded base + her overrides
export function getCompanion(userId) {
  const base = baseCompanion(userId);
  const ov = read(userId);
  const form = ov.formKey ? (FORMS.find((f) => f.key === ov.formKey) || base.form) : base.form;
  return {
    ...base,
    form,
    name: (ov.name && ov.name.trim()) || base.defaultName,
    tendedAt: ov.tendedAt || null,
    customised: !!(ov.name || ov.formKey),
  };
}
export function renameCompanion(userId, name) { const ov = read(userId); ov.name = String(name || "").slice(0, 40); write(userId, ov); }
export function reshapeCompanion(userId, formKey) { const ov = read(userId); ov.formKey = formKey; write(userId, ov); }
export function tendCompanion(userId) { const ov = read(userId); ov.tendedAt = new Date().toISOString(); write(userId, ov); return ov.tendedAt; }
export function tendedToday(userId) {
  const t = read(userId).tendedAt;
  if (!t) return false;
  try { return new Date(t).toDateString() === new Date().toDateString(); } catch { return false; }
}
