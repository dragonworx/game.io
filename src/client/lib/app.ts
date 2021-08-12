import { IO, Ping, startPing, endPing } from './io';
import { Graphics } from './graphics';
import { Grid } from '../../core/grid';
import { GridView } from './gridView';
import { Protocol, Message, Events } from '../../core/message';
import { PlayerNameInput } from './playerNameInput';

export const GridDivisions = 10;
export const GridSize = 500;
export const GridMargin = 20;
export const PingIntervalMs = 1000;

export class App {
  io: IO;
  grid: Grid;
  graphics: Graphics;
  gridView: GridView;
  udpPing?: Ping;
  socketPing?: Ping;

  constructor() {
    const io = (this.io = new IO());

    io.on(Protocol.Connected, this.onConnected);
    io.on(Protocol.UDPMessage, this.onUDPMessage);
    io.on(Protocol.SocketMessage, this.onSocketMessage);

    io.on(Events.UDPInit, this.onUDPInit);
    io.on(Events.SocketInit, this.onSocketInit);
    io.on(Events.UDPPong, this.onUDPPong);
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

    new PlayerNameInput().on('submit', this.onPlayerNameSubmit);
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
    this.io.messageUDP(Events.UDPPing);
  }

  onSocketInit = () => {
    console.debug('onSocketInit:');
    this.startSocketPing();
  };

  startSocketPing() {
    this.socketPing = startPing();
    this.io.messageSocket(Events.SocketPing);
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

  onPlayerNameSubmit = (value: string) => {
    alert(value);
  };
}
