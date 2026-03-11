import { BookOpen, Clock, ExternalLink, Headphones, Play } from "lucide-react";

export default function ProgramDayPreviewCard({ day, tasks, expanded, onToggle }) {
  const readCount = tasks.filter((task) => task.task_type === "READ").length;
  const externalCount = tasks.filter((task) => task.external_url).length;
  const sessionCount = tasks.filter((task) => task.content_key).length;
  const title = day.title || day.theme_title || `Day ${day.day_number}`;
  const summary = day.focus || day.theme_description;

  return (
    <div className="overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-sm">
      <button onClick={onToggle} className="w-full p-4 text-left md:p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-sm font-bold text-rose-600">
            {day.day_number}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-800 md:text-base">{title}</h3>
              {day.estimated_minutes ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-[10px] font-medium text-rose-600">
                  <Clock className="h-3 w-3" /> {day.estimated_minutes} min
                </span>
              ) : null}
            </div>
            {summary && <p className="mt-1 text-sm leading-relaxed text-gray-500">{summary}</p>}
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              {sessionCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 font-medium text-purple-600">
                  <Headphones className="h-3 w-3" /> {sessionCount} session{sessionCount > 1 ? "s" : ""}
                </span>
              )}
              {externalCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 font-medium text-red-600">
                  <Play className="h-3 w-3" /> {externalCount} video{externalCount > 1 ? "s" : ""}
                </span>
              )}
              {readCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-700">
                  <BookOpen className="h-3 w-3" /> {readCount} read-up{readCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-rose-50 px-4 pb-4 pt-3 md:px-5 md:pb-5">
          <div className="space-y-2">
            {tasks.map((task, index) => (
              <div key={task.id} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-0.5 text-rose-400">{index + 1}.</span>
                <span>{task.label || task.title || `Task ${index + 1}`}</span>
                {task.external_url && <ExternalLink className="mt-0.5 h-3.5 w-3.5 text-gray-300" />}
              </div>
            ))}
          </div>
          {day.reflection_prompt && (
            <p className="mt-4 rounded-2xl bg-rose-50 px-3 py-3 text-sm italic text-gray-600">Reflection: {day.reflection_prompt}</p>
          )}
        </div>
      )}
    </div>
  );
}