import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface Props {
  children: ReactNode
  requireOnboarding?: boolean
}

export function ProtectedRoute({ children, requireOnboarding = true }: Props) {
  const { user, settings, loading } = useAuthStore()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-body">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If on the onboarding page, allow access
  if (location.pathname === '/onboarding') {
    return <>{children}</>
  }

  // Redirect to onboarding if not completed
  if (requireOnboarding && settings !== null && !settings.onboarding_completed) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}
