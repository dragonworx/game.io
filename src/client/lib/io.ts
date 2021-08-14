import geckos, { ClientChannel, Data } from '@geckos.io/client';
import { EventEmitter } from 'eventemitter3';
import io, { Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { ClientEvents, Message, Protocol } from '../../common/messaging';

export class ClientIO extends EventEmitter {
  clientId: string;
  udp: ClientChannel;
  socket: typeof Socket;
  isUDPConnected: boolean = false;
  isSocketConnected: boolean = false;

  constructor() {
    super();
    this.clientId = uuidv4();
    const channel = (this.udp = geckos());
    channel.onConnect(this.onUDPConnect);
    channel.onDisconnect(this.onUDPDisconnect);
    channel.on(Protocol.UDPMessage, this.onUDPMessage);

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
      return this.emit(Protocol.UDPConnectError);
    }
    this.isUDPConnected = true;
    this.udp.emit(Protocol.UDPRegister, this.clientId);
    this.emit(Protocol.UDPConnect);
    this.validateConnection();
  };

  onUDPDisconnect = () => {
    this.isUDPConnected = false;
    this.emit(Protocol.UDPDisconnect);
    this.validateConnection();
  };

  onUDPMessage = (data: Data) => {
    const message = data as Message<any>;
    this.emit(Protocol.UDPMessage, message);
    this.emit(message.eventName, message.payload);
  };

  messageUDP<T>(eventName: string, payload?: T) {
    if (eventName !== ClientEvents.UDPPing) {
      console.debug('messageUDP:', eventName, payload);
    }
    this.udp.emit(Protocol.UDPMessage, {
      clientId: this.clientId,
      eventName,
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
    this.emit(message.eventName, message.payload);
  };

  messageSocket<T>(eventName: string, payload?: T) {
    if (eventName !== ClientEvents.SocketPing) {
      console.debug('messageSocket:', eventName, payload);
    }
    this.socket.emit(Protocol.SocketMessage, {
      clientId: this.clientId,
      eventName,
      payload,
    });
  }

  // general

  validateConnection() {
    const { isSocketConnected, isUDPConnected: isUDPConnected } = this;
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
