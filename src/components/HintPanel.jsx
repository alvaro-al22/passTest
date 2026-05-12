import { useState } from 'react'
import { useGame, GAMES } from '../context/GameContext'

export default function HintPanel() {
  const { state, dispatch } = useGame()
  const { completedGames, collectedHints } = state
  const [inputs, setInputs] = useState({})

  const handleSubmit = (game, value) => {
    const trimmed = value.trim().toUpperCase()
    if (trimmed === game.hint) {
      dispatch({ type: 'COMPLETE_GAME', id: game.id, hint: game.hint })
      setInputs(prev => ({ ...prev, [game.id]: '' }))
    } else {
      setInputs(prev => ({ ...prev, [game.id]: '' }))
      // shake feedback via brief re-render (no-op is fine, user sees the field reset)
    }
  }

  return (
    <div className="hint-panel">
      <div className="hint-panel-title">🔑 Pistas recopiladas</div>
      <div className="hint-cards">
        {GAMES.map((game) => {
          const done = completedGames.includes(game.id)
          return (
            <div key={game.id} className={`hint-card ${done ? 'hint-card--revealed' : ''}`}>
              <div className="hint-card-icon">{done ? '🔓' : '🔒'}</div>
              <div className="hint-card-word">
                {done ? collectedHints[game.id] : (
                  <input
                    className="hint-card-input"
                    type="text"
                    placeholder="???"
                    value={inputs[game.id] || ''}
                    onChange={e => setInputs(prev => ({ ...prev, [game.id]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit(game, inputs[game.id] || '')}
                  />
                )}
              </div>
              <div className="hint-card-label">{game.name}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
