import { ArrowLeft, ArrowRight } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function ProgramDayStickyNav({ programKey, currentDay, days }) {
  const totalDays = days.length;
  const prevHref = currentDay > 1 ? createPageUrl(`ProgramDay?key=${programKey}&day=${currentDay - 1}`) : null;
  const nextHref = currentDay < totalDays ? createPageUrl(`ProgramDay?key=${programKey}&day=${currentDay + 1}`) : null;

  return (
    <div className="sticky top-0 z-20 mb-4 rounded-[24px] p-3"
      style={{ border: "1px solid var(--border)", backgroundColor: "var(--surface)", boxShadow: "var(--shadow-sm)" }}>
      <div className="flex items-center gap-2">
        {prevHref ? (
          <a href={prevHref} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }}>
            <ArrowLeft className="h-4 w-4" />
          </a>
        ) : (
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "var(--ivory-dark)", color: "var(--border)" }}>
            <ArrowLeft className="h-4 w-4" />
          </div>
        )}

        <div className="flex-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          <div className="flex gap-2">
            {days.map((day) => {
              const isActive = day.day_number === currentDay;
              return (
                <a
                  key={day.id || day.day_number}
                  href={createPageUrl(`ProgramDay?key=${programKey}&day=${day.day_number}`)}
                  className="flex-shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: isActive ? "var(--plum)" : "var(--rose-dust-subtle)",
                    color: isActive ? "white" : "var(--rose-dust)",
                  }}
                >
                  Day {day.day_number}
                </a>
              );
            })}
          </div>
        </div>

        {nextHref ? (
          <a href={nextHref} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }}>
            <ArrowRight className="h-4 w-4" />
          </a>
        ) : (
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "var(--ivory-dark)", color: "var(--border)" }}>
            <ArrowRight className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
}