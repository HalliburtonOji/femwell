export default function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card-glass rounded-2xl overflow-hidden animate-pulse">
          <div className="h-44 bg-gray-200/60" />
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-200/80" />
              <div className="h-3 w-24 bg-gray-200/80 rounded-full" />
              <div className="h-5 w-16 bg-rose-100 rounded-full ml-auto" />
            </div>
            <div className="h-5 w-full bg-gray-200/80 rounded-full" />
            <div className="h-5 w-3/4 bg-gray-200/80 rounded-full" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-100 rounded-full" />
              <div className="h-3 w-5/6 bg-gray-100 rounded-full" />
              <div className="h-3 w-4/6 bg-gray-100 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}