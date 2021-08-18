import { ClientIO, Ping, startPing, endPing } from './io';
import { Graphics, PIXI } from './graphics';
import {
  Protocol,
  Message,
  ServerSocketEvents,
  ClientSocketEvents,
  ServerUDPEvents,
  ClientUDPEvents,
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
  PlayerJoinedInfo,
  InitialGameState,
} from '../../common';
import { AudioPlayer } from './audio';

const excludeLogUDPMessages: string[] = [
  ServerUDPEvents.UDPPong,
  ServerUDPEvents.UDPRemoteUpdate,
];

const excludeLogSocketMessages: string[] = [ServerSocketEvents.SocketPong];

export class ClientApp {
  io: ClientIO;
  graphics: Graphics;
  hasConnected: boolean = false;
  hasInit: boolean = false;
  udpPing?: Ping;
  socketPing?: Ping;
  game: ClientGame;
  enableLatencyCheck: boolean = true;
  audio: AudioPlayer;

  constructor() {
    const io = (this.io = new ClientIO());

    // protocol
    io.on(Protocol.Connected, this.onConnected);
    io.on(Protocol.UDPMessage, this.onUDPMessage);
    io.on(Protocol.SocketMessage, this.onSocketMessage);

    // udp
    io.on(ServerUDPEvents.UDPInit, this.onUDPInit);
    io.on(ServerUDPEvents.UDPPong, this.onUDPPong);
    io.on(ServerUDPEvents.UDPRemoteUpdate, this.onUDPRemoteUpdate);

    // socket
    io.on(ServerSocketEvents.SocketInit, this.onSocketInit);
    io.on(ServerSocketEvents.SocketInitConnection, this.onSocketInitConnection);
    io.on(ServerSocketEvents.SocketPong, this.onSocketPong);
    io.on(ServerSocketEvents.SocketPlayerJoined, this.onSocketPlayerJoined);
    io.on(
      ServerSocketEvents.SocketPlayerDisconnected,
      this.onSocketPlayerDisconnected,
    );
    io.on(
      ServerSocketEvents.SocketPlayerInitialPositions,
      this.onSocketPlayerInitialPositions,
    );
    io.on(ServerSocketEvents.SocketGameInit, this.onSocketGameInit);
    io.on(ServerSocketEvents.SocketGameStart, this.onSocketGameStart);
    io.on(ServerSocketEvents.SocketGameStop, this.onSocketGameStop);
    io.on(
      ServerSocketEvents.SocketRespondGameState,
      this.onSocketRespondGameState,
    );
    io.on(ServerSocketEvents.SocketReload, this.onSocketReload);
    io.on(ServerSocketEvents.SocketGameOver, this.onSocketGameOver);

    const cellSize = Math.round(GridSize / GridDivisions);
    const graphicsSize = cellSize * GridDivisions + GridMargin * 2;
    const graphics = (this.graphics = new Graphics(graphicsSize, graphicsSize));

    const audio = (this.audio = new AudioPlayer());

    this.game = new ClientGame(
      io,
      graphics,
      audio,
      GridSize,
      GridDivisions,
      GridMargin,
    );

    this.initDebug();
    this.initLatencySwitch();
  }

  initDebug() {
    const debug = document.querySelector('#debug')!;
    let isAdmin = false;
    try {
      isAdmin = !!window.localStorage.getItem('game_admin');
    } catch (e) {}
    if (!isAdmin) {
      debug.parentElement?.removeChild(debug);
      return;
    }
    debug.classList.add('visible');
    const select = document.querySelector(
      '#debug select',
    )! as HTMLSelectElement;
    const button = debug.querySelector('button')! as HTMLButtonElement;
    button.onclick = () => {
      this.io.messageSocket(ClientSocketEvents.SocketDebug, select.value);
    };
  }

  initLatencySwitch() {
    const latency = document.querySelector('#latency')! as HTMLInputElement;
    latency.onchange = () => {
      const isEnabled = (this.enableLatencyCheck = !!latency.checked);
      if (isEnabled) {
        this.startSocketPing();
        this.startUDPPing();
      }
    };
  }

  init() {
    this.graphics.preload().then(() => {
      this.game.preInit();
      document.querySelector('#playerName')!.classList.add('expanded');
      new PlayerNameInput(this.audio).on('submit', this.onPlayerNameSubmit);
      this.io.messageSocket(ClientSocketEvents.SocketRequestGameState);
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

  onUDPMessage = (message: Message) => {
    const { eventName, payload } = message;
    if (!excludeLogUDPMessages.includes(eventName)) {
      console.debug('onUDPMessage:', eventName, payload);
    }
  };

  onSocketMessage = (message: Message) => {
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
    this.io.messageUDP(ClientUDPEvents.UDPPing);
  }

  onSocketInit = () => {
    console.debug('onSocketInit:');
    this.startSocketPing();
  };

  startSocketPing() {
    this.socketPing = startPing();
    this.io.messageSocket(ClientSocketEvents.SocketPing);
  }

  onUDPPong = () => {
    endPing(this.udpPing!);
    document.querySelector('#latency-udp span')!.innerHTML = String(
      this.udpPing!.elapsed,
    );
    if (this.enableLatencyCheck) {
      setTimeout(() => this.startUDPPing(), PingIntervalMs);
    }
  };

  onSocketPong = () => {
    endPing(this.socketPing!);
    document.querySelector('#latency-socket span')!.innerHTML = String(
      this.socketPing!.elapsed,
    );
    if (this.enableLatencyCheck) {
      setTimeout(() => this.startSocketPing(), PingIntervalMs);
    }
  };

  onSocketInitConnection = (status: GameStatus) => {
    this.game.updateGameStatus(status);
  };

  onPlayerNameSubmit = (name: string) => {
    this.game.hidePlayerNameInput();
    const r = Math.random();
    const g = Math.random();
    const b = Math.random();
    const tint = PIXI.utils.rgb2hex([r, g, b]);
    this.io.messageSocket(ClientSocketEvents.SocketPlayerJoin, { name, tint });
  };

  onSocketPlayerJoined = (info: PlayerJoinedInfo) => {
    this.game.joinPlayer(info);
  };

  onSocketPlayerDisconnected = (clientId: string) => {
    this.game.removePlayer(clientId);
  };

  onSocketPlayerInitialPositions = (info: PlayerPositionInfo[]) => {
    this.game.updatePlayerInitialPositions(info);
  };

  onSocketGameInit = () => {
    this.game.init();
  };

  onSocketGameStart = () => {
    this.game.start();
  };

  onSocketGameStop = () => {
    this.game.stop();
  };

  onSocketRespondGameState = (gameState: InitialGameState) => {
    this.game.updateGameStatus(gameState.s);
    gameState.p.forEach(playerJoinedInfo => {
      const { cid, n, h, v, d, ld, s, hl, tint } = playerJoinedInfo;
      const info: PlayerInfo = { cid, n };
      const positionInfo: PlayerPositionInfo = { ...info, h, v, d, ld, s, hl };
      const player = this.game.newPlayer(info, tint);
      player.setInitialPosition(positionInfo);
    });
    this.hasInit = true;
  };

  onUDPRemoteUpdate = (gameState: GameState) => {
    if (this.hasInit) {
      this.game.remoteUpdate(gameState);
    }
  };

  onSocketReload = () => {
    window.location.reload();
  };

  onSocketGameOver = (playerRank: PlayerPositionInfo[]) => {
    this.game.showGameOver(playerRank);
  };
}
