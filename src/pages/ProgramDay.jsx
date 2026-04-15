import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Bell, BookOpen, Clock, Flame, Lock, Sparkles } from "lucide-react";
import ProgramTaskCard from "../components/programs/ProgramTaskCard";
import ProgramProgressBar from "../components/programs/ProgramProgressBar";
import ProgramDayStickyNav from "../components/programs/ProgramDayStickyNav";
import ProgramReflectionCard from "../components/programs/ProgramReflectionCard";
import ProgramPageToolbar from "../components/programs/ProgramPageToolbar";
import MilestoneCelebrationModal, { getMilestoneKey } from "../components/programs/MilestoneCelebrationModal";

const TIER_ORDER = { free: 0, plus: 1, pro: 2 };

function isReminderDue(reminderTime) {
  if (!reminderTime) return false;
  const now = new Date();
  const current = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return current >= reminderTime;
}

function getYesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split("T")[0];
}

export default function ProgramDay() {
  const urlParams = new URLSearchParams(window.location.search);
  const programKey = urlParams.get("key");
  const dayNumber = parseInt(urlParams.get("day") || "1");

  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState("free");
  const [program, setProgram] = useState(null);
  const [allDays, setAllDays] = useState([]);
  const [programDay, setProgramDay] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [contentMap, setContentMap] = useState({});
  const [contentItems, setContentItems] = useState([]);
  const [userProgram, setUserProgram] = useState(null);
  const [openedTaskIds, setOpenedTaskIds] = useState([]);
  const [reflectionEntry, setReflectionEntry] = useState(null);
  const [reflectionText, setReflectionText] = useState("");
  const [savingReflection, setSavingReflection] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMilestone, setShowMilestone] = useState(false);

  useEffect(() => {
    if (!programKey) return;
    (async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const [programs, entitlements] = await Promise.all([
        base44.entities.Programs.filter({ program_key: programKey }),
        base44.entities.Entitlements.filter({ user_id: currentUser.id }),
      ]);

      const selectedProgram = programs[0];
      if (!selectedProgram) {
        setLoading(false);
        return;
      }

      setProgram(selectedProgram);
      if (entitlements[0]) setUserPlan(entitlements[0].plan || "free");

      const [days, allTasks, userPrograms, allCompletions, allContent, reflections] = await Promise.all([
        base44.entities.ProgramDays.filter({ program_key: programKey }),
        base44.entities.ProgramTasks.filter({ program_key: programKey }),
        base44.entities.UserPrograms.filter({ user_id: currentUser.id, program_id: selectedProgram.id }),
        base44.entities.UserTaskCompletions.filter({ user_id: currentUser.id, program_id: selectedProgram.id }),
        base44.entities.ContentItems.list("-created_date", 200),
        base44.entities.JournalEntries.filter({ user_id: currentUser.id, program_key: programKey, day_number: dayNumber }),
      ]);

      const sortedDays = days.sort((a, b) => a.day_number - b.day_number);
      const selectedDay = sortedDays.find((day) => day.day_number === dayNumber);
      const selectedTasks = allTasks
        .filter((task) => task.day_number === dayNumber)
        .sort((a, b) => (a.order_index || a.task_order || 0) - (b.order_index || b.task_order || 0));

      const nextContentMap = {};
      allContent.forEach((content) => {
        if (content.content_key) nextContentMap[content.content_key] = content;
      });

      setAllDays(sortedDays);
      setProgramDay(selectedDay);
      setTasks(selectedTasks);
      setCompletions(allCompletions.filter((entry) => entry.day_number === dayNumber).map((entry) => entry.task_id));
      setContentMap(nextContentMap);
      setContentItems(allContent);
      const up = userPrograms[0] || null;
      setUserProgram(up);
      // Show milestone modal if there's an unshown milestone
      if (up && getMilestoneKey(up)) setTimeout(() => setShowMilestone(true), 500);
      setReflectionEntry(reflections[0] || null);
      setReflectionText(reflections[0]?.text || "");
      setLoading(false);
    })();
  }, [programKey, dayNumber]);

  const ensureUserProgram = async () => {
    if (userProgram) return userProgram;
    const created = await base44.entities.UserPrograms.create({
      user_id: user.id,
      program_id: program.id,
      started_at: new Date().toISOString(),
      current_day: dayNumber,
      status: "active",
      is_saved: true,
    });
    setUserProgram(created);
    return created;
  };

  const completeTask = async (taskId) => {
    if (completions.includes(taskId)) return;

    const activeUserProgram = await ensureUserProgram();

    await base44.entities.UserTaskCompletions.create({
      user_id: user.id,
      program_id: program.id,
      task_id: taskId,
      day_number: dayNumber,
      completed_at: new Date().toISOString(),
      skipped: false,
    });

    const updatedCompletions = [...completions, taskId];
    setCompletions(updatedCompletions);

    const requiredTasks = tasks.filter((t) => !t.is_optional);
    const allRequiredDone = requiredTasks.length > 0 && requiredTasks.every((t) => updatedCompletions.includes(t.id));
    if (allRequiredDone) {
      const todayKey = new Date().toISOString().split("T")[0];
      const yesterdayKey = getYesterdayKey();
      const currentStreak = activeUserProgram.streak_count || 0;
      const lastDate = activeUserProgram.last_activity_date;
      const nextStreak = lastDate === todayKey
        ? currentStreak || 1
        : lastDate === yesterdayKey
          ? currentStreak + 1
          : 1;
      const totalDays = allDays.length || program.duration_days || dayNumber;
      const isLastDay = dayNumber >= totalDays;
      const updatedProgram = await base44.entities.UserPrograms.update(activeUserProgram.id, {
        current_day: isLastDay ? dayNumber : Math.max(activeUserProgram.current_day || 1, dayNumber + 1),
        status: isLastDay ? "completed" : "active",
        completed_at: isLastDay ? new Date().toISOString() : null,
        last_activity_date: todayKey,
        streak_count: nextStreak,
        is_saved: true,
      });
      setUserProgram(updatedProgram);
    }
  };

  const skipTask = async (taskId) => {
    if (completions.includes(taskId)) return;

    await ensureUserProgram();
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

  const saveReflection = async () => {
    setSavingReflection(true);
    if (reflectionEntry) {
      const updated = await base44.entities.JournalEntries.update(reflectionEntry.id, {
        text: reflectionText,
        session_date: new Date().toISOString().split("T")[0],
        prompt: programDay?.reflection_prompt || "",
      });
      setReflectionEntry(updated);
    } else {
      const created = await base44.entities.JournalEntries.create({
        user_id: user.id,
        content_id: program.id,
        content_key: programKey,
        session_date: new Date().toISOString().split("T")[0],
        text: reflectionText,
        program_key: programKey,
        day_number: dayNumber,
        prompt: programDay?.reflection_prompt || "",
      });
      setReflectionEntry(created);
    }
    setSavingReflection(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
        <div className="h-10 w-10 animate-spin rounded-full" style={{ border: "4px solid var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
      </div>
    );
  }

  const requiredTasks = tasks.filter((task) => !task.is_optional);
  const allDone = requiredTasks.length > 0 && requiredTasks.every((task) => completions.includes(task.id));
  const hasNextDay = programDay && dayNumber < (allDays.length || program.duration_days || dayNumber);
  const dayTitle = programDay?.title || programDay?.theme_title || `Day ${dayNumber}`;
  const daySummary = programDay?.focus || programDay?.theme_description;
  const locked = (TIER_ORDER[program?.access_tier] || 0) > (TIER_ORDER[userPlan] || 0);
  const completedTaskCount = tasks.filter((task) => completions.includes(task.id)).length;
  const dayProgress = tasks.length ? (completedTaskCount / tasks.length) * 100 : 0;
  const remainingMinutes = tasks.some((task) => (contentMap[task.content_key]?.duration_minutes || task.duration_minutes))
    ? tasks
        .filter((task) => !completions.includes(task.id))
        .reduce((total, task) => total + (contentMap[task.content_key]?.duration_minutes || task.duration_minutes || 0), 0)
    : Math.round((programDay?.estimated_minutes || 0) * ((tasks.length - completedTaskCount) / Math.max(tasks.length, 1)));
  const reminderDue = isReminderDue(userProgram?.reminder_time);
  const suggestedTypes = new Date().getHours() >= 18 ? ["MEDITATION", "BREATHWORK"] : ["WORKOUT", "BREATHWORK", "MEDITATION"];
  const suggestedContent = contentItems
    .filter((item) => suggestedTypes.includes(item.content_type))
    .filter((item) => (TIER_ORDER[item.access_tier || "free"] || 0) <= (TIER_ORDER[userPlan] || 0))
    .slice(0, 3);

  return (
    <div className="min-h-screen pb-10" style={{ backgroundColor: "var(--ivory)" }}>
      {showMilestone && userProgram && (
        <MilestoneCelebrationModal
          userProgram={userProgram}
          programTitle={program?.title}
          onClose={() => setShowMilestone(false)}
        />
      )}
      <ProgramPageToolbar title={dayTitle} subtitle={program?.title} showToday />
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <div className="pb-5 pt-8">
          <p className="text-xs font-medium" style={{ color: "var(--rose-dust)" }}>{program?.title} · Day {dayNumber}</p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--plum)" }}>{dayTitle}</h1>
        </div>

        <ProgramDayStickyNav programKey={programKey} currentDay={dayNumber} days={allDays} />

        <div className="mt-4 flex flex-wrap gap-2">
          <a href={createPageUrl(`ProgramsHub?program_key=${programKey}`)} className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold" style={{ border: "1px solid var(--rose-dust-light)", backgroundColor: "var(--surface)", color: "var(--rose-dust)" }}>
            Back to Program
          </a>
          <a href={createPageUrl("Today")} className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold" style={{ border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--plum)" }}>
            Back to Today
          </a>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm md:p-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
              <Sparkles className="h-3.5 w-3.5" /> Today’s flow
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">{dayTitle}</h2>
            {daySummary && <p className="mt-2 text-sm leading-relaxed text-gray-600">{daySummary}</p>}
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
              {programDay?.estimated_minutes && (
                <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-rose-600">
                  <Clock className="h-3.5 w-3.5" /> Around {programDay.estimated_minutes} minutes
                </div>
              )}
              {userProgram?.streak_count > 0 && (
                <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-rose-600">
                  <Flame className="h-3.5 w-3.5" /> {userProgram.streak_count} day streak
                </div>
              )}
              {reminderDue && userProgram?.reminder_time && (
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                  <Bell className="h-3.5 w-3.5" /> Day {dayNumber} is ready
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm md:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Day progress</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{completedTaskCount}/{tasks.length} tasks done · {Math.max(remainingMinutes, 0)} min remaining</p>
            <ProgramProgressBar value={dayProgress} className="mt-4" />
            {programDay?.reflection_prompt && (
              <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm italic text-gray-600">
                Reflection: {programDay.reflection_prompt}
              </div>
            )}
          </div>
        </div>

        {/* FIX 2E: Task progress indicator */}
        {!locked && tasks.length > 0 && (
          <div className="mt-4 rounded-[20px] p-4" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                {completedTaskCount === tasks.length ? "Day complete! 🎉" : `${completedTaskCount} of ${tasks.length} tasks done`}
              </p>
              <p className="text-xs" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{Math.round(dayProgress)}%</p>
            </div>
            <div className="w-full rounded-full overflow-hidden" style={{ height: 6, backgroundColor: "var(--ivory-dark)" }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${dayProgress}%`, backgroundColor: dayProgress === 100 ? "var(--sage)" : "var(--rose-dust)" }} />
            </div>
          </div>
        )}

        {locked ? (
          <div className="mt-6 rounded-[28px] p-6 shadow-sm" style={{ border: "1px solid var(--border)", backgroundColor: "var(--surface)" }}>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: "var(--rose-dust-subtle)" }}>
              <Lock className="h-5 w-5" style={{ color: "var(--rose-dust)" }} />
            </div>
            <p className="mt-4 text-center text-lg font-semibold" style={{ color: "var(--plum)" }}>This day is included in the {program?.access_tier} plan</p>
            <p className="mt-1 text-center text-sm" style={{ color: "var(--mauve)" }}>You can preview the day here, then unlock the full guided flow to complete tasks and save progress.</p>
            <div className="mt-5 space-y-3">
              {tasks.map((task, index) => (
                <div key={task.id} className="rounded-2xl px-4 py-3 text-sm" style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--plum)" }}>
                  {index + 1}. {task.label || task.title || `Task ${index + 1}`}
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <a href={createPageUrl("Upgrade")} className="btn-primary inline-block">Upgrade to unlock</a>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-6 space-y-4">
              {tasks.map((task, index) => (
                <ProgramTaskCard
                  key={task.id}
                  task={task}
                  content={task.content_key ? contentMap[task.content_key] : null}
                  done={completions.includes(task.id)}
                  opened={openedTaskIds.includes(task.id)}
                  index={index}
                  onOpen={() => setOpenedTaskIds((current) => (current.includes(task.id) ? current : [...current, task.id]))}
                  onComplete={() => completeTask(task.id)}
                  onSkip={() => skipTask(task.id)}
                />
              ))}
            </div>

            <div className="mt-6">
              <ProgramReflectionCard
                prompt={programDay?.reflection_prompt}
                value={reflectionText}
                onChange={setReflectionText}
                onSave={saveReflection}
                saving={savingReflection}
              />
            </div>
          </>
        )}

        {allDone && !locked && (
          <div className="mt-6 rounded-[28px] p-6 text-center shadow-sm" style={{ border: "1px solid var(--border)", backgroundColor: "var(--surface)" }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: "var(--sage-subtle)", color: "var(--sage)", fontSize: 24 }}>&#10003;</div>
            <p className="mt-2 text-lg font-semibold" style={{ color: "var(--plum)" }}>Day {dayNumber} complete</p>
            <p className="mt-1 text-sm" style={{ color: "var(--mauve)" }}>Nice work. Keep the momentum going with the next guided step.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <a
                href={hasNextDay ? createPageUrl(`ProgramDay?key=${programKey}&day=${dayNumber + 1}`) : createPageUrl("ProgramsHub")}
                className="btn-primary inline-block"
              >
                {hasNextDay ? "Next day" : "Back to programs"}
              </a>
            </div>

            {suggestedContent.length > 0 && (
              <div className="mt-6 text-left">
                <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--mauve)" }}>Try this now</p>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  {suggestedContent.map((item) => (
                    <a key={item.id} href={createPageUrl(`ContentPlayer?key=${item.content_key}`)} className="rounded-3xl p-4" style={{ border: "1px solid var(--rose-dust-light)", backgroundColor: "var(--rose-dust-subtle)" }}>
                      <p className="text-sm font-semibold" style={{ color: "var(--plum)" }}>{item.title}</p>
                      <p className="mt-1 text-xs" style={{ color: "var(--mauve)" }}>{item.content_type} · {item.duration_minutes || 5} min</p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}