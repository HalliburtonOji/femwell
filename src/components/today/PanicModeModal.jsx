import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import CalmCards from "./CalmCards";
import PreviousPanicSessions from "./PreviousPanicSessions";
import { getCyclePhaseOrNull } from "@/utils/cyclePhase";

const PANIC_CONTENT_MAP = {
  panic:     ["box-breathing", "4-7-8-breathing", "grounding-calm"],
  anxiety:   ["coherent-breathing", "anxiety-reset", "3-minute-breathing-space"],
  overwhelm: ["downshift-breathing", "grounding-calm", "body-scan-reset"],
  anger:     ["4-7-8-breathing", "coherent-breathing", "alternate-nostril-breathing"],
  sadness:   ["self-compassion", "pms-kindness", "body-scan-deep"],
};

const FEELINGS = ["panic", "anxiety", "overwhelm", "anger", "sadness"];

const GROUNDING_STEPS = [
  { n: 5, sense: "see", label: "Name 5 things you can see" },
  { n: 4, sense: "touch", label: "Name 4 things you can touch" },
  { n: 3, sense: "hear", label: "Name 3 things you can hear" },
  { n: 2, sense: "smell", label: "Name 2 things you can smell" },
  { n: 1, sense: "taste", label: "Name 1 thing you can taste" },
];

export default function PanicModeModal({ userId, onClose }) {
  const [intensity, setIntensity] = useState(3);
  const [feeling, setFeeling] = useState("anxiety");
  const [step, setStep] = useState("form"); // form | offer | grounding | followup | calmcards
  const [saving, setSaving] = useState(false);
  const [suggestedContent, setSuggestedContent] = useState([]);
  const [panicSessionId, setPanicSessionId] = useState(null);
  const [followupRating, setFollowupRating] = useState(null);
  const [sessionStartedAt, setSessionStartedAt] = useState(null);
  const [profile, setProfile] = useState(null);
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!userId) return;
    base44.entities.UserProfile.filter({ user_id: userId })
      .then(rows => setProfile(rows[0] || null))
      .catch(() => {});
  }, [userId]);

  const handleLog = async (goToCalmCards = false) => {
    setSaving(true);

    const contentKeys = PANIC_CONTENT_MAP[feeling] || PANIC_CONTENT_MAP.anxiety;
    const allContent = await base44.entities.ContentItems.list('-created_date', 50).catch(() => []);
    const matched = allContent
      .filter(c => contentKeys.some(k => (c.content_key || '').includes(k) || (c.title || '').toLowerCase().includes(k.replace(/-/g, ' '))))
      .slice(0, 2);
    setSuggestedContent(matched);

    const startedAt = new Date().toISOString();
    setSessionStartedAt(startedAt);

    // Phase captured only when status==='ok'; null otherwise — never fabricated.
    const cyclePhaseAtSession = getCyclePhaseOrNull(profile);

    // TODO: dead — PanicLog entity is deprecated. All writes consolidated to PanicSessions.
    //       Schema is kept readable for legacy reads only; drop in next cleanup round.
    const session = await base44.entities.PanicSessions.create({
      user_id: userId,
      day_key: todayStr,
      logged_at: startedAt,
      started_at: startedAt,
      intensity,
      feeling_type: feeling,
      trigger_tags: [feeling],
      techniques_used: goToCalmCards ? ["calm_cards", ...contentKeys] : ["grounding_54321", ...contentKeys],
      deck_type: goToCalmCards ? "GUIDED" : "NONE",
      cycle_phase_at_session: cyclePhaseAtSession,
    }).catch(() => null);

    if (session?.id) setPanicSessionId(session.id);
    setSaving(false);
    toast.success("Logged. You are doing the right thing by noticing this.");
    setStep(goToCalmCards ? "calmcards" : "grounding");
  };

  const handleFollowupRating = async (rating) => {
    setFollowupRating(rating);
    if (panicSessionId) {
      const endedAt = new Date().toISOString();
      const durationSeconds = sessionStartedAt
        ? Math.round((new Date(endedAt) - new Date(sessionStartedAt)) / 1000)
        : null;
      await base44.entities.PanicSessions.update(panicSessionId, {
        post_session_rating: rating,
        resolved_rating: rating, // keep legacy field in sync
        ended_at: endedAt,
        duration_seconds: durationSeconds,
      }).catch(() => {});
    }
    onClose();
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 95, backgroundColor: "rgba(42,32,53,0.45)", backdropFilter: "blur(8px)" }} />
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 96, backgroundColor: "var(--surface)", borderRadius: "28px 28px 0 0", maxHeight: "92vh", overflowY: "auto", boxShadow: "var(--shadow-lg)" }}>
        <style>{`@keyframes breath-in{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}`}</style>
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 14, paddingBottom: 8 }}>
          <div style={{ width: 32, height: 4, borderRadius: 9999, backgroundColor: "var(--border)" }} />
        </div>
        <div style={{ padding: "8px 20px 40px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <AlertCircle className="w-5 h-5" style={{ color: "var(--rose-dust)" }} />
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--plum)", margin: 0 }}>Panic mode</h2>
            </div>
            <button onClick={onClose} aria-label="Close panic mode" style={{ width: 44, height: 44, borderRadius: 9999, backgroundColor: "var(--ivory-dark)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X className="w-4 h-4" style={{ color: "var(--mauve)" }} aria-hidden="true" />
            </button>
          </div>

          {step === "form" && (
            <>
              <p style={{ fontSize: 13, color: "var(--mauve)", lineHeight: 1.6, marginBottom: 20, }}>
                You are safe. Let's slow things down together.
              </p>

              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mauve)", marginBottom: 10 }}>Intensity</p>
                <div style={{ display: "flex", gap: 8 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setIntensity(n)}
                      style={{ flex: 1, height: 44, borderRadius: 12, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, backgroundColor: intensity === n ? "var(--rose-dust)" : "var(--ivory-dark)",
                        color: intensity === n ? "white" : "var(--mauve)" }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mauve)", marginBottom: 10 }}>What is happening</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {FEELINGS.map(f => (
                    <button key={f} onClick={() => setFeeling(f)}
                      style={{ padding: "8px 16px", borderRadius: 9999, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, textTransform: "capitalize",
                        backgroundColor: feeling === f ? "var(--plum)" : "var(--ivory-dark)",
                        color: feeling === f ? "white" : "var(--mauve)" }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={() => setStep("offer")}
                  aria-label="Continue to next step"
                  style={{ height: 52, borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", }}>
                  Continue →
                </button>
              </div>

              <PreviousPanicSessions userId={userId} />
            </>
          )}

          {step === "offer" && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🌿</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--plum)", marginBottom: 10 }}>Would you like a moment?</h3>
              <p style={{ fontSize: 14, color: "var(--mauve)", lineHeight: 1.65, marginBottom: 28 }}>
                The Calm Cards guide you through grounding, breathwork, and a gentle reframe — usually about 5 minutes.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={() => handleLog(true)} disabled={saving}
                  style={{ height: 56, borderRadius: 9999, backgroundColor: "#C084FC", color: "white", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
                  {saving ? "One sec…" : "Yes, guide me 💜"}
                </button>
                <button onClick={() => handleLog(false)} disabled={saving}
                  style={{ height: 48, borderRadius: 9999, backgroundColor: "transparent", color: "var(--mauve)", fontSize: 13, fontWeight: 600, border: "1px solid var(--border)", cursor: "pointer", }}>
                  No, just log it
                </button>
              </div>
            </div>
          )}

          {step === "calmcards" && (
            <CalmCards userId={userId} sessionId={panicSessionId} onClose={onClose} />
          )}

          {step === "grounding" && (
            <>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", backgroundColor: "var(--rose-dust-subtle)", border: "2px solid var(--rose-dust-light)", margin: "0 auto 16px", animation: "breath-in 4s ease-in-out infinite", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "var(--rose-dust)", }}>Breathe</p>
                </div>
                <p style={{ fontSize: 13, color: "var(--mauve)", }}>Inhale 4s — hold 4s — exhale 6s</p>
              </div>

              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--plum)", marginBottom: 14 }}>5-4-3-2-1 grounding</p>
              {GROUNDING_STEPS.map(({ n, label }) => (
                <div key={n} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12, padding: "12px 14px", borderRadius: 14, backgroundColor: "var(--ivory)", border: "1px solid var(--border-subtle)" }}>
                  <span style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "var(--rose-dust)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0, }}>{n}</span>
                  <p style={{ fontSize: 13, color: "var(--plum)", lineHeight: 1.5, marginTop: 4 }}>{label}</p>
                </div>
              ))}

              {/* Suggested content for this feeling */}
              {suggestedContent.length > 0 && (
                <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: 16, backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "var(--rose-dust)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Might help right now
                  </p>
                  {suggestedContent.map(item => (
                    <a key={item.id} href={createPageUrl(`ContentPlayer?key=${item.content_key}`)} onClick={onClose}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", marginBottom: 6, borderRadius: 12, backgroundColor: "var(--surface)", border: "1px solid var(--border)", textDecoration: "none" }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", }}>{item.title}</p>
                        <p style={{ fontSize: 11, color: "var(--mauve)", }}>{item.content_type?.toLowerCase()} · {item.duration_minutes || 5} min</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {intensity >= 4 && (
                <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 14, backgroundColor: "#FFF8EE", border: "1px solid #F5DFA8" }}>
                  <p style={{ fontSize: 12, color: "#7A5A20", lineHeight: 1.6 }}>
                    {intensity === 5
                      ? "If you need immediate support, consider talking to a professional. You don't have to go through this alone."
                      : "If you're feeling overwhelmed, it's okay to reach out to someone you trust."}
                  </p>
                </div>
              )}

              <button onClick={() => setStep("followup")}
                style={{ width: "100%", height: 52, marginTop: 16, borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", }}>
                Done — I feel calmer
              </button>
            </>
          )}

          {step === "followup" && (
            <>
              <p style={{ fontSize: 16, fontWeight: 700, color: "var(--plum)", marginBottom: 8 }}>How are you feeling now?</p>
              <p style={{ fontSize: 13, color: "var(--mauve)", marginBottom: 20 }}>Take a moment to check in with yourself.</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => handleFollowupRating(n)}
                    style={{ flex: 1, height: 48, borderRadius: 12, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, backgroundColor: followupRating === n ? "var(--rose-dust)" : "var(--ivory-dark)",
                      color: followupRating === n ? "white" : "var(--mauve)" }}>
                    {n}
                  </button>
                ))}
              </div>
              <button onClick={onClose}
                style={{ width: "100%", height: 48, borderRadius: 9999, backgroundColor: "transparent", color: "var(--mauve)", fontSize: 13, fontWeight: 600, border: "1px solid var(--border)", cursor: "pointer", }}>
                Skip
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}