import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ArrowRight, BookOpen, Clock, Headphones, Lock, Play, Sparkles } from "lucide-react";

const NEEDS = [
  { id: null, label: "All", emoji: "✨" },
  { id: "sleep", label: "Sleep", emoji: "💤" },
  { id: "stress", label: "Stress", emoji: "🧘" },
  { id: "pms", label: "PMS", emoji: "🌸" },
  { id: "mobility", label: "Mobility", emoji: "🤸" },
  { id: "menopause", label: "Menopause", emoji: "🌙" },
  { id: "postpartum", label: "Postpartum", emoji: "💝" },
];

const TIER_ORDER = { free: 0, plus: 1, pro: 2 };
const TIER_STYLES = {
  free: "bg-emerald-50 text-emerald-700",
  plus: "bg-rose-50 text-rose-700",
  pro: "bg-purple-50 text-purple-700",
};

function getTagText(program) {
  return [(program.need_tags || ""), (program.category || ""), ...(program.goal_tags || [])].join(" ").toLowerCase();
}

export default function ProgramsHub() {
  const [userPlan, setUserPlan] = useState("free");
  const [programs, setPrograms] = useState([]);
  const [userPrograms, setUserPrograms] = useState([]);
  const [days, setDays] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeNeed, setActiveNeed] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const user = await base44.auth.me();
      const [progs, ups, ents, programDays, programTasks] = await Promise.all([
        base44.entities.Programs.list("-created_date", 50),
        base44.entities.UserPrograms.filter({ user_id: user.id }),
        base44.entities.Entitlements.filter({ user_id: user.id }),
        base44.entities.ProgramDays.list("day_number", 250),
        base44.entities.ProgramTasks.list("order_index", 500),
      ]);

      setPrograms(progs);
      setUserPrograms(ups);
      setDays(programDays);
      setTasks(programTasks);
      if (ents[0]) setUserPlan(ents[0].plan || "free");
      setLoading(false);
    })();
  }, []);

  const filteredPrograms = programs.filter((program) => !activeNeed || getTagText(program).includes(activeNeed));
  const featuredProgram = filteredPrograms.find((program) => program.is_featured) || filteredPrograms[0];
  const browsePrograms = filteredPrograms.filter((program) => program.id !== featuredProgram?.id);

  const getUserProgram = (programId) => userPrograms.find((entry) => entry.program_id === programId);
  const isLocked = (program) => (TIER_ORDER[program.access_tier] || 0) > (TIER_ORDER[userPlan] || 0);
  const getThumbnail = (program) => program.cover_thumbnail_url || program.thumbnail_url;
  const getProgramDays = (programKey) => days.filter((day) => day.program_key === programKey);
  const getProgramTasks = (programKey) => tasks.filter((task) => task.program_key === programKey);

  const getProgramMeta = (programKey) => {
    const programTasks = getProgramTasks(programKey);
    return {
      readUps: programTasks.filter((task) => task.task_type === "READ").length,
      videos: programTasks.filter((task) => task.external_url).length,
      sessions: programTasks.filter((task) => task.content_key).length,
      dayCount: getProgramDays(programKey).length,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen femwell-gradient flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-300 border-t-rose-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen femwell-gradient pb-28">
      <div className="border-b border-rose-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-12 md:px-6">
          <div className="grid gap-4 md:grid-cols-[1.4fr_0.9fr] md:items-end">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                <Sparkles className="h-3.5 w-3.5" /> Fresh program library
              </span>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Programs built from Explore</h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500 md:text-base">
                  Follow guided paths that mix audio sessions, curated videos, and short educational read-ups with trusted links.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <StatCard icon={<Play className="h-4 w-4 text-red-500" />} value={tasks.filter((task) => task.external_url).length} label="Video steps" />
              <StatCard icon={<Headphones className="h-4 w-4 text-purple-500" />} value={tasks.filter((task) => task.content_key).length} label="Audio steps" />
              <StatCard icon={<BookOpen className="h-4 w-4 text-amber-600" />} value={tasks.filter((task) => task.task_type === "READ").length} label="Read-ups" />
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {NEEDS.map((need) => (
              <button
                key={String(need.id)}
                onClick={() => setActiveNeed(need.id)}
                className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  activeNeed === need.id ? "bg-rose-500 text-white shadow-sm" : "border border-rose-100 bg-white text-gray-600"
                }`}
              >
                {need.emoji} {need.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-8 px-4 pt-6 md:px-6">
        {featuredProgram && (
          <section className="space-y-3">
            <SectionLabel>Start here</SectionLabel>
            <FeaturedProgramCard
              program={featuredProgram}
              userProgram={getUserProgram(featuredProgram.id)}
              locked={isLocked(featuredProgram)}
              thumb={getThumbnail(featuredProgram)}
              meta={getProgramMeta(featuredProgram.program_key)}
            />
          </section>
        )}

        <section className="space-y-3">
          <SectionLabel>Browse all journeys</SectionLabel>
          {filteredPrograms.length === 0 ? (
            <div className="rounded-3xl border border-rose-100 bg-white p-10 text-center text-sm text-gray-400">
              No programs found for that focus yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {(browsePrograms.length > 0 ? browsePrograms : featuredProgram ? [featuredProgram] : []).map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  userProgram={getUserProgram(program.id)}
                  locked={isLocked(program)}
                  thumb={getThumbnail(program)}
                  meta={getProgramMeta(program.program_key)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <div className="rounded-3xl border border-rose-100 bg-white p-4 text-center shadow-sm">
      <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-50">{icon}</div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-[11px] text-gray-500">{label}</p>
    </div>
  );
}

function SectionLabel({ children }) {
  return <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">{children}</h2>;
}

function FeaturedProgramCard({ program, userProgram, locked, thumb, meta }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-rose-100 bg-white shadow-sm">
      <div className="grid md:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-[260px] bg-gradient-to-br from-rose-200 to-pink-300">
          {thumb && <img src={thumb} alt={program.title} className="absolute inset-0 h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
          <div className="absolute left-5 top-5 flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold capitalize ${TIER_STYLES[program.access_tier] || "bg-gray-100 text-gray-700"}`}>
              {program.access_tier || "free"}
            </span>
            <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-gray-700">{meta.dayCount || program.duration_days} days</span>
          </div>
          <div className="absolute bottom-5 left-5 right-5 text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-white/75">Featured journey</p>
            <h3 className="mt-1 text-2xl font-bold leading-tight">{program.title}</h3>
            <p className="mt-2 max-w-md text-sm text-white/85">{program.summary || program.description}</p>
          </div>
        </div>

        <div className="space-y-5 p-5 md:p-6">
          <div className="grid grid-cols-3 gap-3 text-center">
            <MiniMeta icon={<Play className="h-3.5 w-3.5 text-red-500" />} label="Videos" value={meta.videos} />
            <MiniMeta icon={<Headphones className="h-3.5 w-3.5 text-purple-500" />} label="Audio" value={meta.sessions} />
            <MiniMeta icon={<BookOpen className="h-3.5 w-3.5 text-amber-600" />} label="Read-ups" value={meta.readUps} />
          </div>

          <div className="rounded-3xl bg-rose-50 p-4 text-sm text-gray-600">
            <p className="font-semibold text-gray-800">What makes this different</p>
            <p className="mt-1 leading-relaxed">Each day gives you one clear flow: a session, a supporting video, and a short educational card with extra reading.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={createPageUrl(`ProgramDetail?key=${program.program_key}`)}
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white"
            >
              {userProgram ? `Continue day ${userProgram.current_day}` : locked ? "Preview journey" : "View journey"}
              <ArrowRight className="h-4 w-4" />
            </a>
            {locked && (
              <a href={createPageUrl("Upgrade")} className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600">
                <Lock className="h-4 w-4" /> Upgrade
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniMeta({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-rose-100 bg-white p-3">
      <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-2xl bg-rose-50">{icon}</div>
      <p className="text-base font-bold text-gray-900">{value}</p>
      <p className="text-[11px] text-gray-500">{label}</p>
    </div>
  );
}

function ProgramCard({ program, userProgram, locked, thumb, meta }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-rose-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-44 bg-gradient-to-br from-rose-200 to-pink-300">
        {thumb && <img src={thumb} alt={program.title} className="h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${TIER_STYLES[program.access_tier] || "bg-gray-100 text-gray-700"}`}>
            {program.access_tier || "free"}
          </span>
          {locked && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-gray-700">
              <Lock className="h-3 w-3" /> Locked
            </span>
          )}
        </div>
        {userProgram && (
          <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-rose-600">
            Day {userProgram.current_day} / {meta.dayCount || program.duration_days}
          </div>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] text-gray-400">
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {meta.dayCount || program.duration_days} days</span>
            {program.level && <span className="capitalize">{program.level}</span>}
          </div>
          <h3 className="text-lg font-semibold leading-tight text-gray-900">{program.title}</h3>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-500">{program.summary || program.description}</p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
          <Pill tone="red" icon={<Play className="h-3 w-3" />} value={meta.videos} />
          <Pill tone="purple" icon={<Headphones className="h-3 w-3" />} value={meta.sessions} />
          <Pill tone="amber" icon={<BookOpen className="h-3 w-3" />} value={meta.readUps} />
        </div>

        <div className="flex gap-2">
          <a href={createPageUrl(`ProgramDetail?key=${program.program_key}`)} className="flex-1 rounded-2xl border border-rose-200 px-4 py-2.5 text-center text-sm font-semibold text-rose-600 hover:bg-rose-50">
            {locked ? "Preview" : "Details"}
          </a>
          <a
            href={userProgram ? createPageUrl(`ProgramDay?key=${program.program_key}&day=${userProgram.current_day}`) : locked ? createPageUrl("Upgrade") : createPageUrl(`ProgramDetail?key=${program.program_key}`)}
            className="flex-1 rounded-2xl bg-rose-500 px-4 py-2.5 text-center text-sm font-semibold text-white"
          >
            {userProgram ? "Continue" : locked ? "Unlock" : "Start"}
          </a>
        </div>
      </div>
    </div>
  );
}

function Pill({ tone, icon, value }) {
  const tones = {
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <div className={`rounded-2xl px-2 py-2 font-medium ${tones[tone]}`}>
      <div className="mb-1 flex items-center justify-center">{icon}</div>
      <div>{value}</div>
    </div>
  );
}