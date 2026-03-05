import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ArrowLeft, CheckCircle2, Play, SkipForward, BookOpen } from "lucide-react";

export default function ProgramDay() {
  const urlParams = new URLSearchParams(window.location.search);
  const programKey = urlParams.get("key");
  const dayNumber = parseInt(urlParams.get("day") || "1");

  const [user, setUser] = useState(null);
  const [program, setProgram] = useState(null);
  const [programDay, setProgramDay] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [contentMap, setContentMap] = useState({});
  const [userProgramId, setUserProgramId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!programKey) return;
    (async () => {
      const u = await base44.auth.me();
      setUser(u);

      const progs = await base44.entities.Programs.filter({ program_key: programKey });
      const prog = progs[0];
      if (!prog) { setLoading(false); return; }
      setProgram(prog);

      const [allDays, allTasks, ups, allCompletions, allContent] = await Promise.all([
        base44.entities.ProgramDays.filter({ program_key: programKey }),
        base44.entities.ProgramTasks.filter({ program_key: programKey }),
        base44.entities.UserPrograms.filter({ user_id: u.id, program_id: prog.id }),
        base44.entities.UserTaskCompletions.filter({ user_id: u.id, program_id: prog.id }),
        base44.entities.ContentItems.list("-created_date", 200),
      ]);

      const day = allDays.find((d) => d.day_number === dayNumber);
      const dayTasks = allTasks
        .filter((t) => t.day_number === dayNumber)
        .sort((a, b) => (a.order_index || a.task_order || 0) - (b.order_index || b.task_order || 0));

      // Build content map by content_key
      const cMap = {};
      allContent.forEach((c) => { if (c.content_key) cMap[c.content_key] = c; });

      setProgramDay(day);
      setTasks(dayTasks);
      setCompletions(allCompletions.filter((c) => c.day_number === dayNumber).map((c) => c.task_id));
      setContentMap(cMap);
      setUserProgramId(ups[0]?.id || null);
      setLoading(false);
    })();
  }, [programKey, dayNumber]);

  const completeTask = async (taskId) => {
    if (completions.includes(taskId)) return;
    await base44.entities.UserTaskCompletions.create({
      user_id: user.id, program_id: program.id, task_id: taskId,
      day_number: dayNumber, completed_at: new Date().toISOString(),
    });
    const updated = [...completions, taskId];
    setCompletions(updated);
    const requiredTasks = tasks.filter((t) => !t.is_optional);
    const requiredDone = requiredTasks.every((t) => updated.includes(t.id));
    if (requiredDone && userProgramId) {
      await base44.entities.UserPrograms.update(userProgramId, { current_day: dayNumber + 1 });
    }
  };

  const skipTask = async (taskId) => {
    if (completions.includes(taskId)) return;
    await base44.entities.UserTaskCompletions.create({
      user_id: user.id, program_id: program.id, task_id: taskId,
      day_number: dayNumber, completed_at: new Date().toISOString(), skipped: true,
    });
    setCompletions((c) => [...c, taskId]);
  };

  if (loading) return (
    <div className="min-h-screen femwell-gradient flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
    </div>
  );

  const requiredTasks = tasks.filter((t) => !t.is_optional);
  const allDone = requiredTasks.length > 0 && requiredTasks.every((t) => completions.includes(t.id));
  const dayTitle = programDay?.title || programDay?.theme_title || `Day ${dayNumber}`;
  const dayDesc = programDay?.focus || programDay?.theme_description;

  return (
    <div className="min-h-screen femwell-gradient pb-10">
      <div className="max-w-md mx-auto px-4">
        <div className="pt-12 pb-4 flex items-center gap-3">
          <button onClick={() => window.history.back()} className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>
          <div>
            <p className="text-xs text-rose-500 font-medium">{program?.title} · Day {dayNumber}</p>
            <h1 className="text-xl font-bold text-gray-800">{dayTitle}</h1>
          </div>
        </div>

        {dayDesc && <p className="text-sm text-gray-500 mb-5 leading-relaxed">{dayDesc}</p>}
        {programDay?.estimated_minutes && (
          <p className="text-xs text-rose-400 mb-4">~{programDay.estimated_minutes} min today</p>
        )}

        {tasks.length === 0 ? (
          <div className="card-glass rounded-2xl p-8 text-center text-gray-400">
            <p>No tasks for this day yet.</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {tasks.map((task, idx) => {
              const done = completions.includes(task.id);
              const content = task.content_key ? contentMap[task.content_key] : null;
              const taskLabel = task.label || task.title || `Task ${idx + 1}`;
              const isJournal = task.task_type === "JOURNAL";

              return (
                <div key={task.id} className={`card-glass rounded-2xl p-4 transition-all ${done ? "opacity-60" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${done ? "bg-emerald-100" : "bg-rose-100"}`}>
                      {done
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        : <span className="text-xs font-bold text-rose-500">{idx + 1}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800 text-sm">{taskLabel}</p>
                        {task.is_optional && <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">optional</span>}
                      </div>
                      {task.instructions && <p className="text-xs text-gray-500 mt-0.5">{task.instructions}</p>}
                      {content && (
                        <p className="text-xs text-rose-400 mt-0.5">{content.content_type} · {content.duration_minutes}min</p>
                      )}
                    </div>
                  </div>

                  {!done && (
                    <div className="flex gap-2 mt-3 ml-11">
                      {content ? (
                        <a
                          href={createPageUrl(`ContentPlayer?key=${content.content_key}`)}
                          onClick={() => completeTask(task.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold"
                        >
                          <Play className="w-3.5 h-3.5" /> Start
                        </a>
                      ) : isJournal ? (
                        <button
                          onClick={() => completeTask(task.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500 text-white text-xs font-semibold"
                        >
                          <BookOpen className="w-3.5 h-3.5" /> Done
                        </button>
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

        {programDay?.reflection_prompt && (
          <div className="card-glass rounded-2xl p-4 mb-4 border-l-4 border-rose-300">
            <p className="text-xs font-semibold text-rose-500 mb-1">Reflection</p>
            <p className="text-sm text-gray-600 italic">{programDay.reflection_prompt}</p>
          </div>
        )}

        {allDone && (
          <div className="card-glass rounded-2xl p-6 text-center space-y-3">
            <p className="text-3xl">🎉</p>
            <p className="font-bold text-gray-800">Day {dayNumber} complete!</p>
            <a href={createPageUrl(`ProgramDay?key=${programKey}&day=${dayNumber + 1}`)} className="btn-primary inline-block">
              Next Day →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}