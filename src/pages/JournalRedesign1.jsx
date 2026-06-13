// JournalRedesign1 — "The Daily Hub" REDESIGN PREVIEW of the Journal page.
// ─────────────────────────────────────────────────────────────────────────────
// Borrows the richer, calmer component language from the new Nutrition demos —
// the NutritionDemo2 "Daily Hub" spine (one hero, ONE primary action, a quiet
// spoke grid, bottom-sheet spokes) and NutritionDemo1's card-slider peek — and
// brings it to Journal WITHOUT touching Journal's locked identity:
//   · the carved/letterpress masthead heading look (Script + InkFilter carve)
//   · Ephesis (SCRIPT) + Cormorant (HAND/SERIF) + system UI for tiny chrome only
//   · the cream / ink / gold / crimson editorial palette (T tokens ONLY)
//   · the full feature set — insights, Jess phase prompt, entry-type chooser,
//     entry list, Burn Mode, On This Day, community signal, composer, writing
//     rhythm — and the privacy / crisis framing. No emoji.
//
// The reorganisation cuts overwhelm: today's page (the Jess phase prompt) is the
// ONE primary action; the secondary surfaces become a calm spoke grid that opens
// into bottom sheets; the composer + entry-type chooser are bottom sheets too.
//
// SELF-CONTAINED DEMO — useState/useEffect ONLY. NO base44, NO entities, NO
// network, NO props. Mock data below. Tokens imported from Editorial.
import { useState, useEffect } from "react";
import {
  Feather, X, Lock, Flame, CalendarClock, Sparkles, TrendingUp, Users,
  ChevronRight, BookText, ShieldAlert, Phone, Check, ArrowLeft,
} from "lucide-react";
import {
  T, SERIF, HAND, UI, PAPER_BG,
  Eyebrow, Rule, Script, Hand, Heart, InkFilter, EditorialFooter, useEditorialFonts,
} from "@/components/journal/Editorial";

const COL = 430; // phone-first centred column

// ── MOCK DATA (realistic — feels real on a phone) ────────────────────────────
const ME = { name: "Maya", greeting: "Evening", dateLine: "13 JUNE" };

const PHASE = {
  word: "Luteal",
  cycleDay: 23,
  season: "Inner Autumn",
  line: "Boundaries feel natural now.",
  // Jess's phase-aware prompt — the ONE primary thing the hub asks of her today.
  prompt:
    "Autumn asks you to let something go. What are you ready to set down before the next cycle begins?",
};

const RHYTHM = { count: 6, label: "entries this cycle", spark: [1, 0, 2, 1, 0, 1, 1, 0, 0, 1, 2, 1] };

const ENTRY_TYPES = [
  { id: "free",       label: "Free write",   sub: "A blank page, no shape" },
  { id: "gratitude",  label: "Gratitude",    sub: "Name what held you" },
  { id: "reflection", label: "Reflection",   sub: "Sit with a question" },
  { id: "mood",       label: "Mood",         sub: "How the day sat in you" },
  { id: "grief",      label: "Grief",        sub: "No timeline here" },
  { id: "joy",        label: "Joy",          sub: "Let it be easy" },
];

const ENTRIES = [
  { id: "e1", type: "Reflection",  date: "Yesterday",   pinned: true,
    text: "I keep waiting to feel ready before I rest. Maybe rest is what makes me ready." },
  { id: "e2", type: "Gratitude",   date: "2 days ago",  pinned: false,
    text: "The long walk after the rain. The smell of it. That I let myself take it slowly." },
  { id: "e3", type: "Mood",        date: "3 days ago",  pinned: false,
    text: "Tender and quiet. Not low — just turned inward, the way the light turns this time of month." },
  { id: "e4", type: "Free write",  date: "5 days ago",  pinned: false,
    text: "A list of small things I am no longer carrying for other people. It is longer than I expected." },
];

const ON_THIS_DAY = {
  when: "One year ago, day 22",
  text: "I wrote that I was afraid of slowing down — that if I stopped moving I would have to feel it all. I move slower now. I feel it. It did not break me.",
};

const INSIGHTS = {
  line: "Your luteal pages run quieter and kinder to yourself than your follicular ones.",
  notes: [
    { title: "You write most on day 22–24", body: "The same soft window, cycle after cycle. Your autumn wants a page." },
    { title: "Gratitude rises late-cycle", body: "Half your gratitude entries land in the luteal phase. The inward turn looks for what held you." },
    { title: "Grief gets its own room", body: "When you tag grief, you write longer and return to it. You let it breathe — that is the work." },
  ],
};

const COMMUNITY = {
  line: "Others in your season are writing tonight too — anonymously, whenever you want them.",
  here: "Quiet company, no counts. Step in only if it helps.",
};

const BURN = {
  line: "Some pages aren't meant to be kept. Write it out, watch it go. Nothing is saved, nothing leaves you.",
};

const UK_CRISIS = [
  { name: "Samaritans", detail: "116 123 · free, any time" },
  { name: "Shout", detail: "Text SHOUT to 85258" },
];

const FOOTER_LINE = "A publication of one. Locked to you. Always.";

// ── tiny shared atoms ────────────────────────────────────────────────────────
function Sparkline({ data, color = T.gold }) {
  const w = 300, h = 40, max = Math.max(...data, 1);
  const step = w / (data.length - 1 || 1);
  const pts = data.map((v, i) => [i * step, h - 4 - (v / max) * (h - 8)]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }} aria-hidden>
      <path d={d} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => data[i] > 0 && <circle key={i} cx={p[0]} cy={p[1]} r={2.2} fill={color} />)}
    </svg>
  );
}

function EntryCard({ entry, onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "block", width: "100%", textAlign: "left", cursor: "pointer",
      background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14,
      padding: "13px 15px", marginBottom: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: T.muted }}>
            {entry.type}
          </span>
          {entry.pinned && <Heart size={12} />}
        </span>
        <span style={{ fontFamily: UI, fontSize: 10, color: T.muted, letterSpacing: 0.3 }}>{entry.date}</span>
      </div>
      <Hand size={16} color={T.inkSoft} carve={false} style={{
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {entry.text}
      </Hand>
    </button>
  );
}

// ── the bottom-sheet shell (borrowed from NutritionDemo2's Sheet) ────────────
function Sheet({ title, eyebrow, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{
      position: "absolute", inset: 0, zIndex: 60, display: "flex", flexDirection: "column",
      justifyContent: "flex-end",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(11,8,5,0.42)" }} />
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" style={{
        position: "relative", ...PAPER_BG, backgroundColor: T.paper,
        borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: "88%",
        display: "flex", flexDirection: "column", boxShadow: "0 -18px 50px rgba(11,8,5,0.32)",
        borderTop: `1px solid ${T.paperDeep}`,
      }}>
        {/* dusk header — carries the carved Script title, identity preserved */}
        <div style={{
          background: T.dusk, borderTopLeftRadius: 22, borderTopRightRadius: 22,
          padding: "10px 18px 16px", position: "relative", flexShrink: 0,
        }}>
          <div style={{ width: 40, height: 4, borderRadius: 999, background: "rgba(244,239,227,0.4)", margin: "0 auto 12px" }} />
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              {eyebrow && (
                <div style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 1.6, color: T.wax, textTransform: "uppercase", fontWeight: 700, marginBottom: 3 }}>
                  {eyebrow}
                </div>
              )}
              <Script size={38} color={T.paper} carve={false}>{title}</Script>
            </div>
            <button onClick={onClose} aria-label="Close" style={{
              width: 34, height: 34, borderRadius: 999, flexShrink: 0,
              background: "rgba(244,239,227,0.12)", border: "1px solid rgba(244,239,227,0.3)",
              color: T.paper, display: "grid", placeItems: "center", cursor: "pointer",
            }}><X size={17} /></button>
          </div>
        </div>
        <div style={{ overflowY: "auto", padding: "18px 18px 22px" }}>{children}</div>
        {footer && (
          <div style={{ flexShrink: 0, borderTop: `1px solid ${T.paperDeep}`, padding: "12px 18px", background: T.paper }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// the ONE primary-action button shape
function PrimaryAction({ icon: Icon, children, onClick, tone = "crimson" }) {
  const bg = tone === "crimson" ? T.crimson : T.ink;
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%",
      background: bg, color: T.paper, border: "none", borderRadius: 14, padding: "15px",
      cursor: "pointer",
      boxShadow: tone === "crimson" ? "0 6px 18px rgba(188,46,39,0.22)" : "none",
    }}>
      {Icon && <Icon size={18} />}
      <span style={{ fontFamily: UI, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>
        {children}
      </span>
    </button>
  );
}

// ── COMPOSER body (bottom sheet) ─────────────────────────────────────────────
function ComposerBody({ seedType, seedText }) {
  const [text, setText] = useState(seedText || "");
  const typeLabel = seedType
    ? (ENTRY_TYPES.find((t) => t.id === seedType)?.label || "Free write")
    : "Free write";
  return (
    <div>
      <Eyebrow mb={8}>{typeLabel} · only you will ever read this</Eyebrow>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Begin with a line…"
        rows={7}
        style={{
          width: "100%", resize: "none", background: T.paperHi,
          border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "13px 14px",
          fontFamily: HAND, fontStyle: "italic", fontWeight: 600, fontSize: 18, lineHeight: 1.45,
          color: T.ink, outline: "none",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 10, color: T.muted }}>
        <Lock size={12} />
        <span style={{ fontFamily: UI, fontSize: 10.5, letterSpacing: 0.3 }}>
          Locked to you. Nothing leaves this page unless you choose.
        </span>
      </div>
    </div>
  );
}

// ── ENTRY-TYPE CHOOSER body (bottom sheet) ───────────────────────────────────
function ChooserBody({ onPick }) {
  return (
    <div>
      <Hand size={16} color={T.muted} style={{ marginBottom: 14 }}>
        Pick a shape — or none. The page is yours either way.
      </Hand>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {ENTRY_TYPES.map((t) => (
          <button key={t.id} onClick={() => onPick(t.id)} style={{
            display: "flex", flexDirection: "column", gap: 3, textAlign: "left",
            background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14,
            padding: "14px 14px 13px", cursor: "pointer",
          }}>
            <span style={{ fontFamily: SERIF, fontSize: 18, color: T.ink, lineHeight: 1.1 }}>{t.label}</span>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>{t.sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── spoke bodies ─────────────────────────────────────────────────────────────
function InsightsBody() {
  return (
    <div>
      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: 14, marginBottom: 16 }}>
        <Hand size={18} color={T.ink}>{INSIGHTS.line}</Hand>
      </div>
      {INSIGHTS.notes.map((n, i) => (
        <div key={i} style={{ borderLeft: `2px solid ${T.gold}`, paddingLeft: 12, marginBottom: 14 }}>
          <div style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, lineHeight: 1.2 }}>{n.title}</div>
          <Hand size={15} color={T.muted} style={{ marginTop: 2 }}>{n.body}</Hand>
        </div>
      ))}
    </div>
  );
}

function OnThisDayBody({ onReply }) {
  return (
    <div>
      <Eyebrow mb={8}>{ON_THIS_DAY.when}</Eyebrow>
      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "16px 16px" }}>
        <Hand size={18} color={T.inkSoft}>{ON_THIS_DAY.text}</Hand>
      </div>
      <div style={{ marginTop: 16 }}>
        <PrimaryAction icon={Feather} tone="ink" onClick={onReply}>Reply to who you were</PrimaryAction>
      </div>
    </div>
  );
}

function RhythmBody() {
  return (
    <div>
      <Hand size={16} color={T.muted} style={{ marginBottom: 14 }}>
        Patterns, not scores. A line — never a target to chase.
      </Hand>
      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <Eyebrow mb={10}>This cycle</Eyebrow>
        <Sparkline data={RHYTHM.spark} />
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 12 }}>
          <span style={{ fontFamily: SERIF, fontSize: 26, color: T.ink, fontWeight: 600 }}>{RHYTHM.count}</span>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted }}>{RHYTHM.label}</span>
        </div>
      </div>
      <Hand size={15} color={T.muted}>You return to the page most in your autumn. You{"’"}re building a pattern.</Hand>
    </div>
  );
}

function CommunityBody() {
  return (
    <div>
      <div style={{ background: T.dusk, color: T.paper, borderRadius: 16, padding: "16px 16px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ width: 24, height: 24, borderRadius: 999, background: T.sage, display: "grid", placeItems: "center" }}>
            <Users size={13} color={T.dusk} />
          </span>
          <span style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 1.4, color: T.wax, textTransform: "uppercase", fontWeight: 700 }}>
            Your season
          </span>
        </div>
        <Hand size={18} color={T.paper}>{COMMUNITY.line}</Hand>
      </div>
      <Hand size={15} color={T.muted} style={{ marginBottom: 16 }}>{COMMUNITY.here}</Hand>
      <PrimaryAction icon={Users} tone="ink">Step into Community</PrimaryAction>
    </div>
  );
}

function BurnBody({ onClose }) {
  const [text, setText] = useState("");
  const [burning, setBurning] = useState(false);
  const burn = () => {
    setBurning(true);
    setTimeout(() => { setText(""); setBurning(false); onClose(); }, 1400);
  };
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: T.crimson }}>
        <Flame size={16} />
        <span style={{ fontFamily: UI, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>
          Burn mode
        </span>
      </div>
      <Hand size={16} color={T.muted} style={{ marginBottom: 14 }}>{BURN.line}</Hand>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write it out…"
        rows={6}
        disabled={burning}
        style={{
          width: "100%", resize: "none", background: T.paperHi,
          border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "13px 14px",
          fontFamily: HAND, fontStyle: "italic", fontWeight: 600, fontSize: 18, lineHeight: 1.45,
          color: T.ink, outline: "none", opacity: burning ? 0.35 : 1,
          transition: "opacity 1.2s ease",
        }}
      />
      <div style={{ marginTop: 14 }}>
        <PrimaryAction icon={Flame} onClick={burn}>
          {burning ? "Letting it go…" : "Burn it"}
        </PrimaryAction>
      </div>
    </div>
  );
}

// ── the quiet spoke grid (borrowed from NutritionDemo2's spoke grid) ─────────
const SPOKES = [
  { id: "insights",  label: "Insights",    sub: "The shape of your writing", Icon: Sparkles },
  { id: "onthisday", label: "On This Day", sub: "A page from before",        Icon: CalendarClock },
  { id: "rhythm",    label: "Rhythm",      sub: "Patterns, not scores",      Icon: TrendingUp },
  { id: "community", label: "Community",   sub: "Quiet company in your season", Icon: Users },
  { id: "burn",      label: "Burn Mode",   sub: "Write it out, watch it go", Icon: Flame },
  { id: "chooser",   label: "New Entry",   sub: "Pick a shape, or none",     Icon: BookText },
];

// ── page ─────────────────────────────────────────────────────────────────────
export default function JournalRedesign1() {
  useEditorialFonts();

  // openSheet: null | "composer" | "chooser" | "insights" | "onthisday" |
  //            "rhythm" | "community" | "burn"
  const [openSheet, setOpenSheet] = useState(null);
  const [seedType, setSeedType] = useState(null);
  const [seedText, setSeedText] = useState("");

  const openComposer = (type = null, text = "") => {
    setSeedType(type); setSeedText(text); setOpenSheet("composer");
  };
  const close = () => { setOpenSheet(null); setSeedType(null); setSeedText(""); };

  const sheetTitle = {
    composer:  "today’s page",
    chooser:   "begin",
    insights:  "insights",
    onthisday: "on this day",
    rhythm:    "your rhythm",
    community: "your season",
    burn:      "burn it",
  };
  const sheetEyebrow = {
    composer:  "A publication of one",
    chooser:   "What shape today?",
    insights:  "The shape of your writing",
    onthisday: "A page from before",
    rhythm:    "Patterns, not scores",
    community: "Anonymous · 18+",
    burn:      "Nothing is saved",
  };

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 40 }}>
      <InkFilter />
      <div style={{ maxWidth: COL, margin: "0 auto", position: "relative", overflow: "hidden", minHeight: "100vh" }}>

        {/* mandated top banner */}
        <div style={{ background: T.ink, color: T.paper, fontFamily: UI, fontSize: 10.5, letterSpacing: 0.4, textAlign: "center", padding: "6px 10px" }}>
          Journal · Redesign preview — mock data
        </div>

        <div style={{ padding: "20px 18px 0" }}>

          {/* ── CARVED MASTHEAD (locked identity, preserved) ── */}
          <Eyebrow mb={8}>{ME.greeting}, {ME.name} · A publication of one</Eyebrow>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <Script size={54} style={{ width: "auto" }}>{PHASE.word}</Script>
            <Hand size={26} color={T.inkSoft} style={{ width: "auto" }}>{PHASE.season}</Hand>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
            <Rule w={24} c={T.gold} />
            <span style={{ fontFamily: UI, fontSize: 11, color: T.muted, letterSpacing: 1.2, fontWeight: 600 }}>
              DAY {PHASE.cycleDay} · {ME.dateLine}
            </span>
            <Heart size={14} style={{ marginLeft: 2 }} />
          </div>

          {/* ── THE HERO — Jess's phase prompt as the ONE primary action ── */}
          <div style={{ background: T.dusk, color: T.paper, borderRadius: 18, padding: "18px 18px", marginTop: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
              <span style={{ width: 24, height: 24, borderRadius: 999, background: T.sage, display: "grid", placeItems: "center" }}>
                <Sparkles size={13} color={T.dusk} />
              </span>
              <span style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 1.4, color: T.wax, textTransform: "uppercase", fontWeight: 700 }}>
                Jess · {PHASE.word}, day {PHASE.cycleDay}
              </span>
            </div>
            <Hand size={20} color={T.paper} style={{ marginBottom: 4 }}>{PHASE.prompt}</Hand>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.wax, opacity: 0.85 }}>
              {PHASE.line}
            </div>
          </div>

          {/* the single primary action */}
          <div style={{ marginTop: 14 }}>
            <PrimaryAction icon={Feather} onClick={() => openComposer("reflection", `${PHASE.prompt}\n\n`)}>
              Write today{"’"}s page
            </PrimaryAction>
          </div>

          {/* a quiet secondary opener — the entry-type chooser */}
          <button onClick={() => setOpenSheet("chooser")} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
            background: "transparent", border: "none", borderBottom: `1px solid ${T.paperDeep}`,
            padding: "13px 2px", cursor: "pointer", marginTop: 14,
          }}>
            <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink }}>Begin a different kind of entry</span>
            <ChevronRight size={17} color={T.muted} />
          </button>

          {/* ── RECENT PAGES (progressive: the latest few, not the whole ledger) ── */}
          <div style={{ marginTop: 22, marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
              <Eyebrow>Recent pages</Eyebrow>
              <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>
                {RHYTHM.count} {RHYTHM.label}
              </span>
            </div>
            {ENTRIES.map((e) => (
              <EntryCard key={e.id} entry={e} onOpen={() => openComposer(null, e.text)} />
            ))}
          </div>

          {/* ── THE QUIET SPOKE GRID — everything else, tucked away ── */}
          <Eyebrow mb={10} color={T.muted}><span style={{ display: "inline-block", marginTop: 14 }}>Everything else, tucked away</span></Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {SPOKES.map((sp) => {
              const { Icon } = sp;
              const onClick = sp.id === "chooser" ? () => setOpenSheet("chooser") : () => setOpenSheet(sp.id);
              return (
                <button key={sp.id} onClick={onClick} style={{
                  display: "flex", flexDirection: "column", gap: 8, textAlign: "left",
                  background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14,
                  padding: "14px 14px 13px", cursor: "pointer",
                }}>
                  <span style={{ width: 32, height: 32, borderRadius: 10, background: T.paper, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center" }}>
                    <Icon size={16} color={sp.id === "burn" ? T.crimson : T.ink} />
                  </span>
                  <span>
                    <span style={{ fontFamily: SERIF, fontSize: 18, color: T.ink, display: "block", lineHeight: 1.1 }}>{sp.label}</span>
                    <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>{sp.sub}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── privacy / crisis framing (preserved) ── */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 9, marginTop: 20, padding: "12px 14px", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 12 }}>
            <ShieldAlert size={15} color={T.muted} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <Hand size={14} color={T.muted}>
                If a page gets heavy and you need a person, you are not alone tonight.
              </Hand>
              <div style={{ marginTop: 7, display: "grid", gap: 4 }}>
                {UK_CRISIS.map((c) => (
                  <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <Phone size={11} color={T.crimson} />
                    <span style={{ fontFamily: UI, fontSize: 11, color: T.inkSoft }}>
                      <b style={{ fontWeight: 700 }}>{c.name}</b> · {c.detail}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* footer */}
          <div style={{ marginTop: 26 }}>
            <EditorialFooter />
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted, textAlign: "center", marginTop: 8, paddingBottom: 16 }}>
              {FOOTER_LINE}
            </div>
          </div>
        </div>

        {/* ── BOTTOM SHEETS ── */}
        {openSheet === "composer" && (
          <Sheet
            title={sheetTitle.composer}
            eyebrow={sheetEyebrow.composer}
            onClose={close}
            footer={
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={close} style={{
                  flex: "0 0 auto", display: "inline-flex", alignItems: "center", gap: 6,
                  background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 12,
                  padding: "13px 16px", cursor: "pointer", color: T.muted,
                  fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase",
                }}>
                  <ArrowLeft size={14} /> Back
                </button>
                <div style={{ flex: 1 }}>
                  <PrimaryAction icon={Check} tone="ink" onClick={close}>Save to journal</PrimaryAction>
                </div>
              </div>
            }
          >
            <ComposerBody seedType={seedType} seedText={seedText} />
          </Sheet>
        )}

        {openSheet === "chooser" && (
          <Sheet title={sheetTitle.chooser} eyebrow={sheetEyebrow.chooser} onClose={close}>
            <ChooserBody onPick={(id) => openComposer(id, "")} />
          </Sheet>
        )}

        {openSheet === "insights" && (
          <Sheet title={sheetTitle.insights} eyebrow={sheetEyebrow.insights} onClose={close}>
            <InsightsBody />
          </Sheet>
        )}

        {openSheet === "onthisday" && (
          <Sheet title={sheetTitle.onthisday} eyebrow={sheetEyebrow.onthisday} onClose={close}>
            <OnThisDayBody onReply={() => openComposer("reflection", "Replying to who I was…\n\n")} />
          </Sheet>
        )}

        {openSheet === "rhythm" && (
          <Sheet title={sheetTitle.rhythm} eyebrow={sheetEyebrow.rhythm} onClose={close}>
            <RhythmBody />
          </Sheet>
        )}

        {openSheet === "community" && (
          <Sheet title={sheetTitle.community} eyebrow={sheetEyebrow.community} onClose={close}>
            <CommunityBody />
          </Sheet>
        )}

        {openSheet === "burn" && (
          <Sheet title={sheetTitle.burn} eyebrow={sheetEyebrow.burn} onClose={close}>
            <BurnBody onClose={close} />
          </Sheet>
        )}
      </div>
    </div>
  );
}
