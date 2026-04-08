import useStore from '../store/useStore'
import { updateDocument } from './useFirestore'

const STORAGE_KEY = 'spi_player_id'

export function useIdentity() {
  const { claimedPlayerId, setClaimedPlayerId } = useStore()

  function claimPlayer(playerId) {
    localStorage.setItem(STORAGE_KEY, playerId)
    setClaimedPlayerId(playerId)
    updateDocument('players', playerId, { claimed: true }) // background sync
  }

  function unclaim() {
    localStorage.removeItem(STORAGE_KEY)
    setClaimedPlayerId(null)
  }

  return { claimedPlayerId, claimPlayer, unclaim }
}
