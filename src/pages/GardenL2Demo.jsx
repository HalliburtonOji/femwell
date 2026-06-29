// GardenL2Demo — GARDEN +2 demo (preview-only, seeded). Builds the garden-plan Level +1/+2
// features in the elite card language (extends GardenEliteShell): a RESPONSIVE companion with
// gentle states + Jess dialogue (wilts softly, ALWAYS recovers, never dies/scolds), a "felt
// that" cross-surface emotional ledger, self-compassion reflection prompts, WOOP/if-then/
// savouring goals, cyclical & seasonal tinting, and a "garden of gardens" with anonymous
// kindness acts + a "we're tending today" presence moment. NO gated function in the whole plan
// (companion dialogue rides the existing Jess agent; everything else is state/content/existing
// entities — a small "felt that" entity is fine). The one rule: care, never guilt. LIVE /Garden UNTOUCHED.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Sparkles, Feather, Target, Sun, Snowflake, Leaf,
  HandHeart, Users, Flower2, BookHeart } from "lucide-react";
import { T, SERIF, UI } from "@/components/journal/Editorial";
import { ClipboardSlider, Clipboard } from "@/components/brand/ClipboardSlider";
import { cwOf, RichBloomV2, Bouquet, Pollinator } from "@/components/brand/flora";
import { OXBLOOD, lbl, subCard, Panel, StackedCard, BoardBody } from "@/components/brand/SliderKit";
import GardenEliteShell from "@/components/garden-elite/GardenEliteShell";
import { L2Frame, L2Slider } from "@/components/demos/l2Frame";

const STATES = [
  { key: "flourishing", label: "Flourishing", bloom: "peony", cw: "crimson", line: "“You tended me three days running — I'm flourishing. Feel that with me for a second.”" },
  { key: "steady", label: "Steady", bloom: "cosmos", cw: "sage", line: "“Ticking along, the two of us. Nothing owed today — we can just be.”" },
  { key: "resting", label: "Resting", bloom: "poppy", cw: "plum", line: "“Rough week? I've softened a little, but I'm still here — and I always come back. Rest is part of it.”" },
];
const FELT = [
  { from: "Nutrition", line: "You cooked for yourself tonight.", flower: "marigold", cw: "gold" },
  { from: "Community", line: "You reached out in the Lounge.", flower: "clover", cw: "sage" },
  { from: "Journal", line: "You wrote three honest lines.", flower: "iris", cw: "plum" },
  { from: "Planner", line: "You took a rest day, on purpose.", flower: "lavender", cw: "plum" },
  { from: "Pulse", line: "You noticed your own pattern.", flower: "cosmos", cw: "blush" },
];
const PROMPTS = [
  { k: "open", l: "How are you, really?", v: "The open door — a line is plenty." },
  { k: "grateful", l: "Three small good things", v: "Gratitude — the most evidenced positive-writing variant." },
  { k: "best", l: "Your best possible self", v: "Imagine a day gone right — name one part of it." },
  { k: "accept", l: "Let a feeling be", v: "Name what's here without fixing it — emotion acceptance." },
];
const SEASONS = [
  { key: "spring", label: "Spring", Icon: Leaf, bloom: "cosmos", cw: "blush", bg: "#F4EFE3", note: "rising · new buds" },
  { key: "summer", label: "Summer", Icon: Sun, bloom: "sunflower", cw: "gold", bg: "#FBF4E1", note: "open · brightest" },
  { key: "autumn", label: "Autumn", Icon: Leaf, bloom: "dahlia", cw: "plum", bg: "#F2E9DC", note: "turning inward · harvest" },
  { key: "winter", label: "Winter", Icon: Snowflake, bloom: "snowdrop", cw: "sage", bg: "#EFEFE6", note: "resting · a bud on old wood" },
];
function Lvl({ children }) { return <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#fff", background: OXBLOOD, borderRadius: 999, padding: "2px 8px" }}>{children}</span>; }

function CompanionPanel({ crim }) {
  const [s, setS] = useState(0);
  const st = STATES[s];
  return (
    <Panel label="Your companion" Icon={Heart} accent={crim}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+1</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>responds · recovers · never dies</span></div>
      <div style={{ display: "flex", justifyContent: "center", margin: "2px 0 6px" }}><RichBloomV2 form={st.bloom} color={cwOf(st.cw).petal} color2={cwOf(st.cw).tip} accent={T.gold} size={92} animate soft idx={`comp-${st.key}`} /></div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {STATES.map((x, i) => <button key={x.key} onClick={() => setS(i)} className="fw-elite-press" style={{ flex: 1, fontFamily: UI, fontSize: 12, fontWeight: 700, padding: "7px 4px", borderRadius: 10, background: s === i ? `${cwOf(x.cw).petal}1F` : T.paper, border: `1px solid ${s === i ? cwOf(x.cw).petal : T.paperDeep}`, color: s === i ? cwOf(x.cw).petal : T.inkSoft, cursor: "pointer" }}>{x.label}</button>)}
      </div>
      <div style={{ ...subCard(crim) }}><p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.ink, lineHeight: 1.5, margin: 0 }}>{st.line}</p></div>
      <p style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "8px 0 0", lineHeight: 1.5 }}>Dialogue rides the existing Jess agent — no function. It softens on a hard week, never scolds, always comes back.</p>
    </Panel>
  );
}
function FeltPanel({ gold }) {
  return (
    <Panel label="“Felt that”" Icon={Sparkles} accent={gold}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+1</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>an emotional ledger from every surface</span></div>
      {FELT.map((f) => (
        <div key={f.from} style={{ ...subCard(gold), marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ flexShrink: 0 }}><Bouquet items={[{ form: f.flower, colorway: f.cw }]} size={34} idx={`felt-${f.from}`} /></span>
          <span><span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, display: "block", lineHeight: 1.3 }}>{f.line}</span><span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.muted }}>from {f.from} · the garden noticed</span></span>
        </div>
      ))}
      <p style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "2px 0 0", lineHeight: 1.5 }}>Every surface feeds one living thing — self-expression + achievement, reflected back symbolically.</p>
    </Panel>
  );
}
function ReflectPanel({ plum }) {
  const [p, setP] = useState(0);
  const pr = PROMPTS[p];
  return (
    <Panel label="A gentle reflection" Icon={Feather} accent={plum}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+1</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>offered, never forced · a line is plenty</span></div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {PROMPTS.map((x, i) => <button key={x.k} onClick={() => setP(i)} className="fw-elite-press" style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, padding: "6px 10px", borderRadius: 999, background: p === i ? `${plum}1F` : T.paper, border: `1px solid ${p === i ? plum : T.paperDeep}`, color: p === i ? plum : T.inkSoft, cursor: "pointer" }}>{x.l}</button>)}
      </div>
      <div style={{ ...subCard(plum), marginBottom: 8 }}><div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: OXBLOOD }}>{pr.l}</div><div style={{ fontFamily: UI, fontSize: 12, color: T.muted, marginTop: 2 }}>{pr.v}</div></div>
      <textarea placeholder="a line is plenty…" rows={2} style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 11, background: T.paper, border: `1px solid ${T.paperDeep}`, fontFamily: SERIF, fontSize: 15, color: T.ink, outline: "none", resize: "none" }} />
    </Panel>
  );
}
function WoopPanel({ gold }) {
  return (
    <Panel label="Goals that actually work" Icon={Target} accent={gold}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+2</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>WOOP · if-then · savouring</span></div>
      {[["Wish", "Feel steadier in the mornings"], ["Outcome", "Calmer, less rushed"], ["Obstacle", "I snooze and then panic"], ["Plan (if-then)", "If the alarm goes, then I sit up and open the window"]].map(([h, v]) => (
        <div key={h} style={{ ...subCard(gold), marginBottom: 5 }}><div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: gold }}>{h}</div><div style={{ fontFamily: SERIF, fontSize: 14, color: T.ink }}>{v}</div></div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 6, fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted }}><Flower2 size={14} color={gold} /> Savour the win when it lands — the garden grows a bloom, not a tick.</div>
    </Panel>
  );
}
function SeasonPanel() {
  const [si, setSi] = useState(1);
  const s = SEASONS[si];
  return (
    <Panel label="Seasonal & cyclical tint" Icon={Sun} accent={cwOf(s.cw).petal}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+2</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>the living-thing knows the time of year</span></div>
      <div style={{ background: s.bg, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "14px", display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 8 }}>
        <RichBloomV2 form={s.bloom} color={cwOf(s.cw).petal} color2={cwOf(s.cw).tip} accent={T.gold} size={78} animate soft idx={`season-${s.key}`} />
        <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: OXBLOOD, marginTop: 4 }}>{s.label}</span>
        <span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>{s.note}</span>
      </div>
      <div style={{ display: "flex", gap: 5 }}>
        {SEASONS.map((x, i) => <button key={x.key} onClick={() => setSi(i)} className="fw-elite-press" style={{ flex: 1, fontFamily: UI, fontSize: 11, fontWeight: 700, padding: "7px 2px", borderRadius: 9, background: si === i ? `${cwOf(x.cw).petal}1F` : T.paper, border: `1px solid ${si === i ? cwOf(x.cw).petal : T.paperDeep}`, color: si === i ? cwOf(x.cw).petal : T.inkSoft, cursor: "pointer" }}>{x.label}</button>)}
      </div>
      <p style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "8px 0 0", lineHeight: 1.5 }}>Palette, light and blooms shift with your cycle phase + the real season — client-side, no function.</p>
    </Panel>
  );
}
function CollectivePanel({ sage, navigate }) {
  const [sent, setSent] = useState(false);
  return (
    <Panel label="Garden of gardens" Icon={Users} accent={sage}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+2</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>grow — and be kind — together</span></div>
      <div style={{ ...subCard(sage), display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Pollinator kind="bee" size={26} color={T.gold} animate idx="collective-bee" />
        <span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.3 }}><b>312 women are tending today.</b> A shared seasonal bloom opens when enough of you show up.</span>
      </div>
      {sent ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: `${sage}14`, border: `1px solid ${sage}`, borderRadius: 12, padding: "11px", fontFamily: UI, fontSize: 13, fontWeight: 700, color: "#3f6b3f" }}><HandHeart size={15} /> Your kind line is on its way to a stranger</div>
      ) : (
        <button onClick={() => setSent(true)} className="fw-elite-press" style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: sage, color: "#fff", border: "none", borderRadius: 12, padding: "11px 14px", fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer" }}><BookHeart size={14} /> Leave an encouraging line for a stranger</button>
      )}
      <button onClick={() => navigate(createPageUrl("Community"))} className="fw-elite-press" style={{ width: "100%", marginTop: 7, fontFamily: UI, fontSize: 12, fontWeight: 700, padding: "9px", borderRadius: 11, background: T.paper, border: `1px solid ${T.paperDeep}`, color: T.inkSoft, cursor: "pointer" }}>Ties into the Community room</button>
      <p style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "8px 0 0", lineHeight: 1.5 }}>Kindness reduces loneliness — women gain most. Anonymous-safe (à la Kindness-by-Post).</p>
    </Panel>
  );
}

export default function GardenL2Demo() {
  const navigate = useNavigate();
  const gold = cwOf("gold").petal, sage = cwOf("sage").petal, crim = T.crimson, plum = cwOf("plum").petal;
  return (
    <L2Frame label="Garden" shell={<GardenEliteShell />}>
      <L2Slider>
        <ClipboardSlider hint="Slide the +2 lenses →" accent={gold}>
          <Clipboard title="Alive" sub="COMPANION · FELT-THAT · REFLECTION" accent={crim} flower="peony" idx="cb-alive" titleColor={OXBLOOD}>
            <BoardBody><StackedCard topAccent={crim} bottomAccent={gold}
              top={[<CompanionPanel key="c" crim={crim} />, <ReflectPanel key="r" plum={plum} />]}
              bottom={[<FeltPanel key="f" gold={gold} />]} />
            </BoardBody>
          </Clipboard>

          <Clipboard title="Growing" sub="WOOP GOALS · SEASONAL TINT" accent={gold} flower="sunflower" idx="cb-growing" titleColor={OXBLOOD}>
            <BoardBody><StackedCard topAccent={gold} bottomAccent={sage}
              top={[<WoopPanel key="w" gold={gold} />]}
              bottom={[<SeasonPanel key="s" />]} />
            </BoardBody>
          </Clipboard>

          <Clipboard title="Together" sub="GARDEN OF GARDENS · KINDNESS · PRESENCE" accent={sage} flower="clover" idx="cb-together" titleColor={OXBLOOD}>
            <BoardBody><StackedCard topAccent={sage} bottomAccent={plum}
              top={[<CollectivePanel key="co" sage={sage} navigate={navigate} />]}
              bottom={[<Panel key="presence" label="We're tending today" Icon={Users} accent={plum}><div style={{ textAlign: "center", padding: "6px 0" }}><Pollinator kind="butterfly" size={40} color={cwOf("blush").petal} animate idx="pres-bf" /><p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: T.ink, margin: "8px 0 0", lineHeight: 1.5 }}>A quiet, live “we're here together” moment — collective effervescence, not a leaderboard. A shared bloom opens for everyone when enough of you show up.</p></div></Panel>]} />
            </BoardBody>
          </Clipboard>
        </ClipboardSlider>
      </L2Slider>

      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${OXBLOOD}`, borderRadius: 16, padding: "14px 16px", margin: "18px 0" }}>
        <div style={{ ...lbl, color: OXBLOOD, marginBottom: 6 }}>Rule-safe — no gated function in the whole plan</div>
        <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.55, margin: 0 }}>Companion dialogue rides the <b>existing Jess agent</b>; states, the “felt that” ledger (a small additive entity), WOOP goals, seasonal tinting, kindness acts and the “tending today” presence are all state + content + existing entities. <b>The only rule:</b> keep the Garden uncompromisingly care-based — no “your companion misses you” guilt. Live Garden is untouched.</p>
      </div>
    </L2Frame>
  );
}
