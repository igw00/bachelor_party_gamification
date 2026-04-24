import { useState } from 'react'
import BottomSheet from '../layout/BottomSheet'
import useStore from '../../store/useStore'
import { addDocument } from '../../hooks/useFirestore'
import { useTeams } from '../../hooks/useTeams'
import { usePlayers } from '../../hooks/usePlayers'
import { useCompetition } from '../../hooks/useCompetition'
import { useIdentity } from '../../hooks/useIdentity'
import { applyDay3Multiplier } from '../../lib/scoring'
import { serverTimestamp } from 'firebase/firestore'

const SHORTCUTS = [
  { label: 'Drink', pts: 5, icon: '🍺' },
  { label: 'Par', pts: 5, icon: '🏌️' },
  { label: 'Birdie', pts: 12, icon: '⛳' },
  { label: 'Eagle', pts: 20, icon: '🦅' },
  { label: 'Beer Game W', pts: 15, icon: '🏓' },
  { label: 'Pickle/Vball W', pts: 20, icon: '🏐' },
  { label: 'Golf Win', pts: 75, icon: '🏆' },
  { label: 'Team Golf W', pts: 200, icon: '⭐' },
]

export default function QuickAddSheet() {
  const { quickAddOpen, setQuickAddOpen } = useStore()
  const [points, setPoints] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const { teams, addPoints: addTeamPoints } = useTeams()
  const { players, addIndividualPoints } = usePlayers()
  const { competition } = useCompetition()
  const { claimedPlayerId } = useIdentity()

  const claimedPlayer = players.find((p) => p.id === claimedPlayerId) ?? null

  function close() {
    setQuickAddOpen(false)
    setPoints('')
    setDescription('')
    setError(null)
  }

  function addShortcut(pts) {
    setPoints((prev) => {
      const current = parseInt(prev, 10) || 0
      return String(current + pts)
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const pts = parseInt(points, 10)
    if (!pts || pts <= 0) {
      setError('Enter a point total greater than 0.')
      return
    }
    if (!claimedPlayer) {
      setError('No player identity found. Please reload and claim your name.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const day = competition?.currentDay ?? 1
      const multiplierActive = competition?.day3MultiplierActive ?? false

      const teamPts = applyDay3Multiplier(pts, day, multiplierActive)
      const individualPts = applyDay3Multiplier(pts, day, multiplierActive)

      await addDocument('events', {
        type: 'manual',
        loggedBy: claimedPlayer.id,
        teamId: claimedPlayer.teamId,
        playerId: claimedPlayer.id,
        pointsTeam: teamPts,
        pointsIndividual: individualPts,
        description: description || null,
        day,
        createdAt: serverTimestamp(),
      })

      await addIndividualPoints(claimedPlayer.id, individualPts)

      if (claimedPlayer.teamId) {
        await addTeamPoints(claimedPlayer.teamId, teamPts, day)
      }

      close()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <BottomSheet open={quickAddOpen} onClose={close} title="Add Points">
      <form onSubmit={handleSubmit} className="px-6 space-y-6">

        {/* Attributed player */}
        {claimedPlayer && (
          <div className="flex items-center gap-2 bg-secondary/10 rounded-xl px-4 py-2.5">
            <span className="material-symbols-outlined text-base text-secondary">person</span>
            <span className="text-sm font-semibold text-secondary">{claimedPlayer.name}</span>
          </div>
        )}

        {/* Manual point input */}
        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
            Points
          </label>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            placeholder="0"
            className="w-full bg-surface-container-high rounded-2xl px-5 py-4 font-headline font-extrabold text-4xl text-on-surface text-center outline-none focus:bg-surface-container-lowest transition-colors"
          />
        </div>

        {/* Quick shortcuts */}
        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
            Quick Add
          </label>
          <div className="grid grid-cols-4 gap-2 gap-y-2">
            {SHORTCUTS.map(({ label, pts, icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => addShortcut(pts)}
                className="flex flex-col items-center gap-1 py-3 rounded-xl bg-surface-container active:bg-surface-container-high active:scale-95 transition-all"
              >
                <span className="text-lg">{icon}</span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide">{label}</span>
                <span className="text-xs font-bold text-secondary">+{pts}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Note (optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. cornhole W, hole 7 birdie"
            className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/50 outline-none focus:bg-surface-container-lowest transition-colors"
          />
        </div>

        {error && <p className="text-sm font-semibold text-error">{error}</p>}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={close}
            className="flex-1 py-3.5 rounded-full text-sm font-bold text-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-[2] py-3.5 rounded-full bg-primary-container text-on-primary font-bold text-sm shadow-[0_4px_12px_rgba(181,35,48,0.25)] active:scale-95 transition-all disabled:opacity-50"
          >
            {submitting ? 'Adding…' : 'Add Points'}
          </button>
        </div>
      </form>
    </BottomSheet>
  )
}
