import { PAPER_NIGHT, RULE_NIGHT } from "./styles/tokens.jsx";

// ─────────────────────────────────────────────────────────────────────────────
// SectionSkeleton — Plum Night shimmer placeholders for horoscope sections.
//
// Usage: <SectionSkeleton variant="hero" /> | "triad" | "weather" | "dial" |
//        "bench" | "diary" | "compat" | "ask" | "default"
// ─────────────────────────────────────────────────────────────────────────────

function ShimmerBar({ width = "100%", height = 12, radius = 6, style = {} }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width,
        height,
        borderRadius: radius,
        background: `linear-gradient(90deg, rgba(245,230,211,0.07) 0%, rgba(245,230,211,0.14) 50%, rgba(245,230,211,0.07) 100%)`,
        backgroundSize: "200% 100%",
        animation: "horo-shimmer 1.5s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

export default function SectionSkeleton({ variant = "default" }) {
  return (
    <>
      <style>{`@keyframes horo-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      {variant === "hero" && (
        <div style={{ ...wrapStyle, minHeight: 240, borderRadius: 0, margin: "0 -18px 0", padding: "32px 22px 28px" }}>
          <ShimmerBar width="60%" height={9} style={{ marginBottom: 18 }} />
          <ShimmerBar width="85%" height={28} radius={8} style={{ marginBottom: 10 }} />
          <ShimmerBar width="72%" height={12} style={{ marginBottom: 18 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <ShimmerBar width={90} height={22} radius={9999} />
            <ShimmerBar width={70} height={22} radius={9999} />
            <ShimmerBar width={80} height={22} radius={9999} />
          </div>
        </div>
      )}

      {variant === "triad" && (
        <div style={wrapStyle}>
          <ShimmerBar width="40%" height={22} style={{ marginBottom: 14 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ ...innerCard, padding: "14px 8px", textAlign: "center" }}>
                <ShimmerBar width={28} height={28} radius="50%" style={{ margin: "0 auto 8px" }} />
                <ShimmerBar width="60%" height={9} style={{ margin: "0 auto 6px" }} />
                <ShimmerBar width="80%" height={17} style={{ margin: "0 auto 6px" }} />
                <ShimmerBar width="70%" height={9} style={{ margin: "0 auto" }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {variant === "weather" && (
        <div style={wrapStyle}>
          <div style={innerCard}>
            <ShimmerBar width="40%" height={9} style={{ marginBottom: 10 }} />
            <ShimmerBar width="90%" height={18} style={{ marginBottom: 6 }} />
            <ShimmerBar width="75%" height={12} style={{ marginBottom: 14 }} />
            <div style={{ display: "flex", gap: 14 }}>
              {[80, 70, 90].map((w, i) => <ShimmerBar key={i} width={w} height={11} />)}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
            {[0, 1].map((i) => (
              <div key={i} style={{ ...innerCard, padding: "10px 12px" }}>
                <ShimmerBar width="50%" height={9} style={{ marginBottom: 6 }} />
                <ShimmerBar width="80%" height={13} style={{ marginBottom: 4 }} />
                <ShimmerBar width="95%" height={11} />
              </div>
            ))}
          </div>
        </div>
      )}

      {variant === "dial" && (
        <div style={wrapStyle}>
          <ShimmerBar width="45%" height={22} style={{ marginBottom: 8 }} />
          <div style={{ ...innerCard, display: "flex", gap: 14, alignItems: "center" }}>
            <ShimmerBar width={130} height={130} radius="50%" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              <ShimmerBar width="80%" height={11} />
              <ShimmerBar width="70%" height={11} />
              <ShimmerBar width="90%" height={10} style={{ marginTop: 6 }} />
            </div>
          </div>
        </div>
      )}

      {variant === "bench" && (
        <div style={wrapStyle}>
          <div style={innerCard}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <ShimmerBar width="35%" height={15} />
              <ShimmerBar width="20%" height={9} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4 }}>
              {[0,1,2,3,4,5].map((i) => (
                <div key={i} style={{ textAlign: "center", padding: "6px 0" }}>
                  <ShimmerBar width={32} height={32} radius="50%" style={{ margin: "0 auto 4px" }} />
                  <ShimmerBar width="70%" height={10} style={{ margin: "0 auto 3px" }} />
                  <ShimmerBar width="90%" height={8} style={{ margin: "0 auto" }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {variant === "diary" && (
        <div style={wrapStyle}>
          <ShimmerBar width="35%" height={22} style={{ marginBottom: 12 }} />
          <div style={{ background: "rgba(245,230,211,0.04)", border: `1px solid ${RULE_NIGHT}`, borderRadius: 18, padding: "18px 12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 3, height: 72, marginBottom: 6 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <ShimmerBar key={i} width="100%" height="100%" radius={6} />
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 3, marginBottom: 14 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <ShimmerBar key={i} width="80%" height={8} style={{ margin: "0 auto" }} />
              ))}
            </div>
            <div style={{ background: "rgba(43,30,22,0.04)", borderRadius: 14, padding: "12px 14px" }}>
              <ShimmerBar width="20%" height={10} style={{ marginBottom: 6 }} />
              <ShimmerBar width="85%" height={14} />
            </div>
          </div>
        </div>
      )}

      {variant === "compat" && (
        <div style={wrapStyle}>
          <ShimmerBar width="55%" height={22} style={{ marginBottom: 8 }} />
          <ShimmerBar width="75%" height={12} style={{ marginBottom: 16 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, marginBottom: 12 }}>
            <div><ShimmerBar width="60%" height={11} style={{ marginBottom: 6 }} /><ShimmerBar width="100%" height={44} radius={12} /></div>
            <div><ShimmerBar width="60%" height={11} style={{ marginBottom: 6 }} /><ShimmerBar width="100%" height={44} radius={12} /></div>
            <ShimmerBar width={80} height={44} radius={9999} />
          </div>
        </div>
      )}

      {variant === "ask" && (
        <div style={{ ...wrapStyle, borderRadius: 22, padding: "28px 24px", marginTop: 32, background: "radial-gradient(circle at 25% 30%, #2a1f3c 0%, #181420 60%, #100e18 100%)" }}>
          <ShimmerBar width="40%" height={22} style={{ marginBottom: 12 }} />
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <ShimmerBar height={44} radius={8} style={{ flex: 1 }} />
            <ShimmerBar width={70} height={44} radius={9999} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[0,1,2].map((i) => <ShimmerBar key={i} width={120} height={36} radius={9999} />)}
          </div>
        </div>
      )}

      {(variant === "default" || !["hero","triad","weather","dial","bench","diary","compat","ask"].includes(variant)) && (
        <div style={wrapStyle}>
          <ShimmerBar width="50%" height={22} style={{ marginBottom: 12 }} />
          <ShimmerBar width="100%" height={14} style={{ marginBottom: 8 }} />
          <ShimmerBar width="85%" height={14} style={{ marginBottom: 8 }} />
          <ShimmerBar width="70%" height={14} />
        </div>
      )}
    </>
  );
}

const wrapStyle = {
  background: PAPER_NIGHT,
  borderRadius: 22,
  padding: "24px 22px",
  margin: "0 0 14px",
};

const innerCard = {
  background: "rgba(245,230,211,0.04)",
  border: `1px solid rgba(245,230,211,0.14)`,
  borderRadius: 16,
  padding: "18px 18px 16px",
};