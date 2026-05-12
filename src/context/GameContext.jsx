import React, { createContext, useContext, useReducer } from 'react'

// 5 games, each reveals a clue word
export const GAMES = [
  { id: 0, name: 'Buscaminas', emoji: '💣', hint: 'LINCE',       description: 'Pisa una mina y stat: muerto. Dato curioso: el 100% de los que han muerto alguna vez respiraban antes' },
  { id: 1, name: 'Ahorcado',   emoji: '🪢', hint: 'SALTAMONTES', description: 'Adivina palabras rarísimas antes de que el muñeco tenga un problema de gravedad jejeje' },
  { id: 2, name: 'Puzzle',     emoji: '🧩', hint: 'ALCON',       description: 'Reensambla la figura antes de sufrir una crisis existencial de 3×3 casillas' },
  { id: 3, name: 'Memoria',    emoji: '🃏', hint: 'PIEDRA',      description: 'Empareja iconos del horror cósmico antes de que tu memoria RAM explote' },
  { id: 4, name: 'Sopa Letras',emoji: '🔠', hint: 'PULPO',       description: 'Encuentra palabras curiosas antes de que la sopa te encuentre a ti' },
]

const initialState = {
  screen: 'intro',      // intro | hub | game | maze | victory
  currentGame: null,    // 0-4
  completedGames: [],   // array of game ids
  collectedHints: {},   // { 0: 'LINCE', ... }
}

function reducer(state, action) {
  switch (action.type) {
    case 'START':
      return { ...state, screen: 'hub' }
    case 'OPEN_GAME':
      return { ...state, screen: 'game', currentGame: action.id }
    case 'COMPLETE_GAME': {
      const alreadyDone = state.completedGames.includes(action.id)
      if (alreadyDone) return { ...state, screen: 'hub', currentGame: null }
      const newCompleted = [...state.completedGames, action.id]
      const newHints = { ...state.collectedHints, [action.id]: action.hint }
      const allDone = newCompleted.length === GAMES.length
      return {
        ...state,
        screen: allDone ? 'hub' : 'hub',
        currentGame: null,
        completedGames: newCompleted,
        collectedHints: newHints,
      }
    }
    case 'OPEN_MAZE':
      return { ...state, screen: 'maze' }
    case 'VICTORY':
      return { ...state, screen: 'victory' }
    case 'BACK_HUB':
      return { ...state, screen: 'hub', currentGame: null }
    default:
      return state
  }
}

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const isUnlocked = (id) => true  // todos los juegos accesibles desde el inicio

  const allCompleted = state.completedGames.length === GAMES.length

  return (
    <GameContext.Provider value={{ state, dispatch, isUnlocked, allCompleted }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  return useContext(GameContext)
}
