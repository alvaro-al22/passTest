import { useState, useCallback, useRef } from 'react'
import { useGame } from '../context/GameContext'
import SolveButton from '../components/SolveButton'

// 10x10 grid. Words to find (all horizontal or vertical, no diagonals for simplicity)
const WORDS_TO_FIND = ['MAMADA', 'HORNO', 'BANCO', 'PITO', 'CACA', 'NEGRO']

// Pre-built grid (10x10) with words hidden
// MAMADA → col 0, rows 0-5, vertical
// BANCO  → col 9, rows 0-4, vertical
// CACA   → col 5, rows 5-8, vertical
// HORNO  → row 2, cols 4-8, horizontal
// PITO   → row 7, cols 0-3, horizontal
// NEGRO  → row 9, cols 5-9, horizontal
const GRID_LETTERS = [
  ['M','K','Z','Q','X','W','J','F','G','B'],
  ['A','L','P','R','S','T','V','Y','Z','A'],
  ['M','Q','W','E','H','O','R','N','O','N'],
  ['A','B','C','D','F','G','H','I','J','C'],
  ['D','K','L','M','N','P','Q','R','S','O'],
  ['A','T','U','V','W','C','X','Y','Z','K'],
  ['F','G','H','I','J','A','L','M','N','P'],
  ['P','I','T','O','Q','C','R','S','T','U'],
  ['V','W','X','Y','Z','A','B','C','D','E'],
  ['F','G','H','I','J','N','E','G','R','O'],
]

// Word positions for validation (row, col, direction)
const WORD_POSITIONS = {
  'MAMADA': { row: 0, col: 0, dir: 'v', len: 6 },
  'HORNO':  { row: 2, col: 4, dir: 'h', len: 5 },
  'BANCO':  { row: 0, col: 9, dir: 'v', len: 5 },
  'PITO':   { row: 7, col: 0, dir: 'h', len: 4 },
  'CACA':   { row: 5, col: 5, dir: 'v', len: 4 },
  'NEGRO':  { row: 9, col: 5, dir: 'h', len: 5 },
}

function getCellsForWord(word) {
  const pos = WORD_POSITIONS[word]
  if (!pos) return []
  const cells = []
  for (let i = 0; i < pos.len; i++) {
    cells.push(pos.dir === 'h' ? `${pos.row}-${pos.col + i}` : `${pos.row + i}-${pos.col}`)
  }
  return cells
}

export default function WordSearch({ gameData }) {
  const { dispatch } = useGame()
  const [found, setFound] = useState(new Set())         // set of word strings
  const [selectedCells, setSelectedCells] = useState(new Set()) // currently selected (dragging)
  const [dragStart, setDragStart] = useState(null)
  const [foundCells, setFoundCells] = useState(new Set()) // cells that are part of found words
  const [won, setWon] = useState(false)
  const isDragging = useRef(false)

  const getCellKey = (r, c) => `${r}-${c}`

  const onMouseDown = (r, c) => {
    isDragging.current = true
    setDragStart({ r, c })
    setSelectedCells(new Set([getCellKey(r, c)]))
  }

  const onTouchStart = (r, c, e) => {
    e.preventDefault()
    onMouseDown(r, c)
  }

  const onTouchMove = (e) => {
    e.preventDefault()
    const touch = e.touches[0]
    const el = document.elementFromPoint(touch.clientX, touch.clientY)
    if (!el) return
    const r = parseInt(el.dataset.row)
    const c = parseInt(el.dataset.col)
    if (!isNaN(r) && !isNaN(c)) onMouseEnter(r, c)
  }

  const onTouchEnd = (e) => {
    e.preventDefault()
    onMouseUp()
  }

  const onMouseEnter = (r, c) => {
    if (!isDragging.current || !dragStart) return
    // Build selection from dragStart to current (horizontal or vertical only)
    const cells = new Set()
    const dr = r - dragStart.r
    const dc = c - dragStart.c
    if (dr === 0) {
      // horizontal
      const minC = Math.min(dragStart.c, c)
      const maxC = Math.max(dragStart.c, c)
      for (let col = minC; col <= maxC; col++) cells.add(getCellKey(r, col))
    } else if (dc === 0) {
      // vertical
      const minR = Math.min(dragStart.r, r)
      const maxR = Math.max(dragStart.r, r)
      for (let row = minR; row <= maxR; row++) cells.add(getCellKey(row, c))
    } else {
      cells.add(getCellKey(r, c))
    }
    setSelectedCells(cells)
  }

  const onMouseUp = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false

    // Check if selectedCells matches any word
    const selArray = [...selectedCells].sort()
    for (const word of WORDS_TO_FIND) {
      if (found.has(word)) continue
      const wordCells = getCellsForWord(word).sort()
      if (JSON.stringify(wordCells) === JSON.stringify(selArray)) {
        const newFound = new Set(found)
        newFound.add(word)
        const newFoundCells = new Set(foundCells)
        wordCells.forEach(c => newFoundCells.add(c))
        setFound(newFound)
        setFoundCells(newFoundCells)
        const allFound = newFound.size === WORDS_TO_FIND.length
        if (allFound) {
          setWon(true)
          setTimeout(() => dispatch({ type: 'COMPLETE_GAME', id: gameData.id, hint: gameData.hint }), 1200)
        }
        setSelectedCells(new Set())
        setDragStart(null)
        return
      }
    }
    setSelectedCells(new Set())
    setDragStart(null)
  }, [selectedCells, found, foundCells, dispatch, gameData])

  return (
    <div className="game-screen" onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
      <button className="btn btn-back" onClick={() => dispatch({ type: 'BACK_HUB' })}>← Volver</button>
      <h2 className="game-title">{gameData.emoji} {gameData.name}</h2>
      <p className="game-desc">
        Encuentra las 5 palabras meme escondidas 🔍<br/>
        <small>Arrastra para seleccionar (horizontal o vertical) | {found.size}/{WORDS_TO_FIND.length} encontradas</small>
      </p>

      <div className="ws-layout">
        <div
          className="ws-grid"
          style={{ userSelect: 'none', touchAction: 'none' }}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {GRID_LETTERS.map((row, r) =>
            row.map((letter, c) => {
              const key = getCellKey(r, c)
              const isSel = selectedCells.has(key)
              const isFound = foundCells.has(key)
              return (
                <div
                  key={key}
                  data-row={r}
                  data-col={c}
                  className={`ws-cell ${isSel ? 'ws-cell--selected' : ''} ${isFound ? 'ws-cell--found' : ''}`}
                  onMouseDown={() => onMouseDown(r, c)}
                  onMouseEnter={() => onMouseEnter(r, c)}
                  onTouchStart={(e) => onTouchStart(r, c, e)}
                >
                  {letter}
                </div>
              )
            })
          )}
        </div>

        <div className="ws-wordlist">
          <div className="ws-wordlist-title">Palabras a encontrar:</div>
          {WORDS_TO_FIND.map(word => (
            <div key={word} className={`ws-word ${found.has(word) ? 'ws-word--found' : ''}`}>
              {found.has(word) ? '✅' : '🔲'} {word}
            </div>
          ))}
        </div>
      </div>

      {won && (
        <div className="game-win-banner">
          🔠 ¡SOPA RESUELTA! Eres un buscador de memes profesional
          <br/>Pista obtenida: <strong>{gameData.hint}</strong>
        </div>
      )}

      {won && (
        <button className="btn btn-primary btn-big" onClick={() => dispatch({ type: 'COMPLETE_GAME', id: gameData.id, hint: gameData.hint })}>
          Recoger pista "{gameData.hint}" y continuar →
        </button>
      )}
      {!won && <SolveButton gameData={gameData} />}
    </div>
  )
}
