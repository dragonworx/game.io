import { IO } from './io';
import { Client } from './client';
import { debug } from './log';
import { Player } from './player';
import { Game } from './game';
import { Protocol, ServerEvents, ClientEvents } from '../core/messaging';

export class App {
  io: IO;
  game: Game;

  constructor() {
    const io = (this.io = new IO());

    this.game = new Game();

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
    debug('onClientConnected:', client.id);
    client.messageUDP(ServerEvents.UDPInit);
    client.messageSocket(ServerEvents.SocketInit);
    debug(this.game.getInitGameState());
    client.messageSocket(
      ServerEvents.InitConnection,
      this.game.getInitGameState(),
    );
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
    const { game, io } = this;
    const { players } = game;
    const player = new Player(client, playerName);
    game.addPlayer(player);
    io.broadcastSocket(ServerEvents.PlayerJoined, {
      clientId: client.id,
      name: playerName,
    });
    const allPlayersJoined = io.clients.size === players.length;
    if (allPlayersJoined) {
      setTimeout(() => {
        io.broadcastSocket(ServerEvents.GameInit);
        game.init();
        setTimeout(() => {
          io.broadcastSocket(ServerEvents.GameStart);
          game.start();
        }, 0); //4000
      }, 2000);
    }
  };

  onPlayerInput = (client: Client, code: string) => {
    const player = this.game.getPlayer(client.id);
    player.bufferInput(code);
  };
}
