import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useHabitStore } from '@/store/habitStore'
import { useGoalStore } from '@/store/goalStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { EmojiPicker } from '@/components/ui/EmojiPicker'
import { ColorPicker } from '@/components/ui/ColorPicker'

type Step = 1 | 2 | 3

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user, updateSettings } = useAuthStore()
  const { addHabit } = useHabitStore()
  const { addGoal } = useGoalStore()

  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [notifGranted, setNotifGranted] = useState(false)

  // Step 2 – first habit
  const [habitName, setHabitName] = useState('')
  const [habitEmoji, setHabitEmoji] = useState('💪')
  const [habitColor, setHabitColor] = useState('#2d5a27')
  const [habitError, setHabitError] = useState('')

  // Step 3 – first goal
  const [goalTitle, setGoalTitle] = useState('')
  const [goalDate, setGoalDate] = useState('')

  async function requestNotification() {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission()
      setNotifGranted(perm === 'granted')
    }
  }

  async function handleStep2() {
    if (!habitName.trim()) {
      setHabitError('Please enter a habit name')
      return
    }
    setHabitError('')
    setLoading(true)
    if (user) {
      await addHabit(user.id, { name: habitName.trim(), emoji: habitEmoji, color: habitColor })
    }
    setLoading(false)
    setStep(3)
  }

  async function handleFinish(skip = false) {
    setLoading(true)
    if (!skip && goalTitle.trim() && user) {
      await addGoal(user.id, {
        title: goalTitle.trim(),
        description: null,
        target_date: goalDate || null,
      })
    }
    await updateSettings({ onboarding_completed: true })
    setLoading(false)
    navigate('/')
  }

  const steps = [
    { label: 'Welcome' },
    { label: 'First Habit' },
    { label: 'First Goal' },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-12 pb-2">
        {steps.map((s, i) => (
          <div
            key={s.label}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i + 1 === step ? 'w-8 bg-brand' : i + 1 < step ? 'w-4 bg-brand/40' : 'w-4 bg-gray-200'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm">

          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center animate-fade-in space-y-6">
              <div className="text-7xl animate-spring-bounce">🌿</div>
              <div>
                <h1 className="font-display text-4xl font-bold text-brand-dark">Habitual</h1>
                <p className="text-gray-500 mt-2 text-lg">Small steps. Big change.</p>
              </div>
              <p className="text-gray-600 text-[15px] leading-relaxed">
                Build habits that stick. Track your progress, maintain streaks, and achieve your goals — one day at a time.
              </p>

              {/* Notification permission */}
              {'Notification' in window && (
                <div className="bg-brand-pale rounded-2xl p-4 text-left">
                  <p className="text-sm font-medium text-brand-dark mb-2">🔔 Daily Reminders</p>
                  <p className="text-xs text-gray-500 mb-3">
                    Get a daily nudge to keep your habits on track.
                  </p>
                  {notifGranted ? (
                    <p className="text-xs text-brand font-medium">✓ Notifications enabled</p>
                  ) : (
                    <button
                      onClick={requestNotification}
                      className="text-xs text-brand font-semibold underline"
                    >
                      Enable notifications
                    </button>
                  )}
                </div>
              )}

              <Button onClick={() => setStep(2)} fullWidth size="lg">
                Get Started →
              </Button>
            </div>
          )}

          {/* Step 2: First Habit */}
          {step === 2 && (
            <div className="animate-slide-up space-y-6">
              <div className="text-center">
                <div className="text-4xl mb-3">💪</div>
                <h2 className="font-display text-2xl font-bold text-gray-900">Add your first habit</h2>
                <p className="text-gray-500 text-sm mt-1">Start with something small and achievable.</p>
              </div>

              <div className="space-y-5">
                <Input
                  label="What habit do you want to build?"
                  placeholder="e.g. Drink 8 glasses of water"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  error={habitError}
                  autoFocus
                />
                <EmojiPicker value={habitEmoji} onChange={setHabitEmoji} />
                <ColorPicker value={habitColor} onChange={setHabitColor} />
              </div>

              <Button onClick={handleStep2} loading={loading} fullWidth size="lg">
                Continue →
              </Button>
            </div>
          )}

          {/* Step 3: First Goal */}
          {step === 3 && (
            <div className="animate-slide-up space-y-6">
              <div className="text-center">
                <div className="text-4xl mb-3">🎯</div>
                <h2 className="font-display text-2xl font-bold text-gray-900">Set a goal</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Goals give your habits purpose. You can skip this for now.
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  label="What do you want to achieve?"
                  placeholder="e.g. Run a 5K by summer"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  autoFocus
                />
                <Input
                  label="Target date (optional)"
                  type="date"
                  value={goalDate}
                  onChange={(e) => setGoalDate(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => handleFinish(false)}
                  loading={loading}
                  fullWidth
                  size="lg"
                  disabled={!goalTitle.trim()}
                >
                  Save Goal & Start 🚀
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleFinish(true)}
                  fullWidth
                  disabled={loading}
                >
                  Skip for now
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
