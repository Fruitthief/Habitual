import type { Goal } from '@/types/database'
import { daysUntil, formatShortDate } from '@/lib/dates'
import { Button } from '@/components/ui/Button'
import { haptic } from '@/lib/haptics'

interface GoalCardProps {
  goal: Goal
  linkedHabits?: string[] // habit names
  onComplete: () => void
  onDelete: () => void
  onEdit?: () => void
}

export function GoalCard({ goal, linkedHabits = [], onComplete, onDelete, onEdit }: GoalCardProps) {
  const isCompleted = !!goal.completed_at
  const days = goal.target_date ? daysUntil(goal.target_date) : null
  const isOverdue = days !== null && days < 0 && !isCompleted

  // Only show bar when both current and target are explicitly set
  const hasProgress = goal.target_value != null && goal.current_value != null

  let progressPct: number | null = null
  if (hasProgress) {
    const start = goal.start_value ?? 0
    const range = goal.target_value! - start
    progressPct = range > 0
      ? Math.min(100, Math.max(0, Math.round(((goal.current_value! - start) / range) * 100)))
      : 100
  }

  return (
    <div
      className={`card border-l-4 space-y-2 animate-fade-in ${
        isCompleted
          ? 'border-l-green-400 opacity-70'
          : isOverdue
          ? 'border-l-red-400'
          : 'border-l-brand'
      }`}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3
            className={`font-semibold text-[15px] ${
              isCompleted ? 'line-through text-gray-400' : 'text-gray-900'
            }`}
          >
            {isCompleted && '✅ '}
            {goal.title}
          </h3>
          {goal.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{goal.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onEdit && !isCompleted && (
            <button
              onClick={() => { haptic('light'); onEdit() }}
              className="text-gray-400 hover:text-blue-500 transition-colors p-1"
              aria-label="Edit goal"
            >
              ✏️
            </button>
          )}
          <button
            onClick={() => { haptic('light'); onDelete() }}
            className="text-gray-300 hover:text-red-400 transition-colors p-1"
            aria-label="Delete goal"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {hasProgress && (
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500">
              {goal.start_value != null && (
                <span className="text-gray-400">{goal.start_value} → </span>
              )}
              <span className="font-semibold text-gray-800">{goal.current_value}</span>
              <span className="text-gray-400"> → {goal.target_value}</span>
              {goal.value_unit && <span className="text-gray-400"> {goal.value_unit}</span>}
            </span>
            <span className="font-medium text-brand">{progressPct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                backgroundColor: progressPct === 100 ? '#22c55e' : '#2d5a27',
              }}
            />
          </div>
        </div>
      )}

      {/* Target date */}
      {goal.target_date && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">🎯</span>
          <span className={isOverdue ? 'text-red-500 font-medium' : 'text-gray-500'}>
            {isCompleted
              ? `Completed ${formatShortDate(goal.completed_at!.split('T')[0])}`
              : isOverdue
              ? `Overdue by ${Math.abs(days!)} day${Math.abs(days!) !== 1 ? 's' : ''}`
              : days === 0
              ? 'Due today!'
              : `${days} day${days !== 1 ? 's' : ''} left • ${formatShortDate(goal.target_date)}`}
          </span>
        </div>
      )}

      {/* Linked habits */}
      {linkedHabits.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {linkedHabits.map((name) => (
            <span
              key={name}
              className="text-xs bg-brand-pale text-brand px-2 py-0.5 rounded-full"
            >
              {name}
            </span>
          ))}
        </div>
      )}

      {/* Complete button */}
      {!isCompleted && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => { haptic('success'); onComplete() }}
          className="!w-auto text-xs mt-1"
        >
          Mark Complete ✓
        </Button>
      )}
    </div>
  )
}
