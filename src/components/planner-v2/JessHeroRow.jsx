// JessHeroRow — phase-tinted gradient insight cards at the top of the
// Planner. Each card has chapter eyebrow + Fraunces title + body copy +
// sun-illustration SVG + "From Jess" footer. Sliding row.
//
// Props (all optional — sensible defaults):
//   phase            "menstrual" | "follicular" | "ovulatory" | "luteal"
//   cycleDay         number (1..28+)
//   jessMessage      { title, body } — primary card
//   astraReading     { title, body } — secondary card
//   weeklyInsight    { title, body } — tertiary card

import React from "react";
import { Sparkles } from "lucide-react";
import Row from "./Row";
import { C, PHASE_DEEP, PHASE_SOFT } from "./tokens";

const PHASE_CHAPTER = { menstrual: "I", follicular: "II", ovulatory: "III", luteal: "IV" };

function SunIllustration({ tone = C.gold, size = 70 }) {
  const cx = size / 2, cy = size / 2;
  const ray = (angle, r1, r2) => {
    const a = (angle * Math.PI) / 180;
    return {
      x1: cx + Math.cos(a) * r1, y1: cy + Math.sin(a) * r1,
      x2: cx + Math.cos(a) * r2, y2: cy + Math.sin(a) * r2,
    };
  };
  const rays = Array.from({ length: 12 }, (_, i) => ray(i * 30, size * 0.30, size * 0.45));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }} aria-hidden="true">
      <circle cx={cx} cy={cy} r={size * 0.18} fill="none" stroke={tone} strokeWidth={1.4} />
      {rays.map((r, i) => (
        <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke={tone} strokeWidth={1.2} strokeLinecap="round" />
      ))}
    </svg>
  );
}

function HeroCard({ eyebrow, title, body, footer, accent, soft }) {
  return (
    <article style={{
      borderRadius: 20,
      padding: "20px 22px 18px",
      display: "flex", flexDirection: "column", gap: 8,
      minHeight: 220,
      position: "relative",
      boxSizing: "border-box",
      boxShadow: "0 2px 12px rgba(58,44,26,0.08)",
      background: `linear-gradient(135deg, ${soft} 0%, ${C.cream} 100%)`,
      borderLeft: `4px solid ${accent}`,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
          textTransform: "uppercase", margin: 0, color: accent,
        }}>{eyebrow}</p>
        <SunIllustration tone={accent} size={70} />
      </div>
      <h2 style={{
        fontFamily: "'Fraunces', Georgia, serif",
        fontSize: 26, fontWeight: 500, color: C.espresso,
        margin: "4px 0 0", lineHeight: 1.2, letterSpacing: "-0.015em",
      }}>{title}</h2>
      <p style={{
        fontSize: 15, color: "rgba(58,44,26,0.78)",
        margin: "4px 0 0", lineHeight: 1.6,
      }}>{body}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8 }}>
        <Sparkles size={11} style={{ color: accent }} />
        <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{footer}</span>
      </div>
    </article>
  );
}

const DEFAULTS = {
  menstrual:  { title: "A week to soften", body: "Your body is doing important work. Lower the bar, lower the lights, and let this week be small." },
  follicular: { title: "Your spring has arrived", body: "Energy is rising. New things will catch your eye — let yourself follow one or two of them." },
  ovulatory:  { title: "Your peak window opened", body: "Visibility, bold asks, and creative output land easily this week." },
  luteal:     { title: "Your habits eased back this week", body: "This luteal week might invite gentler rhythms and smaller wins; you might find rest and lower activity feel more nourishing, with options left to follow your own pace." },
};

export default function JessHeroRow({
  phase = "luteal",
  cycleDay = 25,
  jessMessage,
  astraReading,
  weeklyInsight,
}) {
  const defaults = DEFAULTS[phase] || DEFAULTS.luteal;
  const chapter = PHASE_CHAPTER[phase] || "I";
  const accent = PHASE_DEEP[phase];
  const soft = PHASE_SOFT[phase];

  return (
    <Row label="">
      <HeroCard
        eyebrow={`CHAPTER ${chapter} · ${phase.toUpperCase()} · DAY ${cycleDay}`}
        title={jessMessage?.title || defaults.title}
        body={jessMessage?.body || defaults.body}
        footer="From Jess · this week"
        accent={accent} soft={soft}
      />
      {astraReading && (
        <HeroCard
          eyebrow="ASTRA · READING"
          title={astraReading.title}
          body={astraReading.body}
          footer="From Astra · today"
          accent={C.gold} soft={C.softOvulatory}
        />
      )}
      {weeklyInsight && (
        <HeroCard
          eyebrow="WEEKLY INSIGHT"
          title={weeklyInsight.title}
          body={weeklyInsight.body}
          footer="From your patterns"
          accent={C.sage} soft="#D8E5D3"
        />
      )}
    </Row>
  );
}
