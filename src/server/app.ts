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

export class ServerApp {
  io: ServerIO;
  game: ServerGame;

  constructor() {
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

    io.listen();
  }

  onSocketDebug = (_client: Client, cmd: string) => {
    if (cmd === 'clear') {
      console.clear();
    } else if (cmd === 'gameState') {
      this.game.logGameState();
    } else if (cmd === 'reset') {
      this.game.reset();
    } else if (cmd === 'stop') {
      this.game.stop();
    }
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
    this.game.logGameState();
    client.messageUDP(ServerUDPEvents.UDPInit);
    client.messageSocket(ServerSocketEvents.SocketInit);
    client.messageSocket(
      ServerSocketEvents.SocketInitConnection,
      this.game.status,
    );
  };

  onUDPPing = (client: Client) => {
    client.messageUDP(ServerUDPEvents.UDPPong);
  };

  onSocketPing = (client: Client) => {
    client.messageSocket(ServerSocketEvents.SocketPong);
  };

  onSocketPlayerJoin = (client: Client, playerName: string) => {
    logger.color('white').bgColor('cyan').log(`onPlayerJoin: ${client.id}`);
    this.game.newPlayer(client, playerName);
    this.game.logGameState();
  };

  onSocketPlayerInput = (client: Client, code: string) => {
    this.game.getPlayer(client.id).bufferInput(code);
  };

  onSocketRequestGameState = (client: Client) => {
    client.messageSocket(
      ServerSocketEvents.SocketRespondGameState,
      this.game.getGameState(),
    );
  };
}
