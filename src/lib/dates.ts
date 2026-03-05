/**
 * Date utilities using native JS Date (no external dependency)
 */

/** Returns today's date as YYYY-MM-DD in local time */
export function todayStr(): string {
  return dateToStr(new Date())
}

/** Convert a Date to YYYY-MM-DD (local time) */
export function dateToStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Parse YYYY-MM-DD as a local-time Date (midnight) */
export function strToDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Add N days to a Date */
export function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

/** Subtract N days from a Date */
export function subDays(d: Date, n: number): Date {
  return addDays(d, -n)
}

/** Get an array of YYYY-MM-DD strings for all days in a month */
export function getDaysInMonth(year: number, month: number): string[] {
  const days: string[] = []
  const d = new Date(year, month, 1)
  while (d.getMonth() === month) {
    days.push(dateToStr(d))
    d.setDate(d.getDate() + 1)
  }
  return days
}

/** Return the day of week (0=Sun, 6=Sat) for the first day of month */
export function firstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

/** Format a date string as a human-readable display string */
export function formatDisplayDate(dateStr: string): string {
  const d = strToDate(dateStr)
  const today = new Date()
  const yesterday = subDays(today, 1)

  if (dateToStr(d) === dateToStr(today)) return 'Today'
  if (dateToStr(d) === dateToStr(yesterday)) return 'Yesterday'

  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

/** Format as "Mon, Jan 5" */
export function formatShortDate(dateStr: string): string {
  const d = strToDate(dateStr)
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/** Format as "March 2025" */
export function formatMonthYear(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

/** How many days until a target date (negative = overdue) */
export function daysUntil(dateStr: string): number {
  const target = strToDate(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

/** Is a date string in the past? */
export function isPast(dateStr: string): boolean {
  return daysUntil(dateStr) < 0
}

/** Get an ISO timestamp for the account creation date floor */
export function extractDatePart(isoTimestamp: string): string {
  return isoTimestamp.split('T')[0]
}
