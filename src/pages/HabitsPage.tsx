import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useHabitStore } from '@/store/habitStore'
import { useUIStore } from '@/store/uiStore'
import { calculateStreak } from '@/lib/streak'
import type { Habit, NewHabit } from '@/types/database'
import { HabitCard } from '@/components/habits/HabitCard'
import { HabitForm } from '@/components/habits/HabitForm'
import { HabitCardSkeleton } from '@/components/ui/Skeleton'
import { BottomNav } from '@/components/layout/BottomNav'
import { todayStr } from '@/lib/dates'

export default function HabitsPage() {
  const { user } = useAuthStore()
  const { habits, completions, loading, loadHabits, loadCompletions, addHabit, updateHabit, archiveHabit } =
    useHabitStore()
  const { addToast } = useUIStore()

  const [showAdd, setShowAdd] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [confirmArchive, setConfirmArchive] = useState<Habit | null>(null)

  useEffect(() => {
    if (user) {
      if (habits.length === 0) loadHabits(user.id)
      if (completions.length === 0) loadCompletions(user.id)
    }
  }, [user])

  function getStreak(habitId: string) {
    const habitCompletions = completions.filter((c) => c.habit_id === habitId)
    return calculateStreak(user?.created_at ?? new Date().toISOString(), habitCompletions)
  }

  async function handleAdd(habit: NewHabit) {
    if (!user) return
    await addHabit(user.id, habit)
    addToast('Habit added! ✓', 'success')
  }

  async function handleEdit(habit: NewHabit) {
    if (!editingHabit) return
    await updateHabit(editingHabit.id, habit)
    addToast('Habit updated ✓', 'success')
    setEditingHabit(null)
  }

  async function handleArchive(habit: Habit) {
    await archiveHabit(habit.id)
    addToast('Habit archived', 'info')
    setConfirmArchive(null)
  }

  const today = todayStr()

  return (
    <>
      <div className="page-container">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-brand-dark">My Habits</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {habits.length} active habit{habits.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Habit list */}
        <div className="space-y-3">
          {loading ? (
            <>
              <HabitCardSkeleton />
              <HabitCardSkeleton />
              <HabitCardSkeleton />
            </>
          ) : habits.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="font-display text-xl font-semibold text-gray-700 mb-2">
                No habits yet
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Add your first habit and start building momentum.
              </p>
              <button
                onClick={() => setShowAdd(true)}
                className="btn-primary !w-auto inline-flex"
              >
                + Add Habit
              </button>
            </div>
          ) : (
            habits.map((habit) => {
              const streak = getStreak(habit.id)
              const completed = completions.some(
                (c) => c.habit_id === habit.id && c.completed_date === today,
              )
              return (
                <div key={habit.id} className="animate-fade-in">
                  <HabitCard
                    habit={habit}
                    streak={streak}
                    completed={completed}
                    onToggle={() => {}} // read-only on habits page
                    onEdit={() => setEditingHabit(habit)}
                    onArchive={() => setConfirmArchive(habit)}
                    viewOnly
                  />
                </div>
              )
            })
          )}
        </div>

        {/* Swipe hint */}
        {habits.length > 0 && (
          <p className="text-center text-xs text-gray-300 mt-6">
            Swipe left on a habit to edit or archive
          </p>
        )}
      </div>

      <BottomNav />

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-5 w-14 h-14 bg-brand text-white rounded-full flex items-center justify-center text-2xl shadow-lg hover:bg-brand-dark active:scale-95 transition-all z-40"
        aria-label="Add habit"
      >
        +
      </button>

      {/* Add habit modal */}
      <HabitForm
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={handleAdd}
        title="New Habit"
      />

      {/* Edit habit modal */}
      {editingHabit && (
        <HabitForm
          open={!!editingHabit}
          onClose={() => setEditingHabit(null)}
          onSubmit={handleEdit}
          initial={editingHabit}
          title="Edit Habit"
        />
      )}

      {/* Archive confirm */}
      {confirmArchive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmArchive(null)} />
          <div className="relative rounded-2xl p-6 w-full max-w-sm shadow-modal animate-scale-in" style={{ backgroundColor: '#111111', border: '1px solid #1e1e1e' }}>
            <h3 className="font-display text-lg font-semibold mb-2" style={{ color: '#f0f0f0' }}>Archive habit?</h3>
            <p className="text-sm mb-5" style={{ color: '#888888' }}>
              "{confirmArchive.name}" will be archived. Your completion history will be preserved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmArchive(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium active:scale-95 transition-all"
                style={{ border: '1px solid #2a2a2a', color: '#aaaaaa', backgroundColor: '#161616' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleArchive(confirmArchive)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold active:scale-95 transition-all"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
