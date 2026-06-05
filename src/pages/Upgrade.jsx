import { useState, useEffect } from "react";
import { ArrowLeft, Check, X, Sparkles, Shield, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";

const sLabel = { fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" };

const FEATURES = [
  { label: "Cycle tracking",       free: true,  plus: true  },
  { label: "All programs",         free: false, plus: true  },
  { label: "Condition tracks",     free: false, plus: true  },
  { label: "Unlimited AI coach",   free: false, plus: true  },
  { label: "Wearable data",        free: false, plus: true  },
  { label: "Lab tracker",          free: false, plus: true  },
  { label: "Doctor Export",        free: false, plus: true  },
  { label: "Partner mode",         free: false, plus: true  },
];

const TRUST = ["No ads", "Cancel anytime", "Your data never sold", "GDPR compliant"];

export default function Upgrade() {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [joinedWaitlist, setJoinedWaitlist] = useState(false);
  const [savingWaitlist, setSavingWaitlist] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => { if (u?.email) setEmail(u.email); }).catch(() => {});
  }, []);

  const handleJoinWaitlist = async () => {
    if (!email.trim() || savingWaitlist) return;
    setSavingWaitlist(true);
    await base44.entities.NotificationLog.create({
      notification_type: "waitlist",
      body: email.trim(),
      created_at: new Date().toISOString(),
    }).catch(() => {});
    setJoinedWaitlist(true);
    setSavingWaitlist(false);
  };

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="max-w-2xl mx-auto px-4">

        {/* Back */}
        <div className="pt-12 pb-6 flex items-center gap-3">
          <button onClick={() => window.history.back()} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer" }}>
            <ArrowLeft style={{ width: 16, height: 16, color: "var(--plum)" }} />
          </button>
        </div>

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)" }}>
            <Sparkles className="w-6 h-6" style={{ color: "var(--rose-dust)" }} />
          </div>
          <h1 className="fw-display">FemWell Plus</h1>
          <p style={{ fontSize: 15, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 8 }}>Unlock the full picture of your health.</p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">

          {/* Free */}
          <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 20 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--plum)", fontFamily: "'Fraunces', serif", marginBottom: 4 }}>Free</p>
            <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 16 }}>Always free</p>
            <ul className="space-y-2">
              {["Cycle tracking", "Basic check-in", "2 programs", "5 AI messages/month"].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <Check style={{ width: 14, height: 14, color: "var(--sage)", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Plus — highlighted */}
          <div style={{ backgroundColor: "var(--plum)", border: "2px solid var(--rose-dust)", borderRadius: 20, padding: 20, position: "relative" }}>
            <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", backgroundColor: "var(--rose-dust)", color: "white", borderRadius: 9999, padding: "2px 12px", fontSize: 10, fontWeight: 700, fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap" }}>
              Most popular
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "white", fontFamily: "'Fraunces', serif", marginBottom: 2 }}>Plus</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--rose-dust-light)", fontFamily: "'Inter', sans-serif", marginBottom: 2 }}>£6.99/month</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif", marginBottom: 16 }}>or £49.99/year</p>
            <ul className="space-y-2">
              {["Everything free", "All programs + condition tracks", "Unlimited AI coach", "Correlation insights", "Wearable data", "Lab tracker", "Doctor Export", "Partner mode"].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <Check style={{ width: 14, height: 14, color: "var(--rose-dust-light)", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", fontFamily: "'Inter', sans-serif" }}>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro — coming soon */}
          <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 20, opacity: 0.6 }}>
            <div className="flex items-center gap-2 mb-1">
              <p style={{ fontSize: 16, fontWeight: 700, color: "var(--plum)", fontFamily: "'Fraunces', serif" }}>Pro</p>
              <span style={{ fontSize: 9, fontWeight: 700, color: "var(--mauve)", backgroundColor: "var(--ivory-dark)", borderRadius: 9999, padding: "2px 8px", fontFamily: "'Inter', sans-serif" }}>COMING SOON</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 16 }}>£12.99/month</p>
            <ul className="space-y-2">
              {["Everything Plus", "Priority support", "Early access features"].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <Lock style={{ width: 13, height: 13, color: "var(--mauve)", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main CTA */}
        <button
          onClick={() => setShowModal(true)}
          style={{ width: "100%", padding: "16px", borderRadius: 16, backgroundColor: "var(--plum)", color: "white", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", marginBottom: 32, boxShadow: "var(--shadow-md)" }}
        >
          Start 7-day free trial
        </button>

        {/* Feature comparison */}
        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden", marginBottom: 32 }}>
          <div style={{ padding: "14px 18px 10px", borderBottom: "1px solid var(--border-subtle)" }}>
            <p style={sLabel}>What's included in Plus</p>
          </div>
          {FEATURES.map((row, i) => (
            <div key={row.label} style={{ display: "flex", alignItems: "center", padding: "11px 18px", borderBottom: i < FEATURES.length - 1 ? "1px solid var(--border-subtle)" : "none", backgroundColor: i % 2 === 0 ? "transparent" : "var(--ivory)" }}>
              <span style={{ flex: 1, fontSize: 13, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{row.label}</span>
              <div style={{ display: "flex", gap: 40 }}>
                <span style={{ width: 40, textAlign: "center" }}>
                  {row.free ? <Check style={{ width: 15, height: 15, color: "var(--sage)", display: "inline" }} /> : <X style={{ width: 14, height: 14, color: "var(--border)", display: "inline" }} />}
                </span>
                <span style={{ width: 40, textAlign: "center" }}>
                  {row.plus ? <Check style={{ width: 15, height: 15, color: "var(--rose-dust)", display: "inline" }} /> : <X style={{ width: 14, height: 14, color: "var(--border)", display: "inline" }} />}
                </span>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", padding: "8px 18px 10px", justifyContent: "flex-end" }}>
            <div style={{ display: "flex", gap: 40 }}>
              <span style={{ width: 40, textAlign: "center", fontSize: 10, fontWeight: 600, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Free</span>
              <span style={{ width: 40, textAlign: "center", fontSize: 10, fontWeight: 600, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>Plus</span>
            </div>
          </div>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {TRUST.map(t => (
            <div key={t} className="flex items-center gap-1.5" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 9999, padding: "6px 14px" }}>
              <Shield style={{ width: 12, height: 12, color: "var(--sage)" }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{t}</span>
            </div>
          ))}
        </div>

      </div>

      {/* Waitlist modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60 }}>
          <div onClick={() => { setShowModal(false); setJoinedWaitlist(false); }} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(42,32,53,0.5)", backdropFilter: "blur(6px)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "var(--surface)", borderRadius: "28px 28px 0 0", padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <div style={{ width: 36, height: 4, borderRadius: 9999, backgroundColor: "var(--border)" }} />
            </div>
            <div style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: "var(--rose-dust-subtle)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Sparkles style={{ width: 22, height: 22, color: "var(--rose-dust)" }} />
            </div>
            {joinedWaitlist ? (
              <>
                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--plum)", textAlign: "center", marginBottom: 8 }}>You're on the list!</h3>
                <p style={{ fontSize: 14, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", textAlign: "center", lineHeight: 1.65, marginBottom: 24 }}>
                  We'll notify you the moment Plus launches. Early members get a special discount.
                </p>
                <button onClick={() => { setShowModal(false); setJoinedWaitlist(false); }} style={{ width: "100%", padding: "13px", borderRadius: 12, backgroundColor: "var(--plum)", color: "white", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                  Done
                </button>
              </>
            ) : (
              <>
                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--plum)", textAlign: "center", marginBottom: 8 }}>Plus is launching soon</h3>
                <p style={{ fontSize: 14, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", textAlign: "center", lineHeight: 1.65, marginBottom: 20 }}>
                  Join the waitlist and we'll notify you first. Early members get a special discount.
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid var(--border)", backgroundColor: "var(--ivory)", fontSize: 14, fontFamily: "'Inter', sans-serif", color: "var(--plum)", outline: "none", boxSizing: "border-box", marginBottom: 12 }}
                />
                <button onClick={handleJoinWaitlist} disabled={!email.trim() || savingWaitlist}
                  style={{ width: "100%", padding: "13px", borderRadius: 12, backgroundColor: "var(--plum)", color: "white", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", opacity: !email.trim() || savingWaitlist ? 0.6 : 1 }}>
                  {savingWaitlist ? "Joining…" : "Join waitlist"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}