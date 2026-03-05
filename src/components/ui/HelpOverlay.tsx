import { useState, useEffect } from 'react'

interface HelpOverlayProps {
  open: boolean
  onClose: () => void
}

function HabitsIllustration() {
  return (
    <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="70" r="62" fill="#1a2e18" />
      {/* Card 1 — checked */}
      <rect x="32" y="38" width="96" height="22" rx="11" fill="#2d5a27" />
      <circle cx="50" cy="49" r="8" fill="#1a2e18" />
      <path d="M46.5 49.5 L49 52 L53.5 46.5" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="63" y="45.5" width="52" height="4" rx="2" fill="#4a7c40" opacity="0.7" />
      {/* Card 2 — checked */}
      <rect x="32" y="66" width="96" height="22" rx="11" fill="#2d5a27" />
      <circle cx="50" cy="77" r="8" fill="#1a2e18" />
      <path d="M46.5 77.5 L49 80 L53.5 74.5" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="63" y="73.5" width="38" height="4" rx="2" fill="#4a7c40" opacity="0.7" />
      {/* Card 3 — unchecked */}
      <rect x="32" y="94" width="96" height="22" rx="11" fill="#1e3b1c" />
      <circle cx="50" cy="105" r="8" fill="#1a2e18" stroke="#2d5a27" strokeWidth="1.5" />
      <rect x="63" y="101.5" width="45" height="4" rx="2" fill="#2d5a27" opacity="0.5" />
    </svg>
  )
}

function GoalsIllustration() {
  return (
    <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="70" r="62" fill="#1a2e18" />
      {/* Target rings */}
      <circle cx="80" cy="70" r="42" fill="none" stroke="#2d5a27" strokeWidth="2.5" />
      <circle cx="80" cy="70" r="28" fill="none" stroke="#3a6e34" strokeWidth="2.5" />
      <circle cx="80" cy="70" r="14" fill="#2d5a27" />
      <circle cx="80" cy="70" r="6" fill="#4ade80" />
      {/* Arrow */}
      <line x1="112" y1="38" x2="84" y2="66" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" />
      <polygon points="112,38 104,40 110,46" fill="#4ade80" />
    </svg>
  )
}

function StreaksIllustration() {
  return (
    <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="70" r="62" fill="#1a2e18" />
      {/* Calendar dots — 7-day row */}
      {[0,1,2,3,4,5,6].map((i) => (
        <g key={i}>
          <circle
            cx={33 + i * 16}
            cy="58"
            r="7"
            fill={i < 6 ? '#2d5a27' : '#1e3b1c'}
            stroke={i < 6 ? 'none' : '#2d5a27'}
            strokeWidth="1.5"
          />
          {i < 6 && (
            <path
              d={`M${30 + i * 16} 58.5 l2 2 l4-4`}
              stroke="#4ade80"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </g>
      ))}
      {/* Connecting line under completed days */}
      <rect x="33" y="67" width="80" height="2.5" rx="1.25" fill="#2d5a27" opacity="0.4" />
      {/* Flame shape */}
      <path
        d="M80 108 C68 100 64 90 70 82 C72 87 76 88 78 84 C80 78 84 72 80 62 C90 70 96 82 92 92 C90 86 86 86 86 90 C88 96 86 104 80 108Z"
        fill="#f59e0b"
        opacity="0.9"
      />
      <path
        d="M80 104 C75 99 74 93 77 89 C78 92 80 92 81 90 C82 87 84 84 82 80 C87 85 89 92 86 97 C85 94 83 94 83 96 C84 99 83 103 80 104Z"
        fill="#fde68a"
        opacity="0.8"
      />
    </svg>
  )
}

function CoinsIllustration() {
  return (
    <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="70" r="62" fill="#1a2e18" />
      {/* Coin stack shadow */}
      <ellipse cx="80" cy="98" rx="28" ry="6" fill="#0f1e0e" />
      {/* Coin bottom */}
      <ellipse cx="80" cy="93" rx="28" ry="8" fill="#b45309" />
      <rect x="52" y="72" width="56" height="21" fill="#d97706" />
      {/* Coin middle */}
      <ellipse cx="80" cy="78" rx="28" ry="8" fill="#b45309" />
      <rect x="52" y="57" width="56" height="21" fill="#d97706" />
      {/* Coin top */}
      <ellipse cx="80" cy="63" rx="28" ry="8" fill="#fbbf24" />
      {/* $ symbol on top coin */}
      <text x="80" y="67" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#92400e" fontFamily="system-ui">🪙</text>
      {/* Sparkles */}
      <circle cx="108" cy="44" r="3" fill="#fbbf24" opacity="0.8" />
      <circle cx="116" cy="56" r="2" fill="#fbbf24" opacity="0.6" />
      <circle cx="52" cy="42" r="2" fill="#fbbf24" opacity="0.7" />
    </svg>
  )
}

const STEPS = [
  {
    illustration: <HabitsIllustration />,
    headline: 'Build lasting habits',
    text: 'Add daily habits and check them off each day. Every small win compounds into real change over time.',
  },
  {
    illustration: <GoalsIllustration />,
    headline: 'Set meaningful goals',
    text: 'Create goals to give your habits direction. Track progress with numbers and set a target date to stay on track.',
  },
  {
    illustration: <StreaksIllustration />,
    headline: 'Grow your streak',
    text: 'Complete habits every day to build streaks. The longer the streak, the stronger your momentum.',
  },
  {
    illustration: <CoinsIllustration />,
    headline: 'Life happens — use a cheat coin',
    text: 'Earn cheat coins by keeping perfect streaks across all habits. Spend one on a tough day to protect your progress.',
  },
]

export function HelpOverlay({ open, onClose }: HelpOverlayProps) {
  const [step, setStep] = useState(0)

  // Reset to first step when overlay opens
  useEffect(() => {
    if (open) setStep(0)
  }, [open])

  if (!open) return null

  const isLast = step === STEPS.length - 1
  const current = STEPS[step]

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-t-3xl animate-slide-up"
        style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-300 transition-colors"
          style={{ backgroundColor: '#1e1e1e' }}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="px-6 pt-8 pb-10">
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-8">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className="transition-all duration-300"
                style={{
                  width: i === step ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: i === step ? '#2d5a27' : '#2a2a2a',
                }}
                aria-label={`Step ${i + 1}`}
              />
            ))}
          </div>

          {/* Illustration */}
          <div className="flex justify-center mb-6">
            {current.illustration}
          </div>

          {/* Text */}
          <h2 className="font-display text-2xl font-bold text-white text-center mb-3">
            {current.headline}
          </h2>
          <p className="text-gray-400 text-center text-sm leading-relaxed mb-8">
            {current.text}
          </p>

          {/* Buttons */}
          {isLast ? (
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl font-semibold text-black active:scale-95 transition-all"
              style={{ backgroundColor: '#2d5a27' }}
            >
              Let's go!
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3.5 rounded-xl text-sm text-gray-500 font-medium active:opacity-70 transition-opacity"
                style={{ backgroundColor: '#1a1a1a' }}
              >
                Skip
              </button>
              <button
                onClick={() => setStep((s) => s + 1)}
                className="flex-[2] py-3.5 rounded-xl font-semibold text-black active:scale-95 transition-all"
                style={{ backgroundColor: '#2d5a27' }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
