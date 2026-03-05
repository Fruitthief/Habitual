import { useUIStore } from '@/store/uiStore'

export function Toast() {
  const { toasts, removeToast } = useUIStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg
            animate-slide-down text-sm font-medium
            ${toast.type === 'success' ? 'bg-brand text-black' : ''}
            ${toast.type === 'error' ? 'bg-red-500 text-white' : ''}
            ${toast.type === 'info' ? 'bg-gray-800 text-white' : ''}
          `}
        >
          <span className="flex-1 flex items-center gap-2">
            <span>
              {toast.type === 'success' && '✓ '}
              {toast.type === 'error' && '✕ '}
              {toast.type === 'info' && 'ℹ '}
            </span>
            {toast.message}
          </span>
          {toast.action && (
            <button
              onClick={() => { toast.action!.onClick(); removeToast(toast.id) }}
              className="font-bold underline underline-offset-2 opacity-90 hover:opacity-100 flex-shrink-0"
            >
              {toast.action.label}
            </button>
          )}
          {!toast.action && (
            <button onClick={() => removeToast(toast.id)} className="opacity-60 hover:opacity-100">
              ✕
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
