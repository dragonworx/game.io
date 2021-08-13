import { InitGameState, GameStatus } from '../core';
import { Player } from './player';

export class Game {
  players: Player[] = [];
  status: GameStatus = 'pre';

  constructor() {}

  addPlayer(player: Player) {
    this.players.push(player);
  }

  getInitGameState(): InitGameState {
    return {
      status: this.status,
      players: this.players.map(player => player.info),
    };
  }

  removePlayer(clientId: string) {
    const { players } = this;
    const index = players.findIndex(player => player.client.id === clientId);
    players.splice(index, 1);
  }

  getPlayer(clientId: string) {
    return this.players.find(player => player.client.id === clientId)!;
  }

  init() {}

  start() {}
}
