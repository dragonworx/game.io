import { IO, Ping, startPing, endPing } from './io';
import { Graphics } from './graphics';
import { Grid } from '../../core/grid';
import { GridView } from './gridView';
import { Protocol, Message, Events } from '../../core/message';

export const GridDivisions = 10;
export const GridSize = 500;
export const GridMargin = 20;
export const PingIntervalMs = 5000;

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
    console.log('onConnected:', this.io.clientId);
  };

  onUPDMessage = <T>(message: Message<T>) => {
    const { type, payload } = message;
    console.log('onUPDMessage:', type, payload);
  };

  onSocketMessage = <T>(message: Message<T>) => {
    const { type, payload } = message;
    console.log('onSocketMessage:', type, payload);
  };

  onUPDInit = () => {
    console.log('onUPDInit:');
    this.startUPDPing();
  };

  startUPDPing() {
    this.updPing = startPing();
    this.io.messageUPD(Events.UPDPing);
  }

  onSocketInit = () => {
    console.log('onSocketInit:');
    this.startSocketPing();
  };

  startSocketPing() {
    this.socketPing = startPing();
    this.io.messageSocket(Events.SocketPing);
  }

  onUPDPong = () => {
    endPing(this.updPing!);
    console.log('onUPDPong:', this.updPing!.elapsed);
    document.getElementById('latency')!.innerText = `upd: ${
      this.updPing!.elapsed
    } socket: ${this.socketPing!.elapsed}`;
    setTimeout(() => this.startUPDPing(), PingIntervalMs);
  };

  onSocketPong = () => {
    endPing(this.socketPing!);
    console.log('onSocketPong:', this.socketPing!.elapsed);
    document.getElementById('latency')!.innerText = `upd: ${
      this.updPing!.elapsed
    } socket: ${this.socketPing!.elapsed}`;
    setTimeout(() => this.startSocketPing(), PingIntervalMs);
  };
}
