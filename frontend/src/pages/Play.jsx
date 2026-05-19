import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { pb } from '@/lib/pb'

function Scoreboard({ teams }) {
  const sorted = [...teams].sort((a, b) => b.score - a.score)
  return (
    <div className="space-y-2 w-full">
      {sorted.map((team, i) => (
        <div key={team.id} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-gray-400 font-mono text-sm w-6">#{i + 1}</span>
            <span className="text-white font-semibold">{team.name}</span>
          </div>
          <span className="text-yellow-400 font-bold text-lg">{team.score}</span>
        </div>
      ))}
    </div>
  )
}

export default function Play() {
  const { gameCode } = useParams()
  const [game, setGame] = useState(null)
  const [teams, setTeams] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [currentRound, setCurrentRound] = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [error, setError] = useState('')
  const gameIdRef = useRef(null)

  useEffect(() => {
    let unsubGame, unsubTeams

    async function init() {
      try {
        const g = await pb.collection('games').getFirstListItem(`game_code = "${gameCode}"`)
        setGame(g)
        gameIdRef.current = g.id

        const teamsRes = await pb.collection('teams').getList(1, 50, { filter: `game_id = "${g.id}"` })
        setTeams(teamsRes.items)

        pb.collection('announcements').getList(1, 5, { filter: 'is_active = true', sort: '-priority,-created' })
          .then(r => setAnnouncements(r.items))

        unsubGame = await pb.collection('games').subscribe(g.id, ({ action, record }) => {
          if (action === 'update') setGame(record)
        })

        unsubTeams = await pb.collection('teams').subscribe('*', ({ action, record }) => {
          if (record.game_id !== gameIdRef.current) return
          setTeams(prev =>
            action === 'create' ? [...prev, record]
            : action === 'update' ? prev.map(t => t.id === record.id ? record : t)
            : prev.filter(t => t.id !== record.id)
          )
        })
      } catch {
        setError('Game not found.')
      }
    }

    init()
    return () => { unsubGame?.(); unsubTeams?.() }
  }, [gameCode])

  useEffect(() => {
    if (!game || game.status !== 'active') return
    async function loadQuestion() {
      try {
        const rounds = await pb.collection('rounds').getList(1, 50, { filter: `game_id = "${game.id}"`, sort: 'created' })
        const round = rounds.items[game.current_round]
        if (!round) return
        setCurrentRound(round)
        const qId = (round.question_ids || [])[game.current_question_index]
        if (qId) {
          const q = await pb.collection('questions').getOne(qId)
          setCurrentQuestion(q)
        }
      } catch {}
    }
    loadQuestion()
  }, [game?.status, game?.current_round, game?.current_question_index])

  if (error) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-red-400 text-xl">{error}</p>
    </div>
  )
  if (!game) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <h1 className="font-black text-yellow-400 text-lg">🍺 {game.game_code}</h1>
        <span className="text-gray-400 text-sm capitalize">{game.status.replace('_', ' ')}</span>
      </header>

      <main className="flex-1 p-4 space-y-4 max-w-lg mx-auto w-full">
        {announcements.length > 0 && (
          <div className="space-y-1">
            {announcements.map(a => (
              <div key={a.id} className="bg-purple-900/50 border border-purple-700 rounded-xl px-4 py-2">
                <p className="text-purple-100 text-sm">{a.text}</p>
              </div>
            ))}
          </div>
        )}

        {game.status === 'lobby' && (
          <div className="text-center py-12 space-y-4">
            <p className="text-4xl">⏳</p>
            <h2 className="text-2xl font-bold">Waiting for game to start...</h2>
            <p className="text-gray-400">Teams joined: {teams.length}</p>
          </div>
        )}

        {game.status === 'active' && currentQuestion && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              {currentRound?.name} · Q{game.current_question_index + 1}
            </p>
            <div className="bg-gray-800 rounded-2xl p-6">
              <p className="text-xl font-semibold leading-relaxed">{currentQuestion.question_text}</p>
            </div>
            <p className="text-gray-500 text-sm text-center">Write your answer — GM will reveal and score</p>
          </div>
        )}

        {game.status === 'round_end' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Round Complete!</h2>
            <Scoreboard teams={teams} />
          </div>
        )}

        {game.status === 'finished' && (
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-center text-yellow-400">Game Over!</h2>
            <Scoreboard teams={teams} />
          </div>
        )}
      </main>
    </div>
  )
}
