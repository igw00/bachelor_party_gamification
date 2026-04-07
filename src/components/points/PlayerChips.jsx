import useStore from '../../store/useStore'

export default function PlayerChips({ players }) {
  const { selectedPlayerIds, setSelectedPlayerIds } = useStore()

  function toggle(id) {
    setSelectedPlayerIds(
      selectedPlayerIds.includes(id)
        ? selectedPlayerIds.filter((i) => i !== id)
        : [...selectedPlayerIds, id]
    )
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-6 px-6 scrollbar-none">
      {players.map((p) => {
        const selected = selectedPlayerIds.includes(p.id)
        return (
          <button
            key={p.id}
            onClick={() => toggle(p.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 ${
              selected
                ? 'bg-primary-container text-on-primary shadow-[0_4px_12px_rgba(181,35,48,0.2)]'
                : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            {p.isGroom ? `${p.name} 💍` : p.name}
          </button>
        )
      })}
    </div>
  )
}
