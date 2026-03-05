import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useGoalStore } from '@/store/goalStore'
import { useHabitStore } from '@/store/habitStore'
import { useUIStore } from '@/store/uiStore'
import type { Goal, NewGoal } from '@/types/database'
import { GoalCard } from '@/components/goals/GoalCard'
import { GoalForm } from '@/components/goals/GoalForm'
import { GoalCardSkeleton } from '@/components/ui/Skeleton'
import { BottomNav } from '@/components/layout/BottomNav'

export default function GoalsPage() {
  const { user } = useAuthStore()
  const { goals, loading, loadGoals, addGoal, updateGoal, completeGoal, uncompleteGoal, deleteGoal, getHabitsForGoal } =
    useGoalStore()
  const { habits, loadHabits } = useHabitStore()
  const { addToast } = useUIStore()
  const [showAdd, setShowAdd] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  // Soft-delete: IDs hidden from UI until timer fires (supports undo)
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(new Set())
  const pendingTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    if (user) {
      loadGoals(user.id)
      if (habits.length === 0) loadHabits(user.id)
    }
  }, [user])

  async function handleAdd(goal: NewGoal, habitIds: string[]) {
    if (!user) return
    await addGoal(user.id, goal, habitIds)  // throws on failure
    addToast('Goal added! 🎯', 'success')
  }

  async function handleUpdate(id: string, updates: Partial<Goal>, _habitIds: string[]) {
    await updateGoal(id, updates)  // throws on failure
    addToast('Goal updated ✓', 'success')
  }

  function handleToggleComplete(id: string) {
    const goal = goals.find((g) => g.id === id)
    if (!goal) return
    if (goal.completed_at) {
      uncompleteGoal(id)
      addToast('Goal reopened', 'info')
    } else {
      completeGoal(id)
      addToast('Goal completed! 🎉', 'success')
    }
  }

  function handleDelete(id: string) {
    // Hide from UI immediately
    setPendingDeleteIds((prev) => new Set([...prev, id]))

    // Start deletion timer (slightly longer than toast so undo works)
    const timer = setTimeout(async () => {
      await deleteGoal(id)
      pendingTimers.current.delete(id)
      setPendingDeleteIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, 4000)

    pendingTimers.current.set(id, timer)

    addToast('Goal deleted', 'info', {
      label: 'Undo',
      onClick: () => {
        clearTimeout(pendingTimers.current.get(id))
        pendingTimers.current.delete(id)
        setPendingDeleteIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      },
    })
  }

  const activeGoals = goals.filter((g) => !g.completed_at && !pendingDeleteIds.has(g.id))
  const completedGoals = goals.filter((g) => g.completed_at && !pendingDeleteIds.has(g.id))

  return (
    <>
      <div className="page-container">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-brand-dark">Goals</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {activeGoals.length} active goal{activeGoals.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            <GoalCardSkeleton />
            <GoalCardSkeleton />
          </div>
        ) : goals.filter((g) => !pendingDeleteIds.has(g.id)).length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="font-display text-xl font-semibold text-gray-700 mb-2">
              No goals yet
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Set a goal to give your habits direction and purpose.
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="btn-primary !w-auto inline-flex"
            >
              + Add Goal
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeGoals.length > 0 && (
              <div className="space-y-3">
                {activeGoals.map((goal) => {
                  const linkedHabitIds = getHabitsForGoal(goal.id)
                  const linkedHabitNames = habits
                    .filter((h) => linkedHabitIds.includes(h.id))
                    .map((h) => `${h.emoji} ${h.name}`)
                  return (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      linkedHabits={linkedHabitNames}
                      onToggleComplete={() => handleToggleComplete(goal.id)}
                      onDelete={() => handleDelete(goal.id)}
                      onEdit={() => setEditingGoal(goal)}
                    />
                  )
                })}
              </div>
            )}

            {completedGoals.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 mt-4">
                  Completed
                </h2>
                <div className="space-y-3">
                  {completedGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onToggleComplete={() => handleToggleComplete(goal.id)}
                      onDelete={() => handleDelete(goal.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-5 w-14 h-14 bg-brand text-black rounded-full flex items-center justify-center text-2xl shadow-lg hover:bg-brand-dark active:scale-95 transition-all z-40"
        aria-label="Add goal"
      >
        +
      </button>

      <GoalForm
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={handleAdd}
        habits={habits}
      />

      {editingGoal && (
        <GoalForm
          open={true}
          onClose={() => setEditingGoal(null)}
          onSubmit={handleAdd}
          onUpdate={handleUpdate}
          initialValues={editingGoal}
          initialHabitIds={getHabitsForGoal(editingGoal.id)}
          habits={habits}
        />
      )}
    </>
  )
}
