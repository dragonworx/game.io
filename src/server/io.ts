import geckos, {
  iceServers,
  ServerChannel,
  GeckosServer,
  Data,
} from '@geckos.io/server';
import EventEmitter from 'eventemitter3';
import { Message, Protocol } from '../core/message';
import { Client } from './client';
import { info } from './util';

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
  upd: GeckosServer;
  socket: any;
  clients: Map<string, Client> = new Map();

  constructor() {
    super();

    const upd = (this.upd = geckos({ iceServers }));
    upd.onConnection(this.onUPDConnect);

    const socket = (this.socket = require('socket.io')());
    socket.on('connection', this.onSocketConnect);
  }

  listen() {
    this.upd.listen();
    this.socket.listen(TCPListenPort);
  }

  onUPDConnect = (channel: ServerChannel) => {
    const { id } = channel;
    channel.on(Protocol.UPDRegister, (clientId: Data) => {
      info(`upd register ${clientId}@${id}`);
      this.registerClient(String(clientId), channel);
    });
    channel.on(Protocol.UPDMessage, (data: Data) => {
      const message = data as Message<any>;
      const { clientId, type, payload } = message;
      info(`upd message ${clientId} "${type}" {${JSON.stringify(payload)}}`);
      this.emit(Protocol.UPDMessage, message);
      const client = this.clients.get(clientId)!;
      this.emit(message.type, client, message.payload);
    });
    channel.onDisconnect = () => this.emit(Protocol.UPDDisconnect, id);
    this.emit(Protocol.UPDConnect, id);
  };

  onSocketConnect = (socket: Socket) => {
    const { id } = socket;
    socket.on(Protocol.SocketRegister, (clientId: string) => {
      info(`socket register ${clientId}@${id}`);
      this.registerClient(clientId, undefined, socket);
    });
    socket.on('disconnect', () => this.emit(Protocol.SocketDisconnect, id));
    socket.on(Protocol.SocketMessage, (data: Message<any>) => {
      const message = data as Message<any>;
      const { clientId, type, payload } = message;
      info(`socket message ${clientId} "${type}" {${JSON.stringify(payload)}}`);
      this.emit(Protocol.SocketMessage, message);
      const client = this.clients.get(clientId)!;
      this.emit(message.type, client, message.payload);
    });
    this.emit(Protocol.SocketConnect, id);
  };

  registerClient(clientId: string, upd?: ServerChannel, socket?: Socket) {
    const { clients } = this;
    if (!clients.has(clientId)) {
      info('New client created ' + clientId);
      const client = new Client(clientId);
      clients.set(clientId, client);
    }
    const client = clients.get(clientId)!;
    upd && (client.upd = upd);
    socket && (client.socket = socket);
    if (client.upd && client.socket) {
      this.emit(Protocol.ClientConnected, client);
    }
  }
}
