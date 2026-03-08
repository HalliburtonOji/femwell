import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Loader2, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import NutritionTodayTab from "../components/nutrition/NutritionTodayTab";
import NutritionPlanTab from "../components/nutrition/NutritionPlanTab";
import NutritionProgressTab from "../components/nutrition/NutritionProgressTab";
import NutritionInsightsTab from "../components/nutrition/NutritionInsightsTab";

const TABS = [
  { id: "today", label: "Today", emoji: "🍽️" },
  { id: "plan", label: "Plan", emoji: "📅" },
  { id: "progress", label: "Progress", emoji: "📈" },
  { id: "insights", label: "Insights", emoji: "✨" },
];

export default function Nutrition() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [nutritionProfile, setNutritionProfile] = useState(null);
  const [checkin, setCheckin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("today");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dayKey = format(selectedDate, "yyyy-MM-dd");
  const isToday = dayKey === format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [profiles, nutProfiles, checkins] = await Promise.all([
        base44.entities.UserProfile.filter({ user_id: u.id }),
        base44.entities.NutritionProfile.filter({ user_id: u.id }),
        base44.entities.DailyCheckins.filter({ user_id: u.id, date: format(new Date(), "yyyy-MM-dd") }),
      ]);
      if (profiles[0]) setProfile(profiles[0]);
      if (nutProfiles[0]) setNutritionProfile(nutProfiles[0]);
      if (checkins[0]) setCheckin(checkins[0]);
      setLoading(false);
    })();
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
    <div className="min-h-screen femwell-gradient flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen femwell-gradient pb-28">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="pt-12 pb-4">
          <h1 className="text-2xl font-black text-rose-900">Nutrition</h1>
          <p className="text-sm text-gray-400 mt-0.5">Nourish. Track. Thrive.</p>
        </div>

        {/* Date selector (only on Today tab) */}
        {activeTab === "today" && (
          <div className="flex items-center justify-between mb-4 bg-white/60 rounded-2xl p-2">
            <button onClick={() => changeDay(-1)} className="w-8 h-8 rounded-xl hover:bg-rose-50 flex items-center justify-center">
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-800">
                {isToday ? "Today" : format(selectedDate, "EEEE")}
              </p>
              <p className="text-xs text-gray-400">{format(selectedDate, "MMMM d, yyyy")}</p>
            </div>
            <button onClick={() => changeDay(1)} disabled={isToday}
              className="w-8 h-8 rounded-xl hover:bg-rose-50 flex items-center justify-center disabled:opacity-30">
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex gap-1 mb-5 bg-white/60 rounded-2xl p-1">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === tab.id ? "bg-rose-500 text-white shadow-sm" : "text-gray-500"}`}>
              <span className="text-base">{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "today" && user && (
          <NutritionTodayTab
            user={user}
            profile={profile}
            nutritionProfile={nutritionProfile}
            dayKey={dayKey}
            checkin={checkin}
          />
        )}
        {activeTab === "plan" && user && (
          <NutritionPlanTab
            user={user}
            nutritionProfile={nutritionProfile}
          />
        )}
        {activeTab === "progress" && user && (
          <NutritionProgressTab
            user={user}
            nutritionProfile={nutritionProfile}
            onProfileUpdated={loadNutritionProfile}
          />
        )}
        {activeTab === "insights" && user && (
          <NutritionInsightsTab
            user={user}
            profile={profile}
          />
        )}
      </div>
    </div>
  );
}