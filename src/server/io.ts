import geckos, {
  iceServers,
  ServerChannel,
  GeckosServer,
} from '@geckos.io/server';
import EventEmitter from 'eventemitter3';

export enum Events {
  UPDConnect = 'updConnect',
  TCPConnect = 'tcpConnect',
}

export const TCPListenPort = 3000;

export class IO extends EventEmitter {
  upd: GeckosServer;
  tcp: any;

  constructor() {
    super();
    const upd = (this.upd = geckos({ iceServers }));
    upd.onConnection(this.onUPDConnect);

    const tcp = (this.tcp = require('socket.io')());
    tcp.on('connection', this.onTCPConnect);
  }

  listen() {
    this.upd.listen();
    this.tcp.listen(TCPListenPort);
  }

  onUPDConnect = (channel: ServerChannel) => {
    this.emit(Events.UPDConnect);
  };

  onTCPConnect = (socket: any) => {
    this.emit(Events.TCPConnect);
  };
}
