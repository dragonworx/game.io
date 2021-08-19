import logger from 'node-color-log';
import { ServerIO } from './io';
import { Client } from './client';
import { debug } from './log';
import { ServerGame } from './game';
import {
  Protocol,
  ServerSocketEvents,
  ClientSocketEvents,
  ClientUDPEvents,
  ServerUDPEvents,
} from '../common/messaging';
import { PlayerJoinInfo } from '../common';

export class ServerApp {
  io: ServerIO;
  game: ServerGame;

  constructor(port: number) {
    const io = (this.io = new ServerIO());

    this.game = new ServerGame(io);

    // handle protocol from client
    io.on(Protocol.UDPConnect, this.onUDPConnect);
    io.on(Protocol.UDPDisconnect, this.UDPDisconnect);
    io.on(Protocol.SocketConnect, this.onSocketConnect);
    io.on(Protocol.SocketDisconnect, this.onSocketDisconnect);
    io.on(Protocol.ClientConnected, this.onClientConnected);

    // handle client events
    io.on(ClientSocketEvents.SocketDebug, this.onSocketDebug);
    io.on(ClientUDPEvents.UDPPing, this.onUDPPing);
    io.on(ClientSocketEvents.SocketPing, this.onSocketPing);
    io.on(ClientSocketEvents.SocketPlayerJoin, this.onSocketPlayerJoin);
    io.on(ClientSocketEvents.SocketPlayerInput, this.onSocketPlayerInput);
    io.on(
      ClientSocketEvents.SocketRequestGameState,
      this.onSocketRequestGameState,
    );

    io.listen(port);
  }

  reset() {
    this.io.clear();
    this.game.reset();
  }

  onSocketDebug = (_client: Client, cmd: string) => {
    const { game } = this;
    const actions: { [k: string]: () => void } = {
      clear: () => console.clear(),
      inspect: () => game.inspect(),
      reset: () => {
        game.reset();
        game.players.length = 0;
        this.io.broadcastSocket(ServerSocketEvents.SocketReload);
        this.io.clear();
      },
      gameover: () => game.debugGameOver(),
      toggle: () => game.toggle(),
    };
    actions[cmd]();
  };

  onUDPConnect = (id: string) => {
    debug('onUDPConnect:', id);
  };

  UDPDisconnect = (id: string) => {
    debug('UDPDisconnect:', id);
  };

  onSocketConnect = (id: string) => {
    debug('onSocketConnect:', id);
  };

  onSocketDisconnect = (clientId: string) => {
    debug('onSocketDisconnect.Client:', clientId);
    this.game.removePlayer(clientId);
    this.io.broadcastSocket(
      ServerSocketEvents.SocketPlayerDisconnected,
      clientId,
    );
  };

  onClientConnected = (client: Client) => {
    logger
      .color('black')
      .bgColor('green')
      .log(`onClientConnected: ${client.id}`);
    client.messageUDP(ServerUDPEvents.UDPInit);
    client.messageSocket(ServerSocketEvents.SocketInit);
    client.messageSocket(
      ServerSocketEvents.SocketInitConnection,
      this.game.status,
    );
  };

  onUDPPing = (client: Client) => {
    if (!client) {
      return;
    }
    client.messageUDP(ServerUDPEvents.UDPPong);
  };

  onSocketPing = (client: Client) => {
    if (!client) {
      return;
    }
    client.messageSocket(ServerSocketEvents.SocketPong);
  };

  onSocketPlayerJoin = (client: Client, playerJoinInfo: PlayerJoinInfo) => {
    logger.color('white').bgColor('cyan').log(`onPlayerJoin: ${client.id}`);
    this.game.newPlayer(client, playerJoinInfo);
  };

  onSocketPlayerInput = (client: Client, action: number) => {
    this.game.getPlayer(client.id).bufferInput(action);
  };

  onSocketRequestGameState = (client: Client) => {
    client.messageSocket(
      ServerSocketEvents.SocketRespondGameState,
      this.game.getInitialGameState(),
    );
  };
}
