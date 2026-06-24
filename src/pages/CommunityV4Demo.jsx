// CommunityV4Demo — the COMMUNITY REDESIGN demo (v4 Brand Bible) + the CONNECTION
// fold-in. DEMO-FIRST, preview only, seeded — NOT live. Reachable from the IDEAS pill.
//
// REDESIGN (v4 signature, §6.8/§6.7/§6.10): wrapped in the real <AgeGate> (18+) →
// FwFloraHero (Community character: sage · meadow/clover · bee) + carved heart → ONE
// SummaryCard → a §6.10 ClipboardSlider of three boards (Connection · The rooms ·
// Together) with rich Card.jsx cards, in-board CardDecks, and quick-action popups.
// Paper bg, uniform cards, soulful voice, compact. NOTHING from live Community is
// dropped — every surface has a door here: QOTD · Echo · the 9 whole-life rooms ·
// Circles · Clubs/Library · Games · Wisdom · Pool · Close-the-week · Witness/Talk.
//
// CONNECTION fold-in (Halli's spec, rails baked in + visible):
//   • 1:1 MESSAGING between women — request-to-connect → every message BACKEND-SCREENED
//     before it reaches her ("checking before it's sent" step) → delivered. BLOCK +
//     report on every thread. Matched by season/life-stage ONLY — NO location.
//   • USER PREFERENCES — "How you want to connect": open to messages / letters only /
//     paused · who can reach you · auto-decline. Her choice, always.
//   • Sealed-letter pen-pal + "someone like you" resonance carried in.
//   • 18+ (AgeGate) · NO location anywhere · backend moderation (server-side).
//
// LIVE wiring approach (NO new function): messaging rides the existing moderated
// service paths — screenContent (OpenAI moderation) + the Witness service path
// (postWitnessRequest/respondWitness: anonymous, server-gated, no plaintext, no
// location) for the 1:1 handoff; createCommunityPost/answerQotd for rooms/QOTD. New
// ENTITY only (a screened DirectThread/Message row). Demo is front-end/seeded —
// nothing is written. Does NOT touch flora.jsx / BRAND_IDENTITY.md; live Community
// untouched.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Mail, Lock, ShieldCheck, Users, Heart, Feather, Check, Clock, MapPinOff,
  Ban, Flag, SlidersHorizontal, BookOpen, Sparkles, Waves, Coffee, Gamepad2, Star, HandHeart, Library } from "lucide-react";
import { createPageUrl } from "@/utils";
import { T, UI, SERIF } from "@/components/journal/Editorial";
import { FwCard, FwCardCTA, SummaryCard } from "@/components/brand/Card";
import { FlowerGlyph } from "@/components/brand/flora";
import { CardDemoPage, DemoSummary } from "@/components/demos/cardDemoKit";
import { GrowthStyles, QuickActionSheet, HeldFlag, RESONANCE, pickDaily } from "@/components/demos/growthKit";
import { ClipboardSlider, Clipboard, CardDeck } from "@/components/brand/ClipboardSlider";
import AgeGate from "@/components/safety/AgeGate";

// ── seed: 1:1 message threads (anonymous; matched by season/stage — NO location) ──
const THREADS = [
  { id: "t1", who: "a woman in her luteal season", flower: "dahlia", accent: "#8E6E8E", status: "open", last: "Honestly? Same. Some weeks the kindest thing is to do less.",
    msgs: [{ me: false, t: "I keep thinking I should be coping better with work right now." }, { me: true, t: "You're not behind — your body's in its autumn. Be gentle." }, { me: false, t: "Honestly? Same. Some weeks the kindest thing is to do less." }] },
  { id: "t2", who: "a woman starting something new", flower: "snowdrop", accent: "#8FAF8F", status: "request", last: "Hi — saw we're in the same season. I just did a brave thing and wanted to tell someone.",
    msgs: [{ me: false, t: "Hi — saw we're in the same season. I just did a brave thing and wanted to tell someone." }] },
];
const ROOMS = [
  { key: "lounge", name: "The Lounge", desc: "Vent, spill it, be heard.", Icon: Coffee, accent: T.gold },
  { key: "love", name: "Love & Relationships", desc: "Dating, friendship, marriage.", Icon: Heart, accent: T.crimson },
  { key: "money", name: "Money & Work", desc: "Careers, pay, pensions.", Icon: Star, accent: "#8FAF8F" },
  { key: "style", name: "Style & Self", desc: "Fashion as confidence.", Icon: Sparkles, accent: "#8E6E8E" },
  { key: "lighter", name: "The Lighter Side", desc: "Fun, telly, the stars.", Icon: Gamepad2, accent: T.gold },
  { key: "health", name: "Health", desc: "The clinical room. One room, not the house.", Icon: ShieldCheck, accent: "#5F7E8E" },
];
const TOGETHER = [
  { key: "circles", name: "Circles", desc: "Rooms by what you love.", Icon: Users, accent: "#8FAF8F" },
  { key: "library", name: "The Library", desc: "Read together — a book club, spoiler-safe.", Icon: Library, accent: "#5F7E8E" },
  { key: "games", name: "The Games Room", desc: "Jess's nightly round, no winners.", Icon: Gamepad2, accent: T.gold },
  { key: "wisdom", name: "What the room knows", desc: "The living wisdom collection.", Icon: BookOpen, accent: "#8E6E8E" },
  { key: "pool", name: "Together this week", desc: "The collective pool — no scores.", Icon: HandHeart, accent: T.crimson },
  { key: "close", name: "Close the week", desc: "A shared Sunday reflection.", Icon: Feather, accent: "#8FAF8F" },
];

function WaxSeal({ flower = "rose", size = 34 }) {
  return (
    <span style={{ position: "relative", width: size, height: size, display: "inline-grid", placeItems: "center", flexShrink: 0 }}>
      <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #BC2E27 0%, #8E1F1A 100%)" }} />
      <span style={{ position: "relative", zIndex: 1, lineHeight: 0, opacity: 0.92 }}><FlowerGlyph variant={flower} size={size * 0.6} color="#F4D9DC" color2="#fff" idx={`seal-${flower}`} /></span>
    </span>
  );
}

// A small "door" card — preserves a live surface as a tappable entry (nothing stripped).
function DoorCard({ d, onEnter }) {
  return (
    <button onClick={onEnter} style={{ textAlign: "left", cursor: "pointer", background: `linear-gradient(165deg, ${T.paperHi} 0%, ${d.accent}14 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${d.accent}`, borderRadius: 16, padding: "13px 14px", display: "flex", alignItems: "center", gap: 11, width: "100%" }}>
      <span style={{ width: 34, height: 34, borderRadius: 9, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}><d.Icon size={17} color={d.accent} strokeWidth={1.8} /></span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: T.ink, display: "block" }}>{d.name}</span>
        <span style={{ fontFamily: UI, fontSize: 12, color: T.muted, display: "block", lineHeight: 1.4 }}>{d.desc}</span>
      </span>
    </button>
  );
}

// ── 1:1 MESSAGING — the connection centrepiece (screened · prefs · block) ─────
function MessagesCard() {
  const [openThread, setOpenThread] = useState(null);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [blocked, setBlocked] = useState({});
  const [prefs, setPrefs] = useState({ mode: "open", reach: "season" });

  const live = THREADS.filter((t) => !blocked[t.id]);
  return (
    <>
      <FwCard accent={T.crimson} Icon={MessageCircle} eyebrow="Messages · 1:1, screened" flower="rose" snap={false} width="100%" minHeight={0} idx="dm"
        title={null} line={null}
        action={<FwCardCTA accent={T.crimson} onClick={() => setPrefsOpen(true)} icon={SlidersHorizontal}>How you want to connect</FwCardCTA>}>
        <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 10px" }}>Gentle 1:1 with a woman like you — matched by season, <b>never location</b>. Every message is <b>checked before it reaches her</b>. Block or report, always.</p>
        {live.length === 0 && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted }}>No open threads. New connections start as a request you can accept or decline.</p>}
        {live.map((t) => (
          <button key={t.id} onClick={() => setOpenThread(t)} style={{ width: "100%", textAlign: "left", cursor: "pointer", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "11px 12px", marginBottom: 8, display: "flex", gap: 10, alignItems: "center" }}>
            <FlowerGlyph variant={t.flower} size={28} color={t.accent} idx={`dm-${t.id}`} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, display: "block" }}>{t.who}{t.status === "request" && <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.gold, marginLeft: 7, textTransform: "uppercase", letterSpacing: "0.08em" }}>· request</span>}</span>
              <span style={{ fontFamily: UI, fontSize: 12, color: T.muted, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.last}</span>
            </span>
          </button>
        ))}
      </FwCard>

      {/* read a thread + moderated reply + block/report */}
      <QuickActionSheet open={!!openThread} onClose={() => setOpenThread(null)} eyebrow={openThread?.status === "request" ? "Connection request" : "1:1 · screened"} title={openThread?.who || ""} accent={openThread?.accent || T.crimson}>
        {openThread && <Thread thread={openThread} onBlock={() => { setBlocked((b) => ({ ...b, [openThread.id]: true })); setOpenThread(null); }} />}
      </QuickActionSheet>

      {/* preferences — her choice over how she's reached */}
      <QuickActionSheet open={prefsOpen} onClose={() => setPrefsOpen(false)} eyebrow="Your choice" title="How you want to connect" accent={T.crimson} doneLabel="Save my choices" onDone={() => setPrefsOpen(false)}>
        <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.gold, margin: "0 0 8px" }}>I'm open to…</div>
        {[["open", "Messages + letters", "Women like me can ask to connect."], ["letters", "Sealed letters only", "Slow, one-way notes — no back-and-forth."], ["paused", "Paused for now", "Nothing reaches me; I can still read the rooms."]].map(([v, l, s]) => (
          <button key={v} onClick={() => setPrefs((p) => ({ ...p, mode: v }))} style={{ display: "block", width: "100%", textAlign: "left", background: prefs.mode === v ? `${T.crimson}14` : T.paper, border: `1px solid ${prefs.mode === v ? T.crimson : T.paperDeep}`, borderRadius: 12, padding: "11px 13px", marginBottom: 8, cursor: "pointer" }}>
            <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink, display: "block" }}>{l}</span>
            <span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>{s}</span>
          </button>
        ))}
        <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.gold, margin: "12px 0 8px" }}>Who can reach me</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {[["season", "women in my season"], ["stage", "women in my life-stage"], ["any", "any woman 18+"]].map(([v, l]) => (
            <button key={v} onClick={() => setPrefs((p) => ({ ...p, reach: v }))} style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, padding: "7px 12px", borderRadius: 999, background: prefs.reach === v ? `${T.crimson}1F` : T.paper, border: `1px solid ${prefs.reach === v ? T.crimson : T.paperDeep}`, color: prefs.reach === v ? T.crimson : T.inkSoft, cursor: "pointer" }}>{l}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", margin: "12px 0 0" }}>
          <MapPinOff size={15} color={T.sage} style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5 }}>Matching never uses location — only the season/stage you choose. You can block, report, or pause anyone, anytime.</span>
        </div>
      </QuickActionSheet>
    </>
  );
}

function Thread({ thread, onBlock }) {
  const [msgs, setMsgs] = useState(thread.msgs);
  const [draft, setDraft] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | checking
  const [accepted, setAccepted] = useState(thread.status !== "request");
  const send = () => {
    if (!draft.trim() || phase === "checking") return;
    setPhase("checking");
    setTimeout(() => { setMsgs((m) => [...m, { me: true, t: draft.trim() }]); setDraft(""); setPhase("idle"); }, 1300); // server screening before delivery
  };
  return (
    <div>
      <div style={{ maxHeight: 230, overflowY: "auto", marginBottom: 10, display: "flex", flexDirection: "column", gap: 7 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ alignSelf: m.me ? "flex-end" : "flex-start", maxWidth: "82%", background: m.me ? `${thread.accent}1F` : T.paper, border: `1px solid ${m.me ? thread.accent : T.paperDeep}`, borderRadius: 14, padding: "8px 12px", fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.45 }}>{m.t}</div>
        ))}
      </div>
      {!accepted ? (
        <>
          <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5, marginBottom: 10 }}>She asked to connect — matched on your season, no location shared. Her first line was checked before it reached you.</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setAccepted(true)} style={{ flex: 1, background: thread.accent, color: "#fff", border: "none", borderRadius: 12, padding: "12px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Accept &amp; reply</button>
            <button onClick={onBlock} style={{ background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "0 14px", fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, cursor: "pointer" }}>Decline</button>
          </div>
        </>
      ) : (
        <>
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={2} placeholder="Write back, gently…" disabled={phase === "checking"}
            style={{ width: "100%", boxSizing: "border-box", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "10px 12px", fontFamily: SERIF, fontSize: 16, color: T.ink, outline: "none", resize: "vertical" }} />
          <button onClick={send} disabled={!draft.trim() || phase === "checking"} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", marginTop: 10, background: draft.trim() ? thread.accent : T.paperDeep, color: "#fff", border: "none", borderRadius: 12, padding: "12px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: draft.trim() ? "pointer" : "default" }}>
            {phase === "checking" ? <><Clock size={15} /> Checking before it's sent…</> : <><Lock size={15} /> Send (screened)</>}
          </button>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 12 }}>
            <button onClick={onBlock} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", border: "none", cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted }}><Ban size={14} /> Block</button>
            <button onClick={onBlock} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", border: "none", cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted }}><Flag size={14} /> Report</button>
          </div>
        </>
      )}
    </div>
  );
}

// ── QOTD card with a moderated answer popup ───────────────────────────────────
function QotdCard() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [phase, setPhase] = useState("idle");
  const post = () => { if (!draft.trim()) return; setPhase("checking"); setTimeout(() => setPhase("posted"), 1200); };
  return (
    <FwCard accent={T.gold} Icon={MessageCircle} eyebrow="Question of the day" flower="sunflower" snap={false} width="100%" minHeight={0} idx="qotd"
      title="What's one small thing that got you through this week?"
      line="Answer anonymously alongside everyone else. A line is plenty."
      action={phase === "posted"
        ? <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: "#3f6b3f", display: "inline-flex", alignItems: "center", gap: 6 }}><Check size={15} /> Checked &amp; added</span>
        : <FwCardCTA accent={T.gold} onClick={() => setOpen(true)} icon={Feather}>Answer today's question</FwCardCTA>}>
      <QuickActionSheet open={open} onClose={() => { setOpen(false); setPhase("idle"); setDraft(""); }} eyebrow="Question of the day" title="A line is plenty…" accent={T.gold}>
        {phase === "posted" ? (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <FlowerGlyph variant="sunflower" size={46} color={T.gold} idx="qotd-done" />
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: T.ink, margin: "10px 0 4px" }}>Checked, and added to today's answers.</p>
          </div>
        ) : (
          <>
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} placeholder="A line is plenty…" disabled={phase === "checking"}
              style={{ width: "100%", boxSizing: "border-box", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 13px", fontFamily: SERIF, fontSize: 16, color: T.ink, outline: "none", resize: "vertical" }} />
            <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5, margin: "8px 0 0" }}>Anonymous. Crisis-checked + moderated before it appears — no names, kind-reactions only.</p>
            <button onClick={post} disabled={!draft.trim() || phase === "checking"} style={{ width: "100%", marginTop: 12, background: draft.trim() ? T.gold : T.paperDeep, color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{phase === "checking" ? "Checking…" : "Add my answer"}</button>
          </>
        )}
      </QuickActionSheet>
    </FwCard>
  );
}

function SafetyCharter() {
  const items = [["18+ only", ShieldCheck], ["No location, ever", MapPinOff], ["Checked before it's sent", Lock], ["Anonymous · block anytime", Users]];
  return (
    <div style={{ maxWidth: 600, margin: "16px auto 0", padding: "0 16px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center" }}>
        {items.map(([t, Icon]) => (
          <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "6px 12px" }}><Icon size={14} color={T.sage} /> {t}</span>
        ))}
      </div>
    </div>
  );
}

function CommunityRedesign() {
  const navigate = useNavigate();
  const reso = pickDaily(RESONANCE, "resonance");
  const recs = [
    { Icon: MessageCircle, label: "A new message", text: "A woman in your season wrote — checked, and waiting", onClick: () => {} },
    { Icon: Feather, label: "Question of the day", text: "What got you through this week?", onClick: () => {} },
    { Icon: Coffee, label: "The Lounge", text: "Someone's venting about exactly your week", onClick: () => {} },
    { Icon: Mail, label: "A sealed letter", text: "One found you — break the seal when you're ready", onClick: () => {} },
  ];
  return (
    <CardDemoPage label="Demo · Community redesign + Connection · for approval"
      hero={{ title: "Community", bloom: "cosmos", colorway: "sage", flankL: "clover", flankR: "sunflower", creature: "bee",
        line: "You're among women like you. Rooms for every part of life, and — new — gentle, screened, 1:1 connection. Anonymous, 18+, never by location." }}>
      <GrowthStyles />
      <DemoSummary><SummaryCard eyebrow="In the community today" rows={recs} /></DemoSummary>
      <SafetyCharter />

      <div style={{ marginTop: 18 }}>
        <ClipboardSlider hint="Slide through the community →" accent={T.gold}>
          {/* BOARD 1 — CONNECTION (the fold-in) */}
          <Clipboard title="Connection" sub="gentle · screened · your choice" accent={T.crimson} flower="rose" idx="cb-conn">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <MessagesCard />
              <FwCard accent="#8E6E8E" Icon={Mail} eyebrow="Sealed-letter pen-pal" flower="dahlia" snap={false} width="100%" minHeight={0} idx="penpal-door"
                title="Write a sealed letter to a woman like you" line="Slow, one-way, anonymous — checked, then delivered in her time. Break the seal on letters that find you."
                action={<FwCardCTA accent="#8E6E8E" onClick={() => navigate(createPageUrl("PenPalDemo"))} icon={Feather}>Open the pen-pal</FwCardCTA>}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 6px" }}><WaxSeal flower="dahlia" /><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>sealed · checked · delivered</span></div>
              </FwCard>
              <FwCard accent="#8FAF8F" Icon={Heart} eyebrow="Someone like you" flower="clover" snap={false} width="100%" minHeight={0} idx="reso-door"
                title={reso.line} line={reso.sub}
                action={<span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>Anonymous · no contact · just company</span>} />
            </div>
          </Clipboard>

          {/* BOARD 2 — THE ROOMS (every whole-life room kept) */}
          <Clipboard title="The rooms" sub="every part of life · one room each" accent={T.gold} flower="sunflower" idx="cb-rooms">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <QotdCard />
              <FwCard accent="#5F7E8E" Icon={Waves} eyebrow="Echo wall" flower="cornflower" snap={false} width="100%" minHeight={0} idx="echo"
                title="Leave a line that fades in 48 hours" line="Anonymous, ephemeral — say it, let it go. Kind reactions only."
                action={<FwCardCTA accent="#5F7E8E" onClick={() => {}} icon={Feather}>Leave an echo</FwCardCTA>} />
              <div>
                <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.gold, padding: "0 2px 8px" }}>Whole-life rooms</div>
                <CardDeck accent={T.gold} peek>
                  {ROOMS.map((d) => <div key={d.key} style={{ width: 300, flex: "0 0 300px" }}><DoorCard d={d} onEnter={() => {}} /></div>)}
                </CardDeck>
              </div>
            </div>
          </Clipboard>

          {/* BOARD 3 — TOGETHER (circles, clubs, games, wisdom, pool, close-week) */}
          <Clipboard title="Together" sub="circles · clubs · games · rituals" accent="#8FAF8F" flower="lavender" idx="cb-together">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {TOGETHER.map((d) => <DoorCard key={d.key} d={d} onEnter={() => {}} />)}
              <FwCard accent="#8E6E8E" Icon={HandHeart} eyebrow="Talk it out · Witness" flower="violet" snap={false} width="100%" minHeight={0} idx="witness"
                title="Be held by one matched sister" line="Hand one hard moment to a woman in your season — anonymous, encrypted, one gentle reply. (Lives in your Journal.)"
                action={<FwCardCTA accent="#8E6E8E" onClick={() => navigate(createPageUrl("Journal") + "?open=witness")} icon={HandHeart}>Open Witness</FwCardCTA>} />
            </div>
          </Clipboard>
        </ClipboardSlider>
      </div>

      <HeldFlag title="Demo — for your approval (rails baked in)" lines={[
        "BUILT: the v4 redesign (flora hero · summary card · clipboard slider · rich cards · quick-action popups) carrying EVERY live surface — QOTD · Echo · the 9 rooms · Circles · Library/Clubs · Games · Wisdom · Pool · Close-the-week · Witness — nothing stripped. Plus the CONNECTION fold-in: moderated 1:1 messaging (screened before delivery · request-to-connect · preferences · block/report) + sealed-letter pen-pal + resonance.",
        "RAILS (non-negotiable, shown throughout): 18+ only (the real AgeGate gates this whole page) · NO location ever (matched by season/life-stage only) · BACKEND moderation (every message/answer goes through a 'checked before it's sent' step → delivered).",
        "LIVE wiring = NO new function: rides screenContent (OpenAI moderation) + createCommunityPost/answerQotd (rooms/QOTD) + the Witness service path (postWitnessRequest/respondWitness) for 1:1. New ENTITY only (a screened message/thread row). If a true multi-turn thread with strict pre-delivery gating proves to need a dedicated function beyond chaining Witness, I'll STOP and report before going live. Demo is seeded — nothing written.",
      ]} />
    </CardDemoPage>
  );
}

export default function CommunityV4Demo() {
  const navigate = useNavigate();
  return (
    <AgeGate surfaceName="the Community" onDecline={() => navigate(createPageUrl("Ideas"))}>
      <CommunityRedesign />
    </AgeGate>
  );
}
