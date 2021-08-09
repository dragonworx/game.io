import { IO, Ping, startPing, endPing } from './io';
import { Graphics } from './graphics';
import { Grid } from '../../core/grid';
import { GridView } from './gridView';
import { Protocol, Message, Events } from '../../core/message';

export const GridDivisions = 10;
export const GridSize = 500;
export const GridMargin = 20;

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
    console.log('Connected ' + this.io.clientId);
  };

  onUPDMessage = <T>(message: Message<T>) => {
    const { type, payload } = message;
    console.log(`upd message "${type}" {${JSON.stringify(payload)}}`);
  };

  onSocketMessage = <T>(message: Message<T>) => {
    const { type, payload } = message;
    console.log(`socket message "${type}" {${JSON.stringify(payload)}}`);
  };

  onUPDInit = () => {
    console.log('upd init');
    this.updPing = startPing();
    this.io.messageUPD(Events.UPDPing);
  };

  onSocketInit = () => {
    console.log('socket init');
    this.socketPing = startPing();
    this.io.messageSocket(Events.SocketPing);
  };

  onUPDPong = () => {
    endPing(this.updPing!);
    console.log('upd pong', this.updPing!.elapsed);
  };

  onSocketPong = () => {
    endPing(this.socketPing!);
    console.log('socket pong', this.socketPing!.elapsed);
  };
}
