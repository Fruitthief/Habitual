export interface Habit {
  id: string
  user_id: string
  name: string
  emoji: string
  color: string
  created_at: string
  archived_at: string | null
}

export type NewHabit = Pick<Habit, 'name' | 'emoji' | 'color'>

export interface HabitCompletion {
  id: string
  user_id: string
  habit_id: string
  completed_date: string // YYYY-MM-DD
  is_cheat_day: boolean
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  target_date: string | null // YYYY-MM-DD
  completed_at: string | null
  created_at: string
  start_value: number | null
  current_value: number | null
  target_value: number | null
  value_unit: string | null
}

export type NewGoal = Pick<Goal, 'title' | 'description' | 'target_date'> & {
  start_value?: number | null
  current_value?: number | null
  target_value?: number | null
  value_unit?: string | null
}

export interface GoalHabit {
  goal_id: string
  habit_id: string
}

export interface UserSettings {
  user_id: string
  notification_time: string | null // HH:MM
  onboarding_completed: boolean
}

export interface StreakInfo {
  current: number
  longest: number
  total: number
  cheatCoins: number
}

export type DayCompletionStatus = 'complete' | 'partial' | 'empty' | 'future' | 'no-habits'
