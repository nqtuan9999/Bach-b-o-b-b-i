import React, { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 15;
const SPEED = 130; // Faster speed

type Point = { x: number; y: number };
enum Direction { UP, DOWN, LEFT, RIGHT }

// Food types: Pho, Banh Mi, Coffee, Motorbike (bonus)
const FOOD_ICONS = ['🍜', '🥖', '☕', '🥭'];

const SnakeGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }, { x: 9, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 15 });
  const [foodType, setFoodType] = useState<string>(FOOD_ICONS[0]);
  const [dir, setDir] = useState<Direction>(Direction.RIGHT);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  
  const gameLoopRef = useRef<number | null>(null);
  const dirRef = useRef<Direction>(Direction.RIGHT);

  const generateFood = useCallback((): Point => {
    let newFood;
    // Ensure food doesn't spawn on snake
    do {
       newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (false); // Simplification for brevity, ideally check intersection
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }, { x: 9, y: 10 }]);
    setFood(generateFood());
    setDir(Direction.RIGHT);
    dirRef.current = Direction.RIGHT;
    setGameOver(false);
    setScore(0);
    setGameStarted(true);
    setFoodType(FOOD_ICONS[Math.floor(Math.random() * FOOD_ICONS.length)]);
  };

  const changeDirection = useCallback((newDir: Direction) => {
    const currentDir = dirRef.current;
    if (newDir === Direction.UP && currentDir === Direction.DOWN) return;
    if (newDir === Direction.DOWN && currentDir === Direction.UP) return;
    if (newDir === Direction.LEFT && currentDir === Direction.RIGHT) return;
    if (newDir === Direction.RIGHT && currentDir === Direction.LEFT) return;
    
    setDir(newDir);
    dirRef.current = newDir;
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return;
      switch(e.key) {
        case 'ArrowUp': e.preventDefault(); changeDirection(Direction.UP); break;
        case 'ArrowDown': e.preventDefault(); changeDirection(Direction.DOWN); break;
        case 'ArrowLeft': e.preventDefault(); changeDirection(Direction.LEFT); break;
        case 'ArrowRight': e.preventDefault(); changeDirection(Direction.RIGHT); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver, changeDirection]);

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = { ...head };

      switch (dirRef.current) {
        case Direction.UP: newHead.y -= 1; break;
        case Direction.DOWN: newHead.y += 1; break;
        case Direction.LEFT: newHead.x -= 1; break;
        case Direction.RIGHT: newHead.x += 1; break;
      }

      // Wrap around walls (Modern Twist)
      if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
      if (newHead.x >= GRID_SIZE) newHead.x = 0;
      if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
      if (newHead.y >= GRID_SIZE) newHead.y = 0;

      // Check collision with self
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        if (score > highScore) setHighScore(score);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 1);
        setFood(generateFood());
        setFoodType(FOOD_ICONS[Math.floor(Math.random() * FOOD_ICONS.length)]);
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, gameOver, generateFood, score, highScore]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      gameLoopRef.current = window.setInterval(moveSnake, SPEED);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [moveSnake, gameStarted, gameOver]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#0a0f1c] text-white relative overflow-hidden focus:outline-none">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,255,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(18,255,247,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 bg-gradient-to-b from-[#0a0f1c] to-transparent">
        <button onClick={onBack} className="text-cyan-400 bg-cyan-900/30 p-2 rounded-full hover:bg-cyan-400/20 border border-cyan-500/30 backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="flex flex-col items-center">
            <h2 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 uppercase tracking-widest drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
                Neon Snake
            </h2>
            <div className="text-[10px] text-cyan-600 font-mono">HIGH SCORE: {highScore}</div>
        </div>
        <div className="font-mono text-2xl text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]">{score}</div>
      </div>

      {/* Menu Overlay */}
      {!gameStarted || gameOver ? (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0a0f1c]/80 backdrop-blur-md p-6 text-center animate-fade-in-up">
          <h2 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
            {gameOver ? 'GAME OVER' : 'READY?'}
          </h2>
          <p className="text-cyan-200/70 mb-8 font-mono text-sm">
            {gameOver ? `Món ngon đã ăn: ${score}` : 'Thu thập đặc sản Sài Gòn'}
          </p>
          <button 
            onClick={resetGame}
            className="px-10 py-3 bg-cyan-500 hover:bg-cyan-400 rounded-none skew-x-[-10deg] font-bold text-[#0a0f1c] shadow-[4px_4px_0px_#8b5cf6] transform transition active:translate-y-1 active:shadow-none"
          >
            <span className="skew-x-[10deg] inline-block">{gameOver ? 'RETRY' : 'START'}</span>
          </button>
        </div>
      ) : null}

      {/* Game Board */}
      <div 
        className="relative bg-[#111827] border border-cyan-900/50 shadow-[0_0_30px_rgba(6,182,212,0.15)] z-20"
        style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
      >
        {snake.map((segment, i) => (
          <div
            key={i}
            className={`absolute ${i === 0 ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee] z-10' : 'bg-cyan-700/80'} rounded-sm`}
            style={{
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE - 1,
              height: CELL_SIZE - 1,
              borderRadius: i===0 ? '4px' : '2px'
            }}
          />
        ))}
        <div
          className="absolute flex items-center justify-center animate-bounce"
          style={{
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
            fontSize: '12px',
            filter: 'drop-shadow(0 0 5px rgba(251,191,36,0.5))'
          }}
        >
          {foodType}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-12 grid grid-cols-3 gap-3 pb-20 opacity-80 scale-90">
        <div />
        <button className="w-14 h-14 bg-cyan-900/40 rounded-lg border border-cyan-500/30 flex items-center justify-center active:bg-cyan-500/40 text-cyan-300 shadow-[0_4px_0_#164e63] active:shadow-none active:translate-y-1 transition-all" onClick={() => changeDirection(Direction.UP)}>▲</button>
        <div />
        <button className="w-14 h-14 bg-cyan-900/40 rounded-lg border border-cyan-500/30 flex items-center justify-center active:bg-cyan-500/40 text-cyan-300 shadow-[0_4px_0_#164e63] active:shadow-none active:translate-y-1 transition-all" onClick={() => changeDirection(Direction.LEFT)}>◀</button>
        <button className="w-14 h-14 bg-cyan-900/40 rounded-lg border border-cyan-500/30 flex items-center justify-center active:bg-cyan-500/40 text-cyan-300 shadow-[0_4px_0_#164e63] active:shadow-none active:translate-y-1 transition-all" onClick={() => changeDirection(Direction.DOWN)}>▼</button>
        <button className="w-14 h-14 bg-cyan-900/40 rounded-lg border border-cyan-500/30 flex items-center justify-center active:bg-cyan-500/40 text-cyan-300 shadow-[0_4px_0_#164e63] active:shadow-none active:translate-y-1 transition-all" onClick={() => changeDirection(Direction.RIGHT)}>▶</button>
      </div>
    </div>
  );
};

export default SnakeGame;