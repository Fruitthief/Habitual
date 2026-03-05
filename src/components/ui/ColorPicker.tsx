const COLORS = [
  { value: '#2d5a27', label: 'Forest' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#ef4444', label: 'Red' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#f97316', label: 'Orange' },
]

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-2">Color</label>
      <div className="flex gap-2 flex-wrap">
        {COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            title={color.label}
            className={`
              w-9 h-9 rounded-full transition-all
              ${value === color.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105 active:scale-95'}
            `}
            style={{ backgroundColor: color.value }}
          />
        ))}
      </div>
    </div>
  )
}
