const EMOJIS = [
  '💪', '🏃', '📚', '💤', '🥗', '🧘', '💊', '💧', '🎯', '✍️',
  '🎨', '🎵', '🏋️', '🚴', '🏊', '🌿', '☕', '🍎', '🧠', '❤️',
  '🌙', '☀️', '🌟', '🎸', '🎹', '🧹', '🛁', '🌸', '🏡', '📝',
  '🍵', '🥦', '🏆', '🌅', '🎭', '📖', '💡', '🧘‍♀️', '🤸', '🧗',
  '🐕', '🌱', '🦷', '💰', '📱', '✨', '🔥', '🎉', '🌊', '🎯',
]

interface EmojiPickerProps {
  value: string
  onChange: (emoji: string) => void
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-2">Icon</label>
      <div className="grid grid-cols-8 gap-1.5 p-3 bg-gray-50 rounded-xl max-h-40 overflow-y-auto">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onChange(emoji)}
            className={`
              w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all
              ${value === emoji
                ? 'bg-brand-light ring-2 ring-brand scale-110'
                : 'hover:bg-white hover:shadow-sm active:scale-95'
              }
            `}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
