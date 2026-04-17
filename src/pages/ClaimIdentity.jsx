import { useState } from 'react'
import { useIdentity } from '../hooks/useIdentity'
import useStore from '../store/useStore'

export default function ClaimIdentity() {
  const { claimPlayer } = useIdentity()
  const players = useStore((s) => s.players)
  const [selected, setSelected] = useState(null)
  const [rejoinMode, setRejoinMode] = useState(false)

  const available = players.filter((p) => !p.claimed)
  const claimed = players.filter((p) => p.claimed)

  function handleConfirm() {
    claimPlayer(selected.id)
  }

  // Step 2: confirmation screen
  if (selected) {
    const isRejoin = selected.claimed

    return (
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <span className="material-symbols-outlined text-5xl text-primary-container mb-4 block">
            {isRejoin ? 'refresh' : 'person'}
          </span>
          <h1 className="font-headline font-black text-3xl text-secondary leading-tight mb-2">
            {isRejoin ? 'Welcome back' : 'Is this you?'}
          </h1>
          <p className="font-body text-on-surface-variant text-sm mb-8">
            {isRejoin
              ? 'Resuming your session under this name.'
              : "You'll compete under this name for the entire event."}
          </p>

          <div className="bg-surface-container-lowest rounded-2xl px-6 py-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] mb-8">
            <p className="font-headline font-black text-2xl text-on-surface">{selected.name}</p>
            {isRejoin && (
              <p className="text-xs text-on-surface-variant mt-1">Already in the game</p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleConfirm}
              className="w-full py-4 rounded-full bg-primary-container text-on-primary font-bold shadow-[0_4px_12px_rgba(181,35,48,0.25)] active:scale-95 transition-transform"
            >
              {isRejoin ? 'Yes, that\'s me — rejoin' : "Yes, that's me"}
            </button>
            <button
              onClick={() => setSelected(null)}
              className="w-full py-3 rounded-full text-sm font-bold text-on-surface-variant active:scale-95 transition-transform"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 1: name picker
  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="material-symbols-outlined text-5xl text-primary-container mb-4 block">
            {rejoinMode ? 'refresh' : 'badge'}
          </span>
          <h1 className="font-headline font-black text-3xl text-secondary leading-tight">
            {rejoinMode ? 'Rejoin game' : 'Who are you?'}
          </h1>
          <p className="font-body text-on-surface-variant mt-2 text-sm">
            {rejoinMode
              ? 'Select your name to restore your session.'
              : 'Select your name to join the competition.'}
          </p>
        </div>

        {players.length === 0 && (
          <p className="text-center text-on-surface-variant text-sm animate-pulse mb-6">
            Loading roster…
          </p>
        )}

        {/* Available players (unclaimed) */}
        {!rejoinMode && (
          <>
            {available.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {available.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => setSelected(player)}
                    className="py-4 px-3 rounded-2xl bg-surface-container-lowest shadow-[0_4px_20px_rgba(0,0,0,0.06)] text-center font-headline font-bold text-on-surface text-sm active:scale-95 transition-transform"
                  >
                    {player.name}
                  </button>
                ))}
              </div>
            )}

            {available.length === 0 && players.length > 0 && (
              <p className="text-center text-on-surface-variant text-sm mb-4">
                All players have been claimed.
              </p>
            )}

            {/* Rejoin toggle */}
            {claimed.length > 0 && (
              <button
                onClick={() => setRejoinMode(true)}
                className="w-full py-3 rounded-full text-sm font-bold text-secondary bg-secondary/8 active:scale-95 transition-transform"
              >
                Already in the game? Rejoin →
              </button>
            )}
          </>
        )}

        {/* Rejoin mode: all players including claimed */}
        {rejoinMode && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {players.map((player) => (
                <button
                  key={player.id}
                  onClick={() => setSelected(player)}
                  className="py-4 px-3 rounded-2xl bg-surface-container-lowest shadow-[0_4px_20px_rgba(0,0,0,0.06)] text-center active:scale-95 transition-transform"
                >
                  <span className="font-headline font-bold text-on-surface text-sm block">{player.name}</span>
                  {player.claimed && (
                    <span className="text-[10px] text-secondary font-semibold">In game</span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setRejoinMode(false)}
              className="w-full py-3 rounded-full text-sm font-bold text-on-surface-variant active:scale-95 transition-transform"
            >
              ← Back
            </button>
          </>
        )}
      </div>
    </div>
  )
}
