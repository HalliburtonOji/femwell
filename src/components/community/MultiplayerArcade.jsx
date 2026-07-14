// Community Games multiplayer (#7) — "play a real woman". Async, turn-based (Connect 4 · Tic-tac-toe)
// vs an anonymous opponent. Server-authoritative moves, no free-text (preset emotes only), block/
// report/forfeit, no-shame framing. Sits ALONGSIDE the single-player arcade (nothing stripped).
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Users, ChevronLeft, Flag, LogOut, Copy, Check, Swords, Clock } from "lucide-react";
import { T, UI, Hand } from "@/components/journal/Editorial";
import PresenceBloom from "@/components/brand/PresenceBloom";
import { gameApi, GAME_EMOTES, GAMES_MP } from "@/components/community/gamematch";

const A_COL = "#BC2E27";   // player A disc (crimson)
const B_COL = "#A8893F";   // player B disc (gold)
const ghost = { display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 999, color: T.muted, fontFamily: UI, fontSize: 12.5, fontWeight: 700, cursor: "pointer", padding: "7px 12px" };
const primary = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, background: "#7A1A12", color: "#fff", border: "none", borderRadius: 12, fontFamily: UI, fontSize: 14, fontWeight: 800, cursor: "pointer", padding: "12px 16px" };

function Disc({ v, size, me }) {
  const bg = v === "1" ? A_COL : v === "2" ? B_COL : "transparent";
  return <span style={{ width: size, height: size, borderRadius: 999, background: v === "0" ? T.paper : bg, boxShadow: v === "0" ? `inset 0 0 0 1px ${T.paperDeep}` : `inset 0 -2px 3px rgba(0,0,0,0.18)`, display: "block", position: "relative" }}>
    {v !== "0" && me === v && <span style={{ position: "absolute", inset: 0, borderRadius: 999, boxShadow: `0 0 0 2px ${T.paperHi}, 0 0 0 3.5px ${v === "1" ? A_COL : B_COL}` }} />}
  </span>;
}

function Board({ match, onMove, myMark }) {
  const b = match.board || "";
  if (match.game === "tictactoe") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, maxWidth: 260, margin: "0 auto" }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <button key={i} onClick={() => onMove(i)} disabled={!match.myTurn || b[i] !== "0"} aria-label={`cell ${i}`}
            style={{ aspectRatio: "1", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 12, display: "grid", placeItems: "center", cursor: match.myTurn && b[i] === "0" ? "pointer" : "default" }}>
            {b[i] !== "0" && <Disc v={b[i]} size={44} me={myMark} />}
          </button>
        ))}
      </div>
    );
  }
  // connect-4 — tap a column to drop
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5, background: `${T.plum || "#8E6E8E"}22`, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: 7, maxWidth: 340, margin: "0 auto" }}>
      {Array.from({ length: 7 }).map((_, col) => {
        const full = b[col] !== "0";   // top cell of column filled
        return (
          <button key={col} onClick={() => onMove(col)} disabled={!match.myTurn || full} aria-label={`column ${col + 1}`}
            style={{ display: "flex", flexDirection: "column", gap: 5, background: "transparent", border: "none", padding: 0, cursor: match.myTurn && !full ? "pointer" : "default" }}>
            {Array.from({ length: 6 }).map((__, row) => <Disc key={row} v={b[row * 7 + col] || "0"} size="100%" me={myMark} />)}
          </button>
        );
      })}
    </div>
  );
}

function MatchBoard({ user, matchId, onExit }) {
  const [match, setMatch] = useState(null);
  const [busy, setBusy] = useState(false);
  const [menu, setMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  const load = useCallback(async () => {
    try { const r = await gameApi.state(user, matchId); if (r?.match) setMatch(r.match); } catch { /* ignore */ }
  }, [user, matchId]);
  useEffect(() => { load(); }, [load]);
  // poll while it's not my turn / still waiting, so her move / join appears
  useEffect(() => {
    if (!match) return;
    const shouldPoll = match.status === "waiting" || (match.status === "active" && !match.myTurn);
    if (timer.current) clearInterval(timer.current);
    if (shouldPoll) timer.current = setInterval(load, 4000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [match, load]);

  const myMark = match?.iAm === "a" ? "1" : match?.iAm === "b" ? "2" : "";
  const move = async (spot) => {
    if (!match || busy || !match.myTurn) return;
    setBusy(true);
    // optimistic: reflect my disc immediately
    try { const r = await gameApi.move(user, matchId, spot); if (r?.match) setMatch(r.match); } catch { /* ignore */ } finally { setBusy(false); }
  };
  const emote = async (e) => { try { await gameApi.emote(user, matchId, e); await load(); } catch { /* ignore */ } };
  const end = async (kind) => {
    setMenu(false);
    try { if (kind === "forfeit") await gameApi.forfeit(user, matchId); else if (kind === "report") { await gameApi.report(user, matchId); await gameApi.forfeit(user, matchId); } } catch { /* ignore */ }
    onExit?.();
  };
  const copyCode = () => { try { navigator.clipboard?.writeText(matchId); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ } };

  if (!match) return <div style={{ padding: 20 }}><Hand size={15} color={T.muted}>Opening the board…</Hand></div>;

  const g = GAMES_MP.find((x) => x.key === match.game);
  const oppEmote = match.iAm === "a" ? match.b_emote : match.a_emote;
  let statusLine, statusCol = T.muted;
  if (match.status === "waiting") statusLine = match.invite ? "Waiting for your room-mate to join…" : "Finding someone to play…";
  else if (match.status === "finished") {
    statusLine = match.winner === "draw" ? "A draw — well matched." : (match.winner === match.iAm ? "You won this one — nicely played." : "She got there first — good game.");
    statusCol = match.winner === match.iAm ? T.sage || "#8FAF8F" : T.ink;
  } else statusLine = match.myTurn ? "Your turn" : `${match.opponent_alias || "She"}'s turn — she’ll be back`;

  return (
    <div>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <button onClick={onExit} style={{ ...ghost }}><ChevronLeft size={14} /> Games</button>
        {match.opponent_alias && <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginLeft: 4 }}><PresenceBloom hash={match.iAm === "a" ? "b" + matchId : "a" + matchId} size={22} /><span style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.ink }}>{match.opponent_alias}</span></div>}
        <div style={{ position: "relative", marginLeft: "auto" }}>
          <button onClick={() => setMenu((o) => !o)} aria-label="Match options" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, padding: 5 }}>⋯</button>
          {menu && (
            <>
              <div onClick={() => setMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
              <div style={{ position: "absolute", right: 0, top: "100%", zIndex: 41, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 10, boxShadow: "0 6px 20px rgba(58,44,26,0.18)", padding: 5, minWidth: 150 }}>
                <button onClick={() => end("forfeit")} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", background: "transparent", border: "none", cursor: "pointer", color: T.ink, fontFamily: UI, fontSize: 13, fontWeight: 600, padding: "9px 10px", borderRadius: 7, textAlign: "left" }}><LogOut size={14} color={T.muted} /> Forfeit / leave</button>
                <button onClick={() => end("report")} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", background: "transparent", border: "none", cursor: "pointer", color: T.crimson, fontFamily: UI, fontSize: 13, fontWeight: 600, padding: "9px 10px", borderRadius: 7, textAlign: "left" }}><Flag size={14} color={T.crimson} /> Report & leave</button>
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 19, fontWeight: 600, color: T.ink }}>{g?.name}</div>
        <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: statusCol, marginTop: 2, display: "inline-flex", alignItems: "center", gap: 6 }}>{match.status === "active" && !match.myTurn && <Clock size={13} />} {statusLine}</div>
      </div>
      {match.status === "active" && (
        <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, textAlign: "center", marginBottom: 12 }}>You’re {match.iAm === "a" ? "crimson" : "gold"} · no rush — take your turn whenever</div>
      )}

      {/* invite code */}
      {match.status === "waiting" && match.invite && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 14 }}>
          <span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>Share this code:</span>
          <code style={{ fontFamily: "monospace", fontSize: 12, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 7, padding: "5px 9px", color: T.ink }}>{matchId.slice(-8)}</code>
          <button onClick={copyCode} style={{ ...ghost, padding: "6px 10px" }}>{copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}</button>
        </div>
      )}

      <Board match={match} onMove={move} myMark={myMark} />

      {/* opponent's last emote */}
      {oppEmote && <div style={{ textAlign: "center", marginTop: 12, fontFamily: UI, fontSize: 12.5, color: T.muted }}><b>{match.opponent_alias || "She"}:</b> “{oppEmote}”</div>}

      {/* preset emotes (no free text) */}
      {match.status === "active" && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginTop: 14 }}>
          {GAME_EMOTES.map((e) => <button key={e} onClick={() => emote(e)} style={{ ...ghost, padding: "6px 11px", fontWeight: 600 }}>{e}</button>)}
        </div>
      )}
      {match.status === "finished" && (
        <div style={{ textAlign: "center", marginTop: 16 }}><button onClick={onExit} style={{ ...primary }}>Back to games</button></div>
      )}
    </div>
  );
}

export default function MultiplayerArcade({ user }) {
  const [pick, setPick] = useState("connect4");
  const [openId, setOpenId] = useState(null);
  const [mine, setMine] = useState([]);
  const [busy, setBusy] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [err, setErr] = useState("");

  const loadMine = useCallback(async () => {
    try { const r = await gameApi.mine(user); setMine(Array.isArray(r?.matches) ? r.matches : []); } catch { setMine([]); }
  }, [user]);
  useEffect(() => { if (!openId) loadMine(); }, [openId, loadMine]);

  const find = async () => { setBusy(true); setErr(""); try { const r = await gameApi.find(user, pick); if (r?.match) setOpenId(r.match.id); } catch { setErr("Couldn’t start a game just now."); } finally { setBusy(false); } };
  const invite = async () => { setBusy(true); setErr(""); try { const r = await gameApi.invite(user, pick); if (r?.match) setOpenId(r.match.id); } catch { setErr("Couldn’t create an invite just now."); } finally { setBusy(false); } };
  const joinByCode = async () => {
    const code = joinCode.trim(); if (!code) return;
    setBusy(true); setErr("");
    try { const r = await gameApi.join(user, code); if (r?.match?.id) { setOpenId(r.match.id); setJoinCode(""); } else setErr(r?.message || "No open game with that code."); }
    catch { setErr("Couldn’t join that game."); } finally { setBusy(false); }
  };

  if (openId) return <MatchBoard user={user} matchId={openId} onExit={() => { setOpenId(null); loadMine(); }} />;

  const yourTurn = mine.filter((m) => m.myTurn);
  const waiting = mine.filter((m) => m.status === "waiting");
  const active = mine.filter((m) => m.status === "active" && !m.myTurn);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <Swords size={17} color={A_COL} />
        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 600, color: T.ink }}>Play a real woman</div>
      </div>
      <Hand size={14.5} color={T.muted} style={{ marginBottom: 12 }}>Take on another woman here — anonymous, turn-based, no rush. There’s no chat, just the game and a kind word. Play whenever; she’ll get her turn when she’s back.</Hand>

      {/* your-turn nudge */}
      {yourTurn.length > 0 && (
        <button onClick={() => setOpenId(yourTurn[0].id)} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", textAlign: "left", background: `linear-gradient(160deg, ${T.paperHi} 0%, ${A_COL}12 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${A_COL}`, borderRadius: 13, padding: "12px 14px", marginBottom: 12, cursor: "pointer" }}>
          <span style={{ width: 30, height: 30, borderRadius: 999, background: `${A_COL}22`, display: "grid", placeItems: "center", flexShrink: 0 }}><Swords size={15} color={A_COL} /></span>
          <span style={{ flex: 1 }}><span style={{ display: "block", fontFamily: "'Fraunces',serif", fontSize: 15, fontWeight: 700, color: T.ink }}>It’s your turn{yourTurn.length > 1 ? ` in ${yourTurn.length} games` : ""}</span><span style={{ fontFamily: UI, fontSize: 11.5, color: T.muted }}>vs {yourTurn[0].opponent_alias || "a woman here"} — tap to play your move</span></span>
        </button>
      )}

      {/* game picker */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {GAMES_MP.map((g) => (
          <button key={g.key} onClick={() => setPick(g.key)} style={{ flex: 1, textAlign: "left", background: pick === g.key ? `${A_COL}0E` : T.paperHi, border: `1px solid ${pick === g.key ? A_COL : T.paperDeep}`, borderRadius: 13, padding: "11px 12px", cursor: "pointer" }}>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 15.5, fontWeight: 600, color: T.ink }}>{g.name}</div>
            <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, lineHeight: 1.35, marginTop: 2 }}>{g.blurb}</div>
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <button disabled={busy} onClick={find} style={{ ...primary, flex: 1, minWidth: 150, opacity: busy ? 0.7 : 1 }}><Users size={15} /> Play someone</button>
        <button disabled={busy} onClick={invite} style={{ ...ghost, flex: 1, minWidth: 130, justifyContent: "center", padding: "12px 14px" }}>Invite a room-mate</button>
      </div>
      {/* join by code */}
      <div style={{ display: "flex", gap: 8, marginTop: 8, marginBottom: 4 }}>
        <input value={joinCode} onChange={(e) => { setJoinCode(e.target.value); if (err) setErr(""); }} placeholder="Join by code…" style={{ flex: 1, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "9px 12px", fontFamily: UI, fontSize: 13, color: T.ink }} />
        <button disabled={!joinCode.trim() || busy} onClick={joinByCode} style={{ ...ghost, padding: "9px 14px", opacity: joinCode.trim() ? 1 : 0.5 }}>Join</button>
      </div>
      {err && <div style={{ fontFamily: UI, fontSize: 12, color: T.crimson, marginTop: 6 }}>{err}</div>}

      {/* my ongoing games */}
      {(waiting.length > 0 || active.length > 0) && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: T.muted, marginBottom: 8 }}>Your games</div>
          {[...active, ...waiting].map((m) => {
            const g = GAMES_MP.find((x) => x.key === m.game);
            return (
              <button key={m.id} onClick={() => setOpenId(m.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "10px 13px", marginBottom: 8, cursor: "pointer" }}>
                <span style={{ flex: 1 }}><span style={{ display: "block", fontFamily: UI, fontSize: 13.5, fontWeight: 700, color: T.ink }}>{g?.name} · {m.opponent_alias || (m.status === "waiting" ? "waiting for a player" : "a woman here")}</span>
                  <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>{m.status === "waiting" ? (m.invite ? "invite — share the code" : "finding someone…") : "her turn"}</span></span>
                <ChevronLeft size={15} color={T.muted} style={{ transform: "rotate(180deg)" }} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
