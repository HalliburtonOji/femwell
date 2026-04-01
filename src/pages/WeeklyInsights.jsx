import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { WeeklyInsights } from '@/api/entities';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, parseISO, subDays } from "date-fns";
import { createPageUrl } from "@/utils";

function renderInlineMarkdown(line) {
  const parts = line.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

function MarkdownBlock({ text }) {
  const lines = String(text || "").split("\n").filter(Boolean);
  return (
    <div className="space-y-3">
      {lines.map((line, index) => {
        if (line.startsWith("## ")) {
          return <p key={index} className="text-base font-bold" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{line.replace(/^##\s*/, "")}</p>;
        }
        if (line.startsWith("# ")) {
          return <p key={index} className="text-sm font-semibold" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{line.replace(/^#\s*/, "")}</p>;
        }
        return <p key={index} className="text-sm leading-relaxed" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{renderInlineMarkdown(line)}</p>;
      })}
    </div>
  );
}

export default function WeeklyInsightsPage() {
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [weekCheckins, setWeekCheckins] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        const records = await WeeklyInsights.filter({ created_by: user.email }, "-week_start", 24);
        setItems(records);
        const cutoff = format(subDays(new Date(), 7), "yyyy-MM-dd");
        const ci = await base44.entities.DailyCheckins.filter({ created_by: user.email });
        setWeekCheckins(ci.filter(c => c.date >= cutoff));
      } catch {}
      setLoading(false);
    })();
  }, []);

  const currentItem = items[currentIndex] || null;
  const periodLabel = useMemo(() => {
    if (!currentItem?.week_start) return "";
    const start = parseISO(currentItem.week_start);
    const end = currentItem.week_end ? parseISO(currentItem.week_end) : null;
    return end
      ? `Week of ${format(start, "MMM dd")} – ${format(end, "MMM dd")}`
      : `Week of ${format(start, "MMM dd")}`;
  }, [currentItem]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}><div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} /></div>;
  }

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="max-w-3xl mx-auto px-4 pt-10">
        <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Weekly summary</p>
        <h1 className="text-2xl font-bold leading-tight mt-1" style={{ fontFamily: "'Playfair Display', serif", color: "var(--plum)", letterSpacing: "-0.02em" }}>Your Weekly Insights</h1>

        {currentItem && (
          <div className="mt-5 rounded-[24px] p-5" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))} disabled={currentIndex === 0} className="w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-30" style={{ backgroundColor: "var(--ivory-dark)", color: "var(--plum)" }}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <p className="text-sm font-semibold text-center" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{periodLabel}</p>
              <button onClick={() => setCurrentIndex((i) => Math.min(items.length - 1, i + 1))} disabled={currentIndex >= items.length - 1} className="w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-30" style={{ backgroundColor: "var(--ivory-dark)", color: "var(--plum)" }}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto rounded-[20px] p-4" style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border-subtle)" }}>
              <MarkdownBlock text={currentItem.insight_text} />
            </div>

            {(() => {
              const skinLogs = weekCheckins.filter(c => c.skin_condition);
              const hairLogs = weekCheckins.filter(c => c.hair_shedding);
              if (!skinLogs.length && !hairLogs.length) return null;
              const skinMode = skinLogs.length
                ? Object.entries(skinLogs.reduce((acc, c) => {
                    acc[c.skin_condition] = (acc[c.skin_condition] || 0) + 1; return acc;
                  }, {})).sort((a, b) => b[1] - a[1])[0]?.[0]
                : null;
              const hairMode = hairLogs.length
                ? Object.entries(hairLogs.reduce((acc, c) => {
                    acc[c.hair_shedding] = (acc[c.hair_shedding] || 0) + 1; return acc;
                  }, {})).sort((a, b) => b[1] - a[1])[0]?.[0]
                : null;
              return (
                <div style={{ borderTop: "1px solid var(--border)", marginTop: "16px", paddingTop: "16px" }}>
                  <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
                              letterSpacing: "0.12em", color: "var(--mauve)",
                              fontFamily: "'Inter', sans-serif", marginBottom: "10px" }}>
                    This week — skin &amp; hair
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    {skinMode && (
                      <div style={{ backgroundColor: "var(--rose-dust-subtle)", borderRadius: "12px", padding: "10px 14px" }}>
                        <p style={{ fontSize: "10px", color: "var(--rose-dust)", fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>SKIN</p>
                        <p style={{ fontSize: "14px", color: "var(--plum)", fontWeight: 700, fontFamily: "'Inter', sans-serif", marginTop: "2px" }}>{skinMode}</p>
                        <p style={{ fontSize: "10px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>most common this week</p>
                      </div>
                    )}
                    {hairMode && (
                      <div style={{ backgroundColor: "var(--sage-subtle)", borderRadius: "12px", padding: "10px 14px" }}>
                        <p style={{ fontSize: "10px", color: "var(--sage)", fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>HAIR SHEDDING</p>
                        <p style={{ fontSize: "14px", color: "var(--plum)", fontWeight: 700, fontFamily: "'Inter', sans-serif", marginTop: "2px" }}>{hairMode}</p>
                        <p style={{ fontSize: "10px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>most logged this week</p>
                      </div>
                    )}
                    <a href={createPageUrl("SkinHair")}
                       style={{ backgroundColor: "var(--ivory-dark)", borderRadius: "12px",
                                padding: "10px 14px", display: "flex", alignItems: "center",
                                textDecoration: "none" }}>
                      <p style={{ fontSize: "12px", color: "var(--plum)", fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>Full trends</p>
                    </a>
                  </div>
                </div>
              );
            })()}

            <p className="mt-4" style={{ fontSize: "11px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Generated automatically every Sunday</p>
          </div>
        )}
      </div>
    </div>
  );
}