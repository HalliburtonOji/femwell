// FeatureIdeasDoc — Founders Corner: researched, per-feature ways to make EVERY
// Journal + Community feature meaningfully better. Pairs best-in-class app patterns
// with a women-specific angle, and tags each idea SHIPPED / QUICK WIN / BIGGER so Halli
// can pick what to build next. Self-contained, plain JSX, Lucide/SVG-free, no emoji.
//
// Companion handoff: feature-ideas_20260614.html (same content, phone-readable).

import React from "react";

const C = {
  cream: "#F4EDDB", paper: "#ECE7DA", paperHi: "#FBF6E6", ink: "#3A2C1A", deepink: "#0B0805",
  muted: "#9B8B7A", blush: "#E8B4B8", sage: "#8FAF8F", gold: "#D4AF37", goldDeep: "#A8893F",
  crimson: "#BC2E27", rule: "rgba(58,44,26,0.14)",
};
const SCRIPT = '"Ephesis","Pinyon Script",cursive';
const SERIF = '"Cormorant Garamond","Fraunces",Georgia,serif';
const SANS = 'ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif';

const TAGS = {
  shipped: { bg: "rgba(143,175,143,0.18)", fg: "#4c6b4c", label: "Shipped" },
  quick:   { bg: "rgba(212,175,55,0.18)",  fg: C.goldDeep, label: "Quick win" },
  bigger:  { bg: "rgba(188,46,39,0.12)",   fg: C.crimson,  label: "Bigger bet" },
};
function Tag({ k }) {
  const t = TAGS[k] || TAGS.quick;
  return <span style={{ fontFamily: SANS, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: t.fg, background: t.bg, borderRadius: 999, padding: "2px 8px", marginRight: 8, whiteSpace: "nowrap" }}>{t.label}</span>;
}
function Eyebrow({ children }) {
  return <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700, color: C.goldDeep, margin: "0 0 10px" }}>{children}</div>;
}
function P({ children, lede }) {
  return <p style={{ fontFamily: SERIF, fontSize: lede ? 18 : 16, color: C.ink, lineHeight: 1.55, margin: "8px 0" }}>{children}</p>;
}

// ── the research: each feature → best-in-class reference, women-specific angle, ideas
const SECTIONS = [
  {
    page: "Journal",
    blurb: "A private, cycle-aware writing home. The bar: Day One (ritual + history), Stoic & How We Feel (guided emotional check-ins), Finch (gentle, non-punishing habit), Reflectly (AI prompts).",
    features: [
      {
        name: "The composer (Write a page)",
        ref: "Day One: rich entry types + on-this-day resurfacing. Stoic/How-We-Feel: a feeling wheel before words. Reflectly: an AI follow-up question.",
        angle: "Women journal around cycle, energy and life-load — the prompt should meet the phase, and a single line must always feel like enough.",
        ideas: [
          { k: "shipped", t: "Phase-tuned Jess prompt on the card + 6 quick-start formats." },
          { k: "quick", t: "After saving, Jess offers ONE gentle follow-up question (“want to say more about that?”) — opt-in, never nagging." },
          { k: "quick", t: "A feeling-wheel mini-picker (How We Feel style) that maps to mood_rating + a tag, so emotion is one tap, not a search for words." },
          { k: "bigger", t: "Voice-to-page: speak an entry, on-device transcription, you keep or bin the text. Huge for postpartum/one-handed moments." },
        ],
      },
      {
        name: "Echo Wall (anonymous lines)",
        ref: "PostSecret (confession as catharsis), Whisper/Yik-Yak (anonymous feed — but those went toxic without care). The win is anonymity WITH kindness rails.",
        angle: "Women carry a lot they can’t say aloud. Anonymous + ephemeral + phase-tagged makes it safe to be witnessed without exposure.",
        ideas: [
          { k: "shipped", t: "Presence line (“~N sisters left a line today”) + a phase filter on the card." },
          { k: "quick", t: "One-tap kind reactions (a held-heart / “me too” / “not alone”) — no counts shown, just a soft glow back to the author. Reactions need a tiny backend write." },
          { k: "quick", t: "“This is me too” echo: tap an echo to silently add yours to the same feeling-cluster, surfacing “12 of you felt this” as warm aggregate." },
          { k: "bigger", t: "Phase-resonance: when you write a private entry, optionally let Jess surface an anonymous echo from someone in the same phase who felt similar — “you’re not the only one in your luteal week.”" },
        ],
      },
      {
        name: "Witness (1:1 peer holding)",
        ref: "7 Cups (trained listeners), Koko (peer support routing + crisis escalation), Wisdo (matched by lived experience).",
        angle: "Not therapy — presence. One read, one response, then it seals. The safety model (anonymous, crisis-routed, consent) is the moat.",
        ideas: [
          { k: "shipped", t: "Device-local “held N sisters” count on the card." },
          { k: "quick", t: "A tiny “how to hold space” primer before a first witness (3 lines: reflect, don’t fix, “I hear you” is enough) — raises response quality." },
          { k: "bigger", t: "Reciprocity gate done kindly: holding space for others gently unlocks asking — already partly modelled; surface progress (“hold one more to send your own”)." },
          { k: "bigger", t: "Match by lived experience, not just phase (TTC, loss, perimenopause) so the witness has actually been there." },
        ],
      },
      {
        name: "Phase Twin (12-day pairing)",
        ref: "Slowly (slow penpals), Marco Polo (async intimacy), period-sync folklore made real.",
        angle: "Cycle-synced companionship is uniquely female — two people in the same phase, one prompt a day, blurred until you both answer.",
        ideas: [
          { k: "quick", t: "On the card: if matched, show “Day 7 of 12 · today’s prompt”; if not, show this week’s prompts read-only so people opt in knowing what it is." },
          { k: "bigger", t: "“Twin streak without the streak”: a quiet shared garden/bloom that grows as you both show up — rest days don’t kill it (ties to the Nurture Companion concept)." },
          { k: "bigger", t: "Graduation ritual at day 12: a shared, anonymised “what these 12 days held” page; option to re-pair or keep the same twin." },
        ],
      },
      {
        name: "Insights",
        ref: "Clue & Flo (cycle pattern science), Stoic (mood-vs-behaviour correlations), Gyroscope (gentle life dashboard).",
        angle: "The killer insight women want and no generic journal gives: how mood/energy/themes move WITH the cycle.",
        ideas: [
          { k: "shipped", t: "14-entry mood-trend sparkline + “tender/steady/lighter lately.”" },
          { k: "quick", t: "Phase↔mood correlation line (“you write calmer in your follicular phase”) once there’s a cycle of data." },
          { k: "bigger", t: "A “your pattern” monthly card: the words that recurred, the phase you wrote most in, the thread that grew — a gentle yearly-wrapped, never a score." },
        ],
      },
      {
        name: "On This Day / Cycle Mirror",
        ref: "Day One “On This Day” (memory resurfacing — its stickiest feature), Timehop.",
        angle: "Cyclical memory: “what you wrote on this cycle-day last month” is more meaningful to women than calendar-only.",
        ideas: [
          { k: "shipped", t: "Count header (“N times you wrote on Day X”) + multiple past entries." },
          { k: "quick", t: "A swipeable deck of past entries for the same cycle-day across months — see yourself rhyme across cycles." },
          { k: "bigger", t: "“Reply to your past self” threads into a Sealed Letter to your future self — closes the loop between the two memory features." },
        ],
      },
      {
        name: "Sealed Letters",
        ref: "FutureMe (letters to your future self — pure ritual), Day One time-capsule.",
        angle: "Anchored to a DATE, a PHASE, or a MILESTONE (“when the baby comes”, “next perimenopause flare”) — life-stage triggers no calendar app has.",
        ideas: [
          { k: "shipped", t: "Real count + “ready to open” + an “Unsealing next” timeline on the card." },
          { k: "quick", t: "Milestone triggers beyond dates: “open when I next log a positive test / a flare / a hard day.”" },
          { k: "bigger", t: "Annual ritual: a yearly “dear me” letter Jess invites on your join-anniversary, building a private correspondence over years." },
        ],
      },
      {
        name: "Threads (series)",
        ref: "Day One journals, Notion/Obsidian linking, Bear tags.",
        angle: "Following one thread (“healing”, “TTC”) over months is how women track a journey, not a day.",
        ideas: [
          { k: "shipped", t: "Per-thread “last written” stamps + an explicit “Start a new series” namer (the create path)." },
          { k: "quick", t: "Tag autocomplete in the composer from your existing threads (fewer near-duplicate series)." },
          { k: "bigger", t: "A thread “arc” view: first entry → now, mood average within the thread, how long you’ve kept it." },
        ],
      },
    ],
  },
  {
    page: "Community",
    blurb: "Anonymous, 18+, no handles/likes/leaderboards. The bar: Peanut (women’s pods by stage), Reddit/Geneva (rooms done well), Fable (social reading), Gas/Slowly (kind daily prompts).",
    features: [
      {
        name: "Question of the Day",
        ref: "Gas (positive daily polls), Slowly (a daily shared prompt), BeReal (one moment a day).",
        angle: "A single shared question is a low-pressure on-ramp for women who’d never start a post — and a daily reason to return.",
        ideas: [
          { k: "shipped", t: "Did-I-answer badge + “N sisters answered today” + one anonymous answer preview." },
          { k: "quick", t: "Phase/life-stage tag on answers so you can read “how others in my season answered.”" },
          { k: "bigger", t: "A weekly Jess synthesis: “this week the room mostly felt…” — a warm aggregate, no individuals." },
        ],
      },
      {
        name: "The rooms (Lounge, Love, Money, Style, Health)",
        ref: "Peanut (women-only, stage-based), Reddit (topic depth), Geneva (cozy rooms), Mumsnet (frank, anonymous threads).",
        angle: "Frank, anonymous, woman-to-woman — “the money question, the late-night vent” — with NHS-grounded safety in the Health room.",
        ideas: [
          { k: "shipped", t: "Each card shows 3 real posts + domain pills + k-anon presence + the season line." },
          { k: "quick", t: "“Browse by theme” chips per room (dating · marriage · heartbreak) driven by post.domain counts." },
          { k: "quick", t: "Health room: a persistent NHS/111 + “speak to your GP” footer + auto crisis-routing already present — surface the trust badge on the card." },
          { k: "bigger", t: "“Still here for you”: gently resurface a post you reacted to when it gets a kind reply — a reason to come back without notifications-spam." },
        ],
      },
      {
        name: "Circles (cohorts) & Clubs",
        ref: "Peanut Pods, Facebook Groups (done without the toxicity), cohort communities (On Deck).",
        angle: "Stage + condition circles (TTC, PCOS, endo, perimenopause) are exactly where women want their people — sensitive ones gated by consent.",
        ideas: [
          { k: "shipped", t: "Card now shows real circles suggested for your season + a “for you” tag + join count + sensitive-lock." },
          { k: "quick", t: "Inline join on the card for the top suggested circle (one tap, consent sheet for sensitive)." },
          { k: "bigger", t: "Circle “this week” digest: 2-3 warm lines from your circles so a quiet lurker still feels held." },
        ],
      },
      {
        name: "Library / Book Club",
        ref: "Fable (social reading + curated clubs), StoryGraph buddy reads, Oprah/Reese clubs (a host matters).",
        angle: "A Jess-hosted, spoiler-safe, no-rush club — reading as gentle togetherness, not homework.",
        ideas: [
          { k: "shipped", t: "Card shows this season’s real pick (Little Women) + author + cadence + your spoiler-safe progress." },
          { k: "quick", t: "“Mark my checkpoint” directly on the card to unlock the next discussion (device-local, latecomer-safe)." },
          { k: "bigger", t: "Suggest-the-next-read: members nominate, the room softly converges; Jess hosts the changeover ritual." },
        ],
      },
      {
        name: "The Lighter Side (games)",
        ref: "Party games (We’re Not Really Strangers — depth-not-competition), Gas (kind polls), Heads Up (lightness).",
        angle: "Pure belonging and lightness — no winners, aggregate-only, Jess-hosted.",
        ideas: [
          { k: "shipped", t: "Six real named games (This or That, One Word, Caption, One-Line Story, Tiny Confession, Comfort Pick), each playable with a warm reveal." },
          { k: "quick", t: "On the hub card: show tonight’s game name + “playing now / the reveal.”" },
          { k: "bigger", t: "Cross-device aggregate reveal once the round backend (openGameRoundV2) is un-wedged — “most of us said…”" },
        ],
      },
      {
        name: "Talk It Out (audio / witness)",
        ref: "7 Cups voice, Clubhouse (live rooms — but moderated), async voice-note apps.",
        angle: "Voice carries what text can’t; turn-based holding (3 min each) avoids the perform-y feel of live audio.",
        ideas: [
          { k: "quick", t: "Ship the async voice-note path first (record → optional voice-mask → a phase-sister holds it → fades 48h) — already scoped behind a flag." },
          { k: "bigger", t: "Live, hosted, listen-first “circles of 5-8” once moderation + provider (LiveKit) are in place." },
        ],
      },
    ],
  },
];

const SHIP_NOW = [
  "Echo Wall kind reactions (held-heart / “me too”, no counts) — small backend write.",
  "Composer: Jess one gentle follow-up question after save (opt-in).",
  "Rooms: “browse by theme” chips from post.domain counts.",
  "Library: “mark my checkpoint” on the card.",
  "Circles: inline one-tap join for the top suggested circle.",
  "QOTD + Echo: phase/stage tag on answers & echoes.",
];
const BIGGER_BETS = [
  "Voice-to-page journaling (on-device transcription).",
  "Phase-resonance: surface a same-phase anonymous echo to a private writer.",
  "“Your pattern” monthly insight card (gentle wrapped, never a score).",
  "Witness matched by lived experience (TTC / loss / perimenopause).",
  "Phase Twin shared bloom + day-12 graduation ritual.",
  "Async voice notes → later live listen-first circles.",
];

export default function FeatureIdeasDoc() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "8px 2px 60px" }}>
      <Eyebrow>Research &middot; Journal &amp; Community</Eyebrow>
      <h1 style={{ fontFamily: SCRIPT, fontSize: 44, color: C.ink, margin: "0 0 6px", lineHeight: 1 }}>Make every feature better</h1>
      <P lede>
        For each feature on Journal and Community: how the best-in-class app handles it, a women-specific angle,
        and concrete ways to go deeper. Each idea is tagged <Tag k="shipped" /> (already live), <Tag k="quick" /> (small, on-brand,
        low-risk), or <Tag k="bigger" /> (a real bet to choose deliberately). All within the locked rails: anonymous, 18+, no
        likes/leaderboards/streaks, cream &amp; plum, no emoji, UK/NHS, crisis-routed.
      </P>

      {SECTIONS.map((sec) => (
        <div key={sec.page}>
          <h2 style={{ fontFamily: SERIF, fontSize: 27, fontWeight: 700, color: C.ink, margin: "40px 0 4px", paddingBottom: 8, borderBottom: `2px solid ${C.rule}` }}>
            <span style={{ fontFamily: SCRIPT, fontSize: 34, color: C.goldDeep, marginRight: 10 }}>{sec.page === "Journal" ? "i" : "ii"}</span>{sec.page}
          </h2>
          <P>{sec.blurb}</P>
          {sec.features.map((f) => (
            <div key={f.name} style={{ background: C.paperHi, border: `1px solid ${C.rule}`, borderLeft: `3px solid ${C.gold}`, borderRadius: 13, padding: "15px 17px", margin: "16px 0" }}>
              <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: C.ink, margin: "0 0 8px" }}>{f.name}</h3>
              <div style={{ fontFamily: SANS, fontSize: 13, color: C.muted, lineHeight: 1.5, marginBottom: 6 }}>
                <strong style={{ color: C.goldDeep }}>Best-in-class:</strong> {f.ref}
              </div>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: C.ink, lineHeight: 1.5, margin: "0 0 12px", paddingLeft: 11, borderLeft: `2px solid ${C.blush}` }}>
                {f.angle}
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {f.ideas.map((idea, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 0, flexWrap: "wrap", margin: "8px 0", fontFamily: SERIF, fontSize: 16, color: C.ink, lineHeight: 1.5 }}>
                    <Tag k={idea.k} /><span style={{ flex: 1, minWidth: 200 }}>{idea.t}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}

      <h2 style={{ fontFamily: SERIF, fontSize: 27, fontWeight: 700, color: C.ink, margin: "44px 0 10px", paddingBottom: 8, borderBottom: `2px solid ${C.rule}` }}>
        <span style={{ fontFamily: SCRIPT, fontSize: 34, color: C.goldDeep, marginRight: 10 }}>iii</span>Pick-from shortlists
      </h2>
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ background: "rgba(212,175,55,0.10)", border: `1px solid ${C.rule}`, borderRadius: 13, padding: "15px 17px" }}>
          <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 800, color: C.goldDeep, marginBottom: 8 }}>Ship next (small, low-risk)</div>
          {SHIP_NOW.map((s, i) => <P key={i}>&middot; {s}</P>)}
        </div>
        <div style={{ background: "rgba(188,46,39,0.06)", border: `1px solid ${C.rule}`, borderRadius: 13, padding: "15px 17px" }}>
          <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 800, color: C.crimson, marginBottom: 8 }}>Bigger bets (choose deliberately)</div>
          {BIGGER_BETS.map((s, i) => <P key={i}>&middot; {s}</P>)}
        </div>
      </div>

      <p style={{ fontFamily: SANS, fontSize: 12, color: C.muted, lineHeight: 1.6, margin: "28px 0 0", textAlign: "center" }}>
        Compiled from current best-in-class apps (Day One, Stoic, How We Feel, Finch, Clue, Flo, Peanut, Fable, 7 Cups, Slowly, FutureMe)
        + the FemWell brand rails. “Shipped” items are live now; tap any “quick win” and it can ship the same day.
      </p>
    </div>
  );
}
