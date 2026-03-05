import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useGoalStore } from '@/store/goalStore'
import { useHabitStore } from '@/store/habitStore'
import { useUIStore } from '@/store/uiStore'
import type { NewGoal } from '@/types/database'
import { GoalCard } from '@/components/goals/GoalCard'
import { GoalForm } from '@/components/goals/GoalForm'
import { GoalCardSkeleton } from '@/components/ui/Skeleton'
import { BottomNav } from '@/components/layout/BottomNav'

export default function GoalsPage() {
  const { user } = useAuthStore()
  const { goals, loading, loadGoals, addGoal, completeGoal, deleteGoal, getHabitsForGoal } =
    useGoalStore()
  const { habits, loadHabits } = useHabitStore()
  const { addToast } = useUIStore()
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    if (user) {
      loadGoals(user.id)
      if (habits.length === 0) loadHabits(user.id)
    }
  }, [user])

  async function handleAdd(goal: NewGoal, habitIds: string[]) {
    if (!user) return
    await addGoal(user.id, goal, habitIds)
    addToast('Goal added! 🎯', 'success')
  }

  async function handleComplete(id: string) {
    await completeGoal(id)
    addToast('Goal completed! 🎉', 'success')
  }

  async function handleDelete(id: string) {
    await deleteGoal(id)
    addToast('Goal deleted', 'info')
  }

  // Separate active and completed goals
  const activeGoals = goals.filter((g) => !g.completed_at)
  const completedGoals = goals.filter((g) => g.completed_at)

  return (
    <>
      <div className="page-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-brand-dark">Goals</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {activeGoals.length} active goal{activeGoals.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="w-11 h-11 bg-brand text-white rounded-2xl flex items-center justify-center text-xl shadow-card hover:bg-brand-dark active:scale-95 transition-all"
            aria-label="Add goal"
          >
            +
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            <GoalCardSkeleton />
            <GoalCardSkeleton />
          </div>
        ) : goals.length === 0 ? (
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
            {/* Active goals */}
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
                      onComplete={() => handleComplete(goal.id)}
                      onDelete={() => handleDelete(goal.id)}
                    />
                  )
                })}
              </div>
            )}

            {/* Completed goals */}
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
                      onComplete={() => {}}
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

      <GoalForm
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={handleAdd}
        habits={habits}
      />
    </>
  )
}
