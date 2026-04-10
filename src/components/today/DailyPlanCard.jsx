import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, Loader2 } from "lucide-react";

const todayStr = new Date().toISOString().split("T")[0];
const card = { backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "16px 18px", boxShadow: "var(--shadow-sm)", marginBottom: 16 };

export default function DailyPlanCard({ user }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user?.id) loadPlan();
  }, [user]);

  const loadPlan = async () => {
    const plans = await base44.entities.DailyPlan.filter({ user_id: user.id, day_key: todayStr }).catch(() => []);
    setPlan(plans[0] || null);
    setLoading(false);
  };

  const generate = async (force = false) => {
    setGenerating(true);
    await base44.functions.invoke("generateDailyPlan", { user_id: user.id, day_key: todayStr, force }).catch(() => {});
    await loadPlan();
    setGenerating(false);
  };

  if (loading) return null;

  const p = plan?.plan_json
    ? (typeof plan.plan_json === "string" ? JSON.parse(plan.plan_json) : plan.plan_json)
    : null;

  if (!p) {
    return (
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Your daily plan</p>
            <p style={{ fontSize: 13, color: "var(--plum)", marginTop: 2, fontFamily: "'Inter', sans-serif" }}>Get your personalised plan for today.</p>
          </div>
          <button onClick={() => generate(false)} disabled={generating}
            style={{ padding: "8px 16px", borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: generating ? 0.6 : 1, display: "flex", alignItems: "center", gap: 6, flexShrink: 0, fontFamily: "'Inter', sans-serif" }}>
            {generating ? <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" /> : null}
            {generating ? "Generating..." : "Build my plan"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>Your plan today</p>
        <button onClick={() => generate(true)} disabled={generating}
          style={{ border: "none", background: "none", cursor: "pointer", color: "var(--mauve)", display: "flex", alignItems: "center", padding: 2 }}>
          <RefreshCw style={{ width: 13, height: 13 }} className={generating ? "animate-spin" : ""} />
        </button>
      </div>
      {p.focus_for_today && (
        <div style={{ backgroundColor: "var(--rose-dust-subtle)", borderRadius: 12, padding: "10px 14px", marginBottom: 12 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--plum)", fontFamily: "'Playfair Display', serif", lineHeight: 1.3 }}>{p.focus_for_today}</p>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {[
          { label: "Session", value: p.session_recommendation },
          { label: "Nutrition", value: p.nutrition_nudge },
          { label: "Mental", value: p.mental_tool },
          { label: "Read", value: p.lifestyle_suggestion },
        ].filter(item => item.value).map(({ label, value }) => (
          <div key={label} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: "var(--rose-dust)", backgroundColor: "var(--rose-dust-subtle)", borderRadius: 6, padding: "2px 6px", textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0, marginTop: 1, fontFamily: "'Inter', sans-serif" }}>{label}</span>
            <p style={{ fontSize: 12, color: "var(--plum)", lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}