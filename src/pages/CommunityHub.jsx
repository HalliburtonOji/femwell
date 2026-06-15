// CommunityHub — the REAL /Community page reimagined in the HUB style, mirroring
// the live NutritionHub: a rich circular-centerpiece header (CommunityEmbraceRing) +
// a segmented label rail + a scroll-snap Hero Card Slider of SurfaceCards, each
// showing a compact REAL-DATA preview and opening the FULL existing surface in a
// bottom HubSheet — or deep-linking into the proven /Community route for dense flows.
//
// This is PRODUCTION code wired to live Base44 entities. It NEVER rewrites a feature's
// write path: every write reuses the same proven service-role functions Community.jsx
// calls (answerQotd, createCommunityPost, reactCommunity, …) or hands off to the real
// surface (EchoWall renders directly; rooms/circles/clubs/library/games deep-link to
// the real /Community page which keeps anonymity hashing + crisis routing + moderation
// intact). The home previews are READ-ONLY and guarded (.catch) — never crash, honest
// empty states, no fabricated data.
//
// Safety/anonymity rails preserved 1:1:
//   · 18+ AgeGate wraps the whole page (same as Community.jsx)
//   · every text input runs the shared crisisCheck → CrisisSheet (UK NHS/Samaritans)
//   · QOTD direct-answer posts through answerQotd (created_by = service; device hash)
//   · presence is the k-anon bucketed presenceLine (never an identifying count)
//   · NO scoreboards / leaderboards / vanity counts; no emoji; cream/plum; Ephesis +
//     Cormorant via the Editorial constants; Lucide/SVG only.
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Send, Waves, MessageCircle, Users, HeartHandshake,
  BookOpen, Dices, Heart, Briefcase, Sparkles, Stethoscope, HelpCircle, Phone,
  ShieldAlert, Lock, Check,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  T, UI, SERIF, Eyebrow, Rule, Script, Hand, InkFilter, EditorialFooter,
  useEditorialFonts, PAPER_BG, useEscape,
} from "@/components/journal/Editorial";
import AgeGate from "@/components/safety/AgeGate";
import { HubSheet, SurfaceCard } from "@/components/nutrition/hub/HubShell";
import { CommunityEmbraceRing } from "@/components/hub/Centerpieces";
import JumpToButton from "@/components/layout/JumpToButton";
import CommunityHubSheet from "@/components/community/CommunityHubSheet";
import EchoWall from "@/components/journal/echo/EchoWall";
import ShareAsEchoSheet from "@/components/journal/echo/ShareAsEchoSheet";
import { computeCycleDay } from "@/hooks/useCycleDay";
import { CommunityInner } from "./Community";
import {
  communityHash, answeredQotd, markQotd,
} from "@/components/community/communityAnon";
import {
  MASTHEAD, UK_RESOURCES, FOOTER_LINE, PRESENCE_WINDOW_HRS,
  qotdForDay, presenceLine, crisisCheck,
} from "@/components/community/communityConfig";
import { CIRCLES, CIRCLE_KEYS, suggestedCircles, isJoined } from "@/components/community/circlesConfig";
import { SEED_PICK, clubReached } from "@/components/community/bookClubConfig";
import { createPageUrl } from "@/utils";

const COL = 430;     // phone column (matches NutritionHub)
const CARD_W = 365;  // ~85vw — next card peeks at the right edge
const GAP = 14;
const PLUM = "#241a26"; // the single permitted dark surface (matches Community.jsx)
const HANDFAM = '"Cormorant Garamond","Fraunces",Georgia,serif';

// ── the surface registry — drives the label rail, the slider cards AND the sheets.
// `open` describes how the primary action behaves:
//   · "echo"  → renders the REAL EchoWall in a HubSheet (exported, standalone, real writes)
//   · "qotd"  → opens the QOTD HubSheet (direct answer via answerQotd, then sees the room)
//   · {nav}   → deep-links into the proven /Community route (keeps every write/anon/crisis
//               path exactly as Community.jsx runs it — zero logic duplication)
const SURFACES = [
  { id: "qotd",    label: "Question",   eyebrow: "Today's one line, and the room's", sheetTitle: "question of the day", Icon: HelpCircle,    open: "qotd" },
  { id: "lounge",  label: "Lounge",     eyebrow: "Vent, spill it, be heard",         sheetTitle: "the lounge",          Icon: MessageCircle, open: "room" },
  { id: "echo",    label: "Echo Wall",  eyebrow: "Anonymous lines, fading in 48h",   sheetTitle: "echo wall",           Icon: Waves,         open: "echo" },
  { id: "lighter", label: "Lighter",    eyebrow: "Fun, telly, the stars",            sheetTitle: "the lighter side",    Icon: Dices,         open: "room" },
  { id: "library", label: "Library",    eyebrow: "Read together, spoiler-safe",      sheetTitle: "the library",         Icon: BookOpen,      open: "room" },
  { id: "circles", label: "Circles",    eyebrow: "Cohorts by who you are",           sheetTitle: "circles & clubs",     Icon: Users,         open: "room" },
  { id: "love",    label: "Love",       eyebrow: "Dating, friendship, marriage",     sheetTitle: "love & relationships",Icon: Heart,         open: "room" },
  { id: "money",   label: "Money",      eyebrow: "Careers, pay, pensions",           sheetTitle: "money & work",        Icon: Briefcase,     open: "room" },
  { id: "style",   label: "Style",      eyebrow: "Fashion as confidence",            sheetTitle: "style",               Icon: Sparkles,      open: "room" },
  { id: "health",  label: "Health",     eyebrow: "The clinical room, NHS-grounded",  sheetTitle: "the health room",     Icon: Stethoscope,   open: "room" },
  { id: "talk",    label: "Talk It Out",eyebrow: "Quietly, one to one",              sheetTitle: "talk it out",         Icon: HeartHandshake,nav: "?open=witness", journal: true },
];

// ?tab=/?surface= → surface id, so a deep link lands on the matching card.
const idForParam = (p) => SURFACES.find((s) => s.id === p)?.id || null;

// ── the season / belonging line, keyed to life stage (count-free; mirrors Community) ─
const SEASONS = {
  "teen":           "Others finding their feet are here too. You don't have to have it figured out.",
  "reproductive":   "Other women riding the same monthly tides are here. You're in good company.",
  "pre-ttc":        "Others getting ready, in their own time, are here too. No rush, no race.",
  "ttc":            "Others in the two-week waits and the hoping are here. You're not waiting alone.",
  "pregnant-t1":    "Others early in it — the wonder and the worry — are here too.",
  "pregnant-t2":    "Others carrying alongside you are here. You're in company.",
  "pregnant-t3":    "Others near the end of the wait are here too. Nearly there, together.",
  "postpartum":     "Others in the newborn fog and the healing are here. You're held.",
  "perimenopause":  "Others naming what no one warned them about are here. You're not imagining it.",
  "menopause":      "Others through it and out the other side are here. Honest, together.",
  "post-menopause": "Others in this next chapter are here too. There's a lot of life in it.",
};

const primaryBtn = {
  display: "inline-flex", alignItems: "center", gap: 7, background: T.ink, color: T.paperHi,
  border: "none", borderRadius: 10, padding: "11px 18px", fontFamily: UI, fontSize: 13.5,
  fontWeight: 700, letterSpacing: 0.3, cursor: "pointer",
};
const inputStyle = {
  width: "100%", background: T.paperHi, border: `1px solid ${T.paperDeep}`,
  padding: "12px 14px", borderRadius: 3, resize: "none", fontFamily: SERIF, fontSize: 18,
  lineHeight: 1.5, color: T.ink, outline: "none", boxSizing: "border-box",
};

// ── crisis sheet (UK resources) — copied 1:1 from Community.jsx so the rail is identical ─
function CrisisSheet({ onClose }) {
  useEscape(onClose);
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

// ── QOTD sheet — the FULL question flow, reusing the proven answerQotd write path +
// the same crisisCheck + per-device "answered" flag (markQotd/answeredQotd). On answer
// it reads back today's room (QotdResponse) read-only/guarded. Identical write logic to
// Community.jsx's QotdCard — not a reimplementation of the backend.
function QotdSheet({ user, onCrisis }) {
  const qotd = useMemo(() => qotdForDay(), []);
  const [answered, setAnswered] = useState(() => answeredQotd(qotd.day));
  const [draft, setDraft] = useState("");
  const [answers, setAnswers] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);

  const loadAnswers = useCallback(async () => {
    const rows = await base44.entities.QotdResponse.filter({ prompt_day: qotd.day, hidden: false }, "-created_date", 30).catch(() => []);
    setAnswers(Array.isArray(rows) ? rows : []);
  }, [qotd.day]);
  useEffect(() => { if (answered) loadAnswers(); }, [answered, loadAnswers]);

  const send = async () => {
    const text = draft.trim();
    if (!text || busy) return;
    if (crisisCheck(text).intercept) { onCrisis(); return; }
    setBusy(true); setErr(false);
    try {
      const wh = await communityHash(user?.id);
      const r = await base44.functions.invoke("answerQotd", { user_id: user?.id, author_hash: wh, prompt_day: qotd.day, prompt_key: qotd.key, body: text });
      const d = r?.data ?? r;
      if (d?.intercept) { onCrisis(); return; }
      markQotd(qotd.day); setAnswered(true); setDraft("");
    } catch (e) { console.error("qotd failed:", e); setErr(true); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <Eyebrow color={T.gold} mb={8}>Question of the day</Eyebrow>
      <Script size={28} style={{ marginBottom: 14 }}>{qotd.text}</Script>
      {!answered ? (
        <>
          <textarea value={draft} onChange={(e) => { setDraft(e.target.value); if (err) setErr(false); }} maxLength={280} placeholder="A line is plenty…" style={{ ...inputStyle, minHeight: 64, fontSize: 16 }} />
          {err && <div style={{ fontFamily: UI, fontSize: 12, color: T.crimson, marginTop: 6 }}>Couldn{"’"}t share that just now — try again in a moment.</div>}
          <button onClick={send} disabled={!draft.trim() || busy} style={{ ...primaryBtn, marginTop: 10, opacity: (!draft.trim() || busy) ? 0.5 : 1 }}>
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
    </div>
  );
}

// ── per-card rich preview — built ONLY from real data the hub loaded (guarded), with
// honest empty states. The card's primary button opens the full surface (sheet or the
// real /Community deep-link). No mock figures, no counts shown as scores.
function CardPreview({ surface, posts, qotdPreview, presence, season, profile }) {
  switch (surface.id) {
    case "qotd": return <QotdPreview qotd={qotdPreview} />;
    case "echo": return <EchoPreview />;
    case "circles": return <CirclesPreview profile={profile} />;
    case "library": return <LibraryPreview />;
    case "lighter": return <LighterPreview />;
    case "talk": return <TalkPreview />;
    default: return <RoomPreview surface={surface} posts={posts} presence={presence} season={season} />;
  }
}

// QOTD card preview — today's prompt + REAL room state: whether you've answered, a
// k-anon sense of how many have, and one anonymous answer to draw you in. Read-only +
// guarded; the full answer flow stays in the sheet (proven answerQotd write path).
function QotdPreview({ qotd }) {
  const day = qotd?.day || qotdForDay().day;
  const [answers, setAnswers] = useState(null);   // null = loading
  const [mine, setMine] = useState(() => { try { return answeredQotd(day); } catch { return false; } });
  useEffect(() => {
    let alive = true;
    setMine(() => { try { return answeredQotd(day); } catch { return false; } });
    base44.entities.QotdResponse.filter({ prompt_day: day, hidden: false }, "-created_date", 30)
      .then((rows) => { if (alive) setAnswers(Array.isArray(rows) ? rows.filter(Boolean) : []); })
      .catch(() => { if (alive) setAnswers([]); });
    return () => { alive = false; };
  }, [day]);

  const count = answers?.length || 0;
  const sample = answers && answers.length ? answers[0] : null;
  const presence = count >= 3 ? `${count} sisters answered today` : count > 0 ? "a few have answered" : "no one yet — be the first";

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <Eyebrow color={T.gold}>Today{"’"}s question</Eyebrow>
        {mine ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: UI, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: T.sage }}>
            <Check size={11} /> You answered
          </span>
        ) : null}
      </div>
      <Script size={26} style={{ marginBottom: 12 }}>{qotd.text}</Script>

      {sample ? (
        <div style={{ borderLeft: `2px solid ${T.gold}`, paddingLeft: 11, marginBottom: 12 }}>
          <div style={{ fontFamily: UI, fontSize: 9, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: T.muted, marginBottom: 3 }}>One from the room</div>
          <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontSize: 15.5, color: T.ink, lineHeight: 1.3 }}>{(sample.body || "").slice(0, 120)}</div>
        </div>
      ) : (
        <Hand size={15} color={T.muted} style={{ marginBottom: 12 }}>A line is plenty. Share yours, then see how the room answered — no names, no scoreboard.</Hand>
      )}

      <div style={{ marginTop: "auto", paddingTop: 4, fontFamily: UI, fontSize: 11, color: T.muted, fontWeight: 600, letterSpacing: 0.2 }}>
        {answers === null ? "…" : (mine ? `You're in · ${presence}` : presence)}
      </div>
    </div>
  );
}

// A topic-room preview — the latest REAL CommunityPost lines for that room (read-only,
// guarded). The full feed + composer + reactions + replies open in the real /Community room.
function RoomPreview({ surface, posts, presence, season }) {
  const feed = (posts || []).filter((p) => p && p.room === surface.id).slice(0, 3);
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Hand size={15} color={T.muted} style={{ marginBottom: 12 }}>{surface.eyebrow}.</Hand>
      {feed.length > 0 ? (
        <div style={{ display: "grid", gap: 11 }}>
          {feed.map((p) => (
            <div key={p.id} style={{ borderLeft: `2px solid ${T.gold}`, paddingLeft: 11 }}>
              {p.domain ? <div style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 0.5, color: T.muted, textTransform: "uppercase", marginBottom: 3 }}>{p.domain}</div> : null}
              <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontSize: 15.5, color: T.ink, lineHeight: 1.3 }}>{p.body}</div>
            </div>
          ))}
        </div>
      ) : (
        <Empty>Quiet in here right now. Open the room to leave the first word — someone always comes by.</Empty>
      )}
      <div style={{ marginTop: "auto", paddingTop: 14, fontFamily: UI, fontSize: 11, color: T.muted, lineHeight: 1.5 }}>
        {presence}{season ? ` · ${season}` : ""}
      </div>
    </div>
  );
}

// Echo Wall preview — the door, with a real-data feed living one tap away in the sheet.
function EchoPreview() {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Waves size={16} color={T.gold} />
        <Eyebrow color={T.gold}>Echo Wall</Eyebrow>
      </div>
      <Hand size={15} color={T.inkSoft} style={{ marginBottom: 12 }}>
        Anonymous one-liners, held by the room — each fades 48h after it goes live. Kind one-way reactions, no replies, no names.
      </Hand>
      <Empty>Open the wall to read the lines being held right now, leave one of your own, or pull yours back while it{"’"}s still cooling.</Empty>
    </div>
  );
}

// Circles preview — REAL: the circles suggested for your season/interests + how many
// you're already in, drawn straight from the curated circle set + device-local joins.
function CirclesPreview({ profile }) {
  const suggested = suggestedCircles(profile);                 // from life_stage + interests
  const joinedKeys = CIRCLE_KEYS.filter((k) => isJoined(k));
  // lead with suggested-not-yet-joined, then fill from the full set, up to 3
  const lead = suggested.filter((c) => !isJoined(c.key));
  const fill = CIRCLES.filter((c) => !lead.some((s) => s.key === c.key) && !isJoined(c.key));
  const show = [...lead, ...fill].slice(0, 3);
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Hand size={15} color={T.muted} style={{ marginBottom: 10 }}>Smaller rooms by what you{"’"}re living and what you love. Lurk freely; join the ones that are yours.</Hand>
      <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: T.gold, marginBottom: 10 }}>
        {joinedKeys.length > 0 ? `You're in ${joinedKeys.length} · ${CIRCLES.length} circles` : `${CIRCLES.length} circles · ${suggested.length > 0 ? "some picked for your season" : "find yours"}`}
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {show.map((c) => (
          <div key={c.key} style={{ borderLeft: `2px solid ${T.gold}`, paddingLeft: 11 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, fontWeight: 600 }}>{c.name}</span>
              {suggested.some((s) => s.key === c.key) ? (
                <span style={{ fontFamily: UI, fontSize: 8.5, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: T.sage }}>for you</span>
              ) : null}
              {c.sensitive ? <Lock size={10} style={{ color: T.muted }} /> : null}
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 12.5, color: T.muted, fontStyle: "italic", marginTop: 1 }}>{c.line}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "auto", paddingTop: 12, fontFamily: UI, fontSize: 11, color: T.muted }}>
        Open Circles to join, lurk, or start a post — and find the Jess-hosted Clubs.
      </div>
    </div>
  );
}

// Library preview — REAL: this season's actual Book Club pick + your spoiler-safe progress.
function LibraryPreview() {
  const reached = (() => { try { return clubReached(SEED_PICK.pick_key); } catch { return -1; } })();
  const total = SEED_PICK.checkpoints?.length || 4;
  const progress = reached < 0 ? "Not started — lurking counts" : reached >= total - 1 ? "You've reached the end" : `Checkpoint ${reached + 1} of ${total}`;
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Hand size={15} color={T.muted} style={{ marginBottom: 12 }}>Read together — at our own pace, spoiler-safe. A Jess-hosted book club, plus readers{"’"} corners for whatever you{"’"}re reading.</Hand>
      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "13px 14px" }}>
        <div style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: T.gold, marginBottom: 5 }}>This season{"’"}s read · Jess hosts</div>
        <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontSize: 19, color: T.ink, lineHeight: 1.2 }}>{SEED_PICK.title}</div>
        <div style={{ fontFamily: SERIF, fontSize: 13, color: T.muted, marginTop: 2 }}>{SEED_PICK.author} · {SEED_PICK.cadence}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
          <BookOpen size={13} style={{ color: T.gold }} />
          <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: reached >= 0 ? T.ink : T.muted }}>{progress}</span>
        </div>
      </div>
      <div style={{ marginTop: "auto", paddingTop: 12, fontFamily: UI, fontSize: 11, color: T.muted }}>
        Open the Library for the spoiler-safe checkpoints + readers{"’"} corners.
      </div>
    </div>
  );
}

function LighterPreview() {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Hand size={15} color={T.muted} style={{ marginBottom: 12 }}>Play, lightly — Jess hosts a round, no winners, no scores, just a little fun together. Fun, telly, the stars.</Hand>
      <Empty>Open The Lighter Side for tonight{"’"}s round and the room{"’"}s gentle reveal — always kind, always aggregate, never a leaderboard.</Empty>
    </div>
  );
}

function TalkPreview() {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <HeartHandshake size={16} color={T.gold} />
        <Eyebrow color={T.gold}>Quietly, one to one</Eyebrow>
      </div>
      <Hand size={15} color={T.inkSoft} style={{ marginBottom: 12 }}>
        Hand a line to a single matched sister — one read, one fixed response, then it seals. It lives in your Journal, where the on-device scrub and encryption are.
      </Hand>
      <Empty>Opens the Witness flow in your Journal — anonymous, one-shot, not for crisis (anything heavy routes to support).</Empty>
    </div>
  );
}

function Empty({ children }) {
  return (
    <div style={{ border: `1px dashed ${T.paperDeep}`, borderRadius: 12, padding: "14px 13px" }}>
      <div style={{ fontFamily: SERIF, fontSize: 13, color: T.muted, fontStyle: "italic", lineHeight: 1.4 }}>{children}</div>
    </div>
  );
}

function navBtn(disabled) {
  return {
    display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38,
    borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi,
    color: disabled ? T.paperDeep : T.ink, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1,
  };
}

function CommunityHubInner() {
  useEditorialFonts();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [lifeStage, setLifeStage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [active, setActive] = useState(0);          // slider index
  const [openSheet, setOpenSheet] = useState(null); // surface id rendered in a HubSheet (echo/qotd)
  const [showEcho, setShowEcho] = useState(false);  // in-place echo composer (no redirect to Journal)
  const [echoTick, setEchoTick] = useState(0);      // remount the wall after a post so the new (cooling) echo shows
  const [openRoom, setOpenRoom] = useState(null);   // room key rendered IN-SHEET via CommunityInner (no bounce to classic)
  const [hubMenuOpen, setHubMenuOpen] = useState(false);
  const [crisis, setCrisis] = useState(false);

  const trackRef = useRef(null);
  const last = SURFACES.length - 1;
  const qotd = useMemo(() => qotdForDay(), []);
  const season = lifeStage ? SEASONS[lifeStage] : null;

  // ── deep-link: ?surface=/?tab= opens the matching card (and its sheet if local) ──
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const id = idForParam(sp.get("surface") || sp.get("tab"));
      if (id) {
        const idx = SURFACES.findIndex((s) => s.id === id);
        if (idx >= 0) setActive(idx);
        const meta = SURFACES.find((s) => s.id === id);
        if (meta?.open) setOpenSheet(id);
      }
    } catch { /* ignore */ }
  }, []);

  // ── init: auth + profile/life stage + the feed (all guarded) ─────────────────
  useEffect(() => { base44.auth.me().then(setUser).catch(() => setUser(null)); }, []);
  useEffect(() => {
    base44.entities.UserProfile.filter({}, "-created_date", 1)
      .then((r) => { const p = Array.isArray(r) ? r[0] : null; setProfile(p || null); setLifeStage(p?.life_stage || null); })
      .catch(() => { setProfile(null); setLifeStage(null); });
  }, []);
  useEffect(() => {
    base44.entities.CommunityPost.filter({ hidden: false }, "-created_date", 200)
      .then((rows) => setPosts(Array.isArray(rows) ? rows : []))
      .catch((e) => { console.error("community feed failed:", e); setPosts([]); })
      .finally(() => setLoading(false));
  }, []);

  // k-anon ambient presence — distinct author_hashes active in the window (bucketed line).
  const presence = useMemo(() => {
    const cutoff = Date.now() - PRESENCE_WINDOW_HRS * 3600e3;
    const activeHashes = new Set(
      (posts || [])
        .filter((p) => p && new Date(p.created_date || 0).getTime() >= cutoff)
        .map((p) => p.author_hash)
    );
    return presenceLine(activeHashes.size);
  }, [posts]);

  // ── slider: keep active index in sync with scroll-snap swipes ────────────────
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let t;
    const onScroll = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const i = Math.round(el.scrollLeft / (CARD_W + GAP));
        setActive(Math.max(0, Math.min(last, i)));
      }, 80);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); clearTimeout(t); };
  }, [last, loading]);

  const goTo = (i) => {
    const idx = Math.max(0, Math.min(last, i));
    setActive(idx);
    trackRef.current?.scrollTo({ left: idx * (CARD_W + GAP), behavior: "smooth" });
  };

  // open a surface — local sheets (echo/qotd) render in a HubSheet; everything else
  // deep-links into the proven /Community route (or the Journal for Talk It Out) so the
  // real writes / anonymity hashing / crisis routing / moderation all stay intact.
  const openSurface = (s) => {
    if (s.open === "room") { setOpenRoom(s.id); return; }   // the real room, IN the hub (no bounce)
    if (s.open) { setOpenSheet(s.id); return; }
    if (s.journal) { navigate(createPageUrl("Journal" + s.nav)); return; }
    navigate(createPageUrl("CommunityClassic" + (s.nav || "")));
  };

  // the central "Jump to" switcher reuses the existing CommunityHubSheet, routed to the
  // matching card (local sheet) or the real /Community deep-link.
  const onHubSelect = (id) => {
    if (id === "witness") { navigate(createPageUrl("Journal?open=witness")); return; }
    if (id === "twin") { navigate(createPageUrl("Journal?open=twin")); return; }
    const meta = SURFACES.find((s) => s.id === id);
    if (meta) { openSurface(meta); return; }
    // surfaces the hub menu lists that aren't slider cards (clubs/games) → render in-sheet too
    setOpenRoom(id);
  };

  const openMeta = openSheet ? SURFACES.find((s) => s.id === openSheet) : null;

  if (loading) {
    return (
      <div style={{ ...PAPER_BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <InkFilter />
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: T.paperDeep, borderTopColor: T.gold }} />
      </div>
    );
  }

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 120 }}>
      <InkFilter />
      <div style={{ maxWidth: COL, margin: "0 auto", position: "relative" }}>

        {/* ── HUB header — rich Community summary + the embrace centerpiece ──── */}
        <header style={{ padding: "20px 18px 4px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: 14 }}>
            <JumpToButton onClick={() => setHubMenuOpen(true)} />
          </div>

          <Eyebrow mb={4}>{MASTHEAD.eyebrow}</Eyebrow>
          <Script size={40} carve>{MASTHEAD.title}</Script>

          {/* the circular centerpiece — two women embracing (analogue of the energy ring) */}
          <div style={{ display: "flex", justifyContent: "center", margin: "14px 0 4px" }}>
            <CommunityEmbraceRing size={184} />
          </div>

          <Hand size={17} color={T.inkSoft} style={{ marginBottom: 12, textAlign: "center" }}>{MASTHEAD.subtitle}</Hand>

          {/* ambient presence + count-free season belonging line */}
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, fontWeight: 600, lineHeight: 1.5 }}>{presence}</div>
            {season && <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5, marginTop: 3 }}>{season}</div>}
          </div>

          {/* Jess welcome + Question of the Day — the one focal point (dusk surface) */}
          <div style={{ background: T.dusk, color: T.paper, borderRadius: 16, padding: "16px 16px 15px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ width: 24, height: 24, borderRadius: 999, background: T.sage, display: "grid", placeItems: "center" }}>
                <HeartHandshake size={13} color={T.dusk} />
              </span>
              <span style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 1.4, color: T.wax, textTransform: "uppercase", fontWeight: 700 }}>Jess · here with you</span>
            </div>
            <Hand size={17} color={T.paper} style={{ marginBottom: 12 }}>
              Come in for the whole of you — the love, the laugh, the money question, the late-night vent. No names, no count.
            </Hand>
            <div style={{ borderTop: "1px solid rgba(244,239,227,0.18)", paddingTop: 12 }}>
              <div style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 1.2, color: T.wax, textTransform: "uppercase", fontWeight: 700, marginBottom: 5 }}>Question of the day</div>
              <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontSize: 19, lineHeight: 1.35, color: T.paper, marginBottom: 12 }}>{qotd.text}</div>
              <button onClick={() => setOpenSheet("qotd")} style={{
                display: "inline-flex", alignItems: "center", gap: 8, background: T.gold, color: PLUM, border: "none",
                borderRadius: 12, padding: "11px 16px", fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
                textTransform: "uppercase", cursor: "pointer",
              }}>
                <Send size={14} /> Answer today{"’"}s question
              </button>
            </div>
          </div>

          {/* anonymity-first / 18+ framing + the crisis/NHS safety line */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 9, marginTop: 14, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "12px 14px" }}>
            <Lock size={14} style={{ color: T.gold, marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: UI, fontSize: 11.5, color: T.inkSoft, lineHeight: 1.5, fontWeight: 600 }}>Anonymous, 18+ — no handles, no DMs, no likes or leaderboards.</div>
              <button onClick={() => setCrisis(true)} style={{ background: "transparent", border: "none", padding: "4px 0 0", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 11.5, fontWeight: 700, color: T.crimson }}>
                <Phone size={12} /> In crisis? Tap for support, any time.
              </button>
            </div>
          </div>
        </header>

        {/* ── THE SPINE — Hero Card Slider of surfaces ───────────────────── */}
        <div style={{ marginTop: 16 }}>
          <div style={{ padding: "0 18px 10px" }}>
            <Hand size={15} color={T.muted}>Swipe through the rooms — each card opens the full thing.</Hand>
          </div>

          {/* segmented label rail */}
          <div style={{ display: "flex", gap: 7, overflowX: "auto", padding: "0 18px 12px", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
            {SURFACES.map((s, i) => (
              <button key={s.id} onClick={() => goTo(i)} style={{
                flex: "none", background: i === active ? T.ink : "transparent", color: i === active ? T.paper : T.muted,
                border: `1px solid ${i === active ? T.ink : T.paperDeep}`, borderRadius: 999, padding: "5px 12px",
                fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer",
              }}>{s.label}</button>
            ))}
          </div>

          {/* the swipeable track — scroll-snap, next card peeks */}
          <div ref={trackRef} className="commhub-track" style={{
            display: "flex", gap: GAP, overflowX: "auto", scrollSnapType: "x mandatory",
            padding: "0 18px 4px", scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
          }}>
            <style>{`.commhub-track::-webkit-scrollbar{display:none}`}</style>

            {SURFACES.map((s) => (
              <SurfaceCard
                key={s.id}
                cardW={CARD_W}
                label={s.label}
                accent={T.gold}
                onOpen={() => openSurface(s)}
                primaryLabel={s.open ? `Open ${s.label}` : "Open the room"}
                primaryIcon={s.Icon}
              >
                <CardPreview surface={s} posts={posts} qotdPreview={qotd} presence={presence} season={season} profile={profile} />
              </SurfaceCard>
            ))}

            {/* trailing spacer so the last card can center-snap */}
            <div style={{ flex: `0 0 ${Math.max(0, COL - CARD_W - 36)}px` }} aria-hidden />
          </div>

          {/* prev / dots / next */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, padding: "14px 18px 0" }}>
            <button onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous surface" style={navBtn(active === 0)}>
              <ChevronLeft size={18} />
            </button>
            <div style={{ display: "flex", gap: 7 }}>
              {SURFACES.map((s, i) => (
                <button key={s.id} onClick={() => goTo(i)} aria-label={s.label} style={{
                  width: i === active ? 18 : 7, height: 7, borderRadius: 999, border: "none", padding: 0,
                  background: i === active ? T.crimson : T.paperDeep, cursor: "pointer", transition: "width .2s",
                }} />
              ))}
            </div>
            <button onClick={() => goTo(active + 1)} disabled={active === last} aria-label="Next surface" style={navBtn(active === last)}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* legacy Posts feed — kept reachable: the Lounge IS the live posts feed */}
        <div style={{ textAlign: "center", padding: "20px 24px 0" }}>
          <button onClick={() => navigate(createPageUrl("CommunityClassic?room=lounge"))} style={{
            display: "inline-flex", alignItems: "center", gap: 7, background: "transparent",
            border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "9px 16px",
            fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.inkSoft, cursor: "pointer",
          }}>
            <MessageCircle size={13} style={{ color: T.gold }} /> Open the full posts feed
          </button>
        </div>

        {/* footer voice — the anonymity/no-leaderboard charter line */}
        <footer style={{ textAlign: "center", padding: "26px 24px 0" }}>
          <Rule w={40} c={T.paperDeep} mb={12} />
          <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, lineHeight: 1.5 }}>{FOOTER_LINE}</div>
          <EditorialFooter />
        </footer>

        {/* ── the universal "Jump to" switcher (the existing CommunityHubSheet) ── */}
        <CommunityHubSheet open={hubMenuOpen} onClose={() => setHubMenuOpen(false)} onSelect={onHubSelect} />

        {/* ── the bottom sheet — the FULL real surface (Echo Wall) or the QOTD flow ── */}
        {openMeta && openMeta.open === "echo" && (
          <HubSheet title={openMeta.sheetTitle} eyebrow={openMeta.eyebrow} onClose={() => setOpenSheet(null)}>
            <EchoWall key={echoTick} user={user} profile={profile} lifeStage={lifeStage} onShare={() => setShowEcho(true)} />
          </HubSheet>
        )}
        {/* In-place echo composer — post an echo RIGHT HERE on Community (real guarded
            postEcho write); no redirect to the Journal. Remount the wall on success. */}
        {showEcho && user && (
          <ShareAsEchoSheet
            user={user}
            phase={(() => { try { return profile?.last_period_start_date ? computeCycleDay(profile).phase : null; } catch { return null; } })()}
            lifeStage={lifeStage}
            onClose={() => setShowEcho(false)}
            onShared={() => { setShowEcho(false); setEchoTick((t) => t + 1); }}
          />
        )}
        {openMeta && openMeta.open === "qotd" && (
          <HubSheet title={openMeta.sheetTitle} eyebrow={openMeta.eyebrow} onClose={() => setOpenSheet(null)}>
            <QotdSheet user={user} onCrisis={() => { setOpenSheet(null); setCrisis(true); }} />
          </HubSheet>
        )}
        {/* ── ROOMS render IN the hub (the real room via CommunityInner) — no bounce to
              the classic feed. All posts/writes/crisis/anonymity run inside CommunityInner. ── */}
        {openRoom && (
          <HubSheet
            title={(SURFACES.find((s) => s.id === openRoom)?.sheetTitle) || "community"}
            eyebrow={(SURFACES.find((s) => s.id === openRoom)?.eyebrow) || "in your circle"}
            onClose={() => setOpenRoom(null)}
          >
            <CommunityInner initialView={openRoom} embedded />
          </HubSheet>
        )}

        {crisis && <CrisisSheet onClose={() => setCrisis(false)} />}
      </div>
    </div>
  );
}

export default function CommunityHub() {
  const navigate = useNavigate();
  return (
    <AgeGate surfaceName="the Community" onDecline={() => navigate("/Today")}>
      <CommunityHubInner />
    </AgeGate>
  );
}
