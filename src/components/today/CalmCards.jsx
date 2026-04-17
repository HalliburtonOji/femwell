import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";

// ── Affirmation pool ───────────────────────────────────────────────────────
const AFFIRMATIONS = [
  "I am allowed to slow down. I am allowed to not be okay right now.",
  "This feeling will pass. It always does.",
  "I am safe in this moment, in this body, in this breath.",
  "I don't have to have it all figured out today.",
  "My feelings are valid. They don't define me.",
  "I am doing the best I can with what I have.",
  "Resting is not giving up. It is part of healing.",
  "I am worthy of care — including my own.",
  "I am more resilient than I give myself credit for.",
  "I can feel overwhelmed and still be okay.",
  "My worth is not measured by my productivity.",
  "I give myself permission to take up space.",
  "I am not behind. I am exactly where I need to be.",
  "It is okay to ask for help. It is a sign of strength.",
  "I release what I cannot control and tend to what I can.",
  "My body is working hard to keep me safe. I thank it.",
  "One breath at a time. One moment at a time.",
  "I am enough, exactly as I am, right now.",
  "Hard things end. I have gotten through hard things before.",
  "There is no rush. I can take all the time I need.",
  "I choose gentleness over judgment today.",
  "My sensitivity is a gift, not a weakness.",
];

// ── Body scan variants ────────────────────────────────────────────────────
const BODY_SCANS = [
  ["Drop your shoulders away from your ears.", "Unclench your jaw. Let it fall soft.", "Soften your belly. Let it be round."],
  ["Feel your feet on the floor. Let them be heavy.", "Relax your hands. Open your fingers gently.", "Take one slow breath all the way down to your belly."],
  ["Notice where you're holding tension. Just notice — don't fix.", "Let your forehead smooth. Let your eyes soften.", "Breathe into the tightness, and breathe out a little release."],
  ["Roll your shoulders back once, slowly.", "Unclench your teeth. Separate your upper and lower jaw slightly.", "Feel the back of your body where it's supported. Let it hold you."],
];

// ── Tiny actions ──────────────────────────────────────────────────────────
const TINY_ACTIONS = [
  { emoji: "💧", label: "Sip some water" },
  { emoji: "🚶", label: "Step outside for 60 seconds" },
  { emoji: "📱", label: "Text someone you trust" },
  { emoji: "🌊", label: "Splash cold water on your face" },
  { emoji: "🤸", label: "Stretch your arms overhead" },
  { emoji: "🫁", label: "Take 3 slow deep breaths" },
  { emoji: "☕", label: "Make yourself a warm drink" },
];

// ── Grounding senses ──────────────────────────────────────────────────────
const SENSES = [
  { n: 5, label: "Name 5 things you can see" },
  { n: 4, label: "Name 4 things you can touch" },
  { n: 3, label: "Name 3 things you can hear" },
  { n: 2, label: "Name 2 things you can smell" },
  { n: 1, label: "Name 1 thing you can taste" },
];

// ── Box breath hook ──────────────────────────────────────────────────────
function useBoxBreath() {
  const [phase, setPhase] = useState("inhale"); // inhale|hold1|exhale|hold2
  const [count, setCount] = useState(4);
  const [cycle, setCycle] = useState(0);
  const done = cycle >= 3;

  useEffect(() => {
    if (done) return;
    const timer = setInterval(() => {
      setCount(c => {
        if (c > 1) return c - 1;
        // advance phase
        setPhase(p => {
          const next = { inhale: "hold1", hold1: "exhale", exhale: "hold2", hold2: "inhale" }[p];
          if (next === "inhale") setCycle(cy => cy + 1);
          return next;
        });
        return 4;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [done]);

  return { phase, count, cycle, done };
}

const PHASE_LABELS = { inhale: "Inhale", hold1: "Hold", exhale: "Exhale", hold2: "Hold" };
const PHASE_SCALES = { inhale: 1.25, hold1: 1.25, exhale: 0.85, hold2: 0.85 };

// ── Per-card content builders ────────────────────────────────────────────
function WelcomeCard() {
  return (
    <CardShell accent="#C084FC">
      <div style={{ fontSize: 48, textAlign: "center", marginBottom: 24 }}>🌿</div>
      <CardTitle>You're here. That's enough.</CardTitle>
      <CardBody>Take one slow breath before we begin. Breathe in through your nose… and out through your mouth.</CardBody>
      <CardBody style={{ marginTop: 12, color: "#9D7EC7", fontSize: 13 }}>Swipe or tap to continue when you're ready.</CardBody>
    </CardShell>
  );
}

function GroundingCard({ onDone }) {
  const [senseIdx, setSenseIdx] = useState(0);
  const sense = SENSES[senseIdx];
  const isLast = senseIdx === SENSES.length - 1;

  return (
    <CardShell accent="#A78BFA">
      <CardLabel>5-4-3-2-1 Grounding</CardLabel>
      <div style={{ fontSize: 64, textAlign: "center", marginBottom: 20, lineHeight: 1 }}>
        {["👀", "🤲", "👂", "👃", "👅"][senseIdx]}
      </div>
      <div style={{ fontSize: 56, fontWeight: 800, color: "#A78BFA", textAlign: "center", marginBottom: 8, fontFamily: "'Inter', sans-serif", lineHeight: 1 }}>
        {sense.n}
      </div>
      <CardTitle>{sense.label}</CardTitle>
      <CardBody>Take your time. Really look, listen, or feel.</CardBody>
      {isLast ? (
        <PillButton onClick={onDone} style={{ marginTop: 28 }}>Done ✓</PillButton>
      ) : (
        <PillButton onClick={() => setSenseIdx(i => i + 1)} style={{ marginTop: 28 }}>
          Next sense →
        </PillButton>
      )}
    </CardShell>
  );
}

function BreathCard() {
  const { phase, count, cycle, done } = useBoxBreath();
  const scale = PHASE_SCALES[phase];

  return (
    <CardShell accent="#818CF8">
      <CardLabel>Box Breathing</CardLabel>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24, marginTop: 8 }}>
        <div style={{
          width: 140, height: 140, borderRadius: "50%",
          backgroundColor: "#EAD7FF",
          border: "3px solid #A78BFA",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          transform: `scale(${scale})`,
          transition: "transform 1s ease-in-out",
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#818CF8", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>
            {PHASE_LABELS[phase]}
          </span>
          <span style={{ fontSize: 40, fontWeight: 800, color: "#6D28D9", fontFamily: "'Inter', sans-serif", lineHeight: 1 }}>
            {count}
          </span>
        </div>
      </div>
      <CardBody style={{ textAlign: "center" }}>
        {done ? "Beautiful. You can swipe on." : `Cycle ${cycle + 1} of 3 · breathe with the circle`}
      </CardBody>
      {!done && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: i < cycle ? "#A78BFA" : "#E9D5FF" }} />
          ))}
        </div>
      )}
    </CardShell>
  );
}

function ReframeCard() {
  return (
    <CardShell accent="#F472B6">
      <CardLabel>A Gentle Reframe</CardLabel>
      <div style={{ fontSize: 36, textAlign: "center", marginBottom: 20 }}>💜</div>
      <blockquote style={{ fontSize: 19, fontWeight: 600, color: "#2A2035", fontFamily: "'Playfair Display', serif", lineHeight: 1.6, textAlign: "center", margin: 0 }}>
        "This feeling is real.<br />It is also temporary.<br /><br />My body is trying to protect me,<br />and I am safe right now."
      </blockquote>
    </CardShell>
  );
}

function AffirmationCard({ text }) {
  return (
    <CardShell accent="#EC4899">
      <CardLabel>Affirmation</CardLabel>
      <div style={{ fontSize: 36, textAlign: "center", marginBottom: 24 }}>✨</div>
      <blockquote style={{ fontSize: 22, fontWeight: 700, color: "#2A2035", fontFamily: "'Playfair Display', serif", lineHeight: 1.6, textAlign: "center", margin: 0, padding: "0 8px" }}>
        "{text}"
      </blockquote>
    </CardShell>
  );
}

function BodyScanCard({ lines }) {
  const [step, setStep] = useState(0);
  const done = step >= lines.length;

  return (
    <CardShell accent="#34D399">
      <CardLabel>Body Scan</CardLabel>
      <div style={{ fontSize: 48, textAlign: "center", marginBottom: 20 }}>🫁</div>
      {done ? (
        <>
          <CardTitle>Well done.</CardTitle>
          <CardBody>Feel how much your body has softened.</CardBody>
        </>
      ) : (
        <>
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "#34D399", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>Step {step + 1} of {lines.length}</span>
          </div>
          <CardTitle style={{ textAlign: "center" }}>{lines[step]}</CardTitle>
          <PillButton onClick={() => setStep(s => s + 1)} style={{ marginTop: 28, backgroundColor: "#34D399" }}>
            Done ✓
          </PillButton>
        </>
      )}
    </CardShell>
  );
}

function TinyActionCard({ onDone }) {
  const [chosen, setChosen] = useState(null);
  return (
    <CardShell accent="#FBBF24">
      <CardLabel>One Small Step</CardLabel>
      <CardBody style={{ marginBottom: 20 }}>Which of these feels possible right now?</CardBody>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {TINY_ACTIONS.map(({ emoji, label }) => (
          <button key={label} onClick={() => setChosen(label)}
            style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 16,
              border: chosen === label ? "2px solid #FBBF24" : "2px solid #FEF3C7",
              backgroundColor: chosen === label ? "#FEF3C7" : "white",
              cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: "#2A2035",
              transition: "all 0.15s" }}>
            <span style={{ fontSize: 22 }}>{emoji}</span>
            {label}
          </button>
        ))}
      </div>
      {chosen && (
        <PillButton onClick={onDone} style={{ marginTop: 20, backgroundColor: "#FBBF24", color: "white" }}>
          I'll do that →
        </PillButton>
      )}
    </CardShell>
  );
}

function ClosingCard({ onRate, onClose }) {
  const [rating, setRating] = useState(null);
  return (
    <CardShell accent="#C084FC">
      <div style={{ fontSize: 48, textAlign: "center", marginBottom: 16 }}>🌸</div>
      <CardTitle>How do you feel now?</CardTitle>
      <CardBody style={{ marginBottom: 24 }}>1 = still struggling · 5 = much better</CardBody>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 24 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => setRating(n)}
            style={{ width: 52, height: 52, borderRadius: 14, border: "none", cursor: "pointer",
              fontSize: 16, fontWeight: 700, fontFamily: "'Inter', sans-serif",
              backgroundColor: rating === n ? "#C084FC" : "#EAD7FF",
              color: rating === n ? "white" : "#7C3AED",
              transition: "all 0.15s" }}>
            {n}
          </button>
        ))}
      </div>
      {rating && (
        <>
          <blockquote style={{ fontSize: 16, color: "#2A2035", fontFamily: "'Playfair Display', serif", lineHeight: 1.6, textAlign: "center", marginBottom: 24, fontStyle: "italic" }}>
            "You came back to yourself.<br />That's the whole thing."
          </blockquote>
          <PillButton onClick={() => { onRate(rating); onClose(); }}>
            I'm okay now 💜
          </PillButton>
        </>
      )}
    </CardShell>
  );
}

// ── Shared mini-components ───────────────────────────────────────────────
function CardShell({ children, accent }) {
  return (
    <div style={{
      width: "100%", minHeight: "100%", padding: "40px 28px 60px",
      display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "center",
    }}>
      {children}
    </div>
  );
}

function CardLabel({ children }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, color: "#9D7EC7", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "'Inter', sans-serif", textAlign: "center", marginBottom: 20 }}>
      {children}
    </p>
  );
}

function CardTitle({ children, style }) {
  return (
    <h2 style={{ fontSize: 24, fontWeight: 700, color: "#2A2035", fontFamily: "'Playfair Display', serif", lineHeight: 1.35, textAlign: "center", margin: "0 0 12px", ...style }}>
      {children}
    </h2>
  );
}

function CardBody({ children, style }) {
  return (
    <p style={{ fontSize: 16, color: "#6B5E7A", fontFamily: "'Inter', sans-serif", lineHeight: 1.7, textAlign: "center", margin: 0, ...style }}>
      {children}
    </p>
  );
}

function PillButton({ children, onClick, style }) {
  return (
    <button onClick={onClick} style={{
      display: "block", width: "100%", padding: "16px 24px", borderRadius: 9999,
      backgroundColor: "#C084FC", color: "white", border: "none", cursor: "pointer",
      fontSize: 15, fontWeight: 700, fontFamily: "'Inter', sans-serif",
      transition: "opacity 0.15s",
      ...style,
    }}>
      {children}
    </button>
  );
}

// ── Main CalmCards component ─────────────────────────────────────────────
export default function CalmCards({ userId, sessionId, panicLogId, onClose }) {
  const startTime = useRef(Date.now());
  const [cardIdx, setCardIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [groundingDone, setGroundingDone] = useState(false);
  const [actionDone, setActionDone] = useState(false);

  // Pick random affirmation and body scan once per session
  const affirmation = useRef(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);
  const bodyScanLines = useRef(BODY_SCANS[Math.floor(Math.random() * BODY_SCANS.length)]);

  const TOTAL_CARDS = 8;

  const goNext = () => {
    if (cardIdx < TOTAL_CARDS - 1) { setDirection(1); setCardIdx(i => i + 1); }
  };
  const goPrev = () => {
    if (cardIdx > 0) { setDirection(-1); setCardIdx(i => i - 1); }
  };

  const saveSession = async (resolvedRating) => {
    const durationSeconds = Math.round((Date.now() - startTime.current) / 1000);
    const updates = { cards_completed: cardIdx + 1, deck_type: "GUIDED", resolved_rating: resolvedRating, duration_seconds: durationSeconds, updated_at: new Date().toISOString() };
    if (sessionId) {
      await base44.entities.PanicSessions.update(sessionId, updates).catch(() => {});
    }
    if (panicLogId) {
      await base44.entities.PanicLog.update(panicLogId, { resolved_rating: resolvedRating }).catch(() => {});
    }
  };

  // Drag gesture
  const dragX = useRef(0);
  const handleDragEnd = (_, info) => {
    if (info.offset.x < -60) goNext();
    else if (info.offset.x > 60) goPrev();
  };

  const cards = [
    <WelcomeCard key="welcome" />,
    <GroundingCard key="grounding" onDone={goNext} />,
    <BreathCard key="breath" />,
    <ReframeCard key="reframe" />,
    <AffirmationCard key="affirmation" text={affirmation.current} />,
    <BodyScanCard key="bodyscan" lines={bodyScanLines.current} />,
    <TinyActionCard key="action" onDone={goNext} />,
    <ClosingCard key="closing" onRate={saveSession} onClose={onClose} />,
  ];

  return (
    <>
      {/* Backdrop */}
      <div style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: "#FAF5FF" }} />

      {/* Full-screen card */}
      <div style={{ position: "fixed", inset: 0, zIndex: 201, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top bar */}
        <div style={{ flexShrink: 0, padding: "16px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Progress dots */}
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            {Array.from({ length: TOTAL_CARDS }).map((_, i) => (
              <div key={i} style={{
                width: i === cardIdx ? 20 : 7, height: 7, borderRadius: 9999,
                backgroundColor: i <= cardIdx ? "#C084FC" : "#E9D5FF",
                transition: "all 0.3s ease",
              }} />
            ))}
          </div>
          {/* Skip / close */}
          <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#9D7EC7", fontFamily: "'Inter', sans-serif", padding: "6px 10px" }}>
            <X style={{ width: 14, height: 14 }} /> Skip
          </button>
        </div>

        {/* Card area */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={cardIdx}
              custom={direction}
              initial={{ x: direction * 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction * -320, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              style={{ position: "absolute", inset: 0, overflowY: "auto" }}
            >
              <div style={{ background: "linear-gradient(160deg, #FAF5FF 0%, #FFF0FA 100%)", minHeight: "100%", borderRadius: 24, margin: "0 12px" }}>
                {cards[cardIdx]}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom nav */}
        <div style={{ flexShrink: 0, padding: "12px 24px 32px", display: "flex", gap: 10 }}>
          {cardIdx > 0 && (
            <button onClick={goPrev} style={{ flex: 1, height: 50, borderRadius: 9999, backgroundColor: "#EAD7FF", color: "#7C3AED", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
              ← Back
            </button>
          )}
          {cardIdx < TOTAL_CARDS - 1 && (
            <button onClick={goNext} style={{ flex: 1, height: 50, borderRadius: 9999, backgroundColor: "#C084FC", color: "white", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
              Next →
            </button>
          )}
        </div>
      </div>
    </>
  );
}