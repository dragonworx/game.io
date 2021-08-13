export interface Message<T> {
  clientId: string;
  eventName: string;
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
  SocketDebug = 'socketDebug',
  UDPPing = 'udpPing',
  SocketPing = 'socketPing',
  SocketPlayerJoin = 'socketPlayerJoin',
  SocketPlayerInput = 'socketPlayerInput',
  SocketRequestGameState = 'socketRequestGameState',
}

// sent by server
export enum ServerEvents {
  UDPInit = 'udpInit',
  SocketInit = 'socketInit',
  UDPPong = 'udpPong',
  SocketPong = 'socketPong',
  SocketInitConnection = 'socketInitConnection',
  SocketPlayerJoined = 'socketPlayerJoined',
  SocketPlayerInitialPositions = 'socketPlayerInitialPositions',
  SocketPlayerDisconnected = 'socketPayerDisconnected',
  SocketGameInit = 'socketGameInit',
  SocketGameStart = 'socketGameStart',
  SocketRespondGameState = 'socketRespondGameState',
  UDPUpdate = 'updUpdate',
}
