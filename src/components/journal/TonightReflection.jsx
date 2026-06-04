// TonightReflection — the dusk close-out ritual, in the Journal (Phase 1).
//
// A 90-second, phase-aware closing prompt on a dusk card. "Close the day"
// opens the composer seeded with the reflection. Lives in the Journal per
// the locked decision (not the Planner).

import { Moon, ArrowRight } from "lucide-react";
import { HAND, PRESS_DARK, Script, Eyebrow } from "./Editorial";

const TONIGHT = {
  menstrual:  "Before the day closes — what did your body ask for today, and did you listen?",
  follicular: "Before the day closes — name one small thing you let yourself begin today.",
  ovulatory:  "Before the day closes — where did you let yourself be seen today?",
  luteal:     "Before the day closes — name one thing today asked of you, and one thing you gave it.",
};
const DEFAULT_TONIGHT = "Before the day closes — name one thing your body carried today. Name it, thank it, close the book.";

export default function TonightReflection({ phase, onWrite }) {
  const prompt = TONIGHT[phase] || DEFAULT_TONIGHT;
  return (
    <section style={{ marginBottom: 44, background: "linear-gradient(135deg, #2B2230 0%, #3A2C30 100%)", borderRadius: 3, padding: "28px 30px 26px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Moon size={14} style={{ color: "#E8B4B8" }} />
        <Eyebrow color="#D3C3BB">Tonight's reflection · 90 seconds</Eyebrow>
      </div>
      <Script size={30} color="#F6ECE0" carve={false}>{prompt}</Script>
      <button onClick={() => onWrite && onWrite(prompt)} style={{
        marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6, background: "transparent",
        border: "none", cursor: "pointer", padding: 0, paddingBottom: 3,
        fontFamily: HAND, fontWeight: 600, fontSize: 19, color: "#F4E9DE", textShadow: PRESS_DARK,
        borderBottom: "1px solid rgba(244,233,222,0.5)",
      }}>Close the day <ArrowRight size={13} /></button>
    </section>
  );
}
