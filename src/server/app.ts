import { IO } from './io';
import { Client } from './client';
import { info } from './util';
import { Player } from '../core/player';
import { Protocol, Events } from '../core/message';

export class App {
  io: IO;
  players: Player[] = [];

  constructor() {
    const io = (this.io = new IO());

    io.on(Protocol.UPDConnect, this.onUPDConnect);
    io.on(Protocol.SocketConnect, this.onSocketConnect);
    io.on(Protocol.ClientConnected, this.onClientConnected);

    io.on(Events.UPDPing, this.onUPDPing);
    io.on(Events.SocketPing, this.onSocketPing);

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
    client.messageUPD(Events.UPDInit);
    client.messageSocket(Events.SocketInit);
  };

  onUPDPing = (client: Client) => {
    console.log('on udp ping ' + client.id);
    client.messageUPD(Events.UPDPong);
  };

  onSocketPing = (client: Client) => {
    console.log('on socket ping ' + client.id);
    client.messageSocket(Events.SocketPong);
  };
}
