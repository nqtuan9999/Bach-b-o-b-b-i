import React, { useState, useEffect, useRef, useCallback } from 'react';

const COLS = 15;
const ROWS = 15;
const CELL_SIZE = 18; // Giảm nhẹ size để vừa màn hình nhỏ hơn

type Cell = {
  x: number;
  y: number;
  visited: boolean;
  walls: [boolean, boolean, boolean, boolean]; // Top, Right, Bottom, Left
};

const MazeGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [grid, setGrid] = useState<Cell[]>([]);
  const [player, setPlayer] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [goal, setGoal] = useState<{ x: number; y: number }>({ x: COLS - 1, y: ROWS - 1 });
  const [won, setWon] = useState(false);
  const [time, setTime] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<number | null>(null);

  const generateMaze = useCallback(() => {
    const newGrid: Cell[] = [];
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        newGrid.push({ x, y, visited: false, walls: [true, true, true, true] });
      }
    }

    const stack: Cell[] = [];
    const current = newGrid[0];
    current.visited = true;
    stack.push(current);

    const getIndex = (x: number, y: number) => {
      if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return -1;
      return x + y * COLS;
    };

    while (stack.length > 0) {
      const curr = stack[stack.length - 1];
      const neighbors: number[] = [];
      const top = getIndex(curr.x, curr.y - 1);
      const right = getIndex(curr.x + 1, curr.y);
      const bottom = getIndex(curr.x, curr.y + 1);
      const left = getIndex(curr.x - 1, curr.y);

      if (top !== -1 && !newGrid[top].visited) neighbors.push(top);
      if (right !== -1 && !newGrid[right].visited) neighbors.push(right);
      if (bottom !== -1 && !newGrid[bottom].visited) neighbors.push(bottom);
      if (left !== -1 && !newGrid[left].visited) neighbors.push(left);

      if (neighbors.length > 0) {
        const nextIdx = neighbors[Math.floor(Math.random() * neighbors.length)];
        const next = newGrid[nextIdx];
        if (next.x === curr.x + 1) { curr.walls[1] = false; next.walls[3] = false; }
        else if (next.x === curr.x - 1) { curr.walls[3] = false; next.walls[1] = false; }
        else if (next.y === curr.y + 1) { curr.walls[2] = false; next.walls[0] = false; }
        else if (next.y === curr.y - 1) { curr.walls[0] = false; next.walls[2] = false; }
        next.visited = true;
        stack.push(next);
      } else {
        stack.pop();
      }
    }
    setGrid(newGrid);
    setPlayer({ x: 0, y: 0 });
    setWon(false);
    setTime(0);
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
        setTime(t => t + 1);
    }, 1000);

  }, []);

  useEffect(() => {
    generateMaze();
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [generateMaze]);

  useEffect(() => {
    if (won && timerRef.current) {
        clearInterval(timerRef.current);
    }
  }, [won]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || grid.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Blueprint Style Background
    ctx.fillStyle = '#1e3a8a'; // Deep Blue
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Grid Lines (faint)
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= canvas.width; i+=CELL_SIZE) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    for (let i = 0; i <= canvas.height; i+=CELL_SIZE) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }

    const w = CELL_SIZE;

    // Draw Walls (Bright White/Blue)
    ctx.strokeStyle = '#93c5fd'; 
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    for (const cell of grid) {
      const x = cell.x * w;
      const y = cell.y * w;
      if (cell.walls[0]) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.stroke(); }
      if (cell.walls[1]) { ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w, y + w); ctx.stroke(); }
      if (cell.walls[2]) { ctx.beginPath(); ctx.moveTo(x + w, y + w); ctx.lineTo(x, y + w); ctx.stroke(); }
      if (cell.walls[3]) { ctx.beginPath(); ctx.moveTo(x, y + w); ctx.lineTo(x, y); ctx.stroke(); }
    }

    // Draw Goal (Red X or Flag)
    ctx.fillStyle = '#ef4444'; 
    ctx.font = '14px serif';
    ctx.fillText('🚩', goal.x * w + 2, goal.y * w + 14);

    // Draw Player (Yellow Dot with Glow)
    const px = player.x * w + w / 2;
    const py = player.y * w + w / 2;
    
    // Glow
    const gradient = ctx.createRadialGradient(px, py, 2, px, py, 8);
    gradient.addColorStop(0, 'rgba(252, 211, 77, 1)');
    gradient.addColorStop(1, 'rgba(252, 211, 77, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fill();

    // Core
    ctx.fillStyle = '#fcd34d'; 
    ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();

  }, [grid, player, goal]);

  const move = useCallback((dx: number, dy: number) => {
    if (won || grid.length === 0) return;
    const currentIdx = player.x + player.y * COLS;
    const cell = grid[currentIdx];
    
    if (dx === 0 && dy === -1 && cell.walls[0]) return;
    if (dx === 1 && dy === 0 && cell.walls[1]) return;
    if (dx === 0 && dy === 1 && cell.walls[2]) return;
    if (dx === -1 && dy === 0 && cell.walls[3]) return;

    const nextX = player.x + dx;
    const nextY = player.y + dy;

    if (nextX >= 0 && nextX < COLS && nextY >= 0 && nextY < ROWS) {
      setPlayer({ x: nextX, y: nextY });
      if (nextX === goal.x && nextY === goal.y) {
        setWon(true);
      }
    }
  }, [grid, player, won, goal]);

   useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (won) return;
      switch(e.key) {
        case 'ArrowUp': e.preventDefault(); move(0, -1); break;
        case 'ArrowDown': e.preventDefault(); move(0, 1); break;
        case 'ArrowLeft': e.preventDefault(); move(-1, 0); break;
        case 'ArrowRight': e.preventDefault(); move(1, 0); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move, won]);

  return (
    <div className="flex flex-col h-full bg-[#0f172a] text-white overflow-hidden pb-16">
      {/* Header */}
      <div className="flex-none p-4 flex justify-between items-center bg-blue-900/20 backdrop-blur-sm border-b border-blue-900/50">
        <button onClick={onBack} className="text-blue-200 bg-blue-800/50 p-2 rounded-full border border-blue-500/30">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h2 className="font-bold text-base text-blue-100 tracking-wider">BLUEPRINT ESCAPE</h2>
        <div className="font-mono text-lg text-yellow-400 w-12 text-right">{time}s</div>
      </div>

      {/* Main Game Area - Flex Grow to center Vertically */}
      <div className="flex-1 flex flex-col items-center justify-center p-2">
        <div className="relative p-2 bg-blue-900/40 rounded-sm shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-500/50">
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-blue-400"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-blue-400"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-blue-400"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-blue-400"></div>
          
          <canvas ref={canvasRef} width={COLS * CELL_SIZE} height={ROWS * CELL_SIZE} className="block cursor-crosshair mx-auto" />
          
          {won && (
            <div className="absolute inset-0 bg-blue-950/80 flex flex-col items-center justify-center backdrop-blur-sm animate-fade-in-up z-20">
              <h3 className="text-xl font-bold text-green-400 mb-2 uppercase tracking-widest">Mission Complete</h3>
              <p className="text-blue-200 text-sm mb-4">Time: {time}s</p>
              <button 
                onClick={generateMaze} 
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-sm font-bold border border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              >
                NEXT LEVEL
              </button>
            </div>
          )}
        </div>
      </div>

      {/* D-Pad Area - Fixed Height for consistency */}
      <div className="flex-none pb-4 px-4 flex justify-center">
         <div className="grid grid-cols-3 gap-3">
            <div />
            <button className="w-16 h-14 bg-blue-800/30 rounded-lg border border-blue-500/30 flex items-center justify-center active:bg-blue-600/50 text-blue-200 shadow-md active:translate-y-1 transition-all" onClick={() => move(0, -1)}>▲</button>
            <div />
            <button className="w-16 h-14 bg-blue-800/30 rounded-lg border border-blue-500/30 flex items-center justify-center active:bg-blue-600/50 text-blue-200 shadow-md active:translate-y-1 transition-all" onClick={() => move(-1, 0)}>◀</button>
            <button className="w-16 h-14 bg-blue-800/30 rounded-lg border border-blue-500/30 flex items-center justify-center active:bg-blue-600/50 text-blue-200 shadow-md active:translate-y-1 transition-all" onClick={() => move(0, 1)}>▼</button>
            <button className="w-16 h-14 bg-blue-800/30 rounded-lg border border-blue-500/30 flex items-center justify-center active:bg-blue-600/50 text-blue-200 shadow-md active:translate-y-1 transition-all" onClick={() => move(1, 0)}>▶</button>
         </div>
      </div>
    </div>
  );
};

export default MazeGame;