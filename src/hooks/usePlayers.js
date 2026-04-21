import { useCallback } from 'react'
import useStore from '../store/useStore'
import { useCollection, addDocument, updateDocument } from './useFirestore'

/**
 * Swap two players between teams, transferring their individual point contributions.
 * playerA is on teamA, playerB is on teamB — after swap they trade teams.
 */
export async function swapPlayersAction(playerA, teamA, playerB, teamB) {
  const ptsA = playerA.individualPoints ?? 0
  const ptsB = playerB.individualPoints ?? 0
  await Promise.all([
    updateDocument('players', playerA.id, { teamId: teamB.id }),
    updateDocument('players', playerB.id, { teamId: teamA.id }),
    updateDocument('teams', teamA.id, { totalPoints: Math.max(0, (teamA.totalPoints ?? 0) - ptsA + ptsB) }),
    updateDocument('teams', teamB.id, { totalPoints: Math.max(0, (teamB.totalPoints ?? 0) - ptsB + ptsA) }),
  ])
}

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
