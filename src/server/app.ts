import logger from 'node-color-log';
import { IO } from './io';
import { Client } from './client';
import { debug } from './log';
import { Game } from './game';
import { Protocol, ServerEvents, ClientEvents } from '../common/messaging';

export class App {
  io: IO;
  game: Game;

  constructor() {
    const io = (this.io = new IO());

    this.game = new Game(io);

    // handle protocol from client
    io.on(Protocol.UDPConnect, this.onUDPConnect);
    io.on(Protocol.UDPDisconnect, this.UDPDisconnect);
    io.on(Protocol.SocketConnect, this.onSocketConnect);
    io.on(Protocol.SocketDisconnect, this.onSocketDisconnect);
    io.on(Protocol.ClientConnected, this.onClientConnected);

    // handle client events
    io.on(ClientEvents.Debug, this.onDebug);
    io.on(ClientEvents.UDPPing, this.onUDPPing);
    io.on(ClientEvents.SocketPing, this.onSocketPing);
    io.on(ClientEvents.PlayerJoin, this.onPlayerJoin);
    io.on(ClientEvents.PlayerInput, this.onPlayerInput);
    io.on(ClientEvents.GetGameState, this.onGetGameState);

    io.listen();
  }

  onDebug = (_client: Client, cmd: string) => {
    if (cmd === 'clear') {
      console.clear();
    } else if (cmd === 'gameState') {
      this.game.logGameState();
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
    this.io.broadcastSocket(ServerEvents.PlayerDisconnected, clientId);
  };

  onClientConnected = (client: Client) => {
    logger
      .color('blue')
      .bgColor('green')
      .log(`onClientConnected: ${client.id}`);
    this.game.logGameState();
    client.messageUDP(ServerEvents.UDPInit);
    client.messageSocket(ServerEvents.SocketInit);
    client.messageSocket(ServerEvents.InitConnection, this.game.status);
  };

  onUDPPing = (client: Client) => {
    client.messageUDP(ServerEvents.UDPPong);
  };

  onSocketPing = (client: Client) => {
    client.messageSocket(ServerEvents.SocketPong);
  };

  onPlayerJoin = (client: Client, playerName: string) => {
    logger.color('white').bgColor('cyan').log(`onPlayerJoin: ${client.id}`);
    this.game.newPlayer(client, playerName);
    this.game.logGameState();
  };

  onPlayerInput = (client: Client, code: string) => {
    this.game.getPlayer(client.id).bufferInput(code);
  };

  onGetGameState = (client: Client) => {
    client.messageSocket(ServerEvents.SetGameState, this.game.getGameState());
  };
}
