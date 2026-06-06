import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Heart } from "lucide-react";

const PHASE_COLORS = {
  menstrual: "#C96B9E",
  follicular: "#9B7FCC",
  ovulatory: "#E8B84B",
  luteal: "#4ABFA3",
};

export default function PartnerView() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setError("No access token provided."); setLoading(false); return; }
    base44.functions.invoke("getPartnerView", { access_token: token })
      .then(res => {
        if (res.data?.success) setData(res.data.data);
        else setError(res.data?.error || "Something went wrong.");
      })
      .catch(() => setError("Could not load this view. The link may be invalid or expired."))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--rose-dust)" }} />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: "var(--ivory)" }}>
      <span style={{ fontSize: 48 }}>💜</span>
      <p style={{ fontSize: 18, fontWeight: 700, color: "var(--plum)", marginTop: 16, marginBottom: 8 }}>Link unavailable</p>
      <p style={{ fontSize: 14, color: "var(--mauve)", lineHeight: 1.6 }}>{error}</p>
    </div>
  );

  const phaseColor = data.phase ? PHASE_COLORS[data.phase] : "var(--rose-dust)";

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="pt-12 pb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Heart className="w-5 h-5" style={{ color: "var(--rose-dust)" }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--mauve)", }}>FemWell Partner View</span>
          </div>
          <p style={{ fontSize: 12, color: "var(--mauve)", lineHeight: 1.5 }}>A gentle window into how she's doing today.</p>
        </div>

        {/* Phase card */}
        {data.phase_info && (
          <div className="rounded-[28px] p-6 mb-4 text-white"
            style={{ background: `linear-gradient(135deg, ${phaseColor}EE, ${phaseColor}AA)`, boxShadow: `0 8px 32px ${phaseColor}44` }}>
            <div className="flex items-center gap-2 mb-3">
              <span style={{ fontSize: 28 }}>{data.phase_info.emoji}</span>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.7)", }}>Right now</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: "white", }}>{data.phase_info.label}</p>
              </div>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", lineHeight: 1.7 }}>
              {data.phase_info.description}
            </p>
          </div>
        )}

        {/* Today's mood/energy */}
        {(data.mood_emoji || data.energy_emoji) && (
          <div className="rounded-[24px] p-5 mb-4 flex gap-4" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            {data.mood_emoji && (
              <div style={{ flex: 1, textAlign: "center" }}>
                <p style={{ fontSize: 36 }}>{data.mood_emoji}</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--mauve)", marginTop: 6 }}>Mood today</p>
              </div>
            )}
            {data.energy_emoji && (
              <div style={{ flex: 1, textAlign: "center" }}>
                <p style={{ fontSize: 36 }}>{data.energy_emoji}</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--mauve)", marginTop: 6 }}>Energy today</p>
              </div>
            )}
          </div>
        )}

        {/* Active program */}
        {data.active_program && (
          <div className="rounded-[24px] p-5 mb-4" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", marginBottom: 8 }}>Active program</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--plum)", marginBottom: 4 }}>{data.active_program.title}</p>
            <p style={{ fontSize: 13, color: "var(--mauve)", marginBottom: 12 }}>
              Day {data.active_program.current_day} of {data.active_program.duration_days}
              {data.active_program.streak > 0 ? ` · 🔥 ${data.active_program.streak}-day streak` : ""}
            </p>
            <div className="w-full rounded-full overflow-hidden" style={{ height: 6, backgroundColor: "var(--ivory-dark)" }}>
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, (data.active_program.current_day / data.active_program.duration_days) * 100)}%`, backgroundColor: "var(--rose-dust)" }} />
            </div>
          </div>
        )}

        {/* Weekly message */}
        {data.weekly_message && (
          <div className="rounded-[24px] p-5 mb-4" style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--rose-dust)", marginBottom: 8 }}>This week</p>
            <p style={{ fontSize: 14, color: "var(--plum)", lineHeight: 1.7 }}>{data.weekly_message}</p>
          </div>
        )}

        {/* Footer */}
        <p style={{ fontSize: 11, color: "var(--mauve)", textAlign: "center", lineHeight: 1.6, paddingTop: 8 }}>
          Shared via FemWell. Symptom details, journal entries, and sensitive data are never shown here.
        </p>
      </div>
    </div>
  );
}