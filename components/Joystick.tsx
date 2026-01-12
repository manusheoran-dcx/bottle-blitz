
import React, { useRef, useEffect, useCallback } from 'react';

interface JoystickProps {
  onMove: (vx: number, vy: number) => void;
  onEnd: () => void;
}

const Joystick: React.FC<JoystickProps> = ({ onMove, onEnd }) => {
  const knobRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  
  // Adjusted for w-28 (112px width). Half is 56px. MAX_RADIUS 44px gives some padding.
  const MAX_RADIUS = 44; 
  const DEADZONE = 0.08; 

  const updateKnobPosition = useCallback((x: number, y: number) => {
    if (knobRef.current) {
      knobRef.current.style.transform = `translate(${x}px, ${y}px)`;
    }
  }, []);

  const handleInput = useCallback((clientX: number, clientY: number) => {
    if (!baseRef.current) return;

    const rect = baseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) {
      onMove(0, 0);
      updateKnobPosition(0, 0);
      return;
    }

    const angle = Math.atan2(dy, dx);
    const rawNormalizedDist = Math.min(distance, MAX_RADIUS) / MAX_RADIUS;
    
    let finalMagnitude = 0;
    if (rawNormalizedDist > DEADZONE) {
      const scaledMag = (rawNormalizedDist - DEADZONE) / (1 - DEADZONE);
      // Power curve for finer steering control at low magnitudes
      finalMagnitude = Math.pow(scaledMag, 1.2); 
    }

    const vx = Math.cos(angle) * finalMagnitude;
    const vy = Math.sin(angle) * finalMagnitude;

    const visualDist = Math.min(distance, MAX_RADIUS);
    const knobX = Math.cos(angle) * visualDist;
    const knobY = Math.sin(angle) * visualDist;

    updateKnobPosition(knobX, knobY);
    onMove(vx, vy);
  }, [onMove, updateKnobPosition]);

  const onStart = (e: React.TouchEvent | React.MouseEvent) => {
    isDragging.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    handleInput(clientX, clientY);
  };

  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;
      if (e.cancelable) e.preventDefault();

      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      handleInput(clientX, clientY);
    };

    const handleGlobalEnd = () => {
      if (isDragging.current) {
        isDragging.current = false;
        updateKnobPosition(0, 0);
        onEnd();
      }
    };

    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('mouseup', handleGlobalEnd);
    window.addEventListener('touchmove', handleGlobalMove, { passive: false });
    window.addEventListener('touchend', handleGlobalEnd);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalEnd);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('touchend', handleGlobalEnd);
    };
  }, [handleInput, onEnd, updateKnobPosition]);

  return (
    <div className="fixed bottom-8 right-4 z-[200] lg:hidden touch-none select-none">
      <div 
        ref={baseRef}
        className="w-28 h-28 bg-white/5 backdrop-blur-xl rounded-full border-2 border-white/20 flex items-center justify-center relative shadow-2xl active:scale-95 transition-transform"
        onMouseDown={onStart}
        onTouchStart={onStart}
      >
        {/* Inner Guide Ring */}
        <div className="absolute inset-3 rounded-full border border-white/10 pointer-events-none" />
        
        {/* Directional Hints */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-0.5 h-0.5 bg-white/30 rounded-full" />
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-0.5 h-0.5 bg-white/30 rounded-full" />
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-0.5 h-0.5 bg-white/30 rounded-full" />
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-0.5 h-0.5 bg-white/30 rounded-full" />

        {/* Joystick Knob */}
        <div 
          ref={knobRef}
          className="w-12 h-12 bg-gradient-to-br from-white/60 to-white/20 rounded-full border border-white/70 shadow-[0_0_15px_rgba(255,255,255,0.4)] pointer-events-none absolute will-change-transform z-10"
        >
          {/* Knob Inner Detail */}
          <div className="absolute inset-[25%] rounded-full border border-white/30" />
        </div>
        
        <div className="text-white/30 text-[6px] font-black uppercase tracking-[0.4em] pointer-events-none select-none mt-16">
          Drive
        </div>
      </div>
    </div>
  );
};

export default Joystick;
