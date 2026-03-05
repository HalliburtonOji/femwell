import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Check, Sparkles, Zap } from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "£0",
    period: "/month",
    color: "from-gray-100 to-gray-200",
    textColor: "text-gray-600",
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
    color: "from-rose-400 to-pink-500",
    textColor: "text-white",
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
    color: "from-purple-500 to-indigo-600",
    textColor: "text-white",
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
  const [entitlementId, setEntitlementId] = useState(null);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const ents = await base44.entities.Entitlements.filter({ user_id: u.id });
      if (ents[0]) { setCurrentPlan(ents[0].plan || "free"); setEntitlementId(ents[0].id); }
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
    <div className="min-h-screen femwell-gradient pb-10">
      <div className="max-w-md mx-auto px-4">
        <div className="pt-12 pb-6 flex items-center gap-3">
          <button onClick={() => window.history.back()} className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-rose-900">Upgrade FemWell</h1>
            <p className="text-sm text-gray-400">Choose the plan that's right for you</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {PLANS.map((plan) => {
            const isActive = currentPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`rounded-3xl overflow-hidden shadow-lg ${isActive ? "ring-2 ring-rose-400" : ""}`}
              >
                <div className={`bg-gradient-to-br ${plan.color} p-5`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      {plan.badge && (
                        <div className="inline-flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5 text-xs font-bold text-white mb-1">
                          <Sparkles className="w-3 h-3" /> {plan.badge}
                        </div>
                      )}
                      <p className={`text-xl font-bold ${plan.textColor}`}>{plan.name}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-black ${plan.textColor}`}>{plan.price}</p>
                      <p className={`text-xs ${plan.textColor} opacity-70`}>{plan.period}</p>
                    </div>
                  </div>
                  {isActive && (
                    <div className="inline-flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-xs font-medium text-white mb-2">
                      ✓ Current plan
                    </div>
                  )}
                </div>
                <div className="bg-white/90 p-4">
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {plan.id !== "free" && !isActive && (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={loading}
                      className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all ${
                        plan.id === "plus"
                          ? "bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-md hover:shadow-lg"
                          : "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md hover:shadow-lg"
                      } disabled:opacity-50`}
                    >
                      {loading ? "Loading..." : `Get ${plan.name} →`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-400">Cancel anytime · Secure payments via Stripe</p>
      </div>
    </div>
  );
}