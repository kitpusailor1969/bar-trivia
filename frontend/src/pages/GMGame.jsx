import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { pb } from '@/lib/pb'
import { RequireAuth } from '@/lib/RequireAuth'
import GameControls from '@/components/gm/GameControls'

function GMGameContent() {
  const { id } = useParams()
  const [game, setGame] = useState(null)
  const [rounds, setRounds] = useState([])
  const [teams, setTeams] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(null)

  const load = useCallback(async () => {
    const [g, roundsRes, teamsRes] = await Promise.all([
      pb.collection('games').getOne(id),
      pb.collection('rounds').getList(1, 50, { filter: `game_id = "${id}"`, sort: 'created' }),
      pb.collection('teams').getList(1, 100, { filter: `game_id = "${id}"` }),
    ])
    setGame(g)
    setRounds(roundsRes.items)
    setTeams(teamsRes.items)

    if (g.status === 'active') {
      const round = roundsRes.items[g.current_round]
      const qId = round?.question_ids?.[g.current_question_index]
      if (qId) {
        const q = await pb.collection('questions').getOne(qId)
        setCurrentQuestion(q)
      } else {
        setCurrentQuestion(null)
      }
    }
  }, [id])

  useEffect(() => { load() }, [load])

  if (!game) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const round = rounds[game.current_round]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <Link to="/gm" className="text-gray-400 hover:text-white text-sm">← Dashboard</Link>
        <h1 className="font-black text-yellow-400">{game.game_code}</h1>
        <span className={`text-xs px-2 py-1 rounded-full ${
          game.status === 'active'    ? 'bg-green-900 text-green-300' :
          game.status === 'lobby'     ? 'bg-blue-900 text-blue-300' :
          game.status === 'round_end' ? 'bg-yellow-900 text-yellow-300' :
          'bg-gray-700 text-gray-400'
        }`}>{game.status.replace('_', ' ')}</span>
      </header>

      <div className="p-4 max-w-lg mx-auto space-y-4">
        {game.status === 'active' && currentQuestion && (
          <div className="bg-gray-900 rounded-2xl p-4 space-y-2">
            <p className="text-gray-400 text-xs">
              {round?.name} · Q{game.current_question_index + 1} of {round?.question_ids?.length}
            </p>
            <p className="text-white font-semibold">{currentQuestion.question_text}</p>
            <p className="text-yellow-400 font-bold">Answer: {currentQuestion.answer}</p>
          </div>
        )}

        <GameControls game={game} rounds={rounds} teams={teams} onUpdate={load} />
      </div>
    </div>
  )
}

export default function GMGame() {
  return <RequireAuth><GMGameContent /></RequireAuth>
}
