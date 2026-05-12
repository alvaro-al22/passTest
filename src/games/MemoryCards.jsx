import { useState, useCallback } from 'react'
import { useGame } from '../context/GameContext'
import SolveButton from '../components/SolveButton'

const CARD_PAIRS = [
  { id: 0, img: '/memori1.png', label: 'Carta 1' },
  { id: 1, img: '/memori2.png', label: 'Carta 2' },
  { id: 2, img: '/memori3.png', label: 'Carta 3' },
  { id: 3, img: '/memori4.png', label: 'Carta 4' },
  { id: 4, img: '/memori5.png', label: 'Carta 5' },
  { id: 5, img: '/memori6.png', label: 'Carta 6' },
  { id: 6, img: '/memori7.png', label: 'Carta 7' },
  { id: 7, img: '/memori8.png', label: 'Carta 8' },
]

function buildDeck() {
  const doubled = [...CARD_PAIRS, ...CARD_PAIRS].map((card, i) => ({
    ...card,
    uid: i,
    flipped: false,
    matched: false,
  }))
  // shuffle
  for (let i = doubled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [doubled[i], doubled[j]] = [doubled[j], doubled[i]]
  }
  return doubled
}

export default function MemoryCards({ gameData }) {
  const { dispatch } = useGame()
  const [deck, setDeck] = useState(buildDeck)
  const [selected, setSelected] = useState([]) // array of uids
  const [pairs, setPairs] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)
  const [won, setWon] = useState(false)

  const handleFlip = useCallback((uid) => {
    if (locked || won) return
    const card = deck.find(c => c.uid === uid)
    if (!card || card.flipped || card.matched) return

    const nextSelected = [...selected, uid]

    setDeck(prev => prev.map(c => c.uid === uid ? { ...c, flipped: true } : c))

    if (nextSelected.length === 2) {
      setAttempts(a => a + 1)
      setLocked(true)
      const [uid1, uid2] = nextSelected
      const c1 = deck.find(c => c.uid === uid1)
      const c2 = deck.find(c => c.uid === uid2)

      if (c1.id === c2.id) {
        // match!
        setTimeout(() => {
          setDeck(prev => prev.map(c =>
            c.uid === uid1 || c.uid === uid2 ? { ...c, matched: true } : c
          ))
          const newPairs = pairs + 1
          setPairs(newPairs)
          setSelected([])
          setLocked(false)
          if (newPairs === CARD_PAIRS.length) {
            setWon(true)
            setTimeout(() => dispatch({ type: 'COMPLETE_GAME', id: gameData.id, hint: gameData.hint }), 1200)
          }
        }, 600)
      } else {
        // no match — flip back
        setTimeout(() => {
          setDeck(prev => prev.map(c =>
            c.uid === uid1 || c.uid === uid2 ? { ...c, flipped: false } : c
          ))
          setSelected([])
          setLocked(false)
        }, 1000)
      }
    } else {
      setSelected(nextSelected)
    }
  }, [deck, selected, locked, won, pairs, dispatch, gameData])

  const reset = () => {
    setDeck(buildDeck())
    setSelected([])
    setPairs(0)
    setAttempts(0)
    setLocked(false)
    setWon(false)
  }

  return (
    <div className="game-screen">
      <button className="btn btn-back" onClick={() => dispatch({ type: 'BACK_HUB' })}>← Volver</button>
      <h2 className="game-title">{gameData.emoji} {gameData.name}</h2>
      <p className="game-desc">
        Empareja todos los iconos del horror cósmico antes de que tu cerebro entre en colapso 🧠<br/>
        <small>Parejas: {pairs}/{CARD_PAIRS.length} | Intentos: {attempts}</small>
      </p>

      <div className="mc-grid">
        {deck.map(card => (
          <div
            key={card.uid}
            className={`mc-card ${card.flipped || card.matched ? 'mc-card--flipped' : ''} ${card.matched ? 'mc-card--matched' : ''}`}
            onClick={() => handleFlip(card.uid)}
          >
            <div className="mc-card-inner">
              <div className="mc-card-front">?</div>
              <div className="mc-card-back">
                <img src={card.img} alt={card.label} className="mc-card-img" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {won && (
        <div className="game-win-banner">
          🧠 ¡CEREBRO SUPERIOR CONFIRMADO! {pairs} parejas en {attempts} intentos
          <br/>Pista obtenida: <strong>{gameData.hint}</strong>
        </div>
      )}

      <div className="game-actions">
        <button className="btn btn-secondary" onClick={reset}>🔄 Barajar</button>
        {!won && <SolveButton gameData={gameData} />}
        {won && (
          <button className="btn btn-primary btn-big" onClick={() => dispatch({ type: 'COMPLETE_GAME', id: gameData.id, hint: gameData.hint })}>
            Recoger pista "{gameData.hint}" y continuar →
          </button>
        )}
      </div>
    </div>
  )
}
