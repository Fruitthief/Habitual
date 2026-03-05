import type { HabitCompletion, StreakInfo, GlobalCoinInfo } from '@/types/database'
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

  const total = completions.filter((c) => !c.is_cheat_day).length

  return { current: currentStreak, longest: longestStreak, total }
}

/** Get streak milestone label for fire animation (7, 14, 21, 30, 60, 100, ...) */
export function getStreakMilestone(streak: number): string | null {
  const milestones = [7, 14, 21, 30, 60, 100, 200, 365]
  if (milestones.includes(streak)) return `🔥 ${streak}-day streak!`
  return null
}

/**
 * Calculate global cheat coin state.
 * Coins are earned by completing ALL habits for 6 consecutive days (2 coins per block, max 8).
 * Coins are spent globally (any cheat-day completion within the streak window).
 */
export function calculateGlobalCoins(
  habitIds: string[],
  completions: Pick<HabitCompletion, 'habit_id' | 'completed_date' | 'is_cheat_day'>[],
  accountCreatedAt: string,
): GlobalCoinInfo {
  if (habitIds.length === 0) return { coinsAvailable: 0, dailyStreak: 0, daysInCurrentBlock: 0 }

  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)
  const today = dateToStr(todayDate)
  const accountStart = strToDate(extractDatePart(accountCreatedAt))

  // date → set of habit IDs that have any completion (regular or cheat)
  const byDate = new Map<string, Set<string>>()
  for (const c of completions) {
    if (!byDate.has(c.completed_date)) byDate.set(c.completed_date, new Set())
    byDate.get(c.completed_date)!.add(c.habit_id)
  }

  const isPerfectDay = (ds: string) => (byDate.get(ds)?.size ?? 0) >= habitIds.length

  // Current daily streak (consecutive perfect days ending today or yesterday)
  let checkDate = isPerfectDay(today) ? new Date(todayDate) : addDays(todayDate, -1)
  let dailyStreak = 0
  while (checkDate >= accountStart) {
    const ds = dateToStr(checkDate)
    if (isPerfectDay(ds)) { dailyStreak++; checkDate = addDays(checkDate, -1) }
    else break
  }

  // 2 coins per 6-day block, max 8
  const coinsEarned = Math.min(8, Math.floor(dailyStreak / 6) * 2)
  const daysInCurrentBlock = dailyStreak % 6

  // Cheat days used within the current streak window
  let cheatDaysUsed = 0
  if (dailyStreak > 0) {
    const streakEnd = isPerfectDay(today) ? new Date(todayDate) : addDays(todayDate, -1)
    for (let i = 0; i < dailyStreak; i++) {
      const ds = dateToStr(addDays(streakEnd, -i))
      for (const c of completions) {
        if (c.completed_date === ds && c.is_cheat_day) cheatDaysUsed++
      }
    }
  }

  return {
    coinsAvailable: Math.max(0, coinsEarned - cheatDaysUsed),
    dailyStreak,
    daysInCurrentBlock,
  }
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
