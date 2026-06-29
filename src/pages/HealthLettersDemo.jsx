// HealthLettersDemo — DEMO of the approved "Health Plan" (letters in sliding cards + the hub).
// The beloved /Health "Dear you" letters, re-rendered in the elite card language (FwFloraHero +
// SummaryCard + ClipboardSlider of StackedCard letter-boards, oxblood headings, flora, top chrome) —
// plus the plan's hub growth (heart-health + under-served conditions) and the safe-by-design
// screening / red-flag layer + the Health → Pulse → Doctor Export loop. Demo-first, for approval;
// LIVE /Health untouched. Voice + content kept (seeded faithful to the format); "Ask Jess" is a REAL
// action (opens the live Jess overlay). Red-flags SIGNPOST, never diagnose (§5 safe-by-design).
//
// Plan source: src/components/founders/brandDocs/health-plan.html
import { useState, useMemo } from "react";
import {
  Heart, Sparkles, Moon, Apple, Flower2, Stethoscope, HeartPulse, ShieldCheck,
  AlertTriangle, FileDown, Plus, Check, MessageCircle, CalendarCheck, Activity, BookOpen,
} from "lucide-react";
import {
  PAPER_BG, T, SERIF, UI, InkFilter, EditorialFooter, useEditorialFonts,
} from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { ClipboardSlider, Clipboard } from "@/components/brand/ClipboardSlider";
import { cwOf, floraKeyframes, Bouquet, Pollinator } from "@/components/brand/flora";
import { OXBLOOD, subCard, focusPill, Panel, StackedCard, BoardBody, TopChrome, JumpSheet, SliderArrows } from "@/components/brand/SliderKit";

const ELITE_MOTION = `
.fw-elite-in{animation:fwEliteIn .5s cubic-bezier(.4,0,.2,1) both}
@keyframes fwEliteIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.fw-elite-press{transition:transform .12s ease}.fw-elite-press:active{transform:scale(.97)}
@media (prefers-reduced-motion:reduce){.fw-elite-in{animation:none}.fw-elite-press{transition:none}}`;

// the 7 beloved letters — seeded faithful to the live voice (Dear you · plain English · phase-aware
// Jess line · key facts · actions). Reading-age ~9-11, UK. A couple carry a red-flag "worth a check".
const LETTERS = [
  { key: "story", title: "Your story", flower: "poppy", cw: "crimson", Icon: BookOpen,
    dear: "Dear you,", body: "You're on day 22 — the quiet, inward week. If your skin has changed and your patience is short, that's the luteal turn, not a failing. Here's what's worth knowing.",
    jess: "I've noticed your energy dips around now — three cycles running. Be gentle with the list.",
    facts: ["Day 22 · luteal phase", "Energy lower for ~5 days", "A pattern across 3 cycles"], someone: "“I thought I was just lazy every month — turns out it was my cycle.”" },
  { key: "cycle", title: "Cycle & life stage", flower: "cosmos", cw: "sage", Icon: Activity,
    dear: "Dear you,", body: "Your cycle is the sixth vital sign — its rhythm tells a story about the whole of you. A change in your normal pattern is information worth noticing, not always worry.",
    jess: "Your last three cycles ran 29, 31 and 27 days — a normal amount of variation.",
    facts: ["Average length 29 days", "Periods 4–5 days", "Variation is normal (21–35)"], redFlag: { what: "Bleeding between periods, or after sex", line: "Most causes aren't serious, but this is always worth getting checked." } },
  { key: "body", title: "Body & skin", flower: "rose", cw: "blush", Icon: Sparkles,
    dear: "Dear you,", body: "Skin shifts with hormones — clearer mid-cycle, often more reactive in the luteal days. It's your body keeping time, not misbehaving.",
    jess: "Your check-ins mention breakouts most in days 20–26 — right on cue.", facts: ["Clearest around ovulation", "Reactive in late luteal", "Barrier care over harsh actives"] },
  { key: "mind", title: "Mind & sleep", flower: "lavender", cw: "plum", Icon: Moon,
    dear: "Dear you,", body: "Sleep can fragment in the week before your period as progesterone falls. Warmth, magnesium-rich food and an earlier wind-down protect tomorrow's mood.",
    jess: "Your sleep quality dipped this luteal week — it tends to lift again with your period.", facts: ["Progesterone falls pre-period", "Core-temp drop aids sleep", "Earlier nights protect mood"], someone: "“Knowing why I couldn't sleep made it less frightening.”" },
  { key: "nourish", title: "Nourishment & gut", flower: "sunflower", cw: "gold", Icon: Apple,
    dear: "Dear you,", body: "Around your period your body is replenishing — iron-rich food helps with what you're losing, and warm, cooked meals are kinder than cold ones this week.",
    jess: "You logged less iron-rich food this week — lentils, greens and a little dark chocolate help.", facts: ["Iron around the bleed", "Omega-3s ease cramping", "Warm over cold this week"] },
  { key: "intimacy", title: "Intimacy", flower: "hibiscus", cw: "crimson", Icon: Flower2,
    dear: "Dear you,", body: "Desire ebbs and flows with your cycle — often rising near ovulation, quieter in the luteal turn. All of it is normal, and none of it is a measure of you.",
    jess: "Your notes show more energy for connection mid-cycle — that tracks with your phase.", facts: ["Libido often peaks near ovulation", "Dryness can shift with the cycle", "Pain is never “just normal”"], redFlag: { what: "Pain during sex that keeps happening", line: "This is always worth raising with your GP — it's common and treatable." } },
  { key: "care", title: "Your care", flower: "iris", cw: "plum", Icon: Heart,
    dear: "Dear you,", body: "You deserve to be heard. Eighty percent of women feel they haven't been listened to — so let's walk in prepared. Here's your second opinion, in your pocket.",
    jess: "I've drafted three questions from your patterns — ready for your next appointment.", facts: ["Bring a dated symptom record", "Name your most-bothersome symptom first", "Ask: options · benefits · what if I wait"] },
];

// the hub-growth rooms (the plan's deepening) — heart health is the standout gap
const DEEPER = [
  { name: "Heart health", note: "Kills ~2× as many UK women as breast cancer — yet women present atypically (jaw, back, nausea). The gap no rival covers.", Icon: HeartPulse, cw: "crimson" },
  { name: "Endometriosis", note: "Now ~9 years 4 months to diagnose (~11 for diverse communities). Its own room, ethnicity-aware.", Icon: Flower2, cw: "plum" },
  { name: "PCOS", note: "Phenotype-aware, body-neutral — not a prescription. What the system under-teaches.", Icon: Sparkles, cw: "gold" },
  { name: "Fibroids", note: "Hit Black women younger and harder; 62% unsatisfied with treatment info.", Icon: Activity, cw: "sage" },
  { name: "PMDD & thyroid", note: "First-class rooms for the under-served — coping skills + when to seek care.", Icon: Moon, cw: "blush" },
];

const SCREENING = [
  ["Cervical / HPV", "25–64 · HPV-negative 25–49 now 5-yearly · self-sampling rolling out 2026"],
  ["Breast", "50–70, every 3 years"],
  ["Bowel", "home FIT kit, 60–74 every 2 years (rolling down to 50)"],
  ["Your own results", "log BP · cholesterol · ferritin · thyroid · vit D over time → into Pulse"],
];

function L2Badge() { const c = cwOf("plum").petal; return <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: c, border: `1px solid ${c}`, borderRadius: 999, padding: "2px 7px" }}>New</span>; }

export default function HealthLettersDemo() {
  useEditorialFonts();
  const [jumpOpen, setJumpOpen] = useState(false);
  const [gpItems, setGpItems] = useState(["Heavier bleeding the last 2 cycles", "Sleep waking 3am pre-period"]);
  const ref = useMemo(() => ({ current: null }), []);
  const gold = T.gold, sage = cwOf("sage").petal, crim = T.crimson, plum = cwOf("plum").petal;

  const boards = useMemo(() => [
    ...LETTERS.map((l) => ({ t: l.title, sub: "A letter to you" })),
    { t: "Deeper rooms", sub: "Heart · endo · PCOS · fibroids" },
    { t: "Safe by design", sub: "Screening · red-flags · the loop" },
  ], []);

  function jumpTo(i) {
    const wrap = ref.current; const track = wrap?.querySelector(".fw-clipboard-track"); if (!track) { setJumpOpen(false); return; }
    const cards = [...track.children].filter((c) => c.offsetWidth > 40); const card = cards[i];
    if (card) track.scrollLeft = card.offsetLeft - track.offsetLeft;
    wrap?.scrollIntoView({ behavior: "smooth", block: "start" }); setJumpOpen(false);
  }
  const askJess = (prompt) => { try { window.dispatchEvent(new CustomEvent("fw_open_assistant", { detail: { initialPrompt: prompt } })); } catch (_) { /* */ } };
  const addGp = (text) => setGpItems((p) => p.includes(text) ? p : [...p, text]);

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, overflowX: "clip", paddingBottom: "calc(110px + env(safe-area-inset-bottom))", position: "relative" }}>
      <InkFilter />
      <style>{floraKeyframes}{ELITE_MOTION}</style>
      <TopChrome onJump={() => setJumpOpen(true)} />

      <div style={{ maxWidth: 460, margin: "0 auto", padding: "16px 18px 0", position: "relative" }} className="fw-elite-in">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: gold, border: `1px solid ${gold}`, borderRadius: 999, padding: "4px 12px" }}>Health · letters in sliding cards · demo · for approval</span>
        </div>

        <FwFloraHero title="Your health" titleColor={OXBLOOD} bloom="poppy" colorway="crimson" flankL="clover" flankR="lavender" creature="butterfly"
          line="The letters you love — now a room you can swipe, scan and act on, in the spirit of the Royal Colleges’ “Please Write to Me.”" idx="hl-hero" />
        <div style={{ display: "flex", justifyContent: "center", marginTop: -4, marginBottom: 2 }}>
          <Bouquet items={[{ form: "poppy", colorway: "crimson" }, { form: "lavender", colorway: "plum" }, { form: "clover", colorway: "sage" }]} size={148} animate idx="hl-bq" />
        </div>

        {/* privacy as a headline feature */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center", margin: "8px 0 2px" }}>
          {[["Anonymous-safe", ShieldCheck], ["No ad SDKs on health data", ShieldCheck], ["Export & delete in plain sight", FileDown]].map(([t, Ic]) => (
            <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 11.5, fontWeight: 600, color: T.muted, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "5px 11px" }}><Ic size={12} color={sage} /> {t}</span>
          ))}
        </div>

        <div style={{ marginTop: 12 }}>
          <SummaryCard eyebrow="Your health today" accent={crim} rows={[
            { Icon: Activity, label: "This week", text: "A flagged pattern: sleep waking around 3am in your luteal days.", onClick: () => jumpTo(3) },
            { Icon: CalendarCheck, label: "Next screening", text: "Cervical / HPV — due in 4 months (now 5-yearly if HPV-negative).", onClick: () => jumpTo(8) },
            { Icon: FileDown, label: "GP prep", text: `${gpItems.length} things saved for your next appointment — ready to export.`, onClick: () => jumpTo(6) },
          ]} />
        </div>

        <div ref={(el) => { ref.current = el; }} style={{ marginTop: 16, position: "relative" }}>
          <SliderArrows sliderRef={ref} />
          <ClipboardSlider hint="Slide your letters →" accent={crim}>

            {/* THE 7 LETTERS — each a StackedCard board */}
            {LETTERS.map((l) => {
              const c = cwOf(l.cw).petal;
              return (
                <Clipboard key={l.key} title={l.title} sub="A LETTER TO YOU" accent={c} flower={l.flower} idx={`cb-${l.key}`} titleColor={OXBLOOD}>
                  <BoardBody>
                    <StackedCard topAccent={c} bottomAccent={gold}
                      top={[
                        <Panel key="letter" label="Your letter" Icon={l.Icon} accent={c}>
                          <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${c}`, borderRadius: 14, padding: "14px 15px" }}>
                            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 19, color: OXBLOOD, marginBottom: 6 }}>{l.dear}</div>
                            <p style={{ fontFamily: SERIF, fontSize: 15.5, color: T.inkSoft, lineHeight: 1.6, margin: 0 }}>{l.body}</p>
                            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 12, background: `${c}10`, borderRadius: 10, padding: "9px 11px" }}>
                              <Sparkles size={14} color={c} style={{ flexShrink: 0, marginTop: 2 }} />
                              <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.ink, lineHeight: 1.5 }}>{l.jess}</span>
                            </div>
                            <div style={{ fontFamily: "Ephesis, cursive", color: crim, fontSize: 22, marginTop: 8 }}>— with care, FemWell</div>
                          </div>
                        </Panel>,
                      ]}
                      bottom={[
                        <Panel key="facts" label="Worth knowing" Icon={BookOpen} accent={gold}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                            {l.facts.map((f) => <div key={f} style={{ ...subCard(gold), fontFamily: SERIF, fontSize: 14.5, color: T.ink }}>{f}</div>)}
                          </div>
                          {l.someone && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: T.muted, margin: "10px 2px 0", lineHeight: 1.5 }}>{l.someone}</p>}
                        </Panel>,
                        <Panel key="act" label="What you can do" Icon={Heart} accent={c}>
                          {l.redFlag && (
                            <div style={{ ...subCard(crim), marginBottom: 10, background: `${crim}0E` }}>
                              <div style={{ display: "flex", gap: 7, alignItems: "center" }}><AlertTriangle size={15} color={crim} /><span style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, color: crim, textTransform: "uppercase", letterSpacing: ".05em" }}>Worth a check</span></div>
                              <div style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink, margin: "5px 0 2px", fontWeight: 600 }}>{l.redFlag.what}</div>
                              <p style={{ fontFamily: SERIF, fontSize: 13.5, color: T.muted, margin: 0, lineHeight: 1.5 }}>{l.redFlag.line} <span style={{ color: crim, fontWeight: 700 }}>Here’s how ›</span></p>
                            </div>
                          )}
                          <button onClick={() => addGp(`From “${l.title}” letter`)} className="fw-elite-press" style={{ ...focusPill(c), marginBottom: 9 }}><Plus size={15} /> {gpItems.includes(`From “${l.title}” letter`) ? "Added to GP prep" : "Add to my GP prep"}</button>
                          <button onClick={() => askJess(`I'm reading my "${l.title}" health letter — can you tell me more about how it applies to me?`)} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "11px 14px", cursor: "pointer", fontFamily: UI, fontSize: 13.5, fontWeight: 700, color: OXBLOOD }}><MessageCircle size={15} color={crim} /> Ask Jess about this</button>
                        </Panel>,
                      ]} />
                  </BoardBody>
                </Clipboard>
              );
            })}

            {/* BOARD 8 — DEEPER ROOMS (hub growth) */}
            <Clipboard title="Deeper rooms" sub="THE CLINICAL TERRITORY · NEW LETTERS" accent={crim} flower="hibiscus" idx="cb-deeper" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={crim} bottomAccent={plum}
                  top={[
                    <Panel key="heart" label="The standout gap · heart health" Icon={HeartPulse} accent={crim}>
                      <div style={{ ...subCard(crim), background: `${crim}0E` }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}><HeartPulse size={18} color={crim} /><span style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: T.ink }}>Your heart</span><L2Badge /></div>
                        <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, lineHeight: 1.55, margin: "8px 0 0" }}>Coronary heart disease kills roughly <b>twice as many UK women as breast cancer</b> — yet women present atypically (jaw or back pain, nausea, breathlessness) and are more often missed. Almost no women’s app covers it. Yours will.</p>
                      </div>
                      <button onClick={() => askJess("Tell me about heart health for women and the atypical signs I should know.")} className="fw-elite-press" style={{ ...focusPill(crim), marginTop: 12 }}><MessageCircle size={15} /> Ask Jess about heart health</button>
                    </Panel>,
                  ]}
                  bottom={[
                    <Panel key="conds" label="First-class rooms for the under-served" Icon={Flower2} accent={plum}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {DEEPER.slice(1).map((d) => { const dc = cwOf(d.cw).petal; return (
                          <div key={d.name} style={{ ...subCard(dc), display: "flex", gap: 10, alignItems: "flex-start" }}>
                            <d.Icon size={17} color={dc} style={{ flexShrink: 0, marginTop: 2 }} />
                            <span><span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, display: "block" }}>{d.name}</span><span style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.45 }}>{d.note}</span></span>
                          </div>
                        ); })}
                      </div>
                      <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "10px 2px 0" }}>Each its own letter-board, ethnicity-aware. <L2Badge /></p>
                    </Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

            {/* BOARD 9 — SAFE BY DESIGN + THE LOOP */}
            <Clipboard title="Safe by design" sub="SCREENING · RED-FLAGS · THE LOOP" accent={sage} flower="snowdrop" idx="cb-safe" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={sage} bottomAccent={gold}
                  top={[
                    <Panel key="screen" label="Screening tracker · opt-in" Icon={CalendarCheck} accent={sage}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                        {SCREENING.map(([t, w]) => (
                          <div key={t} style={{ ...subCard(sage) }}><span style={{ fontFamily: SERIF, fontSize: 14.5, fontWeight: 600, color: T.ink }}>{t}</span><div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, lineHeight: 1.45 }}>{w}</div></div>
                        ))}
                      </div>
                      <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "10px 2px 0" }}>Signposts to the NHS — never diagnoses. <L2Badge /></p>
                    </Panel>,
                    <Panel key="redflag" label="Red-flags — calm “worth a check”" Icon={AlertTriangle} accent={crim}>
                      <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, lineHeight: 1.55, margin: "0 0 8px" }}>Some signs are always worth getting checked. We never tell you what it means — we tell you it’s worth a GP visit, and help you book it.</p>
                      {["Any bleeding after menopause", "A new breast lump or change", "Severe or sudden pelvic pain"].map((t) => (
                        <div key={t} style={{ ...subCard(crim), background: `${crim}0E`, marginBottom: 7, display: "flex", gap: 8, alignItems: "center" }}><AlertTriangle size={14} color={crim} /><span style={{ fontFamily: SERIF, fontSize: 14, color: T.ink }}>{t}</span></div>
                      ))}
                      <p style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, margin: "6px 2px 0" }}>“Most causes are not serious, but this one should always be checked.”</p>
                    </Panel>,
                  ]}
                  bottom={[
                    <Panel key="loop" label="The loop · understand → trend → export" Icon={FileDown} accent={gold}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {[["Health", "The letters explain; you collect what matters.", Stethoscope, crim], ["Pulse", "Your patterns over time surface the signal.", Activity, plum], ["Doctor Export", "A dated, plain-English one-pager you hand over.", FileDown, sage]].map(([t, d, Ic, cc]) => (
                          <div key={t} style={{ ...subCard(cc), display: "flex", gap: 10, alignItems: "flex-start" }}><Ic size={17} color={cc} style={{ flexShrink: 0, marginTop: 2 }} /><span><span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, display: "block" }}>{t}</span><span style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.45 }}>{d}</span></span></div>
                        ))}
                      </div>
                      <div style={{ ...subCard(gold), marginTop: 10 }}>
                        <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, color: gold, textTransform: "uppercase", letterSpacing: ".05em" }}>Your GP prep · {gpItems.length} saved</span>
                        {gpItems.map((g) => <div key={g} style={{ display: "flex", gap: 7, alignItems: "center", marginTop: 5 }}><Check size={13} color={sage} /><span style={{ fontFamily: SERIF, fontSize: 14, color: T.ink }}>{g}</span></div>)}
                        <button className="fw-elite-press" style={{ ...focusPill(gold), marginTop: 10 }}><FileDown size={15} /> Build my doctor export</button>
                      </div>
                    </Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

          </ClipboardSlider>
        </div>

        <div style={{ display: "grid", placeItems: "center", margin: "20px 0 0" }}><Pollinator kind="butterfly" size={30} color={crim} color2={cwOf("plum").tip} pattern="bands" animate idx="hl-close" /></div>
        <p style={{ textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "6px auto 0", maxWidth: 320, lineHeight: 1.55 }}>The letters you love, in the card language the rest of the app already speaks. A second opinion, in your pocket.</p>
        <div style={{ marginTop: 30 }}><EditorialFooter /></div>
      </div>

      {jumpOpen && <JumpSheet boards={boards} onClose={() => setJumpOpen(false)} onJump={jumpTo} />}
    </div>
  );
}
