import { useState, useEffect } from 'react'
import { pb } from '@/lib/pb'
import { generateGameCode } from '@/utils/gameCode'

export default function GameSetup({ user, onCreated }) {
  const [gmName, setGmName] = useState(user?.display_name || user?.username || '')
  const [rounds, setRounds] = useState([{ name: 'Round 1', categoryId: '', questionCount: 5 }])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    pb.collection('categories').getList(1, 200, { sort: 'name' }).then(r => setCategories(r.items))
  }, [])

  function addRound() {
    setRounds(prev => [...prev, { name: `Round ${prev.length + 1}`, categoryId: '', questionCount: 5 }])
  }

  function updateRound(i, field, value) {
    setRounds(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r))
  }

  async function handleCreate() {
    setLoading(true); setError('')
    try {
      const gameCode = generateGameCode()
      const game = await pb.collection('games').create({
        game_code: gameCode,
        status: 'lobby',
        gm_name: gmName,
        created_by: user?.username,
        current_round: 0,
        current_question_index: 0,
      })

      for (const [i, r] of rounds.entries()) {
        const questionsRes = await pb.collection('questions').getList(1, r.questionCount, {
          filter: r.categoryId ? `category_id = "${r.categoryId}"` : '',
          sort: '@random',
        })
        await pb.collection('rounds').create({
          game_id: game.id,
          name: r.name,
          category_id: r.categoryId,
          question_ids: questionsRes.items.map(q => q.id),
          status: i === 0 ? 'active' : 'pending',
        })
      }

      onCreated(game)
    } catch (err) {
      setError(err.message || 'Failed to create game.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-gray-300 text-sm">Your Name (GM)</label>
        <input value={gmName} onChange={e => setGmName(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-400" />
      </div>

      <div className="space-y-2">
        <p className="text-gray-300 text-sm font-medium">Rounds</p>
        {rounds.map((r, i) => (
          <div key={i} className="bg-gray-700 rounded-xl p-3 space-y-2">
            <input value={r.name} onChange={e => updateRound(i, 'name', e.target.value)}
              placeholder="Round name"
              className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm focus:outline-none" />
            <div className="flex gap-2">
              <select value={r.categoryId} onChange={e => updateRound(i, 'categoryId', e.target.value)}
                className="flex-1 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm focus:outline-none">
                <option value="">Any category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="number" value={r.questionCount} min={1} max={20}
                onChange={e => updateRound(i, 'questionCount', Number(e.target.value))}
                className="w-16 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm focus:outline-none" />
            </div>
          </div>
        ))}
        <button onClick={addRound} className="text-yellow-400 hover:text-yellow-300 text-sm">+ Add Round</button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button onClick={handleCreate} disabled={loading || !gmName.trim()}
        className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl disabled:opacity-50 transition-colors">
        {loading ? 'Creating...' : 'Create Game →'}
      </button>
    </div>
  )
}
