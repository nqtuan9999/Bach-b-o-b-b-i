import React, { useState } from 'react';
import SnakeGame from './SnakeGame';
import MazeGame from './MazeGame';

const TycoonGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [money, setMoney] = useState(1000);
    const [day, setDay] = useState(1);
    const [inventory, setInventory] = useState<{name: string, quantity: number, price: number}[]>([]);
    const [log, setLog] = useState<string[]>(["Chào mừng bạn đến Chợ Bến Thành! Hãy khởi nghiệp với 1000$ vốn."]);

    const items = [
        { name: "Cà phê bệt", cost: 10, sell: 25 },
        { name: "Bánh tráng trộn", cost: 15, sell: 35 },
        { name: "Áo dài lụa", cost: 200, sell: 450 },
        { name: "Đồ thủ công", cost: 50, sell: 120 },
    ];

    const buyItem = (item: any) => {
        if (money >= item.cost) {
            setMoney(m => m - item.cost);
            setInventory(prev => {
                const existing = prev.find(i => i.name === item.name);
                if (existing) {
                    return prev.map(i => i.name === item.name ? {...i, quantity: i.quantity + 1} : i);
                }
                return [...prev, { name: item.name, quantity: 1, price: item.sell }];
            });
            setLog(prev => [`Mua 1 ${item.name} (-$${item.cost})`, ...prev.slice(0, 4)]);
        } else {
            setLog(prev => [`Không đủ tiền mua ${item.name}!`, ...prev.slice(0, 4)]);
        }
    };

    const nextDay = () => {
        setDay(d => d + 1);
        let dailyIncome = 0;
        let newInv = inventory.map(item => {
            // Chance to sell logic based on "Economy" knowledge
            const sold = Math.floor(Math.random() * (item.quantity + 1));
            dailyIncome += sold * item.price;
            return { ...item, quantity: item.quantity - sold };
        }).filter(i => i.quantity > 0);
        
        setInventory(newInv);
        setMoney(m => m + dailyIncome);
        setLog(prev => [`Ngày ${day} kết thúc. Lãi: +$${dailyIncome}`, ...prev.slice(0, 4)]);
    };

    return (
        <div className="h-full bg-slate-900 text-white p-4 flex flex-col relative">
             <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                 <button onClick={onBack} className="text-slate-400 hover:text-white">❮ Thoát</button>
                 <h2 className="font-bold text-yellow-400">TIỂU THƯƠNG TYCOON</h2>
                 <div className="font-mono text-green-400">${money}</div>
             </div>

             <div className="flex-1 overflow-y-auto space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    {items.map(item => (
                        <button key={item.name} onClick={() => buyItem(item)} className="bg-slate-800 p-3 rounded-lg border border-slate-700 hover:bg-slate-700 active:scale-95 transition-all text-left">
                            <div className="font-bold text-sm">{item.name}</div>
                            <div className="text-xs text-slate-400">Vốn: ${item.cost} | Bán: ${item.sell}</div>
                        </button>
                    ))}
                </div>

                <div className="bg-slate-800 p-4 rounded-lg">
                    <h3 className="font-bold text-slate-300 mb-2 text-sm uppercase">Kho hàng</h3>
                    {inventory.length === 0 ? <p className="text-slate-500 text-xs italic">Kho trống</p> : (
                        <div className="space-y-1">
                            {inventory.map((i, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <span>{i.name}</span>
                                    <span className="text-slate-400">x{i.quantity}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="bg-black/30 p-3 rounded font-mono text-xs h-24 overflow-hidden">
                    {log.map((l, i) => <div key={i} className={i===0 ? "text-white" : "text-slate-500"}>{l}</div>)}
                </div>
             </div>

             <button onClick={nextDay} className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl mt-4 shadow-lg shadow-green-900">
                BẮT ĐẦU BÁN HÀNG (NGÀY {day})
             </button>
        </div>
    );
}

const GameHub: React.FC = () => {
  const [activeGame, setActiveGame] = useState<'NONE' | 'SNAKE' | 'MAZE' | 'TYCOON'>('NONE');

  if (activeGame === 'SNAKE') return <SnakeGame onBack={() => setActiveGame('NONE')} />;
  if (activeGame === 'MAZE') return <MazeGame onBack={() => setActiveGame('NONE')} />;
  if (activeGame === 'TYCOON') return <TycoonGame onBack={() => setActiveGame('NONE')} />;

  return (
    <div className="p-6 h-full flex flex-col justify-center items-center pb-24 space-y-4 overflow-y-auto">
        <div className="text-center mb-2 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">
                Góc Giải Trí
            </h2>
            <p className="text-slate-500 mt-1 text-sm">Vừa chơi vừa khám phá Bến Thành</p>
        </div>

      <button 
        onClick={() => setActiveGame('TYCOON')}
        className="w-full max-w-sm h-32 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl p-5 text-white flex flex-col justify-between transform transition hover:scale-105 active:scale-95 group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-20 transform -rotate-12">
            <span className="text-6xl">💰</span>
        </div>
        <div>
          <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold backdrop-blur-md">Mới! Kinh tế học</span>
          <h3 className="text-xl font-bold mt-1">Tiểu Thương Tycoon</h3>
        </div>
        <p className="text-amber-100 text-xs opacity-90">Tập làm giàu tại chợ Bến Thành</p>
      </button>

      <button 
        onClick={() => setActiveGame('SNAKE')}
        className="w-full max-w-sm h-32 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl p-5 text-white flex flex-col justify-between transform transition hover:scale-105 active:scale-95 group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-20 transform rotate-12">
             <span className="text-6xl">🐍</span>
        </div>
        <div>
          <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold backdrop-blur-md">Game Cổ Điển</span>
          <h3 className="text-xl font-bold mt-1">Săn Món Ngon</h3>
        </div>
        <p className="text-emerald-100 text-xs opacity-90">Điều khiển rắn ăn đặc sản</p>
      </button>

      <button 
        onClick={() => setActiveGame('MAZE')}
        className="w-full max-w-sm h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-5 text-white flex flex-col justify-between transform transition hover:scale-105 active:scale-95 group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-20 transform -rotate-6">
             <span className="text-6xl">🧩</span>
        </div>
        <div>
          <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold backdrop-blur-md">Trí Tuệ</span>
          <h3 className="text-xl font-bold mt-1">Lạc Lối Bến Thành</h3>
        </div>
        <p className="text-indigo-100 text-xs opacity-90">Tìm đường thoát khỏi mê cung</p>
      </button>
    </div>
  );
};

export default GameHub;