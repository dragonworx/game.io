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
  PlayerUpdateInfo,
  Direction,
  gameStatusToString,
} from '../common';
import { Grid } from '../common/grid';
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
  timeout?: NodeJS.Timeout;

  constructor(io: ServerIO) {
    this.io = io;
    this.grid = new Grid(GridSize, GridDivisions, GridMargin);
    this.scheduleNextFrame();
  }

  scheduleNextFrame() {
    this.timeout = setTimeout(this.update, Math.round(1000 / this.fps));
  }

  increaseSpeed() {
    this.fps = Math.min(this.fps * FPSScalar, MAXFPS);
  }

  reset() {
    this.stop();
    this.paused = false;
    this.status = GameStatus.Pre;
    this.fps = InitialFPS;
    this.players = [];
    this.grid.init();
    this.scheduleNextFrame();
  }

  inspect() {
    const info: any = this.getGameState();
    info.s = gameStatusToString(info.s);
    logger
      .color('white')
      .bgColor('blue')
      .log(`gameState[${this.players.length}]: ${stringify(info, true)}`);
  }

  onPlayerDead() {
    const { players, io } = this;
    const alivePlayers = players.filter(player => player.proxy.health > 0);
    if (alivePlayers.length === 0) {
      const playerRank = players.map(player => player.updateInfo);
      playerRank.sort((a: PlayerUpdateInfo, b: PlayerUpdateInfo) => {
        if (a.s > b.s) {
          return -1;
        } else if (a.s < b.s) {
          return 1;
        }
        return 0;
      });
      this.status = GameStatus.Over;
      this.stop();
      io.broadcastSocket(ServerSocketEvents.SocketGameOver, playerRank);
      this.reset();
    }
  }

  newPlayer(client: Client, playerName: string) {
    const { io, players, grid } = this;
    const player = new ServerPlayer(grid, client, playerName);
    player.proxy.on('dead', () => this.onPlayerDead());
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
        setTimeout(() => this.start(), 4000);
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
      player.proxy.setCell(grid.getCell(h, 1)!, Direction.Down);
    });
    left.forEach((player, i) => {
      const v = leftInc * (i + 1) + leftOffset;
      player.proxy.setCell(grid.getCell(1, v)!, Direction.Right);
    });
    bottom.forEach((player, i) => {
      const h = bottomInc * (i + 1) + bottomOffset;
      player.proxy.setCell(grid.getCell(h, divisions)!, Direction.Up);
    });
    right.forEach((player, i) => {
      const v = rightInc * (i + 1) + rightOffset;
      player.proxy.setCell(grid.getCell(divisions, v)!, Direction.Left);
    });
  }

  getGameState(): GameState {
    return {
      s: this.status,
      p: this.getPlayerPositionInfo(),
      f: this.fps,
    };
  }

  getPlayerPositionInfo(): PlayerUpdateInfo[] {
    return this.players.map(player => player.updateInfo);
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
    }
  }

  getPlayer(clientId: string) {
    return this.players.find(player => player.client.id === clientId)!;
  }

  init() {
    const { io } = this;
    this.paused = false;
    this.fps = InitialFPS;
    this.grid.init();
    this.players.forEach(player => player.gameInit());
    io.broadcastSocket(ServerSocketEvents.SocketGameInit);
  }

  start() {
    const { players, io } = this;
    console.log('START!');
    this.status = GameStatus.Running;
    players.forEach(player => player.gameStart());
    io.broadcastSocket(ServerSocketEvents.SocketGameStart);
  }

  stop() {
    console.log('STOP');
    const { io } = this;
    this.timeout && clearTimeout(this.timeout);
    this.status = GameStatus.Over;
    io.broadcastSocket(ServerSocketEvents.SocketGameStop);
  }

  debugGameOver() {
    this.players.forEach(player => {
      player.proxy.score = Math.round(Math.random() * 100);
      player.proxy.health = 0;
      player.proxy.emit('dead');
    });
  }

  update = () => {
    this.scheduleNextFrame();
    if (this.status !== GameStatus.Running || this.paused) {
      return;
    }
    this.players.forEach(player => player.update());
    this.io.broadcastUDP(ServerUDPEvents.UDPRemoteUpdate, this.getGameState());
    this.increaseSpeed();
  };

  toggle = () => {
    this.paused = !this.paused;
  };
}
