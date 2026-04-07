/**
 * SmartContextBanner — surfaces smart cross-app suggestions based on:
 * - Current cycle phase
 * - Recent check-in data
 * - Active programs
 * - Life stage (pregnancy/menopause)
 * - Nutrition / meal gaps
 */
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { differenceInDays, parseISO } from "date-fns";
import { ChevronRight, X } from "lucide-react";
import { createPageUrl } from "@/utils";

const todayStr = new Date().toISOString().split("T")[0];

function getPhase(lastPeriodDate, cycleLen = 28, periodLen = 5) {
  if (!lastPeriodDate) return null;
  const diff = differenceInDays(new Date(), parseISO(lastPeriodDate));
  const day = (diff % cycleLen) + 1;
  if (day <= periodLen) return "menstrual";
  if (day <= 13) return "follicular";
  if (day <= 16) return "ovulatory";
  return "luteal";
}

const PHASE_SUGGESTIONS = {
  menstrual: [
    { text: "You're in your menstrual phase — gentle breathwork can ease cramps.", action: "Explore breathwork", route: "/Explore?type=Audio", color: "#C4849A", bg: "#F5ECF0" },
    { text: "Iron and magnesium are key right now. Check your nutrition guide.", action: "Nutrition tips", route: "/Nutrition", color: "#C4849A", bg: "#F5ECF0" },
  ],
  follicular: [
    { text: "Follicular phase: your energy is rising — great time to start a new program.", action: "Browse programs", route: "/ProgramsHub", color: "#7A9E8E", bg: "#EBF2EF" },
    { text: "Your skin is most resilient now. Introduce actives safely.", action: "Skin & Hair guide", route: "/SkinHair", color: "#7A9E8E", bg: "#EBF2EF" },
  ],
  ovulatory: [
    { text: "Peak oestrogen — you may feel more social and confident. Lean in.", action: "Read: Ovulation & confidence", route: "/Lifestyle?tab=femwell", color: "#B89E6A", bg: "#F5F0E6" },
    { text: "Testosterone spike may cause oiliness. Adjust your skincare now.", action: "Skin tracker", route: "/SkinHair", color: "#B89E6A", bg: "#F5F0E6" },
  ],
  luteal: [
    { text: "Luteal phase: niacinamide and salicylic acid help with hormonal breakouts.", action: "Skin & Hair", route: "/SkinHair", color: "#8A7E88", bg: "#F0EBF0" },
    { text: "Craving carbs before your period is hormonal — here's what to eat.", action: "Nutrition guide", route: "/Nutrition", color: "#8A7E88", bg: "#F0EBF0" },
  ],
};

export default function SmartContextBanner({ profile, todayCheckin, currentPage }) {
  const [suggestions, setSuggestions] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    if (!profile) return;
    const phase = getPhase(profile.last_period_start_date, profile.cycle_avg_length || 28, profile.period_length || 5);
    const all = [];

    // Phase-based suggestions
    if (phase && PHASE_SUGGESTIONS[phase]) {
      const phaseSugs = PHASE_SUGGESTIONS[phase].filter(s => !s.route.includes(currentPage));
      all.push(...phaseSugs.slice(0, 1));
    }

    // Check-in gap
    if (!todayCheckin) {
      all.push({ text: "You haven't checked in today — it only takes 30 seconds.", action: "Log today", route: "/Today?open_log=1", color: "var(--mauve)", bg: "var(--mauve-subtle)" });
    }

    // Pregnancy / menopause
    if (profile.condition_flags?.includes("pregnant") || profile.condition_flags?.includes("pregnancy")) {
      all.push({ text: "Your pregnancy tracker has tools for this week.", action: "Pregnancy support", route: "/LifeStageCare", color: "#C4849A", bg: "#F5ECF0" });
    }
    if (profile.condition_flags?.includes("menopause") || profile.condition_flags?.includes("perimenopause")) {
      all.push({ text: "Your menopause symptom log — track today to see your patterns.", action: "Symptom log", route: "/LifeStageCare", color: "#B89E6A", bg: "#F5F0E6" });
    }

    // Filter out any suggestion pointing to current page
    const filtered = all.filter(s => !s.route.startsWith(`/${currentPage}`));
    setSuggestions(filtered.slice(0, 2));
  }, [profile, todayCheckin, currentPage]);

  const visible = suggestions.filter(s => !dismissed.has(s.text));
  if (visible.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
      {visible.map(s => (
        <div key={s.text} style={{ backgroundColor: s.bg, border: `1px solid ${s.color}30`, borderRadius: 14, padding: "10px 12px 10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, color: "var(--plum)", lineHeight: 1.5, margin: 0, fontFamily: "'Inter', sans-serif" }}>{s.text}</p>
            <a href={s.route} style={{ fontSize: 11, fontWeight: 700, color: s.color, fontFamily: "'Inter', sans-serif", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 2, marginTop: 2 }}>
              {s.action} <ChevronRight style={{ width: 10, height: 10 }} />
            </a>
          </div>
          <button onClick={() => setDismissed(d => new Set([...d, s.text]))} style={{ border: "none", background: "none", cursor: "pointer", padding: 2, flexShrink: 0 }}>
            <X style={{ width: 12, height: 12, color: s.color, opacity: 0.6 }} />
          </button>
        </div>
      ))}
    </div>
  );
}