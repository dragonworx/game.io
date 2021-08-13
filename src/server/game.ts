import { logger, stringify } from './log';
import {
  GameState,
  GameStatus,
  GridSize,
  GridDivisions,
  GridMargin,
  FPS,
  PlayerPositionInfo,
} from '../common';
import { Grid } from '../common/grid';
import { ServerEvents } from '../common/messaging';
import { Client } from './client';
import { IO } from './io';
import { Player } from './player';

export class Game {
  io: IO;
  players: Player[] = [];
  status: GameStatus = GameStatus.Pre;
  grid: Grid;
  fpsInterval: number;
  timer?: number;

  constructor(io: IO) {
    this.io = io;
    this.grid = new Grid(GridSize, GridDivisions, GridMargin);
    this.fpsInterval = Math.round(1000 / FPS);
  }

  reset() {
    this.status = GameStatus.Pre;
    this.players = [];
    clearInterval(this.timer);
    delete this.timer;
  }

  logGameState() {
    logger.color('white').bgColor('blue').log(stringify(this.getGameState()));
  }

  newPlayer(client: Client, playerName: string) {
    const { io, players } = this;
    const player = new Player(client, playerName);
    this.players.push(player);
    io.broadcastSocket(ServerEvents.SocketPlayerJoined, player.info);

    const playerPositionInfo = this.distributePlayers();
    io.broadcastSocket(
      ServerEvents.SocketPlayerInitialPositions,
      playerPositionInfo,
    );

    const allPlayersJoined = io.clients.size === players.length;
    if (allPlayersJoined) {
      setTimeout(() => {
        this.init();
        setTimeout(() => this.start(), 0); //4000
      }, 2000);
    }
  }

  distributePlayers() {
    const { players, grid } = this;
    const { divisions } = grid;
    const top: Player[] = [];
    const left: Player[] = [];
    const bottom: Player[] = [];
    const right: Player[] = [];
    const edges: Player[][] = [top, left, bottom, right];
    let index = 0;
    players.forEach(player => {
      const edge = edges[index];
      edge.push(player);
      index = (index + 1) % 4;
    });
    const topInc = Math.round(divisions / (top.length + 1));
    const leftInc = Math.round(divisions / (left.length + 1));
    const bottomInc = Math.round(divisions / (bottom.length + 1));
    const rightInc = Math.round(divisions / (right.length + 1));
    const topOffset = top.length === 4 ? 1 : 0;
    const leftOffset = left.length === 5 ? 1 : 0;
    const bottomOffset = bottom.length === 4 ? 1 : 0;
    const rightOffset = right.length === 5 ? 1 : 0;
    top.forEach((player, i) => {
      const h = topInc * (i + 1) + topOffset;
      player.setInitialCell(grid.getCell(h, 1), [0, 1]);
    });
    left.forEach((player, i) => {
      const v = leftInc * (i + 1) + leftOffset;
      player.setInitialCell(grid.getCell(1, v), [1, 0]);
    });
    bottom.forEach((player, i) => {
      const h = bottomInc * (i + 1) + bottomOffset;
      player.setInitialCell(grid.getCell(h, divisions), [-1, 0]);
    });
    right.forEach((player, i) => {
      const v = rightInc * (i + 1) + rightOffset;
      player.setInitialCell(grid.getCell(divisions, v), [-1, 0]);
    });
    return this.getPlayerPositionInfo();
  }

  getPlayerPositionInfo(): PlayerPositionInfo[] {
    return this.players.map(player => ({
      ...player.info,
      h: player.cell!.h,
      v: player.cell!.v,
      vx: player.vector[0],
      vy: player.vector[1],
      o: player.offset,
    }));
  }

  getGameState(): GameState {
    return {
      s: this.status,
      p: this.getPlayerPositionInfo(),
    };
  }

  removePlayer(clientId: string) {
    const { players } = this;
    const index = players.findIndex(player => player.client.id === clientId);
    if (index > -1) {
      const player = players[index];
      logger
        .color('white')
        .bgColor('red')
        .log(
          `Remove ${clientId} "${player.name}" playerCount: ${players.length}`,
        );
      players.splice(index, 1);
      this.logGameState();
    }
  }

  getPlayer(clientId: string) {
    return this.players.find(player => player.client.id === clientId)!;
  }

  init() {
    const { io } = this;
    this.players.forEach(player => player.gameInit());
    io.broadcastSocket(ServerEvents.SocketGameInit);
  }

  start() {
    const { players, io } = this;
    this.status = GameStatus.Running;
    players.forEach(player => player.gameStart());
    io.broadcastSocket(ServerEvents.SocketGameStart);
    this.timer = setInterval(this.tick, this.fpsInterval);
  }

  tick = (_time: number) => {
    const { players, io } = this;
    players.forEach(player => player.update());
    io.broadcastUDP(ServerEvents.UDPUpdate, this.getGameState());
  };
}
