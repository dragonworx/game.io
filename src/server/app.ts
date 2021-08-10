import { IO } from './io';
import { Client } from './client';
import { debug } from './log';
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
    debug('onUPDConnect:', id);
  };

  UPDDisconnect = (id: string) => {
    debug('UPDDisconnect:', id);
  };

  onSocketConnect = (id: string) => {
    debug('onSocketConnect:', id);
  };

  onSocketDisconnect = (id: string) => {
    debug('onSocketDisconnect:', id);
  };

  onClientConnected = (client: Client) => {
    debug('onClientConnected:', client.id);
    client.messageUPD(Events.UPDInit);
    client.messageSocket(Events.SocketInit);
  };

  onUPDPing = (client: Client) => {
    debug('onUPDPing:', client.id);
    client.messageUPD(Events.UPDPong);
  };

  onSocketPing = (client: Client) => {
    debug('onSocketPing:', client.id);
    client.messageSocket(Events.SocketPong);
  };
}
