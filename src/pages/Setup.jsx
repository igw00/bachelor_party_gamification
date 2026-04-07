import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayers } from '../hooks/usePlayers'
import { useTeams } from '../hooks/useTeams'
import { useCompetition } from '../hooks/useCompetition'
import { updateDocument, addDocument } from '../hooks/useFirestore'
import { DEFAULT_DECK } from '../lib/cards'

const TEAM_IDS = ['teamA', 'teamB', 'teamC']
const TEAM_DEFAULTS = ['Team Alpha', 'Team Beta', 'Team Gamma']

const STEPS = ['Players', 'Teams', 'Cards']

export default function Setup() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [playerNames, setPlayerNames] = useState(Array(15).fill(''))
  const [groomIdx, setGroomIdx] = useState(null)
  const [teamNames, setTeamNames] = useState([...TEAM_DEFAULTS])
  const [assignments, setAssignments] = useState({ teamA: [], teamB: [], teamC: [] })
  const [captains, setCaptains] = useState({ teamA: null, teamB: null, teamC: null })
  const [deck, setDeck] = useState(DEFAULT_DECK)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const { addPlayer } = usePlayers()
  const { createTeam, setCaptain: setTeamCaptain } = useTeams()
  const { initCompetition, completeSetup } = useCompetition()

  // ── Step 1: Players ──────────────────────────────────────────
  function handlePlayerName(i, val) {
    setPlayerNames((prev) => prev.map((n, idx) => (idx === i ? val : n)))
  }

  async function handlePlayersNext() {
    const filled = playerNames.filter((n) => n.trim())
    if (filled.length < 3) { setError('Enter at least 3 player names.'); return }
    setError(null)
    setStep(1)
  }

  // ── Step 2: Teams ────────────────────────────────────────────
  const filledPlayers = playerNames.map((n, i) => ({ name: n.trim(), idx: i })).filter((p) => p.name)
  const unassigned = filledPlayers.filter(
    (p) => !Object.values(assignments).flat().includes(p.idx)
  )

  function assignPlayer(playerIdx, teamId) {
    setAssignments((prev) => {
      const next = { ...prev }
      // Remove from any existing team
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
    // Auto-set first player of each team as captain
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
    setStep(2)
  }

  // ── Step 3: Deck ─────────────────────────────────────────────
  function updateCard(i, field, val) {
    setDeck((prev) => prev.map((c, idx) => (idx === i ? { ...c, [field]: val } : c)))
  }

  function addCard() {
    setDeck((prev) => [...prev, { name: '', type: 'PowerUp', effectText: '', isRare: false }])
  }

  function removeCard(i) {
    setDeck((prev) => prev.filter((_, idx) => idx !== i))
  }

  // ── Final submit ──────────────────────────────────────────────
  async function handleFinish() {
    setSubmitting(true)
    setError(null)
    try {
      await initCompetition()

      // Create players, get IDs
      const playerIdMap = {}
      for (const p of filledPlayers) {
        const ref = await addPlayer(p.name, groomIdx === p.idx)
        playerIdMap[p.idx] = ref.id
      }

      // Create teams and assign players
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

      // Seed deck
      await Promise.all(
        deck
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
              <button
                type="button"
                onClick={() => setGroomIdx(groomIdx === i ? null : i)}
                title="Mark as groom"
                className={`text-xl transition-all active:scale-90 ${groomIdx === i ? 'opacity-100' : 'opacity-30'}`}
              >
                💍
              </button>
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
                        {p.name}{groomIdx === pidx ? ' 💍' : ''}
                        {isCap ? ' (C)' : ''}
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
            <button onClick={handleTeamsNext} className="flex-[2] py-3.5 rounded-full bg-primary-container text-on-primary font-bold shadow-[0_4px_12px_rgba(181,35,48,0.25)] active:scale-95 transition-transform">
              Next: Build Deck →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Deck ── */}
      {step === 2 && (
        <div className="space-y-4">
          {deck.map((card, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-2">
              <div className="flex gap-2">
                <input
                  value={card.name}
                  onChange={(e) => updateCard(i, 'name', e.target.value)}
                  placeholder="Card name"
                  className="flex-1 bg-surface-container-high rounded-xl px-3 py-2 text-sm text-on-surface outline-none focus:bg-surface-container-lowest transition-colors"
                />
                <select
                  value={card.type}
                  onChange={(e) => updateCard(i, 'type', e.target.value)}
                  className="bg-surface-container-high rounded-xl px-3 py-2 text-sm text-on-surface outline-none"
                >
                  {['PowerUp', 'WildCard', 'Chaos', 'Rare'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <button onClick={() => removeCard(i)} className="text-on-surface-variant active:scale-90 transition-transform">
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
              <input
                value={card.effectText}
                onChange={(e) => updateCard(i, 'effectText', e.target.value)}
                placeholder="Effect description"
                className="w-full bg-surface-container-high rounded-xl px-3 py-2 text-xs text-on-surface-variant outline-none focus:bg-surface-container-lowest transition-colors"
              />
            </div>
          ))}

          <button onClick={addCard} className="w-full py-3 rounded-xl border-2 border-dashed border-surface-container-high text-on-surface-variant text-sm font-semibold">
            + Add Card
          </button>

          {error && <p className="text-sm font-semibold text-error">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setStep(1); setError(null) }} className="flex-1 py-3.5 rounded-full text-sm font-bold text-primary">Back</button>
            <button
              onClick={handleFinish}
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
