import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { pb } from '@/lib/pb'
import { RequireAuth } from '@/lib/RequireAuth'
import QuestionForm from '@/components/questions/QuestionForm'
import OTDBImport from '@/components/questions/OTDBImport'
import AIImport from '@/components/questions/AIImport'

const TABS = ['browse', 'manual', 'otdb', 'ai']

function QuestionManagerContent() {
  const [tab, setTab] = useState('browse')
  const [questions, setQuestions] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  async function loadQuestions(p = 1) {
    const res = await pb.collection('questions').getList(p, 20, {
      expand: 'category_id',
      sort: '-created',
    })
    setQuestions(res.items)
    setTotal(res.totalItems)
    setPage(p)
  }

  useEffect(() => { loadQuestions() }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <Link to="/gm" className="text-gray-400 hover:text-white text-sm">← Dashboard</Link>
        <h1 className="font-bold text-white">Question Manager</h1>
        <span className="text-gray-400 text-sm">{total} questions</span>
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        <div className="flex gap-1 bg-gray-800 rounded-xl p-1">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors capitalize ${
                tab === t ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
              }`}>
              {t === 'otdb' ? 'Web Import' : t === 'ai' ? 'AI Generate' : t}
            </button>
          ))}
        </div>

        {tab === 'manual' && <QuestionForm onSaved={() => loadQuestions(1)} />}
        {tab === 'otdb' && <OTDBImport onImported={() => loadQuestions(1)} />}
        {tab === 'ai' && <AIImport onImported={() => loadQuestions(1)} />}

        {tab === 'browse' && (
          <div className="space-y-2">
            {questions.length === 0 && (
              <p className="text-gray-400 text-center py-8">No questions yet. Add some using the other tabs.</p>
            )}
            {questions.map(q => (
              <div key={q.id} className="bg-gray-900 rounded-xl px-4 py-3 space-y-1">
                <p className="text-white text-sm">{q.question_text}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-yellow-400 text-xs font-medium">{q.answer}</span>
                  {q.expand?.category_id && (
                    <span className="text-purple-300 text-xs">{q.expand.category_id.name}</span>
                  )}
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    q.source === 'ai'   ? 'bg-blue-900 text-blue-300' :
                    q.source === 'otdb' ? 'bg-green-900 text-green-300' :
                    'bg-gray-700 text-gray-400'
                  }`}>{q.source}</span>
                  <span className="text-gray-500 text-xs">{q.difficulty}</span>
                </div>
              </div>
            ))}
            <div className="flex gap-2 justify-center pt-2">
              <button disabled={page === 1} onClick={() => loadQuestions(page - 1)}
                className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50 text-sm">Prev</button>
              <span className="text-gray-400 text-sm py-1">Page {page}</span>
              <button disabled={questions.length < 20} onClick={() => loadQuestions(page + 1)}
                className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50 text-sm">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function QuestionManager() {
  return <RequireAuth><QuestionManagerContent /></RequireAuth>
}
