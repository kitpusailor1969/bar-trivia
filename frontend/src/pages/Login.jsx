import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const user = await login(username.trim(), password)
      navigate(user.role === 'admin' ? '/admin' : '/gm', { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid credentials.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center p-6">
      <Link to="/" className="text-4xl font-black text-white mb-2 hover:text-yellow-400 transition-colors">🍺 Bar Trivia</Link>
      <p className="text-purple-200 mb-8">Game Master Login</p>
      <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur rounded-3xl p-8 w-full max-w-sm space-y-4">
        <div className="space-y-1">
          <label className="text-purple-200 text-sm">Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} autoFocus
            className="w-full bg-white/10 border border-purple-400 rounded-lg px-3 py-2 text-white placeholder:text-purple-300 focus:outline-none focus:border-yellow-400" />
        </div>
        <div className="space-y-1">
          <label className="text-purple-200 text-sm">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full bg-white/10 border border-purple-400 rounded-lg px-3 py-2 text-white placeholder:text-purple-300 focus:outline-none focus:border-yellow-400" />
        </div>
        {error && <p className="text-red-300 text-sm text-center">{error}</p>}
        <button type="submit" disabled={loading || !username || !password}
          className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl disabled:opacity-50 transition-colors">
          {loading ? 'Signing in...' : 'Sign In →'}
        </button>
      </form>
    </div>
  )
}
