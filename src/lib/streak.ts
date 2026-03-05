import type { HabitCompletion, StreakInfo } from '@/types/database'
import { dateToStr, strToDate, addDays, extractDatePart } from './dates'

/**
 * Calculate streak info for a single habit.
 *
 * Algorithm:
 * - Iterate from accountCreatedAt to today
 * - A day "counts" if there is a completion row (is_cheat_day or not)
 * - Current streak = consecutive counted days ending on today (or yesterday if today not done)
 * - Longest streak = longest consecutive run in full history
 * - Cheat day eligible = today not done AND current streak >= 7 AND no cheat day in last 7 days
 */
export function calculateStreak(
  accountCreatedAt: string,
  completions: Pick<HabitCompletion, 'completed_date' | 'is_cheat_day'>[],
): StreakInfo {
  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)
  const today = dateToStr(todayDate)

  const startStr = extractDatePart(accountCreatedAt)
  const startDate = strToDate(startStr)

  const completionSet = new Set(completions.map((c) => c.completed_date))
  const cheatDaySet = new Set(completions.filter((c) => c.is_cheat_day).map((c) => c.completed_date))

  // --- Longest streak (scan all days) ---
  let longestStreak = 0
  let runLength = 0
  let d = new Date(startDate)
  while (d <= todayDate) {
    const dateStr = dateToStr(d)
    if (completionSet.has(dateStr)) {
      runLength++
      if (runLength > longestStreak) longestStreak = runLength
    } else {
      runLength = 0
    }
    d = addDays(d, 1)
  }

  // --- Current streak (count backwards from today / yesterday) ---
  let currentStreak = 0
  let checkDate = new Date(todayDate)

  // If today isn't done yet, start checking from yesterday
  if (!completionSet.has(today)) {
    checkDate = addDays(checkDate, -1)
  }

  while (checkDate >= startDate) {
    const dateStr = dateToStr(checkDate)
    if (completionSet.has(dateStr)) {
      currentStreak++
      checkDate = addDays(checkDate, -1)
    } else {
      break
    }
  }

  // --- Cheat coins ---
  const todayCompleted = completionSet.has(today)

  // Count cheat days used within the current streak window
  let cheatDaysUsedInCurrentStreak = 0
  if (currentStreak > 0) {
    const streakEndDate = todayCompleted ? new Date(todayDate) : addDays(todayDate, -1)
    for (let i = 0; i < currentStreak; i++) {
      const d = dateToStr(addDays(streakEndDate, -i))
      if (cheatDaySet.has(d)) cheatDaysUsedInCurrentStreak++
    }
  }

  // 1 coin per 6-day streak, max 2, minus cheat days already used in current streak
  const cheatCoins = Math.max(
    0,
    Math.min(2, Math.floor(currentStreak / 6)) - cheatDaysUsedInCurrentStreak,
  )

  const total = completions.filter((c) => !c.is_cheat_day).length

  return { current: currentStreak, longest: longestStreak, total, cheatCoins }
}

/** Get streak milestone label for fire animation (7, 14, 21, 30, 60, 100, ...) */
export function getStreakMilestone(streak: number): string | null {
  const milestones = [7, 14, 21, 30, 60, 100, 200, 365]
  if (milestones.includes(streak)) return `🔥 ${streak}-day streak!`
  return null
}

/** Calculate total "all-time longest streak" across all habits */
export function getLongestEverStreak(
  habits: { id: string }[],
  completionsByHabit: Map<string, Pick<HabitCompletion, 'completed_date' | 'is_cheat_day'>[]>,
  accountCreatedAt: string,
): number {
  let max = 0
  for (const habit of habits) {
    const comps = completionsByHabit.get(habit.id) ?? []
    const { longest } = calculateStreak(accountCreatedAt, comps)
    if (longest > max) max = longest
  }
  return max
}
