import { useIdentity } from '../hooks/useIdentity'
import useStore from '../store/useStore'

export default function ClaimIdentity() {
  const { claimPlayer } = useIdentity()
  const players = useStore((s) => s.players)

  const available = players.filter((p) => !p.claimed)

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="material-symbols-outlined text-5xl text-primary-container mb-4 block">badge</span>
          <h1 className="font-headline font-black text-3xl text-secondary leading-tight">Who are you?</h1>
          <p className="font-body text-on-surface-variant mt-2 text-sm">
            Select your name to join the competition.
          </p>
        </div>

        {players.length === 0 && (
          <p className="text-center text-on-surface-variant text-sm animate-pulse">
            Loading roster…
          </p>
        )}

        {players.length > 0 && available.length === 0 && (
          <p className="text-center text-on-surface-variant text-sm">
            All players have been claimed. Ask the commissioner to reset if needed.
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          {available.map((player) => (
            <button
              key={player.id}
              onClick={() => claimPlayer(player.id)}
              className="py-4 px-3 rounded-2xl bg-surface-container-lowest shadow-[0_4px_20px_rgba(0,0,0,0.06)] text-center font-headline font-bold text-on-surface text-sm active:scale-95 transition-transform"
            >
              {player.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
