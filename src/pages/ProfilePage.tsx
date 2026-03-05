import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useHabitStore } from '@/store/habitStore'
import { useUIStore } from '@/store/uiStore'
import { getLongestEverStreak } from '@/lib/streak'
import { BottomNav } from '@/components/layout/BottomNav'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, settings, updateSettings, signOut } = useAuthStore()
  const { habits, completions, loadHabits, loadCompletions } = useHabitStore()
  const { addToast } = useUIStore()
  const [notifTime, setNotifTime] = useState(settings?.notification_time ?? '')
  const [savingTime, setSavingTime] = useState(false)

  useEffect(() => {
    if (user) {
      if (habits.length === 0) loadHabits(user.id)
      if (completions.length === 0) loadCompletions(user.id)
    }
  }, [user])

  useEffect(() => {
    if (settings?.notification_time) setNotifTime(settings.notification_time)
  }, [settings])

  // Build completion map per habit
  const completionsByHabit = new Map(
    habits.map((h) => [h.id, completions.filter((c) => c.habit_id === h.id)])
  )
  const longestStreak = getLongestEverStreak(
    habits,
    completionsByHabit,
    user?.created_at ?? new Date().toISOString(),
  )

  const totalCompletions = completions.filter((c) => !c.is_cheat_day).length
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '—'

  async function handleSaveNotifTime() {
    setSavingTime(true)
    await updateSettings({ notification_time: notifTime || null })

    // Schedule a local notification if permission granted
    if (notifTime && 'Notification' in window && Notification.permission === 'granted') {
      scheduleLocalNotification(notifTime)
    }
    addToast('Reminder time saved ✓', 'success')
    setSavingTime(false)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <>
      <div className="page-container">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-brand-dark">Profile</h1>
        </div>

        {/* User info card */}
        <div className="card mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-light flex items-center justify-center text-2xl flex-shrink-0">
              🌿
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.email}</p>
              <p className="text-xs text-gray-400 mt-0.5">Member since {memberSince}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="card text-center">
            <p className="text-2xl font-bold font-display text-brand">{habits.length}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Active habits</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold font-display text-orange-500">
              {longestStreak > 0 ? `🏆 ${longestStreak}` : '—'}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">Best streak</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold font-display text-gray-700">{totalCompletions}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Total done</p>
          </div>
        </div>

        {/* Longest streak callout */}
        {longestStreak >= 7 && (
          <div className="card bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 mb-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-fire-pulse">🔥</span>
              <div>
                <p className="font-semibold text-gray-800">
                  Longest streak ever: {longestStreak} days!
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Keep pushing — every day counts.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notification settings */}
        <div className="card mb-4">
          <h2 className="font-display font-semibold text-gray-800 mb-1">Daily Reminder</h2>
          <p className="text-xs text-gray-400 mb-3">
            Set a time to get reminded to complete your habits.
          </p>
          <div className="flex gap-3 items-center">
            <input
              type="time"
              value={notifTime}
              onChange={(e) => setNotifTime(e.target.value)}
              className="input-field flex-1"
            />
            <button
              onClick={handleSaveNotifTime}
              disabled={savingTime}
              className="bg-brand text-white px-4 py-3 rounded-xl text-sm font-semibold active:scale-95 transition-all disabled:opacity-50 flex-shrink-0"
            >
              {savingTime ? '...' : 'Save'}
            </button>
          </div>
          {notifTime && 'Notification' in window && Notification.permission !== 'granted' && (
            <p className="text-xs text-amber-600 mt-2">
              ⚠️ Please enable notifications in your browser settings.
            </p>
          )}
        </div>

        {/* App info */}
        <div className="card mb-5">
          <h2 className="font-display font-semibold text-gray-800 mb-3">About</h2>
          <div className="space-y-2">
            <Row label="App" value="Habitual v1.0" />
            <Row label="Tagline" value="Small steps. Big change." />
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full py-3.5 rounded-xl border-2 border-red-200 text-red-500 font-semibold text-sm active:scale-95 transition-all hover:bg-red-50"
        >
          Sign Out
        </button>
      </div>

      <BottomNav />
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-800 font-medium">{value}</span>
    </div>
  )
}

function scheduleLocalNotification(time: string) {
  // Parse time and compute ms until next occurrence
  const [hh, mm] = time.split(':').map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(hh, mm, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  const delay = target.getTime() - now.getTime()

  setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification('Habitual 🌿', {
        body: "Time to check in on your habits! Small steps, big change.",
        icon: '/icon-192.png',
        badge: '/icon-192.png',
      })
    }
  }, delay)
}
