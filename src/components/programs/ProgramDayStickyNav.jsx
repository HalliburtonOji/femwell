import { ArrowLeft, ArrowRight } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function ProgramDayStickyNav({ programKey, currentDay, days }) {
  const totalDays = days.length;
  const prevHref = currentDay > 1 ? createPageUrl(`ProgramDay?key=${programKey}&day=${currentDay - 1}`) : null;
  const nextHref = currentDay < totalDays ? createPageUrl(`ProgramDay?key=${programKey}&day=${currentDay + 1}`) : null;

  return (
    <div className="sticky top-0 z-20 mb-4 rounded-[24px] border border-rose-100 bg-white/90 p-3 shadow-sm backdrop-blur-xl">
      <div className="flex items-center gap-2">
        {prevHref ? (
          <a href={prevHref} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <ArrowLeft className="h-4 w-4" />
          </a>
        ) : (
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-gray-300">
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
                  className={`flex-shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition-all ${
                    isActive ? "bg-rose-500 text-white" : "bg-rose-50 text-rose-600"
                  }`}
                >
                  Day {day.day_number}
                </a>
              );
            })}
          </div>
        </div>

        {nextHref ? (
          <a href={nextHref} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <ArrowRight className="h-4 w-4" />
          </a>
        ) : (
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-gray-300">
            <ArrowRight className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
}