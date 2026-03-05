import { useState, useEffect } from 'react'
import type { Goal, Habit, NewGoal } from '@/types/database'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { todayStr } from '@/lib/dates'

interface GoalFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (goal: NewGoal, habitIds: string[]) => Promise<void>
  onUpdate?: (id: string, updates: Partial<Goal>, habitIds: string[]) => Promise<void>
  initialValues?: Goal
  initialHabitIds?: string[]
  habits?: Habit[]
}

export function GoalForm({
  open,
  onClose,
  onSubmit,
  onUpdate,
  initialValues,
  initialHabitIds = [],
  habits = [],
}: GoalFormProps) {
  const isEdit = !!initialValues?.id

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [valueUnit, setValueUnit] = useState('')
  const [startValue, setStartValue] = useState('')
  const [currentValue, setCurrentValue] = useState('')
  const [targetValue, setTargetValue] = useState('')
  const [selectedHabits, setSelectedHabits] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setTitle(initialValues?.title ?? '')
      setDescription(initialValues?.description ?? '')
      setTargetDate(initialValues?.target_date ?? '')
      setValueUnit(initialValues?.value_unit ?? '')
      setStartValue(initialValues?.start_value != null ? String(initialValues.start_value) : '')
      setCurrentValue(initialValues?.current_value != null ? String(initialValues.current_value) : '')
      setTargetValue(initialValues?.target_value != null ? String(initialValues.target_value) : '')
      setSelectedHabits(initialHabitIds)
      setError('')
    }
    // Only re-init when the modal opens/closes — NOT on every prop update.
    // Including initialValues/initialHabitIds would reset the form on every keystroke
    // because the default [] parameter creates a new reference on each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function toggleHabit(id: string) {
    setSelectedHabits((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id],
    )
  }

  function parseNum(s: string): number | null {
    return s.trim() !== '' ? parseFloat(s) : null
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
      const goalData: NewGoal = {
        title: title.trim(),
        description: description.trim() || null,
        target_date: targetDate || null,
        value_unit: valueUnit.trim() || null,
        start_value: parseNum(startValue),
        current_value: parseNum(currentValue),
        target_value: parseNum(targetValue),
      }

      if (isEdit && onUpdate && initialValues) {
        await onUpdate(initialValues.id, goalData, selectedHabits)
      } else {
        await onSubmit(goalData, selectedHabits)
      }
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Goal' : 'New Goal'}
      footer={
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading} className="flex-1">
            {isEdit ? 'Save Changes' : 'Save Goal'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="goal-title"
          label="Goal title"
          placeholder="e.g. Run a 5K, Read 12 books this year..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={error}
          maxLength={100}
          autoFocus
        />
        <Textarea
          id="goal-description"
          label="Description (optional)"
          placeholder="Why does this goal matter to you?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input
          id="goal-target-date"
          label="Target date (optional)"
          type="date"
          value={targetDate}
          min={!isEdit ? todayStr() : undefined}
          onChange={(e) => setTargetDate(e.target.value)}
        />

        {/* Progress tracking */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Progress tracking (optional)</p>
          <div className="space-y-2">
            <Input
              id="goal-unit"
              label="Unit"
              placeholder="km, books, kg, €…"
              value={valueUnit}
              onChange={(e) => setValueUnit(e.target.value)}
              maxLength={20}
            />
            <div className="grid grid-cols-3 gap-2">
              <Input
                id="goal-start"
                label="Starting value"
                type="number"
                placeholder="0"
                value={startValue}
                onChange={(e) => setStartValue(e.target.value)}
              />
              <Input
                id="goal-current"
                label="Current value"
                type="number"
                placeholder="0"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
              />
              <Input
                id="goal-target"
                label="Target value"
                type="number"
                placeholder="100"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
              />
            </div>
          </div>
        </div>

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
