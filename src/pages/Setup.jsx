import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayers } from '../hooks/usePlayers'
import { useTeams } from '../hooks/useTeams'
import { useCompetition } from '../hooks/useCompetition'
import { updateDocument, addDocument } from '../hooks/useFirestore'
import { DEFAULT_DECK } from '../lib/cards'

const TEAM_IDS = ['teamA', 'teamB', 'teamC']
const TEAM_DEFAULTS = ['Team Alpha', 'Team Beta', 'Team Gamma']
const TEAM_COLORS = [
  'bg-primary-container text-on-primary',
  'bg-secondary text-on-secondary',
  'bg-tertiary text-on-tertiary',
]

export default function Setup() {
  const navigate = useNavigate()
  const [teamNames, setTeamNames] = useState([...TEAM_DEFAULTS])
  const [assignments, setAssignments] = useState({ teamA: [], teamB: [], teamC: [] })
  const [captains, setCaptains] = useState({ teamA: null, teamB: null, teamC: null })
  const [pool, setPool] = useState(null) // null = not started
  const [pickIndex, setPickIndex] = useState(0)
  const [lastDrawn, setLastDrawn] = useState(null) // { player, teamId, teamName }
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const { players } = usePlayers()
  const { createTeam, setCaptain: setTeamCaptain } = useTeams()
  const { initCompetition, completeSetup } = useCompetition()

  const totalAssigned = Object.values(assignments).flat().length
  const allAssigned = players.length > 0 && totalAssigned === players.length
  const draftStarted = pool !== null
  const nextTeamIdx = pickIndex % 3
  const nextTeamId = TEAM_IDS[nextTeamIdx]
  const nextTeamName = teamNames[nextTeamIdx]

  function startDraft() {
    const shuffled = [...players].sort(() => Math.random() - 0.5).map((p) => p.id)
    setPool(shuffled)
    setPickIndex(0)
    setAssignments({ teamA: [], teamB: [], teamC: [] })
    setCaptains({ teamA: null, teamB: null, teamC: null })
    setLastDrawn(null)
  }

  function drawNext() {
    if (!pool || pool.length === 0) return
    const [nextId, ...remaining] = pool
    const teamId = TEAM_IDS[pickIndex % 3]
    const player = players.find((p) => p.id === nextId)
    const isFirstForTeam = assignments[teamId].length === 0

    setAssignments((prev) => ({ ...prev, [teamId]: [...prev[teamId], nextId] }))
    if (isFirstForTeam) {
      setCaptains((prev) => ({ ...prev, [teamId]: nextId }))
    }
    setLastDrawn({ player, teamId, teamName: teamNames[TEAM_IDS.indexOf(teamId)], isCaptain: isFirstForTeam })
    setPool(remaining)
    setPickIndex((i) => i + 1)
  }

  async function handleFinish() {
    if (!allAssigned) {
      setError('Complete the draft first.')
      return
    }
    if (Object.values(captains).some((c) => c === null)) {
      setError('Each team needs a captain.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await initCompetition()

      for (const tid of TEAM_IDS) {
        const tIdx = TEAM_IDS.indexOf(tid)
        await createTeam(tid, teamNames[tIdx])
        for (const pid of assignments[tid]) {
          await updateDocument('players', pid, { teamId: tid })
          if (captains[tid] === pid) {
            await updateDocument('players', pid, { isCaptain: true })
            await setTeamCaptain(tid, pid)
          }
        }
      }

      await Promise.all(
        DEFAULT_DECK
          .filter((c) => c.name.trim())
          .map((c) => addDocument('cards', { ...c, heldByTeamId: null, active: false, played: false }))
      )

      await completeSetup()
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (players.length === 0) {
    return (
      <main className="pt-28 pb-32 px-5 max-w-2xl mx-auto">
        <p className="text-on-surface-variant animate-pulse">Loading roster…</p>
      </main>
    )
  }

  return (
    <main className="pt-28 pb-32 px-5 max-w-2xl mx-auto">
      <section className="mb-6">
        <h2 className="font-headline font-extrabold text-4xl text-secondary leading-tight">Setup</h2>
        <p className="font-body text-on-surface-variant mt-1">Draft players into teams.</p>
      </section>

      {/* Team name editors */}
      <div className="space-y-3 mb-6">
        {TEAM_IDS.map((tid, ti) => (
          <div key={tid} className="bg-surface-container-lowest rounded-xl px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <input
              value={teamNames[ti]}
              onChange={(e) => setTeamNames((prev) => prev.map((n, i) => (i === ti ? e.target.value : n)))}
              className="font-headline font-bold text-base text-on-surface bg-transparent border-b border-surface-container w-full outline-none pb-1 mb-3"
            />
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {assignments[tid].map((pid) => {
                const p = players.find((pl) => pl.id === pid)
                if (!p) return null
                const isCap = captains[tid] === pid
                return (
                  <span
                    key={pid}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${isCap ? TEAM_COLORS[ti] : 'bg-surface-container text-on-surface-variant'}`}
                  >
                    {p.name}{isCap ? ' (C)' : ''}
                  </span>
                )
              })}
              {assignments[tid].length === 0 && (
                <span className="text-xs text-on-surface-variant italic">No players yet</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Draft controls */}
      <div className="space-y-4">
        {!draftStarted && (
          <button
            onClick={startDraft}
            className="w-full py-4 rounded-full bg-secondary text-on-secondary font-bold active:scale-95 transition-transform"
          >
            🎲 Start Draft
          </button>
        )}

        {draftStarted && !allAssigned && (
          <>
            {/* Last drawn result */}
            {lastDrawn && (
              <div className={`rounded-2xl p-5 text-center ${TEAM_COLORS[TEAM_IDS.indexOf(lastDrawn.teamId)]}`}>
                <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">
                  {lastDrawn.teamName}{lastDrawn.isCaptain ? ' — Captain' : ''}
                </p>
                <p className="font-headline font-black text-3xl">{lastDrawn.player.name}</p>
              </div>
            )}

            {/* Next up indicator + draw button */}
            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                Pick {totalAssigned + 1} of {players.length}
              </p>
              <p className="font-headline font-semibold text-on-surface mb-4">
                Next → <span className="text-secondary">{nextTeamName}</span>
              </p>
              <button
                onClick={drawNext}
                className="w-full py-3.5 rounded-full bg-primary-container text-on-primary font-bold active:scale-95 transition-transform"
              >
                Draw Player
              </button>
            </div>

            <button
              onClick={startDraft}
              className="w-full py-2 rounded-full text-sm text-on-surface-variant font-medium active:scale-95 transition-transform"
            >
              ↺ Restart Draft
            </button>
          </>
        )}

        {allAssigned && (
          <>
            {lastDrawn && (
              <div className={`rounded-2xl p-5 text-center ${TEAM_COLORS[TEAM_IDS.indexOf(lastDrawn.teamId)]}`}>
                <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">
                  Last pick — {lastDrawn.teamName}
                </p>
                <p className="font-headline font-black text-3xl">{lastDrawn.player.name}</p>
              </div>
            )}
            <p className="text-center text-sm font-semibold text-secondary">Draft complete — all {players.length} players assigned.</p>
          </>
        )}

        {error && <p className="text-sm font-semibold text-error">{error}</p>}

        {allAssigned && (
          <button
            onClick={handleFinish}
            disabled={submitting}
            className="w-full py-4 rounded-full bg-primary-container text-on-primary font-bold shadow-[0_4px_12px_rgba(181,35,48,0.25)] active:scale-95 transition-transform disabled:opacity-50"
          >
            {submitting ? 'Setting up…' : '🚀 Start Competition'}
          </button>
        )}
      </div>
    </main>
  )
}
