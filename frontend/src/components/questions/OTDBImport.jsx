import { useState, useEffect } from 'react'
import { pb } from '@/lib/pb'
import he from 'he'

export default function OTDBImport({ onImported }) {
  const [otdbCategories, setOtdbCategories] = useState([])
  const [selectedCat, setSelectedCat] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [count, setCount] = useState(10)
  const [preview, setPreview] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(0)

  useEffect(() => {
    fetch('https://opentdb.com/api_category.php')
      .then(r => r.json())
      .then(d => setOtdbCategories(d.trivia_categories || []))
      .catch(() => {})
  }, [])

  async function handleFetch() {
    setLoading(true); setError(''); setPreview([])
    try {
      const params = new URLSearchParams({ amount: count, type: 'multiple' })
      if (selectedCat) params.set('category', selectedCat)
      if (difficulty) params.set('difficulty', difficulty)
      const res = await fetch(`https://opentdb.com/api.php?${params}`)
      const data = await res.json()
      if (data.response_code !== 0) throw new Error('OTDB returned no results. Try different filters.')
      setPreview(data.results.map(q => ({
        question_text: he.decode(q.question),
        answer: he.decode(q.correct_answer),
        difficulty: q.difficulty,
      })))
    } catch (err) {
      setError(err.message || 'Failed to fetch questions.')
    }
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true); setError(''); setSaved(0)
    let n = 0
    for (const q of preview) {
      const escaped = q.question_text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
      const existing = await pb.collection('questions').getList(1, 1, {
        filter: `question_text = "${escaped}"`,
      }).catch(() => ({ totalItems: 0 }))
      if (existing.totalItems > 0) continue
      await pb.collection('questions').create({ ...q, source: 'otdb' })
      n++
    }
    setSaved(n); setPreview([])
    onImported?.()
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-400">
          <option value="">Any category</option>
          {otdbCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="flex gap-2">
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-400">
            <option value="">Any difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <input type="number" value={count} min={5} max={50} onChange={e => setCount(Number(e.target.value))}
            className="w-20 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-400" />
        </div>
        <button onClick={handleFetch} disabled={loading}
          className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg disabled:opacity-50 transition-colors">
          {loading ? 'Fetching...' : 'Fetch Questions'}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {saved > 0 && <p className="text-green-400 text-sm">{saved} questions saved.</p>}

      {preview.length > 0 && (
        <div className="space-y-2">
          <p className="text-gray-300 text-sm font-medium">Preview — {preview.length} questions</p>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {preview.map((q, i) => (
              <div key={i} className="bg-gray-800 rounded-lg px-3 py-2">
                <p className="text-white text-xs">{q.question_text}</p>
                <p className="text-yellow-400 text-xs mt-0.5">{q.answer}</p>
              </div>
            ))}
          </div>
          <button onClick={handleSave} disabled={saving}
            className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : `Save ${preview.length} Questions`}
          </button>
        </div>
      )}
    </div>
  )
}
