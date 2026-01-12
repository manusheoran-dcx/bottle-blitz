
import React from 'react';
import { TrialStep } from '../types';

interface TrialOverlayProps {
  step: TrialStep;
  onFinish: () => void;
}

const TrialOverlay: React.FC<TrialOverlayProps> = ({ step, onFinish }) => {
  const steps: TrialStep[] = ['MOVE', 'COLLECT', 'DEPOSIT', 'SPEED_PILL', 'COLLECT_FAST', 'DEPOSIT_FAST', 'SNATCH_TRIAL', 'DEPOSIT_SNATCH', 'SHIELD_PILL', 'SHIELD_DEMO', 'COMPLETE'];
  const currentIndex = steps.indexOf(step);
  const isComplete = step === 'COMPLETE';

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[110] w-[92%] max-w-sm pointer-events-none">
      <div className={`transition-all duration-500 ${isComplete ? 'bg-slate-900 border-yellow-400/50 shadow-[0_0_40px_rgba(250,204,21,0.3)] p-3 lg:p-4 rounded-3xl' : 'bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-full px-4 py-2 shadow-lg'} flex items-center justify-between gap-4`}>
        <div className="flex flex-col">
           <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isComplete ? 'text-yellow-400' : 'text-blue-400'}`}>
             {isComplete ? 'Elite Training Over' : 'Training Mission'}
           </span>
           <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{currentIndex + 1} / {steps.length} Steps</span>
        </div>
        
        {isComplete && (
          <button 
            onClick={onFinish}
            className="pointer-events-auto bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-[11px] font-black px-6 py-2.5 rounded-2xl transition-all active:scale-95 shadow-xl shadow-yellow-400/20 animate-bounce whitespace-nowrap flex items-center gap-2"
          >
            <span>FINISH DEPLOYMENT</span>
            <span className="text-sm">🚀</span>
          </button>
        )}
      </div>
      
      {!isComplete && (
        <div className="mt-2 flex justify-center gap-1 opacity-60 px-4">
          {steps.map((s, idx) => (
            <div 
              key={s} 
              className={`h-1 rounded-full transition-all duration-300 ${idx <= currentIndex ? 'flex-1 bg-blue-500' : 'w-1.5 bg-slate-800'}`} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TrialOverlay;
