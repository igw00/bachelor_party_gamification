/**
 * Scoring utilities — all point math lives here, never in components.
 * All functions are pure with no side effects.
 */

// Points by activity type and placement
const ACTIVITY_POINTS = {
  golf: { team: [10, 7, 5], individual: [5, 3, 2] },
  volleyball: { team: [10, 7, 5], individual: [5, 3, 2] },
  beachGame: { team: [5, 3, 1], individual: [3, 2, 1] },
  beerGame: { team: [5, 3, 1], individual: [3, 2, 1] },
  barGolf: { team: [10, 7, 5], individual: [5, 3, 2] },
}

/**
 * Calculate points for an activity result.
 * placement is 1-indexed (1 = first place).
 */
export function calcActivityPoints(type, placement) {
  const config = ACTIVITY_POINTS[type]
  if (!config) return { team: 0, individual: 0 }
  const idx = Math.min(placement - 1, 2)
  return {
    team: config.team[idx] ?? 0,
    individual: config.individual[idx] ?? 0,
  }
}

/** Drink shot log — 2 pts per drink, individual only */
export const DRINK_POINTS = 2

/** Captain bank award: 1-50 pts, cannot award own team */
export function validateCaptainBankAward(captainTeamId, targetTeamId, amount, bankSpent) {
  if (captainTeamId === targetTeamId) throw new Error('Cannot award your own team')
  if (amount < 1 || amount > 50) throw new Error('Award must be 1–50 pts')
  if (bankSpent + amount > 150) throw new Error('Captain bank limit (150 pts) exceeded')
}

/** Apply groom multiplier: 1.25x when groom is playing on the team */
export function applyGroomMultiplier(teamPoints, groomIsPlaying) {
  return groomIsPlaying ? Math.round(teamPoints * 1.25) : teamPoints
}

/** Apply Day 3 2x multiplier when active */
export function applyDay3Multiplier(points, day, multiplierActive) {
  return day === 3 && multiplierActive ? points * 2 : points
}

/** Card draw milestone: every 50 pts crossed earns a card draw.
 *  Returns array of milestone totals that were newly crossed. */
export function checkCardDrawMilestones(prevTotal, newTotal) {
  const milestones = []
  const INTERVAL = 50
  const firstNew = Math.floor(prevTotal / INTERVAL) + 1
  const lastNew = Math.floor(newTotal / INTERVAL)
  for (let i = firstNew; i <= lastNew; i++) {
    milestones.push(i * INTERVAL)
  }
  return milestones
}

/** Day champion bonus: team with most points on a given day gets +25 pts */
export const DAY_CHAMPION_BONUS = 25

/** Calculate which teamId won a given day's points */
export function calcDayChampion(teams) {
  // teams: [{ id, dayPoints }]
  if (!teams.length) return null
  return teams.reduce((best, t) => (t.dayPoints > best.dayPoints ? t : best)).id
}
