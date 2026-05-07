import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

const todayStr = new Date().toISOString().split("T")[0];

export default function TodayDailyChapterCard() {
  const [segment, setSegment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const all = await base44.entities.DailyStory.list("-day_number", 100).catch(() => []);
      const today = all.find(s => s.published_date === todayStr && s.is_active);
      if (mounted) {
        setSegment(today || null);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading || !segment) return null;

  const bg = segment.image_gradient
    || "linear-gradient(135deg, var(--rose-soft-bg) 0%, var(--cream-2) 100%)";

  const pullQuoteText = (segment.cliffhanger || segment.segment_text || "").slice(0, 120);
  const ellipsis = (segment.cliffhanger || segment.segment_text || "").length > 120 ? "…" : "";

  return (
    <Link
      to={createPageUrl("Lifestyle?tab=daily_story")}
      style={{ textDecoration: "none", display: "block", marginBottom: 12 }}
      className="fw-daily-chapter-card"
    >
      <style>{`
        @keyframes fwDailyChapterIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fw-daily-chapter-card > div { animation: fwDailyChapterIn 200ms ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .fw-daily-chapter-card > div { animation: none; }
        }
      `}</style>
      <div style={{
        borderRadius: 18,
        overflow: "hidden",
        background: bg,
        padding: "20px 22px",
        border: "1px solid var(--ink-line)",
        boxShadow: "var(--shadow-card)",
      }}>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "var(--plum-mute)",
          marginBottom: 8,
          marginTop: 0,
        }}>
          Today's chapter · Day {segment.day_number} of 30
        </p>
        <p style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 17,
          fontWeight: 400,
          fontStyle: "italic",
          color: "var(--plum-deep)",
          lineHeight: 1.55,
          marginBottom: 14,
          marginTop: 0,
        }}>
          {pullQuoteText}{ellipsis}
        </p>
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--rose-primary)",
        }}>
          Read today's chapter <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}