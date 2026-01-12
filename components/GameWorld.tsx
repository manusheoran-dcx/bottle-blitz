
import React from 'react';
import { Player, PowerPill, Position, TrialStep } from '../types';
import { CENTER_POS, PLAYER_RADIUS, PILL_RADIUS } from '../constants';

interface GameWorldProps {
  players: Player[];
  centerBottles: number;
  pills: PowerPill[];
  zoneRadius: number;
  trialTarget?: Position;
  trialStep?: TrialStep;
  isProtectedTrial?: boolean;
}

const getTrialInstruction = (step: TrialStep) => {
  switch (step) {
    case 'MOVE': return { text: 'Move to the Waypoint', icon: '📍', color: 'border-blue-500/50' };
    case 'COLLECT': return { text: 'Grab a Bottle from Center', icon: '🍾', color: 'border-blue-500/50' };
    case 'DEPOSIT': return { text: 'Return to your Home Base', icon: '🏠', color: 'border-blue-500/50' };
    case 'SPEED_PILL': return { text: 'Grab the Speed Overdrive', icon: '⚡', color: 'border-orange-500/50' };
    case 'COLLECT_FAST': return { text: 'Quickly grab another Bottle', icon: '🏃', color: 'border-blue-500/50' };
    case 'DEPOSIT_FAST': return { text: 'Dash back to your Base', icon: '💨', color: 'border-blue-500/50' };
    case 'SNATCH_TRIAL': return { text: "Steal from the Rival's Base", icon: '🥷', color: 'border-red-500/50' };
    case 'DEPOSIT_SNATCH': return { text: 'Secure the stolen point', icon: '📦', color: 'border-blue-500/50' };
    case 'SHIELD_PILL': return { text: 'Get the Aegis Shield', icon: '🛡️', color: 'border-emerald-500/50' };
    case 'SHIELD_DEMO': return { text: 'Invulnerable: Rivals can\'t steal!', icon: '✨', color: 'border-emerald-500/50' };
    case 'COMPLETE': return { text: 'Training Complete: Elite Status', icon: '🏆', color: 'border-yellow-500/50' };
    default: return { text: '', icon: '', color: 'border-blue-500/50' };
  }
};

const GameWorld: React.FC<GameWorldProps> = ({ players, centerBottles, pills, zoneRadius, trialTarget, trialStep, isProtectedTrial }) => {
  const trialInfo = trialStep ? getTrialInstruction(trialStep) : null;

  return (
    <div className="absolute inset-0">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Trial Waypoint Marker & Dialog */}
      {trialTarget && (
        <div 
          className="absolute z-[100] pointer-events-none flex flex-col items-center justify-center transition-all duration-500 ease-in-out"
          style={{
            left: `${trialTarget.x}%`,
            top: `${trialTarget.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {trialInfo && (
            <div className={`absolute bottom-16 w-52 animate-in fade-in slide-in-from-bottom-2 duration-300 ${trialStep === 'COMPLETE' ? 'scale-110' : ''}`}>
               <div className={`bg-slate-900 border ${trialInfo.color} rounded-2xl p-3 shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex items-center gap-3 relative`}>
                  <div className={`w-8 h-8 rounded-lg ${trialInfo.color.replace('border', 'bg').replace('/50', '/20')} flex items-center justify-center text-lg shrink-0`}>
                    {trialInfo.icon}
                  </div>
                  <p className="text-[11px] leading-tight font-black text-white uppercase tracking-tight">
                    {trialInfo.text}
                  </p>
                  <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-r border-b ${trialInfo.color} rotate-45`} />
               </div>
            </div>
          )}

          <div className={`w-12 h-12 aspect-square rounded-full border-2 animate-ping ${trialStep === 'COMPLETE' ? 'border-yellow-400' : 'border-blue-500'}`} />
          <div className={`absolute w-8 h-8 aspect-square rounded-full border animate-pulse ${trialStep === 'COMPLETE' ? 'bg-yellow-400/20 border-yellow-400' : 'bg-blue-500/20 border-blue-400'}`} />
          <div className="absolute text-xl animate-bounce">{trialStep === 'COMPLETE' ? '🏆' : '📍'}</div>
        </div>
      )}

      {/* Center Zone */}
      <div 
        className="absolute rounded-full flex items-center justify-center border-4 border-dashed border-blue-500/30 bg-blue-500/5 aspect-square"
        style={{
          width: `${zoneRadius * 2}%`,
          height: `${zoneRadius * 2}%`,
          left: `${CENTER_POS.x - zoneRadius}%`,
          top: `${CENTER_POS.y - zoneRadius}%`,
        }}
      >
        <div className="relative flex flex-wrap gap-1 justify-center max-w-[70%]">
          {Array.from({ length: centerBottles }).map((_, i) => (
            <BottleIcon key={i} size={10} />
          ))}
          {centerBottles === 0 && <span className="text-[8px] lg:text-[10px] text-blue-500/40 font-bold uppercase">Replenishing</span>}
        </div>
      </div>

      {/* Power Pills */}
      {pills.map((pill) => {
        const isExpiring = pill.lifetime < 120; 
        const opacity = isExpiring ? (pill.lifetime % 14 < 7 ? 0.2 : 0.9) : 1;
        
        return (
          <div
            key={pill.id}
            className={`absolute rounded-full flex items-center justify-center animate-bounce shadow-lg transition-opacity duration-200 z-30 aspect-square`}
            style={{
              width: `${PILL_RADIUS * 2.5}%`,
              height: `${PILL_RADIUS * 2.5}%`,
              left: `${pill.pos.x - PILL_RADIUS * 1.25}%`,
              top: `${pill.pos.y - PILL_RADIUS * 1.25}%`,
              backgroundColor: pill.type === 'SPEED' ? '#fb923c' : '#34d399',
              boxShadow: pill.type === 'SPEED' ? '0 0 15px #f97316' : '0 0 15px #10b981',
              opacity: opacity,
            }}
          >
            <span className="text-[8px] lg:text-[10px] font-black">{pill.type === 'SPEED' ? '⚡' : '🛡️'}</span>
          </div>
        );
      })}

      {/* Player Homes */}
      {players.map((p) => {
        const isProtected = p.activePowers.some(pow => pow.type === 'PROTECT');
        const isP1Home = p.id === 'p1';
        return (
          <div 
            key={`home-${p.id}`}
            className={`absolute rounded-full flex flex-col items-center justify-center border-2 transition-all duration-300 aspect-square overflow-hidden`}
            style={{
              width: `${zoneRadius * 2.1}%`,
              height: `${zoneRadius * 2.1}%`,
              left: `${p.homePos.x - zoneRadius * 1.05}%`,
              top: `${p.homePos.y - zoneRadius * 1.05}%`,
              borderColor: isProtected ? '#10b981' : `${p.color}44`,
              backgroundColor: isProtected ? 'rgba(16,185,129,0.1)' : `${p.color}11`,
              boxShadow: isProtected ? '0 0 30px rgba(16,185,129,0.3)' : 'none',
            }}
          >
            {isP1Home && isProtectedTrial && (
               <div className="absolute inset-[-15px] rounded-full border-2 border-emerald-500/50 animate-pulse flex items-center justify-center pointer-events-none aspect-square">
                  <span className="text-[7px] lg:text-[9px] font-black text-emerald-400 bg-slate-900/80 px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg">Protected</span>
               </div>
            )}
            {isProtected && (
              <div className="absolute inset-[-4px] rounded-full border-2 border-emerald-400/30 animate-[spin_4s_linear_infinite] aspect-square" style={{ borderStyle: 'dotted' }} />
            )}
            <div className="flex flex-wrap gap-0.5 lg:gap-1 justify-center max-w-[90%] pointer-events-none">
              {Array.from({ length: p.score }).map((_, i) => (
                <BottleIcon key={i} color={p.color} size={8} />
              ))}
            </div>
            <div className="absolute -bottom-4 lg:-bottom-6 flex flex-col items-center pointer-events-none">
              <span className={`text-[6px] lg:text-[10px] font-black uppercase tracking-tight whitespace-nowrap text-center ${isProtected ? 'text-emerald-400' : ''}`} style={{ color: !isProtected ? p.color : undefined }}>
                {isProtected ? '🛡️ AEGIS' : `${p.type === 'human' ? 'YOU' : p.name.split(' ')[1] || p.name}`}
              </span>
            </div>
          </div>
        );
      })}

      {/* Players */}
      {players.map((p) => {
        const isSpeeding = p.activePowers.some(pow => pow.type === 'SPEED');
        return (
          <div key={p.id} className="z-40">
            {isSpeeding && (
              <div 
                className="absolute rounded-full opacity-20 pointer-events-none transition-all duration-300 aspect-square"
                style={{
                  width: `${PLAYER_RADIUS * 3}%`,
                  height: `${PLAYER_RADIUS * 3}%`,
                  left: `${p.pos.x - PLAYER_RADIUS * 1.5}%`,
                  top: `${p.pos.y - PLAYER_RADIUS * 1.5}%`,
                  backgroundColor: '#f97316',
                  filter: 'blur(10px)',
                }}
              />
            )}
            <div
              className="absolute rounded-full transition-[transform] duration-75 flex items-center justify-center shadow-xl aspect-square flex-shrink-0"
              style={{
                width: `${PLAYER_RADIUS * 2.2}%`,
                height: `${PLAYER_RADIUS * 2.2}%`,
                left: `${p.pos.x - PLAYER_RADIUS * 1.1}%`,
                top: `${p.pos.y - PLAYER_RADIUS * 1.1}%`,
                backgroundColor: p.color,
                boxShadow: p.isCarrying ? `0 0 15px ${p.color}, 0 0 30px rgba(234, 179, 8, 0.4)` : `0 0 8px rgba(0,0,0,0.5)`,
              }}
            >
               {p.isCarrying && (
                 <div className="absolute -top-1.5 -right-1.5 w-4 h-4 lg:w-5 lg:h-5 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce shadow-lg border border-yellow-600 aspect-square z-50">
                   <BottleIcon size={8} />
                 </div>
               )}
               <span className="text-[7px] lg:text-[10px] font-black text-white uppercase pointer-events-none drop-shadow-md select-none">
                 {p.type === 'human' ? 'U' : 'AI'}
               </span>
               <div className="absolute inset-0 rounded-full border-2 border-transparent pointer-events-none aspect-square">
                  {p.activePowers.map(pow => (
                    <div 
                      key={pow.type} 
                      className={`absolute inset-[-3px] lg:inset-[-5px] rounded-full border-2 animate-pulse aspect-square ${pow.type === 'SPEED' ? 'border-orange-500/60' : 'border-emerald-500/60'}`} 
                    />
                  ))}
               </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const BottleIcon: React.FC<{ color?: string; size?: number }> = ({ color = '#facc15', size = 12 }) => (
  <svg 
    width={size} 
    height={size * 1.5} 
    viewBox="0 0 24 36" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="drop-shadow-sm shrink-0"
  >
    <rect x="6" y="2" width="12" height="6" rx="1" fill={color} opacity="0.8" />
    <path d="M4 12C4 10.3431 5.34315 9 7 9H17C18.6569 9 20 10.3431 20 12V32C20 33.6569 18.6569 35 17 35H7C5.34315 35 4 33.6569 4 32V12Z" fill={color} />
    <rect x="8" y="14" width="8" height="2" rx="0.5" fill="white" fillOpacity="0.3" />
  </svg>
);

export default GameWorld;
