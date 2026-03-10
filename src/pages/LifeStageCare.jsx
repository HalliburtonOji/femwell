import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ChevronLeft } from "lucide-react";
import PregnancySupportTab from "../components/lifestages/PregnancySupportTab";
import MenopauseSupportTab from "../components/lifestages/MenopauseSupportTab";

export default function LifeStageCare() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pregnancy");
  const [pregnancyProfile, setPregnancyProfile] = useState(null);
  const [pregnancyLogs, setPregnancyLogs] = useState([]);
  const [menopauseProfile, setMenopauseProfile] = useState(null);
  const [menopauseLogs, setMenopauseLogs] = useState([]);

  useEffect(() => {
    (async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const [pregProfiles, pregDaily, menoProfiles, menoDaily] = await Promise.all([
        base44.entities.PregnancyProfile.filter({ user_id: currentUser.id }),
        base44.entities.PregnancyDailyLog.filter({ user_id: currentUser.id }, "-date", 30),
        base44.entities.MenopauseProfile.filter({ user_id: currentUser.id }),
        base44.entities.MenopauseDailyLog.filter({ user_id: currentUser.id }, "-date", 30),
      ]);

      setPregnancyProfile(pregProfiles[0] || null);
      setPregnancyLogs(pregDaily);
      setMenopauseProfile(menoProfiles[0] || null);
      setMenopauseLogs(menoDaily);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen femwell-gradient flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen femwell-gradient pb-28">
      <div className="max-w-4xl mx-auto px-4">
        <div className="pt-12 pb-5 flex items-center gap-3">
          <a href={createPageUrl("Profile")} className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </a>
          <div>
            <p className="text-sm text-gray-400">Personalized care</p>
            <h1 className="text-2xl font-bold text-rose-900">Pregnancy & Menopause Support</h1>
          </div>
        </div>

        <div className="card-glass rounded-3xl p-5 mb-4 bg-gradient-to-r from-rose-50/90 to-violet-50/80 border border-rose-100">
          <p className="text-sm text-gray-700 leading-relaxed">
            A dedicated space for life-stage support with daily tracking, tailored setup, and gentle AI guidance for pregnancy and menopause.
          </p>
        </div>

        <div className="flex gap-1 mb-5 bg-white/60 rounded-2xl p-1">
          <button
            onClick={() => setActiveTab("pregnancy")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "pregnancy" ? "bg-rose-500 text-white shadow-sm" : "text-gray-500"}`}
          >
            🤰 Pregnancy
          </button>
          <button
            onClick={() => setActiveTab("menopause")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "menopause" ? "bg-rose-500 text-white shadow-sm" : "text-gray-500"}`}
          >
            🌤️ Menopause
          </button>
        </div>

        {activeTab === "pregnancy" ? (
          <PregnancySupportTab
            user={user}
            profile={pregnancyProfile}
            setProfile={setPregnancyProfile}
            logs={pregnancyLogs}
            setLogs={setPregnancyLogs}
          />
        ) : (
          <MenopauseSupportTab
            user={user}
            profile={menopauseProfile}
            setProfile={setMenopauseProfile}
            logs={menopauseLogs}
            setLogs={setMenopauseLogs}
          />
        )}
      </div>
    </div>
  );
}