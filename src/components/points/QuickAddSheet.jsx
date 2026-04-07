import { useState } from 'react'
import BottomSheet from '../layout/BottomSheet'
import PlayerChips from './PlayerChips'
import AdvancedOptions from './AdvancedOptions'
import useStore from '../../store/useStore'
import { addDocument } from '../../hooks/useFirestore'
import { useTeams } from '../../hooks/useTeams'
import { usePlayers } from '../../hooks/usePlayers'
import { useCompetition } from '../../hooks/useCompetition'
import { calcActivityPoints, applyDay3Multiplier, DRINK_POINTS } from '../../lib/scoring'

const DEFAULT_FORM = {
  points: 0,
  description: '',
  activityType: '',
  placement: null,
  drinks: 0,
  captainAward: 0,
}

export default function QuickAddSheet() {
  const { quickAddOpen, setQuickAddOpen, quickAddAdvanced, setQuickAddAdvanced, selectedPlayerIds, setSelectedPlayerIds } = useStore()
  const [form, setForm] = useState(DEFAULT_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const { teams, addPoints: addTeamPoints } = useTeams()
  const { players, addIndividualPoints } = usePlayers()
  const { competition } = useCompetition()

  function close() {
    setQuickAddOpen(false)
    setSelectedPlayerIds([])
    setForm(DEFAULT_FORM)
    setError(null)
    setQuickAddAdvanced(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (selectedPlayerIds.length === 0) {
      setError('Select at least one player.')
      return
    }
    setSubmitting(true)
    setError(null)

    try {
      const day = competition?.currentDay ?? 1
      const multiplierActive = competition?.day3MultiplierActive ?? false

      for (const playerId of selectedPlayerIds) {
        const player = players.find((p) => p.id === playerId)
        if (!player) continue

        let teamPoints = form.points
        let individualPoints = form.points

        // Activity scoring overrides manual points
        if (quickAddAdvanced && form.activityType && form.placement) {
          const calc = calcActivityPoints(form.activityType, form.placement)
          teamPoints = calc.team
          individualPoints = calc.individual
        }

        // Drink points
        const drinkPts = (form.drinks || 0) * DRINK_POINTS
        individualPoints += drinkPts

        // Day 3 multiplier
        teamPoints = applyDay3Multiplier(teamPoints, day, multiplierActive)
        individualPoints = applyDay3Multiplier(individualPoints, day, multiplierActive)

        // Write event
        await addDocument('events', {
          type: quickAddAdvanced && form.activityType ? 'activity' : 'manual',
          loggedBy: playerId,
          teamId: player.teamId,
          playerId,
          activityType: form.activityType || null,
          placement: form.placement || null,
          pointsTeam: teamPoints,
          pointsIndividual: individualPoints,
          description: form.description || null,
          day,
        })

        // Update individual
        await addIndividualPoints(playerId, individualPoints)

        // Update team
        if (player.teamId) {
          await addTeamPoints(player.teamId, teamPoints, day)
        }
      }

      close()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const allPlayers = [...players].sort((a, b) => {
    if (a.isGroom) return -1
    if (b.isGroom) return 1
    return a.name.localeCompare(b.name)
  })

  return (
    <BottomSheet open={quickAddOpen} onClose={close} title="Add Points">
      <form onSubmit={handleSubmit} className="px-6 space-y-6">
        {/* Player chips */}
        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
            Select Players
          </label>
          <PlayerChips players={allPlayers} />
        </div>

        {/* Basic: point stepper */}
        {!quickAddAdvanced && (
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
              Points
            </label>
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, points: Math.max(0, f.points - 1) }))}
                className="w-14 h-14 rounded-full bg-surface-container text-on-surface font-bold text-2xl active:scale-90 transition-transform"
              >
                −
              </button>
              <span className="font-headline font-extrabold text-5xl text-on-surface w-16 text-center">
                {form.points}
              </span>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, points: f.points + 1 }))}
                className="w-14 h-14 rounded-full bg-surface-container text-on-surface font-bold text-2xl active:scale-90 transition-transform"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Description
          </label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="e.g. cornhole W"
            className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/50 outline-none focus:bg-surface-container-lowest transition-colors"
          />
        </div>

        {/* Advanced toggle */}
        <button
          type="button"
          onClick={() => setQuickAddAdvanced(!quickAddAdvanced)}
          className="flex items-center gap-2 text-sm font-bold text-secondary"
        >
          <span className="material-symbols-outlined text-base">
            {quickAddAdvanced ? 'expand_less' : 'tune'}
          </span>
          {quickAddAdvanced ? 'Hide Advanced' : 'Advanced Options'}
        </button>

        {quickAddAdvanced && <AdvancedOptions form={form} setForm={setForm} />}

        {error && (
          <p className="text-sm font-semibold text-error">{error}</p>
        )}

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
