import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Bell, BookOpen, Bookmark, BookmarkCheck, Clock, Flame, Headphones, Lock, Play, RotateCcw } from "lucide-react";
import ProgramDayPreviewCard from "../components/programs/ProgramDayPreviewCard";
import ProgramProgressBar from "../components/programs/ProgramProgressBar";

const TIER_ORDER = { free: 0, plus: 1, pro: 2 };
const TIER_STYLES = {
  free: "bg-emerald-50 text-emerald-700",
  plus: "bg-rose-50 text-rose-700",
  pro: "bg-purple-50 text-purple-700",
};

function isReminderDue(reminderTime) {
  if (!reminderTime) return false;
  const now = new Date();
  const current = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return current >= reminderTime;
}

export default function ProgramDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const programKey = urlParams.get("key");

  const [program, setProgram] = useState(null);
  const [days, setDays] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [userProgram, setUserProgram] = useState(null);
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [savingProgram, setSavingProgram] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [savingReminder, setSavingReminder] = useState(false);
  const [expandedDay, setExpandedDay] = useState(1);
  const [reminderTime, setReminderTime] = useState("");

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

      const [programDays, programTasks, userProgramEntries, completionEntries] = await Promise.all([
        base44.entities.ProgramDays.filter({ program_key: programKey }),
        base44.entities.ProgramTasks.filter({ program_key: programKey }),
        base44.entities.UserPrograms.filter({ user_id: currentUser.id, program_id: selectedProgram.id }),
        base44.entities.UserTaskCompletions.filter({ user_id: currentUser.id, program_id: selectedProgram.id }),
      ]);

      const sortedDays = programDays.sort((a, b) => a.day_number - b.day_number);
      setDays(sortedDays);
      setTasks(programTasks.sort((a, b) => (a.order_index || a.task_order || 0) - (b.order_index || b.task_order || 0)));
      setCompletions(completionEntries);
      setUserProgram(userProgramEntries[0] || null);
      setReminderTime(userProgramEntries[0]?.reminder_time || "");
      setExpandedDay(sortedDays[0]?.day_number || 1);
      setLoading(false);
    })();
  }, [programKey]);

  const tasksForDay = (dayNumber) => tasks.filter((task) => task.day_number === dayNumber);

  const getCompletedDaySet = () => {
    const completionIds = new Set(completions.map((entry) => entry.task_id));
    return new Set(
      days
        .filter((day) => {
          const dayTasks = tasksForDay(day.day_number);
          const requiredTasks = dayTasks.filter((task) => !task.is_optional);
          return requiredTasks.length > 0 && requiredTasks.every((task) => completionIds.has(task.id));
        })
        .map((day) => day.day_number)
    );
  };

  const startProgram = async () => {
    setStarting(true);
    let nextProgram = userProgram;

    if (userProgram) {
      nextProgram = await base44.entities.UserPrograms.update(userProgram.id, {
        status: "active",
        is_saved: true,
        started_at: userProgram.started_at || new Date().toISOString(),
        current_day: userProgram.current_day || 1,
      });
    } else {
      nextProgram = await base44.entities.UserPrograms.create({
        user_id: user.id,
        program_id: program.id,
        started_at: new Date().toISOString(),
        current_day: 1,
        status: "active",
        is_saved: true,
      });
    }

    setUserProgram(nextProgram);
    setStarting(false);
    window.location.href = createPageUrl(`ProgramDay?key=${programKey}&day=${nextProgram.current_day || 1}`);
  };

  const toggleSaved = async () => {
    setSavingProgram(true);
    let nextProgram = userProgram;

    if (userProgram) {
      nextProgram = await base44.entities.UserPrograms.update(userProgram.id, {
        is_saved: !userProgram.is_saved,
      });
    } else {
      nextProgram = await base44.entities.UserPrograms.create({
        user_id: user.id,
        program_id: program.id,
        started_at: new Date().toISOString(),
        current_day: 1,
        status: "paused",
        is_saved: true,
      });
    }

    setUserProgram(nextProgram);
    setSavingProgram(false);
  };

  const restartProgram = async () => {
    if (!userProgram) return;
    const shouldRestart = window.confirm("Restart this program and clear your current progress?");
    if (!shouldRestart) return;

    setRestarting(true);
    await Promise.all(completions.map((entry) => base44.entities.UserTaskCompletions.delete(entry.id)));
    const updatedProgram = await base44.entities.UserPrograms.update(userProgram.id, {
      current_day: 1,
      status: "active",
      completed_at: "",
      last_activity_date: "",
      streak_count: 0,
      is_saved: true,
    });

    setCompletions([]);
    setUserProgram(updatedProgram);
    setRestarting(false);
  };

  const saveReminder = async () => {
    if (!reminderTime) return;
    setSavingReminder(true);

    let nextProgram = userProgram;
    if (userProgram) {
      nextProgram = await base44.entities.UserPrograms.update(userProgram.id, {
        reminder_time: reminderTime,
        is_saved: true,
      });
    } else {
      nextProgram = await base44.entities.UserPrograms.create({
        user_id: user.id,
        program_id: program.id,
        started_at: new Date().toISOString(),
        current_day: 1,
        status: "paused",
        is_saved: true,
        reminder_time: reminderTime,
      });
    }

    setUserProgram(nextProgram);
    setSavingReminder(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen femwell-gradient flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-300 border-t-rose-600" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen femwell-gradient flex items-center justify-center">
        <p className="text-gray-400">Program not found.</p>
      </div>
    );
  }

  const locked = (TIER_ORDER[program.access_tier] || 0) > (TIER_ORDER[userPlan] || 0);
  const thumb = program.cover_thumbnail_url || program.thumbnail_url;
  const totalVideos = tasks.filter((task) => task.external_url).length;
  const totalReadUps = tasks.filter((task) => task.task_type === "READ").length;
  const totalSessions = tasks.filter((task) => task.content_key).length;
  const completedDays = getCompletedDaySet();
  const currentDay = userProgram?.current_day || 1;
  const totalDays = days.length || program.duration_days || 1;
  const programProgress = totalDays ? (completedDays.size / totalDays) * 100 : 0;
  const dayEstimates = days.filter((day) => day.estimated_minutes).map((day) => day.estimated_minutes);
  const minPerDay = program.time_per_day_min || (dayEstimates.length ? Math.min(...dayEstimates) : 8);
  const maxPerDay = program.time_per_day_max || (dayEstimates.length ? Math.max(...dayEstimates) : Math.max(minPerDay, 18));
  const averagePerDay = Math.round((minPerDay + maxPerDay) / 2);
  const reminderIsDue = isReminderDue(userProgram?.reminder_time);

  const getDayStatus = (dayNumber) => {
    if (completedDays.has(dayNumber)) return "completed";
    if (dayNumber === currentDay) return "current";
    return "upcoming";
  };

  return (
    <div className="min-h-screen femwell-gradient pb-10">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden bg-gradient-to-br from-rose-200 to-pink-300">
          <div className="absolute inset-0">
            {thumb && <img src={thumb} alt={program.title} className="h-full w-full object-cover" />}
            <div className="absolute inset-0 bg-black/45" />
          </div>

          <div className="relative z-10 px-4 pb-8 pt-12 md:px-6 md:pb-10">
            <button onClick={() => window.history.back()} className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/85">
              <ArrowLeft className="h-4 w-4 text-gray-700" />
            </button>

            <div className="max-w-3xl space-y-4 text-white">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className={`rounded-full px-3 py-1 font-semibold capitalize ${TIER_STYLES[program.access_tier] || "bg-white/90 text-gray-700"}`}>
                  {program.access_tier || "free"}
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 font-medium backdrop-blur-sm">{totalDays} days</span>
                {program.level && <span className="rounded-full bg-white/20 px-3 py-1 font-medium capitalize backdrop-blur-sm">{program.level}</span>}
                {userProgram?.streak_count > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 font-medium backdrop-blur-sm">
                    <Flame className="h-3.5 w-3.5" /> {userProgram.streak_count} day streak
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-white/70">{program.category || "Program"}</p>
                <h1 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">{program.title}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85 md:text-base">{program.summary || program.description}</p>
              </div>
              <div className="max-w-md rounded-3xl bg-white/12 p-4 backdrop-blur-sm">
                <div className="mb-2 flex items-center justify-between text-xs font-medium text-white/85">
                  <span>Program progress</span>
                  <span>{completedDays.size}/{totalDays} days</span>
                </div>
                <ProgramProgressBar value={programProgress} className="bg-white/20" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-4 py-6 md:px-6">
          <div className="grid gap-3 md:grid-cols-4">
            <MetricCard icon={<Clock className="h-4 w-4 text-rose-500" />} value={totalDays} label="Days" />
            <MetricCard icon={<Play className="h-4 w-4 text-red-500" />} value={totalVideos} label="Videos" />
            <MetricCard icon={<Headphones className="h-4 w-4 text-purple-500" />} value={totalSessions} label="Audio sessions" />
            <MetricCard icon={<BookOpen className="h-4 w-4 text-amber-600" />} value={totalReadUps} label="Read-ups" />
          </div>

          <div className="rounded-[28px] border border-rose-100 bg-white p-4 shadow-sm">
            <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {days.map((day) => (
                <a
                  key={day.id}
                  href={createPageUrl(`ProgramDay?key=${programKey}&day=${day.day_number}`)}
                  className={`flex-shrink-0 rounded-full px-3 py-2 text-xs font-semibold ${
                    day.day_number === currentDay ? "bg-rose-500 text-white" : "bg-rose-50 text-rose-600"
                  }`}
                >
                  Day {day.day_number}
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              <OverviewCard title="What you’ll do daily" body={program.daily_activities_summary || "Guided sessions, supportive videos, and quick read-ups — all in one clear daily flow."} />
              <OverviewCard title="Time per day" body={`${minPerDay}–${maxPerDay} minutes per day, with an average of about ${averagePerDay} minutes.`} />
              <OverviewCard title="What you’ll need" body={program.what_you_need || "A quiet corner, your phone, and headphones when you want to fully settle into the session."} />
              <OverviewCard title="Who it’s best for" body={program.best_for_tags?.length ? `${program.best_for_tags.join(", ")}. ${program.expected_results || ""}`.trim() : (program.expected_results || "Ideal if you want a calmer, more guided structure you can actually stick with.")} />
            </div>

            <div className="rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm md:p-6">
              {locked ? (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50">
                    <Lock className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900">Requires {program.access_tier} plan</p>
                    <p className="mt-1 text-sm text-gray-500">You can open any day and preview the roadmap here, then unlock the guided flow when you’re ready.</p>
                  </div>
                  <a href={createPageUrl("Upgrade")} className="btn-primary inline-block">Upgrade</a>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-gray-900">Your program actions</p>
                      <p className="mt-1 text-sm text-gray-500">Start, resume, save, restart, and set a daily reminder from one place.</p>
                    </div>
                    <button onClick={toggleSaved} disabled={savingProgram} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                      {userProgram?.is_saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    </button>
                  </div>

                  {userProgram ? (
                    <div className="rounded-3xl bg-rose-50 p-4 text-sm text-gray-600">
                      <p className="font-semibold text-gray-800">You’re on Day {currentDay}</p>
                      <p className="mt-1">{completedDays.size} of {totalDays} days completed.</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Ready to begin? You’ll start at Day 1 and can come back where you left off.</p>
                  )}

                  {reminderIsDue && userProgram?.reminder_time && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                      <Bell className="h-3.5 w-3.5" /> Day {currentDay} is ready
                    </div>
                  )}

                  <div className="grid gap-2 sm:grid-cols-2">
                    <button onClick={startProgram} disabled={starting} className="btn-primary w-full">
                      {starting ? "Opening…" : userProgram ? `Resume day ${currentDay}` : "Start program"}
                    </button>
                    <a href={createPageUrl(`ProgramDay?key=${programKey}&day=${currentDay}`)} className="btn-secondary block w-full text-center">
                      Open current day
                    </a>
                  </div>

                  {userProgram && (
                    <button onClick={restartProgram} disabled={restarting} className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600">
                      <RotateCcw className="h-4 w-4" /> {restarting ? "Restarting…" : "Restart program"}
                    </button>
                  )}

                  <div className="rounded-3xl border border-rose-100 p-4">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Reminder time</label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        type="time"
                        value={reminderTime}
                        onChange={(event) => setReminderTime(event.target.value)}
                        className="w-full rounded-2xl border border-rose-100 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-rose-200"
                      />
                      <button onClick={saveReminder} disabled={!reminderTime || savingReminder} className="rounded-2xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700">
                        {savingReminder ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">Day by day roadmap</h2>
            <div className="space-y-3">
              {days.map((day) => (
                <ProgramDayPreviewCard
                  key={day.id}
                  day={day}
                  tasks={tasksForDay(day.day_number)}
                  programKey={programKey}
                  status={getDayStatus(day.day_number)}
                  expanded={expandedDay === day.day_number}
                  onToggle={() => setExpandedDay(expandedDay === day.day_number ? null : day.day_number)}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, value, label }) {
  return (
    <div className="rounded-3xl border border-rose-100 bg-white p-4 shadow-sm">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50">{icon}</div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function OverviewCard({ title, body }) {
  return (
    <div className="rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm md:p-6">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">{body}</p>
    </div>
  );
}