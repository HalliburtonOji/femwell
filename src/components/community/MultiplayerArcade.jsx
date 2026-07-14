// Community Games multiplayer (#7) — "play a real woman". Async, turn-based (Connect 4 · Tic-tac-toe)
// vs an anonymous opponent. Server-authoritative moves, no free-text (preset emotes only), block/
// report/forfeit, no-shame framing. Sits ALONGSIDE the single-player arcade (nothing stripped).
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Users, ChevronLeft, Flag, LogOut, Copy, Check, Swords, Clock, MessageCircle, Send, ShieldCheck, Ban } from "lucide-react";
import { T, UI, Hand } from "@/components/journal/Editorial";
import PresenceBloom from "@/components/brand/PresenceBloom";
import { gameApi, GAME_EMOTES, GAMES_MP } from "@/components/community/gamematch";
import { dmApi } from "@/components/community/dm";
import { communityHash } from "@/components/community/communityAnon";

const OXBLOOD = "#7A1A12";
function fmtT(iso) { const d = new Date(iso || 0); if (isNaN(d.getTime())) return ""; let h = d.getHours(); const m = d.getMinutes(); const ap = h >= 12 ? "pm" : "am"; h = h % 12 || 12; return `${h}:${String(m).padStart(2, "0")}${ap}`; }

// ── IN-GAME CHAT — routes through the DM PIPELINE (not a separate game chat). game.chat establishes
// the moderated Conversation; from here every message uses dm.send (screen-BEFORE-deliver), and
// block/report/leave use the DM actions. Same veiled alias identity + all DM safety rails.
function GameChat({ user, matchId, otherAlias, onClose, onCrisis }) {
  const [convId, setConvId] = useState(null);
  const [state, setState] = useState("loading");   // loading | ready | blocked | error
  const [myHash, setMyHash] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [draft, setDraft] = useState("");
  const [held, setHeld] = useState(null);
  const [sending, setSending] = useState(false);
  const [menu, setMenu] = useState(false);
  const endRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => { let a = true; communityHash(user?.id).then((h) => { if (a) setMyHash(h); }).catch(() => {}); return () => { a = false; }; }, [user?.id]);

  useEffect(() => {
    (async () => {
      try {
        const r = await gameApi.chat(user, matchId);
        if (r?.blocked) { setState("blocked"); return; }
        if (!r?.conversation_id) { setState("error"); return; }
        setConvId(r.conversation_id); setState("ready");
      } catch { setState("error"); }
    })();
  }, [user, matchId]);

  const load = useCallback(async () => {
    if (!convId) return;
    try { const r = await dmApi.messages(user, convId); if (r?.messages) setMsgs(r.messages); } catch { /* ignore */ }
  }, [user, convId]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!convId) return; timer.current = setInterval(load, 6000); return () => { if (timer.current) clearInterval(timer.current); }; }, [convId, load]);
  useEffect(() => { try { endRef.current?.scrollIntoView({ behavior: "smooth" }); } catch { /* ignore */ } }, [msgs]);

  const send = async () => {
    const body = draft.trim();
    if (!body || sending || !convId) return;
    setSending(true); setHeld(null);
    try {
      const r = await dmApi.send(user, convId, body);
      if (r?.intercept) { onCrisis?.(); setDraft(""); }
      else if (r?.delivered && r?.message) { setMsgs((p) => [...(p || []), r.message]); setDraft(""); }
      else if (r?.held) setHeld(r.message || "That message wasn’t sent.");
    } catch { setHeld("Couldn’t send just now — try again."); }
    finally { setSending(false); }
  };
  const endThread = async (kind) => {
    setMenu(false);
    try { if (kind === "block") await dmApi.block(user, convId); else if (kind === "leave") await dmApi.leave(user, convId); else if (kind === "report") await dmApi.report(user, convId); } catch { /* ignore */ }
    if (kind !== "report") onClose?.(); else setHeld("Thank you — sent to us to review. You can also block or leave from the menu.");
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(20,14,8,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: T.paperHi, width: "100%", maxWidth: 460, borderRadius: "16px 16px 0 0", height: "76vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "12px 14px", borderBottom: `1px solid ${T.paperDeep}` }}>
          <MessageCircle size={16} color={OXBLOOD} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: UI, fontSize: 13.5, fontWeight: 800, color: T.ink }}>{otherAlias || "Your opponent"}</div>
            <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted }}>anonymous · every message screened before it arrives</div>
          </div>
          {convId && (
            <div style={{ position: "relative" }}>
              <button onClick={() => setMenu((o) => !o)} aria-label="Chat options" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, padding: 5 }}>⋯</button>
              {menu && (
                <>
                  <div onClick={() => setMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
                  <div style={{ position: "absolute", right: 0, top: "100%", zIndex: 41, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 10, boxShadow: "0 6px 20px rgba(58,44,26,0.18)", padding: 5, minWidth: 150 }}>
                    <button onClick={() => endThread("report")} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", background: "transparent", border: "none", cursor: "pointer", color: T.ink, fontFamily: UI, fontSize: 13, fontWeight: 600, padding: "9px 10px", borderRadius: 7, textAlign: "left" }}><Flag size={14} color={T.muted} /> Report</button>
                    <button onClick={() => endThread("leave")} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", background: "transparent", border: "none", cursor: "pointer", color: T.ink, fontFamily: UI, fontSize: 13, fontWeight: 600, padding: "9px 10px", borderRadius: 7, textAlign: "left" }}><LogOut size={14} color={T.muted} /> Leave chat</button>
                    <button onClick={() => endThread("block")} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", background: "transparent", border: "none", cursor: "pointer", color: T.crimson, fontFamily: UI, fontSize: 13, fontWeight: 600, padding: "9px 10px", borderRadius: 7, textAlign: "left" }}><Ban size={14} color={T.crimson} /> Block</button>
                  </div>
                </>
              )}
            </div>
          )}
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, fontFamily: UI, fontSize: 12.5, fontWeight: 700, padding: 5 }}>Close</button>
        </div>

        {/* body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px", background: T.paper }}>
          {state === "loading" && <Hand size={14} color={T.muted}>Opening a safe chat…</Hand>}
          {state === "blocked" && <Hand size={14} color={T.muted}>Chat isn’t available for this match.</Hand>}
          {state === "error" && <Hand size={14} color={T.muted}>Couldn’t open the chat just now.</Hand>}
          {state === "ready" && msgs.length === 0 && <div style={{ textAlign: "center", padding: "20px 10px" }}><Hand size={14} color={T.muted}>Say hello — keep it kind. Every message is checked before it reaches her.</Hand></div>}
          {state === "ready" && msgs.map((m) => {
            const mine = m.sender_hash === myHash;
            return (
              <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", marginBottom: 7 }}>
                <div style={{ maxWidth: "78%", padding: "8px 12px 6px", borderRadius: mine ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: mine ? `linear-gradient(160deg, ${OXBLOOD} 0%, ${T.crimson} 100%)` : T.paperHi, border: mine ? "none" : `1px solid ${T.paperDeep}` }}>
                  <div style={{ fontFamily: UI, fontSize: 14.5, lineHeight: 1.4, color: mine ? "#fff" : T.ink, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.body}</div>
                  <div style={{ textAlign: "right", fontFamily: UI, fontSize: 10, color: mine ? "rgba(255,255,255,0.72)" : T.muted, marginTop: 2 }}>{fmtT(m.created_date)}</div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {/* compose */}
        {state === "ready" && (
          <div style={{ borderTop: `1px solid ${T.paperDeep}`, padding: "10px 12px calc(12px + env(safe-area-inset-bottom))" }}>
            {held && <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: `${T.crimson}0E`, border: `1px solid ${T.crimson}44`, borderRadius: 9, padding: "8px 10px", marginBottom: 8 }}><ShieldCheck size={14} color={T.crimson} style={{ flexShrink: 0, marginTop: 1 }} /><span style={{ fontFamily: UI, fontSize: 12, color: T.inkSoft, lineHeight: 1.4 }}>{held}</span></div>}
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <textarea value={draft} onChange={(e) => { setDraft(e.target.value); if (held) setHeld(null); }} placeholder="Message her…" rows={1} style={{ flex: 1, resize: "none", minHeight: 42, maxHeight: 110, fontFamily: UI, fontSize: 16, lineHeight: 1.4, color: T.ink, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 20, padding: "10px 14px", outline: "none", boxSizing: "border-box" }} />
              <button disabled={sending || !draft.trim()} onClick={send} aria-label="Send" style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 999, border: "none", background: draft.trim() ? OXBLOOD : T.paperDeep, color: "#fff", cursor: draft.trim() ? "pointer" : "default", display: "grid", placeItems: "center" }}><Send size={17} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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

function MatchBoard({ user, matchId, onExit, onCrisis }) {
  const [match, setMatch] = useState(null);
  const [busy, setBusy] = useState(false);
  const [menu, setMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
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

      {/* MESSAGE HER — opens the moderated DM thread for this match (screen-before-deliver) */}
      {match.opponent_alias && (match.status === "active" || match.status === "finished") && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button onClick={() => setChatOpen(true)} style={{ ...ghost, padding: "9px 15px", color: "#7A1A12", borderColor: "#7A1A12" }}><MessageCircle size={14} /> Message her</button>
          <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, marginTop: 6 }}>A private, screened chat — every message is checked before it reaches her. Block or report any time.</div>
        </div>
      )}

      {match.status === "finished" && (
        <div style={{ textAlign: "center", marginTop: 16 }}><button onClick={onExit} style={{ ...primary }}>Back to games</button></div>
      )}

      {chatOpen && <GameChat user={user} matchId={matchId} otherAlias={match.opponent_alias} onClose={() => setChatOpen(false)} onCrisis={onCrisis} />}
    </div>
  );
}

export default function MultiplayerArcade({ user, onCrisis }) {
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

  if (openId) return <MatchBoard user={user} matchId={openId} onExit={() => { setOpenId(null); loadMine(); }} onCrisis={onCrisis} />;

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
