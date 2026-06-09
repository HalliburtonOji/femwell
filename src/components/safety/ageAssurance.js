// ageAssurance — 18+ gate persistence (scaffolding).
//
// SCOPE (flagged): this is the CODE HOOK for the 18+ boundary the LOCKED DECISIONS
// require on every peer surface (Community is adults-only; under-18s get no access,
// which collapses the ICO Children's-Code burden to a single 18+ gate). It records
// a self-declaration locally. The ASSURANCE METHOD (self-declaration vs. a stronger
// check) and ALL legal copy — the ToS line, the consent wording, the records kept —
// are Halli's sign-off as the named accountable person, NOT decided here.

const KEY = "fw_age_18_v1";   // { ok: true, at: ISO }

export function isAdultConfirmed() {
  try { return !!JSON.parse(window.localStorage.getItem(KEY) || "null")?.ok; }
  catch { return false; }
}
export function adultConfirmedAt() {
  try { return JSON.parse(window.localStorage.getItem(KEY) || "null")?.at || null; }
  catch { return null; }
}
export function confirmAdult() {
  try { window.localStorage.setItem(KEY, JSON.stringify({ ok: true, at: new Date().toISOString() })); }
  catch { /* ignore */ }
}
export function revokeAdult() {
  try { window.localStorage.removeItem(KEY); } catch { /* ignore */ }
}
