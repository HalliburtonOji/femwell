import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ArrowLeft, CheckCircle2, Play, RotateCcw, SkipForward } from "lucide-react";

export default function ProgramDay() {
  const urlParams = new URLSearchParams(window.location.search);
  const programId = urlParams.get("program_id");
  const dayNumber = parseInt(urlParams.get("day") || "1");

  const [user, setUser] = useState(null);
  const [programDay, setProgramDay] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [contentItems, setContentItems] = useState({});
  const [userProgramId, setUserProgramId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!programId) return;
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [allDays, allTasks, ups, allCompletions, allContent] = await Promise.all([
        base44.entities.ProgramDays.filter({ program_id: programId }),
        base44.entities.ProgramTasks.filter({ program_id: programId }),
        base44.entities.UserPrograms.filter({ user_id: u.id, program_id: programId }),
        base44.entities.UserTaskCompletions.filter({ user_id: u.id, program_id: programId }),
        base44.entities.ContentItems.list("-created_date", 200),
      ]);
      const day = allDays.find((d) => d.day_number === dayNumber);
      const dayTasks = allTasks.filter((t) => t.day_number === dayNumber).sort((a, b) => a.task_order - b.task_order);
      const contentMap = {};
      allContent.forEach((c) => { contentMap[c.id] = c; });
      setProgramDay(day);
      setTasks(dayTasks);
      setCompletions(allCompletions.filter((c) => c.day_number === dayNumber).map((c) => c.task_id));
      setContentItems(contentMap);
      setUserProgramId(ups[0]?.id || null);
      setLoading(false);
    })();
  }, [programId, dayNumber]);

  const completeTask = async (taskId) => {
    if (completions.includes(taskId)) return;
    await base44.entities.UserTaskCompletions.create({
      user_id: user.id, program_id: programId, task_id: taskId,
      day_number: dayNumber, completed_at: new Date().toISOString(),
    });
    setCompletions((c) => [...c, taskId]);

    // If all tasks done, advance the day
    const updatedCompletions = [...completions, taskId];
    if (updatedCompletions.length >= tasks.length && userProgramId) {
      await base44.entities.UserPrograms.update(userProgramId, { current_day: dayNumber + 1 });
    }
  };

  const skipTask = async (taskId) => {
    if (completions.includes(taskId)) return;
    await base44.entities.UserTaskCompletions.create({
      user_id: user.id, program_id: programId, task_id: taskId,
      day_number: dayNumber, completed_at: new Date().toISOString(), skipped: true,
    });
    setCompletions((c) => [...c, taskId]);
  };

  if (loading) return <div className="min-h-screen femwell-gradient flex items-center justify-center"><div className="w-10 h-10 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" /></div>;

  const allDone = tasks.length > 0 && tasks.every((t) => completions.includes(t.id));

  return (
    <div className="min-h-screen femwell-gradient pb-10">
      <div className="max-w-md mx-auto px-4">
        <div className="pt-12 pb-4 flex items-center gap-3">
          <button onClick={() => window.history.back()} className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>
          <div>
            <p className="text-xs text-rose-500 font-medium">Day {dayNumber}</p>
            <h1 className="text-xl font-bold text-gray-800">{programDay?.theme_title || `Day ${dayNumber}`}</h1>
          </div>
        </div>

        {programDay?.theme_description && (
          <p className="text-sm text-gray-500 mb-5 leading-relaxed">{programDay.theme_description}</p>
        )}

        {tasks.length === 0 ? (
          <div className="card-glass rounded-2xl p-8 text-center text-gray-400">
            <p>No tasks for this day yet.</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {tasks.map((task, idx) => {
              const done = completions.includes(task.id);
              const content = task.content_ref_id ? contentItems[task.content_ref_id] : null;
              return (
                <div key={task.id} className={`card-glass rounded-2xl p-4 transition-all ${done ? "opacity-60" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${done ? "bg-emerald-100" : "bg-rose-100"}`}>
                      {done ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <span className="text-xs font-bold text-rose-500">{idx + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">{task.title}</p>
                      {task.duration_minutes && <p className="text-xs text-gray-400">{task.duration_minutes} min</p>}
                      {content && <p className="text-xs text-rose-400 mt-0.5">{content.content_type} · {content.title}</p>}
                    </div>
                  </div>

                  {!done && (
                    <div className="flex gap-2 mt-3 ml-11">
                      {content ? (
                        <a
                          href={createPageUrl(`ContentPlayer?id=${content.id}`)}
                          onClick={() => completeTask(task.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold"
                        >
                          <Play className="w-3.5 h-3.5" /> Start
                        </a>
                      ) : (
                        <button
                          onClick={() => completeTask(task.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-semibold"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark Done
                        </button>
                      )}
                      <button
                        onClick={() => skipTask(task.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 text-gray-500 text-xs font-medium"
                      >
                        <SkipForward className="w-3.5 h-3.5" /> Skip
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {allDone && (
          <div className="card-glass rounded-2xl p-6 text-center space-y-3">
            <p className="text-3xl">🎉</p>
            <p className="font-bold text-gray-800">Day {dayNumber} complete!</p>
            <a href={createPageUrl(`ProgramDay?program_id=${programId}&day=${dayNumber + 1}`)} className="btn-primary inline-block">
              Next Day →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}