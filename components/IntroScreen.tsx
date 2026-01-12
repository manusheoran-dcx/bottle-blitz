
import React, { useState } from 'react';
import { PlayerProfile, LeaderboardEntry } from '../types';

interface IntroScreenProps {
  onStart: (name: string) => void;
  onStartTrial: (name: string) => void;
  profile: PlayerProfile;
  leaderboard: LeaderboardEntry[];
}

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hundredths = Math.floor((ms % 1000) / 10);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
};

const IntroScreen: React.FC<IntroScreenProps> = ({ onStart, onStartTrial, profile, leaderboard }) => {
  const [activeTab, setActiveTab] = useState<'play' | 'stats' | 'rankings'>('play');
  const [showInstructions, setShowInstructions] = useState(false);
  const [name, setName] = useState(profile.name);

  const winRate = profile.gamesPlayed > 0 ? Math.round((profile.gamesWon / profile.gamesPlayed) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 p-2 lg:p-8 overflow-y-auto">
      <div className="max-w-3xl w-full bg-slate-900 border-2 border-slate-800 rounded-2xl lg:rounded-[2.5rem] shadow-[0_0_100px_rgba(59,130,246,0.15)] overflow-hidden flex flex-col lg:flex-row min-h-[400px] lg:min-h-[500px]">
        
        {/* Sidebar Nav */}
        <div className="shrink-0 lg:w-1/3 bg-gradient-to-br from-blue-600 to-indigo-900 p-4 lg:p-10 flex flex-col justify-between">
          <div>
            <div className="flex lg:block items-center justify-between mb-4 lg:mb-8">
              <div className="relative w-10 h-10 lg:w-20 lg:h-20">
                <div className="w-full h-full bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-xl lg:text-4xl">🍾</span>
                </div>
                <div className="absolute -top-1 -right-1 bg-yellow-400 text-slate-950 text-[8px] lg:text-[10px] font-black px-1.5 lg:px-2 py-0.5 rounded-full">BLITZ</div>
              </div>
              <h1 className="text-xl lg:text-3xl font-black italic tracking-tighter text-white text-right lg:text-left leading-tight">BOTTLE BLITZ</h1>
            </div>
            
            <nav className="flex flex-row lg:flex-col gap-1 lg:gap-2 mb-4 lg:mb-8 flex-wrap">
              {(['play', 'stats', 'rankings'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 lg:flex-none text-center lg:text-left px-3 lg:px-4 py-2 lg:py-3 rounded-lg lg:rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-indigo-900 shadow-lg' : 'text-blue-100 hover:bg-white/10'}`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="hidden lg:block text-blue-200/50 text-[10px] font-bold uppercase tracking-widest">
            v3.6 Classic Arena
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-5 lg:p-12 bg-slate-900 overflow-y-auto">
          
          {activeTab === 'play' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h2 className="text-xl lg:text-2xl font-black text-white">Main Deck</h2>
                <button 
                  onClick={() => setShowInstructions(true)}
                  className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[9px] lg:text-[10px] font-black px-4 py-2 rounded-full flex items-center gap-1.5 transition-all border border-blue-500/20 active:scale-95 group"
                >
                  <span>GUIDE</span>
                  <div className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-[8px] group-hover:rotate-12 transition-transform">?</div>
                </button>
              </div>
              
              <div className="mb-4 lg:mb-6">
                <label className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5 block">Your Pilot Tag</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value.slice(0, 15))}
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-3 lg:py-4 text-white font-bold focus:border-blue-500 outline-none transition-all text-sm lg:text-base"
                  placeholder="Player Name..."
                />
              </div>

              <div className="mb-6 lg:mb-10 bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl">
                 <div className="flex items-center gap-3 mb-1">
                   <span className="text-blue-400 text-sm">⚔️</span>
                   <span className="text-[11px] font-black text-white uppercase tracking-widest">Standard Battle Rules</span>
                 </div>
                 <p className="text-[10px] text-slate-400 font-medium">3 Players • First to 3 Bottles • High Octane AI</p>
              </div>

              <div className="flex flex-col gap-3 mt-auto">
                <button 
                  onClick={() => onStart(name || 'Player One')}
                  className="group relative w-full py-4 lg:py-5 bg-white text-slate-950 font-black rounded-2xl hover:bg-blue-50 transition-all active:scale-[0.98] shadow-2xl overflow-hidden"
                >
                  <div className="relative z-10 flex items-center justify-center gap-2 lg:gap-3 text-sm lg:text-lg uppercase tracking-widest">
                    PLAY NOW
                    <span className="group-hover:translate-x-1 transition-transform">🚀</span>
                  </div>
                </button>

                <button 
                  onClick={() => onStartTrial(name || 'Rookie')}
                  className="w-full py-3 lg:py-4 bg-slate-800 border border-slate-700 text-blue-400 hover:text-white hover:bg-slate-700 font-black rounded-2xl transition-all active:scale-[0.98] uppercase tracking-widest text-[10px] lg:text-xs"
                >
                  START TRIAL RUN
                </button>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl lg:text-2xl font-black text-white mb-6">Service Record</h2>
              <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-8">
                <div className="bg-slate-800/60 p-4 lg:p-5 rounded-2xl border border-slate-700/30">
                  <span className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Played</span>
                  <span className="text-xl lg:text-2xl font-black text-white">{profile.gamesPlayed}</span>
                </div>
                <div className="bg-slate-800/60 p-4 lg:p-5 rounded-2xl border border-slate-700/30">
                  <span className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Wins</span>
                  <span className="text-xl lg:text-2xl font-black text-emerald-400">{profile.gamesWon}</span>
                </div>
                <div className="bg-slate-800/60 p-4 lg:p-5 rounded-2xl border border-slate-700/30">
                  <span className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Win Rate</span>
                  <span className="text-xl lg:text-2xl font-black text-blue-400">{winRate}%</span>
                </div>
                <div className="bg-slate-800/60 p-4 lg:p-5 rounded-2xl border border-slate-700/30">
                  <span className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Best Time</span>
                  <span className="text-base lg:text-xl font-black text-yellow-400 font-mono">
                    {profile.bestTime ? formatTime(profile.bestTime) : '--:--.--'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rankings' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl lg:text-2xl font-black text-white mb-6">Hall of Fame</h2>
              {leaderboard.length > 0 ? (
                <div className="space-y-2 lg:space-y-3">
                  {leaderboard.map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-800/40 p-3 lg:p-4 rounded-xl border border-slate-700/30">
                      <div className="flex items-center gap-3 lg:gap-4">
                        <span className={`w-5 h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center text-[8px] lg:text-[10px] font-black ${idx === 0 ? 'bg-yellow-400 text-slate-950' : 'bg-slate-700 text-slate-300'}`}>
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-xs lg:text-sm font-black text-white">{entry.name}</p>
                        </div>
                      </div>
                      <span className="text-xs lg:text-sm font-black font-mono text-blue-400">{formatTime(entry.time)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 opacity-30">
                  <span className="text-3xl lg:text-4xl mb-4 block">🏆</span>
                  <p className="text-[10px] font-bold uppercase tracking-widest">No victories recorded yet</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Instructions Overlay Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 lg:p-10 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setShowInstructions(false)} />
          <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-slate-700 rounded-[2rem] shadow-[0_0_80px_rgba(59,130,246,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="shrink-0 p-6 lg:p-10 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">Tactical Briefing</h2>
              <button onClick={() => setShowInstructions(false)} className="w-10 h-10 bg-slate-800 hover:bg-slate-700 text-white rounded-full flex items-center justify-center text-xl transition-colors">×</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 scrollbar-hide">
              <section className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/30">
                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-blue-500/20 text-blue-400 w-10 h-10 rounded-xl flex items-center justify-center text-xl">🎯</div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">The Primary Goal</h3>
                </div>
                <p className="text-xs lg:text-sm leading-relaxed text-slate-300 pl-14">
                  Collect <span className="text-white font-black underline decoration-blue-500/40">3 Bottles</span> and bring them back to your <span className="text-blue-400 font-bold underline decoration-blue-500/30">Home Base</span>.
                </p>
              </section>

              <section className="bg-indigo-600/5 p-6 rounded-3xl border border-indigo-600/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:scale-110 transition-transform duration-500">🖱️</div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-indigo-500/20 text-indigo-400 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner animate-pulse">
                    👆
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Navigation Control</h3>
                </div>
                <div className="pl-16">
                  <p className="text-xs lg:text-sm leading-relaxed text-slate-300">
                    <span className="text-white font-bold italic">Tap, Click, or Drag</span> anywhere on the field to set your destination. Your bot will pursue that exact coordinate immediately.
                  </p>
                </div>
              </section>
            </div>

            <div className="shrink-0 p-6 lg:p-10 border-t border-slate-800 bg-slate-900/50">
              <button 
                onClick={() => setShowInstructions(false)}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all active:scale-[0.97] flex items-center justify-center gap-4 shadow-xl shadow-blue-900/40 group"
              >
                <span className="uppercase tracking-[0.2em] text-sm">Understood, Pilot</span>
                <span className="group-hover:translate-x-1 transition-transform">🚀</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntroScreen;
