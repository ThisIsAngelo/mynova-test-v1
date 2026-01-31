export const MAX_LEVEL = 100;

// Rumus XP Curve: Base XP * (Level ^ Multiplier)
// Semakin tinggi level, semakin banyak XP yang dibutuhkan.
export const calculateExpForNextLevel = (level: number) => {
  if (level >= MAX_LEVEL) return Infinity; // Mentok
  
  // Contoh Scaling:
  // Lvl 1 -> 2: 100 XP
  // Lvl 2 -> 3: 246 XP
  // Lvl 10 -> 11: 1,995 XP
  const base = 100;
  const multiplier = 1.3; 
  
  return Math.floor(base * Math.pow(level, multiplier));
};

export const calculateCoinReward = (levelReached: number) => {
  const BASE_REWARD = 50; 
  const EXPONENT = 1.25; 
  
  // Rumus: 50 * (Level ^ 1.25)
  return Math.floor(BASE_REWARD * Math.pow(levelReached, EXPONENT));
};

export const XP_RATES = {
  TODO_COMPLETION: 20,
  GOAL_COMPLETION: 120,
  POMODORO_SESSION: 15,

  ACHIEVEMENT_BRONZE: 50,
  ACHIEVEMENT_SILVER: 100,
  ACHIEVEMENT_GOLD: 200,
};
