import { useEffect, useState, useMemo } from 'react'
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

  // Build a map of date → completion status
  const statusMap = useMemo(() => {
    const map = new Map<string, DayCompletionStatus>()
    if (habits.length === 0) return map

    // Group completions by date
    const byDate = new Map<string, Set<string>>()
    for (const c of completions) {
      if (!byDate.has(c.completed_date)) byDate.set(c.completed_date, new Set())
      byDate.get(c.completed_date)!.add(c.habit_id)
    }

    // For each past date, compute status
    const start = new Date(user?.created_at ?? today)
    start.setHours(0, 0, 0, 0)
    const todayStr_ = todayStr()

    let d = new Date(start)
    while (d <= today) {
      const dateStr = d.toISOString().split('T')[0]
      const doneIds = byDate.get(dateStr) ?? new Set()
      const doneCount = doneIds.size
      const total = habits.length

      if (total === 0) {
        map.set(dateStr, 'no-habits')
      } else if (doneCount === 0) {
        map.set(dateStr, dateStr === todayStr_ ? 'empty' : 'empty')
      } else if (doneCount >= total) {
        map.set(dateStr, 'complete')
      } else {
        map.set(dateStr, 'partial')
      }

      d.setDate(d.getDate() + 1)
    }

    return map
  }, [habits, completions, user])

  function getStatus(date: string): DayCompletionStatus {
    return statusMap.get(date) ?? 'empty'
  }

  function prevMonth() {
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else {
      setMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  async function handleToggle(habitId: string, date: string) {
    if (!user) return
    await toggleCompletion(user.id, habitId, date)
  }

  const selectedCompletions = selectedDate
    ? completions.filter((c) => c.completed_date === selectedDate)
    : []

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

        {/* Summary stats */}
        {habits.length > 0 && (
          <div className="mt-5 grid grid-cols-3 gap-3">
            <StatCard
              label="This month"
              value={`${getMonthCompletionRate(year, month, habits.length, completions)}%`}
              color="text-brand"
            />
            <StatCard
              label="Total completions"
              value={String(completions.filter((c) => !c.is_cheat_day).length)}
              color="text-gray-700"
            />
            <StatCard
              label="Cheat days"
              value={String(completions.filter((c) => c.is_cheat_day).length)}
              color="text-amber-500"
            />
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

function getMonthCompletionRate(
  year: number,
  month: number,
  habitCount: number,
  completions: { completed_date: string; is_cheat_day: boolean }[],
): number {
  if (habitCount === 0) return 0
  const today = todayStr()
  const start = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const end = new Date(year, month + 1, 0).toISOString().split('T')[0]

  const cutoff = end < today ? end : today
  const monthCompletions = completions.filter(
    (c) => c.completed_date >= start && c.completed_date <= cutoff && !c.is_cheat_day,
  )
  const daysPassed = Math.min(
    parseInt(today.split('-')[2]),
    new Date(year, month + 1, 0).getDate(),
  )
  if (daysPassed === 0) return 0

  const totalPossible = daysPassed * habitCount
  return Math.round((monthCompletions.length / totalPossible) * 100)
}
