import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ArrowLeft, BookOpen, Clock, Headphones, Lock, Play } from "lucide-react";
import ProgramDayPreviewCard from "../components/programs/ProgramDayPreviewCard";

const TIER_ORDER = { free: 0, plus: 1, pro: 2 };
const TIER_STYLES = {
  free: "bg-emerald-50 text-emerald-700",
  plus: "bg-rose-50 text-rose-700",
  pro: "bg-purple-50 text-purple-700",
};

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
  const [expandedDay, setExpandedDay] = useState(1);

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

      const [programDays, programTasks, userProgramEntries] = await Promise.all([
        base44.entities.ProgramDays.filter({ program_key: programKey }),
        base44.entities.ProgramTasks.filter({ program_key: programKey }),
        base44.entities.UserPrograms.filter({ user_id: currentUser.id, program_id: selectedProgram.id }),
      ]);

      setDays(programDays.sort((a, b) => a.day_number - b.day_number));
      setTasks(programTasks.sort((a, b) => (a.order_index || a.task_order || 0) - (b.order_index || b.task_order || 0)));
      setUserProgram(userProgramEntries[0] || null);
      setLoading(false);
    })();
  }, [programKey]);

  const startProgram = async () => {
    setStarting(true);
    const created = await base44.entities.UserPrograms.create({
      user_id: user.id,
      program_id: program.id,
      started_at: new Date().toISOString(),
      current_day: 1,
      status: "active",
    });
    setUserProgram(created);
    setStarting(false);
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
  const tasksForDay = (dayNumber) => tasks.filter((task) => task.day_number === dayNumber);

  return (
    <div className="min-h-screen femwell-gradient pb-10">
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden bg-gradient-to-br from-rose-200 to-pink-300">
          <div className="absolute inset-0">
            {thumb && <img src={thumb} alt={program.title} className="h-full w-full object-cover" />}
            <div className="absolute inset-0 bg-black/40" />
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
                <span className="rounded-full bg-white/20 px-3 py-1 font-medium backdrop-blur-sm">{program.duration_days} days</span>
                {program.level && <span className="rounded-full bg-white/20 px-3 py-1 font-medium capitalize backdrop-blur-sm">{program.level}</span>}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-white/70">{program.category || "Program"}</p>
                <h1 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">{program.title}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85 md:text-base">{program.summary || program.description}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-4 py-6 md:px-6">
          <div className="grid gap-3 md:grid-cols-4">
            <MetricCard icon={<Clock className="h-4 w-4 text-rose-500" />} value={days.length} label="Days" />
            <MetricCard icon={<Play className="h-4 w-4 text-red-500" />} value={totalVideos} label="Videos" />
            <MetricCard icon={<Headphones className="h-4 w-4 text-purple-500" />} value={totalSessions} label="Audio sessions" />
            <MetricCard icon={<BookOpen className="h-4 w-4 text-amber-600" />} value={totalReadUps} label="Read-ups" />
          </div>

          <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm md:p-6">
              <h2 className="text-lg font-semibold text-gray-900">What this journey includes</h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-600">
                <p>Each day combines one guided session, one supporting video from Explore, and one short educational card to help you understand why the practice matters.</p>
                <p>The goal is to make your progress feel structured, calm, and easy to return to—without dumping too much content on you at once.</p>
              </div>
            </div>

            <div className="rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm md:p-6">
              {locked ? (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50">
                    <Lock className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900">Requires {program.access_tier} plan</p>
                    <p className="mt-1 text-sm text-gray-500">You can preview the structure here and unlock the full journey anytime.</p>
                  </div>
                  <a href={createPageUrl("Upgrade")} className="btn-primary inline-block">Upgrade</a>
                </div>
              ) : !userProgram ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">Ready to begin? You’ll start at Day 1 and can come back where you left off.</p>
                  <button onClick={startProgram} disabled={starting} className="btn-primary w-full">
                    {starting ? "Starting…" : "Start program"}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">You’re already in progress on this journey.</p>
                  <a href={createPageUrl(`ProgramDay?key=${programKey}&day=${userProgram.current_day}`)} className="btn-primary block w-full text-center">
                    Continue day {userProgram.current_day}
                  </a>
                </div>
              )}
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">Day by day</h2>
            <div className="space-y-3">
              {days.map((day) => (
                <ProgramDayPreviewCard
                  key={day.id}
                  day={day}
                  tasks={tasksForDay(day.day_number)}
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