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
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const didSwipe = useRef(false)

  function triggerToggle() {
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
    didSwipe.current = false
  }

  function handleTouchMove(e: React.TouchEvent) {
    const dx = e.touches[0].clientX - touchStartX.current
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current)
    if (dy > 20) return
    didSwipe.current = true
    setSwipeX(Math.max(-90, Math.min(90, dx)))
  }

  function handleTouchEnd() {
    if (swipeX < -60) triggerToggle()
    else if (swipeX > 60 && !completed && onCheatDay) {
      haptic('medium')
      onCheatDay()
    }
    setSwipeX(0)
  }

  function handleCardClick() {
    if (didSwipe.current) return
    triggerToggle()
  }

  const streakLabel = streak.current > 0 ? `🔥 ${streak.current}` : null
  const isMilestone = [7, 14, 21, 30, 60, 100].includes(streak.current)

  // ── Management mode (Habits page): inline edit + delete buttons ──
  if (viewOnly) {
    return (
      <div
        className="card border-l-4 flex items-center gap-3"
        style={{ borderLeftColor: habit.color }}
      >
        <span className="text-2xl flex-shrink-0 select-none">{habit.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[15px] truncate text-gray-900">{habit.name}</p>
          {streakLabel && (
            <p className={`text-xs mt-0.5 ${isMilestone ? 'animate-fire-pulse text-orange-500 font-semibold' : 'text-gray-400'}`}>
              {streakLabel}
            </p>
          )}
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-blue-500 p-2 rounded-lg hover:bg-blue-50 flex-shrink-0 active:scale-90 transition-all"
            aria-label="Edit"
          >
            ✏️
          </button>
        )}
        {onArchive && (
          <button
            onClick={onArchive}
            className="text-red-400 p-2 rounded-lg hover:bg-red-50 flex-shrink-0 active:scale-90 transition-all"
            aria-label="Delete"
          >
            🗑️
          </button>
        )}
      </div>
    )
  }

  // ── Interactive mode (Home page): swipe or tap to toggle ──
  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ touchAction: 'pan-y' }}>
      {/* Swipe hint background */}
      <div className="absolute inset-0 rounded-2xl flex items-center justify-between px-5">
        <span className={`text-xl transition-opacity duration-100 ${swipeX < -20 ? 'opacity-100' : 'opacity-0'} ${!completed ? 'text-green-500' : 'text-gray-400'}`}>
          {!completed ? '✓' : '↩'}
        </span>
        <span className={`text-xl transition-opacity duration-100 ${swipeX > 20 && !completed && onCheatDay ? 'opacity-100' : 'opacity-0'}`}>
          🪙
        </span>
      </div>

      <div
        className="card border-l-4 flex items-center gap-3 relative bg-white cursor-pointer active:opacity-90"
        style={{
          borderLeftColor: habit.color,
          transform: `translateX(${swipeX}px)`,
          transition: swipeX === 0 ? 'transform 0.2s ease' : 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleCardClick}
      >
        <span className="text-2xl flex-shrink-0 select-none">{habit.emoji}</span>

        <div className="flex-1 min-w-0">
          <p className={`font-medium text-[15px] truncate transition-all ${completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
            {habit.name}
          </p>
          {streakLabel && (
            <p className={`text-xs mt-0.5 ${isMilestone ? 'animate-fire-pulse text-orange-500 font-semibold' : 'text-gray-400'}`}>
              {streakLabel}
            </p>
          )}
        </div>

        {/* Coin indicator — always visible per habit */}
        <span className={`text-xs font-medium flex-shrink-0 ${streak.cheatCoins > 0 ? 'text-amber-500' : 'text-gray-400'}`}>
          🪙 {streak.cheatCoins}/2
        </span>

        {/* Completion circle */}
        <div
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 pointer-events-none ${bouncing ? 'animate-spring-bounce' : ''} ${completed ? 'border-transparent text-white' : 'border-gray-300'}`}
          style={completed ? { backgroundColor: habit.color } : {}}
        >
          {completed && (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}
