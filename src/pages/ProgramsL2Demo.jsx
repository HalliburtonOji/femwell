// ProgramsL2Demo — PROGRAMS +2 demo (preview-only, seeded). Builds the programs-plan
// Level +1/+2 completion-science features in the elite card language (extends ProgramsEliteShell):
// a light Jess GUIDE (day-1 · wobble-week · graduation check-ins), catch-up/rest WITHOUT guilt,
// a programme→HABIT graduation, pre/post validated PROMs, "start-together" COHORTS + an
// anonymous progress wall, WHOLE-LIFE journey breadth (confidence/money/relationships), and
// adaptive pacing. GATED (labelled "Needs sign-off"): real push-notification delivery + human
// coaching. The Jess guide rides the existing agent (no new function). LIVE /ProgramsHub UNTOUCHED.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, RotateCcw, Trophy, ClipboardCheck, Users, Compass, Gauge,
  Bell, UserCheck, Lock, Sparkles, Sprout, Heart } from "lucide-react";
import { createPageUrl } from "@/utils";
import { T, SERIF, UI } from "@/components/journal/Editorial";
import { ClipboardSlider, Clipboard } from "@/components/brand/ClipboardSlider";
import { cwOf, Bouquet, FlowerGlyph } from "@/components/brand/flora";
import { OXBLOOD, lbl, subCard, Panel, StackedCard, BoardBody } from "@/components/brand/SliderKit";
import ProgramsEliteShell from "@/components/programs-elite/ProgramsEliteShell";
import { L2Frame, L2Slider } from "@/components/demos/l2Frame";


const GUIDE = [
  { when: "Day 1", icon: Sprout, msg: "“Welcome — we'll go gently, three small minutes at a time. I'll check in at the wobble, and again when you graduate.”" },
  { when: "The wobble week", icon: Heart, msg: "“Day 9 is where most people quietly drift. You're not most people — and a paused day isn't a failure. Just open today's.”" },
  { when: "Graduation", icon: Trophy, msg: "“You finished. Let's turn this into one small habit that stays — your pick.”" },
];
const JOURNEYS = [
  { name: "Money confidence", flower: "gladiolus", cw: "gold", dom: "Money" },
  { name: "Dating again", flower: "rose", cw: "crimson", dom: "Love" },
  { name: "Rebuild a friendship", flower: "sunflower", cw: "gold", dom: "Friendship" },
  { name: "Find your style", flower: "iris", cw: "plum", dom: "Identity" },
  { name: "Creative comeback", flower: "cosmos", cw: "blush", dom: "Creativity" },
  { name: "Sleep · PCOS · peri", flower: "lavender", cw: "sage", dom: "Health (kept)" },
];
function Lvl({ children }) { return <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#fff", background: OXBLOOD, borderRadius: 999, padding: "2px 8px" }}>{children}</span>; }
function GatedTag() { return <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: "#fff", background: T.crimson, borderRadius: 999, padding: "2px 8px", display: "inline-flex", alignItems: "center", gap: 4 }}><Lock size={11} /> NEEDS SIGN-OFF</span>; }

function GuidePanel({ plum }) {
  const [i, setI] = useState(0);
  const g = GUIDE[i];
  return (
    <Panel label="Your Jess guide" Icon={MessageCircle} accent={plum}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+1</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>doubles completion · rides the existing agent</span></div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {GUIDE.map((x, idx) => <button key={x.when} onClick={() => setI(idx)} className="fw-elite-press" style={{ flex: 1, fontFamily: UI, fontSize: 12, fontWeight: 700, padding: "8px 4px", borderRadius: 10, background: i === idx ? `${plum}1F` : T.paper, border: `1px solid ${i === idx ? plum : T.paperDeep}`, color: i === idx ? plum : T.inkSoft, cursor: "pointer" }}>{x.when}</button>)}
      </div>
      <div style={{ ...subCard(plum), display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ width: 34, height: 34, borderRadius: 9, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}><g.icon size={17} color={plum} /></span>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.ink, lineHeight: 1.5, margin: 0 }}>{g.msg}</p>
      </div>
      <p style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "8px 0 0", lineHeight: 1.5 }}>Supportive-accountability check-ins, well-timed — zero clinician cost.</p>
    </Panel>
  );
}
function CatchupPanel({ sage }) {
  const [rest, setRest] = useState(false);
  return (
    <Panel label="Catch up · rest" Icon={RotateCcw} accent={sage}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+1</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>no streak to break</span></div>
      <div style={{ ...subCard(sage), marginBottom: 8 }}>
        <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink }}>You paused on day 4.</div>
        <div style={{ fontFamily: SERIF, fontSize: 14, color: T.inkSoft, lineHeight: 1.4, marginTop: 2 }}>Pick up exactly where you left off — nothing's lost, nothing to make up. A pause is recovery, not a broken streak.</div>
      </div>
      <button className="fw-elite-press" style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: sage, color: "#fff", border: "none", borderRadius: 12, padding: "11px 14px", fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 8 }}><RotateCcw size={14} /> Resume day 4</button>
      <button onClick={() => setRest((r) => !r)} className="fw-elite-press" style={{ width: "100%", fontFamily: UI, fontSize: 13, fontWeight: 700, padding: "9px", borderRadius: 11, background: rest ? `${sage}1F` : T.paper, border: `1px solid ${rest ? sage : T.paperDeep}`, color: rest ? sage : T.inkSoft, cursor: "pointer" }}>{rest ? "Rest day on — see you tomorrow" : "Take a rest day (grace, not a freeze you'll lose)"}</button>
    </Panel>
  );
}
function GraduationPanel({ gold, navigate }) {
  return (
    <Panel label="Graduation → a habit" Icon={Trophy} accent={gold}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+1</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>so a finished journey leaves something</span></div>
      <div style={{ display: "flex", justifyContent: "center", margin: "2px 0 8px" }}><FlowerGlyph variant="sunflower" size={44} color={gold} idx="grad" /></div>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 10px", textAlign: "center" }}>You finished the Sleep journey. Keep one small thing — cue-anchored, your pick (the ~2-month habit science):</p>
      {["A 5-min wind-down at 10pm", "Phone out of the bedroom", "Same wake time, gently"].map((h, i) => (
        <div key={h} style={{ ...subCard(gold), marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink }}>{h}</span>{i === 0 && <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: gold }}>chosen</span>}</div>
      ))}
      <button onClick={() => navigate(createPageUrl("Today"))} className="fw-elite-press" style={{ width: "100%", marginTop: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: gold, color: "#fff", border: "none", borderRadius: 12, padding: "11px 14px", fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer" }}><Sparkles size={14} /> Plant it on Today</button>
    </Panel>
  );
}
function PromPanel({ crim }) {
  return (
    <Panel label="Did it work?" Icon={ClipboardCheck} accent={crim}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><Lvl>+1</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>pre/post validated PROM</span></div>
      {[["Sleep (ISI)", 18, 9, "moderate → mild"], ["Mood (GAD-7)", 12, 6, "moderate → mild"]].map(([l, pre, post, band]) => (
        <div key={l} style={{ ...subCard(crim), marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: UI, fontSize: 12, color: T.muted, marginBottom: 5 }}><span>{l}</span><span>{band}</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: T.muted }}>{pre}</span>
            <div style={{ flex: 1, height: 7, borderRadius: 999, background: T.paperDeep, overflow: "hidden" }}><div style={{ width: `${100 - (post / pre) * 100}%`, height: "100%", background: cwOf("sage").petal }} /></div>
            <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: cwOf("sage").petal }}>{post}</span>
          </div>
        </div>
      ))}
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "2px 0 0", lineHeight: 1.5 }}>Proof of benefit for you — and the “N women improved X” story for the business.</p>
    </Panel>
  );
}
function CohortPanel({ plum, navigate }) {
  return (
    <Panel label="Start together" Icon={Users} accent={plum}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+2</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>71–90% finish vs 15% alone</span></div>
      <div style={{ ...subCard(plum), marginBottom: 8 }}>
        <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: OXBLOOD }}>July cohort · 34 women started together</div>
        <div style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>A shared, anonymous progress wall — no names, no scores, just “we're in this together”.</div>
      </div>
      {/* anonymous progress wall */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
        {Array.from({ length: 34 }).map((_, i) => <span key={i} style={{ width: 16, height: 16, borderRadius: 5, background: i < 22 ? plum : `${plum}33` }} title={i < 22 ? "on track" : "resting" } />)}
      </div>
      <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, marginBottom: 8 }}>22 on track · 12 resting — every square is a woman, none of them named.</div>
      <button onClick={() => navigate(createPageUrl("Community"))} className="fw-elite-press" style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: plum, color: "#fff", border: "none", borderRadius: 12, padding: "11px 14px", fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer" }}><Users size={14} /> Your cohort becomes a private circle</button>
    </Panel>
  );
}
function BreadthPanel({ gold }) {
  return (
    <Panel label="Beyond the clinical" Icon={Compass} accent={gold}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+2</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>health is one room, not the house</span></div>
      {JOURNEYS.map((j) => (
        <div key={j.name} style={{ ...subCard(gold), marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ flexShrink: 0 }}><Bouquet items={[{ form: j.flower, colorway: j.cw }]} size={36} idx={`j-${j.name}`} /></span>
          <span><span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, display: "block" }}>{j.name}</span><span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>{j.dom}</span></span>
        </div>
      ))}
      <p style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "2px 0 0", lineHeight: 1.5 }}>Same goal→track→feedback spine. No competitor spans this.</p>
    </Panel>
  );
}
function PacingPanel({ sage }) {
  const [gentle, setGentle] = useState(true);
  return (
    <Panel label="Adaptive pacing" Icon={Gauge} accent={sage}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+2</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>tailored, honest</span></div>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 10px" }}>Pace tailors to your life-stage and progress. Gentler days around your period are <b>offered, never imposed</b> — comfort, not a performance claim.</p>
      <button onClick={() => setGentle((g) => !g)} className="fw-elite-press" style={{ width: "100%", fontFamily: UI, fontSize: 13, fontWeight: 700, padding: "10px", borderRadius: 11, background: gentle ? `${sage}1F` : T.paper, border: `1px solid ${gentle ? sage : T.paperDeep}`, color: gentle ? sage : T.inkSoft, cursor: "pointer" }}>{gentle ? "Gentler days around my period: ON" : "Gentler days around my period: off"}</button>
      <p style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "8px 0 0", lineHeight: 1.5 }}>The evidence: no proven phase effect on training adaptation — so we tint for comfort, never claim cycle-synced results.</p>
    </Panel>
  );
}
function GatedPanel({ crim }) {
  return (
    <Panel label="Two calls for you" Icon={Lock} accent={crim}>
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}><Bell size={15} color={crim} /><span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink }}>Real reminders fire</span><GatedTag /></div>
        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5, margin: 0 }}>Today <code>reminder_time</code> is stored but not delivered. Web-push needs notification infra + OS permission (a small service). <b>No-infra fallback:</b> in-app "due today" + a Today/calendar nudge — zero rule-risk.</p>
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}><UserCheck size={15} color={crim} /><span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink }}>Human coaching</span><GatedTag /></div>
        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5, margin: 0 }}>A cost/ops decision, not code. The Jess guide (rule-safe) delivers most of the supportive-accountability benefit at zero marginal cost — reserve human coaching for a premium Pro tier if you want it.</p>
      </div>
    </Panel>
  );
}

export default function ProgramsL2Demo() {
  const navigate = useNavigate();
  const gold = cwOf("gold").petal, sage = cwOf("sage").petal, crim = T.crimson, plum = cwOf("plum").petal;
  return (
    <L2Frame label="Programmes" shell={<ProgramsEliteShell />}>
      <L2Slider>
        <ClipboardSlider hint="Slide the +2 lenses →" accent={gold}>
          <Clipboard title="Stick with it" sub="GUIDE · CATCH-UP · GRADUATION" accent={plum} flower="cosmos" idx="cb-stick" titleColor={OXBLOOD}>
            <BoardBody><StackedCard topAccent={plum} bottomAccent={sage}
              top={[<GuidePanel key="g" plum={plum} />, <GraduationPanel key="gr" gold={gold} navigate={navigate} />]}
              bottom={[<CatchupPanel key="c" sage={sage} />]} />
            </BoardBody>
          </Clipboard>

          <Clipboard title="Outcomes & cohorts" sub="PRE/POST PROM · START TOGETHER" accent={gold} flower="sunflower" idx="cb-cohort" titleColor={OXBLOOD}>
            <BoardBody><StackedCard topAccent={gold} bottomAccent={plum}
              top={[<PromPanel key="p" crim={crim} />]}
              bottom={[<CohortPanel key="co" plum={plum} navigate={navigate} />]} />
            </BoardBody>
          </Clipboard>

          <Clipboard title="Beyond health" sub="WHOLE-LIFE JOURNEYS · PACING · THE CALLS" accent={sage} flower="iris" idx="cb-beyond" titleColor={OXBLOOD}>
            <BoardBody><StackedCard topAccent={sage} bottomAccent={crim}
              top={[<BreadthPanel key="b" gold={gold} />, <PacingPanel key="pa" sage={sage} />]}
              bottom={[<GatedPanel key="ga" crim={crim} />]} />
            </BoardBody>
          </Clipboard>
        </ClipboardSlider>
      </L2Slider>

      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${OXBLOOD}`, borderRadius: 16, padding: "14px 16px", margin: "18px 0" }}>
        <div style={{ ...lbl, color: OXBLOOD, marginBottom: 6 }}>What's rule-safe vs needs your call</div>
        <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.55, margin: 0 }}><b>Rule-safe (no new function):</b> the Jess guide (existing agent) · catch-up/rest · habit graduation · pre/post PROMs · cohorts + progress wall (new cohort entity) · whole-life journeys · adaptive pacing. <b>Needs your OK:</b> real push-notification delivery (infra) — with an in-app "due today" fallback; and human coaching (cost/ops — Jess is the rule-safe middle path). Live Programs is untouched.</p>
      </div>
    </L2Frame>
  );
}
