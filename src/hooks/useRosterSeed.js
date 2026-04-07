import { useEffect, useRef } from 'react'
import { subscribeToCollection, addDocument } from './useFirestore'
import { ROSTER } from '../lib/roster'

/**
 * On first app load, if the players collection is empty, seed all 15 profiles
 * from the ROSTER constant. Runs once — once players exist it never re-seeds.
 */
export function useRosterSeed() {
  const seeded = useRef(false)

  useEffect(() => {
    const unsub = subscribeToCollection('players', async (docs) => {
      if (docs.length > 0 || seeded.current) return
      seeded.current = true
      await Promise.all(
        ROSTER.map((name) =>
          addDocument('players', {
            name,
            teamId: null,
            isCaptain: false,
            individualPoints: 0,
            claimed: false,
          })
        )
      )
    })
    return unsub
  }, [])
}
