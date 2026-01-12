
import React from 'react';
import { Player } from '../types';

interface ScoreboardProps {
  players: Player[];
  centerCount: number;
  gameTime: number;
  onGoHome: () => void;
}

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hundredths = Math.floor((ms % 1000) / 10);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
};

const Scoreboard: React.FC<ScoreboardProps> = ({ players, centerCount, gameTime, onGoHome }) => {
  return (
    <div className="w-full shrink-0 flex flex-col gap-2">
      {/* Top Bar with Timer and Home Button */}
      <div className="bg-slate-900/95 border border-slate-800 p-2 lg:p-4 rounded-xl shadow-lg flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[7px] lg:text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Elapsed</span>
          <span className="text-xs lg:text-xl font-mono font-black text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.3)]">
            {formatTime(gameTime)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-blue-500/10 border border-blue-500/20 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-lg">
             <span className="text-[9px] lg:text-xs font-black text-blue-100 uppercase">{centerCount} Bottles</span>
          </div>
          <button 
            onClick={onGoHome}
            className="w-7 h-7 lg:w-10 lg:h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all active:scale-90"
            title="Return Home"
          >
            <span className="text-xs lg:text-lg">🏠</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 p-2 lg:p-5 rounded-xl lg:rounded-2xl shadow-xl">
        <div className="hidden lg:flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Arena Status</h3>
          <span className="text-[9px] font-black text-yellow-400 uppercase">Goal: 3</span>
        </div>
        
        <div className="flex flex-wrap lg:flex-col gap-1.5 lg:gap-4 items-center lg:items-stretch overflow-x-auto no-scrollbar py-1">
          {players.map((p) => (
            <div key={p.id} className="flex flex-col gap-1 overflow-hidden p-1 lg:p-0 rounded-lg lg:bg-transparent bg-slate-800/20 border lg:border-0 border-slate-700/30 min-w-[70px] lg:min-w-0">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1 overflow-hidden flex-1">
                  <div 
                    className="w-1.5 h-1.5 lg:w-3 lg:h-3 rounded-full shrink-0" 
                    style={{ backgroundColor: p.color }}
                  />
                  <span className={`text-[8px] lg:text-sm truncate font-bold flex-1 ${p.type === 'human' ? 'text-white' : 'text-slate-400'}`}>
                    {p.type === 'human' ? 'You' : p.name.split(' ')[1] || p.name}
                  </span>
                </div>
                
                <div className="flex items-center gap-0.5 shrink-0">
                  {p.isCarrying && (
                    <span className="text-[7px] lg:text-[12px] animate-pulse">🍾</span>
                  )}
                  <div className="bg-slate-800 px-1 lg:px-2.5 py-0.5 rounded border border-slate-700 min-w-[14px] lg:min-w-[28px] text-center">
                    <span className="text-[9px] lg:text-sm font-black font-mono leading-none">
                      {p.score}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-0.5 h-[1.5px] lg:h-1 w-full overflow-hidden">
                {p.activePowers.length === 0 ? (
                   <div className="w-full bg-slate-800/30 rounded-full h-full" />
                ) : (
                  p.activePowers.map((pow) => (
                    <div 
                      key={pow.type} 
                      className={`h-full rounded-full flex-1 ${pow.type === 'SPEED' ? 'bg-orange-500' : 'bg-emerald-500'}`}
                      style={{ opacity: 0.5 + (pow.duration / 720) }}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;
