import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useHabitStore } from '@/store/habitStore'
import { useGoalStore } from '@/store/goalStore'
import { useUIStore } from '@/store/uiStore'
import { getLongestEverStreak } from '@/lib/streak'
import { BottomNav } from '@/components/layout/BottomNav'
import { requestAndScheduleNotification, cancelScheduledNotification } from '@/lib/notifications'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, settings, updateSettings, signOut } = useAuthStore()
  const { habits, completions, loadHabits, loadCompletions, resetHistory } = useHabitStore()
  const { resetGoalProgress } = useGoalStore()
  const { addToast } = useUIStore()
  const [notifTime, setNotifTime] = useState(settings?.notification_time ?? '')
  const [savingTime, setSavingTime] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetting, setResetting] = useState(false)

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

    if (notifTime) {
      const granted = await requestAndScheduleNotification(notifTime)
      if (!granted) addToast('Enable notifications in browser settings first', 'error')
      else addToast('Reminder time saved ✓', 'success')
    } else {
      cancelScheduledNotification()
      addToast('Reminder removed', 'success')
    }
    setSavingTime(false)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  async function handleResetHistory() {
    if (!user) return
    setResetting(true)
    await resetHistory(user.id)
    await resetGoalProgress(user.id)
    setResetting(false)
    setShowResetModal(false)
    addToast('History reset — fresh start! 🌱', 'success')
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
              className="bg-brand text-black px-4 py-3 rounded-xl text-sm font-semibold active:scale-95 transition-all disabled:opacity-50 flex-shrink-0"
            >
              {savingTime ? '...' : 'Save'}
            </button>
          </div>
          {'Notification' in window && Notification.permission === 'denied' && (
            <p className="text-xs text-amber-600 mt-2">
              ⚠️ Notifications blocked — enable them in browser settings, then save again.
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

        {/* Reset history */}
        <button
          onClick={() => setShowResetModal(true)}
          className="w-full py-3.5 rounded-xl border-2 border-amber-500 text-amber-500 font-semibold text-sm active:scale-95 transition-all hover:bg-amber-50 mb-3"
        >
          Reset History
        </button>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full py-3.5 rounded-xl border-2 border-red-200 text-red-500 font-semibold text-sm active:scale-95 transition-all hover:bg-red-50"
        >
          Sign Out
        </button>
      </div>

      <BottomNav />

      {/* Reset History Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowResetModal(false)} />
          <div className="relative rounded-2xl p-6 w-full max-w-sm shadow-modal animate-scale-in" style={{ backgroundColor: '#111111', border: '1px solid #1e1e1e' }}>
            <h3 className="font-display text-lg font-semibold mb-2" style={{ color: '#f0f0f0' }}>Reset history?</h3>
            <p className="text-sm mb-5" style={{ color: '#888888' }}>
              This will permanently delete all your completion history and reset goal progress. Your habits and goals will be kept, but all streaks and stats start fresh.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium active:scale-95 transition-all"
                style={{ border: '1px solid #2a2a2a', color: '#aaaaaa', backgroundColor: '#161616' }}
              >
                Cancel
              </button>
              <button
                onClick={handleResetHistory}
                disabled={resetting}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black text-sm font-semibold active:scale-95 transition-all disabled:opacity-50"
              >
                {resetting ? '...' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
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

