import { createPageUrl } from "@/utils";
import { BookOpen, CheckCircle2, ExternalLink, Headphones, Play, SkipForward } from "lucide-react";

const card = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-sm)",
};

export default function ProgramTaskCard({ task, content, done, index, opened, onOpen, onComplete, onSkip }) {
  const isRead     = task.task_type === "READ";
  const isJournal  = task.task_type === "JOURNAL";
  const isExternal = Boolean(task.external_url);
  const isInternal = Boolean(content);
  const usesAudio  = content && ["BREATHWORK", "MEDITATION"].includes(content.content_type);
  const needsOpen  = isInternal || isExternal;
  const taskLabel  = task.label || task.title || `Step ${index + 1}`;
  const resourceLinks = task.resource_links_json ? JSON.parse(task.resource_links_json) : [];

  // Type indicator
  const typeLabel = isRead ? "Read" : isJournal ? "Reflect" : usesAudio ? "Audio" : isExternal ? "Video" : "Session";
  const typeStyle = usesAudio
    ? { backgroundColor: "var(--mauve-subtle)", color: "var(--mauve)" }
    : isRead
    ? { backgroundColor: "#FFF8EE", color: "#A07830" }
    : isExternal
    ? { backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }
    : { backgroundColor: "var(--sage-subtle)", color: "var(--sage)" };

  return (
    <div className="rounded-[20px] overflow-hidden transition-all"
      style={{ ...card, opacity: done ? 0.65 : 1, border: done ? "1px solid var(--sage-light)" : "1px solid var(--border)" }}>
      <div className="p-4 md:p-5">
        <div className="flex items-start gap-3.5">
          {/* Step number / done indicator */}
          <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: done ? "var(--sage-subtle)" : "var(--ivory-dark)" }}>
            {done
              ? <CheckCircle2 className="w-4.5 h-4.5" style={{ color: "var(--sage)" }} />
              : <span className="text-xs font-bold" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{index + 1}</span>
            }
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className="text-sm font-semibold" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{taskLabel}</p>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={typeStyle}>{typeLabel}</span>
              {task.is_optional && (
                <span className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "var(--ivory-dark)", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                  optional
                </span>
              )}
            </div>

            {task.instructions && (
              <p className="text-xs leading-relaxed" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{task.instructions}</p>
            )}

            {content && (
              <div className="mt-2.5 rounded-[14px] px-3.5 py-2.5"
                style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border)" }}>
                <p className="text-xs font-semibold" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{content.title}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                  {content.content_type?.toLowerCase()} · {content.duration_minutes || task.duration_minutes || 0} min
                </p>
                {content.summary && (
                  <p className="text-[11px] mt-1 leading-relaxed line-clamp-2" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{content.summary}</p>
                )}
              </div>
            )}

            {task.education_body && (
              <div className="mt-3 rounded-[14px] px-3.5 py-3 text-xs leading-relaxed"
                style={{ backgroundColor: "#FFF8EE", border: "1px solid #F5DFA8", color: "#7A5A20", fontFamily: "'Inter', sans-serif" }}>
                {task.education_body}
              </div>
            )}

            {resourceLinks.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {resourceLinks.map((link) => (
                  <a key={`${task.id}-${link.url}`} href={link.url} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-3 py-1.5 rounded-full transition-colors"
                    style={{ border: "1px solid var(--border)", color: "var(--plum)", backgroundColor: "var(--ivory)", fontFamily: "'Inter', sans-serif" }}>
                    <ExternalLink className="w-3 h-3" /> {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {!done && (
          <div className="ml-[3.25rem] mt-3.5 space-y-2">
            {needsOpen && !opened && (
              <p className="text-xs" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                Open this step first, then mark it complete.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {isInternal ? (
                <a href={createPageUrl(`ContentPlayer?key=${content.content_key}`)} onClick={onOpen}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
                  style={{ backgroundColor: "var(--plum)", color: "white", fontFamily: "'Inter', sans-serif" }}>
                  {usesAudio ? <Headphones className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  Open session
                </a>
              ) : isExternal ? (
                <a href={task.external_url} target="_blank" rel="noreferrer" onClick={onOpen}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
                  style={{ backgroundColor: "var(--plum)", color: "white", fontFamily: "'Inter', sans-serif" }}>
                  <Play className="w-3.5 h-3.5" /> Watch video
                </a>
              ) : null}

              {(!needsOpen || opened) && (
                <button onClick={onComplete}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
                  style={{ backgroundColor: "var(--sage-subtle)", color: "var(--sage)", border: "1px solid var(--sage-light)", fontFamily: "'Inter', sans-serif" }}>
                  {isRead || isJournal ? <BookOpen className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  {isRead ? "Mark read" : "Mark complete"}
                </button>
              )}

              <button onClick={onSkip}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                style={{ backgroundColor: "var(--ivory-dark)", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                <SkipForward className="w-3.5 h-3.5" /> Skip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}