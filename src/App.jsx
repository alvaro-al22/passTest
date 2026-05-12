import { GameProvider, useGame, GAMES } from './context/GameContext'
import IntroModal from './components/IntroModal'
import GameHub from './components/GameHub'
import VictoryScreen from './components/VictoryScreen'
import Minesweeper from './games/Minesweeper'
import Hangman from './games/Hangman'
import SlidingPuzzle from './games/SlidingPuzzle'
import MemoryCards from './games/MemoryCards'
import WordSearch from './games/WordSearch'
import Maze from './final/Maze'

const GAME_COMPONENTS = [Minesweeper, Hangman, SlidingPuzzle, MemoryCards, WordSearch]

function AppContent() {
  const { state } = useGame()
  const { screen, currentGame } = state

  if (screen === 'intro') return <IntroModal />
  if (screen === 'victory') return <VictoryScreen />
  if (screen === 'maze') return <Maze />
  if (screen === 'game' && currentGame !== null) {
    const GameComponent = GAME_COMPONENTS[currentGame]
    return <GameComponent gameData={GAMES[currentGame]} />
  }
  return <GameHub />
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  )
}
