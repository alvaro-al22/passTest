import { useState, useCallback } from 'react'
import { useGame } from '../context/GameContext'
import SolveButton from '../components/SolveButton'

// 3x3 sliding puzzle using a real photo split into 9 pieces via CSS background-position
const IMG = '/fotoPerro.jpeg'
const TILE_SIZE = 110  // px — each tile is 110×110, total image shown at 330×330

function tileStyle(tile) {
  if (tile === 8) return {}
  const col = tile % 3
  const row = Math.floor(tile / 3)
  return {
    backgroundImage: `url('${IMG}')`,
    backgroundSize: `${TILE_SIZE * 3}px ${TILE_SIZE * 3}px`,
    backgroundPosition: `-${col * TILE_SIZE}px -${row * TILE_SIZE}px`,
  }
}

function shuffle(arr) {
  // Only generate solvable shuffles
  let a = [...arr]
  do {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]
    }
  } while (!isSolvable(a) || isSolved(a))
  return a
}

function isSolvable(tiles) {
  // For 3x3: count inversions; if odd → not solvable (blank on odd row from bottom → invert condition)
  const arr = tiles.filter(t => t !== 8)
  let inv = 0
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++)
      if (arr[i] > arr[j]) inv++
  const blankRow = Math.floor(tiles.indexOf(8) / 3)
  // blank on even row from bottom (0-indexed from bottom) → odd inversions needed
  const blankRowFromBottom = 2 - blankRow
  if (blankRowFromBottom % 2 === 0) return inv % 2 === 1
  return inv % 2 === 0
}

function isSolved(tiles) {
  return tiles.every((t, i) => t === i)
}

const INITIAL = [0,1,2,3,4,5,6,7,8]

// A* solver — returns the index of the tile to click next
function manhattanDist(tiles) {
  let d = 0
  for (let i = 0; i < 9; i++) {
    if (tiles[i] === 8) continue
    d += Math.abs(Math.floor(tiles[i] / 3) - Math.floor(i / 3)) + Math.abs(tiles[i] % 3 - i % 3)
  }
  return d
}

function solveNext(tiles) {
  if (isSolved(tiles)) return null
  const key = s => s.join(',')
  const open = [{ t: tiles, g: 0, h: manhattanDist(tiles), prev: null, clicked: -1 }]
  const gMap = new Map([[key(tiles), 0]])
  const closed = new Set()
  while (open.length > 0) {
    let minI = 0
    for (let i = 1; i < open.length; i++)
      if (open[i].g + open[i].h < open[minI].g + open[minI].h) minI = i
    const [cur] = open.splice(minI, 1)
    const curKey = key(cur.t)
    if (closed.has(curKey)) continue
    closed.add(curKey)
    if (isSolved(cur.t)) {
      let node = cur
      while (node.prev && node.prev.prev) node = node.prev
      return node.clicked
    }
    const blank = cur.t.indexOf(8)
    const r = Math.floor(blank / 3), c = blank % 3
    const dirs = []
    if (r > 0) dirs.push(blank - 3)
    if (r < 2) dirs.push(blank + 3)
    if (c > 0) dirs.push(blank - 1)
    if (c < 2) dirs.push(blank + 1)
    for (const idx of dirs) {
      const next = [...cur.t]
      ;[next[idx], next[blank]] = [next[blank], next[idx]]
      const nKey = key(next)
      if (closed.has(nKey)) continue
      const ng = cur.g + 1
      if (!gMap.has(nKey) || gMap.get(nKey) > ng) {
        gMap.set(nKey, ng)
        open.push({ t: next, g: ng, h: manhattanDist(next), prev: cur, clicked: idx })
      }
    }
  }
  return null
}

export default function SlidingPuzzle({ gameData }) {
  const { dispatch } = useGame()
  const [tiles, setTiles] = useState(() => shuffle(INITIAL))
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)
  const [hintIdx, setHintIdx] = useState(null)

  const handleClick = useCallback((idx) => {
    if (won) return
    setTiles(prev => {
      const blankIdx = prev.indexOf(8)
      const row = Math.floor(idx / 3); const col = idx % 3
      const bRow = Math.floor(blankIdx / 3); const bCol = blankIdx % 3
      const adjacent = (Math.abs(row - bRow) + Math.abs(col - bCol)) === 1
      if (!adjacent) return prev
      const next = [...prev];
      [next[idx], next[blankIdx]] = [next[blankIdx], next[idx]]
      setMoves(m => m + 1)
      setHintIdx(null)
      if (isSolved(next)) {
        setWon(true)
        setTimeout(() => dispatch({ type: 'COMPLETE_GAME', id: gameData.id, hint: gameData.hint }), 1200)
      }
      return next
    })
  }, [won, dispatch, gameData])

  const reset = () => {
    setTiles(shuffle(INITIAL))
    setMoves(0)
    setWon(false)
    setHintIdx(null)
  }

  const showHint = () => setHintIdx(solveNext(tiles))

  return (
    <div className="game-screen">
      <button className="btn btn-back" onClick={() => dispatch({ type: 'BACK_HUB' })}>← Volver</button>
      <h2 className="game-title">{gameData.emoji} {gameData.name}</h2>
      <p className="game-desc">
        Ordena la foto en el orden correcto 🐶<br/>
        <small>Haz clic en una pieza adyacente al hueco para moverla • Movimientos: {moves}</small>
      </p>

      <div className="sp-preview">
        <span className="sp-preview-label">Objetivo:</span>
        <img src={IMG} className="sp-goal-img" alt="foto objetivo" />
      </div>

      <div className="sp-grid">
        {tiles.map((tile, idx) => (
          <div
            key={idx}
            className={`sp-tile ${tile === 8 ? 'sp-tile--blank' : 'sp-tile--piece'} ${idx === hintIdx ? 'sp-tile--hint' : ''}`}
            onClick={() => handleClick(idx)}
            style={{ width: TILE_SIZE, height: TILE_SIZE, ...tileStyle(tile) }}
          />
        ))}
      </div>

      {won && (
        <div className="game-win-banner">
          🏆 ¡FOTO RECOMPUESTA! Movimientos: {moves}
          <br/>Pista obtenida: <strong>{gameData.hint}</strong>
        </div>
      )}

      <div className="game-actions">
        <button className="btn btn-secondary" onClick={reset}>🔄 Reiniciar</button>
        {!won && <button className="btn btn-secondary" onClick={showHint}>💡 Pista</button>}
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
