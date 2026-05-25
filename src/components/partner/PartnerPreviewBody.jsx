// PartnerPreviewBody — Sprint 10
//
// The shared "partner-facing" rendering used by BOTH:
//   - PartnerSync.jsx preview modal (renders inline, given user+profile)
//   - Partner.jsx public page (renders for the resolved share code)
//
// Three cards, each gated on settings:
//   • Today's Mood  — settings.show_mood_energy
//   • Cycle Phase   — settings.show_phase
//   • Support Tips  — settings.show_tips
//
// Pulls today's DailyCheckins and derives phase from the cycle hook
// (or falls back to profile.life_stage for peri/meno users so we don't
// pretend they have a "phase" they're not in).

import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useCycleDay } from "@/hooks/useCycleDay";
import { Heart, Moon, Calendar, Sparkles } from "lucide-react";

const C = {
  cream:    "#F4EDDB",
  paperHi:  "#EDE6D5",
  paper:    "#FBF6E6",
  espresso: "#3A2C1A",
  espressoDk: "#2A1E0E",
  muted:    "#9B8B7A",
  gold:     "#D4AF37",
  sage:     "#8FAF8F",
  blush:    "#E8B4B8",
  border:   "#D4C9B4",
};

const PHASE_COLORS = {
  menstrual:   "#C96B9E",
  follicular:  "#9B7FCC",
  ovulatory:   "#E8B84B",
  luteal:      "#4ABFA3",
  perimenopause: "#C4849A",
  menopause:     "#B89E6A",
  "post-menopause": "#7A9E8E",
  unknown:     "#9B8B7A",
};

const PHASE_BLURBS = {
  menstrual:
    "Her period is here. Energy is naturally lower, and rest is what helps most. Be gentle.",
  follicular:
    "Energy is building back. She may feel more outgoing, optimistic, and up for plans.",
  ovulatory:
    "She's at her social peak — confident, expressive, often most physically energetic.",
  luteal:
    "The lead-up to her period. Emotions and energy can dip. Patience and quiet matter more here.",
  perimenopause:
    "Hormones are fluctuating. Symptoms come and go unpredictably — patience and listening go a long way.",
  menopause:
    "Periods have stopped. Sleep, mood, and temperature can shift on their own timeline. Steady support helps.",
  "post-menopause":
    "Many symptoms ease, but bone, heart, and sleep still need attention. Steady, ongoing support.",
  unknown:
    "Every body is different. Ask, listen, and follow her lead.",
};

const PHASE_LABEL = {
  menstrual:        "Menstrual phase",
  follicular:       "Follicular phase",
  ovulatory:        "Ovulatory phase",
  luteal:           "Luteal phase",
  perimenopause:    "Perimenopause",
  menopause:        "Menopause",
  "post-menopause": "Post-menopause",
  unknown:          "Today",
};

const SUPPORT_TIPS = {
  menstrual: [
    "Rest is what helps most — encourage it without making it a thing.",
    "Hot water bottle, warm tea, the comfort food she likes. Small + warm.",
    "Don't take quiet moods personally — they pass.",
  ],
  follicular: [
    "Plan the date, the walk, the thing — her energy is up for it.",
    "Great window for trying something new together.",
    "Match her enthusiasm. She wants to be met where she is.",
  ],
  ovulatory: [
    "She's at her social peak — be present, ask about her day.",
    "Confidence is high — celebrate her wins, big or small.",
    "Physical affection lands especially well this week.",
  ],
  luteal: [
    "She may need more quiet time — don't take it personally.",
    "Ask what kind of support she needs rather than assuming.",
    "Small gestures like a cup of tea can mean a lot right now.",
  ],
  perimenopause: [
    "Hot flashes are involuntary — don't joke about them. Just offer water.",
    "Sleep disruptions can make mornings hard. Patience over coffee.",
    "Brain fog is real. Repeating yourself kindly costs you nothing.",
  ],
  menopause: [
    "Temperature swings aren't drama — keep the bedroom cool.",
    "Mood shifts can be hormonal, not relational. Don't escalate.",
    "Affection without expectation matters most right now.",
  ],
  "post-menopause": [
    "Bone health matters — invite her on walks, lift things together.",
    "Sleep is still a thing. Protect her wind-down time.",
    "She's not broken — this is a new chapter, not a problem.",
  ],
  unknown: [
    "Ask how she's feeling today — and listen.",
    "Small acts of care matter more than grand gestures.",
    "Patience is the strongest love language.",
  ],
};

const MOOD_LABEL = {
  1: "very low",
  2: "low",
  3: "okay",
  4: "good",
  5: "bright",
};

const ENERGY_LABEL = {
  1: "very low",
  2: "low",
  3: "steady",
  4: "lively",
  5: "peak",
};

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function PartnerPreviewBody({ user, profile, settings }) {
  const [checkin, setCheckin] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const cycle = useCycleDay(profile);

  useEffect(() => {
    if (!user?.id) { setLoaded(true); return; }
    let cancelled = false;
    (async () => {
      try {
        const rows = await base44.entities.DailyCheckins
          .filter({ user_id: user.id, date: todayISO() }, "-updated_date", 1)
          .catch(() => []);
        if (!cancelled) setCheckin(rows?.[0] || null);
      } catch { /* swallow */ }
      finally { if (!cancelled) setLoaded(true); }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  // Peri / meno / post-meno users don't have a meaningful cycle phase
  // — surface their life stage instead so partner tips track the real
  // physiology rather than a follicular/luteal label that doesn't apply.
  const isMenoStage = !!profile?.life_stage && ["perimenopause", "menopause", "post-menopause"].includes(profile.life_stage);
  const phaseKey = isMenoStage ? profile.life_stage : (cycle?.phase || "unknown");
  const phaseColor = PHASE_COLORS[phaseKey] || PHASE_COLORS.unknown;
  const phaseLabel = PHASE_LABEL[phaseKey] || PHASE_LABEL.unknown;
  const phaseBlurb = PHASE_BLURBS[phaseKey] || PHASE_BLURBS.unknown;
  const tips = SUPPORT_TIPS[phaseKey] || SUPPORT_TIPS.unknown;

  const moodScore = checkin?.mood_score ?? checkin?.mood;
  const energyScore = checkin?.energy ?? checkin?.energy_level;
  const moodLabel = moodScore != null ? MOOD_LABEL[Number(moodScore)] : null;
  const energyLabel = energyScore != null ? ENERGY_LABEL[Number(energyScore)] : null;

  const show = {
    mood_energy: settings?.show_mood_energy !== false,
    phase:       settings?.show_phase !== false,
    tips:        settings?.show_tips !== false,
  };

  return (
    <div style={{
      background: C.cream, color: C.espresso,
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: "20px 18px 32px",
      maxWidth: 560, margin: "0 auto",
    }}>
      <header style={{ textAlign: "center", marginBottom: 22 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: C.blush, marginBottom: 6 }}>
          <Heart size={16} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.muted }}>
            FemWell · Partner View
          </span>
        </div>
        <h2 style={{
          margin: 0, fontSize: 22, fontWeight: 600,
          fontFamily: "'Fraunces', Georgia, serif", color: C.espressoDk,
          lineHeight: 1.18,
        }}>You've been shared someone's FemWell.</h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
          A gentle window into how she's doing today.
        </p>
      </header>

      {/* Card 1 — Today's mood */}
      {show.mood_energy && (
        <article style={card}>
          <header style={cardHeader(C.blush)}>
            <span style={iconChip(C.blush)}><Moon size={16} /></span>
            <p style={cardTitle}>How she's feeling</p>
          </header>
          {loaded ? (
            (moodLabel || energyLabel) ? (
              <>
                {moodLabel && (
                  <p style={cardBody}>
                    Today she's feeling <strong style={{ color: C.espressoDk }}>{moodLabel}</strong>.
                  </p>
                )}
                {energyLabel && (
                  <p style={{ ...cardBody, margin: "6px 0 0" }}>
                    Energy is <strong style={{ color: C.espressoDk }}>{energyLabel}</strong>.
                  </p>
                )}
              </>
            ) : (
              <p style={cardBody}>She hasn't done a check-in yet today.</p>
            )
          ) : (
            <p style={{ ...cardBody, color: C.muted, fontStyle: "italic" }}>Loading…</p>
          )}
        </article>
      )}

      {/* Card 2 — Phase / life stage */}
      {show.phase && (
        <article style={card}>
          <header style={cardHeader(phaseColor)}>
            <span style={iconChip(phaseColor)}><Calendar size={16} /></span>
            <p style={cardTitle}>Where she is right now</p>
          </header>
          <div style={{
            display: "inline-block",
            padding: "4px 10px", borderRadius: 999,
            background: phaseColor + "22",
            color: phaseColor,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
            marginBottom: 8,
          }}>{phaseLabel}</div>
          <p style={cardBody}>{phaseBlurb}</p>
        </article>
      )}

      {/* Card 3 — Support tips */}
      {show.tips && (
        <article style={card}>
          <header style={cardHeader(C.sage)}>
            <span style={iconChip(C.sage)}><Sparkles size={16} /></span>
            <p style={cardTitle}>Ways to show up</p>
          </header>
          <ul style={{ margin: 0, padding: "0 0 0 18px", color: C.espresso, fontSize: 14, lineHeight: 1.55 }}>
            {tips.map((t, i) => (<li key={i} style={{ marginBottom: 6 }}>{t}</li>))}
          </ul>
        </article>
      )}

      <footer style={{
        textAlign: "center", marginTop: 22, padding: "0 12px",
        color: C.muted, fontSize: 11.5, lineHeight: 1.55,
      }}>
        FemWell helps women track their health across every life stage.
        Learn more at <span style={{ color: C.espresso, fontWeight: 600 }}>femwells.com</span>.
        <br />
        <span style={{ fontStyle: "italic" }}>Not medical advice — for understanding only.</span>
      </footer>
    </div>
  );
}

const card = {
  background: C.paperHi,
  border: `1px solid ${C.border}`,
  borderRadius: 18,
  padding: "16px 16px 14px",
  margin: "0 0 12px",
};
function cardHeader(accent) {
  return {
    display: "flex", alignItems: "center", gap: 10,
    marginBottom: 10,
    borderLeft: `3px solid ${accent}`,
    paddingLeft: 8, marginLeft: -8,
  };
}
function iconChip(accent) {
  return {
    width: 30, height: 30, borderRadius: 10,
    background: accent + "22",
    color: accent,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  };
}
const cardTitle = {
  margin: 0,
  fontSize: 15, fontWeight: 600,
  fontFamily: "'Fraunces', Georgia, serif",
  color: C.espressoDk,
};
const cardBody = {
  margin: 0, fontSize: 14, color: C.espresso, lineHeight: 1.55,
};
