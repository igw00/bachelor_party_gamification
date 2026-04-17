import { useState } from 'react'
import { useIdentity } from '../../hooks/useIdentity'
import { drawCardAction } from '../../hooks/useCards'
import useStore from '../../store/useStore'
import GameCard from './GameCard'

// ── Card back visual ──────────────────────────────────────────────────────────

function CardBack({ dim = false, rotate = 0, offsetX = 0, offsetY = 0, scale = 1 }) {
  return (
    <div
      className={`absolute inset-0 rounded-2xl overflow-hidden border-2 transition-all
        ${dim ? 'border-surface-container-highest bg-surface-container' : 'border-secondary/60 bg-secondary'}
        shadow-[0_8px_24px_rgba(0,0,0,0.18)]`}
      style={{
        transform: `rotate(${rotate}deg) translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
        opacity: dim ? 0.4 : 1,
      }}
    >
      {/* Diagonal stripe pattern */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, white 0px, white 1px, transparent 1px, transparent 14px)',
        }}
      />
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <span
          className={`material-symbols-outlined ${dim ? 'text-on-surface-variant' : 'text-white/60'}`}
          style={{ fontSize: '3.5rem' }}
        >
          playing_cards
        </span>
        <div className="text-center">
          <p className={`font-headline font-black text-lg tracking-tight ${dim ? 'text-on-surface-variant' : 'text-white/80'}`}>
            SPI
          </p>
          <p className={`font-label text-[9px] uppercase tracking-[0.18em] ${dim ? 'text-on-surface-variant/60' : 'text-white/50'}`}>
            St. Pete Invitational
          </p>
        </div>
      </div>
      {/* Corner decorations */}
      {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos, i) => (
        <span
          key={i}
          className={`absolute ${pos} material-symbols-outlined text-sm
            ${dim ? 'text-on-surface-variant/20' : 'text-white/15'}`}
        >
          diamond
        </span>
      ))}
    </div>
  )
}

// ── Drawn card overlay ────────────────────────────────────────────────────────

function DrawnCardOverlay({ card, onClose }) {
  if (!card) return null
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
    >
      {/* Reveal label */}
      <div className="mb-5 text-center">
        <p className="font-headline font-black text-white text-2xl">You drew…</p>
        <p className="text-white/60 text-sm mt-0.5">Show your team before you close this.</p>
      </div>

      {/* The card */}
      <div className="animate-[card-reveal_0.35s_cubic-bezier(0.34,1.56,0.64,1)_both]">
        <GameCard card={card} seed={Math.floor(Math.random() * 5)} />
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        className="mt-8 px-10 py-3.5 rounded-full bg-white text-on-surface font-bold text-sm active:scale-95 transition-transform shadow-lg"
      >
        Got it — close
      </button>
    </div>
  )
}

// ── Main DeckView ─────────────────────────────────────────────────────────────

export default function DeckView() {
  const [drawing, setDrawing] = useState(false)
  const [drawnCard, setDrawnCard] = useState(null)

  const { claimedPlayerId } = useIdentity()
  const cards = useStore((s) => s.cards)
  const teams = useStore((s) => s.teams)
  const players = useStore((s) => s.players)

  const me = players.find((p) => p.id === claimedPlayerId)
  const myTeam = me?.teamId ? teams.find((t) => t.id === me.teamId) : null

  // Cards available in the deck (unclaimed)
  const deckPool = cards.filter((c) => !c.heldByTeamId && !c.played)

  // How many draws has my team earned vs. used
  const totalDrawsUsed = cards.filter((c) => c.drawnByTeamId === myTeam?.id).length
  const drawsEarned = myTeam?.cardTicks ?? 0
  const drawsAvailable = Math.max(0, drawsEarned - totalDrawsUsed)

  // Points to next draw
  const totalPts = myTeam?.totalPoints ?? 0
  const nextMilestone = (Math.floor(totalPts / 50) + 1) * 50
  const ptsToNext = nextMilestone - totalPts

  const canDraw = drawsAvailable > 0 && deckPool.length > 0

  async function handleDraw() {
    if (!canDraw || drawing || !myTeam) return
    setDrawing(true)
    try {
      const randomIdx = Math.floor(Math.random() * deckPool.length)
      const picked = deckPool[randomIdx]
      await drawCardAction(myTeam.id, picked.id, claimedPlayerId)
      setDrawnCard(picked)
    } catch (err) {
      console.error('Draw failed:', err)
    } finally {
      setDrawing(false)
    }
  }

  return (
    <>
      <div className="flex flex-col items-center pt-4 pb-8">

        {/* Draw availability badge */}
        {myTeam && (
          <div className="mb-6 text-center">
            {drawsAvailable > 0 ? (
              <div className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full">
                <span className="material-symbols-outlined text-secondary text-base">playing_cards</span>
                <span className="font-bold text-secondary text-sm">
                  {drawsAvailable} draw{drawsAvailable !== 1 ? 's' : ''} available
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-surface-container px-4 py-2 rounded-full">
                <span className="material-symbols-outlined text-on-surface-variant text-base">lock</span>
                <span className="font-semibold text-on-surface-variant text-sm">
                  {ptsToNext} pts to next draw
                </span>
              </div>
            )}
          </div>
        )}

        {/* Deck stack */}
        <div className="relative w-64 h-[360px] mb-8">
          {deckPool.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-surface-container-highest bg-surface-container-low text-center px-6">
              <span className="material-symbols-outlined text-on-surface-variant text-5xl mb-3">
                layers_clear
              </span>
              <p className="font-headline font-bold text-on-surface text-lg">Deck empty</p>
              <p className="text-xs text-on-surface-variant mt-1">All cards have been drawn.</p>
            </div>
          ) : (
            <>
              <CardBack dim={!canDraw} rotate={-7} offsetX={-10} offsetY={6} scale={0.97} />
              <CardBack dim={!canDraw} rotate={-3} offsetX={-4} offsetY={2} scale={0.985} />
              <CardBack dim={!canDraw} rotate={0} offsetX={0} offsetY={0} scale={1} />
            </>
          )}
        </div>

        {/* Deck count */}
        {deckPool.length > 0 && (
          <p className="text-xs text-on-surface-variant mb-6">
            {deckPool.length} card{deckPool.length !== 1 ? 's' : ''} remaining in deck
          </p>
        )}

        {/* Draw button */}
        <button
          onClick={handleDraw}
          disabled={!canDraw || drawing}
          className={`w-64 py-4 rounded-full font-bold text-base transition-all active:scale-95
            ${canDraw
              ? 'bg-secondary text-on-secondary shadow-[0_6px_20px_rgba(62,94,149,0.3)]'
              : 'bg-surface-container text-on-surface-variant cursor-not-allowed opacity-60'
            }`}
        >
          {drawing ? 'Drawing…' : canDraw ? '✦ Draw a Card' : `Earn ${ptsToNext} more pts`}
        </button>

        {/* Team points display */}
        {myTeam && (
          <div className="mt-4 text-center">
            <p className="text-xs text-on-surface-variant">
              <span className="font-bold text-on-surface">{totalPts} pts</span>
              {' '}— {myTeam.name}
            </p>
          </div>
        )}

        {/* No team state */}
        {!myTeam && (
          <p className="text-sm text-on-surface-variant text-center mt-4">
            Join a team to draw cards.
          </p>
        )}
      </div>

      {/* Overlay */}
      <DrawnCardOverlay card={drawnCard} onClose={() => setDrawnCard(null)} />
    </>
  )
}
