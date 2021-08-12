import { ServerChannel, Socket } from './io';
import { Protocol, ServerEvents } from '../core/message';
import { debug } from './log';

export class Client {
  id: string;
  udp?: ServerChannel;
  socket?: Socket;

  constructor(id: string) {
    this.id = id;
  }

  messageUDP<T>(eventName: ServerEvents, payload?: T) {
    debug('messageUDP:', eventName, JSON.stringify(payload));
    this.udp!.emit(Protocol.UDPMessage, {
      clientId: this.id,
      type: eventName,
      payload,
    });
  }

  messageSocket<T>(eventName: ServerEvents, payload?: T) {
    debug('messageSocket:', eventName, JSON.stringify(payload));
    this.socket!.emit(Protocol.SocketMessage, {
      clientId: this.id,
      type: eventName,
      payload,
    });
  }
}
