import { useCallback } from 'react'
import useStore from '../store/useStore'
import { useCollection, addDocument, updateDocument } from './useFirestore'

export function usePlayers() {
  const { players, setPlayers } = useStore()

  useCollection('players', useCallback(setPlayers, [setPlayers]))

  async function addPlayer(name, isGroom = false) {
    return addDocument('players', {
      name,
      teamId: null,
      isGroom,
      isCaptain: false,
      individualPoints: 0,
    })
  }

  async function assignTeam(playerId, teamId) {
    await updateDocument('players', playerId, { teamId })
  }

  async function setCaptain(playerId, isCaptain) {
    await updateDocument('players', playerId, { isCaptain })
  }

  async function addIndividualPoints(playerId, points) {
    const player = players.find((p) => p.id === playerId)
    if (!player) return
    await updateDocument('players', playerId, {
      individualPoints: (player.individualPoints || 0) + points,
    })
  }

  return { players, addPlayer, assignTeam, setCaptain, addIndividualPoints }
}
