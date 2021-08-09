import geckos, {
  iceServers,
  ServerChannel,
  GeckosServer,
  Data,
} from '@geckos.io/server';
import EventEmitter from 'eventemitter3';
import { Message, Events } from '../core/message';
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
    channel.on(Events.UPDRegister, (clientId: Data) => {
      info(`upd register ${clientId}@${id}`);
      this.registerClient(String(clientId), id);
    });
    channel.on('message', (message: Data) =>
      this.emit(Events.UPDMessage, message),
    );
    channel.onDisconnect = () => this.emit(Events.UPDDisconnect, id);
    this.emit(Events.UPDConnect, id);
  };

  onSocketConnect = (socket: Socket) => {
    const { id } = socket;
    socket.on(Events.SocketRegister, (clientId: string) => {
      info(`socket register ${clientId}@${id}`);
      this.registerClient(clientId, undefined, id);
    });
    socket.on('disconnect', () => this.emit(Events.SocketDisconnect, id));
    socket.on(Events.SocketMessage, (message: Message<any>) =>
      this.emit(Events.SocketMessage, message),
    );
    this.emit(Events.SocketConnect, id);
  };

  registerClient(clientId: string, updId?: string, socketId?: string) {
    const { clients } = this;
    if (!clients.has(clientId)) {
      info('New client created ' + clientId);
      const client = new Client(clientId);
      clients.set(clientId, client);
    }
    const client = clients.get(clientId)!;
    updId && (client.updId = updId);
    socketId && (client.socketId = socketId);
    if (client.updId && client.socketId) {
      this.emit(Events.ClientConnected, client);
    }
  }
}

export class Client {
  id: string;
  updId?: string;
  socketId?: string;

  constructor(id: string) {
    this.id = id;
  }
}
