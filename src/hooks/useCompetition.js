import { useCallback } from 'react'
import useStore from '../store/useStore'
import { useDocSubscription, setDocument, updateDocument } from './useFirestore'

export function useCompetition() {
  const { competition, setCompetition } = useStore()

  useDocSubscription('competition', 'main', useCallback(setCompetition, [setCompetition]))

  async function initCompetition() {
    await setDocument('competition', 'main', {
      currentDay: 1,
      day3MultiplierActive: false,
      scoresLocked: false,
      setupComplete: false,
    })
  }

  async function advanceDay() {
    const next = Math.min((competition.currentDay || 1) + 1, 3)
    await updateDocument('competition', 'main', { currentDay: next })
  }

  async function completeSetup() {
    await updateDocument('competition', 'main', { setupComplete: true })
  }

  async function toggleDay3Multiplier() {
    await updateDocument('competition', 'main', {
      day3MultiplierActive: !competition.day3MultiplierActive,
    })
  }

  return { competition, initCompetition, advanceDay, completeSetup, toggleDay3Multiplier }
}
