
export const WEB_SPEED = 0.35; 
export const MOBILE_SPEED = 0.7; 
export const SPEED_BOOST_MULTIPLIER = 1.45;
export const ZONE_RADIUS = 10;
export const PLAYER_RADIUS = 3;
export const PILL_RADIUS = 2;
export const CENTER_POS = { x: 50, y: 50 };
export const INITIAL_BOTTLES = 5;
export const WIN_SCORE = 3;

export const POWER_DURATION = 420;    
export const PILL_SPAWN_INTERVAL = 500; 
export const PILL_LIFETIME = 1200;      
export const MAX_PILLS_PER_TYPE = 1;   

export const COLORS = ['#3b82f6', '#ef4444', '#a855f7', '#10b981', '#f59e0b'];

export const getInitPlayers = (playerName: string = "You") => {
  return [
    { id: 'p1', name: playerName, type: 'human' as const, pos: { x: 50, y: 88 }, target: { x: 50, y: 88 }, score: 0, isCarrying: false, color: COLORS[0], homePos: { x: 50, y: 88 }, activePowers: [] },
    { id: 'p2', name: 'Bot Alpha', type: 'bot' as const, pos: { x: 17, y: 31 }, target: { x: 17, y: 31 }, score: 0, isCarrying: false, color: COLORS[1], homePos: { x: 17, y: 31 }, activePowers: [] },
    { id: 'p3', name: 'Bot Sigma', type: 'bot' as const, pos: { x: 83, y: 31 }, target: { x: 83, y: 31 }, score: 0, isCarrying: false, color: COLORS[2], homePos: { x: 83, y: 31 }, activePowers: [] },
  ];
};
