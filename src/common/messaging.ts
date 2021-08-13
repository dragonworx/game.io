export interface Message<T> {
  clientId: string;
  type: string;
  payload?: T;
}

// sent by client
export enum Protocol {
  UDPConnect = '_udpConnect',
  SocketConnect = '_socketConnect',
  UDPRegister = '_udpRegister',
  SocketRegister = '_socketRegister',
  UDPMessage = '_udpMessage',
  SocketMessage = '_socketMessage',
  Connected = '_connected',
  Disconnected = '_disconnected',
  UDPConnectError = '_udpConnectError',
  UDPDisconnect = '_udpDisconnect',
  SocketDisconnect = '_socketDisconnect',
  ClientConnected = '_clientConnected',
}

// sent by client
export enum ClientEvents {
  Debug = 'debug',
  UDPPing = 'udpPing',
  SocketPing = 'socketPing',
  PlayerJoin = 'playerJoin',
  PlayerInput = 'playerInput',
  GetGameState = 'getGameState',
}

// sent by server
export enum ServerEvents {
  UDPInit = 'udpInit',
  SocketInit = 'socketInit',
  UDPPong = 'udpPong',
  SocketPong = 'socketPong',
  InitConnection = 'initConnection',
  PlayerJoined = 'playerJoined',
  PlayerInitialPositions = 'playerInitialPositions',
  PlayerDisconnected = 'playerDisconnected',
  GameInit = 'gameInit',
  GameStart = 'gameStart',
  SetGameState = 'setGameState',
}
