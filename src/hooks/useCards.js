import { useCallback } from 'react'
import { serverTimestamp } from 'firebase/firestore'
import useStore from '../store/useStore'
import { useCollection, addDocument, updateDocument, setDocument } from './useFirestore'
import { canActivateCard, assertIsCaptain, DEFAULT_DECK } from '../lib/cards'

/**
 * Standalone draw action — safe to call without triggering a Firestore subscription.
 * teamPlayers: all players on the drawing team (needed for Individual card assignment).
 */
export async function drawCardAction(teamId, cardId, playerId, card, teamPlayers = []) {
  const update = {
    heldByTeamId: teamId,
    drawnByTeamId: teamId,
    drawnByPlayerId: playerId ?? null,
    drawnAt: serverTimestamp(),
  }

  // Individual cards: assign to a random team member at draw time
  if (card?.target === 'Individual' && teamPlayers.length > 0) {
    const assigned = teamPlayers[Math.floor(Math.random() * teamPlayers.length)]
    update.assignedToPlayerId = assigned.id
    update.assignedToName = assigned.name
  }

  await updateDocument('cards', cardId, update)
}

/**
 * Reshuffle all played cards back into the draw pool.
 * Called automatically when the undrawn deck is empty and a team tries to draw.
 * Returns the list of cards that were reshuffled so the caller can pick from them immediately.
 */
export async function reshuffleAction(playedCards) {
  await Promise.all(
    playedCards.map((card) =>
      updateDocument('cards', card.id, {
        played: false,
        heldByTeamId: null,
        active: false,
        activatedAt: null,
        activatedByPlayerId: null,
        drawnByTeamId: null,
        drawnByPlayerId: null,
        drawnAt: null,
        assignedToPlayerId: null,
        assignedToName: null,
      })
    )
  )
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
