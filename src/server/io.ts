import geckos, {
  iceServers,
  ServerChannel,
  GeckosServer,
  Data,
} from '@geckos.io/server';
import EventEmitter from 'eventemitter3';
import {
  ClientEvents,
  Message,
  Protocol,
  ServerEvents,
} from '../common/messaging';
import { Client } from './client';
import { debug, logger, stringify } from './log';
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

export class ServerIO extends EventEmitter {
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
    const { clients } = this;
    const { id } = channel;
    channel.on(Protocol.UDPRegister, (clientId: Data) => {
      debug('onUDPConnect.UDPRegister:', clientId, id);
      this.registerClient(String(clientId), channel);
    });
    channel.on(Protocol.UDPMessage, (data: Data) => {
      const message = data as Message<any>;
      const { clientId, eventName, payload } = message;
      if (eventName !== ClientEvents.UDPPing) {
        logger
          .bold()
          .color('magenta')
          .log(`--------------\nUDP <- ${clientId}: "${eventName}"`);
        payload && logger.color('magenta').log(stringify(payload));
      }
      this.emit(Protocol.UDPMessage, message);
      const client = clients.get(clientId)!;
      this.emit(eventName, client, payload);
    });
    channel.onDisconnect = () => this.emit(Protocol.UDPDisconnect, id);
    this.emit(Protocol.UDPConnect, id);
  };

  onSocketConnect = (socket: Socket) => {
    const { clients } = this;
    const { id } = socket;
    socket.on(Protocol.SocketRegister, (clientId: string) => {
      debug('onSocketConnect.SocketRegister:', clientId, id);
      this.registerClient(clientId, undefined, socket);
    });
    socket.on('disconnect', () => {
      clients.forEach(client => {
        if (client.socket!.id === id) {
          logger
            .bold()
            .color('white')
            .bgColor('red')
            .log(`onSocketConnect.disconnect.deleteClient: ${client.id}`);
          clients.delete(client.id);
          this.emit(Protocol.SocketDisconnect, client.id);
        }
      });
    });
    socket.on(Protocol.SocketMessage, (data: Message<any>) => {
      const message = data as Message<any>;
      const { clientId, eventName, payload } = message;
      if (eventName !== ClientEvents.SocketPing) {
        logger
          .bold()
          .color('magenta')
          .log(`--------------\nTCP <- ${clientId}: "${eventName}"`);
        payload && logger.color('magenta').log(stringify(payload));
      }
      this.emit(Protocol.SocketMessage, message);
      const client = clients.get(clientId)!;
      this.emit(eventName, client, payload);
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

  broadcastSocket<T>(eventName: ServerEvents, payload?: T) {
    this.clients.forEach(client => client.messageSocket(eventName, payload));
  }

  broadcastUDP<T>(eventName: ServerEvents, payload?: T) {
    this.clients.forEach(client => client.messageUDP(eventName, payload));
  }

  validateClients() {
    const { clients } = this;
    const invalidClients: Client[] = [];
    clients.forEach(client => {
      if (!client.isValid) {
        invalidClients.push(client);
        clients.delete(client.id);
      }
    });
    return invalidClients;
  }
}
