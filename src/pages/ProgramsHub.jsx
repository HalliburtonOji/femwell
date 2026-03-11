import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ArrowRight, Bell, BookOpen, Clock, Flame, Headphones, Lock, Play, Search, Sparkles } from "lucide-react";
import ProgramProgressBar from "../components/programs/ProgramProgressBar";

const NEEDS = [
  { id: null, label: "All", emoji: "✨" },
  { id: "sleep", label: "Sleep", emoji: "💤" },
  { id: "stress", label: "Stress", emoji: "🧘" },
  { id: "pms", label: "PMS", emoji: "🌸" },
  { id: "mobility", label: "Mobility", emoji: "🤸" },
  { id: "menopause", label: "Menopause", emoji: "🌙" },
  { id: "postpartum", label: "Postpartum", emoji: "💝" },
];

const COLLECTIONS = [
  { title: "Sleep & calm", tags: ["sleep", "stress", "calm"] },
  { title: "Hormone support", tags: ["hormone", "cycle", "menopause"] },
  { title: "PMS relief", tags: ["pms", "cramps", "luteal"] },
  { title: "Postpartum reset", tags: ["postpartum", "recovery"] },
  { title: "Mobility & energy", tags: ["mobility", "energy", "movement"] },
];

const TIER_ORDER = { free: 0, plus: 1, pro: 2 };
const TIER_STYLES = {
  free: "bg-emerald-50 text-emerald-700",
  plus: "bg-rose-50 text-rose-700",
  pro: "bg-purple-50 text-purple-700",
};

function getTagText(program) {
  return [
    program.title || "",
    program.summary || "",
    program.need_tags || "",
    program.category || "",
    ...(program.goal_tags || []),
    ...(program.best_for_tags || []),
  ]
    .join(" ")
    .toLowerCase();
}

function isReminderDue(reminderTime) {
  if (!reminderTime) return false;
  const now = new Date();
  const current = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return current >= reminderTime;
}

export default function ProgramsHub() {
  const [userPlan, setUserPlan] = useState("free");
  const [programs, setPrograms] = useState([]);
  const [userPrograms, setUserPrograms] = useState([]);
  const [days, setDays] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeNeed, setActiveNeed] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recommended");
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

  const getProgress = (program, userProgram) => {
    const totalDays = getProgramMeta(program.program_key).dayCount || program.duration_days || 1;
    if (!userProgram) return 0;
    if (userProgram.status === "completed") return 100;
    return (Math.max((userProgram.current_day || 1) - 1, 0) / totalDays) * 100;
  };

  const visiblePrograms = programs
    .filter((program) => !activeNeed || getTagText(program).includes(activeNeed))
    .filter((program) => !search.trim() || getTagText(program).includes(search.trim().toLowerCase()))
    .sort((a, b) => {
      if (sort === "shortest") return (a.duration_days || 999) - (b.duration_days || 999);
      if (sort === "newest") return new Date(b.created_date || 0) - new Date(a.created_date || 0);
      const aScore = (a.is_featured ? 3 : 0) + (getUserProgram(a.id) ? 4 : 0);
      const bScore = (b.is_featured ? 3 : 0) + (getUserProgram(b.id) ? 4 : 0);
      return bScore - aScore;
    });

  const featuredProgram = visiblePrograms.find((program) => program.is_featured) || visiblePrograms[0];
  const browsePrograms = visiblePrograms.filter((program) => program.id !== featuredProgram?.id);

  const activeProgramItems = userPrograms
    .filter((entry) => entry.is_saved || entry.status === "active")
    .map((entry) => ({ entry, program: programs.find((program) => program.id === entry.program_id) }))
    .filter((item) => item.program)
    .sort((a, b) => {
      if ((b.entry.last_activity_date || "") !== (a.entry.last_activity_date || "")) {
        return (b.entry.last_activity_date || "").localeCompare(a.entry.last_activity_date || "");
      }
      return (b.entry.current_day || 1) - (a.entry.current_day || 1);
    });

  const continueItem = activeProgramItems[0] || null;
  const collectionRows = COLLECTIONS.map((row) => ({
    ...row,
    items: visiblePrograms.filter((program) => row.tags.some((tag) => getTagText(program).includes(tag))).slice(0, 6),
  })).filter((row) => row.items.length > 0);

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
                <Sparkles className="h-3.5 w-3.5" /> Guided program library
              </span>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Programs that feel like a real guided journey</h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500 md:text-base">
                  Continue where you left off, browse curated collections, and follow day-by-day flows with progress built in.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <StatCard icon={<Play className="h-4 w-4 text-red-500" />} value={tasks.filter((task) => task.external_url).length} label="Video steps" />
              <StatCard icon={<Headphones className="h-4 w-4 text-purple-500" />} value={tasks.filter((task) => task.content_key).length} label="Audio steps" />
              <StatCard icon={<BookOpen className="h-4 w-4 text-amber-600" />} value={tasks.filter((task) => task.task_type === "READ").length} label="Read-ups" />
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="rounded-3xl border border-rose-100 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search programs by title, need, or tags"
                  className="w-full bg-transparent text-sm text-gray-700 outline-none"
                />
              </div>
            </div>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="rounded-2xl border border-rose-100 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm outline-none"
            >
              <option value="recommended">Recommended</option>
              <option value="shortest">Shortest</option>
              <option value="newest">Newest</option>
            </select>
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
        {continueItem && (
          <section className="space-y-3">
            <SectionLabel>Continue where you left off</SectionLabel>
            <ContinueCard
              program={continueItem.program}
              userProgram={continueItem.entry}
              meta={getProgramMeta(continueItem.program.program_key)}
              thumb={getThumbnail(continueItem.program)}
              locked={isLocked(continueItem.program)}
              progress={getProgress(continueItem.program, continueItem.entry)}
            />

            {activeProgramItems.length > 1 && (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {activeProgramItems.slice(1).map(({ program, entry }) => (
                  <ActiveProgramMiniCard
                    key={entry.id}
                    program={program}
                    userProgram={entry}
                    meta={getProgramMeta(program.program_key)}
                    progress={getProgress(program, entry)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {featuredProgram && (
          <section className="space-y-3">
            <SectionLabel>Start here</SectionLabel>
            <FeaturedProgramCard
              program={featuredProgram}
              userProgram={getUserProgram(featuredProgram.id)}
              locked={isLocked(featuredProgram)}
              thumb={getThumbnail(featuredProgram)}
              meta={getProgramMeta(featuredProgram.program_key)}
              progress={getProgress(featuredProgram, getUserProgram(featuredProgram.id))}
            />
          </section>
        )}

        {collectionRows.map((row) => (
          <section key={row.title} className="space-y-3">
            <SectionLabel>{row.title}</SectionLabel>
            <div className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {row.items.map((program) => (
                <div key={program.id} className="w-[285px] flex-shrink-0">
                  <ProgramCard
                    program={program}
                    userProgram={getUserProgram(program.id)}
                    locked={isLocked(program)}
                    thumb={getThumbnail(program)}
                    meta={getProgramMeta(program.program_key)}
                    progress={getProgress(program, getUserProgram(program.id))}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="space-y-3">
          <SectionLabel>Browse all journeys</SectionLabel>
          {visiblePrograms.length === 0 ? (
            <div className="rounded-3xl border border-rose-100 bg-white p-10 text-center text-sm text-gray-400">
              No programs found for that search yet.
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
                  progress={getProgress(program, getUserProgram(program.id))}
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

function ContinueCard({ program, userProgram, meta, thumb, locked, progress }) {
  const reminderDue = isReminderDue(userProgram.reminder_time);

  return (
    <div className="overflow-hidden rounded-[28px] border border-rose-100 bg-white shadow-sm">
      <div className="grid md:grid-cols-[1.05fr_0.95fr]">
        <div className="relative min-h-[250px] bg-gradient-to-br from-rose-200 to-pink-300">
          {thumb && <img src={thumb} alt={program.title} className="absolute inset-0 h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute left-5 top-5 flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold capitalize ${TIER_STYLES[program.access_tier] || "bg-gray-100 text-gray-700"}`}>
              {program.access_tier || "free"}
            </span>
            <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-gray-700">Day {userProgram.current_day}</span>
          </div>
          <div className="absolute bottom-5 left-5 right-5 text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-white/75">Continue</p>
            <h3 className="mt-1 text-2xl font-bold leading-tight">{program.title}</h3>
            <p className="mt-2 text-sm text-white/85">{program.summary || program.description}</p>
          </div>
        </div>

        <div className="space-y-5 p-5 md:p-6">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm font-medium text-gray-600">
              <span>Current progress</span>
              <span>Day {userProgram.current_day} / {meta.dayCount || program.duration_days}</span>
            </div>
            <ProgramProgressBar value={progress} />
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {userProgram.streak_count > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1.5 font-semibold text-rose-600">
                <Flame className="h-3.5 w-3.5" /> {userProgram.streak_count} day streak
              </span>
            )}
            {userProgram.reminder_time && (
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-semibold ${reminderDue ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                <Bell className="h-3.5 w-3.5" /> {reminderDue ? `Day ${userProgram.current_day} is ready` : `Reminder ${userProgram.reminder_time}`}
              </span>
            )}
          </div>

          <div className="rounded-3xl bg-rose-50 p-4 text-sm text-gray-600">
            <p className="font-semibold text-gray-800">What’s inside</p>
            <p className="mt-1 leading-relaxed">{meta.sessions} audio sessions, {meta.videos} videos, and {meta.readUps} read-ups across {meta.dayCount || program.duration_days} days.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={locked ? createPageUrl("Upgrade") : createPageUrl(`ProgramDay?key=${program.program_key}&day=${userProgram.current_day}`)}
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Continue day {userProgram.current_day}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a href={createPageUrl(`ProgramDetail?key=${program.program_key}`)} className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600">
              Open day list
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActiveProgramMiniCard({ program, userProgram, meta, progress }) {
  return (
    <div className="rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Active</p>
          <h3 className="mt-1 text-lg font-semibold text-gray-900">{program.title}</h3>
        </div>
        {userProgram.streak_count > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-600">
            <Flame className="h-3 w-3" /> {userProgram.streak_count}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-500">Day {userProgram.current_day} of {meta.dayCount || program.duration_days}</p>
      <ProgramProgressBar value={progress} className="mt-3" />
      <div className="mt-4 flex gap-2">
        <a href={createPageUrl(`ProgramDay?key=${program.program_key}&day=${userProgram.current_day}`)} className="flex-1 rounded-2xl bg-rose-500 px-4 py-2.5 text-center text-sm font-semibold text-white">
          Continue
        </a>
        <a href={createPageUrl(`ProgramDetail?key=${program.program_key}`)} className="flex-1 rounded-2xl border border-rose-200 px-4 py-2.5 text-center text-sm font-semibold text-rose-600">
          Day list
        </a>
      </div>
    </div>
  );
}

function FeaturedProgramCard({ program, userProgram, locked, thumb, meta, progress }) {
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

          {userProgram && (
            <div>
              <div className="mb-2 flex items-center justify-between text-sm font-medium text-gray-600">
                <span>Progress</span>
                <span>Day {userProgram.current_day} / {meta.dayCount || program.duration_days}</span>
              </div>
              <ProgramProgressBar value={progress} />
            </div>
          )}

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

function ProgramCard({ program, userProgram, locked, thumb, meta, progress }) {
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

        {userProgram && (
          <div>
            <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-gray-500">
              <span>Day {userProgram.current_day} / {meta.dayCount || program.duration_days}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <ProgramProgressBar value={progress} />
          </div>
        )}

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