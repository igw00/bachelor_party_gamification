/**
 * Card meta-game logic — all card management lives here.
 */

export const CARD_TYPES = ['Power', 'Chaos', 'Wild']

export const MAX_ACTIVE_CARDS = 2

/** Real 22-card deck from the game design doc */
export const DEFAULT_DECK = [
  // ── Power ──────────────────────────────────────────────────────
  {
    name: 'Point Multiplier',
    type: 'Power',
    description: 'For the next hour, all points earned will be on a 2x multiplier.',
  },
  {
    name: 'Double Down',
    type: 'Power',
    description: "Your team's points for the next single event are doubled. Must be declared before the event starts.",
  },
  {
    name: 'Star Player',
    type: 'Power',
    description: 'Designate one player — their individual points count 3× for the next event. They must hold a drink while playing.',
  },
  {
    name: 'Happy Hour',
    type: 'Power',
    description: 'Every drink your team finishes in the next 60 minutes earns 3 pts instead of 1. Drink points stack with all other bonuses.',
  },
  {
    name: 'Deflect',
    type: 'Power',
    description: 'Bounce any Chaos card played against your team to the other. Can be played as a reaction — even after a Chaos card is announced but before it takes effect.',
  },
  {
    name: 'Mulligan',
    type: 'Power',
    description: 'Re-do one result from the last completed event — replay a cornhole game, a bar golf hole, or a relay heat. Best result counts.',
  },
  {
    name: 'Steal the Points',
    type: 'Power',
    description: 'Take the points earned from an event or activity from an opposing team. Announcement required. Target team captain must acknowledge.',
  },
  {
    name: 'Immunity',
    type: 'Power',
    description: 'Silently activate with the commissioner — immune from cards played against you for the next hour. Cards played during this window are burned. Commissioner cannot share that immunity is active.',
  },

  // ── Chaos ──────────────────────────────────────────────────────
  {
    name: 'Scottish Accent',
    type: 'Chaos',
    description: 'Impose a Scottish accent on a team of your choosing for the next 45 minutes. Team must speak and cannot remain silent. Success → Y pts. Any member caught without accent → imposing team earns X pts.',
  },
  {
    name: 'Unbroken Touch',
    type: 'Chaos',
    description: 'Select a team where all members must maintain an unbroken line of physical touch for the next hour. Success → target draws a card + Y pts. Failure → imposing team earns X pts.',
  },
  {
    name: 'No Hands',
    type: 'Chaos',
    description: "For the next hour the entire team cannot use their own hands to drink or eat. You may use each other's hands, or those of strangers, to be fed.",
  },
  {
    name: '7s',
    type: 'Chaos',
    description: '7 shots must be consumed in combination throughout the team.',
  },
  {
    name: 'Cigs',
    type: 'Chaos',
    description: "Team must stop whatever they're doing and acquire + finish a pack of cigarettes before they can earn any more points.",
  },
  {
    name: 'Public Announcement',
    type: 'Chaos',
    description: 'Loudly request that the public environment be quiet and listen to your announcement. Cannot involve the groom. Must successfully get the establishment to quiet down to count.',
  },
  {
    name: 'Text Your Dad',
    type: 'Chaos',
    description: 'All members must text their dad: "I could beat your ass." Do not add context until the bachelor party is over.',
  },
  {
    name: 'Sing Your Heart Out',
    type: 'Chaos',
    description: 'Team nominates one member to sing their best for a minute, in front of the group. Must meet the agreed threshold for lyrics and honest effort.',
  },
  {
    name: 'Chug Team',
    type: 'Chaos',
    description: "Every member of the selected team must collectively chug all drinks of all game participants — without explaining what's happening.",
  },

  // ── Wild ───────────────────────────────────────────────────────
  {
    name: 'Player Swap',
    type: 'Wild',
    description: 'Team captain who draws this can swap any 2 players on any 2 teams.',
  },
  {
    name: 'Redraw',
    type: 'Wild',
    description: 'Return this card to the deck, then immediately draw 2 cards — keeping both. No points change hands. Pure card economy.',
  },
  {
    name: "Captain's Challenge",
    type: 'Wild',
    description: "Playing captain issues a direct 1v1 challenge to any other captain. Any format, on the spot, under 5 minutes, no drinking. Loser's team loses 20 pts. Winner gains nothing.",
    pointsLoss: 20,
  },
  {
    name: 'Intel',
    type: 'Wild',
    description: "The captain may see all unused cards from the other teams. May not share info with own team. Must walk over to the other captains to enforce.",
  },
  {
    name: 'Wager',
    type: 'Wild',
    description: "Captain wagers any number of points against another team's captain. The 3rd team's captain decides the challenge — must be as even as possible for both participants.",
  },
]

/** Check if a team can activate another card */
export function canActivateCard(activeCards) {
  return activeCards.length < MAX_ACTIVE_CARDS
}

/** Check if a player is a captain (only captains can play cards) */
export function assertIsCaptain(player) {
  if (!player.isCaptain) throw new Error('Only a team captain can activate cards')
}
