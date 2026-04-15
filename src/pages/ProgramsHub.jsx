import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ArrowRight, Bell, BookOpen, Clock, Flame, Headphones, Lock, Play, Search, ChevronRight } from "lucide-react";
import ProgramProgressBar from "../components/programs/ProgramProgressBar";

const NEEDS = [
  { id: null,          label: "All"         },
  { id: "sleep",       label: "Sleep"       },
  { id: "stress",      label: "Stress"      },
  { id: "pms",         label: "PMS"         },
  { id: "mobility",    label: "Mobility"    },
  { id: "menopause",   label: "Menopause"   },
  { id: "postpartum",  label: "Postpartum"  },
];

const COLLECTIONS = [
  { title: "Sleep & calm",       tags: ["sleep", "stress", "calm"]             },
  { title: "Hormone support",    tags: ["hormone", "cycle", "menopause"]        },
  { title: "PMS relief",         tags: ["pms", "cramps", "luteal"]              },
  { title: "Postpartum reset",   tags: ["postpartum", "recovery"]               },
  { title: "Mobility & energy",  tags: ["mobility", "energy", "movement"]       },
];

const TIER_ORDER = { free: 0, plus: 1, pro: 2 };

// Shared FemWell styles
const card = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-sm)",
};
const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif",
};

const PHASE_ACCENTS = {
  menstrual: "#C96B9E",
  follicular: "#9B7FCC",
  ovulatory: "#E8B84B",
  luteal: "#4ABFA3",
};

function isReminderDue(t) {
  if (!t) return false;
  const now = new Date();
  const cur = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
  return cur >= t;
}

function getTagText(p) {
  return [p.title||"", p.summary||"", p.need_tags||"", p.category||"", ...(p.goal_tags||[]), ...(p.best_for_tags||[])].join(" ").toLowerCase();
}

function SectionLabel({ children }) {
  return <p style={sLabel} className="mb-3">{children}</p>;
}

function TierBadge({ tier }) {
  if (!tier || tier === "free") return null;
  const styles = {
    plus: { backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", border: "1px solid var(--rose-dust-light)" },
    pro:  { backgroundColor: "var(--mauve-subtle)",     color: "var(--mauve)",     border: "1px solid var(--mauve-light)"     },
  };
  return (
    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
      style={styles[tier] || { backgroundColor: "var(--ivory-dark)", color: "var(--mauve)" }}>
      {tier}
    </span>
  );
}

export default function ProgramsHub() {
  const [userPlan, setUserPlan]       = useState("free");
  const [programs, setPrograms]       = useState([]);
  const [userPrograms, setUserPrograms] = useState([]);
  const [days, setDays]               = useState([]);
  const [tasks, setTasks]             = useState([]);
  const [activeNeed, setActiveNeed]   = useState(null);
  const [search, setSearch]           = useState("");
  const [sort, setSort]               = useState("recommended");
  const [phaseRecommendations, setPhaseRecommendations] = useState([]);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    (async () => {
      const user = await base44.auth.me();
      const [progs, ups, ents, programDays, programTasks, profiles] = await Promise.all([
        base44.entities.Programs.list("-created_date", 50),
        base44.entities.UserPrograms.filter({ user_id: user.id }),
        base44.entities.Entitlements.filter({ user_id: user.id }),
        base44.entities.ProgramDays.list("day_number", 250),
        base44.entities.ProgramTasks.list("order_index", 500),
        base44.entities.UserProfile.filter({ user_id: user.id }),
      ]);
      setPrograms(progs);

      try {
        const userProfile = profiles[0];
        if (userProfile?.last_period_start_date) {
          const today = new Date();
          const lastPeriod = new Date(userProfile.last_period_start_date);
          const daysSince = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24));
          const cycleDay = (daysSince % userProfile.cycle_avg_length) + 1;
          const periodLength = userProfile.period_length || 5;
          const phase = cycleDay <= periodLength ? 'menstrual'
            : cycleDay <= 13 ? 'follicular'
            : cycleDay <= 17 ? 'ovulatory'
            : 'luteal';

          const phasePrograms = await base44.entities.Programs.list("-is_featured", 50);
          setCurrentPhase(phase);
          setPhaseRecommendations(
            phasePrograms
              .filter((program) => program.trigger_phase === "any" || program.trigger_phase?.includes(phase))
              .slice(0, 2)
          );
        }
      } catch {}

      setUserPrograms(ups);
      setDays(programDays);
      setTasks(programTasks);
      if (ents[0]) setUserPlan(ents[0].plan || "free");
      setLoading(false);
      // Generate fresh program recommendations in background
      base44.functions.invoke("generateProgramRecommendations", {}).catch(() => {});
    })();
  }, []);

  const getUserProgram  = (id)  => userPrograms.find((e) => e.program_id === id);
  const isLocked        = (p)   => (TIER_ORDER[p.access_tier] || 0) > (TIER_ORDER[userPlan] || 0);
  const getThumbnail    = (p)   => p.cover_thumbnail_url || p.thumbnail_url;
  const getProgramDays  = (key) => days.filter((d) => d.program_key === key);
  const getProgramTasks = (key) => tasks.filter((t) => t.program_key === key);

  const getProgramMeta = (key) => {
    const pt = getProgramTasks(key);
    return {
      readUps:  pt.filter((t) => t.task_type === "READ").length,
      videos:   pt.filter((t) => t.external_url).length,
      sessions: pt.filter((t) => t.content_key).length,
      dayCount: getProgramDays(key).length,
    };
  };

  const getProgress = (program, up) => {
    const total = getProgramMeta(program.program_key).dayCount || program.duration_days || 1;
    if (!up) return 0;
    if (up.status === "completed") return 100;
    return (Math.max((up.current_day || 1) - 1, 0) / total) * 100;
  };

  const visiblePrograms = programs
    .filter((p) => !activeNeed || getTagText(p).includes(activeNeed))
    .filter((p) => !search.trim() || getTagText(p).includes(search.trim().toLowerCase()))
    .sort((a, b) => {
      if (sort === "shortest") return (a.duration_days || 999) - (b.duration_days || 999);
      if (sort === "newest")   return new Date(b.created_date || 0) - new Date(a.created_date || 0);
      const aS = (a.is_featured ? 3 : 0) + (getUserProgram(a.id) ? 4 : 0);
      const bS = (b.is_featured ? 3 : 0) + (getUserProgram(b.id) ? 4 : 0);
      return bS - aS;
    });

  const featuredProgram    = visiblePrograms.find((p) => p.is_featured) || visiblePrograms[0];
  const browsePrograms     = visiblePrograms.filter((p) => p.id !== featuredProgram?.id);
  const activeProgramItems = userPrograms
    .filter((e) => e.is_saved || e.status === "active")
    .map((e) => ({ entry: e, program: programs.find((p) => p.id === e.program_id) }))
    .filter((i) => i.program)
    .sort((a, b) => (b.entry.last_activity_date || "").localeCompare(a.entry.last_activity_date || ""));

  const continueItem    = activeProgramItems[0] || null;
  const collectionRows  = COLLECTIONS
    .map((row) => ({ ...row, items: visiblePrograms.filter((p) => row.tags.some((tag) => getTagText(p).includes(tag))).slice(0, 6) }))
    .filter((row) => row.items.length > 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
    </div>
  );

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-10 md:px-6">
          <p style={sLabel} className="mb-1.5">Guided journeys</p>
          <h1 className="text-3xl font-bold leading-tight md:text-4xl"
            style={{ fontFamily: "'Playfair Display', serif", color: "var(--plum)", letterSpacing: "-0.02em" }}>
            Programs
          </h1>
          <p className="mt-1.5 text-sm md:text-base" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
            Multi-day structured journeys. Follow at your own pace, one day at a time.
          </p>

          {/* Search + sort */}
          <div className="mt-5 flex gap-2">
            <div className="flex-1 flex items-center gap-2.5 rounded-2xl px-4 py-2.5"
              style={{ backgroundColor: "var(--ivory)", border: "1.5px solid var(--border)" }}>
              <Search className="w-4 h-4 flex-shrink-0" style={{ color: "var(--mauve)" }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, need, or goal…"
                className="w-full bg-transparent text-sm outline-none"
                style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }} />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="rounded-2xl px-3 py-2.5 text-xs font-semibold outline-none"
              style={{ backgroundColor: "var(--ivory)", border: "1.5px solid var(--border)", color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
              <option value="recommended">Recommended</option>
              <option value="shortest">Shortest</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {/* Need filters */}
          <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {NEEDS.map((need) => (
              <button key={String(need.id)} onClick={() => setActiveNeed(need.id)}
                className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  backgroundColor: activeNeed === need.id ? "var(--plum)" : "var(--ivory-dark)",
                  color: activeNeed === need.id ? "white" : "var(--mauve)",
                  border: `1px solid ${activeNeed === need.id ? "var(--plum)" : "var(--border)"}`,
                  fontFamily: "'Inter', sans-serif",
                }}>
                {need.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-10 px-4 pt-8 md:px-6">

        {/* ── Continue ──────────────────────────────────────────────────────── */}
        {continueItem && (
          <section>
            <SectionLabel>Continue your journey</SectionLabel>
            <ContinueCard
              program={continueItem.program}
              userProgram={continueItem.entry}
              meta={getProgramMeta(continueItem.program.program_key)}
              thumb={getThumbnail(continueItem.program)}
              locked={isLocked(continueItem.program)}
              progress={getProgress(continueItem.program, continueItem.entry)}
            />
            {activeProgramItems.length > 1 && (
              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {activeProgramItems.slice(1).map(({ program, entry }) => (
                  <ActiveMiniCard key={entry.id} program={program} userProgram={entry}
                    meta={getProgramMeta(program.program_key)}
                    progress={getProgress(program, entry)} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Featured ──────────────────────────────────────────────────────── */}
        {featuredProgram && (
          <section>
            <SectionLabel>A good place to start</SectionLabel>
            <FeaturedCard
              program={featuredProgram}
              userProgram={getUserProgram(featuredProgram.id)}
              locked={isLocked(featuredProgram)}
              thumb={getThumbnail(featuredProgram)}
              meta={getProgramMeta(featuredProgram.program_key)}
              progress={getProgress(featuredProgram, getUserProgram(featuredProgram.id))}
            />
          </section>
        )}

        {/* ── Collections ───────────────────────────────────────────────────── */}
        {collectionRows.map((row) => (
          <section key={row.title}>
            <SectionLabel>{row.title}</SectionLabel>
            <div className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {row.items.map((program) => (
                <div key={program.id} className="w-72 flex-shrink-0">
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

        {currentPhase && phaseRecommendations.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <p style={{ color: "var(--plum)", fontSize: "16px", fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
                For your {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} phase
              </p>
              <span
                className="rounded-full px-[10px] py-[4px] font-bold"
                style={{
                  fontSize: "11px",
                  color: PHASE_ACCENTS[currentPhase],
                  border: `1px solid ${PHASE_ACCENTS[currentPhase]}`,
                  backgroundColor: `${PHASE_ACCENTS[currentPhase]}1F`,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {phaseRecommendations.map((program) => (
                <ProgramCard key={program.id}
                  program={program}
                  userProgram={getUserProgram(program.id)}
                  locked={isLocked(program)}
                  thumb={getThumbnail(program)}
                  meta={getProgramMeta(program.program_key)}
                  progress={getProgress(program, getUserProgram(program.id))}
                />
              ))}
            </div>
            <div className="h-4" />
            <div style={{ borderTop: "1px solid var(--border)" }} />
          </section>
        )}

        {/* ── Browse all ────────────────────────────────────────────────────── */}
        <section>
          <SectionLabel>Browse all journeys</SectionLabel>
          {visiblePrograms.length === 0 ? (
            <div className="rounded-[24px] p-12 text-center" style={card}>
              <p className="text-sm font-medium mb-1.5" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>Nothing matches that search</p>
              <button onClick={() => { setSearch(""); setActiveNeed(null); }}
                className="text-xs font-semibold mt-1"
                style={{ color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {(browsePrograms.length > 0 ? browsePrograms : featuredProgram ? [featuredProgram] : []).map((program) => (
                <ProgramCard key={program.id}
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

// ── Sub-components ──────────────────────────────────────────────────────────

function MetaChip({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
      style={{ backgroundColor: "var(--ivory-dark)", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
      <Icon className="w-3 h-3" /> {value} {label}
    </span>
  );
}

function ContinueCard({ program, userProgram, meta, thumb, locked, progress }) {
  const reminderDue = isReminderDue(userProgram.reminder_time);
  const totalDays   = meta.dayCount || program.duration_days;

  return (
    <div className="overflow-hidden rounded-[28px]" style={card}>
      <div className="grid md:grid-cols-[1.1fr_0.9fr]">
        {/* Image */}
        <div className="relative min-h-[240px]"
          style={{ backgroundColor: "var(--plum)" }}>
          {thumb && <img src={thumb} alt={program.title} className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(42,32,53,0.75) 0%, rgba(42,32,53,0.2) 50%, transparent 100%)" }} />
          <div className="absolute left-5 top-5 flex gap-2">
            <TierBadge tier={program.access_tier} />
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.9)", color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
              Day {userProgram.current_day} of {totalDays}
            </span>
          </div>
          <div className="absolute bottom-5 left-5 right-5 text-white">
            <p style={{ fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.7 }}>Continue</p>
            <h3 className="mt-1 text-2xl font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>{program.title}</h3>
          </div>
        </div>

        {/* Detail */}
        <div className="space-y-4 p-5 md:p-6">
          <div>
            <div className="flex items-center justify-between text-xs mb-2"
              style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <ProgramProgressBar value={progress} />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {userProgram.streak_count > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }}>
                <Flame className="w-3 h-3" /> {userProgram.streak_count} day streak
              </span>
            )}
            {userProgram.reminder_time && (
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ backgroundColor: reminderDue ? "#FFF8EE" : "var(--ivory-dark)", color: reminderDue ? "#A07830" : "var(--mauve)" }}>
                <Bell className="w-3 h-3" />
                {reminderDue ? `Day ${userProgram.current_day} is ready` : `Daily at ${userProgram.reminder_time}`}
              </span>
            )}
          </div>

          <div className="rounded-[16px] p-3.5"
            style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border)" }}>
            <p style={{ ...sLabel, marginBottom: "4px" }}>What's inside</p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
              {meta.sessions} audio sessions · {meta.videos} videos · {meta.readUps} read-ups across {totalDays} days
            </p>
          </div>

          <div className="flex gap-2">
            <a href={locked ? createPageUrl("Upgrade") : createPageUrl(`ProgramDay?key=${program.program_key}&day=${userProgram.current_day}`)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "var(--plum)", color: "white", fontFamily: "'Inter', sans-serif" }}>
              Continue day {userProgram.current_day}
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <a href={createPageUrl(`ProgramsHub?program_key=${program.program_key}`)}
              className="px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center"
              style={{ border: "1.5px solid var(--border)", color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActiveMiniCard({ program, userProgram, meta, progress }) {
  const totalDays = meta.dayCount || program.duration_days;
  return (
    <div className="rounded-[24px] p-5" style={card}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <p style={sLabel} className="mb-1">Active</p>
          <h3 className="font-semibold leading-tight" style={{ color: "var(--plum)", fontFamily: "'Playfair Display', serif" }}>{program.title}</h3>
          <p className="text-xs mt-1" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
            Day {userProgram.current_day} of {totalDays}
          </p>
        </div>
        {userProgram.streak_count > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
            style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }}>
            {userProgram.streak_count}d
          </span>
        )}
      </div>
      <ProgramProgressBar value={progress} />
      <div className="mt-4 flex gap-2">
        <a href={createPageUrl(`ProgramDay?key=${program.program_key}&day=${userProgram.current_day}`)}
          className="flex-1 py-2 rounded-xl text-sm font-semibold text-center"
          style={{ backgroundColor: "var(--plum)", color: "white", fontFamily: "'Inter', sans-serif" }}>
          Continue
        </a>
        <a href={createPageUrl(`ProgramsHub?program_key=${program.program_key}`)}
          className="flex-1 py-2 rounded-xl text-sm font-semibold text-center"
          style={{ border: "1.5px solid var(--border)", color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
          Days
        </a>
      </div>
    </div>
  );
}

function FeaturedCard({ program, userProgram, locked, thumb, meta, progress }) {
  const totalDays = meta.dayCount || program.duration_days;
  return (
    <div className="overflow-hidden rounded-[28px]" style={card}>
      <div className="grid md:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-[260px]" style={{ backgroundColor: "var(--plum)" }}>
          {thumb && <img src={thumb} alt={program.title} className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(42,32,53,0.75) 0%, rgba(42,32,53,0.2) 50%, transparent 100%)" }} />
          <div className="absolute left-5 top-5 flex gap-2">
            <TierBadge tier={program.access_tier} />
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.9)", color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
              {totalDays} days
            </span>
          </div>
          <div className="absolute bottom-5 left-5 right-5 text-white">
            <p style={{ fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.7 }}>
              {program.is_featured ? "Featured journey" : "Guided journey"}
            </p>
            <h3 className="mt-1 text-2xl font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>{program.title}</h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>{program.summary || program.description}</p>
          </div>
        </div>

        <div className="space-y-4 p-5 md:p-6">
          <div className="flex flex-wrap gap-2">
            <MetaChip icon={Play}      label="videos"   value={meta.videos}   />
            <MetaChip icon={Headphones} label="audio"   value={meta.sessions} />
            <MetaChip icon={BookOpen}  label="read-ups" value={meta.readUps}  />
          </div>

          {userProgram && (
            <div>
              <div className="flex justify-between text-xs mb-2" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                <span>Progress</span>
                <span>Day {userProgram.current_day} / {totalDays}</span>
              </div>
              <ProgramProgressBar value={progress} />
            </div>
          )}

          <div className="rounded-[16px] p-3.5" style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border)" }}>
            <p style={{ ...sLabel, marginBottom: "4px" }}>How it works</p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
              Each day has one clear flow — a session, a supporting video, and a short educational card.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a href={createPageUrl(`ProgramsHub?program_key=${program.program_key}`)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "var(--plum)", color: "white", fontFamily: "'Inter', sans-serif" }}>
              {userProgram ? `Continue day ${userProgram.current_day}` : locked ? "Preview journey" : "View journey"}
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            {locked && (
              <a href={createPageUrl("Upgrade")}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold"
                style={{ border: "1.5px solid var(--border)", color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                <Lock className="w-3.5 h-3.5" /> Unlock
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgramCard({ program, userProgram, locked, thumb, meta, progress }) {
  const totalDays = meta.dayCount || program.duration_days;
  const isCompleted = userProgram?.status === "completed";
  const streak = userProgram?.streak_count || 0;

  const handleRestart = async () => {
    if (!userProgram) return;
    await base44.entities.UserPrograms.update(userProgram.id, {
      current_day: 1, status: "active", completed_at: null, streak_count: 0,
    });
    window.location.href = createPageUrl(`ProgramDay?key=${program.program_key}&day=1`);
  };

  return (
    <div className="overflow-hidden rounded-[24px] transition-all hover:-translate-y-0.5" style={card}>
      <div className="relative h-44" style={{ backgroundColor: "var(--plum)" }}>
        {thumb && <img src={thumb} alt={program.title} className="w-full h-full object-cover" />}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(42,32,53,0.65) 0%, transparent 55%)" }} />
        <div className="absolute left-3.5 top-3.5 flex gap-1.5 flex-wrap">
          <TierBadge tier={program.access_tier} />
          {locked && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.9)", color: "var(--plum)" }}>
              <Lock className="w-2.5 h-2.5" /> Locked
            </span>
          )}
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "rgba(122,158,142,0.92)", color: "white" }}>
              ✓ Complete
            </span>
          )}
          {streak > 0 && !isCompleted && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.9)", color: "var(--rose-dust)" }}>
              🔥 {streak}d streak
            </span>
          )}
        </div>
        {/* Progress bar along bottom of image */}
        {userProgram && (
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
            <div className="h-full" style={{ width: `${progress}%`, backgroundColor: isCompleted ? "#7A9E8E" : "var(--rose-dust)", transition: "width 0.4s ease" }} />
          </div>
        )}
      </div>

      <div className="p-4 space-y-3.5">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
              <Clock className="w-3 h-3" /> {totalDays} days
            </span>
            {program.level && <span className="text-[10px] capitalize" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{program.level}</span>}
          </div>
          <h3 className="font-semibold leading-tight" style={{ color: "var(--plum)", fontFamily: "'Playfair Display', serif" }}>{program.title}</h3>
          <p className="mt-1.5 text-xs leading-relaxed line-clamp-2" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{program.summary || program.description}</p>
        </div>

        {userProgram && !isCompleted && (
          <div>
            <div className="flex justify-between text-[10px] mb-1.5" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
              <span>Day {userProgram.current_day} / {totalDays}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <ProgramProgressBar value={progress} />
          </div>
        )}

        <div className="flex gap-2">
          {isCompleted ? (
            <>
              <a href={createPageUrl(`ProgramsHub?program_key=${program.program_key}`)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-center"
                style={{ border: "1.5px solid var(--border)", color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                Details
              </a>
              <button onClick={handleRestart}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-center"
                style={{ backgroundColor: "var(--sage)", color: "white", fontFamily: "'Inter', sans-serif", border: "none", cursor: "pointer" }}>
                Restart
              </button>
            </>
          ) : (
            <>
              <a href={createPageUrl(`ProgramsHub?program_key=${program.program_key}`)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-center"
                style={{ border: "1.5px solid var(--border)", color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                {locked ? "Preview" : "Details"}
              </a>
              <a href={userProgram ? createPageUrl(`ProgramDay?key=${program.program_key}&day=${userProgram.current_day}`) : locked ? createPageUrl("Upgrade") : createPageUrl(`ProgramDetail?key=${program.program_key}`)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-center"
                style={{ backgroundColor: "var(--plum)", color: "white", fontFamily: "'Inter', sans-serif" }}>
                {userProgram ? "Continue →" : locked ? "Unlock" : "Start"}
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}