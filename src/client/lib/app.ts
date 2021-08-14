import { ClientIO, Ping, startPing, endPing } from './io';
import { Graphics } from './graphics';
import {
  Protocol,
  Message,
  ServerEvents,
  ClientEvents,
} from '../../common/messaging';
import { PlayerNameInput } from './components/playerNameInput';
import { ClientGame } from './game';
import {
  GameStatus,
  GridDivisions,
  GridMargin,
  GridSize,
  GameState,
  PingIntervalMs,
  PlayerInfo,
  PlayerPositionInfo,
} from '../../common';

const excludeLogUDPMessages: string[] = [
  ServerEvents.UDPPong,
  ServerEvents.UDPUpdate,
];

const excludeLogSocketMessages: string[] = [ServerEvents.SocketPong];

export class ClientApp {
  io: ClientIO;
  graphics: Graphics;
  hasConnected: boolean = false;
  udpPing?: Ping;
  socketPing?: Ping;
  game: ClientGame;

  constructor() {
    const io = (this.io = new ClientIO());

    io.on(Protocol.Connected, this.onConnected);
    io.on(Protocol.UDPMessage, this.onUDPMessage);
    io.on(Protocol.SocketMessage, this.onSocketMessage);

    io.on(ServerEvents.UDPInit, this.onUDPInit);
    io.on(ServerEvents.SocketInit, this.onSocketInit);
    io.on(ServerEvents.SocketInitConnection, this.onSocketInitConnection);
    io.on(ServerEvents.UDPPong, this.onUDPPong);
    io.on(ServerEvents.SocketPong, this.onSocketPong);
    io.on(ServerEvents.SocketPlayerJoined, this.onSocketPlayerJoined);
    io.on(
      ServerEvents.SocketPlayerDisconnected,
      this.onSocketPlayerDisconnected,
    );
    io.on(
      ServerEvents.SocketPlayerInitialPositions,
      this.onSocketPlayerInitialPositions,
    );
    io.on(ServerEvents.SocketGameInit, this.onSocketGameInit);
    io.on(ServerEvents.SocketGameStart, this.onSocketGameStart);
    io.on(ServerEvents.SocketRespondGameState, this.onSocketRespondGameState);
    io.on(ServerEvents.UDPUpdate, this.onUDPUpdate);
    io.on(ServerEvents.SocketReload, this.onSocketReload);

    const graphicsSize = GridSize + GridMargin * 2;
    const graphics = (this.graphics = new Graphics(graphicsSize, graphicsSize));

    this.game = new ClientGame(
      io,
      graphics,
      GridSize,
      GridDivisions,
      GridMargin,
    );

    this.initDebug();
  }

  initDebug() {
    const debug = document.querySelector('#debug')!;
    const select = document.querySelector(
      '#debug select',
    )! as HTMLSelectElement;
    const button = debug.querySelector('button')! as HTMLButtonElement;
    button.onclick = () => {
      this.io.messageSocket(ClientEvents.SocketDebug, select.value);
    };
  }

  init() {
    this.graphics.preload().then(() => {
      this.game.initGridView();
      document.querySelector('#main header')!.classList.add('expanded');
      new PlayerNameInput().on('submit', this.onPlayerNameSubmit);
      this.io.messageSocket(ClientEvents.SocketRequestGameState);
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
    if (!excludeLogUDPMessages.includes(eventName)) {
      console.debug('onUDPMessage:', eventName, payload);
    }
  };

  onSocketMessage = <T>(message: Message<T>) => {
    const { eventName, payload } = message;
    if (!excludeLogSocketMessages.includes(eventName)) {
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

  onSocketInitConnection = (gameStatus: GameStatus) => {
    const { game } = this;
    game.status = gameStatus;
  };

  onPlayerNameSubmit = (playerName: string) => {
    document.querySelector('#playerName')!.classList.add('ready');
    const header = document.querySelector('#main header')!;
    header.classList.remove('expanded');
    header.classList.add('collapsed');
    this.io.messageSocket(ClientEvents.SocketPlayerJoin, playerName);
  };

  onSocketPlayerJoined = (info: PlayerInfo) => {
    this.game.joinPlayer(info);
  };

  onSocketPlayerDisconnected = (clientId: string) => {
    this.game.removePlayer(clientId);
  };

  onSocketPlayerInitialPositions = (
    playerPositionInfo: PlayerPositionInfo[],
  ) => {
    this.game.updatePlayerInitialPositions(playerPositionInfo);
  };

  onSocketGameInit = () => {
    this.game.init();
  };

  onSocketGameStart = () => {
    this.game.start();
  };

  onSocketRespondGameState = (gameState: GameState) => {
    gameState.p.forEach(info => {
      const player = this.game.newPlayer(info);
      player.setInitialPosition(info);
    });
  };

  onUDPUpdate = (gameState: GameState) => {
    this.game.updateFromState(gameState);
  };

  onSocketReload = () => {
    window.location.reload();
  };
}
