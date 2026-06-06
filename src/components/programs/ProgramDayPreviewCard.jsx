import { createPageUrl } from "@/utils";
import { BookOpen, CheckCircle2, ChevronDown, ChevronUp, Clock, ExternalLink, Headphones, Lock, Play } from "lucide-react";

const card = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-sm)",
};
const sLabel = {
  fontSize: "0.55rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", };

const STATUS_CONFIG = {
  completed: { label: "Done",     bg: "var(--sage-subtle)",      color: "var(--sage)"      },
  current:   { label: "Today",    bg: "var(--rose-dust-subtle)", color: "var(--rose-dust)" },
  upcoming:  { label: "Upcoming", bg: "var(--ivory-dark)",       color: "var(--mauve)"     },
};

export default function ProgramDayPreviewCard({ day, tasks, expanded, onToggle, programKey, status = "upcoming" }) {
  const readCount     = tasks.filter((t) => t.task_type === "READ").length;
  const externalCount = tasks.filter((t) => t.external_url).length;
  const sessionCount  = tasks.filter((t) => t.content_key).length;
  const title         = day.title || day.theme_title || `Day ${day.day_number}`;
  const summary       = day.focus || day.theme_description;
  const openHref      = createPageUrl(`ProgramDay?key=${programKey}&day=${day.day_number}`);
  const cfg           = STATUS_CONFIG[status] || STATUS_CONFIG.upcoming;

  return (
    <div className="overflow-hidden rounded-[20px]" style={{
      ...card,
      border: status === "current" ? "1px solid var(--rose-dust-light)" : "1px solid var(--border)",
    }}>
      <a href={openHref} className="block p-4 md:p-5">
        <div className="flex items-start gap-4">
          {/* Day number */}
          <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: status === "current" ? "var(--plum)" : "var(--ivory-dark)" }}>
            {status === "completed"
              ? <CheckCircle2 className="w-4.5 h-4.5" style={{ color: "var(--sage)" }} />
              : status === "upcoming"
              ? <Lock className="w-3.5 h-3.5" style={{ color: "var(--mauve)" }} />
              : <span className="text-sm font-bold" style={{ color: "white", }}>{day.day_number}</span>
            }
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold" style={{ color: "var(--plum)", }}>{title}</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: cfg.bg, color: cfg.color, }}>
                {cfg.label}
              </span>
              {day.estimated_minutes > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: "var(--mauve)", }}>
                  <Clock className="w-3 h-3" /> {day.estimated_minutes} min
                </span>
              )}
            </div>
            {summary && <p className="text-xs leading-relaxed" style={{ color: "var(--mauve)", }}>{summary}</p>}

            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {sessionCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "var(--mauve-subtle)", color: "var(--mauve)", }}>
                  <Headphones className="w-2.5 h-2.5" /> {sessionCount} audio
                </span>
              )}
              {externalCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", }}>
                  <Play className="w-2.5 h-2.5" /> {externalCount} video
                </span>
              )}
              {readCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "#FFF8EE", color: "#A07830", }}>
                  <BookOpen className="w-2.5 h-2.5" /> {readCount} read
                </span>
              )}
            </div>
          </div>
        </div>
      </a>

      <div className="flex items-center gap-2 px-4 py-3 md:px-5"
        style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <a href={openHref}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
          style={{ backgroundColor: "var(--plum)", color: "white", }}>
          Open day
        </a>
        <button onClick={onToggle}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
          style={{ backgroundColor: "var(--ivory-dark)", color: "var(--mauve)", }}>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          Preview
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-3 md:px-5 md:pb-5 space-y-2"
          style={{ borderTop: "1px solid var(--border-subtle)" }}>
          {tasks.map((task, i) => (
            <div key={task.id} className="flex items-start gap-2.5 text-xs"
              style={{ color: "var(--plum)", }}>
              <span className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold mt-0.5"
                style={{ backgroundColor: "var(--ivory-dark)", color: "var(--mauve)" }}>
                {i + 1}
              </span>
              <span className="leading-relaxed">{task.label || task.title || `Step ${i + 1}`}</span>
              {task.external_url && <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: "var(--border)" }} />}
            </div>
          ))}
          {day.reflection_prompt && (
            <div className="mt-3 rounded-[14px] px-3.5 py-3"
              style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)" }}>
              <p style={{ ...sLabel, marginBottom: "4px" }}>Reflection prompt</p>
              <p className="text-xs italic leading-relaxed" style={{ color: "var(--plum)", }}>
                {day.reflection_prompt}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}