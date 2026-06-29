// JessL2Demo — JESS +2 demo (preview-only, seeded). Builds the jess-plan Level +1/+2 TRUST
// features in the elite card language (extends JessEliteShell): a guideline-anchored women's-health
// answer (honest uncertainty + "here's the NHS"), an ANTI-SYCOPHANCY persona (warm but willing to
// gently challenge), hardened UK crisis escalation (hard-route, never continue an open chat),
// transparent USER-EDITABLE memory, "Talk to Jess" from every surface, Pulse-tied proactive
// noticing (consented + sparse), voice-as-utility, and optional CBT-style guided flows (support,
// never treatment). GATED (labelled "Needs sign-off"): the women-tuned guideline-GROUNDING layer
// (RAG) + model choice — a platform decision. Persona/crisis/memory-UI/deep-links ride the existing
// agent + prompt/content/UI (no new function). LIVE /Jess + /Assistant UNTOUCHED.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, MessageCircle, Brain, BookOpenCheck, Lock, LifeBuoy, Database,
  Mic, Sparkles, Trash2, Pencil, PhoneCall, HeartHandshake } from "lucide-react";
import { createPageUrl } from "@/utils";
import { T, SERIF, UI } from "@/components/journal/Editorial";
import { ClipboardSlider, Clipboard } from "@/components/brand/ClipboardSlider";
import { cwOf } from "@/components/brand/flora";
import { OXBLOOD, lbl, subCard, Panel, StackedCard, BoardBody } from "@/components/brand/SliderKit";
import JessEliteShell from "@/components/jess-elite/JessEliteShell";
import { L2Frame, L2Slider } from "@/components/demos/l2Frame";

function Lvl({ children }) { return <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#fff", background: OXBLOOD, borderRadius: 999, padding: "2px 8px" }}>{children}</span>; }
function GatedTag() { return <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: "#fff", background: T.crimson, borderRadius: 999, padding: "2px 8px", display: "inline-flex", alignItems: "center", gap: 4 }}><Lock size={11} /> NEEDS SIGN-OFF</span>; }
function Bubble({ me, children, accent }) {
  return <div style={{ alignSelf: me ? "flex-end" : "flex-start", maxWidth: "88%", background: me ? `${accent}1F` : T.paper, border: `1px solid ${me ? accent : T.paperDeep}`, borderRadius: 14, padding: "9px 12px", fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.45 }}>{children}</div>;
}

function GroundedPanel({ gold }) {
  return (
    <Panel label="Answers women can trust" Icon={BookOpenCheck} accent={gold}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}><Lvl>+1</Lvl><GatedTag /></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 8 }}>
        <Bubble me accent={gold}>Is it normal my periods got heavier in my 40s?</Bubble>
        <Bubble accent={gold}>Often, yes — heavier or changing bleeding is common in perimenopause. <b>I'm fairly sure on the pattern, less so on your case.</b> NICE (NG88) defines heavy bleeding by its impact on you, and <b>any</b> bleeding that worries you is worth a GP visit. <span style={{ color: T.muted }}>Support, not medical advice.</span></Bubble>
      </div>
      <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5, margin: 0 }}>General AI fails women's-health questions ~60% of the time. Jess's edge = women-tuned, <b>guideline-anchored</b>, honest about uncertainty, always "here's the NHS". The grounding layer (RAG + model) is the gated decision below.</p>
    </Panel>
  );
}
function PersonaPanel({ plum }) {
  return (
    <Panel label="Warm — but honest" Icon={Brain} accent={plum}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+1</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>anti-sycophancy</span></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 8 }}>
        <Bubble me accent={plum}>I'm going to stop my HRT cold turkey — I read it's dangerous.</Bubble>
        <Bubble accent={plum}>I hear the worry, and it's worth taking seriously. <b>But I'd gently push back on stopping suddenly</b> — that often spikes symptoms back. The safer move is a chat with your GP about tapering. Want three questions to take in?</Bubble>
      </div>
      <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5, margin: 0 }}>LLMs are trained to agree — dangerous when a distressed user holds a catastrophic belief. Jess is warm <b>and</b> willing to disagree; memory informs facts, never softens needed honesty.</p>
    </Panel>
  );
}
function CrisisPanel({ crim }) {
  return (
    <Panel label="If it's a crisis" Icon={LifeBuoy} accent={crim}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+1</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>escalate, never engage</span></div>
      <div style={{ background: "#FBEEE8", border: `1px solid ${crim}`, borderRadius: 12, padding: "12px 14px" }}>
        <p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.5, margin: "0 0 8px" }}>“I'm really glad you told me. I'm not the right help for this — but these people are, right now.”</p>
        {[["Samaritans", "call 116 123 · free, 24/7"], ["Shout", "text SHOUT to 85258"], ["NHS", "111 (option 2)"], ["Emergency", "999"]].map(([n, d]) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0", fontFamily: SERIF, fontSize: 14, color: T.ink }}><PhoneCall size={13} color={crim} /> <b>{n}</b> <span style={{ color: T.muted }}>· {d}</span></div>
        ))}
      </div>
      <p style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "8px 0 0", lineHeight: 1.5 }}>On a disclosure of intent, Jess <b>hard-routes</b> to humans + grounding — never continues an open supportive chat. Model behaviour alone is never trusted here.</p>
    </Panel>
  );
}
function MemoryPanel({ sage }) {
  const [mem, setMem] = useState([
    { id: 1, t: "You're perimenopausal" }, { id: 2, t: "You prefer plain language, not jargon" }, { id: 3, t: "You're rebuilding a friendship with Sam" }, { id: 4, t: "Mornings are your hardest time" },
  ]);
  return (
    <Panel label="What Jess remembers" Icon={Database} accent={sage}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+1</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>transparent · you can edit/delete</span></div>
      {mem.map((m) => (
        <div key={m.id} style={{ ...subCard(sage), marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ flex: 1, fontFamily: SERIF, fontSize: 14, color: T.ink }}>{m.t}</span>
          <button aria-label="Edit" className="fw-elite-press" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted }}><Pencil size={14} /></button>
          <button aria-label="Forget" onClick={() => setMem((x) => x.filter((y) => y.id !== m.id))} className="fw-elite-press" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.crimson }}><Trash2 size={14} /></button>
        </div>
      ))}
      <p style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "4px 0 0", lineHeight: 1.5 }}>Memory only helps if it's transparent + user-controlled. Nothing hidden; forget anything in one tap. (Rides the existing JessMemory entity.)</p>
    </Panel>
  );
}
function EverywherePanel({ gold, navigate }) {
  const SURF = [["Today", "Today"], ["Pulse", "Pulse"], ["Health", "Health"], ["Community", "Community"], ["Nutrition", "Nutrition"], ["Lifestyle", "Lifestyle"]];
  return (
    <Panel label="Talk to Jess — anywhere" Icon={MessageCircle} accent={gold}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+2</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>one tap from every surface</span></div>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 10px" }}>A “Talk to Jess about this” door on every page — she arrives already holding the context.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {SURF.map(([l, r]) => <button key={l} onClick={() => navigate(createPageUrl(r))} className="fw-elite-press" style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, padding: "7px 12px", borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`, color: T.inkSoft, cursor: "pointer" }}>{l} ›</button>)}
      </div>
    </Panel>
  );
}
function ProactivePanel({ plum }) {
  const [on, setOn] = useState(true);
  return (
    <Panel label="She notices (gently)" Icon={Sparkles} accent={plum}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+2</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>Pulse-tied · consented · sparse</span></div>
      {on && <div style={{ ...subCard(plum), marginBottom: 8 }}><p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.ink, lineHeight: 1.5, margin: 0 }}>“I noticed your headaches tend to cluster in your late-luteal days. Want to talk about what might help — or shall I leave it?”</p></div>}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setOn((v) => !v)} className="fw-elite-press" style={{ flex: 1, fontFamily: UI, fontSize: 13, fontWeight: 700, padding: "9px", borderRadius: 11, background: on ? `${plum}1F` : T.paper, border: `1px solid ${on ? plum : T.paperDeep}`, color: on ? plum : T.inkSoft, cursor: "pointer" }}>{on ? "Proactive noticing: ON" : "Proactive noticing: off"}</button>
      </div>
      <p style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "8px 0 0", lineHeight: 1.5 }}>Rare by design — never nags, never optimised for time-in-app. Off-ramps over engagement.</p>
    </Panel>
  );
}
function DepthPanel({ crim }) {
  return (
    <Panel label="Voice & guided support" Icon={Mic} accent={crim}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+2</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>utility · psychoeducation, never therapy</span></div>
      <div style={{ ...subCard(crim), marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}><Mic size={20} color={crim} /><span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.3 }}>Hands-free: “Jess, log a headache and that I slept badly.” Voice as utility, not a companion to live in.</span></div>
      <div style={{ ...subCard(crim), display: "flex", alignItems: "flex-start", gap: 10 }}><HeartHandshake size={20} color={crim} style={{ flexShrink: 0, marginTop: 2 }} /><span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.4 }}>Optional CBT-style guided chats (a gentle reframe, a worry sorted) — clearly framed as <b>support &amp; psychoeducation, never treatment</b>, with a calm hand-off to real help when it's more than that.</span></div>
    </Panel>
  );
}

export default function JessL2Demo() {
  const navigate = useNavigate();
  const gold = cwOf("gold").petal, sage = cwOf("sage").petal, crim = T.crimson, plum = cwOf("plum").petal;
  return (
    <L2Frame label="Jess" shell={<JessEliteShell />}>
      <L2Slider>
        <ClipboardSlider hint="Slide the +2 trust layer →" accent={gold}>
          <Clipboard title="Trustworthy" sub="GUIDELINE-ANCHORED · ANTI-SYCOPHANCY" accent={gold} flower="iris" idx="cb-trust" titleColor={OXBLOOD}>
            <BoardBody><StackedCard topAccent={gold} bottomAccent={plum}
              top={[<GroundedPanel key="g" gold={gold} />]}
              bottom={[<PersonaPanel key="p" plum={plum} />]} />
            </BoardBody>
          </Clipboard>

          <Clipboard title="Safe & transparent" sub="CRISIS HARD-ROUTE · EDITABLE MEMORY" accent={crim} flower="poppy" idx="cb-safe" titleColor={OXBLOOD}>
            <BoardBody><StackedCard topAccent={crim} bottomAccent={sage}
              top={[<CrisisPanel key="c" crim={crim} />]}
              bottom={[<MemoryPanel key="m" sage={sage} />]} />
            </BoardBody>
          </Clipboard>

          <Clipboard title="Everywhere & deeper" sub="TALK-ANYWHERE · NOTICING · VOICE · CBT" accent={plum} flower="rose" idx="cb-reach" titleColor={OXBLOOD}>
            <BoardBody><StackedCard topAccent={plum} bottomAccent={crim}
              top={[<EverywherePanel key="e" gold={gold} navigate={navigate} />, <ProactivePanel key="pr" plum={plum} />]}
              bottom={[<DepthPanel key="d" crim={crim} />]} />
            </BoardBody>
          </Clipboard>
        </ClipboardSlider>
      </L2Slider>

      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${OXBLOOD}`, borderRadius: 16, padding: "14px 16px", margin: "18px 0" }}>
        <div style={{ ...lbl, color: OXBLOOD, marginBottom: 6, display: "inline-flex", alignItems: "center", gap: 6 }}><ShieldCheck size={13} /> What's rule-safe vs needs your call</div>
        <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.55, margin: 0 }}><b>Rule-safe (no new function):</b> the anti-sycophancy + honest-uncertainty persona (prompt) · hardened UK crisis hard-route (config) · transparent editable memory (UI on JessMemory) · "talk to Jess" deep-links · Pulse-tied proactive noticing · voice utility · CBT-style framing — all ride the existing agent. <b>Needs your OK:</b> the women-tuned, guideline-<b>grounding</b> layer (a RAG/knowledge layer + model choice) — the deepest win, a platform decision. Live Jess is untouched.</p>
      </div>
    </L2Frame>
  );
}
