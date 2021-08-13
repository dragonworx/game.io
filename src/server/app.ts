import { IO } from './io';
import { Client } from './client';
import { debug } from './log';
import { Player } from './player';
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
    io.on(ClientEvents.UDPPing, this.onUDPPing);
    io.on(ClientEvents.SocketPing, this.onSocketPing);
    io.on(ClientEvents.PlayerJoin, this.onPlayerJoin);
    io.on(ClientEvents.PlayerInput, this.onPlayerInput);

    io.listen();
  }

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
    this.game.clear();

    debug('onClientConnected:', client.id);
    client.messageUDP(ServerEvents.UDPInit);
    client.messageSocket(ServerEvents.SocketInit);
    debug(this.game.getInitGameState());
    client.messageSocket(
      ServerEvents.InitConnection,
      this.game.getInitGameState(),
    );

    for (let i = 0; i < 3; i++) {
      this.game.newPlayer(client, `Player${i + 1}`);
    }
  };

  onUDPPing = (client: Client) => {
    debug('onUDPPing:', client.id);
    client.messageUDP(ServerEvents.UDPPong);
  };

  onSocketPing = (client: Client) => {
    debug('onSocketPing:', client.id);
    client.messageSocket(ServerEvents.SocketPong);
  };

  onPlayerJoin = (client: Client, playerName: string) => {
    this.game.newPlayer(client, playerName);
  };

  onPlayerInput = (client: Client, code: string) => {
    this.game.getPlayer(client.id).bufferInput(code);
  };
}
