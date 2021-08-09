import geckos, { ClientChannel, Data } from '@geckos.io/client';
import { EventEmitter } from 'eventemitter3';
import io, { Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { Message, Events } from '../../core/message';

export class IO extends EventEmitter {
  id: string;
  udp: ClientChannel;
  socket: typeof Socket;
  isUPDConnected: boolean = false;
  isSocketConnected: boolean = false;

  constructor() {
    super();
    this.id = uuidv4();
    const channel = (this.udp = geckos());
    channel.onConnect(this.onUDPConnect);
    channel.onDisconnect(this.onUDPDisconnect);
    channel.on('message', this.onUPDMessage);

    const socket = (this.socket = io(
      window.location.protocol + '//' + window.location.hostname + ':3000/',
    ));

    socket.on('connect', this.onSocketConnect);
    socket.on('disconnect', this.onSocketDisconnect);
    socket.on('message', this.onSocketMessage);
  }

  onUDPConnect = (error?: Error) => {
    if (error) {
      return this.emit(Events.UPDConnectError);
    }
    this.isUPDConnected = true;
    this.udp.emit(Events.UPDRegister, this.id);
    this.emit(Events.UPDConnect);
    this.validateConnection();
  };

  onUDPDisconnect = () => {
    this.isUPDConnected = false;
    this.emit(Events.UPDDisconnect);
    this.validateConnection();
  };

  onUPDMessage = (message: Data) => {
    this.emit(Events.UPDMessage, message as Message<any>);
  };

  onSocketConnect = () => {
    this.isSocketConnected = true;
    this.socket.emit(Events.SocketRegister, this.id);
    this.emit(Events.SocketConnect);
    this.validateConnection();
  };

  onSocketDisconnect = () => {
    this.isSocketConnected = false;
    this.emit(Events.SocketDisconnect);
    this.validateConnection();
  };

  onSocketMessage = (message: Data) => {
    this.emit(Events.SocketMessage, message as Message<any>);
  };

  sendUPDMessage(message: Message<any>) {
    this.udp.emit('message', message);
  }

  sendSocketMessage(message: Message<any>) {
    this.socket.emit('message', message);
  }

  validateConnection() {
    const { isSocketConnected, isUPDConnected: isUDPConnected } = this;
    if (isSocketConnected && isUDPConnected) {
      this.emit(Events.Connected);
    } else if (!isSocketConnected && !isUDPConnected) {
      this.emit(Events.Disconnected);
    }
  }
}
