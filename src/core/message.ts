export interface Message<T> {
  clientId: string;
  type: string;
  payload?: T;
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

export enum Events {
  UDPInit = 'udpInit',
  SocketInit = 'socketInit',
  UDPPing = 'udpPing',
  UDPPong = 'udpPong',
  SocketPing = 'socketPing',
  SocketPong = 'socketPong',
}
