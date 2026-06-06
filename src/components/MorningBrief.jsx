// ─────────────────────────────────────────────────────────────────────────────
// MorningBrief — Concept 3 demo for /Ideas.
//
// The planner as conversation, not form. Jess walks the user through a
// structured morning planning session, one card at a time. Each card slides
// up like a message arriving. Total ~90 seconds. An evening "shutdown
// ritual" is the bookend.
//
// 7 morning cards (0 greeting → 6 completion summary) + 4 evening cards
// (reflection → unfinished → tomorrow anchor → shutdown checklist).
//
// Warmest of the three concepts — uses the default cream day-mode FemWell
// aesthetic with white cards and gentle motion. Jess's "voice" runs in
// blush. No emoji codepoints — Lucide icons only.
//
// Cross-page rules (visible inside the cards):
//   · Sleep / mood / energy log straight to the same daily check-in as
//     Today (not duplicated)
//   · Anchors come from existing PlannerItems where isAnchor=true
//   · "See the Biorhythm view" tab-switches inside /Ideas via the
//     onSwitchToBiorhythm prop (passed by Ideas.jsx)
//   · "Open full planner" links to the real /Planner — not the demo
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo } from "react";
import {
  Sun, Moon, Sparkles, Star, CheckCircle2, Anchor, Pin, Plus,
  ArrowRight, ChevronRight, RotateCcw, Heart, Zap, X, Activity,
  Pill, Briefcase, Dumbbell, Sunrise, Sunset, Waves, Leaf, Coffee,
} from "lucide-react";

// ── Tokens ──────────────────────────────────────────────────────────────────
const T = {
  cream:    "#F4EDDB",
  paper:    "#F4EFE3",
  espresso: "#3A2C1A",
  espressoSoft: "rgba(58,44,26,0.10)",
  plum:     "#4A2A3A",
  blush:    "#E8B4B8",
  blushSoft:"rgba(232,180,184,0.18)",
  sage:     "#8FAF8F",
  sageSoft: "rgba(143,175,143,0.20)",
  gold:     "#D4AF37",
  goldSoft: "rgba(212,175,55,0.18)",
  muted:    "#9B8B7A",
  rose:     "#D45E52",
};

// ── Mock data ───────────────────────────────────────────────────────────────
const PHASE = { name: "LUTEAL", day: 25, capacity: 42, tomorrowDay: 26, tomorrowCap: 38 };

const SLEEP_OPTS = [
  { val: "<5h", label: "< 5h",  sub: "Short"  },
  { val: "6h",  label: "6h",    sub: "Light"  },
  { val: "7h",  label: "7h",    sub: "Decent" },
  { val: "8h",  label: "8h",    sub: "Full"   },
  { val: "9h+", label: "9h +",  sub: "Long"   },
];

const ANCHOR_INIT = [
  { id: 1, title: "Folic acid 400 mcg",  type: "medication" },
  { id: 2, title: "Morning stretch",     type: "habit"      },
  { id: 3, title: "Magnesium tonight",   type: "medication" },
];

const RHYTHM = [
  { block: "MORNING",   range: "6 – 12",  Icon: Sunrise, tone: T.sage,   note: "Anchors + habits", items: ["Folic acid 400 mcg", "Morning stretch (15 min)", "Lunch + walk"] },
  { block: "AFTERNOON", range: "12 – 17", Icon: Sun,     tone: T.gold,   note: "Lighter work, walk, nourish", items: ["Slow admin block (45 min)", "Tulsi tea ritual (10 min)", "Afternoon walk (20 min)"] },
  { block: "EVENING",   range: "17 – 22", Icon: Sunset,  tone: T.blush,  note: "Wind-down, tonight ritual, meds", items: ["Magnesium glycinate", "Shutdown ritual", "Lights low by 21:00"] },
];

const UNFINISHED_INIT = [
  { id: 100, title: "Reply to Sarah",   type: "task" },
  { id: 101, title: "Q3 planning notes", type: "task" },
];

const SHUTDOWN_ITEMS = [
  { id: "tabs",    title: "Close all open tabs"      },
  { id: "anchor",  title: "Write tomorrow's anchor"   },
  { id: "stretch", title: "Stretch — three minutes"  },
  { id: "water",   title: "Glass of water by the bed" },
];

const TYPE_ICON = { medication: Pill, habit: Activity, task: Briefcase, ritual: Sparkles, session: Dumbbell };

// ── Typewriter (word-by-word) ───────────────────────────────────────────────
function Typewriter({ text, speed = 60, onDone }) {
  const words = useMemo(() => text.split(" "), [text]);
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    if (visible >= words.length) { onDone && onDone(); return; }
    const t = setTimeout(() => setVisible(v => v + 1), speed);
    return () => clearTimeout(t);
  }, [visible, words.length, speed, onDone]);
  return (
    <span>
      {words.slice(0, visible).join(" ")}
      {visible < words.length && <span style={cursor}>&nbsp;</span>}
    </span>
  );
}

// ── Confetti (CSS-only particles) ───────────────────────────────────────────
function Confetti() {
  // 28 particles with deterministic-ish random values
  const pcs = useMemo(() => {
    const colours = [T.blush, T.gold, T.sage];
    return Array.from({ length: 28 }).map((_, i) => {
      const colour = colours[i % colours.length];
      const startX = 40 + (i * 13) % 280;            // px from card-left
      const endX   = startX + ((i * 37) % 120) - 60; // drift left/right
      const delay  = (i % 10) * 60;                  // ms
      const size   = 6 + ((i * 7) % 6);              // 6–12 px
      const dur    = 1100 + ((i * 53) % 600);        // 1.1–1.7s
      const rot    = (i * 17) % 360;
      const shape  = (i % 3 === 0) ? "9999px" : "2px";
      return { colour, startX, endX, delay, size, dur, rot, shape };
    });
  }, []);
  return (
    <div style={confettiWrap} aria-hidden="true">
      {pcs.map((p, i) => (
        <span key={i}
              style={{
                position: "absolute",
                left: p.startX,
                bottom: 0,
                width: p.size,
                height: p.size,
                background: p.colour,
                borderRadius: p.shape,
                opacity: 0,
                "--fwEndX": `${p.endX - p.startX}px`,
                animation: `fwConfetti ${p.dur}ms ease-out ${p.delay}ms forwards`,
                transform: `rotate(${p.rot}deg)`,
              }} />
      ))}
    </div>
  );
}

// ── Step dots ───────────────────────────────────────────────────────────────
function StepDots({ count, current }) {
  return (
    <div style={stepDotsRow} aria-label={`Step ${current + 1} of ${count}`}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{
          ...stepDot,
          background: i < current ? T.espresso : i === current ? T.blush : "rgba(58,44,26,0.15)",
          width: i === current ? 18 : 6,
          animation: i === current ? "fwDotPulse 1.6s ease-in-out infinite" : undefined,
        }} />
      ))}
    </div>
  );
}

// ── Card shell ──────────────────────────────────────────────────────────────
function Card({ children, accent = T.espresso }) {
  return (
    <div style={{ ...cardWrap, borderTop: `3px solid ${accent}` }} key={Math.random()}>
      {children}
    </div>
  );
}

// ── Jess avatar bubble ──────────────────────────────────────────────────────
function JessTag() {
  return (
    <div style={jessTag}>
      <div style={jessAvatar}><Sparkles size={11} style={{ color: T.blush }} /></div>
      <span style={jessName}>Jess</span>
      <span style={jessDot}>·</span>
      <span style={jessRole}>your guide</span>
    </div>
  );
}

// ── Component ───────────────────────────────────────────────────────────────
export default function MorningBrief({ onSwitchToBiorhythm, onClose, onComplete }) {
  const [eveningMode, setEveningMode] = useState(false);

  // ── Morning state ─────────────────────────────────────────────────────────
  const [step, setStep] = useState(0);
  const [sleep, setSleep] = useState(null);
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [anchors, setAnchors] = useState(ANCHOR_INIT);
  const [anchorInput, setAnchorInput] = useState("");
  const [captures, setCaptures] = useState([]);
  const [captureText, setCaptureText] = useState("");
  const [captureType, setCaptureType] = useState(null);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [completedAt, setCompletedAt] = useState(null);
  const [greetingDone, setGreetingDone] = useState(false);

  // ── Evening state ─────────────────────────────────────────────────────────
  const [evStep, setEvStep] = useState(0);
  const [reflection, setReflection] = useState(null);
  const [unfinished, setUnfinished] = useState(UNFINISHED_INIT.map(u => ({ ...u, status: "pending" })));
  const [tomorrowAnchor, setTomorrowAnchor] = useState("Folic acid 400 mcg");
  const [shutdown, setShutdown] = useState(new Set());

  useEffect(() => {
    if (step === 6 && !completedAt) {
      const now = Date.now();
      setCompletedAt(now);
      // Notify parent (Planner bottom-sheet) that the brief is complete.
      // The parent decides whether to auto-dismiss after the confetti moment.
      if (typeof onComplete === "function") onComplete({ at: now, anchors, captures });
    }
  }, [step, completedAt, onComplete, anchors, captures]);

  // Auto-advance step 0 after 2.6s (typewriter finishes by then)
  useEffect(() => {
    if (eveningMode || step !== 0) return;
    const t = setTimeout(() => {
      // Only auto-advance if user hasn't manually advanced
      setStep(s => s === 0 ? 0 : s);
    }, 2600);
    return () => clearTimeout(t);
  }, [step, eveningMode]);

  const restart = () => {
    setStep(0); setSleep(null); setMood(null); setEnergy(null);
    setAnchors(ANCHOR_INIT); setCaptures([]); setCompletedAt(null);
    setStartedAt(Date.now()); setGreetingDone(false);
    setEvStep(0); setReflection(null); setUnfinished(UNFINISHED_INIT.map(u => ({ ...u, status: "pending" })));
    setShutdown(new Set());
  };

  const skipToSummary = () => setStep(6);

  const moodLine = (() => {
    if (mood == null) return null;
    if (mood <= 2) return "Your body is asking for gentleness today. We'll keep it light.";
    if (mood === 3) return "A steady day — let's build a rhythm that holds.";
    return "You've got a good base. Let's use it well.";
  })();

  const energyLine = (() => {
    if (energy == null) return null;
    if (energy <= 2) return "Low energy is data, not weakness. The luteal dip is doing its job.";
    if (energy === 3) return "Pacing wins today. One thing at a time.";
    return "Don't overspend it — late luteal saves are short.";
  })();

  const addCapture = (override = null) => {
    const txt = (override?.title || captureText).trim();
    if (!txt) return;
    setCaptures(c => [...c, { id: Date.now() + Math.random(), title: txt, type: override?.type || captureType || "task" }]);
    setCaptureText("");
    setCaptureType(null);
  };

  const removeAnchor = (id) => setAnchors(a => a.filter(x => x.id !== id));
  const addAnchor = () => {
    const txt = anchorInput.trim();
    if (!txt) return;
    setAnchors(a => [...a, { id: Date.now(), title: txt, type: "task" }]);
    setAnchorInput("");
  };

  const setUnfinishedAction = (id, status) => {
    setUnfinished(u => u.map(x => x.id === id ? { ...x, status } : x));
  };
  const toggleShutdown = (id) => {
    setShutdown(s => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const allShutdownDone = SHUTDOWN_ITEMS.every(i => shutdown.has(i.id));

  // Elapsed time in seconds, capped to 90s for the celebratory copy
  const elapsedSec = completedAt ? Math.max(8, Math.min(180, Math.round((completedAt - startedAt) / 1000))) : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={shell}>
      <style>{css}</style>

      {/* Mode toggle + restart */}
      <div style={topBar}>
        <button onClick={() => { setEveningMode(v => !v); restart(); }}
                style={{ ...modeToggle, background: eveningMode ? T.espresso : "transparent", color: eveningMode ? T.cream : T.muted, borderColor: eveningMode ? T.espresso : "rgba(58,44,26,0.18)" }}
                aria-pressed={eveningMode}>
          {eveningMode ? <Moon size={11} style={{ color: T.blush }} /> : <Sun size={11} style={{ color: T.gold }} />}
          {eveningMode ? "Evening mode" : "Morning mode"}
        </button>
        <div style={topBarRight}>
          {!eveningMode && step > 0 && step < 6 && (
            <button onClick={skipToSummary} style={topLink}>Skip to summary</button>
          )}
          <button onClick={restart} style={topLinkIcon} aria-label="Restart">
            <RotateCcw size={11} />
            Restart
          </button>
          {typeof onClose === "function" && (
            <button onClick={onClose} aria-label="Close brief" style={closeBtn}>
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Step progress dots */}
      <StepDots
        count={eveningMode ? 4 : 7}
        current={eveningMode ? evStep : step}
      />

      {/* Card area */}
      <div style={cardStage}>
        {!eveningMode ? renderMorning() : renderEvening()}
      </div>
    </div>
  );

  // ── Morning renderer ──────────────────────────────────────────────────────
  function renderMorning() {
    if (step === 0) return (
      <Card accent={T.blush}>
        <JessTag />
        <div style={greetingBig}>
          <Typewriter text="Good morning, Halli." speed={80} onDone={() => setGreetingDone(true)} />
        </div>
        <div style={greetingSub}>
          Today is <b>Day 25</b> of your luteal phase. Predicted capacity <b>42</b> — a gentler day.
        </div>
        <div style={chipRowCentred}>
          <span style={phasePill}><span style={phaseDot} /> {PHASE.name} · DAY {PHASE.day}</span>
        </div>
        <p style={greetingNote}>Let&apos;s plan your day. It&apos;ll take about ninety seconds.</p>
        <button onClick={() => setStep(1)} disabled={!greetingDone} style={{ ...primaryBtn, opacity: greetingDone ? 1 : 0.5 }}>
          Let&apos;s go
          <ArrowRight size={14} />
        </button>
      </Card>
    );

    if (step === 1) return (
      <Card accent={T.sage}>
        <JessTag />
        <p style={cardEyebrow}>FIRST · HOW DID YOU SLEEP?</p>
        <h3 style={cardTitle}>Sleep shapes everything today.</h3>
        <p style={cardJess}>Tap your answer. No wrong ones.</p>
        <div style={sleepRow}>
          {SLEEP_OPTS.map(o => {
            const selected = sleep === o.val;
            return (
              <button key={o.val} onClick={() => setSleep(o.val)}
                      style={{ ...sleepBtn, background: selected ? T.blushSoft : T.cream, borderColor: selected ? T.blush : "rgba(58,44,26,0.10)", animation: selected ? "fwBounce 0.35s ease-out" : undefined }}>
                <Moon size={16} style={{ color: selected ? T.blush : T.muted }} />
                <div style={sleepBtnLabel}>{o.label}</div>
                <div style={sleepBtnSub}>{o.sub}</div>
              </button>
            );
          })}
        </div>
        {sleep && (
          <p style={cardConfirm}>
            <CheckCircle2 size={13} style={{ color: T.sage }} /> Got it.
          </p>
        )}
        <p style={cardWire}>Logs to your daily check-in — same entity as Today.</p>
        <div style={cardActions}>
          <button onClick={() => setStep(2)} style={textLink}>Skip for now</button>
          <button onClick={() => setStep(2)} disabled={!sleep}
                  style={{ ...primaryBtnSmall, opacity: sleep ? 1 : 0.4 }}>
            Continue <ArrowRight size={13} />
          </button>
        </div>
      </Card>
    );

    if (step === 2) return (
      <Card accent={T.gold}>
        <JessTag />
        <p style={cardEyebrow}>AND YOUR ENERGY THIS MORNING?</p>
        <h3 style={cardTitle}>How are you feeling?</h3>
        <div style={moodGroup}>
          <p style={scaleLabel}>Mood</p>
          <div style={scaleRow}>
            {[1, 2, 3, 4, 5].map(n => {
              const selected = mood === n;
              return (
                <button key={n} onClick={() => setMood(n)}
                        style={{ ...scaleBtn, background: selected ? T.blushSoft : T.cream, borderColor: selected ? T.blush : "rgba(58,44,26,0.10)", animation: selected ? "fwBounce 0.35s ease-out" : undefined }}>
                  <Heart size={15} style={{ color: selected ? T.rose : T.muted }} />
                  <div style={scaleVal}>{n}</div>
                </button>
              );
            })}
          </div>
          {moodLine && <p style={cardJess}>{moodLine}</p>}
        </div>
        <div style={{ ...moodGroup, marginTop: 18 }}>
          <p style={scaleLabel}>Energy</p>
          <div style={scaleRow}>
            {[1, 2, 3, 4, 5].map(n => {
              const selected = energy === n;
              return (
                <button key={n} onClick={() => setEnergy(n)}
                        style={{ ...scaleBtn, background: selected ? T.goldSoft : T.cream, borderColor: selected ? T.gold : "rgba(58,44,26,0.10)", animation: selected ? "fwBounce 0.35s ease-out" : undefined }}>
                  <Zap size={15} style={{ color: selected ? T.gold : T.muted }} />
                  <div style={scaleVal}>{n}</div>
                </button>
              );
            })}
          </div>
          {energyLine && <p style={cardJess}>{energyLine}</p>}
        </div>
        <p style={cardWire}>Logs to daily check-in — single source for Pulse / Insights / Doctor Export.</p>
        <div style={cardActions}>
          <button onClick={() => setStep(1)} style={textLink}>Back</button>
          <button onClick={() => setStep(3)} disabled={mood == null || energy == null}
                  style={{ ...primaryBtnSmall, opacity: (mood != null && energy != null) ? 1 : 0.4 }}>
            Continue <ArrowRight size={13} />
          </button>
        </div>
      </Card>
    );

    if (step === 3) return (
      <Card accent={T.gold}>
        <JessTag />
        <p style={cardEyebrow}>YOUR ANCHORS</p>
        <h3 style={cardTitle}>What must happen today?</h3>
        <p style={cardJess}>
          Anchor tasks are the ones the day can&apos;t end without. Everything else is flexible.
        </p>
        <div style={anchorList}>
          {anchors.length === 0 ? (
            <p style={anchorEmpty}>No anchors right now. Add one below — or keep today flexible.</p>
          ) : anchors.map(a => {
            const Icon = TYPE_ICON[a.type] || Briefcase;
            return (
              <div key={a.id} style={anchorRow}>
                <div style={anchorIcon}><Anchor size={12} style={{ color: T.gold }} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={anchorTitle}>{a.title}</div>
                  <div style={anchorMeta}><Icon size={9} /> <span>{a.type}</span></div>
                </div>
                <button onClick={() => removeAnchor(a.id)} style={anchorRemoveBtn} aria-label="Remove anchor">
                  <X size={11} />
                </button>
              </div>
            );
          })}
        </div>
        <div style={anchorAddRow}>
          <input value={anchorInput} onChange={e => setAnchorInput(e.target.value)}
                 onKeyDown={e => { if (e.key === "Enter") addAnchor(); }}
                 placeholder="Add an anchor (e.g. Call Mum)" style={anchorInputStyle} />
          <button onClick={addAnchor} disabled={!anchorInput.trim()}
                  style={{ ...secondaryBtn, opacity: anchorInput.trim() ? 1 : 0.4 }}>
            <Plus size={12} /> Add
          </button>
        </div>
        <p style={cardWire}>Anchors stored as PlannerItems with isAnchor=true — same source the Cycle tab reads.</p>
        <div style={cardActions}>
          <button onClick={() => { setAnchors([]); setStep(4); }} style={textLink}>No anchors today</button>
          <button onClick={() => setStep(4)} style={primaryBtnSmall}>
            These are locked in <ArrowRight size={13} />
          </button>
        </div>
      </Card>
    );

    if (step === 4) return (
      <Card accent={T.sage}>
        <JessTag />
        <p style={cardEyebrow}>DROP ANYTHING IN</p>
        <h3 style={cardTitle}>Anything else on your mind?</h3>
        <p style={cardJess}>Capture it here and it&apos;ll wait in your stack.</p>
        <div style={captureInputRow}>
          <input value={captureText} onChange={e => setCaptureText(e.target.value)}
                 onKeyDown={e => { if (e.key === "Enter") addCapture(); }}
                 placeholder="What&rsquo;s on your plate today?" style={captureInputStyle} />
        </div>
        <div style={captureChipsRow}>
          {[
            { id: "medication", label: "Medication", Icon: Pill,      tone: T.blush  },
            { id: "task",       label: "Task",       Icon: Briefcase,  tone: T.espresso },
            { id: "ritual",     label: "Ritual",     Icon: Sparkles,   tone: T.gold   },
            { id: "session",    label: "Session",    Icon: Dumbbell,   tone: T.sage   },
          ].map(({ id, label, Icon, tone }) => {
            const active = captureType === id;
            return (
              <button key={id} onClick={() => setCaptureType(active ? null : id)}
                      style={{ ...captureChip, color: active ? tone : T.muted, borderColor: active ? tone : "rgba(58,44,26,0.10)", background: active ? `${tone}1F` : "transparent" }}>
                <Icon size={11} /> {label}
              </button>
            );
          })}
          <div style={{ flex: 1 }} />
          <button onClick={() => addCapture()} disabled={!captureText.trim()}
                  style={{ ...secondaryBtn, opacity: captureText.trim() ? 1 : 0.4 }}>
            <Plus size={12} /> Add to stack
          </button>
        </div>
        {captures.length > 0 && (
          <div style={captureList}>
            <p style={captureListEyebrow}>IN YOUR STACK</p>
            {captures.map(c => {
              const Icon = TYPE_ICON[c.type] || Briefcase;
              return (
                <div key={c.id} style={captureRow}>
                  <Icon size={11} style={{ color: T.muted }} />
                  <span>{c.title}</span>
                  <span style={captureRowType}>{c.type}</span>
                </div>
              );
            })}
          </div>
        )}
        <p style={cardWire}>Captures appear unscheduled — drop them onto times in the Biorhythm view, or let Mission Control auto-rail them by capacity.</p>
        <div style={cardActions}>
          <button onClick={() => setStep(5)} style={textLink}>Nothing else</button>
          <button onClick={() => setStep(5)} style={primaryBtnSmall}>
            Continue <ArrowRight size={13} />
          </button>
        </div>
      </Card>
    );

    if (step === 5) return (
      <Card accent={T.blush}>
        <JessTag />
        <div style={rhythmHead}>
          <div>
            <p style={cardEyebrow}>YOUR RHYTHM FOR TODAY</p>
            <h3 style={cardTitle}>Here&apos;s how the day might land.</h3>
          </div>
          {typeof onSwitchToBiorhythm === "function" && (
            <button onClick={onSwitchToBiorhythm} style={rhythmAdjust} aria-label="See Biorhythm view">
              See Biorhythm <ArrowRight size={11} />
            </button>
          )}
        </div>
        <p style={cardJess}>
          Late luteal is best for closing loops, not opening new ones. Protect your morning, lighten your afternoon.
        </p>
        <div style={rhythmList}>
          {RHYTHM.map(r => {
            const I = r.Icon;
            return (
              <div key={r.block} style={{ ...rhythmBlock, borderLeftColor: r.tone }}>
                <div style={rhythmBlockHead}>
                  <div style={{ ...rhythmIcon, background: `${r.tone}22`, color: r.tone }}>
                    <I size={14} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={rhythmBlockTitle}>{r.block} <span style={rhythmBlockRange}>· {r.range}</span></div>
                    <div style={rhythmBlockNote}>{r.note}</div>
                  </div>
                </div>
                <ul style={rhythmItems}>
                  {r.items.map((it, i) => (<li key={i} style={rhythmItem}>{it}</li>))}
                </ul>
              </div>
            );
          })}
        </div>
        <p style={cardWire}>Read-only on this card. Tap &ldquo;See Biorhythm&rdquo; to drag tasks between hours.</p>
        <div style={cardActions}>
          <button onClick={() => setStep(4)} style={textLink}>Back</button>
          <button onClick={() => setStep(6)} style={primaryBtnSmall}>
            I&apos;m planned <ArrowRight size={13} />
          </button>
        </div>
      </Card>
    );

    // Step 6 — Completion
    return (
      <Card accent={T.gold}>
        <Confetti />
        <JessTag />
        <h3 style={completionTitle}>You&apos;re set.</h3>
        <p style={completionSub}>
          That took about <b>{elapsedSec ?? 90}</b> seconds — well done.
        </p>
        <div style={summaryGrid}>
          <div style={summaryTile}>
            <div style={{ ...summaryIcon, background: T.goldSoft, color: T.goldDeep }}><Anchor size={13} style={{ color: T.gold }} /></div>
            <div style={summaryVal}>{anchors.length}</div>
            <div style={summaryLabel}>anchors locked in</div>
          </div>
          <div style={summaryTile}>
            <div style={{ ...summaryIcon, background: T.sageSoft }}><CheckCircle2 size={13} style={{ color: T.sage }} /></div>
            <div style={summaryVal}>{captures.length}</div>
            <div style={summaryLabel}>in your stack</div>
          </div>
          <div style={summaryTile}>
            <div style={{ ...summaryIcon, background: T.blushSoft }}><Moon size={13} style={{ color: T.blush }} /></div>
            <div style={summaryValSmall}>Magnesium</div>
            <div style={summaryLabel}>tonight</div>
          </div>
          <div style={summaryTile}>
            <div style={{ ...summaryIcon, background: "rgba(58,44,26,0.08)" }}><Zap size={13} style={{ color: T.espresso }} /></div>
            <div style={summaryVal}>{PHASE.capacity}</div>
            <div style={summaryLabel}>capacity · luteal {PHASE.day}</div>
          </div>
        </div>
        <div style={completionCtas}>
          <a href="/Planner" style={primaryBtn}>
            Open full planner <ArrowRight size={14} />
          </a>
          {typeof onSwitchToBiorhythm === "function" && (
            <button onClick={onSwitchToBiorhythm} style={secondaryBtnFull}>
              See the Biorhythm view <ArrowRight size={13} />
            </button>
          )}
        </div>
        <p style={cardWire}>Summary writes nothing yet — the live planner reads the same anchors, stack, and check-ins this brief just collected.</p>
      </Card>
    );
  }

  // ── Evening renderer ──────────────────────────────────────────────────────
  function renderEvening() {
    if (evStep === 0) return (
      <Card accent={T.plum}>
        <JessTag />
        <p style={cardEyebrow}>EVENING · HOW DID TODAY GO?</p>
        <h3 style={cardTitle}>Before you close the day &mdash; a moment to reflect.</h3>
        <div style={reflectionRow}>
          {[
            { val: "tough",  label: "Tough",  Icon: Waves, tone: T.blush, sub: "Not your fault." },
            { val: "steady", label: "Steady", Icon: Leaf,  tone: T.sage,  sub: "A real win."     },
            { val: "good",   label: "Good",   Icon: Star,  tone: T.gold,  sub: "Savour it."      },
          ].map(({ val, label, Icon, tone, sub }) => {
            const selected = reflection === val;
            return (
              <button key={val} onClick={() => setReflection(val)}
                      style={{ ...reflectionBtn, background: selected ? `${tone}1F` : T.cream, borderColor: selected ? tone : "rgba(58,44,26,0.10)", animation: selected ? "fwBounce 0.35s ease-out" : undefined }}>
                <Icon size={20} style={{ color: tone }} />
                <div style={reflectionLabel}>{label}</div>
                <div style={reflectionSub}>{sub}</div>
              </button>
            );
          })}
        </div>
        <p style={cardWire}>Logs to your Journal — same entity as the daily reflection card.</p>
        <div style={cardActions}>
          <span />
          <button onClick={() => setEvStep(1)} disabled={!reflection}
                  style={{ ...primaryBtnSmall, opacity: reflection ? 1 : 0.4 }}>
            Continue <ArrowRight size={13} />
          </button>
        </div>
      </Card>
    );

    if (evStep === 1) return (
      <Card accent={T.blush}>
        <JessTag />
        <p style={cardEyebrow}>UNFINISHED TASKS</p>
        <h3 style={cardTitle}>{unfinished.filter(u => u.status === "pending").length} things still open.</h3>
        <p style={cardJess}>
          Unfinished work is tomorrow&apos;s problem &mdash; don&apos;t carry it in your body tonight.
        </p>
        <div style={unfinishedList}>
          {unfinished.map(u => {
            const Icon = TYPE_ICON[u.type] || Briefcase;
            return (
              <div key={u.id} style={{ ...unfinishedRow, opacity: u.status === "pending" ? 1 : 0.55 }}>
                <Icon size={13} style={{ color: T.muted, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={unfinishedTitle}>{u.title}</div>
                  {u.status !== "pending" && <div style={unfinishedStatus}>{u.status === "carry" ? "Carried forward" : u.status === "defer" ? "Deferred to next high-cap" : "Removed"}</div>}
                </div>
                {u.status === "pending" && (
                  <div style={unfinishedActions}>
                    <button onClick={() => setUnfinishedAction(u.id, "carry")} style={unfinishedBtn}><ChevronRight size={11} /> Carry</button>
                    <button onClick={() => setUnfinishedAction(u.id, "defer")} style={unfinishedBtn}>Defer</button>
                    <button onClick={() => setUnfinishedAction(u.id, "remove")} style={{ ...unfinishedBtn, color: T.rose, borderColor: "rgba(212,94,82,0.30)" }}>Remove</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p style={cardWire}>Carry/defer updates PlannerItems.date — same field the Cycle tab month grid reads.</p>
        <div style={cardActions}>
          <button onClick={() => setEvStep(0)} style={textLink}>Back</button>
          <button onClick={() => setEvStep(2)} style={primaryBtnSmall}>Continue <ArrowRight size={13} /></button>
        </div>
      </Card>
    );

    if (evStep === 2) return (
      <Card accent={T.sage}>
        <JessTag />
        <p style={cardEyebrow}>TOMORROW</p>
        <h3 style={cardTitle}>One anchor for tomorrow?</h3>
        <p style={cardJess}>
          Tomorrow is <b>Luteal Day {PHASE.tomorrowDay}</b> &mdash; predicted capacity <b>{PHASE.tomorrowCap}</b>. A rest-forward day.
        </p>
        <div style={tomorrowRow}>
          <Anchor size={14} style={{ color: T.gold, flexShrink: 0 }} />
          <input value={tomorrowAnchor} onChange={e => setTomorrowAnchor(e.target.value)}
                 placeholder="One anchor for tomorrow" style={anchorInputStyle} />
        </div>
        <p style={tomorrowHint}>Pre-filled with your daily recurring item. Edit or clear.</p>
        <p style={cardWire}>Creates a PlannerItems row dated {`<tomorrow>`} with isAnchor=true.</p>
        <div style={cardActions}>
          <button onClick={() => setEvStep(1)} style={textLink}>Back</button>
          <button onClick={() => setEvStep(3)} style={primaryBtnSmall}>Continue <ArrowRight size={13} /></button>
        </div>
      </Card>
    );

    // evStep 3 — shutdown ritual
    return (
      <Card accent={T.espresso}>
        <JessTag />
        <p style={cardEyebrow}>SHUTDOWN RITUAL</p>
        <h3 style={cardTitle}>Four small things, then rest.</h3>
        <p style={cardJess}>The shutdown ritual is how the day closes &mdash; not a to-do list.</p>
        <div style={shutdownList}>
          {SHUTDOWN_ITEMS.map(it => {
            const done = shutdown.has(it.id);
            return (
              <button key={it.id} onClick={() => toggleShutdown(it.id)}
                      style={{ ...shutdownRow, background: done ? T.sageSoft : T.cream, borderColor: done ? T.sage : "rgba(58,44,26,0.10)" }}>
                <div style={{ ...shutdownCheck, background: done ? T.sage : "transparent", borderColor: done ? T.sage : T.muted }}>
                  {done && <CheckCircle2 size={11} style={{ color: T.cream }} strokeWidth={3} />}
                </div>
                <span style={{ ...shutdownTitle, textDecoration: done ? "line-through" : "none", opacity: done ? 0.6 : 1 }}>{it.title}</span>
              </button>
            );
          })}
        </div>
        {allShutdownDone ? (
          <div style={goodNightWrap}>
            <div style={starsWrap}>
              {Array.from({ length: 14 }).map((_, i) => (
                <span key={i} style={{ ...star, left: `${(i * 31) % 100}%`, top: `${(i * 17) % 80}%`, animationDelay: `${i * 90}ms` }} />
              ))}
            </div>
            <h4 style={goodNightTitle}>Day closed. Rest well, Halli.</h4>
            <p style={goodNightSub}>Tomorrow opens at sunrise. Nothing waits here.</p>
          </div>
        ) : (
          <p style={cardWire}>Same ritual items the Planner&apos;s Tonight card uses. Check them off here or there — they share state.</p>
        )}
        <div style={cardActions}>
          <button onClick={() => setEvStep(2)} style={textLink}>Back</button>
          <button onClick={() => { setEveningMode(false); restart(); }} style={primaryBtnSmall}>
            Done <ArrowRight size={13} />
          </button>
        </div>
      </Card>
    );
  }
}

// ── CSS animations ──────────────────────────────────────────────────────────
const css = `
@keyframes fwCardIn { 0% { transform: translateY(24px); opacity: 0 } 100% { transform: translateY(0); opacity: 1 } }
@keyframes fwBounce { 0%, 100% { transform: scale(1) } 40% { transform: scale(1.15) } 70% { transform: scale(0.97) } }
@keyframes fwDotPulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.55 } }
@keyframes fwConfetti {
  0% { transform: translateY(0) rotate(0deg); opacity: 0 }
  10% { opacity: 1 }
  100% { transform: translate(var(--fwEndX), -240px) rotate(540deg); opacity: 0 }
}
@keyframes fwStar { 0% { opacity: 0; transform: scale(0.5) } 30% { opacity: 1; transform: scale(1) } 100% { opacity: 0.45; transform: scale(0.9) } }
@keyframes fwCursorBlink { 0%, 100% { opacity: 0 } 50% { opacity: 1 } }
`;

// ── Styles ──────────────────────────────────────────────────────────────────
const shell = {
  background: T.cream,
  borderRadius: 24,
  padding: "16px 16px 22px",
  border: "1px solid rgba(58,44,26,0.10)",
  boxShadow: "0 1px 0 rgba(58,44,26,0.04), 0 24px 64px rgba(58,44,26,0.08)",
  maxWidth: 600,
  margin: "0 auto",
  fontFamily: "'Inter', system-ui, sans-serif",
  position: "relative",
};

const topBar = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  marginBottom: 12,
};
const modeToggle = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "5px 11px", borderRadius: 9999,
  fontSize: 11, fontWeight: 700, letterSpacing: "0.10em",
  border: "1px solid", cursor: "pointer",
  textTransform: "uppercase",
};
const topBarRight = { display: "flex", alignItems: "center", gap: 10 };
const topLink = {
  background: "transparent", border: "none", cursor: "pointer",
  fontSize: 11, fontWeight: 600, color: T.muted,
  fontFamily: "inherit",
};
const topLinkIcon = {
  display: "inline-flex", alignItems: "center", gap: 4,
  background: "transparent", border: "none", cursor: "pointer",
  fontSize: 11, fontWeight: 600, color: T.muted,
  fontFamily: "inherit",
};
const closeBtn = {
  width: 26, height: 26, borderRadius: 9999,
  background: T.paper, border: "1px solid rgba(58,44,26,0.15)",
  color: T.muted, cursor: "pointer",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  marginLeft: 4,
};

const stepDotsRow = {
  display: "flex", justifyContent: "center", alignItems: "center",
  gap: 6, marginBottom: 18, height: 12,
};
const stepDot = {
  height: 6, borderRadius: 9999,
  transition: "width 0.3s ease, background 0.3s ease",
};

const cardStage = {
  position: "relative",
  minHeight: 360,
  display: "flex", justifyContent: "center", alignItems: "flex-start",
};
const cardWrap = {
  width: "100%",
  background: T.paper,
  borderRadius: 20,
  padding: "22px 22px 18px",
  boxShadow: "0 2px 12px rgba(58,44,26,0.10), 0 24px 48px rgba(58,44,26,0.06)",
  animation: "fwCardIn 360ms cubic-bezier(0.2, 0.8, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
};

const jessTag = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "4px 10px 4px 4px", borderRadius: 9999,
  background: T.blushSoft, border: `1px solid ${T.blush}66`,
  marginBottom: 14,
};
const jessAvatar = {
  width: 22, height: 22, borderRadius: 9999,
  background: T.paper,
  display: "flex", alignItems: "center", justifyContent: "center",
  border: `1px solid ${T.blush}88`,
};
const jessName = { fontSize: 11, fontWeight: 700, color: T.espresso, fontStyle: "italic", fontFamily: "'Fraunces', Georgia, serif" };
const jessDot = { color: T.muted, fontSize: 11 };
const jessRole = { fontSize: 10, color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 };

const cardEyebrow = {
  fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
  color: T.muted, textTransform: "uppercase", margin: "0 0 6px",
};
const cardTitle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 24, fontWeight: 500, color: T.espresso,
  letterSpacing: "-0.01em", margin: "0 0 8px", lineHeight: 1.25,
};
const cardJess = {
  fontSize: 14, color: T.espresso, lineHeight: 1.55,
  margin: "0 0 12px",
};
const cardConfirm = {
  display: "inline-flex", alignItems: "center", gap: 5,
  fontSize: 11, fontWeight: 600, color: T.sage,
  margin: "10px 0 0",
};
const cardWire = {
  fontSize: 10, color: T.muted, fontStyle: "italic", lineHeight: 1.5,
  padding: "8px 10px", margin: "12px 0 4px",
  borderRadius: 8,
  background: T.cream,
  border: `1px dashed rgba(58,44,26,0.10)`,
};
const cardActions = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  gap: 8, marginTop: 14,
};

const greetingBig = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 32, fontWeight: 500, color: T.espresso,
  letterSpacing: "-0.02em", lineHeight: 1.2,
  margin: "0 0 8px",
};
const cursor = {
  display: "inline-block", width: 10,
  animation: "fwCursorBlink 1s steps(2) infinite",
};
const greetingSub = { fontSize: 14, color: T.espresso, lineHeight: 1.6, margin: "0 0 12px" };
const greetingNote = { fontSize: 13, color: T.muted, lineHeight: 1.55, margin: "10px 0 16px", fontStyle: "italic" };
const phasePill = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "5px 12px", borderRadius: 9999,
  background: T.blushSoft, color: T.espresso,
  fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
  border: `1px solid ${T.blush}66`,
};
const phaseDot = { width: 6, height: 6, borderRadius: 9999, background: T.blush };
const chipRowCentred = { marginBottom: 6 };

const primaryBtn = {
  width: "100%",
  display: "inline-flex", justifyContent: "center", alignItems: "center", gap: 6,
  padding: "12px 18px", borderRadius: 9999,
  background: T.espresso, color: T.cream,
  border: "none", cursor: "pointer",
  fontSize: 14, fontWeight: 700, letterSpacing: "0.04em",
  textDecoration: "none",
};
const primaryBtnSmall = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "8px 14px", borderRadius: 9999,
  background: T.espresso, color: T.cream,
  border: "none", cursor: "pointer",
  fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
};
const secondaryBtn = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "7px 12px", borderRadius: 9999,
  background: T.cream, color: T.espresso,
  border: `1px solid rgba(58,44,26,0.15)`,
  cursor: "pointer",
  fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
};
const secondaryBtnFull = {
  width: "100%",
  display: "inline-flex", justifyContent: "center", alignItems: "center", gap: 6,
  padding: "11px 16px", borderRadius: 9999,
  background: T.cream, color: T.espresso,
  border: `1.5px solid rgba(58,44,26,0.20)`,
  cursor: "pointer",
  fontSize: 13, fontWeight: 700, letterSpacing: "0.04em",
};
const textLink = {
  background: "transparent", border: "none", cursor: "pointer",
  fontSize: 12, fontWeight: 600, color: T.muted,
  fontFamily: "inherit", padding: "6px 4px",
};

// Sleep
const sleepRow = { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginTop: 10, marginBottom: 6 };
const sleepBtn = {
  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
  padding: "10px 4px", borderRadius: 12,
  border: "1.5px solid", cursor: "pointer",
};
const sleepBtnLabel = { fontSize: 13, fontWeight: 700, color: T.espresso };
const sleepBtnSub = { fontSize: 9, color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 };

// Mood / energy scale
const moodGroup = { marginTop: 10 };
const scaleLabel = { fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: T.muted, textTransform: "uppercase", margin: "0 0 6px" };
const scaleRow = { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 };
const scaleBtn = {
  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
  padding: "10px 4px", borderRadius: 12,
  border: "1.5px solid", cursor: "pointer",
};
const scaleVal = { fontSize: 12, fontWeight: 700, color: T.espresso };

// Anchors
const anchorList = { display: "flex", flexDirection: "column", gap: 6, marginTop: 4 };
const anchorRow = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "10px 12px", borderRadius: 12,
  background: T.cream, border: "1px solid rgba(58,44,26,0.10)",
};
const anchorIcon = {
  width: 24, height: 24, borderRadius: 8,
  background: T.goldSoft, border: `1px solid ${T.gold}44`,
  display: "flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const anchorTitle = { fontSize: 13, fontWeight: 600, color: T.espresso, lineHeight: 1.2 };
const anchorMeta = { fontSize: 10, color: T.muted, marginTop: 2, display: "flex", alignItems: "center", gap: 4, textTransform: "capitalize" };
const anchorRemoveBtn = {
  width: 24, height: 24, borderRadius: 8,
  background: "transparent", border: "1px solid rgba(58,44,26,0.12)",
  cursor: "pointer", color: T.muted,
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};
const anchorEmpty = { fontSize: 12, color: T.muted, fontStyle: "italic", padding: "12px 4px" };
const anchorAddRow = { display: "flex", gap: 6, marginTop: 10 };
const anchorInputStyle = {
  flex: 1, padding: "9px 12px", borderRadius: 10,
  border: "1px solid rgba(58,44,26,0.15)",
  background: T.cream, color: T.espresso,
  fontSize: 13, fontFamily: "inherit", outline: "none",
};

// Capture
const captureInputRow = { marginTop: 4 };
const captureInputStyle = {
  width: "100%", padding: "11px 14px", borderRadius: 12,
  border: "1.5px solid rgba(58,44,26,0.15)",
  background: T.cream, color: T.espresso,
  fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
};
const captureChipsRow = { display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", marginTop: 10 };
const captureChip = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "5px 10px", borderRadius: 9999,
  fontSize: 11, fontWeight: 600,
  border: "1px solid", cursor: "pointer",
};
const captureList = {
  marginTop: 12, padding: "10px 12px", borderRadius: 12,
  background: T.cream, border: "1px solid rgba(58,44,26,0.10)",
};
const captureListEyebrow = { fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", color: T.muted, textTransform: "uppercase", margin: "0 0 6px" };
const captureRow = {
  display: "flex", alignItems: "center", gap: 8,
  fontSize: 12, color: T.espresso,
  padding: "4px 0",
};
const captureRowType = { marginLeft: "auto", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: T.muted, textTransform: "uppercase" };

// Rhythm
const rhythmHead = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 };
const rhythmAdjust = {
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "5px 11px", borderRadius: 9999,
  background: "transparent", color: T.blush,
  border: `1px solid ${T.blush}88`,
  fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", cursor: "pointer",
  flexShrink: 0,
};
const rhythmList = { display: "flex", flexDirection: "column", gap: 8, marginTop: 6 };
const rhythmBlock = {
  borderLeft: "4px solid", borderRadius: "0 12px 12px 0",
  padding: "10px 12px",
  background: T.cream, border: "1px solid rgba(58,44,26,0.10)",
  borderLeftWidth: 4,
};
const rhythmBlockHead = { display: "flex", alignItems: "center", gap: 10 };
const rhythmIcon = {
  width: 26, height: 26, borderRadius: 9,
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};
const rhythmBlockTitle = { fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", color: T.espresso, textTransform: "uppercase" };
const rhythmBlockRange = { fontWeight: 500, letterSpacing: "0.06em", color: T.muted };
const rhythmBlockNote = { fontSize: 11, color: T.muted, fontStyle: "italic", marginTop: 2 };
const rhythmItems = { listStyle: "none", padding: 0, margin: "8px 0 0 0", display: "flex", flexDirection: "column", gap: 3 };
const rhythmItem = { fontSize: 12, color: T.espresso, paddingLeft: 0, lineHeight: 1.5 };

// Summary
const completionTitle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 32, fontWeight: 500, color: T.espresso,
  letterSpacing: "-0.02em", margin: "8px 0 4px", lineHeight: 1.15,
};
const completionSub = { fontSize: 14, color: T.muted, margin: "0 0 16px", lineHeight: 1.55 };
const summaryGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 };
const summaryTile = {
  padding: "12px 12px", borderRadius: 14,
  background: T.cream, border: "1px solid rgba(58,44,26,0.10)",
  display: "flex", flexDirection: "column", gap: 4,
};
const summaryIcon = {
  width: 26, height: 26, borderRadius: 8,
  display: "flex", alignItems: "center", justifyContent: "center",
};
const summaryVal = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 22, fontWeight: 500, color: T.espresso,
  lineHeight: 1, marginTop: 2,
};
const summaryValSmall = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 14, fontWeight: 500, color: T.espresso,
  lineHeight: 1.2, marginTop: 2,
};
const summaryLabel = {
  fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
  color: T.muted, textTransform: "uppercase",
};
const completionCtas = { display: "flex", flexDirection: "column", gap: 8, marginTop: 4 };

const confettiWrap = {
  position: "absolute", left: 0, right: 0, bottom: 0, height: 280,
  overflow: "hidden", pointerEvents: "none",
};

// Reflection (evening 0)
const reflectionRow = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 6 };
const reflectionBtn = {
  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
  padding: "14px 8px", borderRadius: 14,
  border: "1.5px solid", cursor: "pointer",
};
const reflectionLabel = { fontSize: 14, fontWeight: 700, color: T.espresso, marginTop: 4 };
const reflectionSub = { fontSize: 10, color: T.muted, fontStyle: "italic" };

// Unfinished (evening 1)
const unfinishedList = { display: "flex", flexDirection: "column", gap: 6, marginTop: 4 };
const unfinishedRow = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "10px 12px", borderRadius: 12,
  background: T.cream, border: "1px solid rgba(58,44,26,0.10)",
};
const unfinishedTitle = { fontSize: 13, fontWeight: 600, color: T.espresso, lineHeight: 1.2 };
const unfinishedStatus = { fontSize: 10, color: T.muted, fontStyle: "italic", marginTop: 2 };
const unfinishedActions = { display: "flex", gap: 4, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" };
const unfinishedBtn = {
  display: "inline-flex", alignItems: "center", gap: 3,
  padding: "4px 8px", borderRadius: 9999,
  background: T.paper, color: T.espresso,
  border: "1px solid rgba(58,44,26,0.18)",
  cursor: "pointer",
  fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
};

// Tomorrow (evening 2)
const tomorrowRow = { display: "flex", gap: 8, alignItems: "center", marginTop: 6 };
const tomorrowHint = { fontSize: 11, color: T.muted, fontStyle: "italic", margin: "6px 0 0" };

// Shutdown (evening 3)
const shutdownList = { display: "flex", flexDirection: "column", gap: 6, marginTop: 6 };
const shutdownRow = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "11px 12px", borderRadius: 12,
  border: "1.5px solid", cursor: "pointer", textAlign: "left",
  width: "100%",
};
const shutdownCheck = {
  width: 22, height: 22, borderRadius: 7,
  border: "1.5px solid", cursor: "pointer", flexShrink: 0,
  display: "flex", alignItems: "center", justifyContent: "center",
};
const shutdownTitle = { fontSize: 13, fontWeight: 600, color: T.espresso, lineHeight: 1.2 };

const goodNightWrap = {
  position: "relative",
  marginTop: 14, padding: "26px 18px",
  borderRadius: 14,
  background: T.espresso, color: T.cream,
  overflow: "hidden",
  textAlign: "center",
};
const starsWrap = { position: "absolute", inset: 0, pointerEvents: "none" };
const star = {
  position: "absolute",
  width: 3, height: 3, borderRadius: 9999,
  background: T.cream, opacity: 0,
  animation: "fwStar 2s ease-out forwards",
};
const goodNightTitle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 22, fontWeight: 500, color: T.cream,
  margin: "0 0 6px", letterSpacing: "-0.01em",
};
const goodNightSub = { fontSize: 13, color: "rgba(244,237,219,0.7)", margin: 0, fontStyle: "italic", lineHeight: 1.55 };
