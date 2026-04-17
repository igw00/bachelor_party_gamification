import useStore from '../../store/useStore'
import { useIdentity } from '../../hooks/useIdentity'
import GameCard from './GameCard'

export default function TeamActiveCards() {
  const { claimedPlayerId } = useIdentity()
  const cards = useStore((s) => s.cards)
  const teams = useStore((s) => s.teams)
  const players = useStore((s) => s.players)

  const me = players.find((p) => p.id === claimedPlayerId)
  const myTeam = me?.teamId ? teams.find((t) => t.id === me.teamId) : null

  // All cards currently held by my team (not yet played)
  const heldCards = cards.filter((c) => c.heldByTeamId === myTeam?.id)

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
          <p className="text-xs text-on-surface-variant mt-0.5">{heldCards.length} card{heldCards.length !== 1 ? 's' : ''} in hand</p>
        </div>
        <div className="text-right">
          <p className="font-headline font-black text-3xl text-on-surface">{myTeam.totalPoints ?? 0}</p>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">pts</p>
        </div>
      </div>

      {/* Cards grid */}
      <div className="flex flex-wrap gap-5 justify-center">
        {heldCards.map((card, i) => (
          <GameCard key={card.id} card={card} seed={i} />
        ))}
      </div>
    </div>
  )
}
