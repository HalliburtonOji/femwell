// Community · MEMBER-CREATED CLUBS — client API (F2, 2026-08-06).
// Thin wrapper over the createCommunityPost dispatcher's club.* actions (folded — the ~118-fn cap
// blocks new function names). SHIPPED BEHIND clubsConfig.CLUBS_USER_CREATE_ENABLED until the OSA/ICO
// floor is verified; the server ALSO gates club.create (returns { disabled:true } when off).
// The server never returns host_user_id (the accountable owner is server-only); the client only ever
// sees the anonymous host_alias. club.create screens name+line+intro before the club can exist.
import { base44 } from "@/api/base44Client";
import { communityHash, communitySecret } from "./communityAnon";

async function club(action, payload, user) {
  const author_hash = await communityHash(user?.id);
  const device_secret = communitySecret();   // proves the (owner) identity for create/remove
  const r = await base44.functions.invoke("createCommunityPost", {
    action, user_id: user?.id, author_hash, device_secret, ...payload,
  });
  return r?.data ?? r ?? {};
}

export const clubApi = {
  // start a member-hosted club (screened; identity-proven owner). { disabled:true } if the flag's off.
  create: (user, { name, line, intro, category } = {}) =>
    club("club.create", { name, line, intro, category }, user),
  // flag a whole club for review (auto-hides at the report threshold)
  report: (user, club_id) => club("club.report", { club_id }, user),
  // the owner (or an admin) removes their club
  remove: (user, club_id) => club("club.remove", { club_id }, user),
};

export default clubApi;
