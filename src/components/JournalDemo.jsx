// ─────────────────────────────────────────────────────────────────────────────
// JournalDemo — exceptional FemWell journal page demo for /Ideas.
//
// Two sub-tabs:
//   · Journal  — phase header · phase prompt card (5 prompts, ◀▶) ·
//                On This Day (collapsible) · quick action bar ·
//                writing rhythm badge (cycle-count, not streak) ·
//                entry list (filter chips + 5 mock entries) ·
//                3-step entry creation modal (Guide me · Free write · Quick log)
//   · Insights — cycle stats row · 7-day writing rhythm bars ·
//                28-day mood × phase SVG (the centerpiece) ·
//                phase distribution bars · top themes chips ·
//                locked tier 4 teaser
//
// Design tokens are FemWell brand: cream/paper/espresso/blush/sage/gold/muted.
// No emoji codepoints — all glyphs are Lucide icons.
// Mock data only — this is a demo, not wired to base44.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useEffect } from "react";
import {
  Feather, History, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Sparkles, Pen, Zap, Flame, Mic, X, CheckCircle2, Heart, Lock,
  BookOpen, Sun, Cloud, Moon, BarChart3,
} from "lucide-react";

// ── Tokens ──────────────────────────────────────────────────────────────────
const T = {
  cream:    "#F4EDDB",
  paper:    "#FBF6E6",
  paperHi:  "#F4EFE3",
  espresso: "#3A2C1A",
  plum:     "#4A2A3A",
  plumSoft: "#6B4559",
  plumMute: "#8A7584",
  blush:    "#E8B4B8",
  blushSoft:"rgba(232,180,184,0.22)",
  blushBg:  "rgba(232,180,184,0.30)",
  sage:     "#8FAF8F",
  sageSoft: "rgba(143,175,143,0.20)",
  gold:     "#D4AF37",
  goldDeep: "#A6862B",
  goldSoft: "rgba(212,175,55,0.18)",
  muted:    "#9B8B7A",
  mutedSoft:"rgba(155,139,122,0.18)",
  rose:     "#D45E52",
};

// ── Mock dataset ───────────────────────────────────────────────────────────
const PHASE_INFO = {
  luteal:     { label: "LUTEAL", season: "INNER AUTUMN", tone: T.blush,  text: "A season of release. What are you ready to let go of?", icon: Cloud  },
  follicular: { label: "FOLLICULAR", season: "INNER SPRING", tone: T.sage, text: "A season of beginning. What is asking to grow?", icon: Sun },
  ovulatory:  { label: "OVULATORY", season: "INNER SUMMER", tone: T.gold, text: "A season of connection. Who do you want to reach today?", icon: Sun },
  menstrual:  { label: "MENSTRUAL", season: "INNER WINTER", tone: T.plum, text: "A season of rest. What does your body need from you?", icon: Moon },
};

const LUTEAL_PROMPTS = [
  "What has this cycle taught you so far?",
  "What are you holding on to that feels heavier than it should?",
  "Write a letter to your future follicular self — what do you want her to know?",
  "What boundary would make next week feel lighter?",
  "What is your body asking for right now — honestly?",
];

const ON_THIS_DAY = {
  badge: "Last luteal phase",
  date: "Apr 16 · Luteal Day 11",
  preview: "I've been feeling the pull to slow down but I keep pushing through...",
  full:
    "I've been feeling the pull to slow down but I keep pushing through. There's something here about how I treat myself versus how I'd treat a friend. If a friend told me she felt this tired I'd tell her to rest immediately. Why is it so hard to hear that voice for myself?",
  mood: 3,
};

const ENTRIES = [
  { id: 1, title: "A letter to myself",       kind: "Guided",    phase: "luteal",     mood: 3, date: "Apr 22", preview: "I've been feeling the pull to slow down...",            voice: false },
  { id: 2, title: "Grateful for small things", kind: "Gratitude", phase: "luteal",     mood: 4, date: "Apr 21", preview: "The morning light through the curtains...",            voice: false },
  { id: 3, title: "This week's win",          kind: "Free",      phase: "follicular", mood: 5, date: "Apr 14", preview: "Presented the project. My voice didn't shake...",      voice: false },
  { id: 4, title: "Strange dream",            kind: "Dream",     phase: "ovulatory",  mood: null, date: "Apr 12", preview: "Running through a city I didn't recognise...",         voice: false },
  { id: 5, title: "Morning check",            kind: "Quick",     phase: "luteal",     mood: 2, date: "Apr 22", preview: "Tired. Dull headache. Craving warmth.",                voice: true  },
];

const KIND_TONES = {
  Guided:    T.blush,
  Gratitude: T.gold,
  Free:      T.sage,
  Dream:     T.plum,
  Quick:     T.muted,
};
const PHASE_TONES = {
  luteal:     T.blush,
  follicular: T.sage,
  ovulatory:  T.gold,
  menstrual:  T.plum,
};

// 28-day mood series — synthesized so luteal averages ~2.9, follicular ~4.2
// Day 1 = 28 days ago. Mood is 1-5 (null = no entry that day).
const MOOD_SERIES = [
  // Apr 24 - Apr 30 (menstrual + early follicular)
  { day: 1,  date: "Apr 24", phase: "menstrual",  mood: 2 },
  { day: 2,  date: "Apr 25", phase: "menstrual",  mood: 2 },
  { day: 3,  date: "Apr 26", phase: "menstrual",  mood: null },
  { day: 4,  date: "Apr 27", phase: "menstrual",  mood: 3 },
  { day: 5,  date: "Apr 28", phase: "follicular", mood: 3 },
  { day: 6,  date: "Apr 29", phase: "follicular", mood: 4 },
  { day: 7,  date: "Apr 30", phase: "follicular", mood: null },
  // May 1 - May 7 (follicular)
  { day: 8,  date: "May 1",  phase: "follicular", mood: 4 },
  { day: 9,  date: "May 2",  phase: "follicular", mood: 5 },
  { day: 10, date: "May 3",  phase: "follicular", mood: 4 },
  { day: 11, date: "May 4",  phase: "follicular", mood: null },
  { day: 12, date: "May 5",  phase: "follicular", mood: 5 },
  { day: 13, date: "May 6",  phase: "follicular", mood: 4 },
  { day: 14, date: "May 7",  phase: "ovulatory",  mood: 4 },
  // May 8 - May 14 (ovulatory + early luteal)
  { day: 15, date: "May 8",  phase: "ovulatory",  mood: 5 },
  { day: 16, date: "May 9",  phase: "ovulatory",  mood: 4 },
  { day: 17, date: "May 10", phase: "luteal",     mood: null },
  { day: 18, date: "May 11", phase: "luteal",     mood: 3 },
  { day: 19, date: "May 12", phase: "luteal",     mood: 3 },
  { day: 20, date: "May 13", phase: "luteal",     mood: 3 },
  { day: 21, date: "May 14", phase: "luteal",     mood: 3 },
  // May 15 - May 21 (luteal)
  { day: 22, date: "May 15", phase: "luteal",     mood: null },
  { day: 23, date: "May 16", phase: "luteal",     mood: 3 },
  { day: 24, date: "May 17", phase: "luteal",     mood: 2 },
  { day: 25, date: "May 18", phase: "luteal",     mood: 2 },
  { day: 26, date: "May 19", phase: "luteal",     mood: null },
  { day: 27, date: "May 20", phase: "luteal",     mood: 3 },
  { day: 28, date: "May 21", phase: "luteal",     mood: 3 },
];

// 7-day writing rhythm — Mon → Sun, today = Tuesday in this mock
const WEEKLY_ENTRIES = [
  { day: "Mon", count: 3, today: false },
  { day: "Tue", count: 2, today: true  },
  { day: "Wed", count: 1, today: false },
  { day: "Thu", count: 0, today: false },
  { day: "Fri", count: 1, today: false },
  { day: "Sat", count: 2, today: false },
  { day: "Sun", count: 1, today: false },
];

const PHASE_DISTRIBUTION = [
  { phase: "follicular", pct: 35, tone: T.sage,  label: "Follicular" },
  { phase: "luteal",     pct: 42, tone: T.blush, label: "Luteal" },
  { phase: "ovulatory",  pct: 15, tone: T.gold,  label: "Ovulatory" },
  { phase: "menstrual",  pct: 8,  tone: T.plum,  label: "Menstrual" },
];

const TOP_THEMES = ["energy", "body", "work", "relationships", "rest", "gratitude", "boundaries"];

const FILTER_CHIPS = ["All", "Guided", "Free", "Gratitude", "Dream", "Quick"];

// ─────────────────────────────────────────────────────────────────────────────
// Root component
// ─────────────────────────────────────────────────────────────────────────────
export default function JournalDemo() {
  const [tab, setTab] = useState("journal"); // "journal" | "insights"
  const [modalState, setModalState] = useState(null);
  //   modalState shape: { mode: "guided"|"free"|"quick", step: 1|2|3, prompt?: string }
  function openModal(mode, opts = {}) {
    setModalState({ mode, step: mode === "quick" ? 2 : (opts.skipStep1 ? 2 : 1), prompt: opts.prompt });
  }

  return (
    <div style={shellStyle}>
      <header style={headerStyle}>
        <p style={eyebrowStyle}>DEMO · JOURNAL × CYCLE</p>
        <h1 style={pageTitleStyle}>Journal</h1>
        <p style={subStyle}>Write with the season. Notice the pattern.</p>
        <div style={subTabRowStyle} role="tablist">
          <button role="tab" aria-selected={tab === "journal"} onClick={() => setTab("journal")} style={subTabBtn(tab === "journal")}>
            <Feather size={13} /> Journal
          </button>
          <button role="tab" aria-selected={tab === "insights"} onClick={() => setTab("insights")} style={subTabBtn(tab === "insights")}>
            <BarChart3 size={13} /> Insights
          </button>
        </div>
      </header>

      {tab === "journal" && <JournalView openModal={openModal} />}
      {tab === "insights" && <InsightsView />}

      {modalState && (
        <EntryModal
          mode={modalState.mode}
          step={modalState.step}
          prompt={modalState.prompt}
          onClose={() => setModalState(null)}
          onChooseMode={(m) => setModalState({ mode: m, step: 2 })}
          onSave={() => setModalState((s) => ({ ...s, step: 3 }))}
        />
      )}

      <footer style={footStyle}>
        <span style={footEyebrowStyle}>DEMO · JOURNAL</span>
        <p style={footBodyStyle}>
          A journal that knows what season you're in. Phase prompts that change
          with your cycle. An On-This-Day from your last luteal. Cycle-count
          rhythm — no streaks, no shame. Insights overlay your mood on your
          phase so you can see the pattern in writing.
        </p>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Journal view
// ─────────────────────────────────────────────────────────────────────────────
function JournalView({ openModal }) {
  const phase = "luteal";
  const info = PHASE_INFO[phase];

  return (
    <div style={journalShellStyle}>
      <PhaseHeader info={info} />
      <PhasePromptCard
        prompts={LUTEAL_PROMPTS}
        accent={info.tone}
        onWrite={(p) => openModal("guided", { skipStep1: true, prompt: p })}
      />
      <OnThisDayCard onReply={() => openModal("guided", { skipStep1: true, prompt: `Replying to ${ON_THIS_DAY.date}…` })} />
      <QuickActionBar
        onGuided={() => openModal("guided")}
        onFree={() => openModal("free")}
        onQuick={() => openModal("quick")}
      />
      <RhythmBadge />
      <EntryList />
    </div>
  );
}

function PhaseHeader({ info }) {
  return (
    <div style={phaseHeaderStyle}>
      <span style={{ ...phaseDot, background: info.tone }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={phaseHeaderTopRow}>
          <span style={{ ...phaseLabel, color: info.tone }}>{info.label}</span>
          <span style={phaseDivider}>·</span>
          <span style={phaseSeason}>{info.season}</span>
          <span style={phaseDivider}>·</span>
          <span style={phaseDay}>Day 9 of 12</span>
        </div>
        <p style={phaseLine}>{info.text}</p>
      </div>
    </div>
  );
}

function PhasePromptCard({ prompts, accent, onWrite }) {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(false);

  function go(delta) {
    setFade(true);
    setTimeout(() => {
      setIdx((i) => (i + delta + prompts.length) % prompts.length);
      setFade(false);
    }, 200);
  }

  return (
    <section style={promptCardStyle} aria-label="Phase prompt">
      <div style={promptHeadStyle}>
        <span style={{ ...promptIconStyle, background: T.blushBg }}>
          <Feather size={13} style={{ color: accent }} />
        </span>
        <div>
          <p style={miniKickerStyle}>YOUR LUTEAL PROMPT</p>
          <p style={promptHelperStyle}>5 prompts · luteal phase</p>
        </div>
        <div style={promptNavStyle}>
          <button onClick={() => go(-1)} style={promptArrow} aria-label="Previous prompt">
            <ChevronLeft size={14} />
          </button>
          <button onClick={() => go(1)} style={promptArrow} aria-label="Next prompt">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <p style={{
        ...promptTextStyle,
        opacity: fade ? 0 : 1,
        transition: "opacity 200ms ease",
      }}>
        {prompts[idx]}
      </p>
      <div style={promptDotsStyle}>
        {prompts.map((_, i) => (
          <span key={i} style={{ ...promptDot, background: i === idx ? accent : "rgba(58,44,26,0.16)" }} />
        ))}
      </div>
      <button onClick={() => onWrite(prompts[idx])} style={promptCtaStyle}>
        Write from this prompt
        <ChevronRight size={13} />
      </button>
    </section>
  );
}

function OnThisDayCard({ onReply }) {
  const [open, setOpen] = useState(false);
  return (
    <section style={onThisDayStyle} aria-label="On This Day">
      <button onClick={() => setOpen((v) => !v)} style={onThisDayHeadStyle} aria-expanded={open}>
        <span style={onThisDayIconStyle}>
          <History size={13} style={{ color: T.plumSoft }} />
        </span>
        <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={onThisDayTitleStyle}>On This Day</span>
            <span style={onThisDayBadgeStyle}>{ON_THIS_DAY.badge}</span>
          </div>
          {!open && (
            <p style={onThisDayPreviewStyle}>{ON_THIS_DAY.preview}</p>
          )}
          <p style={onThisDayDateStyle}>{ON_THIS_DAY.date}</p>
        </div>
        {open ? <ChevronUp size={16} style={{ color: T.plumMute }} /> : <ChevronDown size={16} style={{ color: T.plumMute }} />}
      </button>
      {open && (
        <div style={onThisDayBodyStyle}>
          <p style={onThisDayFullStyle}>{ON_THIS_DAY.full}</p>
          <div style={onThisDayFootStyle}>
            <span style={moodChipStyle}>
              <Heart size={11} style={{ color: T.rose }} fill={T.rose} /> Mood: {ON_THIS_DAY.mood}/5
            </span>
            <button onClick={onReply} style={replyBtnStyle}>
              Reply to past self
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function QuickActionBar({ onGuided, onFree, onQuick }) {
  return (
    <div style={quickActionRowStyle} role="toolbar" aria-label="Start an entry">
      <button onClick={onGuided} style={{ ...quickActionBtn, background: T.blushBg, borderColor: T.blush }}>
        <Sparkles size={14} style={{ color: T.plum }} />
        <span style={quickActionLabelStyle}>Guide me</span>
      </button>
      <button onClick={onFree} style={{ ...quickActionBtn, background: T.paperHi, borderColor: "rgba(58,44,26,0.12)" }}>
        <Pen size={14} style={{ color: T.plum }} />
        <span style={quickActionLabelStyle}>Free write</span>
      </button>
      <button onClick={onQuick} style={{ ...quickActionBtn, background: T.sageSoft, borderColor: "rgba(143,175,143,0.5)" }}>
        <Zap size={14} style={{ color: T.plum }} />
        <span style={quickActionLabelStyle}>Quick log</span>
      </button>
    </div>
  );
}

function RhythmBadge() {
  return (
    <div style={rhythmBadgeStyle} role="note">
      <span style={rhythmIconStyle}>
        <Flame size={13} style={{ color: T.goldDeep }} />
      </span>
      <span style={rhythmTextStyle}>
        <b>4 entries this cycle</b> · You're building a pattern
      </span>
    </div>
  );
}

function EntryList() {
  const [filter, setFilter] = useState("All");
  const filtered = useMemo(() => {
    if (filter === "All") return ENTRIES;
    return ENTRIES.filter((e) => e.kind === filter);
  }, [filter]);

  return (
    <section style={entryListShellStyle} aria-label="Entries">
      <div style={entryListHeadStyle}>
        <span style={miniKickerStyle}>YOUR ENTRIES</span>
        <span style={entryListCountStyle}>{filtered.length} of {ENTRIES.length}</span>
      </div>
      <div style={filterChipRow}>
        {FILTER_CHIPS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              ...filterChip,
              background: f === filter ? T.espresso : T.paperHi,
              color: f === filter ? T.cream : T.plumSoft,
              borderColor: f === filter ? T.espresso : "rgba(58,44,26,0.15)",
            }}
          >
            {f}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((e) => {
          const phaseTone = PHASE_TONES[e.phase] || T.muted;
          const kindTone = KIND_TONES[e.kind] || T.muted;
          return (
            <article key={e.id} style={{ ...entryCardStyle, borderLeftColor: phaseTone }}>
              <div style={entryHeadRow}>
                <h4 style={entryTitleStyle}>{e.title}</h4>
                <span style={{ ...entryKindChip, background: `${kindTone}22`, color: kindTone, borderColor: `${kindTone}44` }}>{e.kind}</span>
              </div>
              <div style={entryMetaRow}>
                <span style={entryPhaseChip}>
                  <span style={{ width: 6, height: 6, borderRadius: 9999, background: phaseTone, marginRight: 4 }} />
                  {e.phase[0].toUpperCase() + e.phase.slice(1)}
                </span>
                {e.mood !== null && (
                  <span style={moodChipSm}>
                    <Heart size={9} style={{ color: T.rose }} fill={T.rose} /> {e.mood}/5
                  </span>
                )}
                {e.voice && (
                  <span style={voiceChipStyle}>
                    <Mic size={9} /> voice
                  </span>
                )}
              </div>
              <p style={entryPreviewStyle}>{e.preview}</p>
              <div style={entryFootRow}>
                <span style={entryDateStyle}>{e.date}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry creation modal
// ─────────────────────────────────────────────────────────────────────────────
function EntryModal({ mode, step, prompt, onClose, onChooseMode, onSave }) {
  const [text, setText] = useState("");
  const [mood, setMood] = useState(3);
  const [voice, setVoice] = useState(false);

  // Auto-dismiss step 3 after 1.5s
  useEffect(() => {
    if (step === 3) {
      const t = setTimeout(onClose, 1500);
      return () => clearTimeout(t);
    }
  }, [step, onClose]);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const kindLabel = mode === "quick" ? "Quick" : mode === "guided" ? "Guided" : "Free";
  const kindTone = KIND_TONES[kindLabel];

  return (
    <div role="dialog" aria-modal="true" style={modalBackdropStyle} onClick={onClose}>
      <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
        <style>{`@keyframes fwSlideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } } @keyframes fwSpring { 0% { transform: scale(0.4); opacity: 0; } 60% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); } } @keyframes fwSparkle { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1); opacity: 1; } 100% { transform: scale(0); opacity: 0; } }`}</style>
        <div style={modalHeadStyle}>
          <span style={miniKickerStyle}>{step === 3 ? "SAVED" : "NEW ENTRY"}</span>
          <button onClick={onClose} style={modalCloseStyle} aria-label="Close">
            <X size={14} />
          </button>
        </div>

        {step === 1 && (
          <>
            <h2 style={modalTitleStyle}>How do you want to write?</h2>
            <div style={modalChoiceRowStyle}>
              <button onClick={() => onChooseMode("guided")} style={{ ...modalChoiceCardStyle, background: T.blushBg, borderColor: T.blush }}>
                <span style={{ ...modalChoiceIconStyle, background: T.paperHi }}><Sparkles size={18} style={{ color: T.plum }} /></span>
                <span style={modalChoiceTitleStyle}>Let me guide you</span>
                <span style={modalChoiceSubStyle}>A phase-aware prompt to start</span>
              </button>
              <button onClick={() => onChooseMode("free")} style={{ ...modalChoiceCardStyle, background: T.paperHi, borderColor: "rgba(58,44,26,0.12)" }}>
                <span style={{ ...modalChoiceIconStyle, background: T.cream }}><Pen size={18} style={{ color: T.plum }} /></span>
                <span style={modalChoiceTitleStyle}>Free write</span>
                <span style={modalChoiceSubStyle}>Just a blank page</span>
              </button>
            </div>
            <button onClick={() => onChooseMode("quick")} style={modalLinkStyle}>
              or do a quick log →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={modalTitleStyle}>
              {mode === "guided" && "Write from the prompt"}
              {mode === "free" && "Free write"}
              {mode === "quick" && "Quick log"}
            </h2>

            {mode === "guided" && (
              <div style={modalPromptBoxStyle}>
                <Feather size={13} style={{ color: T.blush, flexShrink: 0, marginTop: 2 }} />
                <p style={modalPromptTextStyle}>{prompt || LUTEAL_PROMPTS[0]}</p>
              </div>
            )}

            {mode === "quick" ? (
              <>
                <p style={miniKickerStyle}>MOOD</p>
                <MoodSlider value={mood} onChange={setMood} />
                <p style={{ ...miniKickerStyle, marginTop: 12 }}>ONE LINE</p>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="What's the headline?"
                  style={modalQuickInputStyle}
                />
              </>
            ) : (
              <>
                <div style={modalTextareaWrapStyle}>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write here — no rules, no judgement."
                    style={modalTextareaStyle}
                    rows={7}
                  />
                  <span style={modalWordCountStyle}>{wordCount} words</span>
                </div>
                <div style={modalToolRowStyle}>
                  <button onClick={() => setVoice((v) => !v)} style={{
                    ...modalToolBtnStyle,
                    background: voice ? T.sageSoft : T.paperHi,
                    borderColor: voice ? T.sage : "rgba(58,44,26,0.15)",
                    color: voice ? T.sage : T.plumSoft,
                  }}>
                    <Mic size={12} /> {voice ? "Recording…" : "Record instead"}
                  </button>
                  <span style={modalPhaseTagStyle}>
                    <span style={{ width: 6, height: 6, borderRadius: 9999, background: T.blush, marginRight: 5 }} />
                    Luteal
                  </span>
                </div>
                <p style={{ ...miniKickerStyle, marginTop: 12 }}>MOOD</p>
                <MoodSlider value={mood} onChange={setMood} />
              </>
            )}

            <div style={modalFootStyle}>
              <button onClick={onClose} style={modalCancelStyle}>Cancel</button>
              <button onClick={onSave} style={modalSaveStyle}>Save entry</button>
            </div>
          </>
        )}

        {step === 3 && (
          <div style={savedWrapStyle}>
            <div style={savedIconWrapStyle}>
              <CheckCircle2 size={42} style={{ color: T.sage, animation: "fwSpring 380ms cubic-bezier(.34,1.56,.64,1) forwards" }} />
              <span style={{ ...savedSparkle, top: -4,  left: -4,  animationDelay: "120ms" }} />
              <span style={{ ...savedSparkle, top: -6,  right: -2, animationDelay: "240ms" }} />
              <span style={{ ...savedSparkle, bottom: 0, right: -6, animationDelay: "180ms" }} />
            </div>
            <h2 style={savedTitleStyle}>Entry saved</h2>
            <div style={savedChipRowStyle}>
              <span style={{ ...entryKindChip, background: `${kindTone}22`, color: kindTone, borderColor: `${kindTone}44` }}>{kindLabel}</span>
              <span style={entryPhaseChip}>
                <span style={{ width: 6, height: 6, borderRadius: 9999, background: T.blush, marginRight: 4 }} />
                Luteal
              </span>
              {mode !== "quick" && (
                <span style={moodChipSm}>
                  <Heart size={9} style={{ color: T.rose }} fill={T.rose} /> {mood}/5
                </span>
              )}
              <span style={savedWordsStyle}>{wordCount} words</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MoodSlider({ value, onChange }) {
  return (
    <div style={moodSliderRow}>
      {[1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          style={moodSliderBtn}
          aria-label={`Mood ${v} of 5`}
        >
          <Heart
            size={22}
            style={{ color: v <= value ? T.blush : "rgba(58,44,26,0.14)", transition: "color 160ms ease" }}
            fill={v <= value ? T.blush : "transparent"}
          />
        </button>
      ))}
      <span style={moodSliderValueStyle}>{value}/5</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Insights view
// ─────────────────────────────────────────────────────────────────────────────
function InsightsView() {
  return (
    <div style={journalShellStyle}>
      <SummaryStats />
      <WeeklyRhythmChart />
      <MoodCorrelationChart />
      <PhaseDistribution />
      <TopThemes />
      <Tier4Teaser />
    </div>
  );
}

function SummaryStats() {
  const stats = [
    { kicker: "TOTAL", value: "12", label: "entries" },
    { kicker: "THIS CYCLE", value: "4", label: "entries" },
    { kicker: "AVG MOOD", value: "3.6", label: "/ 5" },
    { kicker: "RHYTHM", value: "67%", label: "writing" },
  ];
  return (
    <section style={statsRowStyle}>
      {stats.map((s) => (
        <div key={s.kicker} style={statTileStyle}>
          <span style={statKickerStyle}>{s.kicker}</span>
          <div style={statValueRowStyle}>
            <span style={statValueStyle}>{s.value}</span>
            <span style={statLabelStyle}>{s.label}</span>
          </div>
        </div>
      ))}
    </section>
  );
}

function WeeklyRhythmChart() {
  const max = Math.max(...WEEKLY_ENTRIES.map((d) => d.count), 1);
  return (
    <section style={chartCardStyle}>
      <div style={chartHeadStyle}>
        <span style={miniKickerStyle}>7-DAY WRITING RHYTHM</span>
      </div>
      <div style={weeklyBarRowStyle}>
        {WEEKLY_ENTRIES.map((d) => {
          const h = (d.count / max) * 70 + (d.count > 0 ? 8 : 4);
          return (
            <div key={d.day} style={weeklyBarColStyle}>
              <div style={weeklyBarTrackStyle}>
                <span style={{
                  ...weeklyBarStyle,
                  height: h,
                  background: d.today ? T.espresso : T.plumMute,
                }} />
                <span style={weeklyBarCountStyle}>{d.count > 0 ? d.count : ""}</span>
              </div>
              <span style={{ ...weeklyDayStyle, color: d.today ? T.espresso : T.plumMute, fontWeight: d.today ? 700 : 500 }}>{d.day}</span>
            </div>
          );
        })}
      </div>
      <p style={chartCaptionStyle}>
        You write most on <b>Mondays and Tuesdays</b> — your follicular surge carries into the week.
      </p>
    </section>
  );
}

function MoodCorrelationChart() {
  // Layout
  const W = 600, H = 200, PADX = 28, PADY = 22;
  const innerW = W - PADX * 2, innerH = H - PADY * 2;
  const n = MOOD_SERIES.length;
  const stepX = innerW / (n - 1);
  const y = (m) => PADY + innerH - ((m - 1) / 4) * innerH;
  const x = (i) => PADX + i * stepX;

  // Build phase bands (consecutive same-phase runs)
  const bands = useMemo(() => {
    const out = [];
    let start = 0;
    for (let i = 1; i <= n; i++) {
      if (i === n || MOOD_SERIES[i].phase !== MOOD_SERIES[start].phase) {
        out.push({ start, end: i - 1, phase: MOOD_SERIES[start].phase });
        start = i;
      }
    }
    return out;
  }, [n]);

  // Build polyline only across non-null points (gap-aware)
  const points = MOOD_SERIES.map((d, i) => (d.mood == null ? null : [x(i), y(d.mood)]));
  // Split into segments where mood is non-null
  const segments = [];
  let seg = [];
  points.forEach((p) => {
    if (p) seg.push(p);
    else { if (seg.length > 1) segments.push(seg); seg = []; }
  });
  if (seg.length > 1) segments.push(seg);

  const PHASE_BG = {
    menstrual: "rgba(74,42,58,0.10)",
    follicular: "rgba(143,175,143,0.18)",
    ovulatory:  "rgba(212,175,55,0.18)",
    luteal:     "rgba(232,180,184,0.22)",
  };

  return (
    <section style={chartCardStyle}>
      <div style={chartHeadStyle}>
        <span style={miniKickerStyle}>28-DAY MOOD × PHASE</span>
      </div>
      <div style={{ width: "100%", overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ display: "block", minWidth: 460 }}
          role="img"
          aria-label="Mood score over 28 days with phase bands"
        >
          {/* Phase bands */}
          {bands.map((b, i) => {
            const bx = x(b.start) - stepX / 2;
            const bw = (b.end - b.start + 1) * stepX;
            return (
              <rect
                key={i}
                x={bx}
                y={PADY - 6}
                width={bw}
                height={innerH + 12}
                fill={PHASE_BG[b.phase]}
                rx={4}
              />
            );
          })}
          {/* Y gridlines (mood 1..5) */}
          {[1, 2, 3, 4, 5].map((m) => (
            <g key={m}>
              <line x1={PADX} x2={W - PADX} y1={y(m)} y2={y(m)} stroke="rgba(58,44,26,0.08)" strokeDasharray="2 4" />
              <text x={PADX - 4} y={y(m) + 3} fontSize="9" fill={T.plumMute} textAnchor="end" fontFamily="'Inter', sans-serif" fontWeight="600">{m}</text>
            </g>
          ))}
          {/* Mood polylines */}
          {segments.map((s, i) => (
            <polyline
              key={i}
              fill="none"
              stroke={T.espresso}
              strokeWidth="1.6"
              points={s.map(([px, py]) => `${px},${py}`).join(" ")}
            />
          ))}
          {/* Mood dots */}
          {MOOD_SERIES.map((d, i) => d.mood != null && (
            <circle key={i} cx={x(i)} cy={y(d.mood)} r="3.2" fill={T.cream} stroke={T.espresso} strokeWidth="1.4" />
          ))}
          {/* X labels — sparse: every 7 days */}
          {MOOD_SERIES.map((d, i) => (i % 7 === 0 || i === n - 1) && (
            <text key={i} x={x(i)} y={H - 4} fontSize="9" fill={T.plumMute} textAnchor="middle" fontFamily="'Inter', sans-serif" fontWeight="600">{d.date}</text>
          ))}
        </svg>
      </div>
      <div style={chartLegendRowStyle}>
        <span style={legendChip}><span style={{ ...legendDot, background: T.blush }} /> luteal</span>
        <span style={legendChip}><span style={{ ...legendDot, background: T.sage }} /> follicular</span>
        <span style={legendChip}><span style={{ ...legendDot, background: T.gold }} /> ovulatory</span>
        <span style={legendChip}><span style={{ ...legendDot, background: T.plum }} /> menstrual</span>
      </div>
      <p style={chartCaptionStyle}>
        Your mood in writing tracks your phase — <b>0.8 correlation</b>. Luteal entries
        average 2.9/5, follicular 4.2/5.
      </p>
    </section>
  );
}

function PhaseDistribution() {
  const max = Math.max(...PHASE_DISTRIBUTION.map((p) => p.pct), 1);
  return (
    <section style={chartCardStyle}>
      <div style={chartHeadStyle}>
        <span style={miniKickerStyle}>PHASE DISTRIBUTION</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {PHASE_DISTRIBUTION.map((p) => (
          <div key={p.phase} style={distributionRowStyle}>
            <span style={distributionLabelStyle}>{p.label}</span>
            <div style={distributionBarOuterStyle}>
              <span style={{
                ...distributionBarInnerStyle,
                width: `${(p.pct / max) * 100}%`,
                background: p.tone,
              }} />
            </div>
            <span style={distributionPctStyle}>{p.pct}%</span>
          </div>
        ))}
      </div>
      <p style={chartCaptionStyle}>
        You write most in <b>luteal</b> — processing your cycle.
      </p>
    </section>
  );
}

function TopThemes() {
  return (
    <section style={chartCardStyle}>
      <div style={chartHeadStyle}>
        <span style={miniKickerStyle}>TOP THEMES</span>
      </div>
      <div style={themeChipRowStyle}>
        {TOP_THEMES.map((t) => (
          <span key={t} style={themeChipStyle}>{t}</span>
        ))}
      </div>
      <button style={jessLinkStyle}>
        Jess has noticed some patterns. Ask her about them
        <ChevronRight size={13} />
      </button>
    </section>
  );
}

function Tier4Teaser() {
  return (
    <section style={teaserCardStyle} aria-label="Coming soon">
      <span style={teaserLockStyle}>
        <Lock size={13} style={{ color: T.muted }} />
      </span>
      <div style={{ flex: 1 }}>
        <p style={teaserTitleStyle}>Symptom × journal correlation</p>
        <p style={teaserSubStyle}>Coming after 3 cycles · See how your symptoms connect to your writing mood</p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const shellStyle = {
  background: T.cream, minHeight: "100vh",
  padding: "26px 14px 40px",
  fontFamily: "'Inter', system-ui, sans-serif",
};
const headerStyle = {
  maxWidth: 640, margin: "0 auto 16px",
  display: "flex", flexDirection: "column", gap: 4,
};
const eyebrowStyle = {
  fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
  color: T.muted, fontWeight: 700, margin: 0,
};
const pageTitleStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 36, fontWeight: 500, color: T.espresso,
  letterSpacing: "-0.02em", margin: "4px 0 4px", lineHeight: 1.05,
};
const subStyle = {
  fontSize: 13, color: T.plumSoft, margin: 0, lineHeight: 1.5,
};
const subTabRowStyle = {
  display: "inline-flex", gap: 4, padding: 4,
  borderRadius: 9999, background: T.paperHi,
  border: "1px solid rgba(58,44,26,0.08)",
  marginTop: 12, alignSelf: "flex-start",
};
function subTabBtn(active) {
  return {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "6px 14px", borderRadius: 9999,
    background: active ? T.espresso : "transparent",
    color: active ? T.cream : T.plumSoft,
    border: "none",
    fontFamily: "'Inter', sans-serif",
    fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
    cursor: "pointer",
  };
}

const journalShellStyle = {
  maxWidth: 640, margin: "0 auto",
  display: "flex", flexDirection: "column", gap: 12,
};

const phaseHeaderStyle = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "10px 14px", borderRadius: 14,
  background: T.paperHi,
  border: "1px solid rgba(58,44,26,0.08)",
};
const phaseDot = {
  width: 10, height: 10, borderRadius: 9999, flexShrink: 0,
};
const phaseHeaderTopRow = {
  display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap",
};
const phaseLabel = {
  fontSize: 10, letterSpacing: "0.18em", fontWeight: 700,
};
const phaseDivider = { color: T.muted, fontSize: 11 };
const phaseSeason = {
  fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic",
  fontSize: 13, fontWeight: 500, color: T.plum,
};
const phaseDay = {
  fontSize: 11, color: T.plumMute, fontWeight: 600,
};
const phaseLine = {
  fontFamily: "Cormorant Garamond, Georgia, serif", fontStyle: "italic",
  fontSize: 12, color: T.plumSoft, margin: "2px 0 0", lineHeight: 1.4,
};

// Phase prompt card
const promptCardStyle = {
  padding: "16px 16px 14px",
  borderRadius: 16,
  background: T.blushSoft,
  border: `1px solid ${T.blush}66`,
};
const promptHeadStyle = {
  display: "flex", alignItems: "center", gap: 8,
};
const promptIconStyle = {
  width: 30, height: 30, borderRadius: 10,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
};
const miniKickerStyle = {
  fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
  color: T.muted, fontWeight: 700, margin: 0,
};
const promptHelperStyle = {
  fontSize: 10, color: T.plumMute, margin: "1px 0 0",
  fontStyle: "italic",
};
const promptNavStyle = {
  marginLeft: "auto",
  display: "inline-flex", gap: 4,
};
const promptArrow = {
  width: 26, height: 26, borderRadius: 9999,
  background: T.paperHi, border: "1px solid rgba(58,44,26,0.12)",
  color: T.plumSoft, display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", padding: 0,
};
const promptTextStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 20, fontWeight: 500, color: T.plum,
  letterSpacing: "-0.005em",
  margin: "12px 0 8px", lineHeight: 1.35,
  minHeight: 56,
};
const promptDotsStyle = {
  display: "flex", gap: 4, justifyContent: "center", marginBottom: 10,
};
const promptDot = {
  width: 5, height: 5, borderRadius: 9999,
};
const promptCtaStyle = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "8px 14px", borderRadius: 9999,
  background: T.espresso, color: T.cream,
  border: "none",
  fontFamily: "'Inter', sans-serif",
  fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
  cursor: "pointer",
};

// On This Day
const onThisDayStyle = {
  borderRadius: 14,
  background: T.paperHi,
  border: "1px solid rgba(58,44,26,0.10)",
  overflow: "hidden",
};
const onThisDayHeadStyle = {
  width: "100%",
  display: "flex", alignItems: "flex-start", gap: 10,
  padding: "12px 14px",
  background: "transparent",
  border: "none", cursor: "pointer",
  fontFamily: "inherit",
};
const onThisDayIconStyle = {
  width: 26, height: 26, borderRadius: 9,
  background: T.cream,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const onThisDayTitleStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 14, fontWeight: 500, color: T.plum,
};
const onThisDayBadgeStyle = {
  fontSize: 9, fontWeight: 700, letterSpacing: "0.14em",
  color: T.plumSoft, background: T.cream,
  padding: "2px 6px", borderRadius: 9999,
  border: "1px solid rgba(58,44,26,0.10)",
};
const onThisDayPreviewStyle = {
  fontSize: 12, color: T.plumSoft, margin: "4px 0 0",
  lineHeight: 1.4,
  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
};
const onThisDayDateStyle = {
  fontSize: 10, color: T.plumMute, margin: "4px 0 0",
  fontStyle: "italic",
};
const onThisDayBodyStyle = {
  padding: "10px 14px 14px 50px",
  borderTop: "1px solid rgba(58,44,26,0.06)",
  background: T.cream,
};
const onThisDayFullStyle = {
  fontSize: 13, color: T.plum, lineHeight: 1.55, margin: 0,
  fontFamily: "Cormorant Garamond, Georgia, serif",
};
const onThisDayFootStyle = {
  display: "flex", alignItems: "center", gap: 8,
  marginTop: 8, flexWrap: "wrap",
};
const moodChipStyle = {
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "4px 8px", borderRadius: 9999,
  background: T.paperHi, border: "1px solid rgba(58,44,26,0.10)",
  fontSize: 11, color: T.plum, fontWeight: 700,
};
const replyBtnStyle = {
  marginLeft: "auto",
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "5px 12px", borderRadius: 9999,
  background: "transparent", color: T.plum,
  border: `1px solid ${T.blush}`,
  fontFamily: "'Inter', sans-serif",
  fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
  cursor: "pointer",
};

// Quick action bar
const quickActionRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 8,
};
const quickActionBtn = {
  display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
  padding: "12px 6px", borderRadius: 12,
  border: "1px solid",
  cursor: "pointer",
  fontFamily: "inherit",
};
const quickActionLabelStyle = {
  fontSize: 12, fontWeight: 700, color: T.plum, letterSpacing: "0.02em",
};

// Rhythm badge
const rhythmBadgeStyle = {
  display: "inline-flex", alignItems: "center", gap: 8,
  padding: "8px 12px", borderRadius: 9999,
  background: T.goldSoft, border: `1px solid ${T.gold}55`,
  alignSelf: "flex-start",
};
const rhythmIconStyle = {
  width: 22, height: 22, borderRadius: 9999,
  background: T.paperHi,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const rhythmTextStyle = {
  fontSize: 12, color: T.plum, fontFamily: "'Inter', sans-serif",
};

// Entry list
const entryListShellStyle = {
  display: "flex", flexDirection: "column", gap: 10,
};
const entryListHeadStyle = {
  display: "flex", alignItems: "baseline", justifyContent: "space-between",
};
const entryListCountStyle = {
  fontSize: 11, color: T.plumMute, fontStyle: "italic",
};
const filterChipRow = {
  display: "flex", gap: 6, flexWrap: "wrap",
};
const filterChip = {
  padding: "5px 11px", borderRadius: 9999,
  background: T.paperHi, color: T.plumSoft,
  border: "1px solid rgba(58,44,26,0.15)",
  fontFamily: "'Inter', sans-serif",
  fontSize: 11, fontWeight: 700, letterSpacing: "0.02em",
  cursor: "pointer",
};
const entryCardStyle = {
  display: "flex", flexDirection: "column", gap: 4,
  padding: "10px 14px 10px 12px",
  borderRadius: 12,
  background: T.paperHi,
  border: "1px solid rgba(58,44,26,0.08)",
  borderLeft: "3px solid",
};
const entryHeadRow = {
  display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8,
};
const entryTitleStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 14, fontWeight: 500, color: T.plum,
  margin: 0, lineHeight: 1.2,
};
const entryKindChip = {
  fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
  padding: "2px 7px", borderRadius: 9999,
  border: "1px solid",
};
const entryMetaRow = {
  display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap",
};
const entryPhaseChip = {
  display: "inline-flex", alignItems: "center",
  fontSize: 10, color: T.plumSoft, fontWeight: 600,
  padding: "2px 7px", borderRadius: 9999,
  background: T.cream, border: "1px solid rgba(58,44,26,0.10)",
};
const moodChipSm = {
  display: "inline-flex", alignItems: "center", gap: 3,
  fontSize: 10, fontWeight: 700, color: T.plum,
  padding: "2px 6px", borderRadius: 9999,
  background: T.cream, border: "1px solid rgba(58,44,26,0.10)",
};
const voiceChipStyle = {
  display: "inline-flex", alignItems: "center", gap: 3,
  fontSize: 9, fontWeight: 700, color: T.sage,
  padding: "2px 6px", borderRadius: 9999,
  background: T.sageSoft, border: `1px solid ${T.sage}55`,
};
const entryPreviewStyle = {
  fontSize: 12, color: T.plumSoft, lineHeight: 1.4, margin: 0,
  fontFamily: "Cormorant Garamond, Georgia, serif",
};
const entryFootRow = {
  display: "flex", justifyContent: "flex-end",
};
const entryDateStyle = {
  fontSize: 10, color: T.plumMute, fontStyle: "italic",
};

// Modal
const modalBackdropStyle = {
  position: "fixed", inset: 0,
  background: "rgba(58,44,26,0.40)",
  zIndex: 80,
  display: "flex", alignItems: "flex-end", justifyContent: "center",
  padding: "0 0 max(16px, env(safe-area-inset-bottom))",
};
const modalCardStyle = {
  width: "100%", maxWidth: 560,
  background: T.cream,
  borderRadius: "22px 22px 0 0",
  padding: "16px 18px 22px",
  fontFamily: "'Inter', system-ui, sans-serif",
  boxShadow: "0 -8px 32px rgba(58,44,26,0.18)",
  maxHeight: "85vh", overflowY: "auto",
  animation: "fwSlideUp 280ms cubic-bezier(.16,1,.3,1) both",
};
const modalHeadStyle = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  marginBottom: 4,
};
const modalCloseStyle = {
  width: 28, height: 28, borderRadius: 9999,
  background: T.paperHi, border: "1px solid rgba(58,44,26,0.15)",
  color: T.plumMute,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer",
};
const modalTitleStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 22, fontWeight: 500, color: T.plum,
  letterSpacing: "-0.01em", margin: "4px 0 14px", lineHeight: 1.25,
};
const modalChoiceRowStyle = {
  display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
  marginBottom: 14,
};
const modalChoiceCardStyle = {
  display: "flex", flexDirection: "column", alignItems: "flex-start",
  gap: 6, padding: 14, borderRadius: 14,
  border: "1.5px solid",
  cursor: "pointer", textAlign: "left", fontFamily: "inherit",
};
const modalChoiceIconStyle = {
  width: 36, height: 36, borderRadius: 12,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
};
const modalChoiceTitleStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 16, fontWeight: 500, color: T.plum,
};
const modalChoiceSubStyle = {
  fontSize: 11, color: T.plumMute, lineHeight: 1.4,
};
const modalLinkStyle = {
  background: "transparent", border: "none",
  fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.plumMute,
  cursor: "pointer", textDecoration: "underline",
};
const modalPromptBoxStyle = {
  display: "flex", gap: 8,
  padding: "10px 12px", borderRadius: 12,
  background: T.blushBg, border: `1px solid ${T.blush}66`,
  marginBottom: 10,
};
const modalPromptTextStyle = {
  fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic",
  fontSize: 14, color: T.plum, margin: 0, lineHeight: 1.45,
};
const modalTextareaWrapStyle = {
  position: "relative", marginBottom: 6,
};
const modalTextareaStyle = {
  width: "100%", padding: "10px 12px 22px",
  borderRadius: 12, background: T.paperHi,
  border: "1px solid rgba(58,44,26,0.15)",
  fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 14,
  color: T.plum, lineHeight: 1.55,
  outline: "none", resize: "vertical",
  boxSizing: "border-box",
};
const modalWordCountStyle = {
  position: "absolute", bottom: 6, right: 10,
  fontSize: 10, color: T.plumMute, fontStyle: "italic",
};
const modalToolRowStyle = {
  display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap",
};
const modalToolBtnStyle = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "5px 10px", borderRadius: 9999,
  border: "1px solid",
  fontFamily: "'Inter', sans-serif",
  fontSize: 11, fontWeight: 700, cursor: "pointer",
};
const modalPhaseTagStyle = {
  marginLeft: "auto",
  display: "inline-flex", alignItems: "center",
  padding: "4px 9px", borderRadius: 9999,
  background: T.blushBg, border: `1px solid ${T.blush}55`,
  fontSize: 10.5, fontWeight: 700, color: T.plum,
};
const modalQuickInputStyle = {
  width: "100%", padding: "10px 12px",
  borderRadius: 12, background: T.paperHi,
  border: "1px solid rgba(58,44,26,0.15)",
  fontFamily: "'Inter', sans-serif", fontSize: 13,
  color: T.plum, outline: "none",
  boxSizing: "border-box",
};
const modalFootStyle = {
  display: "flex", justifyContent: "flex-end", gap: 8,
  marginTop: 16,
};
const modalCancelStyle = {
  padding: "9px 14px", borderRadius: 9999,
  background: "transparent", color: T.plumSoft,
  border: "1px solid rgba(58,44,26,0.18)",
  fontFamily: "'Inter', sans-serif",
  fontSize: 12, fontWeight: 700, letterSpacing: "0.02em",
  cursor: "pointer",
};
const modalSaveStyle = {
  padding: "9px 18px", borderRadius: 9999,
  background: T.espresso, color: T.cream,
  border: "1px solid " + T.espresso,
  fontFamily: "'Inter', sans-serif",
  fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
  cursor: "pointer",
};

const moodSliderRow = {
  display: "flex", alignItems: "center", gap: 8,
  marginTop: 4,
};
const moodSliderBtn = {
  background: "transparent", border: "none", padding: 2,
  cursor: "pointer",
};
const moodSliderValueStyle = {
  marginLeft: "auto",
  fontSize: 12, fontWeight: 700, color: T.plum,
};

// Saved state
const savedWrapStyle = {
  display: "flex", flexDirection: "column", alignItems: "center",
  gap: 10, padding: "20px 0",
};
const savedIconWrapStyle = {
  position: "relative", width: 50, height: 50,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
};
const savedSparkle = {
  position: "absolute", width: 6, height: 6, borderRadius: 9999,
  background: T.gold,
  animation: "fwSparkle 1200ms ease-out infinite",
};
const savedTitleStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 20, fontWeight: 500, color: T.plum,
  margin: 0,
};
const savedChipRowStyle = {
  display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center",
};
const savedWordsStyle = {
  fontSize: 11, color: T.plumMute, alignSelf: "center",
};

// Insights — stats row
const statsRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 8,
};
const statTileStyle = {
  padding: "10px 12px", borderRadius: 12,
  background: T.paperHi, border: "1px solid rgba(58,44,26,0.08)",
  display: "flex", flexDirection: "column", gap: 4,
};
const statKickerStyle = {
  fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase",
  color: T.muted, fontWeight: 700,
};
const statValueRowStyle = {
  display: "flex", alignItems: "baseline", gap: 3,
};
const statValueStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 22, fontWeight: 500, color: T.espresso,
  lineHeight: 1,
};
const statLabelStyle = {
  fontSize: 11, color: T.plumMute, fontStyle: "italic",
};

// Insights — chart card
const chartCardStyle = {
  padding: "14px 16px", borderRadius: 14,
  background: T.paperHi, border: "1px solid rgba(58,44,26,0.08)",
  display: "flex", flexDirection: "column", gap: 10,
};
const chartHeadStyle = {
  display: "flex", alignItems: "baseline",
};
const chartCaptionStyle = {
  fontFamily: "Cormorant Garamond, Georgia, serif", fontStyle: "italic",
  fontSize: 12, color: T.plumSoft, margin: 0, lineHeight: 1.5,
};

// 7-day rhythm
const weeklyBarRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: 8, alignItems: "end",
};
const weeklyBarColStyle = {
  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
};
const weeklyBarTrackStyle = {
  position: "relative",
  width: "100%", height: 80,
  background: T.cream, borderRadius: 6,
  display: "flex", alignItems: "flex-end", justifyContent: "center",
};
const weeklyBarStyle = {
  width: "70%", borderRadius: "4px 4px 2px 2px",
  display: "block",
};
const weeklyBarCountStyle = {
  position: "absolute", top: 4, left: 0, right: 0, textAlign: "center",
  fontSize: 10, fontWeight: 700, color: T.plumSoft,
};
const weeklyDayStyle = {
  fontSize: 10, letterSpacing: "0.06em",
};

// Mood × phase chart legend
const chartLegendRowStyle = {
  display: "flex", gap: 10, flexWrap: "wrap",
};
const legendChip = {
  display: "inline-flex", alignItems: "center", gap: 4,
  fontSize: 10, color: T.plumSoft, fontWeight: 600,
};
const legendDot = {
  width: 8, height: 8, borderRadius: 9999, display: "inline-block",
};

// Phase distribution
const distributionRowStyle = {
  display: "grid",
  gridTemplateColumns: "70px 1fr 40px",
  alignItems: "center", gap: 8,
};
const distributionLabelStyle = {
  fontSize: 11, color: T.plum, fontWeight: 600,
};
const distributionBarOuterStyle = {
  height: 10, borderRadius: 9999,
  background: "rgba(58,44,26,0.06)", overflow: "hidden",
};
const distributionBarInnerStyle = {
  height: "100%", borderRadius: 9999, display: "block",
};
const distributionPctStyle = {
  fontSize: 11, fontWeight: 700, color: T.plumSoft, textAlign: "right",
};

// Top themes
const themeChipRowStyle = {
  display: "flex", flexWrap: "wrap", gap: 6,
};
const themeChipStyle = {
  display: "inline-flex", alignItems: "center",
  padding: "5px 11px", borderRadius: 9999,
  background: T.cream, border: "1px solid rgba(58,44,26,0.12)",
  fontSize: 11, color: T.plum, fontWeight: 600,
};
const jessLinkStyle = {
  alignSelf: "flex-start",
  display: "inline-flex", alignItems: "center", gap: 4,
  background: "transparent", border: "none",
  color: T.plum, fontWeight: 700, fontSize: 12,
  cursor: "pointer", padding: "4px 0",
};

// Tier 4 teaser
const teaserCardStyle = {
  display: "flex", alignItems: "center", gap: 12,
  padding: "12px 14px", borderRadius: 14,
  background: "repeating-linear-gradient(45deg, rgba(58,44,26,0.04), rgba(58,44,26,0.04) 8px, rgba(58,44,26,0.07) 8px, rgba(58,44,26,0.07) 16px)",
  border: "1px dashed rgba(58,44,26,0.20)",
  opacity: 0.78,
};
const teaserLockStyle = {
  width: 28, height: 28, borderRadius: 9,
  background: T.paperHi, border: "1px solid rgba(58,44,26,0.12)",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
};
const teaserTitleStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 14, fontWeight: 500, color: T.plum,
  margin: 0, lineHeight: 1.2,
};
const teaserSubStyle = {
  fontSize: 11, color: T.plumMute, margin: "2px 0 0",
  fontStyle: "italic", lineHeight: 1.4,
};

// Foot
const footStyle = {
  maxWidth: 640, margin: "20px auto 0",
  padding: "12px 14px", borderRadius: 12,
  background: "rgba(58,44,26,0.06)",
  textAlign: "center",
};
const footEyebrowStyle = {
  fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
  color: T.muted, fontWeight: 700,
};
const footBodyStyle = {
  fontSize: 11, color: T.plumSoft, margin: "6px 0 0", lineHeight: 1.55,
};
