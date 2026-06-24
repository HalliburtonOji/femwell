// DoctorExportClipboardDemo — STANDALONE v4 redesign preview of the LIVE Doctor Export page (the GP-ready
// summary builder). Demo-first; the live DoctorExport is NOT touched. Self-contained + seeded.
//
// v4 Brand Bible: flora-hero (carved heart + snowdrop=hope) + ONE summary (what you've tracked) + a §6.10
// ClipboardSlider through the three build steps (Choose · Organise · Generate) of uniform Card.jsx cards +
// in-card CardDeck (Jess's suggested questions) + §6.7.6 quick popups + soulful voice (draft-with-Jess) +
// PAPER_BG + canonical pinned Jump-to. Ease-first: an obvious "Generate report" primary; ~2 phone screens.
//
// FULL PARITY (live DoctorExport → this demo; checklist at foot): presets (menopause/cycle/mood/sleep/pain/
// meds) · timeframe 6w/90d/custom · section toggles (overview/symptoms/mood/sleep/cycle/meds/exercise/
// nutrition/patterns) · symptom selection · brief + Jess-drafted questions to ask the GP · include-reflections
// opt-in · on-device PDF download · Print · Copy-as-text · point-of-export consent · what's-included preview.
import { useState } from "react";
import {
  Check, X, FileHeart, CalendarDays, Sparkles, Mic, Printer, Copy, Download,
  Heart, Moon, Activity, Pill, ListChecks, ShieldCheck, Brain, ChevronRight, Flame, Salad,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { T, SCRIPT, SERIF, UI, PAPER_BG, Hand } from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { ClipboardSlider, Clipboard, CardDeck } from "@/components/brand/ClipboardSlider";
import { RichBloomV2, floraKeyframes, cwOf } from "@/components/brand/flora";
import JumpToButton from "@/components/layout/JumpToButton";

const GOLD = cwOf("gold"), SAGE = cwOf("sage"), PLUM = cwOf("plum"), CRIM = cwOf("crimson");
const PRESETS = [
  { id: "menopause", label: "Menopause / peri", Icon: Flame, cw: "crimson" },
  { id: "cycle", label: "Cycle & periods", Icon: CalendarDays, cw: "plum" },
  { id: "mood", label: "Mood & energy", Icon: Heart, cw: "plum" },
  { id: "sleep", label: "Sleep", Icon: Moon, cw: "plum" },
  { id: "pain", label: "Pain & symptoms", Icon: Activity, cw: "crimson" },
  { id: "meds", label: "Medication review", Icon: Pill, cw: "gold" },
];
const SECTIONS = [
  { id: "overview", label: "Overview", Icon: FileHeart }, { id: "symptoms", label: "Symptoms", Icon: Activity },
  { id: "mood", label: "Mood", Icon: Heart }, { id: "sleep", label: "Sleep", Icon: Moon },
  { id: "cycle", label: "Cycle", Icon: CalendarDays }, { id: "meds", label: "Meds", Icon: Pill },
  { id: "exercise", label: "Exercise", Icon: Activity }, { id: "nutrition", label: "Nutrition", Icon: Salad },
  { id: "patterns", label: "Patterns", Icon: Brain },
];
const SYMPTOMS = ["Hot flushes", "Cramps", "Low mood", "Poor sleep", "Headache", "Fatigue", "Bloating", "Anxiety"];
const QUESTIONS = [
  "Could my late-luteal low mood be PMDD, and what are my options?",
  "Are my hot flushes worth reviewing HRT for?",
  "My sleep dips before my period — is there anything that helps?",
];
const JUMP = [
  { id: "choose", label: "Choose", sub: "preset · timeframe · sections", Icon: ListChecks, cw: "gold" },
  { id: "organise", label: "Organise", sub: "symptoms · brief · questions", Icon: Sparkles, cw: "plum" },
  { id: "generate", label: "Generate", sub: "PDF · print · copy", Icon: Download, cw: "crimson" },
];

function Pill2({ on, children, onClick }) {
  return <button onClick={onClick} style={{ cursor: "pointer", fontFamily: UI, fontSize: 12.5, fontWeight: 700, padding: "7px 14px", borderRadius: 999, border: `1px solid ${on ? T.ink : T.paperDeep}`, background: on ? T.ink : "transparent", color: on ? T.paper : T.muted }}>{children}</button>;
}
function Toggle({ on }) {
  return <span style={{ width: 42, height: 24, borderRadius: 999, background: on ? SAGE.petal : T.paperDeep, position: "relative", flexShrink: 0, display: "inline-block" }}><span style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 18, height: 18, borderRadius: 99, background: "#fff", transition: "left .15s" }} /></span>;
}

export default function DoctorExportClipboardDemo() {
  const navigate = useNavigate();
  const link = (p) => navigate(createPageUrl(p));
  const [sheet, setSheet] = useState(null);     // "jump" | "voice"
  const [popup, setPopup] = useState(null);
  const [toast, setToast] = useState(null);
  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 2200); };
  const [preset, setPreset] = useState("menopause");
  const [timeframe, setTimeframe] = useState("6w");
  const [sections, setSections] = useState(() => new Set(["overview", "symptoms", "mood", "sleep", "meds"]));
  const [symptoms, setSymptoms] = useState(() => new Set(["Hot flushes", "Low mood", "Poor sleep"]));
  const [reflections, setReflections] = useState(false);
  const toggle = (set, setSet, id) => { const n = new Set(set); n.has(id) ? n.delete(id) : n.add(id); setSet(n); };
  const pop = (title, line, cw, Icon) => setPopup({ title, line, cw, Icon });

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", paddingBottom: 112, position: "relative", overflowX: "clip" }}>
      <style>{floraKeyframes}</style>
      <JumpToButton pinned onClick={() => setSheet("jump")} />

      <FwFloraHero title="Doctor export" bloom="snowdrop" colorway="sage" flankL="clover" flankR="chamomile" creature="butterfly"
        line="A calm, GP-ready summary from what you've tracked — built on your device, shared only when you choose." ringSize={184} bloomSize={114} />

      <Wrap>
        <div style={{ marginTop: 6 }}>
          <SummaryCard eyebrow="What you've tracked" accent={SAGE.petal} rows={[
            { Icon: CalendarDays, label: "Window", text: "Last 6 weeks — 24 check-in days", onClick: () => pop("Your window", "The report covers the last 6 weeks: 24 days of check-ins, ready to summarise for your GP.", "sage", CalendarDays) },
            { Icon: Activity, label: "Symptoms", text: "8 tracked · 3 selected for the report", onClick: () => pop("Symptoms", "8 symptoms logged; pick the ones most relevant to this visit — the rest stay private.", "crimson", Activity) },
            { Icon: Pill, label: "Meds", text: "3 current — included in the review", onClick: () => pop("Medications", "Your current meds + adherence are summarised so your GP sees the full picture.", "gold", Pill) },
          ]} />
        </div>

        {/* PRIMARY ACTIONS */}
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button onClick={() => flash("Building your A4 PDF on this device…")} aria-label="Generate report" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, background: T.crimson, color: "#fff", border: "none", borderRadius: 16, padding: "15px 12px", fontFamily: UI, fontSize: 14, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", cursor: "pointer", boxShadow: `0 6px 18px ${T.crimson}55` }}>
            <span aria-hidden style={{ display: "grid", placeItems: "center", width: 26, height: 26, borderRadius: 999, background: "rgba(255,255,255,0.22)" }}><Download size={16} /></span> Generate report
          </button>
          <button onClick={() => setSheet("voice")} aria-label="Draft your brief with Jess (voice)" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, background: PLUM.petal, color: "#fff", border: "none", borderRadius: 16, padding: "15px 12px", fontFamily: UI, fontSize: 14, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", cursor: "pointer", boxShadow: `0 6px 18px ${PLUM.petal}55` }}>
            <Mic size={18} /> Draft brief
          </button>
        </div>

        <Hand size={14} color={T.muted} style={{ display: "block", margin: "12px 0 0", textAlign: "center" }}>
          Three calm steps — choose, organise, generate. Slide sideways; nothing leaves your device until you share it.
        </Hand>
      </Wrap>

      <div style={{ position: "relative", zIndex: 1, padding: "8px 16px 0", maxWidth: 600, margin: "0 auto" }}>
        <ClipboardSlider hint="Slide — build your export" accent={SAGE.petal}>
          {/* STEP 1 — CHOOSE */}
          <Clipboard title="1 · Choose" sub="PRESET · TIMEFRAME · SECTIONS" accent={GOLD.petal} flower="sunflower" idx="cb-choose">
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: T.muted, marginBottom: 7 }}>Start from a preset</div>
            <Grid cols={3}>
              {PRESETS.map((p) => { const c = cwOf(p.cw); const on = preset === p.id; return (
                <button key={p.id} onClick={() => setPreset(p.id)} aria-label={p.label} style={{ textAlign: "left", cursor: "pointer", minHeight: 78, display: "flex", flexDirection: "column", gap: 4, background: on ? `${c.petal}1f` : T.paper, border: `1px solid ${on ? c.petal : T.paperDeep}`, borderLeft: `4px solid ${c.petal}`, borderRadius: 12, padding: "10px 9px" }}>
                  <p.Icon size={15} color={c.petal} />
                  <span style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 600, color: T.ink, lineHeight: 1.15 }}>{p.label}</span>
                </button>
              ); })}
            </Grid>
            <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
              <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: T.muted, alignSelf: "center", marginRight: 2 }}>Window</span>
              {[["6w", "6 weeks"], ["90d", "90 days"], ["custom", "Custom"]].map(([k, l]) => <Pill2 key={k} on={timeframe === k} onClick={() => setTimeframe(k)}>{l}</Pill2>)}
            </div>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: T.muted, margin: "12px 0 7px" }}>Sections to include</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {SECTIONS.map((s) => { const on = sections.has(s.id); return (
                <button key={s.id} onClick={() => toggle(sections, setSections, s.id)} style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 600, padding: "7px 11px", borderRadius: 999, border: `1px solid ${on ? SAGE.petal : T.paperDeep}`, background: on ? `${SAGE.petal}1f` : T.paper, color: on ? T.ink : T.muted }}>
                  {on ? <Check size={12} color={SAGE.petal} /> : <s.Icon size={12} />} {s.label}
                </button>
              ); })}
            </div>
          </Clipboard>

          {/* STEP 2 — ORGANISE */}
          <Clipboard title="2 · Organise" sub="SYMPTOMS · BRIEF · QUESTIONS FOR YOUR GP" accent={PLUM.petal} flower="iris" idx="cb-org">
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: T.muted, marginBottom: 7 }}>Pick the symptoms to surface</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
              {SYMPTOMS.map((s) => { const on = symptoms.has(s); return (
                <button key={s} onClick={() => toggle(symptoms, setSymptoms, s)} style={{ cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 600, padding: "7px 12px", borderRadius: 999, border: "none", background: on ? CRIM.petal : T.paperDeep, color: on ? "#fff" : T.muted }}>{s}</button>
              ); })}
            </div>
            <button onClick={() => setSheet("voice")} style={briefRow}>
              <span style={{ width: 30, height: 30, borderRadius: 999, background: `${PLUM.petal}22`, display: "grid", placeItems: "center", flexShrink: 0 }}><Mic size={15} color={PLUM.petal} /></span>
              <span style={{ flex: 1, textAlign: "left" }}><span style={{ display: "block", fontFamily: SERIF, fontSize: 14.5, fontWeight: 600, color: T.ink }}>Draft your brief with Jess</span><span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>say it — she writes the GP summary</span></span>
              <ChevronRight size={16} color={T.muted} />
            </button>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: T.muted, margin: "12px 0 7px" }}>Questions to ask — swipe</div>
            <CardDeck accent={PLUM.petal}>
              {QUESTIONS.map((q, i) => (
                <div key={i} style={{ minHeight: 120, display: "flex", flexDirection: "column", justifyContent: "center", background: `linear-gradient(165deg, ${T.paperHi} 0%, ${PLUM.petal}16 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${PLUM.petal}`, borderRadius: 16, padding: "16px" }}>
                  <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: ".11em", textTransform: "uppercase", color: PLUM.petal, marginBottom: 6 }}>From Jess · question {i + 1}</span>
                  <p style={{ fontFamily: SERIF, fontSize: 16.5, color: T.ink, lineHeight: 1.4, margin: 0 }}>{q}</p>
                </div>
              ))}
            </CardDeck>
            <button onClick={() => setReflections((r) => !r)} style={{ ...briefRow, marginTop: 11 }}>
              <span style={{ flex: 1, textAlign: "left" }}><span style={{ display: "block", fontFamily: SERIF, fontSize: 14.5, fontWeight: 600, color: T.ink }}>Include reflections</span><span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>your private journal lines — off by default</span></span>
              <Toggle on={reflections} />
            </button>
          </Clipboard>

          {/* STEP 3 — GENERATE */}
          <Clipboard title="3 · Generate" sub="ON YOUR DEVICE · SHARED ONLY WHEN YOU CHOOSE" accent={T.crimson} flower="anemone" idx="cb-gen">
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "11px 12px", borderRadius: 12, background: `${SAGE.petal}14`, border: `1px solid ${T.paperDeep}`, marginBottom: 12 }}>
              <ShieldCheck size={16} color={SAGE.petal} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontFamily: SERIF, fontSize: 13.5, color: T.muted, lineHeight: 1.5 }}>Built entirely on your device. Nothing is sent anywhere — you download, print or copy it, then share it with your GP yourself.</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              <button onClick={() => flash("A4 PDF downloaded")} style={{ ...genBtn, background: T.crimson, color: "#fff", border: "none" }}><Download size={16} /> Download A4 PDF</button>
              <div style={{ display: "flex", gap: 9 }}>
                <button onClick={() => flash("Opening print…")} style={{ ...genBtn, flex: 1, background: T.paper }}><Printer size={15} /> Print</button>
                <button onClick={() => flash("Copied as text")} style={{ ...genBtn, flex: 1, background: T.paper }}><Copy size={15} /> Copy text</button>
              </div>
            </div>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: T.muted, margin: "14px 0 7px" }}>What's included</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[...sections].map((id) => { const s = SECTIONS.find((x) => x.id === id); if (!s) return null; return (
                <div key={id} style={{ display: "flex", alignItems: "center", gap: 9, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "8px 11px" }}>
                  <Check size={14} color={SAGE.petal} /><s.Icon size={14} color={T.muted} />
                  <span style={{ flex: 1, fontFamily: SERIF, fontSize: 14, color: T.ink }}>{s.label}</span>
                  <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted }}>{timeframe === "6w" ? "6 wk" : timeframe === "90d" ? "90 d" : "custom"}</span>
                </div>
              ); })}
            </div>
          </Clipboard>
        </ClipboardSlider>
      </div>

      {popup && <QuickPopup item={popup} onClose={() => setPopup(null)} />}
      {sheet === "voice" && <VoiceSheet onClose={() => setSheet(null)} onSaved={() => { setSheet(null); flash("Brief drafted — review it in step 2"); }} />}
      {sheet === "jump" && <JumpSheet onClose={() => setSheet(null)} onPick={() => setSheet(null)} />}

      {toast && <div role="status" style={{ position: "fixed", left: "50%", bottom: "calc(var(--fw-nav-h, 76px) + 18px)", transform: "translateX(-50%)", zIndex: 10000, background: T.ink, color: T.paper, fontFamily: UI, fontSize: 13, fontWeight: 700, padding: "10px 16px", borderRadius: 999, boxShadow: "0 6px 20px rgba(11,8,5,0.3)", maxWidth: "88vw", textAlign: "center" }}>{toast}</div>}
    </div>
  );
}

function Wrap({ children }) { return <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px" }}>{children}</div>; }
const Grid = ({ children, cols = 2 }) => <div style={{ display: "grid", gridTemplateColumns: cols === 3 ? "1fr 1fr 1fr" : "1fr 1fr", gap: 9 }}>{children}</div>;

function QuickPopup({ item, onClose }) {
  const c = cwOf(item.cw || "sage"); const Icon = item.Icon || FileHeart;
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" style={scrim}><style>{floraKeyframes}</style>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe" style={sheetStyle}>
        <div style={grab} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ ...disc, width: 34, height: 34 }}><Icon size={16} color={c.petal} /></span>
          <div style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 600, color: T.ink, flex: 1 }}>{item.title}</div>
          <button onClick={onClose} aria-label="Close" style={iconX}><X size={20} /></button>
        </div>
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.muted, lineHeight: 1.5, margin: "4px 0 12px" }}>{item.line}</p>
        <div style={{ display: "grid", placeItems: "center" }}><RichBloomV2 form="snowdrop" color={c.petal} color2={c.tip} accent={c.accent} size={92} idx="de-qp" /></div>
      </div>
    </div>
  );
}
function VoiceSheet({ onClose, onSaved }) {
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" style={scrim}>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe" style={{ ...sheetStyle, textAlign: "center" }}>
        <style>{`@keyframes fwPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.12);opacity:.7}}`}</style>
        <div style={grab} />
        <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: PLUM.petal }}>Draft your brief</div>
        <div style={{ fontFamily: SCRIPT, fontSize: 26, color: T.ink, margin: "4px 0 2px" }}>Listening…</div>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "0 0 16px" }}>“I want to talk to my GP about my mood and sleep before my period…”</p>
        <div style={{ display: "grid", placeItems: "center", margin: "0 0 18px" }}><div style={{ width: 92, height: 92, borderRadius: 999, background: `${PLUM.petal}22`, display: "grid", placeItems: "center", animation: "fwPulse 1.6s ease-in-out infinite" }}><Mic size={34} color={PLUM.petal} /></div></div>
        <button onClick={onSaved} style={{ ...genBtn, background: PLUM.petal, color: "#fff", border: "none", justifyContent: "center" }}><Sparkles size={16} /> Let Jess write it</button>
      </div>
    </div>
  );
}
function JumpSheet({ onClose, onPick }) {
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" style={scrim}>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe" style={sheetStyle}>
        <div style={grab} />
        <div style={{ fontFamily: SCRIPT, fontSize: 24, color: T.ink }}>Jump to</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, marginBottom: 14 }}>the three steps, by name</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          {JUMP.map((s) => { const c = cwOf(s.cw); return (
            <button key={s.id} onClick={onPick} style={{ display: "flex", alignItems: "flex-start", gap: 9, textAlign: "left", padding: "12px 11px", borderRadius: 14, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${c.petal}`, background: T.paper, cursor: "pointer" }}>
              <s.Icon size={17} color={c.petal} />
              <span><span style={{ display: "block", fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink }}>{s.label}</span><span style={{ fontFamily: UI, fontSize: 11, color: T.muted, lineHeight: 1.3 }}>{s.sub}</span></span>
            </button>
          ); })}
        </div>
      </div>
    </div>
  );
}

const briefRow = { display: "flex", alignItems: "center", gap: 10, width: "100%", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "10px 12px", cursor: "pointer" };
const genBtn = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 14.5, fontWeight: 700, cursor: "pointer", color: T.ink };
const scrim = { position: "fixed", inset: 0, zIndex: 9999, background: "rgba(11,8,5,0.46)", display: "flex", alignItems: "flex-end", justifyContent: "center" };
const sheetStyle = { width: "100%", maxWidth: 520, background: T.paperHi, borderTopLeftRadius: 22, borderTopRightRadius: 22, borderTop: `3px solid ${T.gold}`, boxShadow: "0 -8px 40px rgba(11,8,5,.24)", padding: "16px 18px 20px", maxHeight: "82dvh", overflowY: "auto" };
const grab = { width: 38, height: 4, borderRadius: 99, background: T.paperDeep, margin: "0 auto 14px" };
const iconX = { background: "transparent", border: "none", cursor: "pointer", color: T.muted };
const disc = { borderRadius: 8, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0, background: T.paper };

/* ── PARITY CHECKLIST (live DoctorExport → this demo) ──
 SIGNATURE: ✅ flora hero (snowdrop=hope) + carved heart voice · ✅ one summary (window/symptoms/meds) ·
   ★✅ primary Generate report + Draft-brief (voice) · ✅ canonical pinned Jump-to.
 STEP 1 Choose: ✅ presets (menopause/cycle/mood/sleep/pain/meds) · ✅ timeframe 6w/90d/custom · ✅ section
   toggles (overview/symptoms/mood/sleep/cycle/meds/exercise/nutrition/patterns).
 STEP 2 Organise: ✅ symptom selection · ✅ brief via Jess voice · ✅ Jess-drafted questions to ask the GP
   (in-card CardDeck) · ✅ include-reflections opt-in (off by default).
 STEP 3 Generate: ✅ point-of-export consent line · ✅ Download A4 PDF · ✅ Print · ✅ Copy-as-text ·
   ✅ what's-included preview (selected sections × timeframe). §6.7.6 quick popups · clipboard slider + CardDeck ·
   ~2 screens · v4 bible · demo-first (seeded). */
