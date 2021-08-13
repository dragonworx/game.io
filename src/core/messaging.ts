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
  UDPPing = 'udpPing',
  SocketPing = 'socketPing',
  PlayerJoin = 'playerJoin',
}

// sent by server
export enum ServerEvents {
  UDPInit = 'udpInit',
  SocketInit = 'socketInit',
  UDPPong = 'udpPong',
  SocketPong = 'socketPong',
  InitConnection = 'initConnection',
  PlayerJoined = 'playerJoined',
  PlayerDisconnected = 'playerDisconnected',
  GameInit = 'gameInit',
  GameStart = 'gameStart',
}
