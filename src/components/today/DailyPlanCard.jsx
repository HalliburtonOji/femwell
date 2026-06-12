import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw } from "lucide-react";

const todayStr = new Date().toISOString().split("T")[0];
const card = { backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "16px 18px", boxShadow: "var(--shadow-sm)" };

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
    loadPlan(); // background refetch — don't gate the UI on the read
    setGenerating(false);
  };

  if (loading) return null;

  // Support both new flat fields and legacy plan_json
  const p = plan?.focus_for_today
    ? {
        focus_for_today: plan.focus_for_today,
        session_recommendation: plan.session_recommendation,
        nutrition_nudge: plan.nutrition_nudge,
        mental_tool: plan.mental_tool,
        lifestyle_suggestion: plan.lifestyle_suggestion,
      }
    : plan?.plan_json
    ? (typeof plan.plan_json === "string" ? JSON.parse(plan.plan_json) : plan.plan_json)
    : null;

  if (!p) return null;

  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--rose-dust)", }}>Your plan today</p>
        <button onClick={() => generate(true)} disabled={generating}
          style={{ border: "none", background: "none", cursor: "pointer", color: "var(--mauve)", display: "flex", alignItems: "center", padding: 2 }}>
          <RefreshCw style={{ width: 13, height: 13 }} className={generating ? "animate-spin" : ""} />
        </button>
      </div>
      {p.focus_for_today && (
        <div style={{ backgroundColor: "var(--rose-dust-subtle)", borderRadius: 12, padding: "10px 14px", marginBottom: 12 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--plum)", lineHeight: 1.3 }}>{p.focus_for_today}</p>
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
            <span style={{ fontSize: 9, fontWeight: 700, color: "var(--rose-dust)", backgroundColor: "var(--rose-dust-subtle)", borderRadius: 6, padding: "2px 6px", textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0, marginTop: 1, }}>{label}</span>
            <p style={{ fontSize: 12, color: "var(--plum)", lineHeight: 1.5, }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}