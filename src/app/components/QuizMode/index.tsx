import styles from '../PokemonDisplay.module.scss';

interface QuizModeProps {
    score: number;
    attempts: number;
    gameOver: boolean;
    onGuess: (type: string) => void;
    onReset: () => void;
  }

  export default function QuizMode({ score, attempts, gameOver, onGuess, onReset }: QuizModeProps) {
    const pokemonTypes = ['grass', 'water', 'fire'];
  
    return (
      <div className={styles.quizMode}>
        <h2>Guess the Pokemon Type</h2>
        <p>Score: {score}</p>
        <p>Attempts left: {3 - attempts}</p>
        {gameOver ? (
          <div>
            <p>Game Over! Your final score is {score}</p>
            <button onClick={onReset}>Play Again</button>
          </div>
        ) : (
          <div>
            {pokemonTypes.map((type) => (
              <button key={type} onClick={() => onGuess(type)}>
                {type}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
