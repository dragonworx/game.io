import { ServerChannel, Socket } from './io';
import { Protocol } from '../core/message';
import { info } from './util';

export class Client {
  id: string;
  upd?: ServerChannel;
  socket?: Socket;

  constructor(id: string) {
    this.id = id;
  }

  messageUPD<T>(type: string, payload?: T) {
    info(`send upd message "${type}": ${JSON.stringify(payload)}`);
    this.upd!.emit(Protocol.UPDMessage, {
      clientId: this.id,
      type,
      payload,
    });
  }

  messageSocket<T>(type: string, payload?: T) {
    info(`send socket message "${type}": ${JSON.stringify(payload)}`);
    this.socket!.emit(Protocol.SocketMessage, {
      clientId: this.id,
      type,
      payload,
    });
  }
}
