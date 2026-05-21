import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { pb } from '@/lib/pb'
import { useAuth } from '@/lib/AuthContext'
import { RequireAuth } from '@/lib/RequireAuth'

function UsersTab() {
  const [users, setUsers] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newDisplay, setNewDisplay] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    pb.collection('users').getList(1, 100, { sort: 'username' }).then(r => setUsers(r.items))
  }, [])

  async function handleCreate(e) {
    e.preventDefault(); setError('')
    try {
      const u = await pb.collection('users').create({
        username: newUsername.toLowerCase().trim(),
        display_name: newDisplay.trim() || newUsername.trim(),
        role: 'gm',
        is_active: true,
        password: newPassword,
        passwordConfirm: newPassword,
      })
      setUsers(prev => [...prev, u])
      setShowAdd(false); setNewUsername(''); setNewDisplay(''); setNewPassword('')
    } catch (err) { setError(err.message) }
  }

  async function toggleActive(u) {
    await pb.collection('users').update(u.id, { is_active: !u.is_active })
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: !x.is_active } : x))
  }

  async function handleDelete(u) {
    if (!confirm(`Delete account "${u.username}"?`)) return
    await pb.collection('users').delete(u.id)
    setUsers(prev => prev.filter(x => x.id !== u.id))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">{users.length} accounts</p>
        <button onClick={() => setShowAdd(true)}
          className="text-sm bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-3 py-1.5 rounded-lg">
          + Add GM
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="bg-gray-800 rounded-xl p-4 space-y-2">
          <input value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="Username"
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none" />
          <input value={newDisplay} onChange={e => setNewDisplay(e.target.value)} placeholder="Display name (optional)"
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none" />
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Password (min 6)"
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none" />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={!newUsername || !newPassword}
              className="flex-1 py-2 bg-yellow-400 text-black font-bold rounded disabled:opacity-50 text-sm">Create</button>
            <button type="button" onClick={() => setShowAdd(false)}
              className="flex-1 py-2 bg-gray-600 text-white rounded text-sm">Cancel</button>
          </div>
        </form>
      )}

      {users.map(u => (
        <div key={u.id} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
          <div>
            <p className="text-white font-semibold text-sm">{u.display_name || u.username}</p>
            <p className="text-gray-400 text-xs">@{u.username} · {u.role}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => toggleActive(u)}
              className={`text-xs px-2 py-1 rounded-full font-medium ${u.is_active ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
              {u.is_active ? 'Active' : 'Disabled'}
            </button>
            {u.role !== 'admin' && (
              <button onClick={() => handleDelete(u)} className="text-red-400 hover:text-red-300 text-sm">✕</button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function GamesTab() {
  const [games, setGames] = useState([])
  useEffect(() => {
    pb.collection('games').getList(1, 100, { sort: '-created' }).then(r => setGames(r.items))
  }, [])

  async function handleDelete(g) {
    if (!confirm(`Delete game ${g.game_code}?`)) return
    await pb.collection('games').delete(g.id)
    setGames(prev => prev.filter(x => x.id !== g.id))
  }

  return (
    <div className="space-y-2">
      <p className="text-gray-400 text-sm">{games.length} games total</p>
      {games.map(g => (
        <div key={g.id} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
          <div>
            <p className="text-white font-mono font-bold">{g.game_code}</p>
            <p className="text-gray-400 text-xs">GM: {g.gm_name} · by {g.created_by}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              g.status === 'active'    ? 'bg-green-900 text-green-300' :
              g.status === 'lobby'     ? 'bg-blue-900 text-blue-300' :
              g.status === 'round_end' ? 'bg-yellow-900 text-yellow-300' :
              'bg-gray-700 text-gray-400'
            }`}>{g.status}</span>
            <button onClick={() => handleDelete(g)} className="text-red-400 hover:text-red-300 text-sm">✕</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function SettingsTab() {
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('claude-haiku-4-5-20251001')
  const [appName, setAppName] = useState('Bar Trivia')
  const [settingsId, setSettingsId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    pb.collection('settings').getList(1, 1).then(r => {
      if (r.items.length > 0) {
        const s = r.items[0]
        setSettingsId(s.id)
        setApiKey(s.ai_api_key || '')
        setModel(s.ai_model || 'claude-haiku-4-5-20251001')
        setAppName(s.app_name || 'Bar Trivia')
      }
    }).catch(() => {})
  }, [])

  async function handleSave(e) {
    e.preventDefault(); setSaving(true)
    const data = { ai_api_key: apiKey, ai_model: model, app_name: appName }
    if (settingsId) {
      await pb.collection('settings').update(settingsId, data)
    } else {
      const s = await pb.collection('settings').create(data)
      setSettingsId(s.id)
    }
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <div className="space-y-1">
        <label className="text-gray-300 text-sm">App Name</label>
        <input value={appName} onChange={e => setAppName(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-400" />
      </div>
      <div className="space-y-1">
        <label className="text-gray-300 text-sm">Anthropic API Key</label>
        <input value={apiKey} onChange={e => setApiKey(e.target.value)} type="password" placeholder="sk-ant-..."
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-400" />
      </div>
      <div className="space-y-1">
        <label className="text-gray-300 text-sm">AI Model</label>
        <select value={model} onChange={e => setModel(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-400">
          <option value="claude-haiku-4-5-20251001">Claude Haiku (fast, cheap)</option>
          <option value="claude-sonnet-4-6">Claude Sonnet (better quality)</option>
        </select>
      </div>
      <button type="submit" disabled={saving}
        className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg disabled:opacity-50 transition-colors">
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
      </button>
    </form>
  )
}

function AdminDashboardContent() {
  const { logout } = useAuth()
  const [tab, setTab] = useState('users')

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <h1 className="font-black text-yellow-400 text-xl">🛡️ Admin</h1>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition-colors">← Main Screen</Link>
          <Link to="/questions" className="text-gray-400 hover:text-white text-sm">Questions</Link>
          <Link to="/ads" className="text-gray-400 hover:text-white text-sm">Ads</Link>
          <button onClick={logout} className="text-gray-400 hover:text-white text-sm underline">Sign Out</button>
        </div>
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        <div className="flex gap-1 bg-gray-800 rounded-xl p-1">
          {[{ id: 'users', label: 'Users' }, { id: 'games', label: 'Games' }, { id: 'settings', label: 'Settings' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
              }`}>{t.label}</button>
          ))}
        </div>

        {tab === 'users' && <UsersTab />}
        {tab === 'games' && <GamesTab />}
        {tab === 'settings' && <SettingsTab />}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return <RequireAuth role="admin"><AdminDashboardContent /></RequireAuth>
}
