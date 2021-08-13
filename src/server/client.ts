import { ServerChannel, Socket } from './io';
import { Message, Protocol, ServerEvents } from '../common/messaging';
import { logger, stringify } from './log';

const excludeLogUDPMessages: string[] = [
  ServerEvents.UDPPong,
  ServerEvents.UDPUpdate,
];

const excludeLogSocketMessages: string[] = [ServerEvents.SocketPong];

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

  messageUDP<T>(eventName: ServerEvents, payload?: T) {
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
    } as Message<any>);
  }

  messageSocket<T>(eventName: ServerEvents, payload?: T) {
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
    } as Message<any>);
  }
}
