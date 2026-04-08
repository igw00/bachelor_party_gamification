import { useState } from 'react'
import { useIdentity } from '../hooks/useIdentity'
import useStore from '../store/useStore'

export default function ClaimIdentity() {
  const { claimPlayer } = useIdentity()
  const players = useStore((s) => s.players)
  const [claiming, setClaiming] = useState(null) // playerId being claimed
  const [claimed, setClaimed] = useState(null)   // player object after claim

  const available = players.filter((p) => !p.claimed)

  async function handleClaim(player) {
    setClaiming(player.id)
    await claimPlayer(player.id)
    setClaimed(player)
    setClaiming(null)
  }

  // Confirmation screen — shown briefly, then App.jsx re-renders into the main app
  if (claimed) {
    return (
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <span className="material-symbols-outlined text-6xl text-secondary mb-4 block">check_circle</span>
          <h1 className="font-headline font-black text-3xl text-secondary leading-tight mb-2">
            You're in.
          </h1>
          <p className="font-body text-on-surface-variant text-sm mb-6">
            You're competing as
          </p>
          <div className="bg-surface-container-lowest rounded-2xl px-6 py-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] mb-8">
            <p className="font-headline font-black text-2xl text-on-surface">{claimed.name}</p>
          </div>
          <p className="text-xs text-on-surface-variant">Taking you to the scoreboard…</p>
        </div>
      </div>
    )
  }

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
              onClick={() => handleClaim(player)}
              disabled={claiming !== null}
              className="py-4 px-3 rounded-2xl bg-surface-container-lowest shadow-[0_4px_20px_rgba(0,0,0,0.06)] text-center font-headline font-bold text-on-surface text-sm active:scale-95 transition-transform disabled:opacity-60"
            >
              {claiming === player.id ? '…' : player.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
