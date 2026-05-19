import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { pb } from '@/lib/pb'

export default function Join() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [teamName, setTeamName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [game, setGame] = useState(null)

  async function handleFindGame(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const g = await pb.collection('games').getFirstListItem(`game_code = "${code.toUpperCase().trim()}"`)
      if (g.status === 'finished') { setError('That game has already ended.'); setLoading(false); return }
      setGame(g)
    } catch {
      setError('Game not found. Check the code and try again.')
    }
    setLoading(false)
  }

  async function handleJoin(e) {
    e.preventDefault()
    if (!teamName.trim()) return
    setLoading(true); setError('')
    try {
      await pb.collection('teams').create({ game_id: game.id, name: teamName.trim(), members: [], score: 0 })
      navigate(`/play/${game.game_code}`)
    } catch (err) {
      setError(err.message || 'Failed to join.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center p-6">
      <Link to="/" className="text-3xl font-black text-white mb-8 hover:text-yellow-400">🍺 Bar Trivia</Link>

      {!game ? (
        <form onSubmit={handleFindGame} className="bg-white/10 backdrop-blur rounded-3xl p-8 w-full max-w-sm space-y-4">
          <h2 className="text-2xl font-bold text-white text-center">Enter Game Code</h2>
          <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. ABC123" maxLength={6}
            className="w-full bg-white/10 border border-purple-400 rounded-lg px-3 py-3 text-white text-center text-2xl font-mono placeholder:text-purple-400 focus:outline-none focus:border-yellow-400 tracking-widest" />
          {error && <p className="text-red-300 text-sm text-center">{error}</p>}
          <button type="submit" disabled={loading || code.length < 4}
            className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl disabled:opacity-50 transition-colors">
            {loading ? 'Finding...' : 'Find Game →'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleJoin} className="bg-white/10 backdrop-blur rounded-3xl p-8 w-full max-w-sm space-y-4">
          <h2 className="text-2xl font-bold text-white text-center">Game: {game.game_code}</h2>
          <p className="text-purple-200 text-center text-sm">GM: {game.gm_name}</p>
          <input value={teamName} onChange={e => setTeamName(e.target.value)}
            placeholder="Your team name" maxLength={30}
            className="w-full bg-white/10 border border-purple-400 rounded-lg px-3 py-3 text-white placeholder:text-purple-300 focus:outline-none focus:border-yellow-400" />
          {error && <p className="text-red-300 text-sm text-center">{error}</p>}
          <button type="submit" disabled={loading || !teamName.trim()}
            className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl disabled:opacity-50 transition-colors">
            {loading ? 'Joining...' : 'Join Game →'}
          </button>
        </form>
      )}
    </div>
  )
}
