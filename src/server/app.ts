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

    io.on(Protocol.UDPConnect, this.onUDPConnect);
    io.on(Protocol.UDPDisconnect, this.UDPDisconnect);
    io.on(Protocol.SocketConnect, this.onSocketConnect);
    io.on(Protocol.SocketDisconnect, this.onSocketDisconnect);
    io.on(Protocol.ClientConnected, this.onClientConnected);

    io.on(Events.UDPPing, this.onUDPPing);
    io.on(Events.SocketPing, this.onSocketPing);

    io.listen();
  }

  onUDPConnect = (id: string) => {
    debug('onUDPConnect:', id);
  };

  UDPDisconnect = (id: string) => {
    debug('UDPDisconnect:', id);
  };

  onSocketConnect = (id: string) => {
    debug('onSocketConnect:', id);
  };

  onSocketDisconnect = (id: string) => {
    debug('onSocketDisconnect:', id);
  };

  onClientConnected = (client: Client) => {
    debug('onClientConnected:', client.id);
    client.messageUDP(Events.UDPInit);
    client.messageSocket(Events.SocketInit);
  };

  onUDPPing = (client: Client) => {
    debug('onUDPPing:', client.id);
    client.messageUDP(Events.UDPPong);
  };

  onSocketPing = (client: Client) => {
    debug('onSocketPing:', client.id);
    client.messageSocket(Events.SocketPong);
  };
}
