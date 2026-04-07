/**
 * Card meta-game logic — all card management lives here.
 */

export const CARD_TYPES = ['PowerUp', 'WildCard', 'Chaos', 'Rare']

export const MAX_ACTIVE_CARDS = 2

/** Default starter deck */
export const DEFAULT_DECK = [
  { name: 'Double Down', type: 'PowerUp', effectText: 'Double your team\'s points for one activity.' },
  { name: 'Steal a Point', type: 'WildCard', effectText: 'Take 10 pts from any other team.' },
  { name: 'Chaos Card', type: 'Chaos', effectText: 'Randomly swap 15 pts between two teams.' },
  { name: 'Iron Stomach', type: 'PowerUp', effectText: '+5 pts for every drink logged this round.' },
  { name: 'Captain\'s Wrath', type: 'Rare', effectText: 'Double your captain bank for this day only.', isRare: true },
  { name: 'Sand Bag', type: 'WildCard', effectText: 'Force another team to lose 5 pts.' },
  { name: 'Day Pass', type: 'PowerUp', effectText: 'Your team is immune to Chaos cards until tomorrow.' },
  { name: 'Lucky Draw', type: 'Rare', effectText: 'Draw 2 extra cards immediately.', isRare: true },
  { name: 'Speed Round', type: 'WildCard', effectText: 'Challenge another team to a 1v1. Winner gets 15 pts.' },
  { name: 'Comeback Kid', type: 'Chaos', effectText: 'Last-place team gets +20 pts.' },
]

/** Check if a team can activate another card */
export function canActivateCard(activeCards) {
  return activeCards.length < MAX_ACTIVE_CARDS
}

/** Check if a player is a captain (only captains can play cards) */
export function assertIsCaptain(player) {
  if (!player.isCaptain) throw new Error('Only a team captain can activate cards')
}
