import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Habit, HabitCompletion, NewHabit } from '@/types/database'
import { todayStr } from '@/lib/dates'

interface HabitState {
  habits: Habit[]
  completions: HabitCompletion[]
  loading: boolean
  error: string | null

  loadHabits: (userId: string) => Promise<void>
  loadCompletions: (userId: string) => Promise<void>
  addHabit: (userId: string, habit: NewHabit) => Promise<Habit | null>
  updateHabit: (id: string, updates: Partial<Pick<Habit, 'name' | 'emoji' | 'color'>>) => Promise<void>
  archiveHabit: (id: string) => Promise<void>
  deleteHabit: (id: string) => Promise<void>
  toggleCompletion: (userId: string, habitId: string, date: string) => Promise<void>
  useCheatDay: (userId: string, habitId: string) => Promise<void>
  getCompletionsForHabit: (habitId: string) => HabitCompletion[]
  getCompletionsForDate: (date: string) => HabitCompletion[]
  isCompleted: (habitId: string, date?: string) => boolean
  resetHistory: (userId: string) => Promise<void>
  reset: () => void
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  completions: [],
  loading: false,
  error: null,

  loadHabits: async (userId) => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .is('archived_at', null)
      .order('created_at', { ascending: true })

    if (error) {
      set({ error: error.message, loading: false })
      return
    }
    set({ habits: (data as Habit[]) ?? [], loading: false })
  },

  loadCompletions: async (userId) => {
    const { data, error } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', userId)

    if (!error && data) {
      set({ completions: data as HabitCompletion[] })
    }
  },

  addHabit: async (userId, habit) => {
    const { data, error } = await supabase
      .from('habits')
      .insert({ ...habit, user_id: userId })
      .select()
      .single()

    if (error || !data) return null
    const newHabit = data as Habit
    set((state) => ({ habits: [...state.habits, newHabit] }))
    return newHabit
  },

  updateHabit: async (id, updates) => {
    const { error } = await supabase.from('habits').update(updates).eq('id', id)
    if (!error) {
      set((state) => ({
        habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
      }))
    }
  },

  archiveHabit: async (id) => {
    const archivedAt = new Date().toISOString()
    const { error } = await supabase.from('habits').update({ archived_at: archivedAt }).eq('id', id)
    if (!error) {
      set((state) => ({ habits: state.habits.filter((h) => h.id !== id) }))
    }
  },

  deleteHabit: async (id) => {
    await supabase.from('habit_completions').delete().eq('habit_id', id)
    await supabase.from('goal_habits').delete().eq('habit_id', id)
    const { error } = await supabase.from('habits').delete().eq('id', id)
    if (!error) {
      set((state) => ({
        habits: state.habits.filter((h) => h.id !== id),
        completions: state.completions.filter((c) => c.habit_id !== id),
      }))
    }
  },

  toggleCompletion: async (userId, habitId, date) => {
    const existing = get().completions.find(
      (c) => c.habit_id === habitId && c.completed_date === date,
    )

    if (existing) {
      // Remove completion
      await supabase.from('habit_completions').delete().eq('id', existing.id)
      set((state) => ({
        completions: state.completions.filter((c) => c.id !== existing.id),
      }))
    } else {
      // Add completion
      const { data, error } = await supabase
        .from('habit_completions')
        .insert({ user_id: userId, habit_id: habitId, completed_date: date, is_cheat_day: false })
        .select()
        .single()

      if (!error && data) {
        set((state) => ({ completions: [...state.completions, data as HabitCompletion] }))
      }
    }
  },

  useCheatDay: async (userId, habitId) => {
    const today = todayStr()
    const existing = get().completions.find(
      (c) => c.habit_id === habitId && c.completed_date === today,
    )
    if (existing) return // already has entry for today

    const { data, error } = await supabase
      .from('habit_completions')
      .insert({ user_id: userId, habit_id: habitId, completed_date: today, is_cheat_day: true })
      .select()
      .single()

    if (!error && data) {
      set((state) => ({ completions: [...state.completions, data as HabitCompletion] }))
    }
  },

  getCompletionsForHabit: (habitId) => {
    return get().completions.filter((c) => c.habit_id === habitId)
  },

  getCompletionsForDate: (date) => {
    return get().completions.filter((c) => c.completed_date === date)
  },

  isCompleted: (habitId, date) => {
    const d = date ?? todayStr()
    return get().completions.some((c) => c.habit_id === habitId && c.completed_date === d)
  },

  resetHistory: async (userId) => {
    await supabase.from('habit_completions').delete().eq('user_id', userId)
    set({ completions: [] })
  },

  reset: () => set({ habits: [], completions: [], loading: false, error: null }),
}))
