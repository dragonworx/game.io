export interface PlayerInfo {
  clientId: string;
  name: string;
}

export type GameStatus = 'unconnected' | 'pre' | 'running' | 'over';

export interface InitGameState {
  status: GameStatus;
  players: PlayerPositionInfo[];
}

export interface PlayerPositionInfo extends PlayerInfo {
  h: number;
  v: number;
  vectorX: number;
  vectorY: number;
}

export const GridDivisions = 20; // odd numbers work best for initial distribution of players
export const GridSize = 750;
export const GridMargin = 20;
export const PingIntervalMs = 1000;
export const FPS = 60;
