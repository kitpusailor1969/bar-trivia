import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { pb } from '@/lib/pb'
import { useAuth } from '@/lib/AuthContext'
import { RequireAuth } from '@/lib/RequireAuth'
import GameSetup from '@/components/gm/GameSetup'

function GMDashboardContent() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [games, setGames] = useState([])
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    pb.collection('games')
      .getList(1, 50, { filter: `created_by = "${user?.username}"`, sort: '-created' })
      .then(r => setGames(r.items))
  }, [user])

  function handleCreated(game) {
    setGames(prev => [game, ...prev])
    setShowCreate(false)
    navigate(`/gm/game/${game.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <h1 className="font-black text-yellow-400 text-xl">🍺 Bar Trivia</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user?.display_name || user?.username}</span>
          <button onClick={logout} className="text-gray-400 hover:text-white text-sm underline">Sign Out</button>
        </div>
      </header>

      <div className="p-4 max-w-lg mx-auto space-y-4">
        {!showCreate ? (
          <button onClick={() => setShowCreate(true)}
            className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-2xl text-lg transition-colors">
            + New Game
          </button>
        ) : (
          <div className="bg-gray-900 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Create New Game</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <GameSetup user={user} onCreated={handleCreated} />
          </div>
        )}

        <h2 className="text-gray-400 text-sm font-medium">Recent Games</h2>
        {games.map(g => (
          <button key={g.id} onClick={() => navigate(`/gm/game/${g.id}`)}
            className="w-full bg-gray-900 hover:bg-gray-800 rounded-2xl px-4 py-3 text-left flex items-center justify-between transition-colors">
            <div>
              <p className="text-white font-mono font-bold">{g.game_code}</p>
              <p className="text-gray-400 text-xs">{g.gm_name}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              g.status === 'active' ? 'bg-green-900 text-green-300' :
              g.status === 'lobby'  ? 'bg-blue-900 text-blue-300' :
              'bg-gray-700 text-gray-400'
            }`}>{g.status}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function GMDashboard() {
  return <RequireAuth><GMDashboardContent /></RequireAuth>
}
