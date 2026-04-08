import { create } from 'zustand'

/**
 * Zustand store — mirrors Firestore shape locally.
 * Components read from here; hooks sync from Firestore into here.
 */
const useStore = create((set) => ({
  // ── Competition meta ──────────────────────────────────────────
  competition: {
    currentDay: 1,
    day3MultiplierActive: false,
    scoresLocked: false,
    setupComplete: false,
  },
  setCompetition: (data) => set({ competition: data }),

  // ── Teams ─────────────────────────────────────────────────────
  teams: [],   // [{ id, name, captainPlayerId, totalPoints, dayPoints, cardTicks, cardsHeld, cardsActive, captainBankSpent, captainBankAwardsGiven }]
  setTeams: (teams) => set({ teams }),

  // ── Players ───────────────────────────────────────────────────
  players: [], // [{ id, name, teamId, isGroom, isCaptain, individualPoints }]
  setPlayers: (players) => set({ players }),

  // ── Cards ─────────────────────────────────────────────────────
  cards: [],   // [{ id, name, type, effectText, heldByTeamId, active, played, isRare }]
  setCards: (cards) => set({ cards }),

  // ── Events log ────────────────────────────────────────────────
  events: [],  // append-only
  setEvents: (events) => set({ events }),

  // ── Identity ──────────────────────────────────────────────────
  claimedPlayerId: localStorage.getItem('spi_player_id') ?? null,
  setClaimedPlayerId: (id) => set({ claimedPlayerId: id }),

  // ── UI state ──────────────────────────────────────────────────
  quickAddOpen: false,
  setQuickAddOpen: (open) => set({ quickAddOpen: open }),
}))

export default useStore
