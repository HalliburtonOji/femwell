import { createPageUrl } from "@/utils";
import { BookOpen, CheckCircle2, ExternalLink, Headphones, Play, SkipForward, Sparkles } from "lucide-react";

export default function ProgramTaskCard({ task, content, done, index, opened, onOpen, onComplete, onSkip }) {
  const isRead = task.task_type === "READ";
  const isJournal = task.task_type === "JOURNAL";
  const isExternal = Boolean(task.external_url);
  const isInternal = Boolean(content);
  const resourceLinks = task.resource_links_json ? JSON.parse(task.resource_links_json) : [];
  const taskLabel = task.label || task.title || `Task ${index + 1}`;
  const usesAudio = content && ["BREATHWORK", "MEDITATION"].includes(content.content_type);
  const needsOpenStep = isInternal || isExternal;

  return (
    <div className={`card-glass rounded-3xl border border-white/60 p-4 md:p-5 ${done ? "opacity-70" : ""}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ${done ? "bg-emerald-100" : "bg-rose-100"}`}>
          {done ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : isRead ? (
            <BookOpen className="h-5 w-5 text-rose-500" />
          ) : isInternal && usesAudio ? (
            <Headphones className="h-5 w-5 text-rose-500" />
          ) : isExternal ? (
            <ExternalLink className="h-5 w-5 text-rose-500" />
          ) : (
            <Sparkles className="h-5 w-5 text-rose-500" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-gray-800">{taskLabel}</p>
            {task.is_optional && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">optional</span>
            )}
          </div>

          {task.instructions && <p className="mt-1 text-xs leading-relaxed text-gray-500">{task.instructions}</p>}

          {content && (
            <div className="mt-2 rounded-2xl bg-white/70 px-3 py-2 text-xs text-gray-600">
              <p className="font-medium text-gray-700">{content.title}</p>
              <p className="mt-0.5 text-gray-500">{content.content_type} · {content.duration_minutes || task.duration_minutes || 0} min</p>
              {content.summary && <p className="mt-1 line-clamp-2">{content.summary}</p>}
            </div>
          )}

          {task.education_body && (
            <div className="mt-3 rounded-2xl bg-amber-50/80 px-3 py-3 text-sm leading-relaxed text-gray-700">
              {task.education_body}
            </div>
          )}

          {resourceLinks.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {resourceLinks.map((link) => (
                <a
                  key={`${task.id}-${link.url}`}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-white px-3 py-1.5 text-[11px] font-medium text-rose-600 hover:bg-rose-50"
                >
                  <ExternalLink className="h-3 w-3" /> {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {!done && (
        <div className="ml-[3.25rem] mt-4 space-y-2">
          {needsOpenStep && !opened && (
            <p className="text-xs text-gray-400">Open this step first, then mark it complete when you’re done.</p>
          )}

          <div className="flex flex-wrap gap-2">
            {isInternal ? (
              <a
                href={createPageUrl(`ContentPlayer?key=${content.content_key}`)}
                onClick={onOpen}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-500 px-4 py-2 text-xs font-semibold text-white"
              >
                {usesAudio ? <Headphones className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />} Open session
              </a>
            ) : isExternal ? (
              <a
                href={task.external_url}
                target="_blank"
                rel="noreferrer"
                onClick={onOpen}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-500 px-4 py-2 text-xs font-semibold text-white"
              >
                <Play className="h-3.5 w-3.5" /> Watch video
              </a>
            ) : null}

            {(!needsOpenStep || opened) && (
              <button
                onClick={onComplete}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-white"
              >
                {isRead || isJournal ? <BookOpen className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                {isRead ? "Mark read" : "Mark complete"}
              </button>
            )}

            <button
              onClick={onSkip}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-gray-100 px-3 py-2 text-xs font-medium text-gray-500"
            >
              <SkipForward className="h-3.5 w-3.5" /> Skip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}