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
import { useIdentity } from './hooks/useIdentity'
import { useRosterSeed } from './hooks/useRosterSeed'

export default function App() {
  const { competition } = useCompetition()
  usePlayers() // subscribe globally so store is populated everywhere
  useRosterSeed() // seed player profiles on first-ever load

  const { claimedPlayerId } = useIdentity()

  // First interaction: claim your profile before anything else
  if (!claimedPlayerId) {
    return <ClaimIdentity />
  }

  return (
    <div className="min-h-dvh bg-background font-body text-on-surface">
      <StatusBar competition={competition} />
      <AppBar />

      <Routes>
        <Route path="/" element={<Scoreboard />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/setup" element={<Setup />} />
      </Routes>

      <TabBar />
      <QuickAddSheet />
    </div>
  )
}

function AppBar() {
  const navigate = useNavigate()
  return (
    <header className="fixed top-8 w-full z-50 bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary-container">calendar_today</span>
        <h1 className="font-headline font-black text-xl tracking-tight text-secondary">
          The St. Pete Invitational
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/setup')}
          className="text-on-surface-variant active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>
    </header>
  )
}
