export interface Message<T> {
  clientId: string;
  type: string;
  payload?: T;
}

export enum Protocol {
  UPDConnect = '_updConnect',
  SocketConnect = '_socketConnect',
  UPDRegister = '_updRegister',
  SocketRegister = '_socketRegister',
  UPDMessage = '_updMessage',
  SocketMessage = '_socketMessage',
  Connected = '_connected',
  Disconnected = '_disconnected',
  UPDConnectError = '_updConnectError',
  UPDDisconnect = '_updDisconnect',
  SocketDisconnect = '_socketDisconnect',
  ClientConnected = '_clientConnected',
}

export enum Events {
  UPDInit = 'updInit',
  SocketInit = 'socketInit',
  UPDPing = 'updPing',
  UPDPong = 'updPong',
  SocketPing = 'socketPing',
  SocketPong = 'socketPong',
}
