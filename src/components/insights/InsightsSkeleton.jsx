// Shimmer skeleton for the Insights page. Never shows a white flash.

const shimmer = {
  background: "linear-gradient(90deg, var(--ivory-dark) 0%, #F9F5F2 50%, var(--ivory-dark) 100%)",
  backgroundSize: "200% 100%",
  animation: "insights-shimmer 1.2s infinite ease-in-out",
  borderRadius: 12,
};

function Block({ h = 16, w = "100%", radius = 12, style = {} }) {
  return <div style={{ ...shimmer, height: h, width: w, borderRadius: radius, ...style }} />;
}

export default function InsightsSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }} aria-busy="true" aria-label="Loading insights">
      <style>{`@keyframes insights-shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 16px" }}>
            <Block h={10} w="50%" />
            <div style={{ height: 8 }} />
            <Block h={24} w="40%" />
            <div style={{ height: 6 }} />
            <Block h={10} w="60%" />
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px 18px" }}>
        <Block h={10} w="35%" />
        <div style={{ height: 10 }} />
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ display: "flex", gap: 2, marginBottom: 4 }}>
            <Block h={16} w={60} />
            {Array.from({ length: 14 }).map((_, j) => <Block key={j} h={16} w={16} radius={3} />)}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px 18px" }}>
        <Block h={10} w="50%" />
        <div style={{ height: 10 }} />
        <Block h={140} radius={12} />
      </div>

      {/* Trend cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "12px 14px", minHeight: 88 }}>
            <Block h={10} w="50%" />
            <div style={{ height: 10 }} />
            <Block h={18} w="70%" />
          </div>
        ))}
      </div>
    </div>
  );
}