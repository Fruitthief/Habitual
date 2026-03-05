import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-modal animate-slide-up max-h-[90vh] flex flex-col" style={{ backgroundColor: '#111111', border: '1px solid #1e1e1e' }}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 pt-6 pb-2 flex-shrink-0">
            <h2 className="font-display text-xl font-semibold" style={{ color: '#f0f0f0' }}>{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ backgroundColor: '#1e1e1e', color: '#888888' }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )}

        {/* Handle bar */}
        {!title && (
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#2a2a2a' }} />
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 pb-6 pt-2 flex-shrink-0" style={{ borderTop: '1px solid #1e1e1e' }}>{footer}</div>
        )}
      </div>
    </div>
  )
}
