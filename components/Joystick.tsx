
import React, { useRef, useEffect, useCallback } from 'react';

interface JoystickProps {
  onMove: (vx: number, vy: number) => void;
  onEnd: () => void;
}

const Joystick: React.FC<JoystickProps> = ({ onMove, onEnd }) => {
  const knobRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  
  const MAX_RADIUS = 56; // Larger radius for finer control
  const DEADZONE = 0.08; // Lower deadzone for more immediate response

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
    
    // Calibration: Apply deadzone and then a power curve for "steering precision"
    // This makes small movements much more controllable
    let finalMagnitude = 0;
    if (rawNormalizedDist > DEADZONE) {
      const scaledMag = (rawNormalizedDist - DEADZONE) / (1 - DEADZONE);
      finalMagnitude = Math.pow(scaledMag, 1.2); 
    }

    const vx = Math.cos(angle) * finalMagnitude;
    const vy = Math.sin(angle) * finalMagnitude;

    // Visual knob feedback (snappy)
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
    <div className="fixed bottom-12 right-12 z-[150] lg:hidden touch-none select-none">
      <div 
        ref={baseRef}
        className="w-32 h-32 bg-white/5 backdrop-blur-xl rounded-full border-2 border-white/20 flex items-center justify-center relative shadow-2xl active:scale-95 transition-transform"
        onMouseDown={onStart}
        onTouchStart={onStart}
      >
        {/* Inner Guide Ring */}
        <div className="absolute inset-4 rounded-full border border-white/10 pointer-events-none" />
        
        {/* Directional Hints */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-white/20 rounded-full" />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-white/20 rounded-full" />
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-1 bg-white/20 rounded-full" />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-1 bg-white/20 rounded-full" />

        {/* Joystick Knob */}
        <div 
          ref={knobRef}
          className="w-16 h-16 bg-gradient-to-br from-white/50 to-white/10 rounded-full border border-white/60 shadow-[0_0_20px_rgba(255,255,255,0.3)] pointer-events-none absolute will-change-transform z-10"
        >
          {/* Knob Inner Detail */}
          <div className="absolute inset-[20%] rounded-full border border-white/20" />
        </div>
        
        <div className="text-white/20 text-[7px] font-black uppercase tracking-[0.4em] pointer-events-none select-none mt-20">
          Steer
        </div>
      </div>
    </div>
  );
};

export default Joystick;
