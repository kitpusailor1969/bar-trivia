import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { pb } from '@/lib/pb'

export default function Home() {
  const [needsSetup, setNeedsSetup] = useState(false)

  useEffect(() => {
    pb.collection('users').getList(1, 1, { filter: "role = 'admin'" })
      .then(res => setNeedsSetup(res.totalItems === 0))
      .catch(() => setNeedsSetup(true))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center p-6 gap-6">
      <h1 className="text-6xl font-black text-white">🍺 Bar Trivia</h1>
      <p className="text-purple-200 text-xl">Enter a game code to play</p>
      <Link to="/join"
        className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xl rounded-2xl transition-colors">
        Join Game
      </Link>
      <div className="flex gap-4 mt-4">
        {needsSetup
          ? <Link to="/setup" className="text-purple-300 hover:text-white text-sm underline">First-time setup</Link>
          : <Link to="/login" className="text-purple-300 hover:text-white text-sm underline">Game Master Login</Link>
        }
      </div>
    </div>
  )
}
