import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useHabitStore } from '@/store/habitStore'
import { useGoalStore } from '@/store/goalStore'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Toast } from '@/components/ui/Toast'

// Pages
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import OnboardingPage from '@/pages/OnboardingPage'
import HomePage from '@/pages/HomePage'
import HabitsPage from '@/pages/HabitsPage'
import GoalsPage from '@/pages/GoalsPage'
import HistoryPage from '@/pages/HistoryPage'
import ProfilePage from '@/pages/ProfilePage'

export default function App() {
  const { setUser, setSession, setLoading, loadSettings } = useAuthStore()
  const { reset: resetHabits } = useHabitStore()
  const { reset: resetGoals } = useGoalStore()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadSettings(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        loadSettings(session.user.id)
      } else {
        // Clear stores on sign out
        resetHabits()
        resetGoals()
      }

      if (event === 'SIGNED_OUT') {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected routes */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute requireOnboarding={false}>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/habits"
          element={
            <ProtectedRoute>
              <HabitsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <GoalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toast />
    </BrowserRouter>
  )
}
