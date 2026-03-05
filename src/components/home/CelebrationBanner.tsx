import { useEffect } from 'react'
import { launchConfetti } from '@/lib/confetti'
import { haptic } from '@/lib/haptics'

interface CelebrationBannerProps {
  show: boolean
  onDismiss: () => void
}

export function CelebrationBanner({ show, onDismiss }: CelebrationBannerProps) {
  useEffect(() => {
    if (show) {
      launchConfetti(80)
      haptic('success')
    }
  }, [show])

  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand/90 animate-fade-in"
      onClick={onDismiss}
    >
      <div className="text-center px-8 animate-celebration">
        <div className="text-7xl mb-4">🎉</div>
        <h2 className="font-display text-3xl font-bold text-white mb-2">
          All done for today!
        </h2>
        <p className="text-brand-light text-lg mb-8">
          You crushed every habit. Keep it up!
        </p>
        <div className="text-white/60 text-sm">Tap anywhere to continue</div>
      </div>
    </div>
  )
}
