import { IO, Ping, startPing, endPing } from './io';
import { Graphics } from './graphics';
import {
  Protocol,
  Message,
  ServerEvents,
  ClientEvents,
} from '../../common/messaging';
import { PlayerNameInput } from './components/playerNameInput';
import { Game } from './game';
import {
  GameStatus,
  GridDivisions,
  GridMargin,
  GridSize,
  InitGameState,
  PingIntervalMs,
  PlayerInfo,
  PlayerPositionInfo,
} from '../../common';

export class App {
  io: IO;
  graphics: Graphics;
  hasConnected: boolean = false;
  udpPing?: Ping;
  socketPing?: Ping;
  game: Game;

  constructor() {
    const io = (this.io = new IO());

    io.on(Protocol.Connected, this.onConnected);
    io.on(Protocol.UDPMessage, this.onUDPMessage);
    io.on(Protocol.SocketMessage, this.onSocketMessage);

    io.on(ServerEvents.UDPInit, this.onUDPInit);
    io.on(ServerEvents.SocketInit, this.onSocketInit);
    io.on(ServerEvents.InitConnection, this.onInitConnection);
    io.on(ServerEvents.UDPPong, this.onUDPPong);
    io.on(ServerEvents.SocketPong, this.onSocketPong);
    io.on(ServerEvents.PlayerJoined, this.onPlayerJoined);
    io.on(ServerEvents.PlayerDisconnected, this.onPlayerDisconnected);
    io.on(ServerEvents.PlayerInitialPositions, this.onPlayerInitialPositions);
    io.on(ServerEvents.GameInit, this.onGameInit);
    io.on(ServerEvents.GameStart, this.onGameStart);
    io.on(ServerEvents.SetGameState, this.onSetGameState);

    const graphicsSize = GridSize + GridMargin * 2;
    const graphics = (this.graphics = new Graphics(graphicsSize, graphicsSize));

    this.game = new Game(io, graphics, GridSize, GridDivisions, GridMargin);

    this.initDebug();
  }

  initDebug() {
    const debug = document.querySelector('#debug')!;
    const select = document.querySelector(
      '#debug select',
    )! as HTMLSelectElement;
    const button = debug.querySelector('button')! as HTMLButtonElement;
    button.onclick = () => {
      this.io.messageSocket(ClientEvents.Debug, select.value);
    };
  }

  init() {
    this.graphics.preload().then(() => {
      this.game.initGridView();
      document.querySelector('#main header')!.classList.add('expanded');
      new PlayerNameInput().on('submit', this.onPlayerNameSubmit);
      this.io.messageSocket(ClientEvents.GetGameState);
    });
  }

  onConnected = () => {
    console.debug('onConnected:', this.io.clientId);
    if (this.hasConnected) {
      window.location.reload();
      return;
    }
    this.init();
    this.hasConnected = true;

    document.querySelector('#clientId span')!.innerHTML = this.io.clientId;
  };

  onUDPMessage = <T>(message: Message<T>) => {
    const { eventName, payload } = message;
    if (eventName !== ServerEvents.UDPPong) {
      console.debug('onUDPMessage:', eventName, payload);
    }
  };

  onSocketMessage = <T>(message: Message<T>) => {
    const { eventName, payload } = message;
    if (eventName !== ServerEvents.SocketPong) {
      console.debug('onSocketMessage:', eventName, payload);
    }
  };

  onUDPInit = () => {
    console.debug('onUDPInit:');
    this.startUDPPing();
  };

  startUDPPing() {
    this.udpPing = startPing();
    this.io.messageUDP(ClientEvents.UDPPing);
  }

  onSocketInit = () => {
    console.debug('onSocketInit:');
    this.startSocketPing();
  };

  startSocketPing() {
    this.socketPing = startPing();
    this.io.messageSocket(ClientEvents.SocketPing);
  }

  onUDPPong = () => {
    endPing(this.udpPing!);
    document.querySelector('#latency-udp span')!.innerHTML = String(
      this.udpPing!.elapsed,
    );
    setTimeout(() => this.startUDPPing(), PingIntervalMs);
  };

  onSocketPong = () => {
    endPing(this.socketPing!);
    document.querySelector('#latency-socket span')!.innerHTML = String(
      this.socketPing!.elapsed,
    );
    setTimeout(() => this.startSocketPing(), PingIntervalMs);
  };

  onInitConnection = (gameStatus: GameStatus) => {
    const { game } = this;
    game.status = gameStatus;
  };

  onPlayerNameSubmit = (playerName: string) => {
    document.querySelector('#playerName')!.classList.add('ready');
    const header = document.querySelector('#main header')!;
    header.classList.remove('expanded');
    header.classList.add('collapsed');
    this.io.messageSocket(ClientEvents.PlayerJoin, playerName);
  };

  onPlayerJoined = (info: PlayerInfo) => {
    this.game.joinPlayer(info);
  };

  onPlayerDisconnected = (clientId: string) => {
    this.game.removePlayer(clientId);
  };

  onPlayerInitialPositions = (playerPositionInfo: PlayerPositionInfo[]) => {
    this.game.updatePlayerInitialPositions(playerPositionInfo);
  };

  onGameInit = () => {
    this.game.init();
  };

  onGameStart = () => {
    this.game.start();
  };

  onSetGameState = (gameState: InitGameState) => {
    gameState.players.forEach(info => {
      const player = this.game.newPlayer(info);
      player.setInitialPosition(info);
    });
  };
}
