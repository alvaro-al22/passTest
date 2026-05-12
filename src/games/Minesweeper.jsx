import { useState, useCallback } from 'react'
import { useGame } from '../context/GameContext'
import SolveButton from '../components/SolveButton'

const ROWS = 9
const COLS = 9
const MINES = 10

const MEME_LABELS = {
  1: '1️⃣', 2: '2️⃣', 3: '3️⃣', 4: '4️⃣',
  5: '5️⃣', 6: '6️⃣', 7: '7️⃣', 8: '8️⃣',
}

function buildBoard(firstRow, firstCol) {
  // place mines avoiding first click area
  const cells = Array.from({ length: ROWS * COLS }, (_, i) => ({
    idx: i,
    mine: false,
    revealed: false,
    flagged: false,
    count: 0,
  }))

  const forbidden = new Set()
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = firstRow + dr
      const c = firstCol + dc
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) forbidden.add(r * COLS + c)
    }
  }

  let placed = 0
  while (placed < MINES) {
    const idx = Math.floor(Math.random() * ROWS * COLS)
    if (!cells[idx].mine && !forbidden.has(idx)) {
      cells[idx].mine = true
      placed++
    }
  }

  // calculate counts
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (cells[r * COLS + c].mine) continue
      let count = 0
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr; const nc = c + dc
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && cells[nr * COLS + nc].mine) count++
        }
      }
      cells[r * COLS + c].count = count
    }
  }
  return cells
}

function floodReveal(cells, idx) {
  const queue = [idx]
  const visited = new Set([idx])
  while (queue.length) {
    const cur = queue.shift()
    cells[cur].revealed = true
    if (cells[cur].count === 0) {
      const r = Math.floor(cur / COLS); const c = cur % COLS
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr; const nc = c + dc
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            const ni = nr * COLS + nc
            if (!visited.has(ni) && !cells[ni].flagged) {
              visited.add(ni)
              queue.push(ni)
            }
          }
        }
      }
    }
  }
  return cells
}

export default function Minesweeper({ gameData }) {
  const { dispatch } = useGame()
  const [cells, setCells] = useState(null)
  const [status, setStatus] = useState('waiting') // waiting | playing | dead | won

  const flagCount = cells ? cells.filter(c => c.flagged).length : 0

  const handleClick = useCallback((idx) => {
    if (status === 'dead' || status === 'won') return

    setCells(prev => {
      let board
      if (!prev) {
        const r = Math.floor(idx / COLS); const c = idx % COLS
        board = buildBoard(r, c)
        setStatus('playing')
      } else {
        board = prev.map(cell => ({ ...cell }))
      }

      const cell = board[idx]
      if (cell.revealed || cell.flagged) return prev ? prev : board

      if (cell.mine) {
        // boom!
        board.forEach(c => { if (c.mine) c.revealed = true })
        setStatus('dead')
        return board
      }

      floodReveal(board, idx)

      const won = board.every(c => c.mine || c.revealed)
      if (won) {
        setStatus('won')
        setTimeout(() => dispatch({ type: 'COMPLETE_GAME', id: gameData.id, hint: gameData.hint }), 1200)
      }
      return board
    })
  }, [status, dispatch, gameData])

  const handleRightClick = useCallback((e, idx) => {
    e.preventDefault()
    if (status === 'dead' || status === 'won' || !cells) return
    setCells(prev => {
      const board = prev.map(c => ({ ...c }))
      const cell = board[idx]
      if (cell.revealed) return prev
      const currentFlags = board.filter(c => c.flagged).length
      if (!cell.flagged && currentFlags >= MINES) return prev  // no más banderas que minas
      cell.flagged = !cell.flagged
      return board
    })
  }, [cells, status])

  const reset = () => {
    setCells(null)
    setStatus('waiting')
  }

  const displayCells = cells || Array.from({ length: ROWS * COLS }, (_, i) => ({
    idx: i, mine: false, revealed: false, flagged: false, count: 0
  }))

  return (
    <div className="game-screen">
      <button className="btn btn-back" onClick={() => dispatch({ type: 'BACK_HUB' })}>← Volver</button>
      <h2 className="game-title">{gameData.emoji} {gameData.name}</h2>
      <p className="game-desc">
        Despeja el campo sin activar las minas 💣 Dato curioso: Las bananas son ligeramente radiactivas.<br />
        <small>Click = revelar | Click derecho = bandera 🚩 | Revela todo sin explotar para ganar</small>
      </p>

      <div className="ms-stats">
        <span>💣 {MINES - flagCount} restantes</span>
        {status === 'dead' && <span className="ms-status dead">💥 HAS PASADO A MEJOR VIDA — las estadísticas dicen que esto era inevitable</span>}
        {status === 'won' && <span className="ms-status won">☠️ CAMPO DESPEJADO — pista: <strong>{gameData.hint}</strong></span>}
      </div>

      <div
        className="ms-grid"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      >
        {displayCells.map((cell, i) => {
          let content = ''
          let cls = 'ms-cell'
          if (cell.flagged) { content = '🚩'; cls += ' ms-flagged' }
          else if (!cell.revealed) { cls += ' ms-hidden' }
          else if (cell.mine) { content = '💀'; cls += ' ms-mine' }
          else if (cell.count > 0) { content = MEME_LABELS[cell.count] || cell.count; cls += ' ms-num' }
          else { cls += ' ms-empty' }

          return (
            <div
              key={i}
              className={cls}
              onClick={() => handleClick(i)}
              onContextMenu={(e) => handleRightClick(e, i)}
            >
              {content}
            </div>
          )
        })}
      </div>

      <div className="game-actions">
        <button className="btn btn-secondary" onClick={reset}>🔄 Reintentar</button>
        {status !== 'won' && <SolveButton gameData={gameData} />}
      </div>

      {status === 'won' && (
        <button className="btn btn-primary btn-big" onClick={() => dispatch({ type: 'COMPLETE_GAME', id: gameData.id, hint: gameData.hint })}>
          Recoger pista "{gameData.hint}" y continuar →
        </button>
      )}
    </div>
  )
}
