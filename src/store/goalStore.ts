import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Goal, NewGoal } from '@/types/database'

interface GoalState {
  goals: Goal[]
  loading: boolean

  loadGoals: (userId: string) => Promise<void>
  addGoal: (userId: string, goal: NewGoal) => Promise<void>
  updateGoal: (id: string, updates: Partial<Pick<Goal, 'title' | 'description' | 'target_date' | 'start_value' | 'current_value' | 'target_value' | 'value_unit'>>) => Promise<void>
  updateGoalProgress: (id: string, currentValue: number) => Promise<void>
  completeGoal: (id: string) => Promise<void>
  uncompleteGoal: (id: string) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  resetGoalProgress: (userId: string) => Promise<void>
  reset: () => void
}

export const useGoalStore = create<GoalState>((set) => ({
  goals: [],
  loading: false,

  loadGoals: async (userId) => {
    set({ loading: true })
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    set({ goals: (goals as Goal[]) ?? [], loading: false })
  },

  addGoal: async (userId, goal) => {
    const { start_value, current_value, target_value, value_unit, ...base } = goal
    const payload: Record<string, unknown> = { ...base, user_id: userId }
    if (start_value != null) payload.start_value = start_value
    if (current_value != null) payload.current_value = current_value
    if (target_value != null) payload.target_value = target_value
    if (value_unit != null) payload.value_unit = value_unit

    const { data, error } = await supabase
      .from('goals')
      .insert(payload)
      .select()
      .single()

    if (error || !data) throw new Error(error?.message ?? 'Failed to save goal')
    const newGoal = data as Goal
    set((state) => ({ goals: [newGoal, ...state.goals] }))
  },

  updateGoal: async (id, updates) => {
    const { start_value, current_value, target_value, value_unit, ...base } = updates as Record<string, unknown>
    const payload: Record<string, unknown> = { ...base }
    if (start_value != null) payload.start_value = start_value
    if (current_value != null) payload.current_value = current_value
    if (target_value != null) payload.target_value = target_value
    if (value_unit != null) payload.value_unit = value_unit

    const { error } = await supabase.from('goals').update(payload).eq('id', id)
    if (error) throw new Error(error.message)
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }))
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

  uncompleteGoal: async (id) => {
    const { error } = await supabase.from('goals').update({ completed_at: null }).eq('id', id)
    if (!error) {
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? { ...g, completed_at: null } : g)),
      }))
    }
  },

  deleteGoal: async (id) => {
    // goal_habits cascade-deletes automatically via FK constraint
    const { error } = await supabase.from('goals').delete().eq('id', id)
    if (!error) {
      set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }))
    }
  },

  resetGoalProgress: async (userId) => {
    await supabase
      .from('goals')
      .update({ completed_at: null, current_value: null })
      .eq('user_id', userId)
    set((state) => ({
      goals: state.goals.map((g) => ({ ...g, completed_at: null, current_value: g.start_value ?? null })),
    }))
  },

  reset: () => set({ goals: [], loading: false }),
}))
