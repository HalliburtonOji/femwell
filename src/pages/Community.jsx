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
  ShieldAlert, ShieldCheck, Phone, Mic, Check, ChevronLeft, Users,
  HeartHandshake, Waves, MoreHorizontal, EyeOff,
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
  MASTHEAD, ROOMS, REACTIONS, POST_MAX, COMMENT_KINDNESS,
  COMMENT_MAX, COMMENT_EMPTY, MOD_REMOVED, UK_RESOURCES, FOOTER_LINE, PRESENCE_WINDOW_HRS,
  VOICE_NOTES_ENABLED, qotdForDay, presenceLine, crisisCheck,
} from "@/components/community/communityConfig";
import VoiceNoteComposer from "@/components/community/VoiceNoteComposer";
import ShareButton from "@/components/share/ShareButton";
import JessNudge from "@/components/jess/JessNudge";
import CommunityHubSheet from "@/components/community/CommunityHubSheet";
import JumpToButton from "@/components/layout/JumpToButton";
import EchoWall from "@/components/journal/echo/EchoWall";
// Growth Phase-0 (Halli-approved, live): Tier 0 anonymous "someone like you" resonance
// (read-only; no 1:1/DMs/UGC). Gated 1:1 + writable rooms HELD pending the safety dials.
import { ResonanceLive } from "@/components/growth/GrowthLive";
import {
  CIRCLES, CIRCLE_CATEGORIES, circleByKey, SENSITIVE_CONSENT,
  isJoined, markJoined, clearJoined, suggestedCircles,
  circlePromptForDay, CIRCLE_INFO,
} from "@/components/community/circlesConfig";
import {
  CLUBS, CLUB_CATEGORIES, clubByKey, CLUBS_USER_CREATE_ENABLED,
  isClubJoined, markClubJoined, clearClubJoined,
  isDailyReadClub, dailyReadClubFromKey, dailyReadClubKey,
} from "@/components/community/clubsConfig";
import { WISDOM_TOPICS, WISDOM_SEED, featuredWisdom } from "@/components/community/wisdomLibrary";
import { SEED_PICK, clubReached, setClubReached } from "@/components/community/bookClubConfig";
import { cohortReachedCount } from "@/components/community/readingActivity";
import {
  POOL_MOMENTS, REVEAL_K_FLOOR, weekKey, closePromptForWeek, closedThisWeek, markClosedWeek,
} from "@/components/community/ritualsConfig";
import { createPageUrl } from "@/utils";
import { useScrollLock } from "@/utils/useScrollLock";
// ── canonical page template (§6.8.2) — the redesign home is built from these ──
import {
  Heart, Briefcase, Sparkles, Moon, Stethoscope, Dices, BookOpen, HelpCircle,
  ChevronUp, ChevronDown, ChevronRight, Eye, Feather, MessagesSquare, Sprout, CalendarDays,
  Mail, SlidersHorizontal, MapPinOff,
} from "lucide-react";
import SealedLetterComposeSheet from "@/components/sealedLetters/SealedLetterComposeSheet";
import { withTimeout } from "@/utils/safeEntity";
import { FwFloraHero } from "@/components/brand/PageTop";
import { Clipboard, ClipboardSlider } from "@/components/brand/ClipboardSlider";
import { SummaryCard, FwCard } from "@/components/brand/Card";
import { cwOf, Pollinator } from "@/components/brand/flora";
import EventsTogether from "@/components/community/EventsTogether";
import LibraryTogether from "@/components/community/LibraryTogether";
import GamesArcade from "@/components/community/GamesArcade";

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

// ═══════════════════════════════════════════════════════════════════════════
// TALK-ROOMS ROBUSTNESS (feature #1) — real, safety-woven upgrades, demo-gated
// via `enhanced` so LIVE Community stays byte-identical until Halli promotes.
// Grounded in workspace/research_talk_rooms_2026-07-08.md (Peanut/Elpha/Mumsnet
// /Yik-Yak lessons; OSA 2023; SDT relatedness; no-scoreboard k-anon).
// ═══════════════════════════════════════════════════════════════════════════
// (1) BOTANICAL ALIAS — a stable, warm, NON-identifying handle derived purely from
// the anonymous author_hash (no PII, deterministic). Gives a thread coherence +
// accountability brake without ever exposing a real identity (Peanut/Elpha lesson;
// random-per-post like Yik Yak loses the thread). "You" for your own posts.
const ALIAS_ADJ = ["Wild", "Quiet", "Golden", "Soft", "Bright", "Gentle", "Bold", "Still", "Sunny", "Velvet", "Little", "Brave", "Wandering", "Calm", "Amber", "Silver"];
const ALIAS_NOUN = ["Poppy", "Fern", "Willow", "Rose", "Sage", "Ivy", "Bluebell", "Daisy", "Heather", "Marigold", "Clover", "Fox", "Wren", "Robin", "Lark", "Thistle", "Meadow", "Hazel", "Juniper", "Primrose"];
function botanicalAlias(hash) {
  const s = String(hash || "");
  if (!s) return "A friend";
  let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  h = h >>> 0;
  return `${ALIAS_ADJ[h % ALIAS_ADJ.length]} ${ALIAS_NOUN[(h >> 5) % ALIAS_NOUN.length]}`;
}

// (2) SAFETY — anonymous-layer "hide a voice" (block by author_hash) + "mute a word"
// (keyword filter). Both device-local, instant, no read needed — the research's
// high-impact anti-pile-on / trust mechanics that work WITHOUT exposing identity.
const HIDDEN_KEY = "fw_cm_hidden_authors", MUTED_KEY = "fw_cm_muted_words";
const readSet = (k) => { try { return new Set(JSON.parse(localStorage.getItem(k) || "[]")); } catch { return new Set(); } };
const writeSet = (k, set) => { try { localStorage.setItem(k, JSON.stringify([...set])); } catch { /* ignore */ } };
const isAuthorHidden = (h) => h && readSet(HIDDEN_KEY).has(h);
const hideAuthor = (h) => { if (!h) return; const s = readSet(HIDDEN_KEY); s.add(h); writeSet(HIDDEN_KEY, s); };
const mutedWords = () => [...readSet(MUTED_KEY)];
const addMutedWord = (w) => { const t = String(w || "").trim().toLowerCase(); if (!t) return; const s = readSet(MUTED_KEY); s.add(t); writeSet(MUTED_KEY, s); };
const removeMutedWord = (w) => { const s = readSet(MUTED_KEY); s.delete(w); writeSet(MUTED_KEY, s); };
const matchesMuted = (text, words) => { const t = (text || "").toLowerCase(); return (words || []).some((w) => t.includes(w)); };

// (3) DAILY ROOM PROMPT — one lightweight, whole-life, life-stage-TINTED ritual prompt
// per room (seeded deterministic per day+room, like QOTD). The research's #1 warmth
// mechanic + first-post care: a warm reason to post. "Answer this" pre-fills the
// moderated composer (same crisis-check + screening path). Never clinical; life-stage
// gently tints, never dominates (CLAUDE.md whole-life rule).
const ROOM_PROMPTS = {
  lounge: ["What's one small thing that lifted you today?", "What did you say no to this week — and how did it feel?", "What's taking up space in your head right now?", "Tell the room one tiny, ordinary win."],
  love: ["What's a green flag you didn't appreciate until recently?", "How do you show a friend you love them without saying it?", "What's a small thing your person does that you'd miss?", "Dating, married, or happily neither — what's on your mind?"],
  money: ["What money thing are you quietly proud of this month?", "What's a work boundary you're trying to hold?", "What would 'enough' look like for you this year?", "Career question you'd never ask out loud — ask it here."],
  style: ["What did you wear that made you feel like YOU today?", "One charity-shop or bargain find you love?", "What's a look you want to try but haven't dared?", "Rate the vibe you're going for this week — in three words."],
  health: ["What's one gentle thing you did for your body today?", "What symptom finally got taken seriously — and how?", "What's a wellness 'rule' you've happily let go of?", "One question about your body you've been sitting on?"],
  lighter: ["Pettiest thing that annoyed you this week?", "Recommend the room one small comfort — a show, a song, a snack.", "What are you watching that you can't shut up about?", "If today had a weather, what was yours?"],
};
const ROOM_TINT = {
  "pregnant-t1": "as you grow a whole person, ", "pregnant-t2": "as you grow a whole person, ", "pregnant-t3": "as you grow a whole person, ",
  postpartum: "in the newborn fog, ", perimenopause: "through the shift, ", menopause: "through it and out the other side, ", ttc: "in the waiting, ",
};
function roomPromptForDay(roomKey, lifeStage) {
  const list = ROOM_PROMPTS[roomKey] || ROOM_PROMPTS.lounge;
  const day = new Date().toISOString().split("T")[0];
  const epoch = Math.floor(new Date(day + "T00:00:00Z").getTime() / 86400000);
  const seed = (epoch + (roomKey || "").length * 7);
  const base = list[((seed % list.length) + list.length) % list.length];
  const tint = lifeStage && ROOM_TINT[lifeStage];
  return tint ? tint + base.charAt(0).toLowerCase() + base.slice(1) : base;
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
  useScrollLock(true);   // lock the background page while the sheet is open
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(36,26,38,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div role="dialog" aria-modal="true" aria-label="Support resources" onClick={(e) => e.stopPropagation()} style={{ background: T.paperHi, width: "100%", maxWidth: 480, borderRadius: "16px 16px 0 0", padding: "24px 22px 30px", maxHeight: "88vh", overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}>
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
function PostCard({ post, user, onCrisis, onChanged, enhanced = false, myHash = null }) {
  const [comments, setComments] = useState(null);   // null = not loaded
  const [commentsErr, setCommentsErr] = useState(false);   // W5 — distinguish error from empty
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [commentErr, setCommentErr] = useState(false);
  const [reactErr, setReactErr] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);   // tucked "…" menu (report/hide) — calm on the surface
  const [revealed, setRevealed] = useState(false);   // content-warning veil (Circles) — tap to read
  const isOpen = post.comments_mode !== "reaction";
  const jessTried = useRef(false);

  const loadComments = useCallback(async () => {
    let rows;
    try { rows = await base44.entities.Comment.filter({ post_id: post.id, hidden: false }, "created_date", 100); setCommentsErr(false); }
    catch (e) { console.error("comments load failed:", e); setCommentsErr(true); setComments([]); return; }
    const list = Array.isArray(rows) ? rows : [];
    setComments(list);

    // Judicious Jess: once per post per device, only if the thread is open + has no Jess reply.
    // Fires when the post reads heavier/asking, OR — the "no post left unanswered" BACKSTOP —
    // when a thread has sat with ZERO replies for a while (>15 min). The server re-gates + the
    // model may decline, so a fired call can still come back empty; we just don't ask again.
    const noReplies = list.length === 0;
    const ageMin = (Date.now() - new Date(post.created_date || post.created_at || 0).getTime()) / 60000;
    const heavy = clientHeavy(post.body);
    const isBackstop = !heavy && noReplies && ageMin > 15;
    if (!jessTried.current && isOpen && !list.some((c) => c.by === "jess")
        && (heavy || isBackstop) && !jessAsked(post.id)) {
      jessTried.current = true;
      markJessAsked(post.id);
      try {
        const r = await base44.functions.invoke("jessSupport", { post_id: post.id, backstop: isBackstop });
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
    markReacted(post.id, kind);   // optimistic — the pill visibly registers the tap immediately
    setReactErr(false);
    onChanged?.();
    try {
      const wh = await communityHash(user?.id);
      // client-side timeout so a stalled call can't hang the tap silently
      const r = await Promise.race([
        base44.functions.invoke("createCommunityPost", { action: "react", user_id: user?.id, author_hash: wh, target_type: "post", target_id: post.id, kind }),
        new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 8000)),
      ]);
      if (!(r?.data ?? r)?.ok) throw new Error("react rejected");
    } catch (e) {
      // Roll the pill back AND surface a brief error so the failed tap isn't silent.
      console.error("react failed:", e); unmarkReacted(post.id, kind); onChanged?.();
      setReactErr(true); setTimeout(() => setReactErr(false), 3000);
    }
  };

  const report = async () => {
    if (hasReported(post.id)) return;
    markReported(post.id);
    try {
      const wh = await communityHash(user?.id);
      await base44.functions.invoke("createCommunityPost", { action: "report", user_id: user?.id, author_hash: wh, target_type: "post", target_id: post.id });
      onChanged?.();
    } catch (e) { console.error("report failed:", e); }
  };

  const sendComment = async () => {
    const text = draft.trim();
    if (!text || busy) return;
    if (crisisCheck(text).intercept) { onCrisis(); return; }
    setBusy(true);
    setCommentErr(false);
    try {
      const wh = await communityHash(user?.id);
      const r = await base44.functions.invoke("createCommunityPost", { action: "comment", user_id: user?.id, author_hash: wh, post_id: post.id, body: text });
      const d = r?.data ?? r;
      if (d?.intercept) { onCrisis(); return; }
      // A failed comment must NOT hang the box — surface an error and unblock.
      if (!d?.comment?.id) { setCommentErr(true); setBusy(false); return; }
      // Publish-then-screen: the comment is live now; screen it out-of-band (fire-and-forget).
      base44.functions.invoke("screenContent", { kind: "comment", id: d.comment.id }).catch(() => {});
      // Optimistic: append the returned comment immediately (chronological order) so it shows
      // in <1s; reconcile with a background refetch (NOT awaited — never gate on the sorted read).
      setComments((prev) => [...(Array.isArray(prev) ? prev : []), d.comment]);
      setDraft("");
      loadComments();
    } catch (e) { console.error("comment failed:", e); setCommentErr(true); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ background: `linear-gradient(165deg, ${T.paperHi} 0%, ${T.paperDeep}22 100%)`, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "15px 16px", marginBottom: 13, boxShadow: "0 2px 12px rgba(58,44,26,0.08), 0 1px 3px rgba(58,44,26,0.05)" }}>
      {/* enhanced: a warm botanical alias (derived from the anon hash — no identity) */}
      {enhanced && post.author_hash && (
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
          <span style={{ width: 22, height: 22, borderRadius: 999, background: `${T.gold}22`, display: "grid", placeItems: "center", flexShrink: 0 }}><Sprout size={12} color={T.gold} /></span>
          <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.inkSoft }}>{myHash && post.author_hash === myHash ? "You" : botanicalAlias(post.author_hash)}</span>
          {post.domain && <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, marginLeft: "auto", letterSpacing: 0.3, textTransform: "uppercase" }}>{post.domain}</span>}
        </div>
      )}
      {!enhanced && post.domain && <Eyebrow color={T.gold} mb={6}>{post.domain}</Eyebrow>}
      {/* content-warning veil (Circles) — neutral, "tap to read", never a hard block */}
      {post.content_warning && !revealed ? (
        <button onClick={() => setRevealed(true)} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", textAlign: "left", background: `${T.plum || "#8E6E8E"}12`, border: `1px dashed ${T.paperDeep}`, borderRadius: 12, padding: "13px 14px", marginBottom: 12, cursor: "pointer" }}>
          <ShieldAlert size={16} color={T.plum || "#8E6E8E"} style={{ flexShrink: 0 }} />
          <span style={{ fontFamily: UI, fontSize: 12.5, color: T.inkSoft, lineHeight: 1.4 }}><b>Sensitive — {post.content_warning}.</b> Tap to read when you're ready.</span>
        </button>
      ) : (
        <Hand size={20} color={T.ink} style={{ marginBottom: 12 }}>{post.body}</Hand>
      )}

      {/* reactions (warmth, never counted) + a QUIET "…" menu for report/hide (safe by
          design, calm on the surface — protection stays, the friction goes). */}
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
        <div style={{ marginLeft: "auto", position: "relative" }}>
          <button onClick={() => setMenuOpen((o) => !o)} aria-label="More" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, display: "inline-flex", padding: 4 }}>
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <>
              <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
              <div role="menu" style={{ position: "absolute", top: "100%", right: 0, zIndex: 41, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 10, boxShadow: "0 6px 20px rgba(58,44,26,0.16)", padding: 5, minWidth: 168 }}>
                {enhanced && post.author_hash && (!myHash || post.author_hash !== myHash) && (
                  <button onClick={() => { setMenuOpen(false); hideAuthor(post.author_hash); onChanged?.(); }} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", background: "transparent", border: "none", cursor: "pointer", color: T.ink, fontFamily: UI, fontSize: 13, fontWeight: 600, padding: "9px 10px", borderRadius: 7, textAlign: "left" }}>
                    <EyeOff size={14} color={T.muted} /> Hide this voice
                  </button>
                )}
                <button onClick={() => { setMenuOpen(false); report(); }} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", background: "transparent", border: "none", cursor: "pointer", color: T.ink, fontFamily: UI, fontSize: 13, fontWeight: 600, padding: "9px 10px", borderRadius: 7, textAlign: "left" }}>
                  <Flag size={14} color={T.muted} /> Report
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {reactErr && <div style={{ fontFamily: UI, fontSize: 11, color: T.crimson, marginTop: 5 }}>Couldn{"’"}t register that — try again.</div>}

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
                  {c.by !== "jess" && enhanced && c.author_hash && (
                    <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.muted, marginBottom: 2 }}>{myHash && c.author_hash === myHash ? "You" : botanicalAlias(c.author_hash)}</div>
                  )}
                  <Hand size={17} color={T.inkSoft}>{c.body}</Hand>
                </div>
              )
            ))}
            <div style={{ marginTop: 8 }}>
              <textarea value={draft} onChange={(e) => { setDraft(e.target.value); if (commentErr) setCommentErr(false); }} maxLength={COMMENT_MAX} placeholder="A kind word… you don't have to fix it." style={{ ...inputStyle, minHeight: 56, fontSize: 16 }} />
              {commentErr && <div style={{ fontFamily: UI, fontSize: 12, color: T.crimson, lineHeight: 1.45, marginTop: 6 }}>Couldn{"’"}t add that just now — give it another try in a moment.</div>}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted }}>{COMMENT_KINDNESS}</span>
                <button onClick={sendComment} disabled={!draft.trim() || busy} style={{ ...primaryBtn, padding: "8px 14px", opacity: (!draft.trim() || busy) ? 0.5 : 1 }}>
                  <Send size={13} /> {busy ? "Sending…" : "Reply"}
                </button>
              </div>
              {/* the per-comment medical disclaimer wall removed (calm on the surface); the
                  medical-advice note now lives once in the quiet Support corner. */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── room composer ────────────────────────────────────────────────────────────
function RoomComposer({ room, circle, club, user, onCrisis, onPosted, onCancel, initialBody = "", sensitive = false }) {
  const [body, setBody] = useState(initialBody);
  const [mode, setMode] = useState("open");
  const [cw, setCw] = useState("");            // author-set content warning (sensitive circles)
  const [cwOpen, setCwOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [err, setErr] = useState(false);
  const send = async () => {
    const text = body.trim();
    if (!text || busy) return;
    if (crisisCheck(text).intercept) { onCrisis(); return; }
    setBusy(true);
    setDeclined(false);
    setErr(false);
    try {
      const wh = await communityHash(user?.id);
      const r = await base44.functions.invoke("createCommunityPost", { user_id: user?.id, author_hash: wh, room, circle: circle || undefined, club: club || undefined, body: text, comments_mode: mode, content_warning: (cwOpen && cw.trim()) ? cw.trim() : undefined });
      const d = r?.data ?? r;
      if (d?.intercept) { onCrisis(); return; }
      if (d?.error === "rate") { setBusy(false); return; }
      if (d?.removed) { setDeclined(true); setBusy(false); return; }  // local floor declined it
      // A failed create must NOT hang the composer — surface an error and unblock.
      if (!d?.post?.id) { setErr(true); setBusy(false); return; }
      // Publish-then-screen: the post is live now; screen it out-of-band (fire-and-forget,
      // never awaited). If OpenAI flags it, screenContent pulls it within moments.
      base44.functions.invoke("screenContent", { kind: "post", id: d.post.id }).catch(() => {});
      // Optimistic: hand the created post up so it's inserted into the feed immediately —
      // the composer close + the post appearing are NEVER gated on the slow feed refetch.
      onPosted?.(d.post);
    } catch (e) { console.error("post failed:", e); setErr(true); }
    finally { setBusy(false); }
  };
  return (
    <div style={{ background: T.paperHi, border: `1px solid ${T.gold}`, borderRadius: 4, padding: "15px 16px", marginBottom: 16 }}>
      <Eyebrow mb={8}>Add to the room</Eyebrow>
      <textarea value={body} onChange={(e) => { setBody(e.target.value); if (declined) setDeclined(false); if (err) setErr(false); }} maxLength={POST_MAX} placeholder="Say it plainly — silly to serious, no names." style={{ ...inputStyle, minHeight: 90 }} />
      {declined && (
        <div style={{ marginTop: 8, fontFamily: UI, fontSize: 12, color: T.crimson, lineHeight: 1.45 }}>
          Jess held this one back — it reads as unkind for the room. Reword it and it'll go up.
        </div>
      )}
      {err && (
        <div style={{ marginTop: 8, fontFamily: UI, fontSize: 12, color: T.crimson, lineHeight: 1.45 }}>
          Couldn't post that just now — give it another try in a moment.
        </div>
      )}
      {/* sensitive circles: optional author-set content note (a "tap to read" veil for readers) */}
      {sensitive && (
        cwOpen ? (
          <div style={{ marginTop: 10, background: `${T.plum || "#8E6E8E"}0E`, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "10px 11px" }}>
            <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, marginBottom: 6 }}>A gentle heads-up for readers (optional) — one or two words.</div>
            <input value={cw} onChange={(e) => setCw(e.target.value)} maxLength={40} placeholder="e.g. loss · fertility · surgery" style={{ ...inputStyle, minHeight: 0, padding: "9px 11px", fontSize: 14 }} />
          </div>
        ) : (
          <button onClick={() => setCwOpen(true)} style={{ ...ghostBtn, marginTop: 10, fontSize: 12 }}><ShieldAlert size={13} /> Add a content note</button>
        )
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
      // Optimistic: append the returned note immediately; reconcile via background load (not awaited).
      if (d?.note?.id) setNotes((prev) => [...(Array.isArray(prev) ? prev : []), d.note]);
      setDraft(""); load();
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
      <Script size={32} color={OXBLOOD} style={{ marginBottom: 2 }}>{pick.title}</Script>
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
      <Script size={34} color={OXBLOOD} style={{ marginBottom: 6 }}>What the room knows</Script>
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
  const [total, setTotal] = useState(null);   // null = loading; number = count
  const [capped, setCapped] = useState(false);
  const [busy, setBusy] = useState(false);
  const [thanks, setThanks] = useState("");   // gentle feedback after a tap
  const [err, setErr] = useState(false);
  const load = useCallback(async () => {
    try {
      const wh = await communityHash(user?.id);
      const r = await base44.functions.invoke("collectivePool", { user_id: user?.id, author_hash: wh });
      const d = r?.data ?? r;
      if (typeof d?.total === "number") setTotal(d.total); else setTotal(0);
    } catch { setTotal((t) => (typeof t === "number" ? t : 0)); }
  }, [user?.id]);
  useEffect(() => { load(); }, [load]);

  const add = async (moment, label) => {
    if (busy) return;
    setBusy(true); setErr(false);
    const before = typeof total === "number" ? total : 0;
    setTotal(before + 1);              // optimistic — the tap visibly registers
    setThanks(`${label} — that's one. Thank you.`);
    try {
      const wh = await communityHash(user?.id);
      const r = await base44.functions.invoke("collectivePool", { user_id: user?.id, author_hash: wh, moment });
      const d = r?.data ?? r;
      if (typeof d?.total === "number") setTotal(d.total);   // reconcile with the server
      if (d?.capped) { setCapped(true); setThanks("You've added plenty today — lovely. The pool keeps going."); }
    } catch (e) {
      console.error("pool add failed:", e);
      setTotal(before); setThanks(""); setErr(true);          // roll back on failure
    } finally {
      setBusy(false);
      setTimeout(() => setThanks(""), 4000);
    }
  };

  const n = Math.max(0, Math.round(Number(total) || 0));
  const milestone = Math.max(50, Math.ceil((n + 1) / 50) * 50);   // soft, ever-receding target
  const pct = Math.min(100, Math.round((n / milestone) * 100));
  const line = total === null
    ? "Counting the small kindnesses…"
    : n === 0
      ? "Be the first small kindness this week — add one below, and the bar starts to rise."
      : `Women here have added ${n} small ${n === 1 ? "kindness" : "kindnesses"} to themselves this week.`;

  return (
    <section style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 6, padding: "18px 18px 16px", marginBottom: 26 }}>
      <Eyebrow color={T.gold} mb={8}>Together this week</Eyebrow>
      <Hand size={18} color={T.ink} style={{ marginBottom: 10 }}>{line}</Hand>
      <div style={{ height: 8, borderRadius: 999, background: T.paperDeep, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: T.gold, transition: "width .4s ease" }} />
      </div>
      <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginBottom: 12 }}>It only rises. No names, no scores — just us, adding up.</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {POOL_MOMENTS.map((m) => (
          <button key={m.key} onClick={() => add(m.key, m.label)} disabled={busy} style={{
            fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: busy ? "default" : "pointer",
            padding: "8px 13px", borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: "transparent", color: T.inkSoft, opacity: busy ? 0.6 : 1,
          }}>{m.label}</button>
        ))}
      </div>
      {thanks && <div style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 700, color: T.gold, marginTop: 10, display: "inline-flex", alignItems: "center", gap: 5 }}><Check size={12} /> {thanks}</div>}
      {err && <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 10 }}>Couldn't reach the pool just now — try again in a moment.</div>}
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
  const [err, setErr] = useState(false);
  const loadReveal = useCallback(async () => {
    const rows = await base44.entities.RitualContribution.filter({ week_key: wk, hidden: false }, "-created_date", 40).catch(() => []);
    setLines(Array.isArray(rows) ? rows.filter((r) => r.status !== "removed" && r.body) : []);
  }, [wk]);
  useEffect(() => { if (closed) loadReveal(); }, [closed, loadReveal]);
  const send = async () => {
    const text = draft.trim(); if (!text || busy) return;
    if (crisisCheck(text).intercept) { onCrisis(); return; }
    setBusy(true); setErr(false);
    try {
      const wh = await communityHash(user?.id);
      const r = await base44.functions.invoke("closeTheWeek", { user_id: user?.id, author_hash: wh, body: text });
      const d = r?.data ?? r;
      if (d?.intercept) { onCrisis(); return; }
      markClosedWeek(wk); setClosed(true); setDraft("");
    } catch (e) { console.error("close week failed:", e); setErr(true); }
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
          {err && <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 8, textAlign: "right" }}>Couldn't close it just now — try again in a moment.</div>}
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

// SEASONS (above) feeds the folded, count-free belonging line on the home (Option B).

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

// "Today in the community" — ONE rotating slot, changing daily (deterministic by date so it's
// stable within a day, rotates each day) through these four. The slot renders the REAL working
// component, not a static teaser.
const SLOT_VARIANTS = ["wisdom", "pool", "close", "club"];
function todaySlot() {
  const day = new Date().toISOString().split("T")[0];
  const epoch = Math.floor(new Date(day + "T00:00:00Z").getTime() / 86400000);
  return SLOT_VARIANTS[((epoch % SLOT_VARIANTS.length) + SLOT_VARIANTS.length) % SLOT_VARIANTS.length];
}

// A slim home affordance (the demoted links).
function SlimLink({ icon: Ic, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer",
      padding: "9px 14px", borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: "transparent",
      fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.inkSoft,
    }}>
      <Ic size={13} style={{ color: T.gold }} /> {children}
    </button>
  );
}

// ── rooms-as-doors home — the calm doorway (Option B) ────────────────────────
function Home({ presence, lifeStage, onEnter, user, onCrisis, onShareTo, onOpenHub }) {
  const season = lifeStage ? SEASONS[lifeStage] : null;
  const slot = todaySlot();
  // The doors are the spine. Echo Wall + Clubs join the topic rooms as doors.
  const doors = [
    { key: "echo", Icon: Waves, name: "Echo Wall", line: "Anonymous lines, held by the room — each fades in 48h." },
    ...ROOMS,
    { key: "clubs", Icon: HeartHandshake, name: "Clubs", line: "Small groups for what you do together." },
  ];
  return (
    <div>
      {/* masthead — the doorway's voice */}
      <Eyebrow mb={8}>{MASTHEAD.eyebrow}</Eyebrow>
      <Script size={42} style={{ marginBottom: 8 }}>{MASTHEAD.title}</Script>
      <Hand size={19} color={T.inkSoft} style={{ marginBottom: 14 }}>{MASTHEAD.subtitle}</Hand>

      {/* Jump-to pill on the LEFT (§6.8.1 division; calendar stays top-right) + ambient presence */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 24 }}>
        {onOpenHub && <JumpToButton onClick={onOpenHub} />}
        <div>
          <div style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, fontWeight: 600, lineHeight: 1.5 }}>{presence}</div>
          {season && <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5, marginTop: 3 }}>{season.line}</div>}
        </div>
      </div>

      {/* the ONE focal point */}
      <QotdCard user={user} onCrisis={onCrisis} />

      {/* GROWTH Phase-0 (Halli-approved, live): Tier 0 ANONYMOUS connection — the
          read-only "someone like you" resonance card (no contact, no 1:1, no UGC write).
          The shared-prompt room above (Question of the Day) IS the async prompt room;
          writable themed rooms stay HELD under the moderation safety dial. */}
      <div style={{ marginTop: 14, marginBottom: 6 }}><ResonanceLive wide /></div>

      {/* the ONE rotating "Today in the community" slot — the real working component */}
      <Eyebrow color={T.gold} mb={8}>Today in the community</Eyebrow>
      {slot === "wisdom" && <WisdomCard onOpen={() => onEnter("wisdom")} />}
      {slot === "pool" && <PoolCard user={user} />}
      {slot === "close" && <CloseWeekCard user={user} onCrisis={onCrisis} />}
      {slot === "club" && <ClubsCard onOpen={() => onEnter("clubs")} />}

      {/* the rooms — the spine (Echo Wall + Clubs are doors here) */}
      <Eyebrow mb={12}>The rooms — step into any one</Eyebrow>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {doors.map((r) => {
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

      {/* a gentle, dismissible Jess nudge (once-per-id) */}
      <JessNudge
        id="community-reflect-v1"
        line="Some of what's said here is worth keeping. Want a quiet place to write your own?"
        to="Journal?compose=1"
        actionLabel="Open my journal"
      />

      {/* the demoted affordances — small links; everything's also in the Jump hub */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 18 }}>
        {onShareTo && <SlimLink icon={Send} onClick={onShareTo}>Share a thought</SlimLink>}
        {onOpenHub && <SlimLink icon={HeartHandshake} onClick={onOpenHub}>Quietly, one to one</SlimLink>}
        <SlimLink icon={HeartHandshake} onClick={() => window.dispatchEvent(new CustomEvent("fw_open_assistant", { detail: { from: "community" } }))}>Talk to Jess</SlimLink>
        <ShareButton label="Invite a friend" artifact={{
          kind: "invite",
          line: "Come find your people — anonymous, whole-life, kind. For all of you, not just your cycle.",
          footer: "An invitation", url: "https://femwells.com",
          shareText: "I think you'd like FemWell — a whole-life space for women, and everyone on a woman's health journey. Anonymous, 18+.",
        }} />
      </div>
    </div>
  );
}

// ── a room (sticky tabs + feed + composer) ───────────────────────────────────
// ── Jess's round (M3) — The Lighter Side games-master ────────────────────────
// Parametrized: with NO kind it loads the day-rotated nightly round (room "lighter",
// the dark PLUM headline). With a `kind` it loads that NAMED game's own independent
// round (real GameRound in the 'lighter:<kind>' namespace) — so The Games Room shows
// several real, separately-playable games at once, each with real persistence +
// Jess's aggregate reveal. Same write path (submitGameResponse) either way.
// a fully-local round from the curated prompts — the game is ALWAYS playable, even if the
// round backend is slow/unavailable. (Module-level so it can seed useState directly.)
function makeLocalRound(kind) {
  const k = kind || "this_or_that";
  const def = CLIENT_GAME_PROMPTS[k] || CLIENT_GAME_PROMPTS.one_word;
  return { id: "local_" + k, kind: k, prompt: def.prompt, options: def.options, status: "open", closes_at: null, _local: true };
}

function GameRoundCard({ user, onCrisis, kind = null, name = null, blurb = null }) {
  const named = !!kind;
  // SEED round with a playable local round from the very first render — never null, never a
  // "setting up" wait, and independent of effect timing (a mount quirk in the embedded sheet
  // context left round null when seeded via useEffect). The backend round upgrades it later.
  const [round, setRound] = useState(() => makeLocalRound(named ? kind : "this_or_that"));
  const [answered, setAnswered] = useState(() => gameAnswered(makeLocalRound(named ? kind : "this_or_that").id));
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const tried = useRef(false);

  useEffect(() => {
    if (tried.current) return; tried.current = true;
    // Try to UPGRADE to the real cross-device backend round; keep the local one on any
    // failure (the old openGameRound wedged after an LLM-hang deploy → V2 rename + this
    // resilient local-first design). Only swap if the player hasn't answered locally yet.
    const localId = makeLocalRound(named ? kind : "this_or_that").id;
    (async () => {
      try {
        const r = await base44.functions.invoke("openGameRoundV2", named ? { kind } : { room: "lighter" });
        const d = r?.data ?? r;
        if (d?.round && !gameAnswered(localId)) { setRound(d.round); setAnswered(gameAnswered(d.round.id)); }
      } catch (e) { /* keep the local round — the game stays playable */ }
    })();
  }, []);

  const submit = async (payload) => {
    if (busy || !round) return;
    if (payload.text && crisisCheck(payload.text).intercept) { onCrisis(); return; }
    setBusy(true);
    try {
      // local round → keep the answer on-device (no backend); real round → the proven write
      if (!round._local) {
        const wh = await communityHash(user?.id);
        const r = await base44.functions.invoke("submitGameResponse", { user_id: user?.id, author_hash: wh, round_id: round.id, ...payload });
        const d = r?.data ?? r;
        if (d?.intercept) { onCrisis(); return; }
      }
      // rejected (harmful) / ok / already / local → either way the round is now "answered" here
      markGameAnswered(round.id); setAnswered(true); setDraft("");
    } catch (e) { console.error("game answer failed:", e); markGameAnswered(round.id); setAnswered(true); setDraft(""); }
    finally { setBusy(false); }
  };

  // The nightly headline stays QUIET unless the BACKEND supplies a real round (showing the
  // local fallback here would duplicate the named "This or That" card). Named game cards
  // always render — they carry the experience whether the round is real or local.
  if (!named && (round === null || round === false || round?._local)) return null;

  const isClosed = round && round.status === "closed";
  const hasOptions = round && Array.isArray(round.options) && round.options.length >= 2;
  const accent = named ? T.gold : T.gold;
  const promptColor = named ? T.ink : "#F4EFE3";
  const revealColor = named ? T.inkSoft : "#EBD9C4";
  const metaColor = named ? T.muted : "#A9967F";
  const answeredColor = named ? T.muted : "#CDBBA6";

  // the playable body (options / one-line / answered / reveal) — shared by both variants
  const body = round === null ? (
    <div style={{ fontFamily: UI, fontSize: 12, color: metaColor }}>Jess is setting this one up…</div>
  ) : round === false ? (
    <div style={{ fontFamily: UI, fontSize: 12.5, color: metaColor, lineHeight: 1.5 }}>Jess is setting this one up — check back in a little while.</div>
  ) : isClosed ? (
    <div style={{ fontFamily: HANDFAM, fontSize: named ? 16.5 : 18, lineHeight: 1.5, color: revealColor }}>{round.reveal}</div>
  ) : answered ? (
    <div style={{ fontFamily: UI, fontSize: 12.5, color: answeredColor, lineHeight: 1.5 }}>
      {round._local
        ? CLIENT_GAME_REVEAL
        : <>You{"’"}re in. Come back when it closes and Jess will gather what the room said — no winners, just us. <span style={{ opacity: 0.8 }}>({closesInLabel(round.closes_at)}.)</span></>}
    </div>
  ) : hasOptions ? (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {round.options.map((o) => (
        <button key={o} onClick={() => submit({ choice: o })} disabled={busy} style={{
          fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: busy ? "default" : "pointer",
          padding: "10px 16px", borderRadius: 999,
          border: named ? `1px solid ${T.paperDeep}` : "1px solid rgba(212,175,55,0.5)",
          background: named ? T.paper : "rgba(212,175,55,0.12)", color: named ? T.ink : "#F4EFE3", opacity: busy ? 0.6 : 1,
        }}>{o}</button>
      ))}
    </div>
  ) : (
    <div>
      <textarea value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={160}
        placeholder="One line — for fun, no names." rows={2}
        style={{ width: "100%", boxSizing: "border-box", fontFamily: HANDFAM, fontSize: 17, padding: "10px 12px", borderRadius: 6,
          border: named ? `1px solid ${T.paperDeep}` : "1px solid rgba(244,239,227,0.25)",
          background: named ? T.paper : "rgba(244,239,227,0.06)", color: named ? T.ink : "#F4EFE3", resize: "none" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
        <span style={{ fontFamily: UI, fontSize: 10.5, color: metaColor }}>{round._local ? "just for fun" : closesInLabel(round.closes_at)}</span>
        <button onClick={() => draft.trim() && submit({ text: draft.trim() })} disabled={!draft.trim() || busy} style={{
          fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: (!draft.trim() || busy) ? "default" : "pointer",
          padding: "8px 16px", borderRadius: 999, border: "none", background: T.gold, color: PLUM, opacity: (!draft.trim() || busy) ? 0.5 : 1,
        }}>{busy ? "Adding…" : "Add mine"}</button>
      </div>
    </div>
  );

  if (named) {
    return (
      <section style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 6, padding: "15px 16px 14px", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
          <Script size={22} color={T.ink}>{name}</Script>
          <span style={{ fontFamily: UI, fontSize: 9, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: isClosed ? T.muted : accent }}>
            {round && round.status ? (isClosed ? "the reveal" : "playing now") : ""}
          </span>
        </div>
        <Hand size={14.5} color={T.muted} style={{ marginBottom: 12 }}>{blurb}</Hand>
        {round && round.status && !isClosed && (
          <Script size={20} color={promptColor} style={{ marginBottom: 12 }}>{round.prompt}</Script>
        )}
        {body}
      </section>
    );
  }

  return (
    <section style={{ background: PLUM, borderRadius: 6, padding: "18px 18px 16px", marginBottom: 18, color: "#F4EFE3" }}>
      <Eyebrow color={T.gold} mb={8}>Jess's round{isClosed ? " · the reveal" : " · tonight"}</Eyebrow>
      <Script size={25} color="#F4EFE3" style={{ marginBottom: 12 }}>{round.prompt}</Script>
      {body}
    </section>
  );
}

// Client-side fallback prompts (mirror the backend's curated set). If the games
// function is slow/unavailable, the round still opens from these so the game is ALWAYS
// playable — answers are kept on-device and Jess gives a warm, count-free reveal. When
// the backend is healthy it takes over (real cross-device rounds + aggregate).
const CLIENT_GAME_PROMPTS = {
  this_or_that:    { prompt: "Cosy night in, or a big night out?", options: ["Cosy night in", "Big night out"] },
  one_word:        { prompt: "One word for how today has felt so far?", options: [] },
  caption:         { prompt: "A kettle clicking off in a quiet kitchen at dawn — caption the feeling.", options: [] },
  one_line_story:  { prompt: "She opened the door she had walked past a hundred times, and…", options: [] },
  kind_confession: { prompt: "A tiny, harmless habit no one knows you have?", options: [] },
  recommend:       { prompt: "Recommend the room one small comfort — a show, a song, or a snack.", options: [] },
};
const CLIENT_GAME_REVEAL = "Lovely — your answer's in. When the room's all played, Jess gathers the warm whole of it. No winners here, just us.";

// The named games lineup — each a real, separately-playable GameRound (its own format).
const NAMED_GAMES = [
  { kind: "this_or_that",    name: "This or That",    blurb: "Two cosy options, one gut pick. Jess gathers where the room landed." },
  { kind: "one_word",        name: "One Word",        blurb: "Answer in a single word — Jess reveals the shape of the room's mood." },
  { kind: "caption",         name: "Caption the Feeling", blurb: "A small everyday scene — caption the feeling, never a person." },
  { kind: "one_line_story",  name: "One-Line Story",  blurb: "Add the next line to a story the room is writing together." },
  { kind: "kind_confession", name: "Tiny Confession", blurb: "A small harmless habit no one knows. Gentle, never shameful." },
  { kind: "recommend",       name: "Comfort Pick",    blurb: "Recommend the room one small comfort — a show, a song, a snack." },
];

// ── Circles (Phase 4) — curated whole-life cohorts inside the Circles door ────
// ── Books circle · seasonal shared read (Books & Book Clubs, Phase 2) ─────────
// The `books` Circle hosts a seasonal "we're reading X together" beat — the SAME curated pick as
// the Jess-hosted Book Club (SEED_PICK / an active BookClubPick), surfaced inside the circle. This
// is NOT a member-hosting surface: it's a read-only signpost into the existing Book Club read +
// its readers' corner, plus a count-free "where the room tends to be" line and the k-floored cohort
// milestone. Anonymity-aware (cohort via the anonymous ReadingActivity helper, fail-open).
function BooksCircleSharedRead() {
  const navigate = useNavigate();
  const [pick, setPick] = useState(SEED_PICK);   // seed immediately; upgrade to a live pick if set
  const [cohort, setCohort] = useState(undefined);   // undefined = loading; number = k-floored; null = below floor
  const [reached, setReached] = useState(() => clubReached(SEED_PICK.pick_key));

  useEffect(() => {
    let alive = true;
    // Prefer a live BookClubPick (active) over the seed, mirroring BookClubView. Fail-open to seed.
    base44.entities.BookClubPick.filter({ active: true }, "-created_date", 1).catch(() => []).then((picks) => {
      if (!alive) return;
      const p0 = Array.isArray(picks) && picks.length ? picks[0] : null;
      if (p0) { setPick(p0); setReached(clubReached(p0.pick_key)); }
    });
    return () => { alive = false; };
  }, []);

  // "Where the room tends to be" — k-floored cohort at the reader's own self-attested checkpoint,
  // so it's spoiler-safe (never reveals progress beyond where you are) AND count-free below the
  // floor. Anonymous: reuses cohortReachedCount (author_hash only). Never awaited on a tap.
  useEffect(() => {
    let alive = true;
    const gid = pick?.gutenberg_id;
    if (gid == null) { setCohort(null); return; }
    const at = Math.max(0, reached);   // checkpoint index doubles as a chapter-ish floor
    cohortReachedCount(String(gid), at).then((n) => { if (alive) setCohort(typeof n === "number" ? n : null); }).catch(() => { if (alive) setCohort(null); });
    return () => { alive = false; };
  }, [pick?.gutenberg_id, reached]);

  const gid = pick?.gutenberg_id;
  const cornerHref = gid != null ? createPageUrl(`Community?club=${dailyReadClubKey(gid)}&title=${encodeURIComponent(pick?.title || "")}`) : null;

  return (
    <section style={{ background: T.paperHi, border: `1px solid ${T.gold}`, borderRadius: 6, padding: "16px 16px 14px", marginBottom: 20 }}>
      <Eyebrow color={T.gold} mb={6}>This season, together</Eyebrow>
      <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontWeight: 700, fontSize: 19, color: T.ink, marginBottom: 2 }}>
        The Books circle is reading {pick?.title}.
      </div>
      <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, marginBottom: 10 }}>
        {pick?.author}{pick?.cadence ? ` · ${pick.cadence}` : ""}
      </div>

      {/* count-free / k-floored "where the room tends to be" — never a race, never a number below floor */}
      <Hand size={15.5} color={T.inkSoft} style={{ marginBottom: 12 }}>
        {cohort === undefined
          ? "Finding where the room is…"
          : typeof cohort === "number"
            ? `${cohort} of us have reached around where you are. No rush — the thread waits.`
            : "A quiet few are reading along right now. No rush — the thread waits, and there's no catching up to do."}
      </Hand>

      <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
        {gid != null && (
          <button onClick={() => navigate(createPageUrl(`BookReader?gutenberg_id=${gid}`))} style={{ ...primaryBtn, padding: "9px 15px" }}>
            <MessageCircle size={14} /> Read it in the Library
          </button>
        )}
        {cornerHref && (
          <button onClick={() => navigate(cornerHref)} style={{ ...ghostBtn, padding: "9px 14px" }}>
            <Users size={13} /> The readers{"’"} corner
          </button>
        )}
      </div>
    </section>
  );
}

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

function CirclesDirectory({ onOpen, profile = null, onHome = null }) {
  const [, force] = useState(0);   // re-render after join-state changes elsewhere
  useEffect(() => { force((n) => n + 1); }, []);
  const mine = CIRCLES.filter((c) => isJoined(c.key));   // v2 — your circles, device-local
  // "A few for you" — from stage + interests only (NEVER inferred from tracked symptoms); whole-life.
  const suggested = suggestedCircles(profile).filter((c) => !isJoined(c.key)).slice(0, 4);
  return (
    <div>
      {onHome && <button onClick={onHome} style={{ ...ghostBtn, marginBottom: 14, padding: "7px 11px" }}><ChevronLeft size={14} /> Community</button>}
      <Eyebrow color={T.gold} mb={6}>Circles · who you are</Eyebrow>
      <Script size={34} color={OXBLOOD} style={{ marginBottom: 4 }}>Your circles</Script>
      <Hand size={17} color={T.muted} style={{ marginBottom: 18 }}>
        Smaller rooms for what you're living and what you love — here it's <i>believed</i>. Lurk freely; join the ones that are yours.
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
          <Eyebrow color={T.gold} mb={8}>A few circles for you</Eyebrow>
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
  const [joinErr, setJoinErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const [myHash, setMyHash] = useState(null);
  useEffect(() => { let a = true; communityHash(user?.id).then((h) => { if (a) setMyHash(h); }).catch(() => {}); return () => { a = false; }; }, [user?.id]);
  const prompt = circlePromptForDay(circleKey);
  const info = CIRCLE_INFO[circleKey] || null;
  // k-anon "who's here" — distinct recent author_hashes in this circle (bucketed, never a count).
  const activeN = Array.isArray(posts) ? new Set(posts.filter((p) => Date.now() - new Date(p.created_date || 0).getTime() <= PRESENCE_WINDOW_HRS * 3600e3).map((p) => p.author_hash)).size : 0;

  const load = useCallback(async () => {
    try {
      const rows = await base44.entities.CommunityPost.filter({ circle: circleKey, hidden: false }, "-created_date", 100);
      setPosts(Array.isArray(rows) ? rows : []);
    } catch (e) { console.error("circle feed failed:", e); setPosts(false); }
  }, [circleKey]);
  useEffect(() => { load(); }, [load]);

  const doJoin = async (consented) => {
    if (busy) return;
    setBusy(true); setJoinErr(false);
    try {
      const wh = await communityHash(user?.id);
      await Promise.race([
        base44.functions.invoke("joinCircle", { user_id: user?.id, author_hash: wh, circle_key: circleKey, consented: !!consented }),
        new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 8000)),
      ]);
      markJoined(circleKey); setJoined(true); setNeedConsent(false);
    } catch (e) { console.error("join failed:", e); setJoinErr(true); }   // visible error instead of a silent hang
    finally { setBusy(false); }
  };
  const onJoinClick = () => { if (circle?.sensitive) setNeedConsent(true); else doJoin(false); };
  const leave = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const wh = await communityHash(user?.id);
      await base44.functions.invoke("joinCircle", { action: "leave", user_id: user?.id, author_hash: wh, circle_key: circleKey });
      clearJoined(circleKey); setJoined(false);
    } catch (e) { console.error("leave failed:", e); }
    finally { setBusy(false); }
  };

  if (!circle) return <Hand size={17} color={T.muted}>That circle has wandered off. Go back to Circles.</Hand>;

  return (
    <div>
      <button onClick={onBack} style={{ ...ghostBtn, marginBottom: 14, padding: "7px 11px" }}><ChevronLeft size={14} /> Circles</button>
      <Script size={30} color={OXBLOOD} style={{ marginBottom: 4 }}>{circle.name}</Script>
      <Hand size={17} color={T.muted} style={{ marginBottom: 8 }}>{circle.line}</Hand>
      {/* k-anon "who's here" — warmth, never a count */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted, marginBottom: 14 }}>
        <Users size={13} color={T.gold} /> {circle.sensitive ? "It's believed here — " : ""}{activeN <= 0 ? "quiet so far; a lovely place to be first" : activeN < 5 ? "a few women are around" : "several women are here"}
      </div>

      {/* per-condition NHS/charity info anchor — the misinformation counterweight (calm, grounded) */}
      {info && (
        <div style={{ display: "flex", gap: 9, alignItems: "flex-start", background: `${T.sage}12`, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "10px 12px", marginBottom: 14 }}>
          <ShieldCheck size={15} color={T.sage} style={{ flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontFamily: UI, fontSize: 12, color: T.inkSoft, lineHeight: 1.5 }}>{info.line} {info.href && <a href={info.href} target="_blank" rel="noopener noreferrer" style={{ color: T.gold, fontWeight: 700 }}>NHS info →</a>}</span>
        </div>
      )}

      {/* Books circle hosts the seasonal shared read (Phase 2) — a signpost into the Jess-hosted
          Book Club + readers' corner, not a member-hosting surface. Lurkable; no join required. */}
      {circleKey === "books" && <BooksCircleSharedRead />}

      {/* circle ritual prompt — a warm, life-tinted on-ramp (a circle never reads empty) */}
      {prompt && !composing && (
        <div style={{ background: `linear-gradient(160deg, ${T.paperHi} 0%, ${T.gold}12 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${T.gold}`, borderRadius: 14, padding: "13px 15px", marginBottom: 14 }}>
          <Eyebrow color={T.gold} mb={5}>This week in {circle.name}</Eyebrow>
          <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontWeight: 600, fontSize: 18, color: T.ink, lineHeight: 1.3, marginBottom: joined ? 10 : 4 }}>{prompt}</div>
          {joined && <button onClick={() => setComposing(true)} style={{ ...primaryBtn, padding: "8px 14px" }}><Feather size={13} /> Answer this</button>}
        </div>
      )}

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
      {joinErr && <div style={{ fontFamily: UI, fontSize: 12, color: T.crimson, marginBottom: 12 }}>Couldn{"’"}t join just now — please try again.</div>}

      {!composing && joined && (
        <button onClick={() => setComposing(true)} style={{ ...primaryBtn, marginBottom: 16 }}><Plus size={14} /> Add to {circle.name}</button>
      )}
      {composing && (
        <RoomComposer room="circles" circle={circleKey} user={user} onCrisis={onCrisis} sensitive={!!circle.sensitive}
          onPosted={(post) => { setComposing(false); if (post?.id) setPosts((prev) => [post, ...(Array.isArray(prev) ? prev : [])]); load(); }} onCancel={() => setComposing(false)} />
      )}

      {posts === null && <Hand size={18} color={T.muted}>Opening the circle…</Hand>}
      {posts === false && <Hand size={18} color={T.muted}>Couldn{"’"}t reach the circle just now. Pull down to try again.</Hand>}
      {posts && posts.length === 0 && (
        <div style={{ background: T.paperHi, border: `1px dashed ${T.paperDeep}`, borderRadius: 14, padding: "22px 18px", textAlign: "center" }}>
          <Hand size={18} color={T.ink}>{circle.sensitive ? "Quiet so far — and you're not too much for this room." : "Quiet in here so far."}</Hand>
          <Hand size={15} color={T.muted}>{joined ? "Leave the first word — someone always comes by, and Jess is here too." : "Join to leave the first word — lurking's welcome as long as you like."}</Hand>
        </div>
      )}
      {posts && posts.map((p) => (
        <PostCard key={p.id} post={p} user={user} onCrisis={onCrisis} onChanged={load} enhanced myHash={myHash} />
      ))}
    </div>
  );
}

function CirclesView({ user, onCrisis, initialActive = null, profile = null, onHome = null }) {
  const [active, setActive] = useState(initialActive);   // null = directory; else circle key
  return active
    ? <CircleView circleKey={active} user={user} onCrisis={onCrisis} onBack={() => setActive(null)} />
    : <CirclesDirectory onOpen={setActive} profile={profile} onHome={onHome} />;
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
      <Script size={30} color={OXBLOOD} style={{ marginBottom: 4 }}>Clubs</Script>
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
      {/* Member-created book clubs are BUILT but gated behind CLUBS_USER_CREATE_ENABLED
          (the OSA/ICO safety floor for member-hosted spaces). When gated we render NOTHING
          rather than a "coming" promise — the hosted Book Club above is the real, live read. */}
      {CLUBS_USER_CREATE_ENABLED ? <StartBookClub user={user} onCreated={onOpen} /> : null}
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
  const [joinErr, setJoinErr] = useState(false);

  const load = useCallback(async () => {
    try {
      const rows = await base44.entities.CommunityPost.filter({ club: clubKey, hidden: false }, "-created_date", 100);
      setPosts(Array.isArray(rows) ? rows : []);
    } catch (e) { console.error("club feed failed:", e); setPosts(false); }
  }, [clubKey]);
  useEffect(() => { load(); }, [load]);

  const join = async () => {
    if (busy) return;
    setBusy(true); setJoinErr(false);
    try {
      const wh = await communityHash(user?.id);
      await Promise.race([
        base44.functions.invoke("joinClub", { user_id: user?.id, author_hash: wh, club_key: clubKey }),
        new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 8000)),
      ]);
      markClubJoined(clubKey); setJoined(true);
    } catch (e) { console.error("join club failed:", e); setJoinErr(true); }   // visible error instead of a silent hang
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
      <Script size={30} color={OXBLOOD} style={{ marginBottom: 4 }}>{club.name}</Script>
      <Hand size={17} color={T.muted} style={{ marginBottom: 14 }}>{club.line}</Hand>

      {club.dailyRead && (
        <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${T.gold}`, borderRadius: 6, padding: "10px 13px", marginBottom: 14 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 11.5, fontWeight: 700, color: T.inkSoft }}><Lock size={12} color={T.gold} /> Spoiler-safe — keep it general, no endings or twists given away.</span>
        </div>
      )}

      {club.dailyRead && (() => {
        const bookName = (clubTitle || club.name.replace(/ — (readers'? corner|book club)$/i, "")).trim();
        return bookName ? (
          <div style={{ marginBottom: 14 }}>
            <ShareButton label="Share this read" artifact={{
              kind: "bookpick", source: "bookpick", line: bookName, footer: "Reading this",
              url: "https://femwells.com", shareText: `Reading ${bookName} — others are too, on FemWell.`,
            }} />
          </div>
        ) : null;
      })()}

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        {joined
          ? <><span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.gold }}><Check size={14} /> You're in this club</span>
              <button onClick={leave} disabled={busy} style={{ ...ghostBtn, border: "none", color: T.muted }}>Leave</button></>
          : <button onClick={join} disabled={busy} style={{ ...primaryBtn, opacity: busy ? 0.6 : 1 }}><HeartHandshake size={14} /> Join this club</button>}
      </div>
      {joinErr && <div style={{ fontFamily: UI, fontSize: 12, color: T.crimson, marginBottom: 12 }}>Couldn{"’"}t join just now — please try again.</div>}

      {/* Readers' corners (daily-read book clubs) drop the join friction — you can post
          straight away and are AUTO-JOINED on your first word. Hosted convo clubs still ask. */}
      {!composing && (joined || club.dailyRead) && (
        <button onClick={() => setComposing(true)} style={{ ...primaryBtn, marginBottom: 16 }}><Plus size={14} /> Add to {club.name}</button>
      )}
      {composing && (
        <RoomComposer room="clubs" club={clubKey} user={user} onCrisis={onCrisis}
          onPosted={(post) => { setComposing(false); if (!joined && club.dailyRead) { try { markClubJoined(clubKey); } catch { /* ignore */ } setJoined(true); } if (post?.id) setPosts((prev) => [post, ...(Array.isArray(prev) ? prev : [])]); load(); }} onCancel={() => setComposing(false)} />
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
function GamesView({ user, onCrisis, onHome, onNav }) {
  return (
    <div>
      {onHome && <button onClick={onHome} style={{ ...ghostBtn, marginBottom: 14, padding: "7px 11px" }}><ChevronLeft size={14} /> Community</button>}
      <Eyebrow color={T.gold} mb={6}>Together · play lightly</Eyebrow>
      <Script size={34} color={OXBLOOD} style={{ marginBottom: 4 }}>The Games Room</Script>
      <Hand size={17} color={T.muted} style={{ marginBottom: 16 }}>Real games, a little joy — <b>no winners, no scores, no leaderboards</b>. A fresh puzzle every day, something to beat right now, and the room's party rounds. Play for the fun of it.</Hand>

      {/* the ARCADE — real games (Daily Word · Trivia · Tic-tac-toe · Hangman), client-side */}
      <GamesArcade onShareToRoom={onNav ? () => onNav("lighter") : null} />

      {/* With the room — the async party rounds (existing engine, aggregate reveal) */}
      <div style={{ marginTop: 22 }}>
        <Eyebrow color={T.gold} mb={4}>Play with the room</Eyebrow>
        <Hand size={14.5} color={T.muted} style={{ marginBottom: 12 }}>Jess hosts a shared round; you answer in a word or line; she reveals the warm whole when it closes — never who said what.</Hand>
      </div>

      {/* the headline nightly round (day-rotated format) */}
      <GameRoundCard user={user} onCrisis={onCrisis} />

      {/* the named games — each its own real, separately-playable round */}
      {NAMED_GAMES.map((g) => (
        <GameRoundCard key={g.kind} kind={g.kind} name={g.name} blurb={g.blurb} user={user} onCrisis={onCrisis} />
      ))}

      {/* gentle social hook — carry the fun into a room, no pressure */}
      {onNav && (
        <button onClick={() => onNav("lighter")} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", textAlign: "left", background: `linear-gradient(160deg, ${T.paperHi} 0%, ${cwOf("gold").petal}12 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${cwOf("gold").petal}`, borderRadius: 13, padding: "12px 14px", cursor: "pointer", margin: "14px 0 8px" }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: `${cwOf("gold").petal}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><MessageCircle size={14} color={cwOf("gold").petal} /></span>
          <span style={{ flex: 1 }}><span style={{ display: "block", fontFamily: SERIF, fontSize: 15.5, fontWeight: 600, color: T.ink }}>Keep the fun going</span><span style={{ fontFamily: UI, fontSize: 11.5, color: T.muted }}>Chat about tonight's round in the Lighter Side</span></span>
          <ChevronRight size={15} color={T.muted} />
        </button>
      )}

      <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, lineHeight: 1.5, marginTop: 6 }}>
        Every answer is anonymous and one-per-round. Jess screens for anything unkind, and reveals only the shared mood — never who said what.
      </div>
    </div>
  );
}

function RoomView({ roomKey, posts, loading, error, user, onNav, onHome, onCrisis, onReload, onPostCreated, seed = "", initialCircle = null, profile = null, onOpenCorner, onOpenHub, enhanced = false, lifeStage = null }) {
  const [composing, setComposing] = useState(() => !!seed);
  const [voicing, setVoicing] = useState(false);
  const [myHash, setMyHash] = useState(null);
  const [muteOpen, setMuteOpen] = useState(false);
  const [muteDraft, setMuteDraft] = useState("");
  const [safetyTick, setSafetyTick] = useState(0);   // re-render after hide/mute (device-local)
  const room = ROOMS.find((r) => r.key === roomKey) || ROOMS[0];
  useEffect(() => { let a = true; communityHash(user?.id).then((h) => { if (a) setMyHash(h); }).catch(() => {}); return () => { a = false; }; }, [user?.id]);

  const rawFeed = posts.filter((p) => p.room === roomKey);
  // enhanced: apply the device-local safety filters (hide-a-voice + mute-a-word); never hide your own.
  const words = enhanced ? mutedWords() : [];   // read fresh each render (safetyTick forces it)
  const feed = enhanced
    ? rawFeed.filter((p) => !hasReported(p.id) && ((p.author_hash === myHash) || (!isAuthorHidden(p.author_hash) && !matchesMuted(p.body, words))))
    : rawFeed;
  const filteredN = rawFeed.length - feed.length;
  // enhanced: a per-room k-anon presence line + today's life-tinted prompt.
  const activeN = enhanced ? new Set(rawFeed.filter((p) => Date.now() - new Date(p.created_date || 0).getTime() <= PRESENCE_WINDOW_HRS * 3600e3).map((p) => p.author_hash)).size : 0;
  const prompt = enhanced ? roomPromptForDay(roomKey, lifeStage) : null;
  void safetyTick;
  return (
    <div>
      {/* sticky tab bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(244,239,227,0.97)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${T.paperDeep}`, padding: "9px 12px", display: "flex", alignItems: "center", gap: 6, overflowX: "auto" }}>
        <button onClick={onHome || (() => onNav("home"))} aria-label="All rooms" style={{ ...ghostBtn, flexShrink: 0, padding: "7px 11px" }}><Grid2x2 size={13} /> Doors</button>
        {onOpenHub && <JumpToButton onClick={onOpenHub} />}
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
        <Script size={32} color={OXBLOOD} style={{ marginBottom: 4 }}>{room.name}</Script>
        <Hand size={17} color={T.muted} style={{ marginBottom: enhanced ? 10 : 16 }}>{room.line}</Hand>

        {/* enhanced: per-room k-anon presence + a "mute a word" control (anonymous-layer safety) */}
        {enhanced && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted }}>
              <Users size={13} color={T.gold} /> {activeN <= 0 ? "Quiet in here — leave the first word" : activeN < 5 ? "A few women are around" : "Several women are here"}
            </span>
            {/* room options tucked into a quiet "…" (mute-a-word lives here — calm on the surface) */}
            <button onClick={() => setMuteOpen((o) => !o)} aria-label="Room options" title="Mute a word" style={{ marginLeft: "auto", background: "transparent", border: "none", cursor: "pointer", color: T.muted, display: "inline-flex", alignItems: "center", gap: 4, padding: 4 }}>
              {mutedWords().length > 0 && <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, color: T.gold }}>{mutedWords().length}</span>}
              <MoreHorizontal size={16} />
            </button>
          </div>
        )}
        {enhanced && muteOpen && (
          <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "12px 13px", marginBottom: 14 }}>
            <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, marginBottom: 8, lineHeight: 1.5 }}>Hide any post that mentions a word — just for you, on this device. Nothing leaves your phone.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={muteDraft} onChange={(e) => setMuteDraft(e.target.value)} placeholder="a word to mute…" style={{ ...inputStyle, minHeight: 0, padding: "9px 11px", fontSize: 14 }} />
              <button onClick={() => { addMutedWord(muteDraft); setMuteDraft(""); setSafetyTick((t) => t + 1); }} disabled={!muteDraft.trim()} style={{ ...primaryBtn, padding: "9px 14px", opacity: muteDraft.trim() ? 1 : 0.5 }}>Mute</button>
            </div>
            {mutedWords().length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                {mutedWords().map((w) => (
                  <button key={w} onClick={() => { removeMutedWord(w); setSafetyTick((t) => t + 1); }} style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 700, padding: "5px 11px", borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paper, color: T.inkSoft, cursor: "pointer" }}>{w} ×</button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* enhanced: today's warm, life-tinted room prompt — a reason to post (a line is plenty) */}
        {enhanced && prompt && (
          <div style={{ background: `linear-gradient(160deg, ${T.paperHi} 0%, ${T.gold}12 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${T.gold}`, borderRadius: 14, padding: "14px 15px", marginBottom: 16 }}>
            <Eyebrow color={T.gold} mb={6}>Today in {room.name.replace(/^The /, "")}</Eyebrow>
            <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontWeight: 600, fontSize: 19, color: T.ink, lineHeight: 1.3, marginBottom: composing ? 0 : 12 }}>{prompt}</div>
            {/* keep the question visible while composing so she sees what she's answering */}
            {!composing && <button onClick={() => setComposing(true)} style={{ ...primaryBtn, padding: "9px 15px" }}><Feather size={13} /> Answer this — a line is plenty</button>}
          </div>
        )}

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
            onPosted={(post) => { setComposing(false); (onPostCreated || onReload)(post); }} onCancel={() => setComposing(false)} />
        )}

        {loading && <Hand size={18} color={T.muted}>Opening the room…</Hand>}
        {!loading && error && (
          <Hand size={18} color={T.muted}>Couldn{"’"}t reach the rooms just now. Check your connection and try again.</Hand>
        )}
        {!loading && !error && feed.length === 0 && (
          <Hand size={18} color={T.inkSoft}>Quiet in here right now. Leave the first word — someone always comes by.</Hand>
        )}
        {!loading && !error && feed.map((p) => (
          <PostCard key={p.id} post={p} user={user} onCrisis={onCrisis} onChanged={onReload} enhanced={enhanced} myHash={myHash} />
        ))}
        {enhanced && filteredN > 0 && (
          <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, textAlign: "center", marginTop: 10 }}>{filteredN} {filteredN === 1 ? "post is" : "posts are"} hidden by your mutes.</div>
        )}
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
// ── Connection preferences + block (ported from CommunityEliteShell so the redesign
// keeps every live Connection surface — real ConnectionPref persistence, optimistic). ──
const nowISO = () => new Date().toISOString();
function ConnectPrefsSheet({ user, onClose }) {
  useScrollLock(true);
  const [prefs, setPrefs] = useState({ mode: "open", reach: "season", blocked_hashes: [] });
  const [prefRow, setPrefRow] = useState(null);
  useEffect(() => {
    let alive = true;
    if (!user?.id) return;
    base44.entities.ConnectionPref.filter({ user_id: user.id }, "-created_date", 1).catch(() => [])
      .then((rows) => { if (!alive) return; const r = rows?.[0]; if (r) { setPrefRow(r); setPrefs({ mode: r.mode || "open", reach: r.reach || "season", blocked_hashes: r.blocked_hashes || [] }); } });
    return () => { alive = false; };
  }, [user?.id]);
  const save = async (next) => {
    setPrefs(next);   // optimistic
    if (!user?.id) return;
    try {
      if (prefRow?.id) await withTimeout(base44.entities.ConnectionPref.update(prefRow.id, { ...next, updated_at: nowISO() }), 6000, "pref");
      else { const created = await withTimeout(base44.entities.ConnectionPref.create({ user_id: user.id, ...next, created_at: nowISO(), updated_at: nowISO() }), 6000, "pref"); setPrefRow(created); }
    } catch { /* optimistic stays */ }
  };
  const crimson = cwOf("crimson").petal, sage = cwOf("sage").petal;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(36,26,38,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-label="How you want to connect" style={{ width: "100%", maxWidth: 460, background: T.paper, borderRadius: "14px 14px 0 0", padding: "20px 18px 28px", paddingBottom: "var(--fw-sheet-safe)", maxHeight: "88vh", overflowY: "auto" }}>
        <Eyebrow color={T.gold} mb={8}>How you want to connect</Eyebrow>
        <Script size={26} style={{ marginBottom: 12 }}>On your terms</Script>
        <div style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: T.muted, marginBottom: 7 }}>I'm open to</div>
        {[["open", "Messages + letters"], ["letters", "Sealed letters only"], ["paused", "Paused for now"]].map(([v, l]) => (
          <button key={v} onClick={() => save({ ...prefs, mode: v })} style={{ textAlign: "left", width: "100%", background: prefs.mode === v ? `${crimson}14` : T.paperHi, border: `1px solid ${prefs.mode === v ? crimson : T.paperDeep}`, borderRadius: 11, padding: "11px 13px", cursor: "pointer", fontFamily: SERIF, fontSize: 15.5, fontWeight: 600, color: T.ink, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>{l}{prefs.mode === v && <Check size={15} color={crimson} />}</button>
        ))}
        <div style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: T.muted, margin: "10px 0 7px" }}>Who can reach me</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {[["season", "my season"], ["stage", "my life-stage"], ["any", "any woman 18+"]].map(([v, l]) => (
            <button key={v} onClick={() => save({ ...prefs, reach: v })} style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, padding: "7px 13px", borderRadius: 999, background: prefs.reach === v ? `${crimson}1F` : T.paperHi, border: `1px solid ${prefs.reach === v ? crimson : T.paperDeep}`, color: prefs.reach === v ? crimson : T.inkSoft, cursor: "pointer" }}>{l}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 16 }}><MapPinOff size={14} color={sage} style={{ flexShrink: 0, marginTop: 1 }} /><span style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5 }}>Never by location. Block or report anyone, anytime — from any post's "…" menu ({(prefs.blocked_hashes || []).length} blocked).</span></div>
        <button onClick={onClose} style={{ ...primaryBtn, width: "100%", justifyContent: "center" }}><Check size={14} /> Done</button>
      </div>
    </div>
  );
}

function ShareToSheet({ user, onClose }) {
  useScrollLock(true);   // lock the background page while the sheet is open
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
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Share to a space" style={{ width: "100%", maxWidth: 460, background: T.paper, borderRadius: "14px 14px 0 0", padding: "20px 18px 28px", maxHeight: "88vh", overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}>
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

// ═══════════════════════════════════════════════════════════════════════════
// REDESIGN HOME (§6.8.2 canonical page template) — the 4-shelf Community home.
// Talk · Circles · Together · Quietly, on the Nutrition-V2 skeleton (flora hero
// + tap-to-rebloom shelf switcher → summary card → glance⇆Jess sliding row →
// clipboard shelf-boards → handy row → closing). Demo-first (rendered by
// /CommunityRedesignDemo via CommunityInner homeVariant="redesign"); REUSES every
// existing feature view (rooms, circles, clubs, library, games, echo, rituals) —
// nothing stripped, all safety rails intact (18+ gate, crisis check, anon posting).
// ═══════════════════════════════════════════════════════════════════════════
const OXBLOOD = "#7A1A12";
const CSWIPE_H = 392;
const cPickAt = (arr, s) => arr[(((s % arr.length) + arr.length) % arr.length)];
const cFocusPill = (c) => ({ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "12px 10px", borderRadius: 999, background: c, color: "#fff", border: "none", fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: `0 2px 8px ${c}40` });

// The four shelves — the ONE map (hero controllers = clipboard boards = Jump sheet).
// `key` is the CommunityInner view (or a special: "share"/"witness"/"twin").
const SHELVES = [
  { id: "talk", Icon: MessagesSquare, label: "Talk", cw: "crimson", openness: 1, creature: "butterfly",
    title: "The rooms", line: "Drop into a room and say it plainly — silly to serious, no names.",
    sub: "Rooms you drop into", flower: "camellia", action: { label: "Ask the Lounge", key: "lounge" },
    close: "Say as much, or as little, as you like.",
    tiles: [
      { key: "lounge", Icon: MessageCircle, name: "The Lounge", note: "vent, spill it, be heard" },
      { key: "love", Icon: Heart, name: "Love", note: "dating, friends, marriage" },
      { key: "money", Icon: Briefcase, name: "Money & Work", note: "careers, pay, pensions" },
      { key: "style", Icon: Sparkles, name: "Style", note: "fashion as confidence" },
      { key: "health", Icon: Stethoscope, name: "Health", note: "NHS-grounded, one room" },
      { key: "lighter", Icon: Moon, name: "The Lighter Side", note: "telly, the stars, fun" },
    ] },
  { id: "circles", Icon: Users, label: "Circles", cw: "plum", openness: 0.72, creature: "bee",
    title: "Your circles", line: "Smaller rooms for who you are and what you love. Lurk freely; join what's yours.",
    sub: "Who you are", flower: "iris", action: { label: "Find your circle", key: "circles" },
    close: "Lurk as long as you like before you say hello.",
    tiles: [
      { key: "circles", Icon: Sprout, name: "Life stages", note: "TTC · pregnancy · peri · menopause" },
      { key: "circles", Icon: Heart, name: "Living with", note: "PCOS · endo · PMDD" },
      { key: "circles", Icon: BookOpen, name: "Shared loves", note: "books · career · creativity · movement" },
    ] },
  { id: "together", Icon: HeartHandshake, label: "Together", cw: "sage", openness: 0.88, creature: "dragonfly",
    title: "Together", line: "Do a thing side by side — go to an event, read a book, play a round, make something.",
    sub: "What you do together", flower: "sunflower", action: { label: "See what's on", key: "together" },
    close: "Nobody has to walk in alone.",
    tiles: [
      { key: "events", Icon: CalendarDays, name: "Events", note: "go together, near you + online" },
      { key: "library", Icon: BookOpen, name: "The Library", note: "book club + readers' corners" },
      { key: "games", Icon: Dices, name: "The Games Room", note: "Jess's nightly round + games" },
      { key: "clubs", Icon: HeartHandshake, name: "Clubs", note: "slow mornings · creativity corner" },
    ] },
  { id: "quietly", Icon: Feather, label: "Quietly", cw: "gold", openness: 0.5, creature: "ladybird",
    title: "Quietly", line: "Somewhere softer — anonymous, one-to-one, or just for you.",
    sub: "Private & one-to-one", flower: "chamomile", action: { label: "Leave an echo", key: "echo" },
    close: "Whatever you're carrying, you don't have to hold it out loud.",
    tiles: [
      { key: "echo", Icon: Waves, name: "Echo Wall", note: "anonymous lines, fade in 48h" },
      { key: "witness", Icon: Eye, name: "Witness", note: "one sister holds your entry (in Journal)" },
      { key: "sealed", Icon: Mail, name: "Sealed letter", note: "a slow letter, opened later" },
      { key: "share", Icon: Send, name: "Share a thought", note: "into a space that's yours" },
      { key: "twin", Icon: Users, name: "Phase Twin", note: "twelve days, paired (in Journal)" },
      { key: "connect", Icon: SlidersHorizontal, name: "How you connect", note: "who can reach you · block" },
    ] },
];

const CJESS_GREET = ["Hello, you.", "Here you are.", "Come in.", "Good to see you.", "Settle in."];
const CJESS_FUN = [
  "The kettle's on, metaphorically.",
  "No handles, no likes, no scoreboard — just women and honesty.",
  "Whatever you bring, someone here has been there.",
  "Lurking counts. You don't have to say a word.",
  "It's a room everyone's in — and no one has to perform.",
];
function communityJessSummary(seed, ctx) {
  const { firstName, quiet, question, season } = ctx;
  const signal = [];
  signal.push(quiet
    ? "It's gentle in here just now — a lovely time to leave the first word for whoever comes next."
    : "There are women around today — you're not the only one here.");
  if (question) signal.push(`Today's question is "${question}" — a line is plenty.`);
  if (season) signal.push(season);
  const g = cPickAt(CJESS_GREET, seed);
  const s = cPickAt(signal, seed + 1);
  const f = cPickAt(CJESS_FUN, seed + 2);
  const lead = firstName ? `${g} ${firstName} — ` : `${g} — `;
  return { eyebrow: "Jess · in the rooms today", body: `${lead}${s} ${f}` };
}

// glance ⇆ Jess sliding row (uniform panels, §6.8.2 band 2)
function CGlanceSwipe({ accent, glancePanel, jessPanel }) {
  const [idx, setIdx] = useState(0);
  const ref = useRef(null);
  const onScroll = () => { const el = ref.current; if (!el) return; setIdx(Math.round(el.scrollLeft / Math.max(1, el.clientWidth))); };
  const go = (i) => { const el = ref.current; if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" }); };
  return (
    <div>
      <div ref={ref} onScroll={onScroll} className="fw-cm-swipe" style={{ display: "flex", alignItems: "stretch", overflowX: "auto", scrollSnapType: "x mandatory", gap: 12, WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain" }}>
        <style>{`.fw-cm-swipe{scrollbar-width:none}.fw-cm-swipe::-webkit-scrollbar{display:none}`}</style>
        <div style={{ flex: "0 0 100%", scrollSnapAlign: "center", minWidth: 0 }}>{glancePanel}</div>
        <div style={{ flex: "0 0 100%", scrollSnapAlign: "center", minWidth: 0 }}>{jessPanel}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8 }}>
        {[0, 1].map((i) => <button key={i} onClick={() => go(i)} aria-label={i === 0 ? "Today in the community" : "Jess's read"} style={{ width: idx === i ? 16 : 6, height: 6, borderRadius: 999, background: idx === i ? accent : T.paperDeep, border: "none", cursor: "pointer", transition: "width .2s" }} />)}
        <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.muted, marginLeft: 4 }}>{idx === 0 ? "swipe for Jess's read →" : "← today in the community"}</span>
      </div>
    </div>
  );
}

// the Jess digest card with an upward-sliding inner sheet (§6.8.2 band 2 / §6.7.6)
function CJessCard({ eyebrow, digest, chips, sheetSections, accent, open, onOpen, onClose }) {
  return (
    <FwCard snap={false} minHeight={CSWIPE_H} accent={accent} Icon={HeartHandshake} eyebrow={eyebrow} flower="camellia" idx="cm-jess">
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <p style={{ fontFamily: SERIF, fontSize: 15.5, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>{digest}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>{chips.map((c) => (
          <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, background: `${cwOf(c.cw).petal}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><c.Icon size={13} color={cwOf(c.cw).petal} /></span>
            <span style={{ flex: 1, minWidth: 0, fontFamily: SERIF, fontSize: 13.5, color: T.ink, lineHeight: 1.3 }}><b style={{ color: cwOf(c.cw).petal, fontFamily: UI, fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em", marginRight: 6 }}>{c.label}</b>{c.text}</span>
          </div>
        ))}</div>
        <div style={{ marginTop: "auto", paddingTop: 12 }}>
          <button onClick={onOpen} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", boxSizing: "border-box", background: accent, color: "#fff", border: "none", borderRadius: 12, padding: "12px 16px", fontFamily: UI, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>Open Jess's full read <ChevronUp size={16} /></button>
        </div>
      </div>
      <div style={{ position: "absolute", top: -20, left: -20, right: -20, bottom: -20, background: T.paperHi, transform: open ? "translateY(0)" : "translateY(101%)", transition: "transform .34s cubic-bezier(.32,.72,.24,1)", zIndex: 6, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "15px 20px 10px", borderBottom: `1px solid ${T.paperDeep}` }}>
          <HeartHandshake size={15} color={accent} />
          <span style={{ flex: 1, fontFamily: SERIF, fontStyle: "italic", fontSize: 18, fontWeight: 600, color: OXBLOOD }}>Jess's full read</span>
          <button onClick={onClose} aria-label="Close" style={{ width: 30, height: 30, borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`, color: T.muted, cursor: "pointer", display: "grid", placeItems: "center" }}><ChevronDown size={17} /></button>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "13px 20px 18px", display: "flex", flexDirection: "column", gap: 15 }}>{sheetSections.map((s) => (
          <div key={s.title}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}><span style={{ width: 24, height: 24, borderRadius: 7, background: `${cwOf(s.cw).petal}1F`, display: "grid", placeItems: "center" }}><s.Icon size={12} color={cwOf(s.cw).petal} /></span><span style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", color: cwOf(s.cw).petal }}>{s.title}</span></div>
            <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, lineHeight: 1.5, margin: 0 }}>{s.body}</p>
            {s.action && <div style={{ marginTop: 8 }}>{s.action}</div>}
          </div>
        ))}</div>
      </div>
    </FwCard>
  );
}

// "Handy right now" one-line quick row (§6.8.2 band 4)
function CQuickRow({ items }) {
  return (
    <div className="fw-cm-quick" style={{ display: "flex", gap: 9, overflowX: "auto", padding: "2px 2px 8px", WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain" }}>
      <style>{`.fw-cm-quick{scrollbar-width:none}.fw-cm-quick::-webkit-scrollbar{display:none}`}</style>
      {items.map((it) => { const c = cwOf(it.cw).petal; return (
        <button key={it.label} onClick={it.onClick} style={{ flex: "0 0 auto", display: "inline-flex", alignItems: "center", gap: 9, background: `linear-gradient(160deg, ${T.paperHi} 0%, ${c}12 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${c}`, borderRadius: 13, padding: "10px 13px", cursor: "pointer", whiteSpace: "nowrap" }}>
          <span style={{ width: 26, height: 26, borderRadius: 8, background: `${c}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><it.Icon size={13} color={c} /></span>
          <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.ink }}>{it.label}</span>
          <ChevronRight size={15} color={T.muted} />
        </button>
      ); })}
      <span style={{ flex: "0 0 2px" }} aria-hidden />
    </div>
  );
}

// one shelf board (a tile grid inside a Clipboard, §6.10) — no dead space, real jumps
function ShelfBoard({ shelf, onEnter }) {
  const acc = cwOf(shelf.cw).petal;
  return (
    <Clipboard title={shelf.title} sub={shelf.sub} accent={acc} flower={shelf.flower} idx={`cm-${shelf.id}`} titleColor={OXBLOOD}>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 14px" }}>{shelf.line}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
        {shelf.tiles.map((t, i) => (
          <button key={t.name + i} onClick={() => onEnter(t.key)} style={{ textAlign: "left", background: `linear-gradient(160deg, ${T.paperHi} 0%, ${acc}10 100%)`, border: `1px solid ${T.paperDeep}`, borderRadius: 13, padding: "12px 12px", cursor: "pointer" }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, background: `${acc}1F`, display: "grid", placeItems: "center", marginBottom: 8 }}><t.Icon size={16} color={acc} /></span>
            <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 15.5, color: T.ink, lineHeight: 1.15, marginBottom: 2 }}>{t.name}</div>
            <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, lineHeight: 1.35 }}>{t.note}</div>
          </button>
        ))}
      </div>
      <div style={{ marginTop: "auto", paddingTop: 14 }}>
        <span style={{ fontFamily: HANDFAM, fontStyle: "italic", fontSize: 15, color: T.muted, lineHeight: 1.4 }}>{shelf.close}</span>
      </div>
    </Clipboard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TOGETHER HUB (feature #2, holistic) — "everything you DO together", not just events.
// Ties the REAL existing surfaces (Events · Library/book club · Games) + real shared
// aggregate rituals (the collective pool · close-the-week) + new shared-MOMENT formats
// (watch-along · read-along · challenge · wind-down) with a warm "I'm in" + join-the-chat.
// Reuses PoolCard/CloseWeekCard/EventsTogether; routes to real views via onEnter.
// ═══════════════════════════════════════════════════════════════════════════
const TOG_IN_KEY = "fw_tog_in";
const togIn = (id) => { try { return JSON.parse(localStorage.getItem(TOG_IN_KEY) || "[]").includes(id); } catch { return false; } };
const toggleTogIn = (id) => { let a; try { a = JSON.parse(localStorage.getItem(TOG_IN_KEY) || "[]"); } catch { a = []; } const i = a.indexOf(id); if (i >= 0) a.splice(i, 1); else a.push(id); try { localStorage.setItem(TOG_IN_KEY, JSON.stringify(a)); } catch { /* ignore */ } return a.includes(id); };

// A rotating "this week, together" shared moment (async-friendly: shared focus + a chat
// thread, so it works even without everyone online at once). Deterministic per week.
const TOGETHER_MOMENTS = [
  { id: "watch", Icon: Sparkles, cw: "plum", tag: "Watch-along", title: "We're watching something cosy", blurb: "Pick tonight's comfort watch, then spill your reactions in the Lighter Side — no spoilers for the stragglers.", room: "lighter", cta: "Join the watch chat" },
  { id: "read", Icon: BookOpen, cw: "sage", tag: "Read-along", title: "A book, at our own pace", blurb: "We're reading together, spoiler-safe checkpoints, no one's behind. Open the book club when you reach one.", room: "library", cta: "Open the book club" },
  { id: "challenge", Icon: HeartHandshake, cw: "gold", tag: "This week's challenge", title: "Small kindnesses, added up", blurb: "One gentle thing for yourself this week — and watch the room's add up. No names, no scores, just us.", room: "rituals", cta: "See the challenge" },
];
function togetherMomentForWeek() {
  const day = new Date().toISOString().split("T")[0];
  const epoch = Math.floor(new Date(day + "T00:00:00Z").getTime() / 86400000);
  const wk = Math.floor(epoch / 7);
  return TOGETHER_MOMENTS[((wk % TOGETHER_MOMENTS.length) + TOGETHER_MOMENTS.length) % TOGETHER_MOMENTS.length];
}

function TogetherHub({ user, onEnter, onCrisis, onBack }) {
  const moment = useMemo(() => togetherMomentForWeek(), []);
  const [inIt, setInIt] = useState(() => togIn(moment.id));
  const mCol = cwOf(moment.cw).petal;
  // the ways to be together — each a REAL surface (deep-links) or a real ritual
  const PILLARS = [
    { key: "events", Icon: CalendarDays, cw: "crimson", name: "Go to something", note: "events & meetups, near you + online" },
    { key: "library", Icon: BookOpen, cw: "sage", name: "Read together", note: "the book club + readers' corners" },
    { key: "games", Icon: Dices, cw: "gold", name: "Play together", note: "Jess's nightly round + games" },
    { key: "rituals", Icon: HeartHandshake, cw: "plum", name: "Shared rituals", note: "this week's kindness + close the week" },
  ];
  return (
    <div style={{ padding: "26px 18px 60px", maxWidth: 460, margin: "0 auto" }}>
      {onBack && <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "7px 11px", fontFamily: UI, fontSize: 12.5, fontWeight: 600, color: T.ink, cursor: "pointer", marginBottom: 14 }}><ChevronLeft size={14} /> Community</button>}
      <Eyebrow color={T.gold} mb={6}>Together</Eyebrow>
      <Script size={38} color={OXBLOOD} style={{ marginBottom: 4 }}>Things we do together</Script>
      <Hand size={17} color={T.muted} style={{ marginBottom: 18 }}>Not another feed to scroll — real ways to do something alongside other women. Go out, read, play, take something on. Dip in for five minutes or the whole evening.</Hand>

      {/* THIS WEEK, TOGETHER — the rotating shared moment (async-friendly) */}
      <div style={{ position: "relative", overflow: "hidden", background: `linear-gradient(160deg, ${T.paperHi} 0%, ${mCol}14 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${mCol}`, borderRadius: 18, padding: "17px 17px", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, background: `${mCol}1F`, display: "grid", placeItems: "center" }}><moment.Icon size={16} color={mCol} /></span>
          <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: mCol }}>{moment.tag}</span>
        </div>
        <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontWeight: 700, fontSize: 20, color: T.ink, marginBottom: 6 }}>{moment.title}</div>
        <Hand size={15.5} color={T.inkSoft} style={{ marginBottom: 12 }}>{moment.blurb}</Hand>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => { const now = toggleTogIn(moment.id); setInIt(now); }} style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, padding: "10px 15px", border: inIt ? `1px solid ${mCol}` : "none", background: inIt ? `${mCol}1C` : T.ink, color: inIt ? mCol : T.paperHi, fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            {inIt ? <><Check size={14} /> You're in</> : <><HeartHandshake size={14} /> I'm in</>}
          </button>
          <button onClick={() => onEnter(moment.room)} style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, padding: "10px 15px", border: `1px solid ${T.paperDeep}`, background: T.paperHi, color: T.ink, fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            <MessageCircle size={14} /> {moment.cta}
          </button>
        </div>
        {inIt && <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 10 }}>Lovely — you'll find the others in the chat. No pressure to keep up.</div>}
      </div>

      {/* WAYS TO BE TOGETHER — the pillars, each a real surface */}
      <Eyebrow color={T.gold} mb={10}>Ways to be together</Eyebrow>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {PILLARS.map((p) => { const c = cwOf(p.cw).petal; return (
          <button key={p.key} onClick={() => onEnter(p.key)} style={{ textAlign: "left", background: `linear-gradient(160deg, ${T.paperHi} 0%, ${c}10 100%)`, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "14px 13px", cursor: "pointer" }}>
            <span style={{ width: 32, height: 32, borderRadius: 9, background: `${c}1F`, display: "grid", placeItems: "center", marginBottom: 9 }}><p.Icon size={17} color={c} /></span>
            <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 16, color: T.ink, lineHeight: 1.15, marginBottom: 2 }}>{p.name}</div>
            <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, lineHeight: 1.35 }}>{p.note}</div>
          </button>
        ); })}
      </div>

      {/* THE REAL SHARED-AGGREGATE — the collective pool ("together this week") rendered inline */}
      <Eyebrow color={T.gold} mb={8}>Together, right now</Eyebrow>
      <PoolCard user={user} />
      <CloseWeekCard user={user} onCrisis={onCrisis} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 24, gap: 8 }}>
        <Pollinator kind="dragonfly" size={30} color={cwOf("sage").petal} color2={cwOf("gold").petal} animate idx="tog-close" />
        <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontSize: 16, color: T.muted, textAlign: "center", maxWidth: 290, lineHeight: 1.5 }}>Come as you are, stay as long as you like.</div>
      </div>
    </div>
  );
}

function RedesignHome({ presence, lifeStage, profile, user, onEnter, onCrisis, onOpenHub }) {
  const [shelfIdx, setShelfIdx] = useState(0);
  const [jessOpen, setJessOpen] = useState(false);
  const seed = useMemo(() => Math.floor(Math.random() * 100000), []);
  const qotd = useMemo(() => qotdForDay(), []);
  const season = lifeStage ? SEASONS[lifeStage] : null;
  const slot = todaySlot();
  const active = SHELVES[shelfIdx] || SHELVES[0];
  const aCol = cwOf(active.cw).petal;
  const gold = cwOf("gold").petal;
  const quiet = /quiet/i.test(presence || "");
  const rawFirst = (user?.full_name || "").split(" ")[0] || "";
  const firstName = (/\d/.test(rawFirst) || rawFirst.length > 16) ? "" : (rawFirst ? rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1) : "");
  const jess = communityJessSummary(seed, { firstName, quiet, question: qotd.text, season: season?.line });
  const ritual = slot === "wisdom" ? { label: "Living wisdom", text: "A line worth keeping, from the women before you.", go: () => onEnter("wisdom") }
    : slot === "pool" ? { label: "Together this week", text: "Small kindnesses, adding up — add one.", go: () => onEnter("rituals") }
    : slot === "close" ? { label: "Close the week", text: "One line to let this week go, together.", go: () => onEnter("rituals") }
    : { label: "Tonight's game", text: "Jess's round — no winners, just company.", go: () => onEnter("games") };

  return (
    <div>
      {/* top chrome (§6.8.1 canonical division): Jump-to pill on the LEFT — the persistent
          calendar icon lives top-RIGHT (universal-calendar standard), so they never collide. */}
      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 6 }}>
        {onOpenHub && <JumpToButton onClick={onOpenHub} />}
        <Eyebrow>{MASTHEAD.eyebrow}</Eyebrow>
      </div>

      {/* 1 · FLORA HERO + shelf CONTROLLER cards (tap-to-rebloom = the shelf switcher) */}
      <FwFloraHero title={active.title} colorway={active.cw} bloom={active.flower} openness={active.openness} creature={active.creature} flankL="chamomile" flankR="cosmos" titleColor={OXBLOOD} line={active.line} />
      <div className="fw-cm-ctl" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "12px 2px 2px", justifyContent: "center" }}>
        <style>{`.fw-cm-ctl{scrollbar-width:none}.fw-cm-ctl::-webkit-scrollbar{display:none}`}</style>
        {SHELVES.map((c, i) => { const on = i === shelfIdx; const col = cwOf(c.cw).petal; return (
          <button key={c.id} onClick={() => setShelfIdx(i)} aria-pressed={on} style={{ flex: "0 0 76px", height: 64, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, borderRadius: 14, cursor: "pointer", background: on ? `linear-gradient(160deg, ${T.paperHi} 0%, ${col}20 100%)` : T.paperHi, border: `1px solid ${on ? col : T.paperDeep}`, boxShadow: on ? `0 0 0 1px ${col}, 0 2px 8px ${col}30` : "0 1px 3px rgba(58,44,26,0.08)", transform: on ? "translateY(-1px)" : "none", transition: "border-color .15s, box-shadow .15s, transform .15s" }}>
            <span style={{ width: 27, height: 27, borderRadius: 8, background: `${col}1F`, display: "grid", placeItems: "center" }}><c.Icon size={15} color={col} /></span>
            <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, color: on ? col : T.muted }}>{c.label}</span>
          </button>
        ); })}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "11px 0 10px" }}>
        <span style={{ width: 9, height: 9, borderRadius: 99, background: aCol }} />
        <span style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.inkSoft }}>{season ? season.label : "Anonymous · 18+ · kind by design"}</span>
      </div>
      <button onClick={() => onEnter(active.action.key)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", boxSizing: "border-box", background: aCol, color: "#fff", border: "none", borderRadius: 14, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "background .35s ease" }}>
        <active.Icon size={16} /> {active.action.label}
      </button>

      {/* 2 · SUMMARY CARD — "alive here today" */}
      <div style={{ marginTop: 18 }}>
        <SummaryCard eyebrow="Alive here today" accent={gold} rows={[
          { Icon: HelpCircle, label: "Today's question", text: qotd.text, onClick: () => onEnter("qotd") },
          { Icon: Users, label: "Who's around", text: presence, onClick: onOpenHub },
          { Icon: ritual.label === "Tonight's game" ? Dices : Sparkles, label: ritual.label, text: ritual.text, onClick: ritual.go },
        ]} />
      </div>

      {/* 3 · TOP SLIDING ROW — glance ⇆ Jess digest */}
      <div style={{ marginTop: 18 }}>
        <CGlanceSwipe accent={gold}
          glancePanel={
            <FwCard snap={false} minHeight={CSWIPE_H} accent={gold} Icon={MessagesSquare} eyebrow="Today in the community" flower="marigold" idx="cm-glance"
              action={<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%" }}>
                <button onClick={() => onEnter("qotd")} style={cFocusPill(cwOf("plum").petal)}><HelpCircle size={15} /> Answer today</button>
                <button onClick={() => onEnter("lounge")} style={cFocusPill(T.crimson)}><MessageCircle size={15} /> Ask the room</button>
                <button onClick={() => onEnter("echo")} style={cFocusPill(cwOf("sky").petal || cwOf("sage").petal)}><Waves size={15} /> Leave an echo</button>
                <button onClick={() => onEnter("games")} style={cFocusPill(cwOf("sage").petal)}><Dices size={15} /> Tonight's game</button>
              </div>}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { Icon: HelpCircle, cw: "plum", label: "The question", text: qotd.text, on: () => onEnter("qotd") },
                  { Icon: Users, cw: "gold", label: "Around today", text: quiet ? "Gentle in here — leave the first word." : "Women are here — you're not alone.", on: onOpenHub },
                  { Icon: ritual.label === "Tonight's game" ? Dices : Sparkles, cw: "sage", label: ritual.label, text: ritual.text, on: ritual.go },
                ].map((r) => (
                  <button key={r.label} onClick={r.on} style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "9px 11px", cursor: "pointer" }}>
                    <span style={{ width: 28, height: 28, borderRadius: 8, background: `${cwOf(r.cw).petal}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><r.Icon size={14} color={cwOf(r.cw).petal} /></span>
                    <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontFamily: UI, fontSize: 11, fontWeight: 700, color: cwOf(r.cw).petal }}>{r.label}</span><span style={{ fontFamily: SERIF, fontSize: 14, color: T.ink, lineHeight: 1.3 }}>{r.text}</span></span>
                  </button>
                ))}
              </div>
            </FwCard>
          }
          jessPanel={
            <CJessCard accent={cwOf("sage").petal} eyebrow={jess.eyebrow} digest={jess.body}
              open={jessOpen} onOpen={() => setJessOpen(true)} onClose={() => setJessOpen(false)}
              chips={[
                { Icon: MessagesSquare, cw: "crimson", label: "Rooms", text: "Six warm rooms, all anonymous" },
                { Icon: HelpCircle, cw: "plum", label: "Today", text: qotd.text },
                { Icon: Users, cw: "gold", label: "You're among", text: season ? season.label : "women who get it" },
                { Icon: ShieldAlert, cw: "sage", label: "Kind + safe", text: "Every line screened; heavy stuff routes to real help" },
              ]}
              sheetSections={[
                { Icon: MessagesSquare, cw: "crimson", title: "What the room's for", body: <>This is the whole of your life, not just your cycle — the love and the laugh, the money question, the late-night vent. Health is one room here, never the house. No handles, no DMs, no likes, no leaderboards.</> },
                { Icon: HeartHandshake, cw: "sage", title: "You're looked after here", body: <>You're anonymous — no name, ever. Kindness is kept quietly in the background so you don't have to think about it: react, reply, or just lurk. And if you're ever really struggling, help is a tap away.</> },
                { Icon: Sparkles, cw: "gold", title: "Today, together", body: ritual.text, action: <button onClick={ritual.go} style={{ ...ghostBtn }}><ChevronRight size={13} /> {ritual.label}</button> },
              ]}
            />
          }
        />
      </div>

      {/* 4 · THE SHELVES — clipboard slider of the 4 boards (the deep content) */}
      <div style={{ marginTop: 22 }}>
        <ClipboardSlider hint="Slide the shelves →" accent={aCol}>
          {SHELVES.map((s) => <ShelfBoard key={s.id} shelf={s} onEnter={onEnter} />)}
        </ClipboardSlider>
      </div>

      {/* 5 · HANDY RIGHT NOW — one-line quick row */}
      <div style={{ marginTop: 22 }}>
        <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontSize: 20, color: OXBLOOD, marginBottom: 8 }}>Handy right now</div>
        <CQuickRow items={[
          { Icon: HelpCircle, cw: "plum", label: "Question of the day", onClick: () => onEnter("qotd") },
          { Icon: Sparkles, cw: "gold", label: "Living wisdom", onClick: () => onEnter("wisdom") },
          { Icon: HeartHandshake, cw: "sage", label: "Together this week", onClick: () => onEnter("rituals") },
          { Icon: Moon, cw: "plum", label: "Close the week", onClick: () => onEnter("rituals") },
          { Icon: Dices, cw: "crimson", label: "Tonight's game", onClick: () => onEnter("games") },
          { Icon: MessageCircle, cw: "sage", label: "Talk to Jess", onClick: () => window.dispatchEvent(new CustomEvent("fw_open_assistant", { detail: { from: "community" } })) },
          { Icon: Send, cw: "gold", label: "Invite a friend", onClick: () => onEnter("share") },
        ]} />
      </div>

      {/* Tier-0 anonymous resonance — the "someone like you" read-only belonging beat */}
      <div style={{ marginTop: 20 }}><ResonanceLive wide /></div>

      {/* 6 · closing signature — and the ONE quiet support corner (safety lives here, not
          repeated on every post; calm on the surface, protection in the background). */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 30, gap: 10 }}>
        <Pollinator kind="butterfly" size={34} color="#8E6E8E" color2={gold} animate idx="cm-close" />
        <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontSize: 17, color: T.muted, textAlign: "center", maxWidth: 300, lineHeight: 1.5 }}>{FOOTER_LINE}</div>
        <button onClick={() => onCrisis && onCrisis()} style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted, textDecoration: "underline", textUnderlineOffset: 3, marginTop: 2 }}>Anonymous &amp; 18+ · Feeling low? Find support</button>
      </div>
    </div>
  );
}

export function CommunityInner({ initialView = null, embedded = false, homeVariant = "classic" } = {}) {
  useEditorialFonts();
  const [user, setUser] = useState(null);
  const [view, setView] = useState(initialView || "home");      // "home" | room key
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState(false);
  const [crisis, setCrisis] = useState(false);
  const [shareTo, setShareTo] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);   // sealed-letter pen-pal (ported from elite)
  const [connectOpen, setConnectOpen] = useState(false); // connection prefs + block (ported from elite)
  const [hubOpen, setHubOpen] = useState(false);
  const navigate = useNavigate();
  const onHubSelect = (id) => {
    if (id === "witness") { navigate(createPageUrl("Journal?open=witness")); return; }
    if (id === "twin") { navigate(createPageUrl("Journal?open=twin")); return; }
    setView(id === "qotd" ? "home" : id);
    try { window.scrollTo({ top: 0, behavior: "instant" }); } catch { /* ignore */ }
  };
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
      // /Community?view=bookclub → straight into the Book Club discussion (the club pick's
      // own thread). Used by the reader's "Discuss this book in the Book Club" link.
      if (sp.get("view") === "bookclub") setView("bookclub");
    } catch { /* ignore */ }
  }, []);

  // ── BACK-BUTTON FIX ──────────────────────────────────────────────────────────
  // Community sub-views are internal `view` STATE, not routes — so the browser/global
  // back button used to pop the ROUTE stack and leave Community entirely (jumping to
  // whatever came before, e.g. Profile). Fix: while in a sub-view, push ONE same-URL
  // history "trap" entry so back is caught here and returns to the Community HOME instead
  // of leaving. (Same-URL pushState → React Router does not navigate.) Reversible: remove
  // these two effects + goBack, and point the sub-view onBack props back at setView("home").
  const trapped = useRef(false);
  useEffect(() => {
    if (view === "home") { trapped.current = false; return; }
    if (!trapped.current) { try { window.history.pushState({ __fwCommunity: 1 }, ""); } catch { /* ignore */ } trapped.current = true; }
  }, [view]);
  useEffect(() => {
    const onPop = () => { if (trapped.current) { trapped.current = false; setView("home"); } /* else: at home → let the browser leave */ };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  // in-app back buttons route through this so the trap entry is consumed cleanly.
  const goBack = useCallback(() => {
    if (trapped.current) { try { window.history.back(); return; } catch { /* fall through */ } }
    setView("home");
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

  // Optimistic post insert — prepend the just-created post to the feed IMMEDIATELY so the UI
  // reflects success in <1s, never gated behind the slow (unindexed) -created_date refetch.
  // A background load() (NOT awaited, no tick remount) reconciles shortly after.
  const onPostCreated = useCallback((post) => {
    if (post?.id) setPosts((prev) => [post, ...prev.filter((x) => x.id !== post.id)]);
    load();
  }, [load]);

  // Redesign-home shelf navigation — reuses the existing routing/actions (nothing new,
  // nothing stripped). Special destinations (share/witness/twin) match the classic paths.
  const enterShelf = useCallback((dest) => {
    if (dest === "share") { setShareTo(true); return; }
    if (dest === "sealed") { setLetterOpen(true); return; }        // sealed-letter pen-pal (ported)
    if (dest === "connect") { setConnectOpen(true); return; }      // connection prefs + block (ported)
    if (dest === "witness") { navigate(createPageUrl("Journal?open=witness")); return; }
    if (dest === "twin") { navigate(createPageUrl("Journal?open=twin")); return; }
    setView(dest);
    try { window.scrollTo({ top: 0, behavior: "instant" }); } catch { /* ignore */ }
  }, [navigate]);

  return (
    // embedded (rendered inside a HubSheet): no own page background or 100vh — inherit
    // the sheet's single flat surface so there are no nested/mismatched background edges.
    <div style={embedded ? { minHeight: 0, background: "transparent" } : { minHeight: "100vh", ...PAPER_BG }}>
      <InkFilter />
      <div style={{ maxWidth: 460, margin: "0 auto", padding: view === "home" ? "30px 18px 50px" : "0 0 50px" }}>
        {view === "home"
          ? (homeVariant === "redesign"
              ? <RedesignHome presence={presence} lifeStage={lifeStage} profile={profile} user={user} onEnter={enterShelf} onCrisis={() => setCrisis(true)} onOpenHub={() => setHubOpen(true)} />
              : <Home presence={presence} lifeStage={lifeStage} onEnter={setView} user={user} onCrisis={() => setCrisis(true)} onShareTo={() => setShareTo(true)} onOpenHub={() => setHubOpen(true)} />)
          : view === "qotd"
          ? <div style={{ padding: "26px 18px 50px" }}>
              <button onClick={goBack} style={{ ...ghostBtn, marginBottom: 14, padding: "7px 11px" }}><ChevronLeft size={14} /> Community</button>
              <QotdCard user={user} onCrisis={() => setCrisis(true)} />
            </div>
          : view === "rituals"
          ? <div style={{ padding: "26px 18px 50px" }}>
              <button onClick={goBack} style={{ ...ghostBtn, marginBottom: 14, padding: "7px 11px" }}><ChevronLeft size={14} /> Community</button>
              <Eyebrow color={T.gold} mb={8}>Today, together</Eyebrow>
              <Script size={32} color={OXBLOOD} style={{ marginBottom: 12 }}>The daily rituals</Script>
              <CloseWeekCard user={user} onCrisis={() => setCrisis(true)} />
              <PoolCard user={user} />
              <WisdomCard onOpen={() => setView("wisdom")} />
            </div>
          : view === "together"
          ? <TogetherHub user={user} onEnter={enterShelf} onCrisis={() => setCrisis(true)} onBack={goBack} />
          : view === "events"
          ? <EventsTogether user={user} onBack={goBack} />
          : view === "library"
          ? <LibraryTogether user={user} onBack={goBack} onNav={setView}
              onOpenCorner={(key, title) => { setInitialClub(key); setClubTitle(title || ""); setView("clubs"); }} />
          : view === "circles"
          ? <div style={{ padding: "26px 18px 50px" }}><CirclesView user={user} onCrisis={() => setCrisis(true)} initialActive={initialCircle} profile={profile} onHome={goBack} /></div>
          : view === "games"
          ? <div style={{ padding: "26px 18px 50px" }}><GamesView user={user} onCrisis={() => setCrisis(true)} onHome={goBack} onNav={setView} /></div>
          : view === "wisdom"
          ? <WisdomLibrary onBack={goBack} />
          : view === "bookclub"
          ? <BookClubView user={user} onCrisis={() => setCrisis(true)} onBack={() => setView("library")} />
          : view === "clubs"
          ? <div style={{ padding: "30px 18px 50px" }}><ClubsView user={user} onCrisis={() => setCrisis(true)} onBack={goBack} initialActive={initialClub} clubTitle={clubTitle} /></div>
          : view === "echo"
          ? <div style={{ padding: "26px 18px 50px" }}>
              <button onClick={goBack} style={{ ...ghostBtn, marginBottom: 14, padding: "7px 11px" }}><ChevronLeft size={14} /> Community</button>
              <EchoWall user={user} profile={profile} lifeStage={lifeStage} />
            </div>
          : <RoomView key={tick} roomKey={view} posts={posts} loading={loading} error={loadErr} user={user} onNav={setView} onHome={goBack} onCrisis={() => setCrisis(true)} onReload={reload} onPostCreated={onPostCreated} seed={roomSeed} initialCircle={initialCircle} profile={profile}
              onOpenHub={() => setHubOpen(true)} enhanced={homeVariant === "redesign"} lifeStage={lifeStage}
              onOpenCorner={(key, title) => { setInitialClub(key); setClubTitle(title || ""); setView("clubs"); }} />}
        {view === "home" && homeVariant === "classic" && (
          <>
            <Rule mt={30} mb={14} />
            <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, lineHeight: 1.5 }}>{FOOTER_LINE}</div>
            <EditorialFooter />
          </>
        )}
      </div>
      {crisis && <CrisisSheet onClose={() => setCrisis(false)} />}
      {shareTo && <ShareToSheet user={user} onClose={() => setShareTo(false)} />}
      {letterOpen && <SealedLetterComposeSheet open onClose={() => setLetterOpen(false)} onSealed={() => setLetterOpen(false)} />}
      {connectOpen && <ConnectPrefsSheet user={user} onClose={() => setConnectOpen(false)} />}
      <CommunityHubSheet open={hubOpen} onClose={() => setHubOpen(false)} onSelect={onHubSelect} />
    </div>
  );
}

export default function Community() {
  const navigate = useNavigate();
  // LIVE PROMOTION (2026-07-08): /Community renders the 4-shelf REDESIGN home on the
  // canonical §6.8.2 page template + the finished Talk rooms (enhanced) + the calm
  // "safe on the surface" model + inclusive wording + light 18+ gate. It is a strict
  // SUPERSET of the classic home — every surface (rooms · circles · clubs · library ·
  // games · echo · QotD · resonance · wisdom/pool/close rituals · witness/twin/share ·
  // Jess) is reachable via the shelf boards / hero / summary / handy row / Jump hub.
  // ONE-LINE REVERT: change homeVariant="redesign" back to homeVariant="classic" (or
  // drop the prop) — the classic Home component is kept verbatim below as the fallback.
  return (
    <AgeGate surfaceName="the Community" onDecline={() => navigate("/Today")}>
      <CommunityInner homeVariant="redesign" />
    </AgeGate>
  );
}
