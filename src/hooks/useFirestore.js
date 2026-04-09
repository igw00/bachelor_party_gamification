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

export function subscribeToCollection(collectionName, onChange) {
  return onSnapshot(collection(db, collectionName), (snap) => {
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    onChange(docs)
  })
}

export function subscribeToDoc(collectionName, docId, onChange) {
  return onSnapshot(doc(db, collectionName, docId), (snap) => {
    if (snap.exists()) onChange({ id: snap.id, ...snap.data() })
  })
}

export async function addDocument(collectionName, data) {
  return addDoc(collection(db, collectionName), { ...data, createdAt: serverTimestamp() })
}

export async function setDocument(collectionName, docId, data) {
  return setDoc(doc(db, collectionName, docId), data)
}

/** Merge fields into a document — creates it if it doesn't exist */
export async function mergeDocument(collectionName, docId, data) {
  return setDoc(doc(db, collectionName, docId), data, { merge: true })
}

export async function updateDocument(collectionName, docId, data) {
  return updateDoc(doc(db, collectionName, docId), data)
}

export function useCollection(collectionName, setter) {
  useEffect(() => {
    const unsub = subscribeToCollection(collectionName, setter)
    return unsub
  }, [collectionName, setter])
}

export function useDocSubscription(collectionName, docId, setter) {
  useEffect(() => {
    if (!docId) return
    const unsub = subscribeToDoc(collectionName, docId, setter)
    return unsub
  }, [collectionName, docId, setter])
}
