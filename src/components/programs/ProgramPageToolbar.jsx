import { ArrowLeft, Menu } from "lucide-react";
import { createPageUrl } from "@/utils";

const sLabel = {
  fontSize: "0.55rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif",
};

export default function ProgramPageToolbar({ title, subtitle, showToday = false }) {
  const openMenu = () => window.dispatchEvent(new CustomEvent("open-nav-drawer"));

  return (
    <div className="sticky top-0 z-30 backdrop-blur-xl"
      style={{ backgroundColor: "rgba(255,255,255,0.94)", borderBottom: "1px solid var(--border)" }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">

        <div className="flex items-center gap-2">
          <button onClick={() => window.history.back()}
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors"
            style={{ border: "1.5px solid var(--border)", color: "var(--plum)", backgroundColor: "var(--surface)", fontFamily: "'Inter', sans-serif" }}>
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <a href={createPageUrl("ProgramsHub")}
            className="inline-flex h-9 items-center rounded-full px-3 text-sm font-semibold transition-colors"
            style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", border: "1px solid var(--rose-dust-light)", fontFamily: "'Inter', sans-serif" }}>
            Programs
          </a>
          {showToday && (
            <a href={createPageUrl("Today")}
              className="hidden h-9 items-center rounded-full px-3 text-sm font-semibold sm:inline-flex"
              style={{ border: "1.5px solid var(--border)", color: "var(--plum)", backgroundColor: "var(--surface)", fontFamily: "'Inter', sans-serif" }}>
              Today
            </a>
          )}
        </div>

        <div className="min-w-0 text-right flex-1 mx-3">
          {subtitle && <p style={sLabel}>{subtitle}</p>}
          {title && <p className="truncate text-sm font-semibold" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{title}</p>}
        </div>

        <button onClick={openMenu}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full lg:hidden"
          style={{ border: "1.5px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--plum)" }}>
          <Menu className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}