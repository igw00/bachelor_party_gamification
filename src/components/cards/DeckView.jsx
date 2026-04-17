import { useState } from 'react'
import { useIdentity } from '../../hooks/useIdentity'
import { drawCardAction } from '../../hooks/useCards'
import useStore from '../../store/useStore'
import GameCard from './GameCard'

// ── Card back visual ──────────────────────────────────────────────────────────

function CardBack({ locked = false, rotate = 0, offsetX = 0, offsetY = 0 }) {
  return (
    <div
      className={`absolute inset-0 rounded-2xl overflow-hidden border-2
        ${locked
          ? 'border-surface-container-highest bg-surface-container-high'
          : 'border-secondary/60 bg-secondary'
        }
        shadow-[0_8px_24px_rgba(0,0,0,0.18)]`}
      style={{ transform: `rotate(${rotate}deg) translate(${offsetX}px, ${offsetY}px)` }}
    >
      {/* Diagonal stripe pattern */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, white 0px, white 1px, transparent 1px, transparent 14px)',
        }}
      />
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <span
          className={`material-symbols-outlined ${locked ? 'text-on-surface-variant/40' : 'text-white/60'}`}
          style={{ fontSize: '3.5rem' }}
        >
          {locked ? 'lock' : 'playing_cards'}
        </span>
        <div className="text-center">
          <p className={`font-headline font-black text-lg tracking-tight ${locked ? 'text-on-surface-variant/50' : 'text-white/80'}`}>
            SPI
          </p>
          <p className={`font-label text-[9px] uppercase tracking-[0.18em] ${locked ? 'text-on-surface-variant/30' : 'text-white/50'}`}>
            St. Pete Invitational
          </p>
        </div>
      </div>
      {/* Corner decorations */}
      {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos, i) => (
        <span
          key={i}
          className={`absolute ${pos} material-symbols-outlined text-sm
            ${locked ? 'text-on-surface-variant/15' : 'text-white/15'}`}
        >
          diamond
        </span>
      ))}
    </div>
  )
}

// ── Drawn card overlay ────────────────────────────────────────────────────────

function DrawnCardOverlay({ card, drawsRemaining, onClose, onDrawAnother, drawing }) {
  if (!card) return null

  // Stable seed based on card id to avoid re-randomising on re-render
  const seed = card.id ? card.id.charCodeAt(0) % 5 : 0

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(6px)' }}
    >
      <div className="mb-5 text-center">
        <p className="font-headline font-black text-white text-2xl">You drew…</p>
        <p className="text-white/60 text-sm mt-0.5">Show your team before closing.</p>
      </div>

      <GameCard card={card} seed={seed} />

      <div className="mt-8 flex flex-col gap-3 w-64">
        {drawsRemaining > 0 && (
          <button
            onClick={onDrawAnother}
            disabled={drawing}
            className="w-full py-3.5 rounded-full bg-secondary text-on-secondary font-bold text-sm active:scale-95 transition-transform disabled:opacity-60 shadow-lg"
          >
            {drawing ? 'Drawing…' : `Draw another (${drawsRemaining} left)`}
          </button>
        )}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-full bg-white/15 text-white font-bold text-sm active:scale-95 transition-transform border border-white/20"
        >
          Got it — close
        </button>
      </div>
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
  const teamPlayers = players.filter((p) => p.teamId === myTeam?.id)

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

  // After drawing a card, remaining draws = drawsAvailable - 1 (optimistic)
  const drawsAfterThis = Math.max(0, drawsAvailable - 1)

  const canDraw = drawsAvailable > 0 && deckPool.length > 0

  async function pickAndDraw() {
    if (deckPool.length === 0 || !myTeam) return
    setDrawing(true)
    try {
      const randomIdx = Math.floor(Math.random() * deckPool.length)
      const picked = deckPool[randomIdx]
      await drawCardAction(myTeam.id, picked.id, claimedPlayerId, picked, teamPlayers)
      setDrawnCard(picked)
    } catch (err) {
      console.error('Draw failed:', err)
    } finally {
      setDrawing(false)
    }
  }

  async function handleDraw() {
    if (!canDraw || drawing) return
    await pickAndDraw()
  }

  async function handleDrawAnother() {
    setDrawnCard(null)
    await pickAndDraw()
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
          ) : canDraw ? (
            // Active: show 3 stacked cards
            <>
              <CardBack locked={false} rotate={-7} offsetX={-10} offsetY={6} />
              <CardBack locked={false} rotate={-3} offsetX={-4} offsetY={2} />
              <CardBack locked={false} rotate={0} offsetX={0} offsetY={0} />
            </>
          ) : (
            // Locked: single solid card, no mirage
            <CardBack locked={true} rotate={0} offsetX={0} offsetY={0} />
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

        {/* Team points */}
        {myTeam && (
          <div className="mt-4 text-center">
            <p className="text-xs text-on-surface-variant">
              <span className="font-bold text-on-surface">{totalPts} pts</span>
              {' '}— {myTeam.name}
            </p>
          </div>
        )}

        {!myTeam && (
          <p className="text-sm text-on-surface-variant text-center mt-4">
            Join a team to draw cards.
          </p>
        )}
      </div>

      {/* Overlay */}
      <DrawnCardOverlay
        card={drawnCard}
        drawsRemaining={drawsAfterThis}
        onClose={() => setDrawnCard(null)}
        onDrawAnother={handleDrawAnother}
        drawing={drawing}
      />
    </>
  )
}
