// CommunityTodayCard (W2) — a quiet bridge from Today into /Community.
// Per COMMUNITY_MEGA_PLAN §6.2: a gentle belonging signal + the day's question,
// one-way and opt-in. NO counts, NO FOMO, no streaks — just a soft door.
// Matches the Today design system (var(--*) tokens); Lucide only, no emoji.

import { Link } from "react-router-dom";
import { Users, ArrowRight } from "lucide-react";
import { createPageUrl } from "@/utils";
import { qotdForDay } from "@/components/community/communityConfig";

// A soft, count-free belonging line per life stage (no number to narrow).
const SEASON_LINE = {
  "teen": "Others finding their feet are in Community today.",
  "reproductive": "Other women riding the same monthly tides are in Community today.",
  "pre-ttc": "Others getting ready, in their own time, are in Community.",
  "ttc": "Others in the waiting and the hoping are in Community.",
  "pregnant-t1": "Others early in it are in Community today.",
  "pregnant-t2": "Others carrying alongside you are in Community.",
  "pregnant-t3": "Others near the end of the wait are in Community.",
  "postpartum": "Others in the fourth trimester are in Community.",
  "perimenopause": "Others naming the shift are in Community today.",
  "menopause": "Others through it and out the other side are in Community.",
  "post-menopause": "Others in this next chapter are in Community.",
};
const DEFAULT_LINE = "Other women are in Community today — quietly, no names.";

export default function CommunityTodayCard({ profile }) {
  const stage = profile?.life_stage || null;
  const line = (stage && SEASON_LINE[stage]) || DEFAULT_LINE;
  const qotd = qotdForDay();

  return (
    <Link to={createPageUrl("Community")} style={{ textDecoration: "none", display: "block" }}>
      <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 16px", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
          <Users className="w-3.5 h-3.5" style={{ color: "var(--mauve)" }} />
          <span style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)" }}>Community</span>
        </div>
        <p style={{ fontSize: 14, color: "var(--plum)", lineHeight: 1.5, marginBottom: 10 }}>{line}</p>
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 9 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mauve)", marginBottom: 3 }}>Today's question</p>
          <p style={{ fontSize: 13.5, color: "var(--plum)", lineHeight: 1.45, fontStyle: "italic" }}>{qotd.text}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 10, fontSize: 12, fontWeight: 700, color: "var(--rose-dust)" }}>
          Step into Community <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
}
