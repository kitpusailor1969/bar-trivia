import { useState, useEffect } from 'react'
import { pb } from '@/lib/pb'

export default function QuestionForm({ onSaved }) {
  const [text, setText] = useState('')
  const [answer, setAnswer] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [categories, setCategories] = useState([])
  const [newCat, setNewCat] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    pb.collection('categories').getList(1, 200, { sort: 'name' }).then(r => setCategories(r.items))
  }, [])

  async function addCategory() {
    if (!newCat.trim()) return
    const cat = await pb.collection('categories').create({ name: newCat.trim(), color: '#a855f7' })
    setCategories(prev => [...prev, cat])
    setCategoryId(cat.id)
    setNewCat('')
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!text.trim() || !answer.trim()) return
    setLoading(true); setError('')
    try {
      await pb.collection('questions').create({
        question_text: text.trim(),
        answer: answer.trim(),
        category_id: categoryId || null,
        difficulty,
        source: 'manual',
      })
      setText(''); setAnswer('')
      onSaved?.()
    } catch (err) {
      setError(err.message || 'Failed to save.')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <textarea value={text} onChange={e => setText(e.target.value)} rows={2}
        placeholder="Question text..."
        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:border-yellow-400 resize-none" />
      <input value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Answer"
        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:border-yellow-400" />
      <div className="flex gap-2">
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-400">
          <option value="">No category</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
          className="w-28 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-400">
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <div className="flex gap-2">
        <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="New category name"
          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:border-yellow-400" />
        <button type="button" onClick={addCategory} disabled={!newCat.trim()}
          className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm disabled:opacity-50">Add Cat</button>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button type="submit" disabled={loading || !text.trim() || !answer.trim()}
        className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg disabled:opacity-50 transition-colors">
        {loading ? 'Saving...' : 'Save Question'}
      </button>
    </form>
  )
}
