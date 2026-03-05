import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Lock, Clock, ChevronRight, Star } from "lucide-react";

const NEEDS = [
  { id: "sleep", label: "Sleep", emoji: "💤" },
  { id: "pms", label: "PMS / Cramps", emoji: "🌸" },
  { id: "calm", label: "Calm & Anxiety", emoji: "🌿" },
  { id: "energy", label: "Energy", emoji: "⚡" },
  { id: "mobility", label: "Mobility & Pain", emoji: "🤸" },
  { id: "menopause", label: "Menopause", emoji: "🌙" },
  { id: "postpartum", label: "Postpartum", emoji: "💝" },
];

const TIER_ORDER = { free: 0, plus: 1, pro: 2 };
const TIER_COLOR = { plus: "bg-rose-400 text-white", pro: "bg-purple-500 text-white" };

export default function ProgramsHub() {
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState("free");
  const [programs, setPrograms] = useState([]);
  const [userPrograms, setUserPrograms] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [activeNeed, setActiveNeed] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [progs, ups, ents, recs] = await Promise.all([
        base44.entities.Programs.list("-created_date", 50),
        base44.entities.UserPrograms.filter({ user_id: u.id }),
        base44.entities.Entitlements.filter({ user_id: u.id }),
        base44.entities.ProgramRecommendations.filter({ user_id: u.id }),
      ]);
      setPrograms(progs);
      setUserPrograms(ups);
      if (ents[0]) setUserPlan(ents[0].plan || "free");
      setRecommendations(recs);
      setLoading(false);
    })();
  }, []);

  const filtered = programs.filter((p) => {
    if (!activeNeed) return true;
    return (
      p.category?.toLowerCase().includes(activeNeed) ||
      p.goal_tags?.some((t) => t.toLowerCase().includes(activeNeed)) ||
      p.title?.toLowerCase().includes(activeNeed)
    );
  });

  const getUserProgram = (programId) => userPrograms.find((up) => up.program_id === programId);
  const isLocked = (p) => (TIER_ORDER[p.access_tier] || 0) > (TIER_ORDER[userPlan] || 0);
  const isRecommended = (programId) => recommendations.some((r) => r.program_id === programId);

  if (loading) return (
    <div className="min-h-screen femwell-gradient flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen femwell-gradient pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-rose-50 px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-rose-900 mb-3">Programs</h1>

        {/* Needs chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveNeed(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              !activeNeed ? "bg-rose-500 text-white shadow-md" : "bg-white/80 text-gray-600 border border-rose-100"
            }`}
          >
            All
          </button>
          {NEEDS.map((n) => (
            <button
              key={n.id}
              onClick={() => setActiveNeed(activeNeed === n.id ? null : n.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeNeed === n.id ? "bg-rose-500 text-white shadow-md" : "bg-white/80 text-gray-600 border border-rose-100"
              }`}
            >
              <span>{n.emoji}</span> {n.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-5 space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm">No programs for this need yet. Check back soon!</p>
          </div>
        ) : (
          filtered.map((program) => {
            const up = getUserProgram(program.id);
            const locked = isLocked(program);
            const recommended = isRecommended(program.id);

            return (
              <div key={program.id} className="card-glass rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                {/* Thumbnail strip */}
                <div className="h-28 bg-gradient-to-br from-rose-200 to-pink-300 relative overflow-hidden">
                  {program.thumbnail_url && (
                    <img src={program.thumbnail_url} alt={program.title} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {recommended && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <Star className="w-2.5 h-2.5" /> Recommended
                    </div>
                  )}
                  {program.access_tier && program.access_tier !== "free" && (
                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${TIER_COLOR[program.access_tier] || ""}`}>
                      {program.access_tier}
                    </div>
                  )}
                  {up && (
                    <div className="absolute bottom-2 left-2 bg-white/90 rounded-full px-2 py-0.5 text-[10px] font-medium text-rose-600">
                      Day {up.current_day} of {program.duration_days}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h2 className="font-bold text-gray-800 text-base leading-tight">{program.title}</h2>
                  {program.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{program.description}</p>
                  )}

                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    {program.duration_days && (
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{program.duration_days} days</span>
                    )}
                    {program.level && <span className="capitalize">{program.level}</span>}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <a
                      href={createPageUrl(`ProgramDetail?id=${program.id}`)}
                      className="flex-1 text-center py-2 rounded-xl border border-rose-200 text-rose-500 text-xs font-semibold hover:bg-rose-50 transition-colors"
                    >
                      {locked ? "Preview" : "View Details"}
                    </a>
                    {!locked && !up && (
                      <a
                        href={createPageUrl(`ProgramDetail?id=${program.id}`)}
                        className="flex-1 text-center py-2 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all"
                      >
                        Start Program
                      </a>
                    )}
                    {up && (
                      <a
                        href={createPageUrl(`ProgramDay?program_id=${program.id}&day=${up.current_day}`)}
                        className="flex-1 text-center py-2 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white text-xs font-semibold"
                      >
                        Continue →
                      </a>
                    )}
                    {locked && (
                      <a
                        href={createPageUrl("Upgrade")}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white text-xs font-semibold"
                      >
                        <Lock className="w-3 h-3" /> Unlock
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}