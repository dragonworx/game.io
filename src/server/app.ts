import { IO, Events } from './io';
import { info } from './util';

export class App {
  io: IO;

  constructor() {
    const io = (this.io = new IO());
    io.on(Events.UPDConnect, this.onUPDConnect);
    io.on(Events.TCPConnect, this.onTCPConnect);
    io.listen();
  }

  onUPDConnect = () => {
    info('UPDConnect!');
  };

  onTCPConnect = () => {
    info('TCPConnect!');
  };
}
