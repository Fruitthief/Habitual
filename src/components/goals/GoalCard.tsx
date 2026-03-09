import { useEffect, useRef, useState } from 'react'
import type { Goal } from '@/types/database'
import { daysUntil, formatShortDate, strToDate } from '@/lib/dates'
import { haptic } from '@/lib/haptics'

interface GoalCardProps {
  goal: Goal
  onToggleComplete: () => void
  onDelete: () => void
  onEdit?: () => void
}

export function GoalCard({ goal, onToggleComplete, onDelete, onEdit }: GoalCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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

  // Time progress: how far through the goal's lifespan are we?
  let timePct: number | null = null
  if (goal.target_date && !isCompleted) {
    const start = strToDate(goal.created_at.split('T')[0]).getTime()
    const end = strToDate(goal.target_date).getTime()
    const now = new Date().setHours(0, 0, 0, 0)
    const range = end - start
    timePct = range <= 0 ? 100 : Math.min(100, Math.max(0, Math.round(((now - start) / range) * 100)))
  }

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  return (
    <div
      className={`card border-l-4 space-y-2 animate-fade-in cursor-pointer select-none ${
        isCompleted
          ? 'border-l-green-400 opacity-70'
          : isOverdue
          ? 'border-l-red-400'
          : 'border-l-brand'
      }`}
      onClick={() => { haptic('light'); onEdit?.() }}
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

        {/* 3-dot menu */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); haptic('light'); setMenuOpen((o) => !o) }}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            aria-label="Goal options"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-50 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[160px] animate-fade-in">
              <button
                onClick={(e) => { e.stopPropagation(); haptic('medium'); setMenuOpen(false); onToggleComplete() }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {isCompleted ? '↩ Mark Active' : '✓ Mark Complete'}
              </button>
              <div className="h-px bg-gray-100 mx-2" />
              <button
                onClick={(e) => { e.stopPropagation(); haptic('medium'); setMenuOpen(false); onDelete() }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                Delete Goal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Value progress bar */}
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

      {/* Target date + time progress bar */}
      {goal.target_date && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <span className="text-gray-400">🗓</span>
              <span className={isOverdue ? 'text-red-500 font-medium' : 'text-gray-500'}>
                {isCompleted
                  ? `Completed ${formatShortDate(goal.completed_at!.split('T')[0])}`
                  : isOverdue
                  ? `Overdue by ${Math.abs(days!)} day${Math.abs(days!) !== 1 ? 's' : ''}`
                  : days === 0
                  ? 'Due today!'
                  : `${days} day${days !== 1 ? 's' : ''} left`}
              </span>
            </span>
            {timePct !== null && (
              <span
                className={`font-medium tabular-nums ${
                  isOverdue ? 'text-red-500' : timePct >= 75 ? 'text-amber-500' : 'text-gray-400'
                }`}
              >
                {timePct}% time used
              </span>
            )}
          </div>
          {timePct !== null && (
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${timePct}%`,
                  backgroundColor: isOverdue
                    ? '#ef4444'
                    : timePct >= 75
                    ? '#f59e0b'
                    : '#86efac',
                }}
              />
            </div>
          )}
          {!isCompleted && goal.target_date && (
            <p className="text-[10px] text-gray-400">{formatShortDate(goal.target_date)}</p>
          )}
        </div>
      )}
    </div>
  )
}
