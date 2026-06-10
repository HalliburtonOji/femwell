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
import { useNavigate } from "react-router-dom";
import {
  Grid2x2, MessageCircle, Send, Lock, Unlock, Plus, Flag,
  ShieldAlert, Phone,
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
  qotdForDay, presenceLine, crisisCheck,
} from "@/components/community/communityConfig";

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
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const isOpen = post.comments_mode !== "reaction";
  const jessTried = useRef(false);

  const loadComments = useCallback(async () => {
    const rows = await base44.entities.Comment.filter({ post_id: post.id, hidden: false }, "created_date", 100).catch(() => []);
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
            {comments && comments.length === 0 && <Hand size={16} color={T.muted}>{COMMENT_EMPTY}</Hand>}
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
function RoomComposer({ room, user, onCrisis, onPosted, onCancel }) {
  const [body, setBody] = useState("");
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
      const r = await base44.functions.invoke("createCommunityPost", { user_id: user?.id, author_hash: wh, room, body: text, comments_mode: mode });
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

  const loadAnswers = useCallback(async () => {
    const rows = await base44.entities.QotdResponse.filter({ prompt_day: qotd.day, hidden: false }, "-created_date", 30).catch(() => []);
    setAnswers(Array.isArray(rows) ? rows : []);
  }, [qotd.day]);
  useEffect(() => { if (answered) loadAnswers(); }, [answered, loadAnswers]);

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
        </>
      )}
    </section>
  );
}

// ── rooms-as-doors home ──────────────────────────────────────────────────────
function Home({ presence, onEnter, user, onCrisis }) {
  return (
    <div>
      <Eyebrow mb={8}>{MASTHEAD.eyebrow}</Eyebrow>
      <Script size={42} style={{ marginBottom: 8 }}>{MASTHEAD.title}</Script>
      <Hand size={19} color={T.inkSoft} style={{ marginBottom: 14 }}>{MASTHEAD.subtitle}</Hand>
      <div style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, fontWeight: 600, marginBottom: 22 }}>{presence}</div>

      <QotdCard user={user} onCrisis={onCrisis} />

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
    </div>
  );
}

// ── a room (sticky tabs + feed + composer) ───────────────────────────────────
function RoomView({ roomKey, posts, loading, user, onNav, onCrisis, onReload }) {
  const [composing, setComposing] = useState(false);
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
        <Script size={32} style={{ marginBottom: 4 }}>{room.name}</Script>
        <Hand size={17} color={T.muted} style={{ marginBottom: 16 }}>{room.line}</Hand>

        {!composing && (
          <button onClick={() => setComposing(true)} style={{ ...primaryBtn, marginBottom: 16 }}><Plus size={14} /> Add to {room.name.replace(/^The /, "")}</button>
        )}
        {composing && (
          <RoomComposer room={roomKey} user={user} onCrisis={onCrisis}
            onPosted={() => { setComposing(false); onReload(); }} onCancel={() => setComposing(false)} />
        )}

        {loading && <Hand size={18} color={T.muted}>Opening the room…</Hand>}
        {!loading && feed.length === 0 && (
          <Hand size={18} color={T.inkSoft}>Quiet in here right now. Leave the first word — someone always comes by.</Hand>
        )}
        {!loading && feed.map((p) => (
          <PostCard key={p.id} post={p} user={user} onCrisis={onCrisis} onChanged={onReload} />
        ))}
      </div>
    </div>
  );
}

// ── inner (after the age gate) ───────────────────────────────────────────────
function CommunityInner() {
  useEditorialFonts();
  const [user, setUser] = useState(null);
  const [view, setView] = useState("home");      // "home" | room key
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [crisis, setCrisis] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => setUser(null)); }, []);

  const load = useCallback(async () => {
    const rows = await base44.entities.CommunityPost.filter({ hidden: false }, "-created_date", 200).catch(() => []);
    setPosts(Array.isArray(rows) ? rows : []);
    setLoading(false);
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
          ? <Home presence={presence} onEnter={setView} user={user} onCrisis={() => setCrisis(true)} />
          : <RoomView key={tick} roomKey={view} posts={posts} loading={loading} user={user} onNav={setView} onCrisis={() => setCrisis(true)} onReload={reload} />}
        {view === "home" && (
          <>
            <Rule mt={30} mb={14} />
            <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, lineHeight: 1.5 }}>{FOOTER_LINE}</div>
            <EditorialFooter />
          </>
        )}
      </div>
      {crisis && <CrisisSheet onClose={() => setCrisis(false)} />}
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
