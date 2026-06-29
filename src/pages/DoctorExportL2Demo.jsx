// DoctorExportL2Demo — DOCTOR EXPORT +2 demo (preview-only, seeded). Builds the
// doctor-export-plan Level +1/+2 features in the elite card language (extends the live
// builder, never regresses it): condition-specific templates mapped to NICE criteria,
// an embedded validated PROM per template, a most-bothersome anchor + Ask-3/BRAN
// scaffolds, a red-flag surfacer → NHS 2-week-wait, a frequency×severity symptom
// timeline, a plain↔clinical language toggle, a two-tier export (impact + full diary),
// and a post-appointment loop. The one tension — secure-link sharing — is flagged as
// NOT recommended (keep the on-device PDF + "your right to your data"). LIVE /DoctorExport UNTOUCHED.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Stethoscope, ClipboardList, ShieldAlert, Activity, FileText, MessageSquare,
  RotateCcw, Lock, CheckCircle2, HelpCircle } from "lucide-react";
import { createPageUrl } from "@/utils";
import { T, SERIF, UI, PAPER_BG } from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { ClipboardSlider, Clipboard } from "@/components/brand/ClipboardSlider";
import { cwOf, floraKeyframes, Bouquet } from "@/components/brand/flora";
import { OXBLOOD, lbl, subCard, focusPill, Panel, StackedCard, BoardBody, SliderArrows } from "@/components/brand/SliderKit";

const ELITE_MOTION = `.fw-elite-in{animation:fwEliteIn .5s cubic-bezier(.215,.61,.355,1) both}@keyframes fwEliteIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}.fw-elite-press{transition:transform .12s ease}.fw-elite-press:active{transform:scale(.97)}@media (prefers-reduced-motion:reduce){.fw-elite-in,.fw-elite-press{animation:none!important;transition:none!important}}`;

const TEMPLATES = [
  { key: "meno", name: "Meno / peri", nice: "NICE NG23", prom: "Greene Climacteric Scale (21-item)", sections: "Vasomotor symptoms · menstrual-change timeline · mood/sleep · life-impact", note: "Clinical diagnosis 45+, no blood test — never pushes FSH." },
  { key: "hmb", name: "Heavy bleeding (HMB)", nice: "NICE NG88", prom: "PBAC / HMB-VAS", sections: "Life-impact (days lost, flooding) · flow · clot/cycle pattern", note: "Defined by impact on quality of life, not just flow." },
  { key: "endo", name: "Endometriosis", nice: "NICE NG73", prom: "Pain + impact diary", sections: "Cyclical pain map · impact diary · GI/bladder · fertility", note: "Cyclical pain + impact — the diary GPs need to refer." },
  { key: "pcos", name: "PCOS", nice: "2023 intl. guideline", prom: "Cycle + androgenic history", sections: "Cycle irregularity · androgenic symptoms · AMH (can replace ultrasound)", note: "Rotterdam 2-of-3 — surfaces the criteria the GP applies." },
  { key: "migraine", name: "Migraine", nice: "Cyclicity-aware", prom: "Attack timeline", sections: "Attack timeline · acute-med-overuse days · cycle link", note: "Flags menstrual cyclicity + medication-overuse days." },
];
const REDFLAGS = [
  "Any postmenopausal bleeding → suspected-cancer (2-week-wait) pathway",
  "A bleed lasting > 7 days",
  "Bleeding after sex (post-coital)",
];
const ASK3 = ["What are my options?", "What are the benefits & harms of each?", "How likely is each to happen to me?"];
const BRAN = ["Benefits", "Risks", "Alternatives", "Nothing (what if we wait?)"];
const TIMELINE = [3, 4, 2, 5, 6, 4, 7, 5, 3, 6, 8, 5]; // freq×severity, 12 weeks (seeded)

function Lvl({ children }) { return <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#fff", background: OXBLOOD, borderRadius: 999, padding: "2px 8px" }}>{children}</span>; }

function TemplatePanel({ crim }) {
  const [pick, setPick] = useState("meno");
  const t = TEMPLATES.find((x) => x.key === pick);
  return (
    <Panel label="Condition templates" Icon={Stethoscope} accent={crim}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+1</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>mapped to the exact NICE criteria</span></div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
        {TEMPLATES.map((x) => <button key={x.key} onClick={() => setPick(x.key)} className="fw-elite-press" style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, padding: "6px 11px", borderRadius: 999, background: pick === x.key ? `${crim}1F` : T.paper, border: `1px solid ${pick === x.key ? crim : T.paperDeep}`, color: pick === x.key ? crim : T.inkSoft, cursor: "pointer" }}>{x.name}</button>)}
      </div>
      <div style={{ ...subCard(crim) }}>
        <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: OXBLOOD }}>{t.name} <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.muted }}>· {t.nice}</span></div>
        <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "4px 0" }}>Pre-selects: {t.sections}</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 12, fontWeight: 700, color: crim, background: `${crim}14`, borderRadius: 8, padding: "4px 9px", margin: "4px 0" }}><CheckCircle2 size={13} /> PROM: {t.prom}</div>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "4px 0 0", lineHeight: 1.5 }}>{t.note}</p>
      </div>
    </Panel>
  );
}
function PrepPanel({ plum }) {
  const [mb, setMb] = useState("");
  const [mode, setMode] = useState("ask3");
  const list = mode === "ask3" ? ASK3 : BRAN;
  return (
    <Panel label="Walk in prepared" Icon={ClipboardList} accent={plum}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+1</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>the anchor GPs triage on</span></div>
      <div style={{ ...lbl, color: plum, marginBottom: 5 }}>The one thing bothering me most</div>
      <input value={mb} onChange={(e) => setMb(e.target.value)} placeholder="e.g. flooding I can't leave the house through" style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 11, background: T.paper, border: `1px solid ${T.paperDeep}`, fontFamily: SERIF, fontSize: 15, color: T.ink, outline: "none", marginBottom: 10 }} />
      <div style={{ display: "flex", gap: 7, marginBottom: 8 }}>
        {[["ask3", "Ask 3"], ["bran", "BRAN"]].map(([v, l]) => <button key={v} onClick={() => setMode(v)} className="fw-elite-press" style={{ flex: 1, fontFamily: UI, fontSize: 13, fontWeight: 700, padding: "8px", borderRadius: 10, background: mode === v ? `${plum}1F` : T.paper, border: `1px solid ${mode === v ? plum : T.paperDeep}`, color: mode === v ? plum : T.inkSoft, cursor: "pointer" }}>{l}</button>)}
      </div>
      {list.map((q) => <div key={q} style={{ display: "flex", alignItems: "flex-start", gap: 7, fontFamily: SERIF, fontSize: 14, color: T.ink, padding: "3px 0" }}><HelpCircle size={14} color={plum} style={{ flexShrink: 0, marginTop: 2 }} /> {q}</div>)}
      <p style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "6px 0 0" }}>NHS-endorsed, RCT-backed (raises shared decisions, time-neutral).</p>
    </Panel>
  );
}
function PromPanel({ gold }) {
  return (
    <Panel label="A PROM the GP recognises" Icon={CheckCircle2} accent={gold}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+1</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>Greene Climacteric Scale</span></div>
      {[["Psychological", 0.55], ["Somatic", 0.7], ["Vasomotor", 0.85], ["Sexual", 0.4]].map(([d, p]) => (
        <div key={d} style={{ marginBottom: 8 }}><div style={{ display: "flex", justifyContent: "space-between", fontFamily: UI, fontSize: 12, color: T.muted, marginBottom: 3 }}><span>{d}</span><span>{Math.round(p * 21)}/21</span></div><div style={{ height: 7, borderRadius: 999, background: T.paperDeep, overflow: "hidden" }}><div style={{ width: `${p * 100}%`, height: "100%", background: gold }} /></div></div>
      ))}
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "4px 0 0", lineHeight: 1.5 }}>A recognised, free instrument — so the export reads as clinical, not bespoke. (PBAC/HMB-VAS embed the same way for bleeding.)</p>
    </Panel>
  );
}
function RedFlagPanel({ crim, navigate }) {
  return (
    <Panel label="Red-flag safety net" Icon={ShieldAlert} accent={crim}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+1</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>routes urgent signs to the NHS</span></div>
      <div style={{ background: "#FBEEE8", border: `1px solid ${crim}`, borderRadius: 12, padding: "12px 14px" }}>
        <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: crim, marginBottom: 6 }}>SCANNED YOUR LOGS — one to raise soon</div>
        {REDFLAGS.map((r) => <div key={r} style={{ display: "flex", alignItems: "flex-start", gap: 7, fontFamily: SERIF, fontSize: 14, color: T.ink, padding: "3px 0", lineHeight: 1.4 }}><ShieldAlert size={13} color={crim} style={{ flexShrink: 0, marginTop: 2 }} /> {r}</div>)}
      </div>
      <button onClick={() => navigate(createPageUrl("Health"))} className="fw-elite-press" style={{ width: "100%", marginTop: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: crim, color: "#fff", border: "none", borderRadius: 12, padding: "11px 14px", fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer" }}><ShieldAlert size={14} /> NHS 2-week-wait guidance</button>
      <p style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "8px 0 0", lineHeight: 1.5 }}>Never diagnoses — it flags, explains calmly, and points to the NHS. The ethical must-have.</p>
    </Panel>
  );
}
function TimelinePanel({ sage }) {
  const max = Math.max(...TIMELINE);
  return (
    <Panel label="Symptom timeline" Icon={Activity} accent={sage}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><Lvl>+2</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>frequency × severity — beats recall</span></div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 90, padding: "0 2px" }}>
        {TIMELINE.map((v, i) => <div key={i} style={{ flex: 1, height: `${(v / max) * 100}%`, background: `linear-gradient(180deg, ${sage}, ${sage}88)`, borderRadius: "4px 4px 0 0", minHeight: 6 }} title={`Week ${i + 1}`} />)}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 4 }}><span>12 weeks ago</span><span>this week</span></div>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "8px 0 0", lineHeight: 1.5 }}>A picture a GP reads in seconds — and it does the "recontextualising" for them, instead of a data dump.</p>
    </Panel>
  );
}
function ExportPanel({ gold }) {
  const [lang, setLang] = useState("plain");
  const [tier, setTier] = useState("impact");
  return (
    <Panel label="The export" Icon={FileText} accent={gold}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+2</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>two-tier · plain ↔ clinical</span></div>
      <div style={{ display: "flex", gap: 7, marginBottom: 8 }}>
        {[["impact", "1-page impact"], ["full", "Full diary"]].map(([v, l]) => <button key={v} onClick={() => setTier(v)} className="fw-elite-press" style={{ flex: 1, fontFamily: UI, fontSize: 12, fontWeight: 700, padding: "8px 6px", borderRadius: 10, background: tier === v ? `${gold}1F` : T.paper, border: `1px solid ${tier === v ? gold : T.paperDeep}`, color: tier === v ? OXBLOOD : T.inkSoft, cursor: "pointer" }}>{l}</button>)}
      </div>
      <div style={{ display: "flex", gap: 7, marginBottom: 10 }}>
        {[["plain", "Plain English"], ["clinical", "Clinical"]].map(([v, l]) => <button key={v} onClick={() => setLang(v)} className="fw-elite-press" style={{ flex: 1, fontFamily: UI, fontSize: 12, fontWeight: 700, padding: "8px 6px", borderRadius: 10, background: lang === v ? `${gold}1F` : T.paper, border: `1px solid ${lang === v ? gold : T.paperDeep}`, color: lang === v ? OXBLOOD : T.inkSoft, cursor: "pointer" }}>{l}</button>)}
      </div>
      <div style={{ ...subCard(gold) }}>
        <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: gold, marginBottom: 4 }}>{tier === "impact" ? "ONE PAGE A GP READS IN 2 MIN" : "FULL PROSPECTIVE DIARY (APPENDIX)"}</div>
        <p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.5, margin: 0 }}>{lang === "clinical"
          ? "39yo. Perimenopausal vasomotor symptoms ×6/wk, Greene 38/63 (vasomotor domain 9/12). Menstrual cycle lengthening (28→38d). Most bothersome: night sweats disrupting sleep. NG23-aligned; FSH not indicated."
          : "I'm getting hot flushes about 6 times a day and night sweats that wake me. My periods have stretched from 28 to 38 days. The thing I most want help with is the sleep. (Greene score attached.)"}</p>
      </div>
      <p style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "8px 0 0", lineHeight: 1.5 }}>Generated on-device (pdfmake) — <b>never uploaded</b>; explicit special-category consent line. Print / PDF / copy-as-text, exactly as today.</p>
    </Panel>
  );
}
function AfterPanel({ plum }) {
  return (
    <Panel label="After the appointment" Icon={MessageSquare} accent={plum}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Lvl>+2</Lvl><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>close the loop · no rival does this</span></div>
      {[["What was decided", "Started HRT (gel + tablet) · review in 12 weeks"], ["Next steps", "Bloods for thyroid · keep the symptom diary"], ["What to monitor", "Night sweats, mood, any bleeding changes"]].map(([h, ex]) => (
        <div key={h} style={{ ...subCard(plum), marginBottom: 7 }}>
          <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: plum, marginBottom: 2 }}>{h}</div>
          <div style={{ fontFamily: SERIF, fontSize: 14, color: T.ink, lineHeight: 1.4 }}>{ex}</div>
        </div>
      ))}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 12, fontWeight: 700, color: plum, marginTop: 2 }}><RotateCcw size={13} /> Carries into your next visit's export</div>
    </Panel>
  );
}

export default function DoctorExportL2Demo() {
  const navigate = useNavigate();
  const gold = cwOf("gold").petal, sage = cwOf("sage").petal, crim = T.crimson, plum = cwOf("plum").petal;
  const jumpTo = (i) => { const track = document.querySelector(".fw-clipboard-track"); if (!track) return; const kids = [...track.children].filter((c) => c.offsetWidth > 40); if (kids[i]) track.scrollLeft = kids[i].offsetLeft - track.offsetLeft; };
  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }}>
      <style>{floraKeyframes}{ELITE_MOTION}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: T.paperHi, borderBottom: `1px solid ${T.paperDeep}` }}>
        <button onClick={() => navigate(createPageUrl("Ideas"))} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "5px 11px", cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted }}><ArrowLeft size={13} /> Ideas</button>
        <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: OXBLOOD }}>Doctor Export +2 · demo</span>
      </div>

      <div style={{ maxWidth: 430, margin: "0 auto", padding: "16px 16px 0" }} className="fw-elite-in">
        <FwFloraHero title="Your brief" colorway="crimson" bloom="poppy" flankL="iris" flankR="snowdrop" titleColor={OXBLOOD} creature="butterfly"
          line="The one tool that gets you believed in a 9-minute appointment — clinician-credible, NICE-templated, safe." />
        <div style={{ display: "flex", justifyContent: "center", marginTop: -6, marginBottom: 8 }}>
          <Bouquet items={[{ form: "poppy", colorway: "crimson" }, { form: "snowdrop", colorway: "sage" }, { form: "iris", colorway: "plum" }]} size={146} animate idx="dx-bq" />
        </div>
        <SummaryCard eyebrow="Built to be believed" accent={gold} rows={[
          { Icon: Stethoscope, label: "Condition template", text: "Endo · meno · HMB · PCOS · migraine — mapped to the exact NICE criteria", onClick: () => jumpTo(0) },
          { Icon: ShieldAlert, label: "Red-flag safety net", text: "Urgent signs flagged + routed to NHS 2-week-wait guidance", onClick: () => jumpTo(1) },
          { Icon: FileText, label: "Two-tier export", text: "One-page impact a GP reads in 2 min + the full diary", onClick: () => jumpTo(2) },
        ]} />
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={() => jumpTo(0)} className="fw-elite-press" style={focusPill(crim)}><Stethoscope size={16} /> Pick a template</button>
          <button onClick={() => jumpTo(2)} className="fw-elite-press" style={focusPill(gold)}><FileText size={16} /> See the export</button>
        </div>

        <div style={{ position: "relative", marginTop: 16 }}>
          <SliderArrows sliderRef={{ current: typeof document !== "undefined" ? document : null }} />
          <ClipboardSlider hint="Build your brief →" accent={gold}>
            <Clipboard title="Your case" sub="CONDITION TEMPLATE · PREP" accent={crim} flower="poppy" idx="cb-case" titleColor={OXBLOOD}>
              <BoardBody><StackedCard topAccent={crim} bottomAccent={plum}
                top={[<TemplatePanel key="t" crim={crim} />]}
                bottom={[<PrepPanel key="p" plum={plum} />]} />
              </BoardBody>
            </Clipboard>

            <Clipboard title="Credible & safe" sub="VALIDATED PROM · RED-FLAG NET" accent={gold} flower="iris" idx="cb-safe" titleColor={OXBLOOD}>
              <BoardBody><StackedCard topAccent={gold} bottomAccent={crim}
                top={[<PromPanel key="pr" gold={gold} />]}
                bottom={[<RedFlagPanel key="rf" crim={crim} navigate={navigate} />]} />
              </BoardBody>
            </Clipboard>

            <Clipboard title="Export & after" sub="TIMELINE · EXPORT · POST-VISIT LOOP" accent={sage} flower="snowdrop" idx="cb-export" titleColor={OXBLOOD}>
              <BoardBody><StackedCard topAccent={sage} bottomAccent={gold}
                top={[<TimelinePanel key="tl" sage={sage} />, <AfterPanel key="af" plum={plum} />]}
                bottom={[<ExportPanel key="ex" gold={gold} />]} />
              </BoardBody>
            </Clipboard>
          </ClipboardSlider>
        </div>

        <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${OXBLOOD}`, borderRadius: 16, padding: "14px 16px", margin: "18px 0" }}>
          <div style={{ ...lbl, color: OXBLOOD, marginBottom: 6, display: "inline-flex", alignItems: "center", gap: 6 }}><Lock size={13} /> The one tension — secure-share (NOT recommended)</div>
          <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.55, margin: 0 }}>Everything above is content + client-side (<b>no new function</b>). A "secure share link" would fight the on-device-never-uploaded promise (and GP systems can't accept third-party write-back anyway). <b>Recommendation:</b> keep the on-device PDF + the "your right to your data" framing (UK GDPR Art. 20), with the woman as courier. Live Doctor Export is untouched.</p>
        </div>
      </div>
    </div>
  );
}
