import { useState, useCallback } from 'react'
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

export default function Cards() {
  const [activeTab, setActiveTab] = useState('deck')

  // Ensure cards subscription is active on this page
  const setCards = useStore((s) => s.setCards)
  useCollection('cards', useCallback(setCards, [setCards]))

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
              flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold
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
            <span className="hidden xs:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab label (visible on small screens where text is hidden in tabs) */}
      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">
        {TABS.find((t) => t.id === activeTab)?.label}
      </p>

      {/* Tab content */}
      {activeTab === 'deck' && <DeckView />}
      {activeTab === 'history' && <CardHistoryFeed />}
      {activeTab === 'team' && <TeamActiveCards />}
    </main>
  )
}
