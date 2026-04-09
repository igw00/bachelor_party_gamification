import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

/**
 * Full dev reset — wipes all game state so you can re-run any flow from scratch.
 * Only callable in dev environment. Never imported in production.
 */
export async function devReset() {
  // Delete teams, cards, events entirely
  for (const col of ['teams', 'cards', 'events']) {
    const snap = await getDocs(collection(db, col))
    await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, col, d.id))))
  }

  // Reset competition doc if it exists
  const compSnap = await getDocs(collection(db, 'competition'))
  await Promise.all(compSnap.docs.map((d) => deleteDoc(doc(db, 'competition', d.id))))

  // Reset players: unclaim, remove team assignment, zero points
  const playerSnap = await getDocs(collection(db, 'players'))
  await Promise.all(
    playerSnap.docs.map((d) =>
      updateDoc(doc(db, 'players', d.id), {
        claimed: false,
        teamId: null,
        isCaptain: false,
        individualPoints: 0,
      })
    )
  )

  // Clear local identity so the claim screen shows again
  localStorage.removeItem('spi_player_id')
}
