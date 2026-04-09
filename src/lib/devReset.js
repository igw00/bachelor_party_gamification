import { collection, getDocs, deleteDoc, doc, updateDoc, terminate } from 'firebase/firestore'
import { clearIndexedDbPersistence } from 'firebase/firestore'
import { db } from './firebase'

/**
 * Full dev reset — wipes all Firestore data, clears the IndexedDB cache,
 * and removes local identity so the full flow can be re-run from scratch.
 */
export async function devReset() {
  // Clear local identity immediately
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

  // Terminate the Firestore instance then wipe the local IndexedDB cache
  // so stale cached docs don't bleed into the next session
  await terminate(db)
  await clearIndexedDbPersistence(db)
}
