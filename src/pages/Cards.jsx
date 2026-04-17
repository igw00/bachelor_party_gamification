import { useState } from 'react'
import GameCard from '../components/cards/GameCard'

const ALL_CARDS = [
  // ── Power ────────────────────────────────────────────────────────────────
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
    description: 'Every drink your team finishes in the next 60 minutes earns 3 pts instead of 1. Stacks with all other bonuses.',
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

  // ── Chaos ────────────────────────────────────────────────────────────────
  {
    name: 'Scottish Accent',
    type: 'Chaos',
    description: 'Impose a Scottish accent on a team of your choosing for the next 45 minutes. Team must speak and cannot remain silent.',
    pointsGain: 'Y',
    pointsLoss: 'X',
  },
  {
    name: 'Unbroken Touch',
    type: 'Chaos',
    description: 'Select a team where all members must maintain an unbroken line of physical touch for the next hour.',
    pointsGain: 'Y',
    pointsLoss: 'X',
  },
  {
    name: 'No Hands',
    type: 'Chaos',
    description: 'For the next hour the entire team cannot use their own hands to drink or eat. You may use each other\'s hands, or those of strangers.',
  },
  {
    name: '7s',
    type: 'Chaos',
    description: '7 shots must be consumed in combination throughout the team.',
  },
  {
    name: 'Cigs',
    type: 'Chaos',
    description: 'Team must stop whatever they\'re doing and acquire + finish a pack of cigarettes before they can earn any more points.',
  },
  {
    name: 'Public Announcement',
    type: 'Chaos',
    description: 'Loudly request that the public environment be quiet and listen. Cannot involve the groom. Must successfully get the establishment to quiet down to count.',
  },
  {
    name: 'Text Your Dad',
    type: 'Chaos',
    description: 'All members must text their dad: "I could beat your ass." Do not add context until the bachelor party is over.',
  },
  {
    name: 'Sing Your Heart Out',
    type: 'Chaos',
    description: 'Team nominates one member to sing their best for a minute, in front of the group. Must meet agreed threshold for lyrics and honest effort.',
  },
  {
    name: 'Chug Team',
    type: 'Chaos',
    description: 'Every member of the selected team must collectively chug all drinks of all game participants — without explaining what\'s happening.',
  },

  // ── Wild ─────────────────────────────────────────────────────────────────
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
    description: 'Playing captain issues a direct 1v1 challenge to the captain of any other team. Any format, on the spot, under 5 minutes, no drinking. Loser\'s team loses 20 pts.',
    pointsLoss: '20',
  },
  {
    name: 'Intel',
    type: 'Wild',
    description: 'The captain may see all unused cards from the other teams. May not share info with own team. Must walk over to the other captains to enforce.',
  },
  {
    name: 'Wager',
    type: 'Wild',
    description: "Captain wagers any number of points against another team's captain. The 3rd team's captain decides the challenge — must be as even as possible.",
  },
]

const TABS = ['All', 'Power', 'Chaos', 'Wild']

const TAB_STYLES = {
  All: 'bg-on-surface/10 text-on-surface',
  Power: 'bg-secondary text-on-secondary',
  Chaos: 'bg-primary text-on-primary',
  Wild: 'bg-tertiary text-on-tertiary',
}

const TAB_INACTIVE = {
  All: 'text-on-surface-variant',
  Power: 'text-secondary',
  Chaos: 'text-primary',
  Wild: 'text-tertiary',
}

export default function Cards() {
  const [activeTab, setActiveTab] = useState('All')

  const filtered = activeTab === 'All' ? ALL_CARDS : ALL_CARDS.filter((c) => c.type === activeTab)

  return (
    <main className="pt-28 pb-32 px-5 max-w-2xl mx-auto">
      {/* Header */}
      <section className="mb-5">
        <h2 className="font-headline font-extrabold text-4xl text-secondary leading-tight">Card Deck</h2>
        <p className="font-body text-on-surface-variant mt-1">
          {ALL_CARDS.length} cards — Power, Chaos & Wild.
        </p>
      </section>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider
              transition-all active:scale-95
              ${activeTab === tab ? TAB_STYLES[tab] : `bg-surface-container ${TAB_INACTIVE[tab]}`}
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Card grid — horizontal scroll on mobile, wrap on wider screens */}
      <div className="flex flex-wrap gap-5 justify-center">
        {filtered.map((card, i) => (
          <GameCard key={card.name} card={card} seed={i} />
        ))}
      </div>
    </main>
  )
}
