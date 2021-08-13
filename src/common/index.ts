export interface PlayerInfo {
  clientId: string;
  name: string;
}

export type GameStatus = 'unconnected' | 'pre' | 'running' | 'over';

export interface InitGameState {
  status: GameStatus;
  players: PlayerInfo[];
}

export const GridDivisions = 20; // odd numbers work best for initial distribution of players
export const GridSize = 750;
export const GridMargin = 20;
export const PingIntervalMs = 10000;
export const FPS = 60;
