// PulseL2Demo — PULSE +2 demo (preview-only, seeded). Builds the pulse-plan Level +1/+2
// features ON the elite Pulse design (extends PulseEliteShell — never regresses it): own-median
// predictions + error bars, predicted-symptom forecasting, the "this cycle is different → NHS"
// anomaly flag, an anxiety-safe dial, a guarded cross-life-domain CORRELATION engine, a clinician
// export (→ Doctor Export), a "your year in patterns" retrospective, and the wearable import as a
// clearly-LABELLED "Needs sign-off" stub (the one gated capability — never a capped function).
// Full elite card language: FwFloraHero + SummaryCard + ClipboardSlider of StackedCard top/bottom
// sub-sliders + gold hairline + oxblood headings + flora + top chrome. LIVE /Pulse UNTOUCHED.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, Brain, Sparkles, Activity, ShieldAlert, TrendingUp, FileDown,
  Link2, Watch, Lock, Sun, Moon, HeartPulse, Wallet, Users, SlidersHorizontal } from "lucide-react";
import { createPageUrl } from "@/utils";
import { T, SERIF, UI, PAPER_BG } from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { ClipboardSlider, Clipboard } from "@/components/brand/ClipboardSlider";
import { cwOf, floraKeyframes, Bouquet } from "@/components/brand/flora";
import { OXBLOOD, lbl, subCard, focusPill, Panel, StackedCard, BoardBody, SliderArrows } from "@/components/brand/SliderKit";

const ELITE_MOTION = `.fw-elite-in{animation:fwEliteIn .5s cubic-bezier(.215,.61,.355,1) both}@keyframes fwEliteIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}.fw-elite-press{transition:transform .12s ease}.fw-elite-press:active{transform:scale(.97)}@media (prefers-reduced-motion:reduce){.fw-elite-in,.fw-elite-press{animation:none!important;transition:none!important}}`;

// ── seeded demo data ──
const PRED = { window: "12–15 Jul", median: 30, low: 28, high: 33, conf: "medium" };
const FORECAST = [
  { sym: "Headaches", when: "late-luteal · days 24–28", note: "logged 3 cycles running", strong: true },
  { sym: "Lower energy", when: "this week", note: "a gentle tendency", strong: false },
  { sym: "Tender breasts", when: "days 25–28", note: "2 of your last 3 cycles", strong: false },
];
const CORR = [
  { a: "Better sleep", b: "steadier mood next day", Ai: Moon, Bi: Sun, strength: 0.78, dom: "Rest ↔ Mood" },
  { a: "More movement", b: "higher energy", Ai: Activity, Bi: HeartPulse, strength: 0.6, dom: "Body ↔ Energy" },
  { a: "Your luteal week", b: "fewer social plans", Ai: CalendarDays, Bi: Users, strength: 0.52, dom: "Phase ↔ Social" },
  { a: "Pre-period days", b: "a little more spending", Ai: CalendarDays, Bi: Wallet, strength: 0.44, dom: "Phase ↔ Money" },
];
const YEAR = [
  { season: "Winter", bloom: "snowdrop", cw: "sage", note: "Quieter cycles, deeper rest — your mood held steady." },
  { season: "Spring", bloom: "cosmos", cw: "blush", note: "Energy climbed; you logged the most movement of the year." },
  { season: "Summer", bloom: "sunflower", cw: "gold", note: "Brightest social stretch — and your shortest cycles." },
  { season: "Autumn", bloom: "dahlia", cw: "plum", note: "You turned inward, and tended more than you took." },
];

function Bar({ pct, color }) { return <div style={{ height: 7, borderRadius: 999, background: T.paperDeep, overflow: "hidden" }}><div style={{ width: `${Math.round(pct * 100)}%`, height: "100%", background: color, borderRadius: 999 }} /></div>; }
function Lvl({ children }) { return <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#fff", background: OXBLOOD, borderRadius: 999, padding: "2px 8px" }}>{children}</span>; }

// ── PANELS ──
function PredictionPanel({ crim }) {
  return (
    <Panel label="Period window" Icon={CalendarDays} accent={crim}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+1</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>your median, not 28</span></div>
      <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: T.ink }}>Likely {PRED.window}</div>
      <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "2px 0 10px" }}>Anchored to your own ~{PRED.median}-day median — a window, never a single confident date.</p>
      {/* error-bar window */}
      <div style={{ position: "relative", height: 26, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 8, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: "30%", width: "40%", top: 0, bottom: 0, background: `${crim}22`, borderLeft: `2px solid ${crim}`, borderRight: `2px solid ${crim}` }} />
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: crim }} />
        <span style={{ position: "absolute", left: 6, top: 5, fontFamily: UI, fontSize: 11, color: T.muted }}>{PRED.low}d</span>
        <span style={{ position: "absolute", right: 6, top: 5, fontFamily: UI, fontSize: 11, color: T.muted }}>{PRED.high}d</span>
      </div>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "10px 0 0", lineHeight: 1.5 }}>Stress, sleep or travel can shift this — it's a pattern, not a promise.</p>
    </Panel>
  );
}
function ForecastPanel({ plum }) {
  return (
    <Panel label="What's likely this cycle" Icon={Brain} accent={plum}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+1</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>predicted-symptom forecast</span></div>
      {FORECAST.map((f) => (
        <div key={f.sym} style={{ ...subCard(plum), marginBottom: 7 }}>
          <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink }}>{f.sym}{f.strong && <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: plum, marginLeft: 7 }}>likely</span>}</div>
          <div style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>{f.when} · {f.note}</div>
        </div>
      ))}
      <p style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "4px 0 0", lineHeight: 1.5 }}>Forward-looking from your own logged cycles — phrased as tendency, never certainty.</p>
    </Panel>
  );
}
function DialPanel({ gold }) {
  const [detail, setDetail] = useState(1);
  return (
    <Panel label="Anxiety-safe dial" Icon={SlidersHorizontal} accent={gold}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 10px" }}>Patterns, not scores. Turn the numbers up if you want detail, or down to a gentle narrative.</p>
      <div style={{ display: "flex", gap: 7 }}>
        {[["Gentle", 0], ["Balanced", 1], ["Detailed", 2]].map(([l, v]) => (
          <button key={v} onClick={() => setDetail(v)} className="fw-elite-press" style={{ flex: 1, fontFamily: UI, fontSize: 13, fontWeight: 700, padding: "9px 6px", borderRadius: 10, background: detail === v ? `${gold}1F` : T.paper, border: `1px solid ${detail === v ? gold : T.paperDeep}`, color: detail === v ? OXBLOOD : T.inkSoft, cursor: "pointer" }}>{l}</button>
        ))}
      </div>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "10px 0 0", lineHeight: 1.5 }}>{detail === 0 ? "“A calmer week's likely — be kind to your energy.”" : detail === 2 ? "Median 30d · luteal day 22 · headache risk ↑ · energy ↓ 18% vs follicular." : "“Lower energy is likely this week — plan gently.”"}</p>
    </Panel>
  );
}
function CorrelationPanel({ sage }) {
  return (
    <Panel label="What goes with what" Icon={Link2} accent={sage}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+2</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>across your whole life</span></div>
      {CORR.map((c) => (
        <div key={c.dom} style={{ ...subCard(sage), marginBottom: 7 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <c.Ai size={13} color={sage} /><span style={{ fontFamily: SERIF, fontSize: 14, color: T.ink }}>{c.a}</span>
            <TrendingUp size={12} color={T.muted} /><c.Bi size={13} color={sage} /><span style={{ fontFamily: SERIF, fontSize: 14, color: T.ink }}>{c.b}</span>
          </div>
          <Bar pct={c.strength} color={sage} />
          <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 3 }}>{c.dom} · {c.strength >= 0.7 ? "strong" : c.strength >= 0.5 ? "moderate" : "gentle"} association</div>
        </div>
      ))}
      <p style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "4px 0 0", lineHeight: 1.5 }}><b>These go together — they don't prove cause.</b> Your data, your read.</p>
    </Panel>
  );
}
function AnomalyPanel({ crim, navigate }) {
  return (
    <Panel label="This cycle is different" Icon={ShieldAlert} accent={crim}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+1</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>gentle safety flag</span></div>
      <div style={{ background: "#FBEEE8", border: `1px solid ${crim}`, borderRadius: 12, padding: "12px 14px" }}>
        <p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.5, margin: 0 }}>This cycle's run to <b>38 days</b> — longer than your usual ~30. One long cycle is common and rarely anything. If it keeps up, or something feels off, it's worth a word with your GP.</p>
      </div>
      <button onClick={() => navigate(createPageUrl("Health"))} className="fw-elite-press" style={{ width: "100%", marginTop: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: crim, color: "#fff", border: "none", borderRadius: 12, padding: "11px 14px", fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer" }}><ShieldAlert size={14} /> NHS-grounded guidance</button>
      <p style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "8px 0 0", lineHeight: 1.5 }}>Evidence-led, never alarmist — it routes to the Health room, never diagnoses.</p>
    </Panel>
  );
}
function ExportPanel({ gold, navigate }) {
  return (
    <Panel label="A real clinician export" Icon={FileDown} accent={gold}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+1</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>replaces window.print()</span></div>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 10px" }}>Your phase patterns, anomaly flags and trends — curated into a handoff a GP can actually use. Prospective data has real clinical value.</p>
      <div style={{ ...subCard(gold), marginBottom: 10 }}>
        {["Cycle length & variability (your median)", "Symptoms by phase, last 6 cycles", "The flagged longer cycle", "Mood & energy trend"].map((l) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 7, padding: "3px 0", fontFamily: SERIF, fontSize: 14, color: T.ink }}><span style={{ width: 5, height: 5, borderRadius: 99, background: gold }} /> {l}</div>
        ))}
      </div>
      <button onClick={() => navigate(createPageUrl("DoctorExport"))} className="fw-elite-press" style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: gold, color: "#fff", border: "none", borderRadius: 12, padding: "11px 14px", fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer" }}><FileDown size={14} /> Open in Doctor Export</button>
    </Panel>
  );
}
function RetroPanel({ plum }) {
  return (
    <Panel label="Your year in patterns" Icon={Sparkles} accent={plum}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+2</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>a story, not a scoreboard</span></div>
      {YEAR.map((y) => (
        <div key={y.season} style={{ display: "flex", gap: 10, alignItems: "center", ...subCard(plum), marginBottom: 7 }}>
          <span style={{ flexShrink: 0 }}><Bouquet items={[{ form: y.bloom, colorway: y.cw }]} size={42} idx={`yr-${y.season}`} /></span>
          <span><span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: OXBLOOD, display: "block" }}>{y.season}</span><span style={{ fontFamily: SERIF, fontSize: 14, color: T.inkSoft, lineHeight: 1.4 }}>{y.note}</span></span>
        </div>
      ))}
    </Panel>
  );
}
function WearablePanel({ crim }) {
  return (
    <Panel label="Wearable trends" Icon={Watch} accent={crim}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+2</Lvl><span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: "#fff", background: crim, borderRadius: 999, padding: "2px 8px", display: "inline-flex", alignItems: "center", gap: 4 }}><Lock size={11} /> NEEDS SIGN-OFF</span></div>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 10px" }}>Temp / resting HR / HRV by phase — the <code>WearableSync</code> entity + card already exist; this fills them from a real device.</p>
      {/* seeded preview of what it'd look like */}
      {[["Wrist temp", 0.7, "+0.3°C luteal"], ["Resting HR", 0.55, "+4 bpm late-luteal"], ["HRV", 0.4, "lower premenstrually"]].map(([l, p, n]) => (
        <div key={l} style={{ marginBottom: 8 }}><div style={{ display: "flex", justifyContent: "space-between", fontFamily: UI, fontSize: 12, color: T.muted, marginBottom: 3 }}><span>{l}</span><span>{n}</span></div><Bar pct={p} color={`${crim}99`} /></div>
      ))}
      <div style={{ background: T.paper, border: `1px dashed ${crim}`, borderRadius: 12, padding: "11px 13px", marginTop: 6 }}>
        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5, margin: 0 }}><b>Gated:</b> live Apple Health / Oura import needs an OAuth pull = one small server function + stored device tokens. <b>No-function fallback:</b> a manual CSV/Apple-Health-export upload (rule-safe v1). Never a contraceptive claim.</p>
      </div>
    </Panel>
  );
}

export default function PulseL2Demo() {
  const navigate = useNavigate();
  const gold = cwOf("gold").petal, sage = cwOf("sage").petal, crim = T.crimson, plum = cwOf("plum").petal;
  const jumpTo = (i) => { const track = document.querySelector(".fw-clipboard-track"); if (!track) return; const kids = [...track.children].filter((c) => c.offsetWidth > 40); if (kids[i]) track.scrollLeft = kids[i].offsetLeft - track.offsetLeft; };
  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }}>
      <style>{floraKeyframes}{ELITE_MOTION}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: T.paperHi, borderBottom: `1px solid ${T.paperDeep}` }}>
        <button onClick={() => navigate(createPageUrl("Ideas"))} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "5px 11px", cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted }}><ArrowLeft size={13} /> Ideas</button>
        <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: OXBLOOD }}>Pulse +2 · demo</span>
      </div>

      <div style={{ maxWidth: 430, margin: "0 auto", padding: "16px 16px 0" }} className="fw-elite-in">
        <FwFloraHero title="Your pulse" colorway="plum" bloom="dahlia" flankL="chamomile" flankR="sunflower" titleColor={OXBLOOD} creature="dragonfly"
          line="What your body repeats — now honest about its own median, forward-looking, and gentle by design." />
        <div style={{ display: "flex", justifyContent: "center", marginTop: -6, marginBottom: 8 }}>
          <Bouquet items={[{ form: "dahlia", colorway: "plum" }, { form: "cosmos", colorway: "sage" }, { form: "sunflower", colorway: "gold" }]} size={148} animate idx="pulse-bq" />
        </div>
        <SummaryCard eyebrow="This week, honestly" accent={gold} rows={[
          { Icon: CalendarDays, label: "Period window", text: `Likely ${PRED.window} — your ~${PRED.median}-day median, with a window not a date`, onClick: () => jumpTo(0) },
          { Icon: ShieldAlert, label: "Safety flag", text: "This cycle's longer than usual — a gentle, NHS-routed heads-up", onClick: () => jumpTo(1) },
          { Icon: Sparkles, label: "Your year", text: "Your cycle, mood and life across the year — as a story", onClick: () => jumpTo(2) },
        ]} />
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={() => jumpTo(0)} className="fw-elite-press" style={focusPill(plum)}><Brain size={16} /> What's likely</button>
          <button onClick={() => jumpTo(2)} className="fw-elite-press" style={focusPill(gold)}><FileDown size={16} /> Clinician export</button>
        </div>

        <div style={{ position: "relative", marginTop: 16 }}>
          <SliderArrows sliderRef={{ current: typeof document !== "undefined" ? document : null }} />
          <ClipboardSlider hint="Slide your pulse →" accent={gold}>
            <Clipboard title="This week" sub="OWN-MEDIAN PREDICTIONS · FORECAST · DIAL" accent={plum} flower="cosmos" idx="cb-week" titleColor={OXBLOOD}>
              <BoardBody><StackedCard topAccent={crim} bottomAccent={plum}
                top={[<PredictionPanel key="p" crim={crim} />, <ForecastPanel key="f" plum={plum} />]}
                bottom={[<DialPanel key="d" gold={gold} />, <Panel key="glance" label="At a glance" Icon={Activity} accent={sage}><p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5 }}>Luteal · day 22. Energy easing, mood steady. A good week for less, on purpose.</p></Panel>]} />
              </BoardBody>
            </Clipboard>

            <Clipboard title="Patterns" sub="CORRELATIONS · THE SAFETY FLAG" accent={sage} flower="iris" idx="cb-patterns" titleColor={OXBLOOD}>
              <BoardBody><StackedCard topAccent={sage} bottomAccent={crim}
                top={[<CorrelationPanel key="c" sage={sage} />]}
                bottom={[<AnomalyPanel key="a" crim={crim} navigate={navigate} />]} />
              </BoardBody>
            </Clipboard>

            <Clipboard title="Over time" sub="EXPORT · RETROSPECTIVE · WEARABLE" accent={gold} flower="dahlia" idx="cb-over" titleColor={OXBLOOD}>
              <BoardBody><StackedCard topAccent={gold} bottomAccent={plum}
                top={[<ExportPanel key="e" gold={gold} navigate={navigate} />, <RetroPanel key="r" plum={plum} />]}
                bottom={[<WearablePanel key="w" crim={crim} />]} />
              </BoardBody>
            </Clipboard>
          </ClipboardSlider>
        </div>

        <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${OXBLOOD}`, borderRadius: 16, padding: "14px 16px", margin: "18px 0" }}>
          <div style={{ ...lbl, color: OXBLOOD, marginBottom: 6 }}>What's rule-safe vs needs your call</div>
          <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.55, margin: 0 }}><b>Rule-safe (no new function):</b> own-median predictions + error bars · symptom forecasting · the anomaly flag · the anxiety dial · the correlation engine · the year retrospective · clinician export · manual CSV import. <b>Needs your OK (one function, with a fallback):</b> live device import via OAuth — or ship the manual-CSV fallback with zero rule-risk. Live Pulse is untouched.</p>
        </div>
      </div>
    </div>
  );
}
