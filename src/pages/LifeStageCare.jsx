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
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const [pregProfiles, pregDaily, menoProfiles, menoDaily] = await Promise.all([
          base44.entities.PregnancyProfile.filter({ user_id: currentUser.id }).catch(() => []),
          base44.entities.PregnancyDailyLog.filter({ user_id: currentUser.id }, "-date", 30).catch(() => []),
          base44.entities.MenopauseProfile.filter({ user_id: currentUser.id }).catch(() => []),
          base44.entities.MenopauseDailyLog.filter({ user_id: currentUser.id }, "-date", 30).catch(() => []),
        ]);

        setPregnancyProfile(pregProfiles[0] || null);
        setPregnancyLogs(pregDaily);
        setMenopauseProfile(menoProfiles[0] || null);
        setMenopauseLogs(menoDaily);
      } catch (err) {
        console.error("LifeStageCare init failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="pt-12 pb-5 flex items-center gap-3">
          <a href={createPageUrl("Profile")}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
            <ChevronLeft className="w-4 h-4" style={{ color: "var(--mauve)" }} />
          </a>
          <div>
            <p className="text-sm" style={{ color: "var(--mauve)" }}>Personalized care</p>
            <h1 className="text-2xl font-bold" style={{ color: "var(--plum)" }}>Pregnancy & Menopause Support</h1>
          </div>
        </div>

        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 24, padding: 20, marginBottom: 16, boxShadow: "var(--shadow-sm)" }}>
          <p className="text-sm leading-relaxed" style={{ color: "var(--plum)" }}>
            A dedicated space for life-stage support with daily tracking, tailored setup, and gentle AI guidance for pregnancy and menopause.
          </p>
        </div>

        <div className="flex gap-1 mb-5 rounded-2xl p-1" style={{ backgroundColor: "var(--ivory-dark)", border: "1px solid var(--border)" }}>
          <button
            onClick={() => setActiveTab("pregnancy")}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={activeTab === "pregnancy" ? { backgroundColor: "var(--rose-dust)", color: "white" } : { color: "var(--mauve)" }}
          >
            Pregnancy
          </button>
          <button
            onClick={() => setActiveTab("menopause")}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={activeTab === "menopause" ? { backgroundColor: "var(--rose-dust)", color: "white" } : { color: "var(--mauve)" }}
          >
            Menopause
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