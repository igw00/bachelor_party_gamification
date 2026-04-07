import { useEffect, useRef } from 'react'

export default function BottomSheet({ open, onClose, children, title }) {
  const overlayRef = useRef(null)

  // Close on overlay click
  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose()
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm flex items-end"
    >
      <div className="w-full bg-surface-container-lowest rounded-t-3xl shadow-2xl max-h-[90dvh] overflow-y-auto">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-surface-container-high" />
        </div>

        {title && (
          <div className="px-6 pt-2 pb-4 flex items-center justify-between">
            <h2 className="font-headline font-bold text-xl text-on-surface">{title}</h2>
            <button onClick={onClose} className="text-on-surface-variant active:scale-90 transition-transform">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        <div className="pb-8" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
