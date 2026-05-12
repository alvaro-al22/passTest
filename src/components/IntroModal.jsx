import { useGame } from '../context/GameContext'

export default function IntroModal() {
  const { dispatch } = useGame()

  return (
    <div className="overlay">
      <div className="modal intro-modal">
        <div className="intro-emoji-row">🐸💣🧩🃏🔠🌀</div>
        <h1 className="intro-title">El Laberinto<br />del HBO</h1>
        <p className="intro-sub">⚠️ Misión de alto nivel intelectual ⚠️</p>
        <p className="intro-warning">
          Hola, Yamila si quires ver la serie 'From' tendras que superar estas pruebas
        </p>

        <div className="intro-steps">
          <div className="intro-step">
            <span className="step-num">1</span>
            <span>Completa <strong>5 minijuegos</strong> con temática de memes y curiosidades raras 🤓</span>
          </div>
          <div className="intro-step">
            <span className="step-num">2</span>
            <span>Cada juego recompensa con una <strong>palabra secreta</strong> 🔑</span>
          </div>
          <div className="intro-step">
            <span className="step-num">2</span>
            <span>Te recomiendo apuntarlas en un papel por si tienes que recargar la página y podrás saltarte ese nivel introduciéndola en "Introducir pista" 🔑</span>
          </div>
          <div className="intro-step">
            <span className="step-num">3</span>
            <span>Los juegos se desbloquean <strong>en orden</strong> — no hay atajos, señorita 😤</span>
          </div>
          <div className="intro-step">
            <span className="step-num">4</span>
            <span>Con las 5 palabras accedes al <strong>Laberinto Final</strong> 🌀 donde deberás usarlas para ayudar a la gente perdida</span>
          </div>
          <div className="intro-step">
            <span className="step-num">5</span>
            <span>Si sobrevives… habrás demostrado que eres un digna de obtener la contraseña del HBO 🏆</span>
          </div>
        </div>

        <p className="intro-warning">
          Nota: Los desarrolladores no se responsabilizan de neuronas perdidas durante el proceso.
        </p>

        <button className="btn btn-primary btn-big" onClick={() => dispatch({ type: 'START' })}>
          ¡Estoy listo para sufrir! 💪
        </button>
      </div>
    </div>
  )
}
