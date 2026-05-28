import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sun, Utensils, BookOpen, Book, Sparkles, Activity, HeartPulse,
  CalendarDays, LayoutGrid, Users, Compass, Search,
  Settings, Stethoscope, UsersRound, LogOut, ChevronRight,
  BarChart2,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

// Routes that exist in App.jsx — anything else warns and routes to "/"
const KNOWN_ROUTES = new Set([
  "/", "/Today", "/Lifestyle", "/Profile", "/Nutrition", "/Journal",
  "/Pulse", "/Planner", "/ProgramsHub", "/SkinHair",
  "/LifeStageCare", "/Community", "/Saved", "/Deals", "/Events",
  "/Settings", "/DoctorExport", "/PartnerSettings", "/Explore",
  "/Track", "/Onboarding", "/CycleSettings", "/Upgrade",
  "/Ideas",
  // Health letter hub (replaces /SkinHair, /LifeStageCare AND /HealthDashboard).
  // /HealthDashboard now redirects to /Health via App.jsx — kept out of the
  // whitelist so any stray nav link warns rather than silently 404s.
  "/Health",
]);

function safeRoute(path) {
  if (KNOWN_ROUTES.has(path)) return path;
  // eslint-disable-next-line no-console
  console.warn(`Route ${path} not yet implemented`);
  return "/";
}

const QUICK_TILES = [
  { label: "Nutrition", sub: "Log a meal",   icon: Utensils, route: "/Nutrition" },
  { label: "Journal",   sub: "Write a note", icon: BookOpen, route: "/Journal" },
  { label: "Lifestyle", sub: "Your feed",    icon: Book,     route: "/Lifestyle" },
  { label: "Assistant", sub: "Ask Jess",     icon: Sparkles, action: "open_jess" },
];

const PILLARS = [
  { label: "Track",    icon: Activity,     route: "/Track" },
  // Health (formerly /HealthDashboard "Your Health Story") now points to
  // the unified Health Letter page. There is exactly one Health entry across
  // the menu — duplicates were removed.
  { label: "Health",   icon: HeartPulse,   route: "/Health" },
  { label: "Pulse",    icon: HeartPulse,   route: "/Pulse" },
  { label: "Planner",  icon: CalendarDays, route: "/Planner" },
  { label: "Programs", icon: LayoutGrid,   route: "/ProgramsHub" },
];

// COMMUNITY_ROWS — the secondary row of menu links. Health intentionally
// lives ONLY in the PILLARS row above to avoid duplicate "Health" entries.
const COMMUNITY_ROWS = [
  { label: "Community",   icon: Users,      route: "/Community" },
  { label: "Journal",     icon: BookOpen,   route: "/Journal" },
  { label: "Explore",     icon: Search,     route: "/Explore" },
  { label: "Nutrition",   icon: Utensils,   route: "/Nutrition" },
];

const ACCOUNT_ROWS = [
  { label: "Settings",     icon: Settings,    route: "/Settings" },
  { label: "Care Bridge",  icon: Stethoscope, route: "/DoctorExport" },
  { label: "Partner Sync", icon: UsersRound,  route: "/PartnerSettings" },
];

const SECTION_HDR = {
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  fontSize: 12,
  letterSpacing: "0.25em",
  textTransform: "uppercase",
  color: "var(--plum-mute)",
  marginTop: 28,
  marginBottom: 8,
};

const TILE_BASE = {
  background: "var(--cream-2)",
  borderRadius: 16,
  padding: 14,
  border: "none",
  cursor: "pointer",
  textAlign: "left",
  display: "flex",
  flexDirection: "column",
  gap: 4,
  minHeight: 76,
  width: "100%",
};

const ROW_BASE = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: "16px",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  width: "100%",
  textAlign: "left",
  minHeight: 56,
};

export default function MenuSheet({ open, onClose, returnFocusRef }) {
  const navigate = useNavigate();
  const sheetRef = useRef(null);
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartRef = useRef(null);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Focus management + ESC + focus trap
  useEffect(() => {
    if (!open) return;
    const sheet = sheetRef.current;
    if (!sheet) return;

    const focusables = () => Array.from(
      sheet.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])')
    ).filter((el) => !el.disabled);

    const first = focusables()[0];
    if (first) first.focus();

    const handleKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const els = focusables();
      if (!els.length) return;
      const firstEl = els[0];
      const lastEl = els[els.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault(); lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault(); firstEl.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Return focus on close
  useEffect(() => {
    if (!open && returnFocusRef?.current) {
      returnFocusRef.current.focus();
    }
  }, [open, returnFocusRef]);

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setConfirmingSignOut(false);
      setDragOffset(0);
    }
  }, [open]);

  if (!open) return null;

  const go = (route) => {
    navigate(safeRoute(route));
    onClose();
  };

  const handleAction = (action) => {
    if (action === "open_jess") {
      onClose();
      // Defer so close animation can settle, then trigger existing assistant
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("fw_open_assistant"));
      }, 80);
    }
  };

  const handleSignOut = async () => {
    try {
      await base44.auth.logout("/");
    } catch {
      toast("Couldn't sign out.", {
        action: { label: "Retry", onClick: handleSignOut },
      });
    }
  };

  // Drag-down to close
  const onTouchStart = (e) => {
    dragStartRef.current = { y: e.touches[0].clientY, t: Date.now() };
  };
  const onTouchMove = (e) => {
    if (!dragStartRef.current) return;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    if (dy > 0) setDragOffset(dy);
  };
  const onTouchEnd = () => {
    if (!dragStartRef.current) return;
    const dy = dragOffset;
    const dt = Date.now() - dragStartRef.current.t;
    const velocity = dt > 0 ? (dy / dt) * 1000 : 0;
    const sheet = sheetRef.current;
    const threshold = sheet ? sheet.offsetHeight * 0.4 : 240;
    if (dy > threshold || velocity > 300) {
      onClose();
    } else {
      setDragOffset(0);
    }
    dragStartRef.current = null;
  };

  return (
    <>
      {/* Scrim */}
      <div
        role="presentation"
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 80,
          backgroundColor: "rgba(43,30,22,0.55)",
        }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        style={{
          position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 81,
          backgroundColor: "var(--cream)",
          borderRadius: "24px 24px 0 0",
          maxHeight: "min(72vh, calc(100dvh - 48px))",
          padding: "24px 24px 32px",
          overflowY: "auto",
          boxShadow: "0 -10px 30px rgba(43,30,22,0.18)",
          transform: `translateY(${dragOffset}px)`,
          transition: dragOffset === 0 ? "transform 200ms cubic-bezier(.2,.8,.2,1)" : "none",
        }}
      >
        {/* Drag handle */}
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ display: "flex", justifyContent: "center", paddingBottom: 8, cursor: "grab" }}
        >
          <div style={{ width: 40, height: 4, borderRadius: 9999, backgroundColor: "var(--ink-line)" }} />
        </div>

        <h2 style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 300, fontSize: 28, color: "var(--plum-deep)",
          margin: "16px 0 12px",
        }}>
          Menu
        </h2>

        {/* QUICK ACTIONS */}
        <p style={SECTION_HDR}>QUICK ACTIONS</p>

        <button
          onClick={() => go("/Today")}
          style={{
            width: "100%", height: 64,
            background: "var(--plum-deep)", color: "var(--cream)",
            border: "none", borderRadius: 16, padding: "0 18px",
            display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
            <Sun size={22} aria-hidden="true" />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 18 }}>Log today</span>
                <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: "var(--rose-primary)" }} />
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 12, color: "var(--rose-soft)" }}>
                Check in, meals, symptoms
              </div>
            </div>
          </div>
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
          {QUICK_TILES.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.label}
                onClick={() => t.action ? handleAction(t.action) : go(t.route)}
                style={TILE_BASE}
              >
                <Icon size={22} aria-hidden="true" style={{ color: "var(--plum-deep)" }} />
                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 14, color: "var(--plum-deep)" }}>
                  {t.label}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 12, color: "var(--plum-mute)" }}>
                  {t.sub}
                </div>
              </button>
            );
          })}
        </div>

        {/* DAILY PILLARS */}
        <p style={SECTION_HDR}>DAILY PILLARS</p>
        <div className="grid grid-cols-2 min-[480px]:grid-cols-4" style={{ gap: 8 }}>
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <button key={p.label} onClick={() => go(p.route)} style={{ ...TILE_BASE, minHeight: 76, justifyContent: "center" }}>
                <Icon size={22} aria-hidden="true" style={{ color: "var(--plum-deep)" }} />
                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 14, color: "var(--plum-deep)" }}>
                  {p.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* COMMUNITY & CONTENT */}
        <p style={SECTION_HDR}>COMMUNITY &amp; CONTENT</p>
        <div>
          {COMMUNITY_ROWS.map((r, i) => {
            const Icon = r.icon;
            const isLast = i === COMMUNITY_ROWS.length - 1;
            return (
              <button
                key={r.label}
                onClick={() => go(r.route)}
                style={{
                  ...ROW_BASE,
                  borderBottom: isLast ? "none" : "1px solid var(--ink-line)",
                }}
              >
                <Icon size={22} aria-hidden="true" style={{ color: "var(--plum-deep)" }} />
                <span style={{ flex: 1, fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: 16, color: "var(--plum-deep)" }}>
                  {r.label}
                </span>
                <ChevronRight size={16} aria-hidden="true" style={{ color: "var(--plum-mute)" }} />
              </button>
            );
          })}
        </div>

        {/* ACCOUNT & TOOLS */}
        <p style={SECTION_HDR}>ACCOUNT &amp; TOOLS</p>
        <div>
          {ACCOUNT_ROWS.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.label}
                onClick={() => go(r.route)}
                style={{
                  ...ROW_BASE,
                  borderBottom: "1px solid var(--ink-line)",
                }}
              >
                <Icon size={22} aria-hidden="true" style={{ color: "var(--plum-deep)" }} />
                <span style={{ flex: 1, fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: 16, color: "var(--plum-deep)" }}>
                  {r.label}
                </span>
                <ChevronRight size={16} aria-hidden="true" style={{ color: "var(--plum-mute)" }} />
              </button>
            );
          })}

          {/* Sign out (destructive) */}
          {!confirmingSignOut ? (
            <button
              onClick={() => setConfirmingSignOut(true)}
              style={ROW_BASE}
            >
              <LogOut size={22} aria-hidden="true" style={{ color: "var(--rose-primary)" }} />
              <span style={{ flex: 1, fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: 16, color: "var(--rose-primary)" }}>
                Sign out
              </span>
            </button>
          ) : (
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "var(--plum-deep)" }}>
                Are you sure?
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleSignOut}
                  style={{
                    background: "var(--rose-primary)", color: "white",
                    border: "none", borderRadius: 9999,
                    padding: "10px 18px", minHeight: 44,
                    fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Yes, sign out
                </button>
                <button
                  onClick={() => setConfirmingSignOut(false)}
                  style={{
                    background: "transparent", color: "var(--plum-mute)",
                    border: "none", borderRadius: 9999,
                    padding: "10px 18px", minHeight: 44,
                    fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}