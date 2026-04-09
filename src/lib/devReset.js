import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

/**
 * Full dev reset — wipes all game state so you can re-run any flow from scratch.
 * Parallelises all Firestore reads and writes to minimise round-trips.
 */
export async function devReset() {
  // Clear local identity immediately so the claim screen shows on reload
  localStorage.removeItem('spi_player_id')

  // Fetch all collections in parallel
  const [teamsSnap, cardsSnap, eventsSnap, compSnap, playerSnap] = await Promise.all([
    getDocs(collection(db, 'teams')),
    getDocs(collection(db, 'cards')),
    getDocs(collection(db, 'events')),
    getDocs(collection(db, 'competition')),
    getDocs(collection(db, 'players')),
  ])

  // Delete / reset everything in one parallel batch
  await Promise.all([
    ...teamsSnap.docs.map((d) => deleteDoc(doc(db, 'teams', d.id))),
    ...cardsSnap.docs.map((d) => deleteDoc(doc(db, 'cards', d.id))),
    ...eventsSnap.docs.map((d) => deleteDoc(doc(db, 'events', d.id))),
    ...compSnap.docs.map((d) => deleteDoc(doc(db, 'competition', d.id))),
    ...playerSnap.docs.map((d) =>
      updateDoc(doc(db, 'players', d.id), {
        claimed: false,
        teamId: null,
        isCaptain: false,
        individualPoints: 0,
      })
    ),
  ])
}
