import { getDaysInMonth, firstDayOfWeek, formatMonthYear, todayStr } from '@/lib/dates'
import type { DayCompletionStatus } from '@/types/database'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface CalendarProps {
  year: number
  month: number
  getStatus: (date: string) => DayCompletionStatus
  selectedDate: string | null
  onSelectDate: (date: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
}

export function Calendar({
  year,
  month,
  getStatus,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: CalendarProps) {
  const today = todayStr()
  const days = getDaysInMonth(year, month)
  const startDow = firstDayOfWeek(year, month)
  const blanks = Array(startDow).fill(null)

  function statusClass(status: DayCompletionStatus): string {
    switch (status) {
      case 'complete': return 'bg-green-500 text-white'
      case 'partial': return 'bg-amber-400 text-white'
      case 'empty': return 'bg-gray-200 text-gray-500'
      case 'no-habits': return 'bg-gray-100 text-gray-300'
      default: return 'text-gray-300'
    }
  }

  return (
    <div className="card">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrevMonth}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
        >
          ‹
        </button>
        <h2 className="font-display font-semibold text-gray-900">
          {formatMonthYear(year, month)}
        </h2>
        <button
          onClick={onNextMonth}
          disabled={year === new Date().getFullYear() && month === new Date().getMonth()}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ›
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, i) => <div key={`blank-${i}`} />)}
        {days.map((dateStr) => {
          const isFuture = dateStr > today
          const isToday = dateStr === today
          const isSelected = dateStr === selectedDate
          const status = isFuture ? 'future' : getStatus(dateStr)

          return (
            <button
              key={dateStr}
              onClick={() => !isFuture && onSelectDate(dateStr)}
              disabled={isFuture}
              className={`
                aspect-square rounded-xl text-xs font-medium transition-all
                flex items-center justify-center relative
                ${isFuture ? 'cursor-default text-gray-200' : 'cursor-pointer active:scale-90'}
                ${!isFuture ? statusClass(status) : ''}
                ${isSelected ? 'ring-2 ring-offset-1 ring-brand' : ''}
                ${isToday && !isSelected ? 'ring-2 ring-offset-1 ring-brand/40' : ''}
              `}
            >
              {new Date(dateStr + 'T00:00:00').getDate()}
              {isToday && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-brand rounded-full" />}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-gray-50">
        <LegendItem color="bg-green-500" label="All done" />
        <LegendItem color="bg-amber-400" label="Partial" />
        <LegendItem color="bg-gray-200" label="Missed" />
      </div>
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-3 h-3 rounded-sm ${color}`} />
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  )
}
