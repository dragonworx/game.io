import { Player } from './player';

export class Game {
  players: Player[] = [];

  constructor() {}

  addPlayer(player: Player) {
    this.players.push(player);
  }
}
