// CommunityDemo4 — "One entry, four lives + Witness" (Community design demo)
// ─────────────────────────────────────────────────────────────────────────────
// The unified entry-level chooser. A single whole-life reflection — not only a
// clinical note — and the decision of what becomes of it, made HERE, at the entry
// level, never by default. Four lives: stay locked · become an echo · be sealed ·
// handed to a witness. Choosing "witness" flows into the full Witness mini-flow:
// the held-3 gate · the 6-rail charter · matching → held with a 2h cancel · and
// the receiver face (no-copy locked entry + the 4 fixed responses or pass silently).
//
// The dark-plum "trust-ink" gradient is reserved for the fragile Witness surfaces
// only — never an ordinary card (the fragile-surface rule).
//
// Self-contained, mock data only, no entities. UK voice, no emoji, Lucide only.
import { useState } from "react";
import {
  Lock, Waves, Mail, HeartHandshake, ArrowRight, Check, Send, EyeOff,
  ShieldCheck, BookOpen, Clock,
} from "lucide-react";
import {
  T, SERIF, UI, Eyebrow, Script, Hand, InkFilter, EditorialFooter,
  useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";

// the dark plum trust-ink gradient (reserved for fragile Witness surfaces only)
const PLUM = "linear-gradient(165deg, #2E2230 0%, #3A2233 55%, #241A26 100%)";
const PLUM_INK = "#F0E4EC";
const PLUM_SOFT = "rgba(240,228,236,0.62)";

const ENTRY =
  "A hard week. Work kept asking for the version of me that never falters, and I kept handing it over until there was little left for myself. Then Priya rang — out of nowhere, just to say she'd been thinking of me — and I cried in the kitchen. Not sad crying. The kind that comes when someone reaches you before you've asked.";

const FIXED_RESPONSES = [
  "I'm holding this with you.",
  "Me too.",
  "You're not alone in this.",
  "I hear you.",
];

const CHARTER = [
  ["Anonymous", "She sees the entry, your phase and life stage — never a handle, a photo, or a place."],
  ["One-shot", "One read, one fixed line back. No DM, no follow, no re-view. Then it seals again."],
  ["Cancel before she reads", "A two-hour window. Pull it back and it re-seals — she never knew."],
  ["Not for crisis → support", "Anything heavy routes to Panic Mode and trained resources, never to a peer."],
  ["No names → Jess scrubs", "If Jess detects an identifying detail, she asks you to edit before it sends."],
  ["You choose her shape", "Default is your phase and life stage. Tighten or loosen the match."],
];

const LIVES = [
  {
    id: "lock", icon: Lock, title: "Stay locked", tag: "Default",
    line: "Lives in your Journal, under your key.",
    preview: "Nothing leaves your device. This is what happens if you choose nothing — silence is the safe default, never a share.",
  },
  {
    id: "echo", icon: Waves, title: "Become an echo",
    line: "One scrubbed line to the wall — fades in 48h.",
    preview: "Jess offers a single line, identifying details removed, and sets it among sisters in your phase. No handle, no thread. It fades two days after it lands.",
  },
  {
    id: "seal", icon: Mail, title: "Be sealed",
    line: "A letter to future-you, opened on a date.",
    preview: "It locks until a day you set. No one else can read it. On that morning it opens — your own voice, returned to you across the months.",
  },
  {
    id: "witness", icon: HeartHandshake, title: "Handed to a witness",
    line: "One matched sister reads it once.",
    preview: "One sister in your phase reads the whole entry, once. She answers in four lines — or stays silent. Never a conversation.",
  },
];

export default function CommunityDemo4() {
  useEditorialFonts();
  const [chosen, setChosen] = useState(null);   // null · lock · echo · seal · witness
  const [inWitness, setInWitness] = useState(false);

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 60 }}>
      <InkFilter />
      <DemoBanner label="Community · One entry, four lives — design demo · mock data" />

      <div style={{ maxWidth: 430, margin: "0 auto", padding: "26px 20px 0" }}>
        {/* masthead */}
        <header style={{ textAlign: "center", marginBottom: 18 }}>
          <Eyebrow mb={10} color={T.muted}>The entry-level chooser</Eyebrow>
          <Script size={48} carve>One entry, four lives</Script>
          <Hand size={19} carve style={{ display: "block", margin: "12px auto 0", maxWidth: 380, color: T.inkSoft }}>
            what happens to a reflection — you decide, at the entry level, never by default
          </Hand>
        </header>

        {/* the sample entry (whole life, not only clinical) */}
        <article style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 16, padding: "20px 20px 16px", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 11 }}>
            <Eyebrow color={T.muted}>From your Journal · Thursday</Eyebrow>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999, background: `${T.sage}22` }}>
              <span style={{ width: 5, height: 5, borderRadius: 999, background: T.sage }} />
              <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: T.sage }}>luteal · gentle</span>
            </span>
          </div>
          <p style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.66, color: T.ink, margin: 0 }}>{ENTRY}</p>
        </article>

        {/* the four-lives chooser */}
        {!inWitness && (
          <>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: 1.3, textTransform: "uppercase", color: T.muted, margin: "0 0 12px", textAlign: "center" }}>
              Choose its life
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {LIVES.map((l) => (
                <LifeOption key={l.id} life={l} active={chosen === l.id} onPick={() => setChosen(l.id)} />
              ))}
            </div>

            {/* witness entry button — only when witness is chosen */}
            {chosen === "witness" && (
              <button onClick={() => setInWitness(true)} style={{ ...solidBtn, width: "100%", justifyContent: "center", marginTop: 14, padding: "13px 0" }}>
                Begin the witness flow <ArrowRight size={15} />
              </button>
            )}
          </>
        )}

        {/* the witness mini-flow */}
        {inWitness && <WitnessFlow onBack={() => { setInWitness(false); setChosen("witness"); }} />}

        <div style={{ marginTop: 30 }}><EditorialFooter /></div>
      </div>
    </div>
  );
}

// ── one life option (tap → preview) ──────────────────────────────────────────
function LifeOption({ life, active, onPick }) {
  const Icon = life.icon;
  const fragile = life.id === "witness";
  return (
    <div>
      <button onClick={onPick} style={{
        width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 13,
        padding: "14px 16px", borderRadius: 14, cursor: "pointer",
        background: active ? `${T.gold}14` : T.paperHi,
        border: `1px solid ${active ? T.gold : T.paperDeep}`,
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: 999, flexShrink: 0, background: active ? `${T.gold}22` : T.paper, border: `1px solid ${active ? T.gold : T.paperDeep}` }}>
          <Icon size={18} color={active ? T.gold : T.inkSoft} />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: SERIF, fontSize: 17, color: T.ink }}>{life.title}</span>
            {life.tag && (
              <span style={{ fontFamily: UI, fontSize: 9, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", color: T.muted, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "1px 7px" }}>{life.tag}</span>
            )}
          </span>
          <span style={{ display: "block", fontFamily: UI, fontSize: 12, color: T.inkSoft, marginTop: 3, lineHeight: 1.4 }}>{life.line}</span>
        </span>
        {active && <Check size={17} color={T.gold} style={{ flexShrink: 0 }} />}
      </button>

      {/* preview revealed under the chosen option */}
      {active && (
        fragile ? (
          <div style={{ background: PLUM, borderRadius: 14, padding: "14px 16px", marginTop: 8, border: "1px solid rgba(240,228,236,0.12)", boxShadow: "0 8px 26px rgba(36,26,38,0.30)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
              <EyeOff size={13} color={T.gold} />
              <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", color: PLUM_SOFT }}>A fragile handover</span>
            </div>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: PLUM_INK, lineHeight: 1.55, margin: 0 }}>{life.preview}</p>
          </div>
        ) : (
          <div style={{ borderLeft: `2px solid ${T.gold}`, padding: "8px 0 8px 14px", margin: "8px 0 0 6px" }}>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.inkSoft, lineHeight: 1.55, margin: 0 }}>{life.preview}</p>
          </div>
        )
      )}
    </div>
  );
}

// ── the Witness mini-flow (gate → charter → matching → held → receiver) ───────
function WitnessFlow({ onBack }) {
  const [held] = useState(2);                       // held-3 gate progress
  const [stage, setStage] = useState("gate");       // gate · charter · matching · held · receiver
  const [chosenLine, setChosenLine] = useState(null);
  const [sealed, setSealed] = useState(false);
  const unlocked = held >= 3;

  return (
    <div>
      {/* held-3 gate */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 15px", border: `1px solid ${T.paperDeep}`, borderRadius: 13, marginBottom: 14, background: T.paperHi }}>
        <div style={{ display: "flex", gap: 5 }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 9, height: 9, borderRadius: 999, background: i < held ? T.gold : T.paperDeep }} />
          ))}
        </div>
        <span style={{ fontFamily: UI, fontSize: 12, color: T.inkSoft, lineHeight: 1.45 }}>
          {unlocked
            ? "You can hand yours to a witness — you've been held three times."
            : `You've held ${held}, one more to unlock. Witnessing is something you earn by being held first.`}
        </span>
      </div>

      {stage === "gate" && (
        <PlumCard>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
            <Send size={18} color={T.gold} />
            <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase", color: PLUM_SOFT }}>Hand this to one sister?</span>
          </div>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, color: PLUM_INK, lineHeight: 1.5, margin: "0 0 16px" }}>
            One witness, matched in your phase. She reads it once, answers in four lines or stays silent. You can cancel before she reads.
          </p>
          <button onClick={() => setStage("charter")} style={plumBtn}>
            Read the charter <ArrowRight size={15} />
          </button>
        </PlumCard>
      )}

      {stage === "charter" && (
        <PlumCard>
          <Eyebrow mb={12} color={T.gold}>The witness charter · read once</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {CHARTER.map(([h, b]) => (
              <div key={h} style={{ display: "flex", gap: 11 }}>
                <ShieldCheck size={16} color={T.gold} style={{ flexShrink: 0, marginTop: 3 }} />
                <div>
                  <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: PLUM_INK }}>{h}</div>
                  <div style={{ fontFamily: UI, fontSize: 12, color: PLUM_SOFT, lineHeight: 1.5, marginTop: 2 }}>{b}</div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setStage("matching")} style={{ ...plumBtn, marginTop: 18 }}>I understand — match me <ArrowRight size={15} /></button>
        </PlumCard>
      )}

      {stage === "matching" && (
        <PlumCard>
          <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
            <Pulse />
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: PLUM_INK, marginTop: 14 }}>A sister is being matched…</div>
            <div style={{ fontFamily: UI, fontSize: 12, color: PLUM_SOFT, marginTop: 8, lineHeight: 1.5 }}>
              Same phase, same life stage. No profile is read. No handle is exchanged.
            </div>
            <button onClick={() => setStage("held")} style={{ ...plumBtn, margin: "16px auto 0" }}>Skip the wait (demo)</button>
          </div>
        </PlumCard>
      )}

      {stage === "held" && (
        <PlumCard>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
            <ShieldCheck size={18} color={T.gold} />
            <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase", color: PLUM_SOFT }}>Held</span>
          </div>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, color: PLUM_INK, lineHeight: 1.5, margin: "0 0 14px" }}>
            One sister is holding your entry now. You'll see only her chosen line — never her name.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: UI, fontSize: 12, color: PLUM_SOFT, marginBottom: 16 }}>
            <Clock size={13} color={T.gold} /> Cancel any time in the next two hours and it re-seals.
          </div>
          <button onClick={() => setStage("receiver")} style={plumBtn}>See how she receives it <ArrowRight size={15} /></button>
        </PlumCard>
      )}

      {stage === "receiver" && (
        sealed ? (
          <PlumCard>
            <div style={{ textAlign: "center", padding: "6px 0" }}>
              <Lock size={22} color={T.gold} />
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: PLUM_INK, lineHeight: 1.5, margin: "12px 0 4px" }}>
                {chosenLine ? "Her line was passed to you. The entry has sealed again." : "She passed in silence. You'll never know she read it."}
              </p>
              <div style={{ fontFamily: UI, fontSize: 12, color: PLUM_SOFT, marginTop: 8 }}>It leaves no history, on either side.</div>
              <button onClick={onBack} style={{ ...plumBtn, margin: "16px auto 0" }}>Back to the chooser</button>
            </div>
          </PlumCard>
        ) : (
          <div>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: 1.3, textTransform: "uppercase", color: T.muted, margin: "0 0 11px", textAlign: "center" }}>
              The receiver's view
            </div>
            {/* no-copy locked entry */}
            <article style={{ position: "relative", background: PLUM, color: PLUM_INK, border: "1px solid rgba(240,228,236,0.14)", borderRadius: 16, padding: "20px 20px 16px", marginBottom: 16, userSelect: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 11 }}>
                <Lock size={13} color={T.gold} />
                <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", color: PLUM_SOFT }}>One read · no copy · no screenshot · luteal · reproductive</span>
              </div>
              <p style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.66, margin: 0 }}>{ENTRY}</p>
            </article>

            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: 1.3, textTransform: "uppercase", color: T.muted, margin: "0 0 11px", textAlign: "center" }}>
              Choose one line — never your own words
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 14 }}>
              {FIXED_RESPONSES.map((r) => (
                <button key={r} onClick={() => setChosenLine(r)} style={{
                  textAlign: "left", padding: "13px 16px", borderRadius: 13, cursor: "pointer",
                  background: chosenLine === r ? `${T.gold}1F` : T.paperHi,
                  border: `1px solid ${chosenLine === r ? T.gold : T.paperDeep}`,
                  fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: T.ink,
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  {chosenLine === r ? <Check size={16} color={T.gold} /> : <span style={{ width: 16 }} />}
                  {r}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 9 }}>
              <button onClick={() => { setChosenLine(null); setSealed(true); }} style={{ ...ghostBtn, flex: 1, justifyContent: "center", padding: "12px 0" }}>Pass silently</button>
              <button onClick={() => setSealed(true)} disabled={!chosenLine} style={{ ...solidBtn, flex: 2, justifyContent: "center", opacity: chosenLine ? 1 : 0.4 }}>
                <Send size={14} /> Send this line
              </button>
            </div>
          </div>
        )
      )}

      {/* back out of the flow */}
      {stage !== "receiver" && (
        <button onClick={onBack} style={{ ...ghostBtn, width: "100%", justifyContent: "center", marginTop: 14 }}>
          <BookOpen size={14} /> Back to the four lives
        </button>
      )}
    </div>
  );
}

// ── shared bits ──────────────────────────────────────────────────────────────
function PlumCard({ children }) {
  return (
    <div style={{ background: PLUM, borderRadius: 18, padding: "20px 20px", boxShadow: "0 10px 34px rgba(36,26,38,0.34)", border: "1px solid rgba(240,228,236,0.12)" }}>
      {children}
    </div>
  );
}
function Pulse() {
  return (
    <span style={{ display: "inline-flex", position: "relative", width: 46, height: 46 }}>
      <span style={{ position: "absolute", inset: 0, borderRadius: 999, background: `${T.gold}33`, animation: "fwpulse 1.8s ease-out infinite" }} />
      <span style={{ position: "absolute", inset: 14, borderRadius: 999, background: T.gold }} />
      <style>{"@keyframes fwpulse{0%{transform:scale(.6);opacity:.8}100%{transform:scale(1.5);opacity:0}}"}</style>
    </span>
  );
}
function DemoBanner({ label }) {
  return (
    <div style={{ background: T.ink, color: T.paper, padding: "8px 16px", textAlign: "center", fontFamily: UI, fontSize: 10, letterSpacing: 2, fontWeight: 700, textTransform: "uppercase" }}>{label}</div>
  );
}
const solidBtn = {
  display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 18px", borderRadius: 999,
  background: T.ink, color: T.paper, border: "none", cursor: "pointer",
  fontFamily: UI, fontSize: 13, fontWeight: 700, letterSpacing: 0.3,
};
const ghostBtn = {
  display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 16px", borderRadius: 999,
  background: "transparent", color: T.inkSoft, border: `1px solid ${T.paperDeep}`, cursor: "pointer",
  fontFamily: UI, fontSize: 12.5, fontWeight: 700, letterSpacing: 0.3,
};
const plumBtn = {
  display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 18px", borderRadius: 999,
  background: T.gold, color: "#241A26", border: "none", cursor: "pointer",
  fontFamily: UI, fontSize: 13, fontWeight: 700, letterSpacing: 0.3,
};
