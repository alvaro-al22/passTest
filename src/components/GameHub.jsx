import { useGame, GAMES } from '../context/GameContext'
import HintPanel from './HintPanel'

export default function GameHub() {
  const { state, dispatch, isUnlocked, allCompleted } = useGame()
  const { completedGames, collectedHints } = state

  return (
    <div className="hub-container">
      <header className="hub-header">
        <h1 className="hub-title">🗺️ Pantalla de Juegos</h1>
        <p className="hub-sub">Completa los minijuegos en orden para reunir las pistas</p>
      </header>

      <div className="games-grid">
        {GAMES.map((game) => {
          const unlocked = isUnlocked(game.id)
          const done = completedGames.includes(game.id)
          return (
            <div
              key={game.id}
              className={`game-card ${done ? 'game-card--done' : ''} ${!unlocked ? 'game-card--locked' : ''}`}
              onClick={() => unlocked && !done && dispatch({ type: 'OPEN_GAME', id: game.id })}
            >
              <div className="game-card-emoji">{done ? '✅' : unlocked ? game.emoji : '🔒'}</div>
              <div className="game-card-name">{game.name}</div>
              <div className="game-card-desc">{game.description}</div>
              {done && (
                <div className="game-card-hint">
                  Pista: <span className="hint-word">{collectedHints[game.id]}</span>
                </div>
              )}
              {!unlocked && <div className="game-card-lock-msg">Completa el anterior primero</div>}
              {unlocked && !done && (
                <button className="btn btn-primary">¡Jugar!</button>
              )}
              {done && <div className="game-card-done-badge">¡Completado!</div>}
            </div>
          )
        })}

        {/* Maze card */}
        <div
          className={`game-card game-card--maze ${allCompleted ? '' : 'game-card--locked'}`}
          onClick={() => allCompleted && dispatch({ type: 'OPEN_MAZE' })}
        >
          <div className="game-card-emoji">{allCompleted ? '🌀' : '🔒'}</div>
          <div className="game-card-name">Laberinto Final</div>
          <div className="game-card-desc">
            {allCompleted
              ? '¡Todas las pistas reunidas! El laberinto aguarda... o te come, quién sabe 😈'
              : 'Completa todos los minijuegos para desbloquear el laberinto final'}
          </div>
          {allCompleted && <button className="btn btn-maze">¡Entrar al laberinto! 🌀</button>}
          {!allCompleted && (
            <div className="game-card-lock-msg">
              Faltan {GAMES.length - completedGames.length} juego(s)
            </div>
          )}
        </div>
      </div>

      <HintPanel />
    </div>
  )
}
