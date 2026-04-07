import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayers } from '../hooks/usePlayers'
import { useTeams } from '../hooks/useTeams'
import { useCompetition } from '../hooks/useCompetition'
import { updateDocument, addDocument } from '../hooks/useFirestore'
import { DEFAULT_DECK } from '../lib/cards'

const TEAM_IDS = ['teamA', 'teamB', 'teamC']
const TEAM_DEFAULTS = ['Team Alpha', 'Team Beta', 'Team Gamma']

const STEPS = ['Players', 'Teams']

export default function Setup() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [playerNames, setPlayerNames] = useState(Array(15).fill(''))
  const [teamNames, setTeamNames] = useState([...TEAM_DEFAULTS])
  const [assignments, setAssignments] = useState({ teamA: [], teamB: [], teamC: [] })
  const [captains, setCaptains] = useState({ teamA: null, teamB: null, teamC: null })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const { addPlayer } = usePlayers()
  const { createTeam, setCaptain: setTeamCaptain } = useTeams()
  const { initCompetition, completeSetup } = useCompetition()

  const filledPlayers = playerNames.map((n, i) => ({ name: n.trim(), idx: i })).filter((p) => p.name)

  // ── Step 0: Players ──────────────────────────────────────────
  function handlePlayerName(i, val) {
    setPlayerNames((prev) => prev.map((n, idx) => (idx === i ? val : n)))
  }

  async function handlePlayersNext() {
    const filled = playerNames.filter((n) => n.trim())
    if (filled.length < 3) { setError('Enter at least 3 player names.'); return }
    setError(null)
    setStep(1)
  }

  // ── Step 1: Teams ────────────────────────────────────────────
  const unassigned = filledPlayers.filter(
    (p) => !Object.values(assignments).flat().includes(p.idx)
  )

  function assignPlayer(playerIdx, teamId) {
    setAssignments((prev) => {
      const next = { ...prev }
      for (const tid of TEAM_IDS) {
        next[tid] = next[tid].filter((i) => i !== playerIdx)
      }
      if (teamId) next[teamId] = [...next[teamId], playerIdx]
      return next
    })
  }

  function randomDraw() {
    const shuffled = [...filledPlayers].sort(() => Math.random() - 0.5)
    const newAssignments = { teamA: [], teamB: [], teamC: [] }
    shuffled.forEach((p, i) => {
      newAssignments[TEAM_IDS[i % 3]].push(p.idx)
    })
    setAssignments(newAssignments)
    const newCaptains = {}
    for (const tid of TEAM_IDS) {
      newCaptains[tid] = newAssignments[tid][0] ?? null
    }
    setCaptains(newCaptains)
  }

  async function handleTeamsNext() {
    const totalAssigned = Object.values(assignments).flat().length
    if (totalAssigned < filledPlayers.length) {
      setError('Assign all players to a team.')
      return
    }
    if (Object.values(captains).some((c) => c === null)) {
      setError('Each team needs a captain.')
      return
    }
    setError(null)
    await handleFinish()
  }

  // ── Final submit ──────────────────────────────────────────────
  async function handleFinish() {
    setSubmitting(true)
    setError(null)
    try {
      await initCompetition()

      const playerIdMap = {}
      for (const p of filledPlayers) {
        const ref = await addPlayer(p.name, false)
        playerIdMap[p.idx] = ref.id
      }

      for (const tid of TEAM_IDS) {
        const tIdx = TEAM_IDS.indexOf(tid)
        await createTeam(tid, teamNames[tIdx])
        for (const pidx of assignments[tid]) {
          const playerId = playerIdMap[pidx]
          await updateDocument('players', playerId, { teamId: tid })
          if (captains[tid] === pidx) {
            await updateDocument('players', playerId, { isCaptain: true, teamId: tid })
            await setTeamCaptain(tid, playerId)
          }
        }
      }

      // Auto-seed the pre-made deck
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

  return (
    <main className="pt-28 pb-32 px-5 max-w-2xl mx-auto">
      {/* Header */}
      <section className="mb-6">
        <h2 className="font-headline font-extrabold text-4xl text-secondary leading-tight">Setup</h2>
        <p className="font-body text-on-surface-variant mt-1">Configure your invitational.</p>
      </section>

      {/* Step pills */}
      <div className="flex gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
              i === step
                ? 'bg-primary-container text-on-primary'
                : i < step
                ? 'bg-secondary text-on-secondary'
                : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            {i < step ? '✓ ' : ''}{label}
          </div>
        ))}
      </div>

      {/* ── Step 0: Players ── */}
      {step === 0 && (
        <div className="space-y-3">
          {playerNames.map((name, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => handlePlayerName(i, e.target.value)}
                placeholder={`Player ${i + 1}`}
                className="flex-1 bg-surface-container-high rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/50 outline-none focus:bg-surface-container-lowest transition-colors"
              />
            </div>
          ))}
          {error && <p className="text-sm font-semibold text-error">{error}</p>}
          <button
            onClick={handlePlayersNext}
            className="w-full mt-4 py-4 rounded-full bg-primary-container text-on-primary font-bold shadow-[0_4px_12px_rgba(181,35,48,0.25)] active:scale-95 transition-transform"
          >
            Next: Assign Teams →
          </button>
        </div>
      )}

      {/* ── Step 1: Teams ── */}
      {step === 1 && (
        <div className="space-y-5">
          <button
            onClick={randomDraw}
            className="w-full py-3.5 rounded-full bg-secondary text-on-secondary font-bold active:scale-95 transition-transform"
          >
            🎲 Random Draw
          </button>

          {TEAM_IDS.map((tid, ti) => (
            <div key={tid} className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <input
                value={teamNames[ti]}
                onChange={(e) => setTeamNames((prev) => prev.map((n, i) => (i === ti ? e.target.value : n)))}
                className="font-headline font-bold text-lg text-on-surface bg-transparent border-b border-surface-container w-full outline-none mb-4 pb-1"
              />
              <div className="flex flex-wrap gap-2 min-h-[40px]">
                {assignments[tid].map((pidx) => {
                  const p = filledPlayers.find((fp) => fp.idx === pidx)
                  const isCap = captains[tid] === pidx
                  return p ? (
                    <div key={pidx} className="flex items-center gap-1">
                      <button
                        onClick={() => assignPlayer(pidx, null)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${isCap ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface-variant'}`}
                      >
                        {p.name}{isCap ? ' (C)' : ''}
                      </button>
                      {!isCap && (
                        <button
                          onClick={() => setCaptains((prev) => ({ ...prev, [tid]: pidx }))}
                          title="Set as captain"
                          className="text-[10px] text-secondary font-bold px-1.5 py-1 bg-secondary-fixed rounded-full"
                        >
                          C
                        </button>
                      )}
                    </div>
                  ) : null
                })}
              </div>
              {unassigned.length > 0 && (
                <div className="mt-3 pt-3 border-t border-surface-container">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-2">Add player</p>
                  <div className="flex flex-wrap gap-1.5">
                    {unassigned.map((p) => (
                      <button
                        key={p.idx}
                        onClick={() => assignPlayer(p.idx, tid)}
                        className="px-2.5 py-1 rounded-full text-xs bg-primary-fixed/30 text-on-primary-container font-medium"
                      >
                        + {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {error && <p className="text-sm font-semibold text-error">{error}</p>}
          <div className="flex gap-3">
            <button onClick={() => { setStep(0); setError(null) }} className="flex-1 py-3.5 rounded-full text-sm font-bold text-primary">Back</button>
            <button
              onClick={handleTeamsNext}
              disabled={submitting}
              className="flex-[2] py-3.5 rounded-full bg-primary-container text-on-primary font-bold shadow-[0_4px_12px_rgba(181,35,48,0.25)] active:scale-95 transition-transform disabled:opacity-50"
            >
              {submitting ? 'Setting up…' : '🚀 Shuffle & Start'}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
