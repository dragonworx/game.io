export const GridDivisions = 20; // odd numbers work best for initial distribution of players
export const GridSize = 750;
export const GridMargin = 20;
export const PingIntervalMs = 1000;
export const FPS = 60;
export const InitialPlayerSpeed = 1;

export interface PlayerInfo {
  cid: string;
  n: string;
}

export enum GameStatus {
  Unconnected = 0,
  Pre = 1,
  Running = 2,
  Over = 3,
}

export interface GameState {
  s: GameStatus;
  p: PlayerPositionInfo[];
}

export interface PlayerPositionInfo extends PlayerInfo {
  h: number;
  v: number;
  vx: number;
  vy: number;
  o: number;
}
