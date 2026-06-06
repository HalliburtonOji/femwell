// Sprint C C3 — Renders a "talk to a trusted adult or healthcare provider"
// nudge for sensitive surfaces when the user's life_stage is "teen" (i.e.
// is_under_18 is true). Designed to sit alongside the detailed content,
// not block it — except where the spec says to replace.
//
// Usage:
//   <TeenSafetyNudge profile={profile} surface="contraception" />
// `surface` is just used in copy; the guard is the profile.is_under_18
// boolean (derived from life_stage === "teen" if the field is missing).

import { ShieldCheck } from "lucide-react";

export function isUnder18(profile) {
  if (!profile) return false;
  if (profile.is_under_18 === true) return true;
  if (profile.is_under_18 === false) return false;
  return profile.life_stage === "teen";
}

const SURFACE_COPY = {
  cycle:          "If something feels off about your cycle, please talk to a trusted adult or a healthcare provider — not just an app.",
  pregnancy:      "Pregnancy is medical. Please speak to a trusted adult, your GP, or your school nurse before making decisions.",
  contraception:  "Contraception decisions belong with a real clinician. A trusted adult or your GP can help you talk this through safely.",
  sexual_health:  "Sexual health questions are private and important. Please reach out to your GP, school nurse, or another trusted adult.",
  symptom:        "Persistent symptoms deserve a real conversation. Please tell a trusted adult or your GP what you're noticing.",
  default:        "Please talk to a trusted adult or healthcare provider if anything here feels worrying or unclear.",
};

export default function TeenSafetyNudge({ profile, surface = "default", style = {} }) {
  if (!isUnder18(profile)) return null;
  const copy = SURFACE_COPY[surface] || SURFACE_COPY.default;
  return (
    <div
      role="note"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "12px 14px",
        borderRadius: 14,
        background: "#FFF8E6", // soft cream-gold
        border: "1px solid #E8C97A",
        color: "#4A3A1A",
        fontSize: 13,
        lineHeight: 1.5,
        margin: "10px 0",
        ...style,
      }}
      data-teen-nudge={surface}
    >
      <ShieldCheck size={16} style={{ color: "#A6862B", flexShrink: 0, marginTop: 2 }} />
      <span>{copy}</span>
    </div>
  );
}
