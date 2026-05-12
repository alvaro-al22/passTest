import { useGame } from '../context/GameContext'

const CONFETTI_COLORS = ['#39ff14','#bc13fe','#ff073a','#00d4ff','#ffee00']

function ConfettiPiece({ style }) {
  return <div className="confetti-piece" style={style} />
}

export default function VictoryScreen() {
  const { dispatch } = useGame()

  const confetti = Array.from({ length: 60 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `-${Math.random() * 20}px`,
    background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${2 + Math.random() * 3}s`,
    width: `${8 + Math.random() * 10}px`,
    height: `${8 + Math.random() * 10}px`,
    borderRadius: Math.random() > 0.5 ? '50%' : '0',
  }))

  return (
    <div className="victory-screen">
      {confetti.map((style, i) => <ConfettiPiece key={i} style={style} />)}

      <div className="victory-content">
        <div className="victory-emoji">🏆</div>
        <h1 className="victory-title">¡EL GRAN PREMIO!</h1>
        <p className="victory-sub">Has superado el Laberinto y cumplido tu deuda con el karma</p>

        <div className="victory-meme-box">
          <p className="victory-proverb-label">🀄 Como dijo un proverbio chino:</p>
          <p className="victory-chinese">
            如果你想知道你一直在寻找的答案，请打电话给你认识的最帅的男孩，然后告诉他：
          </p>
          <p className="victory-chinese-sub1">
            Si quieres saber la respuesta que has estado buscando, dile al chico más guapo que conozcas:
          </p>
          <p className="victory-chinese-sub2">
            "Agita chata que sale horchata"
          </p>
          <p className="victory-chinese-sub1">
            y te dira las la contraseña de HBO
          </p>
          <div className="victory-meme-author" style={{ marginTop: '.75rem' }}>
            (No iba a ponerte una contraseña en una web, jejeje 😉)
          </div>
        </div>

        <div className="victory-stats">
          <div className="victory-stat">🧑‍🍳 LINCE: Aitor Tilla, ya sabe quién es</div>
          <div className="victory-stat">👩‍🔧 SALTAMONTES: Remedios encontró su esencia</div>
          <div className="victory-stat">🧑‍🦽 ALCON: Paco Jo alzó el vuelo</div>
          <div className="victory-stat">👷‍♀️ PIEDRA: Consuelo por fin se siente sólida</div>
          <div className="victory-stat">🧜 PULPO: 40 años de paz para Bartolomeo</div>
        </div>


        <button
          className="btn btn-primary btn-big"
          onClick={() => dispatch({ type: 'START' })}
        >
          Volver al inicio →
        </button>
      </div>
    </div>
  )
}

