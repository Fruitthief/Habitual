interface SkeletonProps {
  className?: string
  height?: string | number
}

export function Skeleton({ className = '', height }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={height ? { height } : undefined}
    />
  )
}

export function HabitCardSkeleton() {
  return (
    <div className="card flex items-center gap-3 border-l-4 border-l-gray-200">
      <Skeleton className="w-7 h-7 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="w-7 h-7 rounded-full flex-shrink-0" />
    </div>
  )
}

export function GoalCardSkeleton() {
  return (
    <div className="card space-y-2">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  )
}
