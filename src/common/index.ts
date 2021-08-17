import { Cell } from './grid';

export const GridSize = 750;
export const GridDivisions = 51; // odd numbers work best for initial distribution of players
export const GridMargin = 5;
export const PingIntervalMs = 1000;
export const InitialFPS = 5;
export const MAXFPS = 20;
export const FPSScalar = 1.005;
export const CollisionDamage = 3;
export const BreakCellPoints = 1;
export const DialogFontSizeTitle = 26;
export const DialogFontSizeBody = 14;
export const DialogFontSettings = {
  fontFamily: 'Orbitron',
  fill: '#ffffff',
  stroke: '#000000',
  dropShadow: true,
  dropShadowColor: '#000000',
  dropShadowBlur: 4,
  dropShadowAngle: Math.PI / 6,
  dropShadowDistance: 6,
};

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

export const gameStatusToString = (status: GameStatus) =>
  ['Unconnected', 'Pre-Game', 'Running', 'Over'][status];

export enum Action {
  Left = 0,
  Right = 1,
  Up = 2,
  Down = 3,
  Fire = 4,
}

export const CodeToAction: { [k: string]: Action } = {
  ArrowLeft: Action.Left,
  ArrowRight: Action.Right,
  ArrowUp: Action.Up,
  ArrowDown: Action.Down,
  Space: Action.Fire,
};

export enum Direction {
  Stationary = 0,
  Left = 1,
  Right = 2,
  Up = 3,
  Down = 4,
}

export const directionToString = (direction: Direction) =>
  ['Stationary', 'Left', 'Right', 'Up', 'Down'][direction];

export const isVertical = (direction: Direction) =>
  direction === Direction.Up || direction === Direction.Down;

export const isHorizontal = (direction: Direction) =>
  direction === Direction.Left || direction === Direction.Right;

export interface GameState {
  s: GameStatus;
  f: number;
  p: PlayerUpdateInfo[];
}

export interface PlayerUpdateInfo extends PlayerInfo {
  h: number;
  v: number;
  d: Direction;
  ld: Direction;
  s: number;
  hl: number;
}
