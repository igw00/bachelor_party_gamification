import { useCallback } from 'react'
import useStore from '../store/useStore'
import { useCollection, setDocument, updateDocument } from './useFirestore'
import { addDocument } from './useFirestore'
import { checkCardDrawMilestones } from '../lib/scoring'

export function useTeams() {
  const { teams, setTeams } = useStore()

  useCollection('teams', useCallback(setTeams, [setTeams]))

  async function createTeam(id, name) {
    await setDocument('teams', id, {
      name,
      captainPlayerId: null,
      totalPoints: 0,
      dayPoints: { 1: 0, 2: 0, 3: 0 },
      cardTicks: 0,
      cardsHeld: [],
      cardsActive: [],
      captainBankSpent: 0,
      captainBankAwardsGiven: [],
    })
  }

  async function addPoints(teamId, points, day) {
    const team = teams.find((t) => t.id === teamId)
    if (!team) return

    const prevTotal = team.totalPoints
    const newTotal = prevTotal + points
    const newDayPoints = { ...team.dayPoints, [day]: (team.dayPoints[day] || 0) + points }
    const newMilestones = checkCardDrawMilestones(prevTotal, newTotal)
    const newTicks = team.cardTicks + newMilestones.length

    await updateDocument('teams', teamId, {
      totalPoints: newTotal,
      dayPoints: newDayPoints,
      cardTicks: newTicks,
    })

    return newMilestones
  }

  async function setCaptain(teamId, playerId) {
    await updateDocument('teams', teamId, { captainPlayerId: playerId })
  }

  async function renameTeam(teamId, name) {
    await updateDocument('teams', teamId, { name })
  }

  return { teams, createTeam, addPoints, setCaptain, renameTeam }
}
