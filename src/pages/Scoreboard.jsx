import { useNavigate } from 'react-router-dom'
import { useTeams } from '../hooks/useTeams'
import { usePlayers } from '../hooks/usePlayers'
import { useCards } from '../hooks/useCards'
import { useCompetition } from '../hooks/useCompetition'
import { useCollection } from '../hooks/useFirestore'
import { useIdentity } from '../hooks/useIdentity'
import useStore from '../store/useStore'
import TeamCard from '../components/scoreboard/TeamCard'
import { useCallback, useState } from 'react'
import { devReset } from '../lib/devReset'

const IS_DEV = import.meta.env.VITE_APP_ENV === 'dev'
const COMMISSIONER_NAME = 'Ian Waltz'

const MEDAL_ICONS = ['emoji_events', 'workspace_premium', 'military_tech']
const MEDAL_COLORS = ['text-primary', 'text-secondary', 'text-tertiary']
const RANK_LABELS = ['1st', '2nd', '3rd']

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(seconds) {
  if (!seconds) return ''
  const diff = Math.floor(Date.now() / 1000) - seconds
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ── Activity Feed ─────────────────────────────────────────────────────────────

function ActivityFeed({ events, players, teams }) {
  const [filterPlayerId, setFilterPlayerId] = useState('all')

  const assignedPlayers = [...players]
    .filter((p) => p.teamId)
    .sort((a, b) => a.name.localeCompare(b.name))

  const sorted = [...events].sort(
    (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
  )

  const filtered = filterPlayerId === 'all'
    ? sorted
    : sorted.filter((e) => e.playerId === filterPlayerId)

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-4 overflow-x-auto -mx-5 px-5 scrollbar-none">
        <div className="flex gap-2 w-max">
          <button
            onClick={() => setFilterPlayerId('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex-shrink-0
              ${filterPlayerId === 'all'
                ? 'bg-secondary text-on-secondary'
                : 'bg-surface-container text-on-surface-variant'}`}
          >
            Everyone
          </button>
          {assignedPlayers.map((p) => (
            <button
              key={p.id}
              onClick={() => setFilterPlayerId(p.id === filterPlayerId ? 'all' : p.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex-shrink-0
                ${filterPlayerId === p.id
                  ? 'bg-secondary text-on-secondary'
                  : 'bg-surface-container text-on-surface-variant'}`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      {filtered.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">receipt_long</span>
          <p className="font-headline font-bold text-on-surface">No activity yet</p>
          <p className="text-sm text-on-surface-variant mt-1">Points logged will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((event) => {
            const player = players.find((p) => p.id === event.playerId)
            const team = teams.find((t) => t.id === event.teamId)
            const indPts = event.pointsIndividual ?? 0
            const teamPts = event.pointsTeam ?? 0

            return (
              <div
                key={event.id}
                className="bg-surface-container-lowest rounded-xl px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center gap-3"
              >
                {/* Avatar initial */}
                <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-headline font-black text-sm text-secondary">
                    {player?.name?.[0] ?? '?'}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-sm text-on-surface">
                      {player?.isGroom ? `${player.name} 💍` : (player?.name ?? 'Unknown')}
                    </span>
                    {player?.isCaptain && (
                      <span className="text-[9px] font-black bg-secondary-fixed text-secondary px-1.5 py-0.5 rounded-full">C</span>
                    )}
                    {team && (
                      <span className="text-[10px] text-on-surface-variant">· {team.name}</span>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-xs text-on-surface-variant mt-0.5 truncate">{event.description}</p>
                  )}
                  <p className="text-[10px] text-on-surface-variant/60 mt-0.5">
                    Day {event.day ?? 1} · {relativeTime(event.createdAt?.seconds)}
                  </p>
                </div>

                {/* Points */}
                <div className="flex-shrink-0 text-right space-y-0.5">
                  {indPts > 0 && (
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wide">ind</span>
                      <span className="font-headline font-black text-base text-secondary">+{indPts}</span>
                    </div>
                  )}
                  {teamPts > 0 && (
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wide">team</span>
                      <span className="font-headline font-black text-base text-primary">+{teamPts}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Individual leaderboard ────────────────────────────────────────────────────

function IndividualLeaderboard({ players, teams, events }) {
  const sorted = [...players]
    .filter((p) => p.teamId)
    .sort((a, b) => (b.individualPoints ?? 0) - (a.individualPoints ?? 0))

  const topPts = sorted[0]?.individualPoints ?? 0

  const recentEvents = [...events]
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
    .slice(0, 10)
  const moveCounts = {}
  recentEvents.forEach((e) => {
    if (e.playerId) moveCounts[e.playerId] = (moveCounts[e.playerId] || 0) + (e.pointsIndividual || 0)
  })
  const fastestMoverId = Object.entries(moveCounts).sort((a, b) => b[1] - a[1])[0]?.[0]

  if (sorted.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-8 text-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">person</span>
        <p className="font-headline font-bold text-on-surface">No players yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sorted.map((player, i) => {
        const team = teams.find((t) => t.id === player.teamId)
        const pts = player.individualPoints ?? 0
        const barWidth = topPts > 0 ? (pts / topPts) * 100 : 0
        const isFastest = player.id === fastestMoverId && pts > 0
        const isTop3 = i < 3

        return (
          <div
            key={player.id}
            className={`relative bg-surface-container-lowest rounded-xl px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden
              ${isTop3 ? 'border-l-4' : 'border-l-4 border-surface-container-highest'}
              ${i === 0 ? 'border-primary' : i === 1 ? 'border-secondary/40' : i === 2 ? 'border-tertiary/40' : ''}`}
          >
            {i === 0 && (
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-6 -mt-6 pointer-events-none" />
            )}

            <div className="relative flex items-center gap-3">
              <div className="w-8 text-center flex-shrink-0">
                {isTop3 ? (
                  <span className={`material-symbols-outlined text-xl ${MEDAL_COLORS[i]}`}
                    style={{ fontVariationSettings: "'FILL' 1" }}>
                    {MEDAL_ICONS[i]}
                  </span>
                ) : (
                  <span className="font-headline font-bold text-sm text-on-surface-variant">{i + 1}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-headline font-bold text-sm text-on-surface truncate">
                    {player.isGroom ? `${player.name} 💍` : player.name}
                  </span>
                  {player.isCaptain && (
                    <span className="text-[9px] font-black bg-secondary-fixed text-secondary px-1.5 py-0.5 rounded-full flex-shrink-0">C</span>
                  )}
                  {isFastest && (
                    <span className="text-[9px] font-black bg-tertiary/10 text-tertiary px-1.5 py-0.5 rounded-full flex-shrink-0">🔥 Hot</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {team && (
                    <span className="text-[10px] text-on-surface-variant truncate">{team.name}</span>
                  )}
                </div>
                <div className="mt-1.5 h-1 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500
                      ${i === 0 ? 'bg-primary' : i === 1 ? 'bg-secondary' : i === 2 ? 'bg-tertiary' : 'bg-on-surface-variant/30'}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>

              <div className="flex-shrink-0 text-right">
                <span className={`font-headline font-extrabold text-2xl ${i === 0 ? 'text-primary' : 'text-on-surface'}`}>
                  {pts}
                </span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">pts</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main Scoreboard ───────────────────────────────────────────────────────────

export default function Scoreboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('teams')

  const { teams } = useTeams()
  const { players } = usePlayers()
  const { cards } = useCards()
  const { competition } = useCompetition()
  const { events, setEvents } = useStore()
  const { claimedPlayerId } = useIdentity()
  const claimedPlayer = players.find((p) => p.id === claimedPlayerId) ?? null
  const isCommissioner = claimedPlayer?.name === COMMISSIONER_NAME

  useCollection('events', useCallback(setEvents, [setEvents]))

  const sortedTeams = [...teams].sort((a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0))

  const recentEvents = [...events]
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
    .slice(0, 10)
  const moveCounts = {}
  recentEvents.forEach((e) => {
    if (e.playerId) moveCounts[e.playerId] = (moveCounts[e.playerId] || 0) + (e.pointsIndividual || 0)
  })
  const fastestMoverId = Object.entries(moveCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
  const fastestMover = players.find((p) => p.id === fastestMoverId)

  const noTeams = sortedTeams.length === 0

  const TABS = [
    { id: 'teams', label: 'Teams', icon: 'groups' },
    { id: 'individuals', label: 'Players', icon: 'person' },
    { id: 'activity', label: 'Activity', icon: 'receipt_long' },
  ]

  return (
    <main className="pt-24 pb-32 px-5 max-w-2xl mx-auto">
      {/* Title */}
      <section className="mb-4">
        <h2 className="font-headline font-extrabold text-4xl text-secondary leading-tight">
          Standings
        </h2>
        <p className="font-body text-on-surface-variant mt-1 text-sm">
          Live updates from the St. Petersburg fields.
        </p>
      </section>

      {/* Tab bar */}
      <div className="flex gap-1 bg-surface-container rounded-xl p-1 mb-5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 px-1 rounded-lg text-xs font-bold transition-all active:scale-95
              ${tab === t.id
                ? 'bg-surface-container-lowest text-secondary shadow-sm'
                : 'text-on-surface-variant'
              }`}
          >
            <span
              className="material-symbols-outlined text-base"
              style={{ fontVariationSettings: tab === t.id ? "'FILL' 1" : "'FILL' 0" }}
            >
              {t.icon}
            </span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {noTeams && tab !== 'activity' && (
        <div className="bg-surface-container-lowest rounded-xl p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">sports</span>
          {isCommissioner ? (
            <>
              <p className="font-headline font-bold text-lg text-on-surface mb-1">No teams yet</p>
              <p className="text-sm text-on-surface-variant mb-4">Complete setup to get started.</p>
              <button
                onClick={() => navigate('/setup')}
                className="bg-primary-container text-on-primary font-bold px-6 py-3 rounded-full text-sm active:scale-95 transition-transform"
              >
                Go to Setup
              </button>
              {IS_DEV && <ScoreboardDevReset navigate={navigate} />}
            </>
          ) : competition?.setupComplete === false && competition?.currentDay ? (
            <p className="font-headline font-bold text-lg text-on-surface mb-2 animate-pulse">Setting up teams…</p>
          ) : (
            <>
              <p className="font-headline font-bold text-lg text-on-surface mb-2">Draft not started yet</p>
              <p className="text-sm text-on-surface-variant">Please wait for Ian Waltz to complete the draft.</p>
            </>
          )}
        </div>
      )}

      {/* Teams tab */}
      {!noTeams && tab === 'teams' && (
        <div className="space-y-4">
          {sortedTeams.map((team, i) => (
            <TeamCard
              key={team.id}
              team={team}
              rank={i}
              players={players}
              cards={cards}
              events={events}
              allTeams={sortedTeams}
              claimedPlayerId={claimedPlayerId}
            />
          ))}

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="bg-tertiary-container/10 p-5 rounded-xl">
              <span className="material-symbols-outlined text-tertiary mb-2 block">trending_up</span>
              <p className="text-xs font-bold text-tertiary uppercase tracking-wider">Fastest Mover</p>
              <p className="font-headline font-bold text-lg mt-1 text-on-tertiary-container">
                {fastestMover
                  ? fastestMover.isGroom ? `${fastestMover.name} 💍` : fastestMover.name
                  : '—'}
              </p>
            </div>
            <div className="bg-primary-fixed/30 p-5 rounded-xl">
              <span className="material-symbols-outlined text-primary mb-2 block">emoji_events</span>
              <p className="text-xs font-bold text-primary uppercase tracking-wider">Day {competition?.currentDay ?? 1}</p>
              <p className="font-headline font-bold text-lg mt-1 text-on-primary-container">
                {sortedTeams[0]?.name ?? '—'}
              </p>
              <p className="text-[10px] text-primary">Leading</p>
            </div>
          </div>
        </div>
      )}

      {/* Individuals tab */}
      {!noTeams && tab === 'individuals' && (
        <IndividualLeaderboard players={players} teams={teams} events={events} />
      )}

      {/* Activity feed tab — always available */}
      {tab === 'activity' && (
        <ActivityFeed events={events} players={players} teams={teams} />
      )}
    </main>
  )
}

function ScoreboardDevReset({ navigate }) {
  const [confirm, setConfirm] = useState(false)
  const [resetting, setResetting] = useState(false)

  async function handleReset() {
    setResetting(true)
    try { await devReset() } finally { window.location.reload() }
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="mt-2 w-full py-2.5 rounded-full border border-dashed border-error/40 text-error text-sm font-bold active:scale-95 transition-transform"
      >
        DEV: Reset All Data
      </button>
    )
  }

  return (
    <div className="mt-2 rounded-xl border border-error/30 bg-error/5 p-4 space-y-3">
      <p className="text-sm font-bold text-error">Wipes all teams, events, cards, and resets players.</p>
      <div className="flex gap-3">
        <button onClick={() => setConfirm(false)} className="flex-1 py-2.5 rounded-full text-sm font-bold text-on-surface-variant">
          Cancel
        </button>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="flex-[2] py-2.5 rounded-full bg-error text-white text-sm font-bold active:scale-95 transition-transform disabled:opacity-50"
        >
          {resetting ? 'Resetting…' : 'Yes, reset everything'}
        </button>
      </div>
    </div>
  )
}
