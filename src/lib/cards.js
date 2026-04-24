/**
 * Card meta-game logic — all card management lives here.
 * Source of truth: Cards_v3.csv
 * completionPts / refusalPts are doubled from CSV values.
 */

export const CARD_TYPES = ['Power', 'Chaos', 'Wild']

export const MAX_ACTIVE_CARDS = 2

/**
 * 33 unique cards — 21 Team + 12 Individual.
 * target: 'Team' | 'Individual'
 * Individual cards are auto-assigned to a random team member at draw time.
 * DEFAULT_DECK doubles this to 66 total.
 */
const BASE_DECK = [
  // ── Team · Chaos ───────────────────────────────────────────────
  {
    name: 'Accent Card',
    type: 'Chaos',
    target: 'Team',
    description:
      'Impose one of the following accents on a team of your choosing for the next 45 minutes. Team must speak — silence is not permitted. Any member caught without attempting the accent constitutes a violation for the whole team.\n• Midwestern (Chicago)\n• Japanese\n• Irish\n• Australian\n• Anime girl\n• Scottish\n• Baltimore/Philly\n• Sign language (nonverbal)',
    completionPts: 120,
    refusalPts: 80,
  },
  {
    name: 'Unbroken Physical Touch',
    type: 'Chaos',
    target: 'Team',
    description:
      'Select a team where all members must maintain an unbroken chain of physical contact for the next hour. Any break in the chain constitutes an immediate fail.',
    completionPts: 150,
    refusalPts: 100,
  },
  {
    name: 'Cannot Use Own Hands',
    type: 'Chaos',
    target: 'Team',
    description:
      'For the next hour the entire targeted team cannot use their own hands to eat or drink. Teammates or willing strangers must feed them. Bathroom trips are exempt. Any member using their own hands constitutes a fail for the whole team.',
    completionPts: 130,
    refusalPts: 80,
  },
  {
    name: '7 Shots',
    type: 'Chaos',
    target: 'Team',
    description:
      '7 shots must be consumed collectively by the targeted team before they can earn any more event points. Drink points still accumulate normally. Distribution among willing members is their choice.',
    completionPts: 100,
    refusalPts: 70,
  },
  {
    name: 'Cigs',
    type: 'Chaos',
    target: 'Team',
    description:
      'Targeted team must stop what they are doing, acquire and finish a full pack of cigarettes before earning any more event points. Distribution among members is their choice. Cigar substitution (3 minutes hotboxing per cigarette equivalent) is valid and judged by the other two Captains.',
    completionPts: 160,
    refusalPts: 110,
  },
  {
    name: 'Make an Announcement to the Public',
    type: 'Chaos',
    target: 'Team',
    description:
      'Loudly request that the public establishment quiet down to hear a public announcement. Must successfully get the venue to quiet — at least half of nearby patrons must pause and acknowledge. Cannot involve the groom. Pass/fail judged by the other two Captains.',
    completionPts: 140,
    refusalPts: 90,
  },
  {
    name: 'Text Your Dad',
    type: 'Chaos',
    target: 'Team',
    description:
      'Every member of the targeted team must text their father that they could beat his ass. No context may be added. No follow-up or explanation until the bachelor party is over. Completion verified by screenshot shown to both other Captains.',
    completionPts: 120,
    refusalPts: 80,
  },
  {
    name: 'Sing',
    type: 'Chaos',
    target: 'Team',
    description:
      'The targeted team nominates one member to sing as best they can for one full minute in front of the entire group. Must demonstrate honest effort — enough lyrics and genuine attempt to sing well. Pass/fail by majority vote of the other two Captains. Quitting before 60 seconds or humming instead of singing = fail. Individual will also receive 30 points.',
    completionPts: 110,
    refusalPts: 70,
  },
  {
    name: 'Chug Team',
    type: 'Chaos',
    target: 'Team',
    description:
      'Every member of the targeted team must collectively chug all the drinks currently held by all game participants. They must do this without explaining to anyone what is happening. Any explanation given before all drinks are finished = immediate fail.',
    completionPts: 150,
    refusalPts: 100,
  },
  {
    name: 'Wet Clothes',
    type: 'Chaos',
    target: 'Team',
    description:
      'You must maintain a sopping wet state to ONE of the following articles of clothing of your choosing for the next hour. If you are not wearing one of the following, select from the ones that apply at the individual level at time of playing.\n• Shorts\n• Socks\n• Shirt',
    completionPts: 150,
    refusalPts: 100,
  },

  // ── Team · Power ───────────────────────────────────────────────
  {
    name: 'Point Multiplier',
    type: 'Power',
    target: 'Team',
    description:
      'For the next hour all points earned by your team are on a 2× multiplier. Must be declared before the hour begins.',
  },
  {
    name: 'Double Down',
    type: 'Power',
    target: 'Team',
    description:
      "Your team's points for the next single event are doubled. Must be declared before the event starts. Does not stack with other multipliers.",
  },
  {
    name: 'Star Player',
    type: 'Power',
    target: 'Team',
    description:
      'Designate one player on your team. Their individual points count 3× for the next event. They must hold a drink while playing. Must be declared before the event starts.',
  },
  {
    name: 'Happy Hour',
    type: 'Power',
    target: 'Team',
    description:
      'Every drink your team finishes in the next 60 minutes earns 2× the normal drink points. Must be declared before the hour begins. Drink points stack with all other bonuses.',
  },
  {
    name: 'Deflect',
    type: 'Power',
    target: 'Team',
    description:
      'Bounce any Chaos card played against your team back onto the imposing team instead. Can be played as a reaction — after a Chaos card is announced but before it takes effect.',
  },
  {
    name: 'Steal the Points',
    type: 'Power',
    target: 'Team',
    description:
      'Take the tally placement points earned from the most recently completed event or activity from one opposing team and add them to yours. Announcement required. Target team Captain must acknowledge before transfer occurs. Inflicted team still gets to keep their point tally as well.',
  },
  {
    name: 'Immunity',
    type: 'Power',
    target: 'Team',
    description:
      'Silently activate this card by showing it to one of the other two Captains (not your own team members) to register it. Your team becomes immune to all Chaos cards for the next hour. Cards played against your team during this window are burned. The registering Captain may not reveal that Immunity has been activated.',
    isSecret: true,
  },

  // ── Team · Wild ────────────────────────────────────────────────
  {
    name: 'Player Swap',
    type: 'Wild',
    target: 'Team',
    description:
      'The Captain who draws this card selects any players from any 2 teams and swaps them for the rest of the game. Drink points travel with the player. Event points already earned stay with the original team.',
  },
  {
    name: 'Redraw',
    type: 'Wild',
    target: 'Team',
    description:
      'The team that plays this card returns it to the deck then immediately draws 2 cards keeping both. No points change hands. No players move. Pure card economy play.',
  },
  {
    name: "Captain's Challenge",
    type: 'Wild',
    target: 'Team',
    description:
      "The playing Captain issues a direct 1v1 challenge to the Captain of any other team. Any format, any task completable on the spot in under 5 minutes. Loser's team loses 20 pts. Winner's team gains 20.",
    pointsLoss: 20,
    pointsGain: 20,
  },
  {
    name: 'Intel',
    type: 'Wild',
    target: 'Team',
    description:
      "The Captain of this team may walk over to each of the other two Captains and view all unplayed cards in their hand. The Captain may not share this information with their own team members. Other Captains must comply and show their hand.",
  },
  {
    name: 'Wager',
    type: 'Wild',
    target: 'Team',
    description:
      "Your Captain wagers a declared number of points against another team's Captain. The third team's Captain designs and judges the challenge — it must be as even as possible for both participants. Both Captains agree to the wager amount before the challenge begins. Loser's team loses the wagered points. Winner's team gains them.",
  },

  // ── Individual · Power ─────────────────────────────────────────
  {
    name: 'Point Multiplier',
    type: 'Power',
    target: 'Individual',
    description:
      "When drawn this card is automatically assigned to a random member of the drawing team. For the next hour that individual's points are on a 2× multiplier. Must be declared before the hour begins.",
  },
  {
    name: 'Double Down',
    type: 'Power',
    target: 'Individual',
    description:
      "When drawn this card is automatically assigned to a random member of the drawing team. That individual's placement points for the next single event are doubled. Must be declared before the event starts. Does not stack with other multipliers.",
  },
  {
    name: 'Star Player',
    type: 'Power',
    target: 'Individual',
    description:
      "When drawn this card is automatically assigned to a random member of the drawing team. That individual's points count 3× for the next event. They must hold a drink while playing. Must be declared before the event starts.",
  },
  {
    name: 'Happy Hour',
    type: 'Power',
    target: 'Individual',
    description:
      'When drawn this card is automatically assigned to a random member of the drawing team. Every drink that individual finishes in the next 60 minutes earns them 2× the normal drink points. Must be declared before the hour begins.',
  },
  {
    name: 'Deflect',
    type: 'Power',
    target: 'Individual',
    description:
      'When drawn this card is automatically assigned to a random member of the drawing team. That individual may bounce any individually-targeted card effect back onto a random member of the imposing team. Can be played as a reaction after the effect is announced but before it takes effect.',
  },
  {
    name: 'Steal the Points',
    type: 'Power',
    target: 'Individual',
    description:
      'When drawn this card is automatically assigned to a random member of the drawing team. That individual may take the individual points earned by any one opposing player from the most recently completed event and add them to their own individual total. Announcement required. Target must acknowledge.',
  },
  {
    name: 'Immunity',
    type: 'Power',
    target: 'Individual',
    description:
      'When drawn this card is automatically assigned to a random member of the drawing team. That individual silently registers the card by showing it face-down to one of the other two Captains. They are personally immune to any individually-targeted card effects for the next hour. The registering Captain may not reveal that Immunity has been activated.',
    isSecret: true,
  },

  // ── Individual · Wild ──────────────────────────────────────────
  {
    name: 'Player Swap',
    type: 'Wild',
    target: 'Individual',
    description:
      'When drawn this card is automatically assigned to a random member of the drawing team. That individual may swap themselves with any one player on any other team for the rest of the current day. Drink points travel with the player. Event points already earned stay with the original team.',
  },
  {
    name: 'Redraw',
    type: 'Wild',
    target: 'Individual',
    description:
      'When drawn this card is automatically assigned to a random member of the drawing team. That individual returns this card to the deck and their team immediately draws 2 cards keeping both.',
  },
  {
    name: "Captain's Challenge",
    type: 'Wild',
    target: 'Individual',
    description:
      "When drawn this card is automatically assigned to a random member of the drawing team. That individual — not the Captain — issues a direct 1v1 challenge to any one player on any other team. Any format, any task completable on the spot in under 5 minutes. Cannot involve drinking. Loser loses 20 individual pts. Winner gains nothing.",
    pointsLoss: 20,
  },
  {
    name: 'Intel',
    type: 'Wild',
    target: 'Individual',
    description:
      "When drawn this card is automatically assigned to a random member of the drawing team. That individual may view all unplayed cards held by any one opposing team's Captain. They may not share this information with their own team members.",
  },
  {
    name: 'Wager',
    type: 'Wild',
    target: 'Individual',
    description:
      "When drawn this card is automatically assigned to a random member of the drawing team. That individual wagers a declared number of their own individual points against any one player on another team. The third team's Captain designs and judges the challenge. Loser loses the wagered individual pts. Winner gains them.",
  },
]

/** Full deck = 2 copies of every card (66 total) */
export const DEFAULT_DECK = [...BASE_DECK, ...BASE_DECK]

/** Check if a team can activate another card */
export function canActivateCard(activeCards) {
  return activeCards.length < MAX_ACTIVE_CARDS
}

/** Check if a player is a captain (only captains can play cards) */
export function assertIsCaptain(player) {
  if (!player.isCaptain) throw new Error('Only a team captain can activate cards')
}
