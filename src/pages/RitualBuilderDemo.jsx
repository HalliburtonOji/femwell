// RitualBuilderDemo — STANDALONE preview of the Ritual Builder (the daily habit
// loop), for Halli's approval before it goes live. Demo-first; live Today/pages
// are NOT touched (the Today session owns Today).
//
// Builds on the LOCKED v4 brand: the §6.7 card family + the §6.7.6 QUICK-ACTION
// POPUP ("do it in place, then it ticks") + the §10 living ecosystem (a kept
// ritual grows a bloom / earns a pollinator + a "they say…" omen) + the soulful
// voice (kettle rule, "a vote for who you're becoming"). On live, completion
// rides the existing RitualsTick / HabitLogs dispatcher — NO new function.
//
// Compatibility note: rituals = the DAILY habit loop; the tiny-missions/quests
// brainstorm is the broader layer — both feed the same garden, kept separate.
import { useState } from "react";
import { Moon, Droplet, Feather, Wind, Heart, Flower2, Sparkles, Check, X, Plus, ListChecks } from "lucide-react";
import { T, SCRIPT, SERIF, UI } from "@/components/journal/Editorial";
import { FwCard, FwCardCTA } from "@/components/brand/Card";
import { RichBloomV2, FlowerGlyph, Pollinator, floraKeyframes, cwOf } from "@/components/brand/flora";
import { CardDemoPage, DemoSummary } from "@/components/demos/cardDemoKit";

// The ritual vocabulary — each contextualised to the surface it belongs on.
const RITUALS = [
  { id: "rest", ctx: "Today", icon: Moon, cw: "plum", flower: "violet", title: "A moment of rest", why: "Pause, drop your shoulders, three slow breaths.", omen: "They say the luna moth rests in the dark so it can fly at dawn. Light the kettle; let this one be small." },
  { id: "water", ctx: "Nutrition", icon: Droplet, cw: "sky", flower: "bluebell", title: "A glass of water", why: "Half a glass counts. Your body says thank you.", omen: "A bluebell only rings for those who listen — and water, apparently. One sip is a yes to yourself." },
  { id: "lines", ctx: "Journal", icon: Feather, cw: "crimson", flower: "poppy", title: "Three quiet lines", why: "Not a diary. Just three true sentences.", omen: "They say a poppy keeps what it's told. Three lines now; the garden remembers them for you." },
  { id: "pause", ctx: "Pulse", icon: Wind, cw: "plum", flower: "cosmos", title: "A mindful pause", why: "Name one thing you can hear right now.", omen: "The dragonfly sees through still water. One held breath and the day gets clearer too." },
  { id: "message", ctx: "Community", icon: Heart, cw: "sage", flower: "cornflower", title: "One kind message", why: "Text a friend — or, as they say, tell the bees your news.", omen: "Tell the bees and they carry it on. One kind line out is one kept connection." },
  { id: "tend", ctx: "Garden", icon: Flower2, cw: "sage", flower: "daisy", title: "Tend your companion", why: "Water Meadowlight. She remembers being tended.", omen: "A watched garden grows slow; a tended one grows true. She felt that." },
];
const EXTRA = [
  { id: "move", ctx: "Today", icon: Sparkles, cw: "gold", flower: "sunflower", title: "A gentle stretch", why: "Reach for the ceiling. That's the whole ritual.", omen: "Sunflowers turn to find the light. So can shoulders." },
  { id: "gratitude", ctx: "Journal", icon: Heart, cw: "blush", flower: "primrose", title: "One small thank-you", why: "Name one thing that went right today.", omen: "Primrose means 'I can't live without you' — start with one small gladness." },
];
const ALL = [...RITUALS, ...EXTRA];

export default function RitualBuilderDemo() {
  const [done, setDone] = useState({});          // ritual id -> note (optimistic tick)
  const [popup, setPopup] = useState(null);      // the ritual being done
  const [set, setSet] = useState(["rest", "water", "lines"]); // the composed daily set (Planner builder)

  const doneCount = Object.keys(done).length;
  const complete = (id, note) => { setDone((d) => ({ ...d, [id]: note || true })); setPopup(null); };
  const toggleSet = (id) => setSet((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  // signal-driven "right now" pick (demo: evening · luteal → a moment of rest)
  const nowRitual = RITUALS[0];

  const RitualCard = ({ r, eyebrow }) => {
    const c = cwOf(r.cw);
    const isDone = !!done[r.id];
    const Icon = r.icon;
    return (
      <FwCard accent={c.petal} Icon={Icon} eyebrow={eyebrow || r.ctx} flower={r.flower} title={r.title}
        line={r.why} idx={`r-${r.id}`}
        action={isDone
          ? <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: UI, fontSize: 14, fontWeight: 700, color: c.petal }}><Check size={16} /> Done — a bloom grew</div>
          : <FwCardCTA accent={c.petal} onClick={() => setPopup(r)} icon={Icon}>Do it now</FwCardCTA>} />
    );
  };

  return (
    <CardDemoPage label="Demo · Ritual Builder · habit loop"
      hero={{ title: "Rituals", bloom: "cosmos", colorway: "sage", flankL: "violet", flankR: "primrose", creature: "bee", line: "Tiny tending, woven through your day — each kept ritual is a vote for who you're becoming." }}>

      <DemoSummary>
        <FwCard accent={T.sage} eyebrow="What this is" flower="fern" title="Small rituals, not big resolutions"
          line="A ritual is a 10-second tending you actually do — a glass of water, three lines, a mindful pause. You do it right here in a little popup, it ticks, and a bloom grows in your garden. Light a candle, or just the kettle."
          idx="intro" />
      </DemoSummary>

      {/* 1 · On Today — the surfaced "right now" ritual */}
      <Section title="On Today" sub="a one-tap ritual for right now — phase, time & energy aware">
        <Wrap><RitualCard r={nowRitual} eyebrow="Right now · evening · luteal" /></Wrap>
      </Section>

      {/* 2 · Cross-page — the same card, contextualised per surface */}
      <Section title="Across your day" sub="the same RitualCard, contextualised to each surface it lives on">
        <div style={{ display: "flex", gap: 14, overflowX: "auto", scrollSnapType: "x mandatory", padding: "0 18px 6px" }}>
          {RITUALS.map((r) => <div key={r.id} style={{ scrollSnapAlign: "center", flex: "0 0 300px" }}><RitualCard r={r} /></div>)}
          <div style={{ flex: "0 0 4px" }} aria-hidden />
        </div>
      </Section>

      {/* 3 · The living ecosystem — completing rituals grows the garden */}
      <Section title="The garden grows" sub="every kept ritual waters the garden — three, and a visitor comes">
        <Wrap>
          <div style={{ position: "relative", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${T.sage}`, borderRadius: 20, padding: "18px 16px", boxShadow: "0 4px 20px rgba(11,8,5,.08)" }}>
            <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: T.sage, marginBottom: 4 }}>Today's tending</div>
            <div style={{ fontFamily: SERIF, fontSize: 18, color: T.ink, marginBottom: 12 }}>{doneCount === 0 ? "Nothing yet — do one above and watch it grow." : `${doneCount} ritual${doneCount > 1 ? "s" : ""} kept`}</div>
            {/* the growing row of blooms */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, minHeight: 92, flexWrap: "wrap" }}>
              {doneCount === 0 && <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted }}>a bare bed, waiting</span>}
              {Object.keys(done).map((id, i) => {
                const r = ALL.find((x) => x.id === id); const c = cwOf(r?.cw || "sage");
                return <div key={id} style={{ animation: "fwcBreath 6s ease-in-out infinite", animationDelay: `${i * 0.3}s` }}><RichBloomV2 form={r?.flower === "violet" ? "anemone" : r?.flower === "poppy" ? "poppy" : r?.flower === "sunflower" ? "sunflower" : "cosmos"} color={c.petal} color2={c.tip} accent={c.accent} size={72} idx={`grow-${id}`} /></div>;
              })}
              {doneCount >= 3 && <div style={{ alignSelf: "flex-start", marginLeft: 2 }}><Pollinator kind="butterfly" size={42} color={cwOf("plum").petal} color2={cwOf("gold").petal} idx="visit" /></div>}
            </div>
            {doneCount >= 3 && <div style={{ fontFamily: SCRIPT, fontSize: 22, color: T.crimson, marginTop: 8, lineHeight: 1.2 }}>A visitor — they say the butterfly is the soul, come back to see what you've grown.</div>}
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, marginTop: 8 }}>On live: each tick waters your companion &amp; extends a vine (rides the existing RitualsTick / HabitLogs dispatcher — no new function).</div>
          </div>
        </Wrap>
      </Section>

      {/* 4 · The builder (Planner) — compose your own set */}
      <Section title="Compose your set" sub="the builder stays in Planner — pick the rituals that hold your week">
        <Wrap>
          <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${T.gold}`, borderRadius: 20, padding: "18px 16px", boxShadow: "0 4px 20px rgba(11,8,5,.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <ListChecks size={16} color={T.gold} />
              <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: T.gold }}>Your rituals today</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ALL.map((r) => {
                const on = set.includes(r.id); const c = cwOf(r.cw); const Icon = r.icon;
                return (
                  <button key={r.id} onClick={() => toggleSet(r.id)} style={{
                    display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
                    fontFamily: UI, fontSize: 13, fontWeight: 700, padding: "8px 13px", borderRadius: 999,
                    border: `1px solid ${on ? c.petal : T.paperDeep}`, background: on ? `${c.petal}1a` : T.paper, color: on ? T.ink : T.muted,
                  }}>
                    {on ? <Check size={14} color={c.petal} /> : <Plus size={14} />}<Icon size={13} color={c.petal} /> {r.title}
                  </button>
                );
              })}
            </div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, marginTop: 12 }}>{set.length} ritual{set.length === 1 ? "" : "s"} in your daily set — they'll surface on Today &amp; the right pages, one at a time.</div>
          </div>
        </Wrap>
      </Section>

      {/* ── §6.7.6 QUICK-ACTION POPUP — do it in place, then it ticks ── */}
      {popup && <QuickActionPopup ritual={popup} onClose={() => setPopup(null)} onDone={complete} />}
    </CardDemoPage>
  );
}

function Section({ title, sub, children }) {
  return (
    <div style={{ marginTop: 26 }}>
      <div style={{ padding: "0 18px" }}>
        <div style={{ fontFamily: SCRIPT, fontSize: 28, color: T.ink, lineHeight: 1.1 }}>{title}</div>
        {sub && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, marginBottom: 12 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}
function Wrap({ children }) { return <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px" }}>{children}</div>; }

// The quick-action popup (§6.7.6): a bottom sheet, do the thing in place → ticks.
function QuickActionPopup({ ritual, onClose, onDone }) {
  const [note, setNote] = useState("");
  const c = cwOf(ritual.cw);
  const Icon = ritual.icon;
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(11,8,5,0.46)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <style>{floraKeyframes}</style>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe" style={{
        width: "100%", maxWidth: 520, background: T.paperHi, borderTopLeftRadius: 22, borderTopRightRadius: 22,
        borderTop: `1px solid ${T.paperDeep}`, boxShadow: "0 -8px 40px rgba(11,8,5,.24)", padding: "16px 18px 20px",
        maxHeight: "82dvh", overflowY: "auto",
      }}>
        <div style={{ width: 38, height: 4, borderRadius: 99, background: T.paperDeep, margin: "0 auto 14px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: T.wax || T.paper, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center" }}><Icon size={17} color={c.petal} /></span>
          <div>
            <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: c.petal }}>{ritual.ctx} · ritual</div>
            <div style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 600, color: T.ink, lineHeight: 1.2 }}>{ritual.title}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ marginLeft: "auto", background: "transparent", border: "none", cursor: "pointer", color: T.muted }}><X size={20} /></button>
        </div>
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.muted, lineHeight: 1.5, margin: "6px 0 4px" }}>{ritual.why}</p>
        <p style={{ fontFamily: SCRIPT, fontSize: 19, color: c.petal, lineHeight: 1.25, margin: "0 0 14px" }}>{ritual.omen}</p>

        {/* the bloom that grows on completion */}
        <div style={{ display: "grid", placeItems: "center", margin: "4px 0 12px" }}>
          <RichBloomV2 form={ritual.flower === "violet" ? "anemone" : ritual.flower === "poppy" ? "poppy" : "cosmos"} color={c.petal} color2={c.tip} accent={c.accent} size={108} idx={`pop-${ritual.id}`} />
        </div>

        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="A word about it, if you like (optional)…" rows={2}
          style={{ width: "100%", boxSizing: "border-box", fontFamily: SERIF, fontSize: 15, color: T.ink, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "10px 12px", resize: "none", marginBottom: 12 }} />

        <button onClick={() => onDone(ritual.id, note)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", background: c.petal, color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          <Check size={16} /> Done — and a bloom opens
        </button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 10 }}>
          <FlowerGlyph variant="fern" size={16} color={T.sage} idx="pop-foot" />
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>a vote for who you're becoming</span>
        </div>
      </div>
    </div>
  );
}
