// Community · MENTORSHIP PAIRING — client API (F1, 2026-08-06).
// Thin wrapper over the createCommunityPost dispatcher's mentor.* actions (folded there — the ~118-fn
// platform cap blocks new function names). Identity is the SAME anonymous device-derived author_hash
// used across the rooms + proven server-side by device_secret (a forged hash is rejected, 403).
// Matching is on SEASON/STAGE only — NEVER location. Messaging reuses the DM Conversation, so every
// message inherits the crisis→banned→OpenAI screening. The server never returns the *_user_id
// accountability fields — everything here is anonymous alias only.
import { base44 } from "@/api/base44Client";
import { communityHash, communitySecret } from "./communityAnon";

async function mentor(action, payload, user) {
  const author_hash = await communityHash(user?.id);
  const device_secret = communitySecret();
  const r = await base44.functions.invoke("createCommunityPost", {
    action, user_id: user?.id, author_hash, device_secret, ...payload,
  });
  return r?.data ?? r ?? {};
}

export const mentorApi = {
  // opt in as "mentor" (accompany someone) or "mentee" (be accompanied), matched on season/stage.
  // Idempotent: returns an existing seeking/active pair rather than duplicating.
  optin: (user, { role, season, circle_key } = {}) =>
    mentor("mentor.optin", { role, season, circle_key }, user),
  // my current pairing (active or seeking), or { pair: null }
  mine: (user) => mentor("mentor.mine", {}, user),
  // end my pairing (closes the linked conversation too)
  end: (user, pair_id, reason) => mentor("mentor.end", { pair_id, reason }, user),
  // flag a pairing for human review (never auto-deleted)
  report: (user, pair_id) => mentor("mentor.report", { pair_id }, user),
};

export default mentorApi;
