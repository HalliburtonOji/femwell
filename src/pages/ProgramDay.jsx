import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ArrowLeft, BookOpen, Clock, Sparkles } from "lucide-react";
import ProgramTaskCard from "../components/programs/ProgramTaskCard";

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
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const programs = await base44.entities.Programs.filter({ program_key: programKey });
      const selectedProgram = programs[0];
      if (!selectedProgram) {
        setLoading(false);
        return;
      }
      setProgram(selectedProgram);

      const [allDays, allTasks, userPrograms, allCompletions, allContent] = await Promise.all([
        base44.entities.ProgramDays.filter({ program_key: programKey }),
        base44.entities.ProgramTasks.filter({ program_key: programKey }),
        base44.entities.UserPrograms.filter({ user_id: currentUser.id, program_id: selectedProgram.id }),
        base44.entities.UserTaskCompletions.filter({ user_id: currentUser.id, program_id: selectedProgram.id }),
        base44.entities.ContentItems.list("-created_date", 200),
      ]);

      const selectedDay = allDays.find((day) => day.day_number === dayNumber);
      const selectedTasks = allTasks
        .filter((task) => task.day_number === dayNumber)
        .sort((a, b) => (a.order_index || a.task_order || 0) - (b.order_index || b.task_order || 0));

      const nextContentMap = {};
      allContent.forEach((content) => {
        if (content.content_key) nextContentMap[content.content_key] = content;
      });

      setProgramDay(selectedDay);
      setTasks(selectedTasks);
      setCompletions(allCompletions.filter((entry) => entry.day_number === dayNumber).map((entry) => entry.task_id));
      setContentMap(nextContentMap);
      setUserProgramId(userPrograms[0]?.id || null);
      setLoading(false);
    })();
  }, [programKey, dayNumber]);

  const completeTask = async (taskId) => {
    if (completions.includes(taskId)) return;

    await base44.entities.UserTaskCompletions.create({
      user_id: user.id,
      program_id: program.id,
      task_id: taskId,
      day_number: dayNumber,
      completed_at: new Date().toISOString(),
    });

    const updatedCompletions = [...completions, taskId];
    setCompletions(updatedCompletions);

    const requiredTasks = tasks.filter((task) => !task.is_optional);
    const requiredDone = requiredTasks.every((task) => updatedCompletions.includes(task.id));
    if (requiredDone && userProgramId) {
      await base44.entities.UserPrograms.update(userProgramId, { current_day: dayNumber + 1 });
    }
  };

  const skipTask = async (taskId) => {
    if (completions.includes(taskId)) return;

    await base44.entities.UserTaskCompletions.create({
      user_id: user.id,
      program_id: program.id,
      task_id: taskId,
      day_number: dayNumber,
      completed_at: new Date().toISOString(),
      skipped: true,
    });

    setCompletions((current) => [...current, taskId]);
  };

  if (loading) {
    return (
      <div className="min-h-screen femwell-gradient flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-300 border-t-rose-600" />
      </div>
    );
  }

  const requiredTasks = tasks.filter((task) => !task.is_optional);
  const allDone = requiredTasks.length > 0 && requiredTasks.every((task) => completions.includes(task.id));
  const hasNextDay = programDay && dayNumber < program.duration_days;
  const dayTitle = programDay?.title || programDay?.theme_title || `Day ${dayNumber}`;
  const daySummary = programDay?.focus || programDay?.theme_description;

  return (
    <div className="min-h-screen femwell-gradient pb-10">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <div className="flex items-center gap-3 pb-5 pt-12">
          <button onClick={() => window.history.back()} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/85">
            <ArrowLeft className="h-4 w-4 text-gray-700" />
          </button>
          <div>
            <p className="text-xs font-medium text-rose-500">{program?.title} · Day {dayNumber}</p>
            <h1 className="text-2xl font-bold text-gray-900">{dayTitle}</h1>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm md:p-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
              <Sparkles className="h-3.5 w-3.5" /> Today’s flow
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">{dayTitle}</h2>
            {daySummary && <p className="mt-2 text-sm leading-relaxed text-gray-600">{daySummary}</p>}
            {programDay?.estimated_minutes && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600">
                <Clock className="h-3.5 w-3.5" /> Around {programDay.estimated_minutes} minutes
              </div>
            )}
          </div>

          <div className="rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm md:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Today’s intention</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">Move through the day in order: session first, video second, read-up last. It keeps the learning grounded and easy to remember.</p>
            {programDay?.reflection_prompt && (
              <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm italic text-gray-600">
                Reflection: {programDay.reflection_prompt}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {tasks.map((task, index) => (
            <ProgramTaskCard
              key={task.id}
              task={task}
              content={task.content_key ? contentMap[task.content_key] : null}
              done={completions.includes(task.id)}
              index={index}
              onComplete={() => completeTask(task.id)}
              onSkip={() => skipTask(task.id)}
            />
          ))}
        </div>

        {allDone && (
          <div className="mt-6 rounded-[28px] border border-rose-100 bg-white p-6 text-center shadow-sm">
            <p className="text-3xl">🎉</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">Day {dayNumber} complete</p>
            <p className="mt-1 text-sm text-gray-500">Nice work. Keep the momentum going with the next guided step.</p>
            <a
              href={hasNextDay ? createPageUrl(`ProgramDay?key=${programKey}&day=${dayNumber + 1}`) : createPageUrl("ProgramsHub")}
              className="btn-primary mt-4 inline-block"
            >
              {hasNextDay ? "Next day" : "Back to programs"}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}