import { useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useHabitStore } from '@/store/habitStore'
import type { DayCompletionStatus } from '@/types/database'
import { Calendar } from '@/components/history/Calendar'
import { DayDetailModal } from '@/components/history/DayDetailModal'
import { BottomNav } from '@/components/layout/BottomNav'
import { todayStr } from '@/lib/dates'

export default function HistoryPage() {
  const { user } = useAuthStore()
  const { habits, completions, loadHabits, loadCompletions, toggleCompletion } = useHabitStore()

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      if (habits.length === 0) loadHabits(user.id)
      if (completions.length === 0) loadCompletions(user.id)
    }
  }, [user])

  // date → set of habit IDs completed that day
  const byDate = useMemo(() => {
    const map = new Map<string, Set<string>>()
    for (const c of completions) {
      if (!map.has(c.completed_date)) map.set(c.completed_date, new Set())
      map.get(c.completed_date)!.add(c.habit_id)
    }
    return map
  }, [completions])

  function isPerfectDay(dateStr: string): boolean {
    return habits.length > 0 && (byDate.get(dateStr)?.size ?? 0) >= habits.length
  }

  // Build calendar status map
  const statusMap = useMemo(() => {
    const map = new Map<string, DayCompletionStatus>()
    if (habits.length === 0) return map

    const start = new Date(user?.created_at ?? today)
    start.setHours(0, 0, 0, 0)
    const todayStr_ = todayStr()

    let d = new Date(start)
    while (d <= today) {
      const dateStr = d.toISOString().split('T')[0]
      const doneCount = byDate.get(dateStr)?.size ?? 0
      const total = habits.length

      if (total === 0) map.set(dateStr, 'no-habits')
      else if (doneCount === 0) map.set(dateStr, dateStr === todayStr_ ? 'empty' : 'empty')
      else if (doneCount >= total) map.set(dateStr, 'complete')
      else map.set(dateStr, 'partial')

      d.setDate(d.getDate() + 1)
    }
    return map
  }, [habits, byDate, user])

  // Current daily streak: consecutive perfect days ending today (or yesterday)
  const dailyStreak = useMemo(() => {
    if (habits.length === 0) return 0
    const todayStr_ = todayStr()
    const accountStart = new Date(user?.created_at ?? today)
    accountStart.setHours(0, 0, 0, 0)

    let d = new Date()
    d.setHours(0, 0, 0, 0)
    if (!isPerfectDay(todayStr_)) d.setDate(d.getDate() - 1)

    let streak = 0
    while (d >= accountStart) {
      const ds = d.toISOString().split('T')[0]
      if (isPerfectDay(ds)) { streak++; d.setDate(d.getDate() - 1) }
      else break
    }
    return streak
  }, [habits, byDate, user])

  // Longest ever daily streak
  const longestDailyStreak = useMemo(() => {
    if (habits.length === 0) return 0
    const start = new Date(user?.created_at ?? today)
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(0, 0, 0, 0)

    let max = 0, run = 0
    let d = new Date(start)
    while (d <= end) {
      const ds = d.toISOString().split('T')[0]
      if (isPerfectDay(ds)) { run++; if (run > max) max = run }
      else run = 0
      d.setDate(d.getDate() + 1)
    }
    return max
  }, [habits, byDate, user])

  // Month completion rate: % of eligible days (since account creation, up to today)
  // that were perfect days
  const monthRate = useMemo(() => {
    if (habits.length === 0) return 0
    const accountStart = new Date(user?.created_at ?? today)
    accountStart.setHours(0, 0, 0, 0)
    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0)
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const start = accountStart > monthStart ? accountStart : monthStart
    const end = now < monthEnd ? now : monthEnd
    if (start > end) return 0

    let totalDays = 0, perfectDays = 0
    let d = new Date(start)
    while (d <= end) {
      const ds = d.toISOString().split('T')[0]
      totalDays++
      if (isPerfectDay(ds)) perfectDays++
      d.setDate(d.getDate() + 1)
    }
    return totalDays === 0 ? 0 : Math.round((perfectDays / totalDays) * 100)
  }, [habits, byDate, user, year, month])

  // This month completions count
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`
  const thisMonthTotal = useMemo(
    () => completions.filter((c) => c.completed_date.startsWith(monthPrefix) && !c.is_cheat_day).length,
    [completions, monthPrefix],
  )

  // All-time totals
  const allTimeTotal = completions.filter((c) => !c.is_cheat_day).length
  const cheatDaysTotal = completions.filter((c) => c.is_cheat_day).length

  function getStatus(date: string): DayCompletionStatus {
    return statusMap.get(date) ?? 'empty'
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  async function handleToggle(habitId: string, date: string) {
    if (!user) return
    await toggleCompletion(user.id, habitId, date)
  }

  const selectedCompletions = selectedDate
    ? completions.filter((c) => c.completed_date === selectedDate)
    : []

  const monthName = new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' })

  return (
    <>
      <div className="page-container">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-brand-dark">History</h1>
          <p className="text-sm text-gray-400 mt-0.5">Tap any day to view or edit completions</p>
        </div>

        {/* Calendar */}
        <Calendar
          year={year}
          month={month}
          getStatus={getStatus}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
        />

        {/* Stats */}
        {habits.length > 0 && (
          <div className="mt-5 space-y-4">
            {/* This month */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{monthName}</p>
              <div className="grid grid-cols-3 gap-2">
                <StatCard label="Perfect days" value={`${monthRate}%`} color="text-brand" />
                <StatCard label="🔥 Daily streak" value={String(dailyStreak)} color="text-orange-400" />
                <StatCard label="Completions" value={String(thisMonthTotal)} color="text-gray-300" />
              </div>
            </div>

            {/* All time */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">All time</p>
              <div className="grid grid-cols-3 gap-2">
                <StatCard label="Completions" value={String(allTimeTotal)} color="text-gray-300" />
                <StatCard label="Longest streak" value={String(longestDailyStreak)} color="text-brand" />
                <StatCard label="🪙 Coins used" value={String(cheatDaysTotal)} color="text-amber-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav />

      {selectedDate && (
        <DayDetailModal
          open={!!selectedDate}
          onClose={() => setSelectedDate(null)}
          date={selectedDate}
          habits={habits}
          completions={selectedCompletions}
          onToggle={handleToggle}
        />
      )}
    </>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="card text-center">
      <p className={`text-xl font-bold font-display ${color}`}>{value}</p>
      <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{label}</p>
    </div>
  )
}
