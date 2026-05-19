import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { pb } from '@/lib/pb'
import { useAuth } from '@/lib/AuthContext'

export default function Setup() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [checking, setChecking] = useState(true)
  const [username, setUsername] = useState('bar-admin')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    pb.collection('users').getList(1, 1, { filter: "role = 'admin'" })
      .then(res => {
        if (res.totalItems > 0) navigate('/login', { replace: true })
        else setChecking(false)
      })
      .catch(() => setChecking(false))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true); setError('')
    try {
      await pb.collection('users').create({
        username: username.toLowerCase(),
        display_name: 'Bar Admin',
        role: 'admin',
        is_active: true,
        password,
        passwordConfirm: password,
      })
      await login(username.toLowerCase(), password)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message || 'Setup failed.')
      setLoading(false)
    }
  }

  if (checking) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-black text-white mb-2">Bar Trivia</h1>
      <p className="text-purple-200 mb-8">First-time setup</p>
      <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur rounded-3xl p-8 w-full max-w-sm space-y-4">
        <h2 className="text-2xl font-bold text-white text-center">Create Admin Account</h2>
        <div className="space-y-1">
          <label className="text-purple-200 text-sm">Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)}
            className="w-full bg-white/10 border border-purple-400 rounded-lg px-3 py-2 text-white placeholder:text-purple-300 focus:outline-none focus:border-yellow-400" />
        </div>
        <div className="space-y-1">
          <label className="text-purple-200 text-sm">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="w-full bg-white/10 border border-purple-400 rounded-lg px-3 py-2 text-white placeholder:text-purple-300 focus:outline-none focus:border-yellow-400" />
        </div>
        <div className="space-y-1">
          <label className="text-purple-200 text-sm">Confirm Password</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
            placeholder="Repeat password"
            className="w-full bg-white/10 border border-purple-400 rounded-lg px-3 py-2 text-white placeholder:text-purple-300 focus:outline-none focus:border-yellow-400" />
        </div>
        {error && <p className="text-red-300 text-sm text-center">{error}</p>}
        <button type="submit" disabled={loading || !password || !confirm}
          className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl disabled:opacity-50 transition-colors">
          {loading ? 'Creating...' : 'Create Admin Account →'}
        </button>
      </form>
    </div>
  )
}
