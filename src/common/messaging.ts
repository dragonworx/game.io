export interface Message {
  clientId: string;
  eventName: string;
  payload?: string | number | boolean | {};
}

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

export enum ClientSocketEvents {
  SocketDebug = 'socketDebug',
  SocketPing = 'socketPing',
  SocketPlayerJoin = 'socketPlayerJoin',
  SocketPlayerInput = 'socketPlayerInput',
  SocketRequestGameState = 'socketRequestGameState',
}

export enum ClientUDPEvents {
  UDPPing = 'udpPing',
}

export enum ServerSocketEvents {
  SocketInit = 'socketInit',
  SocketPong = 'socketPong',
  SocketInitConnection = 'socketInitConnection',
  SocketPlayerJoined = 'socketPlayerJoined',
  SocketPlayerInitialPositions = 'socketPlayerInitialPositions',
  SocketPlayerDisconnected = 'socketPayerDisconnected',
  SocketGameInit = 'socketGameInit',
  SocketGameStart = 'socketGameStart',
  SocketRespondGameState = 'socketRespondGameState',
  SocketReload = 'socketReload',
}

export enum ServerUDPEvents {
  UDPInit = 'udpInit',
  UDPPong = 'udpPong',
  UDPUpdate = 'updUpdate',
}
