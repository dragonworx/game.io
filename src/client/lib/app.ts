import { IO, Ping, startPing, endPing } from './io';
import { Graphics, PIXI } from './graphics';
import { Grid } from '../../core/grid';
import { GridView } from './gridView';
import {
  Protocol,
  Message,
  ServerEvents,
  ClientEvents,
} from '../../core/message';
import { PlayerNameInput } from './components/playerNameInput';
import { PlayerJoinedNotice } from './components/playerJoinedNotice';
import { Game } from './game';
import { Player } from './player';

export const GridDivisions = 10;
export const GridSize = 500;
export const GridMargin = 20;
export const PingIntervalMs = 10000;

export class App {
  io: IO;
  grid: Grid;
  graphics: Graphics;
  gridView: GridView;
  udpPing?: Ping;
  socketPing?: Ping;
  game: Game;

  constructor() {
    const io = (this.io = new IO());

    this.game = new Game();

    io.on(Protocol.Connected, this.onConnected);
    io.on(Protocol.UDPMessage, this.onUDPMessage);
    io.on(Protocol.SocketMessage, this.onSocketMessage);

    io.on(ServerEvents.UDPInit, this.onUDPInit);
    io.on(ServerEvents.SocketInit, this.onSocketInit);
    io.on(ServerEvents.UDPPong, this.onUDPPong);
    io.on(ServerEvents.SocketPong, this.onSocketPong);
    io.on(ServerEvents.PlayerJoined, this.onPlayerJoined);

    const grid = (this.grid = new Grid(
      GridSize,
      GridSize,
      GridDivisions,
      GridDivisions,
    ));

    const graphicsSize = GridSize + GridMargin * 2;
    const graphics = (this.graphics = new Graphics(graphicsSize, graphicsSize));

    this.gridView = new GridView(grid, graphics, GridMargin);

    new PlayerNameInput().onDone(this.onPlayerNameSubmit);
  }

  onConnected = () => {
    console.debug('onConnected:', this.io.clientId);
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

  onPlayerNameSubmit = (playerName: string) => {
    this.io.messageSocket(ClientEvents.PlayerJoin, playerName);
  };

  onPlayerJoined = (info: { clientId: string; name: string }) => {
    const { game, graphics } = this;
    new PlayerJoinedNotice([this.graphics, info.name]).onDone(
      (text: PIXI.Text) => {
        const player = new Player(info.clientId);
        game.addPlayer(player);
        const [x, y] = player.initialPosition;
        graphics
          .ease(text, { x, y, width: 0, height: 0 }, 1000, 'easeOutBack', 1000)
          .on('complete', () => {
            graphics.removeObject(text);
          });
      },
    );
  };
}
