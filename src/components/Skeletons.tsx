// Animated placeholders shown while data loads. Mirror the real layouts so
// the page doesn't jump when content arrives.

function Bar({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
}

function CardSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-slate-200" />
        <div className="flex-1 space-y-2">
          <Bar className="h-4 w-1/2" />
          <Bar className="h-3 w-1/3" />
          <div className="flex gap-1 pt-1">
            <Bar className="h-4 w-16" />
            <Bar className="h-4 w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Grid of tutor-card placeholders (directory).
export function TutorGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

// Stacked request-card placeholders (dashboards).
export function RequestListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
          <Bar className="h-4 w-1/3" />
          <Bar className="h-3 w-1/4" />
          <Bar className="h-3 w-full" />
          <Bar className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  )
}
