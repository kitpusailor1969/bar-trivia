import { pb } from '@/lib/pb'

export default function GameControls({ game, rounds, teams, onUpdate }) {
  const currentRound = rounds[game.current_round]
  const questionIds = currentRound?.question_ids || []
  const isLastQuestion = game.current_question_index >= questionIds.length - 1
  const isLastRound = game.current_round >= rounds.length - 1

  async function nextQuestion() {
    if (isLastQuestion) {
      await pb.collection('games').update(game.id, { status: 'round_end' })
    } else {
      await pb.collection('games').update(game.id, {
        current_question_index: game.current_question_index + 1,
      })
    }
    onUpdate()
  }

  async function nextRound() {
    if (isLastRound) {
      await pb.collection('games').update(game.id, { status: 'finished' })
    } else {
      await pb.collection('games').update(game.id, {
        status: 'active',
        current_round: game.current_round + 1,
        current_question_index: 0,
      })
    }
    onUpdate()
  }

  async function startGame() {
    await pb.collection('games').update(game.id, { status: 'active' })
    onUpdate()
  }

  async function adjustScore(teamId, delta) {
    const team = teams.find(t => t.id === teamId)
    if (!team) return
    await pb.collection('teams').update(teamId, { score: Math.max(0, team.score + delta) })
    onUpdate()
  }

  return (
    <div className="space-y-4">
      {game.status === 'lobby' && (
        <button onClick={startGame}
          className="w-full py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition-colors">
          Start Game
        </button>
      )}

      {game.status === 'active' && (
        <button onClick={nextQuestion}
          className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl transition-colors">
          {isLastQuestion ? 'End Round →' : 'Next Question →'}
        </button>
      )}

      {game.status === 'round_end' && (
        <button onClick={nextRound}
          className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl transition-colors">
          {isLastRound ? 'End Game →' : 'Next Round →'}
        </button>
      )}

      <div className="space-y-2">
        <p className="text-gray-400 text-sm font-medium">Team Scores</p>
        {[...teams].sort((a, b) => b.score - a.score).map(team => (
          <div key={team.id} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-2">
            <span className="text-white">{team.name}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => adjustScore(team.id, -1)} className="text-red-400 hover:text-red-300 w-6 text-center">−</button>
              <span className="text-yellow-400 font-bold w-8 text-center">{team.score}</span>
              <button onClick={() => adjustScore(team.id, 1)} className="text-green-400 hover:text-green-300 w-6 text-center">+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
