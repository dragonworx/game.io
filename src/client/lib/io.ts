import geckos, { ClientChannel, Data } from '@geckos.io/client';
import { EventEmitter } from 'eventemitter3';
import io, { Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { Message, Protocol } from '../../core/message';

export class IO extends EventEmitter {
  clientId: string;
  udp: ClientChannel;
  socket: typeof Socket;
  isUPDConnected: boolean = false;
  isSocketConnected: boolean = false;

  constructor() {
    super();
    this.clientId = uuidv4();
    const channel = (this.udp = geckos());
    channel.onConnect(this.onUDPConnect);
    channel.onDisconnect(this.onUDPDisconnect);
    channel.on(Protocol.UPDMessage, this.onUPDMessage);

    const socket = (this.socket = io(
      window.location.protocol + '//' + window.location.hostname + ':3000/',
    ));

    socket.on('connect', this.onSocketConnect);
    socket.on('disconnect', this.onSocketDisconnect);
    socket.on(Protocol.SocketMessage, this.onSocketMessage);
  }

  // udp

  onUDPConnect = (error?: Error) => {
    if (error) {
      return this.emit(Protocol.UPDConnectError);
    }
    this.isUPDConnected = true;
    this.udp.emit(Protocol.UPDRegister, this.clientId);
    this.emit(Protocol.UPDConnect);
    this.validateConnection();
  };

  onUDPDisconnect = () => {
    this.isUPDConnected = false;
    this.emit(Protocol.UPDDisconnect);
    this.validateConnection();
  };

  onUPDMessage = (data: Data) => {
    const message = data as Message<any>;
    this.emit(Protocol.UPDMessage, message);
    this.emit(message.type, message.payload);
  };

  messageUPD<T>(type: string, payload?: T) {
    console.log('send upd message', type, payload);
    this.udp.emit(Protocol.UPDMessage, {
      clientId: this.clientId,
      type,
      payload,
    });
  }

  // socket

  onSocketConnect = () => {
    this.isSocketConnected = true;
    this.socket.emit(Protocol.SocketRegister, this.clientId);
    this.emit(Protocol.SocketConnect);
    this.validateConnection();
  };

  onSocketDisconnect = () => {
    this.isSocketConnected = false;
    this.emit(Protocol.SocketDisconnect);
    this.validateConnection();
  };

  onSocketMessage = (data: Data) => {
    const message = data as Message<any>;
    this.emit(Protocol.SocketMessage, message);
    this.emit(message.type, message.payload);
  };

  messageSocket<T>(type: string, payload?: T) {
    console.log('send socket message', type, payload);
    this.socket.emit(Protocol.SocketMessage, {
      clientId: this.clientId,
      type,
      payload,
    });
  }

  // general

  validateConnection() {
    const { isSocketConnected, isUPDConnected: isUDPConnected } = this;
    if (isSocketConnected && isUDPConnected) {
      this.emit(Protocol.Connected);
    } else if (!isSocketConnected && !isUDPConnected) {
      this.emit(Protocol.Disconnected);
    }
  }
}

export interface Ping {
  startTime: number;
  endTime: number;
  elapsed: number;
}

export const startPing = (): Ping => ({
  startTime: Date.now(),
  endTime: -1,
  elapsed: -1,
});

export const endPing = (ping: Ping) => {
  ping.endTime = Date.now();
  ping.elapsed = ping.endTime - ping.startTime;
};
