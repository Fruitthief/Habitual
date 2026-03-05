import { useState } from 'react'
import type { Habit, NewHabit } from '@/types/database'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { EmojiPicker } from '@/components/ui/EmojiPicker'
import { ColorPicker } from '@/components/ui/ColorPicker'

interface HabitFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (habit: NewHabit) => Promise<void>
  initial?: Pick<Habit, 'name' | 'emoji' | 'color'>
  title?: string
}

export function HabitForm({ open, onClose, onSubmit, initial, title = 'New Habit' }: HabitFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [emoji, setEmoji] = useState(initial?.emoji ?? '✨')
  const [color, setColor] = useState(initial?.color ?? '#2d5a27')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter a habit name')
      return
    }
    setError('')
    setLoading(true)
    try {
      await onSubmit({ name: name.trim(), emoji, color })
      setName('')
      setEmoji('✨')
      setColor('#2d5a27')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading} className="flex-1">
            Save Habit
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Habit name"
          placeholder="e.g. Morning run, Read for 20 min..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error}
          maxLength={60}
          autoFocus
        />
        <EmojiPicker value={emoji} onChange={setEmoji} />
        <ColorPicker value={color} onChange={setColor} />
      </form>
    </Modal>
  )
}
