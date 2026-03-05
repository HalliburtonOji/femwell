import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Clock, Lock, Play, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";

const TIER_ORDER = { free: 0, plus: 1, pro: 2 };

export default function ProgramDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const programKey = urlParams.get("key");

  const [program, setProgram] = useState(null);
  const [days, setDays] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [userProgram, setUserProgram] = useState(null);
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [expandedDay, setExpandedDay] = useState(null);

  useEffect(() => {
    if (!programKey) return;
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [progs, ents] = await Promise.all([
        base44.entities.Programs.filter({ program_key: programKey }),
        base44.entities.Entitlements.filter({ user_id: u.id }),
      ]);
      const prog = progs[0];
      if (!prog) { setLoading(false); return; }
      setProgram(prog);
      if (ents[0]) setUserPlan(ents[0].plan || "free");

      const [ds, ts, ups] = await Promise.all([
        base44.entities.ProgramDays.filter({ program_key: programKey }),
        base44.entities.ProgramTasks.filter({ program_key: programKey }),
        base44.entities.UserPrograms.filter({ user_id: u.id, program_id: prog.id }),
      ]);
      setDays(ds.sort((a, b) => a.day_number - b.day_number));
      setTasks(ts.sort((a, b) => (a.order_index || a.task_order || 0) - (b.order_index || b.task_order || 0)));
      setUserProgram(ups[0] || null);
      setLoading(false);
    })();
  }, [programKey]);

  const startProgram = async () => {
    setStarting(true);
    const up = await base44.entities.UserPrograms.create({
      user_id: user.id, program_id: program.id,
      started_at: new Date().toISOString(), current_day: 1, status: "active",
    });
    setUserProgram(up);
    setStarting(false);
  };

  if (loading) return (
    <div className="min-h-screen femwell-gradient flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
    </div>
  );

  if (!program) return (
    <div className="min-h-screen femwell-gradient flex items-center justify-center">
      <p className="text-gray-400">Program not found.</p>
    </div>
  );

  const locked = (TIER_ORDER[program.access_tier] || 0) > (TIER_ORDER[userPlan] || 0);
  const tasksForDay = (dayNum) => tasks.filter((t) => t.day_number === dayNum);
  const thumb = program.cover_thumbnail_url || program.thumbnail_url;

  return (
    <div className="min-h-screen femwell-gradient pb-10">
      <div className="max-w-md mx-auto">
        <div className="h-52 bg-gradient-to-br from-rose-200 to-pink-300 relative flex items-center justify-center overflow-hidden">
          {thumb && <img src={thumb} alt={program.title} className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-black/30" />
          <button onClick={() => window.history.back()} className="absolute top-12 left-4 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center z-10">
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>
          <div className="relative z-10 text-center px-4">
            <p className="text-white/80 text-xs font-medium uppercase tracking-wide mb-1">{program.category || "Program"}</p>
            <h1 className="text-2xl font-bold text-white drop-shadow">{program.title}</h1>
          </div>
        </div>

        <div className="px-4 py-5 space-y-5">
          <div className="flex flex-wrap gap-2 text-xs">
            {program.duration_days && (
              <span className="flex items-center gap-1 bg-rose-50 text-rose-500 px-3 py-1 rounded-full font-medium">
                <Clock className="w-3 h-3" /> {program.duration_days} days
              </span>
            )}
            {program.level && (
              <span className="bg-rose-50 text-rose-500 px-3 py-1 rounded-full font-medium capitalize">{program.level}</span>
            )}
            {program.access_tier && program.access_tier !== "free" && (
              <span className="bg-gradient-to-r from-rose-400 to-pink-500 text-white px-3 py-1 rounded-full font-bold uppercase">{program.access_tier}</span>
            )}
            {(program.need_tags || "").split(",").filter(Boolean).map((tag) => (
              <span key={tag} className="bg-gray-50 text-gray-500 px-3 py-1 rounded-full capitalize">{tag.trim()}</span>
            ))}
          </div>

          {(program.summary || program.description) && (
            <p className="text-sm text-gray-500 leading-relaxed">{program.summary || program.description}</p>
          )}

          {locked ? (
            <div className="card-glass rounded-2xl p-6 text-center space-y-3">
              <Lock className="w-10 h-10 mx-auto text-rose-300" />
              <p className="font-semibold text-gray-700">Requires {program.access_tier} plan</p>
              <p className="text-xs text-gray-400">You can preview Day 1 below for free.</p>
              <a href={createPageUrl("Upgrade")} className="btn-primary inline-block">Upgrade to unlock all days</a>
            </div>
          ) : !userProgram ? (
            <button onClick={startProgram} disabled={starting} className="btn-primary w-full">
              {starting ? "Starting…" : "Start Program →"}
            </button>
          ) : (
            <a href={createPageUrl(`ProgramDay?key=${programKey}&day=${userProgram.current_day}`)} className="btn-primary w-full text-center block">
              Continue Day {userProgram.current_day} →
            </a>
          )}

          {days.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-700 text-sm mb-3">Program Overview</h2>
              <div className="space-y-2">
                {days.map((d) => {
                  const dayTasks = tasksForDay(d.day_number);
                  const isExpanded = expandedDay === d.day_number;
                  const isLockDay = locked && d.day_number > 1;
                  const dayTitle = d.title || d.theme_title || `Day ${d.day_number}`;
                  const dayDesc = d.focus || d.theme_description;

                  return (
                    <div key={d.id} className={`card-glass rounded-2xl overflow-hidden ${isLockDay ? "opacity-60" : ""}`}>
                      <button
                        onClick={() => !isLockDay && setExpandedDay(isExpanded ? null : d.day_number)}
                        className="w-full flex items-center gap-3 p-3 text-left"
                        disabled={isLockDay}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          userProgram && d.day_number < userProgram.current_day
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-rose-100 text-rose-600"
                        }`}>
                          {userProgram && d.day_number < userProgram.current_day
                            ? <CheckCircle2 className="w-4 h-4" />
                            : d.day_number
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700">{dayTitle}</p>
                          {dayDesc && !isExpanded && <p className="text-xs text-gray-400 truncate">{dayDesc}</p>}
                        </div>
                        {!isLockDay && (isExpanded ? <ChevronUp className="w-4 h-4 text-gray-300 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-300 flex-shrink-0" />)}
                        {isLockDay && <Lock className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />}
                      </button>

                      {isExpanded && (
                        <div className="px-3 pb-3 space-y-1.5 border-t border-rose-50 pt-2">
                          {dayDesc && <p className="text-xs text-gray-500 mb-2">{dayDesc}</p>}
                          {d.estimated_minutes && <p className="text-xs text-rose-400 mb-2">~{d.estimated_minutes} min</p>}
                          {dayTasks.map((task, i) => (
                            <div key={task.id} className="flex items-center gap-2 text-xs text-gray-600">
                              <Play className="w-3 h-3 text-rose-300 flex-shrink-0" />
                              <span>{task.label || task.title || `Task ${i + 1}`}</span>
                              {task.is_optional && <span className="text-gray-300 ml-auto">optional</span>}
                            </div>
                          ))}
                          {dayTasks.length === 0 && <p className="text-xs text-gray-400">Tasks coming soon.</p>}
                          {d.reflection_prompt && (
                            <p className="text-xs text-gray-400 italic mt-2 border-t border-rose-50 pt-2">Reflection: {d.reflection_prompt}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}