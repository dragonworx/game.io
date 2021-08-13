import {
  InitGameState,
  GameStatus,
  GridSize,
  GridDivisions,
  GridMargin,
  FPS,
} from '../common';
import { Grid } from '../common/grid';
import { ServerEvents } from '../common/messaging';
import { Client } from './client';
import { IO } from './io';
import { Player } from './player';

export class Game {
  io: IO;
  players: Player[] = [];
  status: GameStatus = 'pre';
  grid: Grid;

  constructor(io: IO) {
    this.io = io;
    this.grid = new Grid(GridSize, GridDivisions, GridMargin);
  }

  clear() {
    this.players = [];
    this.status = 'pre';
  }

  newPlayer(client: Client, playerName: string) {
    const { io, players } = this;
    const player = new Player(client, playerName);
    this.players.push(player);
    io.broadcastSocket(ServerEvents.PlayerJoined, player.info);

    const allPlayersJoined = io.clients.size === players.length;
    if (allPlayersJoined) {
      setTimeout(() => {
        io.broadcastSocket(ServerEvents.GameInit);
        this.init();
        setTimeout(() => {
          io.broadcastSocket(ServerEvents.GameStart);
          this.start();
        }, 0); //4000
      }, 2000);
    }
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

  init() {
    this.players.forEach(player => player.gameInit());
  }

  start() {
    this.players.forEach(player => player.gameStart());
  }
}
