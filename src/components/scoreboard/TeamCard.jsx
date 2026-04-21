import { useState } from 'react'
import ProgressBar from './ProgressBar'
import CardHandPreview from './CardHandPreview'
import PlayerRow from './PlayerRow'
import { swapPlayersAction } from '../../hooks/usePlayers'

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

function SwapModal({ source, sourceTeam, allPlayers, allTeams, onConfirm, onClose }) {
  const [target, setTarget] = useState(null)
  const [swapping, setSwapping] = useState(false)

  const otherPlayers = allPlayers
    .filter((p) => p.teamId && p.teamId !== sourceTeam.id)
    .sort((a, b) => {
      if (a.teamId !== b.teamId) return a.teamId.localeCompare(b.teamId)
      return (a.name ?? '').localeCompare(b.name ?? '')
    })

  async function handleConfirm() {
    if (!target) return
    const targetTeam = allTeams.find((t) => t.id === target.teamId)
    if (!targetTeam) return
    setSwapping(true)
    try {
      await swapPlayersAction(source, sourceTeam, target, targetTeam)
      onConfirm()
    } finally {
      setSwapping(false)
    }
  }

  let currentGroupTeamId = null

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-5"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
    >
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-secondary px-5 py-4">
          <p className="font-headline font-black text-on-secondary text-lg">Swap Player</p>
          <p className="text-on-secondary/70 text-sm mt-0.5">
            Swapping <span className="font-bold">{source.name}</span> with…
          </p>
        </div>

        {/* Player list */}
        <div className="overflow-y-auto max-h-72 divide-y divide-surface-container">
          {otherPlayers.map((p) => {
            const team = allTeams.find((t) => t.id === p.teamId)
            const showTeamLabel = p.teamId !== currentGroupTeamId
            if (showTeamLabel) currentGroupTeamId = p.teamId
            const isSelected = target?.id === p.id

            return (
              <div key={p.id}>
                {showTeamLabel && (
                  <div className="px-4 py-1.5 bg-surface-container">
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                      {team?.name ?? p.teamId}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setTarget(p)}
                  className={`w-full flex items-center justify-between px-5 py-3 text-left transition-colors
                    ${isSelected ? 'bg-secondary/10' : 'active:bg-surface-container'}`}
                >
                  <div>
                    <span className="font-semibold text-sm text-on-surface">{p.name}</span>
                    {p.isCaptain && (
                      <span className="ml-2 text-[9px] font-black bg-secondary-fixed text-secondary px-1.5 py-0.5 rounded-full">C</span>
                    )}
                    <span className="ml-2 text-xs text-on-surface-variant">{p.individualPoints ?? 0} pts</span>
                  </div>
                  {isSelected && (
                    <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-surface-container">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full text-sm font-bold text-on-surface-variant bg-surface-container active:scale-95 transition-transform"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!target || swapping}
            className="flex-[2] py-3 rounded-full text-sm font-bold bg-secondary text-on-secondary active:scale-95 transition-transform disabled:opacity-40"
          >
            {swapping ? 'Swapping…' : 'Confirm Swap'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TeamCard({ team, rank, players = [], cards = [], events = [], allTeams = [], claimedPlayerId = null }) {
  const [expanded, setExpanded] = useState(rank === 0)
  const [swapSource, setSwapSource] = useState(null)

  const heldCards = cards.filter((c) => c.heldByTeamId === team.id && !c.played)
  const activeCards = heldCards.filter((c) => c.active)
  const teamPlayers = players
    .filter((p) => p.teamId === team.id)
    .sort((a, b) => (b.individualPoints ?? 0) - (a.individualPoints ?? 0))

  const claimedPlayer = players.find((p) => p.id === claimedPlayerId)
  const isCaptainOfThisTeam = claimedPlayer?.teamId === team.id && claimedPlayer?.isCaptain

  const isLeader = rank === 0

  return (
    <>
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
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <PlayerRow player={p} events={events} />
                  </div>
                  {isCaptainOfThisTeam && (
                    <button
                      onClick={() => setSwapSource(p)}
                      className="ml-2 flex-shrink-0 p-1.5 rounded-full text-on-surface-variant/50 active:bg-surface-container active:text-secondary transition-colors"
                      title={`Swap ${p.name}`}
                    >
                      <span className="material-symbols-outlined text-base">swap_horiz</span>
                    </button>
                  )}
                </div>
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

      {/* Swap modal — rendered outside card so it's not clipped */}
      {swapSource && (
        <SwapModal
          source={swapSource}
          sourceTeam={team}
          allPlayers={players}
          allTeams={allTeams}
          onConfirm={() => setSwapSource(null)}
          onClose={() => setSwapSource(null)}
        />
      )}
    </>
  )
}
