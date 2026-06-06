import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, X } from "lucide-react";

export default function DailyInsightBanner({ user }) {
  const [insight, setInsight] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const today = new Date().toISOString().split("T")[0];
    (async () => {
      const cards = await base44.entities.InsightCards.filter({
        user_id: user.id,
        source: "daily_worker",
        insight_date: today,
      }).catch(() => []);
      if (cards.length > 0) setInsight(cards[0]);
    })();
  }, [user]);

  if (!insight || dismissed) return null;

  return (
    <div style={{
      margin: "0 16px 16px",
      borderRadius: "20px",
      backgroundColor: "var(--rose-dust-subtle)",
      border: "1px solid var(--rose-dust-light)",
      padding: "16px",
      position: "relative"
    }}>
      <button
        onClick={() => {
          setDismissed(true);
          base44.entities.InsightCards.update(insight.id, { is_read: true });
        }}
        style={{ position: "absolute", top: "12px", right: "12px",
                 background: "none", border: "none", cursor: "pointer",
                 color: "var(--mauve)", display: "flex" }}
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <div style={{
          width: "32px", height: "32px", borderRadius: "10px",
          backgroundColor: "var(--rose-dust-subtle)",
          display: "flex", alignItems: "center",
          justifyContent: "center", flexShrink: 0
        }}>
          <Sparkles className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />
        </div>
        <div>
          <p style={{ fontSize: "0.6rem", fontWeight: 700,
                       textTransform: "uppercase", letterSpacing: "0.12em",
                       color: "var(--rose-dust)", marginBottom: "4px" }}>Daily Insight</p>
          <p style={{ fontSize: "13px", lineHeight: 1.6,
                      color: "var(--plum)", }}>{insight.insight_text}</p>
        </div>
      </div>
    </div>
  );
}