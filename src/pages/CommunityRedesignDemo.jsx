// CommunityRedesignDemo — the Phase-1 Community REDESIGN shell (demo-first).
//
// Renders the REAL Community (CommunityInner) with the new 4-shelf canonical home
// (homeVariant="redesign"): Talk · Circles · Together · Quietly on the §6.8.2 page
// template — flora hero + tap-to-rebloom shelf switcher, summary card, glance⇆Jess
// sliding row, clipboard shelf-boards, handy row, one Jump sheet. Every existing
// feature view (rooms, circles, clubs, library, games, echo, rituals) is REUSED
// verbatim with real reads/writes; all safety rails intact (18+ age gate, crisis
// pre-check, anonymous service-role posting, moderation, report→hide, k-anon).
//
// Live /Community is UNTOUCHED (still the classic home) until Halli approves promotion.

import { useNavigate } from "react-router-dom";
import AgeGate from "@/components/safety/AgeGate";
import { CommunityInner } from "@/pages/Community";

export default function CommunityRedesignDemo() {
  const navigate = useNavigate();
  return (
    <AgeGate surfaceName="the Community" onDecline={() => navigate("/Today")}>
      <CommunityInner homeVariant="redesign" />
    </AgeGate>
  );
}
