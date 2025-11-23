export type Hand = 'rock' | 'paper' | 'scissors';
export type Result = 'win' | 'lose' | 'draw';

export interface GameRecord {
  timestamp: string;
  playerHand: Hand;
  computerHand: Hand;
  result: Result;
}

export interface Statistics {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}
