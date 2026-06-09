// CommunityDemo3 — "A Circle + a game" (Community design demo · /Ideas → Community Demos)
// ─────────────────────────────────────────────────────────────────────────────
// The whole-life, NON-CLINICAL face of Community. A friendship Circle matched on
// what you LOVE (never a lead photo, never a competitive count) + two cooperative
// games in play: a This-or-That / Kind Hot-Take that reveals how the ROOM split
// (a descriptive-norm aggregate bar — never a leaderboard), and a One-Line Story
// (exquisite-corpse) the room builds together, a line at a time.
//
// From WHOLE_LIFE_REBALANCE §4 (Circles: interest-first friendship, never a lead
// photo) + §5 non-clinical catalogue (Kind Hot-Takes · This-or-That · One-Line
// Story · Recommend-Me). Joyful, warm, equal — NOT clinical. No cycle-quiz.
//
// Self-contained, mock data only, no entities. UK voice, no emoji, Lucide only.
import { useState } from "react";
import {
  Heart, BookOpen, Tv, Tag, Users, Feather, Check, Sparkles, Coffee, Plus,
} from "lucide-react";
import {
  T, SERIF, UI, Eyebrow, Rule, Script, Hand, InkFilter, EditorialFooter,
  useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";

// ── the Circle (interest-first, whole-life — NOT a count, a warm "who's here") ─
const CIRCLE = {
  name: "Bookworms & Binge-watchers",
  blurb: "Match on what you love — never a photo. A handful of women who read past midnight and have strong feelings about a season finale.",
  tags: ["#cosy-crime", "#a-good-cry-film", "#charity-shop-finds"],
  whoHint: "A small, settled room — some new this week, most have been here a while.",
};

const POSTS = [
  { id: "p1", icon: BookOpen, kind: "a film rec",
    body: "Watched a quiet little film about a baker who learns to swim. Nothing exploded. I cried twice and felt completely held. Putting it here for anyone who needs the gentle kind tonight." },
  { id: "p2", icon: Tag, kind: "a great find",
    body: "£3.50 in the charity shop for a coat I'd have stared at in a window for a month and never bought. It has POCKETS. I walked home feeling like the main character." },
  { id: "p3", icon: Sparkles, kind: "a whole-life win",
    body: "Job interview tomorrow for something I actually want — the first time in years I've wanted a thing for me. Not asking for advice, just wanted to say it out loud somewhere kind." },
];

// ── This-or-That / Kind Hot-Take — reveals the ROOM's split (no ranking) ──────
const SPLITS = [
  { id: "s1", icon: Coffee, q: "The eternal question:", a: "Tea", b: "Coffee", pctA: 58 },
  { id: "s2", icon: Tv,     q: "An unpopular telly opinion:", a: "Adverts are a nice break", b: "Adverts are a crime", pctA: 22 },
];

// ── One-Line Story (exquisite-corpse) — the room builds it together ───────────
const STORY_SEED = [
  "On the last Tuesday of the longest month, Maureen decided the recipe was wrong.",
  "She had followed it for thirty years, and for thirty years the cake had sunk.",
  "So she opened the window, tipped the flour into the wind, and watched the garden go white.",
];

export default function CommunityDemo3() {
  useEditorialFonts();

  // Circle join toggle
  const [joined, setJoined] = useState(false);

  // This-or-That: which prompts the user has answered, and which side they tapped
  const [voted, setVoted] = useState({}); // { [id]: "a" | "b" }

  // One-Line Story
  const [story, setStory] = useState(STORY_SEED);
  const [draft, setDraft] = useState("");

  const vote = (id, side) =>
    setVoted((v) => (v[id] ? v : { ...v, [id]: side }));

  const addLine = () => {
    const line = draft.trim();
    if (!line) return;
    setStory((s) => [...s, line.replace(/\s+/g, " ").slice(0, 140)]);
    setDraft("");
  };

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 60 }}>
      <InkFilter />
      <DemoBanner label="Community · A Circle + a game — design demo · mock data" />

      <div style={{ maxWidth: 430, margin: "0 auto", padding: "26px 20px 0" }}>
        {/* masthead */}
        <header style={{ textAlign: "center", marginBottom: 20 }}>
          <Eyebrow mb={10} color={T.muted}>Circles</Eyebrow>
          <Script size={52} carve>The Circle</Script>
          <Hand size={19} carve style={{ display: "block", marginTop: 8, color: T.inkSoft }}>
            rooms by what you love — match on interest, never a photo
          </Hand>
        </header>

        {/* ── the Circle ─────────────────────────────────────────────── */}
        <section style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 18, padding: "18px 18px 16px", marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <BookOpen size={16} color={T.gold} />
            <Tv size={16} color={T.gold} />
            <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", color: T.muted }}>
              Interest Circle
            </span>
          </div>
          <Script size={30} carve>{CIRCLE.name}</Script>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: T.inkSoft, margin: "8px 0 12px", lineHeight: 1.5 }}>
            {CIRCLE.blurb}
          </p>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 13 }}>
            {CIRCLE.tags.map((t) => (
              <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 11.5, fontWeight: 600, color: T.inkSoft, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "4px 11px" }}>
                <Tag size={11} color={T.gold} /> {t.replace("#", "")}
              </span>
            ))}
          </div>

          {/* a gentle "who's here" hint — NEVER a competitive count */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, marginBottom: 14 }}>
            <Users size={14} color={T.muted} style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontFamily: UI, fontSize: 12, color: T.inkSoft, lineHeight: 1.45 }}>
              {CIRCLE.whoHint}
            </span>
          </div>

          <button onClick={() => setJoined((j) => !j)} style={joinBtn(joined)}>
            {joined ? <><Check size={15} /> You're in this Circle</> : <><Plus size={15} /> Join the Circle</>}
          </button>
          {joined && (
            <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, fontStyle: "italic", textAlign: "center", marginTop: 9 }}>
              Welcome in. No introductions required — just say the thing you loved this week.
            </div>
          )}
        </section>

        {/* ── warm member posts ──────────────────────────────────────── */}
        <Eyebrow mb={11} color={T.muted}>What's being shared</Eyebrow>
        {POSTS.map((p) => (
          <article key={p.id} style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 16, padding: "15px 16px 13px", marginBottom: 12 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 9 }}>
              <p.icon size={13} color={T.gold} />
              <span style={{ fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: T.muted }}>{p.kind}</span>
            </div>
            <p style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.55, color: T.ink, margin: 0 }}>{p.body}</p>
            <Rule c={T.paperDeep} mt={12} mb={10} />
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 11.5, color: T.muted, fontStyle: "italic" }}>
              <Heart size={12} color={T.crimson} /> a reaction, not a score — reply if it moved you
            </span>
          </article>
        ))}

        {/* ── This-or-That / Kind Hot-Takes — descriptive-norm reveal ── */}
        <div style={{ marginTop: 26 }}>
          <Eyebrow mb={4} color={T.muted}>Tonight's game · This-or-That</Eyebrow>
          <Hand size={22} carve style={{ display: "block", marginBottom: 13, color: T.inkSoft }}>
            tap your side — then see how the room landed
          </Hand>
          {SPLITS.map((s) => (
            <ThisOrThat key={s.id} s={s} chose={voted[s.id]} onVote={vote} />
          ))}
        </div>

        {/* ── One-Line Story (exquisite-corpse) ──────────────────────── */}
        <section style={{ marginTop: 26, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 18, padding: "18px 18px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
            <Feather size={15} color={T.gold} />
            <Eyebrow color={T.muted}>One-Line Story</Eyebrow>
          </div>
          <Hand size={20} carve style={{ display: "block", marginBottom: 14, color: T.inkSoft }}>
            the room writes one wild tale, a line each
          </Hand>

          <ol style={{ listStyle: "none", margin: 0, padding: 0, borderLeft: `2px solid ${T.paperDeep}`, paddingLeft: 14 }}>
            {story.map((line, i) => (
              <li key={i} style={{ marginBottom: 12, position: "relative" }}>
                <span style={{ position: "absolute", left: -22, top: 2, fontFamily: UI, fontSize: 10, fontWeight: 800, color: T.muted }}>{i + 1}</span>
                <span style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.55, color: T.ink, fontStyle: i === story.length - 1 ? "italic" : "normal" }}>{line}</span>
              </li>
            ))}
          </ol>

          <div style={{ marginTop: 6 }}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addLine(); } }}
              rows={2}
              placeholder="Add the next line — where does it go?"
              style={{ width: "100%", padding: "11px 12px", borderRadius: 12, border: `1px solid ${T.paperDeep}`, background: T.paper, fontFamily: SERIF, fontSize: 15, color: T.ink, resize: "none", boxSizing: "border-box", outline: "none" }}
            />
            <button onClick={addLine} disabled={!draft.trim()} style={{ ...inkBtn, width: "100%", justifyContent: "center", marginTop: 10, opacity: draft.trim() ? 1 : 0.4 }}>
              <Plus size={14} /> Add your line
            </button>
          </div>
        </section>

        {/* ── the gentle note ────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 9, marginTop: 22, padding: "13px 15px", border: `1px dashed ${T.paperDeep}`, borderRadius: 14 }}>
          <Heart size={15} color={T.crimson} style={{ flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.inkSoft, lineHeight: 1.55 }}>
            No scores here, no winners — just reactions. Every line and every vote counts the same.
            The room is built one small, kind contribution at a time.
          </span>
        </div>

        <div style={{ marginTop: 30 }}><EditorialFooter /></div>
      </div>
    </div>
  );
}

// ── This-or-That card: tap a side, then the room's split is revealed ──────────
function ThisOrThat({ s, chose, onVote }) {
  const revealed = !!chose;
  const pctA = s.pctA, pctB = 100 - s.pctA;
  return (
    <article style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 16, padding: "15px 16px 14px", marginBottom: 12 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 11 }}>
        <s.icon size={13} color={T.gold} />
        <span style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 600, color: T.muted }}>{s.q}</span>
      </div>

      {!revealed ? (
        <div style={{ display: "flex", gap: 10 }}>
          {[["a", s.a], ["b", s.b]].map(([side, label]) => (
            <button key={side} onClick={() => onVote(s.id, side)} style={choiceBtn}>{label}</button>
          ))}
        </div>
      ) : (
        <>
          <RevealRow label={s.a} pct={pctA} mine={chose === "a"} />
          <RevealRow label={s.b} pct={pctB} mine={chose === "b"} />
          <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, fontStyle: "italic", marginTop: 8 }}>
            How the room split — no winner, just where everyone landed.
          </div>
        </>
      )}
    </article>
  );
}

function RevealRow({ label, pct, mine }) {
  return (
    <div style={{ marginBottom: 9 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
        <span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, fontWeight: mine ? 700 : 400 }}>
          {label}{mine && <span style={{ fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: T.crimson, marginLeft: 8 }}>your side</span>}
        </span>
        <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.inkSoft }}>{pct}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: mine ? T.crimson : T.muted, transition: "width .5s ease" }} />
      </div>
    </div>
  );
}

// ── shared bits ──────────────────────────────────────────────────────────────
function DemoBanner({ label }) {
  return (
    <div style={{ background: T.ink, color: T.paper, padding: "8px 16px", textAlign: "center", fontFamily: UI, fontSize: 10, letterSpacing: 2, fontWeight: 700, textTransform: "uppercase" }}>
      {label}
    </div>
  );
}

const inkBtn = {
  display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 16px", borderRadius: 999,
  background: T.ink, color: T.paper, border: "none", cursor: "pointer",
  fontFamily: UI, fontSize: 12.5, fontWeight: 700, letterSpacing: 0.3,
};

const joinBtn = (joined) => ({
  display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%",
  padding: "12px 16px", borderRadius: 999, cursor: "pointer",
  fontFamily: UI, fontSize: 13, fontWeight: 700, letterSpacing: 0.3,
  background: joined ? "transparent" : T.ink,
  color: joined ? T.ink : T.paper,
  border: `1.5px solid ${T.ink}`,
});

const choiceBtn = {
  flex: 1, padding: "13px 12px", borderRadius: 13, cursor: "pointer",
  background: T.paper, border: `1px solid ${T.paperDeep}`,
  fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink,
};
