import { useState } from 'react'
import { useGame } from '../context/GameContext'

export default function SolveButton({ gameData }) {
  const { dispatch } = useGame()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = () => {
    if (value.trim().toUpperCase() === gameData.hint) {
      setSuccess(true)
      setTimeout(() => {
        dispatch({ type: 'COMPLETE_GAME', id: gameData.id, hint: gameData.hint })
      }, 900)
    } else {
      setError(`❌ "${value}" no es correcto... ¿seguro que has prestado atención? 🤔`)
    }
  }

  return (
    <>
      <button
        className="btn btn-solve"
        onClick={() => { setOpen(true); setValue(''); setError(''); setSuccess(false) }}
        title="¿Sabes la respuesta? Introdúcela directamente"
      >
        🔑 Introducir pista
      </button>

      {open && (
        <div className="overlay">
          <div className="modal solve-modal">
            {success ? (
              <>
                <div className="solve-success-emoji">🎉</div>
                <h3 className="solve-title" style={{ color: 'var(--neon-green)' }}>¡Correcto!</h3>
                <p>Desbloqueando pista <strong>{gameData.hint}</strong>...</p>
              </>
            ) : (
              <>
                <div className="solve-emoji">🔑</div>
                <h3 className="solve-title">¿Ya sabes la pista?</h3>
                <p className="solve-desc">
                  Si conoces la palabra secreta del minijuego <strong>{gameData.name}</strong>,
                  introdúcela aquí para saltarte el juego.
                  <br/>
                  <small style={{ color: 'var(--text-dim)' }}>
                    (La página se reinicia pero las pistas que ya sabes son tuyas 😎)
                  </small>
                </p>
                <input
                  className="gate-input"
                  type="text"
                  value={value}
                  onChange={e => { setValue(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="Escribe la palabra secreta..."
                  autoFocus
                />
                {error && <div className="gate-error">{error}</div>}
                <div className="gate-actions">
                  <button className="btn btn-primary" onClick={handleSubmit}>Verificar 🔓</button>
                  <button className="btn btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
