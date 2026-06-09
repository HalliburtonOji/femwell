// CommunityDemo5 — "Talk It Out — audio" (Community design demo · /Ideas → Community Demos)
// ─────────────────────────────────────────────────────────────────────────────
// The spoken sibling of Echo Wall + Witness Mode. Being heard out loud, anonymously,
// without anyone fixing you. Three modes in one warm room: (A) async voice-note —
// a "voice echo" a phase-sister holds; (B) 1:1 turn-based "talk it out" — the
// talking-stick vent (talk / hold / swap, "hold, don't fix"); (C) a small live
// status-flattened Circle (5–8, no stage, listen-only allowed).
//
// Source: claude-state/AUDIO_TALK_IT_OUT.html + COMMUNITY_MEGA_PLAN §0.5(F).
// HONEST: this is a MOCK — no real mic, no getUserMedia, no audio. The flow is
// simulated with useState only. Live audio (B/C) needs an external provider
// (LiveKit); async (A) ships first — said plainly on the page.
//
// Brand-pure: UK voice, no emoji, Lucide + the shared Editorial kit only. The 1:1
// "talk" surface uses the calm dark-plum fragile-surface treatment.
import { useState } from "react";
import {
  Mic, Hand, Clock, ShieldAlert, Phone, Repeat, PhoneOff, MicOff,
  UserX, Flag, Check, Radio, Volume2, ArrowRight,
} from "lucide-react";
import {
  T, SERIF, UI, Eyebrow, Rule, Script, Hand as Voice, InkFilter, EditorialFooter,
  useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";

// the calm dark-plum "fragile surface" (reserved — never an ordinary card)
const PLUM = "#241a26";
const PLUM_INK = "#F0E4EC";
const PLUM_SOFT = "rgba(240,228,236,0.62)";

const SIGNPOST = [
  ["Samaritans", "116 123"], ["NHS", "111"], ["Shout", "text 85258"], ["Mind", "0300 123 3393"],
];

export default function CommunityDemo5() {
  useEditorialFonts();
  const [mode, setMode] = useState("A");   // A async · B 1:1 · C circle

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 60 }}>
      <InkFilter />
      <DemoBanner label="Community · Talk It Out — design demo · mock, no real audio" />

      <div style={{ maxWidth: 430, margin: "0 auto", padding: "26px 20px 0" }}>
        <header style={{ textAlign: "center", marginBottom: 16 }}>
          <Eyebrow mb={10} color={T.muted}>Talk It Out · audio</Eyebrow>
          <Script size={48} carve>Say it out loud.</Script>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft, margin: "10px auto 0", maxWidth: 380, lineHeight: 1.5 }}>
            Being heard, not advised. The spoken sibling of the Echo Wall — three ways
            to be held out loud. No recording, ever.
          </p>
        </header>

        {/* always-visible signpost */}
        <Signpost />

        {/* mode switcher */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", margin: "18px 0 18px" }}>
          {[["A", "Voice note"], ["B", "Talk 1:1"], ["C", "Circle"]].map(([id, lbl]) => (
            <button key={id} onClick={() => setMode(id)} style={modeBtn(mode === id)}>{lbl}</button>
          ))}
        </div>

        {mode === "A" && <ModeAsync />}
        {mode === "B" && <ModeTalk />}
        {mode === "C" && <ModeCircle />}

        {/* honest infra note */}
        <div style={{ display: "flex", gap: 9, padding: "12px 14px", marginTop: 20, border: `1px dashed ${T.paperDeep}`, borderRadius: 12, background: "transparent" }}>
          <Radio size={15} color={T.muted} style={{ flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, lineHeight: 1.5 }}>
            Live audio (Talk 1:1 and Circles) needs an external provider — LiveKit. The
            async <strong>Voice note</strong> ships first; live follows. This screen is a
            mock — no microphone is used.
          </span>
        </div>

        <div style={{ marginTop: 28 }}><EditorialFooter /></div>
      </div>
    </div>
  );
}

// ── Mode A — async voice-note (a "voice echo") ───────────────────────────────
function ModeAsync() {
  const [stage, setStage] = useState("idle");   // idle · recording · review · held
  const [masked, setMasked] = useState(false);

  return (
    <div>
      <Eyebrow mb={8} color={T.muted}>Mode A · a voice echo</Eyebrow>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: T.inkSoft, margin: "0 0 16px", lineHeight: 1.5 }}>
        Whisper one true line. A phase-sister holds it, once. It fades in 48 hours —
        like an echo you can hear.
      </p>

      {stage === "held" ? (
        <article style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 16, padding: "20px 18px", textAlign: "center" }}>
          <Check size={22} color={T.sage} />
          <Voice size={22} carve style={{ display: "block", margin: "12px 0 4px" }}>Held for you by a phase-sister.</Voice>
          <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5, margin: "8px 0 16px" }}>
            She listened once. She sent back one line — <em style={{ color: T.inkSoft }}>"Holding with you"</em> —
            or she held in silence. No thread opens. It fades in 48 hours.
          </p>
          <button onClick={() => { setStage("idle"); setMasked(false); }} style={pillBtn(false)}>Record another (demo)</button>
        </article>
      ) : (
        <article style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 16, padding: "20px 18px" }}>
          {/* mic affordance */}
          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => setStage(stage === "recording" ? "review" : "recording")}
              style={{
                width: 66, height: 66, borderRadius: 999, cursor: "pointer",
                border: `1.5px solid ${stage === "recording" ? T.crimson : T.paperDeep}`,
                background: stage === "recording" ? `${T.crimson}14` : "transparent",
                color: stage === "recording" ? T.crimson : T.ink,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Mic size={26} />
            </button>
            <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, marginTop: 9 }}>
              {stage === "recording" ? "Listening… tap to stop" : stage === "review" ? "0:18 · ready to hand over" : "Tap to record — up to 60 seconds"}
            </div>
          </div>

          {/* mock waveform */}
          {(stage === "recording" || stage === "review") && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, height: 36, margin: "16px 0 4px" }}>
              {WAVE.map((h, i) => (
                <span key={i} style={{
                  width: 3, borderRadius: 999, height: `${stage === "recording" ? h : h * 0.7}%`,
                  background: stage === "recording" ? T.crimson : T.muted, opacity: stage === "review" ? 0.6 : 1,
                }} />
              ))}
            </div>
          )}

          {/* voice-mask toggle */}
          <button onClick={() => setMasked((m) => !m)} style={{ ...maskRow, marginTop: 16 }}>
            <span style={{ width: 34, height: 19, borderRadius: 999, background: masked ? T.sage : T.paperDeep, position: "relative", flexShrink: 0 }}>
              <span style={{ position: "absolute", top: 2, left: masked ? 17 : 2, width: 15, height: 15, borderRadius: 999, background: T.paperHi, transition: "left .15s" }} />
            </span>
            <span style={{ textAlign: "left" }}>
              <span style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.ink, display: "block" }}>Mask my voice</span>
              <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>Harder to recognise — not anonymous.</span>
            </span>
          </button>

          {stage === "review" && (
            <button onClick={() => setStage("held")} style={{ ...pillBtn(true), width: "100%", justifyContent: "center", marginTop: 14 }}>
              Hand it to a phase-sister
            </button>
          )}
        </article>
      )}
    </div>
  );
}

// ── Mode B — 1:1 turn-based "talk it out" (the centrepiece) ──────────────────
function ModeTalk() {
  const [stage, setStage] = useState("charter");   // charter · matching · talking · closing · ended
  const [turn, setTurn] = useState("you");          // you · her — who is talking

  if (stage === "charter") {
    return (
      <PlumCard>
        <Eyebrow mb={12} color={T.gold}>The talk-it-out charter · read once</Eyebrow>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            ["Anonymous", "No name, no handle, no photo — only your phase and life stage match her."],
            ["No recording — ever", "Nothing is stored. When it ends, it's gone, on both sides."],
            ["Hold, don't fix", "You're here to be heard, not advised. One talks, the other holds."],
            ["18+ · leave any time", "Mute, block, report, or panic-exit at any moment. No one performs."],
          ].map(([h, b]) => (
            <div key={h} style={{ display: "flex", gap: 11 }}>
              <Check size={15} color={T.gold} style={{ flexShrink: 0, marginTop: 3 }} />
              <div>
                <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: PLUM_INK }}>{h}</div>
                <div style={{ fontFamily: UI, fontSize: 11.5, color: PLUM_SOFT, lineHeight: 1.5, marginTop: 2 }}>{b}</div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setStage("matching")} style={{ ...plumBtn, marginTop: 18 }}>
          I understand — match a sister <ArrowRight size={15} />
        </button>
      </PlumCard>
    );
  }

  if (stage === "matching") {
    return (
      <PlumCard>
        <div style={{ textAlign: "center", padding: "10px 0 6px" }}>
          <Pulse />
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: PLUM_INK, marginTop: 14 }}>Matching a sister…</div>
          <div style={{ fontFamily: UI, fontSize: 11.5, color: PLUM_SOFT, marginTop: 8, lineHeight: 1.5 }}>
            Same phase, same life stage. No profile is read. No handle is exchanged.
          </div>
          <button onClick={() => { setTurn("you"); setStage("talking"); }} style={{ ...plumBtn, margin: "16px auto 0" }}>Skip the wait (demo)</button>
        </div>
      </PlumCard>
    );
  }

  if (stage === "closing") {
    return (
      <PlumCard>
        <Eyebrow mb={10} color={T.gold}>Closing reflection</Eyebrow>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: PLUM_INK, lineHeight: 1.5, marginBottom: 6 }}>
          One thing that would help this week?
        </div>
        <div style={{ fontFamily: UI, fontSize: 11.5, color: PLUM_SOFT, lineHeight: 1.55, marginBottom: 16 }}>
          A gentle close, so it doesn't become a doom-loop — narrate, make meaning, move on.
          Say one line each, then it seals.
        </div>
        <button onClick={() => setStage("ended")} style={plumBtn}>Seal the conversation</button>
      </PlumCard>
    );
  }

  if (stage === "ended") {
    return (
      <PlumCard>
        <div style={{ textAlign: "center", padding: "6px 0" }}>
          <PhoneOff size={20} color={T.gold} />
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: PLUM_INK, lineHeight: 1.5, margin: "12px 0 4px" }}>
            Sealed. Nothing was recorded — it leaves no history, on either side.
          </div>
          <button onClick={() => { setStage("charter"); setTurn("you"); }} style={{ ...plumBtn, margin: "14px auto 0" }}>Start over (demo)</button>
        </div>
      </PlumCard>
    );
  }

  // talking
  const youTalking = turn === "you";
  return (
    <PlumCard>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
        <span style={{ width: 7, height: 7, borderRadius: 999, background: T.crimson }} />
        <span style={{ fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: 1.3, textTransform: "uppercase", color: PLUM_SOFT }}>
          Live · anonymous · not recorded
        </span>
      </div>

      {/* turn timer ring (static mock at 3:00) */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <TimerRing label="3:00" />
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: PLUM_INK, marginTop: 12 }}>
          {youTalking ? "You're talking — she's holding" : "She's talking — you're holding"}
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, fontFamily: UI, fontSize: 11.5, color: PLUM_SOFT }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: T.sage }} /> holding with you
        </div>
      </div>

      <button onClick={() => setTurn(youTalking ? "her" : "you")} style={{ ...plumBtn, width: "100%", justifyContent: "center", margin: "14px 0 12px" }}>
        <Repeat size={15} /> Swap — pass the turn
      </button>

      {/* leave / mute / block / report */}
      <div style={{ display: "flex", gap: 7, justifyContent: "center", marginBottom: 12 }}>
        <CtrlBtn icon={MicOff} label="Mute" />
        <CtrlBtn icon={UserX} label="Block" />
        <CtrlBtn icon={Flag} label="Report" note="report ends the call instantly" />
      </div>

      <button onClick={() => setStage("closing")} style={{ ...plumGhost, width: "100%", justifyContent: "center", marginBottom: 9 }}>
        Wind down — closing reflection
      </button>

      {/* panic-exit */}
      <button onClick={() => setStage("ended")} style={{
        width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "11px 0", borderRadius: 999, cursor: "pointer",
        background: `${T.crimson}1F`, color: T.crimson, border: `1px solid ${T.crimson}`,
        fontFamily: UI, fontSize: 12.5, fontWeight: 800, letterSpacing: 0.4,
      }}>
        <PhoneOff size={15} /> Leave now — panic exit
      </button>
    </PlumCard>
  );
}

// small control button used inside the talk surface
function CtrlBtn({ icon: Icon, label, note }) {
  return (
    <span title={note || label} style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <span style={{ width: 38, height: 38, borderRadius: 999, border: `1px solid ${PLUM_SOFT}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: PLUM_INK }}>
        <Icon size={16} />
      </span>
      <span style={{ fontFamily: UI, fontSize: 10, color: PLUM_SOFT }}>{label}</span>
    </span>
  );
}

// ── Mode C — small live status-flattened Circle ──────────────────────────────
function ModeCircle() {
  const [raised, setRaised] = useState(false);
  // status-flattened: no stage, everyone equal. host flagged only, not elevated.
  const room = [
    { name: "Host", host: true, speaking: true },
    { name: "A sister", speaking: false }, { name: "A sister", speaking: false },
    { name: "A sister", speaking: false }, { name: "A sister", speaking: false },
    { name: "A sister", speaking: false },
  ];

  return (
    <div>
      <Eyebrow mb={8} color={T.muted}>Mode C · a small live Circle</Eyebrow>
      <article style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 16, padding: "18px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Radio size={15} color={T.crimson} />
          <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: 1.1, textTransform: "uppercase", color: T.muted }}>Live now · 6 here</span>
        </div>
        <Voice size={23} carve style={{ display: "block", margin: "2px 0 4px" }}>Career vent night</Voice>
        <p style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, lineHeight: 1.5, margin: "0 0 14px" }}>
          A whole-life room, not a clinical one. No stage — everyone equal. Muted by default;
          listening only is full membership.
        </p>

        {/* status-flattened grid — no podium */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
          {room.map((p, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <span style={{
                width: 44, height: 44, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: T.paper, border: `1.5px solid ${p.speaking ? T.sage : T.paperDeep}`,
                color: p.speaking ? T.sage : T.muted,
              }}>
                {p.speaking ? <Volume2 size={17} /> : <MicOff size={15} />}
              </span>
              <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, marginTop: 5 }}>
                {p.host ? <strong style={{ color: T.inkSoft }}>Host</strong> : p.name}
              </div>
            </div>
          ))}
        </div>

        <Rule c={T.paperDeep} mb={12} />

        {/* request-to-speak (hand-raise) */}
        <button onClick={() => setRaised((r) => !r)} style={{ ...pillBtn(raised), width: "100%", justifyContent: "center" }}>
          <Hand size={15} /> {raised ? "Hand raised — host will call you" : "Request to speak"}
        </button>
        <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, textAlign: "center", marginTop: 9, lineHeight: 1.5 }}>
          You can stay muted and just listen. A gentle topic only — book chat, a vent — never clinical.
        </div>
      </article>
    </div>
  );
}

// ── shared bits ──────────────────────────────────────────────────────────────
function Signpost() {
  return (
    <div style={{ border: `1px solid ${T.paperDeep}`, borderRadius: 13, padding: "12px 14px", background: T.paperHi }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
        <ShieldAlert size={14} color={T.crimson} />
        <span style={{ fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: 1.1, textTransform: "uppercase", color: T.muted }}>
          If it's heavier than a sister can hold
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {SIGNPOST.map(([n, v]) => (
          <span key={n} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", border: `1px solid ${T.paperDeep}`, borderRadius: 999, fontFamily: UI, fontSize: 11.5 }}>
            <Phone size={12} color={T.gold} />
            <span style={{ color: T.ink, fontWeight: 600 }}>{n}</span>
            <span style={{ color: T.inkSoft }}>{v}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function TimerRing({ label }) {
  // static mock ring — calm, not ticking. shows the "talking-stick" turn budget.
  const r = 30, c = 2 * Math.PI * r;
  return (
    <span style={{ display: "inline-flex", position: "relative", width: 76, height: 76 }}>
      <svg width="76" height="76" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(240,228,236,0.16)" strokeWidth="4" />
        <circle cx="38" cy="38" r={r} fill="none" stroke={T.gold} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * 0.22} />
      </svg>
      <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontFamily: UI, fontSize: 14, fontWeight: 700, color: PLUM_INK }}>
        <Clock size={13} color={PLUM_SOFT} /> {label}
      </span>
    </span>
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

function PlumCard({ children }) {
  return (
    <div style={{ background: PLUM, borderRadius: 18, padding: "20px 18px", boxShadow: "0 10px 34px rgba(36,26,38,0.34)", border: "1px solid rgba(240,228,236,0.12)" }}>
      {children}
    </div>
  );
}

function DemoBanner({ label }) {
  return (
    <div style={{ background: T.ink, color: T.paper, padding: "8px 16px", textAlign: "center", fontFamily: UI, fontSize: 10, letterSpacing: 2, fontWeight: 700, textTransform: "uppercase" }}>{label}</div>
  );
}

const WAVE = [30, 55, 80, 45, 65, 95, 50, 70, 40, 85, 60, 35, 75, 50, 90, 45, 65, 30, 55, 80];

const modeBtn = (active) => ({
  padding: "8px 15px", borderRadius: 999, cursor: "pointer",
  fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
  background: active ? T.ink : "transparent", color: active ? T.paper : T.inkSoft,
  border: `1px solid ${active ? T.ink : T.paperDeep}`,
});
const pillBtn = (solid) => ({
  display: "inline-flex", alignItems: "center", gap: 7,
  padding: "10px 15px", borderRadius: 999, cursor: "pointer",
  fontFamily: UI, fontSize: 12.5, fontWeight: 700, letterSpacing: 0.3,
  background: solid ? T.ink : "transparent", color: solid ? T.paper : T.inkSoft,
  border: `1px solid ${solid ? T.ink : T.paperDeep}`,
});
const maskRow = {
  display: "flex", alignItems: "center", gap: 11, width: "100%",
  background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 12,
  padding: "11px 13px", cursor: "pointer",
};
const plumBtn = {
  display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 18px", borderRadius: 999,
  background: T.gold, color: "#241420", border: "none", cursor: "pointer",
  fontFamily: UI, fontSize: 13, fontWeight: 700, letterSpacing: 0.3,
};
const plumGhost = {
  display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 999,
  background: "transparent", color: PLUM_INK, border: `1px solid ${PLUM_SOFT}`, cursor: "pointer",
  fontFamily: UI, fontSize: 12.5, fontWeight: 700,
};
