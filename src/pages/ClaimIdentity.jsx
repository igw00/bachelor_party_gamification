import { useState } from 'react'
import { useIdentity } from '../hooks/useIdentity'
import useStore from '../store/useStore'

export default function ClaimIdentity() {
  const { claimPlayer } = useIdentity()
  const players = useStore((s) => s.players)
  const [selected, setSelected] = useState(null)  // player object, pre-confirm
  const [confirming, setConfirming] = useState(false)

  const available = players.filter((p) => !p.claimed)

  async function handleConfirm() {
    setConfirming(true)
    await claimPlayer(selected.id)
    // App.jsx will now see claimedPlayerId and unmount this — no need to reset state
  }

  // Step 2: confirmation screen
  if (selected) {
    return (
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <span className="material-symbols-outlined text-5xl text-primary-container mb-4 block">person</span>
          <h1 className="font-headline font-black text-3xl text-secondary leading-tight mb-2">
            Is this you?
          </h1>
          <p className="font-body text-on-surface-variant text-sm mb-8">
            You'll compete under this name for the entire event.
          </p>

          <div className="bg-surface-container-lowest rounded-2xl px-6 py-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] mb-8">
            <p className="font-headline font-black text-2xl text-on-surface">{selected.name}</p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="w-full py-4 rounded-full bg-primary-container text-on-primary font-bold shadow-[0_4px_12px_rgba(181,35,48,0.25)] active:scale-95 transition-transform disabled:opacity-50"
            >
              {confirming ? 'Confirming…' : "Yes, that's me"}
            </button>
            <button
              onClick={() => setSelected(null)}
              disabled={confirming}
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
              onClick={() => setSelected(player)}
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
