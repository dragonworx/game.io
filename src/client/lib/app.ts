import { IO, Ping, startPing, endPing } from './io';
import { Graphics } from './graphics';
import { Grid } from '../../core/grid';
import { GridView } from './gridView';
import { Protocol, Message, Events } from '../../core/message';

export const GridDivisions = 10;
export const GridSize = 500;
export const GridMargin = 20;
export const PingIntervalMs = 3000;

export class App {
  io: IO;
  grid: Grid;
  graphics: Graphics;
  gridView: GridView;
  updPing?: Ping;
  socketPing?: Ping;

  constructor() {
    const io = (this.io = new IO());

    io.on(Protocol.Connected, this.onConnected);
    io.on(Protocol.UPDMessage, this.onUPDMessage);
    io.on(Protocol.SocketMessage, this.onSocketMessage);

    io.on(Events.UPDInit, this.onUPDInit);
    io.on(Events.SocketInit, this.onSocketInit);
    io.on(Events.UPDPong, this.onUPDPong);
    io.on(Events.SocketPong, this.onSocketPong);

    const grid = (this.grid = new Grid(
      GridSize,
      GridSize,
      GridDivisions,
      GridDivisions,
    ));

    const graphicsSize = GridSize + GridMargin * 2;
    const graphics = (this.graphics = new Graphics(graphicsSize, graphicsSize));

    this.gridView = new GridView(grid, graphics, GridMargin);
  }

  onConnected = () => {
    console.debug('onConnected:', this.io.clientId);
  };

  onUPDMessage = <T>(message: Message<T>) => {
    const { type, payload } = message;
    console.debug('onUPDMessage:', type, payload);
  };

  onSocketMessage = <T>(message: Message<T>) => {
    const { type, payload } = message;
    console.debug('onSocketMessage:', type, payload);
  };

  onUPDInit = () => {
    console.debug('onUPDInit:');
    this.startUPDPing();
  };

  startUPDPing() {
    this.updPing = startPing();
    this.io.messageUPD(Events.UPDPing);
  }

  onSocketInit = () => {
    console.debug('onSocketInit:');
    this.startSocketPing();
  };

  startSocketPing() {
    this.socketPing = startPing();
    this.io.messageSocket(Events.SocketPing);
  }

  onUPDPong = () => {
    endPing(this.updPing!);
    console.debug('onUPDPong:', this.updPing!.elapsed);
    document.getElementById('latency-upd')!.innerText = `upd: ${
      this.updPing!.elapsed
    }`;
    setTimeout(() => this.startUPDPing(), PingIntervalMs);
  };

  onSocketPong = () => {
    endPing(this.socketPing!);
    console.debug('onSocketPong:', this.socketPing!.elapsed);
    document.getElementById('latency-socket')!.innerText = `socket: ${
      this.socketPing!.elapsed
    }`;
    setTimeout(() => this.startSocketPing(), PingIntervalMs);
  };
}
