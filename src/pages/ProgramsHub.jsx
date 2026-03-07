import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Lock, Clock, ChevronRight, Zap } from "lucide-react";

const NEEDS = [
  { id: null, label: "All", emoji: "✨" },
  { id: "sleep", label: "Sleep", emoji: "💤" },
  { id: "pms", label: "PMS", emoji: "🌸" },
  { id: "anxiety", label: "Calm", emoji: "🌿" },
  { id: "energy", label: "Energy", emoji: "⚡" },
  { id: "mobility", label: "Mobility", emoji: "🤸" },
  { id: "menopause", label: "Menopause", emoji: "🌙" },
  { id: "postpartum", label: "Postpartum", emoji: "💝" },
  { id: "stress", label: "Stress", emoji: "🧘" },
];

const TIER_ORDER = { free: 0, plus: 1, pro: 2 };

const TIER_GRADIENT = {
  plus: "from-rose-400 to-pink-500",
  pro: "from-purple-500 to-indigo-500",
};

export default function ProgramsHub() {
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState("free");
  const [programs, setPrograms] = useState([]);
  const [userPrograms, setUserPrograms] = useState([]);
  const [activeNeed, setActiveNeed] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [progs, ups, ents] = await Promise.all([
        base44.entities.Programs.list("-created_date", 50),
        base44.entities.UserPrograms.filter({ user_id: u.id }),
        base44.entities.Entitlements.filter({ user_id: u.id }),
      ]);
      setPrograms(progs);
      setUserPrograms(ups);
      if (ents[0]) setUserPlan(ents[0].plan || "free");
      setLoading(false);
    })();
  }, []);

  const filtered = programs.filter((p) => {
    if (!activeNeed) return true;
    const tags = [(p.need_tags || ""), (p.category || ""), ...(p.goal_tags || [])].join(" ").toLowerCase();
    return tags.includes(activeNeed);
  });

  const getUserProgram = (programId) => userPrograms.find((up) => up.program_id === programId);
  const isLocked = (p) => (TIER_ORDER[p.access_tier] || 0) > (TIER_ORDER[userPlan] || 0);
  const getThumbnail = (p) => p.cover_thumbnail_url || p.thumbnail_url;

  const featuredPrograms = filtered.filter((p) => p.is_featured);
  const regularPrograms = filtered.filter((p) => !p.is_featured);

  if (loading) return (
    <div className="min-h-screen femwell-gradient flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen femwell-gradient pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-rose-50 px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Programs</h1>
        <p className="text-xs text-gray-400 mb-3">Structured journeys for your wellbeing</p>
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {NEEDS.map((n) => (
            <button
              key={String(n.id)}
              onClick={() => setActiveNeed(n.id)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeNeed === n.id
                  ? "bg-rose-500 text-white shadow-sm"
                  : "bg-white border border-rose-100 text-gray-600 hover:border-rose-200"
              }`}
            >
              <span>{n.emoji}</span> {n.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-5 space-y-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm">No programs for this need yet.</p>
          </div>
        ) : (
          <>
            {/* Featured Programs */}
            {featuredPrograms.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-rose-400" />
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Featured</h2>
                </div>
                <div className="space-y-4">
                  {featuredPrograms.map((program) => (
                    <ProgramCard
                      key={program.id}
                      program={program}
                      userProgram={getUserProgram(program.id)}
                      locked={isLocked(program)}
                      thumb={getThumbnail(program)}
                      featured
                    />
                  ))}
                </div>
              </section>
            )}

            {/* All Programs */}
            {regularPrograms.length > 0 && (
              <section>
                {featuredPrograms.length > 0 && (
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">All Programs</h2>
                )}
                <div className="space-y-3">
                  {regularPrograms.map((program) => (
                    <ProgramCard
                      key={program.id}
                      program={program}
                      userProgram={getUserProgram(program.id)}
                      locked={isLocked(program)}
                      thumb={getThumbnail(program)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ProgramCard({ program, userProgram, locked, thumb, featured }) {
  const tierGradient = TIER_GRADIENT[program.access_tier] || "from-rose-400 to-pink-500";

  return (
    <div className={`card-glass rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all ${featured ? "ring-1 ring-rose-200" : ""}`}>
      {/* Thumbnail */}
      <div className={`relative overflow-hidden ${featured ? "h-44" : "h-32"} bg-gradient-to-br from-rose-200 to-pink-300`}>
        {thumb && (
          <img src={thumb} alt={program.title} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Tier badge */}
        {program.access_tier && program.access_tier !== "free" && (
          <div className={`absolute top-2.5 right-2.5 bg-gradient-to-r ${tierGradient} px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase text-white shadow-sm`}>
            {program.access_tier}
          </div>
        )}

        {/* Progress badge */}
        {userProgram && (
          <div className="absolute bottom-2.5 left-2.5 bg-white/90 rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-rose-600">
            Day {userProgram.current_day} / {program.duration_days}
          </div>
        )}

        {locked && (
          <div className="absolute bottom-2.5 right-2.5 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center">
            <Lock className="w-3.5 h-3.5 text-rose-400" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h2 className="font-bold text-gray-800 text-sm leading-tight">{program.title}</h2>
        {(program.summary || program.description) && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
            {program.summary || program.description}
          </p>
        )}
        <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
          {program.duration_days && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {program.duration_days} days
            </span>
          )}
          {program.level && <span className="capitalize">{program.level}</span>}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <a
            href={createPageUrl(`ProgramDetail?key=${program.program_key}`)}
            className="flex-1 text-center py-2 rounded-xl border border-rose-200 text-rose-500 text-xs font-semibold hover:bg-rose-50 transition-colors"
          >
            {locked ? "Preview" : "Details"}
          </a>
          {userProgram ? (
            <a
              href={createPageUrl(`ProgramDay?key=${program.program_key}&day=${userProgram.current_day}`)}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white text-xs font-bold shadow-sm"
            >
              Continue <ChevronRight className="w-3 h-3" />
            </a>
          ) : locked ? (
            <a
              href={createPageUrl("Upgrade")}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white text-xs font-bold shadow-sm"
            >
              <Lock className="w-3 h-3" /> Unlock
            </a>
          ) : (
            <a
              href={createPageUrl(`ProgramDetail?key=${program.program_key}`)}
              className="flex-1 text-center py-2 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white text-xs font-bold shadow-sm"
            >
              Start →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}