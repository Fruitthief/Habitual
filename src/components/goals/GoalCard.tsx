import { useState } from 'react'
import type { Goal } from '@/types/database'
import { daysUntil, formatShortDate } from '@/lib/dates'
import { haptic } from '@/lib/haptics'

interface GoalCardProps {
  goal: Goal
  onToggleComplete: () => void
  onDelete: () => void
  onEdit?: () => void
}

export function GoalCard({ goal, onToggleComplete, onDelete, onEdit }: GoalCardProps) {
  const [expanded, setExpanded] = useState(false)

  const isCompleted = !!goal.completed_at
  const days = goal.target_date ? daysUntil(goal.target_date) : null
  const isOverdue = days !== null && days < 0 && !isCompleted

  const hasProgress = goal.target_value != null && goal.current_value != null
  let progressPct: number | null = null
  if (hasProgress) {
    const start = goal.start_value ?? 0
    const range = goal.target_value! - start
    progressPct = range === 0
      ? 100
      : Math.min(100, Math.max(0, Math.round(((goal.current_value! - start) / range) * 100)))
  }

  return (
    <div
      className={`card border-l-4 space-y-2 animate-fade-in cursor-pointer select-none ${
        isCompleted
          ? 'border-l-green-400 opacity-70'
          : isOverdue
          ? 'border-l-red-400'
          : 'border-l-brand'
      }`}
      onClick={() => setExpanded((e) => !e)}
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
              onClick={(e) => { e.stopPropagation(); haptic('light'); onEdit() }}
              className="text-gray-400 hover:text-blue-500 transition-colors p-1"
              aria-label="Edit goal"
            >
              ✏️
            </button>
          )}
          <span className={`text-gray-300 text-xs transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
            ▾
          </span>
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
                backgroundColor: progressPct === 100 ? '#4ade80' : '#22c55e',
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

      {/* Expanded actions */}
      {expanded && (
        <div className="pt-1 space-y-2 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => { haptic('medium'); onToggleComplete() }}
            className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors ${
              isCompleted
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-brand-pale text-brand hover:bg-brand-light'
            }`}
          >
            {isCompleted ? '↩ Mark Active' : '✓ Mark Complete'}
          </button>
          <button
            onClick={() => { haptic('medium'); onDelete() }}
            className="w-full py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
          >
            Delete Goal
          </button>
        </div>
      )}
    </div>
  )
}
