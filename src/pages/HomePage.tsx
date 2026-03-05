import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useHabitStore } from '@/store/habitStore'
import { useGoalStore } from '@/store/goalStore'
import { useUIStore } from '@/store/uiStore'
import { calculateStreak } from '@/lib/streak'
import { todayStr, dateToStr, addDays, formatDisplayDate } from '@/lib/dates'
import { haptic } from '@/lib/haptics'
import { HabitCard } from '@/components/habits/HabitCard'
import { CelebrationBanner } from '@/components/home/CelebrationBanner'
import { HabitCardSkeleton } from '@/components/ui/Skeleton'
import { BottomNav } from '@/components/layout/BottomNav'

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { habits, completions, loading, loadHabits, loadCompletions, toggleCompletion, useCheatDay } =
    useHabitStore()
  const { goals, loadGoals } = useGoalStore()
  const { addToast } = useUIStore()

  const [viewDate, setViewDate] = useState(todayStr())
  const [showCelebration, setShowCelebration] = useState(false)
  const [prevDone, setPrevDone] = useState(0)
  const isToday = viewDate === todayStr()

  useEffect(() => {
    if (user) {
      loadHabits(user.id)
      loadCompletions(user.id)
      loadGoals(user.id)
    }
  }, [user])

  // Completions for the viewed date
  const todayCompletions = useMemo(
    () => completions.filter((c) => c.completed_date === viewDate),
    [completions, viewDate],
  )

  const doneCount = todayCompletions.length
  const totalCount = habits.length
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  // Trigger celebration when all habits done (today only)
  useEffect(() => {
    if (isToday && totalCount > 0 && doneCount === totalCount && prevDone !== totalCount) {
      setShowCelebration(true)
    }
    setPrevDone(doneCount)
  }, [doneCount, totalCount])

  function getStreak(habitId: string) {
    const habitCompletions = completions.filter((c) => c.habit_id === habitId)
    const accountCreatedAt = user?.created_at ?? new Date().toISOString()
    return calculateStreak(accountCreatedAt, habitCompletions)
  }

  async function handleToggle(habitId: string) {
    if (!user) return
    haptic('light')
    await toggleCompletion(user.id, habitId, viewDate)
  }

  async function handleCheatDay(habitId: string) {
    if (!user) return
    await useCheatDay(user.id, habitId)
    addToast('Cheat coin used 🪙 — streak protected!', 'success')
  }

  function goToPrevDay() {
    const prev = dateToStr(addDays(new Date(viewDate + 'T00:00:00'), -1))
    if (prev >= (user?.created_at?.split('T')[0] ?? '')) {
      setViewDate(prev)
    }
  }

  function goToNextDay() {
    const next = dateToStr(addDays(new Date(viewDate + 'T00:00:00'), 1))
    if (next <= todayStr()) setViewDate(next)
  }

  // --- Goals summary ---
  const activeGoals = useMemo(() => goals.filter((g) => !g.completed_at), [goals])
  const goalsSummary = useMemo(() => {
    if (activeGoals.length === 0) return null
    const withProgress = activeGoals.filter((g) => g.target_value != null && g.current_value != null)
    if (withProgress.length === 0) return `${activeGoals.length} active goal${activeGoals.length !== 1 ? 's' : ''}`
    const avgPct = Math.round(
      withProgress.reduce((sum, g) => {
        const start = g.start_value ?? 0
        const range = g.target_value! - start
        const pct = range === 0 ? 100 : Math.min(100, Math.max(0, ((g.current_value! - start) / range) * 100))
        return sum + pct
      }, 0) / withProgress.length,
    )
    return `${activeGoals.length} active goal${activeGoals.length !== 1 ? 's' : ''} — avg ${avgPct}% progress`
  }, [activeGoals])

  const dateLabel = isToday ? "Today" : formatDisplayDate(viewDate)
  const fullDate = new Date(viewDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      <div className="page-container">
        {/* Date header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPrevDay}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-brand-pale active:scale-90 transition-all text-brand"
            aria-label="Previous day"
          >
            ‹
          </button>
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-brand-dark">{dateLabel}</h1>
            {!isToday && (
              <p className="text-xs text-gray-400 mt-0.5">{fullDate}</p>
            )}
            {isToday && (
              <p className="text-xs text-gray-400 mt-0.5">{fullDate}</p>
            )}
          </div>
          <button
            onClick={goToNextDay}
            disabled={isToday}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-brand-pale active:scale-90 transition-all text-brand disabled:text-gray-300 disabled:cursor-not-allowed"
            aria-label="Next day"
          >
            ›
          </button>
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="card mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {doneCount < totalCount
                  ? `${doneCount} of ${totalCount} habits done`
                  : `All ${totalCount} habits done! 🎉`}
              </span>
              <span className="text-sm font-bold text-brand">{progress}%</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  backgroundColor: progress === 100 ? '#4ade80' : '#22c55e',
                }}
              />
            </div>
          </div>
        )}

        {/* Habits list */}
        <div className="space-y-3">
          {loading ? (
            <>
              <HabitCardSkeleton />
              <HabitCardSkeleton />
              <HabitCardSkeleton />
            </>
          ) : habits.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <div className="text-5xl mb-4">🌱</div>
              <h3 className="font-display text-xl font-semibold text-gray-700 mb-2">
                No habits yet
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Start with just one — small steps lead to big change.
              </p>
              <button
                onClick={() => navigate('/habits')}
                className="btn-primary !w-auto inline-flex"
              >
                Add your first habit
              </button>
            </div>
          ) : (
            habits.map((habit) => {
              const streak = getStreak(habit.id)
              const completed = todayCompletions.some((c) => c.habit_id === habit.id)
              return (
                <div key={habit.id} className="animate-slide-up">
                  <HabitCard
                    habit={habit}
                    streak={streak}
                    completed={completed}
                    onToggle={() => handleToggle(habit.id)}
                    onCheatDay={isToday && streak.cheatCoins > 0 ? () => handleCheatDay(habit.id) : undefined}
                    viewOnly={!isToday}
                    date={viewDate}
                  />
                </div>
              )
            })
          )}
        </div>

        {/* Goals summary */}
        {!loading && goalsSummary && (
          <button
            onClick={() => navigate('/goals')}
            className="w-full text-left mt-4 card flex items-center justify-between gap-2 active:opacity-80 transition-opacity"
          >
            <span className="text-sm text-gray-600">🎯 {goalsSummary}</span>
            <span className="text-gray-300 text-sm flex-shrink-0">›</span>
          </button>
        )}

        {/* Back to today button */}
        {!isToday && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30">
            <button
              onClick={() => setViewDate(todayStr())}
              className="bg-brand text-black text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg active:scale-95 transition-all"
            >
              ← Back to Today
            </button>
          </div>
        )}
      </div>

      <BottomNav />

      <CelebrationBanner
        show={showCelebration}
        onDismiss={() => setShowCelebration(false)}
      />
    </>
  )
}
