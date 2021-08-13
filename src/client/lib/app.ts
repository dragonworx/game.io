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
  GridDivisions,
  GridMargin,
  GridSize,
  InitGameState,
  PingIntervalMs,
  PlayerInfo,
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
    io.on(ServerEvents.GameInit, this.onGameInit);
    io.on(ServerEvents.GameStart, this.onGameStart);

    const graphicsSize = GridSize + GridMargin * 2;
    const graphics = (this.graphics = new Graphics(graphicsSize, graphicsSize));

    this.game = new Game(io, graphics, GridSize, GridDivisions, GridMargin);
  }

  init() {
    this.graphics.preload().then(() => {
      this.game.initGridView();
      document.querySelector('#main header')!.classList.add('expanded');
      new PlayerNameInput().on('submit', this.onPlayerNameSubmit);
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
  };

  onUDPMessage = <T>(message: Message<T>) => {
    const { type, payload } = message;
    console.debug('onUDPMessage:', type, payload);
  };

  onSocketMessage = <T>(message: Message<T>) => {
    const { type, payload } = message;
    console.debug('onSocketMessage:', type, payload);
  };

  onUDPInit = () => {
    console.debug('onUDPInit:');
    this.startUDPPing();
  };

  startUDPPing() {
    this.udpPing = startPing();
    // this.io.messageUDP(ClientEvents.UDPPing);
  }

  onSocketInit = () => {
    console.debug('onSocketInit:');
    this.startSocketPing();
  };

  startSocketPing() {
    this.socketPing = startPing();
    // this.io.messageSocket(ClientEvents.SocketPing);
  }

  onUDPPong = () => {
    endPing(this.udpPing!);
    console.debug('onUDPPong:', this.udpPing!.elapsed);
    document.getElementById('latency-udp')!.innerText = String(
      this.udpPing!.elapsed,
    );
    setTimeout(() => this.startUDPPing(), PingIntervalMs);
  };

  onSocketPong = () => {
    endPing(this.socketPing!);
    console.debug('onSocketPong:', this.socketPing!.elapsed);
    document.getElementById('latency-socket')!.innerText = String(
      this.socketPing!.elapsed,
    );
    setTimeout(() => this.startSocketPing(), PingIntervalMs);
  };

  onInitConnection = (gameState: InitGameState) => {
    const { game } = this;
    game.status = gameState.status;
    gameState.players.forEach(player => game.newPlayer(player));
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

  onGameInit = () => {
    this.game.init();
  };

  onGameStart = () => {
    this.game.start();
  };
}
