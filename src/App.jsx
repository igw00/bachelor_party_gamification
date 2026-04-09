import { Routes, Route, useNavigate } from 'react-router-dom'
import StatusBar from './components/layout/StatusBar'
import TabBar from './components/layout/TabBar'
import QuickAddSheet from './components/points/QuickAddSheet'
import Scoreboard from './pages/Scoreboard'
import Rules from './pages/Rules'
import Setup from './pages/Setup'
import ClaimIdentity from './pages/ClaimIdentity'
import { useCompetition } from './hooks/useCompetition'
import { usePlayers } from './hooks/usePlayers'
import { useTeams } from './hooks/useTeams'
import { useIdentity } from './hooks/useIdentity'
import { useRosterSeed } from './hooks/useRosterSeed'
import useStore from './store/useStore'

const COMMISSIONER_NAME = 'Ian Waltz'

export default function App() {
  const { competition } = useCompetition()
  usePlayers()
  useTeams()
  useRosterSeed()

  const { claimedPlayerId } = useIdentity()
  const players = useStore((s) => s.players)
  const claimedPlayer = players.find((p) => p.id === claimedPlayerId) ?? null
  const isCommissioner = claimedPlayer?.name === COMMISSIONER_NAME

  if (!claimedPlayerId) {
    return <ClaimIdentity />
  }

  return (
    <div className="min-h-dvh bg-background font-body text-on-surface">
      <StatusBar competition={competition} />
      <AppBar player={claimedPlayer} isCommissioner={isCommissioner} />

      <Routes>
        <Route path="/" element={<Scoreboard />} />
        <Route path="/rules" element={<Rules />} />
        {isCommissioner && <Route path="/setup" element={<Setup />} />}
      </Routes>

      <TabBar />
      <QuickAddSheet />
    </div>
  )
}

function AppBar({ player, isCommissioner }) {
  const navigate = useNavigate()
  const teams = useStore((s) => s.teams)

  const initials = player?.name
    ? player.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const myTeam = player?.teamId ? teams.find((t) => t.id === player.teamId) : null

  return (
    <header className="fixed top-8 w-full z-50 bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary-container">calendar_today</span>
        <h1 className="font-headline font-black text-xl tracking-tight text-secondary">
          The St. Pete Invitational
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {isCommissioner && (
          <button
            onClick={() => navigate('/setup')}
            className="text-on-surface-variant active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
        )}

        {player && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-on-secondary font-bold text-[11px] leading-none">{initials}</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="font-headline font-bold text-xs text-on-surface leading-tight">{player.name.split(' ')[0]}</span>
              <span className="text-[10px] text-on-surface-variant leading-tight">
                {myTeam ? `${myTeam.name} — ${player.individualPoints ?? 0} pts` : `${player.individualPoints ?? 0} pts`}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
