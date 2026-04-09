import { useNavigate } from 'react-router-dom'
import { useTeams } from '../hooks/useTeams'
import { usePlayers } from '../hooks/usePlayers'
import { useCards } from '../hooks/useCards'
import { useCompetition } from '../hooks/useCompetition'
import { useCollection } from '../hooks/useFirestore'
import { useIdentity } from '../hooks/useIdentity'
import useStore from '../store/useStore'
import TeamCard from '../components/scoreboard/TeamCard'
import { useCallback, useState } from 'react'
import { devReset } from '../lib/devReset'

const IS_DEV = import.meta.env.VITE_APP_ENV === 'dev'

const COMMISSIONER_NAME = 'Ian Waltz'

export default function Scoreboard() {
  const navigate = useNavigate()
  const { teams } = useTeams()
  const { players } = usePlayers()
  const { cards } = useCards()
  const { competition } = useCompetition()
  const { events, setEvents } = useStore()
  const { claimedPlayerId } = useIdentity()
  const claimedPlayer = players.find((p) => p.id === claimedPlayerId) ?? null
  const isCommissioner = claimedPlayer?.name === COMMISSIONER_NAME

  useCollection('events', useCallback(setEvents, [setEvents]))

  const sortedTeams = [...teams].sort((a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0))

  // Fastest mover: player with most points in last 5 events
  const recentEvents = [...events]
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
    .slice(0, 10)

  const moveCounts = {}
  recentEvents.forEach((e) => {
    if (e.playerId) moveCounts[e.playerId] = (moveCounts[e.playerId] || 0) + (e.pointsIndividual || 0)
  })
  const fastestMoverId = Object.entries(moveCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
  const fastestMover = players.find((p) => p.id === fastestMoverId)

  return (
    <main className="pt-28 pb-32 px-5 max-w-2xl mx-auto space-y-4">
      {/* Title */}
      <section className="mb-6">
        <h2 className="font-headline font-extrabold text-4xl text-secondary leading-tight">
          Current Standings
        </h2>
        <p className="font-body text-on-surface-variant mt-1">
          Live updates from the St. Petersburg fields.
        </p>
      </section>

      {sortedTeams.length === 0 && (
        <div className="bg-surface-container-lowest rounded-xl p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">
            sports
          </span>
          {competition?.setupComplete === false && competition?.currentDay ? (
            <>
              <p className="font-headline font-bold text-lg text-on-surface mb-2 animate-pulse">Setting up teams…</p>
              <p className="text-sm text-on-surface-variant mb-4">Hold tight, this only takes a moment.</p>
              {IS_DEV && isCommissioner && <ScoreboardDevReset navigate={navigate} />}
            </>
          ) : isCommissioner ? (
            <>
              <p className="font-headline font-bold text-lg text-on-surface mb-1">No teams yet</p>
              <p className="text-sm text-on-surface-variant mb-4">Complete setup to get started.</p>
              <button
                onClick={() => navigate('/setup')}
                className="bg-primary-container text-on-primary font-bold px-6 py-3 rounded-full text-sm active:scale-95 transition-transform"
              >
                Go to Setup
              </button>
            </>
          ) : (
            <>
              <p className="font-headline font-bold text-lg text-on-surface mb-2">Draft not started yet</p>
              <p className="text-sm text-on-surface-variant">Please wait for Ian Waltz to complete the draft.</p>
            </>
          )}
        </div>
      )}

      {sortedTeams.map((team, i) => (
        <TeamCard
          key={team.id}
          team={team}
          rank={i}
          players={players}
          cards={cards}
          events={events}
        />
      ))}

      {/* Bento insight cards */}
      {sortedTeams.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-tertiary-container/10 p-5 rounded-xl">
            <span className="material-symbols-outlined text-tertiary mb-2 block">trending_up</span>
            <p className="text-xs font-bold text-tertiary uppercase tracking-wider">Fastest Mover</p>
            <p className="font-headline font-bold text-lg mt-1 text-on-tertiary-container">
              {fastestMover
                ? fastestMover.isGroom
                  ? `${fastestMover.name} 💍`
                  : fastestMover.name
                : '—'}
            </p>
          </div>
          <div className="bg-primary-fixed/30 p-5 rounded-xl">
            <span className="material-symbols-outlined text-primary mb-2 block">emoji_events</span>
            <p className="text-xs font-bold text-primary uppercase tracking-wider">Day {competition?.currentDay ?? 1}</p>
            <p className="font-headline font-bold text-lg mt-1 text-on-primary-container">
              {sortedTeams[0]?.name ?? '—'}
            </p>
            <p className="text-[10px] text-primary">Leading</p>
          </div>
        </div>
      )}
    </main>
  )
}

function ScoreboardDevReset({ navigate }) {
  const [confirm, setConfirm] = useState(false)
  const [resetting, setResetting] = useState(false)

  async function handleReset() {
    setResetting(true)
    try {
      await devReset()
    } finally {
      window.location.reload()
    }
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="mt-2 w-full py-2.5 rounded-full border border-dashed border-error/40 text-error text-sm font-bold active:scale-95 transition-transform"
      >
        DEV: Reset All Data
      </button>
    )
  }

  return (
    <div className="mt-2 rounded-xl border border-error/30 bg-error/5 p-4 space-y-3">
      <p className="text-sm font-bold text-error">Wipes all teams, events, cards, and resets players.</p>
      <div className="flex gap-3">
        <button
          onClick={() => setConfirm(false)}
          className="flex-1 py-2.5 rounded-full text-sm font-bold text-on-surface-variant"
        >
          Cancel
        </button>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="flex-[2] py-2.5 rounded-full bg-error text-white text-sm font-bold active:scale-95 transition-transform disabled:opacity-50"
        >
          {resetting ? 'Resetting…' : 'Yes, reset everything'}
        </button>
      </div>
    </div>
  )
}
