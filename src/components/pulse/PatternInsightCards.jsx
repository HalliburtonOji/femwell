import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";

const PHASE_COLORS = {
  menstrual:  { bg: "var(--rose-dust-subtle)", text: "var(--rose-dust)", border: "var(--rose-dust-light)" },
  follicular: { bg: "var(--sage-subtle)",      text: "var(--sage)",      border: "var(--sage-light)" },
  ovulatory:  { bg: "#F5F0E6",                 text: "#B89E6A",          border: "#E8D9B8" },
  luteal:     { bg: "var(--mauve-subtle)",      text: "var(--mauve)",     border: "var(--mauve-light)" },
};

const SOURCE_LABELS = {
  symptom_pattern: "Symptom pattern",
  skin_cycle_engine: "Skin insight",
  period_prediction: "Period prediction",
};

export default function PatternInsightCards({ userId }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const items = await base44.entities.InsightCards.filter(
        { user_id: userId }, "-insight_date", 30
      );
      const today = new Date().toISOString().split("T")[0];
      const filtered = items.filter(c =>
        ["symptom_pattern", "skin_cycle_engine", "period_prediction"].includes(c.source) &&
        (!c.expires_at || c.expires_at.split("T")[0] >= today)
      );
      setCards(filtered);
      setLoading(false);
    })();
  }, [userId]);

  if (loading || cards.length === 0) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 12 }}>
        <p style={{
          fontSize: "0.55rem", fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.14em", color: "var(--rose-dust)",
          fontFamily: "'Inter', sans-serif",
        }}>Your patterns</p>
        <p style={{
          fontSize: "18px", fontWeight: 700, color: "var(--plum)",
          fontFamily: "'Inter', sans-serif", marginTop: "3px",
        }}>AI-detected insights</p>
      </div>

      <style>{`.pattern-scroll::-webkit-scrollbar{display:none}`}</style>
      <div
        className="pattern-scroll"
        style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}
      >
        {cards.map(card => {
          const phaseKey = card.cycle_phase?.toLowerCase();
          const colors = PHASE_COLORS[phaseKey] || PHASE_COLORS.luteal;
          return (
            <div
              key={card.id}
              style={{
                flexShrink: 0,
                width: 240,
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                padding: 16,
                boxShadow: "var(--shadow-sm)",
              }}
            >
              {/* Phase badge */}
              {phaseKey && (
                <span style={{
                  display: "inline-block",
                  backgroundColor: colors.bg,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 9999,
                  padding: "3px 10px",
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: "'Inter', sans-serif",
                  textTransform: "capitalize",
                  marginBottom: 10,
                }}>
                  {phaseKey}
                </span>
              )}

              {/* Source label */}
              <p style={{
                fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.1em", color: "var(--mauve)",
                fontFamily: "'Inter', sans-serif", marginBottom: 6,
              }}>
                {SOURCE_LABELS[card.source] || card.source}
              </p>

              <p style={{
                fontSize: 13, fontWeight: 700,
                color: "var(--plum)",
                fontFamily: "'Inter', sans-serif",
                marginBottom: 8, lineHeight: 1.3,
              }}>
                {card.title}
              </p>

              <p style={{
                fontSize: 12, color: "var(--mauve)",
                fontFamily: "'Inter', sans-serif",
                lineHeight: 1.6,
              }}>
                {card.insight_text}
              </p>

              {card.recommended_action_route && (
                <Link
                  to={card.recommended_action_route}
                  style={{
                    display: "inline-block", marginTop: 10,
                    fontSize: 11, fontWeight: 600, color: colors.text,
                    fontFamily: "'Inter', sans-serif", textDecoration: "none",
                  }}
                >
                  Learn more →
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}