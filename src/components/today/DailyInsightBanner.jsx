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
      });
      if (cards.length > 0) setInsight(cards[0]);
    })();
  }, [user]);

  if (!insight || dismissed) return null;

  const phaseEmoji = {
    menstrual: "🌑",
    follicular: "🌱",
    ovulation: "✨",
    luteal: "🌕",
  };

  return (
    <div className="mx-4 mb-4 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 p-4 relative">
      <button
        onClick={() => {
          setDismissed(true);
          base44.entities.InsightCards.update(insight.id, { is_read: true });
        }}
        className="absolute top-3 right-3 text-gray-300 hover:text-gray-500"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 text-sm">
          {phaseEmoji[insight.cycle_phase] || <Sparkles className="w-4 h-4 text-rose-400" />}
        </div>
        <div>
          <p className="text-xs font-semibold text-rose-500 mb-1 uppercase tracking-wide">Daily Insight</p>
          <p className="text-sm text-gray-700 leading-relaxed">{insight.insight_text}</p>
        </div>
      </div>
    </div>
  );
}