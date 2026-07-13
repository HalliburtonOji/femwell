// Community 1:1 / DM — the surface (safety-critical, 2026-07-13).
// WhatsApp-familiar, FemWell-warm: a conversations list (presence bloom + veiled alias + last line
// + time + unread + a Requests section) and a chat thread (bubbles — mine right oxblood→crimson,
// hers left paper — with timestamps, day dividers, a "…" menu for block/report/leave/how-this-works,
// and a compose bar with a sent tick). Identity is the same anonymous botanical alias + presence
// bloom used in the rooms — never a name, never location. Onboarding + conversation drivers included.
//
// EVERY hard rail is enforced server-side in the dm.* dispatcher; this UI never bypasses it:
//   • no cold DMs — you can only reply to a request or send inside an accepted thread
//   • every message is screened BEFORE delivery — a held message is shown to nobody; the sender gets
//     a gentle nudge, and a crisis message routes the sender to support (onCrisis), never a peer
//   • block / report / leave live in the "…" menu of every thread
//   • text only — there is no media button anywhere · there is no location field anywhere
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft, Send, MoreHorizontal, Flag, Ban, LogOut, ShieldCheck,
  Sparkles, Lock, MessageCircle, Check,
} from "lucide-react";
import { T, UI, Hand, PAPER_BG } from "@/components/journal/Editorial";
import PresenceBloom from "@/components/brand/PresenceBloom";
import { communityHash } from "./communityAnon";
import { dmApi } from "./dm";

const OXBLOOD = "#7A1A12";
const ONBOARD_KEY = "fw_dm_onboarded_v1";

// ── time helpers ─────────────────────────────────────────────────────────────
function fmtTime(iso) {
  const d = new Date(iso || 0);
  if (!iso || isNaN(d.getTime())) return "";
  let h = d.getHours(); const m = d.getMinutes();
  const ap = h >= 12 ? "pm" : "am"; h = h % 12; if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, "0")}${ap}`;
}
function dayKey(iso) { const d = new Date(iso || 0); return isNaN(d) ? "" : d.toISOString().slice(0, 10); }
function dayLabel(iso) {
  const d = new Date(iso || 0); if (isNaN(d)) return "";
  const today = new Date(); const y = new Date(); y.setDate(today.getDate() - 1);
  if (dayKey(iso) === dayKey(today.toISOString())) return "Today";
  if (dayKey(iso) === dayKey(y.toISOString())) return "Yesterday";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: d.getFullYear() === today.getFullYear() ? undefined : "numeric" });
}
function listStamp(iso) {
  if (!iso) return "";
  const d = new Date(iso); if (isNaN(d)) return "";
  const today = new Date();
  if (dayKey(iso) === dayKey(today.toISOString())) return fmtTime(iso);
  return dayLabel(iso);
}

// conversation drivers — warm openers that fill the compose (never auto-sent) ───
const STARTERS = [
  "Hi — thank you for reaching out.",
  "Hey. I saw your message and wanted to say hello.",
  "Hi, lovely to connect. How are you doing today?",
  "Thank you for this. What made you want to chat?",
];

const ghostBtn = {
  display: "inline-flex", alignItems: "center", gap: 6, background: "transparent",
  border: `1px solid ${T.paperDeep}`, borderRadius: 999, color: T.muted,
  fontFamily: UI, fontSize: 12.5, fontWeight: 700, cursor: "pointer", padding: "7px 11px",
};

// ── onboarding card — what it is / who / how to stay safe ─────────────────────
function Onboarding({ onDismiss }) {
  const rows = [
    { Icon: MessageCircle, t: "What this is", b: "A private, one-to-one space — just you and one other member. It's separate from the rooms, and no one else can see it." },
    { Icon: PresenceBloomInline, t: "Who you're talking to", b: "You're both anonymous. You'll see each other's flower and a gentle plant name — never a real name, and never anyone's location." },
    { Icon: ShieldCheck, t: "How you're kept safe", b: "Every message is checked before it arrives, so nothing unkind gets through. You can block, report, or quietly leave any chat, any time — it's in the ⋯ menu." },
  ];
  return (
    <div style={{ background: `linear-gradient(165deg, ${T.paperHi} 0%, ${T.gold}10 100%)`, border: `1px solid ${T.paperDeep}`, borderRadius: 16, padding: "17px 17px 15px", marginBottom: 16 }}>
      <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: T.gold, marginBottom: 10 }}>Messages</div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", marginBottom: 12 }}>
          <span style={{ flexShrink: 0, marginTop: 1 }}><r.Icon size={17} color={T.gold} /></span>
          <div>
            <div style={{ fontFamily: UI, fontSize: 13.5, fontWeight: 800, color: T.ink, marginBottom: 2 }}>{r.t}</div>
            <Hand size={15} color={T.inkSoft}>{r.b}</Hand>
          </div>
        </div>
      ))}
      <button onClick={onDismiss} style={{ width: "100%", marginTop: 4, background: OXBLOOD, color: "#fff", border: "none", borderRadius: 12, padding: "12px", fontFamily: UI, fontSize: 14, fontWeight: 800, cursor: "pointer" }}>Got it</button>
    </div>
  );
}
function PresenceBloomInline({ size = 17 }) { return <PresenceBloom hash="onboarding-seed" size={size} />; }

// ── conversations list ────────────────────────────────────────────────────────
function ConvRow({ c, onOpen }) {
  const isRequest = c.i_am_recipient && c.status === "pending";
  return (
    <button onClick={() => onOpen(c)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", background: c.unread ? `${T.gold}0C` : "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "12px 13px", marginBottom: 9, cursor: "pointer" }}>
      <PresenceBloom hash={c.other_hash} size={38} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontFamily: UI, fontSize: 14, fontWeight: 800, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.other_alias || "A friend"}</span>
          <span style={{ marginLeft: "auto", fontFamily: UI, fontSize: 11, color: T.muted, flexShrink: 0 }}>{listStamp(c.last_message_at)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 2 }}>
          <span style={{ minWidth: 0, flex: 1, fontFamily: UI, fontSize: 12.5, color: T.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontStyle: c.last_message_snippet ? "normal" : "italic" }}>
            {isRequest ? "wants to chat — tap to see" : c.status === "pending" ? "request sent — waiting to be accepted" : c.status === "blocked" ? "conversation closed" : c.last_message_snippet || (c.context ? `“${c.context}”` : "Say hello")}
          </span>
          {c.unread && <span style={{ width: 9, height: 9, borderRadius: 999, background: T.crimson, flexShrink: 0 }} />}
        </div>
      </div>
    </button>
  );
}

function ConversationsList({ onOpen, busy, convs }) {
  const requests = convs.filter((c) => c.i_am_recipient && c.status === "pending");
  const active = convs.filter((c) => !(c.i_am_recipient && c.status === "pending"));
  const showOnboard = useMemo(() => { try { return localStorage.getItem(ONBOARD_KEY) !== "1"; } catch { return true; } }, []);
  const [onboard, setOnboard] = useState(showOnboard);
  return (
    <div>
      {onboard && <Onboarding onDismiss={() => { try { localStorage.setItem(ONBOARD_KEY, "1"); } catch { /* ignore */ } setOnboard(false); }} />}

      {requests.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: T.crimson, marginBottom: 9 }}>Chat requests</div>
          {requests.map((c) => <ConvRow key={c.id} c={c} onOpen={onOpen} />)}
        </div>
      )}

      {active.length > 0 && requests.length > 0 && (
        <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: T.muted, marginBottom: 9 }}>Chats</div>
      )}
      {active.map((c) => <ConvRow key={c.id} c={c} onOpen={onOpen} />)}

      {!busy && convs.length === 0 && (
        <div style={{ textAlign: "center", padding: "26px 14px" }}>
          <div style={{ margin: "0 auto 12px", width: 48, height: 48, borderRadius: 999, background: `${T.gold}18`, display: "grid", placeItems: "center" }}><MessageCircle size={22} color={T.gold} /></div>
          <div style={{ fontFamily: UI, fontSize: 15, fontWeight: 800, color: T.ink, marginBottom: 6 }}>No messages yet</div>
          <Hand size={15} color={T.muted}>When something a woman shares in the rooms resonates, tap the ⋯ on her post and choose <b>Ask to chat privately</b>. She'll get a gentle request — and if she says yes, your conversation starts here.</Hand>
        </div>
      )}
      {busy && convs.length === 0 && <Hand size={15} color={T.muted}>Loading your conversations…</Hand>}
    </div>
  );
}

// ── one chat thread ───────────────────────────────────────────────────────────
function Thread({ user, myHash, conv, onBack, onCrisis, onConvChanged }) {
  const [messages, setMessages] = useState(null);
  const [status, setStatus] = useState(conv.status);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [held, setHeld] = useState(null);     // gentle "not sent" feedback
  const [menuOpen, setMenuOpen] = useState(false);
  const [showHow, setShowHow] = useState(false);
  const endRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const r = await dmApi.messages(user, conv.id);
      if (r?.messages) setMessages(r.messages);
      if (r?.conversation?.status) setStatus(r.conversation.status);
    } catch { setMessages((m) => m || []); }
  }, [user, conv.id]);

  useEffect(() => { load(); }, [load]);
  // light polling while the thread is open (no realtime infra) — 12s, paused off-thread
  useEffect(() => {
    const t = setInterval(load, 12000);
    return () => clearInterval(t);
  }, [load]);
  useEffect(() => { try { endRef.current?.scrollIntoView({ behavior: "smooth" }); } catch { /* ignore */ } }, [messages]);

  const canSend = status === "active";
  const isPendingRequestToMe = status === "pending" && conv.i_am_recipient;
  const isPendingFromMe = status === "pending" && conv.is_initiator;

  const send = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true); setHeld(null);
    try {
      const r = await dmApi.send(user, conv.id, body);
      if (r?.intercept) { onCrisis?.(); setDraft(""); setSending(false); return; }
      if (r?.delivered && r?.message) {
        setMessages((prev) => [...(prev || []), r.message]);
        setDraft("");
        onConvChanged?.();
      } else if (r?.held) {
        setHeld(r.message || "That message wasn't sent.");
      }
    } catch { setHeld("Couldn't send just now — try again in a moment."); }
    finally { setSending(false); }
  };

  const respond = async (accept) => {
    setSending(true);
    try { await dmApi.respond(user, conv.id, accept); setStatus(accept ? "active" : "declined"); onConvChanged?.(); if (!accept) onBack(); }
    catch { /* ignore */ } finally { setSending(false); }
  };
  const endThread = async (kind) => {
    setMenuOpen(false); setSending(true);
    try {
      if (kind === "block") await dmApi.block(user, conv.id);
      else if (kind === "leave") await dmApi.leave(user, conv.id);
      else if (kind === "report") { await dmApi.report(user, conv.id); }
      if (kind !== "report") { onConvChanged?.(); onBack(); return; }
      setHeld("Thank you — this has been sent to us to review. You can also block or leave from this menu.");
    } catch { /* ignore */ } finally { setSending(false); }
  };

  // group messages by day
  const grouped = useMemo(() => {
    const out = []; let last = null;
    (messages || []).forEach((m) => {
      const k = dayKey(m.created_date);
      if (k !== last) { out.push({ divider: dayLabel(m.created_date), key: "d" + k }); last = k; }
      out.push({ msg: m, key: m.id });
    });
    return out;
  }, [messages]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", ...PAPER_BG }}>
      {/* header */}
      <div style={{ position: "sticky", top: 0, zIndex: 5, display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: T.paperHi, borderBottom: `1px solid ${T.paperDeep}` }}>
        <button onClick={onBack} aria-label="Back" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.ink, display: "inline-flex", padding: 3 }}><ChevronLeft size={22} /></button>
        <PresenceBloom hash={conv.other_hash} size={34} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: UI, fontSize: 14.5, fontWeight: 800, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{conv.other_alias || "A friend"}</div>
          <div style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>anonymous · you're both veiled</div>
        </div>
        <div style={{ position: "relative" }}>
          <button onClick={() => setMenuOpen((o) => !o)} aria-label="More" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, display: "inline-flex", padding: 5 }}><MoreHorizontal size={20} /></button>
          {menuOpen && (
            <>
              <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
              <div role="menu" style={{ position: "absolute", top: "100%", right: 0, zIndex: 41, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 11, boxShadow: "0 6px 22px rgba(58,44,26,0.18)", padding: 5, minWidth: 190 }}>
                {[
                  { Icon: ShieldCheck, label: "How this works", on: () => { setMenuOpen(false); setShowHow(true); }, col: T.ink },
                  { Icon: Flag, label: "Report this chat", on: () => endThread("report"), col: T.ink },
                  { Icon: LogOut, label: "Leave quietly", on: () => endThread("leave"), col: T.ink },
                  { Icon: Ban, label: "Block", on: () => endThread("block"), col: T.crimson },
                ].map((it, i) => (
                  <button key={i} onClick={it.on} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: "transparent", border: "none", cursor: "pointer", color: it.col, fontFamily: UI, fontSize: 13, fontWeight: 600, padding: "10px 10px", borderRadius: 7, textAlign: "left" }}>
                    <it.Icon size={15} color={it.col === T.crimson ? T.crimson : T.muted} /> {it.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 8px", maxWidth: 460, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        {/* the "why" that opened this chat — a driver */}
        {conv.context && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <div style={{ maxWidth: "88%", background: `${T.gold}12`, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "9px 13px", textAlign: "center" }}>
              <div style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", color: T.gold, marginBottom: 3 }}>Why she reached out</div>
              <Hand size={14} color={T.inkSoft}>{conv.context}</Hand>
            </div>
          </div>
        )}

        {showHow && (
          <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 13, padding: "13px 14px", marginBottom: 14 }}>
            <Hand size={14} color={T.inkSoft}>You're both anonymous — no names, no location, ever. Every message is checked before it arrives, so nothing unkind gets through. If something's wrong, use <b>Report</b>, <b>Block</b>, or <b>Leave</b> in this menu. If you're really struggling, help is always a tap away.</Hand>
            <button onClick={() => setShowHow(false)} style={{ ...ghostBtn, marginTop: 10 }}>Close</button>
          </div>
        )}

        {messages === null && <Hand size={15} color={T.muted}>Opening your conversation…</Hand>}

        {grouped.map((g) => g.divider !== undefined ? (
          <div key={g.key} style={{ textAlign: "center", margin: "12px 0 10px" }}>
            <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, color: T.muted, background: `${T.paperDeep}44`, borderRadius: 999, padding: "3px 11px" }}>{g.divider}</span>
          </div>
        ) : (() => {
          const m = g.msg; const mine = m.sender_hash === myHash;
          return (
            <div key={g.key} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", marginBottom: 7 }}>
              <div style={{ maxWidth: "78%", padding: "9px 13px 7px", borderRadius: mine ? "15px 15px 4px 15px" : "15px 15px 15px 4px", background: mine ? `linear-gradient(160deg, ${OXBLOOD} 0%, ${T.crimson} 100%)` : T.paperHi, border: mine ? "none" : `1px solid ${T.paperDeep}`, boxShadow: "0 1px 3px rgba(58,44,26,0.08)" }}>
                <div style={{ fontFamily: UI, fontSize: 14.5, lineHeight: 1.42, color: mine ? "#fff" : T.ink, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.body}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3, marginTop: 3 }}>
                  <span style={{ fontFamily: UI, fontSize: 10, color: mine ? "rgba(255,255,255,0.72)" : T.muted }}>{fmtTime(m.created_date)}</span>
                  {mine && <Check size={12} color="rgba(255,255,255,0.72)" />}
                </div>
              </div>
            </div>
          );
        })())}

        {/* drivers: starter chips when the accepted thread has no messages yet */}
        {canSend && (messages || []).length === 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><Sparkles size={13} color={T.gold} /> A gentle way to begin:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {STARTERS.map((s, i) => (
                <button key={i} onClick={() => setDraft(s)} style={{ ...ghostBtn, fontWeight: 600, whiteSpace: "normal", textAlign: "left" }}>{s}</button>
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* footer — accept/decline for a request, else compose (or a closed notice) */}
      <div style={{ position: "sticky", bottom: 0, background: T.paperHi, borderTop: `1px solid ${T.paperDeep}`, padding: "10px 14px calc(12px + env(safe-area-inset-bottom))" }}>
        {held && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: `${T.crimson}0E`, border: `1px solid ${T.crimson}44`, borderRadius: 10, padding: "9px 11px", marginBottom: 9 }}>
            <ShieldCheck size={15} color={T.crimson} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontFamily: UI, fontSize: 12.5, color: T.inkSoft, lineHeight: 1.4 }}>{held}</span>
          </div>
        )}

        {isPendingRequestToMe ? (
          <div>
            <Hand size={14} color={T.inkSoft}>She's asked to chat with you. Only say yes if you'd like to.</Hand>
            <div style={{ display: "flex", gap: 9, marginTop: 10 }}>
              <button disabled={sending} onClick={() => respond(false)} style={{ ...ghostBtn, flex: 1, justifyContent: "center", padding: "12px" }}>No thanks</button>
              <button disabled={sending} onClick={() => respond(true)} style={{ flex: 1, background: OXBLOOD, color: "#fff", border: "none", borderRadius: 999, padding: "12px", fontFamily: UI, fontSize: 14, fontWeight: 800, cursor: "pointer" }}>Say yes</button>
            </div>
          </div>
        ) : isPendingFromMe ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", padding: "6px 0" }}>
            <Lock size={13} color={T.muted} />
            <span style={{ fontFamily: UI, fontSize: 12.5, color: T.muted }}>Waiting for her to accept — you'll be able to chat once she does.</span>
          </div>
        ) : canSend ? (
          <div style={{ display: "flex", gap: 9, alignItems: "flex-end" }}>
            <textarea value={draft} onChange={(e) => { setDraft(e.target.value); if (held) setHeld(null); }} placeholder="Write a message…" rows={1}
              style={{ flex: 1, resize: "none", minHeight: 44, maxHeight: 120, fontFamily: UI, fontSize: 16, lineHeight: 1.4, color: T.ink, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 22, padding: "11px 15px", outline: "none", boxSizing: "border-box" }} />
            <button disabled={sending || !draft.trim()} onClick={send} aria-label="Send" style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 999, border: "none", background: draft.trim() ? OXBLOOD : T.paperDeep, color: "#fff", cursor: draft.trim() ? "pointer" : "default", display: "grid", placeItems: "center" }}><Send size={18} /></button>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <span style={{ fontFamily: UI, fontSize: 12.5, color: T.muted }}>{status === "blocked" ? "This conversation is closed." : status === "left" ? "This conversation has ended." : status === "declined" ? "This request was declined." : "This chat isn't open."}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────
export default function DMView({ user, onBack, onCrisis }) {
  const [myHash, setMyHash] = useState(null);
  const [convs, setConvs] = useState([]);
  const [busy, setBusy] = useState(true);
  const [open, setOpen] = useState(null);   // the open conversation, or null (list)

  useEffect(() => { let a = true; communityHash(user?.id).then((h) => { if (a) setMyHash(h); }).catch(() => {}); return () => { a = false; }; }, [user?.id]);

  const reload = useCallback(async () => {
    setBusy(true);
    try { const r = await dmApi.conversations(user); setConvs(Array.isArray(r?.conversations) ? r.conversations : []); }
    catch { setConvs([]); } finally { setBusy(false); }
  }, [user]);
  useEffect(() => { reload(); }, [reload]);

  if (open) {
    // refresh the open conversation's shape from the list if it changed
    const live = convs.find((c) => c.id === open.id) || open;
    return <Thread user={user} myHash={myHash} conv={live} onCrisis={onCrisis}
      onBack={() => { setOpen(null); reload(); }} onConvChanged={reload} />;
  }

  return (
    <div style={{ minHeight: "100vh", ...PAPER_BG }}>
      <div style={{ maxWidth: 460, margin: "0 auto", padding: "22px 18px 60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <button onClick={onBack} style={{ ...ghostBtn }}><ChevronLeft size={15} /> Community</button>
          <h1 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 600, color: OXBLOOD, letterSpacing: -0.3 }}>Messages</h1>
        </div>
        <ConversationsList convs={convs} busy={busy} onOpen={(c) => { setOpen(c); }} />
      </div>
    </div>
  );
}
