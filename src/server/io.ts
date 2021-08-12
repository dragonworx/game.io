import geckos, {
  iceServers,
  ServerChannel,
  GeckosServer,
  Data,
} from '@geckos.io/server';
import EventEmitter from 'eventemitter3';
import { Message, Protocol } from '../core/message';
import { Client } from './client';
import { debug } from './log';
import socketio from 'socket.io';

export { ServerChannel } from '@geckos.io/server';

type Socket = {
  id: string;
  connected: boolean;
  disconnected: boolean;
  on(eventName: string, data: any): void;
  emit(eventName: string, data: any): void;
  disconnect(close?: boolean): void;
};

export { Socket };

export const TCPListenPort = 3000;

export class IO extends EventEmitter {
  udp: GeckosServer;
  socket: any;
  clients: Map<string, Client> = new Map();

  constructor() {
    super();

    const udp = (this.udp = geckos({ iceServers }));
    udp.onConnection(this.onUDPConnect);

    const socket = (this.socket = socketio());
    socket.on('connection', this.onSocketConnect);
  }

  listen() {
    this.udp.listen();
    this.socket.listen(TCPListenPort);
  }

  onUDPConnect = (channel: ServerChannel) => {
    const { id } = channel;
    channel.on(Protocol.UDPRegister, (clientId: Data) => {
      debug('onUDPConnect.UDPRegister:', clientId, id);
      this.registerClient(String(clientId), channel);
    });
    channel.on(Protocol.UDPMessage, (data: Data) => {
      const message = data as Message<any>;
      const { clientId, type, payload } = message;
      debug(
        'onUDPConnect.UDPMessage:',
        clientId,
        type,
        JSON.stringify(payload),
      );
      this.emit(Protocol.UDPMessage, message);
      const client = this.clients.get(clientId)!;
      this.emit(message.type, client, message.payload);
    });
    channel.onDisconnect = () => this.emit(Protocol.UDPDisconnect, id);
    this.emit(Protocol.UDPConnect, id);
  };

  onSocketConnect = (socket: Socket) => {
    const { id } = socket;
    socket.on(Protocol.SocketRegister, (clientId: string) => {
      debug('onSocketConnect.SocketRegister:', clientId, id);
      this.registerClient(clientId, undefined, socket);
    });
    socket.on('disconnect', () => {
      this.clients.forEach(client => {
        if (client.socket!.id === id) {
          debug('onSocketConnect.disconnect:' + client.id);
          this.clients.delete(client.id);
        }
      });
      this.emit(Protocol.SocketDisconnect, id);
    });
    socket.on(Protocol.SocketMessage, (data: Message<any>) => {
      const message = data as Message<any>;
      const { clientId, type, payload } = message;
      debug(
        'onSocketConnect.SocketMessage:',
        clientId,
        type,
        JSON.stringify(payload),
      );
      this.emit(Protocol.SocketMessage, message);
      const client = this.clients.get(clientId)!;
      this.emit(message.type, client, message.payload);
    });
    this.emit(Protocol.SocketConnect, id);
  };

  registerClient(clientId: string, udp?: ServerChannel, socket?: Socket) {
    const { clients } = this;
    if (!clients.has(clientId)) {
      debug('registerClient:', clientId);
      const client = new Client(clientId);
      clients.set(clientId, client);
    }
    const client = clients.get(clientId)!;
    udp && (client.udp = udp);
    socket && (client.socket = socket);
    if (client.udp && client.socket) {
      this.emit(Protocol.ClientConnected, client);
    }
  }
}
