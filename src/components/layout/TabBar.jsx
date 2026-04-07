import { NavLink } from 'react-router-dom'
import useStore from '../../store/useStore'

export default function TabBar() {
  const setQuickAddOpen = useStore((s) => s.setQuickAddOpen)
  const setQuickAddAdvanced = useStore((s) => s.setQuickAddAdvanced)

  function openQuickAdd() {
    setQuickAddAdvanced(false)
    setQuickAddOpen(true)
  }

  return (
    <nav className="fixed bottom-0 w-full z-50 bg-surface/80 backdrop-blur-xl flex justify-around items-center h-20 px-4 shadow-[0_-4px_12px_rgba(181,35,48,0.06)]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Scoreboard */}
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-0.5 px-4 rounded-full transition-all active:scale-90 ${
            isActive ? 'text-primary' : 'text-on-surface-variant'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              bar_chart
            </span>
            <span className="font-label font-semibold text-[10px] uppercase tracking-wider">Scoreboard</span>
          </>
        )}
      </NavLink>

      {/* Center FAB */}
      <div className="relative -top-6">
        <button
          onClick={openQuickAdd}
          className="bg-primary-container text-on-primary p-4 rounded-full shadow-[0_8px_20px_rgba(181,35,48,0.3)] active:scale-95 transition-transform flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-label font-semibold text-[10px] uppercase tracking-wider text-secondary/60 whitespace-nowrap">
          Add
        </span>
      </div>

      {/* Rules */}
      <NavLink
        to="/rules"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-0.5 px-4 rounded-full transition-all active:scale-90 ${
            isActive ? 'text-primary' : 'text-on-surface-variant'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              menu_book
            </span>
            <span className="font-label font-semibold text-[10px] uppercase tracking-wider">Rules</span>
          </>
        )}
      </NavLink>
    </nav>
  )
}
