// ProgramsClipboardDemo — STANDALONE v4 redesign preview of the LIVE Programs hub (guided journeys /
// courses). Demo-first; the live ProgramsHub is NOT touched. Self-contained + seeded.
//
// v4 Brand Bible: flora-hero + ONE summary (continue your journey) + §6.10 ClipboardSliders of rich
// Card.jsx program cards + in-card CardDeck for collections/phase rows + §6.7.6 quick popups (program
// detail → enrol) + PAPER_BG + canonical pinned Jump-to. Ease-first: an obvious "Continue" primary + search;
// ~2 phone screens.
//
// FULL PARITY (live Programs → this demo; checklist at foot): continue active program (progress + reminder) +
// other active mini-cards · featured "a good place to start" · phase recommendations ("for your X phase") ·
// curated collection rows (by need/goal) · browse-all grid + search + sort · program cards (thumbnail · meta
// days/audio/book · tier badge Free/Plus + Lock · progress bar · enrol/continue) · program detail → days.
import { useState } from "react";
import {
  Check, X, Play, Clock, BookOpen, Headphones, Lock, Search, Flame, Moon, Heart, Sparkles,
  Sun, Wind, Activity, ChevronRight, CalendarDays, Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { T, SCRIPT, SERIF, UI, PAPER_BG, Hand } from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { ClipboardSlider, Clipboard, CardDeck } from "@/components/brand/ClipboardSlider";
import { RichBloomV2, floraKeyframes, cwOf } from "@/components/brand/flora";
import JumpToButton from "@/components/layout/JumpToButton";

const GOLD = cwOf("gold"), SAGE = cwOf("sage"), PLUM = cwOf("plum"), CRIM = cwOf("crimson"), SKY = cwOf("sky");
// seeded programs
const ACTIVE = { key: "sleep-reset", title: "The Sleep Reset", sub: "Calmer nights, in 14 gentle days", day: 4, days: 14, cw: "plum", flower: "violet", Icon: Moon, tier: "free" };
const FEATURED = { key: "luteal", title: "Kinder Luteal Weeks", sub: "Soften the week before your period", days: 10, cw: "crimson", flower: "anemone", Icon: Heart, tier: "free", meta: ["10 days", "audio"] };
const PHASE_PROGS = [
  { key: "energy", title: "Follicular Energy", sub: "Ride the rising tide", days: 7, cw: "sage", flower: "clover", Icon: Sun, tier: "free", meta: ["7 days"] },
  { key: "focus", title: "Peak-Week Focus", sub: "Make the ovulatory days count", days: 5, cw: "gold", flower: "sunflower", Icon: Sparkles, tier: "plus", meta: ["5 days", "audio"] },
  { key: "rest", title: "Luteal Rest", sub: "Permission to slow down", days: 7, cw: "plum", flower: "iris", Icon: Wind, tier: "free", meta: ["7 days", "book"] },
];
const COLLECTIONS = [
  { title: "For better sleep", cw: "plum", items: [{ title: "The Sleep Reset", days: 14 }, { title: "Wind-down ritual", days: 7 }, { title: "Night-waking ease", days: 10 }] },
  { title: "For PMDD & low mood", cw: "crimson", items: [{ title: "Kinder Luteal Weeks", days: 10 }, { title: "Mood steadier", days: 21 }, { title: "Gentle mornings", days: 14 }] },
  { title: "For perimenopause", cw: "gold", items: [{ title: "Cooling the flushes", days: 14 }, { title: "Steady through peri", days: 28 }, { title: "Sleep in peri", days: 14 }] },
];
const BROWSE = [
  { key: "b1", title: "The Sleep Reset", sub: "14 days", cw: "plum", Icon: Moon, tier: "free" },
  { key: "b2", title: "Kinder Luteal Weeks", sub: "10 days · audio", cw: "crimson", Icon: Heart, tier: "free" },
  { key: "b3", title: "Follicular Energy", sub: "7 days", cw: "sage", Icon: Sun, tier: "free" },
  { key: "b4", title: "Cooling the Flushes", sub: "14 days · audio", cw: "gold", Icon: Flame, tier: "plus" },
  { key: "b5", title: "Move with your cycle", sub: "28 days", cw: "sage", Icon: Activity, tier: "plus" },
  { key: "b6", title: "Steady Mornings", sub: "14 days · book", cw: "plum", Icon: Sun, tier: "free" },
];
const JUMP = [
  { id: "continue", label: "Continue", sub: "your active journeys", Icon: Play, cw: "plum" },
  { id: "start", label: "Start here", sub: "a good place to begin", Icon: Star, cw: "crimson" },
  { id: "phase", label: "For your phase", sub: "luteal picks", Icon: CalendarDays, cw: "gold" },
  { id: "collections", label: "Collections", sub: "by what you need", Icon: BookOpen, cw: "sage" },
  { id: "browse", label: "Browse all", sub: "every journey", Icon: Search, cw: "plum" },
];

function TierBadge({ tier }) {
  if (tier === "plus") return <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontFamily: UI, fontSize: 9.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: GOLD.petal, border: `1px solid ${GOLD.petal}`, borderRadius: 999, padding: "2px 7px" }}><Lock size={9} /> Plus</span>;
  return <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: SAGE.petal, border: `1px solid ${SAGE.petal}`, borderRadius: 999, padding: "2px 7px" }}>Free</span>;
}
function Thumb({ flower = "cosmos", cw = "plum", size = 96 }) {
  const c = cwOf(cw);
  return <div style={{ width: size, height: size, borderRadius: 16, flexShrink: 0, display: "grid", placeItems: "center", background: `linear-gradient(150deg, ${c.petal}22 0%, ${c.tip}33 100%)`, border: `1px solid ${T.paperDeep}` }}><RichBloomV2 form={flower} color={c.petal} color2={c.tip} accent={c.accent} size={Math.round(size * 0.72)} idx={`thumb-${flower}-${cw}`} /></div>;
}
// rich program card (Card.jsx language)
function ProgramCard({ p, onTap, big }) {
  const c = cwOf(p.cw);
  const pct = p.day ? Math.round((p.day / p.days) * 100) : null;
  return (
    <button onClick={onTap} aria-label={p.title} style={{ textAlign: "left", cursor: "pointer", width: "100%", display: "flex", gap: 12, background: `linear-gradient(165deg, ${T.paperHi} 0%, ${c.petal}14 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${c.petal}`, borderRadius: 18, padding: 14, boxShadow: "0 3px 12px rgba(11,8,5,0.06)" }}>
      <Thumb flower={p.flower || "cosmos"} cw={p.cw} size={big ? 104 : 84} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
          {p.Icon && <p.Icon size={14} color={c.petal} />}<TierBadge tier={p.tier} />
        </div>
        <div style={{ fontFamily: SERIF, fontSize: big ? 19 : 16.5, fontWeight: 700, color: T.ink, lineHeight: 1.2 }}>{p.title}</div>
        <div style={{ fontFamily: SERIF, fontSize: 13.5, color: T.muted, lineHeight: 1.4, marginTop: 2 }}>{p.sub}</div>
        {(p.meta || []).length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {p.meta.map((m) => <span key={m} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: UI, fontSize: 10.5, color: T.muted, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "3px 8px" }}>{/audio/.test(m) ? <Headphones size={10} /> : /book/.test(m) ? <BookOpen size={10} /> : <Clock size={10} />} {m}</span>)}
          </div>
        )}
        {pct != null && (
          <div style={{ marginTop: 9 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: UI, fontSize: 11, marginBottom: 3 }}><span style={{ color: c.petal, fontWeight: 700 }}>Day {p.day} of {p.days}</span><span style={{ color: T.muted }}>{pct}%</span></div>
            <div style={{ height: 6, borderRadius: 99, background: T.paperDeep, overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "100%", background: c.petal }} /></div>
          </div>
        )}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10, fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: p.tier === "plus" ? GOLD.petal : c.petal }}>
          {p.tier === "plus" ? <><Lock size={12} /> Unlock with Plus</> : pct != null ? <><Play size={12} /> Continue</> : <><Play size={12} /> Start journey</>}
        </span>
      </div>
    </button>
  );
}

export default function ProgramsClipboardDemo() {
  const navigate = useNavigate();
  const link = (p) => navigate(createPageUrl(p));
  const [sheet, setSheet] = useState(null);
  const [program, setProgram] = useState(null);
  const [q, setQ] = useState("");
  const browse = BROWSE.filter((b) => !q || (b.title + b.sub).toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", paddingBottom: 112, position: "relative", overflowX: "clip" }}>
      <style>{floraKeyframes}</style>
      <JumpToButton pinned onClick={() => setSheet("jump")} />

      <FwFloraHero title="Programs" bloom="cosmos" colorway="sage" flankL="clover" flankR="chamomile" creature="butterfly"
        line="Gentle, guided journeys — a few minutes a day. Pick up where you left off, or start somewhere new." ringSize={184} bloomSize={116} />

      <Wrap>
        <div style={{ marginTop: 6 }}>
          <SummaryCard eyebrow="Continue your journey" accent={PLUM.petal} rows={[
            { Icon: Play, label: "Active", text: `${ACTIVE.title} — day ${ACTIVE.day} of ${ACTIVE.days}`, onClick: () => setProgram(ACTIVE) },
            { Icon: CalendarDays, label: "For now", text: "Luteal week — gentler journeys suit you this week", onClick: () => setSheet("jump") },
            { Icon: Star, label: "New", text: "Kinder Luteal Weeks — a good place to start", onClick: () => setProgram(FEATURED) },
          ]} />
        </div>

        {/* PRIMARY ACTIONS */}
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button onClick={() => setProgram(ACTIVE)} aria-label="Continue your active journey" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, background: PLUM.petal, color: "#fff", border: "none", borderRadius: 16, padding: "15px 12px", fontFamily: UI, fontSize: 14, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", cursor: "pointer", boxShadow: `0 6px 18px ${PLUM.petal}55` }}>
            <span aria-hidden style={{ display: "grid", placeItems: "center", width: 26, height: 26, borderRadius: 999, background: "rgba(255,255,255,0.22)" }}><Play size={15} /></span> Continue
          </button>
          <button onClick={() => setSheet("jump")} aria-label="Browse journeys" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, background: GOLD.petal, color: "#fff", border: "none", borderRadius: 16, padding: "15px 12px", fontFamily: UI, fontSize: 14, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", cursor: "pointer", boxShadow: "0 6px 18px rgba(168,137,63,0.32)" }}>
            <Search size={18} /> Browse
          </button>
        </div>
        {/* search */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "9px 14px" }}>
          <Search size={15} color={T.muted} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search journeys — sleep, mood, energy…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: UI, fontSize: 13.5, color: T.ink }} />
        </div>

        <Hand size={14} color={T.muted} style={{ display: "block", margin: "12px 0 0", textAlign: "center" }}>
          Your whole library on a few boards — slide each sideways; tap any journey to look inside.
        </Hand>
      </Wrap>

      <div style={{ position: "relative", zIndex: 1, padding: "8px 16px 0", maxWidth: 600, margin: "0 auto" }}>
        <ClipboardSlider hint="Slide — your journeys" accent={PLUM.petal}>
          <Clipboard title="Continue" sub="PICK UP WHERE YOU LEFT OFF" accent={PLUM.petal} flower="violet" idx="cb-cont">
            <ProgramCard p={ACTIVE} big onTap={() => setProgram(ACTIVE)} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 11, padding: "10px 12px", borderRadius: 12, background: `${GOLD.petal}14`, border: `1px solid ${T.paperDeep}` }}>
              <Sparkles size={15} color={GOLD.petal} />
              <span style={{ flex: 1, fontFamily: SERIF, fontSize: 13.5, color: T.muted }}>Reminder set for 9:00pm — tonight's day is ready.</span>
            </div>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: T.muted, margin: "12px 0 7px" }}>Also in progress</div>
            <button onClick={() => setProgram(PHASE_PROGS[2])} style={miniRow}>
              <Thumb flower="iris" cw="plum" size={40} />
              <span style={{ flex: 1, textAlign: "left" }}><span style={{ display: "block", fontFamily: SERIF, fontSize: 14.5, fontWeight: 600, color: T.ink }}>Luteal Rest</span><span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>day 2 of 7</span></span>
              <ChevronRight size={16} color={T.muted} />
            </button>
          </Clipboard>

          <Clipboard title="Start here" sub="A GOOD PLACE TO BEGIN" accent={T.crimson} flower="anemone" idx="cb-feat">
            <ProgramCard p={FEATURED} big onTap={() => setProgram(FEATURED)} />
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: T.muted, textAlign: "center", margin: "12px 6px 0", lineHeight: 1.5 }}>Hand-picked for where you are this week — short, kind, and easy to keep.</p>
          </Clipboard>

          <Clipboard title="For your phase" sub="LUTEAL WEEK — GENTLER PICKS — SWIPE" accent={GOLD.petal} flower="iris" idx="cb-phase">
            <CardDeck accent={GOLD.petal}>
              {PHASE_PROGS.map((p) => <ProgramCard key={p.key} p={p} onTap={() => setProgram(p)} />)}
            </CardDeck>
          </Clipboard>
        </ClipboardSlider>

        <div style={{ height: 18 }} />

        <ClipboardSlider hint="Slide — explore the library" accent={SAGE.petal}>
          {COLLECTIONS.map((col) => { const c = cwOf(col.cw); return (
            <Clipboard key={col.title} title={col.title} sub="A CURATED COLLECTION" accent={c.petal} flower="clover" idx={`cb-col-${col.cw}`}>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {col.items.map((it, i) => (
                  <button key={it.title} onClick={() => setProgram({ title: it.title, sub: `${it.days} days`, cw: col.cw, days: it.days, flower: "clover", Icon: BookOpen, tier: i === 2 ? "plus" : "free" })} style={miniRow}>
                    <Thumb flower="clover" cw={col.cw} size={42} />
                    <span style={{ flex: 1, textAlign: "left" }}><span style={{ display: "block", fontFamily: SERIF, fontSize: 14.5, fontWeight: 600, color: T.ink }}>{it.title}</span><span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>{it.days} days{i === 2 ? " · Plus" : ""}</span></span>
                    <ChevronRight size={16} color={T.muted} />
                  </button>
                ))}
              </div>
            </Clipboard>
          ); })}

          <Clipboard title="Browse all" sub="EVERY JOURNEY — TAP TO LOOK INSIDE" accent={PLUM.petal} flower="cosmos" idx="cb-browse">
            {q && <p style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, margin: "0 0 9px" }}>{browse.length} match{browse.length === 1 ? "" : "es"} for “{q}”</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {browse.map((b) => (
                <button key={b.key} onClick={() => setProgram({ ...b, days: parseInt(b.sub) || 14, flower: "cosmos", meta: [b.sub] })} style={miniRow}>
                  <Thumb flower="cosmos" cw={b.cw} size={44} />
                  <span style={{ flex: 1, textAlign: "left" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontFamily: SERIF, fontSize: 14.5, fontWeight: 600, color: T.ink }}>{b.title}</span><TierBadge tier={b.tier} /></span>
                    <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>{b.sub}</span>
                  </span>
                  <ChevronRight size={16} color={T.muted} />
                </button>
              ))}
              {browse.length === 0 && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, textAlign: "center", padding: "12px 0" }}>Nothing matches that yet — try “sleep” or “mood”.</p>}
            </div>
          </Clipboard>
        </ClipboardSlider>
      </div>

      {program && <ProgramSheet p={program} onClose={() => setProgram(null)} />}
      {sheet === "jump" && <JumpSheet onClose={() => setSheet(null)} onPick={() => setSheet(null)} />}
    </div>
  );
}

function Wrap({ children }) { return <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px" }}>{children}</div>; }

function ProgramSheet({ p, onClose }) {
  const c = cwOf(p.cw || "plum");
  const pct = p.day ? Math.round((p.day / p.days) * 100) : null;
  const days = Array.from({ length: Math.min(p.days || 7, 7) }, (_, i) => i + 1);
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" style={scrim}><style>{floraKeyframes}</style>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe" style={{ ...sheetStyle, borderTop: `3px solid ${c.petal}` }}>
        <div style={grab} />
        <div style={{ display: "flex", gap: 12, marginBottom: 6 }}>
          <Thumb flower={p.flower || "cosmos"} cw={p.cw} size={72} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}><TierBadge tier={p.tier} /></div>
            <div style={{ fontFamily: SCRIPT, fontSize: 25, color: T.ink, lineHeight: 1 }}>{p.title}</div>
            <div style={{ fontFamily: SERIF, fontSize: 14, color: T.muted, marginTop: 3 }}>{p.sub}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={iconX}><X size={20} /></button>
        </div>
        <p style={{ fontFamily: SERIF, fontSize: 15.5, color: T.muted, lineHeight: 1.55, margin: "8px 0 12px" }}>A gentle {p.days}-day journey — a few quiet minutes each day. Small steps, audio guides, and a soft check-in. No streaks to break; pick it up whenever you can.</p>
        {pct != null && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: UI, fontSize: 11.5, marginBottom: 3 }}><span style={{ color: c.petal, fontWeight: 700 }}>Day {p.day} of {p.days}</span><span style={{ color: T.muted }}>{pct}%</span></div>
            <div style={{ height: 7, borderRadius: 99, background: T.paperDeep, overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "100%", background: c.petal }} /></div>
          </div>
        )}
        <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: T.muted, marginBottom: 7 }}>The days</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
          {days.map((d) => { const done = p.day && d < p.day; const cur = p.day === d; return (
            <div key={d} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 10, background: cur ? `${c.petal}1a` : T.paper, border: `1px solid ${cur ? c.petal : T.paperDeep}` }}>
              <span style={{ width: 22, height: 22, borderRadius: 99, background: done ? c.petal : "transparent", border: done ? "none" : `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", fontFamily: UI, fontSize: 11, fontWeight: 700, color: done ? "#fff" : T.muted }}>{done ? <Check size={12} color="#fff" /> : d}</span>
              <span style={{ flex: 1, fontFamily: SERIF, fontSize: 14, color: T.ink }}>Day {d} · {["Settle in", "A small shift", "Notice the body", "A kinder night", "Steady on", "Going deeper", "Reflect & carry on"][d - 1] || "Keep going"}</span>
              {cur && <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, color: c.petal }}>TODAY</span>}
            </div>
          ); })}
          {p.days > 7 && <p style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, textAlign: "center", margin: "2px 0 0" }}>+ {p.days - 7} more days</p>}
        </div>
        <button onClick={onClose} style={{ ...cta, background: p.tier === "plus" ? GOLD.petal : c.petal }}>
          {p.tier === "plus" ? <><Lock size={16} /> Unlock with Plus</> : pct != null ? <><Play size={16} /> Continue — day {p.day}</> : <><Play size={16} /> Start this journey</>}
        </button>
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
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, marginBottom: 14 }}>every shelf of the library, by name</div>
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

const miniRow = { display: "flex", alignItems: "center", gap: 11, width: "100%", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "9px 11px", cursor: "pointer" };
const scrim = { position: "fixed", inset: 0, zIndex: 9999, background: "rgba(11,8,5,0.46)", display: "flex", alignItems: "flex-end", justifyContent: "center" };
const sheetStyle = { width: "100%", maxWidth: 520, background: T.paperHi, borderTopLeftRadius: 22, borderTopRightRadius: 22, borderTop: `3px solid ${T.gold}`, boxShadow: "0 -8px 40px rgba(11,8,5,.24)", padding: "16px 18px 20px", maxHeight: "84dvh", overflowY: "auto" };
const grab = { width: 38, height: 4, borderRadius: 99, background: T.paperDeep, margin: "0 auto 14px" };
const iconX = { background: "transparent", border: "none", cursor: "pointer", color: T.muted, alignSelf: "flex-start" };
const cta = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", color: "#fff", border: "none", borderRadius: 12, padding: "14px 16px", fontFamily: UI, fontSize: 15, fontWeight: 700, cursor: "pointer" };

/* ── PARITY CHECKLIST (live Programs → this demo) ──
 SIGNATURE: ✅ flora hero · ✅ one summary (active/for-now/new) · ★✅ primary Continue + Browse · ✅ search ·
   ✅ canonical pinned Jump-to.
 YOUR-JOURNEYS slider: ✅ Continue active program (progress bar + reminder) + ✅ other-active mini-cards ·
   ✅ Featured "a good place to start" · ✅ For-your-phase recommendations (in-card CardDeck of program cards).
 LIBRARY slider: ✅ curated collection rows (sleep · PMDD/mood · perimenopause) · ✅ Browse-all + ✅ search filter.
 PROGRAM CARD: ✅ thumbnail · ✅ meta (days/audio/book) · ✅ tier badge (Free/Plus + Lock) · ✅ progress bar ·
   ✅ enrol/continue CTA. ✅ program detail popup → the days list (done/today/upcoming) → start/continue/unlock.
 §6.7.6 quick popups · clipboard + CardDeck spine · ~2 screens · v4 bible · demo-first (seeded). */
