import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { devReset } from '../lib/devReset'
import { usePlayers } from '../hooks/usePlayers'
import { useTeams } from '../hooks/useTeams'
import { useCompetition } from '../hooks/useCompetition'
import { useIdentity } from '../hooks/useIdentity'
import { updateDocument, mergeDocument, addDocument } from '../hooks/useFirestore'
import { DEFAULT_DECK } from '../lib/cards'

const COMMISSIONER_NAME = 'Ian Waltz'

const TEAM_IDS = ['teamA', 'teamB', 'teamC']
const TEAM_DEFAULTS = ['Team Alpha', 'Team Beta', 'Team Gamma']
const TEAM_COLORS = [
  'bg-primary-container text-on-primary',
  'bg-secondary text-on-secondary',
  'bg-tertiary text-on-tertiary',
]

// ── Post-setup team editor (commissioner only) ────────────────────────────────

function ManageTeams({ players, teams }) {
  const [saving, setSaving] = useState(null) // playerId currently saving
  const [saved, setSaved] = useState({})     // { playerId: true } flash state

  const assignedPlayers = players.filter((p) => p.teamId)

  async function handleTeamChange(player, newTeamId) {
    if (newTeamId === player.teamId) return
    setSaving(player.id)
    try {
      await updateDocument('players', player.id, { teamId: newTeamId })
      setSaved((prev) => ({ ...prev, [player.id]: true }))
      setTimeout(() => setSaved((prev) => ({ ...prev, [player.id]: false })), 1500)
    } finally {
      setSaving(null)
    }
  }

  // Group by current team
  const byTeam = {}
  teams.forEach((t) => { byTeam[t.id] = [] })
  assignedPlayers.forEach((p) => {
    if (byTeam[p.teamId]) byTeam[p.teamId].push(p)
  })

  return (
    <div className="space-y-4">
      {teams.map((team) => (
        <div key={team.id} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          {/* Team header */}
          <div className="px-4 py-3 bg-surface-container flex items-center justify-between">
            <span className="font-headline font-bold text-base text-on-surface">{team.name}</span>
            <span className="text-xs text-on-surface-variant font-medium">
              {(byTeam[team.id] ?? []).length} players
            </span>
          </div>

          {/* Players */}
          <div className="divide-y divide-surface-container">
            {(byTeam[team.id] ?? [])
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((player) => (
                <div key={player.id} className="flex items-center justify-between px-4 py-3 gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-semibold text-on-surface truncate">
                      {player.isGroom ? `${player.name} 💍` : player.name}
                    </span>
                    {player.isCaptain && (
                      <span className="text-[9px] font-black bg-secondary-fixed text-secondary px-1.5 py-0.5 rounded-full flex-shrink-0">C</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {saved[player.id] && (
                      <span className="material-symbols-outlined text-sm text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                    )}
                    <select
                      value={player.teamId}
                      onChange={(e) => handleTeamChange(player, e.target.value)}
                      disabled={saving === player.id}
                      className="text-xs font-bold bg-surface-container text-on-surface rounded-lg px-2 py-1.5 outline-none border border-surface-container-highest disabled:opacity-50"
                    >
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main Setup page ───────────────────────────────────────────────────────────

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
  const { teams, createTeam, setCaptain: setTeamCaptain } = useTeams()
  const { competition, initCompetition, completeSetup } = useCompetition()
  const { claimedPlayerId } = useIdentity()
  const isCommissioner = players.find((p) => p.id === claimedPlayerId)?.name === COMMISSIONER_NAME

  const setupComplete = competition?.setupComplete === true

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

      const teamWrites = TEAM_IDS.map(async (tid) => {
        const tIdx = TEAM_IDS.indexOf(tid)
        await createTeam(tid, teamNames[tIdx])
        await Promise.all(
          assignments[tid].map((pid) => {
            const playerData = { teamId: tid, isCaptain: captains[tid] === pid }
            const ops = [mergeDocument('players', pid, playerData)]
            if (captains[tid] === pid) ops.push(setTeamCaptain(tid, pid))
            return Promise.all(ops)
          })
        )
      })

      const cardWrites = DEFAULT_DECK
        .filter((c) => c.name.trim())
        .map((c) => addDocument('cards', { ...c, heldByTeamId: null, active: false, played: false }))

      await Promise.all([...teamWrites, ...cardWrites])
      await completeSetup()

      navigate('/')
    } catch (err) {
      console.error('Setup failed:', err)
      setError(`Setup failed: ${err.message ?? 'Unknown error'}`)
      setSubmitting(false)
    }
  }

  if (players.length === 0) {
    return (
      <main className="pt-28 pb-32 px-5 max-w-2xl mx-auto space-y-4">
        <p className="text-on-surface-variant animate-pulse">Loading roster…</p>
        {isCommissioner && <DevResetButton />}
      </main>
    )
  }

  // ── Post-setup view for commissioner ──
  if (setupComplete && isCommissioner) {
    return (
      <main className="pt-28 pb-32 px-5 max-w-2xl mx-auto">
        <section className="mb-6">
          <h2 className="font-headline font-extrabold text-4xl text-secondary leading-tight">Manage Teams</h2>
          <p className="font-body text-on-surface-variant mt-1">Move players between teams. Changes save instantly.</p>
        </section>

        <ManageTeams players={players} teams={teams} />

        <div className="mt-6 space-y-3">
          <DevResetButton />
        </div>
      </main>
    )
  }

  // ── Post-setup view for non-commissioner ──
  if (setupComplete) {
    return (
      <main className="pt-28 pb-32 px-5 max-w-2xl mx-auto">
        <section className="mb-6">
          <h2 className="font-headline font-extrabold text-4xl text-secondary leading-tight">Setup</h2>
        </section>
        <div className="bg-surface-container-lowest rounded-xl p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-tertiary mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          <p className="font-headline font-bold text-lg text-on-surface">Competition is live</p>
          <p className="text-sm text-on-surface-variant mt-1">Teams have been set. Check the Scoreboard.</p>
        </div>
      </main>
    )
  }

  // ── Draft view ──
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
                    className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold leading-none ${isCap ? TEAM_COLORS[ti] : 'bg-surface-container text-on-surface-variant'}`}
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
            {lastDrawn && (
              <div className={`rounded-2xl p-5 text-center ${TEAM_COLORS[TEAM_IDS.indexOf(lastDrawn.teamId)]}`}>
                <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">
                  {lastDrawn.teamName}{lastDrawn.isCaptain ? ' — Captain' : ''}
                </p>
                <p className="font-headline font-black text-3xl">{lastDrawn.player.name}</p>
              </div>
            )}

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

        {isCommissioner && <DevResetButton />}
      </div>
    </main>
  )
}

// ── Dev/commissioner reset ────────────────────────────────────────────────────

function DevResetButton() {
  const [resetting, setResetting] = useState(false)
  const [confirm, setConfirm] = useState(false)

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
        className="w-full py-3 rounded-full border border-dashed border-error/40 text-error text-sm font-bold active:scale-95 transition-transform"
      >
        Reset All Data
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-error/30 bg-error/5 p-4 space-y-3 text-center">
      <p className="text-sm font-bold text-error">This wipes all teams, events, cards, and unclaims all players.</p>
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
