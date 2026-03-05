import type { Goal } from '@/types/database'
import { daysUntil, formatShortDate } from '@/lib/dates'
import { Button } from '@/components/ui/Button'
import { haptic } from '@/lib/haptics'

interface GoalCardProps {
  goal: Goal
  linkedHabits?: string[] // habit names
  onComplete: () => void
  onDelete: () => void
}

export function GoalCard({ goal, linkedHabits = [], onComplete, onDelete }: GoalCardProps) {
  const isCompleted = !!goal.completed_at
  const days = goal.target_date ? daysUntil(goal.target_date) : null
  const isOverdue = days !== null && days < 0 && !isCompleted

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
        <button
          onClick={() => { haptic('light'); onDelete() }}
          className="text-gray-300 hover:text-red-400 transition-colors p-1 flex-shrink-0"
          aria-label="Delete goal"
        >
          ✕
        </button>
      </div>

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
