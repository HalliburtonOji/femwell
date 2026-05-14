import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import NutritionTodayTab from "../components/nutrition/NutritionTodayTab";
import NutritionPlanTab from "../components/nutrition/NutritionPlanTab";
import NutritionProgressTab from "../components/nutrition/NutritionProgressTab";
import NutritionInsightsTab from "../components/nutrition/NutritionInsightsTab";
import RecipeGeneratorTab from "../components/nutrition/RecipeGeneratorTab";
import MealPlanGeneratorTab from "../components/nutrition/MealPlanGeneratorTab";
import ShoppingListTab from "../components/nutrition/ShoppingListTab";

const TABS = [
  { id: "today",    label: "Today"    },
  { id: "plan",     label: "My Plan"  },
  { id: "recipes",  label: "Recipes"  },
  { id: "mealgen",  label: "AI Plan"  },
  { id: "shopping", label: "Shop"     },
  { id: "progress", label: "Progress" },
  { id: "insights", label: "Insights" },
];

const sLabel = {
  fontSize: "0.6rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--mauve)",
  fontFamily: "'Inter', sans-serif",
};

export default function Nutrition() {
  const [user, setUser]                       = useState(null);
  const [profile, setProfile]                 = useState(null);
  const [nutritionProfile, setNutritionProfile] = useState(null);
  const [checkin, setCheckin]                 = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [activeTab, setActiveTab]             = useState("today");

  // Deep-link: ?tab=hydration or ?tab=xxx maps to our tab IDs
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    const tabMap = { hydration: "today", today: "today", plan: "plan", recipes: "recipes", mealgen: "mealgen", shopping: "shopping", progress: "progress", insights: "insights" };
    if (tabParam && tabMap[tabParam]) setActiveTab(tabMap[tabParam]);
  }, []);
  const [selectedDate, setSelectedDate]       = useState(new Date());

  const dayKey  = format(selectedDate, "yyyy-MM-dd");
  const isToday = dayKey === format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    let unsubscribeHydration;
    let unsubscribeMeals;
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const [profiles, nutProfiles, checkins] = await Promise.all([
          base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []),
          base44.entities.NutritionProfile.filter({ user_id: u.id }).catch(() => []),
          base44.entities.DailyCheckins.filter({ user_id: u.id, date: format(new Date(), "yyyy-MM-dd") }).catch(() => []),
        ]);
        if (profiles[0]) setProfile(profiles[0]);
        if (nutProfiles[0]) setNutritionProfile(nutProfiles[0]);
        if (checkins[0]) setCheckin(checkins[0]);
        try { unsubscribeHydration = base44.entities.HydrationLog.subscribe(() => setSelectedDate(d => new Date(d))); } catch {}
        try { unsubscribeMeals = base44.entities.MealLog.subscribe(() => setSelectedDate(d => new Date(d))); } catch {}
      } catch (err) {
        console.error("Nutrition page init failed:", err);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      unsubscribeHydration?.();
      unsubscribeMeals?.();
    };
  }, []);

  const changeDay = (offset) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d);
  };

  const loadNutritionProfile = async () => {
    if (!user) return;
    const profiles = await base44.entities.NutritionProfile.filter({ user_id: user.id });
    setNutritionProfile(profiles[0] || null);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
    </div>
  );

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="pt-10 pb-5 flex items-end justify-between flex-wrap gap-4">
          <div>
            <p style={sLabel} className="mb-1.5">Wellness Studio</p>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight"
              style={{ fontFamily: "'Fraunces', serif", color: "var(--plum)", letterSpacing: "-0.02em" }}>
              Nutrition
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
              Plan, log, and understand your food
            </p>
          </div>

          {activeTab === "today" && (
            <div className="flex items-center gap-2 rounded-2xl px-3 py-2"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
              <button onClick={() => changeDay(-1)}
                className="w-7 h-7 rounded-xl flex items-center justify-center transition-colors"
                style={{ color: "var(--mauve)" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--ivory-dark)"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-center min-w-[110px]">
                <p className="text-sm font-semibold" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                  {isToday ? "Today" : format(selectedDate, "EEEE")}
                </p>
                <p className="text-xs" style={{ color: "var(--mauve)" }}>{format(selectedDate, "MMMM d, yyyy")}</p>
              </div>
              <button onClick={() => changeDay(1)} disabled={isToday}
                className="w-7 h-7 rounded-xl flex items-center justify-center transition-colors disabled:opacity-30"
                style={{ color: "var(--mauve)" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--ivory-dark)"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ── Tab Bar ─────────────────────────────────────────────────── */}
        <div className="overflow-x-auto pb-1 mb-6" style={{ scrollbarWidth: "none" }}>
          <div className="flex gap-1 w-max p-1 rounded-2xl"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  backgroundColor: activeTab === tab.id ? "var(--plum)" : "transparent",
                  color: activeTab === tab.id ? "white" : "var(--mauve)",
                  fontFamily: "'Inter', sans-serif",
                }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ─────────────────────────────────────────────── */}
        {activeTab === "today"    && user && <NutritionTodayTab user={user} profile={profile} nutritionProfile={nutritionProfile} dayKey={dayKey} checkin={checkin} />}
        {activeTab === "plan"     && user && <NutritionPlanTab user={user} nutritionProfile={nutritionProfile} />}
        {activeTab === "recipes"  && user && <RecipeGeneratorTab user={user} />}
        {activeTab === "mealgen"  && user && <MealPlanGeneratorTab user={user} nutritionProfile={nutritionProfile} />}
        {activeTab === "shopping" && user && <ShoppingListTab user={user} />}
        {activeTab === "progress" && user && <NutritionProgressTab user={user} nutritionProfile={nutritionProfile} onProfileUpdated={loadNutritionProfile} />}
        {activeTab === "insights" && user && <NutritionInsightsTab user={user} profile={profile} />}
      </div>
    </div>
  );
}