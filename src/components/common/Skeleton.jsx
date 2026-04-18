/**
 * Skeleton — rose-100 shimmer block. Use for loading placeholders.
 *
 * Usage:
 *   <Skeleton className="h-4 w-32" />
 *   <Skeleton circle size={40} />
 *   <SkeletonText lines={3} />
 *   <SkeletonCard />
 */
export default function Skeleton({
  className = "",
  style = {},
  circle = false,
  size,
  rounded = 12,
}) {
  const base = {
    backgroundColor: "#FCE7F3",
    backgroundImage:
      "linear-gradient(90deg, #FCE7F3 0%, #FBD5E4 50%, #FCE7F3 100%)",
    backgroundSize: "200% 100%",
    animation: "fw-shimmer 1.4s ease-in-out infinite",
    borderRadius: circle ? 9999 : rounded,
    ...(size ? { width: size, height: size } : {}),
    ...style,
  };
  return (
    <>
      <style>{`@keyframes fw-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <span
        aria-hidden="true"
        className={className}
        style={{ display: "block", ...base }}
      />
    </>
  );
}

export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          style={{
            height: 12,
            width: i === lines - 1 ? "60%" : "100%",
          }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ height = 120 }) {
  return (
    <Skeleton
      style={{
        height,
        width: "100%",
        borderRadius: 18,
      }}
    />
  );
}

export function SkeletonList({ count = 3, itemHeight = 80 }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} height={itemHeight} />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}