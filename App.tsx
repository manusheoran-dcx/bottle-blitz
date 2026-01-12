
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Player, GameState, Position, PowerPill, PowerType, PlayerProfile, LeaderboardEntry, TrialStep } from './types';
import { 
  getInitPlayers, GAME_SPEED, ZONE_RADIUS, CENTER_POS, INITIAL_BOTTLES, 
  WIN_SCORE, POWER_DURATION, PILL_SPAWN_INTERVAL, PILL_LIFETIME, SPEED_BOOST_MULTIPLIER, PILL_RADIUS 
} from './constants';
import Scoreboard from './components/Scoreboard';
import WinScreen from './components/WinScreen';
import GameWorld from './components/GameWorld';
import IntroScreen from './components/IntroScreen';
import TrialOverlay from './components/TrialOverlay';

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [profile, setProfile] = useState<PlayerProfile>(() => {
    const saved = localStorage.getItem('bb_profile');
    return saved ? JSON.parse(saved) : { name: 'Player One', gamesPlayed: 0, gamesWon: 0, bestTime: null, tutorialComplete: false };
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    const saved = localStorage.getItem('bb_leaderboard');
    return saved ? JSON.parse(saved) : [];
  });

  const [gameState, setGameState] = useState<GameState>({
    players: getInitPlayers('Player One'),
    centerBottles: INITIAL_BOTTLES,
    winnerId: null,
    isPaused: false,
    pills: [],
    countdown: null,
    gameTime: 0,
    isTrial: false,
    trialStep: 'MOVE',
    speedPillCooldown: 0,
    protectPillCooldown: 0,
  });

  const requestRef = useRef<number>(0);
  const stateRef = useRef<GameState>(gameState);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTimeRef = useRef<number>(0);
  const lastCountdownUpdate = useRef<number>(0);

  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    localStorage.setItem('bb_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('bb_leaderboard', JSON.stringify(leaderboard));
  }, [leaderboard]);

  const getDistance = (p1: Position, p2: Position): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const moveToward = (current: Position, target: Position, speed: number): Position => {
    const dx = target.x - current.x;
    const dy = target.y - current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance <= speed) return { ...target };
    return {
      x: current.x + (dx / distance) * speed,
      y: current.y + (dy / distance) * speed,
    };
  };

  const spawnPill = useCallback((type: PowerType, pos?: Position): PowerPill => {
    return {
      id: Math.random().toString(36).substr(2, 9),
      pos: pos || { 
        x: 15 + Math.random() * 70, 
        y: 20 + Math.random() * 60 
      },
      type: type,
      lifetime: PILL_LIFETIME,
    };
  }, []);

  const handleGameOver = useCallback((winnerId: string, finalTime: number) => {
    if (stateRef.current.isTrial) return;
    const isHumanWinner = winnerId === 'p1';
    setProfile(prev => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      gamesWon: isHumanWinner ? prev.gamesWon + 1 : prev.gamesWon,
      bestTime: (isHumanWinner && (!prev.bestTime || finalTime < prev.bestTime)) ? finalTime : prev.bestTime
    }));
    if (isHumanWinner) {
      setLeaderboard(prev => {
        const newEntry = { name: profile.name, time: finalTime, date: new Date().toLocaleDateString() };
        const updated = [...prev, newEntry].sort((a, b) => a.time - b.time).slice(0, 5);
        return updated;
      });
    }
  }, [profile.name]);

  const updateGame = useCallback((time: number) => {
    if (showIntro) return;
    const deltaTime = lastTimeRef.current ? time - lastTimeRef.current : 0;
    lastTimeRef.current = time;

    if (stateRef.current.countdown !== null) {
      if (time - lastCountdownUpdate.current >= 1000) {
        lastCountdownUpdate.current = time;
        setGameState(prev => {
          if (prev.countdown === 0) return { ...prev, countdown: null };
          return { ...prev, countdown: prev.countdown! - 1 };
        });
      }
      requestRef.current = requestAnimationFrame(updateGame);
      return;
    }

    if (stateRef.current.isPaused || stateRef.current.winnerId) {
      requestRef.current = requestAnimationFrame(updateGame);
      return;
    }

    setGameState((prev) => {
      let nextPills = prev.pills
        .map(p => ({ ...p, lifetime: prev.isTrial ? 99999 : p.lifetime - 1 }))
        .filter(p => p.lifetime > 0);

      let nextSpeedCooldown = prev.speedPillCooldown;
      let nextProtectCooldown = prev.protectPillCooldown;

      if (!prev.isTrial) {
        const speedOnBoard = nextPills.find(p => p.type === 'SPEED');
        const protectOnBoard = nextPills.find(p => p.type === 'PROTECT');

        if (!speedOnBoard) {
            if (nextSpeedCooldown <= 0) {
                nextPills.push(spawnPill('SPEED'));
                nextSpeedCooldown = PILL_SPAWN_INTERVAL;
            } else { nextSpeedCooldown--; }
        }
        if (!protectOnBoard) {
            if (nextProtectCooldown <= 0) {
                nextPills.push(spawnPill('PROTECT'));
                nextProtectCooldown = PILL_SPAWN_INTERVAL;
            } else { nextProtectCooldown--; }
        }
      }

      let nextStep = prev.trialStep;
      let nextTargetIndicator = prev.trialTarget;
      let nextThiefActive = prev.trialThiefActive;

      const p1 = prev.players.find(p => p.id === 'p1')!;
      
      if (prev.isTrial) {
        switch (prev.trialStep) {
          case 'MOVE':
            nextTargetIndicator = { x: 30, y: 65 };
            if (getDistance(p1.pos, nextTargetIndicator) < 5) nextStep = 'COLLECT';
            break;
          case 'COLLECT':
            nextTargetIndicator = CENTER_POS;
            if (p1.isCarrying) nextStep = 'DEPOSIT';
            break;
          case 'DEPOSIT':
            nextTargetIndicator = p1.homePos;
            if (p1.score === 1) {
               nextStep = 'SPEED_PILL';
               nextPills = [spawnPill('SPEED', { x: 80, y: 75 })];
            }
            break;
          case 'SPEED_PILL':
            nextTargetIndicator = nextPills[0]?.pos || { x: 80, y: 75 };
            if (p1.activePowers.some(pow => pow.type === 'SPEED')) nextStep = 'COLLECT_FAST';
            break;
          case 'COLLECT_FAST':
            nextTargetIndicator = CENTER_POS;
            if (p1.isCarrying) nextStep = 'DEPOSIT_FAST';
            break;
          case 'DEPOSIT_FAST':
            nextTargetIndicator = p1.homePos;
            if (p1.score === 2) nextStep = 'SNATCH_TRIAL';
            break;
          case 'SNATCH_TRIAL':
            const targetHome = prev.players.find(p => p.id === 'p2')?.homePos || {x: 17, y: 31};
            nextTargetIndicator = targetHome;
            if (p1.isCarrying) nextStep = 'DEPOSIT_SNATCH';
            break;
          case 'DEPOSIT_SNATCH':
            nextTargetIndicator = p1.homePos;
            if (p1.score === 3) {
               nextStep = 'SHIELD_PILL';
               nextPills = [spawnPill('PROTECT', { x: 20, y: 75 })];
            }
            break;
          case 'SHIELD_PILL':
            nextTargetIndicator = nextPills[0]?.pos || { x: 20, y: 75 };
            if (p1.activePowers.some(pow => pow.type === 'PROTECT')) {
              nextStep = 'SHIELD_DEMO';
              nextThiefActive = true;
            }
            break;
          case 'SHIELD_DEMO':
            nextTargetIndicator = p1.homePos;
            break;
        }
      }

      const nextPlayers = prev.players.map((player) => {
        if (prev.isTrial) {
            if (player.id === 'p2' && nextThiefActive) {
                const distToP1Home = getDistance(player.pos, p1.homePos);
                if (distToP1Home < ZONE_RADIUS + 3) {
                   const dx = player.pos.x - p1.homePos.x;
                   const dy = player.pos.y - p1.homePos.y;
                   const length = Math.sqrt(dx*dx + dy*dy) || 1;
                   const bounceOut = { x: p1.homePos.x + (dx/length) * (ZONE_RADIUS + 25), y: p1.homePos.y + (dy/length) * (ZONE_RADIUS + 25) };
                   if (nextStep === 'SHIELD_DEMO') setTimeout(() => setGameState(s => ({ ...s, trialStep: 'COMPLETE', trialTarget: undefined, trialThiefActive: false })), 1000);
                   return { ...player, target: bounceOut, pos: moveToward(player.pos, bounceOut, GAME_SPEED * 6) };
                }
                return { ...player, target: p1.homePos, pos: moveToward(player.pos, p1.homePos, GAME_SPEED * 2.5) };
            }
            if (player.type === 'bot' && !nextThiefActive) return { ...player };
        }

        const hasSpeedBoost = player.activePowers.some(p => p.type === 'SPEED');
        const hasShieldBoost = player.activePowers.some(p => p.type === 'PROTECT');
        const currentSpeed = hasSpeedBoost ? GAME_SPEED * SPEED_BOOST_MULTIPLIER : GAME_SPEED;
        const nextPos = moveToward(player.pos, player.target, currentSpeed);
        
        let nextTarget = { ...player.target };
        if (player.type === 'bot') {
          if (player.isCarrying) {
            nextTarget = player.homePos;
          } else {
            let bestTarget = player.homePos;
            let maxUtility = -1;
            const leader = prev.players.reduce((p, curr) => (curr.score > p.score ? curr : p), prev.players[0]);

            if (prev.centerBottles > 0) {
              const dist = getDistance(player.pos, CENTER_POS);
              const util = 2400 / (dist + 5); 
              if (util > maxUtility) { maxUtility = util; bestTarget = CENTER_POS; }
            }

            prev.players.forEach(other => {
              if (other.id === player.id) return;
              const shielded = other.activePowers.some(p => p.type === 'PROTECT');
              if (other.score > 0 && !shielded) {
                const dist = getDistance(player.pos, other.homePos);
                let baseVal = 1800;
                if (other.score >= WIN_SCORE - 1) baseVal += 1500; 
                if (other.id === leader.id) baseVal += 800;       
                if (other.type === 'human' && other.id === leader.id) baseVal += 500; 

                const util = baseVal / (dist + 8); 
                if (util > maxUtility) { maxUtility = util; bestTarget = other.homePos; }
              }
            });

            nextPills.forEach(pill => {
              const dist = getDistance(player.pos, pill.pos);
              let pillUtil = 0;
              if (pill.type === 'SPEED' && !hasSpeedBoost) {
                const carryingPenalty = player.isCarrying ? 0.3 : 1.0;
                pillUtil = (600 * carryingPenalty) / (dist + 15); 
              } else if (pill.type === 'PROTECT' && !hasShieldBoost && player.score > 0) {
                const leaderBonus = leader.id === player.id ? 2.0 : 1.0;
                pillUtil = (player.score * 250 * leaderBonus) / (dist + 20);
              }
              if (pillUtil > maxUtility) { maxUtility = pillUtil; bestTarget = pill.pos; }
            });

            nextTarget = bestTarget;
          }
        }

        const nextActivePowers = player.activePowers
          .map(p => ({ ...p, duration: p.duration - 1 }))
          .filter(p => p.duration > 0);

        return { ...player, pos: nextPos, target: nextTarget, activePowers: nextActivePowers };
      });

      const playersAfterPills = nextPlayers.map(player => {
        let updatedPlayer = { ...player };
        nextPills = nextPills.filter(pill => {
          if (getDistance(player.pos, pill.pos) < PILL_RADIUS + 3) {
            updatedPlayer.activePowers.push({ type: pill.type, duration: POWER_DURATION, endTime: 0 });
            return false;
          }
          return true;
        });
        return updatedPlayer;
      });

      let nextCenterBottles = prev.centerBottles;
      let winnerId = prev.winnerId;

      const finalPlayers = [...playersAfterPills];
      finalPlayers.forEach(player => {
        if (getDistance(player.pos, CENTER_POS) < ZONE_RADIUS && !player.isCarrying && nextCenterBottles > 0) {
          player.isCarrying = true;
          nextCenterBottles -= 1;
        }

        finalPlayers.forEach(target => {
          const d = getDistance(player.pos, target.homePos);
          if (d < ZONE_RADIUS) {
            if (player.id === target.id) {
              if (player.isCarrying) {
                player.isCarrying = false;
                player.score += 1;
                if (player.score >= (prev.isTrial ? 99 : WIN_SCORE)) winnerId = player.id;
              }
            } else {
              const shielded = target.activePowers.some(pow => pow.type === 'PROTECT');
              if (!player.isCarrying && !shielded && target.score > 0) {
                player.isCarrying = true;
                target.score -= 1;
              }
            }
          }
        });
      });

      const nextGameTime = prev.gameTime + deltaTime;
      if (winnerId && !prev.winnerId) handleGameOver(winnerId, nextGameTime);

      return {
        ...prev,
        players: finalPlayers,
        centerBottles: nextCenterBottles,
        winnerId,
        pills: nextPills,
        gameTime: nextGameTime,
        trialStep: nextStep,
        trialTarget: nextTargetIndicator,
        trialThiefActive: nextThiefActive,
        speedPillCooldown: nextSpeedCooldown,
        protectPillCooldown: nextProtectCooldown,
      };
    });

    requestRef.current = requestAnimationFrame(updateGame);
  }, [showIntro, spawnPill, handleGameOver]);

  useEffect(() => {
    if (!showIntro) {
      lastTimeRef.current = performance.now();
      lastCountdownUpdate.current = performance.now();
      requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [updateGame, showIntro]);

  const handlePointerInteraction = (e: React.PointerEvent) => {
    if (stateRef.current.winnerId || stateRef.current.countdown !== null) return;
    if (!containerRef.current) return;
    const bounds = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - bounds.left) / bounds.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - bounds.top) / bounds.height) * 100));
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => p.type === 'human' ? { ...p, target: { x, y } } : p)
    }));
  };

  const startBlitz = (name: string) => {
    setProfile(prev => ({ ...prev, name }));
    setShowIntro(false);
    resetGame(false, name);
  };

  const startTrial = (name: string) => {
    setProfile(prev => ({ ...prev, name }));
    setShowIntro(false);
    resetGame(true, name);
  };

  const resetGame = (isTrial: boolean = false, overrideName?: string) => {
    lastCountdownUpdate.current = performance.now();
    lastTimeRef.current = performance.now();
    const initPlayers = getInitPlayers(overrideName || profile.name);
    if (isTrial) {
      const p2 = initPlayers.find((p: any) => p.id === 'p2');
      if (p2) p2.score = 1;
    }
    setGameState({
      players: initPlayers,
      centerBottles: isTrial ? 2 : INITIAL_BOTTLES,
      winnerId: null,
      isPaused: false,
      pills: [],
      countdown: isTrial ? null : 3,
      gameTime: 0,
      isTrial,
      trialStep: 'MOVE',
      speedPillCooldown: 0, 
      protectPillCooldown: 0, 
    });
  };

  const goHome = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    const finalStep = stateRef.current.trialStep;
    
    setGameState(prev => ({ 
      ...prev, 
      isTrial: false, 
      trialStep: 'MOVE',
      trialTarget: undefined,
      trialThiefActive: false,
      countdown: null,
      winnerId: null
    }));
    
    if (finalStep === 'COMPLETE') {
      setProfile(prev => ({ ...prev, tutorialComplete: true }));
    }
    
    setShowIntro(true);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 text-white font-sans flex flex-col lg:flex-row items-center justify-center p-4 lg:p-8 gap-4 lg:gap-8 overflow-hidden">
      {showIntro && <IntroScreen onStart={startBlitz} onStartTrial={startTrial} profile={profile} leaderboard={leaderboard} />}
      <div className="w-full lg:w-72 flex flex-col gap-4 lg:gap-6 shrink-0 z-20">
        <Scoreboard 
          players={gameState.players} 
          centerCount={gameState.centerBottles} 
          gameTime={gameState.gameTime} 
          onGoHome={goHome} 
        />
      </div>
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden min-h-0">
        <div 
          ref={containerRef}
          className="relative aspect-square h-full max-h-full max-w-full bg-slate-900 border-2 lg:border-4 border-slate-800 rounded-3xl shadow-2xl overflow-hidden touch-none"
          onPointerDown={handlePointerInteraction} onPointerMove={handlePointerInteraction}
        >
          {gameState.isTrial && <TrialOverlay step={gameState.trialStep} onFinish={goHome} />}
          <GameWorld 
            players={gameState.players} centerBottles={gameState.centerBottles} 
            pills={gameState.pills} zoneRadius={ZONE_RADIUS} 
            trialTarget={gameState.trialTarget}
            trialStep={gameState.isTrial ? gameState.trialStep : undefined}
            isProtectedTrial={gameState.trialStep === 'SHIELD_DEMO'}
          />
          {gameState.countdown !== null && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-[2px] pointer-events-none">
              <div className="text-7xl lg:text-9xl font-black text-white">{gameState.countdown === 0 ? 'GO!' : gameState.countdown}</div>
            </div>
          )}
        </div>
      </div>
      {gameState.winnerId && <WinScreen winner={gameState.players.find(p => p.id === gameState.winnerId)!} onRestart={() => resetGame(false, profile.name)} finalTime={gameState.gameTime} isPersonalBest={gameState.winnerId === 'p1' && gameState.gameTime === profile.bestTime} />}
    </div>
  );
};

export default App;
