import useStore from '../../store/useStore'
import GameCard from './GameCard'

const TYPE_BADGE = {
  Power: 'bg-secondary/10 text-secondary',
  Chaos: 'bg-primary/10 text-primary',
  Wild: 'bg-tertiary/15 text-tertiary',
}

function timeAgo(seconds) {
  if (!seconds) return 'just now'
  const diff = Math.floor(Date.now() / 1000) - seconds
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function CardHistoryFeed() {
  const cards = useStore((s) => s.cards)
  const teams = useStore((s) => s.teams)
  const players = useStore((s) => s.players)

  // Only cards that have been drawn (have a drawnByTeamId), sorted newest first
  const drawn = [...cards.filter((c) => c.drawnByTeamId)]
    .sort((a, b) => (b.drawnAt?.seconds ?? 0) - (a.drawnAt?.seconds ?? 0))

  if (drawn.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-6">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3">history</span>
        <p className="font-headline font-bold text-on-surface text-lg">No cards played yet</p>
        <p className="text-sm text-on-surface-variant mt-1">Drawn cards will appear here as a feed.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-2 pb-4">
      {drawn.map((card, i) => {
        const team = teams.find((t) => t.id === card.drawnByTeamId)
        const player = players.find((p) => p.id === card.drawnByPlayerId)
        const teamInitials = team?.name?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() ?? '?'

        return (
          <div key={card.id} className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
            {/* Post header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-container">
              {/* Team avatar */}
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <span className="font-headline font-black text-on-secondary text-[11px]">{teamInitials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-headline font-bold text-sm text-on-surface truncate">
                  {team?.name ?? 'Unknown team'}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {player ? `${player.name} drew a card` : 'drew a card'}
                  {' · '}
                  {timeAgo(card.drawnAt?.seconds)}
                </p>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0 ${TYPE_BADGE[card.type] ?? 'bg-surface-container text-on-surface-variant'}`}>
                {card.type}
              </span>
            </div>

            {/* Card */}
            <div className="flex justify-center py-5 px-4">
              <GameCard card={card} seed={i} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
