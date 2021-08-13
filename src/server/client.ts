import { ServerChannel, Socket } from './io';
import { Message, Protocol, ServerEvents } from '../common/messaging';
import { logger, stringify } from './log';

export class Client {
  id: string;
  udp?: ServerChannel;
  socket?: Socket;

  constructor(id: string) {
    this.id = id;
  }

  messageUDP<T>(eventName: ServerEvents, payload?: T) {
    if (eventName !== ServerEvents.UDPPong) {
      logger
        .bold()
        .color('yellow')
        .log(`--------------\nUDP -> ${this.id}: "${eventName}"`);
    }
    payload && logger.color('yellow').log(stringify(payload));
    this.udp!.emit(Protocol.UDPMessage, {
      clientId: this.id,
      eventName,
      payload,
    } as Message<any>);
  }

  messageSocket<T>(eventName: ServerEvents, payload?: T) {
    if (eventName !== ServerEvents.SocketPong) {
      logger
        .bold()
        .color('yellow')
        .log(`--------------\nTCP -> ${this.id}: "${eventName}"`);
    }
    payload && logger.color('yellow').log(stringify(payload));
    this.socket!.emit(Protocol.SocketMessage, {
      clientId: this.id,
      eventName,
      payload,
    } as Message<any>);
  }
}
