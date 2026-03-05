import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Goal, GoalHabit, NewGoal } from '@/types/database'

interface GoalState {
  goals: Goal[]
  goalHabits: GoalHabit[]
  loading: boolean

  loadGoals: (userId: string) => Promise<void>
  addGoal: (userId: string, goal: NewGoal, habitIds?: string[]) => Promise<void>
  updateGoal: (id: string, updates: Partial<Pick<Goal, 'title' | 'description' | 'target_date' | 'current_value' | 'target_value' | 'value_unit'>>) => Promise<void>
  updateGoalProgress: (id: string, currentValue: number) => Promise<void>
  completeGoal: (id: string) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  getHabitsForGoal: (goalId: string) => string[]
  reset: () => void
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  goalHabits: [],
  loading: false,

  loadGoals: async (userId) => {
    set({ loading: true })
    const [{ data: goals }] = await Promise.all([
      supabase.from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ])

    // Load goal_habits separately
    const { data: gh } = await supabase
      .from('goal_habits')
      .select('*')
      .in('goal_id', (goals ?? []).map((g: Goal) => g.id))

    set({
      goals: (goals as Goal[]) ?? [],
      goalHabits: (gh as GoalHabit[]) ?? [],
      loading: false,
    })
  },

  addGoal: async (userId, goal, habitIds = []) => {
    const { data, error } = await supabase
      .from('goals')
      .insert({ ...goal, user_id: userId })
      .select()
      .single()

    if (error || !data) return
    const newGoal = data as Goal
    set((state) => ({ goals: [newGoal, ...state.goals] }))

    if (habitIds.length > 0) {
      const links = habitIds.map((hid) => ({ goal_id: newGoal.id, habit_id: hid }))
      const { data: ghData } = await supabase.from('goal_habits').insert(links).select()
      if (ghData) {
        set((state) => ({ goalHabits: [...state.goalHabits, ...(ghData as GoalHabit[])] }))
      }
    }
  },

  updateGoal: async (id, updates) => {
    const { error } = await supabase.from('goals').update(updates).eq('id', id)
    if (!error) {
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
      }))
    }
  },

  updateGoalProgress: async (id, currentValue) => {
    const { error } = await supabase.from('goals').update({ current_value: currentValue }).eq('id', id)
    if (!error) {
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? { ...g, current_value: currentValue } : g)),
      }))
    }
  },

  completeGoal: async (id) => {
    const completedAt = new Date().toISOString()
    const { error } = await supabase.from('goals').update({ completed_at: completedAt }).eq('id', id)
    if (!error) {
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? { ...g, completed_at: completedAt } : g)),
      }))
    }
  },

  deleteGoal: async (id) => {
    await supabase.from('goal_habits').delete().eq('goal_id', id)
    const { error } = await supabase.from('goals').delete().eq('id', id)
    if (!error) {
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== id),
        goalHabits: state.goalHabits.filter((gh) => gh.goal_id !== id),
      }))
    }
  },

  getHabitsForGoal: (goalId) => {
    return get().goalHabits.filter((gh) => gh.goal_id === goalId).map((gh) => gh.habit_id)
  },

  reset: () => set({ goals: [], goalHabits: [], loading: false }),
}))
