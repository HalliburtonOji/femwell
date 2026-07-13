// Community Together (#5) — client API for the weekly shared activities (challenge + watch-along).
// Folded into the createCommunityPost dispatcher as together.* actions (50-fn cap, same pattern as
// dm.*). Aggregate-only + k-anon: the server returns counts, never per-person scores. Identity is
// the same anonymous device-derived author_hash used everywhere else.
import { base44 } from "@/api/base44Client";
import { communityHash } from "./communityAnon";

async function ta(action, payload, user) {
  const author_hash = await communityHash(user?.id);
  const r = await base44.functions.invoke("createCommunityPost", { action, user_id: user?.id, author_hash, ...payload });
  return r?.data ?? r ?? {};
}

export const togetherApi = {
  current: (user) => ta("together.current", {}, user),          // this week's activities + aggregate progress
  join: (user, activity_id) => ta("together.join", { activity_id }, user),   // "I'm in" (dedup per device)
  step: (user, activity_id) => ta("together.step", { activity_id }, user),   // "I did my bit" (+1, daily-capped)
};

// k-anon participant phrasing — never a raw count below a small floor
export function participantsLabel(n) {
  if (!n || n <= 0) return "Be the first in";
  if (n < 4) return "a few women are in";
  if (n < 12) return `${n} women are in`;
  return `${n} of us are in`;
}
