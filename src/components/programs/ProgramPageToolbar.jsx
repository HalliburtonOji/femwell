import { ArrowLeft, Menu } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function ProgramPageToolbar({ title, subtitle, showToday = false }) {
  const openMenu = () => {
    window.dispatchEvent(new CustomEvent("open-nav-drawer"));
  };

  return (
    <div className="sticky top-0 z-30 border-b border-rose-100 bg-white/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.history.back()}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-rose-100 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <a
            href={createPageUrl("ProgramsHub")}
            className="inline-flex h-10 items-center rounded-full border border-rose-100 bg-rose-50 px-4 text-sm font-semibold text-rose-600"
          >
            Programs
          </a>
          {showToday && (
            <a
              href={createPageUrl("Today")}
              className="hidden h-10 items-center rounded-full border border-rose-100 bg-white px-4 text-sm font-semibold text-gray-600 sm:inline-flex"
            >
              Today
            </a>
          )}
        </div>

        <div className="min-w-0 text-right">
          {subtitle && <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-400">{subtitle}</p>}
          {title && <p className="truncate text-sm font-semibold text-gray-800">{title}</p>}
        </div>

        <button
          onClick={openMenu}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-100 bg-white text-gray-700 shadow-sm lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}