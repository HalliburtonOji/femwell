// JournalDemo1 — "Editorial" v2 (the chosen direction)
// Cream textured-paper feel, an elegant script hand for the journal's VOICE
// (phase word, Jess's lines, quotes) over humanist serif for reading, and a
// single small imperfect red heart as the only colour pop — matching Halli's
// reference (IMG_9854: handmade paper, fine script, one red heart).
// Brand-pure: no emoji, Lucide + custom SVG only. Demo-only mock data.
import { useState, useEffect } from "react";
import { Lock, Moon, ArrowRight, ChevronRight, Feather } from "lucide-react";

// ── palette (brand cream + espresso; one restrained crimson for the heart) ──
const T = {
  paper:    "#E8E3D5",   // cool matte stationery cream (reference paper)
  paperHi:  "#F1ECDD",   // insets / cards
  paperDeep:"#D6CDBA",   // deckle / hairline wash
  ink:      "#15110C",   // near-true-black ink (reference handwriting)
  inkSoft:  "#463E33",
  muted:    "#8C8273",
  gold:     "#B89A55",   // muted hairline accent only
  crimson:  "#C0322B",   // THE heart — the single colour pop
  blush:    "#E8B4B8", sage: "#8FAF8F",
};
const SCRIPT = '"Allura","Pinyon Script",cursive';        // the journal's voice — pointed-pen hand
const SERIF  = '"Cormorant Garamond","Fraunces",Georgia,serif'; // reading
const UI     = '"Inter",system-ui,sans-serif';            // chrome

const MOCK = {
  phase: "Luteal", season: "Inner Autumn", cycleDay: 26, date: "Wednesday, 3 June",
  prompts: [
    "The editing phase. What can you let go of — and what genuinely matters?",
    "What is a quieter no you have been avoiding saying?",
    "What does the discerning part of you already know about today?",
  ],
  jessLine: "On cycle day 26 last month you wrote about feeling invisible. It is day 26 again — and you sound steadier.",
  weekLine: "You have written on 4 of the last 7 evenings. Your luteal entries lean honest.",
  community: "Five women in late luteal wrote one line each tonight.",
  mirror: { text: "I felt invisible at the meeting. Like I had to make myself larger just to be heard. I am tired of it.", when: "Last cycle · Day 26" },
  tonight: "Before the day closes — name one thing today asked of you, and one thing you gave it.",
  sealed: { count: 2, next: "opens at your next follicular" },
  entries: [
    { id: 1, type: "Reflection", body: "Today I noticed I keep editing myself before I speak. I do not think anyone asked me to.", date: "Today · 9:42", drop: true },
    { id: 2, type: "Work",       body: "The deadline shifted again. I am not sure how to plan around this much uncertainty.", date: "Yesterday" },
    { id: 3, type: "Burn",       body: "Things I am not allowed to say out loud — even to myself.", date: "2 days ago · burns in 4h", burn: true },
    { id: 4, type: "Joy",        body: "The coffee this morning. The exact angle of the sunlight on the table.", date: "3 days ago" },
    { id: 5, type: "Gratitude",  body: "Mum called for no reason. Just to say hello.", date: "4 days ago" },
  ],
};

const TYPE_COLOUR = {
  Reflection: "#8FAF8F", Work: "#5C7A7A", Joy: "#5EA05E", Gratitude: "#C2A24A",
  Burn: "#C0322B", Mood: "#E8B4B8", Relationships: "#C4556B", Money: "#8B6914",
  Creative: "#C4892A", Grief: "#9B8B7A", Identity: "#6B4FA0", "Free write": "#33291C",
};
const ENTRY_TYPES = ["Free write","Reflection","Gratitude","Mood","Work","Relationships","Money","Creative","Grief","Joy","Identity","Affirmation"];
const TYPE_PROMPTS = {
  "Free write": "Write freely.",
  Reflection: "What went well? What would you do differently?",
  Gratitude: "Name three things you are genuinely grateful for today.",
  Mood: "How are you actually feeling — not the edited version?",
  Work: "What is the real state of work right now?",
  Relationships: "Who is on your mind?",
  Money: "What is your relationship with money this month?",
  Creative: "What did you make, imagine or notice?",
  Grief: "You do not have to explain. Just say what is true.",
  Joy: "Name one small actual thing that felt good.",
  Identity: "Who are you becoming?",
  Affirmation: "Write the sentence you most need to believe today.",
};

// ── the heart — hand-drawn, imperfect, one tiny highlight + a small splash ──
function Heart({ size = 18, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "inline-block", verticalAlign: "middle", ...style }} aria-hidden>
      <path d="M12 20.3C7 16.6 3.6 13.8 3.6 9.7 3.6 7.2 5.5 5.4 7.9 5.4c1.6 0 3.1.9 3.9 2.3.2.3.6.3.8 0 .8-1.4 2.3-2.3 3.9-2.3 2.4 0 4.3 1.8 4.3 4.3 0 4.1-3.4 6.9-8.4 10.6-.2.1-.4.1-.6 0Z"
        fill={T.crimson} transform="rotate(-6 12 12)" />
      <circle cx="9.2" cy="9.4" r="1.5" fill="#fff" opacity="0.85" />
      <circle cx="6.6" cy="14.3" r="0.9" fill={T.crimson} opacity="0.55" />
    </svg>
  );
}

// ── layered handmade-paper: cloud mottle (large) + fibre grain (fine) + vignette + sheen ──
// Stacked SVG-noise layers give real tonal depth + paper fibre, not a flat CSS fill.
const MOTTLE = "data:image/svg+xml;utf8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="700" height="700"><filter id="c"><feTurbulence type="fractalNoise" baseFrequency="0.010" numOctaves="4" seed="11" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 0.40  0 0 0 0 0.37  0 0 0 0 0.31  0 0 0 1 0"/></filter><rect width="100%" height="100%" filter="url(#c)" opacity="0.24"/></svg>'
);
const FIBRE = "data:image/svg+xml;utf8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="f"><feTurbulence type="fractalNoise" baseFrequency="0.5 0.9" numOctaves="2" seed="4" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 0.30  0 0 0 0 0.27  0 0 0 0 0.22  0 0 0 1 0"/></filter><rect width="100%" height="100%" filter="url(#f)" opacity="0.07"/></svg>'
);
function Paper() {
  return (
    <div aria-hidden style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
      backgroundColor: T.paper,
      backgroundImage:
        `radial-gradient(150% 95% at 50% -5%, rgba(252,250,243,0.70) 0%, rgba(252,250,243,0) 55%),` +  // soft top sheen
        `radial-gradient(125% 110% at 50% 50%, rgba(0,0,0,0) 52%, rgba(48,40,28,0.28) 100%),` +         // edge vignette (card-on-dark)
        `url("${FIBRE}"),` +                                                                             // fine fibre grain
        `url("${MOTTLE}")`,                                                                              // large soft cloud mottle
      backgroundSize: "auto, auto, 160px 160px, 700px 700px",
      backgroundRepeat: "no-repeat, no-repeat, repeat, repeat",
    }} />
  );
}

// ── small typographic helpers ──────────────────────────────────────────────
function Eyebrow({ children, mb = 0, color = T.muted }) {
  return <div style={{ fontFamily: UI, fontSize: 10.5, color, letterSpacing: 1.8, fontWeight: 600, textTransform: "uppercase", marginBottom: mb }}>{children}</div>;
}
function Rule({ w = "100%", c = T.paperDeep, mt = 0, mb = 0 }) {
  return <div style={{ width: w, height: 1, background: c, marginTop: mt, marginBottom: mb }} />;
}
function Script({ children, size = 40, color = T.ink, style }) {
  // Script faces (Allura/Pinyon) are 400-weight only — never faux-bold them.
  return <span style={{ fontFamily: SCRIPT, fontWeight: 400, fontSize: size, lineHeight: 1.2, color, ...style }}>{children}</span>;
}

// ── Masthead — the issue title ─────────────────────────────────────────────
function Masthead({ onWrite }) {
  return (
    <header style={{ marginBottom: 44 }}>
      <Eyebrow mb={10}>The Journal · A publication of one</Eyebrow>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
        <Script size={68}>{MOCK.phase}</Script>
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 22, color: T.muted }}>{MOCK.season}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
        <Rule w={28} c={T.gold} />
        <span style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, letterSpacing: 1.2 }}>
          DAY {MOCK.cycleDay} · {MOCK.date.toUpperCase()}
        </span>
        <Heart size={15} style={{ marginLeft: 2 }} />
      </div>
      <button onClick={onWrite} style={{
        marginTop: 22, display: "inline-flex", alignItems: "center", gap: 8,
        background: "transparent", border: "none", cursor: "pointer", padding: 0,
        fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: T.ink,
        borderBottom: `1px solid ${T.gold}`, paddingBottom: 3,
      }}>
        <Feather size={15} /> Begin a new entry
      </button>
    </header>
  );
}

// ── Jess's note — the day's invitation, in script ──────────────────────────
function JessNote({ onWrite }) {
  const [i, setI] = useState(0);
  const p = MOCK.prompts[i % MOCK.prompts.length];
  return (
    <section style={{ marginBottom: 46 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Heart size={14} />
        <Eyebrow>A note from Jess · Luteal · Day {MOCK.cycleDay}</Eyebrow>
      </div>
      <Script size={34} style={{ display: "block", letterSpacing: 0.2 }}>{p}</Script>
      <div style={{ display: "flex", gap: 26, marginTop: 18, alignItems: "center" }}>
        <button onClick={() => onWrite(p)} style={{
          display: "inline-flex", alignItems: "center", gap: 6, background: "transparent",
          border: "none", cursor: "pointer", padding: 0, paddingBottom: 3,
          fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: T.ink, borderBottom: `1px solid ${T.gold}`,
        }}>Write to this <ArrowRight size={14} /></button>
        <button onClick={() => setI(x => x + 1)} style={{
          background: "transparent", border: "none", cursor: "pointer", padding: 0,
          fontFamily: UI, fontSize: 12.5, color: T.muted, letterSpacing: 0.4,
        }}>Another prompt</button>
      </div>
    </section>
  );
}

// ── On This Day — Cycle Mirror (your own past words) ───────────────────────
function Mirror({ onReply }) {
  return (
    <section style={{ position: "relative", marginBottom: 46, background: T.paperHi, borderRadius: 3,
      padding: "30px 30px 26px", boxShadow: "0 1px 2px rgba(51,41,28,0.06), 0 0 0 1px rgba(51,41,28,0.05)" }}>
      <div aria-hidden style={{ position: "absolute", top: 2, left: 16, fontFamily: SERIF, fontSize: 110, color: T.gold, opacity: 0.16, lineHeight: 1, fontWeight: 600 }}>&ldquo;</div>
      <Eyebrow mb={8}>On this day · {MOCK.mirror.when}</Eyebrow>
      <Rule w={28} c={T.gold} mb={14} />
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 22, color: T.ink, lineHeight: 1.55, margin: "0 0 18px", position: "relative" }}>{MOCK.mirror.text}</p>
      <button onClick={onReply} style={{
        display: "inline-flex", alignItems: "center", gap: 6, background: "transparent",
        border: "none", cursor: "pointer", padding: 0, paddingBottom: 3,
        fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: T.ink, borderBottom: `1px solid ${T.gold}`,
      }}>Reply to who you were <ArrowRight size={13} /></button>
    </section>
  );
}

// ── A line from the week — insight teaser → opens Insights ─────────────────
function InsightTeaser({ onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "flex", alignItems: "center", gap: 16, width: "100%", textAlign: "left",
      cursor: "pointer", background: "transparent", border: "none", borderTop: `1px solid ${T.paperDeep}`,
      borderBottom: `1px solid ${T.paperDeep}`, padding: "18px 2px", marginBottom: 46,
    }}>
      <div style={{ width: 2, alignSelf: "stretch", background: T.gold }} />
      <p style={{ flex: 1, fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: T.inkSoft, margin: 0, lineHeight: 1.45 }}>{MOCK.weekLine}</p>
      <span style={{ fontFamily: UI, fontSize: 11, color: T.muted, letterSpacing: 1, display: "inline-flex", alignItems: "center", gap: 4 }}>INSIGHTS <ChevronRight size={13} /></span>
    </button>
  );
}

// ── The Ledger — entries as an editorial table of contents ─────────────────
function Ledger({ onTap }) {
  return (
    <section style={{ marginBottom: 46 }}>
      <Eyebrow mb={16}>The ledger · Recent entries</Eyebrow>
      {MOCK.entries.map((e, idx) => {
        const colour = e.burn ? T.crimson : (TYPE_COLOUR[e.type] || T.ink);
        const label = e.burn ? "Burn" : e.type;
        return (
          <article key={e.id} onClick={() => onTap(e)} style={{
            display: "flex", gap: 16, cursor: "pointer", padding: "18px 0",
            borderTop: idx === 0 ? "none" : `1px solid ${T.paperDeep}`,
          }}>
            <div style={{ width: 3, alignSelf: "stretch", background: colour, borderRadius: 2, opacity: 0.8 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: UI, fontSize: 10, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: colour }}>{label}</span>
                {e.burn && <Moon size={11} style={{ color: T.crimson }} />}
                <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, letterSpacing: 0.4, marginLeft: "auto" }}>{e.date}</span>
              </div>
              <p style={{ fontFamily: SERIF, fontSize: 19, color: T.ink, lineHeight: 1.5, margin: 0 }}>
                {e.drop ? <span style={{ float: "left", fontFamily: SERIF, fontSize: 52, lineHeight: 0.82, fontWeight: 600, color: T.gold, margin: "4px 10px 0 0" }}>{e.body.charAt(0)}</span> : null}
                {e.drop ? e.body.slice(1) : e.body}
              </p>
            </div>
          </article>
        );
      })}
    </section>
  );
}

// ── Tonight's Reflection — the dusk close-out ──────────────────────────────
function Tonight({ onWrite }) {
  return (
    <section style={{ marginBottom: 44, background: "linear-gradient(135deg, #2B2230 0%, #3A2C30 100%)", borderRadius: 3, padding: "28px 30px 26px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Moon size={14} style={{ color: T.blush }} />
        <Eyebrow color="#C9B8B0">Tonight's reflection · 90 seconds</Eyebrow>
      </div>
      <Script size={30} color="#F4E9DE" style={{ display: "block" }}>{MOCK.tonight}</Script>
      <button onClick={() => onWrite(MOCK.tonight)} style={{
        marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6, background: "transparent",
        border: "none", cursor: "pointer", padding: 0, paddingBottom: 3,
        fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: "#F4E9DE", borderBottom: "1px solid rgba(244,233,222,0.5)",
      }}>Close the day <ArrowRight size={13} /></button>
    </section>
  );
}

// ── Sealed Letters — locked vault teaser ───────────────────────────────────
function SealedLetters() {
  return (
    <section style={{ marginBottom: 30, display: "flex", gap: 16, alignItems: "center",
      background: T.paperHi, borderRadius: 3, padding: "22px 24px",
      boxShadow: "0 0 0 1px rgba(51,41,28,0.05)" }}>
      <div style={{ width: 42, height: 42, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#EFE3C9", border: `1px solid ${T.gold}` }}>
        <Lock size={18} style={{ color: T.gold }} />
      </div>
      <div style={{ flex: 1 }}>
        <Eyebrow mb={4}>Sealed letters · {MOCK.sealed.count} waiting</Eyebrow>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: T.ink, margin: 0, lineHeight: 1.4 }}>A letter to who you'll be — {MOCK.sealed.next}. Not even Jess can open it early.</p>
      </div>
      <ChevronRight size={18} style={{ color: T.muted }} />
    </section>
  );
}

// ── Echo Wall — honest "coming" teaser (Q2) ────────────────────────────────
function EchoComing() {
  return (
    <section style={{ marginBottom: 40, textAlign: "center" }}>
      <Eyebrow mb={6}>Echo wall · Coming</Eyebrow>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: T.muted, margin: 0, lineHeight: 1.5 }}>{MOCK.community} <span style={{ color: T.inkSoft }}>One day you'll be able to leave one too — anonymous, held, never replied to.</span></p>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ textAlign: "center", paddingTop: 8 }}>
      <Rule w={40} c={T.paperDeep} mb={14} />
      <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: UI, fontSize: 11, color: T.muted, letterSpacing: 0.8 }}>
        <Lock size={12} /> Locked to you. Always.
      </div>
    </footer>
  );
}

// ── Composer (full-screen) ─────────────────────────────────────────────────
function Composer({ open, onClose, seed }) {
  const [type, setType] = useState("Reflection");
  const [text, setText] = useState("");
  if (!open) return null;
  const prompt = seed || TYPE_PROMPTS[type] || MOCK.prompts[0];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 90, background: T.paper, padding: "30px 28px 40px", overflowY: "auto" }}>
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Eyebrow>A new entry</Eyebrow>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: UI, fontSize: 13, color: T.muted }}>Close</button>
        </div>
        <Script size={46} style={{ display: "block", marginBottom: 22 }}>{type}</Script>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          {ENTRY_TYPES.map((t) => (
            <button key={t} onClick={() => setType(t)} style={{
              background: "transparent", border: "none", cursor: "pointer", padding: 0, paddingBottom: 2,
              fontFamily: UI, fontSize: 12.5, letterSpacing: 0.4,
              color: t === type ? T.ink : T.muted, fontWeight: t === type ? 700 : 400,
              borderBottom: t === type ? `1px solid ${T.gold}` : "none",
            }}>{t}</button>
          ))}
        </div>
        <div style={{ paddingLeft: 16, borderLeft: `1px solid ${T.gold}`, marginBottom: 22 }}>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 19, color: T.inkSoft, margin: 0, lineHeight: 1.5 }}>{prompt}</p>
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Begin…" style={{
          width: "100%", minHeight: 300, background: T.paperHi, border: "none", padding: "20px 22px", borderRadius: 3,
          resize: "none", fontFamily: SERIF, fontSize: 21, lineHeight: 1.6, color: T.ink, outline: "none",
          boxShadow: "0 0 0 1px rgba(51,41,28,0.05)",
        }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 26 }}>
          <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${T.gold}`, padding: "11px 26px", cursor: "pointer", fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: T.ink, borderRadius: 3 }}>Save entry</button>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: "none", cursor: "pointer", padding: 0, fontFamily: UI, fontSize: 12.5, color: T.crimson, letterSpacing: 0.4 }}><Moon size={13} /> Burn this entry</button>
        </div>
      </div>
    </div>
  );
}

// ── Entry reader — page is the screen ──────────────────────────────────────
function Reader({ entry, onClose }) {
  if (!entry) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(51,41,28,0.42)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 22px" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: T.paperHi, width: "100%", maxWidth: 580, padding: "36px 34px", borderRadius: 3, boxShadow: "0 8px 40px rgba(51,41,28,0.20)" }}>
        <Eyebrow mb={10} color={entry.burn ? T.crimson : T.muted}>{entry.burn ? "Burn" : entry.type}</Eyebrow>
        <Rule w={28} c={T.gold} mb={18} />
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 22, color: T.ink, lineHeight: 1.62, margin: "0 0 16px", whiteSpace: "pre-wrap" }}>{entry.body}</p>
        <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, letterSpacing: 0.5 }}>{entry.date}</div>
      </div>
    </div>
  );
}

// ── Insights expanded ──────────────────────────────────────────────────────
function Insights({ open, onClose }) {
  if (!open) return null;
  const wrote = [1,3,5,12,14,17,21,23,24,26];
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(51,41,28,0.42)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 22px" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: T.paperHi, width: "100%", maxWidth: 580, padding: "38px 34px 34px", borderRadius: 3, boxShadow: "0 8px 40px rgba(51,41,28,0.20)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}><Heart size={14} /><Eyebrow>From Jess</Eyebrow></div>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 24, color: T.ink, lineHeight: 1.45, margin: "0 0 24px" }}>{MOCK.jessLine}</p>
        <Eyebrow mb={10}>This cycle · {wrote.length} entries</Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 7 }}>
          {Array.from({ length: 28 }).map((_, i) => {
            const d = i + 1, on = wrote.includes(d);
            return <div key={d} style={{ aspectRatio: "1", borderRadius: "50%", background: on ? T.ink : "transparent", border: `1px solid ${on ? T.ink : T.paperDeep}`, fontFamily: UI, fontSize: 9, color: on ? T.paper : T.muted, display: "flex", alignItems: "center", justifyContent: "center" }}>{d}</div>;
          })}
        </div>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: T.muted, lineHeight: 1.5, margin: "20px 0 0" }}>{MOCK.community}</p>
      </div>
    </div>
  );
}

// ── page ───────────────────────────────────────────────────────────────────
export default function JournalDemo1() {
  const [composer, setComposer] = useState(false);
  const [seed, setSeed] = useState("");
  const [detail, setDetail] = useState(null);
  const [ins, setIns] = useState(false);
  const open = (p = "") => { setSeed(p); setComposer(true); };

  // Load the script + serif faces for the journal voice (demo-only injection).
  useEffect(() => {
    const id = "journal-editorial-fonts";
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.id = id; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Allura&family=Pinyon+Script&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Inter:wght@400;600;700&display=swap";
    document.head.appendChild(l);
  }, []);

  return (
    <div style={{ position: "relative", minHeight: "100vh", paddingBottom: 90 }}>
      <Paper />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto", padding: "56px 30px 24px" }}>
        <Masthead onWrite={() => open()} />
        <JessNote onWrite={(p) => open(p)} />
        <Mirror onReply={() => open("Reflecting on what I wrote a cycle ago…\n\n")} />
        <InsightTeaser onOpen={() => setIns(true)} />
        <Ledger onTap={(e) => setDetail(e)} />
        <Tonight onWrite={(p) => open(p)} />
        <SealedLetters />
        <EchoComing />
        <Footer />
      </div>
      <Composer open={composer} onClose={() => setComposer(false)} seed={seed} />
      <Reader entry={detail} onClose={() => setDetail(null)} />
      <Insights open={ins} onClose={() => setIns(false)} />
    </div>
  );
}
