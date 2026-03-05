import { useState, useRef } from 'react'
import type { Habit } from '@/types/database'
import type { StreakInfo } from '@/types/database'
import { haptic } from '@/lib/haptics'

interface HabitCardProps {
  habit: Habit
  streak: StreakInfo
  completed: boolean
  onToggle: () => void
  onCheatDay?: () => void
  onEdit?: () => void
  onArchive?: () => void
  viewOnly?: boolean
  date?: string
}

export function HabitCard({
  habit,
  streak,
  completed,
  onToggle,
  onCheatDay,
  onEdit,
  onArchive,
  viewOnly = false,
}: HabitCardProps) {
  const [bouncing, setBouncing] = useState(false)
  const [swipeX, setSwipeX] = useState(0)
  const [showActions, setShowActions] = useState(false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  function handleCheck() {
    if (viewOnly) return
    haptic(completed ? 'light' : 'success')
    if (!completed) {
      setBouncing(true)
      setTimeout(() => setBouncing(false), 400)
    }
    onToggle()
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    setShowActions(false)
  }

  function handleTouchMove(e: React.TouchEvent) {
    const dx = e.touches[0].clientX - touchStartX.current
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current)
    if (dy > 20) return // vertical scroll
    if (dx < 0) {
      setSwipeX(Math.max(dx, -80))
    } else if (swipeX < 0) {
      setSwipeX(Math.min(dx + swipeX, 0))
    }
  }

  function handleTouchEnd() {
    if (swipeX < -50) {
      setSwipeX(-72)
      setShowActions(true)
    } else {
      setSwipeX(0)
      setShowActions(false)
    }
  }

  const streakLabel = streak.current > 0 ? `🔥 ${streak.current}` : null
  const isMilestone = [7, 14, 21, 30, 60, 100].includes(streak.current)

  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ touchAction: 'pan-y' }}>
      {/* Swipe-reveal action buttons */}
      {(onEdit || onArchive) && (
        <div
          className="absolute right-0 top-0 bottom-0 flex items-center gap-2 px-3 bg-gray-100 rounded-r-2xl"
          style={{ width: 72 }}
        >
          {onEdit && (
            <button
              onClick={() => { setSwipeX(0); setShowActions(false); onEdit() }}
              className="text-blue-500 p-1.5 rounded-lg hover:bg-blue-50"
              aria-label="Edit"
            >
              ✏️
            </button>
          )}
          {onArchive && (
            <button
              onClick={() => { setSwipeX(0); setShowActions(false); onArchive() }}
              className="text-red-400 p-1.5 rounded-lg hover:bg-red-50"
              aria-label="Archive"
            >
              🗂️
            </button>
          )}
        </div>
      )}

      {/* Card body */}
      <div
        className="card border-l-4 flex items-center gap-3 transition-transform duration-200 relative bg-white"
        style={{
          borderLeftColor: habit.color,
          transform: `translateX(${swipeX}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (showActions) {
            setSwipeX(0)
            setShowActions(false)
          }
        }}
      >
        {/* Emoji */}
        <span className="text-2xl flex-shrink-0 select-none">{habit.emoji}</span>

        {/* Name + streak */}
        <div className="flex-1 min-w-0">
          <p
            className={`font-medium text-[15px] truncate transition-all ${
              !viewOnly && completed ? 'text-gray-400 line-through' : 'text-gray-900'
            }`}
          >
            {habit.name}
          </p>
          {streakLabel && (
            <p
              className={`text-xs mt-0.5 ${
                isMilestone ? 'animate-fire-pulse text-orange-500 font-semibold' : 'text-gray-400'
              }`}
            >
              {streakLabel}
            </p>
          )}
        </div>

        {/* Cheat day */}
        {!viewOnly && streak.cheatDayEligible && !completed && onCheatDay && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              haptic('medium')
              onCheatDay()
            }}
            className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-lg border border-amber-200 flex-shrink-0 font-medium"
            title="Use cheat day — skips today without breaking your streak"
          >
            🛡️
          </button>
        )}

        {/* Checkbox */}
        {!viewOnly && (
          <button
            onClick={(e) => { e.stopPropagation(); handleCheck() }}
            aria-label={completed ? 'Mark incomplete' : 'Mark complete'}
            className={`
              w-7 h-7 rounded-full border-2 flex items-center justify-center
              flex-shrink-0 transition-all duration-200
              ${completed
                ? 'border-transparent text-white'
                : 'border-gray-300 bg-white hover:border-brand'
              }
              ${bouncing ? 'animate-spring-bounce' : ''}
            `}
            style={completed ? { backgroundColor: habit.color } : {}}
          >
            {completed && (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
