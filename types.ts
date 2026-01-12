
export type PlayerType = 'human' | 'bot';
export type PowerType = 'PROTECT' | 'SPEED';

export interface Position {
  x: number;
  y: number;
}

export interface ActivePower {
  type: PowerType;
  endTime: number;
  duration: number;
}

export interface PowerPill {
  id: string;
  pos: Position;
  type: PowerType;
  lifetime: number;
}

export interface Player {
  id: string;
  name: string;
  type: PlayerType;
  pos: Position;
  target: Position;
  score: number;
  isCarrying: boolean;
  color: string;
  homePos: Position;
  activePowers: ActivePower[];
}

export interface PlayerProfile {
  name: string;
  gamesPlayed: number;
  gamesWon: number;
  bestTime: number | null; // in milliseconds
  tutorialComplete?: boolean;
}

export interface LeaderboardEntry {
  name: string;
  time: number;
  date: string;
}

export type TrialStep = 
  | 'MOVE' 
  | 'COLLECT' 
  | 'DEPOSIT' 
  | 'SPEED_PILL' 
  | 'COLLECT_FAST' 
  | 'DEPOSIT_FAST' 
  | 'SNATCH_TRIAL'
  | 'DEPOSIT_SNATCH'
  | 'SHIELD_PILL' 
  | 'SHIELD_DEMO' 
  | 'COMPLETE';

export interface GameState {
  players: Player[];
  centerBottles: number;
  winnerId: string | null;
  isPaused: boolean;
  pills: PowerPill[];
  countdown: number | null;
  gameTime: number; // in milliseconds
  isTrial: boolean;
  trialStep: TrialStep;
  trialTarget?: Position;
  trialThiefActive?: boolean;
  speedPillCooldown: number;
  protectPillCooldown: number;
}
