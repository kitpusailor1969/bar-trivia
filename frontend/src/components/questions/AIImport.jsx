import { useState } from 'react'
import { pb } from '@/lib/pb'

export default function AIImport({ onImported }) {
  const [topic, setTopic] = useState('')
  const [count, setCount] = useState(10)
  const [preview, setPreview] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(0)

  async function handleGenerate() {
    setLoading(true); setError(''); setPreview([])
    try {
      const res = await fetch('/api/custom/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pb.authStore.token}`,
        },
        body: JSON.stringify({ topic, count }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed.')
      setPreview(data.questions)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true); setSaved(0)
    let n = 0
    for (const q of preview) {
      await pb.collection('questions').create({
        question_text: q.question,
        answer: q.answer,
        difficulty: q.difficulty || 'medium',
        source: 'ai',
      })
      n++
    }
    setSaved(n); setPreview([])
    onImported?.()
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-400 text-sm">Generates questions using Claude AI. Requires an API key set in Admin → Settings.</p>
      <div className="flex gap-2">
        <input value={topic} onChange={e => setTopic(e.target.value)}
          placeholder="Topic (e.g. 1990s rock music)"
          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:border-yellow-400" />
        <input type="number" value={count} min={3} max={30} onChange={e => setCount(Number(e.target.value))}
          className="w-16 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-400" />
      </div>
      <button onClick={handleGenerate} disabled={loading || !topic.trim()}
        className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg disabled:opacity-50 transition-colors">
        {loading ? 'Generating...' : 'Generate Questions'}
      </button>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {saved > 0 && <p className="text-green-400 text-sm">{saved} questions saved.</p>}

      {preview.length > 0 && (
        <div className="space-y-2">
          <p className="text-gray-300 text-sm font-medium">Preview — {preview.length} questions</p>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {preview.map((q, i) => (
              <div key={i} className="bg-gray-800 rounded-lg px-3 py-2 space-y-1">
                <p className="text-white text-xs">{q.question}</p>
                <p className="text-yellow-400 text-xs">{q.answer}</p>
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
