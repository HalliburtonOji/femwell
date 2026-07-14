// Community 1:1 / DM — client API (safety-critical, 2026-07-13).
// Thin wrapper over the createCommunityPost dispatcher's dm.* actions (folded there because the
// 50-fn platform cap blocks new function names). Identity is the SAME anonymous device-derived
// author_hash used across the rooms — never a user id, never a name, never location. Every call is
// server-mediated: the function verifies the caller is a participant, so a client can't read or
// write anyone else's thread. All moderation-before-delivery happens server-side in dm.send.
import { base44 } from "@/api/base44Client";
import { communityHash, communitySecret } from "./communityAnon";

async function dm(action, payload, user) {
  const author_hash = await communityHash(user?.id);
  // device_secret PROVES this author_hash belongs to the authenticated caller (server verifies;
  // a forged/harvested hash is rejected). See communityAnon.communitySecret.
  const device_secret = communitySecret();
  const r = await base44.functions.invoke("createCommunityPost", {
    action, user_id: user?.id, author_hash, device_secret, ...payload,
  });
  return r?.data ?? r ?? {};
}

export const dmApi = {
  // request-to-chat (no cold DMs): creates a PENDING conversation; the recipient must accept.
  // Target the OTHER woman by her POST id (or comment id) — the server resolves her identity
  // server-side, so the client never harvests/sends a raw author_hash. (Aliases are derived
  // server-side too.) `target_hash` is still accepted as a transitional fallback.
  request: (user, { target_post_id, target_comment_id, target_hash, context } = {}) =>
    dm("dm.request", { target_post_id, target_comment_id, target_hash, context }, user),
  // recipient accepts / declines a pending request
  respond: (user, conversation_id, accept) =>
    dm("dm.respond", { conversation_id, accept: !!accept }, user),
  // my conversations (active + pending requests to me), newest activity first
  conversations: (user) => dm("dm.conversations", {}, user),
  // delivered messages of one of my conversations (marks me read)
  messages: (user, conversation_id) => dm("dm.messages", { conversation_id }, user),
  // send — screened BEFORE delivery server-side (crisis/unkind/flagged → held, never delivered)
  send: (user, conversation_id, body) => dm("dm.send", { conversation_id, body }, user),
  // end a thread from my side
  block: (user, conversation_id) => dm("dm.block", { conversation_id }, user),
  leave: (user, conversation_id) => dm("dm.leave", { conversation_id }, user),
  // flag for human review (not auto-deleted)
  report: (user, conversation_id) => dm("dm.report", { conversation_id }, user),
};
