import { useState } from 'react'
import { useGame } from '../context/GameContext'
import SolveButton from '../components/SolveButton'

const WORDS = [
  { word: 'TARDIGRADO',  hint: '🐾 Microscópico animal que sobrevive en el vacío del espacio, la radiación y el congelamiento. Lleva aquí 500 millones de años.' },
  { word: 'AXOLOTL',     hint: '🦎 Salamandra mexicana que puede regenerar su corazón, cerebro y extremidades. Y encima tiene cara de contento.' },
  { word: 'NARVAL',      hint: '🦄 El "cuerno" del unicornio del mar es en realidad un diente que puede crecer hasta 3 metros.' },
  { word: 'WOMBAT',      hint: '🐨 Marsupial australiano cuya caca es perfectamente cúbica. Los científicos llevan años estudiando por qué.' },
  { word: 'LAMPREA',     hint: '🕳️ Pez prehistórico que lleva 360 millones de años sin evolucionar. Es básicamente una boca con cuerpo.' },
  { word: 'CACHALOTE',   hint: '🐋 Tiene el cerebro más grande de todos los animales que han existido. Y aun así choca con barcos.' },
  { word: 'FLAMENCO',    hint: '🦩 Es rosa porque come camarones. Si deja de comerlos se vuelve blanco. Es lo que come, literalmente.' },
  { word: 'COCODRILO',   hint: '🐊 No puede sacar la lengua. Jamás. Tiene la mandíbula más potente del reino animal pero no puede abrir la boca desde dentro.' },
  { word: 'TURRITOPSIS', hint: '🪼 Medusa que cuando envejece vuelve a ser juvenil. Técnicamente es inmortal y nadie habla de esto.' },
  { word: 'CANGURO',     hint: '🦘 Puede pausar su propio embarazo si el entorno es malo. Y tiene tres vaginas. Los machos tienen el escudo de Australia.' },
  { word: 'HORMIGA',     hint: '🐜 Puede levantar 50 veces su peso. Si un humano hiciera lo mismo alzaría un coche. Y trabaja sin sueldo.' },
  { word: 'MANTARRAYA',  hint: '🐟 Tiene el cerebro en forma de W. Es uno de los pocos peces que se reconoce en un espejo. Filosofía marina.' },
  { word: 'ORNITORRINCO',hint: '🦆 Mamífero que pone huevos, tiene pico de pato, cola de castor, patas de nutria y es venenoso. Diseñado en viernes.' },
  { word: 'TIBURON',     hint: '🦈 Nunca deja de producir dientes nuevos. Puede generar 50.000 dientes en su vida. Tu dentista le tiene envidia.' },
  { word: 'PLATYPUS',    hint: '🔬 Cuando los científicos europeos recibieron el primer ejemplar en 1799 pensaron que era un fraude cosido a mano.' },
]

const MAX_WRONG = 6

const HANGMAN_STAGES = [
  `
  +---+
  |   |
      |
      |
      |
      |
=========`,
  `
  +---+
  |   |
  O   |
      |
      |
      |
=========`,
  `
  +---+
  |   |
  O   |
  |   |
      |
      |
=========`,
  `
  +---+
  |   |
  O   |
 /|   |
      |
      |
=========`,
  `
  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========`,
  `
  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========`,
  `
  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========`,
]

function randomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)]
}

const KEYBOARD = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('')

export default function Hangman({ gameData }) {
  const { dispatch } = useGame()
  const [wordData, setWordData] = useState(randomWord)
  const [guessed, setGuessed] = useState(new Set())
  const [won, setWon] = useState(false)

  const { word, hint } = wordData
  const wrong = [...guessed].filter(l => !word.includes(l)).length
  const dead = wrong >= MAX_WRONG
  const displayWord = word.split('').map(l => (guessed.has(l) ? l : '_'))
  const isWon = displayWord.every(c => c !== '_')

  const guess = (letter) => {
    if (dead || isWon) return
    const next = new Set(guessed)
    next.add(letter)
    setGuessed(next)
    const newWrong = [...next].filter(l => !word.includes(l)).length
    const newDisplay = word.split('').map(l => (next.has(l) ? l : '_'))
    if (newDisplay.every(c => c !== '_') && !won) {
      setWon(true)
      setTimeout(() => dispatch({ type: 'COMPLETE_GAME', id: gameData.id, hint: gameData.hint }), 1200)
    }
  }

  const reset = () => {
    setWordData(randomWord())
    setGuessed(new Set())
    setWon(false)
  }

  return (
    <div className="game-screen">
      <button className="btn btn-back" onClick={() => dispatch({ type: 'BACK_HUB' })}>← Volver</button>
      <h2 className="game-title">{gameData.emoji} {gameData.name}</h2>
      <p className="game-desc">
        Adivina la palabra antes de que el muñeco se convierta en filosofía existencial
        <br/><small>Errores: {wrong}/{MAX_WRONG}</small>
      </p>

      <div className="hm-layout">
        <pre className="hm-drawing">{HANGMAN_STAGES[wrong]}</pre>

        <div className="hm-right">
          <div className="hm-hint-box">
            {wrong >= 3 ? `💡 Pista: ${hint}` : `💡 Pista: falla ${3 - wrong} vez${3 - wrong === 1 ? '' : 'es'} más para verla...`}
          </div>

          <div className="hm-word">
            {displayWord.map((ch, i) => (
              <span key={i} className={`hm-letter ${ch !== '_' ? 'hm-letter--revealed' : ''}`}>
                {ch}
              </span>
            ))}
          </div>

          {dead && (
            <div className="hm-status dead">
              💀 La palabra era: <strong>{word}</strong>
              <br />No pasa nada, la vida es un laberinto literal
            </div>
          )}
          {isWon && !dead && (
            <div className="hm-status won">
              🎉 ¡CORRECTÍSIMO! Eres más listo que el hambre
              <br />Pista obtenida: <strong>{gameData.hint}</strong>
            </div>
          )}

          <div className="hm-keyboard">
            {KEYBOARD.map(letter => (
              <button
                key={letter}
                className={`hm-key ${guessed.has(letter) ? (word.includes(letter) ? 'hm-key--hit' : 'hm-key--miss') : ''}`}
                onClick={() => guess(letter)}
                disabled={guessed.has(letter) || dead}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="game-actions">
        <button className="btn btn-secondary" onClick={reset}>🔄 Nueva palabra</button>
        {!isWon && <SolveButton gameData={gameData} />}
        {isWon && (
          <button className="btn btn-primary btn-big" onClick={() => dispatch({ type: 'COMPLETE_GAME', id: gameData.id, hint: gameData.hint })}>
            Recoger pista "{gameData.hint}" y continuar →
          </button>
        )}
      </div>
    </div>
  )
}
