import { useState } from 'react'
import useStore from '../../store/useStore'
import { useIdentity } from '../../hooks/useIdentity'
import { useCards } from '../../hooks/useCards'
import GameCard from './GameCard'

function ActivateButton({ card, playerId }) {
  const { activateCard } = useCards()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isActive = card.active
  const isPlayed = card.played

  async function handleActivate() {
    if (loading || isActive || isPlayed) return
    setLoading(true)
    setError(null)
    try {
      await activateCard(card.id, playerId)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (isPlayed) {
    return (
      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-on-surface-variant">
        <span className="material-symbols-outlined text-base">check_circle</span>
        Played
      </div>
    )
  }

  if (isActive) {
    return (
      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-tertiary bg-tertiary/10 rounded-full py-2">
        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
          bolt
        </span>
        Active
      </div>
    )
  }

  return (
    <div className="mt-3">
      <button
        onClick={handleActivate}
        disabled={loading}
        className="w-full py-2.5 rounded-full bg-secondary text-on-secondary font-bold text-sm active:scale-95 transition-transform disabled:opacity-60"
      >
        {loading ? 'Activating…' : 'Activate Card'}
      </button>
      {error && <p className="text-[11px] text-error text-center mt-1">{error}</p>}
    </div>
  )
}

export default function TeamActiveCards() {
  const { claimedPlayerId } = useIdentity()
  const cards = useStore((s) => s.cards)
  const teams = useStore((s) => s.teams)
  const players = useStore((s) => s.players)

  const me = players.find((p) => p.id === claimedPlayerId)
  const myTeam = me?.teamId ? teams.find((t) => t.id === me.teamId) : null

  // All cards currently held by my team (not yet played)
  const heldCards = cards.filter((c) => c.heldByTeamId === myTeam?.id)
  const activeCount = heldCards.filter((c) => c.active).length

  if (!myTeam) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-6">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3">group_off</span>
        <p className="font-headline font-bold text-on-surface text-lg">No team assigned</p>
        <p className="text-sm text-on-surface-variant mt-1">You'll see your team's cards here once setup is complete.</p>
      </div>
    )
  }

  if (heldCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-6">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3">playing_cards</span>
        <p className="font-headline font-bold text-on-surface text-lg">{myTeam.name} has no cards</p>
        <p className="text-sm text-on-surface-variant mt-1">
          Earn 50+ points to unlock your first card draw.
        </p>
        <div className="mt-4 bg-surface-container rounded-xl px-5 py-3 text-center">
          <p className="text-xs text-on-surface-variant">Team points</p>
          <p className="font-headline font-black text-3xl text-on-surface mt-0.5">
            {myTeam.totalPoints ?? 0}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-2 pb-4">
      {/* Team summary */}
      <div className="flex items-center justify-between mb-5 bg-surface-container-lowest rounded-xl px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div>
          <p className="font-headline font-bold text-base text-on-surface">{myTeam.name}</p>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {heldCards.length} card{heldCards.length !== 1 ? 's' : ''} in hand
            {activeCount > 0 && ` · ${activeCount} active`}
          </p>
        </div>
        <div className="text-right">
          <p className="font-headline font-black text-3xl text-on-surface">{myTeam.totalPoints ?? 0}</p>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">pts</p>
        </div>
      </div>

      {/* Cards — one per row for readability, with activate button below each */}
      <div className="flex flex-col items-center gap-6">
        {heldCards.map((card, i) => (
          <div key={card.id} className="w-64">
            <GameCard card={card} seed={i} />
            <ActivateButton card={card} playerId={claimedPlayerId} />
          </div>
        ))}
      </div>
    </div>
  )
}
