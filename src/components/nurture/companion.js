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

// ── her choices + the tend timestamp — CROSS-DEVICE via the CompanionState entity,
// with localStorage as a synchronous cache + offline/failure fallback. ──
//
// The entity (CompanionState) is the cross-device source of truth; localStorage mirrors it
// so the UI renders INSTANTLY and keeps working if a write wedges or the user is offline.
// Every write is OPTIMISTIC (localStorage first, synchronous) then a guarded, fire-and-forget
// entity upsert — never awaited on the interaction path, so a slow/hung backend never blocks
// or breaks the companion (see [[base44-fetch-no-timeout-hangs]]). Reads are guarded + fail-open.
import { base44 } from "@/api/base44Client";

const keyFor = (userId) => "fw_companion_" + hash(userId);
function read(userId) { try { return JSON.parse(localStorage.getItem(keyFor(userId)) || "{}") || {}; } catch { return {}; } }
function write(userId, obj) { try { localStorage.setItem(keyFor(userId), JSON.stringify(obj)); } catch { /* ignore */ } }

// remember the entity row id per user so write-through can update instead of duplicating
const rowIdCache = {};

// HYDRATE from the entity (call once on mount). Merges server state into the local cache —
// name/formKey from the server, tendedAt = the later of the two — so choices made on another
// device appear here. Fail-open: any error just leaves the local cache untouched.
export async function loadCompanionState(userId) {
  if (!userId) return false;
  try {
    const rows = await base44.entities.CompanionState.filter({ user_id: userId }, "-updated_date", 1).catch(() => []);
    const row = Array.isArray(rows) && rows[0];
    if (!row) return false;
    rowIdCache[userId] = row.id;
    const ov = read(userId);
    const localT = ov.tendedAt ? Date.parse(ov.tendedAt) : 0;
    const remoteT = row.tended_at ? Date.parse(row.tended_at) : 0;
    const merged = {
      name: row.name || ov.name || "",
      formKey: row.form_key || ov.formKey || "",
      tendedAt: (remoteT >= localT ? row.tended_at : ov.tendedAt) || null,
    };
    write(userId, merged);
    return true;
  } catch { return false; }
}

// WRITE-THROUGH upsert — fire-and-forget, guarded. Never awaited by the caller's UI path.
function persist(userId, patch) {
  if (!userId) return;
  const body = {};
  if ("name" in patch) body.name = patch.name;
  if ("formKey" in patch) body.form_key = patch.formKey;
  if ("tendedAt" in patch) body.tended_at = patch.tendedAt;
  (async () => {
    try {
      const id = rowIdCache[userId];
      if (id) { await base44.entities.CompanionState.update(id, body).catch(() => {}); return; }
      const rows = await base44.entities.CompanionState.filter({ user_id: userId }, "-updated_date", 1).catch(() => []);
      const existing = Array.isArray(rows) && rows[0];
      if (existing) { rowIdCache[userId] = existing.id; await base44.entities.CompanionState.update(existing.id, body).catch(() => {}); }
      else { const created = await base44.entities.CompanionState.create({ user_id: userId, ...body }).catch(() => null); if (created?.id) rowIdCache[userId] = created.id; }
    } catch { /* fail-open — localStorage already holds it */ }
  })();
}

// the resolved companion = seeded base + her overrides (from the local cache)
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
export function renameCompanion(userId, name) { const v = String(name || "").slice(0, 40); const ov = read(userId); ov.name = v; write(userId, ov); persist(userId, { name: v }); }
export function reshapeCompanion(userId, formKey) { const ov = read(userId); ov.formKey = formKey; write(userId, ov); persist(userId, { formKey }); }
export function tendCompanion(userId) { const t = new Date().toISOString(); const ov = read(userId); ov.tendedAt = t; write(userId, ov); persist(userId, { tendedAt: t }); return t; }
export function tendedToday(userId) {
  const t = read(userId).tendedAt;
  if (!t) return false;
  try { return new Date(t).toDateString() === new Date().toDateString(); } catch { return false; }
}
