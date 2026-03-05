import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { UserSettings } from '@/types/database'

interface AuthState {
  user: User | null
  session: Session | null
  settings: UserSettings | null
  loading: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  loadSettings: (userId: string) => Promise<void>
  updateSettings: (updates: Partial<Omit<UserSettings, 'user_id'>>) => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  settings: null,
  loading: true,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),

  loadSettings: async (userId) => {
    const { data } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (data) {
      set({ settings: data as UserSettings })
    } else {
      // Create default settings row
      const defaults: UserSettings = {
        user_id: userId,
        notification_time: null,
        onboarding_completed: false,
      }
      await supabase.from('user_settings').insert(defaults)
      set({ settings: defaults })
    }
  },

  updateSettings: async (updates) => {
    const userId = get().user?.id
    if (!userId) return

    const newSettings = { ...get().settings, ...updates, user_id: userId } as UserSettings
    set({ settings: newSettings })

    await supabase.from('user_settings').upsert(newSettings)
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, settings: null })
  },
}))
