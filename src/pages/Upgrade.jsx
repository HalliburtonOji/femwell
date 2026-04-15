import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Check, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

const TIERS = {
  free: {
    name: "Free",
    price: "£0",
    priceYearly: null,
    period: "/month",
    features: ["Cycle tracking", "Daily check-in", "3 programs", "Basic insights", "Lifestyle feed"],
    highlight: false,
    cta: null,
  },
  plus: {
    name: "Plus",
    price: "£4.99",
    priceYearly: "£39.99",
    period: "/month",
    features: [
      "Everything in Free",
      "Unlimited programs",
      "AI coach (unlimited)",
      "Advanced insights & correlations",
      "Partner mode",
      "Period predictions",
      "Community access",
    ],
    highlight: true,
    badge: "Most popular",
    cta: "Start 7-day free trial",
  },
  pro: {
    name: "Pro",
    price: "£9.99",
    priceYearly: "£79.99",
    period: "/month",
    features: [
      "Everything in Plus",
      "Pregnancy & menopause modules",
      "Doctor export (PDF)",
      "Priority support",
      "Audio meditations",
      "Story images (AI)",
    ],
    highlight: false,
    cta: "Start 7-day free trial",
  },
};

const COMPARISON = [
  { feature: "Cycle tracking", free: true, plus: true, pro: true },
  { feature: "Daily check-in", free: true, plus: true, pro: true },
  { feature: "Programs (max)", free: "3", plus: "Unlimited", pro: "Unlimited" },
  { feature: "AI coach", free: "5 msg/day", plus: "Unlimited", pro: "Unlimited" },
  { feature: "Insights", free: "Basic", plus: "Advanced", pro: "Advanced" },
  { feature: "Period predictions", free: false, plus: true, pro: true },
  { feature: "Partner mode", free: false, plus: true, pro: true },
  { feature: "Pregnancy module", free: false, plus: false, pro: true },
  { feature: "Menopause module", free: false, plus: false, pro: true },
  { feature: "Doctor export PDF", free: false, plus: false, pro: true },
  { feature: "Audio meditations", free: false, plus: false, pro: true },
];

const TESTIMONIALS = [
  { quote: "FemWell Plus genuinely changed how I understand my cycle. Worth every penny.", name: "Sarah M.", location: "London" },
  { quote: "The AI coach helped me identify my luteal phase anxiety — I feel so much more in control.", name: "Priya K.", location: "Manchester" },
  { quote: "I switched from a £15/month app. FemWell Plus is better and half the price.", name: "Chloe T.", location: "Bristol" },
];

const FAQS = [
  { q: "Can I cancel anytime?", a: "Yes — cancel with one tap from your profile. You'll keep access until the end of your billing period. No questions asked." },
  { q: "What happens to my data if I downgrade?", a: "Your data is always yours. Downgrading to Free keeps all your historical logs intact — you just lose access to premium features." },
  { q: "Is my health data private?", a: "Absolutely. FemWell never sells or shares your personal health data. Data is encrypted at rest and in transit. You can export or delete your data at any time." },
  { q: "Is there a free trial?", a: "Yes — Plus and Pro both include a 7-day free trial. Cancel anytime during the trial and you won't be charged." },
];

const sLabel = { fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" };

export default function Upgrade() {
  const [user, setUser] = useState(null);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [loading, setLoading] = useState(false);
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const ents = await base44.entities.Entitlements.filter({ user_id: u.id });
      if (ents[0]) setCurrentPlan(ents[0].plan || "free");
    })();
  }, []);

  const handleUpgrade = async (planId) => {
    if (planId === "free" || planId === currentPlan) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("stripeCheckout", {
        plan: planId,
        billing: annual ? "annual" : "monthly",
        success_url: window.location.origin + createPageUrl("Today"),
        cancel_url: window.location.href,
      });
      if (res.data?.url) window.location.href = res.data.url;
    } catch {
      alert("Unable to start checkout. Please try again.");
    }
    setLoading(false);
  };

  const tierList = Object.entries(TIERS);

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="max-w-2xl mx-auto px-4">

        {/* Back */}
        <div className="pt-12 pb-6 flex items-center gap-3">
          <button onClick={() => window.history.back()} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer" }}>
            <ArrowLeft style={{ width: 16, height: 16, color: "var(--plum)" }} />
          </button>
          <div>
            <p style={sLabel}>Subscription</p>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)" }}>
            <Sparkles className="w-6 h-6" style={{ color: "var(--rose-dust)" }} />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: "var(--plum)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>Invest in yourself 🌿</h1>
          <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 8 }}>Trusted by thousands of women tracking their health</p>
        </div>

        {/* Annual / Monthly toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-1 p-1 rounded-2xl" style={{ backgroundColor: "var(--ivory-dark)", border: "1px solid var(--border)" }}>
            <button onClick={() => setAnnual(false)}
              style={{ borderRadius: 12, padding: "8px 20px", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif",
                backgroundColor: !annual ? "var(--plum)" : "transparent",
                color: !annual ? "white" : "var(--mauve)" }}>Monthly</button>
            <button onClick={() => setAnnual(true)}
              style={{ borderRadius: 12, padding: "8px 20px", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 6,
                backgroundColor: annual ? "var(--plum)" : "transparent",
                color: annual ? "white" : "var(--mauve)" }}>
              Annual
              <span style={{ fontSize: 10, fontWeight: 700, backgroundColor: "var(--rose-dust)", color: "white", borderRadius: 9999, padding: "2px 7px" }}>Save 33%</span>
            </button>
          </div>
        </div>

        {/* Tier cards */}
        <div className="space-y-4 mb-10">
          {tierList.map(([id, tier]) => {
            const isActive = currentPlan === id;
            const displayPrice = annual && tier.priceYearly ? tier.priceYearly : tier.price;
            const displayPeriod = annual && tier.priceYearly ? "/year" : tier.period;
            return (
              <div key={id} style={{
                backgroundColor: "var(--surface)",
                border: tier.highlight ? "2px solid var(--rose-dust)" : "1px solid var(--border)",
                borderRadius: 24,
                boxShadow: tier.highlight ? "0 0 0 4px rgba(196,132,154,0.12), var(--shadow-md)" : "var(--shadow-sm)",
                overflow: "hidden",
                position: "relative",
              }}>
                {tier.badge && (
                  <div style={{ position: "absolute", top: 16, right: 16, backgroundColor: "var(--rose-dust)", color: "white", borderRadius: 9999, padding: "3px 10px", fontSize: 10, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
                    {tier.badge}
                  </div>
                )}
                <div style={{ padding: "20px 20px 0" }}>
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <p style={{ fontSize: 18, fontWeight: 700, color: "var(--plum)", fontFamily: "'Playfair Display', serif" }}>{tier.name}</p>
                      {isActive && <span style={{ fontSize: 10, fontWeight: 600, color: "var(--sage)", backgroundColor: "var(--sage-subtle)", borderRadius: 9999, padding: "2px 8px", fontFamily: "'Inter', sans-serif" }}>Current plan</span>}
                    </div>
                    <div className="text-right">
                      <p style={{ fontSize: 28, fontWeight: 800, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1 }}>{displayPrice}</p>
                      <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{displayPeriod}</p>
                    </div>
                  </div>
                  <ul className="space-y-2 pb-5">
                    {tier.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check style={{ width: 15, height: 15, color: "var(--rose-dust)", flexShrink: 0, marginTop: 1 }} />
                        <span style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {tier.cta && !isActive && (
                  <div style={{ padding: "0 20px 20px" }}>
                    <button onClick={() => handleUpgrade(id)} disabled={loading}
                      style={{ width: "100%", padding: "14px", borderRadius: 14, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif",
                        backgroundColor: tier.highlight ? "var(--plum)" : "var(--rose-dust-subtle)",
                        color: tier.highlight ? "white" : "var(--rose-dust)",
                        opacity: loading ? 0.6 : 1 }}>
                      {loading ? "Loading..." : tier.cta}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Comparison table */}
        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden", marginBottom: 32 }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--border-subtle)" }}>
            <p style={{ ...sLabel, marginBottom: 0 }}>Feature comparison</p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Feature</th>
                  {["Free", "Plus", "Pro"].map(t => (
                    <th key={t} style={{ padding: "12px 12px", textAlign: "center", fontSize: 11, fontWeight: 700, color: t === "Plus" ? "var(--rose-dust)" : "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.feature} style={{ borderBottom: i < COMPARISON.length - 1 ? "1px solid var(--border-subtle)" : "none", backgroundColor: i % 2 === 0 ? "transparent" : "var(--ivory)" }}>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{row.feature}</td>
                    {["free", "plus", "pro"].map(plan => (
                      <td key={plan} style={{ padding: "10px 12px", textAlign: "center" }}>
                        {typeof row[plan] === "boolean" ? (
                          row[plan]
                            ? <span style={{ color: "var(--sage)", fontSize: 14 }}>✓</span>
                            : <span style={{ color: "var(--border)", fontSize: 12 }}>—</span>
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 500, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{row[plan]}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Testimonials */}
        <div className="space-y-3 mb-10">
          <p style={{ ...sLabel, marginBottom: 12 }}>What women say</p>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px 18px" }}>
              <p style={{ fontSize: 13, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.65, marginBottom: 8, fontStyle: "italic" }}>"{t.quote}"</p>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{t.name} · {t.location}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="space-y-2 mb-10">
          <p style={{ ...sLabel, marginBottom: 12 }}>FAQs</p>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "none", border: "none", cursor: "pointer" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", textAlign: "left" }}>{faq.q}</span>
                {openFaq === i ? <ChevronUp className="w-4 h-4" style={{ color: "var(--mauve)", flexShrink: 0 }} /> : <ChevronDown className="w-4 h-4" style={{ color: "var(--mauve)", flexShrink: 0 }} />}
              </button>
              {openFaq === i && (
                <div style={{ padding: "0 16px 14px" }}>
                  <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", lineHeight: 1.65 }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-xs mb-8" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Cancel anytime · Secure payments via Stripe · Your data stays yours</p>
      </div>
    </div>
  );
}