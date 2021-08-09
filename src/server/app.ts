import { Client, IO } from './io';
import { info } from './util';
import { Player } from '../core/player';
import { Events } from '../core/message';

export class App {
  io: IO;
  players: Player[] = [];

  constructor() {
    const io = (this.io = new IO());
    io.on(Events.UPDConnect, this.onUPDConnect);
    io.on(Events.SocketConnect, this.onSocketConnect);
    io.on(Events.ClientConnected, this.onClientConnected);
    io.listen();
  }

  onUPDConnect = (id: string) => {
    info('UPDConnect! ' + id);
  };

  onSocketConnect = (id: string) => {
    info('TCPConnect! ' + id);
  };

  onClientConnected = (client: Client) => {
    info('Client connected ' + client.id);
  };

  newPlayer() {
    const player = new Player();
    this.players.push(player);
    this.io.emit;
  }
}
