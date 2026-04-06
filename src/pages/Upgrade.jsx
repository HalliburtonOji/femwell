import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Check, Sparkles } from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "£0",
    period: "/month",
    headerStyle: { background: "linear-gradient(135deg, var(--ivory-dark), var(--border))" },
    textColor: "var(--plum)",
    features: [
      "Daily check-ins & mood tracking",
      "Basic cycle tracking",
      "5 free meditations",
      "2 free workouts",
      "7-day insights",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    price: "£7.99",
    period: "/month",
    headerStyle: { background: "linear-gradient(135deg, var(--rose-dust), #c97b8a)" },
    textColor: "white",
    badge: "Most Popular",
    features: [
      "Everything in Free",
      "Unlimited meditations & breathwork",
      "Full fitness library",
      "30-day insights & trends",
      "1 guided program",
      "AI wellness insights",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "£14.99",
    period: "/month",
    headerStyle: { background: "linear-gradient(135deg, #7C4AC4, #5B3A9E)" },
    textColor: "white",
    features: [
      "Everything in Plus",
      "All programs unlocked",
      "90-day pattern analysis",
      "Priority AI insights",
      "Symptom correlations",
      "Export health reports",
    ],
  },
];

export default function Upgrade() {
  const [user, setUser] = useState(null);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [loading, setLoading] = useState(false);

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
        success_url: window.location.origin + createPageUrl("Today"),
        cancel_url: window.location.href,
      });
      if (res.data?.url) window.location.href = res.data.url;
    } catch (e) {
      alert("Unable to start checkout. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pb-10" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="max-w-md mx-auto px-4">
        <div className="pt-12 pb-6 flex items-center gap-3">
          <button onClick={() => window.history.back()} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.85)", border: "none", cursor: "pointer" }}>
            <ArrowLeft style={{ width: 16, height: 16, color: "var(--plum)" }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--plum)" }}>Upgrade FemWell</h1>
            <p className="text-sm" style={{ color: "var(--mauve)" }}>Choose the plan that's right for you</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {PLANS.map((plan) => {
            const isActive = currentPlan === plan.id;
            return (
              <div key={plan.id} className="rounded-3xl overflow-hidden shadow-lg" style={{ outline: isActive ? "2px solid var(--rose-dust)" : "none" }}>
                <div className="p-5" style={plan.headerStyle}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      {plan.badge && (
                        <div className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold mb-1" style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}>
                          <Sparkles className="w-3 h-3" /> {plan.badge}
                        </div>
                      )}
                      <p className="text-xl font-bold" style={{ color: plan.textColor }}>{plan.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black" style={{ color: plan.textColor }}>{plan.price}</p>
                      <p className="text-xs" style={{ color: plan.textColor, opacity: 0.7 }}>{plan.period}</p>
                    </div>
                  </div>
                  {isActive && (
                    <div className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium mb-2" style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}>
                      Current plan
                    </div>
                  )}
                </div>
                <div className="p-4" style={{ backgroundColor: "rgba(255,255,255,0.9)" }}>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "var(--mauve)" }}>
                        <Check style={{ width: 16, height: 16, color: "var(--rose-dust)", flexShrink: 0 }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {plan.id !== "free" && !isActive && (
                    <button onClick={() => handleUpgrade(plan.id)} disabled={loading}
                      className="w-full py-3 rounded-2xl font-semibold text-sm shadow-md"
                      style={{ ...plan.headerStyle, color: "white", border: "none", cursor: "pointer", opacity: loading ? 0.5 : 1 }}>
                      {loading ? "Loading..." : `Get ${plan.name}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs" style={{ color: "var(--mauve)" }}>Cancel anytime · Secure payments via Stripe</p>
      </div>
    </div>
  );
}