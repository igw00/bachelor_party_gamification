import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayers } from '../hooks/usePlayers'
import { useTeams } from '../hooks/useTeams'
import { useCompetition } from '../hooks/useCompetition'
import { updateDocument, addDocument } from '../hooks/useFirestore'
import { DEFAULT_DECK } from '../lib/cards'

const TEAM_IDS = ['teamA', 'teamB', 'teamC']
const TEAM_DEFAULTS = ['Team Alpha', 'Team Beta', 'Team Gamma']

export default function Setup() {
  const navigate = useNavigate()
  const [teamNames, setTeamNames] = useState([...TEAM_DEFAULTS])
  const [assignments, setAssignments] = useState({ teamA: [], teamB: [], teamC: [] })
  const [captains, setCaptains] = useState({ teamA: null, teamB: null, teamC: null })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const { players } = usePlayers()
  const { createTeam, setCaptain: setTeamCaptain } = useTeams()
  const { initCompetition, completeSetup } = useCompetition()

  const assigned = Object.values(assignments).flat()
  const unassigned = players.filter((p) => !assigned.includes(p.id))

  function assignPlayer(playerId, teamId) {
    setAssignments((prev) => {
      const next = { ...prev }
      for (const tid of TEAM_IDS) {
        next[tid] = next[tid].filter((id) => id !== playerId)
      }
      if (teamId) next[teamId] = [...next[teamId], playerId]
      return next
    })
  }

  function randomDraw() {
    const shuffled = [...players].sort(() => Math.random() - 0.5)
    const newAssignments = { teamA: [], teamB: [], teamC: [] }
    shuffled.forEach((p, i) => {
      newAssignments[TEAM_IDS[i % 3]].push(p.id)
    })
    setAssignments(newAssignments)
    const newCaptains = {}
    for (const tid of TEAM_IDS) {
      newCaptains[tid] = newAssignments[tid][0] ?? null
    }
    setCaptains(newCaptains)
  }

  async function handleFinish() {
    if (assigned.length < players.length) {
      setError('Assign all players to a team.')
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
        <p className="font-body text-on-surface-variant mt-1">Assign teams and designate captains.</p>
      </section>

      <div className="space-y-5">
        <button
          onClick={randomDraw}
          className="w-full py-3.5 rounded-full bg-secondary text-on-secondary font-bold active:scale-95 transition-transform"
        >
          🎲 Random Draw
        </button>

        {TEAM_IDS.map((tid, ti) => {
          const teamPlayers = assignments[tid].map((pid) => players.find((p) => p.id === pid)).filter(Boolean)
          return (
            <div key={tid} className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <input
                value={teamNames[ti]}
                onChange={(e) => setTeamNames((prev) => prev.map((n, i) => (i === ti ? e.target.value : n)))}
                className="font-headline font-bold text-lg text-on-surface bg-transparent border-b border-surface-container w-full outline-none mb-4 pb-1"
              />
              <div className="flex flex-wrap gap-2 min-h-[40px]">
                {teamPlayers.map((p) => {
                  const isCap = captains[tid] === p.id
                  return (
                    <div key={p.id} className="flex items-center gap-1">
                      <button
                        onClick={() => assignPlayer(p.id, null)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${isCap ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface-variant'}`}
                      >
                        {p.name}{isCap ? ' (C)' : ''}
                      </button>
                      {!isCap && (
                        <button
                          onClick={() => setCaptains((prev) => ({ ...prev, [tid]: p.id }))}
                          title="Set as captain"
                          className="text-[10px] text-secondary font-bold px-1.5 py-1 bg-secondary-fixed rounded-full"
                        >
                          C
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              {unassigned.length > 0 && (
                <div className="mt-3 pt-3 border-t border-surface-container">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-2">Add player</p>
                  <div className="flex flex-wrap gap-1.5">
                    {unassigned.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => assignPlayer(p.id, tid)}
                        className="px-2.5 py-1 rounded-full text-xs bg-primary-fixed/30 text-on-primary-container font-medium"
                      >
                        + {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {error && <p className="text-sm font-semibold text-error">{error}</p>}

        <button
          onClick={handleFinish}
          disabled={submitting}
          className="w-full py-4 rounded-full bg-primary-container text-on-primary font-bold shadow-[0_4px_12px_rgba(181,35,48,0.25)] active:scale-95 transition-transform disabled:opacity-50"
        >
          {submitting ? 'Setting up…' : '🚀 Shuffle & Start'}
        </button>
      </div>
    </main>
  )
}
