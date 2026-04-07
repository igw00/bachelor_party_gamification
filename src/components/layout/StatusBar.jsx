import useStore from '../../store/useStore'

export default function StatusBar({ competition }) {
  const day = competition?.currentDay ?? 1

  return (
    <div className="fixed top-0 left-0 w-full z-[60] px-6 py-2 bg-secondary text-white flex justify-between items-center text-[11px] font-bold tracking-widest uppercase">
      <span>Day {day} of 3</span>
      <div className="flex items-center gap-2">
        <span className="opacity-70">Next Draw:</span>
        <span>Live</span>
      </div>
    </div>
  )
}
