export interface PlayerInfo {
  clientId: string;
  name: string;
}

export type GameStatus = 'unconnected' | 'pre' | 'running' | 'over';

export interface InitGameState {
  status: GameStatus;
  players: PlayerInfo[];
}
