// Community Games multiplayer (#7) — client API for async turn-based matches (game.* dispatcher
// actions, folded into createCommunityPost like dm.*/together.*). Anonymous (botanical alias),
// server-authoritative moves, no free-text (preset emotes only).
import { base44 } from "@/api/base44Client";
import { communityHash, botanicalAlias } from "./communityAnon";

async function gm(action, payload, user) {
  const author_hash = await communityHash(user?.id);
  const alias = botanicalAlias(author_hash);
  const r = await base44.functions.invoke("createCommunityPost", { action, user_id: user?.id, author_hash, alias, ...payload });
  return r?.data ?? r ?? {};
}

export const gameApi = {
  find: (user, game) => gm("game.find", { game }, user),          // matchmaking (join a waiting game, else create)
  invite: (user, game, room) => gm("game.invite", { game, room }, user),   // create a private invite match
  join: (user, match_id) => gm("game.join", { match_id }, user),  // join an invite by id
  state: (user, match_id) => gm("game.state", { match_id }, user),
  mine: (user) => gm("game.mine", {}, user),                      // my active/waiting matches (+ whose turn)
  move: (user, match_id, spot) => gm("game.move", { match_id, spot }, user),
  emote: (user, match_id, emote) => gm("game.emote", { match_id, emote }, user),
  forfeit: (user, match_id) => gm("game.forfeit", { match_id }, user),
  report: (user, match_id) => gm("game.report", { match_id }, user),
  chat: (user, match_id) => gm("game.chat", { match_id }, user),   // establish/open the DM thread for this match
};

export const GAME_EMOTES = ["Good move", "Nice one", "Well played", "Close!", "Good game", "Ha!", "Thinking…"];
export const GAMES_MP = [
  { key: "connect4", name: "Connect 4", cols: 7, rows: 6, blurb: "Drop your discs, line up four before she does." },
  { key: "tictactoe", name: "Tic-tac-toe", cols: 3, rows: 3, blurb: "A quick classic — a whole game in a minute." },
];
export const myAliasFor = async (user) => { const h = await communityHash(user?.id); return { hash: h, name: botanicalAlias(h) }; };
