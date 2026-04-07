import { useState } from 'react'

export default function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <span className="font-headline font-bold text-base text-on-surface">{title}</span>
        <span
          className="material-symbols-outlined text-on-surface-variant transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          keyboard_arrow_down
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 text-sm text-on-surface-variant space-y-2 border-t border-surface-container">
          {children}
        </div>
      )}
    </div>
  )
}
