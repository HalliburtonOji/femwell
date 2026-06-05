// CommunityDemo2 — "Witness Mode" (Community design demo · /Ideas → Community Demos)
// ─────────────────────────────────────────────────────────────────────────────
// "Read this. Hold it." One entry handed to one matched sister. Four fixed
// responses or pass silently. No thread, no chat, no screenshot. The writer can
// cancel before she reads. The receiver never uses her own words.
//
// Captures, from COMMUNITY_BUILD_SPEC §2.C: writer toggle + match (2–4h) ·
// the Witness dock (receive one) · receiver view with the 4 fixed Fraunces/Cormorant
// lines + pass-silently · the held-3 gate ("witnessed 2 times, one more to
// unlock") · the 6-rail charter. The dark plum "trust-ink" gradient is reserved
// for these fragile surfaces (never an ordinary card).
//
// Self-contained, mock data only, no entities. UK voice, no emoji, Lucide only.
import { useState } from "react";
import {
  BookOpen, Send, Lock, EyeOff, Check, ArrowRight, ShieldCheck, Heart,
} from "lucide-react";
import {
  T, SERIF, UI, Eyebrow, Script, InkFilter, useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";

// the dark plum trust-ink gradient (reserved for fragile surfaces, per the craft bar)
const PLUM = "linear-gradient(165deg, #2E1C2A 0%, #3A2233 55%, #241420 100%)";
const PLUM_INK = "#F0E4EC";
const PLUM_SOFT = "rgba(240,228,236,0.62)";

const FIXED_RESPONSES = [
  "I'm holding this with you.",
  "Me too.",
  "You're not alone in this.",
  "I hear you.",
];

const CHARTER = [
  ["Anonymous", "She sees the entry, your phase and your life stage — never a handle, a photo, or a region."],
  ["One-shot", "One read, one fixed response. No DM, no follow, no re-view. Then it seals again."],
  ["Cancel before she reads", "A two-hour window. Pull it back and it re-seals — she never knew."],
  ["Not for crisis", "Anything heavy routes to Panic Mode and trained resources, never to a peer."],
  ["No names or places", "If Jess detects an identifying detail, she asks you to edit before it sends."],
  ["You choose her shape", "Default is your phase and life stage. Tighten or loosen the match."],
];

const ENTRY = "I keep telling everyone I'm fine. I am the one who holds it together. Tonight I just wanted one person to know that holding it together is heavy, and I am tired, and I don't actually need them to fix anything.";

export default function CommunityDemo2() {
  useEditorialFonts();
  // demo navigation across the three faces of the feature
  const [view, setView] = useState("writer");        // writer · dock · receiver
  const [held, setHeld] = useState(2);               // held-3 gate progress

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 60 }}>
      <InkFilter />
      <DemoBanner label="Community · Witness Mode — design demo · mock data" />

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "26px 20px 0" }}>
        <header style={{ textAlign: "center", marginBottom: 16 }}>
          <Eyebrow mb={10} color={T.muted}>Witness Mode</Eyebrow>
          <Script size={50} carve>Read this. Hold it.</Script>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft, margin: "10px auto 0", maxWidth: 430, lineHeight: 1.5 }}>
            One entry, handed to one matched sister. Four ways to answer, or pass in
            silence. Never a conversation.
          </p>
        </header>

        {/* demo face switcher */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 20 }}>
          {[["writer", "Writer"], ["dock", "Dock"], ["receiver", "Receiver"]].map(([id, lbl]) => (
            <button key={id} onClick={() => setView(id)} style={faceBtn(view === id)}>{lbl}</button>
          ))}
        </div>

        {view === "writer"   && <WriterFace held={held} />}
        {view === "dock"     && <DockFace onOpen={() => setView("receiver")} />}
        {view === "receiver" && <ReceiverFace onDone={() => { setHeld((h) => Math.min(3, h + 1)); setView("dock"); }} />}
      </div>
    </div>
  );
}

// ── Writer: toggle → matching → matched, + the held-3 gate ───────────────────
function WriterFace({ held }) {
  const [stage, setStage] = useState("toggle");   // toggle · charter · matching · matched · cancelled
  const unlocked = held >= 3;

  return (
    <div>
      {/* the entry being handed over (reading engine — the page is the screen) */}
      <article style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 16, padding: "20px 20px", marginBottom: 16 }}>
        <Eyebrow mb={9} color={T.muted}>From your Journal · luteal d19</Eyebrow>
        <p style={{ fontFamily: SERIF, fontSize: 16.5, lineHeight: 1.66, color: T.ink, margin: 0 }}>{ENTRY}</p>
      </article>

      {/* held-3 pathway card */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 15px", border: `1px solid ${T.paperDeep}`, borderRadius: 13, marginBottom: 16, background: T.paperHi }}>
        <div style={{ display: "flex", gap: 5 }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 9, height: 9, borderRadius: 999, background: i < held ? T.gold : T.paperDeep }} />
          ))}
        </div>
        <span style={{ fontFamily: UI, fontSize: 12, color: T.inkSoft, lineHeight: 1.45 }}>
          {unlocked
            ? "You can hold someone — you've been held three times."
            : `You can hold someone when you've been held. Witnessed ${held} times — one more to unlock.`}
        </span>
      </div>

      {stage === "toggle" && (
        <PlumCard>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
            <Send size={18} color={T.gold} />
            <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase", color: PLUM_SOFT }}>Want one sister to witness this?</span>
          </div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: PLUM_INK, lineHeight: 1.5, marginBottom: 16 }}>
            Sent to one witness · matched in the next 2–4 hours · no handle exchanged ·
            you can cancel before it's read.
          </div>
          <button onClick={() => setStage("charter")} style={plumBtn}>
            Send to one witness <ArrowRight size={15} />
          </button>
        </PlumCard>
      )}

      {stage === "charter" && <Charter onAgree={() => setStage("matching")} side="writer" />}

      {stage === "matching" && (
        <PlumCard>
          <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
            <Pulse />
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: PLUM_INK, marginTop: 14 }}>A sister is being matched…</div>
            <div style={{ fontFamily: UI, fontSize: 12, color: PLUM_SOFT, marginTop: 8, lineHeight: 1.5 }}>
              Same phase, same life stage. No profile is read. No handle is exchanged.
            </div>
            <button onClick={() => setStage("matched")} style={{ ...plumBtn, margin: "16px auto 0" }}>Skip the wait (demo)</button>
          </div>
        </PlumCard>
      )}

      {stage === "matched" && (
        <PlumCard>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
            <ShieldCheck size={18} color={T.gold} />
            <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase", color: PLUM_SOFT }}>Held</span>
          </div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: PLUM_INK, lineHeight: 1.5, marginBottom: 16 }}>
            One sister is holding your entry now. You'll see only her chosen line — never
            her name. Cancel any time in the next two hours.
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            <button onClick={() => setStage("cancelled")} style={{ ...plumBtn, background: "transparent", color: PLUM_INK, border: `1px solid ${PLUM_SOFT}` }}>Cancel — re-seal it</button>
          </div>
        </PlumCard>
      )}

      {stage === "cancelled" && (
        <PlumCard>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <Lock size={17} color={T.gold} />
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, color: PLUM_INK, lineHeight: 1.5 }}>
              Re-sealed. She never knew. It's back in your Journal, under your lock.
            </div>
          </div>
          <button onClick={() => setStage("toggle")} style={{ ...plumBtn, marginTop: 14 }}>Start over (demo)</button>
        </PlumCard>
      )}
    </div>
  );
}

// ── Dock: receive one ────────────────────────────────────────────────────────
function DockFace({ onOpen }) {
  return (
    <PlumCard>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
        <Heart size={18} color={T.gold} />
        <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase", color: PLUM_SOFT }}>A sister shared once</span>
      </div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 19, color: PLUM_INK, lineHeight: 1.5, marginBottom: 6 }}>
        Will you read one thing, once?
      </div>
      <div style={{ fontFamily: UI, fontSize: 12.5, color: PLUM_SOFT, lineHeight: 1.55, marginBottom: 18 }}>
        She's in your phase and life stage. One read, one line back — or pass in silence.
        No thread opens. Nothing can be copied.
      </div>
      <button onClick={onOpen} style={plumBtn}><BookOpen size={15} /> Read it</button>
      <div style={{ fontFamily: UI, fontSize: 11, color: PLUM_SOFT, marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
        <EyeOff size={12} /> Witness Mode is a dock, not a page — receive one, be one.
      </div>
    </PlumCard>
  );
}

// ── Receiver: locked entry + 4 fixed lines + pass silently ───────────────────
function ReceiverFace({ onDone }) {
  const [chosen, setChosen] = useState(null);
  const [sealed, setSealed] = useState(false);

  if (sealed) {
    return (
      <PlumCard>
        <div style={{ textAlign: "center", padding: "6px 0" }}>
          <Lock size={22} color={T.gold} />
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: PLUM_INK, lineHeight: 1.5, margin: "12px 0 4px" }}>
            {chosen ? "Your line was passed to her. The entry has sealed again." : "You passed in silence. She won't know you read it."}
          </div>
          <div style={{ fontFamily: UI, fontSize: 12, color: PLUM_SOFT, marginTop: 8 }}>It leaves no history, on either side.</div>
          <button onClick={onDone} style={{ ...plumBtn, margin: "16px auto 0" }}>Done</button>
        </div>
      </PlumCard>
    );
  }

  return (
    <div>
      {/* no-copy locked entry */}
      <article style={{ position: "relative", background: PLUM, color: PLUM_INK, border: "1px solid rgba(240,228,236,0.14)", borderRadius: 16, padding: "20px 20px 16px", marginBottom: 16, userSelect: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 11 }}>
          <Lock size={13} color={T.gold} />
          <span style={{ fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: 1.3, textTransform: "uppercase", color: PLUM_SOFT }}>One read · no copy · no screenshot · luteal · reproductive</span>
        </div>
        <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.66, margin: 0 }}>{ENTRY}</p>
      </article>

      <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: 1.3, textTransform: "uppercase", color: T.muted, margin: "0 0 11px", textAlign: "center" }}>
        Choose one line — never your own words
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 14 }}>
        {FIXED_RESPONSES.map((r) => (
          <button key={r} onClick={() => setChosen(r)} style={{
            textAlign: "left", padding: "14px 16px", borderRadius: 13, cursor: "pointer",
            background: chosen === r ? `${T.gold}1F` : T.paperHi,
            border: `1px solid ${chosen === r ? T.gold : T.paperDeep}`,
            fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, color: T.ink,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            {chosen === r ? <Check size={16} color={T.gold} /> : <span style={{ width: 16 }} />}
            {r}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 9 }}>
        <button onClick={() => { setChosen(null); setSealed(true); }} style={{ ...faceBtn(false), flex: 1, padding: "12px 0" }}>Pass silently</button>
        <button onClick={() => setSealed(true)} disabled={!chosen} style={{ ...darkBtn, flex: 2, justifyContent: "center", opacity: chosen ? 1 : 0.4 }}>
          <Send size={14} /> Send this line
        </button>
      </div>
    </div>
  );
}

// ── the 6-rail charter ───────────────────────────────────────────────────────
function Charter({ onAgree }) {
  return (
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
      <button onClick={onAgree} style={{ ...plumBtn, marginTop: 18 }}>I understand — match me <ArrowRight size={15} /></button>
    </PlumCard>
  );
}

// ── shared bits ──────────────────────────────────────────────────────────────
function PlumCard({ children }) {
  return (
    <div style={{ background: PLUM, borderRadius: 18, padding: "20px 20px", boxShadow: "0 10px 34px rgba(36,20,32,0.34)", border: "1px solid rgba(240,228,236,0.12)" }}>
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
const faceBtn = (active) => ({
  padding: "8px 16px", borderRadius: 999, cursor: "pointer",
  fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
  background: active ? T.ink : "transparent", color: active ? T.paper : T.inkSoft,
  border: `1px solid ${active ? T.ink : T.paperDeep}`,
});
const plumBtn = {
  display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 18px", borderRadius: 999,
  background: T.gold, color: "#241420", border: "none", cursor: "pointer",
  fontFamily: UI, fontSize: 13, fontWeight: 700, letterSpacing: 0.3,
};
const darkBtn = {
  display: "inline-flex", alignItems: "center", gap: 7, padding: "12px 18px", borderRadius: 999,
  background: T.ink, color: T.paper, border: "none", cursor: "pointer",
  fontFamily: UI, fontSize: 13, fontWeight: 700,
};
