import { ServerChannel, Socket } from './io';
import {
  Message,
  Protocol,
  ServerSocketEvents,
  ServerUDPEvents,
} from '../common/messaging';
import { logger, stringify } from './log';

const excludeLogUDPMessages: string[] = [
  ServerUDPEvents.UDPPong,
  ServerUDPEvents.UDPUpdate,
];

const excludeLogSocketMessages: string[] = [ServerSocketEvents.SocketPong];

export class Client {
  id: string;
  udp?: ServerChannel;
  socket?: Socket;

  constructor(id: string) {
    this.id = id;
  }

  get isValid() {
    return !!this.udp && !!this.socket;
  }

  messageUDP<T>(eventName: ServerUDPEvents, payload?: T) {
    if (this.udp) {
      if (!excludeLogUDPMessages.includes(eventName)) {
        logger
          .bold()
          .color('yellow')
          .log(`-> udp.message.send -> ${this.id}: "${eventName}"`);
        payload && logger.color('white').log(`> ${stringify(payload)}`);
      }
      this.udp.emit(Protocol.UDPMessage, {
        clientId: this.id,
        eventName,
        payload,
      } as Message);
    } else {
      logger
        .bold()
        .color('red')
        .log(`udp.message.dropped: ${this.id}: "${eventName}"`);
    }
  }

  messageSocket<T>(eventName: ServerSocketEvents, payload?: T) {
    if (this.socket) {
      if (!excludeLogSocketMessages.includes(eventName)) {
        logger
          .bold()
          .color('yellow')
          .log(`-> socket.message.send -> ${this.id}: "${eventName}"`);
        payload && logger.color('white').log(`> ${stringify(payload)}`);
      }
      this.socket!.emit(Protocol.SocketMessage, {
        clientId: this.id,
        eventName,
        payload,
      } as Message);
    } else {
      logger
        .bold()
        .color('red')
        .log(`socket.message.dropped: ${this.id}: "${eventName}"`);
    }
  }

  dispose() {
    if (this.socket) {
      logger.bold().color('red').log(`dispose.socket: ${this.id}`);
      this.socket.disconnect();
    }
    if (this.udp) {
      logger.bold().color('red').log(`dispose.udp: ${this.id}`);
      this.udp.close();
    }
  }
}
