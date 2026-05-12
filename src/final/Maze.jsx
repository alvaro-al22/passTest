import { useState } from 'react'
import { useGame, GAMES } from '../context/GameContext'

// ─── MAZE LAYOUT ─────────────────────────────────────────────────
// Snake corridor: 11 rows × 15 cols.
// 0=path, 1=wall, 99=start, 98=end, 10-14=NPC(0-4)
// Path is LINEAR — NPCs are the ONLY way through each corridor.
// Route: row1 right → NPC0(1,13) → (2,13) down → row3 left →
//        NPC1(3,1) → (4,1) down → row5 right → NPC2(5,13) →
//        (6,13) down → row7 left → NPC3(7,1) → (8,1) down →
//        row9 right → NPC4(9,12) → end(9,13)
// prettier-ignore
const MAZE_TEMPLATE = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1,99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,10, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1,11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,12, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1,13, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,14,98, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]

const R = MAZE_TEMPLATE.length
const C = MAZE_TEMPLATE[0].length

// ─── NPC DATA — aldeanos con crisis existenciales ─────────────────
// Correct answers auto-derived from GAMES: [LINCE, SALTAMONTES, ALCON, PIEDRA, PULPO]
const NPC_DATA = [
    {
        emoji: '🧑‍🍳',
        name: 'AItor tilla, el cocinero',
        intro: '"Estoy muy muy indeciso... creo que mi vida no puede seguir con esta duda. ¿Podrías ayudarme?"',
        question: '¿Si tuvieras que ser un animal, cuál serías?',
        wrongMsg: '❌ ¿Qué animal más aburrido...? Qué chica más sin criterio, no me extraña que los guardias no te dejen pasar. Vuelve cuando tengas algo interesante que decir.',
        rightMsg: '¡¡LINCE!! ¡Sí! ¡Eso mismo pensaba yo! Un animal ágil, elegante, con criterio... igual que tú ahora mismo. ¡Gracias, puedes pasar! 🥹',
    },
    {
        emoji: '🧑‍🦽',
        name: 'Paco Jo, el ruedas',
        intro: '"No puedo dormir, no puedo comer, no puedo vivir... hasta que alguien responda esta pregunta. Por favor."',
        question: '¿Si fueses un animal volador, cuál serías?',
        wrongMsg: '😤 ¿ESO has respondido? Qué poca altura miras tú... igual que tu respuesta. Eso es una falta de respeto que no cuento. Largo y vuelve con más altura.',
        rightMsg: '¡ALCON! ¡Claro, el halcón! Vuela alto, ve lejos, no mira atrás. Exactamente lo que necesitaba escuchar. Me has liberado. Adelante. 🦅',
    },
    {
        emoji: '👩‍🔧',
        name: 'Remedios, la fontanera',
        intro: '"Llevo años atrapada en este dilema y ya no sé ni quién soy. Sin tu ayuda no puedo seguir adelante..."',
        question: '¿Si no pudieses ser ni un animal? ¿Qué serías?',
        wrongMsg: '💩 Eso ni es una respuesta, es un insulto a mi crisis existencial. Por favor, retírate de mi vista antes de que me agraves la depresión.',
        rightMsg: '¡SALTAMONTES! ¡Sí, dios mío, claro! Ligero, libre, dando saltos sin rumbo... exactamente cómo me siento. ¡Me has salvado! 🌟',
    },
    {
        emoji: '🧜',
        name: 'Bartolomeo, el vejiga pequeña',
        intro: '"Llevo 40 años mirando el mar sin respuestas. Hoy alguien debe darme la que necesito o me quedo aquí para siempre."',
        question: '¿Si tuvieses que ser un animal marino, cuál serías?',
        wrongMsg: '🤮 ¿Estás de broma? Con esa respuesta ni te dejan entrar al charco. Una falta de respeto de nivel olímpico que no cuento para nada.',
        rightMsg: '¡PULPO! Ocho brazos, tres corazones, tinta para los enemigos. ¡Perfecto! Me has dado la paz que buscaba. ¡40 años esperando esto! ¡Gracias! 🐙',
    },
    {
        emoji: '👷‍♀️',
        name: 'Consuelo, porque sin él me caigo',
        intro: '"Nadie me entiende. El universo no tiene sentido. Y todo depende de que tú respondas correctamente esto."',
        question: '¿Si no pudieses ser un animal ni un insecto, qué serías?',
        wrongMsg: '😡 Eso no tiene ningún sentido cósmico. Al menos sé coherente con tu mediocridad. Esa falta de respeto no me la cuento ni yo misma. Fuera.',
        rightMsg: '¡PIEDRA! Sólida, eterna, inamovible. Qué sabiduría tan terrenal. Me has dado la estabilidad que buscaba toda mi vida. Pasa. 🪨',
    },
]

// Answers in NPC_DATA order
const GATE_HINTS = ['LINCE', 'ALCON', 'SALTAMONTES', 'PULPO', 'PIEDRA']

function findCell(value) {
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++)
      if (MAZE_TEMPLATE[r][c] === value) return { r, c }
  return null
}

const START = findCell(99)

export default function Maze() {
  const { state, dispatch } = useGame()
  const hints = state.collectedHints

  const [pos, setPos] = useState({ ...START })
  const [openedNPCs, setOpenedNPCs] = useState(new Set())
  const [activeNPC, setActiveNPC] = useState(null)   // 0-4 or null
  const [npcSuccess, setNpcSuccess] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const [error, setError] = useState('')
  const [won, setWon] = useState(false)
  const [showIntro, setShowIntro] = useState(true)   // guards briefing on mount

  const tryMove = (dr, dc) => {
    if (activeNPC !== null || showIntro || won) return
    const newR = pos.r + dr
    const newC = pos.c + dc
    if (newR < 0 || newR >= R || newC < 0 || newC >= C) return

    const cell = MAZE_TEMPLATE[newR][newC]
    if (cell === 1) return  // wall

    const npcIdx = cell - 10
    if (npcIdx >= 0 && npcIdx <= 4 && !openedNPCs.has(npcIdx)) {
      setActiveNPC(npcIdx)
      setNpcSuccess(false)
      setInputVal('')
      setError('')
      return
    }

    setPos({ r: newR, c: newC })

    if (cell === 98) {
      setWon(true)
      setTimeout(() => dispatch({ type: 'VICTORY' }), 1800)
    }
  }

  const submitNPC = () => {
    const correct = GATE_HINTS[activeNPC]
    if (inputVal.trim().toUpperCase() === correct) {
      setNpcSuccess(true)
      setTimeout(() => {
        setOpenedNPCs(prev => new Set([...prev, activeNPC]))
        setActiveNPC(null)
        setNpcSuccess(false)
        setError('')
      }, 1400)
    } else {
      setError(NPC_DATA[activeNPC].wrongMsg)
    }
  }

  return (
    <div
      className="game-screen maze-screen"
      onKeyDown={(e) => {
        const map = {
          ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1],
          w: [-1, 0], s: [1, 0], a: [0, -1], d: [0, 1],
          W: [-1, 0], S: [1, 0], A: [0, -1], D: [0, 1],
        }
        if (map[e.key]) { e.preventDefault(); tryMove(...map[e.key]) }
      }}
      tabIndex={0}
    >
      <button className="btn btn-back" onClick={() => dispatch({ type: 'BACK_HUB' })}>← Volver</button>
      <h2 className="game-title">🌀 Laberinto Final</h2>
      <p className="game-desc">
        Usa las flechas o WASD para moverte 🕹️<br />
        <small>Hay 5 aldeanos con crisis existenciales que bloquean el camino. Ayúdales a resolver sus dudas para poder avanzar.</small>
      </p>

      {/* Hints reminder */}
      <div className="maze-hints-row">
        {GAMES.map(g => (
          <span key={g.id} className="maze-hint-chip">
            {g.emoji} <strong>{hints[g.id]}</strong>
          </span>
        ))}
      </div>

      {/* Maze grid */}
      <div
        className="maze-grid"
        style={{ gridTemplateColumns: `repeat(${C}, 1fr)`, gridTemplateRows: `repeat(${R}, 1fr)` }}
      >
        {MAZE_TEMPLATE.map((row, r) =>
          row.map((cell, c) => {
            const isPlayer = pos.r === r && pos.c === c
            const isEnd = cell === 98
            const npcIdx = cell - 10
            const isNPC = npcIdx >= 0 && npcIdx <= 4
            const npcOpen = isNPC && openedNPCs.has(npcIdx)

            let cls = 'maze-cell'
            if (cell === 1) cls += ' maze-wall'
            else if (isPlayer && won) cls += ' maze-path maze-won-cell'
            else if (isPlayer) cls += ' maze-path maze-player-cell'
            else if (isEnd) cls += ' maze-path maze-end'
            else if (isNPC && !npcOpen) cls += ' maze-npc'
            else if (isNPC && npcOpen) cls += ' maze-path maze-npc-done'
            else cls += ' maze-path'

            return (
              <div key={`${r}-${c}`} className={cls} title={isNPC && !npcOpen ? NPC_DATA[npcIdx].name : undefined}>
                {isPlayer && (won ? '🎉' : '🐸')}
                {!isPlayer && isEnd && '🏁'}
                {!isPlayer && isNPC && !npcOpen && NPC_DATA[npcIdx].emoji}
                {!isPlayer && isNPC && npcOpen && '✅'}
              </div>
            )
          })
        )}
      </div>

      {/* D-pad for mouse/touch */}
      <div className="dpad">
        <button className="dpad-btn" onClick={() => tryMove(-1, 0)}>▲</button>
        <div className="dpad-row">
          <button className="dpad-btn" onClick={() => tryMove(0, -1)}>◀</button>
          <div className="dpad-center">🐸</div>
          <button className="dpad-btn" onClick={() => tryMove(0, 1)}>▶</button>
        </div>
        <button className="dpad-btn" onClick={() => tryMove(1, 0)}>▼</button>
      </div>

      {/* Guards intro briefing (shown on maze mount) */}
      {showIntro && (
        <div className="overlay">
          <div className="modal gate-modal">
            <div className="gate-emoji">💂💂</div>
            <h3 className="gate-title">Guardianes del Laberinto</h3>
            <p className="gate-meme">
              "Bienvenido/a, viajero/a. Somos los guardianes de este laberinto. Llevamos aquí
              un tiempo incalculable. Perdimos la cuenta hace siglos."
            </p>
            <p className="gate-question">
              Dentro del laberinto viven <strong>5 aldeanos</strong> que últimamente tienen
              graves <strong>crisis existenciales</strong> y no pueden seguir con sus vidas.
              Están completamente bloqueados, paralizados... y casualmente bloquean el único
              camino al Gran Premio.
            </p>
            <p style={{ fontSize: '.87rem', color: 'var(--neon-yellow)', fontWeight: 700 }}>
              Tu misión: habla con cada aldeano y responde su pregunta usando las palabras
              que has recopilado en los minijuegos. Solo así podrán resolver sus dudas y tú
              podrás llegar al Gran Premio.
            </p>
            <p style={{ fontSize: '.78rem', color: 'var(--text-dim)', marginTop: '.5rem' }}>
              * No nos hacemos responsables de las crisis existenciales que puedas adquirir
              por contagio durante el proceso.
            </p>
            <div className="gate-actions" style={{ marginTop: '1rem' }}>
              <button className="btn btn-primary" onClick={() => setShowIntro(false)}>
                Entendido, voy a salvarles 🦸
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NPC dialogue */}
      {activeNPC !== null && (
        <div className="overlay">
          <div className="modal gate-modal">
            {npcSuccess ? (
              <>
                <div className="gate-emoji" style={{ fontSize: '3rem' }}>🎉</div>
                <h3 className="gate-title" style={{ color: 'var(--neon-green)' }}>¡Aldeano liberado!</h3>
                <p style={{ color: 'var(--neon-green)', fontWeight: 700, lineHeight: 1.6 }}>
                  {NPC_DATA[activeNPC].rightMsg}
                </p>
              </>
            ) : (
              <>
                <div className="gate-emoji">{NPC_DATA[activeNPC].emoji}</div>
                <h3 className="gate-title">{NPC_DATA[activeNPC].name}</h3>
                <p className="gate-meme">{NPC_DATA[activeNPC].intro}</p>
                <p className="gate-question">{NPC_DATA[activeNPC].question}</p>
                <input
                  className="gate-input"
                  type="text"
                  value={inputVal}
                  onChange={e => { setInputVal(e.target.value); setError('') }}
                  onKeyDown={e => { e.stopPropagation(); if (e.key === 'Enter') submitNPC() }}
                  placeholder="Tu respuesta..."
                  autoFocus
                />
                {error && <div className="gate-error">{error}</div>}
                <div className="gate-actions">
                  <button className="btn btn-primary" onClick={submitNPC}>Responder 🔓</button>
                  <button className="btn btn-secondary" onClick={() => { setActiveNPC(null); setError('') }}>Retroceder</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {won && (
        <div className="maze-won-msg">
          🏆 ¡¡HAS SALIDO DEL LABERINTO!! Estadísticamente improbable, pero aquí estás.
        </div>
      )}
    </div>
  )
}
