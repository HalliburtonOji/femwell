import { useState, useEffect } from "react";
import { ArrowLeft, Check, X, Sparkles, Shield, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";

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

// Botanical divider matching Health / Journal pages
function Divider() {
  return (
    <div style={{ textAlign: "center", margin: "32px 0", opacity: 0.65 }} aria-hidden="true">
      <svg width="200" height="32" viewBox="0 0 200 32" fill="none">
        <line x1="0"   y1="16" x2="72"  y2="16" stroke="#D4AF37" strokeWidth="0.75" opacity="0.5" />
        <line x1="72"  y1="16" x2="82"  y2="8"  stroke="#8FAF8F" strokeWidth="0.75" opacity="0.6" />
        <line x1="72"  y1="16" x2="82"  y2="24" stroke="#8FAF8F" strokeWidth="0.75" opacity="0.6" />
        <ellipse cx="100" cy="16" rx="6" ry="12" fill="#8FAF8F" opacity="0.5"  transform="rotate(-30 100 16)" />
        <ellipse cx="100" cy="16" rx="6" ry="12" fill="#8FAF8F" opacity="0.35" transform="rotate(30 100 16)" />
        <circle  cx="100" cy="16" r="3"   fill="#D4AF37" opacity="0.8" />
        <line x1="118" y1="16" x2="128" y2="8"  stroke="#8FAF8F" strokeWidth="0.75" opacity="0.6" />
        <line x1="118" y1="16" x2="128" y2="24" stroke="#8FAF8F" strokeWidth="0.75" opacity="0.6" />
        <line x1="128" y1="16" x2="200" y2="16" stroke="#D4AF37" strokeWidth="0.75" opacity="0.5" />
        <circle cx="72"  cy="16" r="2" fill="#D4AF37" opacity="0.5" />
        <circle cx="128" cy="16" r="2" fill="#D4AF37" opacity="0.5" />
      </svg>
    </div>
  );
}

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
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>

      {/* Espresso sticky header */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#3A2C1A" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px" }}>
          <button
            onClick={() => window.history.back()}
            aria-label="Go back"
            style={{
              background: "rgba(244,237,219,0.12)", border: "1px solid rgba(244,237,219,0.22)",
              borderRadius: 8, width: 34, height: 34,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}
          >
            <ArrowLeft size={16} style={{ color: "#F4EDDB" }} />
          </button>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#F4EDDB", fontFamily: "Cormorant Garamond, Georgia, serif" }}>
              FemWell Plus
            </div>
            <div style={{ fontSize: 10, color: "rgba(244,237,219,0.5)", letterSpacing: 0.5, marginTop: 1, fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
              Unlock the full picture
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-8">

        {/* Hero letterhead */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            fontSize: 11, fontWeight: 700, letterSpacing: 2,
            textTransform: "uppercase", color: "#9B8B7A", marginBottom: 8,
          }}>
            FemWell Membership
          </div>
          {/* Thin gold rule */}
          <div aria-hidden="true" style={{ width: 48, height: 1, background: "#D4AF37", opacity: 0.4, margin: "0 auto 14px" }} />
          <h1 style={{
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontSize: "clamp(34px, 8vw, 52px)", fontWeight: 700, color: "#3A2C1A",
            textShadow: "0 1px 0 rgba(255,254,250,0.95), 0 -1px 1px rgba(18,12,6,0.6), 0 2px 3px rgba(40,30,18,0.22)",
            lineHeight: 1.15, margin: "0 0 10px",
          }}>
            FemWell Plus
          </h1>
          <p style={{
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontSize: 20, fontStyle: "italic", color: "#9B8B7A", fontWeight: 500,
          }}>
            Unlock the full picture of your health.
          </p>
        </div>

        {/* Plan cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 28 }}>

          {/* Free */}
          <div style={{
            background: "var(--surface)", border: "1px solid rgba(58,44,26,0.12)",
            borderRadius: 4, padding: "20px 18px",
            boxShadow: "0 2px 8px rgba(58,44,26,0.06)",
          }}>
            <div style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 22, fontWeight: 700, color: "#3A2C1A", marginBottom: 2 }}>Free</div>
            <div style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif", fontSize: 11, color: "#9B8B7A", marginBottom: 16, letterSpacing: 0.3 }}>Always free</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {["Cycle tracking", "Basic check-in", "2 programs", "5 AI messages/month"].map(f => (
                <li key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Check size={13} style={{ color: "#8FAF8F", flexShrink: 0 }} />
                  <span style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 15, color: "#9B8B7A" }}>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Plus — highlighted */}
          <div style={{
            background: "#3A2C1A", border: "2px solid #D4AF37",
            borderRadius: 4, padding: "20px 18px", position: "relative",
            boxShadow: "0 8px 28px rgba(58,44,26,0.28)",
          }}>
            <div style={{
              position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)",
              background: "#D4AF37", color: "#3A2C1A",
              borderRadius: 9999, padding: "2px 14px",
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              fontSize: 9, fontWeight: 700, whiteSpace: "nowrap", letterSpacing: 1,
            }}>
              MOST POPULAR
            </div>
            <div style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 22, fontWeight: 700, color: "#F4EDDB", marginBottom: 2 }}>Plus</div>
            <div style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif", fontSize: 13, fontWeight: 700, color: "#D4AF37", marginBottom: 2 }}>6.99 / month</div>
            <div style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif", fontSize: 10, color: "rgba(244,237,219,0.45)", marginBottom: 16 }}>or 49.99 / year</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {["Everything free", "All programs + condition tracks", "Unlimited AI coach", "Correlation insights", "Wearable data", "Lab tracker", "Doctor Export", "Partner mode"].map(f => (
                <li key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Check size={13} style={{ color: "#D4AF37", flexShrink: 0 }} />
                  <span style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 15, color: "rgba(244,237,219,0.9)" }}>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro — coming soon */}
          <div style={{
            background: "var(--surface)", border: "1px solid rgba(58,44,26,0.12)",
            borderRadius: 4, padding: "20px 18px", opacity: 0.55,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <div style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 22, fontWeight: 700, color: "#3A2C1A" }}>Pro</div>
              <span style={{
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                fontSize: 8, fontWeight: 700, color: "#9B8B7A",
                background: "rgba(58,44,26,0.08)", borderRadius: 9999,
                padding: "2px 8px", letterSpacing: 1,
              }}>COMING SOON</span>
            </div>
            <div style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif", fontSize: 11, color: "#9B8B7A", marginBottom: 16 }}>12.99 / month</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {["Everything Plus", "Priority support", "Early access features"].map(f => (
                <li key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Lock size={12} style={{ color: "#9B8B7A", flexShrink: 0 }} />
                  <span style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 15, color: "#9B8B7A" }}>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main CTA */}
        <button
          onClick={() => setShowModal(true)}
          style={{
            width: "100%", padding: "15px 16px",
            background: "#3A2C1A", color: "#F4EDDB",
            border: "1px solid #D4AF37", borderRadius: 4,
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontSize: 20, fontWeight: 700, cursor: "pointer",
            letterSpacing: 0.3, marginBottom: 32,
            boxShadow: "0 4px 14px rgba(58,44,26,0.22)",
          }}
        >
          Start 7-day free trial
        </button>

        <Divider />

        {/* Feature comparison table */}
        <div style={{
          background: "var(--surface)", border: "1px solid rgba(58,44,26,0.12)",
          borderRadius: 4, overflow: "hidden", marginBottom: 32,
          boxShadow: "0 2px 8px rgba(58,44,26,0.06)",
        }}>
          <div style={{
            padding: "14px 18px 10px", borderBottom: "1px solid rgba(58,44,26,0.08)",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#9B8B7A",
          }}>
            What is included in Plus
          </div>
          {FEATURES.map((row, i) => (
            <div key={row.label} style={{
              display: "flex", alignItems: "center", padding: "11px 18px",
              borderBottom: i < FEATURES.length - 1 ? "1px solid rgba(58,44,26,0.06)" : "none",
              backgroundColor: i % 2 === 0 ? "transparent" : "var(--ivory)",
            }}>
              <span style={{ flex: 1, fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 17, color: "#3A2C1A", fontWeight: 500 }}>{row.label}</span>
              <div style={{ display: "flex", gap: 40 }}>
                <span style={{ width: 40, textAlign: "center" }}>
                  {row.free ? <Check size={14} style={{ color: "#8FAF8F", display: "inline" }} /> : <X size={13} style={{ color: "rgba(58,44,26,0.2)", display: "inline" }} />}
                </span>
                <span style={{ width: 40, textAlign: "center" }}>
                  {row.plus ? <Check size={14} style={{ color: "#D4AF37", display: "inline" }} /> : <X size={13} style={{ color: "rgba(58,44,26,0.2)", display: "inline" }} />}
                </span>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", padding: "8px 18px 10px", justifyContent: "flex-end" }}>
            <div style={{ display: "flex", gap: 40 }}>
              <span style={{ width: 40, textAlign: "center", fontFamily: "ui-sans-serif, system-ui, sans-serif", fontSize: 10, fontWeight: 700, color: "#9B8B7A" }}>Free</span>
              <span style={{ width: 40, textAlign: "center", fontFamily: "ui-sans-serif, system-ui, sans-serif", fontSize: 10, fontWeight: 700, color: "#D4AF37" }}>Plus</span>
            </div>
          </div>
        </div>

        {/* Trust signals */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, marginBottom: 40 }}>
          {TRUST.map(t => (
            <div key={t} style={{
              display: "flex", alignItems: "center", gap: 7,
              background: "var(--surface)", border: "1px solid rgba(58,44,26,0.12)",
              borderRadius: 9999, padding: "6px 14px",
            }}>
              <Shield size={11} style={{ color: "#8FAF8F" }} />
              <span style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif", fontSize: 11, fontWeight: 600, color: "#3A2C1A" }}>{t}</span>
            </div>
          ))}
        </div>

        {/* Legal disclaimer */}
        <p style={{
          fontFamily: "Cormorant Garamond, Georgia, serif",
          fontSize: 13, fontStyle: "italic", color: "#9B8B7A",
          textAlign: "center", lineHeight: 1.7, marginBottom: 20,
        }}>
          Prices shown in GBP. Cancel any time before your trial ends and you will not be charged.
        </p>
      </div>

      {/* Waitlist modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60 }}>
          <div
            onClick={() => { setShowModal(false); setJoinedWaitlist(false); }}
            style={{ position: "absolute", inset: 0, backgroundColor: "rgba(58,44,26,0.6)", backdropFilter: "blur(6px)" }}
          />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "var(--surface)", borderRadius: "18px 18px 0 0",
            padding: "28px 24px", paddingBottom: "calc(28px + env(safe-area-inset-bottom, 0))",
          }}>
            {/* Handle */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <div style={{ width: 36, height: 4, borderRadius: 9999, background: "rgba(58,44,26,0.15)" }} />
            </div>
            {/* Sparkles chip */}
            <div style={{
              width: 50, height: 50, borderRadius: 14, background: "rgba(212,175,55,0.1)",
              border: "1px solid rgba(212,175,55,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 18px",
            }}>
              <Sparkles size={22} style={{ color: "#D4AF37" }} />
            </div>
            {joinedWaitlist ? (
              <>
                <h3 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 26, fontWeight: 700, color: "#3A2C1A", textAlign: "center", marginBottom: 8 }}>
                  You are on the list
                </h3>
                <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 18, fontStyle: "italic", color: "#9B8B7A", textAlign: "center", lineHeight: 1.65, marginBottom: 24 }}>
                  We will notify you the moment Plus launches. Early members get a special discount.
                </p>
                <button
                  onClick={() => { setShowModal(false); setJoinedWaitlist(false); }}
                  style={{ width: "100%", padding: "14px", background: "#3A2C1A", color: "#F4EDDB", border: "1px solid #D4AF37", borderRadius: 4, fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 18, fontWeight: 700, cursor: "pointer" }}
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <h3 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 26, fontWeight: 700, color: "#3A2C1A", textAlign: "center", marginBottom: 8 }}>
                  Plus is launching soon
                </h3>
                <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 18, fontStyle: "italic", color: "#9B8B7A", textAlign: "center", lineHeight: 1.65, marginBottom: 22 }}>
                  Join the waitlist and we will notify you first. Early members get a special discount.
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  style={{
                    width: "100%", padding: "12px 14px",
                    border: "1px solid rgba(58,44,26,0.2)", borderRadius: 4,
                    background: "var(--ivory)", fontFamily: "Cormorant Garamond, Georgia, serif",
                    fontSize: 17, color: "#3A2C1A", outline: "none",
                    boxSizing: "border-box", marginBottom: 12,
                  }}
                />
                <button
                  onClick={handleJoinWaitlist}
                  disabled={!email.trim() || savingWaitlist}
                  style={{
                    width: "100%", padding: "14px",
                    background: "#3A2C1A", color: "#F4EDDB",
                    border: "1px solid #D4AF37", borderRadius: 4,
                    fontFamily: "Cormorant Garamond, Georgia, serif",
                    fontSize: 18, fontWeight: 700, cursor: "pointer",
                    opacity: !email.trim() || savingWaitlist ? 0.55 : 1,
                  }}
                >
                  {savingWaitlist ? "Joining..." : "Join waitlist"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}