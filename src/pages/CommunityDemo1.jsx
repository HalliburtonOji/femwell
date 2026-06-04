// CommunityDemo1 — "Echo Wall" (Community design demo · /Ideas → Community Demos)
// ─────────────────────────────────────────────────────────────────────────────
// A room of one-liners. Anonymous one-line entries from women in the same phase,
// holding only (no replies, no DMs), fading 48h after they go live. This is the
// EDITORIAL ITERATION of the shipped Echo Wall (src/components/journal/echo/*) —
// self-contained, mock data only, no entities queried. Safe to deploy.
//
// Captures, from COMMUNITY_BUILD_SPEC §2.A: phase-weighted feed · "your phase"
// chip · live cohort line · held / me-too reactions (non-transactional, one-way)
// · still-cooling "Pull it back" strip · 48h fade label · report → auto-hide ·
// the Share-as-Echo flow (Jess scrub → crisis intercept → cooling notice).
//
// Brand-pure: UK voice, no emoji, Lucide + the shared Editorial kit only.
import { useState } from "react";
import {
  Waves, HeartHandshake, Users, Flag, Undo2, Clock, ShieldAlert, Phone, Check,
  Feather, X,
} from "lucide-react";
import {
  T, SERIF, UI, Eyebrow, Rule, Script, Hand, InkFilter, EditorialFooter,
  useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";

// ── mock feed (UK voice; phase-weighted — sisters first) ─────────────────────
const SEED = [
  { id: "e1", body: "The inbox can wait until I have remembered how to breathe.", phase: "luteal", sister: true,  day: "luteal d19", held: 14, metoo: 8,  fadeH: 41 },
  { id: "e2", body: "I said the quieter no today. It cost me nothing I will miss.", phase: "luteal", sister: true,  day: "luteal d20", held: 31, metoo: 12, fadeH: 38 },
  { id: "e3", body: "Tired in a way sleep does not touch. Naming it helped.",        phase: "luteal", sister: true,  day: "luteal d18", held: 22, metoo: 19, fadeH: 33 },
  { id: "e4", body: "First clear morning in a fortnight. I had forgotten the feeling.", phase: "follicular", sister: false, day: "follicular d6", held: 9, metoo: 4, fadeH: 27 },
  { id: "e5", body: "Asked for help before I was drowning. New for me.",             phase: "ovulatory", sister: false, day: "ovulatory d14", held: 17, metoo: 6, fadeH: 19 },
];

// a deliberately broad crisis lexicon (mirrors echoConfig.CRISIS_PATTERNS shape)
const CRISIS = ["end it", "no point", "hurt myself", "kill", "can't go on", "worthless"];

export default function CommunityDemo1() {
  useEditorialFonts();
  const [feed, setFeed] = useState(SEED);
  const [empty, setEmpty] = useState(false);
  const [reacted, setReacted] = useState({});   // { [id]: Set-like {held,metoo} }
  const [reported, setReported] = useState({});
  const [cooling, setCooling] = useState([
    { id: "c1", body: "Some days steadier counts as a triumph. Today is one.", goLive: "06:00", note: "held past the late-luteal window" },
  ]);
  const [composeOpen, setComposeOpen] = useState(false);

  const react = (id, kind) => {
    if (reacted[id]?.[kind]) return;                 // one-way, on-device dedup
    setReacted((r) => ({ ...r, [id]: { ...r[id], [kind]: true } }));
    setFeed((f) => f.map((e) => e.id === id
      ? { ...e, [kind === "held" ? "held" : "metoo"]: e[kind === "held" ? "held" : "metoo"] + 1 } : e));
  };
  const report = (id) => {
    if (reported[id]) return;
    setReported((r) => ({ ...r, [id]: true }));
    // report → auto-hide at threshold (demo: hides immediately on 2nd internal count)
    setFeed((f) => f.filter((e) => e.id !== id));
  };
  const pullBack = (id) => setCooling((c) => c.filter((e) => e.id !== id));

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 60 }}>
      <InkFilter />
      <DemoBanner label="Community · Echo Wall — design demo · mock data" />

      <div style={{ maxWidth: 620, margin: "0 auto", padding: "26px 20px 0" }}>
        {/* masthead */}
        <header style={{ textAlign: "center", marginBottom: 18 }}>
          <Eyebrow mb={10} color={T.muted}>The Echo Wall</Eyebrow>
          <Script size={52} carve>A room of one-liners</Script>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft, margin: "10px auto 0", maxWidth: 440, lineHeight: 1.5 }}>
            No handles, no threads, no replies. Just sisters holding sentences — each one
            fades two days after it lands.
          </p>
        </header>

        {/* live cohort line */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "11px 14px", margin: "0 0 18px", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 13 }}>
          <Waves size={15} color={T.gold} />
          <span style={{ fontFamily: UI, fontSize: 12.5, color: T.inkSoft, letterSpacing: 0.2 }}>
            <strong style={{ color: T.ink }}>Five women</strong> in their inner autumn left a line in this hour.
          </span>
        </div>

        {/* still-cooling — author only */}
        {cooling.map((c) => (
          <article key={c.id} style={{ border: `1.5px dashed ${T.paperDeep}`, borderRadius: 14, padding: "14px 16px", marginBottom: 14, background: "transparent" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
              <Clock size={13} color={T.muted} />
              <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: T.muted }}>
                Still cooling · goes live {c.goLive}
              </span>
            </div>
            <Hand size={22} carve>{c.body}</Hand>
            <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, fontStyle: "italic", margin: "6px 0 10px" }}>{c.note}. Only you can see it until then.</div>
            <button onClick={() => pullBack(c.id)} style={pillBtn(false)}>
              <Undo2 size={13} /> Pull it back
            </button>
          </article>
        ))}

        {/* feed / empty */}
        {empty ? (
          <EmptyState />
        ) : (
          feed.map((e) => (
            <EchoCard
              key={e.id} e={e}
              reacted={reacted[e.id] || {}} reported={!!reported[e.id]}
              onReact={react} onReport={report}
            />
          ))
        )}

        {/* leave a line */}
        <button onClick={() => setComposeOpen(true)} style={{ ...pillBtn(true), width: "100%", justifyContent: "center", marginTop: 6, padding: "13px 0" }}>
          <Feather size={15} /> Leave a line — from your Journal
        </button>

        {/* state toggles (demo affordance) */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 18 }}>
          <button onClick={() => setEmpty((v) => !v)} style={miniToggle}>{empty ? "Show populated wall" : "Show empty state"}</button>
        </div>

        <div style={{ marginTop: 30 }}><EditorialFooter /></div>
      </div>

      {composeOpen && <ShareAsEcho onClose={() => setComposeOpen(false)} onShare={(body) => { setCooling((c) => [{ id: "n" + Date.now(), body, goLive: "in 10 min", note: "a 10-minute cooling pause" }, ...c]); setComposeOpen(false); }} />}
    </div>
  );
}

// ── one echo ─────────────────────────────────────────────────────────────────
function EchoCard({ e, reacted, reported, onReact, onReport }) {
  return (
    <article style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 16, padding: "18px 18px 14px", marginBottom: 14 }}>
      {e.sister && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 9px", borderRadius: 999, background: `${T.gold}1F`, marginBottom: 11 }}>
          <span style={{ width: 5, height: 5, borderRadius: 999, background: T.gold }} />
          <span style={{ fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: 1.1, textTransform: "uppercase", color: T.gold }}>Your phase</span>
        </div>
      )}
      <Hand size={25} carve style={{ marginBottom: 12 }}>{e.body}</Hand>
      <Rule c={T.paperDeep} mb={11} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <ReactBtn icon={HeartHandshake} label="Held" count={e.held} on={reacted.held} onClick={() => onReact(e.id, "held")} />
        <ReactBtn icon={Users} label="Me too" count={e.metoo} on={reacted.metoo} onClick={() => onReact(e.id, "metoo")} />
        <div style={{ flex: 1 }} />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 11, color: T.muted }}>
          <Clock size={12} /> fades in {e.fadeH}h
        </span>
        <button onClick={() => onReport(e.id)} disabled={reported} title="Report" style={{ background: "none", border: "none", cursor: reported ? "default" : "pointer", color: reported ? T.paperDeep : T.muted, padding: 4, display: "inline-flex" }}>
          <Flag size={13} />
        </button>
      </div>
    </article>
  );
}

function ReactBtn({ icon: Icon, label, count, on, onClick }) {
  return (
    <button onClick={onClick} disabled={on} style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 11px", borderRadius: 999,
      background: on ? `${T.gold}22` : "transparent", border: `1px solid ${on ? T.gold : T.paperDeep}`,
      color: on ? T.gold : T.inkSoft, fontFamily: UI, fontSize: 12, fontWeight: 600,
      cursor: on ? "default" : "pointer",
    }}>
      <Icon size={14} /> {label} <span style={{ color: on ? T.gold : T.muted, fontWeight: 700 }}>{count}</span>
    </button>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "44px 24px", border: `1px solid ${T.paperDeep}`, borderRadius: 16, marginBottom: 14, background: T.paperHi }}>
      <Script size={34} carve>Quiet, for now</Script>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.inkSoft, marginTop: 10, lineHeight: 1.55 }}>
        No echoes in this window yet. If something is true for you tonight, you can leave
        the first — from your Journal.
      </p>
    </div>
  );
}

// ── Share-as-Echo flow (Jess scrub → crisis intercept → cooling notice) ──────
function ShareAsEcho({ onClose, onShare }) {
  const [raw, setRaw] = useState("");
  const [stage, setStage] = useState("write");   // write · scrubbed · crisis
  const [scrubbed, setScrubbed] = useState("");
  const [removed, setRemoved] = useState([]);

  const offer = () => {
    const lc = raw.toLowerCase();
    if (CRISIS.some((p) => lc.includes(p))) { setStage("crisis"); return; }
    // demo scrub: strip a name + a weekday + collapse to one line ≤ 180
    const rem = [];
    let line = raw.replace(/\b(on )?(mon|tues|wednes|thurs|fri|satur|sun)day\b/gi, (m) => { rem.push(`weekday "${m.trim()}"`); return ""; });
    line = line.replace(/\b([A-Z][a-z]{2,})\b/g, (m) => { if (["The", "I", "My", "It", "She", "He", "We"].includes(m)) return m; rem.push(`name "${m}"`); return "someone"; });
    line = line.replace(/\s+/g, " ").trim().slice(0, 180);
    setScrubbed(line || raw.slice(0, 180)); setRemoved(rem); setStage("scrubbed");
  };

  return (
    <Sheet onClose={onClose}>
      {stage === "crisis" ? (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
            <ShieldAlert size={20} color={T.crimson} />
            <Eyebrow color={T.crimson}>This one isn't for the wall</Eyebrow>
          </div>
          <Script size={30} carve>You deserve more than a sister can hold.</Script>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: T.inkSoft, margin: "10px 0 16px", lineHeight: 1.55 }}>
            Not less. More. A peer isn't the right shape for tonight — this stays with you,
            nothing is sent.
          </p>
          {[["Samaritans", "116 123"], ["NHS", "111"], ["Shout", "text 85258"], ["Mind", "0300 123 3393"]].map(([n, v]) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", border: `1px solid ${T.paperDeep}`, borderRadius: 12, marginBottom: 8, background: T.paperHi }}>
              <Phone size={15} color={T.gold} />
              <span style={{ fontFamily: UI, fontSize: 13, color: T.ink, fontWeight: 600 }}>{n}</span>
              <div style={{ flex: 1 }} />
              <span style={{ fontFamily: UI, fontSize: 13, color: T.inkSoft }}>{v}</span>
            </div>
          ))}
          <button onClick={onClose} style={{ ...pillBtn(true), width: "100%", justifyContent: "center", marginTop: 8 }}>Keep it private</button>
        </div>
      ) : stage === "scrubbed" ? (
        <div>
          <Eyebrow mb={10} color={T.muted}>Jess offers a line</Eyebrow>
          <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 13, padding: "16px 16px" }}>
            <Hand size={24} carve>{scrubbed}</Hand>
          </div>
          {removed.length > 0 && (
            <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, marginTop: 9, lineHeight: 1.5 }}>
              Removed before it can leave your device: {removed.join(" · ")}.
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 13, fontFamily: UI, fontSize: 11.5, color: T.inkSoft }}>
            <Clock size={13} color={T.gold} /> A 10-minute cooling pause before it goes live. You can pull it back any time before then.
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button onClick={() => setStage("write")} style={{ ...pillBtn(false), flex: 1, justifyContent: "center" }}>Edit first</button>
            <button onClick={() => onShare(scrubbed)} style={{ ...pillBtn(true), flex: 1, justifyContent: "center" }}><Check size={14} /> It's held</button>
          </div>
        </div>
      ) : (
        <div>
          <Eyebrow mb={10} color={T.muted}>Share a line as an echo</Eyebrow>
          <Script size={30} carve>What is one true line?</Script>
          <textarea value={raw} onChange={(e) => setRaw(e.target.value)} rows={3} placeholder="Write it as you would in your Journal — Jess scrubs anything identifying before it ever leaves your device."
            style={{ width: "100%", marginTop: 12, padding: "12px 13px", borderRadius: 12, border: `1px solid ${T.paperDeep}`, background: T.paperHi, fontFamily: SERIF, fontSize: 15, color: T.ink, resize: "none", boxSizing: "border-box", outline: "none" }} />
          <button onClick={offer} disabled={!raw.trim()} style={{ ...pillBtn(true), width: "100%", justifyContent: "center", marginTop: 12, opacity: raw.trim() ? 1 : 0.4 }}>
            Let Jess offer a line
          </button>
        </div>
      )}
    </Sheet>
  );
}

// ── shared bits ──────────────────────────────────────────────────────────────
function Sheet({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(20,16,11,0.42)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...PAPER_BG, width: "100%", maxWidth: 560, borderRadius: "20px 20px 0 0", padding: "20px 20px 30px", maxHeight: "86vh", overflowY: "auto", boxShadow: "0 -8px 40px rgba(20,16,11,0.25)" }}>
        <InkFilter />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, padding: 2 }}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DemoBanner({ label }) {
  return (
    <div style={{ background: T.ink, color: T.paper, padding: "8px 16px", textAlign: "center", fontFamily: UI, fontSize: 10, letterSpacing: 2, fontWeight: 700, textTransform: "uppercase" }}>
      {label}
    </div>
  );
}

const pillBtn = (solid) => ({
  display: "inline-flex", alignItems: "center", gap: 7,
  padding: "9px 15px", borderRadius: 999, cursor: "pointer",
  fontFamily: UI, fontSize: 12.5, fontWeight: 700, letterSpacing: 0.3,
  background: solid ? T.ink : "transparent", color: solid ? T.paper : T.inkSoft,
  border: `1px solid ${solid ? T.ink : T.paperDeep}`,
});
const miniToggle = {
  background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 999,
  padding: "6px 13px", fontFamily: UI, fontSize: 11, color: T.muted, cursor: "pointer", letterSpacing: 0.3,
};
