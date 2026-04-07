const MILESTONE = 50

export default function ProgressBar({ totalPoints }) {
  const pointsIntoWindow = totalPoints % MILESTONE
  const pct = Math.round((pointsIntoWindow / MILESTONE) * 100)
  const remaining = MILESTONE - pointsIntoWindow

  return (
    <div className="mb-5">
      <div className="flex justify-between items-end mb-2">
        <span className="text-xs font-semibold text-on-surface-variant">
          {remaining} pts to next draw
        </span>
      </div>
      <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
