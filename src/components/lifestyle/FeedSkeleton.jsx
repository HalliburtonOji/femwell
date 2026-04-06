export default function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card-glass rounded-2xl overflow-hidden animate-pulse">
          <div className="h-44" style={{ backgroundColor: "rgba(0,0,0,0.06)" }} />
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.08)" }} />
              <div className="h-3 w-24 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.08)" }} />
              <div className="h-5 w-16 rounded-full ml-auto" style={{ backgroundColor: "var(--rose-dust-subtle)" }} />
            </div>
            <div className="h-5 w-full rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.08)" }} />
            <div className="h-5 w-3/4 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.08)" }} />
            <div className="space-y-2">
              <div className="h-3 w-full rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.05)" }} />
              <div className="h-3 w-5/6 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.05)" }} />
              <div className="h-3 w-4/6 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.05)" }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}