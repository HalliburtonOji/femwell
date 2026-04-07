export default function LoadingSpinner({ size = "md" }) {
  const sizes = {
    sm:  "w-5 h-5 border-2",
    md:  "w-8 h-8 border-2",
    lg:  "w-10 h-10 border-[3px]",
  };
  return (
    <div
      className={`rounded-full border-t-transparent animate-spin flex-shrink-0 ${sizes[size]}`}
      style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader({ message }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-3"
      style={{ backgroundColor: "var(--ivory)" }}
    >
      <LoadingSpinner size="md" />
      {message && (
        <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
          {message}
        </p>
      )}
    </div>
  );
}