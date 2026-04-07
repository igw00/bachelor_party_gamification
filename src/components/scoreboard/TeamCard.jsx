import { useState } from 'react'
import ProgressBar from './ProgressBar'
import CardHandPreview from './CardHandPreview'
import PlayerRow from './PlayerRow'

const RANK_LABELS = ['1st', '2nd', '3rd']
const RANK_STYLES = [
  'bg-primary text-on-primary',
  'bg-secondary/10 text-secondary',
  'bg-surface-container text-on-surface-variant',
]
const BORDER_STYLES = [
  'border-l-4 border-primary',
  'border-l-4 border-secondary/40',
  'border-l-4 border-surface-container-highest',
]

export default function TeamCard({ team, rank, players = [], cards = [], events = [] }) {
  const [expanded, setExpanded] = useState(rank === 0)

  const heldCards = cards.filter((c) => c.heldByTeamId === team.id && !c.played)
  const activeCards = heldCards.filter((c) => c.active)
  const teamPlayers = players
    .filter((p) => p.teamId === team.id)
    .sort((a, b) => (b.individualPoints ?? 0) - (a.individualPoints ?? 0))

  const isLeader = rank === 0

  return (
    <div
      className={`relative bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all ${BORDER_STYLES[rank]} overflow-hidden`}
    >
      {/* Leader accent blob */}
      {isLeader && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 -z-0 pointer-events-none" />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <span className={`font-headline font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-tighter ${RANK_STYLES[rank]}`}>
              {RANK_LABELS[rank]}
            </span>
            <h3 className="font-headline font-bold text-2xl text-on-surface">{team.name}</h3>
          </div>
          <div className="flex flex-col items-end">
            <span className={`font-headline font-extrabold text-5xl tracking-tighter ${isLeader ? 'text-primary' : 'text-on-surface'}`}>
              {team.totalPoints ?? 0}
            </span>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Points</span>
          </div>
        </div>

        {/* Progress + cards */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <div className="flex-1">
              <ProgressBar totalPoints={team.totalPoints ?? 0} />
            </div>
            <div className="ml-3 mb-5">
              <CardHandPreview held={heldCards.length} active={activeCards.length} />
            </div>
          </div>
        </div>

        {/* Expandable player list */}
        {expanded ? (
          <div className="pt-4 border-t border-surface-container space-y-0 divide-y divide-surface-container">
            {teamPlayers.map((p) => (
              <PlayerRow key={p.id} player={p} events={events} />
            ))}
            <button
              onClick={() => setExpanded(false)}
              className="w-full pt-3 text-xs font-bold text-secondary flex items-center justify-center gap-1"
            >
              Hide <span className="material-symbols-outlined text-sm">keyboard_arrow_up</span>
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <span className="text-[10px] font-medium text-on-surface-variant bg-surface-container px-2 py-1 rounded-full">
                {teamPlayers.length} players
              </span>
            </div>
            <button
              onClick={() => setExpanded(true)}
              className="text-xs font-bold text-secondary flex items-center gap-1"
            >
              Details <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
