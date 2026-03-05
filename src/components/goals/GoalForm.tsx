import { useState } from 'react'
import type { Habit, NewGoal } from '@/types/database'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { todayStr } from '@/lib/dates'

interface GoalFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (goal: NewGoal, habitIds: string[]) => Promise<void>
  habits?: Habit[]
}

export function GoalForm({ open, onClose, onSubmit, habits = [] }: GoalFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [selectedHabits, setSelectedHabits] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggleHabit(id: string) {
    setSelectedHabits((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Please enter a goal title')
      return
    }
    setError('')
    setLoading(true)
    try {
      await onSubmit(
        {
          title: title.trim(),
          description: description.trim() || null,
          target_date: targetDate || null,
        },
        selectedHabits,
      )
      setTitle('')
      setDescription('')
      setTargetDate('')
      setSelectedHabits([])
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Goal"
      footer={
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading} className="flex-1">
            Save Goal
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Goal title"
          placeholder="e.g. Run a 5K, Read 12 books this year..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={error}
          maxLength={100}
          autoFocus
        />
        <Textarea
          label="Description (optional)"
          placeholder="Why does this goal matter to you?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input
          label="Target date (optional)"
          type="date"
          value={targetDate}
          min={todayStr()}
          onChange={(e) => setTargetDate(e.target.value)}
        />

        {habits.length > 0 && (
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Link habits (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {habits.map((habit) => (
                <button
                  key={habit.id}
                  type="button"
                  onClick={() => toggleHabit(habit.id)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all
                    ${
                      selectedHabits.includes(habit.id)
                        ? 'bg-brand-light border-brand text-brand'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }
                  `}
                >
                  <span>{habit.emoji}</span>
                  <span>{habit.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </Modal>
  )
}
