import { useCallback } from 'react'
import { serverTimestamp } from 'firebase/firestore'
import useStore from '../store/useStore'
import { useCollection, addDocument, updateDocument, setDocument } from './useFirestore'
import { canActivateCard, assertIsCaptain, DEFAULT_DECK } from '../lib/cards'

/** Standalone action — safe to call without triggering a Firestore subscription */
export async function drawCardAction(teamId, cardId, playerId) {
  await updateDocument('cards', cardId, {
    heldByTeamId: teamId,
    drawnByTeamId: teamId,
    drawnByPlayerId: playerId ?? null,
    drawnAt: serverTimestamp(),
  })
}

export function useCards() {
  const { cards, setCards, players } = useStore()

  useCollection('cards', useCallback(setCards, [setCards]))

  async function seedDeck(deck = DEFAULT_DECK) {
    await Promise.all(deck.map((card) => addDocument('cards', { ...card, heldByTeamId: null, active: false, played: false })))
  }

  async function drawCard(teamId, cardId, playerId) {
    await updateDocument('cards', cardId, {
      heldByTeamId: teamId,
      drawnByTeamId: teamId,
      drawnByPlayerId: playerId ?? null,
      drawnAt: serverTimestamp(),
    })
  }

  async function activateCard(cardId, playerId) {
    const player = players.find((p) => p.id === playerId)
    if (!player) throw new Error('Player not found')
    const teamCards = cards.filter((c) => c.heldByTeamId === player.teamId && c.active)
    if (!canActivateCard(teamCards)) throw new Error('Max 2 cards can be active at once')
    await updateDocument('cards', cardId, {
      active: true,
      activatedAt: serverTimestamp(),
      activatedByPlayerId: playerId,
    })
  }

  async function playCard(cardId) {
    await updateDocument('cards', cardId, { active: false, played: true, heldByTeamId: null })
  }

  return { cards, seedDeck, drawCard, activateCard, playCard }
}
