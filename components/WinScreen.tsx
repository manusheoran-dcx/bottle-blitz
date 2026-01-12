
import React from 'react';
import { Player } from '../types';

interface WinScreenProps {
  winner: Player;
  onRestart: () => void;
  finalTime: number;
  isPersonalBest: boolean;
}

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hundredths = Math.floor((ms % 1000) / 10);
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
};

const WinScreen: React.FC<WinScreenProps> = ({ winner, onRestart, finalTime, isPersonalBest }) => {
  const isHuman = winner.type === 'human';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-500">
      <div className={`absolute inset-0 backdrop-blur-md ${isHuman ? 'bg-blue-600/30' : 'bg-red-950/60'}`} />
      
      <div className={`relative bg-slate-900 border-2 ${isHuman ? 'border-yellow-400/50 shadow-[0_0_100px_rgba(234,179,8,0.4)]' : 'border-red-500/30 shadow-[0_0_80px_rgba(239,68,68,0.2)]'} p-8 lg:p-12 rounded-[2.5rem] text-center max-w-sm w-full overflow-hidden`}>
        
        {isPersonalBest && (
           <div className="absolute top-4 -right-12 rotate-45 bg-yellow-400 text-slate-950 text-[8px] font-black px-12 py-1 shadow-lg z-20">
             NEW BEST!
           </div>
        )}

        <div className="relative mb-8 flex justify-center">
          <div className={`w-24 h-24 lg:w-32 lg:h-32 rounded-full flex items-center justify-center shadow-2xl relative z-10 ${isHuman ? 'bg-gradient-to-br from-yellow-300 via-yellow-500 to-orange-600' : 'bg-gradient-to-br from-slate-600 to-slate-900'}`}>
            <span className="text-5xl lg:text-7xl filter drop-shadow-lg">{isHuman ? '👑' : '💀'}</span>
            <div className={`absolute inset-[-12px] rounded-full border-2 animate-[ping_3s_ease-out_infinite] opacity-40 ${isHuman ? 'border-yellow-300' : 'border-red-500'}`} />
          </div>
          <div className={`absolute -bottom-3 ${isHuman ? 'bg-yellow-400 text-slate-950' : 'bg-red-600 text-white'} text-[10px] font-black px-4 py-1 rounded-full shadow-lg uppercase tracking-widest z-20`}>
            {isHuman ? 'ARENA KING' : 'WRECKED'}
          </div>
        </div>

        <div className="relative z-10">
          <h2 className={`text-5xl lg:text-6xl font-black mb-3 tracking-tighter italic uppercase ${isHuman ? 'text-transparent bg-clip-text bg-gradient-to-b from-white to-yellow-500' : 'text-red-500'}`}>
            {isHuman ? 'VICTORY' : 'DEFEATED'}
          </h2>
          
          <div className="mb-8 px-2 space-y-3">
            <p className="text-slate-200 text-sm lg:text-base leading-relaxed font-medium">
              {isHuman ? (
                <>You snatched the bottles in <span className="text-yellow-400 font-black font-mono">{formatTime(finalTime)}</span></>
              ) : (
                <><span className="font-black" style={{ color: winner.color }}>{winner.name}</span> claimed the arena in {formatTime(finalTime)}</>
              )}
            </p>
          </div>

          <button
            onClick={onRestart}
            className={`group relative w-full py-5 rounded-2xl font-black transition-all active:scale-[0.96] shadow-2xl uppercase tracking-[0.15em] text-sm overflow-hidden ${isHuman ? 'bg-white text-slate-950 hover:bg-yellow-50' : 'bg-red-600 text-white hover:bg-red-700'}`}
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {isHuman ? 'Reclaim Throne' : 'Try Again'}
              <span>→</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinScreen;
