import type { Habit, HabitCompletion } from '@/types/database'
import { Modal } from '@/components/ui/Modal'
import { formatDisplayDate } from '@/lib/dates'
import { haptic } from '@/lib/haptics'

interface DayDetailModalProps {
  open: boolean
  onClose: () => void
  date: string
  habits: Habit[]
  completions: HabitCompletion[]
  onToggle: (habitId: string, date: string) => void
}

export function DayDetailModal({
  open,
  onClose,
  date,
  habits,
  completions,
  onToggle,
}: DayDetailModalProps) {
  const completedIds = new Set(completions.filter((c) => c.completed_date === date).map((c) => c.habit_id))
  const done = completedIds.size
  const total = habits.length
  const percent = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <Modal open={open} onClose={onClose} title={formatDisplayDate(date)}>
      {habits.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-gray-500">No habits were tracked at this time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Progress summary */}
          <div className="flex items-center justify-between text-sm mb-4">
            <span className="text-gray-500">
              {done} of {total} habits completed
            </span>
            <span
              className={`font-semibold ${
                percent === 100 ? 'text-green-500' : percent > 0 ? 'text-amber-500' : 'text-gray-400'
              }`}
            >
              {percent}%
            </span>
          </div>

          {/* Habit list */}
          {habits.map((habit) => {
            const completed = completedIds.has(habit.id)
            return (
              <div
                key={habit.id}
                onClick={() => { haptic('light'); onToggle(habit.id, date) }}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 cursor-pointer
                           hover:bg-gray-50 active:scale-[0.98] transition-all"
              >
                <span className="text-xl flex-shrink-0">{habit.emoji}</span>
                <span
                  className={`flex-1 text-[15px] font-medium ${
                    completed ? 'line-through text-gray-400' : 'text-gray-800'
                  }`}
                >
                  {habit.name}
                </span>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                    completed ? 'border-transparent' : 'border-gray-300'
                  }`}
                  style={completed ? { backgroundColor: habit.color } : {}}
                >
                  {completed && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            )
          })}

          <p className="text-xs text-gray-400 text-center pt-2">
            Tap any habit to toggle its completion retroactively.
          </p>
        </div>
      )}
    </Modal>
  )
}
