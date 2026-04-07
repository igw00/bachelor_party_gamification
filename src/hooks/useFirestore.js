import { useEffect } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

/**
 * Subscribe to a Firestore collection and call onChange with the array of docs.
 * Returns an unsubscribe function.
 */
export function subscribeToCollection(collectionName, onChange) {
  return onSnapshot(collection(db, collectionName), (snap) => {
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    onChange(docs)
  })
}

/**
 * Subscribe to a single Firestore document and call onChange with the data.
 */
export function subscribeToDoc(collectionName, docId, onChange) {
  return onSnapshot(doc(db, collectionName, docId), (snap) => {
    if (snap.exists()) onChange({ id: snap.id, ...snap.data() })
  })
}

/** Add a new document to a collection */
export async function addDocument(collectionName, data) {
  return addDoc(collection(db, collectionName), { ...data, createdAt: serverTimestamp() })
}

/** Set (overwrite) a document by ID */
export async function setDocument(collectionName, docId, data) {
  return setDoc(doc(db, collectionName, docId), data)
}

/** Partially update a document */
export async function updateDocument(collectionName, docId, data) {
  return updateDoc(doc(db, collectionName, docId), data)
}

/** Hook: subscribe to a collection on mount, clean up on unmount */
export function useCollection(collectionName, setter) {
  useEffect(() => {
    const unsub = subscribeToCollection(collectionName, setter)
    return unsub
  }, [collectionName, setter])
}

/** Hook: subscribe to a single doc on mount */
export function useDocSubscription(collectionName, docId, setter) {
  useEffect(() => {
    if (!docId) return
    const unsub = subscribeToDoc(collectionName, docId, setter)
    return unsub
  }, [collectionName, docId, setter])
}
