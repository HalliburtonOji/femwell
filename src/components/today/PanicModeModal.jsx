import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

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
  const [step, setStep] = useState("form"); // form | grounding
  const [saving, setSaving] = useState(false);
  const todayStr = new Date().toISOString().split("T")[0];

  const handleLog = async () => {
    setSaving(true);
    await Promise.all([
      base44.entities.PanicSessions.create({
        user_id: userId,
        day_key: todayStr,
        logged_at: new Date().toISOString(),
        intensity,
        feeling_type: feeling,
      }).catch(() => {}),
      base44.entities.PanicLog.create({
        user_id: userId,
        timestamp: new Date().toISOString(),
        feeling_type: feeling,
        intensity,
        trigger: feeling,
        actions_taken: ["grounding"],
      }).catch(() => {}),
    ]);
    setSaving(false);
    toast.success("Logged. You are doing the right thing by noticing this.");
    setStep("grounding");
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
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--plum)", fontFamily: "'Playfair Display', serif", margin: 0 }}>Panic mode</h2>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9999, backgroundColor: "var(--ivory-dark)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X className="w-4 h-4" style={{ color: "var(--mauve)" }} />
            </button>
          </div>

          {step === "form" && (
            <>
              <p style={{ fontSize: 13, color: "var(--mauve)", lineHeight: 1.6, marginBottom: 20, fontFamily: "'Inter', sans-serif" }}>
                You are safe. Let's slow things down together.
              </p>

              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 10 }}>Intensity</p>
                <div style={{ display: "flex", gap: 8 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setIntensity(n)}
                      style={{ flex: 1, height: 44, borderRadius: 12, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "'Inter', sans-serif",
                        backgroundColor: intensity === n ? "var(--rose-dust)" : "var(--ivory-dark)",
                        color: intensity === n ? "white" : "var(--mauve)" }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 10 }}>What is happening</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {FEELINGS.map(f => (
                    <button key={f} onClick={() => setFeeling(f)}
                      style={{ padding: "8px 16px", borderRadius: 9999, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif", textTransform: "capitalize",
                        backgroundColor: feeling === f ? "var(--plum)" : "var(--ivory-dark)",
                        color: feeling === f ? "white" : "var(--mauve)" }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={handleLog} disabled={saving}
                  style={{ height: 52, borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", opacity: saving ? 0.6 : 1 }}>
                  {saving ? "Logging..." : "Log and continue to grounding"}
                </button>
                <a href={createPageUrl("ContentPlayer") + "?type=BREATHWORK"} onClick={onClose}
                  style={{ height: 52, borderRadius: 9999, backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", fontSize: 14, fontWeight: 600, border: "1px solid var(--rose-dust-light)", cursor: "pointer", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                  Open calming session
                </a>
              </div>
            </>
          )}

          {step === "grounding" && (
            <>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", backgroundColor: "var(--rose-dust-subtle)", border: "2px solid var(--rose-dust-light)", margin: "0 auto 16px", animation: "breath-in 4s ease-in-out infinite", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>Breathe</p>
                </div>
                <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Inhale 4s — hold 4s — exhale 6s</p>
              </div>

              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--plum)", fontFamily: "'Inter', sans-serif", marginBottom: 14 }}>5-4-3-2-1 grounding</p>
              {GROUNDING_STEPS.map(({ n, label }) => (
                <div key={n} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12, padding: "12px 14px", borderRadius: 14, backgroundColor: "var(--ivory)", border: "1px solid var(--border-subtle)" }}>
                  <span style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "var(--rose-dust)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0, fontFamily: "'Inter', sans-serif" }}>{n}</span>
                  <p style={{ fontSize: 13, color: "var(--plum)", lineHeight: 1.5, fontFamily: "'Inter', sans-serif", marginTop: 4 }}>{label}</p>
                </div>
              ))}

              <button onClick={onClose}
                style={{ width: "100%", height: 52, marginTop: 16, borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                Done — I feel calmer
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}