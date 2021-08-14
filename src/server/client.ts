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
    if (!excludeLogUDPMessages.includes(eventName)) {
      logger
        .bold()
        .color('yellow')
        .log(`--------------\nUDP -> ${this.id}: "${eventName}"`);
      payload && logger.color('white').log(stringify(payload));
    }
    this.udp!.emit(Protocol.UDPMessage, {
      clientId: this.id,
      eventName,
      payload,
    } as Message);
  }

  messageSocket<T>(eventName: ServerSocketEvents, payload?: T) {
    if (!excludeLogSocketMessages.includes(eventName)) {
      logger
        .bold()
        .color('yellow')
        .log(`--------------\nTCP -> ${this.id}: "${eventName}"`);
      payload && logger.color('white').log(stringify(payload));
    }
    this.socket!.emit(Protocol.SocketMessage, {
      clientId: this.id,
      eventName,
      payload,
    } as Message);
  }
}
