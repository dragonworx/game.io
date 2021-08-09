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
    io.on(Protocol.UPDDisconnect, this.UPDDisconnect);
    io.on(Protocol.SocketConnect, this.onSocketConnect);
    io.on(Protocol.SocketDisconnect, this.onSocketDisconnect);
    io.on(Protocol.ClientConnected, this.onClientConnected);

    io.on(Events.UPDPing, this.onUPDPing);
    io.on(Events.SocketPing, this.onSocketPing);

    io.listen();
  }

  onUPDConnect = (id: string) => {
    info('onUPDConnect ' + id);
  };

  UPDDisconnect = (id: string) => {
    info('UPDDisconnect ' + id);
  };

  onSocketConnect = (id: string) => {
    info('onSocketConnect ' + id);
  };

  onSocketDisconnect = (id: string) => {
    info('onSocketDisconnect ' + id);
  };

  onClientConnected = (client: Client) => {
    info('onClientConnected ' + client.id);
    client.messageUPD(Events.UPDInit);
    client.messageSocket(Events.SocketInit);
  };

  onUPDPing = (client: Client) => {
    info('onUPDPing ' + client.id);
    client.messageUPD(Events.UPDPong);
  };

  onSocketPing = (client: Client) => {
    info('onSocketPing ' + client.id);
    client.messageSocket(Events.SocketPong);
  };
}
