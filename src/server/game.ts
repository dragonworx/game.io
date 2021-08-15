import { logger, stringify } from './log';
import {
  GameState,
  GameStatus,
  GridSize,
  GridDivisions,
  GridMargin,
  InitialFPS,
  MAXFPS,
  FPSScalar,
  PlayerPositionInfo,
  Direction,
} from '../common';
import { Cell, Grid } from '../common/grid';
import { ServerSocketEvents, ServerUDPEvents } from '../common/messaging';
import { Client } from './client';
import { ServerIO } from './io';
import { ServerPlayer } from './player';

export class ServerGame {
  io: ServerIO;
  players: ServerPlayer[] = [];
  status: GameStatus = GameStatus.Pre;
  grid: Grid;
  paused: boolean = false;
  fps: number = InitialFPS;

  constructor(io: ServerIO) {
    this.io = io;
    this.grid = new Grid(GridSize, GridDivisions, GridMargin);
    this.scheduleNextFrame();
  }

  scheduleNextFrame() {
    setTimeout(this.update, Math.round(1000 / this.fps));
  }

  increaseSpeed() {
    this.fps = Math.min(this.fps * FPSScalar, MAXFPS);
  }

  reset() {
    this.stop();
    this.paused = false;
    this.status = GameStatus.Pre;
    this.players = [];
    this.io.broadcastSocket(ServerSocketEvents.SocketReload);
  }

  logGameState() {
    logger
      .color('white')
      .bgColor('blue')
      .log(
        `gameState[${this.players.length}]: ${stringify(this.getGameState())}`,
      );
  }

  newPlayer(client: Client, playerName: string) {
    const { io, players, grid } = this;
    const player = new ServerPlayer(grid, client, playerName);
    this.players.push(player);
    io.broadcastSocket(ServerSocketEvents.SocketPlayerJoined, player.info);

    this.distributePlayers();
    const playerPositionInfo = this.getPlayerPositionInfo();
    io.broadcastSocket(
      ServerSocketEvents.SocketPlayerInitialPositions,
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
    const top: ServerPlayer[] = [];
    const left: ServerPlayer[] = [];
    const bottom: ServerPlayer[] = [];
    const right: ServerPlayer[] = [];
    const edges: ServerPlayer[][] = [top, left, bottom, right];
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
      player.proxy.setCell(grid.getCell(h, 1), Direction.Down);
    });
    left.forEach((player, i) => {
      const v = leftInc * (i + 1) + leftOffset;
      player.proxy.setCell(grid.getCell(1, v), Direction.Right);
    });
    bottom.forEach((player, i) => {
      const h = bottomInc * (i + 1) + bottomOffset;
      player.proxy.setCell(grid.getCell(h, divisions), Direction.Up);
    });
    right.forEach((player, i) => {
      const v = rightInc * (i + 1) + rightOffset;
      player.proxy.setCell(grid.getCell(divisions, v), Direction.Left);
    });
  }

  getGameState(): GameState {
    return {
      s: this.status,
      p: this.getPlayerPositionInfo(),
      f: this.fps,
    };
  }

  getPlayerPositionInfo(): PlayerPositionInfo[] {
    return this.players.map(player => player.positionInfo);
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
    io.broadcastSocket(ServerSocketEvents.SocketGameInit);
  }

  start() {
    const { players, io } = this;
    this.paused = false;
    this.status = GameStatus.Running;
    this.fps = InitialFPS;
    players.forEach(player => player.gameStart());
    io.broadcastSocket(ServerSocketEvents.SocketGameStart);
  }

  stop() {
    const { io } = this;
    this.status = GameStatus.Over;
    io.broadcastSocket(ServerSocketEvents.SocketGameStop);
  }

  update = () => {
    this.scheduleNextFrame();
    if (this.status !== GameStatus.Running || this.paused) {
      return;
    }
    this.players.forEach(player => player.update());
    this.io.broadcastUDP(ServerUDPEvents.UDPRemoteUpdate, this.getGameState());
    // this.increaseSpeed();
  };

  toggle = () => {
    this.paused = !this.paused;
  };
}
