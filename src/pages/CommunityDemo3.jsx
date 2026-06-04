// CommunityDemo3 — "Phase Twin" (Community design demo · /Ideas → Community Demos)
// ─────────────────────────────────────────────────────────────────────────────
// "Twelve days. One shape." A seasonal 12-day pairing with one woman in the same
// phase + life stage. One shared prompt a day. Her answer is blurred until you
// write yours (a both-wrote reveal gate). The container closes at next period
// day 1 — no re-entry that cycle.
//
// Captures, from COMMUNITY_BUILD_SPEC §2.D: the match screen · the 12-day
// contract opt-in (shared / not-shared) · the both-wrote reveal gate + Jess's
// one bridging note a day · the day-12 closing ritual with the parting-line
// exchange. "A 12-day container. Not a friendship."
//
// Self-contained, mock data only, no entities. UK voice, no emoji, Lucide only.
import { useState } from "react";
import { Lock, ArrowRight, Sparkles, Check, Feather, X, Leaf,
} from "lucide-react";
import {
  T, SERIF, UI, Eyebrow, Script, Hand, InkFilter, useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";

const PLUM = "linear-gradient(165deg, #2A1A2E 0%, #34203A 55%, #1F1426 100%)";
const PLUM_INK = "#EEE2F0";
const PLUM_SOFT = "rgba(238,226,240,0.6)";

const PROMPT = "What did you carry today that you could have set down?";
const TWIN_ANSWER = "A meeting I had already decided about. I argued it in my head for an hour before it started, then it went exactly as I knew it would. I could have set down the rehearsal.";
const BRIDGE = "Two luteal women, two different edges to soften — a meeting, and a message you keep rereading — and both of you called it rehearsal. Sit with that.";

export default function CommunityDemo3() {
  useEditorialFonts();
  const [stage, setStage] = useState("match");   // match · contract · day · closing

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 60 }}>
      <InkFilter />
      <DemoBanner label="Community · Phase Twin — design demo · mock data" />

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "26px 20px 0" }}>
        <header style={{ textAlign: "center", marginBottom: 16 }}>
          <Eyebrow mb={10} color={T.muted}>Phase Twin</Eyebrow>
          <Script size={50} carve>Twelve days. One shape.</Script>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft, margin: "10px auto 0", maxWidth: 430, lineHeight: 1.5 }}>
            One sister, one shared prompt a day, for the length of a phase. Her words stay
            blurred until you write yours.
          </p>
        </header>

        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 20, flexWrap: "wrap" }}>
          {[["match", "Match"], ["contract", "Contract"], ["day", "A day"], ["closing", "Day 12"]].map(([id, lbl]) => (
            <button key={id} onClick={() => setStage(id)} style={faceBtn(stage === id)}>{lbl}</button>
          ))}
        </div>

        {stage === "match"    && <MatchScreen onNext={() => setStage("contract")} />}
        {stage === "contract" && <Contract onNext={() => setStage("day")} />}
        {stage === "day"      && <DayScreen />}
        {stage === "closing"  && <Closing />}
      </div>
    </div>
  );
}

// ── Match screen ─────────────────────────────────────────────────────────────
function MatchScreen({ onNext }) {
  return (
    <PlumCard>
      <Eyebrow mb={10} color={T.gold}>Day 1 of 12 · luteal match</Eyebrow>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 19, color: PLUM_INK, lineHeight: 1.5, marginBottom: 16 }}>
        You've been matched with one sister for this cycle.
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {["luteal phase", "reproductive", "no kids", "#work-stress"].map((tag) => (
          <span key={tag} style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 600, color: PLUM_INK, background: "rgba(238,226,240,0.1)", border: "1px solid rgba(238,226,240,0.18)", borderRadius: 999, padding: "5px 11px" }}>{tag}</span>
        ))}
      </div>
      <div style={{ borderTop: "1px solid rgba(238,226,240,0.14)", paddingTop: 14 }}>
        <div style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: 1.3, textTransform: "uppercase", color: PLUM_SOFT, marginBottom: 7 }}>Today's shared prompt</div>
        <Hand size={24} carve color={PLUM_INK}>{PROMPT}</Hand>
      </div>
      <div style={{ fontFamily: UI, fontSize: 12, color: PLUM_SOFT, lineHeight: 1.55, margin: "16px 0 16px", display: "flex", gap: 8, alignItems: "flex-start" }}>
        <Lock size={14} color={T.gold} style={{ flexShrink: 0, marginTop: 2 }} />
        You'll see her entry the moment you both write. Not before. The container closes in 12 days.
      </div>
      <button onClick={onNext} style={plumBtn}>See the contract <ArrowRight size={15} /></button>
    </PlumCard>
  );
}

// ── 12-day contract (shared / not-shared matrix) ─────────────────────────────
function Contract({ onNext }) {
  const SHE_SEES = ["Your phase and cycle day", "Your life stage", "One shared tag", "Today's entry — only once you've both written"];
  const SHE_NEVER = ["Your name or any handle", "Your other entries", "Your region or a photo", "Any past cycle"];
  return (
    <PlumCard>
      <Script size={30} carve color={PLUM_INK}>A 12-day container. Not a friendship.</Script>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: PLUM_SOFT, margin: "10px 0 18px", lineHeight: 1.55 }}>
        Twelve days, then it ends — you re-enter next cycle, a new twin, same Jess. She
        can go quiet (no blame). You can exit any day. Jess is the only voice between you.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Matrix title="She sees" items={SHE_SEES} on />
        <Matrix title="She never sees" items={SHE_NEVER} />
      </div>
      <button onClick={onNext} style={{ ...plumBtn, marginTop: 18 }}><Check size={15} /> Enter the container</button>
    </PlumCard>
  );
}
function Matrix({ title, items, on }) {
  return (
    <div>
      <div style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: 1.1, textTransform: "uppercase", color: on ? T.gold : PLUM_SOFT, marginBottom: 9 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((it) => (
          <div key={it} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            {on ? <Check size={13} color={T.gold} style={{ flexShrink: 0, marginTop: 3 }} /> : <X size={13} color={PLUM_SOFT} style={{ flexShrink: 0, marginTop: 3 }} />}
            <span style={{ fontFamily: UI, fontSize: 11.5, color: PLUM_INK, lineHeight: 1.45 }}>{it}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── A day: blurred-until-you-write reveal gate ───────────────────────────────
function DayScreen() {
  const [mine, setMine] = useState("");
  const [written, setWritten] = useState(false);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <Eyebrow color={T.muted}>Day 4 of 12 · luteal</Eyebrow>
        <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>4 days written together</span>
      </div>

      <article style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 16, padding: "18px 18px", marginBottom: 14 }}>
        <div style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", color: T.muted, marginBottom: 9 }}>Today's shared prompt</div>
        <Hand size={24} carve>{PROMPT}</Hand>
      </article>

      {/* your entry */}
      <article style={{ background: T.paperHi, border: `1px solid ${written ? T.gold : T.paperDeep}`, borderRadius: 16, padding: "16px 16px", marginBottom: 14 }}>
        <Eyebrow mb={9} color={T.muted}>Your entry</Eyebrow>
        {written ? (
          <p style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.6, color: T.ink, margin: 0 }}>{mine}</p>
        ) : (
          <>
            <textarea value={mine} onChange={(e) => setMine(e.target.value)} rows={3} placeholder="Write yours first — then hers appears."
              style={{ width: "100%", padding: "11px 12px", borderRadius: 11, border: `1px solid ${T.paperDeep}`, background: T.paper, fontFamily: SERIF, fontSize: 15.5, color: T.ink, resize: "none", boxSizing: "border-box", outline: "none" }} />
            <button onClick={() => mine.trim() && setWritten(true)} disabled={!mine.trim()} style={{ ...darkBtn, marginTop: 11, opacity: mine.trim() ? 1 : 0.4 }}>
              <Feather size={14} /> Write it
            </button>
          </>
        )}
      </article>

      {/* her entry — blurred until both wrote */}
      <article style={{ position: "relative", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 16, padding: "18px 18px", overflow: "hidden" }}>
        <Eyebrow mb={9} color={T.muted}>Her entry</Eyebrow>
        <p style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.6, color: T.ink, margin: 0, filter: written ? "none" : "blur(7px)", userSelect: written ? "auto" : "none", transition: "filter .5s ease" }}>
          {TWIN_ANSWER}
        </p>
        {!written && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6 }}>
            <Lock size={18} color={T.muted} />
            <span style={{ fontFamily: UI, fontSize: 12, color: T.inkSoft, fontWeight: 600 }}>Write yours, and hers appears.</span>
          </div>
        )}
      </article>

      {/* Jess bridging note — one a day, only after both wrote */}
      {written && (
        <div style={{ marginTop: 14, padding: "16px 17px", background: PLUM, borderRadius: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
            <Sparkles size={15} color={T.gold} />
            <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: 1.3, textTransform: "uppercase", color: PLUM_SOFT }}>Jess · one note a day</span>
          </div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: PLUM_INK, lineHeight: 1.6 }}>{BRIDGE}</div>
        </div>
      )}
    </div>
  );
}

// ── Day 12 closing ritual + parting-line exchange ────────────────────────────
function Closing() {
  const [exchanged, setExchanged] = useState(false);
  return (
    <PlumCard>
      <div style={{ textAlign: "center" }}>
        <Leaf size={22} color={T.gold} />
        <Script size={34} carve color={PLUM_INK} style={{ marginTop: 8 }}>The container has closed.</Script>
        <div style={{ fontFamily: UI, fontSize: 13, color: PLUM_SOFT, marginTop: 10, letterSpacing: 0.3 }}>
          12 days · 8 shared entries · one shape you both wrote.
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(238,226,240,0.14)", margin: "18px 0 16px", paddingTop: 16 }}>
        <div style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: 1.3, textTransform: "uppercase", color: PLUM_SOFT, marginBottom: 8 }}>Jess names the shared themes</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, color: PLUM_INK, lineHeight: 1.6 }}>
          You both spent these twelve days learning to set down the rehearsal — the argument
          you'd already won, the message you'd already read. You called it the same thing,
          a week apart.
        </div>
      </div>

      {!exchanged ? (
        <button onClick={() => setExchanged(true)} style={plumBtn}>
          Carry one of her lines <ArrowRight size={15} />
        </button>
      ) : (
        <div style={{ background: "rgba(238,226,240,0.07)", border: "1px solid rgba(238,226,240,0.16)", borderRadius: 14, padding: "15px 16px" }}>
          <div style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", color: T.gold, marginBottom: 8 }}>Her parting line · yours for 48 hours</div>
          <Hand size={23} carve color={PLUM_INK}>I could have set down the rehearsal.</Hand>
          <div style={{ fontFamily: UI, fontSize: 11.5, color: PLUM_SOFT, marginTop: 12, lineHeight: 1.5 }}>
            You can re-enter on your next cycle — a new twin, same Jess.
          </div>
        </div>
      )}
    </PlumCard>
  );
}

// ── shared bits ──────────────────────────────────────────────────────────────
function PlumCard({ children }) {
  return <div style={{ background: PLUM, borderRadius: 18, padding: "20px 20px", boxShadow: "0 10px 34px rgba(31,20,38,0.34)", border: "1px solid rgba(238,226,240,0.12)" }}>{children}</div>;
}
function DemoBanner({ label }) {
  return <div style={{ background: T.ink, color: T.paper, padding: "8px 16px", textAlign: "center", fontFamily: UI, fontSize: 10, letterSpacing: 2, fontWeight: 700, textTransform: "uppercase" }}>{label}</div>;
}
const faceBtn = (active) => ({
  padding: "8px 15px", borderRadius: 999, cursor: "pointer",
  fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
  background: active ? T.ink : "transparent", color: active ? T.paper : T.inkSoft,
  border: `1px solid ${active ? T.ink : T.paperDeep}`,
});
const plumBtn = {
  display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 18px", borderRadius: 999,
  background: T.gold, color: "#1F1426", border: "none", cursor: "pointer",
  fontFamily: UI, fontSize: 13, fontWeight: 700, letterSpacing: 0.3,
};
const darkBtn = {
  display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 16px", borderRadius: 999,
  background: T.ink, color: T.paper, border: "none", cursor: "pointer",
  fontFamily: UI, fontSize: 12.5, fontWeight: 700,
};
