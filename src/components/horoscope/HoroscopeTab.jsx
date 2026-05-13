import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import {
  getSunSign,
  getSunDegree,
  getRulingPlanet,
  getZodiacGlyph,
  getMoonPhase,
} from "@/utils/astrology";
import { useBirthChart } from "./hooks/useBirthChart";
import BirthDataSheet from "./BirthDataSheet";
import TwilightHero from "./sections/TwilightHero";
import TriadCards from "./sections/TriadCards";
import TodaysWeather from "./sections/TodaysWeather";
import CycleMoonDial from "./sections/CycleMoonDial";
import SkyDiary from "./sections/SkyDiary";
import RedWhiteMoon from "./sections/RedWhiteMoon";
import AnnualProfections from "./sections/AnnualProfections";
import Compatibility from "./sections/Compatibility";
import AskTheSky from "./sections/AskTheSky";
import QuietModeToggle from "./sections/QuietModeToggle";
import ScienceFooter from "./sections/ScienceFooter";
import PrivacyLine from "./sections/PrivacyLine";
import GoddessBench from "./sections/GoddessBench";
import AtelierReading from "./sections/AtelierReading";
import PaidShelf from "./sections/PaidShelf";

// ─────────────────────────────────────────────────────────────────────────────
// HoroscopeTab — shell component at src/components/horoscope/HoroscopeTab.jsx.
//
// Data is loaded by useBirthChart (hooks/useBirthChart.js). Derived chart facts
// are memoised here and forwarded to each section component.
//
// Sections active in this commit (H2a):
//   TwilightHero, TriadCards, TodaysWeather, CycleMoonDial, SkyDiary,
//   Compatibility, AskTheSky
//
// All sections active through H2d:
//   TwilightHero, TriadCards, GoddessBench, TodaysWeather, CycleMoonDial,
//   SkyDiary, RedWhiteMoon, AnnualProfections, Compatibility, AskTheSky,
//   QuietModeToggle, ScienceFooter, PrivacyLine, AtelierReading, PaidShelf
// ─────────────────────────────────────────────────────────────────────────────

export default function HoroscopeTab(props) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const {
    user, astro, reading,
    userProfile, lifestyleProfile,
    loading, setAstro, setReading,
  } = useBirthChart(props.userProfile, props.lifestyleProfile);

  const chart = useMemo(() => deriveChart(astro, userProfile), [astro, userProfile]);
  const cycleInfo = useMemo(() => derivePhaseInfo(userProfile), [userProfile]);
  const cyclePhase = cycleInfo.phase;
  const cycleDay = cycleInfo.day;
  const cycleLength = cycleInfo.length;
  const moon = useMemo(() => getMoonPhase(new Date()), []);

  if (loading) {
    return <div style={loadingStyle}>Reading the sky\u2026</div>;
  }

  if (!astro) {
    return (
      <div>
        <OnboardingCard onOpen={() => setSheetOpen(true)} />
        <BirthDataSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          userId={user?.id}
          initial={null}
          userProfile={userProfile}
          onSaved={(saved) => setAstro(saved)}
        />
      </div>
    );
  }

  return (
    <div style={tabShellStyle}>
      <TwilightHero
        chart={chart}
        moon={moon}
        reading={reading}
        cyclePhase={cyclePhase}
        cycleDay={cycleDay}
      />
      <TriadCards
        chart={chart}
        astro={astro}
        reading={reading}
        onAddBirthTime={() => setSheetOpen(true)}
      />
      <GoddessBench astro={astro} userProfile={userProfile} reading={reading} />
      <TodaysWeather reading={reading} chart={chart} />
      <CycleMoonDial
        cyclePhase={cyclePhase}
        cycleDay={cycleDay}
        cycleLength={cycleLength}
        moon={moon}
        reading={reading}
      />
      <SkyDiary reading={reading} userId={user?.id} userProfile={userProfile} />
      <RedWhiteMoon userId={user?.id} />
      <AnnualProfections userId={user?.id} userProfile={userProfile} astro={astro} />
      <Compatibility userId={user?.id} chart={chart} userProfile={userProfile} />
      <AskTheSky userId={user?.id} />
      <QuietModeToggle userId={user?.id} />
      <ScienceFooter />
      <PrivacyLine />
      <AtelierReading userId={user?.id} user={user} />
      <PaidShelf userId={user?.id} />

      <BirthDataSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        userId={user?.id}
        initial={astro}
        userProfile={userProfile}
        onSaved={(saved) => setAstro(saved)}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function deriveChart(astro, userProfile) {
  const birthday =
    astro?.birth_date ||
    userProfile?.birthday ||
    userProfile?.date_of_birth ||
    null;
  const sun = astro?.sun_sign || getSunSign(birthday);
  const sunDegree = birthday ? getSunDegree(birthday) : null;
  return {
    birthday,
    sun,
    sunDegree,
    sunRuler: sun ? getRulingPlanet(sun) : null,
    sunGlyph: sun ? getZodiacGlyph(sun) : null,
    moonSign: astro?.moon_sign || null,
    risingSign: astro?.rising_sign || null,
    hasBirthTime: !!astro?.birth_time,
    place: astro?.birth_place || null,
    name: userProfile?.preferred_name || userProfile?.first_name || "",
  };
}

function derivePhaseInfo(userProfile) {
  if (!userProfile?.last_period_start_date) {
    return { phase: null, day: null, length: 28 };
  }
  const last = new Date(userProfile.last_period_start_date);
  const cycleLen = userProfile.cycle_avg_length || 28;
  const periodLen = userProfile.period_length || 5;
  const diffDays = Math.floor((Date.now() - last.getTime()) / 86400000);
  const day = ((diffDays % cycleLen) + cycleLen) % cycleLen + 1;
  let phase = "luteal";
  if (day <= periodLen) phase = "menstrual";
  else if (day <= 13) phase = "follicular";
  else if (day <= 16) phase = "ovulatory";
  return { phase, day, length: cycleLen };
}

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding card — shown when no AstroProfile row exists yet
// ─────────────────────────────────────────────────────────────────────────────
function OnboardingCard({ onOpen }) {
  return (
    <div style={onboardingStyle}>
      <div style={onboardingGradientStyle} aria-hidden="true" />
      <Sparkles size={28} style={{ color: "var(--cream, #FAF4EA)", position: "relative", zIndex: 1 }} />
      <h2 style={onboardingTitleStyle}>Read me the sky</h2>
      <p style={onboardingBodyStyle}>
        FemWell writes you a daily reading based on your chart and your cycle. To start, we need your birth date. Birth time and place unlock your moon and rising too.
      </p>
      <button type="button" onClick={onOpen} style={onboardingBtnStyle}>
        Tell us when
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
// Page-level wrap. TwilightHero uses margin: 0 -18px to bleed back to the
// shell edges (within this 480px container), so the gradient hero is full
// width of the shell but bounded by maxWidth on tablet/desktop. maxWidth
// + margin auto keeps the column readable at tablet/desktop per the
// FemWell one-unified-bottom-nav contract (feedback_femwell_multiplatform.md).
// paddingBottom keeps the last paid card clear of the bottom nav.
// Width is inherited from the Lifestyle page wrapper (which already
// width-constrains per `feedback_femwell_multiplatform.md`). Adding our own
// maxWidth here squished the cards inside an already-constrained column on
// tablet/desktop. Just give the sections page padding and bottom-nav clearance.
const tabShellStyle = {
  padding: "0 16px",
  paddingBottom: 96,
};
const loadingStyle = {
  padding: "60px 24px",
  textAlign: "center",
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  color: "var(--plum-mute, #6b4a56)",
};
const onboardingStyle = {
  position: "relative",
  overflow: "hidden",
  borderRadius: 22,
  padding: "40px 28px",
  textAlign: "center",
  color: "var(--cream, #FAF4EA)",
  background: "radial-gradient(circle at 30% 20%, #3a2a4c 0%, #221a2e 60%, #15101e 100%)",
  boxShadow: "0 2px 4px rgba(43,30,22,0.10), 0 12px 32px rgba(43,30,22,0.18)",
};
const onboardingGradientStyle = {
  position: "absolute", inset: 0,
  background:
    "radial-gradient(circle at 85% 15%, rgba(232,196,208,0.22) 0%, rgba(232,196,208,0) 30%)," +
    "radial-gradient(circle at 10% 80%, rgba(150,120,180,0.20) 0%, rgba(150,120,180,0) 35%)",
  pointerEvents: "none",
};
const onboardingTitleStyle = {
  position: "relative",
  fontFamily: "'Fraunces', serif",
  fontWeight: 300,
  fontSize: 30,
  color: "var(--cream, #FAF4EA)",
  margin: "16px 0 10px",
  letterSpacing: "-0.01em",
};
const onboardingBodyStyle = {
  position: "relative",
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  lineHeight: 1.6,
  color: "rgba(247,239,225,0.84)",
  margin: "0 auto 20px",
  maxWidth: 380,
};
const onboardingBtnStyle = {
  position: "relative",
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  fontSize: 14,
  color: "var(--cream, #FAF4EA)",
  background: "var(--rose-primary, #D45E52)",
  border: "none",
  borderRadius: 9999,
  padding: "12px 22px",
  cursor: "pointer",
  minHeight: 44,
  boxShadow: "0 2px 8px rgba(212,94,82,0.30)",
};