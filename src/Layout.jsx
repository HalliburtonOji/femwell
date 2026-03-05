import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Sun, BarChart2, Compass, User, Activity } from "lucide-react";

const NAV = [
  { label: "Today", icon: Sun, page: "Today" },
  { label: "Track", icon: Activity, page: "Track" },
  { label: "Insights", icon: BarChart2, page: "Insights" },
  { label: "Explore", icon: Compass, page: "Explore" },
  { label: "Profile", icon: User, page: "Profile" },
];

const HIDE_NAV = ["Onboarding"];

export default function Layout({ children, currentPageName }) {
  const showNav = !HIDE_NAV.includes(currentPageName);

  return (
    <div className="min-h-screen femwell-gradient">
      <style>{`
        :root {
          --rose: #e8a4b0;
          --rose-light: #f5d6dc;
          --sage: #8fada0;
          --cream: #faf7f4;
        }
        .femwell-gradient {
          background: linear-gradient(135deg, #fdf6f8 0%, #f5ede8 40%, #eef4f1 100%);
          min-height: 100vh;
        }
        .card-glass {
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.6);
        }
        .btn-primary {
          background: linear-gradient(135deg, #c97b8a 0%, #a86b7a 100%);
          color: white;
          border-radius: 999px;
          padding: 0.75rem 2rem;
          font-weight: 600;
          font-size: 0.95rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(168,107,122,0.35);
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(168,107,122,0.45); }
        .btn-secondary {
          background: white;
          color: #c97b8a;
          border: 1.5px solid #e8a4b0;
          border-radius: 999px;
          padding: 0.75rem 2rem;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-secondary:hover { background: #fdf0f2; }
        input[type="range"] {
          -webkit-appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: #e8d5d8;
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #c97b8a;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(168,107,122,0.4);
        }
      `}</style>
      <div className={showNav ? "pb-24" : ""}>{children}</div>
      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-rose-100 z-50" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          <div className="flex items-center justify-around max-w-md mx-auto px-2">
            {NAV.map(({ label, icon: Icon, page }) => {
              const active = currentPageName === page;
              return (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className={`flex flex-col items-center gap-0.5 py-3 px-3 min-w-0 transition-all ${active ? "text-rose-600" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <Icon className={`w-5 h-5 ${active ? "stroke-[2.5px]" : ""}`} />
                  <span className={`text-[10px] font-medium ${active ? "font-bold" : ""}`}>{label}</span>
                  {active && <div className="w-1 h-1 rounded-full bg-rose-500 mt-0.5" />}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}