import { useUIStore } from '@/store/uiStore'

export function Toast() {
  const { toasts, removeToast } = useUIStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg cursor-pointer
            animate-slide-down text-sm font-medium
            ${toast.type === 'success' ? 'bg-brand text-white' : ''}
            ${toast.type === 'error' ? 'bg-red-500 text-white' : ''}
            ${toast.type === 'info' ? 'bg-gray-800 text-white' : ''}
          `}
        >
          <span>
            {toast.type === 'success' && '✓ '}
            {toast.type === 'error' && '✕ '}
            {toast.type === 'info' && 'ℹ '}
          </span>
          {toast.message}
        </div>
      ))}
    </div>
  )
}
