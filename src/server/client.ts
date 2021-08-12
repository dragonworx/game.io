import { ServerChannel, Socket } from './io';
import { Protocol } from '../core/message';
import { debug } from './log';

export class Client {
  id: string;
  udp?: ServerChannel;
  socket?: Socket;

  constructor(id: string) {
    this.id = id;
  }

  messageUDP<T>(type: string, payload?: T) {
    debug('messageUDP:', type, JSON.stringify(payload));
    this.udp!.emit(Protocol.UDPMessage, {
      clientId: this.id,
      type,
      payload,
    });
  }

  messageSocket<T>(type: string, payload?: T) {
    debug('messageSocket:', type, JSON.stringify(payload));
    this.socket!.emit(Protocol.SocketMessage, {
      clientId: this.id,
      type,
      payload,
    });
  }
}
