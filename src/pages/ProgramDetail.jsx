import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Clock, Lock, Play, ChevronRight } from "lucide-react";

export default function ProgramDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const programId = urlParams.get("id");

  const [program, setProgram] = useState(null);
  const [days, setDays] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [userProgram, setUserProgram] = useState(null);
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!programId) return;
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [progs, ds, ts, ups, ents] = await Promise.all([
        base44.entities.Programs.list("-created_date", 100),
        base44.entities.ProgramDays.filter({ program_id: programId }),
        base44.entities.ProgramTasks.filter({ program_id: programId }),
        base44.entities.UserPrograms.filter({ user_id: u.id, program_id: programId }),
        base44.entities.Entitlements.filter({ user_id: u.id }),
      ]);
      setProgram(progs.find((p) => p.id === programId));
      setDays(ds.sort((a, b) => a.day_number - b.day_number));
      setTasks(ts.sort((a, b) => a.task_order - b.task_order));
      setUserProgram(ups[0] || null);
      if (ents[0]) setUserPlan(ents[0].plan || "free");
      setLoading(false);
    })();
  }, [programId]);

  const startProgram = async () => {
    setStarting(true);
    const up = await base44.entities.UserPrograms.create({
      user_id: user.id, program_id: programId,
      started_at: new Date().toISOString(), current_day: 1, status: "active",
    });
    setUserProgram(up);
    setStarting(false);
  };

  if (loading) return <div className="min-h-screen femwell-gradient flex items-center justify-center"><div className="w-10 h-10 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" /></div>;
  if (!program) return <div className="min-h-screen femwell-gradient flex items-center justify-center"><p className="text-gray-400">Program not found.</p></div>;

  const tierOrder = { free: 0, plus: 1, pro: 2 };
  const planOrder = { free: 0, plus: 1, pro: 2 };
  const locked = (tierOrder[program.access_tier] || 0) > (planOrder[userPlan] || 0);

  const day1Tasks = tasks.filter((t) => t.day_number === 1);

  return (
    <div className="min-h-screen femwell-gradient pb-10">
      <div className="max-w-md mx-auto">
        <div className="h-48 bg-gradient-to-br from-rose-200 to-pink-300 relative flex items-center justify-center">
          {program.thumbnail_url && <img src={program.thumbnail_url} alt={program.title} className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-black/20" />
          <button onClick={() => window.history.back()} className="absolute top-12 left-4 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>
          <span className="text-6xl relative z-10">🌸</span>
        </div>

        <div className="px-4 py-5 space-y-4">
          <div>
            <p className="text-xs text-rose-500 font-medium uppercase tracking-wide mb-1">Program</p>
            <h1 className="text-2xl font-bold text-gray-800">{program.title}</h1>
            <div className="flex gap-2 mt-2 text-xs text-gray-400">
              {program.duration_days && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{program.duration_days} days</span>}
              {program.level && <span className="capitalize">{program.level}</span>}
              {program.access_tier && program.access_tier !== "free" && (
                <span className="bg-rose-100 text-rose-500 px-2 py-0.5 rounded-full font-bold uppercase">{program.access_tier}</span>
              )}
            </div>
          </div>

          {program.description && <p className="text-sm text-gray-500 leading-relaxed">{program.description}</p>}

          {locked ? (
            <div className="card-glass rounded-2xl p-6 text-center space-y-3">
              <Lock className="w-10 h-10 mx-auto text-rose-300" />
              <p className="font-semibold text-gray-700">Requires {program.access_tier} plan</p>
              <a href={createPageUrl("Upgrade")} className="btn-primary inline-block">Upgrade to unlock</a>
            </div>
          ) : !userProgram ? (
            <button onClick={startProgram} disabled={starting} className="btn-primary w-full">
              {starting ? "Starting..." : "Start Program →"}
            </button>
          ) : (
            <a href={createPageUrl(`ProgramDay?program_id=${programId}&day=${userProgram.current_day}`)} className="btn-primary w-full text-center block">
              Continue Day {userProgram.current_day} →
            </a>
          )}

          {/* Day previews */}
          {days.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-700 text-sm mb-3">Program Overview</h2>
              <div className="space-y-2">
                {days.slice(0, 7).map((d) => (
                  <div key={d.id} className="card-glass rounded-2xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-600 flex-shrink-0">
                      {d.day_number}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{d.theme_title || `Day ${d.day_number}`}</p>
                      {d.theme_description && <p className="text-xs text-gray-400">{d.theme_description}</p>}
                    </div>
                  </div>
                ))}
                {days.length > 7 && <p className="text-xs text-gray-400 text-center">+{days.length - 7} more days</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}