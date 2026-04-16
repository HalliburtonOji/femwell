import { Bell, Flame } from "lucide-react";
import { createPageUrl } from "@/utils";

const card = { backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" };
const label = { fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" };

function isReminderDue(reminderTime) {
  if (!reminderTime) return false;
  const now = new Date();
  const current = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return current >= reminderTime;
}

export default function ActiveProgramCard({ activeProgramEntry, activeProgram }) {
  if (!activeProgram || !activeProgramEntry) return null;
  const showProgramReminder = activeProgramEntry.reminder_time && isReminderDue(activeProgramEntry.reminder_time);

  return (
    <div className="rounded-[24px] p-5 mb-4" style={card}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="mb-1" style={label}>Active Program</p>
          <h3 className="text-lg font-semibold leading-tight" style={{ color: "var(--plum)", fontFamily: "'Playfair Display', serif" }}>{activeProgram.title}</h3>
          <p className="text-xs mt-1" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Day {activeProgramEntry.current_day || 1} · pick up where you left off</p>
        </div>
        {activeProgramEntry.streak_count > 0 && (
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold flex-shrink-0" style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }}>
            <Flame className="w-3 h-3" />{activeProgramEntry.streak_count} day streak
          </div>
        )}
      </div>
      {showProgramReminder && (
        <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium mb-4" style={{ backgroundColor: "#FFF8EE", color: "#A07830" }}>
          <Bell className="w-3 h-3" /> Day {activeProgramEntry.current_day || 1} is ready
        </div>
      )}
      <div className="flex gap-2.5">
        <a href={createPageUrl(`ProgramDay?key=${activeProgram.program_key}&day=${activeProgramEntry.current_day || 1}`)}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center"
          style={{ backgroundColor: "var(--plum)", color: "white", fontFamily: "'Inter', sans-serif" }}>
          Continue Program
        </a>
        <a href={createPageUrl(`ProgramDetail?key=${activeProgram.program_key}`)}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center"
          style={{ border: "1.5px solid var(--border)", color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
          Day List
        </a>
      </div>
    </div>
  );
}