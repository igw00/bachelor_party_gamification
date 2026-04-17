import { useState, useCallback, useEffect } from 'react'
import { useCollection } from '../hooks/useFirestore'
import useStore from '../store/useStore'
import DeckView from '../components/cards/DeckView'
import CardHistoryFeed from '../components/cards/CardHistoryFeed'
import TeamActiveCards from '../components/cards/TeamActiveCards'

const TABS = [
  { id: 'deck', label: 'Game Cards', icon: 'playing_cards' },
  { id: 'history', label: 'History', icon: 'history' },
  { id: 'team', label: 'Team Cards', icon: 'shield' },
]

const LAST_SEEN_KEY = 'spi_last_seen_activation'

export default function Cards() {
  const [activeTab, setActiveTab] = useState('deck')

  const setCards = useStore((s) => s.setCardBadge)
  const setCardBadge = useStore((s) => s.setCardBadge)
  const cards = useStore((s) => s.cards)
  const teams = useStore((s) => s.teams)
  const players = useStore((s) => s.players)
  const claimedPlayerId = useStore((s) => s.claimedPlayerId)

  // Ensure cards subscription is active on this page
  const storeSetCards = useStore((s) => s.setCards)
  useCollection('cards', useCallback(storeSetCards, [storeSetCards]))

  const me = players.find((p) => p.id === claimedPlayerId)
  const myTeam = me?.teamId ? teams.find((t) => t.id === me.teamId) : null

  // Compute badge: draws available for my team OR new non-secret activation
  useEffect(() => {
    const totalDrawsUsed = cards.filter((c) => c.drawnByTeamId === myTeam?.id).length
    const drawsEarned = myTeam?.cardTicks ?? 0
    const drawsAvailable = Math.max(0, drawsEarned - totalDrawsUsed)

    const lastSeen = parseInt(localStorage.getItem(LAST_SEEN_KEY) ?? '0', 10)
    const latestActivation = cards
      .filter((c) => c.activatedAt && !c.isSecret)
      .reduce((max, c) => Math.max(max, c.activatedAt?.seconds ?? 0), 0)

    const hasNew = latestActivation > lastSeen || drawsAvailable > 0
    setCardBadge(hasNew)
  }, [cards, myTeam, setCardBadge])

  // Clear badge when this page is open
  useEffect(() => {
    const latestActivation = cards
      .filter((c) => c.activatedAt && !c.isSecret)
      .reduce((max, c) => Math.max(max, c.activatedAt?.seconds ?? 0), 0)

    if (latestActivation > 0) {
      localStorage.setItem(LAST_SEEN_KEY, String(latestActivation))
    }
    setCardBadge(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="pt-24 pb-32 px-5 max-w-2xl mx-auto">
      {/* Header */}
      <section className="mb-4">
        <h2 className="font-headline font-extrabold text-4xl text-secondary leading-tight">Cards</h2>
        <p className="font-body text-on-surface-variant mt-1 text-sm">
          Earn points, draw cards, change the game.
        </p>
      </section>

      {/* Tab bar */}
      <div className="flex gap-1 bg-surface-container rounded-xl p-1 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg
              transition-all active:scale-95
              ${activeTab === tab.id
                ? 'bg-surface-container-lowest text-secondary shadow-sm'
                : 'text-on-surface-variant'
              }
            `}
          >
            <span
              className="material-symbols-outlined text-base"
              style={{ fontVariationSettings: activeTab === tab.id ? "'FILL' 1" : "'FILL' 0" }}
            >
              {tab.icon}
            </span>
            <span className="text-xs font-bold truncate">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'deck' && <DeckView />}
      {activeTab === 'history' && <CardHistoryFeed />}
      {activeTab === 'team' && <TeamActiveCards />}
    </main>
  )
}
