// Community — the PRODUCTION editorial Community (M1 · Phase 3.5a route correction).
//
// Productionises the approved Demo 6 (rooms-as-doors home + tabs-inside hybrid) into
// the real /Community, wired to live data. Whole-life, anonymous-first, 18+, no
// scoreboards / no vanity counts, Jess as host. Cream/ink editorial, Ephesis +
// Cormorant, Lucide only, no emoji. Replaces the MP8 forum.
//
// M1 surfaces: rooms-as-doors home + k-anon ambient presence · Question of the Day ·
// the whole-life rooms · the Lounge with OPEN comments (open-write default +
// per-post reaction-only) + kind reactions (never counted) + report→hide. Every
// text input runs a crisis pre-check (UK resources) and posts via service-role
// functions (created_by = service; only a device hash stored). Wrapped in the 18+
// AgeGate. M2: OpenAI moderation (harmful→removed/declined, health-allowlisted,
// borderline→flagged review queue) + Jess auto-support replies (judicious, tone-locked).

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Grid2x2, MessageCircle, Send, Lock, Unlock, Plus, Flag,
  ShieldAlert, Phone, Mic, Check, ChevronLeft, Users,
  HeartHandshake, Waves,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  T, SERIF, UI, Eyebrow, Rule, Script, Hand, InkFilter, EditorialFooter,
  useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";
import AgeGate from "@/components/safety/AgeGate";
import {
  communityHash, hasReacted, markReacted, unmarkReacted,
  hasReported, markReported, answeredQotd, markQotd,
} from "@/components/community/communityAnon";
import {
  MASTHEAD, ROOMS, REACTIONS, POST_MAX, COMMENT_DISCLAIMER, COMMENT_KINDNESS,
  COMMENT_MAX, COMMENT_EMPTY, MOD_REMOVED, UK_RESOURCES, FOOTER_LINE, PRESENCE_WINDOW_HRS,
  VOICE_NOTES_ENABLED, qotdForDay, presenceLine, crisisCheck,
} from "@/components/community/communityConfig";
import VoiceNoteComposer from "@/components/community/VoiceNoteComposer";
import ShareButton from "@/components/share/ShareButton";
import JessNudge from "@/components/jess/JessNudge";
import EchoWall from "@/components/journal/echo/EchoWall";
import {
  CIRCLES, CIRCLE_CATEGORIES, circleByKey, SENSITIVE_CONSENT,
  isJoined, markJoined, clearJoined, suggestedCircles,
} from "@/components/community/circlesConfig";
import {
  CLUBS, CLUB_CATEGORIES, clubByKey, CLUBS_USER_CREATE_ENABLED,
  isClubJoined, markClubJoined, clearClubJoined,
  isDailyReadClub, dailyReadClubFromKey,
} from "@/components/community/clubsConfig";
import { WISDOM_TOPICS, WISDOM_SEED, featuredWisdom } from "@/components/community/wisdomLibrary";
import { SEED_PICK, clubReached, setClubReached } from "@/components/community/bookClubConfig";
import {
  POOL_MOMENTS, REVEAL_K_FLOOR, weekKey, closePromptForWeek, closedThisWeek, markClosedWeek,
} from "@/components/community/ritualsConfig";
import { createPageUrl } from "@/utils";

const PLUM = "#241a26"; // the single permitted dark surface
const HANDFAM = '"Cormorant Garamond","Fraunces",Georgia,serif';

// ── Jess support (M2): judicious client gate ─────────────────────────────────
// Jess only ever leaves ONE reply, only on heavier/asking posts, and the server
// re-checks heaviness + dedups + lets the model decline. The client mirrors a light
// heaviness pre-check and a per-post-per-device "already asked" flag so we don't fire
// a function call on every thread that opens.
const JESS_CUES = [
  "struggl", "lonely", "alone", "scared", "afraid", "anxious", "anxiety", "overwhelm",
  "exhausted", "burnt out", "burnout", "cry", "tears", "breaking", "broken", "lost",
  "hopeless", "numb", "empty", "guilt", "ashamed", "shame", "grief", "grieving", "loss",
  "failed", "failing", "failure", "hurt", "pain", "low", "depress", "cope", "no one",
  "nobody", "unseen", "invisible", "worthless", "help", "advice", "anyone else",
  "does anyone", "is it normal", "worried", "frightened", "falling apart", "too much",
];
function clientHeavy(text) {
  const t = (text || "").toLowerCase();
  if ((text || "").trim().endsWith("?")) return true;
  return JESS_CUES.some((w) => t.includes(w));
}
const jessAsked = (id) => { try { return localStorage.getItem("fw_jess_req_" + id) === "1"; } catch { return false; } };
const markJessAsked = (id) => { try { localStorage.setItem("fw_jess_req_" + id, "1"); } catch { /* ignore */ } };

// ── games (M3): per-device "answered this round" flag (anonymous, like QOTD) ──
const gameAnswered = (id) => { try { return localStorage.getItem("fw_game_" + id) === "1"; } catch { return false; } };
const markGameAnswered = (id) => { try { localStorage.setItem("fw_game_" + id, "1"); } catch { /* ignore */ } };
function closesInLabel(closesAt) {
  const ms = Date.parse(closesAt || "") - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) return "closing now";
  const h = Math.round(ms / 3600000);
  if (h >= 2) return `closes in about ${h} hours`;
  const m = Math.max(1, Math.round(ms / 60000));
  return h === 1 ? "closes in about an hour" : `closes in about ${m} minutes`;
}

const inputStyle = {
  width: "100%", background: T.paperHi, border: `1px solid ${T.paperDeep}`,
  padding: "12px 14px", borderRadius: 3, resize: "none", fontFamily: SERIF, fontSize: 18,
  lineHeight: 1.5, color: T.ink, outline: "none", boxSizing: "border-box",
};
const primaryBtn = {
  display: "inline-flex", alignItems: "center", gap: 7, background: T.ink, color: T.paperHi,
  border: "none", borderRadius: 10, padding: "11px 18px", fontFamily: UI, fontSize: 13.5,
  fontWeight: 700, letterSpacing: 0.3, cursor: "pointer",
};
const ghostBtn = {
  display: "inline-flex", alignItems: "center", gap: 6, background: "transparent",
  border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "9px 14px",
  fontFamily: UI, fontSize: 12.5, fontWeight: 600, color: T.ink, cursor: "pointer",
};

// ── crisis sheet (UK resources) ──────────────────────────────────────────────
function CrisisSheet({ onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(36,26,38,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div role="dialog" aria-modal="true" aria-label="Support resources" onClick={(e) => e.stopPropagation()} style={{ background: T.paperHi, width: "100%", maxWidth: 480, borderRadius: "16px 16px 0 0", padding: "24px 22px 30px" }}>
        <div style={{ background: PLUM, borderRadius: 12, padding: "18px 18px 20px", marginBottom: 16 }}>
          <ShieldAlert size={22} style={{ color: T.blush, marginBottom: 8 }} />
          <Hand size={20} color="#F5E6D3" carve={false}>This reads as heavy — and a room of strangers isn{"’"}t the right shape for it. These people are there now, any time.</Hand>
        </div>
        {UK_RESOURCES.map((r) => (
          <div key={r.name} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "11px 13px", marginBottom: 9 }}>
            <Phone size={15} style={{ color: T.gold, marginTop: 2 }} />
            <div>
              <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.ink }}>{r.name}</div>
              <div style={{ fontFamily: UI, fontSize: 12.5, color: T.muted }}>{r.detail}</div>
            </div>
          </div>
        ))}
        <button onClick={onClose} style={{ ...primaryBtn, width: "100%", justifyContent: "center", marginTop: 8 }}>Close</button>
      </div>
    </div>
  );
}

// ── one post + its comments ──────────────────────────────────────────────────
function PostCard({ post, user, onCrisis, onChanged }) {
  const [comments, setComments] = useState(null);   // null = not loaded
  const [commentsErr, setCommentsErr] = useState(false);   // W5 — distinguish error from empty
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const isOpen = post.comments_mode !== "reaction";
  const jessTried = useRef(false);

  const loadComments = useCallback(async () => {
    let rows;
    try { rows = await base44.entities.Comment.filter({ post_id: post.id, hidden: false }, "created_date", 100); setCommentsErr(false); }
    catch (e) { console.error("comments load failed:", e); setCommentsErr(true); setComments([]); return; }
    const list = Array.isArray(rows) ? rows : [];
    setComments(list);

    // Judicious Jess: once per post per device, only if the thread is open, has no Jess
    // reply yet, and reads as heavier/asking. The server re-gates + the model may decline,
    // so a fired call can still come back empty — that's fine, we just don't ask again.
    if (!jessTried.current && isOpen && !list.some((c) => c.by === "jess")
        && clientHeavy(post.body) && !jessAsked(post.id)) {
      jessTried.current = true;
      markJessAsked(post.id);
      try {
        const r = await base44.functions.invoke("jessSupport", { post_id: post.id });
        const d = r?.data ?? r;
        if (d?.comment) {
          const rows2 = await base44.entities.Comment.filter({ post_id: post.id, hidden: false }, "created_date", 100).catch(() => []);
          if (Array.isArray(rows2)) setComments(rows2);
        }
      } catch { /* Jess staying quiet is acceptable; never block the thread */ }
    }
  }, [post.id, isOpen, post.body]);

  const toggleComments = () => { const next = !open; setOpen(next); if (next && comments === null) loadComments(); };

  const react = async (kind) => {
    if (hasReacted(post.id, kind)) return;
    markReacted(post.id, kind);
    onChanged?.();
    try {
      const wh = await communityHash(user?.id);
      const r = await base44.functions.invoke("reactCommunity", { user_id: user?.id, author_hash: wh, target_type: "post", target_id: post.id, kind });
      if (!(r?.data ?? r)?.ok) throw new Error("react rejected");
    } catch (e) { console.error("react failed:", e); unmarkReacted(post.id, kind); onChanged?.(); }
  };

  const report = async () => {
    if (hasReported(post.id)) return;
    markReported(post.id);
    try {
      const wh = await communityHash(user?.id);
      await base44.functions.invoke("reportCommunity", { user_id: user?.id, author_hash: wh, target_type: "post", target_id: post.id });
      onChanged?.();
    } catch (e) { console.error("report failed:", e); }
  };

  const sendComment = async () => {
    const text = draft.trim();
    if (!text || busy) return;
    if (crisisCheck(text).intercept) { onCrisis(); return; }
    setBusy(true);
    try {
      const wh = await communityHash(user?.id);
      const r = await base44.functions.invoke("addComment", { user_id: user?.id, author_hash: wh, post_id: post.id, body: text });
      const d = r?.data ?? r;
      if (d?.intercept) { onCrisis(); return; }
      setDraft("");
      await loadComments();
    } catch (e) { console.error("comment failed:", e); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 4, padding: "16px 17px", marginBottom: 14 }}>
      {post.domain && <Eyebrow color={T.gold} mb={6}>{post.domain}</Eyebrow>}
      <Hand size={20} color={T.ink} style={{ marginBottom: 12 }}>{post.body}</Hand>

      {/* reactions (never counted) + report */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, alignItems: "center" }}>
        {REACTIONS.map((k) => {
          const on = hasReacted(post.id, k);
          return (
            <button key={k} onClick={() => react(k)} style={{
              fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 0.3, cursor: on ? "default" : "pointer",
              padding: "4px 10px", borderRadius: 999, border: `1px solid ${on ? T.gold : T.paperDeep}`,
              background: on ? T.paper : "transparent", color: on ? T.gold : T.muted,
            }}>{k}</button>
          );
        })}
        <button onClick={report} aria-label="Report this post" title="Report" style={{ marginLeft: "auto", background: "transparent", border: "none", cursor: "pointer", color: T.muted, display: "inline-flex" }}>
          <Flag size={13} />
        </button>
      </div>

      {/* comments */}
      <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${T.paperDeep}` }}>
        {isOpen ? (
          <button onClick={toggleComments} style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted, display: "inline-flex", alignItems: "center", gap: 6, padding: 0 }}>
            <MessageCircle size={13} /> {open ? "Hide replies" : "Replies"}
          </button>
        ) : (
          <span style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Lock size={12} /> Reactions only on this one.
          </span>
        )}

        {isOpen && open && (
          <div style={{ marginTop: 10 }}>
            {comments === null && <Hand size={16} color={T.muted}>Loading the kind voices…</Hand>}
            {commentsErr && <Hand size={16} color={T.muted}>Couldn{"’"}t load replies just now. Try again in a moment.</Hand>}
            {!commentsErr && comments && comments.length === 0 && <Hand size={16} color={T.muted}>{COMMENT_EMPTY}</Hand>}
            {comments && comments.map((c) => (
              c.status === "removed" ? (
                <div key={c.id} style={{ fontFamily: UI, fontSize: 12, color: T.muted, fontStyle: "italic", padding: "7px 0" }}>{MOD_REMOVED}</div>
              ) : (
                <div key={c.id} style={{ background: c.by === "jess" ? T.paper : "transparent", border: c.by === "jess" ? `1px solid ${T.gold}` : "none", borderRadius: c.by === "jess" ? 8 : 0, padding: c.by === "jess" ? "9px 11px" : "7px 0", marginBottom: 4 }}>
                  {c.by === "jess" && <Eyebrow color={T.gold} mb={3}>Jess · here with you</Eyebrow>}
                  <Hand size={17} color={T.inkSoft}>{c.body}</Hand>
                </div>
              )
            ))}
            <div style={{ marginTop: 8 }}>
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={COMMENT_MAX} placeholder="A kind word… you don't have to fix it." style={{ ...inputStyle, minHeight: 56, fontSize: 16 }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted }}>{COMMENT_KINDNESS}</span>
                <button onClick={sendComment} disabled={!draft.trim() || busy} style={{ ...primaryBtn, padding: "8px 14px", opacity: (!draft.trim() || busy) ? 0.5 : 1 }}>
                  <Send size={13} /> {busy ? "Sending…" : "Reply"}
                </button>
              </div>
              <div style={{ fontFamily: UI, fontSize: 10, color: T.muted, marginTop: 6 }}>{COMMENT_DISCLAIMER}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── room composer ────────────────────────────────────────────────────────────
function RoomComposer({ room, circle, club, user, onCrisis, onPosted, onCancel, initialBody = "" }) {
  const [body, setBody] = useState(initialBody);
  const [mode, setMode] = useState("open");
  const [busy, setBusy] = useState(false);
  const [declined, setDeclined] = useState(false);
  const send = async () => {
    const text = body.trim();
    if (!text || busy) return;
    if (crisisCheck(text).intercept) { onCrisis(); return; }
    setBusy(true);
    setDeclined(false);
    try {
      const wh = await communityHash(user?.id);
      const r = await base44.functions.invoke("createCommunityPost", { user_id: user?.id, author_hash: wh, room, circle: circle || undefined, club: club || undefined, body: text, comments_mode: mode });
      const d = r?.data ?? r;
      if (d?.intercept) { onCrisis(); return; }
      if (d?.error === "rate") { setBusy(false); return; }
      if (d?.removed) { setDeclined(true); setBusy(false); return; }  // moderation declined it
      onPosted?.();
    } catch (e) { console.error("post failed:", e); }
    finally { setBusy(false); }
  };
  return (
    <div style={{ background: T.paperHi, border: `1px solid ${T.gold}`, borderRadius: 4, padding: "15px 16px", marginBottom: 16 }}>
      <Eyebrow mb={8}>Add to the room</Eyebrow>
      <textarea value={body} onChange={(e) => { setBody(e.target.value); if (declined) setDeclined(false); }} maxLength={POST_MAX} placeholder="Say it plainly — silly to serious, no names." style={{ ...inputStyle, minHeight: 90 }} />
      {declined && (
        <div style={{ marginTop: 8, fontFamily: UI, fontSize: 12, color: T.crimson, lineHeight: 1.45 }}>
          Jess held this one back — it reads as unkind for the room. Reword it and it'll go up.
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
        <button onClick={() => setMode(mode === "open" ? "reaction" : "open")} style={{ ...ghostBtn }}>
          {mode === "open" ? <Unlock size={13} /> : <Lock size={13} />}
          {mode === "open" ? "Open to replies" : "Reactions only"}
        </button>
        <button onClick={send} disabled={!body.trim() || busy} style={{ ...primaryBtn, marginLeft: "auto", opacity: (!body.trim() || busy) ? 0.5 : 1 }}>
          <Send size={13} /> {busy ? "Posting…" : "Post"}
        </button>
        <button onClick={onCancel} style={{ ...ghostBtn, border: "none" }}>Cancel</button>
      </div>
    </div>
  );
}

// ── Question of the Day ──────────────────────────────────────────────────────
function QotdCard({ user, onCrisis }) {
  const qotd = useMemo(() => qotdForDay(), []);
  const [answered, setAnswered] = useState(() => answeredQotd(qotd.day));
  const [draft, setDraft] = useState("");
  const [answers, setAnswers] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showThread, setShowThread] = useState(false);
  const [thread, setThread] = useState(null);   // null=unloaded, false=error, []=none

  const loadAnswers = useCallback(async () => {
    const rows = await base44.entities.QotdResponse.filter({ prompt_day: qotd.day, hidden: false }, "-created_date", 30).catch(() => []);
    setAnswers(Array.isArray(rows) ? rows : []);
  }, [qotd.day]);
  useEffect(() => { if (answered) loadAnswers(); }, [answered, loadAnswers]);

  // v2 — your own thread of days: your past answers, gently, with each day's question.
  // No streak, no count — just a thread of you. Read by your own anonymous author_hash.
  const loadThread = useCallback(async () => {
    setShowThread(true);
    if (thread !== null && thread !== false) return;
    try {
      const wh = await communityHash(user?.id);
      const rows = await base44.entities.QotdResponse.filter({ author_hash: wh }, "-created_date", 40);
      const list = (Array.isArray(rows) ? rows : []).filter((r) => r.prompt_day !== qotd.day);
      setThread(list);
    } catch (e) { console.error("qotd thread failed:", e); setThread(false); }
  }, [user?.id, qotd.day, thread]);

  const send = async () => {
    const text = draft.trim();
    if (!text || busy) return;
    if (crisisCheck(text).intercept) { onCrisis(); return; }
    setBusy(true);
    try {
      const wh = await communityHash(user?.id);
      const r = await base44.functions.invoke("answerQotd", { user_id: user?.id, author_hash: wh, prompt_day: qotd.day, prompt_key: qotd.key, body: text });
      const d = r?.data ?? r;
      if (d?.intercept) { onCrisis(); return; }
      markQotd(qotd.day); setAnswered(true); setDraft("");
    } catch (e) { console.error("qotd failed:", e); }
    finally { setBusy(false); }
  };

  return (
    <section style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 4, padding: "20px 20px 18px", marginBottom: 26 }}>
      <Eyebrow color={T.gold} mb={8}>Question of the day</Eyebrow>
      <Script size={26} style={{ marginBottom: 12 }}>{qotd.text}</Script>
      {!answered ? (
        <>
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={280} placeholder="A line is plenty…" style={{ ...inputStyle, minHeight: 56, fontSize: 16 }} />
          <button onClick={send} disabled={!draft.trim() || busy} style={{ ...primaryBtn, marginTop: 8, opacity: (!draft.trim() || busy) ? 0.5 : 1 }}>
            <Send size={13} /> {busy ? "Sharing…" : "Share, then see the room"}
          </button>
        </>
      ) : (
        <>
          <Hand size={17} color={T.muted} style={{ marginBottom: 10 }}>You answered. Here{"’"}s the room today —</Hand>
          {answers === null && <Hand size={16} color={T.muted}>Gathering today{"’"}s answers…</Hand>}
          {answers && answers.length === 0 && <Hand size={16} color={T.muted}>You{"’"}re the first today. Lovely.</Hand>}
          {answers && answers.map((a) => (
            <div key={a.id} style={{ borderTop: `1px solid ${T.paperDeep}`, padding: "8px 0" }}>
              <Hand size={17} color={T.inkSoft}>{a.body}</Hand>
            </div>
          ))}

          {/* v2 — your own thread of days (gentle archive, no streak/count) */}
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${T.paperDeep}` }}>
            {!showThread ? (
              <button onClick={loadThread} style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted, display: "inline-flex", alignItems: "center", gap: 6, padding: 0 }}>
                <MessageCircle size={13} /> See your thread of days
              </button>
            ) : (
              <>
                <Eyebrow color={T.gold} mb={8}>Your thread of days</Eyebrow>
                {thread === null && <Hand size={16} color={T.muted}>Gathering your days…</Hand>}
                {thread === false && <Hand size={16} color={T.muted}>Couldn{"’"}t reach your thread just now.</Hand>}
                {thread && thread.length === 0 && <Hand size={16} color={T.muted}>Today is the first thread of yours. More will gather, gently.</Hand>}
                {thread && thread.map((r) => (
                  <div key={r.id} style={{ borderTop: `1px solid ${T.paperDeep}`, padding: "9px 0" }}>
                    <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, letterSpacing: 0.3, marginBottom: 3 }}>{qotdForDay(r.prompt_day).text}</div>
                    <Hand size={17} color={T.inkSoft}>{r.body}</Hand>
                  </div>
                ))}
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}

// ── Book Club (Phase 4, §P.2.2) — on the existing BookReader ──────────────────
function ClubCheckpointThread({ pickKey, cp, user, onCrisis }) {
  const [notes, setNotes] = useState(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const rows = await base44.entities.ClubNote.filter({ pick_key: pickKey, checkpoint_index: cp.index, hidden: false }, "created_date", 100).catch(() => []);
    setNotes(Array.isArray(rows) ? rows : []);
  }, [pickKey, cp.index]);
  useEffect(() => { load(); }, [load]);
  const send = async () => {
    const text = draft.trim(); if (!text || busy) return;
    if (crisisCheck(text).intercept) { onCrisis(); return; }
    setBusy(true);
    try {
      const wh = await communityHash(user?.id);
      const r = await base44.functions.invoke("postClubNote", { user_id: user?.id, author_hash: wh, pick_key: pickKey, checkpoint_index: cp.index, body: text });
      const d = r?.data ?? r;
      if (d?.intercept) { onCrisis(); return; }
      setDraft(""); await load();
    } catch (e) { console.error("club note failed:", e); }
    finally { setBusy(false); }
  };
  return (
    <div style={{ marginTop: 10 }}>
      <Hand size={17} color={T.inkSoft} style={{ marginBottom: 10, fontStyle: "italic" }}>{cp.jess_prompt}</Hand>
      {notes === null && <Hand size={15} color={T.muted}>Opening the thread…</Hand>}
      {notes && notes.length === 0 && <Hand size={15} color={T.muted}>No one's spoken here yet. The thread waits — no one is late.</Hand>}
      {notes && notes.map((n) => (
        n.status === "removed"
          ? <div key={n.id} style={{ fontFamily: UI, fontSize: 12, color: T.muted, fontStyle: "italic", padding: "6px 0" }}>{MOD_REMOVED}</div>
          : <div key={n.id} style={{ padding: "6px 0", borderTop: `1px solid ${T.paperDeep}` }}><Hand size={16} color={T.inkSoft}>{n.body}</Hand></div>
      ))}
      <textarea value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={600} placeholder="A few words — lurking counts too." style={{ ...inputStyle, minHeight: 52, fontSize: 16, marginTop: 8 }} />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
        <button onClick={send} disabled={!draft.trim() || busy} style={{ ...primaryBtn, padding: "8px 14px", opacity: (!draft.trim() || busy) ? 0.5 : 1 }}><Send size={13} /> {busy ? "Adding…" : "Add a note"}</button>
      </div>
    </div>
  );
}

function BookClubView({ user, onCrisis, onBack }) {
  const navigate = useNavigate();
  const [pick, setPick] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);
  const [reached, setReached] = useState(-1);
  useEffect(() => {
    (async () => {
      const picks = await base44.entities.BookClubPick.filter({ active: true }, "-created_date", 1).catch(() => []);
      if (Array.isArray(picks) && picks.length) {
        const p0 = picks[0];
        const cps = await base44.entities.ClubCheckpoint.filter({ pick_key: p0.pick_key }, "index", 50).catch(() => []);
        setPick(p0);
        setCheckpoints(Array.isArray(cps) && cps.length ? cps : SEED_PICK.checkpoints);
        setReached(clubReached(p0.pick_key));
      } else {
        setPick(SEED_PICK); setCheckpoints(SEED_PICK.checkpoints); setReached(clubReached(SEED_PICK.pick_key));
      }
    })();
  }, []);
  if (!pick) return <div style={{ padding: "26px 18px" }}><Hand size={17} color={T.muted}>Finding this season's read…</Hand></div>;
  const attest = (idx) => { setClubReached(pick.pick_key, idx); setReached((r) => Math.max(r, idx)); };
  return (
    <div style={{ padding: "26px 18px 60px" }}>
      <button onClick={onBack} style={{ ...ghostBtn, marginBottom: 14, padding: "7px 11px" }}><ChevronLeft size={14} /> Community</button>
      <Eyebrow color={T.gold} mb={8}>Book club · Jess hosts</Eyebrow>
      <Script size={32} style={{ marginBottom: 2 }}>{pick.title}</Script>
      <div style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, marginBottom: 12 }}>{pick.author}{pick.cadence ? ` · ${pick.cadence}` : ""}</div>
      <Hand size={17} color={T.inkSoft} style={{ marginBottom: 14 }}>{pick.host_intro}</Hand>

      {Array.isArray(pick.trigger_warnings) && pick.trigger_warnings.length > 0 && (
        <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 6, padding: "11px 13px", marginBottom: 14 }}>
          <Eyebrow color={T.muted} mb={5}>A gentle heads-up</Eyebrow>
          {pick.trigger_warnings.map((w, i) => <div key={i} style={{ fontFamily: UI, fontSize: 12, color: T.inkSoft, lineHeight: 1.5 }}>· {w}</div>)}
        </div>
      )}

      {pick.gutenberg_id && (
        <button onClick={() => navigate(createPageUrl(`BookReader?gutenberg_id=${pick.gutenberg_id}`))} style={{ ...primaryBtn, marginBottom: 22 }}>
          <MessageCircle size={14} /> Read it in the Library
        </button>
      )}

      <Eyebrow color={T.gold} mb={10}>Checkpoints — open one when you reach it</Eyebrow>
      {checkpoints.map((cp) => {
        const unlocked = reached >= cp.index;
        return (
          <div key={cp.index} style={{ background: T.paperHi, border: `1px solid ${unlocked ? T.gold : T.paperDeep}`, borderRadius: 6, padding: "13px 14px", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {unlocked ? <MessageCircle size={14} style={{ color: T.gold }} /> : <Lock size={14} style={{ color: T.muted }} />}
              <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontWeight: 700, fontSize: 17, color: unlocked ? T.ink : T.muted }}>{cp.label}</div>
            </div>
            {unlocked
              ? <ClubCheckpointThread pickKey={pick.pick_key} cp={cp} user={user} onCrisis={onCrisis} />
              : <div style={{ marginTop: 8 }}>
                  <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, marginBottom: 8 }}>Spoiler-safe: the discussion opens once you've read this far.</div>
                  <button onClick={() => attest(cp.index)} style={{ ...ghostBtn }}>I've read this far — open it</button>
                </div>}
          </div>
        );
      })}
    </div>
  );
}

// ── Living Wisdom (Phase 4, §3.8) — the evergreen collection ──────────────────
function WisdomCard({ onOpen }) {
  const pick = useMemo(() => featuredWisdom(), []);
  return (
    <section style={{ background: PLUM, borderRadius: 6, padding: "20px 20px 16px", marginBottom: 26, color: "#F4EFE3" }}>
      <Eyebrow color={T.gold} mb={10}>Living wisdom</Eyebrow>
      <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontSize: 22, lineHeight: 1.4, color: "#F4EFE3", marginBottom: 14 }}>
        &ldquo;{pick.body}&rdquo;
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button onClick={onOpen} style={{
          fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: "8px 14px",
          borderRadius: 999, border: "1px solid rgba(212,175,55,0.5)", background: "rgba(212,175,55,0.12)", color: "#F4EFE3",
        }}>Read the collection</button>
        <ShareButton tone="light" label="Share this line" artifact={{
          kind: "wisdom", source: "wisdom-seed", line: pick.body,
          shareText: "A line that stayed with me, from FemWell.", footer: "Living wisdom", url: "https://femwells.com",
        }} />
      </div>
    </section>
  );
}

function WisdomLibrary({ onBack }) {
  const [rows, setRows] = useState(null);   // promoted WisdomEntry rows
  const [topic, setTopic] = useState("All");
  useEffect(() => {
    base44.entities.WisdomEntry.filter({}, "-created_date", 200)
      .then((r) => setRows(Array.isArray(r) ? r : []))
      .catch(() => setRows([]));
  }, []);
  // merge curated seed + promoted rows. Source is tracked for THE WALL: only the CURATED
  // seed lines (FemWell-authored) may be shared externally; promoted lines come from
  // anonymous echoes (source:"echo") and are NOT externally shareable.
  const all = useMemo(() => {
    const promoted = (rows || []).map((r) => ({ body: r.body, topic: r.topic || "Identity", _src: "echo" }));
    return [...promoted, ...WISDOM_SEED.map((w) => ({ ...w, _src: "wisdom-seed" }))];
  }, [rows]);
  const shown = topic === "All" ? all : all.filter((w) => (w.topic || "") === topic);
  return (
    <div style={{ padding: "26px 18px 60px" }}>
      <button onClick={onBack} style={{ ...ghostBtn, marginBottom: 14, padding: "7px 11px" }}><ChevronLeft size={14} /> Community</button>
      <Eyebrow color={T.gold} mb={8}>Living wisdom</Eyebrow>
      <Script size={34} style={{ marginBottom: 6 }}>What the room knows</Script>
      <Hand size={17} color={T.muted} style={{ marginBottom: 16 }}>
        The lines worth keeping — held by women who came before, saved here so they outlast the day they were said.
      </Hand>

      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 18 }}>
        {WISDOM_TOPICS.map((tp) => (
          <button key={tp} onClick={() => setTopic(tp)} style={{
            fontFamily: UI, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.2, cursor: "pointer",
            padding: "5px 12px", borderRadius: 999, border: `1px solid ${topic === tp ? T.gold : T.paperDeep}`,
            background: topic === tp ? T.paper : "transparent", color: topic === tp ? T.gold : T.muted,
          }}>{tp}</button>
        ))}
      </div>

      {rows === null && <Hand size={17} color={T.muted}>Gathering the collection…</Hand>}
      {rows !== null && shown.length === 0 && (
        <Hand size={17} color={T.muted}>No lines under {topic} yet — they gather over time. Try another, or read them all.</Hand>
      )}
      {shown.map((w, i) => (
        <div key={i} style={{ borderLeft: `2px solid ${T.gold}`, padding: "4px 0 4px 14px", marginBottom: 18 }}>
          <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontSize: 19, lineHeight: 1.45, color: T.ink }}>{w.body}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 5 }}>
            {w.topic ? <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, letterSpacing: 0.4 }}>{w.topic}</div> : <span />}
            {/* Only curated seed lines may leave the app; echo-derived lines are not shareable (THE WALL). */}
            {w._src === "wisdom-seed" && (
              <ShareButton label="Share" artifact={{ kind: "wisdom", source: "wisdom-seed", line: w.body, shareText: "A line worth keeping, from FemWell.", footer: "Living wisdom", url: "https://femwells.com" }} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Collective pool (Phase 4, §P.2.4) — "together this week", aggregate only ──
function PoolCard({ user }) {
  const [total, setTotal] = useState(null);
  const [capped, setCapped] = useState(false);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try {
      const wh = await communityHash(user?.id);
      const r = await base44.functions.invoke("collectivePool", { user_id: user?.id, author_hash: wh });
      const d = r?.data ?? r;
      if (typeof d?.total === "number") setTotal(d.total);
    } catch { /* quiet */ }
  }, [user?.id]);
  useEffect(() => { load(); }, [load]);
  const add = async (moment) => {
    if (busy) return; setBusy(true);
    try {
      const wh = await communityHash(user?.id);
      const r = await base44.functions.invoke("collectivePool", { user_id: user?.id, author_hash: wh, moment });
      const d = r?.data ?? r;
      if (typeof d?.total === "number") setTotal(d.total);
      if (d?.capped) setCapped(true);
    } catch (e) { console.error("pool add failed:", e); }
    finally { setBusy(false); }
  };
  const n = total ?? 0;
  const milestone = Math.max(50, Math.ceil((n + 1) / 50) * 50);   // soft, ever-receding target
  const pct = Math.min(100, Math.round((n / milestone) * 100));
  return (
    <section style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 6, padding: "18px 18px 16px", marginBottom: 26 }}>
      <Eyebrow color={T.gold} mb={8}>Together this week</Eyebrow>
      <Hand size={18} color={T.ink} style={{ marginBottom: 10 }}>
        {total === null ? "Counting the small kindnesses…" : `Women here have made ${n} small kindnesses to themselves this week.`}
      </Hand>
      <div style={{ height: 8, borderRadius: 999, background: T.paperDeep, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: T.gold, transition: "width .4s ease" }} />
      </div>
      <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginBottom: 12 }}>It only rises. No names, no scores — just us, adding up.</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {POOL_MOMENTS.map((m) => (
          <button key={m.key} onClick={() => add(m.key)} disabled={busy} style={{
            fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: busy ? "default" : "pointer",
            padding: "8px 13px", borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: "transparent", color: T.inkSoft, opacity: busy ? 0.6 : 1,
          }}>{m.label}</button>
        ))}
      </div>
      {capped && <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 10 }}>You've added plenty today — lovely. The pool keeps going.</div>}
    </section>
  );
}

// ── Close the week (Phase 4, §P.2.5) — soft weekly reflection + aggregate reveal ──
function CloseWeekCard({ user, onCrisis }) {
  const wk = useMemo(() => weekKey(), []);
  const prompt = useMemo(() => closePromptForWeek(wk), [wk]);
  const [closed, setClosed] = useState(() => closedThisWeek(wk));
  const [draft, setDraft] = useState("");
  const [lines, setLines] = useState(null);
  const [busy, setBusy] = useState(false);
  const loadReveal = useCallback(async () => {
    const rows = await base44.entities.RitualContribution.filter({ week_key: wk, hidden: false }, "-created_date", 40).catch(() => []);
    setLines(Array.isArray(rows) ? rows.filter((r) => r.status !== "removed" && r.body) : []);
  }, [wk]);
  useEffect(() => { if (closed) loadReveal(); }, [closed, loadReveal]);
  const send = async () => {
    const text = draft.trim(); if (!text || busy) return;
    if (crisisCheck(text).intercept) { onCrisis(); return; }
    setBusy(true);
    try {
      const wh = await communityHash(user?.id);
      const r = await base44.functions.invoke("closeTheWeek", { user_id: user?.id, author_hash: wh, body: text });
      const d = r?.data ?? r;
      if (d?.intercept) { onCrisis(); return; }
      markClosedWeek(wk); setClosed(true); setDraft("");
    } catch (e) { console.error("close week failed:", e); }
    finally { setBusy(false); }
  };
  return (
    <section style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 6, padding: "20px 18px 16px", marginBottom: 26 }}>
      <Eyebrow color={T.gold} mb={8}>Close the week</Eyebrow>
      <Script size={24} style={{ marginBottom: 12 }}>{prompt}</Script>
      {!closed ? (
        <>
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={280} placeholder="One line. No one's keeping count of who joins in." style={{ ...inputStyle, minHeight: 60 }} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button onClick={send} disabled={!draft.trim() || busy} style={{ ...primaryBtn, opacity: (!draft.trim() || busy) ? 0.5 : 1 }}><Send size={13} /> {busy ? "Closing…" : "Close my week"}</button>
          </div>
        </>
      ) : (
        <div>
          <Hand size={16} color={T.sage} style={{ marginBottom: 10 }}>Closed. Here's how the room is letting this week go —</Hand>
          {lines === null && <Hand size={15} color={T.muted}>Gathering the room…</Hand>}
          {lines && lines.length < REVEAL_K_FLOOR && <Hand size={16} color={T.muted}>Among a quiet few this week. Yours is held.</Hand>}
          {lines && lines.length >= REVEAL_K_FLOOR && lines.map((l) => (
            <div key={l.id} style={{ borderLeft: `2px solid ${T.gold}`, padding: "3px 0 3px 12px", marginBottom: 10 }}>
              <Hand size={16} color={T.inkSoft}>{l.body}</Hand>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Tier-0 belonging: "others in your season" (mega-plan §2.0) ───────────────
// The smallest, highest-belonging surface. NO count of any kind (k-anon by
// construction — there is no number to narrow) — purely a warm "you're in
// company this season" beat, keyed to the viewer's life stage. Zero-moderation,
// read-only. Hidden gracefully when the stage is unknown.
const SEASONS = {
  "teen":           { label: "your early years",        line: "Others finding their feet are here too. You don't have to have it figured out." },
  "reproductive":   { label: "your cycling years",      line: "Other women riding the same monthly tides are here. You're in good company." },
  "pre-ttc":        { label: "the before",              line: "Others getting ready, in their own time, are here too. No rush, no race." },
  "ttc":            { label: "the trying",              line: "Others in the two-week waits and the hoping are here. You're not waiting alone." },
  "pregnant-t1":    { label: "your first trimester",    line: "Others early in it — the wonder and the worry — are here too." },
  "pregnant-t2":    { label: "your second trimester",   line: "Others carrying alongside you are here. You're in company." },
  "pregnant-t3":    { label: "your third trimester",    line: "Others near the end of the wait are here too. Nearly there, together." },
  "postpartum":     { label: "the fourth trimester",    line: "Others in the newborn fog and the healing are here. You're held." },
  "perimenopause":  { label: "the shift",               line: "Others naming what no one warned them about are here. You're not imagining it." },
  "menopause":      { label: "menopause",               line: "Others through it and out the other side are here. Honest, together." },
  "post-menopause": { label: "beyond menopause",        line: "Others in this next chapter are here too. There's a lot of life in it." },
};

function SeasonCard({ stage }) {
  const s = SEASONS[stage];
  if (!s) return null;
  return (
    <section style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${T.gold}`, borderRadius: 4, padding: "13px 16px", marginBottom: 22 }}>
      <Eyebrow color={T.gold} mb={5}>You're in good company</Eyebrow>
      <Hand size={17} color={T.inkSoft}>{s.line}</Hand>
    </section>
  );
}

function EchoCard({ onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "block", width: "100%", textAlign: "left", cursor: "pointer",
      background: T.paperHi, border: `1px solid ${T.gold}`, borderRadius: 6, padding: "16px 16px", marginBottom: 26,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
        <Waves size={16} style={{ color: T.gold }} />
        <Eyebrow color={T.gold} mb={0}>The Echo Wall</Eyebrow>
      </div>
      <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontWeight: 700, fontSize: 19, color: T.ink, marginBottom: 4 }}>One line, held by the room.</div>
      <div style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>Anonymous lines from women across the cycle — each fades in 48 hours. Read the wall, or share a line from your journal →</div>
    </button>
  );
}

function ClubsCard({ onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "block", width: "100%", textAlign: "left", cursor: "pointer",
      background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 6, padding: "16px 16px", marginBottom: 26,
    }}>
      <Eyebrow color={T.gold} mb={6}>Clubs · Jess hosts</Eyebrow>
      <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontWeight: 700, fontSize: 19, color: T.ink, marginBottom: 4 }}>Small groups for doing a thing together.</div>
      <div style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>Slow mornings, creativity — lurk freely, join what's yours. No counts, no pressure →</div>
    </button>
  );
}

// ── rooms-as-doors home ──────────────────────────────────────────────────────
function Home({ presence, lifeStage, onEnter, user, onCrisis, onShareTo }) {
  return (
    <div>
      <Eyebrow mb={8}>{MASTHEAD.eyebrow}</Eyebrow>
      <Script size={42} style={{ marginBottom: 8 }}>{MASTHEAD.title}</Script>
      <Hand size={19} color={T.inkSoft} style={{ marginBottom: 14 }}>{MASTHEAD.subtitle}</Hand>
      <div style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, fontWeight: 600, marginBottom: 22 }}>{presence}</div>

      <SeasonCard stage={lifeStage} />

      <JessNudge
        id="community-reflect-v1"
        line="Some of what's said here is worth keeping. Want a quiet place to write your own?"
        to="Journal?compose=1"
        actionLabel="Open my journal"
      />

      {onShareTo && (
        <button onClick={onShareTo} style={{
          display: "flex", alignItems: "center", gap: 8, width: "100%", justifyContent: "center",
          marginBottom: 22, padding: "11px 14px", cursor: "pointer",
          background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 999,
          fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.inkSoft,
        }}>
          <Send size={14} style={{ color: T.gold }} /> Share a thought to one of your spaces
        </button>
      )}

      <EchoCard onOpen={() => onEnter("echo")} />

      <QotdCard user={user} onCrisis={onCrisis} />

      <PoolCard user={user} />

      <CloseWeekCard user={user} onCrisis={onCrisis} />

      <ClubsCard onOpen={() => onEnter("clubs")} />

      <WisdomCard onOpen={() => onEnter("wisdom")} />

      <Eyebrow mb={12}>The rooms — step into any one</Eyebrow>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {ROOMS.map((r) => {
          const Icon = r.Icon;
          return (
            <button key={r.key} onClick={() => onEnter(r.key)} style={{
              textAlign: "left", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 4,
              padding: "15px 14px", cursor: "pointer",
            }}>
              <Icon size={19} style={{ color: T.gold, marginBottom: 7 }} />
              <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontWeight: 700, fontSize: 17, color: T.ink, lineHeight: 1.15, marginBottom: 4 }}>{r.name}</div>
              <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, lineHeight: 1.4 }}>{r.line}</div>
            </button>
          );
        })}
      </div>

      {/* W4 — discreet entry to the one-to-one peer features (live in the Journal). Deep-links
          open the existing Witness inbox / Phase Twin overlays. Quiet by design — these are intense. */}
      <div style={{ marginTop: 26 }}>
        <Eyebrow mb={10}>Quietly, one to one</Eyebrow>
        <Link to={createPageUrl("Journal?open=witness")} style={{ textDecoration: "none", display: "block", marginBottom: 10 }}>
          <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 6, padding: "13px 15px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <HeartHandshake size={15} style={{ color: T.gold }} />
              <span style={{ fontFamily: HANDFAM, fontStyle: "italic", fontWeight: 700, fontSize: 17, color: T.ink }}>Hold space for a sister</span>
            </div>
            <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, lineHeight: 1.4 }}>Someone may be waiting to be witnessed — one entry, held by one woman. Open your inbox →</div>
          </div>
        </Link>
        <Link to={createPageUrl("Journal?open=twin")} style={{ textDecoration: "none", display: "block" }}>
          <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 6, padding: "13px 15px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <Users size={15} style={{ color: T.gold }} />
              <span style={{ fontFamily: HANDFAM, fontStyle: "italic", fontWeight: 700, fontSize: 17, color: T.ink }}>Phase Twin</span>
            </div>
            <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, lineHeight: 1.4 }}>Twelve days, paired with one woman in your season — one shared prompt a day. Find your twin →</div>
          </div>
        </Link>
      </div>

      {/* W3 — a quiet door to Jess (the host) from Community, via the existing assistant event */}
      <button onClick={() => window.dispatchEvent(new CustomEvent("fw_open_assistant", { detail: { from: "community" } }))} style={{
        display: "flex", alignItems: "center", gap: 9, width: "100%", justifyContent: "center",
        marginTop: 22, padding: "12px 14px", cursor: "pointer",
        background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 999,
        fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.inkSoft,
      }}>
        <HeartHandshake size={14} style={{ color: T.gold }} /> Need a quiet word? Talk to Jess
      </button>

      {/* Invite — a non-personal, on-brand card (organic growth). No personal content leaves. */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
        <ShareButton label="Invite a friend" artifact={{
          kind: "invite",
          line: "Come find your people — anonymous, whole-life, kind. For all of you, not just your cycle.",
          footer: "An invitation", url: "https://femwells.com",
          shareText: "I think you'd like FemWell — a whole-life space for women. Anonymous, 18+.",
        }} />
      </div>
    </div>
  );
}

// ── a room (sticky tabs + feed + composer) ───────────────────────────────────
// ── Jess's round (M3) — The Lighter Side games-master ────────────────────────
function GameRoundCard({ user, onCrisis }) {
  const [round, setRound] = useState(null);   // null = loading; false = none/error
  const [answered, setAnswered] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const tried = useRef(false);

  useEffect(() => {
    if (tried.current) return; tried.current = true;
    (async () => {
      try {
        const r = await base44.functions.invoke("openGameRound", { room: "lighter" });
        const d = r?.data ?? r;
        if (d?.round) { setRound(d.round); setAnswered(gameAnswered(d.round.id)); }
        else setRound(false);
      } catch (e) { console.error("game load failed:", e); setRound(false); }
    })();
  }, []);

  const submit = async (payload) => {
    if (busy || !round) return;
    if (payload.text && crisisCheck(payload.text).intercept) { onCrisis(); return; }
    setBusy(true);
    try {
      const wh = await communityHash(user?.id);
      const r = await base44.functions.invoke("submitGameResponse", { user_id: user?.id, author_hash: wh, round_id: round.id, ...payload });
      const d = r?.data ?? r;
      if (d?.intercept) { onCrisis(); return; }
      // rejected (harmful) or ok or already → either way the round is now "answered" for this device
      markGameAnswered(round.id); setAnswered(true); setDraft("");
    } catch (e) { console.error("game answer failed:", e); }
    finally { setBusy(false); }
  };

  if (round === null || round === false) return null;   // quiet if nothing to show

  const isClosed = round.status === "closed";
  const hasOptions = Array.isArray(round.options) && round.options.length >= 2;

  return (
    <section style={{ background: PLUM, borderRadius: 6, padding: "18px 18px 16px", marginBottom: 18, color: "#F4EFE3" }}>
      <Eyebrow color={T.gold} mb={8}>Jess's round{isClosed ? " · the reveal" : " · tonight"}</Eyebrow>
      <Script size={25} color="#F4EFE3" style={{ marginBottom: 12 }}>{round.prompt}</Script>

      {isClosed ? (
        <div style={{ fontFamily: HANDFAM, fontSize: 18, lineHeight: 1.5, color: "#EBD9C4" }}>{round.reveal}</div>
      ) : answered ? (
        <div style={{ fontFamily: UI, fontSize: 12.5, color: "#CDBBA6", lineHeight: 1.5 }}>
          You're in. Come back when it closes and Jess will gather what the room said — no winners, just us. <span style={{ opacity: 0.8 }}>({closesInLabel(round.closes_at)}.)</span>
        </div>
      ) : hasOptions ? (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {round.options.map((o) => (
            <button key={o} onClick={() => submit({ choice: o })} disabled={busy} style={{
              fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: busy ? "default" : "pointer",
              padding: "10px 16px", borderRadius: 999, border: "1px solid rgba(212,175,55,0.5)",
              background: "rgba(212,175,55,0.12)", color: "#F4EFE3", opacity: busy ? 0.6 : 1,
            }}>{o}</button>
          ))}
        </div>
      ) : (
        <div>
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={160}
            placeholder="One line — for fun, no names." rows={2}
            style={{ width: "100%", boxSizing: "border-box", fontFamily: HANDFAM, fontSize: 17, padding: "10px 12px", borderRadius: 6, border: "1px solid rgba(244,239,227,0.25)", background: "rgba(244,239,227,0.06)", color: "#F4EFE3", resize: "none" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ fontFamily: UI, fontSize: 10.5, color: "#A9967F" }}>{closesInLabel(round.closes_at)}</span>
            <button onClick={() => draft.trim() && submit({ text: draft.trim() })} disabled={!draft.trim() || busy} style={{
              fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: (!draft.trim() || busy) ? "default" : "pointer",
              padding: "8px 16px", borderRadius: 999, border: "none", background: T.gold, color: PLUM, opacity: (!draft.trim() || busy) ? 0.5 : 1,
            }}>{busy ? "Adding…" : "Add mine"}</button>
          </div>
        </div>
      )}
    </section>
  );
}

// ── Circles (Phase 4) — curated whole-life cohorts inside the Circles door ────
function CircleCard({ circle, joined, onOpen }) {
  return (
    <button onClick={() => onOpen(circle.key)} style={{
      display: "block", width: "100%", textAlign: "left", cursor: "pointer",
      background: T.paperHi, border: `1px solid ${joined ? T.gold : T.paperDeep}`, borderRadius: 6,
      padding: "14px 15px", marginBottom: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <Script size={21} color={T.ink}>{circle.name}</Script>
        {joined && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontFamily: UI, fontSize: 10.5, fontWeight: 700, color: T.gold }}><Check size={12} /> Joined</span>}
        {circle.sensitive && <span style={{ marginLeft: "auto", fontFamily: UI, fontSize: 10, color: T.muted, display: "inline-flex", alignItems: "center", gap: 3 }}><Lock size={11} /> sensitive</span>}
      </div>
      <Hand size={16} color={T.muted}>{circle.line}</Hand>
    </button>
  );
}

function CirclesDirectory({ onOpen, profile = null }) {
  const [, force] = useState(0);   // re-render after join-state changes elsewhere
  useEffect(() => { force((n) => n + 1); }, []);
  const mine = CIRCLES.filter((c) => isJoined(c.key));   // v2 — your circles, device-local
  const suggested = suggestedCircles(profile).filter((c) => !isJoined(c.key));   // P6 — from stage + interests
  return (
    <div>
      <Script size={30} style={{ marginBottom: 4 }}>Circles</Script>
      <Hand size={17} color={T.muted} style={{ marginBottom: 18 }}>
        Smaller rooms by what you're living and what you love. Lurk freely; join the ones that are yours.
      </Hand>
      {mine.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Eyebrow color={T.gold} mb={8}>Circles you're in</Eyebrow>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {mine.map((c) => (
              <button key={c.key} onClick={() => onOpen(c.key)} style={{
                fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.2, cursor: "pointer",
                padding: "7px 13px", borderRadius: 999, border: `1px solid ${T.gold}`,
                background: T.paper, color: T.ink, display: "inline-flex", alignItems: "center", gap: 5,
              }}><Check size={12} color={T.gold} /> {c.name}</button>
            ))}
          </div>
        </div>
      )}
      {suggested.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Eyebrow color={T.gold} mb={8}>Suggested for you</Eyebrow>
          {suggested.map((c) => (
            <CircleCard key={c.key} circle={c} joined={false} onOpen={onOpen} />
          ))}
        </div>
      )}
      {CIRCLE_CATEGORIES.map((cat) => (
        <div key={cat} style={{ marginBottom: 18 }}>
          <Eyebrow color={T.gold} mb={8}>{cat}</Eyebrow>
          {CIRCLES.filter((c) => c.category === cat).map((c) => (
            <CircleCard key={c.key} circle={c} joined={isJoined(c.key)} onOpen={onOpen} />
          ))}
        </div>
      ))}
    </div>
  );
}

function CircleView({ circleKey, user, onCrisis, onBack }) {
  const circle = circleByKey(circleKey);
  const [joined, setJoined] = useState(() => isJoined(circleKey));
  const [posts, setPosts] = useState(null);
  const [composing, setComposing] = useState(false);
  const [needConsent, setNeedConsent] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const rows = await base44.entities.CommunityPost.filter({ circle: circleKey, hidden: false }, "-created_date", 100);
      setPosts(Array.isArray(rows) ? rows : []);
    } catch (e) { console.error("circle feed failed:", e); setPosts(false); }
  }, [circleKey]);
  useEffect(() => { load(); }, [load]);

  const doJoin = async (consented) => {
    if (busy) return;
    setBusy(true);
    try {
      const wh = await communityHash(user?.id);
      await base44.functions.invoke("joinCircle", { user_id: user?.id, author_hash: wh, circle_key: circleKey, consented: !!consented });
      markJoined(circleKey); setJoined(true); setNeedConsent(false);
    } catch (e) { console.error("join failed:", e); }
    finally { setBusy(false); }
  };
  const onJoinClick = () => { if (circle?.sensitive) setNeedConsent(true); else doJoin(false); };
  const leave = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const wh = await communityHash(user?.id);
      await base44.functions.invoke("leaveCircle", { user_id: user?.id, author_hash: wh, circle_key: circleKey });
      clearJoined(circleKey); setJoined(false);
    } catch (e) { console.error("leave failed:", e); }
    finally { setBusy(false); }
  };

  if (!circle) return <Hand size={17} color={T.muted}>That circle has wandered off. Go back to Circles.</Hand>;

  return (
    <div>
      <button onClick={onBack} style={{ ...ghostBtn, marginBottom: 14, padding: "7px 11px" }}><ChevronLeft size={14} /> Circles</button>
      <Script size={30} style={{ marginBottom: 4 }}>{circle.name}</Script>
      <Hand size={17} color={T.muted} style={{ marginBottom: 14 }}>{circle.line}</Hand>

      {needConsent ? (
        <section style={{ background: T.paperHi, border: `1px solid ${T.gold}`, borderRadius: 6, padding: "15px 16px", marginBottom: 16 }}>
          <Eyebrow color={T.gold} mb={6}>Before you join</Eyebrow>
          <Hand size={16} color={T.inkSoft} style={{ marginBottom: 12 }}>{SENSITIVE_CONSENT(circle.name)}</Hand>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => doJoin(true)} disabled={busy} style={{ ...primaryBtn, opacity: busy ? 0.6 : 1 }}><Check size={14} /> I understand — join</button>
            <button onClick={() => setNeedConsent(false)} style={ghostBtn}>Not now</button>
          </div>
        </section>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          {joined
            ? <><span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.gold }}><Check size={14} /> You're in this circle</span>
                <button onClick={leave} disabled={busy} style={{ ...ghostBtn, border: "none", color: T.muted }}>Leave</button></>
            : <button onClick={onJoinClick} disabled={busy} style={{ ...primaryBtn, opacity: busy ? 0.6 : 1 }}><Users size={14} /> Join this circle</button>}
        </div>
      )}

      {!composing && joined && (
        <button onClick={() => setComposing(true)} style={{ ...primaryBtn, marginBottom: 16 }}><Plus size={14} /> Add to {circle.name}</button>
      )}
      {composing && (
        <RoomComposer room="circles" circle={circleKey} user={user} onCrisis={onCrisis}
          onPosted={() => { setComposing(false); load(); }} onCancel={() => setComposing(false)} />
      )}

      {posts === null && <Hand size={18} color={T.muted}>Opening the circle…</Hand>}
      {posts === false && <Hand size={18} color={T.muted}>Couldn{"’"}t reach the circle just now. Pull down to try again.</Hand>}
      {posts && posts.length === 0 && (
        <Hand size={18} color={T.inkSoft}>Quiet in here so far. {joined ? "Leave the first word — someone always comes by." : "Join to leave the first word."}</Hand>
      )}
      {posts && posts.map((p) => (
        <PostCard key={p.id} post={p} user={user} onCrisis={onCrisis} onChanged={load} />
      ))}
    </div>
  );
}

function CirclesView({ user, onCrisis, initialActive = null, profile = null }) {
  const [active, setActive] = useState(initialActive);   // null = directory; else circle key
  return active
    ? <CircleView circleKey={active} user={user} onCrisis={onCrisis} onBack={() => setActive(null)} />
    : <CirclesDirectory onOpen={setActive} profile={profile} />;
}

// ── Clubs — "what you do together" (Jess-hosted; member-created flagged off) ──
function ClubCard({ club, joined, onOpen }) {
  return (
    <button onClick={() => onOpen(club.key)} style={{
      display: "block", width: "100%", textAlign: "left", cursor: "pointer",
      background: T.paperHi, border: `1px solid ${joined ? T.gold : T.paperDeep}`, borderRadius: 6,
      padding: "14px 15px", marginBottom: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <Script size={21} color={T.ink}>{club.name}</Script>
        {joined && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontFamily: UI, fontSize: 10.5, fontWeight: 700, color: T.gold }}><Check size={12} /> Joined</span>}
        <span style={{ marginLeft: "auto", fontFamily: UI, fontSize: 10, color: T.muted, display: "inline-flex", alignItems: "center", gap: 3 }}><HeartHandshake size={11} /> Jess hosts</span>
      </div>
      <Hand size={16} color={T.muted}>{club.line}</Hand>
    </button>
  );
}

function ClubsDirectory({ onOpen, onBack, user }) {
  const [, force] = useState(0);
  useEffect(() => { force((n) => n + 1); }, []);
  return (
    <div>
      {onBack && <button onClick={onBack} style={{ ...ghostBtn, marginBottom: 14, padding: "7px 11px" }}><Grid2x2 size={13} /> Doors</button>}
      <Script size={30} style={{ marginBottom: 4 }}>Clubs</Script>
      <Hand size={17} color={T.muted} style={{ marginBottom: 18 }}>
        Small groups for doing a thing together — hosted by Jess. Lurk freely; join the ones that are yours.
      </Hand>
      {CLUBS.filter((c) => isClubJoined(c.key)).length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Eyebrow color={T.gold} mb={8}>Clubs you're in</Eyebrow>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CLUBS.filter((c) => isClubJoined(c.key)).map((c) => (
              <button key={c.key} onClick={() => onOpen(c.key)} style={{
                fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.2, cursor: "pointer",
                padding: "7px 13px", borderRadius: 999, border: `1px solid ${T.gold}`,
                background: T.paper, color: T.ink, display: "inline-flex", alignItems: "center", gap: 5,
              }}><Check size={12} color={T.gold} /> {c.name}</button>
            ))}
          </div>
        </div>
      )}
      {CLUB_CATEGORIES.map((cat) => {
        const inCat = CLUBS.filter((c) => c.category === cat);
        if (!inCat.length) return null;
        return (
          <div key={cat} style={{ marginBottom: 18 }}>
            <Eyebrow color={T.gold} mb={8}>{cat}</Eyebrow>
            {inCat.map((c) => (
              <ClubCard key={c.key} club={c} joined={isClubJoined(c.key)} onOpen={onOpen} />
            ))}
          </div>
        );
      })}
      {/* Member-created book clubs — BUILT, flagged OFF behind CLUBS_USER_CREATE_ENABLED
          (the OSA/ICO legal floor). Renders as "coming" until the flag flips. */}
      {CLUBS_USER_CREATE_ENABLED
        ? <StartBookClub user={user} onCreated={onOpen} />
        : (
          <section style={{ background: T.paperHi, border: `1px dashed ${T.paperDeep}`, borderRadius: 6, padding: "13px 15px", marginTop: 6 }}>
            <Eyebrow color={T.muted} mb={6}>Start a book club — coming</Eyebrow>
            <Hand size={15.5} color={T.muted}>
              Soon you'll be able to start a book club for any book — even one not on the app — and host the conversation yourself. We're getting the safety right first.
            </Hand>
          </section>
        )}
    </div>
  );
}

// Member-started book club creator — gated; renders only when CLUBS_USER_CREATE_ENABLED.
// The book can be ANY title (on or off the app), free-text. Central auto-moderation
// still applies to every post in the club (createCommunityPost) — the host can't disable it.
function StartBookClub({ user, onCreated }) {
  const [open, setOpen] = useState(false);
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [why, setWhy] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const create = async () => {
    const title = bookTitle.trim();
    if (!title || busy) return;
    setBusy(true); setErr("");
    try {
      const wh = await communityHash(user?.id);
      const r = await base44.functions.invoke("createClub", {
        user_id: user?.id, author_hash: wh,
        name: `${title} — book club`,
        book_title: title, book_author: bookAuthor.trim() || undefined,
        category: "Reading", line: why.trim() || undefined,
      });
      const d = r?.data ?? r;
      if (d?.disabled) { setErr("Member book clubs aren't enabled yet."); setBusy(false); return; }
      if (d?.ok && d?.club?.club_key) { onCreated?.(d.club.club_key); return; }
      setErr("Couldn't start the club just now.");
    } catch (e) { console.error("create book club failed:", e); setErr("Couldn't start the club just now."); }
    finally { setBusy(false); }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ ...primaryBtn, marginTop: 6 }}><Plus size={14} /> Start a book club</button>
    );
  }
  return (
    <section style={{ background: T.paperHi, border: `1px solid ${T.gold}`, borderRadius: 6, padding: "15px 16px", marginTop: 6 }}>
      <Eyebrow color={T.gold} mb={8}>Start a book club</Eyebrow>
      <Hand size={15} color={T.muted} style={{ marginBottom: 10 }}>Any book — on the app or off it. Name it, and host a spoiler-safe, kind conversation. Jess's moderation still watches over every post.</Hand>
      <input value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} maxLength={120} placeholder="Book title (e.g. Tomorrow, and Tomorrow…)" style={{ ...inputStyle, minHeight: 0, padding: "10px 12px", marginBottom: 8 }} />
      <input value={bookAuthor} onChange={(e) => setBookAuthor(e.target.value)} maxLength={80} placeholder="Author (optional)" style={{ ...inputStyle, minHeight: 0, padding: "10px 12px", marginBottom: 8 }} />
      <textarea value={why} onChange={(e) => setWhy(e.target.value)} maxLength={140} placeholder="A line on why (optional)" style={{ ...inputStyle, minHeight: 52, marginBottom: 8 }} />
      {err && <div style={{ fontFamily: UI, fontSize: 12, color: T.crimson, marginBottom: 8 }}>{err}</div>}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={create} disabled={!bookTitle.trim() || busy} style={{ ...primaryBtn, opacity: (!bookTitle.trim() || busy) ? 0.5 : 1 }}><Check size={14} /> {busy ? "Starting…" : "Start it"}</button>
        <button onClick={() => setOpen(false)} style={{ ...ghostBtn, border: "none" }}>Cancel</button>
      </div>
    </section>
  );
}

function ClubView({ clubKey, user, onCrisis, onBack, clubTitle = "" }) {
  // Resolve from the static catalogue, or derive a daily-read readers' corner (per book),
  // or fetch a member-started club from the Club entity (public read; gated path).
  const staticOrDaily = clubByKey(clubKey) || (isDailyReadClub(clubKey) ? dailyReadClubFromKey(clubKey, clubTitle) : null);
  const [memberClub, setMemberClub] = useState(staticOrDaily ? "static" : null);   // null=resolving, false=gone
  useEffect(() => {
    if (staticOrDaily) return;
    base44.entities.Club.filter({ club_key: clubKey, hidden: false }, "-created_date", 1)
      .then((rows) => {
        const c = Array.isArray(rows) ? rows[0] : null;
        if (!c) { setMemberClub(false); return; }
        setMemberClub({
          key: c.club_key, name: c.name,
          line: c.line || (c.book_title ? `A book club for ${c.book_title}${c.book_author ? " by " + c.book_author : ""}.` : ""),
          category: c.category, member: true, dailyRead: !!c.book_title,
        });
      })
      .catch(() => setMemberClub(false));
  }, [clubKey, staticOrDaily]);
  const club = staticOrDaily || (memberClub && memberClub !== "static" ? memberClub : null);
  const [joined, setJoined] = useState(() => isClubJoined(clubKey));
  const [posts, setPosts] = useState(null);
  const [composing, setComposing] = useState(false);
  const [voicing, setVoicing] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const rows = await base44.entities.CommunityPost.filter({ club: clubKey, hidden: false }, "-created_date", 100);
      setPosts(Array.isArray(rows) ? rows : []);
    } catch (e) { console.error("club feed failed:", e); setPosts(false); }
  }, [clubKey]);
  useEffect(() => { load(); }, [load]);

  const join = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const wh = await communityHash(user?.id);
      await base44.functions.invoke("joinClub", { user_id: user?.id, author_hash: wh, club_key: clubKey });
      markClubJoined(clubKey); setJoined(true);
    } catch (e) { console.error("join club failed:", e); }
    finally { setBusy(false); }
  };
  const leave = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const wh = await communityHash(user?.id);
      await base44.functions.invoke("leaveClub", { user_id: user?.id, author_hash: wh, club_key: clubKey });
      clearClubJoined(clubKey); setJoined(false);
    } catch (e) { console.error("leave club failed:", e); }
    finally { setBusy(false); }
  };

  if (!club) {
    return memberClub === false
      ? <Hand size={17} color={T.muted}>That club has wandered off. Go back to Clubs.</Hand>
      : <Hand size={18} color={T.muted}>Opening the club…</Hand>;
  }

  return (
    <div>
      <button onClick={onBack} style={{ ...ghostBtn, marginBottom: 14, padding: "7px 11px" }}><ChevronLeft size={14} /> Clubs</button>
      <Script size={30} style={{ marginBottom: 4 }}>{club.name}</Script>
      <Hand size={17} color={T.muted} style={{ marginBottom: 14 }}>{club.line}</Hand>

      {club.dailyRead && (
        <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${T.gold}`, borderRadius: 6, padding: "10px 13px", marginBottom: 14 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 11.5, fontWeight: 700, color: T.inkSoft }}><Lock size={12} color={T.gold} /> Spoiler-safe — keep it general, no endings or twists given away.</span>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        {joined
          ? <><span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.gold }}><Check size={14} /> You're in this club</span>
              <button onClick={leave} disabled={busy} style={{ ...ghostBtn, border: "none", color: T.muted }}>Leave</button></>
          : <button onClick={join} disabled={busy} style={{ ...primaryBtn, opacity: busy ? 0.6 : 1 }}><HeartHandshake size={14} /> Join this club</button>}
      </div>

      {!composing && joined && (
        <button onClick={() => setComposing(true)} style={{ ...primaryBtn, marginBottom: 16 }}><Plus size={14} /> Add to {club.name}</button>
      )}
      {composing && (
        <RoomComposer room="clubs" club={clubKey} user={user} onCrisis={onCrisis}
          onPosted={() => { setComposing(false); load(); }} onCancel={() => setComposing(false)} />
      )}

      {/* Async voice-notes about the book — gated behind VOICE_NOTES_ENABLED + an STT key.
          Audio is NEVER delivered unscreened: postVoiceNote HOLDS every note until it's
          transcribed + screened (crisis + moderation), failing closed with no STT. */}
      {VOICE_NOTES_ENABLED && joined && (
        voicing
          ? <VoiceNoteComposer user={user} surface={`club:${clubKey}`} onCancel={() => setVoicing(false)} />
          : <button onClick={() => setVoicing(true)} style={{ ...ghostBtn, marginBottom: 16 }}><Mic size={14} /> Leave a voice note about it</button>
      )}

      {/* Live audio chats — DEFERRED by design (can't pre-moderate live speech; OSA-weighty).
          Placeholder only; NOT built. */}
      <section style={{ background: T.paperHi, border: `1px dashed ${T.paperDeep}`, borderRadius: 6, padding: "11px 14px", marginBottom: 16 }}>
        <Eyebrow color={T.muted} mb={4}>Live audio chats — later</Eyebrow>
        <Hand size={14.5} color={T.muted}>Scheduled live book chats are on the horizon. They need real-time safety we won't rush — for now it's words, and (soon) voice notes you can listen to.</Hand>
      </section>


      {posts === null && <Hand size={18} color={T.muted}>Opening the club…</Hand>}
      {posts === false && <Hand size={18} color={T.muted}>Couldn{"’"}t reach the club just now. Pull down to try again.</Hand>}
      {posts && posts.length === 0 && (
        <Hand size={18} color={T.inkSoft}>Quiet in here so far. {joined ? "Leave the first word — Jess and the others come by." : "Join to leave the first word."}</Hand>
      )}
      {posts && posts.map((p) => (
        <PostCard key={p.id} post={p} user={user} onCrisis={onCrisis} onChanged={load} />
      ))}
    </div>
  );
}

function ClubsView({ user, onCrisis, onBack, initialActive = null, clubTitle = "" }) {
  const [active, setActive] = useState(initialActive);
  return active
    ? <ClubView clubKey={active} user={user} onCrisis={onCrisis} onBack={() => setActive(null)} clubTitle={clubTitle} />
    : <ClubsDirectory onOpen={setActive} onBack={onBack} user={user} />;
}

// ── The Library room — reading home (Book Club + reading) ─────────────────────
function LibraryView({ user, onCrisis, onNav, onOpenCorner }) {
  const flagshipCorner = dailyReadClubKey(SEED_PICK.gutenberg_id);
  return (
    <div>
      <Script size={32} style={{ marginBottom: 4 }}>The Library</Script>
      <Hand size={17} color={T.muted} style={{ marginBottom: 16 }}>Read together — at our own pace, spoiler-safe. Lurking counts.</Hand>

      <button onClick={() => onNav("bookclub")} style={{
        display: "block", width: "100%", textAlign: "left", cursor: "pointer",
        background: T.paperHi, border: `1px solid ${T.gold}`, borderRadius: 6, padding: "16px 16px", marginBottom: 14,
      }}>
        <Eyebrow color={T.gold} mb={6}>Book club · Jess hosts</Eyebrow>
        <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontWeight: 700, fontSize: 19, color: T.ink, marginBottom: 4 }}>A book, together — at our own pace.</div>
        <div style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>One read, spoiler-safe checkpoints, no streaks. Come in →</div>
      </button>
      <div style={{ marginBottom: 14 }}>
        <ShareButton label="Share this read" artifact={{
          kind: "bookpick", source: "bookpick", line: SEED_PICK.title, sub: SEED_PICK.author,
          footer: "On the FemWell shelf", url: "https://femwells.com",
          shareText: `Reading ${SEED_PICK.title} with FemWell's book club.`,
        }} />
      </div>

      {/* Daily-read readers' corners — a light, spoiler-safe per-book chat for whatever you're reading */}
      <button onClick={() => onOpenCorner && onOpenCorner(flagshipCorner, SEED_PICK.title)} style={{
        display: "block", width: "100%", textAlign: "left", cursor: "pointer",
        background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 6, padding: "14px 15px", marginBottom: 14,
      }}>
        <Eyebrow color={T.gold} mb={6}>Readers' corners</Eyebrow>
        <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontWeight: 700, fontSize: 17, color: T.ink, marginBottom: 4 }}>Talk about the book you're reading.</div>
        <div style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>Every book has a small, spoiler-safe corner — others reading the same one, talking about it. Open {SEED_PICK.title}'s corner →</div>
      </button>

      <section style={{ background: T.paperHi, border: `1px dashed ${T.paperDeep}`, borderRadius: 6, padding: "13px 15px" }}>
        <Eyebrow color={T.muted} mb={6}>From the reader</Eyebrow>
        <Hand size={15.5} color={T.muted}>Open any book in the Library and you'll find its readers' corner from the reader — general chat, no endings spoiled.</Hand>
      </section>
    </div>
  );
}

// ── The Games Room — play, lightly (Jess's round) ────────────────────────────
function GamesView({ user, onCrisis }) {
  return (
    <div>
      <Script size={32} style={{ marginBottom: 4 }}>The Games Room</Script>
      <Hand size={17} color={T.muted} style={{ marginBottom: 16 }}>Play, lightly. Jess hosts a round — no winners, no scores, just a little fun together.</Hand>
      <GameRoundCard user={user} onCrisis={onCrisis} />
      <section style={{ background: T.paperHi, border: `1px dashed ${T.paperDeep}`, borderRadius: 6, padding: "13px 15px", marginTop: 4 }}>
        <Eyebrow color={T.muted} mb={6}>More games — coming</Eyebrow>
        <Hand size={15.5} color={T.muted}>Would-you-rather, this-or-that, a daily little prompt. Always kind, always aggregate — never a leaderboard.</Hand>
      </section>
    </div>
  );
}

function RoomView({ roomKey, posts, loading, error, user, onNav, onCrisis, onReload, seed = "", initialCircle = null, profile = null, onOpenCorner }) {
  const [composing, setComposing] = useState(() => !!seed);
  const [voicing, setVoicing] = useState(false);
  const room = ROOMS.find((r) => r.key === roomKey) || ROOMS[0];
  const feed = posts.filter((p) => p.room === roomKey);
  return (
    <div>
      {/* sticky tab bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(244,239,227,0.97)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${T.paperDeep}`, padding: "9px 12px", display: "flex", alignItems: "center", gap: 6, overflowX: "auto" }}>
        <button onClick={() => onNav("home")} aria-label="All rooms" style={{ ...ghostBtn, flexShrink: 0, padding: "7px 11px" }}><Grid2x2 size={13} /> Doors</button>
        {ROOMS.map((r) => (
          <button key={r.key} onClick={() => onNav(r.key)} style={{
            flexShrink: 0, fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.2, cursor: "pointer",
            padding: "7px 12px", borderRadius: 999, border: "none",
            background: r.key === roomKey ? T.ink : "transparent", color: r.key === roomKey ? T.paper : T.muted,
          }}>{r.name.replace(/^The /, "")}</button>
        ))}
      </div>

      <div style={{ padding: "20px 18px 60px" }}>
        {roomKey === "circles" ? (
          <CirclesView user={user} onCrisis={onCrisis} initialActive={initialCircle} profile={profile} />
        ) : roomKey === "library" ? (
          <LibraryView user={user} onCrisis={onCrisis} onNav={onNav} onOpenCorner={onOpenCorner} />
        ) : roomKey === "games" ? (
          <GamesView user={user} onCrisis={onCrisis} />
        ) : (
        <>
        <Script size={32} style={{ marginBottom: 4 }}>{room.name}</Script>
        <Hand size={17} color={T.muted} style={{ marginBottom: 16 }}>{room.line}</Hand>

        {/* M4 async voice-notes — dormant until VOICE_NOTES_ENABLED + an STT key */}
        {VOICE_NOTES_ENABLED && roomKey === "lounge" && (
          voicing
            ? <VoiceNoteComposer user={user} onCancel={() => setVoicing(false)} />
            : <button onClick={() => setVoicing(true)} style={{ ...ghostBtn, marginBottom: 16 }}><Mic size={14} /> Leave a voice note</button>
        )}

        {!composing && (
          <button onClick={() => setComposing(true)} style={{ ...primaryBtn, marginBottom: 16 }}><Plus size={14} /> Add to {room.name.replace(/^The /, "")}</button>
        )}
        {composing && (
          <RoomComposer room={roomKey} user={user} onCrisis={onCrisis} initialBody={seed}
            onPosted={() => { setComposing(false); onReload(); }} onCancel={() => setComposing(false)} />
        )}

        {loading && <Hand size={18} color={T.muted}>Opening the room…</Hand>}
        {!loading && error && (
          <Hand size={18} color={T.muted}>Couldn{"’"}t reach the rooms just now. Check your connection and try again.</Hand>
        )}
        {!loading && !error && feed.length === 0 && (
          <Hand size={18} color={T.inkSoft}>Quiet in here right now. Leave the first word — someone always comes by.</Hand>
        )}
        {!loading && !error && feed.map((p) => (
          <PostCard key={p.id} post={p} user={user} onCrisis={onCrisis} onChanged={onReload} />
        ))}
        </>
        )}
      </div>
    </div>
  );
}

// ── inner (after the age gate) ───────────────────────────────────────────────
// ── Track 1 — the unified "Share to…" sheet (internal, anonymous-first) ──────
// One thought → a safe space of your choosing: a Circle or Club you're in (posted
// via the same moderated createCommunityPost path), the Echo Wall, or a 1:1 Witness
// (these two open in the Journal where the on-device scrub / encryption lives). Nothing
// leaves the app. Crisis-checked on every input.
function ShareToSheet({ user, onClose }) {
  const [text, setText] = useState("");
  const [dest, setDest] = useState(null);   // { type:'circle'|'club', key, name }
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const myCircles = CIRCLES.filter((c) => isJoined(c.key));
  const myClubs = CLUBS.filter((c) => isClubJoined(c.key));

  const post = async () => {
    const body = text.trim();
    if (!body || !dest || busy) return;
    if (crisisCheck(body).intercept) { onClose(); return; }
    setBusy(true);
    try {
      const wh = await communityHash(user?.id);
      const payload = { user_id: user?.id, author_hash: wh, body, comments_mode: "open" };
      if (dest.type === "circle") payload.circle = dest.key; else payload.club = dest.key;
      await base44.functions.invoke("createCommunityPost", payload);
      setDone(true);
    } catch (e) { console.error("share-to failed:", e); }
    finally { setBusy(false); }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(36,26,38,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Share to a space" style={{ width: "100%", maxWidth: 460, background: T.paper, borderRadius: "14px 14px 0 0", padding: "20px 18px 28px", maxHeight: "88vh", overflowY: "auto" }}>
        <Eyebrow color={T.gold} mb={8}>Share to…</Eyebrow>
        {done ? (
          <>
            <Hand size={19} color={T.ink} style={{ marginBottom: 14 }}>It's shared with {dest?.name}. Held there, on your terms.</Hand>
            <button onClick={onClose} style={{ ...primaryBtn }}><Check size={14} /> Done</button>
          </>
        ) : (
          <>
            <Hand size={17} color={T.muted} style={{ marginBottom: 12 }}>A thought, into a space that's yours. Anonymous — no names, ever.</Hand>
            <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={POST_MAX} placeholder="Say it plainly…" style={{ ...inputStyle, minHeight: 84, marginBottom: 12 }} />

            {(myCircles.length > 0 || myClubs.length > 0) ? (
              <>
                <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: T.muted, marginBottom: 7 }}>Your spaces</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                  {myCircles.map((c) => (
                    <DestChip key={"ci" + c.key} active={dest?.key === c.key} label={c.name} onClick={() => setDest({ type: "circle", key: c.key, name: c.name })} />
                  ))}
                  {myClubs.map((c) => (
                    <DestChip key={"cl" + c.key} active={dest?.key === c.key} label={c.name} onClick={() => setDest({ type: "club", key: c.key, name: c.name })} />
                  ))}
                </div>
                <button onClick={post} disabled={!text.trim() || !dest || busy} style={{ ...primaryBtn, opacity: (!text.trim() || !dest || busy) ? 0.5 : 1, marginBottom: 16 }}>
                  <Send size={14} /> {busy ? "Sharing…" : dest ? `Share to ${dest.name}` : "Pick a space"}
                </button>
              </>
            ) : (
              <Hand size={15.5} color={T.muted} style={{ marginBottom: 14 }}>Join a Circle or Club first, and you can share a thought straight into it.</Hand>
            )}

            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: T.muted, marginBottom: 7 }}>Or, more privately</div>
            <Link to={createPageUrl("Journal?compose=1")} style={{ ...ghostBtn, textDecoration: "none", display: "inline-flex", marginRight: 8, marginBottom: 8 }}><Waves size={13} /> The Echo Wall (in your Journal)</Link>
            <Link to={createPageUrl("Journal?open=witness")} style={{ ...ghostBtn, textDecoration: "none", display: "inline-flex", marginBottom: 8 }}><HeartHandshake size={13} /> Ask a witness</Link>
            <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, marginTop: 8, lineHeight: 1.5 }}>The Echo Wall scrubs your line and a witness encrypts it — both happen in your Journal, on your device.</div>
            <button onClick={onClose} style={{ ...ghostBtn, border: "none", marginTop: 8 }}>Cancel</button>
          </>
        )}
      </div>
    </div>
  );
}

function DestChip({ active, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: "7px 13px", borderRadius: 999,
      border: `1px solid ${active ? T.gold : T.paperDeep}`, background: active ? T.paper : "transparent", color: active ? T.ink : T.muted,
    }}>{label}</button>
  );
}

function CommunityInner() {
  useEditorialFonts();
  const [user, setUser] = useState(null);
  const [view, setView] = useState("home");      // "home" | room key
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState(false);
  const [crisis, setCrisis] = useState(false);
  const [shareTo, setShareTo] = useState(false);
  const [tick, setTick] = useState(0);

  const [lifeStage, setLifeStage] = useState(null);
  const [profile, setProfile] = useState(null);
  const [roomSeed, setRoomSeed] = useState("");   // connectivity P2 — seeded composer from a deep-link
  const [initialCircle, setInitialCircle] = useState(null);   // P6/P7 — open a circle from a deep-link
  const [initialClub, setInitialClub] = useState(null);       // daily-read readers' corner from a deep-link
  const [clubTitle, setClubTitle] = useState("");             // book title for a derived daily-read club

  // Connectivity deep-links: /Community?room=<feed-room>&seed=<text> opens that room with the
  // composer pre-filled (only the open feed rooms accept a seed); /Community?circle=<key> opens
  // that Circle directly (P6 interests → circle, P7 life-stage → circle).
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const room = sp.get("room");
      const FEED_ROOMS = ["lounge", "love", "money", "style", "lighter", "health"];
      if (room && FEED_ROOMS.includes(room)) {
        setView(room);
        const seed = sp.get("seed");
        if (seed) setRoomSeed(decodeURIComponent(seed));
      }
      const circle = sp.get("circle");
      if (circle && circleByKey(circle)) { setView("circles"); setInitialCircle(circle); }
      const club = sp.get("club");
      if (club && (clubByKey(club) || isDailyReadClub(club))) {
        setView("clubs"); setInitialClub(club);
        const title = sp.get("title");
        if (title) setClubTitle(decodeURIComponent(title));
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => setUser(null)); }, []);
  useEffect(() => {
    base44.entities.UserProfile.filter({}, "-created_date", 1)
      .then((r) => { const p = Array.isArray(r) ? r[0] : null; setProfile(p || null); setLifeStage(p?.life_stage || null); })
      .catch(() => { setProfile(null); setLifeStage(null); });
  }, []);

  const load = useCallback(async () => {
    try {
      const rows = await base44.entities.CommunityPost.filter({ hidden: false }, "-created_date", 200);
      setPosts(Array.isArray(rows) ? rows : []);
      setLoadErr(false);
    } catch (e) { console.error("community feed failed:", e); setLoadErr(true); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  // k-anon ambient presence: distinct author_hashes active in the last window.
  const presence = useMemo(() => {
    const cutoff = Date.now() - PRESENCE_WINDOW_HRS * 3600e3;
    const active = new Set(posts.filter((p) => new Date(p.created_date || 0).getTime() >= cutoff).map((p) => p.author_hash));
    return presenceLine(active.size);
  }, [posts]);

  const reload = useCallback(() => { setTick((t) => t + 1); load(); }, [load]);

  return (
    <div style={{ minHeight: "100vh", ...PAPER_BG }}>
      <InkFilter />
      <div style={{ maxWidth: 460, margin: "0 auto", padding: view === "home" ? "30px 18px 50px" : "0 0 50px" }}>
        {view === "home"
          ? <Home presence={presence} lifeStage={lifeStage} onEnter={setView} user={user} onCrisis={() => setCrisis(true)} onShareTo={() => setShareTo(true)} />
          : view === "wisdom"
          ? <WisdomLibrary onBack={() => setView("home")} />
          : view === "bookclub"
          ? <BookClubView user={user} onCrisis={() => setCrisis(true)} onBack={() => setView("library")} />
          : view === "clubs"
          ? <div style={{ padding: "30px 18px 50px" }}><ClubsView user={user} onCrisis={() => setCrisis(true)} onBack={() => setView("home")} initialActive={initialClub} clubTitle={clubTitle} /></div>
          : view === "echo"
          ? <div style={{ padding: "26px 18px 50px" }}>
              <button onClick={() => setView("home")} style={{ ...ghostBtn, marginBottom: 14, padding: "7px 11px" }}><ChevronLeft size={14} /> Community</button>
              <EchoWall user={user} profile={profile} lifeStage={lifeStage} />
            </div>
          : <RoomView key={tick} roomKey={view} posts={posts} loading={loading} error={loadErr} user={user} onNav={setView} onCrisis={() => setCrisis(true)} onReload={reload} seed={roomSeed} initialCircle={initialCircle} profile={profile}
              onOpenCorner={(key, title) => { setInitialClub(key); setClubTitle(title || ""); setView("clubs"); }} />}
        {view === "home" && (
          <>
            <Rule mt={30} mb={14} />
            <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, lineHeight: 1.5 }}>{FOOTER_LINE}</div>
            <EditorialFooter />
          </>
        )}
      </div>
      {crisis && <CrisisSheet onClose={() => setCrisis(false)} />}
      {shareTo && <ShareToSheet user={user} onClose={() => setShareTo(false)} />}
    </div>
  );
}

export default function Community() {
  const navigate = useNavigate();
  return (
    <AgeGate surfaceName="the Community" onDecline={() => navigate("/Today")}>
      <CommunityInner />
    </AgeGate>
  );
}
