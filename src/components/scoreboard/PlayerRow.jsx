export default function PlayerRow({ player, events = [] }) {
  const lastEvent = events.find((e) => e.playerId === player.id)
  const lastDesc = lastEvent?.description ?? null

  return (
    <div className="flex justify-between items-center py-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-on-surface">
          {player.isGroom ? `${player.name} 💍` : player.name}
        </span>
        {player.isCaptain && (
          <span className="text-[10px] font-bold text-secondary bg-secondary-fixed px-1.5 py-0.5 rounded-full">
            C
          </span>
        )}
        <span className="text-xs text-on-surface-variant opacity-60">·</span>
        <span className="text-xs text-on-surface-variant">{player.individualPoints ?? 0} pts</span>
      </div>
      {lastDesc && (
        <span className="text-[11px] font-medium text-tertiary truncate max-w-[40%]">
          {lastDesc}
        </span>
      )}
    </div>
  )
}
