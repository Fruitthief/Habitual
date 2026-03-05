interface StatsRowProps {
  completionRate: number
  bestCurrentStreak: number
  longestStreak: number
  totalThisMonth: number
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-brand-pale rounded-xl p-3 text-center">
      <p className="text-lg font-bold text-brand-dark">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5 leading-tight">{label}</p>
    </div>
  )
}

export function StatsRow({ completionRate, bestCurrentStreak, longestStreak, totalThisMonth }: StatsRowProps) {
  return (
    <div className="card mt-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">This month</p>
      <div className="grid grid-cols-2 gap-2">
        <StatTile label="Completion rate" value={`${completionRate}%`} />
        <StatTile label="Best current streak" value={`🔥 ${bestCurrentStreak}`} />
        <StatTile label="Longest streak ever" value={`⚡ ${longestStreak}`} />
        <StatTile label="Completions" value={String(totalThisMonth)} />
      </div>
    </div>
  )
}
