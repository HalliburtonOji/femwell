import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

const PHASE_LABELS = {
  menstrual: "menstrual",
  follicular: "follicular",
  ovulatory: "ovulatory",
  luteal: "luteal",
};

function getCurrentPhase(profile) {
  if (!profile?.last_period_start_date) return null;
  const cycleLen = profile.cycle_avg_length || 28;
  const periodLen = profile.period_length || 5;
  const daysSince = Math.floor((Date.now() - new Date(profile.last_period_start_date).getTime()) / 86400000);
  const dayOfCycle = (daysSince % cycleLen) + 1;
  if (dayOfCycle <= periodLen) return "menstrual";
  if (dayOfCycle <= Math.round(cycleLen * 0.4)) return "follicular";
  if (dayOfCycle <= Math.round(cycleLen * 0.55)) return "ovulatory";
  return "luteal";
}

export default function WeeklyBookPick({ profile }) {
  const [pick, setPick] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const picks = await base44.entities.WeeklyBookPick.list("-created_date", 5);
        if (picks.length > 0) setPick(picks[0]);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading || !pick) return null;

  const phase = getCurrentPhase(profile);
  const phaseLabel = phase ? PHASE_LABELS[phase] : null;

  return (
    <div style={{
      backgroundColor: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 20,
      boxShadow: "var(--shadow-sm)",
      marginBottom: 20,
      overflow: "hidden",
    }}>
      <div style={{ padding: "16px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <BookOpen style={{ width: 13, height: 13, color: "var(--rose-dust)" }} />
          <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--rose-dust)", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "'Inter', sans-serif" }}>
            This week's read
          </span>
        </div>

        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          {/* Cover placeholder */}
          <div style={{
            width: 64, height: 88, borderRadius: 8, flexShrink: 0,
            background: pick.cover_url ? "none" : "linear-gradient(135deg, var(--rose-dust-subtle), var(--mauve-subtle))",
            border: "1px solid var(--border)", overflow: "hidden",
          }}>
            {pick.cover_url
              ? <img src={pick.cover_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { e.target.parentElement.style.background = "linear-gradient(135deg, var(--rose-dust-subtle), var(--mauve-subtle))"; e.target.style.display = "none"; }} />
              : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BookOpen style={{ width: 22, height: 22, color: "var(--mauve)" }} />
                </div>
            }
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {phaseLabel && (
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>
                This week's pick for your {phaseLabel} phase
              </p>
            )}
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--plum)", fontFamily: "'Playfair Display', serif", lineHeight: 1.3, margin: "0 0 3px" }}>
              {pick.title}
            </h3>
            {pick.author && (
              <p style={{ fontSize: 12, color: "var(--mauve)", fontStyle: "italic", margin: "0 0 6px", fontFamily: "'Inter', sans-serif" }}>{pick.author}</p>
            )}
            {pick.hook && (
              <p style={{ fontSize: 13, color: "var(--plum)", lineHeight: 1.5, margin: 0, fontFamily: "'Inter', sans-serif" }}>{pick.hook}</p>
            )}
          </div>
        </div>

        {/* Expand: why recommended + buy */}
        <button
          onClick={() => setExpanded(v => !v)}
          style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 12, fontSize: 12, fontWeight: 600, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          Read why →
          {expanded ? <ChevronUp style={{ width: 13, height: 13 }} /> : <ChevronDown style={{ width: 13, height: 13 }} />}
        </button>

        {expanded && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border-subtle)" }}>
            {pick.why_recommended && (
              <p style={{ fontSize: 13, color: "var(--plum)", lineHeight: 1.65, fontFamily: "'Inter', sans-serif", marginBottom: 12 }}>{pick.why_recommended}</p>
            )}
            {(pick.buy_url || pick.read_url) && (
              <div style={{ display: "flex", gap: 8 }}>
                {pick.buy_url && (
                  <a href={pick.buy_url} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 5, backgroundColor: "var(--plum)", color: "white", borderRadius: 10, padding: "8px 14px", fontSize: 12, fontWeight: 600, textDecoration: "none", fontFamily: "'Inter', sans-serif" }}>
                    Get the book <ExternalLink style={{ width: 11, height: 11 }} />
                  </a>
                )}
                {pick.read_url && (
                  <a href={pick.read_url} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 5, border: "1.5px solid var(--border)", color: "var(--mauve)", borderRadius: 10, padding: "8px 14px", fontSize: 12, fontWeight: 600, textDecoration: "none", fontFamily: "'Inter', sans-serif" }}>
                    Read free <ExternalLink style={{ width: 11, height: 11 }} />
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}