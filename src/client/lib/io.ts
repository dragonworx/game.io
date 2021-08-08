import geckos, { ClientChannel } from '@geckos.io/client';
import io, { Socket } from 'socket.io-client';

export class IO {
  channel: ClientChannel;
  socket: typeof Socket;

  constructor() {
    const channel = (this.channel = geckos());
    channel.onConnect(this.onChannelConnect);

    const socket = (this.socket = io(
      window.location.protocol + '//' + window.location.hostname + ':3000/',
    ));
    socket.on('connect', () => {
      console.log('socket connect!');
    });
  }

  onChannelConnect = (error: Error | undefined) => {
    if (error) {
      console.error('channel connect error!', error.message);
      return;
    }
    console.log('channel connect!');
  };
}
