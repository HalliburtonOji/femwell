// Events substance (#6) — go-together PODS (on the existing EventPod entity: client create + read
// permitted; hidden flag = admin moderation), plus device-local "get home safe" check-ins and event
// reminders. All UI-only on existing entities — no new backend. SAFETY-FIRST: never precise/home
// location; pods are pseudonymous + in-app only; the safe check-in is on YOUR phone (no external
// send). External ticket feeds (Ticketmaster/Skiddle) would need a fn + creds — FLAGGED, not built.
import { base44 } from "@/api/base44Client";
import { crisisCheck } from "@/components/community/communityConfig";

// ── go-together pods (EventPod) ──
export async function joinPod(user, event_id, alias, note) {
  const clean = String(note || "").trim().slice(0, 160);
  if (clean && crisisCheck(clean).intercept) return { intercept: true };
  try {
    const row = await base44.entities.EventPod.create({
      event_id: String(event_id), author_hash: alias?.hash || "",
      alias: alias?.name || "A woman going", note: clean, hidden: false,
      created_at: new Date().toISOString(),
    });
    return { ok: true, row };
  } catch { return { error: true }; }
}
export async function podFor(event_id) {
  try {
    const rows = await base44.entities.EventPod.filter({ event_id: String(event_id), hidden: false }, "-created_date", 60);
    return Array.isArray(rows) ? rows : [];
  } catch { return []; }
}

// ── "get home safe" check-in — DEVICE-LOCAL ONLY (no server, no external contact). A gentle
// self-timer: set an expected-back time before you go, tap "I'm safe" when home. If the time
// passes without a tap, the app nudges YOU to check in — nothing is sent anywhere. ──
const SAFE_KEY = "fw_ev_safe";
function readSafe() { try { return JSON.parse(localStorage.getItem(SAFE_KEY) || "{}") || {}; } catch { return {}; } }
function writeSafe(o) { try { localStorage.setItem(SAFE_KEY, JSON.stringify(o)); } catch { /* ignore */ } }
export function setSafeCheckin(eventId, title, backAtISO) {
  const o = readSafe(); o[eventId] = { title, backAt: backAtISO, set: new Date().toISOString() }; writeSafe(o);
}
export function clearSafeCheckin(eventId) { const o = readSafe(); delete o[eventId]; writeSafe(o); }
export function activeSafeCheckins() {
  const o = readSafe();
  return Object.entries(o).map(([eventId, v]) => ({ eventId, ...v }));
}

// ── event reminders — DEVICE-LOCAL flag ("remind me"); surfaced in-app near the time. ──
const REM_KEY = "fw_ev_remind";
function readRem() { try { return JSON.parse(localStorage.getItem(REM_KEY) || "{}") || {}; } catch { return {}; } }
function writeRem(o) { try { localStorage.setItem(REM_KEY, JSON.stringify(o)); } catch { /* ignore */ } }
export function isReminding(eventId) { return !!readRem()[eventId]; }
export function toggleRemind(eventId, title) {
  const o = readRem();
  if (o[eventId]) delete o[eventId]; else o[eventId] = { title, at: new Date().toISOString() };
  writeRem(o); return !!o[eventId];
}
