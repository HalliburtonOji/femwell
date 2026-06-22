// PenPalDemo — the GATED Phase-2 connection tier, DEMO-FIRST (preview only, seeded).
// Halli set the safety dials (2026-06-22): 18+ ONLY · NO LOCATION ever · BACKEND
// MODERATION (moderated before content reaches another woman). This demo shows the
// two recommended 1:1/low-pressure surfaces, gentle + async (the warm path = the
// safe path):
//   1) the moderated async SEALED-LETTER PEN-PAL (Sealed Letters + the slow model)
//   2) moderated THEMED PROMPT ROOMS (write → checked → appears anonymously)
//
// SAFETY BAKED IN + VISIBLE:
//   • Wrapped in the real <AgeGate> (18+ self-declaration gate) — no content shows first.
//   • Matching is season / life-stage / language ONLY — there is NO location anywhere
//     (mirrors the existing Witness Mode dims). Stated on every compose screen.
//   • Every letter/answer is shown going through a "checked before it's sent" step —
//     representing the SERVER-SIDE moderation the live build will ride (screenContent
//     OpenAI moderation + the crisis floor + human-review queue), and the Witness
//     service-write pattern (anonymous, server-gated, no plaintext) for the pen-pal.
//   • Anonymous — no profiles, no handles, no real-time. Gentle gates (hold a few /
//     one a day) + report/block, per Witness Mode.
//
// NO NEW FUNCTION: the live tier rides existing moderated writes — screenContent /
// createCommunityPost / answerQotd (rooms) and the postWitnessRequest/respondWitness
// service path (pen-pal). This demo is front-end + seeded; nothing is written.
// Does NOT touch flora.jsx / BRAND_IDENTITY.md. Live Community/Journal untouched.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ShieldCheck, MessageCircle, Feather, Check, Clock, MapPinOff, EyeOff } from "lucide-react";
import { createPageUrl } from "@/utils";
import { T, UI, SERIF } from "@/components/journal/Editorial";
import { FwCard, FwCardCTA, FwCardRow, SummaryCard } from "@/components/brand/Card";
import { FlowerGlyph } from "@/components/brand/flora";
import { CardDemoPage, DemoSummary } from "@/components/demos/cardDemoKit";
import { GrowthStyles, QuickActionSheet, HeldFlag, PROMPT_ROOMS } from "@/components/demos/growthKit";
import AgeGate from "@/components/safety/AgeGate";

// Match dimensions — season/life-stage/language ONLY. NO LOCATION (by design).
const MATCH = { season: "luteal — your inner autumn", stage: "in the thick of work + life", language: "English (UK)" };

// Seeded received letters (anonymous; from "a woman like you", matched on season/stage).
const RECEIVED = [
  { id: "l1", from: "a woman in her luteal season", flower: "dahlia", accent: "#8E6E8E", preview: "I don't know who you are, but it's been a heavy week and I wanted to write it down for someone who'd just… get it.",
    body: "I don't know who you are, but it's been a heavy week and I wanted to write it down for someone who'd just… get it. Work has been relentless and I've been short with everyone I love. I keep thinking I should be coping better. Anyway — if you're reading this, you're a stranger who somehow feels less like one. I hope your week is gentler than mine. You don't have to write back. It helped just to send it." },
  { id: "l2", from: "a woman starting something new", flower: "snowdrop", accent: "#8FAF8F", preview: "Tiny brave thing today: I applied for the thing. Thought a sister-in-waiting should know.",
    body: "Tiny brave thing today: I applied for the thing. The one I've talked myself out of for two years. My hands were shaking. I don't have anyone to tell who wouldn't make it A Whole Conversation, so I'm telling you — a kind stranger somewhere in her own season. That's all. Wish me luck, or don't. Either way, it's out there now." },
];

const GENTLE_REPLIES = ["Holding this with you", "Me too, more than you know", "You're not alone in it", "I hope your week is gentler"];

// A wax-seal motif (crimson disc + a meaning-flower) — the "sealed letter" object.
function WaxSeal({ flower = "rose", size = 40 }) {
  return (
    <span style={{ position: "relative", width: size, height: size, display: "inline-grid", placeItems: "center", flexShrink: 0 }}>
      <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, ${T.crimson} 0%, #8E1F1A 100%)`, boxShadow: "inset 0 1px 2px rgba(255,255,255,0.3), 0 1px 3px rgba(0,0,0,0.25)" }} />
      <span style={{ position: "relative", zIndex: 1, lineHeight: 0, opacity: 0.92 }}><FlowerGlyph variant={flower} size={size * 0.6} color="#F4D9DC" color2="#fff" idx={`seal-${flower}`} /></span>
    </span>
  );
}

// ── The "kept safe" panel — the safety model, stated plainly ──────────────────
function SafetyPanel() {
  const rows = [
    { Icon: ShieldCheck, t: "18+ only", s: "You confirmed you're an adult to be here. Under-18s never reach this space." },
    { Icon: MapPinOff, t: "No location, ever", s: "Women are matched by season, life-stage and language — never by where you are. No map, no distance, nothing." },
    { Icon: Lock, t: "Checked before it's sent", s: "Every letter and answer is moderated server-side before it reaches another woman. Harmful content never arrives." },
    { Icon: EyeOff, t: "Anonymous & async", s: "No profiles, no handles, no real-time chat. Slow letters, in your own time. Hold a few before you send; one a day." },
  ];
  return (
    <div style={{ maxWidth: 600, margin: "18px auto 0", padding: "0 16px" }}>
      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${T.sage}`, borderRadius: 18, padding: "16px 16px 8px" }}>
        <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.sage, marginBottom: 10 }}>How this is kept safe</div>
        {rows.map((r) => (
          <div key={r.t} style={{ display: "flex", gap: 11, padding: "8px 0", borderBottom: `1px solid ${T.paperDeep}66` }}>
            <r.Icon size={18} color={T.gold} style={{ flexShrink: 0, marginTop: 2 }} />
            <div><div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink }}>{r.t}</div><div style={{ fontFamily: UI, fontSize: 13, color: T.muted, lineHeight: 1.5 }}>{r.s}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Compose / read a sealed letter — moderation shown as a "checking" step ─────
function ModerationNote() {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "9px 12px", margin: "10px 0" }}>
      <Lock size={15} color={T.sage} style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5 }}>Matched by <b>season &amp; life-stage only — never location</b>. Every letter is <b>checked before it reaches her</b>.</span>
    </div>
  );
}

function PenPalSection() {
  const [composeOpen, setComposeOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | checking | sent
  const [openLetter, setOpenLetter] = useState(null);
  const [replied, setReplied] = useState({});

  const send = () => {
    if (!draft.trim()) return;
    setPhase("checking");
    setTimeout(() => setPhase("sent"), 1400); // represents server-side moderation before delivery
  };
  const reset = () => { setComposeOpen(false); setDraft(""); setPhase("idle"); };

  return (
    <>
      <FwCardRow label="Sealed letters — to a woman like you" Icon={Mail} accent={T.crimson} items={[{ id: "compose" }, ...RECEIVED]}
        render={(it) => it.id === "compose"
          ? <FwCard key="compose" accent={T.crimson} Icon={Feather} eyebrow="Write one" flower="rose" title="A sealed letter to a woman like you"
              line="Say the thing you can't say to anyone who knows you. Matched by your season — never your location. She gets it once it's been checked." idx="penpal-compose"
              action={<FwCardCTA accent={T.crimson} onClick={() => setComposeOpen(true)} icon={Feather}>Write a sealed letter</FwCardCTA>} />
          : <FwCard key={it.id} accent={it.accent} Icon={Mail} eyebrow="A letter found you" flower={it.flower} title={it.from}
              line={it.preview} idx={`penpal-${it.id}`}
              action={<FwCardCTA accent={it.accent} onClick={() => setOpenLetter(it)} icon={Mail}>{replied[it.id] ? "Read again" : "Break the seal"}</FwCardCTA>}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 8px" }}>
                <WaxSeal flower={it.flower} size={34} />
                <span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>{replied[it.id] ? "you replied" : "sealed · checked · delivered to you"}</span>
              </div>
            </FwCard>} />

      {/* COMPOSE — the §6.7.6 quick-action sheet (now portaled, clean) */}
      <QuickActionSheet open={composeOpen} onClose={reset} eyebrow="Write · a sealed letter" title="To a woman like you" accent={T.crimson}>
        {phase === "sent" ? (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <WaxSeal flower="rose" size={56} />
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: T.ink, margin: "12px 0 6px", lineHeight: 1.4 }}>Sealed. It's being checked — then it'll find her.</p>
            <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5 }}>She'll receive it in her own time. No rush, no read-receipts. You can write your next one tomorrow.</p>
            <button onClick={reset} style={{ marginTop: 14, background: T.crimson, color: "#fff", border: "none", borderRadius: 12, padding: "12px 20px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Lovely</button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10 }}>
              {[["season", MATCH.season], ["stage", MATCH.stage], ["language", MATCH.language]].map(([k, v]) => (
                <span key={k} style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, padding: "5px 11px", borderRadius: 999, background: `${T.sage}1F`, border: `1px solid ${T.sage}`, color: T.muted }}>{v}</span>
              ))}
            </div>
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={5} placeholder="Dear stranger,&#10;&#10;The thing I can't say out loud is…"
              disabled={phase === "checking"}
              style={{ width: "100%", boxSizing: "border-box", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "12px 14px", fontFamily: SERIF, fontSize: 16, color: T.ink, outline: "none", resize: "vertical", lineHeight: 1.5 }} />
            <ModerationNote />
            <button onClick={send} disabled={!draft.trim() || phase === "checking"} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", background: draft.trim() ? T.crimson : T.paperDeep, color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: draft.trim() ? "pointer" : "default" }}>
              {phase === "checking" ? <><Clock size={15} /> Checking before it's sent…</> : <><Lock size={15} /> Seal &amp; send</>}
            </button>
          </>
        )}
      </QuickActionSheet>

      {/* READ a received letter + gentle moderated reply */}
      <QuickActionSheet open={!!openLetter} onClose={() => setOpenLetter(null)} eyebrow="A sealed letter" title={openLetter?.from || ""} accent={openLetter?.accent || T.crimson}>
        {openLetter && (
          <ReadLetter letter={openLetter} alreadyReplied={!!replied[openLetter.id]} onReplied={() => { setReplied((r) => ({ ...r, [openLetter.id]: true })); setOpenLetter(null); }} />
        )}
      </QuickActionSheet>
    </>
  );
}

function ReadLetter({ letter, alreadyReplied, onReplied }) {
  const [phase, setPhase] = useState("read"); // read | checking | done
  const reply = () => { setPhase("checking"); setTimeout(() => { setPhase("done"); setTimeout(onReplied, 900); }, 1200); };
  return (
    <div>
      <div style={{ background: "#FBF6E6", border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "14px 15px", marginBottom: 12 }}>
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>{letter.body}</p>
      </div>
      {alreadyReplied ? (
        <p style={{ fontFamily: UI, fontSize: 13, color: "#3f6b3f", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}><Check size={15} /> You sent her a line back.</p>
      ) : phase === "done" ? (
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: T.ink }}>Sent — once it's checked, she'll know she's not alone.</p>
      ) : (
        <>
          <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.gold, marginBottom: 8 }}>Send a gentle line back</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {GENTLE_REPLIES.map((g) => (
              <button key={g} disabled={phase === "checking"} onClick={reply} style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, padding: "8px 13px", borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`, color: T.inkSoft, cursor: "pointer" }}>{g}</button>
            ))}
          </div>
          <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5, marginTop: 10 }}>{phase === "checking" ? "Checking your reply before it reaches her…" : "Or write your own — every reply is checked before it's delivered. You can also report or block, always."}</p>
        </>
      )}
    </div>
  );
}

// ── Moderated themed prompt rooms ─────────────────────────────────────────────
function RoomCard({ room }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | checking | posted
  const post = () => { if (!draft.trim()) return; setPhase("checking"); setTimeout(() => setPhase("posted"), 1300); };
  const reset = () => { setOpen(false); setDraft(""); setPhase("idle"); };
  return (
    <FwCard accent={room.accent} Icon={MessageCircle} eyebrow={`Prompt room · ${room.domain}`} flower={room.flower} title={room.prompt}
      line={`${room.count} women have answered this week. Async, anonymous, reactions only — no DMs, no profiles, no location.`} idx={`room-${room.id}`}
      action={phase === "posted"
        ? <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: "#3f6b3f", display: "inline-flex", alignItems: "center", gap: 6 }}><Check size={15} /> Checked &amp; added to the room</span>
        : <FwCardCTA accent={room.accent} onClick={() => setOpen(true)} icon={Feather}>Answer in the room</FwCardCTA>}>
      <div style={{ background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "9px 12px", margin: "2px 0 10px" }}>
        <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: room.accent, marginBottom: 4 }}>A few anonymous answers</div>
        {room.answers.map((a, i) => <p key={i} style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft, margin: "0 0 5px", lineHeight: 1.4 }}>“{a}”</p>)}
      </div>
      <QuickActionSheet open={open} onClose={reset} eyebrow={`Prompt room · ${room.domain}`} title={room.prompt} accent={room.accent}>
        {phase === "posted" ? (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <FlowerGlyph variant={room.flower} size={48} color={room.accent} idx={`room-done-${room.id}`} />
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: T.ink, margin: "10px 0 4px" }}>Checked, and added to the room.</p>
            <p style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>Posted anonymously alongside everyone answering the same prompt.</p>
            <button onClick={reset} style={{ marginTop: 12, background: room.accent, color: "#fff", border: "none", borderRadius: 12, padding: "11px 20px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Done</button>
          </div>
        ) : (
          <>
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} placeholder="Your answer, anonymously…" disabled={phase === "checking"}
              style={{ width: "100%", boxSizing: "border-box", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 13px", fontFamily: SERIF, fontSize: 16, color: T.ink, outline: "none", resize: "vertical" }} />
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", margin: "8px 0 0" }}>
              <Lock size={15} color={T.sage} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5 }}>Checked before it appears. No names, no 1:1, no location — kind-reactions only.</span>
            </div>
            <button onClick={post} disabled={!draft.trim() || phase === "checking"} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", marginTop: 12, background: draft.trim() ? room.accent : T.paperDeep, color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: draft.trim() ? "pointer" : "default" }}>
              {phase === "checking" ? <><Clock size={15} /> Checking before it appears…</> : <><Check size={15} /> Add to the room</>}
            </button>
          </>
        )}
      </QuickActionSheet>
    </FwCard>
  );
}

function GatedConnection() {
  const recs = [
    { Icon: Mail, label: "Sealed-letter pen-pal", text: "Write to a woman like you — checked, then delivered, in her own time", onClick: () => {} },
    { Icon: MessageCircle, label: "Prompt rooms", text: "Answer the same gentle prompt as everyone — moderated, anonymous", onClick: () => {} },
    { Icon: ShieldCheck, label: "How it's kept safe", text: "18+, no location ever, every message checked before it's sent", onClick: () => {} },
  ];
  return (
    <CardDemoPage label="Demo · Gated 1:1 connection (Phase 2) · for approval"
      hero={{ title: "Letters between women", bloom: "rose", colorway: "crimson", flankL: "snowdrop", flankR: "dahlia", creature: "bee",
        line: "The gentle, moderated, anonymous way to feel less alone — sealed letters to a woman like you, and shared prompt rooms. 18+, no location, every word checked first." }}>
      <GrowthStyles />
      <DemoSummary><SummaryCard eyebrow="Two gentle ways to connect" rows={recs} /></DemoSummary>
      <SafetyPanel />
      <PenPalSection />
      <FwCardRow label="Moderated prompt rooms" Icon={MessageCircle} accent={T.gold} items={PROMPT_ROOMS} render={(r) => <RoomCard key={r.id} room={r} />} />
      <HeldFlag title="Still held — needs further sign-off beyond this" lines={[
        "BUILT in this demo (your dials applied): moderated async sealed-letter pen-pal + moderated themed prompt rooms — 18+ gated, NO location, every message checked server-side before it reaches anyone, anonymous + async.",
        "NOT enabled: open public-scale matching, real-time DMs, or profiles. Those stay off without further sign-off from you.",
        "Live build rides EXISTING moderated functions (screenContent + createCommunityPost for rooms; the Witness service path postWitnessRequest/respondWitness for the pen-pal) — no new function. New entities only (a cross-user sealed-letter row). Approve this demo and I wire it live.",
      ]} />
    </CardDemoPage>
  );
}

export default function PenPalDemo() {
  const navigate = useNavigate();
  return (
    <AgeGate surfaceName="Letters between women" onDecline={() => navigate(createPageUrl("Ideas"))}>
      <GatedConnection />
    </AgeGate>
  );
}
