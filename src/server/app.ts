import logger from 'node-color-log';
import { ServerIO } from './io';
import { Client } from './client';
import { debug } from './log';
import { ServerGame } from './game';
import { Protocol, ServerEvents, ClientEvents } from '../common/messaging';

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
    io.on(ClientEvents.SocketDebug, this.onSocketDebug);
    io.on(ClientEvents.UDPPing, this.onUDPPing);
    io.on(ClientEvents.SocketPing, this.onSocketPing);
    io.on(ClientEvents.SocketPlayerJoin, this.onSocketPlayerJoin);
    io.on(ClientEvents.SocketPlayerInput, this.onSocketPlayerInput);
    io.on(ClientEvents.SocketRequestGameState, this.onSocketRequestGameState);

    io.listen();
  }

  onSocketDebug = (_client: Client, cmd: string) => {
    if (cmd === 'clear') {
      console.clear();
    } else if (cmd === 'gameState') {
      this.game.logGameState();
    } else if (cmd === 'reset') {
      this.game.reset();
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
    this.io.broadcastSocket(ServerEvents.SocketPlayerDisconnected, clientId);
  };

  onClientConnected = (client: Client) => {
    logger
      .color('black')
      .bgColor('green')
      .log(`onClientConnected: ${client.id}`);
    this.game.logGameState();
    client.messageUDP(ServerEvents.UDPInit);
    client.messageSocket(ServerEvents.SocketInit);
    client.messageSocket(ServerEvents.SocketInitConnection, this.game.status);
  };

  onUDPPing = (client: Client) => {
    client.messageUDP(ServerEvents.UDPPong);
  };

  onSocketPing = (client: Client) => {
    client.messageSocket(ServerEvents.SocketPong);
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
      ServerEvents.SocketRespondGameState,
      this.game.getGameState(),
    );
  };
}
